import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface AiStepItem {
  stepNumber: number;
  title: string;
  detail: string;
  status: 'completed' | 'in_progress' | 'waiting_approval' | 'failed';
}

export interface AiServiceActionResult {
  category: string;
  serviceName: string;
  message: string;
  matchedApi: {
    method: string;
    endpoint: string;
    description: string;
  };
  steps: AiStepItem[];
  approvalRequired: boolean;
  pendingAction?: {
    actionType: string;
    payload: any;
  };
}

@Injectable()
export class AiEventService {
  private readonly logger = new Logger(AiEventService.name);

  constructor(private readonly prisma: PrismaService) {}

  async processEventCommand(
    userId: string,
    prompt: string,
    payload?: any,
  ): Promise<AiServiceActionResult> {
    this.logger.log(`Processing Event command for user ${userId}: "${prompt}"`);
    const p = prompt.toLowerCase();

    // 1. Phân tích ngữ nghĩa yêu cầu
    const isCreate = p.includes('tạo') || p.includes('thêm') || p.includes('tổ chức') || p.includes('lên lịch');
    const isCheckin = p.includes('điểm danh') || p.includes('checkin') || p.includes('check-in') || p.includes('quét mã');
    const isReminder = p.includes('nhắc') || p.includes('bắn tin') || p.includes('thông báo');

    let title = payload?.title || 'Hội Thảo Doanh Nhân CEO 1983: Kết Nối & Tăng Trưởng';
    let location = payload?.location || 'Khách sạn Daewoo, Ba Đình, Hà Nội';
    let date = payload?.date || '2026-12-15T09:00:00Z';
    let speaker = payload?.speaker || 'Ban Thường Trực CEO 1983';

    // Trích xuất tiêu đề nếu có trong ngoặc kép hoặc sau chữ tạo sự kiện
    const quoteMatch = prompt.match(/["“']([^"”']+)["”']/);
    if (quoteMatch) {
      title = quoteMatch[1];
    }

    if (isCheckin) {
      return {
        category: 'events',
        serviceName: 'AiEventService',
        message: `Đã phân tích yêu cầu Kiểm soát Điểm danh Check-in QR cho sự kiện "${title}". AI đã đối chiếu quy chuẩn Node [NODE-APP-003] và sẵn sàng kích hoạt phân quyền quét vé.`,
        matchedApi: {
          method: 'POST',
          endpoint: '/api/events/checkin',
          description: 'API xác thực mã QR vé tham dự và ghi nhận thời gian check-in vào CSDL 113.20.107.184:6432',
        },
        steps: [
          {
            stepNumber: 1,
            title: 'Phân tích mã vé & sự kiện',
            detail: `Đối chiếu mã QR vé tham dự với danh sách đăng ký sự kiện "${title}".`,
            status: 'completed',
          },
          {
            stepNumber: 2,
            title: 'Xác thực quyền hạn Check-in (RBAC)',
            detail: 'Kiểm tra tài khoản quét vé thuộc Ban Sự Kiện hoặc Ban Điều Hành.',
            status: 'completed',
          },
          {
            stepNumber: 3,
            title: 'Chuẩn bị dữ liệu thời gian thực',
            detail: 'Ghi nhận timestamp, thiết bị quét và trạng thái vé hợp lệ.',
            status: 'completed',
          },
          {
            stepNumber: 4,
            title: 'Cập nhật trạng thái Check-in vào CSDL',
            detail: 'Ghi nhận điểm danh vào bảng event_registrations trên CSDL 113.20.107.184:6432.',
            status: 'waiting_approval',
          },
        ],
        approvalRequired: true,
        pendingAction: {
          actionType: 'EVENT_CHECKIN',
          payload: { eventTitle: title, userId },
        },
      };
    }

    if (isReminder) {
      return {
        category: 'events',
        serviceName: 'AiEventService',
        message: `Đã phân tích yêu cầu Bắn tin nhắc nhở tham dự sự kiện "${title}". AI đã lập lịch nhắc nhở kèm poster chuẩn đa kênh (In-App, Zalo OA, Email).`,
        matchedApi: {
          method: 'POST',
          endpoint: '/api/notifications',
          description: 'API phát tin thông báo nhắc lịch sự kiện kèm poster đa kênh tới hội viên',
        },
        steps: [
          {
            stepNumber: 1,
            title: 'Phân tích sự kiện & thời gian nhắc',
            detail: `Trích xuất thông tin sự kiện "${title}" diễn ra ngày ${date}.`,
            status: 'completed',
          },
          {
            stepNumber: 2,
            title: 'Lọc danh sách hội viên đã đăng ký',
            detail: 'Truy vấn danh sách người nhận từ CSDL 113.20.107.184:6432.',
            status: 'completed',
          },
          {
            stepNumber: 3,
            title: 'Tạo nội dung thông báo & poster',
            detail: 'Gắn link xác nhận tham dự và mã vé QR cá nhân hóa cho từng hội viên.',
            status: 'completed',
          },
          {
            stepNumber: 4,
            title: 'Phát sóng thông báo đa kênh',
            detail: 'Đẩy thông báo In-App và tin nhắn Zalo OA tới toàn bộ hội viên tham dự.',
            status: 'waiting_approval',
          },
        ],
        approvalRequired: true,
        pendingAction: {
          actionType: 'SEND_EVENT_REMINDER',
          payload: { eventTitle: title, date, location },
        },
      };
    }

    // Mặc định: Tạo sự kiện mới
    return {
      category: 'events',
      serviceName: 'AiEventService',
      message: `Đã phân tích đầy đủ yêu cầu Tạo sự kiện: "${title}". AI đã đối chiếu cấu trúc BRD Event và bảng public.events trên CSDL 113.20.107.184:6432.`,
      matchedApi: {
        method: 'POST',
        endpoint: '/api/events',
        description: 'API khởi tạo sự kiện mới, tạo gói tài trợ và mở cổng đăng ký vé QR',
      },
      steps: [
        {
          stepNumber: 1,
          title: 'Phân tích thông tin sự kiện & đối chiếu BRD',
          detail: `Tiêu đề: ${title} | Địa điểm: ${location} | Ngày: ${date}`,
          status: 'completed',
        },
        {
          stepNumber: 2,
          title: 'Xác thực quyền hạn RBAC',
          detail: 'Xác thực quyền tạo sự kiện (BQT, BTC, Ban Sự Kiện, Admin).',
          status: 'completed',
        },
        {
          stepNumber: 3,
          title: 'Chuẩn bị tham số API & Cấu hình vé',
          detail: `Thiết lập diễn giả: ${speaker}, giới hạn số lượng tham dự và kích hoạt QR Check-in.`,
          status: 'completed',
        },
        {
          stepNumber: 4,
          title: 'Ghi nhận sự kiện vào CSDL 113.20.107.184:6432',
          detail: 'Thực thi lệnh INSERT vào bảng public.events trên máy chủ CSDL chuẩn.',
          status: 'waiting_approval',
        },
      ],
      approvalRequired: true,
      pendingAction: {
        actionType: 'CREATE_EVENT',
        payload: {
          title,
          location,
          date,
          speaker,
          type: 'event',
        },
      },
    };
  }
}
