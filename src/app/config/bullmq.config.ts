import config from './index';

interface QueueConfig {
  priority: number;
  attempts: number;
  backoff: number;
}

interface BullMqConfig {
  smsQueue: QueueConfig;
  emailQueue: QueueConfig;
}

export const bullMqConfig: BullMqConfig = {
  smsQueue: {
    priority: 1,
    attempts: config.SMS_QUEUE_MAX_RETRIES,
    backoff: config.SMS_QUEUE_RETRY_TIME
  },

  emailQueue: {
    priority: 1,
    attempts: config.EMAIL_QUEUE_MAX_RETRIES,
    backoff: config.EMAIL_QUEUE_RETRY_TIME
  }
};
