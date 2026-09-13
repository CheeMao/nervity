import { IsInt, IsOptional, IsString, Min, Max, MaxLength } from "class-validator";

export class GenerateCardDto {
  @IsInt() @Min(1) app_id: number;
  @IsInt() @Min(1) @Max(1000) count: number = 1;
  @IsOptional() @IsInt() @Min(1) card_type_id?: number;
  @IsOptional() @IsInt() @Min(1) @Max(2147483647) value?: number;
  @IsOptional() @IsInt() @Min(1) @Max(10) device_limit?: number;
  @IsOptional() @IsInt() @Min(8) @Max(32) code_length?: number;
  @IsOptional() @IsString() @MaxLength(255) remark?: string;
}
