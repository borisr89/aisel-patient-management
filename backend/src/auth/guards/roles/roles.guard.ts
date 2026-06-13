import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

import { ROLES_KEY } from '../../auth/decorators/roles.decorator';
import { Role } from '../../enums/role.enum';
import { JwtPayload } from '../../auth/interfaces/jwt-payload.interface';

type AuthenticatedRequest = Request & {
  user?: JwtPayload;
};

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles?.length) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    const user = request.user;

    if (!user) {
      return false;
    }

    return requiredRoles.includes(user.role);
  }
}
