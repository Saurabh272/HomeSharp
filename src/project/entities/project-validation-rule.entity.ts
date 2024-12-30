import { Injectable } from '@nestjs/common';
import {
  boolean, pgTable, uuid, varchar
} from 'drizzle-orm/pg-core';
import { IEntity } from '../../app/interfaces/entity.interface';

@Injectable()
export class ProjectValidationRuleEntity implements IEntity {
  public readonly tableName: string = 'project_validation_rules';

  public readonly id: string = 'id';

  public readonly projectField: string = 'project_field';

  public readonly toBeValidated: string = 'to_be_validated';

  public readonly fieldLabel: string = 'field_label';

  public readonly collection: string = 'collection';

  public readonly projectValidationRules: any;

  constructor() {
    this.projectValidationRules = pgTable(this.tableName, {
      id: uuid(this.id).notNull().primaryKey(),
      projectField: varchar(this.projectField),
      toBeValidated: boolean(this.toBeValidated),
      fieldLabel: varchar(this.fieldLabel),
      collection: varchar(this.collection)
    });
  }
}
