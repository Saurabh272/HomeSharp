import { ApiProperty } from '@nestjs/swagger';
import { Matches } from 'class-validator';
import { IsEmailOrPhone } from '../decorators/isEmailOrPhone.decorator';

export class VerifyOtpDto {
  @ApiProperty({
    description: 'Email/Phone Number',
    type: 'string'
  })
  @IsEmailOrPhone()
  username: string;

  @ApiProperty({
    description: 'OTP',
    type: 'string'
  })
  @Matches(/^[0-9]{6}$/, { message: 'Invalid OTP' })
  otp: string;
}
