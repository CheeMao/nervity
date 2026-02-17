import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { TransformInterceptor } from '../src/common/interceptors/transform.interceptor';
import { AllExceptionsFilter } from '../src/common/filters/all-exceptions.filter';
import request from 'supertest';

export interface TestUser {
  id: number;
  username: string;
  role: string;
  token: string;
}

export class TestUtils {
  private static _app: INestApplication;
  private static users: Map<string, TestUser> = new Map();

  static async getApp(): Promise<INestApplication> {
    if (!this._app) {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
      }).compile();

      this._app = moduleFixture.createNestApplication();
      this._app.setGlobalPrefix('api');
      this._app.useGlobalFilters(new AllExceptionsFilter());
      this._app.useGlobalInterceptors(new TransformInterceptor());
      await this._app.init();
    }
    return this._app;
  }

  static async closeApp(): Promise<void> {
    if (this._app) {
      await this._app.close();
      this._app = null as any;
      this.users.clear();
    }
  }

  /**
   * 获取 HTTP 服务器
   */
  static async getHttpServer(): Promise<any> {
    const app = await this.getApp();
    return app.getHttpServer();
  }

  /**
   * 用户登录并获取 token
   */
  static async login(username: string, password: string): Promise<{ token: string; user: any }> {
    const httpServer = await this.getHttpServer();
    const response = await request(httpServer)
      .post('/api/auth/login')
      .send({ username, password });

    if (response.status !== 200 && response.status !== 201) {
      throw new Error(`Login failed for ${username}: ${JSON.stringify(response.body)}`);
    }

    // 响应可能在 data 字段中
    const data = response.body.data || response.body;
    return {
      token: data.access_token,
      user: data.user || { username },
    };
  }

  /**
   * 获取或创建测试用户 token
   */
  static async getTestUser(role: 'admin' | 'developer' | 'agent'): Promise<TestUser> {
    if (this.users.has(role)) {
      return this.users.get(role)!;
    }

    // 这些凭据需要根据实际数据库中的用户调整
    const credentials: Record<string, { username: string; password: string }> = {
      admin: { username: 'admin', password: 'admin123' },
      developer: { username: 'developer', password: 'developer123' },
      agent: { username: 'agent', password: 'agent123' },
    };

    const cred = credentials[role];
    if (!cred) {
      throw new Error(`Unknown role: ${role}`);
    }

    try {
      const { token, user } = await this.login(cred.username, cred.password);
      const testUser: TestUser = {
        id: user.id,
        username: cred.username,
        role,
        token,
      };
      this.users.set(role, testUser);
      return testUser;
    } catch (error) {
      throw new Error(`Failed to get test user for role ${role}: ${error}`);
    }
  }

  /**
   * 发送带认证的 GET 请求
   */
  static async authGet(token: string, url: string, query?: Record<string, any>) {
    const httpServer = await this.getHttpServer();
    const req = request(httpServer)
      .get(url)
      .set('Authorization', `Bearer ${token}`);

    if (query) {
      Object.keys(query).forEach(key => {
        req.query({ [key]: String(query[key]) });
      });
    }

    return req;
  }

  /**
   * 发送带认证的 POST 请求
   */
  static async authPost(token: string, url: string, body?: any) {
    const httpServer = await this.getHttpServer();
    return request(httpServer)
      .post(url)
      .set('Authorization', `Bearer ${token}`)
      .send(body);
  }

  /**
   * 发送带认证的 PUT 请求
   */
  static async authPut(token: string, url: string, body?: any) {
    const httpServer = await this.getHttpServer();
    return request(httpServer)
      .put(url)
      .set('Authorization', `Bearer ${token}`)
      .send(body);
  }

  /**
   * 发送带认证的 DELETE 请求
   */
  static async authDelete(token: string, url: string) {
    const httpServer = await this.getHttpServer();
    return request(httpServer)
      .delete(url)
      .set('Authorization', `Bearer ${token}`);
  }

  /**
   * 提取响应数据（处理统一的响应格式）
   */
  static extractData(response: request.Response): any {
    if (response.body && response.body.data !== undefined) {
      return response.body.data;
    }
    return response.body;
  }

  /**
   * 生成随机字符串
   */
  static randomString(length: number = 8): string {
    return Math.random().toString(36).substring(2, length + 2);
  }

  /**
   * 生成随机邮箱
   */
  static randomEmail(): string {
    return `test_${this.randomString(8)}@example.com`;
  }
}
