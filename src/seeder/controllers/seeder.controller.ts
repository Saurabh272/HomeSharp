import {
  Body,
  Controller, Post, Headers
} from '@nestjs/common';
import { SeederService } from '../services/seeder.service';
import { SeederEntity } from '../entities/seeder.entities';
import { ProjectImporterService } from '../../data-importer/services/project-importer.service';
import { Project } from '../../data-importer/interfaces/project.interface';
import { SeederDto } from '../dto/seeder.dto';
import { DirectusAuth } from '../../app/utils/directus.util';

@Controller('seeder')
export class SeederController {
  constructor(
    private readonly seederService: SeederService,
    private readonly seederEntity: SeederEntity,
    private readonly projectImporterService: ProjectImporterService,
    private readonly directusAuth: DirectusAuth
  ) {}

  @Post()
  async seedData(@Body() request: SeederDto, @Headers('authorization') authHeader: string) {
    await this.directusAuth.checkAdminFunctionsPermission(authHeader);

    let response: any;
    switch (request?.collection) {
      case this.seederEntity.developers: {
        response = await this.seederService.seedDevelopers(request);
        break;
      }
      case this.seederEntity.relationshipManagers: {
        response = await this.seederService.seedRelationManagers(request);
        break;
      }
      case this.seederEntity.customers: {
        response = await this.seederService.seedCustomers(request);
        break;
      }
      case this.seederEntity.feedback: {
        response = await this.seederService.seedFeedback(request);
        break;
      }
      case this.seederEntity.supportRequest: {
        response = await this.seederService.seedSupportRequest(request);
        break;
      }
      case this.seederEntity.customerAttempts: {
        response = await this.seederService.seedCustomerAttempts(request);
        break;
      }
      case this.seederEntity.inquiries: {
        response = await this.seederService.seedInquiries(request);
        break;
      }
      case this.seederEntity.seoProperties: {
        response = await this.seederService.seedSeoProperties(request);
        break;
      }
      case this.seederEntity.addresses: {
        response = await this.seederService.seedAddresses(request);
        break;
      }
      case this.seederEntity.contactDetails: {
        response = await this.seederService.seedContactDetails(request);
        break;
      }

      case this.seederEntity.featuresCategories: {
        response = await this.seederService.seedFeaturesCategory(request);
        break;
      }
      case this.seederEntity.features: {
        response = await this.seederService.seedFeatures(request);
        break;
      }
      case this.seederEntity.reraStage: {
        response = await this.seederService.seedReraStage();
        break;
      }
      case this.seederEntity.categories: {
        response = await this.seederService.seedCategories(request);
        break;
      }
      case this.seederEntity.wishlist: {
        response = await this.seederService.seedWishlists(request);
        break;
      }
      case this.seederEntity.wishlistProjects: {
        response = await this.seederService.seedWishlistProjects(request);
        break;
      }
      case 'all': {
        response = await this.seederService.seedAllCollections(request);
        break;
      }
      default: {
        const project: Project[] = await this.seederService.createProject(request);
        response = await this.projectImporterService.import(project);
      }
    }
    if (!response || response.projectIds.length !== 0) {
      response = {
        message: 'data created successfully'
      };
    }
    return response;
  }
}
