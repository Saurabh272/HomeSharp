import { Injectable } from '@nestjs/common';
import { IEntity } from '../../app/interfaces/entity.interface';

@Injectable()
export class OtherContactDetailsEntity implements IEntity {
  public readonly tableName: string = 'Projects_Contact_Details';

  public readonly id: string = 'id';

  public readonly projectsId: string = 'Projects_id';

  public readonly contactDetailsId: string = 'Contact_Details_id';
}
