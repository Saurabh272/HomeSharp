import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import config from '../../app/config';
import { ProjectListingRepository } from '../repositories/project-listing.repository';
import { ProjectIdentifier } from '../interfaces/project-identifier.interface';
import { ProjectDetailInterface } from '../interfaces/project-detail.interface';
import { ProjectIndexDetail } from '../types/project-index-detail.type';
import { ProjectForIndexingInterface } from '../interfaces/project-for-indexing.interface';
import { ReindexingRepository } from '../repositories/reindexing.repository';
import { IndexingConfig } from '../config/reindexing.config';
import { TourRepository } from '../repositories/tour.repository';
import { WingEntity } from '../entities/wing.entity';
import { FieldChoiceInterface } from '../interfaces/field-choice.interface';
import { DeveloperIndexDetailType } from '../types/developer-index-detail.type';
import { MicroMarketIndexDetailType } from '../types/micro-market-index-detail.type';
import { ProjectConfig } from '../config/project.config';
import { WhatsappService } from '../../app/services/whatsapp.service';

@Injectable()
export class ProjectDetailService {
  private readonly logger = new Logger(ProjectDetailService.name);

  constructor(
    private readonly projectListingRepository: ProjectListingRepository,
    private readonly reindexingRepository: ReindexingRepository,
    private readonly tourRepository: TourRepository,
    private readonly whatsappService: WhatsappService,
    private readonly wingEntity: WingEntity
  ) {}

  async getProjectDetail(slug: string | string[]) {
    const projectDetailsPromise: Promise<ProjectDetailInterface[]> = this.projectListingRepository
      .getProjectDetails(slug);
    const wingsConfigurationsPromise = this.projectListingRepository.getWingsConfigurations(slug);
    const featuresPromise = this.projectListingRepository.getFeatures(slug);
    const projectStatusesPromise = this.tourRepository.getFieldChoices(
      this.wingEntity.projectStatus,
      this.wingEntity.tableName
    );

    const [
      projectDetails,
      wingsConfigurations,
      features,
      projectStatuses
    ] = await Promise.all([projectDetailsPromise, wingsConfigurationsPromise, featuresPromise, projectStatusesPromise]);

    const whatsAppMessage = await this.whatsappService.whatsappTemplates({
      type: ProjectConfig.whatsappType.projectDetails,
      project_name: projectDetails?.[0]?.projectName,
      micro_market: projectDetails?.[0]?.locality
    });

    return [
      projectDetails,
      wingsConfigurations,
      features,
      projectStatuses,
      whatsAppMessage
    ];
  }

  async getProjectForIndexing(project: ProjectIdentifier): Promise<
  [ProjectForIndexingInterface[], FieldChoiceInterface[]] | { message: string; }> {
    if (!Object.keys(project).length) {
      return {
        message: 'Project details not provided'
      };
    }
    const projectForIndexing = this.projectListingRepository.getProjectForIndexing(project);
    const projectStatuses = this.tourRepository.getFieldChoices(
      this.wingEntity.projectStatus,
      this.wingEntity.tableName
    );

    return Promise.all([projectForIndexing, projectStatuses]);
  }

  async sendProjectToIndexing(projects: Partial<ProjectIndexDetail>[]) {
    let result = null;
    try {
      result = await axios.post(config.serviceUrl.indexing, projects, config.axiosConfig);
    } catch (e) {
      this.logger.error(e);

      await this.reindexingRepository.create({
        indexingId: projects[0]?.projectId,
        indexingType: IndexingConfig.project,
        errorMessage: e?.message
      });

      return {
        message: `Project indexing failed: ${e?.message}`,
        success: false
      };
    }

    return {
      message: 'Project indexed successfully',
      success: true,
      result: result?.data ? JSON.stringify(result?.data) : null
    };
  }

  async getDeveloperForIndexing(developerId: string) {
    if (!developerId) {
      return {
        message: 'Developer details not provided'
      };
    }
    return this.projectListingRepository.getDeveloperForIndexing(developerId);
  }

  async sendDeveloperToIndexing(developer: Partial<DeveloperIndexDetailType>) {
    let result = null;
    try {
      result = await axios.post(config.serviceUrl.developerIndexing, developer, config.axiosConfig);
    } catch (e) {
      await this.reindexingRepository.create({
        indexingId: developer?.developerId,
        indexingType: IndexingConfig.developer,
        errorMessage: e?.message
      });

      return {
        message: `Developer indexing failed: ${e?.message}`,
        success: false
      };
    }

    return {
      message: 'Developer indexed successfully',
      success: true,
      result: result?.data ? JSON.stringify(result?.data) : null
    };
  }

  async getMicroMarketForIndexing(microMarketId: string) {
    if (!microMarketId) {
      return {
        message: 'Micro Market details not provided'
      };
    }

    return this.projectListingRepository.getMicroMarketForIndexing(microMarketId);
  }

  async sendMicroMarketToIndexing(microMarket: Partial<MicroMarketIndexDetailType>) {
    let result = null;
    try {
      result = await axios.post(config.serviceUrl.microMarketIndexing, microMarket, config.axiosConfig);
    } catch (e) {
      await this.reindexingRepository.create({
        indexingId: microMarket?.microMarketId,
        indexingType: IndexingConfig.microMarket,
        errorMessage: e?.message
      });

      return {
        message: `Micro Market indexing failed: ${e?.message}`,
        success: false
      };
    }

    return {
      message: 'Micro Market indexed successfully',
      success: true,
      result: result?.data ? JSON.stringify(result?.data) : null
    };
  }

  async getAllProjectIds() {
    const projectIds = await this.projectListingRepository.getAllProjectIds();
    return projectIds.map((project) => project.projectId);
  }

  async getAllDeveloperIds() {
    const developerIds = await this.projectListingRepository.getAllDeveloperIds();
    return developerIds.map((developer) => developer.developerId);
  }

  async getAllMicroMarketIds() {
    const microMarketIds = await this.projectListingRepository.getAllMicroMarketIds();
    return microMarketIds.map((microMarket) => microMarket.microMarketId);
  }

  async deleteAllIndices() {
    try {
      await Promise.all([
        this.deleteAllByIndexingType(IndexingConfig.project),
        this.deleteAllByIndexingType(IndexingConfig.developer),
        this.deleteAllByIndexingType(IndexingConfig.microMarket)
      ]);
    } catch (e) {
      return {
        message: `Delete failed: ${e?.message}`,
        success: false
      };
    }

    return {
      message: 'Delete successful',
      success: true
    };
  }

  async deleteAllByIndexingType(indexingType: string) {
    try {
      const response = await axios.post(
        config.serviceUrl.deleteIndex,
        {
          data: {
            indexingType
          }
        },
        config.axiosConfig
      );

      return response?.data;
    } catch (error) {
      return {
        message: `Delete failed: ${error?.message}`,
        success: false
      };
    }
  }

  async recreateAllCollections() {
    try {
      const response = await axios.post(
        config.serviceUrl.recreateCollections,
        {},
        config.axiosConfig
      );

      return response?.data;
    } catch (error) {
      return {
        message: `Delete failed: ${error?.message}`,
        success: false
      };
    }
  }
}
