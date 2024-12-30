import { Injectable } from '@nestjs/common';
import {
  and,
  desc,
  eq,
  gt,
  sql
} from 'drizzle-orm';
import {
  DirectusClient,
  RestClient,
  StaticTokenClient,
  createItem,
  updateItem
} from '@directus/sdk';
import { alias } from 'drizzle-orm/pg-core';
import { Db } from '../../app/utils/db.util';
import { CustomerEntity } from '../../customer/entities/customer.entity';
import { DirectusFieldEntity } from '../../app/entities/directus-field.entity';
import { DirectusFilesEntity } from '../../app/entities/directus-file.entity';
import { ProjectEntity } from '../entities/project.entity';
import { ProjectFilesImagesEntity } from '../entities/project-file-image.entity';
import { RelationshipManagerEntity } from '../entities/relationship-manager.entity';
import { SeoPropertiesEntity } from '../../app/entities/seo-properties.entity';
import { SiteVisitEntity } from '../entities/site-visit.entity';
import { SiteVisitStatusEntity } from '../entities/site-visit-status.entity';
import { MicroMarketEntity } from '../entities/micro-market.entity';
import { TourConfig } from '../config/tour.config';
import { UpdateTourInterface } from '../interfaces/update-tour.interface';
import { TourInterface } from '../interfaces/tour.interface';
import { GetTourFilterInterface } from '../interfaces/get-tour-filter.interface';
import { ProjectListingRepository } from './project-listing.repository';
import { GetTourDetailInterface } from '../interfaces/get-tour-detail.interface';
import { AllScheduledTourInterface } from '../interfaces/all-scheduled-tour.interface';

@Injectable()
export class TourRepository {
  private client: DirectusClient<any> & StaticTokenClient<any> & RestClient<any>;

  private readonly entities: {
    customers: any,
    directusFields: any,
    directusFiles: any,
    projectFiles: any,
    projects: any,
    rm: any,
    seoProperties: any,
    siteVisits: any,
    siteVisitStatuses: any,
    microMarkets: any
  };

  private readonly projectImageFilesDirectus: any;

  private readonly projectPictureDirectusFiles: any;

  private readonly projectSeoProperties: any;

  constructor(
    private readonly db: Db,
    private readonly customerEntity: CustomerEntity,
    private readonly directusFieldEntity: DirectusFieldEntity,
    private readonly directusFilesEntity: DirectusFilesEntity,
    private readonly projectEntity: ProjectEntity,
    private readonly projectFileEntity: ProjectFilesImagesEntity,
    private readonly rmEntity: RelationshipManagerEntity,
    private readonly seoPropertyEntity: SeoPropertiesEntity,
    private readonly siteVisitEntity: SiteVisitEntity,
    private readonly siteVisitStatusEntity: SiteVisitStatusEntity,
    private readonly microMarketEntity: MicroMarketEntity,
    private readonly projectListingRepository: ProjectListingRepository
  ) {
    this.entities = {
      customers: this.customerEntity.customers,
      directusFields: this.directusFieldEntity.directusFields,
      directusFiles: this.directusFilesEntity.directusFiles,
      projects: this.projectEntity.projects,
      projectFiles: this.projectFileEntity.projectFiles,
      rm: this.rmEntity.rm,
      seoProperties: this.seoPropertyEntity.seoProperties,
      siteVisits: this.siteVisitEntity.siteVisits,
      siteVisitStatuses: this.siteVisitStatusEntity.siteVisitStatuses,
      microMarkets: this.microMarketEntity.microMarkets
    };

    this.projectSeoProperties = alias(this.entities.seoProperties, 'projectSeoProperties');
    this.projectImageFilesDirectus = alias(this.entities.directusFiles, 'projectImageFilesDirectus');
    this.projectPictureDirectusFiles = alias(this.entities.directusFiles, 'projectPictureDirectusFiles');

    this.client = db.getDirectusClient();
  }

  getFilterQuery(user: string, filters: { slug?: string, id?: string, upcoming?: boolean }) {
    const filterQuery = sql`${this.entities.siteVisits.customer} = ${user}`;
    if (filters.slug) {
      filterQuery.append(sql` AND ${this.projectSeoProperties.slug} = ${filters.slug}`);
    }
    if (filters.id) {
      filterQuery.append(sql` AND ${this.entities.siteVisits.id} = ${filters.id}`);
    }
    if (filters.upcoming) {
      filterQuery.append(sql` AND ${this.entities.siteVisits.visitTime} > ${new Date()}`);
    }
    return filterQuery;
  }

  async getTour(user: string, filters: GetTourFilterInterface): Promise<GetTourDetailInterface[]> {
    const page = filters.page || 1;
    const pageSize = filters.limit || 10;

    const filterQuery = this.getFilterQuery(user, filters);

    return this.db.connection
      .select({
        siteVisit: {
          id: this.entities.siteVisits.id,
          visitId: this.entities.siteVisits.siteVisitId,
          visitType: this.entities.siteVisits.visitType,
          visitTime: this.entities.siteVisits.visitTime,
          cancellationReason: this.entities.siteVisits.cancellationReason,
          cancellationReasonDetails: this.entities.siteVisits.cancellationReasonDetails,
          siteVisitStatus: this.entities.siteVisitStatuses,
          dateCreated: this.entities.siteVisits.dateCreated
        },
        rm: {
          name: this.entities.rm.name,
          email: this.entities.rm.email,
          phoneNumber: this.entities.rm.phoneNumber
        },
        project: {
          name: this.entities.projects.name,
          slug: this.projectSeoProperties.slug,
          description: this.entities.projects.description,
          propertyPicture: this.projectPictureDirectusFiles.filenameDisk,
          locality: this.entities.microMarkets.name,
          lat: sql<number>`ST_Y(${this.entities.projects.location}::geometry)`,
          lng: sql<number>`ST_X(${this.entities.projects.location}::geometry)`,
          images: sql<string>`string_agg(DISTINCT ${this.projectImageFilesDirectus.filenameDisk}, ',')`
        }
      })
      .from(this.entities.siteVisits)
      .innerJoin(
        this.entities.projects,
        eq(this.entities.projects.id, this.entities.siteVisits.project)
      )
      .innerJoin(
        this.projectSeoProperties,
        eq(this.projectSeoProperties.id, this.entities.projects.seoProperties)
      )
      .innerJoin(
        this.entities.microMarkets,
        eq(this.entities.microMarkets.id, this.entities.projects.microMarkets)
      )
      .innerJoin(
        this.projectPictureDirectusFiles,
        eq(this.projectPictureDirectusFiles.id, this.entities.projects.propertyPicture)
      )
      .leftJoin(
        this.entities.projectFiles,
        eq(this.entities.projects.id, this.entities.projectFiles.projectId)
      )
      .leftJoin(
        this.projectImageFilesDirectus,
        eq(this.entities.projectFiles.directusFileId, this.projectImageFilesDirectus.id)
      )
      .innerJoin(
        this.entities.customers,
        eq(this.entities.customers.id, this.entities.siteVisits.customer)
      )
      .leftJoin(
        this.entities.rm,
        eq(this.entities.rm.id, this.entities.customers.rm)
      )
      .innerJoin(
        this.entities.siteVisitStatuses,
        eq(this.entities.siteVisitStatuses.id, this.entities.siteVisits.siteVisitStatus)
      )
      .where(filterQuery)
      .groupBy(
        this.entities.siteVisits.id,
        this.entities.siteVisitStatuses.id,
        this.entities.rm.id,
        this.entities.projects.id,
        this.projectSeoProperties.id,
        this.projectPictureDirectusFiles.id,
        this.entities.microMarkets.id
      )
      .orderBy(
        sql`CASE
          WHEN ${this.entities.siteVisits.visitTime} >= NOW() 
          THEN ${this.entities.siteVisits.visitTime}
          ELSE NULL
        END ASC`,
        sql`CASE
          WHEN ${this.entities.siteVisits.visitTime} < NOW()
          THEN ${this.entities.siteVisits.visitTime}
          ELSE NULL
        END DESC`,
        desc(this.entities.siteVisits.siteVisitId)
      )
      .offset((page - 1) * pageSize)
      .limit(pageSize);
  }

  getTourCount(user: string, filters: GetTourFilterInterface) {
    const filterQuery = this.getFilterQuery(user, filters);

    return this.db.connection
      .select({
        siteVisitCount: sql<number>`COUNT(DISTINCT ${this.entities.siteVisits.id})`
      })
      .from(this.entities.siteVisits)
      .innerJoin(
        this.entities.projects,
        eq(this.entities.projects.id, this.entities.siteVisits.project)
      )
      .innerJoin(
        this.projectSeoProperties,
        eq(this.projectSeoProperties.id, this.entities.projects.seoProperties)
      )
      .innerJoin(
        this.projectPictureDirectusFiles,
        eq(this.projectPictureDirectusFiles.id, this.entities.projects.propertyPicture)
      )
      .innerJoin(
        this.entities.customers,
        eq(this.entities.customers.id, this.entities.siteVisits.customer)
      )
      .innerJoin(
        this.entities.siteVisitStatuses,
        eq(this.entities.siteVisitStatuses.id, this.entities.siteVisits.siteVisitStatus)
      )
      .where(filterQuery)
      .groupBy(this.entities.customers.id);
  }

  async getScheduledTour(user: string, projectSlug: string) {
    const scheduledTour = await this.db.connection
      .select({
        id: this.entities.siteVisits.id
      })
      .from(this.entities.siteVisits)
      .innerJoin(
        this.entities.projects,
        eq(this.entities.projects.id, this.entities.siteVisits.project)
      )
      .innerJoin(
        this.projectSeoProperties,
        eq(this.projectSeoProperties.id, this.entities.projects.seoProperties)
      )
      .innerJoin(
        this.entities.customers,
        eq(this.entities.customers.id, this.entities.siteVisits.customer)
      )
      .innerJoin(
        this.entities.siteVisitStatuses,
        eq(this.entities.siteVisitStatuses.id, this.entities.siteVisits.siteVisitStatus)
      )
      .where(
        and(
          eq(this.entities.siteVisits.customer, user),
          eq(this.projectSeoProperties.slug, projectSlug),
          gt(this.entities.siteVisits.visitTime, new Date()),
          eq(this.entities.siteVisitStatuses.allowUpdate, true)
        )
      );
    return scheduledTour?.[0]?.id || null;
  }

  async getAllScheduledTour(user: string): Promise<AllScheduledTourInterface[]> {
    return this.db.connection
      .select({
        id: this.entities.siteVisits.id,
        visitTime: this.entities.siteVisits.visitTime
      })
      .from(this.entities.siteVisits)
      .innerJoin(
        this.entities.projects,
        eq(this.entities.projects.id, this.entities.siteVisits.project)
      )
      .innerJoin(
        this.projectSeoProperties,
        eq(this.projectSeoProperties.id, this.entities.projects.seoProperties)
      )
      .innerJoin(
        this.entities.customers,
        eq(this.entities.customers.id, this.entities.siteVisits.customer)
      )
      .innerJoin(
        this.entities.siteVisitStatuses,
        eq(this.entities.siteVisitStatuses.id, this.entities.siteVisits.siteVisitStatus)
      )
      .where(
        and(
          eq(this.entities.siteVisits.customer, user),
          gt(this.entities.siteVisits.visitTime, new Date()),
          eq(this.entities.siteVisitStatuses.allowUpdate, true)
        )
      );
  }

  // TODO: Make collection name compulsory and move method to App Module
  async getFieldChoices(field: string, collection?: string): Promise<any> {
    if (!collection) {
      collection = TourConfig.siteVisits;
    }
    const choices = await this.db.connection
      .select({
        [field]: sql`${this.directusFieldEntity.directusFields.options}::json->'choices'`
      })
      .from(this.directusFieldEntity.directusFields)
      .where(
        and(
          eq(this.directusFieldEntity.directusFields.collection, collection),
          eq(this.directusFieldEntity.directusFields.field, field)
        )
      );
    return choices?.[0]?.[field] || null;
  }

  async getSiteVisitStatuses() {
    return this.db.connection
      .select()
      .from(this.entities.siteVisitStatuses)
      .where(
        eq(this.entities.siteVisitStatuses.showToCustomer, true)
      );
  }

  async getProjectId(slug: string) {
    const projectId = await this.db.connection
      .select({
        id: this.entities.projects.id
      })
      .from(this.entities.projects)
      .innerJoin(
        this.projectSeoProperties,
        eq(this.projectSeoProperties.id, this.entities.projects.seoProperties)
      )
      .where(this.projectListingRepository.projectScopeWhereClause(eq(this.projectSeoProperties.slug, slug)));
    return projectId?.[0]?.id || null;
  }

  async updateTour(id: string, data: UpdateTourInterface) {
    const dataToUpdate: Partial<SiteVisitEntity> = this.dataMapper(data);
    await this.client.request(updateItem(
      this.siteVisitEntity.tableName,
      id,
      dataToUpdate
    ));
  }

  async insertTour(data: {
    projectId: string;
    visitType: string;
    visitTime: string;
    customer: string;
  }) {
    const dataToSave: Partial<SiteVisitEntity> = this.dataMapper(data);
    const tour = await this.client.request(createItem(this.siteVisitEntity.tableName, dataToSave));
    return {
      id: tour[this.siteVisitEntity.id],
      siteVisitId: tour[this.siteVisitEntity.siteVisitId]
    };
  }

  dataMapper(data: TourInterface) {
    const dataToSave: Partial<SiteVisitEntity> = {};
    if (data.siteVisitStatusId) {
      dataToSave[this.siteVisitEntity.siteVisitStatus] = data.siteVisitStatusId;
    }
    if (data.cancellationReason) {
      dataToSave[this.siteVisitEntity.cancellationReason] = data.cancellationReason;
    }
    if (data.cancellationReasonDetails) {
      dataToSave[this.siteVisitEntity.cancellationReasonDetails] = data.cancellationReasonDetails;
    }
    if (data.visitTime) {
      dataToSave[this.siteVisitEntity.visitTime] = data.visitTime;
    }
    if (data.visitType) {
      dataToSave[this.siteVisitEntity.visitType] = data.visitType;
    }
    if (data.customer) {
      dataToSave[this.siteVisitEntity.customer] = data.customer;
    }
    if (data.projectId) {
      dataToSave[this.siteVisitEntity.project] = data.projectId;
    }

    return dataToSave;
  }

  async getSiteVisitStatusId(statusValue: string) {
    const siteVisitStatus = await this.db.connection
      .select({
        id: this.entities.siteVisitStatuses.id
      })
      .from(this.entities.siteVisitStatuses)
      .where(
        and(
          eq(this.entities.siteVisitStatuses.value, statusValue),
          eq(this.entities.siteVisitStatuses.showToCustomer, true)
        )
      );
    return siteVisitStatus?.[0]?.id || null;
  }
}
