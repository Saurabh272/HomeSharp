import { Injectable } from '@nestjs/common';
import { integer, pgTable, uuid } from 'drizzle-orm/pg-core';
import { IEntity } from '../../app/interfaces/entity.interface';
import { ProjectEntity } from './project.entity';
import { CategoryEntity } from './category.entity';

@Injectable()
export class ProjectCategoryEntity implements IEntity {
  public readonly tableName: string = 'Projects_Categories';

  public readonly id: string = 'id';

  public readonly project: string = 'Projects_id';

  public readonly category: string = 'Categories_id';

  public readonly projectCategories: any;

  constructor(
    private readonly projectEntity: ProjectEntity,
    private readonly categoryEntity: CategoryEntity
  ) {
    this.projectCategories = pgTable(this.tableName, {
      id: integer(this.id).notNull().primaryKey(),
      project: uuid(this.project)
        .notNull()
        .references(() => this.projectEntity.projects.id),
      category: uuid(this.category)
        .notNull()
        .references(() => this.categoryEntity.categories.id)
    });
  }
}
