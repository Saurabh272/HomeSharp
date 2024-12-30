import { Injectable, Logger } from '@nestjs/common';
import {
  DirectusClient,
  RestClient,
  StaticTokenClient,
  createItem
} from '@directus/sdk';
import { Db } from '../../app/utils/db.util';
import { EventTrackerEntity } from '../entities/event-tracker.entity';
import { Event } from '../types/event-tracker.type';
import { Transformer } from '../../app/utils/transformer.util';

@Injectable()
export class EventTrackerRepository {
  private readonly logger = new Logger(EventTrackerRepository.name);

  private client: DirectusClient<any> & StaticTokenClient<any> & RestClient<any>;

  constructor(
    private readonly db: Db,
    private readonly eventTrackerEntity: EventTrackerEntity,
    private readonly transformer: Transformer
  ) {
    this.client = db.getDirectusClient();
  }

  create(eventPayload: Event, type: string): any {
    const { params } = eventPayload;

    return this.client.request(createItem(this.eventTrackerEntity.tableName, {
      [this.eventTrackerEntity.userId]: params?.userId,
      [this.eventTrackerEntity.params]: params,
      [this.eventTrackerEntity.eventId]: eventPayload?.event_id,
      [this.eventTrackerEntity.eventName]: this.transformer.toSnakeCase(eventPayload?.event_name),
      [this.eventTrackerEntity.type]: type,
      [this.eventTrackerEntity.timestamp]: eventPayload?.timestamp
    }));
  }
}
