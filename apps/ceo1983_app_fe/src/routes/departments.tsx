import React, { useState, useEffect, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Building2,
  Plus,
  Search,
  Filter,
  Eye,
  Pencil,
  Trash2,
  Shield,
  Users,
  Briefcase,
  Megaphone,
  Coins,
  HeartHandshake,
  Calendar,
  CheckCircle2,
  X,
  AlertTriangle,
  RotateCcw,
  Mail,
  Phone,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/dashboard/AppShell";
import { PageHeader } from "@/components/dashboard/PageKit";
import {
  DepartmentItem,
  getCustomDepartments,
  saveCustomDepartments,
  INITIAL_DEPARTMENTS,
  dispatchPermissionSyncEvent,
} from "@/lib/rbac-permission-helpers";
import { useRole } from "@/hooks/use-role";
import { DEFAULT_MEMBERS } from "@/lib/members-data";
import { fetchNestApi } from "@/lib/api-client";
import { Pagination } from "@/components/dashboard/DataTablePagination";
import { StandardMetricCard, StandardMetricGrid } from "@/components/dashboard/KpiCard";

export const Route = createFileRoute("/departments")({
  component: DepartmentsPage,
});

const COLOR_MAP: Record<string, { bg: string; text: string; border: string; badge: string }> = {
  blue: {
    bg: "bg-blue-500/10",
    text: "text-blue-600 dark:text-blue-400",
    border: "border-blue-200 dark:border-blue-800/60",
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300",
  },
  purple: {
    bg: "bg-purple-500/10",
    text: "text-purple-600 dark:text-purple-400",
    border: "border-purple-200 dark:border-purple-800/60",
    badge: "bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300",
  },
  emerald: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-200 dark:border-emerald-800/60",
    badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
  },
  amber: {
    bg: "bg-amber-500/10",
    text: "text-amber-600 dark:text-amber-400",
    border: "border-amber-200 dark:border-amber-800/60",
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300",
  },
  rose: {
    bg: "bg-rose-500/10",
    text: "text-rose-600 dark:text-rose-400",
    border: "border-rose-200 dark:border-rose-800/60",
    badge: "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300",
  },
  yellow: {
    bg: "bg-yellow-500/10",
    text: "text-yellow-600 dark:text-yellow-400",
    border: "border-yellow-200 dark:border-yellow-800/60",
    badge: "bg-yellow-100 text-yellow-800 dark:bg-yellow-950/60 dark:text-yellow-300",
  },
  teal: {
    bg: "bg-teal-500/10",
    text: "text-teal-600 dark:text-teal-400",
    border: "border-teal-200 dark:border-teal-800/60",
    badge: "bg-teal-100 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300",
  },
  indigo: {
    bg: "bg-indigo-500/10",
    text: "text-indigo-600 dark:text-indigo-400",
    border: "border-indigo-200 dark:border-indigo-800/60",
    badge: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300",
  },
};

const AVAILABLE_COLORS = [
  { key: "blue", label: "Xanh dương" },
  { key: "purple", label: "Tím" },
  { key: "emerald", label: "Xanh lá" },
  { key: "amber", label: "Cam hổ phách" },
  { key: "rose", label: "Hồng cánh sen" },
  { key: "yellow", label: "Vàng kim" },
  { key: "teal", label: "Xanh mòng két" },
  { key: "indigo", label: "Chàm" },
];

function getDeptIcon(name: string, code: string) {
  const s = (name + " " + code).toLowerCase();
  if (s.includes("điều hành") || s.includes("bdh")) return Shield;
  if (s.includes("thư ký") || s.includes("btk")) return Calendar;
  if (s.includes("thành viên") || s.includes("btv")) return Users;
  if (s.includes("xúc tiến") || s.includes("bxt") || s.includes("thương mại")) return Briefcase;
  if (s.includes("truyền thông") || s.includes("btt")) return Megaphone;
  if (s.includes("tài chính") || s.includes("btc")) return Coins;
  if (s.includes("thiện nguyện") || s.includes("btn") || s.includes("từ thiện")) return HeartHandshake;
  return Building2;
}

function matchesDept(m: any, d: DepartmentItem): boolean {
  const mDept = String(m.department || m.dept || "").toLowerCase().trim();
  const dName = d.name.toLowerCase().trim();
  const dCode = d.code.toLowerCase().trim();

  if (!mDept) return false;
  if (mDept === dName || mDept === dCode || mDept === d.id.toLowerCase()) return true;

  // Normalized keywords matching for core departments
  if (dCode === "bdh" || dName.includes("điều hành")) {
    return mDept.includes("điều hành") || mDept.includes("quản trị") || mDept === "bdh" || mDept === "dieu_hanh";
  }
  if (dCode === "btk" || dName.includes("thư ký")) {
    return mDept.includes("thư ký") || mDept === "btk" || mDept === "thu_ky";
  }
  if (dCode === "btv" || dName.includes("thành viên")) {
    return (mDept.includes("thành viên") && !mDept.includes("hội viên")) || mDept.includes("phát triển hội viên");
  }
  if (dCode === "bxt" || dName.includes("xúc tiến") || dName.includes("thương mại")) {
    return mDept.includes("xúc tiến") || mDept.includes("thương mại") || mDept.includes("đầu tư b2b") || mDept === "bxt" || mDept === "xuc_tien";
  }
  if (dCode === "btt" || dName.includes("truyền thông")) {
    return mDept.includes("truyền thông") || mDept === "btt" || mDept === "truyen_thong";
  }
  if (dCode === "btc" || dName.includes("tài chính")) {
    return mDept.includes("tài chính") || mDept === "btc" || mDept === "tai_chinh";
  }
  if (dCode === "btn" || dName.includes("thiện nguyện")) {
    return mDept.includes("thiện nguyện") || mDept.includes("từ thiện") || mDept === "btn" || mDept === "thien_nguyen";
  }

  return mDept.includes(dName) || dName.includes(mDept) || (Boolean(dCode) && mDept.includes(dCode));
}

function DepartmentsPage() {
  const { isPlatformAdmin, isBQT, isAdmin } = useRole();
  const canManage = isPlatformAdmin || isBQT || isAdmin;

  const [departments, setDepartments] = useState<DepartmentItem[]>(() => getCustomDepartments());
  const [searchQuery, setSearchQuery] = useState("");
  const [filterColor, setFilterColor] = useState("all");

  // Load real members from local accounts, DEFAULT_MEMBERS, and API
  const [allMembers, setAllMembers] = useState<any[]>(() => {
    let localAccounts: any[] = [];
    try {
      const raw = localStorage.getItem("vba_managed_accounts_v2");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) localAccounts = parsed;
      }
    } catch {}
    return [...DEFAULT_MEMBERS, ...localAccounts];
  });

  useEffect(() => {
    void fetchNestApi<any[]>("/members")
      .then((apiMembers) => {
        if (Array.isArray(apiMembers) && apiMembers.length > 0) {
          setAllMembers((prev) => {
            const map = new Map<string, any>();
            prev.forEach((m) => map.set(m.id || m.code || m.email, m));
            apiMembers.forEach((m) =>
              map.set(m.id || m.code || m.email, {
                ...map.get(m.id || m.code || m.email),
                ...m,
              })
            );
            return Array.from(map.values());
          });
        }
      })
      .catch(() => {});
  }, []);

  const deptMembersMap = useMemo(() => {
    const map: Record<string, any[]> = {};
    departments.forEach((d) => {
      map[d.id] = [];
    });

    allMembers.forEach((m) => {
      for (const d of departments) {
        if (matchesDept(m, d)) {
          const key = m.id || m.code || m.email;
          if (!map[d.id].some((existing) => (existing.id || existing.code || existing.email) === key)) {
            map[d.id].push(m);
          }
          break;
        }
      }
    });

    return map;
  }, [departments, allMembers]);

  // Modals
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState<DepartmentItem | null>(null);
  const [editingDeptId, setEditingDeptId] = useState<string | null>(null);
  const [deleteConfirmDept, setDeleteConfirmDept] = useState<DepartmentItem | null>(null);

  // Form state
  const [formName, setFormName] = useState("");
  const [formCode, setFormCode] = useState("");
  const [formHeadTitle, setFormHeadTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formColor, setFormColor] = useState("blue");
  const [formMemberCount, setFormMemberCount] = useState<number>(0);

  useEffect(() => {
    setDepartments(getCustomDepartments());
  }, []);

  const handleOpenAdd = () => {
    setEditingDeptId(null);
    setFormName("");
    setFormCode("");
    setFormHeadTitle("");
    setFormDescription("");
    setFormColor("blue");
    setFormMemberCount(0);
    setIsAddEditOpen(true);
  };

  const handleOpenEdit = (dept: DepartmentItem) => {
    setEditingDeptId(dept.id);
    setFormName(dept.name || "");
    setFormCode(dept.code || "");
    setFormHeadTitle(dept.headTitle || dept.leaderName || "");
    setFormDescription(dept.description || "");
    setFormColor(dept.color || "blue");
    setFormMemberCount(dept.memberCount || 0);
    setIsAddEditOpen(true);
  };

  const handleOpenView = (dept: DepartmentItem) => {
    setSelectedDept(dept);
    setIsViewOpen(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formCode.trim()) {
      toast.error("Vui lòng nhập tên ban và mã ban!");
      return;
    }

    if (editingDeptId) {
      const updated = departments.map((d) =>
        d.id === editingDeptId
          ? {
              ...d,
              name: formName.trim(),
              code: formCode.trim().toUpperCase(),
              headTitle: formHeadTitle.trim(),
              description: formDescription.trim(),
              color: formColor,
              memberCount: Number(formMemberCount) || 0,
            }
          : d
      );
      setDepartments(updated);
      saveCustomDepartments(updated);
      dispatchPermissionSyncEvent();
      toast.success(`Đã cập nhật thông tin "${formName}" thành công!`);
    } else {
      const newCode = formCode.trim().toUpperCase();
      if (departments.some((d) => d.code.toUpperCase() === newCode)) {
        toast.error(`Mã ban "${newCode}" đã tồn tại trên hệ thống!`);
        return;
      }

      const newDept: DepartmentItem = {
        id: `dept_${Date.now()}`,
        code: newCode,
        name: formName.trim(),
        headTitle: formHeadTitle.trim() || `Trưởng ${formName.trim()}`,
        description: formDescription.trim(),
        color: formColor,
        isCore: false,
        memberCount: Number(formMemberCount) || 0,
      };

      const next = [...departments, newDept];
      setDepartments(next);
      saveCustomDepartments(next);
      dispatchPermissionSyncEvent();
      toast.success(`Đã thêm mới Ban chuyên môn "${newDept.name}"!`);
    }

    setIsAddEditOpen(false);
  };

  const handleDeleteDept = (dept: DepartmentItem) => {
    if (dept.isCore) {
      toast.error("Đây là ban nòng cốt của Hiệp hội, không thể xóa!");
      return;
    }

    const next = departments.filter((d) => d.id !== dept.id);
    setDepartments(next);
    saveCustomDepartments(next);
    dispatchPermissionSyncEvent();
    setDeleteConfirmDept(null);
    toast.success(`Đã xóa ban "${dept.name}" khỏi hệ thống.`);
  };

  const handleResetDefaults = () => {
    if (!window.confirm("Khôi phục danh sách ban về mặc định (6 ban chuyên môn cốt lõi)?")) return;
    setDepartments(INITIAL_DEPARTMENTS);
    saveCustomDepartments(INITIAL_DEPARTMENTS);
    dispatchPermissionSyncEvent();
    toast.info("Đã khôi phục danh sách ban về mặc định.");
  };

  const filteredDepartments = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return departments.filter((d) => {
      const matchQuery =
        !q ||
        d.name.toLowerCase().includes(q) ||
        d.code.toLowerCase().includes(q) ||
        Boolean(d.headTitle && d.headTitle.toLowerCase().includes(q)) ||
        Boolean(d.leaderName && d.leaderName.toLowerCase().includes(q)) ||
        Boolean(d.description && d.description.toLowerCase().includes(q));
      const matchColor = filterColor === "all" || d.color === filterColor;
      return matchQuery && matchColor;
    });
  }, [departments, searchQuery, filterColor]);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, filterColor]);

  const pageCount = Math.max(1, Math.ceil(filteredDepartments.length / pageSize));
  const paginatedDepartments = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredDepartments.slice(start, start + pageSize);
  }, [filteredDepartments, page, pageSize]);

  const totalMembers = useMemo(
    () => departments.reduce((acc, d) => acc + (d.memberCount || 0), 0),
    [departments]
  );

  return (
    <AppShell>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <PageHeader
          title="Quản Lý Ban Chuyên Môn"
          subtitle="Cơ cấu tổ chức các ban chuyên môn, ban điều hành và phân công nhiệm vụ CLB Doanh Nhân CEO 1983"
        />

        {/* ── 4 METRIC CARDS (Format Chuẩn Ảnh 2 Figma) ── */}
        <StandardMetricGrid>
          <StandardMetricCard
            title="Tổng Số Ban"
            value={departments.length}
            subtitle="Toàn bộ ban chuyên môn & điều hành"
            icon={Building2}
            index={0}
          />
          <StandardMetricCard
            title="Ban Nòng Cốt"
            value={departments.filter((d) => d.isCore).length}
            subtitle="Theo quy chế hiệp hội Hà Nội"
            icon={Shield}
            index={1}
          />
          <StandardMetricCard
            title="Ban Mở Rộng"
            value={departments.filter((d) => !d.isCore).length}
            subtitle="Ban sáng kiến & dự án mới"
            icon={Plus}
            index={2}
          />
          <StandardMetricCard
            title="Hội Viên Trực Thuộc"
            value={totalMembers}
            subtitle="Đã được phân công vào các ban"
            icon={Users}
            index={3}
          />
        </StandardMetricGrid>

        {/* ── TOOLBAR: TÌM KIẾM CẠNH THÊM MỚI (Requirement 2) ── */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card p-4 rounded-2xl border border-border shadow-xs">
          <div className="flex flex-1 items-center gap-2 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm ban chuyên môn theo tên, mã ban, trưởng ban..."
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

            {/* Nút THÊM MỚI CẠNH TÌM KIẾM (Đúng yêu cầu số 2) */}
            <button
              type="button"
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 transition cursor-pointer shrink-0"
            >
              <Plus className="h-4 w-4 text-slate-950" />
              <span>Thêm Ban Mới</span>
            </button>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <select
              value={filterColor}
              onChange={(e) => setFilterColor(e.target.value)}
              className="rounded-xl border border-border bg-background px-3 py-2 text-xs font-medium text-foreground outline-none focus:border-[#003B95]"
            >
              <option value="all">Tất cả nhóm màu</option>
              {AVAILABLE_COLORS.map((c) => (
                <option key={c.key} value={c.key}>{c.label}</option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleResetDefaults}
              title="Khôi phục mặc định"
              className="p-2 rounded-xl border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition cursor-pointer"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* ── BẢNG LƯỚI DASHBOARD (Format Chuẩn Ma Trận Phân Quyền) ── */}
        <div className="self-stretch relative bg-white dark:bg-slate-900 rounded-[20px] outline outline-1 outline-offset-[-1px] outline-slate-200 dark:outline-slate-800 flex flex-col justify-start items-start overflow-x-auto shadow-xs">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                {/* CỘT STT */}
                <th className="sticky left-0 z-20 bg-slate-100 dark:bg-slate-800 py-3.5 px-3 w-[60px] text-center border-r border-slate-200 dark:border-slate-800 shadow-xs">
                  STT
                </th>

                {/* CỘT CỐ ĐỊNH 1 (SÁT LỀ TRÁI) */}
                <th className="sticky left-[60px] z-20 bg-muted/95 backdrop-blur-xs py-3.5 px-4 w-[240px] min-w-[240px] border-r border-border/60 shadow-xs">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-[#003B95]" />
                    <span>Ban Chuyên Môn</span>
                  </div>
                </th>

                <th className="py-3.5 px-4 min-w-[180px]">Trưởng Ban Phụ Trách</th>
                <th className="py-3.5 px-4 w-[140px] text-center">Thành Viên</th>
                <th className="py-3.5 px-4 min-w-[280px]">Nhiệm Vụ Cốt Lõi</th>

                {/* CỘT CỐ ĐỊNH 2 (SÁT LỀ PHẢI - THAO TÁC XEM SỬA XÓA) */}
                <th className="sticky right-0 z-20 bg-muted/95 backdrop-blur-xs py-3.5 px-4 text-center w-[130px] min-w-[130px] border-l border-border/60 shadow-xs">
                  Thao Tác
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border/60 text-xs">
              {paginatedDepartments.map((dept, index) => {
                const IconComponent = getDeptIcon(dept.name, dept.code);
                const colorConfig = COLOR_MAP[dept.color || "blue"] || COLOR_MAP.blue;
                const deptMembers = deptMembersMap[dept.id] || [];

                return (
                  <tr key={dept.id} className="hover:bg-primary/5 transition-colors group">
                    {/* CỘT STT */}
                    <td className="sticky left-0 z-10 bg-card group-hover:bg-background py-3 px-3 text-center border-r border-border/40 font-bold text-xs text-muted-foreground shadow-xs">
                      {(page - 1) * pageSize + index + 1}
                    </td>

                    {/* CỘT CỐ ĐỊNH 1 (SÁT LỀ TRÁI) */}
                    <td className="sticky left-[60px] z-10 bg-card group-hover:bg-background py-3 px-4 border-r border-border/40 shadow-xs">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${colorConfig.border} ${colorConfig.bg} ${colorConfig.text}`}>
                          <IconComponent className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-foreground text-xs line-clamp-1">{dept.name}</div>
                          <span className="font-mono text-[10px] font-bold text-muted-foreground uppercase">{dept.code}</span>
                        </div>
                      </div>
                    </td>

                    {/* Các cột ở giữa cuộn ngang */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-foreground">{dept.headTitle || dept.leaderName || "Trưởng ban"}</div>
                      <div className="text-[11px] text-muted-foreground">Phụ trách điều hành</div>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 font-bold text-[11px] border border-amber-500/20">
                        <Users className="h-3 w-3" />
                        <span>{deptMembers.length} thành viên</span>
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <p className="text-muted-foreground text-[11.5px] line-clamp-2 leading-relaxed">
                        {dept.description || "Chưa có mô tả nhiệm vụ chi tiết."}
                      </p>
                    </td>

                    {/* CỘT CỐ ĐỊNH 2 (SÁT LỀ PHẢI - THAO TÁC XEM SỬA XÓA) */}
                    <td className="sticky right-0 z-10 bg-card group-hover:bg-background py-3 px-4 text-center border-l border-border/40 shadow-xs">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Xem */}
                        <button
                          type="button"
                          onClick={() => handleOpenView(dept)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-800 transition cursor-pointer dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300"
                          title="Xem chi tiết và danh sách thành viên ban"
                          aria-label="Xem chi tiết và danh sách thành viên ban"
                        >
                          <Eye className="h-4 w-4" strokeWidth={2.2} />
                        </button>

                        {/* Sửa */}
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(dept)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 text-blue-800 hover:bg-blue-100 hover:text-blue-900 transition cursor-pointer dark:bg-blue-950/50 dark:border-blue-800 dark:text-blue-300"
                          title="Chỉnh sửa ban"
                          aria-label="Chỉnh sửa ban"
                        >
                          <Pencil className="h-4 w-4" strokeWidth={2.2} />
                        </button>

                        {/* Xóa */}
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmDept(dept)}
                          disabled={dept.isCore}
                          className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border transition ${
                            dept.isCore
                              ? "border-slate-200/50 bg-slate-50 text-slate-300 cursor-not-allowed dark:bg-slate-800/40 dark:border-slate-800 dark:text-slate-600"
                              : "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 hover:text-rose-800 cursor-pointer dark:bg-rose-950/50 dark:border-rose-800 dark:text-rose-300"
                          }`}
                          title={dept.isCore ? "Ban nòng cốt không thể xóa" : "Xóa ban"}
                          aria-label="Xóa ban"
                        >
                          <Trash2 className="h-4 w-4" strokeWidth={2.2} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredDepartments.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground">
                    <Building2 className="h-8 w-8 mx-auto mb-2 opacity-40" />
                    <p className="font-semibold text-xs">Không tìm thấy ban chuyên môn nào phù hợp.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* ── THANH CHUYỂN TRANG (PAGINATION CHUẨN CRM ẢNH 1) ── */}
          <Pagination
            page={page}
            pageCount={pageCount}
            pageSize={pageSize}
            total={filteredDepartments.length}
            from={filteredDepartments.length === 0 ? 0 : (page - 1) * pageSize + 1}
            to={Math.min(page * pageSize, filteredDepartments.length)}
            onPage={(p) => setPage(p)}
            onPageSize={(size) => {
              setPageSize(size);
              setPage(1);
            }}
            pageSizeOptions={[10, 20, 50, 100]}
          />
        </div>
      </div>

      {/* ── MODAL 1: XEM CHI TIẾT BAN CHUYÊN MÔN & DANH SÁCH THÀNH VIÊN ── */}
      {isViewOpen && selectedDept && (() => {
        const viewMembers = deptMembersMap[selectedDept.id] || [];
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
            <div className="w-full max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-xl space-y-4 max-h-[90vh] flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border pb-3 shrink-0">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${COLOR_MAP[selectedDept.color || "blue"]?.bg || "bg-blue-500/10"}`}>
                    <Building2 className="h-6 w-6 text-[#003B95]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-foreground text-base">{selectedDept.name}</h3>
                      <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-muted text-muted-foreground uppercase font-bold border border-border">
                        {selectedDept.code}
                      </span>
                      {selectedDept.isCore ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                          Ban Nòng Cốt
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 border border-blue-500/20">
                          Ban Mở Rộng
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground mt-0.5 block">
                      Phụ trách: <strong className="text-foreground">{selectedDept.headTitle || selectedDept.leaderName || "Trưởng ban"}</strong>
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setIsViewOpen(false)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Body */}
              <div className="space-y-4 overflow-y-auto pr-1 flex-1 text-xs">
                {/* Description */}
                <div className="p-3.5 rounded-xl bg-muted/40 border border-border/60">
                  <span className="font-semibold text-muted-foreground block mb-1">Quy chế & Nhiệm vụ cốt lõi:</span>
                  <p className="text-foreground leading-relaxed text-xs">{selectedDept.description || "Chưa có quy chế cụ thể."}</p>
                </div>

                {/* Members list section */}
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-[#003B95]" />
                      <span className="font-bold text-sm text-foreground">
                        Danh Sách Hội Viên Thuộc Ban
                      </span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#003B95]/10 text-[#003B95]">
                      {viewMembers.length} thành viên
                    </span>
                  </div>

                  {viewMembers.length === 0 ? (
                    <div className="text-center py-8 px-4 rounded-xl border border-dashed border-border bg-muted/20">
                      <Users className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
                      <p className="font-medium text-muted-foreground">Chưa có hội viên nào được ghi nhận thuộc ban này.</p>
                      <p className="text-[11px] text-muted-foreground/80 mt-1">Các hội viên được phân công vào ban sẽ tự động hiển thị tại đây.</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                      {viewMembers.map((m, idx) => {
                        const name = m.name || m.fullName || "Hội viên CEO 1983";
                        const code = m.code || m.memberCode || `Hội viên #${idx + 1}`;
                        const company = m.company || m.companyName || "";
                        const role = m.executiveRole || m.role || m.position || "Thành viên";
                        const avatar = m.avatar || m.avatarUrl;
                        const email = m.email;
                        const phone = m.phone || m.phoneNumber;

                        return (
                          <div
                            key={m.id || m.code || m.email || idx}
                            className="flex items-center justify-between gap-3 p-3 rounded-xl border border-border/70 bg-card hover:bg-muted/30 transition shadow-2xs"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="h-10 w-10 rounded-full border border-border/80 bg-muted flex items-center justify-center shrink-0 overflow-hidden">
                                {avatar ? (
                                  <img
                                    src={avatar}
                                    alt={name}
                                    className="h-full w-full object-cover"
                                    onError={(e) => {
                                      (e.target as HTMLElement).style.display = "none";
                                    }}
                                  />
                                ) : (
                                  <span className="font-bold text-xs text-[#003B95]">
                                    {name.charAt(0).toUpperCase()}
                                  </span>
                                )}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-bold text-sm text-foreground truncate">{name}</h4>
                                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border shrink-0">
                                    {code}
                                  </span>
                                </div>
                                <div className="text-[11px] text-muted-foreground truncate">
                                  {role} {company ? `• ${company}` : ""}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0 text-[11px] text-muted-foreground">
                              {phone && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-muted/60 border border-border/50">
                                  <Phone className="h-3 w-3 text-emerald-600" />
                                  <span>{phone}</span>
                                </span>
                              )}
                              {email && (
                                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded-md bg-muted/60 border border-border/50 max-w-[140px] truncate" title={email}>
                                  <Mail className="h-3 w-3 text-blue-600" />
                                  <span className="truncate">{email}</span>
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end pt-3 border-t border-border shrink-0">
                <button
                  type="button"
                  onClick={() => setIsViewOpen(false)}
                  className="px-5 py-2 rounded-xl border border-border bg-background hover:bg-muted font-bold text-xs text-foreground transition cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── MODAL 2: THÊM MỚI / CHỈNH SỬA BAN CHUYÊN MÔN ── */}
      {isAddEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-foreground text-sm">
                {editingDeptId ? "Chỉnh Sửa Ban Chuyên Môn" : "Thêm Mới Ban Chuyên Môn"}
              </h3>
              <button
                onClick={() => setIsAddEditOpen(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-foreground block mb-1">
                    Tên Ban Chuyên Môn <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="VD: Ban Đào Tạo & Khởi Nghiệp"
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs outline-none focus:border-[#003B95] focus:ring-1 focus:ring-[#003B95]"
                  />
                </div>

                <div>
                  <label className="font-semibold text-foreground block mb-1">
                    Mã Ban (Code) <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    placeholder="VD: BAN_DAO_TAO"
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs font-mono uppercase outline-none focus:border-[#003B95] focus:ring-1 focus:ring-[#003B95]"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-foreground block mb-1">
                  Chức Danh Người Phụ Trách
                </label>
                <input
                  type="text"
                  value={formHeadTitle}
                  onChange={(e) => setFormHeadTitle(e.target.value)}
                  placeholder="VD: Trưởng ban Đào tạo & Khởi nghiệp"
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs outline-none focus:border-[#003B95] focus:ring-1 focus:ring-[#003B95]"
                />
              </div>

              <div>
                <label className="font-semibold text-foreground block mb-1">
                  Mô Tả & Quy Chế Nhiệm Vụ
                </label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Mô tả chức năng, nhiệm vụ cốt lõi của ban trong hiệp hội..."
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs outline-none focus:border-[#003B95] focus:ring-1 focus:ring-[#003B95]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-foreground block mb-1">
                    Số Lượng Thành Viên
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formMemberCount}
                    onFocus={(e) => e.currentTarget.select()}
                    onChange={(e) => setFormMemberCount(Number(e.target.value))}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs outline-none focus:border-[#003B95] focus:ring-1 focus:ring-[#003B95]"
                  />
                </div>

                <div>
                  <label className="font-semibold text-foreground block mb-1">
                    Nhóm Màu Nhận Diện
                  </label>
                  <select
                    value={formColor}
                    onChange={(e) => setFormColor(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs outline-none focus:border-[#003B95]"
                  >
                    {AVAILABLE_COLORS.map((c) => (
                      <option key={c.key} value={c.key}>{c.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsAddEditOpen(false)}
                  className="px-4 py-2 rounded-xl border border-border bg-background hover:bg-muted font-bold text-xs text-foreground transition cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 transition cursor-pointer"
                >
                  {editingDeptId ? "Cập Nhật" : "Lưu Ban Mới"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 3: XÁC NHẬN XÓA BAN ── */}
      {deleteConfirmDept && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3 text-destructive">
              <div className="p-2.5 rounded-xl bg-destructive/10">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-foreground text-sm">Xóa Ban Chuyên Môn?</h3>
                <p className="text-muted-foreground text-xs mt-0.5">Hành động này không thể hoàn tác.</p>
              </div>
            </div>

            <p className="text-xs text-foreground leading-relaxed">
              Bạn có chắc chắn muốn xóa ban <strong className="text-foreground">"{deleteConfirmDept.name}"</strong>?
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setDeleteConfirmDept(null)}
                className="px-3.5 py-1.5 rounded-xl border border-border bg-background hover:bg-muted font-semibold text-xs text-foreground transition cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => handleDeleteDept(deleteConfirmDept)}
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
export default DepartmentsPage;
