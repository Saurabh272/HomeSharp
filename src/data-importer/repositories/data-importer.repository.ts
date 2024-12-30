import { Injectable, Logger } from '@nestjs/common';
import {
  DirectusClient,
  RestClient,
  StaticTokenClient,
  createItem,
  createItems,
  readFiles,
  readFolders,
  readItems,
  uploadFiles
} from '@directus/sdk';
import { Db } from '../../app/utils/db.util';
import { DbConfig } from '../config/db.config';
import { reraStagesMaterValues } from '../config/rera-stage.config';
import { featuresCategoriesMasterValues } from '../config/feature-category.config';
import { MicroMarketEntity } from '../../project/entities/micro-market.entity';
import { DeveloperEntity } from '../../developer/entities/developer.entity';
import { SeoPropertiesEntity } from '../../app/entities/seo-properties.entity';
import { AddressEntity } from '../../app/entities/address.entity';
import { ContactDetailEntity } from '../../project/entities/contact-detail.entity';
import { CategoryEntity } from '../../project/entities/category.entity';
import { FeatureCategoryEntity } from '../../project/entities/feature-category.entity';
import { FeatureEntity } from '../../project/entities/feature.entity';
import { ReraStageEntity } from '../../project/entities/rera-stage.entity';
import { ProjectEntity } from '../../project/entities/project.entity';
import { ProjectFilesImagesEntity } from '../../project/entities/project-file-image.entity';
import { ProjectFeatureEntity } from '../../project/entities/project-feature.entity';
import { ProjectCategoryEntity } from '../../project/entities/project-category.entity';
import { WingEntity } from '../../project/entities/wing.entity';
import { ConfigurationEntity } from '../../project/entities/configuration.entity';
import { WingConfigurationEntity } from '../../project/entities/wing-configuration.entity';
import { Transformer } from '../../app/utils/transformer.util';
import { ProjectFilesFloorPlanEntity } from '../../project/entities/project-file-floor-plan.entity';
import { OtherContactDetailsEntity } from '../../project/entities/other-contact-details.entity';
import uploadConfig from '../../app/config/upload.config';

@Injectable()
export class DataImporterRepository {
  private readonly logger = new Logger(DataImporterRepository.name);

  private client: DirectusClient<any> & StaticTokenClient<any> & RestClient<any>;

  constructor(
    private readonly db: Db,
    private readonly transformer: Transformer,
    private readonly microMarketEntity: MicroMarketEntity,
    private readonly developerEntity: DeveloperEntity,
    private readonly seoPropertiesEntity: SeoPropertiesEntity,
    private readonly addressEntity: AddressEntity,
    private readonly contactDetailEntity: ContactDetailEntity,
    private readonly categoryEntity: CategoryEntity,
    private readonly featureCategoryEntity: FeatureCategoryEntity,
    private readonly featureEntity: FeatureEntity,
    private readonly reraStageEntity: ReraStageEntity,
    private readonly projectEntity: ProjectEntity,
    private readonly projectFilesEntity: ProjectFilesImagesEntity,
    private readonly projectFeatureEntity: ProjectFeatureEntity,
    private readonly projectCategoryEntity: ProjectCategoryEntity,
    private readonly wingEntity: WingEntity,
    private readonly configurationEntity: ConfigurationEntity,
    private readonly wingConfigurationEntity: WingConfigurationEntity,
    private readonly projectFilesFloorPlanEntity: ProjectFilesFloorPlanEntity,
    private readonly otherContactDetailsEntity: OtherContactDetailsEntity
  ) {
    this.client = db.getDirectusClient();
  }

  async getMicroMarket(name: string) {
    const microMarket = await this.client.request(readItems(this.microMarketEntity.tableName, {
      filter: {
        [this.microMarketEntity.name]: {
          _eq: name
        }
      },
      limit: 1
    }));

    if (microMarket.length > 0) {
      return microMarket[0];
    }
  }

  async createMicroMarkets(data: any[]) {
    const uniqueMicroMarkets = data.map((item) => item.microMarket);

    const existingMicroMarkets = await this.client.request(readItems(this.microMarketEntity.tableName, {
      filter: {
        [this.microMarketEntity.name]: {
          _in: uniqueMicroMarkets
        }
      }
    }));

    const existingMicroMarketNames = new Set(
      existingMicroMarkets.map((item: any) => item[this.microMarketEntity.name])
    );

    const dataToCreate = data.reduce((acc, item) => {
      if (!existingMicroMarketNames.has(item.microMarket)) {
        const dataToSave = {
          [this.microMarketEntity.name]: item.microMarket,
          [this.microMarketEntity.seoProperties]: item.seoPropertyId
        };

        if (item.latitude && item.longitude) {
          dataToSave[this.microMarketEntity.location] = {
            type: 'Point',
            coordinates: [item.longitude, item.latitude]
          };
        }

        acc.push(dataToSave);
      } else {
        this.logger.log(`Micro Market ${item.microMarket} already exists`);
      }

      return acc;
    }, []);

    if (dataToCreate.length > 0) {
      try {
        const microMarkets = await this.client.request(createItems(
          this.microMarketEntity.tableName,
          dataToCreate
        ));

        return microMarkets.map((microMarket: any) => microMarket.id);
      } catch (error) {
        this.logger.error('Error creating Micro Markets:', error);
      }
    }

    return [];
  }

  async createMicroMarket(data: {
    microMarket: string;
    latitude: number;
    longitude: number;
    seoPropertyId: string;
  }) {
    const dataToSave = {
      [this.microMarketEntity.name]: data.microMarket,
      [this.microMarketEntity.location]: {
        type: 'Point',
        coordinates: [data.longitude, data.latitude]
      },
      [this.microMarketEntity.seoProperties]: data.seoPropertyId
    };

    try {
      const response: { id?: string } = await this.client.request(createItem(
        this.microMarketEntity.tableName,
        dataToSave
      ));
      return response;
    } catch (error) {
      this.logger.error('Error creating Micro Market:', error);
    }
  }

  async getDevelopers(name: string) {
    const developer = await this.client.request(readItems(this.developerEntity.tableName, {
      filter: {
        [this.developerEntity.name]: {
          _eq: name
        }
      },
      limit: 1
    }));

    if (developer.length > 0) {
      return developer[0];
    }
  }

  // TODO: Avoid using "any" type
  public async createDevelopers(data: any) {
    const developerToSave = this.developerDataMapper(data);
    const developer: { id?: string; } = await this.client.request(createItem(
      this.developerEntity.tableName,
      developerToSave
    ));

    return developer?.id;
  }

  private developerDataMapper(data: any) {
    return {
      [this.developerEntity.name]: data.name,
      [this.developerEntity.seoProperties]: data.seoPropertiesId,
      [this.developerEntity.logo]: data.imageId,
      [this.developerEntity.developerWebsite]: data.website,
      [this.developerEntity.salesOfficeAddress]: data.salesOfficeAddress.completeAddress,
      [this.developerEntity.corporateOfficeAddress]: data.corporateOfficeAddress.completeAddress,
      [this.developerEntity.contactDetails]: data.contactDetailsId,
      [this.developerEntity.address]: data.addressId,
      [this.developerEntity.reraRegistrationNumber]: data.reraRegistrationNumber,
      [this.developerEntity.foundedYear]: data.foundedYear,
      [this.developerEntity.summary]: data.summary,
      [this.developerEntity.description]: data.description
    };
  }

  private async getFolderIdFromRoot(folderName: string) {
    const getCustomerFolderFromRoot = await this.client.request(readFolders({
      filter: {
        name: { _eq: folderName }
      }
    }));

    return getCustomerFolderFromRoot?.[0]?.id;
  }

  private async uploadAttachment(form: FormData) {
    const result = await this.client.request(uploadFiles(form));

    return result?.id;
  }

  async uploadImage(file: any, folderName: string) {
    try {
      const originalName = file?.name;
      const type = file?.mimetype || uploadConfig.imageJpgMimeType;
      const getFolderId = await this.getFolderIdFromRoot(folderName);

      const form = new FormData();
      const stream = new Blob([file?.data], { type });
      form.append('folder', getFolderId);
      form.append('file', stream, originalName);

      return await this.uploadAttachment(form);
    } catch (error) {
      throw new Error(error);
    }
  }

  async getSeoProperties(slug: string) {
    const seoProperties = await this.client.request(readItems(this.seoPropertiesEntity.tableName, {
      filter: {
        [this.seoPropertiesEntity.slug]: {
          _eq: slug
        }
      },
      limit: 1
    }));

    if (seoProperties.length > 0) {
      return seoProperties?.[0];
    }
  }

  async createSeoProperties(data: any) {
    const seoProperties: { id?: string; } = await this.client.request(createItem(
      this.seoPropertiesEntity.tableName,
      data
    ));

    return seoProperties?.id;
  }

  private addressDataMapper(data: any) {
    return {
      [this.addressEntity.line1]: data.addressLine1,
      [this.addressEntity.line2]: data.addressLine2,
      [this.addressEntity.city]: data.city,
      [this.addressEntity.state]: data.state,
      [this.addressEntity.pinCode]: data.pinCode
    };
  }

  async createAddress(data: any) {
    const addressToSave = this.addressDataMapper(data);
    const address: { id?: string; } = await this.client.request(createItem(
      this.addressEntity.tableName,
      addressToSave
    ));

    return address?.id;
  }

  private contactDetailsMapper(data: any) {
    return {
      [this.contactDetailEntity.phone]: data.phone,
      [this.contactDetailEntity.email]: data.email,
      [this.contactDetailEntity.website]: data.website
    };
  }

  async createContactDetails(data: any) {
    const contactDetailsToSave = this.contactDetailsMapper(data);
    const contactDetails: { id?: string; } = await this.client.request(createItem(
      this.contactDetailEntity.tableName,
      contactDetailsToSave
    ));

    return contactDetails?.id;
  }

  async getPdfs() {
    return this.client.request(readFiles({
      fields: [DbConfig.directusFilesId],
      filter: {
        [DbConfig.directusFilesType]: {
          _eq: DbConfig.directusFilesPdfType
        }
      }
    }));
  }

  async getCategory(name: string) {
    const category = await this.client.request(readItems(this.categoryEntity.tableName, {
      filter: {
        [this.categoryEntity.seoProperty]: {
          [this.seoPropertiesEntity.slug]: {
            _eq: name
          }
        }
      },
      limit: 1
    }));

    if (category.length > 0) {
      return category[0];
    }
  }

  private categoryDataMapper(data: any) {
    return {
      [this.categoryEntity.name]: data.category,
      [this.categoryEntity.seoProperty]: data.seoPropertiesId,
      [this.categoryEntity.image]: data.imageId
    };
  }

  async createCategory(data: {
    category: string,
    seoPropertiesId: string,
    imageId: string
  }) {
    const categoryToSave = this.categoryDataMapper(data);
    const category: { id?: string } = await this.client.request(createItem(
      this.categoryEntity.tableName,
      categoryToSave
    ));

    return category?.id;
  }

  async getFeaturesCategories() {
    const featuresCategories = await this.client.request(readItems(this.featureCategoryEntity.tableName, {
      fields: [this.featureCategoryEntity.id]
    }));

    if (featuresCategories.length > 0) {
      return featuresCategories;
    }
  }

  async getReraStages() {
    const reraStageIds = await this.client.request(readItems(this.reraStageEntity.tableName, {
      fields: [this.reraStageEntity.id]
    }));

    if (reraStageIds.length > 0) {
      return reraStageIds;
    }
  }

  private featureDataMapper(data: any) {
    return {
      [this.featureEntity.name]: data.featureName,
      [this.featureEntity.featureList]: data.featureList,
      [this.featureEntity.image]: data.featureImageId,
      [this.featureEntity.featuresCategories]: data.featureCategoryId,
      [this.featureEntity.keyHighlight]: data.keyHighlight
    };
  }

  async createFeature(data: {
    featureName: string,
    featureList: string[],
    featureImageId: string,
    featureCategoryId: any,
    keyHighlight: boolean
  }) {
    const featureCategoryToSave = this.featureDataMapper(data);
    const featureCategory: { id?: string } = await this.client.request(createItem(
      this.featureCategoryEntity.tableName,
      featureCategoryToSave
    ));

    return featureCategory?.id;
  }

  async getProjectsByName(projectNames: any[]) {
    const projects = await this.client.request(readItems(this.projectEntity.tableName, {
      fields: [this.projectEntity.name],
      filter: {
        [this.projectEntity.name]: {
          _in: projectNames
        }
      }
    }));

    return this.transformer.process(projects);
  }

  async getProjectByCoordinates(wkbLocation: string) {
    const project = await this.client.request(readItems(this.projectEntity.tableName, {
      fields: [this.projectEntity.location],
      filter: {
        [this.projectEntity.location]: {
          _eq: wkbLocation
        }
      }
    }));

    return this.transformer.process(project);
  }

  private projectDataMapper(data: any) {
    return {
      [this.projectEntity.name]: data?.name,
      [this.projectEntity.projectWebsite]: data?.website,
      [this.projectEntity.developers]: data?.developer,
      [this.projectEntity.propertyPicture]: data?.propertyPictureId,
      [this.projectEntity.description]: data?.description,
      [this.projectEntity.location]: {
        type: 'Point',
        coordinates: [data?.coordinates[1], data?.coordinates[0]]
      },
      [this.projectEntity.numberOfTowers]: data?.numberOfTowers,
      [this.projectEntity.numberOfUnits]: data?.numberOfUnits,
      [this.projectEntity.numberOfUnitsSold]: data?.numberOfUnitsSold,
      [this.projectEntity.contactDetails]: data?.contactDetailsId,
      [this.projectEntity.brochure]: data?.brochureId,
      [this.projectEntity.minimumPrice]: data?.minimumPrice,
      [this.projectEntity.maximumPrice]: data?.maximumPrice,
      [this.projectEntity.microMarkets]: data?.microMarketId.id,
      [this.projectEntity.seoProperties]: data?.seoPropertiesId,
      [this.projectEntity.addresses]: data?.addressId,
      [this.projectEntity.projectPlan]: data?.projectPlanImageId,
      [this.projectEntity.mostSearched]: data?.mostSearched,
      [this.projectEntity.featured]: data?.featured,
      [this.projectEntity.shortDescription]: data?.shortDescription,
      [this.projectEntity.projectConfigurations]: [data?.projectConfigurations],
      [this.projectEntity.parking]: [data?.parking],
      [this.projectEntity.propertyType]: data?.propertyType,
      [this.projectEntity.hidePrice]: data?.hidePrice
    };
  }

  async createProject(data: {
    name: string,
    address: string,
    website: string,
    developer: string,
    propertyPictureId: string,
    images: string[],
    description: string,
    coordinates: number[],
    launchStatus: string,
    numberOfTowers: number,
    numberOfUnits: number,
    numberOfUnitsSold: number,
    contactDetailsId: number,
    brochureId: string,
    minimumPrice: number,
    maximumPrice: number,
    primaryAreaId: number,
    microMarketId: string,
    seoPropertiesId: number,
    addressId: string,
    projectPlanImageId: string,
    mostSearched: boolean,
    featured: boolean,
    featureIds: string[],
    categoryIds: string[],
    shortDescription: string,
    projectConfigurations: string[],
    parking: string[],
    otherContactDetailsId: string,
    projectType: string,
    hidePrice: boolean
  }) {
    const dataToSave = this.projectDataMapper(data);
    const project: { id?: string } = await this.client.request(createItem(
      this.projectEntity.tableName,
      dataToSave
    ));

    return project?.id;
  }

  async createProjectImages(projectId: string, imageIds: string[]) {
    const projectImages = imageIds.map((imageId) => ({
      [this.projectFilesEntity.projectId]: projectId,
      [this.projectFilesEntity.directusFileId]: imageId
    }));

    await this.client.request(createItems(this.projectFilesEntity.tableName, projectImages));
  }

  async createFloorPlans(projectId: string, floorPlanIds: string[]) {
    const projectFloorPlans = floorPlanIds.map((floorPlanId) => ({
      [this.projectFilesEntity.projectId]: projectId,
      [this.projectFilesEntity.directusFileId]: floorPlanId
    }));

    await this.client.request(createItems(this.projectFilesFloorPlanEntity.tableName, projectFloorPlans));
  }

  async createOtherContactDetails(projectId: string, otherContactDetailsId: string[]) {
    await this.client.request(createItem(this.otherContactDetailsEntity.tableName, {
      [this.projectFilesEntity.projectId]: projectId,
      [this.projectFilesEntity.directusFileId]: otherContactDetailsId
    }));
  }

  async createProjectFeatures(projectId: string, featureIds: string[]) {
    const projectFeatures = featureIds.map((featureId) => ({
      [this.projectFeatureEntity.project]: projectId,
      [this.projectFeatureEntity.feature]: featureId
    }));

    await this.client.request(createItems(this.projectFeatureEntity.tableName, projectFeatures));
  }

  async createProjectCategories(projectId: string, categoryIds: string[]) {
    const projectCategories = categoryIds.map((categoryId) => ({
      [this.projectCategoryEntity.project]: projectId,
      [this.projectCategoryEntity.category]: categoryId
    }));
    await this.client.request(createItems(this.projectCategoryEntity.tableName, projectCategories));
  }

  private wingDataMapper(data: any) {
    return {
      [this.wingEntity.name]: data.name,
      [this.wingEntity.totalFloors]: data.totalFloors,
      [this.wingEntity.completionDate]: data.completionDate,
      [this.wingEntity.floorPlan]: data.floorPlanId,
      [this.wingEntity.reraRegistrationNumber]: data.reraRegistrationNumber,
      [this.wingEntity.reraStage]: data.reraStage,
      [this.wingEntity.projects]: data.projectId,
      [this.wingEntity.addresses]: data.addressId,
      [this.wingEntity.projectStatus]: data.projectStatus
    };
  }

  async createWing(data: any) {
    const dataToSave = this.wingDataMapper(data);
    const wing: { id?: string } = await this.client.request(createItem(
      this.wingEntity.tableName,
      dataToSave
    ));

    return wing?.id;
  }

  private configurationDataMapper(data: any) {
    return {
      [this.configurationEntity.name]: data?.name,
      [this.configurationEntity.carpetArea]: data?.carpetArea,
      [this.configurationEntity.areaUnit]: data?.areaUnit,
      [this.configurationEntity.availableUnit]: data?.unitsAvailable,
      [this.configurationEntity.soldUnit]: data?.unitsSold,
      [this.configurationEntity.houseType]: data?.houseType,
      [this.configurationEntity.bedrooms]: data?.bedrooms,
      [this.configurationEntity.bathrooms]: data?.bathrooms,
      [this.configurationEntity.balconies]: data?.balconies,
      [this.configurationEntity.floorPlan]: data?.floorPlanId,
      [this.configurationEntity.parkings]: data?.parkings,
      [this.configurationEntity.floorRange]: data?.floorRange,
      [this.configurationEntity.startingPrice]: data?.startingPrice,
      [this.configurationEntity.maximumPrice]: data?.maximumPrice,
      [this.configurationEntity.launchStatus]: data?.launchStatus
    };
  }

  async createConfiguration(data: any) {
    const dataToSave = this.configurationDataMapper(data);
    const configuration: { id?: string } = await this.client.request(createItem(
      this.configurationEntity.tableName,
      dataToSave
    ));

    return configuration?.id;
  }

  private wingConfigurationDataMapper(data: any) {
    return {
      [this.wingConfigurationEntity.wings]: data.wingId,
      [this.wingConfigurationEntity.configurations]: data.configurationId
    };
  }

  async createWingConfiguration(data: any) {
    const dataToSave = this.wingConfigurationDataMapper(data);
    const wingConfiguration: { id?: string } = await this.client.request(createItem(
      this.wingConfigurationEntity.tableName,
      dataToSave
    ));

    return wingConfiguration?.id;
  }

  async insertReraStages() {
    const reraStagesToSave = reraStagesMaterValues.map((reraStage, index) => ({
      [this.reraStageEntity.name]: reraStage,
      [this.reraStageEntity.progressLevel]: (index + 1) * 10
    }));

    await this.client.request(createItems(
      this.reraStageEntity.tableName,
      reraStagesToSave
    ));
  }

  async insertFeaturesCategories() {
    const featuresCategoriesToSave = Object.entries(featuresCategoriesMasterValues)
      .map(([key, value]) => ({
        [this.featureCategoryEntity.name]: key,
        [this.featureCategoryEntity.label]: value
      }));

    await this.client.request(createItems(
      this.featureCategoryEntity.tableName,
      featuresCategoriesToSave
    ));
  }
}
