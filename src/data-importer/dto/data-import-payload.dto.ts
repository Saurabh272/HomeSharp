import { ApiProperty } from '@nestjs/swagger';
import { number } from 'joi';
import { IsOptional } from 'class-validator';

export class DataImportPayload {
  @ApiProperty({
    type: number,
    description: 'Start Row Number'
  })
  @IsOptional()
  startRow: number;

  @ApiProperty({
    type: number,
    description: 'End Row Number'
  })
  @IsOptional()
  endRow: number;
}
