import { Controller, Get, Post, Delete, Body, Param, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AiService } from './ai.service';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

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
}
