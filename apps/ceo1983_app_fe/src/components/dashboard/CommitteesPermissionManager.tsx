import React, { useState, useEffect, useMemo } from "react";
import {
  Building2,
  CheckCircle2,
  XCircle,
  Eye,
  Plus,
  Pencil,
  Trash2,
  ShieldCheck,
  ChevronDown,
  ChevronRight,
  RotateCcw,
  Sparkles,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import { fetchNestApi } from "@/lib/api-client";
import {
  COMMITTEES,
  INITIAL_CATEGORIES,
  type TreeCategory,
  type CommitteeRole,
} from "./RbacPermissionMatrix";
import {
  RBAC_MATRIX_STORAGE_KEY,
  dispatchPermissionSyncEvent,
  normalizeCommitteeKey,
} from "@/lib/rbac-permission-helpers";

export function CommitteesPermissionManager({
  onMatrixChanged,
}: {
  onMatrixChanged?: () => void;
}) {
  const [categories, setCategories] = useState<TreeCategory[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(RBAC_MATRIX_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch {}
    }
    return INITIAL_CATEGORIES;
  });

  const [expandedCommittee, setExpandedCommittee] = useState<string | null>("thanh_vien");
  const [searchFilter, setSearchFilter] = useState("");

  const refreshMatrix = () => {
    if (typeof window === "undefined") return;
    try {
      const stored = localStorage.getItem(RBAC_MATRIX_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCategories(parsed);
        }
      }
    } catch {}
  };

  useEffect(() => {
    refreshMatrix();
    const handleSync = () => refreshMatrix();
    window.addEventListener("crm_permissions_updated", handleSync);
    window.addEventListener("role-changed", handleSync);
    window.addEventListener("storage", handleSync);
    return () => {
      window.removeEventListener("crm_permissions_updated", handleSync);
      window.removeEventListener("role-changed", handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, []);

  const saveUpdatedMatrix = async (nextCats: TreeCategory[]) => {
    setCategories(nextCats);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(RBAC_MATRIX_STORAGE_KEY, JSON.stringify(nextCats));
      } catch {}
      dispatchPermissionSyncEvent();
      onMatrixChanged?.();
    }

    try {
      await fetchNestApi("/admin/permission-matrix", {
        method: "PUT",
        body: JSON.stringify({ categories: nextCats }),
      });
    } catch (err) {
      console.warn("Failed to sync permission matrix to backend:", err);
    }
  };

  // Master switches for 5 operations: view, add, edit, delete, approve
  const getCommitteeOpStats = (cKey: string) => {
    let totalView = 0;
    let grantView = 0;
    let totalAdd = 0;
    let grantAdd = 0;
    let totalEdit = 0;
    let grantEdit = 0;
    let totalDelete = 0;
    let grantDelete = 0;
    let totalApprove = 0;
    let grantApprove = 0;

    for (const cat of categories) {
      for (const feat of cat.features || []) {
        for (const act of feat.actions || []) {
          const code = (act.code || "").toUpperCase();
          const r = act.roles || {};
          const isGranted = r[cKey] === true;

          if (code.endsWith("_VIEW") || code.includes("VIEW")) {
            totalView++;
            if (isGranted) grantView++;
          }
          if (code.endsWith("_ADD") || code.includes("ADD") || code.includes("CREATE")) {
            totalAdd++;
            if (isGranted) grantAdd++;
          }
          if (code.endsWith("_EDIT") || code.includes("EDIT")) {
            totalEdit++;
            if (isGranted) grantEdit++;
          }
          if (code.endsWith("_DELETE") || code.includes("DELETE")) {
            totalDelete++;
            if (isGranted) grantDelete++;
          }
          if (code.endsWith("_APPROVE") || code.includes("APPROVE")) {
            totalApprove++;
            if (isGranted) grantApprove++;
          }
        }
      }
    }

    return {
      view: { granted: grantView, total: totalView, all: grantView > 0 && grantView === totalView },
      add: { granted: grantAdd, total: totalAdd, all: grantAdd > 0 && grantAdd === totalAdd },
      edit: { granted: grantEdit, total: totalEdit, all: grantEdit > 0 && grantEdit === totalEdit },
      delete: { granted: grantDelete, total: totalDelete, all: grantDelete > 0 && grantDelete === totalDelete },
      approve: { granted: grantApprove, total: totalApprove, all: grantApprove > 0 && grantApprove === totalApprove },
    };
  };

  const handleToggleMasterOp = (
    cKey: string,
    op: "view" | "add" | "edit" | "delete" | "approve",
    currentState: boolean
  ) => {
    const newState = !currentState;
    const nextCats = categories.map((cat) => ({
      ...cat,
      features: cat.features.map((feat) => ({
        ...feat,
        actions: feat.actions.map((act) => {
          const code = (act.code || "").toUpperCase();
          let match = false;
          if (op === "view" && (code.endsWith("_VIEW") || code.includes("VIEW"))) match = true;
          if (op === "add" && (code.endsWith("_ADD") || code.includes("ADD") || code.includes("CREATE"))) match = true;
          if (op === "edit" && (code.endsWith("_EDIT") || code.includes("EDIT"))) match = true;
          if (op === "delete" && (code.endsWith("_DELETE") || code.includes("DELETE"))) match = true;
          if (op === "approve" && (code.endsWith("_APPROVE") || code.includes("APPROVE"))) match = true;

          if (match) {
            return {
              ...act,
              roles: {
                ...(act.roles || {}),
                [cKey]: newState,
              },
            };
          }
          return act;
        }),
      })),
    }));

    saveUpdatedMatrix(nextCats);
    const commName = COMMITTEES.find((c) => c.key === cKey)?.name || cKey;
    const opLabel =
      op === "add" ? "Thêm mới" : op === "edit" ? "Chỉnh sửa" : op === "delete" ? "Xóa" : op === "view" ? "Xem" : "Phê duyệt";
    toast.success(
      newState
        ? `✓ Đã CẤP quyền ${opLabel} cho toàn bộ chức năng của ${commName}`
        : `✕ Đã KHÓA quyền ${opLabel} đối với ${commName} (Các tài khoản thuộc ban này sẽ không thể thực hiện thao tác)`
    );
  };

  const handleToggleSingleAction = (cKey: string, actionId: string) => {
    const nextCats = categories.map((cat) => ({
      ...cat,
      features: cat.features.map((feat) => ({
        ...feat,
        actions: feat.actions.map((act) => {
          if (act.id === actionId) {
            const current = Boolean(act.roles?.[cKey]);
            return {
              ...act,
              roles: {
                ...(act.roles || {}),
                [cKey]: !current,
              },
            };
          }
          return act;
        }),
      })),
    }));

    saveUpdatedMatrix(nextCats);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-blue-200/80 bg-blue-50/50 p-4 dark:border-blue-900/60 dark:bg-blue-950/20 text-xs text-blue-900 dark:text-blue-200 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-sm block mb-0.5">Phân Hệ 2: Quản Trị Thẩm Quyền 6 Ban Chuyên Môn</span>
          <p className="leading-relaxed">
            Mỗi Ban Chuyên Môn có thẩm quyền nghiệp vụ riêng. Khi bạn <strong>bật/tắt</strong> bất kỳ thao tác nào ở đây (như <em>Thêm mới</em>, <em>Sửa</em>, <em>Xóa</em>, <em>Phê duyệt</em>), hệ thống sẽ <strong>lập tức đồng bộ 2 chiều</strong> sang Ma trận phân quyền (Phân hệ 1) và tự động cập nhật quyền hạn thực tế cho tất cả tài khoản thuộc Ban đó (Phân hệ 3).
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {COMMITTEES.map((comm) => {
          const stats = getCommitteeOpStats(comm.key);
          const isExpanded = expandedCommittee === comm.key;

          return (
            <div
              key={comm.key}
              className={`rounded-2xl border bg-card p-5 shadow-xs transition-all ${
                isExpanded ? "ring-2 ring-primary/40 border-primary" : "border-border hover:border-border/80"
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-border/70">
                <div className="flex items-center gap-3">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl font-bold border text-sm ${comm.color}`}>
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-foreground">{comm.name}</h4>
                    <span className="text-[11px] text-muted-foreground font-mono uppercase">
                      Mã ban: {comm.key.toUpperCase()}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setExpandedCommittee(isExpanded ? null : comm.key)}
                  className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer transition"
                  title={isExpanded ? "Thu gọn danh sách" : "Mở rộng xem chi tiết"}
                >
                  {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
              </div>

              {/* 5 Master Operation Switches */}
              <div className="py-3.5 space-y-2">
                <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                  5 Thẩm quyền điều hành chính:
                </div>

                <div className="grid grid-cols-1 gap-2 text-xs">
                  {/* View */}
                  <div className="flex items-center justify-between p-2 rounded-xl bg-muted/30 border border-border/50">
                    <span className="flex items-center gap-1.5 font-medium text-foreground">
                      <Eye className="w-3.5 h-3.5 text-blue-600" />
                      Xem dữ liệu ({stats.view.granted}/{stats.view.total})
                    </span>
                    <button
                      type="button"
                      onClick={() => handleToggleMasterOp(comm.key, "view", stats.view.granted > 0)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                        stats.view.granted > 0
                          ? "bg-blue-600 text-white hover:bg-blue-700"
                          : "bg-muted text-muted-foreground hover:bg-secondary"
                      }`}
                    >
                      {stats.view.granted > 0 ? "Đang cấp" : "Đã khóa"}
                    </button>
                  </div>

                  {/* Add */}
                  <div className="flex items-center justify-between p-2 rounded-xl bg-muted/30 border border-border/50">
                    <span className="flex items-center gap-1.5 font-medium text-foreground">
                      <Plus className="w-3.5 h-3.5 text-emerald-600" />
                      Thêm mới ({stats.add.granted}/{stats.add.total})
                    </span>
                    <button
                      type="button"
                      onClick={() => handleToggleMasterOp(comm.key, "add", stats.add.granted > 0)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                        stats.add.granted > 0
                          ? "bg-emerald-600 text-white hover:bg-emerald-700"
                          : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 hover:bg-rose-200"
                      }`}
                    >
                      {stats.add.granted > 0 ? "Đang cấp" : "Đã khóa"}
                    </button>
                  </div>

                  {/* Edit */}
                  <div className="flex items-center justify-between p-2 rounded-xl bg-muted/30 border border-border/50">
                    <span className="flex items-center gap-1.5 font-medium text-foreground">
                      <Pencil className="w-3.5 h-3.5 text-amber-600" />
                      Chỉnh sửa ({stats.edit.granted}/{stats.edit.total})
                    </span>
                    <button
                      type="button"
                      onClick={() => handleToggleMasterOp(comm.key, "edit", stats.edit.granted > 0)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                        stats.edit.granted > 0
                          ? "bg-amber-600 text-white hover:bg-amber-700"
                          : "bg-muted text-muted-foreground hover:bg-secondary"
                      }`}
                    >
                      {stats.edit.granted > 0 ? "Đang cấp" : "Đã khóa"}
                    </button>
                  </div>

                  {/* Delete */}
                  <div className="flex items-center justify-between p-2 rounded-xl bg-muted/30 border border-border/50">
                    <span className="flex items-center gap-1.5 font-medium text-foreground">
                      <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                      Xóa dữ liệu ({stats.delete.granted}/{stats.delete.total})
                    </span>
                    <button
                      type="button"
                      onClick={() => handleToggleMasterOp(comm.key, "delete", stats.delete.granted > 0)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                        stats.delete.granted > 0
                          ? "bg-rose-600 text-white hover:bg-rose-700"
                          : "bg-muted text-muted-foreground hover:bg-secondary"
                      }`}
                    >
                      {stats.delete.granted > 0 ? "Đang cấp" : "Đã khóa"}
                    </button>
                  </div>

                  {/* Approve */}
                  <div className="flex items-center justify-between p-2 rounded-xl bg-muted/30 border border-border/50">
                    <span className="flex items-center gap-1.5 font-medium text-foreground">
                      <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                      Phê duyệt ({stats.approve.granted}/{stats.approve.total})
                    </span>
                    <button
                      type="button"
                      onClick={() => handleToggleMasterOp(comm.key, "approve", stats.approve.granted > 0)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                        stats.approve.granted > 0
                          ? "bg-purple-600 text-white hover:bg-purple-700"
                          : "bg-muted text-muted-foreground hover:bg-secondary"
                      }`}
                    >
                      {stats.approve.granted > 0 ? "Đang cấp" : "Đã khóa"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Button to Expand Details */}
              <div className="pt-2 border-t border-border/60 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setExpandedCommittee(isExpanded ? null : comm.key)}
                  className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>{isExpanded ? "Đóng chi tiết thao tác" : "Xem & chỉnh sửa chi tiết từng thao tác"}</span>
                  {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Accordion of detailed module actions */}
              {isExpanded && (
                <div className="mt-4 pt-3 border-t border-border/80 space-y-3 max-h-72 overflow-y-auto pr-1 animate-in fade-in duration-200">
                  <div className="text-[11px] font-bold text-foreground">Chi tiết từng thao tác của {comm.name}:</div>
                  {categories.map((cat) => (
                    <div key={cat.id} className="space-y-1.5">
                      <div className="text-[11px] font-bold text-muted-foreground bg-muted/50 px-2 py-0.5 rounded">
                        {cat.name}
                      </div>
                      {cat.features.map((feat) => (
                        <div key={feat.id} className="pl-2 space-y-1">
                          <div className="text-[11px] font-medium text-foreground/80">{feat.name}</div>
                          <div className="grid grid-cols-1 gap-1 pl-2">
                            {feat.actions.map((act) => {
                              const isChecked = Boolean(act.roles?.[comm.key]);
                              return (
                                <label
                                  key={act.id}
                                  className="flex items-center justify-between text-xs py-1 px-1.5 rounded hover:bg-muted/40 cursor-pointer"
                                >
                                  <span className="truncate pr-2 text-foreground/90">{act.name}</span>
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => handleToggleSingleAction(comm.key, act.id)}
                                    className="h-4 w-4 rounded text-primary focus:ring-primary cursor-pointer shrink-0"
                                  />
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
