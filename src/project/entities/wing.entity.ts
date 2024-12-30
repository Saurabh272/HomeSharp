import { Injectable } from '@nestjs/common';
import {
  date,
  integer,
  pgTable,
  uuid,
  varchar
} from 'drizzle-orm/pg-core';
import { IEntity } from '../../app/interfaces/entity.interface';
import { AddressEntity } from '../../app/entities/address.entity';
import { ReraStageEntity } from './rera-stage.entity';
import { ProjectEntity } from './project.entity';
import { DirectusFilesEntity } from '../../app/entities/directus-file.entity';

@Injectable()
export class WingEntity implements IEntity {
  public readonly tableName: string = 'wings';

  public readonly id: string = 'id';

  public readonly name: string = 'name';

  public readonly totalFloors: string = 'total_floors';

  public readonly completionDate: string = 'completion_date';

  // TODO: Remove Floor Plan from Wing Entity and replace with Floor Plan in Configuration Entity
  public readonly floorPlan: string = 'floor_plan';

  public readonly reraRegistrationNumber: string = 'rera_registration_number';

  public readonly reraStage: string = 'rera_stage';

  public readonly projectStatus: string = 'project_status';

  public readonly projects: string = 'Projects';

  public readonly addresses: string = 'addresses';

  public readonly dateCreated: string = 'date_created';

  public readonly dateUpdated: string = 'date_updated';

  public readonly wings: any;

  constructor(
    public readonly addressEntity: AddressEntity,
    public readonly directusFilesEntity: DirectusFilesEntity,
    public readonly projectEntity: ProjectEntity,
    public readonly reraStageEntity: ReraStageEntity
  ) {
    this.wings = pgTable(this.tableName, {
      id: uuid(this.id).notNull().primaryKey(),
      name: varchar(this.name),
      totalFloors: integer(this.totalFloors),
      completionDate: date(this.completionDate),
      floorPlan: uuid(this.floorPlan)
        .notNull()
        .references(() => this.directusFilesEntity.directusFiles.id),
      reraRegistrationNumber: varchar(this.reraRegistrationNumber),
      reraStage: integer(this.reraStage)
        .notNull()
        .references(() => this.reraStageEntity.reraStages.id),
      projectStatus: integer(this.projectStatus),
      projects: uuid(this.projects)
        .notNull()
        .references(() => this.projectEntity.projects.id),
      addresses: uuid(this.addresses)
        .notNull()
        .references(() => this.addressEntity.addresses.id)
    });
  }
}
