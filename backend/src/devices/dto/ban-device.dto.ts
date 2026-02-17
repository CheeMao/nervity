import { IsString, IsOptional } from "class-validator";

export class BanDeviceDto {
  @IsOptional()
  @IsString()
  reason?: string;
}
