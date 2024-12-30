import { IsEnum, IsObject, IsOptional } from 'class-validator';
import { ConnectRequestConfig } from '../config/connect-request.config';

export class ConnectRequestDto {
  @IsEnum(ConnectRequestConfig.connectRequestTypes, {
    message: 'Required Data is Invalid or Incorrect'
  })
  type: string;

  @IsObject()
  @IsOptional()
  payload: object;
}
