import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from "@nestjs/common";
import { todayCN } from "../common/utils/timezone";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, DeepPartial, Like, FindOptionsWhere } from "typeorm";
import { Admin, AdminRole } from "./entities/user.entity";
import { QueryUserDto } from "./dto/query-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { CreateAdminDto } from "./dto/create-admin.dto";
import { PublicRegisterDto, RegisterType } from "./dto/public-register.dto";
import * as bcrypt from "bcrypt";
import { AccessControlService } from "../access-control/access-control.service";
import { BalanceLogsService } from "../balance-logs/balance-logs.service";
import { BalanceLogType } from "../balance-logs/entities/balance-log.entity";
import { Agent } from "../agents/entities/agent.entity";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Admin)
    private usersRepository: Repository<Admin>,
    private accessControlService: AccessControlService,
    private balanceLogsService: BalanceLogsService,
    @InjectRepository(Agent)
    private agentsRepository: Repository<Agent>,
  ) { }

  async create(createUserDto: any): Promise<Admin> {
    if (createUserDto.password) {
      createUserDto.password = await bcrypt.hash(createUserDto.password, 10);
    }

    let role;
    if (createUserDto.role_id) {
      role = await this.accessControlService.findRoleById(
        createUserDto.role_id,
      );
    }

    const user = this.usersRepository.create({
      ...createUserDto,
      role_relation: role,
    }) as unknown as Admin;
    return await this.usersRepository.save(user);
  }

  async findAll(
    query: QueryUserDto,
    parentId?: number,
  ): Promise<{ list: Admin[]; total: number }> {
    const { page = 1, pageSize = 10, keyword, role, is_active } = query;
    const skip = (page - 1) * pageSize;

    const where: FindOptionsWhere<Admin> = {};

    if (parentId) {
      where.parent_id = parentId;
    }

    if (keyword) {
      // 搜索用户名或邮箱
      where.username = Like(`%${keyword}%`);
    }

    if (role) {
      where.role = role;
    }

    if (is_active !== undefined) {
      where.is_active = is_active;
    }

    if (query.remark) {
      where.remark = Like(`%${query.remark}%`);
    }

    if (query.created_at_start || query.created_at_end) {
      const { Between, MoreThanOrEqual, LessThanOrEqual } = require("typeorm");
      if (query.created_at_start && query.created_at_end) {
        where.created_at = Between(
          new Date(query.created_at_start),
          new Date(query.created_at_end),
        );
      } else if (query.created_at_start) {
        where.created_at = MoreThanOrEqual(new Date(query.created_at_start));
      } else if (query.created_at_end) {
        where.created_at = LessThanOrEqual(new Date(query.created_at_end));
      }
    }

    const [list, total] = await this.usersRepository.findAndCount({
      where,
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
        "role_id",
        "expire_at",
        "remark",
      ],
      relations: ["role_relation", "agent"],
    });

    const flatList = list.map((user) => {
      const { agent, ...rest } = user as any;
      return {
        ...rest,
        level: agent ? agent.level : undefined,
        discount_rate: agent ? Number(agent.discount_rate) : undefined,
      };
    });

    return { list: flatList as Admin[], total };
  }

  async findOne(username: string): Promise<Admin | undefined> {
    return this.usersRepository.findOne({
      where: { username },
      select: [
        "id",
        "username",
        "password",
        "role",
        "balance",
        "role_id",
        "is_active",
        "parent_id",
      ],
      relations: ["role_relation", "role_relation.permissions"],
    });
  }

  async findById(id: number): Promise<Admin | undefined> {
    return this.usersRepository.findOne({
      where: { id },
      relations: ["role_relation", "role_relation.permissions", "agent"],
    });
  }

  async update(
    id: number,
    updateUserDto: any,
    currentUser?: { userId: number; role_name?: string } | number,
  ): Promise<Admin> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`用户 ID ${id} 不存在`);
    }

    // 兼容老调用方式：直接传 operatorId
    const operatorId =
      typeof currentUser === 'number' ? currentUser : currentUser?.userId;
    const operatorRoleName =
      typeof currentUser === 'object' ? currentUser?.role_name : undefined;

    // 越权检查：调用方不能把目标用户分配为高于自己可分配集合的角色
    const wantsRoleChange =
      updateUserDto.role !== undefined || updateUserDto.role_id !== undefined;
    if (wantsRoleChange) {
      if (!operatorRoleName) {
        // 没有 role_name 上下文一律拒绝改角色（保守处理，避免越权）
        throw new ForbiddenException('缺少调用者角色信息，无法变更角色');
      }
      const allowedRoles = this.getAssignableRoles(operatorRoleName);
      if (
        updateUserDto.role &&
        !allowedRoles.includes(updateUserDto.role as AdminRole)
      ) {
        throw new ForbiddenException('您没有权限将用户分配为该角色');
      }
      if (updateUserDto.role_id) {
        const targetRole = await this.accessControlService.findRoleById(
          updateUserDto.role_id,
        );
        const enumByName: Record<string, AdminRole> = {
          'Super Admin': AdminRole.ADMIN,
          Developer: AdminRole.DEVELOPER,
          Agent: AdminRole.AGENT,
        };
        const mapped = targetRole?.name ? enumByName[targetRole.name] : undefined;
        if (!mapped || !allowedRoles.includes(mapped)) {
          throw new ForbiddenException('您没有权限将用户分配为该角色');
        }
      }
    }

    if (updateUserDto.role_id) {
      const role = await this.accessControlService.findRoleById(
        updateUserDto.role_id,
      );
      user.role_relation = role;
    } else if (updateUserDto.role) {
      // If role enum is updated but role_id is not provided, try to find matching RBAC role
      let roleName = "";
      switch (updateUserDto.role) {
        case AdminRole.ADMIN:
          roleName = "Super Admin";
          break;
        case AdminRole.DEVELOPER:
          roleName = "Developer";
          break;
        case AdminRole.AGENT:
          roleName = "Agent";
          break;
      }
      if (roleName) {
        const role = await this.accessControlService.findRoleByName(roleName);
        if (role) {
          user.role_relation = role;
          user.role_id = role.id; // Ensure foreign key is updated
        }
      }
    }

    // 只有在密码有值时才更新密码
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    } else {
      // 如果密码为空或未提供，删除该字段以避免覆盖原密码
      delete updateUserDto.password;
    }

    const oldBalance = Number(user.balance);
    Object.assign(user, updateUserDto);
    const savedUser = await this.usersRepository.save(user);

    // Check if balance changed
    if (
      updateUserDto.balance !== undefined &&
      Number(updateUserDto.balance) !== oldBalance
    ) {
      const diff = Number(updateUserDto.balance) - oldBalance;
      await this.balanceLogsService.logChange(
        id,
        diff,
        BalanceLogType.ADMIN_ADJUST,
        Number(savedUser.balance),
        operatorId,
        "管理员/系统 调整余额",
      );
    }

    // Update Agent profile if applicable
    if (
      user.role_relation?.name === 'Agent' &&
      (updateUserDto.level !== undefined ||
        updateUserDto.discount_rate !== undefined)
    ) {
      let agent = await this.agentsRepository.findOne({
        where: { user: { id: id } },
      });
      if (!agent) {
        // If agent record missing, create one
        agent = this.agentsRepository.create({
          user: user,
          level: updateUserDto.level || 1,
          discount_rate: updateUserDto.discount_rate || 100,
          can_manage_sub_agents: true,
        });
      } else {
        if (updateUserDto.level !== undefined)
          agent.level = updateUserDto.level;
        if (updateUserDto.discount_rate !== undefined)
          agent.discount_rate = updateUserDto.discount_rate;
      }
      await this.agentsRepository.save(agent);
    }

    return savedUser;
  }

  async remove(id: number): Promise<void> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`用户 ID ${id} 不存在`);
    }

    await this.usersRepository.remove(user);
  }

  async createSubUser(
    creatorId: number,
    createDto: CreateAdminDto,
  ): Promise<Admin> {
    // 哈希密码
    const hashedPassword = await bcrypt.hash(createDto.password, 10);

    // Find default role relation based on enum
    let roleName = "";
    switch (createDto.role) {
      case AdminRole.ADMIN:
        roleName = "Super Admin";
        break;
      case AdminRole.DEVELOPER:
        roleName = "Developer";
        break;
      case AdminRole.AGENT:
        roleName = "Agent";
        break;
    }

    let roleRelation = null;
    if (roleName) {
      roleRelation = await this.accessControlService.findRoleByName(roleName);
    }

    const newUser = this.usersRepository.create({
      ...createDto,
      password: hashedPassword,
      parent_id: creatorId,
      role_relation: roleRelation,
    });

    const savedUser = await this.usersRepository.save(newUser);

    // If role is AGENT, create Agent record (check by role_relation name)
    if (roleRelation?.name === 'Agent') {
      const agent = this.agentsRepository.create({
        user: savedUser,
        level: createDto.level || 1,
        discount_rate: createDto.discount_rate || 100,
        can_manage_sub_agents: true,
      });
      await this.agentsRepository.save(agent);
    }

    return savedUser;
  }

  /**
   * 创建用户（带角色限制）
   * - 管理员可以创建开发者和代理商
   * - 开发者只能创建代理商
   * - 代理商不能创建用户
   */
  async createUserWithRoleRestriction(
    currentUser: any,
    createDto: CreateAdminDto,
  ): Promise<Admin> {
    const currentRoleName = currentUser.role_name;

    // 检查用户名是否已存在
    const existingUser = await this.usersRepository.findOne({
      where: { username: createDto.username },
    });
    if (existingUser) {
      throw new BadRequestException("用户名已存在");
    }

    // 根据当前用户角色确定可以创建的用户类型
    const allowedRoles = this.getAssignableRoles(currentRoleName);
    if (allowedRoles.length === 0) {
      throw new ForbiddenException("您没有创建用户的权限");
    }

    // 确定要创建的角色
    let targetRole: AdminRole;
    if (createDto.role) {
      if (!allowedRoles.includes(createDto.role)) {
        throw new ForbiddenException(
          `您没有权限创建该类型的用户。您可以创建: ${allowedRoles.join(', ')}`
        );
      }
      targetRole = createDto.role;
    } else {
      // 如果没有指定角色，使用默认角色
      targetRole = allowedRoles[0];
    }

    // 调用 createSubUser 创建用户
    return this.createSubUser(currentUser.userId, {
      ...createDto,
      role: targetRole,
    });
  }

  /**
   * 根据调用者角色名返回可分配（创建/编辑）的目标角色集合。
   * - Super Admin：可分配开发者、代理商
   * - Developer：只能分配代理商
   * - 其他（含 Agent）：不可分配任何角色
   */
  private getAssignableRoles(currentRoleName?: string): AdminRole[] {
    if (currentRoleName === 'Super Admin') {
      return [AdminRole.DEVELOPER, AdminRole.AGENT];
    }
    if (currentRoleName === 'Developer') {
      return [AdminRole.AGENT];
    }
    return [];
  }

  async count(): Promise<number> {
    return this.usersRepository.count();
  }

  async countToday(): Promise<number> {
    const today = todayCN();

    return this.usersRepository
      .createQueryBuilder("user")
      .where("user.created_at >= :today", { today })
      .getCount();
  }

  /**
   * 公开注册（开发者或代理商）
   */
  async publicRegister(registerDto: PublicRegisterDto): Promise<Admin> {
    const { username, password, registerType, developerUsername, email } =
      registerDto;

    // 检查用户名是否已存在
    const existingUser = await this.usersRepository.findOne({
      where: { username },
    });
    if (existingUser) {
      throw new BadRequestException("用户名已存在");
    }

    // 哈希密码
    const hashedPassword = await bcrypt.hash(password, 10);

    let parentId: number | null = null;
    let isActive = true;

    // 如果是代理商注册，需要验证开发者存在
    if (registerType === RegisterType.AGENT) {
      if (!developerUsername) {
        throw new BadRequestException("代理商注册必须提供开发者账号");
      }

      const developer = await this.usersRepository.findOne({
        where: { username: developerUsername, role: AdminRole.DEVELOPER },
      });

      if (!developer) {
        throw new BadRequestException("指定的开发者账号不存在");
      }

      parentId = developer.id;
      isActive = false; // 代理商默认禁用
    }

    // 确定角色
    const role =
      registerType === RegisterType.DEVELOPER
        ? AdminRole.DEVELOPER
        : AdminRole.AGENT;

    // 查找对应的 RBAC 角色
    const roleName =
      registerType === RegisterType.DEVELOPER ? "Developer" : "Agent";
    const roleRelation =
      await this.accessControlService.findRoleByName(roleName);

    const newUser = this.usersRepository.create({
      username,
      password: hashedPassword,
      role,
      parent_id: parentId,
      is_active: isActive,
      email,
      role_relation: roleRelation,
    });

    const savedUser = await this.usersRepository.save(newUser);

    if (roleRelation?.name === 'Agent') {
      const agent = this.agentsRepository.create({
        user: savedUser,
        level: 1, // Default level for public registration
        discount_rate: 100, // Default discount for public registration
        can_manage_sub_agents: true,
      });
      await this.agentsRepository.save(agent);
    }

    return savedUser;
  }

  /**
   * 查询开发者（用于代理商注册时选择上级）
   */
  async lookupDeveloper(
    username: string,
  ): Promise<{ id: number; username: string } | null> {
    if (!username) {
      throw new BadRequestException("请输入开发者用户名");
    }

    const developer = await this.usersRepository.findOne({
      where: { username, role: AdminRole.DEVELOPER },
      select: ["id", "username"],
    });

    if (!developer) {
      throw new NotFoundException("开发者不存在");
    }

    return {
      id: developer.id,
      username: developer.username,
    };
  }
  async updateTotpSecret(id: number, secret: string) {
    return this.usersRepository.update(id, { totp_secret: secret });
  }

  async findWithTotpSecret(id: number): Promise<Admin> {
    return this.usersRepository
      .createQueryBuilder("user")
      .addSelect("user.totp_secret")
      .where("user.id = :id", { id })
      .getOne();
  }

  async changePassword(userId: number, password: string): Promise<void> {
    const hashedPassword = await bcrypt.hash(password, 10);
    await this.usersRepository.update(userId, { password: hashedPassword });
  }
}
