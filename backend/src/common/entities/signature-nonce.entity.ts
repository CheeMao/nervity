import { Column, Entity, Index, PrimaryColumn } from "typeorm";

@Entity("signature_nonces")
export class SignatureNonce {
  @PrimaryColumn() app_id: number;
  @PrimaryColumn({ type: "varchar", length: 64 }) nonce: string;
  @Index()
  @Column({ type: "datetime" }) expires_at: Date;
}
