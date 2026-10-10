import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ConnectAppGateway } from '../connect-app.gateway';
import * as crypto from 'crypto';
import { z } from 'zod';

@Injectable()
export class ConnectMomentsService {
  constructor(
    private prisma: PrismaService,
    private gateway: ConnectAppGateway,
  ) {}

  async prepareMoment(userId: string, input: any) {
    const { personId, occurredAt, eventName, placeLabel, note, photoCount, clientToken, visibility = 'friends' } = input;

    const m = /^([ucg]):([0-9a-fA-F-]{36})$/.exec(personId);
    if (!m) throw new ForbiddenException('relationship_not_authorized');
    const namespace = m[1];
    const targetId = m[2].toLowerCase();

    let targetKind = 'connection';
    let targetUserId: string | null = null;
    let targetCardId: string | null = null;
    let targetGuestId: string | null = null;

    if (namespace === 'u') {
      if (targetId === userId) throw new ForbiddenException('relationship_not_authorized');
      const rows = await this.prisma.$queryRaw<any[]>`
        SELECT id FROM public.user_connections
        WHERE status = 'accepted'::public.global_connection_status
          AND ((requester_user_id = ${userId}::uuid AND recipient_user_id = ${targetId}::uuid)
            OR (requester_user_id = ${targetId}::uuid AND recipient_user_id = ${userId}::uuid))
        LIMIT 1
      `.catch(() => []);
      if (rows.length === 0) throw new ForbiddenException('relationship_not_authorized');
      targetKind = 'connection';
      targetUserId = targetId;
    } else if (namespace === 'g') {
      const rows = await this.prisma.$queryRaw<any[]>`
        SELECT id FROM public.guest_contacts
        WHERE owner_user_id = ${userId}::uuid AND id = ${targetId}::uuid
        LIMIT 1
      `.catch(() => []);
      if (rows.length === 0) throw new ForbiddenException('relationship_not_authorized');
      targetKind = 'guest_contact';
      targetGuestId = targetId;
    } else {
      const rows = await this.prisma.$queryRaw<any[]>`
        SELECT id FROM public.saved_business_cards
        WHERE owner_user_id = ${userId}::uuid AND target_card_id = ${targetId}::uuid AND archived = false
        LIMIT 1
      `.catch(() => []);
      if (rows.length === 0) throw new ForbiddenException('relationship_not_authorized');
      targetKind = 'saved_card';
      targetCardId = targetId;
    }

    const existingRows = await this.prisma.$queryRaw<any[]>`
      SELECT id, status FROM public.business_relationship_moments
      WHERE owner_user_id = ${userId}::uuid AND client_token = ${clientToken}::uuid
      LIMIT 1
    `.catch(() => []);

    let momentId: string;

    if (existingRows.length > 0) {
      const existing = existingRows[0];
      momentId = existing.id;
      if (existing.status === 'active') {
        return { ok: true, alreadySaved: true, momentId, photos: [] };
      }
      await this.prisma.$executeRaw`
        UPDATE public.business_relationship_moments
        SET occurred_at = ${new Date(occurredAt)},
            event_name = ${eventName || null},
            place_label = ${placeLabel || null},
            note = ${note || null},
            visibility = ${visibility || 'friends'},
            updated_at = now()
        WHERE id = ${momentId}::uuid
      `;
    } else {
      momentId = crypto.randomUUID();
      await this.prisma.$executeRaw`
        INSERT INTO public.business_relationship_moments (
          id, owner_user_id, target_kind, target_user_id, target_card_id, target_guest_id,
          occurred_at, event_name, place_label, note, status, visibility, client_token, created_at, updated_at
        ) VALUES (
          ${momentId}::uuid, ${userId}::uuid, ${targetKind},
          ${targetUserId ? targetUserId : null}::uuid,
          ${targetCardId ? targetCardId : null}::uuid,
          ${targetGuestId ? targetGuestId : null}::uuid,
          ${new Date(occurredAt)}, ${eventName || null}, ${placeLabel || null}, ${note || null},
          'pending', ${visibility || 'friends'}, ${clientToken}::uuid, now(), now()
        )
      `;
    }

    await this.prisma.$executeRaw`
      DELETE FROM public.business_relationship_moment_media
      WHERE moment_id = ${momentId}::uuid AND owner_user_id = ${userId}::uuid
    `;

    const photos: any[] = [];
    if (photoCount > 0) {
      for (let i = 0; i < photoCount; i++) {
        const mediaId = crypto.randomUUID();
        const storagePath = `${userId}/${momentId}/${mediaId}.jpg`;
        await this.prisma.$executeRaw`
          INSERT INTO public.business_relationship_moment_media (
            id, moment_id, owner_user_id, storage_path, media_type, sort_order
          ) VALUES (
            ${mediaId}::uuid, ${momentId}::uuid, ${userId}::uuid, ${storagePath}, 'image/jpeg', ${i}
          )
        `;
        photos.push({
          mediaId,
          storagePath,
          sortOrder: i,
        });
      }
    }

    return { ok: true, alreadySaved: false, momentId, photos };
  }

  async finalizeMoment(userId: string, input: any) {
    const { momentId, uploadedMediaIds, mediaPaths } = input;
    const momentRows = await this.prisma.$queryRaw<any[]>`
      SELECT id, status FROM public.business_relationship_moments
      WHERE id = ${momentId}::uuid AND owner_user_id = ${userId}::uuid
      LIMIT 1
    `.catch(() => []);

    if (momentRows.length === 0) throw new NotFoundException('not_found');
    const moment = momentRows[0];
    if (moment.status === 'active') return { ok: true, momentId };

    // Update storage paths if mediaPaths mapping is provided
    if (mediaPaths && typeof mediaPaths === 'object') {
      for (const [mediaId, storagePath] of Object.entries(mediaPaths)) {
        await this.prisma.$executeRaw`
          UPDATE public.business_relationship_moment_media
          SET storage_path = ${storagePath}
          WHERE id = ${mediaId}::uuid AND owner_user_id = ${userId}::uuid
        `;
      }
    }

    const slots = await this.prisma.$queryRaw<any[]>`
      SELECT id FROM public.business_relationship_moment_media
      WHERE moment_id = ${momentId}::uuid
    `.catch(() => []);

    const slotIds = new Set(slots.map((s) => s.id));
    const keep = uploadedMediaIds.filter((id) => slotIds.has(id));

    if (keep.length > 0) {
      await this.prisma.$executeRaw`
        DELETE FROM public.business_relationship_moment_media
        WHERE moment_id = ${momentId}::uuid AND owner_user_id = ${userId}::uuid AND NOT (id = ANY(${keep}::uuid[]))
      `;
    } else {
      await this.prisma.$executeRaw`
        DELETE FROM public.business_relationship_moment_media
        WHERE moment_id = ${momentId}::uuid AND owner_user_id = ${userId}::uuid
      `;
    }

    await this.prisma.$executeRaw`
      UPDATE public.business_relationship_moments
      SET status = 'active', updated_at = now()
      WHERE id = ${momentId}::uuid AND owner_user_id = ${userId}::uuid AND status = 'pending'
    `;

    try {
      const activeMomentRows = await this.prisma.$queryRaw<any[]>`
        SELECT target_user_id, note, event_name, place_label
        FROM public.business_relationship_moments
        WHERE id = ${momentId}::uuid
        LIMIT 1
      `.catch(() => []);

      const activeMoment = activeMomentRows[0];
      const taggedId = activeMoment?.target_user_id ? String(activeMoment.target_user_id) : null;
      if (taggedId && taggedId.toLowerCase() !== userId.toLowerCase()) {
        void this.notifyMomentTags(userId, {
          momentId,
          taggedUserIds: [taggedId],
          content: activeMoment.note || activeMoment.event_name || activeMoment.place_label || '',
        });
      }
    } catch {
      // ignore
    }

    return { ok: true, momentId };
  }

  async updateMoment(userId: string, input: any) {
    const {
      momentId,
      occurredAt,
      eventName,
      placeLabel,
      note,
      visibility,
      targetPersonId,
      photoUrls,
      taggedUserIds,
    } = input;

    const momentRows = await this.prisma.$queryRaw<any[]>`
      SELECT id FROM public.business_relationship_moments
      WHERE id = ${momentId}::uuid AND owner_user_id = ${userId}::uuid
      LIMIT 1
    `.catch(() => []);

    if (momentRows.length === 0) throw new NotFoundException('not_found');

    let targetKind: string | null = null;
    let targetUserId: string | null = null;
    let targetCardId: string | null = null;
    let targetGuestId: string | null = null;

    if (targetPersonId) {
      const raw = String(targetPersonId).trim();
      if (raw.startsWith('u:')) {
        targetKind = 'connection';
        targetUserId = raw.slice(2);
      } else if (raw.startsWith('c:')) {
        targetKind = 'saved_card';
        targetCardId = raw.slice(2);
      } else if (raw.startsWith('g:')) {
        targetKind = 'guest_contact';
        targetGuestId = raw.slice(2);
      } else if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(raw)) {
        targetKind = 'connection';
        targetUserId = raw;
      }
    }

    const safeOccurredAt = occurredAt ? new Date(occurredAt) : new Date();

    if (targetKind) {
      await this.prisma.$executeRaw`
        UPDATE public.business_relationship_moments
        SET occurred_at = ${safeOccurredAt},
            event_name = ${eventName || null},
            place_label = ${placeLabel || null},
            note = ${note || null},
            visibility = COALESCE(${visibility || null}, visibility, 'friends'),
            target_kind = ${targetKind},
            target_user_id = ${targetUserId ? targetUserId : null}::uuid,
            target_card_id = ${targetCardId ? targetCardId : null}::uuid,
            target_guest_id = ${targetGuestId ? targetGuestId : null}::uuid,
            updated_at = now()
        WHERE id = ${momentId}::uuid AND owner_user_id = ${userId}::uuid
      `;
    } else {
      await this.prisma.$executeRaw`
        UPDATE public.business_relationship_moments
        SET occurred_at = ${safeOccurredAt},
            event_name = ${eventName || null},
            place_label = ${placeLabel || null},
            note = ${note || null},
            visibility = COALESCE(${visibility || null}, visibility, 'friends'),
            updated_at = now()
        WHERE id = ${momentId}::uuid AND owner_user_id = ${userId}::uuid
      `;
    }

    // Update photos if photoUrls array is provided
    if (Array.isArray(photoUrls)) {
      await this.prisma.$executeRaw`
        DELETE FROM public.business_relationship_moment_media
        WHERE moment_id = ${momentId}::uuid AND owner_user_id = ${userId}::uuid
      `.catch(() => null);

      for (let i = 0; i < photoUrls.length; i++) {
        const photoUrl = photoUrls[i];
        if (!photoUrl) continue;
        const mediaId = crypto.randomUUID();
        await this.prisma.$executeRaw`
          INSERT INTO public.business_relationship_moment_media (
            id, moment_id, owner_user_id, storage_path, media_type, sort_order
          ) VALUES (
            ${mediaId}::uuid, ${momentId}::uuid, ${userId}::uuid, ${photoUrl}, 'image/jpeg', ${i}
          )
        `.catch(() => null);
      }
    }

    // Notify tagged users if provided
    if (Array.isArray(taggedUserIds) && taggedUserIds.length > 0) {
      void this.notifyMomentTags(userId, {
        momentId,
        taggedUserIds,
        content: note || eventName || '',
      });
    }

    return { ok: true, momentId };
  }

  async deleteMoment(userId: string, momentId: string) {
    const momentRows = await this.prisma.$queryRaw<any[]>`
      SELECT id FROM public.business_relationship_moments
      WHERE id = ${momentId}::uuid AND owner_user_id = ${userId}::uuid
      LIMIT 1
    `.catch(() => []);

    if (momentRows.length === 0) throw new NotFoundException('not_found');

    await this.prisma.$executeRaw`
      DELETE FROM public.business_relationship_moment_media
      WHERE moment_id = ${momentId}::uuid AND owner_user_id = ${userId}::uuid
    `;

    await this.prisma.$executeRaw`
      DELETE FROM public.business_relationship_moments
      WHERE id = ${momentId}::uuid AND owner_user_id = ${userId}::uuid
    `;

    // Cascade delete moment comments and likes
    await this.prisma.$executeRaw`
      DELETE FROM public.business_relationship_moment_comments WHERE moment_id = ${momentId}::uuid
    `.catch(() => null);
    await this.prisma.$executeRaw`
      DELETE FROM public.business_relationship_moment_likes WHERE moment_id = ${momentId}::uuid
    `.catch(() => null);

    return { ok: true, momentId };
  }

  // ── Moment 3-Level Comments, Likes & Mentions ───────────────────

  async listMomentComments(momentId: string, viewerUserId: string) {
    const rawComments = await this.prisma.$queryRaw<any[]>`
      SELECT c.id, c.moment_id, c.user_id, c.parent_id, c.content, c.photo_url, c.mentions, c.created_at, c.updated_at,
             bi.display_name, bi.avatar_url, bi.job_title, bi.company_name
      FROM public.business_relationship_moment_comments c
      LEFT JOIN public.business_identities bi ON c.user_id = bi.owner_user_id
      WHERE c.moment_id = ${momentId}::uuid
      ORDER BY c.created_at ASC
    `.catch(() => [] as any[]);

    const commentIds = rawComments.map(c => c.id);
    let likesRows: any[] = [];
    if (commentIds.length > 0) {
      likesRows = await this.prisma.$queryRaw<any[]>`
        SELECT comment_id, user_id FROM public.business_relationship_moment_comment_likes
        WHERE comment_id = ANY(${commentIds}::uuid[])
      `.catch(() => [] as any[]);
    }

    const likesCountMap = new Map<string, number>();
    const userLikedSet = new Set<string>();
    for (const l of likesRows) {
      likesCountMap.set(l.comment_id, (likesCountMap.get(l.comment_id) || 0) + 1);
      if (l.user_id === viewerUserId) {
        userLikedSet.add(l.comment_id);
      }
    }

    const formattedList: any[] = rawComments.map(c => {
      const displayName = c.display_name || 'Hội viên CEO 1983';
      const words = displayName.trim().split(/\s+/).filter(Boolean);
      const initials = words.length > 1
        ? `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase()
        : (words[0]?.[0] || 'HV').toUpperCase();

      return {
        id: c.id,
        momentId: c.moment_id,
        userId: c.user_id,
        parentId: c.parent_id || null,
        content: c.content,
        photoUrl: c.photo_url || null,
        mentions: Array.isArray(c.mentions) ? c.mentions : (typeof c.mentions === 'string' ? JSON.parse(c.mentions || '[]') : []),
        createdAt: c.created_at ? new Date(c.created_at).toISOString() : new Date().toISOString(),
        author: {
          userId: c.user_id,
          displayName,
          avatarUrl: c.avatar_url || null,
          initials,
          jobTitle: c.job_title || null,
          companyName: c.company_name || null,
        },
        likesCount: likesCountMap.get(c.id) || 0,
        userLiked: userLikedSet.has(c.id),
      };
    });

    // Build 3-level hierarchical tree
    const level1: any[] = [];
    const byId = new Map<string, any>();
    for (const item of formattedList) {
      item.replies = [];
      byId.set(item.id, item);
    }

    for (const item of formattedList) {
      if (!item.parentId) {
        level1.push(item);
      } else {
        const parent = byId.get(item.parentId);
        if (parent) {
          parent.replies.push(item);
        } else {
          level1.push(item);
        }
      }
    }

    return {
      ok: true,
      momentId,
      totalComments: rawComments.length,
      comments: level1,
    };
  }

  async createMomentComment(
    userId: string,
    momentId: string,
    input: { parentId?: string | null; content: string; photoUrl?: string | null; mentions?: any[] },
  ) {
    const { parentId, content, photoUrl = null, mentions = [] } = input;
    if ((!content || !content.trim()) && !photoUrl) {
      throw new BadRequestException('content_required');
    }

    const commentId = crypto.randomUUID();
    const now = new Date();
    const mentionsJson = JSON.stringify(mentions);

    await this.prisma.$executeRaw`
      INSERT INTO public.business_relationship_moment_comments (
        id, moment_id, user_id, parent_id, content, photo_url, mentions, created_at, updated_at
      ) VALUES (
        ${commentId}::uuid, ${momentId}::uuid, ${userId}::uuid,
        ${parentId ? parentId : null}::uuid,
        ${content ? content.trim() : '(Hình ảnh)'},
        ${photoUrl},
        ${mentionsJson}::jsonb,
        ${now}, ${now}
      )
    `;

    // Fetch author identity
    const authorProfiles = await this.prisma.$queryRaw<any[]>`
      SELECT display_name, avatar_url, job_title, company_name
      FROM public.business_identities
      WHERE owner_user_id = ${userId}::uuid AND status = 'active'
      LIMIT 1
    `.catch(() => [] as any[]);
    const author = authorProfiles[0] || {};
    const displayName = author.display_name || 'Hội viên CEO 1983';
    const words = displayName.trim().split(/\s+/).filter(Boolean);
    const initials = words.length > 1
      ? `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase()
      : (words[0]?.[0] || 'HV').toUpperCase();

    const commentPayload = {
      id: commentId,
      momentId,
      userId,
      parentId: parentId || null,
      content: content ? content.trim() : '(Hình ảnh)',
      photoUrl: photoUrl || null,
      mentions,
      createdAt: now.toISOString(),
      author: {
        userId,
        displayName,
        avatarUrl: author.avatar_url || null,
        initials,
        jobTitle: author.job_title || null,
        companyName: author.company_name || null,
      },
      likesCount: 0,
      userLiked: false,
      replies: [],
    };

    // 1. Broadcast via WebSocket
    this.gateway.emitMomentCommentAdded(momentId, commentPayload);

    // 2. Fetch moment owner & muted users
    const [momentRows, mutedRows] = await Promise.all([
      this.prisma.$queryRaw<any[]>`
        SELECT owner_user_id, event_name, place_label FROM public.business_relationship_moments
        WHERE id = ${momentId}::uuid LIMIT 1
      `.catch(() => [] as any[]),
      this.prisma.$queryRaw<any[]>`
        SELECT user_id FROM public.business_relationship_moment_mutes
        WHERE moment_id = ${momentId}::uuid
      `.catch(() => [] as any[]),
    ]);

    const momentOwnerId = momentRows[0]?.owner_user_id;
    const mutedUserIds = new Set(mutedRows.map(r => String(r.user_id).toLowerCase()));

    // 3. Create notifications
    try {
      // 3a. Notify moment owner (if not the commenter and not muted)
      if (momentOwnerId && momentOwnerId !== userId && !mutedUserIds.has(String(momentOwnerId).toLowerCase())) {
        const notifId = crypto.randomUUID();
        const safeData = JSON.stringify({
          commenterName: displayName,
          momentTitle: momentRows[0]?.event_name || momentRows[0]?.place_label || 'khoảnh khắc',
          content: content.substring(0, 100),
        });
        const actionTarget = JSON.stringify({ route: '/connect-app', momentId });
        const dedupeKey = `moment_comment:${notifId}`;
        await this.prisma.$executeRaw`
          INSERT INTO public.business_notifications (
            id, recipient_user_id, source_domain, source_record_id, event_kind, notification_kind,
            title_key, body_key, safe_display_data, action_kind, action_label_key, action_target,
            priority, status, created_at, updated_at, dedupe_key
          ) VALUES (
            ${notifId}::uuid, ${momentOwnerId}::uuid, 'moment', ${momentId}, 'moment_comment', 'moment_new_comment',
            'bc.notif.moment_comment.title', 'bc.notif.moment_comment.body',
            ${safeData}::jsonb, 'open_moment_detail', 'bc.notif.action.view', ${actionTarget}::jsonb,
            'normal', 'delivered', ${now}, ${now}, ${dedupeKey}
          )
        `.catch(() => null);
        this.gateway.emitNotification(momentOwnerId, {
          id: notifId,
          title: `${displayName} đã bình luận về khoảnh khắc của bạn`,
          momentId,
          safeDisplayData: {
            title: `${displayName} đã bình luận về khoảnh khắc của bạn`,
            body: content.substring(0, 100),
          },
        });
      }

      // 3b. Notify parent comment author (if reply, not self, and not muted)
      if (parentId) {
        const parentRows = await this.prisma.$queryRaw<any[]>`
          SELECT user_id FROM public.business_relationship_moment_comments WHERE id = ${parentId}::uuid LIMIT 1
        `.catch(() => [] as any[]);
        const parentUserId = parentRows[0]?.user_id;
        if (
          parentUserId &&
          parentUserId !== userId &&
          parentUserId !== momentOwnerId &&
          !mutedUserIds.has(String(parentUserId).toLowerCase())
        ) {
          const notifId = crypto.randomUUID();
          const safeData = JSON.stringify({
            commenterName: displayName,
            content: content.substring(0, 100),
          });
          const actionTarget = JSON.stringify({ route: '/connect-app', momentId });
          const dedupeKey = `moment_reply:${notifId}`;
          await this.prisma.$executeRaw`
            INSERT INTO public.business_notifications (
              id, recipient_user_id, source_domain, source_record_id, event_kind, notification_kind,
              title_key, body_key, safe_display_data, action_kind, action_label_key, action_target,
              priority, status, created_at, updated_at, dedupe_key
            ) VALUES (
              ${notifId}::uuid, ${parentUserId}::uuid, 'moment', ${momentId}, 'moment_comment_reply', 'moment_reply_comment',
              'bc.notif.moment_reply.title', 'bc.notif.moment_reply.body',
              ${safeData}::jsonb, 'open_moment_detail', 'bc.notif.action.view', ${actionTarget}::jsonb,
              'normal', 'delivered', ${now}, ${now}, ${dedupeKey}
            )
          `.catch(() => null);
          this.gateway.emitNotification(parentUserId, {
            id: notifId,
            title: `${displayName} đã phản hồi bình luận của bạn`,
            momentId,
            safeDisplayData: {
              title: `${displayName} đã phản hồi bình luận của bạn`,
              body: content.substring(0, 100),
            },
          });
        }
      }

      // 3c. Notify mentioned users (if not self and not muted)
      if (Array.isArray(mentions)) {
        for (const m of mentions) {
          const mentionedUserId = m.userId || m.id;
          if (
            mentionedUserId &&
            mentionedUserId !== userId &&
            mentionedUserId !== momentOwnerId &&
            !mutedUserIds.has(String(mentionedUserId).toLowerCase())
          ) {
            const notifId = crypto.randomUUID();
            const safeData = JSON.stringify({
              mentionerName: displayName,
              content: content.substring(0, 100),
            });
            const actionTarget = JSON.stringify({ route: '/connect-app', momentId });
            const dedupeKey = `moment_mention:${notifId}`;
            await this.prisma.$executeRaw`
              INSERT INTO public.business_notifications (
                id, recipient_user_id, source_domain, source_record_id, event_kind, notification_kind,
                title_key, body_key, safe_display_data, action_kind, action_label_key, action_target,
                priority, status, created_at, updated_at, dedupe_key
              ) VALUES (
                ${notifId}::uuid, ${mentionedUserId}::uuid, 'moment', ${momentId}, 'moment_mention', 'moment_user_mention',
                'bc.notif.moment_mention.title', 'bc.notif.moment_mention.body',
                ${safeData}::jsonb, 'open_moment_detail', 'bc.notif.action.view', ${actionTarget}::jsonb,
                'high', 'delivered', ${now}, ${now}, ${dedupeKey}
              )
            `.catch(() => null);
            this.gateway.emitNotification(mentionedUserId, {
              id: notifId,
              title: `Bạn được nhắc tên trong khoảnh khắc của ${displayName}`,
              momentId,
              safeDisplayData: {
                title: `Bạn được nhắc tên trong khoảnh khắc của ${displayName}`,
                body: content.substring(0, 100),
              },
            });
          }
        }
      }
    } catch (err) {
      console.warn('Error generating comment notifications:', err);
    }

    return { ok: true, comment: commentPayload };
  }

  async toggleMuteMoment(userId: string, momentId: string) {
    const existing = await this.prisma.$queryRaw<any[]>`
      SELECT id FROM public.business_relationship_moment_mutes
      WHERE moment_id = ${momentId}::uuid AND user_id = ${userId}::uuid
      LIMIT 1
    `.catch(() => []);

    if (existing.length > 0) {
      await this.prisma.$executeRaw`
        DELETE FROM public.business_relationship_moment_mutes
        WHERE moment_id = ${momentId}::uuid AND user_id = ${userId}::uuid
      `;
      return { ok: true, isMuted: false };
    } else {
      await this.prisma.$executeRaw`
        INSERT INTO public.business_relationship_moment_mutes (id, moment_id, user_id, created_at)
        VALUES (gen_random_uuid(), ${momentId}::uuid, ${userId}::uuid, now())
        ON CONFLICT (moment_id, user_id) DO NOTHING
      `;
      return { ok: true, isMuted: true };
    }
  }

  async getMomentMuteStatus(userId: string, momentId: string) {
    const existing = await this.prisma.$queryRaw<any[]>`
      SELECT id FROM public.business_relationship_moment_mutes
      WHERE moment_id = ${momentId}::uuid AND user_id = ${userId}::uuid
      LIMIT 1
    `.catch(() => []);
    return { ok: true, isMuted: existing.length > 0 };
  }

  async deleteMomentComment(userId: string, momentId: string, commentId: string) {
    const commentRows = await this.prisma.$queryRaw<any[]>`
      SELECT user_id, moment_id FROM public.business_relationship_moment_comments
      WHERE id = ${commentId}::uuid LIMIT 1
    `.catch(() => [] as any[]);

    if (commentRows.length === 0) throw new NotFoundException('comment_not_found');

    const momentRows = await this.prisma.$queryRaw<any[]>`
      SELECT owner_user_id FROM public.business_relationship_moments WHERE id = ${momentId}::uuid LIMIT 1
    `.catch(() => [] as any[]);

    const comment = commentRows[0];
    const isCommentAuthor = comment.user_id === userId;
    const isMomentOwner = momentRows[0]?.owner_user_id === userId;

    if (!isCommentAuthor && !isMomentOwner) {
      throw new ForbiddenException('cannot_delete_foreign_comment');
    }

    const childComments = await this.prisma.$queryRaw<any[]>`
      WITH RECURSIVE comment_tree AS (
        SELECT id FROM public.business_relationship_moment_comments WHERE id = ${commentId}::uuid
        UNION ALL
        SELECT c.id FROM public.business_relationship_moment_comments c
        INNER JOIN comment_tree ct ON c.parent_id = ct.id
      )
      SELECT id FROM comment_tree;
    `.catch(() => [{ id: commentId }]);

    const allIds = childComments.map(c => c.id);
    if (allIds.length > 0) {
      await this.prisma.$executeRaw`
        DELETE FROM public.business_relationship_moment_comment_likes WHERE comment_id = ANY(${allIds}::uuid[])
      `.catch(() => null);
      await this.prisma.$executeRaw`
        DELETE FROM public.business_relationship_moment_comments WHERE id = ANY(${allIds}::uuid[])
      `.catch(() => null);
    }

    this.gateway.emitMomentCommentDeleted(momentId, commentId);
    return { ok: true, commentId };
  }

  async toggleMomentCommentLike(userId: string, momentId: string, commentId: string) {
    const existing = await this.prisma.$queryRaw<any[]>`
      SELECT id FROM public.business_relationship_moment_comment_likes
      WHERE comment_id = ${commentId}::uuid AND user_id = ${userId}::uuid
      LIMIT 1
    `.catch(() => [] as any[]);

    let liked = false;
    if (existing.length > 0) {
      await this.prisma.$executeRaw`
        DELETE FROM public.business_relationship_moment_comment_likes
        WHERE comment_id = ${commentId}::uuid AND user_id = ${userId}::uuid
      `;
      liked = false;
    } else {
      const likeId = crypto.randomUUID();
      await this.prisma.$executeRaw`
        INSERT INTO public.business_relationship_moment_comment_likes (id, comment_id, user_id, created_at)
        VALUES (${likeId}::uuid, ${commentId}::uuid, ${userId}::uuid, now())
      `;
      liked = true;
    }

    const countRows = await this.prisma.$queryRaw<any[]>`
      SELECT COUNT(id)::int as count FROM public.business_relationship_moment_comment_likes
      WHERE comment_id = ${commentId}::uuid
    `.catch(() => [{ count: 0 }]);

    const likesCount = Number(countRows[0]?.count || 0);
    this.gateway.emitMomentCommentLiked(momentId, commentId, likesCount, userId, liked);

    return { ok: true, commentId, liked, likesCount };
  }

  async toggleMomentLike(userId: string, momentId: string) {
    const existing = await this.prisma.$queryRaw<any[]>`
      SELECT id FROM public.business_relationship_moment_likes
      WHERE moment_id = ${momentId}::uuid AND user_id = ${userId}::uuid
      LIMIT 1
    `.catch(() => [] as any[]);

    let liked = false;
    if (existing.length > 0) {
      await this.prisma.$executeRaw`
        DELETE FROM public.business_relationship_moment_likes
        WHERE moment_id = ${momentId}::uuid AND user_id = ${userId}::uuid
      `;
      liked = false;
    } else {
      const likeId = crypto.randomUUID();
      await this.prisma.$executeRaw`
        INSERT INTO public.business_relationship_moment_likes (id, moment_id, user_id, created_at)
        VALUES (${likeId}::uuid, ${momentId}::uuid, ${userId}::uuid, now())
      `;
      liked = true;
    }

    const countRows = await this.prisma.$queryRaw<any[]>`
      SELECT COUNT(id)::int as count FROM public.business_relationship_moment_likes
      WHERE moment_id = ${momentId}::uuid
    `.catch(() => [{ count: 0 }]);

    const likesCount = Number(countRows[0]?.count || 0);
    this.gateway.emitMomentLiked(momentId, likesCount, userId, liked);

    return { ok: true, momentId, liked, likesCount };
  }

  async getMomentLikeStatus(userId: string, momentId: string) {
    const countRows = await this.prisma.$queryRaw<any[]>`
      SELECT COUNT(id)::int as count FROM public.business_relationship_moment_likes
      WHERE moment_id = ${momentId}::uuid
    `.catch(() => [{ count: 0 }]);

    const userLikedRows = await this.prisma.$queryRaw<any[]>`
      SELECT id FROM public.business_relationship_moment_likes
      WHERE moment_id = ${momentId}::uuid AND user_id = ${userId}::uuid
      LIMIT 1
    `.catch(() => [] as any[]);

    const commentCountRows = await this.prisma.$queryRaw<any[]>`
      SELECT COUNT(id)::int as count FROM public.business_relationship_moment_comments
      WHERE moment_id = ${momentId}::uuid
    `.catch(() => [{ count: 0 }]);

    return {
      ok: true,
      momentId,
      likesCount: Number(countRows[0]?.count || 0),
      userLiked: userLikedRows.length > 0,
      commentsCount: Number(commentCountRows[0]?.count || 0),
    };
  }

  async listMomentPhotos(userId: string, momentId: string) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(momentId)) {
      return {
        ok: true,
        momentId,
        max: 6,
        photos: [],
      };
    }

    const momentRows = await this.prisma.$queryRaw<any[]>`
      SELECT id FROM public.business_relationship_moments
      WHERE id = ${momentId}::uuid AND owner_user_id = ${userId}::uuid
      LIMIT 1
    `.catch(() => []);

    if (momentRows.length === 0) {
      return {
        ok: true,
        momentId,
        max: 6,
        photos: [],
      };
    }

    const slots = await this.prisma.$queryRaw<any[]>`
      SELECT id, moment_id, storage_path, sort_order
      FROM public.business_relationship_moment_media
      WHERE moment_id = ${momentId}::uuid
      ORDER BY sort_order ASC
    `.catch(() => []);

    return {
      ok: true,
      momentId,
      max: 6,
      photos: slots.map((s) => ({
        mediaId: s.id,
        storagePath: s.storage_path,
        sortOrder: s.sort_order,
        url: s.storage_path
          ? (s.storage_path.startsWith('http') ? s.storage_path : `/uploads/${s.storage_path.replace(/^\/+/, '')}`)
          : null,
      })),
    };
  }

  async addMomentPhotoSlots(userId: string, momentId: string, count: number) {
    const momentRows = await this.prisma.$queryRaw<any[]>`
      SELECT id FROM public.business_relationship_moments
      WHERE id = ${momentId}::uuid AND owner_user_id = ${userId}::uuid
      LIMIT 1
    `.catch(() => []);

    if (momentRows.length === 0) throw new NotFoundException('not_found');

    const existing = await this.prisma.$queryRaw<any[]>`
      SELECT sort_order FROM public.business_relationship_moment_media
      WHERE moment_id = ${momentId}::uuid
    `.catch(() => [] as any[]);

    if (existing.length + count > 6) {
      throw new BadRequestException('photo_count');
    }

    const startSort = existing.reduce((max, s) => Math.max(max, s.sort_order + 1), 0);
    const photos: any[] = [];
    for (let i = 0; i < count; i++) {
      const mediaId = crypto.randomUUID();
      const storagePath = `${userId}/${momentId}/${mediaId}.jpg`;
      const sortOrder = startSort + i;
      await this.prisma.$executeRaw`
        INSERT INTO public.business_relationship_moment_media (
          id, moment_id, owner_user_id, storage_path, media_type, sort_order
        ) VALUES (
          ${mediaId}::uuid, ${momentId}::uuid, ${userId}::uuid, ${storagePath}, 'image/jpeg', ${sortOrder}
        )
      `;
      photos.push({
        mediaId,
        storagePath,
        sortOrder,
      });
    }

    return { ok: true, momentId, photos };
  }

  async commitMomentPhotos(userId: string, input: any) {
    const { momentId, addedMediaIds, uploadedMediaIds, mediaPaths } = input;
    const momentRows = await this.prisma.$queryRaw<any[]>`
      SELECT id FROM public.business_relationship_moments
      WHERE id = ${momentId}::uuid AND owner_user_id = ${userId}::uuid
      LIMIT 1
    `.catch(() => []);

    if (momentRows.length === 0) throw new NotFoundException('not_found');

    // Update storage paths if mediaPaths mapping is provided
    if (mediaPaths && typeof mediaPaths === 'object') {
      for (const [mediaId, storagePath] of Object.entries(mediaPaths)) {
        await this.prisma.$executeRaw`
          UPDATE public.business_relationship_moment_media
          SET storage_path = ${storagePath}
          WHERE id = ${mediaId}::uuid AND owner_user_id = ${userId}::uuid
        `;
      }
    }

    const slots: any[] = await this.prisma.$queryRaw<any[]>`
      SELECT id FROM public.business_relationship_moment_media
      WHERE moment_id = ${momentId}::uuid
    `.catch(() => [] as any[]);

    const uploaded = new Set(uploadedMediaIds);
    const drop = slots.filter((s: any) => addedMediaIds.includes(s.id) && !uploaded.has(s.id));
    if (drop.length > 0) {
      const dropIds = drop.map((s) => s.id);
      await this.prisma.$executeRaw`
        DELETE FROM public.business_relationship_moment_media
        WHERE moment_id = ${momentId}::uuid AND owner_user_id = ${userId}::uuid AND id = ANY(${dropIds}::uuid[])
      `;
    }

    return { ok: true, momentId };
  }

  async removeMomentPhoto(userId: string, momentId: string, mediaId: string) {
    const momentRows = await this.prisma.$queryRaw<any[]>`
      SELECT id FROM public.business_relationship_moments
      WHERE id = ${momentId}::uuid AND owner_user_id = ${userId}::uuid
      LIMIT 1
    `.catch(() => []);

    if (momentRows.length === 0) throw new NotFoundException('not_found');

    await this.prisma.$executeRaw`
      DELETE FROM public.business_relationship_moment_media
      WHERE moment_id = ${momentId}::uuid AND owner_user_id = ${userId}::uuid AND id = ${mediaId}::uuid
    `;

    return { ok: true, momentId };
  }

  // --- Reminders ---

  async listMomentReminders(userId: string, momentId: string | null, includeDone: boolean, limit: number) {
    let query;
    if (momentId) {
      if (includeDone) {
        query = this.prisma.$queryRaw<any[]>`
          SELECT id, moment_id, remind_at, label, status, completed_at
          FROM public.business_relationship_moment_reminders
          WHERE owner_user_id = ${userId}::uuid AND moment_id = ${momentId}::uuid
          ORDER BY remind_at ASC
          LIMIT ${limit}
        `;
      } else {
        query = this.prisma.$queryRaw<any[]>`
          SELECT id, moment_id, remind_at, label, status, completed_at
          FROM public.business_relationship_moment_reminders
          WHERE owner_user_id = ${userId}::uuid AND moment_id = ${momentId}::uuid AND status = 'pending'
          ORDER BY remind_at ASC
          LIMIT ${limit}
        `;
      }
    } else {
      if (includeDone) {
        query = this.prisma.$queryRaw<any[]>`
          SELECT id, moment_id, remind_at, label, status, completed_at
          FROM public.business_relationship_moment_reminders
          WHERE owner_user_id = ${userId}::uuid
          ORDER BY remind_at ASC
          LIMIT ${limit}
        `;
      } else {
        query = this.prisma.$queryRaw<any[]>`
          SELECT id, moment_id, remind_at, label, status, completed_at
          FROM public.business_relationship_moment_reminders
          WHERE owner_user_id = ${userId}::uuid AND status = 'pending'
          ORDER BY remind_at ASC
          LIMIT ${limit}
        `;
      }
    }

    const rows = await query.catch(() => []);
    return {
      ok: true,
      reminders: rows.map((r) => ({
        id: r.id,
        momentId: r.moment_id,
        remindAt: r.remind_at ? new Date(r.remind_at).toISOString() : null,
        label: r.label,
        status: r.status,
        completedAt: r.completed_at ? new Date(r.completed_at).toISOString() : null,
      })),
    };
  }

  async createMomentReminder(userId: string, momentId: string, remindAt: string, label: string | null) {
    const countRow = await this.prisma.$queryRaw<any[]>`
      SELECT COUNT(id)::int as count FROM public.business_relationship_moment_reminders
      WHERE owner_user_id = ${userId}::uuid AND moment_id = ${momentId}::uuid AND status = 'pending'
    `.catch(() => []);

    const count = countRow[0]?.count || 0;
    if (count >= 5) {
      return { ok: false, error: 'limit_reached' };
    }

    const id = crypto.randomUUID();
    await this.prisma.$executeRaw`
      INSERT INTO public.business_relationship_moment_reminders (
        id, moment_id, owner_user_id, remind_at, label, status
      ) VALUES (
        ${id}::uuid, ${momentId}::uuid, ${userId}::uuid, ${new Date(remindAt)}, ${label || null}, 'pending'
      )
    `;

    return {
      ok: true,
      reminder: {
        id,
        momentId,
        remindAt: new Date(remindAt).toISOString(),
        label,
        status: 'pending',
        completedAt: null,
      },
    };
  }

  async setMomentReminderStatus(userId: string, reminderId: string, status: string) {
    const completedAt = status === 'done' ? new Date() : null;

    const rowBefore = await this.prisma.$queryRaw<any[]>`
      SELECT id FROM public.business_relationship_moment_reminders
      WHERE id = ${reminderId}::uuid AND owner_user_id = ${userId}::uuid
      LIMIT 1
    `.catch(() => []);

    if (rowBefore.length === 0) return { ok: false, error: 'not_found' };

    await this.prisma.$executeRaw`
      UPDATE public.business_relationship_moment_reminders
      SET status = ${status},
          completed_at = ${completedAt}
      WHERE id = ${reminderId}::uuid AND owner_user_id = ${userId}::uuid
    `;

    const rowAfter = await this.prisma.$queryRaw<any[]>`
      SELECT id, moment_id, remind_at, label, status, completed_at
      FROM public.business_relationship_moment_reminders
      WHERE id = ${reminderId}::uuid AND owner_user_id = ${userId}::uuid
      LIMIT 1
    `.catch(() => []);

    const r = rowAfter[0];
    return {
      ok: true,
      reminder: {
        id: r.id,
        momentId: r.moment_id,
        remindAt: r.remind_at ? new Date(r.remind_at).toISOString() : null,
        label: r.label,
        status: r.status,
        completedAt: r.completed_at ? new Date(r.completed_at).toISOString() : null,
      },
    };
  }

  async deleteMomentReminder(userId: string, reminderId: string) {
    await this.prisma.$executeRaw`
      DELETE FROM public.business_relationship_moment_reminders
      WHERE id = ${reminderId}::uuid AND owner_user_id = ${userId}::uuid
    `;
    return { ok: true, reminderId };
  }

  async notifyMomentTags(userId: string, input: { momentId: string; taggedUserIds: string[]; content?: string }) {
    const { momentId, taggedUserIds = [], content = '' } = input;
    if (taggedUserIds.length === 0) return { ok: true, count: 0 };

    const authorProfiles = await this.prisma.$queryRaw<any[]>`
      SELECT display_name FROM public.business_identities
      WHERE owner_user_id = ${userId}::uuid AND status = 'active'
      LIMIT 1
    `.catch(() => [] as any[]);
    const displayName = authorProfiles[0]?.display_name || 'Đối tác trong mạng lưới';
    const now = new Date();

    for (const targetId of taggedUserIds) {
      if (!targetId || targetId === userId) continue;
      const cleanTargetId = targetId.replace(/^u:/, '');
      const notifId = crypto.randomUUID();
      const safeData = JSON.stringify({
        authorName: displayName,
        title: `${displayName} đã gắn thẻ bạn trong một khoảnh khắc`,
        body: content ? content.slice(0, 100) : `${displayName} vừa gắn thẻ bạn trong bài viết mới`,
        content: content ? content.slice(0, 100) : '',
        targetRoute: '/connect-app',
      });
      const actionTarget = JSON.stringify({ route: '/connect-app', momentId });
      const dedupeKey = `moment_tag:${momentId}:${cleanTargetId}`;

      await this.prisma.$executeRaw`
        INSERT INTO public.business_notifications (
          id, recipient_user_id, source_domain, source_record_id, event_kind, notification_kind,
          title_key, body_key, safe_display_data, action_kind, action_label_key, action_target,
          priority, status, created_at, updated_at, dedupe_key
        ) VALUES (
          ${notifId}::uuid, ${cleanTargetId}::uuid, 'moment', ${momentId}, 'moment_tagged', 'moment_tag_person',
          'bc.notif.moment_tag.title', 'bc.notif.moment_tag.body',
          ${safeData}::jsonb, 'open_moment_detail', 'bc.notif.action.view', ${actionTarget}::jsonb,
          'high', 'delivered', ${now}, ${now}, ${dedupeKey}
        )
      `.catch(() => null);

      this.gateway.emitNotification(cleanTargetId, {
        id: notifId,
        title: `${displayName} đã gắn thẻ bạn trong khoảnh khắc`,
        body: content ? content.slice(0, 100) : '',
        momentId,
        action: { targetRoute: '/connect-app' },
        safeDisplayData: {
          title: `${displayName} đã gắn thẻ bạn trong khoảnh khắc`,
          body: content ? content.slice(0, 100) : '',
        },
      });
    }

    return { ok: true, count: taggedUserIds.length };
  }
}
