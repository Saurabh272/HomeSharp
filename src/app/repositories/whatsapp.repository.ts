import { Injectable } from '@nestjs/common';
import {
  DirectusClient,
  StaticTokenClient,
  RestClient,
  readItems
} from '@directus/sdk';
import { Db } from '../utils/db.util';
import { WhatsappEntity } from '../entities/whatsapp.entity';

@Injectable()
export class WhatsappRepository {
  private client: DirectusClient<any> & StaticTokenClient<any> & RestClient<any>;

  constructor(
    private readonly db: Db,
    private readonly whatsappEntity: WhatsappEntity
  ) {
    this.client = db.getDirectusClient();
  }

  async getWhatsappTemplates(type: string) {
    const result = await this.client.request(
      readItems(this.whatsappEntity.tableName, {
        filter: {
          [this.whatsappEntity.type]: {
            _eq: type
          }
        }
      })
    );
    return result?.[0];
  }
}
