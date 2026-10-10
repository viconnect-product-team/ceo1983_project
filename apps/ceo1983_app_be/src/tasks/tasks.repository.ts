import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { PrismaService } from '../prisma/prisma.service';
import { TaskItem } from './dto';

@Injectable()
export class TasksRepository {
  private readonly logger = new Logger(TasksRepository.name);
  private readonly storageFilePath = path.join(process.cwd(), 'uploads', 'tasks_data.json');
  private tasks: TaskItem[] = [];

  constructor(private readonly prisma: PrismaService) {
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
    ];
  }

  getAll(): TaskItem[] {
    return this.tasks;
  }

  saveAll(tasks: TaskItem[]) {
    this.tasks = tasks;
    this.saveToFile();
  }

  findById(id: string): TaskItem | undefined {
    return this.tasks.find((t) => t.id === id || t.code === id);
  }

  insert(task: TaskItem) {
    this.tasks.unshift(task);
    this.saveToFile();
  }

  update(task: TaskItem) {
    const idx = this.tasks.findIndex((t) => t.id === task.id);
    if (idx !== -1) {
      this.tasks[idx] = task;
      this.saveToFile();
    }
  }

  delete(id: string): boolean {
    const initLen = this.tasks.length;
    this.tasks = this.tasks.filter((t) => t.id !== id && t.code !== id);
    if (this.tasks.length !== initLen) {
      this.saveToFile();
      return true;
    }
    return false;
  }

  // ── USER / MEMBER NOTIFICATIONS ──────────────────────────────────────────

  async findUserAndMemberByEmail(email: string): Promise<any[]> {
    return this.prisma.$queryRaw<any[]>`
      SELECT u.id as user_id, m.id as member_id
      FROM public.vione_users u
      LEFT JOIN public.members m ON m.user_id = u.id OR lower(m.email) = lower(u.email)
      WHERE lower(u.email) = lower(${email.trim()})
      LIMIT 1
    `.catch(() => []);
  }

  async findUserAndMemberById(assigneeId: string): Promise<any[]> {
    return this.prisma.$queryRaw<any[]>`
      SELECT u.id as user_id, m.id as member_id
      FROM public.members m
      LEFT JOIN public.vione_users u ON m.user_id = u.id
      WHERE m.id = ${assigneeId}::uuid OR m.user_id = ${assigneeId}::uuid OR u.id = ${assigneeId}::uuid
      LIMIT 1
    `.catch(() => []);
  }

  async findUserAndMemberByName(name: string): Promise<any[]> {
    return this.prisma.$queryRaw<any[]>`
      SELECT u.id as user_id, m.id as member_id
      FROM public.members m
      LEFT JOIN public.vione_users u ON m.user_id = u.id
      WHERE lower(m.name) ILIKE '%' || lower(${name.trim()}) || '%'
         OR lower(u.name) ILIKE '%' || lower(${name.trim()}) || '%'
      LIMIT 1
    `.catch(() => []);
  }

  async insertBusinessNotification(notifId: string, targetUserId: string, taskId: string, notifTitle: string, notifBody: string, safeData: string, dedupeKey: string): Promise<void> {
    await this.prisma.$executeRawUnsafe(`
      INSERT INTO public.business_notifications (
        id, recipient_user_id, source_domain, source_record_id, event_kind, notification_kind,
        title_key, body_key, safe_display_data, priority, status, delivered_at, dedupe_key, app_scope, target_app, created_at, updated_at
      ) VALUES (
        $1::uuid, $2::uuid, 'task', $3, 'task_assigned', 'task_created',
        $4, $5, $6::jsonb, 'high', 'delivered', NOW(), $7, 'all', 'all', NOW(), NOW()
      )
    `, notifId, targetUserId, taskId, notifTitle, notifBody, safeData, dedupeKey).catch((err: any) => {
      this.logger.warn(`Lỗi ghi business_notification: ${err.message}`);
    });
  }

  async insertMemberNotification(recipientId: string, notifTitle: string, notifBody: string, taskId: string): Promise<void> {
    await this.prisma.$executeRawUnsafe(`
      INSERT INTO public.member_notifications (
        id, recipient_id, type, title, body, read, dismissed, ref_type, ref_id, created_at
      ) VALUES (
        gen_random_uuid(), $1, 'task', $2, $3, false, false, 'task', $4, NOW()
      )
    `, recipientId, notifTitle, notifBody, taskId).catch((err: any) => {
      this.logger.warn(`Lỗi ghi member_notification: ${err.message}`);
    });
  }
}
