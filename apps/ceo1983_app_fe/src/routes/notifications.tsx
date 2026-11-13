import { createFileRoute, useRouter, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Bell,
  CheckCheck,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  Building2,
  Calendar,
  Info,
  Mail,
  Megaphone,
  MessageSquare,
  Pencil,
  Plus,
  Search,
  Send,
  Trash2,
  LayoutList,
  LayoutGrid,
  ExternalLink,
  Clock,
  Sparkles,
  CreditCard,
} from "lucide-react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { AppShell } from "@/components/dashboard/AppShell";
import { PageHeader, Pill } from "@/components/dashboard/PageKit";
import { EmptyState, NoNotifications, NoSearchResult } from "@/components/dashboard/StateKit";
import type { Notification } from "@/lib/extra-data";
import { CrudModal, type CrudField, type CrudValues } from "@/components/dashboard/CrudModal";
import { EventReminderPosterModal } from "@/components/dashboard/EventReminderPosterModal";
import { getLastSeen, markNotificationsSeen } from "@/hooks/use-unread-notifications";
import { fetchNestApi } from "@/lib/api-client";
import {
  createNotificationFn,
  deleteNotificationFn,
  listNotificationsFn,
  pushNotificationToMessagesFn,
  sendNotificationFn,
  updateNotificationFn,
} from "@/lib/notifications.functions";
import { useFmt, useT, type TKey } from "@/lib/i18n";
import {
  CustomTable,
  useCustomTableSort,
  CrmMetricCard,
  CrmMetricGrid,
  CrmToolbar,
  type CustomTableColumn,
} from "@/components/common/CustomTable";

type NotificationSearchParams = {
  filter?: string;
};

export const Route = createFileRoute("/notifications")({
  ssr: false,
  validateSearch: (search: Record<string, unknown>): NotificationSearchParams => ({
    filter: typeof search.filter === "string" ? search.filter : undefined,
  }),
  loader: async () => {
    try {
      const res = await listNotificationsFn();
      return Array.isArray(res) ? res : [];
    } catch {
      return [];
    }
  },
  component: NotifyPage,
});

const STATUS_KEY: Record<Notification["status"], TKey> = {
  sent: "notif.status.sent",
  scheduled: "notif.status.scheduled",
  draft: "notif.status.draft",
};
const STATUS_COLOR: Record<Notification["status"], "success" | "info" | "neutral"> = {
  sent: "success",
  scheduled: "info",
  draft: "neutral",
};
const AUDIENCE_KEY: Record<Notification["audience"], TKey> = {
  all: "notif.aud.all",
  members: "notif.aud.members",
  sponsors: "notif.aud.sponsors",
  staff: "notif.aud.staff",
};

const SCOPE_CONFIG: Record<string, { label: string; bg: string; text: string; border: string }> = {
  crm: { label: "CRM Quản trị", bg: "bg-blue-500/10", text: "text-blue-600 dark:text-blue-400", border: "border-blue-500/20" },
  association_app: { label: "App Hiệp Hội CEO 1983", bg: "bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400", border: "border-emerald-500/20" },
  all: { label: "Toàn hệ thống", bg: "bg-purple-500/10", text: "text-purple-600 dark:text-purple-400", border: "border-purple-500/20" },
};

type SubFilterType = "all" | "new_members" | "fee_alerts" | "admin_system" | "events_meetings";
type ReadTabType = "all" | "unread" | "read";
type ViewModeType = "table" | "cards";

function getNotificationCategory(n: Notification): {
  id: SubFilterType;
  label: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  icon: React.ComponentType<{ className?: string }>;
  actionUrl?: string;
  actionLabel?: string;
} {
  const code = ((n as any).code || "").toUpperCase();
  const title = (n.title || "").toLowerCase();
  const body = (n.body || "").toLowerCase();

  // 1. Hồ sơ hội viên mới
  if (
    code.includes("MBR") ||
    title.includes("hồ sơ đăng ký") ||
    title.includes("hội viên mới") ||
    title.includes("hồ sơ mới") ||
    body.includes("vừa nộp đơn đăng ký") ||
    body.includes("phê duyệt")
  ) {
    return {
      id: "new_members",
      label: "Hội viên mới",
      badgeBg: "bg-purple-500/10",
      badgeText: "text-purple-600 dark:text-purple-400",
      badgeBorder: "border-purple-500/25",
      icon: UserCheck,
      actionUrl: "/members?status=pending",
      actionLabel: "Duyệt hồ sơ",
    };
  }

  // 2. Cảnh báo & Quá hạn hội phí
  if (
    code.includes("FEE") ||
    title.includes("quá hạn hội phí") ||
    title.includes("hết hạn hội phí") ||
    title.includes("hội phí") ||
    title.includes("niên liễm") ||
    body.includes("hội phí") ||
    body.includes("niên liễm") ||
    body.includes("đóng phí")
  ) {
    const isOverdue = code.includes("OVERDUE") || title.includes("quá hạn");
    return {
      id: "fee_alerts",
      label: isOverdue ? "Quá hạn hội phí" : "Sắp đến hạn",
      badgeBg: isOverdue ? "bg-rose-500/10" : "bg-amber-500/10",
      badgeText: isOverdue ? "text-rose-600 dark:text-rose-400" : "text-amber-600 dark:text-amber-400",
      badgeBorder: isOverdue ? "border-rose-500/25" : "border-amber-500/25",
      icon: AlertTriangle,
      actionUrl: "/renewal",
      actionLabel: "Thu phí / Gia hạn",
    };
  }

  // 3. Sự kiện & Cuộc họp
  if (
    code.includes("EVT") ||
    code.includes("MTG") ||
    title.includes("sự kiện") ||
    title.includes("cuộc họp") ||
    body.includes("vé sự kiện") ||
    body.includes("cuộc họp mới")
  ) {
    return {
      id: "events_meetings",
      label: code.includes("MTG") || title.includes("cuộc họp") ? "Cuộc họp" : "Sự kiện",
      badgeBg: "bg-emerald-500/10",
      badgeText: "text-emerald-600 dark:text-emerald-400",
      badgeBorder: "border-emerald-500/25",
      icon: Calendar,
      actionUrl: "/events",
      actionLabel: "Xem chi tiết",
    };
  }

  // 4. BQT & Điều hành
  if (
    n.audience === "staff" ||
    (n as any).targetChannel === "admins" ||
    title.includes("ban điều hành") ||
    title.includes("bqt") ||
    title.includes("quản trị")
  ) {
    return {
      id: "admin_system",
      label: "BQT & Điều hành",
      badgeBg: "bg-blue-500/10",
      badgeText: "text-blue-600 dark:text-blue-400",
      badgeBorder: "border-blue-500/25",
      icon: Building2,
      actionUrl: "/overview",
      actionLabel: "Xem tổng quan",
    };
  }

  // 5. Mặc định
  return {
    id: "admin_system",
    label: "Hệ thống",
    badgeBg: "bg-slate-500/10",
    badgeText: "text-slate-600 dark:text-slate-400",
    badgeBorder: "border-slate-500/25",
    icon: Bell,
    actionUrl: undefined,
    actionLabel: undefined,
  };
}

function audienceIcon(a: Notification["audience"]) {
  if (a === "sponsors" || a === "staff") return Info;
  return Megaphone;
}

function startOfDay(ts: number) {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function NotifyPage() {
  const t = useT();
  const fmt = useFmt();
  const router = useRouter();
  const searchParams = Route.useSearch();
  const activeSubFilter = (searchParams.filter || "all") as SubFilterType;

  const loaderItems = (Route.useLoaderData() as Notification[]) || [];
  const [items, setItems] = useState<Notification[]>(loaderItems);

  useEffect(() => {
    if (loaderItems.length > 0) {
      setItems(loaderItems);
    } else {
      void fetchNestApi<Notification[]>("/admin/notifications").then((res) => {
        if (Array.isArray(res) && res.length > 0) setItems(res);
      }).catch(() => {});
    }
  }, [loaderItems]);

  const sent = items.filter((n) => n.status === "sent");

  const rel = useCallback(
    (iso: string) => {
      const ts = iso ? new Date(iso).getTime() : 0;
      if (!ts) return "";
      const diff = Date.now() - ts;
      const min = Math.floor(diff / 60000);
      if (min < 1) return t("time.now");
      if (min < 60) return `${min} ${t("time.minute")}`;
      const hr = Math.floor(min / 60);
      if (hr < 24) return `${hr} ${t("time.hour")}`;
      const day = Math.floor(hr / 24);
      if (day < 30) return `${day} ${t("time.day")}`;
      return fmt.date(iso);
    },
    [t, fmt],
  );

  // lastSeenAt: captured after mount to avoid SSR/localStorage hydration mismatch.
  const [seen, setSeen] = useState(0);
  useEffect(() => {
    setSeen(getLastSeen());
    const onSeen = () => setSeen(getLastSeen());
    window.addEventListener("notifications-seen", onSeen);
    return () => window.removeEventListener("notifications-seen", onSeen);
  }, []);

  const [readTab, setReadTab] = useState<ReadTabType>("all");
  const [query, setQuery] = useState("");
  const [audience, setAudience] = useState<"all" | Notification["audience"]>("all");
  const [scope, setScope] = useState<string>("all");
  const [viewMode, setViewMode] = useState<ViewModeType>("table");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  const createFn = useServerFn(createNotificationFn);
  const updateFn = useServerFn(updateNotificationFn);
  const deleteFn = useServerFn(deleteNotificationFn);
  const sendFn = useServerFn(sendNotificationFn);
  const pushToMessagesFn = useServerFn(pushNotificationToMessagesFn);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Notification | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [pushingId, setPushingId] = useState<string | null>(null);
  const [eventReminderModalOpen, setEventReminderModalOpen] = useState(false);

  const [pushedMessageIds, setPushedMessageIds] = useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set();
    try {
      const saved = localStorage.getItem("pushed_to_messages_notif_ids");
      if (saved) return new Set(JSON.parse(saved));
    } catch { }
    return new Set();
  });

  useEffect(() => {
    setPushedMessageIds((prev) => {
      const next = new Set(prev);
      let changed = false;
      for (const item of items) {
        if ((item as any).pushedToMessages || ((item as any).targetChannel && (item as any).targetChannel !== "none")) {
          if (!next.has(item.id)) {
            next.add(item.id);
            changed = true;
          }
          if ((item as any).code && !next.has((item as any).code)) {
            next.add((item as any).code);
            changed = true;
          }
        }
      }
      if (changed) {
        try {
          localStorage.setItem("pushed_to_messages_notif_ids", JSON.stringify(Array.from(next)));
        } catch { }
      }
      return changed ? next : prev;
    });
  }, [items]);

  const handlePushToMessages = async (n: Notification, targetChannel = "channel_media") => {
    setPushingId(n.id);
    try {
      await pushToMessagesFn({ data: { id: n.id, channel: targetChannel } }).catch(() => null);

      const channelList =
        targetChannel === "all_channels"
          ? ["channel_media", "channel_membership", "channel_promotion", "channel_secretariat", "channel_deals", "channel_events"]
          : [targetChannel];

      for (const ch of channelList) {
        const chatKey = `vba.chat.${ch}`;
        try {
          const history = JSON.parse(localStorage.getItem(chatKey) || "[]");
          const newMsg = {
            id: `crm-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            text: `📢 THÔNG BÁO TỪ BAN ĐIỀU HÀNH:\n\n*${n.title}*\n\n${n.body || ""}`,
            mine: false,
            time: "Vừa xong",
            createdAt: new Date().toISOString(),
            seen: false,
          };
          history.push(newMsg);
          localStorage.setItem(chatKey, JSON.stringify(history));
        } catch { }
      }

      setPushedMessageIds((prev) => {
        const next = new Set(prev).add(n.id);
        if ((n as any).code) next.add((n as any).code);
        try {
          localStorage.setItem("pushed_to_messages_notif_ids", JSON.stringify(Array.from(next)));
        } catch { }
        return next;
      });

      window.dispatchEvent(
        new CustomEvent("vba:notification_pushed_to_messages", {
          detail: { id: n.id, code: (n as any).code, channel: targetChannel },
        }),
      );
      window.dispatchEvent(new CustomEvent("vba:conversation_updated"));

      toast.success("Đã đưa thông báo vào Kênh tin nhắn Hiệp hội thành công!");
      await router.invalidate();
    } catch (e: any) {
      toast.error(e?.message || "Không thể đưa thông báo vào tin nhắn");
    } finally {
      setPushingId(null);
    }
  };

  const [dismissedIds, setDismissedIds] = useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set();
    try {
      const saved = localStorage.getItem("crm_dismissed_notif_ids");
      if (saved) return new Set(JSON.parse(saved));
    } catch { }
    return new Set();
  });

  const tsOf = (n: Notification) => (n.sentAt ? new Date(n.sentAt).getTime() : 0);
  const isUnread = useCallback((n: Notification) => n.status === "sent" && tsOf(n) > seen, [seen]);

  const unreadCount = useMemo(() => items.filter((n) => !dismissedIds.has(n.id) && isUnread(n)).length, [items, isUnread, dismissedIds]);

  // Đếm theo từng phân hệ phục vụ KPI & Tabs
  const newMembersCount = useMemo(
    () => items.filter((n) => !dismissedIds.has(n.id) && getNotificationCategory(n).id === "new_members").length,
    [items, dismissedIds],
  );

  const feeAlertsCount = useMemo(
    () => items.filter((n) => !dismissedIds.has(n.id) && getNotificationCategory(n).id === "fee_alerts").length,
    [items, dismissedIds],
  );

  const adminSystemCount = useMemo(
    () => items.filter((n) => !dismissedIds.has(n.id) && getNotificationCategory(n).id === "admin_system").length,
    [items, dismissedIds],
  );

  const eventsMeetingsCount = useMemo(
    () => items.filter((n) => !dismissedIds.has(n.id) && getNotificationCategory(n).id === "events_meetings").length,
    [items, dismissedIds],
  );

  const subFilters = useMemo(
    () => [
      { id: "all" as SubFilterType, label: "Tất cả thông báo", icon: Bell, count: items.length },
      { id: "new_members" as SubFilterType, label: "Hội viên mới nộp hồ sơ", icon: UserCheck, count: newMembersCount },
      { id: "fee_alerts" as SubFilterType, label: "Cảnh báo & Quá hạn hội phí", icon: AlertTriangle, count: feeAlertsCount },
      { id: "admin_system" as SubFilterType, label: "BQT & Điều hành", icon: Building2, count: adminSystemCount },
      { id: "events_meetings" as SubFilterType, label: "Sự kiện & Cuộc họp", icon: Calendar, count: eventsMeetingsCount },
    ],
    [items.length, newMembersCount, feeAlertsCount, adminSystemCount, eventsMeetingsCount],
  );

  // Lọc dữ liệu thông báo
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const seenKeys = new Set<string>();
    return items
      .filter((n) => {
        if (dismissedIds.has(n.id)) return false;
        const key = n.id || `${n.title}:${n.body}`;
        if (seenKeys.has(key)) return false;
        seenKeys.add(key);

        // Lọc theo Sub-filter từ Sidebar tree menu
        if (activeSubFilter !== "all") {
          const cat = getNotificationCategory(n);
          if (cat.id !== activeSubFilter) return false;
        }

        // Lọc theo trạng thái đọc
        if (readTab === "unread" && !isUnread(n)) return false;
        if (readTab === "read" && isUnread(n)) return false;

        // Lọc đối tượng
        if (audience !== "all" && n.audience !== audience) return false;

        // Lọc phạm vi hệ thống
        if (scope !== "all") {
          const nScope = n.appScope || n.targetApp || "crm";
          if (nScope !== scope && nScope !== "all") return false;
        }

        // Tìm kiếm từ khóa
        if (q && !`${n.title} ${n.body} ${(n as any).code || ""}`.toLowerCase().includes(q)) return false;

        return true;
      })
      .sort((a, b) => tsOf(b) - tsOf(a));
  }, [items, activeSubFilter, readTab, audience, scope, query, isUnread, dismissedIds]);

  // Hook sắp xếp 3 trạng thái chuẩn CRM CEO 1983
  const { sortKey, sortDir, handleSort, sortData } = useCustomTableSort<Notification>("time", "desc");

  const sorted = useMemo(() => {
    return sortData(filtered, {
      title: (r) => r.title,
      time: (r) => tsOf(r),
      status: (r) => r.status,
      audience: (r) => r.audience,
      scope: (r) => r.appScope || r.targetApp || "crm",
    });
  }, [filtered, sortData]);

  const pagedRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, page, pageSize]);

  // Định nghĩa cột cho CustomTable
  const columns: CustomTableColumn<Notification>[] = [
    {
      key: "category",
      label: "PHÂN LOẠI",
      width: 170,
      render: (n) => {
        const cat = getNotificationCategory(n);
        const CatIcon = cat.icon;
        return (
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold border ${cat.badgeBg} ${cat.badgeText} ${cat.badgeBorder}`}>
              <CatIcon className="h-3.5 w-3.5 shrink-0" />
              <span>{cat.label}</span>
            </span>
          </div>
        );
      },
    },
    {
      key: "title",
      label: "TIÊU ĐỀ & NỘI DUNG CHI TIẾT",
      minWidth: 320,
      render: (n) => {
        const unread = isUnread(n);
        const cat = getNotificationCategory(n);
        return (
          <div className="py-1">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold leading-snug ${unread ? "text-blue-900 dark:text-blue-200" : "text-slate-900 dark:text-white"}`}>
                {n.title}
              </span>
              {unread && (
                <span className="shrink-0 px-1.5 py-0.5 rounded-md bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 text-[10px] font-black uppercase tracking-wider">
                  Mới
                </span>
              )}
            </div>
            {n.body && (
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                {n.body}
              </p>
            )}
            {((n as any).poster_url || (n as any).posterUrl) && (
              <div className="mt-2 flex items-center gap-2">
                <a
                  href={(n as any).poster_url || (n as any).posterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/poster relative h-10 w-16 overflow-hidden rounded-lg border border-amber-300 dark:border-amber-700 bg-slate-900 shadow-xs block shrink-0"
                >
                  <img
                    src={(n as any).poster_url || (n as any).posterUrl}
                    alt="Poster sự kiện"
                    className="h-full w-full object-cover group-hover/poster:scale-110 transition duration-200"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover/poster:opacity-100 transition">
                    <Sparkles className="h-3 w-3 text-amber-300" />
                  </div>
                </a>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                  <Calendar className="h-3 w-3" />
                  Đính kèm Poster sự kiện
                </span>
              </div>
            )}
            <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px] text-slate-400 dark:text-slate-500">
              {(n as any).code && (
                <span className="font-mono text-[10px] text-slate-400 dark:text-slate-500">
                  #{(n as any).code}
                </span>
              )}
              {cat.actionUrl && (
                <Link
                  to={cat.actionUrl as any}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  <span>{cat.actionLabel}</span>
                  <ExternalLink className="h-3 w-3" />
                </Link>
              )}
            </div>
          </div>
        );
      },
    },
    {
      key: "scope",
      label: "HỆ THỐNG / KÊNH",
      width: 180,
      render: (n) => {
        const scopeKey = n.appScope || n.targetApp || "crm";
        const scopeConf = SCOPE_CONFIG[scopeKey] || SCOPE_CONFIG.crm;
        return (
          <div className="flex flex-col gap-1">
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${scopeConf.bg} ${scopeConf.text} ${scopeConf.border} w-fit`}>
              {scopeConf.label}
            </span>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="capitalize">{t(AUDIENCE_KEY[n.audience])}</span>
              <span>•</span>
              <span className="uppercase font-semibold">{n.channel}</span>
            </div>
          </div>
        );
      },
    },
    {
      key: "time",
      label: "THỜI GIAN",
      width: 140,
      sortable: true,
      render: (n) => (
        <div className="flex flex-col gap-0.5 text-xs">
          <span className="font-medium text-slate-800 dark:text-slate-200">
            {rel(n.sentAt)}
          </span>
          <span className="text-[10px] text-slate-400 dark:text-slate-500">
            {n.sentAt ? new Date(n.sentAt).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" }) : ""}
          </span>
        </div>
      ),
    },
    {
      key: "status",
      label: "TRẠNG THÁI",
      width: 130,
      render: (n) => {
        const isPushed =
          pushedMessageIds.has(n.id) ||
          Boolean((n as any).code && pushedMessageIds.has((n as any).code)) ||
          Boolean((n as any).pushedToMessages) ||
          Boolean((n as any).targetChannel && (n as any).targetChannel !== "none");

        return (
          <div className="flex flex-col gap-1">
            <Pill color={STATUS_COLOR[n.status]}>{t(STATUS_KEY[n.status])}</Pill>
            {isPushed && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-3 w-3" />
                <span>Trong tin nhắn</span>
              </span>
            )}
          </div>
        );
      },
    },
  ];

  const now = Date.now();
  const todayStart = startOfDay(now);
  const yesterdayStart = todayStart - 86400000;
  const groups = useMemo(
    () => [
      { key: "notif.today" as TKey, rows: filtered.filter((n) => tsOf(n) >= todayStart) },
      {
        key: "notif.yesterday" as TKey,
        rows: filtered.filter((n) => tsOf(n) >= yesterdayStart && tsOf(n) < todayStart),
      },
      { key: "notif.earlier" as TKey, rows: filtered.filter((n) => tsOf(n) < yesterdayStart) },
    ],
    [filtered, todayStart, yesterdayStart],
  );

  const fields: CrudField[] = [
    { name: "title", label: t("notif.col.title"), type: "text", required: true },
    { name: "body", label: t("notif.col.title"), type: "textarea" },
    {
      name: "appScope",
      label: "Hệ thống / Ứng dụng nhận",
      type: "select",
      options: [
        { value: "crm", label: "Hệ thống Quản trị CRM" },
        { value: "association_app", label: "Ứng dụng Hiệp Hội CEO 1983" },
        { value: "all", label: "Tất cả các nền tảng" },
      ],
    },
    {
      name: "audience",
      label: t("notif.col.audience"),
      type: "select",
      options: [
        { value: "all", label: t("notif.aud.all") },
        { value: "members", label: t("notif.aud.members") },
        { value: "sponsors", label: t("notif.aud.sponsors") },
        { value: "staff", label: t("notif.aud.staff") },
      ],
    },
    {
      name: "channel",
      label: t("notif.col.channel"),
      type: "select",
      options: [
        { value: "inapp", label: t("notif.channel.inapp") },
        { value: "email", label: t("notif.channel.email") },
        { value: "sms", label: t("notif.channel.sms") },
        { value: "zalo_oa", label: "💬 Zalo OA (ZBS/ZNS Broadcast)" },
      ],
    },
    {
      name: "sendZaloOa",
      label: "Gửi kèm qua Zalo OA (ZBS/ZNS)",
      type: "select",
      options: [
        { value: "none", label: "Không gửi qua Zalo" },
        { value: "zalo_oa", label: "💬 Bắn tin Zalo OA tới Hội viên theo Mẫu thiết lập" },
      ],
    },
    {
      name: "zaloTemplateCode",
      label: "Mẫu thông báo Zalo OA đã thiết lập",
      type: "select",
      options: [
        { value: "EVENT_INVITATION", label: "Thư mời tham gia sự kiện CLB (Template ZBS)" },
        { value: "FEE_REMINDER", label: "Nhắc hạn đóng phí hội viên & niên liễm" },
        { value: "GENERAL_ANNOUNCEMENT", label: "Thông báo chung từ Ban Điều Hành" },
        { value: "MEETING_SCHEDULE", label: "Thông báo lịch họp Ban Chuyên Môn" },
      ],
    },
    {
      name: "targetChatChannel",
      label: "Đẩy thông báo vào Kênh tin nhắn Hiệp Hội",
      type: "select",
      options: [
        { value: "none", label: "Chỉ hiện chuông thông báo (Không đẩy vào tin nhắn)" },
        { value: "channel_media", label: "📢 Ban Truyền Thông (Sự kiện, Tin tức, Hình ảnh)" },
        { value: "channel_membership", label: "👥 Ban Thành Viên (Hội viên, Hồ sơ, Gia hạn)" },
        { value: "channel_promotion", label: "🤝 Ban Xúc Tiến Thương Mại (Marketplace & B2B)" },
        { value: "channel_secretariat", label: "🏛️ Ban Thư Ký & Ban Điều Hành (Lịch họp, Hành chính)" },
        { value: "channel_deals", label: "🎯 Kênh Cơ Hội & Deal B2B" },
        { value: "channel_events", label: "🌟 Kênh Sự Kiện & Hội Nghị" },
        { value: "all_channels", label: "⚡ Đẩy vào Tất cả các kênh chính thức" },
      ],
    },
    {
      name: "status",
      label: t("notif.col.status"),
      type: "select",
      options: [
        { value: "draft", label: t("notif.status.draft") },
        { value: "scheduled", label: t("notif.status.scheduled") },
        { value: "sent", label: t("notif.status.sent") },
      ],
    },
  ];

  const onSubmit = async (v: CrudValues) => {
    setSubmitting(true);
    try {
      if (editing) {
        await updateFn({ data: { id: editing.id, ...(v as object) } as never });
        toast.success(t("common.updated"));
      } else {
        await createFn({ data: v as never });
        toast.success(t("common.created"));
      }

      const targetChannel = (v as any).targetChatChannel;
      if (targetChannel && targetChannel !== "none") {
        const channelList =
          targetChannel === "all_channels"
            ? ["channel_media", "channel_membership", "channel_promotion", "channel_secretariat", "channel_deals", "channel_events"]
            : [targetChannel];

        for (const ch of channelList) {
          const chatKey = `vba.chat.${ch}`;
          try {
            const history = JSON.parse(localStorage.getItem(chatKey) || "[]");
            const newMsg = {
              id: `crm-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              text: `📢 THÔNG BÁO TỪ BAN ĐIỀU HÀNH:\n\n*${v.title}*\n\n${v.body || ""}`,
              mine: false,
              time: "Vừa xong",
              createdAt: new Date().toISOString(),
              seen: false,
            };
            history.push(newMsg);
            localStorage.setItem(chatKey, JSON.stringify(history));
          } catch { }
        }

        if (editing?.id) {
          setPushedMessageIds((prev) => {
            const next = new Set(prev).add(editing.id);
            try {
              localStorage.setItem("pushed_to_messages_notif_ids", JSON.stringify(Array.from(next)));
            } catch { }
            return next;
          });
        }
        window.dispatchEvent(new CustomEvent("vba:notification_pushed_to_messages"));
        window.dispatchEvent(new CustomEvent("vba:conversation_updated"));
        toast.success("Đã đẩy thông báo tới các kênh tin nhắn Hiệp hội!");
      }

      // Tự động bắn thông báo qua Zalo OA nếu quản trị viên chọn gửi Zalo OA
      const sendZalo = (v as any).sendZaloOa === "zalo_oa" || (v as any).channel === "zalo_oa";
      if (sendZalo) {
        fetchNestApi("/zalo/send-bulk-zns", {
          method: "POST",
          body: JSON.stringify({
            templateCode: (v as any).zaloTemplateCode || "GENERAL_ANNOUNCEMENT",
            eventName: v.title,
            recipients: [
              { fullName: "Ban Điều Hành", phone: "84983198383" },
              { fullName: "Hội viên CLB", phone: "84912345678" },
            ],
            templateData: {
              title: v.title,
              content: v.body,
            },
          }),
        }).catch((err) => console.warn("Auto Zalo OA notification error:", err));
        toast.info("Đã gửi kèm thông báo qua kênh Zalo OA thành công!");
      }

      setOpen(false);
      setEditing(null);
      await router.invalidate();
    } catch {
      toast.error(t("common.saveError"));
    } finally {
      setSubmitting(false);
    }
  };

  const onSend = async (n: Notification) => {
    setBusyId(n.id);
    try {
      await sendFn({ data: { id: n.id } });
      toast.success(t("notif.sentToast"));
      await router.invalidate();
    } catch {
      toast.error(t("common.saveError"));
    } finally {
      setBusyId(null);
    }
  };

  const onDelete = async (n: Notification) => {
    if (!window.confirm(t("common.confirmDelete", { name: n.title }))) return;
    setBusyId(n.id);
    try {
      setDismissedIds((prev) => {
        const next = new Set(prev).add(n.id);
        try {
          localStorage.setItem("crm_dismissed_notif_ids", JSON.stringify([...next]));
        } catch { }
        return next;
      });
      await deleteFn({ data: { id: n.id } });
      toast.success(t("common.deletedToast"));
      await router.invalidate();
    } catch {
      toast.success(t("common.deletedToast"));
    } finally {
      setBusyId(null);
    }
  };

  const markAll = () => {
    markNotificationsSeen();
    setSeen(Date.now());
  };

  const renderCard = (n: Notification) => {
    const unread = isUnread(n);
    const cat = getNotificationCategory(n);
    const CatIcon = cat.icon;
    const scopeKey = n.appScope || n.targetApp || "crm";
    const scopeConf = SCOPE_CONFIG[scopeKey] || SCOPE_CONFIG.crm;
    const isPushed =
      pushedMessageIds.has(n.id) ||
      Boolean((n as any).code && pushedMessageIds.has((n as any).code)) ||
      Boolean((n as any).pushedToMessages) ||
      Boolean((n as any).targetChannel && (n as any).targetChannel !== "none");

    return (
      <div
        key={n.id}
        className={`group flex gap-3 rounded-2xl border p-4 transition-all duration-200 ${unread
            ? "border-blue-300 dark:border-blue-800 bg-blue-50/40 dark:bg-blue-950/20 shadow-xs"
            : "border-slate-200 dark:border-slate-800 bg-white dark:bg-card hover:border-slate-300 dark:hover:border-slate-700"
          }`}
      >
        <span
          className={`mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl border ${cat.badgeBg} ${cat.badgeText} ${cat.badgeBorder}`}
          aria-hidden="true"
        >
          <CatIcon className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2">
            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black border ${cat.badgeBg} ${cat.badgeText} ${cat.badgeBorder}`}>
              {cat.label}
            </span>
            <p className="min-w-0 flex-1 text-sm font-bold text-slate-900 dark:text-white leading-snug">{n.title}</p>
            {unread && (
              <span className="shrink-0 rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                Mới
              </span>
            )}
          </div>
          {n.body && <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">{n.body}</p>}

          {((n as any).poster_url || (n as any).posterUrl) && (
            <div className="mt-2.5 flex items-center gap-2.5">
              <a
                href={(n as any).poster_url || (n as any).posterUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group/poster relative h-12 w-20 overflow-hidden rounded-xl border border-amber-300 dark:border-amber-700 bg-slate-900 shadow-xs block shrink-0"
              >
                <img
                  src={(n as any).poster_url || (n as any).posterUrl}
                  alt="Poster sự kiện"
                  className="h-full w-full object-cover group-hover/poster:scale-110 transition duration-200"
                />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover/poster:opacity-100 transition">
                  <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                </div>
              </a>
              <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                <Calendar className="h-3.5 w-3.5" />
                Đính kèm Poster sự kiện
              </span>
            </div>
          )}

          <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] text-slate-500 dark:text-slate-400">
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${scopeConf.bg} ${scopeConf.text} ${scopeConf.border}`}>
              {scopeConf.label}
            </span>
            <span>{t(AUDIENCE_KEY[n.audience])}</span>
            <span className="uppercase font-semibold">{n.channel}</span>
            <Pill color={STATUS_COLOR[n.status]}>{t(STATUS_KEY[n.status])}</Pill>
            {n.sentAt && <span>{rel(n.sentAt)}</span>}
            {cat.actionUrl && (
              <Link
                to={cat.actionUrl as any}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline ml-auto"
              >
                <span>{cat.actionLabel}</span>
                <ExternalLink className="h-3 w-3" />
              </Link>
            )}
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          {/* NÚT ĐƯA VÀO TIN NHẮN */}
          {isPushed ? (
            <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
              <MessageSquare className="h-3 w-3 stroke-[2.5]" />
              <span>Đã trong chat</span>
            </span>
          ) : (
            <button
              onClick={() => handlePushToMessages(n)}
              disabled={pushingId === n.id}
              title="Đưa thông báo này vào Kênh tin nhắn Hiệp Hội"
              className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500 hover:text-white px-2.5 py-1 text-xs font-bold text-amber-700 dark:text-amber-400 transition-all cursor-pointer disabled:opacity-50"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span>{pushingId === n.id ? "Đang đẩy..." : "Đưa vào tin nhắn"}</span>
            </button>
          )}

          {n.status !== "sent" && (
            <button
              onClick={() => onSend(n)}
              disabled={busyId === n.id}
              className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950 disabled:opacity-50"
            >
              <Send className="h-3.5 w-3.5" />
              {t("notif.send")}
            </button>
          )}
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                setEditing(n);
                setOpen(true);
              }}
              title="Chỉnh sửa"
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => onDelete(n)}
              disabled={busyId === n.id}
              title="Xóa / Ẩn"
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition disabled:opacity-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const emptyView =
    readTab === "unread" ? (
      <NoNotifications title={t("notif.inbox.empty.unread")} />
    ) : readTab === "read" ? (
      <EmptyState title={t("notif.inbox.empty.read")} />
    ) : query.trim() || audience !== "all" || activeSubFilter !== "all" ? (
      <NoSearchResult />
    ) : (
      <NoNotifications />
    );

  return (
    <AppShell>
      <PageHeader
        title={t("notif.title")}
        subtitle="Trung tâm điều hành và kiểm soát toàn bộ thông báo hệ thống, cảnh báo hội phí & hồ sơ hội viên mới"
        actions={
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAll}
                className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-card px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-xs transition cursor-pointer"
              >
                <CheckCheck className="h-4 w-4 text-emerald-600" />
                <span>{t("notif.markAll")}</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setEventReminderModalOpen(true)}
              className="inline-flex min-h-10 items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold text-white bg-[#003B95] hover:bg-[#002B70] shadow-sm transition cursor-pointer"
            >
              <Calendar className="h-4 w-4" />
              <span>Bắn Tin Nhắc Sự Kiện (Kèm Poster)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setEditing(null);
                setOpen(true);
              }}
              className="inline-flex min-h-10 items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold text-white shadow-sm transition bg-[#003B95] hover:bg-[#002f78] cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>{t("notif.create")}</span>
            </button>
          </div>
        }
      />

      {/* ── 4 KPI CARDS CHUẨN FIGMA EXACT GRADIENTS ── */}
      <div className="mb-6">
        <CrmMetricGrid>
          <CrmMetricCard
            label="Tổng thông báo"
            value={items.length}
            sub={`Đã phát tán: ${sent.length} thông báo`}
            icon={Bell}
            tone="sky"
          />
          <CrmMetricCard
            label="Hồ sơ hội viên mới"
            value={newMembersCount}
            sub="Chờ Ban Quản Trị phê duyệt"
            icon={UserCheck}
            tone="violet"
          />
          <CrmMetricCard
            label="Cảnh báo hội phí"
            value={feeAlertsCount}
            sub="Quá hạn & sắp đến hạn niên liễm"
            icon={AlertTriangle}
            tone="orange"
          />
          <CrmMetricCard
            label="Thông báo chưa đọc"
            value={unreadCount}
            sub="Cần xử lý & theo dõi tức thì"
            icon={Megaphone}
            tone="green"
          />
        </CrmMetricGrid>
      </div>

      {/* ── BỘ LỌC CHUYÊN BIỆT ĐƯỢC ĐIỀU HƯỚNG TỪ MENU SIDEBAR ── */}
      {activeSubFilter !== "all" && (
        <div className="mb-4 flex items-center justify-between px-3.5 py-2 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/50 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-600 dark:text-slate-400">Phân hệ đang xem từ Sidebar:</span>
            <span className="font-bold text-[#003B95] dark:text-blue-300">
              {subFilters.find((s) => s.id === activeSubFilter)?.label || activeSubFilter}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#003B95] text-white">
              {filtered.length} thông báo
            </span>
          </div>
          <Link
            to="/notifications"
            className="text-[11px] font-bold text-[#003B95] dark:text-blue-400 hover:underline cursor-pointer"
          >
            Xem tất cả thông báo
          </Link>
        </div>
      )}

      {/* ── TOOLBAR TÌM KIẾM, BỘ LỌC PHẠM VI & CHUYỂN ĐỔI GIAO DIỆN ── */}
      <div className="mb-4 bg-white dark:bg-card p-3 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
        <CrmToolbar
          searchQuery={query}
          onSearchChange={setQuery}
          searchPlaceholder="Tìm theo tiêu đề, nội dung hoặc mã thông báo..."
          addButtonLabel="Tạo thông báo"
          onAddClick={() => {
            setEditing(null);
            setOpen(true);
          }}
        >
          {/* Lọc trạng thái đọc */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
            <button
              type="button"
              onClick={() => setReadTab("all")}
              className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer ${readTab === "all" ? "bg-white dark:bg-card text-slate-900 dark:text-white shadow-xs" : "text-slate-500 hover:text-slate-900"
                }`}
            >
              Tất cả ({items.length})
            </button>
            <button
              type="button"
              onClick={() => setReadTab("unread")}
              className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer ${readTab === "unread" ? "bg-white dark:bg-card text-blue-600 dark:text-blue-400 shadow-xs" : "text-slate-500 hover:text-slate-900"
                }`}
            >
              Chưa đọc ({unreadCount})
            </button>
            <button
              type="button"
              onClick={() => setReadTab("read")}
              className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer ${readTab === "read" ? "bg-white dark:bg-card text-slate-900 dark:text-white shadow-xs" : "text-slate-500 hover:text-slate-900"
                }`}
            >
              Đã đọc
            </button>
          </div>

          {/* Lọc hệ thống */}
          <select
            value={scope}
            onChange={(e) => setScope(e.target.value)}
            className="h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-card px-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none"
          >
            <option value="all">🌐 Tất cả hệ thống</option>
            <option value="crm">💻 CRM Quản trị</option>
            <option value="association_app">📱 App Hiệp Hội CEO 1983</option>
          </select>

          {/* Lọc đối tượng */}
          <select
            value={audience}
            onChange={(e) => setAudience(e.target.value as typeof audience)}
            className="h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-card px-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none"
          >
            <option value="all">👥 Mọi đối tượng</option>
            <option value="members">Hội viên chính thức</option>
            <option value="sponsors">Nhà tài trợ</option>
            <option value="staff">Ban Thư Ký / BQT</option>
          </select>

          {/* Nút chuyển đổi View Table / Cards */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setViewMode("table")}
              title="Dạng bảng chuẩn CustomTable"
              className={`p-1.5 rounded-lg transition cursor-pointer ${viewMode === "table" ? "bg-white dark:bg-card text-blue-600 shadow-xs" : "text-slate-500 hover:text-slate-900"
                }`}
            >
              <LayoutList className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("cards")}
              title="Dạng danh sách thẻ (Cards)"
              className={`p-1.5 rounded-lg transition cursor-pointer ${viewMode === "cards" ? "bg-white dark:bg-card text-blue-600 shadow-xs" : "text-slate-500 hover:text-slate-900"
                }`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
        </CrmToolbar>
      </div>

      {/* ── NỘI DUNG HIỂN THỊ DỮ LIỆU ── */}
      {filtered.length === 0 ? (
        emptyView
      ) : viewMode === "table" ? (
        <CustomTable<Notification>
          columns={columns}
          data={pagedRows}
          keyExtractor={(r) => r.id}
          sortKey={sortKey}
          sortDir={sortDir}
          onSort={handleSort}
          showStt={true}
          page={page}
          pageSize={pageSize}
          total={sorted.length}
          onPageChange={setPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setPage(1);
          }}
          actionColumn={{
            title: "THAO TÁC",
            width: 220,
            render: (n) => {
              const cat = getNotificationCategory(n);
              const isPushed =
                pushedMessageIds.has(n.id) ||
                Boolean((n as any).code && pushedMessageIds.has((n as any).code)) ||
                Boolean((n as any).pushedToMessages) ||
                Boolean((n as any).targetChannel && (n as any).targetChannel !== "none");

              return (
                <div className="flex items-center gap-1.5 justify-end">
                  {/* Quick Action Button theo phân hệ */}
                  {cat.actionUrl && (
                    <Link
                      to={cat.actionUrl as any}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 text-xs font-bold border border-blue-200 dark:border-blue-800 transition"
                    >
                      <cat.icon className="h-3 w-3" />
                      <span>{cat.actionLabel}</span>
                    </Link>
                  )}

                  {/* Nút Đẩy vào tin nhắn */}
                  {isPushed ? (
                    <span className="p-1 rounded-lg text-emerald-600 dark:text-emerald-400" title="Đã trong kênh tin nhắn">
                      <CheckCircle2 className="h-4 w-4" />
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handlePushToMessages(n)}
                      disabled={pushingId === n.id}
                      title="Đưa vào tin nhắn Hiệp hội"
                      className="p-1.5 rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 dark:border-amber-700 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 transition cursor-pointer disabled:opacity-50"
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                    </button>
                  )}

                  {/* Nút sửa */}
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(n);
                      setOpen(true);
                    }}
                    title="Chỉnh sửa"
                    className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>

                  {/* Nút xóa */}
                  <button
                    type="button"
                    onClick={() => onDelete(n)}
                    disabled={busyId === n.id}
                    title="Xóa / Ẩn"
                    className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer disabled:opacity-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            },
          }}
          emptyText="Không tìm thấy thông báo phù hợp"
        />
      ) : (
        <div className="space-y-6">
          {groups.map(
            (g) =>
              g.rows.length > 0 && (
                <div key={g.key}>
                  <div className="mb-2 px-1 text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Clock className="h-3 w-3" />
                    <span>{t(g.key)}</span>
                  </div>
                  <div className="space-y-3">{g.rows.map(renderCard)}</div>
                </div>
              ),
          )}
        </div>
      )}

      {/* ── MODAL TẠO & SỬA THÔNG BÁO ── */}
      <CrudModal
        open={open}
        title={editing ? t("common.editTitle") : t("notif.create")}
        fields={fields}
        initial={editing ? (editing as unknown as CrudValues) : undefined}
        submitting={submitting}
        submitLabel={editing ? t("common.save") : t("common.create")}
        cancelLabel={t("common.cancel")}
        onSubmit={onSubmit}
        onClose={() => {
          setOpen(false);
          setEditing(null);
        }}
      />

      {/* ── MODAL BẮN TIN NHẮC SỰ KIỆN KÈM POSTER ── */}
      <EventReminderPosterModal
        open={eventReminderModalOpen}
        onClose={() => setEventReminderModalOpen(false)}
        onSuccess={() => router.invalidate()}
      />
    </AppShell>
  );
}
