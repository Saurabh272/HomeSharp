import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { faker } from '@faker-js/faker';
import { SeederRepository } from '../repositories/seeder.repository';
import { SeederGenerator } from '../generators/seeder.generator';
import { SeederEntity } from '../entities/seeder.entities';
import uploadConfig from '../../app/config/upload.config';

@Injectable()
export class SeederService {
  private readonly logger = new Logger(SeederService.name);

  constructor(
    private readonly seederRepository: SeederRepository,
    private readonly seederGenerator: SeederGenerator,
    private readonly seederEntity: SeederEntity
  ) {}

  async getRandomId(data: any) {
    const resultId = data.data.map((item: any) => item.id);
    const randomIndex = Math.floor(Math.random() * resultId.length);
    return resultId[randomIndex];
  }

  async uploadImage(file: any, folderName: any) {
    try {
      const { path } = file.request;
      const originalname = path.split('/').pop();
      const getFolderId = await this.seederRepository.getFolderIdFromRoot(folderName);
      const form = new FormData();
      const stream = new Blob([file?.data], { type: uploadConfig.imageJpgMimeType });
      form.append('folder', getFolderId);
      form.append('file', stream, originalname);

      return await this.seederRepository.uploadAttachment(form);
    } catch (error) {
      throw new Error(error);
    }
  }

  async generateDataForRelationManagers() {
    try {
      const [file, microMarket] = await Promise.all([
        this.seederGenerator.urlResponse(faker.image.urlLoremFlickr({ category: 'business' })),
        this.seederRepository.getAll(this.seederEntity.microMarkets)
      ]);

      const [attachmentId, randomMicroMarketId] = await Promise.all([
        this.uploadImage(file, this.seederEntity.relationshipManagers),
        this.getRandomId(microMarket)
      ]);

      return await this.seederGenerator.generateRandomRM(attachmentId, randomMicroMarketId);
    } catch (error) {
      this.logger.error(error);
      return error;
    }
  }

  async generateDataForCustomers() {
    try {
      const [file, relationshipManagers] = await Promise.all([
        this.seederGenerator.urlResponse(faker.image.urlLoremFlickr({ category: 'business' })),
        this.seederRepository.getAll(this.seederEntity.relationshipManagers)
      ]);

      const attachmentId = await this.uploadImage(file, this.seederEntity.customers);
      const randomRelationshipManagerId = await this.getRandomId(relationshipManagers);
      return await this.seederGenerator.generateRandomCustomer(attachmentId, randomRelationshipManagerId);
    } catch (error) {
      this.logger.error(error);
      return error;
    }
  }

  async generateDataForFeedback() {
    try {
      const file = await this.seederGenerator.urlResponse(faker.image.urlLoremFlickr({ category: 'business' }));
      const attachmentId = await this.uploadImage(file, this.seederEntity.feedback);
      return await this.seederGenerator.generateRandomFeedback(attachmentId);
    } catch (error) {
      this.logger.error(error);
      return error;
    }
  }

  async generateDataForSupportRequest() {
    try {
      const file = await this.seederGenerator.urlResponse(faker.image.urlLoremFlickr({ category: 'business' }));
      const attachmentId = await this.uploadImage(file, this.seederEntity.supportRequest);
      return await this.seederGenerator.generateRandomSupportRequest(attachmentId);
    } catch (error) {
      this.logger.error(error);
      return error;
    }
  }

  async generateDataForAddress() {
    return this.seederGenerator.generateRandomAddresses();
  }

  async generateDataForFeatureCategory() {
    return this.seederGenerator.generateRandomFeatureCategory();
  }

  async generateDataForFeature() {
    const [file, featuresCategories] = await Promise.all([
      this.seederGenerator.urlResponse(faker.image.urlLoremFlickr({ category: 'business' })),
      this.seederRepository.getAll(this.seederEntity.featuresCategories)
    ]);

    const imageId = await this.uploadImage(file, this.seederEntity.features);
    const featuresCategoriesId = await this.getRandomId(featuresCategories);
    return this.seederGenerator.generateRandomFeature(imageId, featuresCategoriesId);
  }

  async generateDataForWishlistProjects() {
    const [wishlists, projects] = await Promise.all([
      this.seederRepository.getAll(this.seederEntity.wishlist),
      this.seederRepository.getAll(this.seederEntity.projects)
    ]);

    return {
      [this.seederEntity.wishlistId]: await this.getRandomId(wishlists),
      [this.seederEntity.wishlistProjectId]: await this.getRandomId(projects)
    };
  }

  async generateDataForContactDetails() {
    return this.seederGenerator.generateRandomContactDetails();
  }

  async generateDataForReraStage() {
    return this.seederGenerator.generateRandomReraStage();
  }

  async generateDataForInquiry() {
    return this.seederGenerator.generateRandomInquiry();
  }

  async generateDataForCustomerAttempts() {
    return this.seederGenerator.generateRandomCustomerAttempt();
  }

  async generateDataForSeoProperties(slug: any) {
    const file = await this.seederGenerator.urlResponse(faker.image.urlLoremFlickr({ category: 'business' }));
    const attachmentId = await this.uploadImage(file, this.seederEntity.seoProperties);

    return this.seederGenerator.generateRandomSeoProperties(attachmentId, slug);
  }

  async generateDataForDevelopers() {
    try {
      const [file, addresses, contactDetails] = await Promise.all([
        this.seederGenerator.urlResponse(faker.image.urlLoremFlickr({ category: 'business' })),
        this.seederRepository.getAll(this.seederEntity.addresses),
        this.seederRepository.getAll(this.seederEntity.contactDetails)
      ]);

      const logoId = await this.uploadImage(file, this.seederEntity.developersFolder);
      const [randomAddressesId, randomContactDetailsId] = await Promise.all([
        this.getRandomId(addresses),
        this.getRandomId(contactDetails)
      ]);

      const randomData: any = await this.seederGenerator.generateRandomDevelopers(
        logoId,
        randomAddressesId,
        randomContactDetailsId
      );

      randomData.seo_properties = await this.seedSeoProperties(randomData?.Name);

      return await this.seederRepository.createOne(this.seederEntity.developers, randomData);
    } catch (error) {
      this.logger.error(error);
      return error;
    }
  }

  async generateDataForWishlists() {
    const customers = await this.seederRepository.getAll(this.seederEntity.customers);
    const customerId = this.getRandomId(customers);
    if (!customerId) {
      return {
        message: 'Please create a customer'
      };
    }

    return this.seederGenerator.generateRandomWishlist(customerId);
  }

  async generateDataForCategories() {
    const file = await this.seederGenerator.urlResponse(faker.image.urlLoremFlickr({ category: 'business' }));
    const imageId = await this.uploadImage(file, this.seederEntity.categoriesFile);
    const randomDataForCategory: any = await this.seederGenerator.generateRandomCategories(imageId);
    randomDataForCategory.seo_properties = await this.seedSeoProperties(randomDataForCategory?.name);

    return this.seederRepository.createOne(this.seederEntity.categories, randomDataForCategory);
  }

  async seedRelationManagers(request: any) {
    const dataArray = await Promise.all(
      Array.from({ length: request?.noOfDataToBeSeed }, () => this.generateDataForRelationManagers())
    );
    return this.seederRepository.create(this.seederEntity.relationshipManagers, dataArray);
  }

  async seedCustomers(request: any) {
    const dataArray = await Promise.all(
      Array.from({ length: request?.noOfDataToBeSeed }, () => this.generateDataForCustomers())
    );
    return this.seederRepository.create(this.seederEntity.customers, dataArray);
  }

  async seedFeedback(request: any) {
    const dataArray = await Promise.all(
      Array.from({ length: request?.noOfDataToBeSeed }, () => this.generateDataForFeedback())
    );
    return this.seederRepository.create(this.seederEntity.feedback, dataArray);
  }

  async seedSupportRequest(request: any) {
    const dataArray = await Promise.all(
      Array.from({ length: request?.noOfDataToBeSeed }, () => this.generateDataForSupportRequest())
    );

    return this.seederRepository.create(this.seederEntity.supportRequest, dataArray);
  }

  async seedCustomerAttempts(request: any) {
    const dataArray = await Promise.all(
      Array.from({ length: request?.noOfDataToBeSeed }, () => this.generateDataForCustomerAttempts())
    );

    return this.seederRepository.create(this.seederEntity.customerAttempts, dataArray);
  }

  async seedInquiries(request: any) {
    const dataArray = await Promise.all(
      Array.from({ length: request?.noOfDataToBeSeed }, () => this.generateDataForInquiry())
    );

    return this.seederRepository.create(this.seederEntity.inquiries, dataArray);
  }

  async seedSeoProperties(slug: any) {
    let seoPropertiesData: any;
    try {
      seoPropertiesData = await this.generateDataForSeoProperties(slug);
      const result: any = await this.seederRepository.createOne(this.seederEntity.seoProperties, seoPropertiesData);
      return result?.id;
    } catch (error) {
      this.logger.log('seedSeoProperties', error);
      if (
        error.errors
        && error.errors.length
        && error.errors[0].message === 'Field "slug" has to be unique.'
      ) {
        seoPropertiesData.slug = `${seoPropertiesData.slug}-${Math.round((new Date()).getTime() / 1000)}`;
        const result: any = await this.seederRepository.createOne(this.seederEntity.seoProperties, seoPropertiesData);
        return result?.id;
      }
      return error;
    }
  }

  async seedAddresses(request: any) {
    const dataArray = await Promise.all(
      Array.from({ length: request?.noOfDataToBeSeed }, () => this.generateDataForAddress())
    );

    return this.seederRepository.create(this.seederEntity.addresses, dataArray);
  }

  async seedContactDetails(request: any) {
    const dataArray = await Promise.all(
      Array.from({ length: request?.noOfDataToBeSeed }, () => this.generateDataForContactDetails())
    );

    return this.seederRepository.create(this.seederEntity.contactDetails, dataArray);
  }

  async seedDevelopers(request: any) {
    return Promise.all(
      Array.from({ length: request?.noOfDataToBeSeed }, () => this.generateDataForDevelopers())
    );
  }

  async seedFeaturesCategory(request: any) {
    const dataArray = await Promise.all(
      Array.from({ length: request?.noOfDataToBeSeed }, () => this.generateDataForFeatureCategory())
    );

    return this.seederRepository.create(this.seederEntity.featuresCategories, dataArray);
  }

  async seedFeatures(request: any) {
    const dataArray = await Promise.all(
      Array.from({ length: request?.noOfDataToBeSeed }, () => this.generateDataForFeature())
    );

    return this.seederRepository.create(this.seederEntity.features, dataArray);
  }

  async seedReraStage() {
    const reraStage = await this.seederRepository.getAll(this.seederEntity.reraStage);
    if (reraStage?.length < 10) {
      const dataArray = await Promise.all(
        Array.from({ length: 10 - reraStage.length }, () => this.generateDataForReraStage())
      );

      return this.seederRepository.create(this.seederEntity.reraStage, dataArray);
    }
  }

  async seedCategories(request: any) {
    await Promise.all(
      Array.from({ length: request?.noOfDataToBeSeed }, () => this.generateDataForCategories())
    );
  }

  async seedWishlists(request: any) {
    const dataArray = await Promise.all(
      Array.from({ length: request?.noOfDataToBeSeed }, () => this.generateDataForWishlists())
    );

    return this.seederRepository.create(this.seederEntity.wishlist, dataArray);
  }

  async seedWishlistProjects(request: any) {
    const dataArray = await Promise.all(
      Array.from({ length: request?.noOfDataToBeSeed }, () => this.generateDataForWishlistProjects())
    );

    return this.seederRepository.create(this.seederEntity.wishlistProjects, dataArray);
  }

  async seedAllCollections(request: any) {
    await Promise.all([
      this.seedCustomers(request),
      this.seedCustomerAttempts(request),
      this.seedRelationManagers(request),
      this.seedSupportRequest(request)
    ]);
    await this.createProject(request);
    await this.seedWishlists(request);
    await this.seedWishlistProjects(request);
  }

  async getRandomMicroMarket(microMarkets: any) {
    if (microMarkets?.data?.length <= 0) {
      throw new BadRequestException('microMarket should not be empty');
    }
    const randomIndex = Math.floor(Math.random() * microMarkets.data.length);

    return microMarkets?.data[randomIndex]?.micro_market_name;
  }

  async generateDataForProjects(request: any) {
    let { microMarket } = request;
    const { developer, wings } = request;
    if (!microMarket) {
      const getMicroMarkets = await this.seederRepository.getAll(this.seederEntity.microMarkets);
      microMarket = await this.getRandomMicroMarket(getMicroMarkets);
    }

    return this.seederGenerator.generateRandomProjects(microMarket, developer, wings);
  }

  async createProject(request: any) {
    return Promise.all(
      Array.from({ length: request?.noOfDataToBeSeed }, () => this.generateDataForProjects(request))
    );
  }
}
