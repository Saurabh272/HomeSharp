import {
  BadRequestException,
  Injectable,
  Logger
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { EventEmitter2 } from '@nestjs/event-emitter';
import config from '../../app/config';
import { CustomerEntity } from '../entities/customer.entity';
import { CustomerRepository } from '../repositories/customer.repository';
import { ProjectListingRepository } from '../../project/repositories/project-listing.repository';
import { UpdateNameDto } from '../dto/update-name.dto';
import { UpdateProfileImageEvent } from '../events/update-profile-image.event';
import { UpdateProfileImageRequest } from '../dto/update-profile-photo.dto';
import { UpdateProfileResponse } from '../types/profile-details.type';

@Injectable()
export class CustomerService {
  private readonly logger = new Logger(CustomerService.name);

  constructor(
    private readonly customerEntity: CustomerEntity,
    private readonly customerRepository: CustomerRepository,
    private readonly eventEmitter: EventEmitter2,
    private readonly projectListingRepository: ProjectListingRepository
  ) {}

  public async getByLoginType(loginType: { email?: string; phoneNumber?: string }) {
    let customerData = null;

    if (loginType?.email) {
      customerData = await this.customerRepository.getByEmail(loginType?.email);
    } else if (loginType?.phoneNumber) {
      customerData = await this.customerRepository.getByPhoneNumber(loginType?.phoneNumber);
    } else {
      throw new BadRequestException('Invalid credentials');
    }

    return {
      customerData
    };
  }

  async updateProfile(id: string, updateNameRequest: UpdateNameDto): Promise<UpdateProfileResponse> {
    const customerData = await this.customerRepository.getProfileDetailsById(id);
    if (customerData?.name === updateNameRequest.name) {
      throw new BadRequestException('The provided name is the same as the current user name. No update needed.');
    }

    const result = await this.customerRepository.updateCustomer(id, updateNameRequest);
    if (result?.id) {
      return {
        message: 'User name updated successfully'
      };
    }

    return result;
  }

  async getProfileDetails(id: string) {
    try {
      const profileDetails = this.customerRepository.getProfileDetailsById(id);
      const profileImage = this.customerRepository.getProfile(id);
      const wishlistDetails = this.projectListingRepository.getWishlistProjects(id);

      return await Promise.all([profileDetails, profileImage, wishlistDetails]);
    } catch (error) {
      this.logger.error(error);
      return error;
    }
  }

  fireUpdateProfileImageEvent(image: any) {
    this.eventEmitter.emit(
      'profile.update.image',
      new UpdateProfileImageEvent({
        image
      })
    );
  }

  async uploadProfilePhoto(id: string, image: UpdateProfileImageRequest): Promise<{ image?: string }> {
    try {
      const { buffer, originalname, mimetype } = image;
      const getCustomerFolderIdFromRoot = await this.customerRepository.getCustomerFolderIdFromRoot();

      const form = new FormData();
      const file = new Blob([buffer], { type: mimetype });
      form.append('folder', getCustomerFolderIdFromRoot);
      form.append('file', file, originalname);

      const imageId = await this.customerRepository.uploadProfilePhoto(form);
      const result: { image?: string } = await this.customerRepository.updateCustomer(id, { imageId });

      this.fireUpdateProfileImageEvent(image);

      return {
        image: result?.image
          ? `${config.DIRECTUS_URL}/assets/${result?.image}`
          : null
      };
    } catch (error) {
      this.logger.error(error);
      return error;
    }
  }

  async deactivateAccount(id: string, reason: string) {
    const customer = await this.customerRepository.getById(id);

    if (!customer) {
      throw new BadRequestException('Invalid customer id');
    }

    if (customer?.profilePicture) {
      await this.customerRepository.deleteProfilePhoto(customer?.profilePicture);
    }

    const hashedEmail = customer?.email ? await this.hashContactDetails(customer.email) : null;
    const hashedPhoneNumber = customer?.phoneNumber ? await this.hashContactDetails(customer.phoneNumber) : null;

    return this.customerRepository.updateById(id, {
      name: null,
      email: hashedEmail,
      phoneNumber: hashedPhoneNumber,
      status: this.customerEntity.STATUSES.INACTIVE,
      refreshToken: null,
      rm: null,
      deletionReason: reason
    });
  }

  async hashContactDetails(contactDetails: string): Promise<string> {
    const currentDate = new Date().toISOString();
    const phoneNumberWithDateTime = `${contactDetails}${currentDate}`;
    const saltRounds = 10;

    return bcrypt.hash(phoneNumberWithDateTime, saltRounds);
  }
}
