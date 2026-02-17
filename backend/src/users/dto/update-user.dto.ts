import {
  IsOptional,
  IsString,
  IsEnum,
  IsNumber,
  IsBoolean,
  Min,
} from "class-validator";
import { AdminRole } from "../entities/user.entity";

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsEnum(AdminRole)
  role?: AdminRole;

  @IsOptional()
  @IsNumber()
  @Min(0)
  balance?: number;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  expire_at?: Date;

  @IsOptional()
  @IsString()
  @IsOptional()
  remark?: string;

  @IsOptional()
  level?: number;

  @IsOptional()
  discount_rate?: number;
}
