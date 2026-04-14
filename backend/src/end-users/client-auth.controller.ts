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

  @Post("register")
  @UseGuards(ThrottlerGuard)
  @Throttle({ register: { limit: 5, ttl: 60_000 } })
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

  @Post("login")
  @UseGuards(ThrottlerGuard)
  @Throttle({ login: { limit: 30, ttl: 60_000 } })
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

  @Get("profile")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '获取当前用户信息', description: '获取已登录终端用户的信息' })
  @ApiResponse({ status: 200, description: '成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  async getProfile(@Request() req) {
    return await this.endUsersService.findOne(req.user.userId);
  }

  @Get("expire-time")
  @UseGuards(JwtAuthGuard)
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
    const now = nowCN();

    // 计算状态
    let is_valid = false;
    let valid_message = "";
    let remaining_seconds = 0;
    let expire_timestamp: number | null = null;

    if (!user.is_active) {
      is_valid = false;
      valid_message = "账号已被禁用";
    } else if (!user.expire_time) {
      is_valid = false;
      valid_message = "未激活，请充值";
    } else {
      const expireDate = new Date(user.expire_time);
      if (isNaN(expireDate.getTime())) {
        is_valid = false;
        valid_message = "授权信息无效";
      } else if (expireDate < now) {
        is_valid = false;
        valid_message = "授权已过期";
        expire_timestamp = Math.floor(expireDate.getTime() / 1000);
      } else {
        is_valid = true;
        valid_message = "";
        expire_timestamp = Math.floor(expireDate.getTime() / 1000);
        remaining_seconds = Math.floor((expireDate.getTime() - now.getTime()) / 1000);
      }
    }

    return {
      username: user.username,
      is_valid,
      is_active: user.is_active,
      expire_time: user.expire_time,
      expire_timestamp,
      remaining_seconds,
      valid_message,
    };
  }

  @Put("heartbeat")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '心跳', description: '客户端心跳保活，检查授权状态和设备绑定' })
  @ApiBody({ type: ClientHeartbeatDto })
  @ApiResponse({ status: 200, description: '成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  async heartbeat(@Request() req, @Body() heartbeatDto: ClientHeartbeatDto) {
    const user = await this.endUsersService.findOne(req.user.userId);
    const now = nowCN();
    const hwid = heartbeatDto.hwid;

    // 检查授权状态
    const isExpired = user.expire_time && new Date(user.expire_time) < now;
    const isActive = user.is_active && !isExpired;

    // 获取应用配置的心跳间隔
    let heartInterval = 60; // 默认60秒
    let heartbeatTimeout = 180; // 默认超时180秒

    if (user.app_id) {
      const app = await this.appsRepository.findOne({
        where: { id: user.app_id },
      });
      // 应用已下线：强制登出所有客户端
      if (app && !app.is_active) {
        return {
          success: false,
          is_active: false,
          interval: 0,
          heartbeat_timeout: 0,
          server_time: Date.now(),
          commands: ["force_logout"],
          message: "应用已下线，请联系管理员",
        };
      }
      if (app && app.heart_interval > 0) {
        heartInterval = app.heart_interval;
        // 超时时间 = 心跳间隔 * 超时倍数（容错机制）
        const multiplier = app.heartbeat_timeout_multiplier || 3;
        heartbeatTimeout = heartInterval * multiplier;
      }
    }

    // ====== 设备绑定验证 ======
    // 新逻辑：一个设备可以被多个用户使用，检查该用户的设备绑定情况
    let device = await this.devicesRepository.findOne({
      where: { hwid, end_user_id: user.id },
    });

    if (device) {
      // 检查设备是否被封禁
      if (device.is_banned) {
        const response: any = {
          success: false,
          is_active: false,
          interval: 0,
          heartbeat_timeout: 0,
          server_time: Date.now(),
          commands: ["force_logout"],
          message: device.ban_reason || "设备已被封禁",
        };
        return response;
      }

      // 用户已绑定过此设备，更新心跳信息
      device.app_id = user.app_id;
      device.last_heartbeat = now;
      device.status = DeviceStatus.ONLINE;
      // 如果提供了设备名称，更新
      if (heartbeatDto.device_name) {
        device.device_name = heartbeatDto.device_name;
      }
      await this.devicesRepository.save(device);
    } else {
      // 用户未绑定过此设备，检查是否超过设备绑定上限
      const boundDevicesCount = await this.devicesRepository.count({
        where: { end_user_id: user.id },
      });

      if (boundDevicesCount >= user.max_devices) {
        const response: any = {
          success: false,
          is_active: false,
          interval: 0,
          heartbeat_timeout: 0,
          server_time: Date.now(),
          commands: ["force_logout"],
          message: `已达到设备绑定上限(${user.max_devices}台)，请先解绑其他设备`,
        };
        return response;
      }

      // 创建新的用户-设备绑定记录
      device = this.devicesRepository.create({
        hwid,
        end_user_id: user.id,
        app_id: user.app_id,
        status: DeviceStatus.ONLINE,
        last_heartbeat: now,
        device_name: heartbeatDto.device_name || null,
      });
      await this.devicesRepository.save(device);
    }

    // 返回心跳响应
    const response: any = {
      success: true,
      is_active: isActive,
      expire_time: user.expire_time,
      username: user.username,
      max_devices: user.max_devices,
      bound_devices: await this.devicesRepository.count({
        where: { end_user_id: user.id },
      }),
      interval: heartInterval,
      heartbeat_timeout: heartbeatTimeout,
      server_time: Date.now(),
    };

    // 如果用户被禁用或过期，返回强制登出指令
    if (!isActive) {
      response.commands = ["force_logout"];
      response.message = isExpired ? "授权已过期，请充值后继续使用" : "账号已被禁用";
    } else {
      response.commands = [];
      // 心跳成功且用户有效时，刷新 token（JWT 有效期 2h，靠心跳续期）
      response.new_token = this.endUsersService.refreshToken(
        user.id,
        user.username,
        user.app_id,
      );
    }

    return response;
  }
}
