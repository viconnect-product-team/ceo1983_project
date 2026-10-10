import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class ConnectNfcService {
  constructor(
    private prisma: PrismaService,
  ) {}

  async listMyDeviceSessions(userId: string, currentKey: string | null) {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT id, device_key, device_label, platform, browser, is_standalone, first_seen_at, last_seen_at, revoked_at
      FROM public.user_device_sessions
      WHERE user_id = ${userId}::uuid
      ORDER BY last_seen_at DESC
    `.catch(() => [] as any[]);

    return rows.map(r => ({
      id: r.id,
      deviceKey: r.device_key,
      label: r.device_label ?? "Thiết bị",
      platform: r.platform,
      browser: r.browser,
      isStandalone: r.is_standalone,
      firstSeenAt: r.first_seen_at ? new Date(r.first_seen_at).toISOString() : null,
      lastSeenAt: r.last_seen_at ? new Date(r.last_seen_at).toISOString() : null,
      revokedAt: r.revoked_at ? new Date(r.revoked_at).toISOString() : null,
      isCurrent: currentKey !== null && r.device_key === currentKey,
    }));
  }

  async touchMyDeviceSession(userId: string, input: any) {
    const existing = await this.prisma.$queryRaw<any[]>`
      SELECT id, revoked_at FROM public.user_device_sessions
      WHERE user_id = ${userId}::uuid AND device_key = ${input.deviceKey}
      LIMIT 1
    `.catch(() => [] as any[]);

    const first = existing[0];
    if (first?.revoked_at) return { revoked: true };

    const now = new Date();
    if (first) {
      await this.prisma.$executeRaw`
        UPDATE public.user_device_sessions
        SET last_seen_at = ${now}
        WHERE id = ${first.id}::uuid
      `;
      return { revoked: false };
    }

    await this.prisma.$executeRaw`
      INSERT INTO public.user_device_sessions (
        user_id, device_key, device_label, platform, browser, is_standalone, first_seen_at, last_seen_at
      ) VALUES (
        ${userId}::uuid, ${input.deviceKey}, ${input.label || null}, ${input.platform || null},
        ${input.browser || null}, ${input.isStandalone || false}, ${now}, ${now}
      )
    `;
    return { revoked: false };
  }

  async revokeMyDeviceSession(userId: string, sessionId: string, currentKey: string | null) {
    const now = new Date();
    await this.prisma.$executeRaw`
      UPDATE public.user_device_sessions
      SET revoked_at = ${now}
      WHERE id = ${sessionId}::uuid AND user_id = ${userId}::uuid
    `;

    const updated = await this.prisma.$queryRaw<any[]>`
      SELECT id, device_key, device_label, platform, browser, is_standalone, first_seen_at, last_seen_at, revoked_at
      FROM public.user_device_sessions
      WHERE id = ${sessionId}::uuid AND user_id = ${userId}::uuid
      LIMIT 1
    `.catch(() => [] as any[]);

    const r = updated[0];
    if (!r) throw new NotFoundException('session_not_found');

    return {
      id: r.id,
      deviceKey: r.device_key,
      label: r.device_label ?? "Thiết bị",
      platform: r.platform,
      browser: r.browser,
      isStandalone: r.is_standalone,
      firstSeenAt: r.first_seen_at ? new Date(r.first_seen_at).toISOString() : null,
      lastSeenAt: r.last_seen_at ? new Date(r.last_seen_at).toISOString() : null,
      revokedAt: r.revoked_at ? new Date(r.revoked_at).toISOString() : null,
      isCurrent: currentKey !== null && r.device_key === currentKey,
    };
  }

  async listMyNfcTags(userId: string) {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT t.id, t.label, t.status, t.written_at, t.updated_at,
             l.status as link_status, l.last_used_at as link_last_used_at
      FROM public.identity_nfc_tags t
      LEFT JOIN public.identity_share_links l ON t.share_link_id = l.id
      WHERE t.owner_user_id = ${userId}::uuid
      ORDER BY t.created_at DESC
    `.catch(() => [] as any[]);

    return rows.map(r => {
      let derivedStatus = 'STALE';
      if (r.status === 'revoked') derivedStatus = 'REVOKED';
      else if (r.link_status === 'active') derivedStatus = 'ACTIVE';

      return {
        id: r.id,
        label: r.label,
        status: derivedStatus,
        writtenAt: r.written_at ? new Date(r.written_at).toISOString() : null,
        lastTappedAt: r.link_last_used_at ? new Date(r.link_last_used_at).toISOString() : null,
        updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : null,
      };
    });
  }

  async registerMyNfcTag(userId: string, input: any) {
    const links = await this.prisma.$queryRaw<any[]>`
      SELECT id, identity_id, status FROM public.identity_share_links
      WHERE owner_user_id = ${userId}::uuid AND public_token = ${input.shareToken} AND status = 'active'
      LIMIT 1
    `.catch(() => [] as any[]);

    const link = links[0];
    if (!link) throw new BadRequestException('share_link_not_found');

    const tagId = crypto.randomUUID();
    const now = new Date();
    await this.prisma.$executeRaw`
      INSERT INTO public.identity_nfc_tags (
        id, owner_user_id, identity_id, share_link_id, label, status, written_at, created_at, updated_at
      ) VALUES (
        ${tagId}::uuid, ${userId}::uuid, ${link.identity_id}::uuid, ${link.id}::uuid, ${input.label || null}, 'active', ${now}, ${now}, ${now}
      )
    `;

    const tagRows = await this.prisma.$queryRaw<any[]>`
      SELECT t.id, t.label, t.status, t.written_at, t.updated_at,
             l.status as link_status, l.last_used_at as link_last_used_at
      FROM public.identity_nfc_tags t
      LEFT JOIN public.identity_share_links l ON t.share_link_id = l.id
      WHERE t.id = ${tagId}::uuid
      LIMIT 1
    `.catch(() => [] as any[]);

    const r = tagRows[0];
    if (!r) throw new BadRequestException('failed_to_register');

    let derivedStatus = 'STALE';
    if (r.status === 'revoked') derivedStatus = 'REVOKED';
    else if (r.link_status === 'active') derivedStatus = 'ACTIVE';

    return {
      id: r.id,
      label: r.label,
      status: derivedStatus,
      writtenAt: r.written_at ? new Date(r.written_at).toISOString() : null,
      lastTappedAt: r.link_last_used_at ? new Date(r.link_last_used_at).toISOString() : null,
      updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : null,
    };
  }

  async revokeMyNfcTag(userId: string, tagId: string) {
    const now = new Date();
    await this.prisma.$executeRaw`
      UPDATE public.identity_nfc_tags
      SET status = 'revoked', revoked_at = ${now}, updated_at = ${now}
      WHERE id = ${tagId}::uuid AND owner_user_id = ${userId}::uuid
    `;

    const tagRows = await this.prisma.$queryRaw<any[]>`
      SELECT t.id, t.label, t.status, t.written_at, t.updated_at,
             l.status as link_status, l.last_used_at as link_last_used_at
      FROM public.identity_nfc_tags t
      LEFT JOIN public.identity_share_links l ON t.share_link_id = l.id
      WHERE t.id = ${tagId}::uuid
      LIMIT 1
    `.catch(() => [] as any[]);

    const r = tagRows[0];
    if (!r) throw new NotFoundException('tag_not_found');

    let derivedStatus = 'STALE';
    if (r.status === 'revoked') derivedStatus = 'REVOKED';
    else if (r.link_status === 'active') derivedStatus = 'ACTIVE';

    return {
      id: r.id,
      label: r.label,
      status: derivedStatus,
      writtenAt: r.written_at ? new Date(r.written_at).toISOString() : null,
      lastTappedAt: r.link_last_used_at ? new Date(r.link_last_used_at).toISOString() : null,
      updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : null,
    };
  }

  async renameMyNfcTag(userId: string, input: any) {
    const now = new Date();
    await this.prisma.$executeRaw`
      UPDATE public.identity_nfc_tags
      SET label = ${input.label || null}, updated_at = ${now}
      WHERE id = ${input.tagId}::uuid AND owner_user_id = ${userId}::uuid
    `;

    const tagRows = await this.prisma.$queryRaw<any[]>`
      SELECT t.id, t.label, t.status, t.written_at, t.updated_at,
             l.status as link_status, l.last_used_at as link_last_used_at
      FROM public.identity_nfc_tags t
      LEFT JOIN public.identity_share_links l ON t.share_link_id = l.id
      WHERE t.id = ${input.tagId}::uuid
      LIMIT 1
    `.catch(() => [] as any[]);

    const r = tagRows[0];
    if (!r) throw new NotFoundException('tag_not_found');

    let derivedStatus = 'STALE';
    if (r.status === 'revoked') derivedStatus = 'REVOKED';
    else if (r.link_status === 'active') derivedStatus = 'ACTIVE';

    return {
      id: r.id,
      label: r.label,
      status: derivedStatus,
      writtenAt: r.written_at ? new Date(r.written_at).toISOString() : null,
      lastTappedAt: r.link_last_used_at ? new Date(r.link_last_used_at).toISOString() : null,
      updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : null,
    };
  }

  // ==========================================
  // BC-Mobile-8A — Customer Relationship CRM
  // ==========================================
}
