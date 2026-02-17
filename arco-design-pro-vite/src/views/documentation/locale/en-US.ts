export default {
  'documentation.title': 'System Guide',
  'documentation.tab.overview': 'Overview',
  'documentation.tab.auth': 'Authentication',
  'documentation.tab.card': 'Card Management',
  'documentation.tab.device': 'Device Management',
  'documentation.tab.variable': 'Remote Variables',
  'documentation.tab.cloud': 'Cloud Functions',
  'documentation.tab.encryption': 'Data Encryption',

  // Overview
  'documentation.overview.baseInfo': 'Base Information',
  'documentation.overview.baseUrl': 'Base URL',
  'documentation.overview.baseUrlDesc': 'Base URL for all API requests',
  'documentation.overview.responseFormat': 'Response Format',
  'documentation.overview.responseFormatDesc':
    'All APIs use the following unified response format',
  'documentation.overview.responseStatus': 'status',
  'documentation.overview.responseStatusDesc': 'HTTP status code',
  'documentation.overview.responseCode': 'code',
  'documentation.overview.responseCodeDesc': 'Business code (20000=success)',
  'documentation.overview.responseMsg': 'msg',
  'documentation.overview.responseMsgDesc': 'Message',
  'documentation.overview.responseData': 'data',
  'documentation.overview.responseDataDesc': 'Response data',

  // Signature
  'documentation.signature.title': 'Signature Verification',
  'documentation.signature.required': 'Signature Required',
  'documentation.signature.requiredDesc':
    'The following endpoints require signature headers',
  'documentation.signature.headers': 'Signature Headers',
  'documentation.signature.headerAppId': 'Application ID',
  'documentation.signature.headerTimestamp': 'Timestamp (seconds)',
  'documentation.signature.headerTimestampDesc':
    'Current Unix timestamp, valid for ±60 seconds',
  'documentation.signature.headerNonce': 'Nonce',
  'documentation.signature.headerNonceDesc':
    'Random string to prevent replay attacks',
  'documentation.signature.headerSignature': 'Signature',
  'documentation.signature.headerSignatureDesc':
    'HMAC-SHA256 signature value (Hex)',
  'documentation.signature.algorithm': 'Signature Algorithm',
  'documentation.signature.step1': 'Build string to sign',
  'documentation.signature.step2': 'Calculate signature',
  'documentation.signature.example': 'Example Code',

  // Auth API
  'documentation.auth.title': 'Authentication Endpoints',
  'documentation.auth.register': 'User Registration',
  'documentation.auth.registerDesc': 'Register a new end user account',
  'documentation.auth.login': 'User Login',
  'documentation.auth.loginDesc': 'End user login to get access token',
  'documentation.auth.profile': 'Get User Profile',
  'documentation.auth.profileDesc': 'Get current logged-in user details',
  'documentation.auth.heartbeat': 'Client Heartbeat',
  'documentation.auth.heartbeatDesc':
    'Keep session alive, get latest user status',

  // Card API
  'documentation.card.title': 'Card Endpoints',
  'documentation.card.redeem': 'Card Redeem',
  'documentation.card.redeemDesc':
    'Redeem card code for activation or time recharge',
  'documentation.card.trial': 'Trial Activation',
  'documentation.card.trialDesc':
    'Apply for trial activation (once per device)',

  // Device API
  'documentation.device.title': 'Device Endpoints',
  'documentation.device.heartbeat': 'Device Heartbeat',
  'documentation.device.heartbeatDesc':
    'Report device online status, receive server commands',
  'documentation.device.checkOnline': 'Check Online Status',
  'documentation.device.checkOnlineDesc': 'Check if specified device is online',
  'documentation.device.getByHwid': 'Get Device Info',
  'documentation.device.getByHwidDesc': 'Query device details by HWID',
  'documentation.device.onlineCount': 'Online Device Count',
  'documentation.device.onlineCountDesc':
    'Get online device count for specified app',

  // Variable API
  'documentation.variable.title': 'Remote Variable Endpoints',
  'documentation.variable.getOne': 'Get Single Variable',
  'documentation.variable.getOneDesc': 'Get single remote variable by key',
  'documentation.variable.getList': 'Get Variable List',
  'documentation.variable.getListDesc':
    'Get all variables for app (array format)',
  'documentation.variable.getObject': 'Get Variable Object',
  'documentation.variable.getObjectDesc':
    'Get all variables for app (key-value format)',

  // Cloud API
  'documentation.cloud.title': 'Cloud Function Endpoints',
  'documentation.cloud.run': 'Execute Cloud Function',
  'documentation.cloud.runDesc': 'Trigger and execute specified cloud function',

  // Encryption API
  'documentation.encryption.title': 'Data Encryption',
  'documentation.encryption.publicKey': 'Get Public Key',
  'documentation.encryption.publicKeyDesc':
    'Get RSA public key for hybrid encryption',
  'documentation.encryption.hybrid': 'Hybrid Encryption Process',
  'documentation.encryption.hybridDesc':
    'RSA+AES hybrid encryption explanation',

  // Common
  'documentation.common.request': 'Request',
  'documentation.common.response': 'Response',
  'documentation.common.params': 'Parameters',
  'documentation.common.field': 'Field',
  'documentation.common.type': 'Type',
  'documentation.common.required': 'Required',
  'documentation.common.description': 'Description',
  'documentation.common.yes': 'Yes',
  'documentation.common.no': 'No',
  'documentation.common.example': 'Example',
  'documentation.common.note': 'Note',
  'documentation.common.method': 'Method',
  'documentation.common.path': 'Path',
  'documentation.common.auth': 'Auth',
};
