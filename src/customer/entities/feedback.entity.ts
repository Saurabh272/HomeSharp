import { Injectable } from '@nestjs/common';
import { IEntity } from '../../app/interfaces/entity.interface';

@Injectable()
export class FeedbackEntity implements IEntity {
  public readonly tableName: string = 'feedback';

  public readonly folders: string = 'folders';

  public readonly files: string = 'files';

  public readonly id: string = 'id';

  public readonly feedbackCategory: string = 'feedback_category';

  public readonly subject: string = 'subject';

  public readonly issueDescription: string = 'issue_description';

  public readonly attachment: string = 'attachment';
}
