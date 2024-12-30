import { Test, TestingModule } from '@nestjs/testing';
import { VectorGeneratorController } from '../controllers/vector-generator.controller';
import { VectorGeneratorService } from '../services/vector-generator.service';
import { VectorGeneratorRepository } from '../repositories/vector-generator.repository';
import { ProjectListingService } from '../../project/services/project-listing.service';
import { SearchProjectTransformer } from '../../project/transformers/search-project.transformer';
import { Db } from '../../app/utils/db.util';
import { mockDb } from '../../app/tests/mock-providers';
import { ProjectVectorEntity } from '../entities/project-vector.entity';
import { ProjectListingRepository } from '../../project/repositories/project-listing.repository';
import { ProjectModule } from '../../project/project.module';
import { AppModule } from '../../app/app.module';
import * as MockData from './vector-generator.data';
import { DirectusAuth } from '../../app/utils/directus.util';

describe('Vector Generator', () => {
  let vectorGeneratorController: VectorGeneratorController;
  let vectorGeneratorService: VectorGeneratorService;
  let vectorGeneratorRepository: VectorGeneratorRepository;
  let projectListingService: ProjectListingService;
  let projectListingRepository: ProjectListingRepository;
  let searchProjectTransformer: SearchProjectTransformer;
  let directusAuth: DirectusAuth;

  beforeEach(async () => {
    const module: TestingModule = await Test
      .createTestingModule({
        imports: [AppModule, ProjectModule],
        controllers: [VectorGeneratorController],
        providers: [
          VectorGeneratorService,
          VectorGeneratorRepository,
          ProjectVectorEntity,

          mockDb
        ]
      })
      .overrideProvider(Db)
      .useValue(mockDb.useValue)
      .compile();

    vectorGeneratorController = module.get<VectorGeneratorController>(VectorGeneratorController);
    vectorGeneratorService = module.get<VectorGeneratorService>(VectorGeneratorService);
    vectorGeneratorRepository = module.get<VectorGeneratorRepository>(VectorGeneratorRepository);
    projectListingService = module.get<ProjectListingService>(ProjectListingService);
    projectListingRepository = module.get<ProjectListingRepository>(ProjectListingRepository);
    searchProjectTransformer = module.get<SearchProjectTransformer>(SearchProjectTransformer);
    directusAuth = module.get<DirectusAuth>(DirectusAuth);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(vectorGeneratorController).toBeDefined();
    expect(vectorGeneratorService).toBeDefined();
    expect(vectorGeneratorRepository).toBeDefined();
    expect(projectListingService).toBeDefined();
    expect(projectListingRepository).toBeDefined();
    expect(searchProjectTransformer).toBeDefined();
  });

  describe('Controller', () => {
    describe('Generator Vector', () => {
      it('should call generateVector method of VectorGeneratorService', async () => {
        const generateVectorSpy = jest.spyOn(vectorGeneratorService, 'generateVector');
        generateVectorSpy.mockResolvedValue({ message: 'Vector generated successfully' });

        jest.spyOn(directusAuth, 'checkAdminFunctionsPermission').mockResolvedValue(true);

        await vectorGeneratorController.generateVector('Bearer valid_token');

        expect(generateVectorSpy).toHaveBeenCalled();
      });
    });

    describe('Get Similar Projects', () => {
      it('should return similar projects based on configuration ID', async () => {
        const getSimilarProjectsSpy = jest.spyOn(vectorGeneratorService, 'getSimilarProjects');
        getSimilarProjectsSpy.mockResolvedValue(['projectId1', 'projectId2']);

        const getProjectsFromSearchServiceByIdsSpy = jest
          .spyOn(projectListingService, 'getProjectsFromSearchServiceByIds');
        getProjectsFromSearchServiceByIdsSpy.mockResolvedValue(
          {
            projects: MockData.mockProjectsData,
            metaData: {
              totalProjects: 2,
              totalPages: 1,
              page: 1,
              pageSize: 10
            }
          }
        );

        const result = await vectorGeneratorController.getSimilarProjects(MockData.mockConfigurationIdRequest);

        expect(getSimilarProjectsSpy).toHaveBeenCalledWith(MockData.mockConfigurationIdRequest);
        expect(projectListingService.getProjectsFromSearchServiceByIds)
          .toHaveBeenCalledWith({
            projectIds: ['projectId1', 'projectId2']
          });
        expect(result).toEqual(MockData.transformedData);
      });
    });
  });

  describe('Service', () => {
    describe('Generator Vector', () => {
      it('should generate vector', async () => {
        jest.spyOn(vectorGeneratorService, 'getStatistics').mockResolvedValue([
          MockData.mockProjectStatistics, MockData.mockConfigurationStatistics
        ]);
        jest.spyOn(vectorGeneratorService, 'truncateAndInsertConstantData').mockReturnValue(Promise.resolve());
        jest.spyOn(vectorGeneratorService, 'calculateAndInsertFeatureVector').mockReturnValue(Promise.resolve());

        const result = await vectorGeneratorService.generateVector();

        expect(vectorGeneratorService.getStatistics).toHaveBeenCalled();
        expect(vectorGeneratorService.truncateAndInsertConstantData).toHaveBeenCalled();
        expect(vectorGeneratorService.calculateAndInsertFeatureVector)
          .toHaveBeenCalledWith(MockData.mockProjectStatistics[0], MockData.mockConfigurationStatistics[0]);
        expect(result).toEqual({ message: 'Vector generated successfully' });
      });
    });

    describe('Get Statistics', () => {
      it('should get statistics', () => {
        jest.spyOn(vectorGeneratorRepository, 'getProjectStatistics').mockResolvedValue([]);
        jest.spyOn(vectorGeneratorRepository, 'getConfigurationsStatistics').mockResolvedValue([]);

        vectorGeneratorService.getStatistics();

        expect(vectorGeneratorRepository.getProjectStatistics).toHaveBeenCalled();
        expect(vectorGeneratorRepository.getConfigurationsStatistics).toHaveBeenCalled();
      });
    });

    describe('Truncate And Insert Constant Data', () => {
      it('should truncate and insert constant data', async () => {
        jest.spyOn(vectorGeneratorRepository, 'truncateProjectVectors').mockReturnValue(Promise.resolve());
        jest.spyOn(vectorGeneratorRepository, 'getProjectDetails').mockResolvedValue(MockData.mockProjectDetails);
        jest.spyOn(vectorGeneratorRepository, 'insertConstantData').mockReturnValue(Promise.resolve());

        await vectorGeneratorService.truncateAndInsertConstantData();

        expect(vectorGeneratorRepository.truncateProjectVectors).toHaveBeenCalled();
        expect(vectorGeneratorRepository.getProjectDetails).toHaveBeenCalled();
        expect(vectorGeneratorRepository.insertConstantData).toHaveBeenCalledWith(MockData.mockProjectDetails);
      });
    });

    describe('Calculate And Insert Feature Vector', () => {
      it('should calculate and insert feature vector', async () => {
        jest.spyOn(vectorGeneratorRepository, 'updateFeatureVector').mockReturnValue(Promise.resolve());

        await vectorGeneratorService.calculateAndInsertFeatureVector(
          MockData.mockProjectStatistics[0],
          MockData.mockConfigurationStatistics[0]
        );

        expect(vectorGeneratorRepository.updateFeatureVector)
          .toHaveBeenCalledWith({ ...MockData.mockProjectStatistics[0], ...MockData.mockConfigurationStatistics[0] });
      });
    });

    describe('Get Similar Projects', () => {
      it('should get similar projects based on configuration ID', async () => {
        jest.spyOn(vectorGeneratorService, 'getSimilarProjectsBasedOnConfigurationId')
          .mockResolvedValue(MockData.mockSimilarProjects.map((project) => project.projectId));

        const result = await vectorGeneratorService.getSimilarProjects(MockData.mockConfigurationIdRequest);

        expect(vectorGeneratorService.getSimilarProjectsBasedOnConfigurationId)
          .toHaveBeenCalledWith(MockData.mockConfigurationIdRequest.configurationId);

        expect(result).toEqual(MockData.mockSimilarProjects.map((project) => project.projectId));
      });

      it('should get similar projects based on project slug', async () => {
        jest.spyOn(vectorGeneratorService, 'getSimilarProjectsBasedOnProjectSlug')
          .mockResolvedValue(MockData.mockSimilarProjects.map((project) => project.projectId));

        const result = await vectorGeneratorService.getSimilarProjects(MockData.mockProjectSlugRequest);

        expect(vectorGeneratorService.getSimilarProjectsBasedOnProjectSlug)
          .toHaveBeenCalledWith(MockData.mockProjectSlugRequest.projectSlug);

        expect(result).toEqual(MockData.mockSimilarProjects.map((project) => project.projectId));
      });
    });

    describe('Get Similar Projects Based On Configuration ID', () => {
      it('should get similar projects based on configuration ID', async () => {
        const mockConfigurationId = MockData.mockConfigurationIdRequest.configurationId;

        jest.spyOn(vectorGeneratorRepository, 'getSimilarProjects')
          .mockResolvedValue(MockData.mockSimilarProjects);

        jest.spyOn(projectListingRepository, 'getProjectIdWithConfigurationId')
          .mockResolvedValue(MockData.mockSimilarProjects);

        const result = await vectorGeneratorService.getSimilarProjectsBasedOnConfigurationId(
          mockConfigurationId
        );

        expect(vectorGeneratorRepository.getSimilarProjects)
          .toHaveBeenCalledWith(mockConfigurationId, 'projectId1');
        expect(result).toEqual(MockData.mockSimilarProjects.map((project) => project.projectId));
      });
    });

    describe('Get Similar Projects Based On Project Slug', () => {
      it('should get similar projects based on project slug', async () => {
        jest.spyOn(vectorGeneratorRepository, 'getConfigurationIdsByProjectSlug')
          .mockResolvedValue(MockData.mockConfigurationIds);
        jest.spyOn(vectorGeneratorService, 'getSimilarProjectsBasedOnConfigurationId')
          .mockResolvedValue(MockData.mockSimilarProjects.map((project) => project.projectId));

        const result = await vectorGeneratorService.getSimilarProjectsBasedOnProjectSlug(
          MockData.mockProjectSlugRequest.projectSlug
        );

        expect(vectorGeneratorRepository.getConfigurationIdsByProjectSlug)
          .toHaveBeenCalledWith(MockData.mockProjectSlugRequest.projectSlug);

        expect(vectorGeneratorService.getSimilarProjectsBasedOnConfigurationId)
          .toHaveBeenCalledWith(MockData.mockConfigurationIds[0].configurationId);
        expect(vectorGeneratorService.getSimilarProjectsBasedOnConfigurationId)
          .toHaveBeenCalledWith(MockData.mockConfigurationIds[1].configurationId);

        expect(result).toEqual(MockData.mockSimilarProjects.map((project) => project.projectId));
      });
    });

    describe('Find Top Unique Projects', () => {
      it('should find top unique projects with one array', () => {
        const result = vectorGeneratorService.findTopUniqueProjects(
          [MockData.mockSimilarProjects.map((project) => project.projectId)]
        );

        expect(result).toEqual(MockData.mockSimilarProjects.map((project) => project.projectId));
      });

      it('should find top unique projects with 2 arrays', () => {
        const result = vectorGeneratorService.findTopUniqueProjects([
          MockData.projectList1,
          MockData.projectList2
        ]);

        expect(result).toEqual(MockData.mockCombinedProjectList);
      });

      it('should find top unique projects with 3 arrays', () => {
        const result = vectorGeneratorService.findTopUniqueProjects([
          MockData.projectList1,
          MockData.projectList2,
          MockData.projectList3
        ]);

        expect(result).toEqual(MockData.mockCombinedProjectList2);
      });
    });
  });
});
