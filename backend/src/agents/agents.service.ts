import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { todayCN } from "../common/utils/timezone";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Agent } from "./entities/agent.entity";
import { Admin } from "../users/entities/user.entity";
import { Card, CardStatus } from "../cards/entities/card.entity";
import { EndUser } from "../end-users/entities/end-user.entity";
import { v4 as uuidv4 } from "uuid";
import { BalanceLogsService } from "../balance-logs/balance-logs.service";
import { BalanceLogType } from "../balance-logs/entities/balance-log.entity";

export interface AgentDashboardData {
  totalUsers: number;
  todayNewUsers: number;
  totalCards: number;
  usedCards: number;
  balance: number;
  level: number;
  discountRate: number;
}

@Injectable()
export class AgentsService {
  constructor(
    @InjectRepository(Agent)
    private agentsRepository: Repository<Agent>,
    @InjectRepository(Admin)
    private usersRepository: Repository<Admin>,
    @InjectRepository(Card)
    private cardsRepository: Repository<Card>,
    @InjectRepository(EndUser)
    private endUsersRepository: Repository<EndUser>,
    private balanceLogsService: BalanceLogsService,
  ) { }

  async findByUserId(userId: number) {
    return this.agentsRepository.findOne({
      where: { user: { id: userId } },
      relations: ["user"],
    });
  }

  async getDashboard(userId: number): Promise<AgentDashboardData> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException("User not found");
    }

    const agent = await this.agentsRepository.findOne({
      where: { user: { id: userId } },
      relations: ["user"],
    });

    // Default values if agent record is missing
    const level = agent ? agent.level : 1;
    const discountRate = agent ? Number(agent.discount_rate) : 100;

    const [totalUsers, todayNewUsers, totalCards, usedCards] =
      await Promise.all([
        this.usersRepository.count({ where: { parent_id: userId } }),
        this.usersRepository
          .createQueryBuilder("user")
          .where("user.parent_id = :userId", { userId })
          .andWhere("user.created_at >= :today", {
            today: todayCN(),
          })
          .getCount(),
        this.cardsRepository.count({ where: { creator_id: userId } }),
        this.cardsRepository.count({
          where: { creator_id: userId, status: CardStatus.USED },
        }),
      ]);

    return {
      totalUsers,
      todayNewUsers,
      totalCards,
      usedCards,
      balance: Number(user.balance),
      level,
      discountRate,
    };
  }

  async getSubUsers(userId: number, page: number, pageSize: number) {
    const agent = await this.agentsRepository.findOne({
      where: { user: { id: userId } },
    });
    if (!agent) {
      return { list: [], total: 0 };
    }

    const skip = (page - 1) * pageSize;

    const [list, total] = await this.usersRepository.findAndCount({
      where: { parent_id: userId },
      skip,
      take: pageSize,
      order: { created_at: "DESC" },
      select: [
        "id",
        "username",
        "email",
        "role",
        "balance",
        "is_active",
        "created_at",
        "updated_at",
        "expire_at",
        "remark",
      ],
    });

    return { list, total };
  }

  async getCards(userId: number, page: number, pageSize: number) {
    const agent = await this.agentsRepository.findOne({
      where: { user: { id: userId } },
    });
    if (!agent) {
      return { list: [], total: 0 };
    }

    const skip = (page - 1) * pageSize;

    const [list, total] = await this.cardsRepository.findAndCount({
      where: { creator_id: userId },
      skip,
      take: pageSize,
      order: { created_at: "DESC" },
      relations: ["app"],
    });

    return { list, total };
  }

  async generateCards(
    userId: number,
    value: number,
    appId: number,
    count: number,
  ) {
    const agent = await this.agentsRepository.findOne({
      where: { user: { id: userId } },
      relations: ["user"],
    });

    if (!agent) {
      throw new ForbiddenException("非代理商账户");
    }

    // 计算卡密成本（根据折扣率）
    // value is duration in seconds. 1 day = 86400
    const unitCost = (value / 86400) * (Number(agent.discount_rate) / 100);
    const totalCost = unitCost * count;

    if (Number(agent.user.balance) < totalCost) {
      throw new ForbiddenException("余额不足");
    }

    // 扣除余额
    const newBalance = Number(agent.user.balance) - totalCost;
    await this.usersRepository.update(userId, {
      balance: newBalance,
    });

    // 记录余额变动日志
    await this.balanceLogsService.logChange(
      userId,
      -totalCost,
      BalanceLogType.CARD_GENERATION,
      newBalance,
      userId, // 代理商自己操作
      `生成 ${count} 张时长卡 (时长 ${value}秒)`,
    );

    // 生成卡密
    const cards: Partial<Card>[] = [];
    for (let i = 0; i < count; i++) {
      cards.push({
        code: uuidv4().replace(/-/g, "").toUpperCase().slice(0, 16),
        type: "time",
        value,
        status: CardStatus.UNUSED,
        app_id: appId,
        creator_id: userId,
      });
    }

    const result = await this.cardsRepository.save(cards);
    return { created: result.length, cards: result.map((c) => c.code) };
  }

  async getEndUsers(agentId: number, page: number, pageSize: number) {
    const skip = (page - 1) * pageSize;

    const [list, total] = await this.endUsersRepository.findAndCount({
      where: { card_creator_id: agentId },
      skip,
      take: pageSize,
      order: { created_at: "DESC" },
      relations: ["app"],
    });

    return { list, total };
  }

  async unbindEndUserHwid(agentId: number, endUserId: number): Promise<void> {
    const endUser = await this.endUsersRepository.findOne({
      where: { id: endUserId },
    });

    if (!endUser) {
      throw new NotFoundException("终端用户不存在");
    }

    if (endUser.card_creator_id !== agentId) {
      throw new ForbiddenException("无权操作此用户");
    }

    endUser.hwid = null;
    await this.endUsersRepository.save(endUser);
  }
}
