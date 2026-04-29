import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, In } from "typeorm";
import { CardType } from "./entities/card-type.entity";
import { CreateCardTypeDto } from "./dto/create-card-type.dto";
import { UpdateCardTypeDto } from "./dto/update-card-type.dto";
import { QueryCardTypeDto } from "./dto/query-card-type.dto";
import { DataPermissionService, CurrentUser } from "../common/services/data-permission.service";

@Injectable()
export class CardTypesService {
  constructor(
    @InjectRepository(CardType)
    private cardTypesRepository: Repository<CardType>,
    private dataPermissionService: DataPermissionService,
  ) { }

  async create(createCardTypeDto: CreateCardTypeDto, user?: any): Promise<CardType> {
    const userId = user?.userId || user?.id;
    const cardType = this.cardTypesRepository.create({
      ...createCardTypeDto,
      value: createCardTypeDto.is_permanent ? 0 : createCardTypeDto.value,
      creator_id: userId,
    });
    return await this.cardTypesRepository.save(cardType);
  }

  async findAll(query: QueryCardTypeDto, currentUser?: CurrentUser): Promise<{ list: CardType[]; total: number }> {
    const { page = 1, pageSize = 10, name, app_id } = query;
    const skip = (page - 1) * pageSize;

    const queryBuilder = this.cardTypesRepository
      .createQueryBuilder("cardType")
      .leftJoinAndSelect("cardType.app", "app")
      .orderBy("cardType.created_at", "DESC")
      .skip(skip)
      .take(pageSize);

    // 使用通用数据权限过滤（代理商可查看上级开发者的卡类）
    if (currentUser) {
      await this.dataPermissionService.applyFilter(queryBuilder, currentUser, {
        fieldName: "creator_id",
        agentMode: "viewParent",
      });

      // 代理商仅能看到对其开放的应用（agent_visible=true）下的卡类型
      if (currentUser.role === 'agent') {
        queryBuilder.andWhere('app.agent_visible = :agentVisible', { agentVisible: true });
      }
    }

    if (app_id) {
      queryBuilder.andWhere("cardType.app_id = :appId", { appId: app_id });
    }

    if (name) {
      queryBuilder.andWhere("cardType.name LIKE :name", { name: `%${name}%` });
    }

    const [list, total] = await queryBuilder.getManyAndCount();
    return { list, total };
  }

  async findOne(id: number): Promise<CardType> {
    return await this.cardTypesRepository.findOne({
      where: { id },
      relations: ["app"],
    });
  }

  async update(
    id: number,
    updateCardTypeDto: UpdateCardTypeDto,
  ): Promise<CardType> {
    const patch: Partial<CardType> = { ...updateCardTypeDto };
    if (patch.is_permanent === true) {
      patch.value = 0;
    }
    await this.cardTypesRepository.update(id, patch);
    return await this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.cardTypesRepository.delete(id);
  }
}
