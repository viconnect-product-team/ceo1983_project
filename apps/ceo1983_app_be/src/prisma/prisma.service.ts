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
