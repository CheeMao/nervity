import { TrialClaim } from "./entities/trial-claim.entity";
import { licenseStatus } from "../common/utils/license";
import { EntityManager } from "typeorm";
import { Injectable, NotFoundException, BadRequestException, UnauthorizedException, ForbiddenException } from "@nestjs/common";
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
import { SessionKeyStore } from "../common/services/session-key.store";
import { DataPermissionService } from "../common/services/data-permission.service";

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
    private sessionKeyStore: SessionKeyStore,
    private dataPermissionService: DataPermissionService,
  ) { }

  async create(
    createEndUserDto: CreateEndUserDto,
    currentUser?: { userId?: number; id?: number },
  ): Promise<EndUser> {
    if (!createEndUserDto.app_id) {
      throw new BadRequestException("必须选择所属应用");
    }
    const app = await this.appsRepository.findOne({
      where: { id: createEndUserDto.app_id },
    });
    if (!app) {
      throw new BadRequestException("应用不存在");
    }

    // 同应用下用户名唯一校验（仅在传了 username 时）
    if (createEndUserDto.username) {
      const existing = await this.endUsersRepository.findOne({
        where: {
          username: createEndUserDto.username,
          app_id: createEndUserDto.app_id,
        },
      });
      if (existing) {
        throw new BadRequestException("该应用下已存在同名用户");
      }
    }

    const data: Partial<EndUser> = { ...createEndUserDto } as Partial<EndUser>;

    // 密码哈希（与 update / clientRegister 保持一致）
    if (createEndUserDto.password) {
      data.password = await bcrypt.hash(createEndUserDto.password, 10);
    }

    // card_creator_id 默认填当前调用者，保证代理商数据权限过滤可用
    if (data.card_creator_id == null) {
      data.card_creator_id = currentUser?.userId ?? currentUser?.id ?? null;
    }

    const endUser = this.endUsersRepository.create(data);
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
        // developer sees users under their own and subordinate applications.
        await this.dataPermissionService.applyFilter(queryBuilder, currentUser, {
          alias: "app", fieldName: "creator_id",
        });
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

    const devices = list.length ? await this.devicesRepository.find({
      where: { end_user_id: In(list.map(user => user.id)) },
      select: ["id", "end_user_id", "hwid", "device_name", "status", "last_heartbeat", "is_banned"],
      order: { last_heartbeat: "DESC" },
    }) : [];
    const grouped = new Map<number, Device[]>();
    for (const device of devices) {
      const group = grouped.get(Number(device.end_user_id)) || [];
      group.push(device); grouped.set(Number(device.end_user_id), group);
    }
    const listWithDeviceInfo = list.map(user => ({ ...user,
      device_count: (grouped.get(Number(user.id)) || []).length,
      devices: grouped.get(Number(user.id)) || [],
    }));

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

  async update(id: number, dto: UpdateEndUserDto): Promise<EndUser> {
    const patch: any = { ...dto };
    if (patch.password) patch.password = await bcrypt.hash(patch.password, 10);
    else delete patch.password;
    return this.endUsersRepository.manager.transaction(async manager => {
      const user = await manager.findOne(EndUser, { where: { id }, lock: { mode: "pessimistic_write" } });
      if (!user) throw new NotFoundException("用户不存在");
      if (patch.password || patch.is_active !== undefined || patch.hwid !== undefined || patch.app_id !== undefined) {
        patch.token_version = user.token_version + 1;
        await this.sessionKeyStore.revokeUser(id, manager);
      }
      await manager.update(EndUser, id, patch);
      return manager.findOneBy(EndUser, { id });
    });
  }

  async remove(id: number): Promise<void> {
    await this.endUsersRepository.manager.transaction(async manager => {
      const user = await manager.findOne(EndUser, { where: { id }, lock: { mode: "pessimistic_write" } });
      if (!user) throw new NotFoundException("用户不存在");
      await this.sessionKeyStore.revokeUser(id, manager);
      await manager.delete(Device, { end_user_id: id });
      await manager.query("UPDATE card SET used_by = NULL, used_by_id = NULL WHERE used_by = ?", [id]);
      await manager.delete(EndUser, id);
    });
  }

  async unbindHwid(id: number): Promise<void> {
    await this.endUsersRepository.manager.transaction(async manager => {
      const user = await manager.findOne(EndUser, { where: { id }, lock: { mode: "pessimistic_write" } });
      if (!user) throw new NotFoundException("用户不存在");
      await manager.delete(Device, { end_user_id: id });
      await manager.update(EndUser, id, { hwid: null, token_version: user.token_version + 1 });
      await this.sessionKeyStore.revokeUser(id, manager);
    });
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

  /** Caller holds the end-user row lock, serializing device quota checks. */
  async bindDevice(manager: EntityManager, user: EndUser, hwid: string, deviceName?: string) {
    if (typeof hwid !== "string" || !hwid.trim() || hwid.length > 255) throw new BadRequestException("无效设备 ID");
    const repository = manager.getRepository(Device);
    let device = await repository.findOneBy({ app_id: user.app_id, end_user_id: user.id, hwid });
    if (device?.is_banned) throw new ForbiddenException("设备已被封禁");
    if (!device) {
      const count = await repository.countBy({ end_user_id: user.id });
      if (count >= user.max_devices) throw new ForbiddenException("已达到设备绑定上限，请先解绑其他设备");
      device = repository.create({ app_id: user.app_id, end_user_id: user.id, hwid });
    }
    device.last_heartbeat = new Date();
    device.status = DeviceStatus.ONLINE;
    if (deviceName) device.device_name = deviceName;
    return repository.save(device);
  }

  private async grantTrial(manager: EntityManager, user: EndUser, app: App, hwid?: string): Promise<boolean> {
    if (!app.trial_enabled || app.trial_duration <= 0 || !hwid || user.has_used_trial) return false;
    // The immutable unique claim survives unbinding, HWID changes and account deletion.
    try {
      await manager.insert(TrialClaim, { app_id: app.id, hwid, user_id: user.id });
    } catch (error) {
      if (error.code === "ER_DUP_ENTRY") return false;
      throw error;
    }
    user.has_used_trial = true;
    user.expire_time = new Date(Math.max(Date.now(), new Date(user.expire_time || 0).getTime()) + app.trial_duration * 1000);
    user.max_devices = Math.max(user.max_devices || 1, app.trial_device_limit || 1);
    await manager.save(EndUser, user);
    return true;
  }

  async clientRegister(dto: ClientRegisterDto) {
    const password = await bcrypt.hash(dto.password, 10);
    return this.endUsersRepository.manager.transaction(async manager => {
      const app = await manager.findOne(App, { where: { id: dto.app_id }, lock: { mode: "pessimistic_write" } });
      if (!app?.is_active) throw new ForbiddenException("应用不存在或已下线");
      const existing = await manager.findOneBy(EndUser, { username: dto.username, app_id: dto.app_id });
      if (existing) throw new BadRequestException("用户名已存在");
      const user = manager.create(EndUser, { username: dto.username, password, app_id: app.id,
        hwid: dto.hwid, is_active: true, max_devices: 1 });
      try { await manager.save(EndUser, user); }
      catch (error) { if (error.code === "ER_DUP_ENTRY") throw new BadRequestException("用户名已存在"); throw error; }
      const granted = await this.grantTrial(manager, user, app, dto.hwid);
      return { user, trial_granted: granted, trial_expire_time: granted ? user.expire_time : null,
        trial_message: granted ? `已发放 ${app.trial_duration} 秒试用` : !app.trial_enabled ? "应用未开启试用" : !dto.hwid ? "试用需要提供硬件 ID" : "此设备或账号已使用过试用" };
    });
  }

  async claimTrial(userId: number, appId: number, hwid: string) {
    return this.endUsersRepository.manager.transaction(async manager => {
      const user = await manager.findOne(EndUser, { where: { id: userId }, lock: { mode: "pessimistic_write" } });
      const app = await manager.findOneBy(App, { id: appId });
      if (!user?.is_active || !app?.is_active || Number(user.app_id) !== Number(appId)) throw new ForbiddenException("应用或账号无效");
      if (!await this.grantTrial(manager, user, app, hwid)) throw new BadRequestException("无法领取试用：已领取或未开启");
      await this.bindDevice(manager, user, hwid);
      return { success: true, is_trial: true, expire_time: user.expire_time, added_seconds: app.trial_duration, max_devices: user.max_devices };
    });
  }

  async clientLogin(dto: ClientLoginDto) {
    const publicKey = this.sessionKeyStore.validatePublicKey(dto.session_public_key);
    const credentials = await this.endUsersRepository.createQueryBuilder("u").addSelect("u.password")
      .where("u.username = :name AND u.app_id = :appId", { name: dto.username, appId: dto.app_id }).getOne();
    if (!credentials?.password || !await bcrypt.compare(dto.password, credentials.password)) throw new UnauthorizedException("用户名或密码错误");
    return this.endUsersRepository.manager.transaction(async manager => {
      const user = await manager.findOne(EndUser, { where: { id: credentials.id }, lock: { mode: "pessimistic_write" } });
      if (!user?.is_active || user.token_version !== credentials.token_version) throw new UnauthorizedException("账号状态已改变，请重新登录");
      const app = await manager.findOneBy(App, { id: dto.app_id });
      if (!app?.is_active) throw new ForbiddenException("应用已下线");
      await this.bindDevice(manager, user, dto.hwid, dto.device_name);
      user.last_login = new Date(); user.hwid = dto.hwid;
      await manager.update(EndUser, user.id, { last_login: user.last_login, hwid: user.hwid });
      const session = await this.sessionKeyStore.createSession(user.id, dto.hwid, publicKey, manager);
      return { access_token: this.signToken(user, session.id), user,
        heart_interval: app.heart_interval, heartbeat_timeout: app.heart_interval * app.heartbeat_timeout_multiplier,
        expire_time: user.expire_time, ...licenseStatus(user) };
    });
  }

  private signToken(user: EndUser, sessionId: string): string {
    return this.jwtService.sign({ sub: user.id, type: "end_user", app_id: Number(user.app_id), ver: user.token_version, sid: sessionId });
  }

  async heartbeat(identity: any, dto: { hwid: string; device_name?: string }) {
    if (dto.hwid !== identity.hwid) throw new ForbiddenException("设备与登录会话不匹配");
    return this.endUsersRepository.manager.transaction(async manager => {
      const user = await manager.findOne(EndUser, { where: { id: identity.userId }, lock: { mode: "pessimistic_write" } });
      if (!user?.is_active || user.token_version !== identity.token_version) throw new UnauthorizedException("登录已失效");
      const app = await manager.findOneBy(App, { id: user.app_id });
      if (!app?.is_active) return { success: false, is_active: false, commands: ["force_logout"], message: "应用已下线" };
      await this.bindDevice(manager, user, dto.hwid, dto.device_name);
      await this.sessionKeyStore.touch(identity.session_id, user.id);
      const status = licenseStatus(user);
      return { success: true, is_active: status.is_valid, ...status, expire_time: user.expire_time,
        username: user.username, max_devices: user.max_devices,
        bound_devices: await manager.countBy(Device, { end_user_id: user.id }),
        interval: app.heart_interval, heartbeat_timeout: app.heart_interval * app.heartbeat_timeout_multiplier,
        server_time: Date.now(), commands: [], message: status.valid_message, new_token: this.signToken(user, identity.session_id) };
    });
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
