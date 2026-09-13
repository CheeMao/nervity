import { BadRequestException, Injectable, OnModuleInit } from "@nestjs/common";
import NodeRSA from "node-rsa";
import * as CryptoJS from "crypto-js";

@Injectable()
export class EncryptionService implements OnModuleInit {
  private key: NodeRSA;
  private publicKey: string;
  private privateKey: string;

  onModuleInit() {
    this.key = new NodeRSA({ b: 2048 });
    this.key.setOptions({ encryptionScheme: "pkcs1" });
    this.publicKey = this.key.exportKey("pkcs8-public-pem");
    this.privateKey = this.key.exportKey("pkcs8-private-pem");
  }

  decryptRequest(request: any): void {
    if (request.headers?.["x-encryption"] !== "true" || request.aesKey) return;
    const body = request.body;
    if (!body || typeof body.data !== "string" || typeof body.key !== "string") {
      throw new BadRequestException("加密请求格式无效");
    }
    try {
      const aesKey = this.decryptRSA(body.key);
      const data = this.decryptAES(body.data, aesKey);
      if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error();
      request.body = data;
      request.aesKey = aesKey;
    } catch { throw new BadRequestException("请求解密失败"); }
  }

  getPublicKey() {
    return this.publicKey;
  }

  decryptRSA(encryptedData: string): string {
    return this.key.decrypt(encryptedData, "utf8");
  }

  decryptAES(encryptedData: string, key: string): any {
    const bytes = CryptoJS.AES.decrypt(encryptedData, key);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    try {
      return JSON.parse(decrypted);
    } catch (e) {
      return decrypted;
    }
  }

  encryptAES(data: any, key: string): string {
    const stringData =
      typeof data === "object" ? JSON.stringify(data) : data.toString();
    return CryptoJS.AES.encrypt(stringData, key).toString();
  }
}
