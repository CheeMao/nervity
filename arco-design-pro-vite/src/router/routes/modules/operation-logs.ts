import { DEFAULT_LAYOUT } from '../base';
import { AppRouteRecordRaw } from '../types';

const OPERATION_LOGS: AppRouteRecordRaw = {
  path: '/operation-logs',
  name: 'operationLogs',
  component: DEFAULT_LAYOUT,
  meta: {
    locale: 'menu.operation.logs',
    requiresAuth: true,
    icon: 'icon-file',
    order: 6,
    permissions: ['log:read'],
  },
  children: [
    {
      path: 'list',
      name: 'OperationLogsList',
      component: () => import('@/views/operation-logs/index.vue'),
      meta: {
        locale: 'menu.operation.logs.list',
        requiresAuth: true,
        permissions: ['log:read'],
      },
    },
  ],
};

export default OPERATION_LOGS;
