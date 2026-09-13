
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  BadRequestException,
  ForbiddenException,
  Inject,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Request } from "express";
import * as crypto from "crypto";
import { InjectRepository } from "@nestjs/typeorm";
import { App } from "../../apps/entities/app.entity";
import { LessThan, Repository } from "typeorm";
import { SignatureNonce } from "../entities/signature-nonce.entity";

@Injectable()
export class SignatureGuard implements CanActivate {
  private nonceChecks = 0;
  constructor(
    @InjectRepository(App)
    private readonly appRepository: Repository<App>,
    @InjectRepository(SignatureNonce)
    private readonly nonceRepository: Repository<SignatureNonce>,
    private reflector: Reflector,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    // 1. Check if signature verification is bypassed (optional decorator)
    const isPublic = this.reflector.get<boolean>(
      "isPublic",
      context.getHandler(),
    );
    if (isPublic) return true;

    // 2. Get headers
    const timestamp = request.headers["x-timestamp"] as string;
    const nonce = request.headers["x-nonce"] as string;
    const signature = request.headers["x-signature"] as string;
    const appId = request.headers["x-app-id"] as string;

    if (!timestamp || !nonce || !signature || !appId) {
      throw new BadRequestException("Missing signature headers");
    }
    if (!/^[A-Za-z0-9._~-]{16,128}$/.test(nonce)) {
      throw new BadRequestException("Invalid nonce");
    }

    // 3. Verify Timestamp (±60 seconds)
    const now = Math.floor(Date.now() / 1000);
    const reqTime = Number(timestamp);
    if (!/^\d{10}$/.test(timestamp) || !Number.isSafeInteger(reqTime) || Math.abs(now - reqTime) > 60) {
      throw new UnauthorizedException("Request timestamp expired");
    }

    // 4. Get App Secret
    // We assume the app_id is passed in header 'x-app-id'
    if (!/^[1-9]\d{0,9}$/.test(appId)) throw new BadRequestException("Invalid App ID");
    const app = await this.appRepository.createQueryBuilder("app")
      .addSelect("app.app_secret")
      .where("app.id = :id", { id: Number(appId) })
      .getOne();
    if (!app || !app.is_active) {
      throw new UnauthorizedException("Invalid or inactive App ID");
    }
    const appSecret = app.app_secret;

    // 5. Reconstruct Signature
    // Format: sort params -> key=value&key=value... -> + body + timestamp + nonce
    // Simplified strategy:
    // Data = "app_id={appId}&nonce={nonce}&timestamp={timestamp}" + (body ? JSON.stringify(body) : "")
    // Or just sign the body and headers.
    // Let's use a standard efficient way: HMACSHA256(timestamp + nonce + body, secret)

    // Sort query keys to ensure consistency if we include query params
    const queryParams = request.query;
    const sortedQuery = Object.keys(queryParams)
      .sort()
      .map((key) => `${key}=${queryParams[key]}`)
      .join("&");

    const body = request.body;
    // Important: request.body might be an object. We need the raw string or deterministic stringify.
    // NestJS parses body by default. fast-json-stable-stringify is good, or simpliy JSON.stringify if client uses same.
    // Let's assume content-type application/json and normalized body.
    // For robustness, usually we sign the raw body.
    // In NestJS, getting raw body requires raw body parsing to be enabled.
    // A simpler approach for JSON APIs:
    // Signature = HMAC( app_id + timestamp + nonce + sorted_query_string + JSON.stringify(body), secret )

    const rawBody = (request as any).rawBody;
    const bodyString = rawBody instanceof Buffer
      ? rawBody.toString("utf8")
      : (body && Object.keys(body).length) ? JSON.stringify(body) : "";
    // Note: JSON.stringify is not deterministic for key order.
    // Client must strictly produce same string, or we use a deterministic serializer.
    // For now, let's assume body is minimal or we just sign the timestamp+nonce for auth,
    // but better to sign body to prevent tampering.

    const dataToSign = `app_id=${appId}&nonce=${nonce}&timestamp=${timestamp}${sortedQuery ? "&" + sortedQuery : ""}${bodyString}`;

    const hmac = crypto.createHmac("sha256", appSecret);
    hmac.update(dataToSign);
    const calculatedSignature = hmac.digest("hex");

    if (!/^[a-f0-9]{64}$/i.test(signature) ||
        !crypto.timingSafeEqual(Buffer.from(calculatedSignature, "hex"), Buffer.from(signature, "hex"))) {
      throw new UnauthorizedException("Invalid signature");
    }

    try {
      await this.nonceRepository.insert({ app_id: app.id, nonce, expires_at: new Date(Date.now() + 120_000) });
    } catch {
      throw new UnauthorizedException("请求已处理或 nonce 重放");
    }
    if (++this.nonceChecks % 100 === 0) {
      await this.nonceRepository.delete({ expires_at: LessThan(new Date()) });
    }

    // 6. Strict App Isolation Check
    // If the route has an :appId param, it MUST match the signed App ID.
    const paramAppId = request.params.appId;
    const claimedAppId = Array.isArray(paramAppId) ? paramAppId[0] : paramAppId;

    if (claimedAppId && Number(claimedAppId) !== app.id) {
      throw new ForbiddenException("App ID mismatch: You can only access resources belonging to your App");
    }

    const authenticatedUser: any = request.user;
    if (authenticatedUser?.type === "end_user" && Number(authenticatedUser.app_id) !== app.id) {
      throw new ForbiddenException("会话与应用不匹配");
    }

    // Attach app to request for controllers to use
    // Rename to avoided conflict with Express req.app
    (request as any).validatedApp = app;

    return true;
  }
}
