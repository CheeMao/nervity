import { DEFAULT_LAYOUT } from '../base';
import { AppRouteRecordRaw } from '../types';

const CLOUD_RESOURCES: AppRouteRecordRaw = {
  path: '/cloud-resources',
  name: 'cloud-resources',
  component: DEFAULT_LAYOUT,
  meta: {
    locale: 'menu.cloud.resources',
    icon: 'icon-cloud',
    requiresAuth: true,
    order: 3,
    permissions: ['cloud:read', 'variable:read'],
  },
  children: [
    {
      path: 'functions',
      name: 'CloudFunctionList',
      component: () => import('@/views/cloud-functions/list/index.vue'),
      meta: {
        locale: 'menu.cloud.functions.list',
        requiresAuth: true,
        permissions: ['cloud:read'],
      },
    },
    {
      path: 'variables',
      name: 'RemoteVariableList',
      component: () => import('@/views/remote-variables/list/index.vue'),
      meta: {
        locale: 'menu.remote.variables.list',
        requiresAuth: true,
        permissions: ['variable:read'],
      },
    },
  ],
};

export default CLOUD_RESOURCES;
