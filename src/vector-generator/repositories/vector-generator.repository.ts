import { Injectable, Logger } from '@nestjs/common';
import {
  and, eq, ne, sql
} from 'drizzle-orm';
import { Db } from '../../app/utils/db.util';
import { ProjectEntity } from '../../project/entities/project.entity';
import { ConfigurationEntity } from '../../project/entities/configuration.entity';
import { WingConfigurationEntity } from '../../project/entities/wing-configuration.entity';
import { WingEntity } from '../../project/entities/wing.entity';
import { ProjectVectorEntity } from '../entities/project-vector.entity';
import { SeoPropertiesEntity } from '../../app/entities/seo-properties.entity';

@Injectable()
export class VectorGeneratorRepository {
  private readonly logger = new Logger(VectorGeneratorRepository.name);

  private readonly entities: {
    configurations: any;
    projects: any;
    projectVectors: any;
    seoProperties: any;
    wingConfigurations: any;
    wings: any;
  };

  constructor(
    private readonly db: Db,
    private readonly configurationEntity: ConfigurationEntity,
    private readonly projectEntity: ProjectEntity,
    private readonly projectVectorEntity: ProjectVectorEntity,
    private readonly seoPropertiesEntity: SeoPropertiesEntity,
    private readonly wingConfigurationEntity: WingConfigurationEntity,
    private readonly wingEntity: WingEntity
  ) {
    this.entities = {
      configurations: this.configurationEntity.configurations,
      projects: this.projectEntity.projects,
      projectVectors: this.projectVectorEntity.projectVectors,
      seoProperties: this.seoPropertiesEntity.seoProperties,
      wingConfigurations: this.wingConfigurationEntity.wingsConfigurations,
      wings: this.wingEntity.wings
    };
  }

  async getProjectStatistics() {
    return this.db.connection
      .select({
        minimumPrice: {
          min: sql`min(${this.entities.projects.minimumPrice})`,
          max: sql`max(${this.entities.projects.minimumPrice})`,
          diff: sql`max(${this.entities.projects.minimumPrice}) - min(${this.entities.projects.minimumPrice})`
        },
        maximumPrice: {
          min: sql`min(${this.entities.projects.maximumPrice})`,
          max: sql`max(${this.entities.projects.maximumPrice})`,
          diff: sql`max(${this.entities.projects.maximumPrice}) - min(${this.entities.projects.maximumPrice})`
        },
        longitude: {
          min: sql`min(ST_X(${this.entities.projects.location}::geometry))`,
          max: sql`max(ST_X(${this.entities.projects.location}::geometry))`,
          diff: sql`max(ST_X(${this.entities.projects.location}::geometry))
            - min(ST_X(${this.entities.projects.location}::geometry))`
        },
        latitude: {
          min: sql`min(ST_Y(${this.entities.projects.location}::geometry))`,
          max: sql`max(ST_Y(${this.entities.projects.location}::geometry))`,
          diff: sql`max(ST_Y(${this.entities.projects.location}::geometry))
            - min(ST_Y(${this.entities.projects.location}::geometry))`
        }
      })
      .from(this.entities.projects)
      .where(eq(this.entities.projects.status, this.projectEntity.STATUSES.PUBLISHED));
  }

  async getConfigurationsStatistics() {
    return this.db.connection
      .select({
        bedrooms: {
          min: sql`min(${this.entities.configurations.bedrooms})`,
          max: sql`max(${this.entities.configurations.bedrooms})`,
          diff: sql`max(${this.entities.configurations.bedrooms}) - min(${this.entities.configurations.bedrooms})`
        },
        carpetArea: {
          min: sql`min(${this.entities.configurations.carpetArea})`,
          max: sql`max(${this.entities.configurations.carpetArea})`,
          diff: sql`max(${this.entities.configurations.carpetArea}) - min(${this.entities.configurations.carpetArea})`
        }
      })
      .from(this.entities.configurations)
      .innerJoin(
        this.entities.wingConfigurations,
        eq(this.entities.configurations.id, this.entities.wingConfigurations.configurations)
      )
      .innerJoin(
        this.entities.wings,
        eq(this.entities.wingConfigurations.wings, this.entities.wings.id)
      )
      .innerJoin(
        this.entities.projects,
        eq(this.entities.wings.projects, this.entities.projects.id)
      )
      .where(eq(this.entities.projects.status, this.projectEntity.STATUSES.PUBLISHED));
  }

  async truncateProjectVectors() {
    await this.db.connection
      .execute(sql`TRUNCATE TABLE ${this.entities.projectVectors} RESTART IDENTITY`);
  }

  async insertConstantData(projectDetails: any[]) {
    this.logger.log('Inserting constant data...');

    await this.db.connection
      .insert(this.entities.projectVectors)
      .values(projectDetails)
      .onConflictDoNothing();
  }

  async getProjectDetails() {
    return this.db.connection
      .select({
        projectId: this.entities.projects.id,
        projectName: this.entities.projects.name,
        projectSlug: this.entities.seoProperties.slug,
        wingId: this.entities.wings.id,
        configurationId: this.entities.configurations.id,
        projectLocation: this.entities.projects.location,
        bedrooms: this.entities.configurations.bedrooms,
        carpetArea: this.entities.configurations.carpetArea,
        minimumPrice: this.entities.projects.minimumPrice,
        maximumPrice: this.entities.projects.maximumPrice
      })
      .from(this.entities.configurations)
      .innerJoin(
        this.entities.wingConfigurations,
        eq(this.entities.configurations.id, this.entities.wingConfigurations.configurations)
      )
      .innerJoin(
        this.entities.wings,
        eq(this.entities.wingConfigurations.wings, this.entities.wings.id)
      )
      .innerJoin(
        this.entities.projects,
        eq(this.entities.wings.projects, this.entities.projects.id)
      )
      .innerJoin(
        this.entities.seoProperties,
        eq(this.entities.projects.seoProperties, this.entities.seoProperties.id)
      )
      .where(eq(this.entities.projects.status, this.projectEntity.STATUSES.PUBLISHED));
  }

  // TODO: Remove insertion of 0 in feature vector
  async updateFeatureVector(statistics: any) {
    await this.db.connection
      .update(this.entities.projectVectors)
      .set({
        featureVectorMean: sql`ARRAY[
          COALESCE((ST_Y(${this.entities.projectVectors.projectLocation}::geometry)-${statistics.latitude.min})
          /${statistics.latitude.diff},0),
          COALESCE((ST_X(${this.entities.projectVectors.projectLocation}::geometry)-${statistics.longitude.min})
          /${statistics.longitude.diff},0),
          COALESCE((${this.entities.projectVectors.bedrooms}-${statistics.bedrooms.min})
          /${statistics.bedrooms.diff}::float,0),
          COALESCE((${this.entities.projectVectors.carpetArea}-${statistics.carpetArea.min})
          /${statistics.carpetArea.diff}, 0),
          COALESCE((${this.entities.projectVectors.minimumPrice}-${statistics.minimumPrice.min})
          /${statistics.minimumPrice.diff},0),
          COALESCE((${this.entities.projectVectors.maximumPrice}-${statistics.maximumPrice.min})
          /${statistics.maximumPrice.diff},0)
        ]::float[]`
      });
  }

  async getSimilarProjects(configurationId: string, projectId: string) {
    return this.db.connection
      .select({
        projectId: this.entities.projectVectors.projectId
      })
      .from(this.entities.projectVectors)
      .where(
        and(
          ne(this.entities.projectVectors.configurationId, configurationId),
          ne(this.entities.projectVectors.projectId, projectId)
        )
      )
      .orderBy(
        sql`feature_vector_mean <-> (
          SELECT feature_vector_mean
          FROM ${this.entities.projectVectors}
          WHERE ${this.entities.projectVectors.configurationId} = ${configurationId}
        )`
      )
      .limit(15);
  }

  async getConfigurationIdsByProjectSlug(projectSlug: string) {
    return this.db.connection
      .select({
        configurationId: this.entities.projectVectors.configurationId
      })
      .from(this.entities.projectVectors)
      .where(eq(this.entities.projectVectors.projectSlug, projectSlug));
  }
}
