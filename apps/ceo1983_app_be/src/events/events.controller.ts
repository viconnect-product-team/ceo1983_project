import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Request,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { EventsService, CreateEventDto, UpdateEventDto } from './events.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { DataScopeInterceptor } from '../auth/data-scope.interceptor';
import { DataScope } from '../auth/data-scope.decorator';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('my-events')
  async listMyEvents(@Request() req: any) {
    return this.eventsService.listMyEvents(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('overview')
  async getEventsOverview(
    @Request() req: any,
    @Query('associationId') associationId?: string,
  ) {
    return this.eventsService.getEventsOverview(req.user.id, associationId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('platform_admin', 'superadmin', 'adm', 'admin', 'bqt', 'btt', 'btv')
  @Get('registrations')
  async listRegistrations(
    @Request() req: any,
    @Query('associationId') associationId?: string,
    @Query('eventId') eventId?: string,
  ) {
    return this.eventsService.listRegistrations(req.user?.id || '', associationId, eventId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('platform_admin', 'superadmin', 'adm', 'admin', 'bqt', 'btt')
  @Get('with-registrations')
  async listEventsWithRegistrations(
    @Request() req: any,
    @Query('associationId') associationId?: string,
  ) {
    return this.eventsService.listEventsWithRegistrations(req.user.id, associationId);
  }

  @Get()
  @UseInterceptors(DataScopeInterceptor)
  @DataScope('event')
  async listEvents(
    @Request() req: any,
    @Query('associationId') associationId?: string,
  ) {
    return this.eventsService.listEvents(req.user?.id || '', associationId);
  }

  @Get(':id')
  @UseInterceptors(DataScopeInterceptor)
  @DataScope('event')
  async getEventById(@Request() req: any, @Param('id') id: string) {
    return this.eventsService.getEventById(req.user?.id || '', id);
  }

  @Get(':id/tickets')
  async getEventTickets(@Param('id') id: string) {
    return this.eventsService.getEventTickets(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('platform_admin', 'superadmin', 'adm', 'admin', 'bqt', 'btt')
  @Post()
  async createEvent(@Request() req: any, @Body() body: CreateEventDto) {
    return this.eventsService.createEvent(req.user.id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/register')
  async registerForEvent(@Request() req: any, @Param('id') id: string, @Body() body?: any) {
    return this.eventsService.registerForEvent(req.user.id, id, body);
  }

  /**
   * Đăng ký tham gia sự kiện công khai dành cho khách vãng lai quét mã QR tại bàn đón tiếp
   */
  @Post(':id/guest-register')
  async guestRegister(@Param('id') id: string, @Body() body: any) {
    return this.eventsService.guestRegister(id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/cancel')
  async cancelEventRegistration(@Request() req: any, @Param('id') id: string, @Body('reason') reason?: string) {
    return this.eventsService.cancelEventRegistration(req.user.id, id, reason);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('platform_admin', 'superadmin', 'adm', 'admin', 'bqt', 'btt')
  @Post(':id/cancel-event')
  async cancelEvent(
    @Request() req: any,
    @Param('id') id: string,
    @Body() body: { reason: string; refundPolicy?: string },
  ) {
    return this.eventsService.cancelEvent(req.user.id, id, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('platform_admin', 'superadmin', 'adm', 'admin', 'bqt', 'btt')
  @Put(':id')
  async updateEvent(
    @Request() req: any,
    @Param('id') id: string,
    @Body() body: UpdateEventDto,
  ) {
    return this.eventsService.updateEvent(req.user.id, id, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('platform_admin', 'superadmin', 'adm', 'admin', 'bqt', 'btt')
  @Put(':id/qr-fields')
  async updateQrFields(
    @Request() req: any,
    @Param('id') id: string,
    @Body('qrFields') qrFields: string[],
  ) {
    return this.eventsService.updateQrFields(req.user.id, id, qrFields);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('platform_admin', 'superadmin', 'adm', 'admin', 'bqt', 'btt')
  @Put('registrations/:id/seating')
  async updateRegistrationSeating(
    @Request() req: any,
    @Param('id') id: string,
    @Body('seatAssignment') seatAssignment: string,
  ) {
    return this.eventsService.updateRegistrationSeating(req.user.id, id, seatAssignment);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('platform_admin', 'superadmin', 'adm', 'admin', 'bqt', 'btc')
  @Post('registrations/:id/walk-in-cash')
  async recordWalkInCashPayment(
    @Request() req: any,
    @Param('id') id: string,
    @Body('amount') amount?: number,
  ) {
    return this.eventsService.recordWalkInCashPayment(req.user.id, id, amount);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('platform_admin', 'superadmin', 'adm', 'admin', 'bqt', 'btc')
  @Post('registrations/:id/send-payment-reminder')
  async sendPaymentReminder(
    @Request() req: any,
    @Param('id') id: string,
  ) {
    return this.eventsService.sendPaymentReminder(req.user.id, id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('platform_admin', 'superadmin', 'adm', 'admin', 'bqt', 'btt')
  @Post(':id/attendees/add-or-checkin')
  async addOrCheckinAttendee(
    @Request() req: any,
    @Param('id') eventId: string,
    @Body() body: any,
  ) {
    return this.eventsService.addOrCheckinAttendee(req.user.id, eventId, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('platform_admin', 'superadmin', 'adm', 'admin', 'bqt')
  @Delete(':id')
  async deleteEvent(@Request() req: any, @Param('id') id: string) {
    const userId = req.user?.id || req.user?.sub || 'system';
    return this.eventsService.deleteEvent(userId, id);
  }
}
