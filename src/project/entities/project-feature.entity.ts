import { Injectable } from '@nestjs/common';
import { integer, pgTable, uuid } from 'drizzle-orm/pg-core';
import { ProjectEntity } from './project.entity';
import { FeatureEntity } from './feature.entity';
import { IEntity } from '../../app/interfaces/entity.interface';

@Injectable()

export class ProjectFeatureEntity implements IEntity {
  public readonly tableName: string = 'Projects_features';

  public readonly id: string = 'id';

  public readonly project: string = 'Projects_id';

  public readonly feature: string = 'features_id';

  public readonly projectFeatures: any;

  constructor(
    private readonly projectEntity: ProjectEntity,
    private readonly featureEntity: FeatureEntity
  ) {
    this.projectFeatures = pgTable(this.tableName, {
      id: integer(this.id).notNull().primaryKey(),
      project: uuid(this.project)
        .notNull()
        .references(() => this.projectEntity.projects.id),
      feature: uuid(this.feature)
        .notNull()
        .references(() => this.featureEntity.features.id)
    });
  }
}
