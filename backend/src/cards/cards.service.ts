import { Injectable, BadRequestException, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { nowCN, permanentExpireDate, isPermanentExpire } from "../common/utils/timezone";
import { Repository } from "typeorm";
import { Card, CardStatus } from "./entities/card.entity";
import { Admin } from "../users/entities/user.entity";
import { v4 as uuidv4 } from "uuid";
import { EndUsersService } from "../end-users/end-users.service";
import { CreateEndUserDto } from "../end-users/dto/create-end-user.dto";
import { DevicesService } from "../devices/devices.service";
import { CardTypesService } from "../card-types/card-types.service";
import { UsersService } from "../users/users.service";
import { BalanceLogsService } from "../balance-logs/balance-logs.service";
import { BalanceLogType } from "../balance-logs/entities/balance-log.entity";
import { AppsService } from "../apps/apps.service";
import { DataPermissionService, CurrentUser } from "../common/services/data-permission.service";

@Injectable()
export class CardsService {
  constructor(
    @InjectRepository(Card)
    private cardsRepository: Repository<Card>,
    @InjectRepository(Admin)
    private usersRepository: Repository<Admin>,
    private endUsersService: EndUsersService,
    private devicesService: DevicesService,
    private cardTypesService: CardTypesService,
    private usersService: UsersService,
    private balanceLogsService: BalanceLogsService,
    private appsService: AppsService,
    private dataPermissionService: DataPermissionService,
  ) { }

  /**
   * 生成简洁卡密代码
   * 8-12位大写字母数字，排除易混淆字符：0, O, I, L, 1
   */
  private generateCardCode(length: number = 10): string {
    const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // 排除 0, O, I, L, 1
    let code = "";
    for (let i = 0; i < length; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  async generate(createCardDto: any, currentUser: CurrentUser) {
    const creatorId = currentUser.userId || currentUser.id;
    const cards = [];
    const count = createCardDto.count || 1;
    const codeLength = createCardDto.code_length || 10;

    let duration = createCardDto.value;
    let price = 0;
    let cardTypeName = "custom";
    let deviceLimit = createCardDto.device_limit || 1;
    let isPermanent = false;

    // 构建允许访问的 creator_id 列表
    const allowedCreatorIds: number[] = [creatorId];

    // admin 可以访问所有
    if (currentUser.role === 'admin') {
      // admin 不限制，跳过验证
    } else if (currentUser.role === 'developer') {
      // developer 可以访问自己和下级代理商创建的资源
      const subUsers = await this.usersRepository.find({
        where: { parent_id: creatorId },
        select: ["id"],
      });
      allowedCreatorIds.push(...subUsers.map((u) => u.id));
    } else if (currentUser.role === 'agent' && currentUser.parent_id) {
      // agent 可以访问上级开发者创建的资源
      allowedCreatorIds.push(Number(currentUser.parent_id));
    }

    // 验证应用权限
    const app = await this.appsService.findOne(createCardDto.app_id);
    if (!app) {
      throw new BadRequestException("应用不存在");
    }

    // admin 跳过权限检查
    if (currentUser.role !== 'admin') {
      if (!allowedCreatorIds.includes(Number(app.creator_id))) {
        throw new BadRequestException("无权为该应用生成卡密");
      }
    }

    // 1. Calculate Price if Card Type is selected
    if (createCardDto.card_type_id) {
      const cardType = await this.cardTypesService.findOne(
        createCardDto.card_type_id,
      );
      if (!cardType) {
        throw new BadRequestException("卡类不存在");
      }

      // 验证卡类权限（admin 跳过）
      if (currentUser.role !== 'admin') {
        if (!allowedCreatorIds.includes(Number(cardType.creator_id))) {
          throw new BadRequestException("无权使用该卡类");
        }
      }

      duration = cardType.value;
      cardTypeName = cardType.name;
      deviceLimit = cardType.device_limit;
      isPermanent = !!cardType.is_permanent;

      // Fetch Creator (Agent) to get discount
      const creator = await this.usersService.findById(creatorId);
      const isAgent =
        creator.role === 'agent' || creator.role_relation?.name === 'Agent';
      if (isAgent) {
        const rawRate = Number(creator.agent?.discount_rate);
        const discountRate =
          Number.isFinite(rawRate) && rawRate > 0 ? rawRate : 100;
        const basePrice = Number(cardType.price);
        const unitPrice = basePrice * (discountRate / 100);
        price = unitPrice * count;

        // Check Balance
        if (Number(creator.balance) < price) {
          throw new BadRequestException(
            `余额不足。需要: ${price.toFixed(2)}, 可用: ${creator.balance}`,
          );
        }

        // Deduct Balance (use repository directly to avoid auto-logging in usersService.update)
        await this.usersRepository.update(creator.id, {
          balance: Number(creator.balance) - price,
        });

        // Log Transaction
        await this.balanceLogsService.logChange(
          creator.id,
          -price,
          BalanceLogType.CARD_GENERATION,
          Number(creator.balance) - price,
          creator.id,
          `生成 ${count} 张 ${cardType.name} 卡密`,
        );
      }
    }

    for (let i = 0; i < count; i += 1) {
      if (!isPermanent && duration <= 0) {
        throw new BadRequestException("卡密面值必须大于0");
      }
      const card = this.cardsRepository.create({
        ...createCardDto,
        type: isPermanent ? "permanent" : "time",
        value: isPermanent ? 0 : duration,
        is_permanent: isPermanent,
        code: this.generateCardCode(Math.min(12, Math.max(8, codeLength))),
        status: CardStatus.UNUSED,
        remark: createCardDto.remark,
        creator_id: creatorId,
        app_id: createCardDto.app_id,
        device_limit: deviceLimit,
      });
      cards.push(card);
    }
    return this.cardsRepository.save(cards);
  }

  async findAllPaginated(
    page: number = 1,
    pageSize: number = 10,
    status?: string,
    appId?: number,
    currentUser?: CurrentUser,
    code?: string,
    remark?: string,
    usedBy?: string,
  ) {
    const qb = this.cardsRepository
      .createQueryBuilder("card")
      .leftJoinAndSelect("card.app", "app")
      .leftJoinAndSelect("card.used_by", "used_by")
      .orderBy("card.created_at", "DESC")
      .skip((page - 1) * pageSize)
      .take(pageSize);

    // 使用通用数据权限过滤
    if (currentUser) {
      await this.dataPermissionService.applyFilter(qb, currentUser, {
        fieldName: "creator_id",
      });
    }

    if (status) qb.andWhere("card.status = :status", { status });
    if (appId) qb.andWhere("card.app_id = :appId", { appId });
    if (code) qb.andWhere("card.code LIKE :code", { code: `%${code}%` });
    if (remark) qb.andWhere("card.remark LIKE :remark", { remark: `%${remark}%` });
    if (usedBy) {
      qb.andWhere("(used_by.username LIKE :usedBy OR used_by.hwid LIKE :usedBy)", { usedBy: `%${usedBy}%` });
    }

    const [list, total] = await qb.getManyAndCount();
    return { list, total, page, pageSize };
  }

  async findByCode(code: string) {
    return this.cardsRepository.findOne({ where: { code } });
  }

  async useCard(code: string, userId: number | null, hwid: string | null, username?: string) {
    // 1. 必须提供 userId（已登录用户）
    if (!userId) {
      throw new Error("必须登录后才能充值");
    }

    const card = await this.findByCode(code);
    if (!card) {
      throw new Error("卡密无效");
    }
    if (card.status !== CardStatus.UNUSED) {
      throw new Error("卡密已被使用或禁用");
    }

    if (!card.is_permanent && card.value <= 0) {
      throw new Error("卡密面值无效(0)，无法充值");
    }

    // 2. 查找已登录用户
    const endUser = await this.endUsersService.findOne(userId);
    if (!endUser) {
      throw new Error("用户不存在");
    }

    // 3. 检查卡密应用匹配
    if (endUser.app_id && endUser.app_id !== card.app_id) {
      throw new Error("此卡密不属于该用户所在的应用");
    }

    // 4. 如果提供了 HWID，处理设备绑定
    if (hwid) {
      const existingDevice = await this.devicesService.findByHwid(hwid);
      const isDeviceAlreadyBound =
        existingDevice && existingDevice.end_user_id === endUser.id;

      if (!isDeviceAlreadyBound) {
        // 需要绑定新设备，检查是否超限
        const boundDevices = await this.devicesService.countByEndUser(endUser.id);
        if (boundDevices >= endUser.max_devices) {
          throw new Error(
            `已达到设备绑定上限(${endUser.max_devices}台)，请先解绑其他设备`,
          );
        }

        // 绑定设备到用户
        await this.devicesService.bindToUser(hwid, endUser.id, card.app_id, true);
      }
    }

    // 5. 更新设备配额（取最大值，不累加）
    const newMaxDevices = Math.max(
      endUser.max_devices || 1,
      card.device_limit || 1,
    );

    // 6. 计算新的到期时间
    const now = nowCN();
    let expireTime: Date;

    if (card.is_permanent || isPermanentExpire(endUser.expire_time)) {
      // 永久卡 或 用户已是永久：到期时间固定为哨兵值，不再累加时长
      expireTime = permanentExpireDate();
    } else {
      // 检查现有到期时间是否有效
      if (endUser.expire_time) {
        const parsedExpireTime = new Date(endUser.expire_time);
        if (!isNaN(parsedExpireTime.getTime()) && parsedExpireTime > now) {
          expireTime = parsedExpireTime;
        } else {
          expireTime = now; // 无效或已过期，从现在开始计算
        }
      } else {
        expireTime = now; // 没有到期时间，从现在开始计算
      }

      // 增加时长（秒）
      expireTime = new Date(expireTime.getTime() + card.value * 1000);
    }

    // 7. 更新用户信息（card_creator_id 记录卡密创建者）
    await this.endUsersService.update(endUser.id, {
      expire_time: expireTime,
      app_id: endUser.app_id || card.app_id,
      max_devices: newMaxDevices,
      card_creator_id: card.creator_id, // 记录卡密创建者
    });

    // 9. 更新卡密状态（用原始 SQL 避免 save() 级联保存旧的 endUser 对象覆盖 expire_time）
    await this.cardsRepository.query(
      `UPDATE card SET status = ?, used_by = ?, used_at = ? WHERE id = ?`,
      [CardStatus.USED, endUser.id, nowCN(), card.id],
    );

    return {
      success: true,
      message: "激活成功",
      expire_time: expireTime,
      added_seconds: card.is_permanent ? 0 : card.value,
      is_permanent: !!card.is_permanent,
      max_devices: newMaxDevices,
    };
  }

  /**
   * 试用激活
   * @param appId 应用ID
   * @param hwid 机器码
   */
  async handleTrialActivation(appId: number, hwid: string) {
    // 1. 强制校验 hwid
    if (!hwid) {
      throw new BadRequestException("必须提供机器码(HWID)");
    }

    // 2. 获取应用的试用配置
    const app = await this.appsService.findOne(appId);
    if (!app) {
      throw new NotFoundException("应用不存在");
    }
    if (!app.trial_enabled) {
      throw new BadRequestException("该应用未启用试用功能");
    }

    // 3. 查找或创建用户
    let endUser = null;
    let isNewUser = false;

    const existingDevice = await this.devicesService.findByHwid(hwid);
    if (existingDevice && existingDevice.end_user_id) {
      endUser = await this.endUsersService.findOne(existingDevice.end_user_id);
    } else {
      endUser = await this.endUsersService.findByHwid(hwid);
    }

    if (!endUser) {
      // 自动注册新用户
      const createDto = new CreateEndUserDto();
      createDto.hwid = hwid;
      createDto.app_id = appId;
      createDto.is_active = true;
      createDto.max_devices = app.trial_device_limit;
      endUser = await this.endUsersService.create(createDto);
      isNewUser = true;
    }

    // 4. 检查是否已使用过试用
    if (endUser.has_used_trial) {
      throw new BadRequestException("您已使用过试用功能，无法再次试用");
    }

    // 5. 检查应用匹配
    if (endUser.app_id && endUser.app_id !== appId) {
      throw new BadRequestException("该设备已绑定到其他应用");
    }

    // 6. 检查设备绑定
    const isDeviceAlreadyBound =
      existingDevice && existingDevice.end_user_id === endUser.id;

    if (!isDeviceAlreadyBound) {
      const boundDevices = await this.devicesService.countByEndUser(endUser.id);
      const maxDevices = Math.max(endUser.max_devices || 1, app.trial_device_limit || 1);
      if (boundDevices >= maxDevices) {
        throw new BadRequestException(
          `已达到设备绑定上限(${maxDevices}台)，请先解绑其他设备`,
        );
      }
      await this.devicesService.bindToUser(hwid, endUser.id, appId);
    }

    // 7. 计算试用期到期时间
    const now = nowCN();
    let expireTime: Date;

    // 检查现有到期时间是否有效
    if (endUser.expire_time) {
      const parsedExpireTime = new Date(endUser.expire_time);
      // 使用 isNaN 检查日期是否有效
      if (!isNaN(parsedExpireTime.getTime()) && parsedExpireTime > now) {
        expireTime = parsedExpireTime;
      } else {
        expireTime = now;
      }
    } else {
      expireTime = now;
    }

    // 增加试用期时长
    expireTime = new Date(expireTime.getTime() + app.trial_duration * 1000);

    // 8. 更新用户信息
    const newMaxDevices = Math.max(
      endUser.max_devices || 1,
      app.trial_device_limit || 1,
    );

    await this.endUsersService.update(endUser.id, {
      expire_time: expireTime,
      app_id: endUser.app_id || appId,
      max_devices: newMaxDevices,
      has_used_trial: true,
    });

    return {
      success: true,
      message: "试用激活成功",
      expire_time: expireTime,
      added_seconds: app.trial_duration,
      max_devices: newMaxDevices,
      is_trial: true,
    };
  }

  async banCard(id: number) {
    const card = await this.cardsRepository.findOne({ where: { id } });
    if (card && card.status === CardStatus.UNUSED) {
      card.status = CardStatus.BANNED;
      await this.cardsRepository.save(card);
    }
    return { banned: true };
  }

  async unbanCard(id: number) {
    const card = await this.cardsRepository.findOne({ where: { id } });
    if (card && card.status === CardStatus.BANNED) {
      card.status = CardStatus.UNUSED;
      await this.cardsRepository.save(card);
    }
    return { unbanned: true };
  }

  async remove(id: number) {
    await this.cardsRepository.delete(id);
    return { deleted: true };
  }
}
