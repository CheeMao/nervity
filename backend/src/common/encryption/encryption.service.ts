import { Injectable, OnModuleInit } from "@nestjs/common";
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
