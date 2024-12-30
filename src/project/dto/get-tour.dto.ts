import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

export class GetTourDto {
  @ApiProperty({
    type: String,
    description: 'Tour ID'
  })
  @IsUUID(4, { message: 'Invalid Tour ID' })
  @IsOptional()
  id?: string;
}
