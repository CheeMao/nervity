import { IsString, IsEmail, IsOptional, IsEnum, Length, MinLength, MaxLength } from "class-validator";

export enum RegisterType {
  DEVELOPER = "developer",
  AGENT = "agent",
}

export class PublicRegisterDto {
  @IsString()
  @Length(3, 50)
  username: string;

  @IsString()
  @MinLength(8)
  @MaxLength(72)
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
