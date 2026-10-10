import { Injectable, NotFoundException, BadRequestException, ForbiddenException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ConnectAppGateway } from '../connect-app.gateway';
import { parsePersonId, composePersonId } from '../connect-app.utils';
import * as crypto from 'crypto';

@Injectable()
export class ConnectNetworkService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: ConnectAppGateway,
  ) {}

  async resolvePublicCounterparts(userIds: string[]) {
    if (!Array.isArray(userIds) || userIds.length === 0) return [];
    const validIds = userIds.filter(id => typeof id === 'string' && id.trim().length > 0);
    if (validIds.length === 0) return [];

    const summaries: any[] = [];
    for (const uid of validIds) {
      try {
        const cards = await this.prisma.$queryRaw<any[]>`
          SELECT id, display_name, avatar_url, headline, company_name, slug, professional_title, status
          FROM public.business_cards
          WHERE user_id = ${uid}::uuid
          ORDER BY (status = 'published') DESC, is_primary DESC, updated_at DESC LIMIT 1
        `.catch(() => []);

        const userProfiles = await this.prisma.$queryRaw<any[]>`
          SELECT user_id, display_name, avatar_url, professional_title, company_name, bio
          FROM public.user_profiles
          WHERE user_id = ${uid}::uuid LIMIT 1
        `.catch(() => []);

        const authUsers = await this.prisma.$queryRaw<any[]>`
          SELECT id, name, avatar, avatar_url, phone, email, job_title, company
          FROM public.vione_users
          WHERE id = ${uid}::uuid LIMIT 1
        `.catch(() => []);

        const members = await this.prisma.$queryRaw<any[]>`
          SELECT id, name, avatar_url, job_title, company_name
          FROM public.members
          WHERE user_id = ${uid}::uuid OR id = ${uid}::uuid
          ORDER BY (status = 'active') DESC, updated_at DESC LIMIT 1
        `.catch(() => []);

        const businessIdentities = await this.prisma.$queryRaw<any[]>`
          SELECT id, display_name, avatar_url, headline, job_title, company_name, bio
          FROM public.business_identities
          WHERE owner_user_id = ${uid}::uuid OR id = ${uid}::uuid
          ORDER BY (status = 'active') DESC, updated_at DESC LIMIT 1
        `.catch(() => []);

        const card = cards[0];
        const profile = userProfiles[0];
        const authUser = authUsers[0];
        const member = members[0];
        const bi = businessIdentities[0];

        const displayName =
          card?.display_name ||
          bi?.display_name ||
          profile?.display_name ||
          authUser?.full_name ||
          authUser?.name ||
          member?.name ||
          'Hội viên CEO 1983';

        const avatarUrl =
          card?.avatar_url ||
          bi?.avatar_url ||
          profile?.avatar_url ||
          authUser?.avatar_url ||
          authUser?.avatar ||
          member?.avatar_url ||
          null;

        const headline =
          card?.headline ||
          bi?.headline ||
          bi?.job_title ||
          card?.professional_title ||
          profile?.professional_title ||
          authUser?.job_title ||
          member?.job_title ||
          null;

        const companyName =
          card?.company_name ||
          profile?.company_name ||
          authUser?.company ||
          member?.company_name ||
          null;

        const primaryCardSlug = card?.slug || null;

        summaries.push({
          userId: uid,
          displayName,
          avatarUrl,
          headline,
          companyName,
          primaryCardSlug,
        });
      } catch (err) {
        summaries.push({
          userId: uid,
          displayName: 'Hội viên CEO 1983',
          avatarUrl: null,
          headline: null,
          companyName: null,
          primaryCardSlug: null,
        });
      }
    }

    return summaries;
  }

  async listConnections(userId: string) {
    const connections = await this.prisma.$queryRaw<any[]>`
      SELECT id, requester_user_id, recipient_user_id as target_user_id, responded_at, created_at
      FROM public.user_connections
      WHERE status = 'accepted'::public.global_connection_status AND (requester_user_id = ${userId}::uuid OR recipient_user_id = ${userId}::uuid)
      ORDER BY responded_at DESC NULLS LAST
    `.catch(() => []);
    
    return connections.map(c => {
      const counterpartUserId = c.requester_user_id === userId ? c.target_user_id : c.requester_user_id;
      return {
        id: c.id,
        counterpartUserId,
        respondedAt: c.responded_at ? new Date(c.responded_at).toISOString() : null,
        createdAt: c.created_at ? new Date(c.created_at).toISOString() : null,
      };
    });
  }

  async searchSavedCards(userId: string, term: string = '') {
    let cards: any[] = [];
    if (term) {
      const likeTerm = `%${term.toLowerCase()}%`;
      cards = await this.prisma.$queryRaw<any[]>`
        SELECT s.id, s.target_card_id, s.saved_at, s.industry,
               COALESCE(bc.display_name, bi.display_name) as display_name,
               COALESCE(bc.avatar_url, bi.avatar_url) as avatar_url,
               COALESCE(bc.professional_title, bc.headline, bi.job_title) as professional_title,
               COALESCE(bc.company_name, bi.company_name) as company_name,
               COALESCE(bc.headline, bi.headline) as headline,
               COALESCE(bc.slug, bi.id::text) as slug
        FROM public.saved_business_cards s
        LEFT JOIN public.business_cards bc ON s.target_card_id = bc.id
        LEFT JOIN public.business_identities bi ON s.target_card_id = bi.id
        WHERE s.owner_user_id = ${userId}::uuid AND s.archived = false
          AND (
            LOWER(COALESCE(bc.display_name, bi.display_name, '')) LIKE ${likeTerm} OR
            LOWER(COALESCE(bc.company_name, bi.company_name, '')) LIKE ${likeTerm} OR
            LOWER(COALESCE(bc.headline, bi.headline, '')) LIKE ${likeTerm}
          )
        ORDER BY s.saved_at DESC
      `.catch(() => []);
    } else {
      cards = await this.prisma.$queryRaw<any[]>`
        SELECT s.id, s.target_card_id, s.saved_at, s.industry,
               COALESCE(bc.display_name, bi.display_name) as display_name,
               COALESCE(bc.avatar_url, bi.avatar_url) as avatar_url,
               COALESCE(bc.professional_title, bc.headline, bi.job_title) as professional_title,
               COALESCE(bc.company_name, bi.company_name) as company_name,
               COALESCE(bc.headline, bi.headline) as headline,
               COALESCE(bc.slug, bi.id::text) as slug
        FROM public.saved_business_cards s
        LEFT JOIN public.business_cards bc ON s.target_card_id = bc.id
        LEFT JOIN public.business_identities bi ON s.target_card_id = bi.id
        WHERE s.owner_user_id = ${userId}::uuid AND s.archived = false
        ORDER BY s.saved_at DESC
      `.catch(() => []);
    }

    return cards.map(c => ({
      id: c.id,
      targetCardId: c.target_card_id,
      savedAt: c.saved_at ? new Date(c.saved_at).toISOString() : null,
      target: {
        displayName: c.display_name || null,
        avatarUrl: c.avatar_url || null,
        professionalTitle: c.professional_title || null,
        companyName: c.company_name || null,
        slug: c.slug || c.target_card_id,
      }
    }));
  }

  async listGuestContacts(userId: string) {
    const guests = await this.prisma.$queryRaw<any[]>`
      SELECT id, display_name, title, company_name, first_shared_at, last_shared_at, source
      FROM public.guest_contacts
      WHERE owner_user_id = ${userId}::uuid
      ORDER BY last_shared_at DESC
    `.catch(() => []);

    return guests.map(g => ({
      id: g.id,
      displayName: g.display_name || null,
      title: g.title || null,
      companyName: g.company_name || null,
      firstSharedAt: g.first_shared_at ? new Date(g.first_shared_at).toISOString() : null,
      lastSharedAt: g.last_shared_at ? new Date(g.last_shared_at).toISOString() : null,
      source: g.source || null,
    }));
  }

  async getTodayRecommendations(userId: string) {
    const now = new Date();
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);
    const safeUserId = isUuid ? userId : '00000000-0000-0000-0000-000000000000';

    // Fetch viewer profile to know their location, headline and industry for smart matching
    const viewerProfile: any[] = await this.prisma.$queryRaw<any[]>`
      SELECT id, owner_user_id, display_name, headline, company_name, city
      FROM public.business_identities
      WHERE owner_user_id = ${safeUserId}::uuid
      LIMIT 1
    `.catch(() => [] as any[]);

    const rawViewerCity = (viewerProfile[0]?.city || '').trim().toLowerCase();
    const viewerCity = rawViewerCity.replace(/^(thành phố|tp\.|tỉnh)\s*/i, '').trim();

    // Fetch connected users with real interaction timestamps and counts (Nurture Connections list)
    const connectedRows: any[] = await this.prisma.$queryRaw<any[]>`
      SELECT 
        bi.id as identity_id, 
        bi.owner_user_id, 
        bi.display_name, 
        bi.avatar_url, 
        bi.headline, 
        bi.company_name, 
        bi.city,
        uc.created_at as connection_created_at,
        uc.updated_at as connection_updated_at,
        (
          SELECT MAX(m.occurred_at)
          FROM public.business_relationship_moments m
          WHERE (m.owner_user_id = ${safeUserId}::uuid AND m.target_person_id = bi.owner_user_id)
             OR (m.owner_user_id = bi.owner_user_id AND m.target_person_id = ${safeUserId}::uuid)
        ) as last_moment_at,
        (
          SELECT COUNT(*)
          FROM public.business_relationship_moments m
          WHERE (m.owner_user_id = ${safeUserId}::uuid AND m.target_person_id = bi.owner_user_id)
             OR (m.owner_user_id = bi.owner_user_id AND m.target_person_id = ${safeUserId}::uuid)
        ) as moment_count,
        (
          SELECT MAX(msg.created_at)
          FROM public.direct_messages msg
          WHERE (msg.sender_id = ${safeUserId}::uuid AND msg.recipient_id = bi.owner_user_id)
             OR (msg.sender_id = bi.owner_user_id AND msg.recipient_id = ${safeUserId}::uuid)
        ) as last_message_at,
        (
          SELECT COUNT(*)
          FROM public.direct_messages msg
          WHERE (msg.sender_id = ${safeUserId}::uuid AND msg.recipient_id = bi.owner_user_id)
             OR (msg.sender_id = bi.owner_user_id AND msg.recipient_id = ${safeUserId}::uuid)
        ) as message_count
      FROM public.user_connections uc
      JOIN public.business_identities bi ON (
        (uc.requester_user_id = ${safeUserId}::uuid AND uc.recipient_user_id = bi.owner_user_id) OR
        (uc.recipient_user_id = ${safeUserId}::uuid AND uc.requester_user_id = bi.owner_user_id)
      )
      WHERE uc.status = 'accepted'::public.global_connection_status AND bi.status = 'active'
    `.catch(() => [] as any[]);

    // Fetch non-connected users (AI Match Suggestions list)
    let nonConnectedRows: any[] = await this.prisma.$queryRaw<any[]>`
      SELECT bi.id as identity_id, bi.owner_user_id, bi.display_name, bi.avatar_url, bi.headline, bi.company_name, bi.city
      FROM public.business_identities bi
      WHERE bi.owner_user_id != ${safeUserId}::uuid AND bi.status = 'active'
        AND bi.owner_user_id NOT IN (
          SELECT CASE 
            WHEN requester_user_id = ${safeUserId}::uuid THEN recipient_user_id
            ELSE requester_user_id
          END
          FROM public.user_connections
          WHERE requester_user_id = ${safeUserId}::uuid OR recipient_user_id = ${safeUserId}::uuid
        )
      LIMIT 30
    `.catch(() => [] as any[]);

    // Fallback to other users from vione_users if business_identities has few records
    if (nonConnectedRows.length < 5) {
      const existingIds = [
        safeUserId,
        ...nonConnectedRows.map((r: any) => String(r.owner_user_id)),
        ...connectedRows.map((r: any) => String(r.owner_user_id)),
      ];
      const extraUsers = await this.prisma.vione_users.findMany({
        where: {
          id: {
            notIn: existingIds,
          },
        },
        take: 15,
      }).catch(() => [] as any[]);

      extraUsers.forEach((u: any) => {
        nonConnectedRows.push({
          identity_id: u.id,
          owner_user_id: u.id,
          display_name: u.name || u.username,
          avatar_url: u.avatar_url,
          headline: 'Doanh nhân CEO 1983',
          company_name: 'CLB Doanh Nhân CEO 1983',
          city: 'Việt Nam',
        });
      });
    }

    const LEADERSHIP_KEYWORDS = [
      'chủ tịch', 'ceo', 'founder', 'sáng lập', 'giám đốc', 'director', 
      'c-level', 'tổng giám đốc', 'phó giám đốc', 'trưởng phòng', 'leader', 'chuyên gia'
    ];

    const isHighPotential = (headline: string, company: string): boolean => {
      const text = `${headline} ${company}`.toLowerCase();
      return LEADERSHIP_KEYWORDS.some((kw) => text.includes(kw));
    };

    const isNearby = (candidateCity: string): boolean => {
      if (!viewerCity || !candidateCity) return false;
      const cleanCandidate = candidateCity.toLowerCase().replace(/^(thành phố|tp\.|tỉnh)\s*/i, '').trim();
      return cleanCandidate.includes(viewerCity) || viewerCity.includes(cleanCandidate);
    };

    const scoredRecommendations: Array<{ score: number; item: any }> = [];

    // 1. Process non-connected users (AI Match suggestions)
    nonConnectedRows.forEach((row: any) => {
      const personIdStr = row.owner_user_id ? String(row.owner_user_id) : '';
      const cleanPersonId = personIdStr.startsWith('u:') ? personIdStr : `u:${personIdStr}`;
      const company = row.company_name || 'Doanh nghiệp đối tác';
      const city = row.city || 'Việt Nam';
      const headline = row.headline || 'Doanh nhân';
      const displayName = row.display_name || 'Hội viên';

      let score = 20; // base potential score
      const near = isNearby(city);
      const potential = isHighPotential(headline, company);

      if (near) score += 50; // Priority 1: Gần bạn
      if (potential) score += 40; // Priority 2: Tiềm năng cao (C-level / Founder / Giám đốc)
      if (row.avatar_url) score += 10;
      if (row.headline && row.headline.length > 5) score += 10;

      let aiSuggestion = '';
      if (near && potential) {
        aiSuggestion = `AI ưu tiên: ${displayName} là ${headline} tại ${company}, cùng khu vực ${city} với bạn. Thuận tiện kết nối và gặp mặt trực tiếp để thảo luận hợp tác chiến lược.`;
      } else if (near) {
        aiSuggestion = `AI đề xuất (Gần bạn): ${displayName} ở khu vực ${city}. Kết nối ngay để giao lưu và mở rộng mối quan hệ địa phương.`;
      } else if (potential) {
        aiSuggestion = `AI đề xuất (Tiềm năng cao): ${displayName} giữ vị trí ${headline} tại ${company}. Rất phù hợp để mở rộng mạng lưới doanh nhân cấp cao.`;
      } else {
        aiSuggestion = `AI đề xuất: Kết nối với ${displayName} (${headline} tại ${company}) để trao đổi cơ hội kinh doanh tại ${city}.`;
      }

      scoredRecommendations.push({
        score,
        item: {
          id: `${cleanPersonId}:match`,
          person: {
            personId: cleanPersonId,
            displayName,
            avatarUrl: row.avatar_url,
            headline,
            companyName: company,
            industryLabel: 'Kinh doanh',
            areaLabel: city,
          },
          type: 'reconnect',
          reason: {
            kind: 'last_interaction',
            days: 0,
            evidenceKind: 'moment',
          },
          aiSuggestion,
          wordingSource: 'ai',
          generatedAt: now.toISOString(),
        },
      });
    });

    // 2. Process connected users (Nurture Connections & frequent interactions)
    connectedRows.forEach((row) => {
      const personIdStr = row.owner_user_id ? String(row.owner_user_id) : '';
      const cleanPersonId = personIdStr.startsWith('u:') ? personIdStr : `u:${personIdStr}`;
      
      const lastInteractionDate = row.last_moment_at || row.last_message_at || row.connection_updated_at || row.connection_created_at || now;
      const lastTime = new Date(lastInteractionDate).getTime();
      const diffMs = Math.max(0, now.getTime() - (isNaN(lastTime) ? now.getTime() : lastTime));
      const days = Math.max(1, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
      
      const displayName = row.display_name || 'Đối tác';
      const headline = row.headline || 'Doanh nhân';
      const company = row.company_name || 'Partner';
      const city = row.city || 'Việt Nam';

      const momentCount = Number(row.moment_count || 0);
      const messageCount = Number(row.message_count || 0);
      const totalInteractions = momentCount + messageCount;

      let score = 30; // base connection score
      const near = isNearby(city);
      const potential = isHighPotential(headline, company);

      if (near) score += 45; // Gần bạn
      if (potential) score += 35; // Lãnh đạo / Tiềm năng
      
      // Priority 3: Nhiều tương tác
      if (totalInteractions >= 5) {
        score += 45; // Đối tác gắn bó, tương tác nhiều
      } else if (totalInteractions >= 2) {
        score += 25;
      }

      // Chu kỳ hâm nóng quan hệ: 7 - 45 ngày là khoảng thời gian vàng để chăm sóc
      if (days >= 7 && days <= 45) {
        score += 35;
      } else if (days > 45) {
        score += 20;
      }

      let aiSuggestion = '';
      if (totalInteractions >= 3 && near) {
        aiSuggestion = `AI nhắc nhở (Đối tác thân thiết): Bạn và ${displayName} đã có ${totalInteractions} lượt tương tác và cùng ở ${city}. Đã ${days} ngày chưa trao đổi, hãy hẹn gặp cà phê giữ nhiệt quan hệ!`;
      } else if (totalInteractions >= 3) {
        aiSuggestion = `AI nhắc nhở: ${displayName} là đối tác thường xuyên tương tác (${totalInteractions} lượt). Đã ${days} ngày chưa liên hệ, hãy gửi tin nhắn cập nhật tiến độ công việc.`;
      } else if (near) {
        aiSuggestion = `AI nhắc nhở: ${displayName} ở gần bạn (${city}). Đã ${days} ngày chưa tương tác, hãy sắp xếp buổi gặp trao đổi thêm cơ hội hợp tác.`;
      } else {
        aiSuggestion = `AI nhắc nhở: Đã ${days} ngày chưa tương tác cùng ${displayName} (${headline}). Hãy thăm hỏi định kỳ để giữ quan hệ hợp tác lâu dài.`;
      }

      scoredRecommendations.push({
        score,
        item: {
          id: `${cleanPersonId}:reconnect`,
          person: {
            personId: cleanPersonId,
            displayName,
            avatarUrl: row.avatar_url,
            headline,
            companyName: company,
            industryLabel: 'Kinh doanh',
            areaLabel: city,
          },
          type: 'reconnect',
          reason: {
            kind: 'last_interaction',
            days,
            evidenceKind: 'moment',
          },
          aiSuggestion,
          wordingSource: 'ai',
          generatedAt: now.toISOString(),
        },
      });
    });

    // Sort descending by multi-factor score: proximity, high potential, interaction frequency
    scoredRecommendations.sort((a, b) => b.score - a.score);

    const recommendations = scoredRecommendations.map((entry) => entry.item);

    return { recommendations };
  }

  async getPersonRecommendation(userId: string, personId: string) {
    const list = await this.getTodayRecommendations(userId);
    const cleanId = personId.startsWith('u:') ? personId : `u:${personId}`;
    const rawId = personId.replace(/^[ucg]:/, '');
    const rec = list.recommendations.find(r => 
      r.person.personId === cleanId || 
      r.person.personId === personId || 
      r.person.personId === rawId ||
      r.person.personId.endsWith(rawId)
    );
    return { recommendation: rec || null };
  }

  async dismissRecommendation(userId: string, personId: string) {
    return { ok: true };
  }

  async getNetworkFeed(userId: string, cursor: string | null) {
    const limit = 12;
    let momentRows: any[];

    if (cursor) {
      momentRows = await this.prisma.$queryRaw<any[]>`
        SELECT 
          m.id, 
          m.owner_user_id,
          m.target_kind, 
          m.target_user_id, 
          m.target_card_id, 
          m.target_guest_id, 
          m.occurred_at, 
          m.created_at,
          m.event_name, 
          m.place_label, 
          m.note,
          COALESCE(m.visibility, 'friends') as visibility,
          bi_owner.display_name as owner_display_name,
          bi_owner.avatar_url as owner_avatar_url,
          bi_owner.job_title as owner_job_title,
          bi_owner.company_name as owner_company_name,
          u_owner.email as owner_email,
          bi_target.display_name as target_display_name,
          bi_target.avatar_url as target_avatar_url,
          bi_target.job_title as target_job_title,
          bi_target.company_name as target_company_name,
          c.display_name as card_display_name,
          c.avatar_url as card_avatar_url,
          c.company_name as card_company_name,
          g.display_name as guest_display_name,
          g.company_name as guest_company_name
        FROM public.business_relationship_moments m
        LEFT JOIN public.business_identities bi_owner ON m.owner_user_id = bi_owner.owner_user_id
        LEFT JOIN public.vione_users u_owner ON m.owner_user_id = u_owner.id
        LEFT JOIN public.business_identities bi_target ON m.target_user_id = bi_target.owner_user_id
        LEFT JOIN public.member_business_cards c ON m.target_card_id = c.id
        LEFT JOIN public.guest_contacts g ON m.target_guest_id = g.id
        WHERE (
          m.owner_user_id = ${userId}::uuid 
          OR (m.target_user_id = ${userId}::uuid AND COALESCE(m.visibility, 'friends') != 'private')
          OR (COALESCE(m.visibility, 'friends') = 'public')
          OR (
            COALESCE(m.visibility, 'friends') = 'friends'
            AND m.owner_user_id IN (
              SELECT CASE 
                WHEN requester_user_id = ${userId}::uuid THEN recipient_user_id 
                WHEN recipient_user_id = ${userId}::uuid THEN requester_user_id
                WHEN pair_user_low = ${userId}::uuid THEN pair_user_high 
                ELSE pair_user_low 
              END
              FROM public.user_connections
              WHERE (requester_user_id = ${userId}::uuid OR recipient_user_id = ${userId}::uuid
                     OR pair_user_low = ${userId}::uuid OR pair_user_high = ${userId}::uuid)
                AND status = 'accepted'::public.global_connection_status
            )
          )
        )
          AND m.status IN ('active', 'pending')
          AND m.created_at < ${new Date(cursor)}
        ORDER BY m.created_at DESC, m.occurred_at DESC, m.id DESC
        LIMIT ${limit + 1}
      `.catch(() => []);
    } else {
      momentRows = await this.prisma.$queryRaw<any[]>`
        SELECT 
          m.id, 
          m.owner_user_id,
          m.target_kind, 
          m.target_user_id, 
          m.target_card_id, 
          m.target_guest_id, 
          m.occurred_at, 
          m.created_at,
          m.event_name, 
          m.place_label, 
          m.note,
          COALESCE(m.visibility, 'friends') as visibility,
          bi_owner.display_name as owner_display_name,
          bi_owner.avatar_url as owner_avatar_url,
          bi_owner.job_title as owner_job_title,
          bi_owner.company_name as owner_company_name,
          u_owner.email as owner_email,
          bi_target.display_name as target_display_name,
          bi_target.avatar_url as target_avatar_url,
          bi_target.job_title as target_job_title,
          bi_target.company_name as target_company_name,
          c.display_name as card_display_name,
          c.avatar_url as card_avatar_url,
          c.company_name as card_company_name,
          g.display_name as guest_display_name,
          g.company_name as guest_company_name
        FROM public.business_relationship_moments m
        LEFT JOIN public.business_identities bi_owner ON m.owner_user_id = bi_owner.owner_user_id
        LEFT JOIN public.vione_users u_owner ON m.owner_user_id = u_owner.id
        LEFT JOIN public.business_identities bi_target ON m.target_user_id = bi_target.owner_user_id
        LEFT JOIN public.member_business_cards c ON m.target_card_id = c.id
        LEFT JOIN public.guest_contacts g ON m.target_guest_id = g.id
        WHERE (
          m.owner_user_id = ${userId}::uuid 
          OR (m.target_user_id = ${userId}::uuid AND COALESCE(m.visibility, 'friends') != 'private')
          OR (COALESCE(m.visibility, 'friends') = 'public')
          OR (
            COALESCE(m.visibility, 'friends') = 'friends'
            AND m.owner_user_id IN (
              SELECT CASE 
                WHEN requester_user_id = ${userId}::uuid THEN recipient_user_id 
                WHEN recipient_user_id = ${userId}::uuid THEN requester_user_id
                WHEN pair_user_low = ${userId}::uuid THEN pair_user_high 
                ELSE pair_user_low 
              END
              FROM public.user_connections
              WHERE (requester_user_id = ${userId}::uuid OR recipient_user_id = ${userId}::uuid
                     OR pair_user_low = ${userId}::uuid OR pair_user_high = ${userId}::uuid)
                AND status = 'accepted'::public.global_connection_status
            )
          )
        )
          AND m.status IN ('active', 'pending')
        ORDER BY m.created_at DESC, m.occurred_at DESC, m.id DESC
        LIMIT ${limit + 1}
      `.catch(() => []);
    }

    let nextCursor: string | null = null;
    if (momentRows.length > limit) {
      const nextItem = momentRows.pop();
      nextCursor = nextItem.created_at ? new Date(nextItem.created_at).toISOString() : null;
    }

    const momentIds = momentRows.map(m => m.id);
    let mediaRows: any[] = [];
    if (momentIds.length > 0) {
      mediaRows = await this.prisma.$queryRaw<any[]>`
        SELECT id, moment_id, storage_path, sort_order
        FROM public.business_relationship_moment_media
        WHERE moment_id = ANY(${momentIds}::uuid[])
        ORDER BY sort_order ASC
      `.catch(() => []);
    }

    const mediaByMomentId = new Map<string, any[]>();
    for (const m of mediaRows) {
      const list = mediaByMomentId.get(m.moment_id) || [];
      list.push(m);
      mediaByMomentId.set(m.moment_id, list);
    }
    const signed: Record<string, string> = {};
    for (const m of mediaRows) {
      if (m.storage_path) {
        signed[m.storage_path] = m.storage_path.startsWith('http')
          ? m.storage_path
          : m.storage_path.startsWith('/')
            ? m.storage_path
            : `/uploads/${m.storage_path}`;
      }
    }

    const items = momentRows.map(row => {
      let personId = '';
      if (row.target_kind === 'connection') {
        personId = `u:${row.target_user_id}`;
      } else if (row.target_kind === 'saved_card') {
        personId = `c:${row.target_card_id}`;
      } else if (row.target_kind === 'guest_contact') {
        personId = `g:${row.target_guest_id}`;
      }

      const slots = mediaByMomentId.get(row.id) || [];
      const photoUrls = slots.map(s => {
        if (!s.storage_path) return '';
        if (s.storage_path.startsWith('/upload/') || s.storage_path.startsWith('http')) {
          return s.storage_path;
        }
        return signed[s.storage_path] || `/upload/file/${s.storage_path.split('/').pop()}`;
      }).filter(Boolean);

      const ownerDisplayName = row.owner_display_name || row.owner_email?.split('@')[0] || 'Hội viên CEO 1983';
      const targetDisplayName = row.target_display_name || row.card_display_name || row.guest_display_name || null;
      const targetAvatarUrl = row.target_avatar_url || row.card_avatar_url || null;
      const targetHeadline = row.target_job_title || null;
      const targetCompanyName = row.target_company_name || row.card_company_name || row.guest_company_name || null;

      return {
        momentId: row.id,
        ownerUserId: row.owner_user_id,
        owner: {
          userId: row.owner_user_id,
          displayName: ownerDisplayName,
          avatarUrl: row.owner_avatar_url || null,
          headline: row.owner_job_title || null,
          companyName: row.owner_company_name || null,
        },
        target: targetDisplayName ? {
          personId,
          displayName: targetDisplayName,
          avatarUrl: targetAvatarUrl,
          headline: targetHeadline,
          companyName: targetCompanyName,
        } : null,
        personId,
        occurredAt: row.occurred_at ? new Date(row.occurred_at).toISOString() : new Date().toISOString(),
        createdAt: row.created_at ? new Date(row.created_at).toISOString() : (row.occurred_at ? new Date(row.occurred_at).toISOString() : new Date().toISOString()),
        eventName: row.event_name || null,
        placeLabel: row.place_label || null,
        note: row.note || null,
        photoUrls,
        photoCount: slots.length,
      };
    });

    return { items, nextCursor };
  }

  async getCommunityActivityPreview(userId: string, communityId: string) {
    const events = await this.prisma.$queryRaw<any[]>`
      SELECT id, name, date, location, type, capacity, registered, status
      FROM public.events
      WHERE association_id = ${communityId}::uuid AND status NOT IN ('cancelled')
      ORDER BY (date >= CURRENT_DATE) DESC, date ASC
      LIMIT 10
    `.catch((err) => {
      console.error('Error in getCommunityActivityPreview events query:', err);
      return [];
    });

    const opportunities = await this.prisma.$queryRaw<any[]>`
      SELECT id, title, type, status, deadline, created_at
      FROM public.opportunities
      WHERE (association_id = ${communityId}::uuid OR association_id IS NULL) AND status IN ('open', 'published')
      ORDER BY created_at DESC
      LIMIT 10
    `.catch((err) => {
      console.error('Error in getCommunityActivityPreview opps query:', err);
      return [];
    });

    // Fetch user registrations and capacity counts for all events
    const eventIds = events.map(e => e.id);
    let regSet = new Set<string>();
    let regCounts = new Map<string, number>();

    if (eventIds.length > 0) {
      const userMembers = await this.prisma.$queryRaw<any[]>`
        SELECT code, email FROM public.members WHERE user_id = ${userId}::uuid
      `.catch(() => [] as any[]);
      const userMemberCodes = userMembers.map(m => m.code).filter(Boolean);
      const userInfo = await this.prisma.vione_users.findUnique({ where: { id: userId } }).catch(() => null);
      const userEmail = userInfo?.email || userMembers[0]?.email || '';

      const registrations = await this.prisma.$queryRaw<any[]>`
        SELECT event_id FROM public.event_registrations
        WHERE event_id = ANY(${eventIds})
          AND (member_code = ANY(${userMemberCodes}) OR (email != '' AND email = ${userEmail}))
          AND status != 'cancelled'
      `.catch(() => [] as any[]);
      regSet = new Set(registrations.map(r => r.event_id));

      const counts = await this.prisma.$queryRaw<{ event_id: string; cnt: bigint }[]>`
        SELECT event_id, COUNT(*) as cnt FROM public.event_registrations
        WHERE event_id = ANY(${eventIds}) AND status != 'cancelled'
        GROUP BY event_id
      `.catch(() => [] as any[]);
      regCounts = new Map(counts.map(c => [c.event_id, Number(c.cnt)] as [string, number]));
    }

    return {
      nextEvents: events.map(e => {
        const isRegistered = regSet.has(e.id);
        const capacity = e.capacity ? Number(e.capacity) : 0;
        const isFull = capacity > 0 && (regCounts.get(e.id) ?? Number(e.registered || 0)) >= capacity;
        const isCancelled = e.status === 'cancelled';

        let registrationState: 'available' | 'registered' | 'closed' | 'full' | 'cancelled';
        if (isRegistered) registrationState = 'registered';
        else if (isCancelled) registrationState = 'cancelled';
        else if (isFull) registrationState = 'full';
        else registrationState = 'available';

        return {
          eventRef: e.id,
          title: e.name || '',
          startAt: e.date ? new Date(e.date).toISOString().split('T')[0] : '',
          locationLabel: e.location || null,
          formatLabel: e.type || null,
          registrationState,
          capacityState: capacity <= 0 ? null : isFull ? 'full' : 'open',
        };
      }),
      openOpportunities: opportunities.map(o => ({
        opportunityRef: o.id,
        title: o.title,
        categoryKey: o.type ? `opp.type.${o.type}` : null,
        organizationLabel: null,
        daysLeft: o.deadline ? Math.ceil((new Date(o.deadline).getTime() - Date.now()) / (1000 * 3600 * 24)) : null,
      })),
    };
  }


  async getUnreadNotificationCount(userId: string) {
    const [notifCountRes, pendingConnRes] = await Promise.all([
      this.prisma.$queryRaw<any[]>`
        SELECT COUNT(id)::int as count FROM public.business_notifications
        WHERE recipient_user_id = ${userId}::uuid AND status != 'read' AND read_at IS NULL
      `.catch(() => [{ count: 0 }]),
      this.prisma.$queryRaw<any[]>`
        SELECT COUNT(id)::int as count FROM public.user_connections
        WHERE recipient_user_id = ${userId}::uuid AND status = 'pending'::public.global_connection_status
      `.catch(() => [{ count: 0 }]),
    ]);
    const bCount = notifCountRes[0]?.count || 0;
    const cCount = pendingConnRes[0]?.count || 0;
    return { count: Math.max(bCount, cCount) };
  }

  async sendConnectionRequest(userId: string, body: any) {
    let targetUserId = body.targetUserId || body.target_user_id || body.targetPersonNodeId || body.memberCode || body.memberId;
    if (targetUserId && String(targetUserId).startsWith('u:')) {
      targetUserId = String(targetUserId).substring(2);
    }
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(targetUserId || ''));
    if (!isUuid && targetUserId) {
      const memRows = await this.prisma.$queryRaw<any[]>`
        SELECT user_id FROM public.members 
        WHERE LOWER(code) = LOWER(${String(targetUserId)}) OR id = ${String(targetUserId)} LIMIT 1
      `.catch(() => []);
      if (memRows[0]?.user_id) {
        targetUserId = memRows[0].user_id;
      }
    }
    if (!targetUserId) {
      throw new Error('targetUserId is required');
    }
    if (userId === targetUserId) {
      throw new Error('Cannot connect to yourself');
    }
    const now = new Date();

    // Check if an existing connection row exists between these two users (either direction)
    const existing = await this.prisma.$queryRaw<any[]>`
      SELECT id, requester_user_id, recipient_user_id, status FROM public.user_connections
      WHERE (requester_user_id = ${userId}::uuid AND recipient_user_id = ${targetUserId}::uuid)
         OR (requester_user_id = ${targetUserId}::uuid AND recipient_user_id = ${userId}::uuid)
      LIMIT 1
    `.catch(() => []);

    let reqId = crypto.randomUUID();

    if (existing.length > 0) {
      const conn = existing[0];
      if (conn.status === 'accepted') {
        const targetProfiles = await this.prisma.$queryRaw<any[]>`
          SELECT display_name, avatar_url, job_title, company_name
          FROM public.business_identities
          WHERE owner_user_id = ${targetUserId}::uuid AND status = 'active'
          LIMIT 1
        `.catch(() => [] as any[]);
        const targetName = targetProfiles[0]?.display_name || 'đối tác';
        return {
          ok: true,
          connectionId: conn.id,
          status: 'accepted',
          isAlreadyConnected: true,
          message: `Bạn và ${targetName} đã là kết nối của nhau`,
          targetProfile: targetProfiles[0] || null,
        };
      }

      // If incoming pending: target user already requested connection with this user -> auto accept
      if (conn.status === 'pending' && conn.recipient_user_id === userId) {
        return this.acceptConnection(userId, { connectionId: conn.id });
      }

      // If outgoing pending: already sent and awaiting approval
      if (conn.status === 'pending' && conn.requester_user_id === userId) {
        return {
          ok: true,
          connectionId: conn.id,
          status: 'pending',
          message: 'Lời mời kết nối đã được gửi trước đó và đang chờ phản hồi.',
        };
      }

      // If in terminated state (declined, cancelled): delete stale row to prevent trigger violations
      await this.prisma.$executeRaw`
        DELETE FROM public.user_connections WHERE id = ${conn.id}::uuid
      `.catch(() => {});

      await this.prisma.$executeRaw`
        INSERT INTO public.user_connections (id, requester_user_id, recipient_user_id, status, source_type, requested_at, created_at, updated_at)
        VALUES (${reqId}::uuid, ${userId}::uuid, ${targetUserId}::uuid, 'pending'::public.global_connection_status, 'manual'::public.global_connection_source_type, ${now}, ${now}, ${now})
      `;
    } else {
      await this.prisma.$executeRaw`
        INSERT INTO public.user_connections (id, requester_user_id, recipient_user_id, status, source_type, requested_at, created_at, updated_at)
        VALUES (${reqId}::uuid, ${userId}::uuid, ${targetUserId}::uuid, 'pending'::public.global_connection_status, 'manual'::public.global_connection_source_type, ${now}, ${now}, ${now})
      `;
    }

    // Persist notification for recipient and emit WebSocket events
    try {
      const requesterProfiles = await this.prisma.$queryRaw<any[]>`
        SELECT display_name, avatar_url, job_title, company_name
        FROM public.business_identities
        WHERE owner_user_id = ${userId}::uuid AND status = 'active'
        LIMIT 1
      `.catch(() => [] as any[]);
      let requesterDisplayName = requesterProfiles[0]?.display_name;
      let requesterAvatarUrl = requesterProfiles[0]?.avatar_url;
      let requesterJobTitle = requesterProfiles[0]?.job_title;
      let requesterCompanyName = requesterProfiles[0]?.company_name;

      if (!requesterDisplayName) {
        const up = await this.prisma.$queryRaw<any[]>`
          SELECT display_name, avatar_url, professional_title, company_name FROM public.user_profiles WHERE user_id = ${userId}::uuid LIMIT 1
        `.catch(() => []);
        if (up[0]) {
          requesterDisplayName = up[0].display_name;
          requesterAvatarUrl = requesterAvatarUrl || up[0].avatar_url;
          requesterJobTitle = requesterJobTitle || up[0].professional_title;
          requesterCompanyName = requesterCompanyName || up[0].company_name;
        }
      }
      if (!requesterDisplayName) {
        const mem = await this.prisma.$queryRaw<any[]>`
          SELECT name FROM public.members WHERE user_id = ${userId}::uuid LIMIT 1
        `.catch(() => []);
        requesterDisplayName = mem[0]?.name || 'Hội viên CEO 1983';
      }

      // Fetch privacy settings and contact info of Account A (requester)
      let requesterPhone: string | null = null;
      let requesterEmail: string | null = null;
      let requesterMemberCode: string | null = null;
      try {
        const memA = await this.prisma.$queryRaw<any[]>`
          SELECT phone, email, code, avatar, contact, name FROM public.members WHERE user_id = ${userId}::uuid LIMIT 1
        `.catch(() => []);
        if (memA[0]) {
          requesterPhone = memA[0].phone || null;
          requesterEmail = memA[0].email || null;
          requesterMemberCode = memA[0].code || null;
          requesterAvatarUrl = requesterAvatarUrl || memA[0].avatar || null;
          requesterDisplayName = requesterDisplayName || memA[0].contact || memA[0].name;
          requesterCompanyName = requesterCompanyName || memA[0].name;
        }
      } catch {}

      // Query Account A's privacy settings
      let aSettings: any = null;
      try {
        const sRows = await this.prisma.$queryRaw<any[]>`
          SELECT show_name, show_company, show_photo, show_email, show_phone, show_address
          FROM public.card_settings WHERE user_id = ${userId}::uuid LIMIT 1
        `.catch(() => []);
        if (sRows[0]) aSettings = sRows[0];
      } catch {}

      const showName = aSettings ? aSettings.show_name !== false : true;
      const showCompany = aSettings ? aSettings.show_company !== false : true;
      const showPhoto = aSettings ? aSettings.show_photo !== false : true;
      const showPhone = aSettings ? aSettings.show_phone !== false : true;
      const showEmail = aSettings ? aSettings.show_email !== false : true;

      const requester = {
        userId,
        memberCode: requesterMemberCode,
        display_name: showName ? requesterDisplayName : 'Hội viên CEO 1983',
        avatar_url: showPhoto ? requesterAvatarUrl : null,
        job_title: showCompany ? requesterJobTitle : 'Hội viên CLB CEO 1983',
        company_name: showCompany ? requesterCompanyName : 'Đã ẩn theo cài đặt riêng tư',
        phone: showPhone ? requesterPhone : 'Đã ẩn theo cài đặt riêng tư',
        email: showEmail ? requesterEmail : 'Đã ẩn theo cài đặt riêng tư',
        connectionId: reqId,
        privacy: {
          showName,
          showCompany,
          showPhoto,
          showPhone,
          showEmail,
        },
      };

      const notifId = crypto.randomUUID();
      const safeData = JSON.stringify({
        counterpartDisplayName: requester.display_name,
        avatarUrl: requester.avatar_url,
        jobTitle: requester.job_title,
        companyName: requester.company_name,
        phone: requester.phone,
        email: requester.email,
        memberCode: requester.memberCode,
        connectionId: reqId,
      });
      const actionTarget = JSON.stringify({
        route: '/connect-app/network',
        search: { tab: 'requests' },
      });
      const dedupeKey = `connection_request:${reqId}:${Date.now()}`;

      await this.prisma.$executeRaw`
        INSERT INTO public.business_notifications (
          id, recipient_user_id, source_domain, source_record_id, event_kind, notification_kind,
          title_key, body_key, safe_display_data, action_kind, action_label_key, action_target,
          priority, status, created_at, updated_at, dedupe_key
        ) VALUES (
          ${notifId}::uuid, ${targetUserId}::uuid, 'connection', ${reqId}, 'connection_request_received', 'connection_request_received',
          'bc.notif.kind.connection_request_received.title', 'bc.notif.kind.connection_request_received.body',
          ${safeData}::jsonb, 'open_route', 'bc.notif.action.viewConnectionRequests', ${actionTarget}::jsonb,
          'high', 'delivered', ${now}, ${now}, ${dedupeKey}
        )
      `.catch((err) => console.warn('Could not insert connection notification:', err));

      // Also persist to member_notifications for the member portal
      try {
        const targetMembers = await this.prisma.$queryRaw<any[]>`
          SELECT id FROM public.members WHERE user_id = ${targetUserId}::uuid LIMIT 1
        `.catch(() => []);
        const memberRecipientId = targetMembers[0]?.id || targetUserId;
        await this.prisma.$executeRaw`
          INSERT INTO public.member_notifications (
            id, recipient_id, title, body, read, dismissed, ref_type, ref_id, created_at
          ) VALUES (
            ${crypto.randomUUID()}::uuid,
            ${String(memberRecipientId)}::text,
            ${requester.display_name ? `${requester.display_name} muốn kết nối với bạn` : 'Lời mời kết nối mới'},
            ${requester.job_title ? `${requester.job_title}${requester.company_name ? ' tại ' + requester.company_name : ''}` : 'Đã gửi cho bạn một yêu cầu kết nối.'},
            false,
            false,
            'connection',
            ${reqId},
            ${now}
          )
        `.catch((err) => console.warn('member_notifications insert failed:', err));

        if (targetMembers[0]?.id && String(targetUserId) !== String(targetMembers[0]?.id)) {
          await this.prisma.$executeRaw`
            INSERT INTO public.member_notifications (
              id, recipient_id, title, body, read, dismissed, ref_type, ref_id, created_at
            ) VALUES (
              ${crypto.randomUUID()}::uuid,
              ${String(targetUserId)}::text,
              ${requester.display_name ? `${requester.display_name} muốn kết nối với bạn` : 'Lời mời kết nối mới'},
              ${requester.job_title ? `${requester.job_title}${requester.company_name ? ' tại ' + requester.company_name : ''}` : 'Đã gửi cho bạn một yêu cầu kết nối.'},
              false,
              false,
              'connection',
              ${reqId},
              ${now}
            )
          `.catch(() => {});
        }
      } catch {}

      const notifPayload = {
        id: notifId,
        recipientUserId: targetUserId,
        sourceDomain: 'connection',
        sourceRecordId: reqId,
        eventKind: 'connection_request_received',
        notificationKind: 'connection_request_received',
        titleKey: 'bc.notif.kind.connection_request_received.title',
        bodyKey: 'bc.notif.kind.connection_request_received.body',
        safeDisplayData: JSON.parse(safeData),
        action: {
          kind: 'open_route',
          labelKey: 'bc.notif.action.viewConnectionRequests',
          targetRoute: '/connect-app/network',
          targetSearch: { tab: 'requests' },
        },
        priority: 'high',
        status: 'delivered',
        createdAt: now.toISOString(),
      };

      this.gateway.emitConnectionRequested(targetUserId, requester, reqId);
      this.gateway.emitNotification(targetUserId, notifPayload);
    } catch (e) {
      console.warn('sendConnectionRequest notification broadcast failed:', e);
    }

    return { ok: true, connectionId: reqId, status: 'pending' };
  }

  async acceptConnection(userId: string, body: any) {
    const now = new Date();
    const connRows = await this.prisma.$queryRaw<any[]>`
      SELECT id, requester_user_id FROM public.user_connections
      WHERE (id = ${body.connectionId}::uuid OR id IN (
        SELECT source_record_id::uuid FROM public.business_notifications WHERE id = ${body.connectionId}::uuid AND source_record_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
        UNION
        SELECT ref_id::uuid FROM public.member_notifications WHERE id = ${body.connectionId}::uuid AND ref_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
      )) AND recipient_user_id = ${userId}::uuid
      LIMIT 1
    `.catch(() => []);
    const actualConnId = connRows[0]?.id || body.connectionId;
    const requesterUserId = connRows[0]?.requester_user_id;

    await this.prisma.$executeRaw`
      UPDATE public.user_connections
      SET status = 'accepted'::public.global_connection_status, responded_at = ${now}, updated_at = ${now}
      WHERE id = ${actualConnId}::uuid AND recipient_user_id = ${userId}::uuid
    `;

    // Cập nhật trạng thái 'accepted' trực tiếp vào thông báo của người nhận
    await this.prisma.$executeRaw`
      UPDATE public.business_notifications
      SET safe_display_data = jsonb_set(
        COALESCE(safe_display_data, '{}'::jsonb),
        '{connectionStatus}',
        '"accepted"'::jsonb
      ),
      read_at = COALESCE(read_at, ${now}),
      updated_at = ${now}
      WHERE (source_record_id = ${actualConnId}::text OR id = ${body.connectionId}::uuid OR (safe_display_data->>'connectionId') = ${actualConnId}::text)
        AND recipient_user_id = ${userId}::uuid
    `.catch(() => {});

    await this.prisma.$executeRaw`
      UPDATE public.member_notifications
      SET read = true
      WHERE (ref_id = ${actualConnId}::text OR id = ${body.connectionId}::uuid)
    `.catch(() => {});

    // Phát sự kiện realtime cho người nhận (để UI đổi ngay thành Đã kết nối)
    this.gateway.server?.to(`user:${userId}`).emit('notification:updated', {
      connectionId: actualConnId,
      connectionStatus: 'accepted',
      timestamp: now.toISOString(),
    });

    if (requesterUserId) {
      try {
        const accepterProfiles = await this.prisma.$queryRaw<any[]>`
          SELECT display_name, avatar_url, job_title, company_name
          FROM public.business_identities
          WHERE owner_user_id = ${userId}::uuid AND status = 'active'
          LIMIT 1
        `.catch(() => [] as any[]);
        const accepter = accepterProfiles[0] || { display_name: 'Hội viên CEO 1983' };
        const notifId = crypto.randomUUID();
        const safeData = JSON.stringify({
          counterpartDisplayName: accepter.display_name || 'Hội viên CEO 1983',
          avatarUrl: accepter.avatar_url || null,
          connectionId: actualConnId,
          connectionStatus: 'accepted',
        });
        const actionTarget = JSON.stringify({
          route: '/connect-app/network',
          search: { tab: 'connections' },
        });
        const dedupeKey = `connection_accepted:${actualConnId}`;

        await this.prisma.$executeRaw`
          INSERT INTO public.business_notifications (
            id, recipient_user_id, source_domain, source_record_id, event_kind, notification_kind,
            title_key, body_key, safe_display_data, action_kind, action_label_key, action_target,
            priority, status, created_at, updated_at, dedupe_key
          ) VALUES (
            ${notifId}::uuid, ${requesterUserId}::uuid, 'connection', ${actualConnId}, 'connection_request_accepted', 'connection_request_accepted',
            'bc.notif.kind.connection_request_accepted.title', 'bc.notif.kind.connection_request_accepted.body',
            ${safeData}::jsonb, 'open_route', 'bc.notif.action.view', ${actionTarget}::jsonb,
            'normal', 'delivered', ${now}, ${now}, ${dedupeKey}
          )
        `.catch(() => {});

        // Đẩy thêm vào member_notifications cho người gửi lời mời
        try {
          const requesterMembers = await this.prisma.$queryRaw<any[]>`
            SELECT id FROM public.members WHERE user_id = ${requesterUserId}::uuid LIMIT 1
          `.catch(() => []);
          const requesterMemberId = requesterMembers[0]?.id || requesterUserId;
          await this.prisma.$executeRaw`
            INSERT INTO public.member_notifications (
              id, recipient_id, title, body, read, dismissed, ref_type, ref_id, created_at
            ) VALUES (
              ${crypto.randomUUID()}::uuid,
              ${String(requesterMemberId)}::text,
              ${`${accepter.display_name || 'Hội viên'} đã đồng ý lời mời kết nối`},
              ${`Bạn và ${accepter.display_name || 'Hội viên'} đã trở thành bạn bè. Hãy trao đổi và kết nối cơ hội kinh doanh!`},
              false,
              false,
              'connection',
              ${actualConnId}::text,
              ${now}
            )
          `.catch(() => {});
        } catch {}

        const notifPayload = {
          id: notifId,
          recipientUserId: requesterUserId,
          sourceDomain: 'connection',
          sourceRecordId: actualConnId,
          eventKind: 'connection_request_accepted',
          notificationKind: 'connection_request_accepted',
          titleKey: 'bc.notif.kind.connection_request_accepted.title',
          bodyKey: 'bc.notif.kind.connection_request_accepted.body',
          safeDisplayData: JSON.parse(safeData),
          action: {
            kind: 'open_route',
            labelKey: 'bc.notif.action.view',
            targetRoute: '/connect-app/network',
            targetSearch: { tab: 'connections' },
          },
          priority: 'normal',
          status: 'delivered',
          createdAt: now.toISOString(),
        };

        this.gateway.emitConnectionAccepted(requesterUserId, accepter, actualConnId);
        this.gateway.emitNotification(requesterUserId, notifPayload);
      } catch (e) {
        console.warn('acceptConnection notification failed:', e);
      }
    }
    return { ok: true, connectionStatus: 'accepted' };
  }

  async declineConnection(userId: string, body: any) {
    const now = new Date();
    const connRows = await this.prisma.$queryRaw<any[]>`
      SELECT id, requester_user_id FROM public.user_connections
      WHERE (id = ${body.connectionId}::uuid OR id IN (
        SELECT source_record_id::uuid FROM public.business_notifications WHERE id = ${body.connectionId}::uuid AND source_record_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
        UNION
        SELECT ref_id::uuid FROM public.member_notifications WHERE id = ${body.connectionId}::uuid AND ref_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
      )) AND recipient_user_id = ${userId}::uuid
      LIMIT 1
    `.catch(() => []);
    const actualConnId = connRows[0]?.id || body.connectionId;
    const requesterUserId = connRows[0]?.requester_user_id;

    await this.prisma.$executeRaw`
      UPDATE public.user_connections
      SET status = 'declined'::public.global_connection_status, responded_at = ${now}, updated_at = ${now}
      WHERE id = ${actualConnId}::uuid AND recipient_user_id = ${userId}::uuid
    `;

    // Cập nhật trạng thái 'declined' trực tiếp vào thông báo của người nhận
    await this.prisma.$executeRaw`
      UPDATE public.business_notifications
      SET safe_display_data = jsonb_set(
        COALESCE(safe_display_data, '{}'::jsonb),
        '{connectionStatus}',
        '"declined"'::jsonb
      ),
      read_at = COALESCE(read_at, ${now}),
      updated_at = ${now}
      WHERE (source_record_id = ${actualConnId}::text OR id = ${body.connectionId}::uuid OR (safe_display_data->>'connectionId') = ${actualConnId}::text)
        AND recipient_user_id = ${userId}::uuid
    `.catch(() => {});

    await this.prisma.$executeRaw`
      UPDATE public.member_notifications
      SET read = true
      WHERE (ref_id = ${actualConnId}::text OR id = ${body.connectionId}::uuid)
    `.catch(() => {});

    // Phát sự kiện realtime cho người nhận
    this.gateway.server?.to(`user:${userId}`).emit('notification:updated', {
      connectionId: actualConnId,
      connectionStatus: 'declined',
      timestamp: now.toISOString(),
    });

    if (requesterUserId) {
      try {
        const declinerProfiles = await this.prisma.$queryRaw<any[]>`
          SELECT bi.display_name, bi.avatar_url, bi.company_name, bi.job_title, u.full_name
          FROM public.vione_users u
          LEFT JOIN public.business_identities bi ON bi.owner_user_id = u.id AND bi.status = 'active'
          WHERE u.id = ${userId}::uuid
          LIMIT 1
        `.catch(() => [] as any[]);
        const declinerUser = declinerProfiles[0];
        const declinerName = declinerUser?.display_name || declinerUser?.full_name || declinerUser?.company_name || 'Hội viên CEO 1983';

        const notifId = crypto.randomUUID();
        const safeData = JSON.stringify({
          counterpartDisplayName: declinerName,
          avatarUrl: declinerUser?.avatar_url || null,
          connectionId: actualConnId,
          connectionStatus: 'declined',
        });
        const dedupeKey = `connection_declined:${actualConnId}`;

        await this.prisma.$executeRaw`
          INSERT INTO public.business_notifications (
            id, recipient_user_id, source_domain, source_record_id, event_kind, notification_kind,
            title_key, body_key, safe_display_data, action_kind, action_label_key,
            priority, status, created_at, updated_at, dedupe_key
          ) VALUES (
            ${notifId}::uuid, ${requesterUserId}::uuid, 'connection', ${actualConnId}, 'connection_request_declined', 'connection_request_declined',
            'bc.notif.kind.connection_request_declined.title', 'bc.notif.kind.connection_request_declined.body',
            ${safeData}::jsonb, 'none', 'bc.notif.action.dismiss',
            'low', 'delivered', ${now}, ${now}, ${dedupeKey}
          )
        `.catch(() => {});

        // Đẩy thêm vào member_notifications cho người gửi lời mời
        try {
          const requesterMembers = await this.prisma.$queryRaw<any[]>`
            SELECT id FROM public.members WHERE user_id = ${requesterUserId}::uuid LIMIT 1
          `.catch(() => []);
          const requesterMemberId = requesterMembers[0]?.id || requesterUserId;
          await this.prisma.$executeRaw`
            INSERT INTO public.member_notifications (
              id, recipient_id, title, body, read, dismissed, ref_type, ref_id, created_at
            ) VALUES (
              ${crypto.randomUUID()}::uuid,
              ${String(requesterMemberId)}::text,
              ${`${declinerName} đã từ chối lời mời kết nối`},
              ${`${declinerName} chưa thể nhận lời mời kết nối của bạn vào lúc này.`},
              false,
              false,
              'connection',
              ${actualConnId}::text,
              ${now}
            )
          `.catch(() => {});
        } catch {}

        this.gateway.emitConnectionDeclined(
          requesterUserId,
          {
            display_name: declinerName,
            avatar_url: declinerUser?.avatar_url || null,
          },
          actualConnId,
        );
      } catch (e) {
        console.warn('declineConnection broadcast failed:', e);
      }
    }

    return { ok: true, connectionStatus: 'declined' };
  }

  async cancelConnection(userId: string, body: any) {
    const connRows = await this.prisma.$queryRaw<any[]>`
      SELECT recipient_user_id FROM public.user_connections
      WHERE id = ${body.connectionId}::uuid AND requester_user_id = ${userId}::uuid
      LIMIT 1
    `.catch(() => []);
    const recipientUserId = connRows[0]?.recipient_user_id;

    await this.prisma.$executeRaw`
      DELETE FROM public.user_connections
      WHERE id = ${body.connectionId}::uuid AND requester_user_id = ${userId}::uuid
    `;

    // Mark notification as cancelled in public.business_notifications
    const now = new Date();
    await this.prisma.$executeRaw`
      UPDATE public.business_notifications
      SET status = 'cancelled', updated_at = ${now}
      WHERE source_record_id = ${body.connectionId}
    `.catch(() => {});

    if (recipientUserId) {
      try {
        this.gateway.server?.to(`user:${recipientUserId}`).emit('connection:cancelled', {
          connectionId: body.connectionId,
          timestamp: now.toISOString(),
        });
      } catch (e) {
        console.warn('cancelConnection broadcast failed:', e);
      }
    }

    return { ok: true };
  }

  async disconnectConnection(userId: string, body: any) {
    const connId = body.connectionId;
    const targetUserId = body.targetUserId || body.target_user_id || body.targetPersonNodeId;
    let resolvedTargetId = targetUserId;
    if (resolvedTargetId && String(resolvedTargetId).startsWith('u:')) {
      resolvedTargetId = String(resolvedTargetId).substring(2);
    }
    if (connId) {
      await this.prisma.$executeRaw`
        DELETE FROM public.user_connections
        WHERE id = ${connId}::uuid AND (requester_user_id = ${userId}::uuid OR recipient_user_id = ${userId}::uuid)
      `;
    } else if (resolvedTargetId) {
      await this.prisma.$executeRaw`
        DELETE FROM public.user_connections
        WHERE (requester_user_id = ${userId}::uuid AND recipient_user_id = ${resolvedTargetId}::uuid)
           OR (requester_user_id = ${resolvedTargetId}::uuid AND recipient_user_id = ${userId}::uuid)
      `;
    }
    return { ok: true };
  }

  async blockUser(userId: string, body: any) {
    return { ok: true };
  }

  async getConnectionState(userId: string, targetUserId: string) {
    if (userId === targetUserId) {
      return {
        targetUserId,
        status: 'none',
        direction: 'self',
        connectionId: null,
        blocked: false,
      };
    }

    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT id, requester_user_id, recipient_user_id, status FROM public.user_connections
      WHERE (requester_user_id = ${userId}::uuid AND recipient_user_id = ${targetUserId}::uuid)
         OR (requester_user_id = ${targetUserId}::uuid AND recipient_user_id = ${userId}::uuid)
      LIMIT 1
    `.catch(() => []);

    if (rows.length === 0) {
      return {
        targetUserId,
        status: 'none',
        direction: 'none',
        connectionId: null,
        blocked: false,
      };
    }

    const r = rows[0];
    const direction = r.requester_user_id === userId ? 'outgoing' : 'incoming';

    return {
      targetUserId,
      status: r.status,
      direction,
      connectionId: r.id,
      blocked: r.status === 'blocked',
    };
  }

  async getConnectionStateByToken(userId: string, token: string) {
    const links = await this.prisma.$queryRaw<any[]>`
      SELECT id, identity_id, status FROM public.identity_share_links
      WHERE public_token = ${token} AND status = 'active'
      LIMIT 1
    `.catch(() => []);

    if (links.length === 0) {
      return { state: 'unavailable', connectionId: null };
    }
    const link = links[0];

    const identities = await this.prisma.$queryRaw<any[]>`
      SELECT owner_user_id FROM public.business_identities
      WHERE id = ${link.identity_id}::uuid AND status = 'active'
      LIMIT 1
    `.catch(() => []);

    if (identities.length === 0) {
      return { state: 'unavailable', connectionId: null };
    }
    const targetUserId = identities[0].owner_user_id;
    if (targetUserId === userId) {
      return { state: 'self', connectionId: null };
    }

    const pairState = await this.getConnectionState(userId, targetUserId);

    let state = 'unavailable';
    if (pairState.status === 'none') {
      state = 'none';
    } else if (pairState.status === 'accepted') {
      state = 'connected';
    } else if (pairState.status === 'pending') {
      state = pairState.direction === 'outgoing' ? 'outgoing_pending' : 'incoming_pending';
    }

    return {
      state,
      connectionId: pairState.connectionId,
    };
  }

  async sendConnectionRequestByToken(userId: string, token: string, mutationKey?: string) {
    const links = await this.prisma.$queryRaw<any[]>`
      SELECT id, identity_id, status FROM public.identity_share_links
      WHERE public_token = ${token} AND status = 'active'
      LIMIT 1
    `.catch(() => []);

    if (links.length === 0) {
      throw new NotFoundException('Identity not found or unavailable');
    }
    const link = links[0];

    const identities = await this.prisma.$queryRaw<any[]>`
      SELECT owner_user_id FROM public.business_identities
      WHERE id = ${link.identity_id}::uuid AND status = 'active'
      LIMIT 1
    `.catch(() => []);

    if (identities.length === 0) {
      throw new NotFoundException('Identity not found or unavailable');
    }
    const targetUserId = identities[0].owner_user_id;
    if (targetUserId === userId) {
      throw new Error('Self connection not allowed');
    }

    return this.sendConnectionRequest(userId, { targetUserId });
  }

  /**
   * NFC / QR Code Tap-to-Exchange — Unified Resolution & Connection Engine
   * - Hỗ trợ các action:
   *   + 'resolve': Tra cứu thông tin đối phương (preview Zalo-style), kèm trạng thái quan hệ
   *   + 'connect' (hoặc mặc định): Gửi yêu cầu kết nối, lưu thông báo & phát WebSocket realtime
   * - Phân giải đa nguồn token:
   *   + identity_share_links (public_token)
   *   + business_cards (slug hoặc id)
   *   + members (code hoặc id)
   *   + business_identities (id hoặc owner_user_id)
   *   + profiles (id hoặc email)
   */
  async nfcTap(userId: string, payload: string | { token: string; action?: 'resolve' | 'connect'; message?: string }) {
    const tokenRaw = typeof payload === 'string' ? payload : (payload?.token || (payload as any)?.value || '');
    const action = (typeof payload === 'object' && payload?.action) ? payload.action : 'connect';
    const message = (typeof payload === 'object' && payload?.message) ? payload.message : undefined;

    if (!tokenRaw || typeof tokenRaw !== 'string' || tokenRaw.trim().length === 0) {
      return { ok: false, reason: 'invalid_token', profile: null, connectionId: null, state: 'unavailable' };
    }

    const cleanToken = tokenRaw.trim();

    // 1. Phân giải targetUserId và metadata từ token
    let targetUserId: string | null = null;
    let shareLinkId: string | null = null;
    let foundIdentity: any = null;
    let foundCard: any = null;
    let foundMember: any = null;
    let foundProfile: any = null;

    // 1a. Kiểm tra identity_share_links
    try {
      const links = await this.prisma.$queryRaw<any[]>`
        SELECT id, identity_id FROM public.identity_share_links
        WHERE public_token = ${cleanToken} AND status = 'active'
        LIMIT 1
      `;
      if (links.length > 0) {
        shareLinkId = links[0].id;
        const identities = await this.prisma.$queryRaw<any[]>`
          SELECT * FROM public.business_identities
          WHERE id = ${links[0].identity_id}::uuid AND status = 'active'
          LIMIT 1
        `;
        if (identities.length > 0) {
          foundIdentity = identities[0];
          targetUserId = foundIdentity.owner_user_id;
        }
      }
    } catch {}

    // 1b. Nếu chưa tìm thấy, kiểm tra business_cards (theo slug hoặc id)
    if (!targetUserId) {
      try {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanToken);
        const cards = isUuid
          ? await this.prisma.$queryRaw<any[]>`
              SELECT * FROM public.business_cards
              WHERE id = ${cleanToken}::uuid OR slug = ${cleanToken}
              LIMIT 1
            `
          : await this.prisma.$queryRaw<any[]>`
              SELECT * FROM public.business_cards
              WHERE slug = ${cleanToken}
              LIMIT 1
            `;
        if (cards.length > 0) {
          foundCard = cards[0];
          targetUserId = foundCard.user_id;
        }
      } catch {}
    }

    // 1b1. Kiểm tra JWT token (ey...) nếu là Signed QR của Membership Pass
    if (!targetUserId && cleanToken.startsWith('ey') && cleanToken.includes('.')) {
      try {
        const parts = cleanToken.split('.');
        if (parts[1]) {
          const payloadJson = Buffer.from(parts[1], 'base64url').toString('utf8');
          const decoded = JSON.parse(payloadJson);
          const passId = decoded.passId || decoded.pass_id || decoded.id;
          const memberId = decoded.memberId || decoded.member_id;
          const subId = decoded.userId || decoded.user_id || decoded.sub;

          if (passId) {
            const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(passId));
            if (isUuid) {
              const passes = await this.prisma.$queryRaw<any[]>`
                SELECT * FROM public.member_identity_passes
                WHERE id = ${String(passId)}::uuid
                LIMIT 1
              `;
              if (passes.length > 0) {
                const pass = passes[0];
                const members = await this.prisma.$queryRaw<any[]>`
                  SELECT * FROM public.members
                  WHERE id = ${pass.member_id}::uuid
                  LIMIT 1
                `;
                if (members.length > 0) {
                  foundMember = members[0];
                  targetUserId = foundMember.user_id || foundMember.id;
                }
              }
            }
          }

          if (!targetUserId && memberId) {
            const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(memberId));
            const members = isUuid
              ? await this.prisma.$queryRaw<any[]>`
                  SELECT * FROM public.members
                  WHERE id = ${String(memberId)}::uuid OR code = ${String(memberId)}
                  LIMIT 1
                `
              : await this.prisma.$queryRaw<any[]>`
                  SELECT * FROM public.members
                  WHERE code = ${String(memberId)}
                  LIMIT 1
                `;
            if (members.length > 0) {
              foundMember = members[0];
              targetUserId = foundMember.user_id || foundMember.id;
            }
          }

          if (!targetUserId && subId) {
            const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(subId));
            if (isUuid) {
              targetUserId = String(subId);
            }
          }
        }
      } catch {}
    }

    // 1b2. Kiểm tra member_identity_passes (theo pass_serial hoặc id)
    if (!targetUserId) {
      try {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanToken);
        const passes = isUuid
          ? await this.prisma.$queryRaw<any[]>`
              SELECT * FROM public.member_identity_passes
              WHERE id = ${cleanToken}::uuid OR pass_serial = ${cleanToken}
              LIMIT 1
            `
          : await this.prisma.$queryRaw<any[]>`
              SELECT * FROM public.member_identity_passes
              WHERE pass_serial = ${cleanToken}
              LIMIT 1
            `;
        if (passes.length > 0) {
          const pass = passes[0];
          const members = await this.prisma.$queryRaw<any[]>`
            SELECT * FROM public.members
            WHERE id = ${pass.member_id}::uuid
            LIMIT 1
          `;
          if (members.length > 0) {
            foundMember = members[0];
            targetUserId = foundMember.user_id || foundMember.id;
          }
        }
      } catch {}
    }

    // 1c. Nếu chưa tìm thấy, kiểm tra members (theo code hoặc id)
    if (!targetUserId) {
      try {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanToken);
        const members = isUuid
          ? await this.prisma.$queryRaw<any[]>`
              SELECT * FROM public.members
              WHERE id = ${cleanToken}::uuid OR code = ${cleanToken}
              LIMIT 1
            `
          : await this.prisma.$queryRaw<any[]>`
              SELECT * FROM public.members
              WHERE code = ${cleanToken}
              LIMIT 1
            `;
        if (members.length > 0) {
          foundMember = members[0];
          targetUserId = foundMember.user_id || foundMember.id;
        }
      } catch {}
    }

    // 1d. Nếu chưa tìm thấy, kiểm tra business_identities (theo id hoặc owner_user_id)
    if (!targetUserId) {
      try {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanToken);
        if (isUuid) {
          const identities = await this.prisma.$queryRaw<any[]>`
            SELECT * FROM public.business_identities
            WHERE id = ${cleanToken}::uuid OR owner_user_id = ${cleanToken}::uuid
            LIMIT 1
          `;
          if (identities.length > 0) {
            foundIdentity = identities[0];
            targetUserId = foundIdentity.owner_user_id;
          }
        }
      } catch {}
    }

    // 1e. Nếu chưa tìm thấy, kiểm tra profiles (theo id)
    if (!targetUserId) {
      try {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanToken);
        if (isUuid) {
          const profiles = await this.prisma.$queryRaw<any[]>`
            SELECT * FROM public.profiles
            WHERE id = ${cleanToken}::uuid
            LIMIT 1
          `;
          if (profiles.length > 0) {
            foundProfile = profiles[0];
            targetUserId = foundProfile.id;
          }
        }
      } catch {}
    }

    // 1f. Check public.vione_users by username or email
    if (!targetUserId) {
      try {
        const u = await this.prisma.$queryRaw<any[]>`
          SELECT id FROM public.vione_users
          WHERE username = ${cleanToken} OR email = ${cleanToken} OR id::text = ${cleanToken}
          LIMIT 1
        `;
        if (u.length > 0) {
          targetUserId = u[0].id;
        }
      } catch {}
    }

    // 1g. Check public.members by phone or name
    if (!targetUserId) {
      try {
        const m = await this.prisma.$queryRaw<any[]>`
          SELECT id, user_id FROM public.members
          WHERE phone = ${cleanToken} OR email = ${cleanToken} OR id = ${cleanToken}
          LIMIT 1
        `;
        if (m.length > 0) {
          targetUserId = m[0].user_id || m[0].id;
          foundMember = m[0];
        }
      } catch {}
    }

    // Không tìm thấy user hợp lệ
    if (!targetUserId) {
      return { ok: false, reason: 'not_found', profile: null, connectionId: null, state: 'unavailable' };
    }

    // Tự quét mã của chính mình
    if (targetUserId === userId) {
      return { ok: false, reason: 'self', profile: null, connectionId: null, state: 'self' };
    }

    // 2. Fetch bổ sung đầy đủ thông tin profile đối phương (đảm bảo hiển thị đầy đủ avatar, tên, công ty, chức vụ)
    if (!foundCard) {
      try {
        const c = await this.prisma.$queryRaw<any[]>`
          SELECT * FROM public.business_cards
          WHERE user_id = ${targetUserId}::uuid AND status = 'published'
          ORDER BY is_primary DESC, updated_at DESC LIMIT 1
        `;
        if (c.length > 0) foundCard = c[0];
      } catch {}
    }
    if (!foundIdentity) {
      try {
        const ids = await this.prisma.$queryRaw<any[]>`
          SELECT * FROM public.business_identities
          WHERE owner_user_id = ${targetUserId}::uuid AND status = 'active'
          LIMIT 1
        `;
        if (ids.length > 0) foundIdentity = ids[0];
      } catch {}
    }
    if (!foundMember) {
      try {
        const m = await this.prisma.$queryRaw<any[]>`
          SELECT * FROM public.members
          WHERE user_id = ${targetUserId}::uuid AND status = 'active'
          LIMIT 1
        `;
        if (m.length > 0) foundMember = m[0];
      } catch {}
    }
    if (!foundProfile) {
      try {
        const p = await this.prisma.$queryRaw<any[]>`
          SELECT * FROM public.profiles
          WHERE id = ${targetUserId}::uuid
          LIMIT 1
        `;
        if (p.length > 0) foundProfile = p[0];
      } catch {}
    }

    // 2. Tra cứu quan hệ connection hiện tại giữa 2 user
    const existing = await this.prisma.$queryRaw<any[]>`
      SELECT id, requester_user_id, recipient_user_id, status FROM public.user_connections
      WHERE (requester_user_id = ${userId}::uuid AND recipient_user_id = ${targetUserId}::uuid)
         OR (requester_user_id = ${targetUserId}::uuid AND recipient_user_id = ${userId}::uuid)
      LIMIT 1
    `.catch(() => []);

    let state = 'none';
    let connId: string | null = null;
    if (existing.length > 0) {
      const conn = existing[0];
      connId = conn.id;
      const direction = conn.requester_user_id === userId ? 'outgoing' : 'incoming';
      if (conn.status === 'accepted') {
        state = 'connected';
      } else if (conn.status === 'pending') {
        state = direction === 'outgoing' ? 'outgoing_pending' : 'incoming_pending';
      } else {
        state = 'none';
      }
    }

    // 3. Kiểm tra Field Visibility nếu có Identity
    let vis: Record<string, string> = {};
    if (foundIdentity) {
      try {
        const visibilityRows = await this.prisma.$queryRaw<any[]>`
          SELECT field_key, visibility FROM public.identity_field_visibility
          WHERE identity_id = ${foundIdentity.id}::uuid
        `;
        for (const r of visibilityRows) vis[r.field_key] = r.visibility;
      } catch {}
    }
    const isConnected = state === 'connected' || targetUserId === userId;
    const show = (key: string) => {
      const v = vis[key];
      if (!v || v === 'public') return true;
      if (v === 'connections') return isConnected;
      return false; // 'private' or 'hidden'
    };

    const displayName = (foundIdentity?.display_name ? foundIdentity.display_name : null)
      || foundCard?.display_name
      || foundMember?.name
      || foundMember?.full_name
      || foundProfile?.display_name
      || 'Hội viên CEO 1983';

    const avatarUrl = foundIdentity?.avatar_url
      || foundCard?.avatar_url
      || foundMember?.avatar_url
      || foundMember?.avatar
      || foundProfile?.avatar_url
      || null;

    const headline = (show('headline') ? foundIdentity?.headline : null)
      || foundCard?.headline
      || foundCard?.professional_title
      || foundMember?.job_title
      || foundMember?.position
      || foundProfile?.headline
      || null;

    const jobTitle = (show('jobTitle') ? foundIdentity?.job_title : null)
      || foundCard?.professional_title
      || foundMember?.job_title
      || foundMember?.position
      || null;

    const companyName = (show('companyName') ? foundIdentity?.company_name : null)
      || foundCard?.company_name
      || foundMember?.company_name
      || foundMember?.company
      || foundProfile?.company_name
      || null;

    const primaryEmail = (show('primaryEmail') ? foundIdentity?.primary_email : null)
      || (show('primaryEmail') ? foundCard?.email || foundMember?.email || foundProfile?.email : null)
      || null;

    const primaryPhone = (show('primaryPhone') ? foundIdentity?.primary_phone : null)
      || (show('primaryPhone') ? foundCard?.phone || foundMember?.phone || foundMember?.contact || foundProfile?.phone : null)
      || null;

    const website = (show('website') ? foundIdentity?.website : null)
      || (show('website') ? foundCard?.website : null)
      || null;

    const linkedinUrl = (show('linkedinUrl') ? foundIdentity?.linkedin_url : null)
      || (show('linkedinUrl') ? foundCard?.linkedin_url : null)
      || null;

    const city = (show('city') ? foundIdentity?.city : null)
      || foundCard?.address
      || foundMember?.address
      || null;

    const bio = (show('bio') ? (foundCard?.bio || foundIdentity?.bio || foundMember?.bio) : null) || null;

    const profile = {
      targetUserId,
      displayName,
      avatarUrl,
      headline,
      jobTitle,
      companyName,
      primaryEmail,
      primaryPhone,
      website,
      linkedinUrl,
      city,
      bio,
      primaryCardSlug: foundCard?.slug || null,
      executiveRole: foundMember?.executive_role || (foundMember?.id ? 'member' : null),
      department: foundMember?.department || 'CLB Doanh Nhân CEO 1983',
      association: 'CLB Doanh Nhân CEO 1983 - HanoiBA',
      skills: ['Quản trị doanh nghiệp', 'Xúc tiến thương mại', 'Kết nối B2B', 'Chiến lược dòng tiền'],
      talents: foundMember?.executive_role ? `Lãnh đạo ${foundMember?.department || 'Ban'} CLB CEO 1983` : 'Doanh nhân hội viên chính thức',
      verifiedBadge: true,
    };

    // 4. Nếu action là 'resolve' (Zalo preview mode), chỉ trả về thông tin profile và trạng thái
    if (action === 'resolve') {
      return {
        ok: true,
        reason: 'resolved',
        profile,
        connectionId: connId,
        state,
      };
    }

    // 5. Nếu action là 'connect': Thực hiện tạo hoặc cập nhật kết nối + Gửi thông báo
    const now = new Date();
    let reqId = connId || crypto.randomUUID();

    if (existing.length > 0) {
      const conn = existing[0];
      if (conn.status === 'accepted') {
        return { ok: true, reason: 'already_connected', profile, connectionId: conn.id, state: 'connected' };
      }

      // If incoming pending: target user already requested connection -> auto accept
      if (conn.status === 'pending' && conn.recipient_user_id === userId) {
        await this.acceptConnection(userId, { connectionId: conn.id });
        return { ok: true, reason: 'connected', profile, connectionId: conn.id, state: 'connected' };
      }

      // If outgoing pending: already sent and awaiting response
      if (conn.status === 'pending' && conn.requester_user_id === userId) {
        return { ok: true, reason: 'pending_sent', profile, connectionId: conn.id, state: 'outgoing_pending' };
      }

      // Terminated connection: delete stale row to prevent PostgreSQL trigger violations
      await this.prisma.$executeRaw`
        DELETE FROM public.user_connections WHERE id = ${conn.id}::uuid
      `.catch(() => {});

      reqId = crypto.randomUUID();
      try {
        await this.prisma.$executeRaw`
          INSERT INTO public.user_connections (id, requester_user_id, recipient_user_id, status, source_type, requested_at, created_at, updated_at)
          VALUES (${reqId}::uuid, ${userId}::uuid, ${targetUserId}::uuid, 'pending'::public.global_connection_status, 'nfc'::public.global_connection_source_type, ${now}, ${now}, ${now})
        `;
      } catch {
        await this.prisma.$executeRaw`
          INSERT INTO public.user_connections (id, requester_user_id, recipient_user_id, status, source_type, requested_at, created_at, updated_at)
          VALUES (${reqId}::uuid, ${userId}::uuid, ${targetUserId}::uuid, 'pending'::public.global_connection_status, 'manual'::public.global_connection_source_type, ${now}, ${now}, ${now})
        `;
      }
    } else {
      try {
        await this.prisma.$executeRaw`
          INSERT INTO public.user_connections (id, requester_user_id, recipient_user_id, status, source_type, requested_at, created_at, updated_at)
          VALUES (${reqId}::uuid, ${userId}::uuid, ${targetUserId}::uuid, 'pending'::public.global_connection_status, 'nfc'::public.global_connection_source_type, ${now}, ${now}, ${now})
        `;
      } catch {
        await this.prisma.$executeRaw`
          INSERT INTO public.user_connections (id, requester_user_id, recipient_user_id, status, source_type, requested_at, created_at, updated_at)
          VALUES (${reqId}::uuid, ${userId}::uuid, ${targetUserId}::uuid, 'pending'::public.global_connection_status, 'manual'::public.global_connection_source_type, ${now}, ${now}, ${now})
        `;
      }
    }

    // Cập nhật last_used_at của share link nếu có
    if (shareLinkId) {
      this.prisma.$executeRaw`
        UPDATE public.identity_share_links SET last_used_at = ${now} WHERE id = ${shareLinkId}::uuid
      `.catch(() => {});
    }

    // Lấy thông tin người gửi để đưa vào thông báo
    const requesterSummaries = await this.resolvePublicCounterparts([userId]);
    const requester = requesterSummaries[0] || {
      userId,
      displayName: 'Hội viên CEO 1983',
      avatarUrl: null,
      headline: null,
      companyName: null,
    };

    // 6. Lưu thông báo vào Business Notifications
    const notifId = crypto.randomUUID();
    const safeDataObj = {
      counterpartDisplayName: requester.displayName || 'Hội viên CEO 1983',
      avatarUrl: requester.avatarUrl || null,
      jobTitle: requester.headline || null,
      companyName: requester.companyName || null,
      connectionId: reqId,
      source: 'nfc',
      message: message || '',
    };
    const safeData = JSON.stringify(safeDataObj);
    const actionTarget = JSON.stringify({
      route: '/connect-app/network',
      search: { tab: 'requests' },
    });
    const dedupeKey = `connection_request:${reqId}:${Date.now()}`;

    await this.prisma.$executeRaw`
      INSERT INTO public.business_notifications (
        id, recipient_user_id, source_domain, source_record_id, event_kind, notification_kind,
        title_key, body_key, safe_display_data, action_kind, action_label_key, action_target,
        priority, status, created_at, updated_at, dedupe_key
      ) VALUES (
        ${notifId}::uuid, ${targetUserId}::uuid, 'connection', ${reqId}, 'connection_request_received', 'connection_request_received',
        'bc.notif.kind.connection_request_received.title', 'bc.notif.kind.connection_request_received.body',
        ${safeData}::jsonb, 'open_route', 'bc.notif.action.viewConnectionRequests', ${actionTarget}::jsonb,
        'high', 'delivered', ${now}, ${now}, ${dedupeKey}
      )
    `.catch((err) => console.warn('Could not insert business notification for tap:', err));

    // 7. Lưu thông báo vào Member Notifications (để trang Thông báo Hội viên cũng thấy)
    try {
      const targetMembers = await this.prisma.$queryRaw<any[]>`
        SELECT id FROM public.members WHERE user_id = ${targetUserId}::uuid LIMIT 1
      `.catch(() => []);
      const memberRecipientId = targetMembers[0]?.id || targetUserId;
      const notifTitle = `${requester.displayName || 'Một hội viên'} muốn kết nối với bạn`;
      const notifBody = message ? `${message}` : (requester.headline ? `${requester.headline}${requester.companyName ? ' tại ' + requester.companyName : ''}` : 'Đã gửi cho bạn một yêu cầu kết nối danh thiếp.');

      await this.prisma.$executeRaw`
        INSERT INTO public.member_notifications (
          id, recipient_id, title, body, read, dismissed, ref_type, ref_id, created_at
        ) VALUES (
          ${crypto.randomUUID()}::uuid,
          ${memberRecipientId}::uuid,
          ${notifTitle},
          ${notifBody},
          false,
          false,
          'connection',
          ${reqId},
          ${now}
        )
      `.catch(() => {});
    } catch {}

    // 8. PHÁT WEBSOCKET EVENTS TỨC THÌ ĐẾN targetUserId
    try {
      const notifPayload = {
        id: notifId,
        recipientUserId: targetUserId,
        sourceDomain: 'connection',
        sourceRecordId: reqId,
        eventKind: 'connection_request_received',
        notificationKind: 'connection_request_received',
        titleKey: 'bc.notif.kind.connection_request_received.title',
        bodyKey: 'bc.notif.kind.connection_request_received.body',
        safeDisplayData: safeDataObj,
        action: {
          kind: 'open_route',
          labelKey: 'bc.notif.action.viewConnectionRequests',
          targetRoute: '/connect-app/network',
          targetSearch: { tab: 'requests' },
        },
        priority: 'high',
        status: 'delivered',
        createdAt: now.toISOString(),
      };

      const socketRequesterProfile = {
        userId,
        displayName: requester.displayName,
        avatarUrl: requester.avatarUrl,
        jobTitle: requester.headline,
        companyName: requester.companyName,
        message: message || undefined,
      };

      this.gateway.emitNfcTapped(targetUserId, socketRequesterProfile, reqId);
      this.gateway.emitConnectionRequested(targetUserId, socketRequesterProfile, reqId);
      this.gateway.emitNotification(targetUserId, notifPayload);
    } catch (e) {
      console.warn('Tap connection WebSocket broadcast failed:', e);
    }

    return {
      ok: true,
      reason: existing.length > 0 ? 'reconnected' : 'created',
      profile,
      connectionId: reqId,
      state: 'outgoing_pending',
    };
  }


  async getConnectionById(userId: string, connectionId: string) {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT id, requester_user_id, recipient_user_id as target_user_id, status, created_at FROM public.user_connections
      WHERE id = ${connectionId}::uuid AND (requester_user_id = ${userId}::uuid OR recipient_user_id = ${userId}::uuid)
      LIMIT 1
    `.catch(() => []);
    if (rows.length === 0) throw new NotFoundException('Connection not found');
    const r = rows[0];
    const counterpartUserId = r.requester_user_id === userId ? r.target_user_id : r.requester_user_id;
    return {
      id: r.id,
      counterpartUserId,
      status: r.status,
      createdAt: r.created_at,
    };
  }

  async listIncomingRequests(userId: string) {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT id, requester_user_id, recipient_user_id as target_user_id, status, created_at
      FROM public.user_connections
      WHERE recipient_user_id = ${userId}::uuid AND status = 'pending'::public.global_connection_status
      ORDER BY created_at DESC
    `.catch(() => []);
    return rows.map(r => ({
      id: r.id,
      counterpartUserId: r.requester_user_id,
      status: r.status,
      createdAt: r.created_at,
    }));
  }

  async listOutgoingRequests(userId: string) {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT id, requester_user_id, recipient_user_id as target_user_id, status, created_at
      FROM public.user_connections
      WHERE requester_user_id = ${userId}::uuid AND status = 'pending'::public.global_connection_status
      ORDER BY created_at DESC
    `.catch(() => []);
    return rows.map(r => ({
      id: r.id,
      counterpartUserId: r.target_user_id,
      status: r.status,
      createdAt: r.created_at,
    }));
  }

  async countConnectionsByStatus(userId: string) {
    const incomingRes = await this.prisma.$queryRaw<any[]>`
      SELECT COUNT(id)::int as count FROM public.user_connections
      WHERE recipient_user_id = ${userId}::uuid AND status = 'pending'::public.global_connection_status
    `.catch(() => [{ count: 0 }]);
    const outgoingRes = await this.prisma.$queryRaw<any[]>`
      SELECT COUNT(id)::int as count FROM public.user_connections
      WHERE requester_user_id = ${userId}::uuid AND status = 'pending'::public.global_connection_status
    `.catch(() => [{ count: 0 }]);
    const acceptedRes = await this.prisma.$queryRaw<any[]>`
      SELECT COUNT(id)::int as count FROM public.user_connections
      WHERE (requester_user_id = ${userId}::uuid OR recipient_user_id = ${userId}::uuid) AND status = 'accepted'::public.global_connection_status
    `.catch(() => [{ count: 0 }]);

    return {
      incoming: incomingRes[0]?.count || 0,
      outgoing: outgoingRes[0]?.count || 0,
      accepted: acceptedRes[0]?.count || 0,
    };
  }

  async getGuestContact(userId: string, id: string) {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT id, display_name, title, company_name, first_shared_at, last_shared_at, source, owner_label, owner_note
      FROM public.guest_contacts
      WHERE id = ${id}::uuid AND owner_user_id = ${userId}::uuid
      LIMIT 1
    `.catch(() => []);
    if (rows.length === 0) throw new NotFoundException('Guest contact not found');
    const g = rows[0];
    return {
      id: g.id,
      displayName: g.display_name || null,
      title: g.title || null,
      companyName: g.company_name || null,
      firstSharedAt: g.first_shared_at ? new Date(g.first_shared_at).toISOString() : null,
      lastSharedAt: g.last_shared_at ? new Date(g.last_shared_at).toISOString() : null,
      source: g.source || null,
      ownerLabel: g.owner_label || null,
      ownerNote: g.owner_note || null,
    };
  }

  async updateGuestContactOwnerFields(userId: string, id: string, body: { ownerLabel?: string | null; ownerNote?: string | null }) {
    await this.prisma.$executeRaw`
      UPDATE public.guest_contacts
      SET owner_label = ${body.ownerLabel || null}, owner_note = ${body.ownerNote || null}
      WHERE id = ${id}::uuid AND owner_user_id = ${userId}::uuid
    `;
    return this.getGuestContact(userId, id);
  }

  async deleteGuestContact(userId: string, id: string) {
    await this.prisma.$executeRaw`
      DELETE FROM public.guest_contacts
      WHERE id = ${id}::uuid AND owner_user_id = ${userId}::uuid
    `;
    return { removed: true };
  }


  async reportUser(userId: string, data: any) {
    const id = crypto.randomUUID();
    await this.prisma.$executeRaw`
      INSERT INTO public.gn_reports (id, reporter_user_id, reported_user_id, category, details, connection_id, created_at)
      VALUES (
        ${id}::uuid,
        ${userId}::uuid,
        ${data.reportedUserId}::uuid,
        ${data.category},
        ${data.details || null},
        ${data.connectionId || null}::uuid,
        now()
      )
    `;
    return { reportId: id };
  }


  async getPersonalization(userId: string) {
    const prefs = await this.prisma.$queryRaw<any[]>`
      SELECT recommendations_enabled, reconnect_enabled, reconnect_cadence, preferred_contact_action, behavioral_adaptation_enabled, policy_version, updated_at
      FROM public.relationship_intelligence_preferences
      WHERE viewer_user_id = ${userId}::uuid
      LIMIT 1
    `.catch(() => [] as any[]);

    const p = prefs[0] || {
      recommendations_enabled: true,
      reconnect_enabled: true,
      reconnect_cadence: 'auto',
      preferred_contact_action: 'auto',
      behavioral_adaptation_enabled: true,
      policy_version: 'v1',
      updated_at: null,
    };

    const preferences = {
      recommendationsEnabled: p.recommendations_enabled !== false,
      reconnectEnabled: p.reconnect_enabled !== false,
      reconnectCadence: p.reconnect_cadence || 'auto',
      preferredContactAction: p.preferred_contact_action || 'auto',
      behavioralAdaptationEnabled: p.behavioral_adaptation_enabled !== false,
      policyVersion: p.policy_version || 'v1',
      updatedAt: p.updated_at ? new Date(p.updated_at).toISOString() : null,
    };

    // Derived values (simple baseline reconnectcadence calculation matching engine)
    let reconnectThresholdDays = 45;
    if (preferences.reconnectCadence === 'more_often') reconnectThresholdDays = 30;
    else if (preferences.reconnectCadence === 'less_often') reconnectThresholdDays = 60;

    let preferredAction: string | null = null;
    if (preferences.preferredContactAction !== 'auto') {
      preferredAction = preferences.preferredContactAction;
    }

    return {
      preferences,
      profile: {
        reconnectThresholdDays,
        cadenceSource: preferences.reconnectCadence === 'auto' ? 'default' : 'explicit',
        preferredAction,
        actionSource: preferences.preferredContactAction === 'auto' ? 'default' : 'explicit',
      },
    };
  }

  async updatePersonalizationPreferences(userId: string, input: any) {
    const current = await this.getPersonalization(userId);
    const next = {
      ...current.preferences,
      ...input,
      updatedAt: new Date().toISOString(),
    };

    await this.prisma.$executeRaw`
      INSERT INTO public.relationship_intelligence_preferences (
        viewer_user_id, recommendations_enabled, reconnect_enabled, reconnect_cadence, preferred_contact_action, behavioral_adaptation_enabled, policy_version, updated_at
      ) VALUES (
        ${userId}::uuid, ${next.recommendationsEnabled}, ${next.reconnectEnabled}, ${next.reconnectCadence}, ${next.preferredContactAction}, ${next.behavioralAdaptationEnabled}, ${next.policyVersion}, ${new Date(next.updatedAt)}
      )
      ON CONFLICT (viewer_user_id) DO UPDATE SET
        recommendations_enabled = EXCLUDED.recommendations_enabled,
        reconnect_enabled = EXCLUDED.reconnect_enabled,
        reconnect_cadence = EXCLUDED.reconnect_cadence,
        preferred_contact_action = EXCLUDED.preferred_contact_action,
        behavioral_adaptation_enabled = EXCLUDED.behavioral_adaptation_enabled,
        policy_version = EXCLUDED.policy_version,
        updated_at = EXCLUDED.updated_at
    `;

    return this.getPersonalization(userId);
  }

  async recordPersonalizationInteraction(userId: string, input: any) {
    const prefs = await this.getPersonalization(userId);
    if (!prefs.preferences.behavioralAdaptationEnabled) {
      return { ok: true, recorded: false };
    }

    const type = ['recommendation_opened', 'recommendation_dismissed'].includes(input.kind) ? input.recommendationType : null;
    const now = new Date();

    await this.prisma.$executeRaw`
      INSERT INTO public.relationship_intelligence_interactions (
        viewer_user_id, kind, recommendation_type, occurred_at
      ) VALUES (
        ${userId}::uuid, ${input.kind}, ${type || null}, ${now}
      )
    `;

    // Prune interactions older than 30 days
    const pruneBefore = new Date(Date.now() - 30 * 86400000);
    await this.prisma.$executeRaw`
      DELETE FROM public.relationship_intelligence_interactions
      WHERE viewer_user_id = ${userId}::uuid AND occurred_at < ${pruneBefore}
    `;

    return { ok: true, recorded: true };
  }

  async resetPersonalization(userId: string) {
    await this.prisma.$executeRaw`
      DELETE FROM public.relationship_intelligence_interactions WHERE viewer_user_id = ${userId}::uuid
    `;
    await this.prisma.$executeRaw`
      DELETE FROM public.relationship_intelligence_preferences WHERE viewer_user_id = ${userId}::uuid
    `;
    return { ok: true };
  }

  // ==========================================
  // BC-Mobile-6D â€” Person Plans
  // ==========================================

  async createPersonPlan(userId: string, input: any) {
    const planId = crypto.randomUUID();
    const { targetKind, targetUserId, targetCardId, targetGuestId } = parsePersonId(input.personId);
    const now = new Date();
    const dueAt = new Date(input.dueAt);

    await this.prisma.$executeRaw`
      INSERT INTO public.business_relationship_person_plans (
        id, owner_user_id, target_kind, target_user_id, target_card_id, target_guest_id,
        kind, status, due_at, title, note, location_label, created_at, updated_at
      ) VALUES (
        ${planId}::uuid, ${userId}::uuid, ${targetKind}, ${targetUserId}::uuid, ${targetCardId}::uuid, ${targetGuestId}::uuid,
        ${input.kind}, 'pending', ${dueAt}, ${input.title || null}, ${input.note || null}, ${input.locationLabel || null}, ${now}, ${now}
      )
    `;

    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT * FROM public.business_relationship_person_plans WHERE id = ${planId}::uuid LIMIT 1
    `.catch(() => [] as any[]);

    const p = rows[0];
    if (!p) throw new InternalServerErrorException('failed_to_create_plan');

    return {
      plan: {
        id: p.id,
        personId: input.personId,
        kind: p.kind,
        status: p.status,
        dueAt: p.due_at ? new Date(p.due_at).toISOString() : '',
        title: p.title,
        note: p.note,
        locationLabel: p.location_label,
        completedAt: null,
        createdAt: p.created_at ? new Date(p.created_at).toISOString() : null,
        updatedAt: p.updated_at ? new Date(p.updated_at).toISOString() : null,
      }
    };
  }

  async listPersonPlans(userId: string, input: any) {
    let query: any;
    const limit = Math.min(50, input.limit || 20);

    let rows: any[];
    if (input.personId) {
      const { targetKind, targetUserId, targetCardId, targetGuestId } = parsePersonId(input.personId);
      rows = await this.prisma.$queryRaw<any[]>`
        SELECT * FROM public.business_relationship_person_plans
        WHERE owner_user_id = ${userId}::uuid
          AND target_kind = ${targetKind}
          AND (
            (target_kind = 'connection' AND target_user_id = ${targetUserId}::uuid) OR
            (target_kind = 'saved_card' AND target_card_id = ${targetCardId}::uuid) OR
            (target_kind = 'guest_contact' AND target_guest_id = ${targetGuestId}::uuid)
          )
          AND (${input.includeClosed} = true OR status = 'pending')
        ORDER BY due_at ASC, created_at DESC
        LIMIT ${limit}
      `.catch(() => [] as any[]);
    } else {
      rows = await this.prisma.$queryRaw<any[]>`
        SELECT * FROM public.business_relationship_person_plans
        WHERE owner_user_id = ${userId}::uuid
          AND (${input.includeClosed} = true OR status = 'pending')
        ORDER BY due_at ASC, created_at DESC
        LIMIT ${limit}
      `.catch(() => [] as any[]);
    }

    const plans = rows.map(p => ({
      id: p.id,
      personId: composePersonId(p.target_kind, p.target_user_id, p.target_card_id, p.target_guest_id),
      kind: p.kind,
      status: p.status,
      dueAt: p.due_at ? new Date(p.due_at).toISOString() : '',
      title: p.title,
      note: p.note,
      locationLabel: p.location_label,
      completedAt: p.completed_at ? new Date(p.completed_at).toISOString() : null,
      createdAt: p.created_at ? new Date(p.created_at).toISOString() : null,
      updatedAt: p.updated_at ? new Date(p.updated_at).toISOString() : null,
    }));

    return { plans };
  }

  async setPersonPlanStatus(userId: string, input: any) {
    const now = new Date();
    const completedAt = input.status === 'done' ? now : null;

    const existing = await this.prisma.$queryRaw<any[]>`
      SELECT * FROM public.business_relationship_person_plans
      WHERE id = ${input.planId}::uuid AND owner_user_id = ${userId}::uuid
      LIMIT 1
    `.catch(() => [] as any[]);

    const p = existing[0];
    if (!p) throw new NotFoundException('plan_not_found');

    await this.prisma.$executeRaw`
      UPDATE public.business_relationship_person_plans
      SET status = ${input.status},
          completed_at = ${completedAt},
          updated_at = ${now}
      WHERE id = ${input.planId}::uuid AND owner_user_id = ${userId}::uuid
    `;

    return {
      plan: {
        id: p.id,
        personId: composePersonId(p.target_kind, p.target_user_id, p.target_card_id, p.target_guest_id),
        kind: p.kind,
        status: input.status,
        dueAt: p.due_at ? new Date(p.due_at).toISOString() : '',
        title: p.title,
        note: p.note,
        locationLabel: p.location_label,
        completedAt: completedAt ? completedAt.toISOString() : null,
        createdAt: p.created_at ? new Date(p.created_at).toISOString() : null,
        updatedAt: now.toISOString(),
      }
    };
  }

  // ==========================================
  // BC-Mobile-2D/2E â€” Person Journey
  // ==========================================

  async getPersonJourney(userId: string, input: any) {
    const personId = input.personId;
    if (!personId) {
      return { status: 'ok', page: { items: [], nextCursor: null } };
    }
    const parsed = parsePersonId(personId);
    const targetUserId = parsed.targetUserId || (personId.includes(':') ? personId.split(':')[1] : personId);

    // 1. Query Pair state if connection
    if (parsed.targetKind === 'connection' && targetUserId) {
      const low = userId < targetUserId ? userId : targetUserId;
      const high = userId < targetUserId ? targetUserId : userId;
      const connections = await this.prisma.$queryRaw<any[]>`
        SELECT status, blocked_by_user_id FROM public.user_connections
        WHERE pair_user_low = ${low}::uuid AND pair_user_high = ${high}::uuid
        LIMIT 1
      `.catch(() => [] as any[]);

      const cState = connections[0];
      if (cState && cState.blocked_by_user_id !== null) {
        return { status: 'unavailable' };
      }
    }

    // 2. Fetch moments for target
    let momentsQuery: any;
    if (parsed.targetKind === 'connection' && targetUserId) {
      momentsQuery = this.prisma.$queryRaw<any[]>`
        SELECT id, occurred_at, event_name, place_label, note
        FROM public.business_relationship_moments
        WHERE owner_user_id = ${userId}::uuid AND target_user_id = ${targetUserId}::uuid AND status = 'active'
        ORDER BY occurred_at DESC, id DESC
      `;
    } else if (parsed.targetKind === 'saved_card' && parsed.targetCardId) {
      momentsQuery = this.prisma.$queryRaw<any[]>`
        SELECT id, occurred_at, event_name, place_label, note
        FROM public.business_relationship_moments
        WHERE owner_user_id = ${userId}::uuid AND target_card_id = ${parsed.targetCardId}::uuid AND status = 'active'
        ORDER BY occurred_at DESC, id DESC
      `;
    } else if (parsed.targetGuestId) {
      momentsQuery = this.prisma.$queryRaw<any[]>`
        SELECT id, occurred_at, event_name, place_label, note
        FROM public.business_relationship_moments
        WHERE owner_user_id = ${userId}::uuid AND target_guest_id = ${parsed.targetGuestId}::uuid AND status = 'active'
        ORDER BY occurred_at DESC, id DESC
      `;
    } else {
      momentsQuery = Promise.resolve([]);
    }

    const moments = await momentsQuery.catch(() => [] as any[]);
    const momentIds = moments.map(m => m.id);

    const momentMedia = momentIds.length > 0 ? await this.prisma.$queryRaw<any[]>`
      SELECT moment_id, storage_path, sort_order FROM public.business_relationship_moment_media
      WHERE moment_id::uuid = ANY(${momentIds}::uuid[])
      ORDER BY sort_order ASC
    `.catch(() => [] as any[]) : [];

    const mediaMap = new Map<string, any[]>();
    for (const m of momentMedia) {
      const list = mediaMap.get(m.moment_id) ?? [];
      list.push(m);
      mediaMap.set(m.moment_id, list);
    }

    // Compose journey items
    const items: any[] = [];

    // Add moments as items
    for (const m of moments) {
      const mediaFiles = mediaMap.get(m.id) ?? [];
      const photoPath = mediaFiles[0]?.storage_path ?? null;

      let photoUrl: string | null = null;
      if (photoPath) {
        if (
          photoPath.startsWith('http://') ||
          photoPath.startsWith('https://') ||
          photoPath.startsWith('/upload/') ||
          photoPath.startsWith('/uploads/') ||
          photoPath.startsWith('data:')
        ) {
          photoUrl = photoPath;
        } else if (photoPath.startsWith('/')) {
          photoUrl = photoPath;
        } else {
          photoUrl = `/upload/file/${photoPath.split('/').pop()}`;
        }
      }

      items.push({
        id: `moment:${m.id}`,
        kind: 'moment',
        occurredAt: m.occurred_at ? new Date(m.occurred_at).toISOString() : null,
        provenance: { domain: 'moment' },
        moment: {
          title: m.event_name,
          placeLabel: m.place_label,
          note: m.note,
          photoUrl,
          photoCount: mediaFiles.length,
        }
      });
    }

    // Add milestones: saved_card milestone
    if (parsed.targetKind === 'saved_card') {
      const savedCards = await this.prisma.$queryRaw<any[]>`
        SELECT saved_at FROM public.saved_business_cards
        WHERE owner_user_id = ${userId}::uuid AND target_card_id = ${parsed.targetCardId}::uuid AND archived = false
        LIMIT 1
      `.catch(() => [] as any[]);

      const sc = savedCards[0];
      if (sc) {
        items.push({
          id: `card_saved:${parsed.targetCardId}`,
          kind: 'card_saved',
          occurredAt: sc.saved_at ? new Date(sc.saved_at).toISOString() : null,
          provenance: { domain: 'saved_card' },
        });
      }
    }

    // Add guest origin milestones
    if (parsed.targetKind === 'guest_contact') {
      const guests = await this.prisma.$queryRaw<any[]>`
        SELECT first_shared_at, source FROM public.guest_contacts
        WHERE id = ${parsed.targetGuestId}::uuid AND owner_user_id = ${userId}::uuid
        LIMIT 1
      `.catch(() => [] as any[]);

      const g = guests[0];
      if (g) {
        const isScanned = g.source === 'business_card_scan';
        items.push({
          id: isScanned ? `business_card_scanned:${parsed.targetGuestId}` : `contact_shared:${parsed.targetGuestId}`,
          kind: isScanned ? 'business_card_scanned' : 'contact_shared',
          occurredAt: g.first_shared_at ? new Date(g.first_shared_at).toISOString() : null,
          provenance: { domain: 'guest_contact' },
        });
      }
    }

    // Add graph connections milestone if connection exists
    if (parsed.targetKind === 'connection') {
      // Query low/high connection
      const low = userId < targetUserId ? userId : targetUserId;
      const high = userId < targetUserId ? targetUserId : userId;
      const connections = await this.prisma.$queryRaw<any[]>`
        SELECT created_at, status FROM public.user_connections
        WHERE pair_user_low = ${low}::uuid AND pair_user_high = ${high}::uuid AND status = 'accepted'
        LIMIT 1
      `.catch(() => [] as any[]);

      const c = connections[0];
      if (c) {
        items.push({
          id: `connected_to:${targetUserId}`,
          kind: 'connected',
          occurredAt: c.created_at ? new Date(c.created_at).toISOString() : null,
          provenance: { domain: 'graph' },
        });
      }
    }

    // Sort items occurredAt DESC
    items.sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());

    return {
      status: 'ok',
      page: {
        items,
        nextCursor: null,
      }
    };
  }

  // ==========================================

  async shareGuestContact(slug: string, body: any) {
    try {
      const res = await this.prisma.$queryRaw<any[]>`
        SELECT public.share_guest_contact(
          ${slug},
          ${body.displayName ?? ''},
          ${body.phone ?? null},
          ${body.email ?? null},
          ${body.companyName ?? null},
          ${body.title ?? null},
          ${String(body.consentVersion ?? 'bc-guest-exchange-v1')},
          ${body.clientToken ?? null}
        ) as result
      `.catch(() => []);

      if (res.length > 0 && res[0]?.result) {
        return res[0].result;
      }

      // Direct fallback
      const cards = await this.prisma.$queryRaw<any[]>`
        SELECT id, owner_user_id FROM public.member_business_cards WHERE slug = ${slug} LIMIT 1
      `.catch(() => []);
      let cardId = cards[0]?.id || null;
      let ownerId = cards[0]?.owner_user_id || null;

      if (!ownerId) {
        const mems = await this.prisma.$queryRaw<any[]>`
          SELECT user_id FROM public.members WHERE LOWER(code) = ${slug.toLowerCase()} LIMIT 1
        `.catch(() => []);
        ownerId = mems[0]?.user_id || null;
      }

      if (ownerId) {
        await this.prisma.$executeRaw`
          INSERT INTO public.business_card_leads (
            id, card_id, owner_member_id, full_name, email, phone, company, job_title, note, status, created_at, updated_at
          ) VALUES (
            gen_random_uuid(),
            ${cardId ? cardId : null}::uuid,
            ${ownerId}::uuid,
            ${body.displayName || body.fullName || body.name || 'Khách liên hệ'},
            ${body.email || null},
            ${body.phone || null},
            ${body.companyName || body.company || null},
            ${body.title || body.jobTitle || null},
            ${body.note || body.message || null},
            'new',
            now(),
            now()
          )
        `.catch(() => null);
      }

      return { ok: true, reason: 'created' };
    } catch {
      return { ok: true, reason: 'created' };
    }
  }

  // ---------------------------------------------------------------------------
  // Admin: renewal audit scope
  // ---------------------------------------------------------------------------

}
