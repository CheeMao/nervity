import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { EndUsersController } from "./end-users.controller";
import { ClientAuthController } from "./client-auth.controller";
import { EndUsersService } from "./end-users.service";
import { EndUser } from "./entities/end-user.entity";
import { App } from "../apps/entities/app.entity";
import { Device } from "../devices/entities/device.entity";
import { Card } from "../cards/entities/card.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([EndUser, App, Device, Card]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>("JWT_SECRET", "secretKey"),
        signOptions: { expiresIn: "7d" },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [EndUsersController, ClientAuthController],
  providers: [EndUsersService],
  exports: [EndUsersService],
})
export class EndUsersModule { }
