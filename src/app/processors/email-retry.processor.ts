import { Job } from 'bullmq';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import emailConfig from '../config/email.config';
import { EmailInfobipService } from '../services/email-infobip.service';
import { NetcoreService } from '../services/netcore.service';
import { EmailDoveSoftService } from '../services/email-dove-soft.service';

@Processor(emailConfig.emailRetryQueue)
export class SmsRetryProcessor extends WorkerHost {
  private readonly logger = new Logger(SmsRetryProcessor.name);

  constructor(
    private readonly emailInfobipService: EmailInfobipService,
    private readonly netcoreService: NetcoreService,
    private readonly emailDoveSoftService: EmailDoveSoftService
  ) {
    super();
  }

  async process(job: Job) {
    const { data } = job || {};
    const { provider, email } = data;

    try {
      switch (provider) {
        case emailConfig.netcore:
          return await this.netcoreService.sendEmail(data);
        case emailConfig.infobip:
          return await this.emailInfobipService.sendEmail(data);
        case emailConfig.doveSoft:
          return await this.emailDoveSoftService.sendEmail(data);
        default:
          return {
            message: `Invalid Email provider: ${provider}`
          };
      }
    } catch (error) {
      const errorMessage = `Error sending Email: ${error?.message || 'Unknown error'}`;
      this.logger.error(errorMessage);
      this.saveFailureLog(provider, error, email);
      throw new Error(errorMessage);
    }
  }

  private saveFailureLog(provider: string, error: any, email: string): void {
    if (provider === emailConfig.doveSoft) {
      this.emailDoveSoftService.saveFailureLog(error, email);
    }
    if (provider === emailConfig.netcore) {
      this.netcoreService.saveFailureLog(error, email);
    } else if (provider === emailConfig.infobip) {
      this.emailInfobipService.saveFailureLog(error, email);
    }
  }
}
