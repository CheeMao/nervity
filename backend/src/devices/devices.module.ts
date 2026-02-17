import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Device } from "./entities/device.entity";
import { App } from "../apps/entities/app.entity";
import { DevicesService } from "./devices.service";
import { DevicesController } from "./devices.controller";

@Module({
  imports: [TypeOrmModule.forFeature([Device, App])],
  controllers: [DevicesController],
  providers: [DevicesService],
  exports: [DevicesService],
})
export class DevicesModule {}
