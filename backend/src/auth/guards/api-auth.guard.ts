import { ResourcePolicyService } from "./resource-policy.service";
import { ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthGuard } from "@nestjs/passport";
import { ACCESS_SCOPE, MANAGED_RESOURCE } from "../decorators/access-scope.decorator";
import { RolesGuard } from "./roles.guard";
import { EncryptionService } from "../../common/encryption/encryption.service";
import { BlacklistService } from "../../access-control/blacklist.service";

/** Every route is a management route unless explicitly declared public/client. */
@Injectable()
export class ApiAuthGuard extends AuthGuard("jwt") {
  constructor(
    private readonly reflector: Reflector,
    private readonly encryption: EncryptionService,
    private readonly blacklist: BlacklistService,
    private readonly resources: ResourcePolicyService,
  ) { super(); }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    this.encryption.decryptRequest(request);
    const scope = this.reflector.getAllAndOverride<string>(ACCESS_SCOPE, [
      context.getHandler(), context.getClass(),
    ]);
    if (scope === "public" || scope === "client") {
      const blocked = await this.blacklist.isBlocked(request.ip, request.body?.hwid);
      if (blocked.blocked) throw new ForbiddenException("访问已被封禁");
    }
    if (scope === "public") return true;

    await super.canActivate(context);
    const expectedType = scope === "client" ? "end_user" : "admin";
    if (request.user?.type !== expectedType) {
      throw new ForbiddenException("此身份不能访问该接口");
    }
    if (expectedType === "end_user") return true;
    if (!new RolesGuard(this.reflector).canActivate(context)) return false;
    const resource = this.reflector.get<string>(MANAGED_RESOURCE, context.getClass());
    if (resource) await this.resources.check(resource, request);
    return true;
  }
}
