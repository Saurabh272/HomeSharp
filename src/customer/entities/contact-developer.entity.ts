import { Injectable } from '@nestjs/common';
import { IEntity } from '../../app/interfaces/entity.interface';

@Injectable()
export class ContactDeveloperEntity implements IEntity {
  public readonly tableName: string = 'contact_developer';

  public readonly id: string = 'id';

  public readonly name: string = 'name';

  public readonly message: string = 'message';

  public readonly customers: string = 'customers';

  public readonly developers: string = 'Developers';
}
