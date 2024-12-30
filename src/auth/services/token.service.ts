import {
  Injectable,
  Logger,
  UnauthorizedException
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { EventEmitter2 } from '@nestjs/event-emitter';
import config from '../../app/config';
import { JwtPayload } from '../interfaces/jwt.payload.interface';
import { BaseService } from './base.service';
import { CustomerEntity } from '../../customer/entities/customer.entity';
import { CustomerAttemptsEntity } from '../../customer/entities/customer-attempts.entity';
import { CustomerRepository } from '../../customer/repositories/customer.repository';
import { CustomerAttemptsRepository } from '../../customer/repositories/customer-attempts.repository';
import { Validators } from '../../app/validators';

@Injectable()
export class TokenService extends BaseService {
  protected readonly logger = new Logger(TokenService.name);

  constructor(
    protected readonly customerEntity: CustomerEntity,
    protected readonly customerAttemptsEntity: CustomerAttemptsEntity,
    protected readonly customerRepository: CustomerRepository,
    protected readonly customerAttemptsRepository: CustomerAttemptsRepository,
    protected readonly validators: Validators,
    protected readonly jwtService: JwtService,
    protected readonly eventEmitter: EventEmitter2
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

  async generateAccessToken(payload: JwtPayload): Promise<string> {
    return this.jwtService.signAsync(
      payload,
      {
        secret: config.ACCESS_TOKEN_SECRET,
        expiresIn: config.ACCESS_TOKEN_EXPIRES_IN
      }
    );
  }

  async generateRefreshToken(payload: JwtPayload): Promise<string> {
    const refreshToken = await this.jwtService.signAsync(
      payload,
      {
        secret: config.REFRESH_TOKEN_SECRET,
        expiresIn: config.REFRESH_TOKEN_EXPIRES_IN
      }
    );

    await this.customerRepository.updateToken(payload.id, refreshToken);

    return refreshToken;
  }

  public async verifyRefreshToken(refreshToken: string): Promise<string> {
    const payload: { id: string } = await this.jwtService.verifyAsync(refreshToken, {
      secret: config.REFRESH_TOKEN_SECRET
    });

    const customerData = await this.customerRepository.getRefreshTokenById(payload.id);

    if (customerData?.refreshToken !== refreshToken) {
      throw new UnauthorizedException('Session expired');
    }

    return customerData?.id;
  }

  async revokeToken(id: string) {
    await this.customerRepository.updateById(id, { refreshToken: null });
  }
}
