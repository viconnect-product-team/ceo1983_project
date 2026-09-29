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
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AdvertisementsService } from './advertisements.service';
import { CreateAdvertisementDto, CreateAdRequestDto } from './dto/create-advertisement.dto';
import { AuthGuard } from '../auth/auth.guard';

@Controller('advertisements')
export class AdvertisementsController {
  constructor(private readonly adsService: AdvertisementsService) {}

  @Get()
  async getAds(@Query('activeOnly') activeOnly?: string) {
    const isOnlyActive = activeOnly === 'true' || activeOnly === '1';
    return this.adsService.findAll(isOnlyActive);
  }

  @Get('requests')
  @UseGuards(AuthGuard)
  async getRequests() {
    return this.adsService.findAllRequests();
  }

  @Post('requests')
  async createRequest(@Body() dto: CreateAdRequestDto) {
    return this.adsService.createRequest(dto);
  }

  @Put('requests/:id/status')
  @UseGuards(AuthGuard)
  async updateRequestStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.adsService.updateRequestStatus(id, status);
  }

  @Get(':id')
  async getAdById(@Param('id') id: string) {
    return this.adsService.findById(id);
  }

  @Post()
  @UseGuards(AuthGuard)
  async createAd(@Body() dto: CreateAdvertisementDto) {
    return this.adsService.create(dto);
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  async updateAd(
    @Param('id') id: string,
    @Body() data: Partial<CreateAdvertisementDto>,
  ) {
    return this.adsService.update(id, data);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  async deleteAd(@Param('id') id: string) {
    return this.adsService.delete(id);
  }

  @Post(':id/impression')
  @HttpCode(HttpStatus.OK)
  async trackImpression(@Param('id') id: string) {
    await this.adsService.trackImpression(id);
    return { success: true };
  }

  @Post(':id/click')
  @HttpCode(HttpStatus.OK)
  async trackClick(@Param('id') id: string) {
    await this.adsService.trackClick(id);
    return { success: true };
  }
}
