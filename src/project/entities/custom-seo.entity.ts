import { Injectable } from '@nestjs/common';
import {
  json,
  pgTable,
  uuid,
  varchar
} from 'drizzle-orm/pg-core';
import { IEntity } from '../../app/interfaces/entity.interface';
import { SeoPropertiesEntity } from '../../app/entities/seo-properties.entity';

@Injectable()
export class CustomSeoEntity implements IEntity {
  public readonly tableName: string = 'custom_seo';

  public readonly id: string = 'id';

  public readonly name: string = 'name';

  public readonly filters: string = 'filters';

  public readonly seoProperties: string = 'seo_properties';

  public readonly dateCreated: string = 'date_created';

  public readonly dateUpdated: string = 'date_updated';

  public readonly description: string = 'description';

  public readonly customSeo: any;

  constructor(
    private readonly seoPropertiesEntity: SeoPropertiesEntity
  ) {
    this.customSeo = pgTable(this.tableName, {
      id: uuid(this.id).notNull().primaryKey(),
      name: varchar(this.name),
      filters: json(this.filters),
      seoProperties: uuid(this.seoProperties)
        .notNull()
        .references(() => this.seoPropertiesEntity.seoProperties.id),
      description: varchar(this.description)
    });
  }
}
