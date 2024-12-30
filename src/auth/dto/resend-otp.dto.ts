import { ApiProperty } from '@nestjs/swagger';
import { IsEmailOrPhone } from '../decorators/isEmailOrPhone.decorator';

export class ResendOtpDto {
  @ApiProperty({
    description: 'Email/Phone Number',
    type: 'string'
  })
  @IsEmailOrPhone()
  username: string;
}
