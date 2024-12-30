import * as dayjs from 'dayjs';
import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import * as RedisMock from 'ioredis-mock';
import { PassportModule } from '@nestjs/passport';
import { validate } from 'class-validator';
import { JwtModule } from '@nestjs/jwt';
import { BullModule } from '@nestjs/bullmq';
import config from '../../app/config';
import { TourController } from '../controllers/tour.controller';
import { TourService } from '../services/tour.service';
import { CreateTourDto } from '../dto/create-tour.dto';
import * as TourContract from '../types/tour-detail.type';
import { TourUtil } from '../utils/tour.util';
import { GetTourDto } from '../dto/get-tour.dto';
import { CreateTourTransformer } from '../transformers/create-tour.transformer';
import { RequestTourTransformer } from '../transformers/request-tour.transformer';
import { TourDetailTransformer } from '../transformers/tour-detail.transformer';
import { AllToursDetailTransformer } from '../transformers/all-tours-detail.transformer';
import { InitialTour } from '../types/initial-tour.type';
import { TourRepository } from '../repositories/tour.repository';
import { Db } from '../../app/utils/db.util';
import { CancelTourInterface } from '../interfaces/cancel-tour.interface';
import { CreateTour } from '../interfaces/create-tour.interface';
import { UserInterface } from '../../auth/interfaces/user.interface';
import { AppModule } from '../../app/app.module';
import { FieldChoiceInterface } from '../interfaces/field-choice.interface';
import { mockDb } from '../../app/tests/mock-providers';
import { ProjectModule } from '../project.module';
import { GetTourDetailInterface } from '../interfaces/get-tour-detail.interface';

describe('Tour Module', () => {
  let controller: TourController;
  let service: TourService;
  let tourRepository: TourRepository;
  let createTourTransformer: CreateTourTransformer;
  let tourDetailTransformer: TourDetailTransformer;
  let allToursDetailTransformer : AllToursDetailTransformer;
  let getDayTimeSlot : TourUtil;

  beforeEach(async () => {
    const module: TestingModule = await Test
      .createTestingModule({
        imports: [
          AppModule,
          ProjectModule,
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
        controllers: [TourController],
        providers: [mockDb]
      })
      .overrideProvider(Db)
      .useValue(mockDb.useValue)
      .compile();

    controller = module.get<TourController>(TourController);
    service = module.get<TourService>(TourService);
    tourRepository = module.get<TourRepository>(TourRepository);
    createTourTransformer = module.get<CreateTourTransformer>(CreateTourTransformer);
    tourDetailTransformer = module.get<TourDetailTransformer>(TourDetailTransformer);
    allToursDetailTransformer = module.get<AllToursDetailTransformer>(AllToursDetailTransformer);
    getDayTimeSlot = module.get<TourUtil>(TourUtil);
  });

  const mockUser: UserInterface = { id: 'user123', refreshToken: 'someToken' };
  const req = { user: mockUser };

  describe('Controller', () => {
    it('should call service.requestTour with correct arguments', async () => {
      const project = { slug: 'project-slug' };

      const requestTourSpy = jest.spyOn(service, 'requestTour').mockResolvedValue({
        days: [
          {
            day: 'Wed',
            date: 12,
            month: 'July',
            year: 2023
          }
        ],
        timeSlots: [
          '09:00',
          '09:30'
        ],
        visitTypes: [
          {
            text: 'IN PERSON',
            value: 'IN_PERSON'
          },
          {
            text: 'VIDEO CALL',
            value: 'VIDEO_CALL'
          }
        ]
      });
      await controller.requestTour(project);
      expect(requestTourSpy).toHaveBeenCalledWith(project);
    });

    it('should return the transformed tour', async () => {
      const project = { slug: 'project-slug' };
      const transformedTour = {
        days: [
          {
            day: 'Wed',
            date: 12,
            month: 'July',
            year: 2023
          }
        ],
        timeSlots: [
          '09:00',
          '09:30'
        ],
        visitTypes: [
          {
            label: 'IN PERSON',
            value: 'IN_PERSON'
          },
          {
            label: 'VIDEO CALL',
            value: 'VIDEO_CALL'
          }
        ]

      };

      jest.spyOn(service, 'requestTour').mockResolvedValue({
        days: [
          {
            day: 'Wed',
            date: 12,
            month: 'July',
            year: 2023
          }
        ],
        timeSlots: [
          '09:00',
          '09:30'
        ],
        visitTypes: [
          {
            text: 'IN PERSON',
            value: 'IN_PERSON'
          },
          {
            text: 'VIDEO CALL',
            value: 'VIDEO_CALL'
          }
        ]
      });
      jest.spyOn(controller.requestTourTransformer, 'process').mockReturnValue(transformedTour);

      const result = await controller.requestTour(project);

      expect(result).toEqual(transformedTour);
    });

    it('should call requestTourTransformer.process with correct argument', async () => {
      const project = { slug: 'project-slug' };
      const requestTourResult = {
        days: [
          {
            day: 'Wed',
            date: 12,
            month: 'July',
            year: 2023
          }
        ],
        timeSlots: [
          '09:00',
          '09:30'
        ],
        visitTypes: [
          {
            text: 'IN PERSON',
            value: 'IN_PERSON'
          },
          {
            text: 'VIDEO CALL',
            value: 'VIDEO_CALL'
          }
        ]
      };

      jest.spyOn(service, 'requestTour').mockResolvedValue(requestTourResult);

      const processSpy = jest.spyOn(controller.requestTourTransformer, 'process');

      await controller.requestTour(project);

      expect(processSpy).toHaveBeenCalledWith(requestTourResult);
    });

    it('should throw BadRequestException if tour is already scheduled', async () => {
      const project = { slug: 'project-slug' };

      jest.spyOn(service, 'requestTour').mockRejectedValue(
        new BadRequestException('You have already requested a tour for this project')
      );

      await expect(controller.requestTour(project))
        .rejects.toThrowError('You have already requested a tour for this project');
    });

    it('should create a new tour and return the transformed tour details', async () => {
      const createTourDto = {
        slug: 'project-slug',
        visitType: { value: 'visit-type-value' },
        day: {
          date: 1,
          month: 'January',
          year: 2023
        },
        timeSlot: '10:00'
      };

      const Project = {
        name: 'project-name',
        geoLocation: {
          lat: '2237',
          lng: '246'
        },
        locality: {
          name: 'locality'
        }
      };

      const RmDetails = {
        name: 'rm-name'
      };

      const Day = {
        day: 'Monday',
        date: 4,
        month: 'October',
        year: 2023
      };

      const SiteVisitStatus = {
        label: 'label',
        value: 'value'
      };

      const VisitType = {
        label: 'visit-type-label',
        value: 'visit-type-value'
      };

      const transformedTour = {
        id: 'tour-id',
        project: Project,
        rmDetails: RmDetails,
        day: Day,
        timeSlot: '10:00',
        siteVisitStatus: SiteVisitStatus,
        visitType: VisitType
      };

      const tourDetails: GetTourDetailInterface[] = [
        {
          siteVisit: {
            id: 'tour-id',
            visitId: 102,
            visitType: 'IN_PERSON',
            visitTime: '2023-07-24 10:00:00',
            cancellationReason: null,
            cancellationReasonDetails: null,
            siteVisitStatus: {
              id: 1,
              label: 'Scheduled',
              value: 'Scheduled',
              allowUpdate: true,
              showToCustomer: true
            },
            dateCreated: '2023-07-24 10:00:00'
          },
          rm: null,
          project: {
            name: 'project-name',
            slug: 'test-slug',
            description: '3 Bhk flats',
            propertyPicture: 'b39907582f33.jpg',
            locality: 'test-locality',
            lat: 70,
            lng: 70,
            images: '10ae00848d1a.png'
          }
        }
      ];
      const siteVisitStatus = [
        { text: 'IN PERSON', value: 'IN_PERSON' }
      ];

      jest.spyOn(service, 'createTour').mockResolvedValue([tourDetails, siteVisitStatus]);
      jest.spyOn(createTourTransformer, 'process').mockReturnValue(transformedTour);

      const result = await controller.createTour(req, createTourDto);
      expect(result).toEqual(transformedTour);
      expect(service.createTour).toHaveBeenCalledWith(req.user.id, createTourDto);
    });

    it('should pass the get tours and transformed', async () => {
      const allToursDetails = {
        id: 'user-id',
        tourDetails: [
          {
            siteVisit: {
              id: 'tour-id',
              visitId: 10000002,
              visitType: 'IN_PERSON',
              visitTime: '2023-07-24 10:00:00',
              cancellationReason: null,
              cancellationReasonDetails: null,
              siteVisitStatus: {
                id: 1,
                label: 'Pending',
                value: 'PENDING',
                allowUpdate: true,
                showToCustomer: false
              },
              dateCreated: '2023-07-24 10:00:00'
            },
            rm: null,
            project: {
              name: 'project-name',
              slug: 'project-slug',
              description: 'project description',
              propertyPicture: 'b39907582f33.jpg',
              locality: 'test-locality',
              lat: 'test-lat',
              lng: 'test-lng',
              images: '7912cf0479a2.png'
            }
          }
        ],
        visitTypes: [
          { text: 'IN PERSON', value: 'IN_PERSON' },
          { text: 'VIDEO CALL', value: 'VIDEO_CALL' }
        ],
        visitStatuses: [
          {
            id: 3,
            label: 'Reschedule Requested',
            value: 'RESCHEDULE_REQUESTED',
            allowUpdate: true,
            showToCustomer: true
          },
          {
            id: 5,
            label: 'Cancelled By Customer',
            value: 'CUSTOMER_CANCELLED',
            allowUpdate: false,
            showToCustomer: true
          }
        ],
        cancellationReasons: [
          { text: 'RM was unreachable', value: 'RM_UNREACHABLE' },
          { text: 'Could not find Location', value: 'LOCATION_NOT_FOUND' },
          { text: 'Out of budget', value: 'EXPENSIVE' },
          { text: 'Changed my mind', value: 'CHANGED_MIND' },
          { text: 'Did not like', value: 'DISLIKED' },
          { text: 'Other', value: 'OTHER' }
        ],
        tourCount: { siteVisitCount: 3 }
      };
      const pageDetails = {
        page: 1,
        limit: 1
      };
      const transformedTourExpected = {
        tours: [
          {
            id: 'tour-id',
            project: {
              name: 'project-name',
              images: [
                {
                  url: '03be4fd6c4b5.jpeg',
                  alt: 'project-name'
                },
                {
                  url: '191b9ca76d48.jpeg',
                  alt: 'project-name'
                },
                {
                  url: '169e5021418b.jpeg',
                  alt: 'project-name'
                },
                {
                  url: 'c57334a08336.jpeg',
                  alt: 'project-name'
                },
                {
                  url: '857298946849.jpeg',
                  alt: 'project-name'
                }
              ]
            },
            siteVisitStatus: {
              label: 'Pending',
              value: 'PENDING'
            },
            allowUpdate: true,
            day: {
              day: 'Friday',
              date: 3,
              month: 'November',
              year: 2023
            },
            timeSlot: '10:00',
            visitType: {
              value: 'IN_PERSON',
              label: 'IN PERSON'
            }
          }],
        cancellationReasons: [
          {
            label: 'RM was unreachable',
            value: 'RM_UNREACHABLE'
          },
          {
            label: 'Could not find Location',
            value: 'LOCATION_NOT_FOUND'
          },
          {
            label: 'Out of budget',
            value: 'EXPENSIVE'
          },
          {
            label: 'Changed my mind',
            value: 'CHANGED_MIND'
          },
          {
            label: 'Did not like',
            value: 'DISLIKED'
          },
          {
            label: 'Other',
            value: 'OTHER'
          }
        ],
        metadata: {
          page: 1,
          totalPages: 3,
          totalCount: 21
        }
      };
      jest.spyOn(allToursDetailTransformer, 'process').mockReturnValue(transformedTourExpected);
      const transformedTours = allToursDetailTransformer.process({ allToursDetails, pageDetails });
      expect(transformedTours).toEqual(transformedTourExpected);
    });

    it('should get all tours of user and return the transformed tours', async () => {
      const tourDetails: GetTourDetailInterface[] = [
        {
          siteVisit: {
            id: 'tour-id',
            visitId: 10000002,
            visitType: 'IN_PERSON',
            visitTime: '2023-07-24 10:00:00',
            cancellationReason: null,
            cancellationReasonDetails: null,
            siteVisitStatus: {
              id: 1,
              label: 'Pending',
              value: 'PENDING',
              allowUpdate: true,
              showToCustomer: false
            },
            dateCreated: '2023-07-24 10:00:00'
          },
          rm: null,
          project: {
            name: 'project-name',
            slug: 'project-slug',
            description: 'project description',
            propertyPicture: 'b39907582f33.jpg',
            locality: 'test-locality',
            lat: 70,
            lng: 70,
            images: '7912cf0479a2.png'
          }
        }
      ];
      const completeTourDetails = {
        id: 'user-id',
        tourDetails,
        visitTypes: [
          { text: 'IN PERSON', value: 'IN_PERSON' },
          { text: 'VIDEO CALL', value: 'VIDEO_CALL' }
        ],
        visitStatuses: [
          {
            id: 3,
            label: 'Reschedule Requested',
            value: 'RESCHEDULE_REQUESTED',
            allowUpdate: true,
            showToCustomer: true
          },
          {
            id: 5,
            label: 'Cancelled By Customer',
            value: 'CUSTOMER_CANCELLED',
            allowUpdate: false,
            showToCustomer: true
          }
        ],
        cancellationReasons: [
          { text: 'RM was unreachable', value: 'RM_UNREACHABLE' },
          { text: 'Could not find Location', value: 'LOCATION_NOT_FOUND' },
          { text: 'Out of budget', value: 'EXPENSIVE' },
          { text: 'Changed my mind', value: 'CHANGED_MIND' },
          { text: 'Did not like', value: 'DISLIKED' },
          { text: 'Other', value: 'OTHER' }
        ],
        tourCount: { siteVisitCount: 3 }
      };

      const transformedTour = {
        tours: [
          {
            id: 'tour-id',
            project: {
              name: 'project-name',
              images: [
                {
                  url: '03be4fd6c4b5.jpeg',
                  alt: 'project-name'
                },
                {
                  url: '191b9ca76d48.jpeg',
                  alt: 'project-name'
                },
                {
                  url: '169e5021418b.jpeg',
                  alt: 'project-name'
                },
                {
                  url: 'c57334a08336.jpeg',
                  alt: 'project-name'
                },
                {
                  url: '857298946849.jpeg',
                  alt: 'project-name'
                }
              ]
            },
            siteVisitStatus: {
              label: 'Pending',
              value: 'PENDING'
            },
            allowUpdate: true,
            day: {
              day: 'Friday',
              date: 3,
              month: 'November',
              year: 2023
            },
            timeSlot: '10:00',
            visitType: {
              value: 'IN_PERSON',
              label: 'IN PERSON'
            }
          }],
        cancellationReasons: [
          {
            label: 'RM was unreachable',
            value: 'RM_UNREACHABLE'
          },
          {
            label: 'Could not find Location',
            value: 'LOCATION_NOT_FOUND'
          },
          {
            label: 'Out of budget',
            value: 'EXPENSIVE'
          },
          {
            label: 'Changed my mind',
            value: 'CHANGED_MIND'
          },
          {
            label: 'Did not like',
            value: 'DISLIKED'
          },
          {
            label: 'Other',
            value: 'OTHER'
          }
        ],
        metadata: {
          page: 1,
          totalPages: 3,
          totalCount: 21
        }
      };
      const getTourDto = {
        page: 1,
        limit: 1
      };
      jest.spyOn(service, 'getTour').mockResolvedValue(completeTourDetails);
      jest.spyOn(allToursDetailTransformer, 'process').mockReturnValue(transformedTour);

      const response = await controller.getTours(req, getTourDto);

      expect(response).toEqual(transformedTour);
      expect(service.getTour).toHaveBeenCalledWith(req.user.id, getTourDto);
    });

    it('should called reschedule service and return a message', async () => {
      const rescheduleTourMessage = {
        message: 'Request successfully sent to agent'
      };
      const rescheduleTourReq = {
        id: 'tour-id',
        slug: 'project-slug',
        visitType: { value: 'visit-type-value' },
        day: {
          date: 1,
          month: 'January',
          year: 2023
        },
        timeSlot: '10:00'
      };
      jest.spyOn(service, 'isUpdateAllowed').mockResolvedValue();
      jest.spyOn(service, 'validateVisitType').mockResolvedValue();
      jest.spyOn(service, 'validateVisitTime');
      jest.spyOn(service, 'getSiteVisitStatusId').mockResolvedValue('status-id');
      jest.spyOn(tourRepository, 'updateTour').mockResolvedValue();
      jest.spyOn(service, 'rescheduleTour').mockResolvedValue(rescheduleTourMessage);

      const response = await service.rescheduleTour(req.user.id, rescheduleTourReq);
      expect(response).toEqual(rescheduleTourMessage);
    });

    it('should reschedule a tour and return a message ', async () => {
      const rescheduleTourMessage = {
        message: 'Request successfully sent to agent'
      };
      const rescheduleTourDto = {
        id: 'tour-id',
        slug: 'project-slug',
        visitType: { value: 'visit-type-value' },
        day: {
          date: 1,
          month: 'January',
          year: 2023
        },
        timeSlot: '10:00'
      };
      jest.spyOn(service, 'rescheduleTour').mockResolvedValue(rescheduleTourMessage);

      const response = await controller.rescheduleTour(req, rescheduleTourDto);
      expect(response).toEqual(rescheduleTourMessage);
      expect(service.rescheduleTour).toHaveBeenCalledWith(req.user.id, rescheduleTourDto);
    });
  });

  describe('Transformer', () => {
    it('should transform the request tour data correctly', () => {
      const transformer = new RequestTourTransformer();

      const response = {
        days: [
          {
            day: 'Fri', date: 14, month: 'July', year: 2023
          },
          {
            day: 'Sat', date: 15, month: 'July', year: 2023
          }
        ],
        timeSlots: [
          '09:00', '09:30', '10:00'
        ],
        visitTypes: [
          { text: 'IN PERSON', value: 'IN_PERSON' },
          { text: 'VIDEO CALL', value: 'VIDEO_CALL' }
        ]
      };

      const expected: InitialTour = {
        days: [
          {
            day: 'Fri', date: 14, month: 'July', year: 2023
          },
          {
            day: 'Sat', date: 15, month: 'July', year: 2023
          }
        ],
        timeSlots: [
          '09:00', '09:30', '10:00'
        ],
        visitTypes: [
          { label: 'IN PERSON', value: 'IN_PERSON' },
          { label: 'VIDEO CALL', value: 'VIDEO_CALL' }
        ]
      };

      const transformedTour: InitialTour = transformer.process(response);

      expect(transformedTour).toEqual(expected);
    });

    it('should transform the data to CreateTour type', () => {
      const tourData = {
        tourDetails: [
          {
            siteVisit: {
              id: 'tour-id',
              visitId: 1002,
              visitType: 'IN_PERSON',
              visitTime: '2023-07-24 10:00:00',
              cancellationReason: null,
              cancellationReasonDetails: null,
              siteVisitStatus: {
                id: '1',
                label: 'Status1',
                value: 'STATUS_1',
                allowUpdate: true,
                showToCustomer: true
              },
              dateCreated: '2023-07-24 10:00:00'
            },
            rm: null,
            project: {
              name: 'project-name',
              slug: 'seasons',
              description: 'description test',
              propertyPicture: 'b39907582f33.jpg',
              locality: 'test-locality',
              lat: 70,
              lng: 70,
              images: '10ae00848d1a.png'
            }
          }
        ],
        visitTypes: [
          { text: 'IN PERSON', value: 'IN_PERSON' }
        ]
      };

      const transformedTourData = {
        id: 'tour-id',
        project: {
          name: 'project-name',
          geoLocation: { lat: 70, lng: 70 },
          locality: { name: 'test-locality' }
        },
        rmDetails: null,
        day: {
          day: 'Mon', date: 24, month: 'July', year: 2023
        },
        timeSlot: '10:00',
        siteVisitStatus: { label: 'Status1', value: 'STATUS_1' },
        visitType: { label: 'IN PERSON', value: 'IN_PERSON' }
      };

      const result = createTourTransformer.process(tourData);
      expect(result).toBeDefined();
      expect(result).toEqual(transformedTourData);
    });

    it('should transform tour details data correctly', () => {
      const data = {
        tourDetails: [
          {
            siteVisit: {
              id: 'd3e1d847-ac31-48ac-a75a-ab17db558ab0',
              visitId: 10000002,
              visitType: 'IN_PERSON',
              visitTime: '2023-07-24 10:00:00',
              cancellationReason: null,
              cancellationReasonDetails: null,
              siteVisitStatus: {
                id: '1',
                label: 'Status1',
                value: 'STATUS_1',
                allowUpdate: true,
                showToCustomer: true
              }
            },
            rm: {
              name: 'John Doe',
              email: 'john.doe@example.com',
              phoneNumber: '1234567890'
            },
            project: {
              name: 'Seasons',
              slug: 'seasons',
              description: '<p>Project Description</p>',
              propertyPicture: 'property.jpg',
              locality: 'test-locality',
              lat: 'test-lat',
              lng: 'test-lng',
              images: 'image1.jpg,image2.jpg'
            }
          }
        ],
        visitTypes: [
          { text: 'IN PERSON', value: 'IN_PERSON' },
          { text: 'VIDEO CALL', value: 'VIDEO_CALL' }
        ],
        visitStatuses: [
          {
            id: '1',
            label: 'Status1',
            value: 'STATUS_1',
            allowUpdate: true,
            showToCustomer: true
          },
          {
            id: '2',
            label: 'Status2',
            value: 'STATUS_2',
            allowUpdate: false,
            showToCustomer: true
          }
        ],
        cancellationReasons: [
          { text: 'Reason1', value: 'REASON_1' },
          { text: 'Reason2', value: 'REASON_2' }
        ]
      };

      const result = tourDetailTransformer.process(data) as { tour?: TourContract.Tour };
      const tour = result?.tour;

      expect(result).toBeDefined();

      expect(tour).toHaveProperty('siteVisitId', 10000002);
      expect(tour).toHaveProperty('project');
      expect(tour).toHaveProperty('visitType');
      expect(tour).toHaveProperty('dateCreated');
      expect(tour).toHaveProperty('siteVisitStatus');
      expect(tour).toHaveProperty('cancellationReason', null);
      expect(tour).toHaveProperty('cancellationReasonDetails', null);

      expect(tour.project).toHaveProperty('name', 'Seasons');
      expect(tour.project).toHaveProperty('slug', 'seasons');
      expect(tour.project).toHaveProperty('locality.name', 'test-locality');
      expect(tour.project).toHaveProperty('images');
      expect(tour.project.images).toHaveLength(3);

      expect(tour.visitType).toEqual({ label: 'IN PERSON', value: 'IN_PERSON' });

      expect(tour.siteVisitStatus).toEqual({ label: 'Status1', value: 'STATUS_1' });

      expect(tour.rmDetails).toBeDefined();
      expect(tour.rmDetails).toHaveProperty('name', 'John Doe');

      expect(tour.siteVisitStatus).toBeDefined();
      expect(tour.siteVisitStatus).toHaveProperty('label', 'Status1');

      expect(tour.cancellationReason).toBeDefined();
    });

    it('should return an empty object when tour data is null', () => {
      const result = tourDetailTransformer.getTour(null);

      expect(result).toEqual({});
    });
  });

  describe('Service', () => {
    it('should throw BadRequestException when project does not exist or incomplete', async () => {
      const mockSlug = 'nonexistent-slug';

      jest.spyOn(tourRepository, 'getProjectId').mockResolvedValueOnce(null);
      await expect(service.getProjectId(mockSlug)).rejects.toThrowError(
        BadRequestException
      );

      expect(tourRepository.getProjectId).toHaveBeenCalledWith(mockSlug);
    });

    it('should return an array of days based on configuration', () => {
      const expectedDays = [
        {
          day: 'Mon', date: 1, month: 'January', year: 2023
        },
        {
          day: 'Tue', date: 2, month: 'January', year: 2023
        }
      ];
      jest.spyOn(service, 'getDays').mockReturnValue(expectedDays);

      const days = service.getDays();

      expect(days).toEqual(expectedDays);
    });

    it('should return tour details', async () => {
      const project = { slug: 'project-slug' };
      const visitTypes = ['IN PERSON', 'VIDEO CALL'];
      const timeSlots = [
        '09:00', '09:30', '10:00',
        '10:30', '11:00', '11:30',
        '12:00', '12:30', '13:00',
        '13:30', '14:00', '14:30',
        '15:00', '15:30', '16:00',
        '16:30', '17:00', '17:30'
      ];
      const expectedResponse = {
        days: [],
        timeSlots,
        visitTypes
      };

      jest.spyOn(tourRepository, 'getProjectId').mockResolvedValue(true);
      jest.spyOn(tourRepository, 'getFieldChoices').mockResolvedValue(visitTypes);
      jest.spyOn(service, 'getDays').mockReturnValue([]);
      jest.spyOn(service, 'getTimeSlots').mockReturnValue(timeSlots);

      const response = await service.requestTour(project);

      expect(response).toEqual(expectedResponse);
      expect(tourRepository.getFieldChoices).toHaveBeenCalled();
      expect(service.getDays).toHaveBeenCalled();
    });

    it('should insert the tour and return the tour details', async () => {
      const user = 'user-id';
      const futureDate = dayjs().add(1, 'day');
      const futureDay = {
        year: futureDate.year(),
        month: futureDate.format('MMMM'),
        date: futureDate.date()
      };
      const tour = {
        slug: 'project-slug',
        day: futureDay,
        timeSlot: '11:00',
        visitType: { value: 'IN_PERSON' }
      };
      const projectId = 'project-id';
      const visitTime = `${futureDay.year}-${futureDay.month}-${futureDay.date} ${tour.timeSlot}:00.000`;
      const expectedResponse = {
        id: 'tour-id',
        siteVisitId: 'site-visit-id'
      };
      const visitTypeExpectedRes = [
        { text: 'IN PERSON', value: 'IN_PERSON' }
      ];
      const visitTypes = [
        {
          text: 'IN PERSON',
          value: 'IN_PERSON'
        },
        {
          text: 'VIDEO CALL',
          value: 'VIDEO_CALL'
        }
      ];
      const tourDetails: GetTourDetailInterface[] = [
        {
          siteVisit: {
            id: 'd3e1d847-ac31-48ac-a75a-ab17db558ab0',
            visitId: 10000002,
            visitType: 'IN_PERSON',
            visitTime: '2023-07-24 10:00:00',
            cancellationReason: null,
            cancellationReasonDetails: null,
            siteVisitStatus: {
              id: 1,
              label: 'Scheduled',
              value: 'Scheduled',
              allowUpdate: true,
              showToCustomer: true
            },
            dateCreated: '2023-07-24 10:00:00'
          },
          rm: null,
          project: {
            name: 'Seasons',
            slug: 'seasons',
            description: 'Launching D-wing that is presenting spacious 3 Bhk flats',
            propertyPicture: 'd8c113ad-dbee-4c9d-bd85-b39907582f33.jpg',
            locality: 'test-locality',
            lat: 70,
            lng: 26,
            images: '1b27c0cd-f608-4fb1-9d80-10ae00848d1a.png'
          }
        }
      ];
      const getVisitTypes = [{ text: 'IN PERSON', value: 'IN_PERSON' }];
      const scheduledTour: any = [{
        id: 'tour-id', visitTime: '2023-07-24 10:00:00'
      }];
      jest.spyOn(tourRepository, 'getScheduledTour').mockResolvedValue(false);
      jest.spyOn(tourRepository, 'getProjectId').mockResolvedValue(projectId);
      jest.spyOn(tourRepository, 'getFieldChoices').mockResolvedValue(visitTypes);
      jest.spyOn(service, 'validateVisitTime');
      jest.spyOn(service, 'validateVisitType');
      jest.spyOn(service, 'getVisitTypes').mockResolvedValue(getVisitTypes);
      jest.spyOn(service, 'convertToDateTime').mockReturnValue(visitTime);
      jest.spyOn(tourRepository, 'getAllScheduledTour').mockResolvedValue(scheduledTour);
      jest.spyOn(tourRepository, 'insertTour').mockResolvedValue(expectedResponse);
      jest.spyOn(tourRepository, 'getTour').mockResolvedValue(tourDetails);

      const [tourDetailsRes, visitTypeRes] = await service.createTour(user, tour);

      expect(tourDetailsRes).toEqual(tourDetails);
      expect(visitTypeRes).toEqual(visitTypeExpectedRes);
      expect(tourRepository.getScheduledTour).toHaveBeenCalledWith(user, tour.slug);
      expect(tourRepository.getProjectId).toHaveBeenCalledWith(tour.slug);
      expect(service.validateVisitTime).toHaveBeenCalledWith(tour.day, tour.timeSlot);
      expect(service.convertToDateTime).toHaveBeenCalledWith(tour.day, tour.timeSlot);
      expect(tourRepository.insertTour).toHaveBeenCalledWith({
        projectId,
        visitType: tour.visitType.value,
        visitTime,
        customer: user
      });
      expect(tourRepository.getTour).toHaveBeenCalledWith('user-id', { id: 'tour-id', upcoming: true });
    });

    it('should throw BadRequestException for Invalid Visit Type', async () => {
      const visitType = { value: 'IN PERSON' };
      const visitTypes = [
        {
          text: 'IN PERSON',
          value: 'IN_PERSON'
        },
        {
          text: 'VIDEO CALL',
          value: 'VIDEO_CALL'
        }
      ];
      jest.spyOn(tourRepository, 'getFieldChoices').mockResolvedValue(visitTypes);
      jest.spyOn(service, 'validateVisitType');

      await expect(service.validateVisitType(visitType)).rejects.toThrow(
        new BadRequestException('Invalid Visit Type')
      );
    });

    it('should throw BadRequestException for Missing Visit Time', async () => {
      const visitType = { value: '' };
      const visitTypes = [
        {
          text: 'IN PERSON',
          value: 'IN_PERSON'
        },
        {
          text: 'VIDEO CALL',
          value: 'VIDEO_CALL'
        }
      ];
      jest.spyOn(tourRepository, 'getFieldChoices').mockResolvedValue(visitTypes);
      jest.spyOn(service, 'validateVisitType');

      await expect(service.validateVisitType(visitType)).rejects.toThrow(
        new BadRequestException('Visit Type is required')
      );
    });

    it('should throw BadRequestException if tour is already scheduled', async () => {
      const user = 'user-id';
      const tour: CreateTour = {
        slug: 'project-slug',
        day: { date: 25, month: 'July', year: 2023 },
        timeSlot: '10:00',
        visitType: { value: 'IN_PERSON' }
      };
      jest.spyOn(tourRepository, 'getProjectId').mockResolvedValue(true);
      jest.spyOn(service, 'hasScheduledTour').mockResolvedValue(true);

      await expect(service.createTour(user, tour)).rejects.toThrow(
        new BadRequestException('You have already requested a tour for this project')
      );
    });

    it('should throw BadRequestException if project is not found', async () => {
      const slug = 'project-slug';
      jest.spyOn(tourRepository, 'getProjectId').mockResolvedValue(null);

      await expect(service.getProjectId(slug)).rejects.toThrow(
        new BadRequestException('Project not found')
      );
    });

    it('should convert day and time slot to the correct formatted date and time', () => {
      const day = { year: 2023, month: 'January', date: 1 };
      const timeSlot = '09:30';
      const expectedDateTime = '2023-01-01 09:30:00.000';

      const convertedDateTime = service.convertToDateTime(day, timeSlot);

      expect(convertedDateTime).toBe(expectedDateTime);
    });

    it('should handle single-digit month and date values', () => {
      const day = { year: 2023, month: 'February', date: 5 };
      const timeSlot = '14:00';
      const expectedDateTime = '2023-02-05 14:00:00.000';

      const convertedDateTime = service.convertToDateTime(day, timeSlot);

      expect(convertedDateTime).toBe(expectedDateTime);
    });

    it('should handle leading zero in time slot hour', () => {
      const day = { year: 2023, month: 'March', date: 15 };
      const timeSlot = '08:45';
      const expectedDateTime = '2023-03-15 08:45:00.000';

      const convertedDateTime = service.convertToDateTime(day, timeSlot);

      expect(convertedDateTime).toBe(expectedDateTime);
    });

    it('should handle leading zero in time slot minutes', () => {
      const day = { year: 2023, month: 'April', date: 20 };
      const timeSlot = '11:05';
      const expectedDateTime = '2023-04-20 11:05:00.000';

      const convertedDateTime = service.convertToDateTime(day, timeSlot);

      expect(convertedDateTime).toBe(expectedDateTime);
    });

    it('should handle different date and time formats', () => {
      const day = { year: 2023, month: 'May', date: 25 };
      const timeSlot = '17:30';
      const expectedDateTime = '2023-05-25 17:30:00.000';

      const convertedDateTime = service.convertToDateTime(day, timeSlot);

      expect(convertedDateTime).toBe(expectedDateTime);
    });

    it('should throw an exception if visit time is in the past', () => {
      const day = { year: 2023, month: 'May', date: 25 };
      const timeSlot = '17:30';

      expect(() => service.validateVisitTime(day, timeSlot)).toThrow('Tour cannot be scheduled in the past');
    });

    it('should return an array of days with correct length', () => {
      const daysCount = config.DAYS_TO_SHOW_FOR_TOUR_BOOKING;
      const days = service.getDays();
      expect(days).toHaveLength(daysCount);
    });

    it('should return an array of days with correct properties', () => {
      const days = service.getDays();
      expect(Array.isArray(days)).toBe(true);
    });

    it('should return an object with amount and unit for valid duration format (hour)', () => {
      const duration = '1h';
      const result = service.parseTourDuration(duration);

      expect(result).toEqual({ amount: 1, unit: 'hour' });
    });

    it('should throw an error for invalid duration format', () => {
      const duration = '30x';

      expect(() => {
        service.parseTourDuration(duration);
      }).toThrowError('Invalid TOUR DURATION format');
    });

    it('should throw an error for duration without unit', () => {
      const duration = '30';

      expect(() => {
        service.parseTourDuration(duration);
      }).toThrowError('Invalid TOUR DURATION format');
    });

    it('should return tour details for a valid user and tour ID', async () => {
      const user = 'user-id';
      const tourId = 'tour-id';
      const tourDetails: GetTourDetailInterface[] = [
        {
          siteVisit: {
            id: 'd3e1d847-ac31-48ac-a75a-ab17db558ab0',
            visitId: 10000002,
            visitType: 'IN_PERSON',
            visitTime: '2023-07-24 10:00:00',
            cancellationReason: null,
            cancellationReasonDetails: null,
            siteVisitStatus: {
              id: 1,
              label: 'Scheduled',
              value: 'Scheduled',
              allowUpdate: true,
              showToCustomer: true
            },
            dateCreated: '2023-07-24 10:00:00'
          },
          rm: null,
          project: {
            name: 'Seasons',
            slug: 'seasons',
            description: 'Launching D-wing that is presenting spacious 3 Bhk flats',
            propertyPicture: 'd8c113ad-dbee-4c9d-bd85-b39907582f33.jpg',
            locality: 'test-locality',
            lat: 70,
            lng: 16,
            images: '1b27c0cd-f608-4fb1-9d80-10ae00848d1a.png'
          }
        }
      ];
      const visitTypes: FieldChoiceInterface[] = [
        {
          text: 'IN PERSON',
          value: 'IN_PERSON'
        },
        {
          text: 'VIDEO CALL',
          value: 'VIDEO_CALL'
        }
      ];
      const visitStatuses = ['Scheduled', 'Completed'];
      const cancellationReasons: FieldChoiceInterface[] = [{
        text: 'Change of plans',
        value: 'CHANGE_OF_PLANS'
      }, {
        text: 'Unavailable',
        value: 'UNAVAILABLE'
      }];

      jest.spyOn(tourRepository, 'getTour').mockResolvedValueOnce(tourDetails);
      jest.spyOn(service, 'getVisitTypes').mockResolvedValue(visitTypes);
      jest.spyOn(tourRepository, 'getSiteVisitStatuses').mockResolvedValue(
        visitStatuses.map((status) => ({ value: status }))
      );
      jest.spyOn(service, 'getCancellationReasons').mockResolvedValue(cancellationReasons);

      const result = await service.getTour(user, { id: tourId });

      expect(tourRepository.getTour).toHaveBeenCalledWith(user, { id: tourId });
      expect(service.getVisitTypes).toHaveBeenCalled();
      expect(tourRepository.getSiteVisitStatuses).toHaveBeenCalled();
      expect(service.getCancellationReasons).toHaveBeenCalled();

      expect(result).toEqual({
        id: tourId,
        tourDetails,
        visitTypes,
        visitStatuses: visitStatuses.map((status) => ({ value: status })),
        cancellationReasons
      });
    });

    it('should throw an error for duration with invalid unit', () => {
      const duration = '30s';

      expect(() => {
        service.parseTourDuration(duration);
      }).toThrowError('Invalid TOUR DURATION format');
    });

    it('should throw BadRequestException if no tour details are found', async () => {
      const user = 'user-id';
      const tour = { id: 'tour-id' };

      jest.spyOn(tourRepository, 'getTour').mockResolvedValueOnce([]);

      await expect(service.isUpdateAllowed(user, tour)).rejects.toThrow(
        new BadRequestException('No Tour Found')
      );
    });

    it('should throw BadRequestException if no visit statuses are found', async () => {
      const user = 'user-id';
      const tourId = 'tour-id';

      const tourDetails: GetTourDetailInterface[] = [
        {
          siteVisit: {
            id: 'd3e1d847-ac31-48ac-a75a-ab17db558ab0',
            visitId: 10000002,
            visitType: 'IN_PERSON',
            visitTime: '2023-07-24 10:00:00',
            cancellationReason: null,
            cancellationReasonDetails: null,
            siteVisitStatus: {
              id: 1,
              label: 'Scheduled',
              value: 'Scheduled',
              allowUpdate: true,
              showToCustomer: true
            },
            dateCreated: '2023-07-24 10:00:00'
          },
          rm: null,
          project: {
            name: 'Seasons',
            slug: 'seasons',
            description: 'Launching D-wing that is presenting spacious 3 Bhk flats',
            propertyPicture: 'd8c113ad-dbee-4c9d-bd85-b39907582f33.jpg',
            locality: 'test-locality',
            lat: 70,
            lng: 12,
            images: '1b27c0cd-f608-4fb1-9d80-10ae00848d1a.png'
          }
        }
      ];
      const visitTypes = [
        {
          text: 'IN PERSON',
          value: 'IN_PERSON'
        },
        {
          text: 'VIDEO CALL',
          value: 'VIDEO_CALL'
        }
      ];
      jest.spyOn(tourRepository, 'getTour').mockResolvedValueOnce(tourDetails);
      jest.spyOn(service, 'getVisitTypes').mockResolvedValue(visitTypes);
      jest.spyOn(tourRepository, 'getSiteVisitStatuses').mockResolvedValue(null);
      jest.spyOn(service, 'getCancellationReasons').mockResolvedValue([]);

      await expect(service.getTour(user, { id: tourId })).rejects.toThrow(
        new BadRequestException('No Visit Statuses Found')
      );
    });

    it('should throw BadRequestException if no visit types are found', async () => {
      const user = 'user-id';
      const tourId = 'tour-id';
      const tourDetails: GetTourDetailInterface[] = [
        {
          siteVisit: {
            id: 'd3e1d847-ac31-48ac-a75a-ab17db558ab0',
            visitId: 10000002,
            visitType: 'IN_PERSON',
            visitTime: '2023-07-24 10:00:00',
            cancellationReason: null,
            cancellationReasonDetails: null,
            siteVisitStatus: {
              id: 1,
              label: 'Scheduled',
              value: 'Scheduled',
              allowUpdate: true,
              showToCustomer: true
            },
            dateCreated: '2023-07-24 10:00:00'
          },
          rm: null,
          project: {
            name: 'Seasons',
            slug: 'seasons',
            description: 'Launching D-wing that is presenting spacious 3 Bhk flats',
            propertyPicture: 'd8c113ad-dbee-4c9d-bd85-b39907582f33.jpg',
            locality: 'test-locality',
            lat: 70,
            lng: 12,
            images: '1b27c0cd-f608-4fb1-9d80-10ae00848d1a.png'
          }
        }
      ];
      const visitStatuses = ['Scheduled', 'Completed'];
      const cancellationReasons: FieldChoiceInterface[] = [{
        text: 'Change of plans',
        value: 'CHANGE_OF_PLANS'
      }, {
        text: 'Unavailable',
        value: 'UNAVAILABLE'
      }];
      jest.spyOn(tourRepository, 'getTour').mockResolvedValueOnce(tourDetails);
      jest.spyOn(tourRepository, 'getFieldChoices').mockResolvedValueOnce(null);
      jest.spyOn(tourRepository, 'getSiteVisitStatuses').mockResolvedValue(
        visitStatuses.map((status) => ({ value: status }))
      );
      jest.spyOn(service, 'getCancellationReasons').mockResolvedValue(cancellationReasons);

      await expect(service.getTour(user, { id: tourId })).rejects.toThrow(
        new BadRequestException('No Visit Types Found')
      );
    });

    it('should return tour details with empty cancellation reasons if none are found', async () => {
      const user = 'user-id';
      const tourId = 'tour-id';
      const tourDetails: GetTourDetailInterface[] = [
        {
          siteVisit: {
            id: 'd3e1d847-ac31-48ac-a75a-ab17db558ab0',
            visitId: 10000002,
            visitType: 'IN_PERSON',
            visitTime: '2023-07-24 10:00:00',
            cancellationReason: null,
            cancellationReasonDetails: null,
            siteVisitStatus: {
              id: 1,
              label: 'Scheduled',
              value: 'Scheduled',
              allowUpdate: true,
              showToCustomer: true
            },
            dateCreated: '2023-07-24 10:00:00'
          },
          rm: null,
          project: {
            name: 'Seasons',
            slug: 'seasons',
            description: 'Launching D-wing that is presenting spacious 3 Bhk flats',
            propertyPicture: 'd8c113ad-dbee-4c9d-bd85-b39907582f33.jpg',
            locality: 'test-locality',
            lat: 70,
            lng: 70,
            images: '1b27c0cd-f608-4fb1-9d80-10ae00848d1a.png'
          }
        }
      ];
      const visitTypes = [
        { text: 'IN PERSON', value: 'IN_PERSON' },
        { text: 'VIDEO CALL', value: 'VIDEO_CALL' }
      ];
      const visitStatuses = ['Scheduled', 'Completed'];

      jest.spyOn(tourRepository, 'getTour').mockResolvedValueOnce(tourDetails);
      jest.spyOn(service, 'getVisitTypes').mockResolvedValue(visitTypes);
      jest.spyOn(tourRepository, 'getSiteVisitStatuses').mockResolvedValue(
        visitStatuses.map((status) => ({ value: status }))
      );
      jest.spyOn(service, 'getCancellationReasons').mockResolvedValue([]);

      const result = await service.getTour(user, { id: tourId });

      expect(tourRepository.getTour).toHaveBeenCalledWith(user, { id: tourId });
      expect(service.getVisitTypes).toHaveBeenCalled();
      expect(tourRepository.getSiteVisitStatuses).toHaveBeenCalled();
      expect(service.getCancellationReasons).toHaveBeenCalled();

      expect(result).toEqual({
        id: tourId,
        tourDetails,
        visitTypes,
        visitStatuses: visitStatuses.map((status) => ({ value: status })),
        cancellationReasons: []
      });
    });

    it('should call all the necessary helper functions and update the tour successfully', async () => {
      const user = 'user-id';
      const tourId = 'tour-id';
      const siteVisitStatus = { value: 'CUSTOMER_CANCELLED' };
      const cancellationReason = { value: 'EXPENSIVE' };
      const cancellationReasonDetails = 'Details';
      const cancellationReasons: FieldChoiceInterface[] = [
        {
          text: 'RM was unreachable',
          value: 'RM_UNREACHABLE'
        },
        {
          text: 'Could not find Location',
          value: 'LOCATION_NOT_FOUND'
        },
        {
          text: 'Out of budget',
          value: 'EXPENSIVE'
        },
        {
          text: 'Changed my mind',
          value: 'CHANGED_MIND'
        },
        {
          text: 'Did not like',
          value: 'DISLIKED'
        },
        {
          text: 'Other',
          value: 'OTHER'
        }
      ];

      const isUpdateAllowedSpy = jest.spyOn(service, 'isUpdateAllowed').mockResolvedValue();
      jest.spyOn(service, 'getCancellationReasons').mockResolvedValueOnce(cancellationReasons);
      const isUpdateRequestValidSpy = jest.spyOn(service, 'isCancelRequestValid');
      const getSiteVisitStatusIdSpy = jest.spyOn(service, 'getSiteVisitStatusId').mockResolvedValue('status-id');
      const updateTourSpy = jest.spyOn(tourRepository, 'updateTour').mockResolvedValue();

      const tourToUpdate: CancelTourInterface = {
        id: tourId,
        siteVisitStatus,
        cancellationReason,
        cancellationReasonDetails
      };

      await service.cancelTour(user, tourToUpdate);

      expect(isUpdateAllowedSpy).toHaveBeenCalledWith(user, tourToUpdate);
      expect(isUpdateRequestValidSpy).toHaveBeenCalledWith(tourToUpdate);
      expect(getSiteVisitStatusIdSpy).toHaveBeenCalledWith(siteVisitStatus.value);
      expect(updateTourSpy).toHaveBeenCalledWith(tourId, {
        siteVisitStatusId: 'status-id',
        cancellationReason: 'EXPENSIVE'
      });
    });

    it('should throw BadRequestException if isUpdateAllowed returns false', async () => {
      const user = 'user-id';
      const tour: CancelTourInterface = {
        id: 'tour-id',
        siteVisitStatus: { value: 'VISITED' },
        cancellationReason: { value: 'CANCEL_REASON' },
        cancellationReasonDetails: 'Cancellation Details'
      };

      jest.spyOn(service, 'isUpdateAllowed').mockRejectedValue(new BadRequestException('Update not allowed'));

      await expect(service.cancelTour(user, tour)).rejects.toThrow(BadRequestException);
    });

    it('should return tour details without cancellation reasons', async () => {
      const user = 'user-id';
      const tourId = 'tour-id';
      const tourDetails: GetTourDetailInterface[] = [
        {
          siteVisit: {
            id: 'd3e1d847-ac31-48ac-a75a-ab17db558ab0',
            visitId: 10000002,
            visitType: 'IN_PERSON',
            visitTime: '2023-07-24 10:00:00',
            cancellationReason: null,
            cancellationReasonDetails: null,
            siteVisitStatus: {
              id: 1,
              label: 'Scheduled',
              value: 'Scheduled',
              allowUpdate: true,
              showToCustomer: true
            },
            dateCreated: '2023-07-24 10:00:00'
          },
          rm: null,
          project: {
            name: 'Seasons',
            slug: 'seasons',
            description: '<p>Launching D-wing that is presenting spacious 3 Bhk flats</p>',
            propertyPicture: 'd8c113ad-dbee-4c9d-bd85-b39907582f33.jpg',
            locality: 'test-locality',
            lat: 70,
            lng: 70,
            images: '1b27c0cd-f608-4fb1-9d80-10ae00848d1a.png'
          }
        }
      ];
      const visitTypes = [
        {
          text: 'IN PERSON',
          value: 'IN_PERSON'
        },
        {
          text: 'VIDEO CALL',
          value: 'VIDEO_CALL'
        }
      ];
      const visitStatuses = ['Scheduled', 'Completed'];

      jest.spyOn(tourRepository, 'getTour').mockResolvedValueOnce(tourDetails);
      jest.spyOn(service, 'getVisitTypes').mockResolvedValue(visitTypes);
      jest.spyOn(tourRepository, 'getSiteVisitStatuses').mockResolvedValue(
        visitStatuses.map((status) => ({ value: status }))
      );
      jest.spyOn(service, 'getCancellationReasons').mockResolvedValue(null);

      const result = await service.getTour(user, { id: tourId });

      expect(tourRepository.getTour).toHaveBeenCalledWith(user, { id: tourId });
      expect(service.getVisitTypes).toHaveBeenCalled();
      expect(tourRepository.getSiteVisitStatuses).toHaveBeenCalled();
      expect(service.getCancellationReasons).toHaveBeenCalled();

      expect(result).toEqual({
        id: tourId,
        tourDetails,
        visitTypes,
        visitStatuses: visitStatuses.map((status) => ({ value: status })),
        cancellationReasons: null
      });
    });

    it('should throw BadRequestException if getTour returns an empty array', async () => {
      const user = 'user-id';
      const tour: CancelTourInterface = { id: 'tour-id', siteVisitStatus: { value: 'VISITED' } };

      jest.spyOn(tourRepository, 'getTour').mockResolvedValueOnce([]);

      await expect(service.isUpdateAllowed(user, tour)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if getTour returns a tour without siteVisitStatus', async () => {
      const user = 'user-id';
      const tour: CancelTourInterface = { id: 'tour-id', siteVisitStatus: { value: 'VISITED' } };
      const mockTourDetails: GetTourDetailInterface[] = [
        {
          siteVisit: {
            id: 'd3e1d847-ac31-48ac-a75a-ab17db558ab0',
            visitId: 10000002,
            visitType: 'IN_PERSON',
            visitTime: '2023-07-24 10:00:00',
            cancellationReason: null,
            cancellationReasonDetails: null,
            siteVisitStatus: {
              id: 1,
              label: 'Scheduled',
              value: 'Scheduled',
              allowUpdate: true,
              showToCustomer: true
            },
            dateCreated: '2023-07-24 10:00:00'
          },
          rm: null,
          project: {
            name: 'Seasons',
            slug: 'seasons',
            description: '<p>Launching D-wing that is presenting spacious 3 Bhk flats</p>',
            propertyPicture: 'd8c113ad-dbee-4c9d-bd85-b39907582f33.jpg',
            locality: 'test-locality',
            lat: 70,
            lng: 70,
            images: '1b27c0cd-f608-4fb1-9d80-10ae00848d1a.png'
          }
        }
      ];
      jest.spyOn(tourRepository, 'getTour').mockResolvedValueOnce(mockTourDetails);

      await expect(service.isUpdateAllowed(user, tour)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if getTour returns a tour with allowUpdate set to false', async () => {
      const user = 'user-id';
      const tour: CancelTourInterface = { id: 'tour-id', siteVisitStatus: { value: 'VISITED' } };
      const mockTourDetails = [];
      jest.spyOn(tourRepository, 'getTour').mockResolvedValueOnce(mockTourDetails);

      await expect(service.isUpdateAllowed(user, tour)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if getTour returns a tour with allowUpdate set to false', async () => {
      const user = 'user-id';
      const tour: CancelTourInterface = { id: 'tour-id', siteVisitStatus: { value: 'VISITED' } };
      const mockTourDetails: GetTourDetailInterface[] = [
        {
          siteVisit: {
            id: 'd3e1d847-ac31-48ac-a75a-ab17db558ab0',
            visitId: 10000002,
            visitType: 'IN_PERSON',
            visitTime: '2023-07-24 10:00:00',
            cancellationReason: null,
            cancellationReasonDetails: null,
            siteVisitStatus: {
              id: 1,
              label: 'Scheduled',
              value: 'Scheduled',
              allowUpdate: true,
              showToCustomer: true
            },
            dateCreated: '2023-07-24 10:00:00'
          },
          rm: null,
          project: {
            name: 'Seasons',
            slug: 'seasons',
            description: '<p>Launching D-wing that is presenting spacious 3 Bhk flats</p>',
            propertyPicture: 'd8c113ad-dbee-4c9d-bd85-b39907582f33.jpg',
            locality: 'test-locality',
            lat: 70,
            lng: 70,
            images: '1b27c0cd-f608-4fb1-9d80-10ae00848d1a.png'
          }
        }
      ];
      jest.spyOn(tourRepository, 'getTour').mockResolvedValueOnce(mockTourDetails);

      await expect(service.isUpdateAllowed(user, tour)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if getTour throws an exception', async () => {
      const user = 'user-id';
      const tour: CancelTourInterface = { id: 'tour-id', siteVisitStatus: { value: 'VISITED' } };

      jest.spyOn(tourRepository, 'getTour').mockRejectedValueOnce(new BadRequestException('Database error'));

      await expect(service.isUpdateAllowed(user, tour)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for null or undefined tour', async () => {
      await expect(service.isCancelRequestValid(null)).rejects.toThrow(BadRequestException);
      await expect(service.isCancelRequestValid(undefined)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when tour.id is null or undefined', async () => {
      const tour: CancelTourInterface = {
        id: '',
        siteVisitStatus: { value: 'RESCHEDULE_REQUESTED' }
      };
      await expect(service.isCancelRequestValid(tour)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when tour.siteVisitStatus is null or undefined', async () => {
      const tour: CancelTourInterface = {
        id: 'd3e1d847-ac31-48ac-a75a-ab17db558ab0',
        siteVisitStatus: { value: null }
      };
      await expect(service.isCancelRequestValid(tour)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when cancellationReason is missing', async () => {
      const tour: CancelTourInterface = { id: 'tour-id', siteVisitStatus: { value: 'CUSTOMER_CANCELLED' } };
      await expect(service.isCancelRequestValid(tour)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if siteVisitStatusId is null or undefined', async () => {
      jest.spyOn(tourRepository, 'getSiteVisitStatusId').mockResolvedValue(null);
      await expect(service.getSiteVisitStatusId('RESCHEDULE_REQUESTED')).rejects.toThrow(BadRequestException);
    });

    it('should return siteVisitStatusId when it is valid', async () => {
      const siteVisitStatusId = '12345';
      jest.spyOn(tourRepository, 'getSiteVisitStatusId').mockResolvedValue(siteVisitStatusId);
      const result = await service.getSiteVisitStatusId('RESCHEDULE_REQUESTED');

      expect(result).toEqual(siteVisitStatusId);
    });

    it('should not throw BadRequestException for valid siteVisitStatusId', async () => {
      const siteVisitStatusId = '12345';
      jest.spyOn(tourRepository, 'getSiteVisitStatusId').mockResolvedValue(siteVisitStatusId);

      await expect(service.getSiteVisitStatusId('RESCHEDULE_REQUESTED')).resolves.not.toThrow();
    });

    it('should throw BadRequestException if visitTypes are not found', async () => {
      jest.spyOn(tourRepository, 'getFieldChoices').mockResolvedValue(null);

      await expect(service.getVisitTypes()).rejects.toThrow(BadRequestException);
    });

    it('should return visitTypes when available', async () => {
      const visitTypes = ['IN PERSON', 'VIDEO CALL'];
      jest.spyOn(tourRepository, 'getFieldChoices').mockResolvedValue(visitTypes);
      const result = await service.getVisitTypes();

      expect(result).toEqual(visitTypes);
    });

    it('should throw BadRequestException if cancellation reasons are not found', async () => {
      jest.spyOn(tourRepository, 'getFieldChoices').mockResolvedValue(null);

      await expect(service.getCancellationReasons()).rejects.toThrow(BadRequestException);
    });

    it('should return cancellation reasons when available', async () => {
      const cancellationReasons = ['Reason 1', 'Reason 2'];
      jest.spyOn(tourRepository, 'getFieldChoices').mockResolvedValue(cancellationReasons);

      const result = await service.getCancellationReasons();
      expect(result).toEqual(cancellationReasons);
    });

    it('should not throw BadRequestException for OTHER cancellation reason without details', async () => {
      const tour: CancelTourInterface = {
        id: 'tour-id',
        siteVisitStatus: { value: 'VISITED' },
        cancellationReason: { value: 'OTHER' }
      };
      const cancellationReasons: FieldChoiceInterface[] = [
        {
          text: 'RM was unreachable',
          value: 'RM_UNREACHABLE'
        },
        {
          text: 'Could not find Location',
          value: 'LOCATION_NOT_FOUND'
        },
        {
          text: 'Out of budget',
          value: 'EXPENSIVE'
        },
        {
          text: 'Changed my mind',
          value: 'CHANGED_MIND'
        },
        {
          text: 'Did not like',
          value: 'DISLIKED'
        },
        {
          text: 'Other',
          value: 'OTHER'
        }
      ];
      jest.spyOn(service, 'getCancellationReasons').mockResolvedValue(cancellationReasons);

      await expect(service.isCancelRequestValid(tour)).resolves.not.toThrow(BadRequestException);
    });

    it('should not throw BadRequestException for OTHER cancellation reason with details', async () => {
      const tourWithDetails: CancelTourInterface = {
        id: 'tour-id',
        siteVisitStatus: { value: 'VISITED' },
        cancellationReason: { value: 'OTHER' },
        cancellationReasonDetails: 'Need more information'
      };
      const cancellationReasons: FieldChoiceInterface[] = [
        {
          text: 'RM was unreachable',
          value: 'RM_UNREACHABLE'
        },
        {
          text: 'Could not find Location',
          value: 'LOCATION_NOT_FOUND'
        },
        {
          text: 'Out of budget',
          value: 'EXPENSIVE'
        },
        {
          text: 'Changed my mind',
          value: 'CHANGED_MIND'
        },
        {
          text: 'Did not like',
          value: 'DISLIKED'
        },
        {
          text: 'Other',
          value: 'OTHER'
        }
      ];
      jest.spyOn(service, 'getCancellationReasons').mockResolvedValue(cancellationReasons);

      await expect(service.isCancelRequestValid(tourWithDetails)).resolves.not.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if visitTime is in the past', () => {
      const day = {
        date: 25,
        month: 'July',
        year: 2022
      };
      const timeSlot = '10:00';
      jest.spyOn(dayjs.prototype, 'isBefore').mockReturnValue(true);

      expect(() => service.validateVisitTime(day, timeSlot)).toThrow(BadRequestException);
    });

    it('should throw BadRequestException if visitTime is in the future for more than 15 days', () => {
      const futureDate = dayjs().add(2, 'month');
      const futureDay = {
        date: futureDate.date(),
        month: futureDate.format('MMMM'),
        year: futureDate.year()
      };
      const timeSlot = '10:00';

      jest.spyOn(dayjs.prototype, 'isBefore').mockReturnValue(false);

      expect(() => service.validateVisitTime(futureDay, timeSlot)).toThrow(BadRequestException);
    });

    it('should not throw BadRequestException if visitTime is in the future within 15 days', () => {
      const futureDate = dayjs().add(14, 'day');
      const futureDay = {
        date: futureDate.date(),
        month: futureDate.format('MMMM'),
        year: futureDate.year()
      };
      const timeSlot = '10:00';

      jest.spyOn(dayjs.prototype, 'isBefore').mockReturnValue(false);

      expect(() => service.validateVisitTime(futureDay, timeSlot)).not.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if visitTime is before work hours', () => {
      const futureDate = dayjs().add(14, 'day');
      const futureDay = {
        date: futureDate.date(),
        month: futureDate.format('MMMM'),
        year: futureDate.year()
      };
      const timeSlot = '02:00';

      jest.spyOn(dayjs.prototype, 'isBefore').mockReturnValue(true);

      expect(() => service.validateVisitTime(futureDay, timeSlot)).toThrow(BadRequestException);
    });

    it('should throw BadRequestException if visitTime is after work hours', () => {
      const futureDate = dayjs().add(14, 'day');
      const futureDay = {
        date: futureDate.date(),
        month: futureDate.format('MMMM'),
        year: futureDate.year()
      };
      const timeSlot = '20:00';

      jest.spyOn(dayjs.prototype, 'isBefore').mockReturnValue(true);

      expect(() => service.validateVisitTime(futureDay, timeSlot)).toThrow(BadRequestException);
    });

    it('should throw BadRequestException if month is invalid', () => {
      const futureDay = {
        date: 25,
        month: 'augwest',
        year: 2022
      };
      const timeSlot = '10:00';

      jest.spyOn(dayjs.prototype, 'isBefore').mockReturnValue(true);

      expect(() => service.validateVisitTime(futureDay, timeSlot)).toThrow(BadRequestException);
    });

    it('should get tour details and transform them', async () => {
      const tourDetails: GetTourDetailInterface[] = [
        {
          siteVisit: {
            id: 'd3e1d847-ac31-48ac-a75a-ab17db558ab0',
            visitId: 10000002,
            visitType: 'IN_PERSON',
            visitTime: '2023-07-24 10:00:00',
            cancellationReason: null,
            cancellationReasonDetails: null,
            siteVisitStatus: {
              id: 1,
              label: 'Scheduled',
              value: 'Scheduled',
              allowUpdate: true,
              showToCustomer: true
            },
            dateCreated: '2023-07-24 10:00:00'
          },
          rm: null,
          project: {
            name: 'Seasons',
            slug: 'seasons',
            description: 'Rustomjee Seasons.',
            propertyPicture: 'd8c113ad-dbee-4c9d-bd85-b39907582f33.jpg',
            locality: 'test-locality',
            lat: 70,
            lng: 70,
            images: '1b27c0cd-f608-4fb1-9d80-10ae00848d1a.png,9ecb68dc-fe68-4bb2-a3f6-7912cf0479a2.png'
          }
        }
      ];
      const tourData = {
        id: 'd3e1d847-ac31-48ac-a75a-ab17db558ab0',
        tourDetails,
        visitTypes: [
          { text: 'IN PERSON', value: 'IN_PERSON' },
          { text: 'VIDEO CALL', value: 'VIDEO_CALL' }
        ],
        visitStatuses: [
          {
            id: 3,
            label: 'Reschedule Requested',
            value: 'RESCHEDULE_REQUESTED',
            allowUpdate: true,
            showToCustomer: true
          },
          {
            id: 5,
            label: 'Cancelled By Customer',
            value: 'CUSTOMER_CANCELLED',
            allowUpdate: false,
            showToCustomer: true
          }
        ],
        cancellationReasons: [
          { text: 'RM was unreachable', value: 'RM_UNREACHABLE' },
          { text: 'Could not find Location', value: 'LOCATION_NOT_FOUND' },
          { text: 'Out of budget', value: 'EXPENSIVE' },
          { text: 'Changed my mind', value: 'CHANGED_MIND' },
          { text: 'Did not like', value: 'DISLIKED' },
          { text: 'Other', value: 'OTHER' }
        ],
        tourCount: { siteVisitCount: 3 }
      };
      const getTourDto: GetTourDto = {} as GetTourDto;

      jest.spyOn(service, 'getTour').mockResolvedValue(tourData);
      const transformSpy = jest.spyOn(controller.tourDetailTransformer, 'process');

      await controller.getTour(req, getTourDto);

      expect(service.getTour).toHaveBeenCalledWith(req.user.id, getTourDto);
      expect(transformSpy).toHaveBeenCalledWith(tourData);
    });

    it('should update tour and return the updated tour', async () => {
      const tourId = 'tour-id';
      const siteVisitStatus = { value: 'site-visit-status-value' };
      const cancellationReason = { value: 'cancellation-reason-value' };
      const cancellationReasonDetails = 'cancellation-reason-details';

      const updateTourDto: CancelTourInterface = {
        id: tourId,
        siteVisitStatus,
        cancellationReason,
        cancellationReasonDetails
      };
      const cancelTour = {
        message: 'Request successfully cancelled'
      };

      jest.spyOn(service, 'cancelTour').mockResolvedValue(cancelTour);

      const result = await controller.cancelTour(req, updateTourDto);

      expect(result).toBe(cancelTour);
      expect(service.cancelTour).toHaveBeenCalledWith(req.user.id, updateTourDto);
    });

    it('should throw BadRequestException when no tour found', async () => {
      const tourId = 'tour-id';
      const siteVisitStatus = { value: 'site-visit-status-value' };
      const cancellationReason = { value: 'cancellation-reason-value' };
      const cancellationReasonDetails = 'cancellation-reason-details';

      const updateTourDto: CancelTourInterface = {
        id: tourId,
        siteVisitStatus,
        cancellationReason,
        cancellationReasonDetails
      };

      jest.spyOn(service, 'cancelTour').mockRejectedValue(new BadRequestException('No Tour Found'));

      await expect(controller.cancelTour(req, updateTourDto)).rejects.toThrowError(BadRequestException);
      expect(service.cancelTour).toHaveBeenCalledWith(req.user.id, updateTourDto);
    });
  });

  describe('TourUtil', () => {
    describe('getDay', () => {
      it('should return null for empty date string', () => {
        const result = getDayTimeSlot.getDay('');
        expect(result).toBeNull();
      });

      it('should transform date string to Day object', () => {
        const result = getDayTimeSlot.getDay('2023-07-24 10:00:00');
        expect(result).toEqual({
          day: 'Mon',
          date: 24,
          month: 'July',
          year: 2023
        });
      });
    });

    describe('getFullDay', () => {
      it('should return null for empty date string', () => {
        const result = getDayTimeSlot.getFullDay('');
        expect(result).toBeNull();
      });

      it('should transform date string to Day object', () => {
        const result = getDayTimeSlot.getFullDay('2023-07-24 10:00:00');
        expect(result).toEqual({
          day: 'Monday',
          date: 24,
          month: 'July',
          year: 2023
        });
      });
    });

    describe('getTimeSlot', () => {
      it('should return null for empty date string', () => {
        const result = getDayTimeSlot.getTimeSlot('');
        expect(result).toBeNull();
      });

      it('should transform date string to time slot string', () => {
        const result = getDayTimeSlot.getTimeSlot('2023-07-24 10:00:00');
        expect(result).toBe('10:00');
      });
    });
  });

  it('should be valid with correct data', async () => {
    const validData: CreateTourDto = {
      slug: 'project-slug',
      visitType: { value: 'IN_PERSON' },
      day: { date: 25, month: 'July', year: 2023 },
      timeSlot: '10:00'
    };

    const errors = await validate(validData);

    expect(errors.length).toBe(0);
  });
});
