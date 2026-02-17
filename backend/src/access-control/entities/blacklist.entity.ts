import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
} from "typeorm";

export enum BlacklistType {
  IP = "IP",
  HWID = "HWID",
}

@Entity("blacklists")
export class Blacklist {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({ type: "enum", enum: BlacklistType })
  @Index()
  type: BlacklistType;

  @Column()
  @Index()
  value: string; // The IP address or HWID

  @Column({ nullable: true })
  reason: string;

  @Column({ nullable: true })
  expired_at: Date; // Null means permanent

  @Column({ nullable: true })
  operator_id: number;

  @Column({ nullable: true })
  operator_username: string;

  @CreateDateColumn()
  created_at: Date;
}
