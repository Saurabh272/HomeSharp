import { Injectable, Logger } from '@nestjs/common';
import { DataImporterRepository } from '../repositories/data-importer.repository';
import { DataGenerator } from '../fakers/data-generator.faker';
import { ImageGenerator } from '../fakers/image-generator.faker';
import { SeoPropertiesConfig } from '../config/seo-properties.config';

@Injectable()
export class DataImporterUtil {
  private readonly logger = new Logger('DataImporterUtil');

  constructor(
    private readonly dataGenerator: DataGenerator,
    private readonly dataImporterRepository: DataImporterRepository,
    private readonly imageGenerator: ImageGenerator
  ) {}

  getSlug(name: string) {
    let slug = name.replace(/[^a-zA-Z\s]/g, '');
    slug = slug.trim().replace(/ /g, '-');
    slug = slug.replace(/-+/g, '-');

    return slug.toLowerCase();
  }

  // TODO: Move this method to apps or projects to avoid multiple imports
  async createSeoProperties(
    seoProperties: { slug: string, createNewOnConflict?: boolean },
    attempt: number | null = null
  ) {
    if (attempt === null) {
      attempt = 1;
    }

    try {
      return await this.dataImporterRepository.createSeoProperties({ slug: seoProperties.slug });
    } catch (error) {
      this.logger.error(error);
      this.logger.log(`Attempt: ${attempt}: Error creating SEO Properties for slug: ${seoProperties.slug}.`
        + ' Retrying...');

      const seoProperty: { id?: string } = await this.dataImporterRepository.getSeoProperties(seoProperties.slug);

      if (!seoProperties.createNewOnConflict && seoProperty && seoProperty.id) {
        return seoProperty.id;
      }

      if (attempt <= SeoPropertiesConfig.maxSlugGenerationAttempt) {
        try {
          const newSlug = `${seoProperties.slug}-${attempt}`;
          return await this.dataImporterRepository.createSeoProperties({ slug: newSlug });
        } catch (err) {
          return this.createSeoProperties(seoProperties, attempt + 1);
        }
      } else {
        throw new Error('Max attempts reached while creating SEO Properties');
      }
    }
  }

  async uploadImage(imageType: string, folderName: string) {
    try {
      const image = await this.imageGenerator.getRandomImageUrl(imageType);
      return await this.dataImporterRepository.uploadImage(image, folderName);
    } catch (error) {
      this.logger.log('Error uploading image so retrying...', error);

      const image = await this.imageGenerator.getRandomImageUrl(this.dataGenerator.getRandomProjectImageType());

      return await this.dataImporterRepository.uploadImage(image, folderName);
    }
  }

  async uploadImages(imageType: string, folderName: string, count: number) {
    const promises = Array.from({ length: count }, () => this.uploadImage(imageType, folderName));
    return Promise.all(promises);
  }

  async getRandomPdf() {
    const pdfs = await this.dataImporterRepository.getPdfs();
    const pdfIds = pdfs?.map((pdf: { id: string }) => pdf.id);

    return this.dataGenerator.getRandomId(pdfIds);
  }

  getRandomFeaturesCategory(featuresCategories: any) {
    const featuresCategoryIds = featuresCategories.map(
      (featuresCategory: { id: number }) => featuresCategory.id
    );

    return this.dataGenerator.getRandomId(featuresCategoryIds);
  }

  async insertReraStageIfNotExist() {
    const reraStages = await this.dataImporterRepository.getReraStages();
    if (!reraStages || !reraStages.length) {
      await this.dataImporterRepository.insertReraStages();
    }
  }

  async insertFeaturesCategoriesIfNotExist() {
    const featuresCategories = await this.dataImporterRepository.getFeaturesCategories();
    if (!featuresCategories || !featuresCategories.length) {
      await this.dataImporterRepository.insertFeaturesCategories();
    }
  }

  async checkAndAddMasterData() {
    return Promise.all([
      this.insertFeaturesCategoriesIfNotExist(),
      this.insertReraStageIfNotExist()
    ]);
  }
}
