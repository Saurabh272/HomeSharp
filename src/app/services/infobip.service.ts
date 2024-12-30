import { Injectable } from '@nestjs/common';
import axios from 'axios';
import Handlebars from 'handlebars';
import config from '../config';
import { SmsRepository } from '../repositories/sms.repository';
import {
  FailureLogData, SmsMessage, SmsQueueData, SmsResponse
} from '../interfaces/sms.interface';
import { FailureLogsRepository } from '../repositories/failure-logs.repository';
import smsConfig from '../config/sms.config';

@Injectable()
export class InfobipService {
  constructor(
    private readonly smsRepository: SmsRepository,
    private readonly failureLogsRepository: FailureLogsRepository
  ) {}

  async sendSms(data: SmsQueueData): Promise<SmsResponse> {
    const { phoneNumber } = data;
    const {
      templates,
      template_id: templateId,
      entity_id: entityId
    } = await this.smsRepository.getSmsTemplates(data?.swnRefNo);

    const parsedTemplate = Handlebars.compile(templates);
    const headers = {
      Authorization: `App ${config.INFOBIP_API_KEY}`
    };
    const request = {
      messages: [
        {
          destinations: [{ to: `${smsConfig.countryCode}${phoneNumber}` }],
          from: config.EMAIL_FROM_NAME,
          text: parsedTemplate({ ...data }),
          regional: {
            indiaDlt: {
              principalEntityId: entityId,
              contentTemplateId: templateId
            }
          }
        }
      ],
      tracking: {
        track: smsConfig.infobipTrackingTrack,
        type: smsConfig.infobipTrackingType
      }
    };
    const response = await axios.post(
      `${config.INFOBIP_BASE_URL}${smsConfig.infobipSmsEndpoint}`,
      request,
      { headers }
    );

    const { groupId } = response.data.messages[0].status;

    if (!smsConfig.infobipSuccessGroupIds.includes(groupId)) {
      await this.saveFailureLog(response?.data?.messages[0], phoneNumber);
    }

    return response?.data;
  }

  saveFailureLog(data: SmsMessage, recipient: string) {
    const dataToSave: FailureLogData = {
      eventType: smsConfig.event,
      remarks: data?.status?.name || data?.message,
      sourceOrigin: smsConfig.infobip,
      recipient
    };

    return this.failureLogsRepository.saveFailureLogs(dataToSave);
  }
}
