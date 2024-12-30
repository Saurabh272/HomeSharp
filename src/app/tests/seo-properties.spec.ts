import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { SeoPropertiesController } from '../controllers/seo-properties.controller';
import { SeoPropertiesService } from '../services/seo-properties.service';
import { SeoPropertiesTransformer } from '../transformers/get-seo-properties.transformer';
import { SeoPropertiesRepository } from '../repositories/seo-properties.repository';
import { SeoPropertiesEntity } from '../entities/seo-properties.entity';
import { DirectusFilesEntity } from '../entities/directus-file.entity';
import { SlugDto } from '../../project/dto/slug.dto';
import { Db } from '../utils/db.util';
import { mockDb } from './mock-providers';
import { CategoryEntity } from '../../project/entities/category.entity';
import { DeveloperEntity } from '../../developer/entities/developer.entity';
import { MicroMarketEntity } from '../../project/entities/micro-market.entity';
import { ProjectEntity } from '../../project/entities/project.entity';
import { DataImporterUtil } from '../../data-importer/utils/data-importer.util';
import { FailureLogsRepository } from '../repositories/failure-logs.repository';
import { AddressEntity } from '../entities/address.entity';
import { ContactDetailEntity } from '../../project/entities/contact-detail.entity';
import { DataGenerator } from '../../data-importer/fakers/data-generator.faker';
import { DataImporterRepository } from '../../data-importer/repositories/data-importer.repository';
import { ImageGenerator } from '../../data-importer/fakers/image-generator.faker';
import { FailureLogsEntity } from '../entities/failure-logs.entity';
import { Transformer } from '../utils/transformer.util';
import { FeatureCategoryEntity } from '../../project/entities/feature-category.entity';
import { FeatureEntity } from '../../project/entities/feature.entity';
import { ReraStageEntity } from '../../project/entities/rera-stage.entity';
import { ProjectFilesImagesEntity } from '../../project/entities/project-file-image.entity';
import { ProjectFeatureEntity } from '../../project/entities/project-feature.entity';
import { ProjectCategoryEntity } from '../../project/entities/project-category.entity';
import { WingEntity } from '../../project/entities/wing.entity';
import { ConfigurationEntity } from '../../project/entities/configuration.entity';
import { WingConfigurationEntity } from '../../project/entities/wing-configuration.entity';
import { ProjectFilesFloorPlanEntity } from '../../project/entities/project-file-floor-plan.entity';
import { OtherContactDetailsEntity } from '../../project/entities/other-contact-details.entity';
import { DirectusAuth } from '../utils/directus.util';
import config from '../config';

describe('SeoProperties', () => {
  let controller: SeoPropertiesController;
  let service: SeoPropertiesService;
  let transformer: SeoPropertiesTransformer;
  let repository: SeoPropertiesRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SeoPropertiesController],
      providers: [
        SeoPropertiesService,
        SeoPropertiesTransformer,
        SeoPropertiesRepository,
        SeoPropertiesEntity,
        DirectusFilesEntity,
        CategoryEntity,
        DeveloperEntity,
        MicroMarketEntity,
        ProjectEntity,
        DataImporterUtil,
        FailureLogsRepository,
        AddressEntity,
        ContactDetailEntity,
        DataGenerator,
        DataImporterRepository,
        ImageGenerator,
        FailureLogsEntity,
        Transformer,
        FeatureCategoryEntity,
        FeatureEntity,
        ReraStageEntity,
        ProjectFilesImagesEntity,
        ProjectFeatureEntity,
        ProjectCategoryEntity,
        WingEntity,
        ConfigurationEntity,
        WingConfigurationEntity,
        ProjectFilesFloorPlanEntity,
        OtherContactDetailsEntity,
        DirectusAuth,
        mockDb
      ]
    })
      .overrideProvider(Db)
      .useValue(mockDb.useValue)
      .compile();

    controller = module.get<SeoPropertiesController>(SeoPropertiesController);
    service = module.get<SeoPropertiesService>(SeoPropertiesService);
    transformer = module.get<SeoPropertiesTransformer>(SeoPropertiesTransformer);
    repository = module.get<SeoPropertiesRepository>(SeoPropertiesRepository);
  });

  describe('Service', () => {
    it('SEO properties service should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should get SEO properties', async () => {
      const slug = 'test-slug';
      const mockSeoProperties = {
        slug,
        title: 'Test Title',
        keywords: 'keyword1, keyword2',
        canonicalUrl: 'http://example.com',
        image: 'test-image.jpg',
        summary: 'Test summary',
        alt: 'Test alt'
      };

      jest.spyOn(repository, 'getSeoProperties').mockResolvedValueOnce([mockSeoProperties]);

      const result = await service.getSeoProperties(slug);

      expect(result).toEqual(mockSeoProperties);
    });

    it('should throw BadRequestException if no SEO properties found', async () => {
      const slug = 'non-existing-slug';

      jest.spyOn(repository, 'getSeoProperties').mockResolvedValue([]);

      await expect(service.getSeoProperties(slug))
        .rejects.toThrow(new BadRequestException('No SEO Properties found'));
    });
  });

  describe('Controller', () => {
    it('SEO properties controller should be defined', () => {
      expect(controller).toBeDefined();
    });

    it('should transform SEO properties', async () => {
      const mockSlug: SlugDto = { slug: 'test-slug' };
      const mockSeoProperties = {
        slug: 'test-slug',
        title: 'Test Title',
        keywords: 'keyword1, keyword2',
        canonicalUrl: 'http://example.com',
        image: 'test-image.jpg',
        summary: 'Test summary',
        alt: 'Test alt'
      };

      jest.spyOn(service, 'getSeoProperties').mockResolvedValueOnce(mockSeoProperties);

      const result = await controller.seoProperties(mockSlug);

      expect(result).toEqual(transformer.process(mockSeoProperties));
    });
  });

  describe('Transformer', () => {
    it('SEO properties transformer should be defined', () => {
      expect(transformer).toBeDefined();
    });

    describe('SEO properties process', () => {
      it('should transform SEO properties', () => {
        const mockSeoProperties = {
          slug: 'test-slug',
          title: 'Test Title',
          keywords: 'keyword1, keyword2',
          canonicalUrl: 'http://example.com',
          image: 'test-image.jpg',
          summary: 'Test summary',
          alt: 'Test alt'
        };

        const result = transformer.process(mockSeoProperties);

        expect(result).toEqual({
          slug: 'test-slug',
          title: 'Test Title',
          keywords: ['keyword1', 'keyword2'],
          canonicalUrl: 'http://example.com',
          image: `${config.DIRECTUS_URL}/assets/test-image.jpg`,
          summary: 'Test summary',
          alt: 'Test alt'
        });
      });

      it('should handle missing properties- image and keywords gracefully', () => {
        const mockSeoProperties = {
          slug: 'test-slug',
          title: null,
          keywords: null,
          canonicalUrl: null,
          image: null,
          summary: null,
          alt: null
        };

        const result = transformer.process(mockSeoProperties);

        expect(result).toEqual({
          slug: 'test-slug',
          title: null,
          keywords: [],
          canonicalUrl: null,
          image: '',
          summary: null,
          alt: null
        });
      });
    });

    describe('getImage', () => {
      it('should return image URL', () => {
        const result = transformer.getImage('test-image.jpg');

        expect(result).toBe(`${config.DIRECTUS_URL}/assets/test-image.jpg`);
      });

      it('should return an empty string for missing image', () => {
        const result = transformer.getImage(undefined);

        expect(result).toBe('');
      });
    });

    describe('getKeywords', () => {
      it('should return an array of keywords', () => {
        const result = transformer.getKeywords('keyword1, keyword2, keyword3');

        expect(result).toEqual(['keyword1', 'keyword2', 'keyword3']);
      });

      it('should return an empty array for missing keywords', () => {
        const result = transformer.getKeywords(undefined);

        expect(result).toEqual([]);
      });
    });
  });
});
