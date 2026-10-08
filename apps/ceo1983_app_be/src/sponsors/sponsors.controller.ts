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
  UseInterceptors,
} from '@nestjs/common';
import {
  SponsorsService,
  CreateSponsorPackageDto,
  UpdateSponsorPackageDto,
  CreateSponsorDto,
  OnboardSponsorDto,
  CreateEventPrizeDto,
  UpdateEventPrizeDto,
} from './sponsors.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { DataScopeInterceptor } from '../auth/data-scope.interceptor';
import { DataScope } from '../auth/data-scope.decorator';

@Controller('sponsors')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SponsorsController {
  constructor(private readonly sponsorsService: SponsorsService) {}

  // ── SPONSOR PACKAGES ────────────────────────────────────────────────────────

  @Get('packages')
  async listPackages() {
    return this.sponsorsService.listPackages();
  }

  @Get('packages/:id')
  async getPackageById(@Param('id') id: string) {
    return this.sponsorsService.getPackageById(id);
  }

  @Post('packages')
  @Roles('platform_admin', 'superadmin', 'adm', 'admin', 'bqt', 'btc')
  async createPackage(@Body() body: CreateSponsorPackageDto) {
    return this.sponsorsService.createPackage(body);
  }

  @Put('packages/:id')
  @Roles('platform_admin', 'superadmin', 'adm', 'admin', 'bqt', 'btc')
  async updatePackage(@Param('id') id: string, @Body() body: UpdateSponsorPackageDto) {
    return this.sponsorsService.updatePackage(id, body);
  }

  @Delete('packages/:id')
  @Roles('platform_admin', 'superadmin', 'adm', 'admin', 'bqt', 'btc')
  async deletePackage(@Param('id') id: string) {
    return this.sponsorsService.deletePackage(id);
  }

  // ── SPONSORS ────────────────────────────────────────────────────────────────

  @Get()
  @UseInterceptors(DataScopeInterceptor)
  @DataScope('sponsor')
  async listSponsors() {
    return this.sponsorsService.listSponsors();
  }

  @Get(':id')
  @UseInterceptors(DataScopeInterceptor)
  @DataScope('sponsor')
  async getSponsorById(@Param('id') id: string) {
    return this.sponsorsService.getSponsorById(id);
  }

  @Post()
  @Roles('platform_admin', 'superadmin', 'adm', 'admin', 'bqt', 'btc', 'btt')
  async createSponsor(@Body() body: CreateSponsorDto) {
    return this.sponsorsService.createSponsor(body);
  }

  @Put(':id')
  @Roles('platform_admin', 'superadmin', 'adm', 'admin', 'bqt', 'btc', 'btt')
  async updateSponsor(@Param('id') id: string, @Body() body: Partial<CreateSponsorDto>) {
    return this.sponsorsService.updateSponsor(id, body);
  }

  @Delete(':id')
  @Roles('platform_admin', 'superadmin', 'adm', 'admin', 'bqt', 'btc')
  async deleteSponsor(@Param('id') id: string) {
    return this.sponsorsService.deleteSponsor(id);
  }

  @Post('onboard')
  async onboardSponsor(@Body() body: OnboardSponsorDto) {
    return this.sponsorsService.onboardSponsor(body);
  }

  // ── EVENT PRIZES / AWARDS ──────────────────────────────────────────────────

  @Get('prizes')
  async listPrizes(@Query('eventId') eventId?: string) {
    return this.sponsorsService.listPrizes(eventId);
  }

  @Get('prizes/:id')
  async getPrizeById(@Param('id') id: string) {
    return this.sponsorsService.getPrizeById(id);
  }

  @Post('prizes')
  @Roles('platform_admin', 'superadmin', 'adm', 'admin', 'bqt', 'btc', 'btt')
  async createPrize(@Body() body: CreateEventPrizeDto) {
    return this.sponsorsService.createPrize(body);
  }

  @Put('prizes/:id')
  @Roles('platform_admin', 'superadmin', 'adm', 'admin', 'bqt', 'btc', 'btt')
  async updatePrize(@Param('id') id: string, @Body() body: UpdateEventPrizeDto) {
    return this.sponsorsService.updatePrize(id, body);
  }

  @Delete('prizes/:id')
  @Roles('platform_admin', 'superadmin', 'adm', 'admin', 'bqt', 'btc')
  async deletePrize(@Param('id') id: string) {
    return this.sponsorsService.deletePrize(id);
  }
}
