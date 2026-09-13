import { Injectable, BadRequestException, ForbiddenException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CloudFunction } from "./entities/cloud-function.entity";
import { App } from "../apps/entities/app.entity";
import { getQuickJS, QuickJSContext, QuickJSRuntime } from "quickjs-emscripten";
import { DataPermissionService, CurrentUser } from "../common/services/data-permission.service";

@Injectable()
export class CloudFunctionsService {
  private readonly quickJs = getQuickJS();
  constructor(
    @InjectRepository(CloudFunction)
    private cloudFunctionsRepository: Repository<CloudFunction>,
    @InjectRepository(App)
    private appsRepository: Repository<App>,
    private dataPermissionService: DataPermissionService,
  ) {}

  async create(createCloudFunctionDto: any, user: any) {
    const userId = user.userId || user.id;
    if (!Number.isSafeInteger(Number(createCloudFunctionDto.app_id)) ||
        typeof createCloudFunctionDto.trigger_name !== "string" ||
        !/^[A-Za-z][A-Za-z0-9_.-]{0,63}$/.test(createCloudFunctionDto.trigger_name) ||
        typeof createCloudFunctionDto.code !== "string" ||
        createCloudFunctionDto.code.length > 128 * 1024) {
      throw new BadRequestException("云函数参数无效");
    }
    const app = await this.appsRepository.findOne({ where: { id: Number(createCloudFunctionDto.app_id) } });
    if (!app) throw new BadRequestException("应用不存在");
    await this.dataPermissionService.assertCreator(app.creator_id, user, true);
    return this.cloudFunctionsRepository.save(
      this.cloudFunctionsRepository.create({
        trigger_name: createCloudFunctionDto.trigger_name,
        code: createCloudFunctionDto.code,
        app_id: app.id,
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

    if (func.code.length > 128 * 1024) throw new BadRequestException("云函数代码过大");
    const jsonData = JSON.stringify(data ?? null);
    if (jsonData.length > 256 * 1024) throw new BadRequestException("云函数输入过大");
    const QuickJS = await this.quickJs;
    const runtime: QuickJSRuntime = QuickJS.newRuntime();
    runtime.setMemoryLimit(16 * 1024 * 1024);
    runtime.setMaxStackSize(512 * 1024);
    const deadline = Date.now() + 1000;
    runtime.setInterruptHandler(() => Date.now() > deadline);
    const context: QuickJSContext = runtime.newContext();
    try {
      // QuickJS is a WebAssembly guest with no Node globals, imports, or host bindings.
      const wrappedCode = `
        const input = ${jsonData};
        (function() { ${func.code}\n })()
      `;
      const result = context.evalCode(wrappedCode, "cloud-function.js");
      if ("error" in result) {
        const errorValue = context.dump(result.error);
        result.error.dispose();
        throw new Error(typeof errorValue === "string" ? errorValue : "execution error");
      }
      try { return context.dump(result.value); } finally { result.value.dispose(); }
    } catch (error) {
      return { error: error instanceof Error && /interrupt|timeout/i.test(error.message) ? "Execution timed out" : "Execution failed" };
    } finally {
      context.dispose();
      runtime.dispose();
    }
  }
}
