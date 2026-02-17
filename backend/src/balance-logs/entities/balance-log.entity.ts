import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Admin } from "../../users/entities/user.entity";

export enum BalanceLogType {
  ADMIN_ADJUST = "admin_adjust", // 管理员调整
  CARD_GENERATION = "card_generation", // 生成卡密扣费
}

@Entity("balance_logs")
export class BalanceLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @ManyToOne(() => Admin, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user: Admin;

  @Column({ nullable: true })
  operator_id: number;

  @ManyToOne(() => Admin, { onDelete: "SET NULL" })
  @JoinColumn({ name: "operator_id" })
  operator: Admin;

  @Column("decimal", { precision: 10, scale: 2 })
  amount: number;

  @Column({
    type: "enum",
    enum: BalanceLogType,
    default: BalanceLogType.ADMIN_ADJUST,
  })
  type: BalanceLogType;

  @Column({ type: "text", nullable: true })
  description: string;

  @Column("decimal", { precision: 10, scale: 2 })
  balance_after: number;

  @CreateDateColumn()
  created_at: Date;
}
