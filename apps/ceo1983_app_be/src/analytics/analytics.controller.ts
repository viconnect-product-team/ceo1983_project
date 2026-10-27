import { Controller, Get, Post, Body, Query, Request, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @UseGuards(OptionalJwtAuthGuard)
  @Get('overview')
  async getOverview(@Request() req: any, @Query('period') period?: 'month' | 'quarter' | 'year') {
    const userId = req.user?.id || req.user?.sub;
    return this.analyticsService.getOverview(userId, period);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get('export')
  async exportAnalytics(@Query('category') category?: string) {
    return this.analyticsService.exportAnalytics(category);
  }

  @UseGuards(JwtAuthGuard)
  @Post('import')
  async importAnalytics(@Body() body: any) {
    return this.analyticsService.importAnalytics(body);
  }
}
