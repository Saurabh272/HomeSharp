import { pgTable, text, uuid } from 'drizzle-orm/pg-core';
import { Injectable } from '@nestjs/common';
import { IEntity } from '../interfaces/entity.interface';

@Injectable()
export class DirectusFolderEntity implements IEntity {
  public readonly tableName: string = 'directus_folders';

  public readonly id: string = 'id';

  public readonly name: string = 'name';

  public readonly directusFolders: any;

  constructor() {
    this.directusFolders = pgTable(this.tableName, {
      id: uuid(this.id).notNull().primaryKey(),
      name: text(this.name)
    });
  }
}
