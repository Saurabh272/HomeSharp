import { Test, TestingModule } from '@nestjs/testing';
import { DeveloperDetailController } from '../controller/developer-detail.controller';
import { DeveloperDetailService } from '../service/developer-detail.service';
import { DeveloperDetailTransformer } from '../transformers/developer-detail.transformer';
import { DeveloperRepository } from '../repository/developer.repository';
import { ProjectListingService } from '../../project/services/project-listing.service';
import { SearchProjectTransformer } from '../../project/transformers/search-project.transformer';
import { SlugDto } from '../../project/dto/slug.dto';
import * as MockData from './developer-detail.data';
import {
  mockDb, mockDeveloperDetailService, mockDeveloperDetailTransformer,
  mockDeveloperRepository,
  mockProjectListingService,
  mockSearchProjectTransformer
} from '../../app/tests/mock-providers';
import { Db } from '../../app/utils/db.util';
import config from '../../app/config';

describe('Developer Detail', () => {
  let controller: DeveloperDetailController;
  let repository: DeveloperRepository;
  let service: DeveloperDetailService;
  let transformer: DeveloperDetailTransformer;
  let projectListingService: ProjectListingService;
  let searchProjectTransformer: SearchProjectTransformer;

  let spies: {
    mockGetDeveloperDetail?: jest.SpyInstance;
    mockGetProjectListing?: jest.SpyInstance;
    mockProcess?: jest.SpyInstance;
  };

  describe('Service', () => {
    beforeEach(async () => {
      const module: TestingModule = await Test
        .createTestingModule({
          controllers: [DeveloperDetailController],
          providers: [
            DeveloperDetailTransformer,
            DeveloperDetailService,

            mockDeveloperRepository,
            mockProjectListingService,
            mockSearchProjectTransformer,
            mockDeveloperDetailTransformer,

            mockDb
          ]
        })
        .overrideProvider(Db)
        .useValue(mockDb.useValue)
        .compile();

      controller = module.get<DeveloperDetailController>(DeveloperDetailController);
      service = module.get<DeveloperDetailService>(DeveloperDetailService);
      transformer = module.get<DeveloperDetailTransformer>(DeveloperDetailTransformer);
      repository = module.get<DeveloperRepository>(DeveloperRepository);
      projectListingService = module.get<ProjectListingService>(ProjectListingService);
      searchProjectTransformer = module.get<SearchProjectTransformer>(SearchProjectTransformer);

      spies = {
        mockGetDeveloperDetail: jest.spyOn(repository, 'getDeveloperDetail')
      };
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should get developer detail', async () => {
      const mockSlug = 'developer-slug';
      const mockDetailResponse = {};
      const mockTransformedResponse = {};
      service.getDeveloperDetail = jest.fn().mockResolvedValue(mockDetailResponse);

      const result = await service.getDeveloperDetail(mockSlug);

      expect(service.getDeveloperDetail).toHaveBeenCalledWith(mockSlug);
      expect(result).toEqual(mockTransformedResponse);
    });

    it('should return developer details', async () => {
      const mockSlug = 'developer-slug';
      const mockDetailResponse = MockData.developerDetailData;
      spies.mockGetDeveloperDetail.mockResolvedValue(Promise.resolve(mockDetailResponse));

      const result = await service.getDeveloperDetail(mockSlug);

      expect(spies.mockGetDeveloperDetail).toHaveBeenCalledWith(mockSlug);
      expect(result).toEqual(mockDetailResponse);
    });
  });

  describe('Controller', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should be defined', () => {
      expect(controller).toBeDefined();
    });

    it('should call services and transformers correctly and return the result', async () => {
      const mockSlug = 'test-slug';
      const mockDeveloperDetails = MockData.developerDetailData;
      const mockProjects = MockData.transformedProjectList;
      const mockTransformedResult = MockData.transformedDeveloperDetail;

      jest.spyOn(service, 'getDeveloperDetail').mockResolvedValue(mockDeveloperDetails);
      jest.spyOn(projectListingService, 'getProjectsFromSearchServiceByDeveloperSlug').mockResolvedValue(mockProjects);
      jest.spyOn(transformer, 'process').mockReturnValue(mockTransformedResult);

      const mockRequest: SlugDto = { slug: mockSlug };

      const result = await controller.getDeveloperDetail(mockRequest);

      expect(service.getDeveloperDetail).toHaveBeenCalledWith(mockSlug);
      expect(projectListingService.getProjectsFromSearchServiceByDeveloperSlug)
        .toHaveBeenCalledWith(mockSlug);
      expect(transformer.process).toHaveBeenCalledWith(mockDeveloperDetails[0], mockProjects.projects);

      expect(result).toEqual(mockTransformedResult);
    });

    it('should call services but no transformers and return empty object if no developer found', async () => {
      const mockSlug = 'test-slug';
      const mockDeveloperDetails = [];
      const mockProjectList = MockData.projectList;

      jest.spyOn(service, 'getDeveloperDetail').mockResolvedValue(mockDeveloperDetails);
      jest.spyOn(projectListingService, 'getProjectsFromSearchServiceByDeveloperSlug').mockResolvedValue(
        [{ projects: mockProjectList }]
      );

      const mockRequest: SlugDto = { slug: mockSlug };

      const result = await controller.getDeveloperDetail(mockRequest);

      expect(service.getDeveloperDetail).toHaveBeenCalledWith(mockSlug);
      expect(projectListingService.getProjectsFromSearchServiceByDeveloperSlug)
        .toHaveBeenCalledWith(mockSlug);
      expect(searchProjectTransformer.process).not.toHaveBeenCalled();
      expect(transformer.process).not.toHaveBeenCalled();

      expect(result).toEqual({});
    });
  });

  describe('Transformer', () => {
    beforeEach(async () => {
      const module: TestingModule = await Test
        .createTestingModule({
          controllers: [DeveloperDetailController],
          providers: [
            mockDeveloperDetailService,
            mockDeveloperRepository,
            mockProjectListingService,
            mockSearchProjectTransformer,
            DeveloperDetailTransformer,
            mockDb
          ]
        })
        .overrideProvider(Db)
        .useValue(mockDb.useValue)
        .compile();

      controller = module.get<DeveloperDetailController>(DeveloperDetailController);
      service = module.get<DeveloperDetailService>(DeveloperDetailService);
      transformer = module.get<DeveloperDetailTransformer>(DeveloperDetailTransformer);
      repository = module.get<DeveloperRepository>(DeveloperRepository);
      projectListingService = module.get<ProjectListingService>(ProjectListingService);
      searchProjectTransformer = module.get<SearchProjectTransformer>(SearchProjectTransformer);
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should be defined', () => {
      expect(transformer).toBeDefined();
    });

    it('should return developer details', () => {
      const mockDeveloperDetails = MockData.developerDetailData;
      const mockProjects = MockData.transformedProjectList;
      const mockTransformedResult = MockData.transformedDeveloperDetail;

      const result = transformer.process(mockDeveloperDetails[0], mockProjects.projects);

      expect(result).toEqual(mockTransformedResult);
    });

    it('should return developer details with empty projects', () => {
      const mockDeveloperDetails = MockData.developerDetailData;
      const mockTransformedResult = MockData.transformedDeveloperDetailWithoutProjects;

      const result = transformer.process(mockDeveloperDetails[0]);

      expect(result).toEqual(mockTransformedResult);
    });

    it('should call getUrl', () => {
      const mockDeveloperDetails = MockData.developerDetailData;
      const mockProjects = MockData.transformedProjectList;
      const mockTransformedResult = MockData.transformedDeveloperDetail;

      jest.spyOn(transformer, 'getFileUrl').mockReturnValue({
        url: `${config.DIRECTUS_URL}/assets/image-url`,
        alt: 'Aim Realtors'
      });

      const result = transformer.process(mockDeveloperDetails[0], mockProjects.projects);

      expect(transformer.getFileUrl)
        .toHaveBeenCalledWith(mockDeveloperDetails[0].logo);
      expect(result).toEqual(mockTransformedResult);
    });

    it('should return default image result', () => {
      const result = transformer.getFileUrl(undefined);

      expect(result).toEqual({
        url: '',
        alt: ''
      });
    });

    it('should return default image result', () => {
      const result = transformer.getFileUrl('');

      expect(result).toEqual({
        url: '',
        alt: ''
      });
    });

    it('should return correct image result', () => {
      const mockImage = 'image-url';
      const mockAlt = 'Aim Realtors';

      const result = transformer.getFileUrl(`${mockImage}:${mockAlt}`);

      expect(result).toEqual({
        url: `${config.DIRECTUS_URL}/assets/image-url`,
        alt: mockAlt
      });
    });
  });
});
