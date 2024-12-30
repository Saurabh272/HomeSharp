import {
  Injectable, NestMiddleware, BadRequestException
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class Base64DecodeMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    if (!req.body || !req.body.payload) {
      throw new BadRequestException('Invalid payload');
    }

    if (req.body && req.body.payload && typeof req.body.payload === 'string') {
      try {
        req.body = JSON.parse(Buffer.from(req.body.payload, 'base64').toString('utf-8'));
      } catch (error) {
        throw new BadRequestException('Invalid Base64 Encoded Data');
      }
    }
    next();
  }
}
