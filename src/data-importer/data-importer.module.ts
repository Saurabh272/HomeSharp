import { Module } from '@nestjs/common';
import { AppModule } from '../app/app.module';
import { DataImporterController } from './controllers/data-importer.controller';
import { ProjectImporterService } from './services/project-importer.service';
import { ExcelReaderService } from './services/excel-reader.service';
import { MicroMarketImporterService } from './services/micro-market-importer.service';
import { ProjectService } from './services/project.service';
import { WingService } from './services/wing.service';
import { ConfigurationService } from './services/configuration.service';
import { DataImporterUtil } from './utils/data-importer.util';
import { DeveloperService } from './services/developer.service';
import { DataGenerator } from './fakers/data-generator.faker';
import { DataImporterRepository } from './repositories/data-importer.repository';
import { MicroMarketService } from './services/micro-market.service';
import { ImageGenerator } from './fakers/image-generator.faker';
import { ProjectModule } from '../project/project.module';
import { CompleteDataImporterService } from './services/complete-data-importer.service';
import { DeveloperEntity } from '../developer/entities/developer.entity';

const providers = [
  ProjectImporterService,
  ExcelReaderService,
  MicroMarketImporterService,
  ProjectService,
  WingService,
  ConfigurationService,
  DataImporterUtil,
  DeveloperService,
  DataGenerator,
  ImageGenerator,
  MicroMarketService,
  DataImporterRepository,
  CompleteDataImporterService,
  DeveloperEntity
];
@Module({
  imports: [
    AppModule,
    ProjectModule
  ],
  controllers: [DataImporterController],
  providers,
  exports: providers
})
export class DataImporterModule {}
