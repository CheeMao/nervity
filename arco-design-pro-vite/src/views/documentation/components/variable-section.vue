<template>
  <div class="variable-section">
    <a-typography>
      <a-typography-title :heading="2">远程变量接口</a-typography-title>
      <a-typography-paragraph>
        远程变量允许您在云端动态配置参数，客户端可以实时获取。适用于功能开关、配置下发、版本控制等场景。
      </a-typography-paragraph>
    </a-typography>

    <!-- 获取单个变量 -->
    <a-card class="api-card" title="GET /remote-variables/app/:appId/key/:key">
      <template #extra>
        <a-tag color="orange">需要签名</a-tag>
      </template>

      <a-descriptions :column="3" size="small" style="margin-bottom: 16px">
        <a-descriptions-item label="方法">GET</a-descriptions-item>
        <a-descriptions-item label="认证">签名验证</a-descriptions-item>
        <a-descriptions-item label="描述"
          >根据变量名获取单个远程变量</a-descriptions-item
        >
      </a-descriptions>

      <a-typography-title :heading="5">路径参数</a-typography-title>
      <a-table :data="getOneParams" :pagination="false" size="small">
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
GET /api/remote-variables/app/1/key/server_address
x-app-id: 1
x-timestamp: 1704067200
x-nonce: abc123def456
x-signature: a1b2c3d4e5f6...</pre
        >
      </a-card>

      <a-typography-title :heading="5" style="margin-top: 16px"
        >响应示例 - 存在</a-typography-title
      >
      <a-card class="code-card">
        <pre class="code-block">
{
  "status": 200,
  "code": 20000,
  "msg": "获取成功",
  "data": {
    "exists": true,
    "key": "server_address",
    "value": "https://api.example.com",
    "description": "API服务器地址"
  }
}</pre
        >
      </a-card>

      <a-typography-title :heading="5" style="margin-top: 16px"
        >响应示例 - 不存在</a-typography-title
      >
      <a-card class="code-card">
        <pre class="code-block">
{
  "status": 200,
  "code": 20000,
  "msg": "获取成功",
  "data": {
    "exists": false,
    "key": "non_existent_key",
    "value": null,
    "description": null
  }
}</pre
        >
      </a-card>
    </a-card>

    <!-- 获取变量列表 -->
    <a-card class="api-card" title="GET /remote-variables/app/:appId">
      <template #extra>
        <a-tag color="orange">需要签名</a-tag>
      </template>

      <a-descriptions :column="3" size="small" style="margin-bottom: 16px">
        <a-descriptions-item label="方法">GET</a-descriptions-item>
        <a-descriptions-item label="认证">签名验证</a-descriptions-item>
        <a-descriptions-item label="描述"
          >获取应用下所有远程变量（数组格式）</a-descriptions-item
        >
      </a-descriptions>

      <a-typography-title :heading="5">请求示例</a-typography-title>
      <a-card class="code-card">
        <pre class="code-block">
GET /api/remote-variables/app/1
x-app-id: 1
x-timestamp: 1704067200
x-nonce: abc123def456
x-signature: a1b2c3d4e5f6...</pre
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
    "list": [
      {
        "id": 1,
        "key": "server_address",
        "value": "https://api.example.com",
        "description": "API服务器地址",
        "updated_at": "2024-01-01T10:00:00.000Z"
      },
      {
        "id": 2,
        "key": "feature_flag_new_ui",
        "value": "true",
        "description": "新版UI开关",
        "updated_at": "2024-01-01T10:00:00.000Z"
      },
      {
        "id": 3,
        "key": "max_connections",
        "value": "100",
        "description": "最大连接数",
        "updated_at": "2024-01-01T10:00:00.000Z"
      }
    ]
  }
}</pre
        >
      </a-card>
    </a-card>

    <!-- 获取变量对象 -->
    <a-card class="api-card" title="GET /remote-variables/app/:appId/object">
      <template #extra>
        <a-tag color="orange">需要签名</a-tag>
      </template>

      <a-descriptions :column="3" size="small" style="margin-bottom: 16px">
        <a-descriptions-item label="方法">GET</a-descriptions-item>
        <a-descriptions-item label="认证">签名验证</a-descriptions-item>
        <a-descriptions-item label="描述"
          >获取应用下所有远程变量（键值对格式）</a-descriptions-item
        >
      </a-descriptions>

      <a-alert type="info" style="margin-bottom: 16px">
        此接口返回键值对格式的数据，便于直接在代码中使用，无需额外处理数组。
      </a-alert>

      <a-typography-title :heading="5">请求示例</a-typography-title>
      <a-card class="code-card">
        <pre class="code-block">
GET /api/remote-variables/app/1/object
x-app-id: 1
x-timestamp: 1704067200
x-nonce: abc123def456
x-signature: a1b2c3d4e5f6...</pre
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
    "server_address": "https://api.example.com",
    "feature_flag_new_ui": "true",
    "max_connections": "100",
    "maintenance_mode": "false",
    "announcement": "系统升级完成，欢迎使用！"
  }
}</pre
        >
      </a-card>

      <a-typography-title :heading="5" style="margin-top: 16px"
        >使用示例</a-typography-title
      >
      <a-card class="code-card">
        <pre class="code-block">
// Python 示例
response = requests.get(url, headers=headers)
config = response.json()['data']

server_address = config.get('server_address', 'default_url')
if config.get('feature_flag_new_ui') == 'true':
    enable_new_ui()

# 值都是字符串类型，需要自行转换
max_conn = int(config.get('max_connections', '50'))</pre
        >
      </a-card>
    </a-card>

    <!-- 使用场景 -->
    <a-card class="api-card" title="常见使用场景">
      <a-row :gutter="16">
        <a-col v-for="scenario in scenarios" :key="scenario.title" :span="12">
          <a-card
            class="scenario-card"
            :title="scenario.title"
            :bordered="false"
          >
            <p>{{ scenario.desc }}</p>
            <a-typography-text type="secondary">
              <strong>示例变量：</strong>{{ scenario.example }}
            </a-typography-text>
          </a-card>
        </a-col>
      </a-row>
    </a-card>
  </div>
</template>

<script lang="ts" setup>
  const getOneParams = [
    { name: 'appId', type: 'number', required: true, desc: '应用ID' },
    { name: 'key', type: 'string', required: true, desc: '变量名（键）' },
  ];

  const scenarios = [
    {
      title: '功能开关',
      desc: '动态控制功能的开启和关闭，无需重新发布应用',
      example: 'feature_flag_xxx: "true" / "false"',
    },
    {
      title: '服务器配置',
      desc: '动态切换API服务器地址，方便灰度发布和灾备切换',
      example: 'api_server: "https://api.example.com"',
    },
    {
      title: '公告/通知',
      desc: '向用户展示公告信息，如维护通知、更新提示等',
      example: 'announcement: "系统维护中..."',
    },
    {
      title: '限流配置',
      desc: '动态调整接口调用频率限制',
      example: 'rate_limit: "100"',
    },
    {
      title: '版本控制',
      desc: '检查客户端版本，提示或强制更新',
      example: 'latest_version: "1.2.0"',
    },
    {
      title: 'VIP功能',
      desc: '根据用户等级下发不同的功能配置',
      example: 'vip_features: "feature1,feature2"',
    },
  ];
</script>

<style scoped>
  .variable-section {
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

  .scenario-card {
    background: #f7f8fa;
    margin-bottom: 16px;
  }
</style>
