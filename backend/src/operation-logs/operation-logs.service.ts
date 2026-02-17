import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { OperationLog } from "./entities/operation-log.entity";
import { CreateOperationLogDto } from "./dto/create-operation-log.dto";
import { DataPermissionService, CurrentUser } from "../common/services/data-permission.service";

@Injectable()
export class OperationLogsService {
  constructor(
    @InjectRepository(OperationLog)
    private readonly logRepository: Repository<OperationLog>,
    private readonly dataPermissionService: DataPermissionService,
  ) {}

  async create(createDto: CreateOperationLogDto): Promise<OperationLog> {
    const log = this.logRepository.create(createDto);
    return this.logRepository.save(log);
  }

  async findAll(
    page: number = 1,
    pageSize: number = 10,
    filters?: any,
    currentUser?: CurrentUser,
  ): Promise<{ list: OperationLog[]; total: number }> {
    const queryBuilder = this.logRepository.createQueryBuilder("log");

    // 使用通用数据权限过滤
    if (currentUser) {
      await this.dataPermissionService.applyFilter(queryBuilder, currentUser, {
        fieldName: "admin_id",
      });
    }

    // 其他过滤条件
    if (filters) {
      if (filters.admin_id) {
        queryBuilder.andWhere("log.admin_id = :admin_id", {
          admin_id: filters.admin_id,
        });
      }
      if (filters.method) {
        queryBuilder.andWhere("log.method = :method", {
          method: filters.method,
        });
      }
      if (filters.status_code) {
        queryBuilder.andWhere("log.status_code = :status_code", {
          status_code: filters.status_code,
        });
      }
      if (filters.startTime && filters.endTime) {
        queryBuilder.andWhere(
          "log.created_at BETWEEN :startTime AND :endTime",
          {
            startTime: filters.startTime,
            endTime: filters.endTime,
          },
        );
      }
    }

    queryBuilder
      .orderBy("log.created_at", "DESC")
      .skip((page - 1) * pageSize)
      .take(pageSize);

    const [list, total] = await queryBuilder.getManyAndCount();
    return { list, total };
  }
}
