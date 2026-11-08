/**
 * 46 — Design Pattern Pragmatism: ADAPTER PATTERN
 * Phục vụ Kịch bản 2: Bọc dịch vụ gửi Mail SMTP bằng MailAdapter
 */

export interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  attachments?: Array<{ filename: string; content?: any; path?: string }>;
}

export interface IMailAdapter {
  sendMail(
    options: SendMailOptions,
  ): Promise<{ success: boolean; messageId?: string; error?: string }>;
}

export class NodemailerMailAdapter implements IMailAdapter {
  constructor(private readonly mailServiceInstance?: any) {}

  async sendMail(
    options: SendMailOptions,
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      if (
        this.mailServiceInstance &&
        typeof this.mailServiceInstance.sendMailRaw === 'function'
      ) {
        const res = await this.mailServiceInstance.sendMailRaw(options);
        return { success: true, messageId: res?.messageId };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || String(err) };
    }
  }
}
