import { Injectable, NotFoundException, BadRequestException, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Like, FindOptionsWhere, In } from "typeorm";
import * as bcrypt from "bcrypt";
import { JwtService } from "@nestjs/jwt";
import { EndUser } from "./entities/end-user.entity";
import { QueryEndUserDto } from "./dto/query-end-user.dto";
import { CreateEndUserDto } from "./dto/create-end-user.dto";
import { UpdateEndUserDto } from "./dto/update-end-user.dto";
import { ClientRegisterDto, ClientLoginDto } from "./dto/client-auth.dto";
import { Device, DeviceStatus } from "../devices/entities/device.entity";
import { App } from "../apps/entities/app.entity";
import { Card } from "../cards/entities/card.entity";
import { AdminRole } from "../users/entities/user.entity";
import { nowCN } from "../common/utils/timezone";
import { CurrentUser } from "../common/services/data-permission.service";

@Injectable()
export class EndUsersService {
  constructor(
    @InjectRepository(EndUser)
    private endUsersRepository: Repository<EndUser>,
    @InjectRepository(Device)
    private devicesRepository: Repository<Device>,
    @InjectRepository(App)
    private appsRepository: Repository<App>,
    @InjectRepository(Card)
    private cardsRepository: Repository<Card>,
    private jwtService: JwtService,
  ) { }

  async create(createEndUserDto: CreateEndUserDto): Promise<EndUser> {
    const endUser = this.endUsersRepository.create(createEndUserDto);
    return await this.endUsersRepository.save(endUser);
  }

  async findAll(
    query: QueryEndUserDto,
    currentUser?: CurrentUser,
  ): Promise<{ list: (EndUser & { device_count: number })[]; total: number }> {
    const {
      page = 1,
      pageSize = 10,
      keyword,
      app_id,
      agent_id,
      is_active,
    } = query;
    const skip = (page - 1) * pageSize;
    const userId = currentUser?.userId || currentUser?.id;

    const queryBuilder = this.endUsersRepository
      .createQueryBuilder("endUser")
      .leftJoinAndSelect("endUser.app", "app")
      .orderBy("endUser.created_at", "DESC")
      .skip(skip)
      .take(pageSize);

    // 基于角色的数据权限过滤
    if (currentUser && userId) {
      if (currentUser.role === AdminRole.ADMIN) {
        // admin 看全部，不添加过滤条件
      } else if (currentUser.role === AdminRole.AGENT) {
        // agent 只看使用自己创建的卡密激活的用户
        queryBuilder.andWhere("endUser.card_creator_id = :userId", { userId });
      } else if (currentUser.role === AdminRole.DEVELOPER) {
        // developer 看自己创建的应用下的所有用户
        queryBuilder.andWhere("app.creator_id = :userId", { userId });
      }
    }

    if (keyword) {
      queryBuilder.andWhere(
        "(endUser.username LIKE :keyword OR endUser.hwid LIKE :keyword)",
        { keyword: `%${keyword}%` },
      );
    }

    if (app_id !== undefined) {
      queryBuilder.andWhere("endUser.app_id = :app_id", { app_id });
    }

    if (agent_id !== undefined) {
      // 兼容旧的 agent_id 参数，映射到 card_creator_id
      queryBuilder.andWhere("endUser.card_creator_id = :agent_id", { agent_id });
    }

    if (is_active !== undefined) {
      queryBuilder.andWhere("endUser.is_active = :is_active", { is_active });
    }

    const [list, total] = await queryBuilder.getManyAndCount();

    // 为每个用户添加 device_count 和 devices 列表
    const listWithDeviceInfo = await Promise.all(
      list.map(async (user) => {
        const devices = await this.devicesRepository.find({
          where: { end_user_id: user.id },
          select: ["id", "hwid", "device_name", "status", "last_heartbeat", "is_banned"],
          order: { last_heartbeat: "DESC" },
        });
        const deviceCount = devices.length;
        return { ...user, device_count: deviceCount, devices };
      })
    );

    return { list: listWithDeviceInfo, total };
  }

  async findOne(id: number): Promise<EndUser> {
    const endUser = await this.endUsersRepository.findOne({
      where: { id },
      relations: ["app"],
    });

    if (!endUser) {
      throw new NotFoundException(`终端用户 ID ${id} 不存在`);
    }

    return endUser;
  }

  async findByHwid(hwid: string): Promise<EndUser | null> {
    return await this.endUsersRepository.findOne({
      where: { hwid },
      relations: ["app"],
    });
  }

  async update(
    id: number,
    updateEndUserDto: UpdateEndUserDto,
  ): Promise<EndUser> {
    // 如果传了密码，先做 bcrypt 哈希
    if (updateEndUserDto.password) {
      updateEndUserDto.password = await bcrypt.hash(updateEndUserDto.password, 10);
    }

    const endUser = await this.findOne(id);
    Object.assign(endUser, updateEndUserDto);
    return await this.endUsersRepository.save(endUser);
  }

  async remove(id: number): Promise<void> {
    try {
      const endUser = await this.findOne(id);

      // 1. 解绑所有设备
      await this.devicesRepository.update(
        { end_user_id: id },
        { end_user_id: null }
      );

      // 2. 解除卡密使用记录
      // 注意：Card实体中 used_by 是外键关联，used_by_id 是独立字段
      // 必须通过 used_by 关联来查找
      await this.cardsRepository.update(
        { used_by: { id } },
        { used_by: null, used_by_id: null }
      );

      // 3. 删除用户
      await this.endUsersRepository.remove(endUser);
    } catch (error) {
      console.error("Error deleting end user:", error);
      throw error;
    }
  }

  async unbindHwid(id: number): Promise<void> {
    // 解绑该用户的所有设备（删除 Device 表中的记录）
    await this.devicesRepository.delete({ end_user_id: id });
  }

  async count(): Promise<number> {
    return await this.endUsersRepository.count();
  }

  async countByAgent(agentId: number): Promise<number> {
    return await this.endUsersRepository.count({
      where: { card_creator_id: agentId },
    });
  }

  // ==================== 客户端认证方法 ====================

  async clientRegister(dto: ClientRegisterDto): Promise<EndUser> {
    // 检查用户名是否已存在（同一应用下）
    const existing = await this.endUsersRepository.findOne({
      where: { username: dto.username, app_id: dto.app_id },
    });

    if (existing) {
      throw new BadRequestException("用户名已存在");
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // 创建用户
    const endUser = this.endUsersRepository.create({
      username: dto.username,
      password: hashedPassword,
      app_id: dto.app_id,
      hwid: dto.hwid,
      is_active: true,
      max_devices: 1,
    });

    return await this.endUsersRepository.save(endUser);
  }

  async clientLogin(dto: ClientLoginDto): Promise<{
    access_token: string;
    user: EndUser;
    heart_interval?: number;
    heartbeat_timeout?: number;
    is_valid: boolean;
    expire_time: Date | null;
    valid_message: string;
  }> {
    // 查找用户
    const user = await this.endUsersRepository
      .createQueryBuilder("endUser")
      .where("endUser.username = :username", { username: dto.username })
      .andWhere("endUser.app_id = :appId", { appId: dto.app_id })
      .addSelect("endUser.password")
      .getOne();

    if (!user) {
      throw new UnauthorizedException("用户名或密码错误");
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException("用户名或密码错误");
    }

    // 检查是否被禁用
    if (!user.is_active) {
      throw new UnauthorizedException("账号已被禁用");
    }

    // 获取应用配置
    let heartInterval = 60;
    let heartbeatTimeout = 180;
    const app = await this.appsRepository.findOne({ where: { id: dto.app_id } });
    if (app && app.heart_interval > 0) {
      heartInterval = app.heart_interval;
      const multiplier = app.heartbeat_timeout_multiplier || 3;
      heartbeatTimeout = heartInterval * multiplier;
    }

    // 设备绑定检查（如果提供了 HWID）
    // 新逻辑：一个设备可以被多个用户使用，但每个用户有自己的设备绑定配额
    if (dto.hwid) {
      // 查找该用户是否已绑定过此设备（用 hwid + end_user_id 组合查询）
      let device = await this.devicesRepository.findOne({
        where: { hwid: dto.hwid, end_user_id: user.id },
      });

      if (device) {
        // 用户已绑定过此设备，更新设备信息
        device.app_id = dto.app_id;
        device.last_heartbeat = nowCN();
        device.status = DeviceStatus.ONLINE;
        // 如果提供了设备名称，更新
        if (dto.device_name) {
          device.device_name = dto.device_name;
        }
        await this.devicesRepository.save(device);
      } else {
        // 用户未绑定过此设备，检查用户是否还有设备配额
        const boundDevicesCount = await this.devicesRepository.count({
          where: { end_user_id: user.id },
        });

        if (boundDevicesCount >= user.max_devices) {
          throw new UnauthorizedException(
            `已达到设备绑定上限(${user.max_devices}台)，请先解绑其他设备`
          );
        }

        // 创建新的用户-设备绑定记录
        device = this.devicesRepository.create({
          hwid: dto.hwid,
          end_user_id: user.id,
          app_id: dto.app_id,
          status: DeviceStatus.ONLINE,
          last_heartbeat: nowCN(),
          device_name: dto.device_name || null,
        });
        await this.devicesRepository.save(device);
      }
    }

    // 注意：登录时不检查是否过期，允许用户登录后充值
    // 过期检查在心跳或使用软件功能时进行

    // 更新最后登录时间和 IP
    await this.endUsersRepository.update(user.id, {
      last_login: new Date(),
      hwid: dto.hwid || user.hwid,
    });

    // 生成 JWT
    const payload = {
      sub: user.id,
      username: user.username,
      app_id: user.app_id,
      type: "end_user",
    };

    const access_token = this.jwtService.sign(payload);

    // 移除密码
    delete user.password;

    // 计算 is_valid 和 valid_message
    const now = nowCN();
    let is_valid = false;
    let valid_message = "";

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
      } else {
        is_valid = true;
        valid_message = "";
      }
    }

    return {
      access_token,
      user,
      heart_interval: heartInterval,
      heartbeat_timeout: heartbeatTimeout,
      is_valid,
      expire_time: user.expire_time,
      valid_message,
    };
  }

  async findByUsername(username: string, appId: number): Promise<EndUser | null> {
    return await this.endUsersRepository.findOne({
      where: { username, app_id: appId },
    });
  }

  async addTime(userId: number, seconds: number): Promise<EndUser> {
    const user = await this.findOne(userId);
    const now = new Date();

    // 计算新的到期时间
    let newExpireTime: Date;
    if (user.expire_time) {
      const parsedExpireTime = new Date(user.expire_time);
      // 检查日期是否有效且未过期
      if (!isNaN(parsedExpireTime.getTime()) && parsedExpireTime > now) {
        // 如果未过期，在现有基础上增加
        newExpireTime = new Date(parsedExpireTime.getTime() + seconds * 1000);
      } else {
        // 如果已过期或无效，从现在开始计算
        newExpireTime = new Date(Date.now() + seconds * 1000);
      }
    } else {
      // 从未激活，从现在开始计算
      newExpireTime = new Date(Date.now() + seconds * 1000);
    }

    user.expire_time = newExpireTime;
    user.is_active = true;

    return await this.endUsersRepository.save(user);
  }
}
