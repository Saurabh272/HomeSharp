import {
  Body,
  Controller,
  Headers,
  Post
} from '@nestjs/common';
import { SlugDto } from '../../project/dto/slug.dto';
import { SeoPropertiesService } from '../services/seo-properties.service';
import { SeoPropertiesTransformer } from '../transformers/get-seo-properties.transformer';
import { DirectusAuth } from '../utils/directus.util';

@Controller('/seo-properties')
export class SeoPropertiesController {
  constructor(
    private readonly seoPropertiesService: SeoPropertiesService,
    private readonly seoPropertiesTransformer: SeoPropertiesTransformer,
    private readonly directusAuth: DirectusAuth
  ) {}

  @Post('')
  async seoProperties(@Body() request: SlugDto) {
    const seoProperties = await this.seoPropertiesService.getSeoProperties(request.slug);

    return this.seoPropertiesTransformer.process(seoProperties);
  }

  @Post('/add')
  async addSeoProperties(
    @Body() request: { payload: any, collection: string },
    @Headers('authorization') authHeader: string
  ) {
    await this.directusAuth.checkAdminFunctionsPermission(authHeader);

    return this.seoPropertiesService.addSeoProperties(request);
  }

  @Post('/validate')
  async validateSeoProperties(
    @Body() request: any,
    @Headers('authorization') authHeader: string
  ) {
    await this.directusAuth.checkAdminFunctionsPermission(authHeader);

    return this.seoPropertiesService.validateSeoProperties(request);
  }

  @Post('/lowercase-conversion')
  async convertUpperCaseToLowerCaseSeoProperties(@Headers('authorization') authHeader: string) {
    await this.directusAuth.checkAdminFunctionsPermission(authHeader);

    return this.seoPropertiesService.convertUpperCaseToLowerCase();
  }
}
