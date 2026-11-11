import {
  Injectable,
  Logger,
  ForbiddenException,
  Optional,
} from '@nestjs/common';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { TasksRepository } from './tasks.repository';
import { MailService } from '../mail/mail.service';
import {
  TaskSubtask,
  TaskComment,
  TaskHistory,
  TaskAttachment,
  TaskMeeting,
  TaskProgressEvaluation,
  TaskDelegation,
  TaskItem,
  TaskFilterDto,
  CreateTaskDto,
  UpdateTaskDto,
  AddCommentDto,
  AddSubtaskDto,
  TASK_DEPARTMENTS,
} from './dto';

export type {
  TaskSubtask,
  TaskComment,
  TaskHistory,
  TaskAttachment,
  TaskMeeting,
  TaskProgressEvaluation,
  TaskDelegation,
  TaskItem,
};
export {
  TaskFilterDto,
  CreateTaskDto,
  UpdateTaskDto,
  AddCommentDto,
  AddSubtaskDto,
};

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);
  private readonly storageFilePath = path.join(
    process.cwd(),
    'uploads',
    'tasks_data.json',
  );
  private tasks: TaskItem[] = [];

  constructor(
    private readonly tasksRepo: TasksRepository,
    @Optional() private readonly mailService?: MailService,
  ) {
    this.ensureInitialized();
  }

  private ensureInitialized() {
    try {
      const uploadsDir = path.dirname(this.storageFilePath);
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      if (fs.existsSync(this.storageFilePath)) {
        const raw = fs.readFileSync(this.storageFilePath, 'utf8');
        this.tasks = JSON.parse(raw);
        this.logger.log(`Loaded ${this.tasks.length} tasks from storage.`);
      } else {
        this.seedInitialTasks();
        this.saveToFile();
      }
    } catch (err: any) {
      this.logger.error(`Error loading tasks: ${err.message}`);
      this.seedInitialTasks();
    }
  }

  private saveToFile() {
    try {
      fs.writeFileSync(
        this.storageFilePath,
        JSON.stringify(this.tasks, null, 2),
        'utf8',
      );
    } catch (err: any) {
      this.logger.error(`Error saving tasks: ${err.message}`);
    }
  }

  private seedInitialTasks() {
    this.tasks = [];
  }

  /**
   * Lấy danh sách ban và thành viên được phép giao việc tùy theo quyền hạn của người đăng nhập
   * - Chủ tịch / Admin: Toàn quyền giao việc cho bất kỳ ai thuộc bất kỳ ban nào
   * - Tổng thư ký: Chỉ được giao việc cho thành viên thuộc Ban Thư Ký
   * - Trưởng ban: Chỉ được giao việc cho các thành viên thuộc chính ban của mình
   */
  async getAssignableMembers(
    currentUser?: any,
    requestedDept?: string,
  ): Promise<{
    allowedDepartments: string[];
    members: any[];
    canAssignAll: boolean;
    currentRole: string;
    currentDepartment: string;
  }> {
    const role = (
      currentUser?.role ||
      currentUser?.srsRole ||
      'member'
    ).toLowerCase();
    const isPresident = Boolean(
      currentUser?.isPresident || role === 'chu_tich' || role === 'president',
    );
    const isAdmin = Boolean(
      currentUser?.isAdmin ||
      role === 'admin' ||
      role === 'quan_tri' ||
      currentUser?.roles?.includes('admin'),
    );
    const isExecutive = Boolean(
      currentUser?.isExecutive || role === 'ban_dieu_hanh' || role === 'bqt',
    );
    const isGeneralSecretary = Boolean(
      currentUser?.isGeneralSecretary || role === 'tong_thu_ky',
    );
    const isDepartmentLeader = Boolean(
      currentUser?.isDepartmentLeader || role.startsWith('truong_ban_'),
    );

    let currentDept = currentUser?.department || '';
    if (currentDept.toLowerCase().includes('quản trị')) {
      currentDept = currentDept
        .replace(/ban quản trị/gi, 'Ban Điều Hành')
        .replace(/quản trị/gi, 'Điều Hành');
    }

    // Xác định ban phụ trách nếu là Trưởng ban
    let leaderDepartment = '';
    if (role === 'truong_ban_dieu_hanh' || isExecutive)
      leaderDepartment = 'Ban Điều Hành';
    else if (role === 'truong_ban_su_kien' || currentDept.includes('Sự kiện'))
      leaderDepartment = 'Ban Sự kiện';
    else if (
      role === 'truong_ban_truyen_thong' ||
      currentDept.includes('Truyền thông')
    )
      leaderDepartment = 'Ban Truyền thông';
    else if (role === 'truong_ban_xuc_tien' || currentDept.includes('Xúc tiến'))
      leaderDepartment = 'Ban Xúc tiến';
    else if (
      role === 'truong_ban_tai_chinh' ||
      currentDept.includes('Tài chính')
    )
      leaderDepartment = 'Ban Tài chính';
    else if (
      role === 'truong_ban_thien_nguyen' ||
      currentDept.includes('Thiện nguyện')
    )
      leaderDepartment = 'Ban Thiện nguyện';
    else if (isDepartmentLeader && currentDept) leaderDepartment = currentDept;

    // Nếu người dùng chọn một Ban cụ thể trên form tạo việc, ưu tiên lấy danh sách hội viên thuộc Ban đó
    if (requestedDept && requestedDept !== 'ALL') {
      const deptKeyword = requestedDept.replace(/^Ban\s+/i, '').trim();
      const filteredDeptMembers =
        await this.tasksRepo.getMembersForAssignment(deptKeyword);
      return {
        allowedDepartments:
          isPresident || isAdmin || isExecutive
            ? [...TASK_DEPARTMENTS]
            : [leaderDepartment || currentDept || requestedDept],
        members: filteredDeptMembers,
        canAssignAll: isPresident || isAdmin || isExecutive,
        currentRole: isPresident ? 'chu_tich' : isAdmin ? 'admin' : role,
        currentDepartment: requestedDept,
      };
    }

    if (isPresident || isAdmin || isExecutive) {
      // 1. Chủ tịch, Admin & Ban Điều Hành / BQT: Toàn quyền giao việc cho bất kỳ ai thuộc bất kỳ ban nào
      const allMembers = await this.tasksRepo.getMembersForAssignment();
      return {
        allowedDepartments: [...TASK_DEPARTMENTS],
        members: allMembers,
        canAssignAll: true,
        currentRole: isPresident
          ? 'chu_tich'
          : isAdmin
            ? 'admin'
            : 'ban_dieu_hanh',
        currentDepartment: currentDept || 'Ban Điều Hành',
      };
    }

    if (isGeneralSecretary) {
      // 2. Tổng thư ký: Chỉ được giao việc cho Ban Thư Ký
      const secretaryMembers =
        await this.tasksRepo.getMembersForAssignment('thư ký');
      return {
        allowedDepartments: ['Ban Thư ký'],
        members: secretaryMembers,
        canAssignAll: false,
        currentRole: 'tong_thu_ky',
        currentDepartment: 'Ban Thư ký',
      };
    }

    if (isDepartmentLeader || leaderDepartment) {
      // 3. Trưởng ban: Chỉ giao việc cho thành viên thuộc chính ban đó
      const targetDept = leaderDepartment || currentDept;
      const deptKeyword = targetDept.replace(/^Ban\s+/i, '').trim();
      const deptMembers =
        await this.tasksRepo.getMembersForAssignment(deptKeyword);
      return {
        allowedDepartments: [targetDept || 'Ban Chuyên môn'],
        members: deptMembers,
        canAssignAll: false,
        currentRole: role,
        currentDepartment: targetDept,
      };
    }

    // 4. Hội viên: Chỉ giao việc trong ban của mình nếu được ủy quyền
    const memberDept = currentDept || 'Ban Thành viên';
    const deptKeyword = memberDept.replace(/^Ban\s+/i, '').trim();
    const deptMembers =
      await this.tasksRepo.getMembersForAssignment(deptKeyword);
    return {
      allowedDepartments: [memberDept],
      members: deptMembers,
      canAssignAll: false,
      currentRole: role,
      currentDepartment: memberDept,
    };
  }

  async getAllTasks(
    filters?: {
      department?: string;
      status?: string;
      priority?: string;
      keyword?: string;
    },
    currentUser?: any,
  ): Promise<TaskItem[]> {
    let list = [...this.tasks];

    // PHÂN QUYỀN DỮ LIỆU (Data Authorization)
    if (
      currentUser &&
      currentUser.id !== '00000000-0000-0000-0000-000000000000' &&
      currentUser.username !== 'guest'
    ) {
      const role = (
        currentUser.role ||
        currentUser.srsRole ||
        'member'
      ).toLowerCase();
      const isPresident = Boolean(
        currentUser.isPresident || role === 'chu_tich' || role === 'president',
      );
      const isAdmin = Boolean(
        currentUser.isAdmin ||
        role === 'admin' ||
        role === 'quan_tri' ||
        currentUser.roles?.includes('admin'),
      );
      const isExecutive = Boolean(
        currentUser.isExecutive || role === 'ban_dieu_hanh' || role === 'bqt',
      );
      const isGeneralSecretary = Boolean(
        currentUser.isGeneralSecretary || role === 'tong_thu_ky',
      );
      const isDepartmentLeader = Boolean(
        currentUser.isDepartmentLeader || role.startsWith('truong_ban_'),
      );

      const userDept = (currentUser.department || '')
        .replace(/ban quản trị/gi, 'Ban Điều Hành')
        .trim();
      const userId =
        currentUser.id || currentUser.userId || currentUser.memberId;
      const userEmail = (
        currentUser.email ||
        currentUser.username ||
        ''
      ).toLowerCase();
      const userName = (
        currentUser.name ||
        currentUser.fullName ||
        ''
      ).toLowerCase();

      // Nếu KHÔNG phải Chủ tịch, Admin hay Ban Điều Hành thì áp dụng bộ lọc dữ liệu theo quyền
      if (!isPresident && !isAdmin && !isExecutive) {
        if (isGeneralSecretary) {
          // Tổng thư ký: Xem công việc Ban Thư Ký + việc liên quan trực tiếp đến mình
          list = list.filter((t) => {
            const isSecDept = (t.department || '')
              .toLowerCase()
              .includes('thư ký');
            const isAssigned =
              (t.assignee?.id && t.assignee.id === userId) ||
              (t.assignee?.email &&
                t.assignee.email.toLowerCase() === userEmail) ||
              t.assignees?.some(
                (a: any) =>
                  (a.id && a.id === userId) ||
                  (a.email && a.email.toLowerCase() === userEmail) ||
                  (userName && a.name && a.name.toLowerCase() === userName),
              );
            const isSupervised =
              (t.supervisor?.id && t.supervisor.id === userId) ||
              (t.supervisor?.name &&
                t.supervisor.name.toLowerCase() === userName);
            const isCollab = t.collaborators?.some(
              (c) =>
                (c.id && c.id === userId) ||
                (c.name && c.name.toLowerCase() === userName),
            );
            return isSecDept || isAssigned || isSupervised || isCollab;
          });
        } else if (isDepartmentLeader) {
          // Trưởng ban: Xem công việc ban của mình + việc liên quan
          const deptKeyword = userDept
            .replace(/^Ban\s+/i, '')
            .toLowerCase()
            .trim();
          list = list.filter((t) => {
            const isOwnDept =
              deptKeyword &&
              (t.department || '').toLowerCase().includes(deptKeyword);
            const isAssigned =
              (t.assignee?.id && t.assignee.id === userId) ||
              (t.assignee?.email &&
                t.assignee.email.toLowerCase() === userEmail) ||
              t.assignees?.some(
                (a: any) =>
                  (a.id && a.id === userId) ||
                  (a.email && a.email.toLowerCase() === userEmail) ||
                  (userName && a.name && a.name.toLowerCase() === userName),
              );
            const isSupervised =
              (t.supervisor?.id && t.supervisor.id === userId) ||
              (t.supervisor?.name &&
                t.supervisor.name.toLowerCase() === userName);
            const isCollab = t.collaborators?.some(
              (c) =>
                (c.id && c.id === userId) ||
                (c.name && c.name.toLowerCase() === userName),
            );
            return isOwnDept || isAssigned || isSupervised || isCollab;
          });
        } else {
          // Hội viên: Chỉ xem các công việc mà mình được phân công, phối hợp hoặc tạo
          list = list.filter((t) => {
            const isAssigned =
              (t.assignee?.id && t.assignee.id === userId) ||
              (t.assignee?.email &&
                t.assignee.email.toLowerCase() === userEmail) ||
              (userName &&
                t.assignee?.name &&
                t.assignee.name.toLowerCase() === userName) ||
              t.assignees?.some(
                (a: any) =>
                  (a.id && a.id === userId) ||
                  (a.email && a.email.toLowerCase() === userEmail) ||
                  (userName && a.name && a.name.toLowerCase() === userName),
              );
            const isCollab = t.collaborators?.some(
              (c) =>
                (c.id && c.id === userId) ||
                (userName && c.name && c.name.toLowerCase() === userName),
            );
            const isSupervised = t.supervisor?.id && t.supervisor.id === userId;
            const isCreator = t.history?.some(
              (h) =>
                h.actor?.toLowerCase() === userName && h.action.includes('Tạo'),
            );
            return isAssigned || isCollab || isSupervised || isCreator;
          });
        }
      }
    }

    if (filters?.department && filters.department !== 'ALL') {
      list = list.filter((t) => t.department === filters.department);
    }
    if (filters?.status && filters.status !== 'ALL') {
      list = list.filter((t) => t.status === filters.status);
    }
    if (filters?.priority && filters.priority !== 'ALL') {
      list = list.filter((t) => t.priority === filters.priority);
    }
    if (filters?.keyword) {
      const q = filters.keyword.toLowerCase().trim();
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.code.toLowerCase().includes(q) ||
          (t.assignee?.name && t.assignee.name.toLowerCase().includes(q)) ||
          t.assignees?.some(
            (a: any) => a.name && a.name.toLowerCase().includes(q),
          ) ||
          t.description.toLowerCase().includes(q),
      );
    }

    return list.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }

  async getTaskById(id: string): Promise<TaskItem | null> {
    return this.tasks.find((t) => t.id === id || t.code === id) || null;
  }

  async createTask(
    data: Partial<TaskItem>,
    creatorName = 'Người quản trị',
    currentUser?: any,
  ): Promise<TaskItem> {
    // Kiểm tra tính hợp lệ về quyền giao việc
    if (
      currentUser &&
      currentUser.id !== '00000000-0000-0000-0000-000000000000' &&
      currentUser.username !== 'guest'
    ) {
      const role = (
        currentUser.role ||
        currentUser.srsRole ||
        'member'
      ).toLowerCase();
      const isPresident = Boolean(
        currentUser.isPresident || role === 'chu_tich' || role === 'president',
      );
      const isAdmin = Boolean(
        currentUser.isAdmin ||
        role === 'admin' ||
        role === 'quan_tri' ||
        currentUser.roles?.includes('admin'),
      );
      const isExecutive = Boolean(
        currentUser.isExecutive || role === 'ban_dieu_hanh' || role === 'bqt',
      );
      const isGeneralSecretary = Boolean(
        currentUser.isGeneralSecretary || role === 'tong_thu_ky',
      );
      const isDepartmentLeader = Boolean(
        currentUser.isDepartmentLeader || role.startsWith('truong_ban_'),
      );

      if (!isPresident && !isAdmin && !isExecutive) {
        if (isGeneralSecretary) {
          if (
            data.department &&
            !data.department.toLowerCase().includes('thư ký')
          ) {
            throw new ForbiddenException(
              'Tổng thư ký chỉ có quyền giao việc cho các thành viên thuộc Ban Thư ký.',
            );
          }
        } else if (isDepartmentLeader) {
          const userDept = (currentUser.department || '').toLowerCase().trim();
          const targetDept = (data.department || '').toLowerCase().trim();
          const normUserDept = userDept
            .replace(/quản trị/g, 'điều hành')
            .replace(/^ban\s+/i, '')
            .trim();
          const normTargetDept = targetDept
            .replace(/quản trị/g, 'điều hành')
            .replace(/^ban\s+/i, '')
            .trim();
          if (
            normUserDept &&
            normTargetDept &&
            !normTargetDept.includes(normUserDept) &&
            !normUserDept.includes(normTargetDept)
          ) {
            throw new ForbiddenException(
              `Trưởng ban chỉ có quyền giao việc cho các thành viên thuộc ${currentUser.department || 'chính ban của mình'}.`,
            );
          }
        }
      }
    }

    const nextNum = this.tasks.length + 1;
    const code = `CV-1983-${String(nextNum).padStart(2, '0')}`;
    const id = `task-1983-${Date.now()}`;

    const effectiveCreatorName =
      (data as any)?.creator?.name || data.supervisor?.name || creatorName;
    const effectiveCreatorRole =
      (data as any)?.creator?.role ||
      data.supervisor?.role ||
      currentUser?.title ||
      currentUser?.role ||
      'Ban Quản trị';

    const newTask: TaskItem = {
      id,
      code: data.code || code,
      title: data.title || 'Công việc mới chưa đặt tên',
      department: data.department || 'Ban Điều Hành',
      category: data.category || 'Chung',
      budget: data.budget || undefined,
      acceptanceCriteria: data.acceptanceCriteria || [],
      customFields: data.customFields || [],
      assignee: data.assignee ||
        (data.assignees && data.assignees[0]) || {
          name: effectiveCreatorName,
          role: 'Phụ trách',
        },
      assignees:
        data.assignees && data.assignees.length > 0
          ? data.assignees
          : data.assignee
            ? [data.assignee]
            : [],
      supervisor: data.supervisor || {
        name: effectiveCreatorName,
        role: effectiveCreatorRole,
      },
      collaborators: data.collaborators || [],
      status: (data.status as any) || 'TODO',
      priority: (data.priority as any) || 'MEDIUM',
      startDate: data.startDate || new Date().toISOString().split('T')[0],
      dueDate:
        data.dueDate ||
        new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      progress: Number(data.progress ?? 0),
      description: data.description || '',
      deliverables: data.deliverables || '',
      subtasks: data.subtasks || [],
      meeting: data.meeting || undefined,
      attachments: data.attachments || [],
      comments: [],
      history: [
        {
          id: `h-${Date.now()}`,
          action: 'Tạo công việc mới',
          actor: `${effectiveCreatorName} (${effectiveCreatorRole})`,
          timestamp: new Date()
            .toISOString()
            .replace('T', ' ')
            .substring(0, 16),
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.tasks.unshift(newTask);
    this.saveToFile();

    // Tự động bắn thông báo tức thì đến tài khoản người được giao việc
    this.dispatchTaskAssignmentNotification(
      newTask,
      effectiveCreatorName,
    ).catch((err) => {
      this.logger.warn(`Task notification warning: ${err?.message}`);
    });

    return newTask;
  }

  async updateTask(
    id: string,
    data: Partial<TaskItem>,
    updaterName = 'Người quản trị',
    currentUser?: any,
  ): Promise<TaskItem> {
    const index = this.tasks.findIndex((t) => t.id === id || t.code === id);
    if (index === -1) {
      throw new Error(`Không tìm thấy công việc với ID ${id}`);
    }

    const current = this.tasks[index];

    // Kiểm tra phạm vi cập nhật nếu thay đổi ban
    if (
      currentUser &&
      data.department &&
      data.department !== current.department &&
      currentUser.id !== '00000000-0000-0000-0000-000000000000' &&
      currentUser.username !== 'guest'
    ) {
      const role = (
        currentUser.role ||
        currentUser.srsRole ||
        'member'
      ).toLowerCase();
      const isPresident = Boolean(
        currentUser.isPresident || role === 'chu_tich' || role === 'president',
      );
      const isAdmin = Boolean(
        currentUser.isAdmin ||
        role === 'admin' ||
        role === 'quan_tri' ||
        currentUser.roles?.includes('admin'),
      );
      const isExecutive = Boolean(
        currentUser.isExecutive || role === 'ban_dieu_hanh' || role === 'bqt',
      );
      const isGeneralSecretary = Boolean(
        currentUser.isGeneralSecretary || role === 'tong_thu_ky',
      );
      const isDepartmentLeader = Boolean(
        currentUser.isDepartmentLeader || role.startsWith('truong_ban_'),
      );

      if (!isPresident && !isAdmin && !isExecutive) {
        if (
          isGeneralSecretary &&
          !data.department.toLowerCase().includes('thư ký')
        ) {
          throw new ForbiddenException(
            'Tổng thư ký chỉ có quyền điều chuyển công việc trong Ban Thư ký.',
          );
        } else if (isDepartmentLeader) {
          const userDept = (currentUser.department || '').toLowerCase().trim();
          const targetDept = (data.department || '').toLowerCase().trim();
          const normUserDept = userDept
            .replace(/quản trị/g, 'điều hành')
            .replace(/^ban\s+/i, '')
            .trim();
          const normTargetDept = targetDept
            .replace(/quản trị/g, 'điều hành')
            .replace(/^ban\s+/i, '')
            .trim();
          if (
            normUserDept &&
            normTargetDept &&
            !normTargetDept.includes(normUserDept) &&
            !normUserDept.includes(normTargetDept)
          ) {
            throw new ForbiddenException(
              `Trưởng ban chỉ có quyền điều chuyển công việc trong ${currentUser.department || 'chính ban của mình'}.`,
            );
          }
        }
      }
    }

    const changes: string[] = [];
    if (
      data.assignee &&
      (data.assignee.name !== current.assignee?.name ||
        data.assignee.id !== current.assignee?.id)
    ) {
      changes.push(
        `Giao việc cho: ${data.assignee.name} (${data.assignee.role || 'Phụ trách'})`,
      );
    }
    if (data.assignees && data.assignees.length > 0) {
      const names = data.assignees.map((a: any) => a.name).join(', ');
      changes.push(`Cập nhật danh sách người xử lý: ${names}`);
    }

    if (data.status && data.status !== current.status) {
      changes.push(`Đổi trạng thái từ ${current.status} sang ${data.status}`);
    }
    if (data.progress !== undefined && data.progress !== current.progress) {
      changes.push(`Đổi tiến độ sang ${data.progress}%`);
    }
    if (data.priority && data.priority !== current.priority) {
      changes.push(`Đổi mức ưu tiên sang ${data.priority}`);
    }

    const updated: TaskItem = {
      ...current,
      ...data,
      id: current.id,
      code: current.code,
      assignee:
        data.assignee ||
        (data.assignees && data.assignees[0]) ||
        current.assignee,
      assignees:
        data.assignees !== undefined ? data.assignees : current.assignees,
      updatedAt: new Date().toISOString(),
      history: [
        {
          id: `h-${Date.now()}`,
          action:
            changes.length > 0
              ? changes.join(', ')
              : 'Chỉnh sửa thông tin công việc',
          actor: updaterName,
          timestamp: new Date()
            .toISOString()
            .replace('T', ' ')
            .substring(0, 16),
        },
        ...current.history,
      ],
    };

    this.tasks[index] = updated;
    this.saveToFile();

    // Bắn thông báo cập nhật công việc đến người phụ trách
    if (data.assignee || (data.status && data.status !== current.status)) {
      this.dispatchTaskAssignmentNotification(updated, updaterName).catch(
        (err) => {
          this.logger.warn(`Task notification warning: ${err?.message}`);
        },
      );
    }

    return updated;
  }

  /**
   * Bắn thông báo giao việc đến tài khoản PostgreSQL của người được giao việc (business_notifications & member_notifications)
   */

  async getAllAssignmentHistory(): Promise<any[]> {
    const list: any[] = [];
    for (const t of this.tasks) {
      if (Array.isArray(t.history) && t.history.length > 0) {
        for (const h of t.history) {
          list.push({
            id: h.id || `h-${t.id}-${Math.random()}`,
            taskId: t.id,
            taskCode: t.code,
            taskTitle: t.title,
            department: t.department,
            action: h.action,
            actor: h.actor,
            timestamp: h.timestamp,
            assigneeName:
              t.assignee?.name ||
              (t.assignees && t.assignees[0]?.name) ||
              'Chưa gán',
            assigneeRole: t.assignee?.role || 'Phụ trách',
            assignees: t.assignees || (t.assignee ? [t.assignee] : []),
            creatorName:
              (t as any).creator?.name || t.supervisor?.name || 'Ban Quản trị',
            status: t.status,
            priority: t.priority,
            dueDate: t.dueDate,
          });
        }
      }
    }
    return list.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
  }

  async dispatchTaskAssignmentNotification(
    task: TaskItem,
    creatorName: string,
  ) {
    try {
      const allAssignees =
        task.assignees && task.assignees.length > 0
          ? task.assignees
          : task.assignee
            ? [task.assignee]
            : [];

      if (allAssignees.length === 0) return;

      for (const assignee of allAssignees) {
        const { name, email, id: assigneeId } = assignee;
        if (!name && !email && !assigneeId) continue;

        let targetUserId: string | null = null;
        let targetMemberId: string | null = null;

        // 1. Tìm theo Email
        if (email && email.trim()) {
          const u = await this.tasksRepo.findUserAndMemberByEmail(email.trim());
          if (u.length && u[0].user_id) {
            targetUserId = u[0].user_id;
            targetMemberId = u[0].member_id;
          }
        }

        // 2. Tìm theo assigneeId (nếu là UUID)
        if (
          !targetUserId &&
          assigneeId &&
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
            assigneeId,
          )
        ) {
          const u = await this.tasksRepo.findUserAndMemberById(assigneeId);
          if (u.length && u[0].user_id) {
            targetUserId = u[0].user_id;
            targetMemberId = u[0].member_id;
          }
        }

        // 3. Tìm theo Tên hội viên
        if (!targetUserId && name && name.trim()) {
          const u = await this.tasksRepo.findUserAndMemberByName(name.trim());
          if (u.length && u[0].user_id) {
            targetUserId = u[0].user_id;
            targetMemberId = u[0].member_id;
          }
        }

        const creatorDisplayName = (
          (task as any)?.creator?.name ||
          task.supervisor?.name ||
          creatorName ||
          'Ban Lãnh Đạo'
        ).trim();
        const creatorDisplayRole = (
          (task as any)?.creator?.role ||
          task.supervisor?.role ||
          'Người giao việc'
        ).trim();
        const resolvedEmail = (
          email ||
          process.env.ADMIN_NOTIFY_EMAIL ||
          'vupv090120@gmail.com'
        ).trim();
        const notifId = crypto.randomUUID();
        const notifTitle = `📋 [Giao việc từ ${creatorDisplayName}] ${task.title}`;
        const notifBody = `${creatorDisplayName} (${creatorDisplayRole}) đã giao việc cho bạn: "${task.title}". Hạn hoàn thành: ${task.dueDate}. Ban phụ trách: ${task.department}.`;
        const dedupeKey = `task-assign-${task.id}-${targetUserId || assigneeId || Date.now()}-${Date.now()}`;
        const safeData = JSON.stringify({
          title: notifTitle,
          body: notifBody,
          taskId: task.id,
          taskCode: task.code,
          taskTitle: task.title,
          department: task.department,
          dueDate: task.dueDate,
          priority: task.priority,
          targetRoute: '/tasks',
          assignedBy: creatorDisplayName,
          assignedByRole: creatorDisplayRole,
        });

        // 1. Ghi vào public.business_notifications nếu tìm được user_id
        if (targetUserId) {
          await this.tasksRepo.insertBusinessNotification(
            notifId,
            targetUserId,
            task.id,
            notifTitle,
            notifBody,
            safeData,
            dedupeKey,
          );
        }

        // 2. Ghi vào public.member_notifications (hiển thị cho Hội viên trên CRM và Mobile App)
        const memberRecipientId = targetMemberId || targetUserId || assigneeId;
        if (memberRecipientId) {
          await this.tasksRepo.insertMemberNotification(
            memberRecipientId,
            notifTitle,
            notifBody,
            task.id,
          );
        }

        // 3. Bắn email thông báo giao việc đến hộp thư của người được giao việc
        if (this.mailService) {
          this.mailService
            .sendTaskAssignmentEmail({
              to: resolvedEmail,
              assigneeName: name || 'Cán bộ phụ trách',
              taskCode: task.code,
              taskTitle: task.title,
              department: task.department,
              assignedBy: creatorDisplayName,
              assignedByRole: creatorDisplayRole,
              priority: task.priority,
              startDate: task.startDate,
              dueDate: task.dueDate,
              description: task.description,
              deliverables: task.deliverables,
            })
            .catch((err) => {
              this.logger.warn(
                `Lỗi gửi email giao việc ${task.code}: ${err?.message}`,
              );
            });
        }

        this.logger.log(
          `Đã gửi thông báo giao việc ${task.code} từ ${creatorDisplayName} thành công đến ${name} (${resolvedEmail || targetUserId || memberRecipientId})`,
        );
      }
    } catch (e: any) {
      this.logger.error(
        `Lỗi trong dispatchTaskAssignmentNotification: ${e?.message}`,
      );
    }
  }

  /**
   * Bắn email nhắc nhở tiến độ công việc và hạn chót cho người phụ trách
   */
  private async dispatchTaskReminderEmail(
    task: TaskItem,
    actorName: string,
    reminderCount: number,
    feedback?: string,
  ) {
    if (!this.mailService) return;
    try {
      const allAssignees =
        task.assignees && task.assignees.length > 0
          ? task.assignees
          : task.assignee
            ? [task.assignee]
            : [];

      for (const assignee of allAssignees) {
        let targetEmail = assignee.email;
        if (!targetEmail && assignee.id) {
          const u = await this.tasksRepo.findUserAndMemberById(assignee.id);
          if (u.length && u[0].email) targetEmail = u[0].email;
        }
        if (!targetEmail && assignee.name) {
          const u = await this.tasksRepo.findUserAndMemberByName(assignee.name);
          if (u.length && u[0].email) targetEmail = u[0].email;
        }
        const resolvedEmail = (
          targetEmail ||
          process.env.ADMIN_NOTIFY_EMAIL ||
          'vupv090120@gmail.com'
        ).trim();

        await this.mailService.sendTaskReminderEmail({
          to: resolvedEmail,
          assigneeName: assignee.name || 'Cán bộ phụ trách',
          taskCode: task.code,
          taskTitle: task.title,
          department: task.department,
          reminderCount,
          remindedBy: actorName,
          dueDate: task.dueDate,
          currentProgress: task.progress || 0,
          status: task.status,
          evaluationFeedback: feedback,
        });
        this.logger.log(
          `Đã gửi email nhắc nhở tiến độ công việc ${task.code} đến ${resolvedEmail}`,
        );
      }
    } catch (err: any) {
      this.logger.warn(
        `Lỗi gửi email nhắc nhở công việc ${task.code}: ${err?.message}`,
      );
    }
  }

  async updateStatus(
    id: string,
    status: TaskItem['status'],
    actorName = 'Người quản trị',
  ): Promise<TaskItem> {
    return this.updateTask(
      id,
      { status, progress: status === 'DONE' ? 100 : undefined },
      actorName,
    );
  }

  async updateProgress(
    id: string,
    progress: number,
    actorName = 'Người quản trị',
  ): Promise<TaskItem> {
    const status: TaskItem['status'] =
      progress >= 100 ? 'DONE' : progress > 0 ? 'IN_PROGRESS' : 'TODO';
    return this.updateTask(id, { progress, status }, actorName);
  }

  async addComment(
    id: string,
    comment: { content: string; authorName: string; authorRole?: string },
  ): Promise<TaskItem> {
    const task = await this.getTaskById(id);
    if (!task) throw new Error(`Không tìm thấy công việc ${id}`);

    const newComment: TaskComment = {
      id: `cm-${Date.now()}`,
      authorName: comment.authorName || 'Thành viên',
      authorRole: comment.authorRole || 'Hội viên',
      content: comment.content,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };

    task.comments.push(newComment);
    task.history.unshift({
      id: `h-${Date.now()}`,
      action: 'Bình luận thảo luận',
      actor: comment.authorName,
      timestamp: newComment.createdAt,
    });
    task.updatedAt = new Date().toISOString();

    this.saveToFile();
    return task;
  }

  async toggleSubtask(
    taskId: string,
    subtaskId: string,
    actorName = 'Người quản trị',
  ): Promise<TaskItem> {
    const task = await this.getTaskById(taskId);
    if (!task) throw new Error(`Không tìm thấy công việc ${taskId}`);

    const sub = task.subtasks.find((s) => s.id === subtaskId);
    if (sub) {
      sub.completed = !sub.completed;
      const completedCount = task.subtasks.filter((s) => s.completed).length;
      task.progress = Math.round((completedCount / task.subtasks.length) * 100);
      if (task.progress === 100) task.status = 'DONE';
      else if (task.progress > 0 && task.status === 'TODO')
        task.status = 'IN_PROGRESS';

      task.history.unshift({
        id: `h-${Date.now()}`,
        action: `${sub.completed ? 'Đánh dấu hoàn thành' : 'Bỏ hoàn thành'} mục: ${sub.title}`,
        actor: actorName,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      });
      task.updatedAt = new Date().toISOString();
      this.saveToFile();
    }

    return task;
  }

  async acceptTask(
    id: string,
    actorName = 'Người phụ trách',
  ): Promise<TaskItem> {
    const task = await this.getTaskById(id);
    if (!task) throw new Error(`Không tìm thấy công việc ${id}`);

    task.status = 'IN_PROGRESS';
    task.delegation = {
      ...task.delegation,
      acceptedAt: new Date().toISOString(),
      declinedAt: undefined,
      declineReason: undefined,
    };
    task.history.unshift({
      id: `h-${Date.now()}`,
      action: 'Tiếp nhận công việc và cam kết thực hiện',
      actor: actorName,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
    });
    task.updatedAt = new Date().toISOString();
    this.saveToFile();
    return task;
  }

  async declineTask(
    id: string,
    reason: string,
    actorName = 'Người phụ trách',
  ): Promise<TaskItem> {
    const task = await this.getTaskById(id);
    if (!task) throw new Error(`Không tìm thấy công việc ${id}`);

    task.delegation = {
      ...task.delegation,
      declinedAt: new Date().toISOString(),
      declineReason: reason,
    };
    task.history.unshift({
      id: `h-${Date.now()}`,
      action: `Từ chối tiếp nhận công việc: "${reason}"`,
      actor: actorName,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
    });
    task.updatedAt = new Date().toISOString();
    this.saveToFile();
    return task;
  }

  async submitTaskReview(
    id: string,
    payload: { deliverables?: string; note?: string },
    actorName = 'Người phụ trách',
  ): Promise<TaskItem> {
    const task = await this.getTaskById(id);
    if (!task) throw new Error(`Không tìm thấy công việc ${id}`);

    task.status = 'REVIEW';
    task.progress = Math.max(task.progress, 90);
    if (payload.deliverables) {
      task.deliverables = payload.deliverables;
    }
    task.delegation = {
      ...task.delegation,
      submittedAt: new Date().toISOString(),
      submissionNote: payload.note,
      submissionDeliverables: payload.deliverables,
    };
    task.history.unshift({
      id: `h-${Date.now()}`,
      action: `Gửi báo cáo nghiệm thu hoàn thành: "${payload.note || 'Đã nộp kết quả công việc'}"`,
      actor: actorName,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
    });
    task.updatedAt = new Date().toISOString();
    this.saveToFile();
    return task;
  }

  async approveTask(
    id: string,
    payload: { rating?: number; feedback?: string },
    actorName = 'Ban Quản trị',
  ): Promise<TaskItem> {
    const task = await this.getTaskById(id);
    if (!task) throw new Error(`Không tìm thấy công việc ${id}`);

    task.status = 'DONE';
    task.progress = 100;
    task.delegation = {
      ...task.delegation,
      approvedAt: new Date().toISOString(),
      approvedBy: actorName,
      approvalRating: payload.rating || 5,
      approvalFeedback: payload.feedback || 'Nghiệm thu đạt chuẩn yêu cầu',
    };
    task.history.unshift({
      id: `h-${Date.now()}`,
      action: `Phê duyệt nghiệm thu hoàn thành (${payload.rating || 5} sao): "${payload.feedback || 'Đạt yêu cầu'}"`,
      actor: actorName,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
    });
    task.updatedAt = new Date().toISOString();
    this.saveToFile();
    return task;
  }

  async requestTaskRework(
    id: string,
    reason: string,
    actorName = 'Ban Quản trị',
  ): Promise<TaskItem> {
    const task = await this.getTaskById(id);
    if (!task) throw new Error(`Không tìm thấy công việc ${id}`);

    task.status = 'IN_PROGRESS';
    task.delegation = {
      ...task.delegation,
      reworkRequestedAt: new Date().toISOString(),
      reworkReason: reason,
    };
    task.history.unshift({
      id: `h-${Date.now()}`,
      action: `Yêu cầu chỉnh sửa / làm lại: "${reason}"`,
      actor: actorName,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
    });
    task.updatedAt = new Date().toISOString();
    this.saveToFile();
    return task;
  }

  async remindTask(id: string, actorName = 'Ban Quản trị'): Promise<TaskItem> {
    const task = await this.getTaskById(id);
    if (!task) throw new Error(`Không tìm thấy công việc ${id}`);

    const newCount = (task.delegation?.reminderCount || 0) + 1;
    task.delegation = {
      ...task.delegation,
      lastRemindedAt: new Date().toISOString(),
      reminderCount: newCount,
    };
    task.history.unshift({
      id: `h-${Date.now()}`,
      action: `Gửi nhắc nhở hạn chót & đôn đốc tiến độ (Lần ${newCount})`,
      actor: actorName,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
    });
    task.updatedAt = new Date().toISOString();
    this.saveToFile();

    // Bắn thông báo nhắc nhở đến người phụ trách
    this.dispatchTaskAssignmentNotification(
      task,
      `${actorName} (Nhắc nhở đôn đốc lần ${newCount})`,
    ).catch((err) => {
      this.logger.warn(`Reminder notification error: ${err?.message}`);
    });
    this.dispatchTaskReminderEmail(task, actorName, newCount).catch(() => {});

    return task;
  }

  async evaluateProgress(
    id: string,
    payload: {
      rating?: number;
      statusAssessment: 'ON_TRACK' | 'AT_RISK' | 'DELAYED' | 'AHEAD';
      feedback: string;
    },
    actorName = 'Ban Quản trị',
  ): Promise<TaskItem> {
    const task = await this.getTaskById(id);
    if (!task) throw new Error(`Không tìm thấy công việc ${id}`);

    const evalItem: TaskProgressEvaluation = {
      id: `eval-${Date.now()}`,
      evaluatedAt: new Date().toISOString(),
      evaluatorName: actorName,
      evaluatorRole: 'Giám sát / Ban Quản trị',
      rating: payload.rating || 5,
      statusAssessment: payload.statusAssessment || 'ON_TRACK',
      feedback: payload.feedback || 'Tiến độ được đánh giá đạt yêu cầu',
    };

    if (!task.evaluations) task.evaluations = [];
    task.evaluations.unshift(evalItem);

    const assessmentLabels: Record<string, string> = {
      ON_TRACK: 'Đúng tiến độ',
      AT_RISK: 'Có nguy cơ trễ hạn',
      DELAYED: 'Chậm tiến độ / Cần can thiệp',
      AHEAD: 'Vượt tiến độ',
    };

    task.delegation = {
      ...task.delegation,
      lastEvaluatedAt: evalItem.evaluatedAt,
      lastEvaluationAssessment: evalItem.statusAssessment,
    };

    task.history.unshift({
      id: `h-${Date.now()}`,
      action: `Đánh giá tiến độ (${assessmentLabels[evalItem.statusAssessment] || evalItem.statusAssessment}${payload.rating ? ` - ${payload.rating} sao` : ''}): "${evalItem.feedback}"`,
      actor: actorName,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
    });

    task.updatedAt = new Date().toISOString();
    this.saveToFile();

    // Bắn thông báo đánh giá tiến độ đến người phụ trách
    this.dispatchTaskAssignmentNotification(
      task,
      `${actorName} (Đã đánh giá tiến độ: ${assessmentLabels[evalItem.statusAssessment] || ''})`,
    ).catch((err) => {
      this.logger.warn(`Evaluation notification error: ${err?.message}`);
    });
    this.dispatchTaskReminderEmail(
      task,
      actorName,
      task.delegation?.reminderCount || 1,
      `${assessmentLabels[evalItem.statusAssessment] || evalItem.statusAssessment}: ${evalItem.feedback}`,
    ).catch(() => {});

    return task;
  }

  async addAttachment(
    id: string,
    attachment: {
      name: string;
      url: string;
      size?: string;
      type?: string;
      isDeliverable?: boolean;
    },
    actorName = 'Người dùng',
  ): Promise<TaskItem> {
    const task = await this.getTaskById(id);
    if (!task) throw new Error(`Không tìm thấy công việc ${id}`);

    const newAtt: TaskAttachment = {
      id: `att-${Date.now()}`,
      name: attachment.name,
      url: attachment.url,
      size: attachment.size || '1.0 MB',
      type: attachment.type || 'application/octet-stream',
      uploadedBy: actorName,
      uploadedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      isDeliverable: !!attachment.isDeliverable,
    };

    if (!task.attachments) task.attachments = [];
    task.attachments.push(newAtt);

    task.history.unshift({
      id: `h-${Date.now()}`,
      action: `${newAtt.isDeliverable ? 'Nộp file kết quả / deliverable' : 'Tải lên tài liệu đính kèm'}: "${newAtt.name}"`,
      actor: actorName,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
    });

    task.updatedAt = new Date().toISOString();
    this.saveToFile();
    return task;
  }

  async deleteAttachment(
    id: string,
    attachmentIndexOrId: number | string,
    actorName = 'Người dùng',
  ): Promise<TaskItem> {
    const task = await this.getTaskById(id);
    if (!task) throw new Error(`Không tìm thấy công việc ${id}`);
    if (!task.attachments || task.attachments.length === 0) return task;

    let removedName = '';
    if (
      typeof attachmentIndexOrId === 'number' ||
      !isNaN(Number(attachmentIndexOrId))
    ) {
      const idx = Number(attachmentIndexOrId);
      if (idx >= 0 && idx < task.attachments.length) {
        removedName = task.attachments[idx].name;
        task.attachments.splice(idx, 1);
      }
    } else {
      const idx = task.attachments.findIndex(
        (a) => a.id === attachmentIndexOrId,
      );
      if (idx !== -1) {
        removedName = task.attachments[idx].name;
        task.attachments.splice(idx, 1);
      }
    }

    if (removedName) {
      task.history.unshift({
        id: `h-${Date.now()}`,
        action: `Xóa tài liệu đính kèm: "${removedName}"`,
        actor: actorName,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      });
      task.updatedAt = new Date().toISOString();
      this.saveToFile();
    }

    return task;
  }

  async deleteTask(id: string): Promise<{ success: boolean }> {
    const initialLen = this.tasks.length;
    this.tasks = this.tasks.filter((t) => t.id !== id && t.code !== id);
    this.saveToFile();
    return { success: this.tasks.length < initialLen };
  }
}
