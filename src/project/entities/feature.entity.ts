import { Injectable } from '@nestjs/common';
import {
  boolean,
  integer,
  json,
  pgTable,
  uuid,
  varchar
} from 'drizzle-orm/pg-core';
import { IEntity } from '../../app/interfaces/entity.interface';
import { FeatureCategoryEntity } from './feature-category.entity';
import { DirectusFilesEntity } from '../../app/entities/directus-file.entity';

@Injectable()
export class FeatureEntity implements IEntity {
  public readonly tableName: string = 'features';

  public readonly id: string = 'id';

  public readonly name: string = 'feature_name';

  public readonly featureList: string = 'feature_list';

  public readonly image: string = 'image';

  public readonly featuresCategories: string = 'features_categories';

  public readonly keyHighlight: string = 'key_highlight';

  public readonly dateCreated: string = 'date_created';

  public readonly dateUpdated: string = 'date_updated';

  public readonly features: any;

  constructor(
    public readonly featureCategoryEntity: FeatureCategoryEntity,
    public readonly directusFilesEntity: DirectusFilesEntity
  ) {
    this.features = pgTable(this.tableName, {
      id: integer(this.id).notNull().primaryKey(),
      name: varchar(this.name),
      featureList: json(this.featureList),
      image: uuid(this.image)
        .notNull()
        .references(() => this.directusFilesEntity.directusFiles.id),
      featuresCategories: integer(this.featuresCategories)
        .notNull()
        .references(() => this.featureCategoryEntity.featureCategories.id),
      keyHighlight: boolean(this.keyHighlight)
    });
  }
}
