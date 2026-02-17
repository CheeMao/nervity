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

@Entity("end_users")
export class EndUser {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({ nullable: true })
  username: string; // 可选用户名

  @Column({ nullable: true, select: false })
  password: string; // 密码（用于客户端登录）

  @Column({ nullable: true })
  hwid: string; // 兼容旧数据，新激活通过 Device 关联

  @Column({ type: "int", default: 1 })
  max_devices: number; // 最大可绑定设备数

  @Column({ type: "bigint", nullable: true })
  app_id: number;

  @ManyToOne(() => App, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: "app_id" })
  app: App;

  @Column({ type: "bigint", nullable: true })
  card_creator_id: number; // 卡密创建者ID（激活卡密时记录）

  @Column({ type: "datetime", nullable: true })
  expire_time: Date; // 到期时间

  @Column({ default: true })
  is_active: boolean;

  @Column({ nullable: true })
  last_ip: string;

  @Column({ type: "datetime", nullable: true })
  last_login: Date;

  @Column({ default: false })
  has_used_trial: boolean; // 是否已使用过试用

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
