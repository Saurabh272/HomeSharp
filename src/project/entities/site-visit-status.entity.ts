import { Injectable } from '@nestjs/common';
import {
  boolean,
  pgTable,
  uuid,
  varchar
} from 'drizzle-orm/pg-core';
import { IEntity } from '../../app/interfaces/entity.interface';

@Injectable()
export class SiteVisitStatusEntity implements IEntity {
  public readonly tableName: string = 'site_visit_status';

  public readonly id: string = 'id';

  public readonly label: string = 'label';

  public readonly value: string = 'value';

  public readonly allowUpdate: string = 'allow_update';

  public readonly showToCustomer: string = 'show_to_customer';

  public readonly siteVisitStatuses: any;

  constructor() {
    this.siteVisitStatuses = pgTable(this.tableName, {
      id: uuid(this.id).notNull().primaryKey(),
      label: varchar(this.label),
      value: varchar(this.value),
      allowUpdate: boolean(this.allowUpdate),
      showToCustomer: boolean(this.showToCustomer)
    });
  }
}
