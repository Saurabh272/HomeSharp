import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosResponse } from 'axios';
import { Event, RequestDetails } from '../types/event-tracker.type';
import config from '../../app/config';
import { Transformer } from '../../app/utils/transformer.util';

@Injectable()
export class GoogleAnalyticsService {
  public readonly logger = new Logger(GoogleAnalyticsService.name);

  constructor(
    private readonly transformer: Transformer
  ) {}

  async sendEventToGoogleAnalytics(event: Event, userInfo: RequestDetails): Promise<AxiosResponse<any>> {
    try {
      const { GA_API_URL, GA_MEASUREMENT_ID, GA_API_SECRET_KEY } = config;

      const apiUrl = `${GA_API_URL}?measurement_id=${GA_MEASUREMENT_ID}&api_secret=${GA_API_SECRET_KEY}`;

      event.params.engagement_time_msec = 1;
      event.params.externalId = userInfo?.externalId;
      event.params.userId = userInfo?.userId;
      event.params.referrerUrl = userInfo?.referrerUrl;

      const requestBody = JSON.stringify({
        client_id: event?.params?.externalId,
        events: [{
          name: this.transformer.toSnakeCase(event?.event_name),
          params: event?.params
        }],
        user_properties: this.userProperties(userInfo)
      });

      const headers = {
        'Content-Type': 'application/json'
      };

      this.logger.log('GA request Data', requestBody);

      return await axios.post(apiUrl, requestBody, { headers });
    } catch (error) {
      this.logger.error('GA API request failed', error);
      this.logger.error('GA API request failed stack:', error?.stack);
      this.logger.error('GA API request failed message:', error?.message);
      return error?.message;
    }
  }

  private userProperties(userInfo: RequestDetails) {
    const userProperties: any = {};

    if (userInfo?.device_category) {
      userProperties.device_category = { value: userInfo?.device_category };
    }

    if (userInfo?.userAgent) {
      userProperties.user_agent = { value: userInfo?.userAgent };
    }

    if (userInfo?.ipAddress) {
      userProperties.ip_address = { value: userInfo?.ipAddress };
    }

    if (userInfo?.platform) {
      userProperties.platform = { value: userInfo?.platform };
    }

    if (userInfo?.country) {
      userProperties.country = { value: userInfo?.country };
    }

    if (userInfo?.city) {
      userProperties.city = { value: userInfo?.city };
    }

    if (userInfo?.browser) {
      userProperties.browser = { value: userInfo?.browser };
    }

    if (userInfo?.device_brand) {
      userProperties.device_brand = { value: userInfo?.device_brand };
    }

    if (userInfo?.device_model) {
      userProperties.device_model = { value: userInfo?.device_model };
    }

    if (userInfo?.os_with_version) {
      userProperties.os_with_version = { value: userInfo?.os_with_version };
    }

    if (userInfo?.operating_system) {
      userProperties.operating_system = { value: userInfo?.operating_system };
    }

    if (userInfo?.app_version) {
      userProperties.app_version = { value: userInfo?.app_version };
    }

    return userProperties;
  }
}
