import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import config from '../app/config';
import { AppModule } from '../app/app.module';
import { ProjectModule } from '../project/project.module';
import { DeveloperDetailController } from './controller/developer-detail.controller';
import { DeveloperDetailService } from './service/developer-detail.service';
import { DeveloperRepository } from './repository/developer.repository';
import { DeveloperEntity } from './entities/developer.entity';
import { DeveloperDetailTransformer } from './transformers/developer-detail.transformer';

@Module({
  controllers: [
    DeveloperDetailController
  ],
  imports: [
    AppModule,
    ProjectModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: config.ACCESS_TOKEN_SECRET,
      signOptions: {
        expiresIn: config.ACCESS_TOKEN_EXPIRY
      }
    })
  ],
  providers: [
    DeveloperDetailService,
    DeveloperEntity,
    DeveloperRepository,
    DeveloperDetailTransformer
  ],
  exports: [DeveloperEntity, DeveloperRepository]
})
export class DeveloperModule {}
