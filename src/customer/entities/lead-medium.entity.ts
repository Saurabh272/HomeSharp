import { Injectable } from '@nestjs/common';
import { pgTable, varchar } from 'drizzle-orm/pg-core';
import { IEntity } from '../../app/interfaces/entity.interface';

@Injectable()
export class LeadMediumEntity implements IEntity {
  public readonly tableName: string = 'lead_mediums';

  public readonly id: string = 'id';

  public readonly leadMediums: any;

  constructor() {
    this.leadMediums = pgTable(this.tableName, {
      id: varchar(this.id).notNull().primaryKey()
    });
  }
}
