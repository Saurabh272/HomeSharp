import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { validate } from 'class-validator';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PassportModule } from '@nestjs/passport';
import * as RedisMock from 'ioredis-mock';
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
import { JwtStrategy } from '../strategies/jwt.strategy';
import { CustomerEntity } from '../../customer/entities/customer.entity';
import { TokenDto } from '../dto/token.dto';
import { EmailOtpEvent } from '../events/email-otp.event';
import { EmailOtpListener } from '../listeners/email-otp.listener';
import { AddressEntity } from '../../app/entities/address.entity';
import { DeveloperEntity } from '../../developer/entities/developer.entity';
import { SeoPropertiesEntity } from '../../app/entities/seo-properties.entity';
import { SendOtpDto } from '../dto/send-otp.dto';
import { mockDb } from '../../app/tests/mock-providers';
import { Db } from '../../app/utils/db.util';
import { ProjectModule } from '../../project/project.module';
import { WishlistModule } from '../../wishlist/wishlist.module';
import { SmsEntity } from '../../app/entities/sms.entity';
import smsConfig from '../../app/config/sms.config';
import { AppModule } from '../../app/app.module';
import { MockOtpEntity } from '../../customer/entities/mock-otp.entity';
import config from '../../app/config';
import * as cookieUtils from '../../app/utils/cookie.util';

describe('Auth', () => {
  let controller: AuthController;
  let customerService: CustomerService;
  let otpService: OtpService;
  let validator: Validators;
  let tokenService: TokenService;
  let customerAttemptsRepository: CustomerAttemptsRepository;
  let customerRepository: CustomerRepository;

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
          ProjectModule,
          WishlistModule,
          AppModule
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
          DeveloperEntity,

          CustomerEntity,
          CustomerAttemptsEntity,
          AddressEntity,
          SeoPropertiesEntity,
          SmsEntity,
          MockOtpEntity,
          {
            provide: JwtService,
            useValue: {
              verifyAsync: jest.fn(),
              signAsync: jest.fn()
            }
          },

          mockDb
        ]
      })
      .overrideProvider(Db)
      .useValue(mockDb.useValue)
      .compile();

    tokenService = module.get<TokenService>(TokenService);
    controller = module.get<AuthController>(AuthController);
    customerService = module.get<CustomerService>(CustomerService);
    otpService = module.get<OtpService>(OtpService);
    validator = module.get<Validators>(Validators);
    customerAttemptsRepository = module.get<CustomerAttemptsRepository>(CustomerAttemptsRepository);
    customerRepository = module.get<CustomerRepository>(CustomerRepository);
  });

  describe('login', () => {
    it('should return email object if username is a valid email', () => {
      const username = 'test@example.com';
      const expectedLoginType = { email: username };
      const result = validator.loginType(username);

      expect(result).toEqual(expectedLoginType);
    });

    it('should return phoneNumber object if username is a valid phone number', () => {
      const username = '9876543210';
      const expectedLoginType = { phoneNumber: username };
      const result = validator.loginType(username);

      expect(result).toEqual(expectedLoginType);
    });

    it('should return null if username is neither a valid email nor a valid phone number', () => {
      const username = 'invalidUsername';
      const result = validator.loginType(username);

      expect(result).toBeNull();
    });

    it('should throw BadRequestException if loginType is invalid', async () => {
      const request: SendOtpDto = {
        username: 'example@example.com'
      };

      jest.spyOn(customerService, 'getByLoginType').mockRejectedValue(
        new BadRequestException('Invalid credentials')
      );

      await expect(controller.sendOtp(request)).rejects.toThrow(BadRequestException);
    });

    it('should return email if username is a valid email', () => {
      const username = 'test@example.com';
      const result = validator.loginType(username);

      expect(result).toEqual({ email: username });
    });

    it('should return phoneNumber if username is a valid phone number', () => {
      const username = '9865548454';
      const result = validator.loginType(username);

      expect(result).toEqual({ phoneNumber: username });
    });

    it('should return null if username is neither email nor phone number', () => {
      const username = 'invalid_username';
      const result = validator.loginType(username);

      expect(result).toBeNull();
    });
  });

  describe('refreshToken', () => {
    it('should refresh access and refresh tokens', async () => {
      const request: TokenDto = {
        refreshToken: 'refresh-token'
      };
      const id = 'customer-id';
      const accessToken = 'access-token';
      const refreshToken = 'new-refresh-token';

      jest.spyOn(tokenService, 'verifyRefreshToken').mockResolvedValue(id);
      jest.spyOn(tokenService, 'generateAccessToken').mockResolvedValue(accessToken);
      jest.spyOn(tokenService, 'generateRefreshToken').mockResolvedValue(refreshToken);

      const result = await controller.refreshToken(request);

      expect(tokenService.verifyRefreshToken).toHaveBeenCalledWith(request.refreshToken);
      expect(tokenService.generateAccessToken).toHaveBeenCalledWith({ id });
      expect(tokenService.generateRefreshToken).toHaveBeenCalledWith({ id });
      expect(result).toEqual({ accessToken, refreshToken });
    });

    it('should throw UnauthorizedException when refresh token verification fails', async () => {
      const request: TokenDto = {
        refreshToken: 'invalid-refresh-token'
      };

      jest
        .spyOn(tokenService, 'verifyRefreshToken')
        .mockRejectedValue(new UnauthorizedException('Session expired'));

      await expect(controller.refreshToken(request)).rejects.toThrow(UnauthorizedException);

      expect(tokenService.verifyRefreshToken).toHaveBeenCalledWith(request.refreshToken);
    });
  });

  describe('Logout', () => {
    it('should log out successfully', async () => {
      const mockReq: any = { user: { id: 'user-id' } };
      const mockRes: any = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        setHeader: jest.fn()
      };

      jest.spyOn(customerRepository, 'updateById').mockResolvedValueOnce();
      jest.spyOn(tokenService, 'revokeToken').mockResolvedValueOnce();
      jest.spyOn(cookieUtils, 'setCookie').mockImplementation(() => {});
      await controller.logout(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Logged out successfully' });
    });
  });

  describe('IsEmailOrPhone', () => {
    class ValidatorsMock extends Validators {
      public isEmail(): boolean {
        return true;
      }

      public isPhoneNumber(): boolean {
        return true;
      }
    }

    let validatorsMock: Validators;

    beforeEach(() => {
      validatorsMock = new ValidatorsMock();
    });

    describe('validate', () => {
      it('should return true for a valid email', async () => {
        jest.spyOn(validatorsMock, 'isEmail').mockReturnValue(true);
        const testObject = new SendOtpDto();
        testObject.username = 'test@example.com';
        const errors = await validate(testObject);

        expect(errors.length).toBe(0);
      });

      it('should return false for an invalid email and phone number', async () => {
        jest.spyOn(validatorsMock, 'isEmail').mockReturnValue(false);
        jest.spyOn(validatorsMock, 'isPhoneNumber').mockReturnValue(false);
        const testObject = new SendOtpDto();
        testObject.username = 'invalid';
        const errors = await validate(testObject);

        expect(errors.length).toBe(1);
        expect(errors[0].constraints).toEqual({
          isEmailOrPhone: 'Invalid email/phone number'
        });
      });
    });
  });

  describe('EmailOtpEvent', () => {
    it('should instantiate with the correct properties', () => {
      const otp = '123456';
      const email = 'test@example.com';

      const event = new EmailOtpEvent({ otp, email });

      expect(event).toBeInstanceOf(EmailOtpEvent);
      expect(event.otp).toBe(otp);
      expect(event.email).toBe(email);
    });

    it('should instantiate with undefined properties if no params are provided', () => {
      const event = new EmailOtpEvent(undefined);

      expect(event).toBeInstanceOf(EmailOtpEvent);
      expect(event.otp).toBeUndefined();
      expect(event.email).toBeUndefined();
    });
  });

  describe('calculateResendAttempts', () => {
    const dateUpdated = new Date().toISOString();

    it('should calculate resend attempts and return attempts', () => {
      const resendAttempts = 2;
      const result = otpService.calculateResendAttempts({ resendAttempts, dateUpdated });

      expect(result).toEqual(3);
    });

    it('should calculate resend attempts when attempts are not exceeded', () => {
      const resendAttempts = 2;
      const attempts = otpService.calculateResendAttempts({
        resendAttempts,
        dateUpdated
      });
      expect(attempts).toBe(resendAttempts + 1);
    });

    it('should throw BadRequestException when attempts are exceeded and lock-in period is not over', () => {
      try {
        otpService.calculateResendAttempts({
          resendAttempts: 14,
          dateUpdated
        });
      } catch (error) {
        expect(error.message).toBe('Too many requests');
      }
    });
  });

  describe('sendOtp', () => {
    const loginType = {
      email: 'test@example.com'
    };

    const loggerMock = {
      log: jest.fn()
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should create customer attempts and emit email.otp event on first sendOtp attempt', async () => {
      const mockCreate = jest.fn().mockResolvedValue({});
      const mockGetByLoginType = jest.fn().mockResolvedValue(undefined);
      const mockUpdateById = jest.fn();
      const mockEmit = jest.fn();

      jest.spyOn(customerAttemptsRepository, 'create').mockImplementation(mockCreate);
      jest.spyOn(customerAttemptsRepository, 'getByLoginType').mockImplementation(mockGetByLoginType);
      jest.spyOn(customerAttemptsRepository, 'updateById').mockImplementation(mockUpdateById);
      jest.spyOn(EventEmitter2.prototype, 'emit').mockImplementation(mockEmit);

      jest.spyOn(otpService, 'sendOtp').mockResolvedValue({ attemptsLeft: 10 });

      const result = await otpService.sendOtp(loginType);

      expect(mockUpdateById).not.toHaveBeenCalled();
      expect(result).toEqual({
        attemptsLeft: 10
      });
    });

    it('should print Lock-in period is over so resetting the resend attempts to 0', async () => {
      jest.mock('../utils/otp.util', () => ({
        isResendAttemptExceeded: jest.fn(),
        getResendAttempts: jest.fn(),
        isLockedInTime: jest.fn(),
        logger: loggerMock
      }));
      const resendAttempts = config.MAX_RESEND_OTP_ATTEMPTS + 1;
      const dateUpdated = new Date();
      dateUpdated.setDate(dateUpdated.getDate() - 1);

      jest.requireMock('../utils/otp.util').isResendAttemptExceeded.mockReturnValue(true);
      jest.requireMock('../utils/otp.util').isLockedInTime.mockReturnValue(true);

      const result = otpService.calculateResendAttempts({ resendAttempts, dateUpdated });
      expect(result).toBe(0);
    });

    it('should reset OTP attempts to 0 when attempts are exceeded but lock-in period is over', () => {
      const otpExpiresAt = new Date();
      otpExpiresAt.setDate(otpExpiresAt.getDate() + 1);
      const otpAttempts = 5;
      const dateUpdated = new Date();
      dateUpdated.setDate(dateUpdated.getDate() - 1);
      const expectedResult = 0;

      const result = otpService.calculateOtpAttempts.call(
        {
          logger: loggerMock
        },
        { otpExpiresAt, otpAttempts, dateUpdated }
      );

      expect(result).toEqual(expectedResult);
      expect(loggerMock.log).toHaveBeenCalledWith('Calculating OTP attempts');
      expect(loggerMock.log).toHaveBeenCalledWith('OTP attempts exceeded');
      expect(loggerMock.log).toHaveBeenCalledWith('Lock-in period is over so resetting the OTP attempts to 0');
    });

    it('should calculate OTP attempts and handle OTP expired error', () => {
      const otpExpiresAt = '2023-06-07T10:00:00.000Z';
      const otpAttempts = 2;
      const dateUpdated = new Date();

      jest.mock('../utils/otp.util', () => ({
        isOtpExpired: jest.fn().mockReturnValue(true),
        getOtpAttempts: jest.fn().mockReturnValue(otpAttempts),
        isOtpAttemptExceeded: jest.fn().mockReturnValue(false),
        isLockedInTime: jest.fn().mockReturnValue(true)
      }));

      expect(() => {
        otpService.calculateOtpAttempts({ otpExpiresAt, otpAttempts, dateUpdated });
      }).toThrow(UnauthorizedException);
    });

    describe('verify', () => {
      let customerAttemptsRepositoryMock: any;
      let customerRepositoryMock: any;

      beforeEach(() => {
        customerAttemptsRepositoryMock = {
          getByLoginType: jest.fn(),
          updateById: jest.fn()
        };
        customerRepositoryMock = {
          create: jest.fn()
        };
      });

      it('should verify the OTP and return the attemptId and payload', async () => {
        const otp = '123456';
        const customerId = '123';

        const customerAttempts = {
          id: 'attemptId',
          otp: '123456',
          otpExpiresAt: new Date(),
          otpAttempts: 0,
          dateUpdated: new Date()
        };
        customerAttemptsRepositoryMock.getByLoginType.mockResolvedValue(customerAttempts);

        const customer = { id: customerId };
        customerRepositoryMock.create.mockResolvedValue(customer);

        const calculateOtpAttemptsMock = jest.fn().mockReturnValue(2);

        const result = await otpService.verify.call(
          {
            customerAttemptsRepository: customerAttemptsRepositoryMock,
            customerRepository: customerRepositoryMock,
            logger: loggerMock,
            calculateOtpAttempts: calculateOtpAttemptsMock
          },
          { loginType, otp, customerId }
        );

        expect(result).toEqual({
          attemptId: 'attemptId',
          payload: { id: customerId },
          existingUser: true
        });
        expect(customerAttemptsRepositoryMock.getByLoginType).toHaveBeenCalledWith(loginType);
        expect(customerRepositoryMock.create).not.toHaveBeenCalled();
        expect(loggerMock.log).not.toHaveBeenCalled();
      });

      it('should throw an error when OTP is reset', async () => {
        const otp = '123456';
        const customerId = '123';

        const customerAttempts = {
          id: 'attemptId',
          otp: null
        };
        customerAttemptsRepositoryMock.getByLoginType.mockResolvedValue(customerAttempts);

        await expect(
          otpService.verify.call(
            {
              customerAttemptsRepository: customerAttemptsRepositoryMock,
              customerRepository: customerRepositoryMock,
              logger: loggerMock
            },
            { loginType, otp, customerId }
          )
        ).rejects.toThrowError('Please request a new OTP');

        expect(customerAttemptsRepositoryMock.getByLoginType).toHaveBeenCalledWith(loginType);
        expect(customerAttemptsRepositoryMock.updateById).not.toHaveBeenCalled();
        expect(customerRepositoryMock.create).not.toHaveBeenCalled();
        expect(loggerMock.log).toHaveBeenCalledWith('OTP was reset');
      });

      it('should create a new customer if customerId is not provided', async () => {
        const otp = '123456';
        const customerId = null;

        const customerAttempts = {
          id: 'attemptId',
          otp: '123456',
          otpExpiresAt: new Date(),
          otpAttempts: 0,
          dateUpdated: new Date()
        };
        customerAttemptsRepositoryMock.getByLoginType.mockResolvedValue(customerAttempts);

        const customer = { id: 'newCustomerId' };
        customerRepositoryMock.create.mockResolvedValue(customer);

        const calculateOtpAttemptsMock = jest.fn().mockReturnValue(2);

        const result = await otpService.verify.call(
          {
            customerAttemptsRepository: customerAttemptsRepositoryMock,
            customerRepository: customerRepositoryMock,
            logger: loggerMock,
            calculateOtpAttempts: calculateOtpAttemptsMock
          },
          { loginType, otp, customerId }
        );

        expect(result).toEqual({
          attemptId: 'attemptId',
          payload: { id: 'newCustomerId' },
          existingUser: false
        });
        expect(customerAttemptsRepositoryMock.getByLoginType).toHaveBeenCalledWith(loginType);
        expect(customerRepositoryMock.create).toHaveBeenCalledWith(loginType);
        expect(loggerMock.log).toHaveBeenCalledWith('Create a new customer');
      });

      it('should throw an error when an invalid OTP is provided', async () => {
        const otp = '123456';
        const customerId = '123';

        const customerAttempts = {
          id: 'attemptId',
          otp: '654321',
          otpExpiresAt: new Date(),
          otpAttempts: 1,
          dateUpdated: new Date()
        };
        customerAttemptsRepositoryMock.getByLoginType.mockResolvedValue(customerAttempts);

        const calculateOtpAttemptsMock = jest.fn().mockReturnValue(2);
        const getOtpAttemptsLeftMock = jest.fn().mockReturnValue(2);

        try {
          await otpService.verify.call(
            {
              customerAttemptsRepository: customerAttemptsRepositoryMock,
              customerRepository: customerRepositoryMock,
              logger: loggerMock,
              calculateOtpAttempts: calculateOtpAttemptsMock,
              getOtpAttemptsLeft: getOtpAttemptsLeftMock
            },
            { loginType, otp, customerId }
          );
        } catch (error) {
          expect(error).toBeInstanceOf(BadRequestException);
          expect(error.message).toBe('Invalid OTP provided');
          expect(customerAttemptsRepositoryMock.getByLoginType).toHaveBeenCalledWith(loginType);
          expect(customerAttemptsRepositoryMock.updateById).toHaveBeenCalledWith(
            customerAttempts.id,
            { otpAttempts: 2 }
          );
          expect(customerRepositoryMock.create).not.toHaveBeenCalled();
          expect(loggerMock.log).toHaveBeenCalledWith('Invalid OTP provided');
          expect(calculateOtpAttemptsMock).toHaveBeenCalledWith({
            otpExpiresAt: customerAttempts.otpExpiresAt,
            otpAttempts: customerAttempts.otpAttempts,
            dateUpdated: customerAttempts.dateUpdated
          });
        }
      });
    });
  });
});
