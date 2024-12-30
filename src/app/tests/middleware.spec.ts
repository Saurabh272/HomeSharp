import { Test, TestingModule } from '@nestjs/testing';
import { Request, Response } from 'express';
import { BadRequestException } from '@nestjs/common';
import { Base64DecodeMiddleware } from '../middleware/base64-decode.middleware';

describe('Middleware', () => {
  let base64DecodeMiddleware: Base64DecodeMiddleware;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Base64DecodeMiddleware]
    }).compile();

    base64DecodeMiddleware = module.get<Base64DecodeMiddleware>(Base64DecodeMiddleware);
  });

  describe('Base64DecodeMiddleware', () => {
    it('should decode base64 payload for valid application/json content type', () => {
      const req = {
        headers: { 'content-type': 'application/json' },
        body: {
          payload: Buffer.from(JSON.stringify({ key: 'value' })).toString('base64')
        }
      } as Request & { rawBody: Buffer };
      const res = {} as Response;
      const next = jest.fn();

      base64DecodeMiddleware.use(req, res, next);

      expect(req.body).toEqual({ key: 'value' });
      expect(next).toHaveBeenCalled();
    });

    it('should throw BadRequestException for invalid payload', () => {
      const req = {
        headers: { 'content-type': 'application/json' },
        body: {
          payload: null
        }
      } as Request;
      const res = {} as Response;
      const next = jest.fn();

      expect(() => base64DecodeMiddleware.use(req, res, next)).toThrow(BadRequestException);
      expect(next).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException for invalid base64 encoded data', () => {
      const req = {
        headers: { 'content-type': 'application/json' },
        body: {
          payload: 'InvalidBase64EncodedData'
        }
      } as Request & { rawBody: Buffer };
      const res = {} as Response;
      const next = jest.fn();

      expect(() => base64DecodeMiddleware.use(req, res, next)).toThrow(BadRequestException);
      expect(next).not.toHaveBeenCalled();
    });
  });
});
