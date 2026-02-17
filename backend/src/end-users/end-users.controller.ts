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
import { EndUsersService } from "./end-users.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { QueryEndUserDto } from "./dto/query-end-user.dto";
import { CreateEndUserDto } from "./dto/create-end-user.dto";
import { UpdateEndUserDto } from "./dto/update-end-user.dto";
import { ClientRegisterDto, ClientLoginDto } from "./dto/client-auth.dto";
import { ExcelExportUtil } from "../common/utils/excel-export.util";

@ApiTags('终端用户 (End Users)')
@Controller("end-users")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class EndUsersController {
  constructor(private readonly endUsersService: EndUsersService) {}

  @Post()
  @ApiOperation({ summary: '创建终端用户', description: '创建新的终端用户' })
  @ApiBody({ type: CreateEndUserDto })
  @ApiResponse({ status: 201, description: '创建成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  create(@Body() createEndUserDto: CreateEndUserDto) {
    return this.endUsersService.create(createEndUserDto);
  }

  @Get()
  @ApiOperation({ summary: '获取终端用户列表', description: '分页查询终端用户。admin看全部，developer看自己和下级，agent只看自己' })
  @ApiResponse({ status: 200, description: '成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  findAll(@Query() query: QueryEndUserDto, @Request() req) {
    const currentUser = req.user ? {
      id: req.user.userId,
      userId: req.user.userId,
      role: req.user.role,
      permissions: req.user.permissions,
      parent_id: req.user.parent_id,
    } : undefined;

    return this.endUsersService.findAll(query, currentUser);
  }

  @Get(":id")
  @ApiOperation({ summary: '获取终端用户详情', description: '根据ID获取终端用户详情' })
  @ApiParam({ name: 'id', description: '终端用户ID', type: 'number' })
  @ApiResponse({ status: 200, description: '成功' })
  findOne(@Param("id") id: string) {
    return this.endUsersService.findOne(+id);
  }

  @Get("hwid/:hwid")
  @ApiOperation({ summary: '按HWID查询终端用户', description: '根据硬件ID查询终端用户' })
  @ApiParam({ name: 'hwid', description: '硬件ID' })
  @ApiResponse({ status: 200, description: '成功' })
  findByHwid(@Param("hwid") hwid: string) {
    return this.endUsersService.findByHwid(hwid);
  }

  @Put(":id")
  @ApiOperation({ summary: '更新终端用户', description: '更新终端用户信息' })
  @ApiParam({ name: 'id', description: '终端用户ID', type: 'number' })
  @ApiBody({ type: UpdateEndUserDto })
  @ApiResponse({ status: 200, description: '更新成功' })
  update(@Param("id") id: string, @Body() updateEndUserDto: UpdateEndUserDto) {
    return this.endUsersService.update(+id, updateEndUserDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: '删除终端用户', description: '删除指定终端用户' })
  @ApiParam({ name: 'id', description: '终端用户ID', type: 'number' })
  @ApiResponse({ status: 200, description: '删除成功' })
  remove(@Param("id") id: string) {
    return this.endUsersService.remove(+id);
  }

  @Put(":id/unbind-hwid")
  @ApiOperation({ summary: '解绑所有设备', description: '解绑该用户绑定的所有设备' })
  @ApiParam({ name: 'id', description: '终端用户ID', type: 'number' })
  @ApiResponse({ status: 200, description: '解绑成功' })
  unbindHwid(@Param("id") id: string) {
    return this.endUsersService.unbindHwid(+id);
  }

  @Get("export")
  @ApiOperation({ summary: "导出终端用户", description: "导出终端用户数据为 Excel 文件" })
  async export(@Query() query: QueryEndUserDto, @Request() req, @Res() res: Response) {
    const currentUser = req.user ? {
      id: req.user.userId,
      userId: req.user.userId,
      role: req.user.role,
      permissions: req.user.permissions,
      parent_id: req.user.parent_id,
    } : undefined;

    const { list } = await this.endUsersService.findAll(query, currentUser);

    const exportData = list.map((user) => ({
      "ID": user.id,
      "用户名": user.username || "",
      "HWID": user.hwid || "",
      "应用ID": user.app_id,
      "应用名称": (user as any).app?.name || "",
      "最大设备数": user.max_devices,
      "到期时间": ExcelExportUtil.formatDate(user.expire_time),
      "是否激活": user.is_active ? "是" : "否",
      "最后IP": user.last_ip || "",
      "最后登录": ExcelExportUtil.formatDate(user.last_login),
      "创建时间": ExcelExportUtil.formatDate(user.created_at),
    }));

    const buffer = ExcelExportUtil.exportToBuffer(exportData, "end_users");

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="end_users_${Date.now()}.xlsx"`,
    );
    res.send(buffer);
  }
}
