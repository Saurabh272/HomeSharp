import { Injectable } from '@nestjs/common';
import config from '../../app/config';
import { Categories, Category } from '../types/category.type';
import { ITransformer } from '../../app/interfaces/transformer.interface';

@Injectable()
export class CategoryTransformer implements ITransformer {
  process(data: any) {
    if (!data.length) {
      return [];
    }
    const categories: Categories = {
      categories: data.map((item: {
        name: string, slug: string, image: string, title: string, description: string
      }): Category => ({
        name: item?.name || '',
        slug: item?.slug || '',
        title: item?.title || '',
        description: item?.description || '',
        image: this.getFileUrl(item?.image, item?.name)
      }))
    };
    return categories;
  }

  getFileUrl(image: string, alt?: string) {
    if (image?.length) {
      return {
        url: `${config.DIRECTUS_URL}/assets/${image}`,
        alt
      };
    }
    return {
      url: '',
      alt
    };
  }
}
