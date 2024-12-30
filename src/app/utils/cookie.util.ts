import { serialize } from 'cookie';
import { Response } from 'express';
import config from '../config';

export const setCookie = (res: Response, name: string, value: string) => {
  const setCookieHeader = serialize(name, value, {
    maxAge: config.COOKIE_MAX_AGE,
    path: '/',
    httpOnly: true,
    secure: config.COOKIE_SECURE_SETTING,
    sameSite: config.COOKIE_SAME_SITE_SETTING
  });

  res.setHeader('Set-Cookie', setCookieHeader);
};
