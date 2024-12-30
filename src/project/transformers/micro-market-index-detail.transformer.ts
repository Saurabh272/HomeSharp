import { Injectable } from '@nestjs/common';
import { ITransformer } from '../../app/interfaces/transformer.interface';
import config from '../../app/config';
import { MicroMarketIndexDetailType } from '../types/micro-market-index-detail.type';

@Injectable()
export class MicroMarketIndexDetailTransformer implements ITransformer {
  process(data: any): Partial<MicroMarketIndexDetailType> {
    const transformedMicroMarket = {
      microMarketId: data.microMarketId,
      name: data.microMarketName,
      slug: data.microMarketSlug,
      isDefault: data.default ? 'true' : 'false',
      coordinates: [data.latitude, data.longitude],
      thumbnail: data.microMarketThumbnail ? this.getFileUrl(data.microMarketThumbnail).url : config.MAP_ICON_URL
    };
    return Object.entries(transformedMicroMarket).reduce((acc, [key, value]) => {
      if (value) {
        acc[key] = value;
      }
      return acc;
    }, {});
  }

  getFileUrl(fileName: string, alt?: string) {
    if (fileName?.length) {
      return {
        url: `${config.DIRECTUS_URL}/assets/${fileName}`,
        alt
      };
    }
    return {
      url: '',
      alt: ''
    };
  }
}
