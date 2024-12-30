import { Injectable } from '@nestjs/common';
import { faker } from '@faker-js/faker';
import axios from 'axios';
import { reraStagesMaterValues } from '../../data-importer/config/rera-stage.config';

@Injectable()
export class SeederGenerator {
  async urlResponse(url: string) {
    return axios.get(url, {
      responseType: 'arraybuffer'
    });
  }

  async generateRandomRM(id: string, randomMicroMarketId: string) {
    return {
      profile_picture: id,
      date_created: faker.date.past(),
      date_updated: faker.date.recent(),
      email: faker.internet.email(),
      name: faker.internet.userName(),
      phone_number: faker.phone.number('9#########'),
      micro_markets: randomMicroMarketId
    };
  }

  async generateRandomCustomer(id: string, randomMicroMarketId: string) {
    return {
      image: id,
      date_created: faker.date.past(),
      date_updated: faker.date.recent(),
      email: faker.internet.email(),
      name: faker.internet.userName(),
      phone_number: faker.phone.number('9#########'),
      relationship_managers: randomMicroMarketId
    };
  }

  async generateRandomFeedback(id: string) {
    return {
      attachment: id,
      date_created: faker.date.past(),
      date_updated: faker.date.recent(),
      feedback_category: faker.lorem.sentence(),
      issue_description: faker.lorem.paragraph(),
      subject: faker.lorem.sentence()
    };
  }

  async generateRandomSupportRequest(id: string) {
    return {
      attachment: id,
      date_created: faker.date.past(),
      date_updated: faker.date.recent(),
      name: faker.internet.userName(),
      issue_description: faker.lorem.paragraph(),
      subject: faker.lorem.sentence()
    };
  }

  async generateRandomCustomerAttempt() {
    return {
      date_created: faker.date.past(),
      date_updated: faker.date.recent(),
      phone_number: faker.phone.number('9#########'),
      email: faker.internet.email(),
      otp: faker.string.numeric({ length: 6 }),
      resend_attempts: faker.string.numeric({ length: { min: 1, max: 1 } }),
      otp_attempts: faker.string.numeric({ length: { min: 1, max: 1 } }),
      otp_expires_at: faker.date.future()
    };
  }

  async generateRandomInquiry() {
    return {
      date_created: faker.date.past(),
      date_updated: faker.date.recent(),
      name: faker.internet.userName(),
      email: faker.internet.email(),
      message: faker.lorem.paragraph(),
      subject: faker.lorem.sentence(),
      project_budget: faker.commerce.price({ min: 5000000, max: 100000000, symbol: '₹' })
    };
  }

  async generateRandomSeoProperties(attachmentId: string, slug: string) {
    return {
      date_created: faker.date.past(),
      date_updated: faker.date.recent(),
      slug: slug.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, ''),
      title: faker.lorem.words(),
      keywords: faker.lorem.words(),
      canonical_url: faker.internet.url(),
      image: attachmentId,
      summary: faker.lorem.sentence({ min: 100, max: 150 }),
      alt: faker.lorem.words()
    };
  }

  async generateRandomAddresses() {
    return {
      date_created: faker.date.past(),
      date_updated: faker.date.recent(),
      city: faker.location.city(),
      line_1: faker.location.buildingNumber(),
      line_2: faker.location.street(),
      pin_code: faker.location.zipCode('2#####')
    };
  }

  async generateRandomContactDetails() {
    return {
      date_created: faker.date.past(),
      date_updated: faker.date.recent(),
      Email: faker.internet.email(),
      Fax: faker.phone.number('9#########'),
      Phone: faker.phone.number('9#########'),
      Website: faker.internet.url()
    };
  }

  async generateRandomReraStage() {
    return {
      date_created: faker.date.past(),
      date_updated: faker.date.recent(),
      name: faker.helpers.arrayElement(reraStagesMaterValues),
      progress_level: faker.number.int({ min: 10, max: 100 })
    };
  }

  async generateRandomDevelopers(logoId: string, addressId: string, contactDetailsId: string) {
    return {
      Logo: logoId,
      date_created: faker.date.past(),
      date_updated: faker.date.recent(),
      Name: faker.company.name(),
      developer_website: faker.internet.url(),
      Sales_Office_Address: `${faker.location
        .buildingNumber()} ${faker.location
        .streetAddress()} ${faker.location
        .city()}`,
      Corporate_Office_Address: `${faker.location
        .buildingNumber()} ${faker.location
        .streetAddress()} ${faker.location
        .city()}`,
      addresses: addressId,
      Contact_Details: contactDetailsId
    };
  }

  async generateRandomPrimaryArea() {
    return {
      name: faker.location.city()
    };
  }

  async generateRandomWishlist(customerId: any) {
    return {
      date_created: faker.date.past(),
      date_updated: faker.date.recent(),
      name: faker.commerce.department(),
      customer_id: customerId
    };
  }

  async generateRandomCategories(imageId: string) {
    return {
      name: faker.company.name()
        .replace(/[^\w\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .replace(/\s+/g, '-'),
      image: imageId
    };
  }

  async generateRandomFeatureCategory() {
    return {
      category_label: faker.commerce.department(),
      category_name: faker.commerce.department()
    };
  }

  async generateRandomFeature(imageId: string, featuresCategoriesId: any) {
    return {
      feature_name: faker.commerce.department(),
      feature_list: [faker.commerce.department(), faker.commerce.department()],
      image: imageId,
      features_categories: featuresCategoriesId,
      key_highlight: faker.datatype.boolean()
    };
  }

  async generateRandomProjects(microMarket: any, developer: string, wings: any) {
    return {
      projectname: faker.company.name(),
      developer: developer || faker.company.name(),
      micromarket: microMarket,
      wings
    };
  }
}
