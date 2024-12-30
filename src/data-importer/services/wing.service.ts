import { Injectable, Logger } from '@nestjs/common';
import { DataGenerator } from '../fakers/data-generator.faker';
import { DataImporterUtil } from '../utils/data-importer.util';
import { DataImporterRepository } from '../repositories/data-importer.repository';
import { DbConfig } from '../config/db.config';
import { WingProcessInterface } from '../interfaces/wing-process.interface';

@Injectable()
export class WingService {
  private readonly logger = new Logger(WingService.name);

  constructor(
    private readonly dataImporterUtil: DataImporterUtil,
    private readonly dataGenerator: DataGenerator,
    private readonly dataImporterRepository: DataImporterRepository
  ) {}

  async process(data: WingProcessInterface) {
    const {
      projectId, projectDetails, completiondate, wings
    } = data;
    this.logger.log('Creating Wing...');

    const minWings = wings?.min || 1;
    const maxWings = wings?.max || 3;

    const numberOfWings = this.dataGenerator.getRandomNumber(minWings, maxWings);
    this.logger.log('Number of Wings:', numberOfWings);

    const wingNamePrefix = this.dataGenerator.getRandomWingName();
    const wingNameSuffix = this.getArrayOfLetters(numberOfWings);
    const wingNames = wingNameSuffix.map((letter) => `${wingNamePrefix} ${letter}`);
    this.logger.log('Wing Names:', wingNames);

    const reraStages = await this.dataImporterRepository.getReraStages();
    const reraStageIds = reraStages.map((reraStage: { id: string }) => reraStage.id);

    const wingPromises = Array.from({ length: numberOfWings }, async (_, i) => {
      const floorPlanImageType = this.dataGenerator.getRandomFloorPlanImageType();
      const floorPlanImageId = await this.dataImporterUtil.uploadImage(
        floorPlanImageType,
        DbConfig.projectFolder
      );

      const projectStatus = this.dataGenerator.getRandomNumber(1, 3);
      this.logger.log(`${wingNames[i]} - Floor Plan Image: ${floorPlanImageId}`);

      const dataToSave = {
        name: wingNames[i],
        totalFloors: this.dataGenerator.getRandomNumber(1, 30),
        completionDate: completiondate || this.dataGenerator.generateFakeDate(),
        floorPlanId: floorPlanImageId,
        reraRegistrationNumber: this.dataGenerator.generateFakeReraRegistrationNumber(),
        reraStage: this.dataGenerator.getRandomId(reraStageIds),
        projectId,
        addressId: projectDetails.addressId,
        projectStatus
      };
      return this.dataImporterRepository.createWing(dataToSave);
    });

    const wingIds = await Promise.all(wingPromises);

    this.logger.log('Wings Created');
    this.logger.log(wingIds);

    return wingIds;
  }

  private getArrayOfLetters(number: number) {
    const letters = [];
    const startLetterCode = 'A'.charCodeAt(0);

    for (let i = 0; i < number; i += 1) {
      const letter = String.fromCharCode(startLetterCode + i);
      letters.push(letter);
    }

    return letters;
  }
}
