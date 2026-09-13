import { ClientSession } from "./entities/client-session.entity";
import { SignatureNonce } from "./entities/signature-nonce.entity";
import { Global, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DataPermissionService } from "./services/data-permission.service";
import { SessionKeyStore } from "./services/session-key.store";
import { Admin } from "../users/entities/user.entity";
import { App } from "../apps/entities/app.entity";
import { SignatureGuard } from "./guards/signature.guard";

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Admin, App, ClientSession, SignatureNonce])],
  providers: [DataPermissionService, SessionKeyStore, SignatureGuard],
  exports: [DataPermissionService, SessionKeyStore, SignatureGuard],
})
export class CommonModule {}
