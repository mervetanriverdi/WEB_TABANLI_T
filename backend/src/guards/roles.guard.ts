import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RoleName } from '../roles/role-name.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<RoleName[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!roles || roles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as { role: RoleName };

    if (!user || !user.role) {
      throw new ForbiddenException('Bu islem icin yetkiniz yok.');
    }

    if (!roles.includes(user.role)) {
      throw new ForbiddenException('Bu islem icin yetkiniz yok.');
    }

    return true;
  }
}
