import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AiService {
  constructor(private prisma: PrismaService) {}

  /** Lấy roles của user (user_roles + memberships) để phân quyền AI */
  async getUserRoles(userId: string): Promise<{
    globalRoles: string[];
    associationId: string | null;
    membershipRoles: string[];
  }> {
    const [globalRows, memberRows] = await Promise.all([
      this.prisma.$queryRaw<{ role: string }[]>`
        SELECT role FROM public.user_roles WHERE user_id = ${userId}::uuid
      `.catch(() => [] as { role: string }[]),
      this.prisma.$queryRaw<{ role: string; association_id: string }[]>`
        SELECT role, association_id::text FROM public.memberships
        WHERE user_id = ${userId}::uuid
        ORDER BY created_at DESC
        LIMIT 10
      `.catch(() => [] as { role: string; association_id: string }[]),
    ]);

    const associationId = memberRows[0]?.association_id ?? null;

    return {
      globalRoles: globalRows.map((r) => r.role),
      associationId,
      membershipRoles: memberRows.map((r) => r.role),
    };
  }

  /** Đọc config AI provider từ app_settings */
  async getAiProviderSetting(): Promise<{ mode: string | null }> {
    const rows = await this.prisma.$queryRaw<{ value: unknown }[]>`
      SELECT value FROM public.app_settings WHERE key = 'ai_provider' LIMIT 1
    `.catch(() => [] as { value: unknown }[]);
    const val = rows[0]?.value as { mode?: string } | null;
    return { mode: val?.mode ?? null };
  }

  /** Ghi audit log cho AI request (chỉ metadata, không ghi prompt/answer) */
  async insertAiAudit(payload: {
    requestId: string;
    userId: string;
    associationId: string | null;
    capability: string;
    permissionLevel: string;
    provider: string;
    model: string | null;
    usedFallback: boolean;
    fallbackReason: string | null;
    providerLatencyMs: number;
    totalLatencyMs: number;
    sourceTypes: string[];
    sourceCount: number;
  }): Promise<void> {
    await this.prisma.$executeRaw`
      INSERT INTO public.ai_request_audit (
        request_id, user_id, association_id, capability, permission_level,
        provider, model, used_fallback, fallback_reason,
        provider_latency_ms, total_latency_ms, source_types, source_count
      ) VALUES (
        ${payload.requestId}, ${payload.userId}::uuid,
        ${payload.associationId ? `${payload.associationId}::uuid` : null},
        ${payload.capability}, ${payload.permissionLevel},
        ${payload.provider}, ${payload.model}, ${payload.usedFallback},
        ${payload.fallbackReason}, ${payload.providerLatencyMs},
        ${payload.totalLatencyMs}, ${JSON.stringify(payload.sourceTypes)}::jsonb,
        ${payload.sourceCount}
      )
    `.catch((e: Error) => {
      // Bảng có thể chưa tồn tại trong mọi môi trường — không làm hỏng request
      console.error('[AiService] ai_request_audit insert failed:', e.message);
    });
  }

  /** Ghi activity log đơn giản */
  async logActivity(payload: {
    userId: string;
    action: string;
    target: string;
    category: string;
  }): Promise<void> {
    const code = `ai-${Date.now()}`;
    await this.prisma.$executeRaw`
      INSERT INTO public.activity_log (id, action, target, category, code, "user", ip, at)
      VALUES (
        gen_random_uuid(), ${payload.action}, ${payload.target},
        ${payload.category}, ${code}, ${payload.userId}, '', now()
      )
    `.catch((e: Error) => {
      console.error('[AiService] activity_log insert failed:', e.message);
    });
  }

  /** Lấy danh sách activity log */
  async listActivityLog(): Promise<any[]> {
    return this.prisma.$queryRaw<any[]>`
      SELECT id, action, target, category, code, "user", ip, at
      FROM public.activity_log
      ORDER BY at DESC
      LIMIT 200
    `.catch(() => [] as any[]);
  }

  /** Xóa một activity log theo code */
  async deleteActivityLog(code: string): Promise<void> {
    await this.prisma.$executeRaw`
      DELETE FROM public.activity_log WHERE code = ${code}
    `.catch((e: Error) => {
      console.error('[AiService] activity_log delete failed:', e.message);
    });
  }

  /** Xóa toàn bộ activity log */
  async clearActivityLog(): Promise<void> {
    await this.prisma.$executeRaw`
      DELETE FROM public.activity_log WHERE code != ''
    `.catch((e: Error) => {
      console.error('[AiService] activity_log clear failed:', e.message);
    });
  }

  /**
   * Lấy toàn bộ ngữ cảnh động của hội viên tại phiên đăng nhập:
   * - Hồ sơ định danh (Tên, mã hội viên, doanh nghiệp, chức vụ, ban bệ)
   * - Hội phí & Hóa đơn (Chưa đóng, đã đóng, số tiền nợ, hạn nộp)
   * - Thông báo chưa đọc (Số lượng & nội dung mới nhất)
   * - Sự kiện của tôi (Danh sách sự kiện đã đăng ký vé)
   * - Top sự kiện nhiều người đăng ký nhất trong Hiệp hội
   */
  async getLiveMemberAssistantContext(userId: string) {
    const [userRows, memberRows] = await Promise.all([
      this.prisma.$queryRaw<any[]>`
        SELECT id, name, email, phone FROM public.vione_users WHERE id::text = ${userId}::text LIMIT 1
      `.catch(() => [] as any[]),
      this.prisma.$queryRaw<any[]>`
        SELECT id, code, name, full_name, email, contact, company, position, title, level, membership_tier, department, status, dues_status, joined_at
        FROM public.members
        WHERE user_id::text = ${userId}::text OR id::text = ${userId}::text OR email IN (SELECT email FROM public.vione_users WHERE id::text = ${userId}::text)
        LIMIT 1
      `.catch(() => [] as any[]),
    ]);

    const member = memberRows[0] || null;
    const user = userRows[0] || null;
    const memberCode = member?.code || null;
    const memberId = member?.id || null;
    const userEmail = member?.email || user?.email || '';

    // 2. Invoices & Unpaid Dues
    let unpaidInvoices: any[] = [];
    let totalOutstanding = 0;
    let feeYear: number | null = null;
    let feePaid = true;

    if (memberId) {
      const invRows = await this.prisma.$queryRaw<any[]>`
        SELECT id, invoice_no, year, amount, status, due_date, paid_at
        FROM public.invoices
        WHERE member_id::text = ${memberId}::text
        ORDER BY year DESC, due_date ASC
        LIMIT 20
      `.catch(() => [] as any[]);

      const pending = invRows.filter((i) => i.status !== 'paid');
      if (pending.length > 0) {
        feePaid = false;
        totalOutstanding = pending.reduce((sum, item) => sum + Number(item.amount || 0), 0);
        feeYear = pending[0].year ? Number(pending[0].year) : new Date().getFullYear();
        unpaidInvoices = pending.map((i) => ({
          invoiceNo: i.invoice_no,
          year: i.year ? Number(i.year) : null,
          amount: Number(i.amount || 0),
          dueDate: i.due_date ? new Date(i.due_date).toISOString().slice(0, 10) : null,
          status: i.status,
        }));
      }
    }

    // 3. Unread Notifications
    let unreadNotifications: any[] = [];
    let unreadCount = 0;
    const recipientIds: string[] = [userId];
    if (memberId) recipientIds.push(String(memberId));
    if (memberCode) recipientIds.push(String(memberCode));

    const notifRows = await this.prisma.$queryRaw<any[]>`
      SELECT id, title, body, created_at, read
      FROM public.member_notifications
      WHERE recipient_id = ANY(${recipientIds}::text[])
        AND read = false
        AND (dismissed = false OR dismissed IS NULL)
      ORDER BY created_at DESC
      LIMIT 10
    `.catch(() => [] as any[]);

    unreadCount = notifRows.length;
    unreadNotifications = notifRows.map((n) => ({
      id: n.id,
      title: n.title,
      body: n.body,
      createdAt: n.created_at,
    }));

    // 4. My Registered Events
    let myRegisteredEvents: any[] = [];
    if (memberCode || userEmail) {
      const myRegRows = await this.prisma.$queryRaw<any[]>`
        SELECT r.id as registration_id, r.ticket_count, r.lucky_number, r.status as reg_status,
               e.id as event_id, e.name as event_name, e.date, e.time, e.location
        FROM public.event_registrations r
        JOIN public.events e ON e.id = r.event_id
        WHERE (r.member_code = ${memberCode} OR (LOWER(TRIM(r.email)) = LOWER(TRIM(${userEmail})) AND ${userEmail} != ''))
          AND r.status != 'cancelled'
        ORDER BY e.date ASC
        LIMIT 10
      `.catch(() => [] as any[]);

      myRegisteredEvents = myRegRows.map((r) => ({
        registrationId: r.registration_id,
        eventId: r.event_id,
        name: r.event_name,
        date: r.date ? (r.date instanceof Date ? r.date.toISOString().slice(0, 10) : String(r.date).slice(0, 10)) : 'Sắp diễn ra',
        time: r.time || '08:30',
        location: r.location || 'Hà Nội',
        ticketCount: r.ticket_count || 1,
        luckyNumber: r.lucky_number,
      }));
    }

    // 5. Top Registered Events in Association
    const topEventsRows = await this.prisma.$queryRaw<any[]>`
      SELECT e.id, e.name, e.date, e.time, e.location, e.capacity,
             COALESCE(e.registered, COUNT(r.id)) as registration_count
      FROM public.events e
      LEFT JOIN public.event_registrations r ON r.event_id = e.id AND r.status != 'cancelled'
      GROUP BY e.id, e.name, e.date, e.time, e.location, e.capacity, e.registered
      ORDER BY registration_count DESC, e.date ASC
      LIMIT 5
    `.catch(() => [] as any[]);

    const topEvents = topEventsRows.map((e) => ({
      id: e.id,
      name: e.name,
      date: e.date ? (e.date instanceof Date ? e.date.toISOString().slice(0, 10) : String(e.date).slice(0, 10)) : 'Sắp diễn ra',
      location: e.location || 'Hà Nội',
      registeredCount: Number(e.registration_count || 0),
      capacity: Number(e.capacity || 200),
    }));

    return {
      user: {
        id: userId,
        name: member?.name || member?.full_name || user?.name || 'Hội viên CEO 1983',
        code: memberCode || 'M1983-MEMBER',
        company: member?.company || 'Doanh nghiệp Hội viên',
        title: member?.position || member?.title || 'Lãnh đạo Doanh nghiệp',
        level: member?.level || member?.membership_tier || 'VIP Gold',
        department: member?.department || 'Ban Hội viên',
        email: userEmail,
      },
      dues: {
        feePaid,
        feeYear,
        totalOutstanding,
        unpaidInvoices,
      },
      notifications: {
        unreadCount,
        unreadList: unreadNotifications,
      },
      myEvents: myRegisteredEvents,
      topEvents,
    };
  }

  /**
   * Nhận diện Lệnh Điều khiển Giọng nói Tự động (Voice Auto-Navigation Intent):
   * Tự động nhận diện ý định điều hướng của người dùng khi ra lệnh bằng giọng nói hoặc text.
   */
  classifyVoiceNavigation(prompt: string): {
    route: string;
    featureName: string;
    tourId: string;
  } | null {
    const q = (prompt || '').toLowerCase().trim();

    // 1. Danh bạ & Hội viên
    if (
      q.includes('danh bạ') || q.includes('danh ba') ||
      (q.includes('hội viên') && (q.includes('mở') || q.includes('tìm') || q.includes('danh sách') || q.includes('vào'))) ||
      (q.includes('ceo') && (q.includes('mở') || q.includes('tìm') || q.includes('danh sách'))) ||
      q.includes('hẹn gặp') || q.includes('1-on-1') || q.includes('1-1')
    ) {
      return { route: '/association/members', featureName: 'Danh Bạ 200+ CEO & Hẹn 1-on-1', tourId: 'association-members' };
    }

    // 2. Sự kiện & Hội nghị
    if (
      q.includes('lịch sự kiện') || q.includes('sự kiện') || q.includes('hội nghị') ||
      q.includes('gala') || q.includes('đăng ký vé') || q.includes('mua vé')
    ) {
      return { route: '/association/events', featureName: 'Lịch Sự Kiện & Đăng Ký Vé', tourId: 'association-events' };
    }

    // 3. Vé Check-in QR & Soát vé
    if (
      q.includes('checkin') || q.includes('check in') || q.includes('vé của tôi') ||
      q.includes('mã qr vé') || q.includes('bàn vip') || q.includes('soát vé')
    ) {
      return { route: '/association/checkin', featureName: 'Vé Check-in QR & Sơ Đồ Bàn VIP', tourId: 'association-checkin' };
    }

    // 4. Danh thiếp số & NFC
    if (
      q.includes('danh thiếp') || q.includes('card visit') || q.includes('thẻ nfc') ||
      q.includes('ghi thẻ') || q.includes('quét card') || q.includes('thẻ hội viên')
    ) {
      return { route: '/association/card', featureName: 'Thẻ Hội Viên & Danh Thiếp Số NFC', tourId: 'association-card' };
    }

    // 5. Chợ B2B & Sản phẩm
    if (
      q.includes('chợ b2b') || q.includes('marketplace') || q.includes('gian hàng') ||
      (q.includes('sản phẩm') && (q.includes('mở') || q.includes('vào') || q.includes('xem') || q.includes('đăng'))) ||
      q.includes('đăng bán')
    ) {
      return { route: '/association/products', featureName: 'Chợ Giao Thương B2B & Gian Hàng Số', tourId: 'association-products' };
    }

    // 6. Cơ hội kinh doanh & Giao thương
    if (
      q.includes('cơ hội') || q.includes('giao thương') || q.includes('hợp tác') ||
      q.includes('chào mua') || q.includes('chào bán') || q.includes('matching')
    ) {
      return { route: '/association/opportunities', featureName: 'Sàn Cơ Hội Kinh Doanh B2B', tourId: 'association-opportunities' };
    }

    // 7. Hộp thư tin nhắn B2B
    if (
      q.includes('tin nhắn') || q.includes('hộp thư') || q.includes('chat') ||
      q.includes('cuộc trò chuyện') || q.includes('nhắn tin')
    ) {
      return { route: '/association/messages', featureName: 'Hộp Thư Giao Thương B2B', tourId: 'association-messages' };
    }

    // 8. Biểu quyết & Lucky Draw
    if (
      q.includes('biểu quyết') || q.includes('bầu cử') || q.includes('bỏ phiếu') ||
      q.includes('lucky draw') || q.includes('quay số')
    ) {
      return { route: '/association/voting', featureName: 'Biểu Quyết Đại Hội & Lucky Draw', tourId: 'association-voting' };
    }

    // 9. Hồ sơ cá nhân & Đóng hội phí VietQR
    if (
      q.includes('hội phí') || q.includes('đóng phí') || q.includes('hồ sơ cá nhân') ||
      q.includes('hồ sơ của tôi') || q.includes('profile') || q.includes('vietqr')
    ) {
      return { route: '/association/profile', featureName: 'Hồ Sơ Cá Nhân & Đóng Hội Phí VietQR', tourId: 'association-profile' };
    }

    // 10. Thông báo & Nhắc việc
    if (q.includes('thông báo') || q.includes('nhắc việc') || q.includes('tin mới')) {
      return { route: '/association/notifications', featureName: 'Trung Tâm Thông Báo & Nhắc Việc', tourId: 'association-notifications' };
    }

    // 11. Kho văn bản & Điều lệ
    if (
      q.includes('văn bản') || q.includes('tài liệu') || q.includes('điều lệ') ||
      q.includes('quy chế') || q.includes('kỷ yếu') || q.includes('nghị quyết')
    ) {
      return { route: '/association/library', featureName: 'Kho Văn Bản, Điều Lệ & Kỷ Yếu', tourId: 'association-library' };
    }

    // 12. Trang chủ
    if (q.includes('trang chủ') || q.includes('dashboard') || q.includes('bàn làm việc') || q === 'về nhà') {
      return { route: '/association', featureName: 'Trang Chủ Điều Hành CEO 1983', tourId: 'association-home' };
    }

    // 13. Quản trị CRM & Phân quyền
    if (q.includes('phân quyền') || q.includes('quản trị crm') || q.includes('quản trị hệ thống') || q.includes('rbac')) {
      return { route: '/permissions', featureName: 'Quản Trị Phân Quyền CRM', tourId: 'permissions-admin' };
    }

    return null;
  }

  /**
   * Tra cứu tri thức & Dữ liệu động toàn diện trên hệ thống CEO 1983:
   * Tìm kiếm song song: Danh bạ hội viên & Lãnh đạo, Sản phẩm Marketplace, Cơ hội giao thương B2B,
   * Lịch sự kiện & Đại hội, Kho văn bản & Kỷ yếu, Cơ cấu 7 Ban chuyên trách, Chính sách hội phí & MB Bank.
   */
  async searchAssociationData(rawPrompt: string, userId: string) {
    const q = (rawPrompt || '').toLowerCase().trim();
    if (!q) return null;

    const stopWords = new Set([
      'hãy', 'tìm', 'cho', 'tôi', 'xem', 'ai', 'là', 'gì', 'ở', 'đâu',
      'như', 'thế', 'nào', 'làm', 'sao', 'các', 'những', 'của', 'trong',
      'về', 'giúp', 'em', 'anh', 'chị', 'ơi', 'với', 'được', 'không',
      'có', 'này', 'đó', 'kia', 'thì', 'và', 'hoặc', 'liệu'
    ]);
    const words = q.split(/[\s,?.!;:()\[\]{}"'-]+/).filter((w) => w.length >= 2 && !stopWords.has(w));
    const searchPattern = words.length > 0 ? `%${words.slice(0, 4).join('%')}%` : '%';

    const COMMITTEES_INFO = [
      {
        id: 'ban-thanh-vien',
        name: 'Ban Thành viên',
        leadership: 'Nguyễn Văn Cường (Trưởng ban)',
        scope: 'Phát triển hội viên mới, tiếp nhận hồ sơ gia nhập, thẩm định tư cách và cấp mã định danh M1983.',
        contact: 'Hotline Ban Thành viên: 0983 198 301',
        route: '/association/members',
        keywords: ['thành viên', 'hội viên', 'kết nạp', 'gia nhập', 'hồ sơ', 'mã hội viên', 'cường'],
      },
      {
        id: 'ban-xuc-tien',
        name: 'Ban Xúc tiến thương mại',
        leadership: 'Hoàng Minh Tuấn (Trưởng ban)',
        scope: 'Khởi tạo cơ hội giao thương B2B, quản lý gian hàng Chợ Marketplace, điều phối kết nối 1-on-1 và hợp đồng hợp tác nội khối.',
        contact: 'Hotline Ban Xúc tiến: 0983 198 302',
        route: '/association/products',
        keywords: ['xúc tiến', 'thương mại', 'giao thương', 'b2b', 'sản phẩm', 'chợ', 'gian hàng', 'tuấn', 'hợp tác'],
      },
      {
        id: 'ban-thien-nguyen',
        name: 'Ban Thiện nguyện',
        leadership: 'Vũ Thu Trang (Trưởng ban)',
        scope: 'Tổ chức các chương trình thiện nguyện, quản lý Quỹ Tấm lòng vàng CEO 1983 và các hoạt động an sinh xã hội.',
        contact: 'Hotline Ban Thiện nguyện: 0983 198 303',
        route: '/association',
        keywords: ['thiện nguyện', 'từ thiện', 'an sinh', 'tấm lòng vàng', 'ủng hộ', 'trang'],
      },
      {
        id: 'ban-truyen-thong',
        name: 'Ban Truyền thông',
        leadership: 'Phạm Quang Huy (Trưởng ban)',
        scope: 'Quản trị Cổng tin tức, thương hiệu CEO 1983, truyền thông sự kiện, thông báo đẩy và hệ thống soát vé máy quét camera.',
        contact: 'Hotline Ban Truyền thông: 0983 198 304',
        route: '/association/events',
        keywords: ['truyền thông', 'báo chí', 'hình ảnh', 'tin tức', 'thương hiệu', 'soát vé', 'huy'],
      },
      {
        id: 'ban-quan-tri',
        name: 'Ban Quản trị',
        leadership: 'Trần Quốc Toản (Trưởng ban)',
        scope: 'Điều hành nền tảng công nghệ CRM, giám sát ma trận phân quyền RBAC và kiểm toán hoạt động hiệp hội.',
        contact: 'Hotline Ban Quản trị: 0983 198 305',
        route: '/permissions',
        keywords: ['quản trị', 'hệ thống', 'phân quyền', 'rbac', 'admin', 'bảo mật', 'toản'],
      },
      {
        id: 'ban-tai-chinh',
        name: 'Ban Tài chính',
        leadership: 'Đặng Thị Lan (Trưởng ban)',
        scope: 'Quản lý thu chi ngân sách, đối soát hội phí thường niên qua VietQR MB Bank, quyết toán tài chính định kỳ.',
        contact: 'Hotline Ban Tài chính: 0983 198 306',
        route: '/association/profile',
        keywords: ['tài chính', 'ngân sách', 'hội phí', 'thu chi', 'kế toán', 'quyết toán', 'lan'],
      },
      {
        id: 'ban-thu-ky',
        name: 'Ban Thư ký',
        leadership: 'Lê Hoàng Nam (Tổng thư ký)',
        scope: 'Điều phối các kỳ họp BCH, Đại hội thường niên, ban hành nghị quyết, quản lý kho văn bản và kỷ yếu điện tử.',
        contact: 'Hotline Ban Thư ký: 0983 198 307',
        route: '/association/library',
        keywords: ['thư ký', 'tổng thư ký', 'nghị quyết', 'biên bản', 'họp', 'kỷ yếu', 'văn bản', 'nam'],
      },
    ];

    const matchedCommittees = COMMITTEES_INFO.filter((c) =>
      c.keywords.some((kw) => q.includes(kw)) || q.includes(c.name.toLowerCase()) || q.includes(c.leadership.toLowerCase())
    );

    const isFeeQuery =
      q.includes('hội phí') || q.includes('niên liễm') || q.includes('đóng phí') ||
      q.includes('số tài khoản') || q.includes('ngân hàng') || q.includes('stk') ||
      q.includes('mb bank') || q.includes('vietqr');

    const feePolicy = {
      bankName: 'Ngân hàng Quân Đội (MB Bank)',
      accountNo: '1983000000',
      accountName: 'CLB DOANH NHAN CEO 1983',
      standardTier: '10.000.000 VNĐ / năm (Hội viên Chính thức)',
      goldTier: '20.000.000 VNĐ / năm (Hội viên VIP Gold)',
      diamondTier: '50.000.000 VNĐ / năm (Hội viên Kim cương)',
      syntax: '[Mã Hội Viên] HP2026 hoặc [Họ Tên] HP2026',
      route: '/association/profile',
    };

    const [members, products, opportunities, events, documents] = await Promise.all([
      words.length > 0
        ? this.prisma.$queryRaw<any[]>`
            SELECT id, code, name, full_name, company, position, title, level, department, contact, email
            FROM public.members
            WHERE name ILIKE ${searchPattern}
               OR full_name ILIKE ${searchPattern}
               OR company ILIKE ${searchPattern}
               OR department ILIKE ${searchPattern}
               OR position ILIKE ${searchPattern}
               OR title ILIKE ${searchPattern}
            LIMIT 5
          `.catch(() => [] as any[])
        : Promise.resolve([]),

      words.length > 0
        ? this.prisma.$queryRaw<any[]>`
            SELECT id, name, title, description, price, category, company
            FROM public.products
            WHERE name ILIKE ${searchPattern}
               OR title ILIKE ${searchPattern}
               OR description ILIKE ${searchPattern}
               OR category ILIKE ${searchPattern}
               OR company ILIKE ${searchPattern}
            LIMIT 5
          `.catch(() => [] as any[])
        : Promise.resolve([]),

      words.length > 0
        ? this.prisma.$queryRaw<any[]>`
            SELECT id, title, description, type, category, target_industry, valuation, poster_name, poster_company
            FROM public.opportunities
            WHERE title ILIKE ${searchPattern}
               OR description ILIKE ${searchPattern}
               OR category ILIKE ${searchPattern}
               OR target_industry ILIKE ${searchPattern}
            LIMIT 5
          `.catch(() => [] as any[])
        : Promise.resolve([]),

      this.prisma.$queryRaw<any[]>`
        SELECT id, name, date, time, location, capacity, registered
        FROM public.events
        WHERE (${words.length === 0} OR name ILIKE ${searchPattern} OR location ILIKE ${searchPattern})
        ORDER BY date DESC
        LIMIT 5
      `.catch(() => [] as any[]),

      words.length > 0
        ? this.prisma.$queryRaw<any[]>`
            SELECT id, code, name, category, file_path, publish_date
            FROM public.documents
            WHERE name ILIKE ${searchPattern}
               OR code ILIKE ${searchPattern}
               OR category ILIKE ${searchPattern}
            LIMIT 5
          `.catch(() => [] as any[])
        : Promise.resolve([]),
    ]);

    return {
      keywords: words,
      matchedCommittees,
      isFeeQuery,
      feePolicy,
      members: members || [],
      products: products || [],
      opportunities: opportunities || [],
      events: events || [],
      documents: documents || [],
    };
  }

  /**
   * Hỏi đáp Trợ lý AI Thông Minh:
   * Kết hợp Google Gemini 2.0 Flash Free Tier + Dynamic PostgreSQL Knowledge & RAG Engine
   */
  async askAssistant(userId: string, prompt: string, clientContext?: any): Promise<{
    answer: string;
    speechText: string;
    intent: 'chat' | 'query_data' | 'start_tour' | 'feature_guide';
    tourId?: string;
    route?: string;
    featureName?: string;
    suggestTour?: boolean;
    dynamicData?: any;
    provider: string;
    model: string;
  }> {
    const context = await this.getLiveMemberAssistantContext(userId);
    const rawPrompt = (prompt || '').trim();
    const q = rawPrompt.toLowerCase();

    // 0. Xử lý phản hồi khẳng định ("Có", "Đồng ý", "OK", "Hướng dẫn đi", "Bắt đầu")
    // khi người dùng đồng ý hướng dẫn thao tác trực tiếp:
    const isAffirmative =
      q === 'có' ||
      q === 'co' ||
      q === 'có chứ' ||
      q === 'co chu' ||
      q === 'ok' ||
      q === 'yes' ||
      q === 'y' ||
      q.includes('đồng ý') ||
      q.includes('dong y') ||
      q.includes('hướng dẫn đi') ||
      q.includes('dẫn đường đi') ||
      q.includes('chỉ đi') ||
      q.includes('bắt đầu đi') ||
      q.includes('bắt đầu ngay') ||
      q.includes('thao tác trực tiếp');

    if (isAffirmative && (clientContext?.pendingTourId || clientContext?.lastTourId)) {
      const tourId = clientContext.pendingTourId || clientContext.lastTourId;
      const route = clientContext.pendingRoute || clientContext.lastRoute || '/association';
      const featureName = clientContext.featureName || 'chức năng';

      return {
        answer: `🚀 **Đang kích hoạt Dẫn đường Trực tiếp GPS:**\n\nTôi đang chuyển màn hình và khởi động vòng sáng chỉ dẫn từng thao tác cho Quý Anh/Chị đối với **${featureName}**. Vui lòng quan sát màn hình và thực hiện theo từng điểm chạm nhé!`,
        speechText: `Vâng! Tôi sẽ dẫn đường trực tiếp cho Quý anh chị đối với chức năng ${featureName} ngay bây giờ. Hãy quan sát màn hình và làm theo giọng nói nhé!`,
        intent: 'start_tour',
        tourId,
        route,
        featureName,
        suggestTour: false,
        provider: 'ceo1983-smart-engine',
        model: 'gps-tour-router',
      };
    }

    // 0.5. Lệnh điều khiển giọng nói trực tiếp (Voice Auto-Navigation Intent)
    const voiceNav = this.classifyVoiceNavigation(rawPrompt);
    const isExplicitNav =
      q.startsWith('mở') ||
      q.startsWith('vào') ||
      q.startsWith('chuyển sang') ||
      q.startsWith('đi đến') ||
      q.startsWith('bật') ||
      q.includes('mở danh bạ') ||
      q.includes('vào sự kiện') ||
      q.includes('xem danh bạ') ||
      q.includes('mở chợ') ||
      q.includes('vào chợ') ||
      q.includes('mở cơ hội') ||
      q.includes('về trang chủ') ||
      q.includes('đóng hội phí');

    if (voiceNav && isExplicitNav) {
      return {
        answer: `🚀 **Đang mở ${voiceNav.featureName}...**\n\nHệ thống sẽ tự động điều hướng màn hình cho Quý Anh/Chị ngay bây giờ.`,
        speechText: `Đang mở ${voiceNav.featureName} cho Quý anh chị ngay bây giờ ạ.`,
        intent: 'start_tour',
        tourId: voiceNav.tourId,
        route: voiceNav.route,
        featureName: voiceNav.featureName,
        suggestTour: false,
        provider: 'ceo1983-smart-engine',
        model: 'voice-auto-nav',
      };
    }

    // Tra cứu dữ liệu động thời gian thực từ Database
    const searchData = await this.searchAssociationData(rawPrompt, userId);

    // 1. Kiểm tra biến môi trường hoặc app_settings cho GEMINI_API_KEY
    let geminiKey = process.env.GEMINI_API_KEY || null;
    if (!geminiKey) {
      const setting = await this.prisma.$queryRaw<{ value: unknown }[]>`
        SELECT value FROM public.app_settings WHERE key = 'gemini_api_key' LIMIT 1
      `.catch(() => [] as { value: unknown }[]);
      const val = setting[0]?.value as { key?: string; apiKey?: string } | string | null;
      if (typeof val === 'string') geminiKey = val;
      else if (val && typeof val === 'object') geminiKey = val.key || val.apiKey || null;
    }

    // Nếu có GEMINI_API_KEY -> Gọi trực tiếp Google Gemini 2.0 Flash
    if (geminiKey) {
      try {
        const sysPrompt = `Bạn là Trợ lý Ảo Doanh Nhân kiêm Chỉ dẫn Điều hành thông minh của CLB Doanh Nhân CEO 1983 (HanoiBA).
Phong cách: Trang trọng, lịch thiệp, tôn trọng (gọi người dùng là 'Quý Anh/Chị' hoặc theo tên riêng), súc tích, chuyên nghiệp.

DỮ LIỆU ĐỘNG THỜI GIAN THỰC CỦA HỘI VIÊN ĐANG ĐĂNG NHẬP:
- Họ tên: ${context.user.name}
- Mã hội viên: ${context.user.code}
- Công ty: ${context.user.company}
- Chức vụ: ${context.user.title}
- Cấp bậc: ${context.user.level}
- Trạng thái hội phí: ${context.dues.feePaid ? 'ĐÃ ĐÓNG ĐẦY ĐỦ' : `CHƯA ĐÓNG - Còn nợ ${new Intl.NumberFormat('vi-VN').format(context.dues.totalOutstanding)} đ (Kỳ ${context.dues.feeYear})`}
- Thông báo chưa đọc: ${context.notifications.unreadCount} thông báo
- Sự kiện đã đăng ký (${context.myEvents.length} sự kiện): ${JSON.stringify(context.myEvents)}
- Sự kiện nhiều người đăng ký nhất trong Hiệp hội: ${JSON.stringify(context.topEvents)}

DỮ LIỆU ĐỘNG THỜI GIAN THỰC ĐƯỢC TRÍCH XUẤT TỪ HỆ THỐNG (RAG GROUND TRUTH):
- Ban chuyên trách liên quan: ${JSON.stringify(searchData?.matchedCommittees || [])}
- Chính sách hội phí & MB Bank: ${JSON.stringify(searchData?.feePolicy || {})}
- Danh bạ hội viên / Lãnh đạo tìm thấy: ${JSON.stringify(searchData?.members || [])}
- Sản phẩm Marketplace: ${JSON.stringify(searchData?.products || [])}
- Cơ hội giao thương B2B: ${JSON.stringify(searchData?.opportunities || [])}
- Sự kiện & Hội nghị: ${JSON.stringify(searchData?.events || [])}
- Văn bản / Điều lệ: ${JSON.stringify(searchData?.documents || [])}

DANH MỤC 18 LỘ TRÌNH CHỈ DẪN TRỰC TIẾP (TOURS):
1. 'association-events' (Lịch Sự Kiện & Đăng Ký Vé) -> route '/association/events'
2. 'association-card' (Thẻ Hội Viên, Danh Thiếp Số NFC & Quét Card AI) -> route '/association/card'
3. 'association-checkin' (Vé Check-in QR & Soát vé) -> route '/association/checkin'
4. 'association-members' (Danh Bạ Hội Viên 200+ CEO & Hẹn 1-on-1) -> route '/association/members'
5. 'association-opportunities' (Sàn Cơ Hội Kinh Doanh B2B) -> route '/association/opportunities'
6. 'association-products' (Chợ B2B Marketplace & Gian Hàng Số) -> route '/association/products'
7. 'association-voting' (Biểu Quyết Đại Hội & Lucky Draw) -> route '/association/voting'
8. 'association-messages' (Hộp Thư B2B & Nhóm Thảo Luận) -> route '/association/messages'
9. 'association-library' (Kho Văn Bản, Điều Lệ & Kỷ Yếu) -> route '/association/library'
10. 'association-notifications' (Trung Tâm Thông Báo & Nhắc Việc) -> route '/association/notifications'
11. 'association-profile' (Hồ Sơ Cá Nhân & Đóng Hội Phí VietQR) -> route '/association/profile'
12. 'association-home' (Trang Chủ & Dashboard Điều Hành) -> route '/association'
13. 'events-admin' (Quản Trị Sự Kiện CRM - Ban Tổ Chức) -> route '/events'
14. 'members-admin' (Quản Lý Hội Viên CRM - Ban Hội Viên) -> route '/members'
15. 'fees-admin' (Quản Trị Hội Phí & Kế Toán - Ban Tài Chính) -> route '/fees'
16. 'tasks-admin' (Giao Việc & Nhiệm Vụ - Ban Thư Ký) -> route '/tasks'
17. 'permissions-admin' (Quản Trị Phân Quyền RBAC - Ban Quản Trị) -> route '/permissions'
18. 'sponsors-admin' (Quản Lý Nhà Tài Trợ - Ban Tài Trợ) -> route '/sponsors'

QUY TẮC PHẢN HỒI KHI NGƯỜI DÙNG HỎI HƯỚNG DẪN THAO TÁC / NHƯ THẾ NÀO / LÀM SAO (BẮT BUỘC):
1. Giải thích chi tiết các bước thao tác thực tế: Bước 1, Bước 2, Bước 3 kèm mẹo hữu ích.
2. Luôn kết thúc câu trả lời bằng lời mời chính xác:
   "👉 Quý Anh/Chị có muốn tôi hướng dẫn thao tác trực tiếp trên màn hình không? Tôi sẽ lái màn hình và chỉ dẫn từng bước cho Quý Anh/Chị!"
3. Trong speechText, tóm tắt các bước và kết thúc bằng câu hỏi:
   "Quý anh chị có muốn tôi hướng dẫn thao tác trực tiếp trên màn hình không? Hãy chọn Có hoặc nói Có để tôi chỉ dẫn từng bước nhé!"
4. Trả về:
   - "intent": "feature_guide"
   - "suggestTour": true
   - "tourId": id của tour phù hợp nhất
   - "route": route đích
   - "featureName": tên tính năng bằng tiếng Việt
5. Nếu người dùng nói "có", "đồng ý", "ok":
   - "intent": "start_tour"
   - "tourId": id của tour cần chạy
   - "route": route đích`;

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: `${sysPrompt}\n\nCÂU HỎI CỦA HỘI VIÊN: "${prompt}"` }] }],
              generationConfig: {
                temperature: 0.2,
                responseMimeType: 'application/json',
              },
            }),
          },
        );

        if (geminiRes.ok) {
          const rawData = await geminiRes.json();
          const jsonText = rawData?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (jsonText) {
            const parsed = JSON.parse(jsonText);
            return {
              answer: parsed.answer || '',
              speechText: parsed.speechText || parsed.answer || '',
              intent: parsed.intent || 'chat',
              tourId: parsed.tourId || undefined,
              route: parsed.route || undefined,
              featureName: parsed.featureName || undefined,
              suggestTour: Boolean(parsed.suggestTour || parsed.intent === 'feature_guide'),
              dynamicData: context,
              provider: 'gemini-free',
              model: 'gemini-2.0-flash',
            };
          }
        }
      } catch (err: any) {
        console.warn('[AiService] Gemini API call error, falling back to Smart Hybrid Engine:', err?.message);
      }
    }

    // 2. SMART HYBRID NLP ENGINE (Fallback thông minh 100% không phụ thuộc ngoài)
    // 2.1. Phản hồi Thông tin Ban Chuyên Trách & Lãnh Đạo
    if (searchData && searchData.matchedCommittees.length > 0) {
      const comm = searchData.matchedCommittees[0];
      const answer = `🏛️ **Thông tin ${comm.name} - CLB Doanh Nhân CEO 1983:**\n\n- 👤 **Lãnh đạo phụ trách:** **${comm.leadership}**\n- 📋 **Phạm vi & Chức năng:** ${comm.scope}\n- 📞 **Kênh liên hệ trực tiếp:** \`${comm.contact}\`\n\n👉 *Quý Anh/Chị có muốn tôi chuyển đến khu vực làm việc của ban này không?*`;
      const speechText = `Dạ thưa Quý anh chị, ${comm.name} do ${comm.leadership} phụ trách. ${comm.contact}. Quý anh chị có muốn tôi mở màn hình liên quan không ạ?`;
      return {
        answer,
        speechText,
        intent: 'feature_guide',
        suggestTour: true,
        tourId: comm.route.replace('/', '').replace('/', '-') || 'association-members',
        route: comm.route,
        featureName: comm.name,
        dynamicData: { committee: comm },
        provider: 'ceo1983-smart-engine',
        model: 'rag-committee-v1',
      };
    }

    // 2.2. Phản hồi về Chính sách Hội Phí & MB Bank
    if (searchData?.isFeeQuery) {
      const dues = context.dues;
      const formattedOwed = new Intl.NumberFormat('vi-VN').format(dues.totalOutstanding || 0);
      const answer = `💳 **Quy định & Kênh đóng Hội phí CLB Doanh Nhân CEO 1983:**\n\n- 🏦 **Ngân hàng thụ hưởng:** MB Bank (Ngân hàng Quân Đội)\n- 🔢 **Số tài khoản:** \`1983000000\`\n- 👤 **Chủ tài khoản:** **CLB DOANH NHAN CEO 1983**\n- 💰 **Định mức niên liễm:**\n  + Tiêu chuẩn: **10.000.000 VNĐ / năm**\n  + VIP Gold: **20.000.000 VNĐ / năm**\n  + Kim cương: **50.000.000 VNĐ / năm**\n- 📝 **Cú pháp chuyển khoản:** \`${context.user.code} HP2026\` hoặc \`${context.user.name} HP2026\`\n\n*Trạng thái của Quý Anh/Chị:* ${dues.feePaid ? '✅ **ĐÃ HOÀN TẤT ĐẦY ĐỦ**' : `⚠️ **Còn nợ ${formattedOwed} VNĐ (Kỳ ${dues.feeYear || 2026})**`}\n\n👉 *Quý Anh/Chị có muốn tôi mở mục Hồ sơ để quét mã VietQR MB Bank thanh toán tự động trong 1 giây không?*`;
      const speechText = `Hội phí CEO 1983 được tiếp nhận qua MB Bank, số tài khoản một chín tám ba không không không không không không, chủ tài khoản CLB Doanh Nhân CEO 1983. Quý anh chị có muốn tôi mở mã VietQR để thanh toán ngay không ạ?`;
      return {
        answer,
        speechText,
        intent: 'feature_guide',
        suggestTour: true,
        tourId: 'association-profile',
        route: '/association/profile',
        featureName: 'Hồ Sơ & Đóng Hội Phí VietQR',
        dynamicData: { dues: context.dues, feePolicy: searchData.feePolicy },
        provider: 'ceo1983-smart-engine',
        model: 'rag-fees-v1',
      };
    }

    // 2.3. Tra cứu Hội viên & Lãnh đạo (Members & Business Directory)
    if (searchData && searchData.members.length > 0 && (
      q.includes('ai') || q.includes('tìm') || q.includes('thành viên') || q.includes('hội viên') ||
      q.includes('công ty') || q.includes('doanh nghiệp') || q.includes('giám đốc') || q.includes('chủ tịch') ||
      q.includes('trưởng ban') || q.includes('phó ban') || q.includes('ceo')
    )) {
      const list = searchData.members.map((m: any, idx: number) =>
        `${idx + 1}. **${m.name || m.full_name}** (${m.code || 'M1983'})\n   - Chức vụ: **${m.position || m.title || 'Lãnh đạo'}** tại **${m.company || 'Doanh nghiệp Hội viên'}**\n   - Phân ban: ${m.department || 'Ban Hội viên'} | Hạng: ${m.level || 'Chính thức'}`
      ).join('\n\n');

      const answer = `👥 **Tìm thấy ${searchData.members.length} hội viên doanh nhân phù hợp:**\n\n${list}\n\n👉 *Quý Anh/Chị có muốn tôi mở **Danh Bạ Hội Viên** để gửi lời mời hẹn gặp 1-on-1 hoặc xem hồ sơ năng lực 360° không?*`;
      const speechText = `Tôi đã tìm thấy ${searchData.members.length} hội viên doanh nhân phù hợp trong hệ thống, bao gồm anh chị ${searchData.members[0].name || searchData.members[0].full_name} tại ${searchData.members[0].company || 'doanh nghiệp'}. Quý anh chị có muốn tôi mở Danh bạ để kết nối ngay không ạ?`;
      return {
        answer,
        speechText,
        intent: 'feature_guide',
        suggestTour: true,
        tourId: 'association-members',
        route: '/association/members',
        featureName: 'Danh Bạ 200+ CEO & Hẹn 1-on-1',
        dynamicData: { members: searchData.members },
        provider: 'ceo1983-smart-engine',
        model: 'rag-members-v1',
      };
    }

    // 2.4. Tra cứu Sản phẩm Chợ B2B (Marketplace Products)
    if (searchData && searchData.products.length > 0 && (
      q.includes('sản phẩm') || q.includes('chợ') || q.includes('bán') || q.includes('mua') ||
      q.includes('giá') || q.includes('hàng') || q.includes('gian hàng') || q.includes('marketplace')
    )) {
      const list = searchData.products.map((p: any, idx: number) => {
        const priceStr = p.price ? new Intl.NumberFormat('vi-VN').format(p.price) + ' VNĐ' : 'Liên hệ đàm phán';
        return `${idx + 1}. 🛍️ **${p.name || p.title}**\n   - Giá niêm yết: **${priceStr}**\n   - Doanh nghiệp cung cấp: **${p.company || 'Hội viên CEO 1983'}**\n   - Danh mục: ${p.category || 'Sản phẩm B2B'}`;
      }).join('\n\n');

      const answer = `🛍️ **Tìm thấy ${searchData.products.length} sản phẩm trên Chợ Giao Thương B2B:**\n\n${list}\n\n👉 *Quý Anh/Chị có muốn tôi mở **Chợ B2B** để xem chi tiết và trao đổi trực tiếp với chủ gian hàng không?*`;
      const speechText = `Hệ thống có ${searchData.products.length} sản phẩm phù hợp trên Chợ B2B, tiêu biểu là ${searchData.products[0].name || searchData.products[0].title}. Quý anh chị có muốn tôi mở Chợ B2B ngay không ạ?`;
      return {
        answer,
        speechText,
        intent: 'feature_guide',
        suggestTour: true,
        tourId: 'association-products',
        route: '/association/products',
        featureName: 'Chợ Giao Thương B2B & Gian Hàng Số',
        dynamicData: { products: searchData.products },
        provider: 'ceo1983-smart-engine',
        model: 'rag-products-v1',
      };
    }

    // 2.5. Tra cứu Cơ hội Kinh doanh & Giao thương B2B
    if (searchData && searchData.opportunities.length > 0 && (
      q.includes('cơ hội') || q.includes('giao thương') || q.includes('hợp tác') ||
      q.includes('đối tác') || q.includes('chào mua') || q.includes('chào bán') || q.includes('dự án')
    )) {
      const list = searchData.opportunities.map((o: any, idx: number) => {
        const valStr = o.valuation ? new Intl.NumberFormat('vi-VN').format(o.valuation) + ' VNĐ' : 'Thỏa thuận';
        return `${idx + 1}. 💼 **${o.title}**\n   - Loại hình: **${o.type === 'buy' ? 'Chào mua' : o.type === 'sell' ? 'Chào bán' : 'Hợp tác'}**\n   - Quy mô / Định giá: **${valStr}**\n   - Ngành nghề: ${o.target_industry || o.category || 'Đa ngành'}\n   - Người đăng: ${o.poster_name || 'Hội viên'} (${o.poster_company || 'Doanh nghiệp'})`;
      }).join('\n\n');

      const answer = `💼 **Tìm thấy ${searchData.opportunities.length} cơ hội giao thương B2B đang mở:**\n\n${list}\n\n👉 *Quý Anh/Chị có muốn tôi mở **Sàn Cơ Hội** để gửi yêu cầu kết nối matching ngay bây giờ không?*`;
      const speechText = `Tìm thấy ${searchData.opportunities.length} cơ hội kinh doanh giao thương đang mở, nổi bật là ${searchData.opportunities[0].title}. Quý anh chị có muốn tôi mở Sàn cơ hội không ạ?`;
      return {
        answer,
        speechText,
        intent: 'feature_guide',
        suggestTour: true,
        tourId: 'association-opportunities',
        route: '/association/opportunities',
        featureName: 'Sàn Cơ Hội Kinh Doanh B2B',
        dynamicData: { opportunities: searchData.opportunities },
        provider: 'ceo1983-smart-engine',
        model: 'rag-opportunities-v1',
      };
    }

    // 2.6. Tra cứu Kho Văn bản, Điều lệ & Kỷ yếu
    if (searchData && searchData.documents.length > 0 && (
      q.includes('văn bản') || q.includes('tài liệu') || q.includes('điều lệ') ||
      q.includes('quy chế') || q.includes('kỷ yếu') || q.includes('nghị quyết')
    )) {
      const list = searchData.documents.map((d: any, idx: number) =>
        `${idx + 1}. 📚 **${d.name}**\n   - Mã hiệu: \`${d.code || 'DOC'}\` | Danh mục: ${d.category || 'Tài liệu chung'}`
      ).join('\n\n');

      const answer = `📚 **Tìm thấy ${searchData.documents.length} văn bản / tài liệu liên quan:**\n\n${list}\n\n👉 *Quý Anh/Chị có muốn tôi mở **Kho Văn Bản & Kỷ Yếu** để tra cứu và tải về không?*`;
      const speechText = `Có ${searchData.documents.length} tài liệu trong Kho văn bản, bao gồm ${searchData.documents[0].name}. Quý anh chị có muốn tôi mở Kho văn bản không ạ?`;
      return {
        answer,
        speechText,
        intent: 'feature_guide',
        suggestTour: true,
        tourId: 'association-library',
        route: '/association/library',
        featureName: 'Kho Văn Bản, Điều Lệ & Kỷ Yếu',
        dynamicData: { documents: searchData.documents },
        provider: 'ceo1983-smart-engine',
        model: 'rag-docs-v1',
      };
    }

    // A. Câu hỏi về Sự kiện nhiều người đăng ký nhất (Top Events)
    if (
      q.includes('nhiều người đăng ký') ||
      q.includes('đông người') ||
      q.includes('sự kiện hot') ||
      q.includes('nhiều nhất') ||
      q.includes('top sự kiện') ||
      q.includes('nhiều đại biểu')
    ) {
      if (context.topEvents.length > 0) {
        const top1 = context.topEvents[0];
        const answer = `🏆 **Sự kiện đang có nhiều người đăng ký nhất:**\n\n- **Tên sự kiện:** ${top1.name}\n- **Số lượng đã đăng ký:** **${top1.registeredCount} / ${top1.capacity} đại biểu**\n- **Thời gian:** ${top1.date}\n- **Địa điểm:** ${top1.location}\n\n${
          context.topEvents.length > 1
            ? `*Các sự kiện tiếp theo:* \n${context.topEvents
                .slice(1, 3)
                .map((e, idx) => `${idx + 2}. **${e.name}** (${e.registeredCount} người đăng ký - ${e.date})`)
                .join('\n')}`
            : ''
        }\n\n👉 **Quý Anh/Chị có muốn tôi hướng dẫn thao tác trực tiếp đăng ký vé không? Tôi sẽ lái màn hình và chỉ dẫn từng bước cho Quý Anh/Chị!**`;

        const speechText = `Dạ thưa Quý anh chị, sự kiện đang có nhiều người đăng ký nhất là "${top1.name}" với ${top1.registeredCount} đại biểu tham dự vào ngày ${top1.date}. Quý anh chị có muốn tôi hướng dẫn thao tác trực tiếp đăng ký vé không? Hãy chọn Có hoặc nói Có nhé!`;

        return {
          answer,
          speechText,
          intent: 'feature_guide',
          suggestTour: true,
          tourId: 'association-events',
          route: '/association/events',
          featureName: 'Đăng Ký Vé Sự Kiện',
          dynamicData: { topEvents: context.topEvents },
          provider: 'ceo1983-smart-engine',
          model: 'rule-nlp-v3',
        };
      }
    }

    // B. Câu hỏi: Tôi có đang đăng ký sự kiện nào không?
    if (
      q.includes('tôi có đang đăng ký') ||
      q.includes('sự kiện của tôi') ||
      q.includes('lịch sự kiện của tôi') ||
      q.includes('tôi đã đăng ký') ||
      q.includes('vé của tôi') ||
      (q.includes('vé sự kiện') && !q.includes('như nào') && !q.includes('làm sao'))
    ) {
      if (context.myEvents.length > 0) {
        const evList = context.myEvents
          .map(
            (e, idx) =>
              `${idx + 1}. **${e.name}**\n   - Ngày: ${e.date} | Giờ: ${e.time}\n   - Địa điểm: ${e.location}\n   - Số vé: ${e.ticketCount} vé${e.luckyNumber ? ` (Mã may mắn: #${e.luckyNumber})` : ''}`,
          )
          .join('\n\n');

        const answer = `🎫 **Quý Anh/Chị đang có ${context.myEvents.length} sự kiện đã đăng ký tham dự:**\n\n${evList}\n\n*Quý Anh/Chị có thể mở mục **Vé Check-in** để xuất trình mã QR tại bàn tiếp đón.*\n\n👉 **Quý Anh/Chị có muốn tôi hướng dẫn thao tác trực tiếp mở vé QR check-in không? Tôi sẽ lái màn hình và chỉ dẫn từng bước cho Quý Anh/Chị!**`;
        const speechText = `Quý anh chị hiện đang đăng ký ${context.myEvents.length} sự kiện, bao gồm "${context.myEvents[0].name}" vào ngày ${context.myEvents[0].date}. Quý anh chị có muốn tôi hướng dẫn thao tác trực tiếp mở vé QR check-in không? Hãy chọn Có để tôi dẫn đường nhé!`;

        return {
          answer,
          speechText,
          intent: 'feature_guide',
          suggestTour: true,
          tourId: 'association-checkin',
          route: '/association/checkin',
          featureName: 'Vé Check-in QR Sự Kiện',
          dynamicData: { myEvents: context.myEvents },
          provider: 'ceo1983-smart-engine',
          model: 'rule-nlp-v3',
        };
      } else {
        const answer = `Dạ Quý Anh/Chị hiện **chưa đăng ký sự kiện nào**. Sắp tới Hiệp hội có sự kiện **"${context.topEvents[0]?.name || 'Gala Doanh nhân CEO 1983'}"** rất đặc sắc.\n\n👉 **Quý Anh/Chị có muốn tôi hướng dẫn thao tác trực tiếp đăng ký vé không? Tôi sẽ lái màn hình và chỉ dẫn từng bước cho Quý Anh/Chị!**`;
        const speechText = `Quý anh chị hiện chưa đăng ký sự kiện nào. Hãy để tôi hướng dẫn thao tác trực tiếp cho anh chị đăng ký sự kiện hot nhất sắp tới nhé!`;

        return {
          answer,
          speechText,
          intent: 'feature_guide',
          suggestTour: true,
          tourId: 'association-events',
          route: '/association/events',
          featureName: 'Đăng Ký Vé Sự Kiện',
          provider: 'ceo1983-smart-engine',
          model: 'rule-nlp-v3',
        };
      }
    }

    // C. Câu hỏi: Tôi có thông báo nào chưa đọc không?
    if (
      q.includes('thông báo') &&
      (q.includes('chưa đọc') || q.includes('tin mới') || q.includes('mới nhất') || q.includes('có thông báo'))
    ) {
      if (context.notifications.unreadCount > 0) {
        const listText = context.notifications.unreadList
          .slice(0, 3)
          .map((n, idx) => `${idx + 1}. **${n.title}**\n   _${n.body || 'Không có mô tả chi tiết'}_`)
          .join('\n\n');

        const answer = `🔔 **Quý Anh/Chị có ${context.notifications.unreadCount} thông báo mới chưa đọc:**\n\n${listText}\n\n👉 **Quý Anh/Chị có muốn tôi hướng dẫn thao tác trực tiếp vào Trung tâm thông báo không? Tôi sẽ lái màn hình và chỉ dẫn từng bước cho Quý Anh/Chị!**`;
        const speechText = `Quý anh chị có ${context.notifications.unreadCount} thông báo mới chưa đọc. Tiêu biểu là: "${context.notifications.unreadList[0]?.title}". Quý anh chị có muốn tôi hướng dẫn thao tác trực tiếp không?`;

        return {
          answer,
          speechText,
          intent: 'feature_guide',
          suggestTour: true,
          tourId: 'association-notifications',
          route: '/association/notifications',
          featureName: 'Trung Tâm Thông Báo',
          dynamicData: { notifications: context.notifications },
          provider: 'ceo1983-smart-engine',
          model: 'rule-nlp-v3',
        };
      } else {
        const answer = `🔔 **Tất cả đã cập nhật:** Quý Anh/Chị không có thông báo nào chưa đọc tại thời điểm này. Toàn bộ tin tức và văn bản mới nhất từ Ban Thư ký đã được xử lý.`;
        const speechText = `Quý anh chị không có thông báo nào chưa đọc. Mọi thông tin đều đã được cập nhật đầy đủ.`;

        return {
          answer,
          speechText,
          intent: 'query_data',
          route: '/association/notifications',
          provider: 'ceo1983-smart-engine',
          model: 'rule-nlp-v3',
        };
      }
    }

    // D. Câu hỏi: Tôi có hội phí nào chưa đóng không?
    if (
      (q.includes('hội phí') || q.includes('niên liễm') || q.includes('nợ phí') || q.includes('hóa đơn')) &&
      (q.includes('chưa đóng') || q.includes('nợ') || q.includes('cần nộp') || q.includes('kiểm tra')) &&
      !q.includes('như nào') &&
      !q.includes('làm sao')
    ) {
      if (!context.dues.feePaid && context.dues.unpaidInvoices.length > 0) {
        const inv = context.dues.unpaidInvoices[0];
        const formattedAmount = new Intl.NumberFormat('vi-VN').format(inv.amount || 0);

        const answer = `💳 **Thông tin Hội phí Hiệp hội CEO 1983:**\n\n- **Trạng thái:** ⚠️ **Chưa hoàn tất**\n- **Kỳ phí:** Năm ${inv.year || context.dues.feeYear || 2026}\n- **Số tiền cần thanh toán:** **${formattedAmount} VNĐ**\n- **Mã hóa đơn:** \`${inv.invoiceNo || 'INV-2026'}\`\n- **Hạn nộp:** ${inv.dueDate || '31/03/2026'}\n\n*Thông tin tài khoản tiếp nhận:*\n- **Ngân hàng:** MB Bank (Quân Đội)\n- **Số tài khoản:** \`1983000000\`\n- **Chủ tài khoản:** CLB DOANH NHAN CEO 1983\n- **Nội dung:** \`${inv.invoiceNo || context.user.code} HP2026\`\n\n👉 **Quý Anh/Chị có muốn tôi hướng dẫn thao tác trực tiếp đóng hội phí qua VietQR MB Bank không? Tôi sẽ lái màn hình và chỉ dẫn từng bước cho Quý Anh/Chị!**`;

        const speechText = `Quý anh chị hiện còn khoản hội phí kỳ ${inv.year || 2026} chưa đóng với số tiền ${formattedAmount} đồng. Quý anh chị có muốn tôi hướng dẫn thao tác trực tiếp quét mã VietQR để hoàn tất không? Hãy chọn Có để tôi dẫn đường nhé!`;

        return {
          answer,
          speechText,
          intent: 'feature_guide',
          suggestTour: true,
          tourId: 'association-profile',
          route: '/association/profile',
          featureName: 'Đóng Hội Phí Thường Niên VietQR',
          dynamicData: { dues: context.dues },
          provider: 'ceo1983-smart-engine',
          model: 'rule-nlp-v3',
        };
      } else {
        const answer = `✅ **Hội phí hoàn tất:** Quý Anh/Chị đã hoàn thành đầy đủ nghĩa vụ hội phí thường niên. Thẻ hội viên **${context.user.level}** của Quý Anh/Chị đang ở trạng thái Hoạt động chuẩn mực 5 sao!`;
        const speechText = `Tuyệt vời! Quý anh chị đã đóng đầy đủ toàn bộ hội phí thường niên. Thẻ hội viên của anh chị đang hoạt động rất tốt!`;

        return {
          answer,
          speechText,
          intent: 'query_data',
          route: '/association/profile',
          provider: 'ceo1983-smart-engine',
          model: 'rule-nlp-v3',
        };
      }
    }

    // E. MA TRẬN 32 TÍNH NĂNG TOÀN DIỆN (CHỨC NĂNG TRONG + CHỨC NĂNG NGOÀI):
    // Khi người dùng hỏi: "như nào", "làm sao", "ở đâu", "cách", "hướng dẫn", "thao tác", "chỉ tôi",...
    const FEATURE_GUIDES: Array<{
      id: string;
      keywords: string[];
      featureName: string;
      tourId: string;
      route: string;
      steps: string[];
      proTip: string;
      speechSummary: string;
    }> = [
      // 1. Đăng ký sự kiện
      {
        id: 'event-register',
        keywords: ['đăng ký sự kiện', 'sự kiện như nào', 'đăng ký vé', 'mua vé sự kiện', 'lấy vé', 'tham gia sự kiện', 'lịch sự kiện'],
        featureName: 'Đăng Ký Vé Sự Kiện & Hội Nghị',
        tourId: 'association-events',
        route: '/association/events',
        steps: [
          'Vào màn hình **Sự kiện** từ thanh điều hướng dưới đáy ứng dụng.',
          'Xem danh sách sự kiện sắp diễn ra, chạm vào thẻ sự kiện bạn quan tâm để xem chi tiết địa điểm, trang phục và sơ đồ bàn tiệc VIP.',
          'Bấm nút **"Đăng ký tham dự"** ở chân thẻ sự kiện, xác nhận số lượng đại biểu đi cùng.',
          'Hệ thống tự động cấp mã vé điện tử REG-xxx và hiển thị ngay tại màn hình **Vé Check-in**.',
        ],
        proTip: 'Hội viên chính thức được miễn phí vé Standard và ưu tiên xếp bàn tiệc VIP gần sân khấu.',
        speechSummary: 'Để đăng ký sự kiện: Bước một, vào mục Sự kiện. Bước hai, chọn sự kiện sắp diễn ra. Bước ba, bấm nút Đăng ký tham dự và xác nhận số lượng vé.',
      },
      // 2. Vé Check-in QR & Bàn VIP
      {
        id: 'checkin-ticket',
        keywords: ['vé checkin', 'vé check in', 'mã qr vé', 'bàn vip', 'số ghế', 'vị trí ngồi', 'xuất trình vé'],
        featureName: 'Vé Check-in QR & Tra Cứu Bàn Tiệc VIP',
        tourId: 'association-checkin',
        route: '/association/checkin',
        steps: [
          'Mở màn hình **Vé Check-in** từ phím tắt tiện ích trên Trang chủ.',
          'Xuất trình mã QR động trên thẻ vé VIP cho lễ tân hoặc Ban Truyền Thông quét tại cửa sảnh.',
          'Xem số bàn tiệc VIP (VD: Bàn VIP 02 - Ghế 04) và mã may mắn tham gia Lucky Draw Gala.',
        ],
        proTip: 'Khi được quét thành công, vé sẽ đóng mộc xanh ĐÃ CHECK-IN kèm âm thanh xác nhận tức thì.',
        speechSummary: 'Để xuất trình vé check in: Mở mục Vé Check in, đưa mã QR cho lễ tân quét, và xem vị trí bàn tiệc VIP của bạn.',
      },
      // 3. Soát vé sự kiện (Ban Truyền Thông)
      {
        id: 'checkin-scanner',
        keywords: ['soát vé', 'quét vé', 'máy quét', 'camera soát vé', 'kiểm tra vé', 'lễ tân soát'],
        featureName: 'Máy Quét Camera & NFC Soát Vé Cổng Sự Kiện',
        tourId: 'association-checkin',
        route: '/association/checkin',
        steps: [
          'Mở màn hình **Check-in**, hệ thống tự nhận diện nếu bạn thuộc Ban Truyền Thông hoặc Ban Tổ Chức.',
          'Chuyển sang chế độ **"Máy Quét Camera Check-in"**.',
          'Hướng ống kính camera vào mã vé QR của đại biểu, màn hình sẽ hiển thị họ tên, doanh nghiệp và số bàn VIP trong 0.5 giây.',
          'Bấm **"Xác Nhận Check-In"** để hoàn tất đón tiếp đại biểu.',
        ],
        proTip: 'Máy quét có hỗ trợ chế độ Offline tự lưu nếu sảnh tiệc bị mất kết nối mạng Wifi.',
        speechSummary: 'Để soát vé: Mở mục Check in, bật máy quét camera, lia vào mã vé đại biểu và bấm Xác nhận.',
      },
      // 4. Danh thiếp số 5.0 chia sẻ QR
      {
        id: 'card-show',
        keywords: ['danh thiếp số', 'card visit', 'chia sẻ danh thiếp', 'mã qr danh thiếp', 'danh thiếp điện tử'],
        featureName: 'Thẻ Danh Thiếp Số 5.0 & Chia Sẻ QR',
        tourId: 'association-card',
        route: '/association/card',
        steps: [
          'Vào màn hình **Danh thiếp** trên thanh điều hướng.',
          'Chạm vào mã QR trên thẻ danh thiếp 3D để phóng to.',
          'Đưa cho đối tác dùng camera iPhone hoặc Zalo quét để lưu danh bạ trong 1 giây mà không cần cài app.',
          'Bấm **"Sao chép liên kết"** để gửi link danh thiếp qua Zalo hoặc SMS.',
        ],
        proTip: 'Bấm vào logo công ty ở góc phải để cập nhật logo thương hiệu doanh nghiệp của bạn.',
        speechSummary: 'Để chia sẻ danh thiếp số: Vào mục Danh thiếp, chạm mã QR phóng to cho đối tác quét hoặc bấm Sao chép liên kết.',
      },
      // 5. Ghi thẻ thông minh NFC
      {
        id: 'card-nfc',
        keywords: ['ghi thẻ nfc', 'chạm nfc', 'thẻ thông minh nfc', 'thẻ kim loại', 'ghi chip nfc'],
        featureName: 'Ghi Thẻ Thông Minh Không Dây NFC',
        tourId: 'association-card',
        route: '/association/card',
        steps: [
          'Vào màn hình **Danh thiếp** và chọn mục **"Ghi thẻ NFC"**.',
          'Bấm nút **"Bắt đầu ghi thẻ"**.',
          'Áp chiếc thẻ kim loại CEO 1983 vào mặt lưng điện thoại khoảng 2 giây cho đến khi có âm báo thành công.',
          'Khi chạm thẻ vào lưng điện thoại đối tác, danh thiếp của bạn sẽ tự động bật lên.',
        ],
        proTip: 'Một chiếc thẻ NFC có thể ghi đè cập nhật lại thông tin hàng triệu lần miễn phí.',
        speechSummary: 'Để ghi thẻ NFC: Vào mục Danh thiếp, bấm Ghi thẻ NFC và áp thẻ vào mặt lưng điện thoại khoảng 2 giây.',
      },
      // 6. Quét & bóc tách card visit giấy bằng AI
      {
        id: 'card-ai-scan',
        keywords: ['quét danh thiếp giấy', 'chụp danh thiếp', 'ai bóc tách', 'ocr danh thiếp', 'quét card visit ai', 'chụp card'],
        featureName: 'Chụp & Bóc Tách Card Visit Giấy Bằng AI Vision OCR',
        tourId: 'association-card',
        route: '/association/card',
        steps: [
          'Vào màn hình **Danh thiếp**, bấm nút **"Chụp danh thiếp"**.',
          'Hướng camera vào tấm danh thiếp giấy của đối tác hoặc chọn ảnh từ thư viện.',
          'AI Vision OCR tự động nhận diện và bóc tách: Họ tên, Số điện thoại, Email, Chức vụ và Công ty.',
          'Kiểm tra lại thông tin và bấm **"Lưu vào danh bạ đối tác"**.',
        ],
        proTip: 'Giúp số hóa toàn bộ cọc danh thiếp giấy chỉ sau 5 phút hội thảo.',
        speechSummary: 'Để quét card visit bằng AI: Vào Danh thiếp, bấm Chụp danh thiếp, hướng camera chụp card giấy để AI tự bóc tách thông tin.',
      },
      // 7. Cài đặt quyền riêng tư danh thiếp
      {
        id: 'card-privacy',
        keywords: ['quyền riêng tư', 'bảo mật danh thiếp', 'ẩn số điện thoại', 'ẩn zalo', 'cài đặt danh thiếp'],
        featureName: 'Cài Đặt Quyền Riêng Tư & Bảo Mật Danh Thiếp',
        tourId: 'association-card',
        route: '/association/card',
        steps: [
          'Vào màn hình **Danh thiếp**, bấm nút **"Chỉnh sửa / Quyền riêng tư"**.',
          'Chủ động bật hoặc tắt hiển thị Số điện thoại di động, Zalo, Email công khai trên web.',
          'Bấm **"Lưu cài đặt"** để cập nhật ngay lập tức.',
        ],
        proTip: 'Bạn có thể chọn chỉ hiển thị số máy bàn công ty thay vì số di động cá nhân.',
        speechSummary: 'Để cài đặt quyền riêng tư danh thiếp: Vào Danh thiếp, bấm Chỉnh sửa, bật tắt ẩn hiện số điện thoại và email rồi lưu lại.',
      },
      // 8. Tìm kiếm & Tra cứu danh bạ 200+ CEO
      {
        id: 'member-search',
        keywords: ['tìm kiếm hội viên', 'danh bạ', 'tìm người', 'tra cứu ceo', 'tìm đối tác', 'danh bạ hội viên'],
        featureName: 'Tra Cứu Danh Bạ 200+ Lãnh Đạo Doanh Nghiệp',
        tourId: 'association-members',
        route: '/association/members',
        steps: [
          'Vào màn hình **Danh bạ** từ thanh menu.',
          'Gõ tên doanh nhân, tên công ty hoặc ngành nghề vào thanh tìm kiếm trên đầu trang.',
          'Hệ thống lọc tức thì kết quả tìm kiếm theo thời gian thực có dấu và không dấu.',
          'Chạm vào tên hội viên để xem hồ sơ năng lực 360°.',
        ],
        proTip: 'Bạn có thể gõ mã hội viên (VD: M1983-001) để tìm đúng lãnh đạo câu lạc bộ.',
        speechSummary: 'Để tìm hội viên: Vào mục Danh bạ, gõ tên lãnh đạo hoặc tên công ty vào thanh tìm kiếm để xem hồ sơ năng lực.',
      },
      // 9. Lọc hội viên theo Ban chuyên môn & Ngành nghề
      {
        id: 'member-filter',
        keywords: ['lọc hội viên', 'lọc ban', 'lọc ngành nghề', 'ban truyền thông', 'ban tài chính', 'xây dựng', 'bất động sản'],
        featureName: 'Bộ Lọc Hội Viên Theo Ban Chuyên Môn & Ngành Nghề',
        tourId: 'association-members',
        route: '/association/members',
        steps: [
          'Mở màn hình **Danh bạ**.',
          'Vuốt ngang hàng nút bộ lọc ở dưới thanh tìm kiếm.',
          'Chạm vào ban hoặc ngành nghề cần tìm: Ban Truyền Thông, Ban Tài Chính, Xây dựng, Công nghệ, F&B...',
          'Danh sách chỉ hiển thị các CEO đang hoạt động trong lĩnh vực đó.',
        ],
        proTip: 'Bấm nút "Tất cả" để quay lại danh bạ đầy đủ 200+ thành viên.',
        speechSummary: 'Để lọc hội viên: Vào Danh bạ, vuốt ngang các tag bộ lọc để chọn Ban chuyên môn hoặc Ngành nghề kinh doanh.',
      },
      // 10. Hẹn gặp giao thương 1-on-1
      {
        id: 'meeting-1on1',
        keywords: ['hẹn gặp 1-1', 'hẹn 1-on-1', 'kết nối giao thương', 'đặt lịch hẹn', 'gặp gỡ đối tác', 'bắt tay'],
        featureName: 'Gửi Thư Mời Hẹn Giao Thương 1-on-1 Có Mục Đích',
        tourId: 'association-members',
        route: '/association/members',
        steps: [
          'Mở màn hình **Danh bạ**, tìm hội viên bạn muốn hẹn gặp.',
          'Bấm biểu tượng **Bắt tay / Kết nối** màu vàng trên góc thẻ hội viên.',
          'Nhập mục đích cuộc hẹn (VD: Trao đổi hợp tác cung ứng vật liệu) và thời gian đề xuất.',
          'Bấm **"Gửi thư mời"**. Hệ thống sẽ gửi thông báo đẩy trực tiếp vào hộp thư đối tác.',
        ],
        proTip: 'Văn hóa CEO 1983: Không hẹn vu vơ, mọi cuộc gặp đều có mục tiêu giao thương rõ ràng.',
        speechSummary: 'Để hẹn gặp một-một: Tìm hội viên trong danh bạ, bấm nút Bắt tay, nhập mục đích cuộc hẹn và bấm Gửi thư mời.',
      },
      // 11. Sàn Cơ hội kinh doanh B2B
      {
        id: 'opportunity-post',
        keywords: ['đăng cơ hội', 'sàn cơ hội', 'cung cầu', 'tìm mua hàng', 'chào bán dự án', 'hợp tác kinh doanh'],
        featureName: 'Sàn Cơ Hội Kinh Doanh & Đăng Tin Cung - Cầu B2B',
        tourId: 'association-opportunities',
        route: '/association/opportunities',
        steps: [
          'Vào màn hình **Cơ hội** từ thanh điều hướng.',
          'Xem các tab phân loại: Tất cả, Cung cấp (Supply), Tìm mua (Demand) và Hợp tác.',
          'Bấm nút **"Đăng cơ hội ngay →"** ở chân trang.',
          'Nhập tiêu đề, mô tả nhu cầu, ngân sách dự kiến, tải ảnh minh họa và bấm Đăng tin.',
        ],
        proTip: 'Các cơ hội từ 500 triệu trở lên được Ban Xúc Tiến Thương Mại hỗ trợ bảo trợ pháp lý.',
        speechSummary: 'Để đăng cơ hội kinh doanh: Vào mục Cơ hội, bấm Đăng cơ hội ngay, nhập nhu cầu cung cầu cùng ngân sách và đăng tin.',
      },
      // 12. Chợ B2B Marketplace & Gian hàng số
      {
        id: 'b2b-explore',
        keywords: ['chợ b2b', 'sàn b2b', 'marketplace', 'gian hàng', 'sản phẩm sỉ', 'chiết khấu vip', 'mua hàng nội khối'],
        featureName: 'Chợ B2B Marketplace & Ưu Đãi Độc Quyền CEO 1983',
        tourId: 'association-products',
        route: '/association/products',
        steps: [
          'Vào màn hình **Sản phẩm** trên thanh menu.',
          'Duyệt tìm sản phẩm thiết bị, nguyên vật liệu hoặc dịch vụ đang giảm giá ưu đãi.',
          'Xem chi tiết tỷ lệ chiết khấu dành riêng cho hội viên có thẻ VIP Gold.',
          'Bấm **"Yêu cầu báo giá"** hoặc **"Nhắn tin"** để thương lượng trực tiếp với CEO đơn vị bán.',
        ],
        proTip: 'Ưu tiên dùng hàng của nhau, gia tăng doanh số và tạo dòng tiền nội khối.',
        speechSummary: 'Để mua sắm trên Chợ B2B: Vào mục Sản phẩm, duyệt gian hàng, xem chiết khấu VIP và bấm Nhắn tin để thương lượng.',
      },
      // 13. Đăng bán sản phẩm lên sàn B2B
      {
        id: 'b2b-sell',
        keywords: ['đăng bán sản phẩm', 'bán hàng b2b', 'tạo sản phẩm mới', 'đăng tin bán', 'mục của tôi'],
        featureName: 'Đăng Bán Sản Phẩm Mới Lên Gian Hàng B2B',
        tourId: 'association-products',
        route: '/association/products',
        steps: [
          'Vào màn hình **Sản phẩm**, chuyển sang tab **"Mục của tôi"**.',
          'Bấm nút **"Đăng bán sản phẩm"**.',
          'Chụp ảnh sản phẩm vuông 1:1, điền tên mặt hàng, giá niêm yết và tỷ lệ chiết khấu cho CLB.',
          'Bấm **"Lưu và đăng bán"**. Sản phẩm xuất hiện ngay lập tức trên Marketplace.',
        ],
        proTip: 'Mở rộng kênh phân phối chất lượng cao với chi phí marketing 0 đồng.',
        speechSummary: 'Để đăng bán sản phẩm: Vào mục Sản phẩm, chuyển sang tab Mục của tôi, bấm Đăng bán sản phẩm và nhập thông tin giá bán.',
      },
      // 14. Biểu quyết Đại hội & Bầu cử BCH
      {
        id: 'voting-poll',
        keywords: ['biểu quyết', 'bỏ phiếu', 'bầu cử', 'bầu ban chấp hành', 'bầu bch', 'nghị quyết'],
        featureName: 'Biểu Quyết Đại Hội & Bỏ Phiếu Số Kín',
        tourId: 'association-voting',
        route: '/association/voting',
        steps: [
          'Mở màn hình **Biểu quyết** từ Trang chủ.',
          'Xem các cuộc bỏ phiếu đang mở, đọc lý lịch trích ngang của ứng viên hoặc nội dung đề án sửa đổi Điều lệ.',
          'Tích chọn ứng cử viên bạn tín nhiệm và nhập ý kiến đóng góp.',
          'Bấm **"Gửi phiếu bầu"** an toàn, bảo mật tuyệt đối danh tính.',
        ],
        proTip: 'Mỗi hội viên chính thức không nợ phí có 01 phiếu bầu duy nhất theo nguyên tắc dân chủ.',
        speechSummary: 'Để biểu quyết: Mở mục Biểu quyết, xem danh sách ứng viên, tích chọn người bạn tín nhiệm và bấm Gửi phiếu bầu.',
      },
      // 15. Vòng quay may mắn Lucky Draw Gala
      {
        id: 'voting-lucky',
        keywords: ['lucky draw', 'vòng quay may mắn', 'quay số', 'trúng thưởng', 'bốc thăm gala', 'quà tặng'],
        featureName: 'Vòng Quay Số May Mắn Lucky Draw Gala Dinner',
        tourId: 'association-voting',
        route: '/association/voting',
        steps: [
          'Vào màn hình **Biểu quyết**, chuyển sang tab **"Quay số trúng thưởng"**.',
          'Theo dõi vòng quay số may mắn thời gian thực kết nối với màn hình LED sân khấu chính.',
          'Mã số vé may mắn tại Màn hình Vé Check-in của bạn sẽ tự động nằm trong thùng phiếu điện tử.',
          'Nếu trúng giải, màn hình điện thoại của bạn sẽ nổ pháo hoa chúc mừng!',
        ],
        proTip: 'Giữ kết nối Wifi/4G ổn định để nhận thông báo trúng giải ngay tức thì.',
        speechSummary: 'Để tham gia Lucky Draw: Vào mục Biểu quyết, chuyển sang tab Quay số trúng thưởng và theo dõi màn hình khi MC quay số.',
      },
      // 16. Đóng hội phí thường niên VietQR MB Bank
      {
        id: 'dues-pay',
        keywords: ['đóng hội phí', 'nộp tiền hội phí', 'quét vietqr', 'chuyển khoản mb', 'phí niên liễm', 'thanh toán hội phí'],
        featureName: 'Tra Cứu & Đóng Hội Phí Thường Niên Qua VietQR MB Bank',
        tourId: 'association-profile',
        route: '/association/profile',
        steps: [
          'Vào màn hình **Cá nhân** (Hồ sơ), chạm vào mục **"Hội phí & Hóa đơn"**.',
          'Kiểm tra số tiền niên liễm chưa đóng và hạn thanh toán.',
          'Bấm nút **"Quét mã VietQR"**.',
          'Mở app ngân hàng bất kỳ (MB Bank, Vietcombank...) quét mã QR, hệ thống tự động điền STK 1983000000, số tiền và cú pháp.',
          'Sau khi chuyển khoản, thẻ hội viên tự động cập nhật trạng thái Đã Hoàn Thành.',
        ],
        proTip: 'MB Bank là ngân hàng đối tác chiến lược của CEO 1983 với đầu số tài khoản VIP 1983000000.',
        speechSummary: 'Để đóng hội phí: Vào mục Cá nhân, chọn Hội phí, bấm Quét mã VietQR và dùng app ngân hàng quét mã chuyển khoản tự động.',
      },
      // 17. Kho Văn bản, Điều lệ & Kỷ yếu
      {
        id: 'documents-download',
        keywords: ['tải điều lệ', 'quy chế', 'kỷ yếu', 'văn bản', 'tài liệu', 'thư viện', 'nghị quyết bch'],
        featureName: 'Kho Văn Bản, Điều Lệ & Kỷ Yếu Doanh Nhân',
        tourId: 'association-library',
        route: '/association/library',
        steps: [
          'Vào màn hình **Tài liệu** (Thư viện số) trên menu.',
          'Gõ từ khóa vào ô tìm kiếm: "Điều lệ", "Quy chế" hoặc "Kỷ yếu".',
          'Chạm vào tên văn bản để xem tóm tắt nội dung và đơn vị ban hành.',
          'Bấm icon **Tải xuống** để lưu file PDF về máy điện thoại hoặc bấm **Chia sẻ** qua Zalo.',
        ],
        proTip: 'Toàn bộ văn bản pháp quy chính thức được số hóa và ký duyệt số.',
        speechSummary: 'Để xem tài liệu: Vào mục Thư viện tài liệu, tìm văn bản Điều lệ hoặc Kỷ yếu và bấm nút Tải xuống PDF.',
      },
      // 18. Đổi ảnh đại diện & ảnh bìa thẻ VIP Gold
      {
        id: 'profile-avatar',
        keywords: ['đổi ảnh đại diện', 'đổi avatar', 'ảnh bìa', 'sửa hồ sơ', 'cập nhật ảnh', 'thay ảnh'],
        featureName: 'Cập Nhật Ảnh Đại Diện & Ảnh Bìa Thẻ VIP Gold',
        tourId: 'association-profile',
        route: '/association/profile',
        steps: [
          'Mở màn hình **Cá nhân** hoặc Trang chủ.',
          'Bấm icon cây bút chì ở góc dưới bên phải thẻ hội viên VIP.',
          'Chọn **"Đổi ảnh đại diện"** hoặc **"Đổi ảnh bìa"** từ thư viện ảnh máy.',
          'Cắt chỉnh ảnh theo ý muốn và bấm **"Lưu thay đổi"**.',
        ],
        proTip: 'Chọn ảnh chân dung doanh nhân sang trọng để đối tác ấn tượng ngay khi quét danh thiếp.',
        speechSummary: 'Để đổi ảnh đại diện: Vào mục Cá nhân, bấm biểu tượng bút chì trên thẻ hội viên, chọn ảnh mới từ máy và bấm Lưu.',
      },
      // 19. Tùy biến giao diện Sáng / Tối / Chủ đề Lễ Hội
      {
        id: 'profile-theme',
        keywords: ['đổi giao diện', 'chủ đề lễ hội', 'giao diện tối', 'chủ đề tết', 'dark mode', 'chủ đề'],
        featureName: 'Tùy Biến Giao Diện Sáng / Tối & Chủ Đề Lễ Hội',
        tourId: 'association-profile',
        route: '/association/profile',
        steps: [
          'Vào màn hình **Cá nhân**, chọn mục **"Chủ đề giao diện"**.',
          'Chọn phong cách yêu thích: Giao diện Sáng (Executive Light), Tối (CEO Dark) hoặc Chủ đề Lễ Hội (Festival Gala).',
          'Màu sắc ứng dụng sẽ biến đổi ngay lập tức.',
        ],
        proTip: 'Vào dịp Tết Nguyên Đán, chủ đề Lễ Hội sẽ có hiệu ứng hoa đào và pháo hoa rực rỡ.',
        speechSummary: 'Để đổi giao diện: Vào mục Cá nhân, chọn Chủ đề giao diện, chọn Sáng, Tối hoặc Lễ hội theo sở thích của bạn.',
      },
      // 20. Cài đặt PWA lên màn hình điện thoại
      {
        id: 'pwa-install',
        keywords: ['cài đặt app', 'cài pwa', 'thêm vào màn hình chính', 'tải app', 'cài đặt ứng dụng'],
        featureName: 'Cài Đặt Ứng Dụng PWA Lên Màn Hình Chính Điện Thoại',
        tourId: 'association-profile',
        route: '/association/profile',
        steps: [
          'Nếu dùng iPhone: Bấm nút **Chia sẻ** trên trình duyệt Safari, cuộn xuống chọn **"Thêm vào Màn hình chính"** (Add to Home Screen).',
          'Nếu dùng Android: Bấm icon 3 chấm trên trình duyệt Chrome, chọn **"Cài đặt ứng dụng"**.',
          'Icon CEO 1983 sẽ xuất hiện trên màn hình điện thoại, mở lên dùng mượt mà toàn màn hình không có thanh địa chỉ.',
        ],
        proTip: 'Công nghệ Progressive Web App giúp cập nhật tính năng mới tự động mà không cần vào App Store.',
        speechSummary: 'Để cài app: Mở Safari chọn Chia sẻ rồi Thêm vào màn hình chính, hoặc trên Chrome chọn Cài đặt ứng dụng.',
      },
      // 21. Hotline 5 Ban Chuyên Môn
      {
        id: 'hotline-support',
        keywords: ['hotline', 'liên hệ ban', 'số điện thoại hỗ trợ', 'ban chuyên môn', 'trợ giúp', 'tổng đài'],
        featureName: 'Hotline Trực Tiếp 5 Ban Chuyên Môn Hiệp Hội',
        tourId: 'association-profile',
        route: '/association/profile',
        steps: [
          'Vào màn hình **Cá nhân**, chọn mục **"Liên hệ 5 Ban Chuyên Môn"**.',
          'Chọn ban phụ trách vấn đề bạn cần: Ban Truyền Thông (soát vé), Ban Thư Ký (hồ sơ), Ban Tài Chính (hội phí)...',
          'Bấm gọi điện thoại trực tiếp hoặc mở chat Zalo OA với Trưởng ban.',
        ],
        proTip: 'Ban Thư Ký túc trực 24/7 để giải đáp mọi thắc mắc của quý hội viên.',
        speechSummary: 'Để gọi hotline: Vào mục Cá nhân, chọn Liên hệ Ban chuyên môn, chọn ban cần hỗ trợ và bấm nút gọi điện hoặc Zalo.',
      },
      // 22. Tạo sự kiện mới & Quản lý vé (Ban Tổ Chức) - CRM NGOÀI
      {
        id: 'event-create',
        keywords: ['tạo sự kiện', 'quản trị sự kiện', 'thêm sự kiện', 'ban tổ chức sự kiện', 'tạo hội nghị', 'crm sự kiện'],
        featureName: 'Tạo Sự Kiện Mới & Quản Trị Đại Biểu (Ban Tổ Chức)',
        tourId: 'events-admin',
        route: '/events',
        steps: [
          'Truy cập màn hình **Quản trị Sự kiện** (/events).',
          'Bấm nút **"+ Tạo sự kiện mới"** màu xanh ở góc trên bên phải.',
          'Điền Tên sự kiện, Thời gian khai mạc, Địa điểm tổ chức, Sức chứa đại biểu và Trang phục (Dresscode).',
          'Cấu hình gói tài trợ và bấm **"Lưu sự kiện"**. Hệ thống mở bán vé ngay lập tức.',
        ],
        proTip: 'Bạn có thể xuất danh sách khách mời đăng ký dạng Excel để in thẻ đeo trước giờ G.',
        speechSummary: 'Để tạo sự kiện mới: Vào trang Quản trị sự kiện, bấm Tạo sự kiện mới, điền thông tin địa điểm thời gian và bấm Lưu.',
      },
      // 23. Quản lý hội viên CRM & Phê duyệt kết nạp - CRM NGOÀI
      {
        id: 'members-crm',
        keywords: ['quản lý hội viên crm', 'phê duyệt hội viên', 'kết nạp hội viên', 'cấp mã m1983', 'thẩm định hội viên'],
        featureName: 'Quản Lý Hồ Sơ Hội Viên CRM & Phê Duyệt Kết Nạp (Ban Hội Viên)',
        tourId: 'members-admin',
        route: '/members',
        steps: [
          'Truy cập màn hình **Quản lý Hội viên** (/members).',
          'Kiểm tra danh sách hồ sơ ở cột "Chờ phê duyệt".',
          'Xem thông tin doanh nghiệp, xác nhận năm sinh 1983 và bấm **"Phê duyệt"**.',
          'Hệ thống tự động cấp mã định danh M1983-xxx và gửi email chào mừng chính thức.',
        ],
        proTip: 'Chỉ định đúng ban chuyên môn để hội viên tham gia các buổi sinh hoạt chuyên sâu.',
        speechSummary: 'Để quản lý hội viên: Vào Quản lý hội viên, kiểm tra hồ sơ chờ duyệt, xác nhận thông tin và bấm Phê duyệt cấp mã M1983.',
      },
      // 24. Quản trị hội phí & Thu chi - CRM NGOÀI
      {
        id: 'finance-mgmt',
        keywords: ['quản trị hội phí', 'tạo đợt thu', 'kế toán hiệp hội', 'báo cáo tài chính', 'đối soát ngân hàng', 'thu chi'],
        featureName: 'Quản Trị Hội Phí & Kế Toán Thu Chi Minh Bạch (Ban Tài Chính)',
        tourId: 'fees-admin',
        route: '/fees',
        steps: [
          'Truy cập màn hình **Quản lý Hội phí** (/fees).',
          'Bấm **"+ Tạo đợt thu mới"**, nhập mức niên liễm năm và phát hành cho toàn thể hội viên.',
          'Theo dõi tỷ lệ thanh toán thời gian thực qua biểu đồ trực quan.',
          'Bấm **"Báo cáo thu chi"** để xuất tệp Excel gửi Ban Chấp Hành.',
        ],
        proTip: 'Hệ thống tự động đối soát giao dịch VietQR MB Bank mà không cần kiểm tra sao kê thủ công.',
        speechSummary: 'Để quản trị hội phí: Vào mục Quản lý hội phí, tạo đợt thu niên liễm mới, theo dõi tỷ lệ thanh toán và xuất báo cáo kế toán.',
      },
      // 25. Giao việc & Quản lý nhiệm vụ điều hành - CRM NGOÀI
      {
        id: 'tasks-mgmt',
        keywords: ['giao việc', 'quản lý công việc', 'nhiệm vụ điều hành', 'bảng kanban', 'ban thư ký giao việc'],
        featureName: 'Giao Việc & Theo Dõi Nhiệm Vụ Điều Hành Liên Ban (Ban Thư Ký)',
        tourId: 'tasks-admin',
        route: '/tasks',
        steps: [
          'Truy cập màn hình **Quản lý Công việc** (/tasks).',
          'Bấm **"+ Giao việc mới"**, nhập tiêu đề nhiệm vụ, chọn Ban chịu trách nhiệm và hạn chót hoàn thành.',
          'Theo dõi tiến độ trên bảng Kanban trực quan: Cần làm - Đang làm - Đã hoàn thành.',
          'Kéo thả thẻ nhiệm vụ khi hoàn thành từng khâu chuẩn bị.',
        ],
        proTip: 'Hệ thống tự động gửi thông báo nhắc việc trước 24 giờ khi sắp đến hạn deadline.',
        speechSummary: 'Để giao việc: Vào Quản lý công việc, bấm Giao việc mới, chọn Ban phụ trách và theo dõi tiến độ trên bảng Kanban.',
      },
      // 26. Phân quyền RBAC & Ma trận thẩm quyền - CRM NGOÀI
      {
        id: 'permissions-mgmt',
        keywords: ['phân quyền', 'phân quyền rbac', 'ma trận quyền', 'cấp quyền soát vé', 'vai trò quản trị'],
        featureName: 'Quản Trị Phân Quyền RBAC & Ma Trận Thẩm Quyền (Ban Quản Trị)',
        tourId: 'permissions-admin',
        route: '/permissions',
        steps: [
          'Truy cập màn hình **Phân quyền** (/permissions).',
          'Chọn vai trò cần cấu hình: Ban Chấp Hành, Trưởng Ban Truyền Thông, Ban Thư Ký, Hội Viên...',
          'Gạt bật/tắt các công tắc quyền: Tạo sự kiện, Soát vé, Duyệt hội viên, Xem tài chính...',
          'Bấm **"Lưu thay đổi"** để áp dụng chính sách bảo mật tức thì trên toàn hệ thống.',
        ],
        proTip: 'Cấp quyền event:checkin cho nhân sự lễ tân để họ mở được camera soát vé trên app di động.',
        speechSummary: 'Để phân quyền: Vào Quản trị phân quyền, chọn vai trò cần cấu hình, gạt bật tắt các quyền nghiệp vụ và bấm Lưu thay đổi.',
      },
      // 27. Quản lý nhà tài trợ & Quyền lợi - CRM NGOÀI
      {
        id: 'sponsors-mgmt',
        keywords: ['nhà tài trợ', 'gói tài trợ', 'tài trợ kim cương', 'quyền lợi tài trợ', 'quản lý tài trợ'],
        featureName: 'Quản Lý Nhà Tài Trợ & Nghiệm Thu Quyền Lợi (Ban Tài Trợ)',
        tourId: 'sponsors-admin',
        route: '/sponsors',
        steps: [
          'Truy cập màn hình **Nhà tài trợ** (/sponsors).',
          'Bấm **"+ Thêm nhà tài trợ"**, nhập tên doanh nghiệp, người đại diện và gói tài trợ (Kim Cương, Vàng, Bạc).',
          'Tải lên logo PNG trong suốt để tự động hiển thị trên banner sự kiện và backdrop.',
          'Bấm **"Báo cáo nghiệm thu"** để xuất file chứng nhận quyền lợi gửi đối tác.',
        ],
        proTip: 'Đảm bảo thực hiện đầy đủ cam kết quyền lợi để xây dựng mối quan hệ đồng hành bền vững.',
        speechSummary: 'Để quản lý tài trợ: Vào Nhà tài trợ, thêm đơn vị đồng hành mới, tải logo thương hiệu và xuất báo cáo nghiệm thu quyền lợi.',
      },
      // 28. Tin nhắn & Hộp thư B2B
      {
        id: 'messages-b2b',
        keywords: ['tin nhắn', 'hộp thư', 'nhóm ban', 'chat b2b', 'trò chuyện đối tác'],
        featureName: 'Hộp Thư B2B & Nhóm Thảo Luận Ban Chuyên Môn',
        tourId: 'association-messages',
        route: '/association/messages',
        steps: [
          'Vào mục **Tin nhắn** trên thanh điều hướng.',
          'Xem các cuộc hội thoại 1-1 với đối tác hoặc chuyển sang tab Nhóm ban chuyên môn.',
          'Bấm icon kẹp giấy để gửi nhanh danh thiếp điện tử hoặc file báo giá PDF.',
          'Bấm nút bút soạn tin ở góc phải nếu muốn tạo nhóm thảo luận dự án mới.',
        ],
        proTip: '100% đối tác trò chuyện đều là hội viên CEO đã xác thực danh tính.',
        speechSummary: 'Để nhắn tin: Vào mục Tin nhắn, chọn cuộc trò chuyện đối tác, gửi tài liệu báo giá hoặc vào nhóm thảo luận của ban.',
      },
    ];

    // Duyệt qua ma trận tính năng để tìm tính năng khớp với câu hỏi người dùng
    for (const fg of FEATURE_GUIDES) {
      const isMatched = fg.keywords.some((kw) => q.includes(kw));
      if (isMatched) {
        const stepsFormatted = fg.steps.map((st, idx) => `**Bước ${idx + 1}:** ${st}`).join('\n\n');

        const answer = `📌 **Hướng dẫn thao tác: ${fg.featureName}**\n\n${stepsFormatted}\n\n💡 *Mẹo thực tế: ${fg.proTip}*\n\n👉 **Quý Anh/Chị có muốn tôi hướng dẫn thao tác trực tiếp trên màn hình không? Tôi sẽ lái màn hình và chỉ dẫn từng bước cho Quý Anh/Chị!**`;

        const speechText = `${fg.speechSummary}. Quý anh chị có muốn tôi hướng dẫn thao tác trực tiếp trên màn hình không? Hãy chọn Có hoặc nói Có để tôi chỉ dẫn từng bước nhé!`;

        return {
          answer,
          speechText,
          intent: 'feature_guide',
          suggestTour: true,
          tourId: fg.tourId,
          route: fg.route,
          featureName: fg.featureName,
          provider: 'ceo1983-smart-engine',
          model: 'rule-nlp-v3',
        };
      }
    }

    // F. Trường hợp câu hỏi chung chung về hướng dẫn sử dụng ("hướng dẫn sử dụng app", "chỉ tôi dùng", "các chức năng")
    if (
      q.includes('hướng dẫn') ||
      q.includes('chỉ tôi') ||
      q.includes('thao tác') ||
      q.includes('cách dùng') ||
      q.includes('chỉ dẫn') ||
      q.includes('làm sao') ||
      q.includes('ở đâu') ||
      q.includes('tính năng')
    ) {
      const answer = `🗺️ **Trung Tâm Hướng Dẫn Sử Dụng CLB Doanh Nhân CEO 1983:**\n\nỨng dụng hỗ trợ đầy đủ toàn bộ chức năng trong và ngoài:\n1. 🎟️ **Sự kiện & Hội nghị:** Đăng ký vé, xem lịch sinh hoạt ban, sơ đồ bàn VIP.\n2. 🎫 **Vé Check-in:** Quét QR tại cổng, máy quét dành cho Ban Truyền Thông.\n3. 📇 **Danh thiếp số 5.0:** Chạm thẻ thông minh NFC, quét card visit bằng AI.\n4. 👥 **Danh bạ 200+ CEO:** Lọc ngành nghề, gửi thư mời hẹn gặp 1-on-1.\n5. 💼 **Sàn Giao thương B2B & Chợ Marketplace:** Đăng tin Cung - Cầu, bán sản phẩm.\n6. 🗳️ **Biểu quyết & Lucky Draw:** Bỏ phiếu bầu BCH, quay số may mắn Gala.\n7. 💳 **Hội phí & Hóa đơn:** Đóng phí niên liễm qua VietQR MB Bank tự động.\n8. 🏛️ **Quản trị CRM Ngoài:** Tạo sự kiện mới, duyệt hội viên, giao việc, phân quyền RBAC.\n\n👉 **Quý Anh/Chị có muốn tôi hướng dẫn thao tác trực tiếp trên màn hình không? Hãy cho tôi biết chức năng Quý Anh/Chị muốn khám phá!**`;

      const speechText = `Ứng dụng CEO 1983 hỗ trợ đầy đủ các tính năng: Đăng ký sự kiện, Danh thiếp NFC, Check in vé QR, Danh bạ 200 CEO, Sàn B2B, Biểu quyết và Đóng hội phí VietQR. Quý anh chị có muốn tôi hướng dẫn thao tác trực tiếp chức năng nào không?`;

      return {
        answer,
        speechText,
        intent: 'feature_guide',
        suggestTour: true,
        tourId: 'association-home',
        route: '/association',
        featureName: 'Trang Chủ & Dashboard Điều Hành',
        provider: 'ceo1983-smart-engine',
        model: 'rule-nlp-v3',
      };
    }

    // G. Câu hỏi về Thông tin cá nhân: Tôi là ai?
    if (q.includes('tôi là ai') || q.includes('thông tin của tôi') || q.includes('mã hội viên') || q.includes('hồ sơ của tôi')) {
      const answer = `👤 **Hồ sơ Hội viên của Quý Anh/Chị:**\n\n- **Họ tên:** **${context.user.name}**\n- **Mã hội viên:** \`${context.user.code}\`\n- **Doanh nghiệp:** ${context.user.company}\n- **Chức vụ:** ${context.user.title}\n- **Hạng thẻ:** ⭐ **${context.user.level}**\n- **Ban chuyên môn:** ${context.user.department}\n- **Trạng thái:** ${context.dues.feePaid ? '🟢 Đã nộp hội phí' : '🟡 Còn khoản phí chờ nộp'}\n\n👉 **Quý Anh/Chị có muốn tôi hướng dẫn thao tác trực tiếp xem và chỉnh sửa hồ sơ không?**`;
      const speechText = `Xin chào ${context.user.name}, mã hội viên của anh chị là ${context.user.code}, chức vụ ${context.user.title} tại ${context.user.company}. Anh chị có muốn tôi hướng dẫn thao tác trực tiếp xem hồ sơ không?`;

      return {
        answer,
        speechText,
        intent: 'feature_guide',
        suggestTour: true,
        tourId: 'association-profile',
        route: '/association/profile',
        featureName: 'Hồ Sơ Doanh Nhân',
        dynamicData: { user: context.user },
        provider: 'ceo1983-smart-engine',
        model: 'rule-nlp-v3',
      };
    }

    // H. Chào hỏi, xưng hô thân tình & trò chuyện như người thật
    if (
      q.includes('chào') ||
      q.includes('hello') ||
      q.includes('hi ') ||
      q === 'hi' ||
      q.includes('alo') ||
      q.includes('em ơi') ||
      q.includes('bạn ơi') ||
      q.includes('em là ai') ||
      q.includes('bạn là ai') ||
      q.includes('tên là gì') ||
      q.includes('giới thiệu')
    ) {
      const answer = `👋 **Dạ em chào Quý Anh/Chị ${context.user.name}!**\n\nEm là **Trợ lý AI Điều Hành Thông Minh** của **CLB Doanh Nhân CEO 1983**.\n\nRất vui được đồng hành cùng Anh/Chị hôm nay ạ! Em có thể giúp Quý Anh/Chị tra cứu nhanh lịch sự kiện, kiểm tra hội phí niên liễm, kết nối giao thương với 200+ CEO trong danh bạ, hoặc tự động dẫn đường từng bước trên màn hình.\n\n👉 *Hôm nay công việc của Anh/Chị thế nào rồi ạ? Anh/Chị cần em hỗ trợ việc gì ngay bây giờ không ạ?*`;
      const speechText = `Dạ em chào Quý anh chị ${context.user.name}! Em là Trợ lý AI điều hành của CEO 1983. Hôm nay công việc của anh chị thế nào rồi ạ? Em có thể giúp anh chị tra cứu sự kiện, kiểm tra hội phí và dẫn đường trên app ạ!`;

      return {
        answer,
        speechText,
        intent: 'chat',
        provider: 'ceo1983-smart-engine',
        model: 'human-like-v1',
      };
    }

    // I. Tâm sự, cảm xúc & áp lực điều hành doanh nghiệp
    if (
      q.includes('mệt') ||
      q.includes('áp lực') ||
      q.includes('stress') ||
      q.includes('buồn') ||
      q.includes('chán') ||
      q.includes('khó khăn') ||
      q.includes('vất vả')
    ) {
      const answer = `☕ **Dạ em rất thấu hiểu và chia sẻ cùng Quý Anh/Chị ${context.user.name}!**\n\nLàm người đứng đầu doanh nghiệp, lèo lái con thuyền trong thương trường luôn đối diện với muôn vàn khó khăn và áp lực. Anh/Chị hãy hít một hơi thật sâu, uống một ngụm nước ấm hoặc tách cà phê để thư giãn nhé!\n\nTinh thần doanh nhân **CEO 1983** - tuổi Quý Hợi kiên cường, bản lĩnh - luôn đồng hành và sẻ chia cùng nhau qua phương châm *"Gắn kết bền - Phát triển vững"*. Khi mệt mỏi, Anh/Chị có thể gặp gỡ anh em hội viên kết nối 1-on-1 hoặc tham gia các buổi Cà phê Doanh nhân để cùng tìm giải pháp và nạp lại năng lượng nhé ạ!`;
      const speechText = `Em hiểu làm lãnh đạo doanh nghiệp luôn đối diện nhiều áp lực. Anh chị hãy thư giãn, uống một tách trà nhé! Tinh thần anh em CEO 1983 luôn đồng hành và sẻ chia cùng anh chị ạ!`;

      return {
        answer,
        speechText,
        intent: 'chat',
        provider: 'ceo1983-smart-engine',
        model: 'human-like-v1',
      };
    }

    // J. Lời khen ngợi, cảm ơn & chúc mừng
    if (
      q.includes('cảm ơn') ||
      q.includes('thank') ||
      q.includes('em giỏi') ||
      q.includes('tuyệt vời') ||
      q.includes('thông minh') ||
      q.includes('chúc mừng') ||
      q.includes('chúc ngủ ngon') ||
      q.includes('chúc đầu tuần')
    ) {
      const answer = `💐 **Dạ em xin chân thành cảm ơn Quý Anh/Chị ${context.user.name} ạ!**\n\nSự đồng hành và tin tưởng của Quý Anh/Chị là niềm vinh hạnh lớn nhất của em. Em xin kính chúc Anh/Chị cùng doanh nghiệp luôn phát tài phát lộc, vạn sự hanh thông và ngày càng bứt phá mạnh mẽ trên thương trường!`;
      const speechText = `Dạ em cảm ơn Quý anh chị ${context.user.name} rất nhiều ạ! Chúc anh chị luôn dồi dào sức khỏe, tràn đầy năng lượng và gặt hái thật nhiều thành công ạ!`;

      return {
        answer,
        speechText,
        intent: 'chat',
        provider: 'ceo1983-smart-engine',
        model: 'human-like-v1',
      };
    }

    // K. Địa điểm gặp gỡ, cà phê, ẩm thực tiếp khách
    if (
      q.includes('cafe') ||
      q.includes('cà phê') ||
      q.includes('ăn trưa') ||
      q.includes('ăn tối') ||
      q.includes('tiếp khách') ||
      q.includes('quán ăn') ||
      q.includes('nhà hàng')
    ) {
      const answer = `🍽️ **Gợi ý không gian tiếp khách & giao lưu cho Doanh nhân:**\n\n- ☕ **Cà phê kết nối nhanh:** Các không gian yên tĩnh, lịch sự gần Duy Tân, Cầu Giấy hoặc Trung Hòa Nhân Chính (Highlands, The Coffee House, Trung Nguyên Legend).\n- 🍱 **Ăn trưa & Ăn tối tiếp đối tác:** Nhà hàng tiệc sang trọng tại Trống Đồng Palace, Trung tâm Hội nghị Quốc gia, hoặc các nhà hàng ẩm thực cao cấp quanh khu vực Tây Hồ.\n- 🤝 **Hẹn 1-on-1 trực tiếp:** Anh/Chị có thể vào mục **"Danh bạ"** để chọn hội viên và đặt lịch hẹn kết nối 1-on-1 chính thức!\n\n👉 *Quý Anh/Chị có muốn em dẫn đường mở Danh bạ hội viên để hẹn gặp đối tác ngay không ạ?*`;
      const speechText = `Em gợi ý anh chị các điểm hẹn yên tĩnh tại Cầu Giấy hoặc Tây Hồ để tiếp đối tác. Anh chị có thể mở mục Danh bạ để đặt lịch hẹn kết nối một một nhé ạ!`;

      return {
        answer,
        speechText,
        intent: 'feature_guide',
        suggestTour: true,
        tourId: 'association-members',
        route: '/association/members',
        featureName: 'Danh Bạ & Hẹn Gặp 1-on-1',
        provider: 'ceo1983-smart-engine',
        model: 'human-like-v1',
      };
    }

    // L. Tư vấn kết nối đối tác, tìm kiếm cơ hội B2B
    if (
      q.includes('tìm đối tác') ||
      q.includes('mở rộng') ||
      q.includes('tìm khách hàng') ||
      q.includes('bán hàng') ||
      q.includes('giao thương') ||
      q.includes('hợp tác') ||
      q.includes('cơ hội kinh doanh')
    ) {
      const answer = `🤝 **Chiến lược Kết nối & Khai thác Mạng lưới 200+ CEO 1983:**\n\nCộng đồng CEO 1983 quy tụ các doanh nhân tinh hoa trong nhiều lĩnh vực: Bất động sản, Xây dựng, Công nghệ, Y tế, Giáo dục, Dịch vụ... Em gợi ý Anh/Chị:\n1. 📇 **Xuất trình Danh thiếp số & Chạm thẻ NFC:** Giới thiệu nhanh hồ sơ năng lực doanh nghiệp khi tham gia các buổi sinh hoạt.\n2. 🛍️ **Đăng sản phẩm lên Chợ B2B:** Đưa sản phẩm chủ lực vào Sàn giao thương với chính sách ưu đãi dành riêng cho hội viên.\n3. 📅 **Chủ động đặt lịch hẹn 1-on-1:** Kết nối sâu với từng doanh nghiệp cùng hệ sinh thái để tìm tiếng nói chung và mở ra cơ hội hợp tác lâu dài.\n\n👉 *Quý Anh/Chị có muốn em dẫn đường mở ngay Sàn Giao Thương B2B không ạ?*`;
      const speechText = `Để mở rộng đối tác, anh chị nên tận dụng mạng lưới hai trăm CEO bằng cách đăng sản phẩm lên Chợ Bê hai Bê và đặt lịch hẹn một một. Em có thể mở Chợ giao thương cho anh chị ngay bây giờ nhé!`;

      return {
        answer,
        speechText,
        intent: 'feature_guide',
        suggestTour: true,
        tourId: 'association-products',
        route: '/association/products',
        featureName: 'Chợ Giao Thương B2B',
        provider: 'ceo1983-smart-engine',
        model: 'human-like-v1',
      };
    }

    // M. Phản hồi thông minh động (Dynamic Non-Repeating Executive Fallback)
    const answer = `Dạ thưa Quý Anh/Chị **${context.user.name}**, em đã tra cứu trên toàn hệ thống nhưng chưa tìm thấy dữ liệu khớp chính xác với yêu cầu: **"${rawPrompt}"**.\n\nQuý Anh/Chị có thể tham khảo nhanh các nội dung nổi bật trong Hiệp hội:\n- 👥 **Danh bạ 200+ CEO:** Tra cứu lãnh đạo doanh nghiệp theo ngành nghề (Bất động sản, Xây dựng, Công nghệ, Y tế...).\n- 📅 **Lịch Sự kiện:** Xem lịch sinh hoạt, gala và đăng ký vé tham dự.\n- 🛍️ **Chợ B2B & Sàn Cơ hội:** Đăng tải sản phẩm và kết nối cung cầu giao thương.\n- 💳 **Hội phí & Thẻ NFC:** Tra cứu niên liễm MB Bank 1983000000 và chạm danh thiếp số.\n\n👉 *Quý Anh/Chị muốn mở tính năng nào, chỉ cần nói hoặc gõ: "Mở danh bạ", "Vào sự kiện" hoặc "Chợ B2B" nhé!*`;
    const speechText = `Dạ em chưa tìm thấy dữ liệu cho yêu cầu "${rawPrompt}". Quý anh chị có thể thử tìm trong Danh bạ, Lịch sự kiện hoặc Chợ B2B nhé ạ!`;

    return {
      answer,
      speechText,
      intent: 'chat',
      provider: 'ceo1983-smart-engine',
      model: 'dynamic-fallback-v2',
    };
  }

  /**
   * Hỏi đáp Trợ lý AI bằng giọng nói (Voice Audio Processing):
   * Tiếp nhận file audio base64, sử dụng Gemini 2.0 Multimodal Audio nếu có key,
   * hoặc phân tích âm thanh và chuyển tiếp về bộ não hội thoại người thật.
   */
  async askVoiceAssistant(
    userId: string,
    audioBase64?: string,
    mimeType?: string,
    prompt?: string,
    clientContext?: any,
  ): Promise<{
    userSpeech: string;
    answer: string;
    speechText: string;
    intent: 'chat' | 'query_data' | 'start_tour' | 'feature_guide';
    tourId?: string;
    route?: string;
    featureName?: string;
    suggestTour?: boolean;
    dynamicData?: any;
    provider: string;
    model: string;
  }> {
    const context = await this.getLiveMemberAssistantContext(userId);

    // 1. Kiểm tra API Key của Google Gemini
    let geminiKey = process.env.GEMINI_API_KEY || null;
    if (!geminiKey) {
      const setting = await this.prisma.$queryRaw<{ value: unknown }[]>`
        SELECT value FROM public.app_settings WHERE key = 'gemini_api_key' LIMIT 1
      `.catch(() => [] as { value: unknown }[]);
      const val = setting[0]?.value as { key?: string; apiKey?: string } | string | null;
      if (typeof val === 'string') geminiKey = val;
      else if (val && typeof val === 'object') geminiKey = val.key || val.apiKey || null;
    }

    // Nếu có file Audio Base64 và có Gemini Key -> Phân tích giọng nói trực tiếp qua Gemini Multimodal
    if (audioBase64 && geminiKey) {
      try {
        const sysPrompt = `Bạn là Trợ lý AI Điều Hành CLB Doanh Nhân CEO 1983 (HanoiBA).
Nhiệm vụ của bạn:
1. Hãy lắng nghe đoạn ghi âm giọng nói tiếng Việt được cung cấp và chuyển thành văn bản chính xác nhất vào trường "userSpeech".
2. Trả lời câu hỏi một cách thông minh, ấm áp, lịch thiệp, phong cách người thật xưng 'Em' gọi 'Quý Anh/Chị' ${context.user.name}.
3. Tận dụng dữ liệu thời gian thực của hội viên: Tên ${context.user.name}, Công ty ${context.user.company}, Cấp bậc ${context.user.level}, Trạng thái hội phí ${context.dues.feePaid ? 'Đã đóng' : 'Chưa đóng'}.
4. Trả về JSON theo định dạng:
{
  "userSpeech": "câu nói của hội viên nhận diện được",
  "answer": "nội dung câu trả lời chi tiết định dạng markdown đẹp",
  "speechText": "câu đọc ngắn gọn truyền cảm để phát âm qua loa",
  "intent": "chat" | "query_data" | "feature_guide" | "start_tour",
  "suggestTour": boolean,
  "tourId": "id tour nếu có",
  "route": "route đích nếu có",
  "featureName": "tên tính năng nếu có"
}`;

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    { text: sysPrompt },
                    {
                      inlineData: {
                        mimeType: mimeType || 'audio/webm',
                        data: audioBase64,
                      },
                    },
                  ],
                },
              ],
              generationConfig: {
                temperature: 0.2,
                responseMimeType: 'application/json',
              },
            }),
          },
        );

        if (geminiRes.ok) {
          const rawData = await geminiRes.json();
          const jsonText = rawData?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (jsonText) {
            const parsed = JSON.parse(jsonText);
            return {
              userSpeech: parsed.userSpeech || 'Giọng nói hội viên',
              answer: parsed.answer || '',
              speechText: parsed.speechText || parsed.answer || '',
              intent: parsed.intent || 'chat',
              tourId: parsed.tourId || undefined,
              route: parsed.route || undefined,
              featureName: parsed.featureName || undefined,
              suggestTour: Boolean(parsed.suggestTour || parsed.intent === 'feature_guide'),
              dynamicData: context,
              provider: 'gemini-multimodal-voice',
              model: 'gemini-2.0-flash',
            };
          }
        }
      } catch (err: any) {
        console.warn('[AiService] Voice multimodal Gemini error:', err?.message);
      }
    }

    // 2. Nếu có text prompt đi kèm từ frontend hoặc fallback
    const effectivePrompt = prompt && prompt.trim().length > 0 ? prompt.trim() : 'Chào em, hôm nay có gì mới?';
    const textRes = await this.askAssistant(userId, effectivePrompt, clientContext);

    return {
      userSpeech: effectivePrompt,
      ...textRes,
    };
  }
}

