import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsUUID,
  Matches,
  ValidateNested
} from 'class-validator';
import { Type } from 'class-transformer';
import { VisitTypeDto } from './visit-type.dto';
import { DayDto } from './day.dto';

export class RescheduleTourDto {
  @ApiProperty({
    type: String,
    description: 'Tour ID'
  })
  @IsUUID(4, { message: 'Invalid Tour ID' })
  @IsNotEmpty({ message: 'Tour ID is required' })
  id: string;

  @ApiProperty({
    type: DayDto,
    description: 'Day'
  })
  @Type(() => DayDto)
  @ValidateNested({ each: true, groups: ['day'] })
  day: DayDto;

  @ApiProperty({
    type: String,
    description: 'Time Slot'
  })
  @IsString({ message: 'Invalid Time Slot' })
  @IsNotEmpty({ message: 'Time Slot is required' })
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'Invalid Time Slot' })
  timeSlot: string;

  @ApiProperty({
    type: VisitTypeDto,
    description: 'Visit Type'
  })
  @Type(() => VisitTypeDto)
  @ValidateNested({ each: true, groups: ['visitType'] })
  visitType: VisitTypeDto;
}
