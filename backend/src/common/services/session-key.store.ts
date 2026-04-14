import { Injectable, Logger } from "@nestjs/common";

/**
 * 内存会话密钥存储
 *
 * 存储每个终端用户的：
 * 1. 会话 RSA 公钥（用于加密响应）
 * 2. 已吊销的用户 ID（用于强制登出）
 */
@Injectable()
export class SessionKeyStore {
  private readonly logger = new Logger(SessionKeyStore.name);

  // userId -> PEM 格式的 RSA 公钥
  private sessionKeys = new Map<number, string>();

  // 已吊销的用户 ID -> 吊销时间戳
  private revokedUsers = new Map<number, number>();

  // ==================== 会话公钥管理 ====================

  setSessionKey(userId: number, publicKeyPem: string): void {
    this.sessionKeys.set(userId, publicKeyPem);
    this.logger.debug(`已存储用户 ${userId} 的会话公钥`);
  }

  getSessionKey(userId: number): string | null {
    return this.sessionKeys.get(userId) || null;
  }

  deleteSessionKey(userId: number): void {
    this.sessionKeys.delete(userId);
  }

  // ==================== 用户吊销管理 ====================

  revokeUser(userId: number): void {
    this.revokedUsers.set(userId, Date.now());
    this.deleteSessionKey(userId);
    this.logger.log(`已吊销用户 ${userId}`);
  }

  isRevoked(userId: number): boolean {
    return this.revokedUsers.has(userId);
  }

  unrevokeUser(userId: number): void {
    this.revokedUsers.delete(userId);
  }

  /**
   * 清理过期的吊销记录（超过 maxAge 毫秒的）
   * 默认清理 24 小时前的记录
   */
  cleanupRevoked(maxAge: number = 24 * 60 * 60 * 1000): void {
    const cutoff = Date.now() - maxAge;
    for (const [userId, timestamp] of this.revokedUsers) {
      if (timestamp < cutoff) {
        this.revokedUsers.delete(userId);
      }
    }
  }
}
