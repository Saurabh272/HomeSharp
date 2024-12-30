import {
  Body,
  Controller,
  Post,
  Headers
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import config from '../config';
import emailConfig from '../config/email.config';
import { bullMqConfig } from '../config/bullmq.config';
import { DirectusAuth } from '../utils/directus.util';
import { SendEmailDto } from '../dto/send-email.dto';

@Controller('/send')
export class EmailController {
  constructor(
    @InjectQueue(emailConfig.emailQueue) private readonly emailQueue: Queue,
    private readonly directusAuth: DirectusAuth
  ) {}

  @Post('/email')
  async sendEmail(@Body() request: SendEmailDto, @Headers('authorization') authHeader: string) {
    // TODO: Create a decorator or middleware for this node env check
    if (config.NODE_ENV !== 'production') {
      return {
        message: 'Email not sent because the application is not running in a production environment.'
      };
    }

    // TODO: Create a decorator or middleware for this auth check
    await this.directusAuth.checkAdminFunctionsPermission(authHeader);

    await this.emailQueue.add(emailConfig.sendEmail, {
      ...request
    }, bullMqConfig.emailQueue);
  }
}
