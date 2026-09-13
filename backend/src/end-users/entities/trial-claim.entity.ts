import { Column, CreateDateColumn, Entity, PrimaryColumn } from "typeorm";

/** Immutable record: changing/deleting a login or device does not grant another trial. */
@Entity("trial_claims")
export class TrialClaim {
  @PrimaryColumn() app_id: number;
  @PrimaryColumn({ type: "varchar", length: 255 }) hwid: string;
  @Column({ nullable: true }) user_id: number;
  @CreateDateColumn() created_at: Date;
}
