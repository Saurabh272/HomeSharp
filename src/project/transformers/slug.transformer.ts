import { Injectable } from '@nestjs/common';
import { ITransformer } from '../../app/interfaces/transformer.interface';
import { Slugs } from '../types/slug.type';

@Injectable()
export class SlugTransformer implements ITransformer {
  process(data: any) {
    const slugsArray = data.map((item: { slug: string }) => item.slug);
    const slugs: Slugs = {
      slugs: slugsArray
    };
    return slugs;
  }
}
