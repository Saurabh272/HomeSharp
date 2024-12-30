import {
  IsString, IsOptional, IsObject
} from 'class-validator';
import { FiltersDto } from './saved-search-filter.dto';

export class UpdateSavedSearchDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsObject()
  @IsOptional()
  filters?: FiltersDto;
}
