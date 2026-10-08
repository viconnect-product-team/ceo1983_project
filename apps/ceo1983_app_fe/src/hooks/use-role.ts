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
import { isActionAllowedByMatrix } from "@/lib/rbac-permission-helpers";

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

let cachedMeData: any = null;
let cachedMeTimestamp = 0;
let inFlightMePromise: Promise<any> | null = null;

async function getOrFetchMe(): Promise<any> {
  const now = Date.now();
  if (cachedMeData && now - cachedMeTimestamp < 15000) {
    return cachedMeData;
  }
  if (inFlightMePromise) {
    return inFlightMePromise;
  }
  inFlightMePromise = fetchNestApi("/users/me")
    .then((res) => {
      cachedMeData = res;
      cachedMeTimestamp = Date.now();
      return res;
    })
    .finally(() => {
      inFlightMePromise = null;
    });
  return inFlightMePromise;
}

export function clearMeCache() {
  cachedMeData = null;
  cachedMeTimestamp = 0;
  inFlightMePromise = null;
}

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

    const userEmail = String(userObj?.email || member?.email || user?.email || "").toLowerCase();

    // ADM (Super Admin / Platform Admin / Quản Trị)
    if (
      rList.includes("platform_admin") ||
      rList.includes("superadmin") ||
      rList.includes("quan_tri") ||
      rList.includes("quantri") ||
      primaryRole === "platform_admin" ||
      primaryRole === "superadmin" ||
      primaryRole === "quan_tri" ||
      primaryRole === "quantri" ||
      userEmail === "admin@connect.vn" ||
      userEmail === "admin1@connect.vn"
    ) {
      return "ADM";
    }

    // 1. BTV (Ban Thành Viên) - Ban Thành Viên kiểm duyệt và thẩm định kết nạp hội viên
    if (
      rList.includes("btv") ||
      rList.includes("ban_thanh_vien") ||
      rList.includes("phat_trien_hoi_vien") ||
      userEmail.includes("thanhvien") ||
      (dept.includes("thành viên") && !dept.includes("hội viên") && !dept.includes("ceo 1983")) ||
      execRole.includes("ban thành viên") ||
      execRole.includes("thành viên")
    ) {
      return "BTV";
    }

    // 2. BTK (Ban Thư Ký - Điều phối họp & văn bản số)
    if (
      rList.includes("btk") ||
      rList.includes("tong_thu_ky") ||
      rList.includes("thu_ky") ||
      userEmail.includes("tongthuky") ||
      userEmail.includes("thuky") ||
      execRole.includes("thư ký") ||
      dept.includes("thư ký")
    ) {
      return "BTK";
    }

    // 3. BTT (Ban Truyền Thông & Sự Kiện)
    if (
      rList.includes("btt") ||
      rList.includes("truyen_thong") ||
      userEmail.includes("truyenthong") ||
      execRole.includes("truyền thông") ||
      dept.includes("truyền thông")
    ) {
      return "BTT";
    }

    // 4. BXT (Ban Xúc Tiến Thương Mại & Cơ Hội B2B)
    if (
      rList.includes("bxt") ||
      rList.includes("xuc_tien") ||
      rList.includes("thuong_mai") ||
      userEmail.includes("xuctien") ||
      execRole.includes("xúc tiến") ||
      dept.includes("xúc tiến")
    ) {
      return "BXT";
    }

    // 5. BTN (Ban Thiện Nguyện & An Sinh Xã Hội)
    if (
      rList.includes("btn") ||
      rList.includes("thien_nguyen") ||
      rList.includes("an_sinh") ||
      userEmail.includes("thiennguyen") ||
      execRole.includes("thiện nguyện") ||
      dept.includes("thiện nguyện")
    ) {
      return "BTN";
    }

    // 6. BQT (Ban Quản Trị / Ban Thường Trực / Chủ Tịch / Phó Chủ Tịch / Admin)
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
            me = await getOrFetchMe();
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
      clearMeCache();
      loadRoles();
      setMatrixVersion((v) => v + 1);
    };

    window.addEventListener("vba_auth_changed", handleAuthChange);
    window.addEventListener("role-changed", handleAuthChange);
    window.addEventListener("crm_permissions_updated", handleAuthChange);
    window.addEventListener("vba_member_permissions_updated", handleAuthChange);
    window.addEventListener("profile-updated", handleAuthChange);
    window.addEventListener("storage", handleAuthChange);

    return () => {
      active = false;
      window.removeEventListener("vba_auth_changed", handleAuthChange);
      window.removeEventListener("role-changed", handleAuthChange);
      window.removeEventListener("crm_permissions_updated", handleAuthChange);
      window.removeEventListener("vba_member_permissions_updated", handleAuthChange);
      window.removeEventListener("profile-updated", handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
    };
  }, [user?.id, user?.role, user?.department, user?.executiveRole]);

  const [matrixVersion, setMatrixVersion] = useState(0);

  // Check member-level permission profile saved by admin in vba_member_permissions
  const memberPermProfile = useMemo(() => {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem("vba_member_permissions");
      if (!raw) return null;
      const map = JSON.parse(raw);
      if (!map || typeof map !== "object") return null;

      let mCode = user?.code || (user as any)?.memberCode;
      if (!mCode) {
        const rawMem = localStorage.getItem("vba_my_member");
        if (rawMem) {
          const m = JSON.parse(rawMem);
          mCode = m?.code;
        }
      }
      if (mCode) {
        const found = map[mCode] || map[mCode.toLowerCase()] || map[mCode.toUpperCase()];
        if (found) return found;
        for (const k in map) {
          if (k.toLowerCase() === mCode.toLowerCase()) return map[k];
        }
      }
    } catch {}
    return null;
  }, [user?.code, matrixVersion]);

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
  const isBQT =
    (srsRole === "BQT" || isPlatformAdmin) &&
    (!memberPermProfile || memberPermProfile.isAdmin !== false || isPlatformAdmin);
  const isBTK = srsRole === "BTK" || isBQT;
  const isBTT = srsRole === "BTT" || isBQT;
  const isBXT = srsRole === "BXT" || isBQT;
  const isBTV = srsRole === "BTV" || isBQT;
  const isBTN = srsRole === "BTN" || isBQT;
  const isBTC = isBQT; // backward compatibility fallback
  const isHVT = srsRole === "HVT";
  const isAdmin =
    (isPlatformAdmin || isBQT) && (!memberPermProfile || memberPermProfile.isAdmin !== false || isPlatformAdmin);
  const isModerator = isAdmin || isBTK || isBTT || isBXT || isBTV || isBTN;

  // Granular RBAC Matrix per SRS Part 2.2
  const grantedPermissions = useMemo(() => {
    return new Set<Permission>(ROLE_PERMISSIONS[srsRole] || []);
  }, [srsRole]);

  const can = useCallback(
    (permission: Permission): boolean => {
      // 1. Kiểm tra trực tiếp phân quyền từng hội viên từ vba_member_permissions:
      // Nếu Admin đã bỏ chọn (false), lập tức thu hồi quyền và ẩn chức năng trên giao diện
      if (memberPermProfile) {
        if (memberPermProfile.canAdd === false && (permission.includes(":create") || permission.includes(":add"))) {
          return false;
        }
        if (memberPermProfile.canEdit === false && (permission.includes(":edit") || permission.includes(":update"))) {
          return false;
        }
        if (memberPermProfile.canDelete === false && permission.includes(":delete")) {
          return false;
        }
        if (memberPermProfile.canApprove === false && permission.includes(":approve")) {
          return false;
        }
        if (
          permission.startsWith("event:") &&
          memberPermProfile.canManageEvents === false &&
          permission !== "event:view"
        ) {
          return false;
        }
        if (
          permission.startsWith("member:") &&
          memberPermProfile.canManageMembers === false &&
          permission !== "member:view"
        ) {
          return false;
        }
        if (
          permission.startsWith("media:") &&
          memberPermProfile.canManageNews === false &&
          permission !== "media:view"
        ) {
          return false;
        }
        if (
          (permission.startsWith("opportunity:") || permission.startsWith("marketplace:")) &&
          memberPermProfile.canManageMarketplace === false &&
          !permission.endsWith(":view")
        ) {
          return false;
        }
        if (permission.startsWith("voting:") && memberPermProfile.canManageVoting === false) {
          return false;
        }
        if (permission.startsWith("system:") && memberPermProfile.isAdmin === false) {
          return false;
        }
      }

      // 2. Kiểm tra trực tiếp Ma Trận Quyền CSDL/localStorage:
      // Nếu Admin đã BỎ TÍCH hành động này và lưu, lập tức thu hồi quyền (trả về false)
      let mCode = user?.code || (user as any)?.memberCode;
      if (!mCode) {
        try {
          const rawMem = localStorage.getItem("vba_my_member");
          if (rawMem) mCode = JSON.parse(rawMem)?.code;
        } catch {}
      }

      const dept = (user as any)?.department || (memberPermProfile as any)?.department;
      const allowedByMatrix = isActionAllowedByMatrix(permission, srsRole, dept, mCode);
      if (!allowedByMatrix) {
        return false;
      }

      if (isPlatformAdmin) return true;

      return grantedPermissions.has(permission);
    },
    [isPlatformAdmin, srsRole, grantedPermissions, matrixVersion, memberPermProfile, user?.code],
  );

  const hasPermission = can;

  const hasAnyPermission = useCallback(
    (...permissions: Permission[]): boolean => {
      return permissions.some((p) => can(p));
    },
    [can],
  );

  const hasAllPermissions = useCallback(
    (...permissions: Permission[]): boolean => {
      return permissions.every((p) => can(p));
    },
    [can],
  );

  const hasRole = useCallback(
    (role: SrsRole): boolean => {
      if (isPlatformAdmin) return true;
      return srsRole === role;
    },
    [isPlatformAdmin, srsRole],
  );

  // Granular shortcut flags: Tuân thủ chặt chẽ can() và memberPermProfile để người dùng bỏ tích là ẩn ngay
  const canManageMembers =
    can(PERMISSIONS.MEMBER_EDIT) && (!memberPermProfile || memberPermProfile.canManageMembers !== false);
  const canApproveMembers =
    can(PERMISSIONS.MEMBER_APPROVE) && (!memberPermProfile || memberPermProfile.canManageMembers !== false);
  const canRenewMembers =
    can(PERMISSIONS.MEMBER_RENEW) && (!memberPermProfile || memberPermProfile.canManageMembers !== false);
  const canManageFinance = can(PERMISSIONS.FINANCE_MANAGE);
  const canManageMedia =
    can(PERMISSIONS.MEDIA_MANAGE) && (!memberPermProfile || memberPermProfile.canManageNews !== false);
  const canManageEvents =
    can(PERMISSIONS.EVENT_CREATE) && (!memberPermProfile || memberPermProfile.canManageEvents !== false);
  const canScanQR =
    can(PERMISSIONS.EVENT_CHECKIN_MANAGE) && (!memberPermProfile || memberPermProfile.canManageEvents !== false);
  const canManageOpportunities =
    can(PERMISSIONS.OPPORTUNITY_MANAGE) && (!memberPermProfile || memberPermProfile.canManageMarketplace !== false);
  const canManageCharity = can(PERMISSIONS.CHARITY_MANAGE);
  const canManageMeetings = can(PERMISSIONS.MEETING_MANAGE);
  const canManageSystem = can(PERMISSIONS.SYSTEM_MANAGE) && isAdmin;

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
