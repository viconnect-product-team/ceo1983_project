import { Injectable, NotFoundException, BadRequestException, ForbiddenException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { parsePersonId, composePersonId } from '../connect-app.utils';
import * as crypto from 'crypto';

@Injectable()
export class ConnectCustomerService {
  constructor(private readonly prisma: PrismaService) {}

  async listBcCustomers(userId: string) {
    const customers = await this.prisma.$queryRaw<any[]>`
      SELECT * FROM public.bc_customers
      WHERE owner_user_id = ${userId}::uuid
      ORDER BY created_at DESC
    `.catch(() => [] as any[]);

    if (customers.length === 0) return { ok: true, customers: [] };

    const customerIds = customers.map(c => c.id);
    const links = await this.prisma.$queryRaw<any[]>`
      SELECT customer_id, tag_id FROM public.bc_customer_tag_links
      WHERE customer_id::uuid = ANY(${customerIds}::uuid[])
    `.catch(() => [] as any[]);

    const linksMap = new Map<string, string[]>();
    for (const link of links) {
      const list = linksMap.get(link.customer_id) ?? [];
      list.push(link.tag_id);
      linksMap.set(link.customer_id, list);
    }

    const result = customers.map(c => ({
      id: c.id,
      personId: composePersonId(c.target_kind, c.target_user_id, c.target_card_id, c.target_guest_id),
      displayName: c.display_name,
      companyName: c.company_name,
      stage: c.stage,
      expectedValue: c.expected_value ? Number(c.expected_value) : null,
      currency: c.currency,
      sourceLabel: c.source_label,
      note: c.note,
      nextActionAt: c.next_action_at ? new Date(c.next_action_at).toISOString() : null,
      lastContactAt: c.last_contact_at ? new Date(c.last_contact_at).toISOString() : null,
      tagIds: linksMap.get(c.id) ?? [],
      createdAt: c.created_at ? new Date(c.created_at).toISOString() : null,
      updatedAt: c.updated_at ? new Date(c.updated_at).toISOString() : null,
    }));

    return { ok: true, customers: result };
  }

  async createBcCustomer(userId: string, input: any) {
    const { targetKind, targetUserId, targetCardId, targetGuestId } = parsePersonId(input.personId);

    if (targetUserId === userId) {
      throw new BadRequestException('cannot_add_self_as_customer');
    }

    const targetUserUuid = targetUserId ? targetUserId : null;
    const targetCardUuid = targetCardId ? targetCardId : null;
    const targetGuestUuid = targetGuestId ? targetGuestId : null;

    const existing = await this.prisma.$queryRaw<any[]>`
      SELECT id FROM public.bc_customers
      WHERE owner_user_id = ${userId}::uuid
        AND target_kind = ${targetKind}::public.bc_customer_target_kind
        AND (
          (target_kind = 'connection'::public.bc_customer_target_kind AND target_user_id = ${targetUserUuid}::uuid) OR
          (target_kind = 'saved_card'::public.bc_customer_target_kind AND target_card_id = ${targetCardUuid}::uuid) OR
          (target_kind = 'guest_contact'::public.bc_customer_target_kind AND target_guest_id = ${targetGuestUuid}::uuid)
        )
      LIMIT 1
    `.catch(() => [] as any[]);

    if (existing.length > 0) {
      throw new BadRequestException('customer_already_exists');
    }

    const customerId = crypto.randomUUID();
    const now = new Date();
    const nextAction = input.nextActionAt ? new Date(input.nextActionAt) : null;
    const stage = input.stage || 'prospect';

    await this.prisma.$executeRaw`
      INSERT INTO public.bc_customers (
        id, owner_user_id, target_kind, target_user_id, target_card_id, target_guest_id,
        display_name, company_name, stage, expected_value, currency, source_label, note,
        next_action_at, created_at, updated_at
      ) VALUES (
        ${customerId}::uuid,
        ${userId}::uuid,
        ${targetKind}::public.bc_customer_target_kind,
        ${targetUserUuid}::uuid,
        ${targetCardUuid}::uuid,
        ${targetGuestUuid}::uuid,
        ${input.displayName || null},
        ${input.companyName || null},
        ${stage}::public.bc_customer_stage,
        ${input.expectedValue || null},
        ${input.currency || 'VND'},
        ${input.sourceLabel || null},
        ${input.note || null},
        ${nextAction},
        ${now},
        ${now}
      )
    `;

    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT * FROM public.bc_customers WHERE id = ${customerId}::uuid LIMIT 1
    `.catch(() => [] as any[]);

    const c = rows[0];
    if (!c) throw new InternalServerErrorException('failed_to_create_customer');

    return {
      ok: true,
      customer: {
        id: c.id,
        personId: input.personId,
        displayName: c.display_name,
        companyName: c.company_name,
        stage: c.stage,
        expectedValue: c.expected_value ? Number(c.expected_value) : null,
        currency: c.currency,
        sourceLabel: c.source_label,
        note: c.note,
        nextActionAt: c.next_action_at ? new Date(c.next_action_at).toISOString() : null,
        lastContactAt: null,
        tagIds: [],
        createdAt: c.created_at ? new Date(c.created_at).toISOString() : null,
        updatedAt: c.updated_at ? new Date(c.updated_at).toISOString() : null,
      }
    };
  }

  async updateBcCustomer(userId: string, input: any) {
    const existing = await this.prisma.$queryRaw<any[]>`
      SELECT * FROM public.bc_customers
      WHERE id = ${input.customerId}::uuid AND owner_user_id = ${userId}::uuid
      LIMIT 1
    `.catch(() => [] as any[]);

    const c = existing[0];
    if (!c) throw new NotFoundException('customer_not_found');

    const now = new Date();
    const stage = input.stage !== undefined ? input.stage : c.stage;
    const expectedValue = input.expectedValue !== undefined ? input.expectedValue : c.expected_value;
    const currency = input.currency !== undefined ? input.currency : c.currency;
    const sourceLabel = input.sourceLabel !== undefined ? input.sourceLabel : c.source_label;
    const note = input.note !== undefined ? input.note : c.note;
    const nextActionAt = input.nextActionAt !== undefined ? (input.nextActionAt ? new Date(input.nextActionAt) : null) : c.next_action_at;

    await this.prisma.$executeRaw`
      UPDATE public.bc_customers
      SET stage = ${stage}::public.bc_customer_stage,
          expected_value = ${expectedValue},
          currency = ${currency},
          source_label = ${sourceLabel},
          note = ${note},
          next_action_at = ${nextActionAt},
          updated_at = ${now}
      WHERE id = ${input.customerId}::uuid AND owner_user_id = ${userId}::uuid
    `;

    const links = await this.prisma.$queryRaw<any[]>`
      SELECT tag_id FROM public.bc_customer_tag_links
      WHERE customer_id = ${input.customerId}::uuid
    `.catch(() => [] as any[]);

    return {
      ok: true,
      customer: {
        id: c.id,
        personId: composePersonId(c.target_kind, c.target_user_id, c.target_card_id, c.target_guest_id),
        displayName: c.display_name,
        companyName: c.company_name,
        stage,
        expectedValue: expectedValue ? Number(expectedValue) : null,
        currency,
        sourceLabel,
        note,
        nextActionAt: nextActionAt ? new Date(nextActionAt).toISOString() : null,
        lastContactAt: c.last_contact_at ? new Date(c.last_contact_at).toISOString() : null,
        tagIds: links.map(l => l.tag_id),
        createdAt: c.created_at ? new Date(c.created_at).toISOString() : null,
        updatedAt: now.toISOString(),
      }
    };
  }

  async deleteBcCustomer(userId: string, customerId: string) {
    await this.prisma.$executeRaw`
      DELETE FROM public.bc_customer_tag_links WHERE customer_id = ${customerId}::uuid
    `;
    await this.prisma.$executeRaw`
      DELETE FROM public.bc_customer_logs WHERE customer_id = ${customerId}::uuid
    `;
    await this.prisma.$executeRaw`
      DELETE FROM public.bc_customer_needs WHERE customer_id = ${customerId}::uuid
    `;
    await this.prisma.$executeRaw`
      DELETE FROM public.bc_customers WHERE id = ${customerId}::uuid AND owner_user_id = ${userId}::uuid
    `;
    return { ok: true };
  }

  async listBcCustomerLogs(userId: string, customerId: string) {
    const customer = await this.prisma.$queryRaw<any[]>`
      SELECT id FROM public.bc_customers WHERE id = ${customerId}::uuid AND owner_user_id = ${userId}::uuid LIMIT 1
    `.catch(() => [] as any[]);
    if (customer.length === 0) throw new ForbiddenException('customer_access_denied');

    const logs = await this.prisma.$queryRaw<any[]>`
      SELECT * FROM public.bc_customer_logs
      WHERE customer_id = ${customerId}::uuid
      ORDER BY occurred_at DESC
    `.catch(() => [] as any[]);

    return {
      ok: true,
      logs: logs.map(l => ({
        id: l.id,
        customerId: l.customer_id,
        kind: l.kind,
        body: l.body,
        occurredAt: l.occurred_at ? new Date(l.occurred_at).toISOString() : null,
        createdAt: l.created_at ? new Date(l.created_at).toISOString() : null,
      }))
    };
  }

  async addBcCustomerLog(userId: string, input: any) {
    const customer = await this.prisma.$queryRaw<any[]>`
      SELECT id FROM public.bc_customers WHERE id = ${input.customerId}::uuid AND owner_user_id = ${userId}::uuid LIMIT 1
    `.catch(() => [] as any[]);
    if (customer.length === 0) throw new ForbiddenException('customer_access_denied');

    const logId = crypto.randomUUID();
    const occurredAt = input.occurredAt ? new Date(input.occurredAt) : new Date();
    const now = new Date();

    await this.prisma.$executeRaw`
      INSERT INTO public.bc_customer_logs (
        id, owner_user_id, customer_id, kind, body, occurred_at, created_at, updated_at
      ) VALUES (
        ${logId}::uuid,
        ${userId}::uuid,
        ${input.customerId}::uuid,
        ${input.kind}::public.bc_customer_log_kind,
        ${input.body || null},
        ${occurredAt},
        ${now},
        ${now}
      )
    `;

    if (input.kind !== 'note' && input.kind !== 'stage_change') {
      await this.prisma.$executeRaw`
        UPDATE public.bc_customers
        SET last_contact_at = ${occurredAt}
        WHERE id = ${input.customerId}::uuid
      `;
    }

    return {
      ok: true,
      log: {
        id: logId,
        customerId: input.customerId,
        kind: input.kind,
        body: input.body,
        occurredAt: occurredAt.toISOString(),
        createdAt: now.toISOString(),
      }
    };
  }

  async listBcCustomerTags(userId: string) {
    const tags = await this.prisma.$queryRaw<any[]>`
      SELECT t.id, t.name, t.normalized_name, t.created_at, t.updated_at, COUNT(l.customer_id)::int as count
      FROM public.bc_customer_tags t
      LEFT JOIN public.bc_customer_tag_links l ON t.id = l.tag_id
      WHERE t.owner_user_id = ${userId}::uuid
      GROUP BY t.id
      ORDER BY t.name ASC
    `.catch(() => [] as any[]);

    return {
      ok: true,
      tags: tags.map(t => ({
        id: t.id,
        name: t.name,
        normalizedName: t.normalized_name,
        count: t.count ?? 0,
        createdAt: t.created_at ? new Date(t.created_at).toISOString() : null,
        updatedAt: t.updated_at ? new Date(t.updated_at).toISOString() : null,
      }))
    };
  }

  async createBcCustomerTag(userId: string, name: string) {
    const normalizedName = name.trim().toLowerCase();
    const existing = await this.prisma.$queryRaw<any[]>`
      SELECT id, name, normalized_name, created_at, updated_at FROM public.bc_customer_tags
      WHERE owner_user_id = ${userId}::uuid AND normalized_name = ${normalizedName}
      LIMIT 1
    `.catch(() => [] as any[]);

    if (existing.length > 0) {
      const t = existing[0];
      return {
        ok: true,
        tag: {
          id: t.id,
          name: t.name,
          normalizedName: t.normalized_name,
          count: 0,
          createdAt: t.created_at ? new Date(t.created_at).toISOString() : null,
          updatedAt: t.updated_at ? new Date(t.updated_at).toISOString() : null,
        }
      };
    }

    const tagId = crypto.randomUUID();
    const now = new Date();

    await this.prisma.$executeRaw`
      INSERT INTO public.bc_customer_tags (
        id, owner_user_id, name, normalized_name, created_at, updated_at
      ) VALUES (
        ${tagId}::uuid, ${userId}::uuid, ${name.trim()}, ${normalizedName}, ${now}, ${now}
      )
    `;

    return {
      ok: true,
      tag: {
        id: tagId,
        name: name.trim(),
        normalizedName,
        count: 0,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      }
    };
  }

  async renameBcCustomerTag(userId: string, tagId: string, name: string) {
    const normalizedName = name.trim().toLowerCase();
    const now = new Date();
    await this.prisma.$executeRaw`
      UPDATE public.bc_customer_tags
      SET name = ${name.trim()},
          normalized_name = ${normalizedName},
          updated_at = ${now}
      WHERE id = ${tagId}::uuid AND owner_user_id = ${userId}::uuid
    `;

    const tags = await this.prisma.$queryRaw<any[]>`
      SELECT t.id, t.name, t.normalized_name, t.created_at, t.updated_at, COUNT(l.customer_id)::int as count
      FROM public.bc_customer_tags t
      LEFT JOIN public.bc_customer_tag_links l ON t.id = l.tag_id
      WHERE t.id = ${tagId}::uuid
      GROUP BY t.id
      LIMIT 1
    `.catch(() => [] as any[]);

    const t = tags[0];
    if (!t) throw new NotFoundException('tag_not_found');

    return {
      ok: true,
      tag: {
        id: t.id,
        name: t.name,
        normalizedName: t.normalized_name,
        count: t.count ?? 0,
        createdAt: t.created_at ? new Date(t.created_at).toISOString() : null,
        updatedAt: t.updated_at ? new Date(t.updated_at).toISOString() : null,
      }
    };
  }

  async deleteBcCustomerTag(userId: string, tagId: string) {
    await this.prisma.$executeRaw`
      DELETE FROM public.bc_customer_tag_links WHERE tag_id = ${tagId}::uuid
    `;
    await this.prisma.$executeRaw`
      DELETE FROM public.bc_customer_tags WHERE id = ${tagId}::uuid AND owner_user_id = ${userId}::uuid
    `;
    return { ok: true };
  }

  async setBcCustomerTags(userId: string, customerId: string, names: string[]) {
    const customer = await this.prisma.$queryRaw<any[]>`
      SELECT id FROM public.bc_customers WHERE id = ${customerId}::uuid AND owner_user_id = ${userId}::uuid LIMIT 1
    `.catch(() => [] as any[]);
    if (customer.length === 0) throw new ForbiddenException('customer_access_denied');

    const tagIds: string[] = [];
    for (const name of names) {
      const res = await this.createBcCustomerTag(userId, name);
      tagIds.push(res.tag.id);
    }

    await this.prisma.$executeRaw`
      DELETE FROM public.bc_customer_tag_links WHERE customer_id = ${customerId}::uuid
    `;

    for (const tagId of tagIds) {
      await this.prisma.$executeRaw`
        INSERT INTO public.bc_customer_tag_links (id, owner_user_id, customer_id, tag_id, created_at)
        VALUES (gen_random_uuid(), ${userId}::uuid, ${customerId}::uuid, ${tagId}::uuid, now())
      `;
    }

    return { ok: true, tagIds };
  }

  async listBcCustomerNeeds(userId: string, customerId: string) {
    const customer = await this.prisma.$queryRaw<any[]>`
      SELECT id FROM public.bc_customers WHERE id = ${customerId}::uuid AND owner_user_id = ${userId}::uuid LIMIT 1
    `.catch(() => [] as any[]);
    if (customer.length === 0) throw new ForbiddenException('customer_access_denied');

    const needs = await this.prisma.$queryRaw<any[]>`
      SELECT id, customer_id, kind, body, priority, status, created_at, updated_at
      FROM public.bc_customer_needs
      WHERE customer_id = ${customerId}::uuid
      ORDER BY created_at DESC
    `.catch(() => [] as any[]);

    return {
      ok: true,
      needs: needs.map(n => ({
        id: n.id,
        customerId: n.customer_id,
        kind: n.kind,
        body: n.body,
        priority: n.priority,
        status: n.status,
        createdAt: n.created_at ? new Date(n.created_at).toISOString() : null,
        updatedAt: n.updated_at ? new Date(n.updated_at).toISOString() : null,
      }))
    };
  }

  async addBcCustomerNeed(userId: string, input: any) {
    const customer = await this.prisma.$queryRaw<any[]>`
      SELECT id FROM public.bc_customers WHERE id = ${input.customerId}::uuid AND owner_user_id = ${userId}::uuid LIMIT 1
    `.catch(() => [] as any[]);
    if (customer.length === 0) throw new ForbiddenException('customer_access_denied');

    const needId = crypto.randomUUID();
    const now = new Date();

    await this.prisma.$executeRaw`
      INSERT INTO public.bc_customer_needs (
        id, owner_user_id, customer_id, kind, body, priority, status, created_at, updated_at
      ) VALUES (
        ${needId}::uuid, ${userId}::uuid, ${input.customerId}::uuid, ${input.kind}, ${input.body}, ${input.priority || 'medium'}, 'open', ${now}, ${now}
      )
    `;

    return {
      ok: true,
      need: {
        id: needId,
        customerId: input.customerId,
        kind: input.kind,
        body: input.body,
        priority: input.priority || 'medium',
        status: 'open',
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      }
    };
  }

  async updateBcCustomerNeed(userId: string, input: any) {
    const existing = await this.prisma.$queryRaw<any[]>`
      SELECT n.id, n.customer_id, n.kind, n.body, n.priority, n.status, n.created_at
      FROM public.bc_customer_needs n
      JOIN public.bc_customers c ON n.customer_id = c.id
      WHERE n.id = ${input.needId}::uuid AND c.owner_user_id = ${userId}::uuid
      LIMIT 1
    `.catch(() => [] as any[]);

    const n = existing[0];
    if (!n) throw new NotFoundException('need_not_found');

    const now = new Date();
    const body = input.body !== undefined ? input.body : n.body;
    const priority = input.priority !== undefined ? input.priority : n.priority;
    const status = input.status !== undefined ? input.status : n.status;

    await this.prisma.$executeRaw`
      UPDATE public.bc_customer_needs
      SET body = ${body},
          priority = ${priority},
          status = ${status},
          updated_at = ${now}
      WHERE id = ${input.needId}::uuid
    `;

    return {
      ok: true,
      need: {
        id: n.id,
        customerId: n.customer_id,
        kind: n.kind,
        body,
        priority,
        status,
        createdAt: n.created_at ? new Date(n.created_at).toISOString() : null,
        updatedAt: now.toISOString(),
      }
    };
  }

  async deleteBcCustomerNeed(userId: string, needId: string) {
    const existing = await this.prisma.$queryRaw<any[]>`
      SELECT n.id FROM public.bc_customer_needs n
      JOIN public.bc_customers c ON n.customer_id = c.id
      WHERE n.id = ${needId}::uuid AND c.owner_user_id = ${userId}::uuid
      LIMIT 1
    `.catch(() => [] as any[]);

    if (existing.length === 0) throw new ForbiddenException('need_access_denied');

    await this.prisma.$executeRaw`
      DELETE FROM public.bc_customer_needs WHERE id = ${needId}::uuid
    `;

    return { ok: true };
  }

  // --- AI Tag Suggestions ---

  async suggestCustomerTags(userId: string, customerId: string) {
    const customers = await this.prisma.$queryRaw<any[]>`
      SELECT display_name, company_name, stage, note FROM public.bc_customers
      WHERE id = ${customerId}::uuid AND owner_user_id = ${userId}::uuid
      LIMIT 1
    `.catch(() => [] as any[]);

    const c = customers[0];
    if (!c) throw new NotFoundException('customer_not_found');

    const logs = await this.prisma.$queryRaw<any[]>`
      SELECT kind, body, occurred_at FROM public.bc_customer_logs
      WHERE customer_id = ${customerId}::uuid
      ORDER BY occurred_at DESC
      LIMIT 20
    `.catch(() => [] as any[]);

    const needs = await this.prisma.$queryRaw<any[]>`
      SELECT kind, body, status, priority FROM public.bc_customer_needs
      WHERE customer_id = ${customerId}::uuid
      ORDER BY created_at DESC
      LIMIT 20
    `.catch(() => [] as any[]);

    const existingTags = await this.prisma.$queryRaw<any[]>`
      SELECT name FROM public.bc_customer_tags
      WHERE owner_user_id = ${userId}::uuid
    `.catch(() => [] as any[]);

    const currentTags = await this.prisma.$queryRaw<any[]>`
      SELECT t.name FROM public.bc_customer_tags t
      JOIN public.bc_customer_tag_links l ON t.id = l.tag_id
      WHERE l.customer_id = ${customerId}::uuid
    `.catch(() => [] as any[]);

    const feedback = await this.prisma.$queryRaw<any[]>`
      SELECT tag_name, verdict FROM public.bc_customer_tag_suggestion_feedback
      WHERE customer_id = ${customerId}::uuid AND owner_user_id = ${userId}::uuid
    `.catch(() => [] as any[]);

    const approvedTagNames = feedback.filter(f => f.verdict === 'good').map(f => f.tag_name);
    const rejectedTagNames = feedback.filter(f => f.verdict === 'bad').map(f => f.tag_name);

    const logTexts = logs.map(l => `[${l.occurred_at ? new Date(l.occurred_at).toLocaleDateString() : ''} - ${l.kind}] ${l.body || ''}`);
    const needTexts = needs.map(n => `[${n.status} - ${n.priority}] ${n.body}`);

    const response = await suggestCustomerTags({
      stageLabel: c.stage,
      displayName: c.display_name || '',
      companyName: c.company_name || '',
      note: c.note || '',
      logs: logTexts,
      needs: needTexts,
      existingTagNames: existingTags.map(t => t.name),
      currentTagNames: currentTags.map(t => t.name),
      approvedTagNames,
      rejectedTagNames,
    });

    if (!response.ok) {
      throw new BadRequestException('ai_suggestion_failed');
    }

    const runId = crypto.randomUUID();
    const now = new Date();
    await this.prisma.$executeRaw`
      INSERT INTO public.bc_customer_tag_suggestion_runs (
        id, customer_id, owner_user_id, suggestions, created_at
      ) VALUES (
        ${runId}::uuid, ${customerId}::uuid, ${userId}::uuid, ${JSON.stringify(response.suggestions)}::jsonb, ${now}
      )
    `;

    return {
      runId,
      suggestions: response.suggestions,
    };
  }

  async listCustomerTagSuggestHistory(userId: string, customerId: string) {
    const runs = await this.prisma.$queryRaw<any[]>`
      SELECT id, customer_id, created_at, suggestions FROM public.bc_customer_tag_suggestion_runs
      WHERE customer_id = ${customerId}::uuid AND owner_user_id = ${userId}::uuid
      ORDER BY created_at DESC
      LIMIT 10
    `.catch(() => [] as any[]);

    return {
      runs: runs.map(r => ({
        id: r.id,
        customerId: r.customer_id,
        createdAt: r.created_at ? new Date(r.created_at).toISOString() : null,
        suggestions: r.suggestions,
      }))
    };
  }

  async saveCustomerTagSuggestFeedback(userId: string, input: any) {
    const now = new Date();
    const existing = await this.prisma.$queryRaw<any[]>`
      SELECT id FROM public.bc_customer_tag_suggestion_feedback
      WHERE customer_id = ${input.customerId}::uuid
        AND owner_user_id = ${userId}::uuid
        AND tag_name = ${input.tagName}
      LIMIT 1
    `.catch(() => [] as any[]);

    if (existing.length > 0) {
      await this.prisma.$executeRaw`
        UPDATE public.bc_customer_tag_suggestion_feedback
        SET verdict = ${input.verdict},
            run_id = ${input.runId || null}::uuid,
            updated_at = ${now}
        WHERE id = ${existing[0].id}::uuid
      `;
    } else {
      const feedbackId = crypto.randomUUID();
      await this.prisma.$executeRaw`
        INSERT INTO public.bc_customer_tag_suggestion_feedback (
          id, customer_id, owner_user_id, run_id, tag_name, verdict, created_at, updated_at
        ) VALUES (
          ${feedbackId}::uuid, ${input.customerId}::uuid, ${userId}::uuid, ${input.runId || null}::uuid, ${input.tagName}, ${input.verdict}, ${now}, ${now}
        )
      `;
    }

    return { ok: true };
  }

  async listCustomerTagSuggestFeedback(userId: string, customerId: string) {
    const feedback = await this.prisma.$queryRaw<any[]>`
      SELECT id, customer_id, run_id, tag_name, verdict, created_at, updated_at
      FROM public.bc_customer_tag_suggestion_feedback
      WHERE customer_id = ${customerId}::uuid AND owner_user_id = ${userId}::uuid
      ORDER BY updated_at DESC
    `.catch(() => [] as any[]);

    return {
      feedback: feedback.map(f => ({
        id: f.id,
        customerId: f.customer_id,
        runId: f.run_id,
        tagName: f.tag_name,
        verdict: f.verdict,
        createdAt: f.created_at ? new Date(f.created_at).toISOString() : null,
        updatedAt: f.updated_at ? new Date(f.updated_at).toISOString() : null,
      }))
    };
  }

}

async function suggestCustomerTags(input: {
  stageLabel: string;
  displayName: string;
  companyName: string;
  note: string;
  logs: string[];
  needs: string[];
  existingTagNames: string[];
  currentTagNames: string[];
  approvedTagNames?: string[];
  rejectedTagNames?: string[];
}) {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) return { ok: false, error: "unavailable" as const };

  const context = [
    `TĂªn: ${input.displayName || "(khĂ´ng rĂµ)"}`,
    `CĂ´ng ty: ${input.companyName || "(khĂ´ng rĂµ)"}`,
    `Giai Ä‘oáº¡n: ${input.stageLabel}`,
    `Ghi chĂº: ${input.note || "(trá»‘ng)"}`,
    `Lá»‹ch sá»­ chÄƒm sĂ³c:\n${input.logs.length ? input.logs.map((l) => `- ${l}`).join("\n") : "(trá»‘ng)"}`,
    `Äiá»ƒm Ä‘au & nhu cáº§u:\n${input.needs.length ? input.needs.map((n) => `- ${n}`).join("\n") : "(trá»‘ng)"}`,
    `NhĂ£n Ä‘Ă£ gáº¯n: ${input.currentTagNames.join(", ") || "(chÆ°a cĂ³)"}`,
    `Danh má»¥c nhĂ£n hiá»‡n cĂ³: ${input.existingTagNames.join(", ") || "(chÆ°a cĂ³)"}`,
    `NhĂ£n ngÆ°á»i dĂ¹ng Ä‘Ă¡nh giĂ¡ ÄĂNG trÆ°á»›c Ä‘Ă¢y: ${(input.approvedTagNames ?? []).join(", ") || "(chÆ°a cĂ³)"}`,
    `NhĂ£n ngÆ°á»i dĂ¹ng Ä‘Ă¡nh giĂ¡ SAI trÆ°á»›c Ä‘Ă¢y (tuyá»‡t Ä‘á»‘i khĂ´ng Ä‘á» xuáº¥t láº¡i): ${
      (input.rejectedTagNames ?? []).join(", ") || "(chÆ°a cĂ³)"
    }`,
  ].join("\n");

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content: `Báº¡n lĂ  trá»£ lĂ½ phĂ¢n nhĂ³m khĂ¡ch hĂ ng cho má»™t ngÆ°á»i bĂ¡n hĂ ng cĂ¡ nhĂ¢n.
Äá» xuáº¥t tá»‘i Ä‘a 5 NHĂƒN ngáº¯n Ä‘á»ƒ phĂ¢n nhĂ³m khĂ¡ch hĂ ng.
Tráº£ vá» DUY NHáº¤T JSON dáº¡ng: {"suggestions":[{"name":"...","reason":"...","confidence":0.8}]}. KhĂ´ng markdown.`
        },
        { role: "user", content: context }
      ]
    })
  });

  if (!response.ok) return { ok: false, error: "unavailable" as const };
  const json = await response.json() as any;
  const content = json?.choices?.[0]?.message?.content ?? "";
  
  try {
    const text = content.replace(/```json/gi, "").replace(/```/g, "").trim();
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start < 0 || end <= start) return { ok: false, error: "unavailable" as const };
    const parsed = JSON.parse(text.slice(start, end + 1)) as any;
    const rawSuggestions = (parsed.suggestions ?? []).map((s: any) => ({
      name: String(s.name || '').trim().slice(0, 24),
      reason: String(s.reason || '').trim().slice(0, 120),
      confidence: typeof s.confidence === 'number' ? s.confidence : 0.5,
    })).filter((s: any) => s.name.length > 0).slice(0, 5);

    const existing = new Set(input.existingTagNames.map(n => n.toLowerCase()));
    const already = new Set(input.currentTagNames.map(n => n.toLowerCase()));
    const seen = new Set<string>();
    const suggestions: any[] = [];
    
    for (const s of rawSuggestions) {
      const key = s.name.toLowerCase();
      if (seen.has(key) || already.has(key)) continue;
      seen.add(key);
      suggestions.push({
        name: s.name,
        reason: s.reason,
        existing: existing.has(key),
        confidence: s.confidence,
      });
    }

    return { ok: true, suggestions };
  } catch {
    return { ok: false, error: "unavailable" as const };
  }
}
