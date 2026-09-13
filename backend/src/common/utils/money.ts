import { BadRequestException } from "@nestjs/common";

/** Parse decimal currency without binary floating-point multiplication. */
export function toCents(value: string | number): number {
  const text = String(value);
  if (!/^\d+(\.\d{1,2})?$/.test(text)) throw new BadRequestException("金额必须为非负数，最多两位小数");
  const [whole, fraction = ""] = text.split(".");
  const result = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
  if (!Number.isSafeInteger(result)) throw new BadRequestException("金额超出范围");
  return result;
}
