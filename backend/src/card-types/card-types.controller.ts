import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request as RequestObj,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth, ApiQuery, ApiParam } from "@nestjs/swagger";
import { CardTypesService } from "./card-types.service";
import { CreateCardTypeDto } from "./dto/create-card-type.dto";
import { UpdateCardTypeDto } from "./dto/update-card-type.dto";
import { QueryCardTypeDto } from "./dto/query-card-type.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { RequirePermissions } from "../access-control/decorators/require-permissions.decorator";

@ApiTags('卡密类型 (Card Types)')
@Controller("card-types")
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class CardTypesController {
  constructor(private readonly cardTypesService: CardTypesService) { }

  @Post()
  @RequirePermissions('card-type:create')
  @ApiOperation({ summary: '创建卡密类型', description: '创建新的卡密类型。需要 card-type:create 权限' })
  @ApiBody({ type: CreateCardTypeDto })
  @ApiResponse({ status: 201, description: '创建成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 403, description: '权限不足' })
  create(@Body() createCardTypeDto: CreateCardTypeDto, @RequestObj() req) {
    return this.cardTypesService.create(createCardTypeDto, req.user);
  }

  @Get()
  @RequirePermissions('card-type:read')
  @ApiOperation({ summary: '获取卡密类型列表', description: '获取所有卡密类型。admin看全部，developer看自己和下级，agent只看自己' })
  @ApiResponse({ status: 200, description: '成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 403, description: '权限不足' })
  findAll(@Query() query: QueryCardTypeDto, @RequestObj() req?) {
    const currentUser = req.user ? {
      id: req.user.userId,
      userId: req.user.userId,
      role: req.user.role,
      permissions: req.user.permissions,
      parent_id: req.user.parent_id,
    } : undefined;

    return this.cardTypesService.findAll(query, currentUser);
  }

  @Get(":id")
  @RequirePermissions('card-type:read')
  @ApiOperation({ summary: '获取卡密类型详情', description: '根据ID获取卡密类型详情' })
  @ApiParam({ name: 'id', description: '卡密类型ID', type: 'number' })
  @ApiResponse({ status: 200, description: '成功' })
  findOne(@Param("id") id: string) {
    return this.cardTypesService.findOne(+id);
  }

  @Patch(":id")
  @RequirePermissions('card-type:update')
  @ApiOperation({ summary: '更新卡密类型', description: '更新卡密类型信息。需要 card-type:update 权限' })
  @ApiParam({ name: 'id', description: '卡密类型ID', type: 'number' })
  @ApiBody({ type: UpdateCardTypeDto })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 403, description: '权限不足' })
  update(
    @Param("id") id: string,
    @Body() updateCardTypeDto: UpdateCardTypeDto,
  ) {
    return this.cardTypesService.update(+id, updateCardTypeDto);
  }

  @Delete(":id")
  @RequirePermissions('card-type:delete')
  @ApiOperation({ summary: '删除卡密类型', description: '删除指定卡密类型。需要 card-type:delete 权限' })
  @ApiParam({ name: 'id', description: '卡密类型ID', type: 'number' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 403, description: '权限不足' })
  remove(@Param("id") id: string) {
    return this.cardTypesService.remove(+id);
  }
}
