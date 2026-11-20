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
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { VotingService } from './voting.service';
import { CreatePollDto, CastVoteDto } from './dto';

@Controller('voting')
export class VotingController {
  constructor(private readonly votingService: VotingService) {}

  /**
   * Endpoint biểu quyết công khai (dành cho đại biểu quét QR / mở link ngoài hệ thống)
   */
  @Get('public/polls/:id')
  async getPublicPoll(@Param('id') id: string) {
    return this.votingService.getPublicPoll(id);
  }

  /**
   * Bỏ phiếu / Đánh giá sao công khai (hỗ trợ cả chọn phương án hoặc 1-5 sao)
   */
  @Post('public/polls/:id/vote')
  async castPublicVote(@Param('id') id: string, @Body() body: any) {
    return this.votingService.castPublicVote(id, body);
  }

  /**
   * Gửi link biểu quyết công khai tới toàn bộ đại biểu đã check-in sự kiện
   */
  @Post('polls/:id/send-to-checkedin')
  @UseGuards(JwtAuthGuard)
  async sendPollToCheckedInAttendees(
    @Request() req: any,
    @Param('id') id: string,
  ) {
    const userId = req.user?.id || req.user?.sub || 'system';
    return this.votingService.sendPollToCheckedInAttendees(userId, id);
  }

  @Get('polls')
  @UseGuards(JwtAuthGuard)
  async listPolls(
    @Request() req: any,
    @Query('associationId') associationId?: string,
  ) {
    return this.votingService.listPolls(
      req.user.id || req.user.sub,
      associationId,
    );
  }

  @Get('polls/:id')
  @UseGuards(JwtAuthGuard)
  async getPollById(@Request() req: any, @Param('id') id: string) {
    return this.votingService.getPollById(req.user.id || req.user.sub, id);
  }

  @Post('polls')
  @UseGuards(JwtAuthGuard)
  async createPoll(@Request() req: any, @Body() body: CreatePollDto) {
    return this.votingService.createPoll(req.user.id || req.user.sub, body);
  }

  @Put('polls/:id')
  @UseGuards(JwtAuthGuard)
  async updatePoll(
    @Request() req: any,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.votingService.updatePoll(req.user.id || req.user.sub, id, body);
  }

  @Post('polls/:id/close')
  @UseGuards(JwtAuthGuard)
  async closePoll(@Request() req: any, @Param('id') id: string) {
    return this.votingService.closePoll(req.user.id || req.user.sub, id);
  }

  @Delete('polls/:id')
  @UseGuards(JwtAuthGuard)
  async deletePoll(@Request() req: any, @Param('id') id: string) {
    return this.votingService.deletePoll(req.user.id || req.user.sub, id);
  }

  @Post('polls/:id/vote')
  @UseGuards(JwtAuthGuard)
  async castVote(
    @Request() req: any,
    @Param('id') id: string,
    @Body() body: CastVoteDto,
  ) {
    return this.votingService.castVote(
      req.user.id || req.user.sub,
      id,
      body.optionId,
      body.sourceApp,
    );
  }

  @Post('lucky-draw/notify')
  @UseGuards(JwtAuthGuard)
  async notifyLuckyDrawWinner(
    @Request() req: any,
    @Body()
    body: {
      winnerName: string;
      winnerCompany?: string;
      winnerCode?: string;
      luckyNumber?: string;
      prize: string;
      eventName?: string;
      eventId?: string;
    },
  ) {
    return this.votingService.notifyLuckyDrawWinner(
      req.user.id || req.user.sub,
      body,
    );
  }
}
