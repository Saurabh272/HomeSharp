import {
  integer,
  pgTable,
  text,
  uuid
} from 'drizzle-orm/pg-core';
import { Injectable } from '@nestjs/common';
import { IEntity } from '../../app/interfaces/entity.interface';

@Injectable()
export class WatermarkEntity implements IEntity {
  public readonly tableName: string = 'watermarks';

  public readonly id: string = 'id';

  public readonly status: string = 'status';

  public readonly watermarkId: string = 'watermark_id';

  public readonly errorMessage: string = 'error_message';

  public readonly additionalContext: string = 'additional_context';

  public readonly retryCount: string = 'retry_count';

  public readonly fileName: string = 'file_name';

  public readonly watermarks: any;

  constructor() {
    this.watermarks = pgTable(this.tableName, {
      id: uuid(this.id).notNull().primaryKey(),
      status: text(this.status),
      watermarkId: text(this.watermarkId),
      errorMessage: text(this.errorMessage),
      additionalContext: text(this.additionalContext),
      retryCount: integer(this.retryCount),
      fileName: text(this.fileName)
    });
  }
}
