import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import config from '../../app/config';
import { DeveloperEntity } from '../../developer/entities/developer.entity';
import { IndexingConfig } from '../config/reindexing.config';
import { MicroMarketEntity } from '../entities/micro-market.entity';
import { ProjectEntity } from '../entities/project.entity';
import { ProjectListingRepository } from '../repositories/project-listing.repository';
import { ProjectStatusUpdateConfig } from '../config/project-status-update.config';
import { ProjectForValidationInterface } from '../interfaces/project-for-validation.interface';
import { ProjectValidationRuleInterface } from '../interfaces/project-validation-rule.interface';

@Injectable()
export class ProjectStatusUpdateService {
  private readonly logger = new Logger(ProjectStatusUpdateService.name);

  constructor(
    private readonly developerEntity: DeveloperEntity,
    private readonly microMarketEntity: MicroMarketEntity,
    private readonly projectEntity: ProjectEntity,
    private readonly projectListingRepository: ProjectListingRepository
  ) {}

  async validateStatusUpdate(modifiedFields: any, collection: any) {
    if (modifiedFields?.status === this.projectEntity.STATUSES.PUBLISHED
      && collection?.collection === this.projectEntity.tableName
      && Array.isArray(collection.keys)
      && collection.keys.length) {
      return this.checkIfProjectCanBePublished(collection.keys);
    }
    if (modifiedFields?.status === this.projectEntity.STATUSES.ARCHIVED
      && Array.isArray(collection.keys)
      && collection.keys.length) {
      switch (collection.collection) {
        case this.projectEntity.tableName:
          return this.archiveProjects(collection.keys);
        case this.developerEntity.tableName:
          return this.archiveDevelopers(collection.keys);
        case this.microMarketEntity.tableName:
          return this.archiveMicroMarkets(collection.keys);
        default:
          break;
      }
    }

    return {
      status: 'success',
      message: 'Status update is valid'
    };
  }

  async getValidationRules(collection: string): Promise<ProjectValidationRuleInterface> {
    const validationRules = await this.projectListingRepository.getValidationRules(collection);

    const fieldToLabelMap = new Map();
    validationRules.forEach((rule) => {
      fieldToLabelMap.set(rule.field, rule.label);
    });

    return {
      fieldsToBeValidated: validationRules.map((rule) => rule.field),
      fieldToLabelMap
    };
  }

  async checkIfProjectCanBePublished(projectIds: string[]) {
    const [
      projects,
      projectValidationRules,
      wingValidationRules
    ]: [
      ProjectForValidationInterface[],
      ProjectValidationRuleInterface,
      ProjectValidationRuleInterface
    ] = await Promise.all([
      this.projectListingRepository.getProjectDetailsForValidation(projectIds),
      this.getValidationRules(ProjectStatusUpdateConfig.projects),
      this.getValidationRules(ProjectStatusUpdateConfig.wingsConfigurations)
    ]);

    const response = {
      status: 'success',
      message: ''
    };

    if (!projects || !projects.length) {
      response.status = 'error';
      response.message = `Project with id ${projectIds} not found`;
    } else {
      const results = await this.getWingsConfigurationsForProjects(projects);

      results.forEach(({ project, wingConfigurations }) => {
        this.isProjectStatusValidForPublishing(project, response);

        if (response.status === 'error') {
          return false;
        }

        this.setWingAndConfigurationIds(project, wingConfigurations, wingValidationRules);

        this.validateProjectFields({
          project,
          projectValidationRules,
          wingValidationRules,
          response
        });
      });
    }
    return response;
  }

  async getWingsConfigurationsForProjects(projects: ProjectForValidationInterface[]) {
    const wingConfigurationsPromises = projects.map(async (project) => {
      const wingConfigurations = await this.projectListingRepository
        .getWingsConfigurationsForValidation(project.projectId);

      return {
        project,
        wingConfigurations
      };
    });

    return Promise.all(wingConfigurationsPromises);
  }

  private isProjectStatusValidForPublishing(
    project: ProjectForValidationInterface,
    response: { status: string, message: string }
  ) {
    if (project.projectStatus !== this.projectEntity.STATUSES.DRAFT) {
      response.status = 'error';
      response.message = `Project ${project.projectName} should be in Draft status to be Published.`;
    }
  }

  private setWingAndConfigurationIds(
    project: ProjectForValidationInterface,
    wingConfigurations: any[],
    wingValidationRules: ProjectValidationRuleInterface
  ) {
    const completeWingsConfigurations = wingConfigurations
      .filter((wingConfiguration) => wingValidationRules.fieldsToBeValidated
        .every((field) => wingConfiguration[field] !== null));

    if (completeWingsConfigurations.length) {
      project.wingIds = completeWingsConfigurations.map((wing) => wing.wingId);
      project.configurationIds = completeWingsConfigurations.map((wing) => wing.configurationId);
    } else {
      project.wingIds = null;
      project.configurationIds = null;
    }
  }

  private validateProjectFields(
    validationDetails: {
      project: ProjectForValidationInterface,
      projectValidationRules: ProjectValidationRuleInterface,
      wingValidationRules: ProjectValidationRuleInterface,
      response: { status: string, message: string }
    }
  ) {
    const {
      project,
      projectValidationRules,
      wingValidationRules,
      response
    } = validationDetails;

    const missingProjectFields: string[] = [];
    let isWingConfigurationMissing = false;

    projectValidationRules.fieldsToBeValidated.forEach((field) => {
      if (!project[field]) {
        response.status = 'error';
        missingProjectFields.push(projectValidationRules.fieldToLabelMap.get(field));
        if (ProjectStatusUpdateConfig.wingsConfigurationFields.includes(field)) {
          isWingConfigurationMissing = true;
        }
      }
    });

    if (response.status === 'error' && missingProjectFields.length) {
      response.message += `Project ${project.projectName} should have ${missingProjectFields.join(', ')}.`;
      if (isWingConfigurationMissing) {
        response.message += ` Wing and Configuration must include ${wingValidationRules.fieldsToBeValidated
          .map((wingField) => wingValidationRules.fieldToLabelMap.get(wingField))
          .join(', ')}.`;
      }
    }
    return response;
  }

  async archiveProjects(projectIds: string[]) {
    try {
      const projects: ProjectForValidationInterface[] = await this.projectListingRepository
        .getProjectDetailsForValidation(projectIds);

      await Promise.all([
        this.deleteProjectFromTypeSense(projects),
        this.deleteMicroMarketsBasedOnProjectsFromTypeSense(projects)
      ]);
    } catch (error) {
      this.logger.error(error);

      return {
        status: 'error',
        message: 'Error while archiving'
      };
    }

    return {
      status: 'success',
      message: 'Status update is valid'
    };
  }

  async deleteProjectFromTypeSense(projects: ProjectForValidationInterface[]) {
    const deletePromises = projects.map(async (project) => {
      this.logger.log(`Deleting project ${project.projectName} with id ${project.projectId} from TypeSense`);
      await axios.post(config.serviceUrl.deleteIndex, {
        id: project.projectId,
        indexingType: IndexingConfig.project
      }, config.axiosConfig);
    });

    await Promise.all(deletePromises);
  }

  async deleteMicroMarketsBasedOnProjectsFromTypeSense(projects: ProjectForValidationInterface[]) {
    const projectIdMap = this.getMicroMarketProjectMap(projects);

    const deleteMicroMarketsPromises = Array.from(projectIdMap, async ([microMarketId, projectIds]) => {
      const count = await this.projectListingRepository.getProjectsCountByMicroMarketId(microMarketId, projectIds);

      if (!count || !count.length) {
        this.logger.log(`Deleting Micro Market ${microMarketId} from TypeSense`);
        await axios.post(config.serviceUrl.deleteIndex, {
          id: microMarketId,
          indexingType: IndexingConfig.microMarket
        }, config.axiosConfig);
      }
    });

    await Promise.all(deleteMicroMarketsPromises);
  }

  getMicroMarketProjectMap(projects: ProjectForValidationInterface[]) {
    return projects.reduce((map, item) => {
      const { projectId, microMarketId } = item;
      if (!map.has(microMarketId)) {
        map.set(microMarketId, [projectId]);
      } else {
        map.get(microMarketId).push(projectId);
      }
      return map;
    }, new Map());
  }

  async archiveDevelopers(developerIds: string[]) {
    try {
      const isActiveProjects = await this.checkActiveProjectsByDeveloper(developerIds);

      if (isActiveProjects) {
        return isActiveProjects;
      }

      const deleteDevelopersPromises = developerIds.map(async (developerId) => {
        this.logger.log(`Deleting developer ${developerId} from TypeSense`);
        await axios.post(config.serviceUrl.deleteIndex, {
          id: developerId,
          indexingType: IndexingConfig.developer
        }, config.axiosConfig);
      });

      await Promise.all(deleteDevelopersPromises);
    } catch (error) {
      this.logger.error(error);

      return {
        status: 'error',
        message: 'Error while archiving'
      };
    }

    return {
      status: 'success',
      message: 'Status update is valid'
    };
  }

  async checkActiveProjectsByDeveloper(developerIds: string[]) {
    const projectCountByDeveloperId = await this.projectListingRepository
      .getActiveProjectsCountByDeveloperId(developerIds);

    const developerWithActiveProjects = projectCountByDeveloperId.find(
      (developer) => developer.projectsCount > 0
    );

    if (developerWithActiveProjects) {
      return {
        status: 'error',
        message: 'Selected Developer is associated with active projects that are in Draft or Published states.'
      };
    }

    return null;
  }

  async archiveMicroMarkets(microMarketIds: string[]) {
    try {
      const isActiveProjects = await this.checkActiveProjectsByMicroMarket(microMarketIds);

      if (isActiveProjects) {
        return isActiveProjects;
      }

      const deleteMicroMarketsPromises = microMarketIds.map(async (microMarketId) => {
        this.logger.log(`Deleting Micro Market ${microMarketId} from TypeSense`);
        await axios.post(config.serviceUrl.deleteIndex, {
          id: microMarketId,
          indexingType: IndexingConfig.microMarket
        }, config.axiosConfig);
      });

      await Promise.all(deleteMicroMarketsPromises);
    } catch (error) {
      this.logger.error(error);

      return {
        status: 'error',
        message: 'Error while archiving.'
      };
    }

    return {
      status: 'success',
      message: 'Status update is valid'
    };
  }

  async checkActiveProjectsByMicroMarket(microMarketIds: string[]) {
    const projectCountByMicroMarketId = await this.projectListingRepository
      .getActiveProjectsCountByMicroMarketId(microMarketIds);

    const microMarketWithActiveProjects = projectCountByMicroMarketId.find(
      (microMarket) => microMarket.projectsCount > 0
    );

    if (microMarketWithActiveProjects) {
      return {
        status: 'error',
        message: 'Selected Micro Market is associated with active projects that are in Draft or Published states.'
      };
    }

    return null;
  }
}
