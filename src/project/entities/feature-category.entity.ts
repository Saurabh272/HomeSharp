import { Injectable } from '@nestjs/common';
import { integer, pgTable, varchar } from 'drizzle-orm/pg-core';
import { IEntity } from '../../app/interfaces/entity.interface';

@Injectable()
export class FeatureCategoryEntity implements IEntity {
  public readonly tableName: string = 'features_categories';

  public readonly id: string = 'id';

  public readonly name: string = 'category_name';

  public readonly label: string = 'category_label';

  public readonly dateCreated: string = 'date_created';

  public readonly dateUpdated: string = 'date_updated';

  public readonly featureCategories: any;

  constructor() {
    this.featureCategories = pgTable(this.tableName, {
      id: integer(this.id).notNull().primaryKey(),
      name: varchar(this.name),
      label: varchar(this.label)
    });
  }
}
