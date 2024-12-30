import { Injectable, Logger } from '@nestjs/common';
import { Response } from 'express';
import { EventTrackerRepository } from '../repositories/event-tracker.repository';
import { eventTrackerConfig } from '../config/event-tracker.config';
import { CustomerRepository } from '../../customer/repositories/customer.repository';
import { Event, RequestDetails } from '../types/event-tracker.type';
import { ProfileDetails } from '../../customer/types/profile-details.type';
import { setCookie } from '../../app/utils/cookie.util';
import cookieConfig from '../../app/config/cookie.config';

@Injectable()
export class EventTrackerService {
  public readonly logger = new Logger(EventTrackerService.name);

  constructor(
    private readonly eventTrackerRepository: EventTrackerRepository,
    private readonly customerRepository: CustomerRepository
  ) {}

  async saveEvents(event: Event): Promise<void> {
    return this.eventTrackerRepository.create(event, eventTrackerConfig.combinedEventTypes);
  }

  async saveAndRetrieveExternalId(res: Response, userInfo: RequestDetails): Promise<string> {
    const profileDetails: ProfileDetails = await this.customerRepository.getProfileDetailsById(userInfo?.userId);
    const externalId: string = profileDetails?.externalId || userInfo?.externalId;
    if (!profileDetails?.externalId) {
      await this.customerRepository.updateCustomer(userInfo?.userId, { externalId: userInfo?.externalId });
    }

    if (profileDetails?.externalId !== userInfo?.externalId) {
      setCookie(res, cookieConfig.externalUserIdCookieName, profileDetails?.externalId);
    }

    return externalId;
  }
}
