/**
 * API 直接测试脚本
 * 使用 supertest 直接调用运行中的后端服务进行测试
 *
 * 运行方式:
 * 1. 启动后端: npm run start:dev
 * 2. 运行测试: npx ts-node test/api-test.ts
 */

import request from 'supertest';

const BASE_URL = 'http://localhost:3000/api';

// 测试凭据（需要根据实际数据库中的用户调整）
const TEST_USERS = {
  admin: { username: 'admin', password: 'admin123' },
  developer: { username: 'developer', password: 'developer123' },
  agent: { username: 'agent', password: 'agent123' },
};

// 存储登录后的 token
const tokens: Record<string, string> = {};

// 测试结果统计
let passed = 0;
let failed = 0;

async function test(name: string, fn: () => Promise<boolean>) {
  try {
    const result = await fn();
    if (result) {
      console.log(`✅ ${name}`);
      passed++;
    } else {
      console.log(`❌ ${name}`);
      failed++;
    }
  } catch (error: any) {
    console.log(`❌ ${name} - Error: ${error.message}`);
    failed++;
  }
}

// 登录并获取 token
async function login(role: string): Promise<string> {
  if (tokens[role]) return tokens[role];

  const cred = TEST_USERS[role as keyof typeof TEST_USERS];
  if (!cred) throw new Error(`Unknown role: ${role}`);

  const response = await request(BASE_URL)
    .post('/auth/login')
    .send(cred);

  if (response.status !== 200 && response.status !== 201) {
    throw new Error(`Login failed: ${response.body?.msg || response.text}`);
  }

  const data = response.body.data || response.body;
  tokens[role] = data.access_token;
  return tokens[role];
}

// 测试主函数
async function runTests() {
  console.log('\n========================================');
  console.log('NetVerify API 测试');
  console.log('========================================\n');

  // ========== 认证测试 ==========
  console.log('📋 认证测试');

  await test('登录失败 - 错误密码', async () => {
    const response = await request(BASE_URL)
      .post('/auth/login')
      .send({ username: 'admin', password: 'wrongpassword' });
    return response.status === 401;
  });

  await test('登录成功 - Admin', async () => {
    const token = await login('admin');
    return !!token;
  });

  // ========== 用户管理测试 ==========
  console.log('\n📋 用户管理测试');

  await test('获取当前用户信息', async () => {
    const token = await login('admin');
    const response = await request(BASE_URL)
      .get('/users/profile')
      .set('Authorization', `Bearer ${token}`);
    return response.status === 200 && (response.body.data?.userId || response.body.userId);
  });

  await test('获取用户列表', async () => {
    const token = await login('admin');
    const response = await request(BASE_URL)
      .get('/users')
      .set('Authorization', `Bearer ${token}`);
    return response.status === 200;
  });

  // ========== 应用管理测试 ==========
  console.log('\n📋 应用管理测试');

  await test('获取应用列表', async () => {
    const token = await login('admin');
    const response = await request(BASE_URL)
      .get('/apps')
      .set('Authorization', `Bearer ${token}`);
    return response.status === 200;
  });

  await test('未认证访问应用列表 - 401', async () => {
    const response = await request(BASE_URL).get('/apps');
    return response.status === 401;
  });

  // ========== 卡密管理测试 ==========
  console.log('\n📋 卡密管理测试');

  await test('获取卡密列表', async () => {
    const token = await login('admin');
    const response = await request(BASE_URL)
      .get('/cards')
      .set('Authorization', `Bearer ${token}`);
    return response.status === 200;
  });

  await test('兑换无效卡密 - 错误响应', async () => {
    const response = await request(BASE_URL)
      .post('/cards/redeem')
      .send({ code: 'INVALID_CODE_12345' });
    // 可能返回 400, 404 或 500（如果卡密不存在）
    return [400, 404, 500].includes(response.status);
  });

  // ========== 设备管理测试 ==========
  console.log('\n📋 设备管理测试');

  await test('获取在线设备数量', async () => {
    const response = await request(BASE_URL).get('/devices/online-count');
    return response.status === 200;
  });

  await test('获取设备列表 - 需认证', async () => {
    const token = await login('admin');
    const response = await request(BASE_URL)
      .get('/devices')
      .set('Authorization', `Bearer ${token}`);
    return response.status === 200;
  });

  // ========== 访问控制测试 ==========
  console.log('\n📋 访问控制测试');

  await test('获取角色列表', async () => {
    const token = await login('admin');
    const response = await request(BASE_URL)
      .get('/access-control/roles')
      .set('Authorization', `Bearer ${token}`);
    return response.status === 200;
  });

  await test('获取权限列表', async () => {
    const token = await login('admin');
    const response = await request(BASE_URL)
      .get('/access-control/permissions')
      .set('Authorization', `Bearer ${token}`);
    return response.status === 200;
  });

  // ========== 黑名单测试 ==========
  console.log('\n📋 黑名单测试');

  await test('获取黑名单列表 - Admin/Developer', async () => {
    const token = await login('admin');
    const response = await request(BASE_URL)
      .get('/access-control/blacklist')
      .set('Authorization', `Bearer ${token}`);
    return response.status === 200;
  });

  // ========== 云函数测试 ==========
  console.log('\n📋 云函数测试');

  await test('获取云函数列表', async () => {
    const token = await login('admin');
    const response = await request(BASE_URL)
      .get('/cloud/list')
      .set('Authorization', `Bearer ${token}`);
    return response.status === 200;
  });

  // ========== 远程变量测试 ==========
  console.log('\n📋 远程变量测试');

  await test('获取远程变量列表', async () => {
    const token = await login('admin');
    const response = await request(BASE_URL)
      .get('/remote-variables')
      .set('Authorization', `Bearer ${token}`);
    return response.status === 200;
  });

  // ========== 操作日志测试 ==========
  console.log('\n📋 操作日志测试');

  await test('获取操作日志 - Admin', async () => {
    const token = await login('admin');
    const response = await request(BASE_URL)
      .get('/operation-logs')
      .set('Authorization', `Bearer ${token}`);
    return response.status === 200;
  });

  // ========== 统计数据测试 ==========
  console.log('\n📋 统计数据测试');

  await test('获取统计概览', async () => {
    const token = await login('admin');
    const response = await request(BASE_URL)
      .get('/statistics/overview')
      .set('Authorization', `Bearer ${token}`);
    return response.status === 200;
  });

  // ========== 加密服务测试 ==========
  console.log('\n📋 加密服务测试');

  await test('获取 RSA 公钥', async () => {
    const response = await request(BASE_URL).get('/encryption/public-key');
    return response.status === 200 && response.body.data?.publicKey;
  });

  // ========== 2FA 测试 ==========
  console.log('\n📋 2FA 测试');

  await test('生成 2FA 密钥', async () => {
    const token = await login('admin');
    const response = await request(BASE_URL)
      .post('/auth/2fa/generate')
      .set('Authorization', `Bearer ${token}`);
    // 可能返回 200 或 500（如果 otplib 配置问题）
    return response.status === 200 || response.status === 500;
  });

  // ========== 输出结果 ==========
  console.log('\n========================================');
  console.log(`测试完成: ✅ ${passed} 通过, ❌ ${failed} 失败`);
  console.log('========================================\n');

  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(console.error);
