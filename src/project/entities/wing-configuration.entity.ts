import { Injectable } from '@nestjs/common';
import { pgTable, uuid } from 'drizzle-orm/pg-core';
import { WingEntity } from './wing.entity';
import { ConfigurationEntity } from './configuration.entity';
import { IEntity } from '../../app/interfaces/entity.interface';

@Injectable()
export class WingConfigurationEntity implements IEntity {
  public readonly tableName: string = 'wings_configurations';

  public readonly id: string = 'id';

  public readonly configurations: string = 'configurations';

  public readonly wings: string = 'wings';

  public readonly dateCreated: string = 'date_created';

  public readonly dateUpdated: string = 'date_updated';

  public readonly wingsConfigurations: any;

  constructor(
    public readonly wingEntity: WingEntity,
    public readonly configurationEntity: ConfigurationEntity
  ) {
    this.wingsConfigurations = pgTable(this.tableName, {
      id: uuid(this.id).notNull().primaryKey(),
      configurations: uuid(this.configurations).notNull().references(() => this.configurationEntity.configurations.id),
      wings: uuid(this.wings).notNull().references(() => this.wingEntity.wings.id)
    });
  }
}
