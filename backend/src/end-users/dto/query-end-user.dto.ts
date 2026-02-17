import { IsOptional, IsString, IsNumber, IsBoolean } from "class-validator";
import { Type } from "class-transformer";

export class QueryEndUserDto {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  page?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  pageSize?: number;

  @IsOptional()
  @IsString()
  keyword?: string; // 搜索 username 或 hwid

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  app_id?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  agent_id?: number;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  is_active?: boolean;
}
