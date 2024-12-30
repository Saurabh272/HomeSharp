import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import * as RedisMock from 'ioredis-mock';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PassportModule } from '@nestjs/passport';
import { BullModule } from '@nestjs/bullmq';
import { Validators } from '../../app/validators';
import { CustomerAttemptsRepository } from '../../customer/repositories/customer-attempts.repository';
import { CustomerAttemptsService } from '../../customer/services/customer-attempts.service';
import { Transformer } from '../../app/utils/transformer.util';
import { CustomerService } from '../../customer/services/customer.service';
import { CustomerAttemptsEntity } from '../../customer/entities/customer-attempts.entity';
import { TokenService } from '../services/token.service';
import { CustomerRepository } from '../../customer/repositories/customer.repository';
import { AuthController } from '../controllers/auth.controller';
import { OtpService } from '../services/otp.service';
import { SendOtpDto } from '../dto/send-otp.dto';
import { JwtStrategy } from '../strategies/jwt.strategy';
import { CustomerEntity } from '../../customer/entities/customer.entity';
import { EmailOtpEvent } from '../events/email-otp.event';
import { EmailOtpListener } from '../listeners/email-otp.listener';
import { AddressEntity } from '../../app/entities/address.entity';
import { DeveloperEntity } from '../../developer/entities/developer.entity';
import { DirectusFilesEntity } from '../../app/entities/directus-file.entity';
import { SeoPropertiesEntity } from '../../app/entities/seo-properties.entity';
import { WishlistEntity } from '../../wishlist/entities/wishlist.entity';
import config from '../../app/config';
import { ResendOtpDto } from '../dto/resend-otp.dto';
import { VerifyOtpDto } from '../dto/verify-otp.dto';
import { generateOtp, isOtpAttemptExceeded } from '../utils/otp.util';
import { mockDb } from '../../app/tests/mock-providers';
import { Db } from '../../app/utils/db.util';
import * as utils from '../utils/otp.util';
import { ProjectModule } from '../../project/project.module';
import { SmsEntity } from '../../app/entities/sms.entity';
import smsConfig from '../../app/config/sms.config';

describe('send otp', () => {
  let controller: AuthController;
  let customerService: CustomerService;
  let otpService: OtpService;
  let validator: Validators;
  let eventEmitter: EventEmitter2;
  let customerAttemptsService: CustomerAttemptsService;
  let tokenService: TokenService;
  let customerAttemptsRepository: CustomerAttemptsRepository;

  const customerAttemptsRepositoryMock = {
    getByLoginType: jest.fn(),
    updateById: jest.fn(),
    create: jest.fn(),
    getMockOtp: jest.fn()
  };

  beforeEach(async () => {
    const module: TestingModule = await Test
      .createTestingModule({
        imports: [
          PassportModule.register({ defaultStrategy: 'jwt' }),
          BullModule.registerQueue({
            name: smsConfig.smsQueue
          }),
          BullModule.forRoot({
            connection: new RedisMock()
          }),
          ProjectModule
        ],
        controllers: [AuthController],
        providers: [
          OtpService,
          CustomerService,
          TokenService,
          JwtStrategy,
          Validators,
          Transformer,
          EventEmitter2,
          EmailOtpListener,
          CustomerRepository,
          CustomerAttemptsRepository,
          CustomerAttemptsService,
          JwtService,
          CustomerEntity,
          CustomerAttemptsEntity,
          AddressEntity,
          DeveloperEntity,
          DirectusFilesEntity,
          SeoPropertiesEntity,
          WishlistEntity,
          SmsEntity,
          mockDb,
          { provide: CustomerAttemptsRepository, useValue: customerAttemptsRepositoryMock }
        ]
      })
      .overrideProvider(Db)
      .useValue(mockDb.useValue)
      .compile();

    controller = module.get<AuthController>(AuthController);
    customerService = module.get<CustomerService>(CustomerService);
    validator = module.get<Validators>(Validators);
    customerAttemptsRepository = module.get<CustomerAttemptsRepository>(CustomerAttemptsRepository);
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);
    tokenService = module.get<TokenService>(TokenService);
    controller = module.get<AuthController>(AuthController);
    customerService = module.get<CustomerService>(CustomerService);
    otpService = module.get<OtpService>(OtpService);
    validator = module.get<Validators>(Validators);
    customerAttemptsService = module.get<CustomerAttemptsService>(CustomerAttemptsService);
  });

  it('should return attemptsLeft when sendOtp is successful', async () => {
    const request: SendOtpDto = {
      username: 'example@example.com'
    };

    const getByLoginTypeSpy = jest
      .spyOn(customerService, 'getByLoginType')
      .mockResolvedValue({ customerData: null });

    const sendOtpSpy = jest
      .spyOn(otpService, 'sendOtp')
      .mockResolvedValue({ attemptsLeft: 3 });

    const result = await controller.sendOtp(request);

    const expectedResult = { email: 'example@example.com' };

    expect(getByLoginTypeSpy).toHaveBeenCalledWith(expectedResult);
    expect(sendOtpSpy).toHaveBeenCalledWith(expectedResult);
    expect(result).toEqual({ attemptsLeft: 3 });
  });

  it('should send OTP for first signup attempt', async () => {
    const loginType = { email: 'test@example.com' };
    jest
      .spyOn(customerAttemptsRepository, 'create')
      .mockResolvedValue(null);
    jest
      .spyOn(customerAttemptsRepository, 'getByLoginType')
      .mockResolvedValue(null);
    jest
      .spyOn(customerAttemptsRepository, 'getMockOtp')
      .mockResolvedValue('123456');
    const emitSpy = jest.spyOn(eventEmitter, 'emit');

    const result = await otpService.sendOtp(loginType);

    expect(emitSpy).toHaveBeenCalledWith('email.otp', expect.any(EmailOtpEvent));
    expect(result.attemptsLeft).toBe(+config.MAX_RESEND_OTP_ATTEMPTS);
  });

  it('should resend OTP for a valid email', async () => {
    const request: ResendOtpDto = { username: 'test@example.com' };
    const loginType = { email: 'test@example.com' };
    jest.spyOn(validator, 'loginType').mockReturnValue(loginType);
    jest.spyOn(otpService, 'sendOtp').mockResolvedValue({ attemptsLeft: 3 });

    const result = await controller.resendOtp(request);

    expect(validator.loginType).toHaveBeenCalledWith(request.username);
    expect(otpService.sendOtp).toHaveBeenCalledWith(loginType);
    expect(result).toEqual({ attemptsLeft: 3 });
  });

  it('should resend OTP for a valid phone number', async () => {
    const request: ResendOtpDto = { username: '1234567890' };
    const loginType = { phoneNumber: '1234567890' };
    jest.spyOn(validator, 'loginType').mockReturnValue(loginType);
    jest.spyOn(otpService, 'sendOtp').mockResolvedValue({ attemptsLeft: 3 });

    const result = await controller.resendOtp(request);

    expect(validator.loginType).toHaveBeenCalledWith(request.username);
    expect(otpService.sendOtp).toHaveBeenCalledWith(loginType);
    expect(result).toEqual({ attemptsLeft: 3 });
  });

  it('should verify OTP and return access and refresh tokens', async () => {
    const request: VerifyOtpDto = {
      username: 'test@example.com',
      otp: '123456'
    };
    const loginType = { email: request.username };
    const customerData = { id: '123' };
    const payload = { id: customerData.id };
    const attemptId = 'attempt123';
    const accessToken = 'access-token';
    const refreshToken = 'refresh-token';

    jest.spyOn(validator, 'loginType').mockReturnValue(loginType);
    jest.spyOn(customerService, 'getByLoginType').mockResolvedValue({ customerData });
    jest.spyOn(otpService, 'verify').mockResolvedValue({ payload, attemptId, existingUser: true });
    jest.spyOn(tokenService, 'generateAccessToken').mockResolvedValue(accessToken);
    jest.spyOn(tokenService, 'generateRefreshToken').mockResolvedValue(refreshToken);
    jest.spyOn(customerAttemptsService, 'resetAllAttempts').mockResolvedValue(true);

    const result = await controller.verifyOtp(request);

    expect(validator.loginType).toHaveBeenCalledWith(request.username);
    expect(customerService.getByLoginType).toHaveBeenCalledWith(loginType);
    expect(otpService.verify).toHaveBeenCalledWith({ loginType, otp: request.otp, customerId: customerData.id });
    expect(tokenService.generateAccessToken).toHaveBeenCalledWith(payload);
    expect(tokenService.generateRefreshToken).toHaveBeenCalledWith(payload);
    expect(customerAttemptsService.resetAllAttempts).toHaveBeenCalledWith(attemptId);
    expect(result).toEqual({
      accessToken,
      refreshToken,
      existingUser: true,
      profileCompleted: false
    });
  });

  it('should generate a random OTP within the correct range', () => {
    const otp = generateOtp();
    const parsedOtp = parseInt(otp, 10);

    expect(parsedOtp).toBeGreaterThanOrEqual(100000);
    expect(parsedOtp).toBeLessThanOrEqual(999999);
  });

  it('should return a string OTP', () => {
    const otp = generateOtp();

    expect(typeof otp).toBe('string');
  });

  it('should update the existing record for another attempt with phone number', async () => {
    const loginType = { phoneNumber: '+1234567890' };
    const getByLoginTypeSpy = jest.spyOn(customerAttemptsRepository, 'getByLoginType');
    getByLoginTypeSpy.mockResolvedValue({
      id: 'existingId',
      dateUpdated: new Date(),
      otp: '111111',
      otpExpiresAt: new Date(),
      resendAttempts: 1,
      otpAttempts: 2
    });

    jest.spyOn(customerAttemptsRepository, 'updateById');

    await otpService.sendOtp(loginType);

    expect(getByLoginTypeSpy).toHaveBeenCalledWith(loginType);
  });

  it('should handle another attempt of login/signup when customerAttempts exists', async () => {
    const loginType = { phoneNumber: '9876543210' };
    const existingCustomerAttempts: any = {
      id: 'existingId',
      dateUpdated: expect.any(Date),
      otp: '123456',
      otpExpiresAt: '2023-10-20T06:44:06.293Z',
      resendAttempts: 1,
      otpAttempts: 2
    };

    const getByLoginTypeSpy = jest
      .spyOn(customerAttemptsRepository, 'getByLoginType')
      .mockResolvedValue(existingCustomerAttempts);

    jest
      .spyOn(customerAttemptsRepository, 'updateById')
      .mockResolvedValue({});

    jest.spyOn(utils, 'generateOtp').mockReturnValue('123456');
    jest.spyOn(otpService, 'calculateResendAttempts').mockReturnValue(2);
    jest.spyOn(utils, 'getOtpAttempts').mockReturnValue(0);
    jest.spyOn(utils, 'isLockedInTime').mockReturnValue(false);

    const result = await otpService.sendOtp(loginType);

    expect(getByLoginTypeSpy).toHaveBeenCalledWith(loginType);
    expect(result.attemptsLeft).toBe(config.MAX_RESEND_OTP_ATTEMPTS - 2);
  });

  it('should reset otpAttempts to 0 when max attempts exceeded and not locked in time', async () => {
    const loginType = { phoneNumber: '9876543210' };
    const existingCustomerAttempts: any = {
      id: 'existingId',
      dateUpdated: expect.any(Date),
      otp: '123456',
      otpExpiresAt: '2023-10-20T06:44:06.293Z',
      resendAttempts: config.MAX_RESEND_OTP_ATTEMPTS,
      otpAttempts: config.MAX_OTP_ATTEMPTS
    };

    const getByLoginTypeSpy = jest
      .spyOn(customerAttemptsRepository, 'getByLoginType')
      .mockResolvedValue(existingCustomerAttempts);

    jest
      .spyOn(customerAttemptsRepository, 'updateById')
      .mockResolvedValue({});

    jest.spyOn(utils, 'generateOtp').mockReturnValue('123456');
    jest.spyOn(otpService, 'calculateResendAttempts').mockReturnValue(3);
    jest.spyOn(utils, 'isLockedInTime').mockReturnValue(false);
    jest.spyOn(utils, 'getResendAttemptsLeft').mockReturnValue(0);

    const result = await otpService.sendOtp(loginType);

    expect(getByLoginTypeSpy).toHaveBeenCalledWith(loginType);
    expect(result.attemptsLeft).toBe(0);
  });

  describe('isOtpAttemptExceeded', () => {
    it('should return true when OTP attempts equal MAX_OTP_ATTEMPTS', () => {
      const result = isOtpAttemptExceeded(+config.MAX_OTP_ATTEMPTS);
      expect(result).toBe(true);
    });

    it('should return true when OTP attempts exceed MAX_OTP_ATTEMPTS', () => {
      const result = isOtpAttemptExceeded(+config.MAX_OTP_ATTEMPTS + 1);
      expect(result).toBe(true);
    });

    it('should return false when OTP attempts are less than MAX_OTP_ATTEMPTS', () => {
      const result = isOtpAttemptExceeded(+config.MAX_OTP_ATTEMPTS - 1);
      expect(result).toBe(false);
    });

    it('should return false when OTP attempts are 0', () => {
      const result = isOtpAttemptExceeded(0);
      expect(result).toBe(false);
    });

    it('should return false when OTP attempts are negative', () => {
      const result = isOtpAttemptExceeded(-1);
      expect(result).toBe(false);
    });
  });
});
