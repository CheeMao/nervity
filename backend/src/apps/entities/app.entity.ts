import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";

@Entity()
export class App {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  app_secret: string;

  @Column({ default: "1.0.0" })
  version: string;

  @Column({ type: "varchar", length: 50, nullable: true })
  min_supported_version: string; // SDK 低于此版本将被拒绝/强制升级，null = 不做版本门槛

  @Column({ type: "varchar", length: 20, default: "stable" })
  release_channel: string; // 发布通道：stable / beta / dev

  @Column({ nullable: true })
  download_url: string;

  @Column({ type: "int", default: 60 })
  heart_interval: number; // 心跳间隔（秒），默认60秒

  @Column({ type: "int", default: 3 })
  heartbeat_timeout_multiplier: number; // 心跳超时倍数，默认3倍（如心跳60秒，超时180秒）

  @Column({ default: false })
  force_update: boolean;

  @Column({ default: true })
  is_active: boolean;

  // 试用功能配置
  @Column({ default: false })
  trial_enabled: boolean;

  @Column({ type: "int", default: 86400 })
  trial_duration: number; // 试用时长（秒），默认1天

  @Column({ type: "int", default: 1 })
  trial_device_limit: number; // 试用期设备数量限制

  // 公告和代理商可见性
  @Column({ type: "text", nullable: true })
  announcement: string; // 软件公告

  @Column({ default: true })
  agent_visible: boolean; // 是否向代理商开放

  @Column({ type: "json", nullable: true })
  metadata: Record<string, any>; // 扩展配置字段，自由存 JSON，避免小改动都要加列

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ nullable: true })
  creator_id: number;

  @ManyToOne("Admin", { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: "creator_id" })
  creator: any;
}
