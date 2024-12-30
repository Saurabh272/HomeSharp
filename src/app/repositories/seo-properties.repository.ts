import { Injectable } from '@nestjs/common';
import { alias } from 'drizzle-orm/pg-core';
import { eq } from 'drizzle-orm';
import {
  DirectusClient,
  StaticTokenClient,
  RestClient,
  updateItem
} from '@directus/sdk';
import { Db } from '../utils/db.util';
import { SeoPropertiesEntity } from '../entities/seo-properties.entity';
import { DirectusFilesEntity } from '../entities/directus-file.entity';
import { SeoPropertiesInterface } from '../interfaces/seo-properties.interface';

@Injectable()
export class SeoPropertiesRepository {
  private readonly seoProperties: any;

  private client: DirectusClient<any> & StaticTokenClient<any> & RestClient<any>;

  private readonly seoPropertiesImageDirectusFiles: any;

  constructor(
    private readonly db: Db,
    private readonly seoPropertiesEntity: SeoPropertiesEntity,
    private readonly directusFilesEntity: DirectusFilesEntity

  ) {
    this.seoPropertiesImageDirectusFiles = alias(
      this.directusFilesEntity.directusFiles,
      'seoPropertiesImageDirectusFiles'
    );
    this.seoProperties = this.seoPropertiesEntity.seoProperties;
    this.client = db.getDirectusClient();
  }

  async getSeoProperties(slug: string): Promise<SeoPropertiesInterface[]> {
    return this.db.connection
      .select({
        slug: this.seoProperties.slug,
        title: this.seoProperties.title,
        keywords: this.seoProperties.keywords,
        canonicalUrl: this.seoProperties.canonicalUrl,
        image: this.seoPropertiesImageDirectusFiles.filenameDisk,
        summary: this.seoProperties.summary,
        alt: this.seoProperties.alt
      })
      .from(this.seoProperties)
      .leftJoin(
        this.seoPropertiesImageDirectusFiles,
        eq(this.seoProperties.image, this.seoPropertiesImageDirectusFiles.id)
      )
      .where(eq(this.seoProperties.slug, slug));
  }

  async updateSeoPropertyForCollection(tableName: string, id: string, seoPropertyId: string) {
    return this.client.request(
      updateItem(tableName, id, {
        seo_properties: seoPropertyId
      })
    );
  }

  async getAllSeoProperties() {
    return this.db.connection
      .select({
        slug: this.seoProperties.slug,
        id: this.seoProperties.id
      })
      .from(this.seoProperties);
  }

  async updateOne(data: any) {
    return this.client.request(
      updateItem(this.seoPropertiesEntity.tableName, data?.id, {
        slug: data?.slug
      })
    );
  }
}
