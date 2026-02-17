import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { RemoteVariable } from "./entities/remote-variable.entity";
import { App } from "../apps/entities/app.entity";
import { RemoteVariablesService } from "./remote-variables.service";
import { RemoteVariablesController } from "./remote-variables.controller";

@Module({
  imports: [TypeOrmModule.forFeature([RemoteVariable, App])],
  controllers: [RemoteVariablesController],
  providers: [RemoteVariablesService],
  exports: [RemoteVariablesService],
})
export class RemoteVariablesModule {}
