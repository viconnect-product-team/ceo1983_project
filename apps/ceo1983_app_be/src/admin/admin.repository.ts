import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminRepository {
  constructor(private readonly prisma: PrismaService) {}

  async ensureSchema(): Promise<void> {
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
    `).catch(() => {});
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
  }

  async queryRawUnsafe<T = any>(query: string, ...values: any[]): Promise<T[]> {
    return this.prisma.$queryRawUnsafe<T[]>(query, ...values).catch(() => [] as T[]);
  }

  async executeRawUnsafe(query: string, ...values: any[]): Promise<number> {
    return this.prisma.$executeRawUnsafe(query, ...values).catch(() => 0);
  }

  async findDemoLeads(whereClause: string): Promise<any[]> {
    return this.prisma.$queryRawUnsafe<any[]>(`
      SELECT 
        id, name, email, organization, phone, job_title, preferred_date,
        preferred_slot, timezone, notes, locale, status, admin_notes,
        status_changed_at, created_at
      FROM public.demo_requests
      WHERE ${whereClause}
      ORDER BY created_at DESC
      LIMIT 500
    `).catch(() => []);
  }

  async findDemoLeadById(id: string): Promise<any | null> {
    const rows = await this.prisma.$queryRawUnsafe<any[]>(
      `SELECT * FROM public.demo_requests WHERE id = $1 LIMIT 1`,
      id,
    ).catch(() => []);
    return rows[0] || null;
  }

  async updateDemoLead(id: string, status?: string, adminNotes?: string | null): Promise<any> {
    const sets: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (status !== undefined) {
      sets.push(`status = $${idx++}`);
      values.push(status);
      sets.push(`status_changed_at = now()`);
    }

    if (adminNotes !== undefined) {
      sets.push(`admin_notes = $${idx++}`);
      values.push(adminNotes);
    }

    if (sets.length === 0) return this.findDemoLeadById(id);

    values.push(id);
    await this.prisma.$executeRawUnsafe(
      `UPDATE public.demo_requests SET ${sets.join(', ')} WHERE id = $${idx}`,
      ...values,
    );

    return this.findDemoLeadById(id);
  }

  async listInvoices(): Promise<any[]> {
    return this.prisma.$queryRaw<any[]>`
      SELECT 
        i.id, i.code, i.member_id, i.year, i.amount, i.status,
        i.due_date, i.paid_at, i.payment_method, i.notes,
        i.created_at, i.updated_at,
        m.name as member_name, m.company as member_company,
        m.email as member_email, m.phone as member_phone,
        m.code as member_code
      FROM public.invoices i
      LEFT JOIN public.members m ON m.id = i.member_id
      ORDER BY i.created_at DESC
    `.catch(() => []);
  }

  async getInvoiceById(id: string): Promise<any | null> {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT 
        i.id, i.code, i.member_id, i.year, i.amount, i.status,
        i.due_date, i.paid_at, i.payment_method, i.notes,
        i.created_at, i.updated_at,
        m.name as member_name, m.company as member_company,
        m.email as member_email, m.phone as member_phone,
        m.code as member_code
      FROM public.invoices i
      LEFT JOIN public.members m ON m.id = i.member_id
      WHERE i.id = ${id}
      LIMIT 1
    `.catch(() => []);
    return rows[0] || null;
  }

  async getInvoiceReminders(invoiceId: string): Promise<any[]> {
    return this.prisma.$queryRaw<any[]>`
      SELECT id, channel, sent_at, by_name, note
      FROM public.invoice_reminders
      WHERE invoice_id = ${invoiceId}
      ORDER BY sent_at DESC
    `.catch(() => []);
  }

  async markInvoicePaid(id: string, method?: string): Promise<void> {
    await this.prisma.$executeRaw`
      UPDATE public.invoices
      SET status = 'paid', paid_at = now(), payment_method = ${method || 'bank'}, updated_at = now()
      WHERE id = ${id}
    `;
  }

  async updateInvoiceMethod(id: string, method: string): Promise<void> {
    await this.prisma.$executeRaw`
      UPDATE public.invoices
      SET payment_method = ${method}, updated_at = now()
      WHERE id = ${id}
    `;
  }

  async insertInvoiceReminder(id: string, invoiceId: string, channel: string, byName?: string, note?: string): Promise<void> {
    await this.prisma.$executeRaw`
      INSERT INTO public.invoice_reminders (id, invoice_id, channel, by_name, note, sent_at)
      VALUES (${id}, ${invoiceId}, ${channel}, ${byName || 'Admin'}, ${note || null}, now())
    `;
  }

  async deleteInvoice(id: string): Promise<void> {
    await this.prisma.$executeRaw`
      DELETE FROM public.invoice_reminders WHERE invoice_id = ${id}
    `.catch(() => {});
    await this.prisma.$executeRaw`
      DELETE FROM public.invoices WHERE id = ${id}
    `;
  }

  async getUserRoles(userId: string): Promise<any[]> {
    return this.prisma.user_roles.findMany({
      where: { user_id: userId },
    }).catch(() => []);
  }
}
