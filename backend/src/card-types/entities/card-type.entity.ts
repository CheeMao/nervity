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

@Entity()
export class CardType {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column()
  name: string; // e.g., "Monthly Card", "Daily Card"

  @Column({ type: "int" })
  value: number; // Duration in seconds

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  price: number; // Base price

  @Column({ type: "int", default: 1 })
  device_limit: number; // Max devices allowed

  @Column()
  app_id: number;

  @ManyToOne(() => App, { onDelete: "CASCADE" })
  @JoinColumn({ name: "app_id" })
  app: App;

  @ManyToOne(() => Admin, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: "creator_id" })
  creator: Admin;

  @Column({ nullable: true })
  creator_id: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
