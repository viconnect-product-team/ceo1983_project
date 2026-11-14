import React, { useState, useRef, useEffect, Component, ErrorInfo, ReactNode } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  ShieldCheck,
  Lock,
  AlertTriangle,
  Save,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/dashboard/AppShell";
import { useRole } from "@/hooks/use-role";
import { RbacPermissionMatrix } from "@/components/dashboard/RbacPermissionMatrix";
import {
  dispatchPermissionSyncEvent,
  isRouteAllowedByMatrix,
  getCustomDepartments,
  getAllDynamicRoleOptions,
  getRolesForDepartment,
  INITIAL_DEPARTMENTS,
  DepartmentItem,
  ROLE_OPTIONS,
  DEPARTMENT_OPTIONS,
  normalizeRole,
  normalizeDept,
} from "@/lib/rbac-permission-helpers";

export { ROLE_OPTIONS, DEPARTMENT_OPTIONS, normalizeRole, normalizeDept };

export function getDynamicRoleOptions(): { value: string; label: string; desc?: string }[] {
  return getAllDynamicRoleOptions();
}

export function getDynamicDepartmentOptions(): string[] {
  const custom = typeof window !== "undefined" ? getCustomDepartments() : INITIAL_DEPARTMENTS;
  const list = [...DEPARTMENT_OPTIONS];
  custom.forEach((c) => {
    if (!list.includes(c.name)) list.push(c.name);
  });
  return list;
}

function PermissionsErrorFallback({ onReset }: { onReset?: () => void }) {
  const handleReset = () => {
    try {
      localStorage.removeItem("ceo1983_rbac_tree_matrix_v7_sidebar_menu");
      localStorage.removeItem("vba_crm_rbac_tree_categories_v2");
    } catch {}
    if (onReset) {
      onReset();
    } else {
      window.location.reload();
    }
  };

  return (
    <AppShell>
      <div className="p-8 max-w-xl mx-auto my-12 text-center bg-card border border-border rounded-3xl shadow-lg">
        <div className="size-14 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center mb-4">
          <AlertTriangle className="size-8" />
        </div>
        <h2 className="text-lg font-bold text-foreground mb-2">Đang làm mới Ma Trận Phân Quyền</h2>
        <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
          Bộ nhớ đệm ma trận phân quyền đã được làm mới đồng bộ với cơ sở dữ liệu hệ thống. Quý quản trị viên vui lòng bấm nút bên dưới để khôi phục và tiếp tục.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="px-5 py-2.5 rounded-xl bg-[#003B95] text-white font-bold text-xs hover:bg-[#002B70] transition shadow-md cursor-pointer"
          >
            Khôi phục &amp; Tải lại trang
          </button>
        </div>
      </div>
    </AppShell>
  );
}

class PermissionsErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[PermissionsErrorBoundary caught]", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <PermissionsErrorFallback onReset={() => this.setState({ hasError: false, error: null })} />;
    }
    return this.props.children;
  }
}

function PermissionsPage() {
  const { isPlatformAdmin, isBQT, isAdmin, isSuperAdmin, isPresident, isChuTich, srsRole, loading } = useRole();
  const hasAccess =
    isPlatformAdmin ||
    isSuperAdmin ||
    isPresident ||
    isChuTich ||
    isBQT ||
    isAdmin ||
    srsRole === "BQT" ||
    srsRole === "ADM" ||
    srsRole === "admin" ||
    srsRole === "quan_tri" ||
    srsRole === "ban_dieu_hanh" ||
    srsRole === "chu_tich" ||
    isRouteAllowedByMatrix("/permissions", (srsRole as any) || "member");

  const [matrixDirty, setMatrixDirty] = useState(false);
  const matrixSaveRef = useRef<(() => Promise<boolean>) | null>(null);
  const matrixDiscardRef = useRef<(() => void) | null>(null);

  // Standard safe browser beforeunload handler (prevents crashes from router blockers)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (matrixDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [matrixDirty]);

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
                  RBAC V2 &amp; BAN CHUYÊN MÔN
                </span>
                {matrixDirty && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-400 animate-pulse">
                    <AlertTriangle className="w-3 h-3" />
                    Có thay đổi chưa lưu
                  </span>
                )}
              </div>
              <h1 className="text-lg sm:text-xl font-black text-foreground tracking-tight mt-1">
                Phân Quyền &amp; Quản Trị Vai Trò CEO 1983
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
    </AppShell>
  );
}

function PermissionsPageWrapper() {
  return (
    <PermissionsErrorBoundary>
      <PermissionsPage />
    </PermissionsErrorBoundary>
  );
}

export const Route = createFileRoute("/permissions")({
  component: PermissionsPageWrapper,
  errorComponent: PermissionsErrorFallback,
});
