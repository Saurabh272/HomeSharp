import { Injectable } from '@nestjs/common';
import {
  pgTable,
  integer,
  uuid,
  varchar
} from 'drizzle-orm/pg-core';
import { IEntity } from '../../app/interfaces/entity.interface';
import { SeoPropertiesEntity } from '../../app/entities/seo-properties.entity';
import { AddressEntity } from '../../app/entities/address.entity';
import { DirectusFilesEntity } from '../../app/entities/directus-file.entity';

@Injectable()
export class DeveloperEntity implements IEntity {
  public readonly tableName: string = 'Developers';

  public readonly id: string = 'id';

  public readonly name: string = 'Name';

  public readonly logo: string = 'Logo';

  public readonly developerWebsite: string = 'developer_website';

  public readonly contactDetails: string = 'Contact_Details';

  public readonly address: string = 'addresses';

  public readonly seoProperties: string = 'seo_properties';

  public readonly salesOfficeAddress: string = 'Sales_Office_Address';

  public readonly corporateOfficeAddress: string = 'Corporate_Office_Address';

  public readonly reraRegistrationNumber: string = 'rera_registration_number';

  public readonly foundedYear: string = 'founded_year';

  public readonly summary: string = 'summary';

  public readonly description: string = 'description';

  public readonly dateCreated: string = 'date_created';

  public readonly dateUpdated: string = 'date_updated';

  public readonly heroImage: string = 'hero_image';

  public readonly status: string = 'status';

  public readonly projectId: string = 'Projects.id';

  public readonly developerType: string = 'developer_type';

  public readonly STATUSES: Record<string, string> = {
    PUBLISHED: 'published',
    DRAFT: 'draft',
    ARCHIVED: 'archived'
  };

  public readonly developers: any;

  constructor(
    private readonly seoPropertiesEntity: SeoPropertiesEntity,
    private readonly addressEntity: AddressEntity,
    private readonly directusFilesEntity: DirectusFilesEntity
  ) {
    this.developers = pgTable(this.tableName, {
      id: uuid(this.id).notNull().primaryKey(),
      name: varchar(this.name),
      logo: uuid(this.logo)
        .notNull()
        .references(() => this.directusFilesEntity.directusFiles.id),
      website: varchar(this.developerWebsite),
      address: uuid(this.address)
        .notNull()
        .references(() => this.addressEntity.addresses.id),
      seoProperties: integer(this.seoProperties)
        .notNull()
        .references(() => this.seoPropertiesEntity.seoProperties.id),
      reraRegistrationNumber: varchar(this.reraRegistrationNumber),
      foundedYear: integer(this.foundedYear),
      summary: varchar(this.summary),
      description: varchar(this.description),
      heroImage: uuid(this.heroImage)
        .notNull()
        .references(() => this.directusFilesEntity.directusFiles.id),
      status: varchar(this.status),
      developerType: varchar(this.developerType)
    });
  }
}
