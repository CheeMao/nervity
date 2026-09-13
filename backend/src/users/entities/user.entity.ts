import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToOne,
} from "typeorm";
import { Role } from "../../access-control/entities/role.entity";
// import { Agent } from '../../agents/entities/agent.entity'; // Circular dependency risk, use string name

export enum AdminRole {
  ADMIN = "admin",
  DEVELOPER = "developer",
  AGENT = "agent",
}

@Entity("admins")
export class Admin {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({ unique: true })
  username: string;

  @Column({ select: false }) // Don't return password by default
  password: string;

  @Column({ type: "enum", enum: AdminRole, default: AdminRole.DEVELOPER })
  role: AdminRole;

  @Column({ type: "int", default: 0 })
  agent_level: number; // 0 for regular developer

  @Column({ type: "bigint", nullable: true })
  parent_id: number; // ID of the parent (developer's agent, admin's developer)

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  balance: number; // For agents: balance to buy cards

  @Column({ type: "bigint", default: 0 })
  points: number; // Optional points system

  @Column({ nullable: true })
  email: string;

  @Column({ default: true })
  is_active: boolean;

  @Column({ default: false })
  is_totp_enabled: boolean;

  @Column({ select: false, nullable: true })
  totp_secret: string;

  @Column({ type: "int", default: 0 })
  token_version: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ nullable: true, comment: "RBAC role ID (migration in progress)" })
  role_id: number;

  @ManyToOne(() => Role)
  @JoinColumn({ name: "role_id" })
  role_relation: Role;

  /**
   * Get the role name from role_relation
   * Falls back to static role enum if role_relation is not set
   */
  get roleName(): string | null {
    return this.role_relation?.name ?? null;
  }

  @Column({ type: "timestamp", nullable: true })
  expire_at: Date;

  @Column({ nullable: true })
  remark: string;

  @OneToOne("Agent", "user")
  agent: any; // Use any to avoid circular import or type check issues for now, or import Agent
}
