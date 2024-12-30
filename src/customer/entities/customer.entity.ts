import { Injectable } from '@nestjs/common';
import {
  pgTable,
  uuid,
  varchar,
  date
} from 'drizzle-orm/pg-core';
import { IEntity } from '../../app/interfaces/entity.interface';
import { RelationshipManagerEntity } from '../../project/entities/relationship-manager.entity';
import { DirectusFilesEntity } from '../../app/entities/directus-file.entity';

@Injectable()
export class CustomerEntity implements IEntity {
  public readonly tableName: string = 'customers';

  public readonly id: string = 'id';

  public readonly name: string = 'name';

  public readonly email: string = 'email';

  public readonly phoneNumber: string = 'phone_number';

  public readonly refreshToken: string = 'refresh_token';

  public readonly dateCreated: string = 'date_created';

  public readonly dateUpdated: string = 'date_updated';

  public readonly profilePicture: string = 'image';

  public readonly rm: string = 'relationship_managers';

  public readonly externalId: string = 'external_id';

  public readonly deletionReason: string = 'deletion_reason';

  public readonly status: string = 'status';

  public readonly STATUSES: Record<string, string> = {
    ACTIVE: 'active',
    INACTIVE: 'inactive'
  };

  public readonly customers: any;

  constructor(
    private readonly directusFilesEntity: DirectusFilesEntity,
    private readonly rmEntity: RelationshipManagerEntity
  ) {
    this.customers = pgTable(this.tableName, {
      id: uuid(this.id).notNull().primaryKey(),
      name: varchar(this.name),
      email: varchar(this.email),
      phoneNumber: varchar(this.phoneNumber),
      profilePicture: varchar(this.profilePicture)
        .notNull()
        .references(() => this.directusFilesEntity.directusFiles.id),
      refreshToken: varchar(this.refreshToken),
      dateUpdated: date(this.dateUpdated),
      rm: uuid(this.rm).references(() => this.rmEntity.rm.id),
      externalId: varchar(this.externalId),
      deletionReason: varchar(this.deletionReason),
      status: varchar(this.status)
    });
  }
}
