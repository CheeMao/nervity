import { Injectable, OnModuleInit } from "@nestjs/common";
import { nowCN } from "../common/utils/timezone";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, MoreThan, IsNull } from "typeorm";
import { Blacklist, BlacklistType } from "./entities/blacklist.entity";
import {
  CreateBlacklistDto,
  QueryBlacklistDto,
} from "./dto/create-blacklist.dto";

@Injectable()
export class BlacklistService implements OnModuleInit {
  // In-memory cache: "TYPE:VALUE" -> ExpiredAt (null for permanent)
  private blacklistCache = new Map<string, Date | null>();

  constructor(
    @InjectRepository(Blacklist)
    private readonly blacklistRepository: Repository<Blacklist>,
  ) { }

  async onModuleInit() {
    await this.refreshCache();
  }

  async refreshCache() {
    const list = await this.blacklistRepository.find({
      where: [{ expired_at: IsNull() }, { expired_at: MoreThan(nowCN()) }],
    });

    this.blacklistCache.clear();
    for (const item of list) {
      this.blacklistCache.set(`${item.type}:${item.value}`, item.expired_at);
    }
  }

  // Optional: Refresh periodically
  // @Cron(CronExpression.EVERY_MINUTE)
  // async handleCron() {
  //   await this.refreshCache();
  // }

  async create(
    createDto: CreateBlacklistDto,
    operatorId?: number,
    operatorUsername?: string,
  ) {
    const item = this.blacklistRepository.create({
      ...createDto,
      operator_id: operatorId,
      operator_username: operatorUsername,
    });
    const saved = await this.blacklistRepository.save(item);

    // Update cache
    this.blacklistCache.set(`${saved.type}:${saved.value}`, saved.expired_at);

    return saved;
  }

  async remove(id: number) {
    const item = await this.blacklistRepository.findOne({ where: { id } });
    if (item) {
      await this.blacklistRepository.remove(item);
      this.blacklistCache.delete(`${item.type}:${item.value}`);
    }
  }

  async findAll(query: QueryBlacklistDto) {
    const { page = 1, pageSize = 10, type, value } = query;
    const queryBuilder =
      this.blacklistRepository.createQueryBuilder("blacklist");

    if (type) {
      queryBuilder.andWhere("blacklist.type = :type", { type });
    }
    if (value) {
      queryBuilder.andWhere("blacklist.value LIKE :value", {
        value: `%${value}%`,
      });
    }

    queryBuilder
      .orderBy("blacklist.created_at", "DESC")
      .skip((page - 1) * pageSize)
      .take(pageSize);

    const [list, total] = await queryBuilder.getManyAndCount();
    return { list, total };
  }

  async isBlocked(ip: string, hwid?: string): Promise<{ blocked: boolean; reason?: string }> {
    const values = [];
    if (ip) values.push({ type: BlacklistType.IP, value: ip.replace(/^::ffff:/, "") });
    if (hwid) values.push({ type: BlacklistType.HWID, value: hwid });
    if (!values.length) return { blocked: false };
    const where = values.flatMap(value => [{ ...value, expired_at: IsNull() }, { ...value, expired_at: MoreThan(new Date()) }]);
    return { blocked: await this.blacklistRepository.exists({ where }) };
  }
}
