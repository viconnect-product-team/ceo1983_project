import { Body, Controller, Delete, Get, Param, Patch, Post, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';
import { ConnectAppService } from './connect-app.service';

@Controller('content')
export class ContentController {
  constructor(private readonly connectAppService: ConnectAppService) {}

  @Get('news')
  @UseGuards(OptionalJwtAuthGuard)
  async listNews() {
    return this.connectAppService.listPublishedNews();
  }

  @Get('admin/news')
  @UseGuards(OptionalJwtAuthGuard)
  async listAdminNews() {
    return this.connectAppService.listAdminNews();
  }

  @Post('admin/news')
  @UseGuards(JwtAuthGuard)
  async createAdminNews(@Body() body: any) {
    return this.connectAppService.createNewsAdmin(body);
  }

  @Put('admin/news/:id')
  @UseGuards(JwtAuthGuard)
  async updateAdminNewsPut(@Param('id') id: string, @Body() body: any) {
    return this.connectAppService.updateNewsAdmin(id, body);
  }

  @Patch('admin/news/:id')
  @UseGuards(JwtAuthGuard)
  async updateAdminNewsPatch(@Param('id') id: string, @Body() body: any) {
    return this.connectAppService.updateNewsAdmin(id, body);
  }

  @Delete('admin/news/:id')
  @UseGuards(JwtAuthGuard)
  async deleteAdminNews(@Param('id') id: string) {
    return this.connectAppService.deleteNewsAdmin(id);
  }

  @Get('perks')
  @UseGuards(OptionalJwtAuthGuard)
  async listPerks() {
    return this.connectAppService.listActivePerks();
  }

  @Get('admin/perks')
  @UseGuards(OptionalJwtAuthGuard)
  async listAdminPerks() {
    return this.connectAppService.listAllPerksAdmin();
  }

  @Post('admin/perks')
  @UseGuards(JwtAuthGuard)
  async createAdminPerk(@Body() body: any) {
    return this.connectAppService.createPerkAdmin(body);
  }

  @Patch('admin/perks/:id')
  @UseGuards(JwtAuthGuard)
  async updateAdminPerk(@Param('id') id: string, @Body() body: any) {
    return this.connectAppService.updatePerkAdmin(id, body);
  }

  @Put('admin/perks/:id')
  @UseGuards(JwtAuthGuard)
  async updateAdminPerkPut(@Param('id') id: string, @Body() body: any) {
    return this.connectAppService.updatePerkAdmin(id, body);
  }

  @Delete('admin/perks/:id')
  @UseGuards(JwtAuthGuard)
  async deleteAdminPerk(@Param('id') id: string) {
    return this.connectAppService.deletePerkAdmin(id);
  }

  @Get('perks/:id')
  @UseGuards(OptionalJwtAuthGuard)
  async getPerk(@Param('id') id: string) {
    return this.connectAppService.getPerkById(id);
  }
}

