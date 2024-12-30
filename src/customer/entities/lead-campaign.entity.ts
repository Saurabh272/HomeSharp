import { Injectable } from '@nestjs/common';
import { pgTable, varchar } from 'drizzle-orm/pg-core';
import { IEntity } from '../../app/interfaces/entity.interface';

@Injectable()
export class LeadCampaignEntity implements IEntity {
  public readonly tableName: string = 'lead_campaigns';

  public readonly id: string = 'id';

  public readonly leadCampaigns: any;

  constructor() {
    this.leadCampaigns = pgTable(this.tableName, {
      id: varchar(this.id).notNull().primaryKey()
    });
  }
}
