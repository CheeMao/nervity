import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm";
import { EndUser } from "../../end-users/entities/end-user.entity";
import { App } from "../../apps/entities/app.entity";

export enum DeviceStatus {
  ONLINE = "online",
  OFFLINE = "offline",
  BANNED = "banned",
}

@Entity()
@Index("uq_device_app_user_hwid", ["app_id", "end_user_id", "hwid"], { unique: true })
export class Device {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column()
  hwid: string; // Hardware ID hash (非唯一，允许同一设备被多个用户绑定)

  @Column({ nullable: true })
  cpu_id: string;

  @Column({ nullable: true })
  disk_serial: string;

  @Column({ nullable: true })
  mac_address: string;

  @Column({ nullable: true })
  bios_uuid: string;

  @Column({ nullable: true })
  last_ip: string;

  @Column({ nullable: true })
  device_name: string; // Device alias/name

  @Column({ nullable: true })
  end_user_id: number; // Associated end user ID

  @ManyToOne(() => EndUser, { nullable: true })
  @JoinColumn({ name: "end_user_id" })
  end_user: EndUser;

  @Column({ nullable: true })
  app_id: number; // Associated app ID

  @ManyToOne(() => App, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: "app_id" })
  app: App;

  @Column({ type: "datetime", nullable: true })
  last_heartbeat: Date; // Last heartbeat timestamp

  @Column({ type: "enum", enum: DeviceStatus, default: DeviceStatus.OFFLINE })
  status: DeviceStatus; // online | offline | banned

  @Column({ nullable: true })
  app_version: string; // App version reported by device

  @Column({ default: false })
  is_banned: boolean;

  @Column({ nullable: true })
  ban_reason: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
