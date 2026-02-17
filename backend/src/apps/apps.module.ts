import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { App } from "./entities/app.entity";
import { RemoteVariable } from "../remote-variables/entities/remote-variable.entity";
import { AppsService } from "./apps.service";
import { AppsController } from "./apps.controller";

@Module({
  imports: [TypeOrmModule.forFeature([App, RemoteVariable])],
  controllers: [AppsController],
  providers: [AppsService],
  exports: [AppsService],
})
export class AppsModule {}
