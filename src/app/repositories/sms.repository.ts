import { Injectable } from '@nestjs/common';
import {
  DirectusClient,
  StaticTokenClient,
  RestClient,
  readItems
} from '@directus/sdk';
import { Db } from '../utils/db.util';
import { SmsEntity } from '../entities/sms.entity';
import { EmailEntity } from '../entities/email.entity';

@Injectable()
export class SmsRepository {
  private client: DirectusClient<any> & StaticTokenClient<any> & RestClient<any>;

  constructor(
    db: Db,
    private readonly smsEntity: SmsEntity,
    private readonly emailEntity: EmailEntity
  ) {
    this.client = db.getDirectusClient();
  }

  async getSmsTemplates(swnRefNo: string) {
    const result = await this.client.request(
      readItems(this.smsEntity.tableName, {
        fields: [
          this.smsEntity.smsTemplates,
          this.smsEntity.templateId,
          this.smsEntity.entityId,
          this.smsEntity.senderId,
          this.smsEntity.accountUsageTypeId
        ],
        filter: {
          [this.smsEntity.swnRefNo]: {
            _eq: swnRefNo
          }
        }
      })
    );

    return result?.[0];
  }

  async getEmailTemplates(swnRefNo: string) {
    const result = await this.client.request(
      readItems(this.emailEntity.tableName, {
        filter: {
          [this.emailEntity.swnRefNo]: {
            _eq: swnRefNo
          }
        }
      })
    );

    return result?.[0];
  }
}
