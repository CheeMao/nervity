import { ManagedResource } from "../auth/decorators/access-scope.decorator";
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam } from "@nestjs/swagger";
import { AppsService } from "./apps.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { Request as RequestObj } from "@nestjs/common";
import { CreateAppDto } from "./dto/create-app.dto";
import { UpdateAppDto } from "./dto/update-app.dto";

@ApiTags('应用管理 (Apps)')
@ManagedResource("app")
@Controller("apps")
export class AppsController {
  constructor(private readonly appsService: AppsService) { }

  @Post()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '创建应用', description: '创建新应用。非管理员只能创建自己的应用' })
  @ApiResponse({ status: 201, description: '创建成功' })
  @ApiResponse({ status: 400, description: '参数校验失败' })
  @ApiResponse({ status: 401, description: '未授权' })
  create(@Body() createAppDto: CreateAppDto, @RequestObj() req) {
    return this.appsService.create(createAppDto, req.user.userId);
  }

  @Get()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '获取应用列表', description: '分页查询应用列表。admin看全部，developer看自己和下级，agent只看自己' })
  @ApiQuery({ name: 'page', description: '页码', required: false, type: 'number' })
  @ApiQuery({ name: 'pageSize', description: '每页数量', required: false, type: 'number' })
  @ApiQuery({ name: 'name', description: '应用名称（模糊搜索）', required: false, type: 'string' })
  @ApiResponse({ status: 200, description: '成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  async findAll(
    @Query("page") page?: string,
    @Query("pageSize") pageSize?: string,
    @Query("name") name?: string,
    @RequestObj() req?,
  ) {
    const pageNum = parseInt(page, 10) || 1;
    const size = parseInt(pageSize, 10) || 10;

    const currentUser = req.user ? {
      id: req.user.userId,
      userId: req.user.userId,
      role: req.user.role,
      permissions: req.user.permissions,
      parent_id: req.user.parent_id,
    } : undefined;

    return this.appsService.findAllPaginated(pageNum, size, name, currentUser);
  }

  @Get(":id")
  @ApiOperation({ summary: '获取应用详情', description: '根据ID获取应用详情' })
  @ApiParam({ name: 'id', description: '应用ID', type: 'number' })
  @ApiResponse({ status: 200, description: '成功' })
  findOne(@Param("id") id: string) {
    return this.appsService.findOne(+id);
  }

  @Put(":id")
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '更新应用', description: '更新应用信息（app_secret 不可修改）' })
  @ApiParam({ name: 'id', description: '应用ID', type: 'number' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 400, description: '参数校验失败' })
  @ApiResponse({ status: 401, description: '未授权' })
  update(@Param("id") id: string, @Body() updateAppDto: UpdateAppDto) {
    return this.appsService.update(+id, updateAppDto);
  }

  @Delete(":id")
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '删除应用', description: '删除指定应用' })
  @ApiParam({ name: 'id', description: '应用ID', type: 'number' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  remove(@Param("id") id: string) {
    return this.appsService.remove(+id);
  }
}
