import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminService } from './admin.service';
import {
  UpdateDemoLeadDto,
  CreateInvoiceDto,
  AddInvoiceReminderDto,
  CreateAdminNotificationDto,
  UpdateAdminNotificationDto,
  CreateCampaignDto,
  CreateTransactionDto,
  UpdateTransactionDto,
} from './dto';

export { UpdateDemoLeadDto, CreateInvoiceDto, AddInvoiceReminderDto };

@Controller('admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('demo-leads')
  async listDemoLeads(
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.adminService.listDemoLeads({ status, search, from, to });
  }

  @Patch('demo-leads/:id')
  async updateDemoLead(
    @Param('id') id: string,
    @Body() data: UpdateDemoLeadDto,
  ) {
    return this.adminService.updateDemoLead(id, data);
  }

  // ── INVOICES / FEES ────────────────────────────────────────────────────────

  @Get('invoices')
  async listInvoices() {
    return this.adminService.listInvoices();
  }

  @Get('invoices/:id')
  async getInvoiceById(@Param('id') id: string) {
    return this.adminService.getInvoiceById(id);
  }

  @Post('invoices')
  async createInvoice(
    @Body() body: CreateInvoiceDto,
  ) {
    return this.adminService.createInvoice(body);
  }

  @Post('invoices/:id/pay')
  async markInvoicePaid(
    @Param('id') id: string,
    @Body('method') method?: 'bank' | 'card' | 'cash' | 'ewallet',
  ) {
    return this.adminService.markInvoicePaid(id, method);
  }

  @Patch('invoices/:id/method')
  async updateInvoiceMethod(
    @Param('id') id: string,
    @Body('method') method: 'bank' | 'card' | 'cash' | 'ewallet',
  ) {
    return this.adminService.updateInvoiceMethod(id, method);
  }

  @Post('invoices/:id/reminders')
  async addInvoiceReminder(
    @Param('id') id: string,
    @Body() body: AddInvoiceReminderDto,
  ) {
    return this.adminService.addInvoiceReminder(id, body);
  }

  @Delete('invoices/:id')
  async deleteInvoice(@Param('id') id: string) {
    return this.adminService.deleteInvoice(id);
  }

  // ── CRM NOTIFICATIONS ────────────────────────────────────────────────────────

  @Get('notifications')
  async listNotifications(
    @Request() req,
    @Query('associationId') associationId?: string,
    @Query('appScope') appScope?: string,
  ) {
    return this.adminService.listNotifications(req.user.id, associationId, appScope);
  }

  @Post('notifications')
  async createNotification(
    @Request() req,
    @Body() body: CreateAdminNotificationDto,
  ) {
    return this.adminService.createNotification(req.user.id, body);
  }

  @Patch('notifications/:id')
  async updateNotification(
    @Param('id') id: string,
    @Body() body: UpdateAdminNotificationDto,
  ) {
    return this.adminService.updateNotification(id, body);
  }

  @Post('notifications/:id/send')
  async sendNotification(
    @Param('id') id: string,
  ) {
    return this.adminService.sendNotification(id);
  }

  @Post('notifications/:id/push-messages')
  async pushNotificationToMessages(
    @Request() req,
    @Param('id') id: string,
    @Body('channel') channel?: string,
  ) {
    return this.adminService.pushNotificationToMessages(req.user.id, id, channel);
  }

  @Delete('notifications/:id')
  async deleteNotification(
    @Param('id') id: string,
  ) {
    return this.adminService.deleteNotification(id);
  }

  // ── EMAIL MARKETING CAMPAIGNS ─────────────────────────────────────────

  @Get('campaigns')
  async listCampaigns() {
    return this.adminService.listCampaigns();
  }

  @Post('campaigns')
  async createCampaign(@Body() body: CreateCampaignDto) {
    return this.adminService.createCampaign(body);
  }

  @Delete('campaigns/:id')
  async deleteCampaign(@Param('id') id: string) {
    return this.adminService.deleteCampaign(id);
  }

  // ── TRANSACTIONS / FINANCE ──────────────────────────────────────────

  @Get('transactions')
  async listTransactions(@Query('type') type?: string) {
    return this.adminService.listTransactions(type);
  }

  @Post('transactions')
  async createTransaction(@Body() body: CreateTransactionDto) {
    return this.adminService.createTransaction(body);
  }

  @Patch('transactions/:id')
  async updateTransaction(@Param('id') id: string, @Body() body: UpdateTransactionDto) {
    return this.adminService.updateTransaction(id, body);
  }

  @Delete('transactions/:id')
  async deleteTransaction(@Param('id') id: string) {
    return this.adminService.deleteTransaction(id);
  }

  // ── CRM PERMISSION MATRIX (RBAC) ──────────────────────────────────────────

  @Get('permission-matrix')
  async getPermissionMatrix() {
    return this.adminService.getPermissionMatrix();
  }

  @Put('permission-matrix')
  async savePermissionMatrix(@Request() req: any, @Body() body: any) {
    return this.adminService.savePermissionMatrix(body, req.user?.id);
  }

  // ── ACTIVE ASSOCIATION THEME ──────────────────────────────────────────

  @Get('active-theme')
  async getActiveTheme() {
    return this.adminService.getActiveTheme();
  }

  @Put('active-theme')
  async saveActiveTheme(@Request() req: any, @Body() body: any) {
    return this.adminService.saveActiveTheme(body, req.user?.id);
  }

  // ── DYNAMIC SIDEBAR MENU LABELS ──────────────────────────────────────────

  @Get('sidebar-labels')
  async getSidebarLabels() {
    return this.adminService.getSidebarLabels();
  }

  @Put('sidebar-labels')
  async saveSidebarLabels(@Request() req: any, @Body() body: any) {
    return this.adminService.saveSidebarLabels(body, req.user?.id);
  }

  // ── MEMBER PERMISSION PROFILES (RBAC INDIVIDUAL OVERRIDES) ─────────────────

  @Get('member-permissions')
  async getMemberPermissions() {
    return this.adminService.getMemberPermissions();
  }

  @Put('member-permissions')
  async saveMemberPermissions(@Request() req: any, @Body() body: any) {
    return this.adminService.saveMemberPermissions(body, req.user?.id);
  }

  // ── LUCKY DRAW CONFIGURATION & LANDING BANNER ─────────────────────────────

  @Get('lucky-draw-config')
  async getLuckyDrawConfig() {
    return this.adminService.getLuckyDrawConfig();
  }

  @Put('lucky-draw-config')
  async saveLuckyDrawConfig(@Request() req: any, @Body() body: any) {
    return this.adminService.saveLuckyDrawConfig(body, req.user?.id);
  }
}




