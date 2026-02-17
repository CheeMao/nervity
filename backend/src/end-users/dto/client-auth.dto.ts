import { IsString, IsNotEmpty, IsOptional, MinLength, MaxLength, Max } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class ClientRegisterDto {
  @ApiProperty({ description: "用户名", example: "user001" })
  @IsString()
  @IsNotEmpty({ message: "用户名不能为空" })
  @MinLength(3, { message: "用户名至少3个字符" })
  @MaxLength(50, { message: "用户名最多50个字符" })
  username: string;

  @ApiProperty({ description: "密码", example: "password123" })
  @IsString()
  @IsNotEmpty({ message: "密码不能为空" })
  @MinLength(6, { message: "密码至少6个字符" })
  password: string;

  @ApiProperty({ description: "应用ID", example: 1 })
  @IsNotEmpty({ message: "应用ID不能为空" })
  app_id: number;

  @ApiPropertyOptional({ description: "硬件ID" })
  @IsOptional()
  @IsString()
  hwid?: string;

  @ApiPropertyOptional({ description: "设备名称", example: "我的电脑" })
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: "设备名称最多100个字符" })
  device_name?: string;
}

export class ClientLoginDto {
  @ApiProperty({ description: "用户名", example: "user001" })
  @IsString()
  @IsNotEmpty({ message: "用户名不能为空" })
  username: string;

  @ApiProperty({ description: "密码", example: "password123" })
  @IsString()
  @IsNotEmpty({ message: "密码不能为空" })
  password: string;

  @ApiProperty({ description: "应用ID", example: 1 })
  @IsNotEmpty({ message: "应用ID不能为空" })
  app_id: number;

  @ApiProperty({ description: "硬件ID（必填，用于设备绑定验证）", example: "device-hwid-001" })
  @IsString()
  @IsNotEmpty({ message: "硬件ID不能为空" })
  hwid: string;

  @ApiPropertyOptional({ description: "设备名称", example: "我的电脑" })
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: "设备名称最多100个字符" })
  device_name?: string;
}

export class ClientHeartbeatDto {
  @ApiProperty({ description: "硬件ID（必填，用于设备绑定验证）", example: "device-hwid-001" })
  @IsString()
  @IsNotEmpty({ message: "硬件ID不能为空" })
  hwid: string;

  @ApiPropertyOptional({ description: "设备名称", example: "我的电脑" })
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: "设备名称最多100个字符" })
  device_name?: string;
}
