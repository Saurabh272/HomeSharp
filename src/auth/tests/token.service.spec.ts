import { Test } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as RedisMock from 'ioredis-mock';
import { BullModule } from '@nestjs/bullmq';
import { TokenService } from '../services/token.service';
import { Transformer } from '../../app/utils/transformer.util';
import { Validators } from '../../app/validators';
import { CustomerAttemptsEntity } from '../../customer/entities/customer-attempts.entity';
import { CustomerEntity } from '../../customer/entities/customer.entity';
import { CustomerAttemptsRepository } from '../../customer/repositories/customer-attempts.repository';
import { CustomerAttemptsService } from '../../customer/services/customer-attempts.service';
import { CustomerService } from '../../customer/services/customer.service';
import { OtpService } from '../services/otp.service';
import { JwtStrategy } from '../strategies/jwt.strategy';
import config from '../../app/config';
import { AddressEntity } from '../../app/entities/address.entity';
import { DeveloperEntity } from '../../developer/entities/developer.entity';
import { DirectusFilesEntity } from '../../app/entities/directus-file.entity';
import { SeoPropertiesEntity } from '../../app/entities/seo-properties.entity';
import { WishlistEntity } from '../../wishlist/entities/wishlist.entity';
import { mockDb } from '../../app/tests/mock-providers';
import { Db } from '../../app/utils/db.util';
import { SmsEntity } from '../../app/entities/sms.entity';
import { ProjectModule } from '../../project/project.module';
import smsConfig from '../../app/config/sms.config';
import { MockOtpEntity } from '../../customer/entities/mock-otp.entity';
import { CustomerRepository } from '../../customer/repositories/customer.repository';

describe('Token Service', () => {
  let tokenService: TokenService;
  let jwtService: any;
  let jwtServiceMock: any;
  let customerRepositoryMock: any;

  beforeEach(async () => {
    const module = await Test
      .createTestingModule({
        imports: [
          BullModule.registerQueue({
            name: smsConfig.smsQueue
          }),
          BullModule.forRoot({
            connection: new RedisMock()
          }),
          ProjectModule
        ],
        providers: [
          JwtStrategy,
          Validators,
          Transformer,
          EventEmitter2,
          TokenService,
          CustomerService,
          OtpService,
          CustomerAttemptsService,
          CustomerAttemptsRepository,
          CustomerEntity,
          CustomerAttemptsEntity,
          AddressEntity,
          DeveloperEntity,
          DirectusFilesEntity,
          SeoPropertiesEntity,
          WishlistEntity,
          SmsEntity,
          MockOtpEntity,
          JwtService,

          {
            provide: CustomerRepository,
            useValue: {
              updateToken: jest.fn(),
              updateCustomer: jest.fn(),
              getByEmail: jest.fn(),
              getByPhoneNumber: jest.fn(),
              getRefreshTokenById: jest.fn(),
              getProfileDetailsById: jest.fn()
            }
          },
          mockDb
        ]
      })
      .overrideProvider(Db)
      .useValue(mockDb.useValue)
      .compile();

    jwtServiceMock = {
      verifyAsync: jest.fn().mockResolvedValue({ id: 'customer-id' })
    };

    customerRepositoryMock = {
      getRefreshTokenById: jest.fn().mockResolvedValue({ id: 'customer-id', refreshToken: 'mocked-refresh-token' }),
      updateById: jest.fn().mockResolvedValue(true)
    };

    tokenService = module.get(TokenService);
    jwtService = module.get(JwtService);
  });

  describe('Access Token', () => {
    it('should generate a valid access token for a valid payload', async () => {
      const payload = { id: '12345' };
      const accessToken = await tokenService.generateAccessToken(payload);

      expect(accessToken).toBeDefined();
      expect(typeof accessToken).toBe('string');
    });

    it('should verify the properties within the generated access token', async () => {
      const payload = { id: '12345' };
      const accessToken = await tokenService.generateAccessToken(payload);

      const decodedToken = await jwtService.verifyAsync(accessToken, {
        secret: config.ACCESS_TOKEN_SECRET
      });

      expect(decodedToken).toHaveProperty('id', payload.id);
      expect(decodedToken).toHaveProperty('iat');
      expect(decodedToken).toHaveProperty('exp');
    });
  });

  describe('verifyRefreshToken', () => {
    beforeEach(() => {
      tokenService = new TokenService(
        null,
        null,
        customerRepositoryMock,
        null,
        null,
        jwtServiceMock,
        null
      );
    });

    it('should verify the refresh token and return the customer id', async () => {
      const refreshToken = 'mocked-refresh-token';
      const expectedResult = 'customer-id';

      const result = await tokenService.verifyRefreshToken(refreshToken);

      expect(result).toEqual(expectedResult);
      expect(jwtServiceMock.verifyAsync).toHaveBeenCalledWith(refreshToken, {
        secret: config.REFRESH_TOKEN_SECRET
      });
      expect(customerRepositoryMock.getRefreshTokenById).toHaveBeenCalledWith(expectedResult);
    });

    it('should throw an UnauthorizedException if the customer data is not found', async () => {
      const refreshToken = 'mocked-refresh-token';

      customerRepositoryMock.getRefreshTokenById.mockResolvedValueOnce(null);

      await expect(tokenService.verifyRefreshToken(refreshToken)).rejects.toThrowError(UnauthorizedException);

      expect(jwtServiceMock.verifyAsync).toHaveBeenCalledWith(refreshToken, {
        secret: config.REFRESH_TOKEN_SECRET
      });
      expect(customerRepositoryMock.getRefreshTokenById).toHaveBeenCalledWith('customer-id');
    });

    it('should revoke the token for the given customer ID', async () => {
      const customerId = 'customer-id';

      await tokenService.revokeToken(customerId);

      expect(customerRepositoryMock.updateById).toHaveBeenCalledWith(customerId, {
        refreshToken: null
      });
    });
  });
});
