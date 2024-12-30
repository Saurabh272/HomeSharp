import { Test, TestingModule } from '@nestjs/testing';
import { ProjectStatusUpdateController } from '../controllers/project-status-update.controller';
import { ProjectStatusUpdateService } from '../services/project-status-update.service';
import { ProjectListingRepository } from '../repositories/project-listing.repository';
import { mockDb, mockProjectListingRepository, mockProjectStatusUpdateService } from '../../app/tests/mock-providers';
import { ProjectEntity } from '../entities/project.entity';
import { AppModule } from '../../app/app.module';
import { ProjectModule } from '../project.module';
import * as MockData from './project-status-update.data';

describe('Project Status Update', () => {
  let controller: ProjectStatusUpdateController;
  let service: ProjectStatusUpdateService;
  let repository: ProjectListingRepository;

  describe('Controller', () => {
    beforeEach(async () => {
      const module: TestingModule = await Test
        .createTestingModule({
          controllers: [ProjectStatusUpdateController],
          providers: [
            mockProjectStatusUpdateService,
            mockDb
          ]
        })
        .compile();

      controller = module.get<ProjectStatusUpdateController>(ProjectStatusUpdateController);
      service = module.get<ProjectStatusUpdateService>(ProjectStatusUpdateService);
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it('should get initialized', () => {
      expect(controller).toBeDefined();
    });

    it('should return success message on correct project status update', async () => {
      jest.spyOn(service, 'validateStatusUpdate').mockResolvedValue({
        status: 'success',
        message: 'Status update is valid'
      });
      const result = await controller.validateStatusUpdate({
        modifiedFields: { status: 'published' },
        collection: {
          event: 'Projects.items.update',
          keys: ['project-id'],
          collection: 'Projects'
        }
      });
      expect(result).toStrictEqual({
        status: 'success',
        message: 'Status update is valid'
      });
    });

    it('should return error message on incorrect project status update', async () => {
      jest.spyOn(service, 'validateStatusUpdate').mockResolvedValue({
        status: 'error',
        message: 'Project Test should be in Draft status to be Published.'
      });
      const result = await controller.validateStatusUpdate({
        modifiedFields: { status: 'published' },
        collection: {
          event: 'Projects.items.update',
          keys: ['project-id'],
          collection: 'Projects'
        }
      });
      expect(result).toStrictEqual({
        status: 'error',
        message: 'Project Test should be in Draft status to be Published.'
      });
    });

    it('should throw error when project status update fails', async () => {
      jest.spyOn(service, 'validateStatusUpdate').mockRejectedValue(new Error('Error'));
      await expect(controller.validateStatusUpdate({
        modifiedFields: { status: 'published' },
        collection: {
          event: 'Projects.items.update',
          keys: ['project-id'],
          collection: 'Projects'
        }
      })).rejects.toThrowError('Error');
    });
  });

  describe('Service', () => {
    beforeEach(async () => {
      const module: TestingModule = await Test
        .createTestingModule({
          controllers: [ProjectStatusUpdateController],
          providers: [
            ProjectEntity,
            ProjectStatusUpdateService,
            mockProjectListingRepository,
            mockDb
          ],
          imports: [AppModule, ProjectModule]
        })
        .compile();

      controller = module.get<ProjectStatusUpdateController>(ProjectStatusUpdateController);
      service = module.get<ProjectStatusUpdateService>(ProjectStatusUpdateService);
      repository = module.get<ProjectListingRepository>(ProjectListingRepository);
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    describe('validateStatusUpdate', () => {
      it('should return success message if modified fields does not have status property', async () => {
        service.checkIfProjectCanBePublished = jest.fn();

        const result = await service.validateStatusUpdate({}, {});

        expect(service.checkIfProjectCanBePublished).not.toHaveBeenCalled();
        expect(result).toStrictEqual({
          status: 'success',
          message: 'Status update is valid'
        });
      });

      it(
        'should return success message if modified fields has status property with value other than published',
        async () => {
          service.checkIfProjectCanBePublished = jest.fn();

          const result = await service.validateStatusUpdate({ status: 'draft' }, {});

          expect(service.checkIfProjectCanBePublished).not.toHaveBeenCalled();
          expect(result).toStrictEqual({
            status: 'success',
            message: 'Status update is valid'
          });
        }
      );

      it(
        'should return success message if modified fields has status property with value published'
        + ' and collection is not Projects',
        async () => {
          service.checkIfProjectCanBePublished = jest.fn();

          const result = await service.validateStatusUpdate(
            { status: 'published' },
            { collection: { collection: 'Wings' } }
          );

          expect(service.checkIfProjectCanBePublished).not.toHaveBeenCalled();
          expect(result).toStrictEqual({
            status: 'success',
            message: 'Status update is valid'
          });
        }
      );

      it(
        'should return success message if modified fields has status property with value published'
        + ' and collection is Projects but modified fields does not have keys property',
        async () => {
          service.checkIfProjectCanBePublished = jest.fn();

          const result = await service.validateStatusUpdate(
            { status: 'published' },
            { collection: { collection: 'Projects' } }
          );

          expect(service.checkIfProjectCanBePublished).not.toHaveBeenCalled();
          expect(result).toStrictEqual({
            status: 'success',
            message: 'Status update is valid'
          });
        }
      );

      it(
        'should return success message if modified fields has status property with value published'
        + ' and collection is Projects but modified fields keys property is not an array',
        async () => {
          service.checkIfProjectCanBePublished = jest.fn();

          const result = await service.validateStatusUpdate(
            { status: 'published' },
            { collection: { collection: 'Projects', keys: 'key' } }
          );

          expect(service.checkIfProjectCanBePublished).not.toHaveBeenCalled();
          expect(result).toStrictEqual({
            status: 'success',
            message: 'Status update is valid'
          });
        }
      );

      it(
        'should return success message if modified fields has status property with value published'
        + ' and collection is Projects but modified fields keys property is an empty array',
        async () => {
          service.checkIfProjectCanBePublished = jest.fn();

          const result = await service.validateStatusUpdate(
            { status: 'published' },
            { collection: { collection: 'Projects', keys: [] } }
          );

          expect(service.checkIfProjectCanBePublished).not.toHaveBeenCalled();
          expect(result).toStrictEqual({
            status: 'success',
            message: 'Status update is valid'
          });
        }
      );

      it(
        'should return success message if modified fields has status property with value published'
        + ' and collection is Projects but modified fields keys property is an array with empty string',
        async () => {
          service.checkIfProjectCanBePublished = jest.fn();

          const result = await service.validateStatusUpdate(
            { status: 'published' },
            { collection: { collection: 'Projects', keys: [''] } }
          );

          expect(service.checkIfProjectCanBePublished).not.toHaveBeenCalled();
          expect(result).toStrictEqual({
            status: 'success',
            message: 'Status update is valid'
          });
        }
      );

      it(
        'should return success message if modified fields has status property with value published'
        + ' and collection is Projects but modified fields keys property is an array with empty object',
        async () => {
          service.checkIfProjectCanBePublished = jest.fn();

          const result = await service.validateStatusUpdate(
            { status: 'published' },
            { collection: { collection: 'Projects', keys: [{}] } }
          );

          expect(service.checkIfProjectCanBePublished).not.toHaveBeenCalled();
          expect(result).toStrictEqual({
            status: 'success',
            message: 'Status update is valid'
          });
        }
      );

      it(
        'should return success message if modified fields has status property with value published'
        + ' and collection is Projects but modified fields keys property is an array with object with empty string',
        async () => {
          service.checkIfProjectCanBePublished = jest.fn();

          const result = await service.validateStatusUpdate(
            { status: 'published' },
            { collection: { collection: 'Projects', keys: [{}, ''] } }
          );

          expect(service.checkIfProjectCanBePublished).not.toHaveBeenCalled();
          expect(result).toStrictEqual({
            status: 'success',
            message: 'Status update is valid'
          });
        }
      );

      it(
        'should return success message if modified fields has status property with value published'
        + ' and collection is Projects but modified fields keys property is an array with object with empty object',
        async () => {
          service.checkIfProjectCanBePublished = jest.fn();

          const result = await service.validateStatusUpdate(
            { status: 'published' },
            { collection: { collection: 'Projects', keys: [{}, {}] } }
          );

          expect(service.checkIfProjectCanBePublished).not.toHaveBeenCalled();
          expect(result).toStrictEqual({
            status: 'success',
            message: 'Status update is valid'
          });
        }
      );

      it(
        'should call checkIfProjectCanBePublished if modified fields has status property with value published'
        + ' and collection is Projects and modified fields keys property is an array with project ids',
        async () => {
          service.checkIfProjectCanBePublished = jest.fn();

          await service.validateStatusUpdate(
            { status: 'published' },
            {
              event: 'Projects.items.update',
              keys: ['d61ec180-c04e-4111-9dad-535d21b1a97a'],
              collection: 'Projects'
            }
          );

          expect(service.checkIfProjectCanBePublished).toHaveBeenCalledWith(['d61ec180-c04e-4111-9dad-535d21b1a97a']);
        }
      );

      it(
        'should return success message if modified fields has status property with value published'
        + ' and collection is Projects and modified fields keys property is an array with project ids'
        + ' and checkIfProjectCanBePublished returns success',
        async () => {
          jest.spyOn(service, 'checkIfProjectCanBePublished').mockResolvedValue({
            status: 'success',
            message: 'Status update is valid'
          });

          const result = await service.validateStatusUpdate(
            { status: 'published' },
            { collection: { collection: 'Projects', keys: ['project-id'] } }
          );

          expect(result).toStrictEqual({
            status: 'success',
            message: 'Status update is valid'
          });
        }
      );

      it(
        'should return error message if modified fields has status property with value published'
        + ' and collection is Projects and modified fields keys property is an array with project ids'
        + ' and checkIfProjectCanBePublished returns error',
        async () => {
          jest.spyOn(service, 'checkIfProjectCanBePublished').mockResolvedValue({
            status: 'error',
            message: 'Error message'
          });

          const result = await service.validateStatusUpdate(
            { status: 'published' },
            {
              event: 'Projects.items.update',
              keys: ['d61ec180-c04e-4111-9dad-535d21b1a97a'],
              collection: 'Projects'
            }
          );

          expect(result).toStrictEqual({
            status: 'error',
            message: 'Error message'
          });
        }
      );
    });

    describe('getValidationRules', () => {
      it('should return validation rules', async () => {
        jest.spyOn(repository, 'getValidationRules').mockResolvedValue([
          { field: 'field', label: 'label' }
        ]);

        const result = await service.getValidationRules('collection');

        expect(result).toStrictEqual({
          fieldsToBeValidated: ['field'],
          fieldToLabelMap: new Map([['field', 'label']])
        });
      });

      it('should return empty validation rules', async () => {
        jest.spyOn(repository, 'getValidationRules').mockResolvedValue([]);

        const result = await service.getValidationRules('collection');

        expect(result).toStrictEqual({
          fieldsToBeValidated: [],
          fieldToLabelMap: new Map()
        });
      });

      it('should return empty validation rules if repository throws error', async () => {
        jest.spyOn(repository, 'getValidationRules').mockRejectedValue(new Error('Error'));

        await expect(service.getValidationRules('collection')).rejects.toThrowError('Error');
      });
    });

    describe('checkIfProjectCanBePublished', () => {
      it('should return error message if project ids is empty', async () => {
        jest.spyOn(repository, 'getProjectDetailsForValidation').mockResolvedValue([]);
        jest.spyOn(service, 'getValidationRules').mockResolvedValue(MockData.mockValidationRules);

        const result = await service.checkIfProjectCanBePublished([]);

        expect(result).toStrictEqual({
          status: 'error',
          message: 'Project with id  not found'
        });
      });

      it('should return error message if project ids is not empty but projects is empty', async () => {
        jest.spyOn(repository, 'getProjectDetailsForValidation').mockResolvedValue([]);
        jest.spyOn(service, 'getValidationRules').mockResolvedValue(MockData.mockValidationRules);

        const result = await service.checkIfProjectCanBePublished(['project-id']);

        expect(result).toStrictEqual({
          status: 'error',
          message: 'Project with id project-id not found'
        });
      });

      it(
        'should return error message if project ids and projects are not empty but project is not in draft state',
        async () => {
          jest.spyOn(repository, 'getProjectDetailsForValidation').mockResolvedValue([MockData.mockProject]);
          jest.spyOn(service, 'getValidationRules').mockResolvedValue(MockData.mockValidationRules);
          jest.spyOn(service, 'getWingsConfigurationsForProjects')
            .mockResolvedValue(MockData.mockWingsConfigurationsWithArchiveStatus);

          const result = await service.checkIfProjectCanBePublished(['project-id']);

          expect(result).toStrictEqual({
            status: 'error',
            message: 'Project project-name should be in Draft status to be Published.'
          });
        }
      );

      it('should return success message if a valid project is published', async () => {
        jest.spyOn(repository, 'getProjectDetailsForValidation').mockResolvedValue([MockData.mockProject]);
        jest.spyOn(service, 'getValidationRules').mockResolvedValue(MockData.mockValidationRules);
        jest.spyOn(service, 'getWingsConfigurationsForProjects')
          .mockResolvedValue(MockData.mockWingsConfigurationsWithDraftStatus);

        const result = await service.checkIfProjectCanBePublished(['project-id']);

        expect(result).toStrictEqual({
          status: 'success',
          message: ''
        });
      });

      it('should return error message if a valid project does not satisfy validation rule', async () => {
        jest.spyOn(repository, 'getProjectDetailsForValidation').mockResolvedValue([MockData.mockProject]);
        jest.spyOn(service, 'getValidationRules').mockResolvedValue(MockData.mockExtraValidationRule);
        jest.spyOn(service, 'getWingsConfigurationsForProjects')
          .mockResolvedValue(MockData.mockWingsConfigurationsWithDraftStatus);

        const result = await service.checkIfProjectCanBePublished(['project-id']);

        expect(result).toStrictEqual({
          status: 'error',
          message: 'Project project-name should have Test Label.'
        });
      });

      it('should return error message and list out all missing fields if a valid project does not satisfy '
        + 'multiple validation rules', async () => {
        jest.spyOn(repository, 'getProjectDetailsForValidation').mockResolvedValue([MockData.mockProject]);
        jest.spyOn(service, 'getValidationRules').mockResolvedValue(MockData.mockExtraValidationRules);
        jest.spyOn(service, 'getWingsConfigurationsForProjects')
          .mockResolvedValue(MockData.mockWingsConfigurationsWithDraftStatus);

        const result = await service.checkIfProjectCanBePublished(['project-id']);

        expect(result).toStrictEqual({
          status: 'error',
          message: 'Project project-name should have Test Label1, Test Label2, Test Label3.'
        });
      });

      it('should return error message and list out proper information if Wings Configurations details'
        + ' are missing', async () => {
        jest.spyOn(repository, 'getProjectDetailsForValidation').mockResolvedValue([MockData.mockProject]);
        jest.spyOn(service, 'getValidationRules').mockResolvedValue(MockData.mockExtraValidationRulesWithWingIds);
        jest.spyOn(service, 'getWingsConfigurationsForProjects')
          .mockResolvedValue(MockData.mockWingsConfigurationsWithoutWings);

        const result = await service.checkIfProjectCanBePublished(['project-id']);

        expect(result).toStrictEqual({
          status: 'error',
          message: 'Project project-name should have Test Label1, Test Label2, Test Label3, Wings. '
            + 'Wing and Configuration must include Test Label1, Test Label2, Test Label3, Wings.'
        });
      });
    });

    describe('getWingsConfigurationsForProjects', () => {
      it('should return wings configurations for projects', async () => {
        jest.spyOn(repository, 'getWingsConfigurationsForValidation')
          .mockResolvedValue([MockData.mockWingsConfigurationsFromDb]);

        const result = await service.getWingsConfigurationsForProjects([MockData.mockProject]);

        expect(result).toStrictEqual([{
          project: MockData.mockProject,
          wingConfigurations: [MockData.mockWingsConfigurationsFromDb]
        }]);
      });

      it('should return empty wings configurations for projects if repository throws error', async () => {
        jest.spyOn(repository, 'getWingsConfigurationsForValidation').mockRejectedValue(new Error('Error'));

        await expect(service.getWingsConfigurationsForProjects([MockData.mockProject])).rejects.toThrowError('Error');
      });
    });
  });
});
