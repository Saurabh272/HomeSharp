import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { Db } from './utils/db.util';
import { Transformer } from './utils/transformer.util';
import { AddressEntity } from './entities/address.entity';
import { DirectusFieldEntity } from './entities/directus-field.entity';
import { DirectusFilesEntity } from './entities/directus-file.entity';
import { SeoPropertiesEntity } from './entities/seo-properties.entity';
import { SmsRepository } from './repositories/sms.repository';
import { SmsEntity } from './entities/sms.entity';
import { InfobipService } from './services/infobip.service';
import { RedisConnection } from './utils/redis.util';
import { SeoPropertiesService } from './services/seo-properties.service';
import { SeoPropertiesRepository } from './repositories/seo-properties.repository';
import { SeoPropertiesController } from './controllers/seo-properties.controller';
import { SeoPropertiesTransformer } from './transformers/get-seo-properties.transformer';
import { FailureLogsRepository } from './repositories/failure-logs.repository';
import { FailureLogsEntity } from './entities/failure-logs.entity';
import { CategoryEntity } from '../project/entities/category.entity';
import { DeveloperEntity } from '../developer/entities/developer.entity';
import { MicroMarketEntity } from '../project/entities/micro-market.entity';
import { ProjectEntity } from '../project/entities/project.entity';
import { ContactDetailEntity } from '../project/entities/contact-detail.entity';
import { DataImporterUtil } from '../data-importer/utils/data-importer.util';
import { DataGenerator } from '../data-importer/fakers/data-generator.faker';
import { DataImporterRepository } from '../data-importer/repositories/data-importer.repository';
import { ImageGenerator } from '../data-importer/fakers/image-generator.faker';
import { FeatureCategoryEntity } from '../project/entities/feature-category.entity';
import { FeatureEntity } from '../project/entities/feature.entity';
import { ReraStageEntity } from '../project/entities/rera-stage.entity';
import { ProjectFilesImagesEntity } from '../project/entities/project-file-image.entity';
import { ProjectFeatureEntity } from '../project/entities/project-feature.entity';
import { ProjectCategoryEntity } from '../project/entities/project-category.entity';
import { WingEntity } from '../project/entities/wing.entity';
import { ConfigurationEntity } from '../project/entities/configuration.entity';
import { WingConfigurationEntity } from '../project/entities/wing-configuration.entity';
import { ProjectFilesFloorPlanEntity } from '../project/entities/project-file-floor-plan.entity';
import { OtherContactDetailsEntity } from '../project/entities/other-contact-details.entity';
import { CompleteDataImporterService } from '../data-importer/services/complete-data-importer.service';
import { EmailEntity } from './entities/email.entity';
import { EmailController } from './controllers/email.controller';
import emailConfig from './config/email.config';
import { DirectusAuth } from './utils/directus.util';
import { EmailProcessor } from './processors/email.processor';
import { EmailInfobipService } from './services/email-infobip.service';
import { NetcoreService } from './services/netcore.service';
import { EmailDoveSoftService } from './services/email-dove-soft.service';
import config from './config';

const providers = [
  Db,
  Transformer,
  AddressEntity,
  CategoryEntity,
  ContactDetailEntity,

  DataGenerator,
  DataImporterUtil,
  DataImporterRepository,
  ImageGenerator,
  FeatureCategoryEntity,
  FeatureEntity,
  ReraStageEntity,
  ProjectEntity,
  ProjectFilesImagesEntity,
  ProjectFeatureEntity,
  ProjectCategoryEntity,
  WingEntity,
  ConfigurationEntity,
  WingConfigurationEntity,
  ProjectFilesFloorPlanEntity,
  OtherContactDetailsEntity,
  CompleteDataImporterService,
  EmailEntity,

  DeveloperEntity,
  MicroMarketEntity,
  ProjectEntity,
  DirectusFieldEntity,
  DirectusFilesEntity,
  SeoPropertiesEntity,
  SmsRepository,
  SmsEntity,
  InfobipService,
  RedisConnection,
  SeoPropertiesService,
  SeoPropertiesRepository,
  SeoPropertiesTransformer,
  FailureLogsEntity,
  FailureLogsRepository,
  DirectusAuth,
  EmailProcessor,
  EmailInfobipService,
  NetcoreService,
  EmailDoveSoftService
];

@Module({
  imports: [BullModule.registerQueue(
    {
      name: emailConfig.emailQueue
    },
    {
      name: emailConfig.emailRetryQueue
    }
  ), ThrottlerModule.forRoot([{
    ttl: config.RATE_LIMIT_TTL,
    limit: config.RATE_LIMIT,
    skipIf: (context) => {
      if (!config?.ALLOWED_IPS?.length) {
        return false;
      }

      const request = context.switchToHttp().getRequest();
      const allowedIPs = config?.ALLOWED_IPS?.split(',');
      const clientIP = request.ip || request.connection.remoteAddress;
      return allowedIPs.includes(clientIP);
    }
  }])
  ],
  controllers: [SeoPropertiesController, EmailController],
  providers: [...providers, {
    provide: APP_GUARD,
    useClass: ThrottlerGuard
  }],
  exports: providers
})
export class AppModule {}
