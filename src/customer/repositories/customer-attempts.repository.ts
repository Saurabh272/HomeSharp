import { Injectable } from '@nestjs/common';
import { and, eq, SQL } from 'drizzle-orm';
import {
  DirectusClient,
  RestClient,
  StaticTokenClient,
  createItem,
  updateItem
} from '@directus/sdk';
import { Db } from '../../app/utils/db.util';
import { CustomerAttemptsEntity } from '../entities/customer-attempts.entity';
import { IRepository } from '../../app/interfaces/repository.interface';
import { Transformer } from '../../app/utils/transformer.util';
import { MockOtpEntity } from '../entities/mock-otp.entity';
import { MockOtpConfig } from '../config';
import { OtpDetailInterface } from '../interfaces/otp-detail.interface';
import { LoginTypeInterface } from '../interfaces/login-type.interface';

@Injectable()
export class CustomerAttemptsRepository implements IRepository {
  private client: DirectusClient<any> & StaticTokenClient<any> & RestClient<any>;

  private readonly entities: {
    customerAttempts: any;
    mockOtp: any;
  };

  public constructor(
    private readonly db: Db,
    private readonly customerAttemptsEntity: CustomerAttemptsEntity,
    private readonly transformer: Transformer,
    private readonly mockOtpEntity: MockOtpEntity
  ) {
    this.client = db.getDirectusClient();
    this.entities = {
      customerAttempts: this.customerAttemptsEntity.customerAttempts,
      mockOtp: this.mockOtpEntity.mockOtp
    };
  }

  private dataMapper(data: Partial<CustomerAttemptsEntity>) {
    const dateToSave: Partial<CustomerAttemptsEntity> = {};
    if (data?.phoneNumber !== undefined) {
      dateToSave[this.customerAttemptsEntity.phoneNumber] = data.phoneNumber;
    }

    if (data?.email !== undefined) {
      dateToSave[this.customerAttemptsEntity.email] = data.email;
    }

    if (data?.otp !== undefined) {
      dateToSave[this.customerAttemptsEntity.otp] = data.otp;
    }

    if (data?.resendAttempts !== undefined) {
      dateToSave[this.customerAttemptsEntity.resendAttempts] = data.resendAttempts;
    }

    if (data?.otpAttempts !== undefined) {
      dateToSave[this.customerAttemptsEntity.otpAttempts] = data.otpAttempts;
    }

    if (data?.otpExpiresAt !== undefined) {
      dateToSave[this.customerAttemptsEntity.otpExpiresAt] = data.otpExpiresAt;
    }

    return dateToSave;
  }

  async create(data: Partial<CustomerAttemptsEntity>) {
    return this.client.request(createItem(this.customerAttemptsEntity.tableName, this.dataMapper(data)));
  }

  public async updateById(id: string, data: any) {
    return this.client.request(
      updateItem(this.customerAttemptsEntity.tableName, id, this.dataMapper(data))
    );
  }

  getFilterQuery(loginType: LoginTypeInterface): SQL<any> {
    if (loginType.email) {
      return eq(this.entities.customerAttempts.email, loginType.email);
    }

    if (loginType.phoneNumber) {
      return eq(this.entities.customerAttempts.phoneNumber, loginType.phoneNumber);
    }
  }

  async getByLoginType(loginType: LoginTypeInterface): Promise<OtpDetailInterface> {
    const result = await this.db.connection
      .select({
        id: this.entities.customerAttempts.id,
        phoneNumber: this.entities.customerAttempts.phoneNumber,
        email: this.entities.customerAttempts.email,
        otp: this.entities.customerAttempts.otp,
        otpAttempts: this.entities.customerAttempts.otpAttempts,
        resendAttempts: this.entities.customerAttempts.resendAttempts,
        otpExpiresAt: this.entities.customerAttempts.otpExpiresAt,
        dateUpdated: this.entities.customerAttempts.dateUpdated
      })
      .from(this.entities.customerAttempts)
      .where(this.getFilterQuery(loginType));

    return result?.[0];
  }

  async getMockOtp(data: LoginTypeInterface): Promise<string> {
    const result = await this.db.connection
      .select({
        otp: this.entities.mockOtp.otp
      })
      .from(this.entities.mockOtp)
      .where(
        and(
          eq(this.entities.mockOtp.phoneNumber, data?.phoneNumber),
          eq(this.entities.mockOtp.status, MockOtpConfig.status)
        )
      );

    return result?.[0]?.otp;
  }
}
