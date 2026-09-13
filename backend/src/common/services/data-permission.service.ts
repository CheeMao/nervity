import { Injectable, ForbiddenException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, SelectQueryBuilder } from "typeorm";
import { Admin, AdminRole } from "../../users/entities/user.entity";

/**
 * 用户信息接口（从 JWT 解析后的结构）
 */
export interface CurrentUser {
  id: number;
  type?: string;
  session_id?: string;
  hwid?: string;
  userId?: number; // 可选，有些地方可能只传 id
  role: string;
  role_name?: string;
  permissions?: string[];
  parent_id?: number;
}

/**
 * 数据权限过滤选项
 */
export interface DataPermissionOptions {
  /** QueryBuilder 别名，默认为查询的主表别名 */
  alias?: string;
  /** 要过滤的字段名，默认为 'creator_id' */
  fieldName?: string;
  /** 是否包含下级数据（对于 developer），默认 true */
  includeSubordinates?: boolean;
  /**
   * 代理商查看上级数据模式：
   * - 'default': agent 只看自己
   * - 'viewParent': agent 看自己 + 上级开发者（适用于 apps, card-types）
   */
  agentMode?: 'default' | 'viewParent';
  /** 全部读取权限的 code，如果有且用户有此权限，则跳过过滤 */
  readAllPermission?: string;
}

/**
 * 通用数据权限过滤服务
 *
 * 用于根据用户角色过滤数据访问权限：
 * - admin: 可以访问所有数据
 * - developer: 可以访问自己和下级代理商的数据
 * - agent: 只能访问自己的数据
 */
@Injectable()
export class DataPermissionService {
  constructor(
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
  ) {}

  assertAdmin(currentUser: CurrentUser): number {
    const id = Number(currentUser?.userId || currentUser?.id);
    if (!Number.isSafeInteger(id) || id < 1 ||
        !Object.values(AdminRole).includes(currentUser?.role as AdminRole) ||
        currentUser?.type === "end_user") {
      throw new ForbiddenException("缺少有效的后台用户身份");
    }
    return id;
  }

  async assertCreator(creatorId: number | string, currentUser: CurrentUser, viewParent = false): Promise<void> {
    const id = this.assertAdmin(currentUser);
    if (currentUser.role === AdminRole.ADMIN) return;
    const allowed = await this.getAllowedUserIds(currentUser);
    if (viewParent && currentUser.role === AdminRole.AGENT && currentUser.parent_id) {
      allowed.push(Number(currentUser.parent_id));
    }
    if (!creatorId || !allowed.map(Number).includes(Number(creatorId))) {
      throw new ForbiddenException("无权访问该资源");
    }
  }

  /**
   * 获取用户可访问的所有用户 ID 列表
   * @param currentUser 当前用户信息
   * @returns 允许访问的用户 ID 数组
   */
  async getAllowedUserIds(currentUser: CurrentUser): Promise<number[]> {
    const userId = this.assertAdmin(currentUser);

    // admin 可以访问所有
    if (currentUser.role === AdminRole.ADMIN) {
      return []; // 空数组表示不限制
    }

    // developer 可以访问自己和下级代理商
    if (currentUser.role === AdminRole.DEVELOPER) {
      const subUsers = await this.adminRepository.find({
        where: { parent_id: userId },
        select: ["id"],
      });
      return [userId, ...subUsers.map((u) => u.id)];
    }

    // agent 只能访问自己
    return [userId];
  }

  /**
   * 判断用户是否可以访问所有数据
   * @param currentUser 当前用户信息
   * @param readAllPermission 全部读取权限 code（可选）
   */
  canAccessAll(currentUser: CurrentUser, readAllPermission?: string): boolean {
    this.assertAdmin(currentUser);
    // admin 角色可以访问所有
    if (currentUser.role === AdminRole.ADMIN) {
      return true;
    }

    // 如果指定了权限 code，检查用户是否有该权限
    if (readAllPermission && currentUser.permissions?.includes(readAllPermission)) {
      return true;
    }

    return false;
  }

  /**
   * 给 QueryBuilder 添加数据权限过滤
   *
   * @param queryBuilder TypeORM QueryBuilder
   * @param currentUser 当前用户信息
   * @param options 过滤选项
   *
   * @example
   * // 基本用法
   * const queryBuilder = this.cardRepository.createQueryBuilder("card");
   * await this.dataPermissionService.applyFilter(queryBuilder, req.user, {
   *   alias: "card",
   *   fieldName: "creator_id",
   * });
   *
   * @example
   * // 代理商查看上级数据（适用于 apps, card-types）
   * await this.dataPermissionService.applyFilter(queryBuilder, req.user, {
   *   fieldName: "creator_id",
   *   agentMode: "viewParent",
   * });
   */
  async applyFilter<T>(
    queryBuilder: SelectQueryBuilder<T>,
    currentUser: CurrentUser,
    options: DataPermissionOptions = {},
  ): Promise<SelectQueryBuilder<T>> {
    const {
      alias,
      fieldName = "creator_id",
      includeSubordinates = true,
      agentMode = "default",
      readAllPermission,
    } = options;

    // 获取表别名
    const tableAlias = alias || queryBuilder.alias;

    // 获取用户 ID，如果没有则不做过滤（避免 bug）
    const userId = this.assertAdmin(currentUser);
    if (!userId) {
      throw new ForbiddenException("缺少用户身份");
    }

    // 如果用户可以访问所有数据，不添加过滤条件
    if (this.canAccessAll(currentUser, readAllPermission)) {
      return queryBuilder;
    }

    // agent 角色处理
    if (currentUser.role === AdminRole.AGENT) {
      if (agentMode === "viewParent") {
        // 代理商查看上级开发者的数据（适用于 apps, card-types）
        const allowedIds: number[] = [userId];
        if (currentUser.parent_id) {
          allowedIds.push(currentUser.parent_id);
        }
        queryBuilder.andWhere(
          `${tableAlias}.${fieldName} IN (:...allowedIds)`,
          { allowedIds },
        );
      } else {
        // 默认：agent 只能看自己
        queryBuilder.andWhere(`${tableAlias}.${fieldName} = :currentUserId`, {
          currentUserId: userId,
        });
      }
      return queryBuilder;
    }

    // 不包含下级时，只看自己
    if (!includeSubordinates) {
      queryBuilder.andWhere(`${tableAlias}.${fieldName} = :currentUserId`, {
        currentUserId: userId,
      });
      return queryBuilder;
    }

    // developer 可以看自己和下级
    if (currentUser.role === AdminRole.DEVELOPER) {
      const allowedUserIds = await this.getAllowedUserIds(currentUser);
      if (allowedUserIds.length > 0) {
        queryBuilder.andWhere(
          `${tableAlias}.${fieldName} IN (:...allowedUserIds)`,
          { allowedUserIds },
        );
      }
      return queryBuilder;
    }

    // 其他情况，只看自己（包括未知角色）
    queryBuilder.andWhere(`${tableAlias}.${fieldName} = :currentUserId`, {
      currentUserId: userId,
    });
    return queryBuilder;
  }

  /**
   * 获取过滤后的 creator_id 条件
   * 用于传递给 Service 层的简单方法
   *
   * @param currentUser 当前用户信息
   * @param readAllPermission 全部读取权限 code（可选）
   * @returns creatorId 条件：
   *   - undefined: 可以访问所有
   *   - number: 只能访问该用户
   *   - number[]: 可以访问这些用户
   */
  async getCreatorIdFilter(
    currentUser: CurrentUser,
    readAllPermission?: string,
  ): Promise<number | number[] | undefined> {
    if (this.canAccessAll(currentUser, readAllPermission)) {
      return undefined;
    }

    const userId = this.assertAdmin(currentUser);

    if (currentUser.role === AdminRole.AGENT) {
      return userId;
    }

    if (currentUser.role === AdminRole.DEVELOPER) {
      return this.getAllowedUserIds(currentUser);
    }

    return userId;
  }
}
