import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException, INestApplication, ValidationPipe
} from '@nestjs/common';
import * as RedisMock from 'ioredis-mock';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { BullModule } from '@nestjs/bullmq';
import { Transformer } from '../../app/utils/transformer.util';
import { AppModule } from '../../app/app.module';
import { JwtStrategy } from '../../auth/strategies/jwt.strategy';
import { CustomerEntity } from '../../customer/entities/customer.entity';
import { CustomerRepository } from '../../customer/repositories/customer.repository';
import { WishlistService } from '../services/wishlist.service';
import { WishlistRepository } from '../repositories/wishlist.repository';
import { WishlistController } from '../controllers/wishlist.controller';
import { WishlistProjectEntity } from '../entities/wishlist-project.entity';
import { WishlistEntity } from '../entities/wishlist.entity';
import config from '../../app/config';
import { AddressEntity } from '../../app/entities/address.entity';
import { DeveloperEntity } from '../../developer/entities/developer.entity';
import { DirectusFilesEntity } from '../../app/entities/directus-file.entity';
import { TourService } from '../../project/services/tour.service';
import { DirectusFieldEntity } from '../../app/entities/directus-field.entity';
import { UserInterface } from '../../auth/interfaces/user.interface';
import { mockDb } from '../../app/tests/mock-providers';
import { ProjectModule } from '../../project/project.module';
import { WishlistModule } from '../wishlist.module';

describe('Wishlist', () => {
  let app: INestApplication;
  let wishlistService: WishlistService;
  let wishlistController: WishlistController;
  let wishlistRepository: WishlistRepository;

  const wishlistRepositoryMock = {
    getWishlists: jest.fn(),
    addWishlist: jest.fn(),
    getProjectSlugById: jest.fn(),
    addProject: jest.fn(),
    updateById: jest.fn(),
    getById: jest.fn(),
    deleteById: jest.fn(),
    getWishListProjectId: jest.fn(),
    removeProject: jest.fn(),
    getProjectsIds: jest.fn()
  };

  const tourServiceMock = {
    getProjectId: jest.fn()
  };

  beforeEach(async () => {
    const module: TestingModule = await Test
      .createTestingModule({
        imports: [
          AppModule,
          ProjectModule,
          WishlistModule,
          PassportModule.register({ defaultStrategy: 'jwt' }),
          JwtModule.register({
            secret: config.ACCESS_TOKEN_SECRET,
            signOptions: {
              expiresIn: config.ACCESS_TOKEN_EXPIRES_IN
            }
          }),
          BullModule.forRoot({
            connection: new RedisMock()
          })
        ],
        controllers: [WishlistController],
        providers: [
          WishlistService,
          Transformer,
          JwtStrategy,
          CustomerRepository,
          CustomerEntity,
          AddressEntity,
          DeveloperEntity,
          DirectusFilesEntity,
          DirectusFieldEntity,
          mockDb,

          { provide: WishlistRepository, useValue: wishlistRepositoryMock },
          { provide: TourService, useValue: tourServiceMock }
        ],
        exports: [JwtStrategy, PassportModule]
      })
      .compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());

    wishlistService = module.get<WishlistService>(WishlistService);
    wishlistController = module.get<WishlistController>(WishlistController);
    wishlistRepository = module.get<WishlistRepository>(WishlistRepository);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(wishlistService).toBeDefined();
  });

  describe('imports', () => {
    it('should import PassportModule', () => {
      expect(app.get(PassportModule)).toBeDefined();
    });

    it('should import AppModule', () => {
      expect(app.get(AppModule)).toBeDefined();
    });

    it('should import JwtModule', () => {
      expect(app.get(JwtModule)).toBeDefined();
    });
  });

  describe('controllers', () => {
    it('should have WishlistController', () => {
      expect(app.get(WishlistController)).toBeDefined();
    });
  });

  describe('providers', () => {
    it('should have WishlistService', () => {
      expect(app.get(WishlistService)).toBeDefined();
    });

    it('should have WishlistRepository', () => {
      expect(app.get(WishlistRepository)).toBeDefined();
    });

    it('should have Transformer', () => {
      expect(app.get(Transformer)).toBeDefined();
    });

    it('should have JwtStrategy', () => {
      expect(app.get(JwtStrategy)).toBeDefined();
    });

    it('should have CustomerRepository', () => {
      expect(app.get(CustomerRepository)).toBeDefined();
    });

    it('should have CustomerEntity', () => {
      expect(app.get(CustomerEntity)).toBeDefined();
    });

    it('should have WishlistEntity', () => {
      expect(app.get(WishlistEntity)).toBeDefined();
    });

    it('should have WishlistProjectEntity', () => {
      expect(app.get(WishlistProjectEntity)).toBeDefined();
    });
  });

  describe('exports', () => {
    it('should export JwtStrategy', () => {
      const jwtStrategy = app.get(JwtStrategy);
      const exportedJwtStrategy = app.get(JwtStrategy, { strict: false });

      expect(exportedJwtStrategy).toBe(jwtStrategy);
    });

    it('should export PassportModule', () => {
      const passportModule = app.get(PassportModule);
      const exportedPassportModule = app.get(PassportModule, { strict: false });

      expect(exportedPassportModule).toBe(passportModule);
    });
  });

  describe('addOrRemoveProject', () => {
    it('should add project successfully', async () => {
      const userId = 'userId';
      const mockUser: UserInterface = {
        id: userId,
        refreshToken: 'someToken'
      };
      const request: any = { projectSlug: 'projectSlug' };
      const expectedResult = { message: 'project added successfully' };

      jest.spyOn(wishlistService, 'addOrRemoveProject').mockResolvedValue(expectedResult);

      const result = await wishlistController.addOrRemoveProject({ user: mockUser }, request);

      expect(result).toEqual(expectedResult);
      expect(wishlistService.addOrRemoveProject).toHaveBeenCalledWith(userId, request);
    });

    it('should throw BadRequestException when project is not found in wishlist', async () => {
      const id = 'userId';
      const projectDetails: any = { projectSlug: 'slug', remove: true, wishlistId: 'wishlistId' };

      wishlistRepositoryMock.getWishListProjectId.mockResolvedValue(null);

      try {
        await wishlistService.addOrRemoveProject(id, projectDetails);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
      }

      expect(wishlistRepositoryMock.removeProject).not.toHaveBeenCalled();
    });

    it('should handle unknown projectSlug during project removal', async () => {
      const id = 'userId';
      const projectDetails: any = { projectSlug: 'slug', remove: true };

      wishlistRepositoryMock.getWishListProjectId.mockResolvedValue(null);

      await expect(wishlistService.addOrRemoveProject(id, projectDetails)).rejects.toThrow(BadRequestException);
      expect(wishlistRepositoryMock.removeProject).not.toHaveBeenCalled();
    });

    it('should retrieve project IDs successfully', async () => {
      const wishlistId = 'wishlistId';
      const getProjectsIdsRepositoryMock = jest.spyOn(wishlistRepository, 'getProjectsIds');
      getProjectsIdsRepositoryMock.mockResolvedValueOnce([
        { projectId: 'project1' },
        { projectId: 'project2' },
        { projectId: 'project3' }
      ]);

      await wishlistService.getProjectIds(wishlistId);
      expect(getProjectsIdsRepositoryMock).toHaveBeenCalledWith(wishlistId);
    });

    it('should handle error when retrieving project IDs', async () => {
      const userId = 'userId';
      const errorMessage = 'Error while retrieving project IDs';

      const getProjectsIdsRepositoryMock = jest.spyOn(wishlistRepository, 'getProjectsIds');
      getProjectsIdsRepositoryMock.mockRejectedValueOnce(new Error(errorMessage));

      try {
        await wishlistService.getProjectIds(userId);
      } catch (error) {
        expect(error.message).toBe(errorMessage);
        expect(getProjectsIdsRepositoryMock).toHaveBeenCalledWith(userId);
      }
    });
  });
});
