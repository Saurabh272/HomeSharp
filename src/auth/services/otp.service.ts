import {
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException
} from '@nestjs/common';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import { JwtService } from '@nestjs/jwt';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  generateOtp,
  getOtpExpiryDate,
  getResendAttemptsLeft,
  isLockedInTime,
  isOtpExpired,
  isResendAttemptExceeded,
  isOtpAttemptExceeded,
  getResendAttempts,
  getOtpAttempts,
  getOtpAttemptsLeft
} from '../utils/otp.util';
import { BaseService } from './base.service';
import { CustomerEntity } from '../../customer/entities/customer.entity';
import { CustomerAttemptsEntity } from '../../customer/entities/customer-attempts.entity';
import { CustomerRepository } from '../../customer/repositories/customer.repository';
import { CustomerAttemptsRepository } from '../../customer/repositories/customer-attempts.repository';
import { Validators } from '../../app/validators';
import { EmailOtpEvent } from '../events/email-otp.event';
import { bullMqConfig } from '../../app/config/bullmq.config';
import smsConfig from '../../app/config/sms.config';

@Injectable()
export class OtpService extends BaseService {
  protected readonly logger = new Logger(OtpService.name);

  constructor(
    protected readonly customerEntity: CustomerEntity,
    protected readonly customerAttemptsEntity: CustomerAttemptsEntity,
    protected readonly customerRepository: CustomerRepository,
    protected readonly customerAttemptsRepository: CustomerAttemptsRepository,
    protected readonly validators: Validators,
    protected readonly jwtService: JwtService,
    protected readonly eventEmitter: EventEmitter2,
    @InjectQueue(smsConfig.smsQueue) private readonly smsQueue: Queue
  ) {
    super(
      customerEntity,
      customerAttemptsEntity,
      customerRepository,
      customerAttemptsRepository,
      validators,
      jwtService,
      eventEmitter
    );
  }

  public calculateResendAttempts({ resendAttempts, dateUpdated }) {
    this.logger.log('Calculating resend attempts');
    let attempts = getResendAttempts(resendAttempts);

    if (isResendAttemptExceeded(resendAttempts)) {
      this.logger.log('Resend attempts exceeded');
      if (dateUpdated && isLockedInTime(dateUpdated)) {
        this.logger.log('Lock-in period is not over yet');
        throw new BadRequestException('Too many requests');
      }

      this.logger.log('Lock-in period is over so resetting the resend attempts to 0');
      attempts = 0;
    }

    return attempts;
  }

  public async sendOtp(loginType: any) {
    const [customerAttempts, mockDataOtp] = await Promise.all([
      this.customerAttemptsRepository.getByLoginType(loginType),
      this.customerAttemptsRepository.getMockOtp(loginType)
    ]);

    const otp: string = mockDataOtp || generateOtp();

    let resendAttempts = 0;

    if (!customerAttempts?.[this.customerAttemptsEntity.id]) {
      this.logger.log('First signup attempt');
      await this.customerAttemptsRepository.create({
        otp,
        resendAttempts,
        otpAttempts: 0,
        otpExpiresAt: getOtpExpiryDate(),
        ...loginType
      });
    } else {
      this.logger.log('Another attempt of login/signup using the same credentials');
      resendAttempts = this.calculateResendAttempts({
        resendAttempts: customerAttempts.resendAttempts,
        dateUpdated: customerAttempts.dateUpdated
      });

      let otpAttempts = customerAttempts?.otpAttempts;

      if (!isLockedInTime(customerAttempts?.dateUpdated)) {
        otpAttempts = 0;
      }

      await this.customerAttemptsRepository.updateById(
        customerAttempts[this.customerAttemptsEntity.id],
        {
          otp,
          otpExpiresAt: getOtpExpiryDate(),
          resendAttempts,
          otpAttempts
        }
      );
    }

    if (loginType?.email) {
      this.eventEmitter.emit(
        'email.otp',
        new EmailOtpEvent({
          otp,
          ...loginType
        })
      );
    } else if (loginType?.phoneNumber && !mockDataOtp) {
      await this.smsQueue.add(smsConfig.sendSms, {
        otp,
        ...loginType,
        swnRefNo: smsConfig.otpSmsTemplate
      }, {
        ...bullMqConfig.smsQueue
      });
    }

    return {
      attemptsLeft: getResendAttemptsLeft(resendAttempts)
    };
  }

  public calculateOtpAttempts({ otpExpiresAt, otpAttempts, dateUpdated }): number {
    this.logger.log('Calculating OTP attempts');
    if (isOtpExpired(otpExpiresAt)) {
      this.logger.log('OTP expired');
      throw new UnauthorizedException({
        message: 'OTP Expired'
      });
    }

    let attempts = getOtpAttempts(otpAttempts);

    if (isOtpAttemptExceeded(attempts)) {
      this.logger.log('OTP attempts exceeded');
      if (isLockedInTime(dateUpdated)) {
        this.logger.log('Lock-in period is not over yet');
        throw new BadRequestException({
          message: 'Too many incorrect attempts.',
          attemptsLeft: getOtpAttemptsLeft(attempts)
        });
      }

      this.logger.log('Lock-in period is over so resetting the OTP attempts to 0');
      attempts = 0;
    }

    return attempts;
  }

  public async verify({ loginType, otp, customerId }: { loginType: object; otp: string; customerId?: string }) {
    const customerAttempts = await this.customerAttemptsRepository.getByLoginType(loginType);

    if (!customerAttempts?.otp) {
      this.logger.log('OTP was reset');
      throw new BadRequestException({
        message: 'Please request a new OTP'
      });
    }

    const otpAttempts = this.calculateOtpAttempts({
      otpExpiresAt: customerAttempts?.otpExpiresAt,
      otpAttempts: customerAttempts?.otpAttempts,
      dateUpdated: customerAttempts?.dateUpdated
    });

    if (otp !== customerAttempts.otp) {
      this.logger.log('Invalid OTP provided');

      await this.customerAttemptsRepository.updateById(customerAttempts.id, { otpAttempts });

      throw new BadRequestException({
        message: 'Invalid OTP provided',
        attemptsLeft: getOtpAttemptsLeft(otpAttempts)
      });
    }

    let existingUser = true;

    if (!customerId) {
      this.logger.log('Create a new customer');
      const customer = await this.customerRepository.create(loginType);
      customerId = customer?.id;
      existingUser = false;
    }

    return {
      attemptId: customerAttempts.id,
      payload: {
        id: customerId
      },
      existingUser
    };
  }
}
