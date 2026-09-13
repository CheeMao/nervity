import { Public } from "./decorators/access-scope.decorator";
import { Controller, Request, Post, UseGuards, Body } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from "@nestjs/swagger";
import { Throttle, ThrottlerGuard } from "@nestjs/throttler";
import { AuthService } from "./auth.service";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";

@ApiTags('认证 (Auth)')
@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post("login")
  @UseGuards(ThrottlerGuard, AuthGuard("local"))
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  @ApiOperation({ summary: '用户登录', description: '使用用户名和密码登录系统，如果启用了2FA需要提供验证码。每个 IP 每分钟最多 30 次尝试。' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        username: { type: 'string', description: '用户名' },
        password: { type: 'string', description: '密码' },
        code: { type: 'string', description: '2FA验证码（如果启用了2FA）' },
      },
      required: ['username', 'password'],
    },
  })
  @ApiResponse({ status: 200, description: '登录成功，返回JWT Token', schema: {
    type: 'object',
    properties: {
      access_token: { type: 'string', description: 'JWT访问令牌' },
    },
  }})
  @ApiResponse({ status: 401, description: '认证失败，用户名或密码错误' })
  @ApiResponse({ status: 429, description: '登录尝试过于频繁' })
  async login(@Request() req, @Body() body) {
    return this.authService.login(req.user, body.code);
  }

  @Post("2fa/generate")
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '生成2FA密钥', description: '为当前用户生成双因素认证(TOTP)密钥和二维码' })
  @ApiResponse({ status: 200, description: '生成成功', schema: {
    type: 'object',
    properties: {
      secret: { type: 'string', description: 'TOTP密钥' },
      qrCode: { type: 'string', description: '二维码Data URL' },
    },
  }})
  @ApiResponse({ status: 401, description: '未授权' })
  async generateTotp(@Request() req) {
    return this.authService.generateTotpSecret(req.user);
  }

  @Post("2fa/enable")
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '启用2FA', description: '使用验证码启用双因素认证' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        code: { type: 'string', description: 'TOTP验证码' },
      },
      required: ['code'],
    },
  })
  @ApiResponse({ status: 200, description: '2FA启用成功' })
  @ApiResponse({ status: 400, description: '验证码错误' })
  @ApiResponse({ status: 401, description: '未授权' })
  async enableTotp(@Request() req, @Body() body) {
    return this.authService.enableTotp(req.user.userId, body.code);
  }

  @Post("2fa/disable")
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '禁用2FA', description: '使用验证码禁用双因素认证' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        code: { type: 'string', description: 'TOTP验证码' },
      },
      required: ['code'],
    },
  })
  @ApiResponse({ status: 200, description: '2FA禁用成功' })
  @ApiResponse({ status: 400, description: '验证码错误' })
  @ApiResponse({ status: 401, description: '未授权' })
  async disableTotp(@Request() req, @Body() body) {
    return this.authService.disableTotp(req.user.userId, body.code);
  }
}
