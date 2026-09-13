import { BadRequestException } from "@nestjs/common";

export function pagination(page = 1, pageSize = 10, maximum = 1000) {
  if (!Number.isSafeInteger(page) || page < 1 || !Number.isSafeInteger(pageSize) || pageSize < 1 || pageSize > maximum) {
    throw new BadRequestException(`分页参数无效，每页最多 ${maximum} 条`);
  }
  return { skip: (page - 1) * pageSize, take: pageSize };
}
