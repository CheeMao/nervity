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
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from "@nestjs/swagger";
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

  @Post("register")
  @ApiOperation({ summary: '客户端注册', description: '终端用户注册账号' })
  @ApiBody({ type: ClientRegisterDto })
  @ApiResponse({ status: 201, description: '注册成功' })
  @ApiResponse({ status: 400, description: '用户名已存在' })
  async register(@Body() dto: ClientRegisterDto) {
    const user = await this.endUsersService.clientRegister(dto);
    return {
      id: user.id,
      username: user.username,
      app_id: user.app_id,
      created_at: user.created_at,
    };
  }

  @Post("login")
  @ApiOperation({ summary: '客户端登录', description: '终端用户登录' })
  @ApiBody({ type: ClientLoginDto })
  @ApiResponse({ status: 200, description: '登录成功', schema: {
    type: 'object',
    properties: {
      access_token: { type: 'string' },
      user: { type: 'object' },
    },
  }})
  @ApiResponse({ status: 401, description: '用户名或密码错误' })
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
    }

    return response;
  }
}
