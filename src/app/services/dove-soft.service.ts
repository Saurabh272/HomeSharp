import { Injectable } from '@nestjs/common';
import axios from 'axios';
import Handlebars from 'handlebars';
import config from '../config';
import { SmsRepository } from '../repositories/sms.repository';
import { DoveSoftSmsResponse, FailureLogData, SmsQueueData } from '../interfaces/sms.interface';
import { FailureLogsRepository } from '../repositories/failure-logs.repository';
import smsConfig from '../config/sms.config';

@Injectable()
export class DoveSoftService {
  constructor(
    private readonly smsRepository: SmsRepository,
    private readonly failureLogsRepository: FailureLogsRepository
  ) {}

  async sendSms(data: SmsQueueData): Promise<DoveSoftSmsResponse> {
    const { phoneNumber } = data;
    const {
      templates,
      template_id: templateId,
      account_usage_type_id: accountUsageTypeId,
      entity_id: entityId,
      sender_id: senderId
    } = await this.smsRepository.getSmsTemplates(data?.swnRefNo);

    const parsedTemplate = Handlebars.compile(templates);

    const request = {
      listsms: [
        {
          sms: parsedTemplate({ ...data }),
          mobiles: `+${smsConfig.countryCode}${phoneNumber}`,
          senderid: senderId,
          clientsmsid: config.DOVESOFT_CLIENT_SMS_ID,
          accountusagetypeid: accountUsageTypeId,
          entityid: entityId,
          tempid: templateId
        }
      ],
      password: config.DOVESOFT_PASSWORD,
      user: config.DOVESOFT_USERNAME
    };

    const headers = {
      'Content-Type': 'application/json'
    };

    const response = await axios.post(config.DOVESOFT_API_URL, request, { headers });

    if (this.isSmsFailed(response?.data?.smslist?.sms?.status)) {
      await this.saveFailureLog(response?.data, phoneNumber);
    }

    return response?.data;
  }

  saveFailureLog(data: DoveSoftSmsResponse, recipient: string) {
    const dataToSave: FailureLogData = {
      eventType: smsConfig.event,
      remarks: data?.smslist?.sms?.reason || data?.message,
      sourceOrigin: smsConfig.doveSoft,
      recipient
    };

    return this.failureLogsRepository.saveFailureLogs(dataToSave);
  }

  private isSmsFailed(status: string): boolean {
    return status !== 'success';
  }
}
