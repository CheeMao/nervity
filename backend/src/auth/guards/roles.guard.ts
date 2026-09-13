import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLES_KEY } from "../decorators/roles.decorator";
import { PERMISSIONS_KEY } from "../../access-control/decorators/require-permissions.decorator";

/**
 * Combined RBAC Guard
 * Supports both @Roles() decorator (backward compatible) and @RequirePermissions()
 * Priority: Permissions check > Roles check
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // First check for required permissions
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    const { user } = context.switchToHttp().getRequest();

    if (user?.type === "end_user") return false;
    if (user?.role === "admin") return true;

    // If permissions are required, check them from JWT payload
    if (requiredPermissions && requiredPermissions.length > 0) {
      if (!user) return false;

      const userPermissions = user.permissions || [];

      // Check if user has all required permissions
      return requiredPermissions.every((permission) =>
        userPermissions.includes(permission),
      );
    }

    // Fall back to role-based check for backward compatibility
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true; // 如果没有设置角色要求，允许访问
    }

    if (!user) return false;

    // Support both static role (enum) and dynamic role_name
    const userRole = user.role_name || user.role;
    return requiredRoles.some((role) => userRole === role || user.role === role);
  }
}
