import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth, ApiParam } from "@nestjs/swagger";
import { AccessControlService } from "./access-control.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { RequirePermissions } from "./decorators/require-permissions.decorator";

@ApiTags('访问控制 (Access Control)')
@Controller("access-control")
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class AccessControlController {
  constructor(private readonly accessControlService: AccessControlService) {}

  @Post("roles")
  @RequirePermissions('role:create')
  @ApiOperation({ summary: '创建角色', description: '创建新的角色。需要 role:create 权限' })
  @ApiBody({ schema: {
    type: 'object',
    properties: {
      name: { type: 'string', description: '角色名称' },
      description: { type: 'string', description: '角色描述' },
      permissionIds: { type: 'array', items: { type: 'number' }, description: '权限ID列表' },
    },
    required: ['name'],
  }})
  @ApiResponse({ status: 201, description: '创建成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 403, description: '权限不足' })
  createRole(@Body() createRoleDto: any) {
    return this.accessControlService.createRole(createRoleDto);
  }

  @Get("roles")
  @RequirePermissions('role:read')
  @ApiOperation({ summary: '获取角色列表', description: '获取所有角色。需要 role:read 权限' })
  @ApiResponse({ status: 200, description: '成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 403, description: '权限不足' })
  findAllRoles() {
    return this.accessControlService.findAllRoles();
  }

  @Get("roles/:id")
  @RequirePermissions('role:read')
  @ApiOperation({ summary: '获取角色详情', description: '根据ID获取角色详情' })
  @ApiParam({ name: 'id', description: '角色ID', type: 'number' })
  @ApiResponse({ status: 200, description: '成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 403, description: '权限不足' })
  findOneRole(@Param("id") id: string) {
    return this.accessControlService.findRoleById(+id);
  }

  @Put("roles/:id")
  @RequirePermissions('role:update')
  @ApiOperation({ summary: '更新角色', description: '更新角色信息。需要 role:update 权限' })
  @ApiParam({ name: 'id', description: '角色ID', type: 'number' })
  @ApiBody({ schema: {
    type: 'object',
    properties: {
      name: { type: 'string', description: '角色名称' },
      description: { type: 'string', description: '角色描述' },
      permissionIds: { type: 'array', items: { type: 'number' }, description: '权限ID列表' },
    },
  }})
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 403, description: '权限不足' })
  updateRole(@Param("id") id: string, @Body() updateRoleDto: any) {
    return this.accessControlService.updateRole(+id, updateRoleDto);
  }

  @Delete("roles/:id")
  @RequirePermissions('role:delete')
  @ApiOperation({ summary: '删除角色', description: '删除指定角色。需要 role:delete 权限' })
  @ApiParam({ name: 'id', description: '角色ID', type: 'number' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 403, description: '权限不足' })
  deleteRole(@Param("id") id: string) {
    return this.accessControlService.deleteRole(+id);
  }

  @Get("permissions")
  @RequirePermissions('role:read')
  @ApiOperation({ summary: '获取权限列表', description: '获取所有可用权限。需要 role:read 权限' })
  @ApiResponse({ status: 200, description: '成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 403, description: '权限不足' })
  findAllPermissions() {
    return this.accessControlService.findAllPermissions();
  }
}
