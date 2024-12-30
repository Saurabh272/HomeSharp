import { Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import {
  DirectusClient,
  RestClient,
  StaticTokenClient,
  createItem,
  readFolders,
  uploadFiles
} from '@directus/sdk';
import { Db } from '../../app/utils/db.util';
import { ContactAgentEntity } from '../entities/contact-agent.entity';
import { CustomerEntity } from '../entities/customer.entity';
import { ContactDeveloperEntity } from '../entities/contact-developer.entity';
import { ContactDeveloperInterface } from '../interfaces/contact-developer.interface';
import { SupportRequestEntity } from '../entities/support-request.entity';
import { InquiryEntity } from '../entities/inquiry.entity';
import { FeedbackEntity } from '../entities/feedback.entity';
import { IRepository } from '../../app/interfaces/repository.interface';
import { SupportRequestInterface } from '../interfaces/support-request.interface';
import { FeedbackInterface } from '../interfaces/feedback.interface';
import { InquiryInterface } from '../interfaces/inquiry.interface';
import { ConnectRequestEntity } from '../entities/connect-request.entity';
import { ConnectRequestInterface } from '../interfaces/connect-request.interface';
import { CreateConnectRequestInterface } from '../interfaces/create-connect-request.interface';

@Injectable()
export class ContactRepository implements IRepository {
  private client: DirectusClient<any> & StaticTokenClient<any> & RestClient<any>;

  private readonly entities: {
    connectRequests: any;
    contactAgents: any;
    customers: any;
  };

  constructor(
    private readonly db: Db,
    private readonly connectRequestEntity: ConnectRequestEntity,
    private readonly contactAgentEntity: ContactAgentEntity,
    private readonly customerEntity: CustomerEntity,
    private readonly contactDeveloperEntity: ContactDeveloperEntity,
    private readonly feedbackEntity: FeedbackEntity,
    private readonly inquiryEntity: InquiryEntity,
    private readonly supportRequestEntity: SupportRequestEntity
  ) {
    this.client = db.getDirectusClient();
    this.entities = {
      connectRequests: this.connectRequestEntity.connectRequests,
      contactAgents: this.contactAgentEntity.contactAgents,
      customers: this.customerEntity.customers
    };
  }

  async create(data: { message: string, customer: string, project: string }) {
    return this.client.request(
      createItem(this.contactAgentEntity.tableName, {
        [this.contactAgentEntity.message]: data?.message,
        [this.contactAgentEntity.customers]: data?.customer,
        [this.contactAgentEntity.projects]: data?.project
      })
    );
  }

  async getExistingMessage(customerId: string, projectId: string) {
    const contactAgentId = await this.db.connection.select({
      id: this.entities.contactAgents.id,
      message: this.entities.contactAgents.message
    })
      .from(this.entities.contactAgents)
      .where(and(
        eq(this.entities.contactAgents.customers, customerId),
        eq(this.entities.contactAgents.projects, projectId)
      ));
    return contactAgentId?.[0]?.id || null;
  }

  async createDeveloperRequest(data: ContactDeveloperInterface) {
    return this.client.request(
      createItem(this.contactDeveloperEntity.tableName, {
        [this.contactDeveloperEntity.message]: data?.message,
        [this.contactDeveloperEntity.customers]: data?.customer,
        [this.contactDeveloperEntity.developers]: data?.developer
      })
    );
  }

  async createSupportRequest(request: SupportRequestInterface, attachmentId: string) {
    return this.client.request(
      createItem(this.supportRequestEntity.tableName, {
        [this.supportRequestEntity.name]: request.name,
        [this.supportRequestEntity.subject]: request.subject,
        [this.supportRequestEntity.issueDescription]: request.issueDescription,
        [this.supportRequestEntity.attachment]: attachmentId
      })
    );
  }

  async getSupportRequestFolderIdFromRoot() {
    const getCustomerFolderFromRoot = await this.client.request(
      readFolders({
        filter: {
          name: { _eq: this.supportRequestEntity.tableName }
        }
      })
    );

    return getCustomerFolderFromRoot?.[0]?.id;
  }

  async uploadAttachment(form: FormData) {
    const result = await this.client.request(
      uploadFiles(form)
    );

    return result?.id;
  }

  async createInquiry(data: InquiryInterface) {
    return this.client.request(
      createItem(this.inquiryEntity.tableName, {
        [this.inquiryEntity.name]: data?.name,
        [this.inquiryEntity.email]: data?.email,
        [this.inquiryEntity.subject]: data?.subject
      })
    );
  }

  async createFeedback(request: FeedbackInterface, attachmentId: string) {
    return this.client.request(
      createItem(this.feedbackEntity.tableName, {
        [this.feedbackEntity.feedbackCategory]: request.feedbackCategory,
        [this.feedbackEntity.subject]: request.subject,
        [this.feedbackEntity.issueDescription]: request.issueDescription,
        [this.feedbackEntity.attachment]: attachmentId
      })
    );
  }

  async getFeedbackFolderIdFromRoot() {
    const getCustomerFolderFromRoot = await this.client.request(
      readFolders({
        filter: {
          name: { _eq: this.feedbackEntity.tableName }
        }
      })
    );

    return getCustomerFolderFromRoot?.[0]?.id;
  }

  private dataMapper(data: CreateConnectRequestInterface): Partial<ConnectRequestEntity> {
    const dateToSave = {};
    const { type, payload, leadId } = data;

    if (payload !== undefined) {
      dateToSave[this.connectRequestEntity.payload] = payload;
    }

    if (type !== undefined) {
      dateToSave[this.connectRequestEntity.type] = type;
    }

    if (leadId !== undefined) {
      dateToSave[this.connectRequestEntity.leads] = leadId;
    }

    return dateToSave;
  }

  async createConnectRequest(data: CreateConnectRequestInterface): Promise<ConnectRequestInterface> {
    return this.client.request(
      createItem(this.connectRequestEntity.tableName, this.dataMapper(data))
    );
  }
}
