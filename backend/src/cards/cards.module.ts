import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Card } from "./entities/card.entity";
import { Admin } from "../users/entities/user.entity";
import { CardsService } from "./cards.service";
import { CardsController } from "./cards.controller";
import { EndUsersModule } from "../end-users/end-users.module";
import { DevicesModule } from "../devices/devices.module";
import { CardTypesModule } from "../card-types/card-types.module";
import { UsersModule } from "../users/users.module";
import { BalanceLogsModule } from "../balance-logs/balance-logs.module";
import { AppsModule } from "../apps/apps.module";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Card, Admin]),
    EndUsersModule,
    DevicesModule,
    CardTypesModule,
    UsersModule,
    BalanceLogsModule,
    AppsModule,
    AuthModule,
  ],
  controllers: [CardsController],
  providers: [CardsService],
  exports: [CardsService],
})
export class CardsModule {}
