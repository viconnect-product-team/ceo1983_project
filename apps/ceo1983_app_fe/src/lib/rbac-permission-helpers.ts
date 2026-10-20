/**
 * RBAC Permission Helper for Web CRM CEO 1983
 * Ma trận phân quyền 5 vai trò cốt lõi: Quản trị, Admin, Tổng thư ký, Trưởng ban, Thành viên
 */

export const RBAC_MATRIX_STORAGE_KEY = "ceo1983_rbac_tree_matrix_v5_5roles";

export type SystemRoleKey =
  | "quan_tri"
  | "chu_tich"
  | "admin"
  | "tong_thu_ky"
  | "truong_ban_dieu_hanh"
  | "thanh_vien_ban_dieu_hanh"
  | "truong_ban_truyen_thong"
  | "truong_ban_thanh_vien"
  | "truong_ban_xuc_tien"
  | "truong_ban_tai_chinh"
  | "truong_ban_thien_nguyen"
  | "thanh_vien_ban_su_kien"
  | "thanh_vien_ban_xuc_tien"
  | "thanh_vien_ban_thanh_vien"
  | "thanh_vien_ban_truyen_thong"
  | "thanh_vien_ban_tai_chinh"
  | "thanh_vien_ban_thien_nguyen"
  | "member";

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
    key: "chu_tich",
    name: "Chủ tịch",
    shortName: "Chủ tịch",
    color: "text-amber-800 bg-amber-100 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-700",
    desc: "Chủ tịch Hiệp hội, quyền phê duyệt tối cao toàn hệ thống",
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
    key: "truong_ban_dieu_hanh",
    name: "Trưởng ban Điều hành",
    shortName: "TB Điều Hành",
    color: "text-blue-700 bg-blue-50 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800",
    desc: "Điều hành quản lý nội bộ, quy chế & điều phối các ban",
  },
  {
    key: "thanh_vien_ban_dieu_hanh",
    name: "Thành viên Ban Điều Hành",
    shortName: "TV Ban Điều Hành",
    color: "text-blue-700 bg-blue-50 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800",
    desc: "Thành viên trực thuộc Ban Điều Hành Hiệp Hội",
  },
  {
    key: "truong_ban_truyen_thong",
    name: "Trưởng ban Truyền thông",
    shortName: "TB Truyền thông",
    color: "text-rose-700 bg-rose-50 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800",
    desc: "Quản lý truyền thông, tin tức, nội dung & thương hiệu",
  },
  {
    key: "truong_ban_thanh_vien",
    name: "Trưởng ban Thành viên",
    shortName: "TB Thành viên",
    color: "text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800",
    desc: "Quản lý phát triển & thẩm định hồ sơ hội viên",
  },
  {
    key: "truong_ban_xuc_tien",
    name: "Trưởng ban Xúc tiến thương mại",
    shortName: "TB Xúc tiến",
    color: "text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800",
    desc: "Quản lý kết nối giao thương & cơ hội kinh doanh",
  },
  {
    key: "truong_ban_tai_chinh",
    name: "Trưởng ban Tài chính",
    shortName: "TB Tài chính",
    color: "text-yellow-700 bg-yellow-50 border-yellow-200 dark:bg-yellow-950/50 dark:text-yellow-300 dark:border-yellow-800",
    desc: "Quản lý quỹ, hội phí, thu chi & tài chính CLB",
  },
  {
    key: "truong_ban_thien_nguyen",
    name: "Trưởng ban Thiện nguyện",
    shortName: "TB Thiện nguyện",
    color: "text-teal-700 bg-teal-50 border-teal-200 dark:bg-teal-950/50 dark:text-teal-300 dark:border-teal-800",
    desc: "Quản lý hoạt động từ thiện & an sinh xã hội",
  },
  {
    key: "thanh_vien_ban_su_kien",
    name: "Thành viên Ban Sự Kiện",
    shortName: "TV Sự Kiện",
    color: "text-rose-600 bg-rose-50 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800",
    desc: "Thành viên chuyên trách Ban Sự Kiện",
  },
  {
    key: "thanh_vien_ban_xuc_tien",
    name: "Thành viên Ban Xúc Tiến TM",
    shortName: "TV Xúc Tiến TM",
    color: "text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800",
    desc: "Thành viên chuyên trách Ban Xúc Tiến Thương Mại",
  },
  {
    key: "thanh_vien_ban_thanh_vien",
    name: "Thành viên Ban Thành Viên",
    shortName: "TV Thành Viên",
    color: "text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800",
    desc: "Thành viên chuyên trách Ban Thành Viên",
  },
  {
    key: "thanh_vien_ban_truyen_thong",
    name: "Thành viên Ban Truyền Thông",
    shortName: "TV Truyền Thông",
    color: "text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800",
    desc: "Thành viên chuyên trách Ban Truyền Thông",
  },
  {
    key: "thanh_vien_ban_tai_chinh",
    name: "Thành viên Ban Tài Chính",
    shortName: "TV Tài Chính",
    color: "text-yellow-600 bg-yellow-50 border-yellow-200 dark:bg-yellow-950/50 dark:text-yellow-300 dark:border-yellow-800",
    desc: "Thành viên chuyên trách Ban Tài Chính",
  },
  {
    key: "thanh_vien_ban_thien_nguyen",
    name: "Thành viên Ban Thiện Nguyện",
    shortName: "TV Thiện Nguyện",
    color: "text-teal-600 bg-teal-50 border-teal-200 dark:bg-teal-950/50 dark:text-teal-300 dark:border-teal-800",
    desc: "Thành viên chuyên trách Ban Thiện Nguyện",
  },
  {
    key: "member",
    name: "Hội viên",
    shortName: "Hội viên",
    color: "text-slate-700 bg-slate-50 border-slate-200 dark:bg-slate-900/50 dark:text-slate-300 dark:border-slate-800",
    desc: "Hội viên chính thức tham gia sinh hoạt & giao thương của hiệp hội",
  },
];

export const ROLE_OPTIONS = [
  { value: "quan_tri", label: "Quản trị" },
  { value: "chu_tich", label: "Chủ tịch" },
  { value: "truong_ban_dieu_hanh", label: "Trưởng ban Điều hành" },
  { value: "admin", label: "Admin" },
  { value: "thanh_vien_ban_dieu_hanh", label: "Thành viên ban điều hành" },
  { value: "tong_thu_ky", label: "Tổng thư ký" },
  { value: "truong_ban_truyen_thong", label: "Trưởng ban Truyền thông" },
  { value: "truong_ban_thanh_vien", label: "Trưởng ban Thành viên" },
  { value: "truong_ban_xuc_tien", label: "Trưởng ban Xúc tiến thương mại" },
  { value: "truong_ban_tai_chinh", label: "Trưởng ban Tài chính" },
  { value: "truong_ban_thien_nguyen", label: "Trưởng ban Thiện nguyện" },
  { value: "thanh_vien_ban_su_kien", label: "Thành viên Ban Sự Kiện" },
  { value: "thanh_vien_ban_xuc_tien", label: "Thành viên Ban Xúc Tiến Thương Mại" },
  { value: "thanh_vien_ban_thanh_vien", label: "Thành viên Ban Thành Viên" },
  { value: "thanh_vien_ban_truyen_thong", label: "Thành viên Ban Truyền Thông" },
  { value: "thanh_vien_ban_tai_chinh", label: "Thành viên Ban Tài Chính" },
  { value: "thanh_vien_ban_thien_nguyen", label: "Thành viên Ban Thiện Nguyện" },
  { value: "member", label: "Hội viên" },
];

export interface DepartmentItem {
  id: string;
  name: string;
  code: string;
  leaderName?: string;
  headTitle?: string;
  memberCount?: number;
  description?: string;
  color?: string;
  isCore?: boolean;
}

export const INITIAL_DEPARTMENTS: DepartmentItem[] = [
  { id: "dept_dh", name: "Ban Điều Hành", code: "BDH", leaderName: "Trưởng ban Điều hành", description: "Điều hành quản lý nội bộ, quy chế & điều phối các ban", color: "blue" },
  { id: "dept_tk", name: "Ban Thư Ký", code: "BTK", leaderName: "Tổng thư ký", description: "Điều phối thư ký, sự kiện, cuộc họp & công văn", color: "purple" },
  { id: "dept_tv", name: "Ban Thành viên", code: "BTV", leaderName: "Trưởng ban Thành viên", description: "Phát triển hội viên, kết nạp & chăm sóc hội viên mới", color: "emerald" },
  { id: "dept_xt", name: "Ban Xúc tiến", code: "BXT", leaderName: "Trưởng ban Xúc tiến", description: "Điều phối cơ hội giao thương, kết nối B2B & kinh doanh", color: "amber" },
  { id: "dept_tt", name: "Ban Truyền thông", code: "BTT", leaderName: "Trưởng ban Truyền thông", description: "Quản lý truyền thông, tin tức, hình ảnh & thương hiệu", color: "rose" },
  { id: "dept_tc", name: "Ban Tài chính", code: "BTC", leaderName: "Trưởng ban Tài chính", description: "Quản lý quỹ, thu chi & ngân sách hiệp hội", color: "yellow" },
  { id: "dept_tn", name: "Ban Thiện nguyện", code: "BTN", leaderName: "Trưởng ban Thiện nguyện", description: "Tổ chức hoạt động thiện nguyện vì cộng đồng", color: "teal" },
];

export const DEPARTMENTS_STORAGE_KEY = "ceo1983_departments_v2";

export function getCustomDepartments(): DepartmentItem[] {
  if (typeof window === "undefined") return INITIAL_DEPARTMENTS;
  try {
    const raw = localStorage.getItem(DEPARTMENTS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return INITIAL_DEPARTMENTS;
}

export function saveCustomDepartments(list: DepartmentItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(DEPARTMENTS_STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent("ceo1983_departments_updated", { detail: list }));
  } catch {}
}

export const DEPARTMENT_OPTIONS = [
  "Ban Điều Hành",
  "Ban Thư Ký",
  "Ban Thành viên",
  "Ban Xúc tiến",
  "Ban Truyền thông",
  "Ban Tài chính",
  "Ban Thiện nguyện",
  "Hội viên ceo1983",
];

export function normalizeRole(r?: string): SystemRoleKey {
  if (!r) return "member";
  const s = r.toLowerCase().trim();

  // 1. Exact system/admin keys
  if (s === "quan_tri" || s === "platform_admin" || s === "superadmin" || s.includes("hệ thống") || s === "quản trị") return "quan_tri";
  if (s === "chu_tich" || s === "president" || s.includes("chủ tịch")) return "chu_tich";
  if (s === "admin" || s === "adm") return "admin";
  if (s === "tong_thu_ky" || s === "ttk" || s.includes("tổng thư ký")) return "tong_thu_ky";
  if (s === "ban_thu_ky" || s === "thu_ky" || s === "btk") return "tong_thu_ky";

  // 2. Specific committee members (BEFORE Trưởng ban to prevent false match)
  if (s === "thanh_vien_ban_dieu_hanh" || s.includes("thành viên ban điều hành") || s.includes("tv điều hành") || s.includes("thành viên bđh")) return "thanh_vien_ban_dieu_hanh";
  if (s === "thanh_vien_ban_su_kien" || s.includes("thành viên ban sự kiện") || s.includes("tv sự kiện")) return "thanh_vien_ban_su_kien";
  if (s === "thanh_vien_ban_xuc_tien" || s.includes("thành viên ban xúc tiến") || s.includes("tv xúc tiến")) return "thanh_vien_ban_xuc_tien";
  if (s === "thanh_vien_ban_thanh_vien" || s.includes("thành viên ban thành viên") || s.includes("tv thành viên")) return "thanh_vien_ban_thanh_vien";
  if (s === "thanh_vien_ban_truyen_thong" || s.includes("thành viên ban truyền thông") || s.includes("tv truyền thông")) return "thanh_vien_ban_truyen_thong";
  if (s === "thanh_vien_ban_tai_chinh" || s.includes("thành viên ban tài chính") || s.includes("tv tài chính")) return "thanh_vien_ban_tai_chinh";
  if (s === "thanh_vien_ban_thien_nguyen" || s.includes("thành viên ban thiện nguyện") || s.includes("tv thiện nguyện")) return "thanh_vien_ban_thien_nguyen";

  // 3. Committee Heads (Trưởng ban)
  if (s === "truong_ban_dieu_hanh" || s.includes("tbdh") || (s.includes("điều hành") && (s.includes("trưởng") || s.includes("truong") || s.includes("tb")))) return "truong_ban_dieu_hanh";
  if (s === "truong_ban_truyen_thong" || s.includes("btt") || (s.includes("truyền thông") && (s.includes("trưởng") || s.includes("truong") || s.includes("tb")))) return "truong_ban_truyen_thong";
  if (s === "truong_ban_thanh_vien" || s.includes("btv") || (s.includes("thành viên") && (s.includes("trưởng") || s.includes("truong") || s.includes("tb")))) return "truong_ban_thanh_vien";
  if (s === "truong_ban_xuc_tien" || s.includes("bxt") || ((s.includes("xúc tiến") || s.includes("thương mại")) && (s.includes("trưởng") || s.includes("truong") || s.includes("tb")))) return "truong_ban_xuc_tien";
  if (s === "truong_ban_tai_chinh" || s.includes("btc") || (s.includes("tài chính") && (s.includes("trưởng") || s.includes("truong") || s.includes("tb")))) return "truong_ban_tai_chinh";
  if (s === "truong_ban_thien_nguyen" || s.includes("btn") || (s.includes("thiện nguyện") && (s.includes("trưởng") || s.includes("truong") || s.includes("tb")))) return "truong_ban_thien_nguyen";

  // 4. Fallback for general committee keywords
  if (s.includes("sự kiện")) return "thanh_vien_ban_su_kien";
  if (s.includes("xúc tiến") || s.includes("thương mại")) return "thanh_vien_ban_xuc_tien";
  if (s.includes("truyền thông")) return "thanh_vien_ban_truyen_thong";
  if (s.includes("tài chính")) return "thanh_vien_ban_tai_chinh";
  if (s.includes("thiện nguyện")) return "thanh_vien_ban_thien_nguyen";
  if (s.includes("thành viên ban")) return "thanh_vien_ban_thanh_vien";

  return "member";
}

export function normalizeDept(d?: string): string {
  if (!d) return "Hội viên ceo1983";
  const s = d.toLowerCase().trim();
  if (s.includes("tài chính") || s.includes("kế toán") || s.includes("ngân quỹ")) return "Ban Tài chính";
  if (s.includes("thành viên") && !s.includes("hội viên") && !s.includes("ceo")) return "Ban Thành viên";
  if (s.includes("xúc tiến") || s.includes("thương mại") || s.includes("b2b")) return "Ban Xúc tiến";
  if (s.includes("thiện nguyện") || s.includes("tấm lòng") || s.includes("an sinh")) return "Ban Thiện nguyện";
  if (s.includes("truyền thông") || s.includes("marketing") || s.includes("báo chí")) return "Ban Truyền thông";
  if (s.includes("thư ký")) return "Ban Thư Ký";
  if (s.includes("điều hành") || s.includes("quản trị") || s.includes("bqt")) return "Ban Điều Hành";
  return "Hội viên ceo1983";
}

export function getAllDynamicRoleOptions(customDepts?: DepartmentItem[]): { value: string; label: string; desc?: string }[] {
  const depts = customDepts || (typeof window !== "undefined" ? getCustomDepartments() : INITIAL_DEPARTMENTS);
  const base = [...ROLE_OPTIONS];
  depts.forEach((d) => {
    if (!d.isCore) {
      const leaderKey = `truong_ban_${d.code.toLowerCase().replace(/[^a-z0-9_]/g, "_")}`;
      if (!base.some((r) => r.value === leaderKey)) {
        base.push({
          value: leaderKey,
          label: d.headTitle || `Trưởng ${d.name}`,
        });
      }
    }
  });
  return base;
}

export function getRolesForDepartment(
  deptName: string,
  customDepts?: DepartmentItem[],
  currentRole?: string
): { value: string; label: string; desc?: string }[] {
  const norm = normalizeDept(deptName);
  const depts = customDepts || (typeof window !== "undefined" ? getCustomDepartments() : INITIAL_DEPARTMENTS);
  const matchedCustom = depts.find(
    (d) =>
      d.name.toLowerCase() === deptName.toLowerCase() ||
      d.code.toLowerCase() === deptName.toLowerCase() ||
      deptName.toLowerCase().includes(d.name.toLowerCase())
  );

  let roles: { value: string; label: string; desc?: string }[] = [];

  if (norm === "Ban Điều Hành" || deptName.toLowerCase().includes("điều hành") || deptName.toLowerCase().includes("quản trị")) {
    roles = [
      { value: "quan_tri", label: "Quản trị", desc: "Toàn quyền quản trị hệ thống" },
      { value: "chu_tich", label: "Chủ tịch", desc: "Chủ tịch Hiệp hội" },
      { value: "truong_ban_dieu_hanh", label: "Trưởng ban Điều hành", desc: "Điều hành quản lý nội bộ" },
      { value: "admin", label: "Admin", desc: "Quản trị viên kỹ thuật & dữ liệu" },
      { value: "thanh_vien_ban_dieu_hanh", label: "Thành viên ban điều hành", desc: "Thành viên Ban Điều Hành" },
    ];
  } else if (norm === "Ban Thư Ký" || deptName.toLowerCase().includes("thư ký")) {
    roles = [
      { value: "tong_thu_ky", label: "Tổng thư ký", desc: "Điều phối thư ký & văn phòng" },
      { value: "thanh_vien_ban_su_kien", label: "Thành viên Ban Sự Kiện", desc: "Phụ trách sự kiện & thư ký" },
      { value: "member", label: "Thành viên", desc: "Thành viên Ban thư ký" },
    ];
  } else if (norm === "Ban Thành viên" || deptName.toLowerCase().includes("thành viên")) {
    roles = [
      { value: "truong_ban_thanh_vien", label: "Trưởng ban Thành viên", desc: "Lãnh đạo Ban phát triển hội viên" },
      { value: "thanh_vien_ban_thanh_vien", label: "Thành viên Ban Thành Viên", desc: "Chuyên trách thẩm định & chăm sóc hội viên" },
      { value: "member", label: "Thành viên", desc: "Hội viên" },
    ];
  } else if (norm === "Ban Xúc tiến" || deptName.toLowerCase().includes("xúc tiến")) {
    roles = [
      { value: "truong_ban_xuc_tien", label: "Trưởng ban Xúc tiến", desc: "Lãnh đạo Ban Xúc tiến thương mại" },
      { value: "thanh_vien_ban_xuc_tien", label: "Thành viên Ban Xúc Tiến TM", desc: "Chuyên trách kết nối giao thương B2B" },
      { value: "member", label: "Thành viên", desc: "Hội viên" },
    ];
  } else if (norm === "Ban Truyền thông" || deptName.toLowerCase().includes("truyền thông")) {
    roles = [
      { value: "truong_ban_truyen_thong", label: "Trưởng ban Truyền thông", desc: "Lãnh đạo Ban Truyền thông & thương hiệu" },
      { value: "thanh_vien_ban_truyen_thong", label: "Thành viên Ban Truyền Thông", desc: "Chuyên trách tin tức & hình ảnh sự kiện" },
      { value: "member", label: "Thành viên", desc: "Hội viên" },
    ];
  } else if (norm === "Ban Tài chính" || deptName.toLowerCase().includes("tài chính")) {
    roles = [
      { value: "truong_ban_tai_chinh", label: "Trưởng ban Tài chính", desc: "Lãnh đạo Ban Tài chính & ngân sách" },
      { value: "thanh_vien_ban_tai_chinh", label: "Thành viên Ban Tài Chính", desc: "Chuyên trách thu chi & kế toán quỹ" },
      { value: "member", label: "Thành viên", desc: "Hội viên" },
    ];
  } else if (norm === "Ban Thiện nguyện" || deptName.toLowerCase().includes("thiện nguyện")) {
    roles = [
      { value: "truong_ban_thien_nguyen", label: "Trưởng ban Thiện nguyện", desc: "Lãnh đạo Ban Hoạt động thiện nguyện" },
      { value: "thanh_vien_ban_thien_nguyen", label: "Thành viên Ban Thiện Nguyện", desc: "Chuyên trách hoạt động an sinh xã hội" },
      { value: "member", label: "Thành viên", desc: "Hội viên" },
    ];
  } else if (matchedCustom) {
    const leaderKey = `truong_ban_${matchedCustom.code.toLowerCase().replace(/[^a-z0-9_]/g, "_")}`;
    const leaderTitle = matchedCustom.headTitle || `Trưởng ${matchedCustom.name}`;
    roles = [
      { value: leaderKey, label: leaderTitle, desc: `Lãnh đạo ban ${matchedCustom.name}` },
      { value: "member", label: "Thành viên", desc: `Hội viên ban ${matchedCustom.name}` },
    ];
  } else {
    roles = [
      { value: "member", label: "Hội viên", desc: "Hội viên chính thức (App CEO 1983)" },
    ];
  }

  // Ensure currentRole is preserved if already set
  if (currentRole && !roles.some((r) => r.value === currentRole)) {
    const matchingRoleDef = ROLE_OPTIONS.find((r) => r.value === currentRole);
    roles.unshift({
      value: currentRole,
      label: matchingRoleDef?.label || currentRole,
      desc: "Vai trò hiện tại của tài khoản",
    });
  }

  return roles;
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

  const res: Record<string, boolean> = {
    ...current,
    quan_tri: current.quan_tri ?? true,
    admin: current.admin ?? true,
    tong_thu_ky: current.tong_thu_ky ?? (isSecretary ? true : false),
    truong_ban_dieu_hanh: current.truong_ban_dieu_hanh ?? (Boolean(current.dieu_hanh || current.bqt) || isLeader ? true : false),
    truong_ban_truyen_thong: current.truong_ban_truyen_thong ?? (code.startsWith("NWS_") || code.startsWith("EVT_") || isLeader ? true : false),
    truong_ban_thanh_vien: current.truong_ban_thanh_vien ?? (code.startsWith("MEM_") || isLeader ? true : false),
    truong_ban_xuc_tien: current.truong_ban_xuc_tien ?? (code.startsWith("OPP_") || code.startsWith("MKT_") || isLeader ? true : false),
    truong_ban_tai_chinh: current.truong_ban_tai_chinh ?? (isFinance ? true : false),
    truong_ban_thien_nguyen: current.truong_ban_thien_nguyen ?? (code.startsWith("CHA_") || isLeader ? true : false),
    member: current.member ?? (isPublicMemberAction && !isFinance ? true : false),
  };
  delete res.ban_thu_ky;
  delete res.truong_ban_quan_tri;
  delete res.bqt;
  return res;
}

/**
 * Kiểm tra 1 route có được phép hiển thị trên Sidebar/CRM theo vai trò người dùng hay không
 */
export function isRouteAllowedByMatrix(route: string, roleKey: SystemRoleKey): boolean {
  // Quản trị (Super Admin), Admin và Chủ tịch luôn có toàn quyền xem tất cả chức năng CRM
  if (roleKey === "quan_tri" || roleKey === "admin" || roleKey === "chu_tich") return true;

  // Làm sạch route (bỏ query parameters & hash fragment: ví dụ /permissions?tab=matrix -> /permissions)
  const cleanRoute = (route || "").split("?")[0].split("#")[0];

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

        const featCleanRoute = String(feat.route).split("?")[0].split("#")[0];

        // So khớp route chính xác hoặc tiền tố hai chiều
        if (
          featCleanRoute === cleanRoute ||
          (cleanRoute !== "/" && featCleanRoute.startsWith(cleanRoute)) ||
          (featCleanRoute !== "/" && cleanRoute.startsWith(featCleanRoute))
        ) {
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

export const PERMISSION_TO_MATRIX_CODES: Record<string, string[]> = {
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
  "member:renew": ["FEE_ADD", "MEM_EDIT", "REN_PROCESS"],
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

  // Mã định danh thao tác con trực tiếp (Direct Action Codes)
  MEM_EXPORT: ["MEM_EXPORT", "act_mem_export"],
  COM_EXPORT: ["COM_EXPORT", "act_com_export"],
  COM_VIEW: ["COM_VIEW", "act_com_view"],
  COM_ADD: ["COM_ADD", "act_com_add"],
  COM_EDIT: ["COM_EDIT", "act_com_edit"],
  COM_DELETE: ["COM_DELETE", "act_com_delete"],
  FEE_VIEW: ["FEE_VIEW", "act_fee_view"],
  FEE_ADD: ["FEE_ADD", "act_fee_add"],
  FEE_EDIT: ["FEE_EDIT", "act_fee_edit"],
  FEE_DELETE: ["FEE_DELETE", "act_fee_delete"],
  FEE_RECONCILE: ["FEE_RECONCILE", "act_fee_reconcile"],
  EVT_EXPORT: ["EVTO_EXPORT", "act_evto_export", "EVT_EXPORT"],
  EVTO_EXPORT: ["EVTO_EXPORT", "act_evto_export"],
  CHK_SCAN: ["CHK_SCAN", "act_chk_scan"],
  MEET_ADD: ["MEET_ADD", "act_meet_add"],
  MEET_APPROVE: ["MEET_APPROVE", "act_meet_approve"],
  MEET_EDIT: ["MEET_EDIT", "act_meet_edit"],
  MEET_DELETE: ["MEET_DELETE", "act_meet_delete"],
  PRM_EDIT: ["PRM_EDIT", "act_prm_edit"],
};

export const COMMITTEE_PERMISSIONS_STORAGE_KEY = "ceo1983_committee_permissions_v2";

export function normalizeCommitteeKey(dept?: string): string {
  if (!dept) return "thanh_vien";
  const s = dept.toLowerCase().trim();
  if (s.includes("quản trị") || s.includes("bqt") || s.includes("điều hành") || s === "dieu_hanh") return "dieu_hanh";
  if (s.includes("thư ký") || s.includes("btk") || s.includes("tong_thu_ky") || s === "thu_ky") return "thu_ky";
  if (s.includes("tài chính") || s.includes("btc") || s === "tai_chinh") return "tai_chinh";
  if (s.includes("thành viên") || s.includes("btv") || s === "thanh_vien") return "thanh_vien";
  if (s.includes("xúc tiến") || s.includes("bxt") || s.includes("thương mại") || s === "xuc_tien") return "xuc_tien";
  if (s.includes("truyền thông") || s.includes("btt") || s === "truyen_thong") return "truyen_thong";
  if (s.includes("thiện nguyện") || s.includes("btn") || s.includes("an sinh") || s === "thien_nguyen") return "thien_nguyen";
  return "thanh_vien";
}

export function dispatchPermissionSyncEvent() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("role-changed"));
    window.dispatchEvent(new Event("crm_permissions_updated"));
    window.dispatchEvent(new Event("vba_member_permissions_updated"));
    try {
      localStorage.setItem("ceo1983_perm_sync_ping", String(Date.now()));
      localStorage.setItem("vba_permission_last_updated", String(Date.now()));
      if (typeof BroadcastChannel !== "undefined") {
        const bc = new BroadcastChannel("vba_permission_sync");
        bc.postMessage({
          type: "PERMISSION_CHANGED",
          message:
            "Quyền hạn tài khoản của bạn vừa được Quản trị viên cập nhật. Hệ thống sẽ tải lại trang để áp dụng phân quyền mới.",
        });
        bc.close();
      }
    } catch {}
  }
}

/**
 * Kiểm tra xem một hành động / Permission có được cấp phép theo Ma Trận Phân Quyền (lưu trong CSDL / localStorage) hay không
 * Nếu người quản trị đã BỎ TÍCH trong ma trận và lưu, hàm này trả về FALSE để ẩn ngay các nút/thao tác trên giao diện.
 */
export function isActionAllowedByMatrix(
  actionOrPerm: string,
  roleKey?: string,
  committeeKeyOrDept?: string,
  memberCode?: string
): boolean {
  if (typeof window === "undefined") return true;

  try {
    // 0. Toàn quyền cho Quản trị viên (quan_tri / admin) và Chủ tịch (chu_tich / president)
    const normRole = (roleKey || "").toLowerCase().trim();
    if (
      normRole === "quan_tri" ||
      normRole === "chu_tich" ||
      normRole === "admin" ||
      normRole === "adm" ||
      normRole === "president" ||
      normRole === "platform_admin" ||
      normRole === "superadmin" ||
      normRole.includes("quản trị") ||
      normRole.includes("chủ tịch")
    ) {
      return true;
    }

    // 1. Kiểm tra ghi đè trực tiếp của tài khoản hội viên nếu có
    if (memberCode) {
      const rawUserPerms = localStorage.getItem("vba_member_permissions");
      if (rawUserPerms) {
        const userMap = JSON.parse(rawUserPerms);
        const userProfile = userMap[memberCode] || userMap[memberCode.toUpperCase()] || userMap[memberCode.toLowerCase()];
        if (userProfile) {
          // Bị khóa chức năng cấp cao & thao tác cốt lõi
          if (userProfile.canView === false && (actionOrPerm.includes(":view") || actionOrPerm.endsWith("_VIEW") || actionOrPerm.endsWith(":read"))) {
            return false;
          }
          if (userProfile.canAdd === false && (actionOrPerm.includes(":create") || actionOrPerm.includes(":add") || actionOrPerm.endsWith("_ADD"))) {
            return false;
          }
          if (userProfile.canEdit === false && (actionOrPerm.includes(":edit") || actionOrPerm.includes(":update") || actionOrPerm.endsWith("_EDIT"))) {
            return false;
          }
          if (userProfile.canDelete === false && (actionOrPerm.includes(":delete") || actionOrPerm.endsWith("_DELETE"))) {
            return false;
          }
          if (userProfile.canApprove === false && (actionOrPerm.includes(":approve") || actionOrPerm.endsWith("_APPROVE"))) {
            return false;
          }
          if (actionOrPerm.startsWith("member:") && userProfile.canManageMembers === false && actionOrPerm !== "member:view") {
            return false;
          }
          if (actionOrPerm.startsWith("event:") && userProfile.canManageEvents === false && actionOrPerm !== "event:view") {
            return false;
          }
          if (actionOrPerm.startsWith("media:") && userProfile.canManageNews === false && actionOrPerm !== "media:view") {
            return false;
          }
          if ((actionOrPerm.startsWith("opportunity:") || actionOrPerm.startsWith("marketplace:")) && userProfile.canManageMarketplace === false && !actionOrPerm.endsWith(":view")) {
            return false;
          }
          if (userProfile.deniedCodes && Array.isArray(userProfile.deniedCodes)) {
            const denied = userProfile.deniedCodes.map((c: string) => c.toUpperCase());
            if (denied.includes(actionOrPerm.toUpperCase())) return false;
          }
        }
      }
    }

    const raw = localStorage.getItem(RBAC_MATRIX_STORAGE_KEY);
    if (!raw) return true; // Chưa tùy biến thì giữ quyền mặc định

    const categories = JSON.parse(raw);
    if (!Array.isArray(categories)) return true;

    // Chuẩn hóa roleKey sang key trong ma trận (vai trò hệ thống)
    const targetNormRole = (roleKey || "member").toLowerCase().trim();
    let targetRole: SystemRoleKey = "member";
    if (targetNormRole === "quan_tri" || targetNormRole === "adm" || targetNormRole === "platform_admin" || targetNormRole === "superadmin" || targetNormRole.includes("quản trị")) {
      targetRole = "quan_tri";
    } else if (targetNormRole.includes("chủ tịch") || targetNormRole === "chu_tich" || targetNormRole === "president") {
      targetRole = "chu_tich";
    } else if (targetNormRole === "admin" || targetNormRole === "bqt") {
      targetRole = "admin";
    } else if (targetNormRole === "tong_thu_ky" || (targetNormRole.includes("thư ký") && targetNormRole.includes("tổng"))) {
      targetRole = "tong_thu_ky";
    } else if (targetNormRole === "ban_thu_ky" || targetNormRole === "thu_ky" || targetNormRole === "btk" || targetNormRole.includes("thư ký")) {
      targetRole = "tong_thu_ky";
    } else if (targetNormRole === "truong_ban_truyen_thong" || targetNormRole === "btt" || (targetNormRole.includes("truyền thông") && (targetNormRole.includes("trưởng") || targetNormRole.includes("truong")))) {
      targetRole = "truong_ban_truyen_thong";
    } else if (targetNormRole === "truong_ban_thanh_vien" || targetNormRole === "btv" || (targetNormRole.includes("thành viên") && (targetNormRole.includes("trưởng") || targetNormRole.includes("truong")))) {
      targetRole = "truong_ban_thanh_vien";
    } else if (targetNormRole === "truong_ban_xuc_tien" || targetNormRole === "bxt" || ((targetNormRole.includes("xúc tiến") || targetNormRole.includes("thương mại")) && (targetNormRole.includes("trưởng") || targetNormRole.includes("truong")))) {
      targetRole = "truong_ban_xuc_tien";
    } else if (targetNormRole === "truong_ban_tai_chinh" || targetNormRole === "btc" || (targetNormRole.includes("tài chính") && (targetNormRole.includes("trưởng") || targetNormRole.includes("truong")))) {
      targetRole = "truong_ban_tai_chinh";
    } else if (targetNormRole === "truong_ban_thien_nguyen" || targetNormRole === "btn" || (targetNormRole.includes("thiện nguyện") && (targetNormRole.includes("trưởng") || targetNormRole.includes("truong")))) {
      targetRole = "truong_ban_thien_nguyen";
    }

    // Chuẩn hóa ban chuyên môn nếu có
    const committeeKey = committeeKeyOrDept ? normalizeCommitteeKey(committeeKeyOrDept) : null;

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
            // A. Kiểm tra theo Ban chuyên môn của tài khoản
            if (committeeKey && act.roles[committeeKey] !== undefined) {
              if (act.roles[committeeKey] === false) {
                // Nếu Ban bị bỏ tích quyền này, lập tức khóa
                return false;
              }
            }

            // B. Kiểm tra theo Vai trò hệ thống
            if (act.roles[targetRole] !== undefined) {
              if (act.roles[targetRole] === false) {
                // Nếu vai trò bị bỏ tích quyền này, lập tức khóa (kể cả admin/quan_tri)
                return false;
              }
            }

            // C. Kiểm tra roleKey thô
            if (act.roles[normRole] !== undefined) {
              if (act.roles[normRole] === false) return false;
            }

            // D. Nếu cả ban hoặc vai trò có quyền true
            if (
              act.roles[targetRole] === true ||
              (committeeKey && act.roles[committeeKey] === true) ||
              (targetRole === "quan_tri" && act.roles["quan_tri"] !== false)
            ) {
              return true;
            }

            // E. Nếu thao tác này đã nằm trong ma trận nhưng vai trò không được cấp quyền
            return false;
          }
        }
      }
    }
  } catch {
    return true;
  }

  // Quản trị viên cấp cao mặc định được phép nếu không bị bỏ tích cụ thể
  if (roleKey === "quan_tri" || roleKey === "ADM" || roleKey === "platform_admin") {
    return true;
  }

  return true;
}

/**
 * Kiểm tra xem người dùng hiện tại có mã quyền cụ thể trong session không
 * Dựa trên mảng permissions[] được cấp từ backend NestJS và JWT
 */
export function hasPermission(
  user: { permissions?: string[]; isAdmin?: boolean; role?: string } | null | undefined,
  permission: string
): boolean {
  if (!user) return false;
  if (user.isAdmin || user.role === 'admin' || user.role === 'quan_tri' || user.role === 'chu_tich' || user.role === 'president') {
    return true;
  }
  if (!Array.isArray(user.permissions)) return false;
  if (user.permissions.includes('admin:full_access') || user.permissions.includes('*')) {
    return true;
  }
  return user.permissions.includes(permission);
}



