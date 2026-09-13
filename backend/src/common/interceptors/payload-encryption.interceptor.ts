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

    // Decryption runs in ApiAuthGuard before Passport reads credentials.
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
