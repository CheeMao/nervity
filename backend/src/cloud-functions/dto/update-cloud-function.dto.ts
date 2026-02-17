import { IsString, IsNumber, IsOptional } from "class-validator";

export class UpdateCloudFunctionDto {
  @IsOptional()
  @IsString()
  trigger_name?: string;

  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsNumber()
  app_id?: number;
}
