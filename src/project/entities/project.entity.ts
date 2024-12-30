import { Injectable } from '@nestjs/common';
import {
  pgTable,
  real,
  text,
  uuid,
  varchar,
  boolean,
  integer
} from 'drizzle-orm/pg-core';
import { IEntity } from '../../app/interfaces/entity.interface';
import { DirectusFilesEntity } from '../../app/entities/directus-file.entity';
import { SeoPropertiesEntity } from '../../app/entities/seo-properties.entity';
import { DeveloperEntity } from '../../developer/entities/developer.entity';
import { AddressEntity } from '../../app/entities/address.entity';
import { ContactDetailEntity } from './contact-detail.entity';
import { MicroMarketEntity } from './micro-market.entity';

@Injectable()
export class ProjectEntity implements IEntity {
  public readonly tableName: string = 'Projects';

  public readonly id: string = 'id';

  public readonly name: string = 'Name';

  public readonly shortDescription: string = 'short_description';

  public readonly description: string = 'Description';

  public readonly propertyType: string = 'property_type';

  public readonly location: string = 'Location';

  public readonly addresses: string = 'addresses';

  public readonly contactDetails = 'Contact_Details';

  public readonly projectWebsite: string = 'Project_Website';

  public readonly numberOfTowers: string = 'Number_of_Towers';

  public readonly numberOfUnits: string = 'Number_of_Units';

  public readonly numberOfUnitsSold: string = 'Number_of_Units_Sold';

  public readonly customMapImage: string = 'custom_map_image';

  public readonly propertyPicture: string = 'Property_Picture';

  public readonly projectPlan: string = 'project_plan';

  public readonly brochure: string = 'Brochure';

  public readonly hidePrice: string = 'hide_price';

  public readonly minimumPrice: string = 'minimum_price';

  public readonly maximumPrice: string = 'maximum_price';

  public readonly seoProperties: string = 'seo_properties';

  public readonly developers: string = 'Developer';

  public readonly microMarkets: string = 'micro_markets';

  public readonly featured: string = 'featured';

  public readonly mostSearched: string = 'most_searched';

  public readonly newlyLaunched: string = 'newly_launched';

  public readonly threeSixtyImage: string = 'image_360';

  public readonly microMarket : string = 'micro_markets';

  public readonly status: string = 'status';

  public readonly dateCreated: string = 'date_created';

  public readonly dateUpdated: string = 'date_updated';

  public readonly projectConfigurations: string = 'project_configurations';

  public readonly furnishingLevel: string = 'furnishing_level';

  public readonly parking: string = 'parking';

  public readonly STATUSES: Record<string, string> = {
    PUBLISHED: 'published',
    DRAFT: 'draft',
    ARCHIVED: 'archived'
  };

  public readonly watermarkAppliesTo: string[] = [
    this.propertyPicture,
    this.projectPlan,
    this.developerEntity.heroImage
  ];

  public readonly projects: any;

  constructor(
    private readonly addressEntity: AddressEntity,
    private readonly contactDetailEntity: ContactDetailEntity,
    private readonly developerEntity: DeveloperEntity,
    private readonly directusFilesEntity: DirectusFilesEntity,
    private readonly microMarketEntity: MicroMarketEntity,
    private readonly seoPropertiesEntity: SeoPropertiesEntity
  ) {
    this.projects = pgTable(this.tableName, {
      id: uuid(this.id).notNull().primaryKey(),
      name: varchar(this.name),
      shortDescription: text(this.shortDescription),
      description: text(this.description),
      propertyType: varchar(this.propertyType),
      projectWebsite: varchar(this.projectWebsite),
      contactDetails: uuid(this.contactDetails)
        .notNull()
        .references(() => this.contactDetailEntity.contactDetails.id),
      brochure: uuid(this.brochure)
        .notNull()
        .references(() => this.directusFilesEntity.directusFiles.id),
      location: varchar(this.location),
      customMapImage: uuid(this.customMapImage)
        .notNull()
        .references(() => this.directusFilesEntity.directusFiles.id),
      propertyPicture: uuid(this.propertyPicture)
        .notNull()
        .references(() => this.directusFilesEntity.directusFiles.id),
      projectPlan: uuid(this.projectPlan)
        .notNull()
        .references(() => this.directusFilesEntity.directusFiles.id),
      microMarkets: uuid(this.microMarkets)
        .notNull()
        .references(() => this.microMarketEntity.microMarkets.id),
      hidePrice: boolean(this.hidePrice),
      minimumPrice: real(this.minimumPrice),
      maximumPrice: real(this.maximumPrice),
      seoProperties: uuid(this.seoProperties)
        .notNull()
        .references(() => this.seoPropertiesEntity.seoProperties.id),
      developers: uuid(this.developers)
        .notNull()
        .references(() => this.developerEntity.developers.id),
      featured: boolean(this.featured),
      mostSearched: boolean(this.mostSearched),
      newlyLaunched: boolean(this.newlyLaunched),
      addresses: uuid(this.addresses)
        .notNull()
        .references(() => this.addressEntity.addresses.id),
      threeSixtyImage: varchar(this.threeSixtyImage),
      numberOfUnits: integer(this.numberOfUnits),
      numberOfUnitsSold: integer(this.numberOfUnitsSold),
      microMarket: varchar(this.microMarket)
        .notNull()
        .references(() => this.microMarketEntity.microMarkets.id),
      status: varchar(this.status),
      furnishingLevel: varchar(this.furnishingLevel)
    });
  }
}
