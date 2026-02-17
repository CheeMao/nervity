import { Controller, Get, Query, UseGuards, Request } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from "@nestjs/swagger";
import { StatisticsService } from "./statistics.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@ApiTags('统计数据 (Statistics)')
@Controller("statistics")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get("overview")
  @ApiOperation({ summary: '获取统计概览', description: '获取系统统计数据概览' })
  @ApiResponse({ status: 200, description: '成功', schema: {
    type: 'object',
    properties: {
      totalUsers: { type: 'number', description: '总用户数' },
      totalApps: { type: 'number', description: '总应用数' },
      totalCards: { type: 'number', description: '总卡密数' },
      activeDevices: { type: 'number', description: '活跃设备数' },
    },
  }})
  @ApiResponse({ status: 401, description: '未授权' })
  async getOverview(@Request() req) {
    return this.statisticsService.getOverview(req.user);
  }

  @Get("trend")
  @ApiOperation({ summary: '获取趋势数据', description: '获取统计数据趋势' })
  @ApiResponse({ status: 200, description: '成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  async getTrend(@Request() req) {
    return this.statisticsService.getTrend(req.user);
  }

  @Get("user-trend")
  @ApiOperation({ summary: '获取用户趋势', description: '获取用户数量趋势数据' })
  @ApiQuery({ name: 'days', description: '统计天数', required: false, type: 'number', example: 7 })
  @ApiResponse({ status: 200, description: '成功' })
  async getUserTrend(@Query("days") days?: string) {
    const daysNum = days ? parseInt(days, 10) : 7;
    return this.statisticsService.getUserTrend(daysNum);
  }

  @Get("card-stats")
  @ApiOperation({ summary: '获取卡密统计', description: '获取卡密使用统计' })
  @ApiResponse({ status: 200, description: '成功', schema: {
    type: 'object',
    properties: {
      total: { type: 'number', description: '总卡密数' },
      unused: { type: 'number', description: '未使用' },
      used: { type: 'number', description: '已使用' },
      banned: { type: 'number', description: '已封禁' },
    },
  }})
  async getCardStats() {
    return this.statisticsService.getCardStats();
  }
}
