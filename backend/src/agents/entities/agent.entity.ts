import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { Admin } from "../../users/entities/user.entity";

@Entity()
export class Agent {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @OneToOne(() => Admin, (admin) => admin.agent, { onDelete: 'CASCADE' })
  @JoinColumn({ name: "user_id" })
  user: Admin;

  @Column({ type: "int", default: 1 })
  level: number; // Agent level (1, 2, 3...)

  @Column({ type: "decimal", precision: 5, scale: 2, default: 100.0 })
  discount_rate: number; // Percentage, e.g., 80.00 for 80% price

  @Column({ default: true })
  can_manage_sub_agents: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
