import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BalanceLogsService } from "./balance-logs.service";
import { BalanceLogsController } from "./balance-logs.controller";
import { BalanceLog } from "./entities/balance-log.entity";

@Module({
  imports: [TypeOrmModule.forFeature([BalanceLog])],
  controllers: [BalanceLogsController],
  providers: [BalanceLogsService],
  exports: [BalanceLogsService],
})
export class BalanceLogsModule {}
