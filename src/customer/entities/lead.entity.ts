import { Injectable } from '@nestjs/common';
import { pgTable, uuid, varchar } from 'drizzle-orm/pg-core';
import { IEntity } from '../../app/interfaces/entity.interface';

@Injectable()
export class LeadEntity implements IEntity {
  public readonly tableName: string = 'leads';

  public readonly id: string = 'id';

  public readonly name: string = 'name';

  public readonly phoneNumber: string = 'phone_number';

  public readonly utmSource: string = 'utm_source';

  public readonly utmMedium: string = 'utm_medium';

  public readonly utmCampaign: string = 'utm_campaign';

  public readonly leads: any;

  constructor() {
    this.leads = pgTable(this.tableName, {
      id: uuid(this.id).notNull().primaryKey(),
      name: varchar(this.name),
      phoneNumber: varchar(this.phoneNumber),
      utmSource: varchar(this.utmSource),
      utmMedium: varchar(this.utmMedium),
      utmCampaign: varchar(this.utmCampaign)
    });
  }
}
