import {
  IsOptional,
  IsString,
  IsBoolean,
  IsDateString,
  IsNumber,
} from "class-validator";

export class UpdateEndUserDto {
  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsString()
  hwid?: string;

  @IsOptional()
  @IsDateString()
  expire_time?: Date;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @IsOptional()
  @IsNumber()
  app_id?: number;

  @IsOptional()
  @IsNumber()
  card_creator_id?: number; // 卡密创建者ID

  @IsOptional()
  @IsNumber()
  max_devices?: number; // 最大可绑定设备数

  @IsOptional()
  @IsBoolean()
  has_used_trial?: boolean; // 是否已使用过试用
}
