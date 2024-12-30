import { Injectable } from '@nestjs/common';
import { ProjectListingRepository } from '../repositories/project-listing.repository';

@Injectable()
export class ProjectCategoriesService {
  constructor(
    public readonly projectListingRepository: ProjectListingRepository
  ) {}

  async getProjectCategories() {
    return this.projectListingRepository.getCategories();
  }
}
