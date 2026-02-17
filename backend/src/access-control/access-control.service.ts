import { Injectable, OnModuleInit } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, In, DataSource } from "typeorm";
import { Role } from "./entities/role.entity";
import { Permission } from "./entities/permission.entity";

@Injectable()
export class AccessControlService implements OnModuleInit {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
    private dataSource: DataSource,
  ) { }

  async onModuleInit() {
    // Seed default permissions and roles on module init
    await this.seedPermissions();
    await this.seedRoles();
    // Migrate existing users' role_id based on their role enum
    await this.migrateUserRoles();
  }

  /**
   * Migrate existing users' role_id based on their static role enum
   * This ensures all users have a valid role_id for the dynamic RBAC system
   */
  async migrateUserRoles() {
    const roleMapping: Record<string, string> = {
      admin: "Super Admin",
      developer: "Developer",
      agent: "Agent",
    };

    for (const [enumRole, roleName] of Object.entries(roleMapping)) {
      const role = await this.roleRepository.findOne({
        where: { name: roleName },
      });

      if (role) {
        // Update users with this enum role but no role_id
        await this.dataSource
          .createQueryBuilder()
          .update("admins")
          .set({ role_id: role.id })
          .where("role = :enumRole AND role_id IS NULL", { enumRole })
          .execute();
      }
    }
  }

  async seedPermissions() {
    const permissions = [
      // 用户管理
      { code: "user:read", description: "查看用户列表", module: "用户管理" },
      { code: "user:create", description: "创建用户", module: "用户管理" },
      { code: "user:update", description: "更新用户", module: "用户管理" },
      { code: "user:delete", description: "删除用户", module: "用户管理" },
      { code: "user:read:all", description: "查看所有用户（包括他人的）", module: "用户管理" },

      // 应用管理
      { code: "app:read", description: "查看应用列表", module: "应用管理" },
      { code: "app:create", description: "创建应用", module: "应用管理" },
      { code: "app:update", description: "更新应用", module: "应用管理" },
      { code: "app:delete", description: "删除应用", module: "应用管理" },
      { code: "app:read:all", description: "查看所有应用（包括他人的）", module: "应用管理" },

      // 卡密管理
      { code: "card:read", description: "查看卡密列表", module: "卡密管理" },
      { code: "card:create", description: "创建卡密", module: "卡密管理" },
      { code: "card:generate", description: "批量生成卡密", module: "卡密管理" },
      { code: "card:update", description: "更新卡密", module: "卡密管理" },
      { code: "card:delete", description: "删除卡密", module: "卡密管理" },
      { code: "card:read:all", description: "查看所有卡密（包括他人的）", module: "卡密管理" },

      // 卡密类型
      { code: "card-type:read", description: "查看卡类型列表", module: "卡密类型" },
      { code: "card-type:create", description: "创建卡类型", module: "卡密类型" },
      { code: "card-type:update", description: "更新卡类型", module: "卡密类型" },
      { code: "card-type:delete", description: "删除卡类型", module: "卡密类型" },

      // 终端用户
      {
        code: "end-user:read",
        description: "查看终端用户",
        module: "终端用户",
      },
      {
        code: "end-user:create",
        description: "创建终端用户",
        module: "终端用户",
      },
      {
        code: "end-user:update",
        description: "更新终端用户",
        module: "终端用户",
      },
      {
        code: "end-user:delete",
        description: "删除终端用户",
        module: "终端用户",
      },

      // 云函数
      { code: "cloud:read", description: "查看云函数", module: "云函数" },
      { code: "cloud:create", description: "创建云函数", module: "云函数" },
      { code: "cloud:update", description: "更新云函数", module: "云函数" },
      { code: "cloud:delete", description: "删除云函数", module: "云函数" },
      { code: "cloud:execute", description: "执行云函数", module: "云函数" },

      // 远程变量
      {
        code: "variable:read",
        description: "查看远程变量",
        module: "远程变量",
      },
      {
        code: "variable:create",
        description: "创建远程变量",
        module: "远程变量",
      },
      {
        code: "variable:update",
        description: "更新远程变量",
        module: "远程变量",
      },
      {
        code: "variable:delete",
        description: "删除远程变量",
        module: "远程变量",
      },

      // 统计分析
      { code: "stats:read", description: "查看统计数据", module: "统计分析" },
      { code: "stats:dashboard", description: "访问仪表盘", module: "统计分析" },
      { code: "stats:read:all", description: "查看所有统计数据", module: "统计分析" },

      // 系统管理
      { code: "role:read", description: "查看角色列表", module: "系统管理" },
      { code: "role:create", description: "创建角色", module: "系统管理" },
      { code: "role:update", description: "更新角色", module: "系统管理" },
      { code: "role:delete", description: "删除角色", module: "系统管理" },

      // 黑名单
      { code: "blacklist:read", description: "查看黑名单列表", module: "黑名单" },
      { code: "blacklist:create", description: "添加黑名单", module: "黑名单" },
      { code: "blacklist:update", description: "更新黑名单", module: "黑名单" },
      { code: "blacklist:delete", description: "删除黑名单", module: "黑名单" },

      // 操作日志
      { code: "log:read", description: "查看操作日志", module: "操作日志" },

      // 系统文档
      { code: "documentation:read", description: "查看系统文档", module: "系统文档" },
    ];

    for (const perm of permissions) {
      const exists = await this.permissionRepository.findOne({
        where: { code: perm.code },
      });
      if (!exists) {
        await this.permissionRepository.save(perm);
      } else {
        // 更新描述和模块名为中文版本
        let needsUpdate = false;
        if (exists.description !== perm.description) {
          exists.description = perm.description;
          needsUpdate = true;
        }
        if (exists.module !== perm.module) {
          exists.module = perm.module;
          needsUpdate = true;
        }
        if (needsUpdate) {
          await this.permissionRepository.save(exists);
        }
      }
    }

    // 清理不再需要的权限（从数据库中删除不在定义列表中的权限）
    const validCodes = permissions.map((p) => p.code);
    const allPermissions = await this.permissionRepository.find();
    for (const perm of allPermissions) {
      if (!validCodes.includes(perm.code)) {
        // 先删除角色与该权限的关联，再删除权限本身
        await this.permissionRepository
          .createQueryBuilder()
          .delete()
          .from("access_control_role_permissions")
          .where("permission_id = :id", { id: perm.id })
          .execute();
        await this.permissionRepository.delete(perm.id);
        console.log(`Deleted unused permission: ${perm.code}`);
      }
    }
  }

  async seedRoles() {
    const allPermissions = await this.permissionRepository.find();

    // 1. Super Admin - 系统管理员，拥有所有权限
    const superAdminRole = await this.roleRepository.findOne({
      where: { name: "Super Admin" },
    });
    if (!superAdminRole) {
      // 只在首次创建时设置权限，后续不覆盖
      await this.roleRepository.save({
        name: "Super Admin",
        description: "系统管理员，拥有所有权限",
        is_system: true,
        permissions: allPermissions,
      });
    }
    // 注意：如果角色已存在，不覆盖权限，保留用户自定义的权限配置

    // 2. Developer - 软件开发者，管理自己的应用和相关资源
    const developerRole = await this.roleRepository.findOne({
      where: { name: "Developer" },
    });
    // Developer permissions: all modules except system management (role:*)
    // But exclude *:read:all permissions (only see own resources)
    const developerPermissionCodes = allPermissions
      .filter((p) =>
        [
          "应用管理",
          "卡密管理",
          "卡密类型",
          "终端用户",
          "云函数",
          "远程变量",
          "统计分析",
          "黑名单",
          "操作日志",
          "用户管理",
          "系统文档",
        ].includes(p.module),
      )
      .filter((p) => !p.code.endsWith(":read:all")) // Exclude all *:read:all permissions
      .map((p) => p.code);

    const developerPermissions = allPermissions.filter((p) =>
      developerPermissionCodes.includes(p.code),
    );

    if (!developerRole) {
      // 只在首次创建时设置权限
      await this.roleRepository.save({
        name: "Developer",
        description: "软件开发者，管理应用、卡密、用户和云函数",
        is_system: true,
        permissions: developerPermissions,
      });
    }

    // 3. Agent - 代理商，仅有销售相关权限
    const agentRole = await this.roleRepository.findOne({
      where: { name: "Agent" },
    });
    const agentPermissionCodes = [
      "end-user:read",
      "card:read",
      "card:generate",
      "card-type:read",
      "stats:dashboard",
    ];
    const agentPermissions = allPermissions.filter((p) =>
      agentPermissionCodes.includes(p.code),
    );
    if (!agentRole) {
      // 只在首次创建时设置权限
      await this.roleRepository.save({
        name: "Agent",
        description: "代理商，卡密销售和用户查看",
        is_system: true,
        permissions: agentPermissions,
      });
    }
  }

  // Role Methods
  async createRole(createRoleDto: any) {
    const permissions = await this.permissionRepository.findBy({
      id: In(createRoleDto.permissionIds),
    });

    const role = this.roleRepository.create({
      name: createRoleDto.name,
      description: createRoleDto.description,
      permissions: permissions,
    });

    return this.roleRepository.save(role);
  }

  async findAllRoles() {
    return this.roleRepository.find({ relations: ["permissions"] });
  }

  async findRoleById(id: number) {
    return this.roleRepository.findOne({
      where: { id },
      relations: ["permissions"],
    });
  }

  async findRoleByName(name: string) {
    return this.roleRepository.findOne({
      where: { name },
      relations: ["permissions"],
    });
  }

  async updateRole(id: number, updateRoleDto: any) {
    const role = await this.findRoleById(id);
    if (!role) {
      throw new Error("Role not found");
    }

    if (updateRoleDto.name) role.name = updateRoleDto.name;
    if (updateRoleDto.description) role.description = updateRoleDto.description;

    if (updateRoleDto.permissionIds) {
      const permissions = await this.permissionRepository.findBy({
        id: In(updateRoleDto.permissionIds),
      });
      role.permissions = permissions;
    }

    return this.roleRepository.save(role);
  }

  async deleteRole(id: number) {
    const role = await this.findRoleById(id);
    if (role?.is_system) {
      throw new Error("Cannot delete system role");
    }
    return this.roleRepository.delete(id);
  }

  // Permission Methods
  async findAllPermissions() {
    return this.permissionRepository.find();
  }

  /**
   * Get role by name (alias for findRoleByName for clarity)
   */
  async getRoleByName(name: string): Promise<Role | null> {
    return this.findRoleByName(name);
  }

  /**
   * Get all permission codes for a role
   */
  async getRolePermissionCodes(roleId: number): Promise<string[]> {
    const role = await this.findRoleById(roleId);
    if (!role) return [];
    return role.permissions.map((p) => p.code);
  }

  /**
   * Check if a role has a specific permission
   */
  async roleHasPermission(roleId: number, permissionCode: string): Promise<boolean> {
    const codes = await this.getRolePermissionCodes(roleId);
    return codes.includes(permissionCode);
  }

  /**
   * Get permissions grouped by module
   */
  async getPermissionsByModule(): Promise<Record<string, Permission[]>> {
    const permissions = await this.permissionRepository.find();
    const grouped: Record<string, Permission[]> = {};

    for (const perm of permissions) {
      if (!grouped[perm.module]) {
        grouped[perm.module] = [];
      }
      grouped[perm.module].push(perm);
    }

    return grouped;
  }
}
