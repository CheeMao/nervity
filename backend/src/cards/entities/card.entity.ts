import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { App } from "../../apps/entities/app.entity";
import { Admin } from "../../users/entities/user.entity";
import { EndUser } from "../../end-users/entities/end-user.entity";

export enum CardStatus {
  UNUSED = "unused",
  USED = "used",
  BANNED = "banned",
  EXPIRED = "expired",
}

@Entity()
export class Card {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({ unique: true })
  code: string;

  @Column({ default: "time" })
  type: string;

  @Column({ type: "int", default: 0 })
  value: number; // Duration in seconds; ignored when is_permanent = true

  @Column({ type: "boolean", default: false })
  is_permanent: boolean; // 永久卡

  @Column({ type: "enum", enum: CardStatus, default: CardStatus.UNUSED })
  status: CardStatus;

  @ManyToOne(() => App, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: "app_id" })
  app: App;

  @Column({ nullable: true })
  app_id: number;

  @Column({ nullable: true })
  remark: string;

  @ManyToOne(() => Admin, { nullable: true, onDelete: 'SET NULL' }) // Creator (Agent/Developer)
  @JoinColumn({ name: "creator_id" })
  creator: Admin;

  @Column({ nullable: true })
  creator_id: number;

  @ManyToOne(() => EndUser, { nullable: true }) // EndUser who used it
  @JoinColumn({ name: "used_by" })
  used_by: EndUser;

  @Column({ nullable: true })
  used_by_id: number;

  @Column({ nullable: true })
  used_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @Column({ type: "int", default: 1 })
  device_limit: number; // 可绑定设备数量，默认1台
}
