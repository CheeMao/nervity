import { Module, MiddlewareConsumer, NestModule } from "@nestjs/common";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerModule } from "@nestjs/throttler";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { DatabaseModule } from "./database/database.module";
import { UsersModule } from "./users/users.module";
import { AuthModule } from "./auth/auth.module";
import { AppsModule } from "./apps/apps.module";
import { CardsModule } from "./cards/cards.module";
import { AgentsModule } from "./agents/agents.module";
import { CloudFunctionsModule } from "./cloud-functions/cloud-functions.module";
import { DevicesModule } from "./devices/devices.module";
import { StatisticsModule } from "./statistics/statistics.module";
import { RemoteVariablesModule } from "./remote-variables/remote-variables.module";
import { EndUsersModule } from "./end-users/end-users.module";
import { AccessControlModule } from "./access-control/access-control.module";
import { BalanceLogsModule } from "./balance-logs/balance-logs.module";
import { OperationLogsModule } from "./operation-logs/operation-logs.module";
import { EncryptionModule } from "./common/encryption/encryption.module";
import { LoggingInterceptor } from "./common/interceptors/logging.interceptor";
import { ResponseEncryptionInterceptor } from "./common/interceptors/response-encryption.interceptor";
import { CardTypesModule } from "./card-types/card-types.module";
import { CommonModule } from "./common/common.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // 限流模块：按"名称 + 时间窗口 + 次数"组合。
    // 这里只声明两个策略，默认不绑定全局守卫；
    // 需要限流的 controller/endpoint 自己 @UseGuards(ThrottlerGuard) + @Throttle(...)。
    ThrottlerModule.forRoot([
      {
        name: "redeem",
        ttl: 60_000, // 1 分钟
        limit: 10, // 每个 IP 每分钟最多 10 次卡密兑换尝试
      },
      {
        name: "login",
        ttl: 60_000,
        limit: 30, // 每个 IP 每分钟最多 30 次登录尝试（含管理端和客户端）
      },
      {
        name: "register",
        ttl: 60_000,
        limit: 5, // 每个 IP 每分钟最多 5 次注册，防止批量刷号
      },
    ]),
    CommonModule,
    DatabaseModule,
    UsersModule,
    AuthModule,
    AppsModule,
    CardsModule,
    AgentsModule,
    CloudFunctionsModule,
    DevicesModule,
    StatisticsModule,
    RemoteVariablesModule,
    EndUsersModule,
    AccessControlModule,
    BalanceLogsModule,
    OperationLogsModule,
    EncryptionModule,
    CardTypesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseEncryptionInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // consumer
    //   .apply(SignatureMiddleware)
    //   .forRoutes('apps', 'cards', 'cloud', 'devices', 'users', 'statistics', 'remote-variables');
  }
}
