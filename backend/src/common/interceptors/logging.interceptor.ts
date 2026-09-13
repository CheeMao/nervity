import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";
import { OperationLogsService } from "../../operation-logs/operation-logs.service";
import { OperationMethod } from "../../operation-logs/entities/operation-log.entity";

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  constructor(private readonly operationLogsService: OperationLogsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const { method, url, body, query, user } = req;
    const userAgent = req.get("user-agent") || "";

    // Get real IP address, check proxy headers first
    const rawIp =
      req.get("x-forwarded-for")?.split(",")[0].trim() ||
      req.get("x-real-ip") ||
      req.ip ||
      req.connection?.remoteAddress ||
      "";

    // Format IP: convert ::1 to 127.0.0.1, extract IPv4 from ::ffff:x.x.x.x
    const ip = this.formatIp(rawIp);

    // Only log state-changing methods or critical GETs if needed.
    // For now, let's log everything except perhaps purely read-only public things if volume is high.
    // Plan said: "记录管理员的关键操作", usually POST/PUT/DELETE.

    // Filter out some methods if desired.
    // if (method === 'GET') { return next.handle(); }

    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: (data) => {
          this.logOperation(
            req,
            method,
            url,
            query,
            body,
            ip,
            userAgent,
            user,
            200,
            Date.now() - startTime,
          );
        },
        error: (error) => {
          const status = error.status || 500;
          this.logOperation(
            req,
            method,
            url,
            query,
            body,
            ip,
            userAgent,
            user,
            status,
            Date.now() - startTime,
            error.message,
          );
        },
      }),
    );
  }

  private async logOperation(
    req: any,
    method: string,
    path: string,
    query: any,
    body: any,
    ip: string,
    userAgent: string,
    user: any,
    statusCode: number,
    executionTime: number,
    errorMessage?: string,
  ) {
    try {
      // Skip logging for login endpoint to avoid logging passwords in body (handled by masking but still)
      // or skip GET requests if we only want mutation logs
      if (method === "GET") return;
      // Operation logs are for backend operators; client actions have their own
      // audit trail and their IDs do not reference admins.id.
      if (user?.type === "end_user") return;

      // Mask sensitive fields
      const maskedBody = { ...body };
      const sensitiveFields = [
        "password",
        "token",
        "access_token",
        "refresh_token",
        "secret",
        "app_secret",
        "private_key",
        "session_public_key",
        "x-signature",
      ];
      sensitiveFields.forEach((field) => {
        if (maskedBody[field]) maskedBody[field] = "******";
      });

      await this.operationLogsService.create({
        admin_id: user?.userId || user?.id || user?.sub,
        admin_username: user?.username,
        method: method as OperationMethod,
        path,
        query: JSON.stringify(query),
        body: JSON.stringify(maskedBody),
        ip,
        user_agent: userAgent,
        status_code: statusCode,
        execution_time: executionTime,
        error_message: errorMessage,
      });
    } catch (e) {
      this.logger.error(`Failed to log operation: ${e.message}`, e.stack);
    }
  }

  /**
   * Format IP address to a more readable format
   * - ::1 -> 127.0.0.1 (IPv6 loopback)
   * - ::ffff:192.168.1.1 -> 192.168.1.1 (IPv4-mapped IPv6)
   */
  private formatIp(ip: string): string {
    if (!ip) return "";
    if (ip === "::1") return "127.0.0.1";
    // Handle IPv4-mapped IPv6 addresses (::ffff:x.x.x.x)
    if (ip.startsWith("::ffff:")) {
      return ip.substring(7);
    }
    return ip;
  }
}
