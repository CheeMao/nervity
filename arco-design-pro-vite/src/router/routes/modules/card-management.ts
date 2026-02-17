import { DEFAULT_LAYOUT } from '../base';
import { AppRouteRecordRaw } from '../types';

const CARD_MANAGEMENT: AppRouteRecordRaw = {
  path: '/card-management',
  name: 'card-management',
  component: DEFAULT_LAYOUT,
  meta: {
    locale: 'menu.card.management',
    requiresAuth: true,
    icon: 'icon-idcard',
    order: 4,
    permissions: ['card:read', 'end-user:read'],
  },
  children: [
    {
      path: 'types',
      name: 'CardTypesList',
      component: () => import('@/views/card-types/list/index.vue'),
      meta: {
        locale: 'menu.cardTypes.list',
        requiresAuth: true,
        permissions: ['card-type:read'],
      },
    },
    {
      path: 'list',
      name: 'CardsList',
      component: () => import('@/views/cards/list/index.vue'),
      meta: {
        locale: 'menu.cards.list',
        requiresAuth: true,
        permissions: ['card:read'],
      },
    },
    {
      path: 'end-users',
      name: 'EndUserList',
      component: () => import('@/views/end-users/list/index.vue'),
      meta: {
        locale: 'menu.end.users.list',
        requiresAuth: true,
        permissions: ['end-user:read'],
      },
    },
  ],
};

export default CARD_MANAGEMENT;
