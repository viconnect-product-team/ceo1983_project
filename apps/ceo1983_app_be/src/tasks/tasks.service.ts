import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { TasksRepository } from './tasks.repository';
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
  private readonly storageFilePath = path.join(process.cwd(), 'uploads', 'tasks_data.json');
  private tasks: TaskItem[] = [];

  constructor(
    private readonly tasksRepo: TasksRepository,
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
      fs.writeFileSync(this.storageFilePath, JSON.stringify(this.tasks, null, 2), 'utf8');
    } catch (err: any) {
      this.logger.error(`Error saving tasks: ${err.message}`);
    }
  }

  private seedInitialTasks() {
    this.tasks = [
      {
        id: 'task-1983-001',
        code: 'CV-1983-01',
        title: 'Tổ chức Chương trình Thiện nguyện “Áo Ấm Cho Em” Mùa Đông 2026',
        department: 'Ban Thiện nguyện',
        assignee: {
          id: 'user-tn-01',
          name: 'Nguyễn Thị Hương',
          avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
          role: 'Trưởng Ban Thiện nguyện',
          email: 'huong.nguyen@ceo1983.com',
        },
        supervisor: {
          name: 'Chủ tịch CLB CEO 1983',
          role: 'Ban Quản trị',
        },
        collaborators: [
          { id: 'c1', name: 'Trần Văn Nam', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' },
          { id: 'c2', name: 'Lê Hoàng Yến', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150' },
        ],
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        startDate: '2026-09-15',
        dueDate: '2026-10-15',
        progress: 65,
        description: 'Vận động quyên góp 500 suất quà và áo ấm cho học sinh nghèo vượt khó tại điểm trường Hà Giang. Khảo sát địa điểm, lập danh sách các hoàn cảnh khó khăn và điều phối xe vận chuyển.',
        deliverables: '500 suất quà trị giá 500.000đ/suất, 20 suất học bổng, phóng sự ảnh và video truyền thông cho hiệp hội.',
        subtasks: [
          { id: 'st-1', title: 'Khảo sát địa điểm và liên hệ chính quyền xã', completed: true },
          { id: 'st-2', title: 'Kêu gọi đóng góp từ hội viên CEO 1983', completed: true },
          { id: 'st-3', title: 'Đặt may áo ấm đồng phục và mua sắm dụng cụ học tập', completed: false },
          { id: 'st-4', title: 'Tổ chức đoàn xe xuất phát và trao quà trực tiếp', completed: false },
        ],
        attachments: [
          { name: 'Ke_hoach_Thien_nguyen_HaGiang_2026.pdf', url: '#', size: '2.4 MB' },
          { name: 'Du_toan_ngan_sach.xlsx', url: '#', size: '150 KB' },
        ],
        comments: [
          {
            id: 'cm-1',
            authorName: 'Nguyễn Thị Hương',
            authorRole: 'Trưởng Ban Thiện nguyện',
            content: 'Đã hoàn tất kêu gọi được 150 triệu đồng từ 28 doanh nghiệp hội viên.',
            createdAt: '2026-09-25 10:30',
          },
          {
            id: 'cm-2',
            authorName: 'Ban Quản trị',
            authorRole: 'Chủ tịch CLB',
            content: 'Tuyệt vời, Ban Truyền thông hỗ trợ phóng sự ảnh trước ngày 05/10 nhé.',
            createdAt: '2026-09-26 14:15',
          },
        ],
        history: [
          { id: 'h-1', action: 'Tạo công việc', actor: 'Ban Quản trị', timestamp: '2026-09-15 08:00' },
          { id: 'h-2', action: 'Cập nhật tiến độ 65%', actor: 'Nguyễn Thị Hương', timestamp: '2026-09-25 10:30' },
        ],
        createdAt: '2026-09-15T08:00:00.000Z',
        updatedAt: '2026-09-25T10:30:00.000Z',
      },
      {
        id: 'task-1983-002',
        code: 'CV-1983-02',
        title: 'Sản xuất Video Teaser & Bộ Nhận diện Gala Kỷ niệm CEO 1983',
        department: 'Ban Truyền thông',
        assignee: {
          id: 'user-tt-01',
          name: 'Trần Minh Quân',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
          role: 'Trưởng Ban Truyền thông',
          email: 'quan.tran@ceo1983.com',
        },
        supervisor: {
          name: 'Tổng Thư Ký Hiệp Hội',
          role: 'Ban Quản trị',
        },
        collaborators: [
          { id: 'c3', name: 'Phạm Thuỳ Chi', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' },
        ],
        status: 'REVIEW',
        priority: 'CRITICAL',
        startDate: '2026-09-10',
        dueDate: '2026-09-30',
        progress: 90,
        description: 'Thiết kế key visual, trailer 60 giây và các ấn phẩm backdrop, standee, vé mời điện tử có mã QR check-in cho sự kiện kỷ niệm thành lập.',
        deliverables: 'File gốc Illustrator/Photoshop, Video 4K 60s, 3 video reel TikTok/Facebook.',
        subtasks: [
          { id: 'st-5', title: 'Chốt kịch bản video trailer và lời bình', completed: true },
          { id: 'st-6', title: 'Quay phỏng vấn 5 CEO tiêu biểu', completed: true },
          { id: 'st-7', title: 'Dựng video bản nháp 1 và lấy ý kiến BQT', completed: true },
          { id: 'st-8', title: 'Render bản Master 4K và đóng gói ấn phẩm', completed: false },
        ],
        attachments: [
          { name: 'Trailer_Draft_v2.mp4', url: '#', size: '128 MB' },
          { name: 'KeyVisual_Master_2026.ai', url: '#', size: '45 MB' },
        ],
        comments: [
          {
            id: 'cm-3',
            authorName: 'Trần Minh Quân',
            authorRole: 'Trưởng Ban Truyền thông',
            content: 'Đã gửi bản nháp video lên nhóm BQT kiểm duyệt, chờ phản hồi cuối.',
            createdAt: '2026-09-28 09:00',
          },
        ],
        history: [
          { id: 'h-3', action: 'Chuyển trạng thái sang Chờ nghiệm thu', actor: 'Trần Minh Quân', timestamp: '2026-09-28 09:00' },
        ],
        createdAt: '2026-09-10T09:00:00.000Z',
        updatedAt: '2026-09-28T09:00:00.000Z',
      },
      {
        id: 'task-1983-003',
        code: 'CV-1983-03',
        title: 'Thẩm định Hồ sơ và Cấp Thẻ Doanh Nhân NFC cho 15 Hội viên mới',
        department: 'Ban Thành viên',
        assignee: {
          id: 'user-tv-01',
          name: 'Đặng Tuấn Anh',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
          role: 'Trưởng Ban Thành viên',
          email: 'tuananh.dang@ceo1983.com',
        },
        supervisor: {
          name: 'Phó Chủ tịch Phụ trách Hội viên',
          role: 'Ban Quản trị',
        },
        status: 'TODO',
        priority: 'MEDIUM',
        startDate: '2026-09-28',
        dueDate: '2026-10-08',
        progress: 20,
        description: 'Kiểm tra thông tin đăng ký công ty, giấy phép kinh doanh, đối soát thông tin với form đăng ký web và tiến hành khắc laser in thẻ NFC kim loại cho các doanh nhân mới gia nhập.',
        deliverables: '15 bộ hồ sơ được duyệt, 15 thẻ NFC trao tận tay tại buổi gặp gỡ tháng 10.',
        subtasks: [
          { id: 'st-9', title: 'Kiểm tra hồ sơ online và liên hệ xác nhận', completed: true },
          { id: 'st-10', title: 'Xuất file mã QR định danh cho từng doanh nhân', completed: false },
          { id: 'st-11', title: 'Đặt khắc thẻ kim loại NFC', completed: false },
        ],
        comments: [],
        history: [
          { id: 'h-4', action: 'Khởi tạo công việc', actor: 'Đặng Tuấn Anh', timestamp: '2026-09-28 14:00' },
        ],
        createdAt: '2026-09-28T14:00:00.000Z',
        updatedAt: '2026-09-28T14:00:00.000Z',
      },
      {
        id: 'task-1983-004',
        code: 'CV-1983-04',
        title: 'Đối soát Phí Niên Liễm và Báo cáo Thu Chi Quý 3/2026',
        department: 'Ban Quản trị',
        assignee: {
          id: 'user-tc-01',
          name: 'Hoàng Bích Liên',
          avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
          role: 'Ban Quản trị',
          email: 'lien.hoang@ceo1983.com',
        },
        supervisor: {
          name: 'Chủ tịch CLB CEO 1983',
          role: 'Ban Quản trị',
        },
        status: 'DONE',
        priority: 'HIGH',
        startDate: '2026-09-01',
        dueDate: '2026-09-25',
        progress: 100,
        description: 'Tổng hợp số liệu hội phí từ tài khoản ngân hàng Quân Đội (MB Bank), phân loại các khoản thu tài trợ sự kiện và chi phí hoạt động quý 3.',
        deliverables: 'Báo cáo tài chính minh bạch có chữ ký Trưởng Ban và Thư ký, công khai trên ứng dụng CEO 1983.',
        subtasks: [
          { id: 'st-12', title: 'Sao kê ngân hàng tháng 7, 8, 9', completed: true },
          { id: 'st-13', title: 'Khớp lệnh giao dịch VietQR tự động trên hệ thống', completed: true },
          { id: 'st-14', title: 'Xuất báo cáo PDF gửi BQT duyệt', completed: true },
        ],
        comments: [
          {
            id: 'cm-4',
            authorName: 'Hoàng Bích Liên',
            authorRole: 'Ban Quản trị',
            content: 'Đã hoàn thành và báo cáo tại buổi họp BQT hôm qua.',
            createdAt: '2026-09-25 16:30',
          },
        ],
        history: [
          { id: 'h-5', action: 'Hoàn thành công việc 100%', actor: 'Hoàng Bích Liên', timestamp: '2026-09-25 16:30' },
        ],
        createdAt: '2026-09-01T08:00:00.000Z',
        updatedAt: '2026-09-25T16:30:00.000Z',
      },
      {
        id: 'task-1983-005',
        code: 'CV-1983-05',
        title: 'Khảo sát Địa điểm Tổ chức Hội nghị Xúc tiến Thương mại Quốc tế',
        department: 'Ban Xúc tiến',
        assignee: {
          id: 'user-sk-01',
          name: 'Vũ Đức Thắng',
          avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150',
          role: 'Trưởng Ban Xúc tiến',
          email: 'thang.vu@ceo1983.com',
        },
        supervisor: {
          name: 'Phó Chủ tịch Thường trực',
          role: 'Ban Quản trị',
        },
        status: 'OVERDUE',
        priority: 'CRITICAL',
        startDate: '2026-09-05',
        dueDate: '2026-09-22',
        progress: 50,
        description: 'Khảo sát 3 trung tâm hội nghị tiêu chuẩn 5 sao (JW Marriott, Lotte, Melia) với sức chứa 300 khách, bao gồm phòng VIP tiếp đón và khu vực triển lãm gian hàng kết nối giao thương.',
        deliverables: 'Bảng so sánh chi phí, hợp đồng nguyên tắc và sơ đồ mặt bằng gian hàng.',
        subtasks: [
          { id: 'st-15', title: 'Khảo sát thực địa JW Marriott', completed: true },
          { id: 'st-16', title: 'Khảo sát thực địa Khách sạn Lotte', completed: true },
          { id: 'st-17', title: 'Đàm phán chính sách ưu đãi tài trợ', completed: false },
        ],
        comments: [
          {
            id: 'cm-5',
            authorName: 'Vũ Đức Thắng',
            authorRole: 'Trưởng Ban Sự kiện',
            content: 'Đang chờ giám đốc kinh doanh Melia gửi bảng báo giá chi tiết trong hôm nay.',
            createdAt: '2026-09-23 11:20',
          },
        ],
        history: [
          { id: 'h-6', action: 'Hệ thống đánh dấu Quá hạn', actor: 'Hệ thống tự động', timestamp: '2026-09-23 00:00' },
        ],
        createdAt: '2026-09-05T08:00:00.000Z',
        updatedAt: '2026-09-23T11:20:00.000Z',
      },
    ];
  }

  async getAllTasks(filters?: {
    department?: string;
    status?: string;
    priority?: string;
    keyword?: string;
  }): Promise<TaskItem[]> {
    let list = [...this.tasks];

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
          t.assignee.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q),
      );
    }

    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getTaskById(id: string): Promise<TaskItem | null> {
    return this.tasks.find((t) => t.id === id || t.code === id) || null;
  }

  async createTask(data: Partial<TaskItem>, creatorName = 'Người quản trị'): Promise<TaskItem> {
    const nextNum = this.tasks.length + 1;
    const code = `CV-1983-${String(nextNum).padStart(2, '0')}`;
    const id = `task-1983-${Date.now()}`;

    const newTask: TaskItem = {
      id,
      code: data.code || code,
      title: data.title || 'Công việc mới chưa đặt tên',
      department: data.department || 'Ban Quản trị & Thư ký',
      assignee: data.assignee || {
        name: creatorName,
        role: 'Phụ trách',
      },
      supervisor: data.supervisor || {
        name: 'Ban Quản trị',
        role: 'Giám sát',
      },
      collaborators: data.collaborators || [],
      status: (data.status as any) || 'TODO',
      priority: (data.priority as any) || 'MEDIUM',
      startDate: data.startDate || new Date().toISOString().split('T')[0],
      dueDate: data.dueDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
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
          actor: creatorName,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.tasks.unshift(newTask);
    this.saveToFile();

    // Tự động bắn thông báo tức thì đến tài khoản người được giao việc
    this.dispatchTaskAssignmentNotification(newTask, creatorName).catch((err) => {
      this.logger.warn(`Task notification warning: ${err?.message}`);
    });

    return newTask;
  }

  async updateTask(id: string, data: Partial<TaskItem>, updaterName = 'Người quản trị'): Promise<TaskItem> {
    const index = this.tasks.findIndex((t) => t.id === id || t.code === id);
    if (index === -1) {
      throw new Error(`Không tìm thấy công việc với ID ${id}`);
    }

    const current = this.tasks[index];
    const changes: string[] = [];

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
      updatedAt: new Date().toISOString(),
      history: [
        {
          id: `h-${Date.now()}`,
          action: changes.length > 0 ? changes.join(', ') : 'Chỉnh sửa thông tin công việc',
          actor: updaterName,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        },
        ...current.history,
      ],
    };

    this.tasks[index] = updated;
    this.saveToFile();

    // Bắn thông báo cập nhật công việc đến người phụ trách
    if (data.assignee || (data.status && data.status !== current.status)) {
      this.dispatchTaskAssignmentNotification(updated, updaterName).catch((err) => {
        this.logger.warn(`Task notification warning: ${err?.message}`);
      });
    }

    return updated;
  }

  /**
   * Bắn thông báo giao việc đến tài khoản PostgreSQL của người được giao việc (business_notifications & member_notifications)
   */
  async dispatchTaskAssignmentNotification(task: TaskItem, creatorName: string) {
    try {
      if (!task.assignee) return;
      const { name, email, id: assigneeId } = task.assignee;

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
      if (!targetUserId && assigneeId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(assigneeId)) {
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

      if (!targetUserId) {
        this.logger.warn(`Không tìm thấy user_id PostgreSQL cho người nhận việc: ${name} (${email})`);
        return;
      }

      const notifId = crypto.randomUUID();
      const notifTitle = `Bạn được giao công việc mới: ${task.title}`;
      const notifBody = `Phòng ban: ${task.department}. Hạn hoàn thành: ${task.dueDate}. Người giao: ${creatorName}.`;
      const dedupeKey = `task-assign-${task.id}-${targetUserId}-${Date.now()}`;
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
      });

      // 1. Ghi vào public.business_notifications
      await this.tasksRepo.insertBusinessNotification(notifId, targetUserId, task.id, notifTitle, notifBody, safeData, dedupeKey);

      // 2. Ghi vào public.member_notifications
      await this.tasksRepo.insertMemberNotification(targetMemberId || targetUserId, notifTitle, notifBody, task.id);

      this.logger.log(`Đã gửi thông báo giao việc ${task.code} thành công đến user ${targetUserId}`);
    } catch (e: any) {
      this.logger.error(`Lỗi trong dispatchTaskAssignmentNotification: ${e?.message}`);
    }
  }

  async updateStatus(id: string, status: TaskItem['status'], actorName = 'Người quản trị'): Promise<TaskItem> {
    return this.updateTask(id, { status, progress: status === 'DONE' ? 100 : undefined }, actorName);
  }

  async updateProgress(id: string, progress: number, actorName = 'Người quản trị'): Promise<TaskItem> {
    const status: TaskItem['status'] = progress >= 100 ? 'DONE' : progress > 0 ? 'IN_PROGRESS' : 'TODO';
    return this.updateTask(id, { progress, status }, actorName);
  }

  async addComment(id: string, comment: { content: string; authorName: string; authorRole?: string }): Promise<TaskItem> {
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

  async toggleSubtask(taskId: string, subtaskId: string, actorName = 'Người quản trị'): Promise<TaskItem> {
    const task = await this.getTaskById(taskId);
    if (!task) throw new Error(`Không tìm thấy công việc ${taskId}`);

    const sub = task.subtasks.find((s) => s.id === subtaskId);
    if (sub) {
      sub.completed = !sub.completed;
      const completedCount = task.subtasks.filter((s) => s.completed).length;
      task.progress = Math.round((completedCount / task.subtasks.length) * 100);
      if (task.progress === 100) task.status = 'DONE';
      else if (task.progress > 0 && task.status === 'TODO') task.status = 'IN_PROGRESS';

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

  async acceptTask(id: string, actorName = 'Người phụ trách'): Promise<TaskItem> {
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

  async declineTask(id: string, reason: string, actorName = 'Người phụ trách'): Promise<TaskItem> {
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

  async requestTaskRework(id: string, reason: string, actorName = 'Ban Quản trị'): Promise<TaskItem> {
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
    this.dispatchTaskAssignmentNotification(task, `${actorName} (Nhắc nhở đôn đốc lần ${newCount})`).catch((err) => {
      this.logger.warn(`Reminder notification error: ${err?.message}`);
    });

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
    if (typeof attachmentIndexOrId === 'number' || !isNaN(Number(attachmentIndexOrId))) {
      const idx = Number(attachmentIndexOrId);
      if (idx >= 0 && idx < task.attachments.length) {
        removedName = task.attachments[idx].name;
        task.attachments.splice(idx, 1);
      }
    } else {
      const idx = task.attachments.findIndex((a) => a.id === attachmentIndexOrId);
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
