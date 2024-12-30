import { Injectable } from '@nestjs/common';
import { CollectionDetailInterface } from '../interfaces/collection-detail.interface';
import { CollectionDetail } from '../types/collection-detail.type';

@Injectable()
export class CollectionDetailTransformer {
  process(data: CollectionDetailInterface[]): CollectionDetail | NonNullable<unknown> {
    if (!data || !data.length) {
      return {};
    }
    return {
      id: data[0].id,
      title: data[0].name || '',
      filters: data[0].filters || {},
      description: data[0].description || ''
    };
  }
}
