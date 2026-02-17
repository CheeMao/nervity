import { DEFAULT_LAYOUT } from '../base';
import { AppRouteRecordRaw } from '../types';

const DOCUMENTATION: AppRouteRecordRaw = {
  path: '/documentation',
  name: 'documentation',
  component: DEFAULT_LAYOUT,
  meta: {
    locale: 'menu.documentation',
    requiresAuth: true,
    icon: 'icon-book',
    order: 99,
    permissions: ['documentation:read'],
  },
  children: [
    {
      path: 'index',
      name: 'Documentation',
      component: () => import('@/views/documentation/index.vue'),
      meta: {
        locale: 'menu.documentation.index',
        requiresAuth: true,
        permissions: ['documentation:read'],
      },
    },
  ],
};

export default DOCUMENTATION;
