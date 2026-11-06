import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { PrismaClient } from '@vibe/db';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super();
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('✅ [PrismaService] Kết nối cơ sở dữ liệu Prisma thành công.');

      // Đảm bảo bảng app_settings luôn sẵn sàng cho RBAC Ma trận phân quyền và cấu hình hệ thống
      await this.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS public.app_settings (
          key TEXT PRIMARY KEY,
          value JSONB NOT NULL DEFAULT '{}'::jsonb,
          updated_by UUID,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
      `).catch(() => {});

      // Đảm bảo các bảng lưu trữ tương tác Zalo OA và mapping hội viên luôn sẵn sàng
      await this.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS public.zalo_subscribers (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          zalo_user_id TEXT UNIQUE NOT NULL,
          display_name TEXT,
          avatar_url TEXT,
          phone TEXT,
          member_id TEXT,
          last_message TEXT,
          last_interacted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        CREATE TABLE IF NOT EXISTS public.zalo_webhook_logs (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          event_name TEXT,
          sender_id TEXT,
          recipient_id TEXT,
          message_text TEXT,
          raw_payload JSONB,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        ALTER TABLE public.members ADD COLUMN IF NOT EXISTS zalo_user_id TEXT;
        ALTER TABLE public.members ADD COLUMN IF NOT EXISTS avatar_url TEXT;
        ALTER TABLE public.members ADD COLUMN IF NOT EXISTS business_card_slug TEXT;

        ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS folder_id TEXT;
        ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS is_folder BOOLEAN DEFAULT FALSE;
        ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS drive_url TEXT;
        ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS share_scope TEXT DEFAULT 'public';
        ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS share_role TEXT DEFAULT 'viewer';
        ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS shared_with JSONB DEFAULT '[]'::jsonb;
        ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS is_starred BOOLEAN DEFAULT FALSE;
        ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS color_tag TEXT;
        ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS description TEXT;
        ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS doc_scope TEXT DEFAULT 'association';
        ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS enterprise_name TEXT;
      `).catch(() => {});
    } catch (err: any) {
      this.logger.warn(
        `⚠️ [PrismaService] Chưa thể kết nối cơ sở dữ liệu khi khởi động (${err?.message || err}). Tiến trình sẽ tiếp tục chạy và tự động tái kết nối khi CSDL sẵn sàng.`,
      );
    }
  }

  async onModuleDestroy() {
    try {
      await this.$disconnect();
    } catch {}
  }
}
