import { InjectQueue, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job, Queue } from 'bullmq';
import { Logger } from '@nestjs/common';
import { InfobipService } from '../services/infobip.service';
import { SmsQueueData, SmsResponse } from '../interfaces/sms.interface';
import config from '../config';
import { DoveSoftService } from '../services/dove-soft.service';
import smsConfig from '../config/sms.config';
import { bullMqConfig } from '../config/bullmq.config';

@Processor(smsConfig.smsQueue)
export class SmsProcessor extends WorkerHost {
  private readonly logger = new Logger(SmsProcessor.name);

  constructor(
    private readonly infobipService: InfobipService,
    private readonly doveSoftService: DoveSoftService,
    @InjectQueue(smsConfig.smsRetryQueue) private readonly smsRetryQueue: Queue
  ) {
    super();
  }

  async process(job: Job<SmsQueueData>): Promise<SmsQueueData | SmsResponse | { message?: string }> {
    if (!config.ENABLE_DOVESOFT_SMS && !config.ENABLE_INFOBIP_SMS) {
      this.logger.warn('All SMS providers are disabled.');
      return {
        message: 'All SMS providers are disabled.'
      };
    }

    if (config.ENABLE_DOVESOFT_SMS) {
      try {
        return await this.doveSoftService.sendSms(job?.data);
      } catch (error) {
        await this.handleDoveSoftError(error, job);
      }
    }

    if (config.ENABLE_INFOBIP_SMS) {
      try {
        return await this.infobipService.sendSms(job?.data);
      } catch (error) {
        await this.handleInfobipError(error, job);
      }
    }
  }

  private async handleDoveSoftError(error: any, job: Job<SmsQueueData>): Promise<void> {
    const errorMessage = `Error sending SMS: ${error?.message || 'Unknown error'}`;
    this.logger.error(errorMessage);
    this.doveSoftService.saveFailureLog(error, job?.data?.phoneNumber);

    if (job?.attemptsMade >= config.SMS_QUEUE_MAX_RETRIES && config.ENABLE_INFOBIP_SMS) {
      this.logger.log('Max retries reached for DoveSoft. Fallback to Infobip.');
      await this.handleFallbackToInfobip(job);
    }

    throw new Error(errorMessage);
  }

  private async handleInfobipError(error: any, job: Job<SmsQueueData>): Promise<void> {
    const errorMessage = `Error sending SMS: ${error?.message || 'Unknown error'}`;
    this.logger.error(errorMessage);
    this.infobipService.saveFailureLog(error, job?.data?.phoneNumber);

    if (job?.attemptsMade >= config.SMS_QUEUE_MAX_RETRIES) {
      this.logger.log('Max retries reached for Infobip. Fallback to DoveSoft.');
      job.data.provider = smsConfig.doveSoft;
      await this.handleFallbackToDoveSoft(job);
    }

    throw new Error(errorMessage);
  }

  private handleFallbackToInfobip(job: Job<SmsQueueData>): Promise<void> {
    return this.handleFallback(job, smsConfig.infobip);
  }

  private handleFallbackToDoveSoft(job: Job<SmsQueueData>): Promise<void> {
    return this.handleFallback(job, smsConfig.doveSoft);
  }

  private async handleFallback(job: Job<SmsQueueData>, provider: string): Promise<void> {
    job.data.provider = provider;
    await this.smsRetryQueue.add(
      smsConfig.smsRetryQueue,
      job.data,
      { ...bullMqConfig.smsQueue }
    );
  }
}
