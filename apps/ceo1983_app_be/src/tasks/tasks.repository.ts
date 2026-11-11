import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { PrismaService } from '../prisma/prisma.service';
import { TaskItem } from './dto';

@Injectable()
export class TasksRepository {
  private readonly logger = new Logger(TasksRepository.name);
  private readonly storageFilePath = path.join(
    process.cwd(),
    'uploads',
    'tasks_data.json',
  );
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

  async insertBusinessNotification(
    notifId: string,
    targetUserId: string,
    taskId: string,
    notifTitle: string,
    notifBody: string,
    safeData: string,
    dedupeKey: string,
  ): Promise<void> {
    await this.prisma
      .$executeRawUnsafe(
        `
      INSERT INTO public.business_notifications (
        id, recipient_user_id, source_domain, source_record_id, event_kind, notification_kind,
        title_key, body_key, safe_display_data, priority, status, delivered_at, dedupe_key, app_scope, target_app, created_at, updated_at
      ) VALUES (
        $1::uuid, $2::uuid, 'task', $3, 'task_assigned', 'task_created',
        $4, $5, $6::jsonb, 'high', 'delivered', NOW(), $7, 'crm', 'crm_web', NOW(), NOW()
      )
    `,
        notifId,
        targetUserId,
        taskId,
        notifTitle,
        notifBody,
        safeData,
        dedupeKey,
      )
      .catch((err: any) => {
        this.logger.warn(`Lỗi ghi business_notification: ${err.message}`);
      });
  }

  async insertMemberNotification(
    recipientId: string,
    notifTitle: string,
    notifBody: string,
    taskId: string,
  ): Promise<void> {
    await this.prisma
      .$executeRawUnsafe(
        `
      INSERT INTO public.member_notifications (
        id, recipient_id, type, title, body, read, dismissed, ref_type, ref_id, created_at
      ) VALUES (
        gen_random_uuid(), $1, 'task', $2, $3, false, false, 'task', $4, NOW()
      )
    `,
        recipientId,
        notifTitle,
        notifBody,
        taskId,
      )
      .catch((err: any) => {
        this.logger.warn(`Lỗi ghi member_notification: ${err.message}`);
      });
  }

  async getMembersForAssignment(deptKeyword?: string): Promise<any[]> {
    try {
      let members: any[] = [];
      if (deptKeyword) {
        members = await this.prisma.$queryRaw<any[]>`
          SELECT id, code, name, email, phone, COALESCE(company_name, '') as company, COALESCE(executive_role, '') as position, department, executive_role, avatar_url, user_id
          FROM public.members
          WHERE (status = 'approved' OR status = 'active' OR status IS NULL) AND (
            department ILIKE '%' || ${deptKeyword} || '%'
            OR executive_role ILIKE '%' || ${deptKeyword} || '%'
          )
          ORDER BY name ASC
        `.catch(() => []);
      }

      if (!members || members.length === 0) {
        members = await this.prisma.$queryRaw<any[]>`
          SELECT id, code, name, email, phone, COALESCE(company_name, '') as company, COALESCE(executive_role, '') as position, department, executive_role, avatar_url, user_id
          FROM public.members
          WHERE (status = 'approved' OR status = 'active' OR status IS NULL)
          ORDER BY department ASC, name ASC
        `.catch(() => []);
      }

      if (members.length === 0) {
        // Fallback: load users from vione_users
        const vUsers = await this.prisma.$queryRaw<any[]>`
          SELECT id, name, email, phone, avatar_url, 'Ban Điều Hành' as department, 'Hội viên' as position, '' as company, id as user_id
          FROM public.vione_users
          LIMIT 100
        `.catch(() => []);
        return vUsers;
      }

      return members;
    } catch (err: any) {
      this.logger.warn(`Could not load members from DB: ${err.message}`);
      return [];
    }
  }
}
