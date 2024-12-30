import { Injectable } from '@nestjs/common';
import {
  json,
  pgTable,
  uuid,
  varchar
} from 'drizzle-orm/pg-core';
import { IEntity } from '../interfaces/entity.interface';

@Injectable()
export class DirectusFieldEntity implements IEntity {
  public readonly tableName: string = 'directus_fields';

  public readonly id: string = 'id';

  public readonly collection: string = 'collection';

  public readonly field: string = 'field';

  public readonly options: string = 'options';

  public readonly directusFields = pgTable(this.tableName, {
    id: uuid(this.id).notNull().primaryKey(),
    collection: varchar(this.collection),
    field: varchar(this.field),
    options: json(this.options)
  });
}
