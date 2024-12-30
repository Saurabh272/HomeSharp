import { Injectable } from '@nestjs/common';
import {
  integer,
  pgTable,
  uuid,
  varchar
} from 'drizzle-orm/pg-core';
import { IEntity } from '../../app/interfaces/entity.interface';
import { DirectusFilesEntity } from '../../app/entities/directus-file.entity';
import { SeoPropertiesEntity } from '../../app/entities/seo-properties.entity';

@Injectable()
export class CategoryEntity implements IEntity {
  public readonly tableName: string = 'Categories';

  public readonly id: string = 'id';

  public readonly name: string = 'name';

  public readonly image: string = 'image';

  public readonly sortOrder: string = 'sort_order';

  public readonly seoProperty: string = 'seo_properties';

  public readonly dateCreated: string = 'date_created';

  public readonly dateUpdated: string = 'date_updated';

  public readonly title: string = 'title';

  public readonly description: string = 'description';

  public readonly categories: any;

  constructor(
    public readonly directusFilesEntity: DirectusFilesEntity,
    public readonly seoPropertiesEntity: SeoPropertiesEntity
  ) {
    this.categories = pgTable(this.tableName, {
      id: integer(this.id).notNull().primaryKey(),
      name: varchar(this.name),
      sortOrder: integer(this.sortOrder),
      image: uuid(this.image)
        .notNull()
        .references(() => this.directusFilesEntity.directusFiles.id),
      seoProperties: integer(this.seoProperty)
        .notNull()
        .references(() => this.seoPropertiesEntity.seoProperties.id),
      title: varchar(this.title),
      description: varchar(this.description)
    });
  }
}
