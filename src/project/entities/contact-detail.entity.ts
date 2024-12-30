import { Injectable } from '@nestjs/common';
import { integer, pgTable, varchar } from 'drizzle-orm/pg-core';
import { IEntity } from '../../app/interfaces/entity.interface';

@Injectable()
export class ContactDetailEntity implements IEntity {
  public readonly tableName: string = 'Contact_Details';

  public readonly id: string = 'id';

  public readonly phone: string = 'Phone';

  public readonly email: string = 'Email';

  public readonly website: string = 'Website';

  public readonly fax: string = 'Fax';

  public readonly dateCreated: string = 'date_created';

  public readonly dateUpdated: string = 'date_updated';

  public readonly contactDetails = pgTable(this.tableName, {
    id: integer(this.id).notNull().primaryKey(),
    phone: varchar(this.phone),
    email: varchar(this.email),
    website: varchar(this.website),
    fax: varchar(this.fax)
  });
}
