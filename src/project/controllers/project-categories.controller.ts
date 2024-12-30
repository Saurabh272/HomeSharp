import { Controller, Get } from '@nestjs/common';
import { ProjectCategoriesService } from '../services/project-categories.service';
import { CategoryTransformer } from '../transformers/category.transformer';

@Controller()
export class ProjectCategoriesController {
  constructor(
    private readonly categoryTransformer: CategoryTransformer,
    private readonly projectCategoriesService: ProjectCategoriesService
  ) {}

  @Get('/categories')
  async getProjectCategories() {
    const categories = await this.projectCategoriesService.getProjectCategories();
    return this.categoryTransformer.process(categories);
  }
}
