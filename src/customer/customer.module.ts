import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from '../auth/strategies/jwt.strategy';
import config from '../app/config';
import { CustomerRepository } from './repositories/customer.repository';
import { CustomerAttemptsRepository } from './repositories/customer-attempts.repository';
import { Transformer } from '../app/utils/transformer.util';
import { ProfileController } from './controllers/profile.controller';
import { CustomerService } from './services/customer.service';
import { CustomerEntity } from './entities/customer.entity';
import { CustomerAttemptsEntity } from './entities/customer-attempts.entity';
import { CustomerAttemptsService } from './services/customer-attempts.service';
import { Validators } from '../app/validators';
import { AppModule } from '../app/app.module';
import { WishlistEntity } from '../wishlist/entities/wishlist.entity';
import { WishlistProjectEntity } from '../wishlist/entities/wishlist-project.entity';
import { ProfileDetailTransformer } from './transformers/profile-details.transformer';
import { ProjectModule } from '../project/project.module';
import { DeveloperModule } from '../developer/developer.module';
import { ContactRepository } from './repositories/contact.repository';
import { ContactService } from './services/contact.service';
import { ContactAgentEntity } from './entities/contact-agent.entity';
import { ContactController } from './controllers/contact.controller';
import { ContactDeveloperEntity } from './entities/contact-developer.entity';
import { SupportRequestEntity } from './entities/support-request.entity';
import { InquiryEntity } from './entities/inquiry.entity';
import { FeedbackEntity } from './entities/feedback.entity';
import { ConnectRequestEntity } from './entities/connect-request.entity';
import { MockOtpEntity } from './entities/mock-otp.entity';
import { LeadEntity } from './entities/lead.entity';
import { LeadService } from './services/lead.service';
import { LeadRepository } from './repositories/lead.repository';
import { LeadCampaignEntity } from './entities/lead-campaign.entity';
import { LeadMediumEntity } from './entities/lead-medium.entity';
import { LeadSourceEntity } from './entities/lead-source.entity';

const providers = [
  CustomerRepository,
  CustomerAttemptsRepository,
  CustomerAttemptsService,
  CustomerAttemptsEntity,
  Validators,
  Transformer,
  CustomerService,
  CustomerEntity,
  JwtStrategy,
  WishlistEntity,
  WishlistProjectEntity,
  ProfileDetailTransformer,
  ContactRepository,
  ContactService,
  ContactAgentEntity,
  ContactDeveloperEntity,
  SupportRequestEntity,
  InquiryEntity,
  FeedbackEntity,
  ConnectRequestEntity,
  MockOtpEntity,
  LeadEntity,
  LeadCampaignEntity,
  LeadMediumEntity,
  LeadSourceEntity,
  LeadService,
  LeadRepository
];

@Module({
  imports: [
    AppModule,
    ProjectModule,
    DeveloperModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: config.ACCESS_TOKEN_SECRET,
      signOptions: {
        expiresIn: config.ACCESS_TOKEN_EXPIRES_IN
      }
    })
  ],
  controllers: [ProfileController, ContactController],
  providers,
  exports: providers
})
export class CustomerModule {}
