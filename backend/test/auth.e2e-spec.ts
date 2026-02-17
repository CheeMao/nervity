import { TestUtils } from './test-utils';
import request from 'supertest';

describe('AuthController (e2e)', () => {
  let httpServer: any;

  beforeAll(async () => {
    httpServer = await TestUtils.getHttpServer();
  });

  afterAll(async () => {
    await TestUtils.closeApp();
  });

  describe('/api/auth/login (POST)', () => {
    it('应该成功登录管理员账户', async () => {
      const response = await request(httpServer)
        .post('/api/auth/login')
        .send({ username: 'admin', password: 'admin123' });

      expect([200, 201]).toContain(response.status);
      const data = TestUtils.extractData(response);
      expect(data).toHaveProperty('access_token');
      expect(typeof data.access_token).toBe('string');
    });

    it('登录失败应该返回401（错误密码）', async () => {
      const response = await request(httpServer)
        .post('/api/auth/login')
        .send({ username: 'admin', password: 'wrongpassword' });

      expect(response.status).toBe(401);
    });

    it('登录失败应该返回401（不存在的用户）', async () => {
      const response = await request(httpServer)
        .post('/api/auth/login')
        .send({ username: 'nonexistent', password: 'password' });

      expect(response.status).toBe(401);
    });
  });

  describe('/api/users/profile (GET) - 需要认证', () => {
    it('应该返回当前用户信息', async () => {
      const user = await TestUtils.getTestUser('admin');
      const response = await TestUtils.authGet(user.token, '/api/users/profile');

      expect(response.status).toBe(200);
      const data = TestUtils.extractData(response);
      expect(data).toHaveProperty('userId');
      expect(data).toHaveProperty('name');
      expect(data).toHaveProperty('role');
    });

    it('未认证应该返回401', async () => {
      const response = await request(httpServer)
        .get('/api/users/profile');

      expect(response.status).toBe(401);
    });
  });

  describe('/api/auth/2fa/generate (POST) - 2FA功能', () => {
    it('应该生成2FA密钥（需要认证）', async () => {
      const user = await TestUtils.getTestUser('admin');
      const response = await TestUtils.authPost(user.token, '/api/auth/2fa/generate');

      expect(response.status).toBe(200);
      const data = TestUtils.extractData(response);
      expect(data).toHaveProperty('secret');
      expect(data).toHaveProperty('qrCode');
    });

    it('未认证应该返回401', async () => {
      const response = await request(httpServer)
        .post('/api/auth/2fa/generate');

      expect(response.status).toBe(401);
    });
  });
});
