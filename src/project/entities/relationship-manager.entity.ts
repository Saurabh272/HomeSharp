import { Injectable } from '@nestjs/common';
import { pgTable, uuid, varchar } from 'drizzle-orm/pg-core';
import { IEntity } from '../../app/interfaces/entity.interface';

@Injectable()
export class RelationshipManagerEntity implements IEntity {
  public readonly tableName: string = 'relationship_managers';

  public readonly id: string = 'id';

  public readonly name: string = 'name';

  public readonly email: string = 'email';

  public readonly phoneNumber: string = 'phone_number';

  public readonly rm: any;

  constructor() {
    this.rm = pgTable(this.tableName, {
      id: uuid(this.id).notNull().primaryKey(),
      name: varchar(this.name),
      email: varchar(this.email),
      phoneNumber: varchar(this.phoneNumber)
    });
  }
}
