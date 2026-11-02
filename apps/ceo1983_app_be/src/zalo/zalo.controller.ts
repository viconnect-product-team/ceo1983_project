import { Controller, Post, Get, Body, Query, Headers, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import {
  ZaloService,
  SendZaloMessageDto,
  RefreshZaloTokenDto,
  SendBulkZaloMessageDto,
} from './zalo.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('zalo')
export class ZaloController {
  constructor(private readonly zaloService: ZaloService) {}

  /**
   * Endpoint Webhook công khai dành riêng cho Zalo OA Server gửi sự kiện (user_send_text, follow, v.v.)
   */
  @Get('webhook')
  verifyWebhook(@Query() query: any) {
    return {
      status: 'active',
      message: 'Zalo OA Webhook endpoint sẵn sàng tiếp nhận tương tác',
      query,
    };
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(@Body() payload: any) {
    await this.zaloService.recordWebhookInteraction(payload);
    return { error: 0, message: 'Success' };
  }

  @Post('refresh-token')
  @UseGuards(JwtAuthGuard)
  async refreshToken(@Body() dto: RefreshZaloTokenDto) {
    return this.zaloService.refreshToken(dto);
  }

  @Get('recent-chats')
  @UseGuards(JwtAuthGuard)
  async getRecentChats(
    @Query('accessToken') queryToken?: string,
    @Headers('x-zalo-access-token') headerToken?: string,
  ) {
    const token = queryToken || headerToken;
    if (!token) {
      return { success: false, message: 'Thiếu Access Token', data: [] };
    }
    return this.zaloService.getRecentChats(token);
  }

  @Post('send-message')
  @UseGuards(JwtAuthGuard)
  async sendMessage(@Body() dto: SendZaloMessageDto) {
    return this.zaloService.sendMessage(dto);
  }

  /**
   * Bắn thông báo ZNS qua Số Điện Thoại - Chuẩn Enterprise 100% (Không cần Zalo User ID)
   */
  @Post('send-zns')
  @UseGuards(JwtAuthGuard)
  async sendZns(
    @Body()
    dto: {
      templateId: string;
      phone: string;
      templateData: Record<string, any>;
      accessToken: string;
      trackingId?: string;
    },
  ) {
    return this.zaloService.sendZns(dto);
  }

  /**
   * Liên kết Zalo User ID với Hội viên CRM
   */
  @Post('bind-uid')
  @UseGuards(JwtAuthGuard)
  async bindMemberUid(
    @Body()
    dto: {
      phone?: string;
      zaloUid: string;
      name?: string;
      memberId?: string;
    },
  ) {
    return this.zaloService.bindMemberUid(dto);
  }

  @Post('send-bulk')
  @UseGuards(JwtAuthGuard)
  async sendBulkMessages(@Body() dto: SendBulkZaloMessageDto) {
    return this.zaloService.sendBulkMessages(dto);
  }

  @Post('trigger-scheduled')
  @UseGuards(JwtAuthGuard)
  async triggerScheduledBroadcast(
    @Body()
    dto: {
      scheduleType?: string;
      targetGroup?: string;
      messageTemplate?: string;
      accessToken?: string;
    },
  ) {
    return this.zaloService.triggerScheduledBroadcast(dto);
  }
}

