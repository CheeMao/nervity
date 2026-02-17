import { IsString, IsEmail, IsOptional, IsEnum, IsNotEmpty, MinLength } from "class-validator";
import { AdminRole } from "../entities/user.entity";

export class CreateAdminDto {
  @IsString()
  @IsNotEmpty({ message: '用户名不能为空' })
  username: string;

  @IsString()
  @IsNotEmpty({ message: '密码不能为空' })
  @MinLength(6, { message: '密码长度至少6位' })
  password: string;

  @IsEnum(AdminRole)
  @IsOptional()
  role?: AdminRole;

  @IsOptional()
  parent_id?: number;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsOptional()
  expire_at?: Date;

  @IsString()
  @IsOptional()
  @IsOptional()
  level?: number;

  @IsOptional()
  discount_rate?: number;
}
