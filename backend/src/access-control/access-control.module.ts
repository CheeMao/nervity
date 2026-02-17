import { Module, Global } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AccessControlService } from "./access-control.service";
import { AccessControlController } from "./access-control.controller";
import { BlacklistController } from "./blacklist.controller";
import { Role } from "./entities/role.entity";
import { Permission } from "./entities/permission.entity";
import { Blacklist } from "./entities/blacklist.entity";
import { BlacklistService } from "./blacklist.service";

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Role, Permission, Blacklist])],
  controllers: [AccessControlController, BlacklistController],
  providers: [AccessControlService, BlacklistService],
  exports: [AccessControlService, BlacklistService],
})
export class AccessControlModule {}
