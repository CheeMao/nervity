import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

/**
 * 可选 JWT 认证守卫
 * 如果 JWT token 有效，则设置 req.user
 * 如果 token 无效或不存在，不抛出异常，继续执行请求
 */
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard("jwt") {
  handleRequest(err: any, user: any) {
    // 不抛出错误，即使没有用户也继续
    return user;
  }
}
