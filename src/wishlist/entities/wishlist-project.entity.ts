import { Injectable } from '@nestjs/common';
import {
  pgTable,
  uuid, varchar
} from 'drizzle-orm/pg-core';
import { IEntity } from '../../app/interfaces/entity.interface';
import { WishlistEntity } from './wishlist.entity';
import { ProjectEntity } from '../../project/entities/project.entity';

@Injectable()
export class WishlistProjectEntity implements IEntity {
  public readonly tableName: string = 'wishlist_projects';

  public readonly id: string = 'id';

  public readonly wishlistId: string = 'wishlist_id';

  public readonly projectId: string = 'project_id';

  public readonly dateCreated: string = 'date_created';

  public readonly dateUpdated: string = 'date_updated';

  public readonly wishlistProject: any;

  constructor(
    public readonly wishlistEntity: WishlistEntity,
    public readonly projectEntity: ProjectEntity
  ) {
    this.wishlistProject = pgTable(this.tableName, {
      id: uuid(this.id).notNull().primaryKey(),
      wishlistId: uuid(this.wishlistId)
        .notNull()
        .references(() => this.wishlistEntity.wishlist.id),
      projectId: uuid(this.projectId)
        .notNull()
        .references(() => this.projectEntity.projects.id),
      dateCreated: varchar(this.dateCreated).notNull()
    });
  }
}
