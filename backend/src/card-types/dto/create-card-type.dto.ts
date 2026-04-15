import {
  IsString,
  IsInt,
  IsNumber,
  IsNotEmpty,
  IsBoolean,
  IsOptional,
  Min,
  ValidateIf,
} from "class-validator";

export class CreateCardTypeDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsBoolean()
  @IsOptional()
  is_permanent?: boolean;

  @ValidateIf((o) => !o.is_permanent)
  @IsInt()
  @Min(1)
  value: number; // Duration in seconds; ignored when is_permanent = true

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
