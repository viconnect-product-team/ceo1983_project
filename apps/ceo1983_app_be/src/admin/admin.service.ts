import { Injectable, NotFoundException, BadRequestException, ForbiddenException, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConnectAppGateway } from '../connect-app/connect-app.gateway';

export const DEMO_LEAD_STATUSES = [
  'new',
  'contacted',
  'scheduled',
  'completed',
  'cancelled',
] as const;

@Injectable()
export class AdminService implements OnModuleInit {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: ConnectAppGateway,
  ) {}

  async onModuleInit() {
    try {
      await this.prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS public.notifications (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          code text UNIQUE,
          title text NOT NULL,
          body text,
          audience text DEFAULT 'all',
          channel text DEFAULT 'inapp',
          status text DEFAULT 'sent',
          sent_at timestamptz DEFAULT now(),
          reach integer DEFAULT 0,
          association_id uuid,
          app_scope text DEFAULT 'crm',
          target_app text DEFAULT 'crm',
          created_at timestamptz DEFAULT now(),
          updated_at timestamptz DEFAULT now()
        );
      `);
      await this.prisma.$executeRawUnsafe(`
        ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS app_scope text DEFAULT 'crm';
      `).catch(() => {});
      await this.prisma.$executeRawUnsafe(`
        ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS target_app text DEFAULT 'crm';
      `).catch(() => {});
      await this.prisma.$executeRawUnsafe(`
        ALTER TABLE public.business_notifications ADD COLUMN IF NOT EXISTS app_scope text DEFAULT 'association_app';
      `).catch(() => {});
      await this.prisma.$executeRawUnsafe(`
        ALTER TABLE public.business_notifications ADD COLUMN IF NOT EXISTS target_app text DEFAULT 'association_app';
      `).catch(() => {});
    } catch (e) {
      console.warn('Could not ensure notifications table:', e);
    }
  }

  async listDemoLeads(query: {
    status?: string;
    search?: string;
    from?: string;
    to?: string;
  }) {
    let whereConditions: string[] = ['1=1'];

    if (query.status && query.status !== 'all') {
      whereConditions.push(`status = '${query.status}'`);
    }

    if (query.from) {
      whereConditions.push(`created_at >= '${query.from}T00:00:00Z'::timestamptz`);
    }

    if (query.to) {
      whereConditions.push(`created_at <= '${query.to}T23:59:59Z'::timestamptz`);
    }

    if (query.search?.trim()) {
      const s = query.search.trim().replace(/'/g, "''");
      whereConditions.push(
        `(name ILIKE '%${s}%' OR email ILIKE '%${s}%' OR organization ILIKE '%${s}%')`
      );
    }

    const whereClause = whereConditions.join(' AND ');

    const rows = await this.prisma.$queryRawUnsafe<any[]>(`
      SELECT 
        id, name, email, organization, phone, job_title, preferred_date,
        preferred_slot, timezone, notes, locale, status, admin_notes,
        status_changed_at, created_at
      FROM public.demo_requests
      WHERE ${whereClause}
      ORDER BY created_at DESC
      LIMIT 500
    `).catch(() => []);

    const leads = rows.map((r) => ({
      id: r.id,
      name: r.name,
      email: r.email,
      organization: r.organization,
      phone: r.phone,
      jobTitle: r.job_title,
      preferredDate: r.preferred_date,
      preferredSlot: r.preferred_slot ? String(r.preferred_slot).slice(0, 5) : null,
      timezone: r.timezone,
      notes: r.notes,
      locale: r.locale,
      status: DEMO_LEAD_STATUSES.includes(r.status) ? r.status : 'new',
      adminNotes: r.admin_notes,
      statusChangedAt: r.status_changed_at,
      createdAt: r.created_at,
    }));

    // Calculate status counts
    const counts: Record<string, number> = { all: leads.length };
    for (const s of DEMO_LEAD_STATUSES) counts[s] = 0;
    for (const l of leads) counts[l.status] = (counts[l.status] ?? 0) + 1;

    return { leads, counts };
  }

  async updateDemoLead(id: string, data: { status?: string; adminNotes?: string | null }) {
    const updates: string[] = ['updated_at = now()'];

    if (data.status) {
      updates.push(`status = '${data.status}'`);
      updates.push(`status_changed_at = now()`);
    }

    if (data.adminNotes !== undefined) {
      if (data.adminNotes === null) {
        updates.push(`admin_notes = NULL`);
      } else {
        updates.push(`admin_notes = '${data.adminNotes.replace(/'/g, "''")}'`);
      }
    }

    const setClause = updates.join(', ');

    const rows = await this.prisma.$queryRawUnsafe<any[]>(`
      UPDATE public.demo_requests
      SET ${setClause}
      WHERE id = '${id}'::uuid
      RETURNING *
    `);

    if (!rows.length) {
      throw new NotFoundException('Demo lead not found');
    }

    const r = rows[0];
    return {
      id: r.id,
      name: r.name,
      email: r.email,
      organization: r.organization,
      phone: r.phone,
      jobTitle: r.job_title,
      preferredDate: r.preferred_date,
      preferredSlot: r.preferred_slot,
      timezone: r.timezone,
      notes: r.notes,
      locale: r.locale,
      status: r.status,
      adminNotes: r.admin_notes,
      statusChangedAt: r.status_changed_at,
      createdAt: r.created_at,
    };
  }

  // ── INVOICES / FEES MANAGEMENT ──────────────────────────────────────────────

  private mapInvoiceRow(r: any) {
    const dueDate = r.due_date instanceof Date ? r.due_date.toISOString().slice(0, 10) : String(r.due_date || '');
    const paidAt = r.paid_at ? (r.paid_at instanceof Date ? r.paid_at.toISOString().slice(0, 10) : String(r.paid_at).slice(0, 10)) : null;

    let member: any = null;
    if (r.member_id || r.member_name || r.member_code) {
      member = {
        id: r.member_id || '',
        code: r.member_code || (r.member_id ? `MB-${String(r.member_id).slice(0, 6).toUpperCase()}` : 'MB-CHUA-CO'),
        name: r.member_name || r.member_contact || r.member_email || 'Hội viên',
        contact: r.member_contact || r.member_name || '',
        email: r.member_email || '',
        phone: r.member_phone || '',
        type: r.member_type || 'company',
        level: r.member_level || 'memberLevel.medium',
        industry: r.member_industry || 'ind.trade',
        region: r.member_region || 'region.north',
        status: r.member_status || 'active',
        joinedAt: r.member_joined_at,
        feeYear: Number(r.member_fee_year ?? r.year),
        feePaid: Boolean(r.member_fee_paid),
        address: r.member_address || '',
        website: r.member_website,
        taxCode: r.member_tax_code,
        employees: r.member_employees,
        about: r.member_about || '',
        termEnd: r.member_term_end,
        reminderCount: Number(r.member_reminder_count ?? 0),
        lastReminder: r.member_last_reminder,
        renewedAt: r.member_renewed_at,
        newTermEnd: r.member_new_term_end,
      };
    }

    return {
      id: r.id,
      memberId: r.member_id,
      invoiceNo: r.invoice_no,
      year: Number(r.year),
      amount: Number(r.amount ?? 0),
      dueDate,
      paidAt,
      status: r.status || 'unpaid',
      method: r.method || null,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
      member,
    };
  }

  async listInvoices() {
    try {
      const rows = await this.prisma.$queryRaw<any[]>`
        SELECT 
          i.*,
          COALESCE(m.code, '') as member_code,
          COALESCE(m.name, u.name, u.email, 'Hội viên') as member_name,
          COALESCE(m.contact, u.name, '') as member_contact,
          COALESCE(m.email, u.email, '') as member_email,
          COALESCE(m.phone, '') as member_phone,
          COALESCE(m.type, 'company') as member_type,
          m.level as member_level,
          m.industry as member_industry,
          m.region as member_region,
          COALESCE(m.status, 'active') as member_status,
          m.joined_at as member_joined_at,
          m.fee_year as member_fee_year,
          m.fee_paid as member_fee_paid,
          m.address as member_address,
          m.website as member_website,
          m.tax_code as member_tax_code,
          m.employees as member_employees,
          m.about as member_about,
          m.term_end as member_term_end,
          m.reminder_count as member_reminder_count,
          m.last_reminder as member_last_reminder,
          m.renewed_at as member_renewed_at,
          m.new_term_end as member_new_term_end
        FROM public.invoices i
        LEFT JOIN public.members m ON (i.member_id = m.id OR i.member_id::text = m.user_id::text)
        LEFT JOIN public.vione_users u ON (i.member_id::text = u.id::text OR m.user_id::text = u.id::text)
        ORDER BY i.invoice_no ASC, i.created_at DESC
      `;
      return (rows || []).map((r) => this.mapInvoiceRow(r));
    } catch (err) {
      console.error('[AdminService] listInvoices error:', err);
      return [];
    }
  }

  async getInvoiceById(id: string) {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT 
        i.*,
        m.code as member_code,
        m.name as member_name,
        m.contact as member_contact,
        m.email as member_email,
        m.phone as member_phone,
        m.type as member_type,
        m.level as member_level,
        m.industry as member_industry,
        m.region as member_region,
        m.status as member_status,
        m.joined_at as member_joined_at,
        m.fee_year as member_fee_year,
        m.fee_paid as member_fee_paid,
        m.address as member_address,
        m.website as member_website,
        m.tax_code as member_tax_code,
        m.employees as member_employees,
        m.about as member_about,
        m.term_end as member_term_end,
        m.reminder_count as member_reminder_count,
        m.last_reminder as member_last_reminder,
        m.renewed_at as member_renewed_at,
        m.new_term_end as member_new_term_end
      FROM public.invoices i
      LEFT JOIN public.members m ON i.member_id = m.id
      WHERE i.id = ${id}
      LIMIT 1
    `;
    if (!rows || rows.length === 0) {
      throw new NotFoundException(`Invoice ${id} not found`);
    }

    const reminders = await this.prisma.$queryRaw<any[]>`
      SELECT * FROM public.invoice_reminders
      WHERE invoice_id = ${id}
      ORDER BY sent_at DESC
    `.catch(() => []);

    return {
      invoice: this.mapInvoiceRow(rows[0]),
      reminders: (reminders || []).map((rem) => ({
        id: rem.id,
        invoiceId: rem.invoice_id,
        channel: rem.channel,
        sentAt: rem.sent_at,
        byName: rem.by_name || '',
        note: rem.note || null,
        createdAt: rem.created_at,
      })),
    };
  }

  async markInvoicePaid(id: string, method: 'bank' | 'card' | 'cash' | 'ewallet' = 'bank') {
    const today = new Date().toISOString().slice(0, 10);
    const existing = await this.getInvoiceById(id);

    await this.prisma.$executeRaw`
      UPDATE public.invoices
      SET status = 'paid', paid_at = ${today}::date, method = ${method}, updated_at = NOW()
      WHERE id = ${id}
    `;

    if (existing.invoice.memberId) {
      await this.prisma.$executeRaw`
        UPDATE public.members
        SET fee_paid = true, updated_at = NOW()
        WHERE id = ${existing.invoice.memberId}
      `.catch(() => null);

      try {
        const memRows = await this.prisma.$queryRaw<any[]>`
          SELECT id, user_id, name FROM public.members WHERE id = ${existing.invoice.memberId} LIMIT 1
        `.catch(() => []);
        const targetUserId = memRows[0]?.user_id;
        if (targetUserId) {
          const notifTitle = 'Xác nhận thanh toán thành công';
          const notifBody = `Hóa đơn #${existing.invoice.invoiceNo || id} trị giá ${(Number(existing.invoice.amount || 0)).toLocaleString('vi-VN')} đ đã được xác nhận thanh toán thành công qua phương thức ${method}.`;
          const notifId = require('crypto').randomUUID();
          const dedupeKey = `invoice-paid-${id}-${Date.now()}`;
          const safeData = JSON.stringify({
            title: notifTitle,
            body: notifBody,
            invoiceId: id,
            invoiceNo: existing.invoice.invoiceNo || id,
            amount: Number(existing.invoice.amount || 0),
            method,
            type: 'invoice_paid',
            targetRoute: `/fees/${id}`,
          });

          await this.prisma.$executeRawUnsafe(`
            INSERT INTO public.business_notifications (
              id, recipient_user_id, source_domain, source_record_id, event_kind, notification_kind,
              title_key, body_key, safe_display_data, priority, status, dedupe_key, app_scope, target_app, created_at, updated_at
            ) VALUES (
              $1::uuid, $2::uuid, 'finance', $3, 'invoice_paid', 'payment_success',
              $4, $5, $6::jsonb, 'high', 'delivered', $7, 'all', 'all', NOW(), NOW()
            )
          `, notifId, targetUserId, id, notifTitle, notifBody, safeData, dedupeKey).catch(() => {});

          await this.prisma.$executeRawUnsafe(`
            INSERT INTO public.member_notifications (
              id, recipient_id, title, body, read, dismissed, ref_type, ref_id, created_at
            ) VALUES (
              gen_random_uuid(), $1, $2, $3, false, false, 'invoice', $4, NOW()
            )
          `, memRows[0]?.id || targetUserId, notifTitle, notifBody, id).catch(() => {});
        }
      } catch (e: any) {
        console.warn('[payInvoice] Failed to dispatch payment notification:', e?.message);
      }
    }

    const updated = await this.getInvoiceById(id);
    return updated.invoice;
  }

  async updateInvoiceMethod(id: string, method: 'bank' | 'card' | 'cash' | 'ewallet') {
    await this.prisma.$executeRaw`
      UPDATE public.invoices
      SET method = ${method}, updated_at = NOW()
      WHERE id = ${id}
    `;
    const updated = await this.getInvoiceById(id);
    return updated.invoice;
  }

  async addInvoiceReminder(id: string, data: { channel: string; byName?: string; note?: string }) {
    const byName = data.byName || 'Hệ thống';
    const channel = data.channel || 'email';
    const note = data.note || '';

    await this.prisma.$executeRaw`
      INSERT INTO public.invoice_reminders (id, invoice_id, channel, sent_at, by_name, note, created_at, updated_at)
      VALUES (gen_random_uuid(), ${id}, ${channel}, NOW(), ${byName}, ${note}, NOW(), NOW())
    `;

    // Cập nhật số lần nhắc trên member và phát thông báo in-app
    const existing = await this.getInvoiceById(id);
    if (existing.invoice.memberId) {
      await this.prisma.$executeRaw`
        UPDATE public.members
        SET reminder_count = COALESCE(reminder_count, 0) + 1, last_reminder = NOW(), updated_at = NOW()
        WHERE id = ${existing.invoice.memberId}
      `.catch(() => null);

      try {
        const memberRows = await this.prisma.$queryRaw<any[]>`
          SELECT id, user_id, name, email FROM public.members WHERE id = ${existing.invoice.memberId} LIMIT 1
        `.catch(() => [] as any[]);

        const targetUserId = memberRows[0]?.user_id;
        if (targetUserId) {
          const formattedAmount = Number(existing.invoice.amount || 0).toLocaleString('vi-VN');
          const notifTitle = `[Nhắc nhở] Quá hạn thanh toán hội phí`;
          const notifBody = `Hóa đơn ${existing.invoice.invoiceNo || id} (Số tiền: ${formattedAmount} đ) của Quý hội viên đã quá hạn thanh toán ngày ${existing.invoice.dueDate || 'gần nhất'}. Vui lòng kiểm tra và hoàn tất thanh toán.`;
          const dedupeKey = `reminder-${id}-${Date.now()}`;
          const safeDisplayData = JSON.stringify({
            title: notifTitle,
            body: notifBody,
            invoiceId: id,
            invoiceNo: existing.invoice.invoiceNo || id,
            amount: Number(existing.invoice.amount || 0),
            dueDate: existing.invoice.dueDate,
            type: 'invoice_reminder',
            targetRoute: `/fees/${id}`,
          });

          // 1. Business notifications (Priority 'critical' satisfies DB check constraint)
          await this.prisma.$executeRawUnsafe(`
            INSERT INTO public.business_notifications (
              id, recipient_user_id, source_domain, source_record_id, event_kind, notification_kind,
              title_key, body_key, safe_display_data, priority, status, dedupe_key, app_scope, target_app, created_at, updated_at
            ) VALUES (
              gen_random_uuid(), $1, 'finance', $2, 'invoice_reminder', 'overdue_payment_reminder',
              $3, $4, $5::jsonb, 'critical', 'delivered', $6, 'all', 'all', NOW(), NOW()
            )
          `, targetUserId, id, notifTitle, notifBody, safeDisplayData, dedupeKey).catch((err) => {
            console.warn('[addInvoiceReminder] Failed to insert business_notifications:', err?.message);
          });

          // 2. Association member_notifications (insert by memberId and targetUserId so both portals receive it)
          const memberDbId = memberRows[0]?.id;
          const memberCode = memberRows[0]?.code;
          if (memberDbId) {
            await this.prisma.$executeRawUnsafe(`
              INSERT INTO public.member_notifications (
                id, recipient_id, title, body, read, dismissed, ref_type, ref_id, created_at
              ) VALUES (
                gen_random_uuid(), $1, $2, $3, false, false, 'invoice', $4, NOW()
              )
            `, String(memberDbId), notifTitle, notifBody, id).catch(() => {});
          }
          if (targetUserId) {
            await this.prisma.$executeRawUnsafe(`
              INSERT INTO public.member_notifications (
                id, recipient_id, title, body, read, dismissed, ref_type, ref_id, created_at
              ) VALUES (
                gen_random_uuid(), $1, $2, $3, false, false, 'invoice', $4, NOW()
              )
            `, String(targetUserId), notifTitle, notifBody, id).catch(() => {});
          }

          // 3. Đẩy template tin nhắn tương tác (Actionable template) kèm VietQR trực tiếp vào tin nhắn
          const invoiceAmount = Number(existing.invoice.amount || 0);
          const invoiceNo = existing.invoice.invoiceNo || id;
          const vietQrUrl = `https://img.vietqr.io/image/MB-0988888888-compact2.png?amount=${invoiceAmount}&addInfo=${encodeURIComponent(invoiceNo)}`;
          const actionMsg = `[action:payment|amount:${invoiceAmount}|invoice:${invoiceNo}|qr:${vietQrUrl}|due:${existing.invoice.dueDate || 'Hôm nay'}|desc:${encodeURIComponent(notifBody)}]`;

          if (memberCode) {
            await this.prisma.$executeRaw`
              INSERT INTO public.messages (id, from_id, to_id, text, created_at)
              VALUES (gen_random_uuid(), 'ADMIN', ${String(memberCode).toLowerCase()}, ${actionMsg}, NOW())
            `.catch(() => {});
          }
        }
      } catch (e: any) {
        console.warn('[addInvoiceReminder] Failed to push notifications:', e?.message);
      }
    }

    return this.getInvoiceById(id);
  }

  async createInvoice(data: { memberId: string; year?: number; amount?: number; dueDate?: string }) {
    const year = data.year || new Date().getFullYear();
    const amount = BigInt(Math.round(data.amount || 15000000));
    const dueDate = data.dueDate || `${year}-12-31`;
    const lastInv = await this.prisma.$queryRaw<any[]>`
      SELECT id FROM public.invoices WHERE id ~ '^[0-9]+$' ORDER BY CAST(id AS BIGINT) DESC LIMIT 1
    `.catch(() => []);
    const id = lastInv.length > 0 ? (BigInt(lastInv[0].id) + 1n).toString() : '50001';

    await this.prisma.$executeRaw`
      INSERT INTO public.invoices (id, member_id, invoice_no, year, amount, due_date, status, created_at, updated_at)
      VALUES (${id}, ${data.memberId}, ${id}, ${year}, ${amount}, ${dueDate}::date, 'unpaid', NOW(), NOW())
    `;

    const created = await this.getInvoiceById(id);
    return created.invoice;
  }

  async deleteInvoice(id: string) {
    await this.prisma.$executeRaw`
      DELETE FROM public.invoice_reminders WHERE invoice_id = ${id}
    `.catch(() => null);
    await this.prisma.$executeRaw`
      DELETE FROM public.invoices WHERE id = ${id}
    `;
    return { success: true, message: `Hóa đơn #${id} đã được xóa thành công` };
  }

  async checkIsAdmin(userId: string, assocId?: string): Promise<boolean> {
    if (!userId) return false;
    if (userId === 'mock-admin-id' || userId === '00000000-0000-0000-0000-000000000000') {
      return true;
    }
    const roles = await this.prisma.user_roles
      .findMany({ where: { user_id: userId } })
      .catch(() => [] as any[]);
    if (roles.some((r: any) => r.role === 'platform_admin' || r.role === 'tenant_admin' || r.role === 'admin')) {
      return true;
    }
    try {
      let mems: any[] = [];
      if (assocId) {
        mems = await this.prisma.$queryRaw<any[]>`
          SELECT role FROM public.memberships 
          WHERE user_id = ${userId}::uuid AND association_id = ${assocId}::uuid
        `;
      } else {
        mems = await this.prisma.$queryRaw<any[]>`
          SELECT role FROM public.memberships 
          WHERE user_id = ${userId}::uuid
        `;
      }
      return mems.some(
        (m: any) => m.role === 'admin' || m.role === 'association_admin' || m.role === 'owner',
      );
    } catch {
      return false;
    }
  }

  private dismissedNotifIds = new Set<string>();

  // ── CRM NOTIFICATIONS ────────────────────────────────────────────────────────

  async listNotifications(userId: string, associationId?: string, appScope?: string) {
    const notifs: any[] = [];
    const seenMap = new Set<string>();
    const filterScope = appScope && appScope !== 'all' ? appScope : null;
    const isAdmin = await this.checkIsAdmin(userId, associationId);

    const dismissedIds = new Set<string>(this.dismissedNotifIds);
    try {
      const dRows = await this.prisma.$queryRawUnsafe<any[]>(`
        SELECT id FROM public.dismissed_notifications LIMIT 1000
      `).catch(() => []);
      for (const d of dRows) {
        if (d.id) dismissedIds.add(String(d.id));
      }
    } catch {}

    // 1. Query broadcast notifications from public.notifications
    try {
      let rows: any[] = [];
      if (filterScope) {
        rows = await this.prisma.$queryRaw<any[]>`
          SELECT id, code, title, body, audience, channel, status, sent_at, reach, association_id, app_scope, target_app, target_channel, pushed_to_messages, created_at
          FROM public.notifications
          WHERE (${!associationId} OR association_id = ${associationId}::uuid OR association_id IS NULL)
            AND (app_scope = ${filterScope} OR target_app = ${filterScope})
          ORDER BY created_at DESC
          LIMIT 60
        `.catch(() => []);
      } else {
        rows = await this.prisma.$queryRaw<any[]>`
          SELECT id, code, title, body, audience, channel, status, sent_at, reach, association_id, app_scope, target_app, target_channel, pushed_to_messages, created_at
          FROM public.notifications
          WHERE (${!associationId} OR association_id = ${associationId}::uuid OR association_id IS NULL)
          ORDER BY created_at DESC
          LIMIT 60
        `.catch(() => []);
      }

      for (const r of rows) {
        // Staff-only notifications are only visible to admins
        if (r.audience === 'staff' && !isAdmin) {
          continue;
        }

        const notifId = r.code || r.id;
        if (dismissedIds.has(String(notifId)) || dismissedIds.has(String(r.id)) || (r.code && dismissedIds.has(String(r.code)))) {
          continue;
        }

        const item = {
          id: r.code || r.id,
          code: r.code,
          rawId: r.id,
          title: r.title,
          body: r.body || '',
          audience: r.audience || 'all',
          channel: r.channel || 'inapp',
          appScope: r.app_scope || r.target_app || 'crm',
          targetApp: r.target_app || r.app_scope || 'crm',
          targetChannel: r.target_channel || null,
          pushedToMessages: Boolean(r.pushed_to_messages || (r.target_channel && r.target_channel !== 'none')),
          sentAt: r.sent_at ? new Date(r.sent_at).toISOString() : (r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString()),
          reach: r.reach || 0,
          status: r.status || 'sent',
        };
        const key = `${item.title}:${item.body}`;
        if (!seenMap.has(key)) {
          seenMap.add(key);
          notifs.push(item);
        }
      }
    } catch (e) {
      console.warn('Error querying public.notifications:', e);
    }

    // 2. Query personal business notifications for this user (only admins see association-wide approval events)
    try {
      if (userId) {
        let bzRows: any[] = [];
        if (isAdmin) {
          if (filterScope) {
            bzRows = await this.prisma.$queryRaw<any[]>`
              SELECT id, title_key, body_key, safe_display_data, action_kind, action_target, created_at, status, app_scope, target_app
              FROM public.business_notifications
              WHERE (recipient_user_id = ${userId}::uuid OR source_domain = 'association')
                AND (app_scope = ${filterScope} OR target_app = ${filterScope})
              ORDER BY created_at DESC
              LIMIT 40
            `.catch(() => []);
          } else {
            bzRows = await this.prisma.$queryRaw<any[]>`
              SELECT id, title_key, body_key, safe_display_data, action_kind, action_target, created_at, status, app_scope, target_app
              FROM public.business_notifications
              WHERE (recipient_user_id = ${userId}::uuid OR source_domain = 'association')
              ORDER BY created_at DESC
              LIMIT 40
            `.catch(() => []);
          }
        } else {
          // Regular user only sees notifications addressed explicitly to their user ID
          if (filterScope) {
            bzRows = await this.prisma.$queryRaw<any[]>`
              SELECT id, title_key, body_key, safe_display_data, action_kind, action_target, created_at, status, app_scope, target_app
              FROM public.business_notifications
              WHERE recipient_user_id = ${userId}::uuid
                AND source_domain != 'association'
                AND (app_scope = ${filterScope} OR target_app = ${filterScope})
              ORDER BY created_at DESC
              LIMIT 40
            `.catch(() => []);
          } else {
            bzRows = await this.prisma.$queryRaw<any[]>`
              SELECT id, title_key, body_key, safe_display_data, action_kind, action_target, created_at, status, app_scope, target_app
              FROM public.business_notifications
              WHERE recipient_user_id = ${userId}::uuid
                AND source_domain != 'association'
              ORDER BY created_at DESC
              LIMIT 40
            `.catch(() => []);
          }
        }

        for (const bz of bzRows) {
          if (dismissedIds.has(String(bz.id))) continue;
          const safe = bz.safe_display_data || {};
          const title = safe.title || bz.title_key || 'Thông báo';
          const body = safe.body || bz.body_key || '';
          const key = `${title}:${body}`;
          const scope = bz.app_scope || bz.target_app || (bz.source_domain === 'association' ? 'crm' : 'association_app');
          if (!seenMap.has(key)) {
            seenMap.add(key);
            notifs.push({
              id: bz.id,
              title,
              body,
              audience: isAdmin ? 'staff' : 'members',
              channel: 'inapp',
              appScope: scope,
              targetApp: scope,
              sentAt: bz.created_at ? new Date(bz.created_at).toISOString() : new Date().toISOString(),
              reach: 1,
              status: 'sent',
              targetRoute: bz.action_target?.route || bz.action_target?.targetRoute || '/notifications',
            });
          }
        }
      }
    } catch (e) {
      console.warn('Error querying business_notifications:', e);
    }

    // 3. Fallback check: If there are pending members, ONLY show to CRM admins
    if (isAdmin && (!filterScope || filterScope === 'crm')) {
      try {
        const pendingMembers = await this.prisma.$queryRaw<any[]>`
          SELECT id, name, contact, phone, email, about, joined_at, created_at
          FROM public.members
          WHERE status = 'pending'
          ORDER BY created_at DESC
          LIMIT 20
        `.catch(() => []);

        for (const m of pendingMembers) {
          const pendingId = `PENDING-MB-${m.id}`;
          if (dismissedIds.has(pendingId) || dismissedIds.has(String(m.id))) continue;
          const title = `Đăng ký hội viên mới: ${m.contact || m.name} - ${m.name}`;
          const body = `Ứng viên ${m.contact || m.name} (${m.phone || m.email || 'CLB CEO 1983'}) vừa nộp hồ sơ xin gia nhập. Bấm để duyệt ngay.`;
          const key = `${title}:${body}`;
          if (!seenMap.has(key)) {
            seenMap.add(key);
            notifs.push({
              id: pendingId,
              title,
              body,
              audience: 'staff',
              channel: 'inapp',
              appScope: 'crm',
              targetApp: 'crm',
              sentAt: m.created_at ? new Date(m.created_at).toISOString() : (m.joined_at ? new Date(m.joined_at).toISOString() : new Date().toISOString()),
              reach: 1,
              status: 'sent',
              targetRoute: '/members?status=pending',
            });
          }
        }
      } catch (e) {
        console.warn('Error querying pending members:', e);
      }
    }

    // 4. Sort all notifications by sentAt DESC
    return notifs.sort((a, b) => new Date(b.sentAt || 0).getTime() - new Date(a.sentAt || 0).getTime());
  }

  async createNotification(userId: string, data: any) {
    const code = `NTF-${Date.now().toString(36).toUpperCase()}`;
    const now = new Date();
    const title = String(data.title || '').trim();
    const body = String(data.body || '').trim();
    const audience = String(data.audience || 'all');
    const channel = String(data.channel || 'inapp');
    const appScope = String(data.appScope || data.targetApp || 'all');
    const status = String(data.status || 'sent');
    const assocId = data.associationId || null;
    const targetUserId = data.targetUserId || data.userId || null;
    const department = String(data.department || data.committee || data.channelCode || '').trim();
    const targetChannel = String(data.targetChatChannel || data.targetChannel || '').trim();
    const pushedToMessages = Boolean(data.pushedToMessages || (targetChannel && targetChannel !== 'none'));

    const sentAtStr = status === 'sent' ? now.toISOString() : null;

    await this.prisma.$executeRawUnsafe(`
      INSERT INTO public.notifications (
        id, code, title, body, audience, channel, status, sent_at, reach, association_id, app_scope, target_app, target_channel, pushed_to_messages, created_at, updated_at
      ) VALUES (
        gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, 0, $8, $9, $10, $11, $12, NOW(), NOW()
      )
    `, code, title, body, audience, channel, status, sentAtStr, assocId, appScope, appScope, targetChannel || null, pushedToMessages);

    if (status === 'sent') {
      try {
        await this.dispatchBroadcastToMembersAndUsers(
          code,
          title,
          body,
          audience,
          appScope,
          assocId,
          targetUserId,
          department,
        );
      } catch (err) {
        console.warn('Failed to broadcast CRM notification:', err);
      }
    }

    return {
      id: code,
      title,
      body,
      audience,
      channel,
      appScope,
      targetApp: appScope,
      targetUserId,
      department,
      targetChannel: targetChannel || null,
      pushedToMessages,
      sentAt: status === 'sent' ? now.toISOString() : null,
      reach: 0,
      status,
    };
  }

  private async dispatchBroadcastToMembersAndUsers(
    code: string,
    title: string,
    body: string,
    audience: string,
    appScope: string,
    associationId?: string | null,
    targetUserId?: string | null,
    department?: string | null,
  ) {
    const userIdsSet = new Set<string>();
    const memberRecipientIds = new Set<string>();
    const nowIso = new Date().toISOString();

    // Xác định kênh chuyên trách theo phân luồng tác vụ CRM
    let targetChannel = 'channel_media';
    let channelLabel = 'Kênh Truyền Thông Hiệp Hội';
    const deptLower = `${department || ''} ${audience || ''}`.toLowerCase();

    if (deptLower.includes('thu_ky') || deptLower.includes('secretariat') || deptLower.includes('dieu_hanh') || deptLower.includes('bch')) {
      targetChannel = 'channel_secretariat';
      channelLabel = 'Kênh Ban Thư Ký & Ban Điều Hành';
    } else if (deptLower.includes('xuc_tien') || deptLower.includes('promotion')) {
      targetChannel = 'channel_promotion';
      channelLabel = 'Kênh Xúc Tiến Giao Thương';
    } else if (deptLower.includes('deal') || deptLower.includes('b2b') || deptLower.includes('co_hoi')) {
      targetChannel = 'channel_deals';
      channelLabel = 'Kênh Cơ Hội & Deal B2B';
    } else if (deptLower.includes('event') || deptLower.includes('su_kien') || deptLower.includes('hoi_nghi')) {
      targetChannel = 'channel_events';
      channelLabel = 'Kênh Sự Kiện & Hội Nghị';
    }

    // 1. NẾU LÀ THÔNG BÁO CÁ NHÂN (TARGETED)
    if (targetUserId) {
      userIdsSet.add(targetUserId);
      memberRecipientIds.add(targetUserId);

      // Tra cứu member code nếu có
      const memRows = await this.prisma.$queryRaw<any[]>`
        SELECT id, code, user_id FROM public.members WHERE user_id = ${targetUserId}::uuid OR id::text = ${targetUserId} LIMIT 1
      `.catch(() => []);
      const memCode = memRows[0]?.code;

      const directMsgText = `🔔 [THÔNG BÁO HỆ THỐNG] ${title}\n\n${body}`;

      // Bắn trực tiếp vào public.messages của user
      await this.prisma.$executeRawUnsafe(`
        INSERT INTO public.messages (id, from_id, to_id, text, created_at)
        VALUES (gen_random_uuid(), 'admin', $1, $2, NOW())
      `, targetUserId, directMsgText).catch(() => {});

      if (memCode && memCode !== targetUserId) {
        await this.prisma.$executeRawUnsafe(`
          INSERT INTO public.messages (id, from_id, to_id, text, created_at)
          VALUES (gen_random_uuid(), 'admin', $1, $2, NOW())
        `, String(memCode).toLowerCase(), directMsgText).catch(() => {});
      }

      // Realtime push notification & message event
      this.gateway.emitToRoom(`user:${targetUserId}`, 'dm:message_received', {
        id: `msg-${Date.now()}`,
        from_id: 'admin',
        to_id: targetUserId,
        text: directMsgText,
        created_at: nowIso,
      });
      this.gateway.emitNotification(targetUserId, {
        id: code,
        title,
        body,
        sentAt: nowIso,
        targetApp: appScope,
      });
    } else {
      // 2. NẾU LÀ THÔNG BÁO CHUNG (BROADCAST) HOẶC PHÂN BAN
      const broadcastMsgText = `📢 [${channelLabel.toUpperCase()}] ${title}\n\n${body}`;

      // Ghi vào kênh chuyên trách trong public.messages
      await this.prisma.$executeRawUnsafe(`
        INSERT INTO public.messages (id, from_id, to_id, text, created_at)
        VALUES (gen_random_uuid(), 'admin', $1, $2, NOW())
      `, targetChannel, broadcastMsgText).catch(() => {});

      // Ghi thêm vào kênh chung group_ceo1983_broadcast
      await this.prisma.$executeRawUnsafe(`
        INSERT INTO public.messages (id, from_id, to_id, text, created_at)
        VALUES (gen_random_uuid(), 'admin', 'group_ceo1983_broadcast', $1, NOW())
      `, broadcastMsgText).catch(() => {});

      // Phát realtime socket cho toàn bộ app
      this.gateway.emitToAll('dm:message_received', {
        id: `msg-${Date.now()}`,
        from_id: 'admin',
        to_id: targetChannel,
        text: broadcastMsgText,
        created_at: nowIso,
      });
      this.gateway.emitToAll('dm:thread_updated', {
        peerCode: targetChannel,
        last: broadcastMsgText,
        time: nowIso,
      });

      // Thu thập danh sách hội viên nhận thông báo
      try {
        const members = await this.prisma.$queryRaw<any[]>`
          SELECT id, code, user_id FROM public.members
          WHERE (${!associationId} OR association_id = ${associationId}::uuid OR association_id IS NULL)
        `.catch(() => []);
        for (const m of members) {
          if (m.id) memberRecipientIds.add(String(m.id));
          if (m.code) memberRecipientIds.add(String(m.code));
          if (m.user_id) {
            userIdsSet.add(String(m.user_id));
            memberRecipientIds.add(String(m.user_id));
          }
        }
      } catch (e) {
        console.warn('dispatchBroadcast: failed querying members:', e);
      }

      if (appScope !== 'association_app') {
        try {
          const profiles = await this.prisma.$queryRaw<any[]>`
            SELECT id FROM public.profiles LIMIT 2000
          `.catch(() => []);
          for (const p of profiles) {
            if (p.id) userIdsSet.add(String(p.id));
          }
        } catch (e) {
          console.warn('dispatchBroadcast: failed querying profiles:', e);
        }
      }
    }

    // Insert into member_notifications for association members
    if (appScope === 'association_app' || appScope === 'all') {
      for (const recipientId of memberRecipientIds) {
        await this.prisma.$executeRawUnsafe(`
          INSERT INTO public.member_notifications (
            id, recipient_id, title, body, read, dismissed, ref_type, ref_id, created_at
          ) VALUES (
            gen_random_uuid(), $1, $2, $3, false, false, 'system', $4, NOW()
          )
        `, recipientId, title, body, code).catch(() => {});
      }
    }

    // Insert into business_notifications for all targeted user IDs
    for (const uId of userIdsSet) {
      const dedupeKey = `crm-notif-${code}-${uId}`;
      await this.prisma.$executeRawUnsafe(`
        INSERT INTO public.business_notifications (
          id, recipient_user_id, source_domain, source_record_id, event_kind, notification_kind,
          title_key, body_key, safe_display_data, priority, status, dedupe_key, app_scope, target_app, created_at, updated_at
        ) VALUES (
          gen_random_uuid(), $1::uuid, 'crm', $2, 'crm_broadcast', 'system_broadcast',
          $3, $4, $5::jsonb, 'normal', 'delivered', $6, $7, $8, NOW(), NOW()
        ) ON CONFLICT (dedupe_key) DO NOTHING
      `, uId, code, title, body, JSON.stringify({ title, body, crmNotificationCode: code, channel: targetChannel }), dedupeKey, appScope, appScope).catch(() => {});
    }

    this.gateway.emitToAll('notification:new', {
      id: code,
      title,
      body,
      audience,
      channel: targetChannel,
      appScope,
      targetApp: appScope,
      sentAt: nowIso,
    });
    this.gateway.emitToAll('notification:count', {});
    this.gateway.emitToAll('member:notification_new', {
      id: code,
      title,
      body,
      channel: targetChannel,
      appScope,
      sentAt: nowIso,
    });
  }

  async updateNotification(id: string, data: any) {
    const updates: string[] = ['updated_at = NOW()'];
    if (data.title) updates.push(`title = '${String(data.title).replace(/'/g, "''")}'`);
    if (data.body !== undefined) updates.push(`body = '${String(data.body || '').replace(/'/g, "''")}'`);
    if (data.audience) updates.push(`audience = '${String(data.audience)}'`);
    if (data.channel) updates.push(`channel = '${String(data.channel)}'`);
    if (data.appScope || data.targetApp) {
      const scope = String(data.appScope || data.targetApp);
      updates.push(`app_scope = '${scope}'`);
      updates.push(`target_app = '${scope}'`);
    }
    if (data.status) {
      updates.push(`status = '${String(data.status)}'`);
      if (data.status === 'sent') updates.push(`sent_at = NOW()`);
    }

    await this.prisma.$executeRawUnsafe(`
      UPDATE public.notifications
      SET ${updates.join(', ')}
      WHERE code = '${id}' OR id::text = '${id}'
    `);

    return { id, ...data };
  }

  async sendNotification(id: string) {
    const now = new Date();
    await this.prisma.$executeRawUnsafe(`
      UPDATE public.notifications
      SET status = 'sent', sent_at = NOW(), updated_at = NOW()
      WHERE code = $1 OR id::text = $1
    `, id);

    const rows = await this.prisma.$queryRawUnsafe<any[]>(`
      SELECT id, code, title, body, audience, channel, status, sent_at, reach, association_id, app_scope, target_app
      FROM public.notifications
      WHERE code = $1 OR id::text = $1
      LIMIT 1
    `, id).catch(() => []);

    const notif = rows[0] || { id, status: 'sent', sentAt: now.toISOString() };
    const appScope = notif.app_scope || notif.target_app || 'crm';
    const notifCode = notif.code || notif.id || id;
    const notifTitle = notif.title || 'Thông báo mới';
    const notifBody = notif.body || '';
    const audience = notif.audience || 'all';

    // Broadcast to members and users
    try {
      await this.dispatchBroadcastToMembersAndUsers(
        notifCode,
        notifTitle,
        notifBody,
        audience,
        appScope,
        notif.association_id,
      );
    } catch (e) {
      console.warn('sendNotification dispatch error:', e);
    }

    return {
      id: notifCode,
      title: notifTitle,
      body: notifBody,
      audience,
      channel: notif.channel || 'inapp',
      appScope,
      targetApp: appScope,
      sentAt: now.toISOString(),
      reach: notif.reach || 0,
      status: 'sent',
    };
  }

  async deleteNotification(id: string) {
    if (!id) return { ok: true };
    this.dismissedNotifIds.add(id);

    try {
      await this.prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS public.dismissed_notifications (
          id text PRIMARY KEY,
          dismissed_at timestamptz DEFAULT NOW()
        )
      `).catch(() => null);

      await this.prisma.$executeRawUnsafe(`
        INSERT INTO public.dismissed_notifications (id) VALUES ($1)
        ON CONFLICT (id) DO NOTHING
      `, id).catch(() => null);
    } catch {}

    await this.prisma.$executeRawUnsafe(`
      DELETE FROM public.notifications
      WHERE code = $1 OR id::text = $1
    `, id).catch(() => null);

    await this.prisma.$executeRawUnsafe(`
      DELETE FROM public.business_notifications
      WHERE id::text = $1
    `, id).catch(() => null);

    return { ok: true };
  }

  async pushNotificationToMessages(userId: string, id: string, channelCode?: string) {
    const isAdmin = await this.checkIsAdmin(userId);
    if (!isAdmin) {
      throw new ForbiddenException('Chỉ quản trị viên mới có quyền đẩy thông báo vào tin nhắn');
    }
    const targetChannel = channelCode || 'channel_media';

    // Find notification
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT id, code, title, body FROM public.notifications
      WHERE id::text = ${id} OR code = ${id}
      LIMIT 1
    `.catch(() => []);

    let title = 'Thông báo Ban Điều Hành';
    let body = '';
    let notifCode = id;
    if (rows.length > 0) {
      title = rows[0].title || title;
      body = rows[0].body || '';
      notifCode = rows[0].code || rows[0].id;
    }

    // Update notifications table
    await this.prisma.$executeRawUnsafe(`
      UPDATE public.notifications
      SET pushed_to_messages = true, target_channel = $1, updated_at = NOW()
      WHERE id::text = $2 OR code = $2
    `, targetChannel, id).catch(() => {});

    // Also update business_notifications if matching
    await this.prisma.$executeRawUnsafe(`
      UPDATE public.business_notifications
      SET pushed_to_messages = true, updated_at = NOW()
      WHERE id::text = $1 OR source_record_id = $1
    `, id).catch(() => {});

    // Post to public.messages
    const channelLabelMap: Record<string, string> = {
      channel_media: 'Kênh Truyền Thông Hiệp Hội',
      channel_promotion: 'Kênh Xúc Tiến Giao Thương',
      channel_secretariat: 'Kênh Ban Thư Ký & Ban Điều Hành',
      channel_deals: 'Kênh Cơ Hội & Deal B2B',
      channel_events: 'Kênh Sự Kiện & Hội Nghị',
    };
    const channelLabel = channelLabelMap[targetChannel] || 'Kênh Chính Thức CLB';
    const broadcastMsgText = `📢 [${channelLabel.toUpperCase()}] ${title}\n\n${body}`;

    await this.prisma.$executeRawUnsafe(`
      INSERT INTO public.messages (id, from_id, to_id, text, created_at)
      VALUES (gen_random_uuid(), 'admin', $1, $2, NOW())
    `, targetChannel, broadcastMsgText).catch(() => {});

    await this.prisma.$executeRawUnsafe(`
      INSERT INTO public.messages (id, from_id, to_id, text, created_at)
      VALUES (gen_random_uuid(), 'admin', 'group_ceo1983_broadcast', $1, NOW())
    `, broadcastMsgText).catch(() => {});

    const nowIso = new Date().toISOString();
    this.gateway.emitToAll('dm:message_received', {
      id: `msg-${Date.now()}`,
      from_id: 'admin',
      to_id: targetChannel,
      text: broadcastMsgText,
      created_at: nowIso,
    });
    this.gateway.emitToAll('dm:thread_updated', {
      peerCode: targetChannel,
      last: broadcastMsgText,
      time: nowIso,
    });

    return {
      ok: true,
      id: notifCode,
      pushedToMessages: true,
      targetChannel,
    };
  }

  // ── Email Marketing Campaigns ─────────────────────────────────────
  async listCampaigns() {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT * FROM public.email_campaigns
      ORDER BY created_at DESC
      LIMIT 100
    `.catch(() => []);
    return rows.map((c) => ({
      id: c.code || c.id,
      name: c.name,
      subject: c.subject || '',
      audience: c.audience || '',
      sent: Number(c.sent || 0),
      opened: Number(c.opened || 0),
      clicked: Number(c.clicked || 0),
      sentAt: c.sent_at ? (c.sent_at instanceof Date ? c.sent_at.toISOString().slice(0, 10) : String(c.sent_at).slice(0, 10)) : '—',
      status: c.status || 'draft',
    }));
  }

  async createCampaign(data: any) {
    const code = `CMP-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const sentAt = data.time || (data.status === 'sent' ? new Date().toISOString().slice(0, 10) : null);
    const assocId = data.associationId || 'c1983000-0000-4000-8000-000000001983';

    await this.prisma.$executeRawUnsafe(`
      INSERT INTO public.email_campaigns (
        id, code, name, subject, audience, status, sent_at, sent, opened, clicked, association_id, created_at, updated_at
      ) VALUES (
        gen_random_uuid(), $1, $2, $3, $4, $5, $6, 0, 0, 0, $7::uuid, NOW(), NOW()
      )
    `,
      code,
      data.name,
      data.subject || '',
      data.audience || '',
      data.status || 'draft',
      sentAt,
      assocId,
    );

    return {
      id: code,
      name: data.name,
      subject: data.subject || '',
      audience: data.audience || '',
      sent: 0,
      opened: 0,
      clicked: 0,
      sentAt: sentAt || '—',
      status: data.status || 'draft',
    };
  }

  async deleteCampaign(id: string) {
    await this.prisma.$executeRaw`
      DELETE FROM public.email_campaigns WHERE code = ${id} OR id::text = ${id}
    `;
    return { ok: true };
  }

  // ── TRANSACTIONS / FINANCE ──────────────────────────────────────────

  async listTransactions(type?: string) {
    try {
      const rows = await this.prisma.$queryRaw<any[]>`
        SELECT * FROM public.transactions
        ORDER BY date DESC, created_at DESC
      `;
      let res = rows.map((tx) => ({
        id: tx.code || String(tx.id),
        date: tx.date
          ? tx.date instanceof Date
            ? tx.date.toISOString().slice(0, 10)
            : String(tx.date).slice(0, 10)
          : '',
        type: tx.type,
        category: tx.category || 'Khác',
        description: tx.description ?? '',
        amount: Number(tx.amount ?? 0),
        method: tx.method || 'bank',
        status: tx.status || 'completed',
        advanceAmount: Number(tx.advance_amount ?? 0),
        refundAmount: Number(tx.refund_amount ?? 0),
        invoiceUrl: tx.invoice_url ?? '',
        recipient: tx.recipient ?? '',
      }));
      if (type) {
        res = res.filter((t) => t.type === type);
      }
      return res;
    } catch (err) {
      console.error('[AdminService] listTransactions error:', err);
      return [];
    }
  }

  async createTransaction(body: any) {
    const isIncome = body.type === 'income';
    const prefix = isIncome ? 'PT' : 'PC';
    const rand = Math.floor(100 + Math.random() * 900);
    const code = body.id || `${prefix}-${new Date().getFullYear()}-${rand}`;
    const dateVal = body.date || new Date().toISOString().slice(0, 10);

    await this.prisma.$executeRawUnsafe(
      `
      INSERT INTO public.transactions (
        id, code, date, type, category, description, amount, method, status,
        advance_amount, refund_amount, invoice_url, recipient, created_at, updated_at
      ) VALUES (
        gen_random_uuid(), $1, $2::date, $3, $4, $5, $6::bigint, $7, $8,
        $9::bigint, $10::bigint, $11, $12, now(), now()
      )
    `,
      code,
      dateVal,
      body.type || 'income',
      body.category || 'Chung',
      body.description || '',
      Number(body.amount || 0),
      body.method || 'bank',
      body.status || 'completed',
      Number(body.advanceAmount || 0),
      Number(body.refundAmount || 0),
      body.invoiceUrl || '',
      body.recipient || '',
    );

    return {
      id: code,
      date: dateVal,
      type: body.type || 'income',
      category: body.category || 'Chung',
      description: body.description || '',
      amount: Number(body.amount || 0),
      method: body.method || 'bank',
      status: body.status || 'completed',
      advanceAmount: Number(body.advanceAmount || 0),
      refundAmount: Number(body.refundAmount || 0),
      invoiceUrl: body.invoiceUrl || '',
      recipient: body.recipient || '',
    };
  }

  async updateTransaction(id: string, body: any) {
    await this.prisma.$executeRawUnsafe(
      `
      UPDATE public.transactions SET
        date = COALESCE($2::date, date),
        category = COALESCE($3, category),
        description = COALESCE($4, description),
        amount = COALESCE($5::bigint, amount),
        method = COALESCE($6, method),
        status = COALESCE($7, status),
        advance_amount = COALESCE($8::bigint, advance_amount),
        refund_amount = COALESCE($9::bigint, refund_amount),
        invoice_url = COALESCE($10, invoice_url),
        recipient = COALESCE($11, recipient),
        updated_at = now()
      WHERE code = $1 OR id::text = $1
    `,
      id,
      body.date || null,
      body.category || null,
      body.description !== undefined ? body.description : null,
      body.amount !== undefined ? Number(body.amount) : null,
      body.method || null,
      body.status || null,
      body.advanceAmount !== undefined ? Number(body.advanceAmount) : null,
      body.refundAmount !== undefined ? Number(body.refundAmount) : null,
      body.invoiceUrl !== undefined ? body.invoiceUrl : null,
      body.recipient !== undefined ? body.recipient : null,
    );

    return { ok: true, id };
  }

  async deleteTransaction(id: string) {
    await this.prisma.$executeRaw`
      DELETE FROM public.transactions WHERE code = ${id} OR id::text = ${id}
    `;
    return { ok: true };
  }

  // ── CRM PERMISSION MATRIX (RBAC) ──────────────────────────────────────────

  async getPermissionMatrix() {
    const rows = await this.prisma.$queryRaw<{ value: any }[]>`
      SELECT value FROM public.app_settings WHERE key = 'crm_permission_matrix' LIMIT 1
    `.catch(() => []);

    if (rows.length && rows[0]?.value) {
      const val = rows[0].value;
      if (val?.categories && Array.isArray(val.categories) && val.categories.length > 0) return val;
      if (Array.isArray(val) && val.length > 0) return { rows: val, categories: val };
      if (val?.rows && Array.isArray(val.rows) && val.rows.length > 0) return val;
    }

    // Default 8-role permission matrix if not configured in DB
    return {
      rows: [
        {
          feature: { vi: 'Quản trị hệ thống & Cấu hình nền tảng', en: 'Platform & system management' },
          platform_admin: 'full',
          admin: 'scoped',
          tong_thu_ky: 'none',
          truong_ban_thanh_vien: 'none',
          truong_ban_tai_chinh: 'none',
          truong_ban_truyen_thong: 'none',
          truong_ban_xuc_tien: 'none',
          member: 'none',
        },
        {
          feature: { vi: 'Họp phòng ban & Lịch Zoom', en: 'Department meetings & Zoom' },
          platform_admin: 'full',
          admin: 'full',
          tong_thu_ky: 'full',
          truong_ban_thanh_vien: 'scoped',
          truong_ban_tai_chinh: 'scoped',
          truong_ban_truyen_thong: 'scoped',
          truong_ban_xuc_tien: 'scoped',
          member: 'own',
        },
        {
          feature: { vi: 'Quản lý hội viên & Phân ban', en: 'Members & committee assignment' },
          platform_admin: 'full',
          admin: 'full',
          tong_thu_ky: 'scoped',
          truong_ban_thanh_vien: 'full',
          truong_ban_tai_chinh: 'scoped',
          truong_ban_truyen_thong: 'scoped',
          truong_ban_xuc_tien: 'scoped',
          member: 'own',
        },
        {
          feature: { vi: 'Thu chi, Tạm ứng & Hóa đơn', en: 'Finance, advances & invoices' },
          platform_admin: 'full',
          admin: 'full',
          tong_thu_ky: 'scoped',
          truong_ban_thanh_vien: 'scoped',
          truong_ban_tai_chinh: 'full',
          truong_ban_truyen_thong: 'scoped',
          truong_ban_xuc_tien: 'scoped',
          member: 'own',
        },
        {
          feature: { vi: 'Sự kiện, Điểm danh QR & Xếp chỗ VIP', en: 'Events, check-in QR & VIP seating' },
          platform_admin: 'full',
          admin: 'full',
          tong_thu_ky: 'scoped',
          truong_ban_thanh_vien: 'scoped',
          truong_ban_tai_chinh: 'scoped',
          truong_ban_truyen_thong: 'full',
          truong_ban_xuc_tien: 'scoped',
          member: 'own',
        },
        {
          feature: { vi: 'Sàn cơ hội kinh doanh & Matching', en: 'Opportunities marketplace & matching' },
          platform_admin: 'full',
          admin: 'full',
          tong_thu_ky: 'scoped',
          truong_ban_thanh_vien: 'scoped',
          truong_ban_tai_chinh: 'scoped',
          truong_ban_truyen_thong: 'scoped',
          truong_ban_xuc_tien: 'full',
          member: 'own',
        },
        {
          feature: { vi: 'Biểu quyết & Bốc thăm trúng thưởng', en: 'Voting & Lucky draw' },
          platform_admin: 'full',
          admin: 'full',
          tong_thu_ky: 'full',
          truong_ban_thanh_vien: 'scoped',
          truong_ban_tai_chinh: 'scoped',
          truong_ban_truyen_thong: 'scoped',
          truong_ban_xuc_tien: 'scoped',
          member: 'own',
        },
      ],
    };
  }

  async savePermissionMatrix(payload: any, userId?: string) {
    const categories = payload?.categories || (Array.isArray(payload) ? payload : payload?.rows);
    if (!Array.isArray(categories) || categories.length === 0) {
      throw new BadRequestException('Ma trận phân quyền không hợp lệ');
    }

    const jsonValue = JSON.stringify({
      categories,
      rows: categories,
      updatedAt: new Date().toISOString(),
    });

    await this.prisma.$executeRawUnsafe(
      `
      INSERT INTO public.app_settings (key, value, updated_at, updated_by)
      VALUES ('crm_permission_matrix', $1::jsonb, NOW(), ${userId ? `'${userId}'::uuid` : 'NULL'})
      ON CONFLICT (key) DO UPDATE
      SET value = EXCLUDED.value, updated_at = NOW(), updated_by = EXCLUDED.updated_by
    `,
      jsonValue,
    );

    return {
      success: true,
      message: 'Cập nhật ma trận phân quyền CRM thành công',
      categories,
      rows: categories,
      updatedAt: new Date().toISOString(),
    };
  }

  async getActiveTheme() {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT value FROM public.app_settings WHERE key = 'active_association_theme' LIMIT 1
    `.catch(() => []);

    if (rows.length > 0 && rows[0].value) {
      const val = typeof rows[0].value === 'string' ? JSON.parse(rows[0].value) : rows[0].value;
      return {
        themeId: val.themeId || 'classic',
        enabled: val.enabled !== false,
        updatedAt: val.updatedAt || null,
      };
    }

    return {
      themeId: 'classic',
      enabled: true,
      updatedAt: null,
    };
  }

  async saveActiveTheme(payload: any, userId?: string) {
    const themeId = payload?.themeId || 'classic';
    const enabled = payload?.enabled !== false;
    const jsonValue = JSON.stringify({
      themeId,
      enabled,
      updatedAt: new Date().toISOString(),
    });

    await this.prisma.$executeRawUnsafe(
      `
      INSERT INTO public.app_settings (key, value, updated_at, updated_by)
      VALUES ('active_association_theme', $1::jsonb, NOW(), ${userId ? `'${userId}'::uuid` : 'NULL'})
      ON CONFLICT (key) DO UPDATE
      SET value = EXCLUDED.value, updated_at = NOW(), updated_by = EXCLUDED.updated_by
    `,
      jsonValue,
    );

    return {
      success: true,
      themeId,
      enabled,
      updatedAt: new Date().toISOString(),
    };
  }

  async getSidebarLabels() {
    const rows = await this.prisma.$queryRaw<{ value: any }[]>`
      SELECT value FROM public.app_settings WHERE key = 'crm_sidebar_labels' LIMIT 1
    `.catch(() => []);

    if (rows.length && rows[0]?.value) {
      const val = rows[0].value;
      const labels = typeof val === 'string' ? JSON.parse(val) : (val.labels || val);
      return { labels: labels || {} };
    }

    return { labels: {} };
  }

  async saveSidebarLabels(payload: any, userId?: string) {
    const labels = payload?.labels || payload || {};
    const jsonValue = JSON.stringify({
      labels,
      updatedAt: new Date().toISOString(),
    });

    await this.prisma.$executeRawUnsafe(
      `
      INSERT INTO public.app_settings (key, value, updated_at, updated_by)
      VALUES ('crm_sidebar_labels', $1::jsonb, NOW(), ${userId ? `'${userId}'::uuid` : 'NULL'})
      ON CONFLICT (key) DO UPDATE
      SET value = EXCLUDED.value, updated_at = NOW(), updated_by = EXCLUDED.updated_by
    `,
      jsonValue,
    );

    return {
      success: true,
      message: 'Cập nhật nhãn menu sidebar động thành công',
      labels,
      updatedAt: new Date().toISOString(),
    };
  }

  // ── MEMBER PERMISSION PROFILES (RBAC INDIVIDUAL OVERRIDES) ─────────────────
  async getMemberPermissions() {
    const rows = await this.prisma.$queryRaw<{ value: any }[]>`
      SELECT value FROM public.app_settings WHERE key = 'crm_member_permissions' LIMIT 1
    `.catch(() => []);

    if (rows.length && rows[0]?.value) {
      const val = rows[0].value;
      const map = typeof val === 'string' ? JSON.parse(val) : (val.permissionsMap || val);
      return { permissionsMap: map || {} };
    }

    return { permissionsMap: {} };
  }

  async saveMemberPermissions(payload: any, userId?: string) {
    const permissionsMap = payload?.permissionsMap || payload || {};
    const jsonValue = JSON.stringify({
      permissionsMap,
      updatedAt: new Date().toISOString(),
    });

    await this.prisma.$executeRawUnsafe(
      `
      INSERT INTO public.app_settings (key, value, updated_at, updated_by)
      VALUES ('crm_member_permissions', $1::jsonb, NOW(), ${userId ? `'${userId}'::uuid` : 'NULL'})
      ON CONFLICT (key) DO UPDATE
      SET value = EXCLUDED.value, updated_at = NOW(), updated_by = EXCLUDED.updated_by
    `,
      jsonValue,
    );

    return {
      success: true,
      message: 'Cập nhật phân quyền tài khoản hội viên thành công',
      permissionsMap,
      updatedAt: new Date().toISOString(),
    };
  }

  // ── LUCKY DRAW CONFIGURATION & LANDING BANNER (DYNAMIC DATABASE BACKED) ────
  async getLuckyDrawConfig() {
    try {
      // 1. Fetch real events from database
      const eventRows = await this.prisma.$queryRaw<any[]>`
        SELECT id, name, date, location, description, banner, image, status
        FROM public.events
        ORDER BY date DESC
        LIMIT 6
      `.catch(() => []);

      // If no events found in DB, return stored app_settings config if any
      if (!eventRows || eventRows.length === 0) {
        const rows = await this.prisma.$queryRaw<{ value: any }[]>`
          SELECT value FROM public.app_settings WHERE key = 'crm_lucky_draw_config' LIMIT 1
        `.catch(() => []);
        if (rows.length && rows[0]?.value) {
          const val = rows[0].value;
          return typeof val === 'string' ? JSON.parse(val) : val;
        }
        return null;
      }

      // 2. Check if we need to auto-seed initial real prizes from public.products
      const prizeCount = await this.prisma.$queryRaw<any[]>`
        SELECT COUNT(*)::int as count FROM public.event_prizes
      `.catch(() => [{ count: 0 }]);

      if (Number(prizeCount[0]?.count || 0) === 0) {
        const prodRows = await this.prisma.$queryRaw<any[]>`
          SELECT id, name, title, company, price, image_url, description
          FROM public.products
          WHERE status = 'active' OR status IS NULL
          ORDER BY price DESC
          LIMIT 4
        `.catch(() => []);

        const targetEventId = eventRows[0].id;
        const ranks = [
          { rank: 'Giải Đặc Biệt', icon: 'Crown', color: 'from-amber-500 via-yellow-400 to-amber-600' },
          { rank: 'Giải Nhất', icon: 'Trophy', color: 'from-blue-600 via-indigo-600 to-purple-700' },
          { rank: 'Giải Nhì', icon: 'Award', color: 'from-emerald-600 to-teal-700' },
          { rank: 'Giải Ba', icon: 'Sparkles', color: 'from-rose-600 to-pink-700' },
        ];

        for (let i = 0; i < prodRows.length; i++) {
          const prod = prodRows[i];
          const rk = ranks[i] || { rank: `Giải ${i + 1}`, icon: 'Gift', color: 'from-slate-700 to-slate-900' };
          const pId = `PRZ-INIT-${i + 1}-${Date.now().toString(36)}`;
          const title = prod.name || prod.title || 'Phần thưởng doanh nhân';
          const amt = BigInt(prod.price || 50000000);
          const valStr = `${Number(amt).toLocaleString('vi-VN')} VNĐ`;
          const comp = prod.company || 'Doanh nghiệp Hội viên CEO 1983';

          await this.prisma.$executeRaw`
            INSERT INTO public.event_prizes (
              id, event_id, rank_name, title, value, amount, quantity,
              target_type, target_id, sponsor_name, description,
              icon_name, image_url, highlight_color, status, created_at, updated_at
            ) VALUES (
              ${pId}, ${targetEventId}, ${rk.rank}, ${title}, ${valStr}, ${amt}, 1,
              'PRODUCT', ${prod.id}, ${comp}, ${prod.description || ''},
              ${rk.icon}, ${prod.image_url || null}, ${rk.color}, 'active', NOW(), NOW()
            )
          `.catch(() => {});
        }
      }

      // 3. For each event, build its dynamic payload
      const eventsWithData = await Promise.all(
        eventRows.map(async (ev, idx) => {
          // Fetch real prizes from DB
          const prizesRows = await this.prisma.$queryRaw<any[]>`
            SELECT ep.*, p.name as prod_name, p.company as prod_company, p.price as prod_price, p.image_url as prod_image
            FROM public.event_prizes ep
            LEFT JOIN public.products p ON ep.target_id = p.id
            WHERE ep.event_id = ${ev.id}
            ORDER BY ep.amount DESC, ep.created_at ASC
          `.catch(() => []);

          const prizes = prizesRows.map((p) => ({
            id: p.id,
            rankName: p.rank_name,
            title: p.title || p.prod_name,
            value: p.value || (p.amount ? `${Number(p.amount).toLocaleString('vi-VN')} VNĐ` : 'Giá trị liên hệ'),
            amount: Number(p.amount ?? p.prod_price ?? 0),
            sponsor: p.sponsor_name || p.prod_company || 'Ban Quản Trị & HanoiBA Sponsor Club',
            description: p.description || 'Ưu đãi và phần thưởng giá trị trao tặng trực tiếp tại sự kiện',
            iconName: p.icon_name || 'Gift',
            highlightColor: p.highlight_color || 'from-amber-500 to-yellow-600',
            quantity: Number(p.quantity ?? 1),
            targetType: p.target_type || 'PRODUCT',
            targetId: p.target_id || null,
            imageUrl: p.image_url || p.prod_image || null,
          }));

          // Calculate total prize value
          const totalValNumber = prizes.reduce((acc, p) => acc + (p.amount * (p.quantity || 1)), 0);
          const totalPrizeValue = totalValNumber > 0
            ? `${totalValNumber.toLocaleString('vi-VN')} VNĐ`
            : '500.000.000 VNĐ';

          // Fetch real attendee candidates from event_registrations or active members
          const regCandidates = await this.prisma.$queryRaw<any[]>`
            SELECT er.ticket_code as code, m.full_name as name, m.company_name as company, er.seat_number as seat
            FROM public.event_registrations er
            JOIN public.members m ON er.member_id = m.id
            WHERE er.event_id = ${ev.id} AND er.status = 'approved'
            LIMIT 50
          `.catch(() => []);

          let candidates = regCandidates.map((c) => ({
            name: c.name || 'Hội viên CEO',
            company: c.company || 'Doanh nghiệp CEO 1983',
            code: c.code || `#${Math.floor(1000 + Math.random() * 9000)}`,
            seat: c.seat || 'Khu vực VIP',
          }));

          if (candidates.length === 0) {
            // Fallback to active real members in database
            const memberRows = await this.prisma.$queryRaw<any[]>`
              SELECT id, full_name as name, company_name as company, phone
              FROM public.members
              WHERE status = 'active'
              LIMIT 25
            `.catch(() => []);

            candidates = memberRows.map((m, mIdx) => ({
              name: m.name || `Doanh nhân CEO ${mIdx + 1}`,
              company: m.company || 'Công ty thành viên CEO 1983',
              code: `#${1980 + (mIdx % 50)}`,
              seat: `Bàn VIP 0${(mIdx % 5) + 1} - Ghế 0${(mIdx % 8) + 1}`,
            }));
          }

          const evDate = ev.date ? new Date(ev.date) : new Date();
          const dateStr = evDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

          const bannerThemes = ['gala_luxury', 'business_summit', 'night_party', 'gold_anniversary'];
          const bannerTheme = bannerThemes[idx % bannerThemes.length];

          return {
            id: ev.id,
            name: ev.name,
            subtitle: ev.description || 'Đêm vinh danh tinh hoa doanh nhân — Bốc thăm trao tặng các phần quà đặc sắc',
            date: dateStr,
            time: '18:00 - 22:00',
            location: ev.location || 'Trung Tâm Hội Nghị Quốc Gia (NCC), Hà Nội',
            bannerTheme,
            coverUrl: ev.banner || ev.image || 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1600&q=80',
            totalPrizeValue,
            prizes,
            candidates,
          };
        })
      );

      return {
        events: eventsWithData,
        source: 'database',
        timestamp: new Date().toISOString(),
      };
    } catch (err: any) {
      console.error('[AdminService] getLuckyDrawConfig error:', err);
      return null;
    }
  }

  async saveLuckyDrawConfig(payload: any, userId?: string) {
    const config = payload || {};
    const events = config.events || (Array.isArray(config) ? config : []);

    // Also persist any updated prizes into public.event_prizes table!
    for (const ev of events) {
      if (ev.id && Array.isArray(ev.prizes)) {
        for (const prz of ev.prizes) {
          if (prz.id && prz.title) {
            const amount = BigInt(Math.round(prz.amount || 0));
            await this.prisma.$executeRaw`
              INSERT INTO public.event_prizes (
                id, event_id, rank_name, title, value, amount, quantity,
                target_type, target_id, sponsor_name, description,
                icon_name, image_url, highlight_color, status, created_at, updated_at
              ) VALUES (
                ${prz.id}, ${ev.id}, ${prz.rankName || 'Giải Thưởng'}, ${prz.title},
                ${prz.value || 'Đang cập nhật'}, ${amount}, ${prz.quantity || 1},
                ${prz.targetType || 'PRODUCT'}, ${prz.targetId || null},
                ${prz.sponsor || 'Nhà tài trợ CEO 1983'}, ${prz.description || ''},
                ${prz.iconName || 'Gift'}, ${prz.imageUrl || null},
                ${prz.highlightColor || 'from-amber-500 to-yellow-600'}, 'active',
                NOW(), NOW()
              )
              ON CONFLICT (id) DO UPDATE
              SET rank_name = EXCLUDED.rank_name,
                  title = EXCLUDED.title,
                  value = EXCLUDED.value,
                  amount = EXCLUDED.amount,
                  quantity = EXCLUDED.quantity,
                  target_type = EXCLUDED.target_type,
                  target_id = EXCLUDED.target_id,
                  sponsor_name = EXCLUDED.sponsor_name,
                  description = EXCLUDED.description,
                  icon_name = EXCLUDED.icon_name,
                  image_url = EXCLUDED.image_url,
                  highlight_color = EXCLUDED.highlight_color,
                  updated_at = NOW()
            `.catch(() => {});
          }
        }
      }
    }

    const jsonValue = JSON.stringify({
      ...config,
      updatedAt: new Date().toISOString(),
    });

    await this.prisma.$executeRawUnsafe(
      `
      INSERT INTO public.app_settings (key, value, updated_at, updated_by)
      VALUES ('crm_lucky_draw_config', $1::jsonb, NOW(), ${userId ? `'${userId}'::uuid` : 'NULL'})
      ON CONFLICT (key) DO UPDATE
      SET value = EXCLUDED.value, updated_at = NOW(), updated_by = EXCLUDED.updated_by
    `,
      jsonValue,
    );

    return {
      success: true,
      message: 'Cập nhật cấu hình bốc thăm trúng thưởng & giải thưởng database thành công',
      config,
      updatedAt: new Date().toISOString(),
    };
  }
}



