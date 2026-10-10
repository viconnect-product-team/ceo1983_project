import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { isRouteAllowedByMatrix, type SystemRoleKey } from "@/lib/rbac-permission-helpers";
import { useT } from "@/lib/i18n";
import { useRole } from "@/hooks/use-role";
import { useSidebarLabels } from "@/hooks/use-sidebar-labels";
import { Link, useRouterState } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useServerData } from "@/hooks/use-server-data";
import { listMyAssociationsFn, type MyAssociation } from "@/lib/associations.functions";
import { useUnreadNotifications } from "@/hooks/use-unread-notifications";
import { resolveMediaUrl } from "@/lib/api-client";
import {
  LayoutDashboard,
  Users,
  Building2,
  Tags,
  RefreshCw,
  Calendar,
  ClipboardList,
  CheckSquare,
  ScanLine,
  QrCode as QrCodeIcon,
  Handshake,
  Package,
  FileBarChart,
  Wallet,
  ArrowDownCircle,
  ArrowUpCircle,
  ArrowLeftRight,
  PieChart,
  Bell,
  Mail,
  Newspaper,
  Gift,
  Award,
  Vote,
  Users2,
  FolderOpen,
  Settings,
  History,
  Sparkles,
  MessageSquare,
  Store,
  IdCard,
  Bookmark,
  ShieldCheck,
  UserCog,
  Layers,
  PanelLeftClose,
  PanelLeftOpen,
  Sun,
  Moon,
  Contrast,
  ChevronUp,
  ChevronDown,
  LayoutTemplate,
  Palette,
} from "lucide-react";
import type { TKey } from "@/lib/i18n";
import type { LucideIcon } from "lucide-react";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { useTheme } from "@/lib/theme";

type Item = { key: TKey; icon: LucideIcon; to?: string; label?: string };

const overview: Item[] = [{ key: "nav.dashboard", icon: LayoutDashboard, to: "/" }];
const members: Item[] = [
  { key: "nav.members", icon: Users, to: "/members" },
  { key: "nav.companies", icon: Building2, to: "/companies" },
  { key: "nav.memberSeg", icon: Tags, to: "/segments" },
  { key: "nav.renewal", icon: RefreshCw, to: "/renewal" },
];
const events: Item[] = [
  { key: "nav.events", icon: Calendar, to: "/events" },
  { key: "eventsOverview.title", icon: Calendar, to: "/events-overview" },
  { key: "nav.meeting", icon: Users2, to: "/meetings" },
  { key: "nav.governance", icon: Vote, to: "/voting" },
  { key: "nav.eventReg", icon: ClipboardList, to: "/event-registrations" },
  { key: "nav.checkin", icon: ScanLine, to: "/checkin" },
  { key: "checkinQr.title", icon: QrCodeIcon, to: "/checkin-qr" },
];
const sponsors: Item[] = [
  { key: "nav.sponsors", icon: Handshake, to: "/sponsors" },
  { key: "nav.sponsorPkg", icon: Package, to: "/sponsor-packages" },
  { key: "nav.sponsorReport", icon: FileBarChart, to: "/sponsor-report" },
];
const finance: Item[] = [
  { key: "nav.fee", icon: Wallet, to: "/fees" },
  { key: "nav.income", icon: ArrowDownCircle, to: "/income" },
  { key: "nav.expenses" as TKey, icon: ArrowUpCircle, to: "/expenses" },
  { key: "nav.financeReport", icon: PieChart, to: "/finance-report" },
];
const comm: Item[] = [
  { key: "nav.notify", icon: Bell, to: "/notifications" },
  { key: "nav.email", icon: Mail, to: "/email-marketing" },
  { key: "nav.news", icon: Newspaper, to: "/news" },
  { key: "nav.perks", icon: Gift, to: "/perks" },
  { key: "nav.benefits", icon: Award, to: "/benefits" },
];
const network: Item[] = [
  { key: "nav.network", icon: MessageSquare, to: "/network", label: "Tin nhắn & Trao đổi công việc" },
  { key: "nav.bc.meetings" as TKey, icon: Users2, to: "/business-connect/meetings", label: "Cuộc gặp" },
  { key: "nav.marketplace", icon: Store, to: "/marketplace", label: "Marketplace & Giao thương B2B" },
  { key: "nav.opportunities", icon: Sparkles, to: "/opportunities", label: "Cơ hội hợp tác" },
];
const system: Item[] = [
  {
    key: "nav.tasks" as TKey,
    icon: CheckSquare,
    to: "/tasks",
    label: "Quản lý công việc",
  },
  { key: "nav.settings", icon: Settings, to: "/settings" },
  { key: "nav.activity", icon: History, to: "/activity" },
  {
    key: "nav.themeManagement" as TKey,
    icon: Palette,
    to: "/admin/landing-templates",
    label: "Quản lý chủ đề",
  },
];
const permissionsGroup: Item[] = [
  {
    key: "nav.permissions" as TKey,
    icon: ShieldCheck,
    to: "/permissions?tab=matrix",
    label: "Ma trận phân quyền",
  },
  {
    key: "nav.permissionUserActions" as any,
    icon: UserCog,
    to: "/permissions?tab=user_actions",
    label: "Phân quyền tài khoản",
  },
  {
    key: "nav.permissionRoleGroups" as any,
    icon: Layers,
    to: "/permissions?tab=role_groups",
    label: "Thẩm quyền Ban & Cấp bậc",
  },
];
const admin: Item[] = [
  { key: "nav.documents", icon: FolderOpen, to: "/documents" },
  {
    key: "nav.bcAdmin",
    icon: IdCard,
    to: "/admin/business-cards",
    label: "Quản lý Thẻ Doanh Nhân",
  },
];

const COLLAPSE_KEY = "vba.sidebar.collapsed";

function isActive(pathname: string | undefined, to?: string, searchStr?: string) {
  if (!to || !pathname) return false;
  if (to.includes("?")) {
    const [pathPart, queryPart] = to.split("?");
    if (pathname !== pathPart) return false;
    const currentSearch = searchStr ?? (typeof window !== "undefined" ? window.location.search : "");
    const sp = new URLSearchParams(currentSearch);
    const [queryKey, queryVal] = queryPart.split("=");
    if (queryKey && queryVal) {
      const actualVal = sp.get(queryKey);
      if (!actualVal && queryKey === "tab" && queryVal === "matrix") {
        return true;
      }
      return actualVal === queryVal;
    }
    return currentSearch.includes(queryPart);
  }
  if (to === "/") return pathname === "/";
  return pathname === to || pathname.startsWith(to + "/");
}

function NavItem({
  item,
  pathname,
  searchStr,
  collapsed,
  onNavigate,
  badge,
  getLabel,
}: {
  item: Item;
  pathname: string | undefined;
  searchStr?: string;
  collapsed: boolean;
  onNavigate?: () => void;
  badge?: number;
  getLabel?: (it: { to?: string; key?: string; label?: string }, fallback?: string) => string;
}) {
  const t = useT();
  const Icon = item.icon;
  const active = isActive(pathname, item.to, searchStr);
  const defaultLabel = item.label || t(item.key);
  const label = getLabel ? getLabel(item, defaultLabel) : defaultLabel;
  const showBadge = !!badge && badge > 0;
  const badgeText = badge && badge > 99 ? "99+" : String(badge ?? 0);
  const cls = `group relative flex w-full items-center gap-3 rounded-lg py-2 text-[13px] outline-none transition-[background-color,color] duration-[var(--motion-fast)] ease-out focus-visible:ring-2 focus-visible:ring-sidebar-ring ${
    collapsed ? "justify-center px-0" : "pl-3.5 pr-3"
  } ${
    active
      ? "bg-sidebar-accent text-sidebar-accent-foreground"
      : "text-sidebar-foreground/85 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
  }`;
  const badgeEl = showBadge ? (
    collapsed ? (
      <span className="vba-badge-pop absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive ring-2 ring-sidebar" />
    ) : (
      <span className="vba-badge-pop ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 text-[10px] font-bold text-destructive-foreground">
        {badgeText}
      </span>
    )
  ) : null;
  const inner = (
    <>
      {active && !collapsed && (
        <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-sidebar-primary" />
      )}
      {active && collapsed && (
        <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-sidebar-primary" />
      )}
      <Icon
        className={`h-[18px] w-[18px] shrink-0 transition-transform duration-[var(--motion-fast)] ease-out ${
          active ? "text-sidebar-primary" : "group-hover:translate-x-0.5"
        }`}
        strokeWidth={active ? 2.4 : 1.9}
      />
      {!collapsed && <span className="flex-1 truncate text-left font-medium">{label}</span>}
      {badgeEl}
    </>
  );
  if (item.to) {
    return (
      <Link
        to={item.to}
        data-active={active ? "true" : undefined}
        className={cls}
        onClick={onNavigate}
        title={collapsed ? label : undefined}
      >
        {inner}
      </Link>
    );
  }
  return (
    <button
      data-active={active ? "true" : undefined}
      className={cls}
      onClick={onNavigate}
      title={collapsed ? label : undefined}
    >
      {inner}
    </button>
  );
}

function Group({
  label,
  items,
  pathname,
  searchStr,
  collapsed,
  onNavigate,
  badges,
}: {
  label?: TKey;
  items: Item[];
  pathname: string | undefined;
  searchStr?: string;
  collapsed: boolean;
  onNavigate?: () => void;
  badges?: Record<string, number>;
}) {
  if (!items || items.length === 0) return null;
  const t = useT();
  const { getLabel, getGroupLabel } = useSidebarLabels();
  const displayGroupLabel = label ? getGroupLabel(label, t(label)) : undefined;
  return (
    <div className={collapsed ? "px-2.5" : "px-3"}>
      {displayGroupLabel &&
        (collapsed ? (
          <div className="mx-2 mb-1.5 mt-1 h-px bg-sidebar-border/50" />
        ) : (
          <div className="mb-1 px-3 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-sidebar-foreground/45">
            {displayGroupLabel}
          </div>
        ))}
      <div className="space-y-[3px]">
        {items.map((it) => (
          <NavItem
            key={it.key}
            item={it}
            pathname={pathname}
            searchStr={searchStr}
            collapsed={collapsed}
            onNavigate={onNavigate}
            badge={it.to ? badges?.[it.to] : undefined}
            getLabel={getLabel}
          />
        ))}
      </div>
    </div>
  );
}

export function Sidebar({
  mobile = false,
  onNavigate,
}: { mobile?: boolean; onNavigate?: () => void } = {}) {
  const t = useT();
  const roleState = useRole();
  const {
    isPlatformAdmin,
    isAdmin,
    srsRole,
    isBQT,
    isBTK,
    isBTT,
    isBXT,
    isBTV,
    isBTN,
    isBTC,
    isHVT,
    canManageMembers,
    canManageFinance,
    canManageMedia,
    canManageEvents,
    canScanQR,
    canManageSystem,
    setRoleOverride,
  } = roleState;

  // Xác định 1 trong 5 vai trò hệ thống CRM cốt lõi
  const currentRoleKey: SystemRoleKey = useMemo(() => {
    if (isPlatformAdmin) return "quan_tri";
    if (isBQT) return "admin";
    if (isBTK) return "tong_thu_ky";
    if (isBTT || isBXT || isBTV || isBTN) return "truong_ban";
    return "member";
  }, [isPlatformAdmin, isBQT, isBTK, isBTT, isBXT, isBTV, isBTN]);

  const [matrixRevision, setMatrixRevision] = useState(0);
  useEffect(() => {
    const handleUpdate = () => setMatrixRevision((v) => v + 1);
    window.addEventListener("crm_permissions_updated", handleUpdate);
    window.addEventListener("role-changed", handleUpdate);
    return () => {
      window.removeEventListener("crm_permissions_updated", handleUpdate);
      window.removeEventListener("role-changed", handleUpdate);
    };
  }, []);

  const isAllowed = useCallback(
    (route?: string): boolean => {
      if (!route) return true;
      return isRouteAllowedByMatrix(route, currentRoleKey);
    },
    [currentRoleKey, matrixRevision]
  );

  // Scoped permissions according to the SRS RBAC matrix:
  const canViewMembers = true; // All can view member directory (HVT is read-only)
  const canViewEvents = true; // All can view events
  const canViewSponsors = isBQT || isBTC; // Finance & sponsorship management
  const canViewFinance = isBQT || isBTC; // Finance ONLY for ADM, BQT, BTC. Hidden from HVT, BTV, BTT!
  const canViewComm = isBQT || isBTT || isHVT; // News & media
  const canViewNetwork = true; // B2B Marketplace & networking
  const canViewBusinessConnect = true; // Card & 1-on-1 connections
  const canViewSystem = isPlatformAdmin || srsRole === "BQT"; // System settings ONLY for ADM and BQT
  const canViewPlatform = isPlatformAdmin || srsRole === "BQT"; // Permissions ONLY for ADM and BQT

  const location = useRouterState({ select: (s) => s?.location });
  const pathname = location?.pathname;
  const searchStr = location?.searchStr || (typeof window !== "undefined" ? window.location.search : "");

  const fetchMine = useServerFn(listMyAssociationsFn);
  const { data: myAssocs, reload } = useServerData<MyAssociation[]>(() => fetchMine(), []);
  const activeAssoc = myAssocs?.find((a) => a.isActive) ?? myAssocs?.[0];

  const unreadNotify = useUnreadNotifications();
  const badges: Record<string, number> = { "/notifications": unreadNotify };

  const [overrideBrandName, setOverrideBrandName] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("vba_active_assoc_name");
    }
    return null;
  });

  useEffect(() => {
    const onChange = (e: any) => {
      reload();
      if (e?.detail?.name) {
        setOverrideBrandName(e.detail.name);
      } else if (typeof window !== "undefined") {
        setOverrideBrandName(localStorage.getItem("vba_active_assoc_name"));
      }
    };
    window.addEventListener("association-changed", onChange);
    return () => window.removeEventListener("association-changed", onChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const brandName = overrideBrandName || activeAssoc?.name || t("brand.name");

  // Collapse only applies to the desktop sidebar; the mobile drawer is always full.
  const [collapsed, setCollapsed] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [bottomExpanded, setBottomExpanded] = useState(false);

  useEffect(() => {
    if (mobile) return;
    try {
      setCollapsed(localStorage.getItem(COLLAPSE_KEY) === "1");
    } catch {
      /* ignore */
    }
  }, [mobile]);

  // Restore scroll position & auto-scroll active item into view
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("crm_sidebar_scroll_top");
      if (saved && scrollRef.current) {
        scrollRef.current.scrollTop = Number(saved);
      }
    } catch {
      /* ignore */
    }

    const timer = setTimeout(() => {
      const activeEl = scrollRef.current?.querySelector('[data-active="true"]');
      if (activeEl) {
        activeEl.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    }, 60);
    return () => clearTimeout(timer);
  }, [pathname]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    try {
      sessionStorage.setItem("crm_sidebar_scroll_top", String(e.currentTarget.scrollTop));
    } catch {
      /* ignore */
    }
  };

  function toggle() {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(COLLAPSE_KEY, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  }

  const isCollapsed = !mobile && collapsed;
  const visibility = mobile ? "flex" : "hidden lg:flex";
  const width = isCollapsed ? "w-[72px]" : "w-[260px]";

  // Lọc chi tiết từng mục menu kết hợp Ma Trận Quyền và vai trò 6 Ban
  const filteredOverview = overview.filter((it) => isAllowed(it.to));

  const filteredMembers = members.filter((it) => {
    if (!isAllowed(it.to)) return false;
    if (it.to === "/segments" || it.to === "/renewal") {
      return canManageMembers || isBQT || isBTV || isBTK;
    }
    return true;
  });

  const filteredEvents = events.filter((it) => {
    if (!isAllowed(it.to)) return false;
    if (it.to === "/checkin" || it.to === "/checkin-qr") {
      return canScanQR || isBQT || isBTT || isBTK;
    }
    if (it.to === "/event-registrations") {
      return canManageEvents || isBQT || isBTT || isBTK;
    }
    return true;
  });

  const filteredSponsors = sponsors.filter((it) => {
    if (!isAllowed(it.to)) return false;
    if (it.to === "/sponsor-report" || it.to === "/sponsor-packages") {
      return canManageFinance || isBQT || isBXT;
    }
    return isBQT || isBXT;
  });

  const filteredFinance = finance.filter((it) => {
    if (!isAllowed(it.to)) return false;
    return isBQT || isBTC;
  });

  const filteredComm = comm.filter((it) => {
    if (!isAllowed(it.to)) return false;
    if (it.to === "/email-marketing") {
      return canManageMedia || isBQT || isBTT;
    }
    return true;
  });

  const filteredNetwork = network.filter((it) => isAllowed(it.to));

  const filteredSystem = system.filter((it) => {
    if (!isAllowed(it.to)) return false;
    if (it.to === "/tasks") return true;
    if (it.to === "/settings") return isPlatformAdmin || isBQT;
    if (it.to === "/activity") return isPlatformAdmin || isBQT || isBTK;
    if (it.to === "/admin/landing-templates") return isPlatformAdmin || isBQT || isBTT;
    return true;
  });

  const filteredPermissions = permissionsGroup.filter((it) => {
    if (!isAllowed("/permissions")) return false;
    return isPlatformAdmin || isBQT;
  });

  const filteredAdmin = admin.filter((it) => {
    if (!isAllowed(it.to)) return false;
    if (it.to === "/documents") {
      return true;
    }
    if (it.to === "/admin/business-cards") {
      return isPlatformAdmin || isBQT;
    }
    return true;
  });

  return (
    <aside
      className={`${visibility} ${mobile ? "h-dvh" : "sticky top-0 h-dvh"} ${width} shrink-0 flex-col border-r border-sidebar-border transition-[width] duration-[var(--motion-slow)] ease-out`}
      style={{ background: "var(--gradient-sidebar)" }}
    >
      {/* Logo */}
      <div
        className={`flex h-[72px] items-center gap-3 border-b border-sidebar-border ${
          isCollapsed ? "justify-center px-2" : "px-5"
        }`}
      >
        {activeAssoc?.logoUrl ? (
          <img
            src={resolveMediaUrl(activeAssoc.logoUrl) || activeAssoc.logoUrl}
            alt={brandName}
            className="h-10 w-10 shrink-0 rounded-xl object-cover"
          />
        ) : (
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[11px] font-bold text-primary-foreground"
            style={{ background: "var(--gradient-card)" }}
          >
            VBA
          </div>
        )}
        {!isCollapsed && (
          <div className="min-w-0 flex-1 leading-tight">
            <div className="truncate text-[13px] font-semibold text-sidebar-foreground">
              {brandName}
            </div>
            <div className="truncate text-[11px] text-sidebar-foreground/60">
              {t("brand.tagline")}
            </div>
          </div>
        )}
        {!mobile && !isCollapsed && (
          <button
            onClick={toggle}
            aria-label={t("nav.collapse")}
            title={t("nav.collapse")}
            className="shrink-0 rounded-lg p-1.5 text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground cursor-pointer"
          >
            <PanelLeftClose className="h-[18px] w-[18px]" />
          </button>
        )}
      </div>

      {/* Collapsed expand button */}
      {!mobile && isCollapsed && (
        <div className="flex justify-center pt-2">
          <button
            onClick={toggle}
            aria-label={t("nav.expand")}
            title={t("nav.expand")}
            className="rounded-lg p-1.5 text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <PanelLeftOpen className="h-[18px] w-[18px]" />
          </button>
        </div>
      )}

      {/* Nav */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="sidebar-scroll flex-1 space-y-5 overflow-y-auto py-4"
      >
        <Group
          items={filteredOverview}
          pathname={pathname}
          searchStr={searchStr}
          collapsed={isCollapsed}
          onNavigate={onNavigate}
        />
        {canViewMembers && (
          <Group
            label="nav.group.members"
            items={filteredMembers}
            pathname={pathname}
            searchStr={searchStr}
            collapsed={isCollapsed}
            onNavigate={onNavigate}
          />
        )}
        {canViewEvents && (
          <Group
            label="nav.group.events"
            items={filteredEvents}
            pathname={pathname}
            searchStr={searchStr}
            collapsed={isCollapsed}
            onNavigate={onNavigate}
          />
        )}
        {canViewSponsors && (
          <Group
            label="nav.group.sponsors"
            items={filteredSponsors}
            pathname={pathname}
            searchStr={searchStr}
            collapsed={isCollapsed}
            onNavigate={onNavigate}
          />
        )}
        {canViewFinance && (
          <Group
            label="nav.group.finance"
            items={filteredFinance}
            pathname={pathname}
            searchStr={searchStr}
            collapsed={isCollapsed}
            onNavigate={onNavigate}
          />
        )}
        {canViewComm && (
          <Group
            label="nav.group.comm"
            items={filteredComm}
            pathname={pathname}
            searchStr={searchStr}
            collapsed={isCollapsed}
            onNavigate={onNavigate}
            badges={badges}
          />
        )}
        {canViewNetwork && (
          <Group
            label="nav.group.network"
            items={filteredNetwork}
            pathname={pathname}
            searchStr={searchStr}
            collapsed={isCollapsed}
            onNavigate={onNavigate}
          />
        )}
        {canViewSystem && (
          <Group
            label="nav.group.system"
            items={filteredSystem}
            pathname={pathname}
            searchStr={searchStr}
            collapsed={isCollapsed}
            onNavigate={onNavigate}
          />
        )}
        {filteredPermissions.length > 0 && (
          <Group
            label="nav.group.permissions"
            items={filteredPermissions}
            pathname={pathname}
            searchStr={searchStr}
            collapsed={isCollapsed}
            onNavigate={onNavigate}
          />
        )}
        {filteredAdmin.length > 0 && (
          <Group
            label="nav.group.admin"
            items={filteredAdmin}
            pathname={pathname}
            searchStr={searchStr}
            collapsed={isCollapsed}
            onNavigate={onNavigate}
          />
        )}
      </div>

      {/* Theme switcher & Enterprise bar — có thể thu nhỏ cố định hoặc phóng to */}
      {isCollapsed ? (
        <div className="flex items-center justify-center border-t border-sidebar-border pb-2 pt-3 px-2">
          <ThemeToggleIconBtn />
        </div>
      ) : !bottomExpanded ? (
        /* Cố định thu nhỏ: thanh ngang nhỏ gọn, tiết kiệm diện tích tối đa */
        <div className="border-t border-sidebar-border px-3 py-2.5">
          <div className="flex w-full items-center justify-between gap-2">
            <ThemeSwitcher />
            <button
              type="button"
              onClick={() => setBottomExpanded(true)}
              className="flex items-center gap-1.5 rounded-lg bg-primary/10 px-2 py-1 text-[11px] font-bold text-primary transition hover:bg-primary/20 cursor-pointer"
              title="Mở rộng xem gói Enterprise"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span className="truncate max-w-[68px]">Enterprise</span>
              <ChevronUp className="h-3.5 w-3.5 opacity-70" />
            </button>
          </div>
        </div>
      ) : (
        /* Trạng thái mở rộng: hiển thị đầy đủ Theme Switcher và Card Enterprise với nút thu nhỏ */
        <>
          <div className="flex items-center border-t border-sidebar-border px-4 pb-2 pt-3">
            <div className="flex w-full items-center justify-between">
              <span className="text-[11px] font-medium text-sidebar-foreground/60">
                {t("theme.label")}
              </span>
              <div className="flex items-center gap-2">
                <ThemeSwitcher />
                <button
                  type="button"
                  onClick={() => setBottomExpanded(false)}
                  className="rounded-lg p-1 text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground cursor-pointer"
                  title="Thu nhỏ cố định"
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="p-4 pt-1">
            <div
              className="relative overflow-hidden rounded-xl border border-border/10 p-4 text-primary-foreground shadow-[var(--shadow-card)]"
              style={{ background: "var(--gradient-card)" }}
            >
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  <div className="text-[13px] font-semibold">{t("upgrade.title")}</div>
                </div>
                <button
                  type="button"
                  onClick={() => setBottomExpanded(false)}
                  className="rounded-md p-1 text-primary-foreground/70 transition hover:bg-white/10 hover:text-white cursor-pointer"
                  title="Thu nhỏ cố định"
                >
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
              </div>
              <p className="mb-3 text-[11px] leading-relaxed text-primary-foreground/85">
                {t("upgrade.body")}
              </p>
              <button className="w-full rounded-lg bg-card/15 py-2 text-xs font-semibold backdrop-blur transition hover:bg-card/25 cursor-pointer">
                {t("upgrade.cta")}
              </button>
            </div>
          </div>
        </>
      )}
    </aside>
  );
}

/** Mini cycling icon button dùng khi sidebar thu gọn. */
function ThemeToggleIconBtn() {
  const { theme, toggle } = useTheme();
  const icons = { light: Sun, dark: Moon, contrast: Contrast };
  const Icon = icons[theme];
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Đổi giao diện"
      title="Đổi giao diện"
      className="flex h-9 w-9 items-center justify-center rounded-full text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}
