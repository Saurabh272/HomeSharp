import {
  BadRequestException,
  Catch,
  Injectable,
  ArgumentsHost
} from '@nestjs/common';
import { Response } from 'express';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';

@Injectable()
@Catch(BadRequestException)
export class BadRequestExceptionFilter extends BadRequestException {
  /**
   * Catches all BadRequestException and flattens the validation error message if it's an array.
   *
   * This was required because of the custom decorator validation where ValidationPipe always
   * sends the validation message as an array
   */
  catch(exception: BadRequestException, host: ArgumentsHost) {
    const httpArgumentsHost: HttpArgumentsHost = host.switchToHttp();
    const response = httpArgumentsHost.getResponse<Response>();
    const status: number = exception.getStatus();
    const exceptionResponse: any = exception.getResponse();

    // Flatten the validation error message array
    const message = Array.isArray(exceptionResponse.message)
      ? { ...exceptionResponse, message: exceptionResponse.message.join(', ') }
      : exceptionResponse;

    response
      .status(status)
      .json(message);
  }
}
