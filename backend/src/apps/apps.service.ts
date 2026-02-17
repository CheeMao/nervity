import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Like, DataSource, In } from "typeorm";
import { App } from "./entities/app.entity";
import { DataPermissionService, CurrentUser } from "../common/services/data-permission.service";

@Injectable()
export class AppsService {
  constructor(
    @InjectRepository(App)
    private appsRepository: Repository<App>,
    private dataSource: DataSource,
    private dataPermissionService: DataPermissionService,
  ) { }

  create(createAppDto: any, creatorId?: number) {
    return this.appsRepository.save(
      this.appsRepository.create({
        ...createAppDto,
        creator_id: creatorId,
      }),
    );
  }

  findAll() {
    return this.appsRepository.find();
  }

  async findAllPaginated(
    page: number = 1,
    pageSize: number = 10,
    name?: string,
    currentUser?: CurrentUser,
  ) {
    const queryBuilder = this.appsRepository.createQueryBuilder("app");

    if (name) {
      queryBuilder.andWhere("app.name LIKE :name", { name: `%${name}%` });
    }

    // 使用通用数据权限过滤（代理商可查看上级开发者的应用）
    if (currentUser) {
      await this.dataPermissionService.applyFilter(queryBuilder, currentUser, {
        fieldName: "creator_id",
        agentMode: "viewParent",
      });

      // 代理商只能看到 agent_visible = true 的应用
      if (currentUser.role === 'agent') {
        queryBuilder.andWhere("app.agent_visible = :agentVisible", { agentVisible: true });
      }
    }

    queryBuilder
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .orderBy("app.created_at", "DESC");

    const [list, total] = await queryBuilder.getManyAndCount();
    return { list, total, page, pageSize };
  }

  findOne(id: number) {
    return this.appsRepository.findOne({ where: { id } });
  }

  async findBySecret(secret: string) {
    return this.appsRepository.findOne({ where: { app_secret: secret } });
  }

  async update(id: number, updateAppDto: any) {
    console.log("=== Update App Debug ===");
    console.log("ID:", id);
    console.log("DTO:", JSON.stringify(updateAppDto, null, 2));

    try {
      await this.appsRepository.update(id, updateAppDto);
    } catch (error) {
      console.error("=== Update Error ===");
      console.error(error);
      throw error;
    }

    return this.findOne(id);
  }

  async remove(id: number) {
    const app = await this.findOne(id);
    if (app) {
      // 使用事务删除应用及其所有相关数据
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        // 删除远程变量
        await queryRunner.manager
          .createQueryBuilder()
          .delete()
          .from('remote_variable')
          .where('app_id = :id', { id })
          .execute();

        // 删除云函数
        await queryRunner.manager
          .createQueryBuilder()
          .delete()
          .from('cloud_function')
          .where('app_id = :id', { id })
          .execute();

        // 删除设备
        await queryRunner.manager
          .createQueryBuilder()
          .delete()
          .from('device')
          .where('app_id = :id', { id })
          .execute();

        // 删除终端用户
        await queryRunner.manager
          .createQueryBuilder()
          .delete()
          .from('end_users')
          .where('app_id = :id', { id })
          .execute();

        // 删除卡密
        await queryRunner.manager
          .createQueryBuilder()
          .delete()
          .from('card')
          .where('app_id = :id', { id })
          .execute();

        // 最后删除应用
        await queryRunner.manager
          .createQueryBuilder()
          .delete()
          .from('app')
          .where('id = :id', { id })
          .execute();

        await queryRunner.commitTransaction();
      } catch (error) {
        await queryRunner.rollbackTransaction();
        throw error;
      } finally {
        await queryRunner.release();
      }
    }
    return { deleted: true };
  }
}
