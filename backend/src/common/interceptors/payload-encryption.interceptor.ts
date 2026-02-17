import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { EncryptionService } from "../encryption/encryption.service";
import { Reflector } from "@nestjs/core";

@Injectable()
export class PayloadEncryptionInterceptor implements NestInterceptor {
  constructor(
    private readonly encryptionService: EncryptionService,
    private readonly reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const isEncrypted = request.headers["x-encryption"] === "true";

    // Handle Request Decryption
    if (isEncrypted && request.body && request.body.data && request.body.key) {
      try {
        // 1. Decrypt AES Key with RSA Private Key
        const aesKey = this.encryptionService.decryptRSA(request.body.key);
        // 2. Decrypt Data with AES Key
        const decryptedData = this.encryptionService.decryptAES(
          request.body.data,
          aesKey,
        );

        // Replace body with decrypted data
        request.body = decryptedData;

        // Store AES key in request for Response Encryption
        request["aesKey"] = aesKey;
      } catch (e) {
        throw new BadRequestException("Decryption failed");
      }
    }

    // Handle Response Encryption
    return next.handle().pipe(
      map((data) => {
        // If request had AES key, we should encrypt response?
        // Or if specific header/metadata set?
        // Let's encrypt if request was encrypted OR checks for property.
        // For now, mirroring request behavior is safest for hybrid.
        const aesKey = request["aesKey"];
        if (aesKey && data) {
          // Encrypt response data
          // We return { data: "encrypted" }?
          // Or just string? Usually JSON object wrapper is better.
          const encrypted = this.encryptionService.encryptAES(data, aesKey);
          return { data: encrypted };
        }
        return data;
      }),
    );
  }
}
