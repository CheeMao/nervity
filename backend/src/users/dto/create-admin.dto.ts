import { IsString, IsEmail, IsOptional, IsEnum, IsNotEmpty, MinLength, IsNumber, IsBoolean, ValidateIf } from "class-validator";
import { Transform } from "class-transformer";
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

  @Transform(({ value }) => value === '' ? null : value)
  @IsEmail({}, { message: '邮箱格式不正确' })
  @IsOptional()
  email?: string;

  @IsOptional()
  expire_at?: Date;

  @IsNumber({}, { message: '等级必须是数字' })
  @IsOptional()
  level?: number;

  @IsNumber({}, { message: '折扣率必须是数字' })
  @IsOptional()
  discount_rate?: number;

  @IsNumber({}, { message: '余额必须是数字' })
  @IsOptional()
  balance?: number;

  @IsBoolean({ message: '激活状态必须是布尔值' })
  @IsOptional()
  is_active?: boolean;

  @IsString({ message: '备注必须是字符串' })
  @IsOptional()
  remark?: string;
}
