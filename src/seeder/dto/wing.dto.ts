import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsOptional,
  Max,
  Min
} from 'class-validator';

export class WingDto {
  @ApiProperty({
    type: Number,
    description: 'Minimum Number of Wings to be seeded'
  })
  @IsOptional()
  @IsInt()
  @Min(1, { message: 'Minimum number of wings should be at least 1' })
  @Max(20, { message: 'Minimum number of wings should be at most 20' })
  min: number;

  @ApiProperty({
    type: Number,
    description: 'Maximum Number of Wings to be seeded'
  })
  @IsOptional()
  @IsInt()
  @Min(1, { message: 'Maximum number of wings should be at least 1' })
  @Max(20, { message: 'Maximum number of wings should be at most 20' })
  max: number;
}
