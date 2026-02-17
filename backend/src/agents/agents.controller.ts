import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Request,
  Put,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth, ApiQuery, ApiParam } from "@nestjs/swagger";
import { AgentsService } from "./agents.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@ApiTags('代理商 (Agents)')
@Controller("agents")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class AgentsController {
  constructor(private readonly agentsService: AgentsService) {}

  @Get("dashboard")
  @ApiOperation({ summary: '获取代理商仪表盘', description: '获取代理商的仪表盘统计数据' })
  @ApiResponse({ status: 200, description: '成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  async getDashboard(@Request() req) {
    return this.agentsService.getDashboard(req.user.userId);
  }

  @Get("users")
  @ApiOperation({ summary: '获取下属用户列表', description: '代理商查看自己的下属用户' })
  @ApiQuery({ name: 'page', description: '页码', required: false, type: 'number' })
  @ApiQuery({ name: 'pageSize', description: '每页数量', required: false, type: 'number' })
  @ApiResponse({ status: 200, description: '成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  async getUsers(
    @Request() req,
    @Query("page") page?: string,
    @Query("pageSize") pageSize?: string,
  ) {
    return this.agentsService.getSubUsers(
      req.user.userId,
      parseInt(page || "1", 10),
      parseInt(pageSize || "10", 10),
    );
  }

  @Get("cards")
  @ApiOperation({ summary: '获取卡密列表', description: '代理商查看自己的卡密列表' })
  @ApiQuery({ name: 'page', description: '页码', required: false, type: 'number' })
  @ApiQuery({ name: 'pageSize', description: '每页数量', required: false, type: 'number' })
  @ApiResponse({ status: 200, description: '成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  async getCards(
    @Request() req,
    @Query("page") page?: string,
    @Query("pageSize") pageSize?: string,
  ) {
    return this.agentsService.getCards(
      req.user.userId,
      parseInt(page || "1", 10),
      parseInt(pageSize || "10", 10),
    );
  }

  @Post("cards/generate")
  @ApiOperation({ summary: '生成卡密', description: '代理商生成卡密' })
  @ApiBody({ schema: {
    type: 'object',
    properties: {
      value: { type: 'number', description: '时长（秒）' },
      app_id: { type: 'number', description: '应用ID' },
      count: { type: 'number', description: '生成数量' },
    },
    required: ['value', 'app_id', 'count'],
  }})
  @ApiResponse({ status: 201, description: '生成成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  async generateCards(
    @Request() req,
    @Body() body: { value: number; app_id: number; count: number },
  ) {
    return this.agentsService.generateCards(
      req.user.userId,
      body.value,
      body.app_id,
      body.count,
    );
  }

  @Get("end-users")
  @ApiOperation({ summary: '获取终端用户列表', description: '代理商查看自己的终端用户' })
  @ApiQuery({ name: 'page', description: '页码', required: false, type: 'number' })
  @ApiQuery({ name: 'pageSize', description: '每页数量', required: false, type: 'number' })
  @ApiResponse({ status: 200, description: '成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  async getEndUsers(
    @Request() req,
    @Query("page") page?: string,
    @Query("pageSize") pageSize?: string,
  ) {
    return this.agentsService.getEndUsers(
      req.user.userId,
      parseInt(page || "1", 10),
      parseInt(pageSize || "10", 10),
    );
  }

  @Put("end-users/:id/unbind-hwid")
  @ApiOperation({ summary: '解绑终端用户HWID', description: '代理商解绑终端用户的硬件ID' })
  @ApiBody({ schema: { type: 'object', properties: { id: { type: 'number', description: '终端用户ID' } }, required: ['id'] } })
  @ApiResponse({ status: 200, description: '解绑成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  async unbindEndUserHwid(@Request() req, @Body() body: { id: number }) {
    await this.agentsService.unbindEndUserHwid(req.user.userId, body.id);
    return { message: "HWID 解绑成功" };
  }
}
