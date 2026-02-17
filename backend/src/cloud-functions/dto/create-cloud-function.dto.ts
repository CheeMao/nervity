import { IsString, IsNotEmpty, IsNumber } from "class-validator";

export class CreateCloudFunctionDto {
  @IsNotEmpty()
  @IsString()
  trigger_name: string; // The function name called by client

  @IsNotEmpty()
  @IsString()
  code: string;

  @IsNotEmpty()
  @IsNumber()
  app_id: number;
}
