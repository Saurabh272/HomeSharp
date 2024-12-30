import { Injectable } from '@nestjs/common';
import {
  integer,
  pgTable,
  varchar
} from 'drizzle-orm/pg-core';
import { IEntity } from '../../app/interfaces/entity.interface';

@Injectable()
export class ReraStageEntity implements IEntity {
  public readonly tableName: string = 'rera_stage';

  public readonly id: string = 'id';

  public readonly name: string = 'name';

  public readonly progressLevel: string = 'progress_level';

  public readonly dateCreated: string = 'date_created';

  public readonly dateUpdated: string = 'date_updated';

  public readonly reraStages: any;

  constructor() {
    this.reraStages = pgTable(this.tableName, {
      id: integer(this.id).notNull().primaryKey(),
      name: varchar(this.name),
      progressLevel: varchar(this.progressLevel)
    });
  }
}
