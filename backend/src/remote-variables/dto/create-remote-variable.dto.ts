import { IsString, IsNumber, IsOptional, IsNotEmpty } from "class-validator";

export class CreateRemoteVariableDto {
  @IsNotEmpty()
  @IsString()
  key: string;

  @IsNotEmpty()
  @IsString()
  value: string;

  @IsNotEmpty()
  @IsNumber()
  app_id: number;

  @IsOptional()
  @IsString()
  description?: string;
}
