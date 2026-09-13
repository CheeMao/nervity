import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { EntityManager, LessThan, MoreThan, Repository } from "typeorm";
import { createPublicKey, randomUUID } from "crypto";
import { ClientSession } from "../entities/client-session.entity";

const SESSION_TTL = 7 * 86400 * 1000;

@Injectable()
export class SessionKeyStore {
  constructor(@InjectRepository(ClientSession) private readonly sessions: Repository<ClientSession>) {}

  validatePublicKey(pem?: string): string | null {
    if (!pem) return null;
    try {
      if (typeof pem !== "string" || pem.length > 8192) throw new Error();
      const key = createPublicKey(pem);
      const bits = key.asymmetricKeyDetails?.modulusLength || 0;
      if (key.asymmetricKeyType !== "rsa" || bits < 2048 || bits > 4096) throw new Error();
      return key.export({ type: "spki", format: "pem" }).toString();
    } catch { throw new BadRequestException("会话公钥必须为 2048–4096 位 RSA 公钥"); }
  }

  async createSession(userId: number, hwid: string, publicKey?: string, manager?: EntityManager) {
    const repository = manager ? manager.getRepository(ClientSession) : this.sessions;
    const session = repository.create({ id: randomUUID(), user_id: userId, hwid,
      public_key: this.validatePublicKey(publicKey), expires_at: new Date(Date.now() + SESSION_TTL) });
    // Bound retention to active sessions; all instances use the same persisted keys.
    await repository.delete({ user_id: userId, expires_at: LessThan(new Date()) });
    return repository.save(session);
  }

  async getSession(id: string, userId: number) {
    if (typeof id !== "string" || !/^[a-f\d-]{36}$/i.test(id)) throw new UnauthorizedException("请重新登录");
    const session = await this.sessions.findOne({ where: { id, user_id: userId, expires_at: MoreThan(new Date()) } });
    if (!session) throw new UnauthorizedException("登录已失效，请重新登录");
    return session;
  }

  async touch(id: string, userId: number) {
    const result = await this.sessions.update({ id, user_id: userId, expires_at: MoreThan(new Date()) },
      { expires_at: new Date(Date.now() + SESSION_TTL) });
    if (result.affected !== 1) throw new UnauthorizedException("登录已失效，请重新登录");
  }

  async revokeUser(userId: number, manager?: EntityManager) {
    await (manager ? manager.getRepository(ClientSession) : this.sessions).delete({ user_id: userId });
  }
}
