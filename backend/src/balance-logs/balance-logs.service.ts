import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { BalanceLog, BalanceLogType } from "./entities/balance-log.entity";
import { DataPermissionService, CurrentUser } from "../common/services/data-permission.service";

@Injectable()
export class BalanceLogsService {
  constructor(
    @InjectRepository(BalanceLog)
    private balanceLogsRepository: Repository<BalanceLog>,
    private readonly dataPermissionService: DataPermissionService,
  ) {}

  async logChange(
    userId: number,
    amount: number,
    type: BalanceLogType,
    balanceAfter: number,
    operatorId?: number, // Optional, system or self-operation might not have distinct operator
    description?: string,
  ): Promise<BalanceLog> {
    const log = this.balanceLogsRepository.create({
      user_id: userId,
      amount,
      type,
      balance_after: balanceAfter,
      operator_id: operatorId,
      description,
    });
    return await this.balanceLogsRepository.save(log);
  }

  async findAll(
    page: number = 1,
    pageSize: number = 10,
    userId?: number,
    currentUser?: CurrentUser,
  ): Promise<{ list: BalanceLog[]; total: number }> {
    const skip = (page - 1) * pageSize;
    const queryBuilder = this.balanceLogsRepository.createQueryBuilder("log");

    // 使用通用数据权限过滤
    if (currentUser) {
      await this.dataPermissionService.applyFilter(queryBuilder, currentUser, {
        fieldName: "user_id",
      });
    }

    if (userId) {
      queryBuilder.andWhere("log.user_id = :userId", { userId });
    }

    queryBuilder
      .leftJoinAndSelect("log.user", "user")
      .leftJoinAndSelect("log.operator", "operator")
      .orderBy("log.created_at", "DESC")
      .skip(skip)
      .take(pageSize);

    const [list, total] = await queryBuilder.getManyAndCount();

    // Sanitize user info
    const sanitizedList = list.map((log) => ({
      ...log,
      user: log.user ? { id: log.user.id, username: log.user.username } : null,
      operator: log.operator
        ? { id: log.operator.id, username: log.operator.username }
        : null,
    }));

    return { list: sanitizedList as any, total };
  }

  async getStatistics(userId?: number) {
    const queryBuilder = this.balanceLogsRepository.createQueryBuilder("log");

    if (userId) {
      queryBuilder.where("log.user_id = :userId", { userId });
    }

    const [
      totalCount,
      totalIncome,
      totalExpense,
      latestLogs,
    ] = await Promise.all([
      queryBuilder.clone().getCount(),
      queryBuilder.clone()
        .select("SUM(log.amount)", "total")
        .where("log.amount > 0")
        .getRawOne(),
      queryBuilder.clone()
        .select("SUM(ABS(log.amount))", "total")
        .where("log.amount < 0")
        .getRawOne(),
      queryBuilder.clone()
        .orderBy("log.created_at", "DESC")
        .limit(10)
        .getMany(),
    ]);

    return {
      totalCount: totalCount || 0,
      totalIncome: parseFloat(totalIncome?.total || '0'),
      totalExpense: parseFloat(totalExpense?.total || '0'),
      currentBalance: (parseFloat(totalIncome?.total || '0') - parseFloat(totalExpense?.total || '0')),
      latestLogs: latestLogs.map((log) => ({
        id: log.id,
        amount: log.amount,
        type: log.type,
        created_at: log.created_at,
        description: log.description,
      })),
    };
  }
}
