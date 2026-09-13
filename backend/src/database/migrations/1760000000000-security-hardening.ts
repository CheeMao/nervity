import { MigrationInterface, QueryRunner } from "typeorm";

/** Additive schema changes required by the security fixes. */
export class SecurityHardening1760000000000 implements MigrationInterface {
  name = "SecurityHardening1760000000000";

  private async safe(queryRunner: QueryRunner, sql: string) {
    try { await queryRunner.query(sql); } catch (error: any) {
      if (!["ER_DUP_FIELDNAME", "ER_DUP_KEYNAME", "ER_CANT_DROP_FIELD_OR_KEY"].includes(error?.code) &&
          !/already exists|check that (column|key)/i.test(String(error?.message))) throw error;
    }
  }

  async up(queryRunner: QueryRunner): Promise<void> {
    await this.safe(queryRunner, "ALTER TABLE admins ADD COLUMN IF NOT EXISTS token_version INT NOT NULL DEFAULT 0");
    await this.safe(queryRunner, "ALTER TABLE app ADD COLUMN IF NOT EXISTS min_supported_version VARCHAR(50) NULL");
    await this.safe(queryRunner, "ALTER TABLE app ADD COLUMN IF NOT EXISTS release_channel VARCHAR(20) NOT NULL DEFAULT 'stable'");
    await this.safe(queryRunner, "ALTER TABLE app ADD COLUMN IF NOT EXISTS heartbeat_timeout_multiplier INT NOT NULL DEFAULT 3");
    await this.safe(queryRunner, "ALTER TABLE app ADD COLUMN IF NOT EXISTS announcement TEXT NULL");
    await this.safe(queryRunner, "ALTER TABLE app ADD COLUMN IF NOT EXISTS agent_visible TINYINT(1) NOT NULL DEFAULT 1");
    await this.safe(queryRunner, "ALTER TABLE app ADD COLUMN IF NOT EXISTS metadata JSON NULL");
    await this.safe(queryRunner, "ALTER TABLE card ADD COLUMN IF NOT EXISTS is_permanent TINYINT(1) NOT NULL DEFAULT 0");
    await this.safe(queryRunner, "ALTER TABLE end_users ADD COLUMN IF NOT EXISTS card_creator_id BIGINT NULL");
    await this.safe(queryRunner, "ALTER TABLE end_users ADD COLUMN IF NOT EXISTS token_version INT NOT NULL DEFAULT 0");
    await this.safe(queryRunner, "ALTER TABLE end_users ADD UNIQUE KEY uq_end_user_app_username (app_id, username)");
    await this.safe(queryRunner, "ALTER TABLE device DROP INDEX IDX_73ae631a638a68b5f35ab8a543");
    await this.safe(queryRunner, "ALTER TABLE device ADD UNIQUE KEY uq_device_app_user_hwid (app_id, end_user_id, hwid)");
    await queryRunner.query(`CREATE TABLE IF NOT EXISTS client_sessions (
      id VARCHAR(36) NOT NULL, user_id INT NOT NULL, hwid VARCHAR(255) NOT NULL,
      public_key TEXT NULL, expires_at DATETIME NOT NULL, PRIMARY KEY (id),
      KEY idx_client_sessions_user_expiry (user_id, expires_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
    await queryRunner.query(`CREATE TABLE IF NOT EXISTS signature_nonces (
      app_id INT NOT NULL, nonce VARCHAR(64) NOT NULL, expires_at DATETIME NOT NULL,
      PRIMARY KEY (app_id, nonce), KEY idx_signature_nonces_expiry (expires_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
    await queryRunner.query(`CREATE TABLE IF NOT EXISTS trial_claims (
      app_id INT NOT NULL, hwid VARCHAR(255) NOT NULL, user_id INT NULL,
      created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
      PRIMARY KEY (app_id, hwid), KEY idx_trial_claims_created (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
    await queryRunner.query(`INSERT IGNORE INTO trial_claims (app_id, hwid, user_id)
      SELECT app_id, hwid, MIN(id) FROM end_users
      WHERE has_used_trial = 1 AND app_id IS NOT NULL AND hwid IS NOT NULL
      GROUP BY app_id, hwid`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("DROP TABLE IF EXISTS trial_claims");
    await queryRunner.query("DROP TABLE IF EXISTS signature_nonces");
    await queryRunner.query("DROP TABLE IF EXISTS client_sessions");
  }
}
