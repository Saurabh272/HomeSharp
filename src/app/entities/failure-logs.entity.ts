import { Injectable } from '@nestjs/common';
import { IEntity } from '../interfaces/entity.interface';

@Injectable()
export class FailureLogsEntity implements IEntity {
  public readonly tableName: string = 'failure_logs';

  public readonly eventType: string = 'event_type';

  public readonly sourceOrigin: string = 'source_origin';

  public readonly remarks: string = 'remarks';

  public readonly recipient: string = 'recipient';
}
