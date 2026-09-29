/* eslint-disable */
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Optional,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConnectAppGateway } from '../connect-app/connect-app.gateway';

@Injectable()
export class MeetingsService {
  constructor(
    private readonly prisma: PrismaService,
    @Optional() private readonly gateway?: ConnectAppGateway,
  ) {}

  /**
   * Tạo cuộc gặp / cuộc họp 1-on-1 từ CRM và kích hoạt Push Notification nếu là Offline
   */
  async createMeeting(userId: string, data: any) {
    const title = (data.title || 'Gặp gỡ kết nối & Trao đổi cơ hội hợp tác').trim();
    const hostName = (data.hostName || 'Lãnh đạo Hiệp hội').trim();
    const partnerName = (data.partnerName || '').trim();
    const partnerPhone = (data.partnerPhone || '').trim();
    const partnerCompany = (data.partnerCompany || '').trim();
    const date = data.date || new Date().toISOString().split('T')[0];
    const time = data.time || '09:30';
    const venueType = data.venueType || 'offline';
    const venue = (data.venue || 'Văn phòng Hiệp hội CEO 1983, Tòa V-Tower, 649 Kim Mã, Hà Nội').trim();
    const notes = (data.notes || '').trim();

    // 1. Tìm thông tin đối tác trong danh bạ hội viên
    let partnerUserId: string | null = null;
    let partnerMemberCode: string | null = null;
    if (partnerPhone) {
      const foundMember = await this.prisma.$queryRaw<any[]>`
        SELECT id, code, user_id, phone, name FROM public.members 
        WHERE phone = ${partnerPhone} OR phone = ${partnerPhone.replace(/^0/, '+84')} LIMIT 1
      `.catch(() => []);
      if (foundMember.length > 0) {
        partnerUserId = foundMember[0].user_id ? String(foundMember[0].user_id) : null;
        partnerMemberCode = foundMember[0].code || null;
      }
    }

    if (!partnerUserId && partnerName) {
      const foundByName = await this.prisma.$queryRaw<any[]>`
        SELECT id, code, user_id, name FROM public.members 
        WHERE LOWER(name) = LOWER(${partnerName}) LIMIT 1
      `.catch(() => []);
      if (foundByName.length > 0) {
        partnerUserId = foundByName[0].user_id ? String(foundByName[0].user_id) : null;
        partnerMemberCode = foundByName[0].code || null;
      }
    }

    // 2. Tạo bản ghi cuộc họp trong public.business_meetings
    const meetingRows = await this.prisma.$queryRawUnsafe<any[]>(`
      INSERT INTO public.business_meetings (
        id, title, description, meeting_type, status, timezone, created_by_user_id, created_at, updated_at
      ) VALUES (
        gen_random_uuid(), $1, $2, '1on1', 'scheduled', 'Asia/Ho_Chi_Minh', $3::uuid, NOW(), NOW()
      ) RETURNING id
    `, title, `Đối tác: ${partnerName} (${partnerCompany}). Địa điểm: ${venue}. Ghi chú: ${notes}`, userId).catch(() => []);

    const meetingId = meetingRows[0]?.id ? String(meetingRows[0].id) : `meet_${Date.now()}`;

    // 3. Ghi nhận người tổ chức (host)
    await this.prisma.$executeRawUnsafe(`
      INSERT INTO public.business_meeting_participants (
        id, meeting_id, user_id, role, response_status, created_at, updated_at
      ) VALUES (
        gen_random_uuid(), $1::uuid, $2::uuid, 'host', 'accepted', NOW(), NOW()
      )
    `, meetingId, userId).catch(() => {});

    // 4. Ghi nhận người được mời (invitee)
    if (partnerUserId) {
      await this.prisma.$executeRawUnsafe(`
        INSERT INTO public.business_meeting_participants (
          id, meeting_id, user_id, role, response_status, created_at, updated_at
        ) VALUES (
          gen_random_uuid(), $1::uuid, $2::uuid, 'invitee', 'pending', NOW(), NOW()
        )
      `, meetingId, partnerUserId).catch(() => {});
    }

    // 5. TRIGGER PUSH NOTIFICATION CHO CUỘC HỌP OFFLINE
    const isOffline = venueType === 'offline' || (venue && !venue.toLowerCase().startsWith('http'));
    if (isOffline) {
      const notifTitle = `[LỊCH HỌP TRỰC TIẾP OFFLINE] ${title}`;
      const notifBody = `Bạn có lịch hẹn gặp mặt trực tiếp với ${hostName} vào lúc ${time} ngày ${date} tại: ${venue}.${notes ? ` Ghi chú: "${notes}"` : ''}`;

      // 5a. Gửi tin nhắn trực tiếp vào hộp thư (public.messages)
      const directMsg = `[THÔNG BÁO LỊCH HỌP TRỰC TIẾP OFFLINE]\nChào Bạn,\nBạn có lịch hẹn gặp mặt trực tiếp: "${title}".\n- Thời gian: ${time} ngày ${date}\n- Địa điểm: ${venue}\n- Người kết nối: ${hostName}\n- Ghi chú: ${notes || 'Gặp gỡ giao thương kết nối B2B'}`;
      
      if (partnerUserId) {
        await this.prisma.$executeRaw`
          INSERT INTO public.messages (id, from_id, to_id, text, created_at)
          VALUES (gen_random_uuid(), ${userId}, ${partnerUserId}, ${directMsg}, NOW())
        `.catch(() => {});
      }
      if (partnerMemberCode) {
        await this.prisma.$executeRaw`
          INSERT INTO public.messages (id, from_id, to_id, text, created_at)
          VALUES (gen_random_uuid(), ${userId}, ${partnerMemberCode}, ${directMsg}, NOW())
        `.catch(() => {});
      }

      // Lưu tin nhắn xác nhận cho người tạo
      await this.prisma.$executeRaw`
        INSERT INTO public.messages (id, from_id, to_id, text, created_at)
        VALUES (gen_random_uuid(), 'system', ${userId}, ${`[ĐÃ TẠO LỊCH HỌP OFFLINE]\nBạn đã lên lịch gặp trực tiếp với ${partnerName} lúc ${time} ngày ${date} tại ${venue}.`}, NOW())
      `.catch(() => {});

      // 5b. Bắn notification vào chuông thông báo (public.business_notifications & member_notifications)
      const dedupeKey = `offline_meeting_${meetingId}_${Date.now()}`;
      if (partnerUserId) {
        await this.prisma.$executeRawUnsafe(`
          INSERT INTO public.business_notifications (
            id, recipient_user_id, source_domain, source_record_id, dedupe_key, event_kind, notification_kind,
            title_key, body_key, safe_display_data, priority, status, app_scope, target_app, created_at, updated_at
          ) VALUES (
            gen_random_uuid(), $1::uuid, 'meeting', $2, $3, 'meeting_offline_invite', 'meeting_invite',
            $4, $5, $6::jsonb, 'urgent', 'delivered', 'all', 'all', NOW(), NOW()
          )
        `, partnerUserId, meetingId, dedupeKey, notifTitle, notifBody, JSON.stringify({ meetingId, title, venue, time, date, hostName })).catch(() => {});
      }

      const recipientCode = partnerMemberCode || partnerUserId || 'M1983-001';
      await this.prisma.$executeRawUnsafe(`
        INSERT INTO public.member_notifications (
          id, recipient_id, title, body, read, dismissed, ref_type, ref_id, created_at
        ) VALUES (
          gen_random_uuid(), $1, $2, $3, false, false, 'meeting', $4, NOW()
        )
      `, recipientCode, notifTitle, notifBody, meetingId).catch(() => {});

      // 5c. Phát tín hiệu Push Notification tức thì qua Socket Gateway tới thiết bị Mobile
      if (this.gateway) {
        this.gateway.emitToAll('notification:new', {
          id: meetingId,
          title: notifTitle,
          body: notifBody,
          type: 'meeting',
          venueType: 'offline',
          venue,
          time,
          date,
          createdAt: new Date().toISOString(),
        });
        this.gateway.emitToAll('member:notification_new', {
          id: meetingId,
          title: notifTitle,
          body: notifBody,
          refType: 'meeting',
        });
      }
    }

    return {
      success: true,
      id: meetingId,
      title,
      date,
      time,
      venueType,
      venue,
      status: 'scheduled',
      isOffline,
    };
  }

  /**
   * Summary view for Meeting Workspace
   */
  async getWorkspaceSummary(userId: string) {
    try {
      // 1. Get counts
      const countsRaw = await this.prisma.$queryRaw<any[]>`
        SELECT 
          COUNT(DISTINCT m.id) FILTER (WHERE m.status IN ('confirmed', 'scheduled')) as upcoming,
          COUNT(DISTINCT m.id) FILTER (WHERE m.status = 'draft' OR m.confirmed_proposal_id IS NULL) as unscheduled,
          COUNT(DISTINCT m.id) FILTER (WHERE p.response_status = 'pending' AND m.status != 'cancelled') as needs_action,
          COUNT(DISTINCT m.id) FILTER (WHERE m.status IN ('completed', 'cancelled')) as history
        FROM public.business_meetings m
        JOIN public.business_meeting_participants p ON p.meeting_id = m.id
        WHERE p.user_id = ${userId}::uuid
      `.catch(() => []);

      const counts = {
        upcoming: Number(countsRaw[0]?.upcoming ?? 0),
        unscheduled: Number(countsRaw[0]?.unscheduled ?? 0),
        needsAction: Number(countsRaw[0]?.needs_action ?? 0),
        history: Number(countsRaw[0]?.history ?? 0),
      };

      // 2. Fetch upcoming meetings
      const upcomingMeetings = await this.prisma.$queryRaw<any[]>`
        SELECT 
          m.id, m.title, m.description, m.meeting_type, m.status, m.timezone,
          m.created_at, m.updated_at, p.role as viewer_role
        FROM public.business_meetings m
        JOIN public.business_meeting_participants p ON p.meeting_id = m.id
        WHERE p.user_id = ${userId}::uuid
          AND m.status IN ('confirmed', 'scheduled')
        ORDER BY m.created_at DESC
        LIMIT 5
      `.catch(() => []);

      // 3. Fetch needs-action meetings
      const needsActionMeetings = await this.prisma.$queryRaw<any[]>`
        SELECT 
          m.id, m.title, m.description, m.meeting_type, m.status, m.timezone,
          m.created_at, m.updated_at, p.role as viewer_role
        FROM public.business_meetings m
        JOIN public.business_meeting_participants p ON p.meeting_id = m.id
        WHERE p.user_id = ${userId}::uuid
          AND p.response_status = 'pending'
          AND m.status != 'cancelled'
        ORDER BY m.created_at DESC
        LIMIT 5
      `.catch(() => []);

      return {
        counts,
        upcomingMeetings: upcomingMeetings.map(this.formatMeetingItem),
        needsActionMeetings: needsActionMeetings.map(this.formatMeetingItem),
      };
    } catch (err) {
      console.error('getWorkspaceSummary error:', err);
      return {
        counts: { upcoming: 0, unscheduled: 0, needsAction: 0, history: 0 },
        upcomingMeetings: [],
        needsActionMeetings: [],
      };
    }
  }

  /**
   * List meetings by workspace bucket
   */
  async listWorkspaceMeetings(userId: string, filters: any) {
    const limit = Math.min(Math.max(Number(filters.limit || 20), 1), 50);
    const bucket = filters.bucket || 'upcoming';

    try {
      let statusFilter = `m.status IN ('confirmed', 'scheduled')`;
      if (bucket === 'unscheduled') {
        statusFilter = `(m.status = 'draft' OR m.confirmed_proposal_id IS NULL)`;
      } else if (bucket === 'needs_action') {
        statusFilter = `(p.response_status = 'pending' AND m.status != 'cancelled')`;
      } else if (bucket === 'history') {
        statusFilter = `m.status IN ('completed', 'cancelled')`;
      }

      const rows = await this.prisma
        .$queryRawUnsafe<any[]>(
          `
        SELECT 
          m.id, m.title, m.description, m.meeting_type, m.status, m.timezone,
          m.created_at, m.updated_at, p.role as viewer_role
        FROM public.business_meetings m
        JOIN public.business_meeting_participants p ON p.meeting_id = m.id
        WHERE p.user_id = '${userId}'::uuid
          AND ${statusFilter}
        ORDER BY m.created_at DESC
        LIMIT ${limit}
      `,
        )
        .catch(() => []);

      const items = await Promise.all(
        rows.map(async (row) => {
          const outcome = await this.getOutcome(row.id);
          const followUps = await this.listFollowUps(row.id);
          return {
            meeting: {
              id: row.id,
              title: row.title,
              description: row.description,
              meetingType: row.meeting_type,
              status: row.status,
              timezone: row.timezone,
              createdAt: row.created_at,
              updatedAt: row.updated_at,
            },
            viewerRole: row.viewer_role,
            outcome,
            followUps,
          };
        }),
      );

      return {
        items,
        nextCursor: null,
      };
    } catch (err) {
      console.error('listWorkspaceMeetings error:', err);
      return { items: [], nextCursor: null };
    }
  }

  /**
   * Single meeting detail in workspace shape
   */
  async getMeetingWorkspaceDetail(userId: string, meetingId: string) {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT 
        m.id, m.title, m.description, m.meeting_type, m.status, m.timezone,
        m.created_at, m.updated_at, p.role as viewer_role
      FROM public.business_meetings m
      JOIN public.business_meeting_participants p ON p.meeting_id = m.id
      WHERE m.id = ${meetingId}::uuid AND p.user_id = ${userId}::uuid
      LIMIT 1
    `.catch(() => []);

    if (!rows.length) {
      throw new NotFoundException('Meeting not found or access denied');
    }

    const row = rows[0];
    const outcome = await this.getOutcome(meetingId);
    const followUps = await this.listFollowUps(meetingId);

    return {
      meeting: {
        id: row.id,
        title: row.title,
        description: row.description,
        meetingType: row.meeting_type,
        status: row.status,
        timezone: row.timezone,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      },
      viewerRole: row.viewer_role,
      outcome,
      followUps,
    };
  }

  /**
   * Outcome handling
   */
  async getOutcome(meetingId: string) {
    try {
      const rows = await this.prisma.$queryRaw<any[]>`
        SELECT *
        FROM public.business_meeting_outcomes
        WHERE meeting_id = ${meetingId}::uuid
        LIMIT 1
      `.catch(() => []);
      return rows[0] || null;
    } catch {
      return null;
    }
  }

  async saveOutcome(userId: string, meetingId: string, data: any) {
    const outcomeType = data.outcomeType || 'positive_progress';
    const outcomeStatus = data.outcomeStatus || 'draft';
    const summary = data.summary || '';
    const finalizedAt =
      outcomeStatus === 'finalized' ? new Date().toISOString() : null;

    await this.prisma.$queryRawUnsafe(`
      INSERT INTO public.business_meeting_outcomes (
        meeting_id, recorded_by_user_id, outcome_type, outcome_status, summary, finalized_at
      ) VALUES (
        '${meetingId}'::uuid,
        '${userId}'::uuid,
        '${outcomeType}',
        '${outcomeStatus}',
        '${summary.replace(/'/g, "''")}',
        ${finalizedAt ? `'${finalizedAt}'::timestamptz` : 'NULL'}
      )
      ON CONFLICT (meeting_id) DO UPDATE SET
        outcome_type = EXCLUDED.outcome_type,
        outcome_status = EXCLUDED.outcome_status,
        summary = EXCLUDED.summary,
        finalized_at = EXCLUDED.finalized_at,
        updated_at = now()
    `);

    return this.getOutcome(meetingId);
  }

  /**
   * Follow-ups handling
   */
  async listFollowUps(meetingId: string) {
    try {
      return await this.prisma.$queryRaw<any[]>`
        SELECT *
        FROM public.business_meeting_follow_ups
        WHERE meeting_id = ${meetingId}::uuid
        ORDER BY created_at ASC
      `.catch(() => []);
    } catch {
      return [];
    }
  }

  async createFollowUp(userId: string, meetingId: string, data: any) {
    const title = data.title || 'Follow-up task';
    const description = data.description || '';
    const dueDate = data.dueDate ? `'${data.dueDate}'::timestamptz` : 'NULL';

    const rows = await this.prisma.$queryRawUnsafe<any[]>(`
      INSERT INTO public.business_meeting_follow_ups (
        meeting_id, assigned_to_user_id, created_by_user_id, title, description, due_date, status
      ) VALUES (
        '${meetingId}'::uuid,
        '${userId}'::uuid,
        '${userId}'::uuid,
        '${title.replace(/'/g, "''")}',
        '${description.replace(/'/g, "''")}',
        ${dueDate},
        'pending'
      )
      RETURNING *
    `);

    return rows[0];
  }

  async updateFollowUpStatus(
    userId: string,
    followUpId: string,
    status: string,
  ) {
    const rows = await this.prisma.$queryRaw<any[]>`
      UPDATE public.business_meeting_follow_ups
      SET status = ${status}, updated_at = now()
      WHERE id = ${followUpId}::uuid
      RETURNING *
    `;
    return rows[0];
  }

  private formatMeetingItem(row: any) {
    return {
      meeting: {
        id: row.id,
        title: row.title,
        description: row.description,
        meetingType: row.meeting_type,
        status: row.status,
        timezone: row.timezone,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      },
      viewerRole: row.viewer_role,
    };
  }

  async getAvailabilityPreferences(userId: string) {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT * FROM public.business_availability_preferences
      WHERE user_id = ${userId}::uuid
      LIMIT 1
    `.catch(() => []);

    if (rows.length === 0) return null;
    const r = rows[0];
    return {
      id: String(r.id),
      userId: String(r.user_id),
      timezone: String(r.timezone || 'Asia/Ho_Chi_Minh'),
      workingDays: r.working_days || [1, 2, 3, 4, 5],
      workingHours: r.working_hours || [],
      minimumNoticeMinutes: Number(r.minimum_notice_minutes || 60),
      defaultMeetingDurationMinutes: Number(
        r.default_meeting_duration_minutes || 30,
      ),
      bufferBeforeMinutes: Number(r.buffer_before_minutes || 0),
      bufferAfterMinutes: Number(r.buffer_after_minutes || 0),
      version: Number(r.version || 1),
    };
  }

  async updateAvailabilityPreferences(userId: string, data: any) {
    const rows = await this.prisma.$queryRaw<any[]>`
      INSERT INTO public.business_availability_preferences (
        user_id, timezone, working_days, working_hours, minimum_notice_minutes,
        default_meeting_duration_minutes, buffer_before_minutes, buffer_after_minutes,
        version, updated_at
      )
      VALUES (
        ${userId}::uuid,
        ${data.timezone},
        ${data.workingDays}::int[],
        ${JSON.stringify(data.workingHours)}::jsonb,
        ${data.minimumNoticeMinutes},
        ${data.defaultMeetingDurationMinutes},
        ${data.bufferBeforeMinutes},
        ${data.bufferAfterMinutes},
        1,
        now()
      )
      ON CONFLICT (user_id) DO UPDATE SET
        timezone = EXCLUDED.timezone,
        working_days = EXCLUDED.working_days,
        working_hours = EXCLUDED.working_hours,
        minimum_notice_minutes = EXCLUDED.minimum_notice_minutes,
        default_meeting_duration_minutes = EXCLUDED.default_meeting_duration_minutes,
        buffer_before_minutes = EXCLUDED.buffer_before_minutes,
        buffer_after_minutes = EXCLUDED.buffer_after_minutes,
        version = public.business_availability_preferences.version + 1,
        updated_at = now()
      RETURNING *
    `.catch(() => []);

    if (rows.length === 0) {
      return {
        id: `pref-${userId}`,
        userId,
        timezone: data.timezone,
        workingDays: data.workingDays,
        workingHours: data.workingHours,
        minimumNoticeMinutes: data.minimumNoticeMinutes,
        defaultMeetingDurationMinutes: data.defaultMeetingDurationMinutes,
        bufferBeforeMinutes: data.bufferBeforeMinutes,
        bufferAfterMinutes: data.bufferAfterMinutes,
        version: 1,
      };
    }
    const r = rows[0];
    return {
      id: String(r.id),
      userId: String(r.user_id),
      timezone: String(r.timezone),
      workingDays: r.working_days || [],
      workingHours: r.working_hours || [],
      minimumNoticeMinutes: Number(r.minimum_notice_minutes),
      defaultMeetingDurationMinutes: Number(r.default_meeting_duration_minutes),
      bufferBeforeMinutes: Number(r.buffer_before_minutes),
      bufferAfterMinutes: Number(r.buffer_after_minutes),
      version: Number(r.version || 1),
    };
  }

  async listTimeProposals(meetingId: string) {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT * FROM public.business_meeting_time_proposals
      WHERE meeting_id = ${meetingId}::uuid
      ORDER BY start_at ASC
    `.catch(() => []);

    return rows.map((r) => ({
      id: String(r.id),
      meetingId: String(r.meeting_id),
      proposedByUserId: String(r.proposed_by_user_id),
      startAt: String(r.start_at),
      endAt: String(r.end_at),
      timezone: String(r.timezone),
      status: r.status,
      version: Number(r.version ?? 1),
      createdAt: String(r.created_at),
      updatedAt: String(r.updated_at),
    }));
  }

  async createTimeProposals(userId: string, data: any) {
    const meetingId = data.meetingId;
    const proposals = data.proposals || [];
    const results: any[] = [];

    for (const p of proposals) {
      const rows = await this.prisma.$queryRaw<any[]>`
        INSERT INTO public.business_meeting_time_proposals (
          meeting_id, proposed_by_user_id, start_at, end_at, timezone, status, created_at, updated_at
        )
        VALUES (
          ${meetingId}::uuid,
          ${userId}::uuid,
          ${p.startAt}::timestamptz,
          ${p.endAt}::timestamptz,
          ${p.timezone},
          'proposed',
          now(),
          now()
        )
        RETURNING *
      `.catch(() => []);
      if (rows.length > 0) {
        const r = rows[0];
        results.push({
          id: String(r.id),
          meetingId: String(r.meeting_id),
          proposedByUserId: String(r.proposed_by_user_id),
          startAt: String(r.start_at),
          endAt: String(r.end_at),
          timezone: String(r.timezone),
          status: r.status,
          version: Number(r.version ?? 1),
          createdAt: String(r.created_at),
          updatedAt: String(r.updated_at),
        });
      }
    }
    return results;
  }

  async respondToTimeProposal(
    userId: string,
    proposalId: string,
    response: string,
  ) {
    const rows = await this.prisma.$queryRaw<any[]>`
      INSERT INTO public.business_meeting_time_proposal_responses (
        proposal_id, participant_id, response, responded_at
      )
      VALUES (
        ${proposalId}::uuid,
        ${userId}::uuid,
        ${response},
        now()
      )
      ON CONFLICT (proposal_id, participant_id) DO UPDATE SET
        response = EXCLUDED.response,
        responded_at = now()
      RETURNING *
    `.catch(() => []);

    if (rows.length === 0) {
      return {
        id: `resp-${Date.now()}`,
        proposalId,
        participantId: userId,
        response,
        respondedAt: new Date().toISOString(),
      };
    }
    const r = rows[0];
    return {
      id: String(r.id),
      proposalId: String(r.proposal_id),
      participantId: String(r.participant_id),
      response: r.response,
      respondedAt: String(r.responded_at),
    };
  }

  async selectTimeProposal(userId: string, proposalId: string) {
    const rows = await this.prisma.$queryRaw<any[]>`
      UPDATE public.business_meeting_time_proposals
      SET status = 'selected', updated_at = now()
      WHERE id = ${proposalId}::uuid
      RETURNING *
    `.catch(() => []);

    if (rows.length === 0) {
      throw new NotFoundException('Không tìm thấy đề xuất thời gian');
    }
    const r = rows[0];
    return {
      id: String(r.id),
      meetingId: String(r.meeting_id),
      proposedByUserId: String(r.proposed_by_user_id),
      startAt: String(r.start_at),
      endAt: String(r.end_at),
      timezone: String(r.timezone),
      status: r.status,
      version: Number(r.version ?? 1),
      createdAt: String(r.created_at),
      updatedAt: String(r.updated_at),
    };
  }

  async listProjections(meetingId: string) {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT * FROM public.business_meeting_calendar_projections
      WHERE meeting_id = ${meetingId}::uuid
    `.catch(() => []);

    return rows.map((r) => ({
      id: String(r.id),
      meetingId: String(r.meeting_id),
      participantUserId: String(r.participant_user_id),
      provider: r.provider,
      syncStatus: r.sync_status,
      lastSyncedAt: r.last_synced_at ? String(r.last_synced_at) : null,
      lastErrorCode: r.last_error_code ? String(r.last_error_code) : null,
      retryCount: Number(r.retry_count ?? 0),
    }));
  }

  /**
   * Cancel meeting (1-on-1 or Workspace Meeting) with reason, notifications & inbox messages
   */
  async cancelMeeting(
    userId: string,
    meetingId: string,
    data: { reason: string },
  ) {
    const reason = (data.reason || '').trim();
    if (!reason) {
      throw new BadRequestException('Vui lòng nhập lý do hủy cuộc gặp');
    }

    const meetingRows = await this.prisma.$queryRaw<any[]>`
      SELECT * FROM public.business_meetings WHERE id = ${meetingId}::uuid LIMIT 1
    `.catch(() => []);

    if (meetingRows.length === 0) {
      throw new NotFoundException('Không tìm thấy cuộc gặp / cuộc họp');
    }

    const meeting = meetingRows[0];

    // Check if caller is a participant
    const participants: any[] = (await this.prisma.$queryRaw<any[]>`
      SELECT p.*, u.full_name as user_name, u.email as user_email, m.code as member_code
      FROM public.business_meeting_participants p
      LEFT JOIN public.vione_users u ON u.id = p.user_id
      LEFT JOIN public.members m ON m.user_id = p.user_id
      WHERE p.meeting_id = ${meetingId}::uuid
    `.catch(() => [])) || [];

    const isParticipant = participants.some(
      (p: any) => String(p.user_id) === userId,
    );
    if (!isParticipant && meeting.created_by_user_id !== userId) {
      throw new ForbiddenException('Bạn không có quyền hủy cuộc gặp này');
    }

    // 1. Update meeting status to cancelled
    await this.prisma.$executeRaw`
      UPDATE public.business_meetings
      SET status = 'cancelled', updated_at = now()
      WHERE id = ${meetingId}::uuid
    `;

    // 2. Fetch sender name
    const sender = participants.find((p: any) => String(p.user_id) === userId);
    const senderName = sender?.user_name || 'Đối tác';
    const meetingTitle = meeting.title || 'Cuộc gặp gỡ kết nối';

    const notifTitle = `[HỦY CUỘC HỌP / CUỘC GẶP] ${meetingTitle}`;
    const notifBody = `Cuộc gặp "${meetingTitle}" đã bị hủy bởi ${senderName}.\nLý do: "${reason}".\nTrân trọng cáo lỗi cùng Quý đối tác vì sự bất tiện này.`;

    // 3. Notify & send messages to all other participants
    for (const p of participants) {
      const targetUserId = String(p.user_id);
      if (targetUserId === userId) continue; // skip sender

      const targetMemberCode = p.member_code
        ? String(p.member_code).toLowerCase()
        : null;

      // 3a. Direct inbox message (public.messages)
      const directMsg = `[THÔNG BÁO HỦY CUỘC GẶP]\nChào Anh/Chị ${p.user_name || 'Hội viên'},\n${notifBody}`;
      if (targetMemberCode) {
        await this.prisma.$executeRaw`
          INSERT INTO public.messages (id, from_id, to_id, text, created_at)
          VALUES (gen_random_uuid(), ${userId}, ${targetMemberCode}, ${directMsg}, NOW())
        `.catch(() => {});
      }
      await this.prisma.$executeRaw`
        INSERT INTO public.messages (id, from_id, to_id, text, created_at)
        VALUES (gen_random_uuid(), ${userId}, ${targetUserId}, ${directMsg}, NOW())
      `.catch(() => {});

      // 3b. App bell push notification (public.business_notifications)
      const dedupeKey = `cancel_meeting_${meetingId}_${targetUserId}_${Date.now()}`;
      const safeData = JSON.stringify({
        meetingId,
        meetingTitle,
        reason,
        cancelledBy: senderName,
      });

      await this.prisma
        .$executeRawUnsafe(
          `
        INSERT INTO public.business_notifications (
          id, recipient_user_id, source_domain, source_record_id, dedupe_key, event_kind, notification_kind,
          title_key, body_key, safe_display_data, priority, status, app_scope, target_app, created_at, updated_at
        ) VALUES (
          gen_random_uuid(), $1::uuid, 'meeting', $2, $3, 'meeting_cancelled', 'meeting_cancelled',
          $4, $5, $6::jsonb, 'urgent', 'delivered', 'all', 'all', now(), now()
        )
      `,
          targetUserId,
          meetingId,
          dedupeKey,
          notifTitle,
          notifBody,
          safeData,
        )
        .catch(() => {});
    }

    return {
      ok: true,
      cancelled: true,
      notifiedCount: participants.length - 1,
    };
  }

  async deleteMeeting(userId: string, id: string) {
    if (!id) throw new BadRequestException('ID is required');

    // 1. Delete associated business meeting child records
    await this.prisma.$executeRaw`
      DELETE FROM public.business_meeting_follow_ups WHERE meeting_id = ${id}::uuid
    `.catch(() => {});
    await this.prisma.$executeRaw`
      DELETE FROM public.business_meeting_agenda_items WHERE meeting_id = ${id}::uuid
    `.catch(() => {});
    await this.prisma.$executeRaw`
      DELETE FROM public.business_meeting_shared_notes WHERE meeting_id = ${id}::uuid
    `.catch(() => {});
    await this.prisma.$executeRaw`
      DELETE FROM public.business_meeting_private_notes WHERE meeting_id = ${id}::uuid
    `.catch(() => {});
    await this.prisma.$executeRaw`
      DELETE FROM public.business_meeting_outcomes WHERE meeting_id = ${id}::uuid
    `.catch(() => {});
    await this.prisma.$executeRaw`
      DELETE FROM public.business_meeting_calendar_projections WHERE meeting_id = ${id}::uuid
    `.catch(() => {});
    await this.prisma.$executeRaw`
      DELETE FROM public.business_meeting_time_proposal_responses WHERE proposal_id IN (
        SELECT id FROM public.business_meeting_time_proposals WHERE meeting_id = ${id}::uuid
      )
    `.catch(() => {});
    await this.prisma.$executeRaw`
      DELETE FROM public.business_meeting_time_proposals WHERE meeting_id = ${id}::uuid
    `.catch(() => {});
    await this.prisma.$executeRaw`
      DELETE FROM public.business_meeting_events WHERE meeting_id = ${id}::uuid
    `.catch(() => {});
    await this.prisma.$executeRaw`
      DELETE FROM public.business_meeting_proposals WHERE meeting_id = ${id}::uuid
    `.catch(() => {});
    await this.prisma.$executeRaw`
      DELETE FROM public.business_meeting_participants WHERE meeting_id = ${id}::uuid
    `.catch(() => {});

    // 2. Delete from business_meetings
    await this.prisma.$executeRaw`
      DELETE FROM public.business_meetings WHERE id = ${id}::uuid
    `.catch(() => {});

    // 3. Delete from public.meetings where code = id or id::text = id
    await this.prisma.$executeRaw`
      DELETE FROM public.meetings WHERE code = ${id} OR id::text = ${id}
    `.catch(() => {});

    return { ok: true, id, deleted: true };
  }
}
