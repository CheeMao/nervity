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
  Request,
  ParseIntPipe,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth, ApiQuery, ApiParam } from "@nestjs/swagger";
import { UsersService } from "./users.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { QueryUserDto } from "./dto/query-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { CreateAdminDto } from "./dto/create-admin.dto";
import { PublicRegisterDto } from "./dto/public-register.dto";
import { RolesGuard } from "../auth/guards/roles.guard";
import { RequirePermissions } from "../access-control/decorators/require-permissions.decorator";
import { AdminRole } from "./entities/user.entity";

@ApiTags('用户管理 (Users)')
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post("register")
  @ApiOperation({ summary: '用户注册（旧接口）', description: '公开用户注册接口，保持向后兼容' })
  @ApiBody({ schema: { type: 'object', properties: { username: { type: 'string' }, password: { type: 'string' }, email: { type: 'string' } } } })
  @ApiResponse({ status: 201, description: '注册成功' })
  async register(@Body() createUserDto: any) {
    return this.usersService.create(createUserDto);
  }

  @Post("public-register")
  @ApiOperation({ summary: '公开注册', description: '开发者或代理商公开注册' })
  @ApiBody({ type: PublicRegisterDto })
  @ApiResponse({ status: 201, description: '注册成功', schema: {
    type: 'object',
    properties: {
      message: { type: 'string', description: '注册结果消息' },
      userId: { type: 'number', description: '用户ID' },
      username: { type: 'string', description: '用户名' },
      isActive: { type: 'boolean', description: '是否已激活' },
    },
  }})
  async publicRegister(@Body() registerDto: PublicRegisterDto) {
    const user = await this.usersService.publicRegister(registerDto);
    return {
      message: user.is_active ? "注册成功" : "注册成功，请等待上级开发者审核",
      userId: user.id,
      username: user.username,
      isActive: user.is_active,
    };
  }

  @Get("developer-lookup")
  @ApiOperation({ summary: '查询开发者', description: '公开查询开发者用户名，用于代理商注册时选择上级' })
  @ApiQuery({ name: 'username', description: '开发者用户名', required: true })
  @ApiResponse({ status: 200, description: '查询成功' })
  async lookupDeveloper(@Query("username") username: string) {
    return this.usersService.lookupDeveloper(username);
  }

  @Get("profile")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '获取当前用户信息', description: '获取当前登录用户的完整信息，包括角色和权限' })
  @ApiResponse({ status: 200, description: '成功', schema: {
    type: 'object',
    properties: {
      userId: { type: 'number' },
      name: { type: 'string' },
      role: { type: 'string', enum: ['admin', 'developer', 'agent'] },
      role_id: { type: 'number' },
      role_name: { type: 'string' },
      permissions: { type: 'array', items: { type: 'string' } },
      email: { type: 'string' },
      balance: { type: 'number' },
      is_active: { type: 'boolean' },
      discount_rate: { type: 'number' },
      level: { type: 'number' },
    },
  }})
  @ApiResponse({ status: 401, description: '未授权' })
  async getProfile(@Request() req) {
    const user = await this.usersService.findById(req.user.userId);
    if (!user) {
      return req.user;
    }
    const permissions = user.role_relation?.permissions?.map((p) => p.code) || [];
    return {
      userId: user.id,
      name: user.username,
      role: user.role,
      role_id: user.role_id,
      role_name: user.role_relation?.name || user.role,
      permissions,
      email: user.email,
      balance: user.balance,
      is_active: user.is_active,
      agent: user.agent ? { level: user.agent.level, discount_rate: user.agent.discount_rate } : undefined,
      discount_rate: user.agent?.discount_rate,
      level: user.agent?.level,
    };
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '获取用户列表', description: '分页查询用户列表。管理员可查看所有用户，非管理员只能查看下属用户' })
  @ApiResponse({ status: 200, description: '成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  async findAll(@Query() query: QueryUserDto, @Request() req) {
    let parentId = undefined;
    // Only users with user:read:all can see all users
    // Others can only see their own subordinates (users where parent_id = their id)
    if (!req.user.permissions?.includes('user:read:all')) {
      parentId = req.user.userId;
    }
    return this.usersService.findAll(query, parentId);
  }

  @Get(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '获取用户详情', description: '根据ID获取单个用户详情' })
  @ApiParam({ name: 'id', description: '用户ID', type: 'number' })
  @ApiResponse({ status: 200, description: '成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  async findOne(@Param("id", ParseIntPipe) id: number) {
    return this.usersService.findById(id);
  }

  @Put(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '更新用户', description: '更新用户信息' })
  @ApiParam({ name: 'id', description: '用户ID', type: 'number' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req,
  ) {
    return this.usersService.update(id, updateUserDto, req.user);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '删除用户', description: '删除指定用户' })
  @ApiParam({ name: 'id', description: '用户ID', type: 'number' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  async remove(@Param("id", ParseIntPipe) id: number) {
    await this.usersService.remove(id);
    return { message: "用户删除成功" };
  }

  @Post("create-developer")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequirePermissions('user:create')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '创建开发者', description: '管理员创建开发者账号。需要 user:create 权限' })
  @ApiBody({ type: CreateAdminDto })
  @ApiResponse({ status: 201, description: '创建成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 403, description: '权限不足' })
  async createDeveloper(
    @Request() req,
    @Body() createAdminDto: CreateAdminDto,
  ) {
    return this.usersService.createSubUser(req.user.userId, {
      ...createAdminDto,
      role: AdminRole.DEVELOPER,
    });
  }

  @Post("create-agent")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequirePermissions('user:create')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '创建代理商', description: '创建代理商账号。需要 user:create 权限' })
  @ApiBody({ type: CreateAdminDto })
  @ApiResponse({ status: 201, description: '创建成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 403, description: '权限不足' })
  async createAgent(@Request() req, @Body() createAdminDto: CreateAdminDto) {
    return this.usersService.createSubUser(req.user.userId, {
      ...createAdminDto,
      role: AdminRole.AGENT,
    });
  }

  @Post("create")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequirePermissions('user:create')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '创建用户', description: '统一创建用户接口。管理员可创建开发者和代理商，开发者只能创建代理商' })
  @ApiBody({ type: CreateAdminDto })
  @ApiResponse({ status: 201, description: '创建成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 403, description: '权限不足或角色限制' })
  async createUser(@Request() req, @Body() createAdminDto: CreateAdminDto) {
    return this.usersService.createUserWithRoleRestriction(req.user, createAdminDto);
  }

  @Post("change-password")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '修改密码', description: '修改当前用户密码' })
  @ApiBody({ schema: { type: 'object', properties: { password: { type: 'string', description: '新密码' } }, required: ['password'] } })
  @ApiResponse({ status: 200, description: '密码修改成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  async changePassword(@Request() req, @Body() body: { password: string }) {
    await this.usersService.changePassword(req.user.userId, body.password);
    return { message: "密码修改成功" };
  }
}
