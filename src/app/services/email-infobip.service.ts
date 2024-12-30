import axios from 'axios';
import { Injectable, Logger } from '@nestjs/common';
import Handlebars from 'handlebars';
import config from '../config';
import emailConfig from '../config/email.config';
import { FailureLogData, SmsMessage } from '../interfaces/sms.interface';
import { FailureLogsRepository } from '../repositories/failure-logs.repository';
import { SmsRepository } from '../repositories/sms.repository';

@Injectable()
export class EmailInfobipService {
  private readonly logger = new Logger(EmailInfobipService.name);

  constructor(
    private readonly failureLogsRepository: FailureLogsRepository,
    private readonly smsRepository: SmsRepository
  ) {}

  async sendEmail(data: any): Promise<void> {
    const emailData = await this.smsRepository.getEmailTemplates(data?.swnRefNo);
    const parsedTemplate = Handlebars.compile(emailData?.templates);

    const formData = new FormData();
    formData.append('to', data?.email);
    formData.append('from', config.EMAIL_FROM_ADDRESS);
    formData.append('subject', emailData?.subject);
    formData.append('html', parsedTemplate({ ...data }));

    const response = await axios.post(
      `${config.INFOBIP_BASE_URL}${emailConfig.infobipEmailEndpoint}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          Accept: 'application/json',
          Authorization: `App ${config.INFOBIP_API_KEY}`
        }
      }
    );

    const { groupId } = response.data.messages[0].status;

    if (!emailConfig.infobipSuccessGroupIds.includes(groupId)) {
      await this.saveFailureLog(response?.data?.messages[0], data?.email);
    }

    return response?.data;
  }

  saveFailureLog(data: SmsMessage, recipient: string) {
    const dataToSave: FailureLogData = {
      eventType: emailConfig.event,
      remarks: data?.status?.name || data?.message,
      sourceOrigin: emailConfig.infobip,
      recipient
    };

    return this.failureLogsRepository.saveFailureLogs(dataToSave);
  }
}
