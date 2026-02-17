import { Controller, Get, Query, UseGuards, Request } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from "@nestjs/swagger";
import { BalanceLogsService } from "./balance-logs.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { RequirePermissions } from "../access-control/decorators/require-permissions.decorator";

@ApiTags('余额日志 (Balance Logs)')
@Controller("balance-logs")
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class BalanceLogsController {
  constructor(private readonly balanceLogsService: BalanceLogsService) {}

  @Get()
  @RequirePermissions('log:read')
  @ApiOperation({ summary: '获取余额日志列表', description: '分页查询余额变更日志。admin看全部，developer看自己和下级，agent只看自己' })
  @ApiQuery({ name: 'page', description: '页码', required: false, type: 'number' })
  @ApiQuery({ name: 'pageSize', description: '每页数量', required: false, type: 'number' })
  @ApiQuery({ name: 'userId', description: '用户ID', required: false, type: 'number' })
  @ApiResponse({ status: 200, description: '成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  async findAll(
    @Request() req,
    @Query("page") page?: string,
    @Query("pageSize") pageSize?: string,
    @Query("userId") userId?: string,
  ) {
    const targetUserId = userId ? parseInt(userId, 10) : undefined;

    // 获取当前用户信息用于权限过滤
    const currentUser = {
      id: req.user.userId,
      userId: req.user.userId,
      role: req.user.role,
      permissions: req.user.permissions,
      parent_id: req.user.parent_id,
    };

    return this.balanceLogsService.findAll(
      parseInt(page || "1", 10),
      parseInt(pageSize || "10", 10),
      targetUserId,
      currentUser,
    );
  }

  @Get("statistics")
  @RequirePermissions('log:read')
  @ApiOperation({ summary: '获取余额统计数据', description: '获取余额变动统计信息' })
  @ApiResponse({ status: 200, description: '成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  async getStatistics(@Request() req) {
    return this.balanceLogsService.getStatistics(req.user.userId);
  }
}
