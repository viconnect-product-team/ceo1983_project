import { Fragment } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { navGroups, type NavItem, type NavGroup } from "@/lib/nav-items";
import { useT, type TKey } from "@/lib/i18n";

type Crumb = { label: string; to?: string };

/** Resolve the nav item + owning group for a base path (e.g. "/members", "/business-connect/meetings"). */
function findNav(path: string): { group: NavGroup; item: NavItem } | null {
  for (const group of navGroups) {
    const item = group.items.find((it) => it.to === path);
    if (item) return { group, item };
  }
  return null;
}

const ROUTE_LABELS: Record<string, { group?: string; label: string }> = {
  "/": { group: "Tổng quan", label: "Bảng điều khiển" },
  "/ai-assistant": { group: "Tổng quan", label: "Trợ Lý AI Điều Hành" },
  "/profile": { group: "Hệ thống", label: "Hồ sơ cá nhân" },
  "/accounts": { group: "Hệ thống", label: "Quản trị người dùng" },
  "/account-settings": { group: "Phân quyền", label: "Quản trị người dùng" },
  "/departments": { group: "Phân quyền", label: "Quản lý Ban Chuyên Môn" },
  "/permissions": { group: "Phân quyền", label: "Phân quyền hệ thống" },
  "/templates": { group: "Quản lý mẫu trang", label: "Quản lý Thư Mời & Biểu mẫu" },
  "/admin/landing-templates": { group: "Hệ thống", label: "Quản lý chủ đề" },
  "/admin/landing-webs": { group: "Hệ thống", label: "Quản lý Landing Web" },
  "/admin/audit-logs": { group: "Hệ thống", label: "Nhật ký thao tác hệ thống" },
  "/fees": { group: "Tài chính", label: "Hội phí" },
  "/income": { group: "Tài chính", label: "Khoản thu" },
  "/expenses": { group: "Tài chính", label: "Khoản chi" },
  "/finance-report": { group: "Tài chính", label: "Báo cáo tài chính" },
  "/analytics": { group: "Tài chính & Thống kê", label: "Thống kê & Báo cáo" },
  "/checkin": { group: "Sự kiện & Họp", label: "Check-in sự kiện" },
  "/checkin-qr": { group: "Sự kiện & Họp", label: "Mã QR Check-in" },
  "/events-overview": { group: "Sự kiện & Họp", label: "Tổng quan sự kiện" },
  "/event-registrations": { group: "Sự kiện & Họp", label: "Đăng ký sự kiện" },
  "/lucky-draw": { group: "Sự kiện & Họp", label: "Bốc thăm trúng thưởng" },
  "/sponsors": { group: "Tài trợ", label: "Nhà tài trợ" },
  "/sponsor-packages": { group: "Tài trợ", label: "Gói tài trợ" },
  "/sponsor-report": { group: "Tài trợ", label: "Báo cáo tài trợ" },
  "/email-marketing": { group: "Truyền thông", label: "Email Marketing" },
  "/perks": { group: "Truyền thông", label: "Quyền lợi & Ưu đãi" },
  "/benefits": { group: "Truyền thông", label: "Khen thưởng & Danh hiệu" },
  "/activity": { group: "Hệ thống", label: "Nhật ký hoạt động" },
  "/activity-logs": { group: "Hệ thống", label: "Nhật ký hoạt động" },
  "/settings": { group: "Hệ thống", label: "Cài đặt hệ thống" },
  "/tasks": { group: "Hệ thống", label: "Quản lý công việc" },
  "/documents": { group: "Quản trị", label: "Tài liệu & Biểu mẫu" },
  "/marketplace": { group: "Kết nối kinh doanh", label: "Marketplace B2B" },
  "/opportunities": { group: "Kết nối kinh doanh", label: "Cơ hội hợp tác" },
  "/network": { group: "Kết nối kinh doanh", label: "Tin nhắn & Trao đổi công việc" },
  "/trainings": { group: "Kết nối kinh doanh", label: "Đào tạo & Họp trực tuyến" },
  "/business-connect/meetings": { group: "Kết nối kinh doanh", label: "Cuộc gặp B2B" },
  "/business-connect/saved-cards": { group: "Kết nối kinh doanh", label: "Danh thiếp đã lưu" },
  "/voting": { group: "Sự kiện & Họp", label: "Biểu quyết & Bầu cử" },
  "/meetings": { group: "Sự kiện & Họp", label: "Cuộc họp" },
  "/events": { group: "Sự kiện & Họp", label: "Sự kiện" },
  "/members": { group: "Hội viên", label: "Hội viên" },
  "/companies": { group: "Hội viên", label: "Doanh nghiệp" },
  "/segments": { group: "Hội viên", label: "Phân loại hội viên" },
  "/renewal": { group: "Hội viên", label: "Gia hạn hội viên" },
  "/news": { group: "Truyền thông", label: "Tin tức & Truyền thông" },
  "/notifications": { group: "Truyền thông", label: "Thông báo hệ thống" },
};

const QUERY_SUB_LABELS: Record<string, string> = {
  "category=member_activities": "Hoạt động hội viên",
  "category=top_connections": "Kết nối giao thương",
  "category=top_opportunities": "Cơ hội kinh doanh",
  "category=top_events_meetings": "Sự kiện & cuộc họp",
  "filter=my_tasks": "Công việc của tôi",
  "filter=assigned_by_me": "Công việc đã giao",
  "filter=by_department": "Phân công theo Ban",
  "filter=overdue": "Công việc quá hạn",
  "filter=new_members": "Hội viên mới nộp hồ sơ",
  "filter=fee_alerts": "Nhắc hạn & quá hạn hội phí",
  "filter=admin_system": "Ban Điều hành & Quản trị",
  "filter=events_meetings": "Sự kiện & Cuộc họp",
  "tab=forms": "Quản lý Biểu mẫu",
  "tab=invitation-setup": "Quản lý Thư Mời",
  "tab=matrix": "Ma trận phân quyền",
  "tab=user_actions": "Ủy quyền thao tác",
  "tab=role_groups": "Nhóm quyền quản trị",
  "tab=users": "Quản trị người dùng",
};

const SEGMENT_NAMES: Record<string, string> = {
  profile: "Hồ sơ cá nhân",
  accounts: "Quản trị người dùng",
  account: "Tài khoản",
  "account-settings": "Quản trị người dùng",
  settings: "Cài đặt hệ thống",
  departments: "Ban chuyên môn",
  permissions: "Phân quyền",
  templates: "Thư mời & Biểu mẫu",
  expenses: "Khoản chi",
  income: "Khoản thu",
  fees: "Hội phí",
  finance: "Tài chính",
  "finance-report": "Báo cáo tài chính",
  documents: "Tài liệu",
  events: "Sự kiện",
  "events-overview": "Tổng quan sự kiện",
  "event-registrations": "Đăng ký sự kiện",
  meetings: "Cuộc họp",
  members: "Hội viên",
  companies: "Doanh nghiệp",
  opportunities: "Cơ hội",
  marketplace: "Thương mại",
  products: "Sản phẩm",
  tasks: "Công việc",
  activity: "Hoạt động",
  "activity-logs": "Nhật ký hoạt động",
  news: "Tin tức",
  notifications: "Thông báo",
  edit: "Chỉnh sửa",
  detail: "Chi tiết",
  create: "Tạo mới",
  add: "Thêm mới",
  scan: "Quét mã",
  checkin: "Check-in",
  "checkin-qr": "Mã QR Check-in",
  analytics: "Thống kê & Báo cáo",
  "ai-assistant": "Trợ Lý AI Điều Hành",
  trainings: "Đào tạo & Họp trực tuyến",
  "lucky-draw": "Bốc thăm trúng thưởng",
  segments: "Phân loại hội viên",
  sponsors: "Nhà tài trợ",
  "sponsor-packages": "Gói tài trợ",
  "sponsor-report": "Báo cáo tài trợ",
  "email-marketing": "Email Marketing",
  perks: "Quyền lợi & Ưu đãi",
  benefits: "Khen thưởng & Danh hiệu",
  renewal: "Gia hạn hội viên",
  network: "Tin nhắn & Trao đổi",
  voting: "Biểu quyết & Bầu cử",
  admin: "Hệ thống",
  "landing-templates": "Quản lý chủ đề",
  "landing-webs": "Quản lý Landing Web",
  "audit-logs": "Nhật ký thao tác",
  "business-connect": "Kết nối kinh doanh",
  "saved-cards": "Danh thiếp đã lưu",
};

function isIdOrUuid(str: string): boolean {
  return /^[0-9a-fA-F-]{8,}$/.test(str) || /^\d+$/.test(str);
}

/**
 * Build breadcrumb crumbs from the current pathname using the nav registry
 * as the single source of truth. Read-only; derives from the router only.
 */
function useCrumbs(): Crumb[] {
  const t = useT();
  const routerLocation = useRouterState({ select: (s) => s?.location });
  const pathname = routerLocation?.pathname ?? "/";
  const searchStr = routerLocation?.searchStr ?? (typeof window !== "undefined" ? window.location.search : "");

  // Home / dashboard.
  if (pathname === "/") return [{ label: t("nav.dashboard") || "Bảng điều khiển" }];

  const crumbs: Crumb[] = [];

  // 1. Try explicit Route label mapping
  const directMapping = ROUTE_LABELS[pathname];
  if (directMapping) {
    if (directMapping.group) crumbs.push({ label: directMapping.group });
    crumbs.push({ label: directMapping.label, to: pathname });
  } else {
    // 2. Try exact match from nav groups
    const exactMatch = findNav(pathname);
    if (exactMatch) {
      if (exactMatch.group.label) crumbs.push({ label: t(exactMatch.group.label) });
      crumbs.push({ label: t(exactMatch.item.key), to: exactMatch.item.to });
    } else {
      const segments = pathname.split("/").filter(Boolean);
      const base = "/" + segments[0];

      const baseMapping = ROUTE_LABELS[base];
      if (baseMapping) {
        if (baseMapping.group) crumbs.push({ label: baseMapping.group });
        crumbs.push({ label: baseMapping.label, to: base });
        if (segments.length > 1) {
          const sub = segments.slice(1).map(s => isIdOrUuid(s) ? "Chi tiết" : (SEGMENT_NAMES[s] || s.replace(/-/g, " "))).join(" / ");
          crumbs.push({ label: sub });
        }
      } else if (segments[0] === "admin" && segments.length > 1) {
        crumbs.push({ label: "Hệ thống" });
        const adminSub = "/admin/" + segments[1];
        const adminMap = ROUTE_LABELS[adminSub];
        if (adminMap) {
          crumbs.push({ label: adminMap.label, to: adminSub });
        } else {
          crumbs.push({ label: SEGMENT_NAMES[segments[1]] || segments[1].replace(/-/g, " "), to: adminSub });
        }
      } else if (segments[0] === "business-connect") {
        crumbs.push({ label: t("nav.group.network") || "Kết nối" });
        if (segments[1] === "meetings") {
          crumbs.push({ label: t("nav.bc.meetings" as TKey) || "Cuộc gặp B2B", to: "/business-connect/meetings" });
        } else if (segments[1] === "saved-cards") {
          crumbs.push({ label: t("nav.bc.saved" as TKey) || "Danh thiếp đã lưu", to: "/business-connect/saved-cards" });
        } else {
          const sub = segments[1] || segments[0];
          crumbs.push({
            label: isIdOrUuid(sub) ? "Chi tiết" : (SEGMENT_NAMES[sub] || sub.replace(/-/g, " ")),
            to: pathname,
          });
        }
      } else {
        const segName = SEGMENT_NAMES[segments[0]] || segments[0].replace(/-/g, " ");
        crumbs.push({
          label: segName,
          to: base,
        });
        if (segments.length > 1) {
          const sub = segments.slice(1).map(s => isIdOrUuid(s) ? "Chi tiết" : (SEGMENT_NAMES[s] || s.replace(/-/g, " "))).join(" / ");
          crumbs.push({ label: sub });
        }
      }
    }
  }

  // 3. Check for sub-query parameters (e.g. ?category=member_activities, ?filter=my_tasks, etc.)
  if (searchStr) {
    for (const [qKey, qLabel] of Object.entries(QUERY_SUB_LABELS)) {
      if (searchStr.includes(qKey)) {
        crumbs.push({ label: qLabel });
        break;
      }
    }
  }

  return crumbs;
}

export function TopbarBreadcrumb() {
  const crumbs = useCrumbs();
  const current = crumbs[crumbs.length - 1] || { label: "Hệ thống" };

  return (
    <div className="min-w-0 flex-1 lg:flex-none">
      {/* Mobile / tablet: current page title only. */}
      <h1 className="truncate text-base font-semibold text-foreground md:hidden">
        {current.label}
      </h1>

      {/* Desktop: full breadcrumb trail. */}
      <nav aria-label="breadcrumb" className="hidden md:block">
        <ol className="flex items-center gap-1.5 text-sm">
          {crumbs.map((c, i) => {
            const isLast = i === crumbs.length - 1;
            return (
              <Fragment key={`${c.label}-${i}`}>
                {i > 0 && (
                  <ChevronRight
                    className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60"
                    aria-hidden="true"
                  />
                )}
                {isLast ? (
                  <span aria-current="page" className="truncate font-semibold text-foreground">
                    {c.label}
                  </span>
                ) : c.to ? (
                  <Link
                    to={c.to}
                    className="truncate rounded text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {c.label}
                  </Link>
                ) : (
                  <span className="truncate text-muted-foreground">{c.label}</span>
                )}
              </Fragment>
            );
          })}
        </ol>
      </nav>
    </div>
  );
}
