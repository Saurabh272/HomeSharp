import { Injectable } from '@nestjs/common';
import { ITransformer } from '../interfaces/transformer.interface';
import config from '../config';
import { SeoProperties } from '../types/seo-properties.type';
import { SeoPropertiesInterface } from '../interfaces/seo-properties.interface';

@Injectable()
export class SeoPropertiesTransformer implements ITransformer {
  process(data: SeoPropertiesInterface) {
    const seoProperties: SeoProperties = {
      slug: data.slug,
      title: data.title || null,
      keywords: this.getKeywords(data.keywords),
      canonicalUrl: data.canonicalUrl || null,
      image: this.getImage(data.image),
      summary: data.summary || null,
      alt: data.alt || null
    };
    return seoProperties;
  }

  getImage(image: string) {
    if (!image) {
      return '';
    }
    return `${config.DIRECTUS_URL}/assets/${image}`;
  }

  getKeywords(keywords: string) {
    if (!keywords) {
      return [];
    }

    // TODO: We should split by "," and not space. We should trim the spaces where this is being used.
    return keywords.split(', ');
  }
}
