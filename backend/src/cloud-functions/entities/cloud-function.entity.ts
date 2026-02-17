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
export class CloudFunction {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column()
  trigger_name: string; // The function name called by client

  @Column({ type: "text" })
  code: string; // JS code to execute

  @ManyToOne(() => App, { onDelete: 'CASCADE' })
  @JoinColumn({ name: "app_id" })
  app: App;

  @Column()
  app_id: number;

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
