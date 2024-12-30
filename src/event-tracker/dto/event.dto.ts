import {
  IsOptional, IsString, IsObject, IsNotEmpty
} from 'class-validator';
import { Type } from 'class-transformer';
import { ParamsDto } from './params.dto';

export class EventDto {
  @IsString({ message: 'Invalid Event Id' })
  @IsNotEmpty({ message: 'Event Id is required' })
  event_id: string;

  @IsOptional()
  @IsString()
  timestamp?: string;

  @IsString({ message: 'Invalid Event Name' })
  @IsNotEmpty({ message: 'Event Name is required' })
  event_name: string;

  @IsOptional()
  @IsObject()
  @Type(() => ParamsDto)
  params?: ParamsDto;
}
