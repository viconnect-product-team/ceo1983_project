/**
 * 46 — Design Pattern Pragmatism: ADAPTER PATTERN
 * Phục vụ Kịch bản 2: Bọc Zalo OA & ZNS bằng ZaloAdapter
 */

export interface SendZaloNotificationParams {
  phone: string;
  templateId: string;
  templateData: Record<string, any>;
  trackingId?: string;
}

export interface IZaloAdapter {
  sendZns(
    params: SendZaloNotificationParams,
  ): Promise<{ success: boolean; msgId?: string; error?: string }>;
  sendOaMessage(
    userId: string,
    text: string,
  ): Promise<{ success: boolean; msgId?: string; error?: string }>;
}

export class ZaloOaAdapter implements IZaloAdapter {
  constructor(private readonly zaloServiceInstance?: any) {}

  async sendZns(
    params: SendZaloNotificationParams,
  ): Promise<{ success: boolean; msgId?: string; error?: string }> {
    try {
      if (
        this.zaloServiceInstance &&
        typeof this.zaloServiceInstance.sendZns === 'function'
      ) {
        const res = await this.zaloServiceInstance.sendZns(
          params.phone,
          params.templateId,
          params.templateData,
        );
        return { success: true, msgId: res?.message_id };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || String(err) };
    }
  }

  async sendOaMessage(
    userId: string,
    text: string,
  ): Promise<{ success: boolean; msgId?: string; error?: string }> {
    try {
      if (
        this.zaloServiceInstance &&
        typeof this.zaloServiceInstance.sendDirectMessage === 'function'
      ) {
        const res = await this.zaloServiceInstance.sendDirectMessage(
          userId,
          text,
        );
        return { success: true, msgId: res?.message_id };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || String(err) };
    }
  }
}
