import { IsInt, IsOptional, IsString, Min, Max } from "class-validator";

export class CreateCardDto {
  @IsInt()
  app_id: number;

  @IsInt()
  @IsOptional()
  count?: number;

  @IsInt()
  @IsOptional()
  value?: number; // Deprecated in favor of card_type_id

  @IsInt()
  @IsOptional()
  card_type_id?: number; // New field for pricing

  @IsString()
  @IsOptional()
  remark?: string;

  @IsInt()
  @IsOptional()
  @Min(1)
  @Max(10)
  device_limit?: number;

  @IsInt()
  @IsOptional()
  @Min(8)
  @Max(32)
  code_length?: number;
}
