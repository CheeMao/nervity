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
import { CardsService } from "../cards/cards.service";
import { EndUsersService } from "../end-users/end-users.service";
import { GenerateCardDto } from "../cards/dto/generate-card.dto";
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
    private cardsService: CardsService,
    private endUsersService: EndUsersService,
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

  async generateCards(currentUser: any, dto: GenerateCardDto) {
    const cards = await this.cardsService.generate(dto, currentUser);
    return { created: cards.length, cards: cards.map(card => card.code) };
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

    if (Number(endUser.card_creator_id) !== Number(agentId)) {
      throw new ForbiddenException("无权操作此用户");
    }

    await this.endUsersService.unbindHwid(endUser.id);
  }
}
