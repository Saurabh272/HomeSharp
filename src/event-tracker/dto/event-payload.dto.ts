import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { EventDto } from './event.dto';

export class EventPayloadDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EventDto)
  events: EventDto[];
}
