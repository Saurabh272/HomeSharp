import { Injectable } from '@nestjs/common';
import {
  pgTable,
  uuid,
  varchar
} from 'drizzle-orm/pg-core';
import { ProjectEntity } from '../../project/entities/project.entity';
import { IEntity } from '../../app/interfaces/entity.interface';
import { CustomerEntity } from './customer.entity';

@Injectable()
export class ContactAgentEntity implements IEntity {
  public readonly tableName: string = 'contact_agents';

  public readonly id: string = 'id';

  public readonly message: string = 'message';

  public readonly customers: string = 'customers';

  public readonly projects: string = 'projects';

  public readonly contactAgents: any;

  constructor(
    public readonly customerEntity: CustomerEntity,
    public readonly projectEntity: ProjectEntity
  ) {
    this.contactAgents = pgTable(this.tableName, {
      id: uuid(this.id).notNull().primaryKey(),
      message: varchar(this.message),
      customers: uuid(this.customers)
        .notNull()
        .references(() => this.customerEntity.customers.id),
      projects: uuid(this.projects)
        .notNull()
        .references(() => this.projectEntity.projects.id)
    });
  }
}
