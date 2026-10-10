import { Injectable, NotFoundException, ForbiddenException, BadRequestException, InternalServerErrorException, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConnectAppGateway } from './connect-app.gateway';
import { MailService } from '../mail/mail.service';
import * as crypto from 'crypto';

import { ConnectMomentsService } from './services/moments.service';
import { ConnectMessengerService } from './services/messenger.service';
import { ConnectNfcService } from './services/nfc-device.service';
import { ConnectOpportunityService } from './services/opportunity.service';
import { ConnectMarketplaceService } from './services/marketplace.service';
import { ConnectCustomerService } from './services/customer.service';
import { ConnectCardScanService } from './services/card-scan.service';
import { ConnectIdentityService } from './services/identity.service';
import { ConnectCommunityService } from './services/community.service';
import { ConnectContentService } from './services/content.service';
import { ConnectPublicRegistrationService } from './services/public-registration.service';
import { ConnectNetworkService } from './services/network.service';

import { ConnectAppRepository } from './connect-app.repository';

const formatVNTime = (date: Date) => {
  const utc = date.getTime() + date.getTimezoneOffset() * 60000;
  const vnDate = new Date(utc + 3600000 * 7);
  const hh = String(vnDate.getHours()).padStart(2, '0');
  const mm = String(vnDate.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
};

@Injectable()
export class ConnectAppService implements OnModuleInit {
  constructor(
    private prisma: PrismaService,
    private gateway: ConnectAppGateway,
    private momentsService: ConnectMomentsService,
    private messengerService: ConnectMessengerService,
    private nfcService: ConnectNfcService,
    private opportunityService: ConnectOpportunityService,
    private marketplaceService: ConnectMarketplaceService,
    private customerService: ConnectCustomerService,
    private cardScanService: ConnectCardScanService,
    private identityService: ConnectIdentityService,
    private communityService: ConnectCommunityService,
    private contentService: ConnectContentService,
    private publicRegistrationService: ConnectPublicRegistrationService,
    private networkService: ConnectNetworkService,
    private connectAppRepo: ConnectAppRepository,
    private mailService?: MailService,
  ) {}

  async onModuleInit() {
    try {
      await this.prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS public.business_relationship_moment_comments (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          moment_id UUID NOT NULL,
          user_id UUID NOT NULL,
          parent_id UUID,
          content TEXT NOT NULL,
          mentions JSONB DEFAULT '[]'::jsonb,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
      `);
      await this.prisma.$executeRawUnsafe(`
        CREATE INDEX IF NOT EXISTS idx_brmc_moment_id ON public.business_relationship_moment_comments (moment_id, created_at ASC);
      `);
      await this.prisma.$executeRawUnsafe(`
        CREATE INDEX IF NOT EXISTS idx_brmc_parent_id ON public.business_relationship_moment_comments (parent_id);
      `);
      await this.prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS public.business_relationship_moment_comment_likes (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          comment_id UUID NOT NULL,
          user_id UUID NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          CONSTRAINT uq_brm_comment_like UNIQUE (comment_id, user_id)
        );
      `);
      await this.prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS public.business_relationship_moment_likes (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          moment_id UUID NOT NULL,
          user_id UUID NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          CONSTRAINT uq_brm_moment_like UNIQUE (moment_id, user_id)
        );
      `);
      await this.prisma.$executeRawUnsafe(`
        ALTER TABLE public.opportunities ADD COLUMN IF NOT EXISTS image TEXT;
        ALTER TABLE public.opportunities ADD COLUMN IF NOT EXISTS contact_name TEXT;
        ALTER TABLE public.opportunities ADD COLUMN IF NOT EXISTS contact_phone TEXT;
        ALTER TABLE public.opportunities ADD COLUMN IF NOT EXISTS contact_title TEXT;
        ALTER TABLE public.opportunities ADD COLUMN IF NOT EXISTS company TEXT;
        ALTER TABLE public.products ADD COLUMN IF NOT EXISTS company TEXT;
        ALTER TABLE public.products ADD COLUMN IF NOT EXISTS image_url TEXT;
        ALTER TABLE public.products ADD COLUMN IF NOT EXISTS original_price NUMERIC;
        ALTER TABLE public.products ADD COLUMN IF NOT EXISTS member_price NUMERIC;
      `).catch(() => {});
      await this.prisma.$executeRawUnsafe(`
        ALTER TABLE public.business_relationship_moments
        ADD COLUMN IF NOT EXISTS visibility VARCHAR(32) DEFAULT 'friends';
      `);
      await this.prisma.$executeRawUnsafe(`
        ALTER TABLE public.business_relationship_moments DROP CONSTRAINT IF EXISTS brm_target_xor;
        ALTER TABLE public.business_relationship_moments ADD CONSTRAINT brm_target_xor CHECK (
          (target_kind = 'connection' AND target_user_id IS NOT NULL AND target_card_id IS NULL AND target_guest_id IS NULL) OR
          (target_kind = 'saved_card' AND target_card_id IS NOT NULL AND target_user_id IS NULL AND target_guest_id IS NULL) OR
          (target_kind = 'guest_contact' AND target_guest_id IS NOT NULL AND target_user_id IS NULL AND target_card_id IS NULL) OR
          (target_kind = 'general' AND target_user_id IS NULL AND target_card_id IS NULL AND target_guest_id IS NULL)
        );
        ALTER TABLE public.business_relationship_moments DROP CONSTRAINT IF EXISTS business_relationship_moments_target_kind_check;
        ALTER TABLE public.business_relationship_moments ADD CONSTRAINT business_relationship_moments_target_kind_check
          CHECK (target_kind = ANY (ARRAY['connection'::text, 'saved_card'::text, 'guest_contact'::text, 'general'::text]));
      `).catch(() => {});
      await this.prisma.$executeRawUnsafe(`
        ALTER TABLE public.business_relationship_moment_comments
        ADD COLUMN IF NOT EXISTS photo_url TEXT;
      `);
      await this.prisma.$executeRawUnsafe(`
        ALTER TABLE public.associations ADD COLUMN IF NOT EXISTS banner_url text;
      `).catch(() => {});
      await this.prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS public.association_logo_history (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          association_id UUID NOT NULL,
          changed_by UUID,
          changed_by_name TEXT,
          old_logo_url TEXT,
          new_logo_url TEXT,
          action TEXT NOT NULL DEFAULT 'change',
          created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
      `).catch(() => {});
      await this.prisma.$executeRawUnsafe(`
        ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS app_scope text DEFAULT 'crm';
      `).catch(() => {});
      await this.prisma.$executeRawUnsafe(`
        ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS target_app text DEFAULT 'crm';
      `).catch(() => {});
      await this.prisma.$executeRawUnsafe(`
        ALTER TABLE public.business_notifications ADD COLUMN IF NOT EXISTS app_scope text DEFAULT 'ceo1983_app';
      `).catch(() => {});
      await this.prisma.$executeRawUnsafe(`
        ALTER TABLE public.business_notifications ADD COLUMN IF NOT EXISTS target_app text DEFAULT 'ceo1983_app';
      `).catch(() => {});
      await this.prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS public.direct_message_threads (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user1_id UUID NOT NULL,
          user2_id UUID NOT NULL,
          last_message_at TIMESTAMPTZ DEFAULT now(),
          last_message_body TEXT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          CONSTRAINT uq_dm_thread_pair UNIQUE (user1_id, user2_id)
        );
      `);
      await this.prisma.$executeRawUnsafe(`
        CREATE INDEX IF NOT EXISTS idx_dmt_user1 ON public.direct_message_threads (user1_id, last_message_at DESC);
      `);
      await this.prisma.$executeRawUnsafe(`
        CREATE INDEX IF NOT EXISTS idx_dmt_user2 ON public.direct_message_threads (user2_id, last_message_at DESC);
      `);
      await this.prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS public.direct_messages (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          thread_id UUID NOT NULL,
          sender_user_id UUID NOT NULL,
          body TEXT NOT NULL,
          client_token TEXT,
          reply_to JSONB,
          reactions JSONB DEFAULT '[]'::jsonb,
          is_retracted BOOLEAN DEFAULT false,
          read_at TIMESTAMPTZ,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
      `);
      await this.prisma.$executeRawUnsafe(`
        CREATE INDEX IF NOT EXISTS idx_dm_thread_created ON public.direct_messages (thread_id, created_at ASC);
      `);
      await this.prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS public.community_join_requests (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL,
          association_id UUID NOT NULL,
          status VARCHAR(32) NOT NULL DEFAULT 'pending',
          message TEXT,
          cancel_reason TEXT,
          decided_at TIMESTAMPTZ,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          CONSTRAINT uq_cjr_user_assoc UNIQUE (user_id, association_id)
        );
      `);
      await this.prisma.$executeRawUnsafe(`
        CREATE INDEX IF NOT EXISTS idx_cjr_user_status ON public.community_join_requests (user_id, status);
      `);
      await this.prisma.$executeRawUnsafe(`
        CREATE INDEX IF NOT EXISTS idx_cjr_assoc_status ON public.community_join_requests (association_id, status);
      `);
      await this.prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS public.business_relationship_moment_mutes (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          moment_id UUID NOT NULL,
          user_id UUID NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          CONSTRAINT uq_brm_mute UNIQUE (moment_id, user_id)
        );
      `);
      await this.prisma.$executeRawUnsafe(`
        CREATE INDEX IF NOT EXISTS idx_brm_mutes_user_moment ON public.business_relationship_moment_mutes (user_id, moment_id);
      `);
    } catch (err) {
      console.warn('Note: Could not ensure tables on module init:', err);
    }
  }


  async getBriefing(userId: string) {
    const now = new Date();

    // Check for meetings starting within 30 minutes to push to notifications
    try {
      const thirtyMinsFromNow = new Date(now.getTime() + 30 * 60 * 1000);
      const upcomingMeetings = await this.prisma.$queryRaw<any[]>`
        SELECT id, title, scheduled_start_at
        FROM public.business_meetings
        WHERE organizer_user_id = ${userId}::uuid
          AND status = 'confirmed'::public.business_meeting_status
          AND scheduled_start_at >= ${now}
          AND scheduled_start_at <= ${thirtyMinsFromNow}
      `.catch(() => []);

      for (const m of upcomingMeetings) {
        const existingNotif = await this.prisma.$queryRaw<any[]>`
          SELECT id FROM public.business_notifications
          WHERE recipient_user_id = ${userId}::uuid
            AND source_domain = 'meeting'
            AND source_record_id = ${m.id}
            AND notification_kind = 'meeting_upcoming_reminder'
        `.catch(() => []);

        if (existingNotif.length === 0) {
          const notifId = crypto.randomUUID();
          const formattedStart = formatVNTime(new Date(m.scheduled_start_at));
          const safeData = JSON.stringify({
            meetingTitle: m.title,
            scheduledAt: formattedStart
          });
          const actionTarget = JSON.stringify({
            route: '/connect-app'
          });

          const dedupeKey = `meeting_upcoming_reminder:${userId}:${m.id}`;
          await this.prisma.$executeRaw`
            INSERT INTO public.business_notifications (
              id, recipient_user_id, source_domain, source_record_id, event_kind, notification_kind,
              title_key, body_key, safe_display_data, action_kind, action_label_key, action_target,
              priority, status, created_at, updated_at, dedupe_key
            ) VALUES (
              ${notifId}::uuid, ${userId}::uuid, 'meeting', ${m.id}, 'upcoming_reminder', 'meeting_upcoming_reminder',
              'bc.notif.kind.meeting_upcoming_reminder.title', 'bc.notif.kind.meeting_upcoming_reminder.body',
              ${safeData}::jsonb, 'open_meeting_detail', 'bc.notif.action.view', ${actionTarget}::jsonb,
              'high', 'delivered', ${now}, ${now}, ${dedupeKey}
            )
          `;
        }
      }
    } catch (e) {
      console.error('Error generating upcoming meeting notifications:', e);
    }

    // 1. Connection requests
    const connectionRequests = await this.prisma.$queryRaw`
      SELECT id, requester_user_id, recipient_user_id as target_user_id, status::text as status, created_at
      FROM public.user_connections
      WHERE status = 'pending'::public.global_connection_status AND (requester_user_id = ${userId}::uuid OR recipient_user_id = ${userId}::uuid)
      ORDER BY created_at DESC
      LIMIT 50
    `.catch(() => []) as any[];

    // 2. Introduction requests
    const introductionRequests = await this.prisma.$queryRaw`
      SELECT id, status, created_at, requester_user_id, intermediary_user_id, target_user_id, target_person_node_id
      FROM public.introduction_requests
      WHERE status IN ('pending', 'accepted') AND (requester_user_id = ${userId}::uuid OR intermediary_user_id = ${userId}::uuid OR target_user_id = ${userId}::uuid)
      ORDER BY created_at DESC
      LIMIT 50
    `.catch(() => []) as any[];

    // 3. Introduction deliveries
    const introductionDeliveries = await this.prisma.$queryRaw`
      SELECT id, status, created_at, recipient_user_id
      FROM public.introduction_deliveries
      WHERE status IN ('sent', 'delivered') AND recipient_user_id = ${userId}::uuid
      ORDER BY created_at DESC
      LIMIT 50
    `.catch(() => []) as any[];

    // 4. Business meetings
    const businessMeetings = await this.prisma.$queryRaw`
      SELECT id, status, scheduled_start_at, organizer_user_id
      FROM public.business_meetings
      WHERE organizer_user_id = ${userId}::uuid
      ORDER BY scheduled_start_at ASC NULLS LAST
      LIMIT 50
    `.catch(() => []) as any[];

    // Fetch community and registered events for today & upcoming
    const todayStr = now.toISOString().slice(0, 10);
    const registeredEvents = await this.prisma.$queryRaw<any[]>`
      SELECT e.id, e.name as title, e.date as scheduled_start_at, e.status, e.location, e.association_id,
             a.name as association_name
      FROM public.events e
      LEFT JOIN public.associations a ON e.association_id = a.id
      WHERE (
        e.id::text IN (
          SELECT event_id FROM public.event_registrations er
          WHERE er.member_code IN (
            SELECT code FROM public.members WHERE user_id = ${userId}::uuid
          )
        )
        OR e.association_id IN (
          SELECT association_id FROM public.memberships WHERE user_id = ${userId}::uuid
          UNION
          SELECT association_id FROM public.members WHERE user_id = ${userId}::uuid AND status = 'active'
        )
        OR e.date::date = CURRENT_DATE
        OR e.status IN ('upcoming', 'ongoing', 'active')
      )
      AND (e.date::date >= CURRENT_DATE OR e.date::date = ${todayStr}::date)
      ORDER BY (e.date::date = CURRENT_DATE) DESC, e.date ASC
      LIMIT 20
    `.catch((err) => {
      console.error('Error fetching registeredEvents:', err);
      return [];
    });


    // 5. Followups
    const businessMeetingFollowUps = await this.prisma.$queryRaw`
      SELECT id, meeting_id, status, due_at, title, owner_user_id
      FROM public.business_meeting_follow_ups
      WHERE status IN ('open', 'in_progress') AND owner_user_id = ${userId}::uuid
      ORDER BY due_at ASC NULLS LAST
      LIMIT 50
    `.catch(() => []) as any[];

    // 6. Timeline events
    const graphTimelineEvents = await this.prisma.$queryRaw`
      SELECT id, occurred_at, event_kind, person_node_id
      FROM public.graph_timeline_events
      ORDER BY occurred_at DESC
      LIMIT 50
    `.catch(() => []) as any[];

    const allEventsMapped = registeredEvents.map(e => {
      const eventDate = new Date(e.scheduled_start_at);
      const eDateStr = !isNaN(eventDate.getTime()) ? eventDate.toISOString().slice(0, 10) : '';
      const isToday = eDateStr === todayStr;
      return {
        id: `event:${e.id}`,
        sourceType: 'business_meeting' as const,
        sourceRecordId: String(e.id),
        itemKind: 'meeting_event' as const,
        kind: 'meeting' as const,
        category: 'upcoming' as const,
        priority: isToday ? ('high' as const) : ('medium' as const),
        urgency: isToday ? ('high' as const) : ('low' as const),
        titleKey: e.title,
        descriptionKey: e.location || 'Sự kiện cộng đồng',
        counterpartDisplayName: e.association_name || 'Cộng đồng',
        startsAt: eventDate.toISOString(),
        dueAt: null,
        status: String(e.status || 'confirmed'),
        action: {
          labelKey: 'bc.workHub.action.view',
          targetRoute: '/events/$eventId',
          targetParams: { eventId: String(e.id) },
          targetSearch: null,
          canRoute: true,
        },
        secondaryAction: null,
        context: {
          isToday,
          dateStr: eDateStr,
          rawDate: e.scheduled_start_at,
          capacity: e.capacity,
          registered: e.registered,
          type: e.type,
        },
        viewerPermissions: { canRoute: true, canInlineMutate: false },
        safeDisplayData: { counterpartDisplayName: e.association_name || 'Cộng đồng' },
        dedupeKey: `event:${e.id}`,
        registryVersion: 1,
      };
    });

    const todayEventsList = allEventsMapped.filter(e => e.context.isToday);
    const upcomingEventsList = allEventsMapped.filter(e => !e.context.isToday);

    return {
      connectionRequests: connectionRequests.map(r => ({
        id: String(r.id),
        direction: r.requester_user_id === userId ? 'outgoing' : 'incoming',
        status: String(r.status),
        createdAt: r.created_at ? new Date(r.created_at).toISOString() : now.toISOString(),
        counterpartHandle: null,
        counterpartDisplayName: null,
        counterpartAvatarUrl: null,
      })),
      introductionRequests: introductionRequests.map(r => {
        const role = r.intermediary_user_id === userId
          ? 'intermediary'
          : r.target_user_id === userId
            ? 'target'
            : 'requester';
        return {
          id: String(r.id),
          role,
          status: String(r.status),
          createdAt: r.created_at ? new Date(r.created_at).toISOString() : now.toISOString(),
          targetPersonNodeId: r.target_person_node_id || null,
          counterpartDisplayName: null,
        };
      }),
      introductionDeliveries: introductionDeliveries.map(r => ({
        id: String(r.id),
        status: String(r.status),
        createdAt: r.created_at ? new Date(r.created_at).toISOString() : now.toISOString(),
        counterpartDisplayName: null,
      })),
      meetingWorkspaceItems: [
        ...businessMeetings.map(r => {
          const isUpcoming = r.status === 'confirmed' && r.scheduled_start_at && new Date(r.scheduled_start_at) >= now;
          return {
            meetingId: String(r.id),
            status: String(r.status),
            bucket: isUpcoming ? 'upcoming' : r.status === 'completed' ? 'history' : 'overview',
            suggestedActionKind: r.status === 'proposed'
              ? 'respond_meeting'
              : r.status === 'confirmed' && !r.scheduled_start_at
                ? 'schedule_meeting'
                : 'view_meeting',
            scheduledStartAt: r.scheduled_start_at ? new Date(r.scheduled_start_at).toISOString() : null,
            viewerRole: r.organizer_user_id === userId ? 'organizer' : 'attendee',
            counterpartDisplayName: null,
            hasOutcome: false,
          };
        }),
        ...registeredEvents.map(e => {
          const eventDate = new Date(e.scheduled_start_at);
          return {
            meetingId: String(e.id),
            status: String(e.status),
            bucket: 'upcoming',
            suggestedActionKind: 'view_meeting',
            scheduledStartAt: eventDate.toISOString(),
            viewerRole: 'attendee',
            counterpartDisplayName: String(e.association_name || e.title),
            hasOutcome: false,
            isEvent: true,
            communityId: String(e.association_id),
          };
        })
      ],
      meetingFollowUps: businessMeetingFollowUps.map(r => {
        const isOverdue = r.due_at && new Date(r.due_at) < now;
        return {
          id: String(r.id),
          meetingId: String(r.meeting_id),
          status: String(r.status),
          dueAt: r.due_at ? new Date(r.due_at).toISOString() : null,
          temporalState: r.status === 'completed'
            ? 'completed'
            : r.status === 'cancelled'
              ? 'cancelled'
              : isOverdue
                ? 'overdue'
                : 'active',
          title: r.title || null,
        };
      }),
      relationshipActivity: graphTimelineEvents.map(r => ({
        id: String(r.id),
        occurredAt: r.occurred_at ? new Date(r.occurred_at).toISOString() : now.toISOString(),
        eventKind: String(r.event_kind),
        personNodeId: r.person_node_id || null,
        counterpartDisplayName: null,
      })),
      previews: {
        upcoming: todayEventsList,
        needs_action: [],
        overdue: [],
        due_soon: [],
        waiting: [],
        recent: [],
      },
      allUpcomingEvents: upcomingEventsList,
    };
  }


  // ==========================================
  // 1. Identity & Profiles - Delegated to ConnectIdentityService
  // ==========================================
  getMyProfile(userId: string) { return this.identityService.getMyProfile(userId); }
  updateMyProfile(userId: string, data: any) { return this.identityService.updateMyProfile(userId, data); }
  getMyIdentity(userId: string) { return this.identityService.getMyIdentity(userId); }
  upsertMyIdentity(userId: string, input: any) { return this.identityService.upsertMyIdentity(userId, input); }
  updateMyVisibility(userId: string, updates: any[]) { return this.identityService.updateMyVisibility(userId, updates); }
  getOrCreateMyShareLink(userId: string) { return this.identityService.getOrCreateMyShareLink(userId); }
  rotateMyShareLink(userId: string) { return this.identityService.rotateMyShareLink(userId); }
  getPublicIdentityByToken(token: string) { return this.identityService.getPublicIdentityByToken(token); }
  getMyShowcase(userId: string) { return this.identityService.getMyShowcase(userId); }
  addShowcaseItem(userId: string, item: any) { return this.identityService.addShowcaseItem(userId, item); }
  deleteShowcaseItem(userId: string, itemId: string) { return this.identityService.deleteShowcaseItem(userId, itemId); }

  // ==========================================
  // 2. Communities & Memberships - Delegated to ConnectCommunityService
  // ==========================================
  getMyCommunities(userId: string) { return this.communityService.getMyCommunities(userId); }
  checkCommunityMembership(userId: string, communityId: string) { return this.communityService.checkCommunityMembership(userId, communityId); }
  getCommunityDetail(userId: string, communityId: string) { return this.communityService.getCommunityDetail(userId, communityId); }
  listCommunityMembers(userId: string, communityId: string, searchQuery?: string, offset?: number, roleFilter?: string) { return this.communityService.listCommunityMembers(userId, communityId, searchQuery, offset, roleFilter); }
  getCommunityMemberProfile(userId: string, communityId: string, memberRef: string) { return this.communityService.getCommunityMemberProfile(userId, communityId, memberRef); }
  connectCommunityMember(userId: string, communityId: string, memberRef: string) { return this.communityService.connectCommunityMember(userId, communityId, memberRef); }
  updateCommunityMemberRole(userId: string, communityId: string, memberRef: string, role: string) { return this.communityService.updateCommunityMemberRole(userId, communityId, memberRef, role); }
  listCommunityNews(userId: string, communityId: string, offset: number) { return this.communityService.listCommunityNews(userId, communityId, offset); }
  getCommunityNewsDetail(userId: string, communityId: string, newsRef: string) { return this.communityService.getCommunityNewsDetail(userId, communityId, newsRef); }
  listJoinableCommunities(userId: string) { return this.communityService.listJoinableCommunities(userId); }
  requestCommunityJoin(userId: string, input: any) { return this.communityService.requestCommunityJoin(userId, input); }
  cancelCommunityJoin(userId: string, input: any) { return this.communityService.cancelCommunityJoin(userId, input); }
  createCommunity(userId: string, input: any) { return this.communityService.createCommunity(userId, input); }
  listCommunityJoinHistory(userId: string) { return this.communityService.listCommunityJoinHistory(userId); }
  syncCommunityJoinDecisions(userId: string) { return this.communityService.syncCommunityJoinDecisions(userId); }
  listCommunityJoinAdminRequests(userId: string) { return this.communityService.listCommunityJoinAdminRequests(userId); }
  listCommunityInvites(userId: string, communityId: string) { return this.communityService.listCommunityInvites(userId, communityId); }
  createCommunityInvite(userId: string, input: any) { return this.communityService.createCommunityInvite(userId, input); }
  listCommunityInviteTemplates(userId: string, communityId: string) { return this.communityService.listCommunityInviteTemplates(userId, communityId); }
  saveCommunityInviteTemplate(userId: string, input: any) { return this.communityService.saveCommunityInviteTemplate(userId, input); }
  resetCommunityInviteTemplate(userId: string, input: any) { return this.communityService.resetCommunityInviteTemplate(userId, input); }
  cancelCommunityInvite(userId: string, inviteRef: string) { return this.communityService.cancelCommunityInvite(userId, inviteRef); }
  resendCommunityInvite(userId: string, inviteRef: string, locale?: string) { return this.communityService.resendCommunityInvite(userId, inviteRef, locale); }
  getCommunityInviteByToken(userId: string, token: string) { return this.communityService.getCommunityInviteByToken(userId, token); }
  acceptCommunityInvite(userId: string, token: string, email: string) { return this.communityService.acceptCommunityInvite(userId, token, email); }
  updateAcceptedInviteRole(userId: string, inviteRef: string, role: string) { return this.communityService.updateAcceptedInviteRole(userId, inviteRef, role); }
  listInviteRoleHistory(userId: string, inviteRef: string) { return this.communityService.listInviteRoleHistory(userId, inviteRef); }
  listCommunityEvents(userId: string, communityId: string, tab: string, offset: number) { return this.communityService.listCommunityEvents(userId, communityId, tab, offset); }
  getCommunityEventDetail(userId: string, communityId: string, eventRef: string) { return this.communityService.getCommunityEventDetail(userId, communityId, eventRef); }
  registerCommunityEvent(userId: string, communityId: string, eventRef: string) { return this.communityService.registerCommunityEvent(userId, communityId, eventRef); }
  cancelCommunityEventRegistration(userId: string, communityId: string, eventRef: string) { return this.communityService.cancelCommunityEventRegistration(userId, communityId, eventRef); }

  // ==========================================
  // 3. Network, Connections & Recommendations - Delegated to ConnectNetworkService
  // ==========================================
  resolvePublicCounterparts(userIds: string[]) { return this.networkService.resolvePublicCounterparts(userIds); }
  listConnections(userId: string) { return this.networkService.listConnections(userId); }
  searchSavedCards(userId: string, query?: string) { return this.networkService.searchSavedCards(userId, query); }
  listGuestContacts(userId: string) { return this.networkService.listGuestContacts(userId); }
  getTodayRecommendations(userId: string) { return this.networkService.getTodayRecommendations(userId); }
  getPersonRecommendation(userId: string, personId: string) { return this.networkService.getPersonRecommendation(userId, personId); }
  dismissRecommendation(userId: string, recId: string) { return this.networkService.dismissRecommendation(userId, recId); }
  getNetworkFeed(userId: string, query?: any) { return this.networkService.getNetworkFeed(userId, query); }
  getCommunityActivityPreview(userId: string, communityId: string) { return this.networkService.getCommunityActivityPreview(userId, communityId); }
  getUnreadNotificationCount(userId: string) { return this.networkService.getUnreadNotificationCount(userId); }
  sendConnectionRequest(userId: string, input: any) { return this.networkService.sendConnectionRequest(userId, input); }
  acceptConnection(userId: string, body: any) { return this.networkService.acceptConnection(userId, body); }
  declineConnection(userId: string, body: any) { return this.networkService.declineConnection(userId, body); }
  cancelConnection(userId: string, connectionId: string) { return this.networkService.cancelConnection(userId, connectionId); }
  disconnectConnection(userId: string, body: any) { return this.networkService.disconnectConnection(userId, body); }
  blockUser(userId: string, targetUserId: string) { return this.networkService.blockUser(userId, targetUserId); }
  getConnectionState(userId: string, targetUserId: string) { return this.networkService.getConnectionState(userId, targetUserId); }
  getConnectionStateByToken(userId: string, token: string) { return this.networkService.getConnectionStateByToken(userId, token); }
  sendConnectionRequestByToken(userId: string, token: string, mutationKey?: string) { return this.networkService.sendConnectionRequestByToken(userId, token, mutationKey); }
  nfcTap(userId: string, input: any) { return this.networkService.nfcTap(userId, input); }
  getConnectionById(userId: string, connectionId: string) { return this.networkService.getConnectionById(userId, connectionId); }
  listIncomingRequests(userId: string) { return this.networkService.listIncomingRequests(userId); }
  listOutgoingRequests(userId: string) { return this.networkService.listOutgoingRequests(userId); }
  countConnectionsByStatus(userId: string) { return this.networkService.countConnectionsByStatus(userId); }
  getGuestContact(userId: string, contactId: string) { return this.networkService.getGuestContact(userId, contactId); }
  updateGuestContactOwnerFields(userId: string, contactId: string, fields: any) { return this.networkService.updateGuestContactOwnerFields(userId, contactId, fields); }
  deleteGuestContact(userId: string, contactId: string) { return this.networkService.deleteGuestContact(userId, contactId); }
  reportUser(userId: string, data: any) { return this.networkService.reportUser(userId, data); }
  getPersonalization(userId: string) { return this.networkService.getPersonalization(userId); }
  updatePersonalizationPreferences(userId: string, input: any) { return this.networkService.updatePersonalizationPreferences(userId, input); }
  recordPersonalizationInteraction(userId: string, input: any) { return this.networkService.recordPersonalizationInteraction(userId, input); }
  resetPersonalization(userId: string) { return this.networkService.resetPersonalization(userId); }
  createPersonPlan(userId: string, input: any) { return this.networkService.createPersonPlan(userId, input); }
  listPersonPlans(userId: string, input?: any) { return this.networkService.listPersonPlans(userId, input); }
  setPersonPlanStatus(userId: string, input: any) { return this.networkService.setPersonPlanStatus(userId, input); }
  getPersonJourney(userId: string, input: any) { return this.networkService.getPersonJourney(userId, input); }
  shareGuestContact(userId: string, input: any) { return this.networkService.shareGuestContact(userId, input); }

  // ==========================================
  // 4. Notifications & Push Messages (Core Service)
  // ==========================================
  async listNotifications(userId: string, limit: number = 30, unreadOnly: boolean = false) {
    const [rows, pendingConnections] = await Promise.all([
      this.prisma.$queryRaw<any[]>`
        SELECT id, recipient_user_id, source_domain, source_record_id, event_kind, notification_kind,
               title_key, body_key, safe_display_data, action_kind, action_label_key, action_target,
               priority, status, created_at, updated_at, read_at, app_scope, target_app
        FROM public.business_notifications
        WHERE recipient_user_id = ${userId}::uuid
          AND (${!unreadOnly} OR (status != 'read' AND read_at IS NULL))
          AND (app_scope IS NULL OR app_scope != 'association_app')
          AND (target_app IS NULL OR target_app != 'association_app')
        ORDER BY created_at DESC
        LIMIT ${limit}
      `.catch((err) => {
        console.error('Error listing notifications:', err);
        return [];
      }),
      this.prisma.$queryRaw<any[]>`
        SELECT id, requester_user_id, status, requested_at, created_at
        FROM public.user_connections
        WHERE recipient_user_id = ${userId}::uuid AND status = 'pending'::public.global_connection_status
        ORDER BY COALESCE(requested_at, created_at) DESC
        LIMIT 10
      `.catch(() => []),
    ]);

    // Tra cứu trạng thái thực tế mới nhất của các connection trong user_connections
    const allConnIds = rows
      .map(r => r.source_record_id || r.safe_display_data?.connectionId)
      .filter(Boolean);

    let connStatusMap = new Map<string, string>();
    if (allConnIds.length > 0) {
      try {
        const connRows = await this.prisma.$queryRaw<any[]>`
          SELECT id, status
          FROM public.user_connections
          WHERE id = ANY(${allConnIds}::uuid[])
        `.catch(() => []);
        for (const c of connRows) {
          connStatusMap.set(c.id, c.status);
        }
      } catch {
        /* ignore */
      }
    }

    const mapped: any[] = rows.map(r => {
      const connId = r.source_record_id || r.safe_display_data?.connectionId;
      const connStatus = (connId ? connStatusMap.get(connId) : null) ||
        r.safe_display_data?.connectionStatus ||
        (r.notification_kind === 'connection_request_accepted' ? 'accepted' : r.notification_kind === 'connection_request_declined' ? 'declined' : 'pending');

      return {
        id: r.id,
        recipientUserId: r.recipient_user_id,
        sourceDomain: r.source_domain || 'meeting',
        sourceRecordId: r.source_record_id || '',
        eventKind: r.event_kind || '',
        notificationKind: r.notification_kind || '',
        titleKey: r.title_key || '',
        bodyKey: r.body_key || '',
        appScope: r.app_scope || r.target_app || 'ceo1983_app',
        targetApp: r.target_app || r.app_scope || 'ceo1983_app',
        safeDisplayData: {
          ...(r.safe_display_data || {}),
          connectionStatus: connStatus,
          connectionId: connId || undefined,
        },
        action: {
          kind: r.action_kind || 'open_route',
          labelKey: r.action_label_key || 'bc.notif.action.view',
          targetRoute: r.action_target?.route || (r.source_domain === 'connection' ? '/connect-app/network' : null),
          targetParams: r.action_target?.params || null,
          targetSearch: r.action_target?.search || (r.source_domain === 'connection' ? { tab: 'requests' } : null),
          requiresConfirmation: false,
          canonicalCapability: null,
        },
        priority: r.priority || 'normal',
        status: r.status || 'unread',
        scheduledFor: null,
        deliveredAt: r.created_at ? new Date(r.created_at).toISOString() : null,
        readAt: r.read_at ? new Date(r.read_at).toISOString() : null,
        archivedAt: null,
        expiredAt: null,
        dedupeKey: r.id,
        schemaVersion: 1,
        createdAt: r.created_at ? new Date(r.created_at).toISOString() : null,
        updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : null,
      };
    });

    // Bổ sung thông báo phát sóng CRM (public.notifications) vào danh sách
    try {
      const broadcastRows = await this.prisma.$queryRaw<any[]>`
        SELECT id, code, title, body, audience, channel, status, sent_at, created_at, app_scope, target_app
        FROM public.notifications
        WHERE status = 'sent'
        ORDER BY COALESCE(sent_at, created_at) DESC
        LIMIT 25
      `.catch(() => []);

      for (const br of broadcastRows) {
        mapped.push({
          id: br.code || br.id,
          recipientUserId: userId,
          sourceDomain: 'broadcast',
          sourceRecordId: br.id,
          eventKind: 'system_broadcast',
          notificationKind: 'system_broadcast',
          titleKey: br.title,
          bodyKey: br.body || '',
          appScope: br.app_scope || 'all',
          targetApp: br.target_app || 'all',
          safeDisplayData: {
            title: br.title,
            content: br.body || '',
            message: br.body || '',
          },
          action: {
            kind: 'open_route',
            labelKey: 'bc.notif.action.view',
            targetRoute: '/connect-app/notifications',
            targetParams: null,
            targetSearch: null,
            requiresConfirmation: false,
            canonicalCapability: null,
          },
          priority: 'normal',
          status: 'delivered',
          scheduledFor: null,
          deliveredAt: br.sent_at ? new Date(br.sent_at).toISOString() : new Date(br.created_at).toISOString(),
          readAt: null,
          archivedAt: null,
          expiredAt: null,
          dedupeKey: br.id,
          schemaVersion: 1,
          createdAt: br.sent_at ? new Date(br.sent_at).toISOString() : new Date(br.created_at).toISOString(),
          updatedAt: br.sent_at ? new Date(br.sent_at).toISOString() : new Date(br.created_at).toISOString(),
        });
      }
    } catch (e) {
      console.warn('Error fetching broadcast notifications for connect-app:', e);
    }

    // Đảm bảo mọi pending connection request đều có mặt trong danh sách thông báo
    const existingConnIds = new Set(
      mapped
        .filter(m => m.notificationKind === 'connection_request_received' || m.sourceDomain === 'connection')
        .map(m => m.sourceRecordId)
    );

    const missingConns = pendingConnections.filter(c => !existingConnIds.has(c.id));
    if (missingConns.length > 0) {
      const requesterIds = missingConns.map(c => c.requester_user_id);
      const counterparts = await this.resolvePublicCounterparts(requesterIds);
      const cpMap = new Map(counterparts.map(cp => [cp.userId, cp]));

      for (const conn of missingConns) {
        const cp = cpMap.get(conn.requester_user_id) || {
          displayName: 'Hội viên CEO 1983',
          avatarUrl: null,
          headline: null,
          companyName: null,
        };
        const dt = conn.requested_at || conn.created_at || new Date();
        mapped.unshift({
          id: `conn-req-${conn.id}`,
          recipientUserId: userId,
          sourceDomain: 'connection',
          sourceRecordId: conn.id,
          eventKind: 'connection_request_received',
          notificationKind: 'connection_request_received',
          titleKey: 'bc.notif.kind.connection_request_received.title',
          bodyKey: 'bc.notif.kind.connection_request_received.body',
          appScope: 'ceo1983_app',
          targetApp: 'ceo1983_app',
          safeDisplayData: {
            counterpartDisplayName: cp.displayName || 'Hội viên CEO 1983',
            avatarUrl: cp.avatarUrl || null,
            jobTitle: cp.headline || null,
            companyName: cp.companyName || null,
            connectionId: conn.id,
            connectionStatus: 'pending',
            source: 'nfc',
          },
          action: {
            kind: 'open_route',
            labelKey: 'bc.notif.action.viewConnectionRequests',
            targetRoute: '/connect-app/network',
            targetParams: null,
            targetSearch: { tab: 'requests' },
            requiresConfirmation: false,
            canonicalCapability: null,
          },
          priority: 'high',
          status: 'delivered',
          scheduledFor: null,
          deliveredAt: new Date(dt).toISOString(),
          readAt: null,
          archivedAt: null,
          expiredAt: null,
          dedupeKey: `conn-req-${conn.id}`,
          schemaVersion: 1,
          createdAt: new Date(dt).toISOString(),
          updatedAt: new Date(dt).toISOString(),
        });
      }
    }

    // Bổ sung thông báo từ Hiệp hội CEO 1983 (member_notifications, hội phí quá hạn, cơ hội, tin nhắn BQT)
    try {
      const members = await this.prisma.$queryRaw<any[]>`
        SELECT id, code, full_name, email, dues_status, membership_tier, renewal_date
        FROM public.members
        WHERE user_id = ${userId}::uuid
           OR LOWER(email) IN (SELECT LOWER(email) FROM public.users WHERE id = ${userId}::uuid)
      `.catch(() => []);

      const memberIds = members.map(m => m.id);
      const memberCodes = members.map(m => m.code).filter(Boolean);

      // 1. Lấy thông báo cá nhân từ hiệp hội (public.member_notifications)
      const memNotifs = memberIds.length > 0
        ? await this.prisma.$queryRaw<any[]>`
            SELECT id, recipient_id, title, body, read, dismissed, ref_type, ref_id, created_at
            FROM public.member_notifications
            WHERE recipient_id::text = ANY(${memberIds}::text[]) OR recipient_id::text = ${userId}::text
            ORDER BY created_at DESC
            LIMIT 30
          `.catch(() => [])
        : await this.prisma.$queryRaw<any[]>`
            SELECT id, recipient_id, title, body, read, dismissed, ref_type, ref_id, created_at
            FROM public.member_notifications
            WHERE recipient_id::text = ${userId}::text
            ORDER BY created_at DESC
            LIMIT 30
          `.catch(() => []);

      for (const mn of memNotifs) {
        if (mn.dismissed) continue;
        const isInvoice = mn.ref_type === 'invoice' || (mn.title && mn.title.toLowerCase().includes('phí'));
        mapped.push({
          id: `mem-notif-${mn.id}`,
          recipientUserId: userId,
          sourceDomain: isInvoice ? 'finance' : 'association',
          sourceRecordId: mn.ref_id || mn.id,
          eventKind: isInvoice ? 'invoice_reminder' : 'system_broadcast',
          notificationKind: isInvoice ? 'overdue_payment_reminder' : 'system_broadcast',
          titleKey: mn.title,
          bodyKey: mn.body || '',
          appScope: 'all',
          targetApp: 'all',
          safeDisplayData: {
            invoiceId: isInvoice ? (mn.ref_id || mn.id) : undefined,
            title: mn.title,
            message: mn.body || '',
            body: mn.body || '',
            actionUrl: isInvoice ? '/association/renew/pay' : undefined,
          },
          action: {
            kind: 'open_route',
            labelKey: isInvoice ? 'Thanh toán phí' : 'bc.notif.action.view',
            targetRoute: isInvoice ? '/association/renew/pay' : '/connect-app/notifications',
            targetParams: null,
            targetSearch: null,
            requiresConfirmation: false,
            canonicalCapability: null,
          },
          priority: isInvoice ? 'critical' : 'normal',
          status: mn.read ? 'read' : 'delivered',
          scheduledFor: null,
          deliveredAt: mn.created_at ? new Date(mn.created_at).toISOString() : new Date().toISOString(),
          readAt: mn.read && mn.created_at ? new Date(mn.created_at).toISOString() : null,
          archivedAt: null,
          expiredAt: null,
          dedupeKey: `mem-notif-${mn.id}`,
          schemaVersion: 1,
          createdAt: mn.created_at ? new Date(mn.created_at).toISOString() : new Date().toISOString(),
          updatedAt: mn.created_at ? new Date(mn.created_at).toISOString() : new Date().toISOString(),
        });
      }

      // 2. Kiểm tra trạng thái hội phí quá hạn chưa thanh toán (tài khoản Lê Hoàng Long hoặc hội viên khác)
      const overdueMember = (members as any[]).find((m: any) => m.dues_status === 'overdue');
      if (overdueMember) {
        const invRows = await this.prisma.$queryRaw<any[]>`
          SELECT id, invoice_no, title, amount, due_date, status
          FROM public.invoices
          WHERE (member_id::text = ${overdueMember.id}::text OR user_id = ${userId}::uuid)
            AND status IN ('overdue', 'unpaid', 'pending')
          ORDER BY created_at DESC
          LIMIT 1
        `.catch(() => []);

        const inv = invRows[0];
        const invAmount = inv?.amount ? Number(inv.amount).toLocaleString('vi-VN') + ' đ' : 'Cần thanh toán';
        const invTitle = 'Thông báo: Hội phí hội viên quá hạn chưa thanh toán';
        const invBody = `Hội phí của hội viên ${overdueMember.full_name || 'CEO 1983'} (${invAmount}) đã quá hạn thanh toán. Vui lòng hoàn tất đóng phí để tiếp tục duy trì quyền lợi và kết nối B2B trên hệ thống.`;

        // Chỉ thêm nếu chưa có thông báo tương đương
        const alreadyHasOverdue = mapped.some(m => m.notificationKind === 'overdue_payment_reminder' || (m.titleKey && m.titleKey.includes('quá hạn')));
        if (!alreadyHasOverdue) {
          mapped.unshift({
            id: `dues-overdue-${overdueMember.id}`,
            recipientUserId: userId,
            sourceDomain: 'finance',
            sourceRecordId: inv?.id || overdueMember.id,
            eventKind: 'invoice_reminder',
            notificationKind: 'overdue_payment_reminder',
            titleKey: invTitle,
            bodyKey: invBody,
            appScope: 'all',
            targetApp: 'all',
            safeDisplayData: {
              invoiceId: inv?.id || overdueMember.id,
              amount: inv?.amount || null,
              message: invBody,
              body: invBody,
              actionUrl: '/association/renew/pay',
              status: 'overdue',
            },
            action: {
              kind: 'open_route',
              labelKey: 'Thanh toán ngay',
              targetRoute: '/association/renew/pay',
              targetParams: null,
              targetSearch: null,
              requiresConfirmation: false,
              canonicalCapability: null,
            },
            priority: 'critical',
            status: 'delivered',
            scheduledFor: null,
            deliveredAt: new Date().toISOString(),
            readAt: null,
            archivedAt: null,
            expiredAt: null,
            dedupeKey: `dues-overdue-${overdueMember.id}`,
            schemaVersion: 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }
      }

      // 3. Cơ hội giao thương B2B mới nhất (public.opportunities)
      const oppRows = await this.prisma.$queryRaw<any[]>`
        SELECT id, title, description, type, budget_min, budget_max, region, industry, deadline, status, created_at, claimed_by_name
        FROM public.opportunities
        WHERE status = 'open'
        ORDER BY created_at DESC
        LIMIT 5
      `.catch(() => []);

      for (const opp of oppRows) {
        const oppTitle = `[Cơ hội B2B] ${opp.title}`;
        const oppBody = opp.description || `Cơ hội kinh doanh mới ngành ${opp.industry || 'B2B'} với ngân sách ${opp.budget_min ? Number(opp.budget_min).toLocaleString('vi-VN') + ' đ' : 'Thỏa thuận'}. Bấm để xem chi tiết và tiếp nhận!`;
        mapped.push({
          id: `opp-notif-${opp.id}`,
          recipientUserId: userId,
          sourceDomain: 'opportunity',
          sourceRecordId: opp.id,
          eventKind: 'opportunity_new',
          notificationKind: 'opportunity_new',
          titleKey: oppTitle,
          bodyKey: oppBody,
          appScope: 'all',
          targetApp: 'all',
          safeDisplayData: {
            opportunityId: opp.id,
            title: opp.title,
            description: opp.description,
            message: oppBody,
            body: oppBody,
          },
          action: {
            kind: 'open_route',
            labelKey: 'Xem cơ hội',
            targetRoute: `/connect-app/community/clb-ceo-1983/opportunities/${opp.id}`,
            targetParams: null,
            targetSearch: null,
            requiresConfirmation: false,
            canonicalCapability: null,
          },
          priority: 'high',
          status: 'delivered',
          scheduledFor: null,
          deliveredAt: opp.created_at ? new Date(opp.created_at).toISOString() : new Date().toISOString(),
          readAt: null,
          archivedAt: null,
          expiredAt: null,
          dedupeKey: `opp-notif-${opp.id}`,
          schemaVersion: 1,
          createdAt: opp.created_at ? new Date(opp.created_at).toISOString() : new Date().toISOString(),
          updatedAt: opp.created_at ? new Date(opp.created_at).toISOString() : new Date().toISOString(),
        });
      }

      // 4. Tin nhắn từ Ban Quản Trị hệ thống (public.messages có from_id = 'ADMIN')
      if (memberCodes.length > 0) {
        const adminMessages = await this.prisma.$queryRaw<any[]>`
          SELECT id, from_id, to_id, text, created_at
          FROM public.messages
          WHERE from_id = 'ADMIN' AND LOWER(to_id) = ANY(${memberCodes.map(c => c.toLowerCase())}::text[])
          ORDER BY created_at DESC
          LIMIT 5
        `.catch(() => []);

        for (const msg of adminMessages) {
          const rawText = msg.text || '';
          const cleanText = rawText.replace(/\[action:[^\]]+\]/g, '').trim() || 'Bạn có thông báo mới từ Ban Quản trị CLB CEO 1983.';
          mapped.push({
            id: `msg-admin-${msg.id}`,
            recipientUserId: userId,
            sourceDomain: 'system',
            sourceRecordId: msg.id,
            eventKind: 'system_broadcast',
            notificationKind: 'system_broadcast',
            titleKey: 'Tin nhắn từ Ban Quản Trị Hiệp Hội',
            bodyKey: cleanText,
            appScope: 'all',
            targetApp: 'all',
            safeDisplayData: {
              title: 'Tin nhắn từ Ban Quản Trị Hiệp Hội',
              message: cleanText,
              body: cleanText,
              actionUrl: '/association/messages',
            },
            action: {
              kind: 'open_route',
              labelKey: 'Xem tin nhắn',
              targetRoute: '/association/messages',
              targetParams: null,
              targetSearch: null,
              requiresConfirmation: false,
              canonicalCapability: null,
            },
            priority: 'high',
            status: 'delivered',
            scheduledFor: null,
            deliveredAt: msg.created_at ? new Date(msg.created_at).toISOString() : new Date().toISOString(),
            readAt: null,
            archivedAt: null,
            expiredAt: null,
            dedupeKey: `msg-admin-${msg.id}`,
            schemaVersion: 1,
            createdAt: msg.created_at ? new Date(msg.created_at).toISOString() : new Date().toISOString(),
            updatedAt: msg.created_at ? new Date(msg.created_at).toISOString() : new Date().toISOString(),
          });
        }
      }
    } catch (err) {
      console.warn('Error fetching association member notifications & opportunities:', err);
    }

    // Sắp xếp thống nhất theo thời gian tạo mới nhất
    mapped.sort((a, b) => {
      const timeA = new Date(a.createdAt || a.deliveredAt || 0).getTime();
      const timeB = new Date(b.createdAt || b.deliveredAt || 0).getTime();
      return timeB - timeA;
    });

    if (unreadOnly) {
      return mapped.filter(n => n.readAt === null && n.status !== 'read').slice(0, limit);
    }

    return mapped.slice(0, limit);
  }


  async markNotificationsRead(userId: string, ids?: string[]) {
    if (ids && ids.length > 0) {
      const validUuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
      const uuidIds = ids.filter(id => validUuidRegex.test(id));
      if (uuidIds.length > 0) {
        await this.prisma.$executeRaw`
          UPDATE public.business_notifications
          SET status = 'read', read_at = now()
          WHERE recipient_user_id = ${userId}::uuid AND id = ANY(${uuidIds}::uuid[])
        `.catch(() => {});
      }
    } else {
      await this.prisma.$executeRaw`
        UPDATE public.business_notifications
        SET status = 'read', read_at = now()
        WHERE recipient_user_id = ${userId}::uuid AND (status = 'unread' OR status = 'delivered')
          AND (
            app_scope = 'ceo1983_app' OR app_scope = 'association_app' OR app_scope = 'all' OR app_scope = 'crm' OR target_app = 'ceo1983_app' OR target_app = 'association_app' OR target_app = 'all' OR target_app = 'crm'
            OR app_scope IS NULL
          )
      `;
    }

    try {
      const unreadRes = await this.prisma.$queryRaw<any[]>`
        SELECT COUNT(id)::int as count FROM public.business_notifications
        WHERE recipient_user_id = ${userId}::uuid AND (status = 'unread' OR status = 'delivered')
          AND (
            app_scope = 'ceo1983_app' OR app_scope = 'association_app' OR app_scope = 'all' OR app_scope = 'crm' OR target_app = 'ceo1983_app' OR target_app = 'association_app' OR target_app = 'all' OR target_app = 'crm'
            OR app_scope IS NULL
          )
      `.catch(() => [{ count: 0 }]);
      const unreadCount = Number(unreadRes[0]?.count || 0);
      this.gateway?.emitUnreadNotificationCount(userId, unreadCount);
    } catch {
      // ignore
    }

    return { ok: true };
  }

  async deleteNotification(userId: string, id: string) {
    if (id.startsWith('conn-req-')) {
      const connId = id.replace('conn-req-', '');
      await this.prisma.$executeRaw`
        UPDATE public.user_connections
        SET status = 'declined'::public.global_connection_status, responded_at = now(), updated_at = now()
        WHERE id = ${connId}::uuid AND recipient_user_id = ${userId}::uuid
      `.catch(() => {});
    } else {
      await this.prisma.$executeRaw`
        DELETE FROM public.business_notifications
        WHERE recipient_user_id = ${userId}::uuid AND id = ${id}::uuid
      `.catch(() => {});
      await this.prisma.$executeRaw`
        DELETE FROM public.member_notifications
        WHERE user_id = ${userId}::uuid AND id = ${id}::uuid
      `.catch(() => {});
    }

    try {
      const unreadRes = await this.prisma.$queryRaw<any[]>`
        SELECT COUNT(id)::int as count FROM public.business_notifications
        WHERE recipient_user_id = ${userId}::uuid AND (status = 'unread' OR status = 'delivered')
          AND (
            app_scope = 'ceo1983_app' OR app_scope = 'association_app' OR app_scope = 'all' OR app_scope = 'crm' OR target_app = 'ceo1983_app' OR target_app = 'association_app' OR target_app = 'all' OR target_app = 'crm'
            OR app_scope IS NULL
          )
      `.catch(() => [{ count: 0 }]);
      const unreadCount = Number(unreadRes[0]?.count || 0);
      this.gateway?.emitUnreadNotificationCount(userId, unreadCount);
      this.gateway?.server?.to(`user:${userId}`).emit('notification:deleted', {
        id,
        timestamp: new Date().toISOString(),
      });
    } catch {
      // ignore
    }

    return { ok: true, id };
  }

  async deleteNotifications(userId: string, ids: string[]) {
    if (!ids || ids.length === 0) return { ok: true, deleted: 0 };

    const connIds = ids.filter((id) => id.startsWith('conn-req-')).map((id) => id.replace('conn-req-', ''));
    const notifIds = ids.filter((id) => !id.startsWith('conn-req-'));

    if (connIds.length > 0) {
      await this.prisma.$executeRaw`
        UPDATE public.user_connections
        SET status = 'declined'::public.global_connection_status, responded_at = now(), updated_at = now()
        WHERE id = ANY(${connIds}::uuid[]) AND recipient_user_id = ${userId}::uuid
      `.catch(() => {});
    }

    if (notifIds.length > 0) {
      await this.prisma.$executeRaw`
        DELETE FROM public.business_notifications
        WHERE recipient_user_id = ${userId}::uuid AND id = ANY(${notifIds}::uuid[])
      `.catch(() => {});
      await this.prisma.$executeRaw`
        DELETE FROM public.member_notifications
        WHERE user_id = ${userId}::uuid AND id = ANY(${notifIds}::uuid[])
      `.catch(() => {});
    }

    this.gateway.server?.to(`user:${userId}`).emit('notification:deleted', {
      ids,
      timestamp: new Date().toISOString(),
    });

    return { ok: true, deleted: ids.length };
  }

  async listMyMemberNotifications(userId: string) {
    const users = await this.prisma.$queryRaw<any[]>`
      SELECT id, email, phone, created_at FROM public.users WHERE id = ${userId}::uuid LIMIT 1
    `.catch(() => []);
    const userEmail = users[0]?.email || '';
    const userPhone = users[0]?.phone || '';
    const userCreatedAt = users[0]?.created_at ? new Date(users[0].created_at).getTime() : Date.now();

    const members = await this.prisma.$queryRaw<any[]>`
      SELECT id, code FROM public.members
      WHERE user_id = ${userId}::uuid
         OR (email IS NOT NULL AND LOWER(email) = LOWER(${userEmail}))
         OR (phone IS NOT NULL AND phone = ${userPhone})
    `.catch(() => []);

    const recipientKeys: string[] = [userId];
    for (const m of members) {
      if (m.id) recipientKeys.push(String(m.id));
      if (m.code) recipientKeys.push(String(m.code));
    }

    const [broadcast, personal, business] = await Promise.all([
      this.prisma.$queryRaw<any[]>`
        SELECT id, code, title, body, audience, sent_at, created_at, app_scope, target_app, target_channel, pushed_to_messages
        FROM public.notifications
        WHERE (status = 'sent' OR status = 'active' OR status IS NULL)
          AND (app_scope = 'association_app' OR app_scope = 'all' OR app_scope IS NULL
               OR target_app = 'association_app' OR target_app = 'all' OR target_app IS NULL)
        ORDER BY COALESCE(sent_at, created_at) DESC
        LIMIT 30
      `.catch(() => []),
      this.prisma.$queryRaw<any[]>`
        SELECT id, title, body, created_at, read, dismissed, ref_type, ref_id
        FROM public.member_notifications
        WHERE recipient_id::text = ANY(${recipientKeys}::text[])
        ORDER BY created_at DESC
        LIMIT 50
      `.catch(() => []),
      this.prisma.$queryRaw<any[]>`
        SELECT id, title_key, body_key, safe_display_data, notification_kind, created_at, read_at, source_record_id, pushed_to_messages
        FROM public.business_notifications
        WHERE recipient_user_id = ${userId}::uuid
          AND (app_scope = 'association_app' OR target_app = 'association_app' OR app_scope = 'all' OR target_app = 'all' OR app_scope IS NULL)
        ORDER BY created_at DESC
        LIMIT 40
      `.catch(() => []),
    ]);

    const dismissedRows = await this.prisma.$queryRaw<any[]>`
      SELECT notification_id FROM public.broadcast_notification_dismissals
      WHERE user_id = ${userId}::uuid
    `.catch(() => []);
    const dismissedIds = new Set(dismissedRows.map((r) => r.notification_id));

    // Resolve real-time connection status for connection request items
    const allConnIds = [
      ...personal.filter((p) => p.ref_type === 'connection' && p.ref_id).map((p) => p.ref_id),
      ...business.map((b) => b.safe_display_data?.connectionId || b.source_record_id).filter(Boolean),
    ].filter((id) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(id)));

    const connStatusMap: Record<string, string> = {};
    if (allConnIds.length > 0) {
      const connRows = await this.prisma.$queryRaw<any[]>`
        SELECT id, status FROM public.user_connections
        WHERE id = ANY(${allConnIds}::uuid[])
      `.catch(() => []);
      for (const row of connRows) {
        connStatusMap[row.id] = row.status;
      }
    }

    const typeMap = (audience: string | null) => {
      const a = (audience ?? '').toLowerCase();
      if (a.includes('event') || a.includes('sự kiện')) return 'event';
      if (a.includes('fee') || a.includes('phí')) return 'fee';
      if (a.includes('opp') || a.includes('cơ hội')) return 'opportunity';
      return 'system';
    };

    const existingPersonalKeys = new Set<string>();
    for (const p of personal) {
      if (p.id) existingPersonalKeys.add(String(p.id));
      if (p.ref_id) existingPersonalKeys.add(String(p.ref_id));
    }

    // Chỉ lấy broadcast thông báo chung còn hiệu lực (từ lúc tạo tài khoản - 3 ngày trở đi)
    const broadcastItems = broadcast
      .filter((n) => {
        if (n.id && existingPersonalKeys.has(String(n.id))) return false;
        if (n.code && existingPersonalKeys.has(String(n.code))) return false;
        const sentTime = new Date(n.sent_at || n.created_at).getTime();
        // Không dump toàn bộ thông báo cũ từ nhiều tháng trước lên tài khoản mới tạo
        return sentTime >= userCreatedAt - (3 * 24 * 60 * 60 * 1000);
      })
      .map((n) => {
        const isDismissed = dismissedIds.has(n.id) || (n.code && dismissedIds.has(n.code));
        return {
          id: n.id,
          code: n.code,
          title: n.title,
          body: n.body,
          time: n.sent_at ? new Date(n.sent_at).toISOString() : new Date(n.created_at).toISOString(),
          createdAt: n.sent_at ? new Date(n.sent_at).toISOString() : new Date(n.created_at).toISOString(),
          type: typeMap(n.audience),
          unread: !isDismissed,
          dismissed: Boolean(isDismissed),
          priority: !isDismissed ? 'high' : 'low',
          personal: false,
          notificationKind: 'system_broadcast',
          targetChannel: n.target_channel || null,
          pushedToMessages: Boolean(n.pushed_to_messages || (n.target_channel && n.target_channel !== 'none')),
        };
      });

    const personalItems = personal.map((n) => {
      const isConn = n.ref_type === 'connection' && n.ref_id;
      const connStatus = isConn && connStatusMap[n.ref_id] ? connStatusMap[n.ref_id] : null;
      return {
        id: n.id,
        title: n.title,
        body: n.body,
        time: n.created_at ? new Date(n.created_at).toISOString() : new Date().toISOString(),
        createdAt: n.created_at ? new Date(n.created_at).toISOString() : new Date().toISOString(),
        type: 'network',
        unread: !n.read,
        dismissed: Boolean(n.dismissed),
        priority: !n.read ? 'high' : 'medium',
        personal: true,
        refType: n.ref_type,
        refId: n.ref_id,
        sourceRecordId: isConn ? n.ref_id : undefined,
        safeDisplayData: isConn ? { connectionId: n.ref_id, connectionStatus: connStatus } : undefined,
      };
    });

    const businessItems = (business || []).map((b) => {
      const safe = b.safe_display_data || {};
      const connId = safe.connectionId || b.source_record_id;
      if (connId) {
        safe.connectionId = connId;
        if (connStatusMap[connId]) {
          safe.connectionStatus = connStatusMap[connId];
        }
      }
      const counterpartName = safe.counterpartDisplayName || safe.senderName || 'Hội viên CEO 1983';

      let title = safe.title || b.title_key || 'Thông báo mới';
      let body = safe.body || safe.message || b.body_key || '';

      if (b.notification_kind === 'connection_request_received' || b.title_key?.includes('connection_request_received') || title?.includes('connection_request_received')) {
        title = `Lời mời kết nối mới`;
        body = `${counterpartName} muốn kết nối danh thiếp số với bạn.`;
      } else if (b.notification_kind === 'connection_request_accepted' || b.title_key?.includes('connection_request_accepted') || title?.includes('connection_request_accepted')) {
        title = `Kết nối thành công`;
        body = `${counterpartName} đã chấp nhận lời mời kết nối của bạn.`;
      } else if (b.notification_kind === 'connection_request_declined' || b.title_key?.includes('connection_request_declined') || title?.includes('connection_request_declined')) {
        title = `Lời mời kết nối bị từ chối`;
        body = `${counterpartName} đã từ chối lời mời kết nối.`;
      }

      let itemType: any = 'network';
      if (b.notification_kind === 'interactive_poll' || safe.pollId || safe.type === 'poll') itemType = 'voting';
      else if (b.notification_kind === 'lucky_draw_winner' || safe.type === 'lucky_draw_winner' || safe.luckyNumber) itemType = 'event';
      else if (b.notification_kind === 'overdue_payment_reminder' || safe.invoiceId) itemType = 'fee';
      else if (b.notification_kind?.startsWith('meeting') || b.notification_kind?.startsWith('event')) itemType = 'event';

      return {
        id: b.id,
        title,
        body,
        time: b.created_at ? new Date(b.created_at).toISOString() : new Date().toISOString(),
        createdAt: b.created_at ? new Date(b.created_at).toISOString() : new Date().toISOString(),
        type: itemType,
        unread: !b.read_at,
        dismissed: false,
        priority: !b.read_at ? 'high' : 'medium',
        personal: true,
        refType: b.notification_kind,
        refId: connId || b.id,
        sourceRecordId: connId,
        safeDisplayData: safe,
        notificationKind: b.notification_kind,
        pushedToMessages: Boolean(b.pushed_to_messages),
      };
    });

    // Thông báo chào mừng chính thức cho hội viên mới
    const welcomeNotification: any = {
      id: `welcome-${userId}`,
      title: 'Chào mừng bạn đến với CLB Doanh Nhân CEO 1983!',
      body: 'Chúc mừng bạn đã chính thức gia nhập CLB Doanh Nhân CEO 1983. Hãy hoàn thiện danh thiếp số và bắt đầu khám phá các sự kiện, cơ hội giao thương B2B độc quyền!',
      time: users[0]?.created_at ? new Date(users[0].created_at).toISOString() : new Date().toISOString(),
      createdAt: users[0]?.created_at ? new Date(users[0].created_at).toISOString() : new Date().toISOString(),
      type: 'system',
      unread: true,
      dismissed: false,
      priority: 'high',
      personal: true,
      notificationKind: 'welcome_ceo1983',
      targetChannel: null,
      pushedToMessages: false,
    };

    const combined: any[] = [...businessItems, ...personalItems, ...broadcastItems];
    if (combined.length === 0) {
      combined.push(welcomeNotification);
    }

    const rawAll = combined.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    const seenKeys = new Set<string>();
    const deduplicated: any[] = [];
    for (const rawItem of rawAll) {
      const item = rawItem as any;
      const keys: string[] = [];
      if (item.id) keys.push(`id:${item.id}`);
      if (item.refType && item.refId) keys.push(`ref:${item.refType}:${item.refId}`);
      if (item.sourceRecordId) keys.push(`src:${item.sourceRecordId}`);
      if (item.title && item.body) {
        const normTitle = String(item.title).trim().toLowerCase();
        const normBody = String(item.body).trim().toLowerCase().slice(0, 80);
        const d = new Date(item.createdAt);
        const dayKey = isNaN(d.getTime()) ? '' : `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
        keys.push(`text:${normTitle}|${normBody}|${dayKey}`);
      }

      const isDuplicate = keys.some((k) => seenKeys.has(k));
      if (!isDuplicate) {
        for (const k of keys) seenKeys.add(k);
        deduplicated.push(item);
      }
    }
    return deduplicated;
  }

  async markMemberNotificationRead(userId: string, id: string) {
    await this.prisma.$executeRaw`
      UPDATE public.member_notifications SET read = true WHERE id = ${id}::uuid
    `.catch(() => null);
    await this.prisma.$executeRaw`
      UPDATE public.business_notifications SET read_at = now() WHERE id = ${id}::uuid AND recipient_user_id = ${userId}::uuid
    `.catch(() => null);
    return { marked: 1 };
  }

  async markAllMemberNotificationsRead(userId: string) {
    const members = await this.prisma.$queryRaw<any[]>`
      SELECT id FROM public.members WHERE user_id = ${userId}::uuid
    `.catch(() => []);
    const memberIds = members.map((m) => m.id);

    if (memberIds.length > 0) {
      await this.prisma.$executeRaw`
        UPDATE public.member_notifications SET read = true WHERE recipient_id = ANY(${memberIds}::text[]) OR recipient_id = ${userId}::text
      `.catch(() => null);
    }
    await this.prisma.$executeRaw`
      UPDATE public.business_notifications SET read_at = now() WHERE recipient_user_id = ${userId}::uuid AND read_at IS NULL
    `.catch(() => null);
    return { marked: true };
  }

  async dismissMemberNotification(userId: string, id: string) {
    await this.prisma.$executeRaw`
      UPDATE public.member_notifications SET dismissed = true, read = true WHERE id = ${id}::uuid
    `.catch(() => null);
    await this.prisma.$executeRaw`
      UPDATE public.business_notifications SET status = 'dismissed' WHERE id = ${id}::uuid AND recipient_user_id = ${userId}::uuid
    `.catch(() => null);
    await this.prisma.$executeRaw`
      INSERT INTO public.broadcast_notification_dismissals (user_id, notification_id)
      VALUES (${userId}::uuid, ${id}::uuid)
      ON CONFLICT DO NOTHING
    `.catch(() => null);
    return { dismissed: 1 };
  }

  async deleteMemberNotification(userId: string, id: string) {
    await this.prisma.$executeRaw`
      DELETE FROM public.member_notifications WHERE id = ${id}::uuid
    `.catch(() => null);
    await this.prisma.$executeRaw`
      DELETE FROM public.business_notifications WHERE id = ${id}::uuid AND recipient_user_id = ${userId}::uuid
    `.catch(() => null);
    await this.prisma.$executeRaw`
      INSERT INTO public.broadcast_notification_dismissals (user_id, notification_id)
      VALUES (${userId}::uuid, ${id}::uuid)
      ON CONFLICT DO NOTHING
    `.catch(() => null);
    return { deleted: 1 };
  }

  async dismissBroadcastNotification(userId: string, ids: string[]) {
    for (const nid of ids) {
      await this.prisma.$executeRaw`
        INSERT INTO public.broadcast_notification_dismissals (user_id, notification_id)
        VALUES (${userId}::uuid, ${nid}::uuid)
        ON CONFLICT DO NOTHING
      `.catch(() => null);
    }
    return { dismissed: ids.length };
  }

  async getNotificationPrefs(userId: string) {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT connection_request, connection_accepted, connection_status_update
      FROM public.gn_notification_prefs
      WHERE user_id = ${userId}::uuid
      LIMIT 1
    `.catch((err) => {
      console.error('Error getting notification prefs:', err);
      return [];
    });

    if (rows.length === 0) {
      return {
        connectionRequest: true,
        connectionAccepted: true,
        connectionStatusUpdate: true,
      };
    }

    const r = rows[0];
    return {
      connectionRequest: r.connection_request !== false,
      connectionAccepted: r.connection_accepted !== false,
      connectionStatusUpdate: r.connection_status_update !== false,
    };
  }

  async setNotificationPrefs(userId: string, prefs: any) {
    await this.prisma.$executeRaw`
      INSERT INTO public.gn_notification_prefs (user_id, connection_request, connection_accepted, connection_status_update, updated_at)
      VALUES (
        ${userId}::uuid,
        ${prefs.connectionRequest ?? true},
        ${prefs.connectionAccepted ?? true},
        ${prefs.connectionStatusUpdate ?? true},
        now()
      )
      ON CONFLICT (user_id) DO UPDATE SET
        connection_request = EXCLUDED.connection_request,
        connection_accepted = EXCLUDED.connection_accepted,
        connection_status_update = EXCLUDED.connection_status_update,
        updated_at = now()
    `;
    return prefs;
  }


  // ==========================================
  // 5. Customer Relationship Management - Delegated to ConnectCustomerService
  // ==========================================
  // ==========================================
  // 5. Customer Relationship Management - Delegated to ConnectCustomerService
  // ==========================================
  listBcCustomers(userId: string) { return this.customerService.listBcCustomers(userId); }
  createBcCustomer(userId: string, input: any) { return this.customerService.createBcCustomer(userId, input); }
  updateBcCustomer(userId: string, input: any) { return this.customerService.updateBcCustomer(userId, input); }
  deleteBcCustomer(userId: string, customerId: string) { return this.customerService.deleteBcCustomer(userId, customerId); }
  listBcCustomerLogs(userId: string, customerId: string) { return this.customerService.listBcCustomerLogs(userId, customerId); }
  addBcCustomerLog(userId: string, input: any) { return this.customerService.addBcCustomerLog(userId, input); }
  listBcCustomerTags(userId: string) { return this.customerService.listBcCustomerTags(userId); }
  createBcCustomerTag(userId: string, name: string) { return this.customerService.createBcCustomerTag(userId, name); }
  renameBcCustomerTag(userId: string, tagId: string, name: string) { return this.customerService.renameBcCustomerTag(userId, tagId, name); }
  deleteBcCustomerTag(userId: string, tagId: string) { return this.customerService.deleteBcCustomerTag(userId, tagId); }
  setBcCustomerTags(userId: string, customerId: string, names: string[]) { return this.customerService.setBcCustomerTags(userId, customerId, names); }
  listBcCustomerNeeds(userId: string, customerId: string) { return this.customerService.listBcCustomerNeeds(userId, customerId); }
  addBcCustomerNeed(userId: string, input: any) { return this.customerService.addBcCustomerNeed(userId, input); }
  updateBcCustomerNeed(userId: string, input: any) { return this.customerService.updateBcCustomerNeed(userId, input); }
  deleteBcCustomerNeed(userId: string, needId: string) { return this.customerService.deleteBcCustomerNeed(userId, needId); }
  suggestCustomerTags(userId: string, customerId: string) { return this.customerService.suggestCustomerTags(userId, customerId); }
  listCustomerTagSuggestHistory(userId: string, customerId: string) { return this.customerService.listCustomerTagSuggestHistory(userId, customerId); }
  saveCustomerTagSuggestFeedback(userId: string, input: any) { return this.customerService.saveCustomerTagSuggestFeedback(userId, input); }
  listCustomerTagSuggestFeedback(userId: string, customerId: string) { return this.customerService.listCustomerTagSuggestFeedback(userId, customerId); }

  // ==========================================
  // 6. Card Scanning & OCR - Delegated to ConnectCardScanService
  // ==========================================
  cardScanOcr(userId: string, imageDataUrl: string, clientToken: string) { return this.cardScanService.cardScanOcr(userId, imageDataUrl, clientToken); }
  cardScanResolve(userId: string, input: any) { return this.cardScanService.cardScanResolve(userId, input); }
  cardScanSave(userId: string, input: any) { return this.cardScanService.cardScanSave(userId, input); }

  // ==========================================
  // 7. Moments (BC-Mobile-2E) - Delegated to ConnectMomentsService
  // ==========================================
  prepareMoment(userId: string, data: any) { return this.momentsService.prepareMoment(userId, data); }
  finalizeMoment(userId: string, data: any) { return this.momentsService.finalizeMoment(userId, data); }
  updateMoment(userId: string, data: any) { return this.momentsService.updateMoment(userId, data); }
  deleteMoment(userId: string, momentId: string) { return this.momentsService.deleteMoment(userId, momentId); }
  listMomentComments(momentId: string, viewerUserId: string) { return this.momentsService.listMomentComments(momentId, viewerUserId); }
  createMomentComment(userId: string, momentId: string, data: any) { return this.momentsService.createMomentComment(userId, momentId, data); }
  deleteMomentComment(userId: string, momentId: string, commentId: string) { return this.momentsService.deleteMomentComment(userId, momentId, commentId); }
  toggleMuteMoment(userId: string, momentId: string) { return this.momentsService.toggleMuteMoment(userId, momentId); }
  getMomentMuteStatus(userId: string, momentId: string) { return this.momentsService.getMomentMuteStatus(userId, momentId); }
  toggleMomentCommentLike(userId: string, momentId: string, commentId: string) { return this.momentsService.toggleMomentCommentLike(userId, momentId, commentId); }
  toggleMomentLike(userId: string, momentId: string) { return this.momentsService.toggleMomentLike(userId, momentId); }
  getMomentLikeStatus(userId: string, momentId: string) { return this.momentsService.getMomentLikeStatus(userId, momentId); }
  listMomentPhotos(userId: string, momentId: string) { return this.momentsService.listMomentPhotos(userId, momentId); }
  addMomentPhotoSlots(userId: string, momentId: string, slots: number) { return this.momentsService.addMomentPhotoSlots(userId, momentId, slots); }
  commitMomentPhotos(userId: string, files: any) { return this.momentsService.commitMomentPhotos(userId, files); }
  removeMomentPhoto(userId: string, momentId: string, mediaId: string) { return this.momentsService.removeMomentPhoto(userId, momentId, mediaId); }
  listMomentReminders(userId: string, momentId: string | null, includeDone: boolean, limit: number) { return this.momentsService.listMomentReminders(userId, momentId, includeDone, limit); }
  createMomentReminder(userId: string, momentId: string, remindAt: string, label: string | null) { return this.momentsService.createMomentReminder(userId, momentId, remindAt, label); }
  setMomentReminderStatus(userId: string, reminderId: string, status: string) { return this.momentsService.setMomentReminderStatus(userId, reminderId, status); }
  deleteMomentReminder(userId: string, reminderId: string) { return this.momentsService.deleteMomentReminder(userId, reminderId); }
  notifyMomentTags(userId: string, input: any) { return this.momentsService.notifyMomentTags(userId, input); }

  // ==========================================
  // 8. NFC Device Sessions & Tags (BC-Mobile-5C) - Delegated to ConnectNfcService
  // ==========================================
  listMyDeviceSessions(userId: string, currentKey: string | null = null) { return this.nfcService.listMyDeviceSessions(userId, currentKey); }
  touchMyDeviceSession(userId: string, input: any) { return this.nfcService.touchMyDeviceSession(userId, input); }
  revokeMyDeviceSession(userId: string, sessionId: string, currentKey: string | null = null) { return this.nfcService.revokeMyDeviceSession(userId, sessionId, currentKey); }
  listMyNfcTags(userId: string) { return this.nfcService.listMyNfcTags(userId); }
  registerMyNfcTag(userId: string, data: any) { return this.nfcService.registerMyNfcTag(userId, data); }
  revokeMyNfcTag(userId: string, tagId: string) { return this.nfcService.revokeMyNfcTag(userId, tagId); }
  renameMyNfcTag(userId: string, input: any) { return this.nfcService.renameMyNfcTag(userId, input); }

  // ==========================================
  // 9. Opportunities - Delegated to ConnectOpportunityService
  // ==========================================
  listCommunityOpportunities(userId: string, communityId: string, query: string, offset: number) { return this.opportunityService.listCommunityOpportunities(userId, communityId, query, offset); }
  getCommunityOpportunityDetail(userId: string, communityId: string, oppId: string) { return this.opportunityService.getCommunityOpportunityDetail(userId, communityId, oppId); }
  createCommunityOpportunity(userId: string, communityId: string, data: any) { return this.opportunityService.createCommunityOpportunity(userId, communityId, data); }
  createCommunityNews(userId: string, communityId: string, data: any) { return this.opportunityService.createCommunityNews(userId, communityId, data); }
  claimCommunityOpportunity(userId: string, communityId: string, oppId: string) { return this.opportunityService.claimCommunityOpportunity(userId, communityId, oppId); }
  expressCommunityOpportunityInterest(userId: string, communityId: string, oppId: string, data: any) { return this.opportunityService.expressCommunityOpportunityInterest(userId, communityId, oppId, data); }
  withdrawCommunityOpportunityInterest(userId: string, communityId: string, oppId: string) { return this.opportunityService.withdrawCommunityOpportunityInterest(userId, communityId, oppId); }
  scheduleCommunityOpportunityFollowUp(userId: string, communityId: string, oppId: string, inDays: number) { return this.opportunityService.scheduleCommunityOpportunityFollowUp(userId, communityId, oppId, inDays); }
  updateCommunityOpportunityFollowUp(userId: string, communityId: string, oppId: string, data: any) { return this.opportunityService.updateCommunityOpportunityFollowUp(userId, communityId, oppId, data); }
  saveCommunityOpportunityProgress(userId: string, communityId: string, oppId: string, progress: string, note: string) { return this.opportunityService.saveCommunityOpportunityProgress(userId, communityId, oppId, progress, note); }
  addCommunityOpportunityAttachment(userId: string, input: any) { return this.opportunityService.addCommunityOpportunityAttachment(userId, input); }
  removeCommunityOpportunityAttachment(userId: string, attachmentId: string) { return this.opportunityService.removeCommunityOpportunityAttachment(userId, attachmentId); }
  listAllOpportunities(userId: string) { return this.opportunityService.listAllOpportunities(userId); }
  getOpportunityById(id: string) { return this.opportunityService.getOpportunityById(id); }
  createOpportunity(userId: string, data: any) { return this.opportunityService.createOpportunity(userId, data); }
  deleteOpportunity(userId: string, id: string) { return this.opportunityService.deleteOpportunity(userId, id); }
  updateOpportunity(userId: string, id: string, data: any) { return this.opportunityService.updateOpportunity(userId, id, data); }
  toggleOpportunityStatus(userId: string, id: string) { return this.opportunityService.toggleOpportunityStatus(userId, id); }
  listMyOpportunities(userId: string) { return this.opportunityService.listMyOpportunities(userId); }
  expressOpportunityInterest(userId: string, oppId: string, message?: string) { return this.opportunityService.expressOpportunityInterest(userId, oppId, message); }
  incrementOpportunityView(id: string) { return this.opportunityService.incrementOpportunityView(id); }
  getOpportunityInterestedMembers(id: string) { return this.opportunityService.getOpportunityInterestedMembers(id); }

  // ==========================================
  // 10. Member Messaging & DM Threads - Delegated to ConnectMessengerService
  // ==========================================
  listMemberConversations(userId: string) { return this.messengerService.listMemberConversations(userId); }
  listMemberMessages(userId: string, peerCode: string) { return this.messengerService.listMemberMessages(userId, peerCode); }
  sendMemberMessage(userId: string, peerCode: string, text: string) { return this.messengerService.sendMemberMessage(userId, peerCode, text); }
  retractMemberMessage(userId: string, messageId: string) { return this.messengerService.retractMemberMessage(userId, messageId); }
  listMyDmThreads(userId: string) { return this.messengerService.listMyDmThreads(userId); }
  openMyDmThread(userId: string, counterpartId: string) { return this.messengerService.openMyDmThread(userId, counterpartId); }
  getMyDmThreadDetail(userId: string, threadId: string) { return this.messengerService.getMyDmThreadDetail(userId, threadId); }
  sendMyDmMessage(userId: string, threadId: string, data: any) { return this.messengerService.sendMyDmMessage(userId, threadId, data); }
  markMyDmThreadRead(userId: string, threadId: string) { return this.messengerService.markMyDmThreadRead(userId, threadId); }
  retractMyDmMessage(userId: string, messageId: string) { return this.messengerService.retractMyDmMessage(userId, messageId); }
  reactToDmMessage(userId: string, messageId: string, reaction: string) { return this.messengerService.reactToDmMessage(userId, messageId, reaction); }
  searchMentionableUsers(userId: string, query: string) { return this.messengerService.searchMentionableUsers(userId, query); }

  // ==========================================
  // 11. Content, News & Perks - Delegated to ConnectContentService
  // ==========================================
  listPublishedNews() { return this.contentService.listPublishedNews(); }
  listActivePerks() { return this.contentService.listActivePerks(); }
  getPerkById(id: string) { return this.contentService.getPerkById(id); }
  listAllPerksAdmin() { return this.contentService.listAllPerksAdmin(); }
  createPerkAdmin(data: any) { return this.contentService.createPerkAdmin(data); }
  updatePerkAdmin(id: string, data: any) { return this.contentService.updatePerkAdmin(id, data); }
  deletePerkAdmin(id: string) { return this.contentService.deletePerkAdmin(id); }
  listAdminNews() { return this.contentService.listAdminNews(); }
  createNewsAdmin(data: any) { return this.contentService.createNewsAdmin(data); }
  updateNewsAdmin(id: string, data: any) { return this.contentService.updateNewsAdmin(id, data); }
  deleteNewsAdmin(id: string) { return this.contentService.deleteNewsAdmin(id); }

  // ==========================================
  // 12. Marketplace Products & Quotes - Delegated to ConnectMarketplaceService
  // ==========================================
  listActiveProducts() { return this.marketplaceService.listActiveProducts(); }
  createProduct(userId: string, data: any) { return this.marketplaceService.createProduct(userId, data); }
  updateProduct(userId: string, id: string, data: any) { return this.marketplaceService.updateProduct(userId, id, data); }
  deleteProduct(userId: string, id: string) { return this.marketplaceService.deleteProduct(userId, id); }
  listMarketplaceProducts(query?: any) { return this.marketplaceService.listMarketplaceProducts(query); }
  getMarketplaceProductById(id: string) { return this.marketplaceService.getMarketplaceProductById(id); }
  createMarketplaceProduct(userId: string, data: any) { return this.marketplaceService.createMarketplaceProduct(userId, data); }
  updateMarketplaceProduct(userId: string, id: string, data: any) { return this.marketplaceService.updateMarketplaceProduct(userId, id, data); }
  deleteMarketplaceProduct(userId: string, id: string) { return this.marketplaceService.deleteMarketplaceProduct(userId, id); }
  toggleProductSold(userId: string, id: string) { return this.marketplaceService.toggleProductSold(userId, id); }
  listProductQuotes(userId: string) { return this.marketplaceService.listProductQuotes(userId); }
  requestProductQuote(userId: string, data: any) { return this.marketplaceService.requestProductQuote(userId, data); }
  updateQuoteStatus(userId: string, id: string, status: string) { return this.marketplaceService.updateQuoteStatus(userId, id, status); }
  sendQuoteReminder(userId: string, id: string) { return this.marketplaceService.sendQuoteReminder(userId, id); }
  cancelQuote(userId: string, id: string, reason: string) { return this.marketplaceService.cancelQuote(userId, id, reason); }

  // ==========================================
  // 13. Public Registration - Delegated to ConnectPublicRegistrationService
  // ==========================================
  getPublicAssociationBySlug(slug: string) { return this.publicRegistrationService.getPublicAssociationBySlug(slug); }
  resolveAssociationByHost(host: string) { return this.publicRegistrationService.resolveAssociationByHost(host); }
  submitClubRegistration(data: any) { return this.publicRegistrationService.submitClubRegistration(data); }
  checkClubRegistrationStatus(query: any) { return this.publicRegistrationService.checkClubRegistrationStatus(query); }

  // ==========================================
  // 14. Settings, Audit & System Administration (Core Service)
  // ==========================================
  async getSettings(userId: string) {
    const row = await this.prisma.$queryRaw<any[]>`
      SELECT org_name, org_email, lang, email_notif, sms_notif, two_fa
      FROM public.user_settings WHERE user_id = ${userId}::uuid LIMIT 1
    `.catch(() => [] as any[]);
    const r = row[0] ?? null;
    return {
      orgName: r?.org_name ?? 'Hiá»‡p há»™i Doanh nghiá»‡p Viá»‡t Nam',
      orgEmail: r?.org_email ?? 'contact@vba.vn',
      lang: r?.lang ?? 'vi',
      emailNotif: r?.email_notif ?? true,
      smsNotif: r?.sms_notif ?? false,
      twoFa: r?.two_fa ?? true,
    };
  }

  async saveSettings(userId: string, body: any) {
    await this.prisma.$executeRaw`
      INSERT INTO public.user_settings (user_id, org_name, org_email, lang, email_notif, sms_notif, two_fa)
      VALUES (${userId}::uuid, ${body.orgName ?? ''}, ${body.orgEmail ?? ''}, ${body.lang ?? 'vi'},
              ${body.emailNotif ?? true}, ${body.smsNotif ?? false}, ${body.twoFa ?? true})
      ON CONFLICT (user_id) DO UPDATE SET
        org_name = EXCLUDED.org_name, org_email = EXCLUDED.org_email,
        lang = EXCLUDED.lang, email_notif = EXCLUDED.email_notif,
        sms_notif = EXCLUDED.sms_notif, two_fa = EXCLUDED.two_fa
    `.catch(() => null);
    return { ok: true };
  }

  // ---------------------------------------------------------------------------
  // Voting preference
  // ---------------------------------------------------------------------------

  async getVotingPref(userId: string) {
    const row = await this.prisma.$queryRaw<any[]>`
      SELECT voting_open_pref FROM public.user_settings WHERE user_id = ${userId}::uuid LIMIT 1
    `.catch(() => [] as any[]);
    return { pref: (row[0]?.voting_open_pref ?? null) as 'same' | 'new' | null };
  }

  async setVotingPref(userId: string, pref: string | null) {
    await this.prisma.$executeRaw`
      INSERT INTO public.user_settings (user_id, voting_open_pref)
      VALUES (${userId}::uuid, ${pref})
      ON CONFLICT (user_id) DO UPDATE SET voting_open_pref = EXCLUDED.voting_open_pref
    `.catch(() => null);
    return { ok: true };
  }

  // ---------------------------------------------------------------------------
  // Post-login route
  // ---------------------------------------------------------------------------

  async getPostLoginRoute(userId: string): Promise<{ to: '/' | '/m' }> {
    const platformAdmin = await this.prisma.$queryRaw<any[]>`
      SELECT 1 FROM public.vione_users WHERE id = ${userId}::uuid AND role = 'platform_admin' LIMIT 1
    `.catch(() => [] as any[]);
    if (platformAdmin.length > 0) return { to: '/' };

    const memberships = await this.prisma.$queryRaw<any[]>`
      SELECT role FROM public.memberships WHERE user_id = ${userId}::uuid
    `.catch(() => [] as any[]);
    const isAdmin = (memberships ?? []).some((m: any) => m.role === 'admin' || m.role === 'association_admin');
    return { to: isAdmin ? '/' : '/m' };
  }

  // ---------------------------------------------------------------------------
  // Media signed URL (Supabase Storage via REST â€” no SDK)
  // ---------------------------------------------------------------------------

  async getMediaSignedUrl(userId: string, path: string) {
    if (!path) return { signedUrl: null };
    const signedUrl = path.startsWith('http') ? path : `/uploads/${path.replace(/^\/+/, '')}`;
    return { signedUrl };
  }

  // ---------------------------------------------------------------------------
  // Public: share guest contact (via PostgreSQL RPC / Prisma)
  // ---------------------------------------------------------------------------


  async getAdminRenewalScope(userId: string) {
    const platformAdmin = await this.prisma.$queryRaw<any[]>`
      SELECT 1 FROM public.vione_users WHERE id = ${userId}::uuid AND role = 'platform_admin' LIMIT 1
    `.catch(() => [] as any[]);

    if (platformAdmin.length > 0) {
      const assocs = await this.prisma.$queryRaw<any[]>`
        SELECT id, name FROM public.associations ORDER BY name
      `.catch(() => [] as any[]);
      return {
        isPlatformAdmin: true,
        associations: assocs.map((a: any) => ({ id: a.id, name: a.name })),
      };
    }

    const memberships = await this.prisma.$queryRaw<any[]>`
      SELECT association_id, role FROM public.memberships WHERE user_id = ${userId}::uuid
    `.catch(() => [] as any[]);

    const adminAssocIds = (memberships ?? [])
      .filter((m: any) => m.role === 'admin' || m.role === 'association_admin')
      .map((m: any) => m.association_id)
      .filter(Boolean);

    if (!adminAssocIds.length) return { isPlatformAdmin: false, associations: [] };

    const assocs = await this.prisma.$queryRaw<any[]>`
      SELECT id, name FROM public.associations WHERE id = ANY(${adminAssocIds}) ORDER BY name
    `.catch(() => [] as any[]);

    return {
      isPlatformAdmin: false,
      associations: assocs.map((a: any) => ({ id: a.id, name: a.name })),
    };
  }

  // ---------------------------------------------------------------------------
  // Admin: renewal audit log search
  // ---------------------------------------------------------------------------

  async searchRenewalAuditLog(userId: string, query: any) {
    const scope = await this.getAdminRenewalScope(userId);
    const allowedIds = scope.associations.map((a: any) => a.id);
    if (!scope.isPlatformAdmin && !allowedIds.length) {
      throw new ForbiddenException('Not an admin');
    }

    const limit = Math.min(query.limit ?? 200, 500);

    try {
      const rows = await this.prisma.$queryRaw<any[]>`
        SELECT id, event_type, member_id, association_id, reference, method, amount_paid,
               invoice_no, previous_term_end, new_term_end, error_code, error_message, metadata, created_at
        FROM public.renewal_audit_log
        WHERE (
          ${scope.isPlatformAdmin} = true
          OR association_id = ANY(${allowedIds}::uuid[])
        )
        AND (${query.associationId ? query.associationId : null}::uuid IS NULL OR association_id = ${query.associationId ? query.associationId : null}::uuid)
        AND (${query.memberId ? query.memberId : null}::uuid IS NULL OR member_id = ${query.memberId ? query.memberId : null}::uuid)
        AND (${query.eventType ? query.eventType : null}::text IS NULL OR event_type = ${query.eventType ? query.eventType : null}::text)
        AND (${query.from ? new Date(query.from) : null}::timestamptz IS NULL OR created_at >= ${query.from ? new Date(query.from) : null}::timestamptz)
        AND (${query.to ? new Date(new Date(query.to).setHours(23, 59, 59, 999)) : null}::timestamptz IS NULL OR created_at <= ${query.to ? new Date(new Date(query.to).setHours(23, 59, 59, 999)) : null}::timestamptz)
        ORDER BY created_at DESC
        LIMIT ${limit}
      `.catch(() => [] as any[]);

      const memberIds = [...new Set(rows.map((r: any) => r.member_id).filter(Boolean))];
      const assocIds = [...new Set(rows.map((r: any) => r.association_id).filter(Boolean))];

      const [members, assocs] = await Promise.all([
        memberIds.length
          ? this.prisma.$queryRaw<any[]>`SELECT id, name, code FROM public.members WHERE id = ANY(${memberIds}::uuid[])`
          : Promise.resolve([] as any[]),
        assocIds.length
          ? this.prisma.$queryRaw<any[]>`SELECT id, name FROM public.associations WHERE id = ANY(${assocIds}::uuid[])`
          : Promise.resolve([] as any[]),
      ]).catch(() => [[], []] as any[][]);

      const memberMap = new Map((members ?? []).map((m: any) => [m.id, m]));
      const assocMap = new Map((assocs ?? []).map((a: any) => [a.id, a.name]));
      const needle = (query.search ?? '').trim().toLowerCase();

      return rows
        .map((r: any) => {
          const m: any = memberMap.get(r.member_id);
          return {
            id: r.id,
            eventType: r.event_type,
            memberId: r.member_id ?? null,
            memberName: m?.name ?? null,
            memberCode: m?.code ?? null,
            associationId: r.association_id ?? null,
            associationName: assocMap.get(r.association_id) ?? null,
            reference: r.reference,
            method: r.method ?? null,
            amountPaid: Number(r.amount_paid ?? 0),
            invoiceNo: r.invoice_no ?? null,
            previousTermEnd: r.previous_term_end ?? null,
            newTermEnd: r.new_term_end ?? null,
            errorCode: r.error_code ?? null,
            errorMessage: r.error_message ?? null,
            metadata: r.metadata ?? {},
            createdAt: r.created_at,
          };
        })
        .filter((r: any) => {
          if (!needle) return true;
          return [r.memberName, r.memberCode, r.reference, r.invoiceNo]
            .filter(Boolean)
            .some((v: any) => String(v).toLowerCase().includes(needle));
        });
    } catch {
      return [];
    }
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

      // 1. Insert into public.notifications for Web CRM Notification Center (both scoped and global fallback)
      await this.prisma.$executeRaw`
        INSERT INTO public.notifications (
          id, code, title, body, audience, channel, status, sent_at, association_id, app_scope, target_app, created_at, updated_at
        ) VALUES (
          gen_random_uuid(), ${code}, ${payload.title}, ${payload.body},
          'staff', 'inapp', 'sent', ${now}, ${associationId}::uuid, 'crm', 'crm', ${now}, ${now}
        )
      `.catch((err) => console.warn('Could not insert scoped public.notifications:', err));

      // 2. Query admin / staff user IDs of this association + all platform administrators
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

      // 3. For each admin user, insert business_notifications & emit WebSocket
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

      // 4. Also broadcast to association room & all connected CRM clients
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
    } catch (err) {
      console.warn('Error in notifyAssociationAdmins:', err);
    }
  }


  // ==========================================
  // Two-Way Business Notification Dispatcher
  // ==========================================
  async dispatchBusinessNotification(params: {
    userId: string;
    memberId?: string;
    title: string;
    body: string;
    sourceDomain: string;
    sourceRecordId: string;
    eventKind: string;
    notificationKind: string;
    targetRoute?: string;
    priority?: string;
  }) {
    const notifId = require('crypto').randomUUID();
    const dedupeKey = `${params.sourceDomain}-${params.sourceRecordId}-${Date.now()}`;
    const safeData = JSON.stringify({
      title: params.title,
      body: params.body,
      targetRoute: params.targetRoute || '/connect-app',
    });

    // 1. Business notifications
    await this.prisma.$executeRawUnsafe(`
      INSERT INTO public.business_notifications (
        id, recipient_user_id, source_domain, source_record_id, event_kind, notification_kind,
        title_key, body_key, safe_display_data, priority, status, dedupe_key, app_scope, target_app, created_at, updated_at
      ) VALUES (
        $1::uuid, $2::uuid, $3, $4, $5, $6,
        $7, $8, $9::jsonb, $10, 'delivered', $11, 'all', 'all', NOW(), NOW()
      )
    `, notifId, params.userId, params.sourceDomain, params.sourceRecordId, params.eventKind, params.notificationKind,
       params.title, params.body, safeData, params.priority || 'normal', dedupeKey).catch(() => {});

    // 2. Association member_notifications
    const recipientId = params.memberId || params.userId;
    await this.prisma.$executeRawUnsafe(`
      INSERT INTO public.member_notifications (
        id, recipient_id, title, body, read, dismissed, ref_type, ref_id, created_at
      ) VALUES (
        gen_random_uuid(), $1, $2, $3, false, false, $4, $5, NOW()
      )
    `, recipientId, params.title, params.body, params.sourceDomain, params.sourceRecordId).catch(() => {});

    // 3. Realtime gateway emit
    try {
      this.gateway.emitNotification(String(params.userId), {
        id: notifId,
        title: params.title,
        body: params.body,
        action: { targetRoute: params.targetRoute || '/connect-app' },
        safeDisplayData: { title: params.title, body: params.body },
      });
    } catch {}

    return { ok: true, notifId };
  }

  // ==========================================
  // Admin News Methods
  // ==========================================

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

  async getActiveAssociationDetails(userId?: string) {
    let assoc: any = null;
    if (userId) {
      const userAssocs = await this.prisma.$queryRaw<any[]>`
        SELECT a.id, a.name, a.slug, a.logo_url, m.role
        FROM public.memberships m
        JOIN public.associations a ON m.association_id = a.id
        WHERE m.user_id = ${userId}::uuid
        ORDER BY m.is_default DESC, m.created_at ASC
        LIMIT 1
      `.catch(() => []);
      if (userAssocs.length > 0) assoc = userAssocs[0];
    }
    if (!assoc) {
      const firstAssoc = await this.prisma.$queryRaw<any[]>`
        SELECT id, name, slug, logo_url FROM public.associations ORDER BY created_at ASC LIMIT 1
      `.catch(() => []);
      if (firstAssoc.length > 0) assoc = firstAssoc[0];
    }
    if (!assoc) {
      return {
        associationId: 'c1983000-0000-4000-8000-000000001983',
        name: 'CLB Doanh Nhân CEO 1983',
        slug: 'ceo1983',
        logoUrl: '/ceo1983-official-logo.png',
        role: 'admin',
        isAdmin: true,
      };
    }
    return {
      associationId: String(assoc.id),
      name: String(assoc.name || 'CLB Doanh Nhân CEO 1983'),
      slug: assoc.slug ? String(assoc.slug) : 'ceo1983',
      logoUrl: assoc.logo_url || null,
      role: assoc.role || 'admin',
      isAdmin: assoc.role === 'admin' || !assoc.role,
    };
  }

  async updateAssociationLogo(userId: string, associationId?: string, logoUrl?: string | null) {
    let targetId = associationId;
    if (!targetId || !/^[0-9a-fA-F-]{36}$/.test(targetId)) {
      const first = await this.prisma.$queryRaw<any[]>`SELECT id FROM public.associations ORDER BY created_at ASC LIMIT 1`.catch(() => []);
      if (first.length > 0) targetId = first[0].id;
    }
    if (targetId) {
      const prev = await this.prisma.$queryRaw<any[]>`SELECT logo_url FROM public.associations WHERE id = ${targetId}::uuid LIMIT 1`.catch(() => []);
      const oldUrl = prev[0]?.logo_url || null;

      await this.prisma.$executeRaw`
        UPDATE public.associations
        SET logo_url = ${logoUrl || null}, updated_at = NOW()
        WHERE id = ${targetId}::uuid
      `;

      const user = await this.prisma.vione_users.findUnique({ where: { id: userId } }).catch(() => null);
      const actorName = user?.name || user?.email || 'Quản trị viên';

      try {
        await this.prisma.$executeRaw`
          INSERT INTO public.association_logo_history (id, association_id, changed_by, changed_by_name, old_logo_url, new_logo_url, action, created_at)
          VALUES (gen_random_uuid(), ${targetId}::uuid, ${userId}::uuid, ${actorName}, ${oldUrl}, ${logoUrl || null}, ${!logoUrl ? 'remove' : !oldUrl ? 'set' : 'change'}, NOW())
        `;
      } catch {}
    }
    return { ok: true, logoUrl: logoUrl || null };
  }

  async getAssociationLogoHistory(associationId?: string) {
    try {
      let targetId = associationId;
      if (!targetId || !/^[0-9a-fA-F-]{36}$/.test(targetId)) {
        const first = await this.prisma.$queryRaw<any[]>`SELECT id FROM public.associations ORDER BY created_at ASC LIMIT 1`.catch(() => []);
        if (first.length > 0) targetId = first[0].id;
      }
      if (!targetId) return [];
      const rows = await this.prisma.$queryRaw<any[]>`
        SELECT id, action, changed_by_name, old_logo_url, new_logo_url, created_at
        FROM public.association_logo_history
        WHERE association_id = ${targetId}::uuid
        ORDER BY created_at DESC
        LIMIT 20
      `.catch(() => []);
      return (rows || []).map((r: any) => ({
        id: String(r.id),
        action: String(r.action || 'change'),
        changedByName: r.changed_by_name || null,
        oldLogoUrl: r.old_logo_url || null,
        newLogoUrl: r.new_logo_url || null,
        createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
      }));
    } catch {
      return [];
    }
  }
}
