import { ApiProperty } from '@nestjs/swagger';
import { IsEmailOrPhone } from '../decorators/isEmailOrPhone.decorator';

export class SendOtpDto {
  @ApiProperty({
    type: String,
    description: 'Email/Phone Number'
  })
  @IsEmailOrPhone()
  username: string;
}
