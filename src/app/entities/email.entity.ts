import { Injectable } from '@nestjs/common';
import { IEntity } from '../interfaces/entity.interface';

@Injectable()
export class EmailEntity implements IEntity {
  public readonly tableName: string = 'email_templates';

  public readonly swnRefNo: string = 'swn_ref_no';
}
