/**
 * System-wide Permission & Role Constants
 * CEO 1983 & ViOne Connect CRM
 */

export const SRS_ROLES = {
  QUAN_TRI: "quan_tri",
  CHU_TICH: "chu_tich",
  ADMIN: "admin",
  BAN_DIEU_HANH: "ban_dieu_hanh",
  TONG_THU_KY: "tong_thu_ky",
  BAN_THU_KY: "ban_thu_ky",
  TRUONG_BAN_TRUYEN_THONG: "truong_ban_truyen_thong",
  TRUONG_BAN_THANH_VIEN: "truong_ban_thanh_vien",
  TRUONG_BAN_XUC_TIEN: "truong_ban_xuc_tien",
  TRUONG_BAN_TAI_CHINH: "truong_ban_tai_chinh",
  TRUONG_BAN_THIEN_NGUYEN: "truong_ban_thien_nguyen",
  TRUONG_BAN_DIEU_HANH: "truong_ban_dieu_hanh",
  MEMBER: "member",
  // Backward compatibility aliases
  ADM: "admin",
  BQT: "ban_dieu_hanh",
  BTK: "ban_thu_ky",
  BTT: "truong_ban_truyen_thong",
  BXT: "truong_ban_xuc_tien",
  BTV: "truong_ban_thanh_vien",
  BTN: "truong_ban_thien_nguyen",
  BTC: "truong_ban_tai_chinh",
  HVT: "member",
} as const;

export const STANDARD_ROLES = [
  "Quản trị",
  "Chủ tịch",
  "Admin",
  "Ban Điều Hành",
  "Tổng thư ký",
  "Trưởng ban Truyền thông",
  "Trưởng ban Thành viên",
  "Trưởng ban Xúc tiến",
  "Trưởng ban Tài chính",
  "Trưởng ban Thiện nguyện",
  "Ban Thư ký",
  "Thành viên",
] as const;

export const STANDARD_5_ROLES = STANDARD_ROLES;

export const STANDARD_7_COMMITTEES = [
  "Ban Thành viên",
  "Ban xúc tiến",
  "Ban thiện nguyện",
  "Ban truyền thông",
  "Ban thư ký",
  "Ban điều hành",
  "Ban tài chính",
  "Hội viên ceo1983",
] as const;

export type SrsRole =
  | "chu_tich"
  | "admin"
  | "quan_tri"
  | "ban_dieu_hanh"
  | "tong_thu_ky"
  | "ban_thu_ky"
  | "truong_ban_truyen_thong"
  | "truong_ban_thanh_vien"
  | "truong_ban_xuc_tien"
  | "truong_ban_tai_chinh"
  | "truong_ban_thien_nguyen"
  | "truong_ban_dieu_hanh"
  | "member"
  | "ADM"
  | "BQT"
  | "BTK"
  | "BTT"
  | "BXT"
  | "BTV"
  | "BTN"
  | "BTC"
  | "HVT";

export const PERMISSIONS = {
  // Events
  EVENT_VIEW: "event:view",
  EVENT_CREATE: "event:create",
  EVENT_EDIT: "event:edit",
  EVENT_DELETE: "event:delete",
  EVENT_CANCEL: "event:cancel",
  EVENT_CHECKIN_MANAGE: "event:checkin_manage",

  // Sponsors & Packages
  SPONSOR_VIEW: "sponsor:view",
  SPONSOR_CREATE: "sponsor:create",
  SPONSOR_EDIT: "sponsor:edit",
  SPONSOR_DELETE: "sponsor:delete",
  SPONSOR_MANAGE: "sponsor:edit",
  SPONSOR_PACKAGE_MANAGE: "sponsor:package_manage",
  SPONSOR_ASSIGN_EVENT: "sponsor:assign_event",

  // Members
  MEMBER_VIEW: "member:view",
  MEMBER_CREATE: "member:create",
  MEMBER_EDIT: "member:edit",
  MEMBER_DELETE: "member:delete",
  MEMBER_APPROVE: "member:approve",
  MEMBER_RENEW: "member:renew",

  // Marketplace & Trade Promotion (B2B Opportunities)
  OPPORTUNITY_VIEW: "opportunity:view",
  OPPORTUNITY_MANAGE: "opportunity:manage",
  MARKETPLACE_MANAGE: "marketplace:manage",

  // Charity & Social Welfare
  CHARITY_VIEW: "charity:view",
  CHARITY_MANAGE: "charity:manage",

  // Meetings & Documents (Secretariat)
  MEETING_VIEW: "meeting:view",
  MEETING_MANAGE: "meeting:manage",
  DOCUMENT_MANAGE: "document:manage",

  // Finance & Invoices
  FINANCE_VIEW: "finance:view",
  FINANCE_MANAGE: "finance:manage",
  FINANCE_APPROVE: "finance:approve",

  // Media & Communications
  MEDIA_VIEW: "media:view",
  MEDIA_MANAGE: "media:manage",

  // System & Platform Administration
  SYSTEM_MANAGE: "system:manage",
  AUDIT_LOG_VIEW: "system:audit_view",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

/**
 * Granular RBAC Role to Permission Mapping for 6 Official Departments
 */
export const ROLE_PERMISSIONS: Record<string, readonly Permission[]> = {
  chu_tich: Object.values(PERMISSIONS),
  quan_tri: Object.values(PERMISSIONS),
  admin: Object.values(PERMISSIONS),
  ban_dieu_hanh: Object.values(PERMISSIONS),
  truong_ban_dieu_hanh: Object.values(PERMISSIONS),
  tong_thu_ky: [
    PERMISSIONS.MEETING_VIEW,
    PERMISSIONS.MEETING_MANAGE,
    PERMISSIONS.DOCUMENT_MANAGE,
    PERMISSIONS.EVENT_VIEW,
    PERMISSIONS.EVENT_CREATE,
    PERMISSIONS.EVENT_EDIT,
    PERMISSIONS.EVENT_CHECKIN_MANAGE,
    PERMISSIONS.MEMBER_VIEW,
    PERMISSIONS.MEDIA_VIEW,
    PERMISSIONS.MEDIA_MANAGE,
    PERMISSIONS.SPONSOR_VIEW,
    PERMISSIONS.AUDIT_LOG_VIEW,
  ],
  truong_ban_truyen_thong: [
    PERMISSIONS.EVENT_VIEW,
    PERMISSIONS.EVENT_CREATE,
    PERMISSIONS.EVENT_EDIT,
    PERMISSIONS.EVENT_CHECKIN_MANAGE,
    PERMISSIONS.SPONSOR_VIEW,
    PERMISSIONS.SPONSOR_ASSIGN_EVENT,
    PERMISSIONS.MEDIA_VIEW,
    PERMISSIONS.MEDIA_MANAGE,
    PERMISSIONS.MEMBER_VIEW,
  ],
  truong_ban_thanh_vien: [
    PERMISSIONS.MEMBER_VIEW,
    PERMISSIONS.MEMBER_CREATE,
    PERMISSIONS.MEMBER_EDIT,
    PERMISSIONS.MEMBER_APPROVE,
    PERMISSIONS.MEMBER_RENEW,
    PERMISSIONS.EVENT_VIEW,
    PERMISSIONS.EVENT_CHECKIN_MANAGE,
    PERMISSIONS.SPONSOR_VIEW,
    PERMISSIONS.MEDIA_VIEW,
  ],
  truong_ban_xuc_tien: [
    PERMISSIONS.OPPORTUNITY_VIEW,
    PERMISSIONS.OPPORTUNITY_MANAGE,
    PERMISSIONS.MARKETPLACE_MANAGE,
    PERMISSIONS.SPONSOR_VIEW,
    PERMISSIONS.SPONSOR_CREATE,
    PERMISSIONS.SPONSOR_EDIT,
    PERMISSIONS.SPONSOR_PACKAGE_MANAGE,
    PERMISSIONS.SPONSOR_ASSIGN_EVENT,
    PERMISSIONS.MEMBER_VIEW,
    PERMISSIONS.EVENT_VIEW,
  ],
  truong_ban_tai_chinh: [
    PERMISSIONS.FINANCE_VIEW,
    PERMISSIONS.FINANCE_MANAGE,
    PERMISSIONS.FINANCE_APPROVE,
    PERMISSIONS.SPONSOR_VIEW,
    PERMISSIONS.SPONSOR_CREATE,
    PERMISSIONS.SPONSOR_EDIT,
    PERMISSIONS.SPONSOR_PACKAGE_MANAGE,
    PERMISSIONS.MEMBER_VIEW,
    PERMISSIONS.EVENT_VIEW,
  ],
  truong_ban_thien_nguyen: [
    PERMISSIONS.CHARITY_VIEW,
    PERMISSIONS.CHARITY_MANAGE,
    PERMISSIONS.EVENT_VIEW,
    PERMISSIONS.EVENT_CREATE,
    PERMISSIONS.EVENT_CHECKIN_MANAGE,
    PERMISSIONS.MEDIA_VIEW,
    PERMISSIONS.MEDIA_MANAGE,
    PERMISSIONS.SPONSOR_VIEW,
    PERMISSIONS.SPONSOR_CREATE,
    PERMISSIONS.MEMBER_VIEW,
  ],
  BTC: [
    PERMISSIONS.FINANCE_VIEW,
    PERMISSIONS.FINANCE_MANAGE,
    PERMISSIONS.FINANCE_APPROVE,
    PERMISSIONS.SPONSOR_VIEW,
    PERMISSIONS.SPONSOR_CREATE,
    PERMISSIONS.SPONSOR_EDIT,
    PERMISSIONS.SPONSOR_PACKAGE_MANAGE,
    PERMISSIONS.MEMBER_VIEW,
    PERMISSIONS.EVENT_VIEW,
  ],
  ban_thu_ky: [
    PERMISSIONS.MEETING_VIEW,
    PERMISSIONS.MEETING_MANAGE,
    PERMISSIONS.DOCUMENT_MANAGE,
    PERMISSIONS.EVENT_VIEW,
    PERMISSIONS.EVENT_CREATE,
    PERMISSIONS.EVENT_EDIT,
    PERMISSIONS.EVENT_CHECKIN_MANAGE,
    PERMISSIONS.MEDIA_VIEW,
    PERMISSIONS.MEDIA_MANAGE,
    PERMISSIONS.MEMBER_VIEW,
  ],
  member: [
    PERMISSIONS.EVENT_VIEW,
    PERMISSIONS.SPONSOR_VIEW,
    PERMISSIONS.MEMBER_VIEW,
    PERMISSIONS.MEDIA_VIEW,
    PERMISSIONS.OPPORTUNITY_VIEW,
    PERMISSIONS.CHARITY_VIEW,
    PERMISSIONS.MEETING_VIEW,
  ],
  // Legacy aliases
  ADM: Object.values(PERMISSIONS),
  BQT: Object.values(PERMISSIONS),
  BTK: [
    PERMISSIONS.MEETING_VIEW,
    PERMISSIONS.MEETING_MANAGE,
    PERMISSIONS.DOCUMENT_MANAGE,
    PERMISSIONS.EVENT_VIEW,
    PERMISSIONS.EVENT_CREATE,
    PERMISSIONS.EVENT_EDIT,
    PERMISSIONS.EVENT_CHECKIN_MANAGE,
    PERMISSIONS.MEMBER_VIEW,
    PERMISSIONS.MEDIA_VIEW,
    PERMISSIONS.MEDIA_MANAGE,
    PERMISSIONS.SPONSOR_VIEW,
    PERMISSIONS.AUDIT_LOG_VIEW,
  ],
  BTT: [
    PERMISSIONS.EVENT_VIEW,
    PERMISSIONS.EVENT_CREATE,
    PERMISSIONS.EVENT_EDIT,
    PERMISSIONS.EVENT_CHECKIN_MANAGE,
    PERMISSIONS.SPONSOR_VIEW,
    PERMISSIONS.SPONSOR_ASSIGN_EVENT,
    PERMISSIONS.MEDIA_VIEW,
    PERMISSIONS.MEDIA_MANAGE,
    PERMISSIONS.MEMBER_VIEW,
  ],
  BXT: [
    PERMISSIONS.OPPORTUNITY_VIEW,
    PERMISSIONS.OPPORTUNITY_MANAGE,
    PERMISSIONS.MARKETPLACE_MANAGE,
    PERMISSIONS.SPONSOR_VIEW,
    PERMISSIONS.SPONSOR_CREATE,
    PERMISSIONS.SPONSOR_EDIT,
    PERMISSIONS.SPONSOR_PACKAGE_MANAGE,
    PERMISSIONS.SPONSOR_ASSIGN_EVENT,
    PERMISSIONS.MEMBER_VIEW,
    PERMISSIONS.EVENT_VIEW,
  ],
  BTV: [
    PERMISSIONS.MEMBER_VIEW,
    PERMISSIONS.MEMBER_CREATE,
    PERMISSIONS.MEMBER_EDIT,
    PERMISSIONS.MEMBER_APPROVE,
    PERMISSIONS.MEMBER_RENEW,
    PERMISSIONS.EVENT_VIEW,
    PERMISSIONS.EVENT_CHECKIN_MANAGE,
    PERMISSIONS.SPONSOR_VIEW,
    PERMISSIONS.MEDIA_VIEW,
  ],
  BTN: [
    PERMISSIONS.CHARITY_VIEW,
    PERMISSIONS.CHARITY_MANAGE,
    PERMISSIONS.EVENT_VIEW,
    PERMISSIONS.EVENT_CREATE,
    PERMISSIONS.EVENT_CHECKIN_MANAGE,
    PERMISSIONS.MEDIA_VIEW,
    PERMISSIONS.MEDIA_MANAGE,
    PERMISSIONS.SPONSOR_VIEW,
    PERMISSIONS.SPONSOR_CREATE,
    PERMISSIONS.MEMBER_VIEW,
  ],
  HVT: [
    PERMISSIONS.EVENT_VIEW,
    PERMISSIONS.SPONSOR_VIEW,
    PERMISSIONS.MEMBER_VIEW,
    PERMISSIONS.MEDIA_VIEW,
    PERMISSIONS.OPPORTUNITY_VIEW,
    PERMISSIONS.CHARITY_VIEW,
    PERMISSIONS.MEETING_VIEW,
  ],
};
