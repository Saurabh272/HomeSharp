import {
  Body,
  Controller,
  Headers,
  Logger,
  Post
} from '@nestjs/common';
import { ProjectListingService } from '../../project/services/project-listing.service';
import { VectorGeneratorService } from '../services/vector-generator.service';
import { SimilarProjectDto } from '../dto/similar-project.dto';
import { DirectusAuth } from '../../app/utils/directus.util';

@Controller()
export class VectorGeneratorController {
  private readonly logger = new Logger(VectorGeneratorController.name);

  private similarProjectIds: any[] = [];

  constructor(
    private readonly projectListingService: ProjectListingService,
    private readonly vectorGeneratorService: VectorGeneratorService,
    private readonly directusAuth: DirectusAuth
  ) {}

  @Post('/generate-vector')
  async generateVector(@Headers('authorization') authHeader: string) {
    await this.directusAuth.checkAdminFunctionsPermission(authHeader);
    this.logger.log('Generating vector...');
    return this.vectorGeneratorService.generateVector();
  }

  @Post('/get-similar-projects')
  async getSimilarProjects(@Body() request: SimilarProjectDto) {
    this.similarProjectIds = await this.vectorGeneratorService.getSimilarProjects(request);

    if (!this.similarProjectIds?.length) {
      return {};
    }

    const projectList = await this.projectListingService
      .getProjectsFromSearchServiceByIds({ projectIds: this.similarProjectIds });

    return { projects: projectList.projects };
  }
}
