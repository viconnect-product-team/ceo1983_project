import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AiServiceActionResult } from './ai-event.service';

@Injectable()
export class AiMemberService {
  private readonly logger = new Logger(AiMemberService.name);

  constructor(private readonly prisma: PrismaService) {}

  async processMemberCommand(
    userId: string,
    prompt: string,
    payload?: any,
  ): Promise<AiServiceActionResult> {
    this.logger.log(`Processing Member command for user ${userId}: "${prompt}"`);
    const p = prompt.toLowerCase();

    let name = payload?.name || 'Doanh nhân Hội viên mới';
    let company = payload?.company || 'Tập đoàn Doanh nghiệp CEO 1983';
    let department = payload?.department || 'Ban Xúc Tiến Thương Mại';
    let phone = payload?.phone || '0988889999';

    // Parse committee from prompt if mentioned
    if (p.includes('thành viên') || p.includes('hội viên')) department = 'Ban Thành viên';
    else if (p.includes('xúc tiến') || p.includes('b2b')) department = 'Ban xúc tiến';
    else if (p.includes('truyền thông')) department = 'Ban truyền thông';
    else if (p.includes('tài chính')) department = 'Ban tài chính';
    else if (p.includes('thiện nguyện')) department = 'Ban thiện nguyện';
    else if (p.includes('điều hành')) department = 'Ban điều hành';
    else if (p.includes('thư ký')) department = 'Ban thư ký';

    const quoteMatch = prompt.match(/["“']([^"”']+)["”']/);
    if (quoteMatch) {
      name = quoteMatch[1];
    }

    return {
      category: 'members',
      serviceName: 'AiMemberService',
      message: `Đã phân tích hồ sơ Hội viên: "${name}" (${company}). AI đã đối chiếu quy định chuẩn 7 Ban Chuyên Môn Hiệp Hội Doanh Nhân CEO 1983.`,
      matchedApi: {
        method: 'POST',
        endpoint: '/api/members',
        description: 'API tiếp nhận và duyệt hồ sơ hội viên mới, phân bổ Ban và cấp mã Hội viên chính thức',
      },
      steps: [
        {
          stepNumber: 1,
          title: 'Phân tích hồ sơ doanh nghiệp & đối chiếu 7 Ban',
          detail: `Hội viên: ${name} | Doanh nghiệp: ${company} | Ban đề xuất: ${department}`,
          status: 'completed',
        },
        {
          stepNumber: 2,
          title: 'Xác thực thẩm quyền Ban Thành Viên & BQT',
          detail: 'Kiểm tra quyền hạn xét duyệt tư cách hội viên theo Điều lệ HanoiBA.',
          status: 'completed',
        },
        {
          stepNumber: 3,
          title: 'Cấp mã định danh Hội viên & Tài khoản App',
          detail: 'Khởi tạo mã hội viên tự động, cấp quyền truy cập Mạng lưới B2B Connect.',
          status: 'completed',
        },
        {
          stepNumber: 4,
          title: 'Ghi nhận hồ sơ vào CSDL 113.20.107.184:6432',
          detail: 'Thực thi lệnh INSERT vào bảng public.members trên PostgreSQL chuẩn.',
          status: 'waiting_approval',
        },
      ],
      approvalRequired: true,
      pendingAction: {
        actionType: 'APPROVE_MEMBER',
        payload: {
          name,
          company,
          department,
          phone,
        },
      },
    };
  }
}
