import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class GetToursDto {
  @ApiProperty({
    type: Number,
    description: 'Page'
  })
  @IsNotEmpty()
  page: number;

  @ApiProperty({
    type: Number,
    description: 'Limit'
  })
  @IsNotEmpty()
  limit: number;
}
