import { Injectable } from '@nestjs/common';
import * as UAParser from 'ua-parser-js';
import * as geoip from 'geoip-lite';
import * as fs from 'fs';
import * as path from 'path';
import { RequestDetails } from '../types/event-tracker.type';

@Injectable()
export class PayloadTransformer {
  public readonly PACKAGE_JSON_PATH = path.join(__dirname, '../../../../', 'package.json');

  extractRequestDetails(request: any): RequestDetails {
    const userAgent = request.headers['user-agent'] || null;
    const ipAddress = request.headers['x-forwarded-for'] || request.connection.remoteAddress;
    const referrerUrl = request.headers.referer || null;

    const geoData = geoip.lookup(ipAddress);
    const parser = new UAParser();
    const userAgentData = parser.setUA(userAgent).getResult();

    const appVersion = JSON.parse(fs.readFileSync(this.PACKAGE_JSON_PATH, 'utf-8')).version;

    return {
      userAgent,
      ipAddress: ipAddress.split(',')[0],
      referrerUrl,
      city: geoData?.city,
      country: geoData?.country,
      browser: userAgentData?.browser?.name,
      device_category: userAgentData?.device?.type,
      device_brand: userAgentData?.device?.vendor,
      device_model: userAgentData?.device?.model,
      os_with_version: `${userAgentData?.os?.name} ${userAgentData?.os?.version}`,
      operating_system: userAgentData?.os?.name,
      platform: userAgentData?.os?.name,
      app_version: appVersion,
      userId: request?.user?.id,
      externalId: request?.headers?.externalId
    };
  }

  extractDomainAndPath(urlString: string): { domain: string | null; path: string | null } {
    if (!urlString) {
      return { domain: null, path: null };
    }
    const parsedUrl = new URL(urlString);

    return {
      domain: parsedUrl.hostname,
      path: parsedUrl.pathname
    };
  }
}
