import { Injectable } from '@nestjs/common';
import { ITransformer } from '../../app/interfaces/transformer.interface';
import config from '../../app/config';
import { DeveloperIndexDetailType } from '../types/developer-index-detail.type';

@Injectable()
export class DeveloperIndexDetailTransformer implements ITransformer {
  process(data: any): Partial<DeveloperIndexDetailType> {
    const address: string = [
      data.developerAddressLine1,
      data.developerAddressLine2,
      data.developerAddressCity,
      data.developerAddressState,
      data.developerAddressPinCode
    ]
      .filter(Boolean)
      .join(',');
    const transformedDeveloper = {
      developerId: data.developerId,
      name: data.developerName,
      address,
      slug: data.developerSlug,
      thumbnail: this.getFileUrl(data.developerLogo, data.developerName)?.url,
      developerType: data?.developerType
    };
    return Object.entries(transformedDeveloper).reduce((acc, [key, value]) => {
      if (value) {
        acc[key] = value;
      }
      return acc;
    }, {});
  }

  getFileUrl(image: string, alt: string) {
    if (image?.length > 0) {
      return {
        url: `${config.DIRECTUS_URL}/assets/${image}`,
        alt
      };
    }
    return null;
  }
}
