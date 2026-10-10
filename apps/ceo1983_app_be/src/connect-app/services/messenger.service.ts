import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ConnectAppGateway } from '../connect-app.gateway';
import { formatVNTime } from '../connect-app.utils';
import * as crypto from 'crypto';
import { z } from 'zod';

@Injectable()
export class ConnectMessengerService {
  constructor(
    private prisma: PrismaService,
    private gateway: ConnectAppGateway,
  ) {}

  async resolveMemberCodeForUser(userId: string): Promise<string> {
    try {
      // 1. Kiểm tra trực tiếp trong bảng members theo user_id hoặc id
      const mems = await this.prisma.$queryRaw<any[]>`
        SELECT m.code FROM public.members m
        WHERE m.user_id = ${userId}::uuid
           OR m.id = ${userId}::text
        LIMIT 1
      `.catch(() => []);
      if (mems && mems[0]?.code) {
        return mems[0].code;
      }

      // 2. Kiểm tra trong public.vione_users (tài khoản đăng nhập chính thức của NestJS)
      const userAccount = await this.prisma.$queryRaw<any[]>`
        SELECT email, username, name FROM public.vione_users WHERE id = ${userId}::uuid LIMIT 1
      `.catch(() => []);

      if (userAccount && userAccount[0]) {
        const u = userAccount[0];
        const byUser = await this.prisma.$queryRaw<any[]>`
          SELECT code FROM public.members 
          WHERE (email IS NOT NULL AND LOWER(email) = LOWER(${u.email}))
             OR (code IS NOT NULL AND LOWER(code) = LOWER(${u.username}))
          LIMIT 1
        `.catch(() => []);

        if (byUser && byUser[0]?.code) {
          // Tự động liên kết user_id vào members để các truy vấn sau nhanh tức thì
          await this.prisma.$executeRaw`
            UPDATE public.members SET user_id = ${userId}::uuid WHERE LOWER(code) = LOWER(${byUser[0].code}) AND user_id IS NULL
          `.catch(() => null);
          return byUser[0].code;
        }

        // Tự động tạo hồ sơ hội viên cho tài khoản này
        const userEmail = u.email || `${u.username || userId}@ceo1983.vn`;
        const newCode = 'M1983-' + String(Math.floor(100 + Math.random() * 900));
        await this.prisma.$executeRaw`
          INSERT INTO public.members (
            id, code, name, contact, email, phone, type, level, industry, region,
            status, joined_at, fee_year, fee_paid, address, about, payment_status,
            user_id, association_id, created_at, updated_at
          ) VALUES (
            ${userId}::text, ${newCode}, ${u.name || 'Hội viên CEO 1983'}, ${u.name || 'Hội viên CEO 1983'},
            ${userEmail}, '0983000000', 'corporate', 'standard', 'Kinh doanh & Quản lý', 'Hà Nội',
            'active', CURRENT_DATE, 2026, true, 'Hà Nội', 'Hội viên CLB Doanh Nhân CEO 1983', 'paid',
            ${userId}::uuid, 'c1983000-0000-4000-8000-000000001983'::uuid, now(), now()
          ) ON CONFLICT (id) DO UPDATE SET user_id = ${userId}::uuid
        `.catch(() => null);
        return newCode;
      }

      // 3. Fallback kiểm tra auth.users (nếu có Supabase auth cũ)
      const authUsers = await this.prisma.$queryRaw<any[]>`
        SELECT email FROM auth.users WHERE id = ${userId}::uuid LIMIT 1
      `.catch(() => []);
      const userEmail = authUsers[0]?.email;
      if (userEmail) {
        const byEmail = await this.prisma.$queryRaw<any[]>`
          SELECT code FROM public.members WHERE LOWER(email) = LOWER(${userEmail}) LIMIT 1
        `.catch(() => []);
        if (byEmail && byEmail[0]?.code) {
          return byEmail[0].code;
        }
      }

      return `M1983-${String(userId).replace(/[^a-zA-Z0-9]/g, '').slice(-4).toUpperCase()}`;
    } catch {
      return `M1983-${String(userId).replace(/[^a-zA-Z0-9]/g, '').slice(-4).toUpperCase()}`;
    }
  }

  async listMemberConversations(userId: string) {
    const myCode = await this.resolveMemberCodeForUser(userId);
    const mine = myCode.toLowerCase();
    const myUserId = userId.toLowerCase();
    const myKeys = [mine, myUserId];

    const msgs = await this.prisma.$queryRaw<any[]>`
      SELECT id, from_id, to_id, text, created_at, read_at
      FROM public.messages
      WHERE LOWER(from_id) = ${mine} OR LOWER(to_id) = ${mine}
         OR LOWER(from_id) = ${myUserId} OR LOWER(to_id) = ${myUserId}
      ORDER BY created_at DESC
    `.catch(() => []);

    const members = await this.prisma.$queryRaw<any[]>`
      SELECT m.id, m.code, m.user_id, m.name, m.contact,
             COALESCE(up.display_name, vu.name, bi.display_name, m.contact, m.name) as display_name,
             COALESCE(up.avatar_url, bi.avatar_url, vu.avatar_url, m.avatar) as avatar
      FROM public.members m
      LEFT JOIN public.user_profiles up ON up.user_id = m.user_id
      LEFT JOIN public.business_identities bi ON bi.owner_user_id = m.user_id AND bi.status = 'active'
      LEFT JOIN public.vione_users vu ON vu.id = m.user_id
    `.catch(() => []);

    const memberByCode = new Map<string, any>();
    const memberByUserId = new Map<string, any>();
    for (const mem of members) {
      if (mem.code) memberByCode.set(String(mem.code).toLowerCase(), mem);
      if (mem.user_id) memberByUserId.set(String(mem.user_id).toLowerCase(), mem);
      if (mem.id) memberByCode.set(String(mem.id).toLowerCase(), mem);
    }

    const byPeer = new Map<string, any[]>();
    for (const m of msgs) {
      const from = String(m.from_id).toLowerCase();
      const to = String(m.to_id).toLowerCase();
      const rawPeer = myKeys.includes(from) ? to : from;

      // Chuẩn hóa định danh peer về member code nếu tìm thấy trong members
      const mem = memberByUserId.get(rawPeer) || memberByCode.get(rawPeer);
      const peerKey = mem?.code ? String(mem.code).toLowerCase() : rawPeer;

      if (!byPeer.has(peerKey)) byPeer.set(peerKey, []);
      byPeer.get(peerKey)!.push(m);
    }

    const peers = [...byPeer.keys()];

    // Tra cứu kết nối thực tế trong public.user_connections để phân loại: Đã kết nối hay Tin nhắn chờ
    const peerUserIds = Array.from(memberByUserId.keys()).filter(Boolean);
    const connMap = new Map<string, { status: string; requesterId: string; connectionId: string }>();
    if (peerUserIds.length > 0) {
      try {
        const conns = await this.prisma.$queryRaw<any[]>`
          SELECT id, requester_user_id, recipient_user_id, status
          FROM public.user_connections
          WHERE (requester_user_id = ${userId}::uuid AND recipient_user_id = ANY(${peerUserIds}::uuid[]))
             OR (recipient_user_id = ${userId}::uuid AND requester_user_id = ANY(${peerUserIds}::uuid[]))
        `.catch(() => []);
        for (const c of conns) {
          const otherId = String(c.requester_user_id).toLowerCase() === userId.toLowerCase()
            ? String(c.recipient_user_id).toLowerCase()
            : String(c.requester_user_id).toLowerCase();
          connMap.set(otherId, {
            status: String(c.status).toLowerCase(),
            requesterId: String(c.requester_user_id).toLowerCase(),
            connectionId: String(c.id),
          });
        }
      } catch {
        /* ignore */
      }
    }

    const resList: any[] = [];
    for (const peer of peers) {
      const list = byPeer.get(peer)!;
      const latest = list[0];
      const unread = list.filter((m) => (myKeys.includes(String(m.to_id).toLowerCase())) && m.read_at == null).length;
      const isSystem = peer === 'admin' || peer === 'system';
      const mem = memberByCode.get(peer) || memberByUserId.get(peer);
      const peerUserId = mem?.user_id ? String(mem.user_id) : null;

      // ĐẢM BẢO: Hễ có tin nhắn giữa 2 bên là hiển thị 100%, không lọc bỏ!
      const hasMessages = Boolean(latest && latest.text && String(latest.text).trim().length > 0);
      if (!isSystem && !hasMessages) {
        continue;
      }

      const isOnline = isSystem ? true : (peerUserId ? (this.gateway?.isUserOnline(peerUserId) ?? false) : false);
      const connInfo = peerUserId ? connMap.get(peerUserId.toLowerCase()) : null;
      const isConnected = isSystem ? true : (connInfo?.status === 'accepted');
      const connectionStatus = isSystem ? 'accepted' : (connInfo?.status || 'none');
      const isPending = !isSystem && connInfo?.status === 'pending';
      const isOutgoingPending = isPending && connInfo?.requesterId === userId.toLowerCase();
      const isIncomingPending = isPending && connInfo?.requesterId !== userId.toLowerCase();
      const isStranger = !isSystem && !isConnected;

      resList.push({
        peerCode: mem?.code || peer,
        userId: peerUserId ?? null,
        isOnline,
        name: isSystem ? 'Ban Thư Ký CLB Doanh Nhân CEO 1983' : (mem?.display_name || mem?.name || mem?.contact || peer.toUpperCase()),
        avatarUrl: isSystem ? '/ceo1983-logo.png' : (mem?.avatar ?? null),
        last: latest.text,
        time: latest.created_at ? new Date(latest.created_at).toISOString() : new Date().toISOString(),
        rawTime: latest.created_at ? new Date(latest.created_at).toISOString() : new Date().toISOString(),
        unread,
        isSystem,
        isConnected,
        connectionStatus,
        isPending,
        isOutgoingPending,
        isIncomingPending,
        isStranger,
        connectionId: connInfo?.connectionId || null,
      });
    }

    if (!byPeer.has('admin')) {
      resList.push({
        peerCode: 'admin',
        name: 'Ban Thư Ký CLB Doanh Nhân CEO 1983',
        avatarUrl: '/ceo1983-logo.png',
        last: '[action:payment|amount:20000000|invoice:HD-2026-001|qr:https://img.vietqr.io/image/MB-1983000000-compact2.png?amount=20000000&addInfo=HD-2026-001|due:31/03/2026|desc:H%E1%BB%99i%20ph%C3%AD%20th%C6%B0%E1%BB%9Dng%20ni%C3%AAn%202026%20-%20CLB%20Doanh%20Nh%C3%A2n%20CEO%201983]',
        time: new Date(Date.now() - 3600000).toISOString(),
        rawTime: new Date(Date.now() - 3600000).toISOString(),
        unread: 0,
        isSystem: true,
        isOnline: true,
        isConnected: true,
        connectionStatus: 'accepted',
        isPending: false,
        isOutgoingPending: false,
        isIncomingPending: false,
        isStranger: false,
        connectionId: null,
      });
    }

    // Đưa hội thoại có tin nhắn mới nhất lên đầu danh sách chuẩn Messenger
    resList.sort((a, b) => {
      const timeA = new Date(a.rawTime || a.time).getTime() || 0;
      const timeB = new Date(b.rawTime || b.time).getTime() || 0;
      return timeB - timeA;
    });

    return resList;
  }

  async listMemberMessages(userId: string, peerCode: string) {
    const myCode = await this.resolveMemberCodeForUser(userId);
    const mine = myCode.toLowerCase();
    const peer = peerCode.toLowerCase();
    const isSystem = peer === 'admin' || peer === 'system';
    const isGroup = peer.startsWith('group_');
    const isChannel = peer.startsWith('channel_');

    // Tra cứu hội viên đối tác để lấy tất cả các alias (code, user_id, id)
    const peerMemRows = await this.prisma.$queryRaw<any[]>`
      SELECT m.id, m.code, m.user_id, m.name, m.contact,
             COALESCE(up.display_name, vu.name, bi.display_name, m.contact, m.name) as name,
             COALESCE(up.avatar_url, bi.avatar_url, vu.avatar_url, m.avatar) as avatar
      FROM public.members m
      LEFT JOIN public.user_profiles up ON up.user_id = m.user_id
      LEFT JOIN public.business_identities bi ON bi.owner_user_id = m.user_id AND bi.status = 'active'
      LEFT JOIN public.vione_users vu ON vu.id = m.user_id
      WHERE LOWER(m.code) = ${peer}
         OR m.user_id::text = ${peer}
         OR m.id = ${peer}
      LIMIT 1
    `.catch((): any[] => []);

    const peerMem = peerMemRows[0];
    const peerAliases = new Set<string>([peer]);
    if (peerMem?.code) peerAliases.add(String(peerMem.code).toLowerCase());
    if (peerMem?.user_id) peerAliases.add(String(peerMem.user_id).toLowerCase());
    if (peerMem?.id) peerAliases.add(String(peerMem.id).toLowerCase());

    const myAliases = new Set<string>([mine, userId.toLowerCase()]);
    const peerList = Array.from(peerAliases);
    const myList = Array.from(myAliases);

    const rawMsgs = await (
      (isGroup || isChannel)
        ? this.prisma.$queryRaw<any[]>`
            SELECT id, from_id, to_id, text, created_at, read_at
            FROM public.messages
            WHERE LOWER(to_id) = ${peer} OR LOWER(from_id) = ${peer}
            ORDER BY created_at ASC
          `.catch((): any[] => [])
        : this.prisma.$queryRaw<any[]>`
            SELECT id, from_id, to_id, text, created_at, read_at
            FROM public.messages
            WHERE (LOWER(from_id) = ANY(${myList}::text[]) AND LOWER(to_id) = ANY(${peerList}::text[]))
               OR (LOWER(from_id) = ANY(${peerList}::text[]) AND LOWER(to_id) = ANY(${myList}::text[]))
            ORDER BY created_at ASC
          `.catch((): any[] => [])
    );

    const msgs: any[] = Array.isArray(rawMsgs) ? [...rawMsgs] : [];

    if (isSystem && msgs.length === 0) {
      const welcomeMsg = 'Chào mừng quý Anh/Chị đến với Kênh Thông Báo Chính Thức của Ban Thư Ký CLB Doanh Nhân CEO 1983!';
      const paymentMsg = '[action:payment|amount:20000000|invoice:HD-2026-001|qr:https://img.vietqr.io/image/MB-1983000000-compact2.png?amount=20000000&addInfo=HD-2026-001|due:31/03/2026|desc:H%E1%BB%99i%20ph%C3%AD%20th%C6%B0%E1%BB%9Dng%20ni%C3%AAn%202026%20-%20CLB%20Doanh%20Nh%C3%A2n%20CEO%201983]';
      const meetingMsg = '[action:meeting|title:H%E1%BB%8Dp%20Ban%20Ch%E1%BA%A5p%20H%C3%A0nh%20CEO%201983%20Th%C3%A1ng%203|time:14:00%20-%2028/03/2026|location:Trung%20t%C3%A2m%20H%E1%BB%99i%20Ngh%E1%BB%8B%20Qu%E1%BB%91c%20Gia%20H%C3%A0%20N%E1%BB%99i|link:https://meet.ceo1983.vn/ceo1983-bch|desc:Phi%C3%AAn%20h%E1%BB%8Dp%20chi%E1%BA%BFn%20l%C6%B0%E1%BB%A3c%20tri%E1%BB%83n%20khai%20giao%20th%C6%B0%C6%A1ng%20to%C3%A0n%20di%E1%BB%87n]';

      await this.prisma.$executeRaw`
        INSERT INTO public.messages (id, from_id, to_id, text, created_at)
        VALUES 
          (gen_random_uuid(), 'admin', ${mine}, ${welcomeMsg}, now() - interval '2 days'),
          (gen_random_uuid(), 'admin', ${mine}, ${paymentMsg}, now() - interval '1 hour'),
          (gen_random_uuid(), 'admin', ${mine}, ${meetingMsg}, now() - interval '10 minutes')
      `.catch(() => null);

      msgs.push(
        { id: 'sys-welcome', from_id: 'admin', to_id: mine, text: welcomeMsg, created_at: new Date(Date.now() - 172800000).toISOString(), read_at: null },
        { id: 'sys-payment', from_id: 'admin', to_id: mine, text: paymentMsg, created_at: new Date(Date.now() - 3600000).toISOString(), read_at: null },
        { id: 'sys-meeting', from_id: 'admin', to_id: mine, text: meetingMsg, created_at: new Date(Date.now() - 600000).toISOString(), read_at: null },
      );
    }

    // Khởi tạo tin nhắn cho các Ban chuyên môn / Kênh chính thức nếu chưa có tin nhắn
    if (isChannel && msgs.length === 0) {
      const channelSeeds: Record<string, string[]> = {
        channel_secretariat: [
          'Chào mừng Quý Anh/Chị Hội viên đến với Kênh Ban Thư Ký & Ban Điều Hành CLB Doanh Nhân CEO 1983.',
          '[action:meeting|title:H%E1%BB%8Dp%20Ban%20Ch%E1%BA%A5p%20H%C3%A0nh%20CEO%201983%20Th%C3%A1ng%203|time:14:00%20-%2028/03/2026|location:Trung%20t%C3%A2m%20H%E1%BB%99i%20Ngh%E1%BB%8B%20Qu%E1%BB%91c%20Gia%20H%C3%A0%20N%E1%BB%99i|link:https://meet.ceo1983.vn/ceo1983-bch|desc:Phi%C3%AAn%20h%E1%BB%8Dp%20chi%E1%BA%BFn%20l%C6%B0%E1%BB%A3c%20tri%E1%BB%83n%20khai%20giao%20th%C6%B0%C6%A1ng%20to%C3%A0n%20di%E1%BB%87n]',
          'Văn bản chỉ đạo & kế hoạch hoạt động quý 1/2026 đã được Ban Thư Ký cập nhật. Kính mời Quý Hội viên theo dõi và đồng hành.',
        ],
        channel_media: [
          'Chào mừng Quý Hội viên đến với Kênh Ban Truyền Thông Hiệp Hội CEO 1983.',
          'Bản tin hoạt động CLB: Đẩy mạnh các chiến dịch truyền thông nhận diện thương hiệu cho các doanh nghiệp hội viên trên đa nền tảng.',
          'Thông cáo báo chí: Chuỗi sự kiện Gala Doanh Nhân & Lễ tôn vinh Doanh nghiệp tiêu biểu 2026 chuẩn bị khởi động.',
        ],
        channel_promotion: [
          'Chào mừng Quý Hội viên đến với Kênh Ban Xúc Tiến Giao Thương CLB CEO 1983.',
          'Chương trình Matching B2B: Ban Xúc tiến mở cổng tiếp nhận nhu cầu liên kết chuỗi cung ứng giữa các doanh nghiệp hội viên.',
          'Cơ hội kết nối tuần này: Nhu cầu tìm đối tác tổng thầu thi công nội thất, cung cấp nguyên vật liệu và giải pháp công nghệ số.',
        ],
        channel_deals: [
          'Chào mừng Quý Hội viên đến với Kênh Cơ Hội & Deal B2B CLB CEO 1983.',
          'Tổng hợp các gói hợp tác kinh doanh độc quyền và chính sách chiết khấu ưu đãi nội bộ giữa các doanh nghiệp trong CLB.',
          'Deal hot tháng 3: Gói tài trợ truyền thông và gian hàng triển lãm B2B dành riêng cho hội viên chính thức.',
        ],
        channel_events: [
          'Chào mừng Quý Hội viên đến với Kênh Ban Sự Kiện & Hội Nghị CLB CEO 1983.',
          'Lịch sự kiện sắp tới: Đại hội thường niên CLB CEO 1983 và Diễn đàn Kinh tế Tư nhân 2026.',
          'Vé tham dự sự kiện và mã QR Check-in đã sẵn sàng trong mục Vé sự kiện của bạn.',
        ],
      };

      const seedList = channelSeeds[peer] || [
        `Chào mừng Quý Anh/Chị đến với kênh ${peerCode}.`,
        'Các thông báo và cập nhật mới nhất từ Ban chuyên môn sẽ được gửi trực tiếp tại đây.',
      ];

      for (let sIdx = 0; sIdx < seedList.length; sIdx++) {
        const seedText = seedList[sIdx];
        const offsetMins = (seedList.length - sIdx) * 30;
        await this.prisma.$executeRaw`
          INSERT INTO public.messages (id, from_id, to_id, text, created_at)
          VALUES (gen_random_uuid(), ${peer}, ${peer}, ${seedText}, now() - (${offsetMins} * interval '1 minute'))
        `.catch(() => null);

        msgs.push({
          id: `channel-${peer}-${sIdx}`,
          from_id: peer,
          to_id: peer,
          text: seedText,
          created_at: new Date(Date.now() - offsetMins * 60000).toISOString(),
          read_at: null,
        });
      }
    }

    await this.prisma.$executeRaw`
      UPDATE public.messages
      SET read_at = now()
      WHERE LOWER(from_id) = ${peer} AND LOWER(to_id) = ${mine} AND read_at IS NULL
    `.catch(() => null);

    const channelNames: Record<string, string> = {
      channel_secretariat: '🏛️ Kênh Ban Thư Ký & Ban Điều Hành',
      channel_media: '📢 Kênh Ban Truyền Thông Hiệp Hội',
      channel_promotion: '🤝 Kênh Ban Xúc Tiến Giao Thương',
      channel_deals: '🎯 Kênh Cơ Hội & Deal B2B',
      channel_events: '🌟 Kênh Ban Sự Kiện & Hội Nghị',
    };

    const resolvedPeerName = isChannel
      ? (channelNames[peer] || `Kênh ${peerCode}`)
      : (isSystem ? 'Ban Thư Ký CLB Doanh Nhân CEO 1983' : (peerMem?.name || peerMem?.contact || peerCode.toUpperCase()));

    return {
      peerCode: peerMem?.code || peer,
      peerName: resolvedPeerName,
      avatarUrl: isSystem ? '/ceo1983-logo.png' : (peerMem?.avatar ?? null),
      isSystem: isSystem || isChannel,
      messages: msgs.map((m) => {
        const fromLower = String(m.from_id).toLowerCase();
        const isMine = myList.includes(fromLower);
        return {
          id: String(m.id),
          text: m.text,
          mine: isMine,
          time: formatVNTime(new Date(m.created_at)),
          createdAt: m.created_at ? new Date(m.created_at).toISOString() : new Date().toISOString(),
          seen: m.read_at != null,
          isRetracted: m.text === '[retracted]',
        };
      }),
    };
  }

  async sendMemberMessage(userId: string, peerCode: string, text: string) {
    const myCode = await this.resolveMemberCodeForUser(userId);
    const mine = myCode.toLowerCase();
    const isGroup = peerCode.toLowerCase().startsWith('group_');
    const isChannel = peerCode.toLowerCase().startsWith('channel_');

    // Chuẩn hóa peerCode: nếu người gửi truyền user_id hoặc code viết hoa, phân giải về code hội viên
    let targetPeerCode = peerCode.toLowerCase();
    let targetUserId: string | null = null;
    if (!isGroup && !isChannel && targetPeerCode !== 'admin' && targetPeerCode !== 'system') {
      const peerMemRows = await this.prisma.$queryRaw<any[]>`
        SELECT m.code, m.user_id FROM public.members m 
        WHERE LOWER(m.code) = ${targetPeerCode} OR m.user_id::text = ${targetPeerCode} OR m.id = ${targetPeerCode}
        LIMIT 1
      `.catch((): any[] => []);
      if (peerMemRows[0]) {
        targetPeerCode = String(peerMemRows[0].code).toLowerCase();
        targetUserId = peerMemRows[0].user_id ? String(peerMemRows[0].user_id) : null;
      }
    }

    const msgId = crypto.randomUUID();
    const nowIso = new Date().toISOString();

    await this.prisma.$executeRaw`
      INSERT INTO public.messages (id, from_id, to_id, text, created_at)
      VALUES (${msgId}::uuid, ${mine}, ${targetPeerCode}, ${text}, ${nowIso}::timestamptz)
    `;

    if (this.gateway && this.gateway.server) {
      this.gateway.server.emit('member:message_received', {
        id: msgId,
        fromCode: mine,
        toCode: targetPeerCode,
        fromUserId: userId,
        toUserId: targetUserId,
        text,
        createdAt: nowIso,
      });
      this.gateway.server.emit('dm:message_received', {
        id: msgId,
        fromCode: mine,
        toCode: targetPeerCode,
        fromUserId: userId,
        toUserId: targetUserId,
        text,
        createdAt: nowIso,
      });
      this.gateway.server.emit('dm:thread_updated', {
        fromCode: mine,
        toCode: targetPeerCode,
        fromUserId: userId,
        toUserId: targetUserId,
      });
    }

    return { ok: true, id: msgId, myCode };
  }

  async retractMemberMessage(userId: string, messageId: string) {
    const myCode = await this.resolveMemberCodeForUser(userId);
    const mine = myCode.toLowerCase();

    const msgRows = await this.prisma.$queryRaw<any[]>`
      SELECT id, from_id, to_id, text FROM public.messages WHERE id = ${messageId}::uuid LIMIT 1
    `.catch(() => []);

    if (msgRows.length > 0) {
      if (String(msgRows[0].from_id).toLowerCase() !== mine) {
        throw new ForbiddenException('cannot_retract_other_message');
      }
      await this.prisma.$executeRaw`
        UPDATE public.messages
        SET text = '[retracted]'
        WHERE id = ${messageId}::uuid
      `.catch(() => null);
    } else {
      await this.prisma.$executeRaw`
        UPDATE public.messages
        SET text = '[retracted]'
        WHERE id::text = ${messageId} AND LOWER(from_id) = ${mine}
      `.catch(() => null);
    }

    if (this.gateway && this.gateway.server) {
      this.gateway.server.emit('dm:message_retracted', { messageId });
      this.gateway.server.emit('dm:thread_updated', {});
      this.gateway.server.emit('member:message_received', {
        fromCode: mine,
        retractedMessageId: messageId,
      });
    }

    return { ok: true };
  }

  // ── Direct Messaging (1-1 Inbox) ──────────────────────────────────
  async listMyDmThreads(userId: string) {
    const threads = await this.prisma.$queryRaw<any[]>`
      SELECT t.id, t.user1_id, t.user2_id, t.last_message_at, t.last_message_body,
             (SELECT COUNT(*)::int FROM public.direct_messages m 
              WHERE m.thread_id = t.id AND m.sender_user_id != ${userId}::uuid AND m.read_at IS NULL AND m.is_retracted = false) as unread_count,
             (SELECT m.sender_user_id FROM public.direct_messages m 
              WHERE m.thread_id = t.id AND m.is_retracted = false ORDER BY m.created_at DESC LIMIT 1) as last_sender_id
      FROM public.direct_message_threads t
      WHERE t.user1_id = ${userId}::uuid OR t.user2_id = ${userId}::uuid
      ORDER BY t.last_message_at DESC NULLS LAST, t.updated_at DESC
    `.catch(() => []);

    const connections = await this.prisma.$queryRaw<any[]>`
      SELECT requester_user_id, recipient_user_id
      FROM public.user_connections
      WHERE status = 'accepted'::public.global_connection_status 
        AND (requester_user_id = ${userId}::uuid OR recipient_user_id = ${userId}::uuid)
    `.catch(() => []);

    const counterpartUserIds = new Set<string>();
    const acceptedSet = new Set<string>();
    for (const t of threads) {
      const counterpart = String(t.user1_id).toLowerCase() === userId.toLowerCase() ? String(t.user2_id).toLowerCase() : String(t.user1_id).toLowerCase();
      counterpartUserIds.add(counterpart);
    }
    for (const c of connections) {
      const counterpart = String(c.requester_user_id).toLowerCase() === userId.toLowerCase() ? String(c.recipient_user_id).toLowerCase() : String(c.requester_user_id).toLowerCase();
      counterpartUserIds.add(counterpart);
      acceptedSet.add(counterpart);
    }

    const userProfilesMap = new Map<string, { displayName: string; avatarUrl: string | null; headline: string | null; companyName: string | null }>();
    if (counterpartUserIds.size > 0) {
      const idsArray = Array.from(counterpartUserIds);
      const [identities, profiles, members] = await Promise.all([
        this.prisma.$queryRaw<any[]>`
          SELECT owner_user_id, display_name, avatar_url, headline, job_title, company_name 
          FROM public.business_identities 
          WHERE owner_user_id = ANY(${idsArray}::uuid[])
        `.catch(() => []),
        this.prisma.$queryRaw<any[]>`
          SELECT user_id, display_name, avatar_url, professional_title, company_name 
          FROM public.user_profiles 
          WHERE user_id = ANY(${idsArray}::uuid[])
        `.catch(() => []),
        this.prisma.$queryRaw<any[]>`
          SELECT user_id, name, avatar, company, position 
          FROM public.members 
          WHERE user_id = ANY(${idsArray}::uuid[])
        `.catch(() => []),
      ]);

      for (const id of idsArray) {
        const idLower = id.toLowerCase();
        const ident = (identities as any[]).find((i: any) => String(i.owner_user_id).toLowerCase() === idLower);
        const prof = (profiles as any[]).find((p: any) => String(p.user_id).toLowerCase() === idLower);
        const mem = (members as any[]).find((m: any) => String(m.user_id).toLowerCase() === idLower);

        userProfilesMap.set(idLower, {
          displayName: ident?.display_name || prof?.display_name || mem?.name || 'Doanh nhân CEO 1983',
          avatarUrl: ident?.avatar_url || prof?.avatar_url || mem?.avatar || null,
          headline: ident?.headline || ident?.job_title || prof?.professional_title || mem?.position || null,
          companyName: ident?.company_name || prof?.company_name || mem?.company || null,
        });
      }
    }

    const resultThreads: any[] = [];
    const addedCounterparts = new Set<string>();

    for (const t of threads) {
      const counterpartId = String(t.user1_id).toLowerCase() === userId.toLowerCase() ? String(t.user2_id).toLowerCase() : String(t.user1_id).toLowerCase();
      addedCounterparts.add(counterpartId);
      const profile = userProfilesMap.get(counterpartId) || { displayName: 'Doanh nhân CEO 1983', avatarUrl: null, headline: null, companyName: null };
      resultThreads.push({
        threadId: t.id,
        personId: `u:${counterpartId}`,
        displayName: profile.displayName,
        avatarUrl: profile.avatarUrl,
        headline: profile.headline,
        companyName: profile.companyName,
        isOnline: this.gateway?.isUserOnline(counterpartId) ?? false,
        lastMessageAt: t.last_message_at ? new Date(t.last_message_at).toISOString() : null,
        lastMessagePreview: t.last_message_body || null,
        lastMessageFromMe: t.last_sender_id ? String(t.last_sender_id).toLowerCase() === userId.toLowerCase() : false,
        unreadCount: Number(t.unread_count || 0),
        isConnected: acceptedSet.has(counterpartId),
      });
    }

    // Bổ sung các hội viên đã kết nối nhưng chưa phát sinh tin nhắn
    for (const c of connections) {
      const counterpartId = String(c.requester_user_id).toLowerCase() === userId.toLowerCase()
        ? String(c.recipient_user_id).toLowerCase()
        : String(c.requester_user_id).toLowerCase();

      if (!addedCounterparts.has(counterpartId)) {
        addedCounterparts.add(counterpartId);
        const profile = userProfilesMap.get(counterpartId) || { displayName: 'Doanh nhân CEO 1983', avatarUrl: null, headline: null, companyName: null };
        const [u1, u2] = userId.toLowerCase() < counterpartId.toLowerCase() ? [userId, counterpartId] : [counterpartId, userId];

        let threadId = crypto.randomUUID();
        try {
          const ensuredThread = await this.prisma.$queryRaw<any[]>`
            INSERT INTO public.direct_message_threads (id, user1_id, user2_id, last_message_at, created_at, updated_at)
            VALUES (${threadId}::uuid, ${u1}::uuid, ${u2}::uuid, null, now(), now())
            ON CONFLICT (user1_id, user2_id) DO UPDATE SET updated_at = now()
            RETURNING id
          `.catch(() => []);
          if (ensuredThread && ensuredThread[0]?.id) {
            threadId = ensuredThread[0].id;
          }
        } catch {
          // fallback
        }

        resultThreads.push({
          threadId,
          personId: `u:${counterpartId}`,
          displayName: profile.displayName,
          avatarUrl: profile.avatarUrl,
          headline: profile.headline,
          companyName: profile.companyName,
          isOnline: this.gateway?.isUserOnline(counterpartId) ?? false,
          lastMessageAt: null,
          lastMessagePreview: null,
          lastMessageFromMe: false,
          unreadCount: 0,
          isConnected: true,
        });
      }
    }

    return { ok: true, threads: resultThreads };
  }

  async openMyDmThread(userId: string, counterpartUserId: string) {
    if (!counterpartUserId) throw new BadRequestException('counterpart_user_id_required');
    let cleanId = counterpartUserId;
    if (cleanId.startsWith('u:')) cleanId = cleanId.substring(2);

    const [u1, u2] = userId.toLowerCase() < cleanId.toLowerCase() ? [userId, cleanId] : [cleanId, userId];

    const existing = await this.prisma.$queryRaw<any[]>`
      SELECT id FROM public.direct_message_threads
      WHERE (user1_id = ${u1}::uuid AND user2_id = ${u2}::uuid)
         OR (user1_id = ${u2}::uuid AND user2_id = ${u1}::uuid)
      LIMIT 1
    `.catch(() => []);

    if (existing.length > 0) {
      return { ok: true, threadId: existing[0].id };
    }

    const newId = crypto.randomUUID();
    await this.prisma.$executeRaw`
      INSERT INTO public.direct_message_threads (id, user1_id, user2_id, last_message_at, created_at, updated_at)
      VALUES (${newId}::uuid, ${u1}::uuid, ${u2}::uuid, now(), now(), now())
      ON CONFLICT (user1_id, user2_id) DO NOTHING
    `.catch(() => null);

    return { ok: true, threadId: newId };
  }

  async getMyDmThreadDetail(userId: string, threadId: string) {
    let targetThreadId = threadId;

    let threadRows = await this.prisma.$queryRaw<any[]>`
      SELECT id, user1_id, user2_id, last_message_at, last_message_body
      FROM public.direct_message_threads
      WHERE id = ${targetThreadId}::uuid AND (user1_id = ${userId}::uuid OR user2_id = ${userId}::uuid)
      LIMIT 1
    `.catch(() => []);

    if (threadRows.length === 0) {
      const conn = await this.prisma.$queryRaw<any[]>`
        SELECT requester_user_id, recipient_user_id
        FROM public.user_connections
        WHERE id = ${targetThreadId}::uuid AND (requester_user_id = ${userId}::uuid OR recipient_user_id = ${userId}::uuid)
        LIMIT 1
      `.catch(() => []);

      if (conn.length > 0) {
        const otherId = String(conn[0].requester_user_id).toLowerCase() === userId.toLowerCase()
          ? String(conn[0].recipient_user_id)
          : String(conn[0].requester_user_id);
        const openRes = await this.openMyDmThread(userId, otherId);
        targetThreadId = openRes.threadId;
        threadRows = await this.prisma.$queryRaw<any[]>`
          SELECT id, user1_id, user2_id, last_message_at, last_message_body
          FROM public.direct_message_threads
          WHERE id = ${targetThreadId}::uuid
          LIMIT 1
        `.catch(() => []);
      } else {
        try {
          const openRes = await this.openMyDmThread(userId, targetThreadId);
          targetThreadId = openRes.threadId;
          threadRows = await this.prisma.$queryRaw<any[]>`
            SELECT id, user1_id, user2_id, last_message_at, last_message_body
            FROM public.direct_message_threads
            WHERE id = ${targetThreadId}::uuid
            LIMIT 1
          `.catch(() => []);
        } catch {
          // not found
        }
      }
    }

    if (threadRows.length === 0) {
      return { ok: false, error: 'not_found' };
    }

    const t = threadRows[0];
    const counterpartId = String(t.user1_id).toLowerCase() === userId.toLowerCase()
      ? String(t.user2_id).toLowerCase()
      : String(t.user1_id).toLowerCase();

    const [ident, prof, mem, conn] = await Promise.all([
      this.prisma.$queryRaw<any[]>`SELECT display_name, avatar_url, headline, job_title, company_name FROM public.business_identities WHERE owner_user_id = ${counterpartId}::uuid LIMIT 1`.catch(() => []),
      this.prisma.$queryRaw<any[]>`SELECT display_name, avatar_url, professional_title, company_name FROM public.user_profiles WHERE user_id = ${counterpartId}::uuid LIMIT 1`.catch(() => []),
      this.prisma.$queryRaw<any[]>`SELECT name, avatar, company, position FROM public.members WHERE user_id = ${counterpartId}::uuid LIMIT 1`.catch(() => []),
      this.prisma.$queryRaw<any[]>`
        SELECT id FROM public.user_connections
        WHERE status = 'accepted'::public.global_connection_status
          AND ((requester_user_id = ${userId}::uuid AND recipient_user_id = ${counterpartId}::uuid)
            OR (requester_user_id = ${counterpartId}::uuid AND recipient_user_id = ${userId}::uuid))
        LIMIT 1
      `.catch(() => []),
    ]);

    const threadSummary = {
      threadId: t.id,
      personId: `u:${counterpartId}`,
      displayName: ident[0]?.display_name || prof[0]?.display_name || mem[0]?.name || 'Doanh nhân CEO 1983',
      avatarUrl: ident[0]?.avatar_url || prof[0]?.avatar_url || mem[0]?.avatar || null,
      headline: ident[0]?.headline || ident[0]?.job_title || prof[0]?.professional_title || mem[0]?.position || null,
      companyName: ident[0]?.company_name || prof[0]?.company_name || mem[0]?.company || null,
      isOnline: this.gateway?.isUserOnline(counterpartId) ?? false,
      lastMessageAt: t.last_message_at ? new Date(t.last_message_at).toISOString() : null,
      lastMessagePreview: t.last_message_body || null,
      lastMessageFromMe: false,
      unreadCount: 0,
      isConnected: (conn && conn.length > 0),
    };

    await this.prisma.$executeRaw`
      UPDATE public.direct_messages
      SET read_at = now()
      WHERE thread_id = ${t.id}::uuid AND sender_user_id != ${userId}::uuid AND read_at IS NULL
    `.catch(() => null);

    const msgRows = await this.prisma.$queryRaw<any[]>`
      SELECT id, thread_id, sender_user_id, body, client_token, reply_to, reactions, is_retracted, read_at, created_at, updated_at
      FROM public.direct_messages
      WHERE thread_id = ${t.id}::uuid
      ORDER BY created_at ASC
      LIMIT 100
    `.catch(() => []);

    const messages = msgRows.map(m => ({
      id: m.id,
      threadId: m.thread_id,
      fromMe: String(m.sender_user_id).toLowerCase() === userId.toLowerCase(),
      body: m.is_retracted ? 'Tin nhắn đã được thu hồi' : m.body,
      reactions: Array.isArray(m.reactions) ? m.reactions : [],
      replyTo: m.reply_to || null,
      createdAt: m.created_at ? new Date(m.created_at).toISOString() : new Date().toISOString(),
      readAt: m.read_at ? new Date(m.read_at).toISOString() : null,
      retractedAt: m.is_retracted ? new Date(m.updated_at).toISOString() : null,
    }));

    return { ok: true, thread: threadSummary, messages };
  }

  async sendMyDmMessage(userId: string, threadId: string, data: { body: string; clientToken?: string; replyTo?: any }) {
    if (!data?.body?.trim()) throw new BadRequestException('empty_message');

    let threadRows = await this.prisma.$queryRaw<any[]>`
      SELECT id, user1_id, user2_id FROM public.direct_message_threads
      WHERE id = ${threadId}::uuid AND (user1_id = ${userId}::uuid OR user2_id = ${userId}::uuid)
      LIMIT 1
    `.catch(() => []);

    if (threadRows.length === 0) {
      throw new NotFoundException('thread_not_found');
    }

    const t = threadRows[0];
    const counterpartId = String(t.user1_id).toLowerCase() === userId.toLowerCase()
      ? String(t.user2_id).toLowerCase()
      : String(t.user1_id).toLowerCase();

    const newMsgId = crypto.randomUUID();
    const replyJson = data.replyTo ? JSON.stringify(data.replyTo) : null;

    await this.prisma.$executeRaw`
      INSERT INTO public.direct_messages (id, thread_id, sender_user_id, body, client_token, reply_to, created_at, updated_at)
      VALUES (
        ${newMsgId}::uuid, 
        ${t.id}::uuid, 
        ${userId}::uuid, 
        ${data.body}, 
        ${data.clientToken || null}, 
        ${replyJson}::jsonb, 
        now(), 
        now()
      )
    `;

    await this.prisma.$executeRaw`
      UPDATE public.direct_message_threads
      SET last_message_at = now(), last_message_body = ${data.body.slice(0, 150)}, updated_at = now()
      WHERE id = ${t.id}::uuid
    `;

    const messageObj = {
      id: newMsgId,
      threadId: t.id,
      fromMe: true,
      body: data.body,
      reactions: [],
      replyTo: data.replyTo || null,
      createdAt: new Date().toISOString(),
      readAt: null,
      retractedAt: null,
    };

    if (this.gateway) {
      this.gateway.emitDmMessageReceived(t.id, counterpartId, { ...messageObj, fromMe: false }, {
        threadId: t.id,
        lastMessagePreview: data.body.slice(0, 150),
        lastMessageAt: new Date().toISOString(),
      });
    }

    return { ok: true, message: messageObj };
  }

  async markMyDmThreadRead(userId: string, threadId: string) {
    const res = await this.prisma.$executeRaw`
      UPDATE public.direct_messages
      SET read_at = now()
      WHERE thread_id = ${threadId}::uuid AND sender_user_id != ${userId}::uuid AND read_at IS NULL
    `.catch(() => 0);

    if (this.gateway) {
      this.gateway.emitDmReadReceipt(threadId, userId);
    }
    return { ok: true, updated: Number(res || 0) };
  }

  async retractMyDmMessage(userId: string, messageId: string) {
    const msgRows = await this.prisma.$queryRaw<any[]>`
      SELECT id, thread_id, sender_user_id FROM public.direct_messages WHERE id = ${messageId}::uuid LIMIT 1
    `.catch(() => []);

    if (msgRows.length === 0) throw new NotFoundException('message_not_found');
    if (String(msgRows[0].sender_user_id).toLowerCase() !== userId.toLowerCase()) {
      throw new ForbiddenException('cannot_retract_other_message');
    }

    await this.prisma.$executeRaw`
      UPDATE public.direct_messages
      SET is_retracted = true, updated_at = now()
      WHERE id = ${messageId}::uuid
    `;

    if (this.gateway) {
      this.gateway.emitDmMessageRetracted(msgRows[0].thread_id, messageId);
    }
    return { ok: true };
  }

  async reactToDmMessage(userId: string, messageId: string, emoji: string) {
    const msgRows = await this.prisma.$queryRaw<any[]>`
      SELECT id, thread_id, reactions FROM public.direct_messages WHERE id = ${messageId}::uuid LIMIT 1
    `.catch(() => []);

    if (msgRows.length === 0) throw new NotFoundException('message_not_found');

    let reactions = Array.isArray(msgRows[0].reactions) ? msgRows[0].reactions : [];
    const existingIdx = reactions.findIndex((r: any) => r.userId === userId && r.emoji === emoji);
    if (existingIdx !== -1) {
      reactions.splice(existingIdx, 1);
    } else {
      reactions = reactions.filter((r: any) => r.userId !== userId);
      reactions.push({
        userId,
        emoji,
        createdAt: new Date().toISOString(),
      });
    }

    const reactionsJson = JSON.stringify(reactions);
    await this.prisma.$executeRaw`
      UPDATE public.direct_messages
      SET reactions = ${reactionsJson}::jsonb, updated_at = now()
      WHERE id = ${messageId}::uuid
    `;

    if (this.gateway) {
      this.gateway.emitDmReaction(msgRows[0].thread_id, messageId, reactions);
    }
    return { ok: true, messageId, reactions };
  }

  // ── Mentionable Users & Tagging in Moments ──────────────────────────
  async searchMentionableUsers(userId: string, query: string) {
    const connRows = await this.prisma.$queryRaw<any[]>`
      SELECT requester_user_id, recipient_user_id
      FROM public.user_connections
      WHERE status = 'accepted'::public.global_connection_status 
        AND (requester_user_id = ${userId}::uuid OR recipient_user_id = ${userId}::uuid)
      LIMIT 200
    `.catch(() => []);

    const friendUserIds = new Set<string>();
    for (const c of connRows) {
      const friendId = String(c.requester_user_id).toLowerCase() === userId.toLowerCase()
        ? String(c.recipient_user_id).toLowerCase()
        : String(c.requester_user_id).toLowerCase();
      friendUserIds.add(friendId);
    }

    const allTargetIds = Array.from(friendUserIds);
    if (allTargetIds.length === 0) return [];

    let identities: any[] = [];
    if (allTargetIds.length > 0) {
      identities = await this.prisma.$queryRaw<any[]>`
        SELECT bi.owner_user_id as user_id, bi.display_name, bi.avatar_url, bi.headline, bi.job_title, bi.company_name
        FROM public.business_identities bi
        WHERE bi.owner_user_id = ANY(${allTargetIds}::uuid[])
      `.catch(() => []);
    }

    const foundUserIds = new Set(identities.map(i => String(i.user_id).toLowerCase()));
    const missingIds = allTargetIds.filter(id => !foundUserIds.has(id));

    if (missingIds.length > 0) {
      const [profiles, members] = await Promise.all([
        this.prisma.$queryRaw<any[]>`
          SELECT user_id, display_name, avatar_url, professional_title as headline, company_name
          FROM public.user_profiles
          WHERE user_id = ANY(${missingIds}::uuid[])
        `.catch(() => []),
        this.prisma.$queryRaw<any[]>`
          SELECT user_id, name as display_name, avatar as avatar_url, position as headline, company as company_name
          FROM public.members
          WHERE user_id = ANY(${missingIds}::uuid[])
        `.catch(() => []),
      ]);
      identities = [...identities, ...profiles, ...members];
    }

    const normalize = (str: string) =>
      (str || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D')
        .toLowerCase()
        .trim();

    let results = identities.map(i => ({
      userId: String(i.user_id),
      displayName: i.display_name || 'Hội viên CEO 1983',
      avatarUrl: i.avatar_url || null,
      headline: i.headline || i.job_title || null,
      companyName: i.company_name || null,
      initials: (i.display_name || 'HV')
        .split(' ')
        .filter(Boolean)
        .map((w: string) => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase(),
    }));

    if (query && query.trim()) {
      const qNorm = normalize(query);
      results = results.filter(r => 
        normalize(r.displayName).includes(qNorm) || 
        (r.companyName && normalize(r.companyName).includes(qNorm)) ||
        (r.headline && normalize(r.headline).includes(qNorm))
      );
    }

    return results.slice(0, 50);
  }

}
