import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { MailService } from './mail.service';

export interface CreateMailTemplateDto {
  code: string;
  name: string;
  category: 'fee' | 'welcome' | 'event' | 'meeting' | 'system';
  description?: string;
  subject: string;
  inAppTitle?: string;
  inAppBody?: string;
  htmlBody: string;
  variables?: Array<{ key: string; label: string; example: string }>;
  channels?: string[];
}

export interface UpdateMailTemplateDto {
  name?: string;
  category?: 'fee' | 'welcome' | 'event' | 'meeting' | 'system';
  description?: string;
  subject?: string;
  inAppTitle?: string;
  inAppBody?: string;
  htmlBody?: string;
  variables?: Array<{ key: string; label: string; example: string }>;
  channels?: string[];
}

export interface SendTestEmailDto {
  to: string;
  subject?: string;
  html?: string;
  templateCode?: string;
  variables?: Record<string, string>;
}

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  /**
   * RESTful GET /api/mail/templates
   * Retrieve all dynamic email templates, optionally filtered by category
   */
  @Get('templates')
  async listTemplates(@Query('category') category?: string) {
    return this.mailService.listTemplates(category);
  }

  /**
   * RESTful GET /api/mail/templates/:id
   * Retrieve a specific email template by id or code
   */
  @Get('templates/:id')
  async getTemplate(@Param('id') id: string) {
    const template = await this.mailService.getTemplate(id);
    if (!template) {
      throw new NotFoundException(`Email template with ID "${id}" not found`);
    }
    return template;
  }

  /**
   * RESTful POST /api/mail/templates
   * Create a new custom dynamic mail template
   */
  @Post('templates')
  async createTemplate(@Body() body: CreateMailTemplateDto) {
    if (!body.code || !body.name || !body.subject || !body.htmlBody) {
      throw new BadRequestException('Missing required fields: code, name, subject, or htmlBody');
    }
    return this.mailService.createTemplate(body);
  }

  /**
   * RESTful PUT /api/mail/templates/:id
   * Replace or full update an existing mail template
   */
  @Put('templates/:id')
  async updateTemplate(
    @Param('id') id: string,
    @Body() body: UpdateMailTemplateDto,
  ) {
    const updated = await this.mailService.updateTemplate(id, body);
    if (!updated) {
      throw new NotFoundException(`Email template with ID "${id}" not found`);
    }
    return updated;
  }

  /**
   * RESTful PATCH /api/mail/templates/:id
   * Partial update an existing mail template
   */
  @Patch('templates/:id')
  async patchTemplate(
    @Param('id') id: string,
    @Body() body: UpdateMailTemplateDto,
  ) {
    const updated = await this.mailService.updateTemplate(id, body);
    if (!updated) {
      throw new NotFoundException(`Email template with ID "${id}" not found`);
    }
    return updated;
  }

  /**
   * RESTful DELETE /api/mail/templates/:id
   * Remove a dynamic mail template
   */
  @Delete('templates/:id')
  async deleteTemplate(@Param('id') id: string) {
    const deleted = await this.mailService.deleteTemplate(id);
    if (!deleted) {
      throw new NotFoundException(`Email template with ID "${id}" not found or cannot be deleted`);
    }
    return { success: true, message: `Email template "${id}" deleted successfully` };
  }

  /**
   * RESTful POST /api/mail/templates/:id/send-test
   * Trigger a test dispatch for a specific template
   */
  @Post('templates/:id/send-test')
  async sendTestByTemplateId(
    @Param('id') id: string,
    @Body() body: { to: string; variables?: Record<string, string> },
  ) {
    if (!body.to) {
      throw new BadRequestException('Recipient "to" email address is required');
    }
    return this.mailService.sendTestByTemplateId(id, body.to, body.variables);
  }

  /**
   * RESTful POST /api/mail/send-test
   * General test email dispatch endpoint
   */
  @Post('send-test')
  async sendTestDirect(@Body() body: SendTestEmailDto) {
    if (!body.to) {
      throw new BadRequestException('Recipient "to" email address is required');
    }
    return this.mailService.sendDirectEmail({
      to: body.to,
      subject: body.subject || '[CEO 1983] Thử nghiệm gửi email hệ thống',
      html: body.html || '<p>Thử nghiệm gửi email thành công từ hệ thống CEO 1983.</p>',
      templateCode: body.templateCode,
    });
  }

  /**
   * RESTful POST /api/mail/send-dynamic
   * Send dynamic email using a template code and variables
   */
  @Post('send-dynamic')
  async sendDynamic(
    @Body()
    body: {
      templateCode: string;
      to: string;
      variables: Record<string, string>;
    },
  ) {
    if (!body.templateCode || !body.to) {
      throw new BadRequestException('Both templateCode and recipient "to" are required');
    }
    return this.mailService.sendDynamic(body.templateCode, body.to, body.variables || {});
  }
}
