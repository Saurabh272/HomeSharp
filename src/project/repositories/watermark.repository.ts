import { Injectable } from '@nestjs/common';
import {
  and, eq, lt, sql
} from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import {
  DirectusClient,
  RestClient,
  StaticTokenClient,
  createItem,
  updateFile,
  updateItem,
  uploadFiles
} from '@directus/sdk';
import { Db } from '../../app/utils/db.util';
import { WatermarkEntity } from '../entities/watermark.entity';
import { IndexingConfig } from '../config/reindexing.config';
import { DirectusFilesEntity } from '../../app/entities/directus-file.entity';
import { ProjectFilesFloorPlanEntity } from '../entities/project-file-floor-plan.entity';
import { ProjectEntity } from '../entities/project.entity';
import { ProjectFilesImagesEntity } from '../entities/project-file-image.entity';
import { DeveloperEntity } from '../../developer/entities/developer.entity';
import { WatermarkOriginalImageEntity } from '../entities/watermark-original-images.entity';
import { DirectusFolderEntity } from '../../app/entities/directus-folder.entity';
import { FailedWatermarkInterface } from '../interfaces/failed-watermark.interface';
import { DeveloperOriginalImageInterface } from '../interfaces/developer-original-image.interface';
import { WingConfigurationEntity } from '../entities/wing-configuration.entity';
import { WingEntity } from '../entities/wing.entity';
import { ConfigurationEntity } from '../entities/configuration.entity';

@Injectable()
export class WatermarkRepository {
  private readonly watermarkString = '%watermark%';

  private client: DirectusClient<any> & StaticTokenClient<any> & RestClient<any>;

  public readonly entities: {
    developers: any;
    directusFiles: any;
    projects: any;
    projectFilesFloorPlan: any;
    projectFilesImages: any;
    watermarks: any;
    directusFolders: any;
    wings: any,
    wingsConfigurations: any,
    configurations: any
  };

  private readonly projectFloorPlanFilesDirectus: any;

  private readonly projectImageFilesDirectus: any;

  private readonly projectPictureDirectusFiles: any;

  private readonly projectPlanDirectusFiles: any;

  private readonly watermarkOriginalDirectusFiles: any;

  private readonly configurationFloorPlanDirectusFiles: any;

  constructor(
    private readonly db: Db,
    private readonly developerEntity: DeveloperEntity,
    private readonly directusFilesEntity: DirectusFilesEntity,
    private readonly projectEntity: ProjectEntity,
    private readonly projectFilesFloorPlanEntity: ProjectFilesFloorPlanEntity,
    private readonly projectFilesImagesEntity: ProjectFilesImagesEntity,
    private readonly watermarkEntity: WatermarkEntity,
    private readonly watermarkOriginalImageEntity: WatermarkOriginalImageEntity,
    private readonly directusFolderEntity: DirectusFolderEntity,
    private readonly wingConfigurationEntity: WingConfigurationEntity,
    private readonly wingEntity: WingEntity,
    private readonly configurationEntity: ConfigurationEntity
  ) {
    this.client = db.getDirectusClient();
    this.entities = {
      developers: this.developerEntity.developers,
      directusFiles: this.directusFilesEntity.directusFiles,
      projects: this.projectEntity.projects,
      projectFilesFloorPlan: this.projectFilesFloorPlanEntity.projectFiles,
      projectFilesImages: this.projectFilesImagesEntity.projectFiles,
      watermarks: this.watermarkEntity.watermarks,
      directusFolders: this.directusFolderEntity.directusFolders,
      wings: this.wingEntity.wings,
      wingsConfigurations: this.wingConfigurationEntity.wingsConfigurations,
      configurations: this.configurationEntity.configurations
    };
    this.projectFloorPlanFilesDirectus = alias(this.entities.directusFiles, 'projectFloorPlanFilesDirectus');
    this.projectImageFilesDirectus = alias(this.entities.directusFiles, 'projectImageFilesDirectus');
    this.projectPictureDirectusFiles = alias(this.entities.directusFiles, 'projectPictureDirectusFiles');
    this.projectPlanDirectusFiles = alias(this.entities.directusFiles, 'projectPlanDirectusFiles');
    this.watermarkOriginalDirectusFiles = alias(this.entities.directusFiles, 'watermarkOriginalDirectusFiles');
    this.configurationFloorPlanDirectusFiles = alias(
      this.entities.directusFiles,
      'configurationFloorPlanDirectusFiles'
    );
  }

  async upload(id: string, image: any) {
    return this.client.request(updateFile(id, image));
  }

  async uploadImage(form: FormData) {
    return this.client.request(
      uploadFiles(form)
    );
  }

  async saveOriginalImage(imageId: string) {
    return this.client.request(createItem(this.watermarkOriginalImageEntity.tableName, {
      image: imageId
    }));
  }

  async getFolderIdFromRoot() {
    return this.db.connection
      .select({
        id: this.entities.directusFolders.id
      })
      .from(this.entities.directusFolders)
      .where(eq(this.entities.directusFolders.name, this.watermarkOriginalImageEntity.folderName));
  }

  async getProjectIds() {
    return this.db.connection
      .select({
        projectIds: this.entities.projects.id
      })
      .from(this.entities.projects);
  }

  async getDeveloperIds() {
    return this.db.connection
      .select({
        developerIds: this.entities.developers.id
      })
      .from(this.entities.developers);
  }

  async updateFileName(id: string, originalName: string) {
    return this.client.request(updateFile(
      id,
      { filename_download: originalName }
    ));
  }

  async getImageName(id: string) {
    return this.db.connection
      .select({
        fileName: this.entities.directusFiles.filenameDownload
      })
      .from(this.entities.directusFiles)
      .where(
        eq(this.entities.directusFiles.id, id)
      );
  }

  dataMapper(data: FailedWatermarkInterface) {
    const dataForUpdate: Partial<WatermarkEntity> = {};
    if (data?.retryCount) {
      dataForUpdate[this.watermarkEntity.retryCount] = data.retryCount;
    }
    if (data?.status) {
      dataForUpdate[this.watermarkEntity.status] = data?.status;
    }
    if (data?.errorMessage) {
      dataForUpdate[this.watermarkEntity.errorMessage] = data?.errorMessage?.message;
      dataForUpdate[this.watermarkEntity.additionalContext] = data?.errorMessage?.stack;
    }
    return dataForUpdate;
  }

  async updateById(id: string, updateParams: FailedWatermarkInterface) {
    const dataForUpdate = this.dataMapper(updateParams);
    return this.client.request(updateItem(
      this.watermarkEntity.tableName,
      id,
      dataForUpdate
    ));
  }

  async getProjectImages(offset: number, batchSize: number) {
    return this.db.connection
      .select({
        projectPicture: sql<string>`CASE 
            WHEN ${this.projectPictureDirectusFiles.filenameDownload} NOT LIKE ${this.watermarkString} 
            THEN ${this.projectPictureDirectusFiles.id}::text 
            ELSE ''
            END`,
        projectPlan: sql<string>`CASE
            WHEN ${this.projectPlanDirectusFiles.filenameDownload} NOT LIKE ${this.watermarkString} 
            THEN ${this.projectPlanDirectusFiles.id}::text 
            ELSE ''
            END`,
        images: sql`string_agg(DISTINCT CASE
            WHEN ${this.projectImageFilesDirectus.filenameDownload} NOT LIKE ${this.watermarkString} 
            THEN ${this.projectImageFilesDirectus.id}::text 
            ELSE ''
            END, ',')`,
        floorPlan: sql`string_agg(DISTINCT CASE
            WHEN ${this.projectFloorPlanFilesDirectus.filenameDownload} NOT LIKE ${this.watermarkString} 
            THEN ${this.projectFloorPlanFilesDirectus.id}::text 
            ELSE ''
            END, ',')`
      })
      .from(this.entities.projects)
      .leftJoin(
        this.projectPictureDirectusFiles,
        eq(this.projectPictureDirectusFiles.id, this.entities.projects.propertyPicture)
      )
      .leftJoin(
        this.projectPlanDirectusFiles,
        eq(this.projectPlanDirectusFiles.id, this.entities.projects.projectPlan)
      )
      .leftJoin(
        this.entities.projectFilesFloorPlan,
        eq(this.entities.projects.id, this.entities.projectFilesFloorPlan.projectId)
      )
      .leftJoin(
        this.projectFloorPlanFilesDirectus,
        eq(this.projectFloorPlanFilesDirectus.id, this.entities.projectFilesFloorPlan.directusFileId)
      )
      .leftJoin(
        this.entities.projectFilesImages,
        eq(this.entities.projects.id, this.entities.projectFilesImages.projectId)
      )
      .leftJoin(
        this.projectImageFilesDirectus,
        eq(this.projectImageFilesDirectus.id, this.entities.projectFilesImages.directusFileId)
      )
      .groupBy(
        this.projectPictureDirectusFiles.id,
        this.projectPlanDirectusFiles.id
      )
      .offset(offset)
      .limit(batchSize);
  }

  async getDeveloperImages(offset: number, batchSize: number) {
    return this.db.connection
      .select({
        heroImage: sql`CASE
            WHEN ${this.entities.directusFiles.filenameDownload} NOT LIKE ${this.watermarkString}
            THEN ${this.entities.directusFiles.id}::text
            ELSE ''
            END`
      })
      .from(this.entities.developers)
      .leftJoin(
        this.entities.directusFiles,
        eq(this.entities.developers.heroImage, this.entities.directusFiles.id)
      )
      .offset(offset)
      .limit(batchSize);
  }

  async getProjectOriginalImages(id: string) {
    return this.db.connection
      .select({
        projectPicture: this.projectPictureDirectusFiles.id,
        projectPlan: this.projectPlanDirectusFiles.id,
        images: sql`array_agg(DISTINCT ${this.projectImageFilesDirectus.id})`,
        floorPlans: sql`array_agg(DISTINCT ${this.projectFloorPlanFilesDirectus.id})`,
        wingConfigurationFloorPlan: this.configurationFloorPlanDirectusFiles.id
      })
      .from(this.entities.projects)
      .leftJoin(
        this.projectPictureDirectusFiles,
        eq(this.projectPictureDirectusFiles.id, this.entities.projects.propertyPicture)
      )
      .leftJoin(
        this.projectPlanDirectusFiles,
        eq(this.projectPlanDirectusFiles.id, this.entities.projects.projectPlan)
      )
      .leftJoin(
        this.entities.projectFilesFloorPlan,
        eq(this.entities.projects.id, this.entities.projectFilesFloorPlan.projectId)
      )
      .leftJoin(
        this.projectFloorPlanFilesDirectus,
        eq(this.projectFloorPlanFilesDirectus.id, this.entities.projectFilesFloorPlan.directusFileId)
      )
      .leftJoin(
        this.entities.projectFilesImages,
        eq(this.entities.projects.id, this.entities.projectFilesImages.projectId)
      )
      .leftJoin(
        this.projectImageFilesDirectus,
        eq(this.projectImageFilesDirectus.id, this.entities.projectFilesImages.directusFileId)
      )
      .innerJoin(
        this.entities.wings,
        eq(this.entities.wings.projects, this.entities.projects.id)
      )
      .innerJoin(
        this.entities.wingsConfigurations,
        eq(this.entities.wingsConfigurations.wings, this.entities.wings.id)
      )
      .innerJoin(
        this.entities.configurations,
        eq(this.entities.configurations.id, this.entities.wingsConfigurations.configurations)
      )
      .leftJoin(
        this.configurationFloorPlanDirectusFiles,
        eq(this.configurationFloorPlanDirectusFiles.id, this.entities.configurations.floorPlan)
      )
      .groupBy(
        this.projectPictureDirectusFiles.id,
        this.projectPlanDirectusFiles.id,
        this.entities.projects.id,
        this.entities.wings.id,
        this.entities.configurations.id,
        this.configurationFloorPlanDirectusFiles.id
      )
      .where(eq(this.entities.projects.id, id));
  }

  async getOriginalImageById(fileName: string) {
    return this.db.connection.select({
      fileName: this.watermarkOriginalDirectusFiles.filenameDownload,
      id: this.watermarkOriginalDirectusFiles.id
    })
      .from(this.watermarkOriginalImageEntity.watermark)
      .innerJoin(
        this.watermarkOriginalDirectusFiles,
        eq(this.watermarkOriginalImageEntity.watermark.image, this.watermarkOriginalDirectusFiles.id)
      )
      .where(
        eq(this.watermarkOriginalDirectusFiles.filenameDownload, fileName)
      );
  }

  async getDeveloperOriginalImages(id: string): Promise<DeveloperOriginalImageInterface[]> {
    return this.db.connection
      .select({
        heroImage: this.entities.developers.heroImage,
        projectId: sql<string>`string_agg(DISTINCT ${this.entities.projects.id}::text, ',')`
      })
      .from(this.entities.developers)
      .innerJoin(
        this.entities.projects,
        eq(this.entities.developers.id, this.entities.projects.developers)
      )
      .where(eq(this.entities.developers.id, id))
      .groupBy(this.entities.developers.id);
  }

  async saveErrorLogs({ imageId, error }) {
    return this.client.request(createItem(this.watermarkEntity.tableName, {
      [this.watermarkEntity.additionalContext]: error?.stack,
      [this.watermarkEntity.errorMessage]: error?.message,
      [this.watermarkEntity.watermarkId]: imageId
    }));
  }

  async getAllFailedWatermarkIds() {
    return this.db.connection
      .select({
        id: this.entities.watermarks.id,
        watermarkId: this.entities.watermarks.watermarkId,
        retryCount: this.entities.watermarks.retryCount
      })
      .from(this.entities.watermarks)
      .where(and(
        lt(this.entities.watermarks.retryCount, IndexingConfig.maxRetryCount),
        eq(this.entities.watermarks.status, IndexingConfig.error)
      ));
  }
}
