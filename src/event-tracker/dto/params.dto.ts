import { IsOptional, IsString } from 'class-validator';

export class ParamsDto {
  @IsOptional()
  @IsString()
  card_mode?: string;

  @IsOptional()
  @IsString()
  card_position?: string;

  @IsOptional()
  @IsString()
  page_name?: string;

  @IsOptional()
  @IsString()
  page_type?: string;

  @IsOptional()
  @IsString()
  property_id?: string;

  @IsOptional()
  @IsString()
  property_name?: string;

  @IsOptional()
  @IsString()
  tray_id?: string;

  @IsOptional()
  @IsString()
  tray_name?: string;

  @IsOptional()
  @IsString()
  tray_position?: string;

  @IsOptional()
  @IsString()
  tray_type?: string;

  @IsOptional()
  @IsString()
  userId?: string;
}
