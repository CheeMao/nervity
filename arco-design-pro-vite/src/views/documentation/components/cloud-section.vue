<template>
  <div class="cloud-section">
    <a-typography>
      <a-typography-title :heading="2">云函数接口</a-typography-title>
      <a-typography-paragraph>
        云函数允许您在服务器端运行 JavaScript 代码，客户端通过 HTTP
        请求触发执行。 云函数适合处理关键业务逻辑，可以有效防止客户端被破解。
      </a-typography-paragraph>
    </a-typography>

    <!-- 执行云函数 -->
    <a-card class="api-card" title="POST /cloud/run/:appId/:triggerName">
      <template #extra>
        <a-tag color="green">公开接口</a-tag>
      </template>

      <a-descriptions :column="3" size="small" style="margin-bottom: 16px">
        <a-descriptions-item label="方法">POST</a-descriptions-item>
        <a-descriptions-item label="认证">无需</a-descriptions-item>
        <a-descriptions-item label="描述"
          >触发并执行指定的云函数</a-descriptions-item
        >
      </a-descriptions>

      <a-typography-title :heading="5">路径参数</a-typography-title>
      <a-table :data="runParams" :pagination="false" size="small">
        <template #columns>
          <a-table-column title="参数名" data-index="name" :width="150">
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

      <a-typography-title :heading="5">请求参数（Body）</a-typography-title>
      <a-table :data="runBodyParams" :pagination="false" size="small">
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
POST /api/cloud/run/1/verify_license
Content-Type: application/json

{
  "data": {
    "hwid": "DEVICE-HWID-001",
    "license_key": "LICENSE-ABC123",
    "app_version": "1.0.0"
  }
}</pre
        >
      </a-card>

      <a-typography-title :heading="5" style="margin-top: 16px"
        >响应示例 - 成功</a-typography-title
      >
      <a-card class="code-card">
        <pre class="code-block">
{
  "status": 200,
  "code": 20000,
  "msg": "执行成功",
  "data": {
    "success": true,
    "valid": true,
    "expire_date": "2025-01-01",
    "features": ["premium", "export"],
    "message": "License verified successfully"
  }
}</pre
        >
      </a-card>

      <a-typography-title :heading="5" style="margin-top: 16px"
        >响应示例 - 失败</a-typography-title
      >
      <a-card class="code-card">
        <pre class="code-block">
{
  "status": 200,
  "code": 20000,
  "msg": "执行成功",
  "data": {
    "success": true,
    "valid": false,
    "message": "License expired"
  }
}</pre
        >
      </a-card>

      <a-typography-title :heading="5" style="margin-top: 16px"
        >响应示例 - 函数不存在</a-typography-title
      >
      <a-card class="code-card">
        <pre class="code-block">
{
  "status": 404,
  "code": 40002,
  "msg": "云函数不存在",
  "data": null
}</pre
        >
      </a-card>
    </a-card>

    <!-- 云函数开发指南 -->
    <a-card class="api-card" title="云函数开发指南">
      <a-typography-title :heading="4">函数结构</a-typography-title>
      <a-typography-paragraph>
        云函数是一个标准的 JavaScript 函数，接收输入参数并返回结果：
      </a-typography-paragraph>
      <a-card class="code-card">
        <pre class="code-block">
// 云函数模板
async function handler(input, context) {
  // input: 客户端传入的 data 参数
  // context: 上下文对象，包含 app_id, request_ip 等

  // 你的业务逻辑
  const result = {
    success: true,
    message: "处理成功",
    data: {}
  };

  return result;
}

// 导出函数（必需）
module.exports = handler;</pre
        >
      </a-card>

      <a-typography-title :heading="4" style="margin-top: 24px"
        >Context 对象</a-typography-title
      >
      <a-table :data="contextFields" :pagination="false" size="small">
        <template #columns>
          <a-table-column title="字段" data-index="name" :width="150">
            <template #cell="{ record }">
              <code>{{ record.name }}</code>
            </template>
          </a-table-column>
          <a-table-column title="类型" data-index="type" :width="100" />
          <a-table-column title="说明" data-index="desc" />
        </template>
      </a-table>

      <a-typography-title :heading="4" style="margin-top: 24px"
        >可用模块</a-typography-title
      >
      <a-typography-paragraph>
        云函数运行在沙箱环境中，可以使用以下内置模块：
      </a-typography-paragraph>
      <a-table :data="availableModules" :pagination="false" size="small">
        <template #columns>
          <a-table-column title="模块" data-index="name" :width="120">
            <template #cell="{ record }">
              <code>{{ record.name }}</code>
            </template>
          </a-table-column>
          <a-table-column title="说明" data-index="desc" />
        </template>
      </a-table>

      <a-typography-title :heading="4" style="margin-top: 24px"
        >示例：许可证验证</a-typography-title
      >
      <a-card class="code-card">
        <pre class="code-block">
async function handler(input, context) {
  const { hwid, license_key } = input;

  // 模拟许可证验证逻辑
  const validLicenses = {
    'LICENSE-ABC123': { expire: '2025-12-31', type: 'premium' },
    'LICENSE-XYZ789': { expire: '2024-06-30', type: 'standard' }
  };

  const license = validLicenses[license_key];

  if (!license) {
    return {
      success: true,
      valid: false,
      message: 'Invalid license key'
    };
  }

  const now = new Date();
  const expireDate = new Date(license.expire);

  if (now > expireDate) {
    return {
      success: true,
      valid: false,
      message: 'License expired',
      expire_date: license.expire
    };
  }

  return {
    success: true,
    valid: true,
    expire_date: license.expire,
    type: license.type,
    message: 'License valid'
  };
}

module.exports = handler;</pre
        >
      </a-card>

      <a-typography-title :heading="4" style="margin-top: 24px"
        >示例：计算授权码</a-typography-title
      >
      <a-card class="code-card">
        <pre class="code-block">
const crypto = require('crypto');

async function handler(input, context) {
  const { hwid, timestamp, app_secret } = input;

  // 验证时间戳（防重放）
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - timestamp) > 300) {
    return {
      success: false,
      message: 'Timestamp expired'
    };
  }

  // 生成授权码
  const data = `${hwid}|${timestamp}|${app_secret}`;
  const hash = crypto.createHash('sha256').update(data).digest('hex');
  const authCode = hash.substring(0, 16).toUpperCase();

  return {
    success: true,
    auth_code: authCode,
    expires_in: 300
  };
}

module.exports = handler;</pre
        >
      </a-card>

      <a-alert type="warning" style="margin-top: 16px">
        <template #message>
          <strong>安全提示：</strong>
          <ul style="margin: 8px 0 0 0; padding-left: 20px">
            <li>云函数中的敏感信息（如密钥）应通过环境变量或远程变量获取</li>
            <li>不要在云函数中硬编码敏感信息</li>
            <li>对输入参数进行校验，防止注入攻击</li>
            <li>云函数有执行超时限制（默认5秒）</li>
          </ul>
        </template>
      </a-alert>
    </a-card>

    <!-- 最佳实践 -->
    <a-card class="api-card" title="最佳实践">
      <a-row :gutter="16">
        <a-col v-for="practice in practices" :key="practice.title" :span="12">
          <a-card class="practice-card" :bordered="false">
            <template #title>
              <a-typography-text>
                <icon-check-circle-fill
                  style="color: #00b42a; margin-right: 8px"
                />
                {{ practice.title }}
              </a-typography-text>
            </template>
            <p>{{ practice.desc }}</p>
          </a-card>
        </a-col>
      </a-row>
    </a-card>
  </div>
</template>

<script lang="ts" setup>
  const runParams = [
    { name: 'appId', type: 'number', required: true, desc: '应用ID' },
    {
      name: 'triggerName',
      type: 'string',
      required: true,
      desc: '触发器名称（云函数标识）',
    },
  ];

  const runBodyParams = [
    {
      name: 'data',
      type: 'object',
      required: false,
      desc: '传递给云函数的参数对象',
    },
  ];

  const contextFields = [
    { name: 'app_id', type: 'number', desc: '应用ID' },
    { name: 'request_ip', type: 'string', desc: '客户端IP地址' },
    { name: 'user_agent', type: 'string', desc: '客户端User-Agent' },
    { name: 'timestamp', type: 'number', desc: '请求时间戳' },
  ];

  const availableModules = [
    { name: 'crypto', desc: '加密模块，支持 MD5, SHA256, AES 等' },
    { name: 'buffer', desc: 'Buffer 处理' },
    { name: 'util', desc: '工具函数' },
    { name: 'url', desc: 'URL 解析' },
    { name: 'querystring', desc: '查询字符串解析' },
    { name: 'uuid', desc: 'UUID 生成' },
  ];

  const practices = [
    {
      title: '关键逻辑放云端',
      desc: '将授权验证、数据加密、业务计算等关键逻辑放在云函数中执行，防止被逆向分析。',
    },
    {
      title: '返回最小数据',
      desc: '只返回客户端必需的数据，避免泄露敏感信息。',
    },
    {
      title: '添加频率限制',
      desc: '在云函数中实现调用频率限制，防止滥用。',
    },
    {
      title: '错误处理',
      desc: '妥善处理异常，返回有意义的错误信息，但不要暴露系统细节。',
    },
  ];
</script>

<style scoped>
  .cloud-section {
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

  .practice-card {
    background: #f7f8fa;
    margin-bottom: 16px;
  }
</style>
