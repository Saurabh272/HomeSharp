import './tracer';
import { NestFactory } from '@nestjs/core';
import {
  SwaggerModule,
  DocumentBuilder,
  SwaggerDocumentOptions,
  OpenAPIObject
} from '@nestjs/swagger';
import { WinstonModule } from 'nest-winston';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { MainModule } from './main.module';
import { BadRequestExceptionFilter } from './app/exceptions/bad-request-filter.exception';
import { InternalServerErrorExceptionFilter } from './app/exceptions/internal-server-filter.exception';
import config from './app/config';
import {
  name,
  version,
  keywords,
  description
} from '../package.json';
import { createLoggerConfig } from './app/utils/logger.util';

async function bootstrap(): Promise<void> {
  const app: INestApplication = await NestFactory.create(MainModule, {
    logger: WinstonModule.createLogger(createLoggerConfig())
  });

  app.enableCors({
    origin: config.CORS_ALLOWED_ORIGINS.split(','),
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'traceparent', 'tracestate', 'Req-Fetch-Type']
  });

  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(
    new BadRequestExceptionFilter(),
    new InternalServerErrorExceptionFilter()
  );
  if (config.APP_ENV === 'local') {
    const docBuilder: Omit<OpenAPIObject, any> = new DocumentBuilder()
      .setTitle(name)
      .setDescription(description)
      .setVersion(version)
      .addTag(keywords.join(', '))
      .build();

    const options: SwaggerDocumentOptions = {
      operationIdFactory: (controllerKey: string, methodKey: string) => methodKey
    };

    const document: OpenAPIObject = SwaggerModule.createDocument(app, docBuilder, options);
    SwaggerModule.setup('api', app, document);
  }

  await app.listen(config.SERVICE_PORT);
}

bootstrap();
