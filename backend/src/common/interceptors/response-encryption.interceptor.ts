import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
  Inject,
  InternalServerErrorException,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import * as crypto from "crypto";
import { SessionKeyStore } from "../services/session-key.store";

/**
 * 响应加密拦截器
 *
 * 对客户端 API 响应进行 AES 加密。
 * 优先使用会话公钥（每次登录动态协商），降级到环境变量中的固定公钥。
 *
 * 加密流程：
 * 1. 服务器生成随机 AES 密钥（每次响应不同）
 * 2. 用 AES 加密响应数据
 * 3. 用 RSA 公钥加密 AES 密钥（客户端用私钥解密）
 * 4. 返回加密数据和加密后的密钥
 */
@Injectable()
export class ResponseEncryptionInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ResponseEncryptionInterceptor.name);

  // 固定的客户端 RSA 公钥（降级方案，兼容老客户端）
  private readonly fallbackPublicKey: string | null;

  // 是否启用强制加密
  private readonly encryptionEnabled: boolean;

  // 需要加密的路径前缀
  private readonly encryptedPaths = [
    '/client/',
    '/cards/trial',
    '/cards/redeem',
    '/remote-variables/app',
    '/cloud/run',
  ];

  // 明文放行的路径（即使命中 encryptedPaths 也不加密）
  // 这些接口返回的是公开信息、或者调用方（未登录的 GET）无法协商会话密钥，加了也解不开
  private readonly unencryptedPaths = [
    '/client/app-info',
  ];

  constructor(
    @Inject(SessionKeyStore) private readonly sessionKeyStore: SessionKeyStore,
  ) {
    const rawKey = process.env.CLIENT_RSA_PUBLIC_KEY;
    this.encryptionEnabled = process.env.RESPONSE_ENCRYPTION === 'true';

    if (rawKey) {
      this.fallbackPublicKey = rawKey.replace(/\\n/g, '\n');
      this.logger.log(`加密已启用，降级公钥长度: ${this.fallbackPublicKey.length}`);
    } else {
      this.fallbackPublicKey = null;
    }

    this.logger.log(`RESPONSE_ENCRYPTION: ${this.encryptionEnabled}`);
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const path = request.route?.path || request.path;

    const shouldEncryptPath = this.encryptionEnabled &&
      this.encryptedPaths.some(p => path.includes(p)) &&
      !this.unencryptedPaths.some(p => path.includes(p));

    return next.handle().pipe(
      map((data) => {
        if (!shouldEncryptPath) {
          return data;
        }

        // 确定使用哪个公钥：会话公钥 > 请求中携带的公钥（登录时） > 固定公钥
        const publicKey = this.resolvePublicKey(request);

        if (!publicKey) {
          throw new InternalServerErrorException("客户端未协商响应公钥");
        }

        try {
          return this.encryptResponse(data, publicKey);
        } catch (error) {
          this.logger.error(`加密响应失败: ${error.message}`);
          return {
            status: 500,
            code: 50000,
            msg: "响应加密失败",
            encrypted: false,
          };
        }
      }),
    );
  }

  /**
   * 确定使用哪个 RSA 公钥
   * 优先级：会话公钥 > 登录请求中的公钥 > 环境变量固定公钥
   */
  private resolvePublicKey(request: any): string | null {
    // 1. 已登录用户：从 SessionKeyStore 获取会话公钥
    const sessionKey = request.user?.session_public_key;
    if (sessionKey) return sessionKey;

    // 2. 登录请求：从请求体中获取（login 接口还没有 JWT，用 body 中的 session_public_key）
    if (request.body?.session_public_key) {
      return request.body.session_public_key;
    }

    // 3. 降级：使用环境变量中的固定公钥（兼容老客户端）
    return this.fallbackPublicKey;
  }

  /**
   * 加密响应数据
   */
  private encryptResponse(data: any, publicKey: string): any {
    // 1. 生成随机 AES-256 密钥
    const aesKey = crypto.randomBytes(32);
    const iv = crypto.randomBytes(16);

    // 2. 序列化数据
    const jsonData = JSON.stringify(data);

    // 3. AES 加密数据
    const cipher = crypto.createCipheriv("aes-256-cbc", aesKey, iv);
    let encryptedData = cipher.update(jsonData, "utf8", "base64");
    encryptedData += cipher.final("base64");

    // 4. 用 RSA 公钥加密 AES 密钥和 IV
    const keyData = Buffer.concat([aesKey, iv]);
    const encryptedKey = crypto.publicEncrypt(
      {
        key: publicKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: "sha256",
      },
      keyData,
    );

    // 5. 生成签名（防篡改）
    const hmac = crypto.createHmac("sha256", aesKey);
    hmac.update(encryptedData);
    const signature = hmac.digest("hex");

    return {
      encrypted: true,
      algorithm: "AES-256-CBC",
      data: encryptedData,
      key: encryptedKey.toString("base64"),
      signature: signature,
    };
  }
}
