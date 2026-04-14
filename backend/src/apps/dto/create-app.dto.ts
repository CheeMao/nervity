import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsInt,
  IsIn,
  IsObject,
  Min,
  Max,
  MinLength,
  MaxLength,
} from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateAppDto {
  @ApiProperty({ description: "应用名称", example: "MyApp" })
  @IsString()
  @IsNotEmpty({ message: "应用名称不能为空" })
  @MaxLength(100, { message: "应用名称最多100个字符" })
  name: string;

  @ApiProperty({ description: "应用密钥（唯一）", example: "abcdef1234567890" })
  @IsString()
  @IsNotEmpty({ message: "应用密钥不能为空" })
  @MinLength(8, { message: "应用密钥至少8个字符" })
  @MaxLength(128, { message: "应用密钥最多128个字符" })
  app_secret: string;

  @ApiPropertyOptional({ description: "版本号", example: "1.0.0", default: "1.0.0" })
  @IsOptional()
  @IsString()
  @MaxLength(50, { message: "版本号最多50个字符" })
  version?: string;

  @ApiPropertyOptional({
    description: "最低支持版本。SDK 版本低于此值应触发强制升级，留空表示不限",
    example: "1.2.0",
  })
  @IsOptional()
  @IsString()
  @MaxLength(50, { message: "最低版本号最多50个字符" })
  min_supported_version?: string;

  @ApiPropertyOptional({
    description: "发布通道",
    enum: ["stable", "beta", "dev"],
    default: "stable",
  })
  @IsOptional()
  @IsIn(["stable", "beta", "dev"], {
    message: "发布通道只能是 stable / beta / dev",
  })
  release_channel?: string;

  @ApiPropertyOptional({ description: "下载地址" })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: "下载地址最多500个字符" })
  download_url?: string;

  @ApiPropertyOptional({ description: "心跳间隔（秒）", example: 60, default: 60 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: "心跳间隔必须为整数" })
  @Min(5, { message: "心跳间隔不能小于5秒" })
  @Max(3600, { message: "心跳间隔不能大于3600秒" })
  heart_interval?: number;

  @ApiPropertyOptional({ description: "心跳超时倍数", example: 3, default: 3 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: "心跳超时倍数必须为整数" })
  @Min(1, { message: "心跳超时倍数不能小于1" })
  @Max(20, { message: "心跳超时倍数不能大于20" })
  heartbeat_timeout_multiplier?: number;

  @ApiPropertyOptional({ description: "是否强制更新", default: false })
  @IsOptional()
  @IsBoolean()
  force_update?: boolean;

  @ApiPropertyOptional({ description: "是否启用", default: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @ApiPropertyOptional({ description: "是否启用试用", default: false })
  @IsOptional()
  @IsBoolean()
  trial_enabled?: boolean;

  @ApiPropertyOptional({ description: "试用时长（秒）", example: 86400, default: 86400 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: "试用时长必须为整数" })
  @Min(60, { message: "试用时长不能小于60秒" })
  @Max(31536000, { message: "试用时长不能大于1年" })
  trial_duration?: number;

  @ApiPropertyOptional({ description: "试用期设备数量限制", example: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: "试用设备数必须为整数" })
  @Min(1, { message: "试用设备数不能小于1" })
  @Max(100, { message: "试用设备数不能大于100" })
  trial_device_limit?: number;

  @ApiPropertyOptional({ description: "软件公告" })
  @IsOptional()
  @IsString()
  @MaxLength(2000, { message: "公告最多2000个字符" })
  announcement?: string;

  @ApiPropertyOptional({ description: "是否对代理商可见", default: true })
  @IsOptional()
  @IsBoolean()
  agent_visible?: boolean;

  @ApiPropertyOptional({
    description: "扩展配置（自由 JSON 对象）",
    example: { welcomeMessage: "欢迎使用", maintenance: false },
  })
  @IsOptional()
  @IsObject({ message: "扩展配置必须是 JSON 对象" })
  metadata?: Record<string, any>;
}
