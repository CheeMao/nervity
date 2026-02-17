import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { PERMISSIONS_KEY } from "../decorators/require-permissions.decorator";

/**
 * Permissions Guard
 * Uses permissions from JWT payload (populated by auth.service during login)
 * For more efficient permission checking without database queries
 */
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

    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      return false;
    }

    // Get permissions from JWT payload (populated by auth.service)
    const userPermissions = user.permissions || [];

    // Check if user has all required permissions
    return requiredPermissions.every((permission) =>
      userPermissions.includes(permission),
    );
  }
}
