import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  Headers,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import {
  ZaloService,
  SendZaloMessageDto,
  RefreshZaloTokenDto,
  ExchangeZaloAuthCodeDto,
  SendBulkZaloMessageDto,
  SendZnsMessageDto,
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

  @Get('oa-config')
  @UseGuards(JwtAuthGuard)
  async getOaConfig() {
    const config = await this.zaloService.getOaConfig();
    return { ok: true, config };
  }

  @Post('oa-config')
  @UseGuards(JwtAuthGuard)
  async saveOaConfig(@Req() req: any, @Body() body: any) {
    return this.zaloService.saveOaConfig(body, req.user?.id);
  }

  @Post('auto-refresh-now')
  @UseGuards(JwtAuthGuard)
  async autoRefreshNow() {
    return this.zaloService.performAutoRefreshToken();
  }

  @Post('exchange-auth-code')
  @UseGuards(JwtAuthGuard)
  async exchangeAuthCode(@Body() dto: ExchangeZaloAuthCodeDto) {
    return this.zaloService.exchangeAuthCode(dto);
  }

  @Post('check-token')
  @UseGuards(JwtAuthGuard)
  async checkToken(@Body() body: { accessToken: string }) {
    return this.zaloService.checkTokenStatus(body.accessToken);
  }

  @Get('recent-chats')
  @UseGuards(JwtAuthGuard)
  async getRecentChats(
    @Query('accessToken') queryToken?: string,
    @Headers('x-zalo-access-token') headerToken?: string,
  ) {
    let token = queryToken || headerToken;
    if (!token) {
      const cfg = await this.zaloService.getOaConfig();
      token = cfg?.accessToken;
    }
    if (!token) {
      return { success: false, message: 'Thiếu Access Token', data: [] };
    }
    return this.zaloService.getRecentChats(token);
  }

  @Post('sync-followers')
  @UseGuards(JwtAuthGuard)
  async syncFollowers() {
    return this.zaloService.syncFollowersFromZalo();
  }

  @Get('subscribers')
  @UseGuards(JwtAuthGuard)
  async getSubscribers() {
    const list = await this.zaloService.getSubscribers();
    return { ok: true, count: list.length, data: list };
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
  async sendZns(@Body() dto: SendZnsMessageDto) {
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

  @Get('templates')
  async getTemplates() {
    return this.zaloService.getSavedTemplates();
  }

  @Post('templates')
  @UseGuards(JwtAuthGuard)
  async saveTemplates(@Req() req: any, @Body() body: { templates: any[] }) {
    return this.zaloService.saveTemplates(body.templates, req.user?.id);
  }

  @Get('miniapp/config')
  async getMiniAppConfig() {
    return this.zaloService.getMiniAppConfig();
  }

  @Post('miniapp/config')
  @UseGuards(JwtAuthGuard)
  async saveMiniAppConfig(@Req() req: any, @Body() body: any) {
    return this.zaloService.saveMiniAppConfig(body, req.user?.id);
  }

  @Post('miniapp/check-health')
  @UseGuards(JwtAuthGuard)
  async checkMiniAppHealth(@Body() body: any) {
    return this.zaloService.checkMiniAppHealth(body);
  }
}
