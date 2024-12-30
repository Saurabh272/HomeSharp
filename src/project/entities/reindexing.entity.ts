import { Injectable } from '@nestjs/common';
import { IEntity } from '../../app/interfaces/entity.interface';

@Injectable()
export class ReindexingEntity implements IEntity {
  public readonly tableName: string = 'reindexing';

  public readonly id: string = 'id';

  public readonly status: string = 'status';

  public readonly indexingType: string = 'indexing_type';

  public readonly indexingId: string = 'indexing_id';

  public readonly errorMessage: string = 'error_message';

  public readonly retryCount: string = 'retry_count';
}
