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
import {
  MembersService,
  CreateMemberDto,
  UpdateMemberDto,
  UpdateMemberContactDto,
} from './members.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';

@Controller('members')
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  /**
   * Endpoint đăng ký công khai dạng Google Form (không cần đăng nhập)
   */
  @Post('public-register')
  async publicRegister(@Body() body: any) {
    return this.membersService.publicRegister(body);
  }

  /**
   * Endpoint duyệt hội viên mới và gửi email tài khoản ngẫu nhiên
   */
  @UseGuards(JwtAuthGuard)
  @Post(':id/approve-and-send-credentials')
  async approveMemberAndSendCredentials(@Request() req: any, @Param('id') id: string) {
    const adminUserId = req.user?.id || req.user?.sub || 'system';
    return this.membersService.approveMemberAndSendCredentials(adminUserId, id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/approve-and-send-credentials')
  async approveMemberAndSendCredentialsPatch(@Request() req: any, @Param('id') id: string) {
    const adminUserId = req.user?.id || req.user?.sub || 'system';
    return this.membersService.approveMemberAndSendCredentials(adminUserId, id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/approve-with-credentials')
  async approveMemberWithCredentialsPost(@Request() req: any, @Param('id') id: string) {
    const adminUserId = req.user?.id || req.user?.sub || 'system';
    return this.membersService.approveMemberAndSendCredentials(adminUserId, id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/approve-with-credentials')
  async approveMemberWithCredentialsPatch(@Request() req: any, @Param('id') id: string) {
    const adminUserId = req.user?.id || req.user?.sub || 'system';
    return this.membersService.approveMemberAndSendCredentials(adminUserId, id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('directory')
  async listDirectory(@Request() req: any) {
    return this.membersService.listDirectory(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMyMember(@Request() req: any) {
    return this.membersService.getMyMember(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  async updateMyMemberPatch(@Request() req: any, @Body() body: any) {
    if (body.coverUrl && !body.name && !body.avatar) {
      return this.membersService.updateMyCover(req.user.id, body.coverUrl);
    }
    if (body.coverUrl) {
      await this.membersService.updateMyCover(req.user.id, body.coverUrl).catch(() => null);
    }
    return this.membersService.updateMyProfile(req.user.id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Put('me')
  async updateMyMemberPut(@Request() req: any, @Body() body: any) {
    return this.updateMyMemberPatch(req, body);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me/cover')
  async updateMyCoverPatch(@Request() req: any, @Body() body: { coverUrl: string }) {
    return this.membersService.updateMyCover(req.user.id, body.coverUrl);
  }

  @UseGuards(JwtAuthGuard)
  @Post('me/cover')
  async updateMyCoverPost(@Request() req: any, @Body() body: { coverUrl: string }) {
    return this.membersService.updateMyCover(req.user.id, body.coverUrl);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me/profile')
  async updateMyProfilePatch(@Request() req: any, @Body() body: any) {
    return this.membersService.updateMyProfile(req.user.id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Post('me/profile')
  async updateMyProfilePost(@Request() req: any, @Body() body: any) {
    return this.membersService.updateMyProfile(req.user.id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/context')
  async getMyMemberContext(@Request() req: any) {
    return this.membersService.getMyMemberContext(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/membership')
  async getMyMembership(@Request() req: any) {
    return this.membersService.getMyMembership(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/history')
  async getMyMemberHistory(@Request() req: any) {
    return this.membersService.getMyMemberHistory(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/renewal-history')
  async getMyRenewalHistory(@Request() req: any) {
    return this.membersService.getMyRenewalHistory(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/renewal-quote')
  async getRenewalQuote(@Request() req: any) {
    return this.membersService.getRenewalQuote(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('me/renewal-payment')
  async payMyRenewal(@Request() req: any, @Body() body: any) {
    return this.membersService.payMyRenewal(req.user.id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/renewal-audit')
  async getMyRenewalAuditLog(@Request() req: any) {
    return this.membersService.getMyRenewalAuditLog(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/linkable')
  async listLinkableMembers(@Request() req: any) {
    return this.membersService.listLinkableMembers(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('me/link')
  async linkMyMemberProfile(@Request() req: any, @Body('memberId') memberId: string) {
    return this.membersService.linkMyMemberProfile(req.user.id, memberId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('me/unlink')
  async unlinkMyMemberProfile(@Request() req: any, @Body('memberId') memberId: string) {
    return this.membersService.unlinkMyMemberProfile(req.user.id, memberId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('brand')
  async getMyAssociationBrand(@Request() req: any) {
    return this.membersService.getMyAssociationBrand(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('benefits')
  async getMyBenefits(@Request() req: any) {
    return this.membersService.getMyBenefits(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('benefits/admin')
  async listAllBenefits(@Request() req: any) {
    return this.membersService.listAllBenefits(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('benefits/admin')
  async createBenefit(@Request() req: any, @Body() body: any) {
    return this.membersService.createBenefit(req.user.id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Put('benefits/admin/:id')
  async updateBenefit(@Request() req: any, @Param('id') id: string, @Body() body: any) {
    return this.membersService.updateBenefit(req.user.id, id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('benefits/admin/:id')
  async deleteBenefit(@Request() req: any, @Param('id') id: string) {
    return this.membersService.deleteBenefit(req.user.id, id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('active-association-id')
  async getActiveAssociationId(@Request() req: any) {
    return this.membersService.getActiveAssociationId(req.user.id);
  }

  @Get('account-statuses')
  async getAccountStatuses() {
    return this.membersService.getAccountStatuses();
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get()
  async listMembers(
    @Request() req: any,
    @Query('q') q?: string,
    @Query('type') type?: string,
    @Query('industry') industry?: string,
    @Query('region') region?: string,
    @Query('status') status?: string,
    @Query('associationId') associationId?: string,
  ) {
    const userId = req.user?.id || '00000000-0000-0000-0000-000000000000';
    return this.membersService.listMembers(userId, {
      q,
      type,
      industry,
      region,
      status,
      associationId,
    });
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get(':id/history')
  async getMemberHistory(@Request() req: any, @Param('id') id: string) {
    const userId = req.user?.id || '00000000-0000-0000-0000-000000000000';
    return this.membersService.getMemberHistory(userId, id);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get(':id')
  async getMemberById(@Request() req: any, @Param('id') id: string) {
    const userId = req.user?.id || '00000000-0000-0000-0000-000000000000';
    return this.membersService.getMemberById(userId, id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async createMember(@Request() req: any, @Body() body: CreateMemberDto) {
    return this.membersService.createMember(req.user.id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async updateMember(
    @Request() req: any,
    @Param('id') id: string,
    @Body() body: UpdateMemberDto,
  ) {
    return this.membersService.updateMember(req.user.id, id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/contact')
  async updateMemberContact(
    @Request() req: any,
    @Param('id') id: string,
    @Body() body: UpdateMemberContactDto,
  ) {
    return this.membersService.updateMemberContact(req.user.id, id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/role-dept')
  async updateMemberRoleDept(
    @Request() req: any,
    @Param('id') id: string,
    @Body() body: { executiveRole: string; department: string; associationId?: string },
  ) {
    return this.membersService.updateMemberRoleDept(req.user?.id, id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/role-dept')
  async updateMemberRoleDeptPost(
    @Request() req: any,
    @Param('id') id: string,
    @Body() body: { executiveRole: string; department: string; associationId?: string },
  ) {
    return this.membersService.updateMemberRoleDept(req.user?.id, id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/renew')
  async renewMember(@Request() req: any, @Param('id') id: string) {
    return this.membersService.renewMember(req.user.id, id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/renew')
  async renewMemberPost(@Request() req: any, @Param('id') id: string) {
    return this.membersService.renewMember(req.user.id, id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/payment-status')
  async updatePaymentStatus(
    @Request() req: any,
    @Param('id') id: string,
    @Body() body: { paymentStatus: string; feePaid?: boolean; feeYear?: number },
  ) {
    return this.membersService.updatePaymentStatus(req.user.id, id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/payment-status')
  async updatePaymentStatusPost(
    @Request() req: any,
    @Param('id') id: string,
    @Body() body: { paymentStatus: string; feePaid?: boolean; feeYear?: number },
  ) {
    return this.membersService.updatePaymentStatus(req.user.id, id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/remind')
  async sendReminder(@Request() req: any, @Param('id') id: string, @Body() body?: { isAuto?: boolean }) {
    return this.membersService.sendRenewalReminder(req.user.id, id, Boolean(body?.isAuto));
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/remind')
  async sendReminderPost(@Request() req: any, @Param('id') id: string, @Body() body?: { isAuto?: boolean }) {
    return this.membersService.sendRenewalReminder(req.user.id, id, Boolean(body?.isAuto));
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteMember(@Request() req: any, @Param('id') id: string) {
    return this.membersService.deleteMember(req.user.id, id);
  }
}

