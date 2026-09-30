import { useState, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  ShieldCheck,
  Users,
  Save,
  RefreshCw,
  Search,
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
  { value: "quan_tri", label: "Quản trị" },
  { value: "admin", label: "Admin" },
  { value: "tong_thu_ky", label: "Tổng thư ký" },
  { value: "truong_ban", label: "Trưởng ban" },
  { value: "member", label: "Thành viên" },
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

const ASSOCIATION_OPTIONS: { id: string; name: string; shortName: string }[] = [
  { id: "c1983000-0000-4000-8000-000000001983", name: "CLB Doanh Nhân CEO 1983", shortName: "CEO 1983" },
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

  const [activeTab, setActiveTab] = useState<"matrix" | "user_actions">("matrix");

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

  return (
    <AppShell>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <PageHeader
          title="Hệ Thống Phân Quyền & Quản Trị Thao Tác"
          subtitle="Tách biệt rõ ràng: Ma trận quyền theo 5 vai trò cốt lõi và Phân quyền thao tác trực tiếp cho từng tài khoản hội viên CEO 1983"
        />

        {/* Tab Switcher: Không gộp chung */}
        <div className="flex items-center gap-2 border-b border-border/80 pb-3">
          <button
            onClick={() => setActiveTab("matrix")}
            className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-bold transition cursor-pointer ${
              activeTab === "matrix"
                ? "bg-[#003B95] text-white shadow-sm"
                : "bg-card text-muted-foreground border border-border hover:bg-secondary hover:text-foreground"
            }`}
          >
            <ShieldCheck className="h-4 w-4" />
            <span>1. Ma Trận Phân Quyền 5 Cấp Bậc (Vai Trò x Chức Năng)</span>
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
            <span>2. Phân Quyền Thao Tác Trực Tiếp Cho Từng Tài Khoản</span>
            <span className="rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 text-[10px] px-2 py-0.5">
              {filteredMembers.length}
            </span>
          </button>
        </div>

        {/* TAB 1: Ma Trận Phân Quyền 5 Cấp Bậc (5 Roles on Left, Features at Column Headers) */}
        {activeTab === "matrix" && (
          <RbacPermissionMatrix />
        )}

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
                    <th className="px-4 py-3 min-w-[180px]">Họ tên & Doanh nghiệp</th>
                    <th className="px-4 py-3 min-w-[180px]">Email & SĐT</th>
                    <th className="px-4 py-3 min-w-[140px]">Hiệp hội trực thuộc</th>
                    <th className="px-4 py-3 min-w-[160px]">Vai trò / Quyền hạn</th>
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
                      const currentRole = edits[m.id]?.role ?? savedEdits[m.id]?.role ?? normalizeRole(m.executiveRole ?? m.role);
                      const currentDept = edits[m.id]?.department ?? savedEdits[m.id]?.department ?? normalizeDept(m.department);
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
        )}
      </div>
    </AppShell>
  );
}
