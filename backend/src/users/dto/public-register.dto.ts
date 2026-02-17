import { IsString, IsEmail, IsOptional, IsEnum } from "class-validator";

export enum RegisterType {
  DEVELOPER = "developer",
  AGENT = "agent",
}

export class PublicRegisterDto {
  @IsString()
  username: string;

  @IsString()
  password: string;

  @IsEnum(RegisterType)
  registerType: RegisterType;

  @IsString()
  @IsOptional()
  developerUsername?: string; // 代理商必填，开发者留空

  @IsEmail()
  @IsOptional()
  email?: string;
}
