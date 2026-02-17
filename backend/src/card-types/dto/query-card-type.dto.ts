import { IsOptional, IsString, IsNumber, Min } from "class-validator";
import { Type } from "class-transformer";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class QueryCardTypeDto {
    @ApiPropertyOptional({ description: "页码", default: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    page?: number = 1;

    @ApiPropertyOptional({ description: "每页数量", default: 10 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    pageSize?: number = 10;

    @ApiPropertyOptional({ description: "卡密类型名称" })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiPropertyOptional({ description: "所属应用ID" })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    app_id?: number;
}
