import {
  Body,
  Controller,
  Post
} from '@nestjs/common';
import { SlugDto } from '../../project/dto/slug.dto';
import { DeveloperDetailService } from '../service/developer-detail.service';
import { ProjectListingService } from '../../project/services/project-listing.service';
import { DeveloperDetailTransformer } from '../transformers/developer-detail.transformer';

@Controller('developer-details')
export class DeveloperDetailController {
  constructor(
    private readonly developerDetailService: DeveloperDetailService,
    private readonly projectListingService: ProjectListingService,
    private readonly developerDetailTransformer: DeveloperDetailTransformer
  ) {}

  @Post()
  async getDeveloperDetail(@Body() request: SlugDto) {
    const [developerDetails, projectList] = await Promise.all([
      this.developerDetailService.getDeveloperDetail(request.slug),
      this.projectListingService.getProjectsFromSearchServiceByDeveloperSlug(request.slug)
    ]);

    if (developerDetails && developerDetails.length && projectList?.projects?.length) {
      return this.developerDetailTransformer.process(developerDetails[0], projectList.projects);
    }

    return {};
  }
}
