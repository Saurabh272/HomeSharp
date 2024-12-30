import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { ProjectListingRepository } from '../repositories/project-listing.repository';
import config from '../../app/config';

@Injectable()
export class ProjectListingService {
  private readonly logger = new Logger(ProjectListingService.name);

  constructor(
    private readonly projectListingRepository: ProjectListingRepository
  ) {}

  async getNearbyLocalities() {
    return this.projectListingRepository.getMicroMarkets();
  }

  async getSlugs(type: string) {
    switch (type) {
      case 'projects':
        return this.projectListingRepository.getProjectSlug();
      case 'categories':
        return this.projectListingRepository.getCategorySlug();
      case 'developers':
        return this.projectListingRepository.getDeveloperSlug();
      case 'collections':
        return this.projectListingRepository.getCollectionSlug();
      default:
        return [];
    }
  }

  async getProjectsFromSearchServiceByIds(project: { projectIds: string[], page?: number, limit?: number }) {
    try {
      const response = await axios.post(
        config.serviceUrl.getProjects,
        {
          projectIds: project?.projectIds,
          page: project?.page,
          limit: project?.limit
        }
      );
      return response.data;
    } catch (error) {
      this.logger.error(error);
      return [];
    }
  }

  async getProjectsFromSearchServiceByDeveloperSlug(developerSlug: string) {
    try {
      const response = await axios.post(
        config.serviceUrl.search,
        {
          filters: { developerSlug }
        }
      );
      return response.data;
    } catch (error) {
      this.logger.error(error);
      return [];
    }
  }

  async getCollectionDetails(slug: string) {
    return this.projectListingRepository.getCollectionDetails(slug);
  }
}
