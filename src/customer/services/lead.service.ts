import { Injectable, Logger } from '@nestjs/common';
import { LeadRepository } from '../repositories/lead.repository';
import { UtmParams } from '../interfaces/utm-params.interface';
import { LeadEntity } from '../entities/lead.entity';
import { ConnectRequestInterface } from '../interfaces/connect-request.interface';
import { LeadPayloadInterface } from '../interfaces/lead-payload.interface';

@Injectable()
export class LeadService {
  private readonly logger = new Logger(LeadService.name);

  constructor(
    private readonly leadRepository: LeadRepository,
    private readonly leadEntity: LeadEntity
  ) {}

  async getLeadId(payload: LeadPayloadInterface): Promise<string | null> {
    const { phoneNumber, name } = payload;
    if (phoneNumber) {
      // for existing lead
      const lead = await this.leadRepository.getLeadId(phoneNumber);
      if (lead && lead.length) {
        if (!(lead?.[0]?.utmSource || lead?.[0]?.utmMedium || lead?.[0]?.utmCampaign)) {
          const result: UtmParams[] = await this.leadRepository.getUtmParams(phoneNumber);
          if (result?.[0]?.utmCampaign || result?.[0]?.utmMedium || result?.[0]?.utmSource) {
            await this.leadRepository.updateLead(lead[0]?.id, result[0]);
          } else if (
            payload?.[this.leadEntity.utmSource]
            || payload?.[this.leadEntity.utmMedium]
            || payload?.[this.leadEntity.utmCampaign]
          ) {
            await this.leadRepository.updateLead(lead[0]?.id, {
              utmSource: payload?.[this.leadEntity.utmSource],
              utmMedium: payload?.[this.leadEntity.utmMedium],
              utmCampaign: payload?.[this.leadEntity.utmCampaign]
            });
          }
        }
        return lead[0].id;
      }

      // for new lead
      let leadName: { name: any; }[];
      let leadUtmParams: UtmParams[];

      if (!name) {
        leadName = await this.leadRepository.getLeadName(phoneNumber);
        leadUtmParams = await this.leadRepository.getUtmParams(phoneNumber);
      }

      const newLead = await this.leadRepository.create({
        phone: phoneNumber,
        name: name || leadName?.[0]?.name,
        utmSource: payload?.utm_source || leadUtmParams?.[0]?.utmSource,
        utmMedium: payload?.utm_medium || leadUtmParams?.[0]?.utmMedium,
        utmCampaign: payload?.utm_campaign || leadUtmParams?.[0]?.utmCampaign
      });
      return newLead?.id;
    }
    return null;
  }

  async addLeadsToConnectRequests(): Promise<ConnectRequestInterface> {
    const uniquePhoneNumbers = await this.leadRepository.getUniquePhoneNumbersFromConnectRequests();

    if (!uniquePhoneNumbers?.length) {
      return {
        message: 'No leads found.'
      };
    }

    const promises = uniquePhoneNumbers.map(async (phone) => {
      const leadId = await this.getLeadId(phone);
      await this.leadRepository.addLeadToConnectRequest(leadId, phone.phoneNumber);
      this.logger.log(`Lead set for ${phone.phoneNumber}`);
    });

    await Promise.all(promises);

    return {
      message: 'All leads set successfully.'
    };
  }

  async updateLeads(): Promise<ConnectRequestInterface> {
    const leadPhoneNumbers = await this.leadRepository.getLeadsPhoneNumber();
    const promises = leadPhoneNumbers.map(async (phone) => {
      await this.getLeadId(phone);
      this.logger.log(`Lead updated for ${phone.phoneNumber}`);
    });

    await Promise.all(promises);

    return {
      message: 'All leads are updated'
    };
  }

  async updateUtmDetails(request: LeadPayloadInterface): Promise<{ message: string }> {
    try {
      const updatePromises = [];
      if (request[this.leadEntity.utmSource]) {
        updatePromises.push(this.updateLeadSource(request[this.leadEntity.utmSource]));
      }
      if (request[this.leadEntity.utmMedium]) {
        updatePromises.push(this.updateLeadMedium(request[this.leadEntity.utmMedium]));
      }
      if (request[this.leadEntity.utmCampaign]) {
        updatePromises.push(this.updateLeadCampaign(request[this.leadEntity.utmCampaign]));
      }

      await Promise.all(updatePromises);
    } catch (error) {
      this.logger.error(error);
      // Error is not returned to allow lead insertion to continue
      return {
        message: 'Failed to update UTM details'
      };
    }

    return {
      message: 'All UTM details updated'
    };
  }

  async updateLeadSource(source: string): Promise<void> {
    const leadSourceExists = await this.leadRepository.checkIfLeadSourceExists(source);
    if (!leadSourceExists) {
      await this.leadRepository.addLeadSource(source);
    }
  }

  async updateLeadMedium(medium: string): Promise<void> {
    const leadMediumExists = await this.leadRepository.checkIfLeadMediumExists(medium);
    if (!leadMediumExists) {
      await this.leadRepository.addLeadMedium(medium);
    }
  }

  async updateLeadCampaign(campaign: string): Promise<void> {
    const leadCampaignExists = await this.leadRepository.checkIfLeadCampaignExists(campaign);
    if (!leadCampaignExists) {
      await this.leadRepository.addLeadCampaign(campaign);
    }
  }

  async updateBulkUtmDetails(): Promise<{ message: string }> {
    try {
      const [sources, mediums, campaigns] = await Promise.all([
        this.leadRepository.getAllUniqueUtmSources(),
        this.leadRepository.getAllUniqueUtmMediums(),
        this.leadRepository.getAllUniqueUtmCampaigns()
      ]);

      const updatePromises = [];

      if (sources?.length) {
        updatePromises.push(this.leadRepository.addLeadSources(sources));
      }
      if (mediums?.length) {
        updatePromises.push(this.leadRepository.addLeadMediums(mediums));
      }
      if (campaigns?.length) {
        updatePromises.push(this.leadRepository.addLeadCampaigns(campaigns));
      }

      await Promise.all(updatePromises);
    } catch (error) {
      this.logger.error(error);
      throw new Error('Failed to update UTM details');
    }

    return {
      message: 'All UTM details updated'
    };
  }
}
