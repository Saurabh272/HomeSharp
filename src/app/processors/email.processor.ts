import { InjectQueue, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job, Queue } from 'bullmq';
import { Logger } from '@nestjs/common';
import config from '../config';
import { bullMqConfig } from '../config/bullmq.config';
import emailConfig from '../config/email.config';
import { EmailInfobipService } from '../services/email-infobip.service';
import { NetcoreService } from '../services/netcore.service';
import { Transformer } from '../utils/transformer.util';
import { EmailDoveSoftService } from '../services/email-dove-soft.service';

@Processor(emailConfig.emailQueue)
export class EmailProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailProcessor.name);

  constructor(
    private readonly emailInfobipService: EmailInfobipService,
    private readonly netcoreService: NetcoreService,
    private readonly emailDoveSoftService: EmailDoveSoftService,
    private readonly transformer: Transformer,
    @InjectQueue(emailConfig.emailRetryQueue) private readonly emailRetryQueue: Queue
  ) {
    super();
  }

  async process(job: Job): Promise<{ message: string } | any> {
    if (!config.ENABLE_INFOBIP_EMAIL && !config.ENABLE_NETCORE_EMAIL && !config.ENABLE_DOVESOFT_EMAIL) {
      this.logger.warn('All email providers are disabled.');
      return {
        message: 'All email providers are disabled.'
      };
    }

    if (job?.data?.dateAndTime) {
      job.data.dateAndTime = this.transformer.formatDateTime(job?.data.dateAndTime);
    }

    if (config.ENABLE_DOVESOFT_EMAIL) {
      try {
        this.logger.log('Sending email via DoveSoft service...');
        return await this.emailDoveSoftService.sendEmail(job?.data);
      } catch (error) {
        await this.handleDoveSoftError(error, job);
      }
    }

    if (config.ENABLE_INFOBIP_EMAIL) {
      try {
        this.logger.log('Sending email via Infobip service...');
        return await this.emailInfobipService.sendEmail(job?.data);
      } catch (error) {
        await this.handleInfobipError(error, job);
      }
    }

    if (config.ENABLE_NETCORE_EMAIL) {
      try {
        this.logger.log('Sending email via Netcore service...');
        return await this.netcoreService.sendEmail(job?.data);
      } catch (error) {
        await this.handleNetcoreError(error, job);
      }
    }
  }

  private async handleNetcoreError(error: any, job: Job): Promise<void> {
    const errorMessage = `Error sending Email: ${error?.message || 'Unknown error'}`;
    this.logger.error(errorMessage);
    this.netcoreService.saveFailureLog(error, job?.data?.email);

    if (job?.attemptsMade >= config.EMAIL_QUEUE_MAX_RETRIES) {
      this.logger.log('Max retries reached for Netcore. Fallback to DoveSoft.');
      await this.handleFallback(job, emailConfig.doveSoft);
    }

    throw new Error(errorMessage);
  }

  private async handleInfobipError(error: any, job: Job): Promise<void> {
    const errorMessage = `Error sending Email: ${error?.message || 'Unknown error'}`;
    this.logger.error(errorMessage);
    this.emailInfobipService.saveFailureLog(error, job?.data?.email);

    if (job?.attemptsMade >= config.EMAIL_QUEUE_MAX_RETRIES && config.ENABLE_NETCORE_EMAIL) {
      this.logger.log('Max retries reached for Infobip. Fallback to DoveSoft.');
      await this.handleFallback(job, emailConfig.doveSoft);
    }

    throw new Error(errorMessage);
  }

  private async handleDoveSoftError(error: any, job: Job): Promise<void> {
    const errorMessage = `Error sending Email: ${error?.message || 'Unknown error'}`;
    this.logger.error(errorMessage);
    this.emailDoveSoftService.saveFailureLog(error, job?.data?.email);

    if (job?.attemptsMade >= config.EMAIL_QUEUE_MAX_RETRIES && config.ENABLE_NETCORE_EMAIL) {
      this.logger.log('Max retries reached for DoveSoft. Fallback to INFOBIP.');
      await this.handleFallback(job, emailConfig.infobip);
    }

    throw new Error(errorMessage);
  }

  private async handleFallback(job: Job, provider: string): Promise<void> {
    job.data.provider = provider;

    await this.emailRetryQueue.add(
      emailConfig.emailRetryQueue,
      job.data,
      { ...bullMqConfig.emailQueue }
    );
  }
}
