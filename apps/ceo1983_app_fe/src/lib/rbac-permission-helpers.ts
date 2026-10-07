/**
 * RBAC Permission Helper for Web CRM CEO 1983
 * Ma trận phân quyền 5 vai trò cốt lõi: Quản trị, Admin, Tổng thư ký, Trưởng ban, Thành viên
 */

export const RBAC_MATRIX_STORAGE_KEY = "ceo1983_rbac_tree_matrix_v5_5roles";

export type SystemRoleKey = "quan_tri" | "admin" | "tong_thu_ky" | "truong_ban" | "member";

export interface SystemRoleDef {
  key: SystemRoleKey;
  name: string;
  shortName: string;
  color: string;
  desc: string;
}

export const SYSTEM_5_ROLES: SystemRoleDef[] = [
  {
    key: "quan_tri",
    name: "Quản trị",
    shortName: "Quản trị",
    color: "text-indigo-700 bg-indigo-50 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800",
    desc: "Toàn quyền hệ thống & phân quyền cao nhất",
  },
  {
    key: "admin",
    name: "Admin",
    shortName: "Admin",
    color: "text-purple-700 bg-purple-50 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800",
    desc: "Quản trị viên vận hành nghiệp vụ CRM",
  },
  {
    key: "tong_thu_ky",
    name: "Tổng thư ký",
    shortName: "Tổng thư ký",
    color: "text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800",
    desc: "Điều phối thư ký, sự kiện, cuộc họp & công văn",
  },
  {
    key: "truong_ban",
    name: "Trưởng ban",
    shortName: "Trưởng ban",
    color: "text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800",
    desc: "Lãnh đạo ban chuyên môn, khởi tạo & duyệt đề xuất ban",
  },
  {
    key: "member",
    name: "Thành viên",
    shortName: "Thành viên",
    color: "text-slate-700 bg-slate-50 border-slate-200 dark:bg-slate-900/50 dark:text-slate-300 dark:border-slate-800",
    desc: "Hội viên chính thức tham gia sinh hoạt & giao thương",
  },
];

export const ROLE_OPTIONS = [
  { value: "quan_tri", label: "Quản trị" },
  { value: "admin", label: "Admin" },
  { value: "tong_thu_ky", label: "Tổng thư ký" },
  { value: "truong_ban", label: "Trưởng ban" },
  { value: "member", label: "Thành viên" },
];

export const DEPARTMENT_OPTIONS = [
  "Ban Thành viên",
  "Ban xúc tiến",
  "Ban thiện nguyện",
  "Ban truyền thông",
  "Ban quản trị",
  "Ban tài chính",
  "Hội viên ceo1983",
];

export function normalizeRole(r?: string): SystemRoleKey {
  if (!r) return "member";
  const s = r.toLowerCase().trim();
  if (s === "quan_tri" || s === "platform_admin" || s === "superadmin" || s.includes("hệ thống") || s === "quản trị") return "quan_tri";
  if (s === "admin" || s === "adm" || s.includes("chủ tịch") || s === "bqt") return "admin";
  if (s.includes("tổng thư ký") || s.includes("tong_thu_ky") || s === "ttk" || s.includes("thu_ky") || s.includes("thư ký")) return "tong_thu_ky";
  if (s.startsWith("trưởng ban") || s.startsWith("truong_ban") || s.startsWith("phó ban") || s.startsWith("pho_ban") || s === "truong_ban" || s.includes("trưởng ban")) return "truong_ban";
  return "member";
}

export function normalizeDept(d?: string): string {
  if (!d) return "Hội viên ceo1983";
  const s = d.toLowerCase().trim();
  if (s.includes("tài chính") || s.includes("kế toán") || s.includes("ngân quỹ")) return "Ban tài chính";
  if (s.includes("thành viên") && !s.includes("hội viên") && !s.includes("ceo")) return "Ban Thành viên";
  if (s.includes("xúc tiến") || s.includes("thương mại") || s.includes("b2b")) return "Ban xúc tiến";
  if (s.includes("thiện nguyện") || s.includes("tấm lòng") || s.includes("an sinh")) return "Ban thiện nguyện";
  if (s.includes("truyền thông") || s.includes("marketing") || s.includes("báo chí")) return "Ban truyền thông";
  if (s.includes("quản trị") || s.includes("điều hành") || s.includes("thường trực") || s.includes("bqt")) return "Ban quản trị";
  return "Hội viên ceo1983";
}

export function handleUnauthorizedAction(featureName?: string, actionName?: string, redirectTarget?: string) {
  const feat = featureName ? `chức năng "${featureName}"` : "chức năng này";
  const act = actionName ? `thao tác "${actionName}"` : "thao tác này";
  const message = `Tài khoản của bạn đã bị thay đổi quyền không còn quyền sử dụng ${feat}, không còn quyền ${act}.`;

  if (typeof window !== "undefined") {
    import("sonner").then(({ toast }) => {
      toast.error(message, { duration: 6000 });
    });

    localStorage.removeItem("vibe_token");
    localStorage.removeItem("vibe_refresh_token");
    localStorage.removeItem("access_token");
    localStorage.removeItem("token");
    document.cookie = `sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    document.cookie = `sb-refresh-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;

    const isAssociationApp = window.location.pathname.startsWith("/association") || window.location.pathname.startsWith("/m");
    const target = redirectTarget || (isAssociationApp ? "/association/login" : "/auth");

    setTimeout(() => {
      window.location.href = `${target}?reason=permission_revoked`;
    }, 1200);
  }
}

/**
 * Chuẩn hóa quyền cho 5 vai trò hệ thống dựa trên hành động
 */
export function normalizeActionRoles(action: {
  id?: string;
  code?: string;
  name?: string;
  roles?: Record<string, boolean>;
}): Record<string, boolean> {
  const current = action.roles || {};
  const code = (action.code || "").toUpperCase();
  const id = (action.id || "").toLowerCase();

  const isView = code.endsWith("_VIEW") || id.includes("_view");
  const isPublicMemberAction =
    isView ||
    code === "NET_CONNECT" ||
    code === "BCM_ADD" ||
    code === "BCM_VIEW" ||
    code === "MKT_ADD" ||
    code === "OPP_ADD" ||
    code === "TSK_ADD";

  const isFinance =
    code.startsWith("FEE_") ||
    code.startsWith("INC_") ||
    code.startsWith("EXP_") ||
    code.startsWith("FRP_");

  const isSecretary =
    code.startsWith("MEET_") ||
    code.startsWith("VOTE_") ||
    code.startsWith("DOC_") ||
    code.startsWith("EVT_") ||
    code.startsWith("EREG_") ||
    code.startsWith("CHK_") ||
    code.startsWith("NWS_") ||
    Boolean(current.thu_ky);

  const isLeader =
    Boolean(current.thanh_vien) ||
    Boolean(current.xuc_tien) ||
    Boolean(current.truyen_thong) ||
    Boolean(current.thien_nguyen) ||
    code.startsWith("EVT_") ||
    code.startsWith("MEET_") ||
    code.startsWith("SPN_") ||
    code.startsWith("NWS_") ||
    code.startsWith("MKT_") ||
    code.startsWith("OPP_") ||
    code.startsWith("TSK_");

  return {
    ...current,
    quan_tri: current.quan_tri ?? true,
    admin: current.admin ?? true,
    tong_thu_ky: current.tong_thu_ky ?? (isSecretary ? true : false),
    truong_ban: current.truong_ban ?? (isFinance ? false : isLeader ? true : false),
    member: current.member ?? (isPublicMemberAction && !isFinance ? true : false),
  };
}

/**
 * Kiểm tra 1 route có được phép hiển thị trên Sidebar/CRM theo vai trò người dùng hay không
 */
export function isRouteAllowedByMatrix(route: string, roleKey: SystemRoleKey): boolean {
  // Quản trị (Super Admin) luôn có toàn quyền xem tất cả chức năng
  if (roleKey === "quan_tri") return true;

  if (typeof window === "undefined") return true;

  try {
    const raw = localStorage.getItem(RBAC_MATRIX_STORAGE_KEY);
    if (!raw) return true; // Chưa tùy biến thì áp dụng quyền mặc định

    const categories = JSON.parse(raw);
    if (!Array.isArray(categories)) return true;

    for (const cat of categories) {
      if (!cat?.features || !Array.isArray(cat.features)) continue;
      for (const feat of cat.features) {
        if (!feat?.route) continue;

        // So khớp route chính xác hoặc tiền tố
        if (feat.route === route || (route !== "/" && feat.route.startsWith(route))) {
          if (!feat.actions || !Array.isArray(feat.actions) || feat.actions.length === 0) {
            return true;
          }
          // Ưu tiên kiểm tra quyền VIEW của chức năng đó
          const viewAction = feat.actions.find(
            (a: any) =>
              (a.code && a.code.toUpperCase().endsWith("_VIEW")) ||
              (a.id && a.id.toLowerCase().includes("_view"))
          );
          if (viewAction && viewAction.roles) {
            return Boolean(viewAction.roles[roleKey]);
          }
          // Nếu không có action view riêng, cho phép nếu có ít nhất 1 quyền được bật
          return feat.actions.some((a: any) => Boolean(a?.roles?.[roleKey]));
        }
      }
    }
  } catch {
    return true;
  }

  return true;
}

const PERMISSION_TO_MATRIX_CODES: Record<string, string[]> = {
  "event:view": ["EVT_VIEW", "act_evt_view"],
  "event:create": ["EVT_ADD", "act_evt_add"],
  "event:edit": ["EVT_EDIT", "act_evt_edit"],
  "event:delete": ["EVT_DELETE", "act_evt_delete"],
  "event:cancel": ["EVT_CANCEL", "act_evt_cancel"],
  "event:checkin_manage": ["CHK_SCAN", "CHK_VIEW", "act_chk_scan", "CHKQ_VIEW"],
  "sponsor:view": ["SPN_VIEW", "act_spn_view", "SPK_VIEW"],
  "sponsor:create": ["SPN_ADD", "act_spn_add"],
  "sponsor:edit": ["SPN_EDIT", "act_spn_edit"],
  "sponsor:delete": ["SPN_DELETE", "act_spn_delete"],
  "sponsor:package_manage": ["SPK_ADD", "SPK_EDIT", "SPK_DELETE"],
  "sponsor:assign_event": ["SPN_APPROVE"],
  "member:view": ["MEM_VIEW", "act_mem_view", "COM_VIEW"],
  "member:create": ["MEM_ADD", "act_mem_add", "COM_ADD"],
  "member:edit": ["MEM_EDIT", "act_mem_edit", "COM_EDIT"],
  "member:delete": ["MEM_DELETE", "act_mem_delete", "COM_DELETE"],
  "member:approve": ["MEM_APPROVE", "act_mem_approve", "COM_APPROVE"],
  "member:renew": ["FEE_ADD", "MEM_EDIT"],
  "opportunity:view": ["OPP_VIEW", "MKT_VIEW", "BCM_VIEW"],
  "opportunity:manage": ["OPP_ADD", "OPP_EDIT", "OPP_DELETE", "OPP_APPROVE", "MKT_ADD", "MKT_EDIT", "BCM_ADD"],
  "marketplace:manage": ["MKT_ADD", "MKT_EDIT", "MKT_DELETE"],
  "charity:view": ["CHA_VIEW"],
  "charity:manage": ["CHA_ADD", "CHA_EDIT", "CHA_DELETE", "CHA_APPROVE"],
  "meeting:view": ["MEET_VIEW", "BCM_VIEW"],
  "meeting:manage": ["MEET_ADD", "MEET_EDIT", "MEET_DELETE", "MEET_APPROVE", "BCM_ADD", "BCM_EDIT", "BCM_DELETE"],
  "document:manage": ["DOC_VIEW", "DOC_ADD", "DOC_EDIT", "DOC_DELETE"],
  "finance:view": ["FEE_VIEW", "INC_VIEW", "EXP_VIEW", "FRP_VIEW"],
  "finance:manage": ["FEE_ADD", "FEE_EDIT", "FEE_DELETE", "INC_ADD", "INC_EDIT", "EXP_ADD", "EXP_EDIT"],
  "finance:approve": ["EXP_APPROVE", "FEE_RECONCILE"],
  "media:view": ["NTF_VIEW", "EML_VIEW", "NWS_VIEW"],
  "media:manage": ["NTF_SEND", "NTF_EDIT", "EML_ADD", "EML_SEND", "NWS_ADD", "NWS_EDIT"],
  "system:manage": ["PRM_EDIT", "SET_EDIT", "CRD_ADD", "CRD_EDIT", "CRD_DELETE"],
  "system:audit_view": ["ACT_VIEW", "ACT_EXPORT"],
};

/**
 * Kiểm tra xem một hành động / Permission có được cấp phép theo Ma Trận Phân Quyền (lưu trong CSDL / localStorage) hay không
 * Nếu người quản trị đã BỎ TÍCH trong ma trận và lưu, hàm này trả về FALSE để ẩn ngay các nút/thao tác trên giao diện.
 */
export function isActionAllowedByMatrix(actionOrPerm: string, roleKey: string): boolean {
  // Quản trị viên cấp cao (Super Admin) luôn có toàn quyền thao tác
  if (roleKey === "quan_tri" || roleKey === "ADM" || roleKey === "platform_admin") {
    return true;
  }

  if (typeof window === "undefined") return true;

  try {
    const raw = localStorage.getItem(RBAC_MATRIX_STORAGE_KEY);
    if (!raw) return true; // Chưa tùy biến thì giữ quyền mặc định

    const categories = JSON.parse(raw);
    if (!Array.isArray(categories)) return true;

    // Chuẩn hóa roleKey sang key trong ma trận
    let targetRole = roleKey.toLowerCase();
    if (targetRole === "bqt") targetRole = "admin";
    else if (targetRole === "btk") targetRole = "tong_thu_ky";
    else if (targetRole === "btv" || targetRole === "btt" || targetRole === "bxt" || targetRole === "btn") {
      targetRole = "truong_ban";
    } else if (targetRole === "hvt") {
      targetRole = "member";
    }

    // Lấy danh sách các mã thao tác tương ứng
    const codesToCheck = PERMISSION_TO_MATRIX_CODES[actionOrPerm] || [actionOrPerm.toUpperCase(), actionOrPerm.toLowerCase()];

    for (const cat of categories) {
      if (!cat?.features || !Array.isArray(cat.features)) continue;
      for (const feat of cat.features) {
        if (!feat?.actions || !Array.isArray(feat.actions)) continue;
        for (const act of feat.actions) {
          const actCode = (act.code || "").toUpperCase();
          const actId = (act.id || "").toLowerCase();

          const isMatch = codesToCheck.some(
            (c) => c.toUpperCase() === actCode || c.toLowerCase() === actId
          );

          if (isMatch && act.roles) {
            // Kiểm tra theo 5 system roles hoặc 6 ban roles
            if (act.roles[targetRole] !== undefined) {
              if (act.roles[targetRole] === false) return false;
            }
            if (act.roles[roleKey.toLowerCase()] !== undefined) {
              if (act.roles[roleKey.toLowerCase()] === false) return false;
            }
          }
        }
      }
    }
  } catch {
    return true;
  }

  return true;
}

