import { ExtractJwt, Strategy } from "passport-jwt";
import { PassportStrategy } from "@nestjs/passport";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { EndUser } from "../../end-users/entities/end-user.entity";
import { Admin } from "../../users/entities/user.entity";
import { Device } from "../../devices/entities/device.entity";
import { SessionKeyStore } from "../../common/services/session-key.store";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService,
    @InjectRepository(EndUser) private readonly endUsers: Repository<EndUser>,
    private readonly sessions: SessionKeyStore,
    @InjectRepository(Admin) private readonly admins: Repository<Admin>,
    @InjectRepository(Device) private readonly devices: Repository<Device>,
  ) {
    const secret = configService.get<string>("JWT_SECRET");
    if (!secret || secret.length < 32) throw new Error("JWT_SECRET 必须至少 32 个字符");
    super({ jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), ignoreExpiration: false, secretOrKey: secret,
      algorithms: ["HS256"] });
  }

  async validate(payload: any) {
    if (!Number.isSafeInteger(payload.sub) || payload.sub < 1 || !Number.isInteger(payload.ver)) {
      throw new UnauthorizedException("请重新登录");
    }
    if (payload.type === "end_user") {
      const user = await this.endUsers.findOne({ where: { id: payload.sub } });
      if (!user || !user.is_active || user.token_version !== payload.ver || Number(user.app_id) !== Number(payload.app_id)) {
        throw new UnauthorizedException("登录已失效或账号已禁用");
      }
      const session = await this.sessions.getSession(payload.sid, user.id);
      const device = await this.devices.findOne({ where: { app_id: Number(user.app_id), end_user_id: user.id, hwid: session.hwid } });
      if (!device || device.is_banned) throw new UnauthorizedException("设备已解绑或封禁，请重新登录");
      return { id: user.id, userId: user.id, username: user.username, type: "end_user", app_id: Number(user.app_id),
        session_id: session.id, session_public_key: session.public_key, hwid: session.hwid, token_version: user.token_version };
    }
    if (payload.type !== "admin") throw new UnauthorizedException("请重新登录");
    const user = await this.admins.findOne({ where: { id: payload.sub }, relations: ["role_relation", "role_relation.permissions"] });
    if (!user || !user.is_active || user.token_version !== payload.ver ||
        (user.expire_at && (!Number.isFinite(new Date(user.expire_at).getTime()) || new Date(user.expire_at).getTime() <= Date.now()))) {
      throw new UnauthorizedException("账号已失效，请重新登录");
    }
    return { id: user.id, userId: user.id, username: user.username, type: "admin", role: user.role,
      role_id: user.role_id, role_name: user.role_relation?.name, parent_id: user.parent_id ? Number(user.parent_id) : null,
      permissions: user.role_relation?.permissions?.map(p => p.code) || [], token_version: user.token_version };
  }
}
