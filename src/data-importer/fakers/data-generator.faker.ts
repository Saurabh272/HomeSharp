import { Injectable } from '@nestjs/common';
import { en, Faker, faker } from '@faker-js/faker';
import { featureList } from '../config/feature-list.config';

const customFaker = new Faker({ locale: en });

@Injectable()
export class DataGenerator {
  getRandomNumber(min: number, max: number) {
    return faker.number.int({ min, max });
  }

  generateFakeCompanyName() {
    return customFaker.company.name();
  }

  getRandomDeveloperImageType() {
    return faker.helpers.arrayElement([
      'buildings',
      'architecture',
      'apartment building',
      'luxury apartment building'
    ]);
  }

  getRandomProjectImageType() {
    return faker.helpers.arrayElement([
      'apartment',
      'estate',
      'luxury apartment',
      'luxury apartment building'
    ]);
  }

  getRandomFloorPlanImageType() {
    return faker.helpers.arrayElement([
      'floor plan',
      'blueprint'
    ]);
  }

  getRandomFeature() {
    return faker.helpers.arrayElement(featureList);
  }

  generateFakeFeatureList(numberOfFeatures: number) {
    const strings = [];

    for (let i = 0; i < numberOfFeatures; i += 1) {
      const randomString = faker.lorem.words();
      strings.push(randomString);
    }

    return strings;
  }

  generateFakeWebsite(companyName: string) {
    const domain = faker.helpers.arrayElement(['com', 'net', 'org']);
    return `https://www.${companyName}.${domain}`;
  }

  generateFakeAddress() {
    const addressLine1 = customFaker.location.streetAddress();
    const addressLine2 = customFaker.location.secondaryAddress();
    const city = 'Mumbai';
    const state = 'Maharashtra';
    const country = 'India';
    const pinCode = faker.location.zipCode({
      format: '400###'
    });

    return {
      addressLine1,
      addressLine2,
      city,
      state,
      country,
      pinCode,
      completeAddress: `${addressLine1}, ${addressLine2}, ${city}, ${state}, ${country} - ${pinCode}`
    };
  }

  generateFakeContactDetails(website: string) {
    return {
      website,
      phone: this.getRandomNumber(6, 9).toString() + faker.phone.number('#########'),
      email: faker.internet.email()
    };
  }

  generateFakeCoordinates() {
    return faker.location.nearbyGPSCoordinate({
      origin: [19.0760228936447, 72.87757355623036],
      radius: 50
    });
  }

  generateFakeSummary() {
    return faker.lorem.paragraph({ min: 1, max: 3 });
  }

  generateFakeDescription() {
    return faker.lorem.paragraphs({ min: 3, max: 5 });
  }

  getRandomProjectLaunchStatus() {
    return faker.helpers.arrayElement([
      'OC_RECEIVED',
      'UNDER_CONSTRUCTION',
      'READY_TO_MOVE'
    ]);
  }

  getRandomId(ids: any[]) {
    return faker.helpers.arrayElement(ids);
  }

  generateFakeMostSearched() {
    return faker.datatype.boolean(0.25);
  }

  generateFakeFeatured() {
    return faker.datatype.boolean(0.10);
  }

  generateFakeCategories(numberOfCategories: number) {
    const categories = [];
    for (let i = 0; i < numberOfCategories; i += 1) {
      categories.push(faker.commerce.department());
    }
    return categories;
  }

  getRandomWingName() {
    return faker.helpers.arrayElement(['Tower', 'Block', 'Building', 'Wing']);
  }

  generateFakeDate() {
    return faker.date.soon();
  }

  generateFakeReraRegistrationNumber() {
    const prefix = 'TEST';
    const randomNumber = faker.number.int({ min: 10000, max: 99999 });
    const suffix = faker.number.int({ min: 10000, max: 99999 });

    return `${prefix}${randomNumber}/${suffix}`;
  }

  generateFakeDeveloperReraRegistrationNumber() {
    const prefix = 'TEST';
    const suffix = faker.number.int({ min: 1000, max: 9999 });

    return `${prefix}${suffix}`;
  }

  getRandomCarpetArea(min: number, max: number) {
    return faker.number.float({ min, max, precision: 2 });
  }

  generateRandomShortDescription() {
    return faker.lorem.words({ min: 2, max: 5 });
  }

  generateRandomProjectConfigurations() {
    return faker.helpers.arrayElement([
      '1BHK',
      '2BHK',
      '3BHK',
      '4BHK',
      '5BHK',
      '6BHK+',
      'Jodi Options'
    ]);
  }

  generateRandomParking() {
    return faker.helpers.arrayElement([
      'Conventional',
      'Puzzle',
      'Stack',
      'Tandem',
      'Tower'
    ]);
  }

  getRandomFloorPlans() {
    return faker.helpers.arrayElement([
      'Higher',
      'Lower'
    ]);
  }

  getRandomPropertyType() {
    return faker.helpers.arrayElement([
      'NEW',
      'RESALE'
    ]);
  }
}
