import { IsString, IsOptional } from "class-validator";

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
}
