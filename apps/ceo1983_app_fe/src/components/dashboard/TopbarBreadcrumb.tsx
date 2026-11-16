import { Fragment } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { navGroups, type NavItem, type NavGroup } from "@/lib/nav-items";
import { useT, type TKey } from "@/lib/i18n";

type Crumb = { label: string; to?: string };

/** Resolve the nav item + owning group for a base path (e.g. "/members"). */
/** Resolve the nav item + owning group for a base path (e.g. "/members", "/business-connect/meetings"). */
function findNav(path: string): { group: NavGroup; item: NavItem } | null {
  for (const group of navGroups) {
    const item = group.items.find((it) => it.to === path);
    if (item) return { group, item };
  }
  return null;
}

const ROUTE_LABELS: Record<string, { group?: string; label: string }> = {
  "/profile": { group: "Hệ thống", label: "Hồ sơ cá nhân" },
  "/accounts": { group: "Hệ thống", label: "Quản trị người dùng" },
  "/account-settings": { group: "Hệ thống", label: "Quản trị người dùng" },
  "/departments": { group: "Phân quyền", label: "Quản lý Ban Chuyên Môn" },
  "/permissions": { group: "Phân quyền", label: "Phân quyền hệ thống" },
  "/templates": { group: "Quản lý mẫu trang", label: "Quản lý Thư Mời" },
  "/admin/landing-templates": { group: "Hệ thống", label: "Quản lý chủ đề" },
  "/fees": { group: "Tài chính", label: "Hội phí" },
  "/income": { group: "Tài chính", label: "Khoản thu" },
  "/expenses": { group: "Tài chính", label: "Khoản chi" },
  "/finance-report": { group: "Tài chính", label: "Báo cáo tài chính" },
  "/checkin": { group: "Sự kiện & Họp", label: "Check-in sự kiện" },
  "/checkin-qr": { group: "Sự kiện & Họp", label: "Mã QR Check-in" },
  "/events-overview": { group: "Sự kiện & Họp", label: "Tổng quan sự kiện" },
  "/event-registrations": { group: "Sự kiện & Họp", label: "Đăng ký sự kiện" },
  "/sponsor-packages": { group: "Tài trợ", label: "Gói tài trợ" },
  "/sponsor-report": { group: "Tài trợ", label: "Báo cáo tài trợ" },
  "/email-marketing": { group: "Truyền thông", label: "Email Marketing" },
  "/perks": { group: "Truyền thông", label: "Quyền lợi & Ưu đãi" },
  "/benefits": { group: "Truyền thông", label: "Khen thưởng & Danh hiệu" },
  "/activity": { group: "Hệ thống", label: "Lịch sử hoạt động" },
  "/settings": { group: "Hệ thống", label: "Cài đặt hệ thống" },
  "/tasks": { group: "Hệ thống", label: "Quản lý công việc" },
  "/documents": { group: "Quản trị", label: "Tài liệu & Biểu mẫu" },
  "/marketplace": { group: "Kết nối kinh doanh", label: "Marketplace B2B" },
  "/opportunities": { group: "Kết nối kinh doanh", label: "Cơ hội hợp tác" },
  "/network": { group: "Kết nối kinh doanh", label: "Tin nhắn & Trao đổi" },
  "/voting": { group: "Sự kiện & Họp", label: "Biểu quyết & Bầu cử" },
  "/meetings": { group: "Sự kiện & Họp", label: "Cuộc họp" },
  "/events": { group: "Sự kiện & Họp", label: "Sự kiện" },
  "/members": { group: "Hội viên", label: "Hội viên" },
  "/companies": { group: "Hội viên", label: "Doanh nghiệp" },
  "/renewal": { group: "Hội viên", label: "Gia hạn hội viên" },
  "/news": { group: "Truyền thông", label: "Tin tức & Truyền thông" },
  "/notifications": { group: "Truyền thông", label: "Thông báo" },
};

const SEGMENT_NAMES: Record<string, string> = {
  profile: "Hồ sơ cá nhân",
  accounts: "Quản trị người dùng",
  account: "Tài khoản",
  settings: "Cài đặt",
  departments: "Ban chuyên môn",
  permissions: "Phân quyền",
  templates: "Thư mời",
  expenses: "Khoản chi",
  income: "Khoản thu",
  fees: "Hội phí",
  finance: "Tài chính",
  documents: "Tài liệu",
  events: "Sự kiện",
  meetings: "Cuộc họp",
  members: "Hội viên",
  companies: "Doanh nghiệp",
  opportunities: "Cơ hội",
  marketplace: "Thương mại",
  products: "Sản phẩm",
  tasks: "Công việc",
  activity: "Hoạt động",
  news: "Tin tức",
  notifications: "Thông báo",
  edit: "Chỉnh sửa",
  detail: "Chi tiết",
  create: "Tạo mới",
  add: "Thêm mới",
  scan: "Quét mã",
};

/**
 * Build breadcrumb crumbs from the current pathname using the nav registry
 * as the single source of truth. Read-only; derives from the router only.
 */
function useCrumbs(): Crumb[] {
  const t = useT();
  const pathname = useRouterState({ select: (s) => s?.location?.pathname }) ?? "/";

  // Home / dashboard.
  if (pathname === "/") return [{ label: t("nav.dashboard") }];

  // 1. Try explicit Route label mapping
  const directMapping = ROUTE_LABELS[pathname];
  if (directMapping) {
    const crumbs: Crumb[] = [];
    if (directMapping.group) crumbs.push({ label: directMapping.group });
    crumbs.push({ label: directMapping.label, to: pathname });
    return crumbs;
  }

  // 2. Try exact match from nav groups
  const exactMatch = findNav(pathname);
  if (exactMatch) {
    const crumbs: Crumb[] = [];
    if (exactMatch.group.label) crumbs.push({ label: t(exactMatch.group.label) });
    crumbs.push({ label: t(exactMatch.item.key), to: exactMatch.item.to });
    return crumbs;
  }

  const segments = pathname.split("/").filter(Boolean);
  const base = "/" + segments[0];

  const baseMapping = ROUTE_LABELS[base];
  if (baseMapping) {
    const crumbs: Crumb[] = [];
    if (baseMapping.group) crumbs.push({ label: baseMapping.group });
    crumbs.push({ label: baseMapping.label, to: base });
    if (segments.length > 1) {
      const sub = segments[1];
      crumbs.push({ label: SEGMENT_NAMES[sub] || sub });
    }
    return crumbs;
  }

  const match = findNav(base);
  const crumbs: Crumb[] = [];

  if (match) {
    if (match.group.label) crumbs.push({ label: t(match.group.label) });
    crumbs.push({ label: t(match.item.key), to: base });
  } else {
    // Check if it's a known nested namespace like /business-connect
    if (segments[0] === "business-connect") {
      crumbs.push({ label: t("nav.group.network") });
      if (segments[1] === "meetings") {
        crumbs.push({ label: t("nav.bc.meetings" as TKey), to: "/business-connect/meetings" });
      } else if (segments[1] === "saved-cards") {
        crumbs.push({ label: t("nav.bc.saved" as TKey), to: "/business-connect/saved-cards" });
      } else {
        const sub = segments[1] || segments[0];
        crumbs.push({
          label: SEGMENT_NAMES[sub] || sub.replace(/-/g, " "),
          to: pathname,
        });
      }
      return crumbs;
    } else {
      const segName = SEGMENT_NAMES[segments[0]] || segments[0].replace(/-/g, " ");
      crumbs.push({
        label: segName,
        to: base,
      });
    }
  }

  // Nested detail / sub-page crumb
  if (segments.length > 1) {
    const trailing = segments[segments.length - 1];
    crumbs.push({ label: SEGMENT_NAMES[trailing] || "Chi tiết" });
  }

  return crumbs;
}

export function TopbarBreadcrumb() {
  const crumbs = useCrumbs();
  const current = crumbs[crumbs.length - 1];

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
