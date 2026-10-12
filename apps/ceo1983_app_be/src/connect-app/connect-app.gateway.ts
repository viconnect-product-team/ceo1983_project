import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface ActiveCallRecord {
  callId: string;
  callerUserId: string;
  callerName: string;
  callerAvatar?: string | null;
  callerTitle?: string | null;
  recipientUserId: string;
  callType: 'audio' | 'video';
  status: 'ringing' | 'accepted' | 'declined' | 'ended';
  createdAt: number;
  expiresAt: number;
}

@Injectable()
@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: '/',
})
export class ConnectAppGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ConnectAppGateway.name);
  private readonly onlineUserSockets = new Map<string, Set<string>>();
  private readonly activeCalls = new Map<string, ActiveCallRecord>();

  constructor(private readonly prisma: PrismaService) {}

  cleanExpiredCalls() {
    const now = Date.now();
    for (const [id, call] of this.activeCalls.entries()) {
      if (call.expiresAt <= now || call.status !== 'ringing') {
        this.activeCalls.delete(id);
      }
    }
  }

  getActiveCallForUser(userId: string): ActiveCallRecord | null {
    if (!userId) return null;
    this.cleanExpiredCalls();
    const cleanId = String(userId).toLowerCase();
    for (const call of this.activeCalls.values()) {
      if (
        (call.recipientUserId === userId || call.recipientUserId.toLowerCase() === cleanId) &&
        call.status === 'ringing' &&
        call.expiresAt > Date.now()
      ) {
        return call;
      }
    }
    return null;
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    for (const [userId, sockets] of this.onlineUserSockets.entries()) {
      if (sockets.has(client.id)) {
        sockets.delete(client.id);
        if (sockets.size === 0) {
          this.onlineUserSockets.delete(userId);
          if (this.server) {
            this.server.emit('presence:user_offline', { userId });
          }
        }
      }
    }
  }

  isUserOnline(userId: string): boolean {
    if (!userId) return false;
    const sockets = this.onlineUserSockets.get(userId);
    return (sockets?.size ?? 0) > 0;
  }

  @SubscribeMessage('join:room')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: string | { room?: string; name?: string },
  ) {
    const rawRoom = typeof payload === 'string' ? payload : (payload?.room || payload?.name || '');
    const room = String(rawRoom).trim();
    if (!room) return { ok: false };

    client.join(room);
    this.logger.log(`Client ${client.id} joined room ${room}`);

    if (room.startsWith('user:')) {
      const userId = room.replace('user:', '');
      if (userId) {
        if (!this.onlineUserSockets.has(userId)) {
          this.onlineUserSockets.set(userId, new Set());
        }
        this.onlineUserSockets.get(userId)!.add(client.id);
        if (this.server) {
          this.server.emit('presence:user_online', { userId });
        }

        // Check if there is a pending active ringing call for this user upon connection/reconnection
        const activeCall = this.getActiveCallForUser(userId);
        if (activeCall && activeCall.status === 'ringing') {
          this.logger.log(`Dispatching pending active call ${activeCall.callId} to reconnected user ${userId}`);
          client.emit('call:incoming', {
            callId: activeCall.callId,
            callerUserId: activeCall.callerUserId,
            callerName: activeCall.callerName,
            callerAvatar: activeCall.callerAvatar,
            callerTitle: activeCall.callerTitle,
            callType: activeCall.callType,
            timestamp: new Date(activeCall.createdAt).toISOString(),
          });
        }
      }
    }
    return { ok: true, room };
  }

  @SubscribeMessage('leave:room')
  handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() room: string,
  ) {
    if (room && typeof room === 'string') {
      client.leave(room);
      this.logger.log(`Client ${client.id} left room ${room}`);

      if (room.startsWith('user:')) {
        const userId = room.replace('user:', '');
        if (userId && this.onlineUserSockets.has(userId)) {
          const sockets = this.onlineUserSockets.get(userId)!;
          sockets.delete(client.id);
          if (sockets.size === 0) {
            this.onlineUserSockets.delete(userId);
            if (this.server) {
              this.server.emit('presence:user_offline', { userId });
            }
          }
        }
      }
      return { ok: true, room };
    }
    return { ok: false };
  }

  // ── Moment Events ─────────────────────────────────────────────

  emitMomentCommentAdded(momentId: string, comment: any) {
    if (!this.server) return;
    this.server.to(`moment:${momentId}`).emit('moment:comment_added', {
      momentId,
      comment,
    });
  }

  emitMomentCommentDeleted(momentId: string, commentId: string) {
    if (!this.server) return;
    this.server.to(`moment:${momentId}`).emit('moment:comment_deleted', {
      momentId,
      commentId,
    });
  }

  emitMomentCommentLiked(momentId: string, commentId: string, likesCount: number, userId: string, liked: boolean) {
    if (!this.server) return;
    this.server.to(`moment:${momentId}`).emit('moment:comment_liked', {
      momentId,
      commentId,
      likesCount,
      userId,
      liked,
    });
  }

  emitMomentLiked(momentId: string, likesCount: number, userId: string, liked: boolean) {
    if (!this.server) return;
    this.server.to(`moment:${momentId}`).emit('moment:liked', {
      momentId,
      likesCount,
      userId,
      liked,
    });
    // Also broadcast to general feed room so home feed updates like count in real time
    this.server.emit('moment:feed_liked', {
      momentId,
      likesCount,
    });
  }

  // ── DM Messaging Events ──────────────────────────────────────

  emitDmMessageReceived(threadId: string, recipientUserId: string, message: any, threadSummary: any) {
    if (!this.server) return;
    // Emit to active chat room
    this.server.to(`thread:${threadId}`).emit('dm:message_received', {
      threadId,
      message,
    });
    // Emit to recipient's personal user room for inbox thread list & unread count badge
    this.server.to(`user:${recipientUserId}`).emit('dm:thread_updated', {
      threadId,
      message,
      threadSummary,
    });
  }

  emitDmMessageRetracted(threadId: string, messageId: string) {
    if (!this.server) return;
    this.server.to(`thread:${threadId}`).emit('dm:message_retracted', {
      threadId,
      messageId,
    });
  }

  emitDmReadReceipt(threadId: string, readerUserId: string) {
    if (!this.server) return;
    this.server.to(`thread:${threadId}`).emit('dm:read_receipt', {
      threadId,
      readerUserId,
      readAt: new Date().toISOString(),
    });
  }

  emitDmReaction(threadId: string, messageId: string, reactions: any[]) {
    if (!this.server) return;
    this.server.to(`thread:${threadId}`).emit('dm:reaction_updated', {
      threadId,
      messageId,
      reactions,
    });
  }

  // ── NFC Touch & Connection Events ───────────────────────────

  emitNfcTapped(targetUserId: string, requesterProfile: any, connectionId: string) {
    if (!this.server) return;
    this.server.to(`user:${targetUserId}`).emit('nfc:tapped', {
      requesterProfile,
      connectionId,
      timestamp: new Date().toISOString(),
    });
  }

  emitConnectionRequested(targetUserId: string, requesterProfile: any, connectionId: string) {
    if (!this.server) return;
    const rooms = [`user:${targetUserId}`];
    if (requesterProfile?.targetMemberCode) rooms.push(`user:${requesterProfile.targetMemberCode}`);
    if (requesterProfile?.targetMemberId) rooms.push(`user:${requesterProfile.targetMemberId}`);
    for (const r of rooms) {
      this.server.to(r).emit('connection:requested', {
        requesterProfile,
        connectionId,
        timestamp: new Date().toISOString(),
      });
    }
  }

  emitConnectionAccepted(targetUserId: string, accepterProfile: any, connectionId: string) {
    if (!this.server) return;
    const rooms = [`user:${targetUserId}`];
    if (accepterProfile?.targetMemberCode) rooms.push(`user:${accepterProfile.targetMemberCode}`);
    if (accepterProfile?.targetMemberId) rooms.push(`user:${accepterProfile.targetMemberId}`);
    for (const r of rooms) {
      this.server.to(r).emit('connection:accepted', {
        accepterProfile,
        connectionId,
        timestamp: new Date().toISOString(),
      });
    }
  }

  emitConnectionDeclined(targetUserId: string, declinerProfile: any, connectionId: string) {
    if (!this.server) return;
    const rooms = [`user:${targetUserId}`];
    if (declinerProfile?.targetMemberCode) rooms.push(`user:${declinerProfile.targetMemberCode}`);
    if (declinerProfile?.targetMemberId) rooms.push(`user:${declinerProfile.targetMemberId}`);
    for (const r of rooms) {
      this.server.to(r).emit('connection:declined', {
        declinerProfile,
        connectionId,
        timestamp: new Date().toISOString(),
      });
    }
  }

  emitMeetingRequested(targetUserId: string, requesterProfile: any, meeting: any) {
    if (!this.server) return;
    const rooms = [`user:${targetUserId}`];
    if (meeting?.partnerCode) rooms.push(`user:${meeting.partnerCode}`);
    if (meeting?.partnerMemberId) rooms.push(`user:${meeting.partnerMemberId}`);
    for (const r of rooms) {
      this.server.to(r).emit('meeting:requested', {
        requesterProfile,
        meeting,
        timestamp: new Date().toISOString(),
      });
    }
  }

  emitMeetingResponded(targetUserId: string, responderProfile: any, meeting: any, status: 'confirmed' | 'declined') {
    if (!this.server) return;
    const rooms = [`user:${targetUserId}`];
    if (meeting?.hostCode) rooms.push(`user:${meeting.hostCode}`);
    if (meeting?.hostMemberId) rooms.push(`user:${meeting.hostMemberId}`);
    for (const r of rooms) {
      this.server.to(r).emit('meeting:responded', {
        responderProfile,
        meeting,
        status,
        timestamp: new Date().toISOString(),
      });
    }
  }

  emitNotification(userId: string, notification: any) {
    if (!this.server) return;
    this.server.to(`user:${userId}`).emit('notification:new', notification);
  }

  emitUnreadNotificationCount(userId: string, unreadCount: number) {
    if (!this.server) return;
    this.server.to(`user:${userId}`).emit('notification:unread_count', { unreadCount });
    this.server.to(`user:${userId}`).emit('notification:count', { count: unreadCount });
    this.server.to(`user:${userId}`).emit('notification:updated', { unreadCount });
  }

  emitToRoom(room: string, event: string, payload: any) {
    if (!this.server) return;
    this.server.to(room).emit(event, payload);
  }

  emitToAll(event: string, payload: any) {
    if (!this.server) return;
    this.server.emit(event, payload);
  }

  // ── Real-time Audio & Video Call Signaling ────────────────────

  @SubscribeMessage('call:check_active')
  handleCheckActiveCall(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { userId?: string } | string,
  ) {
    const rawUid = typeof payload === 'string' ? payload : payload?.userId;
    const userId = String(rawUid || '').trim();
    if (!userId) return { ok: false, call: null };

    const activeCall = this.getActiveCallForUser(userId);
    if (activeCall && activeCall.status === 'ringing') {
      this.logger.log(`Active call found for user ${userId}: ${activeCall.callId}`);
      client.emit('call:incoming', {
        callId: activeCall.callId,
        callerUserId: activeCall.callerUserId,
        callerName: activeCall.callerName,
        callerAvatar: activeCall.callerAvatar,
        callerTitle: activeCall.callerTitle,
        callType: activeCall.callType,
        timestamp: new Date(activeCall.createdAt).toISOString(),
      });
      return { ok: true, call: activeCall };
    }
    return { ok: true, call: null };
  }

  @SubscribeMessage('call:initiate')
  handleCallInitiate(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: {
      callId: string;
      recipientUserId: string;
      callerUserId?: string;
      callerName: string;
      callerAvatar?: string;
      callerTitle?: string;
      callType: 'audio' | 'video';
    },
  ) {
    if (!payload?.recipientUserId || !this.server) return { ok: false };
    const callerId = payload.callerUserId || client.id;
    if (callerId === payload.recipientUserId) {
      this.logger.warn(`User ${callerId} attempted to call self`);
      return { ok: false, error: 'cannot_call_self' };
    }
    this.logger.log(`Call initiated [${payload.callType}] by ${payload.callerName} (${callerId}) -> user:${payload.recipientUserId}`);

    this.cleanExpiredCalls();
    const activeCall: ActiveCallRecord = {
      callId: payload.callId,
      callerUserId: callerId,
      callerName: payload.callerName,
      callerAvatar: payload.callerAvatar || null,
      callerTitle: payload.callerTitle || null,
      recipientUserId: payload.recipientUserId,
      callType: payload.callType || 'video',
      status: 'ringing',
      createdAt: Date.now(),
      expiresAt: Date.now() + 45000,
    };
    this.activeCalls.set(payload.callId, activeCall);

    const callData = {
      callId: payload.callId,
      callerUserId: callerId,
      callerName: payload.callerName,
      callerAvatar: payload.callerAvatar || null,
      callerTitle: payload.callerTitle || null,
      callType: payload.callType || 'video',
      timestamp: new Date().toISOString(),
    };

    // Broadcast to recipient room (target UUID and lowercase variant)
    client.to(`user:${payload.recipientUserId}`).emit('call:incoming', callData);
    const recKey = String(payload.recipientUserId).toLowerCase();
    if (recKey !== payload.recipientUserId) {
      client.to(`user:${recKey}`).emit('call:incoming', callData);
    }

    // Persist urgent notification for lock screen, heads-up banner and push notification
    void this.persistCallNotification(payload, callerId);

    return { ok: true, callId: payload.callId };
  }

  private async persistCallNotification(payload: any, callerId: string) {
    try {
      const recipientId = payload.recipientUserId;
      const title = `Cuộc gọi đến từ ${payload.callerName || 'Hội viên CEO 1983'}`;
      const body = payload.callType === 'video' ? '📹 Cuộc gọi Video trực tiếp' : '📞 Cuộc gọi thoại trực tiếp';
      const safeData = JSON.stringify({
        callId: payload.callId,
        callerUserId: callerId,
        callerName: payload.callerName,
        callerAvatar: payload.callerAvatar,
        callerTitle: payload.callerTitle,
        callType: payload.callType,
        type: 'call',
      });

      // 1. Business notifications table (queryable by mobile and CRM)
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(recipientId);
      if (isUuid) {
        await this.prisma.$executeRawUnsafe(`
          INSERT INTO public.business_notifications (
            id, recipient_user_id, source_domain, source_record_id, dedupe_key,
            event_kind, notification_kind, title_key, body_key, safe_display_data,
            priority, status, app_scope, target_app, created_at, updated_at
          ) VALUES (
            gen_random_uuid(), $1::uuid, 'call', $2, $3,
            'incoming_call', 'call', $4, $5, $6::jsonb,
            'high', 'delivered', 'all', 'all', NOW(), NOW()
          )
        `, recipientId, payload.callId, `call_${payload.callId}`, title, body, safeData).catch(() => {});
      }

      // 2. Member notifications table
      await this.prisma.$executeRawUnsafe(`
        INSERT INTO public.member_notifications (
          id, recipient_id, title, body, read, dismissed, ref_type, ref_id, created_at
        ) VALUES (
          gen_random_uuid(), $1::text, $2, $3, false, false, 'call', $4, NOW()
        )
      `, String(recipientId), title, body, payload.callId).catch(() => {});
    } catch (err: any) {
      this.logger.warn(`Failed to persist call notification: ${err?.message}`);
    }
  }

  @SubscribeMessage('call:accept')
  handleCallAccept(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: {
      callId: string;
      callerUserId: string;
      calleeUserId: string;
      calleeName?: string;
      calleeAvatar?: string;
    },
  ) {
    if (!payload?.callerUserId || !this.server) return { ok: false };
    this.logger.log(`Call accepted: ${payload.callId} by ${payload.calleeUserId}`);

    const active = this.activeCalls.get(payload.callId);
    if (active) {
      active.status = 'accepted';
    }

    const callerRoom = `user:${payload.callerUserId}`;
    const callerRoomLower = `user:${String(payload.callerUserId).toLowerCase()}`;
    const acceptPayload = {
      callId: payload.callId,
      calleeUserId: payload.calleeUserId,
      calleeName: payload.calleeName,
      calleeAvatar: payload.calleeAvatar,
      timestamp: new Date().toISOString(),
    };

    this.server.to(callerRoom).emit('call:accepted', acceptPayload);
    if (callerRoomLower !== callerRoom) {
      this.server.to(callerRoomLower).emit('call:accepted', acceptPayload);
    }

    return { ok: true };
  }

  @SubscribeMessage('call:decline')
  handleCallDecline(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: {
      callId: string;
      callerUserId?: string;
      calleeUserId?: string;
      reason?: string;
    },
  ) {
    if (!this.server) return { ok: false };
    const callId = payload?.callId;
    const activeCall = callId ? this.activeCalls.get(callId) : null;
    this.logger.log(`Call declined: ${callId} -> caller:${payload?.callerUserId}`);

    if (callId) {
      this.activeCalls.delete(callId);
    }

    const participants = new Set<string>();
    if (payload?.callerUserId) {
      participants.add(String(payload.callerUserId));
      participants.add(String(payload.callerUserId).toLowerCase());
    }
    if (payload?.calleeUserId) {
      participants.add(String(payload.calleeUserId));
      participants.add(String(payload.calleeUserId).toLowerCase());
    }
    if (activeCall) {
      if (activeCall.callerUserId) {
        participants.add(String(activeCall.callerUserId));
        participants.add(String(activeCall.callerUserId).toLowerCase());
      }
      if (activeCall.recipientUserId) {
        participants.add(String(activeCall.recipientUserId));
        participants.add(String(activeCall.recipientUserId).toLowerCase());
      }
    }

    const declinePayload = {
      callId: callId || '',
      reason: payload?.reason || 'busy',
      timestamp: new Date().toISOString(),
    };
    const endPayload = {
      callId: callId || '',
      timestamp: new Date().toISOString(),
    };

    for (const u of participants) {
      this.server.to(`user:${u}`).emit('call:declined', declinePayload);
      this.server.to(`user:${u}`).emit('call:ended', endPayload);
    }
    client.broadcast.emit('call:ended', endPayload);

    if (callId) {
      this.prisma.$executeRawUnsafe(
        `UPDATE public.business_notifications SET status = 'dismissed', updated_at = NOW() WHERE source_domain = 'call' AND source_record_id = $1`,
        callId
      ).catch(() => {});
      this.prisma.$executeRawUnsafe(
        `UPDATE public.member_notifications SET dismissed = true, read = true WHERE ref_type = 'call' AND ref_id = $1`,
        callId
      ).catch(() => {});
    }

    return { ok: true };
  }

  @SubscribeMessage('call:end')
  handleCallEnd(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: {
      callId?: string;
      targetUserId?: string;
      callerUserId?: string;
      duration?: number;
    },
  ) {
    if (!this.server) return { ok: false };
    const callId = payload?.callId;
    const activeCall = callId ? this.activeCalls.get(callId) : null;
    this.logger.log(`Call ended: ${callId || 'unknown'} -> target:${payload?.targetUserId}`);

    if (callId) {
      this.activeCalls.delete(callId);
    }

    const participants = new Set<string>();
    if (payload?.targetUserId) {
      participants.add(String(payload.targetUserId));
      participants.add(String(payload.targetUserId).toLowerCase());
    }
    if (payload?.callerUserId) {
      participants.add(String(payload.callerUserId));
      participants.add(String(payload.callerUserId).toLowerCase());
    }
    if (activeCall) {
      if (activeCall.callerUserId) {
        participants.add(String(activeCall.callerUserId));
        participants.add(String(activeCall.callerUserId).toLowerCase());
      }
      if (activeCall.recipientUserId) {
        participants.add(String(activeCall.recipientUserId));
        participants.add(String(activeCall.recipientUserId).toLowerCase());
      }
    }

    const endPayload = {
      callId: callId || '',
      duration: payload?.duration || 0,
      timestamp: new Date().toISOString(),
    };

    for (const u of participants) {
      this.server.to(`user:${u}`).emit('call:ended', endPayload);
    }
    client.broadcast.emit('call:ended', endPayload);

    if (callId) {
      this.prisma.$executeRawUnsafe(
        `UPDATE public.business_notifications SET status = 'dismissed', updated_at = NOW() WHERE source_domain = 'call' AND source_record_id = $1`,
        callId
      ).catch(() => {});
      this.prisma.$executeRawUnsafe(
        `UPDATE public.member_notifications SET dismissed = true, read = true WHERE ref_type = 'call' AND ref_id = $1`,
        callId
      ).catch(() => {});
    }

    return { ok: true };
  }

  endCallForUser(userId: string, callId?: string, targetUserId?: string) {
    if (!this.server) return { ok: false };
    let foundCallId = callId;
    if (!foundCallId) {
      const active = this.getActiveCallForUser(userId);
      if (active) foundCallId = active.callId;
    }

    const activeCall = foundCallId ? this.activeCalls.get(foundCallId) : null;
    if (foundCallId) {
      this.activeCalls.delete(foundCallId);
    }

    const participants = new Set<string>();
    participants.add(userId);
    participants.add(userId.toLowerCase());
    if (targetUserId) {
      participants.add(targetUserId);
      participants.add(targetUserId.toLowerCase());
    }
    if (activeCall) {
      if (activeCall.callerUserId) {
        participants.add(activeCall.callerUserId);
        participants.add(activeCall.callerUserId.toLowerCase());
      }
      if (activeCall.recipientUserId) {
        participants.add(activeCall.recipientUserId);
        participants.add(activeCall.recipientUserId.toLowerCase());
      }
    }

    const endPayload = {
      callId: foundCallId || '',
      duration: 0,
      timestamp: new Date().toISOString(),
    };

    for (const u of participants) {
      this.server.to(`user:${u}`).emit('call:ended', endPayload);
    }

    if (foundCallId) {
      this.prisma.$executeRawUnsafe(
        `UPDATE public.business_notifications SET status = 'dismissed', updated_at = NOW() WHERE source_domain = 'call' AND source_record_id = $1`,
        foundCallId
      ).catch(() => {});
      this.prisma.$executeRawUnsafe(
        `UPDATE public.member_notifications SET dismissed = true, read = true WHERE ref_type = 'call' AND ref_id = $1`,
        foundCallId
      ).catch(() => {});
    }

    return { ok: true };
  }

  @SubscribeMessage('call:signal')
  handleCallSignal(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: {
      callId: string;
      targetUserId: string;
      signal: any;
    },
  ) {
    if (!payload?.targetUserId || !this.server) return { ok: false };
    this.server.to(`user:${payload.targetUserId}`).emit('call:signal', {
      callId: payload.callId,
      senderSocketId: client.id,
      signal: payload.signal,
    });
    return { ok: true };
  }
}
