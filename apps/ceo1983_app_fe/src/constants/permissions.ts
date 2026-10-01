/**
 * System-wide Permission & Role Constants
 * CEO 1983 & ViOne Connect CRM
 */

export const SRS_ROLES = {
  ADM: "ADM", // Super Admin / Platform Admin
  BQT: "BQT", // Ban Quản Trị
  BTK: "BTK", // Ban Thư Ký
  BTT: "BTT", // Ban Truyền Thông
  BXT: "BXT", // Ban Xúc Tiến
  BTV: "BTV", // Ban Thành Viên
  BTN: "BTN", // Ban Thiện Nguyện
  HVT: "HVT", // Hội Viên Thường
  // Backward compatibility alias:
  BTC: "BQT",
} as const;

export type SrsRole = (typeof SRS_ROLES)[keyof typeof SRS_ROLES];

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
export const ROLE_PERMISSIONS: Record<SrsRole, readonly Permission[]> = {
  ADM: Object.values(PERMISSIONS),
  BQT: Object.values(PERMISSIONS),
  BTK: [
    // Ban Thư Ký (Điều phối cuộc họp, quản lý văn bản, giám sát sự kiện & truyền thông)
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
    // Ban Truyền Thông
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
    // Ban Xúc Tiến
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
    // Ban Thành Viên
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
    // Ban Thiện Nguyện
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
    // Hội Viên Thường
    PERMISSIONS.EVENT_VIEW,
    PERMISSIONS.SPONSOR_VIEW,
    PERMISSIONS.MEMBER_VIEW,
    PERMISSIONS.MEDIA_VIEW,
    PERMISSIONS.OPPORTUNITY_VIEW,
    PERMISSIONS.CHARITY_VIEW,
    PERMISSIONS.MEETING_VIEW,
  ],
};
