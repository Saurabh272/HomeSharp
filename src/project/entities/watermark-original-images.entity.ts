import { Injectable } from '@nestjs/common';
import {
  pgTable,
  uuid
} from 'drizzle-orm/pg-core';
import { DirectusFilesEntity } from '../../app/entities/directus-file.entity';
import { IEntity } from '../../app/interfaces/entity.interface';

@Injectable()
export class WatermarkOriginalImageEntity implements IEntity {
  public readonly tableName: string = 'watermark_original_images';

  public readonly id: string = 'id';

  public readonly image: string = 'image';

  public readonly imageId: string = 'image.id';

  public readonly fileName: string = 'image.filename_download';

  public readonly folderName: string = 'watermark_original_images';

  public readonly watermark: any;

  constructor(
    public readonly directusFilesEntity: DirectusFilesEntity
  ) {
    this.watermark = pgTable(this.tableName, {
      id: uuid(this.id).notNull().primaryKey(),
      image: uuid(this.image).references(() => this.directusFilesEntity.directusFiles.id)
    });
  }
}
