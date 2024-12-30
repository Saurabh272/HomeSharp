import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { WingDto } from './wing.dto';

export class SeederDto {
  @ApiProperty({
    type: Number,
    description: 'Number of records to be seeded'
  })
  noOfDataToSeed: number;

  @ApiProperty({
    type: String,
    description: 'Collection name'
  })
  @IsOptional()
  collection?: string;

  @ApiProperty({
    type: String,
    description: 'Developer name'
  })
  @IsOptional()
  developer?: string;

  @ApiProperty({
    type: String,
    description: 'Micro market name'
  })
  @IsOptional()
  microMarket?: string;

  @ApiProperty({
    type: WingDto,
    description: 'Wing details'
  })
  @IsOptional()
  @Type(() => WingDto)
  @ValidateNested({ each: true, groups: ['wings'] })
  wings?: WingDto;
}
