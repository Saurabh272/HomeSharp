import { IsString, validateSync } from 'class-validator';
import { Test, TestingModule } from '@nestjs/testing';
import * as RedisMock from 'ioredis-mock';
import { BullModule } from '@nestjs/bullmq';
import { ProjectListingService } from '../services/project-listing.service';
import { SearchProjectTransformer } from '../transformers/search-project.transformer';
import { ProjectDetailTransformer } from '../transformers/project-detail.transformer';
import { WishlistService } from '../../wishlist/services/wishlist.service';
import { ProjectListingRepository } from '../repositories/project-listing.repository';
import { ProjectModule } from '../project.module';
import { Db } from '../../app/utils/db.util';
import { ProjectListingController } from '../controllers/project-listing.controller';
import { NearbyLocalityTransformer } from '../transformers/nearby-locality.transformer';
import { SlugTransformer } from '../transformers/slug.transformer';
import { IsValidType } from '../decorators/isValidType.decorator';
import { ProjectListingInterface } from '../interfaces/project-listing.interface';
import { AddressEntity } from '../../app/entities/address.entity';
import { SeoPropertiesEntity } from '../../app/entities/seo-properties.entity';
import { mockDb } from '../../app/tests/mock-providers';
import { TourRepository } from '../repositories/tour.repository';

describe('ProjectListingService', () => {
  let projectListingService: ProjectListingService;
  let searchProjectTransformer: SearchProjectTransformer;
  let projectListingController: ProjectListingController;
  let nearbyLocalityTransformer: NearbyLocalityTransformer;
  let slugTransformer: SlugTransformer;
  let projectListingRepository: ProjectListingRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test
      .createTestingModule({
        imports: [
          ProjectModule,
          BullModule.forRoot({
            connection: new RedisMock()
          })
        ],
        providers: [
          ProjectListingService,
          WishlistService,

          SearchProjectTransformer,
          ProjectDetailTransformer,

          ProjectListingRepository,
          TourRepository,

          AddressEntity,
          SeoPropertiesEntity,

          mockDb
        ]
      })
      .overrideProvider(Db)
      .useValue(mockDb.useValue)
      .compile();

    projectListingService = module.get<ProjectListingService>(ProjectListingService);
    projectListingRepository = module.get<ProjectListingRepository>(ProjectListingRepository);
    searchProjectTransformer = module.get<SearchProjectTransformer>(SearchProjectTransformer);
    projectListingController = module.get<ProjectListingController>(ProjectListingController);
    nearbyLocalityTransformer = module.get<NearbyLocalityTransformer>(NearbyLocalityTransformer);
    slugTransformer = module.get<SlugTransformer>(SlugTransformer);
  });

  it('should be defined', () => {
    expect(projectListingService).toBeDefined();
  });

  describe('getProjectListing', () => {
    it('should return transformed nearby localities', async () => {
      const localitiesData = [{ name: 'Locality1', slug: 'locality1', projectsCount: 3 }];
      const transformedData = [{ name: 'Locality1', slug: 'locality1', projectsCount: 3 }];

      jest.spyOn(projectListingRepository, 'getMicroMarkets').mockResolvedValue(localitiesData);
      jest.spyOn(nearbyLocalityTransformer, 'process').mockReturnValue(transformedData);

      const result = await projectListingController.getNearbyLocalities();

      expect(result).toEqual(transformedData);
      expect(projectListingRepository.getMicroMarkets).toHaveBeenCalled();
      expect(nearbyLocalityTransformer.process).toHaveBeenCalledWith(localitiesData);
    });

    it('should transform data', () => {
      const inputData = [
        { name: 'Bandra', slug: 'Bandra', projectsCount: '2' },
        { name: 'Bhandup', slug: 'Bhandup', projectsCount: '2' }
      ];
      const expectedOutput = {
        nearbyLocalities:
        [
          { name: 'Bandra', projectsCount: '2' },
          { name: 'Bhandup', projectsCount: '2' }
        ]
      };

      const result = nearbyLocalityTransformer.process(inputData);

      expect(result).toEqual(expectedOutput);
    });

    it('should return transformed slugs', async () => {
      const request = { type: 'someType' };
      const slugs: any = [
        { slug: 'katharina18' },
        { slug: 'elouise-fisher53' },
        { slug: 'bette-williamson50' },
        { slug: '72-West' },
        { slug: 'Aakash-Srishthi' }
      ];
      const transformedSlugs: any = {
        slugs: [
          'katharina18',
          'elouise-fisher53',
          'bette-williamson50',
          '72-West',
          'Aakash-Srishthi'
        ]
      };

      projectListingService.getSlugs = jest.fn().mockResolvedValue(slugs);
      const processMock = jest.spyOn(slugTransformer, 'process').mockReturnValue(transformedSlugs);

      const result = await projectListingController.getSlugs(request);

      expect(result).toEqual(transformedSlugs);
      expect(projectListingService.getSlugs).toHaveBeenCalledWith('someType');
      expect(processMock).toHaveBeenCalledWith(slugs);
    });
  });

  describe('IsValidType Decorator', () => {
    class TestClass {
      @IsString()
      @IsValidType()
      type: string;
    }

    it('should not return error for valid type', () => {
      const testInstance = new TestClass();
      testInstance.type = 'categories';

      const errors = validateSync(testInstance);

      expect(errors.length).toBe(0);
    });

    it('should not return error for another valid type', () => {
      const testInstance = new TestClass();
      testInstance.type = 'projects';

      const errors = validateSync(testInstance);

      expect(errors.length).toBe(0);
    });
  });

  describe('SearchProjectTransformer', () => {
    const mockProjectDetailTransformer = {
      getLaunchStatus: jest.fn()
    };

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          SearchProjectTransformer,
          {
            provide: ProjectDetailTransformer,
            useValue: mockProjectDetailTransformer
          }
        ]
      }).compile();

      searchProjectTransformer = module.get<SearchProjectTransformer>(SearchProjectTransformer);
    });

    it('should be defined', () => {
      expect(searchProjectTransformer).toBeDefined();
    });

    // TODO: Correct validation - lat, lng accepting string
    it('should transform data without counts', () => {
      const data: ProjectListingInterface[] = [
        {
          id: '1',
          projectSlug: 'project-1',
          name: 'Project 1',
          projectSummary: 'Summary 1',
          projectPicture: 'picture-1.jpg',
          minPrice: 100000,
          maxPrice: 200000,
          minBedrooms: 2,
          maxBedrooms: 4,
          minBathrooms: 2,
          maxBathrooms: 3,
          minCarpetArea: 800,
          maxCarpetArea: 1200,
          carpetAreaUnit: 'sq. ft.',
          localityName: 'Locality 1',
          localitySlug: 'locality-1',
          lat: 123.456,
          lng: 789.012,
          featured: true,
          mostSearched: false,
          completionDate: '2021-12-31',
          launchStatus: 'UNDER_CONSTRUCTION',
          images: 'image-1.jpg,image-2.jpg'
        }
      ];

      mockProjectDetailTransformer.getLaunchStatus.mockReturnValue('Under Construction');

      const result = searchProjectTransformer.process(data);

      expect(result.projects.length).toBe(1);
      expect(result.metadata).toBeUndefined();
    });

    it('should transform data with counts', () => {
      const data = [];
      const counts = {
        page: 1,
        totalPages: 5
      };

      const result = searchProjectTransformer.process(data, counts);

      expect(result.metadata).toBeDefined();
    });

    it('should generate file URL with image', () => {
      const image = 'image.jpg';
      const alt = 'Alt Text';

      const result = searchProjectTransformer.getFileUrl(image, alt);

      expect(result.url).toContain(image);
      expect(result.alt).toBe(alt);
    });

    it('should generate empty file URL without image', () => {
      const result = searchProjectTransformer.getFileUrl('');

      expect(result.url).toBe('');
      expect(result.alt).toBeUndefined();
    });
  });
});
