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
  isBTV: boolean;
  isBTC: boolean;
  isBTT: boolean;
  isHVT: boolean;
  canManageMembers: boolean;
  canApproveMembers: boolean;
  canRenewMembers: boolean;
  canManageFinance: boolean;
  canManageMedia: boolean;
  canManageEvents: boolean;
  canScanQR: boolean;
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


    const execRole = String(member?.executiveRole || user?.executiveRole || "").toLowerCase();
    const dept = String(member?.department || user?.department || "").toLowerCase();

    // ADM (Super Admin / Platform Admin)
    if (
      rList.includes("platform_admin") ||
      rList.includes("superadmin") ||
      primaryRole === "platform_admin" ||
      primaryRole === "superadmin"
    ) {
      return "ADM";
    }

    // BQT (Ban Quản Trị / Ban Chấp Hành / Chủ Tịch / Tổng Thư Ký)
    if (
      rList.includes("admin") ||
      rList.includes("bqt") ||
      rList.includes("board_director") ||
      rList.includes("tong_thu_ky") ||
      primaryRole === "admin" ||
      primaryRole === "association_admin" ||
      execRole.includes("quản trị") ||
      execRole.includes("chủ tịch") ||
      execRole.includes("tổng thư ký") ||
      execRole.includes("president") ||
      dept.includes("quản trị") ||
      dept.includes("thường trực")
    ) {
      return "BQT";
    }

    // BTV (Ban Thành Viên)
    if (
      rList.includes("btv") ||
      rList.includes("truong_ban_thanh_vien") ||
      rList.includes("ban_thanh_vien") ||
      execRole.includes("thành viên") ||
      dept.includes("thành viên")
    ) {
      return "BTV";
    }

    // BTC (Ban Tài Chính)
    if (
      rList.includes("btc") ||
      rList.includes("truong_ban_tai_chinh") ||
      rList.includes("ban_tai_chinh") ||
      execRole.includes("tài chính") ||
      dept.includes("tài chính")
    ) {
      return "BTC";
    }

    // BTT (Ban Truyền Thông)
    if (
      rList.includes("btt") ||
      rList.includes("truong_ban_truyen_thong") ||
      rList.includes("ban_truyen_thong") ||
      execRole.includes("truyền thông") ||
      dept.includes("truyền thông")
    ) {
      return "BTT";
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
  const isBTV = srsRole === "BTV" || isBQT;
  const isBTC = srsRole === "BTC" || isBQT;
  const isBTT = srsRole === "BTT" || isBQT;
  const isHVT = srsRole === "HVT";
  const isAdmin = isPlatformAdmin || isBQT;
  const isModerator = isAdmin || isBTV || isBTC || isBTT;

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

  // Backward-compatible shortcut flags
  const canManageMembers = can(PERMISSIONS.MEMBER_EDIT) || isBQT || srsRole === "BTV";
  const canApproveMembers = can(PERMISSIONS.MEMBER_APPROVE) || isBQT;
  const canRenewMembers = can(PERMISSIONS.MEMBER_RENEW) || isBQT || srsRole === "BTV";
  const canManageFinance = can(PERMISSIONS.FINANCE_MANAGE) || isBQT || srsRole === "BTC";
  const canManageMedia = can(PERMISSIONS.MEDIA_MANAGE) || isBQT || srsRole === "BTT";
  const canManageEvents = can(PERMISSIONS.EVENT_CREATE) || isBQT || srsRole === "BTT";
  const canScanQR = can(PERMISSIONS.EVENT_CHECKIN_MANAGE) || isBQT || srsRole === "BTT";
  const canManageSystem = can(PERMISSIONS.SYSTEM_MANAGE) || isBQT;

  return {
    roles,
    srsRole,
    isPlatformAdmin,
    isAdmin,
    isModerator,
    isBQT,
    isBTV,
    isBTC,
    isBTT,
    isHVT,
    canManageMembers,
    canApproveMembers,
    canRenewMembers,
    canManageFinance,
    canManageMedia,
    canManageEvents,
    canScanQR,
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
