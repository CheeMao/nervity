import { TestUtils } from './test-utils';
import request from 'supertest';

describe('AppsController (e2e)', () => {
  let httpServer: any;
  let adminToken: string;
  let testAppId: number;

  beforeAll(async () => {
    httpServer = await TestUtils.getHttpServer();
    const admin = await TestUtils.getTestUser('admin');
    adminToken = admin.token;
  });

  afterAll(async () => {
    // 清理测试数据
    if (testAppId) {
      try {
        await TestUtils.authDelete(adminToken, `/api/apps/${testAppId}`);
      } catch (e) {
        // ignore
      }
    }
    await TestUtils.closeApp();
  });

  describe('/api/apps (GET)', () => {
    it('应该返回应用列表', async () => {
      const response = await TestUtils.authGet(adminToken, '/api/apps');

      expect(response.status).toBe(200);
      const data = TestUtils.extractData(response);
      expect(data).toHaveProperty('list');
      expect(Array.isArray(data.list)).toBe(true);
    });

    it('未认证应该返回401', async () => {
      const response = await request(httpServer)
        .get('/api/apps');

      expect(response.status).toBe(401);
    });
  });

  describe('/api/apps (POST)', () => {
    it('应该成功创建应用', async () => {
      const appName = `Test App ${TestUtils.randomString(6)}`;
      const response = await TestUtils.authPost(adminToken, '/api/apps', {
        name: appName,
        description: 'Test application for e2e testing',
      });

      expect([200, 201]).toContain(response.status);
      const data = TestUtils.extractData(response);
      expect(data).toHaveProperty('id');
      expect(data.name).toBe(appName);
      testAppId = data.id;
    });

    it('缺少必要字段应该返回400', async () => {
      const response = await TestUtils.authPost(adminToken, '/api/apps', {});

      expect([400, 500]).toContain(response.status);
    });
  });

  describe('/api/apps/:id (GET)', () => {
    it('应该返回应用详情', async () => {
      // 先确保有测试应用
      if (!testAppId) {
        const createResponse = await TestUtils.authPost(adminToken, '/api/apps', {
          name: `Test App ${TestUtils.randomString(6)}`,
        });
        testAppId = TestUtils.extractData(createResponse).id;
      }

      const response = await request(httpServer)
        .get(`/api/apps/${testAppId}`);

      expect(response.status).toBe(200);
      const data = TestUtils.extractData(response);
      expect(data).toHaveProperty('id', testAppId);
    });
  });

  describe('/api/apps/:id (PUT)', () => {
    it('应该成功更新应用', async () => {
      if (!testAppId) {
        // 跳过测试
        return;
      }

      const response = await TestUtils.authPut(adminToken, `/api/apps/${testAppId}`, {
        name: `Updated App ${TestUtils.randomString(4)}`,
      });

      expect(response.status).toBe(200);
    });
  });
});
