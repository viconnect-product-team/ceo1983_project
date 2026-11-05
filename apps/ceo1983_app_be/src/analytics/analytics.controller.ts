import { Controller, Get, Post, Body, Query, Request, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @UseGuards(OptionalJwtAuthGuard)
  @Get('overview')
  async getOverview(
    @Request() req: any,
    @Query('period') period?: string,
    @Query('granularity') granularity?: string,
  ) {
    const userId = req.user?.id || req.user?.sub;
    const selectedGranularity = (granularity || period || 'month') as any;
    return this.analyticsService.getOverview(userId, selectedGranularity);
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

  @Post('share-click')
  async recordShareClick(@Body() body: any, @Request() req: any) {
    const ip = req.headers?.['x-forwarded-for'] || req.socket?.remoteAddress;
    const userAgent = req.headers?.['user-agent'];
    return this.analyticsService.recordShareClick({
      ...body,
      ip: body?.ip || ip,
      userAgent: body?.userAgent || userAgent,
    });
  }
}
