import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class VisitTypeDto {
  @ApiProperty({
    type: String,
    description: 'Visit Type'
  })
  @IsString({ message: 'Invalid Visit Type' })
  value: string;
}
