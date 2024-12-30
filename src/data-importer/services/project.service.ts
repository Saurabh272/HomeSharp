import { Injectable, Logger } from '@nestjs/common';
import { DbConfig } from '../config/db.config';
import { DataImporterUtil } from '../utils/data-importer.util';
import { DeveloperService } from './developer.service';
import { DataGenerator } from '../fakers/data-generator.faker';
import { DataImporterRepository } from '../repositories/data-importer.repository';
import { MicroMarketService } from './micro-market.service';
import { Project } from '../interfaces/project.interface';

@Injectable()
export class ProjectService {
  private readonly logger = new Logger(ProjectService.name);

  constructor(
    private readonly dataImporterUtil: DataImporterUtil,
    private readonly developerService: DeveloperService,
    private readonly dataGenerator: DataGenerator,
    private readonly dataImporterRepository: DataImporterRepository,
    private readonly microMarketService: MicroMarketService
  ) {}

  async process(data: Project) {
    const projectDetails = await this.getProjectDetails(data);

    this.logger.log('Project Details:');
    this.logger.log(projectDetails);

    return this.createProject(projectDetails);
  }

  private async getProjectDetails(data: Project) {
    if (!data.projectname) {
      // TODO: Why are we mutating the data object what about other keys? - pankaj
      data.projectname = this.dataGenerator.generateFakeCompanyName();
    }

    const numberOfUnits = data.launchedunits || this.dataGenerator.getRandomNumber(1, 1000);
    const maxCarpetArea = data.unitizesqftmax || this.dataGenerator.getRandomNumber(500, 22000);
    const minCarpetArea = data.unitizesqftmin || this.dataGenerator.getRandomNumber(100, maxCarpetArea);
    const pricePerSqft = data.regprice || this.dataGenerator.getRandomNumber(4000, 130000);
    const slug = this.dataImporterUtil.getSlug(data.projectname);
    const website = this.dataGenerator.generateFakeWebsite(slug);
    const contactDetails = this.dataGenerator.generateFakeContactDetails(website);
    const numberOfImages = this.dataGenerator.getRandomNumber(2, 5);
    const imageType = this.dataGenerator.getRandomProjectImageType();
    const address = this.dataGenerator.generateFakeAddress();

    const [
      imageIds,
      contactDetailsId,
      otherContactDetailsId,
      brochureId, developer,
      propertyPictureId,
      microMarketId,
      seoPropertiesId,
      addressId,
      featureIds,
      projectPlanImageId,
      categoryIds,
      floorPlanIds
    ] = await Promise.all([
      this.dataImporterUtil.uploadImages(imageType, DbConfig.projectFolder, numberOfImages),
      this.dataImporterRepository.createContactDetails(contactDetails),
      this.dataImporterRepository.createContactDetails(contactDetails),
      this.dataImporterUtil.getRandomPdf(),
      this.developerService.process(data),
      this.dataImporterUtil.uploadImage(imageType, DbConfig.projectFolder),
      this.dataImporterRepository.getMicroMarket(data?.micromarket)
        || (data?.micromarket ? this.microMarketService.process(data?.micromarket) : null),
      this.dataImporterUtil.createSeoProperties({ slug }),
      this.dataImporterRepository.createAddress(address),
      this.uploadFakeFeatures(),
      this.dataImporterUtil.uploadImage(this.dataGenerator.getRandomFloorPlanImageType(), DbConfig.projectFolder),
      this.uploadCategories(data.priceinclusive || null),
      this.dataImporterUtil.uploadImages(
        this.dataGenerator.getRandomFloorPlanImageType(),
        DbConfig.projectFolder,
        numberOfImages
      )
    ]);

    return {
      name: data.projectname,
      address: address.completeAddress,
      website,
      developer,
      propertyPictureId,
      imageIds,
      description: this.dataGenerator.generateFakeSummary(),
      coordinates: this.getProjectCoordinates(data),
      launchStatus: this.dataGenerator.getRandomProjectLaunchStatus(),
      numberOfTowers: this.dataGenerator.getRandomNumber(1, 10),
      numberOfUnits,
      numberOfUnitsSold: data.absorbedunits || this.dataGenerator.getRandomNumber(1, numberOfUnits),
      contactDetailsId,
      brochureId,
      minimumPrice: minCarpetArea * pricePerSqft,
      maximumPrice: maxCarpetArea * pricePerSqft,
      microMarketId,
      seoPropertiesId,
      addressId,
      featureIds,
      projectPlanImageId,
      categoryIds,
      mostSearched: this.dataGenerator.generateFakeMostSearched(),
      featured: this.dataGenerator.generateFakeFeatured(),
      shortDescription: this.dataGenerator.generateRandomShortDescription(),
      projectConfigurations: this.dataGenerator.generateRandomProjectConfigurations(),
      parking: this.dataGenerator.generateRandomParking(),
      floorPlanIds,
      otherContactDetailsId,
      propertyType: this.dataGenerator.getRandomPropertyType(),
      hidePrice: Math.random() < 0.5
    };
  }

  private async createProject(projectDetails: any) {
    this.logger.log('Creating Project...');
    const projectId = await this.dataImporterRepository.createProject(projectDetails);

    // save data in all junction tables
    if (projectDetails.imageIds) {
      this.logger.log('Creating Project Images...');
      await this.dataImporterRepository.createProjectImages(projectId, projectDetails.imageIds);
      this.logger.log('Project Images created!');
    }
    if (projectDetails.floorPlanIds) {
      this.logger.log('Creating Project Floor Plans...');
      await this.dataImporterRepository.createFloorPlans(projectId, projectDetails.floorPlanIds);
      this.logger.log('Project Floor Plans created!');
    }

    if (projectDetails.otherContactDetailsId) {
      this.logger.log('Creating Project Other Contact Details...');
      await this.dataImporterRepository.createOtherContactDetails(projectId, projectDetails.otherContactDetailsId);
      this.logger.log('Project Other Contact Details created!');
    }

    if (projectDetails.featureIds) {
      this.logger.log('Creating Project Features...');
      await this.dataImporterRepository.createProjectFeatures(projectId, projectDetails.featureIds);
      this.logger.log('Project Features created!');
    }
    if (projectDetails.categoryIds) {
      this.logger.log('Creating Project Categories...');
      await this.dataImporterRepository.createProjectCategories(projectId, projectDetails.categoryIds);
      this.logger.log('Project Categories created!');
    }

    this.logger.log('Project created!');

    return {
      projectId,
      projectDetails
    };
  }

  private async uploadFakeFeatures() {
    const featureCategoryIds = await this.dataImporterRepository.getFeaturesCategories();
    const numberOfFeatures = this.dataGenerator.getRandomNumber(3, 8);

    const promises = Array.from({ length: numberOfFeatures }, async () => {
      const featureName = this.dataGenerator.getRandomFeature();
      const featureList = this.dataGenerator.generateFakeFeatureList(this.dataGenerator.getRandomNumber(1, 5));

      const featureImageId = await this.dataImporterUtil.uploadImage(featureName, DbConfig.featuresFolder);
      const featureCategoryId = this.dataImporterUtil.getRandomFeaturesCategory(featureCategoryIds);
      const keyHighlight = this.dataGenerator.generateFakeFeatured();

      return this.dataImporterRepository.createFeature({
        featureName,
        featureList,
        featureImageId,
        featureCategoryId,
        keyHighlight
      });
    });

    return Promise.all(promises);
  }

  private async uploadCategories(priceInclusive: string) {
    let categories: any[];
    if (priceInclusive === '-' || priceInclusive === null) {
      const numberOfCategories = this.dataGenerator.getRandomNumber(1, 3);
      categories = this.dataGenerator.generateFakeCategories(numberOfCategories);
    } else {
      categories = this.sanitizeCategories(priceInclusive);
    }

    const categoryIdsPromises = categories.map(async (category) => {
      const categorySlug = this.dataImporterUtil.getSlug(category);
      const categoryId: { id?: string } = await this.dataImporterRepository.getCategory(categorySlug);
      if (categoryId && categoryId.id) {
        this.logger.log(`Category already exists: ${categoryId.id}`);
        return categoryId.id;
      }

      try {
        const seoPropertiesId = await this.dataImporterUtil.createSeoProperties({ slug: categorySlug });
        const imageId = await this.dataImporterUtil.uploadImage(category, DbConfig.categoryFolder);
        const newCategoryId = await this.dataImporterRepository.createCategory({ category, seoPropertiesId, imageId });
        this.logger.log(`Category Inserted: ${newCategoryId}`);

        return newCategoryId;
      } catch (error) {
        this.logger.error(error);
      }
    });

    return Promise.all(categoryIdsPromises);
  }

  private sanitizeCategories(categories: string) {
    const categoryArray = categories.replace(/^,|,$/g, '').split(',');

    return categoryArray.map((category) => category
      .replace(/&amp;/g, '')
      .replace(/\n/g, '')
      .replace(/\s+/g, ' ')
      .trim());
  }

  async getProjectsByName(projectNames: string[]) {
    if (!projectNames || !projectNames.length) {
      return [];
    }

    const projects = await this.dataImporterRepository.getProjectsByName(projectNames);
    if (!projects || !projects.length) {
      return [];
    }

    return projects;
  }

  async getProjectsByLocation(projectLocations: string[]) {
    const existingProjectsPromises = projectLocations.map(async (projectLocation) => {
      if (!projectLocation) {
        return null;
      }

      const project = await this.dataImporterRepository.getProjectByCoordinates(projectLocation);

      if (project && project[0]) {
        return projectLocation;
      }

      return null;
    });

    const existingProjects = await Promise.all(existingProjectsPromises);

    return existingProjects.filter((project) => project !== null);
  }

  getProjectCoordinates(project: Project) {
    if (!project) {
      return null;
    }

    if (project.latitude && project.longitude) {
      return [project.latitude, project.longitude];
    }

    const [fakeLatitude, fakeLongitude] = this.dataGenerator.generateFakeCoordinates() || [null, null];
    project.latitude = project.latitude || fakeLatitude;
    project.longitude = project.longitude || fakeLongitude;

    return [project.latitude, project.longitude];
  }
}
