import localeMessageBox from '@/components/message-box/locale/en-US';
import localeLogin from '@/views/login/locale/en-US';
import localeApps from '@/views/apps/locale/en-US';
import localeCards from '@/views/cards/locale/en-US';
import localeUsers from '@/views/users/locale/en-US';

import localeCloudFunctions from '@/views/cloud-functions/list/locale/en-US';
import localeRemoteVariables from '@/views/remote-variables/list/locale/en-US';
import localeEndUsers from '@/views/end-users/list/locale/en-US';
import localeRoles from '@/views/access-control/roles/locale/en-US';
import localeOperationLogs from '@/views/operation-logs/locale/en-US';
import localeBlacklist from '@/views/access-control/blacklist/locale/en-US';
import localeCardTypes from '@/views/card-types/locale/en-US';
import localeDocumentation from '@/views/documentation/locale/en-US';

import localeWorkplace from '@/views/dashboard/workplace/locale/en-US';

import localeUserSetting from '@/views/user/setting/locale/en-US';
import localeSettings from './en-US/settings';

export default {
  'menu.dashboard': 'Dashboard',
  'menu.server.dashboard': 'Dashboard-Server',
  'menu.server.workplace': 'Workplace-Server',
  'menu.server.monitor': 'Monitor-Server',
  'menu.cloud.resources': 'Cloud Resources',
  'menu.card.management': 'Users & Cards',
  'menu.user': 'User Center',
  'menu.documentation': 'Documentation',
  'menu.documentation.index': 'Guide',
  'documentation.tab.usage': 'System Usage',
  'documentation.tab.api': 'API Reference',
  'navbar.docs': 'Docs',
  'navbar.action.locale': 'Switch to English',
  ...localeSettings,
  ...localeMessageBox,
  ...localeLogin,
  ...localeWorkplace,

  ...localeUserSetting,

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
