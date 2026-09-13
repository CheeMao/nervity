import { GenerateCardDto } from "./dto/generate-card.dto";
import { validateSync } from "class-validator";
import { plainToInstance } from "class-transformer";
import { App } from "../apps/entities/app.entity";
import { Agent } from "../agents/entities/agent.entity";
import { CardType } from "../card-types/entities/card-type.entity";
import { EndUser } from "../end-users/entities/end-user.entity";
import { BalanceLog } from "../balance-logs/entities/balance-log.entity";
import { toCents } from "../common/utils/money";
import { Injectable, BadRequestException, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { nowCN, permanentExpireDate, isPermanentExpire } from "../common/utils/timezone";
import { Repository } from "typeorm";
import { Card, CardStatus } from "./entities/card.entity";
import { Admin } from "../users/entities/user.entity";
import { randomInt } from "crypto";
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
      code += chars.charAt(randomInt(chars.length));
    }
    return code;
  }

  async generate(input: GenerateCardDto, currentUser: CurrentUser) {
    const dto = plainToInstance(GenerateCardDto, input);
    if (validateSync(dto, { whitelist: true, forbidNonWhitelisted: true }).length) throw new BadRequestException("卡密参数无效");
    const creatorId = this.dataPermissionService.assertAdmin(currentUser);
    return this.cardsRepository.manager.transaction(async manager => {
      // Serialize balance changes, and commit balance/log/cards as one unit.
      const creator = await manager.findOne(Admin, { where: { id: creatorId }, lock: { mode: "pessimistic_write" } });
      if (!creator?.is_active) throw new BadRequestException("账户无效");
      const app = await manager.findOneBy(App, { id: dto.app_id });
      if (!app?.is_active) throw new BadRequestException("应用不存在或已停用");
      await this.dataPermissionService.assertCreator(app.creator_id, currentUser, true);
      if (creator.role === "agent" && (!dto.card_type_id || !app.agent_visible)) throw new BadRequestException("代理商必须选择已开放应用的卡类");
      const cardType = dto.card_type_id ? await manager.findOneBy(CardType, { id: dto.card_type_id }) : null;
      if (dto.card_type_id && (!cardType || Number(cardType.app_id) !== Number(app.id))) throw new BadRequestException("卡类与应用不匹配");
      if (cardType) await this.dataPermissionService.assertCreator(cardType.creator_id, currentUser, true);
      const permanent = !!cardType?.is_permanent;
      const duration = permanent ? 0 : cardType?.value ?? dto.value;
      const deviceLimit = cardType?.device_limit ?? dto.device_limit ?? 1;
      if ((!permanent && (!Number.isInteger(duration) || duration <= 0)) || !Number.isInteger(deviceLimit) || deviceLimit < 1 || deviceLimit > 10) throw new BadRequestException("卡密时长或设备限制无效");
      if (creator.role === "agent") {
        const agent = await manager.findOne(Agent, { where: { user: { id: creatorId } } });
        const rate = toCents(agent?.discount_rate ?? 100);
        if (rate <= 0 || rate > 10000) throw new BadRequestException("代理折扣配置无效");
        const unitCents = Math.round(toCents(cardType.price) * rate / 10000);
        const cost = unitCents * dto.count;
        const balance = toCents(creator.balance);
        if (!Number.isSafeInteger(cost) || cost > balance) throw new BadRequestException("余额不足");
        await manager.update(Admin, creatorId, { balance: (balance - cost) / 100 });
        await manager.save(BalanceLog, manager.create(BalanceLog, { user_id: creatorId, operator_id: creatorId,
          amount: -cost / 100, balance_after: (balance - cost) / 100, type: BalanceLogType.CARD_GENERATION,
          description: `生成 ${dto.count} 张 ${cardType.name} 卡密` }));
      }
      const cards = Array.from({ length: dto.count }, () => manager.create(Card, {
        code: this.generateCardCode(dto.code_length ?? 16), type: permanent ? "permanent" : "time",
        value: duration, is_permanent: permanent, status: CardStatus.UNUSED,
        creator_id: creatorId, app_id: app.id, device_limit: deviceLimit, remark: dto.remark,
      }));
      return manager.save(Card, cards);
    });
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

  async useCard(code: string, userId: number, hwid: string | null, username?: string) {
    if (!userId || typeof code !== "string" || !code || code.length > 255) throw new BadRequestException("无效卡密或用户");
    return this.cardsRepository.manager.transaction(async manager => {
      // Always lock user first: different cards cannot overwrite this user's expiry.
      const user = await manager.findOne(EndUser, { where: { id: userId }, lock: { mode: "pessimistic_write" } });
      const card = await manager.findOne(Card, { where: { code }, lock: { mode: "pessimistic_write" } });
      if (!user?.is_active || !card || card.status !== CardStatus.UNUSED) throw new BadRequestException("卡密无效、已使用或账号已停用");
      if (Number(user.app_id) !== Number(card.app_id)) throw new BadRequestException("卡密与应用不匹配");
      const app = await manager.findOneBy(App, { id: user.app_id });
      if (!app?.is_active) throw new BadRequestException("应用已停用");
      if (!card.is_permanent && (!Number.isInteger(card.value) || card.value <= 0)) throw new BadRequestException("卡密面值无效");
      user.max_devices = Math.max(user.max_devices || 1, card.device_limit || 1);
      if (hwid) await this.endUsersService.bindDevice(manager, user, hwid);
      const previous = new Date(user.expire_time || 0).getTime();
      user.expire_time = card.is_permanent || isPermanentExpire(user.expire_time) ? permanentExpireDate()
        : new Date(Math.max(Date.now(), Number.isFinite(previous) ? previous : 0) + card.value * 1000);
      user.card_creator_id = card.creator_id;
      await manager.update(EndUser, user.id, { expire_time: user.expire_time, max_devices: user.max_devices, card_creator_id: user.card_creator_id });
      const consumed = await manager.query(
        "UPDATE card SET status = ?, used_by = ?, used_by_id = ?, used_at = ? WHERE id = ? AND status = ?",
        [CardStatus.USED, user.id, user.id, new Date(), card.id, CardStatus.UNUSED],
      );
      if ((consumed.affectedRows ?? consumed.affected) !== 1) throw new BadRequestException("卡密已被其他请求兑换");
      return { success: true, message: "激活成功", expire_time: user.expire_time,
        added_seconds: card.is_permanent ? 0 : card.value, is_permanent: !!card.is_permanent, max_devices: user.max_devices };
    });
  }

  async handleTrialActivation(appId: number, hwid: string, userId: number) {
    return this.endUsersService.claimTrial(userId, appId, hwid);
  }

  async banCard(id: number) {
    const result = await this.cardsRepository.update({ id, status: CardStatus.UNUSED }, { status: CardStatus.BANNED });
    return { banned: result.affected === 1 };
  }

  async unbanCard(id: number) {
    const result = await this.cardsRepository.update({ id, status: CardStatus.BANNED }, { status: CardStatus.UNUSED });
    return { unbanned: result.affected === 1 };
  }

  async remove(id: number) {
    await this.cardsRepository.delete(id);
    return { deleted: true };
  }
}
