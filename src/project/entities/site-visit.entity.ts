import { Injectable } from '@nestjs/common';
import {
  date, integer,
  pgTable,
  uuid,
  varchar
} from 'drizzle-orm/pg-core';
import { IEntity } from '../../app/interfaces/entity.interface';
import { CustomerEntity } from '../../customer/entities/customer.entity';
import { ProjectEntity } from './project.entity';
import { SiteVisitStatusEntity } from './site-visit-status.entity';

@Injectable()
export class SiteVisitEntity implements IEntity {
  public readonly tableName: string = 'site_visits';

  public readonly id: string = 'id';

  public readonly siteVisitId: string = 'site_visit_id';

  public readonly siteVisitStatus: string = 'site_visit_status';

  public readonly visitTime: string = 'visit_time';

  public readonly visitType: string = 'visit_type';

  public readonly project: string = 'Projects';

  public readonly customer: string = 'customer';

  public readonly cancellationReason: string = 'cancellation_reason';

  public readonly cancellationReasonDetails: string = 'cancellation_reason_details';

  public readonly dateCreated: string = 'date_created';

  public readonly dateUpdated: string = 'date_updated';

  public readonly siteVisits: any;

  constructor(
    private readonly customerEntity: CustomerEntity,
    private readonly projectEntity: ProjectEntity,
    private readonly siteVisitStatusEntity: SiteVisitStatusEntity
  ) {
    this.siteVisits = pgTable(this.tableName, {
      id: uuid(this.id).notNull().primaryKey(),
      siteVisitId: integer(this.siteVisitId).notNull(),
      visitTime: date(this.visitTime),
      visitType: varchar(this.visitType),
      cancellationReason: varchar(this.cancellationReason),
      cancellationReasonDetails: varchar(this.cancellationReasonDetails),
      dateCreated: date(this.dateCreated),
      dateUpdated: date(this.dateUpdated),
      siteVisitStatus: integer(this.siteVisitStatus)
        .notNull()
        .references(() => this.siteVisitStatusEntity.siteVisitStatuses.id),
      project: uuid(this.project)
        .notNull()
        .references(() => this.projectEntity.projects.id),
      customer: uuid(this.customer)
        .notNull()
        .references(() => this.customerEntity.customers.id)
    });
  }
}
