const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../apps/ceo1983_app_be/src/ai/ai.controller.ts');
let content = fs.readFileSync(file, 'utf8');

const endpointCode = `
  /** POST /api/ai/crm/chat — Trò chuyện Trợ lý AI chuẩn ChatGPT với Live Context CRM & Model Free */
  @Post('crm/chat')
  async crmChat(
    @Request() req: any,
    @Body() body: { message: string; history?: Array<{ role: 'user' | 'assistant'; content: string }>; model?: string }
  ) {
    const res = await this.crmAnalytics.handleChatAssistant(
      req.user?.id || 'admin',
      body.message,
      body.history || [],
      body.model
    );
    return res;
  }
`;

const lastBrace = content.lastIndexOf('}');
if (lastBrace !== -1) {
  content = content.slice(0, lastBrace) + '\n' + endpointCode + '\n}\n';
  fs.writeFileSync(file, content, 'utf8');
  console.log('Successfully added @Post("crm/chat") to ai.controller.ts!');
} else {
  console.error('Ending brace not found');
}

