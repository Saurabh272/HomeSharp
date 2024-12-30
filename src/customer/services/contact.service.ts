import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { TourService } from '../../project/services/tour.service';
import { ContactRepository } from '../repositories/contact.repository';
import { DeveloperRepository } from '../../developer/repository/developer.repository';
import { ContactAgent } from '../interfaces/contact-agent.interface';
import { MessageBodyInterface } from '../interfaces/message-body.interface';
import { AttachmentRequestDto } from '../dto/attachment.dto';
import { SupportRequestDto } from '../dto/support-request.dto';
import { EnquiryRequestDto } from '../dto/inquiry.dto';
import { FeedbackDto } from '../dto/feedback.dto';
import { ConnectRequestInterface } from '../interfaces/connect-request.interface';
import { CreateConnectRequestInterface } from '../interfaces/create-connect-request.interface';
import { ConnectRequestConfig } from '../config/connect-request.config';
import { LeadService } from './lead.service';

@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name);

  constructor(
    private readonly contactRepository: ContactRepository,
    private readonly developerRepository: DeveloperRepository,
    private readonly leadService: LeadService,
    private readonly tourService: TourService
  ) {}

  async contactAgent(customer: string, messageBody: ContactAgent) {
    const projectId = await this.tourService.getProjectId(messageBody.projectSlug);

    const existingMessage = await this.contactRepository.getExistingMessage(customer, projectId);
    if (existingMessage) {
      throw new BadRequestException('You have already asked for an agent to get in touch');
    }

    await this.contactRepository.create({
      customer,
      message: messageBody.message,
      project: projectId
    });
    return {
      message: 'success'
    };
  }

  async contactDeveloper(customer: string, messageBody: MessageBodyInterface) {
    const developerId = await this.getDeveloperBySlug(messageBody?.developerSlug);
    const result: { id?: string } = await this.contactRepository.createDeveloperRequest({
      customer: customer || null,
      message: messageBody?.message,
      developer: developerId
    });

    if (!result) {
      return {
        message: 'Unable to contact developer'
      };
    }

    return {
      message: 'success'
    };
  }

  async getDeveloperBySlug(slug: string) {
    const developer = await this.developerRepository.findDeveloperBySlug(slug);

    if (!developer || !developer.length) {
      throw new BadRequestException('Developer not found');
    }

    return developer[0].id;
  }

  async addSupportRequest(attachment: AttachmentRequestDto, request: SupportRequestDto) {
    try {
      const { buffer, originalname, mimetype } = attachment;
      const getSupportRequestFolderIdFromRoot = await this.contactRepository.getSupportRequestFolderIdFromRoot();

      const form = new FormData();
      const file = new Blob([buffer], { type: mimetype });
      form.append('folder', getSupportRequestFolderIdFromRoot);
      form.append('file', file, originalname);

      const attachmentId = await this.contactRepository.uploadAttachment(form);

      const result = await this.contactRepository.createSupportRequest(request, attachmentId);
      return {
        supportRequestId: result?.id,
        message: 'success'
      };
    } catch (error) {
      this.logger.error(error);
      return error;
    }
  }

  async createInquiry(request: EnquiryRequestDto) {
    try {
      const result = await this.contactRepository.createInquiry(request);
      if (!result) {
        return {
          message: 'unable to create inquiry'
        };
      }
      return {
        message: 'success',
        inquiryId: result?.id
      };
    } catch (error) {
      this.logger.error(error);
      return error;
    }
  }

  async addFeedback(attachment: AttachmentRequestDto, request: FeedbackDto) {
    try {
      const { buffer, originalname, mimetype } = attachment;
      const getFeedbackFolderIdFromRoot = await this.contactRepository.getFeedbackFolderIdFromRoot();

      const form = new FormData();
      const file = new Blob([buffer], { type: mimetype });
      form.append('folder', getFeedbackFolderIdFromRoot);
      form.append('file', file, originalname);

      const attachmentId = await this.contactRepository.uploadAttachment(form);

      const result = await this.contactRepository.createFeedback(request, attachmentId);
      return {
        feedbackId: result?.id,
        message: 'success'
      };
    } catch (error) {
      this.logger.error(error);
      return error;
    }
  }

  async connectRequest(request: CreateConnectRequestInterface): Promise<ConnectRequestInterface> {
    if (request.type === ConnectRequestConfig.discussRequirementRequestV2) {
      const leadId = await this.leadService.getLeadId(request?.payload);
      if (leadId) {
        request.leadId = leadId;
      }
    }
    const result = await this.contactRepository.createConnectRequest(request);
    if (result?.id) {
      return {
        message: 'Request Successfully Received'
      };
    }

    return result;
  }
}
