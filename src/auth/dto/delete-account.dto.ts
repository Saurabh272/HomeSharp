import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class DeleteAccountDto {
  @ApiProperty({
    description: 'Reason for deleting account',
    type: 'string'
  })
  @IsString()
  @IsOptional()
  reason: string;
}
