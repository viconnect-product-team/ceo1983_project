import { Injectable, Logger, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  TaskPlan,
  ApprovalRecord,
} from './dynamic-agent.types';

@Injectable()
export class ApprovalService {
  private readonly logger = new Logger(ApprovalService.name);
  private readonly approvals = new Map<string, ApprovalRecord>();

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Xác minh và cấp quyền phê duyệt chính thức cho một tác vụ (Task Approval)
   */
  public async approveTask(
    approverId: string,
    approverRole: string,
    plan: TaskPlan,
    requestedRevisionVersion: number,
    providedPayloadHash: string,
  ): Promise<ApprovalRecord> {
    // 1. Kiểm tra phiên bản kế hoạch
    if (requestedRevisionVersion !== plan.revisionVersion) {
      throw new BadRequestException(
        `Phiên bản phê duyệt không khớp. Yêu cầu phê duyệt phiên bản v${requestedRevisionVersion}, nhưng kế hoạch hiện tại đang là v${plan.revisionVersion}. Vui lòng tải lại và duyệt phiên bản mới nhất.`,
      );
    }

    // 2. Kiểm tra tính toàn vẹn của payload hash
    if (providedPayloadHash && providedPayloadHash !== plan.payloadHash) {
      throw new BadRequestException(
        `Nội dung kế hoạch đã bị thay đổi sau khi tạo bản duyệt (Hash Mismatch). Yêu cầu duyệt lại để đảm bảo an toàn.`,
      );
    }

    // 3. Kiểm tra quyền hạn người phê duyệt (RBAC Verification)
    const normalizedRole = (approverRole || 'MEMBER').toUpperCase();
    const requiredRole = (plan.requiredRole || 'ADMIN').toUpperCase();
    const adminRoles = ['ADMIN', 'SUPER_ADMIN', 'PRESIDENT', 'CHAIRMAN', 'BOARD', 'SECRETARY'];

    if (requiredRole === 'ADMIN' && !adminRoles.includes(normalizedRole)) {
      throw new ForbiddenException(
        `Tài khoản có vai trò [${approverRole}] không đủ thẩm quyền phê duyệt tác vụ này. Yêu cầu tối thiểu cấp bậc [${requiredRole}].`,
      );
    }

    // 4. Khởi tạo bản ghi phê duyệt
    const now = new Date().toISOString();
    const approval: ApprovalRecord = {
      approverId,
      approverRole,
      approvedAt: now,
      taskId: plan.taskId,
      revisionVersion: plan.revisionVersion,
      payloadHash: plan.payloadHash,
      permissionScope: plan.scope.join(', '),
      expiresAt: new Date(Date.now() + 24 * 3600000).toISOString(),
    };

    this.approvals.set(plan.taskId, approval);

    // 5. Ghi nhận nhật ký kiểm toán bất biến (Immutable Audit Log) vào PostgreSQL 113.20.107.184:6432
    try {
      await this.prisma.$executeRawUnsafe(
        `INSERT INTO public.audit_logs (id, actor_user_id, action, target_type, target_id, metadata, created_at)
         VALUES (gen_random_uuid(), $1::uuid, 'AI_TASK_APPROVED', 'ai_task', $2, $3::json, now())`,
        approverId === 'admin' ? '00000000-0000-0000-0000-000000000000' : approverId,
        plan.taskId,
        JSON.stringify({
          revisionVersion: plan.revisionVersion,
          taskTitle: plan.title,
          payloadHash: plan.payloadHash,
          affectedRecords: plan.affectedRecords,
          stepsCount: plan.steps.length,
          approverRole,
        }),
      );
    } catch (e: any) {
      this.logger.warn(`Failed to insert audit log for task approval: ${e.message}`);
    }

    this.logger.log(
      `Task ${plan.taskId} successfully APPROVED by ${approverId} (${approverRole}) for revision v${plan.revisionVersion}.`,
    );

    return approval;
  }

  /**
   * Lấy thông tin phê duyệt hiện tại của tác vụ
   */
  public getApproval(taskId: string): ApprovalRecord | undefined {
    return this.approvals.get(taskId);
  }

  /**
   * Xác thực xem một tác vụ có phê duyệt hợp lệ hay không trước khi thực thi
   */
  public validateExecutionApproval(plan: TaskPlan): boolean {
    const approval = this.approvals.get(plan.taskId);
    if (!approval) return false;
    if (approval.revisionVersion !== plan.revisionVersion) return false;
    if (approval.payloadHash !== plan.payloadHash) return false;
    return true;
  }
}
