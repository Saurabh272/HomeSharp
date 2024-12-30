import { Injectable } from '@nestjs/common';
import {
  and,
  eq,
  inArray,
  isNotNull,
  ne,
  notInArray,
  SQL,
  sql,
  SQLWrapper
} from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { Db } from '../../app/utils/db.util';
import { AddressEntity } from '../../app/entities/address.entity';
import { CategoryEntity } from '../entities/category.entity';
import { ConfigurationEntity } from '../entities/configuration.entity';
import { DeveloperEntity } from '../../developer/entities/developer.entity';
import { DirectusFilesEntity } from '../../app/entities/directus-file.entity';
import { FeatureCategoryEntity } from '../entities/feature-category.entity';
import { FeatureEntity } from '../entities/feature.entity';
import { MicroMarketEntity } from '../entities/micro-market.entity';
import { ProjectCategoryEntity } from '../entities/project-category.entity';
import { ProjectEntity } from '../entities/project.entity';
import { ProjectFeatureEntity } from '../entities/project-feature.entity';
import { ProjectFilesFloorPlanEntity } from '../entities/project-file-floor-plan.entity';
import { ProjectFilesImagesEntity } from '../entities/project-file-image.entity';
import { ProjectValidationRuleEntity } from '../entities/project-validation-rule.entity';
import { ReraStageEntity } from '../entities/rera-stage.entity';
import { SeoPropertiesEntity } from '../../app/entities/seo-properties.entity';
import { WingConfigurationEntity } from '../entities/wing-configuration.entity';
import { WingEntity } from '../entities/wing.entity';
import { WishlistProjectEntity } from '../../wishlist/entities/wishlist-project.entity';
import { WishlistEntity } from '../../wishlist/entities/wishlist.entity';
import { ProjectIdentifier } from '../interfaces/project-identifier.interface';
import { ProjectDetailInterface } from '../interfaces/project-detail.interface';
import { ProjectForIndexingInterface } from '../interfaces/project-for-indexing.interface';
import { ProjectForValidationInterface } from '../interfaces/project-for-validation.interface';
import { WingConfigurationInterface } from '../interfaces/wing-configuration.interface';
import { DeveloperProjectsCountInterface } from '../interfaces/developer-projects-count.interface';
import { MicroMarketProjectsCountInterface } from '../interfaces/micro-market-projects-count.interface';
import { CustomSeoEntity } from '../entities/custom-seo.entity';
import { CollectionDetailInterface } from '../interfaces/collection-detail.interface';

@Injectable()
export class ProjectListingRepository {
  private readonly SLUG_LIMIT = 200;

  private readonly entities: {
    addresses: any,
    categories: any,
    configurations: any,
    customSeo: any,
    developers: any,
    directusFiles: any,
    featureCategories: any,
    features: any,
    microMarkets: any,
    projects: any,
    projectCategories: any,
    projectFeatures: any,
    projectFilesFloorPlan: any,
    projectFilesImages: any,
    projectValidationRules: any,
    reraStages: any,
    seoProperties: any,
    wings: any,
    wingsConfigurations: any,
    wishlist: any,
    wishlistProjects: any
  };

  // seo properties aliases
  private readonly categorySeoProperties: any;

  private readonly customCollectionSeoProperties: any;

  private readonly developerSeoProperties: any;

  private readonly microMarketSeoProperties: any;

  private readonly projectSeoProperties: any;

  // directus files aliases
  private readonly categoryDirectusFiles: any;

  private readonly developerDirectusFiles: any;

  private readonly featuresDirectusFiles: any;

  private readonly microMarketThumbnailDirectusFiles: any;

  private readonly projectBrochureDirectusFiles: any;

  private readonly projectCustomMapDirectusFiles: any;

  private readonly projectImageFilesDirectus: any;

  private readonly projectFloorPlanFilesDirectus: any;

  private readonly projectPictureDirectusFiles: any;

  private readonly projectPlanDirectusFiles: any;

  private readonly configurationFloorPlanDirectusFiles: any;

  constructor(
    private readonly db: Db,
    private readonly addressEntity: AddressEntity,
    private readonly categoryEntity: CategoryEntity,
    private readonly configurationEntity: ConfigurationEntity,
    private readonly customSeoEntity: CustomSeoEntity,
    private readonly developerEntity: DeveloperEntity,
    private readonly directusFilesEntity: DirectusFilesEntity,
    private readonly featureCategoryEntity: FeatureCategoryEntity,
    private readonly featureEntity: FeatureEntity,
    private readonly microMarketEntity: MicroMarketEntity,
    private readonly projectEntity: ProjectEntity,
    private readonly projectCategoryEntity: ProjectCategoryEntity,
    private readonly projectFeatureEntity: ProjectFeatureEntity,
    private readonly projectFilesFloorPlanEntity: ProjectFilesFloorPlanEntity,
    private readonly projectFilesImagesEntity: ProjectFilesImagesEntity,
    private readonly projectValidationRuleEntity: ProjectValidationRuleEntity,
    private readonly reraStageEntity: ReraStageEntity,
    private readonly seoPropertiesEntity: SeoPropertiesEntity,
    private readonly wingConfigurationEntity: WingConfigurationEntity,
    private readonly wingEntity: WingEntity,
    private readonly wishlistEntity: WishlistEntity,
    private readonly wishlistProjectEntity: WishlistProjectEntity
  ) {
    this.entities = {
      addresses: this.addressEntity.addresses,
      categories: this.categoryEntity.categories,
      configurations: this.configurationEntity.configurations,
      customSeo: this.customSeoEntity.customSeo,
      developers: this.developerEntity.developers,
      projects: this.projectEntity.projects,
      directusFiles: this.directusFilesEntity.directusFiles,
      featureCategories: this.featureCategoryEntity.featureCategories,
      features: this.featureEntity.features,
      microMarkets: this.microMarketEntity.microMarkets,
      projectCategories: this.projectCategoryEntity.projectCategories,
      projectFeatures: this.projectFeatureEntity.projectFeatures,
      projectFilesFloorPlan: this.projectFilesFloorPlanEntity.projectFiles,
      projectFilesImages: this.projectFilesImagesEntity.projectFiles,
      projectValidationRules: this.projectValidationRuleEntity.projectValidationRules,
      reraStages: this.reraStageEntity.reraStages,
      seoProperties: this.seoPropertiesEntity.seoProperties,
      wings: this.wingEntity.wings,
      wingsConfigurations: this.wingConfigurationEntity.wingsConfigurations,
      wishlistProjects: this.wishlistProjectEntity.wishlistProject,
      wishlist: this.wishlistEntity.wishlist
    };

    this.categorySeoProperties = alias(this.entities.seoProperties, 'categorySeoProperties');
    this.customCollectionSeoProperties = alias(this.entities.seoProperties, 'customCollectionSeoProperties');
    this.developerSeoProperties = alias(this.entities.seoProperties, 'developerSeoProperties');
    this.microMarketSeoProperties = alias(this.entities.seoProperties, 'microMarketSeoProperties');
    this.projectSeoProperties = alias(this.entities.seoProperties, 'projectSeoProperties');
    this.categoryDirectusFiles = alias(this.entities.directusFiles, 'categoryDirectusFiles');

    this.developerDirectusFiles = alias(this.entities.directusFiles, 'developerDirectusFiles');
    this.featuresDirectusFiles = alias(this.entities.directusFiles, 'featuresDirectusFiles');
    this.microMarketThumbnailDirectusFiles = alias(this.entities.directusFiles, 'microMarketThumbnailDirectusFiles');
    this.projectBrochureDirectusFiles = alias(this.entities.directusFiles, 'projectBrochureDirectusFiles');
    this.projectCustomMapDirectusFiles = alias(this.entities.directusFiles, 'projectCustomMapDirectusFiles');
    this.projectImageFilesDirectus = alias(this.entities.directusFiles, 'projectImageFilesDirectus');
    this.projectFloorPlanFilesDirectus = alias(this.entities.directusFiles, 'projectFloorPlanFilesDirectus');
    this.projectPictureDirectusFiles = alias(this.entities.directusFiles, 'projectPictureDirectusFiles');
    this.projectPlanDirectusFiles = alias(this.entities.directusFiles, 'projectPlanDirectusFiles');
    this.configurationFloorPlanDirectusFiles = alias(
      this.entities.directusFiles,
      'configurationFloorPlanDirectusFiles'
    );
  }

  projectScope(selectQuery: any) {
    return selectQuery
      .from(this.entities.projects)
      .leftJoin(
        this.projectPictureDirectusFiles,
        eq(this.projectPictureDirectusFiles.id, this.entities.projects.propertyPicture)
      )
      .innerJoin(
        this.entities.wings,
        eq(this.entities.projects.id, this.entities.wings.projects)
      )
      .innerJoin(
        this.entities.wingsConfigurations,
        eq(this.entities.wings.id, this.entities.wingsConfigurations.wings)
      )
      .innerJoin(
        this.entities.configurations,
        eq(this.entities.wingsConfigurations.configurations, this.entities.configurations.id)
      )
      .innerJoin(
        this.entities.microMarkets,
        eq(this.entities.microMarkets.id, this.entities.projects.microMarket)
      )
      .leftJoin(
        this.entities.projectCategories,
        eq(this.entities.projects.id, this.entities.projectCategories.project)
      )
      .leftJoin(
        this.entities.categories,
        eq(this.entities.projectCategories.category, this.entities.categories.id)
      )
      .leftJoin(
        this.projectPlanDirectusFiles,
        eq(this.projectPlanDirectusFiles.id, this.entities.projects.projectPlan)
      )
      .innerJoin(
        this.entities.developers,
        eq(this.entities.developers.id, this.entities.projects.developers)
      )
      .leftJoin(
        this.developerDirectusFiles,
        eq(this.developerDirectusFiles.id, this.entities.developers.logo)
      )
      .leftJoin(
        this.entities.addresses,
        eq(this.entities.addresses.id, this.entities.developers.address)
      );
  }

  projectScopeWhereClause(filterQuery: SQLWrapper) {
    return and(
      filterQuery,
      eq(this.entities.projects.status, this.projectEntity.STATUSES.PUBLISHED)
    );
  }

  async getMicroMarkets() {
    const selectQuery = this.db.connection
      .select({
        name: this.entities.microMarkets.name,
        projectsCount: sql`COUNT(DISTINCT ${this.entities.projects.id})`
      });
    const query = this.projectScope(selectQuery);
    return query
      .where(this.projectScopeWhereClause(isNotNull(this.entities.microMarkets.name)))
      .groupBy(
        this.entities.microMarkets.id
      );
  }

  async getCategories() {
    const selectQuery = this.db.connection
      .select({
        name: this.entities.categories.name,
        slug: this.categorySeoProperties.slug,
        image: this.entities.categories.image,
        title: this.entities.categories.title,
        description: this.entities.categories.description
      });
    const query = this.projectScope(selectQuery);
    return query
      .leftJoin(
        this.categoryDirectusFiles,
        eq(this.categoryDirectusFiles.id, this.entities.categories.image)
      )
      .leftJoin(
        this.categorySeoProperties,
        eq(this.entities.categories.seoProperties, this.categorySeoProperties.id)
      )
      .where(this.projectScopeWhereClause(isNotNull(this.categorySeoProperties.slug)))
      .groupBy(
        this.entities.categories.id,
        this.categorySeoProperties.id
      )
      .orderBy(
        this.entities.categories.sortOrder,
        this.entities.categories.name
      );
  }

  async getProjectSlug() {
    const selectQuery = this.db.connection
      .select({
        slug: sql`DISTINCT ${this.projectSeoProperties.slug}`
      });
    const query = this.projectScope(selectQuery);
    return query
      .leftJoin(
        this.projectSeoProperties,
        eq(this.entities.projects.seoProperties, this.projectSeoProperties.id)
      )
      .where(this.projectScopeWhereClause(isNotNull(this.projectSeoProperties.slug)))
      .limit(this.SLUG_LIMIT);
  }

  async getCategorySlug() {
    const selectQuery = this.db.connection
      .select({
        slug: sql`DISTINCT ${this.categorySeoProperties.slug}`
      });
    const query = this.projectScope(selectQuery);
    return query
      .leftJoin(
        this.categorySeoProperties,
        eq(this.entities.categories.seoProperties, this.categorySeoProperties.id)
      )
      .where(this.projectScopeWhereClause(isNotNull(this.categorySeoProperties.slug)))
      .limit(this.SLUG_LIMIT);
  }

  getDeveloperSlug() {
    const selectQuery = this.db.connection
      .select({
        slug: sql`DISTINCT ${this.developerSeoProperties.slug}`
      });
    const query = this.projectScope(selectQuery);
    return query
      .leftJoin(
        this.developerSeoProperties,
        eq(this.entities.developers.seoProperties, this.developerSeoProperties.id)
      )
      .where(this.projectScopeWhereClause(isNotNull(this.developerSeoProperties.slug)))
      .limit(this.SLUG_LIMIT);
  }

  getCollectionSlug() {
    return this.db.connection
      .select({
        slug: sql`DISTINCT ${this.customCollectionSeoProperties.slug}`
      })
      .from(this.entities.customSeo)
      .leftJoin(
        this.customCollectionSeoProperties,
        eq(this.customCollectionSeoProperties.id, this.entities.customSeo.seoProperties)
      )
      .where(
        isNotNull(this.customCollectionSeoProperties.slug)
      )
      .limit(this.SLUG_LIMIT);
  }

  getFilterQueryForSlug(slug: string | string[]) {
    if (Array.isArray(slug)) {
      return inArray(this.projectSeoProperties.slug, slug);
    }
    return eq(this.projectSeoProperties.slug, slug);
  }

  async getProjectDetails(slug: string | string[]): Promise<ProjectDetailInterface[]> {
    const filterQuery = this.getFilterQueryForSlug(slug);
    const selectQuery = this.db.connection
      .select({
        projectId: this.entities.projects.id,
        projectName: this.entities.projects.name,
        projectSlug: this.projectSeoProperties.slug,
        projectDescription: this.entities.projects.description,
        propertyType: this.entities.projects.propertyType,
        projectTitle: this.projectSeoProperties.title,
        projectPicture: sql<string>`CASE WHEN ${this.projectPictureDirectusFiles.filenameDisk} IS NULL 
            THEN '' 
            ELSE CONCAT(${this.projectPictureDirectusFiles.filenameDisk},
                ':', ${this.projectPictureDirectusFiles.title})
            END`,
        images: sql<string>`string_agg(DISTINCT CONCAT(${this.projectImageFilesDirectus.filenameDisk},
          ':', ${this.projectImageFilesDirectus.title}), ',')`,
        floorPlans: sql<string>`string_agg(DISTINCT CONCAT(${this.projectFloorPlanFilesDirectus.filenameDisk},
          ':', ${this.projectFloorPlanFilesDirectus.title}), ',')`,
        customMap: sql<string>`CASE WHEN ${this.projectCustomMapDirectusFiles.filenameDisk} IS NULL 
            THEN '' 
            ELSE CONCAT(${this.projectCustomMapDirectusFiles.filenameDisk},
                ':', ${this.projectCustomMapDirectusFiles.title})
            END`,
        projectPlan: sql<string>`CASE WHEN ${this.projectPlanDirectusFiles.filenameDisk} IS NULL 
            THEN '' 
            ELSE CONCAT(${this.projectPlanDirectusFiles.filenameDisk},
                ':', ${this.projectPlanDirectusFiles.title})
            END`,
        brochure: this.projectBrochureDirectusFiles.filenameDisk,
        launchStatus: sql`MIN(${this.entities.wings.projectStatus})`,
        hidePrice: this.entities.projects.hidePrice,
        minimumPrice: this.entities.projects.minimumPrice,
        maximumPrice: this.entities.projects.maximumPrice,
        reraRegistrationNumbers: sql`string_agg(DISTINCT ${this.entities.wings.reraRegistrationNumber}, ',')`,
        houseType: sql`MAX(${this.entities.configurations.houseType})`,
        minimumBedrooms: sql`MIN(${this.entities.configurations.bedrooms})`,
        maximumBedrooms: sql`MAX(${this.entities.configurations.bedrooms})`,
        minimumBathrooms: sql`MIN(${this.entities.configurations.bathrooms})`,
        maximumBathrooms: sql`MAX(${this.entities.configurations.bathrooms})`,
        minimumCarpetArea: sql`MIN(${this.entities.configurations.carpetArea})`,
        maximumCarpetArea: sql`MAX(${this.entities.configurations.carpetArea})`,
        areaUnit: sql`MAX(${this.entities.configurations.areaUnit})`,
        locality: this.entities.microMarkets.name,
        localitySlug: this.microMarketSeoProperties.slug,
        latitude: sql<number>`ST_Y(${this.entities.projects.location}::geometry)`,
        longitude: sql<number>`ST_X(${this.entities.projects.location}::geometry)`,
        developerName: this.entities.developers.name,
        developerSlug: this.developerSeoProperties.slug,
        developerWebsite: this.entities.developers.website,
        developerLogo: sql<string>`CASE WHEN ${this.developerDirectusFiles.filenameDisk} IS NULL 
            THEN '' 
            ELSE CONCAT(${this.developerDirectusFiles.filenameDisk},
                ':', ${this.developerDirectusFiles.title})
            END`,
        developerAddressLine1: this.entities.addresses.line1,
        developerAddressLine2: this.entities.addresses.line2,
        developerAddressCity: this.entities.addresses.city,
        developerAddressState: this.entities.addresses.state,
        developerAddressPinCode: this.entities.addresses.pinCode,
        threeSixtyImage: this.entities.projects.threeSixtyImage,
        furnishingLevel: this.entities.projects.furnishingLevel
      });
    const query = this.projectScope(selectQuery);
    return query
      .leftJoin(
        this.entities.projectFilesImages,
        eq(this.entities.projectFilesImages.projectId, this.entities.projects.id)
      )
      .leftJoin(
        this.projectImageFilesDirectus,
        eq(this.projectImageFilesDirectus.id, this.entities.projectFilesImages.directusFileId)
      )
      .leftJoin(
        this.entities.projectFilesFloorPlan,
        eq(this.entities.projectFilesFloorPlan.projectId, this.entities.projects.id)
      )
      .leftJoin(
        this.projectFloorPlanFilesDirectus,
        eq(this.projectFloorPlanFilesDirectus.id, this.entities.projectFilesFloorPlan.directusFileId)
      )
      .leftJoin(
        this.projectBrochureDirectusFiles,
        eq(this.projectBrochureDirectusFiles.id, this.entities.projects.brochure)
      )
      .leftJoin(
        this.projectCustomMapDirectusFiles,
        eq(this.projectCustomMapDirectusFiles.id, this.entities.projects.customMapImage)
      )
      .leftJoin(
        this.projectSeoProperties,
        eq(this.entities.projects.seoProperties, this.projectSeoProperties.id)
      )
      .leftJoin(
        this.developerSeoProperties,
        eq(this.entities.developers.seoProperties, this.developerSeoProperties.id)
      )
      .leftJoin(
        this.microMarketSeoProperties,
        eq(this.entities.microMarkets.seoProperties, this.microMarketSeoProperties.id)
      )
      .where(this.projectScopeWhereClause(filterQuery))
      .groupBy(
        this.entities.projects.id,
        this.projectSeoProperties.id,
        this.projectPictureDirectusFiles.id,
        this.projectPlanDirectusFiles.id,
        this.projectBrochureDirectusFiles.id,
        this.projectCustomMapDirectusFiles.id,
        this.entities.developers.id,
        this.developerSeoProperties.id,
        this.developerDirectusFiles.id,
        this.entities.microMarkets.id,
        this.entities.addresses.id,
        this.microMarketSeoProperties.id
      );
  }

  async getWingsConfigurations(slug: string | string[]): Promise<WingConfigurationInterface[]> {
    const filterQuery = this.getFilterQueryForSlug(slug);
    return this.db.connection
      .select({
        projectId: this.entities.projects.id,
        wingName: this.entities.wings.name,
        completionDate: this.entities.wings.completionDate,
        configurationId: this.entities.configurations.id,
        configurationName: this.entities.configurations.name,
        projectStatus: this.entities.wings.projectStatus,
        floorPlan: sql<string>`CASE WHEN ${this.configurationFloorPlanDirectusFiles.filenameDisk} IS NULL 
            THEN '' 
            ELSE CONCAT(${this.configurationFloorPlanDirectusFiles.filenameDisk},
                ':', ${this.configurationFloorPlanDirectusFiles.title})
            END`,
        bedrooms: this.entities.configurations.bedrooms,
        houseType: this.entities.configurations.houseType,
        bathrooms: this.entities.configurations.bathrooms,
        carpetArea: this.entities.configurations.carpetArea,
        areaUnit: this.entities.configurations.areaUnit
      })
      .from(this.entities.projects)
      .innerJoin(
        this.projectSeoProperties,
        eq(this.projectSeoProperties.id, this.entities.projects.seoProperties)
      )
      .innerJoin(
        this.entities.wings,
        eq(this.entities.wings.projects, this.entities.projects.id)
      )
      .innerJoin(
        this.entities.wingsConfigurations,
        eq(this.entities.wingsConfigurations.wings, this.entities.wings.id)
      )
      .innerJoin(
        this.entities.configurations,
        eq(this.entities.configurations.id, this.entities.wingsConfigurations.configurations)
      )
      .leftJoin(
        this.configurationFloorPlanDirectusFiles,
        eq(this.configurationFloorPlanDirectusFiles.id, this.entities.configurations.floorPlan)
      )
      .where(this.projectScopeWhereClause(filterQuery))
      .groupBy(
        this.entities.projects.id,
        this.entities.wings.id,
        this.entities.configurations.id,
        this.configurationFloorPlanDirectusFiles.id
      );
  }

  async getFeatures(slug: string | string[]) {
    const filterQuery = this.getFilterQueryForSlug(slug);
    return this.db.connection
      .select({
        projectId: this.entities.projects.id,
        projectName: this.entities.projects.name,
        featureCategoryId: this.entities.featureCategories.id,
        featureCategory: this.entities.featureCategories.label,
        featureName: this.entities.features.name,
        featureList: sql`CAST(${this.entities.features.featureList} AS jsonb)`,
        keyHighlight: this.entities.features.keyHighlight,
        featureImage: sql<string>`CASE WHEN ${this.featuresDirectusFiles.filenameDisk} IS NULL 
            THEN '' 
            ELSE CONCAT(${this.featuresDirectusFiles.filenameDisk},
                ':', ${this.featuresDirectusFiles.title})
            END`
      })
      .from(this.entities.projects)
      .innerJoin(
        this.projectSeoProperties,
        eq(this.projectSeoProperties.id, this.entities.projects.seoProperties)
      )
      .innerJoin(
        this.entities.projectFeatures,
        eq(this.entities.projectFeatures.project, this.entities.projects.id)
      )
      .innerJoin(
        this.entities.features,
        eq(this.entities.features.id, this.entities.projectFeatures.feature)
      )
      .innerJoin(
        this.entities.featureCategories,
        eq(this.entities.featureCategories.id, this.entities.features.featuresCategories)
      )
      .leftJoin(
        this.featuresDirectusFiles,
        eq(this.featuresDirectusFiles.id, this.entities.features.image)
      )
      .where(this.projectScopeWhereClause(filterQuery));
  }

  async getWishlistProjects(customerId: string) {
    return this.db.connection
      .select({
        projectSlug: this.projectSeoProperties.slug,
        wishlistId: sql`string_agg(DISTINCT ${this.entities.wishlist.id}::text, ',')`
      })
      .from(this.entities.wishlist)
      .leftJoin(
        this.entities.wishlistProjects,
        eq(this.entities.wishlistProjects.wishlistId, this.entities.wishlist.id)
      )
      .leftJoin(
        this.entities.projects,
        eq(this.entities.projects.id, this.entities.wishlistProjects.projectId)
      )
      .leftJoin(
        this.projectSeoProperties,
        eq(this.projectSeoProperties.id, this.entities.projects.seoProperties)
      )
      .where(this.projectScopeWhereClause(eq(this.entities.wishlist.customerId, customerId)))
      .groupBy(
        this.projectSeoProperties.slug
      );
  }

  getProjectIdWithWingId(wingId: string) {
    return this.db.connection
      .select({
        projectId: this.entities.projects.id
      })
      .from(this.entities.projects)
      .leftJoin(
        this.entities.wings,
        eq(this.entities.projects.id, this.entities.wings.projects)
      )
      .where(this.projectScopeWhereClause(eq(this.entities.wings.id, wingId)));
  }

  getProjectIdWithConfigurationId(configurationId: string) {
    return this.db.connection
      .selectDistinctOn([this.entities.projects.id], {
        projectId: this.entities.projects.id
      })
      .from(this.entities.projects)
      .innerJoin(
        this.entities.wings,
        eq(this.entities.projects.id, this.entities.wings.projects)
      )
      .innerJoin(
        this.entities.wingsConfigurations,
        eq(this.entities.wings.id, this.entities.wingsConfigurations.wings)
      )
      .innerJoin(
        this.entities.configurations,
        eq(this.entities.wingsConfigurations.configurations, this.entities.configurations.id)
      )
      .where(this.projectScopeWhereClause(eq(this.entities.configurations.id, configurationId)));
  }

  getProjectIdWithDeveloperId(developerId: string) {
    return this.db.connection
      .select({
        projectId: this.entities.projects.id
      })
      .from(this.entities.projects)
      .where(this.projectScopeWhereClause(eq(this.entities.projects.developers, developerId)));
  }

  getProjectIdWithAddressId(addressId: string) {
    return this.db.connection
      .select({
        projectId: this.entities.projects.id
      })
      .from(this.entities.projects)
      .leftJoin(
        this.entities.developers,
        eq(this.entities.projects.developers, this.entities.developers.id)
      )
      .where(this.projectScopeWhereClause(eq(this.entities.developers.address, addressId)));
  }

  getFilterQueryForProjectId(project: ProjectIdentifier): SQL<any> {
    if (project.projectId) {
      return eq(this.entities.projects.id, project.projectId);
    }
    if (project.wingId) {
      return inArray(this.entities.projects.id, this.getProjectIdWithWingId(project.wingId));
    }
    if (project.configurationId) {
      return inArray(this.entities.projects.id, this.getProjectIdWithConfigurationId(project.configurationId));
    }
    if (project.developerId) {
      return inArray(this.entities.projects.id, this.getProjectIdWithDeveloperId(project.developerId));
    }
    if (project.addressId) {
      return inArray(this.entities.projects.id, this.getProjectIdWithAddressId(project.addressId));
    }
  }

  async getProjectForIndexing(project: ProjectIdentifier): Promise<ProjectForIndexingInterface[]> {
    const filterSubQuery = this.getFilterQueryForProjectId(project);
    const selectQuery = this.db.connection
      .select({
        projectId: this.entities.projects.id,
        projectName: this.entities.projects.name,
        projectSlug: this.projectSeoProperties.slug,
        summary: this.entities.projects.shortDescription,
        propertyType: this.entities.projects.propertyType,
        projectPicture: sql`CONCAT(${this.projectPictureDirectusFiles.filenameDisk}, 
          ':', ${this.projectPictureDirectusFiles.title})`,
        images: sql`string_agg(DISTINCT CONCAT(${this.projectImageFilesDirectus.filenameDisk},
          ':', ${this.projectImageFilesDirectus.title}), ',')`,
        projectPlan: sql`CONCAT(${this.projectPlanDirectusFiles.filenameDisk},
          ':', ${this.projectPlanDirectusFiles.title})`,
        brochure: this.projectBrochureDirectusFiles.filenameDisk,
        latitude: sql`ST_Y(${this.entities.projects.location}::geometry)`,
        longitude: sql`ST_X(${this.entities.projects.location}::geometry)`,
        featured: this.entities.projects.featured,
        mostSearched: this.entities.projects.mostSearched,
        newlyLaunched: this.entities.projects.newlyLaunched,
        currentStatus: sql`MIN(${this.entities.wings.projectStatus})`,
        completionDate: sql`MIN(${this.entities.wings.completionDate})`,
        hidePrice: this.entities.projects.hidePrice,
        minimumPrice: this.entities.projects.minimumPrice,
        maximumPrice: this.entities.projects.maximumPrice,
        reraRegistrationNumbers: sql`string_agg(DISTINCT ${this.entities.wings.reraRegistrationNumber}, ',')`,
        houseType: sql`MAX(${this.entities.configurations.houseType})`,
        minimumBedrooms: sql`MIN(${this.entities.configurations.bedrooms})`,
        maximumBedrooms: sql`MAX(${this.entities.configurations.bedrooms})`,
        minimumBathrooms: sql`MIN(${this.entities.configurations.bathrooms})`,
        maximumBathrooms: sql`MAX(${this.entities.configurations.bathrooms})`,
        minimumCarpetArea: sql`MIN(${this.entities.configurations.carpetArea})`,
        maximumCarpetArea: sql`MAX(${this.entities.configurations.carpetArea})`,
        areaUnit: sql`MAX(${this.entities.configurations.areaUnit})`,
        microMarketId: this.entities.microMarkets.id,
        localityName: this.entities.microMarkets.name,
        localitySlug: this.microMarketSeoProperties.slug,
        microMarket: this.entities.microMarkets.name,
        numberOfUnits: this.entities.projects.numberOfUnits,
        numberOfUnitsSold: this.entities.projects.numberOfUnitsSold,
        developer: this.entities.developers.name,
        developerSlug: this.developerSeoProperties.slug,
        developerWebsite: this.entities.developers.website,
        developerLogo: sql`CONCAT(${this.developerDirectusFiles.filenameDisk},
          ':', ${this.developerDirectusFiles.title})`,
        developerAddressLine1: this.entities.addresses.line1,
        developerAddressLine2: this.entities.addresses.line2,
        developerAddressCity: this.entities.addresses.city,
        developerAddressState: this.entities.addresses.state,
        developerAddressPinCode: this.entities.addresses.pinCode,
        categories: sql`string_agg(DISTINCT ${this.entities.categories.name}, ',')`,
        categorySlugs: sql`string_agg(DISTINCT ${this.categorySeoProperties.slug}, ',')`,
        furnishingLevel: this.entities.projects.furnishingLevel
      });

    return this.projectScope(selectQuery)
      .leftJoin(
        this.entities.projectFilesImages,
        eq(this.entities.projectFilesImages.projectId, this.entities.projects.id)
      )
      .leftJoin(
        this.projectImageFilesDirectus,
        eq(this.projectImageFilesDirectus.id, this.entities.projectFilesImages.directusFileId)
      )
      .leftJoin(
        this.projectBrochureDirectusFiles,
        eq(this.projectBrochureDirectusFiles.id, this.entities.projects.brochure)
      )
      .innerJoin(
        this.projectSeoProperties,
        eq(this.entities.projects.seoProperties, this.projectSeoProperties.id)
      )
      .leftJoin(
        this.microMarketSeoProperties,
        eq(this.entities.microMarkets.seoProperties, this.microMarketSeoProperties.id)
      )
      .innerJoin(
        this.developerSeoProperties,
        eq(this.entities.developers.seoProperties, this.developerSeoProperties.id)
      )
      .leftJoin(
        this.categorySeoProperties,
        eq(this.entities.categories.seoProperties, this.categorySeoProperties.id)
      )
      .where(this.projectScopeWhereClause(filterSubQuery))
      .groupBy(
        this.entities.projects.id,
        this.projectSeoProperties.id,
        this.projectPictureDirectusFiles.id,
        this.projectPlanDirectusFiles.id,
        this.projectBrochureDirectusFiles.id,
        this.entities.developers.id,
        this.developerDirectusFiles.id,
        this.entities.addresses.id,
        this.entities.microMarkets.id,
        this.microMarketSeoProperties.id,
        this.developerSeoProperties.id
      );
  }

  async getDeveloperForIndexing(developerId: string) {
    return this.db.connection
      .select({
        developerId: this.entities.developers.id,
        developerName: this.entities.developers.name,
        developerSlug: this.developerSeoProperties.slug,
        developerWebsite: this.entities.developers.website,
        developerLogo: sql`CONCAT(${this.developerDirectusFiles.filenameDisk},
          ':', ${this.developerDirectusFiles.title})`,
        developerAddressLine1: this.entities.addresses.line1,
        developerAddressLine2: this.entities.addresses.line2,
        developerAddressCity: this.entities.addresses.city,
        developerAddressState: this.entities.addresses.state,
        developerAddressPinCode: this.entities.addresses.pinCode,
        developerType: this.entities.developers.developerType
      })
      .from(this.entities.developers)
      .innerJoin(
        this.developerSeoProperties,
        eq(this.developerSeoProperties.id, this.entities.developers.seoProperties)
      )
      .leftJoin(
        this.developerDirectusFiles,
        eq(this.developerDirectusFiles.id, this.entities.developers.logo)
      )
      .leftJoin(
        this.entities.addresses,
        eq(this.entities.addresses.id, this.entities.developers.address)
      )
      .where(and(
        eq(this.entities.developers.id, developerId),
        eq(this.entities.developers.status, this.developerEntity.STATUSES.PUBLISHED)
      ));
  }

  async getMicroMarketForIndexing(microMarketId: string) {
    const selectQuery = this.db.connection
      .selectDistinctOn([this.entities.microMarkets.id], {
        microMarketId: this.entities.microMarkets.id,
        microMarketName: this.entities.microMarkets.name,
        microMarketSlug: this.microMarketSeoProperties.slug,
        microMarketThumbnail: this.microMarketThumbnailDirectusFiles.filenameDisk,
        default: this.entities.microMarkets.default,
        latitude: sql`ST_Y(${this.entities.microMarkets.location}::geometry)`,
        longitude: sql`ST_X(${this.entities.microMarkets.location}::geometry)`
      });
    return this.projectScope(selectQuery)
      .leftJoin(
        this.microMarketSeoProperties,
        eq(this.microMarketSeoProperties.id, this.entities.microMarkets.seoProperties)
      )
      .leftJoin(
        this.microMarketThumbnailDirectusFiles,
        eq(this.microMarketThumbnailDirectusFiles.id, this.entities.microMarkets.microMarketThumbnail)
      )
      .where(this.projectScopeWhereClause(and(
        eq(this.entities.microMarkets.id, microMarketId),
        eq(this.entities.microMarkets.status, this.microMarketEntity.STATUSES.PUBLISHED)
      )));
  }

  async getAllProjectIds() {
    return this.db.connection
      .selectDistinctOn([this.projectEntity.projects.id], {
        projectId: this.entities.projects.id
      })
      .from(this.entities.projects)
      .where(eq(this.entities.projects.status, this.projectEntity.STATUSES.PUBLISHED));
  }

  async getAllDeveloperIds() {
    return this.db.connection
      .selectDistinctOn([this.developerEntity.developers.id], {
        developerId: this.entities.developers.id
      })
      .from(this.entities.developers);
  }

  async getAllMicroMarketIds(): Promise<{ microMarketId: string }[]> {
    const selectQuery = this.db.connection
      .selectDistinctOn([this.microMarketEntity.microMarkets.id], {
        microMarketId: sql<string>`${this.entities.microMarkets.id}::text`
      });
    return this.projectScope(selectQuery)
      .where(this.projectScopeWhereClause(isNotNull(this.entities.microMarkets.id)));
  }

  async getProjectDetailsForValidation(projectIds: string[]): Promise<ProjectForValidationInterface[]> {
    return this.db.connection
      .selectDistinctOn([this.projectEntity.projects.id], {
        projectId: this.entities.projects.id,
        projectStatus: this.entities.projects.status,
        projectName: this.entities.projects.name,
        projectSummary: this.entities.projects.shortDescription,
        projectSlug: this.projectSeoProperties.slug,
        projectPicture: this.projectPictureDirectusFiles.filenameDisk,
        images: sql`string_agg(DISTINCT ${this.projectImageFilesDirectus.filenameDisk}, ',')`,
        projectPlan: this.projectPlanDirectusFiles.filenameDisk,
        brochure: this.projectBrochureDirectusFiles.filenameDisk,
        launchStatus: sql`MIN(${this.entities.wings.projectStatus})`,
        minimumPrice: this.entities.projects.minimumPrice,
        maximumPrice: this.entities.projects.maximumPrice,
        wingIds: sql`string_agg(DISTINCT ${this.entities.wings.id}::text, ',')`,
        configurationIds: sql`string_agg(DISTINCT ${this.entities.configurations.id}::text, ',')`,
        wingsConfigurations: sql`string_agg(DISTINCT ${this.entities.wingsConfigurations.id}::text, ',')`,
        microMarketId: this.entities.microMarkets.id,
        categories: sql`string_agg(DISTINCT ${this.entities.categories.name}, ',')`,
        features: sql`string_agg(DISTINCT ${this.entities.projectFeatures.id}::text, ',')`,
        projectLocation: this.entities.projects.location,
        developerId: this.entities.developers.id
      })
      .from(this.entities.projects)
      .leftJoin(
        this.projectSeoProperties,
        eq(this.projectSeoProperties.id, this.entities.projects.seoProperties)
      )
      .leftJoin(
        this.projectPictureDirectusFiles,
        eq(this.projectPictureDirectusFiles.id, this.entities.projects.propertyPicture)
      )
      .leftJoin(
        this.entities.wings,
        eq(this.entities.projects.id, this.entities.wings.projects)
      )
      .leftJoin(
        this.entities.wingsConfigurations,
        eq(this.entities.wings.id, this.entities.wingsConfigurations.wings)
      )
      .leftJoin(
        this.entities.configurations,
        eq(this.entities.wingsConfigurations.configurations, this.entities.configurations.id)
      )
      .leftJoin(
        this.entities.microMarkets,
        eq(this.entities.microMarkets.id, this.entities.projects.microMarket)
      )
      .leftJoin(
        this.entities.projectCategories,
        eq(this.entities.projects.id, this.entities.projectCategories.project)
      )
      .leftJoin(
        this.entities.categories,
        eq(this.entities.projectCategories.category, this.entities.categories.id)
      )
      .leftJoin(
        this.projectPlanDirectusFiles,
        eq(this.projectPlanDirectusFiles.id, this.entities.projects.projectPlan)
      )
      .leftJoin(
        this.entities.developers,
        eq(this.entities.developers.id, this.entities.projects.developers)
      )
      .leftJoin(
        this.developerDirectusFiles,
        eq(this.developerDirectusFiles.id, this.entities.developers.logo)
      )
      .leftJoin(
        this.projectBrochureDirectusFiles,
        eq(this.projectBrochureDirectusFiles.id, this.entities.projects.brochure)
      )
      .leftJoin(
        this.entities.projectFilesImages,
        eq(this.entities.projectFilesImages.projectId, this.entities.projects.id)
      )
      .leftJoin(
        this.projectImageFilesDirectus,
        eq(this.projectImageFilesDirectus.id, this.entities.projectFilesImages.directusFileId)
      )
      .leftJoin(
        this.entities.projectFeatures,
        eq(this.entities.projectFeatures.project, this.entities.projects.id)
      )
      .where(inArray(this.entities.projects.id, projectIds))
      .groupBy(
        this.entities.projects.id,
        this.projectSeoProperties.id,
        this.projectPictureDirectusFiles.id,
        this.projectPlanDirectusFiles.id,
        this.projectBrochureDirectusFiles.id,
        this.entities.microMarkets.id,
        this.entities.developers.id
      );
  }

  async getWingsConfigurationsForValidation(projectId: string[]): Promise<any[]> {
    return this.db.connection
      .select({
        wingId: this.entities.wings.id,
        wingProjectStatus: this.entities.wings.projectStatus,
        completionDate: this.entities.wings.completionDate,
        reraRegistrationNumber: this.entities.wings.reraRegistrationNumber,
        configurationId: this.entities.configurations.id,
        bedrooms: this.entities.configurations.bedrooms,
        bathrooms: this.entities.configurations.bathrooms,
        balconies: this.entities.configurations.balconies,
        parkings: this.entities.configurations.parkings,
        carpetArea: this.entities.configurations.carpetArea
      })
      .from(this.entities.projects)
      .innerJoin(
        this.entities.wings,
        eq(this.entities.wings.projects, this.entities.projects.id)
      )
      .leftJoin(
        this.entities.wingsConfigurations,
        eq(this.entities.wingsConfigurations.wings, this.entities.wings.id)
      )
      .leftJoin(
        this.entities.configurations,
        eq(this.entities.configurations.id, this.entities.wingsConfigurations.configurations)
      )
      .where(eq(this.entities.projects.id, projectId))
      .groupBy(
        this.entities.projects.id,
        this.entities.wings.id,
        this.entities.configurations.id
      );
  }

  async getValidationRules(collection: string) {
    return this.db.connection
      .select({
        field: this.entities.projectValidationRules.projectField,
        label: this.entities.projectValidationRules.fieldLabel
      })
      .from(this.entities.projectValidationRules)
      .where(and(
        eq(this.entities.projectValidationRules.toBeValidated, true),
        eq(this.entities.projectValidationRules.collection, collection)
      ));
  }

  async getProjectsCountByMicroMarketId(microMarketId: string, projectsIds: string[]):
  Promise<MicroMarketProjectsCountInterface[]> {
    return this.db.connection
      .select({
        microMarketId: this.entities.projects.microMarkets,
        projectsCount: sql<number>`COUNT(DISTINCT ${this.entities.projects.id})`
      })
      .from(this.entities.projects)
      .where(
        this.projectScopeWhereClause(
          and(
            notInArray(this.entities.projects.id, projectsIds),
            eq(this.entities.projects.microMarket, microMarketId)
          )
        )
      )
      .groupBy(this.entities.projects.microMarkets);
  }

  async getActiveProjectsCountByDeveloperId(developerIds: string[]): Promise<DeveloperProjectsCountInterface[]> {
    return this.db.connection
      .select({
        developerId: this.entities.projects.developers,
        projectsCount: sql<number>`COUNT(DISTINCT ${this.entities.projects.id})`
      })
      .from(this.entities.projects)
      .where(
        this.projectScopeWhereClause(
          and(
            inArray(this.entities.projects.developers, developerIds),
            ne(this.entities.projects.status, this.projectEntity.STATUSES.ARCHIVED)
          )
        )
      )
      .groupBy(this.entities.projects.developers);
  }

  async getActiveProjectsCountByMicroMarketId(microMarketIds: string[]): Promise<MicroMarketProjectsCountInterface[]> {
    return this.db.connection
      .select({
        microMarketId: this.entities.projects.microMarket,
        projectsCount: sql<number>`COUNT(DISTINCT ${this.entities.projects.id})`
      })
      .from(this.entities.projects)
      .where(
        this.projectScopeWhereClause(
          and(
            inArray(this.entities.projects.microMarket, microMarketIds),
            ne(this.entities.projects.status, this.projectEntity.STATUSES.ARCHIVED)
          )
        )
      )
      .groupBy(this.entities.projects.microMarket);
  }

  async getCollectionDetails(collectionSlug: string): Promise<CollectionDetailInterface[]> {
    return this.db.connection
      .select({
        id: this.entities.customSeo.id,
        name: this.entities.customSeo.name,
        filters: this.entities.customSeo.filters,
        description: this.entities.customSeo.description
      })
      .from(this.entities.customSeo)
      .innerJoin(
        this.customCollectionSeoProperties,
        eq(this.customCollectionSeoProperties.id, this.entities.customSeo.seoProperties)
      )
      .where(eq(this.customCollectionSeoProperties.slug, collectionSlug));
  }
}
