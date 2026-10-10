import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class VotingRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listPollsRaw(userId: string): Promise<any[]> {
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
        (SELECT v.option_id FROM public.poll_votes v WHERE v.poll_id = p.id AND v.user_id = ${userId}::uuid LIMIT 1) as my_vote,
        (SELECT v.source_app FROM public.poll_votes v WHERE v.poll_id = p.id AND v.user_id = ${userId}::uuid LIMIT 1) as my_vote_source,
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
        (SELECT v.option_id FROM public.poll_votes v WHERE v.poll_id = p.id AND v.user_id = ${userId}::uuid LIMIT 1) as my_vote,
        (SELECT v.source_app FROM public.poll_votes v WHERE v.poll_id = p.id AND v.user_id = ${userId}::uuid LIMIT 1) as my_vote_source,
        (SELECT COUNT(*)::int FROM public.poll_votes pv WHERE pv.poll_id = p.id) as calculated_total_votes,
        json_build_object(
          'associationApp', (SELECT COUNT(*)::int FROM public.poll_votes pv WHERE pv.poll_id = p.id AND (pv.source_app = 'association_app' OR pv.source_app IS NULL)),
          'crm', (SELECT COUNT(*)::int FROM public.poll_votes pv WHERE pv.poll_id = p.id AND pv.source_app = 'crm')
        ) as source_stats
      FROM public.polls p
      LEFT JOIN public.events e ON p.event_id = e.id
      WHERE p.id = ${id}::uuid
      LIMIT 1
    `.catch(() => [] as any[]);
  }

  async insertVote(voteId: string, pollId: string, optionId: string, userId: string, source: string): Promise<void> {
    await this.prisma.$executeRaw`
      INSERT INTO public.poll_votes (id, poll_id, option_id, user_id, source_app, created_at)
      VALUES (${voteId}::uuid, ${pollId}::uuid, ${optionId}::uuid, ${userId}::uuid, ${source}, now())
      ON CONFLICT (poll_id, user_id) DO UPDATE SET option_id = ${optionId}::uuid, source_app = ${source}, created_at = now()
    `.catch(async () => {
      await this.prisma.$executeRaw`
        DELETE FROM public.poll_votes WHERE poll_id = ${pollId}::uuid AND user_id = ${userId}::uuid
      `.catch(() => {});
      await this.prisma.$executeRaw`
        INSERT INTO public.poll_votes (id, poll_id, option_id, user_id, source_app, created_at)
        VALUES (${voteId}::uuid, ${pollId}::uuid, ${optionId}::uuid, ${userId}::uuid, ${source}, now())
      `.catch(() => {});
    });

    await this.prisma.$executeRaw`
      UPDATE public.poll_options
      SET votes_count = (SELECT COUNT(*)::int FROM public.poll_votes WHERE option_id = public.poll_options.id)
      WHERE poll_id = ${pollId}::uuid
    `.catch(() => {});
  }

  async findEventDate(eventId: string): Promise<any[]> {
    return this.prisma.$queryRaw<any[]>`
      SELECT date FROM public.events WHERE id = ${eventId} LIMIT 1
    `.catch(() => []);
  }

  async insertPoll(pollId: string, title: string, description: string | null, startDt: Date, endDt: Date, eventId: string | null): Promise<void> {
    await this.prisma.$executeRaw`
      INSERT INTO public.polls (id, title, description, status, start_date, end_date, event_id, created_at, updated_at)
      VALUES (${pollId}::uuid, ${title}, ${description}, 'open', ${startDt}, ${endDt}, ${eventId}, now(), now())
    `;
  }

  async insertPollOption(optId: string, pollId: string, title: string): Promise<void> {
    await this.prisma.$executeRaw`
      INSERT INTO public.poll_options (id, poll_id, title, votes_count, created_at)
      VALUES (${optId}::uuid, ${pollId}::uuid, ${title}, 0, now())
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
    if (winnerCode) {
      const res = await this.prisma.$queryRaw<any[]>`
        SELECT user_id as id, code, name FROM public.members 
        WHERE code = ${winnerCode} OR id = ${winnerCode}
        LIMIT 1
      `.catch(() => []);
      if (res.length > 0) return res;
    }
    if (winnerName) {
      return this.prisma.$queryRaw<any[]>`
        SELECT user_id as id, code, name FROM public.members 
        WHERE LOWER(name) LIKE ${'%' + winnerName.toLowerCase() + '%'}
        LIMIT 1
      `.catch(() => []);
    }
    return [];
  }

  async sendLuckyDrawNotification(targetUserId: string, title: string, body: string, eventId: string, safeDisplayData: string, memberCode?: string): Promise<void> {
    await this.prisma.$executeRawUnsafe(`
      INSERT INTO public.business_notifications (
        id, recipient_user_id, source_domain, source_record_id, event_kind, notification_kind,
        title_key, body_key, safe_display_data, priority, status, dedupe_key, app_scope, target_app, created_at, updated_at
      ) VALUES (
        gen_random_uuid(), $1, 'events', $2, 'lucky_draw_won', 'lucky_draw_winner',
        $3, $4, $5::jsonb, 'high', 'delivered', $6, 'association_app', 'association_app', NOW(), NOW()
      )
    `, targetUserId, eventId || 'lucky-draw', title, body, safeDisplayData, `lucky-win-${Date.now()}`).catch(() => {});

    await this.prisma.$executeRawUnsafe(`
      INSERT INTO public.member_notifications (
        id, recipient_id, title, body, read, dismissed, ref_type, ref_id, created_at
      ) VALUES (
        gen_random_uuid(), $1, $2, $3, false, false, 'lucky_draw', $4, NOW()
      )
    `, targetUserId, title, body, eventId || 'lucky-draw').catch(() => {});

    await this.prisma.$executeRawUnsafe(`
      INSERT INTO public.notifications (
        id, code, title, body, audience, channel, status, sent_at, reach, association_id, app_scope, target_app, created_at, updated_at
      ) VALUES (
        gen_random_uuid(), $1, $2, $3, 'members', 'official_events', 'sent', NOW(), 1,
        'c1983000-0000-4000-8000-000000001983'::uuid, 'association_app', 'association_app', NOW(), NOW()
      )
    `, `NOTIF-WIN-${Date.now().toString().slice(-6)}`, title, body).catch(() => {});

    if (memberCode) {
      await this.prisma.$executeRaw`
        INSERT INTO public.messages (id, from_id, to_id, text, created_at)
        VALUES (gen_random_uuid(), 'ADMIN', ${String(memberCode).toLowerCase()}, ${body}, NOW())
      `.catch(() => {});
    }
  }
}
