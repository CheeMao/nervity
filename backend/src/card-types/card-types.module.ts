import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CardTypesService } from "./card-types.service";
import { CardTypesController } from "./card-types.controller";
import { CardType } from "./entities/card-type.entity";

@Module({
  imports: [TypeOrmModule.forFeature([CardType])],
  controllers: [CardTypesController],
  providers: [CardTypesService],
  exports: [CardTypesService],
})
export class CardTypesModule {}
