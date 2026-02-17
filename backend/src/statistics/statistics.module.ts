import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { StatisticsController } from "./statistics.controller";
import { StatisticsService } from "./statistics.service";
import { Admin } from "../users/entities/user.entity";
import { App } from "../apps/entities/app.entity";
import { Card } from "../cards/entities/card.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Admin, App, Card])],
  controllers: [StatisticsController],
  providers: [StatisticsService],
  exports: [StatisticsService],
})
export class StatisticsModule {}
