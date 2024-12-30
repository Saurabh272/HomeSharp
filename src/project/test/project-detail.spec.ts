import { Test, TestingModule } from '@nestjs/testing';
import { ProjectDetailController } from '../controllers/project-detail.controller';
import { ProjectDetailService } from '../services/project-detail.service';
import { ProjectDetailTransformer } from '../transformers/project-detail.transformer';
import { ProjectIndexDetailTransformer } from '../transformers/project-index-detail.transformer';
import { SlugDto } from '../dto/slug.dto';
import * as MockData from './project-details-data';
import { DeveloperIndexDetailTransformer } from '../transformers/developer-index-detail.transformer';
import { MicroMarketIndexDetailTransformer } from '../transformers/micro-market-index-detail.transformer';
import { Db } from '../../app/utils/db.util';
import { mockDb } from '../../app/tests/mock-providers';
import { WatermarkService } from '../services/watermark.service';
import { WatermarkRepository } from '../repositories/watermark.repository';
import { ProjectEntity } from '../entities/project.entity';
import { DirectusFilesEntity } from '../../app/entities/directus-file.entity';
import { DeveloperEntity } from '../../developer/entities/developer.entity';
import { AddressEntity } from '../../app/entities/address.entity';
import { SeoPropertiesEntity } from '../../app/entities/seo-properties.entity';
import { CustomerEntity } from '../../customer/entities/customer.entity';
import { WishlistProjectEntity } from '../../wishlist/entities/wishlist-project.entity';
import { WishlistEntity } from '../../wishlist/entities/wishlist.entity';
import { CategoryEntity } from '../entities/category.entity';
import { ConfigurationEntity } from '../entities/configuration.entity';
import { ContactDetailEntity } from '../entities/contact-detail.entity';
import { FeatureCategoryEntity } from '../entities/feature-category.entity';
import { FeatureEntity } from '../entities/feature.entity';
import { MicroMarketEntity } from '../entities/micro-market.entity';
import { ProjectCategoryEntity } from '../entities/project-category.entity';
import { ProjectFeatureEntity } from '../entities/project-feature.entity';
import { ProjectFilesImagesEntity } from '../entities/project-file-image.entity';
import { RelationshipManagerEntity } from '../entities/relationship-manager.entity';
import { ReraStageEntity } from '../entities/rera-stage.entity';
import { WingConfigurationEntity } from '../entities/wing-configuration.entity';
import { WingEntity } from '../entities/wing.entity';
import { ProjectFilesFloorPlanEntity } from '../entities/project-file-floor-plan.entity';
import { WatermarkEntity } from '../entities/watermark.entity';
import { WatermarkOriginalImageEntity } from '../entities/watermark-original-images.entity';
import { DirectusFolderEntity } from '../../app/entities/directus-folder.entity';
import config from '../../app/config';

describe('ProjectDetailController', () => {
  let controller: ProjectDetailController;
  let projectDetailService: ProjectDetailService;
  let projectDetailTransformer: ProjectDetailTransformer;

  jest.mock('axios', () => ({
    request: jest.fn()
  }));

  beforeEach(async () => {
    const module: TestingModule = await Test
      .createTestingModule({
        controllers: [ProjectDetailController],
        providers: [
          {
            provide: ProjectDetailService,
            useValue: {
              getProjectDetail: jest.fn(),
              getProjectForIndexing: jest.fn()
            }
          },
          ProjectDetailTransformer,
          ProjectIndexDetailTransformer,
          DeveloperIndexDetailTransformer,
          MicroMarketIndexDetailTransformer,
          WatermarkService,
          WatermarkRepository,
          AddressEntity,
          CategoryEntity,
          ConfigurationEntity,
          DeveloperEntity,
          DirectusFilesEntity,
          FeatureCategoryEntity,
          FeatureEntity,
          ProjectCategoryEntity,
          ProjectEntity,
          ProjectFeatureEntity,
          ProjectFilesImagesEntity,
          ReraStageEntity,
          SeoPropertiesEntity,
          WishlistEntity,
          WishlistProjectEntity,
          WingConfigurationEntity,
          WingEntity,
          CustomerEntity,
          RelationshipManagerEntity,
          MicroMarketEntity,
          ContactDetailEntity,
          ProjectFilesFloorPlanEntity,
          WatermarkEntity,
          WatermarkOriginalImageEntity,
          DirectusFolderEntity,

          mockDb
        ]
      })
      .overrideProvider(Db)
      .useValue(mockDb.useValue)
      .compile();

    controller = module.get<ProjectDetailController>(ProjectDetailController);
    projectDetailService = module.get<ProjectDetailService>(ProjectDetailService);
    projectDetailTransformer = module.get<ProjectDetailTransformer>(ProjectDetailTransformer);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should get project detail', async () => {
    const mockSlug = 'project-slug';
    const mockDetailResponse = {};
    const mockTransformedResponse = {};
    projectDetailService.getProjectDetail = jest.fn().mockResolvedValue([mockDetailResponse]);

    const result = await controller.getProjectDetail({ slug: mockSlug } as SlugDto);

    expect(projectDetailService.getProjectDetail).toHaveBeenCalledWith(mockSlug);
    expect(result).toEqual(mockTransformedResponse);
  });

  it('should return transformed project detail', async () => {
    const mockSlug = 'project-slug';
    projectDetailService.getProjectDetail = jest.fn().mockResolvedValue([
      MockData.mockProjectDetails,
      MockData.mockWingsConfigurations,
      MockData.mockFeatures,
      MockData.mockProjectStatusesData
    ]);
    const result: any = await controller.getProjectDetail({ slug: mockSlug } as SlugDto);

    expect(projectDetailService.getProjectDetail).toHaveBeenCalledWith(mockSlug);
    expect(result).toEqual(MockData.mockTransformedResponseFromTransformer);
  });

  it('should handle errors and rethrow them', async () => {
    const mockSlug = 'project-slug';
    const errorMessage = 'Error fetching project detail';
    projectDetailService.getProjectDetail = jest.fn().mockRejectedValue(new Error(errorMessage));

    await expect(controller.getProjectDetail({ slug: mockSlug } as SlugDto)).rejects.toThrow(errorMessage);
  });

  describe('Project Detail Transformer', () => {
    describe('getProjectImages', () => {
      it('should return an empty array when images are null', () => {
        const result = projectDetailTransformer.getProjectImages({
          projectPicture: null,
          images: null
        });
        expect(result).toEqual([]);
      });

      it('should return an empty array when images are null', () => {
        const result = projectDetailTransformer.getProjectImages({
          projectPicture: 'test_image:project',
          images: null
        });
        expect(result).toEqual([{
          url: `${config.DIRECTUS_URL}/assets/test_image`,
          alt: 'project'
        }]);
      });

      it('should return an empty array when there are no images', () => {
        const result = projectDetailTransformer.getProjectImages({
          projectPicture: null,
          images: null
        });
        expect(result).toEqual([]);
      });
    });

    describe('getLaunchStatus', () => {
      it('should return "Under Construction" for launch status "UNDER_CONSTRUCTION"', () => {
        const result = projectDetailTransformer.getLaunchStatus('UNDER_CONSTRUCTION');
        expect(result).toEqual('Under Construction');
      });

      it('should return "OC Received" for launch status "OC_RECEIVED"', () => {
        const result = projectDetailTransformer.getLaunchStatus('OC_RECEIVED');
        expect(result).toEqual('OC Received');
      });

      it('should return "Ready to Move" for launch status "READY_TO_MOVE"', () => {
        const result = projectDetailTransformer.getLaunchStatus('READY_TO_MOVE');
        expect(result).toEqual('Ready to Move');
      });

      it('should return "Under Construction" for unknown launch status', () => {
        const result = projectDetailTransformer.getLaunchStatus('UNKNOWN_STATUS');
        expect(result).toEqual('Under Construction');
      });
    });

    describe('getConfigurations', () => {
      it('should return an empty array when wingsConfigurations is falsy', () => {
        const result = projectDetailTransformer.getConfigurations(null);
        expect(result).toEqual([]);
      });

      it('should return an empty array when wingsConfigurations is an empty array', () => {
        const result = projectDetailTransformer.getConfigurations([]);
        expect(result).toEqual([]);
      });

      it('should correctly transform wingsConfigurations with no existing configurations', () => {
        const result = projectDetailTransformer.getConfigurations(MockData.inputConfigurations);

        expect(result).toEqual(MockData.expectedConfigurations);
      });

      it('should correctly add to existing configurations', () => {
        const result = projectDetailTransformer.getConfigurations(MockData.inputConfigurations);

        expect(result).toEqual(MockData.expectedConfigurations);
      });
    });

    describe('getFeatureCategories', () => {
      it('should return an empty array when features is falsy', () => {
        const result = projectDetailTransformer.getFeatureCategories(null);
        expect(result).toEqual([]);
      });

      it('should return an empty array when features is an empty array', () => {
        const result = projectDetailTransformer.getFeatureCategories([]);
        expect(result).toEqual([]);
      });

      it('should correctly transform features', () => {
        const result = projectDetailTransformer.getFeatureCategories(MockData.sampleFeatures);
        expect(result).toEqual(MockData.expectedFeatureCategories);
      });
    });

    describe('getKeyHighlights', () => {
      it('should return an empty array when all features have keyHighlight false', () => {
        const result = projectDetailTransformer.getKeyHighLights(MockData.sampleFeatures);
        expect(result).toEqual([]);
      });

      it('should return correct key highlights if features has keyHighlight as true', () => {
        const result = projectDetailTransformer.getKeyHighLights(MockData.sampleFeaturesWithKeyHighlight);
        expect(result).toEqual(MockData.expectedKeyHighlights);
      });
    });

    it('should return correct project detail', () => {
      const result = projectDetailTransformer.process({
        projectDetail: MockData.mockProjectDetail,
        wingsConfigurations: MockData.mockWingsConfigurationsData,
        features: MockData.mockFeaturesData,
        projectStatuses: MockData.mockProjectStatusesData,
        whatsAppMessage: ''
      });
      expect(result).toEqual(MockData.expectedProjectDetail);
    });

    it('should return correct project detail with no images', () => {
      const result = projectDetailTransformer.process({
        projectDetail: MockData.mockProjectDetailWithNoImages,
        wingsConfigurations: MockData.mockWingsConfigurationsData,
        features: MockData.mockFeaturesData,
        projectStatuses: MockData.mockProjectStatusesData,
        whatsAppMessage: ''
      });
      expect(result).toEqual(MockData.expectedProjectDetailData);
    });

    it('should return correct project detail with no wingConfigurations', () => {
      const result = projectDetailTransformer.process({
        projectDetail: MockData.mockProjectDetail,
        wingsConfigurations: [],
        features: MockData.mockFeaturesData,
        projectStatuses: MockData.mockProjectStatusesData,
        whatsAppMessage: ''
      });
      expect(result).toEqual(MockData.expectedProjectDetailWithoutWingConfig);
    });

    it('should return correct project detail with null wingConfigurations', () => {
      const result = projectDetailTransformer.process({
        projectDetail: MockData.mockProjectDetail,
        wingsConfigurations: null,
        features: MockData.mockFeaturesData,
        projectStatuses: MockData.mockProjectStatusesData,
        whatsAppMessage: ''
      });
      expect(result).toEqual(MockData.expectedProjectDetailWithoutWingConfig);
    });

    it('should return correct project detail with no features', () => {
      const result = projectDetailTransformer.process({
        projectDetail: MockData.mockProjectDetail,
        wingsConfigurations: MockData.mockWingsConfigurationsData,
        features: [],
        projectStatuses: MockData.mockProjectStatusesData,
        whatsAppMessage: ''
      });
      expect(result).toEqual(MockData.expectedProjectDetailWithoutFeatures);
    });

    it('should return correct project detail with null features', () => {
      const result = projectDetailTransformer.process({
        projectDetail: MockData.mockProjectDetail,
        wingsConfigurations: MockData.mockWingsConfigurationsData,
        features: null,
        projectStatuses: MockData.mockProjectStatusesData,
        whatsAppMessage: ''
      });
      expect(result).toEqual(MockData.expectedProjectDetailWithoutFeatures);
    });

    it('should return correct project detail with no Developer Address', () => {
      const result = projectDetailTransformer.process({
        projectDetail: MockData.mockProjectDetailWithNoDeveloperAddress,
        wingsConfigurations: null,
        features: null,
        projectStatuses: MockData.mockProjectStatusesData,
        whatsAppMessage: ''
      });
      expect(result).toEqual(MockData.expectedProjectDetailWithoutDeveloperAddress);
    });
  });
});
