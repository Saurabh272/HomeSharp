import { Test, TestingModule } from '@nestjs/testing';
import { JwtModule } from '@nestjs/jwt';
import { validate } from 'class-validator';
import { PassportModule } from '@nestjs/passport';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { SavedSearchRepository } from '../repositories/saved-search.repository';
import { SavedSearchService } from '../services/saved-search.service';
import { SavedSearchController } from '../controllers/saved-search.controller';
import { mockDb } from '../../app/tests/mock-providers';
import { Db } from '../../app/utils/db.util';
import { SavedSearchTransformer } from '../transformers/saved-search.transformer';
import { AppModule } from '../../app/app.module';
import config from '../../app/config';
import {
  createSavedSearchDetails,
  expectedTransformedResult,
  mockGetByIdResult,
  mockGetByIdTransformedResponse,
  mockRequestData,
  mockTransformedResult,
  requestData,
  transformRequest,
  transformedResponse
} from './saved-search.data';
import { Bounds } from '../interfaces/saved-search.interface';
import { UpdateSavedSearchDto } from '../dto/update-saved-search.dto';
import { FiltersDto } from '../dto/saved-search-filter.dto';
import { BoundsDto } from '../dto/saved-search-bound.dto';
import { SavedSearchDto } from '../dto/create-saved-search.dto';

describe('SavedSearchService', () => {
  let controller: SavedSearchController;
  let service: SavedSearchService;
  let repository: SavedSearchRepository;
  let transformer: SavedSearchTransformer;

  const SavedSearchRepositoryMock = {
    create: jest.fn(),
    getAll: jest.fn(),
    getById: jest.fn(),
    getName: jest.fn(),
    update: jest.fn(),
    deleteById: jest.fn()
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AppModule,
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.register({
          secret: config.ACCESS_TOKEN_SECRET,
          signOptions: {
            expiresIn: config.ACCESS_TOKEN_EXPIRES_IN
          }
        })
      ],
      controllers: [SavedSearchController],
      providers: [
        SavedSearchService,
        SavedSearchTransformer,

        mockDb,

        { provide: SavedSearchRepository, useValue: SavedSearchRepositoryMock }
      ]
    })
      .overrideProvider(Db)
      .useValue(mockDb.useValue)
      .compile();

    service = module.get<SavedSearchService>(SavedSearchService);
    repository = module.get<SavedSearchRepository>(SavedSearchRepository);
    controller = module.get<SavedSearchController>(SavedSearchController);
    transformer = module.get<SavedSearchTransformer>(SavedSearchTransformer);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  const req = {
    user: {
      id: 'id',
      refreshToken: 'refreshToken'
    }
  };

  it('should handle a non-existent saved search ID', async () => {
    const nonExistentId = 'non_existent_id';
    const result = await service.getById(nonExistentId);

    expect(result).toBeUndefined();
  });

  it('should handle errors during saved search retrieval', async () => {
    jest.spyOn(repository, 'getById').mockImplementationOnce(() => {
      throw new Error('Simulated error during retrieval');
    });

    const validId = 'valid_id';

    try {
      await service.getById(validId);
      fail('Expected an exception to be thrown');
    } catch (error) {
      expect(error.message).toEqual('Simulated error during retrieval');
    }
  });

  it('should return transformed saved search details on getAll', async () => {
    const savedSearchDetails = [
      {
        id: '1',
        name: 'Search 1',
        date_created: '2023-10-19T10:44:56.456Z'
      },
      {
        id: '2',
        name: 'Search 2',
        date_created: '2023-10-19T11:00:00.000Z'
      }
    ];

    jest.spyOn(service, 'getAll').mockResolvedValueOnce(savedSearchDetails);

    const transformedDetails: any = [
      {
        id: '1',
        name: 'Search 1',
        dateCreated: '2023-10-19T10:44:56.456Z'
      },
      {
        id: '2',
        name: 'Search 2',
        dateCreated: '2023-10-19T11:00:00.000Z'
      }
    ];

    jest.spyOn(transformer, 'getAllDetails').mockReturnValueOnce(transformedDetails);

    const result = await controller.getAll(req);

    expect(result).toEqual(transformedDetails);
  });

  it('should return an empty array when data is an empty array on getAll', async () => {
    jest.spyOn(service, 'getAll').mockResolvedValueOnce([]);

    jest.spyOn(transformer, 'getAllDetails').mockReturnValueOnce({ data: [] });

    const result = await controller.getAll(req);

    expect(result).toEqual({ data: [] });
  });

  it('should transform the getById result successfully', async () => {
    jest.spyOn(service, 'getById').mockResolvedValue(mockGetByIdResult);

    const result = await controller.getById('33e28f8c-4a8f-4bf3-bad3-cb7b839a14e2');

    expect(result).toEqual(mockGetByIdTransformedResponse);
  });

  it('should delete a saved search successfully', async () => {
    const id = 'delete_search_id';
    const repositorySpy = jest.spyOn(repository, 'deleteById').mockResolvedValue();

    const result = await controller.delete(id);

    expect(repositorySpy).toHaveBeenCalledWith(id);

    expect(result).toEqual({
      message: 'Deleted saved search successfully'
    });
  });

  it('should transform request data correctly', () => {
    const result = transformer.transformRequest(requestData);

    expect(result).toEqual(expectedTransformedResult);
  });

  it('should handle undefined bounds in request data', () => {
    const result = transformer.transformRequest(mockRequestData);

    expect(result).toEqual(mockTransformedResult);
  });

  it('should create a saved search successfully with searchString', async () => {
    const request = {
      name: 'saved-search',
      filters: {
        searchString: 'Luxury'
      }
    };

    jest.spyOn(transformer, 'transformRequest')
      .mockResolvedValue(transformRequest as never);
    jest.spyOn(service, 'create').mockResolvedValue(createSavedSearchDetails);
    jest.spyOn(transformer, 'transformedResponse').mockReturnValue(transformedResponse);

    const result = await controller.create(req, request);

    expect(result.message).toEqual('Search saved successfully');
  });

  it('should return an error message when neither searchString nor microMarket is provided', async () => {
    const request = {
      name: 'saved-search',
      filters: {}
    };

    try {
      await controller.create(req, request);
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);
      expect(error.message).toBe('Either a search string or micro markets is required');
    }
  });

  it('should get saved search details by ID', async () => {
    const mockId = 'mockId';

    jest.spyOn(service, 'getById').mockResolvedValue(mockGetByIdResult);
    const result = await controller.getById(mockId);

    expect(service.getById).toHaveBeenCalledWith(mockId);
    expect(result).toStrictEqual(mockGetByIdTransformedResponse);
  });

  it('should return transformed response for empty result', async () => {
    const mockId = 'nonexistentId';
    jest.spyOn(service, 'getById').mockResolvedValue(null);

    const result = await controller.getById(mockId);

    expect(service.getById).toHaveBeenCalledWith(mockId);
    expect(result).toEqual(null);
  });

  it('returns correctly parsed object for valid bounds', () => {
    const validBounds: Bounds = {
      sw: { lat: 40.7128, lng: -74.0060 },
      ne: { lat: 34.0522, lng: -118.2437 }
    };
    const result = transformer.parseBounds(validBounds);

    expect(result).toEqual({
      sw: { lat: 40.7128, lng: -74.0060 },
      ne: { lat: 34.0522, lng: -118.2437 }
    });
  });

  it('returns object with null SW coordinates for missing sw', () => {
    const boundsWithoutSW = {
      ne: { lat: 34.0522, lng: -118.2437 }
    };

    const result = transformer.parseBounds(boundsWithoutSW);

    expect(result).toEqual({
      sw: { lat: null, lng: null },
      ne: { lat: 34.0522, lng: -118.2437 }
    });
  });

  it('returns object with null coordinates for empty bounds object', () => {
    const emptyBounds = {};

    const result = transformer.parseBounds(emptyBounds);

    expect(result).toEqual({
      sw: { lat: null, lng: null },
      ne: { lat: null, lng: null }
    });
  });

  it('returns parsed array for valid JSON array string', () => {
    const jsonArrayString = '[1, 2, 3, "four", { "key": "value" }]';
    const result = transformer.parseJsonArray(jsonArrayString);

    expect(result).toEqual([1, 2, 3, 'four', { key: 'value' }]);
  });

  it('returns empty array for empty JSON array string', () => {
    const result = transformer.parseJsonArray('');

    expect(result).toEqual([]);
  });

  it('returns empty array for invalid JSON array string', () => {
    const invalidJsonArrayString = 'not a valid JSON array';

    const result = transformer.parseJsonArray(invalidJsonArrayString);

    expect(result).toEqual([]);
  });

  describe('update', () => {
    it('should update a saved search and return a success message', async () => {
      const id = 'valid_id';
      const request: UpdateSavedSearchDto = { name: 'Updated Search Name' };
      const successMessage = { message: 'Search saved successfully' };

      jest.spyOn(service, 'update').mockResolvedValue(successMessage);

      const result = await controller.update(req, id, request);

      expect(result).toEqual(successMessage);
    });

    it('should throw UnauthorizedException for unauthorized access', async () => {
      const id = 'valid_id';
      const request: UpdateSavedSearchDto = { name: 'Updated Search Name' };

      jest.spyOn(service, 'update').mockRejectedValue(new UnauthorizedException());

      await expect(controller.update({
        user: { id: '', refreshToken: '' }
      }, id, request)).rejects.toThrow(UnauthorizedException);
    });

    it('should update a saved search without filters and return a success message', async () => {
      const id = 'valid_id';
      const request: UpdateSavedSearchDto = { name: 'Updated Search Name' };
      const successMessage = { message: 'Search saved successfully' };

      jest.spyOn(service, 'update').mockResolvedValue(successMessage);

      const result = await controller.update(req, id, request);

      expect(result).toEqual(successMessage);
    });
  });

  describe('FiltersDto', () => {
    it('should pass validation when all optional fields are not provided', async () => {
      const filters = new FiltersDto();
      const errors = await validate(filters);
      expect(errors.length).toBe(0);
    });

    it('should pass validation when valid data is provided', async () => {
      const filters = new FiltersDto();
      filters.bedRooms = [2, 3];
      filters.searchString = 'Luxury';
      filters.microMarket = 'City Center';
      filters.microMarkets = ['City Center', 'Suburb'];
      filters.bathRooms = [2];
      filters.houseType = 'Apartment';
      filters.categories = ['Luxury', 'Modern'];
      filters.launchStatus = ['Pre-launch'];
      filters.price = [100000, 200000];
      filters.developer = 'ABC Developers';

      const bounds = new BoundsDto();
      bounds.lat = 0;
      bounds.lng = 0;

      filters.bounds = bounds;
      filters.distance = 10;

      const errors = await validate(filters);
      expect(errors.length).toBe(0);
    });

    it('should fail validation when an invalid type is provided for fields', async () => {
      const filters = new FiltersDto();
      filters.bedRooms = 'invalidType' as any;
      filters.searchString = 123 as any;
      filters.microMarket = 456 as any;
      filters.microMarkets = 'invalidType' as any;
      filters.bathRooms = 'invalidType' as any;
      filters.houseType = 123 as any;
      filters.categories = 'invalidType' as any;
      filters.launchStatus = 'invalidType' as any;
      filters.price = 'invalidType' as any;
      filters.developer = 123 as any;
      filters.bounds = 'invalidType' as any;
      filters.distance = 'invalidType' as any;

      const errors = await validate(filters);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should pass validation when bounds are not provided', async () => {
      const filters = new FiltersDto();
      filters.bedRooms = [2, 3];
      filters.searchString = 'Luxury';
      filters.microMarket = 'City Center';
      filters.microMarkets = ['City Center', 'Suburb'];
      filters.bathRooms = [2];
      filters.houseType = 'Apartment';
      filters.categories = ['Luxury', 'Modern'];
      filters.launchStatus = ['Pre-launch'];
      filters.price = [100000, 200000];
      filters.developer = 'ABC Developers';
      filters.distance = 10;

      const errors = await validate(filters);
      expect(errors.length).toBe(0);
    });
  });

  it('should throw BadRequestException when the name already exists', async () => {
    const customerId = 'customer123';
    const request: SavedSearchDto = { name: 'Existing Search', filters: {} };

    jest.spyOn(repository, 'getName').mockResolvedValueOnce(true);

    try {
      await service.create(customerId, request);
      fail('Expected the promise to reject');
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);
      expect(error.message).toBe('Saved search name already exists');
    }
  });

  describe('update', () => {
    it('should update the saved search without throwing an error when name does not already exist', async () => {
      const customerId = 'customer123';
      const id = 'searchId123';
      const request: UpdateSavedSearchDto = { name: 'New Search Name' };

      jest.spyOn(repository, 'getName').mockResolvedValueOnce(false);
      jest.spyOn(repository, 'update').mockResolvedValueOnce({});

      await expect(service.update(customerId, id, request)).resolves.not.toThrow();
      expect(repository.getName).toHaveBeenCalledWith(customerId, request.name);
      expect(repository.update).toHaveBeenCalledWith(id, request);
    });

    it('should throw BadRequestException when the name already exists', async () => {
      const customerId = 'customer123';
      const id = 'searchId123';
      const request: SavedSearchDto = { name: 'Existing Search', filters: {} };

      jest.spyOn(repository, 'getName').mockResolvedValueOnce(true);

      try {
        await service.update(customerId, id, request);
        fail('Expected the promise to reject');
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toBe('Saved search name already exists');
      }
    });

    it('should update the saved search without throwing an error when name is not provided', async () => {
      const customerId = 'customer123';
      const id = 'searchId123';
      const request: UpdateSavedSearchDto = {};

      jest.spyOn(repository, 'update').mockResolvedValueOnce({});

      await expect(service.update(customerId, id, request)).resolves.not.toThrow();
      expect(repository.update).toHaveBeenCalledWith(id, request);
    });

    it(
      'should update the saved search without throwing an error when name is provided but does not exist',
      async () => {
        const customerId = 'customer123';
        const id = 'searchId123';
        const request: UpdateSavedSearchDto = { name: 'New Search Name' };

        jest.spyOn(repository, 'getName').mockResolvedValueOnce(false);
        jest.spyOn(repository, 'update').mockResolvedValueOnce({});

        await expect(service.update(customerId, id, request)).resolves.not.toThrow();
        expect(repository.getName).toHaveBeenCalledWith(customerId, request.name);
        expect(repository.update).toHaveBeenCalledWith(id, request);
      }
    );
  });

  describe('getAllDetails', () => {
    it('should return an empty array when payload is null', () => {
      const payload = null;
      const result = transformer.getAllDetails(payload);
      expect(result).toEqual({ data: [] });
    });

    it('should return an empty array when payload is an empty array', () => {
      const payload: any[] = [];
      const result = transformer.getAllDetails(payload);
      expect(result).toEqual({ data: [] });
    });

    it('should return transformed data when payload contains items', () => {
      const payload = [
        {
          id: '1',
          name: 'Search 1',
          date_created: '2023-10-19T10:44:56.456Z'
        },
        {
          id: '2',
          name: 'Search 2',
          date_created: '2023-10-19T11:00:00.000Z'
        }
      ];
      const expectedTransformedData = payload.map((item) => ({
        id: item.id,
        name: item.name,
        dateCreated: item.date_created,
        filters: {
          bathRooms: [],
          bedRooms: [],
          bounds: {
            ne: {
              lat: null,
              lng: null
            },
            sw: {
              lat: null,
              lng: null
            }
          },
          categories: [],
          developer: undefined,
          distance: 0,
          houseType: undefined,
          launchStatus: [],
          microMarket: undefined,
          microMarkets: [],
          price: [],
          searchString: undefined
        }
      }));
      const result = transformer.getAllDetails(payload);
      expect(result.data).toEqual(expectedTransformedData);
    });
  });
});
