import { PartialType } from "@nestjs/mapped-types";
import { CreateCardTypeDto } from "./create-card-type.dto";

export class UpdateCardTypeDto extends PartialType(CreateCardTypeDto) {}
