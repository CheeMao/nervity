import { licenseStatus } from "../common/utils/license";
import { ClientOnly } from "../auth/decorators/access-scope.decorator";
import { Public } from "../auth/decorators/access-scope.decorator";
import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  UseGuards,
  Request,
  Put,
  UnauthorizedException,
  NotFoundException,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from "@nestjs/swagger";
import { Throttle, ThrottlerGuard } from "@nestjs/throttler";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { EndUsersService } from "./end-users.service";
import { ClientRegisterDto, ClientLoginDto, ClientHeartbeatDto } from "./dto/client-auth.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { EndUser } from "./entities/end-user.entity";
import { App } from "../apps/entities/app.entity";
import { Device, DeviceStatus } from "../devices/entities/device.entity";
import { nowCN } from "../common/utils/timezone";

@ApiTags('客户端认证 (Client Auth)')
@Controller("client")
export class ClientAuthController {
  constructor(
    private readonly endUsersService: EndUsersService,
    @InjectRepository(App)
    private appsRepository: Repository<App>,
    @InjectRepository(Device)
    private devicesRepository: Repository<Device>,
  ) {}

  @Public()
  @Get("app-info/:appId")
  @ApiOperation({
    summary: '获取应用公开信息',
    description:
      '返回应用的公开配置：版本、下载地址、强制更新、公告、心跳间隔等。供 SDK 在登录/心跳前拉取，无需鉴权。不返回 app_secret、creator_id、代理商可见性、试用配置等内部字段。',
  })
  @ApiResponse({
    status: 200,
    description: '成功',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number' },
        name: { type: 'string' },
        version: { type: 'string' },
        min_supported_version: { type: 'string', nullable: true },
        release_channel: { type: 'string' },
        download_url: { type: 'string', nullable: true },
        force_update: { type: 'boolean' },
        announcement: { type: 'string', nullable: true },
        heart_interval: { type: 'number' },
        heartbeat_timeout_multiplier: { type: 'number' },
        is_active: { type: 'boolean' },
        metadata: { type: 'object', nullable: true },
      },
    },
  })
  @ApiResponse({ status: 404, description: '应用不存在' })
  async getAppInfo(@Param("appId") appId: string) {
    const app = await this.appsRepository.findOne({
      where: { id: parseInt(appId, 10) },
    });
    if (!app) {
      throw new NotFoundException("应用不存在");
    }
    return {
      id: app.id,
      name: app.name,
      version: app.version,
      min_supported_version: app.min_supported_version,
      release_channel: app.release_channel,
      download_url: app.download_url,
      force_update: app.force_update,
      announcement: app.announcement,
      heart_interval: app.heart_interval,
      heartbeat_timeout_multiplier: app.heartbeat_timeout_multiplier,
      is_active: app.is_active,
      metadata: app.metadata,
    };
  }

  @Public()
  @Post("register")
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiOperation({
    summary: '客户端注册',
    description:
      '终端用户注册账号。每个 IP 每分钟最多 5 次注册。若应用开启试用且请求携带 hwid，同一 hwid 仅允许领取一次。',
  })
  @ApiBody({ type: ClientRegisterDto })
  @ApiResponse({
    status: 201,
    description: '注册成功',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number' },
        username: { type: 'string' },
        app_id: { type: 'number' },
        created_at: { type: 'string' },
        trial_granted: { type: 'boolean', description: '本次是否发放了试用' },
        trial_expire_time: {
          type: 'string',
          nullable: true,
          description: '若发放试用，则为到期时间；否则 null',
        },
        trial_message: {
          type: 'string',
          description:
            '可读的试用结果说明，供前端直接展示（已发放 / 此设备已使用过试用 / 试用需要提供硬件 ID / 应用未开启试用）',
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: '用户名已存在' })
  @ApiResponse({ status: 429, description: '注册过于频繁' })
  async register(@Body() dto: ClientRegisterDto) {
    const result = await this.endUsersService.clientRegister(dto);
    const { user } = result;
    return {
      id: user.id,
      username: user.username,
      app_id: user.app_id,
      created_at: user.created_at,
      trial_granted: result.trial_granted,
      trial_expire_time: result.trial_expire_time,
      trial_message: result.trial_message,
    };
  }

  @Public()
  @Post("login")
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  @ApiOperation({
    summary: '客户端登录',
    description: '终端用户登录。每个 IP 每分钟最多 30 次尝试。',
  })
  @ApiBody({ type: ClientLoginDto })
  @ApiResponse({ status: 200, description: '登录成功', schema: {
    type: 'object',
    properties: {
      access_token: { type: 'string' },
      user: { type: 'object' },
    },
  }})
  @ApiResponse({ status: 401, description: '用户名或密码错误' })
  @ApiResponse({ status: 429, description: '登录尝试过于频繁' })
  async login(@Body() dto: ClientLoginDto) {
    return await this.endUsersService.clientLogin(dto);
  }

  @ClientOnly()
  @Get("profile")
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '获取当前用户信息', description: '获取已登录终端用户的信息' })
  @ApiResponse({ status: 200, description: '成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  async getProfile(@Request() req) {
    return await this.endUsersService.findOne(req.user.userId);
  }

  @ClientOnly()
  @Get("expire-time")
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '查询到期时间', description: '查询当前用户的授权状态和到期时间' })
  @ApiResponse({ status: 200, description: '成功', schema: {
    type: 'object',
    properties: {
      username: { type: 'string', description: '用户名' },
      is_valid: { type: 'boolean', description: '是否有效' },
      is_active: { type: 'boolean', description: '账号是否启用' },
      expire_time: { type: 'string', description: '到期时间' },
      expire_timestamp: { type: 'number', description: '到期时间戳（秒）' },
      remaining_seconds: { type: 'number', description: '剩余秒数' },
      valid_message: { type: 'string', description: '状态说明' },
    },
  }})
  @ApiResponse({ status: 401, description: '未授权' })
  async getExpireTime(@Request() req) {
    const user = await this.endUsersService.findOne(req.user.userId);
    return { username: user.username, is_active: user.is_active, expire_time: user.expire_time, ...licenseStatus(user) };
  }

  @ClientOnly()
  @Put("heartbeat")
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '心跳', description: '客户端心跳保活，检查授权状态和设备绑定' })
  @ApiBody({ type: ClientHeartbeatDto })
  @ApiResponse({ status: 200, description: '成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  async heartbeat(@Request() req, @Body() heartbeatDto: ClientHeartbeatDto) {
    return this.endUsersService.heartbeat(req.user, heartbeatDto);
  }
}
