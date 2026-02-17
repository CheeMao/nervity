import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth, ApiQuery, ApiParam } from "@nestjs/swagger";
import { CloudFunctionsService } from "./cloud-functions.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@ApiTags('云函数 (Cloud Functions)')
@Controller("cloud")
export class CloudFunctionsController {
  constructor(private readonly cloudFunctionsService: CloudFunctionsService) {}

  @Post("run/:appId/:triggerName")
  @ApiOperation({ summary: '执行云函数', description: '执行指定应用的云函数' })
  @ApiParam({ name: 'appId', description: '应用ID', type: 'number' })
  @ApiParam({ name: 'triggerName', description: '触发器名称' })
  @ApiBody({ schema: { type: 'object', properties: { data: { type: 'object', description: '传递给云函数的数据' } } } })
  @ApiResponse({ status: 200, description: '执行成功' })
  @ApiResponse({ status: 400, description: '云函数不存在或执行错误' })
  async execute(
    @Param("appId") appId: string,
    @Param("triggerName") triggerName: string,
    @Body() body: any,
  ) {
    return this.cloudFunctionsService.run(+appId, triggerName, body.data);
  }

  @Post("create")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '创建云函数', description: '创建新的云函数。非管理员只能为自己的应用创建云函数' })
  @ApiBody({ schema: {
    type: 'object',
    properties: {
      trigger_name: { type: 'string', description: '触发器名称' },
      code: { type: 'string', description: 'JavaScript代码' },
      app_id: { type: 'number', description: '所属应用ID' },
    },
    required: ['trigger_name', 'code', 'app_id'],
  }})
  @ApiResponse({ status: 201, description: '创建成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 403, description: '无权限为该应用创建云函数' })
  create(@Body() dto: any, @Request() req) {
    return this.cloudFunctionsService.create(dto, req.user);
  }

  @Get("list")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '获取云函数列表', description: '分页查询云函数列表。admin看全部，developer看自己和下级，agent只看自己' })
  @ApiQuery({ name: 'page', description: '页码', required: false, type: 'number' })
  @ApiQuery({ name: 'pageSize', description: '每页数量', required: false, type: 'number' })
  @ApiQuery({ name: 'app_id', description: '应用ID', required: false, type: 'number' })
  @ApiQuery({ name: 'name', description: '函数名称（模糊搜索）', required: false, type: 'string' })
  @ApiResponse({ status: 200, description: '成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  async findAll(
    @Query("page") page?: string,
    @Query("pageSize") pageSize?: string,
    @Query("app_id") appId?: string,
    @Query("name") name?: string,
    @Request() req?,
  ) {
    const currentUser = req.user ? {
      id: req.user.userId,
      userId: req.user.userId,
      role: req.user.role,
      permissions: req.user.permissions,
      parent_id: req.user.parent_id,
    } : undefined;

    return this.cloudFunctionsService.findAll(
      parseInt(page || "1", 10),
      parseInt(pageSize || "10", 10),
      appId ? parseInt(appId, 10) : undefined,
      name,
      currentUser,
    );
  }

  @Get(":id")
  @ApiOperation({ summary: '获取云函数详情', description: '根据ID获取云函数详情' })
  @ApiParam({ name: 'id', description: '云函数ID', type: 'number' })
  @ApiResponse({ status: 200, description: '成功' })
  findOne(@Param("id") id: string) {
    return this.cloudFunctionsService.findOne(+id);
  }

  @Put(":id")
  @ApiOperation({ summary: '更新云函数', description: '更新云函数信息' })
  @ApiParam({ name: 'id', description: '云函数ID', type: 'number' })
  @ApiBody({ schema: {
    type: 'object',
    properties: {
      trigger_name: { type: 'string', description: '触发器名称' },
      code: { type: 'string', description: 'JavaScript代码' },
      app_id: { type: 'number', description: '所属应用ID' },
    },
  }})
  @ApiResponse({ status: 200, description: '更新成功' })
  update(@Param("id") id: string, @Body() updateDto: any) {
    return this.cloudFunctionsService.update(+id, updateDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: '删除云函数', description: '删除指定云函数' })
  @ApiParam({ name: 'id', description: '云函数ID', type: 'number' })
  @ApiResponse({ status: 200, description: '删除成功' })
  remove(@Param("id") id: string) {
    return this.cloudFunctionsService.remove(+id);
  }
}
