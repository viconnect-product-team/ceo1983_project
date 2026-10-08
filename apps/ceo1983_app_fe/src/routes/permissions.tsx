import { useState, useMemo, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  ShieldCheck,
  Users,
  Layers,
  Lock,
  Sparkles,
  RefreshCw,
  Building2,
  Info,
  CheckCircle2,
  LayoutDashboard,
  Grid3X3,
  SlidersHorizontal,
  Crown,
  Award,
  Calendar,
  Send,
  HeartHandshake,
  TrendingUp,
} from "lucide-react";
import { AppShell } from "@/components/dashboard/AppShell";
import { Card, PageHeader } from "@/components/dashboard/PageKit";
import { useRole } from "@/hooks/use-role";
import { useServerData } from "@/hooks/use-server-data";
import { listMembersFn, updateMemberRoleAndDeptFn } from "@/lib/members.functions";
import { useServerFn } from "@tanstack/react-start";
import { RbacPermissionMatrix } from "@/components/dashboard/RbacPermissionMatrix";
import { CommitteesPermissionManager } from "@/components/dashboard/CommitteesPermissionManager";
import { MemberPermissionsByCommittee } from "@/components/dashboard/MemberPermissionsByCommittee";
import { dispatchPermissionSyncEvent } from "@/lib/rbac-permission-helpers";

export const Route = createFileRoute("/permissions")({
  component: PermissionsPage,
});

export const ROLE_OPTIONS = [
  { value: "quan_tri", label: "Quản trị", desc: "Toàn quyền quản trị hệ thống và điều hành" },
  { value: "admin", label: "Admin", desc: "Quản lý dữ liệu hội viên, tài chính và sự kiện" },
  { value: "tong_thu_ky", label: "Tổng thư ký", desc: "Điều phối cuộc họp, ban hành tài liệu và biểu quyết" },
  { value: "truong_ban", label: "Trưởng ban", desc: "Quản trị nghiệp vụ theo ban chuyên trách" },
  { value: "member", label: "Thành viên", desc: "Hội viên chính thức tiêu chuẩn" },
];

export function normalizeRole(r?: string): string {
  if (!r) return "member";
  const s = r.toLowerCase().trim();
  if (
    s === "quan_tri" ||
    s === "platform_admin" ||
    s === "superadmin" ||
    s.includes("hệ thống") ||
    s === "quản trị"
  )
    return "quan_tri";
  if (s === "admin" || s === "adm" || s.includes("chủ tịch") || s === "bqt") return "admin";
  if (s.includes("tổng thư ký") || s.includes("tong_thu_ky") || s === "ttk" || s.includes("thu_ky"))
    return "tong_thu_ky";
  if (
    s.startsWith("trưởng ban") ||
    s.startsWith("truong_ban") ||
    s.startsWith("phó ban") ||
    s.startsWith("pho_ban") ||
    s === "truong_ban"
  )
    return "truong_ban";
  return "member";
}

export const DEPARTMENT_OPTIONS = [
  "Ban Thành viên",
  "Ban xúc tiến",
  "Ban thiện nguyện",
  "Ban truyền thông",
  "Ban quản trị",
  "Ban tài chính",
  "Hội viên ceo1983",
];

export function normalizeDept(d?: string): string {
  if (!d) return "Hội viên ceo1983";
  const s = d.toLowerCase().trim();
  if (s.includes("thành viên") && !s.includes("hội viên") && !s.includes("ceo")) return "Ban Thành viên";
  if (s.includes("xúc tiến") || s.includes("thương mại") || s.includes("b2b")) return "Ban xúc tiến";
  if (s.includes("thiện nguyện") || s.includes("an sinh") || s.includes("tấm lòng vàng")) return "Ban thiện nguyện";
  if (s.includes("truyền thông") || s.includes("sự kiện") || s.includes("báo chí")) return "Ban truyền thông";
  if (s.includes("quản trị") || s.includes("điều hành") || s.includes("bqt")) return "Ban quản trị";
  if (s.includes("tài chính") || s.includes("ngân sách") || s.includes("thu chi") || s.includes("thư ký")) return "Ban tài chính";
  return "Hội viên ceo1983";
}

export const ASSOCIATION_OPTIONS: { id: string; name: string; shortName: string }[] = [
  { id: "c1983000-0000-4000-8000-000000001983", name: "CLB Doanh Nhân CEO 1983", shortName: "CEO 1983" },
  { id: "hanoiba-0000-4000-8000-000000000001", name: "Hội Doanh Nghiệp Trẻ Hà Nội (HanoiBA)", shortName: "HanoiBA" },
];

export interface AppraisalUnit {
  id: string;
  code: string;
  name: string;
  leadership: string;
  scope: string;
  permissions: string[];
  status: "active" | "inactive";
  updatedAt: string;
}

export const DEFAULT_APPRAISAL_UNITS: AppraisalUnit[] = [
  {
    id: "ban-01",
    code: "BAN-TV",
    name: "Ban Thành viên",
    leadership: "Nguyễn Văn Cường (Trưởng ban)",
    scope: "Phát triển hội viên mới, tiếp nhận hồ sơ gia nhập, thẩm định năng lực và quản lý mã hội viên",
    permissions: [
      "Thẩm định điều kiện kết nạp hội viên mới",
      "Thẩm định hồ sơ gia hạn hội viên định kỳ",
      "Đề xuất khen thưởng hoặc xử lý vi phạm hội viên",
    ],
    status: "active",
    updatedAt: "2026-10-07",
  },
  {
    id: "ban-02",
    code: "BAN-XT",
    name: "Ban xúc tiến",
    leadership: "Hoàng Minh Tuấn (Trưởng ban)",
    scope: "Khởi tạo cơ hội giao thương B2B, gian hàng marketplace, matching 1-on-1 và kết nối hợp đồng",
    permissions: [
      "Thẩm định tính xác thực sản phẩm gian hàng B2B",
      "Điều phối các cuộc hẹn kết nối giao thương 1-on-1",
      "Theo dõi và báo cáo giá trị hợp đồng giao thương",
    ],
    status: "active",
    updatedAt: "2026-10-07",
  },
  {
    id: "ban-03",
    code: "BAN-TN",
    name: "Ban thiện nguyện",
    leadership: "Vũ Thu Trang (Trưởng ban)",
    scope: "Tổ chức chương trình thiện nguyện, quản lý quỹ tấm lòng vàng và hoạt động an sinh xã hội",
    permissions: [
      "Thẩm định đối tượng tiếp nhận hỗ trợ thiện nguyện",
      "Giám sát tính minh bạch thu chi quỹ thiện nguyện",
      "Lập kế hoạch và tổng kết các chuyến thiện nguyện",
    ],
    status: "active",
    updatedAt: "2026-10-07",
  },
  {
    id: "ban-04",
    code: "BAN-TT",
    name: "Ban truyền thông",
    leadership: "Phạm Quang Huy (Trưởng ban)",
    scope: "Quản lý cổng tin tức, thông báo đẩy, hình ảnh thương hiệu CEO 1983 và truyền thông sự kiện",
    permissions: [
      "Kiểm duyệt tin tức, hình ảnh trước khi xuất bản",
      "Thẩm định tài liệu truyền thông và quyền lợi tài trợ",
      "Quản lý thông báo push in-app và email marketing",
    ],
    status: "active",
    updatedAt: "2026-10-07",
  },
  {
    id: "ban-05",
    code: "BAN-QT",
    name: "Ban quản trị",
    leadership: "Lê Văn Hùng (Trưởng ban)",
    scope: "Hoạch định chiến lược, chỉ đạo điều hành toàn bộ hoạt động hiệp hội và đối ngoại cấp cao",
    permissions: [
      "Thẩm định định hướng phát triển chiến lược",
      "Phê duyệt bổ nhiệm nhân sự Ban chấp hành",
      "Phê duyệt các dự án hợp tác quy mô lớn",
    ],
    status: "active",
    updatedAt: "2026-10-07",
  },
  {
    id: "ban-06",
    code: "BAN-TC",
    name: "Ban tài chính",
    leadership: "Trần Anh Tuấn (Trưởng ban)",
    scope: "Quản lý tài chính, thẩm định thu chi, ngân sách hoạt động và báo cáo tài chính định kỳ",
    permissions: [
      "Thẩm định tính hợp lý và cân đối thu chi tài chính",
      "Thẩm định và giám sát kế hoạch ngân sách sự kiện",
      "Kiểm toán nội bộ và báo cáo tài chính định kỳ",
    ],
    status: "active",
    updatedAt: "2026-10-07",
  },
];

function PermissionsPage() {
  const { isPlatformAdmin, isBQT, isAdmin, srsRole, loading } = useRole();
  const hasAccess = isPlatformAdmin || isBQT || isAdmin || srsRole === "BQT" || srsRole === "ADM";

  // Account operations data
  const fetchMembers = useServerFn(listMembersFn);
  const { data: members, loading: loadingMembers, reload: reloadMembers } = useServerData<any[]>(
    () => fetchMembers(),
    [],
  );
  const updateRoleDept = useServerFn(updateMemberRoleAndDeptFn);

  // QUY TẮC BẮT BUỘC 1: Tài khoản chưa được duyệt tuyệt đối không xuất hiện trong phân quyền
  const approvedMembers = useMemo(() => {
    if (!Array.isArray(members)) return [];
    return members.filter((m: any) => {
      const s = String(m?.status || "").toLowerCase().trim();
      if (s === "pending" || s === "pending_approval" || s === "rejected" || s === "inactive") {
        return false;
      }
      return s === "active" || s === "approved" || m?.verified === true || !s;
    });
  }, [members]);

  const totalMembersCount = approvedMembers.length;

  // QUY TẮC BẮT BUỘC 2: Có đủ 2 dạng hiển thị: Dạng Dashboard và Dạng Lưới
  const [viewMode, setViewModeState] = useState<"dashboard" | "grid">(() => {
    if (typeof window !== "undefined") {
      const p = new URLSearchParams(window.location.search).get("view");
      if (p === "grid" || p === "dashboard") return p;
      const tab = new URLSearchParams(window.location.search).get("tab");
      if (tab === "matrix") return "grid";
    }
    return "dashboard";
  });

  const setViewMode = (mode: "dashboard" | "grid") => {
    setViewModeState(mode);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("view", mode);
      if (mode === "grid") {
        url.searchParams.set("tab", "matrix");
      }
      window.history.replaceState({}, "", url.toString());
    }
  };

  // Tab switcher with URL query sync (?tab=matrix | ?tab=committees | ?tab=members)
  const [activeTab, setActiveTabState] = useState<"matrix" | "committees" | "members">(() => {
    if (typeof window !== "undefined") {
      const p = new URLSearchParams(window.location.search).get("tab");
      if (p === "matrix" || p === "committees" || p === "members") return p;
      if (p === "role_groups") return "committees";
      if (p === "user_actions") return "members";
    }
    return "matrix";
  });

  const setActiveTab = (tab: "matrix" | "committees" | "members") => {
    setActiveTabState(tab);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", tab);
      window.history.replaceState({}, "", url.toString());
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const checkState = () => {
      const sp = new URLSearchParams(window.location.search);
      const v = sp.get("view");
      if (v === "grid" || v === "dashboard") {
        setViewModeState(v);
      }
      const t = sp.get("tab");
      if (t === "matrix" || t === "committees" || t === "members") {
        setActiveTabState(t);
      }
    };
    checkState();
    window.addEventListener("popstate", checkState);
    return () => window.removeEventListener("popstate", checkState);
  }, []);

  // Đếm số lượng hội viên theo từng ban (chỉ tính tài khoản đã duyệt)
  const committeeCounts = useMemo(() => {
    const counts: Record<string, number> = {
      "Ban Quản trị": 0,
      "Ban Thư ký": 0,
      "Ban Thành viên": 0,
      "Ban xúc tiến": 0,
      "Ban truyền thông": 0,
      "Ban thiện nguyện": 0,
      "Ban tài chính": 0,
      "Hội viên ceo1983": 0,
    };
    approvedMembers.forEach((m) => {
      const dept = normalizeDept(m.department);
      if (counts[dept] !== undefined) counts[dept]++;
      else counts["Hội viên ceo1983"]++;
    });
    return counts;
  }, [approvedMembers]);

  // Rule 3: Hide completely if not permitted
  if (!loading && !hasAccess) {
    return (
      <AppShell>
        <div className="p-8">
          <Card className="p-10 text-center text-sm text-muted-foreground">
            <Lock className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
            <h3 className="text-base font-bold text-foreground mb-1">Không có quyền truy cập</h3>
            <p>Bạn không có quyền quản trị để xem hoặc cấu hình phân quyền hệ thống.</p>
          </Card>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <PageHeader
          title="Hệ Thống Phân Quyền & Quản Trị Thao Tác (CRM Hiệp Hội CEO 1983)"
          subtitle="Liên kết 3 phân hệ thời gian thực: Ma Trận Vai Trò ↔ Thẩm Quyền 6 Ban Chuyên Môn ↔ Phân Quyền Tài Khoản Theo Ban"
        />

        {/* Real-time synchronization notice banner */}
        <div className="rounded-2xl border border-blue-500/20 bg-gradient-to-r from-blue-500/10 via-indigo-500/5 to-transparent p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#003B95] text-white flex items-center justify-center shrink-0 shadow-sm">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-foreground">
                Đồng Bộ 2 Chiều Chuẩn Xác &amp; Lưu RESTful API Vào Database
              </p>
              <p className="text-muted-foreground text-[11px] mt-0.5">
                Chỉnh sửa xong quyền bấm nút "Lưu Vào Database" để gửi RESTful API cập nhật CSDL. Các nút hành động (Thêm, Sửa, Xóa, Duyệt) trong toàn bộ CRM sẽ tự động ẩn đi đối với tài khoản không có quyền.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              RESTful Database Sync
            </span>
          </div>
        </div>

        {/* ── BỘ CHUYỂN ĐỔI 2 DẠNG: DẠNG DASHBOARD VÀ DẠNG LƯỚI (MATRIX) ── */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-2 rounded-2xl border border-border bg-card shadow-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode("dashboard")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer ${
                viewMode === "dashboard"
                  ? "bg-[#003B95] text-white shadow-sm"
                  : "bg-secondary/60 text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Dạng Dashboard (Tổng Quan 6 Ban &amp; Hội Viên)</span>
            </button>

            <button
              onClick={() => setViewMode("grid")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer ${
                viewMode === "grid"
                  ? "bg-[#003B95] text-white shadow-sm"
                  : "bg-secondary/60 text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <Grid3X3 className="h-4 w-4" />
              <span>Dạng Lưới (Ma Trận Phân Quyền)</span>
            </button>
          </div>

          <div className="text-xs text-muted-foreground flex items-center gap-2 px-2">
            <Users className="h-3.5 w-3.5 text-primary" />
            <span>
              <strong>{totalMembersCount}</strong> tài khoản chính thức đã duyệt (được phép phân quyền)
            </span>
          </div>
        </div>

        {/* ── HIỂN THỊ DẠNG DASHBOARD ── */}
        {viewMode === "dashboard" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* 4 KPIs Dashboard */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl border border-border bg-card shadow-xs flex items-center gap-3">
                <div className="h-11 w-11 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-muted-foreground">Tài Khoản Đã Duyệt</div>
                  <div className="text-xl font-black text-foreground">{totalMembersCount} Hội viên</div>
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-border bg-card shadow-xs flex items-center gap-3">
                <div className="h-11 w-11 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                  <Layers className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-muted-foreground">Ban Chuyên Môn</div>
                  <div className="text-xl font-black text-foreground">6 Ban Cốt Lõi</div>
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-border bg-card shadow-xs flex items-center gap-3">
                <div className="h-11 w-11 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-muted-foreground">Phân Hệ Nghiệp Vụ</div>
                  <div className="text-xl font-black text-foreground">8 Nhóm Quyền Hạn</div>
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-border bg-card shadow-xs flex items-center gap-3">
                <div className="h-11 w-11 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <SlidersHorizontal className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-muted-foreground">Phương Thức Lưu</div>
                  <div className="text-xl font-black text-foreground">RESTful API</div>
                </div>
              </div>
            </div>

            {/* 6 Committees Cards Board */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-primary" />
                    <span>Thẩm Quyền 6 Ban Chuyên Môn Hiệp Hội</span>
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Mỗi ban có trưởng ban phụ trách và thẩm quyền chuyên môn riêng biệt
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {DEFAULT_APPRAISAL_UNITS.map((unit) => {
                  const mCount = committeeCounts[unit.name] || 0;
                  return (
                    <div
                      key={unit.id}
                      className="p-4 rounded-2xl border border-border bg-card hover:border-primary/40 transition flex flex-col justify-between shadow-xs"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-secondary text-primary">
                            {unit.code}
                          </span>
                          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">
                            {mCount} tài khoản
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-foreground mb-1">{unit.name}</h4>
                        <div className="text-xs text-primary font-semibold mb-2">{unit.leadership}</div>
                        <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2 mb-3">
                          {unit.scope}
                        </p>
                        <div className="space-y-1 border-t border-border/60 pt-2">
                          {unit.permissions.slice(0, 2).map((p, idx) => (
                            <div key={idx} className="flex items-center gap-1.5 text-[10.5px] text-muted-foreground">
                              <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                              <span className="truncate">{p}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Phân Hệ Quản Lý Tài Khoản Hội Viên Đã Duyệt */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary" />
                    <span>Phân Quyền Chi Tiết Từng Tài Khoản Theo Ban (Chỉ Tài Khoản Đã Duyệt)</span>
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Điều chỉnh vai trò, ban chuyên môn và ghi đè thẩm quyền thao tác. Bấm "Lưu Vào Database" để gửi RESTful API.
                  </p>
                </div>
              </div>

              <MemberPermissionsByCommittee
                members={approvedMembers}
                loading={loadingMembers}
                onUpdateRoleDept={async (payload) => {
                  const res = await updateRoleDept({ data: payload });
                  if (res && (res as any).ok) {
                    reloadMembers();
                  }
                  return res;
                }}
              />
            </div>
          </div>
        )}

        {/* ── HIỂN THỊ DẠNG LƯỚI (MATRIX GRID) ── */}
        {viewMode === "grid" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* 3 Main Sub-Tabs Switcher for Grid Exploration */}
            <div className="flex flex-wrap items-center gap-2.5 border-b border-border/80 pb-3">
              <button
                onClick={() => setActiveTab("matrix")}
                className={`flex items-center gap-2 rounded-2xl px-4 py-2 text-xs font-bold transition cursor-pointer ${
                  activeTab === "matrix"
                    ? "bg-[#003B95] text-white shadow-sm"
                    : "bg-card text-muted-foreground border border-border hover:bg-secondary hover:text-foreground"
                }`}
              >
                <ShieldCheck className="h-4 w-4" />
                <span>1. Ma Trận Quyền 8 Phân Hệ x 5 Vai Trò</span>
              </button>

              <button
                onClick={() => setActiveTab("committees")}
                className={`flex items-center gap-2 rounded-2xl px-4 py-2 text-xs font-bold transition cursor-pointer ${
                  activeTab === "committees"
                    ? "bg-[#003B95] text-white shadow-sm"
                    : "bg-card text-muted-foreground border border-border hover:bg-secondary hover:text-foreground"
                }`}
              >
                <Layers className="h-4 w-4" />
                <span>2. Thẩm Quyền 6 Ban Chuyên Môn</span>
              </button>

              <button
                onClick={() => setActiveTab("members")}
                className={`flex items-center gap-2 rounded-2xl px-4 py-2 text-xs font-bold transition cursor-pointer ${
                  activeTab === "members"
                    ? "bg-[#003B95] text-white shadow-sm"
                    : "bg-card text-muted-foreground border border-border hover:bg-secondary hover:text-foreground"
                }`}
              >
                <Users className="h-4 w-4" />
                <span>3. Phân Quyền Tài Khoản ({totalMembersCount} Đã Duyệt)</span>
              </button>
            </div>

            {/* TAB 1: Ma Trận Phân Quyền Vai Trò & Ban */}
            {activeTab === "matrix" && (
              <div className="space-y-4">
                <RbacPermissionMatrix />
              </div>
            )}

            {/* TAB 2: Thẩm Quyền 6 Ban Chuyên Môn */}
            {activeTab === "committees" && (
              <div className="space-y-4">
                <CommitteesPermissionManager
                  onMatrixChanged={() => {
                    dispatchPermissionSyncEvent();
                  }}
                />
              </div>
            )}

            {/* TAB 3: Phân Quyền Tài Khoản Theo Ban */}
            {activeTab === "members" && (
              <div className="space-y-4">
                <MemberPermissionsByCommittee
                  members={approvedMembers}
                  loading={loadingMembers}
                  onUpdateRoleDept={async (payload) => {
                    const res = await updateRoleDept({ data: payload });
                    if (res && (res as any).ok) {
                      reloadMembers();
                    }
                    return res;
                  }}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
