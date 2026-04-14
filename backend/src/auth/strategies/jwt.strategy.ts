import { ExtractJwt, Strategy } from "passport-jwt";
import { PassportStrategy } from "@nestjs/passport";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { EndUser } from "../../end-users/entities/end-user.entity";
import { SessionKeyStore } from "../../common/services/session-key.store";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    @InjectRepository(EndUser)
    private endUserRepository: Repository<EndUser>,
    private sessionKeyStore: SessionKeyStore,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>("JWT_SECRET", "secretKey"),
    });
  }

  async validate(payload: any) {
    // 终端用户：检查账户状态和吊销
    if (payload.type === "end_user") {
      // 检查是否被主动吊销
      if (this.sessionKeyStore.isRevoked(payload.sub)) {
        throw new UnauthorizedException("登录已失效，请重新登录");
      }

      // 查库确认用户状态
      const user = await this.endUserRepository.findOne({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new UnauthorizedException("用户不存在");
      }

      if (!user.is_active) {
        throw new UnauthorizedException("账户已被禁用");
      }

      if (user.expire_time && new Date(user.expire_time) < new Date()) {
        throw new UnauthorizedException("授权已过期");
      }
    }

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
