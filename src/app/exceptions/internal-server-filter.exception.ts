import {
  ArgumentsHost, Catch, Injectable, InternalServerErrorException, Logger
} from '@nestjs/common';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { Response } from 'express';

@Injectable()
@Catch(InternalServerErrorException)
export class InternalServerErrorExceptionFilter extends InternalServerErrorException {
  private readonly logger = new Logger(InternalServerErrorExceptionFilter.name);

  catch(exception: InternalServerErrorException, host: ArgumentsHost) {
    this.logger.error(exception);
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
