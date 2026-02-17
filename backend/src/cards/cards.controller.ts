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
  Res,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth, ApiQuery, ApiParam } from "@nestjs/swagger";
import { Response } from "express";
import { CardsService } from "./cards.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { OptionalJwtAuthGuard } from "../auth/guards/optional-jwt-auth.guard";
import { Request as RequestObj } from "@nestjs/common";
import { ExcelExportUtil } from "../common/utils/excel-export.util";

@ApiTags('卡密管理 (Cards)')
@Controller("cards")
export class CardsController {
  constructor(private readonly cardsService: CardsService) { }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '获取卡密列表', description: '分页查询卡密列表。admin看全部，developer看自己和下级，agent只看自己' })
  @ApiQuery({ name: 'page', description: '页码', required: false, type: 'number' })
  @ApiQuery({ name: 'pageSize', description: '每页数量', required: false, type: 'number' })
  @ApiQuery({ name: 'status', description: '卡密状态(unused/used/banned)', required: false, type: 'string' })
  @ApiQuery({ name: 'app_id', description: '应用ID', required: false, type: 'number' })
  @ApiQuery({ name: 'code', description: '卡密代码', required: false, type: 'string' })
  @ApiQuery({ name: 'remark', description: '备注', required: false, type: 'string' })
  @ApiQuery({ name: 'used_by', description: '使用者用户名/HWID', required: false, type: 'string' })
  @ApiResponse({ status: 200, description: '成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  async findAll(
    @Query("page") page?: string,
    @Query("pageSize") pageSize?: string,
    @Query("status") status?: string,
    @Query("app_id") appId?: string,
    @Query("code") code?: string,
    @Query("remark") remark?: string,
    @Query("used_by") usedBy?: string,
    @RequestObj() req?,
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

    return this.cardsService.findAllPaginated(
      pageNum,
      size,
      status,
      appIdNum,
      currentUser,
      code,
      remark,
      usedBy,
    );
  }

  @Post("generate")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '生成卡密', description: '批量生成卡密。代理商只能为上级开发者的应用生成卡密' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        app_id: { type: 'number', description: '应用ID' },
        count: { type: 'number', description: '生成数量', default: 1 },
        card_type_id: { type: 'number', description: '卡密类型ID' },
        value: { type: 'number', description: '时长（秒）- 已弃用，请使用card_type_id' },
        remark: { type: 'string', description: '备注' },
        device_limit: { type: 'number', description: '设备数量限制(1-10)' },
        code_length: { type: 'number', description: '卡密长度(8-32)' },
      },
      required: ['app_id'],
    }
  })
  @ApiResponse({ status: 201, description: '生成成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 403, description: '无权为该应用生成卡密' })
  generate(@Body() createCardDto: any, @Request() req) {
    const currentUser = {
      id: req.user.userId,
      userId: req.user.userId,
      role: req.user.role,
      permissions: req.user.permissions,
      parent_id: req.user.parent_id,
    };
    return this.cardsService.generate(createCardDto, currentUser);
  }

  @Post("redeem")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '兑换卡密', description: '用户兑换卡密。必须登录，充值到当前登录用户' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        code: { type: 'string', description: '卡密代码' },
        hwid: { type: 'string', description: '硬件ID（可选）' },
      },
      required: ['code'],
    }
  })
  @ApiResponse({ status: 200, description: '兑换成功' })
  @ApiResponse({ status: 400, description: '卡密无效或已使用' })
  @ApiResponse({ status: 401, description: '未登录' })
  async redeem(@Body() body: { code: string; hwid?: string }, @Request() req) {
    // 必须登录，使用当前登录用户的 userId
    const userId = req.user.userId;
    return this.cardsService.useCard(body.code, userId, body.hwid || null, null);
  }

  @Post("trial")
  @ApiOperation({ summary: '试用激活', description: '申请应用试用。每个设备只能试用一次' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        app_id: { type: 'number', description: '应用ID' },
        hwid: { type: 'string', description: '硬件ID' },
      },
      required: ['app_id', 'hwid'],
    }
  })
  @ApiResponse({ status: 200, description: '试用激活成功' })
  @ApiResponse({ status: 400, description: '试用失败（已使用过试用或应用未启用试用）' })
  async trial(@Body() body: { app_id: number; hwid: string }) {
    return this.cardsService.handleTrialActivation(body.app_id, body.hwid);
  }

  @Put(":id/ban")
  @ApiOperation({ summary: '封禁卡密', description: '封禁指定卡密' })
  @ApiParam({ name: 'id', description: '卡密ID', type: 'number' })
  @ApiResponse({ status: 200, description: '封禁成功' })
  ban(@Param("id") id: string) {
    return this.cardsService.banCard(+id);
  }

  @Put(":id/unban")
  @ApiOperation({ summary: '解封卡密', description: '解封指定卡密' })
  @ApiParam({ name: 'id', description: '卡密ID', type: 'number' })
  @ApiResponse({ status: 200, description: '解封成功' })
  unban(@Param("id") id: string) {
    return this.cardsService.unbanCard(+id);
  }

  @Delete(":id")
  @ApiOperation({ summary: '删除卡密', description: '删除指定卡密' })
  @ApiParam({ name: 'id', description: '卡密ID', type: 'number' })
  @ApiResponse({ status: 200, description: '删除成功' })
  remove(@Param("id") id: string) {
    return this.cardsService.remove(+id);
  }

  @Get("export")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "导出卡密", description: "导出卡密数据为 Excel 文件" })
  async export(
    @Query("status") status: string,
    @Query("app_id") appId: string,
    @RequestObj() req,
    @Res() res: Response,
  ) {
    const appIdNum = appId ? parseInt(appId, 10) : undefined;

    const currentUser = req.user ? {
      id: req.user.userId,
      userId: req.user.userId,
      role: req.user.role,
      permissions: req.user.permissions,
      parent_id: req.user.parent_id,
    } : undefined;

    // 获取所有数据（不分页）
    const { list } = await this.cardsService.findAllPaginated(
      1,
      10000,
      status,
      appIdNum,
      currentUser,
    );

    const exportData = list.map((card) => ({
      "卡密": card.code,
      "类型": card.type,
      "时长(秒)": card.value,
      "状态": card.status,
      "应用ID": card.app_id,
      "应用名称": (card as any).app?.name || "",
      "设备限制": card.device_limit,
      "备注": card.remark || "",
      "创建时间": ExcelExportUtil.formatDate(card.created_at),
      "使用时间": ExcelExportUtil.formatDate(card.used_at),
    }));

    const buffer = ExcelExportUtil.exportToBuffer(exportData, "cards");

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="cards_${Date.now()}.xlsx"`,
    );
    res.send(buffer);
  }
}
