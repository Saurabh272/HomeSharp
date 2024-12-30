import {
  BadRequestException, Injectable, UnauthorizedException
} from '@nestjs/common';
import {
  createDirectus,
  readMe,
  readRole,
  rest,
  staticToken
} from '@directus/sdk'; import config from '../config';
import uploadConfig from '../config/upload.config';

@Injectable()
export class DirectusAuth {
  async directusConnection(token: string) {
    const connection: any = createDirectus(config.DIRECTUS_URL)
      .with(staticToken(token))
      .with(rest());

    return connection;
  }

  async checkAdminFunctionsPermission(authHeader: string) {
    const token = await this.getTokenFromHeader(authHeader);
    const connection = await this.directusConnection(token);
    const getUserDetails = await connection.request(readMe());
    const permission = await connection.request(readRole(getUserDetails?.role));

    if (uploadConfig.allowedRolesForAdminRoutes.includes(permission?.name)) {
      return true;
    }

    throw new UnauthorizedException('You don\'t have permission to access this');
  }

  async getTokenFromHeader(authHeader: string): Promise<string> {
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token: string = authHeader.split(' ')[1];
      return token;
    }

    throw new BadRequestException('Bearer Token is required');
  }
}
