import {
  IsOptional,
  IsString,
  IsEnum,
  IsNumber,
  IsBoolean,
  Min,
} from "class-validator";
import { Transform, Type } from "class-transformer";
import { AdminRole } from "../entities/user.entity";

export class QueryUserDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  pageSize?: number = 10;

  @IsOptional()
  @IsString()
  keyword?: string;

  @IsOptional()
  @IsEnum(AdminRole)
  role?: AdminRole;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === "true" || value === true)
  is_active?: boolean;

  @IsOptional()
  @IsString()
  remark?: string;

  @IsOptional()
  @IsString()
  created_at_start?: string;

  @IsOptional()
  @IsString()
  created_at_end?: string;
}
