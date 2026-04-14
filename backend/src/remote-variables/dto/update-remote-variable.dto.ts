import { IsString, IsNumber, IsOptional } from "class-validator";

export class UpdateRemoteVariableDto {
  @IsOptional()
  @IsString()
  key?: string;

  @IsOptional()
  @IsString()
  value?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  app_id?: number;
}
