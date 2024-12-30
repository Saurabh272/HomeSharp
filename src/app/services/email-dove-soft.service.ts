import axios from 'axios';
import { Injectable } from '@nestjs/common';
import Handlebars from 'handlebars';
import { FailureLogData } from '../interfaces/sms.interface';
import { FailureLogsRepository } from '../repositories/failure-logs.repository';
import emailConfig from '../config/email.config';
import config from '../config';
import { SmsRepository } from '../repositories/sms.repository';

@Injectable()
export class EmailDoveSoftService {
  constructor(
    private readonly failureLogsRepository: FailureLogsRepository,
    private readonly smsRepository: SmsRepository
  ) {}

  async sendEmail(data: any): Promise<void> {
    const emailData = await this.smsRepository.getEmailTemplates(data?.swnRefNo);
    const parsedTemplate = Handlebars.compile(emailData?.templates);

    const doveSoftConfig = {
      method: 'post',
      url: `https://transemail.dove-soft.com/v2/email/send?apikey=${config.DOVESOFT_API_KEY}`
      + `&subject=${encodeURIComponent(emailData?.subject)}`
      + `&to=${encodeURIComponent(data?.email)}`
      + `&bodyHtml=${encodeURIComponent(parsedTemplate({ ...data }))}`
      + '&encodingType=0'
      + `&from=${config.EMAIL_FROM_ADDRESS}`
      + `&from_name=${emailConfig.emailSenderName}`,
      headers: {}
    };

    const response = await axios(doveSoftConfig);

    if (this.isEmailFailed(response?.data?.success)) {
      await this.saveFailureLog(response?.data, data?.email);
    }

    return response?.data;
  }

  saveFailureLog(data: { message?: string, error?: string }, recipient: string) {
    const dataToSave: FailureLogData = {
      eventType: emailConfig.event,
      remarks: data?.message || data?.error,
      sourceOrigin: emailConfig.doveSoft,
      recipient
    };

    return this.failureLogsRepository.saveFailureLogs(dataToSave);
  }

  private isEmailFailed(status: string): boolean {
    return status !== 'true';
  }
}
