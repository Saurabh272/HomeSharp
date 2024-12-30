import { Injectable } from '@nestjs/common';
import {
  pgTable,
  uuid,
  varchar
} from 'drizzle-orm/pg-core';
import { IEntity } from '../interfaces/entity.interface';

@Injectable()
export class AddressEntity implements IEntity {
  public readonly tableName: string = 'addresses';

  public readonly id: string = 'id';

  public readonly line1: string = 'line_1';

  public readonly line2: string = 'line_2';

  public readonly city: string = 'city';

  public readonly state: string = 'state';

  public readonly pinCode: string = 'pin_code';

  public readonly dateCreated: string = 'date_created';

  public readonly dateUpdated: string = 'date_updated';

  public readonly addresses = pgTable(this.tableName, {
    id: uuid(this.id).notNull().primaryKey(),
    line1: varchar(this.line1),
    line2: varchar(this.line2),
    city: varchar(this.city),
    state: varchar(this.state),
    pinCode: varchar(this.pinCode)
  });
}
