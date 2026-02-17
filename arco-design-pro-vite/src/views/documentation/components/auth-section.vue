<template>
  <div class="auth-section">
    <a-typography>
      <a-typography-title :heading="2">用户认证接口</a-typography-title>
      <a-typography-paragraph>
        这些接口用于终端用户的注册、登录和会话管理。部分接口需要 Bearer Token
        认证。
      </a-typography-paragraph>
    </a-typography>

    <!-- 用户注册 -->
    <a-card class="api-card" title="POST /client/register">
      <template #extra>
        <a-tag color="green">公开接口</a-tag>
      </template>

      <a-descriptions :column="3" size="small" style="margin-bottom: 16px">
        <a-descriptions-item label="方法">POST</a-descriptions-item>
        <a-descriptions-item label="认证">无需</a-descriptions-item>
        <a-descriptions-item label="描述"
          >注册新的终端用户账号</a-descriptions-item
        >
      </a-descriptions>

      <a-typography-title :heading="5">请求参数</a-typography-title>
      <a-table :data="registerParams" :pagination="false" size="small">
        <template #columns>
          <a-table-column title="参数名" data-index="name" :width="120">
            <template #cell="{ record }">
              <code>{{ record.name }}</code>
            </template>
          </a-table-column>
          <a-table-column title="类型" data-index="type" :width="100" />
          <a-table-column title="必填" data-index="required" :width="80">
            <template #cell="{ record }">
              <a-tag :color="record.required ? 'red' : 'gray'" size="small">
                {{ record.required ? '是' : '否' }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="说明" data-index="desc" />
        </template>
      </a-table>

      <a-typography-title :heading="5" style="margin-top: 16px"
        >请求示例</a-typography-title
      >
      <a-card class="code-card">
        <pre class="code-block">
POST /api/client/register
Content-Type: application/json

{
  "username": "testuser",
  "password": "password123",
  "app_id": 1,
  "hwid": "DEVICE-HWID-001"
}</pre
        >
      </a-card>

      <a-typography-title :heading="5" style="margin-top: 16px"
        >响应示例</a-typography-title
      >
      <a-card class="code-card">
        <pre class="code-block">
{
  "status": 200,
  "code": 20000,
  "msg": "注册成功",
  "data": {
    "id": 1,
    "username": "testuser",
    "app_id": 1,
    "created_at": "2024-01-01T10:00:00.000Z"
  }
}</pre
        >
      </a-card>
    </a-card>

    <!-- 用户登录 -->
    <a-card class="api-card" title="POST /client/login">
      <template #extra>
        <a-tag color="green">公开接口</a-tag>
      </template>

      <a-descriptions :column="3" size="small" style="margin-bottom: 16px">
        <a-descriptions-item label="方法">POST</a-descriptions-item>
        <a-descriptions-item label="认证">无需</a-descriptions-item>
        <a-descriptions-item label="描述"
          >终端用户登录，获取访问令牌</a-descriptions-item
        >
      </a-descriptions>

      <a-typography-title :heading="5">请求参数</a-typography-title>
      <a-table :data="loginParams" :pagination="false" size="small">
        <template #columns>
          <a-table-column title="参数名" data-index="name" :width="120">
            <template #cell="{ record }">
              <code>{{ record.name }}</code>
            </template>
          </a-table-column>
          <a-table-column title="类型" data-index="type" :width="100" />
          <a-table-column title="必填" data-index="required" :width="80">
            <template #cell="{ record }">
              <a-tag :color="record.required ? 'red' : 'gray'" size="small">
                {{ record.required ? '是' : '否' }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="说明" data-index="desc" />
        </template>
      </a-table>

      <a-typography-title :heading="5" style="margin-top: 16px"
        >请求示例</a-typography-title
      >
      <a-card class="code-card">
        <pre class="code-block">
POST /api/client/login
Content-Type: application/json

{
  "username": "testuser",
  "password": "password123",
  "app_id": 1,
  "hwid": "DEVICE-HWID-001"
}</pre
        >
      </a-card>

      <a-typography-title :heading="5" style="margin-top: 16px"
        >响应示例</a-typography-title
      >
      <a-card class="code-card">
        <pre class="code-block">
{
  "status": 200,
  "code": 20000,
  "msg": "登录成功",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "username": "testuser",
      "app_id": 1,
      "expire_time": "2025-01-01T10:00:00.000Z",
      "is_active": true,
      "max_devices": 3
    },
    "heart_interval": 60,
    "heartbeat_timeout": 180,
    "is_valid": true,
    "expire_time": "2025-01-01T10:00:00.000Z",
    "valid_message": ""
  }
}</pre
        >
      </a-card>

      <a-alert type="info" style="margin-top: 16px">
        登录成功后，请将 access_token 保存，后续需要 Token
        认证的接口需要在请求头中携带：
        <code>Authorization: Bearer {access_token}</code>
      </a-alert>
    </a-card>

    <!-- 获取用户信息 -->
    <a-card class="api-card" title="GET /client/profile">
      <template #extra>
        <a-tag color="blue">需要 Token</a-tag>
      </template>

      <a-descriptions :column="3" size="small" style="margin-bottom: 16px">
        <a-descriptions-item label="方法">GET</a-descriptions-item>
        <a-descriptions-item label="认证">Bearer Token</a-descriptions-item>
        <a-descriptions-item label="描述"
          >获取当前登录用户的详细信息</a-descriptions-item
        >
      </a-descriptions>

      <a-typography-title :heading="5">请求头</a-typography-title>
      <a-table :data="profileHeaders" :pagination="false" size="small">
        <template #columns>
          <a-table-column title="Header" data-index="name" :width="150">
            <template #cell="{ record }">
              <code>{{ record.name }}</code>
            </template>
          </a-table-column>
          <a-table-column title="必填" data-index="required" :width="80">
            <template #cell>
              <a-tag color="red" size="small">是</a-tag>
            </template>
          </a-table-column>
          <a-table-column title="说明" data-index="desc" />
        </template>
      </a-table>

      <a-typography-title :heading="5" style="margin-top: 16px"
        >请求示例</a-typography-title
      >
      <a-card class="code-card">
        <pre class="code-block">
GET /api/client/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...</pre
        >
      </a-card>

      <a-typography-title :heading="5" style="margin-top: 16px"
        >响应示例</a-typography-title
      >
      <a-card class="code-card">
        <pre class="code-block">
{
  "status": 200,
  "code": 20000,
  "msg": "获取成功",
  "data": {
    "id": 1,
    "username": "testuser",
    "hwid": "DEVICE-HWID-001",
    "app_id": 1,
    "expire_time": "2025-01-01T10:00:00.000Z",
    "is_active": true,
    "max_devices": 1,
    "last_login": "2024-01-01T10:00:00.000Z",
    "created_at": "2024-01-01T08:00:00.000Z"
  }
}</pre
        >
      </a-card>
    </a-card>

    <!-- 客户端心跳 -->
    <a-card class="api-card" title="PUT /client/heartbeat">
      <template #extra>
        <a-tag color="blue">需要 Token</a-tag>
      </template>

      <a-descriptions :column="3" size="small" style="margin-bottom: 16px">
        <a-descriptions-item label="方法">PUT</a-descriptions-item>
        <a-descriptions-item label="认证">Bearer Token</a-descriptions-item>
        <a-descriptions-item label="描述"
          >保持会话活跃，获取用户最新状态</a-descriptions-item
        >
      </a-descriptions>

      <a-alert type="warning" style="margin-bottom: 16px">
        建议客户端按照返回的 <code>interval</code> 间隔（默认60秒）
        调用此接口，用于保持会话活跃并检测用户状态变化。
      </a-alert>

      <a-typography-title :heading="5">请求参数</a-typography-title>
      <a-table :data="heartbeatParams" :pagination="false" size="small">
        <template #columns>
          <a-table-column title="参数名" data-index="name" :width="120">
            <template #cell="{ record }">
              <code>{{ record.name }}</code>
            </template>
          </a-table-column>
          <a-table-column title="类型" data-index="type" :width="100" />
          <a-table-column title="必填" data-index="required" :width="80">
            <template #cell="{ record }">
              <a-tag :color="record.required ? 'red' : 'gray'" size="small">
                {{ record.required ? '是' : '否' }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="说明" data-index="desc" />
        </template>
      </a-table>

      <a-typography-title :heading="5" style="margin-top: 16px"
        >请求示例</a-typography-title
      >
      <a-card class="code-card">
        <pre class="code-block">
PUT /api/client/heartbeat
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "hwid": "DEVICE-HWID-001",
  "device_name": "我的电脑"
}</pre
        >
      </a-card>

      <a-typography-title :heading="5" style="margin-top: 16px"
        >响应示例</a-typography-title
      >
      <a-card class="code-card">
        <pre class="code-block">
{
  "status": 200,
  "code": 20000,
  "msg": "心跳成功",
  "data": {
    "success": true,
    "is_active": true,
    "expire_time": "2025-01-01T10:00:00.000Z",
    "username": "testuser",
    "max_devices": 3,
    "bound_devices": 1,
    "interval": 60,
    "heartbeat_timeout": 180,
    "server_time": 1704067200000,
    "commands": [],
    "message": ""
  }
}</pre
        >
      </a-card>

      <a-typography-title :heading="5" style="margin-top: 16px"
        >响应字段说明</a-typography-title
      >
      <a-table :data="heartbeatResponseFields" :pagination="false" size="small">
        <template #columns>
          <a-table-column title="字段" data-index="name" :width="120">
            <template #cell="{ record }">
              <code>{{ record.name }}</code>
            </template>
          </a-table-column>
          <a-table-column title="类型" data-index="type" :width="100" />
          <a-table-column title="说明" data-index="desc" />
        </template>
      </a-table>
    </a-card>

    <!-- 查询到期时间 -->
    <a-card class="api-card" title="GET /client/expire-time">
      <template #extra>
        <a-tag color="blue">需要 Token</a-tag>
      </template>

      <a-descriptions :column="3" size="small" style="margin-bottom: 16px">
        <a-descriptions-item label="方法">GET</a-descriptions-item>
        <a-descriptions-item label="认证">Bearer Token</a-descriptions-item>
        <a-descriptions-item label="描述"
          >查询当前用户的授权状态和到期时间</a-descriptions-item
        >
      </a-descriptions>

      <a-typography-title :heading="5">请求示例</a-typography-title>
      <a-card class="code-card">
        <pre class="code-block">
GET /api/client/expire-time
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...</pre
        >
      </a-card>

      <a-typography-title :heading="5" style="margin-top: 16px"
        >响应示例</a-typography-title
      >
      <a-card class="code-card">
        <pre class="code-block">
{
  "status": 200,
  "code": 20000,
  "msg": "获取成功",
  "data": {
    "username": "testuser",
    "is_valid": true,
    "is_active": true,
    "expire_time": "2025-01-01T10:00:00.000Z",
    "expire_timestamp": 1735689599,
    "remaining_seconds": 86400,
    "valid_message": ""
  }
}</pre
        >
      </a-card>

      <a-typography-title :heading="5" style="margin-top: 16px"
        >响应字段说明</a-typography-title
      >
      <a-table :data="expireTimeFields" :pagination="false" size="small">
        <template #columns>
          <a-table-column title="字段" data-index="name" :width="120">
            <template #cell="{ record }">
              <code>{{ record.name }}</code>
            </template>
          </a-table-column>
          <a-table-column title="类型" data-index="type" :width="100" />
          <a-table-column title="说明" data-index="desc" />
        </template>
      </a-table>

      <a-alert type="info" style="margin-top: 16px">
        <template #message>
          <strong>is_valid 判断逻辑：</strong>
          <ul style="margin: 8px 0 0 0; padding-left: 20px">
            <li><code>is_active = false</code> → "账号已被禁用"</li>
            <li><code>expire_time = null</code> → "未激活，请充值"</li>
            <li><code>expire_time &lt; now</code> → "授权已过期"</li>
            <li>其他 → is_valid = true</li>
          </ul>
        </template>
      </a-alert>
    </a-card>
  </div>
</template>

<script lang="ts" setup>
  const registerParams = [
    {
      name: 'username',
      type: 'string',
      required: true,
      desc: '用户名，3-50个字符',
    },
    {
      name: 'password',
      type: 'string',
      required: true,
      desc: '密码，最少6个字符',
    },
    { name: 'app_id', type: 'number', required: true, desc: '应用ID' },
    {
      name: 'hwid',
      type: 'string',
      required: false,
      desc: '设备硬件ID（可选，登录时绑定）',
    },
    {
      name: 'device_name',
      type: 'string',
      required: false,
      desc: '设备名称（友好名称，如"我的电脑"）',
    },
  ];

  const loginParams = [
    { name: 'username', type: 'string', required: true, desc: '用户名' },
    { name: 'password', type: 'string', required: true, desc: '密码' },
    { name: 'app_id', type: 'number', required: true, desc: '应用ID' },
    {
      name: 'hwid',
      type: 'string',
      required: true,
      desc: '设备硬件ID（必填，用于设备绑定验证）',
    },
    {
      name: 'device_name',
      type: 'string',
      required: false,
      desc: '设备名称（友好名称，如"我的电脑"）',
    },
  ];

  const profileHeaders = [
    { name: 'Authorization', required: true, desc: 'Bearer {access_token}' },
  ];

  const heartbeatParams = [
    {
      name: 'hwid',
      type: 'string',
      required: true,
      desc: '设备硬件ID（必须与登录时一致）',
    },
    {
      name: 'device_name',
      type: 'string',
      required: false,
      desc: '设备名称（可更新设备的友好名称）',
    },
  ];

  const heartbeatResponseFields = [
    { name: 'success', type: 'boolean', desc: '心跳是否成功' },
    { name: 'is_active', type: 'boolean', desc: '用户账号是否有效（未过期且未禁用）' },
    { name: 'expire_time', type: 'string', desc: '到期时间 (ISO 8601格式)' },
    { name: 'username', type: 'string', desc: '用户名' },
    { name: 'max_devices', type: 'number', desc: '最大设备绑定数' },
    { name: 'bound_devices', type: 'number', desc: '已绑定设备数' },
    { name: 'interval', type: 'number', desc: '建议心跳间隔（秒）' },
    { name: 'heartbeat_timeout', type: 'number', desc: '心跳超时时间（秒）' },
    { name: 'server_time', type: 'number', desc: '服务器时间戳（毫秒）' },
    { name: 'commands', type: 'array', desc: '服务器命令，如 ["force_logout"]' },
    { name: 'message', type: 'string', desc: '状态说明（无效时显示原因）' },
  ];

  const expireTimeFields = [
    { name: 'username', type: 'string', desc: '用户名' },
    { name: 'is_valid', type: 'boolean', desc: '是否有效（可正常使用）' },
    { name: 'is_active', type: 'boolean', desc: '账号是否启用' },
    { name: 'expire_time', type: 'string', desc: '到期时间 (ISO 8601格式)' },
    { name: 'expire_timestamp', type: 'number', desc: '到期时间戳（秒）' },
    { name: 'remaining_seconds', type: 'number', desc: '剩余秒数' },
    { name: 'valid_message', type: 'string', desc: '状态说明（无效时显示原因）' },
  ];
</script>

<style scoped>
  .auth-section {
    padding: 0 8px;
  }

  .api-card {
    margin-bottom: 24px;
  }

  .code-card {
    background: #1e1e1e;
    border-radius: 8px;
  }

  .code-block {
    color: #d4d4d4;
    font-family: 'Fira Code', 'Consolas', monospace;
    font-size: 13px;
    line-height: 1.5;
    margin: 0;
    white-space: pre-wrap;
    word-break: break-all;
  }
</style>
