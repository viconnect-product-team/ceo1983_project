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
  Trash2,
  Plus,
  X,
  RotateCcw,
  Building2,
  CheckCircle2,
  Layers,
  Settings2,
  Sliders,
  ShieldAlert,
  Info,
  Lock,
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
import { Pagination } from "@/components/dashboard/DataTablePagination";
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

export interface RoleGroupItem {
  id: string;
  code: string;
  name: string;
  department: string;
  association: string;
  level: "system_admin" | "board_exec" | "committee_head" | "committee_staff" | "member";
  description: string;
  memberCount?: number;
  permissionsCount?: number;
  isSystem?: boolean;
}

const DEFAULT_ROLE_GROUPS: RoleGroupItem[] = [
  {
    id: "rg-1",
    code: "BQT_ADMIN",
    name: "Ban Quản Trị / Chủ Tịch & Phó Chủ Tịch",
    department: "Ban Quản trị",
    association: "CLB Doanh Nhân CEO 1983",
    level: "system_admin",
    description: "Toàn quyền quản trị điều hành hiệp hội, phê duyệt tài chính, phân quyền và cấu hình hệ thống.",
    memberCount: 5,
    permissionsCount: 42,
    isSystem: true,
  },
  {
    id: "rg-2",
    code: "BTK_EXEC",
    name: "Tổng Thư Ký / Ban Thư Ký",
    department: "Ban Thư ký",
    association: "CLB Doanh Nhân CEO 1983",
    level: "board_exec",
    description: "Điều phối toàn bộ cuộc họp, ban hành văn bản, quản lý hồ sơ tài liệu và biểu quyết.",
    memberCount: 3,
    permissionsCount: 36,
    isSystem: true,
  },
  {
    id: "rg-3",
    code: "BTT_MEDIA",
    name: "Trưởng Ban Truyền Thông & Sự Kiện",
    department: "Ban Truyền thông",
    association: "CLB Doanh Nhân CEO 1983",
    level: "committee_head",
    description: "Chịu trách nhiệm tin tức, cổng thông tin truyền thông, check-in QR và điều phối sự kiện.",
    memberCount: 6,
    permissionsCount: 28,
    isSystem: true,
  },
  {
    id: "rg-4",
    code: "BXT_TRADE",
    name: "Trưởng Ban Xúc Tiến Thương Mại & B2B",
    department: "Ban Xúc tiến",
    association: "CLB Doanh Nhân CEO 1983",
    level: "committee_head",
    description: "Quản lý gói tài trợ, kết nối giao thương B2B, cơ hội hợp tác và gian hàng marketplace.",
    memberCount: 4,
    permissionsCount: 25,
    isSystem: true,
  },
  {
    id: "rg-5",
    code: "BTV_MEMBERSHIP",
    name: "Trưởng Ban Phát Triển & Quản Lý Hội Viên",
    department: "Ban Thành viên",
    association: "CLB Doanh Nhân CEO 1983",
    level: "committee_head",
    description: "Quản lý hồ sơ hội viên, tiếp nhận đăng ký mới, phân loại hội viên và theo dõi chu kỳ gia hạn.",
    memberCount: 8,
    permissionsCount: 30,
    isSystem: true,
  },
  {
    id: "rg-6",
    code: "BTN_CHARITY",
    name: "Trưởng Ban Thiện Nguyện & An Sinh",
    department: "Ban Thiện nguyện",
    association: "CLB Doanh Nhân CEO 1983",
    level: "committee_head",
    description: "Quản lý các chương trình từ thiện xã hội, dự án cộng đồng và quỹ an sinh của hiệp hội.",
    memberCount: 4,
    permissionsCount: 20,
    isSystem: true,
  },
  {
    id: "rg-7",
    code: "OFFICIAL_MEMBER",
    name: "Hội Viên Chính Thức CEO 1983",
    department: "Hội viên CEO 1983",
    association: "CLB Doanh Nhân CEO 1983",
    level: "member",
    description: "Tra cứu danh bạ doanh nhân, tham gia sự kiện, đăng ký họp kết nối B2B và sử dụng quyền lợi hội viên.",
    memberCount: 38,
    permissionsCount: 15,
    isSystem: true,
  },
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

  // Tab switch
  const [activeTab, setActiveTab] = useState<"matrix" | "user_actions" | "role_groups">("matrix");

  // Action Modals for User Permissions
  const [viewingMember, setViewingMember] = useState<any | null>(null);
  const [editingMember, setEditingMember] = useState<any | null>(null);
  const [editForm, setEditForm] = useState<{ role: string; department: string; associationId: string }>({
    role: "member",
    department: "Hội viên CEO 1983",
    associationId: "c1983000-0000-4000-8000-000000001983",
  });

  // Role Groups State (Tab 3)
  const [roleGroups, setRoleGroups] = useState<RoleGroupItem[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("ceo1983_custom_role_groups");
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return DEFAULT_ROLE_GROUPS;
  });

  const [roleGroupSearch, setRoleGroupSearch] = useState("");
  const [editingRoleGroup, setEditingRoleGroup] = useState<RoleGroupItem | null>(null);
  const [isCreatingRoleGroup, setIsCreatingRoleGroup] = useState(false);
  const [roleGroupForm, setRoleGroupForm] = useState<Partial<RoleGroupItem>>({
    code: "",
    name: "",
    department: "Ban Quản trị",
    association: "CLB Doanh Nhân CEO 1983",
    level: "committee_head",
    description: "",
  });

  const saveRoleGroupsToStorage = (groups: RoleGroupItem[]) => {
    setRoleGroups(groups);
    try {
      localStorage.setItem("ceo1983_custom_role_groups", JSON.stringify(groups));
    } catch {}
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
      if (!ql) return true;
      return (
        (m.name || "").toLowerCase().includes(ql) ||
        (m.code || "").toLowerCase().includes(ql) ||
        (m.email || "").toLowerCase().includes(ql) ||
        (m.phone || "").toLowerCase().includes(ql) ||
        (m.company || "").toLowerCase().includes(ql)
      );
    });
  }, [members, q, filterAssoc, filterRole, edits, savedEdits]);

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

  const handleRoleChange = (memberId: string, currentRole: string, currentDept: string, newRole: string) => {
    setEdits((prev) => ({
      ...prev,
      [memberId]: {
        role: newRole,
        department: prev[memberId]?.department || savedEdits[memberId]?.department || normalizeDept(currentDept),
        associationId: "c1983000-0000-4000-8000-000000001983",
      },
    }));
  };

  const handleDeptChange = (memberId: string, currentRole: string, currentDept: string, newDept: string) => {
    setEdits((prev) => ({
      ...prev,
      [memberId]: {
        role: prev[memberId]?.role || savedEdits[memberId]?.role || normalizeRole(currentRole),
        department: newDept,
        associationId: "c1983000-0000-4000-8000-000000001983",
      },
    }));
  };

  const handleSave = async (m: any) => {
    const edit = edits[m.id];
    if (!edit) return;

    setSavingId(m.id);
    try {
      const res = await updateRoleDept({
        data: {
          memberId: m.id,
          executiveRole: edit.role,
          department: edit.department,
          associationId: edit.associationId || "c1983000-0000-4000-8000-000000001983",
        },
      });

      if (res && (res as any).ok) {
        toast.success(`Đã cập nhật phân quyền thao tác cho hội viên ${m.name}`);
        setSavedEdits((prev) => ({
          ...prev,
          [m.id]: { ...edit },
        }));
        setEdits((prev) => {
          const next = { ...prev };
          delete next[m.id];
          return next;
        });
        reload();
      } else {
        toast.error("Không thể cập nhật phân quyền hội viên.");
      }
    } catch (e: any) {
      toast.error(e?.message || "Lỗi khi cập nhật phân quyền");
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
        setEdits((prev) => {
          const next = { ...prev };
          delete next[editingMember.id];
          return next;
        });
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
        setEdits((prev) => {
          const next = { ...prev };
          delete next[m.id];
          return next;
        });
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

  // Role Groups Create / Edit Handlers
  const handleSaveRoleGroup = () => {
    if (!roleGroupForm.name || !roleGroupForm.code) {
      toast.error("Vui lòng nhập đầy đủ mã vai trò và tên nhóm quyền");
      return;
    }

    if (editingRoleGroup) {
      const updated = roleGroups.map((g) =>
        g.id === editingRoleGroup.id
          ? {
              ...g,
              name: roleGroupForm.name || g.name,
              code: roleGroupForm.code || g.code,
              department: roleGroupForm.department || g.department,
              association: roleGroupForm.association || g.association,
              level: (roleGroupForm.level as any) || g.level,
              description: roleGroupForm.description || g.description,
            }
          : g
      );
      saveRoleGroupsToStorage(updated);
      toast.success(`Đã cập nhật nhóm quyền: ${roleGroupForm.name}`);
      setEditingRoleGroup(null);
    } else {
      const newGroup: RoleGroupItem = {
        id: `rg-custom-${Date.now()}`,
        code: roleGroupForm.code.toUpperCase().replace(/\s+/g, "_"),
        name: roleGroupForm.name,
        department: roleGroupForm.department || "Ban Quản trị",
        association: roleGroupForm.association || "CLB Doanh Nhân CEO 1983",
        level: (roleGroupForm.level as any) || "committee_head",
        description: roleGroupForm.description || "Nhóm quyền quản trị chuyên môn hiệp hội.",
        memberCount: 0,
        permissionsCount: 20,
        isSystem: false,
      };
      saveRoleGroupsToStorage([...roleGroups, newGroup]);
      toast.success(`Đã tạo mới nhóm quyền: ${newGroup.name}`);
      setIsCreatingRoleGroup(false);
    }

    setRoleGroupForm({
      code: "",
      name: "",
      department: "Ban Quản trị",
      association: "CLB Doanh Nhân CEO 1983",
      level: "committee_head",
      description: "",
    });
  };

  const handleDeleteRoleGroup = (g: RoleGroupItem) => {
    if (g.isSystem) {
      toast.error("Không thể xóa nhóm quyền hệ thống mặc định");
      return;
    }
    if (!window.confirm(`Xác nhận xóa nhóm quyền "${g.name}"?`)) return;
    const remaining = roleGroups.filter((item) => item.id !== g.id);
    saveRoleGroupsToStorage(remaining);
    toast.success(`Đã xóa nhóm quyền ${g.name}`);
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

  const filteredRoleGroups = roleGroups.filter((g) => {
    if (!roleGroupSearch) return true;
    const s = roleGroupSearch.toLowerCase();
    return (
      g.name.toLowerCase().includes(s) ||
      g.code.toLowerCase().includes(s) ||
      g.department.toLowerCase().includes(s) ||
      g.association.toLowerCase().includes(s)
    );
  });

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
            <span>3. Quản Lý Nhóm Quyền &amp; Vai Trò</span>
            <span className="rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 text-[10px] px-2 py-0.5">
              {roleGroups.length} nhóm
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
                      <th className="px-4 py-3 min-w-[160px]">Vai trò / Cấp bậc</th>
                      <th className="px-4 py-3 min-w-[170px]">Ban chuyên môn</th>
                      <th className="px-4 py-3 text-center min-w-[170px]">Thao tác quyền</th>
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
                        const isChanged = !!edits[m.id];
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
                              <select
                                value={currentRole}
                                onChange={(e) => handleRoleChange(m.id, m.executiveRole, m.department, e.target.value)}
                                className="w-full text-xs font-semibold rounded-lg border border-border bg-background px-2.5 py-1.5 focus:border-primary outline-none"
                              >
                                {ROLE_OPTIONS.map((opt) => (
                                  <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="px-4 py-3">
                              <select
                                value={currentDept}
                                onChange={(e) => handleDeptChange(m.id, m.executiveRole, m.department, e.target.value)}
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
                                  className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                                  title="Xem chi tiết phân quyền"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>

                                {/* 2. Sửa quyền qua Modal */}
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditModal(m)}
                                  className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-amber-600 hover:bg-amber-500/10 transition-colors"
                                  title="Sửa quyền tài khoản"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>

                                {/* 3. Xóa / Thu hồi quyền */}
                                <button
                                  type="button"
                                  onClick={() => handleRevokeRole(m)}
                                  disabled={!isElevated}
                                  className={`p-1.5 rounded-lg border border-border transition-colors ${
                                    isElevated
                                      ? "text-destructive hover:bg-destructive/10 cursor-pointer"
                                      : "text-muted-foreground/30 border-dashed cursor-not-allowed"
                                  }`}
                                  title={isElevated ? "Xóa/Thu hồi quyền đặc biệt" : "Đã là quyền thành viên cơ bản"}
                                >
                                  <RotateCcw className="w-3.5 h-3.5" />
                                </button>

                                {/* 4. Nút lưu nhanh nếu sửa dropdown trực tiếp */}
                                {isChanged && (
                                  <button
                                    type="button"
                                    onClick={() => handleSave(m)}
                                    disabled={isSaving}
                                    className="p-1.5 rounded-lg bg-[#003B95] text-white hover:bg-[#002b6d] shadow-xs cursor-pointer animate-pulse"
                                    title="Lưu thay đổi dropdown"
                                  >
                                    <Save className="w-3.5 h-3.5" />
                                  </button>
                                )}
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

        {/* TAB 3: Quản Lý Nhóm Quyền & Vai Trò Hiệp Hội (Thiết Kế Thân Thiện Dễ Hiểu) */}
        {activeTab === "role_groups" && (
          <section className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#003B95]" />
                  Quản Lý Vai Trò &amp; Trách Nhiệm 6 Ban Chuyên Môn
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Phân định rõ ràng trách nhiệm lãnh đạo, quyền hạn được làm và phạm vi giới hạn của từng vai trò hiệp hội
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingRoleGroup(null);
                    setRoleGroupForm({
                      code: "",
                      name: "",
                      department: "Ban Quản trị",
                      association: "CLB Doanh Nhân CEO 1983",
                      level: "committee_head",
                      description: "",
                    });
                    setIsCreatingRoleGroup(true);
                  }}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#003B95] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#002b6d] transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Thêm Nhóm Quyền Tùy Chỉnh</span>
                </button>
              </div>
            </div>

            {/* Quick KPI stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-4 rounded-2xl border border-border bg-card shadow-xs">
                <div className="text-xs text-muted-foreground">5 Cấp Bậc Cốt Lõi</div>
                <div className="text-2xl font-bold text-foreground mt-1">5 Vai Trò</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">Quản trị, Admin, TTK, Trưởng ban, HV</div>
              </div>
              <div className="p-4 rounded-2xl border border-border bg-card shadow-xs">
                <div className="text-xs text-muted-foreground">Ban Chuyên Môn</div>
                <div className="text-2xl font-bold text-blue-600 mt-1">6 Ban</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">Quản trị, Thư ký, TV, XT, TT, TN</div>
              </div>
              <div className="p-4 rounded-2xl border border-border bg-card shadow-xs">
                <div className="text-xs text-muted-foreground">Hiệp Hội Trực Thuộc</div>
                <div className="text-2xl font-bold text-emerald-600 mt-1">CEO 1983</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">CLB Doanh Nhân 1983 (HanoiBA)</div>
              </div>
              <div className="p-4 rounded-2xl border border-border bg-card shadow-xs">
                <div className="text-xs text-muted-foreground">Tổng Tài Khoản Đã Gán</div>
                <div className="text-2xl font-bold text-indigo-600 mt-1">{filteredMembers.length}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">Hội viên chính thức trong CRM</div>
              </div>
            </div>

            {/* PHẦN 1: 5 CẤP BẬC QUYỀN HẠN HỆ THỐNG */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#003B95]" />
                  1. Ma Trận 5 Cấp Bậc Quyền Hạn Cốt Lõi
                </h4>
                <span className="text-xs text-muted-foreground">Bấm vào vai trò để lọc nhanh tài khoản tại Tab 2</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* 1. QUẢN TRỊ */}
                <div className="rounded-2xl border border-indigo-200 dark:border-indigo-900 bg-card p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-indigo-400 transition-all">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200">
                        Cấp 1 · Super Admin
                      </span>
                      <span className="text-xs font-mono font-bold text-muted-foreground">
                        {filteredMembers.filter((m) => normalizeRole(m.executiveRole ?? m.role) === "quan_tri").length} tài khoản
                      </span>
                    </div>
                    <h5 className="text-base font-bold text-foreground">Quản Trị Cấp Cao</h5>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      Toàn quyền quản trị hệ thống cao nhất, phụ trách thiết lập ma trận phân quyền, quản lý bảo mật và audit log.
                    </p>

                    <div className="mt-3 pt-3 border-t border-border/60 space-y-1.5 text-xs">
                      <div className="font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        <span>Toàn quyền thêm, sửa, xóa mọi tính năng</span>
                      </div>
                      <div className="font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        <span>Bật/tắt phân quyền cho cả 5 cấp bậc</span>
                      </div>
                      <div className="font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        <span>Xem nhật ký kiểm toán hệ thống (Audit Log)</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setFilterRole("quan_tri");
                      setActiveTab("user_actions");
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 text-xs font-bold transition text-center cursor-pointer"
                  >
                    Xem tài khoản Quản trị →
                  </button>
                </div>

                {/* 2. ADMIN */}
                <div className="rounded-2xl border border-purple-200 dark:border-purple-900 bg-card p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-purple-400 transition-all">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-purple-200">
                        Cấp 2 · Điều Hành BCH
                      </span>
                      <span className="text-xs font-mono font-bold text-muted-foreground">
                        {filteredMembers.filter((m) => normalizeRole(m.executiveRole ?? m.role) === "admin").length} tài khoản
                      </span>
                    </div>
                    <h5 className="text-base font-bold text-foreground">Admin Điều Hành (BQT)</h5>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      Quản trị viên điều hành nghiệp vụ CRM, phê duyệt hồ sơ hội viên mới, ký duyệt chi tài chính và sự kiện.
                    </p>

                    <div className="mt-3 pt-3 border-t border-border/60 space-y-1.5 text-xs">
                      <div className="font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        <span>Phê duyệt kết nạp hội viên chính thức</span>
                      </div>
                      <div className="font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        <span>Ký duyệt phiếu chi và quản lý thu chi quỹ</span>
                      </div>
                      <div className="text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                        <Info className="w-3.5 h-3.5 shrink-0" />
                        <span>Không sửa cấu hình phân quyền hệ thống</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setFilterRole("admin");
                      setActiveTab("user_actions");
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 text-purple-700 dark:text-purple-300 text-xs font-bold transition text-center cursor-pointer"
                  >
                    Xem tài khoản Admin →
                  </button>
                </div>

                {/* 3. TỔNG THƯ KÝ */}
                <div className="rounded-2xl border border-amber-200 dark:border-amber-900 bg-card p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-amber-400 transition-all">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200">
                        Cấp 3 · Ban Thư Ký
                      </span>
                      <span className="text-xs font-mono font-bold text-muted-foreground">
                        {filteredMembers.filter((m) => normalizeRole(m.executiveRole ?? m.role) === "tong_thu_ky").length} tài khoản
                      </span>
                    </div>
                    <h5 className="text-base font-bold text-foreground">Tổng Thư Ký</h5>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      Điều phối thư ký, tổ chức cuộc họp BCH, ban hành công văn, quản lý biểu quyết và giám sát điểm danh.
                    </p>

                    <div className="mt-3 pt-3 border-t border-border/60 space-y-1.5 text-xs">
                      <div className="font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        <span>Khởi tạo và chủ trì cuộc họp toàn hiệp hội</span>
                      </div>
                      <div className="font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        <span>Ban hành nghị quyết, văn bản và biểu quyết</span>
                      </div>
                      <div className="text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                        <X className="w-3.5 h-3.5 shrink-0" />
                        <span>Không được xóa hội viên hoặc ký duyệt chi</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setFilterRole("tong_thu_ky");
                      setActiveTab("user_actions");
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 text-amber-700 dark:text-amber-300 text-xs font-bold transition text-center cursor-pointer"
                  >
                    Xem tài khoản Tổng thư ký →
                  </button>
                </div>

                {/* 4. TRƯỞNG BAN */}
                <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900 bg-card p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-emerald-400 transition-all">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200">
                        Cấp 4 · Lãnh Đạo Ban
                      </span>
                      <span className="text-xs font-mono font-bold text-muted-foreground">
                        {filteredMembers.filter((m) => normalizeRole(m.executiveRole ?? m.role) === "truong_ban").length} tài khoản
                      </span>
                    </div>
                    <h5 className="text-base font-bold text-foreground">Trưởng Ban Chuyên Môn</h5>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      Lãnh đạo các ban nghiệp vụ (Thành viên, Xúc tiến TM, Truyền thông, Thiện nguyện), lập kế hoạch và quản lý ban.
                    </p>

                    <div className="mt-3 pt-3 border-t border-border/60 space-y-1.5 text-xs">
                      <div className="font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        <span>Tạo sự kiện, tin tức và hoạt động nội bộ ban</span>
                      </div>
                      <div className="font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        <span>Đề xuất duyệt chi ngân sách hoạt động của ban</span>
                      </div>
                      <div className="text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                        <X className="w-3.5 h-3.5 shrink-0" />
                        <span>Không được can thiệp vào nghiệp vụ ban khác</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setFilterRole("truong_ban");
                      setActiveTab("user_actions");
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 text-xs font-bold transition text-center cursor-pointer"
                  >
                    Xem tài khoản Trưởng ban →
                  </button>
                </div>

                {/* 5. THÀNH VIÊN */}
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-card p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-400 transition-all">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-300 border border-slate-200">
                        Cấp 5 · Hội Viên Tiêu Chuẩn
                      </span>
                      <span className="text-xs font-mono font-bold text-muted-foreground">
                        {filteredMembers.filter((m) => normalizeRole(m.executiveRole ?? m.role) === "member").length} tài khoản
                      </span>
                    </div>
                    <h5 className="text-base font-bold text-foreground">Thành Viên Hội Viên</h5>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      Hội viên chính thức tham gia sinh hoạt, kết nối giao thương B2B, đăng ký sự kiện và sử dụng App Hiệp Hội.
                    </p>

                    <div className="mt-3 pt-3 border-t border-border/60 space-y-1.5 text-xs">
                      <div className="font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        <span>Đăng ký tham gia sự kiện và chọn chỗ ngồi</span>
                      </div>
                      <div className="font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        <span>Đăng tin bán hàng B2B và hẹn gặp 1-on-1</span>
                      </div>
                      <div className="text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                        <X className="w-3.5 h-3.5 shrink-0" />
                        <span>Không có quyền quản trị hay xem sổ quỹ tài chính</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setFilterRole("member");
                      setActiveTab("user_actions");
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold transition text-center cursor-pointer"
                  >
                    Xem tài khoản Thành viên →
                  </button>
                </div>
              </div>
            </div>

            {/* PHẦN 2: 6 BAN CHUYÊN MÔN CHÍNH THỨC CỦA CEO 1983 */}
            <div className="space-y-3 pt-2">
              <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#003B95]" />
                2. Danh Mục 6 Ban Chuyên Môn Chính Thức (CEO 1983)
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  {
                    name: "Ban Quản Trị",
                    sub: "Chủ tịch, Phó Chủ tịch & Thường trực",
                    desc: "Hoạch định chiến lược, chỉ đạo điều hành toàn bộ hoạt động hiệp hội và quan hệ đối ngoại cấp cao.",
                    color: "border-blue-200 bg-blue-50/50 dark:bg-blue-950/20 text-[#003B95]",
                  },
                  {
                    name: "Ban Thư Ký",
                    sub: "Tổng thư ký & Ủy viên thư ký",
                    desc: "Điều phối cuộc họp, quản lý kho văn bản, ban hành nghị quyết, giám sát kỷ luật và điều lệ hiệp hội.",
                    color: "border-purple-200 bg-purple-50/50 dark:bg-purple-950/20 text-purple-700",
                  },
                  {
                    name: "Ban Thành Viên",
                    sub: "Trưởng ban & Ban thẩm định hội viên",
                    desc: "Phát triển hội viên mới, tiếp nhận hồ sơ gia nhập, thẩm định năng lực và cấp mã hội viên chính thức.",
                    color: "border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700",
                  },
                  {
                    name: "Ban Xúc Tiến Thương Mại",
                    sub: "Trưởng ban & Nhóm kết nối B2B",
                    desc: "Khởi tạo cơ hội giao thương B2B, gian hàng marketplace, matching 1-on-1 và kết nối hợp đồng.",
                    color: "border-amber-200 bg-amber-50/50 dark:bg-amber-950/20 text-amber-700",
                  },
                  {
                    name: "Ban Truyền Thông",
                    sub: "Trưởng ban & Bộ phận sự kiện",
                    desc: "Quản lý cổng tin tức, thông báo đẩy, hình ảnh thương hiệu CEO 1983 và truyền thông sự kiện lớn.",
                    color: "border-rose-200 bg-rose-50/50 dark:bg-rose-950/20 text-rose-700",
                  },
                  {
                    name: "Ban Thiện Nguyện",
                    sub: "Trưởng ban & Ban an sinh xã hội",
                    desc: "Tổ chức các chương trình thiện nguyện, quỹ tấm lòng vàng, hỗ trợ cộng đồng và an sinh xã hội.",
                    color: "border-teal-200 bg-teal-50/50 dark:bg-teal-950/20 text-teal-700",
                  },
                ].map((b, i) => (
                  <div key={i} className={`p-4 rounded-2xl border ${b.color} shadow-xs space-y-2`}>
                    <div className="font-bold text-sm text-foreground">{b.name}</div>
                    <div className="text-[11px] font-semibold text-muted-foreground">{b.sub}</div>
                    <p className="text-xs text-foreground/80 leading-relaxed">{b.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* PHẦN 3: BẢNG TRA CỨU NHÓM QUYỀN TÙY CHỈNH */}
            <Card className="overflow-hidden border border-border shadow-xs mt-4">
              <div className="p-4 border-b border-border bg-card flex flex-wrap items-center justify-between gap-3">
                <div className="relative flex-1 min-w-[240px] max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Tìm theo tên nhóm quyền, mã vai trò, ban chuyên môn..."
                    value={roleGroupSearch}
                    onChange={(e) => setRoleGroupSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-border bg-background focus:border-primary outline-none transition-all"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border bg-secondary/40 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      <th className="px-4 py-3 text-center w-12">STT</th>
                      <th className="px-4 py-3 min-w-[130px]">Mã Vai Trò</th>
                      <th className="px-4 py-3 min-w-[220px]">Tên Vai Trò / Nhóm Quyền</th>
                      <th className="px-4 py-3 min-w-[160px]">Ban Chuyên Môn</th>
                      <th className="px-4 py-3 min-w-[160px]">Hiệp Hội Trực Thuộc</th>
                      <th className="px-4 py-3 min-w-[120px]">Cấp Bậc Quyền</th>
                      <th className="px-4 py-3 text-center min-w-[120px]">Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredRoleGroups.map((g, idx) => (
                      <tr key={g.id} className="hover:bg-secondary/20 transition-colors">
                        <td className="px-4 py-3 text-center text-xs text-muted-foreground font-mono">
                          {idx + 1}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs font-semibold text-[#003B95] dark:text-blue-400">
                          {g.code}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-foreground text-xs">{g.name}</div>
                          <div className="text-[11px] text-muted-foreground line-clamp-1">{g.description}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-semibold text-xs border border-purple-200/60 dark:border-purple-800/40">
                            {g.department}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-950/40 text-[#003B95] dark:text-blue-300 font-bold text-xs border border-blue-200/60 dark:border-blue-800/40">
                            {g.association}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs">
                          {g.level === "system_admin" && (
                            <span className="font-bold text-red-600 dark:text-red-400">Full Quản Trị</span>
                          )}
                          {g.level === "board_exec" && (
                            <span className="font-semibold text-amber-600 dark:text-amber-400">Điều Hành BCH</span>
                          )}
                          {g.level === "committee_head" && (
                            <span className="font-semibold text-blue-600 dark:text-blue-400">Trưởng Ban</span>
                          )}
                          {g.level === "committee_staff" && (
                            <span className="font-semibold text-purple-600 dark:text-purple-400">Thành Viên Ban</span>
                          )}
                          {g.level === "member" && (
                            <span className="font-medium text-muted-foreground">Hội Viên Tiêu Chuẩn</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingRoleGroup(g);
                                setRoleGroupForm({ ...g });
                              }}
                              className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-amber-600 hover:bg-amber-500/10 transition-colors cursor-pointer"
                              title="Chỉnh sửa vai trò"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteRoleGroup(g)}
                              disabled={g.isSystem}
                              className={`p-1.5 rounded-lg border border-border transition-colors ${
                                g.isSystem
                                  ? "text-muted-foreground/30 border-dashed cursor-not-allowed"
                                  : "text-destructive hover:bg-destructive/10 cursor-pointer"
                              }`}
                              title={g.isSystem ? "Nhóm quyền hệ thống mặc định" : "Xóa nhóm quyền"}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </section>
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

        {/* MODAL 3: Thêm / Sửa nhóm quyền (Tab 3) */}
        {(isCreatingRoleGroup || editingRoleGroup) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
            <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div>
                  <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#003B95]" />
                    {editingRoleGroup ? "Chỉnh Sửa Nhóm Quyền & Vai Trò" : "Thêm Nhóm Quyền & Vai Trò Mới"}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Cấu hình vai trò điều hành, ban chuyên môn và hiệp hội trực thuộc
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsCreatingRoleGroup(false);
                    setEditingRoleGroup(null);
                  }}
                  className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-foreground mb-1">Mã vai trò (Role Code) *</label>
                    <input
                      type="text"
                      placeholder="VD: PHO_CHU_TICH_NOI_VU"
                      value={roleGroupForm.code}
                      onChange={(e) => setRoleGroupForm((p) => ({ ...p, code: e.target.value }))}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 outline-none font-mono uppercase focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-foreground mb-1">Cấp bậc quyền hạn</label>
                    <select
                      value={roleGroupForm.level}
                      onChange={(e) => setRoleGroupForm((p) => ({ ...p, level: e.target.value as any }))}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 outline-none font-medium focus:border-primary"
                    >
                      <option value="system_admin">Full Quản Trị Hệ Thống</option>
                      <option value="board_exec">Điều Hành BCH</option>
                      <option value="committee_head">Trưởng Ban Chuyên Môn</option>
                      <option value="committee_staff">Thành Viên Ban</option>
                      <option value="member">Hội Viên Tiêu Chuẩn</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-foreground mb-1">Tên nhóm quyền / Vai trò hiển thị *</label>
                  <input
                    type="text"
                    placeholder="VD: Phó Chủ Tịch Thường Trực Phụ Trách Nội Vụ"
                    value={roleGroupForm.name}
                    onChange={(e) => setRoleGroupForm((p) => ({ ...p, name: e.target.value }))}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 outline-none font-medium focus:border-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-foreground mb-1">Ban chuyên môn phụ trách</label>
                    <select
                      value={roleGroupForm.department}
                      onChange={(e) => setRoleGroupForm((p) => ({ ...p, department: e.target.value }))}
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
                      value={roleGroupForm.association}
                      onChange={(e) => setRoleGroupForm((p) => ({ ...p, association: e.target.value }))}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 outline-none font-medium focus:border-primary"
                    >
                      {ASSOCIATION_OPTIONS.map((assoc) => (
                        <option key={assoc.name} value={assoc.name}>
                          {assoc.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-foreground mb-1">Mô tả nhiệm vụ &amp; quyền hạn</label>
                  <textarea
                    rows={3}
                    placeholder="Mô tả phạm vi quyền hạn và trách nhiệm của vai trò này..."
                    value={roleGroupForm.description}
                    onChange={(e) => setRoleGroupForm((p) => ({ ...p, description: e.target.value }))}
                    className="w-full rounded-xl border border-border bg-background p-3 outline-none font-medium focus:border-primary"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreatingRoleGroup(false);
                    setEditingRoleGroup(null);
                  }}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-border hover:bg-muted"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleSaveRoleGroup}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#003B95] text-white hover:bg-[#002b6d] shadow-sm flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{editingRoleGroup ? "Lưu thay đổi" : "Tạo nhóm quyền"}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
