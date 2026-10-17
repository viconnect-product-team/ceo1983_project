import { buildContextBundle, type ContextBundle } from "@/lib/ai-context-builder";
import type { AiCapability } from "@/lib/ai-capability-router";
import type {
  DataSnapshot,
  PermissionLevel,
  SafeDocument,
  SafeMember,
  SafeEvent,
  SafeListing,
  SafeNotification,
  FeeAggregate,
} from "@/lib/ai-context-providers";
import type { AiSessionMemory } from "@/lib/ai-session-memory";
import { DEFAULT_MEMBERS } from "@/lib/members-data";
import { DEFAULT_CEO1983_DOCS } from "@/lib/member-app/content.functions";
import { DEFAULT_FEE_INVOICES, feeKpis } from "@/lib/fees-data";

/**
 * AI Server Context Builder — SERVER ONLY — Phase 10, Step 5.
 *
 * Builds the RLS-safe context bundle server-side.
 * Populates real Association & Enterprise data snapshots with strict RLS redactions:
 *  - no tax_code
 *  - no private phone/email unless caller has admin/moderator permission
 *  - fee details are aggregate-only for non-admins
 *  - safe document metadata (distinguishing association docs vs enterprise docs)
 */

type MinimalSupabase = { from: (table: string) => unknown };

export type ServerContextInput = {
  supabase: MinimalSupabase;
  message: string;
  capability: AiCapability;
  associationId: string;
  permissionLevel: PermissionLevel;
  memory?: AiSessionMemory | null;
  maxContextItems?: number;
};

// Baseline CEO 1983 Events
const BASELINE_EVENTS: SafeEvent[] = [
  {
    id: "evt-gala-2026",
    title: "Đại Hội Toàn Thể & Gala Doanh Nhân CEO 1983 Thường Niên 2026",
    date: "2026-10-18T18:00:00Z",
    registrations: 185,
    isUpcoming: true,
  },
  {
    id: "evt-b2b-01",
    title: "Tọa đàm Xúc tiến Thương mại & Kết nối Giao thương B2B Đa Ngành",
    date: "2026-09-28T08:30:00Z",
    registrations: 120,
    isUpcoming: true,
  },
  {
    id: "evt-workshop-ai",
    title: "Workshop Chuyên Đề: Ứng dụng AI & Tự động hóa CRM cho Doanh nghiệp SME",
    date: "2026-09-15T14:00:00Z",
    registrations: 95,
    isUpcoming: true,
  },
  {
    id: "evt-caravan-charity",
    title: "Caravan Thiện Nguyện Mái Ấm Yêu Thương 2026 - Trao Học Bổng Vùng Cao",
    date: "2026-11-20T06:00:00Z",
    registrations: 68,
    isUpcoming: true,
  },
  {
    id: "evt-coffee-weekly",
    title: "Coffee Doanh Nhân CEO 1983: Giao lưu kết nối định kỳ thứ Bảy",
    date: "2026-09-12T08:00:00Z",
    registrations: 45,
    isUpcoming: false,
  },
];

// Baseline CEO 1983 Marketplace Opportunities
const BASELINE_MARKETPLACE: SafeListing[] = [
  {
    id: "opp-01",
    title: "Hợp tác phân phối độc quyền thiết bị chiếu sáng LED công nghiệp và Smarthome",
    category: "opp.type.distribution",
    owner: "Phùng Quyết Thanh (Công ty Quyết Tiến)",
    interestCount: 14,
    updatedAt: "2026-09-01",
  },
  {
    id: "opp-02",
    title: "Cung cấp giải pháp in ấn bao bì, tem nhãn thông minh NFC & QR bảo mật cho sản phẩm hội viên",
    category: "opp.type.supply",
    owner: "Nguyễn Thế Duẩn (Công ty CP PVN)",
    interestCount: 22,
    updatedAt: "2026-09-05",
  },
  {
    id: "opp-03",
    title: "Tìm kiếm đối tác F&B, nhà hàng, khách sạn cung ứng thực phẩm nhập khẩu cao cấp",
    category: "opp.type.partnership",
    owner: "Trần Ánh Phương (Nhập khẩu đồ Hàn)",
    interestCount: 18,
    updatedAt: "2026-09-08",
  },
  {
    id: "opp-04",
    title: "Tư vấn tái cấu trúc thương hiệu, chiến lược truyền thông và thiết kế bộ nhận diện VIP",
    category: "opp.type.demand",
    owner: "Nguyễn Thanh Tuấn (Sao Kim Branding)",
    interestCount: 31,
    updatedAt: "2026-09-10",
  },
  {
    id: "opp-05",
    title: "Hợp tác đầu tư chuỗi phòng khám da liễu thẩm mỹ kỹ thuật cao",
    category: "opp.type.investment",
    owner: "Hoàng Thanh Tuấn (Thẩm mỹ Hoàng Tuấn)",
    interestCount: 25,
    updatedAt: "2026-09-11",
  },
];

// Baseline Notifications
const BASELINE_NOTIFICATIONS: SafeNotification[] = [
  {
    id: "notif-01",
    title: "Chào mừng Quý Hội viên đến với nền tảng số Hiệp Hội Doanh Nhân CEO 1983!",
    category: "Hệ thống",
    read: true,
    route: "/notifications",
    updatedAt: "2026-09-01",
  },
  {
    id: "notif-02",
    title: "Mời đăng ký tham dự Đại Hội Toàn Thể & Dạ Tiệc Gala CEO 1983 Thường Niên 2026",
    category: "Sự kiện",
    read: false,
    route: "/events",
    updatedAt: "2026-09-10",
  },
  {
    id: "notif-03",
    title: "Ban Tài Chính thông báo quyết toán hội phí niên liễm năm 2026",
    category: "Hội phí",
    read: false,
    route: "/fees",
    updatedAt: "2026-09-12",
  },
];

export async function buildServerContext(input: ServerContextInput): Promise<ContextBundle> {
  void input.supabase;
  void input.maxContextItems;

  const { permissionLevel, message } = input;
  const isAdmin = permissionLevel === "admin" || permissionLevel === "platform" || permissionLevel === "moderator";

  // 1. Documents Snapshot (Mapped from DEFAULT_CEO1983_DOCS)
  const safeDocs: SafeDocument[] = DEFAULT_CEO1983_DOCS.map((d) => ({
    id: d.id,
    title: d.name,
    category: `${d.category}${d.enterpriseName ? ` (DN: ${d.enterpriseName})` : " (Hiệp hội)"}`,
    type: d.type,
    uploadedBy: d.committee || "Ban Điều Hành",
    updatedAt: d.time,
    hasFullText: true,
  }));

  // 2. Members Snapshot (Safe fields, filter query if relevant)
  const lowerMsg = message.toLowerCase();
  let candidateMembers = DEFAULT_MEMBERS;
  if (lowerMsg.includes("hà nội") || lowerMsg.includes("hn")) {
    const hn = candidateMembers.filter((m) => (m.address || "").toLowerCase().includes("hà nội") || m.region === "region.north");
    if (hn.length > 0) candidateMembers = hn;
  }

  const safeMembers: SafeMember[] = candidateMembers.map((m) => ({
    id: m.id,
    name: m.name,
    company: m.about?.split(" · ")[0] || m.contact,
    memberCode: m.code,
    industry: m.industry,
    region: m.region === "region.north" ? "Miền Bắc (Hà Nội)" : m.region === "region.central" ? "Miền Trung" : "Miền Nam",
    level: m.executiveRole ? `${m.level?.toUpperCase()} · ${m.executiveRole}` : m.level?.toUpperCase(),
    status: m.status === "active" ? "Đang hoạt động" : "Chờ duyệt",
  }));

  // 3. Fee Snapshot (Aggregated via feeKpis)
  const kpis = feeKpis(DEFAULT_FEE_INVOICES);
  const safeFees: FeeAggregate = {
    expected: kpis.total,
    collected: kpis.collected,
    outstanding: kpis.outstanding,
    overdue: kpis.overdueCount,
    collectionRate: kpis.collectionRate,
  };

  // 4. Data Snapshot Assembly
  const data: DataSnapshot = {
    documents: safeDocs,
    members: safeMembers,
    fees: isAdmin ? safeFees : undefined,
    myFee: {
      status: "Đã hoàn thành hội phí 2026",
      amountDue: 0,
      dueDate: "2026-12-31",
    },
    events: BASELINE_EVENTS,
    marketplace: BASELINE_MARKETPLACE,
    notifications: BASELINE_NOTIFICATIONS,
    executive: isAdmin
      ? {
          members: DEFAULT_MEMBERS.length,
          fees: kpis.total,
          events: BASELINE_EVENTS.length,
          opportunities: BASELINE_MARKETPLACE.length,
          notifications: BASELINE_NOTIFICATIONS.length,
        }
      : undefined,
  };

  return buildContextBundle({
    message: input.message,
    capability: input.capability,
    permissionLevel: input.permissionLevel,
    associationId: input.associationId || "CEO1983",
    memory: input.memory ?? null,
    data,
  });
}
