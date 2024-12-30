import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, Matches } from 'class-validator';
import { IsCustomValidWithOptions } from '../decorator/enquiry.decorator';

export class EnquiryRequestDto {
  @ApiProperty({
    description: 'Inquiry for contact us form',
    type: 'string'
  })

  @IsCustomValidWithOptions([{ minLength: 3, maxLength: 30, regex: /^[a-zA-Z\s]+$/ }])
  name: string;

  @IsCustomValidWithOptions([{ maxLength: 50, regex: /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/ }])
  email: string;

  @IsOptional()
  @IsString()
  @Matches(/^[a-zA-Z0-9\s]+$/, {
    message: 'Subject should not contain special characters'
  })
  subject?: string;
}
