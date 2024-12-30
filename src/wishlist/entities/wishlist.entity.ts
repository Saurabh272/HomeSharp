import { Injectable } from '@nestjs/common';
import {
  pgTable,
  timestamp,
  uuid,
  varchar
} from 'drizzle-orm/pg-core';
import { DirectusFilesEntity } from '../../app/entities/directus-file.entity';
import { IEntity } from '../../app/interfaces/entity.interface';
import { CustomerEntity } from '../../customer/entities/customer.entity';

@Injectable()
export class WishlistEntity implements IEntity {
  public readonly tableName: string = 'wishlist';

  public readonly id: string = 'id';

  public readonly customerId = 'customer_id';

  public readonly name: string = 'name';

  public readonly wishlistId: string = 'wishlist_id';

  public readonly propertyName: string = 'property_id.name';

  public readonly projectId: string = 'project_id';

  public readonly dateCreated: string = 'date_created';

  public readonly dateUpdated: string = 'date_updated';

  public readonly wishlistProjectId: string = 'wishlist_project_id';

  public readonly projectsId: string = 'id';

  public readonly wishlist: any;

  constructor(
    public readonly directusFilesEntity: DirectusFilesEntity,
    public readonly customerEntity: CustomerEntity
  ) {
    this.wishlist = pgTable(this.tableName, {
      id: uuid(this.id).notNull().primaryKey(),
      name: varchar(this.name),
      dateCreated: timestamp(this.dateCreated),
      customerId: uuid(this.customerId).notNull().references(() => this.customerEntity.customers.id)
    });
  }
}
