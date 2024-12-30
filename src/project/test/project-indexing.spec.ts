import { Test, TestingModule } from '@nestjs/testing';
import * as RedisMock from 'ioredis-mock';
import { BullModule } from '@nestjs/bullmq';
import { ProjectDetailService } from '../services/project-detail.service';
import { ProjectIndexDetailTransformer } from '../transformers/project-index-detail.transformer';
import { IndexingController } from '../controllers/indexing.controller';
import { ProjectModule } from '../project.module';
import { DeveloperIndexDetailTransformer } from '../transformers/developer-index-detail.transformer';
import config from '../../app/config';
import { MicroMarketIndexDetailTransformer } from '../transformers/micro-market-index-detail.transformer';
import { mockDb } from '../../app/tests/mock-providers';
import { ReindexingService } from '../services/reindexing.service';
import {
  mockDeveloper,
  mockMicroMarket,
  mockMicroMarketResult,
  mockProjectIndexingData,
  mockProjectIndexingTransformedData,
  mockProjectResult,
  mockProjects,
  mockTransformedDeveloper,
  mockTransformedMicroMarket,
  mockTransformedProject
} from './project-indexing-data';
import { DirectusAuth } from '../../app/utils/directus.util';

describe('ProjectDetailService', () => {
  let projectDetailService: ProjectDetailService;
  let projectIndexDetailTransformer: ProjectIndexDetailTransformer;
  let indexingController: IndexingController;
  let developerIndexDetailTransformer: DeveloperIndexDetailTransformer;
  let microMarketIndexDetailTransformer: MicroMarketIndexDetailTransformer;
  let reindexingService: ReindexingService;
  let directusAuth: DirectusAuth;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ProjectModule,
        BullModule.forRoot({
          connection: new RedisMock()
        })
      ],
      providers: [
        ProjectDetailService,
        ProjectIndexDetailTransformer,
        mockDb
      ]
    }).compile();

    projectDetailService = module.get<ProjectDetailService>(ProjectDetailService);
    projectIndexDetailTransformer = module.get<ProjectIndexDetailTransformer>(ProjectIndexDetailTransformer);
    indexingController = module.get<IndexingController>(IndexingController);
    developerIndexDetailTransformer = module.get<DeveloperIndexDetailTransformer>(DeveloperIndexDetailTransformer);
    microMarketIndexDetailTransformer = module.get<MicroMarketIndexDetailTransformer>(
      MicroMarketIndexDetailTransformer
    );
    reindexingService = module.get<ReindexingService>(ReindexingService);
    directusAuth = module.get<DirectusAuth>(DirectusAuth);
  });

  const authHeader = 'Bearer It9B2nJWxMAvvE2qapkkbmORTQmT3z_K';

  describe('getProject', () => {
    it('should return transformed project for indexing when project exists', async () => {
      const mockRequest = { projectId: 'id' };

      jest.spyOn(directusAuth, 'checkAdminFunctionsPermission').mockImplementation(async () => true);
      jest.spyOn(projectDetailService, 'getProjectForIndexing').mockResolvedValueOnce(mockProjectResult);
      jest.spyOn(projectIndexDetailTransformer, 'process').mockReturnValueOnce([mockTransformedProject]);
      jest.spyOn(projectDetailService, 'sendProjectToIndexing').mockResolvedValueOnce({
        message: 'Project indexed successfully',
        success: true
      });

      const result = await indexingController.indexProject(mockRequest, authHeader);

      expect(result).toEqual(expect.objectContaining({
        indexProject: {
          message: 'Project indexed successfully', success: true
        }
      }));

      expect(projectDetailService.getProjectForIndexing).toHaveBeenCalledWith(mockRequest);
      expect(projectIndexDetailTransformer.process).toHaveBeenCalledWith({
        projectForIndexing: mockProjectResult[0],
        projectStatuses: mockProjectResult[1]
      });
      expect(projectDetailService.sendProjectToIndexing).toHaveBeenCalledWith([mockTransformedProject]);
    });

    it('should return message when project details not found', async () => {
      const mockRequest = { projectId: 'id' };
      jest.spyOn(directusAuth, 'checkAdminFunctionsPermission').mockImplementation(async () => true);
      jest.spyOn(projectDetailService, 'getProjectForIndexing')
        .mockResolvedValueOnce({ message: 'Project details not found' });

      const result = await indexingController.indexProject(mockRequest, authHeader);

      expect(result).toEqual({ message: 'Project details not found' });

      expect(projectDetailService.getProjectForIndexing).toHaveBeenCalledWith(mockRequest);
    });

    it('should return result when getProjectForIndexing does not return an array', async () => {
      const mockRequest = { projectId: 'id' };
      const mockResult = { message: 'Some error message' };
      jest.spyOn(directusAuth, 'checkAdminFunctionsPermission').mockImplementation(async () => true);
      jest.spyOn(projectDetailService, 'getProjectForIndexing').mockResolvedValueOnce(mockResult);

      const result = await indexingController.indexProject(mockRequest, authHeader);

      expect(result).toEqual(mockResult);

      expect(projectDetailService.getProjectForIndexing).toHaveBeenCalledWith(mockRequest);
    });
  });

  describe('getDeveloper', () => {
    it('should return developer details when developer exists', async () => {
      const mockRequest = { developerId: 'someId' };
      jest.spyOn(directusAuth, 'checkAdminFunctionsPermission').mockImplementation(async () => true);
      jest.spyOn(projectDetailService, 'getDeveloperForIndexing').mockResolvedValueOnce([mockDeveloper]);
      jest.spyOn(developerIndexDetailTransformer, 'process').mockReturnValueOnce(mockTransformedDeveloper);
      jest.spyOn(projectDetailService, 'sendDeveloperToIndexing').mockResolvedValueOnce({
        message: 'Developer indexed successfully',
        success: true
      });

      const result = await indexingController.indexDeveloper(mockRequest, authHeader);

      expect(result).toEqual({ message: 'Developer indexed successfully', success: true });

      expect(projectDetailService.getDeveloperForIndexing).toHaveBeenCalledWith(mockRequest.developerId);
      expect(developerIndexDetailTransformer.process).toHaveBeenCalledWith(mockDeveloper);
      expect(projectDetailService.sendDeveloperToIndexing).toHaveBeenCalledWith(mockTransformedDeveloper);
    });

    it('should return message when developer details not found', async () => {
      const mockRequest = { developerId: 'nonexistentId' };
      jest.spyOn(directusAuth, 'checkAdminFunctionsPermission').mockImplementation(async () => true);
      jest.spyOn(projectDetailService, 'getDeveloperForIndexing').mockResolvedValueOnce([]);

      const result = await indexingController.indexDeveloper(mockRequest, authHeader);

      expect(result).toEqual({ message: 'Developer details not found for provided id' });

      expect(projectDetailService.getDeveloperForIndexing).toHaveBeenCalledWith(mockRequest.developerId);
    });

    it('should return developer details not provided message when developerId is not correct', async () => {
      jest.spyOn(directusAuth, 'checkAdminFunctionsPermission').mockImplementation(async () => true);
      const getDeveloperForIndexingSpy = jest
        .spyOn(projectDetailService, 'getDeveloperForIndexing')
        .mockResolvedValueOnce([]);

      const mockRequest = { developerId: 'incorrectId' };

      const result = await indexingController.indexDeveloper(mockRequest, authHeader);

      expect(result).toEqual({ message: 'Developer details not found for provided id' });

      getDeveloperForIndexingSpy.mockRestore();
    });

    it('should return the result when getDeveloperForIndexing does not return an array', async () => {
      const mockRequest = { developerId: 'someId' };
      const mockResult: any = '';

      jest.spyOn(directusAuth, 'checkAdminFunctionsPermission').mockImplementation(async () => true);
      jest.spyOn(projectDetailService, 'getDeveloperForIndexing').mockResolvedValueOnce(mockResult);

      const result = await indexingController.indexDeveloper(mockRequest, authHeader);

      expect(result).toEqual(mockResult);

      expect(projectDetailService.getDeveloperForIndexing).toHaveBeenCalledWith(mockRequest.developerId);
    });
  });

  describe('getMicroMarket', () => {
    it('should return Micro Market indexed successfully', async () => {
      const mockRequest = { microMarketId: 'id' };

      jest.spyOn(directusAuth, 'checkAdminFunctionsPermission').mockImplementation(async () => true);
      jest.spyOn(projectDetailService, 'getMicroMarketForIndexing').mockResolvedValueOnce(mockMicroMarketResult);
      jest.spyOn(microMarketIndexDetailTransformer, 'process').mockReturnValueOnce(mockTransformedMicroMarket);
      jest.spyOn(projectDetailService, 'sendMicroMarketToIndexing').mockResolvedValueOnce({
        message: 'Micro Market indexed successfully',
        success: true
      });

      const result = await indexingController.indexMicroMarket(mockRequest, authHeader);

      expect(result).toEqual({ message: 'Micro Market indexed successfully', success: true });
      expect(projectDetailService.getMicroMarketForIndexing).toHaveBeenCalledWith(mockRequest.microMarketId);
      expect(microMarketIndexDetailTransformer.process).toHaveBeenCalledWith(mockMicroMarketResult[0]);
      expect(projectDetailService.sendMicroMarketToIndexing).toHaveBeenCalledWith(mockTransformedMicroMarket);
    });

    it('should return Micro Market details not found for provided id', async () => {
      const mockRequest = { microMarketId: 'non-existent-id' };
      jest.spyOn(directusAuth, 'checkAdminFunctionsPermission').mockImplementation(async () => true);
      jest.spyOn(projectDetailService, 'getMicroMarketForIndexing').mockResolvedValueOnce([]);

      const result = await indexingController.indexMicroMarket(mockRequest, authHeader);

      expect(result).toEqual({ message: 'Micro Market details not found for provided id' });

      expect(projectDetailService.getMicroMarketForIndexing).toHaveBeenCalledWith(mockRequest.microMarketId);
    });

    it('should return result when getMicroMarketForIndexing does not return an array', async () => {
      const mockRequest = { microMarketId: 'id' };
      const mockResult = { message: 'Some error message' };

      jest.spyOn(directusAuth, 'checkAdminFunctionsPermission').mockImplementation(async () => true);
      jest.spyOn(projectDetailService, 'getMicroMarketForIndexing').mockResolvedValueOnce(mockResult);

      const result = await indexingController.indexMicroMarket(mockRequest, authHeader);

      expect(result).toEqual(mockResult);

      expect(projectDetailService.getMicroMarketForIndexing).toHaveBeenCalledWith(mockRequest.microMarketId);
    });
  });

  describe('indexProjects', () => {
    it('should trigger project indexing', async () => {
      const mockRequest = { projectIds: ['id1', 'id2'] };
      const mockProjectIds: string[] = ['id1', 'id2'];

      jest.spyOn(directusAuth, 'checkAdminFunctionsPermission').mockImplementation(async () => true);
      jest.spyOn(projectDetailService, 'getAllProjectIds').mockResolvedValueOnce(mockProjectIds);
      jest.spyOn(indexingController, 'indexProject').mockResolvedValue({
        message: 'Project indexed successfully'
      });

      jest.spyOn(projectDetailService, 'getProjectForIndexing').mockResolvedValueOnce(mockProjects);
      jest.spyOn(projectIndexDetailTransformer, 'process').mockReturnValueOnce([mockTransformedProject]);
      jest.spyOn(projectDetailService, 'sendProjectToIndexing').mockResolvedValueOnce({
        message: 'Project indexed successfully',
        success: true
      });

      const result = await indexingController.indexMultipleProjects(mockRequest, authHeader);

      expect(result).toEqual({ message: 'Projects indexing triggered' });

      expect(indexingController.indexProject).toHaveBeenCalledTimes(mockProjectIds.length);
      mockProjectIds.forEach((projectId) => {
        expect(indexingController.indexProject).toHaveBeenCalledWith({ projectId }, authHeader);
      });
    });

    it('should handle empty projectIds and trigger project indexing', async () => {
      const mockRequest = {};
      const mockProjectIds: string[] = ['id1', 'id2'];

      jest.spyOn(directusAuth, 'checkAdminFunctionsPermission').mockImplementation(async () => true);
      jest.spyOn(projectDetailService, 'getAllProjectIds').mockResolvedValueOnce(mockProjectIds);
      jest.spyOn(indexingController, 'indexProject').mockResolvedValue({
        message: 'Project indexed successfully'
      });

      jest.spyOn(projectDetailService, 'getProjectForIndexing').mockResolvedValueOnce(mockProjects);
      jest.spyOn(projectIndexDetailTransformer, 'process').mockReturnValueOnce([mockTransformedProject]);
      jest.spyOn(projectDetailService, 'sendProjectToIndexing').mockResolvedValueOnce({
        message: 'Project indexed successfully',
        success: true
      });

      const result = await indexingController.indexMultipleProjects(mockRequest, authHeader);

      expect(result).toEqual({ message: 'Projects indexing triggered' });

      expect(projectDetailService.getAllProjectIds).toHaveBeenCalled();
      expect(indexingController.indexProject).toHaveBeenCalledTimes(mockProjectIds.length);
      mockProjectIds.forEach((projectId) => {
        expect(indexingController.indexProject).toHaveBeenCalledWith({ projectId }, authHeader);
      });
    });
  });

  describe('indexMicroMarkets', () => {
    it('should trigger micro market indexing', async () => {
      const mockRequest = { microMarketIds: ['id1', 'id2'] };
      const mockMicroMarketIds: string[] = ['id1', 'id2'];

      jest.spyOn(directusAuth, 'checkAdminFunctionsPermission').mockImplementation(async () => true);
      jest.spyOn(projectDetailService, 'getAllMicroMarketIds').mockResolvedValueOnce(mockMicroMarketIds);
      jest.spyOn(indexingController, 'indexMicroMarket').mockResolvedValue({
        message: 'Micro Market indexed successfully',
        success: true
      });

      jest.spyOn(projectDetailService, 'getMicroMarketForIndexing').mockResolvedValueOnce(mockMicroMarket);
      jest.spyOn(microMarketIndexDetailTransformer, 'process').mockReturnValueOnce(mockMicroMarket);
      jest.spyOn(projectDetailService, 'sendMicroMarketToIndexing').mockResolvedValueOnce({
        message: 'Micro Market indexed successfully',
        success: true
      });

      const result = await indexingController.indexMultipleMicroMarkets(mockRequest, authHeader);

      expect(result).toEqual({ message: 'Micro Markets indexing triggered' });

      expect(indexingController.indexMicroMarket).toHaveBeenCalledTimes(mockMicroMarketIds.length);
      mockMicroMarketIds.forEach((microMarketId) => {
        expect(indexingController.indexMicroMarket).toHaveBeenCalledWith({ microMarketId }, authHeader);
      });
    });

    it('should handle empty microMarketIds and trigger micro market indexing', async () => {
      const mockRequest = {};
      const mockMicroMarketIds: string[] = ['id1', 'id2'];

      jest.spyOn(directusAuth, 'checkAdminFunctionsPermission').mockImplementation(async () => true);
      jest.spyOn(projectDetailService, 'getAllMicroMarketIds').mockResolvedValueOnce(mockMicroMarketIds);
      jest.spyOn(indexingController, 'indexMicroMarket').mockResolvedValue({
        message: 'Micro Market indexed successfully',
        success: true
      });

      jest.spyOn(projectDetailService, 'getMicroMarketForIndexing').mockResolvedValueOnce(mockMicroMarket);
      jest.spyOn(microMarketIndexDetailTransformer, 'process').mockReturnValueOnce(mockMicroMarket);
      jest.spyOn(projectDetailService, 'sendMicroMarketToIndexing').mockResolvedValueOnce({
        message: 'Micro Market indexed successfully',
        success: true
      });

      const result = await indexingController.indexMultipleMicroMarkets(mockRequest, authHeader);

      expect(result).toEqual({ message: 'Micro Markets indexing triggered' });

      expect(projectDetailService.getAllMicroMarketIds).toHaveBeenCalled();
      expect(indexingController.indexMicroMarket).toHaveBeenCalledTimes(mockMicroMarketIds.length);
      mockMicroMarketIds.forEach((microMarketId) => {
        expect(indexingController.indexMicroMarket).toHaveBeenCalledWith({ microMarketId }, authHeader);
      });
    });
  });

  describe('indexMultipleDevelopers', () => {
    it('should trigger developer indexing', async () => {
      const mockRequest = { developerIds: ['id1', 'id2'] };
      const mockDeveloperIds: string[] = ['id1', 'id2'];

      jest.spyOn(directusAuth, 'checkAdminFunctionsPermission').mockImplementation(async () => true);
      jest.spyOn(projectDetailService, 'getAllDeveloperIds').mockResolvedValueOnce(mockDeveloperIds);
      jest.spyOn(indexingController, 'indexDeveloper').mockResolvedValue({
        message: 'Developer indexed successfully'
      });
      jest.spyOn(projectDetailService, 'getDeveloperForIndexing').mockResolvedValue([mockDeveloper]);
      jest.spyOn(developerIndexDetailTransformer, 'process').mockReturnValue(mockTransformedDeveloper);
      jest.spyOn(projectDetailService, 'sendDeveloperToIndexing').mockResolvedValue({
        message: 'Developer indexed successfully',
        success: true
      });

      const result = await indexingController.indexMultipleDevelopers(mockRequest, authHeader);

      expect(result).toEqual({ message: 'Developers indexing triggered' });

      expect(indexingController.indexDeveloper).toHaveBeenCalledTimes(mockDeveloperIds.length);
      mockDeveloperIds.forEach((developerId) => {
        expect(indexingController.indexDeveloper).toHaveBeenCalledWith({ developerId }, authHeader);
      });
    });

    it('should handle empty developerIds and trigger developer indexing', async () => {
      const mockRequest = {};
      const mockDeveloperIds: string[] = ['id1', 'id2'];

      jest.spyOn(directusAuth, 'checkAdminFunctionsPermission').mockImplementation(async () => true);
      jest.spyOn(projectDetailService, 'getAllDeveloperIds').mockResolvedValueOnce(mockDeveloperIds);
      jest.spyOn(indexingController, 'indexDeveloper').mockResolvedValueOnce({
        message: 'Developer indexed successfully'
      });

      jest.spyOn(projectDetailService, 'getDeveloperForIndexing').mockResolvedValueOnce([mockDeveloper]);
      jest.spyOn(developerIndexDetailTransformer, 'process').mockReturnValueOnce(mockTransformedDeveloper);
      jest.spyOn(projectDetailService, 'sendDeveloperToIndexing').mockResolvedValueOnce({
        message: 'Developer indexed successfully',
        success: true
      });

      const result = await indexingController.indexMultipleDevelopers(mockRequest, authHeader);

      expect(result).toEqual({ message: 'Developers indexing triggered' });

      expect(projectDetailService.getAllDeveloperIds).toHaveBeenCalled();
      expect(indexingController.indexDeveloper).toHaveBeenCalledTimes(mockDeveloperIds.length);
      mockDeveloperIds.forEach((developerId) => {
        expect(indexingController.indexDeveloper).toHaveBeenCalledWith({ developerId }, authHeader);
      });
    });
  });

  describe('reindexErroredProjects', () => {
    it('should reindex errored developers and update status to completed on success', async () => {
      const mockErroredIndices = [{
        indexing_type: 'DEVELOPER', indexing_id: 'developerId', retry_count: 0, id: '1'
      }];
      const mockResolvedData = { id: 'developerId', success: true };

      jest.spyOn(directusAuth, 'checkAdminFunctionsPermission').mockImplementation(async () => true);
      jest.spyOn(reindexingService, 'getAllErroredIndices').mockResolvedValueOnce(mockErroredIndices);
      jest.spyOn(reindexingService, 'resolver').mockResolvedValueOnce(mockResolvedData);
      jest.spyOn(reindexingService, 'update').mockResolvedValueOnce(null);
      jest.spyOn(projectDetailService, 'getDeveloperForIndexing').mockResolvedValueOnce([mockDeveloper]);
      jest.spyOn(developerIndexDetailTransformer, 'process').mockReturnValueOnce(mockTransformedDeveloper);
      jest.spyOn(projectDetailService, 'sendDeveloperToIndexing').mockResolvedValueOnce({
        message: 'Developer indexed successfully',
        success: true
      });

      const result = await indexingController.reindexErroredProjects(authHeader);

      expect(result).toEqual([mockResolvedData]);

      expect(reindexingService.getAllErroredIndices).toHaveBeenCalled();
    });

    it('should reindex errored developers, update status to error on failure, and handle retry count', async () => {
      const mockErroredIndices = [{
        indexing_type: 'DEVELOPER', indexing_id: 'developerId', retry_count: 2, id: '2'
      }];
      const mockResolvedData = { id: 'developerId', success: false };

      jest.spyOn(directusAuth, 'checkAdminFunctionsPermission').mockImplementation(async () => true);
      jest.spyOn(reindexingService, 'getAllErroredIndices').mockResolvedValueOnce(mockErroredIndices);
      jest.spyOn(reindexingService, 'resolver').mockResolvedValueOnce(mockResolvedData);
      jest.spyOn(reindexingService, 'update').mockResolvedValueOnce(null);
      jest.spyOn(projectDetailService, 'getDeveloperForIndexing').mockResolvedValueOnce([mockDeveloper]);
      jest.spyOn(developerIndexDetailTransformer, 'process').mockReturnValueOnce(mockTransformedDeveloper);
      jest.spyOn(projectDetailService, 'sendDeveloperToIndexing').mockResolvedValueOnce({
        message: 'Developer indexed successfully',
        success: true
      });

      const result = await indexingController.reindexErroredProjects(authHeader);

      expect(result).toEqual([mockResolvedData]);

      expect(reindexingService.getAllErroredIndices).toHaveBeenCalled();
    });
  });

  describe('projectIndexDetailTransformer', () => {
    it('should transform project data and filter out null values', () => {
      const result = projectIndexDetailTransformer.process(mockProjectIndexingData);
      expect(Array.isArray(result)).toBe(true);
      expect(result).toStrictEqual(mockProjectIndexingTransformedData);
    });

    it('should return an empty array if projectForIndexing is empty', () => {
      const mockData = {
        projectForIndexing: [],
        projectStatuses: [
          { text: 'Ready to Move', value: '1' },
          { text: 'Under Construction', value: '2' }
        ]
      };

      const result = projectIndexDetailTransformer.process(mockData);

      expect(result).toEqual([]);
    });

    it('should return an empty array if projectForIndexing contains null values', () => {
      const mockData = {
        projectForIndexing: [null],
        projectStatuses: [
          { text: 'Ready to Move', value: '1' },
          { text: 'Under Construction', value: '2' }
        ]
      };

      const result = projectIndexDetailTransformer.process(mockData);

      expect(result).toEqual([]);
    });

    it('should handle missing or empty values in project data', () => {
      const mockData: any = {
        projectForIndexing: [
          {
            projectId: '456',
            projectName: '',
            developerAddressLine1: null,
            latitude: undefined,
            longitude: 30.789
          }
        ],
        projectStatuses: [
          { text: 'Ready to Move', value: '1' },
          { text: 'Under Construction', value: '2' }
        ]
      };

      const result = projectIndexDetailTransformer.process(mockData);

      expect(Array.isArray(result)).toBe(true);

      expect(result[0]).toEqual({
        projectId: '456',
        coordinates: [undefined, 30.789],
        address: '',
        carpetAreaUnit: 'sq. ft.',
        currentStatus: '',
        houseType: 'Beds',
        longitude: 30.789,
        percentageSold: NaN,
        projectName: '',
        categories: [],
        categorySlugs: []
      });
    });
  });

  describe('getISOTime', () => {
    it('should return the correct UNIX timestamp', () => {
      const inputDate = '2023-01-01T00:00:00Z';
      const expectedTimestamp = new Date(inputDate).toISOString();

      const result = projectIndexDetailTransformer.getISOTime(inputDate);

      expect(result).toBe(expectedTimestamp);
    });

    it('should handle invalid input date', () => {
      const invalidDate = 'invalid-date';

      const result = projectIndexDetailTransformer.getISOTime(invalidDate);

      expect(result).toBe(null);
    });

    it('should handle null input date', () => {
      const nullDate = null;

      const result = projectIndexDetailTransformer.getISOTime(nullDate);

      expect(result).toBe(null);
    });

    it('should handle undefined input date', () => {
      const undefinedDate = undefined;

      const result = projectIndexDetailTransformer.getISOTime(undefinedDate);
      expect(result).toBe(null);
    });

    it('should handle valid input date with milliseconds', () => {
      const inputDateWithMilliseconds = '2023-01-01T00:00:00.123Z';
      const expectedTimestamp = new Date(inputDateWithMilliseconds).toISOString();

      const result = projectIndexDetailTransformer.getISOTime(inputDateWithMilliseconds);

      expect(result).toBe(expectedTimestamp);
    });
  });

  describe('getFileUrl', () => {
    it('should return an object with url and alt for a valid image string', () => {
      const image = 'example-image.jpg:Alt Text';
      const result = projectIndexDetailTransformer.getFileUrl(image);
      expect(result).toEqual({
        url: `${config.DIRECTUS_URL}/assets/example-image.jpg`,
        alt: 'Alt Text'
      });
    });

    it('should return an object with empty url and alt for an empty image string', () => {
      const image = '';
      const result = projectIndexDetailTransformer.getFileUrl(image);
      expect(result).toEqual({
        url: '',
        alt: ''
      });
    });

    it('should return an object with empty url and alt for a null image', () => {
      const image = null;
      const result = projectIndexDetailTransformer.getFileUrl(image);
      expect(result).toEqual({
        url: '',
        alt: ''
      });
    });

    it('should return an object with empty url and alt for an undefined image', () => {
      const image = undefined;
      const result = projectIndexDetailTransformer.getFileUrl(image);
      expect(result).toEqual({
        url: '',
        alt: ''
      });
    });

    it('should return an object with empty url and alt for an image without alt text', () => {
      const image = 'example-image.jpg';
      const result = projectIndexDetailTransformer.getFileUrl(image);
      expect(result).toEqual({
        url: `${config.DIRECTUS_URL}/assets/example-image.jpg`,
        alt: ''
      });
    });
  });

  describe('getProjectImages', () => {
    it('should return a JSON string with URLs and alts for valid project picture and images', () => {
      const projectPicture = 'project-picture.jpg';
      const images = 'image1.jpg:image1-alt,image2.jpg:image2-alt,image3.jpg:image3-alt';
      const result = projectIndexDetailTransformer.getProjectImages(projectPicture, images);
      const expectedResult = JSON.stringify([
        { url: `${config.DIRECTUS_URL}/assets/project-picture.jpg`, alt: '' },
        { url: `${config.DIRECTUS_URL}/assets/image1.jpg`, alt: 'image1-alt' },
        { url: `${config.DIRECTUS_URL}/assets/image2.jpg`, alt: 'image2-alt' },
        { url: `${config.DIRECTUS_URL}/assets/image3.jpg`, alt: 'image3-alt' }
      ]);
      expect(result).toEqual(expectedResult);
    });

    it('should return a JSON string with project picture and empty images for an empty images string', () => {
      const projectPicture = 'project-picture.jpg';
      const images = '';
      const result = projectIndexDetailTransformer.getProjectImages(projectPicture, images);
      const expectedResult = JSON.stringify([
        { url: `${config.DIRECTUS_URL}/assets/project-picture.jpg`, alt: '' }
      ]);
      expect(result).toEqual(expectedResult);
    });

    it('should return a JSON string with only project picture for a null images string', () => {
      const projectPicture = 'project-picture.jpg';
      const images = null;
      const result = projectIndexDetailTransformer.getProjectImages(projectPicture, images);
      const expectedResult = JSON.stringify([
        { url: `${config.DIRECTUS_URL}/assets/project-picture.jpg`, alt: '' }
      ]);
      expect(result).toEqual(expectedResult);
    });

    it('should return empty for an empty project picture and images string', () => {
      const projectPicture = '';
      const images = '';

      const result = projectIndexDetailTransformer.getProjectImages(projectPicture, images);

      expect(result).toBe('[]');
    });

    it('should return null for a null project picture and images string', () => {
      const projectPicture = null;
      const images = null;

      const result = projectIndexDetailTransformer.getProjectImages(projectPicture, images);

      expect(result).toBeNull();
    });
  });

  describe('getProjectStatus', () => {
    it('should return an empty string when projectStatus is undefined', () => {
      const projectStatus = undefined;
      const result = projectIndexDetailTransformer.getProjectStatus(projectStatus);
      expect(result).toBe('');
    });

    it('should return an empty string when projectStatus is null', () => {
      const projectStatus = null;
      const result = projectIndexDetailTransformer.getProjectStatus(projectStatus);
      expect(result).toBe('');
    });

    it('should return an empty string when projectStatus is an empty string', () => {
      const projectStatus = '';
      const result = projectIndexDetailTransformer.getProjectStatus(projectStatus);
      expect(result).toBe('');
    });

    it('should return the empty when projectStatus is number', () => {
      const projectStatus: any = 1;
      const result = projectIndexDetailTransformer.getProjectStatus(projectStatus);
      expect(result).toBe('');
    });

    it('should return an empty string when projectStatus is not found in projectStatuses', () => {
      const projectStatus = 'invalidStatus';
      const result = projectIndexDetailTransformer.getProjectStatus(projectStatus);
      expect(result).toBe('');
    });
  });

  describe('developerIndexDetailTransformer process method', () => {
    it('should transform valid data', () => {
      const data = {
        developerId: 1,
        developerName: 'ABC Developers',
        developerAddressLine1: '123 Main St',
        developerAddressCity: 'City',
        developerAddressState: 'State',
        developerAddressPinCode: '12345',
        developerSlug: 'abc-developers',
        developerLogo: 'logo.jpg'
      };

      const result = developerIndexDetailTransformer.process(data);

      expect(result).toEqual({
        developerId: 1,
        name: 'ABC Developers',
        address: '123 Main St,City,State,12345',
        slug: 'abc-developers',
        thumbnail: `${config.DIRECTUS_URL}/assets/logo.jpg`
      });
    });

    it('should handle missing address lines', () => {
      const data = {
        developerId: 2,
        developerName: 'XYZ Builders',
        developerAddressCity: 'City',
        developerAddressState: 'State',
        developerAddressPinCode: '54321',
        developerSlug: 'xyz-builders',
        developerLogo: 'logo.png'
      };

      const result = developerIndexDetailTransformer.process(data);

      expect(result).toEqual({
        developerId: 2,
        name: 'XYZ Builders',
        address: 'City,State,54321',
        slug: 'xyz-builders',
        thumbnail: `${config.DIRECTUS_URL}/assets/logo.png`
      });
    });

    it('should handle empty data', () => {
      const data = {};

      const result = developerIndexDetailTransformer.process(data);

      expect(result).toEqual({});
    });

    it('should handle missing logo', () => {
      const data = {
        developerId: 3,
        developerName: 'PQR Homes',
        developerAddressLine1: '456 Side St',
        developerAddressCity: 'Town',
        developerAddressState: 'Province',
        developerAddressPinCode: '98765',
        developerSlug: 'pqr-homes'
      };

      const result = developerIndexDetailTransformer.process(data);

      expect(result).toEqual({
        developerId: 3,
        name: 'PQR Homes',
        address: '456 Side St,Town,Province,98765',
        slug: 'pqr-homes'
      });
    });

    it('should handle a developer with a long name', () => {
      const data = {
        developerId: 4,
        developerName: 'Long Name Developers',
        developerAddressLine1: '789 Grand Ave',
        developerAddressCity: 'Metropolis',
        developerAddressState: 'Superstate',
        developerAddressPinCode: '54321',
        developerSlug: 'long-name-developers',
        developerLogo: 'long_logo.png'
      };

      const result = developerIndexDetailTransformer.process(data);

      expect(result).toEqual({
        developerId: 4,
        name: 'Long Name Developers',
        address: '789 Grand Ave,Metropolis,Superstate,54321',
        slug: 'long-name-developers',
        thumbnail: `${config.DIRECTUS_URL}/assets/long_logo.png`
      });
    });
  });

  describe('MicroMarketIndexDetailTransformer', () => {
    it('should transform valid data', () => {
      const data = {
        microMarketId: 1,
        microMarketName: 'Test MicroMarket',
        microMarketSlug: 'test-micro-market',
        latitude: 12.345,
        longitude: 67.890
      };

      const result = microMarketIndexDetailTransformer.process(data);

      expect(result).toEqual({
        microMarketId: 1,
        name: 'Test MicroMarket',
        slug: 'test-micro-market',
        coordinates: [12.345, 67.890],
        thumbnail: config.MAP_ICON_URL,
        isDefault: 'false'
      });
    });

    it('should handle missing data', () => {
      const data = {};

      const result = microMarketIndexDetailTransformer.process(data);
      expect(result).toEqual({
        coordinates: [undefined, undefined],
        thumbnail: config.MAP_ICON_URL,
        isDefault: 'false'
      });
    });

    it('should handle missing coordinates', () => {
      const data = {
        microMarketId: 2,
        microMarketName: 'Another MicroMarket',
        microMarketSlug: 'another-micro-market'
      };

      const result = microMarketIndexDetailTransformer.process(data);

      expect(result).toEqual({
        microMarketId: 2,
        name: 'Another MicroMarket',
        slug: 'another-micro-market',
        coordinates: [undefined, undefined],
        thumbnail: config.MAP_ICON_URL,
        isDefault: 'false'
      });
    });

    it('should handle empty strings', () => {
      const data = {
        microMarketId: '',
        microMarketName: '',
        microMarketSlug: '',
        latitude: '',
        longitude: ''
      };

      const result = microMarketIndexDetailTransformer.process(data);

      expect(result).toEqual({
        coordinates: ['', ''],
        thumbnail: config.MAP_ICON_URL,
        isDefault: 'false'
      });
    });

    it('should transform with a default thumbnail', () => {
      const data = {
        microMarketId: 4,
        microMarketName: 'Default Thumbnail Market',
        microMarketSlug: 'default-thumbnail-market',
        latitude: 12.345,
        longitude: 67.890
      };

      const result = microMarketIndexDetailTransformer.process(data);

      expect(result).toEqual({
        microMarketId: 4,
        name: 'Default Thumbnail Market',
        slug: 'default-thumbnail-market',
        coordinates: [12.345, 67.890],
        thumbnail: config.MAP_ICON_URL,
        isDefault: 'false'
      });
    });
  });
});
