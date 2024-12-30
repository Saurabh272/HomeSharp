import { Injectable } from '@nestjs/common';
import { pgTable, uuid, varchar } from 'drizzle-orm/pg-core';
import { IEntity } from '../interfaces/entity.interface';

@Injectable()
export class DirectusFilesEntity implements IEntity {
  public readonly tableName: string = 'directus_files';

  public readonly id: string = 'id';

  public readonly filenameDisk: string = 'filename_disk';

  public readonly filenameDownload: string = 'filename_download';

  public readonly title: string = 'title';

  public readonly directusFiles = pgTable(this.tableName, {
    id: uuid(this.id).notNull().primaryKey(),
    filenameDisk: varchar(this.filenameDisk),
    filenameDownload: varchar(this.filenameDownload),
    title: varchar(this.title)
  });
}
