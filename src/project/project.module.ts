import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import config from '../app/config';
import { AppModule } from '../app/app.module';

import { CategoryEntity } from './entities/category.entity';
import { ConfigurationEntity } from './entities/configuration.entity';
import { ContactDetailEntity } from './entities/contact-detail.entity';
import { CustomerEntity } from '../customer/entities/customer.entity';
import { CustomSeoEntity } from './entities/custom-seo.entity';
import { DeveloperEntity } from '../developer/entities/developer.entity';
import { DirectusFieldEntity } from '../app/entities/directus-field.entity';
import { DirectusFilesEntity } from '../app/entities/directus-file.entity';
import { FeatureCategoryEntity } from './entities/feature-category.entity';
import { FeatureEntity } from './entities/feature.entity';
import { MicroMarketEntity } from './entities/micro-market.entity';
import { OtherContactDetailsEntity } from './entities/other-contact-details.entity';
import { ProjectEntity } from './entities/project.entity';
import { ProjectCategoryEntity } from './entities/project-category.entity';
import { ProjectFeatureEntity } from './entities/project-feature.entity';
import { ProjectFilesFloorPlanEntity } from './entities/project-file-floor-plan.entity';
import { ProjectFilesImagesEntity } from './entities/project-file-image.entity';
import { ProjectValidationRuleEntity } from './entities/project-validation-rule.entity';
import { RelationshipManagerEntity } from './entities/relationship-manager.entity';
import { ReraStageEntity } from './entities/rera-stage.entity';
import { SiteVisitEntity } from './entities/site-visit.entity';
import { SiteVisitStatusEntity } from './entities/site-visit-status.entity';
import { WingConfigurationEntity } from './entities/wing-configuration.entity';
import { WingEntity } from './entities/wing.entity';
import { WishlistProjectEntity } from '../wishlist/entities/wishlist-project.entity';

import { AllToursDetailTransformer } from './transformers/all-tours-detail.transformer';
import { CategoryTransformer } from './transformers/category.transformer';
import { CollectionDetailTransformer } from './transformers/collection-detail.transformer';
import { CreateTourTransformer } from './transformers/create-tour.transformer';
import { DeveloperIndexDetailTransformer } from './transformers/developer-index-detail.transformer';
import { MicroMarketIndexDetailTransformer } from './transformers/micro-market-index-detail.transformer';
import { NearbyLocalityTransformer } from './transformers/nearby-locality.transformer';
import { ProjectIndexDetailTransformer } from './transformers/project-index-detail.transformer';
import { ProjectDetailTransformer } from './transformers/project-detail.transformer';
import { RequestTourTransformer } from './transformers/request-tour.transformer';
import { SearchProjectTransformer } from './transformers/search-project.transformer';
import { SlugTransformer } from './transformers/slug.transformer';
import { TourDetailTransformer } from './transformers/tour-detail.transformer';

import { IndexingController } from './controllers/indexing.controller';

import { EmiCalculatorController } from './controllers/emi-calculator.controller';
import { EmiCalculatorService } from './services/emi-calculator.service';

import { ProjectCategoriesController } from './controllers/project-categories.controller';
import { ProjectCategoriesService } from './services/project-categories.service';

import { ProjectDetailController } from './controllers/project-detail.controller';
import { ProjectDetailService } from './services/project-detail.service';

import { ProjectListingController } from './controllers/project-listing.controller';
import { ProjectListingRepository } from './repositories/project-listing.repository';
import { ProjectListingService } from './services/project-listing.service';

import { ProjectStatusUpdateController } from './controllers/project-status-update.controller';
import { ProjectStatusUpdateService } from './services/project-status-update.service';

import { ReindexingEntity } from './entities/reindexing.entity';
import { ReindexingService } from './services/reindexing.service';
import { ReindexingRepository } from './repositories/reindexing.repository';

import { SavedSearchController } from './controllers/saved-search.controller';
import { SavedSearchService } from './services/saved-search.service';
import { SavedSearchRepository } from './repositories/saved-search.repository';
import { SavedSearchEntity } from './entities/saved-search.entity';
import { SavedSearchTransformer } from './transformers/saved-search.transformer';

import { TourController } from './controllers/tour.controller';
import { TourRepository } from './repositories/tour.repository';
import { TourService } from './services/tour.service';
import { TourUtil } from './utils/tour.util';

import { WatermarkEntity } from './entities/watermark.entity';
import { WatermarkOriginalImageEntity } from './entities/watermark-original-images.entity';
import { WatermarkService } from './services/watermark.service';
import { WatermarkRepository } from './repositories/watermark.repository';

import { WhatsappEntity } from '../app/entities/whatsapp.entity';
import { WhatsappService } from '../app/services/whatsapp.service';
import { WhatsappRepository } from '../app/repositories/whatsapp.repository';

import { WishlistEntity } from '../wishlist/entities/wishlist.entity';
import { WishlistRepository } from '../wishlist/repositories/wishlist.repository';
import { WishlistService } from '../wishlist/services/wishlist.service';
import { DirectusFolderEntity } from '../app/entities/directus-folder.entity';

const providers = [
  EmiCalculatorService,
  ProjectCategoriesService,
  ProjectDetailService,
  ProjectListingService,
  ProjectStatusUpdateService,
  SavedSearchService,
  WatermarkService,
  WishlistService,
  ReindexingService,

  ProjectListingRepository,
  SavedSearchRepository,
  TourRepository,
  WatermarkRepository,
  WishlistRepository,
  ReindexingRepository,
  WhatsappRepository,

  AllToursDetailTransformer,
  CategoryTransformer,
  CollectionDetailTransformer,
  CreateTourTransformer,
  DeveloperIndexDetailTransformer,
  MicroMarketIndexDetailTransformer,
  NearbyLocalityTransformer,
  ProjectIndexDetailTransformer,
  ProjectDetailTransformer,
  RequestTourTransformer,
  SavedSearchTransformer,
  SearchProjectTransformer,
  SlugTransformer,
  TourDetailTransformer,

  CategoryEntity,
  ConfigurationEntity,
  ContactDetailEntity,
  CustomerEntity,
  CustomSeoEntity,
  DeveloperEntity,
  DirectusFieldEntity,
  DirectusFilesEntity,
  DirectusFolderEntity,
  FeatureCategoryEntity,
  FeatureEntity,
  MicroMarketEntity,
  OtherContactDetailsEntity,
  ProjectCategoryEntity,
  ProjectEntity,
  ProjectFeatureEntity,
  ProjectFilesFloorPlanEntity,
  ProjectFilesImagesEntity,
  ProjectValidationRuleEntity,
  RelationshipManagerEntity,
  ReraStageEntity,
  SavedSearchEntity,
  SiteVisitEntity,
  SiteVisitStatusEntity,
  TourService,
  WishlistEntity,
  WishlistProjectEntity,
  WingConfigurationEntity,
  WingEntity,
  ReindexingEntity,
  TourUtil,
  WatermarkEntity,
  WatermarkOriginalImageEntity,
  WhatsappService,
  WhatsappEntity
];

@Module({
  imports: [
    AppModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: config.ACCESS_TOKEN_SECRET,
      signOptions: {
        expiresIn: config
      }
    })
  ],

  controllers: [
    EmiCalculatorController,
    ProjectCategoriesController,
    ProjectDetailController,
    ProjectListingController,
    ProjectStatusUpdateController,
    SavedSearchController,
    TourController,
    IndexingController
  ],

  providers,
  exports: providers
})
export class ProjectModule { }
