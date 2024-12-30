import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { InfobipService } from '../services/infobip.service';
import { SmsQueueData, SmsResponse } from '../interfaces/sms.interface';
import { DoveSoftService } from '../services/dove-soft.service';
import smsConfig from '../config/sms.config';

@Processor(smsConfig.smsRetryQueue)
export class SmsRetryProcessor extends WorkerHost {
  private readonly logger = new Logger(SmsRetryProcessor.name);

  constructor(
    private readonly infobipService: InfobipService,
    private readonly doveSoftService: DoveSoftService
  ) {
    super();
  }

  async process(job: Job<SmsQueueData>): Promise<SmsQueueData | SmsResponse | { message?: string }> {
    const { data } = job || {};
    const { provider, phoneNumber } = data;

    try {
      switch (provider) {
        case smsConfig.doveSoft:
          return await this.doveSoftService.sendSms(data);
        case smsConfig.infobip:
          return await this.infobipService.sendSms(data);
        default:
          return {
            message: `Invalid SMS provider: ${provider}`
          };
      }
    } catch (error) {
      const errorMessage = `Error sending SMS: ${error?.message || 'Unknown error'}`;
      this.logger.error(errorMessage);
      this.saveFailureLog(provider, error, phoneNumber);

      throw new Error(errorMessage);
    }
  }

  private saveFailureLog(provider: string, error: any, phoneNumber: string): void {
    if (provider === smsConfig.doveSoft) {
      this.doveSoftService.saveFailureLog(error, phoneNumber);
    } else if (provider === smsConfig.infobip) {
      this.infobipService.saveFailureLog(error, phoneNumber);
    }
  }
}
