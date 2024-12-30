import {
  Body,
  Controller,
  Post
} from '@nestjs/common';
import { ProjectDetailService } from '../services/project-detail.service';
import { ProjectDetailTransformer } from '../transformers/project-detail.transformer';
import { SlugDto } from '../dto/slug.dto';

@Controller()
export class ProjectDetailController {
  constructor(
    private readonly projectDetailService: ProjectDetailService,
    private readonly projectDetailTransformer: ProjectDetailTransformer
  ) { }

  @Post('/project-details')
  async getProjectDetail(@Body() request: SlugDto) {
    const [
      projectDetails,
      wingsConfigurations,
      features,
      projectStatuses,
      whatsAppMessage
    ] = await this.projectDetailService.getProjectDetail(request.slug);

    return this.projectDetailTransformer.process({
      projectDetail: projectDetails[0],
      wingsConfigurations,
      features,
      projectStatuses,
      whatsAppMessage
    });
  }
}
