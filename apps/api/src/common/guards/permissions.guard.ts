import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }
    const ctx = GqlExecutionContext.create(context);
    const { user } = ctx.getContext().req;
    if (!user) {
      return false;
    }
    if (user.role === 'owner') {
      return true;
    }
    if (user.role !== 'staff') {
      return false;
    }
    const userPermissions: string[] = Array.isArray(user.permissions)
      ? user.permissions
      : [];
    return requiredPermissions.every((permission) =>
      userPermissions.includes(permission),
    );
  }
}
