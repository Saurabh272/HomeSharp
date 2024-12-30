import { Injectable } from '@nestjs/common';
import {
  pgTable,
  uuid,
  varchar,
  real,
  integer
} from 'drizzle-orm/pg-core';
import { IEntity } from 'src/app/interfaces/entity.interface';

@Injectable()
export class ConfigurationEntity implements IEntity {
  public readonly tableName: string = 'configurations';

  public readonly id: string = 'id';

  public readonly name: string = 'name';

  public readonly carpetArea: string = 'carpet_area';

  public readonly areaUnit: string = 'area_unit';

  public readonly availableUnit: string = 'units_available';

  public readonly soldUnit: string = 'units_sold';

  public readonly houseType: string = 'house_type';

  public readonly bedrooms: string = 'bedrooms';

  public readonly bathrooms: string = 'bathrooms';

  public readonly balconies: string = 'balconies';

  public readonly parkings: string = 'parkings';

  public readonly floorRange: string = 'floor_range';

  public readonly floorPlan: string = 'floor_plan';

  public readonly startingPrice: string = 'starting_price';

  public readonly maximumPrice: string = 'maximum_price';

  public readonly launchStatus: string = 'launch_status';

  public readonly dateCreated: string = 'date_created';

  public readonly dateUpdated: string = 'date_updated';

  public readonly configurations = pgTable(this.tableName, {
    id: uuid(this.id).notNull().primaryKey(),
    name: varchar(this.name),
    carpetArea: real(this.carpetArea),
    areaUnit: varchar(this.areaUnit),
    availableUnit: real(this.availableUnit),
    soldUnit: integer(this.soldUnit),
    houseType: varchar(this.houseType),
    bedrooms: integer(this.bedrooms),
    bathrooms: integer(this.bathrooms),
    balconies: integer(this.balconies),
    parkings: integer(this.parkings),
    floorRange: varchar(this.floorRange),
    floorPlan: uuid(this.floorPlan).notNull(),
    startingPrice: real(this.startingPrice),
    maximumPrice: real(this.maximumPrice),
    launchStatus: varchar(this.launchStatus),
    dateCreated: varchar(this.dateCreated),
    dateUpdated: varchar(this.dateUpdated)
  });
}
