import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { PrismaService } from '../prisma/prisma.service';
import { TaskItem } from './dto';

@Injectable()
export class TasksRepository implements OnModuleInit {
  private readonly logger = new Logger(TasksRepository.name);
  private readonly storageFilePath = path.join(
    process.cwd(),
    'uploads',
    'tasks_data.json',
  );
  private memoryCache: TaskItem[] = [];

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await this.ensureInitialized();
  }

  private async ensureInitialized() {
    try {
      // 1. Tạo bảng tasks trong PostgreSQL nếu chưa tồn tại
      await this.prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS public.tasks (
          id VARCHAR(64) PRIMARY KEY,
          code VARCHAR(64) UNIQUE,
          title TEXT NOT NULL,
          department VARCHAR(100),
          category VARCHAR(100),
          status VARCHAR(50) DEFAULT 'TODO',
          priority VARCHAR(50) DEFAULT 'MEDIUM',
          progress INTEGER DEFAULT 0,
          start_date VARCHAR(50),
          due_date VARCHAR(50),
          description TEXT,
          deliverables TEXT,
          assignee JSONB DEFAULT '{}'::jsonb,
          assignees JSONB DEFAULT '[]'::jsonb,
          supervisor JSONB DEFAULT '{}'::jsonb,
          collaborators JSONB DEFAULT '[]'::jsonb,
          budget JSONB DEFAULT '{}'::jsonb,
          acceptance_criteria JSONB DEFAULT '[]'::jsonb,
          custom_fields JSONB DEFAULT '[]'::jsonb,
          subtasks JSONB DEFAULT '[]'::jsonb,
          meeting JSONB DEFAULT '{}'::jsonb,
          attachments JSONB DEFAULT '[]'::jsonb,
          comments JSONB DEFAULT '[]'::jsonb,
          history JSONB DEFAULT '[]'::jsonb,
          delegation JSONB DEFAULT '{}'::jsonb,
          evaluations JSONB DEFAULT '[]'::jsonb,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
      `);

      // 2. Tải dữ liệu từ database vào memoryCache
      const rows = await this.prisma.$queryRaw<any[]>`
        SELECT * FROM public.tasks ORDER BY created_at DESC
      `.catch(() => []);

      if (rows && rows.length > 0) {
        this.memoryCache = rows.map((r) => this.mapRowToTask(r));
        this.logger.log(`[TasksRepository] Đã tải ${this.memoryCache.length} công việc từ PostgreSQL.`);
      } else {
        // Nếu DB chưa có dữ liệu nhưng file json có dữ liệu, migrate sang PostgreSQL
        if (fs.existsSync(this.storageFilePath)) {
          try {
            const raw = fs.readFileSync(this.storageFilePath, 'utf8');
            const fileTasks = JSON.parse(raw);
            if (Array.isArray(fileTasks) && fileTasks.length > 0) {
              for (const t of fileTasks) {
                await this.insert(t);
              }
              this.logger.log(`[TasksRepository] Đã migrate ${fileTasks.length} công việc từ file sang PostgreSQL.`);
            }
          } catch (err: any) {
            this.logger.warn(`Lỗi migrate file sang DB: ${err.message}`);
          }
        }
      }
    } catch (err: any) {
      this.logger.error(`[TasksRepository] Lỗi khởi tạo database tasks: ${err.message}`);
    }
  }

  private mapRowToTask(r: any): TaskItem {
    return {
      id: r.id,
      code: r.code || r.id,
      title: r.title,
      department: r.department || 'Ban Điều Hành',
      category: r.category || '',
      status: r.status || 'TODO',
      priority: r.priority || 'MEDIUM',
      progress: Number(r.progress ?? 0),
      startDate: r.start_date || (r.created_at ? new Date(r.created_at).toISOString().split('T')[0] : ''),
      dueDate: r.due_date || '',
      description: r.description || '',
      deliverables: r.deliverables || '',
      assignee: typeof r.assignee === 'string' ? JSON.parse(r.assignee) : (r.assignee || {}),
      assignees: typeof r.assignees === 'string' ? JSON.parse(r.assignees) : (r.assignees || []),
      supervisor: typeof r.supervisor === 'string' ? JSON.parse(r.supervisor) : (r.supervisor || {}),
      collaborators: typeof r.collaborators === 'string' ? JSON.parse(r.collaborators) : (r.collaborators || []),
      budget: typeof r.budget === 'string' ? JSON.parse(r.budget) : (r.budget || {}),
      acceptanceCriteria: typeof r.acceptance_criteria === 'string' ? JSON.parse(r.acceptance_criteria) : (r.acceptance_criteria || []),
      customFields: typeof r.custom_fields === 'string' ? JSON.parse(r.custom_fields) : (r.custom_fields || []),
      subtasks: typeof r.subtasks === 'string' ? JSON.parse(r.subtasks) : (r.subtasks || []),
      meeting: typeof r.meeting === 'string' ? JSON.parse(r.meeting) : (r.meeting || {}),
      attachments: typeof r.attachments === 'string' ? JSON.parse(r.attachments) : (r.attachments || []),
      comments: typeof r.comments === 'string' ? JSON.parse(r.comments) : (r.comments || []),
      history: typeof r.history === 'string' ? JSON.parse(r.history) : (r.history || []),
      delegation: typeof r.delegation === 'string' ? JSON.parse(r.delegation) : (r.delegation || {}),
      evaluations: typeof r.evaluations === 'string' ? JSON.parse(r.evaluations) : (r.evaluations || []),
      createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
      updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : new Date().toISOString(),
    };
  }

  async getAll(): Promise<TaskItem[]> {
    try {
      const rows = await this.prisma.$queryRaw<any[]>`
        SELECT * FROM public.tasks ORDER BY created_at DESC
      `;
      if (rows && rows.length >= 0) {
        this.memoryCache = rows.map((r) => this.mapRowToTask(r));
        return this.memoryCache;
      }
    } catch (err: any) {
      this.logger.warn(`Lỗi getAll tasks từ DB: ${err.message}`);
    }
    return this.memoryCache;
  }

  getAllCached(): TaskItem[] {
    return this.memoryCache;
  }

  async findById(id: string): Promise<TaskItem | undefined> {
    try {
      const rows = await this.prisma.$queryRaw<any[]>`
        SELECT * FROM public.tasks WHERE id = ${id} OR code = ${id} LIMIT 1
      `;
      if (rows && rows.length > 0) {
        return this.mapRowToTask(rows[0]);
      }
    } catch (err: any) {
      this.logger.warn(`Lỗi findById task từ DB: ${err.message}`);
    }
    return this.memoryCache.find((t) => t.id === id || t.code === id);
  }

  async insert(task: TaskItem): Promise<void> {
    try {
      await this.prisma.$executeRawUnsafe(
        `
        INSERT INTO public.tasks (
          id, code, title, department, category, status, priority, progress,
          start_date, due_date, description, deliverables, assignee, assignees,
          supervisor, collaborators, budget, acceptance_criteria, custom_fields,
          subtasks, meeting, attachments, comments, history, delegation, evaluations,
          created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8,
          $9, $10, $11, $12, $13::jsonb, $14::jsonb,
          $15::jsonb, $16::jsonb, $17::jsonb, $18::jsonb, $19::jsonb,
          $20::jsonb, $21::jsonb, $22::jsonb, $23::jsonb, $24::jsonb, $25::jsonb, $26::jsonb,
          NOW(), NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          department = EXCLUDED.department,
          status = EXCLUDED.status,
          priority = EXCLUDED.priority,
          progress = EXCLUDED.progress,
          start_date = EXCLUDED.start_date,
          due_date = EXCLUDED.due_date,
          description = EXCLUDED.description,
          deliverables = EXCLUDED.deliverables,
          assignee = EXCLUDED.assignee,
          assignees = EXCLUDED.assignees,
          supervisor = EXCLUDED.supervisor,
          collaborators = EXCLUDED.collaborators,
          budget = EXCLUDED.budget,
          acceptance_criteria = EXCLUDED.acceptance_criteria,
          custom_fields = EXCLUDED.custom_fields,
          subtasks = EXCLUDED.subtasks,
          meeting = EXCLUDED.meeting,
          attachments = EXCLUDED.attachments,
          comments = EXCLUDED.comments,
          history = EXCLUDED.history,
          delegation = EXCLUDED.delegation,
          evaluations = EXCLUDED.evaluations,
          updated_at = NOW()
      `,
        task.id,
        task.code,
        task.title,
        task.department || 'Ban Điều Hành',
        task.category || '',
        task.status || 'TODO',
        task.priority || 'MEDIUM',
        task.progress ?? 0,
        task.startDate || '',
        task.dueDate || '',
        task.description || '',
        task.deliverables || '',
        JSON.stringify(task.assignee || {}),
        JSON.stringify(task.assignees || []),
        JSON.stringify(task.supervisor || {}),
        JSON.stringify(task.collaborators || []),
        JSON.stringify(task.budget || {}),
        JSON.stringify(task.acceptanceCriteria || []),
        JSON.stringify(task.customFields || []),
        JSON.stringify(task.subtasks || []),
        JSON.stringify(task.meeting || {}),
        JSON.stringify(task.attachments || []),
        JSON.stringify(task.comments || []),
        JSON.stringify(task.history || []),
        JSON.stringify(task.delegation || {}),
        JSON.stringify(task.evaluations || []),
      );

      // Cập nhật memoryCache
      const idx = this.memoryCache.findIndex((t) => t.id === task.id);
      if (idx !== -1) {
        this.memoryCache[idx] = task;
      } else {
        this.memoryCache.unshift(task);
      }
    } catch (err: any) {
      this.logger.error(`Lỗi ghi task vào PostgreSQL: ${err.message}`);
    }
  }

  async update(task: TaskItem): Promise<void> {
    await this.insert(task);
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.$executeRawUnsafe(
        `DELETE FROM public.tasks WHERE id = $1 OR code = $1`,
        id,
      );
      this.memoryCache = this.memoryCache.filter((t) => t.id !== id && t.code !== id);
      return true;
    } catch (err: any) {
      this.logger.error(`Lỗi xóa task từ PostgreSQL: ${err.message}`);
      return false;
    }
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
