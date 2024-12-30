import { Injectable, Logger } from '@nestjs/common';
import { alias } from 'drizzle-orm/pg-core';
import { eq, sql } from 'drizzle-orm';
import { Db } from '../../app/utils/db.util';
import { DeveloperEntity } from '../entities/developer.entity';
import { DirectusFilesEntity } from '../../app/entities/directus-file.entity';
import { SeoPropertiesEntity } from '../../app/entities/seo-properties.entity';
import { DeveloperDetailInterface } from '../interfaces/developer-detail.interface';

@Injectable()
export class DeveloperRepository {
  private readonly logger: Logger = new Logger(DeveloperRepository.name);

  private readonly developerDirectusFiles: any;

  private readonly developerSeoProperties: any;

  constructor(
    private readonly db: Db,
    private readonly developerEntity: DeveloperEntity,
    private readonly directusFilesEntity: DirectusFilesEntity,
    private readonly seoProperties: SeoPropertiesEntity
  ) {
    this.developerDirectusFiles = alias(this.directusFilesEntity.directusFiles, 'developerDirectusFiles');
    this.developerSeoProperties = alias(this.seoProperties.seoProperties, 'developerSeoProperties');
  }

  async getDeveloperDetail(slug: string): Promise<DeveloperDetailInterface[]> {
    return this.db.connection
      .selectDistinctOn([this.developerEntity.developers.id], {
        id: this.developerEntity.developers.id,
        name: this.developerEntity.developers.name,
        slug: this.developerSeoProperties.slug,
        foundedYear: this.developerEntity.developers.foundedYear,
        developerType: this.developerEntity.developers.developerType,
        reraCertified: sql<boolean>`CASE 
            WHEN ${this.developerEntity.developers.reraRegistrationNumber} IS NULL
              OR ${this.developerEntity.developers.reraRegistrationNumber} = ''
              THEN ${false}
            ELSE ${true}
            END`,
        summary: this.developerEntity.developers.summary,
        description: this.developerEntity.developers.description,
        logo: sql<string>`CASE WHEN ${this.developerDirectusFiles.filenameDisk} IS NULL 
            THEN '' 
            ELSE CONCAT(${this.developerDirectusFiles.filenameDisk},
                ':', ${this.developerDirectusFiles.title})
            END`
      })
      .from(this.developerEntity.developers)
      .leftJoin(
        this.developerDirectusFiles,
        eq(this.developerEntity.developers.logo, this.developerDirectusFiles.id)
      )
      .innerJoin(
        this.developerSeoProperties,
        eq(this.developerEntity.developers.seoProperties, this.developerSeoProperties.id)
      )
      .where(eq(this.developerSeoProperties.slug, slug));
  }

  async findDeveloperBySlug(slug: string) {
    return this.db.connection
      .selectDistinct({
        id: this.developerEntity.developers.id
      })
      .from(this.developerEntity.developers)
      .innerJoin(
        this.developerSeoProperties,
        eq(this.developerEntity.developers.seoProperties, this.developerSeoProperties.id)
      )
      .where(eq(this.developerSeoProperties.slug, slug));
  }
}
