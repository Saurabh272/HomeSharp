import {
  IsNotEmpty, IsString, IsOptional, IsObject
} from 'class-validator';
import { FiltersDto } from './saved-search-filter.dto';

export class SavedSearchDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsObject()
  @IsOptional()
  filters?: FiltersDto;
}
