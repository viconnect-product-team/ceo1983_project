import { Controller, Get, Post, Delete, Body, Param, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AiService } from './ai.service';
import { AiCrmAnalyticsService } from './ai-crm-analytics.service';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(
    private readonly aiService: AiService,
    private readonly crmAnalytics: AiCrmAnalyticsService,
  ) {}

  /** GET /api/ai/live-context — Ngữ cảnh động tài khoản phiên đăng nhập */
  @Get('live-context')
  async getLiveContext(@Request() req: any) {
    return this.aiService.getLiveMemberAssistantContext(req.user.id);
  }

  /** POST /api/ai/ask — Hỏi đáp Trợ lý AI (Google Gemini 2.0 Flash / Smart Hybrid) */
  @Post('ask')
  async askAssistant(@Request() req: any, @Body() body: { prompt: string; clientContext?: any }) {
    const res = await this.aiService.askAssistant(req.user.id, body.prompt, body.clientContext);
    return { ok: true, data: res };
  }

  /** POST /api/ai/ask-voice — Hỏi đáp bằng giọng nói (nhận file audio base64) */
  @Post('ask-voice')
  async askVoiceAssistant(
    @Request() req: any,
    @Body() body: { audioBase64?: string; mimeType?: string; prompt?: string; clientContext?: any },
  ) {
    const res = await this.aiService.askVoiceAssistant(
      req.user.id,
      body.audioBase64,
      body.mimeType,
      body.prompt,
      body.clientContext,
    );
    return { ok: true, data: res };
  }

  /** GET /api/ai/roles — Roles của user hiện tại (cho phân quyền AI) */
  @Get('roles')
  async getRoles(@Request() req: any) {
    return this.aiService.getUserRoles(req.user.id);
  }

  /** GET /api/ai/settings/provider — Đọc cấu hình AI provider */
  @Get('settings/provider')
  async getProviderSetting() {
    return this.aiService.getAiProviderSetting();
  }

  /** POST /api/ai/audit — Ghi audit log (metadata only, không ghi prompt/answer) */
  @Post('audit')
  async insertAudit(@Request() req: any, @Body() body: {
    requestId: string;
    associationId?: string | null;
    capability: string;
    permissionLevel: string;
    provider: string;
    model?: string | null;
    usedFallback?: boolean;
    fallbackReason?: string | null;
    providerLatencyMs?: number;
    totalLatencyMs?: number;
    sourceTypes?: string[];
    sourceCount?: number;
    action?: string;
    target?: string;
  }) {
    await this.aiService.insertAiAudit({
      requestId: body.requestId,
      userId: req.user.id,
      associationId: body.associationId ?? null,
      capability: body.capability ?? 'unknown',
      permissionLevel: body.permissionLevel ?? 'member',
      provider: body.provider ?? 'unknown',
      model: body.model ?? null,
      usedFallback: body.usedFallback ?? false,
      fallbackReason: body.fallbackReason ?? null,
      providerLatencyMs: body.providerLatencyMs ?? 0,
      totalLatencyMs: body.totalLatencyMs ?? 0,
      sourceTypes: body.sourceTypes ?? [],
      sourceCount: body.sourceCount ?? 0,
    });

    if (body.action) {
      await this.aiService.logActivity({
        userId: req.user.id,
        action: body.action,
        target: body.target ?? '',
        category: 'ai',
      });
    }

    return { ok: true };
  }

  /** GET /api/ai/activity-log — Danh sách activity log */
  @Get('activity-log')
  async listActivityLog() {
    return this.aiService.listActivityLog();
  }

  /** DELETE /api/ai/activity-log/:id — Xóa một entry */
  @Delete('activity-log/:id')
  async deleteActivityLog(@Param('id') id: string) {
    await this.aiService.deleteActivityLog(id);
    return { ok: true };
  }

  /** POST /api/ai/activity-log/clear — Xóa toàn bộ */
  @Post('activity-log/clear')
  async clearActivityLog() {
    await this.aiService.clearActivityLog();
    return { ok: true };
  }

  // ==========================================
  // AI QUOTA & USER MANAGEMENT (50 QUESTIONS LIMIT)
  // ==========================================

  /** GET /api/ai/quota — Lấy hạn mức 50 câu hỏi của tài khoản hiện tại */
  @Get('quota')
  async getMyQuota(@Request() req: any) {
    const quota = await this.aiService.getUserQuota(req.user.id);
    return { ok: true, data: quota };
  }

  /** POST /api/ai/quota/record — Ghi nhận 1 câu hỏi và kiểm tra hạn mức */
  @Post('quota/record')
  async recordQuestion(@Request() req: any, @Body() body: { question?: string }) {
    const result = await this.aiService.checkAndIncrementUserQuota(req.user.id, body.question);
    return { ok: result.allowed, data: result.quota };
  }

  /** GET /api/ai/admin/users — Danh sách người dùng, thống kê và tình trạng hạn mức AI */
  @Get('admin/users')
  async listUsersAiUsage(@Request() req: any) {
    const search = req.query?.search as string | undefined;
    const status = req.query?.status as string | undefined;
    const res = await this.aiService.listUsersAiUsage({ search, status });
    return { ok: true, data: res };
  }

  /** POST /api/ai/admin/users/reset — Cấp thêm câu hỏi hoặc đặt lại về 0 */
  @Post('admin/users/reset')
  async resetOrAdjustUserQuota(
    @Request() req: any,
    @Body() body: { userId: string; resetCount?: boolean; addExtra?: number; newLimit?: number; unblock?: boolean }
  ) {
    const res = await this.aiService.resetOrAdjustUserQuota(body.userId, body);
    return res;
  }

  /** POST /api/ai/admin/users/block — Khóa hoặc mở khóa quyền AI của người dùng */
  @Post('admin/users/block')
  async toggleBlockUserAi(
    @Request() req: any,
    @Body() body: { userId: string; blocked: boolean }
  ) {
    const res = await this.aiService.toggleBlockUserAi(body.userId, body.blocked);
    return res;
  }

  // ==========================================
  // SYSTEM AI CONFIGURATION & AUDIT LOGS
  // ==========================================

  /** GET /api/ai/system-config — Lấy cấu hình đa model AI & cảnh báo hạn mức */
  @Get('system-config')
  async getSystemConfig() {
    const config = await this.crmAnalytics.getSystemConfig();
    return { ok: true, data: config };
  }

  /** POST /api/ai/system-config — Lưu cấu hình đa model AI & fallback */
  @Post('system-config')
  async saveSystemConfig(@Request() req: any, @Body() body: any) {
    const res = await this.crmAnalytics.saveSystemConfig(body, req.user?.id);
    return res;
  }

  /** POST /api/ai/test-connection — Kiểm tra kết nối model */
  @Post('test-connection')
  async testConnection(@Body() body: { provider: string; apiKey?: string; model?: string }) {
    const res = await this.crmAnalytics.testConnection(body.provider, body.apiKey, body.model);
    return res;
  }

  /** GET /api/ai/system-logs — Lấy danh sách nhật ký thao tác AI */
  @Get('system-logs')
  async getSystemLogs() {
    const logs = await this.crmAnalytics.getSystemLogs();
    return { ok: true, data: logs };
  }

  // ==========================================
  // CRM EXECUTIVE AI & SUB-REPORTS
  // ==========================================

  /** GET /api/ai/crm/analyze — Phân tích toàn diện CRM realtime */
  @Get('crm/analyze')
  async analyzeCrmData(@Request() req: any) {
    const res = await this.crmAnalytics.analyzeCrmData(req.user.id);
    return { ok: true, data: res };
  }

  /** POST /api/ai/crm/export-report — Xuất báo cáo theo chức năng con (thu chi, hóa đơn/phiếu thu) */
  @Post('crm/export-report')
  async exportSubReport(
    @Request() req: any,
    @Body() body: { type: 'financial_summary' | 'invoice' | 'receipt' | 'events_report'; options?: any }
  ) {
    const res = await this.crmAnalytics.exportSubReport(req.user.id, body.type, body.options);
    return res;
  }
}
