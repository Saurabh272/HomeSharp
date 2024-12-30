import { Injectable } from '@nestjs/common';
import { IEntity } from '../interfaces/entity.interface';

@Injectable()
export class WhatsappEntity implements IEntity {
  public readonly tableName: string = 'whatsapp_templates';

  public readonly type: string = 'type';
}
