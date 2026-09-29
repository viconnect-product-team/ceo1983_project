import { useState, useEffect, useCallback, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Check,
  Minus,
  ShieldCheck,
  Users,
  Briefcase,
  Save,
  RefreshCw,
  Search,
} from "lucide-react";
import { AppShell } from "@/components/dashboard/AppShell";
import { Card, PageHeader } from "@/components/dashboard/PageKit";
import { useRole } from "@/hooks/use-role";
import { baseLang, useLang, useT } from "@/lib/i18n";
import { useServerData } from "@/hooks/use-server-data";
import { listMembersFn, updateMemberRoleAndDeptFn } from "@/lib/members.functions";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { useTableControls } from "@/hooks/use-table-controls";
import { Pagination } from "@/components/dashboard/DataTablePagination";
import { fetchNestApi } from "@/lib/api-client";

export const Route = createFileRoute("/permissions")({
  component: PermissionsPage,
});

type Access = "full" | "scoped" | "own" | "none";

type Row = {
  feature: { vi: string; en: string };
  platform_admin: Access;
  admin: Access;
  tong_thu_ky: Access;
  truong_ban_thanh_vien: Access;
  truong_ban_tai_chinh: Access;
  truong_ban_truyen_thong: Access;
  truong_ban_xuc_tien: Access;
  member: Access;
};

const ROWS: Row[] = [
  {
    feature: { vi: "Quản trị hệ thống & Cấu hình nền tảng", en: "Platform & system management" },
    platform_admin: "full",
    admin: "scoped",
    tong_thu_ky: "none",
    truong_ban_thanh_vien: "none",
    truong_ban_tai_chinh: "none",
    truong_ban_truyen_thong: "none",
    truong_ban_xuc_tien: "none",
    member: "none",
  },
  {
    feature: { vi: "Họp phòng ban & Lịch Zoom", en: "Department meetings & Zoom" },
    platform_admin: "full",
    admin: "full",
    tong_thu_ky: "full",
    truong_ban_thanh_vien: "scoped",
    truong_ban_tai_chinh: "scoped",
    truong_ban_truyen_thong: "scoped",
    truong_ban_xuc_tien: "scoped",
    member: "own",
  },
  {
    feature: { vi: "Quản lý hội viên & Phân ban", en: "Members & committee assignment" },
    platform_admin: "full",
    admin: "full",
    tong_thu_ky: "scoped",
    truong_ban_thanh_vien: "full",
    truong_ban_tai_chinh: "scoped",
    truong_ban_truyen_thong: "scoped",
    truong_ban_xuc_tien: "scoped",
    member: "own",
  },
  {
    feature: { vi: "Thu chi, Tạm ứng & Hóa đơn", en: "Finance, advances & invoices" },
    platform_admin: "full",
    admin: "full",
    tong_thu_ky: "scoped",
    truong_ban_thanh_vien: "scoped",
    truong_ban_tai_chinh: "full",
    truong_ban_truyen_thong: "scoped",
    truong_ban_xuc_tien: "scoped",
    member: "own",
  },
  {
    feature: { vi: "Sự kiện, Điểm danh QR & Xếp chỗ VIP", en: "Events, check-in QR & VIP seating" },
    platform_admin: "full",
    admin: "full",
    tong_thu_ky: "scoped",
    truong_ban_thanh_vien: "scoped",
    truong_ban_tai_chinh: "scoped",
    truong_ban_truyen_thong: "full",
    truong_ban_xuc_tien: "scoped",
    member: "own",
  },
  {
    feature: { vi: "Sàn cơ hội kinh doanh & Matching", en: "Opportunities marketplace & matching" },
    platform_admin: "full",
    admin: "full",
    tong_thu_ky: "scoped",
    truong_ban_thanh_vien: "scoped",
    truong_ban_tai_chinh: "scoped",
    truong_ban_truyen_thong: "scoped",
    truong_ban_xuc_tien: "full",
    member: "own",
  },
  {
    feature: { vi: "Biểu quyết & Bốc thăm trúng thưởng", en: "Voting & Lucky draw" },
    platform_admin: "full",
    admin: "full",
    tong_thu_ky: "full",
    truong_ban_thanh_vien: "scoped",
    truong_ban_tai_chinh: "scoped",
    truong_ban_truyen_thong: "scoped",
    truong_ban_xuc_tien: "scoped",
    member: "own",
  },
];

const ROLE_OPTIONS = [
  { value: "platform_admin", label: "Platform Admin (Toàn quyền hệ thống)" },
  { value: "admin", label: "Quản trị (Admin Hiệp hội)" },
  { value: "tong_thu_ky", label: "Tổng thư ký" },
  { value: "truong_ban_thanh_vien", label: "Trưởng ban thành viên" },
  { value: "truong_ban_tai_chinh", label: "Trưởng ban tài chính" },
  { value: "truong_ban_truyen_thong", label: "Trưởng ban truyền thông" },
  { value: "truong_ban_xuc_tien", label: "Trưởng ban xúc tiến" },
  { value: "member", label: "Hội viên" },
];

const DEPARTMENT_OPTIONS = [
  "Ban Điều Hành",
  "Ban Quản Trị",
  "Ban Thư ký",
  "Ban Thành viên",
  "Ban Tài chính",
  "Ban Truyền thông",
  "Ban Xúc tiến thương mại",
  "Hội viên CEO 1983",
];

const ASSOCIATION_OPTIONS: { id: string; name: string; shortName: string }[] = [
  { id: "c1983000-0000-4000-8000-000000001983", name: "CLB Doanh Nhân CEO 1983", shortName: "CEO 1983" },
];

const TONE: Record<Access, { bg: string; fg: string }> = {
  full: { bg: "oklch(0.93 0.07 155)", fg: "oklch(0.40 0.16 155)" },
  scoped: { bg: "oklch(0.94 0.05 220)", fg: "oklch(0.42 0.15 220)" },
  own: { bg: "oklch(0.94 0.09 75)", fg: "oklch(0.45 0.14 65)" },
  none: { bg: "oklch(0.94 0.01 250)", fg: "oklch(0.55 0.02 250)" },
};

function Cell({
  access,
  label,
  onClick,
  title,
}: {
  access: Access;
  label: string;
  onClick?: () => void;
  title?: string;
}) {
  const s = TONE[access];
  return (
    <td className="px-3 py-2.5 text-center">
      {onClick ? (
        <button
          type="button"
          onClick={onClick}
          title={title || "Bấm để chuyển đổi quyền"}
          className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10.5px] font-semibold transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-2xs hover:ring-2 hover:ring-primary/30"
          style={{ background: s.bg, color: s.fg }}
        >
          {access === "none" ? <Minus className="h-2.5 w-2.5" /> : <Check className="h-2.5 w-2.5 stroke-[2.5]" />}
          {label}
        </button>
      ) : (
        <span
          className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-semibold"
          style={{ background: s.bg, color: s.fg }}
        >
          {access === "none" ? <Minus className="h-2.5 w-2.5" /> : <Check className="h-2.5 w-2.5 stroke-[2.5]" />}
          {label}
        </span>
      )}
    </td>
  );
}

function PermissionsPage() {
  const t = useT();
  const { lang } = useLang();
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

  // Persistent 8-Role Permission Matrix State
  const [matrixRows, setMatrixRows] = useState<Row[]>(ROWS);
  const [matrixLoading, setMatrixLoading] = useState(true);
  const [savingMatrix, setSavingMatrix] = useState(false);
  const [matrixModified, setMatrixModified] = useState(false);

  // Fetch persisted permission matrix from backend API
  const loadMatrix = useCallback(async () => {
    try {
      setMatrixLoading(true);
      const res = await fetchNestApi<{ rows: Row[] }>("/admin/permission-matrix");
      if (res?.rows && Array.isArray(res.rows) && res.rows.length > 0) {
        setMatrixRows(res.rows);
      }
    } catch (e) {
      console.warn("Could not load permission matrix from API, fallback to defaults:", e);
    } finally {
      setMatrixLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadMatrix();
  }, [loadMatrix]);

  const cycleAccess = (current: Access): Access => {
    const order: Access[] = ["full", "scoped", "own", "none"];
    const nextIdx = (order.indexOf(current) + 1) % order.length;
    return order[nextIdx];
  };

  const handleCellClick = (rowIndex: number, roleKey: keyof Omit<Row, "feature">) => {
    setMatrixRows((prev) => {
      const next = prev.map((row, idx) => {
        if (idx !== rowIndex) return row;
        return {
          ...row,
          [roleKey]: cycleAccess(row[roleKey]),
        };
      });
      return next;
    });
    setMatrixModified(true);
  };

  const handleSaveMatrix = async () => {
    try {
      setSavingMatrix(true);
      await fetchNestApi("/admin/permission-matrix", {
        method: "PUT",
        body: JSON.stringify({ rows: matrixRows }),
      });
      toast.success("Đã lưu ma trận phân quyền hệ thống thành công!");
      setMatrixModified(false);
    } catch (e: any) {
      toast.error(e?.message || "Lỗi khi lưu ma trận phân quyền.");
    } finally {
      setSavingMatrix(false);
    }
  };

  const filteredMembers = useMemo(() => {
    const ql = q.trim().toLowerCase();
    const list = Array.isArray(members) ? members : [];
    return list.filter((m: any) => {
      const mAssoc = edits[m.id]?.associationId ?? savedEdits[m.id]?.associationId ?? m.associationId ?? m.association_id ?? "c1983000-0000-4000-8000-000000001983";
      if (filterAssoc !== "all" && mAssoc !== filterAssoc) return false;
      const mRole = edits[m.id]?.role ?? savedEdits[m.id]?.role ?? m.executiveRole ?? m.role ?? "member";
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

  const handleRoleChange = (memberId: string, currentRole: string, currentDept: string, currentAssoc: string, newRole: string) => {
    setEdits((prev) => ({
      ...prev,
      [memberId]: {
        role: newRole,
        department: prev[memberId]?.department || savedEdits[memberId]?.department || currentDept || "Hội viên CEO 1983",
        associationId: prev[memberId]?.associationId || savedEdits[memberId]?.associationId || currentAssoc || "c1983000-0000-4000-8000-000000001983",
      },
    }));
  };

  const handleDeptChange = (memberId: string, currentRole: string, currentDept: string, currentAssoc: string, newDept: string) => {
    setEdits((prev) => ({
      ...prev,
      [memberId]: {
        role: prev[memberId]?.role || savedEdits[memberId]?.role || currentRole || "member",
        department: newDept,
        associationId: prev[memberId]?.associationId || savedEdits[memberId]?.associationId || currentAssoc || "c1983000-0000-4000-8000-000000001983",
      },
    }));
  };

  const handleAssocChange = (memberId: string, currentRole: string, currentDept: string, currentAssoc: string, newAssoc: string) => {
    setEdits((prev) => ({
      ...prev,
      [memberId]: {
        role: prev[memberId]?.role || savedEdits[memberId]?.role || currentRole || "member",
        department: prev[memberId]?.department || savedEdits[memberId]?.department || currentDept || "Hội viên CEO 1983",
        associationId: newAssoc,
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
          associationId: edit.associationId,
        },
      });

      if (res && (res as any).ok) {
        toast.success(`Đã cập nhật phân quyền thao tác cho hội viên ${m.name}`);
        // Giữ cố định quyền vừa lưu trong state để UI hiển thị ngay lập tức, không bị giật về giá trị cũ
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

  if (!loading && !hasAccess) {
    return (
      <AppShell>
        <div className="p-8">
          <Card className="p-10 text-center text-sm text-muted-foreground">
            <ShieldCheck className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
            {t("platform.forbidden")}
          </Card>
        </div>
      </AppShell>
    );
  }

  const legend: { key: Access; label: string }[] = [
    { key: "full", label: "Toàn quyền (Full)" },
    { key: "scoped", label: "Phạm vi ban (Scoped)" },
    { key: "own", label: "Chỉ cá nhân (Own)" },
    { key: "none", label: "Không có quyền (None)" },
  ];

  return (
    <AppShell>
      <div className="p-6 max-w-7xl mx-auto space-y-8">
        <PageHeader
          title="Ma Trận & Phân Quyền Quản Trị"
          subtitle="Phân quyền thao tác chi tiết cho từng tài khoản và cấu hình ma trận phân quyền 8 cấp bậc vai trò"
        />

        {/* Section 1: Phân Quyền Thao Tác Trực Tiếp Cho Tài Khoản */}
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Users className="w-4 h-4 text-[#003B95]" />
                Phân Quyền Thao Tác Trực Tiếp Cho Tài Khoản
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Chỉ định vai trò điều hành, phòng ban chuyên môn và phạm vi hiệp hội trực tiếp cho từng thành viên
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
                  value={filterAssoc}
                  onChange={(e) => setFilterAssoc(e.target.value)}
                  className="text-xs rounded-xl border border-border bg-background px-3 py-2 outline-none font-medium focus:border-primary"
                >
                  <option value="all">Tất cả hiệp hội</option>
                  {ASSOCIATION_OPTIONS.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>

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
                    <th className="px-4 py-3 min-w-[180px]">Họ tên & Doanh nghiệp</th>
                    <th className="px-4 py-3 min-w-[180px]">Email & SĐT</th>
                    <th className="px-4 py-3 min-w-[190px]">Hiệp hội trực thuộc</th>
                    <th className="px-4 py-3 min-w-[210px]">Vai trò / Quyền hạn</th>
                    <th className="px-4 py-3 min-w-[170px]">Ban chuyên môn</th>
                    <th className="px-4 py-3 text-center min-w-[120px]">Thao tác</th>
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
                      const currentRole = edits[m.id]?.role ?? savedEdits[m.id]?.role ?? m.executiveRole ?? m.role ?? "member";
                      const currentDept = edits[m.id]?.department ?? savedEdits[m.id]?.department ?? m.department ?? "Hội viên CEO 1983";
                      const currentAssoc = edits[m.id]?.associationId ?? savedEdits[m.id]?.associationId ?? m.associationId ?? m.association_id ?? "c1983000-0000-4000-8000-000000001983";
                      const isChanged = !!edits[m.id];
                      const isSaving = savingId === m.id;

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
                            <select
                              value={currentAssoc}
                              onChange={(e) => handleAssocChange(m.id, m.executiveRole, m.department, m.associationId || m.association_id, e.target.value)}
                              className="w-full text-xs font-semibold rounded-lg border border-border bg-blue-50/50 dark:bg-blue-950/20 text-[#003B95] dark:text-blue-300 px-2.5 py-1.5 focus:border-primary outline-none"
                            >
                              {ASSOCIATION_OPTIONS.map((assoc) => (
                                <option key={assoc.id} value={assoc.id}>
                                  {assoc.name}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="px-4 py-3">
                            <select
                              value={currentRole}
                              onChange={(e) => handleRoleChange(m.id, m.executiveRole, m.department, m.associationId || m.association_id, e.target.value)}
                              className="w-full text-xs font-medium rounded-lg border border-border bg-background px-2.5 py-1.5 focus:border-primary outline-none"
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
                              onChange={(e) => handleDeptChange(m.id, m.executiveRole, m.department, m.associationId || m.association_id, e.target.value)}
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
                            <button
                              type="button"
                              onClick={() => handleSave(m)}
                              disabled={isSaving || !isChanged}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                isChanged
                                  ? "bg-[#003B95] hover:bg-[#002b6d] text-white shadow-xs cursor-pointer active:scale-95"
                                  : "bg-secondary text-muted-foreground opacity-50 cursor-not-allowed"
                              }`}
                            >
                              <Save className="w-3.5 h-3.5" />
                              {isSaving ? "Đang lưu..." : "Lưu quyền"}
                            </button>
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

        {/* Section 2: Ma Trận Chi Tiết Phân Quyền 8 Cấp Bậc */}
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-[#003B95]" />
                Ma Trận Chi Tiết Phân Quyền 8 Cấp Bậc
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Bấm trực tiếp vào từng ô để chuyển đổi cấp độ phân quyền theo nhu cầu, sau đó bấm &quot;Lưu ma trận phân quyền&quot;
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex flex-wrap items-center gap-2">
                {legend.map((l) => {
                  const s = TONE[l.key];
                  return (
                    <span
                      key={l.key}
                      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold"
                      style={{ background: s.bg, color: s.fg }}
                    >
                      <span className="h-1.5 w-1.5 rounded-full" style={{ background: s.fg }} />
                      {l.label}
                    </span>
                  );
                })}
              </div>
              <button
                type="button"
                onClick={() => void loadMatrix()}
                disabled={matrixLoading}
                title="Tải lại ma trận"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-border bg-card hover:bg-secondary transition-all"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${matrixLoading ? "animate-spin" : ""}`} />
                <span>Tải lại</span>
              </button>
              <button
                type="button"
                onClick={handleSaveMatrix}
                disabled={savingMatrix || !matrixModified}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
                  matrixModified
                    ? "bg-[#003B95] hover:bg-[#002b6d] text-white shadow-md cursor-pointer active:scale-95"
                    : "bg-secondary text-muted-foreground opacity-60 cursor-not-allowed"
                }`}
              >
                <Save className="w-4 h-4" />
                <span>{savingMatrix ? "Đang lưu..." : "Lưu ma trận phân quyền"}</span>
              </button>
            </div>
          </div>

          <Card className="overflow-hidden border border-border shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/60 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    <th className="px-4 py-3 text-left">Chức năng hệ thống</th>
                    <th className="px-3 py-3 text-center">Platform Admin</th>
                    <th className="px-3 py-3 text-center">Quản trị</th>
                    <th className="px-3 py-3 text-center">Tổng thư ký</th>
                    <th className="px-3 py-3 text-center">TB Thành viên</th>
                    <th className="px-3 py-3 text-center">TB Tài chính</th>
                    <th className="px-3 py-3 text-center">TB T.Thông</th>
                    <th className="px-3 py-3 text-center">TB Xúc tiến</th>
                    <th className="px-3 py-3 text-center">Hội viên</th>
                  </tr>
                </thead>
                <tbody>
                  {matrixLoading ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-xs text-muted-foreground">
                        Đang tải ma trận phân quyền từ hệ thống...
                      </td>
                    </tr>
                  ) : (
                    matrixRows.map((r, i) => (
                      <tr key={i} className="border-b border-border last:border-0 hover:bg-secondary/30">
                        <td className="px-4 py-3 font-medium text-foreground text-xs">
                          {r.feature[baseLang(lang)]}
                        </td>
                        <Cell access={r.platform_admin} label="Toàn quyền" title="Platform Admin luôn toàn quyền" />
                        <Cell access={r.admin} label={legend.find((l) => l.key === r.admin)!.label} onClick={() => handleCellClick(i, "admin")} />
                        <Cell access={r.tong_thu_ky} label={legend.find((l) => l.key === r.tong_thu_ky)!.label} onClick={() => handleCellClick(i, "tong_thu_ky")} />
                        <Cell access={r.truong_ban_thanh_vien} label={legend.find((l) => l.key === r.truong_ban_thanh_vien)!.label} onClick={() => handleCellClick(i, "truong_ban_thanh_vien")} />
                        <Cell access={r.truong_ban_tai_chinh} label={legend.find((l) => l.key === r.truong_ban_tai_chinh)!.label} onClick={() => handleCellClick(i, "truong_ban_tai_chinh")} />
                        <Cell access={r.truong_ban_truyen_thong} label={legend.find((l) => l.key === r.truong_ban_truyen_thong)!.label} onClick={() => handleCellClick(i, "truong_ban_truyen_thong")} />
                        <Cell access={r.truong_ban_xuc_tien} label={legend.find((l) => l.key === r.truong_ban_xuc_tien)!.label} onClick={() => handleCellClick(i, "truong_ban_xuc_tien")} />
                        <Cell access={r.member} label={legend.find((l) => l.key === r.member)!.label} onClick={() => handleCellClick(i, "member")} />
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </section>
      </div>
    </AppShell>
  );
}
