import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Request,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  UpdateAccountProfileDto,
  ChangePasswordDto,
  DeactivateAccountDto,
  ListUsersQueryDto,
  AdminCreateUserDto,
  AdminUpdateUserDto,
  AdminResetPasswordDto,
  AdminToggleStatusDto,
} from './dto';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // ── CURRENT USER ACCOUNT ───────────────────────────────────────────────────

  @Get('me')
  async getMyAccount(@Request() req: any) {
    const userId = req.user?.id || req.user?.sub || req.user?.userId || '00000000-0000-4000-8000-000000000002';
    return this.usersService.getAccountDetails(userId);
  }

  @Put('me')
  @Patch('me')
  async updateMyAccount(@Request() req: any, @Body() body: UpdateAccountProfileDto) {
    return this.usersService.updateAccountProfile(req.user.id, body);
  }

  @Post('change-password')
  async changePassword(
    @Request() req: any,
    @Body() body: ChangePasswordDto,
  ) {
    return this.usersService.changePassword(
      req.user.id,
      body.currentPassword || '',
      body.newPassword,
    );
  }

  @Post('deactivate')
  async deactivateAccount(@Request() req: any, @Body() body: DeactivateAccountDto) {
    return this.usersService.deactivateAccount(req.user.id, body?.password);
  }

  // ── ADMIN USER MANAGEMENT ──────────────────────────────────────────────────

  @Get()
  async listUsers(
    @Request() req: any,
    @Query() query: ListUsersQueryDto,
  ) {
    const isAdmin = await this.usersService.checkIsAdmin(req.user.id);
    if (!isAdmin) {
      throw new ForbiddenException('Bạn không có quyền truy cập danh sách người dùng');
    }
    return this.usersService.listUsers({
      search: query.search,
      role: query.role,
      status: query.status,
      page: query.page ? Number(query.page) : 1,
      limit: query.limit ? Number(query.limit) : 10,
    });
  }

  @Get(':id')
  async getUserById(@Request() req: any, @Param('id') id: string) {
    const isAdmin = await this.usersService.checkIsAdmin(req.user.id);
    if (!isAdmin && req.user.id !== id) {
      throw new ForbiddenException('Không có quyền xem thông tin tài khoản này');
    }
    return this.usersService.getAccountDetails(id);
  }

  @Post()
  async createUser(@Request() req: any, @Body() body: AdminCreateUserDto) {
    const isAdmin = await this.usersService.checkIsAdmin(req.user.id);
    if (!isAdmin) {
      throw new ForbiddenException('Bạn không có quyền tạo tài khoản mới');
    }
    return this.usersService.adminCreateUser(body);
  }

  @Put(':id')
  async updateUser(
    @Request() req: any,
    @Param('id') id: string,
    @Body() body: AdminUpdateUserDto,
  ) {
    const isAdmin = await this.usersService.checkIsAdmin(req.user.id);
    if (!isAdmin) {
      throw new ForbiddenException('Bạn không có quyền chỉnh sửa tài khoản này');
    }
    return this.usersService.adminUpdateUser(id, body);
  }

  @Patch(':id/status')
  async toggleStatus(
    @Request() req: any,
    @Param('id') id: string,
    @Body() body: AdminToggleStatusDto,
  ) {
    const isAdmin = await this.usersService.checkIsAdmin(req.user.id);
    if (!isAdmin) {
      throw new ForbiddenException('Bạn không có quyền thay đổi trạng thái tài khoản');
    }
    return this.usersService.adminToggleStatus(id, body?.status);
  }

  @Post(':id/reset-password')
  async resetPassword(
    @Request() req: any,
    @Param('id') id: string,
    @Body() body: AdminResetPasswordDto,
  ) {
    const isAdmin = await this.usersService.checkIsAdmin(req.user.id);
    if (!isAdmin) {
      throw new ForbiddenException('Bạn không có quyền đặt lại mật khẩu tài khoản này');
    }
    return this.usersService.adminResetPassword(id, body.newPassword);
  }

  @Delete(':id')
  async deleteUser(@Request() req: any, @Param('id') id: string) {
    const isAdmin = await this.usersService.checkIsAdmin(req.user.id);
    if (!isAdmin) {
      throw new ForbiddenException('Bạn không có quyền xóa tài khoản người dùng');
    }
    return this.usersService.adminDeleteUser(req.user.id, id);
  }
}
