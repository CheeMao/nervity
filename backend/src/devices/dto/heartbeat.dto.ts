import { IsString, IsNumber, IsOptional, IsObject } from "class-validator";

export class HeartbeatDto {
  @IsString()
  hwid: string;

  @IsNumber()
  app_id: number;

  @IsOptional()
  @IsString()
  app_version?: string;

  @IsOptional()
  @IsObject()
  extra_info?: Record<string, any>;
}

export class HeartbeatResponseDto {
  success: boolean;
  interval: number;
  server_time: number;
  commands: string[];
  message?: string;
}
