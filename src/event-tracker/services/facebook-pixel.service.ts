import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosResponse } from 'axios';
import { createHash } from 'crypto';
import { Event, RequestDetails } from '../types/event-tracker.type';
import config from '../../app/config';
import { CustomerRepository } from '../../customer/repositories/customer.repository';
import { eventTrackerConfig } from '../config/event-tracker.config';
import { FacebookPixelData } from '../interfaces/facebook-pixel.interface';
import { Transformer } from '../../app/utils/transformer.util';

@Injectable()
export class FacebookPixelService {
  public readonly logger = new Logger(FacebookPixelService.name);

  constructor(
    private readonly customerRepository: CustomerRepository,
    private readonly transformer: Transformer
  ) {}

  async sendEventToFacebookPixel(event: Event, userInfo: RequestDetails): Promise<AxiosResponse> {
    let userData;
    if (userInfo?.userId) {
      userData = await this.customerRepository.getProfileDetailsById(userInfo?.userId);
    }
    const hashedEmail = userData?.email ? createHash('sha256').update(userData.email).digest('hex') : null;
    const hashedPhoneNumber = userData?.phoneNumber
      ? createHash('sha256').update(userData.phoneNumber).digest('hex')
      : null;

    const data: FacebookPixelData = {
      data: [
        {
          event_name: this.transformer.convertStringToTitleCase(event?.event_name),
          event_time: Math.floor(new Date(event?.timestamp).getTime() / 1000),
          user_data: {
            em: [hashedEmail],
            ph: [hashedPhoneNumber],
            client_ip_address: userInfo?.ipAddress,
            client_user_agent: userInfo?.userAgent,
            external_id: userInfo?.externalId
          },
          custom_data: {
            ...event.params
          },
          event_source_url: userInfo?.referrerUrl,
          action_source: eventTrackerConfig.actionSource
        }
      ]
    };

    if (config.APP_ENV !== 'production') {
      data.test_event_code = config.FACEBOOK_PIXEL_TEST_EVENT_CODE;
    }

    const headers = {
      'Content-Type': 'application/json'
    };

    // eslint-disable-next-line max-len
    const url = `${config.FACEBOOK_PIXEL_API_URL}/${config.FACEBOOK_PIXEL_ID}/events?access_token=${config.FACEBOOK_PIXEL_ACCESS_TOKEN}`;

    return axios.post(url, data, { headers })
      .then((response) => response)
      .catch((error) => {
        this.logger.error('Facebook API request failed', error);
        this.logger.error('Facebook API request failed stack:', error?.stack);
        return error?.response;
      });
  }
}
