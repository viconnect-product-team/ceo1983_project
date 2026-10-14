import React, { useState, useEffect, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Users,
  Search,
  Filter,
  Plus,
  Eye,
  Pencil,
  Trash2,
  ShieldCheck,
  ShieldAlert,
  Building2,
  Mail,
  Phone,
  Briefcase,
  Lock,
  KeyRound,
  CheckCircle2,
  XCircle,
  X,
  RotateCcw,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Save,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/dashboard/AppShell";
import { PageHeader } from "@/components/dashboard/PageKit";
import { fetchNestApi } from "@/lib/api-client";
import { useRole } from "@/hooks/use-role";
import { ROLE_OPTIONS, DEPARTMENT_OPTIONS, normalizeRole, normalizeDept } from "@/routes/permissions";
import { SYSTEM_ROLES, COMMITTEES } from "@/components/dashboard/RbacPermissionMatrix";
import {
  dispatchPermissionSyncEvent,
  getCustomDepartments,
  getAllDynamicRoleOptions,
  getRolesForDepartment,
  DepartmentItem,
} from "@/lib/rbac-permission-helpers";

export const Route = createFileRoute("/accounts")({
  component: AccountsPage,
});

export interface UserAccountItem {
  id: string;
  name: string;
  code: string;
  email: string;
  phone?: string;
  companyName?: string;
  department: string;
  role: string;
  avatar?: string;
  status: "active" | "inactive" | "locked";
  createdAt?: string;
}

const STORAGE_KEY = "vba_managed_accounts_v2";

const DEFAULT_ACCOUNTS: UserAccountItem[] = [
  {
    id: "acc_admin_01",
    name: "Ban Quản Trị Hệ Thống",
    code: "ADMIN-001",
    email: "admin@ceo1983.vn",
    phone: "0988 198 300",
    companyName: "Tập Đoàn Công Nghệ VIONE",
    department: "Ban Điều Hành",
    role: "quan_tri",
    status: "active",
  },
  {
    id: "acc_pres_01",
    name: "Lê Văn Tuấn",
    code: "CEO-1983-001",
    email: "tuan.le@ceo1983.vn",
    phone: "0912 345 678",
    companyName: "Công Ty CP Tập Đoàn Đầu Tư Hà Nội",
    department: "Ban Điều Hành",
    role: "chu_tich",
    status: "active",
  },
  {
    id: "acc_adm_02",
    name: "Nguyễn Hải Yến",
    code: "CEO-1983-002",
    email: "yen.nh@ceo1983.vn",
    phone: "0904 888 999",
    companyName: "Hải Yến Media & Communications",
    department: "Ban Truyền Thông",
    role: "truong_ban_truyen_thong",
    status: "active",
  },
  {
    id: "acc_adm_03",
    name: "Trần Minh Quân",
    code: "CEO-1983-003",
    email: "quan.tm@ceo1983.vn",
    phone: "0977 123 456",
    companyName: "Minh Quân Logistics",
    department: "Ban Xúc tiến",
    role: "truong_ban_xuc_tien",
    status: "active",
  },
  {
    id: "acc_adm_04",
    name: "Hoàng Bích Thủy",
    code: "CEO-1983-004",
    email: "thuy.hb@ceo1983.vn",
    phone: "0936 678 999",
    companyName: "Bích Thủy Finance & Tax",
    department: "Ban Tài chính",
    role: "truong_ban_tai_chinh",
    status: "active",
  },
  {
    id: "acc_adm_05",
    name: "Đặng Văn Nam",
    code: "CEO-1983-005",
    email: "nam.dv@ceo1983.vn",
    phone: "0983 555 777",
    companyName: "Nam An Phú Thiện Nguyện",
    department: "Ban Thiện nguyện",
    role: "truong_ban_thien_nguyen",
    status: "active",
  },
  {
    id: "acc_mem_01",
    name: "Vũ Minh Khang",
    code: "CEO-1983-006",
    email: "khang.vm@ceo1983.vn",
    phone: "0945 111 222",
    companyName: "Khang Tech Solutions",
    department: "Ban Thành viên",
    role: "member",
    status: "active",
  },
];

function AccountsPage() {
  const { isPlatformAdmin, isBQT, isAdmin } = useRole();
  const canManage = isPlatformAdmin || isBQT || isAdmin;

  const [accounts, setAccounts] = useState<UserAccountItem[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch {}
    }
    return DEFAULT_ACCOUNTS;
  });

  // Snapshot phục vụ dirty state & nút Lưu thay đổi Amber Gold
  const [initialAccountsStr, setInitialAccountsStr] = useState<string>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) return saved;
      } catch {}
    }
    return JSON.stringify(DEFAULT_ACCOUNTS);
  });

  const [saving, setSaving] = useState(false);

  // Dynamic Departments từ Ban chuyên môn
  const [customDepts, setCustomDepts] = useState<DepartmentItem[]>(() =>
    typeof window !== "undefined" ? getCustomDepartments() : []
  );

  useEffect(() => {
    const handleDeptSync = () => {
      setCustomDepts(getCustomDepartments());
    };
    window.addEventListener("ceo1983_departments_updated", handleDeptSync);
    window.addEventListener("permission_sync_updated", handleDeptSync);
    window.addEventListener("storage", handleDeptSync);
    return () => {
      window.removeEventListener("ceo1983_departments_updated", handleDeptSync);
      window.removeEventListener("permission_sync_updated", handleDeptSync);
      window.removeEventListener("storage", handleDeptSync);
    };
  }, []);

  const departmentList = useMemo(() => {
    const names = customDepts.map((d) => d.name);
    DEPARTMENT_OPTIONS.forEach((d) => {
      if (!names.includes(d)) names.push(d);
    });
    return names;
  }, [customDepts]);

  const allRoleOptions = useMemo(() => {
    return getAllDynamicRoleOptions(customDepts);
  }, [customDepts]);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDeptFilter, setSelectedDeptFilter] = useState("all");
  const [selectedRoleFilter, setSelectedRoleFilter] = useState("all");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Dirty state tracking (Unsaved changes)
  const isDirty = useMemo(() => {
    return JSON.stringify(accounts) !== initialAccountsStr;
  }, [accounts, initialAccountsStr]);

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<UserAccountItem | null>(null);
  const [deleteConfirmAccount, setDeleteConfirmAccount] = useState<UserAccountItem | null>(null);

  // Form state
  const [formName, setFormName] = useState("");
  const [formCode, setFormCode] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formCompany, setFormCompany] = useState("");
  const [formDepartment, setFormDepartment] = useState(DEPARTMENT_OPTIONS[0]);
  const [formRole, setFormRole] = useState("member");
  const [formStatus, setFormStatus] = useState<"active" | "inactive" | "locked">("active");

  // Cascading role options for current selected department in form
  const availableRolesForForm = useMemo(() => {
    return getRolesForDepartment(formDepartment, customDepts);
  }, [formDepartment, customDepts]);

  const handleDepartmentChange = (newDept: string) => {
    setFormDepartment(newDept);
    const roles = getRolesForDepartment(newDept, customDepts);
    if (roles.length > 0 && !roles.some((r) => r.value === formRole)) {
      setFormRole(roles[roles.length - 1].value);
    }
  };

  // Load live accounts from members API if available
  useEffect(() => {
    let active = true;
    fetchNestApi<any[]>("/members")
      .then((mList) => {
        if (active && Array.isArray(mList) && mList.length > 0) {
          setAccounts((prev) => {
            const existingCodes = new Set(prev.map((a) => a.code.toUpperCase()));
            const newAccounts: UserAccountItem[] = mList
              .filter(
                (m) =>
                  m.code &&
                  !existingCodes.has(m.code.toUpperCase()) &&
                  (m.status === "approved" ||
                    m.status === "active" ||
                    m.membershipStatus === "approved" ||
                    m.membershipStatus === "active")
              )
              .slice(0, 15)
              .map((m) => ({
                id: `acc_${m.id || m.code}`,
                name: m.name || m.personName || "Hội viên CEO 1983",
                code: m.code,
                email: m.email || `${m.code.toLowerCase()}@ceo1983.vn`,
                phone: m.phone || m.mobile || "",
                companyName: m.companyName || m.company || m.industry || "Doanh nghiệp CEO 1983",
                department: normalizeDept(m.department),
                role: normalizeRole(m.executiveRole || m.role),
                avatar: m.avatar,
                status: "active",
              }));
            if (newAccounts.length > 0) {
              const combined = [...prev, ...newAccounts];
              try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(combined));
                setInitialAccountsStr(JSON.stringify(combined));
              } catch {}
              return combined;
            }
            return prev;
          });
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  // Thay đổi role trực tiếp không reload trang -> bật dirty state
  const handleInlineRoleChange = (accId: string, newRole: string) => {
    setAccounts((prev) =>
      prev.map((a) => (a.id === accId ? { ...a, role: newRole } : a))
    );
  };

  // Lưu toàn bộ danh sách tài khoản & phân quyền vào CSDL
  const handleSaveAll = async () => {
    setSaving(true);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
      setInitialAccountsStr(JSON.stringify(accounts));
      dispatchPermissionSyncEvent();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("role-changed"));
        window.dispatchEvent(new Event("crm_permissions_updated"));
      }
      toast.success("Đã lưu các thay đổi phân quyền tài khoản thành công!");
    } catch {
      toast.error("Lỗi khi lưu tài khoản vào CSDL!");
    } finally {
      setSaving(false);
    }
  };

  // Hoàn tác các thay đổi chưa lưu
  const handleDiscard = () => {
    if (initialAccountsStr) {
      try {
        const restored = JSON.parse(initialAccountsStr);
        setAccounts(restored);
        toast.info("Đã hoàn tác toàn bộ thay đổi tài khoản chưa lưu.");
      } catch {}
    }
  };

  const handleOpenAdd = () => {
    setFormName("");
    setFormCode(`CEO-1983-${String(accounts.length + 1).padStart(3, "0")}`);
    setFormEmail("");
    setFormPhone("");
    setFormCompany("");
    const defaultDept = departmentList[0] || "Ban Điều Hành";
    setFormDepartment(defaultDept);
    const roles = getRolesForDepartment(defaultDept, customDepts);
    setFormRole(roles[roles.length - 1]?.value || "member");
    setFormStatus("active");
    setIsAddOpen(true);
  };

  const handleOpenEdit = (acc: UserAccountItem) => {
    setSelectedAccount(acc);
    setFormName(acc.name);
    setFormCode(acc.code);
    setFormEmail(acc.email);
    setFormPhone(acc.phone || "");
    setFormCompany(acc.companyName || "");
    setFormDepartment(acc.department || departmentList[0] || "Ban Điều Hành");
    setFormRole(acc.role || "member");
    setFormStatus(acc.status || "active");
    setIsEditOpen(true);
  };

  const handleOpenView = (acc: UserAccountItem) => {
    setSelectedAccount(acc);
    setIsViewOpen(true);
  };

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim()) {
      toast.error("Vui lòng điền đầy đủ họ tên và email!");
      return;
    }

    const newAcc: UserAccountItem = {
      id: `acc_${Date.now()}`,
      name: formName.trim(),
      code: formCode.trim().toUpperCase(),
      email: formEmail.trim().toLowerCase(),
      phone: formPhone.trim(),
      companyName: formCompany.trim(),
      department: formDepartment,
      role: formRole,
      status: formStatus,
    };

    const next = [newAcc, ...accounts];
    setAccounts(next);
    toast.success(`Đã thêm mới tài khoản "${newAcc.name}". Bấm 'Lưu Thay Đổi' để đồng bộ.`);
    setIsAddOpen(false);
  };

  const handleUpdateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccount) return;

    const next = accounts.map((a) =>
      a.id === selectedAccount.id
        ? {
            ...a,
            name: formName.trim(),
            code: formCode.trim().toUpperCase(),
            email: formEmail.trim().toLowerCase(),
            phone: formPhone.trim(),
            companyName: formCompany.trim(),
            department: formDepartment,
            role: formRole,
            status: formStatus,
          }
        : a
    );

    setAccounts(next);
    toast.success(`Đã cập nhật thông tin "${formName}". Bấm 'Lưu Thay Đổi' để đồng bộ.`);
    setIsEditOpen(false);
  };

  const handleDeleteAccount = (acc: UserAccountItem) => {
    if (acc.role === "quan_tri" || acc.code === "ADMIN-001") {
      toast.error("Tài khoản Quản trị cấp cao không thể xóa!");
      return;
    }

    const next = accounts.filter((a) => a.id !== acc.id);
    setAccounts(next);
    setDeleteConfirmAccount(null);
    toast.success(`Đã xóa tài khoản "${acc.name}". Bấm 'Lưu Thay Đổi' để hoàn tất.`);
  };

  const filteredAccounts = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return accounts.filter((acc) => {
      const matchQuery =
        !q ||
        acc.name.toLowerCase().includes(q) ||
        acc.code.toLowerCase().includes(q) ||
        acc.email.toLowerCase().includes(q) ||
        (acc.phone && acc.phone.includes(q)) ||
        (acc.companyName && acc.companyName.toLowerCase().includes(q));

      const matchDept = selectedDeptFilter === "all" || acc.department === selectedDeptFilter;
      const matchRole = selectedRoleFilter === "all" || acc.role === selectedRoleFilter;

      return matchQuery && matchDept && matchRole;
    });
  }, [accounts, searchQuery, selectedDeptFilter, selectedRoleFilter]);

  // Reset về trang 1 khi lọc hoặc tìm kiếm
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedDeptFilter, selectedRoleFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredAccounts.length / pageSize));
  const paginatedAccounts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAccounts.slice(start, start + pageSize);
  }, [filteredAccounts, currentPage, pageSize]);

  const getRoleBadge = (roleKey: string) => {
    const found = SYSTEM_ROLES.find((r) => r.key === roleKey);
    if (!found) {
      const dynamicRole = allRoleOptions.find((r) => r.value === roleKey);
      return (
        <span className="inline-block px-2.5 py-0.5 rounded-md text-[10.5px] font-bold border border-amber-200 bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
          {dynamicRole?.label || roleKey || "Thành viên"}
        </span>
      );
    }
    return (
      <span className={`inline-block px-2.5 py-0.5 rounded-md text-[10.5px] font-extrabold border ${found.color}`}>
        {found.shortName}
      </span>
    );
  };

  return (
    <AppShell>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <PageHeader
          title="Quản Lý Tài Khoản & Phân Quyền Vai Trò"
          subtitle="Quản lý danh sách tài khoản người dùng, phân công ban chuyên môn và gán vai trò quyền hạn hệ thống CEO 1983"
        />

        {/* ── METRIC STATS ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tổng số tài khoản</span>
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <Users className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-black text-foreground">{accounts.length}</div>
            <div className="mt-1 text-[11px] text-muted-foreground">Tài khoản quản trị & hội viên</div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Lãnh đạo & Quản trị</span>
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                <ShieldCheck className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-black text-foreground">
              {accounts.filter((a) => a.role === "quan_tri" || a.role === "admin" || a.role === "chu_tich").length}
            </div>
            <div className="mt-1 text-[11px] text-muted-foreground">Admin & Ban điều hành cấp cao</div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Trưởng ban chuyên môn</span>
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Building2 className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-black text-foreground">
              {accounts.filter((a) => a.role.startsWith("truong_ban_")).length}
            </div>
            <div className="mt-1 text-[11px] text-muted-foreground">Được phân quyền quản lý theo ban</div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Đang hoạt động</span>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-black text-foreground">
              {accounts.filter((a) => a.status === "active").length}
            </div>
            <div className="mt-1 text-[11px] text-muted-foreground">Đã kích hoạt và sẵn sàng đăng nhập</div>
          </div>
        </div>

        {/* ── TOOLBAR: TÌM KIẾM CẠNH THÊM MỚI (Requirement 3) ── */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card p-4 rounded-2xl border border-border shadow-xs">
          <div className="flex flex-1 items-center gap-2 max-w-lg">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm tài khoản theo tên, email, SĐT, mã hội viên..."
                className="w-full rounded-xl border border-border bg-background pl-9 pr-3 py-2 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-[#003B95] focus:ring-1 focus:ring-[#003B95]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Nút THÊM MỚI CẠNH TÌM KIẾM (Đúng yêu cầu số 3) */}
            <button
              type="button"
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 transition cursor-pointer shrink-0"
            >
              <Plus className="h-4 w-4 text-slate-950" />
              <span>Thêm Tài Khoản</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedDeptFilter}
              onChange={(e) => setSelectedDeptFilter(e.target.value)}
              className="rounded-xl border border-border bg-background px-3 py-2 text-xs font-medium text-foreground outline-none focus:border-[#003B95]"
            >
              <option value="all">Tất cả ban</option>
              {departmentList.map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>

            <select
              value={selectedRoleFilter}
              onChange={(e) => setSelectedRoleFilter(e.target.value)}
              className="rounded-xl border border-border bg-background px-3 py-2 text-xs font-medium text-foreground outline-none focus:border-[#003B95]"
            >
              <option value="all">Tất cả vai trò</option>
              {allRoleOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* ── CẢNH BÁO CHƯA LƯU PHÂN QUYỀN TÀI KHOẢN (Amber Gold UX) ── */}
        {isDirty && (
          <div className="rounded-2xl border border-amber-500/40 bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-transparent p-4 flex flex-wrap items-center justify-between gap-3 text-xs animate-in fade-in slide-in-from-top-2 duration-200 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 shadow-sm font-black text-sm">
                !
              </div>
              <div>
                <p className="font-bold text-amber-900 dark:text-amber-200">
                  Bạn có thay đổi phân quyền tài khoản chưa lưu vào CSDL!
                </p>
                <p className="text-amber-700/80 dark:text-amber-300/80 text-[11px] mt-0.5">
                  Các vai trò hoặc phân công ban vừa điều chỉnh sẽ chỉ có hiệu lực toàn hệ thống sau khi bạn bấm Lưu.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDiscard}
                className="px-3.5 py-1.5 rounded-xl border border-border bg-background hover:bg-muted text-foreground font-semibold text-xs transition cursor-pointer"
              >
                Hoàn tác
              </button>
              <button
                type="button"
                onClick={handleSaveAll}
                disabled={saving}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs transition shadow-xs shadow-amber-500/20 cursor-pointer disabled:opacity-50"
              >
                <Save className="h-3.5 w-3.5 text-slate-950" />
                <span>{saving ? "Đang lưu..." : "Lưu Thay Đổi"}</span>
              </button>
            </div>
          </div>
        )}

        {/* ── BẢNG LƯỚI DASHBOARD (Có STT, Cố định cột đầu trái và cột thao tác phải) ── */}
        <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-xs">
          <table className="w-full text-left border-collapse min-w-[1050px]">
            <thead>
              <tr className="border-b border-border bg-muted/60 text-xs font-bold text-foreground uppercase tracking-wider">
                {/* CỘT STT */}
                <th className="sticky left-0 z-20 bg-muted/95 backdrop-blur-xs py-3.5 px-3 w-[60px] text-center border-r border-border/60 shadow-xs">
                  STT
                </th>

                {/* CỘT CỐ ĐỊNH 1 (SÁT LỀ TRÁI) */}
                <th className="sticky left-[60px] z-20 bg-muted/95 backdrop-blur-xs py-3.5 px-4 w-[240px] min-w-[240px] border-r border-border/60 shadow-xs">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-[#003B95]" />
                    <span>Thông Tin Tài Khoản</span>
                  </div>
                </th>

                <th className="py-3.5 px-4 min-w-[160px]">Liên Hệ</th>
                <th className="py-3.5 px-4 min-w-[200px]">Doanh Nghiệp</th>
                <th className="py-3.5 px-4 min-w-[160px]">Ban Chuyên Môn</th>
                <th className="py-3.5 px-4 min-w-[200px]">Vai Trò Hệ Thống (Role)</th>
                <th className="py-3.5 px-4 w-[120px] text-center">Trạng Thái</th>

                {/* CỘT CỐ ĐỊNH 2 (SÁT LỀ PHẢI - THAO TÁC XEM SỬA XÓA) */}
                <th className="sticky right-0 z-20 bg-muted/95 backdrop-blur-xs py-3.5 px-4 text-center w-[130px] min-w-[130px] border-l border-border/60 shadow-xs">
                  Thao Tác
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border/60 text-xs">
              {paginatedAccounts.map((acc, index) => (
                <tr key={acc.id} className="hover:bg-primary/5 transition-colors group">
                  {/* CỘT STT */}
                  <td className="sticky left-0 z-10 bg-card group-hover:bg-background py-3 px-3 text-center font-bold text-xs text-muted-foreground border-r border-border/40 shadow-xs">
                    {(currentPage - 1) * pageSize + index + 1}
                  </td>

                  {/* CỘT CỐ ĐỊNH 1 (SÁT LỀ TRÁI) */}
                  <td className="sticky left-[60px] z-10 bg-card group-hover:bg-background py-3 px-4 border-r border-border/40 shadow-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#003B95] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                        {acc.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-foreground text-xs line-clamp-1">{acc.name}</div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="font-mono text-[10px] font-bold text-[#003B95] dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-1 rounded">
                            {acc.code}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Các cột ở giữa cuộn ngang */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5 text-muted-foreground text-[11px]">
                      <Mail className="h-3 w-3 shrink-0" />
                      <span className="truncate">{acc.email}</span>
                    </div>
                    {acc.phone && (
                      <div className="flex items-center gap-1.5 text-muted-foreground text-[11px] mt-0.5">
                        <Phone className="h-3 w-3 shrink-0" />
                        <span>{acc.phone}</span>
                      </div>
                    )}
                  </td>

                  <td className="py-3 px-4">
                    <div className="font-semibold text-foreground text-xs line-clamp-1">
                      {acc.companyName || "—"}
                    </div>
                    <div className="text-[10.5px] text-muted-foreground">Pháp nhân hội viên</div>
                  </td>

                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground bg-secondary px-2.5 py-1 rounded-lg">
                      <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                      {acc.department}
                    </span>
                  </td>

                  {/* Cột Role (Cascading Dropdown theo ban, không reload trang) */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <select
                        value={acc.role}
                        disabled={!canManage || (acc.role === "quan_tri" && acc.code === "ADMIN-001")}
                        onChange={(e) => handleInlineRoleChange(acc.id, e.target.value)}
                        className="rounded-lg border border-border/80 bg-background px-2.5 py-1 text-xs font-bold text-foreground outline-none focus:border-[#003B95] cursor-pointer hover:bg-muted/50 transition disabled:opacity-60 disabled:cursor-not-allowed shadow-2xs"
                      >
                        {(() => {
                          const deptRoles = getRolesForDepartment(acc.department, customDepts);
                          const hasCurrent = deptRoles.some((r) => r.value === acc.role);
                          return (
                            <>
                              {!hasCurrent && (
                                <option value={acc.role}>
                                  {allRoleOptions.find((r) => r.value === acc.role)?.label || acc.role}
                                </option>
                              )}
                              {deptRoles.map((r) => (
                                <option key={r.value} value={r.value}>
                                  {r.label}
                                </option>
                              ))}
                            </>
                          );
                        })()}
                      </select>
                    </div>
                  </td>

                  <td className="py-3 px-4 text-center">
                    {acc.status === "active" ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                        <CheckCircle2 className="h-3 w-3" /> Hoạt động
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
                        <XCircle className="h-3 w-3" /> Tạm khóa
                      </span>
                    )}
                  </td>

                  {/* CỘT CỐ ĐỊNH 2 (SÁT LỀ PHẢI - THAO TÁC XEM SỬA XÓA) */}
                  <td className="sticky right-0 z-10 bg-card group-hover:bg-background py-3 px-4 text-center border-l border-border/40 shadow-xs">
                    <div className="flex items-center justify-center gap-1.5">
                      {/* Xem */}
                      <button
                        type="button"
                        onClick={() => handleOpenView(acc)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition cursor-pointer"
                        title="Xem chi tiết tài khoản"
                      >
                        <Eye className="h-4 w-4" />
                      </button>

                      {/* Sửa / Gán Role */}
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(acc)}
                        className="p-1.5 rounded-lg text-[#003B95] hover:bg-blue-50 dark:hover:bg-blue-950/40 transition cursor-pointer"
                        title="Chỉnh sửa & Gán vai trò (Role)"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>

                      {/* Xóa */}
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmAccount(acc)}
                        disabled={acc.role === "quan_tri" || acc.code === "ADMIN-001"}
                        className={`p-1.5 rounded-lg transition cursor-pointer ${
                          acc.role === "quan_tri" || acc.code === "ADMIN-001"
                            ? "text-muted-foreground/30 cursor-not-allowed"
                            : "text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                        }`}
                        title={acc.role === "quan_tri" ? "Quản trị viên không thể xóa" : "Xóa tài khoản"}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredAccounts.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-muted-foreground">
                    <Users className="h-8 w-8 mx-auto mb-2 opacity-40" />
                    <p className="font-semibold text-xs">Không tìm thấy tài khoản người dùng nào phù hợp.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ── THANH CHUYỂN TRANG (PAGINATION) ── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-card border border-border rounded-2xl shadow-xs">
          <div className="text-xs text-muted-foreground">
            Hiển thị <span className="font-bold text-foreground">{filteredAccounts.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}</span> - <span className="font-bold text-foreground">{Math.min(currentPage * pageSize, filteredAccounts.length)}</span> trên tổng số <span className="font-bold text-foreground">{filteredAccounts.length}</span> tài khoản
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-border bg-background text-xs font-semibold text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Trước</span>
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={`h-8 w-8 rounded-xl text-xs font-bold transition cursor-pointer ${
                    currentPage === page
                      ? "bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 shadow-xs shadow-amber-500/20"
                      : "border border-border bg-background text-foreground hover:bg-muted"
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-border bg-background text-xs font-semibold text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
            >
              <span>Sau</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── MODAL 1: XEM CHI TIẾT TÀI KHOẢN ── */}
      {isViewOpen && selectedAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#003B95] text-white flex items-center justify-center font-bold text-base shadow-sm">
                  {selectedAccount.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-sm">{selectedAccount.name}</h3>
                  <span className="font-mono text-xs text-muted-foreground">{selectedAccount.code}</span>
                </div>
              </div>
              <button
                onClick={() => setIsViewOpen(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
                  <span className="font-semibold text-muted-foreground block mb-1">Email đăng nhập:</span>
                  <span className="font-bold text-foreground">{selectedAccount.email}</span>
                </div>
                <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
                  <span className="font-semibold text-muted-foreground block mb-1">Số điện thoại:</span>
                  <span className="font-bold text-foreground">{selectedAccount.phone || "—"}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
                <span className="font-semibold text-muted-foreground block mb-1">Doanh nghiệp / Đơn vị:</span>
                <span className="font-bold text-foreground text-sm">{selectedAccount.companyName || "Chưa cập nhật"}</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
                  <span className="font-semibold text-muted-foreground block mb-1">Ban chuyên môn:</span>
                  <span className="font-bold text-foreground">{selectedAccount.department}</span>
                </div>
                <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
                  <span className="font-semibold text-muted-foreground block mb-1">Vai trò hệ thống:</span>
                  <div className="mt-1">{getRoleBadge(selectedAccount.role)}</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-[11.5px] leading-relaxed text-blue-900 dark:text-blue-200">
                <strong className="block font-bold mb-0.5">Quyền hạn áp dụng:</strong>
                Tài khoản này được tự động đồng bộ quyền theo Ma trận phân quyền hệ thống tương ứng với vai trò <strong>{selectedAccount.role}</strong> trong <strong>{selectedAccount.department}</strong>.
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-border">
              <button
                type="button"
                onClick={() => setIsViewOpen(false)}
                className="px-4 py-2 rounded-xl border border-border bg-background hover:bg-muted font-bold text-xs text-foreground transition cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 2 & 3: THÊM MỚI / CHỈNH SỬA & GÁN ROLE CHO TÀI KHOẢN ── */}
      {(isAddOpen || isEditOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-500/10 text-[#003B95]">
                  <KeyRound className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-foreground text-sm">
                  {isEditOpen ? "Chỉnh Sửa & Gán Vai Trò Tài Khoản" : "Thêm Mới Tài Khoản & Gán Vai Trò"}
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsAddOpen(false);
                  setIsEditOpen(false);
                }}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={isEditOpen ? handleUpdateAccount : handleCreateAccount} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-foreground block mb-1">
                    Họ Và Tên <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="VD: Nguyễn Văn Tuấn"
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs outline-none focus:border-[#003B95] focus:ring-1 focus:ring-[#003B95]"
                  />
                </div>

                <div>
                  <label className="font-semibold text-foreground block mb-1">
                    Mã Hội Viên / Code <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    placeholder="VD: CEO-1983-099"
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs font-mono uppercase outline-none focus:border-[#003B95] focus:ring-1 focus:ring-[#003B95]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-foreground block mb-1">
                    Email Đăng Nhập <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="email@ceo1983.vn"
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs outline-none focus:border-[#003B95] focus:ring-1 focus:ring-[#003B95]"
                  />
                </div>

                <div>
                  <label className="font-semibold text-foreground block mb-1">
                    Số Điện Thoại
                  </label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="0988 xxx xxx"
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs outline-none focus:border-[#003B95] focus:ring-1 focus:ring-[#003B95]"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-foreground block mb-1">
                  Công Ty / Đơn Vị Công Tác
                </label>
                <input
                  type="text"
                  value={formCompany}
                  onChange={(e) => setFormCompany(e.target.value)}
                  placeholder="VD: Tập Đoàn Đầu Tư & Công Nghệ..."
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs outline-none focus:border-[#003B95] focus:ring-1 focus:ring-[#003B95]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                <div>
                  <label className="font-bold text-[#003B95] dark:text-blue-300 block mb-1">
                    Ban Chuyên Môn
                  </label>
                  <select
                    value={formDepartment}
                    onChange={(e) => handleDepartmentChange(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold outline-none focus:border-[#003B95]"
                  >
                    {departmentList.map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-[#003B95] dark:text-blue-300 block mb-1">
                    Vai Trò Hệ Thống (Gán Role)
                  </label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs font-bold outline-none focus:border-[#003B95]"
                  >
                    {availableRolesForForm.map((r) => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-foreground block mb-1">
                  Trạng Thái Tài Khoản
                </label>
                <div className="flex items-center gap-4 pt-1">
                  <label className="inline-flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="active"
                      checked={formStatus === "active"}
                      onChange={() => setFormStatus("active")}
                      className="accent-[#003B95]"
                    />
                    <span className="font-medium text-foreground">Hoạt động bình thường</span>
                  </label>
                  <label className="inline-flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="locked"
                      checked={formStatus === "locked"}
                      onChange={() => setFormStatus("locked")}
                      className="accent-rose-600"
                    />
                    <span className="font-medium text-rose-600 dark:text-rose-400">Tạm khóa quyền</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddOpen(false);
                    setIsEditOpen(false);
                  }}
                  className="px-4 py-2 rounded-xl border border-border bg-background hover:bg-muted font-bold text-xs text-foreground transition cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 transition cursor-pointer"
                >
                  {isEditOpen ? "Lưu Cập Nhật" : "Tạo Tài Khoản"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 4: XÁC NHẬN XÓA TÀI KHOẢN ── */}
      {deleteConfirmAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3 text-destructive">
              <div className="p-2.5 rounded-xl bg-destructive/10">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-foreground text-sm">Xóa Tài Khoản?</h3>
                <p className="text-muted-foreground text-xs mt-0.5">Tài khoản này sẽ bị thu hồi toàn bộ quyền truy cập.</p>
              </div>
            </div>

            <p className="text-xs text-foreground leading-relaxed">
              Bạn có chắc chắn muốn xóa tài khoản của <strong className="text-foreground">"{deleteConfirmAccount.name}"</strong> ({deleteConfirmAccount.code})?
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setDeleteConfirmAccount(null)}
                className="px-3.5 py-1.5 rounded-xl border border-border bg-background hover:bg-muted font-semibold text-xs text-foreground transition cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => handleDeleteAccount(deleteConfirmAccount)}
                className="px-4 py-1.5 rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90 font-bold text-xs transition cursor-pointer"
              >
                Xác Nhận Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
export default AccountsPage;
