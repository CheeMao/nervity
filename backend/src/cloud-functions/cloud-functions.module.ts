import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CloudFunction } from "./entities/cloud-function.entity";
import { App } from "../apps/entities/app.entity";
import { CloudFunctionsService } from "./cloud-functions.service";
import { CloudFunctionsController } from "./cloud-functions.controller";

@Module({
  imports: [TypeOrmModule.forFeature([CloudFunction, App])],
  controllers: [CloudFunctionsController],
  providers: [CloudFunctionsService],
  exports: [CloudFunctionsService],
})
export class CloudFunctionsModule {}
