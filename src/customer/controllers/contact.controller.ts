import {
  BadRequestException,
  Body,
  Controller,
  Headers,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { ContactAgentDto } from '../dto/contact-agent.dto';
import { UserInterface } from '../../auth/interfaces/user.interface';
import { ContactService } from '../services/contact.service';
import { ContactDeveloperDto } from '../dto/contact-developer.dto';
import { AttachmentRequestDto } from '../dto/attachment.dto';
import { FeedbackDto } from '../dto/feedback.dto';
import { SupportRequestDto } from '../dto/support-request.dto';
import { isAllowedFileFormat } from '../../app/utils/file.util';
import { EnquiryRequestDto } from '../dto/inquiry.dto';
import { ConnectRequestDto } from '../dto/connect-request.dto';
import { ConnectRequestInterface } from '../interfaces/connect-request.interface';
import { DirectusAuth } from '../../app/utils/directus.util';
import { LeadService } from '../services/lead.service';
import { UtmDetailDto } from '../dto/utm-detail.dto';

@Controller()
export class ContactController {
  constructor(
    private readonly contactService: ContactService,
    private readonly directusAuth: DirectusAuth,
    private readonly leadService: LeadService
  ) {}

  @Post('/contact-agent')
  @UseGuards(AuthGuard())
  async contactAgent(@Req() req: { user: UserInterface }, @Body() messageBody: ContactAgentDto) {
    return this.contactService.contactAgent(req.user.id, messageBody);
  }

  @Post('/contact-developer')
  @UseGuards(AuthGuard())
  async contactDeveloper(@Req() req: { user: UserInterface }, @Body() messageBody: ContactDeveloperDto) {
    return this.contactService.contactDeveloper(req.user.id, messageBody);
  }

  @Post('/support-request')
  @UseInterceptors(FileInterceptor('attachment', { limits: { fileSize: 52428800 } }))
  async createSupportRequest(
    @UploadedFile() attachment: AttachmentRequestDto,
    @Body() request: SupportRequestDto
  ) {
    if (!attachment || !isAllowedFileFormat(attachment?.mimetype)) {
      throw new BadRequestException('Only PDF, JPEG, JPG, WEBP and PNG files are supported for attachments.');
    }
    return this.contactService.addSupportRequest(attachment, request);
  }

  @Post('/inquiry')
  createInquiry(@Body() request: EnquiryRequestDto) {
    return this.contactService.createInquiry(request);
  }

  @Post('/feedback')
  @UseInterceptors(FileInterceptor('attachment', { limits: { fileSize: 52428800 } }))
  async createFeedback(@UploadedFile() attachment: AttachmentRequestDto, @Body() request: FeedbackDto) {
    if (!attachment || !isAllowedFileFormat(attachment?.mimetype)) {
      throw new BadRequestException('Only PDF, JPEG, JPG, WEBP and PNG files are supported for attachments.');
    }

    return this.contactService.addFeedback(attachment, request);
  }

  @Post('/connect-request')
  async connectRequest(@Body() request: ConnectRequestDto): Promise<ConnectRequestInterface> {
    return this.contactService.connectRequest(request);
  }

  @Post('/leads')
  async addLeadsToConnectRequest(@Headers('authorization') authHeader: string): Promise<ConnectRequestInterface> {
    await this.directusAuth.checkAdminFunctionsPermission(authHeader);

    return this.leadService.addLeadsToConnectRequests();
  }

  @Patch('/leads')
  async updateLeads(@Headers('authorization') authHeader: string): Promise<ConnectRequestInterface> {
    await this.directusAuth.checkAdminFunctionsPermission(authHeader);

    return this.leadService.updateLeads();
  }

  @Post('/utm-details')
  async updateUtmDetails(@Headers('authorization') authHeader: string, @Body() request: UtmDetailDto): Promise<{
    message: string;
  }> {
    await this.directusAuth.checkAdminFunctionsPermission(authHeader);

    return this.leadService.updateUtmDetails(request.payload);
  }

  @Post('/bulk-utm-details')
  async updateBulkUtmDetails(@Headers('authorization') authHeader: string): Promise<{ message: string }> {
    await this.directusAuth.checkAdminFunctionsPermission(authHeader);

    return this.leadService.updateBulkUtmDetails();
  }
}
