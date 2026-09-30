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
    desc: "Toàn quyền hệ thống & phân quyền cao nhất (Super Admin)",
  },
  {
    key: "admin",
    name: "Admin",
    shortName: "Admin",
    color: "text-purple-700 bg-purple-50 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800",
    desc: "Quản trị viên vận hành nghiệp vụ CRM & Quản lý các ban",
  },
  {
    key: "tong_thu_ky",
    name: "Tổng thư ký",
    shortName: "Tổng thư ký",
    color: "text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800",
    desc: "Điều phối thư ký, sự kiện, cuộc họp, công văn & biểu quyết",
  },
  {
    key: "truong_ban",
    name: "Trưởng ban",
    shortName: "Trưởng ban",
    color: "text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800",
    desc: "Lãnh đạo các ban chuyên môn (Thành viên, Xúc tiến TM, Truyền thông, Thiện nguyện)",
  },
  {
    key: "member",
    name: "Thành viên",
    shortName: "Thành viên",
    color: "text-slate-700 bg-slate-50 border-slate-200 dark:bg-slate-900/50 dark:text-slate-300 dark:border-slate-800",
    desc: "Hội viên chính thức tham gia sinh hoạt & giao thương nội bộ",
  },
];

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
