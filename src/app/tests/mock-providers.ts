import { Db } from '../utils/db.util';
import { CustomerRepository } from '../../customer/repositories/customer.repository';
import { DeveloperRepository } from '../../developer/repository/developer.repository';
import { ProjectListingService } from '../../project/services/project-listing.service';
import { SearchProjectTransformer } from '../../project/transformers/search-project.transformer';
import { DeveloperDetailTransformer } from '../../developer/transformers/developer-detail.transformer';
import { DeveloperDetailService } from '../../developer/service/developer-detail.service';
import { ProjectStatusUpdateService } from '../../project/services/project-status-update.service';
import { ProjectListingRepository } from '../../project/repositories/project-listing.repository';

export const mockDb = {
  provide: Db,
  useValue: {
    directus: {
      items: jest.fn(),
      folders: {
        readByQuery: jest.fn()
      },
      files: {
        createOne: jest.fn()
      }
    },
    getDirectusClient: jest.fn().mockReturnValue({
      request: jest.fn()
    }),
    connection: jest.fn(),
    connectToDatabase: jest.fn(),
    onModuleInit: jest.fn()
  }
};

jest.mock('bullmq', () => ({
  Queue: jest.fn().mockImplementation(() => ({
    add: jest.fn(),
    process: jest.fn(),
    close: jest.fn()
  })),
  Worker: jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    close: jest.fn()
  }))
}));

export const mockCustomerRepository = {
  provide: CustomerRepository,
  useValue: {
    updateToken: jest.fn(),
    updateCustomer: jest.fn(),
    getByEmail: jest.fn(),
    getByPhoneNumber: jest.fn(),
    getRefreshTokenById: jest.fn(),
    getProfileDetailsById: jest.fn()
  }
};

export const mockDeveloperRepository = {
  provide: DeveloperRepository,
  useValue: {
    findDeveloperBySlug: jest.fn(),
    getDeveloperDetail: jest.fn()
  }
};

export const mockProjectListingService = {
  provide: ProjectListingService,
  useValue: {
    getProjectListing: jest.fn(),
    getProjectsFromSearchServiceByDeveloperSlug: jest.fn()
  }
};

export const mockSearchProjectTransformer = {
  provide: SearchProjectTransformer,
  useValue: {
    process: jest.fn()
  }
};

export const mockDeveloperDetailTransformer = {
  provide: DeveloperDetailTransformer,
  useValue: {
    process: jest.fn()
  }
};

export const mockDeveloperDetailService = {
  provide: DeveloperDetailService,
  useValue: {
    getDeveloperDetail: jest.fn()
  }
};

export const mockProjectStatusUpdateService = {
  provide: ProjectStatusUpdateService,
  useValue: {
    validateStatusUpdate: jest.fn()
  }
};

export const mockProjectListingRepository = {
  provide: ProjectListingRepository,
  useValue: {
    getValidationRules: jest.fn(),
    getProjectDetailsForValidation: jest.fn()
  }
};
