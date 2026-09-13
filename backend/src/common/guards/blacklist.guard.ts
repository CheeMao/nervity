import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from "@nestjs/common";
import { BlacklistService } from "../../access-control/blacklist.service";

@Injectable()
export class BlacklistGuard implements CanActivate {
  constructor(private readonly blacklistService: BlacklistService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const ip =
      request.ip ||
      request.headers["x-forwarded-for"] ||
      request.socket.remoteAddress;

    // Try to find HWID in body, query or headers
    // Common keys: hwid, device_id, machine_code
    const hwid =
      request.body?.hwid || request.query?.hwid || request.headers["x-hwid"];

    // Also check standard payload structure if body is present
    if (!hwid && request.body && typeof request.body === "object") {
      // Sometimes nested? No, standard is flattened.
    }

    // Checking logic
    const check = await this.blacklistService.isBlocked(ip, hwid);
    if (check.blocked) {
      throw new ForbiddenException(`Access denied: ${check.reason}`);
    }

    return true;
  }
}
