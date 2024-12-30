import { Injectable } from '@nestjs/common';
import {
  DirectusClient,
  RestClient,
  StaticTokenClient,
  createItem,
  readItems,
  updateItems
} from '@directus/sdk';
import { Db } from '../../app/utils/db.util';
import { ReindexingEntity } from '../entities/reindexing.entity';
import { IndexingConfig } from '../config/reindexing.config';

@Injectable()
export class ReindexingRepository {
  private client: DirectusClient<any> & StaticTokenClient<any> & RestClient<any>;

  constructor(
    private readonly db: Db,
    private readonly reindexingEntity: ReindexingEntity
  ) {
    this.client = db.getDirectusClient();
  }

  async create(createParams: any) {
    const dataForUpdate: Partial<ReindexingEntity> = {};

    if (createParams.indexingType !== undefined) {
      dataForUpdate[this.reindexingEntity.indexingType] = createParams?.indexingType;
    }

    if (createParams.indexingId !== undefined) {
      dataForUpdate[this.reindexingEntity.indexingId] = createParams?.indexingId;
    }

    if (createParams.errorMessage !== undefined) {
      dataForUpdate[this.reindexingEntity.errorMessage] = createParams?.errorMessage;
    }

    return this.client.request(createItem(
      this.reindexingEntity.tableName,
      dataForUpdate
    ));
  }

  async update(ids: any, updateParams: any) {
    return this.client.request(
      updateItems(
        this.reindexingEntity.tableName,
        ids,
        updateParams
      )
    );
  }

  async findAllErroredIndices() {
    return this.client.request(
      readItems(this.reindexingEntity.tableName, {
        filter: {
          [this.reindexingEntity.status]: {
            _eq: IndexingConfig.error
          },
          [this.reindexingEntity.retryCount]: {
            _lte: IndexingConfig.maxRetryCount
          }
        }
      })
    );
  }
}
