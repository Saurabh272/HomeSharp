import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PromisePool } from '@supercharge/promise-pool';
import { SeoPropertiesRepository } from '../repositories/seo-properties.repository';
import { SeoPropertiesInterface } from '../interfaces/seo-properties.interface';
import { ProjectEntity } from '../../project/entities/project.entity';
import { CategoryEntity } from '../../project/entities/category.entity';
import { DeveloperEntity } from '../../developer/entities/developer.entity';
import { MicroMarketEntity } from '../../project/entities/micro-market.entity';
import { DataImporterUtil } from '../../data-importer/utils/data-importer.util';
import { IndexingConfig } from '../../project/config/reindexing.config';
import { FailureLogsRepository } from '../repositories/failure-logs.repository';
import logConfig from '../config/log.config';

@Injectable()
export class SeoPropertiesService {
  private readonly logger = new Logger(SeoPropertiesService.name);

  constructor(
    private readonly categoryEntity: CategoryEntity,
    private readonly developerEntity: DeveloperEntity,
    private readonly microMarketEntity: MicroMarketEntity,
    private readonly projectEntity: ProjectEntity,
    private readonly seoPropertiesRepository: SeoPropertiesRepository,
    private readonly dataImporterUtil: DataImporterUtil,
    private readonly failureLogsRepository: FailureLogsRepository
  ) {}

  async getSeoProperties(slug: string): Promise<SeoPropertiesInterface> {
    const seoProperties: SeoPropertiesInterface[] = await this.seoPropertiesRepository.getSeoProperties(slug);
    if (!seoProperties || !seoProperties.length || !Object.keys(seoProperties[0]).length) {
      throw new BadRequestException('No SEO Properties found');
    }

    return seoProperties?.[0];
  }

  async addSeoProperties(addedEntity: { payload: any, collection: string }) {
    const entityMappings = {
      Categories: this.categoryEntity,
      Developers: this.developerEntity,
      micro_markets: this.microMarketEntity,
      Projects: this.projectEntity
    };

    const entity = entityMappings[addedEntity.collection];
    if (!entity) {
      return {
        message: 'No collection found'
      };
    }

    if (addedEntity.payload.payload[entity.seoProperties]) {
      this.logger.log('SEO Properties already exist');
      return {
        message: 'SEO Properties already exist'
      };
    }

    const slug = this.dataImporterUtil.getSlug(addedEntity.payload.payload[entity.name]);
    const seoPropertyId = await this.dataImporterUtil.createSeoProperties({ slug, createNewOnConflict: true });

    return this.seoPropertiesRepository.updateSeoPropertyForCollection(
      entity.tableName,
      addedEntity.payload.key,
      seoPropertyId
    );
  }

  async validateSeoProperties(seoProperty: { payload?: any, slug?: string }) {
    const regex = /^[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*$/;
    const slug = seoProperty.payload?.slug || seoProperty.slug;
    if (!regex.test(slug)) {
      return {
        status: 'error',
        message: `Slug '${slug}' is not valid. It can have alphanumeric characters and `
           + 'hyphens without any spaces. It should not start or end with a hyphen.'
      };
    }
  }

  async convertUpperCaseToLowerCase() {
    const result = await this.seoPropertiesRepository.getAllSeoProperties();
    const pool = new PromisePool();

    await pool
      .for(result)
      .withConcurrency(IndexingConfig.concurrencyLimit)
      .process(async (data) => {
        try {
          data.slug = data?.slug?.toLowerCase();
          await this.seoPropertiesRepository.updateOne(data);
        } catch (error) {
          this.logger.error(error?.message);
          await this.saveFailureLog(error);
        }
      });

    return {
      message: 'Update All Upper Case seo-properties to Lower Case'
    };
  }

  async saveFailureLog(data: any) {
    const dataToSave = {
      eventType: logConfig.event,
      remarks: data?.errors[0]?.message || data?.message,
      sourceOrigin: data?.errors[0]?.extensions
    };

    return this.failureLogsRepository.saveFailureLogs(dataToSave);
  }
}
