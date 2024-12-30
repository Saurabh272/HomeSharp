import { Injectable } from '@nestjs/common';
import { IEntity } from '../../app/interfaces/entity.interface';

@Injectable()
export class SupportRequestEntity implements IEntity {
  public readonly tableName: string = 'support_request';

  public readonly folders: string = 'folders';

  public readonly files: string = 'files';

  public readonly id: string = 'id';

  public readonly name: string = 'name';

  public readonly subject: string = 'subject';

  public readonly issueDescription: string = 'issue_description';

  public readonly attachment: string = 'attachment';
}
