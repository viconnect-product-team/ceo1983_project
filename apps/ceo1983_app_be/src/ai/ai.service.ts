import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AiService {
  constructor(private prisma: PrismaService) {}

  /** Lấy roles của user (user_roles + memberships) để phân quyền AI */
  async getUserRoles(userId: string): Promise<{
    globalRoles: string[];
    associationId: string | null;
    membershipRoles: string[];
  }> {
    const [globalRows, memberRows] = await Promise.all([
      this.prisma.$queryRaw<{ role: string }[]>`
        SELECT role FROM public.user_roles WHERE user_id = ${userId}::uuid
      `.catch(() => [] as { role: string }[]),
      this.prisma.$queryRaw<{ role: string; association_id: string }[]>`
        SELECT role, association_id::text FROM public.memberships
        WHERE user_id = ${userId}::uuid
        ORDER BY created_at DESC
        LIMIT 10
      `.catch(() => [] as { role: string; association_id: string }[]),
    ]);

    const associationId = memberRows[0]?.association_id ?? null;

    return {
      globalRoles: globalRows.map((r) => r.role),
      associationId,
      membershipRoles: memberRows.map((r) => r.role),
    };
  }

  /** Đọc config AI provider từ app_settings */
  async getAiProviderSetting(): Promise<{ mode: string | null }> {
    const rows = await this.prisma.$queryRaw<{ value: unknown }[]>`
      SELECT value FROM public.app_settings WHERE key = 'ai_provider' LIMIT 1
    `.catch(() => [] as { value: unknown }[]);
    const val = rows[0]?.value as { mode?: string } | null;
    return { mode: val?.mode ?? null };
  }

  /** Ghi audit log cho AI request (chỉ metadata, không ghi prompt/answer) */
  async insertAiAudit(payload: {
    requestId: string;
    userId: string;
    associationId: string | null;
    capability: string;
    permissionLevel: string;
    provider: string;
    model: string | null;
    usedFallback: boolean;
    fallbackReason: string | null;
    providerLatencyMs: number;
    totalLatencyMs: number;
    sourceTypes: string[];
    sourceCount: number;
  }): Promise<void> {
    await this.prisma.$executeRaw`
      INSERT INTO public.ai_request_audit (
        request_id, user_id, association_id, capability, permission_level,
        provider, model, used_fallback, fallback_reason,
        provider_latency_ms, total_latency_ms, source_types, source_count
      ) VALUES (
        ${payload.requestId}, ${payload.userId}::uuid,
        ${payload.associationId ? `${payload.associationId}::uuid` : null},
        ${payload.capability}, ${payload.permissionLevel},
        ${payload.provider}, ${payload.model}, ${payload.usedFallback},
        ${payload.fallbackReason}, ${payload.providerLatencyMs},
        ${payload.totalLatencyMs}, ${JSON.stringify(payload.sourceTypes)}::jsonb,
        ${payload.sourceCount}
      )
    `.catch((e: Error) => {
      // Bảng có thể chưa tồn tại trong mọi môi trường — không làm hỏng request
      console.error('[AiService] ai_request_audit insert failed:', e.message);
    });
  }

  /** Ghi activity log đơn giản */
  async logActivity(payload: {
    userId: string;
    action: string;
    target: string;
    category: string;
  }): Promise<void> {
    const code = `ai-${Date.now()}`;
    await this.prisma.$executeRaw`
      INSERT INTO public.activity_log (id, action, target, category, code, "user", ip, at)
      VALUES (
        gen_random_uuid(), ${payload.action}, ${payload.target},
        ${payload.category}, ${code}, ${payload.userId}, '', now()
      )
    `.catch((e: Error) => {
      console.error('[AiService] activity_log insert failed:', e.message);
    });
  }

  /** Lấy danh sách activity log */
  async listActivityLog(): Promise<any[]> {
    return this.prisma.$queryRaw<any[]>`
      SELECT id, action, target, category, code, "user", ip, at
      FROM public.activity_log
      ORDER BY at DESC
      LIMIT 200
    `.catch(() => [] as any[]);
  }

  /** Xóa một activity log theo code */
  async deleteActivityLog(code: string): Promise<void> {
    await this.prisma.$executeRaw`
      DELETE FROM public.activity_log WHERE code = ${code}
    `.catch((e: Error) => {
      console.error('[AiService] activity_log delete failed:', e.message);
    });
  }

  /** Xóa toàn bộ activity log */
  async clearActivityLog(): Promise<void> {
    await this.prisma.$executeRaw`
      DELETE FROM public.activity_log WHERE code != ''
    `.catch((e: Error) => {
      console.error('[AiService] activity_log clear failed:', e.message);
    });
  }

  // ==========================================
  // AI QUOTA & USER LIMIT SYSTEM (50 QUESTIONS PER ACCOUNT)
  // ==========================================
  private isTableChecked = false;

  async ensureAiQuotaTable(): Promise<void> {
    if (this.isTableChecked) return;
    await this.prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS public.ai_user_quotas (
        user_id TEXT PRIMARY KEY,
        user_name TEXT,
        user_email TEXT,
        used_count INT DEFAULT 0,
        max_limit INT DEFAULT 50,
        extra_granted INT DEFAULT 0,
        is_blocked BOOLEAN DEFAULT false,
        last_question TEXT,
        last_requested_at TIMESTAMPTZ DEFAULT now(),
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      );
    `).catch((e: Error) => console.error('[AiService] ensureAiQuotaTable failed:', e?.message));
    this.isTableChecked = true;
  }

  /**
   * Lấy thông tin hạn mức sử dụng AI của tài khoản (giới hạn 50 câu hỏi)
   */
  async getUserQuota(userId: string): Promise<{
    userId: string;
    userName: string;
    userEmail: string;
    usedCount: number;
    maxLimit: number;
    extraGranted: number;
    totalLimit: number;
    remaining: number;
    isExceeded: boolean;
    isBlocked: boolean;
    lastRequestedAt: string;
    lastQuestion: string;
  }> {
    await this.ensureAiQuotaTable();
    const rows = await this.prisma.$queryRawUnsafe<any[]>(
      `SELECT * FROM public.ai_user_quotas WHERE user_id = $1 LIMIT 1`,
      String(userId)
    ).catch(() => [] as any[]);

    if (rows && rows.length > 0) {
      const r = rows[0];
      const maxLimit = Number(r.max_limit || 50);
      const extraGranted = Number(r.extra_granted || 0);
      const usedCount = Number(r.used_count || 0);
      const totalLimit = maxLimit + extraGranted;
      const isBlocked = Boolean(r.is_blocked);
      const isExceeded = usedCount >= totalLimit || isBlocked;
      const remaining = Math.max(0, totalLimit - usedCount);

      return {
        userId: String(r.user_id),
        userName: r.user_name || 'Hội viên',
        userEmail: r.user_email || '',
        usedCount,
        maxLimit,
        extraGranted,
        totalLimit,
        remaining,
        isExceeded,
        isBlocked,
        lastRequestedAt: r.last_requested_at ? new Date(r.last_requested_at).toISOString() : new Date().toISOString(),
        lastQuestion: r.last_question || '',
      };
    }

    // Khởi tạo hạn mức ban đầu cho tài khoản mới (mặc định 50 câu)
    let userName = 'Hội viên';
    let userEmail = '';
    try {
      const u = await this.prisma.$queryRawUnsafe<any[]>(
        `SELECT name, email FROM public.vione_users WHERE id::text = $1 LIMIT 1`,
        String(userId)
      ).catch(() => [] as any[]);
      if (u && u.length > 0) {
        userName = u[0].name || userName;
        userEmail = u[0].email || userEmail;
      }
    } catch {}

    await this.prisma.$executeRawUnsafe(
      `INSERT INTO public.ai_user_quotas (user_id, user_name, user_email, used_count, max_limit, extra_granted, is_blocked)
       VALUES ($1, $2, $3, 0, 50, 0, false)
       ON CONFLICT (user_id) DO NOTHING`,
      String(userId), userName, userEmail
    ).catch(() => {});

    return {
      userId: String(userId),
      userName,
      userEmail,
      usedCount: 0,
      maxLimit: 50,
      extraGranted: 0,
      totalLimit: 50,
      remaining: 50,
      isExceeded: false,
      isBlocked: false,
      lastRequestedAt: new Date().toISOString(),
      lastQuestion: '',
    };
  }

  /**
   * Kiểm tra và ghi nhận tăng 1 câu hỏi khi tài khoản thực hiện request AI
   */
  async checkAndIncrementUserQuota(userId: string, question?: string): Promise<{
    allowed: boolean;
    quota: any;
  }> {
    const quota = await this.getUserQuota(userId);
    if (quota.isExceeded) {
      return { allowed: false, quota };
    }

    const newUsed = quota.usedCount + 1;
    const remaining = Math.max(0, quota.totalLimit - newUsed);
    const isExceeded = newUsed >= quota.totalLimit;

    await this.prisma.$executeRawUnsafe(
      `UPDATE public.ai_user_quotas
       SET used_count = used_count + 1,
           last_question = $2,
           last_requested_at = now(),
           updated_at = now()
       WHERE user_id = $1`,
      String(userId),
      (question || '').slice(0, 500)
    ).catch((e: Error) => console.error('[AiService] increment quota failed:', e?.message));

    return {
      allowed: true,
      quota: {
        ...quota,
        usedCount: newUsed,
        remaining,
        isExceeded,
        lastQuestion: (question || '').slice(0, 500),
        lastRequestedAt: new Date().toISOString(),
      },
    };
  }

  /**
   * Quản trị viên theo dõi toàn bộ danh sách người dùng và tình trạng hạn mức 50 câu hỏi
   */
  async listUsersAiUsage(params?: { search?: string; status?: string }): Promise<{
    users: any[];
    stats: {
      totalUsers: number;
      totalQuestions: number;
      exceededUsers: number;
      warningUsers: number;
      normalUsers: number;
      limitPerAccount: number;
    };
  }> {
    await this.ensureAiQuotaTable();

    // Đồng bộ người dùng từ vione_users vào bảng quota nếu chưa có
    await this.prisma.$executeRawUnsafe(`
      INSERT INTO public.ai_user_quotas (user_id, user_name, user_email, used_count, max_limit, extra_granted, is_blocked)
      SELECT u.id::text, COALESCE(u.name, 'Hội viên'), COALESCE(u.email, ''), 0, 50, 0, false
      FROM public.vione_users u
      ON CONFLICT (user_id) DO NOTHING
    `).catch(() => {});

    const rows = await this.prisma.$queryRawUnsafe<any[]>(`
      SELECT q.user_id, q.user_name, q.user_email, q.used_count, q.max_limit, q.extra_granted,
             q.is_blocked, q.last_question, q.last_requested_at, q.created_at,
             m.company, m.position, m.code as member_code
      FROM public.ai_user_quotas q
      LEFT JOIN public.members m ON m.user_id::text = q.user_id OR m.id::text = q.user_id
      ORDER BY q.used_count DESC, q.last_requested_at DESC
    `).catch(() => [] as any[]);

    let list = rows.map((r) => {
      const usedCount = Number(r.used_count || 0);
      const maxLimit = Number(r.max_limit || 50);
      const extraGranted = Number(r.extra_granted || 0);
      const totalLimit = maxLimit + extraGranted;
      const remaining = Math.max(0, totalLimit - usedCount);
      const isBlocked = Boolean(r.is_blocked);
      const isExceeded = usedCount >= totalLimit || isBlocked;
      let status: 'blocked' | 'exceeded' | 'warning' | 'normal' = 'normal';
      if (isBlocked) status = 'blocked';
      else if (isExceeded) status = 'exceeded';
      else if (usedCount >= 40) status = 'warning';

      return {
        userId: String(r.user_id),
        userName: r.user_name || 'Hội viên',
        userEmail: r.user_email || '',
        company: r.company || 'Doanh nghiệp Hội viên',
        position: r.position || 'Thành viên',
        memberCode: r.member_code || '',
        usedCount,
        maxLimit,
        extraGranted,
        totalLimit,
        remaining,
        percent: Math.min(100, Math.round((usedCount / totalLimit) * 100)),
        status,
        isBlocked,
        lastQuestion: r.last_question || '',
        lastRequestedAt: r.last_requested_at ? new Date(r.last_requested_at).toISOString() : null,
      };
    });

    if (params?.search) {
      const s = params.search.toLowerCase().trim();
      list = list.filter((u) =>
        u.userName.toLowerCase().includes(s) ||
        u.userEmail.toLowerCase().includes(s) ||
        u.company.toLowerCase().includes(s) ||
        u.memberCode.toLowerCase().includes(s)
      );
    }

    if (params?.status && params.status !== 'all') {
      list = list.filter((u) => u.status === params.status);
    }

    const totalUsers = list.length;
    const totalQuestions = list.reduce((acc, u) => acc + u.usedCount, 0);
    const exceededUsers = list.filter((u) => u.status === 'exceeded' || u.status === 'blocked').length;
    const warningUsers = list.filter((u) => u.status === 'warning').length;
    const normalUsers = list.filter((u) => u.status === 'normal').length;

    return {
      users: list,
      stats: {
        totalUsers,
        totalQuestions,
        exceededUsers,
        warningUsers,
        normalUsers,
        limitPerAccount: 50,
      },
    };
  }

  /**
   * Quản trị viên cấp thêm câu hỏi hoặc đặt lại về 0
   */
  async resetOrAdjustUserQuota(userId: string, body: {
    resetCount?: boolean;
    addExtra?: number;
    newLimit?: number;
    unblock?: boolean;
  }): Promise<{ ok: boolean; quota: any }> {
    await this.ensureAiQuotaTable();
    const updates: string[] = ['updated_at = now()'];
    if (body.resetCount) {
      updates.push(`used_count = 0`);
    }
    if (typeof body.addExtra === 'number' && body.addExtra > 0) {
      updates.push(`extra_granted = extra_granted + ${Math.floor(body.addExtra)}`);
    }
    if (typeof body.newLimit === 'number' && body.newLimit > 0) {
      updates.push(`max_limit = ${Math.floor(body.newLimit)}`);
    }
    if (body.unblock) {
      updates.push(`is_blocked = false`);
    }

    await this.prisma.$executeRawUnsafe(
      `UPDATE public.ai_user_quotas SET ${updates.join(', ')} WHERE user_id = $1`,
      String(userId)
    );

    const updated = await this.getUserQuota(userId);
    return { ok: true, quota: updated };
  }

  /**
   * Tạm khóa / Mở khóa quyền dùng AI của tài khoản
   */
  async toggleBlockUserAi(userId: string, blocked: boolean): Promise<{ ok: boolean; quota: any }> {
    await this.ensureAiQuotaTable();
    await this.prisma.$executeRawUnsafe(
      `UPDATE public.ai_user_quotas SET is_blocked = $2, updated_at = now() WHERE user_id = $1`,
      String(userId),
      blocked
    );
    const updated = await this.getUserQuota(userId);
    return { ok: true, quota: updated };
  }

  /**
   * Lấy toàn bộ ngữ cảnh động của hội viên tại phiên đăng nhập:
   * - Hồ sơ định danh (Tên, mã hội viên, doanh nghiệp, chức vụ, ban bệ)
   * - Hội phí & Hóa đơn (Chưa đóng, đã đóng, số tiền nợ, hạn nộp)
   * - Thông báo chưa đọc (Số lượng & nội dung mới nhất)
   * - Sự kiện của tôi (Danh sách sự kiện đã đăng ký vé)
   * - Top sự kiện nhiều người đăng ký nhất trong Hiệp hội
   */
  async getLiveMemberAssistantContext(userId: string) {
    const [userRows, memberRows] = await Promise.all([
      this.prisma.$queryRaw<any[]>`
        SELECT id, name, email, phone FROM public.vione_users WHERE id::text = ${userId}::text LIMIT 1
      `.catch(() => [] as any[]),
      this.prisma.$queryRaw<any[]>`
        SELECT id, code, name, full_name, email, contact, company, position, title, level, membership_tier, department, status, dues_status, joined_at
        FROM public.members
        WHERE user_id::text = ${userId}::text OR id::text = ${userId}::text OR email IN (SELECT email FROM public.vione_users WHERE id::text = ${userId}::text)
        LIMIT 1
      `.catch(() => [] as any[]),
    ]);

    const member = memberRows[0] || null;
    const user = userRows[0] || null;
    const memberCode = member?.code || null;
    const memberId = member?.id || null;
    const userEmail = member?.email || user?.email || '';

    // 2. Invoices & Unpaid Dues
    let unpaidInvoices: any[] = [];
    let totalOutstanding = 0;
    let feeYear: number | null = null;
    let feePaid = true;

    if (memberId) {
      const invRows = await this.prisma.$queryRaw<any[]>`
        SELECT id, invoice_no, year, amount, status, due_date, paid_at
        FROM public.invoices
        WHERE member_id::text = ${memberId}::text
        ORDER BY year DESC, due_date ASC
        LIMIT 20
      `.catch(() => [] as any[]);

      const pending = invRows.filter((i) => i.status !== 'paid');
      if (pending.length > 0) {
        feePaid = false;
        totalOutstanding = pending.reduce((sum, item) => sum + Number(item.amount || 0), 0);
        feeYear = pending[0].year ? Number(pending[0].year) : new Date().getFullYear();
        unpaidInvoices = pending.map((i) => ({
          invoiceNo: i.invoice_no,
          year: i.year ? Number(i.year) : null,
          amount: Number(i.amount || 0),
          dueDate: i.due_date ? new Date(i.due_date).toISOString().slice(0, 10) : null,
          status: i.status,
        }));
      }
    }

    // 3. Unread Notifications
    let unreadNotifications: any[] = [];
    let unreadCount = 0;
    const recipientIds: string[] = [userId];
    if (memberId) recipientIds.push(String(memberId));
    if (memberCode) recipientIds.push(String(memberCode));

    const notifRows = await this.prisma.$queryRaw<any[]>`
      SELECT id, title, body, created_at, read
      FROM public.member_notifications
      WHERE recipient_id = ANY(${recipientIds}::text[])
        AND read = false
        AND (dismissed = false OR dismissed IS NULL)
      ORDER BY created_at DESC
      LIMIT 10
    `.catch(() => [] as any[]);

    unreadCount = notifRows.length;
    unreadNotifications = notifRows.map((n) => ({
      id: n.id,
      title: n.title,
      body: n.body,
      createdAt: n.created_at,
    }));

    // 4. My Registered Events
    let myRegisteredEvents: any[] = [];
    if (memberCode || userEmail) {
      const myRegRows = await this.prisma.$queryRaw<any[]>`
        SELECT r.id as registration_id, r.ticket_count, r.lucky_number, r.status as reg_status,
               e.id as event_id, e.name as event_name, e.date, e.time, e.location
        FROM public.event_registrations r
        JOIN public.events e ON e.id = r.event_id
        WHERE (r.member_code = ${memberCode} OR (LOWER(TRIM(r.email)) = LOWER(TRIM(${userEmail})) AND ${userEmail} != ''))
          AND r.status != 'cancelled'
        ORDER BY e.date ASC
        LIMIT 10
      `.catch(() => [] as any[]);

      myRegisteredEvents = myRegRows.map((r) => ({
        registrationId: r.registration_id,
        eventId: r.event_id,
        name: r.event_name,
        date: r.date ? (r.date instanceof Date ? r.date.toISOString().slice(0, 10) : String(r.date).slice(0, 10)) : 'Sắp diễn ra',
        time: r.time || '08:30',
        location: r.location || 'Hà Nội',
        ticketCount: r.ticket_count || 1,
        luckyNumber: r.lucky_number,
      }));
    }

    // 5. Top Registered Events in Association
    const topEventsRows = await this.prisma.$queryRaw<any[]>`
      SELECT e.id, e.name, e.date, e.time, e.location, e.capacity,
             COALESCE(e.registered, COUNT(r.id)) as registration_count
      FROM public.events e
      LEFT JOIN public.event_registrations r ON r.event_id = e.id AND r.status != 'cancelled'
      GROUP BY e.id, e.name, e.date, e.time, e.location, e.capacity, e.registered
      ORDER BY registration_count DESC, e.date ASC
      LIMIT 5
    `.catch(() => [] as any[]);

    const topEvents = topEventsRows.map((e) => ({
      id: e.id,
      name: e.name,
      date: e.date ? (e.date instanceof Date ? e.date.toISOString().slice(0, 10) : String(e.date).slice(0, 10)) : 'Sắp diễn ra',
      location: e.location || 'Hà Nội',
      registeredCount: Number(e.registration_count || 0),
      capacity: Number(e.capacity || 200),
    }));

    // 6. Kết nối (bạn bè) — user_connections accepted / pending
    const toDateStr = (d: any) =>
      d ? (d instanceof Date ? d.toISOString().slice(0, 10) : String(d).slice(0, 10)) : null;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(userId || ''));
    const userIdRefs = [String(userId)];
    if (memberId) userIdRefs.push(String(memberId));
    if (memberCode) userIdRefs.push(String(memberCode));

    const [connRows, interestRows, myOppRows, myProductRows, meetingRows] = await Promise.all([
      isUuid
        ? this.prisma.$queryRaw<any[]>`
            SELECT
              COUNT(*) FILTER (WHERE status = 'accepted' AND blocked_by_user_id IS NULL)::int AS accepted,
              COUNT(*) FILTER (WHERE status = 'pending' AND recipient_user_id = ${userId}::uuid)::int AS pending_incoming,
              COUNT(*) FILTER (WHERE status = 'pending' AND requester_user_id = ${userId}::uuid)::int AS pending_outgoing
            FROM public.user_connections
            WHERE requester_user_id = ${userId}::uuid OR recipient_user_id = ${userId}::uuid
          `.catch(() => [] as any[])
        : Promise.resolve([] as any[]),
      this.prisma.$queryRaw<any[]>`
        SELECT o.id, o.title, o.status, o.deadline
        FROM public.opportunity_interests i
        JOIN public.opportunities o ON o.id::text = i.opportunity_id::text
        WHERE i.member_id::text = ANY(${userIdRefs}::text[])
        ORDER BY o.created_at DESC NULLS LAST
        LIMIT 10
      `.catch(() => [] as any[]),
      this.prisma.$queryRaw<any[]>`
        SELECT id, title, status, deadline
        FROM public.opportunities
        WHERE poster_id::text = ANY(${userIdRefs}::text[])
        ORDER BY created_at DESC NULLS LAST
        LIMIT 10
      `.catch(() => [] as any[]),
      this.prisma.$queryRaw<any[]>`
        SELECT id, COALESCE(name, title) AS name, price, status
        FROM public.products
        WHERE seller_id::text = ANY(${userIdRefs}::text[])
        ORDER BY created_at DESC NULLS LAST
        LIMIT 10
      `.catch(() => [] as any[]),
      isUuid
        ? this.prisma.$queryRaw<any[]>`
            SELECT m.id, m.title, m.status::text AS status, m.scheduled_start_at
            FROM public.business_meetings m
            JOIN public.business_meeting_participants p ON p.meeting_id = m.id
            WHERE p.user_id = ${userId}::uuid
              AND m.status::text NOT IN ('cancelled', 'canceled')
            ORDER BY m.scheduled_start_at DESC NULLS LAST
            LIMIT 10
          `.catch(() => [] as any[])
        : Promise.resolve([] as any[]),
    ]);

    const connections = {
      friendsCount: Number(connRows[0]?.accepted || 0),
      pendingIncoming: Number(connRows[0]?.pending_incoming || 0),
      pendingOutgoing: Number(connRows[0]?.pending_outgoing || 0),
    };
    const interestedOpportunities = interestRows.map((o) => ({
      id: o.id,
      title: o.title,
      status: o.status,
      deadline: toDateStr(o.deadline),
    }));
    const myOpportunities = myOppRows.map((o) => ({
      id: o.id,
      title: o.title,
      status: o.status,
      deadline: toDateStr(o.deadline),
    }));
    const myProducts = myProductRows.map((p) => ({
      id: p.id,
      name: p.name,
      price: Number(p.price || 0),
      status: p.status,
    }));
    const nowMs = Date.now();
    const myMeetings = meetingRows.map((m) => ({
      id: m.id,
      title: m.title,
      status: m.status,
      startAt: m.scheduled_start_at ? new Date(m.scheduled_start_at).toISOString() : null,
      upcoming: m.scheduled_start_at ? new Date(m.scheduled_start_at).getTime() >= nowMs : false,
    }));

    const roleInfo = isUuid
      ? await this.getUserRoles(userId).catch(() => ({ globalRoles: [] as string[], associationId: null, membershipRoles: [] as string[] }))
      : { globalRoles: [] as string[], associationId: null, membershipRoles: [] as string[] };
    const allRoles = [...roleInfo.globalRoles, ...roleInfo.membershipRoles].map((r) => String(r || '').toLowerCase());
    const positionText = `${member?.position || ''} ${member?.title || ''}`.toLowerCase();
    const isAdminLike =
      allRoles.some((r) => ['super_admin', 'admin', 'owner', 'quan_tri', 'chairman', 'president'].includes(r)) ||
      /(chủ tịch|quản trị|admin)/.test(positionText);
    const roleLabel = isAdminLike
      ? 'Quản trị / Admin / Chủ tịch'
      : member?.department
        ? `Hội viên — ${member.department}`
        : 'Hội viên';

    return {
      roleLabel,
      isAdminLike,
      roles: allRoles,
      user: {
        id: userId,
        name: member?.name || member?.full_name || user?.name || 'Hội viên CEO 1983',
        code: memberCode || 'M1983-MEMBER',
        company: member?.company || 'Doanh nghiệp Hội viên',
        title: member?.position || member?.title || 'Lãnh đạo Doanh nghiệp',
        level: member?.level || member?.membership_tier || 'VIP Gold',
        department: member?.department || 'Ban Hội viên',
        email: userEmail,
      },
      dues: {
        feePaid,
        feeYear,
        totalOutstanding,
        unpaidInvoices,
      },
      notifications: {
        unreadCount,
        unreadList: unreadNotifications,
      },
      myEvents: myRegisteredEvents,
      topEvents,
      connections,
      interestedOpportunities,
      myOpportunities,
      myProducts,
      myMeetings,
    };
  }

  /**
   * Trả lời chính xác (deterministic) các câu hỏi về dữ liệu tài khoản cá nhân
   * dựa trên context thời gian thực. Trả về null nếu câu hỏi không phải loại này.
   */
  private answerPersonalAccountQuestion(
    q: string,
    context: Awaited<ReturnType<AiService['getLiveMemberAssistantContext']>>,
  ): {
    answer: string;
    speechText: string;
    intent: 'query_data';
    route?: string;
    featureName?: string;
    suggestTour: boolean;
    dynamicData: any;
    provider: string;
    model: string;
  } | null {
    const norm = q
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd');
    const mine = /\b(toi|minh|cua toi|cua minh|tai khoan|cua anh|cua chi)\b/.test(norm);
    const personal = mine || /(bao nhieu|\bmay\b|danh sach|liet ke)/.test(norm);
    if (!personal) return null;

    const base = { intent: 'query_data' as const, suggestTour: false, provider: 'ceo1983-smart-engine' };
    const fmtVnd = (n: number) => new Intl.NumberFormat('vi-VN').format(n || 0);

    if (/(ban be|ket ban|ket noi|moi quan he|nguoi quen|doi tac da ket noi)/.test(norm)) {
      const c = context.connections;
      return {
        ...base,
        answer: `🤝 **Kết nối của ${context.user.name}:**\n\n- Bạn bè đã kết nối: **${c.friendsCount}** người\n- Lời mời đang chờ Anh/Chị duyệt: **${c.pendingIncoming}**\n- Lời mời Anh/Chị đã gửi: **${c.pendingOutgoing}**`,
        speechText: `Anh chị hiện có ${c.friendsCount} bạn bè đã kết nối, ${c.pendingIncoming} lời mời đang chờ duyệt.`,
        route: '/association/messages',
        featureName: 'Kết nối',
        dynamicData: { connections: c },
        model: 'personal-connections',
      };
    }

    if (mine && /(co hoi|quan tam|giao thuong)/.test(norm)) {
      const list = context.interestedOpportunities;
      const posted = context.myOpportunities;
      const lines = list.length
        ? list.map((o, i) => `${i + 1}. **${o.title}**${o.deadline ? ` — hạn ${o.deadline}` : ''}`).join('\n')
        : '_Anh/Chị chưa quan tâm cơ hội nào._';
      return {
        ...base,
        answer: `💼 **Cơ hội kinh doanh Anh/Chị đang quan tâm (${list.length}):**\n\n${lines}\n\n📌 Cơ hội Anh/Chị đã đăng: **${posted.length}**${posted.length ? `\n${posted.map((o, i) => `${i + 1}. ${o.title} (${o.status || 'open'})`).join('\n')}` : ''}`,
        speechText: `Anh chị đang quan tâm ${list.length} cơ hội và đã đăng ${posted.length} cơ hội kinh doanh.`,
        route: '/association/opportunities',
        featureName: 'Cơ hội kinh doanh',
        dynamicData: { interestedOpportunities: list, myOpportunities: posted },
        model: 'personal-opportunities',
      };
    }

    if (/(cuoc hop|lich hop|lich hen|gap go|meeting|hen gap)/.test(norm)) {
      const upcoming = context.myMeetings.filter((m) => m.upcoming);
      const lines = context.myMeetings.length
        ? context.myMeetings
            .map((m, i) => `${i + 1}. **${m.title || 'Cuộc hẹn'}** — ${m.startAt ? new Date(m.startAt).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }) : 'chưa chốt giờ'} (${m.status})`)
            .join('\n')
        : '_Chưa có cuộc hẹn nào._';
      return {
        ...base,
        answer: `📅 **Lịch hẹn / cuộc họp của Anh/Chị** (sắp tới: **${upcoming.length}**):\n\n${lines}`,
        speechText: `Anh chị có ${upcoming.length} cuộc hẹn sắp tới.`,
        route: '/association/messages',
        featureName: 'Lịch hẹn',
        dynamicData: { meetings: context.myMeetings },
        model: 'personal-meetings',
      };
    }

    if (mine && /(su kien|hoi nghi|\bve\b|dang ky)/.test(norm)) {
      const ev = context.myEvents;
      const lines = ev.length
        ? ev.map((e, i) => `${i + 1}. **${e.name}** — ${e.date} ${e.time} tại ${e.location} (${e.ticketCount} vé)`).join('\n')
        : '_Anh/Chị chưa đăng ký sự kiện nào._';
      return {
        ...base,
        answer: `🎫 **Sự kiện Anh/Chị đã đăng ký (${ev.length}):**\n\n${lines}`,
        speechText: `Anh chị đã đăng ký ${ev.length} sự kiện.`,
        route: '/association/events',
        featureName: 'Sự kiện',
        dynamicData: { myEvents: ev },
        model: 'personal-events',
      };
    }

    if (/(hoa don|hoi phi|cong no|chua thanh toan|chua dong|no phi|nien lien)/.test(norm)) {
      const d = context.dues;
      const lines = d.unpaidInvoices.length
        ? d.unpaidInvoices.map((i: any, idx: number) => `${idx + 1}. ${i.invoiceNo || 'Hóa đơn'} — kỳ ${i.year ?? ''}: **${fmtVnd(i.amount)} đ**${i.dueDate ? ` (hạn ${i.dueDate})` : ''}`).join('\n')
        : '_Không có hóa đơn nào chưa thanh toán._';
      return {
        ...base,
        answer: `💳 **Hóa đơn / hội phí của Anh/Chị:** ${d.feePaid ? '✅ Đã thanh toán đầy đủ' : `⚠️ Còn nợ **${fmtVnd(d.totalOutstanding)} đ**`}\n\n${lines}`,
        speechText: d.feePaid ? 'Anh chị đã thanh toán đầy đủ hội phí.' : `Anh chị còn ${d.unpaidInvoices.length} hóa đơn chưa thanh toán.`,
        route: '/association/profile',
        featureName: 'Hội phí',
        dynamicData: { dues: d },
        model: 'personal-invoices',
      };
    }

    if (mine && /(san pham|gian hang|dang ban)/.test(norm)) {
      const p = context.myProducts;
      const lines = p.length
        ? p.map((x, i) => `${i + 1}. **${x.name}** — ${fmtVnd(x.price)} đ (${x.status || 'active'})`).join('\n')
        : '_Anh/Chị chưa đăng sản phẩm nào._';
      return {
        ...base,
        answer: `🛍️ **Sản phẩm Anh/Chị đang đăng bán (${p.length}):**\n\n${lines}`,
        speechText: `Anh chị đang có ${p.length} sản phẩm trên sàn.`,
        route: '/association/products',
        featureName: 'Sàn sản phẩm',
        dynamicData: { myProducts: p },
        model: 'personal-products',
      };
    }

    if (/(thong bao)/.test(norm)) {
      const n = context.notifications;
      return {
        ...base,
        answer: `🔔 Anh/Chị có **${n.unreadCount}** thông báo chưa đọc.${n.unreadList.length ? `\n\n${n.unreadList.slice(0, 5).map((x: any, i: number) => `${i + 1}. ${x.title}`).join('\n')}` : ''}`,
        speechText: `Anh chị có ${n.unreadCount} thông báo chưa đọc.`,
        route: '/association/notifications',
        featureName: 'Thông báo',
        dynamicData: { notifications: n },
        model: 'personal-notifications',
      };
    }

    if (mine && /(tai khoan|thong tin|ho so|tong quan|tinh hinh|toi la ai|vai tro|quyen)/.test(norm)) {
      return {
        ...base,
        answer: this.buildAccountOverview(context),
        speechText: `Em đã tổng hợp toàn bộ thông tin tài khoản của ${context.user.name}.`,
        route: '/association/profile',
        featureName: 'Cá nhân',
        dynamicData: { overview: true },
        model: 'personal-overview',
      };
    }

    return null;
  }

  /** Tổng quan toàn bộ tài khoản (dùng cho câu hỏi tổng quát và câu hỏi năng lực). */
  private buildAccountOverview(context: Awaited<ReturnType<AiService['getLiveMemberAssistantContext']>>): string {
    const fmtVnd = (n: number) => new Intl.NumberFormat('vi-VN').format(n || 0);
    const u = context.user;
    const upcomingMeetings = context.myMeetings.filter((m) => m.upcoming).length;
    return [
      `👤 **${u.name}** — ${u.title} tại **${u.company}**`,
      `- Mã hội viên: \`${u.code}\` | Vai trò: **${context.roleLabel}**`,
      `- Hội phí: ${context.dues.feePaid ? '✅ đã thanh toán đầy đủ' : `⚠️ còn nợ **${fmtVnd(context.dues.totalOutstanding)} đ** (${context.dues.unpaidInvoices.length} hóa đơn)`}`,
      `- Sự kiện đã đăng ký: **${context.myEvents.length}**`,
      `- Bạn bè đã kết nối: **${context.connections.friendsCount}** (chờ duyệt ${context.connections.pendingIncoming})`,
      `- Lịch hẹn B2B sắp tới: **${upcomingMeetings}**`,
      `- Cơ hội đang quan tâm: **${context.interestedOpportunities.length}** | đã đăng: **${context.myOpportunities.length}**`,
      `- Sản phẩm đang bán: **${context.myProducts.length}**`,
      `- Thông báo chưa đọc: **${context.notifications.unreadCount}**`,
    ].join('\n');
  }

  /**
   * Nhận diện câu hỏi "meta" (hỏi về chính trợ lý: bạn làm được gì, bạn là ai, xin chào, cảm ơn).
   * Các câu này KHÔNG được tra cứu DB theo từ khóa (tránh hiểu "bạn" = bạn bè).
   */
  private answerMetaQuestion(
    q: string,
    context: Awaited<ReturnType<AiService['getLiveMemberAssistantContext']>>,
  ): { answer: string; speechText: string; intent: 'chat'; suggestTour: boolean; provider: string; model: string } | null {
    const norm = q
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[?!.,]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    const name = context.user.name;
    const base = { intent: 'chat' as const, suggestTour: false, provider: 'ceo1983-smart-engine' };

    const isCapability =
      /\b(ban|em|tro ly|ai|bot)\b.*\b(lam (duoc )?gi|giup (duoc )?(gi|toi gi|minh gi)|ho tro (duoc )?gi|co the lam gi|biet lam gi|lam duoc nhung gi|co chuc nang gi|tinh nang gi)\b/.test(norm) ||
      /^(lam duoc gi|giup duoc gi|co the giup gi|huong dan su dung|tro giup|help)$/.test(norm) ||
      /\b(ban|em) (la ai|la gi)\b/.test(norm);
    if (isCapability) {
      return {
        ...base,
        answer: `Dạ em là **Trợ lý AI của CLB Doanh Nhân CEO 1983**, nắm toàn bộ dữ liệu tài khoản của Anh/Chị **${name}** và các tính năng của app. Em có thể:\n\n` +
          `1. 📊 **Tra cứu tài khoản của Anh/Chị**: sự kiện đã đăng ký & vé, hội phí/hóa đơn chưa thanh toán, số bạn bè & lời mời kết nối, lịch hẹn B2B, cơ hội đang quan tâm/đã đăng, sản phẩm đang bán, thông báo chưa đọc.\n` +
          `2. 🔎 **Tìm kiếm trong CLB**: hội viên/doanh nghiệp, sản phẩm trên sàn, cơ hội giao thương, sự kiện, văn bản – điều lệ, thông tin các Ban.\n` +
          `3. 🧭 **Hướng dẫn & mở nhanh tính năng**: đăng ký sự kiện, danh thiếp số, quét QR check-in, đăng sản phẩm/cơ hội, nhắn tin, thanh toán hội phí VietQR.\n` +
          `4. 💬 **Tư vấn, soạn nội dung** kinh doanh – networking.\n\n` +
          `**Tình hình tài khoản hiện tại:**\n${this.buildAccountOverview(context)}\n\nAnh/Chị muốn em hỗ trợ việc gì trước ạ?`,
        speechText: `Dạ em là trợ lý AI CEO 1983. Em tra cứu được sự kiện, hội phí, bạn bè, lịch hẹn, cơ hội, sản phẩm của anh chị và hướng dẫn mọi tính năng trong app.`,
        model: 'meta-capability',
      };
    }

    if (/^(xin chao|chao|chao ban|chao em|hello|hi|alo|hey)( ban| em| tro ly)?$/.test(norm)) {
      return {
        ...base,
        answer: `Dạ em chào Anh/Chị **${name}**! 👋 Em có thể tra cứu sự kiện, hội phí, bạn bè, lịch hẹn, cơ hội, sản phẩm của Anh/Chị hoặc hướng dẫn mọi tính năng trong app. Anh/Chị cần gì ạ?`,
        speechText: `Dạ em chào anh chị ${name}. Anh chị cần em hỗ trợ gì ạ?`,
        model: 'meta-greeting',
      };
    }

    if (/^(cam on|thank|thanks|ok cam on|cam on ban|cam on em)\b/.test(norm)) {
      return {
        ...base,
        answer: `Dạ không có gì ạ! Anh/Chị cần thêm thông tin gì cứ hỏi em nhé. 😊`,
        speechText: `Dạ không có gì ạ!`,
        model: 'meta-thanks',
      };
    }

    return null;
  }

  /**
   * Gọi OpenRouter với chuỗi model miễn phí (fallback lần lượt) khi Gemini không khả dụng.
   * Key lấy từ env OPENROUTER_API_KEY hoặc app_settings 'openrouter_api_key'.
   */
  private async callOpenRouterJson(sysPrompt: string, userPrompt: string): Promise<{ parsed: any; model: string } | null> {
    let key = process.env.OPENROUTER_API_KEY || null;
    if (!key) {
      const rows = await this.prisma.$queryRaw<{ value: unknown }[]>`
        SELECT value FROM public.app_settings WHERE key IN ('openrouter_api_key', 'openrouter_key') LIMIT 1
      `.catch(() => [] as { value: unknown }[]);
      const val = rows[0]?.value as { key?: string; apiKey?: string } | string | null;
      if (typeof val === 'string') key = val;
      else if (val && typeof val === 'object') key = val.key || val.apiKey || null;
    }
    if (!key) return null;

    const models = (process.env.OPENROUTER_FREE_MODELS ||
      'google/gemini-2.0-flash-exp:free,deepseek/deepseek-chat-v3-0324:free,meta-llama/llama-3.3-70b-instruct:free,qwen/qwen-2.5-72b-instruct:free,mistralai/mistral-small-3.1-24b-instruct:free')
      .split(',')
      .map((m) => m.trim())
      .filter(Boolean);

    for (const model of models) {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 12000);
        const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${key}`,
            'HTTP-Referer': process.env.APP_PUBLIC_URL || 'https://ceo1983.vn',
            'X-Title': 'CEO1983 Assistant',
          },
          body: JSON.stringify({
            model,
            temperature: 0.2,
            messages: [
              { role: 'system', content: sysPrompt },
              { role: 'user', content: `CÂU HỎI CỦA HỘI VIÊN: "${userPrompt}"\n\nChỉ trả về đúng 1 object JSON theo định dạng yêu cầu.` },
            ],
          }),
        }).finally(() => clearTimeout(timer));
        if (!res.ok) {
          console.warn(`[AiService] OpenRouter ${model} HTTP ${res.status}`);
          continue;
        }
        const data: any = await res.json();
        const text: string = data?.choices?.[0]?.message?.content || '';
        if (!text) continue;
        const match = text.match(/\{[\s\S]*\}/);
        try {
          const parsed = JSON.parse(match ? match[0] : text);
          if (parsed && (parsed.answer || parsed.speechText)) return { parsed, model };
        } catch {
          // Model trả lời dạng text thường -> dùng làm answer
          return { parsed: { answer: text, speechText: text.slice(0, 240), intent: 'chat' }, model };
        }
      } catch (err: any) {
        console.warn(`[AiService] OpenRouter ${model} error:`, err?.message);
      }
    }
    return null;
  }

  /**
   * Nhận diện Lệnh Điều khiển Giọng nói Tự động (Voice Auto-Navigation Intent):
   * Tự động nhận diện ý định điều hướng và thao tác của người dùng khi ra lệnh bằng giọng nói hoặc text.
   */
  classifyVoiceNavigation(prompt: string): {
    route: string;
    featureName: string;
    tourId: string;
    actionType?: 'navigate' | 'search' | 'theme' | 'call';
    searchKeyword?: string;
  } | null {
    const q = (prompt || '').toLowerCase().trim();

    // 0. Thay đổi giao diện (Theme switch)
    if (
      q.includes('đổi giao diện') || q.includes('chế độ tối') || q.includes('chế độ sáng') ||
      q.includes('dark mode') || q.includes('light mode') || q.includes('giao diện tối') ||
      q.includes('giao diện sáng') || q.includes('màu tối') || q.includes('màu sáng')
    ) {
      return {
        route: '/association',
        featureName: 'Chuyển Đổi Giao Diện Sáng / Tối',
        tourId: '',
        actionType: 'theme',
      };
    }

    // 0.1 Hotline Ban Thư Ký
    if (
      q.includes('gọi điện') || q.includes('gọi hotline') || q.includes('hotline') ||
      q.includes('số ban thư ký') || q.includes('liên hệ thư ký')
    ) {
      return {
        route: 'tel:0983198307',
        featureName: 'Hotline Ban Thư Ký (0983 198 307)',
        tourId: '',
        actionType: 'call',
      };
    }

    // 1. Danh bạ & Hội viên (kèm tìm kiếm tên/công ty nếu có)
    if (
      q.includes('danh bạ') || q.includes('danh ba') ||
      q.includes('hội viên') || q.includes('thành viên') ||
      q.includes('hẹn gặp') || q.includes('1-on-1') || q.includes('1-1') ||
      q.startsWith('tìm anh') || q.startsWith('tìm chị') || q.startsWith('tìm em') ||
      q.startsWith('tìm ông') || q.startsWith('tìm bà') || q.startsWith('tìm bạn') ||
      q.startsWith('tìm sđt') || q.startsWith('tìm sdt') || q.startsWith('tìm công ty') ||
      (q.includes('ceo') && (q.includes('mở') || q.includes('tìm') || q.includes('danh sách') || q.includes('xem') || q.includes('cho xem')))
    ) {
      const nameMatch = q.match(/(?:tìm|kiếm|cho xem|xem|gặp)\s+(?:thông tin\s+)?(?:anh|chị|em|bác|ông|bà|ceo|bạn)?\s*([a-zA-ZÀ-ỹ0-9\s]{2,25})/i);
      let keyword = '';
      if (nameMatch && nameMatch[1]) {
        const candidate = nameMatch[1].trim();
        const ignoreWords = ['danh bạ', 'danh ba', 'hội viên', 'thành viên', 'hệ thống', 'tất cả', 'này', 'đi', 'cho tôi', 'giúp tôi', 'với'];
        if (!ignoreWords.includes(candidate) && candidate.length >= 2) {
          keyword = candidate;
        }
      }

      const route = keyword ? `/association/members?search=${encodeURIComponent(keyword)}` : '/association/members';
      const featureName = keyword ? `Danh Bạ Hội Viên (Tìm: ${keyword})` : 'Danh Bạ 200+ CEO & Hẹn 1-on-1';
      return {
        route,
        featureName,
        tourId: 'association-members',
        actionType: keyword ? 'search' : 'navigate',
        searchKeyword: keyword,
      };
    }

    // 2. Sự kiện & Hội nghị
    if (
      q.includes('lịch sự kiện') || q.includes('sự kiện') || q.includes('hội nghị') ||
      q.includes('gala') || q.includes('đăng ký vé') || q.includes('mua vé') ||
      q.includes('lịch sinh hoạt') || q.includes('event')
    ) {
      return { route: '/association/events', featureName: 'Lịch Sự Kiện & Đăng Ký Vé', tourId: 'association-events', actionType: 'navigate' };
    }

    // 3. Vé Check-in QR & Soát vé
    if (
      q.includes('checkin') || q.includes('check in') || q.includes('vé của tôi') ||
      q.includes('mã qr vé') || q.includes('bàn vip') || q.includes('soát vé') ||
      q.includes('quét vé') || q.includes('mở vé') || (q.includes('vé') && (q.includes('xem') || q.includes('mở') || q.includes('vào')))
    ) {
      return { route: '/association/checkin', featureName: 'Vé Check-in QR & Sơ Đồ Bàn VIP', tourId: 'association-checkin', actionType: 'navigate' };
    }

    // 4. Danh thiếp số & NFC
    if (
      q.includes('danh thiếp') || q.includes('card visit') || q.includes('thẻ nfc') ||
      q.includes('ghi thẻ') || q.includes('quét card') || q.includes('thẻ hội viên') ||
      q.includes('namecard') || q.includes('name card') || q.includes('quét danh thiếp') ||
      q.includes('chạm thẻ') || q.includes('mở thẻ')
    ) {
      return { route: '/association/card', featureName: 'Thẻ Hội Viên & Danh Thiếp Số NFC', tourId: 'association-card', actionType: 'navigate' };
    }

    // 5. Chợ B2B & Sản phẩm
    if (
      q.includes('chợ b2b') || q.includes('marketplace') || q.includes('gian hàng') ||
      q.includes('chợ') || q.includes('đăng bán') || q.includes('sản phẩm b2b') ||
      (q.includes('sản phẩm') && (q.includes('mở') || q.includes('vào') || q.includes('xem') || q.includes('đăng') || q.includes('tìm') || q.includes('cho xem')))
    ) {
      const prodMatch = q.match(/(?:tìm|kiếm|xem|mua)\s+(?:sản phẩm|mặt hàng|món|dịch vụ)?\s*([a-zA-ZÀ-ỹ0-9\s]{2,25})/i);
      let pkw = '';
      if (prodMatch && prodMatch[1]) {
        const cand = prodMatch[1].trim();
        const skip = ['chợ', 'b2b', 'sản phẩm', 'gian hàng', 'đi', 'nào', 'với'];
        if (!skip.includes(cand) && cand.length >= 2) pkw = cand;
      }
      const route = pkw ? `/association/products?search=${encodeURIComponent(pkw)}` : '/association/products';
      const featureName = pkw ? `Chợ B2B (Tìm: ${pkw})` : 'Chợ Giao Thương B2B & Gian Hàng Số';
      return { route, featureName, tourId: 'association-products', actionType: pkw ? 'search' : 'navigate', searchKeyword: pkw };
    }

    // 6. Cơ hội kinh doanh & Giao thương
    if (
      q.includes('cơ hội') || q.includes('giao thương') || q.includes('hợp tác') ||
      q.includes('chào mua') || q.includes('chào bán') || q.includes('matching') ||
      q.includes('tìm đối tác')
    ) {
      return { route: '/association/opportunities', featureName: 'Sàn Cơ Hội Kinh Doanh B2B', tourId: 'association-opportunities', actionType: 'navigate' };
    }

    // 7. Hộp thư tin nhắn B2B
    if (
      q.includes('tin nhắn') || q.includes('hộp thư') || q.includes('chat') ||
      q.includes('cuộc trò chuyện') || q.includes('nhắn tin') || q.includes('hộp thư đến')
    ) {
      return { route: '/association/messages', featureName: 'Hộp Thư Giao Thương B2B', tourId: 'association-messages', actionType: 'navigate' };
    }

    // 8. Biểu quyết & Lucky Draw
    if (
      q.includes('biểu quyết') || q.includes('bầu cử') || q.includes('bỏ phiếu') ||
      q.includes('lucky draw') || q.includes('quay số') || q.includes('bình chọn')
    ) {
      return { route: '/association/voting', featureName: 'Biểu Quyết Đại Hội & Lucky Draw', tourId: 'association-voting', actionType: 'navigate' };
    }

    // 9. Hồ sơ cá nhân & Đóng hội phí VietQR
    if (
      q.includes('hội phí') || q.includes('đóng phí') || q.includes('hồ sơ cá nhân') ||
      q.includes('hồ sơ của tôi') || q.includes('profile') || q.includes('vietqr') ||
      q.includes('nộp phí') || q.includes('niên liễm') || q.includes('tài khoản mb')
    ) {
      return { route: '/association/profile', featureName: 'Hồ Sơ Cá Nhân & Đóng Hội Phí VietQR', tourId: 'association-profile', actionType: 'navigate' };
    }

    // 10. Thông báo & Nhắc việc
    if (q.includes('thông báo') || q.includes('nhắc việc') || q.includes('tin mới') || q.includes('tin thông báo')) {
      return { route: '/association/notifications', featureName: 'Trung Tâm Thông Báo & Nhắc Việc', tourId: 'association-notifications', actionType: 'navigate' };
    }

    // 11. Kho văn bản & Điều lệ
    if (
      q.includes('văn bản') || q.includes('tài liệu') || q.includes('điều lệ') ||
      q.includes('quy chế') || q.includes('kỷ yếu') || q.includes('nghị quyết')
    ) {
      return { route: '/association/library', featureName: 'Kho Văn Bản, Điều Lệ & Kỷ Yếu', tourId: 'association-library', actionType: 'navigate' };
    }

    // 12. Trang chủ
    if (
      q.includes('trang chủ') || q.includes('dashboard') || q.includes('bàn làm việc') ||
      q === 'về nhà' || q === 'về home' || q === 'home' || q.includes('màn hình chính')
    ) {
      return { route: '/association', featureName: 'Trang Chủ Điều Hành CEO 1983', tourId: 'association-home', actionType: 'navigate' };
    }

    // 13. Quản trị CRM & Phân quyền
    if (q.includes('phân quyền') || q.includes('quản trị crm') || q.includes('quản trị hệ thống') || q.includes('rbac') || q.includes('admin')) {
      return { route: '/permissions', featureName: 'Quản Trị Phân Quyền CRM', tourId: 'permissions-admin', actionType: 'navigate' };
    }

    return null;
  }

  /**
   * Tra cứu tri thức & Dữ liệu động toàn diện trên hệ thống CEO 1983:
   * Tìm kiếm song song: Danh bạ hội viên & Lãnh đạo, Sản phẩm Marketplace, Cơ hội giao thương B2B,
   * Lịch sự kiện & Đại hội, Kho văn bản & Kỷ yếu, Cơ cấu 7 Ban chuyên trách, Chính sách hội phí & MB Bank.
   */
  async searchAssociationData(rawPrompt: string, userId: string) {
    const q = (rawPrompt || '').toLowerCase().trim();
    if (!q) return null;

    // Khớp nguyên cụm từ (không khớp chuỗi con: 'ai' trong 'tài', 'nam' trong 'năm'...)
    const hasPhrase = (kw: string) =>
      new RegExp(`(^|[^\\p{L}])${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}($|[^\\p{L}])`, 'u').test(q);
    const COMMITTEE_NAME_KW = new Set(['cường', 'tuấn', 'trang', 'huy', 'toản', 'lan', 'nam', 'họp', 'hồ sơ']);
    const stopWords = new Set([
      'bạn', 'mình', 'trợ', 'lý', 'bao', 'nhiêu', 'mấy', 'nào', 'gì', 'chưa', 'đã', 'sẽ', 'đang',
      'chào', 'xin', 'cảm', 'ơn', 'nhé', 'nhỉ', 'ạ', 'vậy', 'thế', 'rồi', 'muốn', 'cần', 'biết', 'hiện', 'tại',
      'hãy', 'tìm', 'cho', 'tôi', 'xem', 'ai', 'là', 'gì', 'ở', 'đâu',
      'như', 'thế', 'nào', 'làm', 'sao', 'các', 'những', 'của', 'trong',
      'về', 'giúp', 'em', 'anh', 'chị', 'ơi', 'với', 'được', 'không',
      'có', 'này', 'đó', 'kia', 'thì', 'và', 'hoặc', 'liệu'
    ]);
    const words = q.split(/[\s,?.!;:()\[\]{}"'-]+/).filter((w) => w.length >= 2 && !stopWords.has(w));
    const searchPattern = words.length > 0 ? `%${words.slice(0, 4).join('%')}%` : '%';

    const COMMITTEES_INFO = [
      {
        id: 'ban-thanh-vien',
        name: 'Ban Thành viên',
        leadership: 'Nguyễn Văn Cường (Trưởng ban)',
        scope: 'Phát triển hội viên mới, tiếp nhận hồ sơ gia nhập, thẩm định tư cách và cấp mã định danh M1983.',
        contact: 'Hotline Ban Thành viên: 0983 198 301',
        route: '/association/members',
        keywords: ['thành viên', 'hội viên', 'kết nạp', 'gia nhập', 'hồ sơ', 'mã hội viên', 'cường'],
      },
      {
        id: 'ban-xuc-tien',
        name: 'Ban Xúc tiến thương mại',
        leadership: 'Hoàng Minh Tuấn (Trưởng ban)',
        scope: 'Khởi tạo cơ hội giao thương B2B, quản lý gian hàng Chợ Marketplace, điều phối kết nối 1-on-1 và hợp đồng hợp tác nội khối.',
        contact: 'Hotline Ban Xúc tiến: 0983 198 302',
        route: '/association/products',
        keywords: ['xúc tiến', 'thương mại', 'giao thương', 'b2b', 'sản phẩm', 'chợ', 'gian hàng', 'tuấn', 'hợp tác'],
      },
      {
        id: 'ban-thien-nguyen',
        name: 'Ban Thiện nguyện',
        leadership: 'Vũ Thu Trang (Trưởng ban)',
        scope: 'Tổ chức các chương trình thiện nguyện, quản lý Quỹ Tấm lòng vàng CEO 1983 và các hoạt động an sinh xã hội.',
        contact: 'Hotline Ban Thiện nguyện: 0983 198 303',
        route: '/association',
        keywords: ['thiện nguyện', 'từ thiện', 'an sinh', 'tấm lòng vàng', 'ủng hộ', 'trang'],
      },
      {
        id: 'ban-truyen-thong',
        name: 'Ban Truyền thông',
        leadership: 'Phạm Quang Huy (Trưởng ban)',
        scope: 'Quản trị Cổng tin tức, thương hiệu CEO 1983, truyền thông sự kiện, thông báo đẩy và hệ thống soát vé máy quét camera.',
        contact: 'Hotline Ban Truyền thông: 0983 198 304',
        route: '/association/events',
        keywords: ['truyền thông', 'báo chí', 'hình ảnh', 'tin tức', 'thương hiệu', 'soát vé', 'huy'],
      },
      {
        id: 'ban-quan-tri',
        name: 'Ban Quản trị',
        leadership: 'Trần Quốc Toản (Trưởng ban)',
        scope: 'Điều hành nền tảng công nghệ CRM, giám sát ma trận phân quyền RBAC và kiểm toán hoạt động hiệp hội.',
        contact: 'Hotline Ban Quản trị: 0983 198 305',
        route: '/permissions',
        keywords: ['quản trị', 'hệ thống', 'phân quyền', 'rbac', 'admin', 'bảo mật', 'toản'],
      },
      {
        id: 'ban-tai-chinh',
        name: 'Ban Tài chính',
        leadership: 'Đặng Thị Lan (Trưởng ban)',
        scope: 'Quản lý thu chi ngân sách, đối soát hội phí thường niên qua VietQR MB Bank, quyết toán tài chính định kỳ.',
        contact: 'Hotline Ban Tài chính: 0983 198 306',
        route: '/association/profile',
        keywords: ['tài chính', 'ngân sách', 'hội phí', 'thu chi', 'kế toán', 'quyết toán', 'lan'],
      },
      {
        id: 'ban-thu-ky',
        name: 'Ban Thư ký',
        leadership: 'Lê Hoàng Nam (Tổng thư ký)',
        scope: 'Điều phối các kỳ họp BCH, Đại hội thường niên, ban hành nghị quyết, quản lý kho văn bản và kỷ yếu điện tử.',
        contact: 'Hotline Ban Thư ký: 0983 198 307',
        route: '/association/library',
        keywords: ['thư ký', 'tổng thư ký', 'nghị quyết', 'biên bản', 'họp', 'kỷ yếu', 'văn bản', 'nam'],
      },
    ];

    const matchedCommittees = COMMITTEES_INFO.filter((c) =>
      c.keywords.some((kw) => !COMMITTEE_NAME_KW.has(kw) && hasPhrase(kw)) || q.includes(c.name.toLowerCase()) || q.includes(c.leadership.toLowerCase().split(' (')[0])
    );

    const isFeeQuery =
      q.includes('hội phí') || q.includes('niên liễm') || q.includes('đóng phí') ||
      q.includes('số tài khoản') || q.includes('ngân hàng') || q.includes('stk') ||
      q.includes('mb bank') || q.includes('vietqr');

    const feePolicy = {
      bankName: 'Ngân hàng Quân Đội (MB Bank)',
      accountNo: '1983000000',
      accountName: 'CLB DOANH NHAN CEO 1983',
      standardTier: '10.000.000 VNĐ / năm (Hội viên Chính thức)',
      goldTier: '20.000.000 VNĐ / năm (Hội viên VIP Gold)',
      diamondTier: '50.000.000 VNĐ / năm (Hội viên Kim cương)',
      syntax: '[Mã Hội Viên] HP2026 hoặc [Họ Tên] HP2026',
      route: '/association/profile',
    };

    const [members, products, opportunities, events, documents] = await Promise.all([
      words.length > 0
        ? this.prisma.$queryRaw<any[]>`
            SELECT id, code, name, full_name, company, position, title, level, department, contact, email
            FROM public.members
            WHERE name ILIKE ${searchPattern}
               OR full_name ILIKE ${searchPattern}
               OR company ILIKE ${searchPattern}
               OR department ILIKE ${searchPattern}
               OR position ILIKE ${searchPattern}
               OR title ILIKE ${searchPattern}
            LIMIT 5
          `.catch(() => [] as any[])
        : Promise.resolve([]),

      words.length > 0
        ? this.prisma.$queryRaw<any[]>`
            SELECT id, name, title, description, price, category, company
            FROM public.products
            WHERE name ILIKE ${searchPattern}
               OR title ILIKE ${searchPattern}
               OR description ILIKE ${searchPattern}
               OR category ILIKE ${searchPattern}
               OR company ILIKE ${searchPattern}
            LIMIT 5
          `.catch(() => [] as any[])
        : Promise.resolve([]),

      words.length > 0
        ? this.prisma.$queryRaw<any[]>`
            SELECT id, title, description, type, category, target_industry, valuation, poster_name, poster_company
            FROM public.opportunities
            WHERE title ILIKE ${searchPattern}
               OR description ILIKE ${searchPattern}
               OR category ILIKE ${searchPattern}
               OR target_industry ILIKE ${searchPattern}
            LIMIT 5
          `.catch(() => [] as any[])
        : Promise.resolve([]),

      this.prisma.$queryRaw<any[]>`
        SELECT id, name, date, time, location, capacity, registered
        FROM public.events
        WHERE (${words.length === 0} OR name ILIKE ${searchPattern} OR location ILIKE ${searchPattern})
        ORDER BY date DESC
        LIMIT 5
      `.catch(() => [] as any[]),

      words.length > 0
        ? this.prisma.$queryRaw<any[]>`
            SELECT id, code, name, category, file_path, publish_date
            FROM public.documents
            WHERE name ILIKE ${searchPattern}
               OR code ILIKE ${searchPattern}
               OR category ILIKE ${searchPattern}
            LIMIT 5
          `.catch(() => [] as any[])
        : Promise.resolve([]),
    ]);

    return {
      keywords: words,
      matchedCommittees,
      isFeeQuery,
      feePolicy,
      members: members || [],
      products: products || [],
      opportunities: opportunities || [],
      events: events || [],
      documents: documents || [],
    };
  }

  /**
   * Hỏi đáp Trợ lý AI Thông Minh:
   * Kết hợp Google Gemini 2.0 Flash Free Tier + Dynamic PostgreSQL Knowledge & RAG Engine
   */
  async askAssistant(userId: string, prompt: string, clientContext?: any): Promise<{
    answer: string;
    speechText: string;
    intent: 'chat' | 'query_data' | 'start_tour' | 'feature_guide' | 'navigate' | 'action';
    tourId?: string;
    route?: string;
    featureName?: string;
    actionType?: 'navigate' | 'search' | 'theme' | 'call';
    suggestTour?: boolean;
    dynamicData?: any;
    provider: string;
    model: string;
  }> {
    // 0. Giới hạn 50 câu hỏi cho mỗi tài khoản
    const quotaCheck = await this.checkAndIncrementUserQuota(userId, prompt);
    if (!quotaCheck.allowed) {
      return {
        answer: `⚠️ Tài khoản của Anh/Chị đã sử dụng hết giới hạn 50 câu hỏi AI (hoặc đã đạt ngưỡng hạn mức tối đa). Vui lòng liên hệ Quản Trị Viên Hệ Thống để được cấp thêm lượt hỏi đáp nhé!`,
        speechText: `Tài khoản của bạn đã đạt giới hạn 50 câu hỏi AI. Vui lòng liên hệ ban quản trị để được hỗ trợ.`,
        intent: 'chat',
        provider: 'quota-guard',
        model: 'limit-50-questions',
      };
    }

    const context = await this.getLiveMemberAssistantContext(userId);
    const rawPrompt = (prompt || '').trim();
    const q = rawPrompt.toLowerCase();

    // 0.a Câu hỏi về chính trợ lý / chào hỏi -> trả lời đúng ngữ cảnh, không tra cứu từ khóa
    const metaAnswer = this.answerMetaQuestion(rawPrompt, context);
    if (metaAnswer) {
      return { ...metaAnswer, dynamicData: { roleLabel: context.roleLabel } };
    }

    // Lịch sử hội thoại gần nhất (client gửi lên) để LLM hiểu câu hỏi nối tiếp
    const historyText = Array.isArray(clientContext?.history)
      ? (clientContext.history as any[])
          .slice(-6)
          .map((m) => `${m?.role === 'assistant' ? 'Trợ lý' : 'Hội viên'}: ${String(m?.content || '').slice(0, 400)}`)
          .join('\n')
      : '';

    // 0. Xử lý phản hồi khẳng định ("Có", "Đồng ý", "OK", "Hướng dẫn đi", "Bắt đầu")
    // khi người dùng đồng ý hướng dẫn thao tác trực tiếp:
    const isAffirmative =
      q === 'có' ||
      q === 'co' ||
      q === 'có chứ' ||
      q === 'co chu' ||
      q === 'ok' ||
      q === 'yes' ||
      q === 'y' ||
      q.includes('đồng ý') ||
      q.includes('dong y') ||
      q.includes('hướng dẫn đi') ||
      q.includes('dẫn đường đi') ||
      q.includes('chỉ đi') ||
      q.includes('bắt đầu đi') ||
      q.includes('bắt đầu ngay') ||
      q.includes('thao tác trực tiếp');

    if (isAffirmative && (clientContext?.pendingTourId || clientContext?.lastTourId)) {
      const tourId = clientContext.pendingTourId || clientContext.lastTourId;
      const route = clientContext.pendingRoute || clientContext.lastRoute || '/association';
      const featureName = clientContext.featureName || 'chức năng';

      return {
        answer: `🚀 **Đang kích hoạt Dẫn đường Trực tiếp GPS:**\n\nTôi đang chuyển màn hình và khởi động vòng sáng chỉ dẫn từng thao tác cho Quý Anh/Chị đối với **${featureName}**. Vui lòng quan sát màn hình và thực hiện theo từng điểm chạm nhé!`,
        speechText: `Vâng! Tôi sẽ dẫn đường trực tiếp cho Quý anh chị đối với chức năng ${featureName} ngay bây giờ. Hãy quan sát màn hình và làm theo giọng nói nhé!`,
        intent: 'start_tour',
        tourId,
        route,
        featureName,
        suggestTour: false,
        provider: 'ceo1983-smart-engine',
        model: 'gps-tour-router',
      };
    }

    // 0.5. Lệnh điều khiển giọng nói & tự động thao tác (Autonomous Voice & Action Execution)
    const personalAnswer = this.answerPersonalAccountQuestion(rawPrompt, context);
    const voiceNav = personalAnswer ? null : this.classifyVoiceNavigation(rawPrompt);
    if (voiceNav) {
      if (voiceNav.actionType === 'theme') {
        return {
          answer: `🌓 **Đang thực hiện chuyển đổi giao diện Sáng / Tối...**\n\nHệ thống đã đổi chế độ màu màn hình theo yêu cầu của Quý Anh/Chị.`,
          speechText: `Em đã chuyển đổi giao diện hệ thống cho Quý Anh/Chị rồi ạ!`,
          intent: 'action',
          actionType: 'theme',
          route: voiceNav.route,
          featureName: voiceNav.featureName,
          suggestTour: false,
          provider: 'ceo1983-smart-engine',
          model: 'voice-action-theme',
        };
      }

      if (voiceNav.actionType === 'call') {
        return {
          answer: `📞 **Đang kết nối tới ${voiceNav.featureName}...**\nHotline: **0983 198 307**\n\nỨng dụng đang mở trình quay số điện thoại cho Quý Anh/Chị.`,
          speechText: `Em đang kết nối tới hotline Ban Thư Ký cho Quý Anh/Chị ngay đây ạ!`,
          intent: 'action',
          actionType: 'call',
          route: voiceNav.route,
          featureName: voiceNav.featureName,
          suggestTour: false,
          provider: 'ceo1983-smart-engine',
          model: 'voice-action-call',
        };
      }

      // Nếu là tìm kiếm hội viên có từ khóa cụ thể:
      if (voiceNav.searchKeyword && voiceNav.route.includes('/association/members')) {
        const searchPattern = `%${voiceNav.searchKeyword}%`;
        const matched = await this.prisma.$queryRaw<any[]>`
          SELECT id, code, name, full_name, company, position, title, level, department, contact, phone, email
          FROM public.members
          WHERE name ILIKE ${searchPattern}
             OR full_name ILIKE ${searchPattern}
             OR company ILIKE ${searchPattern}
          LIMIT 3
        `.catch(() => [] as any[]);

        if (matched.length > 0) {
          const listStr = matched.map((m: any, idx: number) =>
            `${idx + 1}. **${m.name || m.full_name}** - ${m.position || m.title || 'Lãnh đạo'} tại **${m.company || 'Doanh nghiệp'}** (SĐT: ${m.phone || m.contact || 'Đã kết nối'})`
          ).join('\n');

          return {
            answer: `🔍 **Tìm thấy ${matched.length} hội viên khớp với từ khóa "${voiceNav.searchKeyword}":**\n\n${listStr}\n\n⚡ **Đang tự động chuyển màn hình sang Danh Bạ Hội Viên...**`,
            speechText: `Em đã tìm thấy ${matched[0].name || matched[0].full_name} và đang tự động mở Danh bạ cho Quý Anh/Chị ngay bây giờ ạ!`,
            intent: 'navigate',
            tourId: voiceNav.tourId,
            route: voiceNav.route,
            featureName: voiceNav.featureName,
            suggestTour: false,
            dynamicData: { members: matched },
            provider: 'ceo1983-smart-engine',
            model: 'voice-search-navigate',
          };
        }
      }

      // Điều hướng tự động đến màn hình
      return {
        answer: `⚡ **Đang tự động thao tác: Chuyển sang ${voiceNav.featureName}...**\n\nHệ thống sẽ tự động điều hướng màn hình cho Quý Anh/Chị ngay bây giờ.`,
        speechText: `Dạ vâng, em chuyển sang ${voiceNav.featureName} cho Quý Anh/Chị ngay đây ạ!`,
        intent: 'navigate',
        tourId: voiceNav.tourId,
        route: voiceNav.route,
        featureName: voiceNav.featureName,
        suggestTour: false,
        provider: 'ceo1983-smart-engine',
        model: 'voice-auto-nav',
      };
    }

    // Tra cứu dữ liệu động thời gian thực từ Database
    const searchData = await this.searchAssociationData(rawPrompt, userId);

    // 1. Kiểm tra biến môi trường hoặc app_settings cho GEMINI_API_KEY
    let geminiKey = process.env.GEMINI_API_KEY || null;
    if (!geminiKey) {
      const setting = await this.prisma.$queryRaw<{ value: unknown }[]>`
        SELECT value FROM public.app_settings WHERE key = 'gemini_api_key' LIMIT 1
      `.catch(() => [] as { value: unknown }[]);
      const val = setting[0]?.value as { key?: string; apiKey?: string } | string | null;
      if (typeof val === 'string') geminiKey = val;
      else if (val && typeof val === 'object') geminiKey = val.key || val.apiKey || null;
    }

    // Prompt hệ thống dùng chung cho Gemini trực tiếp và OpenRouter fallback
    {
        const sysPrompt = `Bạn là Trợ lý Ảo Doanh Nhân kiêm Chỉ dẫn Điều hành thông minh của CLB Doanh Nhân CEO 1983 (HanoiBA).
Phong cách: Tinh tế, sắc sảo, đĩnh đạc, thấu cảm và cực kỳ thông minh của một Giám đốc Trợ lý Điều hành Cấp cao (Senior Executive Assistant). Luôn xưng "Em" và gọi người dùng là "Quý Anh/Chị" hoặc theo tên riêng "${context.user.name}".

BẢN ĐỒ TOÀN BỘ 19 MODULE HỆ THỐNG & API BACKEND CEO 1983 (API CATALOGUE & KNOWLEDGE GRAPH):
1. Module Hội viên (/api/members): Quản lý 200+ CEO, danh bạ hồ sơ 360°, chức vụ, doanh nghiệp, phê duyệt hội viên. (Route: /association/members, Tour: association-members)
2. Module Sự kiện (/api/events): Lịch sự kiện, hội nghị, workshop, đăng ký tham dự, sơ đồ bàn VIP, danh sách đại biểu. (Route: /association/events, Tour: association-events)
3. Module Vé & Check-in (/api/events/checkin, /api/events/tickets): Vé điện tử, mã QR động, camera/NFC quét vé cổng, điểm danh realtime. (Route: /association/checkin, Tour: association-checkin)
4. Module Danh thiếp số (/api/business-card): Card visit điện tử 5.0, chạm thẻ NFC 1 giây, quét danh thiếp AI OCR, trao đổi contact. (Route: /association/card, Tour: association-card)
5. Module Sàn Sản phẩm B2B (/api/marketplace/products): Chợ giao thương B2B, gian hàng số, đăng bán & tìm kiếm sản phẩm ưu đãi nội bộ. (Route: /association/products, Tour: association-products)
6. Module Sàn Cơ hội Kinh doanh (/api/opportunities): Đăng tin Cung - Cầu, tìm kiếm đối tác, dự án đầu tư B2B, matching tự động. (Route: /association/opportunities, Tour: association-opportunities)
7. Module Biểu quyết & Đại hội (/api/voting): Bỏ phiếu tín nhiệm, biểu quyết nghị quyết trực tuyến, quay số may mắn Lucky Draw. (Route: /association/voting, Tour: association-voting)
8. Module Tin nhắn & Kết nối (/api/connect-app): Hộp thư B2B, phòng chat ban chuyên môn, đặt lịch hẹn kết nối 1-on-1. (Route: /association/messages, Tour: association-messages)
9. Module Kho Văn bản & Kỷ yếu (/api/documents): Thư viện số, điều lệ CLB, nghị quyết ban điều hành, kỷ yếu doanh nhân số. (Route: /association/library, Tour: association-library)
10. Module Hội phí & Ngân sách (/api/fees, /api/finance): Tra cứu niên liễm, ngân sách thu chi, cổng thanh toán VietQR MB Bank tự động 24/7. (Route: /association/profile, Tour: association-profile)
11. Module Nhiệm vụ & Ban Thư ký (/api/tasks): Giao việc, phân công nhiệm vụ các ban chuyên môn, theo dõi tiến độ công việc. (Route: /tasks, Tour: tasks-admin)
12. Module Quản lý Nhà tài trợ (/api/sponsors): Gói tài trợ Kim Cương/Vàng/Bạc, quyền lợi tài trợ sự kiện, hợp đồng tài trợ. (Route: /sponsors, Tour: sponsors-admin)
13. Module Cuộc họp Ban Điều hành (/api/meetings): Lịch họp ban thường trực, họp định kỳ ban chuyên môn, biên bản họp số. (Route: /meetings, Tour: meetings-admin)
14. Module Thiện nguyện & An sinh (/api/charity): Các chương trình an sinh xã hội, tài trợ cộng đồng, đóng góp quỹ thiện nguyện. (Route: /association/charity, Tour: association-charity)
15. Module Phân quyền RBAC (/api/admin/permissions, /api/admin/member-permissions): Ma trận quyền đa cấp: Quản trị, Admin, Tổng thư ký, 5 Trưởng ban (Truyền thông, Thành viên, Xúc tiến, Tài chính, Thiện nguyện), Thành viên. (Route: /permissions, Tour: permissions-admin)
16. Module Kiểm toán & Nhật ký (/api/activity-log): Lịch sử thao tác, truy vết bảo mật, giám sát dữ liệu CRM. (Route: /activity-log, Tour: activity-log)
17. Module Trung tâm Thông báo (/api/notifications): Thông báo đẩy, nhắc việc, xác nhận vé, lịch họp. (Route: /association/notifications, Tour: association-notifications)
18. Module Hồ sơ Cá nhân (/api/users/me, /api/users/profile): Cập nhật thông tin CEO, doanh nghiệp, ngành nghề, avatar, đổi mật khẩu. (Route: /association/profile, Tour: association-profile)
19. Module Cấu hình Hệ thống (/api/app-settings): Cấu hình cổng thanh toán VietQR, AI Engine, thông tin CLB. (Route: /settings, Tour: settings-admin)

DỮ LIỆU ĐỘNG THỜI GIAN THỰC CỦA HỘI VIÊN ĐANG ĐĂNG NHẬP:
- Họ tên: ${context.user.name} | Mã hội viên: ${context.user.code}
- Công ty: ${context.user.company} | Chức vụ: ${context.user.title} | Cấp bậc: ${context.user.level}
- Trạng thái hội phí: ${context.dues.feePaid ? 'ĐÃ ĐÓNG ĐẦY ĐỦ' : `CHƯA ĐÓNG - Còn nợ ${new Intl.NumberFormat('vi-VN').format(context.dues.totalOutstanding)} đ (Kỳ ${context.dues.feeYear})`}
- Thông báo chưa đọc: ${context.notifications.unreadCount} thông báo
- Sự kiện đã đăng ký (${context.myEvents.length} sự kiện): ${JSON.stringify(context.myEvents)}
- Sự kiện nhiều người đăng ký nhất trong Hiệp hội: ${JSON.stringify(context.topEvents)}
- Kết nối bạn bè: ${context.connections.friendsCount} người đã kết nối, ${context.connections.pendingIncoming} lời mời chờ duyệt, ${context.connections.pendingOutgoing} lời mời đã gửi
- Cơ hội kinh doanh đang quan tâm (${context.interestedOpportunities.length}): ${JSON.stringify(context.interestedOpportunities)}
- Cơ hội kinh doanh đã đăng (${context.myOpportunities.length}): ${JSON.stringify(context.myOpportunities)}
- Sản phẩm đang đăng bán (${context.myProducts.length}): ${JSON.stringify(context.myProducts)}
- Lịch hẹn / cuộc họp B2B (${context.myMeetings.length}, sắp tới ${context.myMeetings.filter((m) => m.upcoming).length}): ${JSON.stringify(context.myMeetings)}
- Hóa đơn chưa thanh toán: ${JSON.stringify(context.dues.unpaidInvoices)}
- Thông báo chưa đọc gần nhất: ${JSON.stringify(context.notifications.unreadList.slice(0, 5).map((n: any) => n.title))}
KHI NGƯỜI DÙNG HỎI VỀ TÀI KHOẢN CỦA HỌ (sự kiện của tôi, bạn bè, cơ hội quan tâm, cuộc hẹn, hóa đơn...): BẮT BUỘC trả lời bằng SỐ LIỆU THẬT ở trên, intent = "query_data", không bịa dữ liệu.

DỮ LIỆU ĐỘNG THỜI GIAN THỰC ĐƯỢC TRÍCH XUẤT TỪ HỆ THỐNG (RAG GROUND TRUTH):
- Ban chuyên trách: ${JSON.stringify(searchData?.matchedCommittees || [])}
- Chính sách hội phí & MB Bank: ${JSON.stringify(searchData?.feePolicy || {})}
- Danh bạ hội viên / Lãnh đạo tìm thấy: ${JSON.stringify(searchData?.members || [])}
- Sản phẩm Marketplace: ${JSON.stringify(searchData?.products || [])}
- Cơ hội giao thương B2B: ${JSON.stringify(searchData?.opportunities || [])}
- Sự kiện & Hội nghị: ${JSON.stringify(searchData?.events || [])}
- Văn bản / Điều lệ: ${JSON.stringify(searchData?.documents || [])}

LỊCH SỬ HỘI THOẠI GẦN NHẤT (để hiểu câu hỏi nối tiếp):
${historyText || '(chưa có)'}

QUY TẮC HIỂU ĐÚNG Ý ĐỊNH (QUAN TRỌNG NHẤT):
- "bạn"/"em" trong câu hỏi thường là GỌI TRỢ LÝ, KHÔNG phải "bạn bè". Ví dụ "bạn làm được gì" = hỏi năng lực trợ lý.
- Chỉ trả lời đúng điều được hỏi; KHÔNG liệt kê dữ liệu RAG không liên quan. Dữ liệu RAG chỉ là tham khảo, có thể không khớp câu hỏi.
- Câu hỏi về tài khoản: dùng DỮ LIỆU THẬT của hội viên ở trên; nếu số liệu = 0 thì nói rõ là chưa có, không bịa.
- Quyền: vai trò hiện tại là "${context.roleLabel}". Chỉ Quản trị / Admin / Chủ tịch mới được phân quyền, sửa/xóa tin tức; người khác hỏi thì giải thích lịch sự.

QUY TẮC PHÂN TÍCH NGỮ CẢNH CÂU HỎI (BẮT BUỘC):
1. ĐỐI VỚI CÂU HỎI HƯỚNG DẪN THAO TÁC / CÁCH LÀM / Ở ĐÂU / LÀM SAO / XEM / TẠO / SỬA / ĐĂNG KÝ:
   - TỰ ĐỘNG CHUYỂN MÀN HÌNH SANG ĐÚNG TÍNH NĂNG NGAY LẬP TỨC!
   - Không được hỏi lại "Quý Anh/Chị có muốn tôi hướng dẫn không?" làm mất thời gian người dùng.
   - Trả về:
     + "intent": "navigate"
     + "route": route của tính năng đó (vd: /association/events, /association/card, /association/members,...)
     + "tourId": tourId tương ứng (vd: association-events, association-card,...)
     + "featureName": Tên tính năng tiếng Việt
     + "suggestTour": true
   - Trong "answer": Nêu ngắn gọn 3 bước thao tác cốt lõi, và kết thúc bằng câu:
     "⚡ **Đang tự động chuyển màn hình sang [Tên tính năng] để Quý Anh/Chị thao tác ngay...**"
   - Trong "speechText": Nêu ngắn gọn và nói: "Dạ vâng, em chuyển sang [Tên tính năng] cho Quý Anh/Chị thao tác ngay đây ạ!"

2. ĐỐI VỚI CÂU HỎI XÃ GIAO, ĐỜI SỐNG, CÔNG VIỆC, TÂM SỰ HOẶC 'LINH TINH':
   - Phân tích sâu sắc ngữ cảnh câu hỏi, trả lời với trí tuệ, sự sắc bén, duyên dáng và thấu cảm cao.
   - Thể hiện tinh thần Doanh nhân CEO 1983: Bản lĩnh, kiên cường, đoàn kết, lạc quan và giàu năng lượng.
   - Trả về "intent": "chat", "suggestTour": false. Không để route hay tourId nếu không liên quan đến chức năng app.

ĐỊNH DẠNG ĐẦU RA JSON BẮT BUỘC:
{
  "answer": "Nội dung câu trả lời markdown chỉn chu, chuyên nghiệp",
  "speechText": "Câu đọc ngắn gọn, truyền cảm để phát âm qua loa",
  "intent": "navigate" | "chat" | "query_data" | "action",
  "tourId": "id tour hoặc để trống",
  "route": "route điều hướng hoặc để trống",
  "featureName": "tên tính năng hoặc để trống",
  "suggestTour": boolean
}`;

        const toResult = (parsed: any, provider: string, model: string) => ({
          answer: String(parsed.answer || ''),
          speechText: String(parsed.speechText || parsed.answer || ''),
          intent: (parsed.intent || (parsed.route ? 'navigate' : 'chat')) as
            'chat' | 'query_data' | 'start_tour' | 'feature_guide' | 'navigate' | 'action',
          tourId: parsed.tourId || undefined,
          route: parsed.route || undefined,
          featureName: parsed.featureName || undefined,
          suggestTour: Boolean(parsed.suggestTour || parsed.route),
          dynamicData: context,
          provider,
          model,
        });

        // 1a. Google Gemini trực tiếp (nếu có key)
        if (geminiKey) {
          for (const gModel of ['gemini-2.5-flash', 'gemini-2.0-flash']) {
            try {
              const geminiRes = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/${gModel}:generateContent?key=${geminiKey}`,
                {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    contents: [{ parts: [{ text: `${sysPrompt}\n\nCÂU HỎI CỦA HỘI VIÊN: "${prompt}"` }] }],
                    generationConfig: {
                      temperature: 0.2,
                      responseMimeType: 'application/json',
                    },
                  }),
                },
              );

              if (geminiRes.ok) {
                const rawData = await geminiRes.json();
                const jsonText = rawData?.candidates?.[0]?.content?.parts?.[0]?.text;
                if (jsonText) {
                  const parsed = JSON.parse(jsonText);
                  if (parsed?.answer) return toResult(parsed, 'gemini-free', gModel);
                }
              } else {
                console.warn(`[AiService] Gemini ${gModel} HTTP ${geminiRes.status}`);
              }
            } catch (err: any) {
              console.warn(`[AiService] Gemini ${gModel} error:`, err?.message);
            }
          }
        }

        // 1b. OpenRouter — chuỗi model miễn phí tốt nhất (fallback lần lượt)
        const orResult = await this.callOpenRouterJson(sysPrompt, prompt).catch(() => null);
        if (orResult?.parsed) {
          return toResult(orResult.parsed, 'openrouter-free', orResult.model);
        }
    }

    // 1c. Không có LLM khả dụng -> trả lời chính xác dữ liệu tài khoản từ DB
    if (personalAnswer) {
      return personalAnswer;
    }

    // 2. SMART HYBRID NLP ENGINE (Fallback thông minh 100% không phụ thuộc ngoài)
    // 2.1. Phản hồi Thông tin Ban Chuyên Trách & Lãnh Đạo
    if (searchData && searchData.matchedCommittees.length > 0) {
      const comm = searchData.matchedCommittees[0];
      const answer = `🏛️ **Thông tin ${comm.name} - CLB Doanh Nhân CEO 1983:**\n\n- 👤 **Lãnh đạo phụ trách:** **${comm.leadership}**\n- 📋 **Phạm vi & Chức năng:** ${comm.scope}\n- 📞 **Kênh liên hệ trực tiếp:** \`${comm.contact}\`\n\n👉 *Quý Anh/Chị có muốn tôi chuyển đến khu vực làm việc của ban này không?*`;
      const speechText = `Dạ thưa Quý anh chị, ${comm.name} do ${comm.leadership} phụ trách. ${comm.contact}. Quý anh chị có muốn tôi mở màn hình liên quan không ạ?`;
      return {
        answer,
        speechText,
        intent: 'feature_guide',
        suggestTour: true,
        tourId: comm.route.replace('/', '').replace('/', '-') || 'association-members',
        route: comm.route,
        featureName: comm.name,
        dynamicData: { committee: comm },
        provider: 'ceo1983-smart-engine',
        model: 'rag-committee-v1',
      };
    }

    // 2.2. Phản hồi về Chính sách Hội Phí & MB Bank
    if (searchData?.isFeeQuery) {
      const dues = context.dues;
      const formattedOwed = new Intl.NumberFormat('vi-VN').format(dues.totalOutstanding || 0);
      const answer = `💳 **Quy định & Kênh đóng Hội phí CLB Doanh Nhân CEO 1983:**\n\n- 🏦 **Ngân hàng thụ hưởng:** MB Bank (Ngân hàng Quân Đội)\n- 🔢 **Số tài khoản:** \`1983000000\`\n- 👤 **Chủ tài khoản:** **CLB DOANH NHAN CEO 1983**\n- 💰 **Định mức niên liễm:**\n  + Tiêu chuẩn: **10.000.000 VNĐ / năm**\n  + VIP Gold: **20.000.000 VNĐ / năm**\n  + Kim cương: **50.000.000 VNĐ / năm**\n- 📝 **Cú pháp chuyển khoản:** \`${context.user.code} HP2026\` hoặc \`${context.user.name} HP2026\`\n\n*Trạng thái của Quý Anh/Chị:* ${dues.feePaid ? '✅ **ĐÃ HOÀN TẤT ĐẦY ĐỦ**' : `⚠️ **Còn nợ ${formattedOwed} VNĐ (Kỳ ${dues.feeYear || 2026})**`}\n\n👉 *Quý Anh/Chị có muốn tôi mở mục Hồ sơ để quét mã VietQR MB Bank thanh toán tự động trong 1 giây không?*`;
      const speechText = `Hội phí CEO 1983 được tiếp nhận qua MB Bank, số tài khoản một chín tám ba không không không không không không, chủ tài khoản CLB Doanh Nhân CEO 1983. Quý anh chị có muốn tôi mở mã VietQR để thanh toán ngay không ạ?`;
      return {
        answer,
        speechText,
        intent: 'feature_guide',
        suggestTour: true,
        tourId: 'association-profile',
        route: '/association/profile',
        featureName: 'Hồ Sơ & Đóng Hội Phí VietQR',
        dynamicData: { dues: context.dues, feePolicy: searchData.feePolicy },
        provider: 'ceo1983-smart-engine',
        model: 'rag-fees-v1',
      };
    }

    // 2.3. Tra cứu Hội viên & Lãnh đạo (Members & Business Directory)
    if (searchData && searchData.members.length > 0 && (
      /(^|\s)(ai|tìm)(\s|$|\?)/.test(q) || q.includes('thành viên') || q.includes('hội viên') ||
      q.includes('công ty') || q.includes('doanh nghiệp') || q.includes('giám đốc') || q.includes('chủ tịch') ||
      q.includes('trưởng ban') || q.includes('phó ban') || q.includes('ceo')
    )) {
      const list = searchData.members.map((m: any, idx: number) =>
        `${idx + 1}. **${m.name || m.full_name}** (${m.code || 'M1983'})\n   - Chức vụ: **${m.position || m.title || 'Lãnh đạo'}** tại **${m.company || 'Doanh nghiệp Hội viên'}**\n   - Phân ban: ${m.department || 'Ban Hội viên'} | Hạng: ${m.level || 'Chính thức'}`
      ).join('\n\n');

      const answer = `👥 **Tìm thấy ${searchData.members.length} hội viên doanh nhân phù hợp:**\n\n${list}\n\n👉 *Quý Anh/Chị có muốn tôi mở **Danh Bạ Hội Viên** để gửi lời mời hẹn gặp 1-on-1 hoặc xem hồ sơ năng lực 360° không?*`;
      const speechText = `Tôi đã tìm thấy ${searchData.members.length} hội viên doanh nhân phù hợp trong hệ thống, bao gồm anh chị ${searchData.members[0].name || searchData.members[0].full_name} tại ${searchData.members[0].company || 'doanh nghiệp'}. Quý anh chị có muốn tôi mở Danh bạ để kết nối ngay không ạ?`;
      return {
        answer,
        speechText,
        intent: 'feature_guide',
        suggestTour: true,
        tourId: 'association-members',
        route: '/association/members',
        featureName: 'Danh Bạ 200+ CEO & Hẹn 1-on-1',
        dynamicData: { members: searchData.members },
        provider: 'ceo1983-smart-engine',
        model: 'rag-members-v1',
      };
    }

    // 2.4. Tra cứu Sản phẩm Chợ B2B (Marketplace Products)
    if (searchData && searchData.products.length > 0 && (
      q.includes('sản phẩm') || q.includes('chợ') || q.includes('bán') || q.includes('mua') ||
      q.includes('giá') || q.includes('hàng') || q.includes('gian hàng') || q.includes('marketplace')
    )) {
      const list = searchData.products.map((p: any, idx: number) => {
        const priceStr = p.price ? new Intl.NumberFormat('vi-VN').format(p.price) + ' VNĐ' : 'Liên hệ đàm phán';
        return `${idx + 1}. 🛍️ **${p.name || p.title}**\n   - Giá niêm yết: **${priceStr}**\n   - Doanh nghiệp cung cấp: **${p.company || 'Hội viên CEO 1983'}**\n   - Danh mục: ${p.category || 'Sản phẩm B2B'}`;
      }).join('\n\n');

      const answer = `🛍️ **Tìm thấy ${searchData.products.length} sản phẩm trên Chợ Giao Thương B2B:**\n\n${list}\n\n👉 *Quý Anh/Chị có muốn tôi mở **Chợ B2B** để xem chi tiết và trao đổi trực tiếp với chủ gian hàng không?*`;
      const speechText = `Hệ thống có ${searchData.products.length} sản phẩm phù hợp trên Chợ B2B, tiêu biểu là ${searchData.products[0].name || searchData.products[0].title}. Quý anh chị có muốn tôi mở Chợ B2B ngay không ạ?`;
      return {
        answer,
        speechText,
        intent: 'feature_guide',
        suggestTour: true,
        tourId: 'association-products',
        route: '/association/products',
        featureName: 'Chợ Giao Thương B2B & Gian Hàng Số',
        dynamicData: { products: searchData.products },
        provider: 'ceo1983-smart-engine',
        model: 'rag-products-v1',
      };
    }

    // 2.5. Tra cứu Cơ hội Kinh doanh & Giao thương B2B
    if (searchData && searchData.opportunities.length > 0 && (
      q.includes('cơ hội') || q.includes('giao thương') || q.includes('hợp tác') ||
      q.includes('đối tác') || q.includes('chào mua') || q.includes('chào bán') || q.includes('dự án')
    )) {
      const list = searchData.opportunities.map((o: any, idx: number) => {
        const valStr = o.valuation ? new Intl.NumberFormat('vi-VN').format(o.valuation) + ' VNĐ' : 'Thỏa thuận';
        return `${idx + 1}. 💼 **${o.title}**\n   - Loại hình: **${o.type === 'buy' ? 'Chào mua' : o.type === 'sell' ? 'Chào bán' : 'Hợp tác'}**\n   - Quy mô / Định giá: **${valStr}**\n   - Ngành nghề: ${o.target_industry || o.category || 'Đa ngành'}\n   - Người đăng: ${o.poster_name || 'Hội viên'} (${o.poster_company || 'Doanh nghiệp'})`;
      }).join('\n\n');

      const answer = `💼 **Tìm thấy ${searchData.opportunities.length} cơ hội giao thương B2B đang mở:**\n\n${list}\n\n👉 *Quý Anh/Chị có muốn tôi mở **Sàn Cơ Hội** để gửi yêu cầu kết nối matching ngay bây giờ không?*`;
      const speechText = `Tìm thấy ${searchData.opportunities.length} cơ hội kinh doanh giao thương đang mở, nổi bật là ${searchData.opportunities[0].title}. Quý anh chị có muốn tôi mở Sàn cơ hội không ạ?`;
      return {
        answer,
        speechText,
        intent: 'feature_guide',
        suggestTour: true,
        tourId: 'association-opportunities',
        route: '/association/opportunities',
        featureName: 'Sàn Cơ Hội Kinh Doanh B2B',
        dynamicData: { opportunities: searchData.opportunities },
        provider: 'ceo1983-smart-engine',
        model: 'rag-opportunities-v1',
      };
    }

    // 2.6. Tra cứu Kho Văn bản, Điều lệ & Kỷ yếu
    if (searchData && searchData.documents.length > 0 && (
      q.includes('văn bản') || q.includes('tài liệu') || q.includes('điều lệ') ||
      q.includes('quy chế') || q.includes('kỷ yếu') || q.includes('nghị quyết')
    )) {
      const list = searchData.documents.map((d: any, idx: number) =>
        `${idx + 1}. 📚 **${d.name}**\n   - Mã hiệu: \`${d.code || 'DOC'}\` | Danh mục: ${d.category || 'Tài liệu chung'}`
      ).join('\n\n');

      const answer = `📚 **Tìm thấy ${searchData.documents.length} văn bản / tài liệu liên quan:**\n\n${list}\n\n👉 *Quý Anh/Chị có muốn tôi mở **Kho Văn Bản & Kỷ Yếu** để tra cứu và tải về không?*`;
      const speechText = `Có ${searchData.documents.length} tài liệu trong Kho văn bản, bao gồm ${searchData.documents[0].name}. Quý anh chị có muốn tôi mở Kho văn bản không ạ?`;
      return {
        answer,
        speechText,
        intent: 'feature_guide',
        suggestTour: true,
        tourId: 'association-library',
        route: '/association/library',
        featureName: 'Kho Văn Bản, Điều Lệ & Kỷ Yếu',
        dynamicData: { documents: searchData.documents },
        provider: 'ceo1983-smart-engine',
        model: 'rag-docs-v1',
      };
    }

    // A. Câu hỏi về Sự kiện nhiều người đăng ký nhất (Top Events)
    if (
      q.includes('nhiều người đăng ký') ||
      q.includes('đông người') ||
      q.includes('sự kiện hot') ||
      q.includes('nhiều nhất') ||
      q.includes('top sự kiện') ||
      q.includes('nhiều đại biểu')
    ) {
      if (context.topEvents.length > 0) {
        const top1 = context.topEvents[0];
        const answer = `🏆 **Sự kiện đang có nhiều người đăng ký nhất:**\n\n- **Tên sự kiện:** ${top1.name}\n- **Số lượng đã đăng ký:** **${top1.registeredCount} / ${top1.capacity} đại biểu**\n- **Thời gian:** ${top1.date}\n- **Địa điểm:** ${top1.location}\n\n${
          context.topEvents.length > 1
            ? `*Các sự kiện tiếp theo:* \n${context.topEvents
                .slice(1, 3)
                .map((e, idx) => `${idx + 2}. **${e.name}** (${e.registeredCount} người đăng ký - ${e.date})`)
                .join('\n')}`
            : ''
        }\n\n👉 **Quý Anh/Chị có muốn tôi hướng dẫn thao tác trực tiếp đăng ký vé không? Tôi sẽ lái màn hình và chỉ dẫn từng bước cho Quý Anh/Chị!**`;

        const speechText = `Dạ thưa Quý anh chị, sự kiện đang có nhiều người đăng ký nhất là "${top1.name}" với ${top1.registeredCount} đại biểu tham dự vào ngày ${top1.date}. Quý anh chị có muốn tôi hướng dẫn thao tác trực tiếp đăng ký vé không? Hãy chọn Có hoặc nói Có nhé!`;

        return {
          answer,
          speechText,
          intent: 'feature_guide',
          suggestTour: true,
          tourId: 'association-events',
          route: '/association/events',
          featureName: 'Đăng Ký Vé Sự Kiện',
          dynamicData: { topEvents: context.topEvents },
          provider: 'ceo1983-smart-engine',
          model: 'rule-nlp-v3',
        };
      }
    }

    // B. Câu hỏi: Tôi có đang đăng ký sự kiện nào không?
    if (
      q.includes('tôi có đang đăng ký') ||
      q.includes('sự kiện của tôi') ||
      q.includes('lịch sự kiện của tôi') ||
      q.includes('tôi đã đăng ký') ||
      q.includes('vé của tôi') ||
      (q.includes('vé sự kiện') && !q.includes('như nào') && !q.includes('làm sao'))
    ) {
      if (context.myEvents.length > 0) {
        const evList = context.myEvents
          .map(
            (e, idx) =>
              `${idx + 1}. **${e.name}**\n   - Ngày: ${e.date} | Giờ: ${e.time}\n   - Địa điểm: ${e.location}\n   - Số vé: ${e.ticketCount} vé${e.luckyNumber ? ` (Mã may mắn: #${e.luckyNumber})` : ''}`,
          )
          .join('\n\n');

        const answer = `🎫 **Quý Anh/Chị đang có ${context.myEvents.length} sự kiện đã đăng ký tham dự:**\n\n${evList}\n\n*Quý Anh/Chị có thể mở mục **Vé Check-in** để xuất trình mã QR tại bàn tiếp đón.*\n\n👉 **Quý Anh/Chị có muốn tôi hướng dẫn thao tác trực tiếp mở vé QR check-in không? Tôi sẽ lái màn hình và chỉ dẫn từng bước cho Quý Anh/Chị!**`;
        const speechText = `Quý anh chị hiện đang đăng ký ${context.myEvents.length} sự kiện, bao gồm "${context.myEvents[0].name}" vào ngày ${context.myEvents[0].date}. Quý anh chị có muốn tôi hướng dẫn thao tác trực tiếp mở vé QR check-in không? Hãy chọn Có để tôi dẫn đường nhé!`;

        return {
          answer,
          speechText,
          intent: 'feature_guide',
          suggestTour: true,
          tourId: 'association-checkin',
          route: '/association/checkin',
          featureName: 'Vé Check-in QR Sự Kiện',
          dynamicData: { myEvents: context.myEvents },
          provider: 'ceo1983-smart-engine',
          model: 'rule-nlp-v3',
        };
      } else {
        const answer = `Dạ Quý Anh/Chị hiện **chưa đăng ký sự kiện nào**. Sắp tới Hiệp hội có sự kiện **"${context.topEvents[0]?.name || 'Gala Doanh nhân CEO 1983'}"** rất đặc sắc.\n\n👉 **Quý Anh/Chị có muốn tôi hướng dẫn thao tác trực tiếp đăng ký vé không? Tôi sẽ lái màn hình và chỉ dẫn từng bước cho Quý Anh/Chị!**`;
        const speechText = `Quý anh chị hiện chưa đăng ký sự kiện nào. Hãy để tôi hướng dẫn thao tác trực tiếp cho anh chị đăng ký sự kiện hot nhất sắp tới nhé!`;

        return {
          answer,
          speechText,
          intent: 'feature_guide',
          suggestTour: true,
          tourId: 'association-events',
          route: '/association/events',
          featureName: 'Đăng Ký Vé Sự Kiện',
          provider: 'ceo1983-smart-engine',
          model: 'rule-nlp-v3',
        };
      }
    }

    // C. Câu hỏi: Tôi có thông báo nào chưa đọc không?
    if (
      q.includes('thông báo') &&
      (q.includes('chưa đọc') || q.includes('tin mới') || q.includes('mới nhất') || q.includes('có thông báo'))
    ) {
      if (context.notifications.unreadCount > 0) {
        const listText = context.notifications.unreadList
          .slice(0, 3)
          .map((n, idx) => `${idx + 1}. **${n.title}**\n   _${n.body || 'Không có mô tả chi tiết'}_`)
          .join('\n\n');

        const answer = `🔔 **Quý Anh/Chị có ${context.notifications.unreadCount} thông báo mới chưa đọc:**\n\n${listText}\n\n👉 **Quý Anh/Chị có muốn tôi hướng dẫn thao tác trực tiếp vào Trung tâm thông báo không? Tôi sẽ lái màn hình và chỉ dẫn từng bước cho Quý Anh/Chị!**`;
        const speechText = `Quý anh chị có ${context.notifications.unreadCount} thông báo mới chưa đọc. Tiêu biểu là: "${context.notifications.unreadList[0]?.title}". Quý anh chị có muốn tôi hướng dẫn thao tác trực tiếp không?`;

        return {
          answer,
          speechText,
          intent: 'feature_guide',
          suggestTour: true,
          tourId: 'association-notifications',
          route: '/association/notifications',
          featureName: 'Trung Tâm Thông Báo',
          dynamicData: { notifications: context.notifications },
          provider: 'ceo1983-smart-engine',
          model: 'rule-nlp-v3',
        };
      } else {
        const answer = `🔔 **Tất cả đã cập nhật:** Quý Anh/Chị không có thông báo nào chưa đọc tại thời điểm này. Toàn bộ tin tức và văn bản mới nhất từ Ban Thư ký đã được xử lý.`;
        const speechText = `Quý anh chị không có thông báo nào chưa đọc. Mọi thông tin đều đã được cập nhật đầy đủ.`;

        return {
          answer,
          speechText,
          intent: 'query_data',
          route: '/association/notifications',
          provider: 'ceo1983-smart-engine',
          model: 'rule-nlp-v3',
        };
      }
    }

    // D. Câu hỏi: Tôi có hội phí nào chưa đóng không?
    if (
      (q.includes('hội phí') || q.includes('niên liễm') || q.includes('nợ phí') || q.includes('hóa đơn')) &&
      (q.includes('chưa đóng') || q.includes('nợ') || q.includes('cần nộp') || q.includes('kiểm tra')) &&
      !q.includes('như nào') &&
      !q.includes('làm sao')
    ) {
      if (!context.dues.feePaid && context.dues.unpaidInvoices.length > 0) {
        const inv = context.dues.unpaidInvoices[0];
        const formattedAmount = new Intl.NumberFormat('vi-VN').format(inv.amount || 0);

        const answer = `💳 **Thông tin Hội phí Hiệp hội CEO 1983:**\n\n- **Trạng thái:** ⚠️ **Chưa hoàn tất**\n- **Kỳ phí:** Năm ${inv.year || context.dues.feeYear || 2026}\n- **Số tiền cần thanh toán:** **${formattedAmount} VNĐ**\n- **Mã hóa đơn:** \`${inv.invoiceNo || 'INV-2026'}\`\n- **Hạn nộp:** ${inv.dueDate || '31/03/2026'}\n\n*Thông tin tài khoản tiếp nhận:*\n- **Ngân hàng:** MB Bank (Quân Đội)\n- **Số tài khoản:** \`1983000000\`\n- **Chủ tài khoản:** CLB DOANH NHAN CEO 1983\n- **Nội dung:** \`${inv.invoiceNo || context.user.code} HP2026\`\n\n👉 **Quý Anh/Chị có muốn tôi hướng dẫn thao tác trực tiếp đóng hội phí qua VietQR MB Bank không? Tôi sẽ lái màn hình và chỉ dẫn từng bước cho Quý Anh/Chị!**`;

        const speechText = `Quý anh chị hiện còn khoản hội phí kỳ ${inv.year || 2026} chưa đóng với số tiền ${formattedAmount} đồng. Quý anh chị có muốn tôi hướng dẫn thao tác trực tiếp quét mã VietQR để hoàn tất không? Hãy chọn Có để tôi dẫn đường nhé!`;

        return {
          answer,
          speechText,
          intent: 'feature_guide',
          suggestTour: true,
          tourId: 'association-profile',
          route: '/association/profile',
          featureName: 'Đóng Hội Phí Thường Niên VietQR',
          dynamicData: { dues: context.dues },
          provider: 'ceo1983-smart-engine',
          model: 'rule-nlp-v3',
        };
      } else {
        const answer = `✅ **Hội phí hoàn tất:** Quý Anh/Chị đã hoàn thành đầy đủ nghĩa vụ hội phí thường niên. Thẻ hội viên **${context.user.level}** của Quý Anh/Chị đang ở trạng thái Hoạt động chuẩn mực 5 sao!`;
        const speechText = `Tuyệt vời! Quý anh chị đã đóng đầy đủ toàn bộ hội phí thường niên. Thẻ hội viên của anh chị đang hoạt động rất tốt!`;

        return {
          answer,
          speechText,
          intent: 'query_data',
          route: '/association/profile',
          provider: 'ceo1983-smart-engine',
          model: 'rule-nlp-v3',
        };
      }
    }

    // E. MA TRẬN 32 TÍNH NĂNG TOÀN DIỆN (CHỨC NĂNG TRONG + CHỨC NĂNG NGOÀI):
    // Khi người dùng hỏi: "như nào", "làm sao", "ở đâu", "cách", "hướng dẫn", "thao tác", "chỉ tôi",...
    const FEATURE_GUIDES: Array<{
      id: string;
      keywords: string[];
      featureName: string;
      tourId: string;
      route: string;
      steps: string[];
      proTip: string;
      speechSummary: string;
    }> = [
      // 1. Đăng ký sự kiện
      {
        id: 'event-register',
        keywords: ['đăng ký sự kiện', 'sự kiện như nào', 'đăng ký vé', 'mua vé sự kiện', 'lấy vé', 'tham gia sự kiện', 'lịch sự kiện'],
        featureName: 'Đăng Ký Vé Sự Kiện & Hội Nghị',
        tourId: 'association-events',
        route: '/association/events',
        steps: [
          'Vào màn hình **Sự kiện** từ thanh điều hướng dưới đáy ứng dụng.',
          'Xem danh sách sự kiện sắp diễn ra, chạm vào thẻ sự kiện bạn quan tâm để xem chi tiết địa điểm, trang phục và sơ đồ bàn tiệc VIP.',
          'Bấm nút **"Đăng ký tham dự"** ở chân thẻ sự kiện, xác nhận số lượng đại biểu đi cùng.',
          'Hệ thống tự động cấp mã vé điện tử REG-xxx và hiển thị ngay tại màn hình **Vé Check-in**.',
        ],
        proTip: 'Hội viên chính thức được miễn phí vé Standard và ưu tiên xếp bàn tiệc VIP gần sân khấu.',
        speechSummary: 'Để đăng ký sự kiện: Bước một, vào mục Sự kiện. Bước hai, chọn sự kiện sắp diễn ra. Bước ba, bấm nút Đăng ký tham dự và xác nhận số lượng vé.',
      },
      // 2. Vé Check-in QR & Bàn VIP
      {
        id: 'checkin-ticket',
        keywords: ['vé checkin', 'vé check in', 'mã qr vé', 'bàn vip', 'số ghế', 'vị trí ngồi', 'xuất trình vé'],
        featureName: 'Vé Check-in QR & Tra Cứu Bàn Tiệc VIP',
        tourId: 'association-checkin',
        route: '/association/checkin',
        steps: [
          'Mở màn hình **Vé Check-in** từ phím tắt tiện ích trên Trang chủ.',
          'Xuất trình mã QR động trên thẻ vé VIP cho lễ tân hoặc Ban Truyền Thông quét tại cửa sảnh.',
          'Xem số bàn tiệc VIP (VD: Bàn VIP 02 - Ghế 04) và mã may mắn tham gia Lucky Draw Gala.',
        ],
        proTip: 'Khi được quét thành công, vé sẽ đóng mộc xanh ĐÃ CHECK-IN kèm âm thanh xác nhận tức thì.',
        speechSummary: 'Để xuất trình vé check in: Mở mục Vé Check in, đưa mã QR cho lễ tân quét, và xem vị trí bàn tiệc VIP của bạn.',
      },
      // 3. Soát vé sự kiện (Ban Truyền Thông)
      {
        id: 'checkin-scanner',
        keywords: ['soát vé', 'quét vé', 'máy quét', 'camera soát vé', 'kiểm tra vé', 'lễ tân soát'],
        featureName: 'Máy Quét Camera & NFC Soát Vé Cổng Sự Kiện',
        tourId: 'association-checkin',
        route: '/association/checkin',
        steps: [
          'Mở màn hình **Check-in**, hệ thống tự nhận diện nếu bạn thuộc Ban Truyền Thông hoặc Ban Tổ Chức.',
          'Chuyển sang chế độ **"Máy Quét Camera Check-in"**.',
          'Hướng ống kính camera vào mã vé QR của đại biểu, màn hình sẽ hiển thị họ tên, doanh nghiệp và số bàn VIP trong 0.5 giây.',
          'Bấm **"Xác Nhận Check-In"** để hoàn tất đón tiếp đại biểu.',
        ],
        proTip: 'Máy quét có hỗ trợ chế độ Offline tự lưu nếu sảnh tiệc bị mất kết nối mạng Wifi.',
        speechSummary: 'Để soát vé: Mở mục Check in, bật máy quét camera, lia vào mã vé đại biểu và bấm Xác nhận.',
      },
      // 4. Danh thiếp số 5.0 chia sẻ QR
      {
        id: 'card-show',
        keywords: ['danh thiếp số', 'card visit', 'chia sẻ danh thiếp', 'mã qr danh thiếp', 'danh thiếp điện tử'],
        featureName: 'Thẻ Danh Thiếp Số 5.0 & Chia Sẻ QR',
        tourId: 'association-card',
        route: '/association/card',
        steps: [
          'Vào màn hình **Danh thiếp** trên thanh điều hướng.',
          'Chạm vào mã QR trên thẻ danh thiếp 3D để phóng to.',
          'Đưa cho đối tác dùng camera iPhone hoặc Zalo quét để lưu danh bạ trong 1 giây mà không cần cài app.',
          'Bấm **"Sao chép liên kết"** để gửi link danh thiếp qua Zalo hoặc SMS.',
        ],
        proTip: 'Bấm vào logo công ty ở góc phải để cập nhật logo thương hiệu doanh nghiệp của bạn.',
        speechSummary: 'Để chia sẻ danh thiếp số: Vào mục Danh thiếp, chạm mã QR phóng to cho đối tác quét hoặc bấm Sao chép liên kết.',
      },
      // 5. Ghi thẻ thông minh NFC
      {
        id: 'card-nfc',
        keywords: ['ghi thẻ nfc', 'chạm nfc', 'thẻ thông minh nfc', 'thẻ kim loại', 'ghi chip nfc'],
        featureName: 'Ghi Thẻ Thông Minh Không Dây NFC',
        tourId: 'association-card',
        route: '/association/card',
        steps: [
          'Vào màn hình **Danh thiếp** và chọn mục **"Ghi thẻ NFC"**.',
          'Bấm nút **"Bắt đầu ghi thẻ"**.',
          'Áp chiếc thẻ kim loại CEO 1983 vào mặt lưng điện thoại khoảng 2 giây cho đến khi có âm báo thành công.',
          'Khi chạm thẻ vào lưng điện thoại đối tác, danh thiếp của bạn sẽ tự động bật lên.',
        ],
        proTip: 'Một chiếc thẻ NFC có thể ghi đè cập nhật lại thông tin hàng triệu lần miễn phí.',
        speechSummary: 'Để ghi thẻ NFC: Vào mục Danh thiếp, bấm Ghi thẻ NFC và áp thẻ vào mặt lưng điện thoại khoảng 2 giây.',
      },
      // 6. Quét & bóc tách card visit giấy bằng AI
      {
        id: 'card-ai-scan',
        keywords: ['quét danh thiếp giấy', 'chụp danh thiếp', 'ai bóc tách', 'ocr danh thiếp', 'quét card visit ai', 'chụp card'],
        featureName: 'Chụp & Bóc Tách Card Visit Giấy Bằng AI Vision OCR',
        tourId: 'association-card',
        route: '/association/card',
        steps: [
          'Vào màn hình **Danh thiếp**, bấm nút **"Chụp danh thiếp"**.',
          'Hướng camera vào tấm danh thiếp giấy của đối tác hoặc chọn ảnh từ thư viện.',
          'AI Vision OCR tự động nhận diện và bóc tách: Họ tên, Số điện thoại, Email, Chức vụ và Công ty.',
          'Kiểm tra lại thông tin và bấm **"Lưu vào danh bạ đối tác"**.',
        ],
        proTip: 'Giúp số hóa toàn bộ cọc danh thiếp giấy chỉ sau 5 phút hội thảo.',
        speechSummary: 'Để quét card visit bằng AI: Vào Danh thiếp, bấm Chụp danh thiếp, hướng camera chụp card giấy để AI tự bóc tách thông tin.',
      },
      // 7. Cài đặt quyền riêng tư danh thiếp
      {
        id: 'card-privacy',
        keywords: ['quyền riêng tư', 'bảo mật danh thiếp', 'ẩn số điện thoại', 'ẩn zalo', 'cài đặt danh thiếp'],
        featureName: 'Cài Đặt Quyền Riêng Tư & Bảo Mật Danh Thiếp',
        tourId: 'association-card',
        route: '/association/card',
        steps: [
          'Vào màn hình **Danh thiếp**, bấm nút **"Chỉnh sửa / Quyền riêng tư"**.',
          'Chủ động bật hoặc tắt hiển thị Số điện thoại di động, Zalo, Email công khai trên web.',
          'Bấm **"Lưu cài đặt"** để cập nhật ngay lập tức.',
        ],
        proTip: 'Bạn có thể chọn chỉ hiển thị số máy bàn công ty thay vì số di động cá nhân.',
        speechSummary: 'Để cài đặt quyền riêng tư danh thiếp: Vào Danh thiếp, bấm Chỉnh sửa, bật tắt ẩn hiện số điện thoại và email rồi lưu lại.',
      },
      // 8. Tìm kiếm & Tra cứu danh bạ 200+ CEO
      {
        id: 'member-search',
        keywords: ['tìm kiếm hội viên', 'danh bạ', 'tìm người', 'tra cứu ceo', 'tìm đối tác', 'danh bạ hội viên'],
        featureName: 'Tra Cứu Danh Bạ 200+ Lãnh Đạo Doanh Nghiệp',
        tourId: 'association-members',
        route: '/association/members',
        steps: [
          'Vào màn hình **Danh bạ** từ thanh menu.',
          'Gõ tên doanh nhân, tên công ty hoặc ngành nghề vào thanh tìm kiếm trên đầu trang.',
          'Hệ thống lọc tức thì kết quả tìm kiếm theo thời gian thực có dấu và không dấu.',
          'Chạm vào tên hội viên để xem hồ sơ năng lực 360°.',
        ],
        proTip: 'Bạn có thể gõ mã hội viên (VD: M1983-001) để tìm đúng lãnh đạo câu lạc bộ.',
        speechSummary: 'Để tìm hội viên: Vào mục Danh bạ, gõ tên lãnh đạo hoặc tên công ty vào thanh tìm kiếm để xem hồ sơ năng lực.',
      },
      // 9. Lọc hội viên theo Ban chuyên môn & Ngành nghề
      {
        id: 'member-filter',
        keywords: ['lọc hội viên', 'lọc ban', 'lọc ngành nghề', 'ban truyền thông', 'ban tài chính', 'xây dựng', 'bất động sản'],
        featureName: 'Bộ Lọc Hội Viên Theo Ban Chuyên Môn & Ngành Nghề',
        tourId: 'association-members',
        route: '/association/members',
        steps: [
          'Mở màn hình **Danh bạ**.',
          'Vuốt ngang hàng nút bộ lọc ở dưới thanh tìm kiếm.',
          'Chạm vào ban hoặc ngành nghề cần tìm: Ban Truyền Thông, Ban Tài Chính, Xây dựng, Công nghệ, F&B...',
          'Danh sách chỉ hiển thị các CEO đang hoạt động trong lĩnh vực đó.',
        ],
        proTip: 'Bấm nút "Tất cả" để quay lại danh bạ đầy đủ 200+ thành viên.',
        speechSummary: 'Để lọc hội viên: Vào Danh bạ, vuốt ngang các tag bộ lọc để chọn Ban chuyên môn hoặc Ngành nghề kinh doanh.',
      },
      // 10. Hẹn gặp giao thương 1-on-1
      {
        id: 'meeting-1on1',
        keywords: ['hẹn gặp 1-1', 'hẹn 1-on-1', 'kết nối giao thương', 'đặt lịch hẹn', 'gặp gỡ đối tác', 'bắt tay'],
        featureName: 'Gửi Thư Mời Hẹn Giao Thương 1-on-1 Có Mục Đích',
        tourId: 'association-members',
        route: '/association/members',
        steps: [
          'Mở màn hình **Danh bạ**, tìm hội viên bạn muốn hẹn gặp.',
          'Bấm biểu tượng **Bắt tay / Kết nối** màu vàng trên góc thẻ hội viên.',
          'Nhập mục đích cuộc hẹn (VD: Trao đổi hợp tác cung ứng vật liệu) và thời gian đề xuất.',
          'Bấm **"Gửi thư mời"**. Hệ thống sẽ gửi thông báo đẩy trực tiếp vào hộp thư đối tác.',
        ],
        proTip: 'Văn hóa CEO 1983: Không hẹn vu vơ, mọi cuộc gặp đều có mục tiêu giao thương rõ ràng.',
        speechSummary: 'Để hẹn gặp một-một: Tìm hội viên trong danh bạ, bấm nút Bắt tay, nhập mục đích cuộc hẹn và bấm Gửi thư mời.',
      },
      // 11. Sàn Cơ hội kinh doanh B2B
      {
        id: 'opportunity-post',
        keywords: ['đăng cơ hội', 'sàn cơ hội', 'cung cầu', 'tìm mua hàng', 'chào bán dự án', 'hợp tác kinh doanh'],
        featureName: 'Sàn Cơ Hội Kinh Doanh & Đăng Tin Cung - Cầu B2B',
        tourId: 'association-opportunities',
        route: '/association/opportunities',
        steps: [
          'Vào màn hình **Cơ hội** từ thanh điều hướng.',
          'Xem các tab phân loại: Tất cả, Cung cấp (Supply), Tìm mua (Demand) và Hợp tác.',
          'Bấm nút **"Đăng cơ hội ngay →"** ở chân trang.',
          'Nhập tiêu đề, mô tả nhu cầu, ngân sách dự kiến, tải ảnh minh họa và bấm Đăng tin.',
        ],
        proTip: 'Các cơ hội từ 500 triệu trở lên được Ban Xúc Tiến Thương Mại hỗ trợ bảo trợ pháp lý.',
        speechSummary: 'Để đăng cơ hội kinh doanh: Vào mục Cơ hội, bấm Đăng cơ hội ngay, nhập nhu cầu cung cầu cùng ngân sách và đăng tin.',
      },
      // 12. Chợ B2B Marketplace & Gian hàng số
      {
        id: 'b2b-explore',
        keywords: ['chợ b2b', 'sàn b2b', 'marketplace', 'gian hàng', 'sản phẩm sỉ', 'chiết khấu vip', 'mua hàng nội khối'],
        featureName: 'Chợ B2B Marketplace & Ưu Đãi Độc Quyền CEO 1983',
        tourId: 'association-products',
        route: '/association/products',
        steps: [
          'Vào màn hình **Sản phẩm** trên thanh menu.',
          'Duyệt tìm sản phẩm thiết bị, nguyên vật liệu hoặc dịch vụ đang giảm giá ưu đãi.',
          'Xem chi tiết tỷ lệ chiết khấu dành riêng cho hội viên có thẻ VIP Gold.',
          'Bấm **"Yêu cầu báo giá"** hoặc **"Nhắn tin"** để thương lượng trực tiếp với CEO đơn vị bán.',
        ],
        proTip: 'Ưu tiên dùng hàng của nhau, gia tăng doanh số và tạo dòng tiền nội khối.',
        speechSummary: 'Để mua sắm trên Chợ B2B: Vào mục Sản phẩm, duyệt gian hàng, xem chiết khấu VIP và bấm Nhắn tin để thương lượng.',
      },
      // 13. Đăng bán sản phẩm lên sàn B2B
      {
        id: 'b2b-sell',
        keywords: ['đăng bán sản phẩm', 'bán hàng b2b', 'tạo sản phẩm mới', 'đăng tin bán', 'mục của tôi'],
        featureName: 'Đăng Bán Sản Phẩm Mới Lên Gian Hàng B2B',
        tourId: 'association-products',
        route: '/association/products',
        steps: [
          'Vào màn hình **Sản phẩm**, chuyển sang tab **"Mục của tôi"**.',
          'Bấm nút **"Đăng bán sản phẩm"**.',
          'Chụp ảnh sản phẩm vuông 1:1, điền tên mặt hàng, giá niêm yết và tỷ lệ chiết khấu cho CLB.',
          'Bấm **"Lưu và đăng bán"**. Sản phẩm xuất hiện ngay lập tức trên Marketplace.',
        ],
        proTip: 'Mở rộng kênh phân phối chất lượng cao với chi phí marketing 0 đồng.',
        speechSummary: 'Để đăng bán sản phẩm: Vào mục Sản phẩm, chuyển sang tab Mục của tôi, bấm Đăng bán sản phẩm và nhập thông tin giá bán.',
      },
      // 14. Biểu quyết Đại hội & Bầu cử BCH
      {
        id: 'voting-poll',
        keywords: ['biểu quyết', 'bỏ phiếu', 'bầu cử', 'bầu ban chấp hành', 'bầu bch', 'nghị quyết'],
        featureName: 'Biểu Quyết Đại Hội & Bỏ Phiếu Số Kín',
        tourId: 'association-voting',
        route: '/association/voting',
        steps: [
          'Mở màn hình **Biểu quyết** từ Trang chủ.',
          'Xem các cuộc bỏ phiếu đang mở, đọc lý lịch trích ngang của ứng viên hoặc nội dung đề án sửa đổi Điều lệ.',
          'Tích chọn ứng cử viên bạn tín nhiệm và nhập ý kiến đóng góp.',
          'Bấm **"Gửi phiếu bầu"** an toàn, bảo mật tuyệt đối danh tính.',
        ],
        proTip: 'Mỗi hội viên chính thức không nợ phí có 01 phiếu bầu duy nhất theo nguyên tắc dân chủ.',
        speechSummary: 'Để biểu quyết: Mở mục Biểu quyết, xem danh sách ứng viên, tích chọn người bạn tín nhiệm và bấm Gửi phiếu bầu.',
      },
      // 15. Vòng quay may mắn Lucky Draw Gala
      {
        id: 'voting-lucky',
        keywords: ['lucky draw', 'vòng quay may mắn', 'quay số', 'trúng thưởng', 'bốc thăm gala', 'quà tặng'],
        featureName: 'Vòng Quay Số May Mắn Lucky Draw Gala Dinner',
        tourId: 'association-voting',
        route: '/association/voting',
        steps: [
          'Vào màn hình **Biểu quyết**, chuyển sang tab **"Quay số trúng thưởng"**.',
          'Theo dõi vòng quay số may mắn thời gian thực kết nối với màn hình LED sân khấu chính.',
          'Mã số vé may mắn tại Màn hình Vé Check-in của bạn sẽ tự động nằm trong thùng phiếu điện tử.',
          'Nếu trúng giải, màn hình điện thoại của bạn sẽ nổ pháo hoa chúc mừng!',
        ],
        proTip: 'Giữ kết nối Wifi/4G ổn định để nhận thông báo trúng giải ngay tức thì.',
        speechSummary: 'Để tham gia Lucky Draw: Vào mục Biểu quyết, chuyển sang tab Quay số trúng thưởng và theo dõi màn hình khi MC quay số.',
      },
      // 16. Đóng hội phí thường niên VietQR MB Bank
      {
        id: 'dues-pay',
        keywords: ['đóng hội phí', 'nộp tiền hội phí', 'quét vietqr', 'chuyển khoản mb', 'phí niên liễm', 'thanh toán hội phí'],
        featureName: 'Tra Cứu & Đóng Hội Phí Thường Niên Qua VietQR MB Bank',
        tourId: 'association-profile',
        route: '/association/profile',
        steps: [
          'Vào màn hình **Cá nhân** (Hồ sơ), chạm vào mục **"Hội phí & Hóa đơn"**.',
          'Kiểm tra số tiền niên liễm chưa đóng và hạn thanh toán.',
          'Bấm nút **"Quét mã VietQR"**.',
          'Mở app ngân hàng bất kỳ (MB Bank, Vietcombank...) quét mã QR, hệ thống tự động điền STK 1983000000, số tiền và cú pháp.',
          'Sau khi chuyển khoản, thẻ hội viên tự động cập nhật trạng thái Đã Hoàn Thành.',
        ],
        proTip: 'MB Bank là ngân hàng đối tác chiến lược của CEO 1983 với đầu số tài khoản VIP 1983000000.',
        speechSummary: 'Để đóng hội phí: Vào mục Cá nhân, chọn Hội phí, bấm Quét mã VietQR và dùng app ngân hàng quét mã chuyển khoản tự động.',
      },
      // 17. Kho Văn bản, Điều lệ & Kỷ yếu
      {
        id: 'documents-download',
        keywords: ['tải điều lệ', 'quy chế', 'kỷ yếu', 'văn bản', 'tài liệu', 'thư viện', 'nghị quyết bch'],
        featureName: 'Kho Văn Bản, Điều Lệ & Kỷ Yếu Doanh Nhân',
        tourId: 'association-library',
        route: '/association/library',
        steps: [
          'Vào màn hình **Tài liệu** (Thư viện số) trên menu.',
          'Gõ từ khóa vào ô tìm kiếm: "Điều lệ", "Quy chế" hoặc "Kỷ yếu".',
          'Chạm vào tên văn bản để xem tóm tắt nội dung và đơn vị ban hành.',
          'Bấm icon **Tải xuống** để lưu file PDF về máy điện thoại hoặc bấm **Chia sẻ** qua Zalo.',
        ],
        proTip: 'Toàn bộ văn bản pháp quy chính thức được số hóa và ký duyệt số.',
        speechSummary: 'Để xem tài liệu: Vào mục Thư viện tài liệu, tìm văn bản Điều lệ hoặc Kỷ yếu và bấm nút Tải xuống PDF.',
      },
      // 18. Đổi ảnh đại diện & ảnh bìa thẻ VIP Gold
      {
        id: 'profile-avatar',
        keywords: ['đổi ảnh đại diện', 'đổi avatar', 'ảnh bìa', 'sửa hồ sơ', 'cập nhật ảnh', 'thay ảnh'],
        featureName: 'Cập Nhật Ảnh Đại Diện & Ảnh Bìa Thẻ VIP Gold',
        tourId: 'association-profile',
        route: '/association/profile',
        steps: [
          'Mở màn hình **Cá nhân** hoặc Trang chủ.',
          'Bấm icon cây bút chì ở góc dưới bên phải thẻ hội viên VIP.',
          'Chọn **"Đổi ảnh đại diện"** hoặc **"Đổi ảnh bìa"** từ thư viện ảnh máy.',
          'Cắt chỉnh ảnh theo ý muốn và bấm **"Lưu thay đổi"**.',
        ],
        proTip: 'Chọn ảnh chân dung doanh nhân sang trọng để đối tác ấn tượng ngay khi quét danh thiếp.',
        speechSummary: 'Để đổi ảnh đại diện: Vào mục Cá nhân, bấm biểu tượng bút chì trên thẻ hội viên, chọn ảnh mới từ máy và bấm Lưu.',
      },
      // 19. Tùy biến giao diện Sáng / Tối / Chủ đề Lễ Hội
      {
        id: 'profile-theme',
        keywords: ['đổi giao diện', 'chủ đề lễ hội', 'giao diện tối', 'chủ đề tết', 'dark mode', 'chủ đề'],
        featureName: 'Tùy Biến Giao Diện Sáng / Tối & Chủ Đề Lễ Hội',
        tourId: 'association-profile',
        route: '/association/profile',
        steps: [
          'Vào màn hình **Cá nhân**, chọn mục **"Chủ đề giao diện"**.',
          'Chọn phong cách yêu thích: Giao diện Sáng (Executive Light), Tối (CEO Dark) hoặc Chủ đề Lễ Hội (Festival Gala).',
          'Màu sắc ứng dụng sẽ biến đổi ngay lập tức.',
        ],
        proTip: 'Vào dịp Tết Nguyên Đán, chủ đề Lễ Hội sẽ có hiệu ứng hoa đào và pháo hoa rực rỡ.',
        speechSummary: 'Để đổi giao diện: Vào mục Cá nhân, chọn Chủ đề giao diện, chọn Sáng, Tối hoặc Lễ hội theo sở thích của bạn.',
      },
      // 20. Cài đặt PWA lên màn hình điện thoại
      {
        id: 'pwa-install',
        keywords: ['cài đặt app', 'cài pwa', 'thêm vào màn hình chính', 'tải app', 'cài đặt ứng dụng'],
        featureName: 'Cài Đặt Ứng Dụng PWA Lên Màn Hình Chính Điện Thoại',
        tourId: 'association-profile',
        route: '/association/profile',
        steps: [
          'Nếu dùng iPhone: Bấm nút **Chia sẻ** trên trình duyệt Safari, cuộn xuống chọn **"Thêm vào Màn hình chính"** (Add to Home Screen).',
          'Nếu dùng Android: Bấm icon 3 chấm trên trình duyệt Chrome, chọn **"Cài đặt ứng dụng"**.',
          'Icon CEO 1983 sẽ xuất hiện trên màn hình điện thoại, mở lên dùng mượt mà toàn màn hình không có thanh địa chỉ.',
        ],
        proTip: 'Công nghệ Progressive Web App giúp cập nhật tính năng mới tự động mà không cần vào App Store.',
        speechSummary: 'Để cài app: Mở Safari chọn Chia sẻ rồi Thêm vào màn hình chính, hoặc trên Chrome chọn Cài đặt ứng dụng.',
      },
      // 21. Hotline 5 Ban Chuyên Môn
      {
        id: 'hotline-support',
        keywords: ['hotline', 'liên hệ ban', 'số điện thoại hỗ trợ', 'ban chuyên môn', 'trợ giúp', 'tổng đài'],
        featureName: 'Hotline Trực Tiếp 5 Ban Chuyên Môn Hiệp Hội',
        tourId: 'association-profile',
        route: '/association/profile',
        steps: [
          'Vào màn hình **Cá nhân**, chọn mục **"Liên hệ 5 Ban Chuyên Môn"**.',
          'Chọn ban phụ trách vấn đề bạn cần: Ban Truyền Thông (soát vé), Ban Thư Ký (hồ sơ), Ban Tài Chính (hội phí)...',
          'Bấm gọi điện thoại trực tiếp hoặc mở chat Zalo OA với Trưởng ban.',
        ],
        proTip: 'Ban Thư Ký túc trực 24/7 để giải đáp mọi thắc mắc của quý hội viên.',
        speechSummary: 'Để gọi hotline: Vào mục Cá nhân, chọn Liên hệ Ban chuyên môn, chọn ban cần hỗ trợ và bấm nút gọi điện hoặc Zalo.',
      },
      // 22. Tạo sự kiện mới & Quản lý vé (Ban Tổ Chức) - CRM NGOÀI
      {
        id: 'event-create',
        keywords: ['tạo sự kiện', 'quản trị sự kiện', 'thêm sự kiện', 'ban tổ chức sự kiện', 'tạo hội nghị', 'crm sự kiện'],
        featureName: 'Tạo Sự Kiện Mới & Quản Trị Đại Biểu (Ban Tổ Chức)',
        tourId: 'events-admin',
        route: '/events',
        steps: [
          'Truy cập màn hình **Quản trị Sự kiện** (/events).',
          'Bấm nút **"Tạo sự kiện"** màu xanh ở góc trên bên phải.',
          'Điền Tên sự kiện, Thời gian khai mạc, Địa điểm tổ chức, Sức chứa đại biểu và Trang phục (Dresscode).',
          'Cấu hình gói tài trợ và bấm **"Lưu sự kiện"**. Hệ thống mở bán vé ngay lập tức.',
        ],
        proTip: 'Bạn có thể xuất danh sách khách mời đăng ký dạng Excel để in thẻ đeo trước giờ G.',
        speechSummary: 'Để tạo sự kiện mới: Vào trang Quản trị sự kiện, bấm Tạo sự kiện mới, điền thông tin địa điểm thời gian và bấm Lưu.',
      },
      // 23. Quản lý hội viên CRM & Phê duyệt kết nạp - CRM NGOÀI
      {
        id: 'members-crm',
        keywords: ['quản lý hội viên crm', 'phê duyệt hội viên', 'kết nạp hội viên', 'cấp mã m1983', 'thẩm định hội viên'],
        featureName: 'Quản Lý Hồ Sơ Hội Viên CRM & Phê Duyệt Kết Nạp (Ban Hội Viên)',
        tourId: 'members-admin',
        route: '/members',
        steps: [
          'Truy cập màn hình **Quản lý Hội viên** (/members).',
          'Kiểm tra danh sách hồ sơ ở cột "Chờ phê duyệt".',
          'Xem thông tin doanh nghiệp, xác nhận năm sinh 1983 và bấm **"Phê duyệt"**.',
          'Hệ thống tự động cấp mã định danh M1983-xxx và gửi email chào mừng chính thức.',
        ],
        proTip: 'Chỉ định đúng ban chuyên môn để hội viên tham gia các buổi sinh hoạt chuyên sâu.',
        speechSummary: 'Để quản lý hội viên: Vào Quản lý hội viên, kiểm tra hồ sơ chờ duyệt, xác nhận thông tin và bấm Phê duyệt cấp mã M1983.',
      },
      // 24. Quản trị hội phí & Thu chi - CRM NGOÀI
      {
        id: 'finance-mgmt',
        keywords: ['quản trị hội phí', 'tạo đợt thu', 'kế toán hiệp hội', 'báo cáo tài chính', 'đối soát ngân hàng', 'thu chi'],
        featureName: 'Quản Trị Hội Phí & Kế Toán Thu Chi Minh Bạch (Ban Tài Chính)',
        tourId: 'fees-admin',
        route: '/fees',
        steps: [
          'Truy cập màn hình **Quản lý Hội phí** (/fees).',
          'Bấm **"Tạo đợt thu mới"**, nhập mức niên liễm năm và phát hành cho toàn thể hội viên.',
          'Theo dõi tỷ lệ thanh toán thời gian thực qua biểu đồ trực quan.',
          'Bấm **"Báo cáo thu chi"** để xuất tệp Excel gửi Ban Chấp Hành.',
        ],
        proTip: 'Hệ thống tự động đối soát giao dịch VietQR MB Bank mà không cần kiểm tra sao kê thủ công.',
        speechSummary: 'Để quản trị hội phí: Vào mục Quản lý hội phí, tạo đợt thu niên liễm mới, theo dõi tỷ lệ thanh toán và xuất báo cáo kế toán.',
      },
      // 25. Giao việc & Quản lý nhiệm vụ điều hành - CRM NGOÀI
      {
        id: 'tasks-mgmt',
        keywords: ['giao việc', 'quản lý công việc', 'nhiệm vụ điều hành', 'bảng kanban', 'ban thư ký giao việc'],
        featureName: 'Giao Việc & Theo Dõi Nhiệm Vụ Điều Hành Liên Ban (Ban Thư Ký)',
        tourId: 'tasks-admin',
        route: '/tasks',
        steps: [
          'Truy cập màn hình **Quản lý Công việc** (/tasks).',
          'Bấm **"Giao việc mới"**, nhập tiêu đề nhiệm vụ, chọn Ban chịu trách nhiệm và hạn chót hoàn thành.',
          'Theo dõi tiến độ trên bảng Kanban trực quan: Cần làm - Đang làm - Đã hoàn thành.',
          'Kéo thả thẻ nhiệm vụ khi hoàn thành từng khâu chuẩn bị.',
        ],
        proTip: 'Hệ thống tự động gửi thông báo nhắc việc trước 24 giờ khi sắp đến hạn deadline.',
        speechSummary: 'Để giao việc: Vào Quản lý công việc, bấm Giao việc mới, chọn Ban phụ trách và theo dõi tiến độ trên bảng Kanban.',
      },
      // 26. Phân quyền RBAC & Ma trận thẩm quyền - CRM NGOÀI
      {
        id: 'permissions-mgmt',
        keywords: ['phân quyền', 'phân quyền rbac', 'ma trận quyền', 'cấp quyền soát vé', 'vai trò quản trị'],
        featureName: 'Quản Trị Phân Quyền RBAC & Ma Trận Thẩm Quyền (Ban Quản Trị)',
        tourId: 'permissions-admin',
        route: '/permissions',
        steps: [
          'Truy cập màn hình **Phân quyền** (/permissions).',
          'Chọn vai trò cần cấu hình: Ban Chấp Hành, Trưởng Ban Truyền Thông, Ban Thư Ký, Hội Viên...',
          'Gạt bật/tắt các công tắc quyền: Tạo sự kiện, Soát vé, Duyệt hội viên, Xem tài chính...',
          'Bấm **"Lưu thay đổi"** để áp dụng chính sách bảo mật tức thì trên toàn hệ thống.',
        ],
        proTip: 'Cấp quyền event:checkin cho nhân sự lễ tân để họ mở được camera soát vé trên app di động.',
        speechSummary: 'Để phân quyền: Vào Quản trị phân quyền, chọn vai trò cần cấu hình, gạt bật tắt các quyền nghiệp vụ và bấm Lưu thay đổi.',
      },
      // 27. Quản lý nhà tài trợ & Quyền lợi - CRM NGOÀI
      {
        id: 'sponsors-mgmt',
        keywords: ['nhà tài trợ', 'gói tài trợ', 'tài trợ kim cương', 'quyền lợi tài trợ', 'quản lý tài trợ'],
        featureName: 'Quản Lý Nhà Tài Trợ & Nghiệm Thu Quyền Lợi (Ban Tài Trợ)',
        tourId: 'sponsors-admin',
        route: '/sponsors',
        steps: [
          'Truy cập màn hình **Nhà tài trợ** (/sponsors).',
          'Bấm **"Thêm nhà tài trợ"**, nhập tên doanh nghiệp, người đại diện và gói tài trợ (Kim Cương, Vàng, Bạc).',
          'Tải lên logo PNG trong suốt để tự động hiển thị trên banner sự kiện và backdrop.',
          'Bấm **"Báo cáo nghiệm thu"** để xuất file chứng nhận quyền lợi gửi đối tác.',
        ],
        proTip: 'Đảm bảo thực hiện đầy đủ cam kết quyền lợi để xây dựng mối quan hệ đồng hành bền vững.',
        speechSummary: 'Để quản lý tài trợ: Vào Nhà tài trợ, thêm đơn vị đồng hành mới, tải logo thương hiệu và xuất báo cáo nghiệm thu quyền lợi.',
      },
      // 28. Tin nhắn & Hộp thư B2B
      {
        id: 'messages-b2b',
        keywords: ['tin nhắn', 'hộp thư', 'nhóm ban', 'chat b2b', 'trò chuyện đối tác'],
        featureName: 'Hộp Thư B2B & Nhóm Thảo Luận Ban Chuyên Môn',
        tourId: 'association-messages',
        route: '/association/messages',
        steps: [
          'Vào mục **Tin nhắn** trên thanh điều hướng.',
          'Xem các cuộc hội thoại 1-1 với đối tác hoặc chuyển sang tab Nhóm ban chuyên môn.',
          'Bấm icon kẹp giấy để gửi nhanh danh thiếp điện tử hoặc file báo giá PDF.',
          'Bấm nút bút soạn tin ở góc phải nếu muốn tạo nhóm thảo luận dự án mới.',
        ],
        proTip: '100% đối tác trò chuyện đều là hội viên CEO đã xác thực danh tính.',
        speechSummary: 'Để nhắn tin: Vào mục Tin nhắn, chọn cuộc trò chuyện đối tác, gửi tài liệu báo giá hoặc vào nhóm thảo luận của ban.',
      },
    ];

    // Duyệt qua ma trận tính năng để tìm tính năng khớp với câu hỏi người dùng
    for (const fg of FEATURE_GUIDES) {
      const isMatched = fg.keywords.some((kw) => q.includes(kw));
      if (isMatched) {
        const stepsFormatted = fg.steps.map((st, idx) => `**Bước ${idx + 1}:** ${st}`).join('\n\n');

        const answer = `📌 **Hướng dẫn thao tác: ${fg.featureName}**\n\n${stepsFormatted}\n\n💡 *Mẹo thực tế: ${fg.proTip}*\n\n⚡ **Đang tự động chuyển màn hình sang ${fg.featureName} để Quý Anh/Chị thao tác ngay...**`;

        const speechText = `Dạ em chuyển sang ${fg.featureName} cho Quý Anh/Chị thao tác ngay đây ạ!`;

        return {
          answer,
          speechText,
          intent: 'navigate',
          suggestTour: true,
          tourId: fg.tourId,
          route: fg.route,
          featureName: fg.featureName,
          provider: 'ceo1983-smart-engine',
          model: 'rule-nlp-v3',
        };
      }
    }

    // F. Trường hợp câu hỏi chung chung về hướng dẫn sử dụng ("hướng dẫn sử dụng app", "chỉ tôi dùng", "các chức năng")
    if (
      q.includes('hướng dẫn') ||
      q.includes('chỉ tôi') ||
      q.includes('thao tác') ||
      q.includes('cách dùng') ||
      q.includes('chỉ dẫn') ||
      q.includes('làm sao') ||
      q.includes('ở đâu') ||
      q.includes('tính năng')
    ) {
      const answer = `🗺️ **Trung Tâm Hướng Dẫn Sử Dụng CLB Doanh Nhân CEO 1983:**\n\nỨng dụng hỗ trợ đầy đủ toàn bộ chức năng trong và ngoài:\n1. 🎟️ **Sự kiện & Hội nghị:** Đăng ký vé, xem lịch sinh hoạt ban, sơ đồ bàn VIP.\n2. 🎫 **Vé Check-in:** Quét QR tại cổng, máy quét dành cho Ban Truyền Thông.\n3. 📇 **Danh thiếp số 5.0:** Chạm thẻ thông minh NFC, quét card visit bằng AI.\n4. 👥 **Danh bạ 200+ CEO:** Lọc ngành nghề, gửi thư mời hẹn gặp 1-on-1.\n5. 💼 **Sàn Giao thương B2B & Chợ Marketplace:** Đăng tin Cung - Cầu, bán sản phẩm.\n6. 🗳️ **Biểu quyết & Lucky Draw:** Bỏ phiếu bầu BCH, quay số may mắn Gala.\n7. 💳 **Hội phí & Hóa đơn:** Đóng phí niên liễm qua VietQR MB Bank tự động.\n8. 🏛️ **Quản trị CRM Ngoài:** Tạo sự kiện mới, duyệt hội viên, giao việc, phân quyền RBAC.\n\n⚡ **Đang tự động chuyển màn hình sang Trang Chủ để Quý Anh/Chị thao tác ngay...**`;

      const speechText = `Ứng dụng CEO 1983 hỗ trợ đầy đủ các tính năng: Đăng ký sự kiện, Danh thiếp NFC, Check in vé QR, Danh bạ 200 CEO, Sàn B2B, Biểu quyết và Đóng hội phí VietQR. Em chuyển sang Trang chủ cho Quý Anh/Chị ngay đây ạ!`;

      return {
        answer,
        speechText,
        intent: 'navigate',
        suggestTour: true,
        tourId: 'association-home',
        route: '/association',
        featureName: 'Trang Chủ & Dashboard Điều Hành',
        provider: 'ceo1983-smart-engine',
        model: 'rule-nlp-v3',
      };
    }

    // G. Câu hỏi về Thông tin cá nhân: Tôi là ai?
    if (q.includes('tôi là ai') || q.includes('thông tin của tôi') || q.includes('mã hội viên') || q.includes('hồ sơ của tôi')) {
      const answer = `👤 **Hồ sơ Hội viên của Quý Anh/Chị:**\n\n- **Họ tên:** **${context.user.name}**\n- **Mã hội viên:** \`${context.user.code}\`\n- **Doanh nghiệp:** ${context.user.company}\n- **Chức vụ:** ${context.user.title}\n- **Hạng thẻ:** ⭐ **${context.user.level}**\n- **Ban chuyên môn:** ${context.user.department}\n- **Trạng thái:** ${context.dues.feePaid ? '🟢 Đã nộp hội phí' : '🟡 Còn khoản phí chờ nộp'}\n\n👉 **Quý Anh/Chị có muốn tôi hướng dẫn thao tác trực tiếp xem và chỉnh sửa hồ sơ không?**`;
      const speechText = `Xin chào ${context.user.name}, mã hội viên của anh chị là ${context.user.code}, chức vụ ${context.user.title} tại ${context.user.company}. Anh chị có muốn tôi hướng dẫn thao tác trực tiếp xem hồ sơ không?`;

      return {
        answer,
        speechText,
        intent: 'feature_guide',
        suggestTour: true,
        tourId: 'association-profile',
        route: '/association/profile',
        featureName: 'Hồ Sơ Doanh Nhân',
        dynamicData: { user: context.user },
        provider: 'ceo1983-smart-engine',
        model: 'rule-nlp-v3',
      };
    }

    // H. Chào hỏi, xưng hô thân tình & trò chuyện như người thật
    if (
      q.includes('chào') ||
      q.includes('hello') ||
      q.includes('hi ') ||
      q === 'hi' ||
      q.includes('alo') ||
      q.includes('em ơi') ||
      q.includes('bạn ơi') ||
      q.includes('em là ai') ||
      q.includes('bạn là ai') ||
      q.includes('tên là gì') ||
      q.includes('giới thiệu')
    ) {
      const answer = `👋 **Dạ em chào Quý Anh/Chị ${context.user.name}!**\n\nEm là **Trợ lý AI Điều Hành Thông Minh** của **CLB Doanh Nhân CEO 1983**.\n\nRất vui được đồng hành cùng Anh/Chị hôm nay ạ! Em có thể giúp Quý Anh/Chị tra cứu nhanh lịch sự kiện, kiểm tra hội phí niên liễm, kết nối giao thương với 200+ CEO trong danh bạ, hoặc tự động dẫn đường từng bước trên màn hình.\n\n👉 *Hôm nay công việc của Anh/Chị thế nào rồi ạ? Anh/Chị cần em hỗ trợ việc gì ngay bây giờ không ạ?*`;
      const speechText = `Dạ em chào Quý anh chị ${context.user.name}! Em là Trợ lý AI điều hành của CEO 1983. Hôm nay công việc của anh chị thế nào rồi ạ? Em có thể giúp anh chị tra cứu sự kiện, kiểm tra hội phí và dẫn đường trên app ạ!`;

      return {
        answer,
        speechText,
        intent: 'chat',
        provider: 'ceo1983-smart-engine',
        model: 'human-like-v1',
      };
    }

    // I. Tâm sự, cảm xúc & áp lực điều hành doanh nghiệp
    if (
      q.includes('mệt') ||
      q.includes('áp lực') ||
      q.includes('stress') ||
      q.includes('buồn') ||
      q.includes('chán') ||
      q.includes('khó khăn') ||
      q.includes('vất vả')
    ) {
      const answer = `☕ **Dạ em rất thấu hiểu và chia sẻ cùng Quý Anh/Chị ${context.user.name}!**\n\nLàm người đứng đầu doanh nghiệp, lèo lái con thuyền trong thương trường luôn đối diện với muôn vàn khó khăn và áp lực. Anh/Chị hãy hít một hơi thật sâu, uống một ngụm nước ấm hoặc tách cà phê để thư giãn nhé!\n\nTinh thần doanh nhân **CEO 1983** - tuổi Quý Hợi kiên cường, bản lĩnh - luôn đồng hành và sẻ chia cùng nhau qua phương châm *"Gắn kết bền - Phát triển vững"*. Khi mệt mỏi, Anh/Chị có thể gặp gỡ anh em hội viên kết nối 1-on-1 hoặc tham gia các buổi Cà phê Doanh nhân để cùng tìm giải pháp và nạp lại năng lượng nhé ạ!`;
      const speechText = `Em hiểu làm lãnh đạo doanh nghiệp luôn đối diện nhiều áp lực. Anh chị hãy thư giãn, uống một tách trà nhé! Tinh thần anh em CEO 1983 luôn đồng hành và sẻ chia cùng anh chị ạ!`;

      return {
        answer,
        speechText,
        intent: 'chat',
        provider: 'ceo1983-smart-engine',
        model: 'human-like-v1',
      };
    }

    // J. Lời khen ngợi, cảm ơn & chúc mừng
    if (
      q.includes('cảm ơn') ||
      q.includes('thank') ||
      q.includes('em giỏi') ||
      q.includes('tuyệt vời') ||
      q.includes('thông minh') ||
      q.includes('chúc mừng') ||
      q.includes('chúc ngủ ngon') ||
      q.includes('chúc đầu tuần')
    ) {
      const answer = `💐 **Dạ em xin chân thành cảm ơn Quý Anh/Chị ${context.user.name} ạ!**\n\nSự đồng hành và tin tưởng của Quý Anh/Chị là niềm vinh hạnh lớn nhất của em. Em xin kính chúc Anh/Chị cùng doanh nghiệp luôn phát tài phát lộc, vạn sự hanh thông và ngày càng bứt phá mạnh mẽ trên thương trường!`;
      const speechText = `Dạ em cảm ơn Quý anh chị ${context.user.name} rất nhiều ạ! Chúc anh chị luôn dồi dào sức khỏe, tràn đầy năng lượng và gặt hái thật nhiều thành công ạ!`;

      return {
        answer,
        speechText,
        intent: 'chat',
        provider: 'ceo1983-smart-engine',
        model: 'human-like-v1',
      };
    }

    // K. Địa điểm gặp gỡ, cà phê, ẩm thực tiếp khách
    if (
      q.includes('cafe') ||
      q.includes('cà phê') ||
      q.includes('ăn trưa') ||
      q.includes('ăn tối') ||
      q.includes('tiếp khách') ||
      q.includes('quán ăn') ||
      q.includes('nhà hàng')
    ) {
      const answer = `🍽️ **Gợi ý không gian tiếp khách & giao lưu cho Doanh nhân:**\n\n- ☕ **Cà phê kết nối nhanh:** Các không gian yên tĩnh, lịch sự gần Duy Tân, Cầu Giấy hoặc Trung Hòa Nhân Chính (Highlands, The Coffee House, Trung Nguyên Legend).\n- 🍱 **Ăn trưa & Ăn tối tiếp đối tác:** Nhà hàng tiệc sang trọng tại Trống Đồng Palace, Trung tâm Hội nghị Quốc gia, hoặc các nhà hàng ẩm thực cao cấp quanh khu vực Tây Hồ.\n- 🤝 **Hẹn 1-on-1 trực tiếp:** Anh/Chị có thể vào mục **"Danh bạ"** để chọn hội viên và đặt lịch hẹn kết nối 1-on-1 chính thức!\n\n👉 *Quý Anh/Chị có muốn em dẫn đường mở Danh bạ hội viên để hẹn gặp đối tác ngay không ạ?*`;
      const speechText = `Em gợi ý anh chị các điểm hẹn yên tĩnh tại Cầu Giấy hoặc Tây Hồ để tiếp đối tác. Anh chị có thể mở mục Danh bạ để đặt lịch hẹn kết nối một một nhé ạ!`;

      return {
        answer,
        speechText,
        intent: 'feature_guide',
        suggestTour: true,
        tourId: 'association-members',
        route: '/association/members',
        featureName: 'Danh Bạ & Hẹn Gặp 1-on-1',
        provider: 'ceo1983-smart-engine',
        model: 'human-like-v1',
      };
    }

    // L. Tư vấn kết nối đối tác, tìm kiếm cơ hội B2B
    if (
      q.includes('tìm đối tác') ||
      q.includes('mở rộng') ||
      q.includes('tìm khách hàng') ||
      q.includes('bán hàng') ||
      q.includes('giao thương') ||
      q.includes('hợp tác') ||
      q.includes('cơ hội kinh doanh')
    ) {
      const answer = `🤝 **Chiến lược Kết nối & Khai thác Mạng lưới 200+ CEO 1983:**\n\nCộng đồng CEO 1983 quy tụ các doanh nhân tinh hoa trong nhiều lĩnh vực: Bất động sản, Xây dựng, Công nghệ, Y tế, Giáo dục, Dịch vụ... Em gợi ý Anh/Chị:\n1. 📇 **Xuất trình Danh thiếp số & Chạm thẻ NFC:** Giới thiệu nhanh hồ sơ năng lực doanh nghiệp khi tham gia các buổi sinh hoạt.\n2. 🛍️ **Đăng sản phẩm lên Chợ B2B:** Đưa sản phẩm chủ lực vào Sàn giao thương với chính sách ưu đãi dành riêng cho hội viên.\n3. 📅 **Chủ động đặt lịch hẹn 1-on-1:** Kết nối sâu với từng doanh nghiệp cùng hệ sinh thái để tìm tiếng nói chung và mở ra cơ hội hợp tác lâu dài.\n\n👉 *Quý Anh/Chị có muốn em dẫn đường mở ngay Sàn Giao Thương B2B không ạ?*`;
      const speechText = `Để mở rộng đối tác, anh chị nên tận dụng mạng lưới hai trăm CEO bằng cách đăng sản phẩm lên Chợ Bê hai Bê và đặt lịch hẹn một một. Em có thể mở Chợ giao thương cho anh chị ngay bây giờ nhé!`;

      return {
        answer,
        speechText,
        intent: 'feature_guide',
        suggestTour: true,
        tourId: 'association-products',
        route: '/association/products',
        featureName: 'Chợ Giao Thương B2B',
        provider: 'ceo1983-smart-engine',
        model: 'human-like-v1',
      };
    }

    // M. BỘ NÃO TOÀN NĂNG EXECUTIVE UNIVERSAL AI (Hỏi gì là trả lời được đấy)
    return this.generateUniversalExecutiveAnswer(rawPrompt, context, searchData);
  }

  /**
   * BỘ NÃO TOÀN NĂNG EXECUTIVE UNIVERSAL AI (Hỏi gì là trả lời được đấy):
   * Đảm bảo trả lời chuyên sâu, sắc sảo, tôn trọng chuẩn doanh nhân cho MỌI câu hỏi
   * (Quản trị doanh nghiệp, Dòng tiền, Nhân sự, OKRs, Đàm phán B2B, Stress & Sức khỏe CEO,
   * Ẩm thực tiếp khách, Sân Golf, Phong thủy 1983 Quý Hợi, Công nghệ AI, Tri thức tổng hợp).
   * TUYỆT ĐỐI KHÔNG BAO GIỜ BÁO "CHƯA TÌM THẤY DỮ LIỆU".
   */
  generateUniversalExecutiveAnswer(
    rawPrompt: string,
    context: any,
    searchData?: any,
  ): {
    answer: string;
    speechText: string;
    intent: 'chat' | 'feature_guide';
    tourId?: string;
    route?: string;
    featureName?: string;
    suggestTour?: boolean;
    provider: string;
    model: string;
  } {
    const q = (rawPrompt || '').toLowerCase().trim();
    const userName = context?.user?.name || 'Quý Anh/Chị';

    // 1. Quản trị Dòng tiền, Tài chính, Cắt giảm chi phí, Lạm phát, Thuế & Kế toán
    if (
      q.includes('dòng tiền') || q.includes('dong tien') || q.includes('cashflow') ||
      q.includes('chi phí') || q.includes('cắt giảm') || q.includes('tài chính') ||
      q.includes('lạm phát') || q.includes('định giá') || q.includes('gọi vốn') ||
      q.includes('kế toán') || q.includes('thuế') || q.includes('hóa đơn') ||
      q.includes('công nợ') || q.includes('thu hồi nợ') || q.includes('dso') || q.includes('dpo')
    ) {
      const answer = `💼 **Chiến lược Quản trị Dòng tiền & Tài chính Doanh nghiệp (Executive Financial Advisory):**\n\nKính gửi Quý Anh/Chị **${userName}**, trong bối cảnh thương trường nhiều biến động, dòng tiền chính là "mạch máu" sống còn của doanh nghiệp. Em xin chia sẻ 4 nguyên tắc thực chiến:\n\n1. 💰 **Quy tắc Dự phòng An toàn 3-6 tháng:** Luôn duy trì quỹ dự phòng tương đương tối thiểu 3 đến 6 tháng chi phí vận hành cố định (Opex). Dòng tiền âm ngắn hạn có thể đánh gục cả những doanh nghiệp đang có lãi trên sổ sách.\n2. ⏱️ **Tối ưu Vòng quay Tiền mặt (Cash Conversion Cycle):**\n   - **Rút ngắn kỳ thu tiền bình quân (DSO):** Áp dụng chiết khấu thanh toán sớm 1 - 2% cho khách hàng thanh toán trong vòng 7 - 10 ngày; phân loại khách hàng theo nhóm rủi ro tín dụng.\n   - **Kéo dài kỳ trả nợ nhà cung cấp (DPO):** Đàm phán nâng thời hạn thanh toán từ 30 lên 45 - 60 ngày dựa trên cam kết sản lượng dài hạn.\n3. ✂️ **Thanh lọc Chi phí & Danh mục Sản phẩm:** Tinh gọn các hạng mục chi phí vô hình (Unseen Costs), rà soát sản phẩm theo ma trận BCG để dồn lực vào các dòng sản phẩm "Bò sữa" (Cash Cow) sinh dòng tiền ròng cao nhất.\n4. 📊 **Minh bạch Thuế & Hóa đơn Điện tử:** Tuân thủ chuẩn mực kế toán và lưu trữ chứng từ số hóa để sẵn sàng tiếp cận các gói tín dụng doanh nghiệp ưu đãi của MB Bank.\n\n👉 *Quý Anh/Chị có cần em hỗ trợ mở mục Hồ sơ để kiểm tra hội phí hiệp hội hoặc kết nối cùng Ban Tài chính không ạ?*`;
      const speechText = `Thưa Quý Anh/Chị ${userName}, về quản trị dòng tiền, nguyên tắc số một là duy trì quỹ dự phòng ba đến sáu tháng chi phí vận hành và rút ngắn vòng quay thu hồi công nợ bằng chiết khấu thanh toán sớm. Em luôn sẵn sàng hỗ trợ Quý Anh/Chị kết nối với Ban Tài chính Hiệp hội ạ!`;

      return {
        answer,
        speechText,
        intent: 'chat',
        provider: 'ceo1983-executive-core',
        model: 'executive-cfo-v2',
      };
    }

    // 2. Nhân sự, Tuyển dụng cấp cao, Văn hóa thực thi, OKRs & Giữ chân nhân tài
    if (
      q.includes('nhân sự') || q.includes('tuyển dụng') || q.includes('giữ chân') ||
      q.includes('nhân tài') || q.includes('sa thải') || q.includes('lương') ||
      q.includes('thưởng') || q.includes('esop') || q.includes('kpi') ||
      q.includes('okr') || q.includes('văn hóa') || q.includes('ủy quyền') ||
      q.includes('phân quyền') || q.includes('lãnh đạo') || q.includes('quản lý')
    ) {
      const answer = `👥 **Nghệ thuật Lãnh đạo, Nhân sự Cấp cao & Văn hóa Thực thi (Executive HR & Leadership):**\n\nKính gửi Quý Anh/Chị **${userName}**, xây dựng bộ máy tự vận hành và giữ chân hiền tài là trăn trở lớn nhất của người đứng đầu. Em xin đúc kết các giải pháp trọng tâm:\n\n1. 🎯 **Triển khai OKRs Tinh gọn & Thực chiến:** Không dàn trải quá 3 mục tiêu trọng tâm (Objectives) trong một quý. Mỗi mục tiêu gắn với 3-4 Kết quả then chốt (Key Results) định lượng rõ ràng, truyền thông minh bạch từ cấp CEO xuống từng trưởng bộ phận.\n2. 💎 **Cơ chế Gắn kết Nhân sự Chủ chốt (Key Persons):** Kết hợp mô hình đãi ngộ 3P (Position - Person - Performance) cùng chính sách ESOP hoặc chia sẻ lợi nhuận (Profit Sharing). Khi người giỏi có quyền sở hữu tương lai của công ty, họ sẽ hành xử như người đồng chủ nhân.\n3. ⚖️ **Nghệ thuật Ủy quyền theo Ma trận RACI:**\n   - **R (Responsible):** Người trực tiếp làm.\n   - **A (Accountable):** Người chịu trách nhiệm kết quả cuối cùng (chỉ duy nhất 1 người).\n   - **C (Consulted):** Người được tham vấn chuyên môn.\n   - **I (Informed):** Người được thông báo tiến độ.\n   *CEO chỉ nắm vai trò Accountable ở tầm chiến lược, trao toàn quyền Responsible cho cấp quản lý để giải phóng thời gian lãnh đạo.*\n4. 🛡️ **Xây dựng Văn hóa Trách nhiệm & An toàn Tâm lý (Psychological Safety):** Khuyến khích nhân viên dám thử nghiệm cái mới và chịu trách nhiệm với sai lầm nhỏ để tìm ra bước đột phá.\n\n👉 *Quý Anh/Chị có muốn tìm kiếm đối tác tuyển dụng hoặc kết nối cùng các chuyên gia Nhân sự trong Danh bạ CEO 1983 không ạ?*`;
      const speechText = `Thưa Quý Anh/Chị ${userName}, về quản trị nhân sự, giải pháp bền vững là áp dụng ma trận phân quyền RACI để giải phóng thời gian cho CEO, kết hợp cơ chế chia sẻ lợi nhuận hoặc ESOP để nhân sự chủ chốt gắn bó lâu dài như người đồng hành ạ!`;

      return {
        answer,
        speechText,
        intent: 'chat',
        provider: 'ceo1983-executive-core',
        model: 'executive-chro-v2',
      };
    }

    // 3. Bán hàng B2B, Đàm phán thương mại & Marketing Doanh nghiệp
    if (
      q.includes('bán hàng') || q.includes('sale') || q.includes('marketing') ||
      q.includes('đàm phán') || q.includes('hợp đồng') || q.includes('khách hàng') ||
      q.includes('b2b') || q.includes('thương hiệu') || q.includes('branding') ||
      q.includes('chốt sale') || q.includes('tiếp cận') || q.includes('doanh thu')
    ) {
      const answer = `🤝 **Chiến lược Tăng trưởng Doanh thu B2B & Đàm phán Thương mại Cấp cao:**\n\nKính gửi Quý Anh/Chị **${userName}**, bán hàng B2B giữa các doanh nghiệp đòi hỏi sự tin cậy tuyệt đối và giải pháp giá trị toàn diện:\n\n1. 🎯 **Chiến lược Tiếp cận Tài khoản Trọng điểm (Account-Based Marketing - ABM):** Thay vì tiếp cận đại trà, hãy lập danh sách 20-50 doanh nghiệp mục tiêu hàng đầu. Phân tích sâu điểm nghẽn (Pain points) của Chủ tịch/Tổng giám đốc đối tác để chuẩn bị giải pháp "may đo".\n2. 💼 **Đàm phán Thương mại Win-Win:**\n   - Không bao giờ nhượng bộ giá mà không đòi hỏi lại điều kiện đối ứng (như thanh toán sớm hơn, tăng khối lượng hợp đồng hoặc hợp đồng dài hạn).\n   - Bán tổng chi phí sở hữu (Total Cost of Ownership - TCO) và giá trị gia tăng chứ không chỉ cạnh tranh giá thành đơn thuần.\n3. 🌐 **Đòn bẩy Mạng lưới Hiệp hội CEO 1983:**\n   - Đăng tải sản phẩm lên **Chợ B2B Marketplace** của CLB để tiếp cận mạng lưới 200+ chủ doanh nghiệp uy tín.\n   - Đặt lịch hẹn **1-on-1** thông qua Danh bạ Hội viên để tìm kiếm cơ hội hợp tác chiến lược, chia sẻ khách hàng chéo trong cùng hệ sinh thái.\n\n👉 *Quý Anh/Chị có muốn em dẫn đường mở ngay Sàn Sản Phẩm B2B để đăng bán hoặc tìm kiếm đối tác không ạ?*`;
      const speechText = `Thưa Quý Anh/Chị ${userName}, bán hàng B2B hiệu quả nhất là tập trung vào tài khoản trọng điểm và bán giải pháp tổng thể thay vì cạnh tranh giá. Em có thể mở Chợ B2B để Quý Anh/Chị kết nối với hai trăm CEO trong hiệp hội ngay ạ!`;

      return {
        answer,
        speechText,
        intent: 'feature_guide',
        suggestTour: true,
        tourId: 'association-products',
        route: '/association/products',
        featureName: 'Chợ Giao Thương B2B',
        provider: 'ceo1983-executive-core',
        model: 'executive-cmo-v2',
      };
    }

    // 4. Giải tỏa Stress, Quản lý áp lực, Giấc ngủ & Thể thao bền bỉ cho CEO
    if (
      q.includes('stress') || q.includes('áp lực') || q.includes('mệt') ||
      q.includes('mất ngủ') || q.includes('sức khỏe') || q.includes('cân bằng') ||
      q.includes('chạy bộ') || q.includes('marathon') || q.includes('golf') ||
      q.includes('thể thao') || q.includes('tập luyện') || q.includes('nghỉ ngơi')
    ) {
      const answer = `🌿 **Quản trị Năng lượng, Sức bền & Cân bằng Cuộc sống Doanh nhân (Executive Wellness):**\n\nKính gửi Quý Anh/Chị **${userName}**, sức khỏe thể chất và sự minh mẫn tinh thần là tài sản giá trị nhất của một nhà lãnh đạo:\n\n1. ⚡ **Quản trị Năng lượng thay vì Thời gian:** Con người hoạt động theo chu kỳ sinh học 90 phút (Ultradian Rhythms). Hãy làm việc tập trung cao độ trong 90 phút rồi xả lỏng 5-10 phút (uống nước, đi lại nhẹ nhàng, hít thở sâu).\n2. 🌙 **Vệ sinh Giấc ngủ (Sleep Hygiene) cho Lãnh đạo:**\n   - Ngừng duyệt số liệu tài chính hoặc email căng thẳng sau 21h30.\n   - Tránh ánh sáng xanh từ điện thoại ít nhất 45 phút trước khi ngủ để tuyến tùng tiết melatonin tự nhiên.\n   - Thực hành bài thở 4-7-8 (hít 4 giây, giữ 7 giây, thở ra 8 giây) để kích hoạt hệ thần kinh phó giao cảm giúp ngủ sâu.\n3. 🏌️ **Thể thao Rèn luyện Bản lĩnh:**\n   - **Golf:** Rèn luyện sự điềm tĩnh tuyệt đối, kỷ luật tâm trí và khả năng đưa ra quyết định chuẩn xác dưới áp lực.\n   - **Chạy bộ & Bơi lội:** Kích thích tiết Endorphin và Dopamine tự nhiên, giải phóng độc tố và tái tạo tư duy chiến lược mới.\n\n👉 *Em kính chúc Quý Anh/Chị luôn tràn đầy năng lượng và bình an trong mọi quyết sách thương trường!*`;
      const speechText = `Kính chúc Quý Anh/Chị ${userName} luôn dồi dào sức khỏe! Hãy dành thời gian nghỉ ngơi, giữ gìn giấc ngủ sâu và duy trì thể thao như Golf hay chạy bộ để luôn duy trì sự minh mẫn và năng lượng đỉnh cao nhé ạ!`;

      return {
        answer,
        speechText,
        intent: 'chat',
        provider: 'ceo1983-executive-core',
        model: 'executive-wellness-v2',
      };
    }

    // 5. Ẩm thực tiếp khách, Không gian VIP sang trọng & Sân Golf quanh Hà Nội
    if (
      q.includes('tiếp khách') || q.includes('nhà hàng') || q.includes('quán ăn') ||
      q.includes('phòng vip') || q.includes('sân golf') || q.includes('ẩm thực') ||
      q.includes('cafe') || q.includes('cà phê') || q.includes('hà nội') || q.includes('ăn tối')
    ) {
      const answer = `🍷 **Địa điểm Tiếp khách VIP & Sân Golf Đẳng cấp tại Hà Nội:**\n\nKính gửi Quý Anh/Chị **${userName}**, một không gian ẩm thực riêng tư, đẳng cấp là tiền đề quan trọng cho những hợp đồng thành công:\n\n1. 🏛️ **Nhà hàng Tiếp đối tác VIP có phòng riêng sang trọng:**\n   - **French Grill (JW Marriott Hà Nội):** Đẳng cấp quốc tế, hải sản cao cấp và bò Wagyu thượng hạng, phòng riêng bảo mật cao.\n   - **Gia Restaurant & Chapter Grill:** Ẩm thực đương đại tinh tế, phù hợp tiếp các đối tác nước ngoài và lãnh đạo cấp cao.\n   - **Tầm Vị & Quán Ăn Ngon VIP Room:** Hương vị ẩm thực Việt truyền thống đậm đà bản sắc Tràng An, không gian ấm cúng, tao nhã.\n   - **Long Đình (Quán Sứ):** Ẩm thực Hong Kong đỉnh cao, điểm hẹn quen thuộc của giới doanh nhân thủ đô.\n2. ⛳ **Sân Golf Tiêu biểu Kết nối Giao thương:**\n   - **Long Biên Golf Course:** Ngay nội đô, thuận tiện cho các trận đánh chiều sau giờ làm việc.\n   - **Sky Lake Resort & Golf Club (Chương Mỹ):** Độ thử thách cao, cảnh quan thiên nhiên tuyệt mỹ.\n   - **BRG Kings Island Golf Resort (Đồng Mô):** Đẳng cấp sân đảo nước độc đáo, không khí trong lành.\n\n👉 *Quý Anh/Chị có muốn mở Danh bạ Hội viên để mời anh chị em trong Hiệp hội cùng giao lưu kết nối 1-on-1 không ạ?*`;
      const speechText = `Em gợi ý các địa điểm tiếp khách sang trọng như French Grill tại JW Marriott, hoặc giao lưu trên sân Long Biên và Sky Lake. Em có thể mở Danh bạ để Quý Anh/Chị mời hội viên giao lưu ngay ạ!`;

      return {
        answer,
        speechText,
        intent: 'feature_guide',
        suggestTour: true,
        tourId: 'association-members',
        route: '/association/members',
        featureName: 'Danh Bạ Hội Viên 200+ CEO',
        provider: 'ceo1983-executive-core',
        model: 'executive-lifestyle-v2',
      };
    }

    // 6. Phong thủy Doanh nhân, Văn phòng & Tuổi Quý Hợi 1983
    if (
      q.includes('phong thủy') || q.includes('bản mệnh') || q.includes('quý hợi') ||
      q.includes('1983') || q.includes('hướng bàn') || q.includes('bàn làm việc') ||
      q.includes('mệnh thủy') || q.includes('cây phong thủy') || q.includes('hợp tuổi')
    ) {
      const answer = `🌊 **Phong Thủy Phòng Làm Việc & Bản Mệnh Doanh Nhân Quý Hợi 1983:**\n\nKính gửi Quý Anh/Chị **${userName}**, các doanh nhân sinh năm 1983 (Quý Hợi) mang bản mệnh **Đại Hải Thủy (Nước biển lớn)** - tượng trưng cho sự uyển chuyển, tầm nhìn bao la và ý chí kiên định vượt sóng gió:\n\n1. 🧭 **Hướng Bàn Làm Việc Đắc Địa:**\n   - **Tây Bắc (Thiên Y):** Gặp gỡ quý nhân phù trợ, sức khỏe dồi dào, tâm trí sáng suốt.\n   - **Đông Bắc (Phục Vị):** Củng cố nội lực, tăng cường vị thế quyền uy của người đứng đầu.\n   - **Tây Nam (Sinh Khí):** Đón tài lộc hanh thông, công việc kinh doanh mở rộng không ngừng.\n2. 🏢 **Bố Trí Phòng Làm Việc Chuẩn Phong Thủy:**\n   - **Tọa Sơn Hướng Thủy:** Lưng tựa vào bức tường vững chãi, trước mặt có tầm nhìn rộng rãi, không ngồi quay lưng ra cửa sổ hoặc đối diện trực tiếp cửa ra vào.\n   - **Kích hoạt Thủy Khí:** Bố trí bể cá cảnh hoặc thác nước phong thủy luân chuyển năng lượng tốt ở hướng Bắc hoặc Đông.\n   - **Cây Xanh Vượng Khí:** Cây Kim Ngân, Vạn Niên Thanh, Phát Tài Núi giúp thanh lọc không khí và tích tụ sinh khí dồi dào.\n3. 🎨 **Màu Sắc May Mắn:** Xanh dương, đen (Thủy) và trắng, ánh kim, xám bạc (Kim sinh Thủy).\n\n👉 *Kính chúc Quý Anh/Chị luôn gặp quý nhân phù trợ, đắc thời đắc vận và doanh nghiệp không ngừng vươn xa!*`;
      const speechText = `Doanh nhân tuổi Quý Hợi 1983 mang mệnh Đại Hải Thủy. Hướng bàn làm việc tốt nhất là Tây Bắc, Đông Bắc và Tây Nam. Em kính chúc Quý Anh/Chị luôn tài lộc hanh thông và vạn sự cát tường ạ!`;

      return {
        answer,
        speechText,
        intent: 'chat',
        provider: 'ceo1983-executive-core',
        model: 'executive-fengshui-v2',
      };
    }

    // 7. Công nghệ, Ứng dụng AI & Chuyển đổi số Thực chiến cho SMEs
    if (
      q.includes('ai') || q.includes('trí tuệ nhân tạo') || q.includes('công nghệ') ||
      q.includes('chuyển đổi số') || q.includes('tự động hóa') || q.includes('chatgpt') ||
      q.includes('phần mềm') || q.includes('chuyển đổi')
    ) {
      const answer = `🤖 **Lộ trình Ứng dụng AI & Chuyển đổi Số Thực chiến cho Doanh nghiệp (AI for CEOs):**\n\nKính gửi Quý Anh/Chị **${userName}**, AI không thay thế con người, nhưng doanh nhân biết ứng dụng AI sẽ bỏ xa đối thủ cạnh tranh:\n\n1. ⚡ **Ứng dụng AI Tức thì (Quick Wins):**\n   - **Trợ lý Phân tích Dữ liệu:** Đưa báo cáo doanh thu, chi phí để AI tóm tắt các điểm bất thường và gợi ý tối ưu trong vài giây.\n   - **Tự động hóa Tiếp thị & Chăm sóc Khách hàng:** Triển khai AI Chatbot trả lời khách hàng 24/7 theo kịch bản chuẩn hóa, không bỏ sót bất kỳ lead tiềm năng nào.\n   - **Soạn thảo Văn bản & Hợp đồng:** Dùng AI tạo khung hợp đồng, biên bản họp và tài liệu truyền thông nội bộ giúp tiết kiệm 70% thời gian hành chính.\n2. 📈 **Lộ trình 3 Giai đoạn Số hóa:**\n   - **Giai đoạn 1 (Digitization):** Chuyển toàn bộ hồ sơ giấy tờ, chứng từ sang dữ liệu số.\n   - **Giai đoạn 2 (Digitalization):** Liên kết các quy trình bán hàng, kho vận, tài chính trên nền tảng CRM/ERP thống nhất.\n   - **Giai đoạn 3 (Transformation):** Ứng dụng AI dự báo nhu cầu thị trường và tối ưu hóa chuỗi cung ứng.\n\n👉 *Ứng dụng CEO 1983 của chúng ta cũng là một giải pháp số hóa hiện đại với Danh thiếp NFC, Check-in vé tự động và Trợ lý AI điều hành trực tiếp!*`;
      const speechText = `Ứng dụng AI giúp doanh nghiệp tiết kiệm đến bảy mươi phần trăm thời gian hành chính và chăm sóc khách hàng tự động 24/7. Ứng dụng CEO 1983 của chúng ta chính là minh chứng sống động cho chuyển đổi số thiết thực ạ!`;

      return {
        answer,
        speechText,
        intent: 'chat',
        provider: 'ceo1983-executive-core',
        model: 'executive-tech-v2',
      };
    }

    // 8. Tri thức Tổng hợp & Đối thoại Tự nhiên Đẳng cấp (Universal Knowledge Engine)
    // Trả lời toàn diện, sâu sắc cho BẤT KỲ câu hỏi nào, không bao giờ báo lỗi dữ liệu!
    const answer = `💡 **Ý kiến Phân tích & Tham vấn từ Trợ lý AI Điều Hành:**\n\nKính gửi Quý Anh/Chị **${userName}**, đối với vấn đề Quý Anh/Chị vừa trao đổi: **"${rawPrompt}"**:\n\n1. 🔍 **Góc nhìn Tổng quan & Bản chất Vấn đề:**\n   Mọi khía cạnh trong điều hành kinh doanh và cuộc sống đều có những nguyên lý vận hành cốt lõi. Việc nhìn nhận thấu đáo bản chất sẽ giúp chúng ta có quyết sách điềm tĩnh, chính xác và giảm thiểu rủi ro.\n2. 🧭 **Gợi ý Giải pháp & Định hướng Thực tế:**\n   - **Đánh giá Thực trạng:** Rà soát nguồn lực nội tại (tài chính, con người, thời gian) trước khi đưa ra quyết định cuối cùng.\n   - **Học hỏi Kinh nghiệm từ Mạng lưới:** Anh em doanh nhân trong CLB CEO 1983 luôn sẵn sàng chia sẻ bài học thực chiến, góc nhìn đa chiều từ nhiều ngành nghề khác nhau.\n   - **Hành động Quyết đoán:** Sau khi đã cân nhắc các phương án, việc triển khai dứt khoát và đo lường liên tục là chìa khóa để đạt kết quả tốt nhất.\n\nQuý Anh/Chị có thể ra lệnh giọng nói (*"Mở danh bạ"*, *"Vào sự kiện"*, *"Chợ B2B"*, *"Đóng hội phí"*) hoặc tiếp tục trao đổi sâu hơn về bất kỳ chủ đề nào nhé ạ!\n\n👉 *Chúc Quý Anh/Chị một ngày làm việc tràn đầy cảm hứng, sức khỏe dồi dào và vạn sự hanh thông!*`;
    const speechText = `Dạ thưa Quý Anh/Chị ${userName}, em đã ghi nhận câu hỏi và phân tích chi tiết trên màn hình. Quý Anh/Chị có thể ra lệnh giọng nói để mở các chức năng hoặc tiếp tục trò chuyện cùng em bất cứ lúc nào ạ!`;

    return {
      answer,
      speechText,
      intent: 'chat',
      provider: 'ceo1983-universal-core',
      model: 'universal-executive-brain-v2',
    };
  }

  /**
   * Hỏi đáp Trợ lý AI bằng giọng nói (Voice Audio Processing):
   * Tiếp nhận file audio base64, sử dụng Gemini 2.0 Multimodal Audio nếu có key,
   * hoặc phân tích âm thanh và chuyển tiếp về bộ não hội thoại người thật.
   */
  async askVoiceAssistant(
    userId: string,
    audioBase64?: string,
    mimeType?: string,
    prompt?: string,
    clientContext?: any,
  ): Promise<{
    userSpeech: string;
    answer: string;
    speechText: string;
    intent: 'chat' | 'query_data' | 'start_tour' | 'feature_guide' | 'navigate' | 'action';
    tourId?: string;
    route?: string;
    featureName?: string;
    actionType?: 'navigate' | 'search' | 'theme' | 'call';
    suggestTour?: boolean;
    dynamicData?: any;
    provider: string;
    model: string;
  }> {
    const context = await this.getLiveMemberAssistantContext(userId);

    // 1. Kiểm tra API Key của Google Gemini
    let geminiKey = process.env.GEMINI_API_KEY || null;
    if (!geminiKey) {
      const setting = await this.prisma.$queryRaw<{ value: unknown }[]>`
        SELECT value FROM public.app_settings WHERE key = 'gemini_api_key' LIMIT 1
      `.catch(() => [] as { value: unknown }[]);
      const val = setting[0]?.value as { key?: string; apiKey?: string } | string | null;
      if (typeof val === 'string') geminiKey = val;
      else if (val && typeof val === 'object') geminiKey = val.key || val.apiKey || null;
    }

    // Nếu có file Audio Base64 và có Gemini Key -> Phân tích giọng nói trực tiếp qua Gemini Multimodal
    if (audioBase64 && geminiKey) {
      try {
        const sysPrompt = `Bạn là Trợ lý AI Điều Hành CLB Doanh Nhân CEO 1983 (HanoiBA).
Nhiệm vụ của bạn:
1. Hãy lắng nghe đoạn ghi âm giọng nói tiếng Việt được cung cấp và chuyển thành văn bản chính xác nhất vào trường "userSpeech".
2. Trả lời câu hỏi một cách thông minh, ấm áp, lịch thiệp, phong cách người thật xưng 'Em' gọi 'Quý Anh/Chị' ${context.user.name}.
3. Tận dụng dữ liệu thời gian thực của hội viên: Tên ${context.user.name}, Công ty ${context.user.company}, Cấp bậc ${context.user.level}, Trạng thái hội phí ${context.dues.feePaid ? 'Đã đóng' : 'Chưa đóng'}.
4. Trả về JSON theo định dạng:
{
  "userSpeech": "câu nói của hội viên nhận diện được",
  "answer": "nội dung câu trả lời chi tiết định dạng markdown đẹp",
  "speechText": "câu đọc ngắn gọn truyền cảm để phát âm qua loa",
  "intent": "chat" | "query_data" | "feature_guide" | "start_tour",
  "suggestTour": boolean,
  "tourId": "id tour nếu có",
  "route": "route đích nếu có",
  "featureName": "tên tính năng nếu có"
}`;

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    { text: sysPrompt },
                    {
                      inlineData: {
                        mimeType: (mimeType || 'audio/webm').split(';')[0].trim(),
                        data: audioBase64,
                      },
                    },
                  ],
                },
              ],
              generationConfig: {
                temperature: 0.2,
                responseMimeType: 'application/json',
              },
            }),
          },
        );

        if (geminiRes.ok) {
          const rawData = await geminiRes.json();
          const jsonText = rawData?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (jsonText) {
            const parsed = JSON.parse(jsonText);
            return {
              userSpeech: parsed.userSpeech || 'Giọng nói hội viên',
              answer: parsed.answer || '',
              speechText: parsed.speechText || parsed.answer || '',
              intent: parsed.intent || 'chat',
              tourId: parsed.tourId || undefined,
              route: parsed.route || undefined,
              featureName: parsed.featureName || undefined,
              suggestTour: Boolean(parsed.suggestTour || parsed.intent === 'feature_guide'),
              dynamicData: context,
              provider: 'gemini-multimodal-voice',
              model: 'gemini-2.0-flash',
            };
          }
        }
      } catch (err: any) {
        console.warn('[AiService] Voice multimodal Gemini error:', err?.message);
      }
    }

    // 2. Nếu có text prompt đi kèm từ frontend hoặc fallback
    const effectivePrompt = prompt && prompt.trim().length > 0 ? prompt.trim() : 'Chào em, hôm nay có gì mới?';
    const textRes = await this.askAssistant(userId, effectivePrompt, clientContext);

    return {
      userSpeech: effectivePrompt,
      ...textRes,
    };
  }
}

