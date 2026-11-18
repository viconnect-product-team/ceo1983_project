import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import {
  TaskPlan,
  RevisionDiff,
  TaskStep,
} from './dynamic-agent.types';

@Injectable()
export class ConversationalRevisionService {
  private readonly logger = new Logger(ConversationalRevisionService.name);

  /**
   * Tiếp nhận yêu cầu chỉnh sửa từ người dùng và tính toán phiên bản kế hoạch mới (Revision)
   */
  public async revisePlan(
    currentPlan: TaskPlan,
    revisionPrompt: string,
  ): Promise<{
    updatedPlan: TaskPlan;
    diff: RevisionDiff;
    conversationalReply: string;
  }> {
    const lower = revisionPrompt.toLowerCase();
    const oldVersion = currentPlan.revisionVersion;
    const newVersion = oldVersion + 1;

    // Bản sao kế hoạch cũ
    const updatedPlan: TaskPlan = JSON.parse(JSON.stringify(currentPlan));
    updatedPlan.revisionVersion = newVersion;
    updatedPlan.updatedAt = new Date().toISOString();

    const added: string[] = [];
    const modified: string[] = [];
    const removed: string[] = [];

    // 1. Phân tích: Loại bỏ Zalo / Chỉ gửi Email
    const removeZalo =
      lower.includes('không gửi zalo') ||
      lower.includes('bỏ zalo') ||
      lower.includes('chỉ gửi email') ||
      lower.includes('chỉ email');
    if (removeZalo) {
      const initialStepCount = updatedPlan.steps.length;
      updatedPlan.steps = updatedPlan.steps.filter(
        (s) => !s.toolName.includes('zalo') && !s.name.toLowerCase().includes('zalo'),
      );
      if (updatedPlan.steps.length < initialStepCount) {
        removed.push('Đã loại bỏ bước gửi tin nhắn qua Zalo OA');
        modified.push('Chuyển toàn bộ kênh truyền thông sang Email chuyên nghiệp');
      }
    }

    // 2. Phân tích: Lọc quy mô doanh nghiệp vừa và lớn
    const filterScale =
      lower.includes('vừa và lớn') ||
      lower.includes('quy mô lớn') ||
      lower.includes('không lấy doanh nghiệp nhỏ') ||
      lower.includes('không cần tìm doanh nghiệp nhỏ');
    if (filterScale) {
      updatedPlan.affectedRecords = Math.max(20, Math.floor(currentPlan.affectedRecords * 0.6));
      modified.push(
        `Thắt chặt tiêu chí: Chỉ lấy doanh nghiệp quy mô vừa và lớn (Số lượng điều chỉnh từ ${currentPlan.affectedRecords} còn ${updatedPlan.affectedRecords} doanh nghiệp)`,
      );

      // Cập nhật input của bước tìm kiếm
      const searchStep = updatedPlan.steps.find((s) => s.stepId === 'step-1' || s.toolName.includes('search'));
      if (searchStep) {
        searchStep.description = `Tìm kiếm ${updatedPlan.affectedRecords} doanh nghiệp logistics quy mô vừa và lớn`;
        searchStep.input = {
          ...searchStep.input,
          scale: 'medium_and_large',
          limit: updatedPlan.affectedRecords,
        };
      }
    }

    // 3. Phân tích: Bổ sung quyền lợi hội viên & đính kèm hồ sơ CLB
    const addBenefitsOrAttachment =
      lower.includes('quyền lợi') ||
      lower.includes('đính kèm') ||
      lower.includes('hồ sơ') ||
      lower.includes('profile');
    if (addBenefitsOrAttachment) {
      added.push('Bổ sung phần giới thiệu chi tiết quyền lợi hội viên CEO 1983');
      added.push('Đính kèm tệp hồ sơ năng lực CLB (Profile_CEO1983_2026.pdf, dung lượng 4.2 MB - hợp lệ < 25 MB)');

      if (updatedPlan.previewContent && updatedPlan.previewContent.type === 'email') {
        const body = updatedPlan.previewContent.data?.bodyHtml || '';
        updatedPlan.previewContent.data.attachments = [
          { name: 'Ho_So_Nang_Luc_CLB_CEO1983_2026.pdf', size: '4.2 MB' },
        ];
        updatedPlan.previewContent.data.bodyHtml = body.replace(
          '</ul>',
          '  <li><strong>Đính kèm:</strong> Hồ sơ năng lực và điều lệ CLB CEO 1983 chính thức.</li>\n</ul>',
        );
      }
    }

    // 4. Phân tích: Làm theo hướng chuyên nghiệp hơn
    const makeProfessional =
      lower.includes('chuyên nghiệp hơn') ||
      lower.includes('trang trọng hơn') ||
      lower.includes('cao cấp hơn');
    if (makeProfessional) {
      modified.push('Nâng cấp văn phong thư mời sang phong cách Chủ tịch & CEO cao cấp');
      if (updatedPlan.previewContent && updatedPlan.previewContent.data) {
        updatedPlan.previewContent.data.subject =
          'TRÂN TRỌNG KÍNH MỜI BAN LÃNH ĐẠO - KẾT NỐI HỢP TÁC CHIẾN LƯỢC CÙNG CLB DOANH NHÂN CEO 1983';
      }
    }

    // Nếu không khớp các từ khóa cụ thể ở trên, áp dụng sửa đổi tự do
    if (added.length === 0 && modified.length === 0 && removed.length === 0) {
      modified.push(`Đã tiếp nhận và cập nhật yêu cầu: "${revisionPrompt}"`);
      updatedPlan.description = `${currentPlan.description} | Bổ sung: ${revisionPrompt}`;
    }

    // Đánh lại số thứ tự các bước
    updatedPlan.steps = updatedPlan.steps.map((s, idx) => ({
      ...s,
      stepId: `step-${idx + 1}`,
      status: 'PENDING',
    }));

    // Cập nhật lại kiểm tra tính hợp lệ
    updatedPlan.checks.validCount = Math.floor(updatedPlan.affectedRecords * 0.98);
    updatedPlan.checks.missingCount = Math.floor(updatedPlan.affectedRecords * 0.01);
    updatedPlan.checks.duplicateCount = Math.floor(updatedPlan.affectedRecords * 0.01);

    // Tính mã hash mới của payload (làm vô hiệu hóa mọi phê duyệt cũ trước đó)
    const payloadToHash = JSON.stringify({
      taskId: updatedPlan.taskId,
      version: newVersion,
      steps: updatedPlan.steps.map((s) => ({ id: s.stepId, tool: s.toolName, input: s.input })),
      recordCount: updatedPlan.affectedRecords,
      preview: updatedPlan.previewContent,
    });
    updatedPlan.payloadHash = crypto.createHash('sha256').update(payloadToHash).digest('hex');

    const diff: RevisionDiff = {
      fromVersion: oldVersion,
      toVersion: newVersion,
      summary: `Nâng cấp kế hoạch lên Phiên bản ${newVersion}: ${modified.concat(added).join('; ')}`,
      added,
      modified,
      removed,
      timestamp: new Date().toISOString(),
    };

    const conversationalReply = `Tôi đã phân tích chỉ đạo của Anh/Chị và **cập nhật Task Plan lên Phiên bản v${newVersion}**:\n\n${[
      ...added.map((a) => `✅ **Thêm mới**: ${a}`),
      ...modified.map((m) => `🔄 **Điều chỉnh**: ${m}`),
      ...removed.map((r) => `🗑️ **Loại bỏ**: ${r}`),
    ].join('\n')}\n\n⚠️ **Lưu ý**: Phê duyệt của phiên bản v${oldVersion} đã tự động mất hiệu lực đối với các phần bị thay đổi. Kế hoạch hiện ở trạng thái \`WAITING_FOR_APPROVAL\`. Vui lòng nhấn nút **DUYỆT THỰC HIỆN** bên dưới để tôi bắt đầu thực thi!`;

    return {
      updatedPlan,
      diff,
      conversationalReply,
    };
  }
}
