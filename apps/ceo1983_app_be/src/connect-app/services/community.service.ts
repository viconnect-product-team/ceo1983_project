import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ConnectAppGateway } from '../connect-app.gateway';
import { ConnectNetworkService } from './network.service';
import * as crypto from 'crypto';

@Injectable()
export class ConnectCommunityService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway?: ConnectAppGateway,
    private readonly networkService?: ConnectNetworkService,
  ) {}

  async getMyCommunities(userId: string) {
    const ceoAssocId = 'c1983000-0000-4000-8000-000000001983';
    let memberships = await this.prisma.$queryRaw`
      SELECT DISTINCT ON (m.association_id) 
        m.association_id, m.role, m.is_default, a.name, a.logo_url, a.banner_url, a.tagline, a.about
      FROM (
        SELECT association_id, role, is_default, user_id FROM public.memberships WHERE user_id = ${userId}::uuid
        UNION ALL
        SELECT association_id, 'member' as role, false as is_default, user_id FROM public.members WHERE user_id = ${userId}::uuid AND status = 'active'
      ) m
      JOIN public.associations a ON m.association_id = a.id
      WHERE a.id = ${ceoAssocId}::uuid
    `.catch(() => []) as any[];

    if (memberships.length === 0) {
      const defaultAssoc = await this.prisma.$queryRaw<any[]>`
        SELECT id, name, logo_url, banner_url, tagline, about FROM public.associations
        WHERE id = ${ceoAssocId}::uuid LIMIT 1
      `.catch(() => []);

      if (defaultAssoc.length > 0) {
        const d = defaultAssoc[0];
        try {
          await this.prisma.$executeRaw`
            INSERT INTO public.memberships (id, user_id, association_id, role, is_default, created_at, updated_at)
            VALUES (gen_random_uuid(), ${userId}::uuid, ${d.id}::uuid, 'member', true, now(), now())
            ON CONFLICT (user_id, association_id) DO NOTHING
          `;
        } catch {}
        memberships = [{
          association_id: d.id,
          role: 'member',
          is_default: true,
          name: d.name,
          logo_url: d.logo_url,
          banner_url: d.banner_url,
          tagline: d.tagline,
          about: d.about,
        }];
      }
    }

    const result: any[] = [];
    for (const m of memberships) {
      const activeCountRes = await this.prisma.$queryRaw`
        SELECT COUNT(DISTINCT uid)::int as count FROM (
          SELECT id::text as uid FROM public.members WHERE association_id = ${m.association_id}::uuid AND status = 'active'
          UNION
          SELECT user_id::text as uid FROM public.memberships WHERE association_id = ${m.association_id}::uuid
        ) all_m
      `.catch(() => [{ count: 0 }]) as any[];
      const count = activeCountRes[0]?.count || 0;

      result.push({
        communityId: String(m.association_id),
        name: String(m.name),
        logoUrl: m.logo_url || null,
        bannerUrl: m.banner_url || null,
        shortDescription: m.tagline || null,
        memberCount: count,
        viewerRole: m.role === 'admin' ? 'admin' : 'member',
        isDefault: m.is_default === true,
      });
    }

    return result.sort((a, b) => {
      if (a.isDefault !== b.isDefault) return a.isDefault ? -1 : 1;
      return a.name.localeCompare(b.name, 'vi');
    });
  }


  async checkCommunityMembership(userId: string, communityId: string): Promise<boolean> {
    const mem = await this.prisma.$queryRaw<any[]>`
      SELECT association_id FROM public.memberships
      WHERE user_id = ${userId}::uuid AND association_id = ${communityId}::uuid
      UNION
      SELECT association_id FROM public.members
      WHERE user_id = ${userId}::uuid AND association_id = ${communityId}::uuid AND status = 'active'
      LIMIT 1
    `.catch(() => [] as any[]);
    if (mem.length > 0) return true;

    // Check if platform admin or admin
    const roles = await this.prisma.user_roles.findMany({ where: { user_id: userId } }).catch(() => []) as any[];
    const isPlatformAdmin = roles.some((r: any) => r.role === 'platform_admin' || r.role === 'admin');
    if (isPlatformAdmin) return true;

    return false;
  }

  async getCommunityDetail(userId: string, communityId: string): Promise<any | null> {
    let memberships = await this.prisma.$queryRaw<any[]>`
      SELECT role, is_default FROM public.memberships
      WHERE user_id = ${userId}::uuid AND association_id = ${communityId}::uuid
      LIMIT 1
    `.catch(() => []);
    let hasActualMembership = memberships.length > 0;
    if (memberships.length === 0) {
      const isMem = await this.prisma.$queryRaw<any[]>`
        SELECT id FROM public.members
        WHERE user_id = ${userId}::uuid AND association_id = ${communityId}::uuid AND status = 'active'
        LIMIT 1
      `.catch(() => []);
      if (isMem.length > 0) {
        memberships = [{ role: 'member', is_default: false }];
        hasActualMembership = true;
      }
    }
    if (memberships.length === 0) {
      const roles = await this.prisma.user_roles.findMany({ where: { user_id: userId } }).catch(() => []) as any[];
      const isPlatformAdmin = roles.some((r: any) => r.role === 'platform_admin' || r.role === 'admin');
      if (isPlatformAdmin) {
        memberships = [{ role: 'admin', is_default: false }];
      } else {
        memberships = [{ role: 'member', is_default: false }];
      }
    }
    const membership = memberships[0];

    const associations = await this.prisma.$queryRaw<any[]>`
      SELECT id, name, logo_url, banner_url, tagline, about FROM public.associations
      WHERE id = ${communityId}::uuid
      LIMIT 1
    `.catch(() => []);
    if (associations.length === 0) return null;
    const assoc = associations[0];

    const activeCountRes = await this.prisma.$queryRaw`
      SELECT COUNT(DISTINCT uid)::int as count FROM (
        SELECT id::text as uid FROM public.members WHERE association_id = ${communityId}::uuid AND status = 'active'
        UNION
        SELECT user_id::text as uid FROM public.memberships WHERE association_id = ${communityId}::uuid
      ) all_m
    `.catch(() => [{ count: 0 }]) as any[];
    const memberCount = activeCountRes[0]?.count || 0;

    let upcomingEvents: any[] = [];
    try {
      const events = await this.prisma.$queryRaw<any[]>`
        SELECT id, name, date, location FROM public.events
        WHERE association_id = ${communityId}::uuid AND status NOT IN ('cancelled')
        ORDER BY (date >= CURRENT_DATE) DESC, date ASC
        LIMIT 5
      `;
      upcomingEvents = events.map(e => ({
        eventId: String(e.id),
        name: String(e.name),
        date: e.date ? new Date(e.date).toISOString() : '',
        location: e.location || null,
      }));
    } catch {
      upcomingEvents = [];
    }

    let openOpportunityCount = 0;
    try {
      const oppCountRes = await this.prisma.$queryRaw<any[]>`
        SELECT COUNT(id)::int as count FROM public.opportunities
        WHERE association_id = ${communityId}::uuid AND status = 'open'
      `;
      openOpportunityCount = oppCountRes[0]?.count || 0;
    } catch {
      openOpportunityCount = 0;
    }

    return {
      community: {
        communityId: assoc.id,
        name: assoc.name,
        logoUrl: assoc.logo_url || null,
        bannerUrl: assoc.banner_url || null,
        shortDescription: assoc.tagline || null,
        description: assoc.about || null,
        memberCount,
        viewerRole: membership.role === 'admin' ? 'admin' : 'member',
        isDefault: membership.is_default === true,
        isMember: hasActualMembership,
      },
      upcomingEvents,
      openOpportunityCount,
    };
  }

  async listCommunityMembers(
    userId: string,
    communityId: string,
    searchQuery: string = '',
    offset: number = 0,
    roleFilter: string = 'all',
  ) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId || '');
    let viewerMemberships: any[] = [];
    if (isUuid) {
      viewerMemberships = await this.prisma.$queryRaw<any[]>`
        SELECT role FROM public.memberships
        WHERE user_id = ${userId}::uuid AND association_id = ${communityId}::uuid
        LIMIT 1
      `.catch(() => []);
      if (viewerMemberships.length === 0) {
        const isMember = await this.prisma.$queryRaw<any[]>`
          SELECT id FROM public.members
          WHERE user_id = ${userId}::uuid AND association_id = ${communityId}::uuid AND status = 'active'
          LIMIT 1
        `.catch(() => []);
        if (isMember.length > 0) viewerMemberships = [{ role: 'member' }];
      }
    }
    const viewerRole = viewerMemberships[0]?.role === 'admin' ? 'admin' : 'member';

    const searchNormalized = searchQuery.trim().toLowerCase();
    const searchLike = `%${searchNormalized}%`;
    const roleCond = roleFilter !== 'all' ? roleFilter : null;

    const allMembers = await this.prisma.$queryRaw<any[]>`
      SELECT
        member_ref,
        display_name,
        industry_label,
        region_label,
        user_id,
        joined_at,
        role,
        avatar_url,
        job_title,
        company_name,
        headline
      FROM (
        -- A. CRM Members in this association
        SELECT
          m.id::text as user_or_member_id,
          m.id::text as member_ref,
          COALESCE(card.display_name, bi.display_name, m.name)::text as display_name,
          m.industry::text as industry_label,
          m.region::text as region_label,
          m.user_id::text as user_id,
          COALESCE(m.joined_at, m.created_at)::timestamptz as joined_at,
          COALESCE(ms.role, 'member')::text as role,
          COALESCE(card.avatar_url, bi.avatar_url)::text as avatar_url,
          COALESCE(card.professional_title, bi.job_title)::text as job_title,
          COALESCE(card.company_name, bi.company_name)::text as company_name,
          bi.headline::text as headline
        FROM public.members m
        LEFT JOIN public.memberships ms ON (ms.association_id = m.association_id AND m.user_id IS NOT NULL AND ms.user_id = m.user_id)
        LEFT JOIN public.member_business_cards card ON (card.member_id = m.id OR (m.user_id IS NOT NULL AND card.owner_user_id = m.user_id))
        LEFT JOIN public.business_identities bi ON (m.user_id IS NOT NULL AND bi.owner_user_id = m.user_id)
        WHERE m.association_id = ${communityId}::uuid AND m.status = 'active'

        UNION ALL

        -- B. App Members (Memberships) in this association whose user_id is not already covered by an active row in public.members
        SELECT
          ms.user_id::text as user_or_member_id,
          ms.id::text as member_ref,
          COALESCE(bi.display_name, card.display_name, 'Hội viên CEO 1983')::text as display_name,
          null::text as industry_label,
          null::text as region_label,
          ms.user_id::text as user_id,
          ms.created_at::timestamptz as joined_at,
          ms.role::text as role,
          COALESCE(bi.avatar_url, card.avatar_url)::text as avatar_url,
          COALESCE(bi.job_title, card.professional_title)::text as job_title,
          COALESCE(bi.company_name, card.company_name)::text as company_name,
          bi.headline::text as headline
        FROM public.memberships ms
        LEFT JOIN public.business_identities bi ON bi.owner_user_id = ms.user_id
        LEFT JOIN public.member_business_cards card ON card.owner_user_id = ms.user_id
        WHERE ms.association_id = ${communityId}::uuid
          AND ms.user_id NOT IN (
            SELECT user_id FROM public.members
            WHERE association_id = ${communityId}::uuid AND user_id IS NOT NULL AND status = 'active'
          )
      ) all_members
      WHERE (${roleCond}::text IS NULL OR role = ${roleCond})
        AND (
          ${searchNormalized} = '' OR
          LOWER(display_name) LIKE ${searchLike} OR
          LOWER(COALESCE(industry_label, '')) LIKE ${searchLike} OR
          LOWER(COALESCE(region_label, '')) LIKE ${searchLike} OR
          LOWER(COALESCE(company_name, '')) LIKE ${searchLike} OR
          LOWER(COALESCE(job_title, '')) LIKE ${searchLike}
        )
      ORDER BY joined_at DESC NULLS LAST, display_name ASC
    `.catch(() => []);

    const totalCount = allMembers.length;
    const pageItems = allMembers.slice(offset, offset + 25);

    const items = pageItems.map(m => ({
      memberRef: m.member_ref,
      displayName: m.display_name,
      avatarUrl: m.avatar_url || null,
      jobTitle: m.job_title || null,
      companyName: m.company_name || null,
      industryLabel: m.industry_label || null,
      hasPublicCard: !!(m.avatar_url || m.job_title || m.company_name),
      isSelf: m.user_id === userId,
      role: m.role === 'admin' ? 'admin' : 'member',
    }));

    const nextOffset = offset + 25 < totalCount ? offset + 25 : null;

    return {
      items,
      totalCount,
      nextOffset,
      viewerRole,
    };
  }

  async getCommunityMemberProfile(userId: string, communityId: string, memberRef: string) {
    let viewerMemberships = await this.prisma.$queryRaw<any[]>`
      SELECT role FROM public.memberships
      WHERE user_id = ${userId}::uuid AND association_id = ${communityId}::uuid
      LIMIT 1
    `.catch(() => []);
    if (viewerMemberships.length === 0) {
      const isMember = await this.prisma.$queryRaw<any[]>`
        SELECT id FROM public.members
        WHERE user_id = ${userId}::uuid AND association_id = ${communityId}::uuid AND status = 'active'
        LIMIT 1
      `.catch(() => []);
      if (isMember.length > 0) viewerMemberships = [{ role: 'member' }];
    }
    const viewerRole = viewerMemberships[0]?.role === 'admin' ? 'admin' : 'member';

    const associations = await this.prisma.$queryRaw<any[]>`
      SELECT id, name FROM public.associations WHERE id = ${communityId}::uuid LIMIT 1
    `.catch(() => []);
    if (associations.length === 0) return null;
    const assoc = associations[0];

    let targetUserId: string | null = null;
    let displayName = '';
    let avatarUrl: string | null = null;
    let jobTitle: string | null = null;
    let companyName: string | null = null;
    let headline: string | null = null;
    let bio: string | null = null;
    let website: string | null = null;
    let industryLabel: string | null = null;
    let regionLabel: string | null = null;
    let role = 'member';
    let joinedAt: string | null = null;

    const mRows = await this.prisma.$queryRaw<any[]>`
      SELECT m.*, COALESCE(ms.role, 'member')::text as member_role,
             card.avatar_url, card.professional_title, card.company_name, bi.headline, bi.bio, m.website
      FROM public.members m
      LEFT JOIN public.memberships ms ON (ms.association_id = m.association_id AND m.user_id IS NOT NULL AND ms.user_id = m.user_id)
      LEFT JOIN public.member_business_cards card ON (card.member_id = m.id OR (m.user_id IS NOT NULL AND card.owner_user_id = m.user_id))
      WHERE m.id = ${memberRef}::uuid AND m.association_id = ${communityId}::uuid AND m.status = 'active'
      LIMIT 1
    `.catch(() => []);

    if (mRows.length > 0) {
      const m = mRows[0];
      targetUserId = m.user_id;
      displayName = m.name;
      avatarUrl = m.avatar_url;
      jobTitle = m.professional_title;
      companyName = m.company_name;
      headline = m.headline;
      bio = m.bio;
      website = m.website;
      industryLabel = m.industry;
      regionLabel = m.region;
      role = m.member_role === 'admin' ? 'admin' : 'member';
      joinedAt = m.joined_at ? new Date(m.joined_at).toISOString() : (m.created_at ? new Date(m.created_at).toISOString() : null);

      if (targetUserId) {
        const bi = await this.prisma.$queryRaw<any[]>`
          SELECT display_name, avatar_url, job_title, company_name, headline, bio, website
          FROM public.business_identities WHERE owner_user_id = ${targetUserId}::uuid LIMIT 1
        `.catch(() => []);
        if (bi.length > 0) {
          avatarUrl = avatarUrl || bi[0].avatar_url;
          jobTitle = jobTitle || bi[0].job_title;
          companyName = companyName || bi[0].company_name;
          headline = headline || bi[0].headline;
          bio = bio || bi[0].bio;
          website = website || bi[0].website;
        }
      }
    } else {
      const msRows = await this.prisma.$queryRaw<any[]>`
        SELECT ms.*, bi.display_name, bi.avatar_url, bi.job_title, bi.company_name, bi.headline, bi.bio, bi.website
        FROM public.memberships ms
        LEFT JOIN public.business_identities bi ON bi.owner_user_id = ms.user_id
        WHERE (ms.id = ${memberRef}::uuid OR ms.user_id = ${memberRef}::uuid)
          AND ms.association_id = ${communityId}::uuid
        LIMIT 1
      `.catch(() => []);

      if (msRows.length > 0) {
        const ms = msRows[0];
        targetUserId = ms.user_id;
        displayName = ms.display_name || 'Hội viên CEO 1983';
        avatarUrl = ms.avatar_url;
        jobTitle = ms.job_title;
        companyName = ms.company_name;
        headline = ms.headline;
        bio = ms.bio;
        website = ms.website;
        role = ms.role === 'admin' ? 'admin' : 'member';
        joinedAt = ms.created_at ? new Date(ms.created_at).toISOString() : null;
      } else {
        return null;
      }
    }

    let state = 'unavailable';
    let connectionId: string | null = null;

    if (targetUserId === userId) {
      state = 'self';
    } else if (targetUserId) {
      const connRows = await this.prisma.$queryRaw<any[]>`
        SELECT id, requester_user_id, recipient_user_id, status FROM public.user_connections
        WHERE (requester_user_id = ${userId}::uuid AND recipient_user_id = ${targetUserId}::uuid)
           OR (requester_user_id = ${targetUserId}::uuid AND recipient_user_id = ${userId}::uuid)
        LIMIT 1
      `.catch(() => []);
      if (connRows.length > 0) {
        const conn = connRows[0];
        connectionId = conn.id;
        if (conn.status === 'accepted') {
          state = 'connected';
        } else if (conn.status === 'pending') {
          state = conn.requester_user_id === userId ? 'outgoing_pending' : 'incoming_pending';
        } else {
          state = 'none';
        }
      } else {
        state = 'none';
      }
    }

    const history: any[] = [];
    history.push({
      communityId: assoc.id,
      communityName: assoc.name,
      joinedAt,
      role,
      isCurrent: true,
    });

    if (targetUserId) {
      const sharedCommunities = await this.prisma.$queryRaw<any[]>`
        SELECT m.association_id, a.name, m.role, m.is_default
        FROM public.memberships m
        JOIN public.associations a ON m.association_id = a.id
        WHERE m.user_id = ${targetUserId}::uuid
          AND m.association_id IN (
            SELECT association_id FROM public.memberships WHERE user_id = ${userId}::uuid
          )
          AND m.association_id <> ${communityId}::uuid
      `.catch(() => []);
      for (const sc of sharedCommunities) {
        history.push({
          communityId: sc.association_id,
          communityName: sc.name,
          joinedAt: null,
          role: sc.role === 'admin' ? 'admin' : 'member',
          isCurrent: false,
        });
      }
    }

    return {
      member: {
        memberRef: memberRef,
        displayName: displayName || 'Hội viên CEO 1983',
        avatarUrl: avatarUrl || null,
        jobTitle: jobTitle || null,
        companyName: companyName || null,
        industryLabel: industryLabel || null,
        hasPublicCard: !!(avatarUrl || jobTitle || companyName),
        isSelf: targetUserId === userId,
        role: role === 'admin' ? 'admin' : 'member',
      },
      headline: headline || null,
      bio: bio || null,
      website: website || null,
      regionLabel: regionLabel || null,
      communityName: assoc.name,
      viewerRole,
      connection: {
        state,
        connectionId,
      },
      canConnect: state === 'none' && targetUserId !== userId && !!targetUserId,
      hasPlatformIdentity: !!targetUserId,
      history: history.sort((a, b) => {
        if (a.isCurrent !== b.isCurrent) return a.isCurrent ? -1 : 1;
        return (b.joinedAt || '').localeCompare(a.joinedAt || '');
      }),
    };
  }

  async connectCommunityMember(userId: string, communityId: string, memberRef: string) {
    let targetUserId: string | null = null;
    const memberRows = await this.prisma.$queryRaw<any[]>`
      SELECT user_id FROM public.members WHERE id = ${memberRef}::uuid LIMIT 1
    `.catch(() => []);
    if (memberRows.length > 0 && memberRows[0].user_id) {
      targetUserId = memberRows[0].user_id;
    } else {
      const msRows = await this.prisma.$queryRaw<any[]>`
        SELECT user_id FROM public.memberships WHERE id = ${memberRef}::uuid OR user_id = ${memberRef}::uuid LIMIT 1
      `.catch(() => []);
      if (msRows.length > 0 && msRows[0].user_id) {
        targetUserId = msRows[0].user_id;
      }
    }
    if (!targetUserId) {
      throw new Error('Member user not found');
    }
    return this.networkService
      ? this.networkService.sendConnectionRequest(userId, { targetUserId })
      : { ok: true, status: 'requested' };
  }

  async updateCommunityMemberRole(userId: string, communityId: string, memberRef: string, role: string) {
    const memberships = await this.prisma.$queryRaw<any[]>`
      SELECT role FROM public.memberships
      WHERE user_id = ${userId}::uuid AND association_id = ${communityId}::uuid
      LIMIT 1
    `.catch(() => []);
    if (memberships.length === 0 || memberships[0].role !== 'admin') {
      throw new Error('Unauthorized');
    }

    const msRows = await this.prisma.$queryRaw<any[]>`
      SELECT id, user_id FROM public.memberships
      WHERE (id = ${memberRef}::uuid OR user_id = ${memberRef}::uuid) AND association_id = ${communityId}::uuid
      LIMIT 1
    `.catch(() => []);

    if (msRows.length > 0) {
      await this.prisma.$executeRaw`
        UPDATE public.memberships SET role = ${role}, updated_at = now()
        WHERE id = ${msRows[0].id}::uuid
      `;
      return { ok: true };
    }

    const mRows = await this.prisma.$queryRaw<any[]>`
      SELECT user_id FROM public.members
      WHERE id = ${memberRef}::uuid AND association_id = ${communityId}::uuid
      LIMIT 1
    `.catch(() => []);

    if (mRows.length > 0 && mRows[0].user_id) {
      const targetUid = mRows[0].user_id;
      await this.prisma.$executeRaw`
        INSERT INTO public.memberships (id, user_id, association_id, role, is_default, created_at, updated_at)
        VALUES (gen_random_uuid(), ${targetUid}::uuid, ${communityId}::uuid, ${role}, false, now(), now())
        ON CONFLICT (user_id, association_id) DO UPDATE SET role = ${role}, updated_at = now()
      `;
      return { ok: true };
    }

    return { ok: true };
  }

  async listCommunityNews(userId: string, communityId: string, offset: number) {
    const hasMembership = await this.checkCommunityMembership(userId, communityId);

    const limit = 10;
    const news = await this.prisma.$queryRaw<any[]>`
      SELECT id, title, excerpt, category, author, published_at, views, status, created_at
      FROM public.news
      WHERE association_id = ${communityId}::uuid AND status = 'published'
      ORDER BY created_at DESC
      OFFSET ${offset} LIMIT ${limit}
    `.catch(() => [] as any[]);

    const total = await this.prisma.$queryRaw<any[]>`
      SELECT COUNT(*)::int as count FROM public.news
      WHERE association_id = ${communityId}::uuid AND status = 'published'
    `.catch(() => [{ count: 0 }]);

    const totalCount = total[0]?.count ?? 0;
    const items = news.map(row => ({
      newsRef: row.id,
      title: row.title || "",
      excerpt: row.excerpt || null,
      category: row.category || null,
      author: row.author || null,
      publishedLabel: row.published_at ? new Date(row.published_at).toLocaleDateString() : null,
      views: row.views || 0,
    }));

    const nextOffset = offset + items.length < totalCount ? offset + items.length : null;

    return { items, totalCount, nextOffset };
  }

  async getCommunityNewsDetail(userId: string, communityId: string, newsRef: string) {
    let news = await this.prisma.$queryRaw<any[]>`
      SELECT id, code, title, excerpt, category, author, published_at, views, status, created_at, association_id
      FROM public.news
      WHERE association_id = ${communityId}::uuid 
        AND (id::text = ${newsRef} OR code = ${newsRef})
      LIMIT 1
    `.catch(() => [] as any[]);

    if (news.length === 0) {
      news = await this.prisma.$queryRaw<any[]>`
        SELECT id, code, title, excerpt, category, author, published_at, views, status, created_at, association_id
        FROM public.news
        WHERE id::text = ${newsRef} OR code = ${newsRef}
        LIMIT 1
      `.catch(() => [] as any[]);
    }

    const row = news[0];
    if (!row) throw new NotFoundException('news_not_found');

    const effectiveAssocId = row.association_id || communityId;
    const assocs = await this.prisma.$queryRaw<any[]>`
      SELECT name FROM public.associations WHERE id = ${effectiveAssocId}::uuid LIMIT 1
    `.catch(() => [] as any[]);

    const assoc = assocs[0] || { name: "" };

    // Increment view count
    await this.prisma.$executeRaw`
      UPDATE public.news SET views = COALESCE(views, 0) + 1 WHERE id = ${row.id}::uuid
    `.catch(() => {});

    return {
      news: {
        newsRef: row.id,
        code: row.code || null,
        title: row.title || "",
        excerpt: row.excerpt || null,
        category: row.category || null,
        author: row.author || null,
        publishedLabel: row.published_at ? (isNaN(Date.parse(row.published_at)) ? row.published_at : new Date(row.published_at).toLocaleDateString()) : null,
        views: (row.views || 0) + 1,
      },
      communityName: assoc.name,
    };
  }

  // ==========================================
  // BC-Mobile-7B+ â€” Community Join Requests
  // ==========================================

  async listJoinableCommunities(userId: string) {
    const memberships = await this.prisma.$queryRaw<any[]>`
      SELECT association_id FROM public.memberships WHERE user_id = ${userId}::uuid
      UNION
      SELECT association_id FROM public.members WHERE user_id = ${userId}::uuid AND status = 'active'
    `.catch(() => [] as any[]);
    const joined = new Set(memberships.map(m => String(m.association_id)));

    const assocs = await this.prisma.$queryRaw<any[]>`
      SELECT id, name, logo_url, tagline FROM public.associations
      WHERE id = 'c1983000-0000-4000-8000-000000001983'::uuid
      ORDER BY name ASC
      LIMIT 1
    `.catch(() => [] as any[]);

    const requests = await this.prisma.$queryRaw<any[]>`
      SELECT association_id, status, created_at FROM public.community_join_requests
      WHERE user_id = ${userId}::uuid
    `.catch(() => [] as any[]);

    const byAssoc = new Map<string, any>();
    for (const r of requests) {
      byAssoc.set(String(r.association_id), {
        status: r.status,
        createdAt: r.created_at ? new Date(r.created_at).toISOString() : null,
      });
    }

    return assocs
      .filter(a => !joined.has(String(a.id)))
      .map(a => {
        const req = byAssoc.get(String(a.id));
        return {
          communityId: String(a.id),
          name: a.name,
          logoUrl: a.logo_url || null,
          shortDescription: a.tagline || null,
          status: req?.status ?? 'none',
          requestedAt: req?.createdAt ?? null,
        };
      });
  }

  async requestCommunityJoin(userId: string, input: { communityId: string; note?: string | null }) {
    const communityId = input.communityId;
    const note = input.note ? input.note.trim().slice(0, 500) : null;

    const memberships = await this.prisma.$queryRaw<any[]>`
      SELECT association_id FROM public.memberships
      WHERE user_id = ${userId}::uuid AND association_id = ${communityId}::uuid
      LIMIT 1
    `.catch(() => [] as any[]);

    if (memberships.length > 0) return { status: 'approved' };

    const assocs = await this.prisma.$queryRaw<any[]>`
      SELECT id, name FROM public.associations WHERE id = ${communityId}::uuid LIMIT 1
    `.catch(() => [] as any[]);

    if (assocs.length === 0) throw new BadRequestException('community_join_unavailable');

    const now = new Date();

    // Tá»± Ä‘á»™ng duyá»‡t vĂ  táº¡o membership
    try {
      await this.prisma.$executeRaw`
        INSERT INTO public.memberships (id, user_id, association_id, role, is_default, created_at, updated_at)
        VALUES (gen_random_uuid(), ${userId}::uuid, ${communityId}::uuid, 'member', false, ${now}, ${now})
      `;
    } catch {}

    const requests = await this.prisma.$queryRaw<any[]>`
      SELECT id, status FROM public.community_join_requests
      WHERE user_id = ${userId}::uuid AND association_id = ${communityId}::uuid
      LIMIT 1
    `.catch(() => [] as any[]);

    const existing = requests[0];
    if (existing) {
      await this.prisma.$executeRaw`
        UPDATE public.community_join_requests
        SET status = 'approved',
            decided_at = ${now},
            message = ${note},
            updated_at = ${now}
        WHERE id = ${existing.id}::uuid
      `.catch(() => {});
    } else {
      const reqId = crypto.randomUUID();
      await this.prisma.$executeRaw`
        INSERT INTO public.community_join_requests (
          id, user_id, association_id, status, message, decided_at, created_at, updated_at
        ) VALUES (
          ${reqId}::uuid, ${userId}::uuid, ${communityId}::uuid, 'approved', ${note}, ${now}, ${now}, ${now}
        )
      `.catch(() => {});
    }

    // Trigger Realtime Notification for Association CRM Admins
    try {
      const userProfiles = await this.prisma.$queryRaw<any[]>`
        SELECT display_name, company_name FROM public.business_identities WHERE owner_user_id = ${userId}::uuid LIMIT 1
      `.catch(() => []);
      const applicantName = userProfiles[0]?.display_name || 'Hội viên CEO 1983';
      const applicantCompany = userProfiles[0]?.company_name || '';

      void this.notifyAssociationAdmins(communityId, {
        title: `Yêu cầu gia nhập cộng đồng: ${applicantName}`,
        body: `${applicantName} ${applicantCompany ? `(${applicantCompany})` : ''} vừa tham gia cộng đồng. Bấm để xem chi tiết.`,
        targetRoute: `/members?status=pending`,
        type: 'community_join_received',
        sourceRecordId: communityId,
        meta: { applicantName, applicantCompany },
      });
    } catch {
      // ignore
    }

    return { status: 'approved' };
  }


  async cancelCommunityJoin(userId: string, input: { communityId: string; cancelReason?: string | null }) {
    const communityId = input.communityId;
    const reason = input.cancelReason ? input.cancelReason.trim().slice(0, 500) : null;

    const requests = await this.prisma.$queryRaw<any[]>`
      SELECT id, status FROM public.community_join_requests
      WHERE user_id = ${userId}::uuid AND association_id = ${communityId}::uuid
      LIMIT 1
    `.catch(() => [] as any[]);

    const existing = requests[0];
    if (!existing) return { status: 'none' };
    if (existing.status !== 'pending') return { status: existing.status };

    const now = new Date();
    await this.prisma.$executeRaw`
      UPDATE public.community_join_requests
      SET status = 'cancelled',
          decided_at = ${now},
          cancel_reason = ${reason},
          updated_at = ${now}
      WHERE id = ${existing.id}::uuid
    `;

    return { status: 'cancelled' };
  }

  async createCommunity(userId: string, input: { name: string; description?: string; logoUrl?: string; bannerUrl?: string; coverUrl?: string; slug?: string; tagline?: string; about?: string }) {
    if (!input.name || !input.name.trim()) {
      throw new BadRequestException('Tên cộng đồng không được để trống');
    }
    const communityId = crypto.randomUUID();
    const name = input.name.trim();
    const cleanSlug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'd')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const slug = input.slug?.trim() || cleanSlug || `comm-${Date.now().toString(36)}`;
    const tagline = input.tagline || input.description || null;
    const about = input.about || input.description || null;
    const logoUrl = input.logoUrl || null;
    const bannerUrl = input.bannerUrl || input.coverUrl || null;
    const now = new Date();

    await this.prisma.$executeRaw`
      INSERT INTO public.associations (id, name, slug, tagline, about, logo_url, banner_url, created_at, updated_at)
      VALUES (${communityId}::uuid, ${name}, ${slug}, ${tagline}, ${about}, ${logoUrl}, ${bannerUrl}, ${now}, ${now})
    `;

    // Gán người tạo làm quản trị viên (admin) của cộng đồng
    try {
      await this.prisma.$executeRaw`
        INSERT INTO public.memberships (id, user_id, association_id, role, is_default, created_at, updated_at)
        VALUES (gen_random_uuid(), ${userId}::uuid, ${communityId}::uuid, 'admin', true, ${now}, ${now})
      `;
    } catch {}

    // Thông báo cho các client
    try {
      this.gateway?.emitToRoom(`user:${userId}`, 'community:updated', { communityId });
    } catch {}

    return {
      id: communityId,
      communityId,
      name,
      slug,
      tagline,
      about,
      logoUrl,
      bannerUrl,
      viewerRole: 'admin',
      isMember: true,
      membershipStatus: 'active',
      memberCount: 1,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };
  }


  async listCommunityJoinHistory(userId: string) {
    const requests = await this.prisma.$queryRaw<any[]>`
      SELECT id, association_id, status, message, cancel_reason, created_at, decided_at
      FROM public.community_join_requests
      WHERE user_id = ${userId}::uuid
      ORDER BY created_at DESC
      LIMIT 30
    `.catch(() => [] as any[]);

    const memberships = await this.prisma.$queryRaw<any[]>`
      SELECT id, association_id, created_at FROM public.memberships
      WHERE user_id = ${userId}::uuid
    `.catch(() => [] as any[]);

    const existingAssocIds = new Set(requests.map(r => String(r.association_id)));
    const merged = [...requests];

    for (const m of memberships) {
      if (!existingAssocIds.has(String(m.association_id))) {
        merged.push({
          id: m.id,
          association_id: m.association_id,
          status: 'approved',
          message: null,
          cancel_reason: null,
          created_at: m.created_at,
          decided_at: m.created_at,
        });
      }
    }

    if (merged.length === 0) return [];

    const assocIds = Array.from(new Set(merged.map(r => r.association_id)));
    const assocs = await this.prisma.$queryRaw<any[]>`
      SELECT id, name, logo_url FROM public.associations
      WHERE id::uuid = ANY(${assocIds}::uuid[])
    `.catch(() => [] as any[]);

    const assocMap = new Map(assocs.map(a => [String(a.id), a]));

    return merged.map(r => {
      const assoc: any = assocMap.get(String(r.association_id)) ?? { name: "Cộng đồng", logo_url: null };
      return {
        requestId: String(r.id),
        communityId: String(r.association_id),
        name: assoc.name || "Cộng đồng",
        logoUrl: assoc.logo_url || null,
        status: r.status,
        requestedAt: r.created_at ? new Date(r.created_at).toISOString() : null,
        decidedAt: r.decided_at ? new Date(r.decided_at).toISOString() : null,
        reason: r.message || null,
        cancelReason: r.cancel_reason || null,
      };
    });
  }

  async syncCommunityJoinDecisions(userId: string) {
    const requests = await this.prisma.$queryRaw<any[]>`
      SELECT id, association_id, status, decided_at
      FROM public.community_join_requests
      WHERE user_id = ${userId}::uuid AND status IN ('approved', 'rejected')
      ORDER BY decided_at DESC NULLS LAST
      LIMIT 20
    `.catch(() => [] as any[]);

    if (requests.length === 0) return [];

    const dedupeKeys = requests.map(r => `community_join:${r.id}:${r.status}`);

    const existingNotifs = await this.prisma.$queryRaw<any[]>`
      SELECT dedupe_key FROM public.business_notifications
      WHERE recipient_user_id = ${userId}::uuid AND dedupe_key = ANY(${dedupeKeys})
    `.catch(() => [] as any[]);

    const notifiedKeys = new Set(existingNotifs.map(n => n.dedupe_key));
    const pendingRequests = requests.filter(r => !notifiedKeys.has(`community_join:${r.id}:${r.status}`));

    if (pendingRequests.length === 0) return [];

    const assocIds = Array.from(new Set(pendingRequests.map(r => r.association_id)));
    const assocs = await this.prisma.$queryRaw<any[]>`
      SELECT id, name FROM public.associations WHERE id::uuid = ANY(${assocIds}::uuid[])
    `.catch(() => [] as any[]);

    const nameMap = new Map(assocs.map(a => [a.id, a.name]));
    const now = new Date();

    const output: any[] = [];
    for (const r of pendingRequests) {
      const name = nameMap.get(r.association_id) || "â€”";
      const approved = r.status === 'approved';
      const notifId = crypto.randomUUID();

      await this.prisma.$executeRaw`
        INSERT INTO public.business_notifications (
          id, recipient_user_id, source_domain, source_record_id, event_kind, notification_kind,
          title_key, body_key, action_label_key, action_kind, action_target, safe_display_data,
          priority, status, delivered_at, dedupe_key
        ) VALUES (
          ${notifId}::uuid, ${userId}::uuid, 'community', ${r.id}::uuid,
          ${approved ? 'community.join.approved' : 'community.join.rejected'},
          ${approved ? 'community_join_approved' : 'community_join_rejected'},
          ${approved ? 'bc.notif.kind.community_join_approved.title' : 'bc.notif.kind.community_join_rejected.title'},
          ${approved ? 'bc.notif.kind.community_join_approved.body' : 'bc.notif.kind.community_join_rejected.body'},
          'bc.notif.action.viewJoinHistory', 'open_route',
          ${JSON.stringify({ route: "/connect-app/community", search: { tab: "history" } })}::jsonb,
          ${JSON.stringify({ communityName: name })}::jsonb,
          'normal', 'delivered', ${now}, ${`community_join:${r.id}:${r.status}`}
        )
      `.catch(() => {});

      output.push({
        communityId: r.association_id,
        name,
        status: r.status,
      });
    }

    return output;
  }

  async listCommunityJoinAdminRequests(userId: string) {
    const managed = await this.prisma.$queryRaw<any[]>`
      SELECT association_id FROM public.memberships
      WHERE user_id = ${userId}::uuid AND role = 'admin'
    `.catch(() => [] as any[]);

    const assocIds = Array.from(new Set(managed.map(m => m.association_id)));
    if (assocIds.length === 0) return [];

    const requests = await this.prisma.$queryRaw<any[]>`
      SELECT id, user_id, association_id, status, message, created_at, decided_at
      FROM public.community_join_requests
      WHERE association_id::uuid = ANY(${assocIds}::uuid[])
      ORDER BY created_at DESC
      LIMIT 100
    `.catch(() => [] as any[]);

    if (requests.length === 0) return [];

    const requesterIds = Array.from(new Set(requests.map(r => r.user_id)));
    const profiles = await this.prisma.$queryRaw<any[]>`
      SELECT id, full_name FROM public.profiles WHERE id::uuid = ANY(${requesterIds}::uuid[])
    `.catch(() => [] as any[]);

    const profileMap = new Map(profiles.map(p => [p.id, p.full_name]));

    const assocs = await this.prisma.$queryRaw<any[]>`
      SELECT id, name FROM public.associations WHERE id::uuid = ANY(${assocIds}::uuid[])
    `.catch(() => [] as any[]);

    const assocMap = new Map(assocs.map(a => [a.id, a.name]));

    return requests.map(r => ({
      requestId: r.id,
      communityId: r.association_id,
      communityName: assocMap.get(r.association_id) || "â€”",
      requesterName: profileMap.get(r.user_id) || null,
      status: r.status,
      note: r.message || null,
      requestedAt: r.created_at ? new Date(r.created_at).toISOString() : null,
      decidedAt: r.decided_at ? new Date(r.decided_at).toISOString() : null,
    }));
  }

  // ==========================================
  // BC-Mobile-7B+ â€” Community Invites
  // ==========================================

  async listCommunityInvites(userId: string, communityId: string) {
    const invites = await this.prisma.$queryRaw<any[]>`
      SELECT id, email, note, status, created_at, responded_at, token, locale, email_subject, email_body, invited_role, accepted_by
      FROM public.community_invitations
      WHERE association_id = ${communityId}::uuid AND invited_by = ${userId}::uuid
      ORDER BY created_at DESC
    `.catch(() => [] as any[]);

    return invites.map(row => ({
      inviteRef: row.id,
      email: row.email,
      note: row.note || null,
      status: row.status,
      createdAt: row.created_at ? new Date(row.created_at).toISOString() : null,
      respondedAt: row.responded_at ? new Date(row.responded_at).toISOString() : null,
      token: row.token,
      locale: row.locale || "vi",
      emailSubject: row.email_subject || null,
      emailBody: row.email_body || null,
      invitedRole: row.invited_role || "member",
      acceptedRole: row.status === 'accepted' ? (row.invited_role || "member") : null,
      canManageRole: row.status === 'accepted' && row.accepted_by !== userId,
    }));
  }

  async createCommunityInvite(userId: string, input: any) {
    const inviteId = crypto.randomUUID();
    const token = crypto.randomBytes(32).toString('hex');
    const now = new Date();

    await this.prisma.$executeRaw`
      INSERT INTO public.community_invitations (
        id, association_id, invited_by, email, note, invite_url, locale, invited_role, status, token, created_at, updated_at
      ) VALUES (
        ${inviteId}::uuid, ${input.communityId}::uuid, ${userId}::uuid, ${input.email}, ${input.note || null},
        ${input.inviteUrl || null}, ${input.locale || 'vi'}, ${input.invitedRole || 'member'}, 'pending', ${token}, ${now}, ${now}
      )
    `;

    return {
      inviteRef: inviteId,
      token,
      status: 'pending',
    };
  }

  async listCommunityInviteTemplates(userId: string, communityId: string) {
    const templates = await this.prisma.$queryRaw<any[]>`
      SELECT locale, subject, body FROM public.community_invite_templates
      WHERE association_id = ${communityId}::uuid
    `.catch(() => [] as any[]);

    const defaultVi = {
      locale: "vi",
      subject: "Lời mời tham gia {{community}}",
      body: "Xin chào,\n\n{{inviter}} mời bạn tham gia cộng đồng {{community}} trên CEO 1983.\n\nNhấn vào liên kết để tham gia:\n{{link}}\n\nTrân trọng,\n{{community}}",
    };
    const defaultEn = {
      locale: "en",
      subject: "Invitation to join {{community}}",
      body: "Hello,\n\n{{inviter}} has invited you to join the {{community}} community on CEO 1983.\n\nClick the link below to join:\n{{link}}\n\nBest regards,\n{{community}}",
    };

    const cleanTpl = (str: string, fb: string) => {
      if (!str || str.includes("Lá»") || str.includes("Ä‘") || str.includes("cá»™ng") || str.includes("chĂ") || str.includes("báº¡n")) return fb;
      return str;
    };

    const mapping = templates.map(t => ({
      locale: t.locale,
      subject: cleanTpl(t.subject, t.locale === "vi" ? defaultVi.subject : defaultEn.subject),
      body: cleanTpl(t.body, t.locale === "vi" ? defaultVi.body : defaultEn.body),
    }));

    return {
      templates: mapping.length > 0 ? mapping : [defaultVi, defaultEn],
      canEdit: true,
    };
  }

  async saveCommunityInviteTemplate(userId: string, input: any) {
    const now = new Date();
    await this.prisma.$executeRaw`
      INSERT INTO public.community_invite_templates (
        association_id, locale, subject, body, created_at, updated_at
      ) VALUES (
        ${input.communityId}::uuid, ${input.locale}, ${input.subject}, ${input.body}, ${now}, ${now}
      )
      ON CONFLICT (association_id, locale) DO UPDATE SET
        subject = EXCLUDED.subject,
        body = EXCLUDED.body,
        updated_at = EXCLUDED.updated_at
    `;
    return { ok: true };
  }

  async resetCommunityInviteTemplate(userId: string, input: any) {
    await this.prisma.$executeRaw`
      DELETE FROM public.community_invite_templates
      WHERE association_id = ${input.communityId}::uuid AND locale = ${input.locale}
    `;
    return { ok: true };
  }

  async cancelCommunityInvite(userId: string, inviteRef: string) {
    const now = new Date();
    await this.prisma.$executeRaw`
      UPDATE public.community_invitations
      SET status = 'cancelled', updated_at = ${now}
      WHERE id = ${inviteRef}::uuid AND invited_by = ${userId}::uuid
    `;
    return { ok: true };
  }

  async resendCommunityInvite(userId: string, inviteRef: string, locale?: string) {
    const now = new Date();
    if (locale) {
      await this.prisma.$executeRaw`
        UPDATE public.community_invitations
        SET locale = ${locale}, updated_at = ${now}
        WHERE id = ${inviteRef}::uuid AND invited_by = ${userId}::uuid
      `;
    }
    return { ok: true };
  }

  async getCommunityInviteByToken(userId: string, token: string) {
    const invites = await this.prisma.$queryRaw<any[]>`
      SELECT id, association_id, email, note, status, created_at, invited_role
      FROM public.community_invitations
      WHERE token = ${token}
      LIMIT 1
    `.catch(() => [] as any[]);

    const inv = invites[0];
    if (!inv) throw new NotFoundException('invite_not_found');

    const assocs = await this.prisma.$queryRaw<any[]>`
      SELECT name FROM public.associations WHERE id = ${inv.association_id}::uuid LIMIT 1
    `.catch(() => [] as any[]);

    const assoc = assocs[0] || { name: "" };

    const memberships = await this.prisma.$queryRaw<any[]>`
      SELECT id FROM public.memberships WHERE user_id = ${userId}::uuid AND association_id = ${inv.association_id}::uuid LIMIT 1
    `.catch(() => [] as any[]);

    return {
      inviteRef: inv.id,
      communityId: inv.association_id,
      communityName: assoc.name,
      status: inv.status,
      note: inv.note || null,
      maskedEmail: inv.email, // simple return without mask for convenience
      createdAt: inv.created_at ? new Date(inv.created_at).toISOString() : null,
      alreadyMember: memberships.length > 0,
      invitedRole: inv.invited_role || "member",
    };
  }

  async acceptCommunityInvite(userId: string, token: string, email: string) {
    const invites = await this.prisma.$queryRaw<any[]>`
      SELECT id, association_id, email, status, invited_role
      FROM public.community_invitations
      WHERE token = ${token}
      LIMIT 1
    `.catch(() => [] as any[]);

    const inv = invites[0];
    if (!inv) throw new NotFoundException('invite_not_found');

    // Relax email check: user holding the secret token can accept directly
    if (inv.status !== 'pending') {
      throw new BadRequestException('not_pending');
    }

    const communityId = inv.association_id;
    const existing = await this.prisma.$queryRaw<any[]>`
      SELECT id FROM public.memberships
      WHERE user_id = ${userId}::uuid AND association_id = ${communityId}::uuid
      LIMIT 1
    `.catch(() => [] as any[]);

    const role = inv.invited_role || "member";
    const now = new Date();

    if (existing.length === 0) {
      await this.prisma.$executeRaw`
        INSERT INTO public.memberships (user_id, association_id, role, created_at, updated_at)
        VALUES (${userId}::uuid, ${communityId}::uuid, ${role}, ${now}, ${now})
      `;
    } else if (role === 'admin') {
      await this.prisma.$executeRaw`
        UPDATE public.memberships SET role = 'admin', updated_at = ${now} WHERE id = ${existing[0].id}::uuid
      `;
    }

    await this.prisma.$executeRaw`
      UPDATE public.community_invitations
      SET status = 'accepted', responded_at = ${now}, accepted_by = ${userId}::uuid, updated_at = ${now}
      WHERE id = ${inv.id}::uuid
    `;

    return {
      ok: true,
      communityId,
      alreadyMember: existing.length > 0,
      role,
    };
  }

  async updateAcceptedInviteRole(userId: string, inviteRef: string, role: string) {
    const invites = await this.prisma.$queryRaw<any[]>`
      SELECT association_id, status, accepted_by FROM public.community_invitations
      WHERE id = ${inviteRef}::uuid
      LIMIT 1
    `.catch(() => [] as any[]);

    const invite = invites[0];
    if (!invite || invite.status !== 'accepted' || !invite.accepted_by) {
      throw new BadRequestException('not_accepted');
    }

    const communityId = invite.association_id;
    const targetUserId = invite.accepted_by;

    // Check if viewer is admin
    const memberships = await this.prisma.$queryRaw<any[]>`
      SELECT role FROM public.memberships WHERE user_id = ${userId}::uuid AND association_id = ${communityId}::uuid LIMIT 1
    `.catch(() => [] as any[]);

    if (!memberships[0] || memberships[0].role !== 'admin') {
      throw new ForbiddenException('forbidden');
    }

    // Update role
    const target = await this.prisma.$queryRaw<any[]>`
      SELECT id, role FROM public.memberships WHERE user_id = ${targetUserId}::uuid AND association_id = ${communityId}::uuid LIMIT 1
    `.catch(() => [] as any[]);

    if (!target[0]) throw new BadRequestException('not_accepted');
    const oldRole = target[0].role;

    if (oldRole === role) return { ok: true };

    const now = new Date();
    await this.prisma.$executeRaw`
      UPDATE public.memberships SET role = ${role}, updated_at = ${now} WHERE id = ${target[0].id}::uuid
    `;

    const eventId = crypto.randomUUID();
    await this.prisma.$executeRaw`
      INSERT INTO public.community_member_role_events (
        id, association_id, invitation_id, target_user_id, actor_user_id, old_role, new_role, created_at
      ) VALUES (
        ${eventId}::uuid, ${communityId}::uuid, ${inviteRef}::uuid, ${targetUserId}::uuid, ${userId}::uuid, ${oldRole}, ${role}, ${now}
      )
    `;

    return { ok: true };
  }

  async listInviteRoleHistory(userId: string, inviteRef: string) {
    const invites = await this.prisma.$queryRaw<any[]>`
      SELECT association_id FROM public.community_invitations WHERE id = ${inviteRef}::uuid LIMIT 1
    `.catch(() => [] as any[]);

    const invite = invites[0];
    if (!invite) return [];

    // Verify membership
    const memberships = await this.prisma.$queryRaw<any[]>`
      SELECT id FROM public.memberships WHERE user_id = ${userId}::uuid AND association_id = ${invite.association_id}::uuid LIMIT 1
    `.catch(() => [] as any[]);

    if (memberships.length === 0) return [];

    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT id, old_role, new_role, created_at, actor_user_id
      FROM public.community_member_role_events
      WHERE invitation_id = ${inviteRef}::uuid
      ORDER BY created_at DESC
      LIMIT 20
    `.catch(() => [] as any[]);

    if (rows.length === 0) return [];

    const actorIds = Array.from(new Set(rows.map(r => r.actor_user_id)));
    const profiles = await this.prisma.$queryRaw<any[]>`
      SELECT id, full_name FROM public.profiles WHERE id::uuid = ANY(${actorIds}::uuid[])
    `.catch(() => [] as any[]);

    const nameMap = new Map(profiles.map(p => [p.id, p.full_name]));

    return rows.map(r => ({
      eventRef: r.id,
      oldRole: r.old_role,
      newRole: r.new_role,
      changedAt: r.created_at ? new Date(r.created_at).toISOString() : null,
      actorName: nameMap.get(r.actor_user_id) || null,
    }));
  }

  // ==========================================
  // BC-Mobile-7B â€” Community Activity & Opportunities
  // ==========================================

  async listCommunityEvents(userId: string, communityId: string, tab: string, offset: number) {
    const hasMembership = await this.checkCommunityMembership(userId, communityId);

    const limit = 10;
    const userMembers = await this.prisma.$queryRaw<any[]>`
      SELECT code, email FROM public.members WHERE user_id = ${userId}::uuid
    `.catch(() => [] as any[]);
    const userMemberCodes = userMembers.map(m => m.code).filter(Boolean);
    const userInfo = await this.prisma.vione_users.findUnique({ where: { id: userId } }).catch(() => null);
    const userEmail = userInfo?.email || userMembers[0]?.email || '';

    let events: any[];
    const safeMemberCodes = userMemberCodes.length > 0 ? userMemberCodes : ['__NO_MEMBER__'];
    if (tab === 'registered') {
      events = await this.prisma.$queryRaw<any[]>`
        SELECT e.* FROM public.events e
        WHERE e.association_id = ${communityId}::uuid
          AND e.id IN (
            SELECT r.event_id FROM public.event_registrations r
            WHERE (r.member_code = ANY(${safeMemberCodes}) OR (r.email != '' AND r.email = ${userEmail}))
              AND r.status != 'cancelled'
          )
        ORDER BY (e.date >= CURRENT_DATE) DESC, e.date ASC
        OFFSET ${offset} LIMIT ${limit}
      `.catch((err) => {
        console.error('[listCommunityEvents] tab registered error:', err);
        return [] as any[];
      });
    } else {
      events = await this.prisma.$queryRaw<any[]>`
        SELECT * FROM public.events
        WHERE association_id = ${communityId}::uuid AND status NOT IN ('cancelled')
        ORDER BY (date >= CURRENT_DATE) DESC, date ASC
        OFFSET ${offset} LIMIT ${limit}
      `.catch(() => [] as any[]);
    }

    const eventIds = events.map(e => e.id);
    let regSet = new Set<string>();
    if (eventIds.length > 0) {
      const registrations = await this.prisma.$queryRaw<any[]>`
        SELECT event_id FROM public.event_registrations
        WHERE event_id = ANY(${eventIds})
          AND (member_code = ANY(${safeMemberCodes}) OR (email != '' AND email = ${userEmail}))
          AND status != 'cancelled'
      `.catch(() => [] as any[]);
      regSet = new Set(registrations.map(r => r.event_id));
    }

    // Count total registrations per event for capacity checks
    let regCounts: Map<string, number> = new Map();
    if (eventIds.length > 0) {
      const counts = await this.prisma.$queryRaw<{ event_id: string; cnt: bigint }[]>`
        SELECT event_id, COUNT(*) as cnt FROM public.event_registrations
        WHERE event_id = ANY(${eventIds}) AND status != 'cancelled'
        GROUP BY event_id
      `.catch(() => [] as any[]);
      regCounts = new Map(counts.map(c => [c.event_id, Number(c.cnt)] as [string, number]));
    }

    const totalCount = events.length;
    const items = events.map(e => {
      const isRegistered = regSet.has(e.id);
      const capacity = e.capacity ? Number(e.capacity) : 0;
      const isFull = capacity > 0 && (regCounts.get(e.id) ?? Number(e.registered || 0)) >= capacity;
      const isCancelled = e.status === 'cancelled';

      let registrationState: 'available' | 'registered' | 'closed' | 'full' | 'cancelled';
      if (isRegistered) registrationState = 'registered';
      else if (isCancelled) registrationState = 'cancelled';
      else if (isFull) registrationState = 'full';
      else registrationState = 'available';

      const capacityState: 'open' | 'full' | null = capacity <= 0 ? null : isFull ? 'full' : 'open';

      return {
        eventRef: e.id,
        title: e.name || '',
        startAt: e.date ? new Date(e.date).toISOString().split('T')[0] : null,
        locationLabel: e.location || null,
        formatLabel: e.type || null,
        registrationState,
        capacityState,
      };
    });

    return {
      items,
      totalCount,
      nextOffset: items.length === limit ? offset + limit : null,
    };
  }


  async getCommunityEventDetail(userId: string, communityId: string, eventRef: string) {
    let events = await this.prisma.$queryRaw<any[]>`
      SELECT * FROM public.events
      WHERE association_id = ${communityId}::uuid AND (id = ${eventRef} OR id::text = ${eventRef})
      LIMIT 1
    `.catch(() => [] as any[]);

    if (events.length === 0) {
      events = await this.prisma.$queryRaw<any[]>`
        SELECT * FROM public.events
        WHERE id = ${eventRef} OR id::text = ${eventRef}
        LIMIT 1
      `.catch(() => [] as any[]);
    }

    const e = events[0];
    if (!e) throw new NotFoundException('event_not_found');

    const userMembers = await this.prisma.$queryRaw<any[]>`
      SELECT code, email FROM public.members WHERE user_id = ${userId}::uuid
    `.catch(() => [] as any[]);
    const userMemberCodes = userMembers.map(m => m.code).filter(Boolean);
    const userInfo = await this.prisma.vione_users.findUnique({ where: { id: userId } }).catch(() => null);
    const userEmail = userInfo?.email || userMembers[0]?.email || '';

    const registrations = await this.prisma.$queryRaw<any[]>`
      SELECT id FROM public.event_registrations
      WHERE event_id = ${eventRef}
        AND (member_code = ANY(${userMemberCodes}) OR (email != '' AND email = ${userEmail}))
        AND status != 'cancelled'
      LIMIT 1
    `.catch(() => [] as any[]);

    // Count total non-cancelled registrations for capacity check
    const regCounts = await this.prisma.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(*) as count FROM public.event_registrations
      WHERE event_id = ${eventRef} AND status != 'cancelled'
    `.catch(() => [{ count: BigInt(0) }]);
    const totalReg = regCounts && regCounts.length > 0 ? (regCounts[0]?.count ?? BigInt(0)) : BigInt(0);

    const isRegistered = registrations.length > 0;
    const capacity = e.capacity ? Number(e.capacity) : 0;
    const isFull = capacity > 0 && Number(totalReg) >= capacity;
    const isCancelled = e.status === 'cancelled';

    // Map to canonical registrationState
    let registrationState: 'available' | 'registered' | 'closed' | 'full' | 'cancelled';
    if (isRegistered) {
      registrationState = 'registered';
    } else if (isCancelled) {
      registrationState = 'cancelled';
    } else if (isFull) {
      registrationState = 'full';
    } else {
      registrationState = 'available';
    }

    const canRegister = !isRegistered && !isCancelled && !isFull;
    const capacityState: 'open' | 'full' | null = capacity <= 0 ? null : isFull ? 'full' : 'open';

    const effectiveAssocId = e.association_id || communityId;
    const communities = await this.prisma.$queryRaw<any[]>`
      SELECT name FROM public.associations WHERE id = ${effectiveAssocId}::uuid LIMIT 1
    `.catch(() => [] as any[]);

    return {
      event: {
        eventRef: e.id,
        title: e.name || e.title || '',
        startAt: e.date ? new Date(e.date).toISOString().split('T')[0] : null,
        locationLabel: e.location || null,
        formatLabel: e.type || null,
        registrationState,
        capacityState,
      },
      communityId: effectiveAssocId,
      communityName: communities[0]?.name || '',
      canRegister,
      checkinHandoff: isRegistered,
    };
  }


  async registerCommunityEvent(userId: string, communityId: string, eventRef: string) {
    const eventRows = await this.prisma.$queryRaw<any[]>`
      SELECT * FROM public.events WHERE id = ${eventRef} LIMIT 1
    `.catch(() => [] as any[]);
    if (eventRows.length === 0) throw new NotFoundException('event_not_found');

    const memberRows = await this.prisma.$queryRaw<any[]>`
      SELECT * FROM public.members WHERE user_id = ${userId}::uuid LIMIT 1
    `.catch(() => [] as any[]);
    const userRows = await this.prisma.vione_users.findUnique({ where: { id: userId } }).catch(() => null);

    const memberCode = memberRows[0]?.code ?? `MB-${Date.now().toString(36).toUpperCase()}`;
    const memberName = memberRows[0]?.name ?? userRows?.name ?? 'Hội viên';
    const email = memberRows[0]?.email ?? userRows?.email ?? '';

    const regId = `REG-${Date.now().toString(36).toUpperCase()}`;
    const luckyNum = String(Math.floor(1000 + Math.random() * 9000));
    await this.prisma.$executeRaw`
      INSERT INTO public.event_registrations (
        id, event_id, member_code, member_name, email, registered_at, status, ticket_type, association_id, lucky_number, created_at, updated_at
      ) VALUES (
        ${regId},
        ${eventRef},
        ${memberCode},
        ${memberName},
        ${email},
        now()::date,
        'confirmed',
        'Standard',
        ${communityId}::uuid,
        ${luckyNum},
        now(),
        now()
      )
    `;

    await this.prisma.$executeRaw`
      UPDATE public.events SET registered = registered + 1, updated_at = now() WHERE id = ${eventRef}
    `.catch(() => null);

    return { ok: true, registrationId: regId, luckyNumber: luckyNum };
  }

  async cancelCommunityEventRegistration(userId: string, communityId: string, eventRef: string) {
    const memberRows = await this.prisma.$queryRaw<any[]>`
      SELECT code, email FROM public.members WHERE user_id = ${userId}::uuid
    `.catch(() => [] as any[]);
    const memberCodes = memberRows.map(m => m.code).filter(Boolean);
    const user = await this.prisma.vione_users.findUnique({ where: { id: userId } }).catch(() => null);
    const email = user?.email || memberRows[0]?.email || '';

    await this.prisma.$executeRaw`
      UPDATE public.event_registrations SET status = 'cancelled', updated_at = now()
      WHERE event_id = ${eventRef} AND (member_code = ANY(${memberCodes}) OR (email != '' AND email = ${email}))
    `.catch(() => null);

    await this.prisma.$executeRaw`
      UPDATE public.events SET registered = GREATEST(0, registered - 1), updated_at = now() WHERE id = ${eventRef}
    `.catch(() => null);

    return { ok: true };
  }



  async notifyAssociationAdmins(
    associationId: string,
    payload: {
      title: string;
      body: string;
      targetRoute: string;
      type?: string;
      sourceRecordId?: string;
      meta?: any;
    },
  ) {
    try {
      const now = new Date();
      const code = `NTF-${Date.now().toString(36).toUpperCase()}`;

      await this.prisma.$executeRaw`
        INSERT INTO public.notifications (
          id, code, title, body, audience, channel, status, sent_at, association_id, app_scope, target_app, created_at, updated_at
        ) VALUES (
          gen_random_uuid(), ${code}, ${payload.title}, ${payload.body},
          'staff', 'inapp', 'sent', ${now}, ${associationId}::uuid, 'crm', 'crm', ${now}, ${now}
        )
      `.catch((err) => console.warn('Could not insert scoped public.notifications:', err));

      const adminMembers = await this.prisma.$queryRaw<any[]>`
        SELECT DISTINCT user_id FROM public.memberships
        WHERE (association_id = ${associationId}::uuid OR association_id IS NULL)
          AND role IN ('admin', 'association_admin', 'owner', 'staff', 'manager', 'executive')
        UNION
        SELECT DISTINCT user_id FROM public.user_roles
        WHERE role IN ('platform_admin', 'tenant_admin')
        UNION
        SELECT DISTINCT id AS user_id FROM public.vione_users
        WHERE email LIKE '%admin%' OR username LIKE '%admin%'
      `.catch(() => [] as any[]);

      const adminUserIds = Array.from(new Set(adminMembers.map((m) => m.user_id).filter(Boolean)));

      for (const adminId of adminUserIds) {
        const notifId = crypto.randomUUID();
        const safeData = JSON.stringify({
          title: payload.title,
          body: payload.body,
          companyName: payload.meta?.companyName || payload.title,
          applicantName: payload.meta?.applicantName,
          phone: payload.meta?.phone,
          targetRoute: payload.targetRoute,
          appScope: 'crm',
          ...(payload.meta || {}),
        });
        const actionTarget = JSON.stringify({
          route: payload.targetRoute,
          targetRoute: payload.targetRoute,
          associationId,
        });

        await this.prisma.$executeRaw`
          INSERT INTO public.business_notifications (
            id, recipient_user_id, source_domain, source_record_id, event_kind, notification_kind,
            title_key, body_key, safe_display_data, action_kind, action_label_key, action_target,
            priority, status, app_scope, target_app, created_at, updated_at, dedupe_key
          ) VALUES (
            ${notifId}::uuid, ${adminId}::uuid, 'association', ${payload.sourceRecordId || associationId},
            ${payload.type || 'assoc_registration'}, ${payload.type || 'assoc_admin_alert'},
            ${payload.title}, ${payload.body},
            ${safeData}::jsonb, 'navigate', 'Xem hồ sơ & duyệt', ${actionTarget}::jsonb,
            'high', 'delivered', 'crm', 'crm', ${now}, ${now}, ${`assoc_alert:${notifId}`}
          )
        `.catch((err) => console.warn('Error inserting business_notification for admin:', err));

        if (this.gateway) {
          this.gateway.emitNotification(adminId, {
            id: notifId,
            title: payload.title,
            body: payload.body,
            appScope: 'crm',
            targetApp: 'crm',
            action: { targetRoute: payload.targetRoute },
            safeDisplayData: {
              title: payload.title,
              body: payload.body,
              targetRoute: payload.targetRoute,
              appScope: 'crm',
            },
            targetRoute: payload.targetRoute,
          });
        }
      }

      if (this.gateway) {
        this.gateway.emitToRoom(`assoc:${associationId}`, 'notification:new', {
          title: payload.title,
          body: payload.body,
          targetRoute: payload.targetRoute,
          action: { targetRoute: payload.targetRoute },
          safeDisplayData: {
            title: payload.title,
            body: payload.body,
            targetRoute: payload.targetRoute,
          },
        });

        this.gateway.emitToAll('notification:new', {
          title: payload.title,
          body: payload.body,
          targetRoute: payload.targetRoute,
          action: { targetRoute: payload.targetRoute },
          safeDisplayData: {
            title: payload.title,
            body: payload.body,
            targetRoute: payload.targetRoute,
          },
        });
      }
    } catch (err) {
      console.warn('Error in notifyAssociationAdmins:', err);
    }
  }

}
