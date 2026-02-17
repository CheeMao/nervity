import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
} from "typeorm";

export enum OperationMethod {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  DELETE = "DELETE",
  PATCH = "PATCH",
  OPTIONS = "OPTIONS",
  HEAD = "HEAD",
}

@Entity("operation_logs")
export class OperationLog {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({ nullable: true })
  @Index()
  admin_id: number; // Use ID, not relation, to keep log even if user deleted

  @Column({ nullable: true })
  admin_username: string; // Snapshot username

  @Column({ type: "enum", enum: OperationMethod })
  method: OperationMethod;

  @Column()
  path: string;

  @Column({ type: "text", nullable: true })
  query: string; // JSON string of query params

  @Column({ type: "text", nullable: true })
  body: string; // JSON string of body params (sensitive data masked)

  @Column({ nullable: true })
  ip: string;

  @Column({ nullable: true })
  user_agent: string;

  @Column({ type: "int", default: 200 })
  status_code: number;

  @Column({ type: "int", nullable: true })
  execution_time: number; // in ms

  @Column({ type: "text", nullable: true })
  error_message: string;

  @CreateDateColumn()
  @Index()
  created_at: Date;
}
