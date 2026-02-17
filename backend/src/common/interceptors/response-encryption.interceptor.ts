import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { Response } from "express";
import * as crypto from "crypto";

/**
 * 响应加密拦截器
 *
 * 对所有客户端 API 响应进行 AES 加密。
 * 加密流程：
 * 1. 服务器生成随机 AES 密钥（每次响应不同）
 * 2. 用 AES 加密响应数据
 * 3. 用预置的 RSA 公钥加密 AES 密钥（客户端用私钥解密）
 * 4. 返回加密数据和加密后的密钥
 *
 * 客户端解密流程：
 * 1. 用 RSA 私钥解密获得 AES 密钥
 * 2. 用 AES 密钥解密响应数据
 */
@Injectable()
export class ResponseEncryptionInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ResponseEncryptionInterceptor.name);

  // 客户端 RSA 公钥（用于加密 AES 密钥）
  private readonly clientPublicKey: string | null;

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

  constructor() {
    // 在构造函数中处理环境变量
    const rawKey = process.env.CLIENT_RSA_PUBLIC_KEY;
    this.encryptionEnabled = process.env.RESPONSE_ENCRYPTION === 'true';

    if (rawKey) {
      // 处理换行符
      this.clientPublicKey = rawKey.replace(/\\n/g, '\n');
      this.logger.log(`加密已启用，公钥长度: ${this.clientPublicKey.length}`);
    } else {
      this.clientPublicKey = null;
      this.logger.warn('CLIENT_RSA_PUBLIC_KEY 未配置，加密功能已禁用');
    }

    this.logger.log(`RESPONSE_ENCRYPTION: ${this.encryptionEnabled}`);
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const path = request.route?.path || request.path;

    // 检查是否需要加密
    const shouldEncrypt = this.encryptionEnabled &&
      this.clientPublicKey &&
      this.encryptedPaths.some(p => path.includes(p));

    if (shouldEncrypt) {
      this.logger.debug(`加密路径: ${path}`);
    }

    return next.handle().pipe(
      map((data) => {
        if (!shouldEncrypt) {
          return data;
        }

        try {
          return this.encryptResponse(data);
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
   * 加密响应数据
   */
  private encryptResponse(data: any): any {
    // 1. 生成随机 AES-256 密钥
    const aesKey = crypto.randomBytes(32); // 256 bits
    const iv = crypto.randomBytes(16);     // 128 bits

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
        key: this.clientPublicKey!,
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
