import { OptionalJwtAuthGuard } from "../auth/guards/optional-jwt-auth.guard";
import { Public } from "../auth/decorators/access-scope.decorator";
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
  Request,
  UseGuards,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth, ApiQuery, ApiParam } from "@nestjs/swagger";
import { SignatureGuard } from "../common/guards/signature.guard";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RemoteVariablesService } from "./remote-variables.service";
import { CreateRemoteVariableDto } from "./dto/create-remote-variable.dto";
import { UpdateRemoteVariableDto } from "./dto/update-remote-variable.dto";

@ApiTags('远程变量 (Remote Variables)')
@ManagedResource("variable")
@Controller("remote-variables")
export class RemoteVariablesController {
  constructor(
    private readonly remoteVariablesService: RemoteVariablesService,
  ) { }

  @Get()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '获取远程变量列表（管理端）', description: '分页查询远程变量列表。admin看全部，developer看自己和下级，agent只看自己' })
  @ApiQuery({ name: 'page', description: '页码', required: false, type: 'number' })
  @ApiQuery({ name: 'pageSize', description: '每页数量', required: false, type: 'number' })
  @ApiQuery({ name: 'app_id', description: '应用ID', required: false, type: 'number' })
  @ApiResponse({ status: 200, description: '成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  async findAll(
    @Query("page") page?: string,
    @Query("pageSize") pageSize?: string,
    @Query("app_id") appId?: string,
    @Request() req?,
  ) {
    const pageNum = parseInt(page, 10) || 1;
    const size = parseInt(pageSize, 10) || 10;
    const appIdNum = appId ? parseInt(appId, 10) : undefined;

    const currentUser = req.user ? {
      id: req.user.userId,
      userId: req.user.userId,
      role: req.user.role,
      permissions: req.user.permissions,
      parent_id: req.user.parent_id,
    } : undefined;

    return this.remoteVariablesService.findAllPaginated(
      pageNum,
      size,
      appIdNum,
      currentUser,
    );
  }

  @Post()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '创建远程变量', description: '创建新的远程变量。非管理员只能为自己的应用创建变量' })
  @ApiBody({ type: CreateRemoteVariableDto })
  @ApiResponse({ status: 201, description: '创建成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 403, description: '无权限为该应用创建远程变量' })
  async create(@Body() createDto: CreateRemoteVariableDto, @Request() req) {
    return this.remoteVariablesService.create(createDto, req.user);
  }

  @Get(":id")
  @ApiOperation({ summary: '获取远程变量详情', description: '根据ID获取远程变量详情' })
  @ApiParam({ name: 'id', description: '变量ID', type: 'number' })
  @ApiResponse({ status: 200, description: '成功' })
  async findOne(@Param("id") id: string) {
    return this.remoteVariablesService.findById(parseInt(id, 10));
  }

  @Put(":id")
  @ApiOperation({ summary: '更新远程变量', description: '更新远程变量信息' })
  @ApiParam({ name: 'id', description: '变量ID', type: 'number' })
  @ApiBody({ type: UpdateRemoteVariableDto })
  @ApiResponse({ status: 200, description: '更新成功' })
  async update(
    @Param("id") id: string,
    @Body() updateDto: UpdateRemoteVariableDto,
  ) {
    return this.remoteVariablesService.update(parseInt(id, 10), updateDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: '删除远程变量', description: '删除指定远程变量' })
  @ApiParam({ name: 'id', description: '变量ID', type: 'number' })
  @ApiResponse({ status: 200, description: '删除成功' })
  async remove(@Param("id") id: string) {
    await this.remoteVariablesService.remove(parseInt(id, 10));
    return { success: true, message: "远程变量已删除" };
  }

  @Public()
  @Get("app/:appId")
  @UseGuards(OptionalJwtAuthGuard, SignatureGuard)
  @ApiOperation({ summary: '获取应用变量列表（客户端）', description: '获取指定应用的所有远程变量，需要签名验证' })
  @ApiParam({ name: 'appId', description: '应用ID', type: 'number' })
  @ApiResponse({ status: 200, description: '成功', schema: { type: 'object', properties: { list: { type: 'array', items: { type: 'object' } } } } })
  @ApiResponse({ status: 401, description: '签名验证失败' })
  async findByApp(@Param("appId") appId: string, @Request() req: any) {
    const variables = await this.remoteVariablesService.findByAppId(
      parseInt(appId, 10),
    );
    return { list: variables };
  }

  @Public()
  @Get("app/:appId/object")
  @UseGuards(OptionalJwtAuthGuard, SignatureGuard)
  @ApiOperation({ summary: '获取应用变量对象（客户端）', description: '获取指定应用的所有远程变量，返回key-value对象格式' })
  @ApiParam({ name: 'appId', description: '应用ID', type: 'number' })
  @ApiResponse({ status: 200, description: '成功' })
  @ApiResponse({ status: 401, description: '签名验证失败' })
  async findByAppAsObject(@Param("appId") appId: string, @Request() req: any) {
    return this.remoteVariablesService.getVariablesAsObject(
      parseInt(appId, 10),
    );
  }

  @Public()
  @Get("app/:appId/key/:key")
  @UseGuards(OptionalJwtAuthGuard, SignatureGuard)
  @ApiOperation({ summary: '获取单个变量值（客户端）', description: '获取指定应用的单个远程变量值' })
  @ApiParam({ name: 'appId', description: '应用ID', type: 'number' })
  @ApiParam({ name: 'key', description: '变量名' })
  @ApiResponse({ status: 200, description: '成功', schema: { type: 'object', properties: { exists: { type: 'boolean' }, key: { type: 'string' }, value: { type: 'string' }, description: { type: 'string' } } } })
  @ApiResponse({ status: 401, description: '签名验证失败' })
  async findByKey(
    @Param("appId") appId: string,
    @Param("key") key: string,
    @Request() req: any,
  ) {
    const variable = await this.remoteVariablesService.findByKey(
      parseInt(appId, 10),
      key,
    );

    if (!variable) {
      return { exists: false, value: null };
    }

    return {
      exists: true,
      key: variable.key,
      value: variable.value,
      description: variable.description,
    };
  }
}
