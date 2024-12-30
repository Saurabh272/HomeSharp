import {
  Body,
  Controller,
  Get,
  Post
} from '@nestjs/common';
import { ProjectListingService } from '../services/project-listing.service';
import { NearbyLocalityTransformer } from '../transformers/nearby-locality.transformer';
import { RequestSlugDto } from '../dto/request-slug.dto';
import { SlugDto } from '../dto/slug.dto';
import { SlugTransformer } from '../transformers/slug.transformer';
import { Slugs } from '../types/slug.type';
import { CollectionDetailTransformer } from '../transformers/collection-detail.transformer';

@Controller()
export class ProjectListingController {
  constructor(
    private readonly collectionDetailTransformer: CollectionDetailTransformer,
    private projectListingService: ProjectListingService,
    private readonly nearbyLocalityTransformer: NearbyLocalityTransformer,
    private readonly slugTransformer: SlugTransformer
  ) {}

  @Get('/nearby-localities')
  async getNearbyLocalities() {
    const localities = await this.projectListingService.getNearbyLocalities();
    return this.nearbyLocalityTransformer.process(
      localities
    );
  }

  @Post('/slugs')
  async getSlugs(@Body() request: RequestSlugDto) {
    const slugs = await this.projectListingService.getSlugs(request.type);
    const transformedSlugs: Slugs = this.slugTransformer.process(slugs);
    return transformedSlugs;
  }

  @Post('/collection-details')
  async getCollectionDetails(@Body() request: SlugDto) {
    const collectionDetails = await this.projectListingService.getCollectionDetails(request.slug);
    return this.collectionDetailTransformer.process(collectionDetails);
  }
}
