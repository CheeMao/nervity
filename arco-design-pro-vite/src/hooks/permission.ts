import { RouteLocationNormalized, RouteRecordRaw } from 'vue-router';
import { useUserStore } from '@/store';

export default function usePermission() {
  const userStore = useUserStore();

  return {
    /**
     * 检查用户是否可以访问路由
     * 支持两种权限模式：
     * 1. roles - 基于角色的权限控制（向后兼容）
     * 2. permissions - 基于权限代码的控制（推荐）
     */
    accessRouter(route: RouteLocationNormalized | RouteRecordRaw) {
      // 无需认证的路由
      if (!route.meta?.requiresAuth) {
        return true;
      }

      // 检查 permissions（优先）
      const requiredPermissions = route.meta?.permissions as
        | string[]
        | undefined;
      if (requiredPermissions && requiredPermissions.length > 0) {
        const userPermissions = userStore.permissions || [];
        // 只需拥有任一权限即可访问
        return requiredPermissions.some((p) => userPermissions.includes(p));
      }

      // 检查 roles（向后兼容）
      const requiredRoles = route.meta?.roles as string[] | undefined;
      if (!requiredRoles || requiredRoles.includes('*')) {
        return true;
      }
      return requiredRoles.includes(userStore.role);
    },

    /**
     * 检查用户是否拥有指定权限（用于按钮级别控制）
     */
    hasPermission(permission: string | string[]) {
      const userPermissions = userStore.permissions || [];
      if (Array.isArray(permission)) {
        return permission.some((p) => userPermissions.includes(p));
      }
      return userPermissions.includes(permission);
    },

    /**
     * 查找用户有权限访问的第一个路由
     */
    findFirstPermissionRoute(_routers: any, role = 'admin') {
      const cloneRouters = [..._routers];
      while (cloneRouters.length) {
        const firstElement = cloneRouters.shift();
        if (
          firstElement?.meta?.roles?.find((el: string[]) => {
            return el.includes('*') || el.includes(role);
          })
        )
          return { name: firstElement.name };
        if (firstElement?.children) {
          cloneRouters.push(...firstElement.children);
        }
      }
      return null;
    },
  };
}
