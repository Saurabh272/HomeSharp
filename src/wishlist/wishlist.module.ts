import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import config from '../app/config';
import { CustomerRepository } from '../customer/repositories/customer.repository';
import { WishlistEntity } from './entities/wishlist.entity';
import { CustomerEntity } from '../customer/entities/customer.entity';
import { JwtStrategy } from '../auth/strategies/jwt.strategy';
import { WishlistController } from './controllers/wishlist.controller';
import { WishlistService } from './services/wishlist.service';
import { WishlistRepository } from './repositories/wishlist.repository';
import { Transformer } from '../app/utils/transformer.util';
import { AppModule } from '../app/app.module';
import { WishlistProjectEntity } from './entities/wishlist-project.entity';
import { ProjectModule } from '../project/project.module';

@Module({
  imports: [
    AppModule,
    ProjectModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: config.ACCESS_TOKEN_SECRET,
      signOptions: {
        expiresIn: config.ACCESS_TOKEN_EXPIRES_IN
      }
    })
  ],
  controllers: [WishlistController],
  providers: [
    WishlistService,
    WishlistRepository,
    Transformer,
    JwtStrategy,
    CustomerRepository,
    CustomerEntity,
    WishlistEntity,
    WishlistProjectEntity
  ],
  exports: [JwtStrategy, PassportModule]
})
export class WishlistModule {}
