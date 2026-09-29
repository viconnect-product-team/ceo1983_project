import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  SponsorsService,
  CreateSponsorPackageDto,
  UpdateSponsorPackageDto,
  CreateSponsorDto,
  OnboardSponsorDto,
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
}
