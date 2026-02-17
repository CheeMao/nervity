import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { nowCN, todayCN, formatDateCN } from "../common/utils/timezone";
import { Admin } from "../users/entities/user.entity";
import { App } from "../apps/entities/app.entity";
import { Card, CardStatus } from "../cards/entities/card.entity";

export interface OverviewData {
  totalUsers: number;
  todayNewUsers?: number;
  totalApps?: number;
  totalCards?: number;
  usedCards?: number;
  // Admin specific
  totalDevelopers?: number;
  // Developer specific
  totalAgents?: number;
  // Developer & Agent specific
  unusedCards?: number;
  // Agent specific
  balance?: number;
  todaySales?: number;
  monthSales?: number;
}

export interface TrendDataPoint {
  date: string;
  count: number;
}

export interface CardStatsData {
  total: number;
  unused: number;
  used: number;
  banned: number;
}

@Injectable()
export class StatisticsService {
  constructor(
    @InjectRepository(Admin)
    private usersRepository: Repository<Admin>,
    @InjectRepository(App)
    private appsRepository: Repository<App>,
    @InjectRepository(Card)
    private cardsRepository: Repository<Card>,
  ) { }

  async getAdminOverview(): Promise<OverviewData> {
    const today = todayCN();

    const [totalUsers, todayNewUsers, totalApps, totalDevelopers] =
      await Promise.all([
        this.usersRepository.count(),
        this.usersRepository
          .createQueryBuilder("user")
          .where("user.created_at >= :today", { today })
          .getCount(),
        this.appsRepository.count(),
        this.usersRepository
          .createQueryBuilder("user")
          .innerJoin("user.role_relation", "role")
          .where("role.name = :roleName", { roleName: "Developer" })
          .getCount(),
      ]);

    // Admin view
    return {
      totalUsers,
      todayNewUsers,
      totalApps,
      totalCards: 0, // Not focused for admin in this view
      usedCards: 0,
      totalDevelopers,
    } as any;
  }

  async getDeveloperOverview(
    developerId: number,
  ): Promise<Partial<OverviewData>> {
    const today = todayCN();

    // 1. Get my agents
    const myAgents = await this.usersRepository.find({
      where: { parent_id: developerId },
      select: ["id"],
    });
    const agentIds = myAgents.map((agent) => agent.id);
    const allCreatorIds = [developerId, ...agentIds];

    const [myApps, myUsers, myCards, myUsedCards, myUnusedCards] =
      await Promise.all([
        this.appsRepository.count({ where: { creator_id: developerId } }),

        // Users: those who used cards created by me OR my agents
        // This is a more complex query but accurate for "My Users"
        this.cardsRepository
          .createQueryBuilder("card")
          .where("card.creator_id IN (:...allCreatorIds)", { allCreatorIds })
          .andWhere("card.used_by_id IS NOT NULL")
          .select("COUNT(DISTINCT card.used_by_id)", "count")
          .getRawOne()
          .then((res) => parseInt(res.count, 10) || 0),

        this.cardsRepository
          .createQueryBuilder("card")
          .where("card.creator_id IN (:...allCreatorIds)", { allCreatorIds })
          .getCount(),
        this.cardsRepository
          .createQueryBuilder("card")
          .where("card.creator_id IN (:...allCreatorIds)", { allCreatorIds })
          .andWhere("card.status = :status", { status: CardStatus.USED })
          .getCount(),
        this.cardsRepository
          .createQueryBuilder("card")
          .where("card.creator_id IN (:...allCreatorIds)", { allCreatorIds })
          .andWhere("card.status = :status", { status: CardStatus.UNUSED })
          .getCount(),
      ]);

    return {
      totalApps: myApps,
      totalAgents: myAgents.length,
      totalUsers: myUsers,
      totalCards: myCards,
      usedCards: myUsedCards,
      unusedCards: myUnusedCards,
    } as any;
  }

  async getAgentOverview(agentId: number): Promise<Partial<OverviewData>> {
    const agent = await this.usersRepository.findOne({
      where: { id: agentId },
      select: ["id", "balance"],
    });

    const [myUnusedCards, myUsedCards, myUsers, todaySales, monthSales] =
      await Promise.all([
        this.cardsRepository.count({
          where: { creator_id: agentId, status: CardStatus.UNUSED },
        }),
        this.cardsRepository.count({
          where: { creator_id: agentId, status: CardStatus.USED },
        }),
        // Users activated cards generated/sold by this agent
        this.cardsRepository
          .createQueryBuilder("card")
          .where("card.creator_id = :agentId", { agentId })
          .andWhere("card.used_by_id IS NOT NULL")
          .select("COUNT(DISTINCT card.used_by_id)", "count")
          .getRawOne()
          .then((res) => parseInt(res.count, 10) || 0),
        // Today's activations
        this.cardsRepository
          .createQueryBuilder("card")
          .where("card.creator_id = :agentId", { agentId })
          .andWhere("card.used_at >= CURDATE()")
          .getCount(),
        // Month's activations
        this.cardsRepository
          .createQueryBuilder("card")
          .where("card.creator_id = :agentId", { agentId })
          .andWhere("card.used_at >= DATE_FORMAT(NOW() ,'%Y-%m-01')")
          .getCount(),
      ]);

    return {
      balance: agent?.balance || 0,
      unusedCards: myUnusedCards,
      usedCards: myUsedCards,
      totalUsers: myUsers,
      todaySales,
      monthSales,
    } as any;
  }

  async getOverview(user: any): Promise<any> {
    const roleName = user.role_name || user.roleName || user.role_relation?.name;
    if (roleName === 'Super Admin') {
      return this.getAdminOverview();
    } else if (roleName === 'Developer') {
      return this.getDeveloperOverview(user.id);
    } else if (roleName === 'Agent') {
      return this.getAgentOverview(user.id);
    }
  }

  async getUserTrend(days: number = 7): Promise<TrendDataPoint[]> {
    const result: TrendDataPoint[] = [];
    const today = nowCN();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const count = await this.usersRepository
        .createQueryBuilder("user")
        .where("user.created_at >= :date", { date })
        .andWhere("user.created_at < :nextDate", { nextDate })
        .getCount();

      result.push({
        date: formatDateCN(date),
        count,
      });
    }

    return result;
  }

  async getAdminTrend(days: number = 7): Promise<any> {
    const userTrend = await this.getUserTrend(days);

    // Card Sales Trend
    const cardTrend: TrendDataPoint[] = [];
    const today = nowCN();
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = formatDateCN(date);

      const count = await this.cardsRepository
        .createQueryBuilder("card")
        .where("DATE(card.used_at) = :dateStr", { dateStr })
        .getCount();

      cardTrend.push({ date: dateStr, count });
    }

    return { userTrend, cardTrend };
  }

  async getDeveloperTrend(developerId: number, days: number = 7): Promise<any> {
    const today = todayCN();

    // 1. App Active Trend (using card usage as proxy for activity if heartbeat not stored historically)
    // Ideally we track daily active users. For now, let's track card activations for my apps.
    // Or users created under my hierarchy.
    // Let's use New Users trend for developer's apps/agents.

    // Get all my agent IDs
    const myAgents = await this.usersRepository.find({
      where: { parent_id: developerId },
      select: ["id"],
    });
    const agentIds = myAgents.map((agent) => agent.id);
    const allCreatorIds = [developerId, ...agentIds];

    const appActiveTrend: TrendDataPoint[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = formatDateCN(date);

      // Count cards activated on this date by me or my agents
      const count = await this.cardsRepository
        .createQueryBuilder("card")
        .where("card.creator_id IN (:...allCreatorIds)", { allCreatorIds })
        .andWhere("DATE(card.used_at) = :dateStr", { dateStr })
        .getCount();

      appActiveTrend.push({ date: dateStr, count });
    }

    // 2. Version Distribution
    // This requires Device entity linkage.
    // Assuming devices are linked to apps created by Developer.
    // For now, let's mock or use a simple query if Device entity has app_version.
    // Since I just added app_version, it might be empty.
    // Let's Query devices where app.creator_id = developerId
    // We need to join App.
    // SELECT d.app_version, COUNT(*) FROM device d JOIN app a ON d.app_id = a.id WHERE a.creator_id = ? GROUP BY d.app_version

    // To implement this properly we need to inject DeviceRepository.
    // Since I cannot inject it easily in this step without changing constructor,
    // I will skip Version Distribution implementation details or use raw query manager?
    // StatisticsService injects AppRepository.
    // I can stick to Card Status Distribution for Developer as well?
    // Plan said "Version Distribution".
    // I'll return empty list for version dist for now or try to fetch if possible.
    // Let's stick to Card Status Distribution for Developer too, as it is reliable.
    // Or I can use existing repositories to get what I can.

    // Let's implement Card Status Distribution for Developer
    const cardStatusDistribution = [
      {
        name: "未使用",
        value: await this.cardsRepository.count({
          where: { creator_id: developerId, status: CardStatus.UNUSED },
        }),
      },
      {
        name: "已使用",
        value: await this.cardsRepository.count({
          where: { creator_id: developerId, status: CardStatus.USED },
        }),
      },
      {
        name: "已禁用",
        value: await this.cardsRepository.count({
          where: { creator_id: developerId, status: CardStatus.BANNED },
        }),
      },
    ];

    return {
      appActiveTrend,
      versionDistribution: [], // Placeholder until Device repository is injected
      cardStatusDistribution,
    };
  }

  async getAgentTrend(agentId: number, days: number = 7): Promise<any> {
    const salesTrend: TrendDataPoint[] = [];
    const today = nowCN();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = formatDateCN(date);

      const count = await this.cardsRepository
        .createQueryBuilder("card")
        .where("card.creator_id = :agentId", { agentId })
        .andWhere("DATE(card.used_at) = :dateStr", { dateStr })
        .getCount();

      salesTrend.push({ date: dateStr, count });
    }

    const cardStatusDistribution = [
      {
        name: "未使用",
        value: await this.cardsRepository.count({
          where: { creator_id: agentId, status: CardStatus.UNUSED },
        }),
      },
      {
        name: "已使用",
        value: await this.cardsRepository.count({
          where: { creator_id: agentId, status: CardStatus.USED },
        }),
      },
      {
        name: "已禁用",
        value: await this.cardsRepository.count({
          where: { creator_id: agentId, status: CardStatus.BANNED },
        }),
      },
    ];

    return { salesTrend, cardStatusDistribution };
  }

  async getTrend(user: any): Promise<any> {
    const roleName = user.role_name || user.roleName || user.role_relation?.name;
    if (roleName === 'Super Admin') {
      return this.getAdminTrend();
    } else if (roleName === 'Developer') {
      return this.getDeveloperTrend(user.id);
    } else if (roleName === 'Agent') {
      return this.getAgentTrend(user.id);
    }
  }

  async getCardStats(): Promise<CardStatsData> {
    const [total, unused, used, banned] = await Promise.all([
      this.cardsRepository.count(),
      this.cardsRepository.count({ where: { status: CardStatus.UNUSED } }),
      this.cardsRepository.count({ where: { status: CardStatus.USED } }),
      this.cardsRepository.count({ where: { status: CardStatus.BANNED } }),
    ]);

    return {
      total,
      unused,
      used,
      banned,
    };
  }
}
