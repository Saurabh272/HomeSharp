import { Test, TestingModule } from '@nestjs/testing';
import { plainToInstance } from 'class-transformer';
import { ValidationArguments, validate } from 'class-validator';
import { BadRequestException } from '@nestjs/common';
import * as RedisMock from 'ioredis-mock';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { BullModule } from '@nestjs/bullmq';
import { AppModule } from '../../app/app.module';
import { ProjectModule } from '../../project/project.module';
import { DeveloperModule } from '../../developer/developer.module';
import config from '../../app/config';
import { Db } from '../../app/utils/db.util';
import { mockDb } from '../../app/tests/mock-providers';
import { ContactController } from '../controllers/contact.controller';
import { ContactService } from '../services/contact.service';
import { TourService } from '../../project/services/tour.service';
import { ContactRepository } from '../repositories/contact.repository';
import { DeveloperRepository } from '../../developer/repository/developer.repository';
import { ContactAgentEntity } from '../entities/contact-agent.entity';
import { CustomerEntity } from '../entities/customer.entity';
import { ContactDeveloperEntity } from '../entities/contact-developer.entity';
import { FeedbackEntity } from '../entities/feedback.entity';
import { SupportRequestEntity } from '../entities/support-request.entity';
import { ContactAgentDto } from '../dto/contact-agent.dto';
import { InquiryEntity } from '../entities/inquiry.entity';
import { ContactDeveloperDto } from '../dto/contact-developer.dto';
import { AttachmentRequestDto } from '../dto/attachment.dto';
import { SupportRequestDto } from '../dto/support-request.dto';
import { EnquiryRequestDto } from '../dto/inquiry.dto';
import { FeedbackDto } from '../dto/feedback.dto';
import { ConnectRequestEntity } from '../entities/connect-request.entity';
import { ConnectRequestDto } from '../dto/connect-request.dto';
import { IsCustomValidConstraint } from '../decorator/enquiry.decorator';
import { LeadService } from '../services/lead.service';
import { LeadEntity } from '../entities/lead.entity';
import { LeadRepository } from '../repositories/lead.repository';
import { UtmParams } from '../interfaces/utm-params.interface';
import { LeadCampaignEntity } from '../entities/lead-campaign.entity';
import { LeadMediumEntity } from '../entities/lead-medium.entity';
import { LeadSourceEntity } from '../entities/lead-source.entity';

describe('Contact', () => {
  let controller: ContactController;
  let service: ContactService;
  let repository: ContactRepository;
  let tourService: TourService;
  let developerRepository: DeveloperRepository;
  let constraint: IsCustomValidConstraint;
  let leadService: LeadService;
  let leadRepository: LeadRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AppModule,
        ProjectModule,
        DeveloperModule,
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.register({
          secret: config.ACCESS_TOKEN_SECRET,
          signOptions: {
            expiresIn: config
          }
        }),
        BullModule.forRoot({
          connection: new RedisMock()
        })
      ],
      controllers: [ContactController],
      providers: [
        ContactService,
        ContactRepository,
        CustomerEntity,
        ContactAgentEntity,
        ContactDeveloperEntity,
        SupportRequestEntity,
        InquiryEntity,
        FeedbackEntity,
        ConnectRequestEntity,
        LeadEntity,
        LeadService,
        LeadRepository,
        LeadCampaignEntity,
        LeadMediumEntity,
        LeadSourceEntity,
        mockDb
      ]
    })
      .overrideProvider(Db)
      .useValue(mockDb.useValue)
      .compile();

    controller = module.get<ContactController>(ContactController);
    service = module.get<ContactService>(ContactService);
    repository = module.get<ContactRepository>(ContactRepository);
    developerRepository = module.get<DeveloperRepository>(DeveloperRepository);
    tourService = module.get<TourService>(TourService);
    leadService = module.get<LeadService>(LeadService);
    leadRepository = module.get<LeadRepository>(LeadRepository);
    constraint = new IsCustomValidConstraint();
  });

  describe('Controller', () => {
    it('Contact controller should be defined', () => {
      expect(controller).toBeDefined();
    });

    describe('contactAgent', () => {
      it('should call contactAgent service method with correct parameters', async () => {
        const user = { id: 'user_id', refreshToken: 'refresh_token' };
        const contactAgentDto: ContactAgentDto = {
          message: 'Test message',
          projectSlug: 'test-project'
        };

        jest.spyOn(service, 'contactAgent').mockResolvedValue({ message: 'success' });

        const result = await controller.contactAgent({ user }, contactAgentDto);

        expect(result).toEqual({ message: 'success' });
      });

      it('should handle BadRequestException from service', async () => {
        const user = { id: 'user_id', refreshToken: 'refresh_token' };
        const contactAgentDto: ContactAgentDto = {
          message: 'Test message',
          projectSlug: 'test-project'
        };

        jest.spyOn(service, 'contactAgent').mockRejectedValue(new BadRequestException('Invalid request'));

        await expect(controller.contactAgent({ user }, contactAgentDto))
          .rejects.toThrowError(BadRequestException);
      });
    });

    describe('contactDeveloper', () => {
      it('should return success message when developer is created', async () => {
        jest.spyOn(service, 'contactDeveloper').mockResolvedValue({
          message: 'success'
        });

        const result = await controller.contactDeveloper({
          user: {
            id: 'customer-id',
            refreshToken: 'refresh-token'
          }
        }, {
          developerSlug: 'developer-slug',
          message: 'message'
        });

        expect(result).toEqual({ message: 'success' });
      });

      it('should return error message when developer is not created', async () => {
        jest.spyOn(service, 'contactDeveloper').mockResolvedValue({
          message: 'unable to contact developer'
        });

        const result = await controller.contactDeveloper({
          user: {
            id: 'customer-id',
            refreshToken: 'refresh-token'
          }
        }, {
          developerSlug: 'developer-slug',
          message: 'message'
        });

        expect(result).toEqual({ message: 'unable to contact developer' });
      });

      it('should throw error when developer is not found', () => {
        jest.spyOn(service, 'contactDeveloper').mockRejectedValue(new BadRequestException());

        const result = controller.contactDeveloper({
          user: {
            id: 'customer-id',
            refreshToken: 'refresh-token'
          }
        }, {
          developerSlug: 'developer-slug',
          message: 'message'
        });

        expect(result).rejects.toThrow(BadRequestException);
      });

      it('should return a validation error for a message with less than 20 characters', async () => {
        const contactDeveloper = { message: 'Short message', developerSlug: 'valid-slug' };
        const dtoInstance = plainToInstance(ContactDeveloperDto, contactDeveloper);
        const errors = await validate(dtoInstance);
        expect(errors.length).toBe(1);
      });

      it('should return a validation error for a message with greater than 500 characters', async () => {
        const contactDeveloper = {
          message: 'In a testing scenario, you would create an instance of the ContactDeveloperDto class and assign it'
            + ' a message property that  intentionally exceeds 500 characters.This could be a lengthy message,  such '
            + 'as a multi- paragraph explanation or a long piece of text. The purpose of this test is to verify that '
            + 'DTO correctly detects  and blocks initialization when the message length exceeds the specified 500'
            + '-  character limit.Class - validators validation mechanism is used to check the length of the message'
            + 'property,  and if it exceeds 500 characters, the test expects to find validation errors indicating that'
            + 'the provided data does  not meet the specified criteria.This test ensures that the DTO enforces the'
          + 'length validation for the message property  effectively the',
          developerSlug: 'valid-slug'
        };
        const dtoInstance = plainToInstance(ContactDeveloperDto, contactDeveloper);
        const errors = await validate(dtoInstance);
        expect(errors.length).toBe(1);
      });

      it('should return not throw error when message is between 20 and 500 characters', async () => {
        const contactDeveloper = { message: 'contact developer for any issues you have', developerSlug: 'valid-slug' };
        const dtoInstance = plainToInstance(ContactDeveloperDto, contactDeveloper);
        const errors = await validate(dtoInstance);
        expect(errors.length).toBe(0);
      });
    });

    describe('supportRequest', () => {
      it('should create a support request', async () => {
        const attachment: AttachmentRequestDto = {
          attachment: {
            fieldname: 'attachment',
            originalname: 'test.pdf',
            encoding: '7bit',
            mimetype: 'application/pdf',
            buffer: Buffer.from('file content'),
            size: 12345,
            stream: null,
            destination: null,
            filename: null,
            path: null
          },
          originalname: 'test.pdf',
          buffer: 'file content',
          mimetype: 'application/pdf'
        };
        const request: SupportRequestDto = {
          name: 'Test name',
          subject: 'Support Request',
          issueDescription: 'Issue description'
        };

        jest.spyOn(service, 'addSupportRequest').mockResolvedValue({
          message: 'success',
          supportRequestId: 'fa32486e-aaf3-4b73-bf9c-c98b92e36fe5'
        });

        const result = await controller.createSupportRequest(attachment, request);

        expect(service.addSupportRequest).toHaveBeenCalledWith(attachment, request);
        expect(result).toEqual({ message: 'success', supportRequestId: 'fa32486e-aaf3-4b73-bf9c-c98b92e36fe5' });
      });

      it('should throw a BadRequestException for invalid attachments', async () => {
        const attachment: AttachmentRequestDto = {
          attachment: {
            fieldname: 'attachment',
            originalname: 'test.json',
            encoding: '7bit',
            mimetype: 'application/json',
            buffer: Buffer.from('file content'),
            size: 12345,
            stream: null,
            destination: null,
            filename: null,
            path: null
          },
          originalname: 'test.json',
          buffer: 'file content',
          mimetype: 'application/json'
        };
        const request = {
          name: 'John Doe',
          subject: 'Support Request',
          issueDescription: 'Issue description'
        };

        try {
          await controller.createSupportRequest(attachment, request);
        } catch (error) {
          expect(error).toBeInstanceOf(BadRequestException);
          expect(error.message).toEqual('Only PDF, JPEG, JPG, WEBP and PNG files are supported for attachments.');
        }
      });
    });

    describe('createInquiry', () => {
      it('should call createInquiry method of service with request body', () => {
        const request: EnquiryRequestDto = {
          name: 'John Doe',
          email: 'johndoe@example.com',
          subject: 'Inquiry Subject'
        };

        jest.spyOn(repository, 'createInquiry').mockResolvedValueOnce({});
        jest.spyOn(service, 'createInquiry');

        controller.createInquiry(request);

        expect(service.createInquiry).toHaveBeenCalledWith(request);
      });

      it('should handle BadRequestException from service', async () => {
        const request: EnquiryRequestDto = {
          name: 'John Doe',
          email: 'johndoe@example.com',
          subject: 'Inquiry Subject'
        };

        jest.spyOn(service, 'createInquiry').mockRejectedValue(new BadRequestException('Invalid request'));

        await expect(controller.createInquiry(request))
          .rejects.toThrowError(BadRequestException);
      });
    });

    describe('createFeedback', () => {
      it('should create a feedback', async () => {
        const attachment: AttachmentRequestDto = {
          attachment: {
            fieldname: 'attachment',
            originalname: 'test.pdf',
            encoding: '7bit',
            mimetype: 'application/pdf',
            buffer: Buffer.from('file content'),
            size: 12345,
            stream: null,
            destination: null,
            filename: null,
            path: null
          },
          originalname: 'test.pdf',
          buffer: 'file content',
          mimetype: 'application/pdf'
        };
        const request: FeedbackDto = {
          feedbackCategory: 'feedback',
          subject: 'subject',
          issueDescription: 'Issue description'
        };

        jest.spyOn(service, 'addFeedback').mockResolvedValue({
          message: 'success',
          feedbackId: 'fa32486e-aaf3-4b73-bf9c-c98b92e36fe5'
        });

        const result = await controller.createFeedback(attachment, request);

        expect(service.addFeedback).toHaveBeenCalledWith(attachment, request);
        expect(result).toEqual({ message: 'success', feedbackId: 'fa32486e-aaf3-4b73-bf9c-c98b92e36fe5' });
      });

      it('should throw a BadRequestException for invalid attachments', async () => {
        const attachment: AttachmentRequestDto = {
          attachment: {
            fieldname: 'attachment',
            originalname: 'test.json',
            encoding: '7bit',
            mimetype: 'application/json',
            buffer: Buffer.from('file content'),
            size: 12345,
            stream: null,
            destination: null,
            filename: null,
            path: null
          },
          originalname: 'test.json',
          buffer: 'file content',
          mimetype: 'application/png'
        };
        const request = {
          feedbackCategory: 'feedback',
          subject: 'subject',
          issueDescription: 'Issue description'
        };

        try {
          await controller.createFeedback(attachment, request);
        } catch (error) {
          expect(error).toBeInstanceOf(BadRequestException);
          expect(error.message).toEqual('Only PDF, JPEG, JPG, WEBP and PNG files are supported for attachments.');
        }
      });
    });

    describe('connectRequest', () => {
      it('should return success message if connect request is created successfully', async () => {
        const connectRequestDto: ConnectRequestDto = {
          type: 'callbackRequest',
          payload: {
            name: 'John Doe',
            phone: '1234567890',
            emailAddress: 'john@example.com',
            location: 'City',
            message: 'Hello, this is a test message.'
          }
        };
        const expectedResult = {
          message: 'Request Successfully Received'
        };

        jest.spyOn(repository, 'createConnectRequest').mockResolvedValueOnce({ id: 'id' });
        const result = await controller.connectRequest(connectRequestDto);

        expect(result).toStrictEqual(expectedResult);
      });

      it('should validate connect request with invalid type', async () => {
        const request = new ConnectRequestDto();
        request.type = 'InvalidType';

        const errors = await validate(request);

        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].constraints.isEnum).toEqual('Required Data is Invalid or Incorrect');
      });

      it('should validate connect request with valid type', async () => {
        const request = new ConnectRequestDto();
        request.type = 'callbackRequest';
        request.payload = {};

        const errors = await validate(request);

        expect(errors.length).toBe(0);
      });
    });
  });

  describe('Service', () => {
    it('Contact service should be defined', () => {
      expect(service).toBeDefined();
    });

    describe('contactAgent', () => {
      it('should create a contact request successfully', async () => {
        const customerId = 'customer_id';
        const projectId = 'project_id';
        const createContactAgentRes = {
          id: 'test-id',
          status: 'test-status',
          sort: null,
          user_created: 'test-created',
          date_created: 'date-created',
          user_updated: null,
          date_updated: null,
          message: 'test message for agent for help',
          customers: customerId,
          projects: projectId
        };

        jest.spyOn(tourService, 'getProjectId').mockResolvedValue(projectId);
        jest.spyOn(repository, 'getExistingMessage').mockResolvedValue(null);
        jest.spyOn(repository, 'create').mockResolvedValue(createContactAgentRes);

        const result = await service.contactAgent(customerId, {
          message: 'Test message',
          projectSlug: 'test-project'
        });

        expect(repository.create).toHaveBeenCalled();
        expect(result).toEqual({ message: 'success' });
      });

      it('should throw BadRequestException if contact request already exists', async () => {
        const customerId = 'customer_id';
        const projectId = 'project_id';
        const contactAgentId = 'contact_agent_id';

        jest.spyOn(tourService, 'getProjectId').mockResolvedValue(projectId);
        jest.spyOn(repository, 'getExistingMessage').mockResolvedValue(contactAgentId);

        await expect(service.contactAgent(customerId, {
          message: 'Test message',
          projectSlug: 'test-project'
        })).rejects.toThrow(new BadRequestException('You have already asked for an agent to get in touch'));
      });
    });

    describe('contactDeveloper', () => {
      it('should return success message when developer is created', async () => {
        service.getDeveloperBySlug = jest.fn().mockResolvedValue('developer-id');
        jest.spyOn(repository, 'createDeveloperRequest').mockResolvedValue({
          id: 'contact-developer-id'
        });

        const result = await service.contactDeveloper('customer-id', {
          developerSlug: 'developer-slug',
          message: 'message'
        });

        expect(service.getDeveloperBySlug).toHaveBeenCalledWith('developer-slug');
        expect(result).toEqual({ message: 'success' });
      });

      it('should return error message when developer is not created', async () => {
        service.getDeveloperBySlug = jest.fn().mockResolvedValue('developer-id');
        jest.spyOn(repository, 'createDeveloperRequest').mockResolvedValue(null);

        const result = await service.contactDeveloper('customer-id', {
          developerSlug: 'developer-slug',
          message: 'message'
        });

        expect(service.getDeveloperBySlug).toHaveBeenCalledWith('developer-slug');
        expect(result).toEqual({ message: 'Unable to contact developer' });
      });

      it('should throw error when developer is not found', () => {
        jest.spyOn(service, 'getDeveloperBySlug').mockRejectedValue(new BadRequestException());

        const result = service.contactDeveloper('customer-id', {
          developerSlug: 'developer-slug',
          message: 'message'
        });

        expect(result).rejects.toThrow(BadRequestException);
      });

      it('should return developer id when developer is found', async () => {
        jest.spyOn(developerRepository, 'findDeveloperBySlug').mockResolvedValue([
          { id: 'developer-id' }
        ]);

        const result = await service.getDeveloperBySlug('developer-slug');

        expect(result).toEqual('developer-id');
      });

      it('should throw error when developer is not found', () => {
        jest.spyOn(developerRepository, 'findDeveloperBySlug').mockResolvedValue([]);

        const result = service.getDeveloperBySlug('developer-slug');

        expect(result).rejects.toThrow(BadRequestException);
      });
    });

    describe('supportRequest', () => {
      it('should add a support request', async () => {
        const attachment: AttachmentRequestDto = {
          attachment: {
            fieldname: 'attachment',
            originalname: 'test.png',
            encoding: '7bit',
            mimetype: 'image/png',
            buffer: Buffer.from('file content'),
            size: 12345,
            stream: null,
            destination: null,
            filename: null,
            path: null
          },
          originalname: 'test.png',
          buffer: 'file content',
          mimetype: 'image/png'
        };
        const request = {
          name: 'John Doe',
          subject: 'Support Request',
          issueDescription: 'Issue description'
        };

        const folderId = 'folder123';
        const attachmentId = 'attachment123';

        jest
          .spyOn(repository, 'getSupportRequestFolderIdFromRoot')
          .mockResolvedValue(folderId);
        jest.spyOn(repository, 'uploadAttachment').mockResolvedValue(attachmentId);
        jest.spyOn(repository, 'createSupportRequest').mockResolvedValue(null);

        const result = await service.addSupportRequest(attachment, request);

        expect(repository.getSupportRequestFolderIdFromRoot).toHaveBeenCalled();
        expect(repository.uploadAttachment).toHaveBeenCalled();
        expect(repository.createSupportRequest).toHaveBeenCalledWith(request, attachmentId);
        expect(result).toEqual({ message: 'success' });
      });

      it('should validate attachment with invalid mimetype', async () => {
        const attachment = new AttachmentRequestDto();
        attachment.mimetype = 'application/msword';

        const errors = await validate(attachment);
        expect(errors.length).toBeGreaterThan(0);
      });

      it('should validate support request with valid data', async () => {
        const request = new SupportRequestDto();
        request.name = 'John Doe';
        request.subject = 'Support Request';
        request.issueDescription = 'Test Issue description';

        const errors = await validate(request);
        expect(errors.length).toBe(0);
      });

      it('should validate support request with missing data', async () => {
        const request = new SupportRequestDto();
        request.name = 'John Doe';

        const errors = await validate(request);
        expect(errors.length).toBeGreaterThan(0);
      });
    });

    describe('createInquiry', () => {
      it('should create an inquiry and return success message with inquiry ID', async () => {
        const request: EnquiryRequestDto = {
          name: 'John Doe',
          email: 'johndoe@example.com',
          subject: 'Inquiry Subject'
        };
        jest.spyOn(repository, 'createInquiry').mockResolvedValue({
          id: 'inquiryId123',
          name: 'John Doe',
          email: 'johndoe@example.com',
          subject: 'Inquiry Subject',
          projectBudget: '1000',
          message: 'Inquiry message'
        });
        const result = await service.createInquiry(request);

        expect(result).toEqual({
          message: 'success',
          inquiryId: 'inquiryId123'
        });
        expect(repository.createInquiry).toHaveBeenCalledWith(request);
      });

      it('should return error message if unable to create an inquiry', async () => {
        const request: EnquiryRequestDto = {
          name: 'John Doe',
          email: 'johndoe@example.com',
          subject: 'Inquiry Subject'
        };
        jest.spyOn(repository, 'createInquiry').mockResolvedValue(null);

        const result = await service.createInquiry(request);

        expect(result).toEqual({
          message: 'unable to create inquiry'
        });
        expect(repository.createInquiry).toHaveBeenCalledWith(request);
      });
    });

    describe('createFeedback', () => {
      it('should add a feedback', async () => {
        const attachment: AttachmentRequestDto = {
          attachment: {
            fieldname: 'attachment',
            originalname: 'test.png',
            encoding: '7bit',
            mimetype: 'image/png',
            buffer: Buffer.from('file content'),
            size: 12345,
            stream: null,
            destination: null,
            filename: null,
            path: null
          },
          originalname: 'test.png',
          buffer: 'file content',
          mimetype: 'image/png'
        };
        const request = {
          feedbackCategory: 'feedback',
          subject: 'subject',
          issueDescription: 'Issue description'
        };

        const folderId = 'folder123';
        const attachmentId = 'attachment123';

        jest
          .spyOn(repository, 'getFeedbackFolderIdFromRoot')
          .mockResolvedValue(folderId);
        jest.spyOn(repository, 'uploadAttachment').mockResolvedValue(attachmentId);
        jest.spyOn(repository, 'createFeedback').mockResolvedValue(null);

        const result = await service.addFeedback(attachment, request);

        expect(repository.getFeedbackFolderIdFromRoot).toHaveBeenCalled();
        expect(repository.uploadAttachment).toHaveBeenCalled();
        expect(repository.createFeedback).toHaveBeenCalledWith(request, attachmentId);
        expect(result).toEqual({ message: 'success' });
      });

      it('should validate attachment with invalid mimetype', async () => {
        const attachment = new AttachmentRequestDto();
        attachment.mimetype = 'application/msword';

        const errors = await validate(attachment);
        expect(errors.length).toBeGreaterThan(0);
      });

      it('should validate support request with valid data', async () => {
        const request = new FeedbackDto();
        request.feedbackCategory = 'feedback';
        request.subject = 'subject';
        request.issueDescription = 'Test Issue description';

        const errors = await validate(request);
        expect(errors.length).toBe(0);
      });

      it('should validate support request with missing data', async () => {
        const request = new FeedbackDto();
        request.feedbackCategory = 'feedback';

        const errors = await validate(request);
        expect(errors.length).toBeGreaterThan(0);
      });

      it('should return result if connect request creation fails', async () => {
        const connectRequestDto: ConnectRequestDto = {
          type: 'callbackRequest',
          payload: {
            name: 'John Doe',
            phone: '1234567890',
            emailAddress: 'john@example.com',
            location: 'City',
            message: 'Hello, this is a test message.'
          }
        };

        jest.spyOn(repository, 'createConnectRequest').mockResolvedValueOnce(null);

        const result = await service.connectRequest(connectRequestDto);

        expect(result).toBeNull();
      });
    });
  });

  describe('IsCustomValidConstraint', () => {
    it('should return false if value is empty', () => {
      const args: ValidationArguments = {
        property: 'test',
        value: '',
        constraints: [],
        targetName: '',
        object: undefined
      };
      expect(constraint.validate('', args)).toBe(false);
    });

    it('should return false if value length is less than minLength', () => {
      const args: ValidationArguments = {
        property: 'test',
        value: 'abc',
        constraints: [{ minLength: 5 }],
        targetName: '',
        object: undefined
      };
      expect(constraint.validate('abc', args)).toBe(false);
    });

    it('should return false if value length is greater than maxLength', () => {
      const args: ValidationArguments = {
        property: 'test',
        value: 'abcdefgh',
        constraints: [{ maxLength: 5 }],
        targetName: '',
        object: undefined
      };
      expect(constraint.validate('abcdefgh', args)).toBe(false);
    });

    it('should return false if value does not match regex', () => {
      const args: ValidationArguments = {
        property: 'test',
        value: 'abc@123',
        constraints: [{ regex: /^[a-zA-Z]*$/ }],
        targetName: '',
        object: undefined
      };
      expect(constraint.validate('abc@123', args)).toBe(false);
    });

    it('should return default error message for empty value', () => {
      const args: ValidationArguments = {
        property: 'test',
        value: '',
        constraints: [],
        targetName: '',
        object: undefined
      };
      expect(constraint.defaultMessage(args)).toBe('test should not be empty');
    });

    it('should return custom error message for name property', () => {
      const args: ValidationArguments = {
        property: 'name',
        value: 'John123',
        constraints: [{ regex: /^[a-zA-Z]*$/ }],
        targetName: '',
        object: undefined
      };
      expect(constraint.defaultMessage(args)).toBe('name should not contain numbers or special characters');
    });

    it('should return custom error message for email property', () => {
      const args: ValidationArguments = {
        property: 'email',
        value: 'invalidemail',
        constraints: [{ regex: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/ }],
        targetName: '',
        object: undefined
      };
      expect(constraint.defaultMessage(args)).toBe('Invalid Email address');
    });

    it('should return generic error message for other properties', () => {
      const args: ValidationArguments = {
        property: 'test',
        value: 'abc@123',
        constraints: [{ regex: /^[a-zA-Z]*$/ }],
        targetName: '',
        object: undefined
      };
      expect(constraint.defaultMessage(args)).toBe('test should not contain special characters');
    });
  });

  describe('getLeadId', () => {
    it('should return null if phone is not provided', async () => {
      const result = await leadService.getLeadId({ phoneNumber: '' });
      expect(result).toBeNull();
    });

    it('should return existing lead id if lead exists', async () => {
      const leadId = '123';
      const mockUtmParams: UtmParams[] = [{
        utmSource: 'Test Source',
        utmMedium: 'Test Medium',
        utmCampaign: 'Test Campaign'
      }];
      jest.spyOn(leadRepository, 'getUtmParams').mockResolvedValueOnce(mockUtmParams);
      jest.spyOn(leadRepository, 'getLeadId').mockResolvedValueOnce([{
        id: leadId,
        utmSource: 'Test',
        utmMedium: '',
        utmCampaign: ''
      }]);
      const result: any = await leadService.getLeadId({ phoneNumber: '9876543210' });
      expect(result).toBe(leadId);
    });

    it('should create new lead if lead does not exist', async () => {
      const newLeadId = '456';
      const mockUtmParams: UtmParams[] = [{
        utmSource: '',
        utmMedium: 'Test Medium',
        utmCampaign: 'Test Campaign'
      }];
      jest.spyOn(leadRepository, 'getLeadId').mockResolvedValueOnce([]);
      jest.spyOn(leadRepository, 'getLeadName').mockResolvedValueOnce([{ name: 'User' }]);
      jest.spyOn(leadRepository, 'getUtmParams').mockResolvedValueOnce(mockUtmParams);
      jest.spyOn(leadRepository, 'create').mockResolvedValueOnce({ id: newLeadId });
      const result = await leadService.getLeadId({ phoneNumber: '9876543210' });
      expect(result).toBe(newLeadId);
    });

    it('should create new lead with provided name if name is provided', async () => {
      const newLeadId = '789';
      jest.spyOn(leadRepository, 'getLeadId').mockResolvedValueOnce([]);
      jest.spyOn(leadRepository, 'create').mockResolvedValueOnce({ id: newLeadId });
      const result = await leadService.getLeadId({ phoneNumber: '9876543210', name: 'User' });

      expect(result).toBe(newLeadId);
      expect(leadRepository.create).toHaveBeenCalledWith({
        phone: '9876543210',
        name: 'User'
      });
    });
  });

  describe('addLeadsToConnectRequests', () => {
    it('should return message if no unique phone numbers are found', async () => {
      jest.spyOn(leadRepository, 'getUniquePhoneNumbersFromConnectRequests').mockResolvedValueOnce([]);

      const result = await leadService.addLeadsToConnectRequests();
      expect(result).toEqual({ message: 'No leads found.' });
    });

    it('should add leads to connect requests and return success message', async () => {
      const mockUtmParams: UtmParams[] = [{
        utmSource: 'Test Source',
        utmMedium: 'Test Medium',
        utmCampaign: 'Test Campaign'
      }];
      const uniquePhoneNumbers = [{ phoneNumber: '9876543210' }];
      jest.spyOn(leadRepository, 'getUniquePhoneNumbersFromConnectRequests').mockResolvedValueOnce(uniquePhoneNumbers);
      jest.spyOn(leadRepository, 'getUtmParams').mockResolvedValueOnce(mockUtmParams);
      jest.spyOn(leadRepository, 'updateLead').mockResolvedValueOnce({});

      jest.spyOn(leadRepository, 'getLeadId').mockResolvedValueOnce([{
        id: '123',
        utmSource: '',
        utmMedium: '',
        utmCampaign: ''
      }]);
      jest.spyOn(leadRepository, 'addLeadToConnectRequest').mockResolvedValueOnce(null);

      const result = await leadService.addLeadsToConnectRequests();
      expect(result).toEqual({ message: 'All leads set successfully.' });
      expect(leadRepository.addLeadToConnectRequest).toHaveBeenCalledWith('123', '9876543210');
    });
  });
});
