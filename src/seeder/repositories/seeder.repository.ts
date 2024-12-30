import { BadRequestException, Injectable } from '@nestjs/common';
import {
  DirectusClient,
  RestClient,
  StaticTokenClient,
  createItem,
  createItems,
  readFolders,
  readItems,
  uploadFiles
} from '@directus/sdk';
import { SeederEntity } from '../entities/seeder.entities';
import { Db } from '../../app/utils/db.util';

@Injectable()
export class SeederRepository {
  private client: DirectusClient<any> & StaticTokenClient<any> & RestClient<any>;

  constructor(
    private readonly seederEntity: SeederEntity,
    private readonly db: Db
  ) {
    this.client = db.getDirectusClient();
  }

  async getFolderIdFromRoot(tableName: string) {
    try {
      const getCustomerFolderFromRoot: any = await this.client.request(readFolders({
        filter: {
          name: { _eq: tableName }
        }
      }));

      return getCustomerFolderFromRoot?.[0]?.id;
    } catch (error) {
      throw new BadRequestException(error?.errors[0]?.message || error);
    }
  }

  async uploadAttachment(form: FormData) {
    try {
      const result = await this.client.request(uploadFiles(form));

      return result?.id;
    } catch (error) {
      throw new BadRequestException(error?.errors[0]?.message || error);
    }
  }

  async create(collectionName: string, request: any) {
    try {
      return await this.client.request(createItems(collectionName, request));
    } catch (error) {
      throw new BadRequestException(error?.errors[0]?.message || error);
    }
  }

  async createOne(collectionName: string, request: any) {
    try {
      return await this.client.request(createItem(collectionName, request));
    } catch (error) {
      throw new BadRequestException(error?.errors[0]?.message || error);
    }
  }

  async getAll(collectionName: string) {
    try {
      return await this.client.request(readItems(collectionName));
    } catch (error) {
      throw new BadRequestException(error?.errors[0]?.message || error);
    }
  }
}
