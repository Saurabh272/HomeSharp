import { Injectable } from '@nestjs/common';
import {
  date,
  pgTable,
  uuid,
  varchar
} from 'drizzle-orm/pg-core';
import { IEntity } from '../../app/interfaces/entity.interface';

@Injectable()
export class MockOtpEntity implements IEntity {
  public readonly tableName: string = 'mock_otp';

  public readonly id: string = 'id';

  public readonly phoneNumber: string = 'phone_number';

  public readonly otp: string = 'otp';

  public readonly status: string = 'status';

  public readonly dateCreated: string = 'date_created';

  public readonly dateUpdated: string = 'date_updated';

  public readonly mockOtp: any;

  constructor() {
    this.mockOtp = pgTable(this.tableName, {
      id: uuid(this.id).notNull().primaryKey(),
      phoneNumber: varchar(this.phoneNumber),
      otp: varchar(this.otp),
      status: varchar(this.status),
      dateCreated: date(this.dateCreated),
      dateUpdated: date(this.dateUpdated)
    });
  }
}
