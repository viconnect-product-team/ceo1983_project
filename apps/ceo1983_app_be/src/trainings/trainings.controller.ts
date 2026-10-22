import { Controller, Get, Post, Put, Delete, Body, Param, Query, Request, UseGuards } from '@nestjs/common';
import { TrainingsService } from './trainings.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller()
export class TrainingsController {
  constructor(private readonly trainingsService: TrainingsService) {}

  @Get('trainings')
  async listTrainings(
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.trainingsService.listTrainings({ status, search });
  }

  @Get('association/trainings')
  async listAssociationTrainings(
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.trainingsService.listTrainings({ status, search });
  }

  @Get('trainings/:id')
  async getTraining(@Param('id') id: string) {
    return this.trainingsService.getTrainingById(id);
  }

  @Get('association/trainings/:id')
  async getAssociationTraining(@Param('id') id: string) {
    return this.trainingsService.getTrainingById(id);
  }

  @Post('trainings')
  @UseGuards(JwtAuthGuard)
  async createTraining(@Body() body: any, @Request() req: any) {
    return this.trainingsService.createTraining(body, req.user?.id);
  }

  @Put('trainings/:id')
  @UseGuards(JwtAuthGuard)
  async updateTraining(@Param('id') id: string, @Body() body: any) {
    return this.trainingsService.updateTraining(id, body);
  }

  @Delete('trainings/:id')
  @UseGuards(JwtAuthGuard)
  async deleteTraining(@Param('id') id: string) {
    return this.trainingsService.deleteTraining(id);
  }

  @Post('trainings/:id/join')
  @UseGuards(JwtAuthGuard)
  async joinTraining(@Param('id') id: string, @Request() req: any, @Body() body: any) {
    const memberId = body.memberId || req.user?.id;
    return this.trainingsService.joinTraining(id, memberId, req.user?.id);
  }

  @Post('association/trainings/:id/join')
  @UseGuards(JwtAuthGuard)
  async joinAssociationTraining(@Param('id') id: string, @Request() req: any, @Body() body: any) {
    const memberId = body.memberId || req.user?.id;
    return this.trainingsService.joinTraining(id, memberId, req.user?.id);
  }
}
