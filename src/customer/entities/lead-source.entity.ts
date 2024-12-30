import { Injectable } from '@nestjs/common';
import { pgTable, varchar } from 'drizzle-orm/pg-core';
import { IEntity } from '../../app/interfaces/entity.interface';

@Injectable()
export class LeadSourceEntity implements IEntity {
  public readonly tableName: string = 'lead_sources';

  public readonly id: string = 'id';

  public readonly leadSources: any;

  constructor() {
    this.leadSources = pgTable(this.tableName, {
      id: varchar(this.id).notNull().primaryKey()
    });
  }
}
