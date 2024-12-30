import { Type } from 'class-transformer';
import {
  IsString, IsOptional, IsNumber, IsArray, ValidateNested
} from 'class-validator';
import { BoundsDto } from './saved-search-bound.dto';

export class FiltersDto {
  @IsArray()
  @IsOptional()
  bedRooms?: number[];

  @IsString()
  @IsOptional()
  searchString?: string;

  @IsString()
  @IsOptional()
  microMarket?: string;

  @IsArray()
  @IsOptional()
  microMarkets?: string[];

  @IsArray()
  @IsOptional()
  bathRooms?: number[];

  @IsString()
  @IsOptional()
  houseType?: string;

  @IsArray()
  @IsOptional()
  categories?: string[];

  @IsArray()
  @IsOptional()
  launchStatus?: string[];

  @IsArray()
  @IsOptional()
  price?: number[];

  @IsString()
  @IsOptional()
  developer?: string;

  @ValidateNested()
  @IsOptional()
  @Type(() => BoundsDto)
  bounds?: BoundsDto;

  @IsNumber()
  @IsOptional()
  distance?: number;
}
