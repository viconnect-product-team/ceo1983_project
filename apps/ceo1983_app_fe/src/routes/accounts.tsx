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
  Shield,
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
import { fetchNestApi, resolveMediaUrl } from "@/lib/api-client";
import { useRole, clearMeCache } from "@/hooks/use-role";
import { ROLE_OPTIONS, DEPARTMENT_OPTIONS, normalizeRole, normalizeDept } from "@/routes/permissions";
import { SYSTEM_ROLES, COMMITTEES } from "@/components/dashboard/RbacPermissionMatrix";
import {
  dispatchPermissionSyncEvent,
  getCustomDepartments,
  getAllDynamicRoleOptions,
  getRolesForDepartment,
  DepartmentItem,
  isRouteAllowedByMatrix,
} from "@/lib/rbac-permission-helpers";
import { Pagination, SortHeader } from "@/components/dashboard/DataTablePagination";
import { sanitizePhoneNumber, handleNumericKeyDown } from "@/lib/utils";

export const Route = createFileRoute("/accounts")({
  component: AccountsPage,
});

import {
  DEFAULT_ACCOUNTS,
  MANAGED_ACCOUNTS_STORAGE_KEY,
  type UserAccountItem,
} from "@/lib/committee-accounts";

export type { UserAccountItem };

const STORAGE_KEY = MANAGED_ACCOUNTS_STORAGE_KEY;
const DELETED_ACCOUNTS_KEY = "vba_deleted_account_identifiers_v3";

function getDeletedIdentifiers(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(DELETED_ACCOUNTS_KEY);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) return new Set(arr.map((s: string) => String(s || "").toLowerCase().trim()).filter(Boolean));
    }
  } catch {}
  return new Set();
}

function addDeletedIdentifiers(identifiers: (string | undefined | null)[]) {
  if (typeof window === "undefined") return;
  try {
    const cur = getDeletedIdentifiers();
    identifiers.forEach((id) => {
      if (id) {
        const clean = String(id).toLowerCase().trim();
        if (clean) cur.add(clean);
        const withoutPrefix = clean.replace(/^acc_/, "").trim();
        if (withoutPrefix) cur.add(withoutPrefix);
      }
    });
    localStorage.setItem(DELETED_ACCOUNTS_KEY, JSON.stringify(Array.from(cur)));
  } catch {}
}

function AccountsPage() {
  const { isPlatformAdmin, isBQT, isAdmin, srsRole } = useRole();
  const canManage = isPlatformAdmin || isBQT || isAdmin || isRouteAllowedByMatrix("/accounts", (srsRole as any) || "member");

  const [accounts, setAccounts] = useState<UserAccountItem[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const deleted = getDeletedIdentifiers();
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved !== null) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            return parsed.filter((a) => {
              const id = (a.id || "").toLowerCase().trim();
              const code = (a.code || "").toLowerCase().trim();
              const email = (a.email || "").toLowerCase().trim();
              const dbId = (a.dbMemberId || "").toLowerCase().trim();
              return !deleted.has(id) && !deleted.has(code) && !deleted.has(email) && !deleted.has(dbId);
            });
          }
        }
      } catch {}
    }
    const deleted = getDeletedIdentifiers();
    return DEFAULT_ACCOUNTS.filter((a) => {
      const id = (a.id || "").toLowerCase().trim();
      const code = (a.code || "").toLowerCase().trim();
      const email = (a.email || "").toLowerCase().trim();
      return !deleted.has(id) && !deleted.has(code) && !deleted.has(email);
    });
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
  const [pageSize, setPageSize] = useState(10);

  // Dirty state tracking (Unsaved changes) with explicit boolean flag
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const isDirty = useMemo(() => {
    return hasUnsavedChanges || JSON.stringify(accounts) !== initialAccountsStr;
  }, [hasUnsavedChanges, accounts, initialAccountsStr]);

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<UserAccountItem | null>(null);
  const [deleteConfirmAccount, setDeleteConfirmAccount] = useState<UserAccountItem | null>(null);
  const [selectedAccountIds, setSelectedAccountIds] = useState<Set<string>>(new Set());
  const [isBulkDeleteConfirmOpen, setIsBulkDeleteConfirmOpen] = useState(false);
  const [isDeleteAllConfirmOpen, setIsDeleteAllConfirmOpen] = useState(false);

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
    return getRolesForDepartment(formDepartment, customDepts, formRole);
  }, [formDepartment, customDepts, formRole]);

  const handleDepartmentChange = (newDept: string) => {
    const cleanDept = normalizeDept(newDept);
    setFormDepartment(cleanDept);
    const roles = getRolesForDepartment(cleanDept, customDepts);
    if (roles.length > 0) {
      if (!roles.some((r) => r.value === formRole)) {
        setFormRole(roles[0].value);
      }
    }
  };

  // Load live accounts from members API and sync database state
  useEffect(() => {
    let active = true;
    fetchNestApi<any[]>("/members")
      .then((mList) => {
        if (!active || !Array.isArray(mList) || mList.length === 0) return;

        const deleted = getDeletedIdentifiers();
        const validMList = mList.filter((m) => {
          const id = String(m.id || "").toLowerCase().trim();
          const code = String(m.code || "").toLowerCase().trim();
          const email = String(m.email || "").toLowerCase().trim();
          const userId = String(m.user_id || m.userId || "").toLowerCase().trim();
          return !deleted.has(id) && !deleted.has(code) && !deleted.has(email) && !deleted.has(userId);
        });

        setAccounts((prev) => {
          const memberByCode = new Map<string, any>();
          const memberById = new Map<string, any>();
          const memberByEmail = new Map<string, any>();

          validMList.forEach((m) => {
            if (m.code) memberByCode.set(m.code.toUpperCase().trim(), m);
            if (m.id) memberById.set(m.id.toLowerCase().trim(), m);
            if (m.email) memberByEmail.set(m.email.toLowerCase().trim(), m);
          });

          const matchedMemberIds = new Set<string>();

          // 1. Đồng bộ các tài khoản hiện có với dữ liệu thực tế từ Database (đã loại trừ đã xóa)
          const updatedPrev: UserAccountItem[] = prev
            .filter((a) => {
              const id = (a.id || "").toLowerCase().trim();
              const code = (a.code || "").toLowerCase().trim();
              const email = (a.email || "").toLowerCase().trim();
              const dbId = (a.dbMemberId || "").toLowerCase().trim();
              return !deleted.has(id) && !deleted.has(code) && !deleted.has(email) && !deleted.has(dbId);
            })
            .map((a) => {
              const cleanId = (a.id || "").replace(/^acc_/, "").toLowerCase().trim();
              const cleanCode = (a.code || "").toUpperCase().trim();
              const cleanEmail = (a.email || "").toLowerCase().trim();

              const m =
                (cleanCode && memberByCode.get(cleanCode)) ||
                (cleanId && memberById.get(cleanId)) ||
                (cleanEmail && memberByEmail.get(cleanEmail));

              if (m) {
                if (m.id) matchedMemberIds.add(m.id);
                const realRole = normalizeRole(m.executiveRole || m.executive_role || m.role || a.role);
                const realDept = normalizeDept(m.department || a.department);
                const resolvedStatus: "active" | "inactive" | "locked" =
                  (m.status === "active" || m.status === "approved" || a.status === "active")
                    ? "active"
                    : (a.status === "locked" || a.status === "inactive" ? a.status : "active");

                return {
                  ...a,
                  id: a.id || `acc_${m.id || m.code}`,
                  dbMemberId: m.id || a.dbMemberId,
                  name: m.name || m.personName || a.name,
                  code: m.code || a.code,
                  email: a.email || m.email,
                  phone: m.phone || m.mobile || a.phone,
                  companyName: m.companyName || m.company || a.companyName,
                  department: realDept,
                  role: realRole,
                  avatar: m.avatar || m.avatarUrl || a.avatar,
                  status: resolvedStatus,
                };
              }
              return a;
            });

          // 2. Bổ sung các hội viên từ CSDL chưa có trong danh sách
          const newAccounts: UserAccountItem[] = validMList
            .filter((m) => m.id && !matchedMemberIds.has(m.id))
            .filter(
              (m) =>
                m.status === "approved" ||
                m.status === "active" ||
                m.membershipStatus === "approved" ||
                m.membershipStatus === "active"
            )
            .map((m) => ({
              id: `acc_${m.id || m.code}`,
              dbMemberId: m.id,
              name: m.name || m.personName || "Hội viên CEO 1983",
              code: m.code || `CEO-${m.id.slice(0, 4)}`,
              email: m.email || `${(m.code || 'member').toLowerCase()}@ceo1983.vn`,
              phone: m.phone || m.mobile || "",
              companyName: m.companyName || m.company || m.industry || "Doanh nghiệp CEO 1983",
              department: normalizeDept(m.department),
              role: normalizeRole(m.executiveRole || m.executive_role || m.role),
              avatar: m.avatar,
              status: "active" as const,
            }));

          const combined = [...updatedPrev, ...newAccounts];
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(combined));
            setInitialAccountsStr(JSON.stringify(combined));
          } catch {}
          return combined;
        });
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  // Thay đổi role trực tiếp -> tự động lưu ngay vào CSDL và đồng bộ quyền
  const handleInlineRoleChange = async (accId: string, newRole: string) => {
    const acc = accounts.find((a) => a.id === accId);
    if (!acc) return;

    // Đưa bản ghi vừa cập nhật lên đầu danh sách
    const updatedAcc = { ...acc, role: newRole };
    const next = [updatedAcc, ...accounts.filter((a) => a.id !== accId)];
    setAccounts(next);
    setCurrentPage(1);

    const targetId = acc.dbMemberId || (acc.id ? acc.id.replace(/^acc_/, "") : acc.code);
    const payload = {
      executiveRole: newRole,
      department: acc.department,
      email: acc.email,
      code: acc.code,
      name: acc.name,
    };

    try {
      await fetchNestApi(`/members/${encodeURIComponent(targetId)}/role-dept`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      }).catch(() =>
        fetchNestApi(`/members/${encodeURIComponent(targetId)}/role-dept`, {
          method: "POST",
          body: JSON.stringify(payload),
        })
      );

      try {
        const nextStr = JSON.stringify(next);
        localStorage.setItem(STORAGE_KEY, nextStr);
        setInitialAccountsStr(nextStr);
        setHasUnsavedChanges(false);
      } catch {}

      clearMeCache();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("role-changed"));
        window.dispatchEvent(new Event("crm_permissions_updated"));
        window.dispatchEvent(new Event("vba_auth_changed"));
      }
      toast.success(`Đã cập nhật vai trò "${getRoleLabel(newRole)}" cho "${acc.name}" vào CSDL thành công.`);
    } catch {
      toast.error(`Lỗi khi lưu vai trò cho ${acc.name}`);
    }
  };

  // Lưu toàn bộ danh sách tài khoản & phân quyền vào CSDL
  const handleSaveAll = async () => {
    setSaving(true);
    try {
      // 1. Xác định các tài khoản có thay đổi cần lưu
      let initialList: UserAccountItem[] = [];
      try {
        if (initialAccountsStr) initialList = JSON.parse(initialAccountsStr);
      } catch {}

      const initialMap = new Map<string, UserAccountItem>();
      initialList.forEach((a) => {
        initialMap.set(a.id, a);
        if (a.code) initialMap.set(a.code, a);
      });

      const changedAccounts = accounts.filter((a) => {
        const orig = initialMap.get(a.id) || (a.code ? initialMap.get(a.code) : null);
        if (!orig) return true;
        return (
          orig.role !== a.role ||
          orig.department !== a.department ||
          orig.name !== a.name ||
          orig.status !== a.status
        );
      });

      // 2. Ghi trực tiếp vào Backend PostgreSQL API cho các tài khoản có thay đổi
      if (changedAccounts.length > 0) {
        const savePromises = changedAccounts.map(async (acc) => {
          const targetId = acc.dbMemberId || (acc.id ? acc.id.replace(/^acc_/, "") : acc.code);
          if (!targetId) return;
          const payload = {
            executiveRole: acc.role,
            department: acc.department,
            email: acc.email,
            code: acc.code,
            name: acc.name,
          };
          try {
            await fetchNestApi(`/members/${encodeURIComponent(targetId)}/role-dept`, {
              method: "PATCH",
              body: JSON.stringify(payload),
            });
          } catch {
            try {
              await fetchNestApi(`/members/${encodeURIComponent(targetId)}/role-dept`, {
                method: "POST",
                body: JSON.stringify(payload),
              });
            } catch (e2) {
              console.warn(`Lưu phân quyền cho ${acc.name} thất bại:`, e2);
            }
          }
        });

        await Promise.allSettled(savePromises);
      }

      // 3. Cập nhật localStorage snapshot & dập tắt trạng thái dirty
      const savedAccountsStr = JSON.stringify(accounts);
      try {
        localStorage.setItem(STORAGE_KEY, savedAccountsStr);
        setInitialAccountsStr(savedAccountsStr);
      } catch (lsErr) {
        console.warn("Could not save to localStorage:", lsErr);
      }
      setHasUnsavedChanges(false);

      // 4. Xóa cache và phát sự kiện đồng bộ toàn hệ thống
      clearMeCache();
      try {
        dispatchPermissionSyncEvent();
      } catch {}
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("role-changed"));
        window.dispatchEvent(new Event("crm_permissions_updated"));
        window.dispatchEvent(new Event("vba_auth_changed"));
        window.dispatchEvent(new CustomEvent("vba_accounts_changed", { detail: accounts }));
      }

      toast.success("Đã lưu và đồng bộ phân quyền tài khoản vào CSDL thành công!");
    } catch (err: any) {
      console.error("Lỗi khi lưu tài khoản:", err);
      toast.error(err?.message || "Lỗi khi lưu tài khoản vào CSDL!");
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
        setHasUnsavedChanges(false);
        toast.info("Đã hoàn tác toàn bộ thay đổi tài khoản chưa lưu.");
      } catch {}
    } else {
      setHasUnsavedChanges(false);
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
    const cleanDept = normalizeDept(acc.department || "Ban Điều Hành");
    setFormDepartment(cleanDept);
    const validRoles = getRolesForDepartment(cleanDept, customDepts);
    const hasRole = validRoles.some((r) => r.value === acc.role);
    setFormRole(hasRole ? (acc.role || validRoles[0].value) : (validRoles[0]?.value || "member"));
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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const next = [newAcc, ...accounts];
    setAccounts(next);
    setHasUnsavedChanges(true);
    setCurrentPage(1);
    toast.success(`Đã thêm mới tài khoản "${newAcc.name}". Bấm 'Lưu Thay Đổi' để đồng bộ vào CSDL.`);
    setIsAddOpen(false);
  };

  const handleUpdateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccount) return;

    const updatedAcc: UserAccountItem = {
      ...selectedAccount,
      name: formName.trim(),
      code: formCode.trim().toUpperCase(),
      email: formEmail.trim().toLowerCase(),
      phone: formPhone.trim(),
      companyName: formCompany.trim(),
      department: formDepartment,
      role: formRole,
      status: formStatus,
      updatedAt: new Date().toISOString(),
    };

    // Đưa bản ghi vừa cập nhật lên đầu danh sách (STT 1)
    const next = [updatedAcc, ...accounts.filter((a) => a.id !== selectedAccount.id)];
    setAccounts(next);
    setCurrentPage(1);

    // Tự động lưu ngay lập tức vào CSDL
    const targetId =
      selectedAccount.dbMemberId ||
      (selectedAccount.id ? selectedAccount.id.replace(/^acc_/, "") : selectedAccount.code);

    if (targetId) {
      const payload = {
        executiveRole: formRole,
        department: formDepartment,
        email: formEmail,
        code: formCode,
        name: formName,
      };

      fetchNestApi(`/members/${encodeURIComponent(targetId)}/role-dept`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      })
        .catch(() =>
          fetchNestApi(`/members/${encodeURIComponent(targetId)}/role-dept`, {
            method: "POST",
            body: JSON.stringify(payload),
          })
        )
        .then(() => {
          clearMeCache();
          try {
            const rawMyMem = localStorage.getItem("vba_my_member");
            if (rawMyMem) {
              const myMem = JSON.parse(rawMyMem);
              if (
                myMem.id === targetId ||
                myMem.code === selectedAccount.code ||
                myMem.email === selectedAccount.email
              ) {
                myMem.executiveRole = formRole;
                myMem.executive_role = formRole;
                myMem.role = formRole;
                myMem.department = formDepartment;
                localStorage.setItem("vba_my_member", JSON.stringify(myMem));
              }
            }
            const rawCrmUser = localStorage.getItem("vba_crm_current_user");
            if (rawCrmUser) {
              const cu = JSON.parse(rawCrmUser);
              if (cu.id === targetId || cu.email === selectedAccount.email) {
                cu.role = formRole;
                cu.executiveRole = formRole;
                localStorage.setItem("vba_crm_current_user", JSON.stringify(cu));
              }
            }
          } catch {}

          if (typeof window !== "undefined") {
            window.dispatchEvent(new Event("role-changed"));
            window.dispatchEvent(new Event("crm_permissions_updated"));
            window.dispatchEvent(new Event("vba_auth_changed"));
          }
        })
        .catch(() => {});
    }

    try {
      const nextStr = JSON.stringify(next);
      localStorage.setItem(STORAGE_KEY, nextStr);
      setInitialAccountsStr(nextStr);
      setHasUnsavedChanges(false);
    } catch {}

    toast.success(`Đã cập nhật phân quyền "${getRoleLabel(formRole)}" cho "${formName}" vào CSDL thành công.`);
    setIsEditOpen(false);
  };

  const isRootAdmin = (acc: UserAccountItem) => {
    return (
      acc.role === "quan_tri" ||
      acc.code === "ADMIN-001" ||
      acc.email === "admin@connect.vn" ||
      acc.email === "admin@ceo1983.vn"
    );
  };

  const handleDeleteAccount = async (acc: UserAccountItem) => {
    if (isRootAdmin(acc)) {
      toast.error("Tài khoản Quản trị cấp cao không thể xóa!");
      return;
    }

    try {
      const cleanId = (acc.dbMemberId || acc.id || "").replace(/^acc_/, "").trim();
      addDeletedIdentifiers([acc.id, acc.dbMemberId, acc.code, acc.email, cleanId]);

      const calls: Promise<any>[] = [];
      if (cleanId) {
        calls.push(fetchNestApi(`/users/${encodeURIComponent(cleanId)}`, { method: "DELETE" }).catch(() => null));
        calls.push(fetchNestApi(`/members/${encodeURIComponent(cleanId)}?mode=all`, { method: "DELETE" }).catch(() => null));
      }
      if (acc.email) {
        calls.push(fetchNestApi(`/users/${encodeURIComponent(acc.email)}`, { method: "DELETE" }).catch(() => null));
        calls.push(fetchNestApi(`/members/${encodeURIComponent(acc.email)}?mode=all`, { method: "DELETE" }).catch(() => null));
      }
      if (acc.code) {
        calls.push(fetchNestApi(`/members/${encodeURIComponent(acc.code)}?mode=all`, { method: "DELETE" }).catch(() => null));
      }
      await Promise.allSettled(calls);

      const next = accounts.filter((a) => a.id !== acc.id && a.email !== acc.email && a.code !== acc.code);
      setAccounts(next);
      setSelectedAccountIds((prev) => {
        const s = new Set(prev);
        s.delete(acc.id);
        return s;
      });
      setDeleteConfirmAccount(null);

      try {
        const nextStr = JSON.stringify(next);
        localStorage.setItem(STORAGE_KEY, nextStr);
        setInitialAccountsStr(nextStr);
        clearMeCache();
        window.dispatchEvent(new CustomEvent("vba_accounts_changed", { detail: next }));
        window.dispatchEvent(new Event("role-changed"));
        window.dispatchEvent(new Event("crm_permissions_updated"));
        window.dispatchEvent(new Event("vba_auth_changed"));
      } catch {}

      toast.success(`Đã xóa tài khoản "${acc.name}" cùng hồ sơ hội viên và doanh nghiệp thành công.`);
    } catch (err: any) {
      toast.error(err?.message || "Lỗi khi xóa tài khoản");
    }
  };

  const handleDeleteBulk = async () => {
    const toDelete = accounts.filter((a) => selectedAccountIds.has(a.id) && !isRootAdmin(a));
    if (toDelete.length === 0) {
      toast.info("Không có tài khoản hợp lệ nào được chọn để xóa");
      return;
    }

    try {
      toDelete.forEach((acc) => {
        const cleanId = (acc.dbMemberId || acc.id || "").replace(/^acc_/, "").trim();
        addDeletedIdentifiers([acc.id, acc.dbMemberId, acc.code, acc.email, cleanId]);
      });

      await Promise.allSettled(
        toDelete.flatMap((acc) => {
          const cleanId = (acc.dbMemberId || acc.id || "").replace(/^acc_/, "").trim();
          const p: Promise<any>[] = [];
          if (cleanId) {
            p.push(fetchNestApi(`/users/${encodeURIComponent(cleanId)}`, { method: "DELETE" }).catch(() => null));
            p.push(fetchNestApi(`/members/${encodeURIComponent(cleanId)}?mode=all`, { method: "DELETE" }).catch(() => null));
          }
          if (acc.email) {
            p.push(fetchNestApi(`/users/${encodeURIComponent(acc.email)}`, { method: "DELETE" }).catch(() => null));
            p.push(fetchNestApi(`/members/${encodeURIComponent(acc.email)}?mode=all`, { method: "DELETE" }).catch(() => null));
          }
          if (acc.code) {
            p.push(fetchNestApi(`/members/${encodeURIComponent(acc.code)}?mode=all`, { method: "DELETE" }).catch(() => null));
          }
          return p;
        })
      );

      const toDeleteIds = new Set(toDelete.map((a) => a.id));
      const next = accounts.filter((a) => !toDeleteIds.has(a.id));
      setAccounts(next);
      setSelectedAccountIds(new Set());
      setIsBulkDeleteConfirmOpen(false);

      try {
        const nextStr = JSON.stringify(next);
        localStorage.setItem(STORAGE_KEY, nextStr);
        setInitialAccountsStr(nextStr);
        clearMeCache();
        window.dispatchEvent(new CustomEvent("vba_accounts_changed", { detail: next }));
        window.dispatchEvent(new Event("role-changed"));
        window.dispatchEvent(new Event("crm_permissions_updated"));
        window.dispatchEvent(new Event("vba_auth_changed"));
      } catch {}

      toast.success(`Đã xóa thành công ${toDelete.length} tài khoản đã chọn.`);
    } catch (err: any) {
      toast.error(err?.message || "Lỗi khi xóa tài khoản hàng loạt");
    }
  };

  const handleDeleteAll = async () => {
    const toDelete = accounts.filter((a) => !isRootAdmin(a));
    if (toDelete.length === 0) {
      toast.info("Không có tài khoản nào có thể xóa (tài khoản gốc được bảo vệ)");
      return;
    }

    try {
      toDelete.forEach((acc) => {
        const cleanId = (acc.dbMemberId || acc.id || "").replace(/^acc_/, "").trim();
        addDeletedIdentifiers([acc.id, acc.dbMemberId, acc.code, acc.email, cleanId]);
      });

      await Promise.allSettled(
        toDelete.flatMap((acc) => {
          const cleanId = (acc.dbMemberId || acc.id || "").replace(/^acc_/, "").trim();
          const p: Promise<any>[] = [];
          if (cleanId) {
            p.push(fetchNestApi(`/users/${encodeURIComponent(cleanId)}`, { method: "DELETE" }).catch(() => null));
            p.push(fetchNestApi(`/members/${encodeURIComponent(cleanId)}?mode=all`, { method: "DELETE" }).catch(() => null));
          }
          if (acc.email) {
            p.push(fetchNestApi(`/users/${encodeURIComponent(acc.email)}`, { method: "DELETE" }).catch(() => null));
            p.push(fetchNestApi(`/members/${encodeURIComponent(acc.email)}?mode=all`, { method: "DELETE" }).catch(() => null));
          }
          if (acc.code) {
            p.push(fetchNestApi(`/members/${encodeURIComponent(acc.code)}?mode=all`, { method: "DELETE" }).catch(() => null));
          }
          return p;
        })
      );

      const next = accounts.filter((a) => isRootAdmin(a));
      setAccounts(next);
      setSelectedAccountIds(new Set());
      setIsDeleteAllConfirmOpen(false);

      try {
        const nextStr = JSON.stringify(next);
        localStorage.setItem(STORAGE_KEY, nextStr);
        setInitialAccountsStr(nextStr);
        clearMeCache();
        window.dispatchEvent(new CustomEvent("vba_accounts_changed", { detail: next }));
        window.dispatchEvent(new Event("role-changed"));
        window.dispatchEvent(new Event("crm_permissions_updated"));
        window.dispatchEvent(new Event("vba_auth_changed"));
      } catch {}

      toast.success(`Đã xóa tất cả ${toDelete.length} tài khoản thành công (Bảo vệ tài khoản quản trị gốc).`);
    } catch (err: any) {
      toast.error(err?.message || "Lỗi khi xóa tất cả tài khoản");
    }
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

  const deletableAccounts = useMemo(() => {
    return accounts.filter((a) => !isRootAdmin(a));
  }, [accounts]);

  const deletableInFiltered = useMemo(() => {
    return filteredAccounts.filter((a) => !isRootAdmin(a));
  }, [filteredAccounts]);

  const allFilteredSelected = useMemo(() => {
    if (deletableInFiltered.length === 0) return false;
    return deletableInFiltered.every((a) => selectedAccountIds.has(a.id));
  }, [deletableInFiltered, selectedAccountIds]);

  const toggleSelectAll = () => {
    if (allFilteredSelected) {
      setSelectedAccountIds((prev) => {
        const next = new Set(prev);
        deletableInFiltered.forEach((a) => next.delete(a.id));
        return next;
      });
    } else {
      setSelectedAccountIds((prev) => {
        const next = new Set(prev);
        deletableInFiltered.forEach((a) => next.add(a.id));
        return next;
      });
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedAccountIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Sắp xếp cột 3 trạng thái & phân trang đồng nhất (mặc định null để bản ghi mới / vừa sửa luôn ở đầu)
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc" | null>(null);

  const handleSort = (key: string) => {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDir("asc");
    } else if (sortDir === "asc") {
      setSortDir("desc");
    } else if (sortDir === "desc") {
      // 3-state sorting: Trạng thái thứ 3 quay về mặc định (null)
      setSortKey(null);
      setSortDir(null);
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setCurrentPage(1);
  };

  // Reset về trang 1 khi lọc hoặc tìm kiếm
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedDeptFilter, selectedRoleFilter]);

  const sortedAccounts = useMemo(() => {
    if (!sortKey) return filteredAccounts;
    const copy = [...filteredAccounts];
    copy.sort((a, b) => {
      let av: string | number = "";
      let bv: string | number = "";
      if (sortKey === "name") {
        av = a.name;
        bv = b.name;
      } else if (sortKey === "code") {
        av = a.code;
        bv = b.code;
      } else if (sortKey === "email") {
        av = a.email;
        bv = b.email;
      } else if (sortKey === "company") {
        av = a.companyName || "";
        bv = b.companyName || "";
      } else if (sortKey === "dept") {
        av = a.department || "";
        bv = b.department || "";
      } else if (sortKey === "role") {
        av = a.role || "";
        bv = b.role || "";
      }
      const cmp = String(av).localeCompare(String(bv), "vi", { numeric: true });
      return sortDir === "asc" ? cmp : -cmp;
    });
    return copy;
  }, [filteredAccounts, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sortedAccounts.length / pageSize));
  const paginatedAccounts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedAccounts.slice(start, start + pageSize);
  }, [sortedAccounts, currentPage, pageSize]);

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

  const getRoleLabel = (roleKey: string) => {
    const found = SYSTEM_ROLES.find((r) => r.key === roleKey);
    if (found) return found.shortName;
    const dynamicRole = allRoleOptions.find((r) => r.value === roleKey);
    return dynamicRole?.label || roleKey || "Thành viên";
  };

  return (
    <AppShell>
      <div className="w-full max-w-7xl mx-auto space-y-6">
        {/* Header với Icon Logo */}
        <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-5">
          <img
            src="/icons/ceo1983_icon_2/image 6.png"
            alt="CEO 1983"
            className="w-16 h-16 object-contain shrink-0"
          />
          <div className="flex-1">
            <h1 className="text-slate-900 dark:text-white text-2xl font-bold font-['Inter'] leading-8">
              Quản Lý Tài Khoản &amp; Phân Quyền Vai Trò
            </h1>
            <p className="text-slate-500 text-sm font-normal font-['Inter'] leading-5 mt-0.5">
              Quản lý danh sách tài khoản người dùng, phân công ban chuyên môn và gán vai trò quyền hạn hệ thống CEO 1983
            </p>
          </div>
        </div>

        {/* ── 4 METRIC CARDS (Minimalist Solid 5-Colors) ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="h-32 p-4 bg-white dark:bg-card rounded-[20px] border border-slate-200 dark:border-slate-800 flex flex-col justify-start items-start gap-2.5 overflow-hidden shadow-xs">
            <div className="h-8 flex items-center gap-2">
              <img src="/icons/ceo1983_icon_2/users-round-1.svg" className="h-4 w-4" alt="users" />
              <div className="text-[#003B95] dark:text-blue-400 text-xs font-semibold font-['Inter']">TỔNG SỐ TÀI KHOẢN</div>
            </div>
            <div className="text-slate-900 dark:text-white text-2xl font-bold font-['Inter'] leading-7">{accounts.length}</div>
            <div className="text-slate-500 text-xs font-normal font-['Inter']">Tài khoản quản trị &amp; hội viên</div>
          </div>

          <div className="h-32 p-4 bg-white dark:bg-card rounded-[20px] border border-slate-200 dark:border-slate-800 flex flex-col justify-start items-start gap-2.5 overflow-hidden shadow-xs">
            <div className="h-8 flex items-center gap-2">
              <img src="/icons/ceo1983_icon_2/shield-check.svg" className="h-4 w-4" alt="shield" />
              <div className="text-[#003B95] dark:text-blue-400 text-xs font-semibold font-['Inter']">LÃNH ĐẠO &amp; QUẢN TRỊ</div>
            </div>
            <div className="text-slate-900 dark:text-white text-2xl font-bold font-['Inter'] leading-7">
              {accounts.filter((a) => a.role === "quan_tri" || a.role === "admin" || a.role === "chu_tich").length}
            </div>
            <div className="text-slate-500 text-xs font-normal font-['Inter']">Admin &amp; Ban điều hành cấp cao</div>
          </div>

          <div className="h-32 p-4 bg-white dark:bg-card rounded-[20px] border border-slate-200 dark:border-slate-800 flex flex-col justify-start items-start gap-2.5 overflow-hidden shadow-xs">
            <div className="h-8 flex items-center gap-2">
              <img src="/icons/ceo1983_icon_2/building-2-1.svg" className="h-4 w-4" alt="building" />
              <div className="text-amber-600 dark:text-amber-400 text-xs font-semibold font-['Inter']">TRƯỞNG BAN CHUYÊN MÔN</div>
            </div>
            <div className="text-slate-900 dark:text-white text-2xl font-bold font-['Inter'] leading-7">
              {accounts.filter((a) => a.role.startsWith("truong_ban_")).length}
            </div>
            <div className="text-slate-500 text-xs font-normal font-['Inter']">Được phân quyền quản lý theo ban</div>
          </div>

          <div className="h-32 p-4 bg-white dark:bg-card rounded-[20px] border border-slate-200 dark:border-slate-800 flex flex-col justify-start items-start gap-2.5 overflow-hidden shadow-xs">
            <div className="h-8 flex items-center gap-2">
              <img src="/icons/ceo1983_icon_2/circle-check.svg" className="h-4 w-4" alt="check" />
              <div className="text-emerald-600 dark:text-emerald-400 text-xs font-semibold font-['Inter']">ĐANG HOẠT ĐỘNG</div>
            </div>
            <div className="text-slate-900 dark:text-white text-2xl font-bold font-['Inter'] leading-7">
              {accounts.filter((a) => a.status === "active").length}
            </div>
            <div className="text-slate-500 text-xs font-normal font-['Inter']">Đã kích hoạt và sẵn sàng đăng nhập</div>
          </div>
        </div>

        {/* ── TOOLBAR: TÌM KIẾM CẠNH THÊM MỚI (Figma Style) ── */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-[0px_2px_2px_0px_rgba(22,39,75,0.05)]">
          <div className="flex flex-1 items-center gap-2 max-w-xl">
            <div className="flex-1 h-9 px-3 bg-white dark:bg-card rounded-3xl outline outline-1 outline-slate-200 flex items-center gap-2.5 overflow-hidden">
              <img src="/icons/ceo1983_icon_2/search.svg" className="h-4 w-4 shrink-0" alt="search" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm tài khoản theo tên, email, SĐT, mã hội viên..."
                className="flex-1 bg-transparent text-xs text-slate-900 dark:text-white placeholder:text-slate-500 outline-none"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="text-slate-400 hover:text-slate-600">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={handleOpenAdd}
              className="h-9 px-4 bg-blue-800 rounded-3xl shadow-sm flex items-center gap-2 text-white text-xs font-bold transition hover:bg-blue-900 shrink-0 cursor-pointer"
            >
              <img src="/icons/ceo1983_icon_2/plus.svg" className="h-3.5 w-3.5" alt="plus" />
              <span>Thêm Tài Khoản</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <select
                value={selectedDeptFilter}
                onChange={(e) => setSelectedDeptFilter(e.target.value)}
                className="h-9 px-3 pr-8 bg-white dark:bg-card rounded-[100px] outline outline-1 outline-slate-200 text-slate-900 dark:text-white text-xs font-normal appearance-none cursor-pointer"
              >
                <option value="all">Tất cả ban</option>
                {departmentList.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
              <img
                src="/icons/ceo1983_icon_2/chevron-down.svg"
                className="h-3 w-3 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                alt="chevron"
              />
            </div>

            <div className="relative">
              <select
                value={selectedRoleFilter}
                onChange={(e) => setSelectedRoleFilter(e.target.value)}
                className="h-9 px-3 pr-8 bg-white dark:bg-card rounded-[100px] outline outline-1 outline-slate-200 text-slate-900 dark:text-white text-xs font-normal appearance-none cursor-pointer"
              >
                <option value="all">Tất cả vai trò</option>
                {allRoleOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <img
                src="/icons/ceo1983_icon_2/chevron-down.svg"
                className="h-3 w-3 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                alt="chevron"
              />
            </div>
          </div>
        </div>

        {/* ── CẢNH BÁO CHƯA LƯU PHÂN QUYỀN TÀI KHOẢN ── */}
        {isDirty && (
          <div className="rounded-2xl border border-amber-300 dark:border-amber-800 bg-amber-50/80 dark:bg-amber-950/30 p-4 flex flex-wrap items-center justify-between gap-3 text-xs animate-in fade-in slide-in-from-top-2 duration-200 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-900 flex items-center justify-center shrink-0 shadow-sm font-black text-sm">
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
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#003B95] hover:bg-[#002B70] text-white font-black text-xs transition shadow-xs shadow-amber-500/20 cursor-pointer disabled:opacity-50"
              >
                <Save className="h-3.5 w-3.5 text-slate-950" />
                <span>{saving ? "Đang lưu..." : "Lưu Thay Đổi"}</span>
              </button>
            </div>
          </div>
        )}

        {/* ── BATCH SELECTION & ACTION BAR (Xóa đã chọn & Xóa tất cả) ── */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs shadow-2xs">
          <div className="flex items-center gap-3">
            <label className="inline-flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={allFilteredSelected}
                onChange={toggleSelectAll}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer accent-[#003B95]"
              />
              <span className="font-bold text-slate-700 dark:text-slate-300">
                {selectedAccountIds.size > 0
                  ? `Đã chọn ${selectedAccountIds.size} / ${deletableInFiltered.length} tài khoản`
                  : `Chọn tất cả tài khoản có thể xóa (${deletableInFiltered.length})`}
              </span>
            </label>
            {selectedAccountIds.size > 0 && (
              <button
                type="button"
                onClick={() => setSelectedAccountIds(new Set())}
                className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 underline cursor-pointer"
              >
                Bỏ chọn
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {selectedAccountIds.size > 0 && (
              <button
                type="button"
                onClick={() => setIsBulkDeleteConfirmOpen(true)}
                className="h-8 px-3.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Xóa đã chọn ({selectedAccountIds.size})</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsDeleteAllConfirmOpen(true)}
              className="h-8 px-3 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/70 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-400 font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer"
              title="Xóa toàn bộ tài khoản ngoại trừ tài khoản quản trị viên gốc"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Xóa tất cả ({deletableAccounts.length})</span>
            </button>
          </div>
        </div>

        {/* ── BẢNG TÀI KHOẢN (Figma Exact Table Design & Resizable Columns) ── */}
        <div className="self-stretch bg-white dark:bg-card rounded-[20px] outline outline-1 outline-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1050px]">
              <thead>
                <tr className="h-16 bg-blue-50/70 dark:bg-blue-950/40 border-b border-slate-200 text-xs font-bold text-slate-900 dark:text-slate-100">
                  <th className="w-10 px-2 text-center border-r border-slate-200 select-none">
                    <input
                      type="checkbox"
                      checked={allFilteredSelected}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer accent-[#003B95]"
                      title="Chọn tất cả trên trang"
                    />
                  </th>
                  <th className="w-12 px-3 text-center border-r border-slate-200 select-none">STT</th>
                  <SortHeader
                    label="THÔNG TIN TÀI KHOẢN"
                    columnKey="name"
                    sortKey={sortKey}
                    sortDir={sortDir}
                    onSort={handleSort}
                    width={280}
                    className="border-r border-slate-200"
                  >
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-blue-800" strokeWidth={2.2} />
                      <span>THÔNG TIN TÀI KHOẢN</span>
                    </div>
                  </SortHeader>
                  <SortHeader
                    label="LIÊN HỆ"
                    columnKey="email"
                    sortKey={sortKey}
                    sortDir={sortDir}
                    onSort={handleSort}
                    width={210}
                    className="border-r border-slate-200"
                  />
                  <SortHeader
                    label="DOANH NGHIỆP"
                    columnKey="company"
                    sortKey={sortKey}
                    sortDir={sortDir}
                    onSort={handleSort}
                    width={230}
                    className="border-r border-slate-200"
                  />
                  <SortHeader
                    label="PHÂN LOẠI BAN"
                    columnKey="dept"
                    sortKey={sortKey}
                    sortDir={sortDir}
                    onSort={handleSort}
                    width={180}
                    className="border-r border-slate-200"
                  />
                  <SortHeader
                    label="VAI TRÒ"
                    columnKey="role"
                    sortKey={sortKey}
                    sortDir={sortDir}
                    onSort={handleSort}
                    width={140}
                    className="border-r border-slate-200"
                  />
                  <th className="w-32 px-4 text-center select-none">THAO TÁC</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200 text-xs">
                {paginatedAccounts.map((acc, index) => {
                  const root = isRootAdmin(acc);
                  const isChecked = selectedAccountIds.has(acc.id);
                  return (
                    <tr
                      key={acc.id}
                      className={`h-16 hover:bg-slate-50/60 dark:hover:bg-slate-900/40 transition ${
                        isChecked ? "bg-blue-50/40 dark:bg-blue-950/20" : ""
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="w-10 px-2 text-center border-r border-slate-200">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          disabled={root}
                          onChange={() => toggleSelectOne(acc.id)}
                          className={`w-4 h-4 rounded cursor-pointer accent-[#003B95] ${
                            root ? "opacity-30 cursor-not-allowed" : ""
                          }`}
                          title={
                            root
                              ? "Tài khoản quản trị viên gốc không thể chọn xóa"
                              : "Chọn tài khoản này"
                          }
                        />
                      </td>

                      {/* STT */}
                      <td className="w-12 px-3 text-center text-slate-500 text-xs font-semibold border-r border-slate-200">
                        {(currentPage - 1) * pageSize + index + 1}
                      </td>

                    {/* THÔNG TIN TÀI KHOẢN */}
                    <td className="px-6 border-r border-slate-200">
                      <div className="flex items-center gap-3">
                        {acc.avatar ? (
                          <img
                            src={resolveMediaUrl(acc.avatar) || acc.avatar}
                            alt={acc.name}
                            className="w-10 h-10 rounded-full object-cover shrink-0 border border-slate-200 dark:border-slate-700"
                            onError={(e) => {
                              (e.currentTarget as HTMLElement).style.display = "none";
                            }}
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-[#003B95] text-white flex items-center justify-center font-semibold text-xs shrink-0">
                            {acc.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="text-slate-900 dark:text-white text-xs font-bold truncate">{acc.name}</div>
                          <div className="mt-0.5 inline-flex px-1 bg-indigo-50 dark:bg-indigo-950/60 rounded-[3px]">
                            <span className="text-blue-800 dark:text-blue-300 text-[10px] font-bold font-mono leading-3">{acc.code}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* LIÊN HỆ */}
                    <td className="px-4 border-r border-slate-200">
                      <div className="flex items-center gap-1.5 text-slate-500 text-xs truncate">
                        <Mail className="h-3.5 w-3.5 shrink-0 text-slate-500" strokeWidth={2} />
                        <span className="truncate">{acc.email}</span>
                      </div>
                      {acc.phone && (
                        <div className="flex items-center gap-1.5 text-slate-500 text-xs mt-1">
                          <Phone className="h-3.5 w-3.5 shrink-0 text-slate-500" strokeWidth={2} />
                          <span>{acc.phone}</span>
                        </div>
                      )}
                    </td>

                    {/* DOANH NGHIỆP */}
                    <td className="px-4 border-r border-slate-200">
                      <div className="text-slate-900 dark:text-white text-xs font-semibold truncate">{acc.companyName || "—"}</div>
                      <div className="text-slate-500 text-[10px]">Pháp nhân hội viên</div>
                    </td>

                    {/* PHÂN LOẠI BAN */}
                    <td className="px-4 border-r border-slate-200">
                      <div className="px-2.5 py-1 bg-sky-100 dark:bg-sky-950/60 rounded-xl inline-flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5 shrink-0 text-sky-700 dark:text-sky-300" strokeWidth={2} />
                        <span className="text-slate-900 dark:text-sky-200 text-xs font-semibold leading-4">{acc.department}</span>
                      </div>
                    </td>

                    {/* VAI TRÒ (HIỂN THỊ DẠNG BADGE KHÔNG CHO SELECT TRỰC TIẾP TRÊN BẢNG) */}
                    <td className="px-4 border-r border-slate-200">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold border border-slate-200/80 dark:border-slate-700">
                        <Shield className="size-3 text-[#003B95] dark:text-blue-400" />
                        <span>{getRoleLabel(acc.role)}</span>
                      </div>
                    </td>

                    {/* THAO TÁC */}
                    <td className="px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenView(acc)}
                          title="Xem chi tiết"
                          aria-label="Xem chi tiết"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-800 transition cursor-pointer dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300"
                        >
                          <Eye className="h-4 w-4" strokeWidth={2.2} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(acc)}
                          title="Chỉnh sửa"
                          aria-label="Chỉnh sửa"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 text-blue-800 hover:bg-blue-100 hover:text-blue-900 transition cursor-pointer dark:bg-blue-950/50 dark:border-blue-800 dark:text-blue-300"
                        >
                          <Pencil className="h-4 w-4" strokeWidth={2.2} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmAccount(acc)}
                          title="Xóa tài khoản"
                          aria-label="Xóa tài khoản"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-700 transition cursor-pointer dark:bg-rose-950/50 dark:border-rose-800 dark:text-rose-300"
                        >
                          <Trash2 className="h-4 w-4" strokeWidth={2.2} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              </tbody>
            </table>
          </div>

          {/* ── THANH CHUYỂN TRANG LIỀN KHỐI ĐỒNG NHẤT (DOCK FOOTER) ── */}
          <Pagination
            page={currentPage}
            pageCount={totalPages}
            pageSize={pageSize}
            total={sortedAccounts.length}
            from={sortedAccounts.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
            to={Math.min(currentPage * pageSize, sortedAccounts.length)}
            onPage={(p) => setCurrentPage(p)}
            onPageSize={(size) => {
              setPageSize(size);
              setCurrentPage(1);
            }}
            pageSizeOptions={[10, 20, 50, 100]}
          />
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
                    type="tel"
                    inputMode="numeric"
                    value={formPhone}
                    onKeyDown={handleNumericKeyDown}
                    onChange={(e) => setFormPhone(sanitizePhoneNumber(e.target.value))}
                    placeholder="0988 xxx xxx"
                    maxLength={11}
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
                  className="px-5 py-2 rounded-xl bg-[#003B95] hover:bg-[#002B70] text-white font-black text-xs shadow-md shadow-amber-500/20 transition cursor-pointer"
                >
                  {isEditOpen ? "Lưu Cập Nhật" : "Tạo Tài Khoản"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 4: XÁC NHẬN XÓA TÀI KHOẢN ── */}
      {/* ── MODAL 4: XÁC NHẬN XÓA 1 TÀI KHOẢN ── */}
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

      {/* ── MODAL 5: XÁC NHẬN XÓA HÀNG LOẠT (ĐÃ CHỌN) ── */}
      {isBulkDeleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3 text-destructive">
              <div className="p-2.5 rounded-xl bg-destructive/10">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-foreground text-sm">Xóa {selectedAccountIds.size} Tài Khoản Đã Chọn?</h3>
                <p className="text-muted-foreground text-xs mt-0.5">Thao tác này sẽ xóa đồng thời các tài khoản đã chọn.</p>
              </div>
            </div>

            <p className="text-xs text-foreground leading-relaxed">
              Bạn có chắc chắn muốn xóa <strong className="text-foreground">{selectedAccountIds.size}</strong> tài khoản đang được chọn? (Các tài khoản quản trị cấp cao gốc sẽ luôn được bảo vệ an toàn).
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setIsBulkDeleteConfirmOpen(false)}
                className="px-3.5 py-1.5 rounded-xl border border-border bg-background hover:bg-muted font-semibold text-xs text-foreground transition cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleDeleteBulk}
                className="px-4 py-1.5 rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90 font-bold text-xs transition cursor-pointer"
              >
                Xác Nhận Xóa ({selectedAccountIds.size})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 6: XÁC NHẬN XÓA TẤT CẢ TÀI KHOẢN ── */}
      {isDeleteAllConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl border border-destructive/30 bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-destructive">
              <div className="p-2.5 rounded-xl bg-destructive/15">
                <ShieldAlert className="h-7 w-7" />
              </div>
              <div>
                <h3 className="font-bold text-foreground text-base">CẢNH BÁO: XÓA TOÀN BỘ TÀI KHOẢN?</h3>
                <p className="text-muted-foreground text-xs mt-0.5">Xóa {deletableAccounts.length} tài khoản thành viên khỏi hệ thống.</p>
              </div>
            </div>

            <div className="p-3 bg-destructive/10 rounded-xl border border-destructive/20 text-xs text-destructive space-y-1">
              <p className="font-bold">Hành động này không thể hoàn tác!</p>
              <p>Hệ thống sẽ bảo vệ và giữ lại duy nhất tài khoản Quản trị cấp cao (Admin Root / ADMIN-001) để bạn tiếp tục vận hành hệ thống.</p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setIsDeleteAllConfirmOpen(false)}
                className="px-4 py-2 rounded-xl border border-border bg-background hover:bg-muted font-semibold text-xs text-foreground transition cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleDeleteAll}
                className="px-5 py-2 rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90 font-bold text-xs shadow-md transition cursor-pointer"
              >
                Xác Nhận Xóa Tất Cả ({deletableAccounts.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
export default AccountsPage;
