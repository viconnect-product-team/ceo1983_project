import { Controller, Post, Get, Body, Query, Headers } from '@nestjs/common';
import {
  ZaloService,
  SendZaloMessageDto,
  RefreshZaloTokenDto,
  SendBulkZaloMessageDto,
} from './zalo.service';

@Controller('zalo')
export class ZaloController {
  constructor(private readonly zaloService: ZaloService) {}

  @Post('refresh-token')
  async refreshToken(@Body() dto: RefreshZaloTokenDto) {
    return this.zaloService.refreshToken(dto);
  }

  @Get('recent-chats')
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
  async sendMessage(@Body() dto: SendZaloMessageDto) {
    return this.zaloService.sendMessage(dto);
  }

  @Post('send-bulk')
  async sendBulkMessages(@Body() dto: SendBulkZaloMessageDto) {
    return this.zaloService.sendBulkMessages(dto);
  }
}

