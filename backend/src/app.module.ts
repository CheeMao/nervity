import { Module, MiddlewareConsumer, NestModule } from "@nestjs/common";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { ConfigModule } from "@nestjs/config";
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
