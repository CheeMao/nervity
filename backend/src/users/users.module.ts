import { Module } from "@nestjs/common";
import { UsersService } from "./users.service";
import { UsersController } from "./users.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Admin } from "./entities/user.entity";
import { AccessControlModule } from "../access-control/access-control.module";
import { BalanceLogsModule } from "../balance-logs/balance-logs.module";

import { Agent } from "../agents/entities/agent.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([Admin, Agent]),
    AccessControlModule,
    BalanceLogsModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
