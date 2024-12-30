import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class SendEmailDto {
  @ApiProperty({
    type: String,
    description: 'SWN Reference ID'
  })
  @IsString({ message: 'Invalid Ref ID' })
  swnRefNo: string;

  @ApiProperty({
    type: String,
    description: 'Email'
  })
  @IsString({ message: 'Invalid Email' })
  email: string;
}
