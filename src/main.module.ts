import {
  Module, ValidationPipe, MiddlewareConsumer,
  NestModule, RequestMethod
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_PIPE } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { BullModule } from '@nestjs/bullmq';
import { AppModule } from './app/app.module';
import { AuthModule } from './auth/auth.module';
import { CustomerModule } from './customer/customer.module';
import { DataImporterModule } from './data-importer/data-importer.module';
import { DeveloperModule } from './developer/developer.module';
import { ProjectModule } from './project/project.module';
import { SeederModule } from './seeder/seeder.module';
import { VectorGeneratorModule } from './vector-generator/vector-generator.module';
import { WishlistModule } from './wishlist/wishlist.module';
import { RedisConnection } from './app/utils/redis.util';
import { EventTrackerModule } from './event-tracker/event-tracker.module';
import { Base64DecodeMiddleware } from './app/middleware/base64-decode.middleware';
import { ExternalIdMiddleware } from './app/middleware/external-id.middleware';
import { StatusCodeMiddleware } from './app/middleware/status-code-middleware';

@Module({
  imports: [
    ConfigModule.forRoot(),
    EventEmitterModule.forRoot(),
    BullModule.forRoot({
      connection: new RedisConnection().getConnection()
    }),
    AppModule,
    AuthModule,
    CustomerModule,
    DataImporterModule,
    DeveloperModule,
    EventTrackerModule,
    ProjectModule,
    SeederModule,
    VectorGeneratorModule,
    WishlistModule
  ],
  controllers: [],
  providers: [
    {
      provide: APP_PIPE,
      useClass: ValidationPipe
    }
  ],
  exports: []
})
export class MainModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(Base64DecodeMiddleware)
      .forRoutes({ path: 'track', method: RequestMethod.POST });

    consumer
      .apply(StatusCodeMiddleware, ExternalIdMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
