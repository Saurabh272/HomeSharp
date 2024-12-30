import { Injectable } from '@nestjs/common';
import { IEntity } from '../../app/interfaces/entity.interface';

@Injectable()
export class EventTrackerEntity implements IEntity {
  public readonly tableName: string = 'event_trackers';

  public readonly userId: string = 'user_id';

  public readonly eventId: string = 'event_id';

  public readonly eventName: string = 'event_name';

  public readonly type: string = 'type';

  public readonly timestamp: string = 'timestamp';

  public readonly params: string = 'params';
}
