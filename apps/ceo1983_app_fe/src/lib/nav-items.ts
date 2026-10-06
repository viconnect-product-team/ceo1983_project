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
  QrCode,

  Handshake,
  Package,
  FileBarChart,
  Wallet,
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
  ShieldCheck,
  UserCog,
  Bookmark,
  Layers,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { TKey } from "@/lib/i18n";

export type NavItem = { key: TKey; icon: LucideIcon; to: string };
export type NavGroup = { label?: TKey; items: NavItem[]; platformOnly?: boolean };

/**
 * Single source of truth for primary navigation destinations.
 * Consumed by the Ctrl+K command palette (and available to other shells).
 */
export const navGroups: NavGroup[] = [
  {
    items: [
      { key: "nav.dashboard", icon: LayoutDashboard, to: "/" },
      { key: "nav.ai", icon: Sparkles, to: "/ai" },
    ],
  },
  {
    label: "nav.group.members",
    items: [
      { key: "nav.members", icon: Users, to: "/members" },
      { key: "nav.companies", icon: Building2, to: "/companies" },
      { key: "nav.memberSeg", icon: Tags, to: "/segments" },
      { key: "nav.renewal", icon: RefreshCw, to: "/renewal" },
    ],
  },
  {
    label: "nav.group.events",
    items: [
      { key: "nav.events", icon: Calendar, to: "/events" },
      { key: "eventsOverview.title", icon: Calendar, to: "/events-overview" },
      { key: "nav.meeting", icon: Users2, to: "/meetings" },
      { key: "nav.governance", icon: Vote, to: "/voting" },
      { key: "nav.eventReg", icon: ClipboardList, to: "/event-registrations" },
      { key: "nav.checkin", icon: ScanLine, to: "/checkin" },
      { key: "checkinQr.title", icon: QrCode, to: "/checkin-qr" },
    ],
  },
  {
    label: "nav.group.sponsors",
    items: [
      { key: "nav.sponsors", icon: Handshake, to: "/sponsors" },
      { key: "nav.sponsorPkg", icon: Package, to: "/sponsor-packages" },
      { key: "nav.sponsorReport", icon: FileBarChart, to: "/sponsor-report" },
    ],
  },
  {
    label: "nav.group.finance",
    items: [
      { key: "nav.fee", icon: Wallet, to: "/fees" },
      { key: "nav.income", icon: ArrowLeftRight, to: "/income" },
      { key: "nav.financeReport", icon: PieChart, to: "/finance-report" },
    ],
  },
  {
    label: "nav.group.comm",
    items: [
      { key: "nav.notify", icon: Bell, to: "/notifications" },
      { key: "nav.email", icon: Mail, to: "/email-marketing" },
      { key: "nav.news", icon: Newspaper, to: "/news" },
      { key: "nav.perks", icon: Gift, to: "/perks" },
      { key: "nav.benefits", icon: Award, to: "/benefits" },
    ],
  },
  {
    label: "nav.group.permissions",
    items: [
      { key: "nav.permissions" as TKey, icon: ShieldCheck, to: "/permissions?tab=matrix" },
      { key: "nav.permissionUserActions" as TKey, icon: UserCog, to: "/permissions?tab=user_actions" },
      { key: "nav.permissionRoleGroups" as TKey, icon: Layers, to: "/permissions?tab=role_groups" },
    ],
  },
  {
    label: "nav.group.admin",
    items: [
      { key: "nav.documents", icon: FolderOpen, to: "/documents" },
    ],
  },
  {
    label: "nav.group.network",
    items: [
      { key: "nav.network", icon: MessageSquare, to: "/network" },
      { key: "nav.bc.meetings" as TKey, icon: Users2, to: "/business-connect/meetings" },
      { key: "nav.bc.saved" as TKey, icon: Bookmark, to: "/business-connect/saved-cards" },
      { key: "nav.marketplace", icon: Store, to: "/marketplace" },
      { key: "nav.opportunities", icon: Sparkles, to: "/opportunities" },
    ],
  },
  {
    label: "nav.group.system",
    items: [
      { key: "nav.tasks" as TKey, icon: CheckSquare, to: "/tasks" },
      { key: "nav.account", icon: UserCog, to: "/account-settings" },
      { key: "nav.settings", icon: Settings, to: "/settings" },
      { key: "nav.activity", icon: History, to: "/activity" },
    ],
  },
];
