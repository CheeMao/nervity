import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { UsersService } from "../users/users.service";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { generateSecret, generateURI, verify } from "otplib";
import { toDataURL } from "qrcode";

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService, private readonly jwtService: JwtService) {}

  async validateUser(username: string, pass: string): Promise<any> {
    if (typeof username !== "string" || typeof pass !== "string") return null;
    const user = await this.usersService.findOne(username);
    if (!user || !await bcrypt.compare(pass, user.password)) return null;
    if (!user.is_active || (user.expire_at && new Date(user.expire_at).getTime() <= Date.now())) {
      throw new UnauthorizedException("账号未开通或已过期");
    }
    const { password, ...result } = user;
    return result;
  }

  private async verifyCode(secret: string, code: string) {
    let valid = false;
    if (secret && typeof code === "string" && /^\d{6}$/.test(code)) {
      try { valid = (await verify({ secret, token: code, epochTolerance: 30 })).valid; } catch { /* invalid secret/token */ }
    }
    if (!valid) throw new UnauthorizedException("Invalid TOTP code");
  }

  async login(user: any, code?: string) {
    if (user.is_totp_enabled) {
      if (!code) throw new UnauthorizedException("2FA required");
      const fullUser = await this.usersService.findWithTotpSecret(user.id);
      await this.verifyCode(fullUser?.totp_secret, code);
    }
    const permissions = user.role_relation?.permissions?.map((p: any) => p.code) || [];
    const roleName = user.role_relation?.name || null;
    return {
      access_token: this.jwtService.sign({ sub: user.id, type: "admin", ver: user.token_version }),
      role: user.role, role_id: user.role_id, role_name: roleName, permissions,
    };
  }

  async generateTotpSecret(user: any) {
    const current = await this.usersService.findById(user.userId || user.id);
    if (!current) throw new UnauthorizedException();
    if (current.is_totp_enabled) throw new BadRequestException("请先验证并禁用现有 2FA");
    const secret = generateSecret();
    const otpauthUrl = generateURI({ issuer: "NetVerify", label: current.username, secret });
    await this.usersService.updateTotpSecret(current.id, secret);
    return { secret, otpauthUrl, qrCode: await toDataURL(otpauthUrl) };
  }

  async enableTotp(userId: number, code: string) {
    const user = await this.usersService.findWithTotpSecret(userId);
    await this.verifyCode(user?.totp_secret, code);
    await this.usersService.setTotpEnabled(userId, true);
    return { success: true };
  }

  async disableTotp(userId: number, code: string) {
    const user = await this.usersService.findWithTotpSecret(userId);
    await this.verifyCode(user?.totp_secret, code);
    await this.usersService.setTotpEnabled(userId, false);
    return { success: true };
  }
}
