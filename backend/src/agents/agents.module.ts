import { CardsModule } from "../cards/cards.module";
import { EndUsersModule } from "../end-users/end-users.module";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Agent } from "./entities/agent.entity";
import { Admin } from "../users/entities/user.entity";
import { Card } from "../cards/entities/card.entity";
import { EndUser } from "../end-users/entities/end-user.entity";
import { AgentsService } from "./agents.service";
import { AgentsController } from "./agents.controller";
import { BalanceLogsModule } from "../balance-logs/balance-logs.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Agent, Admin, Card, EndUser]),
    BalanceLogsModule, CardsModule, EndUsersModule,
  ],
  controllers: [AgentsController],
  providers: [AgentsService],
  exports: [AgentsService],
})
export class AgentsModule {}
