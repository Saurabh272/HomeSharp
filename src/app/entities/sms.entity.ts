import { Injectable } from '@nestjs/common';
import { IEntity } from '../interfaces/entity.interface';

@Injectable()
export class SmsEntity implements IEntity {
  public readonly tableName: string = 'sms_templates';

  public readonly smsTemplates: string = 'templates';

  public readonly swnRefNo: string = 'swn_ref_no';

  public readonly templateId: string = 'template_id';

  public readonly entityId: string = 'entity_id';

  public readonly accountUsageTypeId: string = 'account_usage_type_id';

  public readonly senderId: string = 'sender_id';
}
