import { IsNumber } from 'class-validator';

export class BoundsDto {
  @IsNumber()
  lat: number;

  @IsNumber()
  lng: number;
}
