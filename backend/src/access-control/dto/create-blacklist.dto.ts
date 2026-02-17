import { IsString, IsEnum, IsOptional, IsDateString } from "class-validator";
import { BlacklistType } from "../entities/blacklist.entity";

export class CreateBlacklistDto {
  @IsEnum(BlacklistType)
  type: BlacklistType;

  @IsString()
  value: string;

  @IsString()
  @IsOptional()
  reason?: string;

  @IsDateString()
  @IsOptional()
  expired_at?: string;
}

export class QueryBlacklistDto {
  @IsEnum(BlacklistType)
  @IsOptional()
  type?: BlacklistType;

  @IsString()
  @IsOptional()
  value?: string;

  @IsOptional()
  page?: number;

  @IsOptional()
  pageSize?: number;
}
