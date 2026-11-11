/* eslint-disable */
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Request,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { ConnectAppService } from '../connect-app/connect-app.service';
import { CreateAdminNotificationDto, UpdateAdminNotificationDto } from './dto/admin.dto';

@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly adminService: AdminService,
    private readonly connectAppService: ConnectAppService,
  ) {}

  @Get()
  async listNotifications(
    @Request() req: any,
    @Query('associationId') associationId?: string,
    @Query('appScope') appScope?: string,
    @Query('limit') limit?: string,
    @Query('unreadOnly') unreadOnly?: string,
  ) {
    const userId = req.user?.id || req.headers?.['x-user-id'] || '';
    if (userId) {
      try {
        const memberNotifs = await this.connectAppService.listMyMemberNotifications(userId);
        if (Array.isArray(memberNotifs) && memberNotifs.length > 0) {
          return memberNotifs;
        }
      } catch {}
    }
    return this.adminService.listNotifications(
      userId,
      associationId,
      appScope || 'association_app',
    );
  }

  @Get('unread-count')
  async getUnreadCount(@Request() req: any) {
    const userId = req.user?.id || req.headers?.['x-user-id'] || '';
    if (!userId) return { count: 0 };
    try {
      const count = await this.connectAppService.getUnreadNotificationCount(userId);
      return { count: typeof count === 'number' ? count : (count as any)?.count || 0 };
    } catch {
      return { count: 0 };
    }
  }

  @Post()
  async createNotification(
    @Request() req: any,
    @Body() body: CreateAdminNotificationDto,
  ) {
    const userId = req.user?.id || req.headers?.['x-user-id'] || '';
    return this.adminService.createNotification(userId, body);
  }

  @Patch(':id')
  async updateNotification(
    @Param('id') id: string,
    @Body() body: UpdateAdminNotificationDto,
  ) {
    return this.adminService.updateNotification(id, body);
  }

  @Post(':id/read')
  async markRead(@Request() req: any, @Param('id') id: string) {
    const userId = req.user?.id || req.headers?.['x-user-id'] || '';
    if (userId) {
      try {
        await this.connectAppService.markMemberNotificationRead(userId, id);
      } catch {}
    }
    return { ok: true, id };
  }

  @Post('read-all')
  async markAllRead(@Request() req: any) {
    const userId = req.user?.id || req.headers?.['x-user-id'] || '';
    if (userId) {
      try {
        await this.connectAppService.markAllMemberNotificationsRead(userId);
      } catch {}
    }
    return { ok: true };
  }

  @Post(':id/send')
  async sendNotification(@Param('id') id: string) {
    return this.adminService.sendNotification(id);
  }

  @Post(':id/push-messages')
  async pushNotificationToMessages(
    @Request() req: any,
    @Param('id') id: string,
    @Body('channel') channel?: string,
  ) {
    const userId = req.user?.id || req.headers?.['x-user-id'] || '';
    return this.adminService.pushNotificationToMessages(userId, id, channel);
  }

  @Delete(':id')
  async deleteNotification(@Param('id') id: string) {
    return this.adminService.deleteNotification(id);
  }
}

