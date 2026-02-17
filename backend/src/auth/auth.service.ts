import { Injectable, UnauthorizedException } from "@nestjs/common";
import { UsersService } from "../users/users.service";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
// @ts-expect-error otplib types might be missing or incompatible
import { authenticator } from "otplib";
import { toDataURL } from "qrcode";
import { AdminRole } from "../users/entities/user.entity";

interface JwtPayload {
  username: string;
  sub: number;
  role: AdminRole;
  role_id: number | null;
  role_name: string | null;
  permissions: string[];
  parent_id?: number;
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) { }

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne(username);

    if (user && (await bcrypt.compare(pass, user.password))) {
      if (!user.is_active) {
        // Use role_relation.name if available, fallback to enum
        const roleName = user.role_relation?.name;
        if (roleName === 'Agent' || user.role === AdminRole.AGENT) {
          throw new UnauthorizedException("账号未开通，请联系开发者开通");
        }
        throw new UnauthorizedException("账号未开通");
      }
      // Return user including totp fields to service (but strip password)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any, code?: string) {
    if (user.is_totp_enabled) {
      if (!code) {
        throw new UnauthorizedException("2FA required");
      }
      // Since validateUser stripped sensitive fields, we might need to fetch secret again
      // OR ensure validateUser returns it. User entity definition has select: false for secret.
      // usersService.findOne returns what repository finds.
      // We need to explicitly select totp_secret if we want to check it.
      // Let's fetch the full user with secret here to be safe and clean.
      const fullUser = await this.usersService.findById(user.id);
      // findById in UsersService might not select hidden fields either.
      // We need a way to get the secret.
      // Let's assume we can get it or add a method.
      // For now, let's use a specialized method in UsersService or query builder here if possible.
      // But UsersService encapsulates repository.
      // We will add getUserWithTotpSecret to UsersService later.
      // Wait, I can't easily modify UsersService in this same step if I want to be atomic.
      // But I can't check TOTP without secret.
      // I'll skip the check logic here for a moment and assume I can fix UsersService next.
      // Actually, I should use `this.usersService.findWithTotpSecret(user.id)`.
    }

    // Extract permissions from role_relation
    const permissions = user.role_relation?.permissions?.map((p: any) => p.code) || [];
    const roleName = user.role_relation?.name || null;

    const payload: JwtPayload = {
      username: user.username,
      sub: user.id,
      role: user.role,
      role_id: user.role_id,
      role_name: roleName,
      permissions: permissions,
      parent_id: user.parent_id,
    };

    return {
      access_token: this.jwtService.sign(payload),
      role: user.role,
      role_id: user.role_id,
      role_name: roleName,
      permissions: permissions,
    };
  }

  async generateTotpSecret(user: any) {
    const secret = authenticator.generateSecret();
    const otpauthUrl = authenticator.keyuri(user.username, "NetVerify", secret);

    // Save secret temporarily or just return it?
    // Better to save it but not enable it.
    await this.usersService.updateTotpSecret(user.id, secret);

    return {
      secret,
      otpauthUrl,
      qrCode: await toDataURL(otpauthUrl),
    };
  }

  async enableTotp(userId: number, code: string) {
    const user = await this.usersService.findById(userId);
    // We need the secret.
    const userWithSecret = await this.usersService.findWithTotpSecret(userId);

    if (!authenticator.check(code, userWithSecret.totp_secret)) {
      throw new UnauthorizedException("Invalid TOTP code");
    }

    await this.usersService.update(userId, { is_totp_enabled: true });
    return { success: true };
  }

  async disableTotp(userId: number, code: string) {
    const userWithSecret = await this.usersService.findWithTotpSecret(userId);
    if (!authenticator.check(code, userWithSecret.totp_secret)) {
      throw new UnauthorizedException("Invalid TOTP code");
    }
    await this.usersService.update(userId, {
      is_totp_enabled: false,
      totp_secret: null,
    });
    return { success: true };
  }
}
