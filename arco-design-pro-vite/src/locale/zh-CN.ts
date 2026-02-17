import localeMessageBox from '@/components/message-box/locale/zh-CN';
import localeLogin from '@/views/login/locale/zh-CN';
import localeApps from '@/views/apps/locale/zh-CN';
import localeCards from '@/views/cards/locale/zh-CN';
import localeUsers from '@/views/users/locale/zh-CN';

import localeCloudFunctions from '@/views/cloud-functions/list/locale/zh-CN';
import localeRemoteVariables from '@/views/remote-variables/list/locale/zh-CN';
import localeEndUsers from '@/views/end-users/list/locale/zh-CN';
import localeRoles from '@/views/access-control/roles/locale/zh-CN';
import localeOperationLogs from '@/views/operation-logs/locale/zh-CN';
import localeBlacklist from '@/views/access-control/blacklist/locale/zh-CN';
import localeCardTypes from '@/views/card-types/locale/zh-CN';
import localeDocumentation from '@/views/documentation/locale/zh-CN';

import localeWorkplace from '@/views/dashboard/workplace/locale/zh-CN';
/** simple */

import localeUserSetting from '@/views/user/setting/locale/zh-CN';
/** simple end */
import localeSettings from './zh-CN/settings';

export default {
  'menu.dashboard': '仪表盘',
  'menu.server.dashboard': '仪表盘-服务端',
  'menu.server.workplace': '工作台-服务端',
  'menu.server.monitor': '实时监控-服务端',
  'menu.cloud.resources': '云资源',
  'menu.card.management': '用户与卡密',
  'menu.user': '个人中心',
  'menu.documentation': '系统文档',
  'menu.documentation.index': '使用指南',
  'documentation.tab.usage': '系统使用说明',
  'documentation.tab.api': 'API 文档',
  'navbar.docs': '文档中心',
  'navbar.action.locale': '切换为中文',
  // 通用按钮
  'button.save': '保存',
  'button.delete': '删除',
  'button.cancel': '取消',
  'button.confirm': '确认',
  'button.create': '新建',
  'button.edit': '编辑',
  'button.search': '搜索',
  'button.reset': '重置',
  'button.export': '导出',
  'button.import': '导入',
  ...localeSettings,
  ...localeMessageBox,
  ...localeLogin,
  ...localeWorkplace,
  /** simple */

  ...localeUserSetting,
  /** simple end */
  /** simple end */
  ...localeApps,
  ...localeCards,
  ...localeUsers,

  ...localeCloudFunctions,
  ...localeRemoteVariables,
  ...localeEndUsers,
  ...localeRoles,
  ...localeOperationLogs,
  ...localeBlacklist,
  ...localeCardTypes,
  ...localeDocumentation,
};
