import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AppModule } from '../app/app.module';
import { EventTrackerController } from './controllers/event-tracker.controller';
import { GoogleAnalyticsService } from './services/google-analytics.service';
import config from '../app/config';
import { EventTrackerRepository } from './repositories/event-tracker.repository';
import { EventTrackerEntity } from './entities/event-tracker.entity';
import { PayloadTransformer } from './transformers/event-tracker-payload.transformer';
import { CustomerModule } from '../customer/customer.module';
import { CleverTapService } from './services/clever-tap.service';
import { EventTrackerService } from './services/event-tracker.service';
import { FacebookPixelService } from './services/facebook-pixel.service';

@Module({
  imports: [
    AppModule,
    EventEmitterModule,
    CustomerModule,
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
    EventTrackerRepository,
    EventTrackerEntity,
    PayloadTransformer,
    CleverTapService,
    EventTrackerService,
    FacebookPixelService
  ]
})
export class EventTrackerModule {}
