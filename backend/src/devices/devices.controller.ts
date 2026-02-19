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
  Ip,
  UseGuards,
  Res,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth, ApiQuery, ApiParam } from "@nestjs/swagger";
import { Response } from "express";
import { SignatureGuard } from "../common/guards/signature.guard";
import { DevicesService, DeviceFilters } from "./devices.service";
import { DeviceStatus } from "./entities/device.entity";
import { HeartbeatDto } from "./dto/heartbeat.dto";
import { BanDeviceDto } from "./dto/ban-device.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { ExcelExportUtil } from "../common/utils/excel-export.util";

@ApiTags('设备管理 (Devices)')
@Controller("devices")
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) { }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '获取设备列表', description: '分页查询设备列表。admin看全部，developer看自己和下级，agent只看自己' })
  @ApiQuery({ name: 'page', description: '页码', required: false, type: 'number' })
  @ApiQuery({ name: 'pageSize', description: '每页数量', required: false, type: 'number' })
  @ApiQuery({ name: 'status', description: '设备状态(online/offline)', required: false, enum: ['online', 'offline'] })
  @ApiQuery({ name: 'is_banned', description: '是否被封禁', required: false, type: 'boolean' })
  @ApiQuery({ name: 'user_id', description: '用户ID', required: false, type: 'number' })
  @ApiQuery({ name: 'app_id', description: '应用ID', required: false, type: 'number' })
  @ApiQuery({ name: 'keyword', description: '搜索关键词', required: false, type: 'string' })
  @ApiResponse({ status: 200, description: '成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  async findAll(
    @Query("page") page?: string,
    @Query("pageSize") pageSize?: string,
    @Query("status") status?: DeviceStatus,
    @Query("is_banned") isBanned?: string,
    @Query("user_id") userId?: string,
    @Query("app_id") appId?: string,
    @Query("keyword") keyword?: string,
    @Request() req?,
  ) {
    const pageNum = parseInt(page, 10) || 1;
    const size = parseInt(pageSize, 10) || 10;

    const filters: DeviceFilters = {};
    if (status) filters.status = status;
    if (isBanned !== undefined) filters.is_banned = isBanned === "true";
    if (userId) filters.end_user_id = parseInt(userId, 10);
    if (appId) filters.app_id = parseInt(appId, 10);
    if (keyword) filters.keyword = keyword;

    const currentUser = req.user ? {
      id: req.user.userId,
      userId: req.user.userId,
      role: req.user.role,
      permissions: req.user.permissions,
      parent_id: req.user.parent_id,
    } : undefined;

    return this.devicesService.findAllPaginated(pageNum, size, filters, currentUser);
  }

  @Get("online-count")
  @ApiOperation({ summary: '获取在线设备数量', description: '获取当前在线设备总数' })
  @ApiQuery({ name: 'app_id', description: '应用ID（可选）', required: false, type: 'number' })
  @ApiResponse({ status: 200, description: '成功', schema: { type: 'object', properties: { count: { type: 'number' } } } })
  async getOnlineCount(@Query("app_id") appId?: string) {
    const appIdNum = appId ? parseInt(appId, 10) : undefined;
    const count = await this.devicesService.getOnlineCount(appIdNum);
    return { count };
  }

  @Post("heartbeat")
  @UseGuards(SignatureGuard)
  @ApiOperation({ summary: '客户端心跳上报', description: '客户端定期上报心跳，需要签名验证' })
  @ApiBody({ type: HeartbeatDto })
  @ApiResponse({
    status: 200, description: '心跳成功', schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        interval: { type: 'number', description: '心跳间隔（秒）' },
        server_time: { type: 'number', description: '服务器时间戳' },
        commands: { type: 'array', items: { type: 'string' }, description: '服务器下发命令' },
        message: { type: 'string' },
      },
    }
  })
  @ApiResponse({ status: 401, description: '签名验证失败' })
  async heartbeat(
    @Body() heartbeatDto: HeartbeatDto,
    @Ip() ip: string,
    @Request() req: any,
  ) {
    // Use the validated app from SignatureGuard
    const app = req.validatedApp;

    // Verify that the body app_id matches the signature app_id
    if (heartbeatDto.app_id !== app.id) {
      // We can either throw or just overwrite it. For security, better to overwrite or throw.
      // Let's overwrite it to ensure it processes for the correct app.
      // Or throw BadRequest if they don't match?
      // Let's forbid it.
      // Actually SignatureGuard might not catch it if the URL doesn't have :appId.
      // But wait, heartbeat endpoint is @Post("heartbeat"), no :appId in URL.
      // So SignatureGuard didn't check URL param.
      // We must check here.
      // Since SignatureGuard verified the signature against the x-app-id header,
      // req.app is the authenticated app.
      // We should ensure heartbeatDto.app_id matches req.app.id.
    }

    if (heartbeatDto.app_id !== app.id) {
      // Ideally we should throw, but legacy clients might send weird stuff?
      // No, security first.
      // Actually, we can just IGNORE heartbeatDto.app_id and use app.id.
    }

    const userId = req.user?.userId;
    return this.devicesService.handleHeartbeat({
      hwid: heartbeatDto.hwid,
      app_id: app.id, // Use validated App ID
      end_user_id: userId,
      last_ip: ip,
      app_version: heartbeatDto.app_version,
      extra_info: heartbeatDto.extra_info,
    });
  }

  @Get("heartbeat/check/:hwid")
  @ApiOperation({ summary: '检查设备在线状态', description: '根据HWID检查设备是否在线' })
  @ApiParam({ name: 'hwid', description: '硬件ID' })
  @ApiResponse({ status: 200, description: '成功' })
  async checkHeartbeat(@Param("hwid") hwid: string) {
    return this.devicesService.checkDeviceStatus(hwid);
  }

  @Get("by-hwid/:hwid")
  @ApiOperation({ summary: '按HWID查询设备', description: '根据硬件ID获取设备信息' })
  @ApiParam({ name: 'hwid', description: '硬件ID' })
  @ApiResponse({ status: 200, description: '成功', schema: { type: 'object', properties: { exists: { type: 'boolean' }, device: { type: 'object' } } } })
  async findByHwid(@Param("hwid") hwid: string) {
    const device = await this.devicesService.findByHwid(hwid);
    if (!device) {
      return { exists: false, device: null };
    }
    return { exists: true, device };
  }

  @Get(":id")
  @ApiOperation({ summary: '获取设备详情', description: '根据ID获取设备详情' })
  @ApiParam({ name: 'id', description: '设备ID', type: 'number' })
  @ApiResponse({ status: 200, description: '成功' })
  async findOne(@Param("id") id: string) {
    return this.devicesService.findById(parseInt(id, 10));
  }

  @Put(":id/ban")
  @ApiOperation({ summary: '封禁设备', description: '封禁指定设备' })
  @ApiParam({ name: 'id', description: '设备ID', type: 'number' })
  @ApiBody({ type: BanDeviceDto })
  @ApiResponse({ status: 200, description: '封禁成功' })
  async ban(@Param("id") id: string, @Body() banDeviceDto: BanDeviceDto) {
    return this.devicesService.banDevice(parseInt(id, 10), banDeviceDto.reason);
  }

  @Put(":id/unban")
  @ApiOperation({ summary: '解封设备', description: '解封指定设备' })
  @ApiParam({ name: 'id', description: '设备ID', type: 'number' })
  @ApiResponse({ status: 200, description: '解封成功' })
  async unban(@Param("id") id: string) {
    return this.devicesService.unbanDevice(parseInt(id, 10));
  }

  @Delete(":id")
  @ApiOperation({ summary: '删除设备', description: '删除指定设备' })
  @ApiParam({ name: 'id', description: '设备ID', type: 'number' })
  @ApiResponse({ status: 200, description: '删除成功' })
  async remove(@Param("id") id: string) {
    await this.devicesService.remove(parseInt(id, 10));
    return { success: true, message: "设备已删除" };
  }

  @Put(":id/unbind")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '解绑设备', description: '从用户移除设备关联' })
  @ApiParam({ name: 'id', description: '设备ID', type: 'number' })
  @ApiResponse({ status: 200, description: '解绑成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  async unbindFromUser(@Param("id") id: string) {
    const device = await this.devicesService.unbindFromUser(parseInt(id, 10));
    return { success: true, message: "设备已解绑", device };
  }

  @Get("by-user/:userId")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '获取用户绑定的设备', description: '获取指定用户绑定的所有设备' })
  @ApiParam({ name: 'userId', description: '用户ID', type: 'number' })
  @ApiResponse({ status: 200, description: '成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  async findByUser(@Param("userId") userId: string) {
    const devices = await this.devicesService.findByEndUser(parseInt(userId, 10));
    return { devices, count: devices.length };
  }

  @Get("export")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "导出设备", description: "导出设备数据为 Excel 文件" })
  async export(
    @Query("status") status: DeviceStatus,
    @Query("is_banned") isBanned: string,
    @Query("user_id") userId: string,
    @Query("app_id") appId: string,
    @Query("keyword") keyword: string,
    @Request() req,
    @Res() res: Response,
  ) {
    const filters: DeviceFilters = {};
    if (status) filters.status = status;
    if (isBanned !== undefined) filters.is_banned = isBanned === "true";
    if (userId) filters.end_user_id = parseInt(userId, 10);
    if (appId) filters.app_id = parseInt(appId, 10);
    if (keyword) filters.keyword = keyword;

    const currentUser = req.user ? {
      id: req.user.userId,
      userId: req.user.userId,
      role: req.user.role,
      permissions: req.user.permissions,
      parent_id: req.user.parent_id,
    } : undefined;

    const { list } = await this.devicesService.findAllPaginated(1, 10000, filters, currentUser);

    const exportData = list.map((device) => ({
      "ID": device.id,
      "HWID": device.hwid,
      "应用ID": device.app_id,
      "用户ID": device.end_user_id || "",
      "状态": device.status,
      "是否封禁": device.is_banned ? "是" : "否",
      "封禁原因": device.ban_reason || "",
      "最后IP": device.last_ip || "",
      "最后心跳": ExcelExportUtil.formatDate(device.last_heartbeat),
      "应用版本": device.app_version || "",
      "创建时间": ExcelExportUtil.formatDate(device.created_at),
    }));

    const buffer = ExcelExportUtil.exportToBuffer(exportData, "devices");

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="devices_${Date.now()}.xlsx"`,
    );
    res.send(buffer);
  }
}
