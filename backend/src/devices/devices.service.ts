import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { nowCN } from "../common/utils/timezone";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Like, LessThan } from "typeorm";
import { Device, DeviceStatus } from "./entities/device.entity";
import { App } from "../apps/entities/app.entity";
import { DataPermissionService, CurrentUser } from "../common/services/data-permission.service";

export interface DeviceFilters {
  status?: DeviceStatus;
  is_banned?: boolean;
  end_user_id?: number;
  app_id?: number;
  keyword?: string;
  creator_id?: number; // For developer isolation
  agent_id?: number; // For agent isolation
}

export interface HeartbeatData {
  hwid: string;
  app_id: number;
  end_user_id?: number;
  last_ip?: string;
  app_version?: string;
  extra_info?: Record<string, any>;
}

@Injectable()
export class DevicesService {
  constructor(
    @InjectRepository(Device)
    private devicesRepository: Repository<Device>,
    @InjectRepository(App)
    private appsRepository: Repository<App>,
    private dataPermissionService: DataPermissionService,
  ) { }

  /**
   * 分页查询设备列表
   */
  async findAllPaginated(
    page: number = 1,
    pageSize: number = 10,
    filters: DeviceFilters = {},
    currentUser?: CurrentUser,
  ) {
    const queryBuilder = this.devicesRepository
      .createQueryBuilder("device")
      .leftJoinAndSelect("device.end_user", "end_user")
      .leftJoinAndSelect("device.app", "app")
      .orderBy("device.created_at", "DESC")
      .skip((page - 1) * pageSize)
      .take(pageSize);

    // 使用通用数据权限过滤（基于 app.creator_id）
    if (currentUser) {
      await this.dataPermissionService.applyFilter(queryBuilder, currentUser, {
        alias: "app",
        fieldName: "creator_id",
      });
    }

    if (filters.status) {
      queryBuilder.andWhere("device.status = :status", { status: filters.status });
    }
    if (filters.is_banned !== undefined) {
      queryBuilder.andWhere("device.is_banned = :is_banned", { is_banned: filters.is_banned });
    }
    if (filters.end_user_id) {
      queryBuilder.andWhere("device.end_user_id = :end_user_id", { end_user_id: filters.end_user_id });
    }
    if (filters.app_id) {
      queryBuilder.andWhere("device.app_id = :app_id", { app_id: filters.app_id });
    }
    if (filters.keyword) {
      queryBuilder.andWhere("device.hwid LIKE :keyword", { keyword: `%${filters.keyword}%` });
    }

    const [list, total] = await queryBuilder.getManyAndCount();
    return { list, total, page, pageSize };
  }

  /**
   * 根据ID查询设备
   */
  async findById(id: number): Promise<Device> {
    const device = await this.devicesRepository.findOne({
      where: { id },
      relations: ["end_user", "app"],
    });
    if (!device) {
      throw new NotFoundException(`设备ID ${id} 不存在`);
    }
    return device;
  }

  /**
   * 根据HWID查询设备
   */
  async findByHwid(hwid: string): Promise<Device | null> {
    return this.devicesRepository.findOne({
      where: { hwid },
      relations: ["end_user", "app"],
    });
  }

  /**
   * 注册或更新设备
   */
  async registerDevice(deviceData: Partial<Device>): Promise<Device> {
    const existing = await this.findByHwid(deviceData.hwid);
    if (existing) {
      // Update existing device
      existing.last_ip = deviceData.last_ip || existing.last_ip;
      existing.cpu_id = deviceData.cpu_id || existing.cpu_id;
      existing.disk_serial = deviceData.disk_serial || existing.disk_serial;
      existing.mac_address = deviceData.mac_address || existing.mac_address;
      existing.bios_uuid = deviceData.bios_uuid || existing.bios_uuid;
      return this.devicesRepository.save(existing);
    }
    return this.devicesRepository.save(
      this.devicesRepository.create(deviceData),
    );
  }

  /**
   * 封禁设备
   */
  async banDevice(id: number, reason?: string): Promise<Device> {
    const device = await this.findById(id);
    device.is_banned = true;
    device.ban_reason = reason || "管理员封禁";
    device.status = DeviceStatus.BANNED;
    return this.devicesRepository.save(device);
  }

  /**
   * 解封设备
   */
  async unbanDevice(id: number): Promise<Device> {
    const device = await this.findById(id);
    device.is_banned = false;
    device.ban_reason = null;
    device.status = DeviceStatus.OFFLINE;
    return this.devicesRepository.save(device);
  }

  /**
   * 删除设备
   */
  async remove(id: number): Promise<void> {
    const device = await this.findById(id);
    await this.devicesRepository.remove(device);
  }

  /**
   * 处理心跳
   */
  async handleHeartbeat(data: HeartbeatData): Promise<{
    success: boolean;
    interval: number;
    heartbeat_timeout: number;
    server_time: number;
    commands: string[];
    message?: string;
  }> {
    let device = await this.findByHwid(data.hwid);

    // 获取应用配置的心跳间隔
    let heartInterval = 60; // 默认60秒
    let heartbeatTimeout = 180; // 默认超时180秒
    if (data.app_id) {
      const app = await this.appsRepository.findOne({
        where: { id: data.app_id },
      });
      if (app && app.heart_interval > 0) {
        heartInterval = app.heart_interval;
        // 超时时间 = 心跳间隔 * 超时倍数（容错机制）
        const multiplier = app.heartbeat_timeout_multiplier || 3;
        heartbeatTimeout = heartInterval * multiplier;
      }
    }

    if (!device) {
      // 自动注册新设备
      device = await this.registerDevice({
        hwid: data.hwid,
        app_id: data.app_id,
        end_user_id: data.end_user_id,
        last_ip: data.last_ip,
        status: DeviceStatus.ONLINE,
        last_heartbeat: nowCN(),
      });
    } else {
      // 检查设备是否被封禁
      if (device.is_banned) {
        return {
          success: false,
          interval: 0,
          heartbeat_timeout: 0,
          server_time: Date.now(),
          commands: ["force_logout"],
          message: device.ban_reason || "设备已被封禁",
        };
      }

      // 更新心跳信息
      device.last_heartbeat = nowCN();
      device.last_ip = data.last_ip || device.last_ip;
      device.status = DeviceStatus.ONLINE;
      if (data.end_user_id) {
        device.end_user_id = data.end_user_id;
      }
      if (data.app_id) {
        device.app_id = data.app_id;
      }
      await this.devicesRepository.save(device);
    }

    const commands: string[] = [];

    return {
      success: true,
      interval: heartInterval,
      heartbeat_timeout: heartbeatTimeout,
      server_time: Date.now(),
      commands,
    };
  }

  /**
   * 检查设备在线状态
   */
  async checkDeviceStatus(hwid: string): Promise<{
    exists: boolean;
    is_online: boolean;
    is_banned: boolean;
    last_heartbeat?: Date;
  }> {
    const device = await this.findByHwid(hwid);

    if (!device) {
      return {
        exists: false,
        is_online: false,
        is_banned: false,
      };
    }

    // 判断是否在线（最后心跳在2分钟内）
    const now = nowCN();
    const heartbeatThreshold = 2 * 60 * 1000; // 2 minutes
    const isOnline =
      device.last_heartbeat &&
      now.getTime() - device.last_heartbeat.getTime() < heartbeatThreshold;

    return {
      exists: true,
      is_online: isOnline,
      is_banned: device.is_banned,
      last_heartbeat: device.last_heartbeat,
    };
  }

  /**
   * 标记离线设备（供定时任务调用）
   */
  async markOfflineDevices(thresholdMinutes: number = 2): Promise<number> {
    const threshold = new Date(nowCN().getTime() - thresholdMinutes * 60 * 1000);

    const result = await this.devicesRepository
      .createQueryBuilder()
      .update(Device)
      .set({ status: DeviceStatus.OFFLINE })
      .where("status = :status", { status: DeviceStatus.ONLINE })
      .andWhere("last_heartbeat < :threshold", { threshold })
      .execute();

    return result.affected || 0;
  }

  /**
   * 获取在线设备数量
   */
  async getOnlineCount(appId?: number): Promise<number> {
    const where: any = { status: DeviceStatus.ONLINE };
    if (appId) {
      where.app_id = appId;
    }
    return this.devicesRepository.count({ where });
  }

  /**
   * 统计用户已绑定设备数
   */
  async countByEndUser(endUserId: number): Promise<number> {
    return this.devicesRepository.count({
      where: { end_user_id: endUserId },
    });
  }

  /**
   * 获取用户所有设备
   */
  async findByEndUser(endUserId: number): Promise<Device[]> {
    return this.devicesRepository.find({
      where: { end_user_id: endUserId },
      order: { created_at: "DESC" },
    });
  }

  /**
   * 绑定设备到用户
   */
  /**
   * 绑定设备到用户
   * @param force 是否强制绑定（抢占设备）
   */
  async bindToUser(
    hwid: string,
    endUserId: number,
    appId: number,
    force: boolean = false,
  ): Promise<Device> {
    let device = await this.findByHwid(hwid);

    if (device) {
      // 设备已存在，检查是否已绑定到其他用户
      if (device.end_user_id && device.end_user_id !== endUserId) {
        if (!force) {
          throw new BadRequestException("此设备已绑定到其他用户");
        }
        // 强制抢占：允许，但可能需要记录日志或限制频率（此处简化为直接覆盖）
      }
      // 更新绑定
      device.end_user_id = endUserId;
      device.app_id = appId;
      return this.devicesRepository.save(device);
    }

    // 创建新设备并绑定
    device = this.devicesRepository.create({
      hwid,
      end_user_id: endUserId,
      app_id: appId,
      status: DeviceStatus.OFFLINE,
    });
    return this.devicesRepository.save(device);
  }

  /**
   * 解绑设备（从用户移除）
   */
  async unbindFromUser(deviceId: number): Promise<Device> {
    const device = await this.findById(deviceId);
    device.end_user_id = null;
    return this.devicesRepository.save(device);
  }
}
