import { Test, TestingModule } from '@nestjs/testing';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import * as fs from 'fs';
import axios from 'axios';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { EventTrackerController } from '../controllers/event-tracker.controller';
import { GoogleAnalyticsService } from '../services/google-analytics.service';
import { PayloadTransformer } from '../transformers/event-tracker-payload.transformer';
import config from '../../app/config';
import { EventTrackerRepository } from '../repositories/event-tracker.repository';
import { mockDb } from '../../app/tests/mock-providers';
import { Db } from '../../app/utils/db.util';
import { EventTrackerEntity } from '../entities/event-tracker.entity';
import { AppModule } from '../../app/app.module';
import { EventTrackerService } from '../services/event-tracker.service';
import { CleverTapService } from '../services/clever-tap.service';
import { CustomerModule } from '../../customer/customer.module';
import { FacebookPixelService } from '../services/facebook-pixel.service';
import { CustomerRepository } from '../../customer/repositories/customer.repository';

describe('GoogleAnalytics', () => {
  let controller: EventTrackerController;
  let payloadTransformer: PayloadTransformer;
  let googleAnalyticsService: GoogleAnalyticsService;
  let cleverTapService: CleverTapService;
  let eventTrackerService: EventTrackerService;
  let facebookPixelService: FacebookPixelService;
  let customerRepository: CustomerRepository;
  let axiosPostMock: jest.SpyInstance;

  const eventTrackerRepositoryMock = {
    create: jest.fn()
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AppModule,
        CustomerModule,
        EventEmitterModule.forRoot(),
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.register({
          secret: config.ACCESS_TOKEN_SECRET,
          signOptions: {
            expiresIn: config.ACCESS_TOKEN_EXPIRES_IN
          }
        })
      ],
      controllers: [EventTrackerController],
      providers: [
        GoogleAnalyticsService,
        PayloadTransformer,
        EventTrackerEntity,
        CleverTapService,
        EventTrackerService,
        FacebookPixelService,
        mockDb,

        { provide: EventTrackerRepository, useValue: eventTrackerRepositoryMock }
      ]
    })
      .overrideProvider(Db)
      .useValue(mockDb.useValue).compile();

    controller = module.get<EventTrackerController>(EventTrackerController);
    payloadTransformer = module.get<PayloadTransformer>(PayloadTransformer);
    googleAnalyticsService = module.get<GoogleAnalyticsService>(GoogleAnalyticsService);
    cleverTapService = module.get<CleverTapService>(CleverTapService);
    eventTrackerService = module.get<EventTrackerService>(EventTrackerService);
    facebookPixelService = module.get<FacebookPixelService>(FacebookPixelService);
    customerRepository = module.get<CustomerRepository>(CustomerRepository);
    axiosPostMock = jest.spyOn(axios, 'post').mockResolvedValue({ data: {} });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  jest.mock('axios', () => ({
    post: jest.fn()
  }));

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('PayloadTransformer', () => {
    it('should extract request details when all data is available', () => {
      jest.spyOn(fs, 'readFileSync').mockReturnValue('{"version": "1.0.0"}');
      const request = {
        headers: {
          // eslint-disable-next-line max-len
          'user-agent': 'Mozilla/5.0 (Linux; Android 10; Pixel 3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.1000.0 Mobile Safari/537.36',
          'x-forwarded-for': '103.15.252.98',
          referer: 'https://example.com',
          externalId: 'externalTestId'
        },
        connection: {
          remoteAddress: '103.15.252.98'
        },
        user: {
          id: 'testUserId'
        }
      };

      const result = payloadTransformer.extractRequestDetails(request);

      // eslint-disable-next-line max-len
      expect(result.userAgent).toBe('Mozilla/5.0 (Linux; Android 10; Pixel 3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.1000.0 Mobile Safari/537.36');
      expect(result.ipAddress).toBe('103.15.252.98');
      expect(result.referrerUrl).toBe('https://example.com');
      expect(result.city).toBe('Delhi');
      expect(result.country).toBe('IN');
      expect(result.browser).toBe('Chrome');
      expect(result.device_category).toBe('mobile');
      expect(result.device_brand).toBe('Google');
      expect(result.device_model).toBe('Pixel 3');
      expect(result.operating_system).toBe('Android');
      expect(result.platform).toBe('Android');
      expect(result.userId).toBe('testUserId');
      expect(result.externalId).toBe('externalTestId');
    });
  });

  it('should return domain and path object with correct values', () => {
    const validUrl = 'https://www.example.com/test-path';

    const result = payloadTransformer.extractDomainAndPath(validUrl);

    expect(result).toEqual({
      domain: 'www.example.com',
      path: '/test-path'
    });
  });

  it('should return domain and path object with null values', () => {
    const urlString = '';

    const result = payloadTransformer.extractDomainAndPath(urlString);

    expect(result).toEqual({
      domain: null,
      path: null
    });
  });

  it('should send event to Google Analytics with correct request body and headers', async () => {
    const event = { event_name: 'test_event', params: { card_mode: 'card_mode' } };
    const userInfo: any = {
      userAgent: 'Test User Agent',
      ipAddress: '127.0.0.1',
      referrerUrl: 'https://example.com',
      externalId: '123456'
    };

    await googleAnalyticsService.sendEventToGoogleAnalytics(event, userInfo);

    const expectedRequestBody = JSON.stringify({
      client_id: '123456',
      events: [{
        name: 'test_event',
        params: {
          card_mode: 'card_mode',
          engagement_time_msec: 1,
          externalId: '123456',
          userId: undefined,
          referrerUrl: 'https://example.com'
        }
      }],
      user_properties: {
        user_agent: { value: 'Test User Agent' },
        ip_address: { value: '127.0.0.1' }
      }
    });

    const expectedHeaders = {
      'Content-Type': 'application/json'
    };

    const expectedUrl = `${config.GA_API_URL}?measurement_id=${config.GA_MEASUREMENT_ID}`
    + `&api_secret=${config.GA_API_SECRET_KEY}`;

    expect(axiosPostMock).toHaveBeenCalledWith(expectedUrl, expectedRequestBody, { headers: expectedHeaders });
  });

  it('should handle missing user information gracefully', async () => {
    const event = { event_name: 'test_event', params: { card_mode: 'card_mode' } };
    const userInfo = null;

    await googleAnalyticsService.sendEventToGoogleAnalytics(event, userInfo);

    const expectedRequestBody = JSON.stringify({
      client_id: undefined,
      events: [{
        name: 'test_event',
        params: {
          card_mode: 'card_mode',
          engagement_time_msec: 1,
          externalId: undefined,
          userId: undefined,
          referrerUrl: undefined
        }
      }],
      user_properties: {}
    });

    const expectedHeaders = {
      'Content-Type': 'application/json'
    };

    const expectedUrl = `${config.GA_API_URL}?measurement_id=${config.GA_MEASUREMENT_ID}`
    + `&api_secret=${config.GA_API_SECRET_KEY}`;

    expect(axiosPostMock).toHaveBeenCalledWith(expectedUrl, expectedRequestBody, { headers: expectedHeaders });
  });

  describe('sendEventToFacebookPixel', () => {
    it('should send event to Facebook Pixel', async () => {
      const mockedAxiosPost = axios.post as jest.MockedFunction<typeof axios.post>;
      mockedAxiosPost.mockResolvedValueOnce({ data: 'success' });

      const userData: any = { email: 'test@example.com', phoneNumber: '1234567890' };
      jest.spyOn(customerRepository, 'getProfileDetailsById').mockResolvedValueOnce(userData);

      const event = { event_name: 'test_event', timestamp: new Date().toISOString() };
      const userInfo: any = {
        userId: '123',
        ipAddress: '127.0.0.1',
        userAgent: 'Test User Agent',
        referrerUrl: 'http://example.com',
        externalId: '456'
      };

      const response = await facebookPixelService.sendEventToFacebookPixel(event, userInfo);
      expect(response.data).toEqual('success');

      expect(mockedAxiosPost).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Object),
        { headers: { 'Content-Type': 'application/json' } }
      );
    });

    it('should handle missing user data', async () => {
      const mockedAxiosPost = axios.post as jest.MockedFunction<typeof axios.post>;
      mockedAxiosPost.mockResolvedValueOnce({ data: 'success' });

      jest.spyOn(customerRepository, 'getProfileDetailsById').mockResolvedValueOnce(null);

      const event = { event_name: 'test_event', timestamp: new Date().toISOString() };
      const userInfo: any = {
        userId: '123',
        ipAddress: '127.0.0.1',
        userAgent: 'Test User Agent',
        referrerUrl: 'http://example.com',
        externalId: '456'
      };

      const response = await facebookPixelService.sendEventToFacebookPixel(event, userInfo);
      expect(response.data).toEqual('success');
    });

    it('should include test event code in non-production environment', async () => {
      config.APP_ENV = 'development';

      jest.spyOn(customerRepository, 'getProfileDetailsById').mockResolvedValueOnce(null);

      const mockedAxiosPost = axios.post as jest.MockedFunction<typeof axios.post>;
      mockedAxiosPost.mockResolvedValueOnce({ data: 'success' });

      const event = { event_name: 'test_event', timestamp: new Date().toISOString() };
      const userInfo: any = {
        userId: '123',
        ipAddress: '127.0.0.1',
        userAgent: 'Test User Agent',
        referrerUrl: 'http://example.com',
        externalId: '456'
      };

      const response = await facebookPixelService.sendEventToFacebookPixel(event, userInfo);
      expect(response.data).toEqual('success');
    });
  });

  describe('sendEventToCleverTap', () => {
    it('should send event to CleverTap with valid event data', async () => {
      const mockedAxiosPost = axios.post as jest.MockedFunction<typeof axios.post>;
      mockedAxiosPost.mockResolvedValueOnce({ data: 'success' });

      const event = { event_name: 'test_event', params: { externalId: '123', userInfo: { userId: '456' } } };

      const response = await cleverTapService.sendEventToCleverTap(event);
      expect(response.data).toEqual('success');
    });
  });

  it('should save the data in db', async () => {
    const mockEvent = { event_name: 'TestEvent', params: { card_mode: 'card_mode' } };

    eventTrackerRepositoryMock.create.mockResolvedValue(true);

    await eventTrackerService.saveEvents(mockEvent);
    expect(eventTrackerRepositoryMock.create).toHaveBeenCalled();
  });
});
