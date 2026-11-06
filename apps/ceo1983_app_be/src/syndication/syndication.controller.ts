import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { SyndicationService, PlatformConfigDto, PublishBroadcastDto } from './syndication.service';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';

@Controller('syndication')
export class SyndicationController {
  constructor(private readonly syndicationService: SyndicationService) {}

  @Get('config')
  async getConfig() {
    const config = await this.syndicationService.getConfig();
    return { ok: true, config };
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Post('config')
  async saveConfig(@Body() body: Partial<PlatformConfigDto>) {
    return this.syndicationService.saveConfig(body);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Post('publish')
  async publishBroadcast(@Body() body: PublishBroadcastDto) {
    return this.syndicationService.publishBroadcast(body);
  }

  @Get('history')
  async getHistory() {
    const history = await this.syndicationService.getBroadcastHistory();
    return { ok: true, history };
  }
}
