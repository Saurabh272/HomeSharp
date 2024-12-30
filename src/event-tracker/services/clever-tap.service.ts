import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosResponse } from 'axios';
import { Event } from '../types/event-tracker.type';
import { eventTrackerConfig } from '../config/event-tracker.config';
import config from '../../app/config';

@Injectable()
export class CleverTapService {
  public readonly logger = new Logger(CleverTapService.name);

  async sendEventToCleverTap(event: Event): Promise<AxiosResponse<any>> {
    try {
      const headers = {
        'X-CleverTap-Account-Id': config.CLEVERTAP_ACCOUNT_ID,
        'X-CleverTap-Passcode': config.CLEVERTAP_PASSCODE,
        'Content-Type': 'application/json'
      };

      const eventData = [
        {
          identity: event?.params?.externalId,
          type: eventTrackerConfig.eventType,
          evtName: event?.event_name,
          evtData: event?.params
        }
      ];

      this.logger.log('Clever-Tap request Data', eventData);

      return await axios.post(config.CLEVERTAP_API_URL, { d: eventData }, { headers });
    } catch (error) {
      this.logger.error('Clever-Tap API request failed', error);
      this.logger.error('Clever-Tap API request failed stack:', error?.stack);
      this.logger.error('Clever-Tap API request failed message:', error?.message);

      return error?.message;
    }
  }
}
