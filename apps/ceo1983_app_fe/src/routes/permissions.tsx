import { useState, useRef } from "react";
import { createFileRoute, useBlocker } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ShieldCheck,
  Lock,
  AlertTriangle,
  Save,
  LogOut,
  Users,
  Building2,
  SlidersHorizontal,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/dashboard/AppShell";
import { Card } from "@/components/dashboard/PageKit";
import { useRole } from "@/hooks/use-role";
import { RbacPermissionMatrix } from "@/components/dashboard/RbacPermissionMatrix";
import { MemberPermissionsByCommittee } from "@/components/dashboard/MemberPermissionsByCommittee";
import { DepartmentManagementSection } from "@/components/dashboard/DepartmentManagementSection";
import { dispatchPermissionSyncEvent } from "@/lib/rbac-permission-helpers";
import { fetchNestApi } from "@/lib/api-client";

export const Route = createFileRoute("/permissions")({
  component: PermissionsPage,
});

import {
  getCustomDepartments,
  getAllDynamicRoleOptions,
  getRolesForDepartment,
  INITIAL_DEPARTMENTS,
  DepartmentItem,
} from "@/lib/rbac-permission-helpers";

export const ROLE_OPTIONS = [
  { value: "quan_tri", label: "Quản trị", desc: "Toàn quyền quản trị hệ thống" },
  { value: "chu_tich", label: "Chủ tịch", desc: "Chủ tịch Hiệp hội" },
  { value: "admin", label: "Admin", desc: "Quản trị viên" },
  { value: "ban_dieu_hanh", label: "Ban Điều Hành", desc: "Lãnh đạo điều hành" },
  { value: "tong_thu_ky", label: "Tổng thư ký", desc: "Điều phối thư ký" },
  { value: "truong_ban_dieu_hanh", label: "Trưởng ban Điều hành", desc: "Quản lý tổ chức, điều hành" },
  { value: "truong_ban_truyen_thong", label: "Trưởng ban Truyền thông", desc: "Quản lý truyền thông" },
  { value: "truong_ban_thanh_vien", label: "Trưởng ban Thành viên", desc: "Quản lý hội viên" },
  { value: "truong_ban_xuc_tien", label: "Trưởng ban Xúc tiến", desc: "Quản lý giao thương" },
  { value: "truong_ban_tai_chinh", label: "Trưởng ban Tài chính", desc: "Quản lý tài chính" },
  { value: "truong_ban_thien_nguyen", label: "Trưởng ban Thiện nguyện", desc: "Quản trị thiện nguyện" },
  { value: "member", label: "Thành viên", desc: "Hội viên chính thức" },
];

export function getDynamicRoleOptions(): { value: string; label: string; desc?: string }[] {
  return getAllDynamicRoleOptions();
}

export function normalizeRole(r?: string): string {
  if (!r) return "member";
  const s = r.toLowerCase().trim();
  if (s.startsWith("truong_ban_")) return s;
  if (s.includes("chủ tịch") || s === "chu_tich" || s === "president") return "chu_tich";
  if (
    s === "quan_tri" ||
    s === "platform_admin" ||
    s === "superadmin" ||
    s.includes("hệ thống") ||
    s === "quản trị"
  )
    return "quan_tri";
  if (s === "admin" || s === "adm") return "admin";
  if (s.includes("tổng thư ký") || s.includes("tong_thu_ky") || s === "ttk")
    return "tong_thu_ky";
  if (s.includes("ban điều hành") || s.includes("điều hành") || s === "truong_ban_dieu_hanh" || s === "ban_dieu_hanh" || s === "bdh")
    return "truong_ban_dieu_hanh";
  if (s.includes("truyền thông") || s.includes("btt") || s === "truong_ban_truyen_thong")
    return "truong_ban_truyen_thong";
  if (s.includes("thành viên") || s.includes("btv") || s === "truong_ban_thanh_vien")
    return "truong_ban_thanh_vien";
  if (s.includes("xúc tiến") || s.includes("bxt") || s.includes("thương mại") || s === "truong_ban_xuc_tien")
    return "truong_ban_xuc_tien";
  if (s.includes("tài chính") || s.includes("btc") || s === "truong_ban_tai_chinh")
    return "truong_ban_tai_chinh";
  if (s.includes("thiện nguyện") || s.includes("btn") || s === "truong_ban_thien_nguyen")
    return "truong_ban_thien_nguyen";
  if (s.includes("thư ký"))
    return "tong_thu_ky";
  return "member";
}

export const DEPARTMENT_OPTIONS = [
  "Ban Điều Hành",
  "Ban Thư Ký",
  "Ban Thành viên",
  "Ban Xúc tiến",
  "Ban Truyền thông",
  "Ban Tài chính",
  "Ban Thiện nguyện",
];

export function getDynamicDepartmentOptions(): string[] {
  const custom = typeof window !== "undefined" ? getCustomDepartments() : INITIAL_DEPARTMENTS;
  const list = [...DEPARTMENT_OPTIONS];
  custom.forEach((c) => {
    if (!list.includes(c.name)) list.push(c.name);
  });
  return list;
}

export function normalizeDept(d?: string): string {
  if (!d) return "Hội viên ceo1983";
  const s = d.toLowerCase().trim();
  if (s.includes("thành viên") && !s.includes("hội viên") && !s.includes("ceo")) return "Ban Thành viên";
  if (s.includes("xúc tiến") || s.includes("thương mại") || s.includes("b2b")) return "Ban Xúc tiến";
  if (s.includes("thiện nguyện") || s.includes("an sinh")) return "Ban Thiện nguyện";
  if (s.includes("truyền thông") || s.includes("sự kiện") || s.includes("báo chí")) return "Ban Truyền thông";
  if (s.includes("điều hành") || s.includes("bdh")) return "Ban Điều Hành";
  if (s.includes("thư ký")) return "Ban Thư Ký";
  if (s.includes("tài chính") || s.includes("ngân sách") || s.includes("thu chi")) return "Ban Tài chính";

  if (typeof window !== "undefined") {
    try {
      const custom = getCustomDepartments();
      const match = custom.find((c) => c.name.toLowerCase() === s || c.code.toLowerCase() === s);
      if (match) return match.name;
    } catch {}
  }

  return d;
}

function PermissionsPage() {
  const { isPlatformAdmin, isBQT, isAdmin, srsRole, loading } = useRole();
  const qc = useQueryClient();
  const hasAccess =
    isPlatformAdmin ||
    isBQT ||
    isAdmin ||
    srsRole === "BQT" ||
    srsRole === "ADM" ||
    srsRole === "admin" ||
    srsRole === "quan_tri" ||
    srsRole === "ban_dieu_hanh";

  const [activeTab, setActiveTab] = useState<"committee" | "matrix" | "departments">("committee");

  // Fetch Members List for Committee Permissions
  const {
    data: members = [],
    isLoading: membersLoading,
    refetch: refetchMembers,
  } = useQuery({
    queryKey: ["permissions-members"],
    queryFn: async () => {
      const res = await fetchNestApi<any[]>("/members");
      return Array.isArray(res) ? res : [];
    },
  });

  // API update role & department for a member
  const handleUpdateRoleDept = async (p: {
    memberId: string;
    executiveRole: string;
    department: string;
    associationId?: string;
  }) => {
    const res = await fetchNestApi(`/members/${p.memberId}/role-dept`, {
      method: "PATCH",
      body: JSON.stringify(p),
    });
    await qc.invalidateQueries({ queryKey: ["permissions-members"] });
    await qc.invalidateQueries({ queryKey: ["members"] });
    refetchMembers();
    return res;
  };

  const [matrixDirty, setMatrixDirty] = useState(false);
  const [committeeDirty, setCommitteeDirty] = useState(false);
  const isDirty = matrixDirty || committeeDirty;

  const matrixSaveRef = useRef<(() => Promise<boolean>) | null>(null);
  const matrixDiscardRef = useRef<(() => void) | null>(null);
  const committeeSaveRef = useRef<(() => Promise<boolean>) | null>(null);
  const committeeDiscardRef = useRef<(() => void) | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const blocker = useBlocker({
    shouldBlockFn: () => isDirty,
    withResolver: true,
    enableBeforeUnload: true,
  });

  const showUnsavedModal = blocker.status === "blocked";

  const handleSaveAndProceed = async () => {
    setIsSaving(true);
    try {
      if (matrixDirty && matrixSaveRef.current) {
        await matrixSaveRef.current();
      }
      if (committeeDirty && committeeSaveRef.current) {
        await committeeSaveRef.current();
      }
      setMatrixDirty(false);
      setCommitteeDirty(false);
      dispatchPermissionSyncEvent();
      toast.success("Đã lưu các thay đổi phân quyền!");
      blocker.proceed?.();
    } catch (err: any) {
      toast.error(err?.message || "Lỗi khi lưu phân quyền");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscardAndProceed = () => {
    if (matrixDiscardRef.current) {
      matrixDiscardRef.current();
    }
    if (committeeDiscardRef.current) {
      committeeDiscardRef.current();
    }
    setMatrixDirty(false);
    setCommitteeDirty(false);
    toast.info("Đã hủy các thay đổi chưa lưu.");
    blocker.proceed?.();
  };

  const handleStay = () => {
    blocker.reset?.();
  };

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
      <div className="w-full min-h-screen bg-[#f8fafc] dark:bg-slate-950 pb-16">
        {/* Top Header & Navigation Tabs */}
        <div className="border-b border-border/80 bg-background/95 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-6 lg:px-8 py-3.5 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#003B95]/10 text-[#003B95] dark:bg-blue-950/60 dark:text-blue-300">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  RBAC V2 & BAN CHUYÊN MÔN
                </span>
                {isDirty && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-400 animate-pulse">
                    <AlertTriangle className="w-3 h-3" />
                    Có thay đổi chưa lưu
                  </span>
                )}
              </div>
              <h1 className="text-lg sm:text-xl font-black text-foreground tracking-tight mt-1">
                Phân Quyền & Quản Trị Vai Trò CEO 1983
              </h1>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-muted/70 border border-border/60">
              <button
                type="button"
                onClick={() => setActiveTab("committee")}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "committee"
                    ? "bg-card text-foreground shadow-xs border border-border/50 text-[#003B95] dark:text-blue-400"
                    : "text-muted-foreground hover:text-foreground hover:bg-card/50"
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Theo Ban & Hội Viên</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("matrix")}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "matrix"
                    ? "bg-card text-foreground shadow-xs border border-border/50 text-[#003B95] dark:text-blue-400"
                    : "text-muted-foreground hover:text-foreground hover:bg-card/50"
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>Ma Trận Hệ Thống & App Mobile</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("departments")}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "departments"
                    ? "bg-card text-foreground shadow-xs border border-border/50 text-[#003B95] dark:text-blue-400"
                    : "text-muted-foreground hover:text-foreground hover:bg-card/50"
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>Ban Chuyên Môn</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tab 1: Member Permissions by Committee */}
        <div className={activeTab === "committee" ? "block" : "hidden"}>
          <MemberPermissionsByCommittee
            members={members}
            loading={membersLoading}
            onUpdateRoleDept={handleUpdateRoleDept}
            onDirtyChange={setCommitteeDirty}
            saveTriggerRef={committeeSaveRef}
            discardTriggerRef={committeeDiscardRef}
          />
        </div>

        {/* Tab 2: System & Mobile App RBAC Matrix */}
        <div className={activeTab === "matrix" ? "block" : "hidden"}>
          <RbacPermissionMatrix
            onDirtyChange={setMatrixDirty}
            saveTriggerRef={matrixSaveRef}
            discardTriggerRef={matrixDiscardRef}
          />
        </div>

        {/* Tab 3: Custom Department Management */}
        <div className={activeTab === "departments" ? "block" : "hidden"}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <DepartmentManagementSection />
          </div>
        </div>
      </div>

      {showUnsavedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="unsaved-modal-title"
            className="w-full max-w-md rounded-3xl border-2 border-amber-500/40 bg-card p-6 shadow-2xl transition-all animate-in zoom-in-95 duration-200"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 id="unsaved-modal-title" className="text-base font-bold text-foreground">
                  Thay đổi chưa lưu
                </h3>
                <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                  Bạn có các thay đổi trên ma trận phân quyền chưa lưu. Bạn có muốn lưu lại không?
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2.5 pt-4 border-t border-border">
              <button
                type="button"
                onClick={handleStay}
                disabled={isSaving}
                className="px-3.5 py-2 rounded-xl border border-border bg-background text-foreground hover:bg-muted font-medium text-xs transition cursor-pointer"
              >
                Ở lại
              </button>
              <button
                type="button"
                onClick={handleDiscardAndProceed}
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-rose-300 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 font-medium text-xs transition cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Không lưu</span>
              </button>
              <button
                type="button"
                onClick={handleSaveAndProceed}
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 transition cursor-pointer disabled:opacity-50"
              >
                <Save className="h-3.5 w-3.5 text-slate-950" />
                <span>{isSaving ? "Đang lưu..." : "Lưu thay đổi"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
