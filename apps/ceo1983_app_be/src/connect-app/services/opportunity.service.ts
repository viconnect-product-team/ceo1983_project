import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ConnectAppGateway } from '../connect-app.gateway';
import * as crypto from 'crypto';
import { z } from 'zod';

@Injectable()
export class ConnectOpportunityService {
  constructor(
    private prisma: PrismaService,
    private gateway: ConnectAppGateway,
  ) {}

  private async checkCommunityMembership(userId: string, communityId: string): Promise<boolean> {
    const mem = await this.prisma.$queryRaw<any[]>`
      SELECT association_id FROM public.memberships
      WHERE user_id = ${userId}::uuid AND association_id = ${communityId}::uuid
      UNION
      SELECT association_id FROM public.members
      WHERE user_id = ${userId}::uuid AND association_id = ${communityId}::uuid AND status = 'active'
      LIMIT 1
    `.catch(() => [] as any[]);
    if (mem.length > 0) return true;

    const roles = await this.prisma.user_roles.findMany({ where: { user_id: userId } }).catch(() => []) as any[];
    const isPlatformAdmin = roles.some((r: any) => r.role === 'platform_admin' || r.role === 'admin');
    if (isPlatformAdmin) return true;

    return false;
  }

  async listCommunityOpportunities(userId: string, communityId: string, query: string, offset: number) {
    const hasMembership = await this.checkCommunityMembership(userId, communityId);

    const limit = 10;
    const opportunities = await this.prisma.$queryRaw<any[]>`
      SELECT * FROM public.opportunities
      WHERE status IN ('open', 'published')
        AND (${query} = '' OR title ILIKE ${'%' + query + '%'} OR description ILIKE ${'%' + query + '%'})
      ORDER BY created_at DESC
      OFFSET ${offset} LIMIT ${limit}
    `.catch(() => [] as any[]);

    const oppIds = opportunities.map(o => o.id);
    let interestMap = new Map<string, string>();
    if (oppIds.length > 0) {
      const interests = await this.prisma.$queryRaw<any[]>`
        SELECT opportunity_id FROM public.opportunity_interests
        WHERE member_id = ${userId} AND opportunity_id = ANY(${oppIds})
      `.catch(() => [] as any[]);
      interests.forEach(i => interestMap.set(i.opportunity_id, 'high'));
    }

    const totalCount = opportunities.length;
    const now = Date.now();
    const items = opportunities.map(o => {
      const deadlineMs = o.deadline ? new Date(o.deadline).getTime() : null;
      const daysLeft = deadlineMs ? Math.max(0, Math.ceil((deadlineMs - now) / (1000 * 60 * 60 * 24))) : null;
      return {
        opportunityRef: o.id,
        title: o.title,
        summary: o.description || null,
        endsAt: o.deadline ? new Date(o.deadline).toISOString() : null,
        daysLeft,
        valLabel: o.budget_max ? `${o.budget_min ? o.budget_min + ' - ' : ''}${o.budget_max}` : (o.region || o.industry || null),
        status: o.status,
        interested: interestMap.has(o.id),
        interestLevel: interestMap.get(o.id) || null,
        image: o.image || null,
        thumbnail: o.image || null,
      };
    });

    return {
      items,
      totalCount,
      nextOffset: items.length === limit ? offset + limit : null,
    };
  }

  async getCommunityOpportunityDetail(userId: string, communityId: string, opportunityRef: string) {
    const hasMembership = await this.checkCommunityMembership(userId, communityId);

    const opportunities = await this.prisma.$queryRaw<any[]>`
      SELECT * FROM public.opportunities
      WHERE id = ${opportunityRef}
      LIMIT 1
    `.catch(() => [] as any[]);

    const o = opportunities[0];
    if (!o) throw new NotFoundException('opportunity_not_found');

    const interests = await this.prisma.$queryRaw<any[]>`
      SELECT * FROM public.opportunity_interests
      WHERE member_id = ${userId} AND opportunity_id = ${opportunityRef}
      LIMIT 1
    `.catch(() => [] as any[]);

    const poster = o.poster_id
      ? await this.prisma.$queryRaw<any[]>`
          SELECT id, name, company, phone FROM public.members
          WHERE id = ${o.poster_id} OR user_id = ${o.poster_id}::uuid
          LIMIT 1
        `.catch(() => [] as any[])
      : [];

    const p = poster[0];
    const assoc = await this.prisma.$queryRaw<any[]>`
      SELECT name FROM public.associations WHERE id = ${communityId}::uuid LIMIT 1
    `.catch(() => [] as any[]);

    const now = Date.now();
    const deadlineMs = o.deadline ? new Date(o.deadline).getTime() : null;
    const daysLeft = deadlineMs ? Math.max(0, Math.ceil((deadlineMs - now) / (1000 * 60 * 60 * 24))) : null;

    return {
      opportunity: {
        opportunityRef: o.id,
        title: o.title,
        categoryKey: o.type || 'opp.type.partnership',
        organizationLabel: p?.company || p?.name || 'Doanh nghiệp thành viên',
        shortDescription: o.description ? o.description.substring(0, 160) : null,
        publishedAt: o.created_at ? new Date(o.created_at).toISOString() : new Date().toISOString(),
        expiresAt: o.deadline ? new Date(o.deadline).toISOString() : null,
        daysLeft,
        interested: interests.length > 0,
        interestLevel: interests[0]?.interest_level || (interests.length > 0 ? 'high' : null),
      },
      description: o.description || null,
      regionLabel: o.region || 'Toàn quốc',
      industryLabel: o.industry || 'Đa ngành',
      budgetMin: o.budget_min != null ? Number(o.budget_min) : null,
      budgetMax: o.budget_max != null ? Number(o.budget_max) : null,
      poster: p ? {
        memberRef: p.id,
        displayName: p.name,
      } : null,
      communityId,
      communityName: assoc[0]?.name || 'CLB Doanh Nhân CEO 1983',
      canExpressInterest: true,
      followUp: null,
      followUpHistory: [],
      followUpAttachments: [],
      claimedBy: o.claimed_by_name ? {
        id: o.claimed_by_id,
        name: o.claimed_by_name,
        at: o.claimed_at,
        phone: o.claimed_phone,
        company: o.claimed_company,
      } : null,
      image: o.image || null,
      thumbnail: o.image || null,
    };
  }

  async createCommunityOpportunity(userId: string, communityId: string, data: any) {
    const oppId = `OPP-${Date.now().toString(36).toUpperCase()}`;
    const member = await this.prisma.$queryRaw<any[]>`
      SELECT id, name, phone, company FROM public.members 
      WHERE user_id = ${userId}::uuid OR id = ${userId}
      LIMIT 1
    `.catch(() => [] as any[]);
    const posterName = member[0]?.name || 'Hội viên CEO 1983';

    await this.prisma.$executeRaw`
      INSERT INTO public.opportunities (
        id, association_id, poster_id, title, description, type,
        budget_min, budget_max, region, industry, deadline, status, views, emoji, created_at
      ) VALUES (
        ${oppId}, ${communityId}::uuid, ${userId}, ${data.title || 'Cơ hội hợp tác mới'},
        ${data.description || ''}, ${data.type || 'opp.type.partnership'},
        ${data.budgetMin ? BigInt(data.budgetMin) : BigInt(0)},
        ${data.budgetMax ? BigInt(data.budgetMax) : BigInt(0)},
        ${data.region || 'Toàn quốc'}, ${data.industry || 'Đa ngành'},
        ${data.deadline ? new Date(data.deadline) : new Date(Date.now() + 30 * 86400000)},
        'open', 0, ${data.emoji || '🤝'}, now()
      )
    `;

    return {
      ok: true,
      opportunityId: oppId,
      title: data.title,
    };
  }

  async createCommunityNews(userId: string, communityId: string, data: any) {
    const newsId = `NEWS-${Date.now().toString(36).toUpperCase()}`;
    const code = `N${Date.now().toString().slice(-6)}`;
    const member = await this.prisma.$queryRaw<any[]>`
      SELECT name FROM public.members 
      WHERE user_id = ${userId}::uuid OR id = ${userId}
      LIMIT 1
    `.catch(() => [] as any[]);
    const authorName = member[0]?.name || 'Ban Thư Ký';

    await this.prisma.$executeRaw`
      INSERT INTO public.news (
        id, code, title, category, author, published_at, views, status, excerpt, content, cover_image, association_id, created_at, updated_at
      ) VALUES (
        ${newsId}, ${code}, ${data.title || 'Thông báo mới'},
        ${data.category || 'Tin Hiệp Hội'}, ${authorName},
        now(), 0, 'published', ${data.excerpt || ''},
        ${data.content || ''}, ${data.coverImage || '/ceo1983_hero_cosmos_skyline.jpg'},
        ${communityId}::uuid, now(), now()
      )
    `;

    return {
      ok: true,
      newsId,
      title: data.title,
    };
  }

  async claimCommunityOpportunity(userId: string, communityId: string, opportunityRef: string) {
    const member = await this.prisma.$queryRaw<any[]>`
      SELECT id, name, phone, company FROM public.members 
      WHERE user_id = ${userId}::uuid OR id = ${userId}
      LIMIT 1
    `.catch(() => [] as any[]);

    const userProfile = await this.prisma.$queryRaw<any[]>`
      SELECT display_name, company_name FROM public.user_profiles
      WHERE user_id = ${userId}::uuid
      LIMIT 1
    `.catch(() => [] as any[]);

    const claimantName = member[0]?.name || userProfile[0]?.display_name || 'Hội viên CEO 1983';
    const claimantPhone = member[0]?.phone || '';
    const claimantCompany = member[0]?.company || userProfile[0]?.company_name || '';

    // 0. Fetch opportunity title & poster_id first to validate ownership
    const oppRow = await this.prisma.$queryRaw<any[]>`
      SELECT id, title, poster_id, association_id FROM public.opportunities WHERE id = ${opportunityRef} LIMIT 1
    `.catch(() => [] as any[]);
    if (!oppRow || oppRow.length === 0) {
      throw new NotFoundException('Không tìm thấy thông tin cơ hội giao thương này trên hệ thống!');
    }
    const posterId = oppRow[0]?.poster_id;
    if (posterId && (posterId.toString() === userId.toString() || posterId.toString() === member[0]?.id?.toString() || posterId.toString() === member[0]?.code?.toString())) {
      throw new BadRequestException('Bạn là người đăng cơ hội này nên không thể tự nhận hoặc tự ứng tuyển cho chính mình!');
    }
    const oppTitle = oppRow[0]?.title || 'Cơ hội kết nối';
    const assocId = (communityId && communityId.trim().length > 10) ? communityId.trim() : (oppRow[0]?.association_id || null);

    // 1. Update opportunity claim record
    await this.prisma.$executeRaw`
      UPDATE public.opportunities
      SET 
        claimed_by_id = ${userId},
        claimed_by_name = ${claimantName},
        claimed_at = now(),
        claimed_phone = ${claimantPhone},
        claimed_company = ${claimantCompany}
      WHERE id = ${opportunityRef}
    `;

    // 3. Record interest in opportunity_interests
    const intId = `INT-${Date.now().toString(36).toUpperCase()}`;
    await this.prisma.$executeRaw`
      INSERT INTO public.opportunity_interests (
        id, opportunity_id, member_id, message, contact, interest_level, created_at, association_id
      ) VALUES (
        ${intId}, ${opportunityRef}, ${userId}, 'Đã nhận cơ hội trên ứng dụng CEO 1983 Mobile', ${claimantPhone}, 'high', now(), ${assocId}::uuid
      )
      ON CONFLICT (id) DO NOTHING
    `.catch((err) => console.warn('Interest insert error:', err));

    // 4. Save notification for claimant in business_notifications (App bell icon)
    const notifClaimantId = crypto.randomUUID();
    const dedupeClaimant = `claim_${opportunityRef}_${userId}_${Date.now()}`;
    await this.prisma.$executeRaw`
      INSERT INTO public.business_notifications (
        id, recipient_user_id, source_domain, source_record_id, dedupe_key, event_kind, notification_kind,
        title_key, body_key, safe_display_data, priority, status, app_scope, target_app, created_at, updated_at
      ) VALUES (
        ${notifClaimantId}::uuid, ${userId}::uuid, 'opportunity', ${opportunityRef}, ${dedupeClaimant}, 'opportunity_claimed', 'opportunity_claimed',
        'Đã tiếp nhận cơ hội thành công',
        ${`Bạn đã tiếp nhận cơ hội "${oppTitle}". Dữ liệu đã đồng bộ về hệ thống CRM.`},
        ${JSON.stringify({ opportunityId: opportunityRef, title: oppTitle, claimantName, claimantCompany, communityId })}::jsonb,
        'high', 'delivered', 'all', 'all', now(), now()
      )
    `.catch((err) => console.warn('Notif claimant error:', err));

    // 5. If poster is another user, notify the poster
    let notifPosterId = '';
    if (posterId && posterId !== userId) {
      notifPosterId = crypto.randomUUID();
      const dedupePoster = `claim_peer_${opportunityRef}_${posterId}_${Date.now()}`;
      await this.prisma.$executeRaw`
        INSERT INTO public.business_notifications (
          id, recipient_user_id, source_domain, source_record_id, dedupe_key, event_kind, notification_kind,
          title_key, body_key, safe_display_data, priority, status, app_scope, target_app, created_at, updated_at
        ) VALUES (
          ${notifPosterId}::uuid, ${posterId}::uuid, 'opportunity', ${opportunityRef}, ${dedupePoster}, 'opportunity_claimed_by_peer', 'opportunity_claimed_by_peer',
          'Cơ hội của bạn đã có người nhận kết nối',
          ${`${claimantName} (${claimantCompany || 'Doanh nghiệp'}) đã tiếp nhận cơ hội "${oppTitle}".`},
          ${JSON.stringify({ opportunityId: opportunityRef, title: oppTitle, claimantName, claimantCompany, claimantPhone })}::jsonb,
          'high', 'delivered', 'all', 'all', now(), now()
        )
      `.catch((err) => console.warn('Notif poster error:', err));
    }

    // 6. Broadcast notification to CRM (public.notifications)
    const crmCode = `NOTIF-OPP-${Date.now().toString().slice(-6)}`;
    await this.prisma.$executeRaw`
      INSERT INTO public.notifications (
        id, code, title, body, audience, channel, status, sent_at, reach, association_id, app_scope, target_app, created_at, updated_at
      ) VALUES (
        gen_random_uuid(), ${crmCode},
        'Tiếp nhận cơ hội kết nối',
        ${`${claimantName} (${claimantCompany}) đã tiếp nhận cơ hội: ${oppTitle}`},
        'all', 'inapp', 'sent', now(), 0, ${communityId ? communityId : null}::uuid, 'all', 'all', now(), now()
      )
    `.catch((err) => console.warn('CRM notif error:', err));

    // 7. Realtime WebSockets emission to claimant, poster and CRM
    try {
      this.gateway.emitNotification(userId, {
        id: notifClaimantId,
        title: 'Đã tiếp nhận cơ hội thành công',
        body: `Bạn đã tiếp nhận cơ hội "${oppTitle}". Dữ liệu đã đồng bộ về hệ thống CRM.`,
        notificationKind: 'opportunity_claimed',
        appScope: 'all',
        createdAt: new Date().toISOString(),
      });
      this.gateway.emitUnreadNotificationCount(userId, 1);

      if (posterId && posterId !== userId) {
        this.gateway.emitNotification(posterId, {
          id: notifPosterId,
          title: 'Cơ hội của bạn đã có người nhận kết nối',
          body: `${claimantName} (${claimantCompany || 'Doanh nghiệp'}) đã tiếp nhận cơ hội "${oppTitle}".`,
          notificationKind: 'opportunity_claimed_by_peer',
          appScope: 'all',
          createdAt: new Date().toISOString(),
        });
        this.gateway.emitUnreadNotificationCount(posterId, 1);
      }

      this.gateway.emitToAll('notification:new', {
        title: 'Tiếp nhận cơ hội kết nối',
        body: `${claimantName} (${claimantCompany}) đã tiếp nhận cơ hội: ${oppTitle}`,
        appScope: 'all',
        sentAt: new Date().toISOString(),
      });
      this.gateway.emitToAll('notification:count', {});
    } catch (wsErr) {
      console.warn('Realtime WS emit error:', wsErr);
    }

    return {
      ok: true,
      claimedBy: {
        id: userId,
        name: claimantName,
        phone: claimantPhone,
        company: claimantCompany,
        at: new Date().toISOString(),
      },
    };
  }

  async expressCommunityOpportunityInterest(
    userId: string,
    communityId: string,
    opportunityRef: string,
    interestLevel?: string
  ) {
    const now = new Date();
    const intId = `INT-${Date.now().toString(36).toUpperCase()}`;

    const member = await this.prisma.$queryRaw<any[]>`
      SELECT id, name, phone, company, contact FROM public.members WHERE user_id = ${userId}::uuid LIMIT 1
    `.catch(() => [] as any[]);
    const contact = member[0]?.phone || member[0]?.contact || '';
    const claimantName = member[0]?.name || 'Hội viên CEO 1983';
    const claimantCompany = member[0]?.company || '';

    // Fetch opp title, poster & association
    const oppRow = await this.prisma.$queryRaw<any[]>`
      SELECT id, title, poster_id, association_id FROM public.opportunities WHERE id = ${opportunityRef} LIMIT 1
    `.catch(() => [] as any[]);
    if (!oppRow || oppRow.length === 0) {
      throw new NotFoundException('Không tìm thấy thông tin cơ hội giao thương này trên hệ thống!');
    }
    const posterId = oppRow[0]?.poster_id;
    if (posterId && (posterId.toString() === userId.toString() || posterId.toString() === member[0]?.id?.toString() || posterId.toString() === member[0]?.code?.toString())) {
      throw new BadRequestException('Bạn là người đăng cơ hội này nên không thể tự gửi yêu cầu quan tâm cho chính mình!');
    }
    const oppTitle = oppRow[0]?.title || 'Cơ hội kết nối';
    const assocId = (communityId && communityId.trim().length > 10) ? communityId.trim() : (oppRow[0]?.association_id || null);

    await this.prisma.$executeRaw`
      INSERT INTO public.opportunity_interests (
        id, opportunity_id, member_id, message, contact, interest_level, created_at, association_id
      ) VALUES (
        ${intId}, ${opportunityRef}, ${userId}, ${interestLevel === 'high' ? 'Quan tâm cao cơ hội này' : 'Quan tâm thấp cơ hội này'}, ${contact}, ${interestLevel || 'high'}, ${now}, ${assocId}::uuid
      )
      ON CONFLICT (id) DO UPDATE SET
        interest_level = EXCLUDED.interest_level,
        message = EXCLUDED.message
    `.catch((err) => console.warn('Express interest insert error:', err));

    // Save notification for user
    const notifId = crypto.randomUUID();
    const dedupeInterest = `interest_${opportunityRef}_${userId}_${Date.now()}`;
    const isLow = interestLevel === 'low';
    const notifTitle = isLow ? 'Đã chuyển cơ hội sang quan tâm thấp' : 'Đã gửi mức độ quan tâm cơ hội';
    const notifBody = isLow
      ? `Bạn đã chuyển cơ hội "${oppTitle}" sang mức quan tâm thấp.`
      : `Bạn đã đăng ký quan tâm cơ hội "${oppTitle}". Dữ liệu đã đồng bộ về CRM.`;

    await this.prisma.$executeRaw`
      INSERT INTO public.business_notifications (
        id, recipient_user_id, source_domain, source_record_id, dedupe_key, event_kind, notification_kind,
        title_key, body_key, safe_display_data, priority, status, app_scope, target_app, created_at, updated_at
      ) VALUES (
        ${notifId}::uuid, ${userId}::uuid, 'opportunity', ${opportunityRef}, ${dedupeInterest}, 'opportunity_interest_sent', 'opportunity_interest_sent',
        ${notifTitle},
        ${notifBody},
        ${JSON.stringify({ opportunityId: opportunityRef, title: oppTitle, interestLevel, communityId })}::jsonb,
        'medium', 'delivered', 'all', 'all', now(), now()
      )
    `.catch((err) => console.warn('Notif interest error:', err));

    // Realtime notification
    try {
      this.gateway.emitNotification(userId, {
        id: notifId,
        title: notifTitle,
        body: notifBody,
        notificationKind: 'opportunity_interest_sent',
        appScope: 'all',
        createdAt: now.toISOString(),
      });
      this.gateway.emitUnreadNotificationCount(userId, 1);

      this.gateway.emitToAll('notification:new', {
        title: isLow ? 'Doanh nghiệp chuyển cơ hội sang quan tâm thấp' : 'Doanh nghiệp đăng ký quan tâm cơ hội',
        body: `${claimantName} (${claimantCompany}) ${isLow ? 'chuyển sang quan tâm thấp' : 'đăng ký quan tâm'} cơ hội: ${oppTitle}`,
        appScope: 'all',
        sentAt: now.toISOString(),
      });
      this.gateway.emitToAll('notification:count', {});
    } catch (wsErr) {
      console.warn('Realtime WS error:', wsErr);
    }

    return { ok: true };
  }

  async withdrawCommunityOpportunityInterest(userId: string, communityId: string, opportunityRef: string) {
    await this.prisma.$executeRaw`
      DELETE FROM public.opportunity_interests
      WHERE opportunity_id = ${opportunityRef} AND member_id = ${userId}
    `.catch(() => null);
    return { ok: true };
  }

  async scheduleCommunityOpportunityFollowUp(userId: string, communityId: string, opportunityRef: string, inDays: number) {
    const nextAction = new Date(Date.now() + inDays * 24 * 60 * 60 * 1000);
    const now = new Date();

    await this.prisma.$executeRaw`
      INSERT INTO public.community_opportunity_followups (
        user_id, opportunity_id, next_action_at, progress, note, created_at, updated_at
      ) VALUES (
        ${userId}::uuid, ${opportunityRef}::uuid, ${nextAction}, 'planned', '', ${now}, ${now}
      )
      ON CONFLICT (user_id, opportunity_id) DO UPDATE SET
        next_action_at = EXCLUDED.next_action_at,
        updated_at = EXCLUDED.updated_at
    `;
    return { ok: true };
  }

  async updateCommunityOpportunityFollowUp(userId: string, communityId: string, opportunityRef: string, action: string) {
    const now = new Date();
    if (action === 'done' || action === 'cancel') {
      await this.prisma.$executeRaw`
        UPDATE public.community_opportunity_followups
        SET next_action_at = NULL, updated_at = ${now}
        WHERE user_id = ${userId}::uuid AND opportunity_id = ${opportunityRef}::uuid
      `;
    }
    return { ok: true };
  }

  async saveCommunityOpportunityProgress(userId: string, communityId: string, opportunityRef: string, progress: string, note: string) {
    const now = new Date();
    await this.prisma.$executeRaw`
      INSERT INTO public.community_opportunity_followups (
        user_id, opportunity_id, next_action_at, progress, note, created_at, updated_at
      ) VALUES (
        ${userId}::uuid, ${opportunityRef}::uuid, NULL, ${progress}, ${note || ''}, ${now}, ${now}
      )
      ON CONFLICT (user_id, opportunity_id) DO UPDATE SET
        progress = EXCLUDED.progress,
        note = EXCLUDED.note,
        updated_at = EXCLUDED.updated_at
    `;
    return { ok: true };
  }

  async addCommunityOpportunityAttachment(userId: string, input: any) {
    const attachmentId = crypto.randomUUID();
    const now = new Date();

    await this.prisma.$executeRaw`
      INSERT INTO public.community_opportunity_followup_attachments (
        id, user_id, opportunity_id, kind, title, url, storage_path, mime_type, size_bytes, created_at, updated_at
      ) VALUES (
        ${attachmentId}::uuid, ${userId}::uuid, ${input.opportunityRef}::uuid, ${input.kind},
        ${input.title || null}, ${input.url || null}, ${input.storagePath || null},
        ${input.mimeType || null}, ${input.sizeBytes || null}, ${now}, ${now}
      )
    `;
    return { ok: true };
  }

  async removeCommunityOpportunityAttachment(userId: string, attachmentId: string) {
    await this.prisma.$executeRaw`
      DELETE FROM public.community_opportunity_followup_attachments
      WHERE id = ${attachmentId}::uuid AND user_id = ${userId}::uuid
    `;
    return { ok: true };
  }

  // ── CRM & Full System Opportunity CRUD ─────────────────────────────────────
  async listAllOpportunities(userId: string) {
    try {
      const opps = await this.prisma.$queryRaw<any[]>`
        SELECT o.id, o.poster_id, o.title, o.description, o.type, o.budget_min, o.budget_max, o.region, o.industry, o.deadline, o.status, o.views, o.emoji, o.created_at, o.updated_at,
               o.claimed_by_id, o.claimed_by_name, o.claimed_at, o.claimed_phone, o.claimed_company, o.association_id,
               COALESCE(o.contact_name, m.contact, m.name, u.name, 'Ban Quản Trị') as contact_name,
               COALESCE(o.contact_phone, m.phone, '') as contact_phone,
               COALESCE(o.contact_title, m.executive_role, 'Đại diện hợp tác') as contact_title,
               COALESCE(o.company, m.name, bi.company_name, 'CLB Doanh Nhân CEO 1983') as company,
               o.image,
               COALESCE(m.contact, u.name, m.name, o.contact_name, 'Hội viên CLB') as poster_name,
               COALESCE(m.cover_url, u.avatar_url, '') as poster_avatar,
               COALESCE(m.phone, o.contact_phone, '') as poster_phone,
               COALESCE(o.company, m.name, bi.company_name, 'CLB Doanh Nhân CEO 1983') as poster_company
        FROM public.opportunities o
        LEFT JOIN public.members m ON (o.poster_id = m.user_id::text OR o.poster_id = m.id OR o.poster_id = m.code)
        LEFT JOIN public.vione_users u ON (o.poster_id = u.id::text)
        LEFT JOIN public.business_identities bi ON (o.poster_id = bi.owner_user_id::text)
        ORDER BY o.created_at DESC
      `.catch(() => []);

      const interests = await this.prisma.$queryRaw<any[]>`
        SELECT oi.id, oi.opportunity_id, oi.member_id, oi.message, oi.contact, oi.interest_level, oi.created_at,
               COALESCE(m.contact, m.name, u.name, oi.contact, 'Hội viên') as member_name,
               COALESCE(m.cover_url, u.avatar_url, '') as member_avatar,
               COALESCE(m.phone, oi.contact, '') as member_phone,
               COALESCE(m.email, u.email, '') as member_email,
               COALESCE(m.name, bi.company_name, '') as member_company
        FROM public.opportunity_interests oi
        LEFT JOIN public.members m ON (oi.member_id = m.user_id::text OR oi.member_id = m.id OR oi.member_id = m.code)
        LEFT JOIN public.vione_users u ON (oi.member_id = u.id::text)
        LEFT JOIN public.business_identities bi ON (oi.member_id = bi.owner_user_id::text)
        ORDER BY oi.created_at DESC
      `.catch(() => []);

      const interestCounts: Record<string, number> = {};
      for (const it of interests) {
        const oppId = String(it.opportunity_id);
        interestCounts[oppId] = (interestCounts[oppId] || 0) + 1;
      }

      return {
        opportunities: opps.map(r => ({
          id: String(r.id),
          posterId: String(r.poster_id || ''),
          posterName: r.poster_name || undefined,
          posterAvatar: r.poster_avatar || undefined,
          posterPhone: r.poster_phone || undefined,
          posterCompany: r.poster_company || undefined,
          title: r.title,
          description: r.description || '',
          type: r.type || 'opp.type.partnership',
          budgetMin: r.budget_min != null ? Number(r.budget_min) : undefined,
          budgetMax: r.budget_max != null ? Number(r.budget_max) : undefined,
          region: r.region || '',
          industry: r.industry || '',
          deadline: r.deadline ? new Date(r.deadline).toISOString() : new Date().toISOString(),
          status: r.status || 'open',
          createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
          views: Number(r.views || 0),
          emoji: r.emoji || '💡',
          claimedById: r.claimed_by_id || undefined,
          claimedByName: r.claimed_by_name || undefined,
          claimedAt: r.claimed_at ? new Date(r.claimed_at).toISOString() : undefined,
          claimedPhone: r.claimed_phone || undefined,
          claimedCompany: r.claimed_company || undefined,
          contactName: r.contact_name || undefined,
          contactPhone: r.contact_phone || undefined,
          contactTitle: r.contact_title || undefined,
          company: r.company || undefined,
          image: r.image || undefined,
          thumbnail: r.image || undefined,
        })),
        interests: interests.map(it => ({
          id: String(it.id),
          opportunityId: String(it.opportunity_id),
          memberId: String(it.member_id || ''),
          memberName: it.member_name || undefined,
          memberAvatar: it.member_avatar || undefined,
          memberPhone: it.member_phone || undefined,
          memberEmail: it.member_email || undefined,
          memberCompany: it.member_company || undefined,
          message: it.message || '',
          contact: it.contact || it.member_phone || '',
          interestLevel: it.interest_level || 'high',
          createdAt: it.created_at ? new Date(it.created_at).toISOString() : new Date().toISOString(),
        })),
        interestCounts,
      };
    } catch (err) {
      console.error('Error in listAllOpportunities:', err);
      return { opportunities: [], interests: [], interestCounts: {} };
    }
  }

  async getOpportunityById(opportunityId: string) {
    try {
      const opps = await this.prisma.$queryRaw<any[]>`
        SELECT o.*,
               COALESCE(o.contact_name, m.contact, m.name, u.name, 'Ban Quản Trị') as contact_name,
               COALESCE(o.contact_phone, m.phone, '') as contact_phone,
               COALESCE(o.contact_title, m.executive_role, 'Đại diện hợp tác') as contact_title,
               COALESCE(o.company, m.name, bi.company_name, 'CLB Doanh Nhân CEO 1983') as company,
               COALESCE(m.contact, u.name, m.name, o.contact_name, 'Hội viên CLB') as poster_name,
               COALESCE(m.cover_url, u.avatar_url, '') as poster_avatar,
               COALESCE(m.phone, o.contact_phone, '') as poster_phone,
               COALESCE(o.company, m.name, bi.company_name, 'CLB Doanh Nhân CEO 1983') as poster_company
        FROM public.opportunities o
        LEFT JOIN public.members m ON (o.poster_id = m.user_id::text OR o.poster_id = m.id OR o.poster_id = m.code)
        LEFT JOIN public.vione_users u ON (o.poster_id = u.id::text)
        LEFT JOIN public.business_identities bi ON (o.poster_id = bi.owner_user_id::text)
        WHERE o.id = ${opportunityId} LIMIT 1
      `.catch(() => []);
      if (!opps[0]) return null;
      const r = opps[0];

      const interests = await this.prisma.$queryRaw<any[]>`
        SELECT oi.id, oi.opportunity_id, oi.member_id, oi.message, oi.contact, oi.interest_level, oi.created_at,
               COALESCE(m.contact, m.name, u.name, oi.contact, 'Hội viên') as member_name,
               COALESCE(m.cover_url, u.avatar_url, '') as member_avatar,
               COALESCE(m.phone, oi.contact, '') as member_phone,
               COALESCE(m.email, u.email, '') as member_email,
               COALESCE(m.name, bi.company_name, '') as member_company
        FROM public.opportunity_interests oi
        LEFT JOIN public.members m ON (oi.member_id = m.user_id::text OR oi.member_id = m.id OR oi.member_id = m.code)
        LEFT JOIN public.vione_users u ON (oi.member_id = u.id::text)
        LEFT JOIN public.business_identities bi ON (oi.member_id = bi.owner_user_id::text)
        WHERE oi.opportunity_id = ${opportunityId}
        ORDER BY oi.created_at DESC
      `.catch(() => []);

      return {
        opportunity: {
          id: String(r.id),
          posterId: String(r.poster_id || ''),
          posterName: r.poster_name || undefined,
          posterAvatar: r.poster_avatar || undefined,
          posterPhone: r.poster_phone || undefined,
          posterCompany: r.poster_company || undefined,
          title: r.title,
          description: r.description || '',
          type: r.type || 'opp.type.partnership',
          budgetMin: r.budget_min != null ? Number(r.budget_min) : undefined,
          budgetMax: r.budget_max != null ? Number(r.budget_max) : undefined,
          region: r.region || '',
          industry: r.industry || '',
          deadline: r.deadline ? new Date(r.deadline).toISOString() : new Date().toISOString(),
          status: r.status || 'open',
          createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
          views: Number(r.views || 0),
          emoji: r.emoji || '💡',
          claimedById: r.claimed_by_id || undefined,
          claimedByName: r.claimed_by_name || undefined,
          claimedAt: r.claimed_at ? new Date(r.claimed_at).toISOString() : undefined,
          claimedPhone: r.claimed_phone || undefined,
          claimedCompany: r.claimed_company || undefined,
          contactName: r.contact_name || undefined,
          contactPhone: r.contact_phone || undefined,
          contactTitle: r.contact_title || undefined,
          company: r.company || undefined,
          image: r.image || undefined,
          thumbnail: r.image || undefined,
        },
        interests: interests.map(it => ({
          id: String(it.id),
          opportunityId: String(it.opportunity_id),
          memberId: String(it.member_id || ''),
          memberName: it.member_name || undefined,
          memberAvatar: it.member_avatar || undefined,
          memberPhone: it.member_phone || undefined,
          memberEmail: it.member_email || undefined,
          memberCompany: it.member_company || undefined,
          message: it.message || '',
          contact: it.contact || it.member_phone || '',
          interestLevel: it.interest_level || 'high',
          createdAt: it.created_at ? new Date(it.created_at).toISOString() : new Date().toISOString(),
        })),
      };
    } catch (err) {
      console.error('Error in getOpportunityById:', err);
      return null;
    }
  }

  async createOpportunity(userId: string, data: any) {
    const oppId = data.id || `OPP-${Date.now().toString(36).toUpperCase()}`;
    const assocId = data.associationId || 'c1983000-0000-4000-8000-000000001983';

    // Fetch poster details (member or account)
    const mem = await this.prisma.$queryRaw<any[]>`
      SELECT id, name, phone, code FROM public.members
      WHERE user_id = ${userId}::uuid OR id = ${userId}
      LIMIT 1
    `.catch(() => []);
    const vu = await this.prisma.$queryRaw<any[]>`
      SELECT name, email, phone FROM public.vione_users
      WHERE id = ${userId}::uuid OR id::text = ${userId}
      LIMIT 1
    `.catch(() => []);

    const contactName = (data.contactName || mem[0]?.name || vu[0]?.name || 'Ban Quản Trị').trim();
    const contactPhone = (data.contactPhone || mem[0]?.phone || vu[0]?.phone || '').trim();
    const contactTitle = (data.contactTitle || 'Đại diện hợp tác').trim();
    const company = (data.company || 'CLB Doanh Nhân CEO 1983').trim();
    const oppImage = data.image || data.thumbnail || null;

    try {
      await this.prisma.$executeRaw`
        INSERT INTO public.opportunities (
          id, association_id, poster_id, title, description, type,
          budget_min, budget_max, region, industry, deadline, status, views, emoji,
          image, contact_name, contact_phone, contact_title, company, created_at, updated_at
        ) VALUES (
          ${oppId}, ${assocId}::uuid, ${userId}, ${data.title || 'Cơ hội mới'},
          ${data.description || ''}, ${data.type || 'opp.type.partnership'},
          ${data.budgetMin ? BigInt(data.budgetMin) : BigInt(0)},
          ${data.budgetMax ? BigInt(data.budgetMax) : BigInt(0)},
          ${data.region || 'Toàn quốc'}, ${data.industry || 'Đa ngành'},
          ${data.deadline ? new Date(data.deadline) : new Date(Date.now() + 30 * 86400000)},
          'open', 0, ${data.emoji || '💡'},
          ${oppImage}, ${contactName}, ${contactPhone || null}, ${contactTitle}, ${company},
          now(), now()
        )
      `;
    } catch (err: any) {
      console.warn('createOpportunity primary insert failed, using fallback:', err?.message);
      await this.prisma.$executeRaw`
        INSERT INTO public.opportunities (
          id, association_id, poster_id, title, description, type,
          budget_min, budget_max, region, industry, deadline, status, views, emoji, created_at, updated_at
        ) VALUES (
          ${oppId}, ${assocId}::uuid, ${userId}, ${data.title || 'Cơ hội mới'},
          ${data.description || ''}, ${data.type || 'opp.type.partnership'},
          ${data.budgetMin ? BigInt(data.budgetMin) : BigInt(0)},
          ${data.budgetMax ? BigInt(data.budgetMax) : BigInt(0)},
          ${data.region || 'Toàn quốc'}, ${data.industry || 'Đa ngành'},
          ${data.deadline ? new Date(data.deadline) : new Date(Date.now() + 30 * 86400000)},
          'open', 0, ${data.emoji || '💡'}, now(), now()
        )
      `;
    }
    return { ok: true, id: oppId };
  }

  async deleteOpportunity(userId: string, opportunityId: string) {
    await this.prisma.$executeRaw`
      DELETE FROM public.opportunity_interests WHERE opportunity_id = ${opportunityId}
    `.catch(() => {});
    await this.prisma.$executeRaw`
      DELETE FROM public.opportunities WHERE id = ${opportunityId}
    `.catch(() => {});
    return { ok: true };
  }

  async updateOpportunity(userId: string, opportunityId: string, data: any) {
    const oppImage = data.image !== undefined ? data.image : data.thumbnail;
    await this.prisma.$executeRaw`
      UPDATE public.opportunities
      SET
        title = COALESCE(${data.title}, title),
        description = COALESCE(${data.description}, description),
        type = COALESCE(${data.type}, type),
        budget_min = COALESCE(${data.budgetMin ? BigInt(data.budgetMin) : null}, budget_min),
        budget_max = COALESCE(${data.budgetMax ? BigInt(data.budgetMax) : null}, budget_max),
        region = COALESCE(${data.region}, region),
        industry = COALESCE(${data.industry}, industry),
        deadline = COALESCE(${data.deadline ? new Date(data.deadline) : null}, deadline),
        contact_name = COALESCE(${data.contactName}, contact_name),
        contact_phone = COALESCE(${data.contactPhone}, contact_phone),
        contact_title = COALESCE(${data.contactTitle}, contact_title),
        company = COALESCE(${data.company}, company),
        image = COALESCE(${oppImage}, image),
        updated_at = now()
      WHERE id = ${opportunityId}
    `.catch(async () => {
      await this.prisma.$executeRaw`
        UPDATE public.opportunities
        SET
          title = COALESCE(${data.title}, title),
          description = COALESCE(${data.description}, description),
          type = COALESCE(${data.type}, type),
          updated_at = now()
        WHERE id = ${opportunityId}
      `;
    });
    return { ok: true };
  }

  async toggleOpportunityStatus(userId: string, opportunityId: string) {
    const opps = await this.prisma.$queryRaw<any[]>`
      SELECT status FROM public.opportunities WHERE id = ${opportunityId} LIMIT 1
    `.catch(() => []);
    const current = opps[0]?.status || 'open';
    const nextStatus = current === 'open' ? 'closed' : 'open';
    await this.prisma.$executeRaw`
      UPDATE public.opportunities SET status = ${nextStatus}, updated_at = now() WHERE id = ${opportunityId}
    `;
    return { ok: true, status: nextStatus };
  }

  async listMyOpportunities(userId: string) {
    try {
      const opportunities = await this.prisma.$queryRaw<any[]>`
        SELECT o.*, a.name as association_name,
               m.code as poster_code,
               COALESCE(up.display_name, vu.name, m.contact, m.name, o.claimed_by_name, 'Hội viên CLB CEO 1983') as poster_name,
               COALESCE(m.name, bi.company_name, o.claimed_company, a.name, 'CLB Doanh Nhân CEO 1983') as poster_company
        FROM public.opportunities o
        LEFT JOIN public.associations a ON o.association_id = a.id
        LEFT JOIN public.members m ON m.user_id::text = o.poster_id OR m.id = o.poster_id OR m.code = o.poster_id
        LEFT JOIN public.user_profiles up ON up.user_id::text = o.poster_id
        LEFT JOIN public.vione_users vu ON vu.id::text = o.poster_id
        LEFT JOIN public.business_identities bi ON bi.owner_user_id::text = o.poster_id
        WHERE o.status IN ('open', 'published', 'active')
        ORDER BY o.created_at DESC
        LIMIT 50
      `.catch(() => [] as any[]);

      const oppIds = opportunities.map(o => o.id);
      let myInterests = new Set<string>();
      if (oppIds.length > 0) {
        const ints = await this.prisma.$queryRaw<any[]>`
          SELECT opportunity_id FROM public.opportunity_interests
          WHERE contact = ${userId} OR member_id::text = ${userId}
        `.catch(() => [] as any[]);
        myInterests = new Set(ints.map(i => String(i.opportunity_id)));
      }

      const OPP_COLORS = ['#D97706', '#F59E0B', '#B45309', '#D8B282', '#EDB028'];

      const myMembers = await this.prisma.$queryRaw<any[]>`
        SELECT id, code, user_id FROM public.members
        WHERE user_id::text = ${userId} OR id = ${userId}
      `.catch(() => [] as any[]);
      const myIds = new Set<string>([
        String(userId).toLowerCase(),
        ...(myMembers[0]?.id ? [String(myMembers[0].id).toLowerCase()] : []),
        ...(myMembers[0]?.code ? [String(myMembers[0].code).toLowerCase()] : []),
        ...(myMembers[0]?.user_id ? [String(myMembers[0].user_id).toLowerCase()] : []),
      ]);

      if (opportunities.length === 0) {
        return [];
      }

      const TAG_VI_MAP: Record<string, string> = {
        partnership: 'Hợp tác B2B',
        investment: 'Đầu tư & Vốn',
        trade: 'Giao thương',
        supply: 'Cung ứng',
        b2b: 'Hợp tác B2B',
        export: 'Xuất nhập khẩu',
      };

      return opportunities.map((o, i) => {
        const rawTag = o.type || o.tag || 'Hợp tác B2B';
        const tagVi = TAG_VI_MAP[rawTag.toLowerCase()] || rawTag;
        const bMin = o.budget_min ? Number(o.budget_min) : undefined;
        const bMax = o.budget_max ? Number(o.budget_max) : undefined;
        let formattedVal = o.value || o.estimated_value || '';
        if (!formattedVal && (bMin || bMax)) {
          if (bMin && bMax && bMin !== bMax) {
            formattedVal = `${bMin.toLocaleString('vi-VN')} - ${bMax.toLocaleString('vi-VN')} đ`;
          } else if (bMax) {
            formattedVal = `${bMax.toLocaleString('vi-VN')} đ`;
          } else if (bMin) {
            formattedVal = `Từ ${bMin.toLocaleString('vi-VN')} đ`;
          }
        }
        if (!formattedVal) {
          formattedVal = 'Thỏa thuận B2B';
        }

        return {
          id: String(o.id),
          tag: tagVi,
          title: o.title,
          description: o.description || o.summary || '',
          company: o.company || o.poster_company || o.association_name || o.region || o.industry || 'CLB Doanh Nhân CEO 1983',
          time: o.created_at ? new Date(o.created_at).toISOString() : new Date().toISOString(),
          color: OPP_COLORS[i % OPP_COLORS.length],
          interested: myInterests.has(String(o.id)),
          image: o.image || o.cover_image || null,
          thumbnail: o.image || o.cover_image || null,
          posterId: o.poster_id || o.poster_code || 'admin',
          posterCode: o.poster_code || o.poster_id || 'admin',
          posterName: o.contact_name || o.poster_name || o.poster_company || 'Hội viên CLB',
          contactName: o.contact_name || o.poster_name || 'Đại diện hợp tác',
          contactPhone: o.contact_phone || null,
          contactTitle: o.contact_title || 'Đại diện hợp tác',
          value: formattedVal,
          estimatedValue: Number(o.estimated_value || bMax || bMin || 0) || undefined,
          budgetMin: bMin,
          budgetMax: bMax,
          claimed: Boolean(o.claimed_by_id || o.claimed_at || o.claimed_by_name),
          claimedById: o.claimed_by_id || undefined,
          claimedByName: o.claimed_by_name || undefined,
          claimedAt: o.claimed_at ? new Date(o.claimed_at).toISOString() : undefined,
          claimedPhone: o.claimed_phone || undefined,
          claimedCompany: o.claimed_company || undefined,
          status: o.status || 'open',
          isOwner: myIds.has(String(o.poster_id || '').toLowerCase()) || (Boolean(o.poster_code) && myIds.has(String(o.poster_code).toLowerCase())),
        };
      });
    } catch {
      return [];
    }
  }

  async expressOpportunityInterest(userId: string, opportunityId: string, message?: string) {
    return this.expressCommunityOpportunityInterest(userId, '', opportunityId, 'high');
  }

  async incrementOpportunityView(opportunityId: string) {
    try {
      await this.prisma.$executeRaw`
        UPDATE public.opportunities 
        SET views = COALESCE(views, 0) + 1, updated_at = now()
        WHERE id = ${opportunityId}
      `;
      return { ok: true, id: opportunityId };
    } catch (err) {
      console.warn('incrementOpportunityView error:', err);
      return { ok: false };
    }
  }

  async getOpportunityInterestedMembers(opportunityId: string) {
    try {
      const rows = await this.prisma.$queryRaw<any[]>`
        SELECT 
          oi.id, oi.opportunity_id, oi.member_id, oi.message, oi.contact, oi.interest_level, oi.created_at,
          COALESCE(m.contact, m.name, u.name, 'Hội viên CLB') as name,
          COALESCE(m.name, bi.company_name, '') as company,
          COALESCE(m.phone, oi.contact, '') as phone,
          COALESCE(m.email, u.email, '') as email,
          COALESCE(m.code, '') as member_code
        FROM public.opportunity_interests oi
        LEFT JOIN public.members m ON (oi.member_id = m.user_id::text OR oi.member_id = m.id OR oi.member_id = m.code)
        LEFT JOIN public.vione_users u ON (oi.member_id = u.id::text)
        LEFT JOIN public.business_identities bi ON (oi.member_id = bi.owner_user_id::text)
        WHERE oi.opportunity_id = ${opportunityId}
        ORDER BY oi.created_at DESC
      `;
      return rows.map((r) => ({
        id: r.id,
        opportunityId: r.opportunity_id,
        memberId: r.member_id,
        name: r.name,
        company: r.company,
        phone: r.phone,
        email: r.email,
        contact: r.contact || r.phone,
        message: r.message,
        interestLevel: r.interest_level || 'high',
        createdAt: r.created_at,
      }));
    } catch (err) {
      console.error('getOpportunityInterestedMembers error:', err);
      return [];
    }
  }

}
