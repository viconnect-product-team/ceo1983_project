/**
 * System-wide Permission & Role Constants
 * CEO 1983 & ViOne Connect CRM
 */

export const SRS_ROLES = {
  QUAN_TRI: "quan_tri",
  ADMIN: "admin",
  TONG_THU_KY: "tong_thu_ky",
  TRUONG_BAN: "truong_ban",
  MEMBER: "member",
  // Backward compatibility aliases
  ADM: "quan_tri",
  BQT: "admin",
  BTK: "tong_thu_ky",
  BTT: "truong_ban",
  BXT: "truong_ban",
  BTV: "truong_ban",
  BTN: "truong_ban",
  BTC: "truong_ban",
  HVT: "member",
} as const;

export const STANDARD_5_ROLES = [
  "Quản trị",
  "Admin",
  "Tổng thư ký",
  "Trưởng ban",
  "Thành viên",
] as const;

export const STANDARD_7_COMMITTEES = [
  "Ban Thành viên",
  "Ban xúc tiến",
  "Ban thiện nguyện",
  "Ban truyền thông",
  "Ban quản trị",
  "Ban tài chính",
  "Hội viên ceo1983",
] as const;

export type SrsRole =
  | "quan_tri"
  | "admin"
  | "tong_thu_ky"
  | "truong_ban"
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
  quan_tri: Object.values(PERMISSIONS),
  admin: Object.values(PERMISSIONS),
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
  truong_ban: [
    PERMISSIONS.EVENT_VIEW,
    PERMISSIONS.EVENT_CREATE,
    PERMISSIONS.EVENT_EDIT,
    PERMISSIONS.EVENT_CHECKIN_MANAGE,
    PERMISSIONS.SPONSOR_VIEW,
    PERMISSIONS.MEDIA_VIEW,
    PERMISSIONS.MEDIA_MANAGE,
    PERMISSIONS.MEMBER_VIEW,
    PERMISSIONS.OPPORTUNITY_VIEW,
    PERMISSIONS.OPPORTUNITY_MANAGE,
    PERMISSIONS.MARKETPLACE_MANAGE,
    PERMISSIONS.CHARITY_VIEW,
    PERMISSIONS.CHARITY_MANAGE,
    PERMISSIONS.MEETING_VIEW,
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
