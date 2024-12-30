import { IsObject } from 'class-validator';

export class UtmDetailDto {
  @IsObject()
  payload: object;
}
