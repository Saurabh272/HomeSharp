import { Injectable } from '@nestjs/common';
import { pgTable, uuid } from 'drizzle-orm/pg-core';
import { ProjectEntity } from './project.entity';
import { DirectusFilesEntity } from '../../app/entities/directus-file.entity';
import { IEntity } from '../../app/interfaces/entity.interface';

@Injectable()
export class ProjectFilesImagesEntity implements IEntity {
  public readonly tableName: string = 'Projects_files_2';

  public readonly id: string = 'id';

  public readonly directusFileId: string = 'directus_files_id';

  public readonly projectId: string = 'Projects_id';

  public readonly projectFiles: any;

  constructor(
    public readonly projectEntity: ProjectEntity,
    public readonly directusFileEntity: DirectusFilesEntity
  ) {
    this.projectFiles = pgTable(this.tableName, {
      id: uuid(this.id).notNull().primaryKey(),
      directusFileId: uuid(this.directusFileId).notNull().references(() => this.directusFileEntity.directusFiles.id),
      projectId: uuid(this.projectId).notNull().references(() => this.projectEntity.projects.id)
    });
  }
}
