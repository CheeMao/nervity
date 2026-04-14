import { PartialType, OmitType } from "@nestjs/mapped-types";
import { CreateAppDto } from "./create-app.dto";

export class UpdateAppDto extends PartialType(
  OmitType(CreateAppDto, ["app_secret"] as const),
) {}
