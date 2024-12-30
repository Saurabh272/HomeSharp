import { Injectable, Logger } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import {
  DirectusClient,
  RestClient,
  StaticTokenClient,
  createItem,
  deleteFile,
  readFolders,
  updateItem,
  uploadFiles
} from '@directus/sdk';
import { Db } from '../../app/utils/db.util';
import { CustomerEntity } from '../entities/customer.entity';
import { IRepository } from '../../app/interfaces/repository.interface';
import { UserInterface } from '../../auth/interfaces/user.interface';
import { CustomerDetailInterface } from '../interfaces/customer-detail.interface';
import { ProfileDetails } from '../types/profile-details.type';

@Injectable()
export class CustomerRepository implements IRepository {
  private readonly logger = new Logger(CustomerRepository.name);

  private client: DirectusClient<any> & StaticTokenClient<any> & RestClient<any>;

  private readonly entities: {
    customers: any;
  };

  private readonly selectedFields: {
    id: any;
    name: any;
    email: any;
    phoneNumber: any;
    dateUpdated: any;
    profilePicture: any;
  };

  constructor(
    private readonly db: Db,
    private readonly customerEntity: CustomerEntity
  ) {
    this.client = db.getDirectusClient();
    this.entities = {
      customers: this.customerEntity.customers
    };
    this.selectedFields = {
      id: this.entities.customers.id,
      name: this.entities.customers.name,
      email: this.entities.customers.email,
      phoneNumber: this.entities.customers.phoneNumber,
      dateUpdated: this.entities.customers.dateUpdated,
      profilePicture: this.entities.customers.profilePicture
    };
  }

  public async getById(id: string): Promise<CustomerDetailInterface> {
    const result = await this.db.connection
      .select(this.selectedFields)
      .from(this.entities.customers)
      .where(
        eq(this.entities.customers.id, id)
      );

    return result?.[0];
  }

  customerDataMapper(data: Partial<CustomerEntity>): Partial<CustomerEntity> {
    const dataForUpdate: Partial<CustomerEntity> = {};
    if (data.refreshToken !== undefined) {
      dataForUpdate[this.customerEntity.refreshToken] = data.refreshToken;
    }
    if (data.name !== undefined) {
      dataForUpdate[this.customerEntity.name] = data.name;
    }
    if (data.phoneNumber !== undefined) {
      dataForUpdate[this.customerEntity.phoneNumber] = data.phoneNumber;
    }
    if (data.email !== undefined) {
      dataForUpdate[this.customerEntity.email] = data.email;
    }
    if (data.rm !== undefined) {
      dataForUpdate[this.customerEntity.rm] = data.rm;
    }
    if (data.status) {
      dataForUpdate[this.customerEntity.status] = data.status;
    }
    if (data.deletionReason) {
      dataForUpdate[this.customerEntity.deletionReason] = data.deletionReason;
    }
    return dataForUpdate;
  }

  async updateById(id: string, data: Partial<CustomerEntity>): Promise<void> {
    const dataForUpdate = this.customerDataMapper(data);

    if (dataForUpdate && Object.keys(dataForUpdate).length === 0) {
      this.logger.warn('No data to update');
      return;
    }

    await this.client.request(
      updateItem(this.customerEntity.tableName, id, dataForUpdate)
    );
  }

  async getByEmail(email: string): Promise<CustomerDetailInterface> {
    const result = await this.db.connection
      .select(this.selectedFields)
      .from(this.entities.customers)
      .where(eq(this.entities.customers.email, email));

    return result?.[0];
  }

  async getByPhoneNumber(phoneNumber: string): Promise<CustomerDetailInterface> {
    const result = await this.db.connection
      .select(this.selectedFields)
      .from(this.entities.customers)
      .where(eq(this.entities.customers.phoneNumber, phoneNumber));

    return result?.[0];
  }

  async updateCustomer(id: string, data: { name?: string; imageId?: string, externalId?: string }) {
    const dataForUpdate: Partial<CustomerEntity> = {};

    if (data?.name) {
      dataForUpdate[this.customerEntity.name] = data?.name;
    }

    if (data?.imageId) {
      dataForUpdate[this.customerEntity.profilePicture] = data?.imageId;
    }

    if (data?.externalId) {
      dataForUpdate[this.customerEntity.externalId] = data?.externalId;
    }

    return this.client.request(
      updateItem(this.customerEntity.tableName, id, dataForUpdate)
    );
  }

  async create(user: { email?: string, phoneNumber?: string }) {
    return this.client.request(
      createItem(this.customerEntity.tableName, {
        [this.customerEntity.email]: user?.email,
        [this.customerEntity.phoneNumber]: user?.phoneNumber
      })
    );
  }

  async getRefreshTokenById(id: string): Promise<UserInterface> {
    const query = await this.db.connection
      .select({
        id: this.entities.customers.id,
        refreshToken: this.entities.customers.refreshToken
      })
      .from(this.entities.customers)
      .where(and(
        eq(this.entities.customers.id, id),
        eq(this.entities.customers.status, this.customerEntity.STATUSES.ACTIVE)
      ));

    return query?.[0];
  }

  async updateToken(id: string, refreshToken: string) {
    await this.client.request(updateItem(
      this.customerEntity.tableName,
      id,
      {
        [this.customerEntity.refreshToken]: refreshToken
      }
    ));
  }

  async getProfileDetailsById(id: string): Promise<ProfileDetails> {
    const result = await this.db.connection
      .select({
        name: this.entities.customers.name,
        email: this.entities.customers.email,
        phoneNumber: this.entities.customers.phoneNumber,
        externalId: this.entities.customers.externalId
      })
      .from(this.entities.customers)
      .where(eq(this.entities.customers.id, id));

    return result?.[0];
  }

  async getProfile(id: string): Promise<{ image: string }> {
    const result = await this.db.connection
      .select({
        image: this.entities.customers.profilePicture
      })
      .from(this.entities.customers)
      .where(eq(this.entities.customers.id, id));

    return result?.[0];
  }

  async getCustomerFolderIdFromRoot() {
    const getCustomerFolderFromRoot = await this.client.request(
      readFolders({
        filter: {
          name: { _eq: this.customerEntity.tableName }
        }
      })
    );

    return getCustomerFolderFromRoot?.[0]?.id;
  }

  async uploadProfilePhoto(form: FormData) {
    const result: any = await this.client.request(
      uploadFiles(form)
    );
    return result?.id;
  }

  async deleteProfilePhoto(id: string): Promise<void> {
    return this.client.request(deleteFile(id));
  }
}
