import { Injectable, ForbiddenException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CloudFunction } from "./entities/cloud-function.entity";
import { App } from "../apps/entities/app.entity";
import { VM } from "vm2";
import { DataPermissionService, CurrentUser } from "../common/services/data-permission.service";

@Injectable()
export class CloudFunctionsService {
  constructor(
    @InjectRepository(CloudFunction)
    private cloudFunctionsRepository: Repository<CloudFunction>,
    @InjectRepository(App)
    private appsRepository: Repository<App>,
    private dataPermissionService: DataPermissionService,
  ) {}

  async create(createCloudFunctionDto: any, user: any) {
    const userId = user.userId || user.id;
    return this.cloudFunctionsRepository.save(
      this.cloudFunctionsRepository.create({
        ...createCloudFunctionDto,
        creator_id: userId,
      }),
    );
  }

  async findAll(
    page: number,
    pageSize: number,
    appId?: number,
    name?: string,
    currentUser?: CurrentUser,
  ) {
    const query = this.cloudFunctionsRepository
      .createQueryBuilder("cf")
      .leftJoinAndSelect("cf.app", "app")
      .leftJoinAndSelect("cf.creator", "creator")
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .orderBy("cf.created_at", "DESC");

    // 使用通用数据权限过滤
    if (currentUser) {
      await this.dataPermissionService.applyFilter(query, currentUser, {
        fieldName: "creator_id",
      });
    }

    if (appId) {
      query.andWhere("cf.app_id = :appId", { appId });
    }

    if (name) {
      query.andWhere("cf.trigger_name LIKE :name", { name: `%${name}%` });
    }

    const [list, total] = await query.getManyAndCount();
    return { list, total };
  }

  async findOne(id: number) {
    return this.cloudFunctionsRepository.findOne({
      where: { id },
      relations: ["app"],
    });
  }

  async update(id: number, updateDto: any) {
    await this.cloudFunctionsRepository.update(id, updateDto);
    return this.findOne(id);
  }

  async remove(id: number) {
    return this.cloudFunctionsRepository.delete(id);
  }

  async run(appId: number, triggerName: string, data: any) {
    const func = await this.cloudFunctionsRepository.findOne({
      where: { app_id: appId, trigger_name: triggerName },
    });
    if (!func) {
      throw new Error("Function not found");
    }

    const vm = new VM({
      timeout: 1000,
      sandbox: { ...data },
    });

    try {
      // Wrap code in IIFE to allow return statements
      const wrappedCode = `(function() { ${func.code} })()`;
      return vm.run(wrappedCode);
    } catch (e) {
      console.error(e);
      return { error: "Execution failed" };
    }
  }
}
