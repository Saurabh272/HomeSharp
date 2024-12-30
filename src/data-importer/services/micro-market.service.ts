import { Injectable, Logger } from '@nestjs/common';
import { DataGenerator } from '../fakers/data-generator.faker';
import { DataImporterRepository } from '../repositories/data-importer.repository';
import { MicroMarket } from '../interfaces/micro-market.interface';
import { DataImporterUtil } from '../utils/data-importer.util';

@Injectable()
export class MicroMarketService {
  private readonly logger = new Logger(MicroMarketService.name);

  constructor(
    private readonly dataGenerator: DataGenerator,
    private readonly dataImporterRepository: DataImporterRepository,
    private readonly dataImporterUtil: DataImporterUtil
  ) {}

  findUniqueMicroMarket(data: MicroMarket[]) {
    const uniqueMicroMarkets = new Map();

    data.forEach((row: any) => {
      const { micromarket } = row;
      let { micromarketlatitude, micromarketlongitude } = row;

      if (!uniqueMicroMarkets.has(micromarket)) {
        if (!micromarketlatitude || !micromarketlongitude) {
          const [fakeLatitude, fakeLongitude] = this.dataGenerator.generateFakeCoordinates() || [null, null];

          micromarketlatitude = micromarketlatitude || fakeLatitude;
          micromarketlongitude = micromarketlongitude || fakeLongitude;
        }
        uniqueMicroMarkets.set(micromarket, {
          latitude: micromarketlatitude,
          longitude: micromarketlongitude
        });
      }
    });

    return Array.from(uniqueMicroMarkets, ([micromarket, coordinates]) => ({
      microMarket: micromarket,
      ...coordinates
    }));
  }

  async addSeoProperties(microMarkets: { microMarket: string; latitude: number; longitude: number }[]) {
    const addSeoPropertiesPromises = Array.from(microMarkets, async (microMarket) => {
      this.logger.log(`Creating SEO Properties for ${microMarket.microMarket}`);
      const slug = this.dataImporterUtil.getSlug(microMarket.microMarket);
      this.logger.log(`Slug: ${slug}`);
      const seoPropertyId = await this.dataImporterUtil.createSeoProperties({ slug });

      return {
        ...microMarket,
        seoPropertyId
      };
    });

    return Promise.all(addSeoPropertiesPromises);
  }

  async processBulk(data: MicroMarket[]) {
    this.logger.log('Creating Micro Market...');
    const validMicroMarkets = data.filter((market) => market.micromarket !== null);

    if (!validMicroMarkets.length) {
      this.logger.log('No valid micro markets to import.');

      return {
        message: 'No valid micro markets to import.'
      };
    }
    const uniqueMicroMarkets = this.findUniqueMicroMarket(validMicroMarkets);
    const completeMicroMarkets = await this.addSeoProperties(uniqueMicroMarkets);
    const result = await this.dataImporterRepository.createMicroMarkets(completeMicroMarkets);

    if (result && result.length) {
      this.logger.log('Micro Market Imported!');
      this.logger.log(JSON.stringify(result));

      return {
        message: 'Micro Markets Imported Successfully!'
      };
    }

    return {
      message: 'No new micro markets to import.'
    };
  }

  async createMicroMarket(microMarket: any, coordinates?: number[]) {
    const [latitude, longitude] = coordinates || this.dataGenerator.generateFakeCoordinates();
    const microMarketWithCoordinates = {
      microMarket,
      latitude,
      longitude
    };
    const completeMicroMarket = await this.addSeoProperties([microMarketWithCoordinates]);

    return this.dataImporterRepository.createMicroMarket(completeMicroMarket[0]);
  }

  async process(microMarket: string, coordinates?: { latitude: number; longitude: number }) {
    if (!microMarket) {
      return null;
    }
    const result: { id?: string } = await this.dataImporterRepository.getMicroMarket(microMarket);

    if (result && result.id) {
      this.logger.log('Micro Market already exists!');
      return result;
    }
    this.logger.log('Creating Micro Market...');

    return this.createMicroMarket(
      microMarket,
      coordinates ? [coordinates.latitude, coordinates.longitude] : null
    );
  }
}
