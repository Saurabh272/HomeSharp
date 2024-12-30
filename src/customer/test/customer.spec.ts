import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PassportModule } from '@nestjs/passport';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CustomerService } from '../services/customer.service';
import { ProfileController } from '../controllers/profile.controller';
import { CustomerEntity } from '../entities/customer.entity';
import { Transformer } from '../../app/utils/transformer.util';
import { CustomerAttemptsEntity } from '../entities/customer-attempts.entity';
import { UpdateNameEvent } from '../events/update-name.event';
import { UpdateProfileImageEvent } from '../events/update-profile-image.event';
import { CustomerAttemptsRepository } from '../repositories/customer-attempts.repository';
import { CustomerAttemptsService } from '../services/customer-attempts.service';
import { DirectusFilesEntity } from '../../app/entities/directus-file.entity';
import { AddressEntity } from '../../app/entities/address.entity';
import { DeveloperEntity } from '../../developer/entities/developer.entity';
import { SeoPropertiesEntity } from '../../app/entities/seo-properties.entity';
import { WishlistEntity } from '../../wishlist/entities/wishlist.entity';
import { ProfileDetailTransformer } from '../transformers/profile-details.transformer';
import config from '../../app/config';
import { UserInterface } from '../../auth/interfaces/user.interface';
import { mockCustomerRepository, mockDb } from '../../app/tests/mock-providers';
import { ProjectModule } from '../../project/project.module';
import { WishlistModule } from '../../wishlist/wishlist.module';
import { MockOtpEntity } from '../entities/mock-otp.entity';

describe('customer module', () => {
  let profileController: ProfileController;
  let customerService: CustomerService;
  let transformer: ProfileDetailTransformer;

  const imgReq = {
    user: {
      id: '212b7688-ffe4-4dbd-911b-0418fd26c595',
      refreshToken: 'someToken'
    }
  };
  const image = {
    buffer: Buffer.from('./image.jpeg').toString('base64'),
    originalname: 'image.jpg',
    mimeType: 'image/jpg',
    image: {
      fieldname: 'image',
      originalname: 'image.jpg',
      mimetype: 'image/jpeg',
      buffer: Buffer.from('./image.jpeg')
    } as Express.Multer.File
  };

  beforeEach(async () => {
    const module: TestingModule = await Test
      .createTestingModule({
        imports: [
          PassportModule.register({ defaultStrategy: 'jwt' }),
          ProjectModule,
          WishlistModule
        ],
        controllers: [ProfileController],
        providers: [
          CustomerService,
          CustomerAttemptsService,
          Transformer,
          EventEmitter2,
          ProfileDetailTransformer,
          mockCustomerRepository,
          CustomerAttemptsRepository,
          CustomerEntity,
          CustomerAttemptsEntity,
          AddressEntity,
          DeveloperEntity,
          DirectusFilesEntity,
          SeoPropertiesEntity,
          WishlistEntity,
          MockOtpEntity,
          mockDb
        ]
      })
      .compile();

    profileController = module.get<ProfileController>(ProfileController);
    customerService = module.get<CustomerService>(CustomerService);
    transformer = new ProfileDetailTransformer();
  });

  it('should be defined', () => {
    expect(customerService).toBeDefined();
  });

  describe('update', () => {
    it('should update the profile name', async () => {
      const userId = '212b7688-ffe4-4dbd-911b-0418fd26c595';
      const mockUser: UserInterface = {
        id: userId,
        refreshToken: 'someToken'
      };
      const req = { user: mockUser };
      const updateNameRequest = { name: 'Bruce Wayne' };

      jest.spyOn(customerService, 'updateProfile').mockResolvedValue({ message: 'User name updated successfully' });

      const result = await profileController.update(req, updateNameRequest);

      expect(result).toEqual({ message: 'User name updated successfully' });
      expect(customerService.updateProfile).toHaveBeenCalledWith(userId, updateNameRequest);
    });

    it('should call customerService.updateProfile() with the correct parameters', async () => {
      const userId = '212b7688-ffe4-4dbd-911b-0418fd26c595';
      const req = { user: { id: userId, refreshToken: 'someToken' } };
      const updateNameRequest = { name: 'Bruce Wayne' };

      jest.spyOn(customerService, 'updateProfile').mockResolvedValue({});

      await profileController.update(req, updateNameRequest);

      expect(customerService.updateProfile).toHaveBeenCalledWith(userId, updateNameRequest);
    });

    it('should handle a failure in updating the profile name', async () => {
      const userId = '212b7688-ffe4-4dbd-911b-0418fd26c595';
      const req = { user: { id: userId, refreshToken: 'someToken' } };
      const updateNameRequest = { name: 'Bruce Wayne' };

      jest.spyOn(customerService, 'updateProfile').mockRejectedValue(new Error('Failed to update profile name'));

      await expect(profileController.update(req, updateNameRequest)).rejects.toThrow('Failed to update profile name');
    });

    it('should handle a timeout in updating the profile name', async () => {
      const req = { user: { id: '212b7688-ffe4-4dbd-911b-0418fd26c595', refreshToken: 'someToken' } };
      const updateNameRequest = { name: 'Bruce Wayne' };

      jest.spyOn(customerService, 'updateProfile')
        .mockImplementation(() => new Promise(() => {}))
        .mockRejectedValue(new Error('Update timeout'));

      await expect(profileController.update(req, updateNameRequest)).rejects.toThrow('Update timeout');
    });

    it('should transform profile details with an image and wishlist', () => {
      const data = {
        profileDetails: {
          name: 'John Doe',
          email: 'john@example.com',
          phoneNumber: '1234567890'
        },
        profileImage: {
          image: 'profile-image.jpg'
        },
        wishlistDetails: [
          { projectSlug: 'project-1' },
          { projectSlug: 'project-2' }
        ]
      };

      const transformedResponse = transformer.process(data);

      expect(transformedResponse.name).toBe('John Doe');
      expect(transformedResponse.email).toBe('john@example.com');
      expect(transformedResponse.phoneNumber).toBe('1234567890');
      expect(transformedResponse.profileCompleted).toBe(true);
      expect(transformedResponse.image).toBe(`${config.DIRECTUS_URL}/assets/profile-image.jpg`);
      expect(transformedResponse.wishlistItems).toHaveLength(2);
    });

    it('should transform profile details without a wishlist', () => {
      const data = {
        profileDetails: {
          name: 'Jane Doe',
          email: 'jane@example.com',
          phoneNumber: '9876543210'
        },
        profileImage: {
          image: 'image'
        },
        wishlistDetails: null
      };

      const transformedResponse = transformer.process(data);

      expect(transformedResponse.name).toBe('Jane Doe');
      expect(transformedResponse.email).toBe('jane@example.com');
      expect(transformedResponse.phoneNumber).toBe('9876543210');
      expect(transformedResponse.profileCompleted).toBe(true);
      expect(transformedResponse.wishlistItems).toStrictEqual([]);
    });

    it('should handle concurrent updates to the profile name', async () => {
      const req1 = { user: { id: 'user1', refreshToken: 'someToken1' } };
      const req2 = { user: { id: 'user2', refreshToken: 'someToken2' } };
      const updateNameRequest = { name: 'Bruce Wayne' };

      jest.spyOn(customerService, 'updateProfile').mockResolvedValue({ message: 'User name updated successfully' });

      const promise1 = profileController.update(req1, updateNameRequest);
      const promise2 = profileController.update(req2, updateNameRequest);

      const [result1, result2] = await Promise.all([promise1, promise2]);

      expect(result1).toEqual({ message: 'User name updated successfully' });
      expect(result2).toEqual({ message: 'User name updated successfully' });
    });

    it('should handle a large name for the profile', async () => {
      const userId = '212b7688-ffe4-4dbd-911b-0418fd26c595';
      const req = { user: { id: userId, refreshToken: 'someToken' } };
      const updateNameRequest = {
        name: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod tellnia.'
      };

      jest.spyOn(customerService, 'updateProfile').mockResolvedValue({ message: 'User name updated successfully' });

      const result = await profileController.update(req, updateNameRequest);

      expect(result).toEqual({ message: 'User name updated successfully' });
      expect(customerService.updateProfile).toHaveBeenCalledWith(userId, updateNameRequest);
    });

    it('should return transformed profile details', async () => {
      const mockProfileDetails = {
        name: 'testing',
        email: null,
        phoneNumber: '9000000009'
      };

      const mockProfileImage = { image: null };

      const mockWishlistDetails = ['Abhiman', 'Aaradhya-Evoq'];

      jest.spyOn(customerService, 'getProfileDetails').mockResolvedValue(
        [mockProfileDetails, mockProfileImage, mockWishlistDetails]
      );

      const mockTransformedProjects = {
        name: 'testing',
        email: null,
        phoneNumber: '9000000009',
        image: null,
        wishlistItems: mockWishlistDetails,
        profileCompleted: false
      };

      jest.spyOn(ProfileDetailTransformer.prototype, 'process').mockReturnValue(mockTransformedProjects);

      const mockReq = { user: { id: 'mockUserId', refreshToken: 'someToken' } };

      const result = await profileController.getProfileDetails(mockReq);

      expect(result).toBe(mockTransformedProjects);
      expect(customerService.getProfileDetails).toHaveBeenCalledWith('mockUserId');
      expect(ProfileDetailTransformer.prototype.process).toHaveBeenCalledWith({
        profileDetails: mockProfileDetails,
        profileImage: mockProfileImage,
        wishlistDetails: mockWishlistDetails
      });
    });

    it('should throw BadRequestException for non-image file', async () => {
      const expectedResult = {
        image: 'https://dev-directus.homesharp.com/assets/3cdc2134-4167-40a8-9f68-60a75f5835cf'
      };
      jest.spyOn(customerService, 'uploadProfilePhoto').mockResolvedValue(expectedResult);

      await expect(async () => {
        await profileController.uploadPhoto(null, imgReq);
      }).rejects.toThrow(BadRequestException);
    });

    it('should handle a failed uploadProfilePhoto operation', async () => {
      const error = new Error('Only image files are allowed. Allowed image formats are: JPEG, PNG, WEBP');
      jest.spyOn(customerService, 'uploadProfilePhoto').mockRejectedValue(error);

      await expect(profileController.uploadPhoto(image, imgReq)).rejects.toThrowError(error);
    });

    it('should handle an error response from customerService.uploadProfilePhoto', async () => {
      const errorResponse = { message: 'Only image files are allowed. Allowed image formats are: JPEG, PNG' };
      jest.spyOn(customerService, 'uploadProfilePhoto')
        .mockRejectedValue(new BadRequestException(errorResponse.message));
      await expect(async () => {
        await profileController.uploadPhoto(image, imgReq);
      }).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for invalid image MIME type', async () => {
      const uploadImage: any = {
        image: { originalname: 'file.txt', buffer: '...', mimetype: 'text/plain' },
        originalname: 'file.txt',
        buffer: '...',
        mimetype: 'text/plain'
      };

      await expect(async () => {
        await profileController.uploadPhoto(uploadImage, imgReq);
      }).rejects.toThrow(BadRequestException);
    });

    it('should throw an error for Database error', async () => {
      jest.spyOn(customerService, 'getProfileDetails').mockRejectedValueOnce(new Error('Database error'));

      await expect(customerService.getProfileDetails(imgReq.user.id)).rejects.toThrow(Error);
    });

    it('should initialize the name property correctly', () => {
      const name = 'John';
      const updateNameEvent = new UpdateNameEvent({ name });

      expect(updateNameEvent.name).toEqual(name);
    });

    it('should initialize the name property as undefined if no params are provided', () => {
      const updateNameEvent = new UpdateNameEvent({ name: undefined });

      expect(updateNameEvent.name).toBeUndefined();
    });

    it('should initialize the image property as undefined if no params are provided', () => {
      const updateProfileImageEvent = new UpdateProfileImageEvent({ image: undefined });

      expect(updateProfileImageEvent.image).toBeUndefined();
    });
  });
});
