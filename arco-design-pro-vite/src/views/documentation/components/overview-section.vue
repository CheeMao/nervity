<template>
  <div class="overview-section">
    <a-typography>
      <!-- 核心概念 -->
      <a-typography-title :heading="2">核心概念</a-typography-title>
      <a-typography-paragraph>
        本系统是一个完整的软件授权验证解决方案，主要包含以下核心概念：
      </a-typography-paragraph>
      <a-row :gutter="16" style="margin-bottom: 24px">
        <a-col v-for="concept in concepts" :key="concept.title" :span="8">
          <a-card class="concept-card" :title="concept.title">
            <p>{{ concept.desc }}</p>
          </a-card>
        </a-col>
      </a-row>

      <!-- 基础信息 -->
      <a-typography-title :heading="2">基础信息</a-typography-title>
      <a-descriptions :column="1" bordered>
        <a-descriptions-item label="Base URL">
          <code>http://your-domain.com/api</code>
        </a-descriptions-item>
        <a-descriptions-item label="数据格式">
          <code>application/json</code>
        </a-descriptions-item>
        <a-descriptions-item label="字符编码">
          <code>UTF-8</code>
        </a-descriptions-item>
      </a-descriptions>

      <!-- 统一响应格式 -->
      <a-typography-title :heading="2" style="margin-top: 24px">
        统一响应格式
      </a-typography-title>
      <a-typography-paragraph>
        所有接口均采用统一的响应格式：
      </a-typography-paragraph>
      <a-card class="code-card">
        <pre class="code-block">
{
  "status": 200,        // HTTP状态码
  "code": 20000,        // 业务状态码 (20000=成功)
  "msg": "操作成功",     // 提示信息
  "data": { ... }       // 返回数据
}</pre
        >
      </a-card>

      <a-typography-title :heading="3">业务状态码说明</a-typography-title>
      <a-table :data="codeData" :pagination="false" size="small">
        <template #columns>
          <a-table-column title="状态码" data-index="code" :width="120" />
          <a-table-column title="说明" data-index="desc" />
        </template>
      </a-table>

      <!-- 签名验证 -->
      <a-typography-title :heading="2" style="margin-top: 24px">
        签名验证
      </a-typography-title>
      <a-alert type="warning" style="margin-bottom: 16px">
        客户端调用API时，部分接口需要进行签名验证以确保请求的合法性。
      </a-alert>

      <a-typography-title :heading="3">1. 签名请求头</a-typography-title>
      <a-table :data="signatureHeaders" :pagination="false" size="small">
        <template #columns>
          <a-table-column title="Header" data-index="header" :width="150">
            <template #cell="{ record }">
              <code>{{ record.header }}</code>
            </template>
          </a-table-column>
          <a-table-column title="说明" data-index="desc" />
          <a-table-column title="示例" data-index="example" :width="200">
            <template #cell="{ record }">
              <code>{{ record.example }}</code>
            </template>
          </a-table-column>
        </template>
      </a-table>

      <a-typography-title :heading="3" style="margin-top: 16px">
        2. 签名算法 (HMAC-SHA256)
      </a-typography-title>
      <a-card class="code-card">
        <pre class="code-block">
// 步骤1: 构造待签名字符串
// 格式: app_id={appId}&amp;nonce={nonce}&amp;timestamp={timestamp}&amp;{sortedQueryString}{bodyString}

const timestamp = Math.floor(Date.now() / 1000);
const nonce = 'random-string-12345';
const body = JSON.stringify(requestBody); // 如果有请求体

let stringToSign = `app_id=${appId}&amp;nonce=${nonce}&amp;timestamp=${timestamp}`;

// 如果有 Query 参数，按字母顺序追加
if (Object.keys(queryParams).length > 0) {
  const sortedKeys = Object.keys(queryParams).sort();
  sortedKeys.forEach(key => {
    stringToSign += `&${key}=${queryParams[key]}`);
  });
}

// 如果有请求体，追加请求体字符串
if (body && body !== '{}') {
  stringToSign += body;
}

// 步骤2: 计算签名
const signature = crypto
  .createHmac('sha256', appSecret)
  .update(stringToSign)
  .digest('hex');

// 步骤3: 设置请求头
headers['x-app-id'] = appId;
headers['x-timestamp'] = timestamp;
headers['x-nonce'] = nonce;
headers['x-signature'] = signature;</pre
        >
      </a-card>

      <a-typography-title :heading="3" style="margin-top: 16px">
        3. Python 签名示例
      </a-typography-title>
      <a-card class="code-card">
        <pre class="code-block">
import hmac
import hashlib
import json
import time

def generate_signature(app_id: int, app_secret: str, nonce: str,
                       timestamp: int, query_params: dict = None,
                       body: dict = None) -> str:
    """生成请求签名"""
    # 构造待签名字符串
    string_to_sign = f"app_id={app_id}&amp;nonce={nonce}&amp;timestamp={timestamp}"

    # 追加排序后的 Query 参数
    if query_params:
        for key in sorted(query_params.keys()):
            string_to_sign += f"&{key}={query_params[key]}"

    # 追加请求体
    if body:
        body_str = json.dumps(body, separators=(',', ':'))
        string_to_sign += body_str

    # 计算 HMAC-SHA256
    signature = hmac.new(
        app_secret.encode('utf-8'),
        string_to_sign.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()

    return signature

# 使用示例
app_id = 1
app_secret = "your-app-secret"
nonce = "abc123"
timestamp = int(time.time())

signature = generate_signature(
    app_id=app_id,
    app_secret=app_secret,
    nonce=nonce,
    timestamp=timestamp,
    body={"hwid": "DEVICE-001", "app_version": "1.0.0"}
)

print(f"Signature: {signature}")</pre
        >
      </a-card>

      <a-typography-title :heading="3" style="margin-top: 16px">
        4. C# 签名示例
      </a-typography-title>
      <a-card class="code-card">
        <pre class="code-block">
using System;
using System.Security.Cryptography;
using System.Text;
using System.Collections.Generic;
using System.Linq;

public class SignatureHelper
{
    public static string GenerateSignature(
        int appId,
        string appSecret,
        string nonce,
        long timestamp,
        Dictionary&lt;string, string&gt; queryParams = null,
        string body = null)
    {
        // 构造待签名字符串
        var stringToSign = $"app_id={appId}&amp;nonce={nonce}&amp;timestamp={timestamp}";

        // 追加排序后的 Query 参数
        if (queryParams != null && queryParams.Count > 0)
        {
            foreach (var key in queryParams.Keys.OrderBy(k => k))
            {
                stringToSign += $"&{key}={queryParams[key]}";
            }
        }

        // 追加请求体
        if (!string.IsNullOrEmpty(body) && body != "{}")
        {
            stringToSign += body;
        }

        // 计算 HMAC-SHA256
        using (var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(appSecret)))
        {
            var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(stringToSign));
            return BitConverter.ToString(hash).Replace("-", "").ToLower();
        }
    }
}

// 使用示例
var signature = SignatureHelper.GenerateSignature(
    appId: 1,
    appSecret: "your-app-secret",
    nonce: "abc123",
    timestamp: DateTimeOffset.UtcNow.ToUnixTimeSeconds(),
    body: "{\"hwid\":\"DEVICE-001\",\"app_version\":\"1.0.0\"}"
);</pre
        >
      </a-card>
    </a-typography>
  </div>
</template>

<script lang="ts" setup>
  const concepts = [
    {
      title: '应用 (App)',
      desc: '您开发的软件或服务。每个应用都有唯一的 App ID 和 App Secret，用于 API 调用签名验证。',
    },
    {
      title: '卡密 (Card)',
      desc: '用于激活应用或充值时长的凭证。支持激活卡（首次绑定）和充值卡（增加时长）。',
    },
    {
      title: '终端用户 (End User)',
      desc: '最终使用您软件的用户。系统会自动根据设备信息创建或关联用户。',
    },
    {
      title: '设备 (Device)',
      desc: '用户使用的硬件设备。系统通过 HWID (硬件特征码) 唯一标识设备，支持单码多设备限制。',
    },
    {
      title: '云函数 (Cloud Function)',
      desc: '运行在服务器端的 JavaScript 代码。可在客户端调用以实现关键逻辑，防止被破解。',
    },
    {
      title: '远程变量 (Remote Variable)',
      desc: '存储在云端的配置项。支持按应用、版本、VIP 等条件动态下发配置。',
    },
  ];

  const codeData = [
    { code: '20000', desc: '操作成功' },
    { code: '40001', desc: '参数错误' },
    { code: '40002', desc: '资源不存在' },
    { code: '40003', desc: '卡密不存在或已使用' },
    { code: '40004', desc: '设备已达上限' },
    { code: '50008', desc: '非法的 Token' },
    { code: '50012', desc: 'Token 已过期' },
    { code: '50014', desc: 'Token 无效' },
    { code: '50000', desc: '服务器内部错误' },
  ];

  const signatureHeaders = [
    {
      header: 'x-app-id',
      desc: '应用 ID，在"应用管理"中获取',
      example: '1',
    },
    {
      header: 'x-timestamp',
      desc: '当前 Unix 时间戳（秒），有效期 ±60 秒',
      example: '1704067200',
    },
    {
      header: 'x-nonce',
      desc: '随机字符串，用于防止重放攻击，建议使用 UUID',
      example: 'a1b2c3d4e5f6',
    },
    {
      header: 'x-signature',
      desc: 'HMAC-SHA256 签名值（Hex 格式）',
      example: 'a1b2c3...',
    },
  ];
</script>

<style scoped>
  .overview-section {
    padding: 0 8px;
  }

  .concept-card {
    height: 100%;
    margin-bottom: 16px;
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
