import {
  Body,
  Controller,
  Logger,
  Post,
  Req,
  UseGuards,
  Res
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { throttlerConfig } from '../../app/config/throttler.config';
import cookieConfig from '../../app/config/cookie.config';
import { DeleteAccountDto } from '../dto/delete-account.dto';
import { VerifyOtpDto } from '../dto/verify-otp.dto';
import { TokenDto } from '../dto/token.dto';
import { ResendOtpDto } from '../dto/resend-otp.dto';
import { TokenService } from '../services/token.service';
import { SendOtpDto } from '../dto/send-otp.dto';
import { CustomerAttemptsService } from '../../customer/services/customer-attempts.service';
import { OtpService } from '../services/otp.service';
import { Validators } from '../../app/validators';
import { CustomerService } from '../../customer/services/customer.service';
import { UserInterface } from '../interfaces/user.interface';
import { setCookie } from '../../app/utils/cookie.util';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  public constructor(
    private readonly otpService: OtpService,
    private readonly tokenService: TokenService,
    private readonly customerService: CustomerService,
    private readonly customerAttemptsService: CustomerAttemptsService,
    private readonly validators: Validators
  ) {}

  @Throttle({ default: { limit: throttlerConfig.sendOtp.limit, ttl: throttlerConfig.sendOtp.ttl } })
  @Post('/send-otp')
  async sendOtp(@Body() request: SendOtpDto): Promise<{ attemptsLeft: number }> {
    const loginType = this.validators.loginType(request.username);

    await this.customerService.getByLoginType(loginType);
    const { attemptsLeft } = await this.otpService.sendOtp(loginType);

    return {
      attemptsLeft
    };
  }

  @Throttle({ default: { limit: throttlerConfig.resendOtp.limit, ttl: throttlerConfig.resendOtp.ttl } })
  @Post('/resend-otp')
  async resendOtp(@Body() request: ResendOtpDto) {
    const loginType = this.validators.loginType(request.username);

    const { attemptsLeft } = await this.otpService.sendOtp(loginType);

    return {
      attemptsLeft
    };
  }

  @Throttle({ default: { limit: throttlerConfig.verifyOtp.limit, ttl: throttlerConfig.verifyOtp.ttl } })
  @Post('/verify-otp')
  async verifyOtp(@Body() request: VerifyOtpDto) {
    const loginType = this.validators.loginType(request.username);

    const { customerData } = await this.customerService.getByLoginType(loginType);

    const { payload, attemptId, existingUser } = await this.otpService.verify({
      loginType,
      otp: request.otp,
      customerId: customerData?.id
    });

    const accessToken = await this.tokenService.generateAccessToken(payload);
    const refreshToken = await this.tokenService.generateRefreshToken(payload);

    this.logger.log('Resetting the attempts on successful login');
    await this.customerAttemptsService.resetAllAttempts(attemptId);

    return {
      accessToken,
      refreshToken,
      existingUser,
      profileCompleted: !!customerData?.name
    };
  }

  @Throttle({ default: { limit: throttlerConfig.refreshToken.limit, ttl: throttlerConfig.refreshToken.ttl } })
  @Post('/refresh-token')
  async refreshToken(@Body() request: TokenDto) {
    const id = await this.tokenService.verifyRefreshToken(request.refreshToken);

    const [accessToken, refreshToken] = await Promise.all([
      this.tokenService.generateAccessToken({ id }),
      this.tokenService.generateRefreshToken({ id })
    ]);

    return {
      accessToken,
      refreshToken
    };
  }

  @Post('/logout')
  @UseGuards(AuthGuard())
  async logout(@Req() req: { user: UserInterface }, @Res() res: Response) {
    try {
      await this.tokenService.revokeToken(req.user.id);

      setCookie(res, cookieConfig.externalUserIdCookieName, '');

      return res.json({
        message: 'Logged out successfully'
      });
    } catch (error) {
      this.logger.error('Error while revoking token on logout');
      this.logger.error(error);

      return res.status(500).json({
        message: 'Logout failure'
      });
    }
  }

  @Post('delete-account')
  @UseGuards(AuthGuard())
  async deactivateAccount(
    @Req() req: { user: UserInterface },
    @Body() request: DeleteAccountDto
  ) {
    await this.customerService.deactivateAccount(req.user.id, request.reason);
    this.logger.log(`Deleting customer account: ${req.user.id}`);

    return {
      message: 'Account deleted successfully'
    };
  }
}
