import { Roles } from "../auth/decorators/roles.decorator";
import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth, ApiQuery, ApiParam } from "@nestjs/swagger";
import { BlacklistService } from "./blacklist.service";
import {
  CreateBlacklistDto,
  QueryBlacklistDto,
} from "./dto/create-blacklist.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { RequirePermissions } from "./decorators/require-permissions.decorator";

@ApiTags('黑名单 (Blacklist)')
@Roles("admin")
@Controller("access-control/blacklist")
@UseGuards(RolesGuard)
@RequirePermissions('blacklist:read')
@ApiBearerAuth('JWT-auth')
export class BlacklistController {
  constructor(private readonly blacklistService: BlacklistService) {}

  @Post()
  @RequirePermissions('blacklist:create')
  @ApiOperation({ summary: '添加黑名单', description: '将IP或HWID添加到黑名单。需要 blacklist:create 权限' })
  @ApiBody({ type: CreateBlacklistDto })
  @ApiResponse({ status: 201, description: '添加成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 403, description: '权限不足' })
  create(@Body() createDto: CreateBlacklistDto, @Req() req: any) {
    const user = req.user;
    return this.blacklistService.create(createDto, user.userId, user.username);
  }

  @Get()
  @ApiOperation({ summary: '获取黑名单列表', description: '分页查询黑名单列表' })
  @ApiResponse({ status: 200, description: '成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 403, description: '权限不足' })
  findAll(@Query() query: QueryBlacklistDto) {
    return this.blacklistService.findAll(query);
  }

  @Delete(":id")
  @RequirePermissions('blacklist:delete')
  @ApiOperation({ summary: '删除黑名单', description: '从黑名单中移除指定条目' })
  @ApiParam({ name: 'id', description: '黑名单ID', type: 'number' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 403, description: '权限不足' })
  remove(@Param("id") id: string) {
    return this.blacklistService.remove(+id);
  }

  @Get("check")
  @ApiOperation({ summary: '检查黑名单状态', description: '调试端点：检查IP或HWID是否被封禁' })
  @ApiQuery({ name: 'ip', description: 'IP地址', required: false, type: 'string' })
  @ApiQuery({ name: 'hwid', description: '硬件ID', required: false, type: 'string' })
  @ApiResponse({ status: 200, description: '成功', schema: { type: 'object', properties: { blocked: { type: 'boolean' }, reason: { type: 'string' } } } })
  check(@Query("ip") ip: string, @Query("hwid") hwid: string) {
    return this.blacklistService.isBlocked(ip, hwid);
  }
}
