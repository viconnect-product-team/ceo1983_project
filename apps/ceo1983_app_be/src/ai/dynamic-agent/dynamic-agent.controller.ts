import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Request,
  UseGuards,
  Sse,
  MessageEvent,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { DynamicTaskPlannerService } from './dynamic-task-planner.service';
import { ConversationalRevisionService } from './conversational-revision.service';
import { ApprovalService } from './approval.service';
import { TaskExecutionService } from './task-execution.service';
import { AiToolRegistryService } from './ai-tool-registry.service';

@Controller('ai/agent')
@UseGuards(JwtAuthGuard)
export class DynamicAgentController {
  constructor(
    private readonly planner: DynamicTaskPlannerService,
    private readonly revisionService: ConversationalRevisionService,
    private readonly approvalService: ApprovalService,
    private readonly executionService: TaskExecutionService,
    private readonly toolRegistry: AiToolRegistryService,
  ) {}

  /**
   * GET /api/ai/agent/tools — Danh sách công cụ khả dụng theo vai trò và nền tảng
   */
  @Get('tools')
  async getAvailableTools(@Request() req: any) {
    const platform = req.query?.platform === 'member' ? 'member' : 'crm';
    const userRole = req.user?.role || req.user?.executive_role || 'ADMIN';
    const tools = this.toolRegistry.getAvailableTools(platform, userRole);
    return { ok: true, data: tools };
  }

  /**
   * POST /api/ai/agent/chat — Tiếp nhận yêu cầu tự nhiên, lập kế hoạch hoặc tiếp nhận chỉnh sửa (Conversational Revision)
   */
  @Post('chat')
  async chatWithAgent(
    @Request() req: any,
    @Body()
    body: {
      message: string;
      taskId?: string;
      platform?: 'crm' | 'member';
      context?: any;
    },
  ) {
    const userId = req.user?.id || 'admin';
    const userRole = req.user?.role || req.user?.executive_role || 'ADMIN';
    const platform = body.platform || 'crm';

    // 1. Trường hợp: Người dùng đang trao đổi / chỉnh sửa một Task đang chờ duyệt (Revision)
    if (body.taskId) {
      const currentPlan = await this.executionService.getPlan(body.taskId);
      if (currentPlan) {
        // Kiểm tra xem câu nói có phải là một khẳng định thoại ("OK", "Làm đi", "Được rồi")
        const lower = (body.message || '').trim().toLowerCase();
        const isConversationalAffirmation =
          lower === 'ok' ||
          lower === 'làm đi' ||
          lower === 'được rồi' ||
          lower === 'đồng ý' ||
          lower === 'triển khai đi' ||
          lower === 'duyệt đi' ||
          lower === 'làm luôn';

        if (isConversationalAffirmation) {
          return {
            ok: true,
            data: {
              reply:
                '⚠️ **QUY ĐỊNH AN TOÀN HỆ THỐNG**: Để đảm bảo tính chính xác và an toàn dữ liệu, tôi **KHÔNG ĐƯỢC PHÉP tự động thực thi tác vụ chỉ qua lời nói hoặc tin nhắn chat thông thường**.\n\n👉 Vui lòng nhấn trực tiếp vào nút **DUYỆT THỰC HIỆN** (màu vàng kim) trên Thẻ Kế Hoạch đang hiển thị để xác nhận quyền phê duyệt chính thức!',
              taskPlan: currentPlan,
              status: 'WAITING_FOR_APPROVAL',
              requiresButtonApproval: true,
            },
          };
        }

        // Tiến hành sửa đổi kế hoạch (Conversational Revision)
        const revisionResult = await this.revisionService.revisePlan(
          currentPlan,
          body.message,
        );

        // Lưu kế hoạch phiên bản mới
        await this.executionService.savePlan(
          userId,
          platform,
          revisionResult.updatedPlan,
        );

        return {
          ok: true,
          data: {
            reply: revisionResult.conversationalReply,
            taskPlan: revisionResult.updatedPlan,
            diff: revisionResult.diff,
            status: 'WAITING_FOR_APPROVAL',
            revisionVersion: revisionResult.updatedPlan.revisionVersion,
          },
        };
      }
    }

    // 2. Trường hợp: Tiếp nhận yêu cầu mới ban đầu -> Lập Kế Hoạch Thực Hiện (Task Planning)
    const taskPlan = await this.planner.planTask(
      userId,
      userRole,
      platform,
      body.message,
      body.context,
    );

    // Lưu trữ kế hoạch ban đầu
    await this.executionService.savePlan(userId, platform, taskPlan);

    const reply = `Tôi đã tiếp nhận chỉ đạo của Quý Anh/Chị: **"${body.message}"**.\n\nSau khi phân tích dữ liệu và rà soát các nguồn thông tin trên CSDL chuẩn \`113.20.107.184:6432\`, tôi đã lập một **Kế Hoạch Thực Hiện Cụ Thể (Task Plan v1)** gồm **${taskPlan.steps.length} bước** tác động đến dự kiến **${taskPlan.affectedRecords} bản ghi**.\n\nXin mời Quý Anh/Chị xem chi tiết trên Thẻ Kế Hoạch bên dưới. Anh/Chị có thể yêu cầu tôi chỉnh sửa bất kỳ chi tiết nào, hoặc nhấn **DUYỆT THỰC HIỆN** khi đã hài lòng để tôi bắt đầu thao tác trực tiếp!`;

    return {
      ok: true,
      data: {
        reply,
        taskPlan,
        status: 'WAITING_FOR_APPROVAL',
        revisionVersion: 1,
      },
    };
  }

  /**
   * POST /api/ai/agent/tasks/:taskId/approve — Phê duyệt chính thức và khởi động thực thi Live
   */
  @Post('tasks/:taskId/approve')
  async approveAndExecuteTask(
    @Request() req: any,
    @Param('taskId') taskId: string,
    @Body()
    body: {
      revisionVersion: number;
      payloadHash: string;
      platform?: 'crm' | 'member';
    },
  ) {
    const userId = req.user?.id || 'admin';
    const userRole = req.user?.role || req.user?.executive_role || 'ADMIN';
    const platform = body.platform || 'crm';

    const plan = await this.executionService.getPlan(taskId);
    if (!plan) {
      throw new NotFoundException(`Task Plan not found for ID: ${taskId}`);
    }

    // Xác minh phê duyệt hợp lệ qua Approval Engine
    const approval = await this.approvalService.approveTask(
      userId,
      userRole,
      plan,
      body.revisionVersion,
      body.payloadHash,
    );

    // Khởi động Task Execution Engine (Chạy nền hoặc trả về trạng thái bắt đầu)
    const executionPromise = this.executionService.executeTask(
      userId,
      userRole,
      platform,
      taskId,
    );

    // Bắt đầu thực thi và trả về trạng thái khởi tạo
    const initialState = await this.executionService.getExecutionState(taskId);

    return {
      ok: true,
      data: {
        approval,
        state: initialState || {
          taskId,
          status: 'RUNNING',
          currentStepIndex: 0,
          totalSteps: plan.steps.length,
          percent: 0,
          steps: plan.steps,
        },
      },
    };
  }

  /**
   * GET /api/ai/agent/tasks/:taskId — Khôi phục kế hoạch và tiến trình thực thi (phục vụ F5 / chuyển màn hình)
   */
  @Get('tasks/:taskId')
  async getTaskDetails(@Param('taskId') taskId: string) {
    const plan = await this.executionService.getPlan(taskId);
    if (!plan) {
      throw new NotFoundException(`Task not found: ${taskId}`);
    }
    const state = await this.executionService.getExecutionState(taskId);
    const approval = this.approvalService.getApproval(taskId);

    return {
      ok: true,
      data: {
        plan,
        state,
        approval,
      },
    };
  }

  /**
   * GET /api/ai/agent/tasks/:taskId/stream — Server-Sent Events (SSE) truyền tiến trình trực tiếp theo thời gian thực
   */
  @Sse('tasks/:taskId/stream')
  streamTaskProgress(@Param('taskId') taskId: string): Observable<MessageEvent> {
    return this.executionService.getTaskStream(taskId).pipe(
      map((event) => ({
        data: event,
      } as MessageEvent)),
    );
  }
}
