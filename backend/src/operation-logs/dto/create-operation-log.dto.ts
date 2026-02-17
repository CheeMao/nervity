import { IsString, IsOptional, IsEnum, IsNumber } from "class-validator";
import { OperationMethod } from "../entities/operation-log.entity";

export class CreateOperationLogDto {
  @IsNumber()
  @IsOptional()
  admin_id?: number;

  @IsString()
  @IsOptional()
  admin_username?: string;

  @IsEnum(OperationMethod)
  method: OperationMethod;

  @IsString()
  path: string;

  @IsString()
  @IsOptional()
  query?: string;

  @IsString()
  @IsOptional()
  body?: string;

  @IsString()
  @IsOptional()
  ip?: string;

  @IsString()
  @IsOptional()
  user_agent?: string;

  @IsNumber()
  status_code: number;

  @IsNumber()
  @IsOptional()
  execution_time?: number;

  @IsString()
  @IsOptional()
  error_message?: string;
}
