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

@Entity("remote_variable")
export class RemoteVariable {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column()
  key: string;

  @Column({ type: "text" })
  value: string;

  @Column({ nullable: true })
  description: string;

  @ManyToOne(() => App, { nullable: true, onDelete: 'CASCADE' })
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
