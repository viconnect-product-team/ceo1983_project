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
import { RBAC_MATRIX_STORAGE_KEY, normalizeActionRoles } from "@/lib/rbac-permission-helpers";

// ── ĐÚNG 6 BAN CHUYÊN MÔN (TUYỆT ĐỐI KHÔNG CÓ BAN ĐIỀU HÀNH) ──
export interface CommitteeRole {
  key: string;
  name: string;
  shortName: string;
  color: string;
}

export const COMMITTEES: CommitteeRole[] = [
  { key: "bqt", name: "Ban Quản Trị", shortName: "Ban Quản Trị", color: "text-blue-700 bg-blue-50 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800" },
  { key: "thu_ky", name: "Ban Thư Ký", shortName: "Ban Thư Ký", color: "text-purple-700 bg-purple-50 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800" },
  { key: "thanh_vien", name: "Ban Thành Viên", shortName: "Ban Thành Viên", color: "text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800" },
  { key: "xuc_tien", name: "Ban Xúc Tiến Thương Mại", shortName: "Ban Xúc Tiến TM", color: "text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800" },
  { key: "truyen_thong", name: "Ban Truyền Thông", shortName: "Ban Truyền Thông", color: "text-rose-700 bg-rose-50 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800" },
  { key: "thien_nguyen", name: "Ban Thiện Nguyện", shortName: "Ban Thiện Nguyện", color: "text-teal-700 bg-teal-50 border-teal-200 dark:bg-teal-950/50 dark:text-teal-300 dark:border-teal-800" },
];

// ── ĐÚNG 5 ROLE HỆ THỐNG ──
export interface SystemRole {
  key: string;
  name: string;
  shortName: string;
  color: string;
  desc: string;
}

export const SYSTEM_ROLES: SystemRole[] = [
  { key: "quan_tri", name: "Quản trị", shortName: "Quản trị", color: "text-indigo-700 bg-indigo-50 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800", desc: "Toàn quyền hệ thống & phân quyền cao nhất" },
  { key: "admin", name: "Admin", shortName: "Admin", color: "text-purple-700 bg-purple-50 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800", desc: "Quản trị viên vận hành nghiệp vụ CRM" },
  { key: "tong_thu_ky", name: "Tổng thư ký", shortName: "Tổng thư ký", color: "text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800", desc: "Điều phối thư ký, sự kiện, cuộc họp & công văn" },
  { key: "truong_ban", name: "Trưởng ban", shortName: "Trưởng ban", color: "text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800", desc: "Lãnh đạo ban chuyên môn, khởi tạo & duyệt đề xuất ban" },
  { key: "member", name: "Thành viên", shortName: "Thành viên", color: "text-slate-700 bg-slate-50 border-slate-200 dark:bg-slate-900/50 dark:text-slate-300 dark:border-slate-800", desc: "Hội viên chính thức tham gia sinh hoạt & giao thương" },
];

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
          { id: "act_mem_view", name: "Xem danh sách & hồ sơ hội viên", code: "MEM_VIEW", description: "Tra cứu thông tin cá nhân, chức danh, doanh nghiệp", apiEndpoint: "GET /api/members", roles: { bqt: true, thu_ky: true, thanh_vien: true, xuc_tien: true, truyen_thong: true, thien_nguyen: true, quan_tri: true, admin: true, tong_thu_ky: true, truong_ban: true, member: true } },
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
          { id: "act_com_view", name: "Xem danh sách & hồ sơ doanh nghiệp", code: "COM_VIEW", description: "Tra cứu thông tin công ty, mã số thuế, trụ sở", apiEndpoint: "GET /api/companies", roles: { bqt: true, thu_ky: true, thanh_vien: true, xuc_tien: true, truyen_thong: true, thien_nguyen: true, quan_tri: true, admin: true, tong_thu_ky: true, truong_ban: true, member: true } },
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
          { id: "act_seg_view", name: "Xem danh sách phân loại hội viên", code: "SEG_VIEW", description: "Tra cứu danh sách nhóm phân loại và tiêu chí", apiEndpoint: "GET /api/segments", roles: { bqt: true, thu_ky: true, thanh_vien: true, quan_tri: true, admin: true, tong_thu_ky: true, truong_ban: true } },
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
          { id: "act_evt_view", name: "Xem danh sách & chi tiết sự kiện", code: "EVT_VIEW", description: "Tra cứu thông tin, địa điểm, timeline sự kiện", apiEndpoint: "GET /api/events", roles: { bqt: true, thu_ky: true, thanh_vien: true, xuc_tien: true, truyen_thong: true, thien_nguyen: true, quan_tri: true, admin: true, tong_thu_ky: true, truong_ban: true, member: true } },
          { id: "act_evt_add", name: "Thêm mới sự kiện", code: "EVT_ADD", description: "Tạo chương trình sự kiện mới", apiEndpoint: "POST /api/events", roles: { bqt: true, thu_ky: true, truyen_thong: true, quan_tri: true, admin: true, tong_thu_ky: true, truong_ban: true } },
          { id: "act_evt_edit", name: "Chỉnh sửa thông tin sự kiện", code: "EVT_EDIT", description: "Cập nhật nội dung, thời gian, vé tham dự", apiEndpoint: "PUT /api/events/:id", roles: { bqt: true, thu_ky: true, truyen_thong: true, quan_tri: true, admin: true, tong_thu_ky: true, truong_ban: true } },
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
          { id: "act_evto_view", name: "Xem tổng quan & chỉ số sự kiện", code: "EVTO_VIEW", description: "Xem biểu đồ số lượng người tham dự, tỷ lệ tham gia", apiEndpoint: "GET /api/events/overview", roles: { bqt: true, thu_ky: true, thanh_vien: true, truyen_thong: true, quan_tri: true, admin: true, tong_thu_ky: true, truong_ban: true } },
          { id: "act_evto_export", name: "Xuất báo cáo tổng quan sự kiện", code: "EVTO_EXPORT", description: "Xuất file thống kê sự kiện theo quý/năm", apiEndpoint: "GET /api/events/overview/export", roles: { bqt: true, thu_ky: true, quan_tri: true, admin: true, tong_thu_ky: true } },
        ],
      },
      {
        id: "feat_meetings",
        name: "Cuộc họp",
        route: "/meetings",
        description: "Quản lý cuộc họp ban, họp BCH trực tuyến/trực tiếp và đặt phòng họp",
        actions: [
          { id: "act_meet_view", name: "Xem danh sách cuộc họp", code: "MEET_VIEW", description: "Tra cứu lịch họp, phòng họp Sapphire, Zoom/Meet", apiEndpoint: "GET /api/meetings", roles: { bqt: true, thu_ky: true, thanh_vien: true, xuc_tien: true, truyen_thong: true, thien_nguyen: true, quan_tri: true, admin: true, tong_thu_ky: true, truong_ban: true, member: true } },
          { id: "act_meet_add", name: "Tạo cuộc họp mới", code: "MEET_ADD", description: "Khởi tạo cuộc họp ban kèm đăng ký phòng họp", apiEndpoint: "POST /api/meetings", roles: { bqt: true, thu_ky: true, thanh_vien: true, xuc_tien: true, truyen_thong: true, thien_nguyen: true, quan_tri: true, admin: true, tong_thu_ky: true, truong_ban: true } },
          { id: "act_meet_edit", name: "Chỉnh sửa thông tin cuộc họp", code: "MEET_EDIT", description: "Điều chỉnh thời gian, đường link, đại biểu tham dự", apiEndpoint: "PUT /api/meetings/:id", roles: { bqt: true, thu_ky: true, quan_tri: true, admin: true, tong_thu_ky: true, truong_ban: true } },
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
          { id: "act_vote_view", name: "Xem danh sách kỳ biểu quyết", code: "VOTE_VIEW", description: "Xem nội dung biểu quyết và kết quả công bố", apiEndpoint: "GET /api/voting", roles: { bqt: true, thu_ky: true, thanh_vien: true, xuc_tien: true, truyen_thong: true, thien_nguyen: true, quan_tri: true, admin: true, tong_thu_ky: true, truong_ban: true, member: true } },
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
          { id: "act_ereg_view", name: "Xem danh sách đăng ký sự kiện", code: "EREG_VIEW", description: "Xem thông tin đại biểu đã đăng ký vé tham dự", apiEndpoint: "GET /api/event-registrations", roles: { bqt: true, thu_ky: true, thanh_vien: true, truyen_thong: true, quan_tri: true, admin: true, tong_thu_ky: true, truong_ban: true } },
          { id: "act_ereg_approve", name: "Phê duyệt đăng ký tham gia", code: "EREG_APPROVE", description: "Xác nhận duyệt vé cho đại biểu", apiEndpoint: "PATCH /api/event-registrations/:id/approve", roles: { bqt: true, thu_ky: true, truyen_thong: true, quan_tri: true, admin: true, tong_thu_ky: true } },
          { id: "act_ereg_edit", name: "Chỉnh sửa thông tin đăng ký", code: "EREG_EDIT", description: "Điều chỉnh số lượng ghế hoặc thông tin người đi kèm", apiEndpoint: "PUT /api/event-registrations/:id", roles: { bqt: true, thu_ky: true, truyen_thong: true, quan_tri: true, admin: true } },
          { id: "act_ereg_delete", name: "Xóa / Hủy đăng ký", code: "EREG_DELETE", description: "Hủy bỏ đăng ký của đại biểu", apiEndpoint: "DELETE /api/event-registrations/:id", roles: { bqt: true, thu_ky: true, quan_tri: true, admin: true } },
          { id: "act_ereg_export", name: "Xuất danh sách đại biểu", code: "EREG_EXPORT", description: "Trích xuất file danh sách khách mời tham dự", apiEndpoint: "GET /api/event-registrations/export", roles: { bqt: true, thu_ky: true, thanh_vien: true, truyen_thong: true, quan_tri: true, admin: true, tong_thu_ky: true } },
        ],
      },
      {
        id: "feat_checkin",
        name: "Check-in (QR)",
        route: "/checkin",
        description: "Công cụ quét mã QR điểm danh khách mời và đại biểu tại cửa",
        actions: [
          { id: "act_chk_view", name: "Xem lịch sử check-in", code: "CHK_VIEW", description: "Theo dõi số lượng khách đã có mặt theo thời gian thực", apiEndpoint: "GET /api/checkin", roles: { bqt: true, thu_ky: true, thanh_vien: true, truyen_thong: true, quan_tri: true, admin: true, tong_thu_ky: true, truong_ban: true } },
          { id: "act_chk_scan", name: "Quét mã QR check-in", code: "CHK_SCAN", description: "Mở camera quét vé QR để điểm danh đại biểu", apiEndpoint: "POST /api/checkin/scan", roles: { bqt: true, thu_ky: true, thanh_vien: true, truyen_thong: true, quan_tri: true, admin: true, tong_thu_ky: true, truong_ban: true } },
          { id: "act_chk_manual", name: "Điểm danh thủ công bằng tay", code: "CHK_MANUAL", description: "Tìm kiếm và xác nhận đại biểu khi không có mã QR", apiEndpoint: "POST /api/checkin/manual", roles: { bqt: true, thu_ky: true, truyen_thong: true, quan_tri: true, admin: true, tong_thu_ky: true } },
        ],
      },
      {
        id: "feat_checkin_qr",
        name: "Mã QR check-in sự kiện",
        route: "/checkin-qr",
        description: "Quản lý và xuất mã QR tĩnh tại bàn lễ tân / Standee để hội viên tự quét",
        actions: [
          { id: "act_chkq_view", name: "Xem mã QR sự kiện & Standee", code: "CHKQ_VIEW", description: "Hiển thị mã QR check-in lên màn hình hoặc máy chiếu", apiEndpoint: "GET /api/checkin-qr", roles: { bqt: true, thu_ky: true, thanh_vien: true, truyen_thong: true, quan_tri: true, admin: true, tong_thu_ky: true, truong_ban: true } },
          { id: "act_chkq_export", name: "Tải về / In mã QR Standee", code: "CHKQ_EXPORT", description: "Tải file ảnh mã QR độ phân giải cao để in ấn", apiEndpoint: "GET /api/checkin-qr/download", roles: { bqt: true, thu_ky: true, truyen_thong: true, quan_tri: true, admin: true, tong_thu_ky: true } },
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
          { id: "act_spn_view", name: "Xem danh sách nhà tài trợ", code: "SPN_VIEW", description: "Tra cứu thông tin nhà tài trợ và hạng mức tài trợ", apiEndpoint: "GET /api/sponsors", roles: { bqt: true, thu_ky: true, xuc_tien: true, truyen_thong: true, quan_tri: true, admin: true, tong_thu_ky: true, truong_ban: true, member: true } },
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
          { id: "act_spk_view", name: "Xem danh mục gói tài trợ", code: "SPK_VIEW", description: "Xem giá trị định mức và quyền lợi các gói", apiEndpoint: "GET /api/sponsor-packages", roles: { bqt: true, thu_ky: true, xuc_tien: true, truyen_thong: true, quan_tri: true, admin: true, tong_thu_ky: true, truong_ban: true } },
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
          { id: "act_exp_add", name: "Lập đề xuất / Phiếu chi mới", code: "EXP_ADD", description: "Tạo phiếu chi tiền kèm hóa đơn chứng từ", apiEndpoint: "POST /api/expenses", roles: { bqt: true, thu_ky: true, thanh_vien: true, xuc_tien: true, truyen_thong: true, thien_nguyen: true, quan_tri: true, admin: true, tong_thu_ky: true, truong_ban: true } },
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
          { id: "act_ntf_view", name: "Xem danh sách thông báo", code: "NTF_VIEW", description: "Xem các thông báo đã gửi trong hệ thống", apiEndpoint: "GET /api/notifications", roles: { bqt: true, thu_ky: true, thanh_vien: true, xuc_tien: true, truyen_thong: true, thien_nguyen: true, quan_tri: true, admin: true, tong_thu_ky: true, truong_ban: true, member: true } },
          { id: "act_ntf_send", name: "Gửi thông báo mới (Push / In-App)", code: "NTF_SEND", description: "Bắn thông báo tức thì tới toàn thể hoặc theo ban", apiEndpoint: "POST /api/notifications", roles: { bqt: true, thu_ky: true, truyen_thong: true, quan_tri: true, admin: true, tong_thu_ky: true, truong_ban: true } },
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
          { id: "act_nws_view", name: "Xem danh sách tin tức & bài viết", code: "NWS_VIEW", description: "Đọc bài viết và lượt tương tác bài", apiEndpoint: "GET /api/news", roles: { bqt: true, thu_ky: true, thanh_vien: true, xuc_tien: true, truyen_thong: true, thien_nguyen: true, quan_tri: true, admin: true, tong_thu_ky: true, truong_ban: true, member: true } },
          { id: "act_nws_add", name: "Thêm bài viết mới", code: "NWS_ADD", description: "Soạn thảo bài viết kèm ảnh và video", apiEndpoint: "POST /api/news", roles: { bqt: true, thu_ky: true, truyen_thong: true, quan_tri: true, admin: true, tong_thu_ky: true, truong_ban: true } },
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
          { id: "act_prk_view", name: "Xem danh sách tiện ích", code: "PRK_VIEW", description: "Xem các tiện ích dịch vụ, phòng chờ VIP, sân golf", apiEndpoint: "GET /api/perks", roles: { bqt: true, thu_ky: true, thanh_vien: true, xuc_tien: true, truyen_thong: true, thien_nguyen: true, quan_tri: true, admin: true, tong_thu_ky: true, truong_ban: true, member: true } },
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
          { id: "act_bnf_view", name: "Xem danh sách quyền lợi", code: "BNF_VIEW", description: "Tra cứu quyền lợi theo từng hạng thẻ hội viên", apiEndpoint: "GET /api/benefits", roles: { bqt: true, thu_ky: true, thanh_vien: true, xuc_tien: true, truyen_thong: true, thien_nguyen: true, quan_tri: true, admin: true, tong_thu_ky: true, truong_ban: true, member: true } },
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
          { id: "act_net_view", name: "Xem mạng lưới kết nối", code: "NET_VIEW", description: "Tra cứu kết nối và sơ đồ quan hệ hội viên", apiEndpoint: "GET /api/network", roles: { bqt: true, thu_ky: true, thanh_vien: true, xuc_tien: true, truyen_thong: true, thien_nguyen: true, quan_tri: true, admin: true, tong_thu_ky: true, truong_ban: true, member: true } },
          { id: "act_net_connect", name: "Khởi tạo kết nối & Nhắn tin B2B", code: "NET_CONNECT", description: "Gửi lời mời kết nối trực tiếp đến doanh nghiệp", apiEndpoint: "POST /api/network/connect", roles: { bqt: true, thu_ky: true, thanh_vien: true, xuc_tien: true, truyen_thong: true, thien_nguyen: true, quan_tri: true, admin: true, tong_thu_ky: true, truong_ban: true, member: true } },
          { id: "act_net_export", name: "Xuất dữ liệu kết nối", code: "NET_EXPORT", description: "Xuất file danh bạ mạng lưới kết nối", apiEndpoint: "GET /api/network/export", roles: { bqt: true, thu_ky: true, xuc_tien: true, quan_tri: true, admin: true, tong_thu_ky: true } },
        ],
      },
      {
        id: "feat_bc_meetings",
        name: "Cuộc gặp",
        route: "/business-connect/meetings",
        description: "Quản lý các cuộc hẹn gặp kết nối 1-on-1 Business Connect giữa các CEO",
        actions: [
          { id: "act_bcm_view", name: "Xem danh sách cuộc hẹn gặp", code: "BCM_VIEW", description: "Tra cứu lịch hẹn gặp 1-1 giữa các hội viên", apiEndpoint: "GET /api/business-connect/meetings", roles: { bqt: true, thu_ky: true, thanh_vien: true, xuc_tien: true, truyen_thong: true, thien_nguyen: true, quan_tri: true, admin: true, tong_thu_ky: true, truong_ban: true, member: true } },
          { id: "act_bcm_add", name: "Tạo lịch hẹn gặp mới", code: "BCM_ADD", description: "Đặt lịch hẹn gặp giao lưu trực tiếp", apiEndpoint: "POST /api/business-connect/meetings", roles: { bqt: true, thu_ky: true, thanh_vien: true, xuc_tien: true, truyen_thong: true, thien_nguyen: true, quan_tri: true, admin: true, tong_thu_ky: true, truong_ban: true, member: true } },
          { id: "act_bcm_edit", name: "Chỉnh sửa lịch hẹn gặp", code: "BCM_EDIT", description: "Đổi thời gian hoặc địa điểm hẹn gặp", apiEndpoint: "PUT /api/business-connect/meetings/:id", roles: { bqt: true, thu_ky: true, quan_tri: true, admin: true, tong_thu_ky: true, truong_ban: true, member: true } },
          { id: "act_bcm_delete", name: "Hủy cuộc hẹn gặp", code: "BCM_DELETE", description: "Hủy lịch hẹn gặp", apiEndpoint: "DELETE /api/business-connect/meetings/:id", roles: { bqt: true, thu_ky: true, quan_tri: true, admin: true, tong_thu_ky: true, truong_ban: true, member: true } },
        ],
      },
      {
        id: "feat_marketplace",
        name: "Marketplace",
        route: "/marketplace",
        description: "Sàn giao dịch sản phẩm dịch vụ ưu đãi nội bộ của các doanh nghiệp hội viên",
        actions: [
          { id: "act_mkt_view", name: "Xem sản phẩm gian hàng", code: "MKT_VIEW", description: "Tra cứu sản phẩm, giá bán, chính sách chiết khấu", apiEndpoint: "GET /api/marketplace", roles: { bqt: true, thu_ky: true, thanh_vien: true, xuc_tien: true, truyen_thong: true, thien_nguyen: true, quan_tri: true, admin: true, tong_thu_ky: true, truong_ban: true, member: true } },
          { id: "act_mkt_add", name: "Đăng sản phẩm mới", code: "MKT_ADD", description: "Đưa sản phẩm lên gian hàng sàn Marketplace", apiEndpoint: "POST /api/marketplace", roles: { bqt: true, thu_ky: true, thanh_vien: true, xuc_tien: true, quan_tri: true, admin: true, tong_thu_ky: true, truong_ban: true, member: true } },
          { id: "act_mkt_edit", name: "Chỉnh sửa thông tin sản phẩm", code: "MKT_EDIT", description: "Cập nhật hình ảnh, giá bán, chiết khấu", apiEndpoint: "PUT /api/marketplace/:id", roles: { bqt: true, thu_ky: true, xuc_tien: true, quan_tri: true, admin: true, tong_thu_ky: true, truong_ban: true, member: true } },
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
          { id: "act_opp_view", name: "Xem sàn cơ hội giao thương", code: "OPP_VIEW", description: "Xem nhu cầu chào mua, chào bán của các doanh nghiệp", apiEndpoint: "GET /api/opportunities", roles: { bqt: true, thu_ky: true, thanh_vien: true, xuc_tien: true, truyen_thong: true, thien_nguyen: true, quan_tri: true, admin: true, tong_thu_ky: true, truong_ban: true, member: true } },
          { id: "act_opp_add", name: "Đăng cơ hội hợp tác mới", code: "OPP_ADD", description: "Tạo tin đăng nhu cầu hợp tác kinh doanh", apiEndpoint: "POST /api/opportunities", roles: { bqt: true, thu_ky: true, thanh_vien: true, xuc_tien: true, truyen_thong: true, thien_nguyen: true, quan_tri: true, admin: true, tong_thu_ky: true, truong_ban: true, member: true } },
          { id: "act_opp_edit", name: "Chỉnh sửa cơ hội", code: "OPP_EDIT", description: "Cập nhật yêu cầu hoặc thời hạn cơ hội", apiEndpoint: "PUT /api/opportunities/:id", roles: { bqt: true, thu_ky: true, xuc_tien: true, quan_tri: true, admin: true, tong_thu_ky: true, truong_ban: true, member: true } },
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
          { id: "act_tsk_view", name: "Xem danh sách công việc", code: "TSK_VIEW", description: "Xem các đầu việc được giao của ban và cá nhân", apiEndpoint: "GET /api/tasks", roles: { bqt: true, thu_ky: true, thanh_vien: true, xuc_tien: true, truyen_thong: true, thien_nguyen: true, quan_tri: true, admin: true, tong_thu_ky: true, truong_ban: true, member: true } },
          { id: "act_tsk_add", name: "Tạo nhiệm vụ mới", code: "TSK_ADD", description: "Khởi tạo công việc và gán người phụ trách", apiEndpoint: "POST /api/tasks", roles: { bqt: true, thu_ky: true, thanh_vien: true, xuc_tien: true, truyen_thong: true, thien_nguyen: true, quan_tri: true, admin: true, tong_thu_ky: true, truong_ban: true } },
          { id: "act_tsk_edit", name: "Chỉnh sửa & Giao việc", code: "TSK_EDIT", description: "Cập nhật deadline, mô tả công việc", apiEndpoint: "PUT /api/tasks/:id", roles: { bqt: true, thu_ky: true, thanh_vien: true, xuc_tien: true, truyen_thong: true, thien_nguyen: true, quan_tri: true, admin: true, tong_thu_ky: true, truong_ban: true } },
          { id: "act_tsk_delete", name: "Xóa nhiệm vụ", code: "TSK_DELETE", description: "Xóa nhiệm vụ", apiEndpoint: "DELETE /api/tasks/:id", roles: { bqt: true, thu_ky: true, quan_tri: true, admin: true, tong_thu_ky: true, truong_ban: true } },
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
          { id: "act_doc_view", name: "Xem và tải tài liệu", code: "DOC_VIEW", description: "Tra cứu điều lệ và văn bản lưu hành nội bộ", apiEndpoint: "GET /api/documents", roles: { bqt: true, thu_ky: true, thanh_vien: true, xuc_tien: true, truyen_thong: true, thien_nguyen: true, quan_tri: true, admin: true, tong_thu_ky: true, truong_ban: true, member: true } },
          { id: "act_doc_add", name: "Tải lên tài liệu mới", code: "DOC_ADD", description: "Lưu trữ văn bản, nghị quyết chính thức mới", apiEndpoint: "POST /api/documents", roles: { bqt: true, thu_ky: true, quan_tri: true, admin: true, tong_thu_ky: true } },
          { id: "act_doc_edit", name: "Chỉnh sửa tài liệu", code: "DOC_EDIT", description: "Cập nhật tên tài liệu hoặc ghi chú", apiEndpoint: "PUT /api/documents/:id", roles: { bqt: true, thu_ky: true, quan_tri: true, admin: true } },
          { id: "act_doc_delete", name: "Xóa tài liệu", code: "DOC_DELETE", description: "Xóa tài liệu không còn hiệu lực", apiEndpoint: "DELETE /api/documents/:id", roles: { bqt: true, quan_tri: true, admin: true } },
        ],
      },
      {
        id: "feat_business_cards",
        name: "Quản lý Thẻ Doanh Nhân",
        route: "/admin/business-cards",
        description: "Quản lý phôi danh thiếp điện tử thông minh và thẻ hội viên vật lý NFC",
        actions: [
          { id: "act_crd_view", name: "Xem danh sách Thẻ Doanh Nhân", code: "CRD_VIEW", description: "Tra cứu thẻ thông minh của các thành viên", apiEndpoint: "GET /api/admin/business-cards", roles: { bqt: true, thu_ky: true, thanh_vien: true, quan_tri: true, admin: true, tong_thu_ky: true } },
          { id: "act_crd_add", name: "Cấp mới Thẻ Doanh Nhân", code: "CRD_ADD", description: "Gán mã thẻ NFC và kích hoạt danh thiếp số mới", apiEndpoint: "POST /api/admin/business-cards", roles: { bqt: true, thu_ky: true, quan_tri: true, admin: true } },
          { id: "act_crd_edit", name: "Chỉnh sửa thông tin thẻ", code: "CRD_EDIT", description: "Cập nhật template hoặc liên kết thẻ", apiEndpoint: "PUT /api/admin/business-cards/:id", roles: { bqt: true, thu_ky: true, quan_tri: true, admin: true } },
          { id: "act_crd_delete", name: "Khóa / Xóa Thẻ Doanh Nhân", code: "CRD_DELETE", description: "Thu hồi hoặc khóa thẻ khi mất/hỏng", apiEndpoint: "DELETE /api/admin/business-cards/:id", roles: { bqt: true, quan_tri: true, admin: true } },
        ],
      },
    ],
  },
];

const STORAGE_KEY = RBAC_MATRIX_STORAGE_KEY;

export function RbacPermissionMatrix() {
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

  // Form thêm chức năng mới
  const [targetCatId, setTargetCatId] = useState(INITIAL_CATEGORIES[0]?.id || "");
  const [newFeatureName, setNewFeatureName] = useState("");
  const [newFeatureRoute, setNewFeatureRoute] = useState("");
  const [newFeatureDesc, setNewFeatureDesc] = useState("");

  // Form thêm quyền / thao tác mới
  const [targetFeatId, setTargetFeatId] = useState("");
  const [newActionName, setNewActionName] = useState("");
  const [newActionCode, setNewActionCode] = useState("");
  const [newActionDesc, setNewActionDesc] = useState("");
  const [newActionApi, setNewActionApi] = useState("");
  const [newActionRoles, setNewActionRoles] = useState<Record<string, boolean>>({ bqt: true, quan_tri: true });

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
      }
      setTimeout(() => {
        setSaving(false);
        toast.success("Đã lưu toàn bộ Ma Trận Phân Quyền 5 Cấp Bậc vào CSDL thành công!");
      }, 300);
    } catch {
      setSaving(false);
      toast.error("Lỗi lưu ma trận");
    }
  };

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
    toast.success("Đã khôi phục ma trận phân quyền về chuẩn 5 vai trò hệ thống!");
  };

  // Submit thêm chức năng
  const handleCreateFeature = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFeatureName.trim()) {
      toast.error("Vui lòng nhập tên chức năng");
      return;
    }
    const newFeat: TreeFeature = {
      id: `feat_${Date.now()}`,
      name: newFeatureName.trim(),
      route: newFeatureRoute.trim() || "/custom-feature",
      description: newFeatureDesc.trim() || "Chức năng tùy biến CRM",
      actions: [
        {
          id: `act_${Date.now()}_view`,
          name: `Xem danh sách & chi tiết ${newFeatureName.trim()}`,
          code: `${newFeatureName.trim().toUpperCase().replace(/[^A-Z0-9]/g, "_").slice(0, 10)}_VIEW`,
          description: "Tra cứu dữ liệu chức năng",
          apiEndpoint: `GET /api${newFeatureRoute.trim() || "/custom"}`,
          roles: { bqt: true, quan_tri: true, admin: true, tong_thu_ky: true, truong_ban: true },
        },
        {
          id: `act_${Date.now()}_edit`,
          name: `Chỉnh sửa ${newFeatureName.trim()}`,
          code: `${newFeatureName.trim().toUpperCase().replace(/[^A-Z0-9]/g, "_").slice(0, 10)}_EDIT`,
          description: "Cập nhật dữ liệu",
          apiEndpoint: `PUT /api${newFeatureRoute.trim() || "/custom"}/:id`,
          roles: { bqt: true, quan_tri: true, admin: true },
        },
        {
          id: `act_${Date.now()}_delete`,
          name: `Xóa ${newFeatureName.trim()}`,
          code: `${newFeatureName.trim().toUpperCase().replace(/[^A-Z0-9]/g, "_").slice(0, 10)}_DELETE`,
          description: "Xóa dữ liệu chức năng",
          apiEndpoint: `DELETE /api${newFeatureRoute.trim() || "/custom"}/:id`,
          roles: { bqt: true, quan_tri: true },
        },
      ],
    };

    setCategories((prev) =>
      prev.map((c) => {
        if (c.id !== targetCatId) return c;
        return {
          ...c,
          features: [...c.features, newFeat],
        };
      })
    );

    setExpandedNodes((prev) => ({ ...prev, [targetCatId]: true, [newFeat.id]: true }));
    setAddFeatureOpen(false);
    setNewFeatureName("");
    setNewFeatureRoute("");
    setNewFeatureDesc("");
    toast.success(`Đã thêm chức năng "${newFeat.name}" kèm 3 thao tác cơ bản!`);
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

  // Cột hiển thị: Cố định 5 Vai Trò Hệ Thống (Quản trị, Admin, Tổng thư ký, Trưởng ban, Thành viên)
  const activeColumns = SYSTEM_ROLES;

  return (
    <div className="space-y-4">
      {/* ── THANH ĐIỀU KHIỂN CHÍNH (DYNAMIC ACTIONS & TOOLBAR) ── */}
      <div className="bg-card border border-border rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Ô tìm kiếm thao tác */}
          <div className="relative min-w-[260px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo tên chức năng, thao tác con, mã quyền..."
              className="w-full rounded-xl border border-input bg-background pl-9 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#003B95]"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Huy hiệu 5 Vai Trò Hệ Thống Cố Định Hàng Ngang */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border border-blue-200 bg-blue-50/70 dark:bg-blue-950/50 text-[#003B95] dark:text-blue-300 shadow-xs">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>5 Vai Trò Cốt Lõi: Quản trị, Admin, Tổng thư ký, Trưởng ban, Thành viên</span>
          </div>

          {/* Mở rộng / Thu gọn */}
          <button
            onClick={expandAll}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-border bg-background hover:bg-secondary text-foreground transition"
          >
            Mở rộng
          </button>
          <button
            onClick={collapseAll}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-border bg-background hover:bg-secondary text-foreground transition"
          >
            Thu gọn
          </button>
        </div>

        {/* Cụm nút Thao tác Dynamic: Thêm chức năng, Thêm quyền, Lưu toàn bộ */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setAddFeatureOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-blue-600 bg-blue-50 dark:bg-blue-950/60 px-3.5 py-1.5 text-xs font-bold text-[#003B95] dark:text-blue-300 hover:bg-blue-100 transition shadow-xs cursor-pointer"
          >
            <FolderPlus className="h-4 w-4" />
            <span>+ Thêm Chức Năng</span>
          </button>

          <button
            onClick={() => {
              if (allFeaturesList.length > 0 && !targetFeatId) {
                setTargetFeatId(allFeaturesList[0].id);
              }
              setAddActionOpen(true);
            }}
            className="inline-flex items-center gap-1.5 rounded-xl border border-amber-600 bg-amber-50 dark:bg-amber-950/60 px-3.5 py-1.5 text-xs font-bold text-amber-800 dark:text-amber-300 hover:bg-amber-100 transition shadow-xs cursor-pointer"
          >
            <KeyRound className="h-4 w-4" />
            <span>+ Thêm Quyền</span>
          </button>

          <button
            onClick={handleSaveAll}
            disabled={saving}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#003B95] px-4 py-1.5 text-xs font-bold text-white hover:bg-blue-900 transition shadow-xs cursor-pointer disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            <span>{saving ? "Đang lưu..." : "Lưu Toàn Bộ"}</span>
          </button>

          <button
            onClick={handleResetDefault}
            title="Khôi phục mặc định ban đầu"
            className="p-1.5 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ── BẢNG MA TRẬN DẠNG CÂY (TREE MATRIX TABLE) ── */}
      <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-xs">
        <table className="w-full text-left border-collapse min-w-[1100px]">
          {/* Header Bảng: Tên Chức Năng / Thao Tác (Tree) | Các Cột Phân Quyền | Cột Thao Tác */}
          <thead>
            <tr className="border-b border-border bg-muted/60 text-xs font-bold text-foreground uppercase tracking-wider">
              <th className="py-3 px-4 w-[420px]">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-[#003B95]" />
                  <span>Cây Chức Năng & Thao Tác Chi Tiết (Menu Sidebar CRM)</span>
                </div>
              </th>

              {/* Các Cột Ban Chuyên Môn (6 Ban) HOẶC Vai Trò Hệ Thống (5 Roles) */}
              {activeColumns.map((col) => (
                <th key={col.key} className="py-3 px-2 text-center min-w-[95px]">
                  <span className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-extrabold border ${col.color}`}>
                    {col.shortName}
                  </span>
                </th>
              ))}

              {/* Cột Thao tác */}
              <th className="py-3 px-4 text-center w-[120px]">Thao Tác</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border/60 text-xs">
            {filteredCategories.map((cat) => {
              const isCatExpanded = expandedNodes[cat.id] ?? true;

              return (
                <React.Fragment key={cat.id}>
                  {/* LEVEL 1: NHÓM CHỨC NĂNG (CATEGORY ROOT THEO SIDEBAR CRM) */}
                  <tr className="bg-muted/40 font-bold hover:bg-muted/70 transition-colors">
                    <td colSpan={1 + activeColumns.length + 1} className="py-2.5 px-4">
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => toggleExpand(cat.id)}
                          className="flex items-center gap-2 text-xs font-black text-foreground hover:text-[#003B95] transition cursor-pointer"
                        >
                          {isCatExpanded ? <ChevronDown className="h-4 w-4 text-[#003B95]" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                          <span className="uppercase tracking-wider">{cat.name}</span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                            {cat.features.length} chức năng CRM
                          </span>
                        </button>

                        <span className="text-[10px] font-normal text-muted-foreground">
                          {cat.features.reduce((acc, f) => acc + f.actions.length, 0)} thao tác chi tiết
                        </span>
                      </div>
                    </td>
                  </tr>

                  {/* LEVEL 2: CÁC CHỨC NĂNG CON (FEATURES CHUẨN XÁC THEO TỪNG MENU ITEM CỦA SIDEBAR) */}
                  {isCatExpanded &&
                    cat.features.map((feat) => {
                      const isFeatExpanded = expandedNodes[feat.id] ?? true;

                      return (
                        <React.Fragment key={feat.id}>
                          {/* DÒNG TIÊU ĐỀ CHỨC NĂNG */}
                          <tr className="bg-secondary/20 hover:bg-secondary/40 font-semibold border-b border-border/40">
                            <td className="py-2 px-4 pl-8">
                              <div className="flex items-center justify-between gap-2">
                                <button
                                  onClick={() => toggleExpand(feat.id)}
                                  className="flex items-center gap-2 text-xs text-foreground hover:text-blue-600 transition cursor-pointer"
                                >
                                  {isFeatExpanded ? <ChevronDown className="h-3.5 w-3.5 text-blue-600" /> : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />}
                                  <span className="font-bold">{feat.name}</span>
                                  <code className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                                    {feat.route}
                                  </code>
                                </button>
                                <span className="text-[10px] text-muted-foreground">
                                  ({feat.actions.length} thao tác con)
                                </span>
                              </div>
                            </td>

                            {/* Cột các ban / roles: Trống ở dòng tiêu đề chức năng */}
                            {activeColumns.map((col) => (
                              <td key={col.key} className="py-2 px-2 text-center text-muted-foreground/30 text-[10px]">
                                —
                              </td>
                            ))}

                            {/* Cột thao tác của Chức Năng: Nút Lưu quyền nhanh & Xóa chức năng */}
                            <td className="py-2 px-3 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  onClick={() => handleSaveFeaturePermissions(feat.name)}
                                  title="Lưu quyền cho chức năng này"
                                  className="p-1 rounded-lg hover:bg-primary/10 text-primary transition"
                                >
                                  <Save className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteFeature(cat.id, feat.id, feat.name)}
                                  title="Xóa chức năng"
                                  className="p-1 rounded-lg hover:bg-destructive/10 text-destructive transition"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>

                          {/* LEVEL 3: CÁC THAO TÁC CON CHI TIẾT (ACTIONS: XEM, THÊM, SỬA, XÓA, DUYỆT, XUẤT...) */}
                          {isFeatExpanded &&
                            feat.actions.map((action) => (
                              <tr key={action.id} className="hover:bg-primary/5 transition-colors border-b border-border/30">
                                {/* Tên thao tác & Mã quyền */}
                                <td className="py-2 px-4 pl-14">
                                  <div className="flex flex-col">
                                    <span className="text-xs font-medium text-foreground">
                                      {action.name}
                                    </span>
                                    <div className="flex items-center gap-2 mt-0.5">
                                      <span className="text-[9px] font-mono font-bold text-muted-foreground uppercase bg-muted/60 px-1 rounded">
                                        {action.code}
                                      </span>
                                      {action.description && (
                                        <span className="text-[10px] text-muted-foreground truncate max-w-[240px]">
                                          {action.description}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </td>

                                {/* CÁC Ô TÍCH CHECKBOX CHO BAN CHUYÊN MÔN HOẶC VAI TRÒ HỆ THỐNG */}
                                {activeColumns.map((col) => {
                                  const isChecked = !!action.roles[col.key];

                                  return (
                                    <td key={col.key} className="py-2 px-2 text-center">
                                      <button
                                        type="button"
                                        onClick={() => handleTogglePermission(cat.id, feat.id, action.id, col.key)}
                                        className={`inline-flex items-center justify-center h-5 w-5 rounded border transition cursor-pointer ${
                                          isChecked
                                            ? "bg-[#003B95] border-[#003B95] text-white shadow-xs"
                                            : "border-border bg-background hover:border-[#003B95]/50 text-transparent"
                                        }`}
                                        title={`${isChecked ? "Bỏ quyền" : "Cấp quyền"} cho ${col.name}`}
                                      >
                                        <Check className="h-3 w-3 stroke-[3]" />
                                      </button>
                                    </td>
                                  );
                                })}

                                {/* CỘT THAO TÁC (XEM CHI TIẾT, XÓA THAO TÁC) */}
                                <td className="py-2 px-3 text-center">
                                  <div className="flex items-center justify-center gap-1.5">
                                    {/* Nút Xem chi tiết */}
                                    <button
                                      onClick={() => {
                                        setSelectedDetail({
                                          action,
                                          featureName: feat.name,
                                          categoryName: cat.name,
                                        });
                                        setDetailModalOpen(true);
                                      }}
                                      title="Xem chi tiết quyền"
                                      className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition"
                                    >
                                      <Eye className="h-3.5 w-3.5" />
                                    </button>

                                    {/* Nút Xóa thao tác */}
                                    <button
                                      onClick={() => handleDeleteAction(cat.id, feat.id, action.id, action.name)}
                                      title="Xóa thao tác này"
                                      className="p-1 rounded-lg text-destructive/70 hover:text-destructive hover:bg-destructive/10 transition"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                        </React.Fragment>
                      );
                    })}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
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
                  className="px-4 py-2 rounded-xl bg-[#003B95] text-white text-xs font-bold hover:bg-blue-900 transition shadow-xs"
                >
                  Tạo Chức Năng
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
    </div>
  );
}
