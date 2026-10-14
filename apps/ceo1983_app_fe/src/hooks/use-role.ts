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
  isPresident: boolean;
  isChuTich: boolean;
  isPlatformAdmin: boolean;
  isAdmin: boolean;
  /** CHỈ Quản trị / Admin / Chủ tịch (vai trò hệ thống CRM) — dùng cho Phân quyền & quản lý Tin tức. */
  isSuperAdmin: boolean;
  isBanDieuHanh: boolean;
  isModerator: boolean;
  isBQT: boolean;
  isBTK: boolean;
  isBTT: boolean;
  isBXT: boolean;
  isBTV: boolean;
  isBTN: boolean;
  isBTC: boolean;
  isHVT: boolean;
  isTruongBanTruyenThong: boolean;
  isTruongBanThanhVien: boolean;
  isTruongBanXucTien: boolean;
  isTruongBanTaiChinh: boolean;
  isTruongBanThienNguyen: boolean;
  isTongThuKy: boolean;
  isGeneralSecretary: boolean;
  isBanThuKy: boolean;
  isTruongBan: boolean;
  isDepartmentLeader: boolean;
  userDepartment: string;
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
  can: (permission: Permission | string) => boolean;
  hasPermission: (permission: Permission | string) => boolean;
  hasAnyPermission: (...permissions: (Permission | string)[]) => boolean;
  hasAllPermissions: (...permissions: (Permission | string)[]) => boolean;
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

    // 1. CHỦ TỊCH (Cấp cao nhất của Hiệp hội)
    if (
      user?.isPresident ||
      primaryRole === "chu_tich" ||
      primaryRole === "president" ||
      rList.includes("chu_tich") ||
      rList.includes("president") ||
      (execRole.includes("chủ tịch") && !execRole.includes("phó")) ||
      (execRole.includes("president") && !execRole.includes("vice")) ||
      userEmail.includes("chutich")
    ) {
      return "chu_tich";
    }

    // 2. ADMIN / QUẢN TRỊ (Quản trị viên kỹ thuật & vận hành CRM)
    if (
      userEmail === "admin@connect.vn" ||
      userEmail === "admin1@connect.vn" ||
      userEmail.startsWith("admin") ||
      primaryRole === "admin" ||
      primaryRole === "quan_tri" ||
      primaryRole === "platform_admin" ||
      primaryRole === "superadmin" ||
      rList.includes("admin") ||
      rList.includes("platform_admin") ||
      rList.includes("quan_tri") ||
      rList.includes("superadmin")
    ) {
      return "admin";
    }

    // 3. BAN ĐIỀU HÀNH (Thay thế Ban Quản Trị cũ, cấp điều hành hiệp hội)
    if (
      primaryRole === "ban_dieu_hanh" ||
      execRole === "ban_dieu_hanh" ||
      execRole === "bqt" ||
      execRole === "pho_chu_tich" ||
      execRole === "vice_president" ||
      execRole.includes("phó chủ tịch") ||
      execRole.includes("điều hành") ||
      dept.includes("điều hành") ||
      dept.includes("quản trị") ||
      rList.includes("ban_dieu_hanh") ||
      rList.includes("bqt")
    ) {
      return "ban_dieu_hanh";
    }

    // 4. Trưởng Ban Truyền Thông (BTT / truong_ban_truyen_thong)
    if (
      rList.includes("truong_ban_truyen_thong") ||
      rList.includes("btt") ||
      primaryRole === "truong_ban_truyen_thong" ||
      execRole === "truong_ban_truyen_thong" ||
      userEmail.includes("truyenthong") ||
      (execRole.includes("trưởng ban") && dept.includes("truyền thông")) ||
      (execRole.includes("truyền thông") && !execRole.includes("thành viên"))
    ) {
      return "truong_ban_truyen_thong";
    }

    // 5. Trưởng Ban Thành Viên (BTV / truong_ban_thanh_vien)
    if (
      rList.includes("truong_ban_thanh_vien") ||
      rList.includes("btv") ||
      rList.includes("ban_thanh_vien") ||
      rList.includes("phat_trien_hoi_vien") ||
      primaryRole === "truong_ban_thanh_vien" ||
      execRole === "truong_ban_thanh_vien" ||
      userEmail.includes("thanhvien") ||
      (execRole.includes("trưởng ban") && dept.includes("thành viên")) ||
      (dept.includes("thành viên") && !dept.includes("hội viên") && !dept.includes("ceo 1983")) ||
      execRole.includes("ban thành viên")
    ) {
      return "truong_ban_thanh_vien";
    }

    // 6. Trưởng Ban Xúc Tiến Thương Mại (BXT / truong_ban_xuc_tien)
    if (
      rList.includes("truong_ban_xuc_tien") ||
      rList.includes("bxt") ||
      rList.includes("xuc_tien") ||
      rList.includes("thuong_mai") ||
      primaryRole === "truong_ban_xuc_tien" ||
      execRole === "truong_ban_xuc_tien" ||
      userEmail.includes("xuctien") ||
      (execRole.includes("trưởng ban") && dept.includes("xúc tiến")) ||
      execRole.includes("xúc tiến")
    ) {
      return "truong_ban_xuc_tien";
    }

    // 7. Trưởng Ban Tài Chính (BTC / truong_ban_tai_chinh)
    if (
      rList.includes("truong_ban_tai_chinh") ||
      rList.includes("btc") ||
      rList.includes("tai_chinh") ||
      primaryRole === "truong_ban_tai_chinh" ||
      execRole === "truong_ban_tai_chinh" ||
      userEmail.includes("taichinh") ||
      (execRole.includes("trưởng ban") && dept.includes("tài chính")) ||
      execRole.includes("tài chính")
    ) {
      return "truong_ban_tai_chinh";
    }

    // 8. Trưởng Ban Thiện Nguyện (BTN / truong_ban_thien_nguyen)
    if (
      rList.includes("truong_ban_thien_nguyen") ||
      rList.includes("btn") ||
      rList.includes("thien_nguyen") ||
      rList.includes("an_sinh") ||
      primaryRole === "truong_ban_thien_nguyen" ||
      execRole === "truong_ban_thien_nguyen" ||
      userEmail.includes("thiennguyen") ||
      (execRole.includes("trưởng ban") && dept.includes("thiện nguyện")) ||
      execRole.includes("thiện nguyện")
    ) {
      return "truong_ban_thien_nguyen";
    }

    // 9. Tổng Thư Ký (tong_thu_ky)
    if (
      rList.includes("tong_thu_ky") ||
      primaryRole === "tong_thu_ky" ||
      execRole === "tong_thu_ky" ||
      userEmail.includes("tongthuky") ||
      execRole.includes("tổng thư ký")
    ) {
      return "tong_thu_ky";
    }

    // 10. Ban Thư Ký (BTK / ban_thu_ky)
    if (
      rList.includes("ban_thu_ky") ||
      rList.includes("btk") ||
      rList.includes("thu_ky") ||
      primaryRole === "ban_thu_ky" ||
      execRole === "ban_thu_ky" ||
      userEmail.includes("thuky") ||
      execRole.includes("thư ký") ||
      dept.includes("thư ký")
    ) {
      return "ban_thu_ky";
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

  const isPresident =
    srsRole === "chu_tich" ||
    Boolean(user?.isPresident) ||
    user?.role === "chu_tich" ||
    user?.role === "president" ||
    (String(user?.executiveRole).toLowerCase().includes("chủ tịch") &&
      !String(user?.executiveRole).toLowerCase().includes("phó"));
  const isChuTich = isPresident;
  const isPlatformAdmin =
    srsRole === "ADM" ||
    srsRole === "quan_tri" ||
    (srsRole as string) === "platform_admin" ||
    roles.includes("platform_admin") ||
    isPresident;
  const isBanDieuHanh =
    srsRole === "ban_dieu_hanh" ||
    srsRole === "BQT" ||
    srsRole === "admin" ||
    Boolean(user?.isExecutive) ||
    Boolean(user?.isAdmin) ||
    isPresident ||
    isPlatformAdmin;
  const isBQT = isBanDieuHanh;
  const isAdmin =
    (isPresident ||
      isPlatformAdmin ||
      srsRole === "admin" ||
      isBanDieuHanh ||
      Boolean(user?.isAdmin) ||
      roles.includes("admin")) &&
    (!memberPermProfile || memberPermProfile.isAdmin !== false || isPlatformAdmin || isPresident);
  const isTongThuKy = srsRole === "tong_thu_ky" || Boolean(user?.isGeneralSecretary) || isPresident || isAdmin;
  const permBoardRole = String((memberPermProfile as any)?.boardRole || "").toLowerCase();
  const isSuperAdmin =
    srsRole === "chu_tich" ||
    srsRole === "admin" ||
    (srsRole as string) === "quan_tri" ||
    (srsRole as string) === "ADM" ||
    (srsRole as string) === "platform_admin" ||
    Boolean(user?.isPresident) ||
    Boolean(user?.isAdmin) ||
    roles.includes("admin") ||
    roles.includes("platform_admin") ||
    roles.includes("quan_tri") ||
    roles.includes("chu_tich") ||
    permBoardRole === "quan_tri" ||
    permBoardRole === "admin" ||
    permBoardRole === "chu_tich" ||
    (memberPermProfile as any)?.isAdmin === true;
  const isBanThuKy = srsRole === "ban_thu_ky" || srsRole === "BTK" || isTongThuKy;
  const isBTK = isBanThuKy;
  const isBTT = srsRole === "BTT" || srsRole === "truong_ban_truyen_thong" || isBQT;
  const isBXT = srsRole === "BXT" || srsRole === "truong_ban_xuc_tien" || isBQT;
  const isBTV = srsRole === "BTV" || srsRole === "truong_ban_thanh_vien" || isBQT;
  const isBTN = srsRole === "BTN" || srsRole === "truong_ban_thien_nguyen" || isBQT;
  const isBTC = srsRole === "BTC" || srsRole === "truong_ban_tai_chinh" || isBQT;
  const isHVT = srsRole === "HVT" || srsRole === "member";
  const isTruongBanTruyenThong = isBTT;
  const isTruongBanThanhVien = isBTV;
  const isTruongBanXucTien = isBXT;
  const isTruongBanTaiChinh = isBTC;
  const isTruongBanThienNguyen = isBTN;
  const isTruongBan =
    Boolean(user?.isDepartmentLeader) ||
    isTruongBanTruyenThong ||
    isTruongBanThanhVien ||
    isTruongBanXucTien ||
    isTruongBanTaiChinh ||
    isTruongBanThienNguyen;
  const isModerator = isAdmin || isTruongBan || isBTK;

  // Granular RBAC Matrix per SRS Part 2.2
  const grantedPermissions = useMemo(() => {
    return new Set<Permission>(ROLE_PERMISSIONS[srsRole] || []);
  }, [srsRole]);

  const can = useCallback(
    (permission: Permission | string): boolean => {
      // 1. Kiểm tra trực tiếp phân quyền từng hội viên từ vba_member_permissions:
      // Nếu Admin đã bỏ chọn (false), lập tức thu hồi quyền và ẩn chức năng trên giao diện
      if (memberPermProfile) {
        if (memberPermProfile.canView === false && (permission.includes(":view") || permission.endsWith("_VIEW") || permission.endsWith(":read"))) {
          return false;
        }
        if (memberPermProfile.canAdd === false && (permission.includes(":create") || permission.includes(":add") || permission.endsWith("_ADD"))) {
          return false;
        }
        if (memberPermProfile.canEdit === false && (permission.includes(":edit") || permission.includes(":update") || permission.endsWith("_EDIT"))) {
          return false;
        }
        if (memberPermProfile.canDelete === false && (permission.includes(":delete") || permission.endsWith("_DELETE"))) {
          return false;
        }
        if (memberPermProfile.canApprove === false && (permission.includes(":approve") || permission.endsWith("_APPROVE"))) {
          return false;
        }
        if (memberPermProfile.canExport === false && (permission.includes(":export") || permission.endsWith("_EXPORT"))) {
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
        if (memberPermProfile.deniedCodes && Array.isArray(memberPermProfile.deniedCodes)) {
          const denied = memberPermProfile.deniedCodes.map((c: string) => c.toUpperCase());
          if (denied.includes(permission.toUpperCase())) return false;
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
      if (allowedByMatrix === false) {
        return false;
      }

      if (isPlatformAdmin) return true;

      // Nếu là mã ma trận trực tiếp (VD: "MEM_EXPORT", "FEE_EDIT",...) hoặc ma trận đã cấp phép rõ ràng
      if (typeof permission === "string" && !permission.includes(":")) {
        return allowedByMatrix;
      }

      if (allowedByMatrix === true) {
        return true;
      }

      return grantedPermissions.has(permission as Permission);
    },
    [isPlatformAdmin, srsRole, grantedPermissions, matrixVersion, memberPermProfile, user?.code],
  );

  const hasPermission = can;

  const hasAnyPermission = useCallback(
    (...permissions: (Permission | string)[]): boolean => {
      return permissions.some((p) => can(p));
    },
    [can],
  );

  const hasAllPermissions = useCallback(
    (...permissions: (Permission | string)[]): boolean => {
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
    isPresident,
    isChuTich,
    isPlatformAdmin,
    isAdmin,
    isSuperAdmin,
    isBanDieuHanh,
    isModerator,
    isBQT,
    isBTK,
    isBTT,
    isBXT,
    isBTV,
    isBTN,
    isBTC,
    isHVT,
    isTruongBanTruyenThong,
    isTruongBanThanhVien,
    isTruongBanXucTien,
    isTruongBanTaiChinh,
    isTruongBanThienNguyen,
    isTongThuKy,
    isGeneralSecretary: isTongThuKy,
    isBanThuKy,
    isTruongBan,
    isDepartmentLeader: isTruongBan,
    userDepartment: user?.department || '',
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
