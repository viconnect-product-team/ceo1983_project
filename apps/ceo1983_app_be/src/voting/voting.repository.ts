import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

function toValidUuid(id: string | null | undefined): string | null {
  if (!id) return null;
  const clean = String(id).trim();
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(clean)) {
    return clean;
  }
  return null;
}

@Injectable()
export class VotingRepository {
  constructor(private readonly prisma: PrismaService) {}

  async ensureSeedPolls(): Promise<void> {
    try {
      const count = await this.prisma.$queryRaw<any[]>`
        SELECT COUNT(*)::int as cnt FROM public.polls
      `.catch(() => [{ cnt: 0 }]);

      if (Number(count[0]?.cnt || 0) === 0) {
        const seedPolls = [
          {
            id: 'c1983000-0000-4000-8000-000000000001',
            title: 'Thông qua Báo cáo Tài chính kiểm toán 2025 & Dự toán Ngân sách 2026',
            description: 'Căn cứ Điều lệ Hiệp hội, Ban Điều Hành kính trình toàn thể Quý Hội viên biểu quyết thông qua báo cáo quyết toán tài chính năm 2025 và hạn mức phân bổ ngân sách xúc tiến thương mại năm 2026.',
            status: 'open',
            startDate: new Date('2026-09-20'),
            endDate: new Date('2026-12-31'),
            options: ['Đồng ý', 'Bác bỏ', 'Phiếu trắng'],
          },
          {
            id: 'c1983000-0000-4000-8000-000000000002',
            title: 'Phê chuẩn kiện toàn nhân sự Ban Xúc Tiến Thương Mại & Ban Pháp Chế',
            description: 'Biểu quyết phê chuẩn bổ nhiệm bổ sung 02 Phó Ban Xúc Tiến Thương Mại và 01 Phó Ban Pháp Chế nhằm tăng cường năng lực kết nối doanh nghiệp giai đoạn cuối năm.',
            status: 'open',
            startDate: new Date('2026-09-25'),
            endDate: new Date('2026-12-31'),
            options: ['Đồng ý', 'Bác bỏ', 'Phiếu trắng'],
          },
          {
            id: 'c1983000-0000-4000-8000-000000000003',
            title: 'Lựa chọn cung đường & chủ đề chương trình Caravan Doanh Nhân 2026',
            description: 'Toàn thể Hội viên tham gia biểu quyết lựa chọn cung đường di chuyển và chương trình thiện nguyện đồng hành cùng Caravan CEO 1983.',
            status: 'closed',
            startDate: new Date('2026-08-10'),
            endDate: new Date('2026-08-20'),
            options: ['Đồng ý', 'Bác bỏ', 'Phiếu trắng'],
          },
          {
            id: 'c1983000-0000-4000-8000-000000000004',
            title: 'Sửa đổi Quy chế xét duyệt kết nạp Hội viên chính thức năm 2026',
            description: 'Quy chế mới áp dụng tiêu chuẩn xác thực pháp lý doanh nghiệp và chứng thư số hóa danh thiếp thông minh cho toàn thể hội viên gia nhập.',
            status: 'closed',
            startDate: new Date('2026-07-15'),
            endDate: new Date('2026-07-25'),
            options: ['Đồng ý', 'Bác bỏ', 'Phiếu trắng'],
          },
        ];

        for (const sp of seedPolls) {
          await this.prisma.$executeRaw`
            INSERT INTO public.polls (id, title, description, status, start_date, end_date, created_at, updated_at)
            VALUES (${sp.id}::uuid, ${sp.title}, ${sp.description}, ${sp.status}, ${sp.startDate}, ${sp.endDate}, now(), now())
            ON CONFLICT (id) DO NOTHING
          `.catch(() => {});

          for (const optTitle of sp.options) {
            await this.prisma.$executeRaw`
              INSERT INTO public.poll_options (poll_id, title, votes_count, created_at)
              VALUES (${sp.id}::uuid, ${optTitle}, 0, now())
            `.catch(() => {});
          }
        }
      }
    } catch (e: any) {
      console.warn('ensureSeedPolls warning:', e?.message);
    }
  }

  async listPollsRaw(userId: string): Promise<any[]> {
    await this.ensureSeedPolls();
    const safeUserId = toValidUuid(userId) || '00000000-0000-0000-0000-000000000000';
    return this.prisma.$queryRaw<any[]>`
      SELECT p.*,
        e.name as event_name,
        e.date as event_date,
        e.status as event_status,
        (SELECT json_agg(json_build_object(
          'id', o.id,
          'title', o.title,
          'votes_count', (SELECT COUNT(*)::int FROM public.poll_votes pv WHERE pv.option_id = o.id),
          'association_votes', (SELECT COUNT(*)::int FROM public.poll_votes pv WHERE pv.option_id = o.id AND (pv.source_app = 'association_app' OR pv.source_app IS NULL)),
          'crm_votes', (SELECT COUNT(*)::int FROM public.poll_votes pv WHERE pv.option_id = o.id AND pv.source_app = 'crm')
        ))
         FROM public.poll_options o WHERE o.poll_id = p.id) as options,
        (SELECT v.option_id FROM public.poll_votes v WHERE v.poll_id = p.id AND v.user_id = ${safeUserId}::uuid LIMIT 1) as my_vote,
        (SELECT v.source_app FROM public.poll_votes v WHERE v.poll_id = p.id AND v.user_id = ${safeUserId}::uuid LIMIT 1) as my_vote_source,
        (SELECT COUNT(*)::int FROM public.poll_votes pv WHERE pv.poll_id = p.id) as calculated_total_votes,
        json_build_object(
          'associationApp', (SELECT COUNT(*)::int FROM public.poll_votes pv WHERE pv.poll_id = p.id AND (pv.source_app = 'association_app' OR pv.source_app IS NULL)),
          'crm', (SELECT COUNT(*)::int FROM public.poll_votes pv WHERE pv.poll_id = p.id AND pv.source_app = 'crm')
        ) as source_stats
      FROM public.polls p
      LEFT JOIN public.events e ON p.event_id = e.id
      ORDER BY p.created_at DESC
    `.catch(async () => {
      return this.prisma.$queryRaw<any[]>`
        SELECT p.*, e.name as event_name, e.date as event_date, e.status as event_status
        FROM public.polls p
        LEFT JOIN public.events e ON p.event_id = e.id
        ORDER BY p.created_at DESC
      `.catch(() => [] as any[]);
    });
  }

  async getPollByIdRaw(userId: string, id: string): Promise<any[]> {
    const safeUserId = toValidUuid(userId) || '00000000-0000-0000-0000-000000000000';
    const safePollId = toValidUuid(id) || '00000000-0000-0000-0000-000000000000';
    return this.prisma.$queryRaw<any[]>`
      SELECT p.*,
        e.name as event_name,
        e.date as event_date,
        e.status as event_status,
        (SELECT json_agg(json_build_object(
          'id', o.id,
          'title', o.title,
          'votes_count', (SELECT COUNT(*)::int FROM public.poll_votes pv WHERE pv.option_id = o.id),
          'association_votes', (SELECT COUNT(*)::int FROM public.poll_votes pv WHERE pv.option_id = o.id AND (pv.source_app = 'association_app' OR pv.source_app IS NULL)),
          'crm_votes', (SELECT COUNT(*)::int FROM public.poll_votes pv WHERE pv.option_id = o.id AND pv.source_app = 'crm')
        ))
         FROM public.poll_options o WHERE o.poll_id = p.id) as options,
        (SELECT v.option_id FROM public.poll_votes v WHERE v.poll_id = p.id AND v.user_id = ${safeUserId}::uuid LIMIT 1) as my_vote,
        (SELECT v.source_app FROM public.poll_votes v WHERE v.poll_id = p.id AND v.user_id = ${safeUserId}::uuid LIMIT 1) as my_vote_source,
        (SELECT COUNT(*)::int FROM public.poll_votes pv WHERE pv.poll_id = p.id) as calculated_total_votes,
        json_build_object(
          'associationApp', (SELECT COUNT(*)::int FROM public.poll_votes pv WHERE pv.poll_id = p.id AND (pv.source_app = 'association_app' OR pv.source_app IS NULL)),
          'crm', (SELECT COUNT(*)::int FROM public.poll_votes pv WHERE pv.poll_id = p.id AND pv.source_app = 'crm')
        ) as source_stats
      FROM public.polls p
      LEFT JOIN public.events e ON p.event_id = e.id
      WHERE p.id = ${safePollId}::uuid
      LIMIT 1
    `.catch(() => [] as any[]);
  }

  async insertVote(voteId: string, pollId: string, optionId: string, userId: string, source: string): Promise<void> {
    const safeVoteId = toValidUuid(voteId) || crypto.randomUUID();
    const safePollId = toValidUuid(pollId) || '00000000-0000-0000-0000-000000000000';
    const safeOptId = toValidUuid(optionId) || '00000000-0000-0000-0000-000000000000';
    const safeUserId = toValidUuid(userId) || '00000000-0000-0000-0000-000000000000';
    await this.prisma.$executeRaw`
      INSERT INTO public.poll_votes (id, poll_id, option_id, user_id, source_app, created_at)
      VALUES (${safeVoteId}::uuid, ${safePollId}::uuid, ${safeOptId}::uuid, ${safeUserId}::uuid, ${source}, now())
      ON CONFLICT (poll_id, user_id) DO UPDATE SET option_id = ${safeOptId}::uuid, source_app = ${source}, created_at = now()
    `.catch(async () => {
      await this.prisma.$executeRaw`
        DELETE FROM public.poll_votes WHERE poll_id = ${safePollId}::uuid AND user_id = ${safeUserId}::uuid
      `.catch(() => {});
      await this.prisma.$executeRaw`
        INSERT INTO public.poll_votes (id, poll_id, option_id, user_id, source_app, created_at)
        VALUES (${safeVoteId}::uuid, ${safePollId}::uuid, ${safeOptId}::uuid, ${safeUserId}::uuid, ${source}, now())
      `.catch(() => {});
    });

    await this.prisma.$executeRaw`
      UPDATE public.poll_options
      SET votes_count = (SELECT COUNT(*)::int FROM public.poll_votes WHERE option_id = public.poll_options.id)
      WHERE poll_id = ${safePollId}::uuid
    `.catch(() => {});
  }

  async findEventDate(eventId: string): Promise<any[]> {
    const validEvId = toValidUuid(eventId);
    if (!validEvId) return [];
    return this.prisma.$queryRaw<any[]>`
      SELECT date FROM public.events WHERE id = ${validEvId}::uuid LIMIT 1
    `.catch(() => []);
  }

  async insertPoll(pollId: string, title: string, description: string | null, startDt: Date, endDt: Date, eventId: string | null): Promise<void> {
    const safePollId = toValidUuid(pollId) || crypto.randomUUID();
    const validEventId = toValidUuid(eventId);
    await this.prisma.$executeRaw`
      INSERT INTO public.polls (id, title, description, status, start_date, end_date, event_id, created_at, updated_at)
      VALUES (${safePollId}::uuid, ${title}, ${description}, 'open', ${startDt}, ${endDt}, ${validEventId}::uuid, now(), now())
    `;
  }

  async insertPollOption(optId: string, pollId: string, title: string): Promise<void> {
    const safeOptId = toValidUuid(optId) || crypto.randomUUID();
    const safePollId = toValidUuid(pollId) || '00000000-0000-0000-0000-000000000000';
    await this.prisma.$executeRaw`
      INSERT INTO public.poll_options (id, poll_id, title, votes_count, created_at)
      VALUES (${safeOptId}::uuid, ${safePollId}::uuid, ${title}, 0, now())
    `.catch(() => {});
  }

  async findAudienceUsers(audience: string): Promise<any[]> {
    if (audience === 'members') {
      return this.prisma.$queryRaw<any[]>`
        SELECT DISTINCT user_id as id FROM public.members WHERE user_id IS NOT NULL
      `.catch(() => [] as any[]);
    } else if (audience === 'non_members') {
      return this.prisma.$queryRaw<any[]>`
        SELECT id FROM public.vione_users 
        WHERE id NOT IN (SELECT user_id FROM public.members WHERE user_id IS NOT NULL)
      `.catch(async () => {
        return this.prisma.$queryRaw<any[]>`SELECT id FROM public.vione_users LIMIT 50`.catch(() => [] as any[]);
      });
    } else {
      return this.prisma.$queryRaw<any[]>`
        SELECT DISTINCT u.id FROM (
          SELECT id FROM public.vione_users
          UNION
          SELECT user_id as id FROM public.members WHERE user_id IS NOT NULL
        ) u
      `.catch(() => [] as any[]);
    }
  }

  async createNotification(userId: string, title: string, body: string, pollId: string, safeDisplayData: string, dedupeKey: string, kind: string = 'interactive_poll'): Promise<void> {
    await this.prisma.$executeRawUnsafe(`
      INSERT INTO public.business_notifications (
        id, recipient_user_id, source_domain, source_record_id, event_kind, notification_kind,
        title_key, body_key, safe_display_data, priority, status, dedupe_key, app_scope, target_app, created_at, updated_at
      ) VALUES (
        gen_random_uuid(), $1, 'voting', $2, 'poll_created', $3,
        $4, $5, $6::jsonb, 'high', 'delivered', $7, 'all', 'all', NOW(), NOW()
      )
    `, userId, pollId, kind, title, body, safeDisplayData, dedupeKey).catch(() => {});

    await this.prisma.$executeRawUnsafe(`
      INSERT INTO public.member_notifications (
        id, recipient_id, title, body, read, dismissed, ref_type, ref_id, created_at
      ) VALUES (
        gen_random_uuid(), $1, $2, $3, false, false, 'voting', $4, NOW()
      )
    `, userId, title, body, pollId).catch(() => {});
  }

  async markPollClosed(id: string): Promise<void> {
    await this.prisma.$executeRaw`
      UPDATE public.polls
      SET status = 'closed', updated_at = now()
      WHERE id = ${id}::uuid
    `.catch(() => {});
  }

  async updatePollRaw(id: string, title?: string, description?: string | null, status?: string | null, startDt?: Date | null, endDt?: Date | null, eventId?: string | null): Promise<void> {
    if (eventId !== undefined && eventId !== null) {
      await this.prisma.$executeRaw`
        UPDATE public.polls
        SET title = COALESCE(${title}, title),
            description = COALESCE(${description}, description),
            status = COALESCE(${status}, status),
            event_id = ${eventId},
            start_date = COALESCE(${startDt}, start_date),
            end_date = COALESCE(${endDt}, end_date),
            updated_at = now()
        WHERE id = ${id}::uuid
      `.catch(() => {});
    } else {
      await this.prisma.$executeRaw`
        UPDATE public.polls
        SET title = COALESCE(${title}, title),
            description = COALESCE(${description}, description),
            status = COALESCE(${status}, status),
            start_date = COALESCE(${startDt}, start_date),
            end_date = COALESCE(${endDt}, end_date),
            updated_at = now()
        WHERE id = ${id}::uuid
      `.catch(() => {});
    }
  }

  async deletePollRaw(id: string): Promise<void> {
    await this.prisma.$executeRaw`
      DELETE FROM public.poll_votes WHERE poll_id = ${id}::uuid
    `.catch(() => {});
    await this.prisma.$executeRaw`
      DELETE FROM public.poll_options WHERE poll_id = ${id}::uuid
    `.catch(() => {});
    await this.prisma.$executeRaw`
      DELETE FROM public.polls WHERE id = ${id}::uuid
    `.catch(() => {});
  }

  async findMemberForLuckyDraw(winnerCode?: string, winnerName?: string): Promise<any[]> {
    const cleanCode = (winnerCode || '').replace(/^#/, '').trim();
    if (cleanCode) {
      const regRes = await this.prisma.$queryRaw<any[]>`
        SELECT COALESCE(m.user_id::text, er.id) as id, COALESCE(er.member_code, m.code) as code, COALESCE(er.member_name, m.name) as name, COALESCE(er.email, m.email) as email
        FROM public.event_registrations er
        LEFT JOIN public.members m ON m.code = er.member_code OR (er.email IS NOT NULL AND er.email != '' AND m.email = er.email)
        WHERE er.lucky_number = ${cleanCode} OR er.lucky_number = ${'#' + cleanCode} OR er.id = ${cleanCode} OR er.member_code = ${cleanCode}
        LIMIT 1
      `.catch(() => []);
      if (regRes.length > 0) return regRes;

      const res = await this.prisma.$queryRaw<any[]>`
        SELECT user_id as id, code, name, email FROM public.members 
        WHERE code = ${cleanCode} OR id = ${cleanCode}
        LIMIT 1
      `.catch(() => []);
      if (res.length > 0) return res;
    }
    if (winnerName) {
      return this.prisma.$queryRaw<any[]>`
        SELECT user_id as id, code, name, email FROM public.members 
        WHERE LOWER(name) LIKE ${'%' + winnerName.toLowerCase() + '%'}
        LIMIT 1
      `.catch(() => []);
    }
    return [];
  }

  async sendLuckyDrawNotification(targetUserId: string, title: string, body: string, eventId: string, safeDisplayData: string, memberCode?: string, prizeTitle?: string, eventName?: string): Promise<void> {
    // 1. Business notifications
    await this.prisma.$executeRawUnsafe(`
      INSERT INTO public.business_notifications (
        id, recipient_user_id, source_domain, source_record_id, event_kind, notification_kind,
        title_key, body_key, safe_display_data, priority, status, dedupe_key, app_scope, target_app, created_at, updated_at
      ) VALUES (
        gen_random_uuid(), $1, 'events', $2, 'lucky_draw_won', 'perk_reward',
        $3, $4, $5::jsonb, 'high', 'delivered', $6, 'association_app', 'association_app', NOW(), NOW()
      )
    `, targetUserId, eventId || 'lucky-draw', title, body, safeDisplayData, `lucky-win-${Date.now()}`).catch(() => {});

    // 2. Member in-app notifications pointing to perks
    await this.prisma.$executeRawUnsafe(`
      INSERT INTO public.member_notifications (
        id, recipient_id, title, body, read, dismissed, ref_type, ref_id, created_at
      ) VALUES (
        gen_random_uuid(), $1, $2, $3, false, false, 'perk', $4, NOW()
      )
    `, targetUserId, title, body, eventId || 'lucky-draw').catch(() => {});

    // 3. Official broadcast notification
    await this.prisma.$executeRawUnsafe(`
      INSERT INTO public.notifications (
        id, code, title, body, audience, channel, status, sent_at, reach, association_id, app_scope, target_app, created_at, updated_at
      ) VALUES (
        gen_random_uuid(), $1, $2, $3, 'members', 'official_events', 'sent', NOW(), 1,
        'c1983000-0000-4000-8000-000000001983'::uuid, 'association_app', 'association_app', NOW(), NOW()
      )
    `, `NOTIF-PERK-${Date.now().toString().slice(-6)}`, title, body).catch(() => {});

    // 4. Create custom perk reward voucher in public.perks for the member
    const perkTitle = prizeTitle ? `🎁 Phần thưởng: ${prizeTitle}` : title;
    await this.prisma.$executeRawUnsafe(`
      INSERT INTO public.perks (
        id, title, category, partner, summary, description, discount, icon, link, valid_until, sort_order, status, created_at, updated_at
      ) VALUES (
        gen_random_uuid(), $1, 'Trúng thưởng sự kiện', $2, $3, $4, '100% Miễn phí', 'gift', '/association/perks', NOW() + INTERVAL '30 days', 1, 'active', NOW(), NOW()
      )
    `, perkTitle, eventName || 'Ban Tổ Chức CEO 1983', `Phần thưởng sự kiện dành cho hội viên ${memberCode || ''}`, body).catch(() => {});

    if (memberCode) {
      await this.prisma.$executeRaw`
        INSERT INTO public.messages (id, from_id, to_id, text, created_at)
        VALUES (gen_random_uuid(), 'ADMIN', ${String(memberCode).toLowerCase()}, ${body}, NOW())
      `.catch(() => {});
    }
  }
}
