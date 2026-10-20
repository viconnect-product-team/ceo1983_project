import { useState, useRef } from "react";
import { createFileRoute, useBlocker } from "@tanstack/react-router";
import {
  ShieldCheck,
  Lock,
  AlertTriangle,
  Save,
  LogOut,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/dashboard/AppShell";
import { useRole } from "@/hooks/use-role";
import { RbacPermissionMatrix } from "@/components/dashboard/RbacPermissionMatrix";
import { dispatchPermissionSyncEvent } from "@/lib/rbac-permission-helpers";

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
  { value: "thanh_vien_ban_su_kien", label: "Thành viên Ban Sự Kiện", desc: "Thành viên chuyên môn Ban Sự Kiện" },
  { value: "thanh_vien_ban_xuc_tien", label: "Thành viên Ban Xúc Tiến Thương Mại", desc: "Thành viên chuyên môn Ban Xúc Tiến TM" },
  { value: "thanh_vien_ban_thanh_vien", label: "Thành viên Ban Thành Viên", desc: "Thành viên chuyên môn Ban Thành Viên" },
  { value: "thanh_vien_ban_truyen_thong", label: "Thành viên Ban Truyền Thông", desc: "Thành viên chuyên môn Ban Truyền Thông" },
  { value: "thanh_vien_ban_tai_chinh", label: "Thành viên Ban Tài Chính", desc: "Thành viên chuyên môn Ban Tài Chính" },
  { value: "thanh_vien_ban_thien_nguyen", label: "Thành viên Ban Thiện Nguyện", desc: "Thành viên chuyên môn Ban Thiện Nguyện" },
  { value: "member", label: "Hội viên", desc: "Hội viên chính thức hiệp hội" },
];

export function getDynamicRoleOptions(): { value: string; label: string; desc?: string }[] {
  return getAllDynamicRoleOptions();
}

export function normalizeRole(r?: string): string {
  if (!r) return "member";
  const s = r.toLowerCase().trim();
  if (s.startsWith("thanh_vien_ban_") || s.startsWith("truong_ban_")) return s;
  if (s.includes("thành viên ban sự kiện") || s.includes("ban sự kiện")) return "thanh_vien_ban_su_kien";
  if (s.includes("thành viên ban xúc tiến") || s.includes("xúc tiến thương mại")) return "thanh_vien_ban_xuc_tien";
  if (s.includes("thành viên ban thành viên")) return "thanh_vien_ban_thanh_vien";
  if (s.includes("thành viên ban truyền thông")) return "thanh_vien_ban_truyen_thong";
  if (s.includes("thành viên ban tài chính")) return "thanh_vien_ban_tai_chinh";
  if (s.includes("thành viên ban thiện nguyện")) return "thanh_vien_ban_thien_nguyen";
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
  const hasAccess =
    isPlatformAdmin ||
    isBQT ||
    isAdmin ||
    srsRole === "BQT" ||
    srsRole === "ADM" ||
    srsRole === "admin" ||
    srsRole === "quan_tri" ||
    srsRole === "ban_dieu_hanh";

  const [matrixDirty, setMatrixDirty] = useState(false);
  const isDirty = matrixDirty;

  const matrixSaveRef = useRef<(() => Promise<boolean>) | null>(null);
  const matrixDiscardRef = useRef<(() => void) | null>(null);
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
      setMatrixDirty(false);
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
    setMatrixDirty(false);
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
          <div className="p-10 text-center text-sm text-muted-foreground rounded-2xl border border-border bg-card shadow-sm">
            <Lock className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
            <h3 className="text-base font-bold text-foreground mb-1">Không có quyền truy cập</h3>
            <p>Bạn không có quyền quản trị để xem hoặc cấu hình phân quyền hệ thống.</p>
          </div>
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
          </div>
        </div>

        {/* Phân Hệ 1: Ma Trận Phân Quyền Hệ Thống & App Mobile CEO 1983 */}
        <div>
          <RbacPermissionMatrix
            onDirtyChange={setMatrixDirty}
            saveTriggerRef={matrixSaveRef}
            discardTriggerRef={matrixDiscardRef}
          />
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
