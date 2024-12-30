import { Injectable } from '@nestjs/common';
import {
  date,
  integer,
  pgTable,
  uuid,
  varchar
} from 'drizzle-orm/pg-core';
import { IEntity } from '../../app/interfaces/entity.interface';

@Injectable()
export class CustomerAttemptsEntity implements IEntity {
  public readonly tableName: string = 'customer_attempts';

  public readonly id: string = 'id';

  public readonly phoneNumber: string = 'phone_number';

  public readonly email: string = 'email';

  public readonly otp: string = 'otp';

  public readonly otpAttempts: string = 'otp_attempts';

  public readonly otpExpiresAt: string = 'otp_expires_at';

  public readonly resendAttempts: string = 'resend_attempts';

  public readonly dateCreated: string = 'date_created';

  public readonly dateUpdated: string = 'date_updated';

  public readonly customerAttempts: any;

  constructor() {
    this.customerAttempts = pgTable(this.tableName, {
      id: uuid(this.id).notNull().primaryKey(),
      phoneNumber: varchar(this.phoneNumber),
      email: varchar(this.email),
      otp: varchar(this.otp),
      otpAttempts: integer(this.otpAttempts),
      otpExpiresAt: date(this.otpExpiresAt),
      resendAttempts: integer(this.resendAttempts),
      dateCreated: date(this.dateCreated),
      dateUpdated: date(this.dateUpdated)
    });
  }
}
