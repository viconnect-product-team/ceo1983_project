import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AiServiceActionResult } from './ai-event.service';
import { detectFileClarification } from '../ai-knowledge-and-actions';

@Injectable()
export class AiDocumentService {
  private readonly logger = new Logger(AiDocumentService.name);

  constructor(private readonly prisma: PrismaService) {}

  async processDocumentCommand(
    userId: string,
    prompt: string,
    payload?: any,
  ): Promise<AiServiceActionResult> {
    this.logger.log(`Processing Document command for user ${userId}: "${prompt}"`);

    const fileName = payload?.fileName || 'Van_ban_noi_bo.docx';
    const fileText = payload?.fileText || prompt;

    const clarification = detectFileClarification(fileName, fileText);

    return {
      category: 'document',
      serviceName: 'AiDocumentService',
      message: `Đã phân tích nội dung tệp tin "${fileName}". ${clarification.clarificationQuestion}`,
      matchedApi: {
        method: 'POST',
        endpoint: '/api/ai/analyze-imported-file',
        description: 'API bóc tách và phân loại tài liệu đa định dạng (Word, Excel, PDF) theo nghiệp vụ Hiệp Hội',
      },
      steps: [
        {
          stepNumber: 1,
          title: 'Đọc và bóc tách cấu trúc tệp tin',
          detail: `Tên tệp: ${fileName} | Định dạng: ${clarification.fileType} (${clarification.fileSizeFormatted})`,
          status: 'completed',
        },
        {
          stepNumber: 2,
          title: 'Trích xuất thông tin nghiệp vụ cốt lõi',
          detail: `Thời gian, địa điểm, các bên liên quan và mục tiêu chính của tài liệu.`,
          status: 'completed',
        },
        {
          stepNumber: 3,
          title: 'Đối chiếu quy chuẩn biểu mẫu Hiệp Hội',
          detail: 'Chuẩn bị dữ liệu điền vào Form tương ứng (Sự kiện / Đào tạo / Hội viên / Giao thương).',
          status: 'completed',
        },
        {
          stepNumber: 4,
          title: 'Tự động tạo bản ghi vào CSDL 113.20.107.184:6432',
          detail: 'Thực thi thao tác đã chọn vào máy chủ CSDL PostgreSQL chuẩn.',
          status: 'waiting_approval',
        },
      ],
      approvalRequired: true,
      pendingAction: {
        actionType: 'PROCESS_DOCUMENT',
        payload: {
          fileName,
          extractedSummary: clarification.summary,
          options: clarification.options,
        },
      },
    };
  }
}
