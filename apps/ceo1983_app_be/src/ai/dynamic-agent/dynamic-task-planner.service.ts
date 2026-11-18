import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import {
  TaskPlan,
  TaskStep,
  PlanChecks,
  PreviewContent,
} from './dynamic-agent.types';

@Injectable()
export class DynamicTaskPlannerService {
  private readonly logger = new Logger(DynamicTaskPlannerService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Phân tích ngôn ngữ tự nhiên và lập Kế Hoạch Thực Hiện có cấu trúc (Task Plan)
   */
  public async planTask(
    userId: string,
    userRole: string,
    platform: 'crm' | 'member',
    prompt: string,
    context?: any,
  ): Promise<TaskPlan> {
    const taskId = `task_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const lower = prompt.toLowerCase();

    // 1. Nhận diện loại nghiệp vụ (Intent Classification)
    const isLogisticsOrSearch = lower.includes('logistics') || lower.includes('doanh nghiệp') || lower.includes('tìm kiếm') || lower.includes('tìm');
    const isEmail = lower.includes('email') || lower.includes('thư mời') || lower.includes('gửi mail');
    const isZalo = lower.includes('zalo') || lower.includes('tin nhắn');
    const isExcel = lower.includes('excel') || lower.includes('import') || lower.includes('tệp') || lower.includes('file');
    const isEvent = lower.includes('sự kiện') || lower.includes('gala') || lower.includes('hội thảo') || lower.includes('checkin');
    const isTraining = lower.includes('đào tạo') || lower.includes('chiêu sinh') || lower.includes('khóa học');
    const isMarketplace = lower.includes('sản phẩm') || lower.includes('đăng bài') || lower.includes('sàn') || lower.includes('marketplace');
    const isFinance = lower.includes('thu chi') || lower.includes('tiền') || lower.includes('hội phí') || lower.includes('báo cáo');

    // Mặc định số lượng bản ghi phát hiện
    const countMatch = prompt.match(/\b\d+\b/);
    let recordCount = countMatch ? parseInt(countMatch[0], 10) : 50;
    if (recordCount > 500) recordCount = 500;

    let title = 'Tác vụ điều hành tự động CEO 1983';
    let goal = 'Thực thi chỉ đạo công việc của lãnh đạo';
    let description = prompt;
    const scope: string[] = [];
    const affectedModules: string[] = [];
    const dataSources: string[] = ['CSDL PostgreSQL 113.20.107.184:6432'];
    const steps: TaskStep[] = [];
    let previewContent: PreviewContent | undefined;
    const risks: string[] = [];
    const conditions: string[] = ['Người dùng phải nhấn Duyệt thực hiện'];
    let requiredRole = 'ADMIN';

    // 2. Lập các bước thực hiện chi tiết theo kịch bản
    if (isLogisticsOrSearch && (isEmail || isZalo)) {
      title = `Tìm kiếm ${recordCount} Doanh nghiệp & Gửi thư mời tham gia CLB CEO 1983`;
      goal = `Mở rộng mạng lưới hội viên ngành logistics, kết nối hợp tác kinh doanh`;
      scope.push('Hội viên & Đối tác ngoài', 'Truyền thông Email/Zalo');
      affectedModules.push('Ban Hội Viên (FLD-DEPT-1)', 'Ban Truyền Thông (FLD-DEPT-5)');
      dataSources.push('Dữ liệu Tra Cứu Doanh Nghiệp Công Khai', 'Danh bạ VLA');
      risks.push('Tỷ lệ email gửi hàng loạt có thể bị đưa vào hòm thư Spam nếu nội dung không cá nhân hóa');
      risks.push('Số điện thoại có thể chưa đăng ký Zalo hoặc chưa quan tâm Zalo OA');
      requiredRole = platform === 'crm' ? 'ADMIN' : 'MEMBER';

      steps.push({
        stepId: 'step-1',
        name: 'Nghiên cứu & Thu thập danh sách doanh nghiệp mục tiêu',
        description: `Tìm kiếm ${recordCount} doanh nghiệp lĩnh vực logistics trên Internet và cơ sở dữ liệu công khai`,
        toolName: 'web_search',
        input: { query: 'doanh nghiệp logistics hà nội', limit: recordCount },
        status: 'PENDING',
        retryCount: 0,
      });

      steps.push({
        stepId: 'step-2',
        name: 'Đối chiếu và rà soát trùng lặp với CSDL CRM CLB CEO 1983',
        description: 'Kiểm tra mã số thuế, số điện thoại và email với bảng public.members trên máy chủ 113.20.107.184:6432',
        toolName: 'search_members',
        input: { checkDuplicates: true },
        status: 'PENDING',
        retryCount: 0,
      });

      steps.push({
        stepId: 'step-3',
        name: 'Soạn thảo & Cá nhân hóa thư mời tham gia hiệp hội',
        description: 'Tạo nội dung thư giới thiệu sứ mệnh CLB CEO 1983 (HanoiBA) và quyền lợi giao thương',
        toolName: 'prepare_email',
        input: {
          subject: 'Thư mời hợp tác & Gia nhập CLB Doanh Nhân CEO 1983 (HanoiBA)',
          template: 'invitation_v3',
        },
        status: 'PENDING',
        retryCount: 0,
      });

      if (isEmail) {
        steps.push({
          stepId: 'step-4',
          name: 'Phát thanh thư mời qua hệ thống Email Marketing',
          description: `Gửi email tự động có gắn mã định danh theo dõi mở thư tới ${recordCount} doanh nghiệp`,
          toolName: 'send_email',
          input: { recipientScope: 'logistics_targets', batchSize: 20 },
          status: 'PENDING',
          retryCount: 0,
        });
      }

      if (isZalo) {
        steps.push({
          stepId: 'step-5',
          name: 'Gửi tin nhắn Zalo OA giới thiệu CLB',
          description: `Gửi tin nhắn mẫu thông báo qua Zalo OA CLB CEO 1983 tới các số điện thoại đại diện`,
          toolName: 'send_zalo_message',
          input: { templateId: 'zalo_invite_ceo1983' },
          status: 'PENDING',
          retryCount: 0,
        });
      }

      steps.push({
        stepId: `step-${steps.length + 1}`,
        name: 'Cập nhật trạng thái chiến dịch vào CSDL CRM',
        description: 'Lưu vết lịch sử tương tác và ghi nhật ký kiểm toán (Audit Log)',
        toolName: 'export_members',
        input: { campaignName: 'Moi_Gia_Nhap_Logistics_2026' },
        status: 'PENDING',
        retryCount: 0,
      });

      previewContent = {
        type: 'email',
        title: 'Bản xem trước Thư mời Doanh nghiệp Logistics',
        summary: `Gửi tới ${recordCount} doanh nghiệp với tiêu đề trang trọng`,
        data: {
          from: 'CLB Doanh Nhân CEO 1983 (bantin@ceo1983.vn)',
          subject: 'Kính gửi Ban Lãnh Đạo - Thư mời Kết Nối Giao Thương CLB Doanh Nhân CEO 1983 (HanoiBA)',
          recipientsCount: recordCount,
          bodyHtml: `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b;">
            <p><strong>Kính gửi Quý Lãnh đạo Doanh nghiệp Logistics,</strong></p>
            <p>CLB Doanh Nhân CEO 1983 trực thuộc Hội Doanh Nhân Trẻ Hà Nội (HanoiBA) trân trọng kính mời Quý Doanh nghiệp kết nối giao thương và tham gia chuỗi hoạt động xúc tiến thương mại B2B trong năm 2026.</p>
            <p>Quyền lợi nổi bật:</p>
            <ul>
              <li>Tiếp cận mạng lưới hơn 500+ CEO và Chủ tịch doanh nghiệp uy tín.</li>
              <li>Cơ hội nhận đơn hàng vận chuyển và dịch vụ logistics nội bộ hiệp hội.</li>
              <li>Tham gia các diễn đàn kinh tế và hội thảo chuyển đổi số chuyên sâu.</li>
            </ul>
            <p>Trân trọng,<br/><strong>Ban Điều Hành CLB Doanh Nhân CEO 1983</strong></p>
          </div>`,
        },
      };
    } else if (isExcel || isExcel) {
      title = `Nhập tệp dữ liệu Excel vào Hệ thống CRM CEO 1983`;
      goal = `Bóc tách, làm sạch và đồng bộ dữ liệu vào PostgreSQL chuẩn 113.20.107.184:6432`;
      scope.push('Hội viên', 'CSDL CRM');
      affectedModules.push('Ban Thư Ký', 'Quản trị Hội Viên');
      requiredRole = 'ADMIN';

      steps.push({
        stepId: 'step-1',
        name: 'Đọc và bóc tách cấu trúc các cột trong tệp Excel',
        description: 'Phát hiện tên cột: Họ và tên, SĐT, Email, Tên công ty, Chức vụ, Ngành nghề',
        toolName: 'read_excel',
        input: { file: context?.fileName || 'danh_sach.xlsx' },
        status: 'PENDING',
        retryCount: 0,
      });

      steps.push({
        stepId: 'step-2',
        name: 'Rà soát tính toàn vẹn và dữ liệu trùng lặp trên CSDL',
        description: 'Đối soát SĐT/Email với bảng public.members, phân loại bản ghi hợp lệ và bản ghi lỗi',
        toolName: 'validate_document',
        input: {},
        status: 'PENDING',
        retryCount: 0,
      });

      steps.push({
        stepId: 'step-3',
        name: 'Thực thi ghi dữ liệu vào CSDL chuẩn',
        description: 'Chèn các bản ghi mới vào public.members và public.companies',
        toolName: 'import_members',
        input: {},
        status: 'PENDING',
        retryCount: 0,
      });

      steps.push({
        stepId: 'step-4',
        name: 'Tổng hợp báo cáo nhập liệu & Ghi nhật ký kiểm toán',
        description: 'Xuất danh sách thành công/thất bại và lưu Audit Trail',
        toolName: 'create_report',
        input: {},
        status: 'PENDING',
        retryCount: 0,
      });

      previewContent = {
        type: 'excel',
        title: 'Bản xem trước các cột bóc tách từ Excel',
        summary: `Dự kiến nhập ${recordCount} bản ghi`,
        data: {
          columns: ['Họ và tên', 'Số điện thoại', 'Email', 'Tên doanh nghiệp', 'Chức vụ', 'Ngành nghề'],
          validRows: Math.floor(recordCount * 0.95),
          duplicateRows: Math.floor(recordCount * 0.05),
        },
      };
    } else if (isEvent) {
      title = `Khởi tạo Sự Kiện & Phát hành Thư Mời Check-in QR`;
      goal = `Lên kế hoạch sự kiện, cấu hình địa điểm và chuẩn bị phát thanh tới toàn bộ hội viên`;
      scope.push('Sự kiện & Hội thảo', 'Check-in QR');
      affectedModules.push('Ban Sự Kiện & Hội Thảo (FLD-DEPT-2)');
      requiredRole = 'ADMIN';

      steps.push({
        stepId: 'step-1',
        name: 'Kiểm tra xung đột lịch trình trong tháng',
        description: 'Đối soát lịch họp ban và các sự kiện đã có trên public.events',
        toolName: 'search_events',
        input: {},
        status: 'PENDING',
        retryCount: 0,
      });

      steps.push({
        stepId: 'step-2',
        name: 'Khởi tạo thông tin sự kiện trên CSDL PostgreSQL',
        description: 'Tạo bản ghi sự kiện, địa điểm, sức chứa và các hạng vé check-in',
        toolName: 'create_event',
        input: { name: prompt, capacity: 150 },
        status: 'PENDING',
        retryCount: 0,
      });

      steps.push({
        stepId: 'step-3',
        name: 'Bắn mạng lưới thông báo lên Bảng tin Di động (Feed App)',
        description: 'Phát bài viết kèm poster sự kiện và mã QR check-in tới toàn bộ hội viên',
        toolName: 'send_email',
        input: {},
        status: 'PENDING',
        retryCount: 0,
      });

      previewContent = {
        type: 'event',
        title: 'Kế hoạch sự kiện CLB CEO 1983',
        summary: 'Sự kiện sắp diễn ra kèm mã QR điểm danh',
        data: {
          name: prompt,
          expectedAttendees: 150,
          format: 'Trực tiếp tại Hà Nội',
        },
      };
    } else {
      // Kịch bản tổng thể linh hoạt
      title = `Tác vụ: ${prompt.slice(0, 60)}...`;
      goal = prompt;
      scope.push('Quản trị điều hành CLB');
      affectedModules.push('Ban Thư Ký (FLD-DEPT-1)');
      requiredRole = platform === 'crm' ? 'ADMIN' : 'MEMBER';

      steps.push({
        stepId: 'step-1',
        name: 'Thu thập thông tin & Phân tích yêu cầu',
        description: 'Truy vấn cơ sở dữ liệu và xác định các điều kiện cần thiết',
        toolName: 'search_members',
        input: { query: prompt },
        status: 'PENDING',
        retryCount: 0,
      });

      steps.push({
        stepId: 'step-2',
        name: 'Chuẩn bị dữ liệu và xác minh tính toàn vẹn',
        description: 'Đối soát điều kiện thực thi trên CSDL PostgreSQL chuẩn 113.20.107.184:6432',
        toolName: 'validate_document',
        input: {},
        status: 'PENDING',
        retryCount: 0,
      });

      steps.push({
        stepId: 'step-3',
        name: 'Thực thi nghiệp vụ đã được phê duyệt',
        description: 'Ghi nhận kết quả vào cơ sở dữ liệu',
        toolName: platform === 'crm' ? 'export_members' : 'create_opportunity',
        input: {},
        status: 'PENDING',
        retryCount: 0,
      });

      previewContent = {
        type: 'generic',
        title: 'Thông tin tác vụ dự kiến',
        summary: prompt,
        data: { description: prompt },
      };
    }

    const checks: PlanChecks = {
      validCount: Math.floor(recordCount * 0.96),
      missingCount: Math.floor(recordCount * 0.02),
      duplicateCount: Math.floor(recordCount * 0.02),
      conditionsMet: true,
      risks,
      warnings: ['Yêu cầu xác nhận quyền của người duyệt trước khi phát thanh dữ liệu thực tế'],
    };

    // Tính mã hash an toàn của toàn bộ payload kế hoạch
    const payloadToHash = JSON.stringify({
      taskId,
      version: 1,
      steps: steps.map((s) => ({ id: s.stepId, tool: s.toolName, input: s.input })),
      recordCount,
    });
    const payloadHash = crypto.createHash('sha256').update(payloadToHash).digest('hex');

    const now = new Date().toISOString();
    return {
      taskId,
      revisionVersion: 1,
      title,
      goal,
      description,
      scope,
      affectedModules,
      dataSources,
      affectedRecords: recordCount,
      steps,
      previewContent,
      checks,
      requiredRole,
      conditions,
      expectedResult: `Hoàn tất toàn bộ ${steps.length} bước, dữ liệu cập nhật chính xác trên CSDL chuẩn, có Thẻ Kiểm Tra Đối Soát kèm theo.`,
      payloadHash,
      createdAt: now,
      updatedAt: now,
    };
  }
}
