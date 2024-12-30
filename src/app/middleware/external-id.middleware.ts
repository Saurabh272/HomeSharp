import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { parse } from 'cookie';
import { v4 as uuidv4 } from 'uuid';
import { setCookie } from '../utils/cookie.util';
import cookieConfig from '../config/cookie.config';

@Injectable()
export class ExternalIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const cookies = parse(req?.headers?.cookie || '');
    let externalId = cookies[cookieConfig.externalUserIdCookieName];

    if (!externalId || externalId === '') {
      externalId = uuidv4();
      setCookie(res, cookieConfig.externalUserIdCookieName, externalId);
    }

    req.headers.externalId = externalId;

    next();
  }
}
