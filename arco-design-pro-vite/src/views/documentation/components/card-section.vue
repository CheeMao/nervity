<template>
  <div class="card-section">
    <a-typography>
      <a-typography-title :heading="2">卡密接口</a-typography-title>
      <a-typography-paragraph>
        这些接口用于卡密的激活和试用。卡密激活需要用户先登录获取 Token。
      </a-typography-paragraph>
    </a-typography>

    <!-- 卡密激活/充值 -->
    <a-card class="api-card" title="POST /cards/redeem">
      <template #extra>
        <a-tag color="blue">需要 Token</a-tag>
      </template>

      <a-descriptions :column="3" size="small" style="margin-bottom: 16px">
        <a-descriptions-item label="方法">POST</a-descriptions-item>
        <a-descriptions-item label="认证">Bearer Token</a-descriptions-item>
        <a-descriptions-item label="描述"
          >使用卡密为当前用户激活或充值时长</a-descriptions-item
        >
      </a-descriptions>

      <a-alert type="info" style="margin-bottom: 16px">
        <template #message>
          <strong>卡密类型说明：</strong>
          <ul style="margin: 8px 0 0 0; padding-left: 20px">
            <li
              ><strong>激活卡</strong
              >：首次使用时绑定设备，后续只能在该设备上使用</li
            >
            <li><strong>充值卡</strong>：为当前账号增加时长，不绑定设备</li>
          </ul>
        </template>
      </a-alert>

      <a-typography-title :heading="5">请求参数</a-typography-title>
      <a-table :data="redeemParams" :pagination="false" size="small">
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
POST /api/cards/redeem
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{
  "code": "CARD-A1B2C3D4E5F6",
  "hwid": "DEVICE-HWID-001"
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
  "msg": "卡密激活成功",
  "data": {
    "success": true,
    "card_type": "activation",
    "added_seconds": 2592000,
    "new_expire_time": "2024-02-01T10:00:00.000Z",
    "device_bound": true,
    "message": "激活成功，有效期至 2024-02-01 10:00:00"
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
  "status": 400,
  "code": 40003,
  "msg": "卡密不存在或已使用",
  "data": null
}</pre
        >
      </a-card>

      <a-typography-title :heading="5" style="margin-top: 16px"
        >响应字段说明</a-typography-title
      >
      <a-table :data="redeemResponseFields" :pagination="false" size="small">
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
    </a-card>

    <!-- 试用激活 -->
    <a-card class="api-card" title="POST /cards/trial">
      <template #extra>
        <a-tag color="green">公开接口</a-tag>
      </template>

      <a-descriptions :column="3" size="small" style="margin-bottom: 16px">
        <a-descriptions-item label="方法">POST</a-descriptions-item>
        <a-descriptions-item label="认证">无需</a-descriptions-item>
        <a-descriptions-item label="描述"
          >申请试用激活（每设备限一次）</a-descriptions-item
        >
      </a-descriptions>

      <a-alert type="warning" style="margin-bottom: 16px">
        <template #message>
          <strong>试用规则：</strong>
          <ul style="margin: 8px 0 0 0; padding-left: 20px">
            <li>每个设备（HWID）只能试用一次</li>
            <li>试用时长由应用配置决定（通常为1-3天）</li>
            <li>试用期间设备会被自动绑定</li>
          </ul>
        </template>
      </a-alert>

      <a-typography-title :heading="5">请求参数</a-typography-title>
      <a-table :data="trialParams" :pagination="false" size="small">
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
POST /api/cards/trial
Content-Type: application/json

{
  "app_id": 1,
  "hwid": "DEVICE-HWID-001"
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
  "msg": "试用激活成功",
  "data": {
    "success": true,
    "trial_seconds": 86400,
    "expire_time": "2024-01-02T10:00:00.000Z",
    "message": "试用激活成功，有效期24小时"
  }
}</pre
        >
      </a-card>

      <a-typography-title :heading="5" style="margin-top: 16px"
        >响应示例 - 已使用</a-typography-title
      >
      <a-card class="code-card">
        <pre class="code-block">
{
  "status": 400,
  "code": 40004,
  "msg": "该设备已使用过试用",
  "data": null
}</pre
        >
      </a-card>
    </a-card>

    <!-- 错误码说明 -->
    <a-card class="api-card" title="卡密相关错误码">
      <a-table :data="cardErrorCodes" :pagination="false" size="small">
        <template #columns>
          <a-table-column title="错误码" data-index="code" :width="100">
            <template #cell="{ record }">
              <code>{{ record.code }}</code>
            </template>
          </a-table-column>
          <a-table-column title="说明" data-index="desc" />
          <a-table-column title="解决方案" data-index="solution" />
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script lang="ts" setup>
  const redeemParams = [
    { name: 'code', type: 'string', required: true, desc: '卡密码' },
    {
      name: 'hwid',
      type: 'string',
      required: false,
      desc: '设备硬件ID（激活卡绑定设备时使用）',
    },
  ];

  const redeemResponseFields = [
    { name: 'success', type: 'boolean', desc: '是否激活成功' },
    {
      name: 'card_type',
      type: 'string',
      desc: '卡密类型：activation(激活) / recharge(充值)',
    },
    { name: 'added_seconds', type: 'number', desc: '增加的时长（秒）' },
    { name: 'new_expire_time', type: 'string', desc: '新的到期时间' },
    { name: 'device_bound', type: 'boolean', desc: '是否绑定了设备' },
    { name: 'message', type: 'string', desc: '激活结果消息' },
  ];

  const trialParams = [
    { name: 'app_id', type: 'number', required: true, desc: '应用ID' },
    { name: 'hwid', type: 'string', required: true, desc: '设备硬件ID' },
  ];

  const cardErrorCodes = [
    {
      code: '40003',
      desc: '卡密不存在或已使用',
      solution: '检查卡密是否正确，或联系客服',
    },
    {
      code: '40004',
      desc: '设备已达上限',
      solution: '该卡密绑定设备数已达上限，无法在新设备使用',
    },
    {
      code: '40005',
      desc: '卡密已过期',
      solution: '卡密已超过有效期，无法使用',
    },
    {
      code: '40006',
      desc: '卡密已禁用',
      solution: '卡密被管理员禁用，联系客服',
    },
    { code: '40007', desc: '应用未开启试用', solution: '该应用不支持试用功能' },
    { code: '40008', desc: '已使用过试用', solution: '该设备已使用过试用功能' },
  ];
</script>

<style scoped>
  .card-section {
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
