import { Injectable, Logger } from '@nestjs/common';
import { DataGenerator } from '../fakers/data-generator.faker';
import { DataImporterUtil } from '../utils/data-importer.util';
import { DataImporterRepository } from '../repositories/data-importer.repository';
import { DbConfig } from '../config/db.config';
import { Project } from '../interfaces/project.interface';

@Injectable()
export class DeveloperService {
  private readonly logger = new Logger(DeveloperService.name);

  constructor(
    private readonly dataImporterUtil: DataImporterUtil,
    private readonly dataGenerator: DataGenerator,
    private readonly dataImporterRepository: DataImporterRepository
  ) {}

  async process(data: Project) {
    const result: { id?: string } = await this.dataImporterRepository.getDevelopers(data.developer);
    if (result && result.id) {
      this.logger.log('Developer already exists!');
      return result.id;
    }

    this.logger.log('Creating Developer...');
    try {
      const response = await this.createDeveloper(data);
      this.logger.log('Developer created!');
      this.logger.log(response);

      return response;
    } catch (error) {
      this.logger.log('Handling Developer creation error...');
      this.logger.error(error);

      const retryResult: { id?: string } = await this.dataImporterRepository.getDevelopers(data.developer);

      if (retryResult && retryResult.id) {
        this.logger.log('Developer already exists!');
        return retryResult.id;
      }
    }
  }

  private async createDeveloper(data: Project) {
    if (!data.developer) {
      data.developer = this.dataGenerator.generateFakeCompanyName();
    }

    // TODO: Why can we not run these in promise all? - pankaj
    const slug = this.dataImporterUtil.getSlug(data.developer);
    const seoPropertiesId = await this.dataImporterUtil.createSeoProperties({ slug });

    const imageType = this.dataGenerator.getRandomDeveloperImageType();
    const imageId = await this.dataImporterUtil.uploadImage(imageType, DbConfig.developerFolder);

    const salesOfficeAddress = this.dataGenerator.generateFakeAddress();
    const addressId = await this.dataImporterRepository.createAddress(salesOfficeAddress);

    const website = this.dataGenerator.generateFakeWebsite(slug);
    const contactDetails = this.dataGenerator.generateFakeContactDetails(website);
    const contactDetailsId = await this.dataImporterRepository.createContactDetails(contactDetails);

    return this.dataImporterRepository.createDevelopers({
      name: data.developer,
      seoPropertiesId,
      imageId,
      website,
      addressId,
      salesOfficeAddress,
      contactDetailsId,
      corporateOfficeAddress: this.dataGenerator.generateFakeAddress(),
      metrics: this.dataGenerator.getRandomNumber(1, 10),
      foundedYear: this.dataGenerator.getRandomNumber(1950, 2020),
      reraRegistrationNumber: this.dataGenerator.generateFakeDeveloperReraRegistrationNumber(),
      summary: this.dataGenerator.generateFakeSummary(),
      description: this.dataGenerator.generateFakeDescription()
    });
  }
}
