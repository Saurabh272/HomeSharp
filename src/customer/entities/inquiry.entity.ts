import { Injectable } from '@nestjs/common';
import { IEntity } from '../../app/interfaces/entity.interface';

@Injectable()
export class InquiryEntity implements IEntity {
  public readonly tableName: string = 'inquiries';

  public readonly name: string = 'name';

  public readonly email: string = 'email';

  public readonly subject: string = 'subject';
}
