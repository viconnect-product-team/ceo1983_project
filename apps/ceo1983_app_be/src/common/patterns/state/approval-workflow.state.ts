/**
 * 46 — Design Pattern Pragmatism: STATE PATTERN
 * Phục vụ Kịch bản 5: Máy trạng thái (Workflow phê duyệt kết nạp / giải ngân / thay đổi điều lệ).
 * Trạng thái quyết định hành vi thay vì dùng if/else rải rác khắp nơi.
 */

export interface WorkflowActionContext {
  userId: string;
  userRole: string;
  notes?: string;
}

export interface IApprovalState {
  readonly stateName: string;
  submit(context: WorkflowActionContext): IApprovalState;
  approve(context: WorkflowActionContext): IApprovalState;
  reject(context: WorkflowActionContext): IApprovalState;
  cancel(context: WorkflowActionContext): IApprovalState;
  canEdit(): boolean;
}

export class DraftState implements IApprovalState {
  readonly stateName = 'DRAFT';

  submit(context: WorkflowActionContext): IApprovalState {
    return new PendingReviewState();
  }

  approve(context: WorkflowActionContext): IApprovalState {
    throw new Error(
      'Hồ sơ đang ở trạng thái Nháp, phải gửi yêu cầu phê duyệt trước.',
    );
  }

  reject(context: WorkflowActionContext): IApprovalState {
    throw new Error('Không thể từ chối hồ sơ chưa gửi phê duyệt.');
  }

  cancel(context: WorkflowActionContext): IApprovalState {
    return new CancelledState();
  }

  canEdit(): boolean {
    return true;
  }
}

export class PendingReviewState implements IApprovalState {
  readonly stateName = 'PENDING_REVIEW';

  submit(context: WorkflowActionContext): IApprovalState {
    throw new Error('Hồ sơ đã gửi và đang trong quá trình xét duyệt.');
  }

  approve(context: WorkflowActionContext): IApprovalState {
    // Chỉ Admin hoặc Ban Thư Ký có quyền duyệt
    if (
      context.userRole !== 'admin' &&
      context.userRole !== 'tong_thu_ky' &&
      context.userRole !== 'chu_tich'
    ) {
      throw new Error('Bạn không có thẩm quyền phê duyệt hồ sơ này.');
    }
    return new ApprovedState();
  }

  reject(context: WorkflowActionContext): IApprovalState {
    if (
      context.userRole !== 'admin' &&
      context.userRole !== 'tong_thu_ky' &&
      context.userRole !== 'chu_tich'
    ) {
      throw new Error('Bạn không có thẩm quyền từ chối hồ sơ này.');
    }
    return new RejectedState(context.notes || 'Từ chối bởi Ban Điều Hành');
  }

  cancel(context: WorkflowActionContext): IApprovalState {
    return new CancelledState();
  }

  canEdit(): boolean {
    return false;
  }
}

export class ApprovedState implements IApprovalState {
  readonly stateName = 'APPROVED';

  submit(): IApprovalState {
    throw new Error('Hồ sơ đã được duyệt hoàn tất, không thể nộp lại.');
  }

  approve(): IApprovalState {
    throw new Error('Hồ sơ đã ở trạng thái Đã duyệt.');
  }

  reject(): IApprovalState {
    throw new Error(
      'Hồ sơ đã được phê chuẩn chính thức, không thể từ chối trực tiếp.',
    );
  }

  cancel(): IApprovalState {
    throw new Error('Không thể hủy bỏ hồ sơ đã được phê duyệt.');
  }

  canEdit(): boolean {
    return false;
  }
}

export class RejectedState implements IApprovalState {
  readonly stateName = 'REJECTED';

  constructor(public readonly reason: string) {}

  submit(): IApprovalState {
    // Có thể bổ sung hồ sơ và nộp lại thành Pending
    return new PendingReviewState();
  }

  approve(): IApprovalState {
    throw new Error('Hồ sơ đang bị từ chối, cần nộp lại trước khi xét duyệt.');
  }

  reject(): IApprovalState {
    throw new Error('Hồ sơ đã ở trạng thái Từ chối.');
  }

  cancel(): IApprovalState {
    return new CancelledState();
  }

  canEdit(): boolean {
    return true; // Cho phép sửa để nộp lại
  }
}

export class CancelledState implements IApprovalState {
  readonly stateName = 'CANCELLED';

  submit(): IApprovalState {
    return new PendingReviewState();
  }

  approve(): IApprovalState {
    throw new Error('Hồ sơ đã bị hủy.');
  }

  reject(): IApprovalState {
    throw new Error('Hồ sơ đã bị hủy.');
  }

  cancel(): IApprovalState {
    return this;
  }

  canEdit(): boolean {
    return false;
  }
}

/**
 * Context quản lý vòng đời hồ sơ
 */
export class ApprovalWorkflowContext {
  private currentState: IApprovalState;

  constructor(initialState?: IApprovalState) {
    this.currentState = initialState || new DraftState();
  }

  getState(): IApprovalState {
    return this.currentState;
  }

  submit(actionContext: WorkflowActionContext): void {
    this.currentState = this.currentState.submit(actionContext);
  }

  approve(actionContext: WorkflowActionContext): void {
    this.currentState = this.currentState.approve(actionContext);
  }

  reject(actionContext: WorkflowActionContext): void {
    this.currentState = this.currentState.reject(actionContext);
  }

  cancel(actionContext: WorkflowActionContext): void {
    this.currentState = this.currentState.cancel(actionContext);
  }
}
