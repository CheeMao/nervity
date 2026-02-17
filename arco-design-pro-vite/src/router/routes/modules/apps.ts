import { DEFAULT_LAYOUT } from '../base';
import { AppRouteRecordRaw } from '../types';

const APPS: AppRouteRecordRaw = {
  path: '/apps',
  name: 'apps',
  component: DEFAULT_LAYOUT,
  meta: {
    locale: 'menu.apps',
    requiresAuth: true,
    icon: 'icon-apps',
    order: 3,
    permissions: ['app:read'],
  },
  children: [
    {
      path: 'list',
      name: 'AppsList',
      component: () => import('@/views/apps/list/index.vue'),
      meta: {
        locale: 'menu.apps.list',
        requiresAuth: true,
        permissions: ['app:read'],
      },
    },
  ],
};

export default APPS;
