import { useEffect, useState, useMemo, useCallback } from "react";
import { fetchNestApi } from "@/lib/api-client";
import { isTokenValid, decodeJwt, useAuth } from "@/context/AuthContext";
import {
  PERMISSIONS,
  SRS_ROLES,
  ROLE_PERMISSIONS,
  type Permission,
  type SrsRole,
} from "@/constants/permissions";

export { PERMISSIONS, SRS_ROLES, ROLE_PERMISSIONS };
export type { Permission, SrsRole };
export type AppRole = "platform_admin" | "admin" | "moderator" | "member" | string;

export type RoleState = {
  roles: AppRole[];
  srsRole: SrsRole;
  isPlatformAdmin: boolean;
  isAdmin: boolean;
  isModerator: boolean;
  isBQT: boolean;
  isBTK: boolean;
  isBTT: boolean;
  isBXT: boolean;
  isBTV: boolean;
  isBTN: boolean;
  isBTC: boolean; // backward-compatibility alias
  isHVT: boolean;
  canManageMembers: boolean;
  canApproveMembers: boolean;
  canRenewMembers: boolean;
  canManageFinance: boolean;
  canManageMedia: boolean;
  canManageEvents: boolean;
  canScanQR: boolean;
  canManageOpportunities: boolean;
  canManageCharity: boolean;
  canManageMeetings: boolean;
  canManageSystem: boolean;
  can: (permission: Permission) => boolean;
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (...permissions: Permission[]) => boolean;
  hasAllPermissions: (...permissions: Permission[]) => boolean;
  hasRole: (role: SrsRole) => boolean;
  loading: boolean;
  setRoleOverride: (role: SrsRole) => void;
};

// Fetches current user's roles from NestJS /users/me and member profile per real database permissions.
export function useRole(): RoleState {
  const { user } = useAuth();
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [srsRole, setSrsRole] = useState<SrsRole>("HVT");
  const [loading, setLoading] = useState(true);

  const resolveSrsRole = (rawRoles: string[], userObj: any, member: any): SrsRole => {
    // Luôn dọn sạch override cũ trong localStorage nếu có
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("vba_crm_role_override");
      } catch {}
    }

    const rList = rawRoles.map((r) => String(r).toLowerCase());
    const primaryRole = String(userObj?.role || member?.role || "").toLowerCase();

    const execRole = String(member?.executiveRole || userObj?.executiveRole || userObj?.executive_role || user?.executiveRole || "").toLowerCase();
    const dept = String(member?.department || userObj?.department || user?.department || "").toLowerCase();

    // ADM (Super Admin / Platform Admin)
    if (
      rList.includes("platform_admin") ||
      rList.includes("superadmin") ||
      primaryRole === "platform_admin" ||
      primaryRole === "superadmin"
    ) {
      return "ADM";
    }

    // 1. BQT (Ban Quản Trị / Ban Thường Trực / Chủ Tịch / Phó Chủ Tịch)
    if (
      rList.includes("admin") ||
      rList.includes("bqt") ||
      rList.includes("board_director") ||
      primaryRole === "admin" ||
      primaryRole === "association_admin" ||
      execRole.includes("quản trị") ||
      execRole.includes("chủ tịch") ||
      execRole.includes("president") ||
      dept.includes("quản trị") ||
      dept.includes("thường trực") ||
      dept.includes("điều hành")
    ) {
      return "BQT";
    }

    // 2. BTK (Ban Thư Ký)
    if (
      rList.includes("btk") ||
      rList.includes("tong_thu_ky") ||
      rList.includes("thu_ky") ||
      execRole.includes("thư ký") ||
      dept.includes("thư ký")
    ) {
      return "BTK";
    }

    // 3. BTT (Ban Truyền Thông)
    if (
      rList.includes("btt") ||
      rList.includes("truyen_thong") ||
      execRole.includes("truyền thông") ||
      dept.includes("truyền thông")
    ) {
      return "BTT";
    }

    // 4. BXT (Ban Xúc Tiến)
    if (
      rList.includes("bxt") ||
      rList.includes("xuc_tien") ||
      rList.includes("thuong_mai") ||
      execRole.includes("xúc tiến") ||
      dept.includes("xúc tiến")
    ) {
      return "BXT";
    }

    // 5. BTV (Ban Thành Viên)
    if (
      rList.includes("btv") ||
      rList.includes("ban_thanh_vien") ||
      rList.includes("phat_trien_hoi_vien") ||
      (dept.includes("thành viên") && !dept.includes("hội viên") && !dept.includes("ceo 1983")) ||
      execRole.includes("ban thành viên") ||
      execRole.includes("trưởng ban thành viên")
    ) {
      return "BTV";
    }

    // 6. BTN (Ban Thiện Nguyện)
    if (
      rList.includes("btn") ||
      rList.includes("thien_nguyen") ||
      rList.includes("an_sinh") ||
      execRole.includes("thiện nguyện") ||
      dept.includes("thiện nguyện")
    ) {
      return "BTN";
    }

    // Mặc định: HVT (Hội Viên Thường)
    return "HVT";
  };

  useEffect(() => {
    let active = true;

    const loadRoles = async () => {
      try {
        let me: any = null;
        let member: any = null;

        const token = typeof window !== "undefined" ? localStorage.getItem("vibe_token") : null;
        if (token && isTokenValid(token)) {
          try {
            me = await fetchNestApi("/users/me");
          } catch {
            // Token hợp lệ nhưng API lỗi, giải mã trực tiếp từ payload JWT
            const decoded = decodeJwt(token);
            if (decoded) {
              me = {
                id: decoded.sub || decoded.id,
                email: decoded.email,
                role: decoded.role || decoded.user_role,
                roles: decoded.roles || (decoded.role ? [decoded.role] : []),
              };
            }
          }
        } else if (token) {
          // Token không còn hợp lệ, không gọi API để tránh lỗi 401
          const decoded = decodeJwt(token);
          if (decoded) {
            me = {
              id: decoded.sub || decoded.id,
              email: decoded.email,
              role: decoded.role || decoded.user_role,
              roles: decoded.roles || (decoded.role ? [decoded.role] : []),
            };
          }
        }

        if (typeof window !== "undefined") {
          try {
            const rawMem = localStorage.getItem("vba_my_member");
            if (rawMem) {
              const parsedMem = JSON.parse(rawMem);
              // Chỉ sử dụng cached member nếu userId khớp với tài khoản hiện tại
              if (!me?.id || !parsedMem?.userId || parsedMem.userId === me.id) {
                member = parsedMem;
              }
            }
          } catch (err) {
            void err;
          }
        }

        if (!active) return;

        const roleArr: string[] = [];
        if (me?.roles && Array.isArray(me.roles)) {
          roleArr.push(...me.roles);
        }
        if (me?.role) roleArr.push(me.role);
        if (member?.executiveRole) roleArr.push(member.executiveRole);

        const computedSrs = resolveSrsRole(roleArr, me, member);
        setSrsRole(computedSrs);

        const set = new Set<AppRole>(roleArr as AppRole[]);
        if (computedSrs === "ADM") {
          set.add("platform_admin");
          set.add("admin");
        } else if (computedSrs === "BQT") {
          set.add("admin");
        }
        setRoles(Array.from(set));
      } catch {
        if (active) {
          setRoles([]);
          setSrsRole("HVT");
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadRoles();

    const handleAuthChange = () => {
      loadRoles();
    };

    window.addEventListener("vba_auth_changed", handleAuthChange);
    window.addEventListener("role-changed", handleAuthChange);
    window.addEventListener("profile-updated", handleAuthChange);
    window.addEventListener("storage", handleAuthChange);

    return () => {
      active = false;
      window.removeEventListener("vba_auth_changed", handleAuthChange);
      window.removeEventListener("role-changed", handleAuthChange);
      window.removeEventListener("profile-updated", handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
    };
  }, [user?.id, user?.role, user?.department, user?.executiveRole]);

  const setRoleOverride = (newRole: SrsRole) => {
    setSrsRole(newRole);
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("vba_crm_role_override");
      } catch {}
      window.dispatchEvent(new Event("role-changed"));
    }
  };

  const isPlatformAdmin = srsRole === "ADM";
  const isBQT = srsRole === "BQT" || isPlatformAdmin;
  const isBTK = srsRole === "BTK" || isBQT;
  const isBTT = srsRole === "BTT" || isBQT;
  const isBXT = srsRole === "BXT" || isBQT;
  const isBTV = srsRole === "BTV" || isBQT;
  const isBTN = srsRole === "BTN" || isBQT;
  const isBTC = isBQT; // backward compatibility fallback
  const isHVT = srsRole === "HVT";
  const isAdmin = isPlatformAdmin || isBQT;
  const isModerator = isAdmin || isBTK || isBTT || isBXT || isBTV || isBTN;

  // Granular RBAC Matrix per SRS Part 2.2
  const grantedPermissions = useMemo(() => {
    return new Set<Permission>(ROLE_PERMISSIONS[srsRole] || []);
  }, [srsRole]);

  const can = useCallback(
    (permission: Permission): boolean => {
      if (isPlatformAdmin) return true;
      return grantedPermissions.has(permission);
    },
    [isPlatformAdmin, grantedPermissions],
  );

  const hasPermission = can;

  const hasAnyPermission = useCallback(
    (...permissions: Permission[]): boolean => {
      if (isPlatformAdmin) return true;
      return permissions.some((p) => grantedPermissions.has(p));
    },
    [isPlatformAdmin, grantedPermissions],
  );

  const hasAllPermissions = useCallback(
    (...permissions: Permission[]): boolean => {
      if (isPlatformAdmin) return true;
      return permissions.every((p) => grantedPermissions.has(p));
    },
    [isPlatformAdmin, grantedPermissions],
  );

  const hasRole = useCallback(
    (role: SrsRole): boolean => {
      if (isPlatformAdmin) return true;
      return srsRole === role;
    },
    [isPlatformAdmin, srsRole],
  );

  // Granular shortcut flags for 6 Ban
  const canManageMembers = can(PERMISSIONS.MEMBER_EDIT) || isBQT || isBTK || isBTV;
  const canApproveMembers = can(PERMISSIONS.MEMBER_APPROVE) || isBQT || isBTK || isBTV;
  const canRenewMembers = can(PERMISSIONS.MEMBER_RENEW) || isBQT || isBTK || isBTV;
  const canManageFinance = can(PERMISSIONS.FINANCE_MANAGE) || isBQT;
  const canManageMedia = can(PERMISSIONS.MEDIA_MANAGE) || isBQT || isBTT || isBTN;
  const canManageEvents = can(PERMISSIONS.EVENT_CREATE) || isBQT || isBTT || isBTK || isBTN;
  const canScanQR = can(PERMISSIONS.EVENT_CHECKIN_MANAGE) || isBQT || isBTT || isBTV || isBTK || isBTN;
  const canManageOpportunities = can(PERMISSIONS.OPPORTUNITY_MANAGE) || isBQT || isBXT;
  const canManageCharity = can(PERMISSIONS.CHARITY_MANAGE) || isBQT || isBTN;
  const canManageMeetings = can(PERMISSIONS.MEETING_MANAGE) || isBQT || isBTK;
  const canManageSystem = can(PERMISSIONS.SYSTEM_MANAGE) || isBQT;

  return {
    roles,
    srsRole,
    isPlatformAdmin,
    isAdmin,
    isModerator,
    isBQT,
    isBTK,
    isBTT,
    isBXT,
    isBTV,
    isBTN,
    isBTC,
    isHVT,
    canManageMembers,
    canApproveMembers,
    canRenewMembers,
    canManageFinance,
    canManageMedia,
    canManageEvents,
    canScanQR,
    canManageOpportunities,
    canManageCharity,
    canManageMeetings,
    canManageSystem,
    can,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    loading,
    setRoleOverride,
  };
}
