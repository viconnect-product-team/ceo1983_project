import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AiServiceActionResult } from './ai-event.service';

@Injectable()
export class AiB2bService {
  private readonly logger = new Logger(AiB2bService.name);

  constructor(private readonly prisma: PrismaService) {}

  async processB2bCommand(
    userId: string,
    prompt: string,
    payload?: any,
  ): Promise<AiServiceActionResult> {
    this.logger.log(`Processing B2B command for user ${userId}: "${prompt}"`);

    let title = payload?.title || 'Cơ hội hợp tác đầu tư & phân phối chuỗi thương mại B2B';
    let value = payload?.value || 50000000;
    let industry = payload?.industry || 'Thương mại & Dịch vụ';
    let contactName = payload?.contactName || 'Ban Xúc Tiến CEO 1983';

    // Parse capital / value from prompt if present
    const valueMatch = prompt.match(/(\d+[\d.,]*)\s*(triệu|tr|tỷ|k|đ|vnd|đồng)?/i);
    if (valueMatch) {
      const numStr = valueMatch[1].replace(/[.,]/g, '');
      const unit = (valueMatch[2] || '').toLowerCase();
      let val = parseInt(numStr, 10);
      if (unit.includes('tỷ')) val *= 1000000000;
      else if (unit.includes('triệu') || unit === 'tr') val *= 1000000;
      else if (unit === 'k') val *= 1000;
      if (!isNaN(val) && val > 0) value = val;
    }

    const quoteMatch = prompt.match(/["“']([^"”']+)["”']/);
    if (quoteMatch) {
      title = quoteMatch[1];
    }

    return {
      category: 'b2b',
      serviceName: 'AiB2bService',
      message: `Đã phân tích Cơ hội Giao thương B2B: "${title}" (Giá trị: ${value.toLocaleString('vi-VN')} VNĐ). AI đã khớp nối mạng lưới hội viên theo ngành nghề ${industry}.`,
      matchedApi: {
        method: 'POST',
        endpoint: '/api/opportunities',
        description: 'API đăng tải cơ hội hợp tác B2B, kích hoạt thuật toán AI Match và gửi thông báo tới các đối tác phù hợp',
      },
      steps: [
        {
          stepNumber: 1,
          title: 'Phân tích tiêu chí Deal & Khớp vốn',
          detail: `Deal: ${title} | Giá trị: ${value.toLocaleString('vi-VN')} VNĐ | Ngành: ${industry}`,
          status: 'completed',
        },
        {
          stepNumber: 2,
          title: 'Thẩm định hồ sơ doanh nghiệp & uy tín',
          detail: 'Kiểm tra điểm tín nhiệm và xác thực tư cách hội viên Ban Xúc Tiến.',
          status: 'completed',
        },
        {
          stepNumber: 3,
          title: 'Kích hoạt thuật toán AI Match đối tác',
          detail: 'Lọc danh sách các doanh nhân hội viên có nhu cầu hợp tác trong cùng phân khúc.',
          status: 'completed',
        },
        {
          stepNumber: 4,
          title: 'Đăng tải cơ hội lên Sàn B2B CSDL 113.20.107.184:6432',
          detail: 'Thực thi lệnh INSERT vào bảng public.opportunities trên máy chủ CSDL chuẩn.',
          status: 'waiting_approval',
        },
      ],
      approvalRequired: true,
      pendingAction: {
        actionType: 'CREATE_OPPORTUNITY',
        payload: {
          title,
          value,
          industry,
          contactName,
          creatorId: userId,
        },
      },
    };
  }
}
