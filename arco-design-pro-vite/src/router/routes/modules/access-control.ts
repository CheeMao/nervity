import { DEFAULT_LAYOUT } from '../base';
import { AppRouteRecordRaw } from '../types';

const ACCESS_CONTROL: AppRouteRecordRaw = {
  path: '/access-control',
  name: 'access-control',
  component: DEFAULT_LAYOUT,
  meta: {
    locale: 'menu.access.control',
    icon: 'icon-safe',
    requiresAuth: true,
    order: 8,
    permissions: ['role:read'],
  },
  children: [
    {
      path: 'roles',
      name: 'RoleList',
      component: () => import('@/views/access-control/roles/index.vue'),
      meta: {
        locale: 'menu.access.control.roles',
        requiresAuth: true,
        permissions: ['role:read'],
      },
    },
    {
      path: 'blacklist',
      name: 'Blacklist',
      component: () => import('@/views/access-control/blacklist/index.vue'),
      meta: {
        locale: 'menu.access.control.blacklist',
        requiresAuth: true,
        permissions: ['blacklist:read'],
      },
    },
  ],
};

export default ACCESS_CONTROL;
