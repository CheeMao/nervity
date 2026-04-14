import { Global, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DataPermissionService } from "./services/data-permission.service";
import { SessionKeyStore } from "./services/session-key.store";
import { Admin } from "../users/entities/user.entity";

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Admin])],
  providers: [DataPermissionService, SessionKeyStore],
  exports: [DataPermissionService, SessionKeyStore],
})
export class CommonModule {}
