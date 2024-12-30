import { Injectable } from '@nestjs/common';
import {
  DirectusClient, RestClient, StaticTokenClient, createItem
} from '@directus/sdk';
import { Db } from '../utils/db.util';
import { FailureLogsEntity } from '../entities/failure-logs.entity';

@Injectable()
export class FailureLogsRepository {
  private client: DirectusClient<any> & StaticTokenClient<any> & RestClient<any>;

  constructor(
    db: Db,
    private readonly failureLogsEntity: FailureLogsEntity
  ) {
    this.client = db.getDirectusClient();
  }

  private dataMapper(data: any): Partial<FailureLogsEntity> {
    const dateToSave: Partial<FailureLogsEntity> = {};
    if (data?.eventType !== undefined) {
      dateToSave[this.failureLogsEntity.eventType] = data?.eventType;
    }

    if (data?.sourceOrigin !== undefined) {
      dateToSave[this.failureLogsEntity.sourceOrigin] = data?.sourceOrigin;
    }

    if (data?.remarks !== undefined) {
      dateToSave[this.failureLogsEntity.remarks] = data?.remarks;
    }

    if (data?.recipient !== undefined) {
      dateToSave[this.failureLogsEntity.recipient] = data?.recipient;
    }

    return dateToSave;
  }

  async saveFailureLogs(data: Partial<FailureLogsEntity>): Promise<Record<string, any>> {
    return this.client.request(
      createItem(this.failureLogsEntity.tableName, this.dataMapper(data))
    );
  }
}
