import { Controller, Get, Query, UseGuards, Request } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from "@nestjs/swagger";
import { OperationLogsService } from "./operation-logs.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { RequirePermissions } from "../access-control/decorators/require-permissions.decorator";

@ApiTags('操作日志 (Operation Logs)')
@Controller("operation-logs")
@UseGuards(RolesGuard)
@ApiBearerAuth('JWT-auth')
export class OperationLogsController {
  constructor(private readonly operationLogsService: OperationLogsService) {}

  @Get()
  @RequirePermissions('log:read')
  @ApiOperation({ summary: '获取操作日志列表', description: '分页查询操作日志。admin看全部，developer看自己和下级，agent只看自己' })
  @ApiQuery({ name: 'page', description: '页码', required: false, type: 'number' })
  @ApiQuery({ name: 'pageSize', description: '每页数量', required: false, type: 'number' })
  @ApiQuery({ name: 'admin_id', description: '管理员ID', required: false, type: 'number' })
  @ApiQuery({ name: 'method', description: 'HTTP方法(GET/POST/PUT/DELETE)', required: false, type: 'string' })
  @ApiQuery({ name: 'status_code', description: 'HTTP状态码', required: false, type: 'number' })
  @ApiQuery({ name: 'startTime', description: '开始时间', required: false, type: 'string' })
  @ApiQuery({ name: 'endTime', description: '结束时间', required: false, type: 'string' })
  @ApiResponse({ status: 200, description: '成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 403, description: '权限不足' })
  async findAll(@Request() req, @Query() query: any) {
    const page = query.page ? parseInt(query.page, 10) : 1;
    const pageSize = query.pageSize ? parseInt(query.pageSize, 10) : 10;

    const filters: any = {};
    if (query.admin_id) filters.admin_id = query.admin_id;
    if (query.method) filters.method = query.method;
    if (query.status_code) filters.status_code = query.status_code;
    if (query.startTime && query.endTime) {
      filters.startTime = query.startTime;
      filters.endTime = query.endTime;
    }

    // 获取当前用户信息用于权限过滤
    const currentUser = {
      id: req.user.userId,
      userId: req.user.userId,
      role: req.user.role,
      permissions: req.user.permissions,
      parent_id: req.user.parent_id,
    };

    return this.operationLogsService.findAll(page, pageSize, filters, currentUser);
  }
}
