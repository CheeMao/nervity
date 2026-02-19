import { Injectable, NotFoundException, ForbiddenException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { RemoteVariable } from "./entities/remote-variable.entity";
import { App } from "../apps/entities/app.entity";
import { CreateRemoteVariableDto } from "./dto/create-remote-variable.dto";
import { UpdateRemoteVariableDto } from "./dto/update-remote-variable.dto";
import { DataPermissionService, CurrentUser } from "../common/services/data-permission.service";

@Injectable()
export class RemoteVariablesService {
  constructor(
    @InjectRepository(RemoteVariable)
    private remoteVariablesRepository: Repository<RemoteVariable>,
    @InjectRepository(App)
    private appsRepository: Repository<App>,
    private dataPermissionService: DataPermissionService,
  ) { }

  /**
   * 分页查询远程变量列表
   */
  async findAllPaginated(
    page: number = 1,
    pageSize: number = 10,
    appId?: number,
    currentUser?: CurrentUser,
  ) {
    const queryBuilder = this.remoteVariablesRepository
      .createQueryBuilder("rv")
      .leftJoinAndSelect("rv.app", "app")
      .leftJoinAndSelect("rv.creator", "creator")
      .orderBy("rv.created_at", "DESC")
      .skip((page - 1) * pageSize)
      .take(pageSize);

    // 使用通用数据权限过滤
    if (currentUser) {
      await this.dataPermissionService.applyFilter(queryBuilder, currentUser, {
        fieldName: "creator_id",
      });
    }

    if (appId) {
      queryBuilder.andWhere("rv.app_id = :appId", { appId });
    }

    const [list, total] = await queryBuilder.getManyAndCount();
    return { list, total, page, pageSize };
  }

  /**
   * 根据ID查询远程变量
   */
  async findById(id: number): Promise<RemoteVariable> {
    const variable = await this.remoteVariablesRepository.findOne({
      where: { id },
      relations: ["app"],
    });
    if (!variable) {
      throw new NotFoundException(`远程变量ID ${id} 不存在`);
    }
    return variable;
  }

  /**
   * 根据应用ID获取所有变量（客户端调用）
   * @param appId 应用ID
   * @param isVip 用户是否为VIP（决定是否返回VIP专属变量）
   */
  async findByAppId(appId: number): Promise<RemoteVariable[]> {
    return this.remoteVariablesRepository.find({
      where: { app_id: appId },
      order: { key: "ASC" },
    });
  }

  async findByKey(appId: number, key: string): Promise<RemoteVariable | null> {
    return this.remoteVariablesRepository.findOne({
      where: { app_id: appId, key },
    });
  }

  async create(dto: CreateRemoteVariableDto, user: any): Promise<RemoteVariable> {
    const userId = user.userId || user.id;
    const variable = this.remoteVariablesRepository.create({
      key: dto.key,
      value: dto.value,
      app_id: dto.app_id,
      description: dto.description,
      creator_id: userId,
    });
    return this.remoteVariablesRepository.save(variable);
  }

  async update(
    id: number,
    dto: UpdateRemoteVariableDto,
  ): Promise<RemoteVariable> {
    const variable = await this.findById(id);

    if (dto.key !== undefined) variable.key = dto.key;
    if (dto.value !== undefined) variable.value = dto.value;
    if (dto.description !== undefined) variable.description = dto.description;

    return this.remoteVariablesRepository.save(variable);
  }

  async remove(id: number): Promise<void> {
    const variable = await this.findById(id);
    await this.remoteVariablesRepository.remove(variable);
  }

  async getVariablesAsObject(appId: number): Promise<Record<string, string>> {
    const variables = await this.findByAppId(appId);
    const result: Record<string, string> = {};
    for (const v of variables) {
      result[v.key] = v.value;
    }
    return result;
  }
}
