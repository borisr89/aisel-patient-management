import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

import { Role } from '../../enums/role.enum';
import { JwtPayload } from '../../auth/interfaces/jwt-payload.interface';

type AuthenticatedRequest = Request & {
  user?: JwtPayload;
};

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    const token = this.extractBearerToken(request);

    if (!token) {
      throw new UnauthorizedException('Authentication token is required.');
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token);

      if (
        !payload.sub ||
        !payload.email ||
        !Object.values(Role).includes(payload.role)
      ) {
        throw new UnauthorizedException('Invalid authentication token.');
      }

      request.user = payload;

      return true;
    } catch {
      throw new UnauthorizedException(
        'Invalid or expired authentication token.',
      );
    }
  }

  private extractBearerToken(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];

    return type === 'Bearer' ? token : undefined;
  }
}
