import { Injectable, Logger } from '@nestjs/common';
import {
  and,
  eq,
  isNotNull,
  isNull,
  ne,
  notInArray,
  or,
  sql
} from 'drizzle-orm';
import {
  DirectusClient,
  RestClient,
  StaticTokenClient,
  createItem,
  updateItem,
  createItems
} from '@directus/sdk';
import { IRepository } from '../../app/interfaces/repository.interface';
import { LeadEntity } from '../entities/lead.entity';
import { Db } from '../../app/utils/db.util';
import { LeadIdInterface } from '../interfaces/lead-id.interface';
import { ConnectRequestConfig } from '../config/connect-request.config';
import { ConnectRequestEntity } from '../entities/connect-request.entity';
import { UtmParams } from '../interfaces/utm-params.interface';
import { LeadCampaignEntity } from '../entities/lead-campaign.entity';
import { LeadMediumEntity } from '../entities/lead-medium.entity';
import { LeadSourceEntity } from '../entities/lead-source.entity';

@Injectable()
export class LeadRepository implements IRepository {
  private readonly logger = new Logger(LeadRepository.name);

  private client: DirectusClient<any> & StaticTokenClient<any> & RestClient<any>;

  public readonly entities: {
    connectRequests: any;
    leads: any;
    leadCampaigns: any;
    leadMediums: any;
    leadSources: any;
  };

  constructor(
    private readonly db: Db,
    private readonly connectRequestEntity: ConnectRequestEntity,
    private readonly leadEntity: LeadEntity,
    private readonly leadCampaignEntity: LeadCampaignEntity,
    private readonly leadMediumEntity: LeadMediumEntity,
    private readonly leadSourceEntity: LeadSourceEntity
  ) {
    this.client = db.getDirectusClient();
    this.entities = {
      connectRequests: this.connectRequestEntity.connectRequests,
      leads: this.leadEntity.leads,
      leadCampaigns: this.leadCampaignEntity.leadCampaigns,
      leadMediums: this.leadMediumEntity.leadMediums,
      leadSources: this.leadSourceEntity.leadSources
    };
  }

  async getLeadId(phone: string): Promise<LeadIdInterface[]> {
    return this.db.connection.select({
      id: this.entities.leads.id,
      utmSource: this.entities.leads.utmSource,
      utmMedium: this.entities.leads.utmMedium,
      utmCampaign: this.entities.leads.utmCampaign
    })
      .from(this.entities.leads)
      .where(eq(this.entities.leads.phoneNumber, phone));
  }

  private dataMapper(data: {
    phone?: string,
    name?: string,
    utmSource?: string,
    utmMedium?: string,
    utmCampaign?: string
  }): Partial<LeadEntity> {
    const dataToSave = {};

    if (data?.phone) {
      dataToSave[this.leadEntity.phoneNumber] = data.phone;
    }

    if (data?.name) {
      dataToSave[this.leadEntity.name] = data.name;
    }

    if (data?.utmSource) {
      dataToSave[this.leadEntity.utmSource] = data?.utmSource;
    }

    if (data?.utmMedium) {
      dataToSave[this.leadEntity.utmMedium] = data?.utmMedium;
    }

    if (data?.utmCampaign) {
      dataToSave[this.leadEntity.utmCampaign] = data?.utmCampaign;
    }

    return dataToSave;
  }

  async create(data: {
    phone: string,
    name: string,
    utmSource: string,
    utmMedium: string,
    utmCampaign: string,

  }): Promise<{ id?: string }> {
    return this.client.request(
      createItem(this.leadEntity.tableName, this.dataMapper(data))
    );
  }

  async getUniquePhoneNumbersFromConnectRequests(): Promise<{ phoneNumber: string }[]> {
    return this.db.connection.select({
      phoneNumber: sql<string>`DISTINCT (${this.entities.connectRequests.payload}->>'phoneNumber')`
    })
      .from(this.entities.connectRequests)
      .where(and(
        isNull(this.entities.connectRequests.leads),
        eq(this.entities.connectRequests.type, ConnectRequestConfig.discussRequirementRequestV2)
      ));
  }

  async getLeadName(phone: string): Promise<{ name: string }[]> {
    return this.db.connection.select({
      name: sql<string>`${this.entities.connectRequests.payload}->>'name'`
    })
      .from(this.entities.connectRequests)
      .where(and(
        eq(sql`${this.entities.connectRequests.payload}->>'phoneNumber'`, phone),
        isNotNull(sql`${this.entities.connectRequests.payload}->>'name'`),
        ne(sql`${this.entities.connectRequests.payload}->>'name'`, '')
      ))
      .orderBy(this.entities.connectRequests.dateCreated)
      .limit(1);
  }

  async addLeadToConnectRequest(leadId: string, phoneNumber: string) {
    return this.db.connection.update(this.entities.connectRequests)
      .set({
        leads: leadId
      })
      .where(eq(sql`${this.entities.connectRequests.payload}->>'phoneNumber'`, phoneNumber));
  }

  async getUtmParams(phone: string): Promise<UtmParams[]> {
    return this.db.connection.select({
      utmSource: sql<string>`${this.entities.connectRequests.payload}->>'utm_source'`,
      utmMedium: sql<string>`${this.entities.connectRequests.payload}->>'utm_medium'`,
      utmCampaign: sql<string>`${this.entities.connectRequests.payload}->>'utm_campaign'`
    })
      .from(this.entities.connectRequests)
      .where(and(
        eq(sql`${this.entities.connectRequests.payload}->>'phoneNumber'`, phone),
        or(
          and(
            isNotNull(sql`${this.entities.connectRequests.payload}->>'utm_source'`),
            ne(sql`${this.entities.connectRequests.payload}->>'utm_source'`, '')
          ),
          and(
            isNotNull(sql`${this.entities.connectRequests.payload}->>'utm_medium'`),
            ne(sql`${this.entities.connectRequests.payload}->>'utm_medium'`, '')
          ),
          and(
            isNotNull(sql`${this.entities.connectRequests.payload}->>'utm_campaign'`),
            ne(sql`${this.entities.connectRequests.payload}->>'utm_campaign'`, '')
          )
        )
      ))
      .orderBy(this.entities.connectRequests.dateCreated)
      .limit(1);
  }

  async updateLead(id: string, data:{
    utmSource: string,
    utmMedium: string,
    utmCampaign: string,
  }) {
    return this.client.request(
      updateItem(this.leadEntity.tableName, id, this.dataMapper(data))
    );
  }

  async getLeadsPhoneNumber(): Promise<{ phoneNumber: string }[]> {
    return this.db.connection
      .select({
        phoneNumber: this.entities.leads.phoneNumber
      })
      .from(this.entities.leads);
  }

  async checkIfLeadSourceExists(source: string): Promise<boolean> {
    const result = await this.db.connection
      .select({
        source: this.entities.leadSources.id
      })
      .from(this.entities.leadSources)
      .where(eq(this.entities.leadSources.id, source));

    return !!result.length;
  }

  async checkIfLeadMediumExists(medium: string): Promise<boolean> {
    const result = await this.db.connection
      .select({
        medium: this.entities.leadMediums.id
      })
      .from(this.entities.leadMediums)
      .where(eq(this.entities.leadMediums.id, medium));

    return !!result.length;
  }

  async checkIfLeadCampaignExists(campaign: string): Promise<boolean> {
    const result = await this.db.connection
      .select({
        campaign: this.entities.leadCampaigns.id
      })
      .from(this.entities.leadCampaigns)
      .where(eq(this.entities.leadCampaigns.id, campaign));

    return !!result.length;
  }

  async addLeadSource(source: string): Promise<Partial<LeadSourceEntity>> {
    return this.client.request(createItem(
      this.leadSourceEntity.tableName,
      {
        [this.leadSourceEntity.id]: source
      }
    ));
  }

  async addLeadMedium(medium: string): Promise<Partial<LeadMediumEntity>> {
    return this.client.request(createItem(
      this.leadMediumEntity.tableName,
      {
        [this.leadMediumEntity.id]: medium
      }
    ));
  }

  async addLeadCampaign(campaign: string): Promise<Partial<LeadCampaignEntity>> {
    return this.client.request(createItem(
      this.leadCampaignEntity.tableName,
      {
        [this.leadCampaignEntity.id]: campaign
      }
    ));
  }

  async addLeadSources(sources: { source: string }[]): Promise<any> {
    return this.client.request(
      createItems(
        this.leadSourceEntity.tableName,
        sources.map(({ source }) => ({ [this.leadSourceEntity.id]: source }))
      )
    );
  }

  async addLeadMediums(mediums: { medium: string }[]): Promise<any> {
    return this.client.request(
      createItems(
        this.leadMediumEntity.tableName,
        mediums.map(({ medium }) => ({ [this.leadSourceEntity.id]: medium }))
      )
    );
  }

  async addLeadCampaigns(campaigns: { campaign: string }[]): Promise<any> {
    return this.client.request(
      createItems(
        this.leadCampaignEntity.tableName,
        campaigns.map(({ campaign }) => ({ [this.leadSourceEntity.id]: campaign }))
      )
    );
  }

  async getAllUniqueUtmSources(): Promise<{ source: string }[]> {
    const sources = this.db.connection
      .select({
        source: this.entities.leadSources.id
      })
      .from(this.entities.leadSources);

    return this.db.connection
      .selectDistinctOn([this.entities.leads.utmSource], {
        source: this.entities.leads.utmSource
      })
      .from(this.entities.leads)
      .where(
        and(
          isNotNull(this.entities.leads.utmSource),
          notInArray(this.entities.leads.utmSource, sources)
        )
      );
  }

  async getAllUniqueUtmMediums(): Promise<{ medium: string }[]> {
    const mediums = this.db.connection
      .select({
        medium: this.entities.leadMediums.id
      })
      .from(this.entities.leadMediums);

    return this.db.connection
      .selectDistinctOn([this.entities.leads.utmMedium], {
        medium: this.entities.leads.utmMedium
      })
      .from(this.entities.leads)
      .where(
        and(
          isNotNull(this.entities.leads.utmMedium),
          notInArray(this.entities.leads.utmMedium, mediums)
        )
      );
  }

  async getAllUniqueUtmCampaigns(): Promise<{ campaign: string }[]> {
    const campaigns = this.db.connection
      .select({
        campaign: this.entities.leadCampaigns.id
      })
      .from(this.entities.leadCampaigns);

    return this.db.connection
      .selectDistinctOn([this.entities.leads.utmCampaign], {
        campaign: this.entities.leads.utmCampaign
      })
      .from(this.entities.leads)
      .where(
        and(
          isNotNull(this.entities.leads.utmCampaign),
          notInArray(this.entities.leads.utmCampaign, campaigns)
        )
      );
  }
}
