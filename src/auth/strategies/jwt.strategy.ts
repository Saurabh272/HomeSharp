import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import config from '../../app/config';
import { JwtPayload } from '../interfaces/jwt.payload.interface';
import { CustomerRepository } from '../../customer/repositories/customer.repository';
import { UserInterface } from '../interfaces/user.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authRepository: CustomerRepository) {
    super({
      secretOrKey: config.ACCESS_TOKEN_SECRET,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
    });
  }

  async validate(payload: JwtPayload): Promise<UserInterface> {
    const { id } = payload;
    const validUser = await this.authRepository.getRefreshTokenById(id);

    if (!validUser) {
      throw new UnauthorizedException('Invalid User');
    }

    if (!validUser.refreshToken?.length) {
      throw new UnauthorizedException('Please login again.');
    }

    return validUser;
  }
}
