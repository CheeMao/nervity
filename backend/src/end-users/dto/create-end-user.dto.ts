import {
  IsOptional,
  IsString,
  IsNumber,
  IsDateString,
  IsBoolean,
} from "class-validator";

export class CreateEndUserDto {
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
  @IsNumber()
  app_id?: number;

  @IsOptional()
  @IsNumber()
  card_creator_id?: number; // 卡密创建者ID

  @IsOptional()
  @IsDateString()
  expire_time?: Date;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @IsOptional()
  @IsNumber()
  max_devices?: number; // 最大可绑定设备数
}
