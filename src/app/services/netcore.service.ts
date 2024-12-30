import { Injectable } from '@nestjs/common';
import axios from 'axios';
import Handlebars from 'handlebars';
import { SmsRepository } from '../repositories/sms.repository';
import { FailureLogData } from '../interfaces/sms.interface';
import { FailureLogsRepository } from '../repositories/failure-logs.repository';
import emailConfig from '../config/email.config';
import config from '../config';

@Injectable()
export class NetcoreService {
  constructor(
    private readonly smsRepository: SmsRepository,
    private readonly failureLogsRepository: FailureLogsRepository
  ) {}

  async sendEmail(data: any): Promise<void> {
    const emailData = await this.smsRepository.getEmailTemplates(data?.swnRefNo);
    const parsedTemplate = Handlebars.compile(emailData?.templates);
    const payload = {
      from: {
        email: config.EMAIL_FROM_ADDRESS,
        name: emailConfig.emailSenderName
      },
      subject: emailData?.subject,
      content: [{
        type: emailConfig.emailContentType,
        value: parsedTemplate({ ...data })
      }],
      personalizations: [{
        to: [{
          email: data?.email
        }]
      }],
      settings: {
        open_track: true,
        click_track: true,
        unsubscribe_track: true
      }
    };

    const response = await axios.post(
      config.NETCORE_URL,
      payload,
      {
        headers: {
          api_key: config.NETCORE_API_KEY
        }
      }
    );

    return response?.data;
  }

  saveFailureLog(data: any, recipient: string) {
    const dataToSave: FailureLogData = {
      eventType: emailConfig.event,
      remarks: data?.smslist?.sms?.reason || data?.message,
      sourceOrigin: emailConfig.netcore,
      recipient
    };

    return this.failureLogsRepository.saveFailureLogs(dataToSave);
  }
}
