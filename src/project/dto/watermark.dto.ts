import {
  IsArray,
  IsOptional,
  IsString,
  IsUUID,
  ValidateIf
} from 'class-validator';

export class WatermarkRequestDto {
  @ValidateIf((o) => o.imageIds !== undefined)
  @IsArray()
  @IsString({ each: true })
  @IsUUID(undefined, { each: true, message: 'Invalid UUID' })
  imageIds?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @IsUUID(undefined, { each: true })
  projectIds?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @IsUUID(undefined, { each: true, message: 'Invalid UUID' })
  developerIds?: string[];
}
