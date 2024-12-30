import { Injectable } from '@nestjs/common';
import {
  integer,
  pgTable,
  uuid,
  varchar
} from 'drizzle-orm/pg-core';
import { IEntity } from '../interfaces/entity.interface';
import { DirectusFilesEntity } from './directus-file.entity';

@Injectable()
export class SeoPropertiesEntity implements IEntity {
  public readonly tableName: string = 'seo_properties';

  public readonly id: string = 'id';

  public readonly slug: string = 'slug';

  public readonly summary: string = 'summary';

  public readonly title: string = 'title';

  public readonly dateCreated: string = 'date_created';

  public readonly dateUpdated: string = 'date_updated';

  public readonly keywords: string = 'keywords';

  public readonly canonicalUrl: string = 'canonical_url';

  public readonly image: string = 'image';

  public readonly alt: string = 'alt';

  public readonly seoProperties: any;

  constructor(private readonly directusFilesEntity: DirectusFilesEntity) {
    this.seoProperties = pgTable(this.tableName, {
      id: integer(this.id).notNull().primaryKey(),
      slug: varchar(this.slug),
      summary: varchar(this.summary),
      title: varchar(this.title),
      keywords: varchar(this.keywords),
      canonicalUrl: varchar(this.canonicalUrl),
      image: uuid(this.image)
        .notNull()
        .references(() => this.directusFilesEntity.directusFiles.id),
      alt: varchar(this.alt)
    });
  }
}
