import { Column, Entity, Index, PrimaryColumn } from "typeorm";

@Entity("client_sessions")
@Index(["user_id", "expires_at"])
export class ClientSession {
  @PrimaryColumn({ type: "varchar", length: 36 }) id: string;
  @Column() user_id: number;
  @Column({ type: "varchar", length: 255 }) hwid: string;
  @Column({ type: "text", nullable: true }) public_key: string | null;
  @Column({ type: "datetime" }) expires_at: Date;
}
