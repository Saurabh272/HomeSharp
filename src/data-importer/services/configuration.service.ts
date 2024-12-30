import { Injectable, Logger } from '@nestjs/common';
import { DataGenerator } from '../fakers/data-generator.faker';
import { DbConfig } from '../config/db.config';
import { DataImporterRepository } from '../repositories/data-importer.repository';
import { Project } from '../interfaces/project.interface';
import { DataImporterUtil } from '../utils/data-importer.util';

@Injectable()
export class ConfigurationService {
  private readonly logger = new Logger(ConfigurationService.name);

  constructor(
    private readonly dataGenerator: DataGenerator,
    private readonly dataImporterRepository: DataImporterRepository,
    private readonly dataImporterUtil: DataImporterUtil
  ) {}

  async process(projectDetails: any, data: Project) {
    const configurationPromises = Array.from({ length: 2 }, async () => {
      const floorPlanId = await this.dataImporterUtil.uploadImage(
        this.dataGenerator.getRandomProjectImageType(),
        DbConfig.projectFolder
      );
      const bedrooms = this.dataGenerator.getRandomNumber(data.bedroommin || 1, data.bedroommax || 5);
      const houseType = 'Beds';
      const dataToSave = {
        areaUnit: 'sq. ft.',
        carpetArea: this.dataGenerator.getRandomCarpetArea(data.unitizesqftmin || 1000, data.unitizesqftmax || 20000),
        unitsAvailable: Math.floor((projectDetails.numberOfUnits - projectDetails.numberOfUnitsSold) / 2),
        unitsSold: Math.floor(projectDetails.numberOfUnitsSold / 2),
        houseType,
        bedrooms,
        bathrooms: this.dataGenerator.getRandomNumber(1, 5),
        name: bedrooms + houseType,
        balconies: this.dataGenerator.getRandomNumber(1, 3),
        parkings: this.dataGenerator.getRandomNumber(1, 3),
        floorRange: this.dataGenerator.getRandomFloorPlans(),
        floorPlanId,
        minimumPrice: this.dataGenerator.getRandomNumber(4000, 130000),
        startingPrice: this.dataGenerator.getRandomNumber(4000, 130000),
        maximumPrice: this.dataGenerator.getRandomNumber(130000, 200000),
        launchStatus: this.dataGenerator.getRandomProjectLaunchStatus()
      };
      return this.dataImporterRepository.createConfiguration(dataToSave);
    });

    const configurationIds = await Promise.all(configurationPromises);

    this.logger.log('Configurations Created');
    this.logger.log(configurationIds);

    return configurationIds;
  }

  async processWingConfiguration(wingIds: string[], configurationIds: string[]) {
    const minCombinations = Math.min(wingIds.length, configurationIds.length);

    const wingConfigurationPromises = Array.from(
      { length: minCombinations },
      async () => this.dataImporterRepository.createWingConfiguration({
        wingId: this.dataGenerator.getRandomId(wingIds),
        configurationId: this.dataGenerator.getRandomId(configurationIds)
      })
    );

    const wingConfigurationIds = await Promise.all(wingConfigurationPromises);

    this.logger.log('Wing Configurations Created');
    this.logger.log(wingConfigurationIds);

    return wingConfigurationIds;
  }
}
