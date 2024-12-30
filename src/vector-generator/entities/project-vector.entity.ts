import { Injectable } from '@nestjs/common';
import {
  integer,
  pgTable,
  real,
  uuid,
  varchar
} from 'drizzle-orm/pg-core';
import { IEntity } from '../../app/interfaces/entity.interface';

@Injectable()
export class ProjectVectorEntity implements IEntity {
  public readonly tableName: string = 'project_vectors';

  public readonly id: string = 'id';

  public readonly projectId: string = 'project_id';

  public readonly projectName: string = 'project_name';

  public readonly projectSlug: string = 'project_slug';

  public readonly wingId: string = 'wing_id';

  public readonly configurationId: string = 'configuration_id';

  public readonly projectLocation: string = 'project_location';

  public readonly bedrooms: string = 'bedrooms';

  public readonly carpetArea: string = 'carpet_area';

  public readonly minimumPrice: string = 'minimum_price';

  public readonly maximumPrice: string = 'maximum_price';

  public readonly featureVectorMean: string = 'feature_vector_mean';

  public readonly projectVectors: any;

  constructor() {
    this.projectVectors = pgTable(this.tableName, {
      id: integer(this.id).notNull().primaryKey(),
      projectId: uuid(this.projectId).notNull(),
      projectName: varchar(this.projectName).notNull(),
      projectSlug: varchar(this.projectSlug).notNull(),
      wingId: uuid(this.wingId).notNull(),
      configurationId: uuid(this.configurationId).notNull(),
      projectLocation: varchar(this.projectLocation).notNull(),
      bedrooms: integer(this.bedrooms).notNull(),
      carpetArea: integer(this.carpetArea).notNull(),
      minimumPrice: real(this.minimumPrice).notNull(),
      maximumPrice: real(this.maximumPrice).notNull(),
      featureVectorMean: varchar(this.featureVectorMean).notNull()
    });
  }
}
