import React, { useState, useEffect, useMemo } from "react";
import {
  Users,
  Search,
  Filter,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Pencil,
  RotateCcw,
  Building2,
  Plus,
  Trash2,
  SlidersHorizontal,
  Lock,
  Sparkles,
  Info,
  X,
  Save,
} from "lucide-react";
import { toast } from "sonner";
import {
  ROLE_OPTIONS,
  DEPARTMENT_OPTIONS,
  normalizeRole,
  normalizeDept,
} from "@/routes/permissions";
import {
  COMMITTEES,
  INITIAL_CATEGORIES,
  type TreeCategory,
} from "./RbacPermissionMatrix";
import {
  RBAC_MATRIX_STORAGE_KEY,
  dispatchPermissionSyncEvent,
  normalizeCommitteeKey,
} from "@/lib/rbac-permission-helpers";

import { fetchNestApi } from "@/lib/api-client";

export function MemberPermissionsByCommittee({
  members = [],
  loading = false,
  onUpdateRoleDept,
}: {
  members: any[];
  loading?: boolean;
  onUpdateRoleDept: (p: {
    memberId: string;
    executiveRole: string;
    department: string;
    associationId?: string;
  }) => Promise<any>;
}) {
  const [selectedCommitteeTab, setSelectedCommitteeTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoleFilter, setSelectedRoleFilter] = useState("all");
  const [editingCustomMember, setEditingCustomMember] = useState<any | null>(null);

  // Staging changes: memberId -> { memberId, executiveRole, department, associationId, memberName }
  const [stagedRoleDept, setStagedRoleDept] = useState<
    Record<
      string,
      {
        memberId: string;
        executiveRole: string;
        department: string;
        associationId: string;
        memberName: string;
      }
    >
  >({});

  // Staging overrides: memberCode -> overrideData
  const [stagedOverrides, setStagedOverrides] = useState<Record<string, any>>({});
  const [savingAll, setSavingAll] = useState(false);

  // Matrix and Member Permissions Cache
  const [matrix, setMatrix] = useState<TreeCategory[]>(() => {
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

  const [memberPermsMap, setMemberPermsMap] = useState<Record<string, any>>(() => {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("vba_member_permissions");
        if (raw) return JSON.parse(raw) || {};
      } catch {}
    }
    return {};
  });

  // Tải cấu hình phân quyền hội viên thực tế từ CSDL PostgreSQL (RESTful API)
  useEffect(() => {
    let active = true;
    fetchNestApi("/admin/member-permissions")
      .then((res: any) => {
        if (!active || !res) return;
        if (typeof res === "object") {
          setMemberPermsMap((prev) => ({ ...res, ...prev }));
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const refreshPermissions = () => {
    if (typeof window === "undefined") return;
    try {
      const storedMatrix = localStorage.getItem(RBAC_MATRIX_STORAGE_KEY);
      if (storedMatrix) {
        const parsed = JSON.parse(storedMatrix);
        if (Array.isArray(parsed) && parsed.length > 0) setMatrix(parsed);
      }
      const rawPerms = localStorage.getItem("vba_member_permissions");
      if (rawPerms) setMemberPermsMap(JSON.parse(rawPerms) || {});
    } catch {}
  };

  useEffect(() => {
    refreshPermissions();
    const handleSync = () => refreshPermissions();
    window.addEventListener("crm_permissions_updated", handleSync);
    window.addEventListener("vba_member_permissions_updated", handleSync);
    window.addEventListener("role-changed", handleSync);
    window.addEventListener("storage", handleSync);
    return () => {
      window.removeEventListener("crm_permissions_updated", handleSync);
      window.removeEventListener("vba_member_permissions_updated", handleSync);
      window.removeEventListener("role-changed", handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, []);

  // Compute effective permissions for a member based on Committee + Role + Personal Override
  const computeMemberPermissions = (m: any) => {
    const role = stagedRoleDept[m.id]?.executiveRole ?? normalizeRole(m.executiveRole ?? m.role);
    const dept = stagedRoleDept[m.id]?.department ?? normalizeDept(m.department);
    const cKey = normalizeCommitteeKey(dept);
    const mCode = m.code || m.id;
    const profile =
      memberPermsMap[mCode] ||
      (mCode ? memberPermsMap[mCode.toLowerCase()] : null) ||
      (mCode ? memberPermsMap[mCode.toUpperCase()] : null);

    let canView = false;
    let canAdd = false;
    let canEdit = false;
    let canDelete = false;
    let canApprove = false;

    // 1. Inherit from matrix
    for (const cat of matrix) {
      for (const feat of cat.features || []) {
        for (const act of feat.actions || []) {
          const cRoles = act.roles || {};
          const isForRole = cRoles[role] === true || (role === "quan_tri" && cRoles["quan_tri"] !== false);
          const isForComm = cKey && cRoles[cKey] === true;

          // If role or committee has explicitly revoked (false)
          if (cRoles[role] === false || (cKey && cRoles[cKey] === false)) {
            continue;
          }

          if (isForRole || isForComm) {
            const code = (act.code || "").toUpperCase();
            if (code.endsWith("_VIEW") || code.includes("VIEW")) canView = true;
            if (code.endsWith("_ADD") || code.includes("ADD") || code.includes("CREATE")) canAdd = true;
            if (code.endsWith("_EDIT") || code.includes("EDIT")) canEdit = true;
            if (code.endsWith("_DELETE") || code.includes("DELETE")) canDelete = true;
            if (code.endsWith("_APPROVE") || code.includes("APPROVE")) canApprove = true;
          }
        }
      }
    }

    // 2. Personal Override Profile
    let hasOverride = false;
    if (profile && !profile.__reset) {
      hasOverride = true;
      if (profile.canAdd !== undefined) canAdd = profile.canAdd;
      if (profile.canEdit !== undefined) canEdit = profile.canEdit;
      if (profile.canDelete !== undefined) canDelete = profile.canDelete;
      if (profile.canApprove !== undefined) canApprove = profile.canApprove;
      if (profile.isAdmin) {
        canView = true;
        canAdd = profile.canAdd !== false;
        canEdit = profile.canEdit !== false;
        canDelete = profile.canDelete !== false;
        canApprove = profile.canApprove !== false;
      }
    }

    return {
      canView,
      canAdd,
      canEdit,
      canDelete,
      canApprove,
      hasOverride,
      profile,
    };
  };

  // QUY TẮC BẮT BUỘC 1: Lọc bỏ toàn bộ tài khoản chưa được duyệt (pending/unapproved)
  const approvedMembers = useMemo(() => {
    const list = Array.isArray(members) ? members : [];
    return list.filter((m) => {
      const s = String(m?.status || "").toLowerCase().trim();
      if (s === "pending" || s === "pending_approval" || s === "rejected" || s === "inactive") {
        return false;
      }
      return s === "active" || s === "approved" || m.verified === true || !s;
    });
  }, [members]);

  // Filter members by committee, role, search query
  const filteredMembers = useMemo(() => {
    const ql = searchQuery.trim().toLowerCase();

    return approvedMembers.filter((m) => {
      const dept = stagedRoleDept[m.id]?.department ?? normalizeDept(m.department);
      const cKey = normalizeCommitteeKey(dept);
      if (selectedCommitteeTab !== "all" && cKey !== selectedCommitteeTab) {
        return false;
      }

      const role = stagedRoleDept[m.id]?.executiveRole ?? normalizeRole(m.executiveRole ?? m.role);
      if (selectedRoleFilter !== "all" && role !== selectedRoleFilter) {
        return false;
      }

      if (!ql) return true;
      return (
        (m.name || "").toLowerCase().includes(ql) ||
        (m.code || "").toLowerCase().includes(ql) ||
        (m.email || "").toLowerCase().includes(ql) ||
        (m.phone || "").toLowerCase().includes(ql) ||
        (m.company || "").toLowerCase().includes(ql)
      );
    });
  }, [approvedMembers, selectedCommitteeTab, selectedRoleFilter, searchQuery, stagedRoleDept]);

  // Ghi nhận thay đổi vai trò vào draft (chưa gửi API tới khi bấm LƯU)
  const handleStageRoleChange = (m: any, newRole: string) => {
    const currentDept = stagedRoleDept[m.id]?.department ?? normalizeDept(m.department);
    setStagedRoleDept((prev) => ({
      ...prev,
      [m.id]: {
        memberId: m.id,
        executiveRole: newRole,
        department: currentDept,
        associationId: m.associationId || "c1983000-0000-4000-8000-000000001983",
        memberName: m.name || m.code || "Hội viên",
      },
    }));
  };

  // Ghi nhận chuyển ban chuyên môn vào draft (chưa gửi API tới khi bấm LƯU)
  const handleStageDeptChange = (m: any, newDept: string) => {
    const currentRole = stagedRoleDept[m.id]?.executiveRole ?? normalizeRole(m.executiveRole ?? m.role);
    setStagedRoleDept((prev) => ({
      ...prev,
      [m.id]: {
        memberId: m.id,
        executiveRole: currentRole,
        department: newDept,
        associationId: m.associationId || "c1983000-0000-4000-8000-000000001983",
        memberName: m.name || m.code || "Hội viên",
      },
    }));
  };

  // Ghi nhận tùy biến quyền cá nhân vào draft
  const handleStagePersonalOverride = (overrideData: any) => {
    if (!editingCustomMember) return;
    const mCode = editingCustomMember.code || editingCustomMember.id;
    setStagedOverrides((prev) => ({
      ...prev,
      [mCode]: overrideData,
    }));
    setMemberPermsMap((prev) => ({
      ...prev,
      [mCode]: overrideData,
    }));
    setEditingCustomMember(null);
    toast.info(`Đã lưu tạm thời phân quyền của "${editingCustomMember.name}". Vui lòng nhấn "Lưu Thay Đổi (RESTful API)" để áp dụng.`);
  };

  // Khôi phục quyền về ban mặc định trong draft
  const handleStageResetToBanDefault = (m: any) => {
    const mCode = m.code || m.id;
    const nextMap = { ...memberPermsMap };
    delete nextMap[mCode];
    if (mCode) {
      delete nextMap[mCode.toLowerCase()];
      delete nextMap[mCode.toUpperCase()];
    }
    setMemberPermsMap(nextMap);
    setStagedOverrides((prev) => ({
      ...prev,
      [mCode]: { __reset: true },
    }));
    setEditingCustomMember(null);
    toast.info(`Đã đánh dấu khôi phục quyền mặc định cho "${m.name}". Nhấn "Lưu Thay Đổi (RESTful API)" để hoàn tất.`);
  };

  // Hủy toàn bộ thay đổi chưa lưu
  const handleResetAllDraft = () => {
    setStagedRoleDept({});
    setStagedOverrides({});
    refreshPermissions();
    toast.info("Đã hủy các thay đổi chưa lưu.");
  };

  // QUY TẮC RESTFUL API: Gửi toàn bộ thay đổi về Database khi bấm nút LƯU
  const handleSaveAllToDatabase = async () => {
    setSavingAll(true);
    try {
      // 1. Lưu cấu hình quyền cá nhân về CSDL qua RESTful API: PUT /api/admin/member-permissions
      const finalMap = { ...memberPermsMap };
      Object.keys(stagedOverrides).forEach((k) => {
        if (stagedOverrides[k]?.__reset) {
          delete finalMap[k];
        }
      });

      await fetchNestApi("/admin/member-permissions", {
        method: "PUT",
        body: JSON.stringify(finalMap),
      });

      // 2. Gửi API cập nhật Vai trò & Ban chuyên môn cho từng hội viên được chỉnh sửa
      const stagedItems = Object.values(stagedRoleDept);
      for (const item of stagedItems) {
        await onUpdateRoleDept({
          memberId: item.memberId,
          executiveRole: item.executiveRole,
          department: item.department,
          associationId: item.associationId,
        });
      }

      // 3. Đồng bộ bộ nhớ cục bộ & phát tín hiệu đồng bộ realtime
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("vba_member_permissions", JSON.stringify(finalMap));
        } catch {}
        dispatchPermissionSyncEvent();
      }

      setStagedRoleDept({});
      setStagedOverrides({});
      toast.success("Đã lưu toàn bộ phân quyền hội viên vào Database thành công (RESTful API)!");
    } catch (err: any) {
      console.error("Save member permissions error:", err);
      toast.error(err?.message || "Lỗi khi lưu phân quyền vào Database");
    } finally {
      setSavingAll(false);
    }
  };

  const unsavedCount = Object.keys(stagedRoleDept).length + Object.keys(stagedOverrides).length;

  return (
    <div className="space-y-5">
      {/* Intro alert */}
      <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/50 p-4 dark:border-emerald-900/60 dark:bg-emerald-950/20 text-xs text-emerald-900 dark:text-emerald-200 flex items-start gap-3">
        <Info className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-sm block mb-0.5">Phân Hệ 3: Phân Quyền Tài Khoản Theo Từng Ban</span>
          <p className="leading-relaxed">
            Danh sách tài khoản hội viên được phân theo từng <strong>Ban Chuyên Môn</strong>. Quyền hạn thao tác thực tế (Thêm, Sửa, Xóa, Duyệt) được <strong>tự động thừa hưởng từ Ban và Vai trò</strong> (Phân hệ 1 &amp; 2). Người quản trị có thể tùy chỉnh ghi đè riêng cho từng tài khoản khi cần cấp thêm hoặc thu hồi đặc quyền cụ thể.
          </p>
        </div>
      </div>

      {/* 6 Committees Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border pb-3">
        <button
          type="button"
          onClick={() => setSelectedCommitteeTab("all")}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            selectedCommitteeTab === "all"
              ? "bg-[#003B95] text-white shadow-xs"
              : "bg-card border border-border text-muted-foreground hover:bg-muted"
          }`}
        >
          Tất cả ban ({members.length})
        </button>

        {COMMITTEES.map((comm) => {
          const count = members.filter(
            (m) => normalizeCommitteeKey(normalizeDept(m.department)) === comm.key
          ).length;

          return (
            <button
              key={comm.key}
              type="button"
              onClick={() => setSelectedCommitteeTab(comm.key)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                selectedCommitteeTab === comm.key
                  ? "bg-[#003B95] text-white shadow-xs"
                  : "bg-card border border-border text-muted-foreground hover:bg-muted"
              }`}
            >
              <span>{comm.name}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                selectedCommitteeTab === comm.key ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl border border-border bg-card shadow-xs">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Tìm theo họ tên, mã HV, email, SĐT, công ty..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-border bg-background focus:border-primary outline-none transition"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedRoleFilter}
            onChange={(e) => setSelectedRoleFilter(e.target.value)}
            className="text-xs rounded-xl border border-border bg-background px-3 py-2 outline-none font-medium focus:border-primary cursor-pointer"
          >
            <option value="all">Tất cả vai trò</option>
            {ROLE_OPTIONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Accounts Table */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/40 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3 text-center w-12">STT</th>
                <th className="px-4 py-3 min-w-[200px]">Hội Viên / Tài Khoản</th>
                <th className="px-4 py-3 min-w-[160px]">Ban Chuyên Môn</th>
                <th className="px-4 py-3 min-w-[140px]">Vai Trò Hệ Thống</th>
                <th className="px-4 py-3 min-w-[260px]">Thẩm Quyền Thao Tác Thực Tế</th>
                <th className="px-4 py-3 text-center min-w-[140px]">Hành Động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-muted-foreground">
                    Không tìm thấy tài khoản nào phù hợp với bộ lọc ban chuyên môn.
                  </td>
                </tr>
              ) : (
                filteredMembers.map((m, idx) => {
                  const permState = computeMemberPermissions(m);
                  const currentRole = stagedRoleDept[m.id]?.executiveRole ?? normalizeRole(m.executiveRole ?? m.role);
                  const currentDept = stagedRoleDept[m.id]?.department ?? normalizeDept(m.department);
                  const isStaged = Boolean(stagedRoleDept[m.id] || stagedOverrides[m.code || m.id]);

                  return (
                    <tr
                      key={m.id}
                      className={`transition-colors ${
                        isStaged
                          ? "bg-amber-500/5 hover:bg-amber-500/10 border-l-4 border-l-amber-500"
                          : "hover:bg-secondary/20"
                      }`}
                    >
                      <td className="px-4 py-3 text-center text-xs text-muted-foreground font-mono">
                        {idx + 1}
                      </td>

                      {/* Member Info */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-[#003B95] font-bold text-xs dark:bg-blue-950 dark:text-blue-300 shrink-0">
                            {(m.name || "HV").slice(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 font-bold text-xs text-foreground truncate">
                              <span>{m.name}</span>
                              {isStaged && (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-700 dark:text-amber-400">
                                  Chưa lưu
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-muted-foreground font-mono flex items-center gap-1.5 truncate">
                              <span>{m.code || "CEO1983"}</span>
                              {m.email && <span>· {m.email}</span>}
                            </div>
                            {m.company && (
                              <div className="text-[10px] text-muted-foreground/80 truncate mt-0.5">
                                {m.company}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Department dropdown (Staged changes) */}
                      <td className="px-4 py-3">
                        <select
                          value={currentDept}
                          onChange={(e) => handleStageDeptChange(m, e.target.value)}
                          className={`text-xs rounded-lg border px-2.5 py-1.5 font-medium outline-none focus:border-primary cursor-pointer max-w-[170px] ${
                            stagedRoleDept[m.id]?.department
                              ? "border-amber-500 bg-amber-500/10 font-bold"
                              : "border-border bg-background"
                          }`}
                        >
                          {DEPARTMENT_OPTIONS.map((dept) => (
                            <option key={dept} value={dept}>
                              {dept}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* System Role dropdown (Staged changes) */}
                      <td className="px-4 py-3">
                        <select
                          value={currentRole}
                          onChange={(e) => handleStageRoleChange(m, e.target.value)}
                          className={`text-xs rounded-lg border px-2.5 py-1.5 font-bold outline-none focus:border-primary cursor-pointer max-w-[150px] ${
                            stagedRoleDept[m.id]?.executiveRole
                              ? "border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-400"
                              : "border-border bg-background text-[#003B95] dark:text-blue-400"
                          }`}
                        >
                          {ROLE_OPTIONS.map((r) => (
                            <option key={r.value} value={r.value}>
                              {r.label}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Effective Permission Badges */}
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {/* Add */}
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              permState.canAdd
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300"
                                : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300"
                            }`}
                            title={permState.canAdd ? "Được phép thêm mới" : "Không có quyền thêm mới (Bị khóa)"}
                          >
                            {permState.canAdd ? <CheckCircle2 className="w-2.5 h-2.5" /> : <XCircle className="w-2.5 h-2.5" />}
                            Thêm mới: {permState.canAdd ? "Cấp" : "Khóa"}
                          </span>

                          {/* Edit */}
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              permState.canEdit
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-300"
                                : "bg-muted text-muted-foreground border border-border"
                            }`}
                          >
                            {permState.canEdit ? <CheckCircle2 className="w-2.5 h-2.5" /> : <XCircle className="w-2.5 h-2.5" />}
                            Sửa: {permState.canEdit ? "Cấp" : "Khóa"}
                          </span>

                          {/* Delete */}
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              permState.canDelete
                                ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300"
                                : "bg-muted text-muted-foreground border border-border"
                            }`}
                          >
                            {permState.canDelete ? <CheckCircle2 className="w-2.5 h-2.5" /> : <XCircle className="w-2.5 h-2.5" />}
                            Xóa: {permState.canDelete ? "Cấp" : "Khóa"}
                          </span>

                          {/* Approve */}
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              permState.canApprove
                                ? "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-purple-300"
                                : "bg-muted text-muted-foreground border border-border"
                            }`}
                          >
                            {permState.canApprove ? <CheckCircle2 className="w-2.5 h-2.5" /> : <XCircle className="w-2.5 h-2.5" />}
                            Duyệt: {permState.canApprove ? "Cấp" : "Khóa"}
                          </span>

                          {permState.hasOverride && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-black bg-indigo-600 text-white shadow-2xs">
                              <Sparkles className="w-2.5 h-2.5" /> Tùy chỉnh riêng
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => setEditingCustomMember(m)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-primary/30 bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 transition cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          <span>Tùy chỉnh quyền</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Floating Sticky Save Bar (RESTful API) */}
      {unsavedCount > 0 && (
        <div className="sticky bottom-4 z-40 flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-amber-500/50 bg-card/95 p-4 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0">
              <Sparkles className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <div className="text-xs font-bold text-foreground flex items-center gap-2">
                <span>Đang có {unsavedCount} thay đổi phân quyền hội viên chưa lưu vào Database</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300">
                  Draft Mode
                </span>
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5">
                Các thay đổi vai trò, ban chuyên môn hoặc đặc quyền cá nhân sẽ chỉ được ghi nhận vào CSDL khi bấm "Lưu Vào Database".
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={savingAll}
              onClick={handleResetAllDraft}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted cursor-pointer transition"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Hủy bỏ thay đổi
            </button>
            <button
              type="button"
              disabled={savingAll}
              onClick={handleSaveAllToDatabase}
              className="inline-flex items-center gap-2 rounded-xl bg-[#003B95] hover:bg-[#002B70] px-5 py-2 text-xs font-bold text-white shadow-md cursor-pointer transition disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {savingAll ? "Đang lưu RESTful API..." : "Lưu Thay Đổi Vào Database (RESTful API)"}
            </button>
          </div>
        </div>
      )}

      {/* MODAL: Custom personal override */}
      {editingCustomMember && (
        <CustomMemberPermissionModal
          member={editingCustomMember}
          initialOverride={computeMemberPermissions(editingCustomMember).profile || {}}
          onSave={handleStagePersonalOverride}
          onReset={() => handleStageResetToBanDefault(editingCustomMember)}
          onClose={() => setEditingCustomMember(null)}
        />
      )}
    </div>
  );
}

function CustomMemberPermissionModal({
  member,
  initialOverride,
  onSave,
  onReset,
  onClose,
}: {
  member: any;
  initialOverride: any;
  onSave: (data: any) => void;
  onReset: () => void;
  onClose: () => void;
}) {
  const [canAdd, setCanAdd] = useState<boolean>(initialOverride.canAdd !== false);
  const [canEdit, setCanEdit] = useState<boolean>(initialOverride.canEdit !== false);
  const [canDelete, setCanDelete] = useState<boolean>(Boolean(initialOverride.canDelete));
  const [canApprove, setCanApprove] = useState<boolean>(Boolean(initialOverride.canApprove));
  const [isAdmin, setIsAdmin] = useState<boolean>(Boolean(initialOverride.isAdmin));
  const [canManageMembers, setCanManageMembers] = useState<boolean>(
    initialOverride.canManageMembers !== false
  );
  const [canManageEvents, setCanManageEvents] = useState<boolean>(
    initialOverride.canManageEvents !== false
  );
  const [canManageFinance, setCanManageFinance] = useState<boolean>(
    Boolean(initialOverride.canManageFinance)
  );
  const [canManageNews, setCanManageNews] = useState<boolean>(initialOverride.canManageNews !== false);
  const [canManageMarketplace, setCanManageMarketplace] = useState<boolean>(
    initialOverride.canManageMarketplace !== false
  );

  const handleSave = () => {
    onSave({
      canAdd,
      canEdit,
      canDelete,
      canApprove,
      isAdmin,
      canManageMembers,
      canManageEvents,
      canManageFinance,
      canManageNews,
      canManageMarketplace,
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between pb-3 border-b border-border">
          <div>
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#003B95]" />
              Tùy Chỉnh Phân Quyền Cá Nhân
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {member.name} ({member.code || "CEO1983"}) · {member.department || "Ban chuyên môn"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-200/80 text-blue-900 text-xs dark:bg-blue-950/20 dark:border-blue-900/50 dark:text-blue-200">
          💡 <strong>Nguyên tắc đồng bộ:</strong> Khi bạn gạt tắt thao tác <em>Thêm mới</em> ở đây, tài khoản này sẽ lập tức bị ẩn nút thêm mới và bị chặn tạo mới trên toàn hệ thống CRM, ngay cả khi vai trò của họ là Admin.
        </div>

        <div className="space-y-3 text-xs">
          <div className="font-bold text-foreground uppercase tracking-wider text-[11px]">
            4 Thao tác cốt lõi:
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <label className="flex items-center justify-between p-3 rounded-xl border border-border bg-background cursor-pointer hover:border-primary/50 transition">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5 text-emerald-600" />
                Thêm mới dữ liệu
              </span>
              <input
                type="checkbox"
                checked={canAdd}
                onChange={(e) => setCanAdd(e.target.checked)}
                className="h-4 w-4 rounded text-primary focus:ring-primary cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl border border-border bg-background cursor-pointer hover:border-primary/50 transition">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <Pencil className="w-3.5 h-3.5 text-blue-600" />
                Chỉnh sửa dữ liệu
              </span>
              <input
                type="checkbox"
                checked={canEdit}
                onChange={(e) => setCanEdit(e.target.checked)}
                className="h-4 w-4 rounded text-primary focus:ring-primary cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl border border-border bg-background cursor-pointer hover:border-primary/50 transition">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                Xóa dữ liệu
              </span>
              <input
                type="checkbox"
                checked={canDelete}
                onChange={(e) => setCanDelete(e.target.checked)}
                className="h-4 w-4 rounded text-primary focus:ring-primary cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl border border-border bg-background cursor-pointer hover:border-primary/50 transition">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                Phê duyệt hồ sơ
              </span>
              <input
                type="checkbox"
                checked={canApprove}
                onChange={(e) => setCanApprove(e.target.checked)}
                className="h-4 w-4 rounded text-primary focus:ring-primary cursor-pointer"
              />
            </label>
          </div>

          <div className="font-bold text-foreground uppercase tracking-wider text-[11px] pt-2 border-t border-border">
            Phân hệ nghiệp vụ chuyên sâu:
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <label className="flex items-center justify-between p-2.5 rounded-xl border border-border bg-background cursor-pointer hover:border-primary/50 transition">
              <span className="font-medium text-foreground">👑 Quyền Quản Trị Viên (Admin)</span>
              <input
                type="checkbox"
                checked={isAdmin}
                onChange={(e) => setIsAdmin(e.target.checked)}
                className="h-4 w-4 rounded text-primary focus:ring-primary cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-2.5 rounded-xl border border-border bg-background cursor-pointer hover:border-primary/50 transition">
              <span className="font-medium text-foreground">👥 Quản lý Hội viên</span>
              <input
                type="checkbox"
                checked={canManageMembers}
                onChange={(e) => setCanManageMembers(e.target.checked)}
                className="h-4 w-4 rounded text-primary focus:ring-primary cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-2.5 rounded-xl border border-border bg-background cursor-pointer hover:border-primary/50 transition">
              <span className="font-medium text-foreground">📅 Quản lý Sự kiện</span>
              <input
                type="checkbox"
                checked={canManageEvents}
                onChange={(e) => setCanManageEvents(e.target.checked)}
                className="h-4 w-4 rounded text-primary focus:ring-primary cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-2.5 rounded-xl border border-border bg-background cursor-pointer hover:border-primary/50 transition">
              <span className="font-medium text-foreground">💰 Quản lý Tài chính / Thu phí</span>
              <input
                type="checkbox"
                checked={canManageFinance}
                onChange={(e) => setCanManageFinance(e.target.checked)}
                className="h-4 w-4 rounded text-primary focus:ring-primary cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-2.5 rounded-xl border border-border bg-background cursor-pointer hover:border-primary/50 transition">
              <span className="font-medium text-foreground">📰 Quản lý Tin tức / Truyền thông</span>
              <input
                type="checkbox"
                checked={canManageNews}
                onChange={(e) => setCanManageNews(e.target.checked)}
                className="h-4 w-4 rounded text-primary focus:ring-primary cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-2.5 rounded-xl border border-border bg-background cursor-pointer hover:border-primary/50 transition">
              <span className="font-medium text-foreground">🤝 Quản lý Giao thương / Cơ hội B2B</span>
              <input
                type="checkbox"
                checked={canManageMarketplace}
                onChange={(e) => setCanManageMarketplace(e.target.checked)}
                className="h-4 w-4 rounded text-primary focus:ring-primary cursor-pointer"
              />
            </label>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 pt-3 border-t border-border">
          <button
            type="button"
            onClick={onReset}
            className="px-3.5 py-2 text-xs font-bold rounded-xl border border-rose-300 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer flex items-center gap-1.5 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Đặt lại theo chuẩn của Ban</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl border border-border hover:bg-muted cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 text-xs font-bold rounded-xl bg-[#003B95] text-white hover:bg-[#002b6d] shadow-sm flex items-center gap-1.5 cursor-pointer transition"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Lưu Phân Quyền</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
