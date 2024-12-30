import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { BullModule } from '@nestjs/bullmq';
import config from '../app/config';
import { AuthController } from './controllers/auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { TokenService } from './services/token.service';
import { OtpService } from './services/otp.service';
import { CustomerModule } from '../customer/customer.module';
import { AppModule } from '../app/app.module';
import { InfobipService } from '../app/services/infobip.service';
import { SmsProcessor } from '../app/processors/sms.processor';
import { DoveSoftService } from '../app/services/dove-soft.service';
import { FailureLogsRepository } from '../app/repositories/failure-logs.repository';
import { FailureLogsEntity } from '../app/entities/failure-logs.entity';
import smsConfig from '../app/config/sms.config';
import { SmsRetryProcessor } from '../app/processors/sms-retry.processor';

@Module({
  imports: [
    AppModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: config.ACCESS_TOKEN_SECRET,
      signOptions: {
        expiresIn: config.ACCESS_TOKEN_EXPIRES_IN
      }
    }),
    EventEmitterModule,
    CustomerModule,
    BullModule.registerQueue(
      {
        name: smsConfig.smsQueue
      },
      {
        name: smsConfig.smsRetryQueue
      }
    )
  ],
  controllers: [AuthController],
  providers: [
    OtpService,
    TokenService,
    JwtStrategy,
    InfobipService,
    SmsProcessor,
    SmsRetryProcessor,
    DoveSoftService,
    FailureLogsRepository,
    FailureLogsEntity
  ],
  exports: [JwtStrategy, PassportModule]
})
export class AuthModule { }
