import { Injectable } from '@nestjs/common';
import {
  date,
  jsonb,
  pgTable,
  uuid,
  varchar
} from 'drizzle-orm/pg-core';
import { LeadEntity } from './lead.entity';
import { IEntity } from '../../app/interfaces/entity.interface';

@Injectable()
export class ConnectRequestEntity implements IEntity {
  public readonly tableName: string = 'connect_requests';

  public readonly id: string = 'id';

  public readonly payload: string = 'payload';

  public readonly type: string = 'type';

  public readonly leads: string = 'leads';

  public readonly dateCreated?: string = 'date_created';

  public readonly connectRequests: any;

  constructor(
    private readonly leadEntity: LeadEntity
  ) {
    this.connectRequests = pgTable(this.tableName, {
      id: uuid(this.id).notNull().primaryKey(),
      type: varchar(this.type),
      payload: jsonb(this.payload),
      leads: uuid(this.leads)
        .notNull()
        .references(() => this.leadEntity.leads.id),
      dateCreated: date(this.dateCreated)
    });
  }
}
