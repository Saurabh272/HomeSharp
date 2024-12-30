import { Injectable } from '@nestjs/common';
import {
  DirectusClient,
  RestClient,
  StaticTokenClient,
  createItem,
  deleteItem,
  readItem,
  readItems,
  updateItem
} from '@directus/sdk';
import { Db } from '../../app/utils/db.util';
import { SavedSearchEntity } from '../entities/saved-search.entity';

@Injectable()
export class SavedSearchRepository {
  private client: DirectusClient<any> & StaticTokenClient<any> & RestClient<any>;

  constructor(
    private readonly db: Db,
    private readonly savedSearchEntity: SavedSearchEntity
  ) {
    this.client = db.getDirectusClient();
  }

  private getFieldName(fieldName: string): string {
    return this.savedSearchEntity.fieldMappings[fieldName] || fieldName;
  }

  private mapFields(request: SavedSearchEntity): Partial<SavedSearchEntity> {
    const data: Partial<SavedSearchEntity> = {};

    Object.keys(request).forEach((field) => {
      const mappedField = this.getFieldName(field);
      if (request[field]) {
        data[mappedField] = request[field];
      }
    });

    return data;
  }

  async create(customerId: string, request: any) {
    const dataForCreate = this.mapFields(request);
    dataForCreate[this.savedSearchEntity.customerId] = customerId;

    return this.client.request(createItem(
      this.savedSearchEntity.tableName,
      dataForCreate
    ));
  }

  async update(id: string, request: any) {
    const dataForUpdate = this.mapFields(request);

    return this.client.request(updateItem(
      this.savedSearchEntity.tableName,
      id,
      dataForUpdate
    ));
  }

  async getAll(customerId: string) {
    const result: any = await this.client.request(readItems(this.savedSearchEntity.tableName, {
      filter: {
        [this.savedSearchEntity.customerId]: {
          _eq: customerId
        }
      }
    }));

    return result;
  }

  async getById(id: string): Promise<any> {
    return this.client.request(readItem(this.savedSearchEntity.tableName, id));
  }

  async getName(customerId: string, name: string) {
    const result = await this.client.request(readItems(this.savedSearchEntity.tableName, {
      filter: {
        [this.savedSearchEntity.customerId]: {
          _eq: customerId
        },
        [this.savedSearchEntity.name]: {
          _eq: name
        }
      }
    }));

    return result && result.length > 0;
  }

  async deleteById(id: string) {
    return this.client.request(deleteItem(this.savedSearchEntity.tableName, id));
  }
}
