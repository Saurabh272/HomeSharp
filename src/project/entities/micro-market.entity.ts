import { Injectable } from '@nestjs/common';
import {
  boolean,
  pgTable,
  uuid,
  varchar
} from 'drizzle-orm/pg-core';
import { IEntity } from '../../app/interfaces/entity.interface';
import { SeoPropertiesEntity } from '../../app/entities/seo-properties.entity';
import { DirectusFilesEntity } from '../../app/entities/directus-file.entity';

@Injectable()
export class MicroMarketEntity implements IEntity {
  public readonly tableName: string = 'micro_markets';

  public readonly id: string = 'id';

  public readonly name: string = 'micro_market_name';

  public readonly location: string = 'micro_market_location';

  public readonly seoProperties: string = 'seo_properties';

  public readonly status: string = 'status';

  public readonly microMarketThumbnail: string = 'micro_market_thumbnail';

  public readonly default: string = 'default';

  public readonly dateCreated: string = 'date_created';

  public readonly dateUpdated: string = 'date_updated';

  public readonly STATUSES: Record<string, string> = {
    PUBLISHED: 'published',
    DRAFT: 'draft',
    ARCHIVED: 'archived'
  };

  public readonly microMarkets: any;

  constructor(
    private readonly seoPropertiesEntity: SeoPropertiesEntity,
    private readonly directusFilesEntity: DirectusFilesEntity
  ) {
    this.microMarkets = pgTable(this.tableName, {
      id: uuid(this.id).notNull().primaryKey(),
      name: varchar(this.name),
      location: varchar(this.location),
      seoProperties: uuid(this.seoProperties)
        .notNull()
        .references(() => this.seoPropertiesEntity.seoProperties.id),
      microMarketThumbnail: uuid(this.microMarketThumbnail)
        .notNull()
        .references(() => this.directusFilesEntity.directusFiles.id)
        .references(() => this.seoPropertiesEntity.seoProperties.id),
      default: boolean(this.default),
      status: varchar(this.status)
    });
  }
}
