import { ExtractJwt, Strategy } from "passport-jwt";
import { PassportStrategy } from "@nestjs/passport";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>("JWT_SECRET", "secretKey"),
    });
  }

  async validate(payload: any) {
    // 支持两种用户类型：管理后台用户 (role) 和终端用户 (type: end_user)
    return {
      id: payload.sub,
      userId: payload.sub,
      username: payload.username,
      role: payload.role,           // 管理后台用户 - 保留向后兼容
      role_id: payload.role_id,     // 管理后台用户
      role_name: payload.role_name, // 动态角色名称
      permissions: payload.permissions || [], // 权限列表
      type: payload.type,           // 终端用户: "end_user"
      app_id: payload.app_id,       // 终端用户所属应用
      parent_id: payload.parent_id, // 上级ID (代理商所属开发者)
    };
  }
}
