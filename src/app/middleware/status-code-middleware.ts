import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class StatusCodeMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const oldSend = res.send;
    res.send = function (data) {
      if (req.method === 'POST' && res.statusCode === 201) {
        res.status(200);
      }
      res.send = oldSend;
      return res.send(data);
    };
    next();
  }
}
