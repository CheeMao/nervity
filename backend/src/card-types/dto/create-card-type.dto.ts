import { IsString, IsInt, IsNumber, IsNotEmpty, Min } from "class-validator";

export class CreateCardTypeDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsInt()
  @Min(1)
  value: number; // Duration in seconds

  @IsNumber()
  @Min(0)
  price: number;

  @IsInt()
  @Min(1)
  device_limit: number;

  @IsInt()
  @IsNotEmpty()
  app_id: number;
}
