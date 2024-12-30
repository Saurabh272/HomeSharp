import {
  Injectable, InternalServerErrorException, Logger
} from '@nestjs/common';
import Jimp from 'jimp';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import { PromisePool } from '@supercharge/promise-pool';
import * as sharp from 'sharp';
import { WatermarkRepository } from '../repositories/watermark.repository';
import config from '../../app/config';
import { ProjectEntity } from '../entities/project.entity';
import { WatermarkResponse } from '../types/watermark.type';
import { IndexingConfig } from '../config/reindexing.config';
import { WatermarkImageData } from '../interfaces/watermark.interface';
import { ProjectConfig } from '../config/project.config';
import { DeveloperOriginalImageInterface } from '../interfaces/developer-original-image.interface';
import { watermarkImageFile } from '../utils/watermark.utils';
import uploadConfig from '../../app/config/upload.config';

@Injectable()
export class WatermarkService {
  private readonly logger = new Logger(WatermarkService.name);

  public readonly UPLOAD_PATH = path.join(__dirname, '..', 'uploads');

  private readonly uuidPattern = /[a-fA-F0-9]+-[a-fA-F0-9]+-[a-fA-F0-9]+-[a-fA-F0-9]+-[a-fA-F0-9]+/;

  private readonly pool = new PromisePool();

  constructor(
    private readonly watermarkRepository: WatermarkRepository,
    public readonly projectEntity: ProjectEntity
  ) {}

  async applyWatermarkOnImage(imageUrl: string): Promise<Jimp> {
    const jpegBuffer = await this.convertImageToJpeg(imageUrl);
    const image = await Jimp.read(jpegBuffer);

    const watermarkImage = await Jimp.read(watermarkImageFile);

    watermarkImage
      .resize(image.bitmap.width / 2, Jimp.AUTO)
      .rotate(30)
      .opacity(0.3);

    const X = (image.bitmap.width - watermarkImage.bitmap.width) / 2;
    const Y = (image.bitmap.height - watermarkImage.bitmap.height) / 2;

    return image.composite(watermarkImage, X, Y, {
      mode: Jimp.BLEND_OVERLAY,
      opacitySource: 0.6,
      opacityDest: 0.5
    });
  }

  async convertImageToJpeg(webpUrl: string): Promise<Buffer> {
    const response = await axios.get(webpUrl, { responseType: 'arraybuffer' });
    const imageBuffer = Buffer.from(response.data);
    let jpegQuality = 100;
    let jpegBuffer = await sharp(imageBuffer).jpeg({ quality: 100 }).toBuffer();

    this.logger.log('Converted JPEG image size (bytes):', jpegBuffer?.byteLength);

    while (jpegBuffer.byteLength > ProjectConfig.maxFileSizeBytes && 100 > 5) {
      jpegQuality -= 5;
      // eslint-disable-next-line no-await-in-loop
      jpegBuffer = await sharp(imageBuffer).jpeg({ quality: jpegQuality }).toBuffer();
    }

    if (jpegBuffer.byteLength > ProjectConfig.maxFileSizeBytes) {
      throw new Error('Image size exceeds the maximum limit of 10MB even after reducing quality.');
    }

    this.logger.log('Final Converted JPEG image size (bytes):', jpegBuffer?.byteLength);

    return jpegBuffer;
  }

  async handleImageProcessing(id: string, disableSaveOriginalImage?: boolean): Promise<string> {
    try {
      const imageUrl = `${config.DIRECTUS_URL}/assets/${id}`;
      const watermarkImagePath = path.join(this.UPLOAD_PATH, `${id}_temp_watermark.jpg`);
      if (!disableSaveOriginalImage) {
        await this.saveOriginalImage(imageUrl, id);
      }
      const watermarkImage = await this.applyWatermarkOnImage(imageUrl);
      await watermarkImage.writeAsync(watermarkImagePath);

      return watermarkImagePath;
    } catch (error) {
      await this.watermarkRepository.saveErrorLogs({
        imageId: id,
        error
      });
    }
  }

  async urlResponse(url: string) {
    const response = await axios.get(url, {
      responseType: 'arraybuffer'
    });

    const contentTypeHeader = response?.headers['content-type'];
    let mimeType;
    if (contentTypeHeader) {
      mimeType = contentTypeHeader?.split(';')[0];
    }

    return {
      data: response?.data,
      mimeType
    };
  }

  async saveOriginalImage(imageUrl: string, id: string) {
    try {
      const getFolderId = await this.watermarkRepository.getFolderIdFromRoot();
      const { data, mimeType } = await this.urlResponse(imageUrl);
      const originalname = `${id}.jpg`;
      const form = new FormData();
      const stream = new Blob([data], { type: mimeType });
      form.append('folder', getFolderId[0]?.id);
      form.append('file', stream, originalname);
      const result = await this.watermarkRepository.uploadImage(form);
      await this.watermarkRepository.saveOriginalImage(result?.id);
    } catch (error) {
      this.logger.error(error?.message);
    }
  }

  async uploadWatermarkedImage(id: string, watermarkImagePath: string) {
    const form = new FormData();
    const fileData = fs.readFileSync(watermarkImagePath);
    const file = new Blob([fileData], { type: uploadConfig.imageJpgMimeType });
    form.append('file', file, id);

    const response = await this.watermarkRepository.upload(id, form);
    await this.updateFileName(id);

    if (fs.existsSync(watermarkImagePath)) {
      fs.unlinkSync(watermarkImagePath);
    }

    return response;
  }

  private async updateFileName(id: string): Promise<void> {
    const imageName = await this.watermarkRepository.getImageName(id);
    const fileName = imageName[0]?.fileName?.replace(/\.[^.]+$/, '');
    if (!fileName?.includes('watermark')) {
      const originalname = `${fileName}_watermark`;
      await this.watermarkRepository.updateFileName(id, originalname);
    }
  }

  async processWatermark(id: string, disableSaveOriginalImage?: boolean): Promise<WatermarkResponse | void> {
    if (!id) {
      return;
    }
    const watermarkImagePath = await this.handleImageProcessing(id, disableSaveOriginalImage);
    await this.uploadWatermarkedImage(id, watermarkImagePath);
    this.logger.log('Watermarked image created successfully');

    return {
      message: 'Watermarked image created successfully'
    };
  }

  updateStatus(id: string) {
    return this.watermarkRepository.updateById(id, {
      status: IndexingConfig.completed
    });
  }

  private flattenAndFilterValues(items: any[]): string[] {
    return [...new Set(
      items
        .flatMap((item) => Object.values(item)
          .filter((value) => value !== undefined && value !== '')
          .flatMap((value) => String(value).split(','))
          .map((value) => value.trim()))
    )];
  }

  async pendingWatermarkIds(): Promise<string[]> {
    const [projectImages, developerImages] = await Promise.all([
      this.getProjectImages(),
      this.getDeveloperImages()
    ]);

    const projectImagesValues = this.flattenAndFilterValues(projectImages);
    const developerImagesValues = developerImages
      .map((item) => String(item.heroImage).trim())
      .filter((item) => item !== '');

    return [...projectImagesValues, ...developerImagesValues];
  }

  /**
 * Fetches images using a provided fetch function in batches until no more images are returned.
 * @param fetchFunction A function that fetches images. It takes two parameters: offset and batchSize,
 * and returns a promise that resolves to an array of images.
 * @param batchSize The number of images to fetch in each batch.
 * @returns A promise that resolves to an array containing all the fetched images.
 */
  async fetchImages(
    fetchFunction: (offset: number, batchSize: number) => Promise<any[]>,
    batchSize: number
  ): Promise<any[]> {
    let offset = 0;
    let images: any[] = [];

    // Fetch the first batch of images asynchronously
    let batch = await fetchFunction(offset, batchSize);

    // Loop until no more images are returned
    while (batch.length > 0) {
      // Concatenate the current batch of images to the images array
      images = images.concat(batch);
      offset += batchSize;

      // Fetch the next batch of images asynchronously
      // eslint-disable-next-line no-await-in-loop
      batch = await fetchFunction(offset, batchSize);
    }

    return images;
  }

  async getDeveloperImages(): Promise<any[]> {
    return this.fetchImages(
      this.watermarkRepository.getDeveloperImages.bind(this.watermarkRepository),
      ProjectConfig.watermarkBatchSize
    );
  }

  async getProjectImages(): Promise<any[]> {
    return this.fetchImages(
      this.watermarkRepository.getProjectImages.bind(this.watermarkRepository),
      ProjectConfig.watermarkBatchSize
    );
  }

  extractUuidFromOriginalImage(data: string): string {
    const match = data.match(this.uuidPattern);
    return match ? match[0] : '';
  }

  async applyWatermarks(imageId: string, fileName: string) {
    if (!imageId) {
      return;
    }
    const watermarkImagePath = await this.handleImageProcessing(imageId, true);
    const id = this.extractUuidFromOriginalImage(fileName);
    await this.uploadWatermarkedImage(id, watermarkImagePath);
    this.logger.log('Watermarked image created successfully');
    return {
      message: 'Watermarked image created successfully'
    };
  }

  async applyWatermarkOnOriginalImage(data: WatermarkImageData): Promise<{ message: string }> {
    const imageId = data?.image?.id ? data?.image?.id : data.id;
    const fileName = data?.fileName ? data?.fileName : data?.image?.filename_download;
    try {
      return await this.applyWatermarks(imageId, fileName);
    } catch (error) {
      this.logger.error(error?.message);
      await this.watermarkRepository.saveErrorLogs({
        imageId,
        error
      });
    }
  }

  extractImageIdsFromResult(result: any): string[] {
    return result.reduce((acc: string[], item: any) => {
      if (item.projectPicture) acc.push(item.projectPicture);
      if (item.projectPlan) acc.push(item.projectPlan);
      if (item.wingConfigurationFloorPlan) acc.push(item.wingConfigurationFloorPlan);

      if (item.images) {
        const filteredImages = item.images.filter((image: string) => image !== null && image !== undefined);
        acc.push(...filteredImages);
      }

      if (item.floorPlans) {
        const filteredFloorPlans = item.floorPlans.filter((plan: string) => plan !== null && plan !== undefined);
        acc.push(...filteredFloorPlans);
      }

      return acc;
    }, []);
  }

  async processImageIds(imageIds: string[]) {
    return this.pool
      .for(imageIds)
      .withConcurrency(IndexingConfig.concurrencyLimit)
      .process(async (imageId) => {
        const response = await this.watermarkRepository.getOriginalImageById(`${imageId}.jpg`);
        if (response.length > 0) {
          return this.applyWatermarkOnOriginalImage(response[0]);
        }
        return this.processWatermark(imageId, false);
      });
  }

  async processWithProjectId(projectId: string) {
    const result = await this.watermarkRepository.getProjectOriginalImages(projectId);
    if (result.length <= 0) {
      return false;
    }
    const allIds = this.extractImageIdsFromResult(result);
    return this.processImageIds(allIds);
  }

  async processWithDeveloperId(developerId: string) {
    const result: DeveloperOriginalImageInterface[] = await this.watermarkRepository
      .getDeveloperOriginalImages(developerId);
    const response = await this.watermarkRepository.getOriginalImageById(`${result[0]?.heroImage}.jpg`);

    if (response.length) {
      await this.applyWatermarkOnOriginalImage(response[0]);
    } else {
      await this.processWatermark(result[0]?.heroImage, false);
    }

    const allProjectIds = result.map((originalImages) => originalImages.projectId.split(',')).flat() || [];
    if (allProjectIds.length <= 0) {
      return false;
    }
    return Promise.all(
      allProjectIds.map(async (projectId: string) => {
        const projects: any = await this.watermarkRepository.getProjectOriginalImages(projectId);
        const allIds = this.extractImageIdsFromResult(projects);
        await this.processImageIds(allIds);
      })
    );
  }

  async applyWatermarkOnProjects(projectIds: string[]) {
    return this.pool
      .for(projectIds)
      .withConcurrency(IndexingConfig.concurrencyLimit)
      .process(async (item) => this.processWithProjectId(item));
  }

  async applyWatermarkOnDevelopers(developerIds: string[]) {
    return this.pool
      .for(developerIds)
      .withConcurrency(IndexingConfig.concurrencyLimit)
      .process(async (item) => this.processWithDeveloperId(item));
  }

  async applyWatermarkOnImages(imageIds: string[]) {
    return this.pool
      .for(imageIds)
      .withConcurrency(IndexingConfig.concurrencyLimit)
      .process(async (id) => {
        await this.processWatermark(id, false);
      });
  }

  async applyWatermark(request: { projectIds?: string[], developerIds?: string[], imageIds?: string[] }) {
    try {
      const hasProjectId = request?.projectIds?.length;
      const hasDeveloperId = request?.developerIds?.length;
      const hasImageId = request?.imageIds?.length;

      if (hasProjectId && hasDeveloperId && hasImageId) {
        return await Promise.all([
          this.applyWatermarkOnProjects(request?.projectIds),
          this.applyWatermarkOnDevelopers(request?.developerIds),
          this.applyWatermarkOnImages(request?.imageIds)
        ]);
      }

      if (hasProjectId) {
        await this.applyWatermarkOnProjects(request?.projectIds);
      }
      if (hasDeveloperId) {
        await this.applyWatermarkOnDevelopers(request?.developerIds);
      }

      if (hasImageId) {
        await this.applyWatermarkOnImages(request?.imageIds);
      }

      if (Object.keys(request).length === 0) {
        const [projectIds, developerIds] = await Promise.all([
          this.watermarkRepository.getProjectIds(),
          this.watermarkRepository.getDeveloperIds()
        ]);

        const projects = projectIds.map((obj) => obj.projectIds).filter(Boolean);
        const developers = developerIds.map((obj) => obj.developerIds).filter(Boolean);

        await Promise.all([
          this.applyWatermarkOnProjects(projects),
          this.applyWatermarkOnDevelopers(developers)
        ]);
      }
      return {
        message: 'Images watermarked successfully'
      };
    } catch (error) {
      throw new InternalServerErrorException('An error occurred while applying watermark.');
    }
  }

  async processFailedWatermarks(): Promise<WatermarkResponse> {
    const failedWatermarkData = await this.watermarkRepository.getAllFailedWatermarkIds();

    if (!failedWatermarkData?.length) {
      return {
        message: 'No failed watermarks found'
      };
    }

    await this.pool
      .for(failedWatermarkData)
      .withConcurrency(IndexingConfig.concurrencyLimit)
      .process(async ({ id, watermarkId, retryCount }) => {
        try {
          await this.processWatermark(watermarkId);
          await this.updateStatus(id);
        } catch (error) {
          this.logger.error(`Error processing watermark for id: ${id}`);
          await this.watermarkRepository.updateById(id, {
            retryCount: retryCount + 1,
            errorMessage: error
          });
        }
      });

    return {
      message: 'Watermark applied successfully'
    };
  }
}
