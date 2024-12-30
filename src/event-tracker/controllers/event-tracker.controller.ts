import {
  Controller, Post, Body, Req, UseGuards, Res, Logger
} from '@nestjs/common';
import { Response } from 'express';
import { GoogleAnalyticsService } from '../services/google-analytics.service';
import { RequestDetails } from '../types/event-tracker.type';
import { JwtOptionalGuard } from '../../auth/guards/jwt-optional.guard';
import { EventPayloadDto } from '../dto/event-payload.dto';
import { PayloadTransformer } from '../transformers/event-tracker-payload.transformer';
import { CleverTapService } from '../services/clever-tap.service';
import config from '../../app/config';
import { EventTrackerService } from '../services/event-tracker.service';
import { FacebookPixelService } from '../services/facebook-pixel.service';

@Controller('track')
export class EventTrackerController {
  private readonly logger = new Logger(EventTrackerController.name);

  constructor(
    private readonly googleAnalyticsService: GoogleAnalyticsService,
    private readonly payloadTransformer: PayloadTransformer,
    private readonly cleverTapService: CleverTapService,
    private readonly eventTrackerService: EventTrackerService,
    private readonly facebookPixelService: FacebookPixelService
  ) {}

  @Post()
  @UseGuards(JwtOptionalGuard)
  async trackEvent(
    @Body() eventPayload: EventPayloadDto,
    @Req() request: Request,
    @Res() res: Response
  ): Promise<void> {
    try {
      const userInfo: RequestDetails = this.payloadTransformer.extractRequestDetails(request);
      const gaResponse: any[] = [];
      const ctResponse: any[] = [];
      const fbResponse: any[] = [];

      // TODO: Handle the case where many events are requested
      await Promise.all(
        eventPayload?.events?.map(async (event) => {
          if (userInfo?.userId) {
            userInfo.externalId = await this.eventTrackerService.saveAndRetrieveExternalId(res, userInfo);
          }

          if (config.ENABLE_FACEBOOK_PIXEL) {
            const fpEventResult = await this.facebookPixelService.sendEventToFacebookPixel(event, userInfo);
            fbResponse.push(fpEventResult?.data);
          }

          if (config.ENABLE_GOOGLE_ANALYTICS) {
            const gaEventResult = await this.googleAnalyticsService.sendEventToGoogleAnalytics(event, userInfo);
            gaResponse.push(gaEventResult?.data);
          }

          event.params = { ...event.params, ...userInfo };
          await this.eventTrackerService.saveEvents(event);
          if (config.ENABLE_CLEVERTAP) {
            const ctEventResult = await this.cleverTapService.sendEventToCleverTap(event);
            ctResponse.push(ctEventResult?.data);
          }
        })
      );

      res.status(200).json({
        status: 'Success',
        message: {
          gaResponse,
          ctResponse,
          fbResponse
        }
      });
    } catch (error) {
      this.logger.error(error);
      const statusCode = error?.response?.status || 500;
      res.status(statusCode).json({
        status: 'Error',
        message: error?.message || 'An error occurred'
      });
    }
  }
}
