import { Injectable, ForbiddenException, NotFoundException, BadRequestException } from "@nestjs/common";
import { DataSource } from "typeorm";
import { DataPermissionService, CurrentUser } from "../../common/services/data-permission.service";
import { App } from "../../apps/entities/app.entity";
import { Admin } from "../../users/entities/user.entity";
import { Card } from "../../cards/entities/card.entity";
import { CardType } from "../../card-types/entities/card-type.entity";
import { CloudFunction } from "../../cloud-functions/entities/cloud-function.entity";
import { RemoteVariable } from "../../remote-variables/entities/remote-variable.entity";
import { EndUser } from "../../end-users/entities/end-user.entity";
import { Device } from "../../devices/entities/device.entity";

const entities = { app: App, user: Admin, card: Card, "card-type": CardType,
  cloud: CloudFunction, variable: RemoteVariable, "end-user": EndUser, device: Device };

/** Applied before management controllers, including legacy detail and mutation routes. */
@Injectable()
export class ResourcePolicyService {
  constructor(private readonly db: DataSource, private readonly policy: DataPermissionService) {}

  async check(kind: string, request: any): Promise<void> {
    const user: CurrentUser = request.user;
    const userId = this.policy.assertAdmin(user);
    const path = request.route?.path || request.path;
    if (kind === "user" && /\/(profile|change-password)$/.test(path)) return;
    const read = request.method === "GET";
    const action = read ? "read" : request.method === "DELETE" ? "delete" : request.method === "POST" ? "create" : "update";
    const operation = path.endsWith("/generate") ? "generate" : path.endsWith("/ban") || path.endsWith("/unban") ? (["device", "card"].includes(kind) ? "update" : "ban") : action;
    const permission = `${kind}:${operation}`;
    if (user.role !== "admin" && !user.permissions?.includes(permission)) throw new ForbiddenException("缺少操作权限");
    const id = request.params.id;
    if (id !== undefined) {
      if (!/^[1-9]\d*$/.test(String(id)) || !Number.isSafeInteger(Number(id))) throw new BadRequestException("无效资源 ID");
      const item: any = await this.db.getRepository(entities[kind]).findOne({ where: { id: Number(id) } });
      if (!item) throw new NotFoundException("资源不存在");
      if (kind === "user") {
        if (user.role !== "admin" && (user.role !== "developer" || Number(item.parent_id) !== userId || Number(item.id) === userId)) throw new ForbiddenException("只能管理下属用户");
      } else if (kind === "end-user") await this.checkEndUser(item, user);
      else if (kind === "device") {
        const owner = item.end_user_id && await this.db.getRepository(EndUser).findOneBy({ id: item.end_user_id });
        if (owner) await this.checkEndUser(owner, user);
        else await this.checkApp(item.app_id, user, false);
      } else if (kind === "cloud" || kind === "variable") {
        await this.checkApp(item.app_id, user, false);
      } else {
        await this.policy.assertCreator(item.creator_id, user, read && ["app", "card-type"].includes(kind));
        if (user.role === "agent" && read && ["app", "card-type"].includes(kind)) await this.checkApp(kind === "app" ? item.id : item.app_id, user, true);
      }
    }
    if (kind === "device" && request.params.userId) {
      const owner = await this.db.getRepository(EndUser).findOneBy({ id: Number(request.params.userId) });
      if (!owner) throw new NotFoundException("用户不存在");
      await this.checkEndUser(owner, user);
    }
    if (kind === "device" && request.params.hwid && user.role !== "admin") throw new ForbiddenException("请通过用户设备列表查询");
    // Prevent attaching an owned resource to another tenant's application.
    if (!read && request.body?.app_id !== undefined && kind !== "app") {
      await this.checkApp(request.body.app_id, user, kind === "card");
    }
    // Entity IDs, creator and activation history never come from management payloads.
    for (const key of ["id", "creator_id", "parent_id", "token_version", "has_used_trial", "used_by", "used_by_id", "status", "card_creator_id"]) {
      if (request.body && key in request.body) throw new BadRequestException(`不能修改字段 ${key}`);
    }
  }

  private async checkApp(id: number, user: CurrentUser, viewParent: boolean) {
    const app = await this.db.getRepository(App).findOneBy({ id: Number(id) });
    if (!app) throw new NotFoundException("应用不存在");
    await this.policy.assertCreator(app.creator_id, user, viewParent);
    if (viewParent && user.role === "agent" && !app.agent_visible) throw new ForbiddenException("应用未向代理开放");
  }

  private async checkEndUser(item: EndUser, user: CurrentUser) {
    if (user.role === "admin") return;
    if (user.role === "agent") {
      if (Number(item.card_creator_id) !== Number(user.userId)) throw new ForbiddenException("无权管理此用户");
    } else await this.checkApp(item.app_id, user, false);
  }
}
