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
import { MeetingsRepository } from './meetings.repository';
import { CreateMeetingDto, UpdateMeetingDto, ConnectionAppointmentDto, UpdateMeetingStatusDto } from './dto';
import * as crypto from 'crypto';

export { CreateMeetingDto, UpdateMeetingDto, ConnectionAppointmentDto, UpdateMeetingStatusDto };

import { MailService } from '../mail/mail.service';

function isUuid(val: any): boolean {
  if (!val || typeof val !== 'string') return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(val.trim());
}

function toValidUuid(val: any): string {
  if (isUuid(val)) return val.trim();
  const hash = crypto.createHash('md5').update(String(val || 'fallback')).digest('hex');
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-4${hash.slice(13, 16)}-a${hash.slice(17, 20)}-${hash.slice(20, 32)}`;
}

@Injectable()
export class MeetingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly meetingsRepo: MeetingsRepository,
    @Optional() private readonly gateway?: ConnectAppGateway,
    @Optional() private readonly mailService?: MailService,
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
    const isOnlineRequested = Boolean(data.zoomUrl || data.venueType === 'online' || String(data.location || data.venue || '').toLowerCase().startsWith('http'));
    const venueType = data.venueType || (isOnlineRequested ? 'online' : 'offline');
    const venue = (data.venue || data.location || (isOnlineRequested ? (data.zoomUrl || 'Họp trực tuyến') : 'Văn phòng Hiệp hội CEO 1983, Tòa V-Tower, 649 Kim Mã, Hà Nội')).trim();
    const notes = (data.notes || '').trim();

    // Validate địa điểm cuộc họp trực tiếp
    const isOffline = venueType === 'offline' || (!isOnlineRequested && venue && !venue.toLowerCase().startsWith('http'));
    if (isOffline && venue && !isOnlineRequested) {
      const conflictMeetings = await this.prisma.$queryRawUnsafe<any[]>(
        `SELECT code, title, date, time, location FROM public.meetings
         WHERE date = $1::date AND time = $2 AND status != 'cancelled' AND LOWER(TRIM(location)) = LOWER(TRIM($3))
         LIMIT 1`,
        date,
        time,
        venue,
      ).catch(() => []);

      if (conflictMeetings.length > 0) {
        const conf = conflictMeetings[0];
        const [h, m] = (time || '09:30').split(':').map(Number);
        const endHour = String((h || 9) + 2).padStart(2, '0');
        const endMin = String(m || 0).padStart(2, '0');
        const dObj = new Date(date);
        const dayFormatted = `${String(dObj.getDate()).padStart(2, '0')}/${String(dObj.getMonth() + 1).padStart(2, '0')}/${dObj.getFullYear()}`;
        const nextAvailableTime = `${endHour}:${endMin} ngày ${dayFormatted}`;

        if (!data.confirmOverlap && !data.forceLocation) {
          throw new BadRequestException(
            `LOCATION_CONFLICT: Địa điểm này đang trùng với cuộc họp "${conf.title}", sau thời gian ${nextAvailableTime} có thể đăng ký được.`,
          );
        }
      }
    }

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

    // Validate cảnh báo khi đối tác/người dùng đã có cuộc họp khác trong cùng khung thời gian
    const confirmOverlap = Boolean(data.confirmOverlap);
    if (!confirmOverlap && partnerUserId) {
      const overlapMeetings = await this.prisma.$queryRawUnsafe<any[]>(
        `SELECT m.title FROM public.business_meetings m
         JOIN public.business_meeting_participants p ON p.meeting_id = m.id
         WHERE p.user_id = $1::uuid AND m.status IN ('confirmed', 'scheduled')
           AND m.description LIKE '%Thời gian: ' || $2 || '%'
         LIMIT 1`,
        partnerUserId,
        `${time} ngày ${date}`,
      ).catch(() => []);

      if (overlapMeetings.length > 0) {
        throw new BadRequestException(
          `OVERLAP_CONFIRM_REQUIRED: Bạn đang đăng ký cuộc họp "${title}" cùng thời gian với cuộc họp "${overlapMeetings[0].title}". Bạn có chắc muốn đăng ký thêm không?`,
        );
      }
    }

    // 2. Tạo bản ghi cuộc họp trong public.business_meetings
    const genMeetingId = crypto.randomUUID();
    const [h, m] = (time || '09:30').split(':').map(Number);
    const startDt = new Date(`${date}T${String(h || 9).padStart(2, '0')}:${String(m || 0).padStart(2, '0')}:00Z`);
    const endDt = new Date(startDt.getTime() + 60 * 60 * 1000);

    const meetingRows = await this.prisma.$queryRawUnsafe<any[]>(`
      INSERT INTO public.business_meetings (
        id, title, description, meeting_type, status, timezone, created_by_user_id, organizer_user_id,
        scheduled_start_at, scheduled_end_at, source_type, association_id, created_at, updated_at
      ) VALUES (
        $1::uuid, $2, $3, 'networking'::public.business_meeting_type, 'proposed'::public.business_meeting_status,
        'Asia/Ho_Chi_Minh', $4::uuid, $4::uuid, $5, $6, 'association'::public.business_meeting_source_type,
        'c1983000-0000-4000-8000-000000001983'::uuid, NOW(), NOW()
      ) RETURNING id
    `, genMeetingId, title, `Đối tác: ${partnerName} (${partnerCompany}). Địa điểm: ${venue}. Ghi chú: ${notes}`, userId, startDt, endDt).catch((err) => {
      console.warn('business_meetings insert warning:', err?.message);
      return [];
    });

    const meetingId = meetingRows[0]?.id ? String(meetingRows[0].id) : genMeetingId;

    // 3. Ghi nhận người tổ chức (host -> organizer)
    await this.prisma.$executeRawUnsafe(`
      INSERT INTO public.business_meeting_participants (
        id, meeting_id, user_id, role, response_status, created_at, updated_at
      ) VALUES (
        gen_random_uuid(), $1::uuid, $2::uuid, 'organizer'::public.business_meeting_participant_role, 'accepted'::public.business_meeting_response_status, NOW(), NOW()
      )
    `, meetingId, userId).catch((err) => console.warn('host participant insert warning:', err?.message));

    // 4. Ghi nhận người được mời (invitee -> required)
    if (partnerUserId) {
      await this.prisma.$executeRawUnsafe(`
        INSERT INTO public.business_meeting_participants (
          id, meeting_id, user_id, role, response_status, created_at, updated_at
        ) VALUES (
          gen_random_uuid(), $1::uuid, $2::uuid, 'required'::public.business_meeting_participant_role, 'pending'::public.business_meeting_response_status, NOW(), NOW()
        )
      `, meetingId, partnerUserId).catch((err) => console.warn('invitee participant insert warning:', err?.message));
    }

    // 4b. Đồng bộ trực tiếp vào CRM public.meetings để hiển thị tức thì trên cả 2 màn hình CRM (/meetings và /business-connect/meetings)
    const connCode = data.code || `MT-CONN-${genMeetingId.slice(0, 8).toUpperCase()}`;
    const endH = String((h || 9) + 1).padStart(2, '0');
    const endM = String(m || 0).padStart(2, '0');
    const timeRange = data.time && data.time.includes('-') ? data.time : `${time} - ${endH}:${endM}`;
    const meetingType = data.type || 'general';
    const department = data.department || 'Hẹn gặp kết nối 1-1';
    const attendees = typeof data.attendees === 'number' ? data.attendees : 2;
    const meetingStatus = data.status || 'upcoming';
    const targetMembers = data.targetMembers !== undefined ? data.targetMembers : {
      hostName,
      partnerName,
      partnerPhone,
      partnerCompany,
      venue,
      venueType,
      notes,
      onlineUrl: isOffline ? '' : (data.zoomUrl || venue),
    };
    const zoomUrl = data.zoomUrl || (isOffline ? '' : venue);
    const cancelReason = data.cancelReason || null;

    await this.prisma.$executeRawUnsafe(`
      INSERT INTO public.meetings (
        id, code, title, type, date, time, location, attendees, status, department, target_members, zoom_url, cancel_reason, association_id, created_at, updated_at
      ) VALUES (
        $1::uuid, $2, $3, $4, $5::date, $6, $7, $8, $9, $10,
        $11::jsonb, $12, $13, 'c1983000-0000-4000-8000-000000001983'::uuid, NOW(), NOW()
      ) ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        type = EXCLUDED.type,
        date = EXCLUDED.date,
        time = EXCLUDED.time,
        location = EXCLUDED.location,
        attendees = EXCLUDED.attendees,
        status = EXCLUDED.status,
        department = EXCLUDED.department,
        target_members = EXCLUDED.target_members,
        zoom_url = EXCLUDED.zoom_url,
        cancel_reason = EXCLUDED.cancel_reason,
        updated_at = NOW()
    `,
      meetingId,
      connCode,
      title,
      meetingType,
      date,
      timeRange,
      venue,
      attendees,
      meetingStatus,
      department,
      JSON.stringify(targetMembers),
      zoomUrl,
      cancelReason
    ).catch((err) => console.warn('meetings sync warning:', err?.message));

    // 5. TRIGGER PUSH NOTIFICATION CHO CUỘC HỌP OFFLINE
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

    // 6. Gửi email thông báo cuộc họp (Online / Offline) cho hội viên và người tham dự
    if (this.mailService) {
      try {
        let recipientEmail = '';
        if (partnerPhone) {
          const m = await this.prisma.$queryRaw<any[]>`SELECT email FROM public.members WHERE phone = ${partnerPhone} OR phone = ${partnerPhone.replace(/^0/, '+84')} LIMIT 1`.catch(() => []);
          if (m[0]?.email) recipientEmail = m[0].email;
        }
        if (!recipientEmail && partnerUserId) {
          const u = await this.prisma.$queryRaw<any[]>`SELECT email FROM public.vione_users WHERE id = ${partnerUserId}::uuid LIMIT 1`.catch(() => []);
          if (u[0]?.email) recipientEmail = u[0].email;
        }
        const targetEmail = (recipientEmail || process.env.ADMIN_NOTIFY_EMAIL || 'vupv090120@gmail.com').trim();

        // Gửi email mời họp bất đồng bộ trong background để API tạo cuộc họp phản hồi tức thì
        void (async () => {
          try {
            if (this.mailService) {
              await this.mailService.sendMeetingInvitationEmail({
                to: targetEmail,
                recipientName: partnerName || 'Quý Hội viên CEO 1983',
                meetingTitle: title,
                meetingCode: connCode,
                meetingType: isOffline ? 'offline' : 'online',
                date,
                time,
                venueOrLink: venue,
                hostName,
                notes,
              });
            }

            // Gửi bản sao cho người tạo / người chủ trì cuộc họp nếu có email
            const hostUser = await this.prisma.$queryRaw<any[]>`SELECT email FROM public.vione_users WHERE id = ${userId}::uuid LIMIT 1`.catch(() => []);
            if (this.mailService && hostUser[0]?.email && hostUser[0].email.toLowerCase() !== targetEmail.toLowerCase()) {
              await this.mailService.sendMeetingInvitationEmail({
                to: hostUser[0].email,
                recipientName: hostName,
                meetingTitle: title,
                meetingCode: connCode,
                meetingType: isOffline ? 'offline' : 'online',
                date,
                time,
                venueOrLink: venue,
                hostName,
                notes,
              });
            }
          } catch (err: any) {
            console.warn('[createMeeting] Email background dispatch error:', err?.message);
          }
        })();
      } catch (err: any) {
        console.warn('[createMeeting] Email setup error:', err?.message);
      }
    }

    return {
      success: true,
      id: meetingId,
      code: connCode,
      title,
      type: meetingType,
      date,
      time: timeRange,
      location: venue,
      venue,
      venueType,
      attendees,
      status: meetingStatus,
      department,
      targetMembers,
      target_members: targetMembers,
      zoomUrl,
      zoom_url: zoomUrl,
      cancelReason,
      cancel_reason: cancelReason,
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

    const isMeetingUuid = isUuid(meetingId);
    let meetingRows = isMeetingUuid
      ? await this.prisma.$queryRaw<any[]>`
          SELECT * FROM public.business_meetings WHERE id = ${meetingId}::uuid LIMIT 1
        `.catch(() => [])
      : [];

    const crmMeetings = await this.prisma.$queryRawUnsafe<any[]>(`
      SELECT * FROM public.meetings WHERE code = $1 OR id::text = $1 LIMIT 1
    `, meetingId).catch(() => []);

    if (meetingRows.length === 0 && crmMeetings.length === 0) {
      throw new NotFoundException('Không tìm thấy cuộc gặp / cuộc họp');
    }

    // 1. Always update public.meetings if present
    await this.prisma.$executeRawUnsafe(`
      UPDATE public.meetings
      SET status = 'cancelled', cancel_reason = $1, updated_at = NOW()
      WHERE code = $2 OR id::text = $2
    `, reason, meetingId).catch(() => {});

    // If only found in CRM meetings and not in business_meetings, return success
    if (meetingRows.length === 0) {
      if (this.gateway) {
        this.gateway.emitToAll('vba.meeting.changed', { id: meetingId, status: 'cancelled' });
      }
      return {
        ok: true,
        cancelled: true,
        notifiedCount: 0,
      };
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
      // Allow admin / manager roles if needed, otherwise verify
    }

    // 1b. Update business_meetings status to cancelled
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

  async updateMeeting(userId: string, id: string, data: any) {
    if (!id) throw new BadRequestException('ID is required');

    const title = data.title ? String(data.title).trim() : undefined;
    const date = data.date ? String(data.date).trim() : undefined;
    const time = data.time ? String(data.time).trim() : undefined;
    const venueType = data.venueType || (data.onlineUrl ? 'online' : 'offline');
    const venue = data.venue ? String(data.venue).trim() : (data.location ? String(data.location).trim() : undefined);
    const onlineUrl = data.onlineUrl ? String(data.onlineUrl).trim() : (data.zoomUrl ? String(data.zoomUrl).trim() : undefined);
    const notes = data.notes !== undefined ? String(data.notes).trim() : undefined;
    const status = data.status ? String(data.status).trim() : undefined;
    const meetingType = data.type ? String(data.type).trim() : undefined;
    const department = data.department !== undefined ? String(data.department).trim() : undefined;
    const attendees = typeof data.attendees === 'number' ? data.attendees : undefined;
    const cancelReason = data.cancelReason !== undefined ? data.cancelReason : undefined;

    // 1. Update public.meetings
    const existingCrm = await this.prisma.$queryRawUnsafe<any[]>(`
      SELECT id, code, title, type, date, time, location, attendees, status, department, target_members, zoom_url, cancel_reason FROM public.meetings
      WHERE id::text = $1 OR code = $1 LIMIT 1
    `, id).catch(() => []);

    let updatedRow: any = null;

    if (existingCrm.length > 0) {
      const prev = existingCrm[0];
      const prevTm = typeof prev.target_members === 'object' && prev.target_members !== null ? prev.target_members : {};
      const newTm = data.targetMembers !== undefined
        ? data.targetMembers
        : {
            ...prevTm,
            ...(data.hostName && { hostName: data.hostName }),
            ...(data.partnerName && { partnerName: data.partnerName }),
            ...(data.partnerPhone && { partnerPhone: data.partnerPhone }),
            ...(data.partnerCompany && { partnerCompany: data.partnerCompany }),
            ...(venue && { venue }),
            ...(venueType && { venueType }),
            ...(onlineUrl !== undefined && { onlineUrl }),
            ...(notes !== undefined && { notes }),
          };

      const updatedRows = await this.prisma.$queryRawUnsafe<any[]>(`
        UPDATE public.meetings
        SET
          title = COALESCE($1, title),
          date = COALESCE($2::date, date),
          time = COALESCE($3, time),
          location = COALESCE($4, location),
          status = COALESCE($5, status),
          target_members = $6::jsonb,
          zoom_url = COALESCE($7, zoom_url),
          type = COALESCE($8, type),
          department = COALESCE($9, department),
          attendees = COALESCE($10, attendees),
          cancel_reason = COALESCE($11, cancel_reason),
          updated_at = NOW()
        WHERE id::text = $12 OR code = $12
        RETURNING *
      `,
        title || null,
        date || null,
        time || null,
        venue || null,
        status || null,
        JSON.stringify(newTm),
        onlineUrl !== undefined ? onlineUrl : (venueType === 'online' ? venue : null),
        meetingType || null,
        department !== undefined ? department : null,
        attendees ?? null,
        cancelReason !== undefined ? cancelReason : null,
        id
      ).catch((err) => {
        console.warn('update public.meetings error:', err?.message);
        return [];
      });
      if (updatedRows && updatedRows.length > 0) {
        updatedRow = updatedRows[0];
      }
    }

    // 2. Update public.business_meetings
    const isMeetingUuid = isUuid(id);
    if (isMeetingUuid) {
      await this.prisma.$executeRawUnsafe(`
        UPDATE public.business_meetings
        SET
          title = COALESCE($1, title),
          status = COALESCE($2::public.business_meeting_status, status),
          updated_at = NOW()
        WHERE id = $3::uuid
      `,
        title || null,
        status === 'confirmed' || status === 'upcoming' ? 'confirmed' : status === 'cancelled' ? 'cancelled' : null,
        id
      ).catch(() => {});
    }

    if (this.gateway) {
      this.gateway.emitToAll('vba.meeting.changed', { id, title, status });
    }

    return {
      ok: true,
      id,
      updated: true,
      row: updatedRow,
    };
  }

  /**
   * Phục vụ hiển thị trên tab CRM "Cuộc Hẹn Giao Thương 1-on-1" và mobile
   */
  async getConnectionAppointments(userId: string) {
    try {
      // 0. Thông tin thành viên hiện tại
      const safeUserId = isUuid(userId) ? userId : null;
      const userMember = await this.prisma.$queryRawUnsafe<any[]>(`
        SELECT m.id, m.code, m.user_id, m.phone, m.name, m.executive_role, m.department, u.role as vione_role, mem.role as membership_role
        FROM public.members m
        LEFT JOIN public.vione_users u ON u.id = m.user_id
        LEFT JOIN public.memberships mem ON mem.user_id = m.user_id
        WHERE (${safeUserId ? 'm.user_id = $1::uuid OR' : ''} m.id::text = $2::text OR m.code = $2::text OR m.phone = $2::text)
        LIMIT 1
      `, ...(safeUserId ? [safeUserId, String(userId)] : [String(userId)])).catch(() => []);
      const myMemberId = userMember[0]?.id ? String(userMember[0].id) : null;
      const myMemberCode = userMember[0]?.code ? String(userMember[0].code) : null;
      const myUserId = userMember[0]?.user_id ? String(userMember[0].user_id) : String(userId);
      const myPhone = userMember[0]?.phone ? String(userMember[0].phone) : null;
      const myName = userMember[0]?.name ? String(userMember[0].name) : null;

      const exRole = String(userMember[0]?.executive_role || '').toLowerCase();
      const vRole = String(userMember[0]?.vione_role || '').toLowerCase();
      const mRole = String(userMember[0]?.membership_role || '').toLowerCase();
      const uDept = String(userMember[0]?.department || '').toLowerCase();
      const isAdminUser = 
        exRole.includes('admin') || 
        exRole.includes('president') || 
        exRole.includes('chủ tịch') || 
        exRole.includes('tong_thu_ky') || 
        exRole.includes('thư ký') || 
        exRole.includes('ban_dieu_hanh') || 
        exRole.includes('điều hành') || 
        exRole.includes('truong_ban') || 
        uDept.includes('quản trị') ||
        uDept.includes('điều hành') ||
        uDept.includes('thư ký') ||
        vRole.includes('admin') || 
        vRole.includes('system') || 
        mRole.includes('admin') || 
        mRole.includes('owner') ||
        String(userId).startsWith('00000000') ||
        String(userMember[0]?.code) === 'M1983-000';

      const myIdentifiers = [
        myUserId,
        myMemberCode,
        myMemberId,
        myPhone,
        myName,
        userId,
      ].filter(Boolean).map(x => String(x).toLowerCase().trim());

      // 1. Lấy các cuộc họp 1-on-1 từ public.business_meetings
      const meetingRows = await this.prisma.$queryRawUnsafe<any[]>(`
        SELECT 
          m.id,
          m.title,
          m.description,
          m.meeting_type,
          m.status,
          m.scheduled_start_at,
          m.scheduled_end_at,
          m.created_at,
          m.updated_at,
          m.created_by_user_id,
          m.organizer_user_id,
          h.name as host_name,
          h.company_name as host_company,
          h.phone as host_phone,
          h.code as host_code,
          h.avatar as host_avatar
        FROM public.business_meetings m
        LEFT JOIN public.members h ON (h.user_id = m.created_by_user_id OR h.user_id = m.organizer_user_id OR h.id::text = m.created_by_user_id::text)
        WHERE m.meeting_type IN ('networking'::public.business_meeting_type, 'in_person'::public.business_meeting_type, 'video_call'::public.business_meeting_type)
           OR m.title ILIKE '%kết nối%' 
           OR m.title ILIKE '%1-on-1%' 
           OR m.title ILIKE '%1-1%'
           OR m.title ILIKE '%giao thương%'
           OR m.description ILIKE '%Đối tác:%'
        ORDER BY COALESCE(m.scheduled_start_at, m.created_at) DESC
        LIMIT 100
      `).catch((err) => {
        console.warn('business_meetings query warning:', err?.message);
        return [];
      });

      const meetingItems: any[] = [];
      const seenIds = new Set<string>();

      for (const m of meetingRows) {
        seenIds.add(String(m.id));

        // Query participants using flexible LEFT JOIN
        const participants = await this.prisma.$queryRawUnsafe<any[]>(`
          SELECT 
            p.role,
            p.response_status,
            p.user_id,
            mem.id as member_id,
            mem.name,
            mem.company_name as company,
            mem.phone,
            mem.code,
            mem.avatar as avatar_url
          FROM public.business_meeting_participants p
          LEFT JOIN public.members mem ON (mem.user_id = p.user_id OR mem.id::text = p.user_id::text OR mem.code = p.user_id::text)
          WHERE p.meeting_id = $1::uuid
        `, m.id).catch(() => [] as any[]) as any[];

        const hostPart = participants.find((p: any) => p.role === 'organizer' || p.role === 'host');
        const inviteePart = participants.find((p: any) => p.role === 'required' || p.role === 'invitee' || p.role === 'optional');

        const hostName = hostPart?.name || m.host_name || 'Lãnh đạo Ban Điều Hành';
        const hostCompany = hostPart?.company || m.host_company || 'Hiệp hội CEO 1983';
        const hostPhone = hostPart?.phone || m.host_phone || '';
        const hostCode = hostPart?.code || m.host_code || '';
        const hostAvatar = hostPart?.avatar_url || m.host_avatar || '';

        // Extract partner name / company / venue / notes from description if formatted
        let partnerName = inviteePart?.name || '';
        let partnerCompany = inviteePart?.company || '';
        let partnerPhone = inviteePart?.phone || '';
        let partnerCode = inviteePart?.code || '';
        let partnerAvatar = inviteePart?.avatar_url || '';
        let venue = 'Văn phòng Hiệp hội CEO 1983, Tòa V-Tower, 649 Kim Mã, Hà Nội';
        let notes = '';

        if (m.description) {
          const matchPartner = m.description.match(/Đối tác:\s*([^(.]+)(?:\(([^)]+)\))?/i);
          if (matchPartner) {
            if (!partnerName) partnerName = matchPartner[1]?.trim() || '';
            if (!partnerCompany && matchPartner[2]) partnerCompany = matchPartner[2]?.trim() || '';
          }
          const matchVenue = m.description.match(/Địa điểm:\s*([^.]+)/i);
          if (matchVenue) {
            venue = matchVenue[1]?.trim() || venue;
          }
          const matchNotes = m.description.match(/Mục đích:\s*([^.]+)/i) || m.description.match(/Ghi chú:\s*(.+)$/i);
          if (matchNotes) {
            notes = matchNotes[1]?.trim() || '';
          } else if (!matchPartner && !matchVenue) {
            notes = m.description;
          }
        }

        if (!partnerName) {
          partnerName = 'Hội viên đối tác';
        }

        const scheduledDate = m.scheduled_start_at 
          ? new Date(m.scheduled_start_at) 
          : (m.created_at ? new Date(m.created_at) : new Date());
        const dateStr = scheduledDate.toISOString().slice(0, 10);
        const timeStr = scheduledDate.toTimeString().slice(0, 5);

        const isOnline = venue.toLowerCase().includes('zoom') || 
                         venue.toLowerCase().includes('http') || 
                         venue.toLowerCase().includes('meet');

        const isUserHost = String(m.created_by_user_id).toLowerCase() === String(myUserId).toLowerCase() || 
                           String(m.organizer_user_id).toLowerCase() === String(myUserId).toLowerCase() || 
                           (hostPart && (
                             String(hostPart.user_id).toLowerCase() === String(myUserId).toLowerCase() ||
                             (myMemberCode && hostPart.code === myMemberCode) ||
                             (myPhone && hostPart.phone === myPhone) ||
                             myIdentifiers.includes(String(hostPart.user_id).toLowerCase())
                           )) ||
                           (myName && hostName.toLowerCase().includes(myName.toLowerCase())) ||
                           myIdentifiers.some(id => hostCode?.toLowerCase() === id || hostPhone === id);
        
        const isUserInvitee = !isUserHost && (
          (inviteePart && (
            String(inviteePart.user_id).toLowerCase() === String(myUserId).toLowerCase() ||
            (myMemberCode && inviteePart.code === myMemberCode) ||
            (myPhone && inviteePart.phone === myPhone) ||
            myIdentifiers.includes(String(inviteePart.user_id).toLowerCase())
          )) ||
          (myName && partnerName.toLowerCase().includes(myName.toLowerCase())) ||
          (m.description && myName && m.description.toLowerCase().includes(myName.toLowerCase())) ||
          (m.description && myPhone && m.description.includes(myPhone)) ||
          myIdentifiers.some(id => partnerCode?.toLowerCase() === id || partnerPhone === id || (m.description && m.description.toLowerCase().includes(id)))
        );

        if (!isAdminUser && !isUserHost && !isUserInvitee) {
          const isGeneral = participants.length <= 1;
          if (!isGeneral) continue;
        }

        meetingItems.push({
          id: String(m.id),
          title: m.title || 'Cuộc gặp kết nối 1-on-1',
          hostName,
          hostCompany,
          hostPhone,
          hostCode,
          hostAvatar,
          partnerName,
          partnerCompany,
          partnerPhone,
          partnerCode,
          partnerAvatar,
          date: dateStr,
          time: timeStr,
          venueType: isOnline ? 'online' : 'offline',
          venue,
          onlineUrl: isOnline ? venue : undefined,
          notes: notes || 'Gặp gỡ trao đổi cơ hội hợp tác và giao thương B2B',
          status: m.status || 'scheduled',
          source: 'business_meeting',
          createdAt: m.created_at || new Date().toISOString(),
          isUserHost,
          isUserInvitee,
        });
      }

      // 2. Lấy thêm các cuộc hẹn kết nối từ CRM public.meetings
      const crmMeetings = await this.prisma.$queryRawUnsafe<any[]>(`
        SELECT 
          id, code, title, date, time, location, notes, status, department, target_members, zoom_url, created_at, updated_at
        FROM public.meetings
        ORDER BY date DESC, created_at DESC
        LIMIT 100
      `).catch(() => []);

      for (const cm of crmMeetings) {
        const cmCode = cm.code || String(cm.id);
        if (seenIds.has(cmCode) || seenIds.has(String(cm.id))) continue;

        const tm = cm.target_members;
        let hostName = 'Hội viên kết nối';
        let hostCompany = 'Hiệp hội CEO 1983';
        let hostPhone = '';
        let partnerName = 'Đối tác';
        let partnerCompany = 'Doanh nghiệp CEO 1983';
        let partnerPhone = '';
        let venue = cm.location || cm.zoom_url || 'Văn phòng Hiệp hội CEO 1983';
        let venueType = cm.zoom_url ? 'online' : 'offline';
        let onlineUrl = cm.zoom_url || undefined;
        let notes = cm.notes || 'Hẹn gặp kết nối giao thương B2B';

        if (Array.isArray(tm) && tm.length >= 2) {
          hostName = tm[0]?.name || hostName;
          hostCompany = tm[0]?.company || hostCompany;
          hostPhone = tm[0]?.phone || hostPhone;
          partnerName = tm[1]?.name || partnerName;
          partnerCompany = tm[1]?.company || partnerCompany;
          partnerPhone = tm[1]?.phone || partnerPhone;
        } else if (tm && typeof tm === 'object' && !Array.isArray(tm)) {
          hostName = tm.hostName || hostName;
          hostCompany = tm.hostCompany || hostCompany;
          hostPhone = tm.hostPhone || hostPhone;
          partnerName = tm.partnerName || partnerName;
          partnerCompany = tm.partnerCompany || partnerCompany;
          partnerPhone = tm.partnerPhone || partnerPhone;
          if (tm.venue) venue = tm.venue;
          if (tm.venueType) venueType = tm.venueType;
          if (tm.onlineUrl) onlineUrl = tm.onlineUrl;
          if (tm.notes) notes = tm.notes;
        }

        const isUserHost = myIdentifiers.some(id => 
          (hostName && hostName.toLowerCase().includes(id)) || 
          (hostCompany && hostCompany.toLowerCase().includes(id)) ||
          (hostPhone && hostPhone.includes(id)) ||
          (Array.isArray(tm) && tm[0]?.code?.toLowerCase() === id) ||
          (Array.isArray(tm) && tm[0]?.phone === id) ||
          (Array.isArray(tm) && tm[0]?.userId?.toLowerCase() === id) ||
          (tm && typeof tm === 'object' && !Array.isArray(tm) && (
            (tm.hostPhone && tm.hostPhone.includes(id)) ||
            (tm.hostCode && tm.hostCode.toLowerCase() === id) ||
            (tm.hostUserId && tm.hostUserId.toLowerCase() === id)
          ))
        );

        const isUserInvitee = !isUserHost && myIdentifiers.some(id => 
          (partnerName && partnerName.toLowerCase().includes(id)) || 
          (partnerCompany && partnerCompany.toLowerCase().includes(id)) ||
          (partnerPhone && partnerPhone.includes(id)) ||
          (Array.isArray(tm) && tm[1]?.code?.toLowerCase() === id) ||
          (Array.isArray(tm) && tm[1]?.phone === id) ||
          (Array.isArray(tm) && tm[1]?.userId?.toLowerCase() === id) ||
          (tm && typeof tm === 'object' && !Array.isArray(tm) && (
            (tm.partnerPhone && tm.partnerPhone.includes(id)) ||
            (tm.partnerCode && tm.partnerCode.toLowerCase() === id) ||
            (tm.partnerUserId && tm.partnerUserId.toLowerCase() === id)
          ))
        );

        if (!isAdminUser && !isUserHost && !isUserInvitee) {
          const isGeneral = !cm.target_members || (Array.isArray(cm.target_members) && cm.target_members.length === 0);
          if (!isGeneral) continue;
        }

        seenIds.add(cmCode);
        seenIds.add(String(cm.id));

        meetingItems.push({
          id: cmCode,
          title: cm.title || 'Hẹn gặp kết nối 1-1',
          hostName,
          hostCompany,
          hostPhone,
          hostCode: '',
          hostAvatar: '',
          partnerName,
          partnerCompany,
          partnerPhone,
          partnerCode: '',
          partnerAvatar: '',
          date: cm.date ? new Date(cm.date).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
          time: cm.time || '09:30 - 10:30',
          venueType,
          venue,
          onlineUrl,
          notes,
          status: cm.status === 'upcoming' || cm.status === 'confirmed' ? 'confirmed' : (cm.status || 'scheduled'),
          source: 'crm_meeting',
          createdAt: cm.created_at || new Date().toISOString(),
          isUserHost: Boolean(isUserHost),
          isUserInvitee: Boolean(isUserInvitee),
        });
      }

      // 3. Lấy các kết nối giao thương đã được chấp nhận (accepted) trong public.user_connections
      const acceptedConnections = await this.prisma.$queryRawUnsafe<any[]>(`
        SELECT 
          uc.id,
          uc.requester_user_id,
          uc.recipient_user_id,
          uc.status,
          uc.created_at,
          uc.responded_at,
          req.name as req_name,
          req.company_name as req_company,
          req.phone as req_phone,
          req.code as req_code,
          req.avatar as req_avatar,
          rec.name as rec_name,
          rec.company_name as rec_company,
          rec.phone as rec_phone,
          rec.code as rec_code,
          rec.avatar as rec_avatar
        FROM public.user_connections uc
        LEFT JOIN public.members req ON req.user_id = uc.requester_user_id
        LEFT JOIN public.members rec ON rec.user_id = uc.recipient_user_id
        WHERE uc.status = 'accepted'::public.global_connection_status
        ORDER BY COALESCE(uc.responded_at, uc.created_at) DESC
        LIMIT 50
      `).catch(() => []);

      for (const conn of acceptedConnections) {
        const connKey = `conn_${conn.id}`;
        if (seenIds.has(connKey)) continue;

        const isUserHost = myIdentifiers.includes(String(conn.requester_user_id).toLowerCase());
        const isUserInvitee = !isUserHost && myIdentifiers.includes(String(conn.recipient_user_id).toLowerCase());

        if (!isAdminUser && !isUserHost && !isUserInvitee) {
          continue;
        }

        const dateObj = conn.responded_at ? new Date(conn.responded_at) : (conn.created_at ? new Date(conn.created_at) : new Date());
        const dateStr = dateObj.toISOString().slice(0, 10);
        const timeStr = dateObj.toTimeString().slice(0, 5);

        meetingItems.push({
          id: connKey,
          title: `Kết nối giao thương B2B: ${conn.req_name || 'Hội viên'} 🤝 ${conn.rec_name || 'Đối tác'}`,
          hostName: conn.req_name || 'Hội viên kết nối',
          hostCompany: conn.req_company || 'Doanh nghiệp CEO 1983',
          hostPhone: conn.req_phone || '',
          hostCode: conn.req_code || '',
          hostAvatar: conn.req_avatar || '',
          partnerName: conn.rec_name || 'Hội viên đối tác',
          partnerCompany: conn.rec_company || 'Doanh nghiệp đối tác',
          partnerPhone: conn.rec_phone || '',
          partnerCode: conn.rec_code || '',
          partnerAvatar: conn.rec_avatar || '',
          date: dateStr,
          time: timeStr,
          venueType: 'offline',
          venue: 'Văn phòng Hiệp hội CEO 1983 / Trực tiếp',
          notes: 'Kết nối 1-on-1 đã được đối tác chấp nhận trên App Hiệp hội',
          status: 'confirmed',
          source: 'user_connection',
          createdAt: conn.created_at || new Date().toISOString(),
          isUserHost,
          isUserInvitee,
        });
      }

      return {
        items: meetingItems,
        total: meetingItems.length,
      };
    } catch (err) {
      console.error('getConnectionAppointments error:', err);
      return { items: [], total: 0 };
    }
  }

  /**
   * Trả về danh sách cuộc họp hợp nhất cho CRM (/meetings & /business-connect/meetings)
   */
  async getAllUnifiedMeetings(userId: string) {
    const connRes = await this.getConnectionAppointments(userId);
    const connItems = connRes?.items || [];

    const crmRows = await this.prisma.$queryRawUnsafe<any[]>(`
      SELECT id, code, title, type, date, time, location, attendees, status, department, target_members, zoom_url, created_at, updated_at
      FROM public.meetings
      ORDER BY date DESC, created_at DESC
    `).catch(() => []);

    const mergedList: any[] = [];
    const seen = new Set<string>();

    for (const r of crmRows) {
      const idStr = String(r.id);
      seen.add(idStr);
      if (r.code) seen.add(String(r.code));
      mergedList.push(r);
    }

    for (const c of connItems) {
      const idStr = String(c.id);
      if (seen.has(idStr)) continue;
      seen.add(idStr);

      const isOnline = c.venueType === 'online' || String(c.venue || '').toLowerCase().includes('http');
      mergedList.push({
        id: c.id,
        code: `MT-CONN-${idStr.slice(0, 8).toUpperCase()}`,
        title: c.title || 'Cuộc gặp kết nối 1-on-1',
        type: 'general',
        date: c.date || new Date().toISOString().slice(0, 10),
        time: c.time || '09:30 - 10:30',
        location: c.venue || 'Văn phòng Hiệp hội CEO 1983',
        attendees: 2,
        status: c.status || 'upcoming',
        department: 'Hẹn gặp kết nối 1-1',
        target_members: {
          hostName: c.hostName,
          hostCompany: c.hostCompany,
          hostPhone: c.hostPhone,
          partnerName: c.partnerName,
          partnerCompany: c.partnerCompany,
          partnerPhone: c.partnerPhone,
          venue: c.venue,
          venueType: c.venueType,
          notes: c.notes,
          onlineUrl: isOnline ? c.venue : undefined,
        },
        zoom_url: isOnline ? c.venue : '',
        created_at: c.createdAt || new Date().toISOString(),
        updated_at: c.createdAt || new Date().toISOString(),
      });
    }

    return mergedList;
  }

  /**
   * Tạo lịch hẹn kết nối 1-on-1 giữa 2 hội viên và bắn thông báo tới đối tác, đồng bộ vào CRM
   */
  async createConnectionAppointment(userId: string, data: any) {
    const now = new Date();
    const meetingId = crypto.randomUUID();

    // 1. Tìm thông tin người gửi (Requester)
    const safeUserId = isUuid(userId) ? userId : null;
    const requesterMembers = await this.prisma.$queryRawUnsafe<any[]>(`
      SELECT id, name, company, phone, code, avatar_url, user_id
      FROM public.members
      WHERE (${safeUserId ? 'user_id = $1::uuid OR' : ''} id::text = $2::text OR code = $2::text OR phone = $2::text)
      LIMIT 1
    `, ...(safeUserId ? [safeUserId, String(userId)] : [String(userId)])).catch(() => []);
    const reqMember = requesterMembers[0] || {};
    const requesterName = data.senderName || reqMember.name || 'Hội viên CEO 1983';
    const requesterCompany = data.senderCompany || reqMember.company || 'Doanh nghiệp CEO 1983';
    const requesterPhone = data.senderPhone || reqMember.phone || '';
    const requesterCode = reqMember.code || '';
    const requesterAvatar = reqMember.avatar_url || null;

    // 2. Tìm thông tin đối tác nhận lời mời (Recipient) một cách toàn diện
    let recipientUserId = data.targetUserId || data.partnerUserId || null;
    let recipientMember: any = null;

    if (data.targetCode || data.partnerCode) {
      const tCode = data.targetCode || data.partnerCode;
      const recMembers = await this.prisma.$queryRawUnsafe<any[]>(`
        SELECT id, name, company, phone, code, avatar_url, user_id
        FROM public.members
        WHERE LOWER(code) = LOWER($1)
        LIMIT 1
      `, tCode).catch(() => []);
      if (recMembers.length > 0) {
        recipientMember = recMembers[0];
        if (!recipientUserId && recipientMember.user_id) recipientUserId = recipientMember.user_id;
      }
    }

    if (!recipientMember && recipientUserId) {
      const safeRecId = isUuid(recipientUserId) ? recipientUserId : null;
      const recMembers = await this.prisma.$queryRawUnsafe<any[]>(`
        SELECT id, name, company, phone, code, avatar_url, user_id
        FROM public.members
        WHERE (${safeRecId ? 'user_id = $1::uuid OR' : ''} id::text = $2::text OR code = $2::text)
        LIMIT 1
      `, ...(safeRecId ? [safeRecId, String(recipientUserId)] : [String(recipientUserId)])).catch(() => []);
      if (recMembers.length > 0) {
        recipientMember = recMembers[0];
        if (recipientMember.user_id) recipientUserId = recipientMember.user_id;
      }
    }

    if (!recipientMember && (data.targetPhone || data.partnerPhone)) {
      const tPhone = (data.targetPhone || data.partnerPhone || '').trim();
      const recMembers = await this.prisma.$queryRawUnsafe<any[]>(`
        SELECT id, name, company, phone, code, avatar_url, user_id
        FROM public.members
        WHERE phone = $1 OR phone = $2
        LIMIT 1
      `, tPhone, tPhone.replace(/^0/, '+84')).catch(() => []);
      if (recMembers.length > 0) {
        recipientMember = recMembers[0];
        if (!recipientUserId && recipientMember.user_id) recipientUserId = recipientMember.user_id;
      }
    }

    if (!recipientMember && (data.targetName || data.partnerName)) {
      const tName = (data.targetName || data.partnerName || '').trim();
      const recMembers = await this.prisma.$queryRawUnsafe<any[]>(`
        SELECT id, name, company, phone, code, avatar_url, user_id
        FROM public.members
        WHERE LOWER(TRIM(name)) = LOWER(TRIM($1))
        LIMIT 1
      `, tName).catch(() => []);
      if (recMembers.length > 0) {
        recipientMember = recMembers[0];
        if (!recipientUserId && recipientMember.user_id) recipientUserId = recipientMember.user_id;
      }
    }

    // Nếu recipientMember chưa có user_id, tra cứu từ auth.users bằng phone/email
    if (recipientMember && !recipientUserId) {
      if (recipientMember.phone) {
        const u = await this.prisma.$queryRawUnsafe<any[]>(`
          SELECT id FROM auth.users WHERE phone = $1 OR phone = $2 LIMIT 1
        `, recipientMember.phone, recipientMember.phone.replace(/^0/, '+84')).catch(() => []);
        if (u.length > 0) recipientUserId = u[0].id;
      }
      if (!recipientUserId && recipientMember.email) {
        const u = await this.prisma.$queryRawUnsafe<any[]>(`
          SELECT id FROM auth.users WHERE LOWER(email) = LOWER($1) LIMIT 1
        `, recipientMember.email).catch(() => []);
        if (u.length > 0) recipientUserId = u[0].id;
      }
    }

    const recipientName = data.targetName || data.partnerName || recipientMember?.name || 'Đối tác';
    const recipientCompany = data.targetCompany || data.partnerCompany || recipientMember?.company || 'Doanh nghiệp CEO 1983';
    const recipientCode = data.targetCode || data.partnerCode || recipientMember?.code || '';
    const recipientAvatar = data.targetAvatar || data.partnerAvatar || recipientMember?.avatar_url || null;

    const title = data.title || `Hẹn gặp kết nối 1-1: ${requesterName} & ${recipientName}`;
    const purpose = (data.purpose || data.notes || 'Hẹn gặp trao đổi cơ hội hợp tác kinh doanh').trim();
    const date = data.date || now.toISOString().slice(0, 10);
    const time = data.time || '09:30 - 10:30';
    const venueType = data.venueType || 'online';
    const venue = data.venue || (venueType === 'online' ? 'https://meet.jit.si/CEO1983_Connect_1on1' : 'Văn phòng Hiệp hội CEO 1983, Tòa V-Tower, 649 Kim Mã, Hà Nội');

    const scheduledStartAt = new Date(`${date}T09:30:00Z`);

    const hostUuid = toValidUuid(reqMember?.user_id || userId);
    const inviteeUuid = toValidUuid(recipientUserId || recipientMember?.user_id || recipientMember?.id || recipientCode || 'invitee');

    // 3. Tạo record trong public.business_meetings với status='draft', meeting_type='networking'
    await this.prisma.$executeRawUnsafe(`
      INSERT INTO public.business_meetings (
        id, title, description, meeting_type, status, timezone, source_type, association_id,
        scheduling_mode, scheduled_start_at, scheduled_end_at, created_by_user_id, organizer_user_id,
        created_at, updated_at
      ) VALUES (
        $1::uuid, $2, $3, 'networking'::public.business_meeting_type, 'draft'::public.business_meeting_status,
        'Asia/Ho_Chi_Minh', 'association'::public.business_meeting_source_type, 'c1983000-0000-4000-8000-000000001983'::uuid,
        'scheduled', $4::timestamptz, $5::timestamptz, $6::uuid, $6::uuid, NOW(), NOW()
      )
    `,
      meetingId,
      title,
      `Đối tác: ${recipientName} (${recipientCompany}) [${recipientCode}]. Người mời: ${requesterName} (${requesterCompany}) [${requesterCode}]. Mục đích: ${purpose}. Địa điểm: ${venue}`,
      scheduledStartAt,
      new Date(scheduledStartAt.getTime() + 3600000),
      hostUuid,
    ).catch((err) => {
      console.warn('Error inserting business_meetings:', err?.message);
    });

    // 4. Thêm người tham gia vào public.business_meeting_participants trong khi status='draft'
    await this.prisma.$executeRawUnsafe(`
      INSERT INTO public.business_meeting_participants (
        id, meeting_id, user_id, role, response_status, joined_at, created_at, updated_at
      ) VALUES 
        (gen_random_uuid(), $1::uuid, $2::uuid, 'organizer'::public.business_meeting_participant_role, 'accepted'::public.business_meeting_response_status, NOW(), NOW(), NOW()),
        (gen_random_uuid(), $1::uuid, $3::uuid, 'required'::public.business_meeting_participant_role, 'pending'::public.business_meeting_response_status, NOW(), NOW(), NOW())
    `, meetingId, hostUuid, inviteeUuid).catch((err) => {
      console.warn('Error inserting business_meeting_participants:', err?.message);
    });

    // 4.1 Cập nhật status thành 'proposed'
    await this.prisma.$executeRawUnsafe(`
      UPDATE public.business_meetings
      SET status = 'proposed'::public.business_meeting_status, updated_at = NOW()
      WHERE id = $1::uuid
    `, meetingId).catch(() => {});

    // 5. ĐỒNG BỘ DỮ LIỆU SANG CRM (Bảng public.meetings) ĐỂ CRM LUÔN CÓ THÔNG TIN CUỘC HẸN
    const crmMeetingCode = `MT-CONN-${meetingId.slice(0, 8).toUpperCase()}`;
    await this.prisma.$executeRawUnsafe(`
      INSERT INTO public.meetings (
        id, code, title, type, date, time, location, attendees, status, department, target_members, zoom_url, association_id, created_at, updated_at
      ) VALUES (
        gen_random_uuid(), $1, $2, 'general', $3::date, $4, $5, 2, 'upcoming', 'Hẹn gặp kết nối 1-1', $6::jsonb, $7, 'c1983000-0000-4000-8000-000000001983'::uuid, NOW(), NOW()
      ) ON CONFLICT DO NOTHING
    `,
      crmMeetingCode,
      title,
      date,
      time,
      venue,
      JSON.stringify([
        { name: requesterName, company: requesterCompany, phone: requesterPhone, code: requesterCode, role: 'Người mời', userId: hostUuid },
        { name: recipientName, company: recipientCompany, code: recipientCode, role: 'Người được mời', userId: inviteeUuid }
      ]),
      venueType === 'online' ? venue : '',
    ).catch((crmErr) => {
      console.warn('Dual-write to CRM public.meetings warning:', crmErr?.message);
    });

    // 6. Bắn notification vào public.member_notifications cho đối tác (Recipient)
    const notifTargets = [recipientUserId, recipientMember?.id, recipientMember?.code].filter(Boolean);
    for (const targetId of notifTargets) {
      await this.prisma.$executeRawUnsafe(`
        INSERT INTO public.member_notifications (
          id, recipient_id, title, body, read, dismissed, ref_type, ref_id, created_at
        ) VALUES (
          $1::uuid, $2::text, $3, $4, false, false, 'meeting', $5::text, $6::timestamptz
        )
      `,
        crypto.randomUUID(),
        String(targetId),
        `Lời mời hẹn gặp kết nối 1-1 từ ${requesterName}`,
        `${requesterName} (${requesterCompany}) đã gửi lời mời hẹn gặp kết nối giao thương với bạn: "${purpose}". Bấm xem chi tiết để đồng ý hoặc từ chối.`,
        meetingId,
        now,
      ).catch(() => {});
    }

    // 7. Phát sự kiện realtime qua Socket.IO tới đối tác
    if (this.gateway) {
      const meetingPayload = {
        id: meetingId,
        title,
        hostName: requesterName,
        hostCompany: requesterCompany,
        hostPhone: requesterPhone,
        hostCode: requesterCode,
        hostAvatar: requesterAvatar,
        partnerName: recipientName,
        partnerCompany: recipientCompany,
        partnerCode: recipientCode,
        partnerAvatar: recipientAvatar,
        date,
        time,
        venueType,
        venue,
        notes: purpose,
        status: 'pending',
        createdAt: now.toISOString(),
      };

      const socketTargets = [recipientUserId, recipientMember?.code, recipientMember?.id].filter(Boolean);
      for (const targetId of socketTargets) {
        this.gateway.emitMeetingRequested(String(targetId), {
          name: requesterName,
          company: requesterCompany,
          code: requesterCode,
          avatar: requesterAvatar,
          phone: requesterPhone,
          targetMemberCode: recipientCode,
          targetMemberId: recipientMember?.id,
        }, meetingPayload);

        this.gateway.emitNotification(String(targetId), {
          title: `Lời mời hẹn gặp kết nối 1-1 từ ${requesterName}`,
          body: `${requesterName} (${requesterCompany}) đã gửi lời mời hẹn gặp kết nối: "${purpose}"`,
          refType: 'meeting',
          refId: meetingId,
          createdAt: now.toISOString(),
        });
      }

      this.gateway.emitToAll('vba.meeting.changed', { id: meetingId, status: 'pending' });
    }

    // 8. Bắn email thông báo lịch hẹn kết nối 1-on-1 cho người nhận lời mời
    if (this.mailService) {
      try {
        let recipientEmail = recipientMember?.email;
        if (!recipientEmail && recipientUserId) {
          const u = await this.prisma.$queryRaw<any[]>`SELECT email FROM public.vione_users WHERE id = ${recipientUserId}::uuid LIMIT 1`.catch(() => []);
          if (u[0]?.email) recipientEmail = u[0].email;
        }
        const targetEmail = (recipientEmail || process.env.ADMIN_NOTIFY_EMAIL || 'vupv090120@gmail.com').trim();

        await this.mailService.sendConnectionAppointmentEmail({
          to: targetEmail,
          recipientName,
          partnerName: requesterName,
          partnerCompany: requesterCompany,
          partnerPhone: requesterPhone,
          status: 'requested',
          date,
          time,
          venueOrLink: venue,
          venueType,
          purpose,
          notes: purpose,
        });
      } catch (err: any) {
        console.warn('[createConnectionAppointment] Email dispatch error:', err?.message);
      }
    }

    return {
      ok: true,
      meetingId,
      status: 'pending',
    };
  }

  /**
   * Phản hồi lời mời hẹn gặp 1-on-1 (đồng ý hoặc từ chối)
   */
  async respondConnectionAppointment(
    userId: string,
    meetingId: string,
    status: 'accepted' | 'declined' | 'confirmed',
  ) {
    const now = new Date();
    const finalStatus = status === 'accepted' || status === 'confirmed' ? 'confirmed' : 'declined';

    // 1. Tìm cuộc gặp
    const meetings = await this.prisma.$queryRawUnsafe<any[]>(`
      SELECT m.id, m.title, m.created_by_user_id, m.organizer_user_id, m.scheduled_start_at
      FROM public.business_meetings m
      WHERE m.id = $1::uuid
      LIMIT 1
    `, meetingId).catch(() => []);

    if (meetings.length === 0) {
      throw new NotFoundException('Không tìm thấy cuộc gặp này');
    }
    const meeting = meetings[0];
    const hostUserId = meeting.created_by_user_id || meeting.organizer_user_id;

    // 2. Cập nhật status cuộc gặp trong public.business_meetings
    await this.prisma.$executeRawUnsafe(`
      UPDATE public.business_meetings
      SET status = $1::public.business_meeting_status, updated_at = $2::timestamptz
      WHERE id = $3::uuid
    `, finalStatus, now, meetingId);

    // Cập nhật response_status của participant
    await this.prisma.$executeRawUnsafe(`
      UPDATE public.business_meeting_participants
      SET response_status = $1::public.business_meeting_response_status, updated_at = $2::timestamptz
      WHERE meeting_id = $3::uuid AND (user_id = $4::uuid OR role = 'required' OR role = 'invitee')
    `, finalStatus === 'confirmed' ? 'accepted' : 'declined', now, meetingId, userId).catch(() => {});

    // Đồng bộ sang CRM public.meetings
    const crmCode = `MT-CONN-${meetingId.slice(0, 8).toUpperCase()}`;
    await this.prisma.$executeRawUnsafe(`
      UPDATE public.meetings
      SET status = $1, updated_at = NOW()
      WHERE code = $2 OR code LIKE '%' || $3 || '%' OR title = $4
    `, finalStatus === 'confirmed' ? 'upcoming' : 'cancelled', crmCode, meetingId.slice(0, 8), meeting.title).catch(() => {});

    // Đánh dấu đã đọc notification của cuộc gặp này
    await this.prisma.$executeRawUnsafe(`
      UPDATE public.member_notifications
      SET read = true
      WHERE ref_id = $1::text
    `, meetingId).catch(() => {});

    // 3. Tìm thông tin người phản hồi (Responder)
    const responderMembers = await this.prisma.$queryRawUnsafe<any[]>(`
      SELECT name, company_name as company, code, avatar as avatar_url FROM public.members WHERE user_id = $1::uuid OR id::text = $2::text LIMIT 1
    `, userId, String(userId)).catch(() => []);
    const responder = responderMembers[0] || {};
    const responderName = responder.name || 'Hội viên đối tác';
    const responderCompany = responder.company || 'Doanh nghiệp CEO 1983';

    // 4. Bắn thông báo ngược lại cho người gửi lời mời (Host)
    if (hostUserId && String(hostUserId) !== String(userId)) {
      const hostMembers = await this.prisma.$queryRawUnsafe<any[]>(`
        SELECT id, code FROM public.members WHERE user_id = $1::uuid OR id::text = $2::text LIMIT 1
      `, hostUserId, String(hostUserId)).catch(() => []);
      const hostMember = hostMembers[0] || {};
      const hostTargets = [hostUserId, hostMember.id, hostMember.code].filter(Boolean);

      const notifTitle = finalStatus === 'confirmed'
        ? `${responderName} đã đồng ý lịch hẹn kết nối 1-1`
        : `${responderName} đã từ chối lịch hẹn kết nối 1-1`;
      const notifBody = finalStatus === 'confirmed'
        ? `${responderName} (${responderCompany}) đã đồng ý lịch hẹn kết nối giao thương 1-on-1 với bạn. Hãy chuẩn bị cho buổi gặp gỡ!`
        : `${responderName} (${responderCompany}) rất tiếc chưa thể sắp xếp cuộc gặp lúc này.`;

      for (const targetId of hostTargets) {
        await this.prisma.$executeRawUnsafe(`
          INSERT INTO public.member_notifications (
            id, recipient_id, title, body, read, dismissed, ref_type, ref_id, created_at
          ) VALUES (
            $1::uuid, $2::text, $3, $4, false, false, 'meeting', $5::text, $6::timestamptz
          )
        `,
          crypto.randomUUID(),
          String(targetId),
          notifTitle,
          notifBody,
          meetingId,
          now,
        ).catch(() => {});
      }

      if (this.gateway) {
        this.gateway.emitMeetingResponded(String(hostUserId), {
          name: responderName,
          company: responderCompany,
          code: responder.code,
          avatar: responder.avatar_url,
          targetMemberCode: hostMember.code,
          targetMemberId: hostMember.id,
        }, {
          id: meetingId,
          title: meeting.title,
        }, finalStatus);

        this.gateway.emitNotification(String(hostUserId), {
          title: notifTitle,
          body: notifBody,
          refType: 'meeting',
          refId: meetingId,
          createdAt: now.toISOString(),
        });

        this.gateway.emitToAll('vba.meeting.changed', { id: meetingId, status: finalStatus });
      }
    }

    // 5. Bắn email xác nhận cuộc gặp đã lên lịch thành công cho cả 2 bên nếu đồng ý
    if (finalStatus === 'confirmed' && this.mailService) {
      try {
        const hostUser = await this.prisma.$queryRawUnsafe<any[]>(`SELECT email, name FROM public.vione_users WHERE id = $1::uuid LIMIT 1`, hostUserId).catch(() => []);
        const hostEmail = (hostUser[0]?.email || process.env.ADMIN_NOTIFY_EMAIL || 'vupv090120@gmail.com').trim();
        const respUser = await this.prisma.$queryRawUnsafe<any[]>(`SELECT email, name FROM public.vione_users WHERE id = $1::uuid LIMIT 1`, userId).catch(() => []);
        const respEmail = (respUser[0]?.email || responder.email || '').trim();

        await this.mailService.sendConnectionAppointmentEmail({
          to: hostEmail,
          recipientName: hostUser[0]?.name || 'Hội viên',
          partnerName: responderName,
          partnerCompany: responderCompany,
          partnerPhone: responder.phone || '',
          status: 'confirmed',
          date: meeting.scheduled_start_at ? new Date(meeting.scheduled_start_at).toLocaleDateString('vi-VN') : 'Theo lịch hẹn',
          time: 'Đã xác nhận',
          venueOrLink: 'Phòng họp kết nối CEO 1983',
          purpose: meeting.title,
        });

        if (respEmail && respEmail.toLowerCase() !== hostEmail.toLowerCase()) {
          await this.mailService.sendConnectionAppointmentEmail({
            to: respEmail,
            recipientName: responderName,
            partnerName: hostUser[0]?.name || 'Hội viên kết nối',
            status: 'confirmed',
            date: meeting.scheduled_start_at ? new Date(meeting.scheduled_start_at).toLocaleDateString('vi-VN') : 'Theo lịch hẹn',
            time: 'Đã xác nhận',
            venueOrLink: 'Phòng họp kết nối CEO 1983',
            purpose: meeting.title,
          });
        }
      } catch (err: any) {
        console.warn('[respondConnectionAppointment] Email confirmation error:', err?.message);
      }
    }

    return {
      ok: true,
      meetingId,
      status: finalStatus,
    };
  }

  /**
   * Hủy lịch hẹn gặp kết nối 1-on-1 (hỗ trợ cả Mobile và CRM)
   */
  async cancelConnectionAppointment(userId: string, meetingId: string, reason?: string) {
    const now = new Date();
    const cancelReason = reason || 'Hủy lịch hẹn kết nối theo yêu cầu';

    // 1. Tìm cuộc họp trong public.business_meetings hoặc CRM
    const meetings = await this.prisma.$queryRawUnsafe<any[]>(`
      SELECT m.id, m.title, m.created_by_user_id, m.organizer_user_id
      FROM public.business_meetings m
      WHERE m.id = $1::uuid
      LIMIT 1
    `, meetingId).catch(() => []);

    const meetingTitle = meetings[0]?.title || 'Cuộc hẹn kết nối 1-1';
    const hostUserId = meetings[0]?.created_by_user_id || meetings[0]?.organizer_user_id;

    // 2. Cập nhật status trong public.business_meetings
    await this.prisma.$executeRawUnsafe(`
      UPDATE public.business_meetings
      SET status = 'cancelled'::public.business_meeting_status, updated_at = $1::timestamptz
      WHERE id = $2::uuid
    `, now, meetingId).catch(() => {});

    // Cập nhật response_status trong participants
    await this.prisma.$executeRawUnsafe(`
      UPDATE public.business_meeting_participants
      SET response_status = 'declined'::public.business_meeting_response_status, updated_at = $1::timestamptz
      WHERE meeting_id = $2::uuid
    `, now, meetingId).catch(() => {});

    // 3. Đồng bộ cập nhật CRM public.meetings
    const crmCode = `MT-CONN-${meetingId.slice(0, 8).toUpperCase()}`;
    await this.prisma.$executeRawUnsafe(`
      UPDATE public.meetings
      SET status = 'cancelled', cancel_reason = $1, updated_at = NOW()
      WHERE code = $2 OR code LIKE '%' || $3 || '%' OR title = $4
    `, cancelReason, crmCode, meetingId.slice(0, 8), meetingTitle).catch(() => {});

    // 4. Bắn thông báo cho đối tác
    const parts = await this.prisma.$queryRawUnsafe<any[]>(`
      SELECT user_id, role FROM public.business_meeting_participants WHERE meeting_id = $1::uuid
    `, meetingId).catch(() => []);

    const otherPart = parts.find((p: any) => String(p.user_id) !== String(userId));
    const targetUserId = otherPart?.user_id || hostUserId;

    if (targetUserId && String(targetUserId) !== String(userId)) {
      const cancelNotifTitle = `[HỦY HẸN KẾT NỐI] ${meetingTitle}`;
      const cancelNotifBody = `Lịch hẹn gặp kết nối "${meetingTitle}" đã bị hủy. Lý do: "${cancelReason}".`;

      await this.prisma.$executeRawUnsafe(`
        INSERT INTO public.member_notifications (
          id, recipient_id, title, body, read, dismissed, ref_type, ref_id, created_at
        ) VALUES (
          $1::uuid, $2::text, $3, $4, false, false, 'meeting', $5::text, NOW()
        )
      `, crypto.randomUUID(), String(targetUserId), cancelNotifTitle, cancelNotifBody, meetingId).catch(() => {});

      if (this.gateway) {
        this.gateway.emitNotification(String(targetUserId), {
          title: cancelNotifTitle,
          body: cancelNotifBody,
          refType: 'meeting',
          refId: meetingId,
          createdAt: now.toISOString(),
        });
        this.gateway.emitToAll('vba.meeting.changed', { id: meetingId, status: 'cancelled' });
      }
    }

    return {
      ok: true,
      meetingId,
      status: 'cancelled',
      reason: cancelReason,
    };
  }
}
