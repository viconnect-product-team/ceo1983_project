import { useState, useMemo, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  ShieldCheck,
  Users,
  Save,
  RefreshCw,
  Search,
  Eye,
  Pencil,
  X,
  RotateCcw,
  Building2,
  CheckCircle2,
  Layers,
  Info,
  Lock,
  Plus,
  Trash2,
  AlertTriangle,
  SlidersHorizontal,
} from "lucide-react";
import { AppShell } from "@/components/dashboard/AppShell";
import { Card, PageHeader } from "@/components/dashboard/PageKit";
import { useRole } from "@/hooks/use-role";
import { useT } from "@/lib/i18n";
import { useServerData } from "@/hooks/use-server-data";
import { listMembersFn, updateMemberRoleAndDeptFn } from "@/lib/members.functions";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { useTableControls } from "@/hooks/use-table-controls";
import { Pagination, SortHeader } from "@/components/dashboard/DataTablePagination";
import { RbacPermissionMatrix } from "@/components/dashboard/RbacPermissionMatrix";

export const Route = createFileRoute("/permissions")({
  component: PermissionsPage,
});

export const ROLE_OPTIONS = [
  { value: "quan_tri", label: "Quản trị cấp cao", desc: "Toàn quyền quản trị hệ thống và điều hành" },
  { value: "admin", label: "Admin điều hành", desc: "Quản lý dữ liệu hội viên, tài chính và sự kiện" },
  { value: "tong_thu_ky", label: "Tổng thư ký", desc: "Điều phối cuộc họp, ban hành tài liệu và biểu quyết" },
  { value: "truong_ban", label: "Trưởng ban chuyên môn", desc: "Quản trị nghiệp vụ theo ban chuyên trách" },
  { value: "member", label: "Thành viên hội viên", desc: "Quyền hội viên chính thức tiêu chuẩn" },
];

export function normalizeRole(r?: string): string {
  if (!r) return "member";
  const s = r.toLowerCase().trim();
  if (s === "quan_tri" || s === "platform_admin" || s === "superadmin" || s.includes("hệ thống") || s === "quản trị") return "quan_tri";
  if (s === "admin" || s === "adm" || s.includes("chủ tịch") || s === "bqt") return "admin";
  if (s.includes("tổng thư ký") || s.includes("tong_thu_ky") || s === "ttk" || s.includes("thu_ky")) return "tong_thu_ky";
  if (s.startsWith("trưởng ban") || s.startsWith("truong_ban") || s.startsWith("phó ban") || s.startsWith("pho_ban") || s === "truong_ban") return "truong_ban";
  return "member";
}

export const DEPARTMENT_OPTIONS = [
  "Ban Quản trị",
  "Ban Thư ký",
  "Ban Truyền thông",
  "Ban Xúc tiến",
  "Ban Thành viên",
  "Ban Thiện nguyện",
  "Hội viên CEO 1983",
];

export function normalizeDept(d?: string): string {
  if (!d) return "Hội viên CEO 1983";
  const s = d.toLowerCase().trim();
  if (s.includes("quản trị") || s.includes("điều hành") || s.includes("công nghệ")) return "Ban Quản trị";
  if (s.includes("thư ký") || s.includes("điều phối")) return "Ban Thư ký";
  if (s.includes("truyền thông") || s.includes("sự kiện")) return "Ban Truyền thông";
  if (s.includes("xúc tiến") || s.includes("thương mại") || s.includes("b2b")) return "Ban Xúc tiến";
  if (s.includes("thành viên") && !s.includes("hội viên") && !s.includes("ceo")) return "Ban Thành viên";
  if (s.includes("thiện nguyện") || s.includes("tài chính") || s.includes("đào tạo") || s.includes("an sinh")) return "Ban Thiện nguyện";
  return "Hội viên CEO 1983";
}

export const ASSOCIATION_OPTIONS: { id: string; name: string; shortName: string }[] = [
  { id: "c1983000-0000-4000-8000-000000001983", name: "CLB Doanh Nhân CEO 1983", shortName: "CEO 1983" },
  { id: "hanoiba-0000-4000-8000-000000000001", name: "Hội Doanh Nghiệp Trẻ Hà Nội (HanoiBA)", shortName: "HanoiBA" },
];

const ROLE_PERMISSIONS_SUMMARY: Record<string, string[]> = {
  quan_tri: [
    "Toàn quyền quản trị hệ thống và người dùng",
    "Phân quyền thao tác và cấu hình vai trò",
    "Xem và xử lý toàn bộ hội phí, thu chi, tài trợ",
    "Tạo, sửa, xóa, duyệt sự kiện và xếp chỗ rạp chiếu",
    "Soạn thảo, gửi và quản lý template email CRM",
    "Truy cập audit log và quản lý giao diện",
  ],
  admin: [
    "Quản lý hồ sơ hội viên và xét duyệt gia hạn",
    "Quản lý hóa đơn hội phí và gửi nhắc nhở thanh toán",
    "Điều phối sự kiện, quản lý check-in và sơ đồ ghế",
    "Tạo và quản lý văn bản, tài liệu hiệp hội",
    "Quản lý nhà tài trợ và báo cáo tài trợ",
  ],
  tong_thu_ky: [
    "Tổ chức và điều phối cuộc họp BCH",
    "Quản lý tài liệu, nghị quyết và văn bản ký số",
    "Tạo và giám sát các phiên biểu quyết trực tuyến",
    "Theo dõi điểm danh và báo cáo hoạt động hội viên",
  ],
  truong_ban: [
    "Quản trị chuyên môn theo ban phụ trách",
    "Tạo sự kiện, tin tức và hoạt động nội bộ ban",
    "Xem danh sách và kết nối hội viên trong ban",
    "Gửi thông báo và khảo sát ý kiến thành viên",
  ],
  member: [
    "Xem hồ sơ cá nhân và danh bạ hội viên",
    "Đăng ký tham gia sự kiện và chọn ghế ngồi",
    "Xem lịch họp và kết quả biểu quyết công khai",
    "Tra cứu tài liệu hướng dẫn và thông báo hội phí",
    "Tham gia kết nối B2B và gian hàng marketplace",
  ],
};

export interface AppraisalUnit {
  id: string;
  type: "ban" | "cap";
  code: string;
  name: string;
  leadership: string;
  scope: string;
  level: number;
  permissions: string[];
  status: "active" | "inactive";
  updatedAt: string;
}

export const DEFAULT_APPRAISAL_UNITS: AppraisalUnit[] = [
  {
    id: "cap-01",
    type: "cap",
    code: "CAP-01",
    name: "Cấp 1 · Quản Trị Cấp Cao (Super Admin)",
    leadership: "Chủ tịch & Super Admin",
    scope: "Toàn quyền cấu hình hệ thống, bảo mật dữ liệu, phê duyệt phân quyền tối cao",
    level: 1,
    permissions: [
      "Toàn quyền thêm, sửa, xóa mọi danh mục và nghiệp vụ",
      "Bật/tắt ma trận phân quyền 5 cấp bậc",
      "Xem và xuất nhật ký kiểm toán hệ thống (Audit Log)",
      "Phê duyệt tối cao các quyết định của BCH",
    ],
    status: "active",
    updatedAt: "2026-10-03",
  },
  {
    id: "cap-02",
    type: "cap",
    code: "CAP-02",
    name: "Cấp 2 · Admin Điều Hành (BQT Thường Trực)",
    leadership: "Phó Chủ tịch & BQT Thường trực",
    scope: "Điều hành nghiệp vụ CRM, thẩm định hội viên mới, ký duyệt chi và tài trợ",
    level: 2,
    permissions: [
      "Phê duyệt kết nạp và xét duyệt gia hạn hội viên chính thức",
      "Ký duyệt phiếu thu, chi ngân quỹ hiệp hội",
      "Quản lý đối tác chiến lược và nhà tài trợ",
      "Tạo, duyệt và điều hành các sự kiện hiệp hội",
    ],
    status: "active",
    updatedAt: "2026-10-03",
  },
  {
    id: "cap-03",
    type: "cap",
    code: "CAP-03",
    name: "Cấp 3 · Tổng Thư Ký (Ban Thư Ký)",
    leadership: "Tổng thư ký Hiệp hội",
    scope: "Điều phối thư ký, tổ chức cuộc họp BCH, ban hành công văn & biểu quyết",
    level: 3,
    permissions: [
      "Khởi tạo và chủ trì cuộc họp toàn hiệp hội",
      "Ban hành nghị quyết, văn bản ký số và công văn chính thức",
      "Khởi tạo và giám sát các phiên biểu quyết trực tuyến",
      "Theo dõi điểm danh, chuyên cần và điều lệ hội viên",
    ],
    status: "active",
    updatedAt: "2026-10-03",
  },
  {
    id: "cap-04",
    type: "cap",
    code: "CAP-04",
    name: "Cấp 4 · Trưởng Ban Chuyên Môn",
    leadership: "Trưởng 6 ban chuyên môn",
    scope: "Quản trị nghiệp vụ theo ban chuyên trách (Thành viên, Xúc tiến, Truyền thông, Thiện nguyện...)",
    level: 4,
    permissions: [
      "Lập kế hoạch và thẩm định nghiệp vụ chuyên môn của ban",
      "Tổ chức sự kiện, cuộc họp và hoạt động nội bộ ban",
      "Đề xuất duyệt chi dự toán ngân sách hoạt động ban",
    ],
    status: "active",
    updatedAt: "2026-10-03",
  },
  {
    id: "cap-05",
    type: "cap",
    code: "CAP-05",
    name: "Cấp 5 · Thành Viên Hội Viên",
    leadership: "Hội viên tiêu chuẩn",
    scope: "Tham gia sinh hoạt, kết nối giao thương B2B và sử dụng nền tảng App Hiệp Hội",
    level: 5,
    permissions: [
      "Đăng ký tham gia sự kiện và chọn chỗ ngồi",
      "Đăng tin gian hàng giao thương B2B và hẹn gặp 1-on-1",
      "Biểu quyết và đóng góp ý kiến trong các sự kiện",
    ],
    status: "active",
    updatedAt: "2026-10-03",
  },
  {
    id: "ban-01",
    type: "ban",
    code: "BAN-01",
    name: "Ban Quản Trị",
    leadership: "Lê Văn Hùng (Trưởng ban QT)",
    scope: "Hoạch định chiến lược, chỉ đạo điều hành toàn bộ hoạt động hiệp hội và đối ngoại cấp cao",
    level: 1,
    permissions: [
      "Thẩm định định hướng phát triển chiến lược",
      "Phê duyệt bổ nhiệm nhân sự Ban chấp hành",
      "Phê duyệt các dự án hợp tác quy mô lớn",
    ],
    status: "active",
    updatedAt: "2026-10-03",
  },
  {
    id: "ban-02",
    type: "ban",
    code: "BAN-02",
    name: "Ban Thư Ký",
    leadership: "Lê Hoàng Long (Tổng thư ký)",
    scope: "Điều phối cuộc họp, quản lý văn bản, ban hành nghị quyết và giám sát kỷ luật",
    level: 3,
    permissions: [
      "Thẩm định tính pháp lý hồ sơ, biên bản cuộc họp",
      "Thẩm định quy chế hoạt động và thể lệ biểu quyết",
      "Quản lý con dấu số và phát hành tài liệu hiệp hội",
    ],
    status: "active",
    updatedAt: "2026-10-03",
  },
  {
    id: "ban-03",
    type: "ban",
    code: "BAN-03",
    name: "Ban Thành Viên",
    leadership: "Nguyễn Văn Cường (Trưởng ban TV)",
    scope: "Phát triển hội viên mới, tiếp nhận hồ sơ gia nhập, thẩm định năng lực và cấp mã hội viên",
    level: 4,
    permissions: [
      "Thẩm định điều kiện kết nạp hội viên mới",
      "Thẩm định hồ sơ gia hạn hội viên định kỳ",
      "Đề xuất khen thưởng hoặc xử lý vi phạm hội viên",
    ],
    status: "active",
    updatedAt: "2026-10-03",
  },
  {
    id: "ban-04",
    type: "ban",
    code: "BAN-04",
    name: "Ban Xúc Tiến Thương Mại",
    leadership: "Hoàng Minh Tuấn (Trưởng ban XT)",
    scope: "Khởi tạo cơ hội giao thương B2B, gian hàng marketplace, matching 1-on-1 và kết nối hợp đồng",
    level: 4,
    permissions: [
      "Thẩm định tính xác thực sản phẩm gian hàng B2B",
      "Điều phối các cuộc hẹn kết nối giao thương 1-on-1",
      "Theo dõi và báo cáo giá trị hợp đồng giao thương",
    ],
    status: "active",
    updatedAt: "2026-10-03",
  },
  {
    id: "ban-05",
    type: "ban",
    code: "BAN-05",
    name: "Ban Truyền Thông",
    leadership: "Phạm Quang Huy (Trưởng ban TT)",
    scope: "Quản lý cổng tin tức, thông báo đẩy, hình ảnh thương hiệu CEO 1983 và truyền thông sự kiện",
    level: 4,
    permissions: [
      "Kiểm duyệt tin tức, hình ảnh trước khi xuất bản",
      "Thẩm định tài liệu truyền thông và quyền lợi tài trợ",
      "Quản lý thông báo push in-app và email marketing",
    ],
    status: "active",
    updatedAt: "2026-10-03",
  },
  {
    id: "ban-06",
    type: "ban",
    code: "BAN-06",
    name: "Ban Thiện Nguyện",
    leadership: "Vũ Thu Trang (Trưởng ban TN)",
    scope: "Tổ chức chương trình thiện nguyện, quản lý quỹ tấm lòng vàng và an sinh xã hội",
    level: 4,
    permissions: [
      "Thẩm định đối tượng tiếp nhận hỗ trợ thiện nguyện",
      "Giám sát tính minh bạch thu chi quỹ thiện nguyện",
      "Lập kế hoạch và tổng kết các chuyến thiện nguyện",
    ],
    status: "active",
    updatedAt: "2026-10-03",
  },
];

function PermissionsPage() {
  const t = useT();
  const { isPlatformAdmin, isBQT, isAdmin, srsRole, loading } = useRole();
  const hasAccess = isPlatformAdmin || isBQT || isAdmin || srsRole === "BQT" || srsRole === "ADM";

  // Account operations data
  const fetchMembers = useServerFn(listMembersFn);
  const { data: members, loading: loadingMembers, reload } = useServerData<any[]>(() => fetchMembers(), []);
  const updateRoleDept = useServerFn(updateMemberRoleAndDeptFn);

  const [edits, setEdits] = useState<Record<string, { role: string; department: string; associationId: string }>>({});
  const [savedEdits, setSavedEdits] = useState<Record<string, { role: string; department: string; associationId: string }>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [filterAssoc, setFilterAssoc] = useState("all");
  const [filterRole, setFilterRole] = useState("all");
  const [filterDept, setFilterDept] = useState("all");

  // Tab switch with URL sync (?tab=matrix | ?tab=user_actions | ?tab=role_groups)
  const [activeTab, setActiveTabState] = useState<"matrix" | "user_actions" | "role_groups">(() => {
    if (typeof window !== "undefined") {
      const p = new URLSearchParams(window.location.search).get("tab");
      if (p === "user_actions" || p === "role_groups" || p === "matrix") return p;
    }
    return "matrix";
  });

  const setActiveTab = (tab: "matrix" | "user_actions" | "role_groups") => {
    setActiveTabState(tab);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", tab);
      window.history.replaceState({}, "", url.toString());
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const checkTab = () => {
      const p = new URLSearchParams(window.location.search).get("tab");
      if (p === "user_actions" || p === "role_groups" || p === "matrix") {
        setActiveTabState(p);
      }
    };
    checkTab();
    window.addEventListener("popstate", checkTab);
    return () => window.removeEventListener("popstate", checkTab);
  }, []);

  // Action Modals for User Permissions
  const [viewingMember, setViewingMember] = useState<any | null>(null);
  const [editingMember, setEditingMember] = useState<any | null>(null);
  const [editForm, setEditForm] = useState<{ role: string; department: string; associationId: string }>({
    role: "member",
    department: "Hội viên CEO 1983",
    associationId: "c1983000-0000-4000-8000-000000001983",
  });

  // Appraisal units state (6 Ban & 5 Cấp Bậc)
  const [appraisalUnits, setAppraisalUnits] = useState<AppraisalUnit[]>(() => {
    try {
      const stored = localStorage.getItem("ceo1983_appraisal_units_v1");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return DEFAULT_APPRAISAL_UNITS;
  });

  const [appraisalSearch, setAppraisalSearch] = useState("");
  const [appraisalTypeFilter, setAppraisalTypeFilter] = useState<"all" | "ban" | "cap">("all");
  const [appraisalStatusFilter, setAppraisalStatusFilter] = useState<"all" | "active" | "inactive">("all");

  const [viewingAppraisal, setViewingAppraisal] = useState<AppraisalUnit | null>(null);
  const [editingAppraisal, setEditingAppraisal] = useState<AppraisalUnit | null>(null);
  const [deletingAppraisal, setDeletingAppraisal] = useState<AppraisalUnit | null>(null);
  const [isCreateAppraisalOpen, setIsCreateAppraisalOpen] = useState(false);

  const [appraisalForm, setAppraisalForm] = useState<{
    code: string;
    name: string;
    type: "ban" | "cap";
    level: number;
    leadership: string;
    scope: string;
    permissionsText: string;
    status: "active" | "inactive";
  }>({
    code: "",
    name: "",
    type: "ban",
    level: 4,
    leadership: "",
    scope: "",
    permissionsText: "",
    status: "active",
  });

  const saveAppraisalUnitsToStorage = (next: AppraisalUnit[]) => {
    setAppraisalUnits(next);
    try {
      localStorage.setItem("ceo1983_appraisal_units_v1", JSON.stringify(next));
    } catch {}
  };

  const filteredAppraisalUnits = useMemo(() => {
    const ql = appraisalSearch.trim().toLowerCase();
    return appraisalUnits.filter((u) => {
      if (appraisalTypeFilter !== "all" && u.type !== appraisalTypeFilter) return false;
      if (appraisalStatusFilter !== "all" && u.status !== appraisalStatusFilter) return false;
      if (!ql) return true;
      return (
        u.code.toLowerCase().includes(ql) ||
        u.name.toLowerCase().includes(ql) ||
        u.leadership.toLowerCase().includes(ql) ||
        u.scope.toLowerCase().includes(ql)
      );
    });
  }, [appraisalUnits, appraisalSearch, appraisalTypeFilter, appraisalStatusFilter]);

  const appraisalAccessors = useMemo(
    () => ({
      code: (u: AppraisalUnit) => u.code,
      name: (u: AppraisalUnit) => u.name,
      type: (u: AppraisalUnit) => u.type,
      level: (u: AppraisalUnit) => u.level,
      leadership: (u: AppraisalUnit) => u.leadership,
      status: (u: AppraisalUnit) => u.status,
      updatedAt: (u: AppraisalUnit) => u.updatedAt,
    }),
    [],
  );

  const appraisalTc = useTableControls(filteredAppraisalUnits, appraisalAccessors, {
    initialPageSize: 10,
    initialSortKey: "level",
    initialSortDir: "asc",
  });

  const handleOpenCreateAppraisal = () => {
    setAppraisalForm({
      code: `BAN-0${appraisalUnits.filter((u) => u.type === "ban").length + 1}`,
      name: "",
      type: "ban",
      level: 4,
      leadership: "",
      scope: "",
      permissionsText: "Thẩm định chuyên môn nghiệp vụ\nBáo cáo kế hoạch hoạt động\nĐề xuất kinh phí và khen thưởng",
      status: "active",
    });
    setIsCreateAppraisalOpen(true);
  };

  const handleOpenEditAppraisal = (u: AppraisalUnit) => {
    setEditingAppraisal(u);
    setAppraisalForm({
      code: u.code,
      name: u.name,
      type: u.type,
      level: u.level,
      leadership: u.leadership,
      scope: u.scope,
      permissionsText: u.permissions.join("\n"),
      status: u.status,
    });
  };

  const handleSaveEditAppraisal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAppraisal) return;
    if (!appraisalForm.name.trim() || !appraisalForm.code.trim()) {
      toast.error("Vui lòng điền đầy đủ mã và tên thẩm quyền");
      return;
    }
    const perms = appraisalForm.permissionsText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    const updated: AppraisalUnit = {
      ...editingAppraisal,
      code: appraisalForm.code.trim().toUpperCase(),
      name: appraisalForm.name.trim(),
      type: appraisalForm.type,
      level: Number(appraisalForm.level),
      leadership: appraisalForm.leadership.trim() || "Chưa phân công",
      scope: appraisalForm.scope.trim() || "Chưa có mô tả",
      permissions: perms.length > 0 ? perms : ["Quyền hạn chuyên môn tiêu chuẩn"],
      status: appraisalForm.status,
      updatedAt: new Date().toISOString().slice(0, 10),
    };

    const next = appraisalUnits.map((item) => (item.id === updated.id ? updated : item));
    saveAppraisalUnitsToStorage(next);
    setEditingAppraisal(null);
    toast.success(`✓ Đã cập nhật thẩm quyền "${updated.name}" thành công!`);
  };

  const handleCreateAppraisal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!appraisalForm.name.trim() || !appraisalForm.code.trim()) {
      toast.error("Vui lòng điền đầy đủ mã và tên thẩm quyền");
      return;
    }
    const perms = appraisalForm.permissionsText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    const newUnit: AppraisalUnit = {
      id: `${appraisalForm.type}_${Date.now()}`,
      code: appraisalForm.code.trim().toUpperCase(),
      name: appraisalForm.name.trim(),
      type: appraisalForm.type,
      level: Number(appraisalForm.level),
      leadership: appraisalForm.leadership.trim() || "Chưa phân công",
      scope: appraisalForm.scope.trim() || "Chưa có mô tả",
      permissions: perms.length > 0 ? perms : ["Quyền hạn chuyên môn tiêu chuẩn"],
      status: appraisalForm.status,
      updatedAt: new Date().toISOString().slice(0, 10),
    };

    const next = [newUnit, ...appraisalUnits];
    saveAppraisalUnitsToStorage(next);
    setIsCreateAppraisalOpen(false);
    toast.success(`✓ Đã tạo thẩm quyền "${newUnit.name}" thành công!`);
  };

  const handleConfirmDeleteAppraisal = () => {
    if (!deletingAppraisal) return;
    const next = appraisalUnits.filter((u) => u.id !== deletingAppraisal.id);
    saveAppraisalUnitsToStorage(next);
    toast.success(`✓ Đã xóa thẩm quyền "${deletingAppraisal.name}"!`);
    setDeletingAppraisal(null);
  };

  const handleResetDefaultAppraisal = () => {
    if (!window.confirm("Khôi phục danh mục phân quyền 6 Ban và 5 Cấp về thiết lập chuẩn ban đầu?")) return;
    saveAppraisalUnitsToStorage(DEFAULT_APPRAISAL_UNITS);
    toast.success("✓ Đã khôi phục danh mục 6 Ban và 5 Cấp về mặc định!");
  };

  const filteredMembers = useMemo(() => {
    const ql = q.trim().toLowerCase();
    const list = Array.isArray(members) ? members : [];
    return list.filter((m: any) => {
      const mAssoc = edits[m.id]?.associationId ?? savedEdits[m.id]?.associationId ?? m.associationId ?? m.association_id ?? "c1983000-0000-4000-8000-000000001983";
      if (filterAssoc !== "all" && mAssoc !== filterAssoc) return false;
      const rawRole = edits[m.id]?.role ?? savedEdits[m.id]?.role ?? m.executiveRole ?? m.role ?? "member";
      const mRole = normalizeRole(rawRole);
      if (filterRole !== "all" && mRole !== filterRole) return false;
      const rawDept = edits[m.id]?.department ?? savedEdits[m.id]?.department ?? m.department ?? "Hội viên CEO 1983";
      const mDept = normalizeDept(rawDept);
      if (filterDept !== "all" && mDept !== filterDept) return false;
      if (!ql) return true;
      return (
        (m.name || "").toLowerCase().includes(ql) ||
        (m.code || "").toLowerCase().includes(ql) ||
        (m.email || "").toLowerCase().includes(ql) ||
        (m.phone || "").toLowerCase().includes(ql) ||
        (m.company || "").toLowerCase().includes(ql)
      );
    });
  }, [members, q, filterAssoc, filterRole, filterDept, edits, savedEdits]);

  const accessors = useMemo(
    () => ({
      code: (m: any) => m.code,
      name: (m: any) => m.name,
      email: (m: any) => m.email,
      role: (m: any) => edits[m.id]?.role ?? savedEdits[m.id]?.role ?? m.executiveRole ?? m.role ?? "member",
      association: (m: any) => edits[m.id]?.associationId ?? savedEdits[m.id]?.associationId ?? m.associationId ?? m.association_id ?? "",
    }),
    [edits, savedEdits],
  );

  const tc = useTableControls(filteredMembers, accessors, {
    initialPageSize: 10,
    initialSortKey: "name",
    initialSortDir: "asc",
  });

  // Direct auto-save when selecting role in dropdown (no hidden save buttons, zero confusion)
  const handleDirectRoleChange = async (m: any, newRole: string) => {
    const currentDept = edits[m.id]?.department ?? savedEdits[m.id]?.department ?? normalizeDept(m.department);
    const targetAssoc = edits[m.id]?.associationId ?? savedEdits[m.id]?.associationId ?? m.associationId ?? m.association_id ?? "c1983000-0000-4000-8000-000000001983";

    setSavingId(m.id);
    try {
      const res = await updateRoleDept({
        data: {
          memberId: m.id,
          executiveRole: newRole,
          department: currentDept,
          associationId: targetAssoc,
        },
      });

      if (res && (res as any).ok) {
        const roleLabel = ROLE_OPTIONS.find((r) => r.value === newRole)?.label || newRole;
        toast.success(`Đã cập nhật vai trò của ${m.name} thành "${roleLabel}"`);
        setSavedEdits((prev) => ({
          ...prev,
          [m.id]: { role: newRole, department: currentDept, associationId: targetAssoc },
        }));
        reload();
      } else {
        toast.error("Không thể cập nhật vai trò hội viên.");
      }
    } catch (e: any) {
      toast.error(e?.message || "Lỗi khi cập nhật vai trò");
    } finally {
      setSavingId(null);
    }
  };

  // Direct auto-save when selecting department in dropdown
  const handleDirectDeptChange = async (m: any, newDept: string) => {
    const currentRole = edits[m.id]?.role ?? savedEdits[m.id]?.role ?? normalizeRole(m.executiveRole ?? m.role);
    const targetAssoc = edits[m.id]?.associationId ?? savedEdits[m.id]?.associationId ?? m.associationId ?? m.association_id ?? "c1983000-0000-4000-8000-000000001983";

    setSavingId(m.id);
    try {
      const res = await updateRoleDept({
        data: {
          memberId: m.id,
          executiveRole: currentRole,
          department: newDept,
          associationId: targetAssoc,
        },
      });

      if (res && (res as any).ok) {
        toast.success(`Đã chuyển ${m.name} sang ban "${newDept}"`);
        setSavedEdits((prev) => ({
          ...prev,
          [m.id]: { role: currentRole, department: newDept, associationId: targetAssoc },
        }));
        reload();
      } else {
        toast.error("Không thể cập nhật ban chuyên môn.");
      }
    } catch (e: any) {
      toast.error(e?.message || "Lỗi khi cập nhật ban chuyên môn");
    } finally {
      setSavingId(null);
    }
  };

  // Open Edit Modal
  const handleOpenEditModal = (m: any) => {
    const currentRole = edits[m.id]?.role ?? savedEdits[m.id]?.role ?? normalizeRole(m.executiveRole ?? m.role);
    const currentDept = edits[m.id]?.department ?? savedEdits[m.id]?.department ?? normalizeDept(m.department);
    const currentAssoc = edits[m.id]?.associationId ?? savedEdits[m.id]?.associationId ?? m.associationId ?? m.association_id ?? "c1983000-0000-4000-8000-000000001983";

    setEditForm({
      role: currentRole,
      department: currentDept,
      associationId: currentAssoc,
    });
    setEditingMember(m);
  };

  // Submit Edit Modal
  const handleSaveEditModal = async () => {
    if (!editingMember) return;
    setSavingId(editingMember.id);
    try {
      const res = await updateRoleDept({
        data: {
          memberId: editingMember.id,
          executiveRole: editForm.role,
          department: editForm.department,
          associationId: editForm.associationId,
        },
      });

      if (res && (res as any).ok) {
        toast.success(`Đã cập nhật phân quyền cho hội viên ${editingMember.name}`);
        setSavedEdits((prev) => ({
          ...prev,
          [editingMember.id]: { ...editForm },
        }));
        setEditingMember(null);
        reload();
      } else {
        toast.error("Không thể cập nhật phân quyền.");
      }
    } catch (e: any) {
      toast.error(e?.message || "Lỗi khi cập nhật phân quyền");
    } finally {
      setSavingId(null);
    }
  };

  // Revoke/Delete role action
  const handleRevokeRole = async (m: any) => {
    if (!window.confirm(`Xác nhận thu hồi toàn bộ đặc quyền quản trị của hội viên "${m.name}"? Tài khoản sẽ chuyển về quyền Thành viên (Member) cơ bản.`)) {
      return;
    }

    setSavingId(m.id);
    try {
      const res = await updateRoleDept({
        data: {
          memberId: m.id,
          executiveRole: "member",
          department: "Hội viên CEO 1983",
          associationId: "c1983000-0000-4000-8000-000000001983",
        },
      });

      if (res && (res as any).ok) {
        toast.success(`Đã thu hồi đặc quyền của ${m.name}. Tài khoản đã trở về quyền Thành viên.`);
        setSavedEdits((prev) => ({
          ...prev,
          [m.id]: {
            role: "member",
            department: "Hội viên CEO 1983",
            associationId: "c1983000-0000-4000-8000-000000001983",
          },
        }));
        reload();
      } else {
        toast.error("Không thể thu hồi quyền.");
      }
    } catch (e: any) {
      toast.error(e?.message || "Lỗi khi thu hồi quyền");
    } finally {
      setSavingId(null);
    }
  };

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

  // Dynamic statistics for 5 Roles & 6 Committees
  const roleCounts = useMemo(() => {
    const list = Array.isArray(members) ? members : [];
    const counts: Record<string, number> = {
      quan_tri: 0,
      admin: 0,
      tong_thu_ky: 0,
      truong_ban: 0,
      member: 0,
    };
    for (const m of list) {
      const r = edits[m.id]?.role ?? savedEdits[m.id]?.role ?? normalizeRole(m.executiveRole ?? m.role);
      counts[r] = (counts[r] || 0) + 1;
    }
    return counts;
  }, [members, edits, savedEdits]);

  const deptCounts = useMemo(() => {
    const list = Array.isArray(members) ? members : [];
    const counts: Record<string, number> = {};
    for (const m of list) {
      const d = edits[m.id]?.department ?? savedEdits[m.id]?.department ?? normalizeDept(m.department);
      counts[d] = (counts[d] || 0) + 1;
    }
    return counts;
  }, [members, edits, savedEdits]);

  return (
    <AppShell>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <PageHeader
          title="Hệ Thống Phân Quyền & Quản Trị Thao Tác"
          subtitle="Tách biệt rõ ràng: Ma trận quyền cốt lõi, Phân quyền thao tác từng tài khoản và Quản lý nhóm quyền hiệp hội"
        />

        {/* Tab Switcher: 3 Chức năng rõ ràng */}
        <div className="flex flex-wrap items-center gap-2 border-b border-border/80 pb-3">
          <button
            onClick={() => setActiveTab("matrix")}
            className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-bold transition cursor-pointer ${
              activeTab === "matrix"
                ? "bg-[#003B95] text-white shadow-sm"
                : "bg-card text-muted-foreground border border-border hover:bg-secondary hover:text-foreground"
            }`}
          >
            <ShieldCheck className="h-4 w-4" />
            <span>1. Ma Trận Phân Quyền 5 Cấp Bậc</span>
          </button>

          <button
            onClick={() => setActiveTab("user_actions")}
            className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-bold transition cursor-pointer ${
              activeTab === "user_actions"
                ? "bg-[#003B95] text-white shadow-sm"
                : "bg-card text-muted-foreground border border-border hover:bg-secondary hover:text-foreground"
            }`}
          >
            <Users className="h-4 w-4" />
            <span>2. Phân Quyền Thao Tác Từng Tài Khoản</span>
            <span className="rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 text-[10px] px-2 py-0.5">
              {filteredMembers.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("role_groups")}
            className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-bold transition cursor-pointer ${
              activeTab === "role_groups"
                ? "bg-[#003B95] text-white shadow-sm"
                : "bg-card text-muted-foreground border border-border hover:bg-secondary hover:text-foreground"
            }`}
          >
            <Layers className="h-4 w-4" />
            <span>3. Thẩm Quyền 6 Ban &amp; 5 Cấp Bậc</span>
            <span className="rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 text-[10px] px-2 py-0.5">
              6 Ban · 5 Cấp
            </span>
          </button>
        </div>

        {/* TAB 1: Ma Trận Phân Quyền 5 Cấp Bậc */}
        {activeTab === "matrix" && <RbacPermissionMatrix />}

        {/* TAB 2: Phân Quyền Thao Tác Trực Tiếp Cho Từng Tài Khoản */}
        {activeTab === "user_actions" && (
          <section className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#003B95]" />
                  Phân Quyền Thao Tác Trực Tiếp Cho Từng Tài Khoản
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Chỉ định vai trò điều hành, phòng ban chuyên môn, xem chi tiết, sửa và thu hồi quyền từng thành viên
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                  Tổng số: {filteredMembers.length} tài khoản
                </span>
              </div>
            </div>

            <Card className="overflow-hidden border border-border shadow-xs">
              {/* Filter toolbar */}
              <div className="p-4 border-b border-border bg-card flex flex-wrap items-center justify-between gap-3">
                <div className="relative flex-1 min-w-[240px] max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Tìm theo họ tên, mã HV, email, SĐT, công ty..."
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-border bg-background focus:border-primary outline-none transition-all"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="text-xs rounded-xl border border-border bg-background px-3 py-2 outline-none font-medium focus:border-primary"
                  >
                    <option value="all">Tất cả vai trò</option>
                    {ROLE_OPTIONS.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>

                  <select
                    value={filterDept}
                    onChange={(e) => setFilterDept(e.target.value)}
                    className="text-xs rounded-xl border border-border bg-background px-3 py-2 outline-none font-medium focus:border-primary"
                  >
                    <option value="all">Tất cả ban chuyên môn</option>
                    {DEPARTMENT_OPTIONS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>

                  <div className="text-xs rounded-xl border border-blue-200 bg-blue-50/70 dark:bg-blue-950/50 px-3 py-2 font-bold text-[#003B95] dark:text-blue-300">
                    Hiệp hội: CEO 1983
                  </div>

                  <button
                    type="button"
                    onClick={() => reload()}
                    disabled={loadingMembers}
                    className="p-2 rounded-xl border border-border bg-background hover:bg-secondary transition-all"
                    title="Tải lại danh sách"
                  >
                    <RefreshCw className={`w-4 h-4 text-muted-foreground ${loadingMembers ? "animate-spin" : ""}`} />
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border bg-secondary/40 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      <th className="px-4 py-3 text-center w-12">STT</th>
                      <th className="px-4 py-3 min-w-[100px]">Mã HV</th>
                      <th className="px-4 py-3 min-w-[180px]">Họ tên &amp; Doanh nghiệp</th>
                      <th className="px-4 py-3 min-w-[180px]">Email &amp; SĐT</th>
                      <th className="px-4 py-3 min-w-[140px]">Hiệp hội trực thuộc</th>
                      <th className="px-4 py-3 min-w-[170px]">Vai trò / Cấp bậc</th>
                      <th className="px-4 py-3 min-w-[180px]">Ban chuyên môn</th>
                      <th className="px-4 py-3 text-center min-w-[140px]">Thao tác quyền</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {loadingMembers ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-xs text-muted-foreground">
                          Đang tải danh sách tài khoản thành viên...
                        </td>
                      </tr>
                    ) : (tc.paged || []).length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-xs text-muted-foreground">
                          Không tìm thấy tài khoản nào phù hợp với điều kiện tìm kiếm.
                        </td>
                      </tr>
                    ) : (
                      (tc.paged || []).map((m: any, idx: number) => {
                        const currentRole = edits[m.id]?.role ?? savedEdits[m.id]?.role ?? normalizeRole(m.executiveRole ?? m.role);
                        const currentDept = edits[m.id]?.department ?? savedEdits[m.id]?.department ?? normalizeDept(m.department);
                        const isSaving = savingId === m.id;
                        const isElevated = currentRole !== "member";

                        return (
                          <tr key={m.id} className="hover:bg-secondary/20 transition-colors">
                            <td className="px-4 py-3 text-center text-xs text-muted-foreground font-mono">
                              {(tc.page - 1) * tc.pageSize + idx + 1}
                            </td>
                            <td className="px-4 py-3 font-mono text-xs font-semibold text-[#003B95] dark:text-blue-400">
                              {m.code || m.id?.slice(0, 8)}
                            </td>
                            <td className="px-4 py-3">
                              <div className="font-semibold text-foreground text-xs">{m.name}</div>
                              <div className="text-[11px] text-muted-foreground line-clamp-1">{m.company || "—"}</div>
                            </td>
                            <td className="px-4 py-3 text-xs text-muted-foreground">
                              <div className="line-clamp-1">{m.email || "—"}</div>
                              <div className="text-[11px] text-foreground/70">{m.phone || "—"}</div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-950/40 text-[#003B95] dark:text-blue-300 font-bold text-xs border border-blue-200/60 dark:border-blue-800/40">
                                CEO 1983
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="space-y-1">
                                <select
                                  value={currentRole}
                                  disabled={isSaving}
                                  onChange={(e) => handleDirectRoleChange(m, e.target.value)}
                                  className={`w-full text-xs font-semibold rounded-lg border bg-background px-2.5 py-1.5 focus:border-primary outline-none transition ${
                                    currentRole === "quan_tri"
                                      ? "border-indigo-300 text-indigo-700 dark:text-indigo-300"
                                      : currentRole === "admin"
                                      ? "border-purple-300 text-purple-700 dark:text-purple-300"
                                      : currentRole === "tong_thu_ky"
                                      ? "border-amber-300 text-amber-700 dark:text-amber-300"
                                      : currentRole === "truong_ban"
                                      ? "border-emerald-300 text-emerald-700 dark:text-emerald-300"
                                      : "border-border text-foreground"
                                  }`}
                                >
                                  {ROLE_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                      {opt.label}
                                    </option>
                                  ))}
                                </select>
                                {isSaving && (
                                  <div className="text-[10px] text-[#003B95] animate-pulse flex items-center gap-1 font-semibold">
                                    <RefreshCw className="w-2.5 h-2.5 animate-spin" /> Đang lưu quyền...
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <select
                                value={currentDept}
                                disabled={isSaving}
                                onChange={(e) => handleDirectDeptChange(m, e.target.value)}
                                className="w-full text-xs font-medium rounded-lg border border-border bg-background px-2.5 py-1.5 focus:border-primary outline-none"
                              >
                                {DEPARTMENT_OPTIONS.map((d) => (
                                  <option key={d} value={d}>
                                    {d}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                {/* 1. Xem chi tiết quyền */}
                                <button
                                  type="button"
                                  onClick={() => setViewingMember({ ...m, currentRole, currentDept })}
                                  className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                                  title="Xem chi tiết phân quyền"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>

                                {/* 2. Sửa quyền qua Modal */}
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditModal(m)}
                                  className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-amber-600 hover:bg-amber-500/10 transition-colors cursor-pointer"
                                  title="Sửa quyền qua bảng điều khiển"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>

                                {/* 3. Xóa / Thu hồi quyền */}
                                <button
                                  type="button"
                                  onClick={() => handleRevokeRole(m)}
                                  disabled={!isElevated || isSaving}
                                  className={`p-1.5 rounded-lg border border-border transition-colors ${
                                    isElevated
                                      ? "text-destructive hover:bg-destructive/10 cursor-pointer"
                                      : "text-muted-foreground/30 border-dashed cursor-not-allowed"
                                  }`}
                                  title={isElevated ? "Thu hồi đặc quyền quản trị về Thành viên" : "Đã là quyền thành viên cơ bản"}
                                >
                                  <RotateCcw className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              <Pagination
                page={tc.page}
                pageCount={tc.pageCount}
                pageSize={tc.pageSize}
                total={tc.total}
                from={tc.from}
                to={tc.to}
                onPage={tc.setPage}
                onPageSize={tc.setPageSize}
              />
            </Card>
          </section>
        )}

        {/* TAB 3: Dashboard Phân Quyền Thẩm Định 6 Ban & 5 Cấp Bậc (CEO 1983) */}
        {activeTab === "role_groups" && (
          <section className="space-y-5 animate-in fade-in duration-200">
            {/* Header & Quick Action */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Layers className="w-5 h-5 text-[#003B95]" />
                  Dashboard Phân Quyền Thẩm Định 6 Ban &amp; 5 Cấp Bậc
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Bảng điều khiển quản trị tập trung: Xem chi tiết, sửa đổi, thêm mới và xóa thẩm quyền của 6 Ban chuyên môn và 5 Cấp bậc phê duyệt CEO 1983
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetDefaultAppraisal}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-2 text-xs font-semibold text-muted-foreground hover:bg-secondary transition cursor-pointer"
                  title="Khôi phục danh mục về ban đầu"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Khôi phục gốc</span>
                </button>
                <button
                  type="button"
                  onClick={handleOpenCreateAppraisal}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#003B95] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#002b6d] transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Thêm Thẩm Quyền / Ban Mới</span>
                </button>
              </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-4 rounded-2xl border border-border bg-card shadow-xs">
                <div className="text-xs text-muted-foreground font-semibold">Tổng Đơn Vị Thẩm Định</div>
                <div className="text-2xl font-bold text-foreground mt-1">{appraisalUnits.length}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">Ban chuyên môn &amp; Cấp phê duyệt</div>
              </div>
              <div className="p-4 rounded-2xl border border-border bg-card shadow-xs">
                <div className="text-xs text-muted-foreground font-semibold">6 Ban Chuyên Môn</div>
                <div className="text-2xl font-bold text-blue-600 mt-1">
                  {appraisalUnits.filter((u) => u.type === "ban").length} Ban
                </div>
                <div className="text-[11px] text-muted-foreground mt-0.5">Nghiệp vụ chuyên trách hiệp hội</div>
              </div>
              <div className="p-4 rounded-2xl border border-border bg-card shadow-xs">
                <div className="text-xs text-muted-foreground font-semibold">5 Cấp Bậc Phê Duyệt</div>
                <div className="text-2xl font-bold text-purple-600 mt-1">
                  {appraisalUnits.filter((u) => u.type === "cap").length} Cấp
                </div>
                <div className="text-[11px] text-muted-foreground mt-0.5">Phân cấp thẩm quyền tối cao -&gt; HV</div>
              </div>
              <div className="p-4 rounded-2xl border border-border bg-card shadow-xs">
                <div className="text-xs text-muted-foreground font-semibold">Đang Áp Dụng</div>
                <div className="text-2xl font-bold text-emerald-600 mt-1">
                  {appraisalUnits.filter((u) => u.status === "active").length} Đơn vị
                </div>
                <div className="text-[11px] text-muted-foreground mt-0.5">Hiệu lực trong CSDL hệ thống</div>
              </div>
            </div>

            {/* Dashboard Table Card */}
            <Card className="overflow-hidden border border-border shadow-xs">
              {/* Filter Toolbar */}
              <div className="p-4 border-b border-border bg-card flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="relative flex-1 min-w-[240px] max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Tìm theo mã, tên ban, cấp bậc, lãnh đạo, phạm vi..."
                    value={appraisalSearch}
                    onChange={(e) => setAppraisalSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-border bg-background focus:border-primary outline-none transition"
                  />
                  {appraisalSearch && (
                    <button
                      type="button"
                      onClick={() => setAppraisalSearch("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>Lọc:</span>
                  </div>

                  <select
                    value={appraisalTypeFilter}
                    onChange={(e) => setAppraisalTypeFilter(e.target.value as any)}
                    className="text-xs rounded-xl border border-border bg-background px-3 py-2 outline-none font-semibold focus:border-primary cursor-pointer"
                  >
                    <option value="all">Tất cả phân loại ({appraisalUnits.length})</option>
                    <option value="ban">6 Ban Chuyên Môn ({appraisalUnits.filter((u) => u.type === "ban").length})</option>
                    <option value="cap">5 Cấp Bậc Phê Duyệt ({appraisalUnits.filter((u) => u.type === "cap").length})</option>
                  </select>

                  <select
                    value={appraisalStatusFilter}
                    onChange={(e) => setAppraisalStatusFilter(e.target.value as any)}
                    className="text-xs rounded-xl border border-border bg-background px-3 py-2 outline-none font-semibold focus:border-primary cursor-pointer"
                  >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="active">Đang áp dụng</option>
                    <option value="inactive">Tạm ngưng</option>
                  </select>

                  <button
                    type="button"
                    onClick={handleOpenCreateAppraisal}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#003B95] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#002b6d] transition shadow-xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tạo mới</span>
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border bg-secondary/40 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      <th className="px-4 py-3 text-center w-12">STT</th>
                      <SortHeader
                        label="Mã Đơn Vị"
                        columnKey="code"
                        sortKey={appraisalTc.sortKey}
                        sortDir={appraisalTc.sortDir}
                        onSort={appraisalTc.toggleSort}
                      />
                      <SortHeader
                        label="Tên Ban / Cấp Bậc"
                        columnKey="name"
                        sortKey={appraisalTc.sortKey}
                        sortDir={appraisalTc.sortDir}
                        onSort={appraisalTc.toggleSort}
                      />
                      <SortHeader
                        label="Phân Loại"
                        columnKey="type"
                        sortKey={appraisalTc.sortKey}
                        sortDir={appraisalTc.sortDir}
                        onSort={appraisalTc.toggleSort}
                      />
                      <SortHeader
                        label="Cấp Độ"
                        columnKey="level"
                        sortKey={appraisalTc.sortKey}
                        sortDir={appraisalTc.sortDir}
                        onSort={appraisalTc.toggleSort}
                      />
                      <th className="px-4 py-3 min-w-[150px]">Lãnh Đạo Phụ Trách</th>
                      <th className="px-4 py-3 min-w-[200px]">Phạm Vi Thẩm Định</th>
                      <th className="px-4 py-3 text-center min-w-[100px]">Quyền Hạn</th>
                      <SortHeader
                        label="Trạng Thái"
                        columnKey="status"
                        sortKey={appraisalTc.sortKey}
                        sortDir={appraisalTc.sortDir}
                        onSort={appraisalTc.toggleSort}
                      />
                      <th className="px-4 py-3 text-center min-w-[130px]">Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {appraisalTc.paged.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="py-12 text-center text-xs text-muted-foreground">
                          Không tìm thấy thẩm quyền nào phù hợp với bộ lọc.
                        </td>
                      </tr>
                    ) : (
                      appraisalTc.paged.map((u, idx) => (
                        <tr key={u.id} className="hover:bg-secondary/20 transition-colors">
                          <td className="px-4 py-3 text-center text-xs text-muted-foreground font-mono">
                            {(appraisalTc.page - 1) * appraisalTc.pageSize + idx + 1}
                          </td>
                          <td className="px-4 py-3 font-mono text-xs font-bold text-[#003B95] dark:text-blue-400">
                            {u.code}
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-bold text-foreground text-xs">{u.name}</div>
                            <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                              <span>Cập nhật: {u.updatedAt}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            {u.type === "ban" ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-200">
                                <Building2 className="w-3 h-3" />
                                6 Ban Chuyên Môn
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-purple-200">
                                <ShieldCheck className="w-3 h-3" />
                                5 Cấp Bậc Duyệt
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-secondary text-foreground border border-border">
                              Cấp {u.level}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs font-medium text-foreground">
                            {u.leadership}
                          </td>
                          <td className="px-4 py-3 text-xs text-muted-foreground max-w-xs">
                            <p className="line-clamp-2 leading-relaxed">{u.scope}</p>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              type="button"
                              onClick={() => setViewingAppraisal(u)}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-secondary text-[11px] font-bold text-foreground hover:bg-muted transition cursor-pointer"
                              title="Bấm xem danh sách quyền hạn"
                            >
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>{u.permissions.length} quyền</span>
                            </button>
                          </td>
                          <td className="px-4 py-3">
                            {u.status === "active" ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300">
                                Đang áp dụng
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-300">
                                Tạm ngưng
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => setViewingAppraisal(u)}
                                className="p-1.5 rounded-lg border border-border text-muted-foreground hover:bg-blue-50 dark:hover:bg-blue-950/60 hover:text-blue-600 transition cursor-pointer"
                                title="Xem chi tiết thẩm quyền"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenEditAppraisal(u)}
                                className="p-1.5 rounded-lg border border-border text-muted-foreground hover:bg-amber-50 dark:hover:bg-amber-950/60 hover:text-amber-600 transition cursor-pointer"
                                title="Chỉnh sửa thẩm quyền"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeletingAppraisal(u)}
                                className="p-1.5 rounded-lg border border-border text-muted-foreground hover:bg-rose-50 dark:hover:bg-rose-950/60 hover:text-rose-600 transition cursor-pointer"
                                title="Xóa thẩm quyền này"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <Pagination
                page={appraisalTc.page}
                pageCount={appraisalTc.pageCount}
                pageSize={appraisalTc.pageSize}
                total={appraisalTc.total}
                from={appraisalTc.from}
                to={appraisalTc.to}
                onPage={appraisalTc.setPage}
                onPageSize={appraisalTc.setPageSize}
              />
            </Card>
          </section>
        )}

        {/* MODAL 3: Xem chi tiết thẩm quyền 6 Ban / 5 Cấp */}
        {viewingAppraisal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
            <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
              <div className="flex items-start justify-between pb-3 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl font-bold text-base ${
                    viewingAppraisal.type === "ban"
                      ? "bg-blue-100 text-[#003B95] dark:bg-blue-950 dark:text-blue-300"
                      : "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300"
                  }`}>
                    {viewingAppraisal.code.slice(0, 3)}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-foreground">{viewingAppraisal.name}</h3>
                    <p className="text-xs text-muted-foreground font-mono">
                      Mã: {viewingAppraisal.code} • Cấp {viewingAppraisal.level}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setViewingAppraisal(null)}
                  className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-xl border border-border bg-secondary/30 p-3">
                  <div className="text-muted-foreground mb-1">Phân loại</div>
                  <div className="font-bold text-foreground">
                    {viewingAppraisal.type === "ban" ? "6 Ban Chuyên Môn" : "5 Cấp Bậc Phê Duyệt"}
                  </div>
                </div>
                <div className="rounded-xl border border-border bg-secondary/30 p-3">
                  <div className="text-muted-foreground mb-1">Cấp độ phê duyệt</div>
                  <div className="font-bold text-[#003B95] dark:text-blue-400">
                    Cấp {viewingAppraisal.level}
                  </div>
                </div>
                <div className="col-span-2 rounded-xl border border-border bg-secondary/30 p-3">
                  <div className="text-muted-foreground mb-1">Lãnh đạo phụ trách</div>
                  <div className="font-semibold text-foreground">{viewingAppraisal.leadership}</div>
                </div>
                <div className="col-span-2 rounded-xl border border-border bg-secondary/30 p-3">
                  <div className="text-muted-foreground mb-1">Phạm vi thẩm định</div>
                  <div className="font-medium text-foreground leading-relaxed">{viewingAppraisal.scope}</div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Danh sách quyền hạn được gán ({viewingAppraisal.permissions.length} quyền):
                </h4>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {viewingAppraisal.permissions.map((perm, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-foreground/90 bg-secondary/25 rounded-lg px-2.5 py-1.5 border border-border/40">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>{perm}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setViewingAppraisal(null)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-border hover:bg-muted cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const u = viewingAppraisal;
                    setViewingAppraisal(null);
                    handleOpenEditAppraisal(u);
                  }}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#003B95] text-white hover:bg-[#002b6d] shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>Sửa thẩm quyền</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 4: Chỉnh sửa thẩm quyền 6 Ban / 5 Cấp */}
        {editingAppraisal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
            <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div>
                  <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                    <Pencil className="w-4 h-4 text-[#003B95]" />
                    Chỉnh Sửa Thẩm Quyền Phê Duyệt
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{editingAppraisal.name} ({editingAppraisal.code})</p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingAppraisal(null)}
                  className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSaveEditAppraisal} className="space-y-3.5 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-foreground mb-1">Mã ký hiệu *</label>
                    <input
                      type="text"
                      required
                      value={appraisalForm.code}
                      onChange={(e) => setAppraisalForm((prev) => ({ ...prev, code: e.target.value }))}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 outline-none font-mono font-bold focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-foreground mb-1">Phân loại *</label>
                    <select
                      value={appraisalForm.type}
                      onChange={(e) => setAppraisalForm((prev) => ({ ...prev, type: e.target.value as any }))}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 outline-none font-semibold focus:border-primary cursor-pointer"
                    >
                      <option value="ban">6 Ban Chuyên Môn</option>
                      <option value="cap">5 Cấp Bậc Phê Duyệt</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-foreground mb-1">Tên ban / Vai trò thẩm quyền *</label>
                  <input
                    type="text"
                    required
                    value={appraisalForm.name}
                    onChange={(e) => setAppraisalForm((prev) => ({ ...prev, name: e.target.value }))}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 outline-none font-medium focus:border-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-foreground mb-1">Cấp độ duyệt (1 - 5) *</label>
                    <select
                      value={appraisalForm.level}
                      onChange={(e) => setAppraisalForm((prev) => ({ ...prev, level: Number(e.target.value) }))}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 outline-none font-semibold focus:border-primary cursor-pointer"
                    >
                      <option value={1}>Cấp 1 - Tối cao (Super Admin / Chủ tịch)</option>
                      <option value={2}>Cấp 2 - Ban Quản Trị / Phó Chủ tịch</option>
                      <option value={3}>Cấp 3 - Tổng Thư Ký</option>
                      <option value={4}>Cấp 4 - Trưởng Ban Chuyên Môn</option>
                      <option value={5}>Cấp 5 - Hội Viên Tiêu Chuẩn</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-foreground mb-1">Trạng thái *</label>
                    <select
                      value={appraisalForm.status}
                      onChange={(e) => setAppraisalForm((prev) => ({ ...prev, status: e.target.value as any }))}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 outline-none font-semibold focus:border-primary cursor-pointer"
                    >
                      <option value="active">Đang áp dụng</option>
                      <option value="inactive">Tạm ngưng</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-foreground mb-1">Lãnh đạo / Người phụ trách</label>
                  <input
                    type="text"
                    value={appraisalForm.leadership}
                    onChange={(e) => setAppraisalForm((prev) => ({ ...prev, leadership: e.target.value }))}
                    placeholder="Ví dụ: Lê Hoàng Long (Tổng thư ký)"
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 outline-none font-medium focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block font-bold text-foreground mb-1">Phạm vi thẩm định / nghiệp vụ</label>
                  <textarea
                    rows={2}
                    value={appraisalForm.scope}
                    onChange={(e) => setAppraisalForm((prev) => ({ ...prev, scope: e.target.value }))}
                    placeholder="Mô tả phạm vi quyền hạn và trách nhiệm..."
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 outline-none font-medium focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block font-bold text-foreground mb-1">
                    Danh sách quyền hạn (Mỗi quyền nhập trên 1 dòng)
                  </label>
                  <textarea
                    rows={4}
                    value={appraisalForm.permissionsText}
                    onChange={(e) => setAppraisalForm((prev) => ({ ...prev, permissionsText: e.target.value }))}
                    placeholder="Nhập mỗi quyền một dòng..."
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 outline-none font-mono text-[11px] focus:border-primary"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setEditingAppraisal(null)}
                    className="px-4 py-2 text-xs font-semibold rounded-xl border border-border hover:bg-muted cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-bold rounded-xl bg-[#003B95] text-white hover:bg-[#002b6d] shadow-sm flex items-center gap-1.5 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Lưu Thay Đổi</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 5: Tạo mới thẩm quyền 6 Ban / 5 Cấp */}
        {isCreateAppraisalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
            <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div>
                  <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                    <Plus className="w-4 h-4 text-[#003B95]" />
                    Thêm Mới Ban / Cấp Bậc Thẩm Quyền
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Khởi tạo vai trò điều hành hoặc ban chuyên môn mới cho CEO 1983</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCreateAppraisalOpen(false)}
                  className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleCreateAppraisal} className="space-y-3.5 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-foreground mb-1">Mã ký hiệu *</label>
                    <input
                      type="text"
                      required
                      value={appraisalForm.code}
                      onChange={(e) => setAppraisalForm((prev) => ({ ...prev, code: e.target.value }))}
                      placeholder="VD: BAN-07 hoặc CAP-06"
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 outline-none font-mono font-bold focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-foreground mb-1">Phân loại *</label>
                    <select
                      value={appraisalForm.type}
                      onChange={(e) => setAppraisalForm((prev) => ({ ...prev, type: e.target.value as any }))}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 outline-none font-semibold focus:border-primary cursor-pointer"
                    >
                      <option value="ban">6 Ban Chuyên Môn</option>
                      <option value="cap">5 Cấp Bậc Phê Duyệt</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-foreground mb-1">Tên ban / Vai trò thẩm quyền *</label>
                  <input
                    type="text"
                    required
                    value={appraisalForm.name}
                    onChange={(e) => setAppraisalForm((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="VD: Ban Chuyển Đổi Số & AI / Cấp 6 · Cố Vấn Cấp Cao"
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 outline-none font-medium focus:border-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-foreground mb-1">Cấp độ duyệt (1 - 5) *</label>
                    <select
                      value={appraisalForm.level}
                      onChange={(e) => setAppraisalForm((prev) => ({ ...prev, level: Number(e.target.value) }))}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 outline-none font-semibold focus:border-primary cursor-pointer"
                    >
                      <option value={1}>Cấp 1 - Tối cao (Super Admin / Chủ tịch)</option>
                      <option value={2}>Cấp 2 - Ban Quản Trị / Phó Chủ tịch</option>
                      <option value={3}>Cấp 3 - Tổng Thư Ký</option>
                      <option value={4}>Cấp 4 - Trưởng Ban Chuyên Môn</option>
                      <option value={5}>Cấp 5 - Hội Viên Tiêu Chuẩn</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-foreground mb-1">Trạng thái *</label>
                    <select
                      value={appraisalForm.status}
                      onChange={(e) => setAppraisalForm((prev) => ({ ...prev, status: e.target.value as any }))}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 outline-none font-semibold focus:border-primary cursor-pointer"
                    >
                      <option value="active">Đang áp dụng</option>
                      <option value="inactive">Tạm ngưng</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-foreground mb-1">Lãnh đạo / Người phụ trách</label>
                  <input
                    type="text"
                    value={appraisalForm.leadership}
                    onChange={(e) => setAppraisalForm((prev) => ({ ...prev, leadership: e.target.value }))}
                    placeholder="VD: Trưởng ban Nguyễn Văn A"
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 outline-none font-medium focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block font-bold text-foreground mb-1">Phạm vi thẩm định / nghiệp vụ</label>
                  <textarea
                    rows={2}
                    value={appraisalForm.scope}
                    onChange={(e) => setAppraisalForm((prev) => ({ ...prev, scope: e.target.value }))}
                    placeholder="Mô tả phạm vi quyền hạn và trách nhiệm..."
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 outline-none font-medium focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block font-bold text-foreground mb-1">
                    Danh sách quyền hạn (Mỗi quyền nhập trên 1 dòng)
                  </label>
                  <textarea
                    rows={4}
                    value={appraisalForm.permissionsText}
                    onChange={(e) => setAppraisalForm((prev) => ({ ...prev, permissionsText: e.target.value }))}
                    placeholder="VD:&#10;Thẩm định đề án công nghệ&#10;Ký duyệt sáng kiến hội viên&#10;Báo cáo định kỳ thường trực"
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 outline-none font-mono text-[11px] focus:border-primary"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setIsCreateAppraisalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold rounded-xl border border-border hover:bg-muted cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-bold rounded-xl bg-[#003B95] text-white hover:bg-[#002b6d] shadow-sm flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tạo Thẩm Quyền Mới</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 6: Xác nhận xóa thẩm quyền 6 Ban / 5 Cấp */}
        {deletingAppraisal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
            <div className="w-full max-w-md rounded-2xl border border-rose-300 dark:border-rose-900 bg-card p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <h3 className="text-base font-bold text-rose-600 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Xác Nhận Xóa Thẩm Quyền
                </h3>
                <button
                  type="button"
                  onClick={() => setDeletingAppraisal(null)}
                  className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-xl border border-rose-200 dark:border-rose-950 bg-rose-50/60 dark:bg-rose-950/20 text-rose-900 dark:text-rose-200 space-y-1">
                  <div className="font-bold text-sm">{deletingAppraisal.name}</div>
                  <div className="font-mono text-xs">Mã: {deletingAppraisal.code} • Cấp {deletingAppraisal.level}</div>
                  <div className="text-[11px] text-rose-700 dark:text-rose-300">{deletingAppraisal.scope}</div>
                </div>

                <p className="text-muted-foreground leading-relaxed">
                  ⚠️ <strong>Cảnh báo:</strong> Bạn đang thao tác xóa thẩm quyền này khỏi hệ thống phân quyền CEO 1983. Hành động này sẽ có hiệu lực ngay lập tức. Bạn có chắc chắn muốn xóa không?
                </p>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setDeletingAppraisal(null)}
                    className="px-4 py-2 text-xs font-semibold rounded-xl border border-border hover:bg-muted cursor-pointer"
                  >
                    Hủy Bỏ
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmDeleteAppraisal}
                    className="px-5 py-2 text-xs font-bold rounded-xl bg-rose-600 text-white hover:bg-rose-700 shadow-md flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Xác Nhận Xóa</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 1: Xem chi tiết quyền của hội viên */}
        {viewingMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
            <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-[#003B95] font-bold text-lg dark:bg-blue-950 dark:text-blue-300">
                    {(viewingMember.name || "HV").slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-foreground">{viewingMember.name}</h3>
                    <p className="text-xs text-muted-foreground font-mono">{viewingMember.code} · {viewingMember.company || "Doanh nghiệp thành viên"}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setViewingMember(null)}
                  className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-xl border border-border bg-secondary/30 p-3">
                  <div className="text-muted-foreground mb-1">Vai trò hiện tại</div>
                  <div className="font-bold text-[#003B95] dark:text-blue-400 capitalize">
                    {ROLE_OPTIONS.find((r) => r.value === viewingMember.currentRole)?.label || viewingMember.currentRole}
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-secondary/30 p-3">
                  <div className="text-muted-foreground mb-1">Ban chuyên môn</div>
                  <div className="font-bold text-foreground">{viewingMember.currentDept}</div>
                </div>

                <div className="col-span-2 rounded-xl border border-border bg-secondary/30 p-3">
                  <div className="text-muted-foreground mb-1">Hiệp hội trực thuộc</div>
                  <div className="font-semibold text-foreground flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-[#003B95]" />
                    CLB Doanh Nhân CEO 1983
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Quyền hạn thao tác được cấp:
                </h4>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {(ROLE_PERMISSIONS_SUMMARY[viewingMember.currentRole] || ROLE_PERMISSIONS_SUMMARY.member).map((perm, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-foreground/80 bg-secondary/20 rounded-lg px-2.5 py-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>{perm}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setViewingMember(null)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-border hover:bg-muted"
                >
                  Đóng
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const m = viewingMember;
                    setViewingMember(null);
                    handleOpenEditModal(m);
                  }}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#003B95] text-white hover:bg-[#002b6d]"
                >
                  Chỉnh sửa quyền
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 2: Chỉnh sửa quyền của hội viên */}
        {editingMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
            <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div>
                  <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                    <Pencil className="w-4 h-4 text-[#003B95]" />
                    Chỉnh Sửa Quyền &amp; Ban Chuyên Môn
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{editingMember.name} ({editingMember.code})</p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-foreground mb-1">Vai trò / Cấp bậc điều hành</label>
                  <select
                    value={editForm.role}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, role: e.target.value }))}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 outline-none font-medium focus:border-primary"
                  >
                    {ROLE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label} — {opt.desc}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-foreground mb-1">Ban chuyên môn phụ trách</label>
                  <select
                    value={editForm.department}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, department: e.target.value }))}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 outline-none font-medium focus:border-primary"
                  >
                    {DEPARTMENT_OPTIONS.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-foreground mb-1">Hiệp hội trực thuộc</label>
                  <select
                    value={editForm.associationId}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, associationId: e.target.value }))}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 outline-none font-medium focus:border-primary"
                  >
                    {ASSOCIATION_OPTIONS.map((assoc) => (
                      <option key={assoc.id} value={assoc.id}>
                        {assoc.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-border hover:bg-muted"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleSaveEditModal}
                  disabled={savingId === editingMember.id}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#003B95] text-white hover:bg-[#002b6d] shadow-sm flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  {savingId === editingMember.id ? "Đang lưu..." : "Lưu quyền"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
