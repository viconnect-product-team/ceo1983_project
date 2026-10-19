import React, { useState, useMemo, useEffect } from "react";
import {
  ShieldCheck,
  Save,
  RotateCcw,
  Search,
  Check,
  X,
  Plus,
  Trash2,
  Eye,
  Pencil,
  ChevronDown,
  ChevronRight,
  FolderPlus,
  KeyRound,
  Users,
  Calendar,
  Handshake,
  Wallet,
  Newspaper,
  Store,
  Settings,
  HelpCircle,
  Building2,
  Tags,
  RefreshCw,
  Vote,
  ClipboardList,
  ScanLine,
  QrCode,
  Package,
  FileBarChart,
  ArrowDownCircle,
  ArrowUpCircle,
  PieChart,
  Bell,
  Mail,
  Gift,
  Award,
  MessageSquare,
  Sparkles,
  CheckSquare,
  History,
  Palette,
  FolderOpen,
  IdCard,
} from "lucide-react";
import { toast } from "sonner";
import { fetchNestApi } from "@/lib/api-client";
import { RBAC_MATRIX_STORAGE_KEY, normalizeActionRoles, dispatchPermissionSyncEvent, getCustomDepartments } from "@/lib/rbac-permission-helpers";

// ── 6 BAN CHUYÊN MÔN / BAN ĐIỀU HÀNH ──
export interface CommitteeRole {
  key: string;
  name: string;
  shortName: string;
  color: string;
}

export const COMMITTEES: CommitteeRole[] = [
  { key: "dieu_hanh", name: "Ban Điều Hành", shortName: "Ban Điều Hành", color: "text-blue-700 bg-blue-50 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800" },
  { key: "thu_ky", name: "Ban Thư Ký", shortName: "Ban Thư Ký", color: "text-purple-700 bg-purple-50 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800" },
  { key: "thanh_vien", name: "Ban Thành Viên", shortName: "Ban Thành Viên", color: "text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800" },
  { key: "xuc_tien", name: "Ban Xúc Tiến Thương Mại", shortName: "Ban Xúc Tiến TM", color: "text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800" },
  { key: "truyen_thong", name: "Ban Truyền Thông", shortName: "Ban Truyền Thông", color: "text-rose-700 bg-rose-50 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800" },
  { key: "tai_chinh", name: "Ban Tài Chính", shortName: "Ban Tài Chính", color: "text-yellow-700 bg-yellow-50 border-yellow-200 dark:bg-yellow-950/50 dark:text-yellow-300 dark:border-yellow-800" },
  { key: "thien_nguyen", name: "Ban Thiện Nguyện", shortName: "Ban Thiện Nguyện", color: "text-teal-700 bg-teal-50 border-teal-200 dark:bg-teal-950/50 dark:text-teal-300 dark:border-teal-800" },
];

// ── HỆ THỐNG ROLE: CHỦ TỊCH -> ADMIN -> BAN ĐIỀU HÀNH -> TỔNG THƯ KÝ -> TRƯỞNG BAN ──
export interface SystemRole {
  key: string;
  name: string;
  shortName: string;
  color: string;
  desc: string;
}

export const SYSTEM_ROLES: SystemRole[] = [
  { key: "quan_tri", name: "Quản trị", shortName: "Quản trị", color: "text-indigo-700 bg-indigo-50 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800", desc: "Toàn quyền hệ thống & phân quyền cao nhất" },
  { key: "chu_tich", name: "Chủ tịch", shortName: "Chủ tịch", color: "text-amber-800 bg-amber-100 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-700", desc: "Chủ tịch Hiệp hội, quyền phê duyệt tối cao toàn hệ thống" },
  { key: "admin", name: "Admin", shortName: "Admin", color: "text-purple-700 bg-purple-50 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800", desc: "Quản trị viên vận hành nghiệp vụ CRM" },
  { key: "tong_thu_ky", name: "Tổng thư ký", shortName: "Tổng thư ký", color: "text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800", desc: "Điều phối thư ký, sự kiện, cuộc họp & công văn" },
  { key: "truong_ban_dieu_hanh", name: "Trưởng ban điều hành", shortName: "Trưởng ban Điều Hành", color: "text-blue-700 bg-blue-50 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800", desc: "Điều hành quản lý nội bộ, quy chế & điều phối các ban" },
  { key: "truong_ban_truyen_thong", name: "Trưởng ban truyền thông", shortName: "Trưởng ban Truyền Thông", color: "text-rose-700 bg-rose-50 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800", desc: "Quản lý truyền thông, tin tức, hình ảnh & thương hiệu" },
  { key: "truong_ban_thanh_vien", name: "Trưởng ban thành viên", shortName: "Trưởng ban Thành Viên", color: "text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800", desc: "Phát triển hội viên, kết nạp & chăm sóc hội viên mới" },
  { key: "truong_ban_xuc_tien", name: "Trưởng ban xúc tiến TM", shortName: "Trưởng ban Xúc Tiến TM", color: "text-orange-700 bg-orange-50 border-orange-200 dark:bg-orange-950/50 dark:text-orange-300 dark:border-orange-800", desc: "Điều phối cơ hội giao thương, kết nối B2B & kinh doanh" },
  { key: "truong_ban_tai_chinh", name: "Trưởng ban tài chính", shortName: "Trưởng ban Tài Chính", color: "text-yellow-700 bg-yellow-50 border-yellow-200 dark:bg-yellow-950/50 dark:text-yellow-300 dark:border-yellow-800", desc: "Quản lý quỹ, thu chi & ngân sách hiệp hội" },
  { key: "truong_ban_thien_nguyen", name: "Trưởng ban thiện nguyện", shortName: "Trưởng ban Thiện Nguyện", color: "text-teal-700 bg-teal-50 border-teal-200 dark:bg-teal-950/50 dark:text-teal-300 dark:border-teal-800", desc: "Tổ chức hoạt động thiện nguyện vì cộng đồng" },
  { key: "thanh_vien_ban_su_kien", name: "Thành viên ban sự kiện", shortName: "Thành viên Ban Sự Kiện", color: "text-rose-600 bg-rose-50 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800", desc: "Thành viên chuyên trách Ban Sự Kiện" },
  { key: "thanh_vien_ban_xuc_tien", name: "Thành viên ban xúc tiến", shortName: "Thành viên Ban Xúc Tiến TM", color: "text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800", desc: "Thành viên chuyên trách Ban Xúc Tiến Thương Mại" },
  { key: "thanh_vien_ban_thanh_vien", name: "Thành viên ban thành viên", shortName: "Thành viên Ban Thành Viên", color: "text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800", desc: "Thành viên chuyên trách Ban Thành Viên" },
  { key: "thanh_vien_ban_truyen_thong", name: "Thành viên ban truyền thông", shortName: "Thành viên Ban Truyền Thông", color: "text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800", desc: "Thành viên chuyên trách Ban Truyền Thông" },
  { key: "thanh_vien_ban_tai_chinh", name: "Thành viên ban tài chính", shortName: "Thành viên Ban Tài Chính", color: "text-yellow-600 bg-yellow-50 border-yellow-200 dark:bg-yellow-950/50 dark:text-yellow-300 dark:border-yellow-800", desc: "Thành viên chuyên trách Ban Tài Chính" },
  { key: "thanh_vien_ban_thien_nguyen", name: "Thành viên ban thiện nguyện", shortName: "Thành viên Ban Thiện Nguyện", color: "text-teal-600 bg-teal-50 border-teal-200 dark:bg-teal-950/50 dark:text-teal-300 dark:border-teal-800", desc: "Thành viên chuyên trách Ban Thiện Nguyện" },
  { key: "member", name: "Hội viên (App CEO 1983)", shortName: "Hội viên CEO 1983", color: "text-slate-700 bg-slate-50 border-slate-200 dark:bg-slate-900/50 dark:text-slate-300 dark:border-slate-800", desc: "Hội viên sinh hoạt chính thức qua ứng dụng CEO 1983 Mobile" },
];

export function getDynamicSystemRoles(): SystemRole[] {
  const customDepts = typeof window !== "undefined" ? getCustomDepartments() : [];
  const baseRoles = [...SYSTEM_ROLES];

  customDepts.forEach((d) => {
    const roleKey = `truong_ban_${d.code.toLowerCase().replace(/[^a-z0-9_]/g, "_")}`;
    if (!baseRoles.some((r) => r.key === roleKey)) {
      baseRoles.push({
        key: roleKey,
        name: d.headTitle || `Trưởng ${d.name}`,
        shortName: `Trưởng ${d.name}`,
        color: "text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800",
        desc: `Trưởng ban chuyên môn ${d.name}`,
      });
    }
  });

  return baseRoles;
}

export interface TreeAction {
  id: string;
  name: string;
  code: string;
  description: string;
  apiEndpoint?: string;
  roles: Record<string, boolean>; // Lưu quyền cho cả 6 ban và 5 role
}

export interface TreeFeature {
  id: string;
  name: string;
  route: string;
  description: string;
  actions: TreeAction[];
}

export interface TreeCategory {
  id: string;
  name: string;
  iconName: string;
  features: TreeFeature[];
}

// ── CẤU TRÚC 8 NHÓM CHỨC NĂNG CHUẨN XÁC 100% THEO MENU SIDEBAR CRM HIỆP HỘI ──
export const INITIAL_CATEGORIES: TreeCategory[] = [
  // NHÓM 1: HỘI VIÊN
  {
    id: "cat_members",
    name: "HỘI VIÊN",
    iconName: "Users",
    features: [
      {
        id: "feat_members",
        name: "Hội viên",
        route: "/members",
        description: "Quản lý hồ sơ hội viên cá nhân, mã hội viên và thông tin hội viên",
        actions: [
          { id: "act_mem_view", name: "Xem danh sách & hồ sơ hội viên", code: "MEM_VIEW", description: "Tra cứu thông tin cá nhân, chức danh, doanh nghiệp", apiEndpoint: "GET /api/members", roles: { bqt: true, thu_ky: true, thanh_vien: true, xuc_tien: true, truyen_thong: true, thien_nguyen: true, quan_tri: true, admin: true, tong_thu_ky: true, ban_thu_ky: true, member: true } },
          { id: "act_mem_add", name: "Thêm mới hội viên", code: "MEM_ADD", description: "Tạo mới tài khoản và hồ sơ hội viên vào hệ thống", apiEndpoint: "POST /api/members", roles: { bqt: true, thu_ky: true, thanh_vien: true, quan_tri: true, admin: true, tong_thu_ky: true } },
          { id: "act_mem_edit", name: "Chỉnh sửa thông tin hội viên", code: "MEM_EDIT", description: "Cập nhật email, số điện thoại, chức danh, ảnh đại diện", apiEndpoint: "PUT /api/members/:id", roles: { bqt: true, thu_ky: true, thanh_vien: true, quan_tri: true, admin: true, tong_thu_ky: true } },
          { id: "act_mem_delete", name: "Xóa / Thu hồi tư cách hội viên", code: "MEM_DELETE", description: "Xóa hoặc đình chỉ tư cách hội viên trong hiệp hội", apiEndpoint: "DELETE /api/members/:id", roles: { bqt: true, quan_tri: true, admin: true } },
          { id: "act_mem_approve", name: "Phê duyệt hồ sơ đăng ký", code: "MEM_APPROVE", description: "Duyệt hồ sơ gia nhập và cấp mã hội viên chính thức", apiEndpoint: "POST /api/members/:id/approve", roles: { bqt: true, thu_ky: true, thanh_vien: true, quan_tri: true, admin: true, tong_thu_ky: true } },
          { id: "act_mem_export", name: "Xuất file Excel danh sách", code: "MEM_EXPORT", description: "Trích xuất danh bạ hội viên phục vụ kỷ yếu và báo cáo", apiEndpoint: "GET /api/members/export", roles: { bqt: true, thu_ky: true, thanh_vien: true, quan_tri: true, admin: true, tong_thu_ky: true } },
        ],
      },
      {
        id: "feat_companies",
        name: "Doanh nghiệp",
        route: "/companies",
        description: "Quản lý pháp nhân doanh nghiệp, ngành nghề và quy mô tổ chức",
        actions: [
          { id: "act_com_view", name: "Xem danh sách & hồ sơ doanh nghiệp", code: "COM_VIEW", description: "Tra cứu thông tin công ty, mã số thuế, trụ sở", apiEndpoint: "GET /api/companies", roles: { bqt: true, thu_ky: true, thanh_vien: true, xuc_tien: true, truyen_thong: true, thien_nguyen: true, quan_tri: true, admin: true, tong_thu_ky: true, ban_thu_ky: true, member: true } },
          { id: "act_com_add", name: "Thêm mới doanh nghiệp", code: "COM_ADD", description: "Tạo hồ sơ pháp nhân doanh nghiệp mới", apiEndpoint: "POST /api/companies", roles: { bqt: true, thu_ky: true, thanh_vien: true, xuc_tien: true, quan_tri: true, admin: true } },
          { id: "act_com_edit", name: "Chỉnh sửa thông tin doanh nghiệp", code: "COM_EDIT", description: "Cập nhật ngành nghề, địa chỉ, website, logo doanh nghiệp", apiEndpoint: "PUT /api/companies/:id", roles: { bqt: true, thu_ky: true, thanh_vien: true, xuc_tien: true, quan_tri: true, admin: true } },
          { id: "act_com_delete", name: "Xóa hồ sơ doanh nghiệp", code: "COM_DELETE", description: "Xóa thông tin doanh nghiệp khỏi cơ sở dữ liệu", apiEndpoint: "DELETE /api/companies/:id", roles: { bqt: true, quan_tri: true, admin: true } },
          { id: "act_com_export", name: "Xuất danh sách doanh nghiệp", code: "COM_EXPORT", description: "Trích xuất danh sách doanh nghiệp hội viên", apiEndpoint: "GET /api/companies/export", roles: { bqt: true, thu_ky: true, thanh_vien: true, xuc_tien: true, quan_tri: true, admin: true } },
        ],
      },
      {
        id: "feat_segments",
        name: "Phân loại hội viên",
        route: "/segments",
        description: "Quản lý các nhóm phân khúc, tiêu chí hội viên và nhiệm kỳ",
        actions: [
          { id: "act_seg_view", name: "Xem danh sách phân loại hội viên", code: "SEG_VIEW", description: "Tra cứu danh sách nhóm phân loại và tiêu chí", apiEndpoint: "GET /api/segments", roles: { bqt: true, thu_ky: true, thanh_vien: true, quan_tri: true, admin: true, tong_thu_ky: true, ban_thu_ky: true } },
          { id: "act_seg_add", name: "Thêm mới phân loại hội viên", code: "SEG_ADD", description: "Khởi tạo nhóm phân khúc mới", apiEndpoint: "POST /api/segments", roles: { bqt: true, thu_ky: true, thanh_vien: true, quan_tri: true, admin: true } },
          { id: "act_seg_edit", name: "Chỉnh sửa phân loại hội viên", code: "SEG_EDIT", description: "Cập nhật tiêu chí hoặc điều kiện phân loại", apiEndpoint: "PUT /api/segments/:id", roles: { bqt: true, thu_ky: true, thanh_vien: true, quan_tri: true, admin: true } },
          { id: "act_seg_delete", name: "Xóa phân loại hội viên", code: "SEG_DELETE", description: "Xóa nhóm phân loại không còn sử dụng", apiEndpoint: "DELETE /api/segments/:id", roles: { bqt: true, quan_tri: true, admin: true } },
        ],
      },
      {
        id: "feat_renewal",
        name: "Gia hạn hội viên",
        route: "/renewal",
        description: "Quản lý chu kỳ gia hạn thẻ hội viên thường niên +365 ngày",
        actions: [
          { id: "act_ren_view", name: "Xem danh sách gia hạn hội viên", code: "REN_VIEW", description: "Xem danh sách hội viên sắp hết hạn và đã gia hạn", apiEndpoint: "GET /api/renewals", roles: { bqt: true, thu_ky: true, thanh_vien: true, quan_tri: true, admin: true, tong_thu_ky: true } },
          { id: "act_ren_process", name: "Thực hiện gia hạn (+365 ngày)", code: "REN_PROCESS", description: "Ghi nhận gia hạn niên liễm và kích hoạt lại thẻ", apiEndpoint: "POST /api/renewals/extend", roles: { bqt: true, thu_ky: true, thanh_vien: true, quan_tri: true, admin: true } },
          { id: "act_ren_edit", name: "Chỉnh sửa thông tin gia hạn", code: "REN_EDIT", description: "Điều chỉnh ngày hết hạn hoặc thời gian gia hạn", apiEndpoint: "PUT /api/renewals/:id", roles: { bqt: true, thu_ky: true, quan_tri: true, admin: true } },
          { id: "act_ren_cancel", name: "Hủy lượt gia hạn", code: "REN_CANCEL", description: "Hủy lượt gia hạn sai sót", apiEndpoint: "DELETE /api/renewals/:id", roles: { bqt: true, quan_tri: true, admin: true } },
        ],
      },
    ],
  },

  // NHÓM 2: SỰ KIỆN
  {
    id: "cat_events",
    name: "SỰ KIỆN",
    iconName: "Calendar",
    features: [
      {
        id: "feat_events",
        name: "Sự kiện",
        route: "/events",
        description: "Quản lý các chương trình sự kiện, hội thảo, đại hội và gala",
        actions: [
          { id: "act_evt_view", name: "Xem danh sách & chi tiết sự kiện", code: "EVT_VIEW", description: "Tra cứu thông tin, địa điểm, timeline sự kiện", apiEndpoint: "GET /api/events", roles: { bqt: true, thu_ky: true, thanh_vien: true, xuc_tien: true, truyen_thong: true, thien_nguyen: true, quan_tri: true, admin: true, tong_thu_ky: true, ban_thu_ky: true, member: true } },
          { id: "act_evt_add", name: "Thêm mới sự kiện", code: "EVT_ADD", description: "Tạo chương trình sự kiện mới", apiEndpoint: "POST /api/events", roles: { bqt: true, thu_ky: true, truyen_thong: true, quan_tri: true, admin: true, tong_thu_ky: true, ban_thu_ky: true } },
          { id: "act_evt_edit", name: "Chỉnh sửa thông tin sự kiện", code: "EVT_EDIT", description: "Cập nhật nội dung, thời gian, vé tham dự", apiEndpoint: "PUT /api/events/:id", roles: { bqt: true, thu_ky: true, truyen_thong: true, quan_tri: true, admin: true, tong_thu_ky: true, ban_thu_ky: true } },
          { id: "act_evt_delete", name: "Xóa / Hủy sự kiện", code: "EVT_DELETE", description: "Hủy bỏ hoặc xóa sự kiện", apiEndpoint: "DELETE /api/events/:id", roles: { bqt: true, quan_tri: true, admin: true } },
          { id: "act_evt_publish", name: "Phê duyệt & Xuất bản sự kiện", code: "EVT_PUBLISH", description: "Duyệt công khai sự kiện lên App hội viên", apiEndpoint: "PATCH /api/events/:id/publish", roles: { bqt: true, thu_ky: true, quan_tri: true, admin: true, tong_thu_ky: true } },
        ],
      },
      {
        id: "feat_events_overview",
        name: "Tổng quan sự kiện",
        route: "/events-overview",
        description: "Báo cáo thống kê tổng quát các hoạt động sự kiện hiệp hội",
        actions: [
          { id: "act_evto_view", name: "Xem tổng quan & chỉ số sự kiện", code: "EVTO_VIEW", description: "Xem biểu đồ số lượng người tham dự, tỷ lệ tham gia", apiEndpoint: "GET /api/events/overview", roles: { bqt: true, thu_ky: true, thanh_vien: true, truyen_thong: true, quan_tri: true, admin: true, tong_thu_ky: true, ban_thu_ky: true } },
          { id: "act_evto_export", name: "Xuất báo cáo tổng quan sự kiện", code: "EVTO_EXPORT", description: "Xuất file thống kê sự kiện theo quý/năm", apiEndpoint: "GET /api/events/overview/export", roles: { bqt: true, thu_ky: true, quan_tri: true, admin: true, tong_thu_ky: true } },
        ],
      },
      {
        id: "feat_meetings",
        name: "Cuộc họp",
        route: "/meetings",
        description: "Quản lý cuộc họp ban, họp BCH trực tuyến/trực tiếp và đặt phòng họp",
        actions: [
          { id: "act_meet_view", name: "Xem danh sách cuộc họp", code: "MEET_VIEW", description: "Tra cứu lịch họp, phòng họp Sapphire, Zoom/Meet", apiEndpoint: "GET /api/meetings", roles: { bqt: true, thu_ky: true, thanh_vien: true, xuc_tien: true, truyen_thong: true, thien_nguyen: true, quan_tri: true, admin: true, tong_thu_ky: true, ban_thu_ky: true, member: true } },
          { id: "act_meet_add", name: "Tạo cuộc họp mới", code: "MEET_ADD", description: "Khởi tạo cuộc họp ban kèm đăng ký phòng họp", apiEndpoint: "POST /api/meetings", roles: { bqt: true, thu_ky: true, thanh_vien: true, xuc_tien: true, truyen_thong: true, thien_nguyen: true, quan_tri: true, admin: true, tong_thu_ky: true, ban_thu_ky: true } },
          { id: "act_meet_edit", name: "Chỉnh sửa thông tin cuộc họp", code: "MEET_EDIT", description: "Điều chỉnh thời gian, đường link, đại biểu tham dự", apiEndpoint: "PUT /api/meetings/:id", roles: { bqt: true, thu_ky: true, quan_tri: true, admin: true, tong_thu_ky: true, ban_thu_ky: true } },
          { id: "act_meet_delete", name: "Xóa / Hủy cuộc họp", code: "MEET_DELETE", description: "Hủy bỏ lịch họp và giải phóng phòng", apiEndpoint: "DELETE /api/meetings/:id", roles: { bqt: true, thu_ky: true, quan_tri: true, admin: true } },
          { id: "act_meet_approve", name: "Phê duyệt cuộc họp", code: "MEET_APPROVE", description: "Duyệt cuộc họp của ban đề xuất gửi lên Quản trị", apiEndpoint: "PATCH /api/meetings/:id/approve", roles: { bqt: true, quan_tri: true, admin: true } },
        ],
      },
      {
        id: "feat_voting",
        name: "Biểu quyết",
        route: "/voting",
        description: "Quản lý các kỳ bỏ phiếu kín, bầu cử đại hội và biểu quyết nghị quyết",
        actions: [
          { id: "act_vote_view", name: "Xem danh sách kỳ biểu quyết", code: "VOTE_VIEW", description: "Xem nội dung biểu quyết và kết quả công bố", apiEndpoint: "GET /api/voting", roles: { bqt: true, thu_ky: true, thanh_vien: true, xuc_tien: true, truyen_thong: true, thien_nguyen: true, quan_tri: true, admin: true, tong_thu_ky: true, ban_thu_ky: true, member: true } },
          { id: "act_vote_add", name: "Tạo mới phiên biểu quyết", code: "VOTE_ADD", description: "Thiết lập kỳ bỏ phiếu mới kèm phương án lựa chọn", apiEndpoint: "POST /api/voting", roles: { bqt: true, thu_ky: true, quan_tri: true, admin: true, tong_thu_ky: true } },
          { id: "act_vote_edit", name: "Chỉnh sửa phiên biểu quyết", code: "VOTE_EDIT", description: "Cập nhật ứng viên hoặc thể lệ biểu quyết", apiEndpoint: "PUT /api/voting/:id", roles: { bqt: true, thu_ky: true, quan_tri: true, admin: true, tong_thu_ky: true } },
          { id: "act_vote_delete", name: "Xóa phiên biểu quyết", code: "VOTE_DELETE", description: "Xóa phiên biểu quyết sai sót", apiEndpoint: "DELETE /api/voting/:id", roles: { bqt: true, quan_tri: true, admin: true } },
          { id: "act_vote_close", name: "Khóa sổ & Xuất biên bản kết quả", code: "VOTE_CLOSE", description: "Đóng cổng bỏ phiếu và xuất biên bản kiểm phiếu", apiEndpoint: "POST /api/voting/:id/close", roles: { bqt: true, thu_ky: true, quan_tri: true, admin: true, tong_thu_ky: true } },
        ],
      },
      {
        id: "feat_event_registrations",
        name: "Đăng ký sự kiện",
        route: "/event-registrations",
        description: "Quản lý danh sách khách mời và đại biểu đăng ký tham gia sự kiện",
        actions: [
          { id: "act_ereg_view", name: "Xem danh sách đăng ký sự kiện", code: "EREG_VIEW", description: "Xem thông tin đại biểu đã đăng ký vé tham dự", apiEndpoint: "GET /api/event-registrations", roles: { bqt: true, thu_ky: true, thanh_vien: true, truyen_thong: true, quan_tri: true, admin: true, tong_thu_ky: true, ban_thu_ky: true } },
          { id: "act_ereg_approve", name: "Phê duyệt đăng ký tham gia", code: "EREG_APPROVE", description: "Xác nhận duyệt vé cho đại biểu", apiEndpoint: "PATCH /api/event-registrations/:id/approve", roles: { bqt: true, thu_ky: true, truyen_thong: true, quan_tri: true, admin: true, tong_thu_ky: true } },
          { id: "act_ereg_edit", name: "Chỉnh sửa thông tin đăng ký", code: "EREG_EDIT", description: "Điều chỉnh số lượng ghế hoặc thông tin người đi kèm", apiEndpoint: "PUT /api/event-registrations/:id", roles: { bqt: true, thu_ky: true, truyen_thong: true, quan_tri: true, admin: true } },
          { id: "act_ereg_delete", name: "Xóa / Hủy đăng ký", code: "EREG_DELETE", description: "Hủy bỏ đăng ký của đại biểu", apiEndpoint: "DELETE /api/event-registrations/:id", roles: { bqt: true, thu_ky: true, quan_tri: true, admin: true } },
          { id: "act_ereg_export", name: "Xuất danh sách đại biểu", code: "EREG_EXPORT", description: "Trích xuất file danh sách khách mời tham dự", apiEndpoint: "GET /api/event-registrations/export", roles: { bqt: true, thu_ky: true, thanh_vien: true, truyen_thong: true, quan_tri: true, admin: true, tong_thu_ky: true } },
        ],
      },
      {
        id: "feat_lucky_draw",
        name: "Bốc thăm trúng thưởng",
        route: "/lucky-draw",
        description: "Quản lý chương trình quay số may mắn, cơ cấu giải thưởng sự kiện và trao quà",
        actions: [
          { id: "act_lkd_view", name: "Xem danh sách chương trình bốc thăm", code: "LKD_VIEW", description: "Xem thể lệ, giải thưởng và danh sách người trúng giải", apiEndpoint: "GET /api/lucky-draw", roles: { bqt: true, thu_ky: true, thanh_vien: true, xuc_tien: true, truyen_thong: true, thien_nguyen: true, quan_tri: true, admin: true, tong_thu_ky: true, ban_thu_ky: true, member: true } },
          { id: "act_lkd_spin", name: "Thực hiện quay số & Bốc thăm", code: "LKD_SPIN", description: "Kích hoạt vòng quay bốc thăm trực tiếp trên sân khấu", apiEndpoint: "POST /api/lucky-draw/spin", roles: { bqt: true, thu_ky: true, truyen_thong: true, quan_tri: true, admin: true, tong_thu_ky: true } },
          { id: "act_lkd_edit", name: "Cấu hình giải thưởng & Thể lệ", code: "LKD_EDIT", description: "Thiết lập cơ cấu giải thưởng và phần quà", apiEndpoint: "PUT /api/lucky-draw/:id", roles: { bqt: true, thu_ky: true, truyen_thong: true, quan_tri: true, admin: true, tong_thu_ky: true } },
        ],
      },
    ],
  },

  // NHÓM 3: TÀI TRỢ
  {
    id: "cat_sponsors",
    name: "TÀI TRỢ",
    iconName: "Handshake",
    features: [
      {
        id: "feat_sponsors",
        name: "Nhà tài trợ",
        route: "/sponsors",
        description: "Quản lý danh sách các doanh nghiệp tài trợ kim cương, vàng, bạc",
        actions: [
          { id: "act_spn_view", name: "Xem danh sách nhà tài trợ", code: "SPN_VIEW", description: "Tra cứu thông tin nhà tài trợ và hạng mức tài trợ", apiEndpoint: "GET /api/sponsors", roles: { bqt: true, thu_ky: true, xuc_tien: true, truyen_thong: true, quan_tri: true, admin: true, tong_thu_ky: true, ban_thu_ky: true, member: true } },
          { id: "act_spn_add", name: "Thêm mới nhà tài trợ", code: "SPN_ADD", description: "Tiếp nhận doanh nghiệp tài trợ mới", apiEndpoint: "POST /api/sponsors", roles: { bqt: true, thu_ky: true, xuc_tien: true, quan_tri: true, admin: true, tong_thu_ky: true } },
          { id: "act_spn_edit", name: "Chỉnh sửa thông tin tài trợ", code: "SPN_EDIT", description: "Cập nhật hợp đồng, logo, giá trị tài trợ", apiEndpoint: "PUT /api/sponsors/:id", roles: { bqt: true, thu_ky: true, xuc_tien: true, quan_tri: true, admin: true, tong_thu_ky: true } },
          { id: "act_spn_delete", name: "Xóa nhà tài trợ", code: "SPN_DELETE", description: "Xóa thông tin nhà tài trợ khỏi sự kiện", apiEndpoint: "DELETE /api/sponsors/:id", roles: { bqt: true, quan_tri: true, admin: true } },
          { id: "act_spn_approve", name: "Phê duyệt quyền lợi hiển thị logo", code: "SPN_APPROVE", description: "Duyệt kích hoạt banner và vị trí logo nhà tài trợ", apiEndpoint: "PATCH /api/sponsors/:id/approve", roles: { bqt: true, truyen_thong: true, quan_tri: true, admin: true } },
        ],
      },
      {
        id: "feat_sponsor_packages",
        name: "Gói tài trợ",
        route: "/sponsor-packages",
        description: "Cấu hình danh mục các gói tài trợ và quyền lợi đối ứng",
        actions: [
          { id: "act_spk_view", name: "Xem danh mục gói tài trợ", code: "SPK_VIEW", description: "Xem giá trị định mức và quyền lợi các gói", apiEndpoint: "GET /api/sponsor-packages", roles: { bqt: true, thu_ky: true, xuc_tien: true, truyen_thong: true, quan_tri: true, admin: true, tong_thu_ky: true, ban_thu_ky: true } },
          { id: "act_spk_add", name: "Tạo gói tài trợ mới", code: "SPK_ADD", description: "Thiết lập gói tài trợ kèm danh mục quyền lợi", apiEndpoint: "POST /api/sponsor-packages", roles: { bqt: true, thu_ky: true, xuc_tien: true, quan_tri: true, admin: true } },
          { id: "act_spk_edit", name: "Chỉnh sửa gói tài trợ", code: "SPK_EDIT", description: "Điều chỉnh mức phí và quyền lợi đối ứng", apiEndpoint: "PUT /api/sponsor-packages/:id", roles: { bqt: true, thu_ky: true, xuc_tien: true, quan_tri: true, admin: true } },
          { id: "act_spk_delete", name: "Xóa gói tài trợ", code: "SPK_DELETE", description: "Xóa gói tài trợ không còn áp dụng", apiEndpoint: "DELETE /api/sponsor-packages/:id", roles: { bqt: true, quan_tri: true, admin: true } },
        ],
      },
      {
        id: "feat_sponsor_report",
        name: "Báo cáo tài trợ",
        route: "/sponsor-report",
        description: "Báo cáo tổng hợp tiến độ giải ngân và nghiệm thu quyền lợi tài trợ",
        actions: [
          { id: "act_srp_view", name: "Xem báo cáo nghiệm thu tài trợ", code: "SRP_VIEW", description: "Xem số lượt hiển thị banner và tương tác của nhà tài trợ", apiEndpoint: "GET /api/sponsor-reports", roles: { bqt: true, thu_ky: true, xuc_tien: true, truyen_thong: true, quan_tri: true, admin: true, tong_thu_ky: true } },
          { id: "act_srp_export", name: "Xuất báo cáo tài trợ", code: "SRP_EXPORT", description: "Trích xuất file báo cáo nghiệm thu cho nhà tài trợ", apiEndpoint: "GET /api/sponsor-reports/export", roles: { bqt: true, thu_ky: true, xuc_tien: true, quan_tri: true, admin: true, tong_thu_ky: true } },
        ],
      },
    ],
  },

  // NHÓM 4: TÀI CHÍNH
  {
    id: "cat_finance",
    name: "TÀI CHÍNH",
    iconName: "Wallet",
    features: [
      {
        id: "feat_fees",
        name: "Hội phí",
        route: "/fees",
        description: "Quản lý niên liễm hội viên, hóa đơn thu tiền và đối soát VietQR",
        actions: [
          { id: "act_fee_view", name: "Xem danh sách hội phí & công nợ", code: "FEE_VIEW", description: "Xem ai đã nộp, chưa nộp và số tiền hội phí", apiEndpoint: "GET /api/fees", roles: { bqt: true, thu_ky: true, thanh_vien: true, quan_tri: true, admin: true, tong_thu_ky: true } },
          { id: "act_fee_add", name: "Lập hóa đơn thu hội phí", code: "FEE_ADD", description: "Tạo phiếu thu hội phí cho hội viên", apiEndpoint: "POST /api/fees", roles: { bqt: true, thu_ky: true, quan_tri: true, admin: true } },
          { id: "act_fee_edit", name: "Chỉnh sửa hóa đơn hội phí", code: "FEE_EDIT", description: "Điều chỉnh số tiền, hạn thanh toán hoặc miễn giảm", apiEndpoint: "PUT /api/fees/:id", roles: { bqt: true, thu_ky: true, quan_tri: true, admin: true } },
          { id: "act_fee_delete", name: "Xóa / Hủy hóa đơn", code: "FEE_DELETE", description: "Hủy phiếu thu lập sai sót", apiEndpoint: "DELETE /api/fees/:id", roles: { bqt: true, quan_tri: true, admin: true } },
          { id: "act_fee_reconcile", name: "Đối soát thanh toán VietQR", code: "FEE_RECONCILE", description: "Kiểm tra gạch nợ tự động qua ngân hàng", apiEndpoint: "POST /api/fees/reconcile", roles: { bqt: true, quan_tri: true, admin: true } },
        ],
      },
      {
        id: "feat_income",
        name: "Quản lý Thu",
        route: "/income",
        description: "Quản lý tất cả các nguồn thu từ hội phí, tài trợ, bán vé sự kiện",
        actions: [
          { id: "act_inc_view", name: "Xem danh sách phiếu thu", code: "INC_VIEW", description: "Xem tổng hợp các khoản tiền thu về của quỹ", apiEndpoint: "GET /api/income", roles: { bqt: true, thu_ky: true, quan_tri: true, admin: true, tong_thu_ky: true } },
          { id: "act_inc_add", name: "Lập phiếu thu mới", code: "INC_ADD", description: "Ghi nhận khoản thu phát sinh vào sổ quỹ", apiEndpoint: "POST /api/income", roles: { bqt: true, thu_ky: true, quan_tri: true, admin: true } },
          { id: "act_inc_edit", name: "Chỉnh sửa phiếu thu", code: "INC_EDIT", description: "Cập nhật chứng từ, nội dung thu tiền", apiEndpoint: "PUT /api/income/:id", roles: { bqt: true, thu_ky: true, quan_tri: true, admin: true } },
          { id: "act_inc_delete", name: "Xóa phiếu thu", code: "INC_DELETE", description: "Xóa phiếu thu không hợp lệ", apiEndpoint: "DELETE /api/income/:id", roles: { bqt: true, quan_tri: true, admin: true } },
          { id: "act_inc_export", name: "Xuất danh sách phiếu thu", code: "INC_EXPORT", description: "Xuất dữ liệu thu tiền ra file Excel", apiEndpoint: "GET /api/income/export", roles: { bqt: true, thu_ky: true, quan_tri: true, admin: true } },
        ],
      },
      {
        id: "feat_expenses",
        name: "Quản lý Chi",
        route: "/expenses",
        description: "Quản lý các khoản chi tiêu tổ chức sự kiện, thiện nguyện, hành chính",
        actions: [
          { id: "act_exp_view", name: "Xem danh sách phiếu chi", code: "EXP_VIEW", description: "Tra cứu các khoản giải ngân và chi tiêu nội bộ", apiEndpoint: "GET /api/expenses", roles: { bqt: true, thu_ky: true, quan_tri: true, admin: true, tong_thu_ky: true } },
          { id: "act_exp_add", name: "Lập đề xuất / Phiếu chi mới", code: "EXP_ADD", description: "Tạo phiếu chi tiền kèm hóa đơn chứng từ", apiEndpoint: "POST /api/expenses", roles: { bqt: true, thu_ky: true, thanh_vien: true, xuc_tien: true, truyen_thong: true, thien_nguyen: true, quan_tri: true, admin: true, tong_thu_ky: true, ban_thu_ky: true } },
          { id: "act_exp_edit", name: "Chỉnh sửa phiếu chi", code: "EXP_EDIT", description: "Cập nhật thông tin phiếu chi", apiEndpoint: "PUT /api/expenses/:id", roles: { bqt: true, thu_ky: true, quan_tri: true, admin: true } },
          { id: "act_exp_delete", name: "Xóa phiếu chi", code: "EXP_DELETE", description: "Hủy phiếu chi không được thông qua", apiEndpoint: "DELETE /api/expenses/:id", roles: { bqt: true, quan_tri: true, admin: true } },
          { id: "act_exp_approve", name: "Phê duyệt phiếu chi", code: "EXP_APPROVE", description: "Ký duyệt chi tiền từ tài khoản quỹ", apiEndpoint: "PATCH /api/expenses/:id/approve", roles: { bqt: true, quan_tri: true, admin: true } },
        ],
      },
      {
        id: "feat_finance_report",
        name: "Báo cáo tài chính",
        route: "/finance-report",
        description: "Bảng cân đối thu chi, sao kê quỹ minh bạch và báo cáo tài chính",
        actions: [
          { id: "act_frp_view", name: "Xem báo cáo tài chính & quỹ", code: "FRP_VIEW", description: "Xem tổng số dư tồn quỹ và biểu đồ dòng tiền", apiEndpoint: "GET /api/finance-reports", roles: { bqt: true, thu_ky: true, quan_tri: true, admin: true, tong_thu_ky: true } },
          { id: "act_frp_export", name: "Xuất báo cáo tài chính kiểm toán", code: "FRP_EXPORT", description: "Xuất bảng cân đối thu chi cho BQT và BCH", apiEndpoint: "GET /api/finance-reports/export", roles: { bqt: true, thu_ky: true, quan_tri: true, admin: true } },
        ],
      },
    ],
  },

  // NHÓM 5: TRUYỀN THÔNG
  {
    id: "cat_comm",
    name: "TRUYỀN THÔNG",
    iconName: "Newspaper",
    features: [
      {
        id: "feat_notifications",
        name: "Thông báo",
        route: "/notifications",
        description: "Hệ thống thông báo đẩy (Push Notifications) và chuông thông báo In-App",
        actions: [
          { id: "act_ntf_view", name: "Xem danh sách thông báo", code: "NTF_VIEW", description: "Xem các thông báo đã gửi trong hệ thống", apiEndpoint: "GET /api/notifications", roles: { bqt: true, thu_ky: true, thanh_vien: true, xuc_tien: true, truyen_thong: true, thien_nguyen: true, quan_tri: true, admin: true, tong_thu_ky: true, ban_thu_ky: true, member: true } },
          { id: "act_ntf_send", name: "Gửi thông báo mới (Push / In-App)", code: "NTF_SEND", description: "Bắn thông báo tức thì tới toàn thể hoặc theo ban", apiEndpoint: "POST /api/notifications", roles: { bqt: true, thu_ky: true, truyen_thong: true, quan_tri: true, admin: true, tong_thu_ky: true, ban_thu_ky: true } },
          { id: "act_ntf_edit", name: "Chỉnh sửa thông báo", code: "NTF_EDIT", description: "Cập nhật tiêu đề hoặc nội dung thông báo", apiEndpoint: "PUT /api/notifications/:id", roles: { bqt: true, thu_ky: true, truyen_thong: true, quan_tri: true, admin: true } },
          { id: "act_ntf_delete", name: "Xóa / Thu hồi thông báo", code: "NTF_DELETE", description: "Xóa thông báo đã gửi", apiEndpoint: "DELETE /api/notifications/:id", roles: { bqt: true, quan_tri: true, admin: true } },
        ],
      },
      {
        id: "feat_email_marketing",
        name: "Email marketing",
        route: "/email-marketing",
        description: "Gửi email hàng loạt theo mẫu thư mời, thư chúc mừng và bản tin",
        actions: [
          { id: "act_eml_view", name: "Xem chiến dịch email marketing", code: "EML_VIEW", description: "Xem danh sách chiến dịch và tỷ lệ mở email", apiEndpoint: "GET /api/email-campaigns", roles: { bqt: true, thu_ky: true, truyen_thong: true, quan_tri: true, admin: true, tong_thu_ky: true } },
          { id: "act_eml_add", name: "Tạo chiến dịch email mới", code: "EML_ADD", description: "Thiết kế nội dung email và chọn danh sách gửi", apiEndpoint: "POST /api/email-campaigns", roles: { bqt: true, thu_ky: true, truyen_thong: true, quan_tri: true, admin: true, tong_thu_ky: true } },
          { id: "act_eml_edit", name: "Chỉnh sửa chiến dịch email", code: "EML_EDIT", description: "Điều chỉnh mẫu template hoặc thời gian gửi", apiEndpoint: "PUT /api/email-campaigns/:id", roles: { bqt: true, thu_ky: true, truyen_thong: true, quan_tri: true, admin: true } },
          { id: "act_eml_delete", name: "Xóa chiến dịch email", code: "EML_DELETE", description: "Hủy chiến dịch email chưa gửi", apiEndpoint: "DELETE /api/email-campaigns/:id", roles: { bqt: true, quan_tri: true, admin: true } },
          { id: "act_eml_send", name: "Phát hành email hàng loạt", code: "EML_SEND", description: "Thực thi gửi email tức thì tới hàng nghìn hội viên", apiEndpoint: "POST /api/email-campaigns/:id/send", roles: { bqt: true, truyen_thong: true, quan_tri: true, admin: true } },
        ],
      },
      {
        id: "feat_news",
        name: "Tin tức",
        route: "/news",
        description: "Quản lý cổng tin tức, bài viết hoạt động và vinh danh doanh nghiệp",
        actions: [
          { id: "act_nws_view", name: "Xem danh sách tin tức & bài viết", code: "NWS_VIEW", description: "Đọc bài viết và lượt tương tác bài", apiEndpoint: "GET /api/news", roles: { bqt: true, thu_ky: true, thanh_vien: true, xuc_tien: true, truyen_thong: true, thien_nguyen: true, quan_tri: true, admin: true, tong_thu_ky: true, ban_thu_ky: true, member: true } },
          { id: "act_nws_add", name: "Thêm bài viết mới", code: "NWS_ADD", description: "Soạn thảo bài viết kèm ảnh và video", apiEndpoint: "POST /api/news", roles: { bqt: true, thu_ky: true, truyen_thong: true, quan_tri: true, admin: true, tong_thu_ky: true, ban_thu_ky: true } },
          { id: "act_nws_edit", name: "Chỉnh sửa bài viết", code: "NWS_EDIT", description: "Cập nhật nội dung bài viết tin tức", apiEndpoint: "PUT /api/news/:id", roles: { bqt: true, thu_ky: true, truyen_thong: true, quan_tri: true, admin: true, tong_thu_ky: true } },
          { id: "act_nws_delete", name: "Xóa bài viết", code: "NWS_DELETE", description: "Xóa bài viết khỏi trang tin", apiEndpoint: "DELETE /api/news/:id", roles: { bqt: true, quan_tri: true, admin: true } },
          { id: "act_nws_publish", name: "Phê duyệt & Xuất bản tin tức", code: "NWS_PUBLISH", description: "Bật hiển thị tin tức lên trang chủ App", apiEndpoint: "PATCH /api/news/:id/publish", roles: { bqt: true, truyen_thong: true, quan_tri: true, admin: true } },
        ],
      },
      {
        id: "feat_perks",
        name: "Tiện ích",
        route: "/perks",
        description: "Quản lý các tiện ích ưu đãi đặc quyền dành riêng cho hội viên",
        actions: [
          { id: "act_prk_view", name: "Xem danh sách tiện ích", code: "PRK_VIEW", description: "Xem các tiện ích dịch vụ, phòng chờ VIP, sân golf", apiEndpoint: "GET /api/perks", roles: { bqt: true, thu_ky: true, thanh_vien: true, xuc_tien: true, truyen_thong: true, thien_nguyen: true, quan_tri: true, admin: true, tong_thu_ky: true, ban_thu_ky: true, member: true } },
          { id: "act_prk_add", name: "Thêm tiện ích mới", code: "PRK_ADD", description: "Tạo dịch vụ tiện ích mới cho hiệp hội", apiEndpoint: "POST /api/perks", roles: { bqt: true, thu_ky: true, thanh_vien: true, quan_tri: true, admin: true } },
          { id: "act_prk_edit", name: "Chỉnh sửa tiện ích", code: "PRK_EDIT", description: "Cập nhật điều kiện sử dụng tiện ích", apiEndpoint: "PUT /api/perks/:id", roles: { bqt: true, thu_ky: true, thanh_vien: true, quan_tri: true, admin: true } },
          { id: "act_prk_delete", name: "Xóa tiện ích", code: "PRK_DELETE", description: "Xóa tiện ích không còn hiệu lực", apiEndpoint: "DELETE /api/perks/:id", roles: { bqt: true, quan_tri: true, admin: true } },
        ],
      },
      {
        id: "feat_benefits",
        name: "Quyền lợi hội viên",
        route: "/benefits",
        description: "Quản lý chính sách quyền lợi các hạng thẻ hội viên",
        actions: [
          { id: "act_bnf_view", name: "Xem danh sách quyền lợi", code: "BNF_VIEW", description: "Tra cứu quyền lợi theo từng hạng thẻ hội viên", apiEndpoint: "GET /api/benefits", roles: { bqt: true, thu_ky: true, thanh_vien: true, xuc_tien: true, truyen_thong: true, thien_nguyen: true, quan_tri: true, admin: true, tong_thu_ky: true, ban_thu_ky: true, member: true } },
          { id: "act_bnf_add", name: "Thêm quyền lợi mới", code: "BNF_ADD", description: "Bổ sung chính sách quyền lợi mới", apiEndpoint: "POST /api/benefits", roles: { bqt: true, thu_ky: true, thanh_vien: true, quan_tri: true, admin: true } },
          { id: "act_bnf_edit", name: "Chỉnh sửa quyền lợi", code: "BNF_EDIT", description: "Điều chỉnh nội dung quyền lợi", apiEndpoint: "PUT /api/benefits/:id", roles: { bqt: true, thu_ky: true, thanh_vien: true, quan_tri: true, admin: true } },
          { id: "act_bnf_delete", name: "Xóa quyền lợi", code: "BNF_DELETE", description: "Xóa chính sách quyền lợi", apiEndpoint: "DELETE /api/benefits/:id", roles: { bqt: true, quan_tri: true, admin: true } },
        ],
      },
    ],
  },

  // NHÓM 6: KẾT NỐI
  {
    id: "cat_network",
    name: "KẾT NỐI",
    iconName: "Store",
    features: [
      {
        id: "feat_network",
        name: "Kết nối hội viên",
        route: "/network",
        description: "Mạng lưới kết nối giao lưu giữa các doanh nhân đồng niên 1983",
        actions: [
          { id: "act_net_view", name: "Xem mạng lưới kết nối", code: "NET_VIEW", description: "Tra cứu kết nối và sơ đồ quan hệ hội viên", apiEndpoint: "GET /api/network", roles: { bqt: true, thu_ky: true, thanh_vien: true, xuc_tien: true, truyen_thong: true, thien_nguyen: true, quan_tri: true, admin: true, tong_thu_ky: true, ban_thu_ky: true, member: true } },
          { id: "act_net_connect", name: "Khởi tạo kết nối & Nhắn tin B2B", code: "NET_CONNECT", description: "Gửi lời mời kết nối trực tiếp đến doanh nghiệp", apiEndpoint: "POST /api/network/connect", roles: { bqt: true, thu_ky: true, thanh_vien: true, xuc_tien: true, truyen_thong: true, thien_nguyen: true, quan_tri: true, admin: true, tong_thu_ky: true, ban_thu_ky: true, member: true } },
          { id: "act_net_export", name: "Xuất dữ liệu kết nối", code: "NET_EXPORT", description: "Xuất file danh bạ mạng lưới kết nối", apiEndpoint: "GET /api/network/export", roles: { bqt: true, thu_ky: true, xuc_tien: true, quan_tri: true, admin: true, tong_thu_ky: true } },
        ],
      },
      {
        id: "feat_bc_meetings",
        name: "Cuộc gặp",
        route: "/business-connect/meetings",
        description: "Quản lý các cuộc hẹn gặp kết nối 1-on-1 Business Connect giữa các CEO",
        actions: [
          { id: "act_bcm_view", name: "Xem danh sách cuộc hẹn gặp", code: "BCM_VIEW", description: "Tra cứu lịch hẹn gặp 1-1 giữa các hội viên", apiEndpoint: "GET /api/business-connect/meetings", roles: { bqt: true, thu_ky: true, thanh_vien: true, xuc_tien: true, truyen_thong: true, thien_nguyen: true, quan_tri: true, admin: true, tong_thu_ky: true, ban_thu_ky: true, member: true } },
          { id: "act_bcm_add", name: "Tạo lịch hẹn gặp mới", code: "BCM_ADD", description: "Đặt lịch hẹn gặp giao lưu trực tiếp", apiEndpoint: "POST /api/business-connect/meetings", roles: { bqt: true, thu_ky: true, thanh_vien: true, xuc_tien: true, truyen_thong: true, thien_nguyen: true, quan_tri: true, admin: true, tong_thu_ky: true, ban_thu_ky: true, member: true } },
          { id: "act_bcm_edit", name: "Chỉnh sửa lịch hẹn gặp", code: "BCM_EDIT", description: "Đổi thời gian hoặc địa điểm hẹn gặp", apiEndpoint: "PUT /api/business-connect/meetings/:id", roles: { bqt: true, thu_ky: true, quan_tri: true, admin: true, tong_thu_ky: true, ban_thu_ky: true, member: true } },
          { id: "act_bcm_delete", name: "Hủy cuộc hẹn gặp", code: "BCM_DELETE", description: "Hủy lịch hẹn gặp", apiEndpoint: "DELETE /api/business-connect/meetings/:id", roles: { bqt: true, thu_ky: true, quan_tri: true, admin: true, tong_thu_ky: true, ban_thu_ky: true, member: true } },
        ],
      },
      {
        id: "feat_marketplace",
        name: "Marketplace",
        route: "/marketplace",
        description: "Sàn giao dịch sản phẩm dịch vụ ưu đãi nội bộ của các doanh nghiệp hội viên",
        actions: [
          { id: "act_mkt_view", name: "Xem sản phẩm gian hàng", code: "MKT_VIEW", description: "Tra cứu sản phẩm, giá bán, chính sách chiết khấu", apiEndpoint: "GET /api/marketplace", roles: { bqt: true, thu_ky: true, thanh_vien: true, xuc_tien: true, truyen_thong: true, thien_nguyen: true, quan_tri: true, admin: true, tong_thu_ky: true, ban_thu_ky: true, member: true } },
          { id: "act_mkt_add", name: "Đăng sản phẩm mới", code: "MKT_ADD", description: "Đưa sản phẩm lên gian hàng sàn Marketplace", apiEndpoint: "POST /api/marketplace", roles: { bqt: true, thu_ky: true, thanh_vien: true, xuc_tien: true, quan_tri: true, admin: true, tong_thu_ky: true, ban_thu_ky: true, member: true } },
          { id: "act_mkt_edit", name: "Chỉnh sửa thông tin sản phẩm", code: "MKT_EDIT", description: "Cập nhật hình ảnh, giá bán, chiết khấu", apiEndpoint: "PUT /api/marketplace/:id", roles: { bqt: true, thu_ky: true, xuc_tien: true, quan_tri: true, admin: true, tong_thu_ky: true, ban_thu_ky: true, member: true } },
          { id: "act_mkt_delete", name: "Xóa sản phẩm", code: "MKT_DELETE", description: "Gỡ bỏ sản phẩm khỏi sàn", apiEndpoint: "DELETE /api/marketplace/:id", roles: { bqt: true, xuc_tien: true, quan_tri: true, admin: true } },
          { id: "act_mkt_approve", name: "Thẩm định & Phê duyệt sản phẩm", code: "MKT_APPROVE", description: "Kiểm duyệt xuất bản sản phẩm lên Marketplace", apiEndpoint: "PATCH /api/marketplace/:id/approve", roles: { bqt: true, xuc_tien: true, quan_tri: true, admin: true } },
        ],
      },
      {
        id: "feat_opportunities",
        name: "Chia sẻ cơ hội",
        route: "/opportunities",
        description: "Sàn giao thương B2B, trao đổi nhu cầu hợp tác kinh doanh và tìm đối tác",
        actions: [
          { id: "act_opp_view", name: "Xem sàn cơ hội giao thương", code: "OPP_VIEW", description: "Xem nhu cầu chào mua, chào bán của các doanh nghiệp", apiEndpoint: "GET /api/opportunities", roles: { bqt: true, thu_ky: true, thanh_vien: true, xuc_tien: true, truyen_thong: true, thien_nguyen: true, quan_tri: true, admin: true, tong_thu_ky: true, ban_thu_ky: true, member: true } },
          { id: "act_opp_add", name: "Đăng cơ hội hợp tác mới", code: "OPP_ADD", description: "Tạo tin đăng nhu cầu hợp tác kinh doanh", apiEndpoint: "POST /api/opportunities", roles: { bqt: true, thu_ky: true, thanh_vien: true, xuc_tien: true, truyen_thong: true, thien_nguyen: true, quan_tri: true, admin: true, tong_thu_ky: true, ban_thu_ky: true, member: true } },
          { id: "act_opp_edit", name: "Chỉnh sửa cơ hội", code: "OPP_EDIT", description: "Cập nhật yêu cầu hoặc thời hạn cơ hội", apiEndpoint: "PUT /api/opportunities/:id", roles: { bqt: true, thu_ky: true, xuc_tien: true, quan_tri: true, admin: true, tong_thu_ky: true, ban_thu_ky: true, member: true } },
          { id: "act_opp_delete", name: "Xóa / Đóng cơ hội", code: "OPP_DELETE", description: "Đóng cơ hội khi đã hoàn thành giao dịch", apiEndpoint: "DELETE /api/opportunities/:id", roles: { bqt: true, xuc_tien: true, quan_tri: true, admin: true } },
          { id: "act_opp_approve", name: "Duyệt & Gán nhãn cơ hội tiêu biểu", code: "OPP_APPROVE", description: "Xác thực và đưa cơ hội lên trang nhất", apiEndpoint: "PATCH /api/opportunities/:id/approve", roles: { bqt: true, xuc_tien: true, quan_tri: true, admin: true } },
        ],
      },
    ],
  },

  // NHÓM 7: HỆ THỐNG
  {
    id: "cat_system",
    name: "HỆ THỐNG",
    iconName: "Settings",
    features: [
      {
        id: "feat_tasks",
        name: "Quản lý công việc",
        route: "/tasks",
        description: "Quản lý nhiệm vụ, phân công công việc các ban và theo dõi tiến độ",
        actions: [
          { id: "act_tsk_view", name: "Xem danh sách công việc", code: "TSK_VIEW", description: "Xem các đầu việc được giao của ban và cá nhân", apiEndpoint: "GET /api/tasks", roles: { bqt: true, thu_ky: true, thanh_vien: true, xuc_tien: true, truyen_thong: true, thien_nguyen: true, quan_tri: true, admin: true, tong_thu_ky: true, ban_thu_ky: true, member: true } },
          { id: "act_tsk_add", name: "Tạo nhiệm vụ mới", code: "TSK_ADD", description: "Khởi tạo công việc và gán người phụ trách", apiEndpoint: "POST /api/tasks", roles: { bqt: true, thu_ky: true, thanh_vien: true, xuc_tien: true, truyen_thong: true, thien_nguyen: true, quan_tri: true, admin: true, tong_thu_ky: true, ban_thu_ky: true } },
          { id: "act_tsk_edit", name: "Chỉnh sửa & Giao việc", code: "TSK_EDIT", description: "Cập nhật deadline, mô tả công việc", apiEndpoint: "PUT /api/tasks/:id", roles: { bqt: true, thu_ky: true, thanh_vien: true, xuc_tien: true, truyen_thong: true, thien_nguyen: true, quan_tri: true, admin: true, tong_thu_ky: true, ban_thu_ky: true } },
          { id: "act_tsk_delete", name: "Xóa nhiệm vụ", code: "TSK_DELETE", description: "Xóa nhiệm vụ", apiEndpoint: "DELETE /api/tasks/:id", roles: { bqt: true, thu_ky: true, quan_tri: true, admin: true, tong_thu_ky: true, ban_thu_ky: true } },
        ],
      },
      {
        id: "feat_settings",
        name: "Cài đặt",
        route: "/settings",
        description: "Cấu hình thông tin hiệp hội, thông số hệ thống và bảo mật",
        actions: [
          { id: "act_set_view", name: "Xem cấu hình cài đặt", code: "SET_VIEW", description: "Xem thông số hệ thống, cổng thanh toán, SMS", apiEndpoint: "GET /api/settings", roles: { bqt: true, thu_ky: true, quan_tri: true, admin: true } },
          { id: "act_set_edit", name: "Cập nhật cài đặt hệ thống", code: "SET_EDIT", description: "Thay đổi thông số và cấu hình hiệp hội", apiEndpoint: "PUT /api/settings", roles: { bqt: true, quan_tri: true, admin: true } },
        ],
      },
      {
        id: "feat_activity",
        name: "Nhật ký hoạt động",
        route: "/activity",
        description: "Lịch sử thao tác của các tài khoản và nhật ký an ninh hệ thống",
        actions: [
          { id: "act_act_view", name: "Xem nhật ký hoạt động", code: "ACT_VIEW", description: "Theo dõi thao tác đăng nhập, sửa đổi dữ liệu", apiEndpoint: "GET /api/activities", roles: { bqt: true, thu_ky: true, quan_tri: true, admin: true, tong_thu_ky: true } },
          { id: "act_act_export", name: "Xuất dữ liệu nhật ký", code: "ACT_EXPORT", description: "Trích xuất file log kiểm toán hệ thống", apiEndpoint: "GET /api/activities/export", roles: { bqt: true, quan_tri: true, admin: true } },
        ],
      },
      {
        id: "feat_landing_templates",
        name: "Quản lý chủ đề",
        route: "/admin/landing-templates",
        description: "Quản trị giao diện chủ đề, bộ nhận diện thương hiệu và màu sắc",
        actions: [
          { id: "act_thm_view", name: "Xem danh sách chủ đề", code: "THM_VIEW", description: "Xem các mẫu template và màu sắc thương hiệu", apiEndpoint: "GET /api/landing-templates", roles: { bqt: true, thu_ky: true, truyen_thong: true, quan_tri: true, admin: true } },
          { id: "act_thm_edit", name: "Chỉnh sửa & Áp dụng chủ đề", code: "THM_EDIT", description: "Tùy biến màu sắc, banner giao diện", apiEndpoint: "PUT /api/landing-templates", roles: { bqt: true, truyen_thong: true, quan_tri: true, admin: true } },
        ],
      },
    ],
  },

  // NHÓM 8: QUẢN TRỊ
  {
    id: "cat_admin",
    name: "QUẢN TRỊ",
    iconName: "ShieldCheck",
    features: [
      {
        id: "feat_departments",
        name: "Ban chuyên môn",
        route: "/departments",
        description: "Quản lý 6 Ban chuyên môn, sơ đồ cơ cấu tổ chức và phân bổ nhân sự các ban",
        actions: [
          { id: "act_dep_view", name: "Xem danh sách ban & thành viên", code: "DEP_VIEW", description: "Xem cơ cấu ban và nhân sự trực thuộc", apiEndpoint: "GET /api/departments", roles: { bqt: true, thu_ky: true, thanh_vien: true, xuc_tien: true, truyen_thong: true, thien_nguyen: true, quan_tri: true, admin: true, tong_thu_ky: true, ban_thu_ky: true, member: true } },
          { id: "act_dep_add", name: "Thêm ban công tác mới", code: "DEP_ADD", description: "Thành lập ban chuyên môn mới", apiEndpoint: "POST /api/departments", roles: { bqt: true, quan_tri: true, admin: true } },
          { id: "act_dep_edit", name: "Chỉnh sửa thông tin ban", code: "DEP_EDIT", description: "Cập nhật mô tả, quy chế hoạt động của ban", apiEndpoint: "PUT /api/departments/:id", roles: { bqt: true, thu_ky: true, quan_tri: true, admin: true, tong_thu_ky: true } },
          { id: "act_dep_assign", name: "Phân bổ nhân sự vào ban", code: "DEP_ASSIGN", description: "Bổ nhiệm trưởng ban, phó ban và thành viên", apiEndpoint: "POST /api/departments/:id/assign", roles: { bqt: true, thu_ky: true, quan_tri: true, admin: true, tong_thu_ky: true } },
          { id: "act_dep_delete", name: "Giải thể / Xóa ban", code: "DEP_DELETE", description: "Xóa ban chuyên môn không còn hoạt động", apiEndpoint: "DELETE /api/departments/:id", roles: { bqt: true, quan_tri: true, admin: true } },
        ],
      },
      {
        id: "feat_accounts",
        name: "Quản lý tài khoản",
        route: "/accounts",
        description: "Quản lý tài khoản người dùng, cấp vai trò hệ thống, khóa/mở khóa tài khoản",
        actions: [
          { id: "act_acc_view", name: "Xem danh sách tài khoản", code: "ACC_VIEW", description: "Tra cứu tài khoản đăng nhập và vai trò", apiEndpoint: "GET /api/accounts", roles: { bqt: true, thu_ky: true, quan_tri: true, admin: true, tong_thu_ky: true } },
          { id: "act_acc_add", name: "Tạo mới tài khoản", code: "ACC_ADD", description: "Khởi tạo tài khoản đăng nhập mới", apiEndpoint: "POST /api/accounts", roles: { bqt: true, quan_tri: true, admin: true } },
          { id: "act_acc_edit", name: "Phân vai trò & quyền hạn", code: "ACC_EDIT", description: "Cấp quyền vai trò Admin, Chủ tịch, Trưởng ban", apiEndpoint: "PUT /api/accounts/:id", roles: { bqt: true, quan_tri: true, admin: true } },
          { id: "act_acc_lock", name: "Khóa / Mở khóa tài khoản", code: "ACC_LOCK", description: "Tạm khóa hoặc kích hoạt lại tài khoản", apiEndpoint: "POST /api/accounts/:id/lock", roles: { bqt: true, quan_tri: true, admin: true } },
          { id: "act_acc_reset_pwd", name: "Đặt lại mật khẩu", code: "ACC_RESET_PWD", description: "Cấp lại mật khẩu mới cho tài khoản", apiEndpoint: "POST /api/accounts/:id/reset-password", roles: { bqt: true, quan_tri: true, admin: true } },
          { id: "act_acc_delete", name: "Xóa tài khoản", code: "ACC_DELETE", description: "Xóa tài khoản khỏi hệ thống", apiEndpoint: "DELETE /api/accounts/:id", roles: { bqt: true, quan_tri: true, admin: true } },
        ],
      },
      {
        id: "feat_permissions",
        name: "Ma trận phân quyền",
        route: "/permissions",
        description: "Hệ thống phân quyền theo 6 ban chuyên môn và 5 vai trò thao tác",
        actions: [
          { id: "act_prm_view", name: "Xem ma trận phân quyền", code: "PRM_VIEW", description: "Xem cấu hình phân quyền các ban và vai trò", apiEndpoint: "GET /api/permissions", roles: { bqt: true, thu_ky: true, quan_tri: true, admin: true, tong_thu_ky: true } },
          { id: "act_prm_edit", name: "Cập nhật & Lưu ma trận quyền", code: "PRM_EDIT", description: "Bật/tắt quyền hạn thao tác cho từng ban và role", apiEndpoint: "PUT /api/permissions", roles: { bqt: true, quan_tri: true, admin: true } },
          { id: "act_prm_reset", name: "Khôi phục ma trận về mặc định", code: "PRM_RESET", description: "Đặt lại cấu hình phân quyền chuẩn ban đầu", apiEndpoint: "POST /api/permissions/reset", roles: { bqt: true, quan_tri: true } },
        ],
      },
      {
        id: "feat_documents",
        name: "Quản lý tài liệu",
        route: "/documents",
        description: "Lưu trữ quy chế, nghị quyết đại hội, biên bản và tài liệu nội bộ",
        actions: [
          { id: "act_doc_view", name: "Xem và tải tài liệu", code: "DOC_VIEW", description: "Tra cứu điều lệ và văn bản lưu hành nội bộ", apiEndpoint: "GET /api/documents", roles: { bqt: true, thu_ky: true, thanh_vien: true, xuc_tien: true, truyen_thong: true, thien_nguyen: true, quan_tri: true, admin: true, tong_thu_ky: true, ban_thu_ky: true, member: true } },
          { id: "act_doc_add", name: "Tải lên tài liệu mới", code: "DOC_ADD", description: "Lưu trữ văn bản, nghị quyết chính thức mới", apiEndpoint: "POST /api/documents", roles: { bqt: true, thu_ky: true, quan_tri: true, admin: true, tong_thu_ky: true } },
          { id: "act_doc_edit", name: "Chỉnh sửa tài liệu", code: "DOC_EDIT", description: "Cập nhật tên tài liệu hoặc ghi chú", apiEndpoint: "PUT /api/documents/:id", roles: { bqt: true, thu_ky: true, quan_tri: true, admin: true } },
          { id: "act_doc_delete", name: "Xóa tài liệu", code: "DOC_DELETE", description: "Xóa tài liệu không còn hiệu lực", apiEndpoint: "DELETE /api/documents/:id", roles: { bqt: true, quan_tri: true, admin: true } },
        ],
      },
    ],
  },

  // NHÓM 9: ỨNG DỤNG DI ĐỘNG CEO 1983 (CEO1983 MOBILE APP)
  {
    id: "cat_mobile_app",
    name: "ỨNG DỤNG DI ĐỘNG CEO 1983",
    iconName: "IdCard",
    features: [
      {
        id: "feat_app_home",
        name: "Trang chủ & Bảng tin App",
        route: "/association",
        description: "Truy cập màn hình chính, xem tin tức nổi bật và hoạt động hiệp hội trên App",
        actions: [
          { id: "act_app_home_view", name: "Xem Trang chủ & Bảng tin", code: "APP_HOME_VIEW", description: "Truy cập Trang chủ và theo dõi bảng tin", apiEndpoint: "GET /api/app/feed", roles: { bqt: true, thu_ky: true, thanh_vien: true, xuc_tien: true, truyen_thong: true, thien_nguyen: true, quan_tri: true, admin: true, tong_thu_ky: true, ban_thu_ky: true, member: true } },
          { id: "act_app_news_post", name: "Đăng bài viết hoạt động lên App", code: "APP_NEWS_POST", description: "Đăng tải bài viết tin tức, thông báo trực tiếp lên App", apiEndpoint: "POST /api/app/news", roles: { bqt: true, thu_ky: true, truyen_thong: true, quan_tri: true, admin: true, tong_thu_ky: true } },
          { id: "act_app_news_comment", name: "Bình luận & Thả tim tương tác", code: "APP_NEWS_COMMENT", description: "Tương tác, bình luận bài viết", apiEndpoint: "POST /api/app/comments", roles: { bqt: true, thu_ky: true, thanh_vien: true, xuc_tien: true, truyen_thong: true, thien_nguyen: true, quan_tri: true, admin: true, tong_thu_ky: true, ban_thu_ky: true, member: true } },
        ],
      },
      {
        id: "feat_app_smart_card",
        name: "Thẻ Hội Viên & Danh Thiếp Số",
        route: "/association/card",
        description: "Smart VIP Card, mã QR định danh và danh thiếp số lãnh đạo",
        actions: [
          { id: "act_app_card_view", name: "Xem Thẻ Hội Viên & Smart Card", code: "APP_CARD_VIEW", description: "Xem thẻ hội viên thông minh, số thẻ và hợp đồng", apiEndpoint: "GET /api/app/card", roles: { bqt: true, thu_ky: true, thanh_vien: true, xuc_tien: true, truyen_thong: true, thien_nguyen: true, quan_tri: true, admin: true, tong_thu_ky: true, ban_thu_ky: true, member: true } },
          { id: "act_app_card_share", name: "Chia sẻ Danh thiếp số công khai", code: "APP_CARD_SHARE", description: "Tạo link và mã QR danh thiếp số gửi đối tác", apiEndpoint: "GET /api/app/card/share", roles: { bqt: true, thu_ky: true, thanh_vien: true, xuc_tien: true, truyen_thong: true, thien_nguyen: true, quan_tri: true, admin: true, tong_thu_ky: true, ban_thu_ky: true, member: true } },
          { id: "act_app_card_scan", name: "Quét mã QR Thẻ hội viên đối tác", code: "APP_CARD_SCAN", description: "Dùng camera quét mã QR trên thẻ hội viên khác", apiEndpoint: "POST /api/app/card/scan", roles: { bqt: true, thu_ky: true, thanh_vien: true, xuc_tien: true, truyen_thong: true, thien_nguyen: true, quan_tri: true, admin: true, tong_thu_ky: true, ban_thu_ky: true, member: true } },
        ],
      },
      {
        id: "feat_app_members",
        name: "Danh Bạ Hội Viên Trên App",
        route: "/association/members",
        description: "Tra cứu danh bạ các lãnh đạo và doanh nghiệp trong CLB",
        actions: [
          { id: "act_app_mem_dir", name: "Xem Danh bạ Hội viên CLB", code: "APP_MEM_DIR", description: "Xem thông tin doanh nhân, ngành nghề và công ty", apiEndpoint: "GET /api/app/members", roles: { bqt: true, thu_ky: true, thanh_vien: true, xuc_tien: true, truyen_thong: true, thien_nguyen: true, quan_tri: true, admin: true, tong_thu_ky: true, ban_thu_ky: true, member: true } },
          { id: "act_app_mem_contact", name: "Xem Hotline & Liên hệ Lãnh đạo", code: "APP_MEM_CONTACT", description: "Xem số điện thoại, email và trụ sở công ty", apiEndpoint: "GET /api/app/members/contact", roles: { bqt: true, thu_ky: true, thanh_vien: true, xuc_tien: true, truyen_thong: true, thien_nguyen: true, quan_tri: true, admin: true, tong_thu_ky: true, ban_thu_ky: true, member: true } },
        ],
      },
      {
        id: "feat_app_b2b_connect",
        name: "Kết Nối Giao Thương B2B & Tin Nhắn",
        route: "/association/messages",
        description: "Gửi lời mời kết nối, đặt lịch hẹn gặp 1-1 và chat trao đổi",
        actions: [
          { id: "act_app_b2b_invite", name: "Gửi lời mời kết nối 1-on-1", code: "APP_B2B_INVITE", description: "Mời lãnh đạo doanh nghiệp khác gặp gỡ kết nối", apiEndpoint: "POST /api/app/b2b/invite", roles: { bqt: true, thu_ky: true, thanh_vien: true, xuc_tien: true, truyen_thong: true, thien_nguyen: true, quan_tri: true, admin: true, tong_thu_ky: true, ban_thu_ky: true, member: true } },
          { id: "act_app_b2b_chat", name: "Nhắn tin trực tiếp giữa các hội viên", code: "APP_B2B_CHAT", description: "Trao đổi tin nhắn, gửi file và chia sẻ danh thiếp", apiEndpoint: "POST /api/app/messages", roles: { bqt: true, thu_ky: true, thanh_vien: true, xuc_tien: true, truyen_thong: true, thien_nguyen: true, quan_tri: true, admin: true, tong_thu_ky: true, ban_thu_ky: true, member: true } },
        ],
      },
      {
        id: "feat_app_opportunities",
        name: "Sàn Cơ Hội Giao Thương B2B",
        route: "/association/opportunities",
        description: "Đăng tải và tìm kiếm cơ hội hợp tác kinh doanh",
        actions: [
          { id: "act_app_opp_view", name: "Xem danh sách Cơ hội kinh doanh", code: "APP_OPP_VIEW", description: "Tra cứu nhu cầu mua, bán và hợp tác đầu tư", apiEndpoint: "GET /api/app/opportunities", roles: { bqt: true, thu_ky: true, thanh_vien: true, xuc_tien: true, truyen_thong: true, thien_nguyen: true, quan_tri: true, admin: true, tong_thu_ky: true, ban_thu_ky: true, member: true } },
          { id: "act_app_opp_create", name: "Đăng cơ hội kinh doanh mới", code: "APP_OPP_CREATE", description: "Đăng bài chia sẻ nhu cầu giao thương của doanh nghiệp", apiEndpoint: "POST /api/app/opportunities", roles: { bqt: true, thu_ky: true, thanh_vien: true, xuc_tien: true, truyen_thong: true, thien_nguyen: true, quan_tri: true, admin: true, tong_thu_ky: true, ban_thu_ky: true, member: true } },
        ],
      },
      {
        id: "feat_app_products",
        name: "Gian Hàng Doanh Nghiệp (Marketplace)",
        route: "/association/products",
        description: "Quảng bá sản phẩm, dịch vụ và giải pháp doanh nghiệp",
        actions: [
          { id: "act_app_prd_view", name: "Xem danh mục Sản phẩm / Dịch vụ", code: "APP_PRD_VIEW", description: "Xem sản phẩm của các doanh nghiệp hội viên", apiEndpoint: "GET /api/app/products", roles: { bqt: true, thu_ky: true, thanh_vien: true, xuc_tien: true, truyen_thong: true, thien_nguyen: true, quan_tri: true, admin: true, tong_thu_ky: true, ban_thu_ky: true, member: true } },
          { id: "act_app_prd_create", name: "Đăng bán Sản phẩm / Dịch vụ mới", code: "APP_PRD_CREATE", description: "Đưa sản phẩm dịch vụ lên gian hàng App", apiEndpoint: "POST /api/app/products", roles: { bqt: true, thu_ky: true, thanh_vien: true, xuc_tien: true, truyen_thong: true, thien_nguyen: true, quan_tri: true, admin: true, tong_thu_ky: true, ban_thu_ky: true, member: true } },
        ],
      },
      {
        id: "feat_app_events",
        name: "Sự Kiện & Vé Điện Tử E-Ticket",
        route: "/association/events",
        description: "Đăng ký tham dự sự kiện, nhận vé QR và check-in",
        actions: [
          { id: "act_app_evt_join", name: "Đăng ký tham gia Sự kiện & Nhận vé", code: "APP_EVT_JOIN", description: "Đăng ký sự kiện, đại hội và nhận mã QR vé", apiEndpoint: "POST /api/app/events/register", roles: { bqt: true, thu_ky: true, thanh_vien: true, xuc_tien: true, truyen_thong: true, thien_nguyen: true, quan_tri: true, admin: true, tong_thu_ky: true, ban_thu_ky: true, member: true } },
          { id: "act_app_evt_scan", name: "Soát vé / Quét mã Check-in sự kiện", code: "APP_EVT_SCAN", description: "Quyền dành cho ban tổ chức để quét QR check-in", apiEndpoint: "POST /api/app/events/checkin", roles: { bqt: true, thu_ky: true, truyen_thong: true, quan_tri: true, admin: true, tong_thu_ky: true } },
        ],
      },
      {
        id: "feat_app_voting",
        name: "Biểu Quyết & Bầu Cử Trực Tuyến",
        route: "/association/voting",
        description: "Bỏ phiếu bầu cử ban điều hành và biểu quyết nghị quyết",
        actions: [
          { id: "act_app_vote_participate", name: "Tham gia Bỏ phiếu / Biểu quyết", code: "APP_VOTE_PARTICIPATE", description: "Thực hiện quyền biểu quyết trực tuyến trên App", apiEndpoint: "POST /api/app/voting/vote", roles: { bqt: true, thu_ky: true, thanh_vien: true, xuc_tien: true, truyen_thong: true, thien_nguyen: true, quan_tri: true, admin: true, tong_thu_ky: true, ban_thu_ky: true, member: true } },
        ],
      },
      {
        id: "feat_app_finance_profile",
        name: "Hội Phí Cá Nhân & Hồ Sơ Lãnh Đạo",
        route: "/association/profile",
        description: "Quản lý niên liễm cá nhân và thông tin hồ sơ lãnh đạo",
        actions: [
          { id: "act_app_fee_view", name: "Xem thông tin Hội phí & Niên liễm cá nhân", code: "APP_FEE_VIEW", description: "Xem hóa đơn niên liễm và lịch sử đóng phí", apiEndpoint: "GET /api/app/fees/me", roles: { bqt: true, thu_ky: true, thanh_vien: true, xuc_tien: true, truyen_thong: true, thien_nguyen: true, quan_tri: true, admin: true, tong_thu_ky: true, ban_thu_ky: true, member: true } },
          { id: "act_app_profile_edit", name: "Chỉnh sửa Hồ sơ cá nhân & Logo công ty", code: "APP_PROFILE_EDIT", description: "Tự cập nhật chức danh, logo, hotline, giới thiệu", apiEndpoint: "PUT /api/app/profile", roles: { bqt: true, thu_ky: true, thanh_vien: true, xuc_tien: true, truyen_thong: true, thien_nguyen: true, quan_tri: true, admin: true, tong_thu_ky: true, ban_thu_ky: true, member: true } },
        ],
      },
    ],
  },
];

const STORAGE_KEY = RBAC_MATRIX_STORAGE_KEY;

export const DETECTABLE_SYSTEM_FEATURES = [
  { name: "Hội viên & Doanh nghiệp", route: "/members", catId: "cat_members", desc: "Quản lý danh sách hội viên, hồ sơ năng lực & chức vụ" },
  { name: "Ban chuyên môn & Công tác", route: "/departments", catId: "cat_admin", desc: "Quản lý 6 Ban chuyên môn và phân công nhân sự ban" },
  { name: "Tài khoản & Phân quyền", route: "/accounts", catId: "cat_admin", desc: "Quản lý tài khoản đăng nhập, cấp quyền và bảo mật" },
  { name: "Bốc thăm trúng thưởng", route: "/lucky-draw", catId: "cat_events", desc: "Quản lý chương trình quay số may mắn & giải thưởng sự kiện" },
  { name: "Sự kiện & Hội thảo", route: "/events", catId: "cat_events", desc: "Tổ chức sự kiện, lịch trình & phát hành vé điện tử" },
  { name: "Đăng ký sự kiện", route: "/event-registrations", catId: "cat_events", desc: "Quản lý danh sách đăng ký sự kiện và phê duyệt" },
  { name: "Gói Tài trợ & Quyền lợi", route: "/sponsor-packages", catId: "cat_events", desc: "Quản lý các gói tài trợ kim cương, vàng, bạc cho sự kiện" },
  { name: "Kết nối giao thương B2B", route: "/business-connect", catId: "cat_network", desc: "Sàn kết nối cung cầu, cơ hội hợp tác kinh doanh giữa các CEO" },
  { name: "Cuộc hẹn & Gặp gỡ", route: "/meetings", catId: "cat_network", desc: "Đặt lịch hẹn 1-on-1 và kết nối giao thương giữa các hội viên" },
  { name: "Quỹ hội & Báo cáo tài chính", route: "/finance-report", catId: "cat_finance", desc: "Tổng quan thu chi, số dư quỹ hội và báo cáo tài chính" },
  { name: "Khoản thu & Hội phí", route: "/income", catId: "cat_finance", desc: "Quản lý thu hội phí thường niên, tài trợ và nhập file sao kê" },
  { name: "Khoản chi & Quyết toán", route: "/expenses", catId: "cat_finance", desc: "Quản lý phiếu chi, duyệt chi ngân sách và quyết toán" },
  { name: "Tin tức & Hoạt động", route: "/news", catId: "cat_media", desc: "Bản tin nội bộ, bài viết sự kiện và thông cáo báo chí" },
  { name: "Thư viện truyền thông & Media", route: "/media", catId: "cat_media", desc: "Kho ảnh sự kiện, video hoạt động và tư liệu hiệp hội" },
  { name: "Gian hàng & Sản phẩm", route: "/marketplace", catId: "cat_marketplace", desc: "Chợ giao thương sản phẩm, dịch vụ ưu đãi nội bộ" },
  { name: "Khảo sát & Biểu quyết", route: "/voting", catId: "cat_governance", desc: "Biểu quyết trực tuyến, bầu cử ban điều hành và khảo sát" },
  { name: "Thông báo & Tin nhắn", route: "/notifications", catId: "cat_system", desc: "Gửi thông báo đẩy, email và tin nhắn tức thời đến hội viên" },
  { name: "Ma trận phân quyền & Tài khoản", route: "/permissions", catId: "cat_system", desc: "Thiết lập phân quyền hệ thống và quản lý tài khoản người dùng" },
  { name: "App: Smart VIP Card & Danh thiếp số", route: "/association/card", catId: "cat_mobile_app", desc: "Smart VIP Card, mã QR định danh và danh thiếp số lãnh đạo trên App" },
  { name: "App: Bảng tin nội bộ & Khoảnh khắc", route: "/association/feed", catId: "cat_mobile_app", desc: "Bảng tin giao lưu, chia sẻ hoạt động và hình ảnh doanh nghiệp trên App" },
  { name: "App: Danh bạ Hội viên & Lãnh đạo", route: "/association/members", catId: "cat_mobile_app", desc: "Tra cứu danh bạ các lãnh đạo và doanh nghiệp trong CLB trên App" },
  { name: "App: Kết nối B2B & Tin nhắn riêng", route: "/association/messages", catId: "cat_mobile_app", desc: "Gửi lời mời kết nối, hẹn gặp 1-on-1 và chat trao đổi trên App" },
  { name: "App: Sàn cơ hội kinh doanh B2B", route: "/association/opportunities", catId: "cat_mobile_app", desc: "Đăng tải và tìm kiếm cơ hội hợp tác kinh doanh trên App" },
  { name: "App: Gian hàng Marketplace", route: "/association/products", catId: "cat_mobile_app", desc: "Quảng bá sản phẩm, dịch vụ và giải pháp doanh nghiệp trên App" },
  { name: "App: Sự kiện & Vé điện tử E-Ticket", route: "/association/events", catId: "cat_mobile_app", desc: "Đăng ký tham dự sự kiện, nhận vé QR và check-in trên App" },
  { name: "App: Biểu quyết & Bầu cử trực tuyến", route: "/association/voting", catId: "cat_mobile_app", desc: "Bỏ phiếu bầu cử ban điều hành và biểu quyết nghị quyết trên App" },
  { name: "App: Hội phí cá nhân & Hồ sơ lãnh đạo", route: "/association/profile", catId: "cat_mobile_app", desc: "Quản lý niên liễm cá nhân và thông tin hồ sơ lãnh đạo trên App" },
];

export interface RbacPermissionMatrixProps {
  onDirtyChange?: (isDirty: boolean) => void;
  saveTriggerRef?: React.MutableRefObject<(() => Promise<boolean>) | null>;
  discardTriggerRef?: React.MutableRefObject<(() => void) | null>;
}

export function RbacPermissionMatrix({
  onDirtyChange,
  saveTriggerRef,
  discardTriggerRef,
}: RbacPermissionMatrixProps = {}) {
  const [categories, setCategories] = useState<TreeCategory[]>(() => {
    let base = INITIAL_CATEGORIES;
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            base = parsed;
          }
        }
      } catch {}
    }
    return base.map((cat) => ({
      ...cat,
      features: cat.features.map((feat) => ({
        ...feat,
        actions: feat.actions.map((act) => ({
          ...act,
          roles: normalizeActionRoles(act),
        })),
      })),
    }));
  });

  // Cố định hàng ngang chỉ hiển thị 5 vai trò hệ thống cốt lõi: Quản trị, Admin, Tổng thư ký, Trưởng ban, Thành viên
  const [initialCategoriesStr, setInitialCategoriesStr] = useState<string>(() => {
    return JSON.stringify(categories);
  });

  // Tải ma trận phân quyền thực tế từ CSDL PostgreSQL (bảng app_settings)
  useEffect(() => {
    let active = true;
    fetchNestApi("/admin/permission-matrix")
      .then((res: any) => {
        if (!active || !res) return;
        const incoming = res.categories || res.rows;
        if (Array.isArray(incoming) && incoming.length > 0 && incoming[0]?.features) {
          const normalized = incoming.map((cat: TreeCategory) => ({
            ...cat,
            features: cat.features.map((feat) => ({
              ...feat,
              actions: feat.actions.map((act) => ({
                ...act,
                roles: normalizeActionRoles(act),
              })),
            })),
          }));
          setCategories(normalized);
          setInitialCategoriesStr(JSON.stringify(normalized));
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
          } catch {}
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    cat_members: true,
    cat_events: true,
    cat_network: true,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [saving, setSaving] = useState(false);

  // Modals state
  const [addFeatureOpen, setAddFeatureOpen] = useState(false);
  const [addActionOpen, setAddActionOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<{ action: TreeAction; featureName: string; categoryName: string } | null>(null);

  // Form thêm chức năng mới & phát hiện tự động
  const [targetCatId, setTargetCatId] = useState(INITIAL_CATEGORIES[0]?.id || "");
  const [newFeatureName, setNewFeatureName] = useState("");
  const [newFeatureRoute, setNewFeatureRoute] = useState("");
  const [newFeatureDesc, setNewFeatureDesc] = useState("");
  const [detectedFeatures, setDetectedFeatures] = useState<typeof DETECTABLE_SYSTEM_FEATURES>([]);

  // Tự động quét phát hiện các chức năng mới từ giao diện
  const handleScanNewFeatures = () => {
    const existingRoutes = new Set(
      categories.flatMap((c) => c.features.map((f) => f.route.toLowerCase().trim()))
    );
    const missing = DETECTABLE_SYSTEM_FEATURES.filter(
      (item) => !existingRoutes.has(item.route.toLowerCase().trim())
    );
    if (missing.length === 0) {
      toast.info("Đã quét toàn bộ hệ thống: Tất cả các chức năng giao diện hiện tại đều đã có trong ma trận!");
      setDetectedFeatures(DETECTABLE_SYSTEM_FEATURES);
    } else {
      setDetectedFeatures(missing);
      toast.success(`Đã phát hiện ${missing.length} chức năng giao diện mới sẵn sàng để thêm vào cơ sở dữ liệu!`);
      const first = missing[0];
      setNewFeatureName(first.name);
      setNewFeatureRoute(first.route);
      setNewFeatureDesc(first.desc);
      if (first.catId) setTargetCatId(first.catId);
    }
  };

  // Form thêm quyền / thao tác mới
  const [targetFeatId, setTargetFeatId] = useState("");
  const [newActionName, setNewActionName] = useState("");
  const [newActionCode, setNewActionCode] = useState("");
  const [newActionDesc, setNewActionDesc] = useState("");
  const [newActionApi, setNewActionApi] = useState("");
  const [newActionRoles, setNewActionRoles] = useState<Record<string, boolean>>({ bqt: true, quan_tri: true });

  // Form chỉnh sửa thao tác
  const [editActionModalOpen, setEditActionModalOpen] = useState(false);
  const [editTargetCatId, setEditTargetCatId] = useState("");
  const [editTargetFeatId, setEditTargetFeatId] = useState("");
  const [editingActionId, setEditingActionId] = useState("");
  const [editActionName, setEditActionName] = useState("");
  const [editActionCode, setEditActionCode] = useState("");
  const [editActionDesc, setEditActionDesc] = useState("");
  const [editActionApi, setEditActionApi] = useState("");

  const handleStartEditAction = (catId: string, featId: string, action: TreeAction) => {
    setEditTargetCatId(catId);
    setEditTargetFeatId(featId);
    setEditingActionId(action.id);
    setEditActionName(action.name);
    setEditActionCode(action.code);
    setEditActionDesc(action.description || "");
    setEditActionApi(action.apiEndpoint || "");
    setEditActionModalOpen(true);
  };

  const handleSaveEditedAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editActionName.trim()) {
      toast.error("Vui lòng nhập tên thao tác");
      return;
    }
    setCategories((prev) =>
      prev.map((c) => {
        if (c.id !== editTargetCatId) return c;
        return {
          ...c,
          features: c.features.map((f) => {
            if (f.id !== editTargetFeatId) return f;
            return {
              ...f,
              actions: f.actions.map((a) => {
                if (a.id !== editingActionId) return a;
                return {
                  ...a,
                  name: editActionName.trim(),
                  code: editActionCode.trim() || a.code,
                  description: editActionDesc.trim(),
                  apiEndpoint: editActionApi.trim(),
                };
              }),
            };
          }),
        };
      })
    );
    setEditActionModalOpen(false);
    toast.success("Đã cập nhật thông tin thao tác!");
  };

  const toggleExpand = (id: string) => {
    setExpandedNodes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const expandAll = () => {
    const next: Record<string, boolean> = {};
    for (const c of categories) {
      next[c.id] = true;
      for (const f of c.features) next[f.id] = true;
    }
    setExpandedNodes(next);
  };

  const collapseAll = () => {
    setExpandedNodes({});
  };

  // Toggle checkbox quyền
  const handleTogglePermission = (catId: string, featId: string, actionId: string, roleKey: string) => {
    setCategories((prev) =>
      prev.map((c) => {
        if (c.id !== catId) return c;
        return {
          ...c,
          features: c.features.map((f) => {
            if (f.id !== featId) return f;
            return {
              ...f,
              actions: f.actions.map((a) => {
                if (a.id !== actionId) return a;
                const currentVal = !!a.roles[roleKey];
                return {
                  ...a,
                  roles: {
                    ...a.roles,
                    [roleKey]: !currentVal,
                  },
                };
              }),
            };
          }),
        };
      })
    );
  };

  // Lưu quyền riêng cho 1 chức năng vào CSDL & LocalStorage
  const handleSaveFeaturePermissions = async (featName: string) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));

      // Ghi trực tiếp vào CSDL PostgreSQL (bảng app_settings)
      await fetchNestApi("/admin/permission-matrix", {
        method: "PUT",
        body: JSON.stringify({ categories, rows: categories }),
      }).catch(() => {});

      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("role-changed"));
        window.dispatchEvent(new Event("crm_permissions_updated"));
      }
      toast.success(`Đã lưu cấu hình quyền cho chức năng "${featName}" vào CSDL thành công!`);
    } catch {
      toast.error("Lỗi khi lưu vào bộ nhớ cục bộ");
    }
  };

  // Xóa 1 thao tác con
  const handleDeleteAction = (catId: string, featId: string, actionId: string, actionName: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa thao tác "${actionName}"?`)) return;
    setCategories((prev) =>
      prev.map((c) => {
        if (c.id !== catId) return c;
        return {
          ...c,
          features: c.features.map((f) => {
            if (f.id !== featId) return f;
            return {
              ...f,
              actions: f.actions.filter((a) => a.id !== actionId),
            };
          }),
        };
      })
    );
    toast.success(`Đã xóa thao tác "${actionName}"!`);
  };

  // Xóa 1 chức năng
  const handleDeleteFeature = (catId: string, featId: string, featName: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa toàn bộ chức năng "${featName}"?`)) return;
    setCategories((prev) =>
      prev.map((c) => {
        if (c.id !== catId) return c;
        return {
          ...c,
          features: c.features.filter((f) => f.id !== featId),
        };
      })
    );
    toast.success(`Đã xóa chức năng "${featName}"!`);
  };

  // Lưu toàn bộ vào CSDL & LocalStorage
  const handleSaveAll = async () => {
    setSaving(true);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));

      // Ghi trực tiếp vào CSDL PostgreSQL (bảng app_settings với key 'crm_permission_matrix')
      await fetchNestApi("/admin/permission-matrix", {
        method: "PUT",
        body: JSON.stringify({ categories, rows: categories }),
      }).catch((err) => {
        console.warn("Backend matrix sync warning:", err);
      });

      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("role-changed"));
        window.dispatchEvent(new Event("vba_auth_changed"));
        window.dispatchEvent(new Event("crm_permissions_updated"));
        dispatchPermissionSyncEvent();
      }
      setInitialCategoriesStr(JSON.stringify(categories));
      toast.success("Đã lưu toàn bộ Ma Trận Phân Quyền Vai Trò Hệ Thống thành công!");
      setTimeout(() => {
        setSaving(false);
      }, 200);
    } catch {
      setSaving(false);
      toast.error("Lỗi lưu ma trận");
    }
  };

  const handleDiscard = React.useCallback(() => {
    if (initialCategoriesStr) {
      try {
        const restored = JSON.parse(initialCategoriesStr);
        setCategories(restored);
        toast.info("Đã hoàn tác các thay đổi trên ma trận.");
      } catch {}
    }
  }, [initialCategoriesStr]);

  const isDirty = useMemo(() => {
    if (!initialCategoriesStr) return false;
    return JSON.stringify(categories) !== initialCategoriesStr;
  }, [categories, initialCategoriesStr]);

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  useEffect(() => {
    if (saveTriggerRef) {
      saveTriggerRef.current = async () => {
        try {
          await handleSaveAll();
          return true;
        } catch {
          return false;
        }
      };
    }
  }, [saveTriggerRef, categories]);

  useEffect(() => {
    if (discardTriggerRef) {
      discardTriggerRef.current = () => {
        handleDiscard();
      };
    }
  }, [discardTriggerRef, handleDiscard]);

  // Khôi phục mặc định
  const handleResetDefault = async () => {
    if (!confirm("Khôi phục toàn bộ Ma Trận Phân Quyền về cấu hình chuẩn 5 Vai Trò Hệ Thống?")) return;
    const normalized = INITIAL_CATEGORIES.map((cat) => ({
      ...cat,
      features: cat.features.map((feat) => ({
        ...feat,
        actions: feat.actions.map((act) => ({
          ...act,
          roles: normalizeActionRoles(act),
        })),
      })),
    }));
    setCategories(normalized);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
      await fetchNestApi("/admin/permission-matrix", {
        method: "PUT",
        body: JSON.stringify({ categories: normalized, rows: normalized }),
      }).catch(() => {});
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("crm_permissions_updated"));
        window.dispatchEvent(new Event("role-changed"));
      }
    } catch {}
    toast.success("Đã khôi phục ma trận phân quyền về chuẩn vai trò hệ thống!");
  };

  // Toggle toàn bộ quyền của 1 cột (Role hoặc Ban chuyên môn)
  const handleToggleColumnAll = (colKey: string, colName: string) => {
    let totalActions = 0;
    let enabledActions = 0;

    categories.forEach((cat) => {
      cat.features.forEach((feat) => {
        feat.actions.forEach((act) => {
          totalActions++;
          if (act.roles[colKey]) enabledActions++;
        });
      });
    });

    const targetValue = enabledActions < totalActions;

    const updated = categories.map((cat) => ({
      ...cat,
      features: cat.features.map((feat) => ({
        ...feat,
        actions: feat.actions.map((act) => ({
          ...act,
          roles: {
            ...act.roles,
            [colKey]: targetValue,
          },
        })),
      })),
    }));

    setCategories(updated);
    toast.success(
      targetValue
        ? `Đã chọn TẤT CẢ quyền cho cột "${colName}"!`
        : `Đã bỏ chọn tất cả quyền cho cột "${colName}"!`
    );
  };

  // Submit thêm chức năng & lưu trực tiếp vào CSDL
  const handleCreateFeature = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFeatureName.trim()) {
      toast.error("Vui lòng nhập tên chức năng");
      return;
    }

    const codePrefix = newFeatureName
      .trim()
      .toUpperCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^A-Z0-9]/g, "_")
      .replace(/_+/g, "_")
      .slice(0, 8);

    const newFeat: TreeFeature = {
      id: `feat_${Date.now()}`,
      name: newFeatureName.trim(),
      route: newFeatureRoute.trim() || "/custom-feature",
      description: newFeatureDesc.trim() || "Chức năng hệ thống CEO 1983",
      actions: [
        {
          id: `act_${Date.now()}_view`,
          name: `Xem danh sách & chi tiết ${newFeatureName.trim()}`,
          code: `${codePrefix}_VIEW`,
          description: "Tra cứu dữ liệu chức năng",
          apiEndpoint: `GET /api${newFeatureRoute.trim() || "/custom"}`,
          roles: {
            dieu_hanh: true,
            quan_tri: true,
            admin: true,
            tong_thu_ky: true,
            truong_ban_dieu_hanh: true,
            truong_ban_truyen_thong: true,
            member: true,
          },
        },
        {
          id: `act_${Date.now()}_add`,
          name: `Thêm mới ${newFeatureName.trim()}`,
          code: `${codePrefix}_ADD`,
          description: "Tạo mới dữ liệu",
          apiEndpoint: `POST /api${newFeatureRoute.trim() || "/custom"}`,
          roles: { dieu_hanh: true, quan_tri: true, admin: true, tong_thu_ky: true, truong_ban_dieu_hanh: true },
        },
        {
          id: `act_${Date.now()}_edit`,
          name: `Chỉnh sửa ${newFeatureName.trim()}`,
          code: `${codePrefix}_EDIT`,
          description: "Cập nhật dữ liệu",
          apiEndpoint: `PUT /api${newFeatureRoute.trim() || "/custom"}/:id`,
          roles: { dieu_hanh: true, quan_tri: true, admin: true, tong_thu_ky: true, truong_ban_dieu_hanh: true },
        },
        {
          id: `act_${Date.now()}_delete`,
          name: `Xóa ${newFeatureName.trim()}`,
          code: `${codePrefix}_DELETE`,
          description: "Xóa dữ liệu chức năng",
          apiEndpoint: `DELETE /api${newFeatureRoute.trim() || "/custom"}/:id`,
          roles: { dieu_hanh: true, quan_tri: true, admin: true },
        },
      ],
    };

    const updated = categories.map((c) => {
      if (c.id !== targetCatId) return c;
      return {
        ...c,
        features: [...c.features, newFeat],
      };
    });

    setCategories(updated);
    setInitialCategoriesStr(JSON.stringify(updated));
    setExpandedNodes((prev) => ({ ...prev, [targetCatId]: true, [newFeat.id]: true }));
    setAddFeatureOpen(false);
    setNewFeatureName("");
    setNewFeatureRoute("");
    setNewFeatureDesc("");

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      await fetchNestApi("/admin/permission-matrix", {
        method: "PUT",
        body: JSON.stringify({ categories: updated, rows: updated }),
      }).catch(() => {});

      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("crm_permissions_updated"));
        window.dispatchEvent(new Event("role-changed"));
      }
      toast.success(`Đã thêm chức năng "${newFeat.name}" cùng thao tác vào Cơ Sở Dữ Liệu thành công!`);
    } catch {
      toast.success(`Đã thêm chức năng "${newFeat.name}" vào ma trận!`);
    }
  };

  // Submit thêm quyền / thao tác con
  const handleCreateAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActionName.trim()) {
      toast.error("Vui lòng nhập tên thao tác");
      return;
    }
    const targetFeat = allFeaturesList.find((f) => f.id === targetFeatId) || allFeaturesList[0];
    if (!targetFeat) {
      toast.error("Chưa chọn chức năng");
      return;
    }

    const generatedCode = newActionCode.trim() || `${targetFeat.name.toUpperCase().replace(/[^A-Z0-9]/g, "_").slice(0, 8)}_${newActionName.trim().toUpperCase().replace(/[^A-Z0-9]/g, "_").slice(0, 8)}`;

    const newAct: TreeAction = {
      id: `act_${Date.now()}`,
      name: newActionName.trim(),
      code: generatedCode,
      description: newActionDesc.trim() || "Thao tác nghiệp vụ phân quyền",
      apiEndpoint: newActionApi.trim() || "API Endpoint",
      roles: newActionRoles,
    };

    setCategories((prev) =>
      prev.map((c) => ({
        ...c,
        features: c.features.map((f) => {
          if (f.id !== targetFeat.id) return f;
          return {
            ...f,
            actions: [...f.actions, newAct],
          };
        }),
      }))
    );

    setExpandedNodes((prev) => ({ ...prev, [targetFeat.id]: true }));
    setAddActionOpen(false);
    setNewActionName("");
    setNewActionCode("");
    setNewActionDesc("");
    setNewActionApi("");
    toast.success(`Đã thêm thao tác "${newAct.name}" vào chức năng!`);
  };

  // Lọc dữ liệu theo từ khóa tìm kiếm
  const filteredCategories = useMemo(() => {
    if (!searchTerm.trim()) return categories;
    const term = searchTerm.trim().toLowerCase();

    return categories
      .map((c) => {
        const matchingFeatures = c.features
          .map((f) => {
            const featMatches = f.name.toLowerCase().includes(term) || f.route.toLowerCase().includes(term);
            const matchingActions = f.actions.filter(
              (a) =>
                a.name.toLowerCase().includes(term) ||
                a.code.toLowerCase().includes(term) ||
                a.description.toLowerCase().includes(term) ||
                (a.apiEndpoint && a.apiEndpoint.toLowerCase().includes(term))
            );

            if (featMatches) {
              return f;
            }
            if (matchingActions.length > 0) {
              return {
                ...f,
                actions: matchingActions,
              };
            }
            return null;
          })
          .filter(Boolean) as TreeFeature[];

        if (c.name.toLowerCase().includes(term)) {
          return c;
        }
        if (matchingFeatures.length > 0) {
          return {
            ...c,
            features: matchingFeatures,
          };
        }
        return null;
      })
      .filter(Boolean) as TreeCategory[];
  }, [categories, searchTerm]);

  // Danh sách flat features để chọn khi thêm action
  const allFeaturesList = useMemo(() => {
    const list: { id: string; name: string; catName: string }[] = [];
    for (const c of categories) {
      for (const f of c.features) {
        list.push({ id: f.id, name: f.name, catName: c.name });
      }
    }
    return list;
  }, [categories]);

  // Cột hiển thị: Vai trò hệ thống bao gồm cả các Trưởng ban mới được tạo ra
  const [dynamicRoles, setDynamicRoles] = useState<SystemRole[]>(() => getDynamicSystemRoles());

  useEffect(() => {
    const handleDeptUpdate = () => {
      setDynamicRoles(getDynamicSystemRoles());
    };
    window.addEventListener("ceo1983_departments_updated", handleDeptUpdate);
    window.addEventListener("permission_sync_updated", handleDeptUpdate);
    window.addEventListener("storage", handleDeptUpdate);
    return () => {
      window.removeEventListener("ceo1983_departments_updated", handleDeptUpdate);
      window.removeEventListener("permission_sync_updated", handleDeptUpdate);
      window.removeEventListener("storage", handleDeptUpdate);
    };
  }, []);

  // Sắp xếp thứ tự vai trò chuẩn Figma: QUẢN TRỊ, CHỦ TỊCH, ADMIN, TỔNG THƯ KÝ, TRƯỞNG BAN ĐIỀU HÀNH, TRƯỞNG BAN TRUYỀN THÔNG...
  const orderedRoles = useMemo(() => {
    const primaryKeys = [
      "quan_tri",
      "chu_tich",
      "admin",
      "tong_thu_ky",
      "truong_ban_dieu_hanh",
      "truong_ban_truyen_thong",
    ];
    const result: SystemRole[] = [];
    primaryKeys.forEach((key) => {
      const match = dynamicRoles.find((r) => r.key === key);
      if (match) result.push(match);
    });
    dynamicRoles.forEach((r) => {
      if (!primaryKeys.includes(r.key)) {
        result.push(r);
      }
    });
    return result;
  }, [dynamicRoles]);

  const getRoleHeaderDisplay = (role: SystemRole) => {
    if (role.key === "truong_ban_dieu_hanh") {
      return (
        <span className="text-center">
          TRƯỞNG BAN
          <br />
          ĐIỀU HÀNH
        </span>
      );
    }
    if (role.key === "truong_ban_truyen_thong") {
      return (
        <span className="text-center">
          TRƯỞNG BAN
          <br />
          TRUYỀN THÔNG
        </span>
      );
    }
    if (role.key === "truong_ban_thanh_vien") {
      return (
        <span className="text-center">
          TRƯỞNG BAN
          <br />
          THÀNH VIÊN
        </span>
      );
    }
    if (role.key === "truong_ban_xuc_tien") {
      return (
        <span className="text-center">
          TRƯỞNG BAN
          <br />
          XÚC TIẾN
        </span>
      );
    }
    if (role.key === "truong_ban_tai_chinh") {
      return (
        <span className="text-center">
          TRƯỞNG BAN
          <br />
          TÀI CHÍNH
        </span>
      );
    }
    if (role.key === "truong_ban_thien_nguyen") {
      return (
        <span className="text-center">
          TRƯỞNG BAN
          <br />
          THIỆN NGUYỆN
        </span>
      );
    }
    if (role.key === "thanh_vien_ban_su_kien") {
      return (
        <span className="text-center">
          THÀNH VIÊN
          <br />
          BAN SỰ KIỆN
        </span>
      );
    }
    if (role.key === "thanh_vien_ban_xuc_tien") {
      return (
        <span className="text-center">
          THÀNH VIÊN
          <br />
          XÚC TIẾN TM
        </span>
      );
    }
    if (role.key === "thanh_vien_ban_thanh_vien") {
      return (
        <span className="text-center">
          THÀNH VIÊN
          <br />
          BAN THÀNH VIÊN
        </span>
      );
    }
    if (role.key === "thanh_vien_ban_truyen_thong") {
      return (
        <span className="text-center">
          THÀNH VIÊN
          <br />
          TRUYỀN THÔNG
        </span>
      );
    }
    if (role.key === "thanh_vien_ban_tai_chinh") {
      return (
        <span className="text-center">
          THÀNH VIÊN
          <br />
          BAN TÀI CHÍNH
        </span>
      );
    }
    if (role.key === "thanh_vien_ban_thien_nguyen") {
      return (
        <span className="text-center">
          THÀNH VIÊN
          <br />
          THIỆN NGUYỆN
        </span>
      );
    }
    if (role.key === "member") {
      return (
        <span className="text-center">
          HỘI VIÊN
          <br />
          APP CEO 1983
        </span>
      );
    }
    return <span className="text-center">{role.shortName.toUpperCase()}</span>;
  };

  const getRoleColWidth = (roleKey: string) => {
    if (roleKey === "quan_tri" || roleKey === "chu_tich" || roleKey === "admin") {
      return "w-32 min-w-[128px]";
    }
    return "w-28 min-w-[112px]";
  };

  // Flat danh sách tất cả các chức năng theo đúng thứ tự Sidebar CRM (bỏ hàng nhóm)
  const flatFeatures = useMemo(() => {
    return filteredCategories.flatMap((cat) =>
      cat.features.map((feat) => ({
        feat,
        catId: cat.id,
        catName: cat.name,
      }))
    );
  }, [filteredCategories]);

  return (
    <div className="self-stretch min-h-[739px] pl-4 sm:pl-10 lg:pl-14 pr-4 sm:pr-8 lg:pr-12 pt-8 sm:pt-10 flex flex-col justify-start items-start gap-4">
      {/* ── TIÊU ĐỀ TRANG VÀ ICON LOGO (FIGMA SNIPPET 1) ── */}
      <div className="self-stretch h-16 inline-flex justify-start items-center gap-1.5 overflow-hidden">
        <img className="size-16 object-contain" src="/icons/ceo1983_icon_1/image 6.png" alt="logo" />
        <div className="flex-1 inline-flex flex-col justify-start items-start gap-1.5">
          <div className="justify-start text-slate-900 dark:text-white text-2xl font-bold font-['Inter'] leading-8">
            Ma Trận Phân Quyền &amp; Ban Chuyên Môn
          </div>
          <div className="justify-start text-slate-500 text-sm font-normal font-['Inter'] leading-5">
            Quản lý ban chuyên môn và cấu hình quyền hạn vai trò hệ thống CEO 1983
          </div>
        </div>
      </div>

      {/* ── THANH TÌM KIẾM VÀ CÁC NÚT THAO TÁC (FIGMA SNIPPET 1) ── */}
      <div className="self-stretch rounded-[20px] shadow-[0px_2px_2px_0px_rgba(24,43,76,0.03)] outline outline-1 outline-offset-[-1px] outline-slate-200 dark:outline-slate-800 bg-white dark:bg-slate-900 inline-flex flex-wrap justify-between items-center overflow-hidden p-1.5 gap-2">
        <div className="w-[460px] max-w-full h-8 px-3 bg-white dark:bg-slate-900 rounded-[20px] outline outline-1 outline-offset-[-1px] outline-slate-200 dark:outline-slate-800 flex justify-start items-center gap-2 overflow-hidden">
          <div className="size-4 relative overflow-hidden flex items-center justify-center">
            <img src="/icons/ceo1983_icon_1/search.svg" className="size-3.5" alt="search" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tên chức năng, thao tác con"
            className="flex-1 text-slate-700 dark:text-slate-200 text-xs font-normal font-['Inter'] bg-transparent border-none outline-none placeholder:text-slate-500"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm("")} className="text-slate-400 hover:text-slate-600">
              <X className="size-3.5" />
            </button>
          )}
        </div>

        <div className="flex justify-start items-center gap-2">
          <button
            type="button"
            onClick={() => setAddFeatureOpen(true)}
            className="w-40 h-8 px-3 bg-blue-800 hover:bg-blue-900 rounded-[20px] flex justify-center items-center gap-1.5 overflow-hidden cursor-pointer transition shadow-xs"
          >
            <img src="/icons/ceo1983_icon_1/folder-plus.svg" className="size-3.5 invert brightness-0" alt="add" />
            <span className="justify-start text-white text-xs font-semibold font-['Inter']">Thêm Chức Năng</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (allFeaturesList.length > 0 && !targetFeatId) {
                setTargetFeatId(allFeaturesList[0].id);
              }
              setAddActionOpen(true);
            }}
            className="w-36 h-8 px-3 bg-blue-800 hover:bg-blue-900 rounded-[20px] flex justify-center items-center gap-1.5 overflow-hidden cursor-pointer transition shadow-xs"
          >
            <img src="/icons/ceo1983_icon_1/key-round.svg" className="size-3.5 invert brightness-0" alt="key" />
            <span className="justify-start text-white text-xs font-semibold font-['Inter']">Thêm Quyền</span>
          </button>

          <button
            type="button"
            onClick={handleResetDefault}
            title="Khôi phục mặc định ban đầu"
            className="size-8 bg-white dark:bg-slate-800 rounded-3xl outline outline-1 outline-offset-[-1px] outline-slate-200 dark:outline-slate-700 flex justify-center items-center overflow-hidden hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
          >
            <img src="/icons/ceo1983_icon_1/rotate-ccw.svg" className="size-4" alt="reset" />
          </button>
        </div>
      </div>

      {/* ── CẢNH BÁO CHƯA LƯU QUYỀN TRÊN MA TRẬN ── */}
      {isDirty && (
        <div className="self-stretch rounded-2xl border border-amber-500/40 bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-transparent p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm font-bold text-sm">
              !
            </div>
            <div>
              <p className="font-bold text-amber-900 dark:text-amber-200">
                Bạn có thay đổi ma trận phân quyền chưa lưu vào CSDL!
              </p>
              <p className="text-amber-700/80 dark:text-amber-300/80 text-[11px] mt-0.5">
                Các ô checkbox vừa thay đổi sẽ chỉ có hiệu lực toàn hệ thống sau khi bạn bấm lưu.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDiscard}
              className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-semibold text-xs hover:bg-slate-100 cursor-pointer"
            >
              Hoàn tác
            </button>
            <button
              type="button"
              onClick={handleSaveAll}
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-blue-800 hover:bg-blue-900 text-white font-bold text-xs transition shadow-xs cursor-pointer disabled:opacity-50"
            >
              <Save className="h-3.5 w-3.5 text-white" />
              <span>{saving ? "Đang lưu..." : "Lưu Thay Đổi"}</span>
            </button>
          </div>
        </div>
      )}

      {/* ── BẢNG MA TRẬN PHÂN QUYỀN (FIGMA SNIPPET 1) ── */}
      <div className="self-stretch relative bg-white dark:bg-slate-900 rounded-[20px] outline outline-1 outline-offset-[-1px] outline-slate-200 dark:outline-slate-800 flex flex-col justify-start items-start overflow-x-auto shadow-xs">
        {/* Hàng Header Bảng */}
        <div className="w-full min-w-max h-24 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 inline-flex justify-start items-start">
          <div className="sticky left-0 z-30 w-60 min-w-[240px] self-stretch pl-4 border-l border-r border-slate-200 dark:border-slate-800 flex justify-start items-center bg-slate-100 dark:bg-slate-800 shadow-[2px_0_5px_rgba(0,0,0,0.08)]">
            <div className="justify-start text-slate-900 dark:text-white text-xs font-bold font-['Inter']">QUYỀN THAO TÁC</div>
          </div>

          {orderedRoles.map((col) => {
            let totalActions = 0;
            let activeCount = 0;
            categories.forEach((cat) => {
              cat.features.forEach((feat) => {
                feat.actions.forEach((act) => {
                  totalActions++;
                  if (act.roles[col.key]) activeCount++;
                });
              });
            });
            const isAllChecked = totalActions > 0 && activeCount === totalActions;
            const colWidth = getRoleColWidth(col.key);

            return (
              <div
                key={col.key}
                className={`${colWidth} h-24 pt-2.5 pb-3 inline-flex flex-col justify-center items-center gap-4 overflow-hidden border-r border-slate-200 dark:border-slate-800`}
              >
                <div className="h-7 flex flex-col justify-center items-center gap-2.5">
                  <div className="px-2.5 py-0.5 rounded-2xl inline-flex justify-center items-center">
                    <div className="text-center text-blue-800 dark:text-blue-400 text-xs font-bold font-['Inter'] leading-tight">
                      {getRoleHeaderDisplay(col)}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleColumnAll(col.key, col.shortName)}
                  className="px-2 rounded-[3px] inline-flex justify-start items-center gap-1 cursor-pointer hover:opacity-80 transition"
                >
                  <img src="/icons/ceo1983_icon_1/square-check.svg" className="size-2.5" alt="check" />
                  <div
                    className={`${
                      isAllChecked ? "text-blue-800 dark:text-blue-400" : "text-slate-800 dark:text-slate-300"
                    } text-[10px] font-semibold font-['Inter']`}
                  >
                    {isAllChecked ? "Bỏ chọn hết" : "Chọn tất cả"}
                  </div>
                </button>
              </div>
            );
          })}

          <div className="sticky right-0 z-30 min-w-[130px] self-stretch flex justify-center items-center bg-slate-100 dark:bg-slate-800 border-l border-slate-200 dark:border-slate-800 shadow-[-2px_0_5px_rgba(0,0,0,0.08)]">
            <div className="justify-start text-slate-900 dark:text-white text-xs font-bold font-['Inter']">THAO TÁC</div>
          </div>
        </div>

        {/* Các Chức Năng và Thao Tác Con */}
        {flatFeatures.map(({ feat, catId, catName }) => {
          const isFeatExpanded = expandedNodes[feat.id] ?? true;

          return (
            <React.Fragment key={feat.id}>
              {/* Tiêu đề Chức năng (Nhóm nghiệp vụ) */}
              <div className="w-full min-w-max h-11 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 inline-flex justify-start items-center">
                <div className="sticky left-0 z-10 w-fit self-stretch pl-4 flex justify-start items-center gap-2.5 bg-slate-50/95 dark:bg-slate-800/95 pr-6">
                  <button
                    type="button"
                    onClick={() => toggleExpand(feat.id)}
                    className="flex items-center gap-2 cursor-pointer hover:text-blue-800 transition"
                  >
                    <img
                      src="/icons/ceo1983_icon_1/chevron-down.svg"
                      className={`size-2.5 transition-transform ${isFeatExpanded ? "" : "-rotate-90"}`}
                      alt="toggle"
                    />
                    <div className="justify-start text-slate-900 dark:text-white text-xs font-bold font-['Inter']">
                      {feat.name}
                    </div>
                  </button>
                  <div className="justify-start text-slate-500 text-[10px] font-medium font-['Inter']">
                    ({feat.actions.length} thao tác)
                  </div>
                </div>
              </div>

              {/* Danh sách các Thao tác con */}
              {isFeatExpanded &&
                feat.actions.map((action) => (
                  <div
                    key={action.id}
                    className="w-full min-w-max h-10 border-b border-zinc-200 dark:border-slate-800 inline-flex justify-start items-start hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <div className="sticky left-0 z-20 w-60 min-w-[240px] self-stretch px-4 border-r border-gray-200 dark:border-slate-800 flex justify-start items-center bg-white dark:bg-slate-900 shadow-[2px_0_5px_rgba(0,0,0,0.06)]">
                      <div
                        className="flex-1 justify-start text-slate-900 dark:text-slate-200 text-xs font-semibold font-['Inter'] leading-4 truncate"
                        title={action.name}
                      >
                        {action.name}
                      </div>
                    </div>

                    {orderedRoles.map((col) => {
                      const isChecked = !!action.roles[col.key];
                      const colWidth = getRoleColWidth(col.key);

                      return (
                        <div
                          key={col.key}
                          className={`${colWidth} self-stretch bg-slate-50/30 dark:bg-slate-900/30 flex justify-center items-center border-r border-slate-100 dark:border-slate-800/50`}
                        >
                          <button
                            type="button"
                            onClick={() => handleTogglePermission(catId, feat.id, action.id, col.key)}
                            className="cursor-pointer"
                            title={`${isChecked ? "Bỏ quyền" : "Cấp quyền"} cho ${col.name}`}
                          >
                            {isChecked ? (
                              <div className="size-5 bg-blue-800 rounded-sm outline outline-1 outline-offset-[-1px] outline-blue-800 flex justify-center items-center overflow-hidden">
                                <img src="/icons/ceo1983_icon_1/check.svg" className="size-3 invert brightness-0" alt="check" />
                              </div>
                            ) : (
                              <div className="size-5 bg-white/0 rounded-sm border border-slate-200 dark:border-slate-700" />
                            )}
                          </button>
                        </div>
                      );
                    })}

                    <div className="sticky right-0 z-20 min-w-[130px] self-stretch flex justify-center items-center gap-1.5 bg-white dark:bg-slate-900 border-l border-gray-200 dark:border-slate-800 shadow-[-2px_0_5px_rgba(0,0,0,0.06)] px-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedDetail({ action, featureName: feat.name, categoryName: catName });
                          setDetailModalOpen(true);
                        }}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-800 transition cursor-pointer dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300"
                        title="Xem chi tiết"
                        aria-label="Xem chi tiết"
                      >
                        <Eye className="h-3.5 w-3.5" strokeWidth={2.2} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStartEditAction(catId, feat.id, action)}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 text-blue-800 hover:bg-blue-100 hover:text-blue-900 transition cursor-pointer dark:bg-blue-950/50 dark:border-blue-800 dark:text-blue-300"
                        title="Chỉnh sửa thao tác"
                        aria-label="Chỉnh sửa thao tác"
                      >
                        <Pencil className="h-3.5 w-3.5" strokeWidth={2.2} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteAction(catId, feat.id, action.id, action.name)}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 hover:text-rose-800 transition cursor-pointer dark:bg-rose-950/50 dark:border-rose-800 dark:text-rose-300"
                        title="Xóa thao tác"
                        aria-label="Xóa thao tác"
                      >
                        <Trash2 className="h-3.5 w-3.5" strokeWidth={2.2} />
                      </button>
                    </div>
                  </div>
                ))}
            </React.Fragment>
          );
        })}
      </div>

      {/* ── MODAL 1: XEM CHI TIẾT QUYỀN / THAO TÁC CON ── */}
      {detailModalOpen && selectedDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-[#003B95]" />
                <h3 className="text-base font-bold text-foreground">Chi Tiết Quyền Thao Tác</h3>
              </div>
              <button onClick={() => setDetailModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div>
                <span className="font-semibold text-muted-foreground">Tên thao tác:</span>
                <p className="font-bold text-sm text-foreground mt-0.5">{selectedDetail.action.name}</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="font-semibold text-muted-foreground">Chức năng:</span>
                  <p className="font-medium text-foreground">{selectedDetail.featureName}</p>
                </div>
                <div>
                  <span className="font-semibold text-muted-foreground">Nhóm nghiệp vụ:</span>
                  <p className="font-medium text-foreground">{selectedDetail.categoryName}</p>
                </div>
              </div>

              <div>
                <span className="font-semibold text-muted-foreground">Mã quyền (Code):</span>
                <p className="font-mono text-xs font-bold text-[#003B95] bg-muted/60 p-1.5 rounded-lg mt-0.5">
                  {selectedDetail.action.code}
                </p>
              </div>

              {selectedDetail.action.apiEndpoint && (
                <div>
                  <span className="font-semibold text-muted-foreground">API Endpoint:</span>
                  <p className="font-mono text-[11px] text-foreground bg-muted p-1.5 rounded-lg mt-0.5">
                    {selectedDetail.action.apiEndpoint}
                  </p>
                </div>
              )}

              <div>
                <span className="font-semibold text-muted-foreground">Mô tả nghiệp vụ:</span>
                <p className="text-foreground mt-0.5">{selectedDetail.action.description}</p>
              </div>

              <div>
                <span className="font-semibold text-muted-foreground block mb-1">Các Ban & Vai Trò được cấp quyền:</span>
                <div className="flex flex-wrap gap-1.5">
                  {COMMITTEES.filter((c) => !!selectedDetail.action.roles[c.key]).map((c) => (
                    <span key={c.key} className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${c.color}`}>
                      {c.name}
                    </span>
                  ))}
                  {SYSTEM_ROLES.filter((r) => !!selectedDetail.action.roles[r.key]).map((r) => (
                    <span key={r.key} className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${r.color}`}>
                      {r.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-border flex justify-end">
              <button
                onClick={() => setDetailModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-secondary text-foreground text-xs font-semibold hover:bg-secondary/80 transition"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 2: THÊM CHỨC NĂNG MỚI ── */}
      {addFeatureOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <FolderPlus className="h-5 w-5 text-[#003B95]" />
                <h3 className="text-base font-bold text-foreground">Thêm Chức Năng Mới Vào Ma Trận</h3>
              </div>
              <button onClick={() => setAddFeatureOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Khối quét tự động phát hiện chức năng mới trên giao diện */}
            <div className="rounded-xl border border-blue-500/20 bg-blue-50/50 dark:bg-blue-950/20 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                  Tự động nhận diện chức năng giao diện
                </span>
                <button
                  type="button"
                  onClick={handleScanNewFeatures}
                  className="px-2.5 py-1 text-xs font-black rounded-lg bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-500 text-slate-950 transition flex items-center gap-1 shadow-xs shadow-amber-500/20"
                >
                  <RefreshCw className="h-3 w-3 text-slate-950" />
                  Quét ngay
                </button>
              </div>
              {detectedFeatures.length > 0 && (
                <div className="pt-1">
                  <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                    Chọn nhanh từ {detectedFeatures.length} chức năng hệ thống phát hiện:
                  </label>
                  <select
                    onChange={(e) => {
                      const sel = detectedFeatures.find((f) => f.route === e.target.value);
                      if (sel) {
                        setNewFeatureName(sel.name);
                        setNewFeatureRoute(sel.route);
                        setNewFeatureDesc(sel.desc);
                        if (sel.catId) setTargetCatId(sel.catId);
                      }
                    }}
                    className="w-full rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs text-foreground focus:ring-2 focus:ring-[#003B95]"
                  >
                    <option value="">-- Chọn chức năng nhận diện --</option>
                    {detectedFeatures.map((f) => (
                      <option key={f.route} value={f.route}>
                        {f.name} ({f.route})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <form onSubmit={handleCreateFeature} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-foreground mb-1">Chọn Nhóm Nghiệp Vụ *:</label>
                <select
                  value={targetCatId}
                  onChange={(e) => setTargetCatId(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs text-foreground focus:ring-2 focus:ring-[#003B95]"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">Tên Chức Năng *:</label>
                <input
                  type="text"
                  required
                  value={newFeatureName}
                  onChange={(e) => setNewFeatureName(e.target.value)}
                  placeholder="Ví dụ: Quản Lý Khảo Sát Doanh Nghiệp"
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs text-foreground focus:ring-2 focus:ring-[#003B95]"
                />
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">Đường Dẫn Route:</label>
                <input
                  type="text"
                  value={newFeatureRoute}
                  onChange={(e) => setNewFeatureRoute(e.target.value)}
                  placeholder="Ví dụ: /surveys"
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs text-foreground focus:ring-2 focus:ring-[#003B95]"
                />
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">Mô Tả Nghiệp Vụ:</label>
                <textarea
                  rows={2}
                  value={newFeatureDesc}
                  onChange={(e) => setNewFeatureDesc(e.target.value)}
                  placeholder="Mô tả tóm tắt mục tiêu của chức năng này..."
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs text-foreground focus:ring-2 focus:ring-[#003B95]"
                />
              </div>

              <div className="pt-3 border-t border-border flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAddFeatureOpen(false)}
                  className="px-4 py-2 rounded-xl bg-secondary text-foreground text-xs font-semibold hover:bg-secondary/80 transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black transition shadow-xs shadow-amber-500/20 flex items-center gap-1.5"
                >
                  <Save className="h-3.5 w-3.5 text-slate-950" />
                  Thêm & Lưu Vào Cơ Sở Dữ Liệu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 3: THÊM QUYỀN / THAO TÁC CON MỚI ── */}
      {addActionOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-amber-600" />
                <h3 className="text-base font-bold text-foreground">Thêm Quyền / Thao Tác Chi Tiết</h3>
              </div>
              <button onClick={() => setAddActionOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAction} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-foreground mb-1">Chọn Chức Năng Trực Thuộc *:</label>
                <select
                  value={targetFeatId}
                  onChange={(e) => setTargetFeatId(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs text-foreground focus:ring-2 focus:ring-[#003B95]"
                >
                  {allFeaturesList.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.catName})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-foreground mb-1">Tên Thao Tác *:</label>
                  <input
                    type="text"
                    required
                    value={newActionName}
                    onChange={(e) => setNewActionName(e.target.value)}
                    placeholder="Ví dụ: Chỉnh sửa trạng thái"
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs text-foreground focus:ring-2 focus:ring-[#003B95]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-foreground mb-1">Mã Quyền (Code):</label>
                  <input
                    type="text"
                    value={newActionCode}
                    onChange={(e) => setNewActionCode(e.target.value)}
                    placeholder="Ví dụ: EDIT_STATUS"
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs text-foreground uppercase font-mono focus:ring-2 focus:ring-[#003B95]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">API Endpoint Mapped:</label>
                <input
                  type="text"
                  value={newActionApi}
                  onChange={(e) => setNewActionApi(e.target.value)}
                  placeholder="Ví dụ: PUT /api/status/:id"
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs text-foreground font-mono focus:ring-2 focus:ring-[#003B95]"
                />
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">Mô Tả Nghiệp Vụ:</label>
                <textarea
                  rows={2}
                  value={newActionDesc}
                  onChange={(e) => setNewActionDesc(e.target.value)}
                  placeholder="Mô tả quyền hạn và giới hạn thao tác..."
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs text-foreground focus:ring-2 focus:ring-[#003B95]"
                />
              </div>

              {/* Tích chọn ban chuyên môn được cấp quyền ban đầu */}
              {/* Tích chọn 5 Role hệ thống */}
              <div>
                <label className="block font-semibold text-foreground mb-1.5">Cấp Quyền Cho 5 Vai Trò Hệ Thống:</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {SYSTEM_ROLES.map((role) => {
                    const isChecked = !!newActionRoles[role.key];
                    return (
                      <button
                        type="button"
                        key={role.key}
                        onClick={() =>
                          setNewActionRoles((prev) => ({
                            ...prev,
                            [role.key]: !isChecked,
                          }))
                        }
                        className={`flex items-center gap-1.5 p-2 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                          isChecked ? role.color : "border-border text-muted-foreground bg-muted/20"
                        }`}
                      >
                        <Check className={`h-3 w-3 stroke-[3] ${isChecked ? "opacity-100" : "opacity-0"}`} />
                        <span className="truncate">{role.shortName}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 border-t border-border flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAddActionOpen(false)}
                  className="px-4 py-2 rounded-xl bg-secondary text-foreground text-xs font-semibold hover:bg-secondary/80 transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 transition shadow-xs"
                >
                  Thêm Quyền
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 4: CHỈNH SỬA THAO TÁC ── */}
      {editActionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-blue-600" />
                <h3 className="text-base font-bold text-foreground">Chỉnh Sửa Quyền / Thao Tác</h3>
              </div>
              <button onClick={() => setEditActionModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditedAction} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-foreground mb-1">Tên Thao Tác *:</label>
                <input
                  type="text"
                  required
                  value={editActionName}
                  onChange={(e) => setEditActionName(e.target.value)}
                  placeholder="Ví dụ: Chỉnh sửa trạng thái"
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs text-foreground focus:ring-2 focus:ring-[#003B95]"
                />
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">Mã Quyền (Code):</label>
                <input
                  type="text"
                  value={editActionCode}
                  onChange={(e) => setEditActionCode(e.target.value)}
                  placeholder="Ví dụ: EDIT_STATUS"
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs text-foreground uppercase font-mono focus:ring-2 focus:ring-[#003B95]"
                />
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">API Endpoint Mapped:</label>
                <input
                  type="text"
                  value={editActionApi}
                  onChange={(e) => setEditActionApi(e.target.value)}
                  placeholder="Ví dụ: PUT /api/status/:id"
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs text-foreground font-mono focus:ring-2 focus:ring-[#003B95]"
                />
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">Mô Tả Nghiệp Vụ:</label>
                <textarea
                  rows={2}
                  value={editActionDesc}
                  onChange={(e) => setEditActionDesc(e.target.value)}
                  placeholder="Mô tả quyền hạn và giới hạn thao tác..."
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs text-foreground focus:ring-2 focus:ring-[#003B95]"
                />
              </div>

              <div className="pt-3 border-t border-border flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditActionModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-secondary text-foreground text-xs font-semibold hover:bg-secondary/80 transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-800 text-white text-xs font-bold hover:bg-blue-900 transition shadow-xs"
                >
                  Cập Nhật Thao Tác
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
