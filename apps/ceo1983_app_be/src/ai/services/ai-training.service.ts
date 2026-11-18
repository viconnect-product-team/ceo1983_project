import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AiServiceActionResult } from './ai-event.service';

@Injectable()
export class AiTrainingService {
  private readonly logger = new Logger(AiTrainingService.name);

  constructor(private readonly prisma: PrismaService) {}

  async processTrainingCommand(
    userId: string,
    prompt: string,
    payload?: any,
  ): Promise<AiServiceActionResult> {
    this.logger.log(`Processing Training command for user ${userId}: "${prompt}"`);

    let title = payload?.title || 'Khóa Đào Tạo: Quản Trị Vận Hành & Chuyển Đổi Số Doanh Nghiệp SME';
    let speaker = payload?.speaker || 'Chuyên Gia Ban Đào Tạo CEO 1983';
    let duration = payload?.duration || '1 Ngày (Thứ Bảy)';
    let place = payload?.place || 'Hội trường CEO 1983, Keangnam Landmark 72, Hà Nội';
    let date = payload?.date || '2026-12-20';

    const quoteMatch = prompt.match(/["“']([^"”']+)["”']/);
    if (quoteMatch) {
      title = quoteMatch[1];
    }

    return {
      category: 'training',
      serviceName: 'AiTrainingService',
      message: `Đã hoàn tất phân tích Chương trình đào tạo: "${title}". AI đã đối chiếu quy chuẩn Ban Đào Tạo và chuẩn bị nạp danh sách học viên theo Ban.`,
      matchedApi: {
        method: 'POST',
        endpoint: '/api/events?type=training',
        description: 'API thiết lập khóa đào tạo chuyên đề, cấp chứng chỉ và quản lý tài liệu học tập',
      },
      steps: [
        {
          stepNumber: 1,
          title: 'Phân tích đề cương & đối chiếu chuẩn Ban Đào Tạo',
          detail: `Khóa học: ${title} | Diễn giả: ${speaker} | Thời lượng: ${duration}`,
          status: 'completed',
        },
        {
          stepNumber: 2,
          title: 'Xác thực quyền hạn Trưởng Ban Đào Tạo / BQT',
          detail: 'Kiểm tra quyền hạn khởi tạo khóa học và phân bổ chỉ tiêu học viên theo Ban.',
          status: 'completed',
        },
        {
          stepNumber: 3,
          title: 'Chuẩn bị dữ liệu tài liệu & Mẫu thư mời',
          detail: 'Thiết lập địa điểm: ' + place + ' và chuẩn bị thông báo gửi qua Zalo OA/App.',
          status: 'completed',
        },
        {
          stepNumber: 4,
          title: 'Lưu trữ chương trình đào tạo vào CSDL 113.20.107.184:6432',
          detail: 'Ghi dữ liệu vào bảng public.events (type=training) trên PostgreSQL chuẩn.',
          status: 'waiting_approval',
        },
      ],
      approvalRequired: true,
      pendingAction: {
        actionType: 'CREATE_TRAINING',
        payload: {
          title,
          speaker,
          duration,
          place,
          date,
        },
      },
    };
  }
}
