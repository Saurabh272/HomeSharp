import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtOptionalGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.split(' ')[1];

    if (token) {
      try {
        const decodedToken = this.jwtService.verify(token);
        const userId = decodedToken.id;

        request.user = { id: userId };
      } catch (error) {
        return true;
      }
    }

    return true;
  }
}
