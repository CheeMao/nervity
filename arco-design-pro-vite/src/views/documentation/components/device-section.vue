<template>
  <div class="device-section">
    <a-typography>
      <a-typography-title :heading="2">设备接口</a-typography-title>
      <a-typography-paragraph>
        这些接口用于设备心跳上报、状态查询等功能。设备心跳接口需要签名验证。
      </a-typography-paragraph>
    </a-typography>

    <!-- 设备心跳 -->
    <a-card class="api-card" title="POST /devices/heartbeat">
      <template #extra>
        <a-tag color="orange">需要签名</a-tag>
      </template>

      <a-descriptions :column="3" size="small" style="margin-bottom: 16px">
        <a-descriptions-item label="方法">POST</a-descriptions-item>
        <a-descriptions-item label="认证">签名验证</a-descriptions-item>
        <a-descriptions-item label="描述"
          >上报设备在线状态，获取服务器指令</a-descriptions-item
        >
      </a-descriptions>

      <a-alert type="info" style="margin-bottom: 16px">
        <template #message>
          <strong>心跳机制说明：</strong>
          <ul style="margin: 8px 0 0 0; padding-left: 20px">
            <li>客户端应按照应用配置的心跳间隔（默认60秒）定时上报</li>
            <li>超过3个心跳周期未上报，设备将被标记为离线</li>
            <li>心跳响应可能包含服务器下发的指令</li>
          </ul>
        </template>
      </a-alert>

      <a-typography-title :heading="5">请求头</a-typography-title>
      <a-table :data="heartbeatHeaders" :pagination="false" size="small">
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
POST /api/devices/heartbeat
Content-Type: application/json
x-app-id: 1
x-timestamp: 1704067200
x-nonce: abc123def456
x-signature: a1b2c3d4e5f6...

{
  "hwid": "DEVICE-HWID-001",
  "app_id": 1,
  "app_version": "1.0.0",
  "extra_info": {
    "os": "Windows 11",
    "cpu": "Intel i7-12700K",
    "ram": "32GB"
  }
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
    "interval": 60,
    "server_time": 1704067200,
    "commands": [
      {
        "type": "message",
        "content": "系统维护通知：明日凌晨2点进行系统升级"
      },
      {
        "type": "update",
        "version": "1.1.0",
        "url": "https://example.com/download/app-1.1.0.exe",
        "force": false
      }
    ],
    "message": "心跳成功"
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

      <a-typography-title :heading="5" style="margin-top: 16px"
        >指令类型说明</a-typography-title
      >
      <a-table :data="commandTypes" :pagination="false" size="small">
        <template #columns>
          <a-table-column title="type" data-index="type" :width="120">
            <template #cell="{ record }">
              <code>{{ record.type }}</code>
            </template>
          </a-table-column>
          <a-table-column title="说明" data-index="desc" />
          <a-table-column title="附加字段" data-index="fields" />
        </template>
      </a-table>
    </a-card>

    <!-- 检查在线状态 -->
    <a-card class="api-card" title="GET /devices/heartbeat/check/:hwid">
      <template #extra>
        <a-tag color="green">公开接口</a-tag>
      </template>

      <a-descriptions :column="3" size="small" style="margin-bottom: 16px">
        <a-descriptions-item label="方法">GET</a-descriptions-item>
        <a-descriptions-item label="认证">无需</a-descriptions-item>
        <a-descriptions-item label="描述"
          >检查指定设备是否在线</a-descriptions-item
        >
      </a-descriptions>

      <a-typography-title :heading="5">路径参数</a-typography-title>
      <a-table :data="checkOnlineParams" :pagination="false" size="small">
        <template #columns>
          <a-table-column title="参数名" data-index="name" :width="120">
            <template #cell="{ record }">
              <code>{{ record.name }}</code>
            </template>
          </a-table-column>
          <a-table-column title="类型" data-index="type" :width="100" />
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
GET /api/devices/heartbeat/check/DEVICE-HWID-001</pre
        >
      </a-card>

      <a-typography-title :heading="5" style="margin-top: 16px"
        >响应示例 - 在线</a-typography-title
      >
      <a-card class="code-card">
        <pre class="code-block">
{
  "status": 200,
  "code": 20000,
  "msg": "获取成功",
  "data": {
    "online": true,
    "last_heartbeat": "2024-01-01T10:00:00.000Z",
    "app_version": "1.0.0"
  }
}</pre
        >
      </a-card>

      <a-typography-title :heading="5" style="margin-top: 16px"
        >响应示例 - 离线</a-typography-title
      >
      <a-card class="code-card">
        <pre class="code-block">
{
  "status": 200,
  "code": 20000,
  "msg": "获取成功",
  "data": {
    "online": false,
    "last_heartbeat": "2024-01-01T08:00:00.000Z",
    "app_version": "1.0.0"
  }
}</pre
        >
      </a-card>
    </a-card>

    <!-- 查询设备信息 -->
    <a-card class="api-card" title="GET /devices/by-hwid/:hwid">
      <template #extra>
        <a-tag color="green">公开接口</a-tag>
      </template>

      <a-descriptions :column="3" size="small" style="margin-bottom: 16px">
        <a-descriptions-item label="方法">GET</a-descriptions-item>
        <a-descriptions-item label="认证">无需</a-descriptions-item>
        <a-descriptions-item label="描述"
          >根据HWID查询设备详细信息</a-descriptions-item
        >
      </a-descriptions>

      <a-typography-title :heading="5">请求示例</a-typography-title>
      <a-card class="code-card">
        <pre class="code-block">GET /api/devices/by-hwid/DEVICE-HWID-001</pre>
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
    "exists": true,
    "device": {
      "id": 1,
      "hwid": "DEVICE-HWID-001",
      "device_name": "DESKTOP-ABC123",
      "last_ip": "192.168.1.100",
      "status": "online",
      "app_version": "1.0.0",
      "last_heartbeat": "2024-01-01T10:00:00.000Z",
      "is_banned": false,
      "created_at": "2024-01-01T08:00:00.000Z"
    }
  }
}</pre
        >
      </a-card>
    </a-card>

    <!-- 获取在线设备数 -->
    <a-card class="api-card" title="GET /devices/online-count">
      <template #extra>
        <a-tag color="green">公开接口</a-tag>
      </template>

      <a-descriptions :column="3" size="small" style="margin-bottom: 16px">
        <a-descriptions-item label="方法">GET</a-descriptions-item>
        <a-descriptions-item label="认证">无需</a-descriptions-item>
        <a-descriptions-item label="描述"
          >获取指定应用的在线设备数量</a-descriptions-item
        >
      </a-descriptions>

      <a-typography-title :heading="5">Query 参数</a-typography-title>
      <a-table :data="onlineCountParams" :pagination="false" size="small">
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
        <pre class="code-block">GET /api/devices/online-count?app_id=1</pre>
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
    "count": 128
  }
}</pre
        >
      </a-card>
    </a-card>
  </div>
</template>

<script lang="ts" setup>
  const heartbeatHeaders = [
    { name: 'x-app-id', required: true, desc: '应用ID' },
    { name: 'x-timestamp', required: true, desc: '时间戳（秒）' },
    { name: 'x-nonce', required: true, desc: '随机字符串' },
    { name: 'x-signature', required: true, desc: 'HMAC-SHA256签名' },
  ];

  const heartbeatParams = [
    {
      name: 'hwid',
      type: 'string',
      required: true,
      desc: '设备硬件ID（唯一标识设备）',
    },
    { name: 'app_id', type: 'number', required: true, desc: '应用ID' },
    {
      name: 'app_version',
      type: 'string',
      required: false,
      desc: '客户端版本号',
    },
    {
      name: 'extra_info',
      type: 'object',
      required: false,
      desc: '额外设备信息（操作系统、CPU等）',
    },
  ];

  const heartbeatResponseFields = [
    { name: 'success', type: 'boolean', desc: '心跳是否成功' },
    { name: 'interval', type: 'number', desc: '建议的心跳间隔（秒）' },
    { name: 'server_time', type: 'number', desc: '服务器时间戳' },
    { name: 'commands', type: 'array', desc: '服务器下发的指令列表' },
    { name: 'message', type: 'string', desc: '心跳结果消息' },
  ];

  const commandTypes = [
    { type: 'message', desc: '显示消息给用户', fields: 'content: 消息内容' },
    { type: 'update', desc: '强制或建议更新', fields: 'version, url, force' },
    { type: 'logout', desc: '强制下线', fields: 'reason: 下线原因' },
    { type: 'custom', desc: '自定义指令', fields: '由客户端自行解析处理' },
  ];

  const checkOnlineParams = [
    { name: 'hwid', type: 'string', required: true, desc: '设备硬件ID' },
  ];

  const onlineCountParams = [
    {
      name: 'app_id',
      type: 'number',
      required: false,
      desc: '应用ID（不传则返回所有应用总数）',
    },
  ];
</script>

<style scoped>
  .device-section {
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
