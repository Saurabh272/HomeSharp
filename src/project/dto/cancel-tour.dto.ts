import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional, IsString, IsUUID, ValidateNested
} from 'class-validator';
import { Type } from 'class-transformer';
import { CancellationReasonDto } from './cancellation-reason.dto';

export class CancelTourDto {
  @ApiProperty({
    type: String,
    description: 'Tour ID'
  })
  @IsUUID(4, { message: 'Invalid Tour ID' })
  id: string;

  @ApiProperty({
    type: CancellationReasonDto,
    description: 'Cancellation Reason'
  })
  @Type(() => CancellationReasonDto)
  @ValidateNested({ each: true, groups: ['cancellationReason'] })
  @IsOptional()
  cancellationReason?: CancellationReasonDto;

  @ApiProperty({
    type: String,
    description: 'Cancellation Reason Details'
  })
  @IsString({ message: 'Invalid Cancellation Reason Details' })
  @IsOptional()
  cancellationReasonDetails?: string;
}
