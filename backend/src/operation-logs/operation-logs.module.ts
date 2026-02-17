import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { OperationLog } from "./entities/operation-log.entity";
import { OperationLogsService } from "./operation-logs.service";
import { OperationLogsController } from "./operation-logs.controller";

@Module({
  imports: [TypeOrmModule.forFeature([OperationLog])],
  controllers: [OperationLogsController],
  providers: [OperationLogsService],
  exports: [OperationLogsService],
})
export class OperationLogsModule {}
