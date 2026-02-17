import { DEFAULT_LAYOUT } from '../base';
import { AppRouteRecordRaw } from '../types';

const USERS: AppRouteRecordRaw = {
  path: '/users',
  name: 'users',
  component: DEFAULT_LAYOUT,
  meta: {
    locale: 'menu.users',
    requiresAuth: true,
    icon: 'icon-user-group',
    order: 3,
    permissions: ['user:read'],
  },
  children: [
    {
      path: 'list',
      name: 'UsersList',
      component: () => import('@/views/users/list/index.vue'),
      meta: {
        locale: 'menu.users.list',
        requiresAuth: true,
        permissions: ['user:read'],
      },
    },
  ],
};

export default USERS;
