import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  ReceiptText,
  CalendarDays,
  Activity,
  CheckCircle2,
  Clock,
  Handshake,
  User,
  Building2,
  Briefcase,
  MessageSquare,
  Check,
  X,
  ArrowRight,
  QrCode,
  Search,
  Eye,
  Download,
  ShieldCheck,
  MapPin,
  Sparkles,
  ChevronRight,
  ExternalLink,
  CreditCard,
  Wallet,
  Tag,
  Share2,
} from "lucide-react";
import { MemberHeader } from "@/components/member/MemberShell";
import { useServerData } from "@/hooks/use-server-data";
import { getMyHistory, type MyHistory } from "@/lib/member-app.functions";
import { useT } from "@/lib/i18n";
import { resolveMediaUrl } from "@/lib/api-client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/association/history")({
  component: HistoryScreen,
});

const EMPTY: MyHistory = { activities: [], payments: [], events: [] };

function fmtVND(n: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(n);
}

function fmtDate(iso?: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function fmtTime(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
}

type Tab = "connections" | "events" | "activity";

function HistoryScreen() {
  const t = useT();
  const navigate = useNavigate();
  const fetchHistory = useServerFn(getMyHistory);
  const { data, loading, reload } = useServerData<MyHistory>(() => fetchHistory(), EMPTY);
  const [tab, setTab] = useState<Tab>("connections");

  // Sub-filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [connectionFilter, setConnectionFilter] = useState<"all" | "accepted" | "pending">("all");
  const [eventFilter, setEventFilter] = useState<"all" | "upcoming" | "checkedIn">("all");
  const [activityFilter, setActivityFilter] = useState<string>("all");

  // Modals state
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);

  // 1. Connection List State - Only populated when user sends connection requests
  const [connectionList, setConnectionList] = useState<any[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem("vba_sent_connection_requests");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
      return [];
    } catch {
      return [];
    }
  });

  // 2. Local Registered Events State - Only populated when user registers for events
  const [localEvents, setLocalEvents] = useState<any[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem("vba_registered_event_records");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
      return [];
    } catch {
      return [];
    }
  });

  // 3. Local Activities State - Only populated by real member actions
  const [localActivities, setLocalActivities] = useState<any[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem("vba_recent_activities");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
      return [];
    } catch {
      return [];
    }
  });

  // Listen to cross-component sync events
  useEffect(() => {
    const handleSync = () => {
      try {
        const storedConn = localStorage.getItem("vba_sent_connection_requests");
        if (storedConn) {
          const parsed = JSON.parse(storedConn);
          if (Array.isArray(parsed)) setConnectionList(parsed);
        } else {
          setConnectionList([]);
        }

        const storedEvents = localStorage.getItem("vba_registered_event_records");
        if (storedEvents) {
          const parsed = JSON.parse(storedEvents);
          if (Array.isArray(parsed)) setLocalEvents(parsed);
        } else {
          setLocalEvents([]);
        }

        const storedAct = localStorage.getItem("vba_recent_activities");
        if (storedAct) {
          const parsed = JSON.parse(storedAct);
          if (Array.isArray(parsed)) setLocalActivities(parsed);
        } else {
          setLocalActivities([]);
        }
      } catch {}
    };

    window.addEventListener("vba.connection.changed", handleSync);
    window.addEventListener("vba.events.changed", handleSync);
    window.addEventListener("vba.history.changed", handleSync);
    window.addEventListener("storage", handleSync);

    return () => {
      window.removeEventListener("vba.connection.changed", handleSync);
      window.removeEventListener("vba.events.changed", handleSync);
      window.removeEventListener("vba.history.changed", handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, []);

  // Cancel connection handler
  const handleCancelRequest = (id: string, targetName: string) => {
    try {
      const updated = connectionList.filter((c) => c.id !== id);
      setConnectionList(updated);
      localStorage.setItem("vba_sent_connection_requests", JSON.stringify(updated));
      window.dispatchEvent(new Event("vba.connection.changed"));
      toast.success(`Đã hủy yêu cầu kết nối tới ${targetName}`);
    } catch {}
  };

  // COMBINED DATA CALCULATIONS
  // 1. All Connections
  const allConnections = useMemo(() => {
    return connectionList;
  }, [connectionList]);

  const filteredConnections = useMemo(() => {
    return allConnections.filter((item) => {
      if (connectionFilter === "accepted" && item.status !== "accepted") return false;
      if (connectionFilter === "pending" && item.status !== "pending") return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const n = (item.targetName || "").toLowerCase();
        const c = (item.targetCompany || "").toLowerCase();
        const p = (item.purpose || "").toLowerCase();
        return n.includes(q) || c.includes(q) || p.includes(q);
      }
      return true;
    });
  }, [allConnections, connectionFilter, searchQuery]);

  // 2. All Events
  const allEvents = useMemo(() => {
    const list: any[] = [];
    const seenEventNames = new Set<string>();

    // From local storage registered events
    for (const r of localEvents) {
      const nameKey = (r.name || "").trim().toLowerCase();
      if (!seenEventNames.has(nameKey)) {
        seenEventNames.add(nameKey);
        list.push({
          id: r.id || r.ticketCode,
          name: r.name,
          date: r.date,
          place: r.place || "Hà Nội",
          checkedIn: Boolean(r.checkedIn),
          ticketCode: r.ticketCode || "EV-VIP-01",
          luckyNumber: r.luckyNumber || "#1983",
          ticketType: r.ticketType || "Hội viên chính thức",
          seat: r.seat || "Khu vực Hội viên",
          image: r.image || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80",
          qrCodeUrl: r.qrCodeUrl,
        });
      }
    }

    // From server
    if (data?.events && data.events.length > 0) {
      for (const e of data.events) {
        const nameKey = (e.name || "").trim().toLowerCase();
        if (!seenEventNames.has(nameKey)) {
          seenEventNames.add(nameKey);
          list.push({
            id: e.id,
            name: e.name,
            date: e.date,
            place: (e as any).place || "Hà Nội",
            checkedIn: Boolean(e.checkedIn),
            ticketCode: `EV-${e.id.slice(0, 6).toUpperCase()}`,
            luckyNumber: `#${Math.floor(1000 + Math.random() * 9000)}`,
            ticketType: "Standard Pass",
            seat: "Khu vực Hội trường",
            image: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80",
          });
        }
      }
    }

    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [localEvents, data?.events]);

  const filteredEvents = useMemo(() => {
    return allEvents.filter((e) => {
      if (eventFilter === "checkedIn" && !e.checkedIn) return false;
      if (eventFilter === "upcoming" && e.checkedIn) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const n = (e.name || "").toLowerCase();
        const p = (e.place || "").toLowerCase();
        const code = (e.ticketCode || "").toLowerCase();
        return n.includes(q) || p.includes(q) || code.includes(q);
      }
      return true;
    });
  }, [allEvents, eventFilter, searchQuery]);

  // 4. All Activities
  const allActivities = useMemo(() => {
    const list: any[] = [];
    const seenTitles = new Set<string>();

    // From local activities
    for (const a of localActivities) {
      if (!seenTitles.has(a.title)) {
        seenTitles.add(a.title);
        list.push(a);
      }
    }

    // From server
    if (data?.activities && data.activities.length > 0) {
      for (const s of data.activities) {
        if (!seenTitles.has(s.title)) {
          seenTitles.add(s.title);
          list.push(s);
        }
      }
    }

    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [localActivities, data?.activities]);

  const filteredActivities = useMemo(() => {
    return allActivities.filter((a) => {
      if (activityFilter !== "all") {
        const cat = (a.category || a.type || "").toLowerCase();
        if (!cat.includes(activityFilter.toLowerCase())) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const t = (a.title || "").toLowerCase();
        const d = (a.detail || "").toLowerCase();
        return t.includes(q) || d.includes(q);
      }
      return true;
    });
  }, [allActivities, activityFilter, searchQuery]);

  const tabs: { key: Tab; label: string; icon: any; count: number }[] = [
    {
      key: "connections",
      label: "Kết nối",
      icon: Handshake as any,
      count: allConnections.length,
    },
    {
      key: "events",
      label: t("m.history.tabEvents") || "Sự kiện",
      icon: CalendarDays,
      count: allEvents.length,
    },
    {
      key: "activity",
      label: t("m.history.tabActivity") || "Hoạt động",
      icon: Activity,
      count: allActivities.length,
    },
  ];

  return (
    <div className="vba-animate pb-24 min-h-screen bg-slate-50/50 dark:bg-slate-950">
      <MemberHeader
        title={t("m.history.title") || "Lịch sử & Giao dịch"}
        subtitle={t("m.history.subtitle") || "Theo dõi kết nối, vé sự kiện & hoạt động"}
        back
      />

      {/* 1. Category Tabs */}
      <div className="flex gap-2 px-4 pt-3 overflow-x-auto no-scrollbar">
        {tabs.map((tb) => {
          const Icon = tb.icon;
          const active = tab === tb.key;
          return (
            <button
              key={tb.key}
              onClick={() => {
                setTab(tb.key);
                setSearchQuery("");
              }}
              className={`flex shrink-0 items-center justify-center gap-1.5 rounded-xl border px-3.5 py-2 text-[12.5px] font-semibold transition outline-none focus:outline-none cursor-pointer ${
                active
                  ? "border-[#001B54] bg-[#001B54] text-white shadow-sm font-bold"
                  : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300"
              }`}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{tb.label}</span>
              <span className={`text-[10.5px] ${active ? "text-white/80" : "text-slate-400"}`}>
                ({tb.count})
              </span>
            </button>
          );
        })}
      </div>

      {/* 2. Quick Search & Filter Chips Bar */}
      <div className="px-4 mt-3 space-y-2.5">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              tab === "connections"
                ? "Tìm theo tên đối tác, công ty..."
                : tab === "events"
                  ? "Tìm tên sự kiện, mã vé, địa điểm..."
                  : "Tìm nội dung hoạt động..."
            }
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#001B54] transition shadow-2xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Sub-filters for Category */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-[11px] font-medium">
          {tab === "connections" && (
            <>
              <button
                type="button"
                onClick={() => setConnectionFilter("all")}
                className={`px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                  connectionFilter === "all"
                    ? "bg-[#001B54] text-white border-[#001B54] font-bold"
                    : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800"
                }`}
              >
                Tất cả ({allConnections.length})
              </button>
              <button
                type="button"
                onClick={() => setConnectionFilter("accepted")}
                className={`px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                  connectionFilter === "accepted"
                    ? "bg-[#001B54] text-white border-[#001B54] font-bold"
                    : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800"
                }`}
              >
                Đã kết nối ({allConnections.filter((c) => c.status === "accepted").length})
              </button>
              <button
                type="button"
                onClick={() => setConnectionFilter("pending")}
                className={`px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                  connectionFilter === "pending"
                    ? "bg-[#001B54] text-white border-[#001B54] font-bold"
                    : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800"
                }`}
              >
                Đang chờ ({allConnections.filter((c) => c.status === "pending").length})
              </button>
            </>
          )}

          {tab === "events" && (
            <>
              <button
                type="button"
                onClick={() => setEventFilter("all")}
                className={`px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                  eventFilter === "all"
                    ? "bg-[#001B54] text-white border-[#001B54] font-bold"
                    : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800"
                }`}
              >
                Tất cả ({allEvents.length})
              </button>
              <button
                type="button"
                onClick={() => setEventFilter("upcoming")}
                className={`px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                  eventFilter === "upcoming"
                    ? "bg-[#001B54] text-white border-[#001B54] font-bold"
                    : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800"
                }`}
              >
                Sắp diễn ra ({allEvents.filter((e) => !e.checkedIn).length})
              </button>
              <button
                type="button"
                onClick={() => setEventFilter("checkedIn")}
                className={`px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                  eventFilter === "checkedIn"
                    ? "bg-[#001B54] text-white border-[#001B54] font-bold"
                    : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800"
                }`}
              >
                Đã tham gia ({allEvents.filter((e) => e.checkedIn).length})
              </button>
            </>
          )}

          {tab === "activity" && (
            <>
              <button
                type="button"
                onClick={() => setActivityFilter("all")}
                className={`px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                  activityFilter === "all"
                    ? "bg-[#001B54] text-white border-[#001B54] font-bold"
                    : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800"
                }`}
              >
                Tất cả ({allActivities.length})
              </button>
              <button
                type="button"
                onClick={() => setActivityFilter("kết nối")}
                className={`px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                  activityFilter === "kết nối"
                    ? "bg-[#001B54] text-white border-[#001B54] font-bold"
                    : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800"
                }`}
              >
                Kết nối
              </button>
              <button
                type="button"
                onClick={() => setActivityFilter("sự kiện")}
                className={`px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                  activityFilter === "sự kiện"
                    ? "bg-[#001B54] text-white border-[#001B54] font-bold"
                    : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800"
                }`}
              >
                Sự kiện
              </button>
            </>
          )}
        </div>
      </div>

      {/* 3. Content List */}
      <div className="mt-3 space-y-3 px-4">
        {/* ================= TAB 1: KẾT NỐI ================= */}
        {tab === "connections" && (
          filteredConnections.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center space-y-3 shadow-xs">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-[#001B54] dark:text-blue-400 mx-auto">
                <Handshake className="h-6 w-6" />
              </div>
              <h4 className="text-[14px] font-bold text-slate-900 dark:text-white">
                Không tìm thấy kết nối nào
              </h4>
              <p className="text-[12px] text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                {searchQuery
                  ? "Không có kết quả phù hợp với từ khóa tìm kiếm của bạn."
                  : "Khi bạn gửi lời mời hẹn gặp & giao thương tới các hội viên, lịch sử chi tiết sẽ được ghi nhận tại đây."}
              </p>
              <button
                type="button"
                onClick={() => navigate({ to: "/association/members" })}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#001B54] hover:bg-[#002B70] text-white px-4 py-2 text-[12px] font-bold transition shadow-xs active:scale-95 cursor-pointer"
              >
                <span>Khám phá danh bạ hội viên</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            filteredConnections.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-slate-200/90 dark:border-slate-800 p-3.5 bg-white dark:bg-slate-900 shadow-xs space-y-2.5 transition hover:border-[#001B54]/40"
              >
                <div className="flex items-start gap-3">
                  <div className="relative shrink-0">
                    {item.targetAvatar ? (
                      <img
                        src={resolveMediaUrl(item.targetAvatar) || item.targetAvatar}
                        alt={item.targetName}
                        className="h-11 w-11 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
                        onError={(e) => {
                          e.currentTarget.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80";
                        }}
                      />
                    ) : (
                      <div className="grid h-11 w-11 place-items-center rounded-xl bg-[#001B54] text-white font-bold text-sm">
                        <User className="h-5 w-5" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[13px] font-bold text-slate-900 dark:text-white truncate">
                          {item.targetName || "Hội viên CEO 1983"}
                        </span>
                        {item.targetCode && (
                          <span className="rounded-md bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900/50 px-1.5 py-0.5 text-[9px] font-bold text-[#001B54] dark:text-blue-300">
                            {item.targetCode}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">
                        {fmtDate(item.createdAt)}
                      </span>
                    </div>

                    <p className="text-[11.5px] text-slate-600 dark:text-slate-300 flex items-center gap-1 mt-0.5 truncate">
                      <Building2 className="h-3 w-3 text-[#001B54] dark:text-blue-400 shrink-0" />
                      <span>{item.targetCompany || "CLB Doanh Nhân CEO 1983"}</span>
                    </p>

                    {item.targetTitle && (
                      <p className="text-[10.5px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                        {item.targetTitle}
                      </p>
                    )}

                    {item.opportunityTitle && (
                      <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 dark:bg-blue-950/40 text-[#001B54] dark:text-blue-300 border border-blue-100 dark:border-blue-900/40">
                        <Briefcase className="h-3 w-3 text-[#001B54] dark:text-blue-400 shrink-0" />
                        <span className="truncate max-w-[240px]">Cơ hội: {item.opportunityTitle}</span>
                      </div>
                    )}

                    {item.purpose && (
                      <div className="mt-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed">
                        <span className="font-bold text-[#001B54] dark:text-blue-300 mr-1">Đề xuất:</span>
                        <span>"{item.purpose}"</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Status & Actions */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <div>
                    {item.status === "pending" && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300">
                        <Clock className="h-3 w-3 animate-pulse" />
                        <span>Đang chờ phản hồi</span>
                      </span>
                    )}
                    {item.status === "accepted" && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                        <Check className="h-3 w-3" />
                        <span>Đã kết nối thành công</span>
                      </span>
                    )}
                    {item.status === "rejected" && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300">
                        <X className="h-3 w-3" />
                        <span>Đã từ chối</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {item.targetCode && (
                      <button
                        type="button"
                        onClick={() =>
                          navigate({
                            to: "/association/messages",
                            search: { peerCode: item.targetCode, peerName: item.targetName },
                          })
                        }
                        className="inline-flex items-center gap-1 rounded-xl bg-[#001B54] hover:bg-[#002B70] text-white px-2.5 py-1 text-[11px] font-bold transition cursor-pointer shadow-2xs"
                      >
                        <MessageSquare className="h-3 w-3" />
                        <span>Nhắn tin</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => navigate({ to: "/association/members" })}
                      className="inline-flex items-center gap-1 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-2.5 py-1 text-[11px] font-bold transition cursor-pointer"
                    >
                      <User className="h-3 w-3" />
                      <span>Hồ sơ</span>
                    </button>
                    {item.status === "pending" && (
                      <button
                        type="button"
                        onClick={() => handleCancelRequest(item.id, item.targetName)}
                        className="inline-flex items-center gap-1 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 px-2 py-1 text-[10.5px] font-bold transition active:scale-95 cursor-pointer"
                      >
                        <X className="h-3 w-3" />
                        <span>Hủy</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )
        )}

        {/* ================= TAB 2: SỰ KIỆN (EVENTS) ================= */}
        {tab === "events" && (
          filteredEvents.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center space-y-3 shadow-xs">
              <CalendarDays className="h-8 w-8 mx-auto text-slate-300 dark:text-slate-600" />
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Bạn chưa có vé sự kiện nào trong danh sách
              </p>
              <button
                type="button"
                onClick={() => navigate({ to: "/association/events" })}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#001B54] hover:bg-[#002B70] text-white px-4 py-2 text-[12px] font-bold transition cursor-pointer shadow-xs"
              >
                <span>Xem danh sách sự kiện CLB</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            filteredEvents.map((e) => (
              <div
                key={e.id}
                className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs hover:border-[#001B54]/40 transition flex flex-col sm:flex-row"
              >
                <div className="relative h-28 sm:h-auto sm:w-36 shrink-0 overflow-hidden bg-slate-900">
                  <img
                    src={e.image}
                    alt={e.name}
                    className="w-full h-full object-cover select-none pointer-events-none"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <span
                    className={`absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9.5px] font-bold text-white backdrop-blur-md border border-white/20 ${
                      e.checkedIn ? "bg-emerald-600/80" : "bg-[#001B54]/80"
                    }`}
                  >
                    {e.checkedIn ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                    <span>{e.checkedIn ? "Đã check-in" : "Chờ tham gia"}</span>
                  </span>
                </div>

                <div className="p-3.5 flex-1 flex flex-col justify-between gap-2">
                  <div>
                    <h4 className="text-[13px] font-bold text-slate-900 dark:text-white leading-snug line-clamp-2">
                      {e.name}
                    </h4>

                    <div className="mt-1.5 flex flex-col gap-1 text-[11px] text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-1">
                        <CalendarDays className="h-3 w-3 text-[#001B54] dark:text-blue-400 shrink-0" />
                        <span>{fmtDate(e.date)} · {fmtTime(e.date) || "08:00"}</span>
                      </div>
                      <div className="flex items-center gap-1 truncate">
                        <MapPin className="h-3 w-3 text-[#001B54] dark:text-blue-400 shrink-0" />
                        <span className="truncate">{e.place || "Hà Nội"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">
                      <span className="font-bold text-slate-700 dark:text-slate-300">Vé: </span>
                      <span>{e.ticketCode}</span>
                      {e.luckyNumber && (
                        <span className="ml-1 text-[#001B54] dark:text-blue-300 font-bold">({e.luckyNumber})</span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setSelectedTicket(e)}
                        className="inline-flex items-center gap-1 rounded-xl bg-[#001B54] hover:bg-[#002B70] text-white px-2.5 py-1 text-[11px] font-bold transition cursor-pointer shadow-2xs"
                      >
                        <QrCode className="h-3 w-3" />
                        <span>Xem vé QR</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate({ to: "/association/events" })}
                        className="inline-flex items-center gap-1 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-2 py-1 text-[11px] font-bold transition cursor-pointer"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )
        )}

        {/* ================= TAB 4: HOẠT ĐỘNG (ACTIVITY TIMELINE) ================= */}
        {tab === "activity" && (
          filteredActivities.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center space-y-2">
              <Activity className="h-8 w-8 mx-auto text-slate-300 dark:text-slate-600" />
              <p className="text-xs text-slate-500 dark:text-slate-400">Không có nhật ký hoạt động phù hợp</p>
            </div>
          ) : (
            <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
              {filteredActivities.map((act) => {
                const isEvt = act.type === "event" || (act.category && act.category.includes("Sự kiện"));
                const isPay = act.type === "payment" || (act.category && act.category.includes("Đóng phí"));
                const isConn = act.type === "connection" || (act.category && act.category.includes("Kết nối"));

                return (
                  <div key={act.id} className="relative">
                    <div className="absolute -left-6 top-1.5 grid h-5 w-5 place-items-center rounded-full bg-white dark:bg-slate-900 border-2 border-[#001B54] dark:border-blue-400">
                      <div className="h-1.5 w-1.5 rounded-full bg-[#001B54] dark:bg-blue-400" />
                    </div>

                    <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 shadow-xs">
                      <div className="flex items-center justify-between gap-1 text-[10.5px]">
                        <span className="font-bold text-[#001B54] dark:text-blue-300 uppercase tracking-wide">
                          {act.category || (isEvt ? "Sự kiện" : isPay ? "Đóng phí" : isConn ? "Kết nối" : "Hệ thống")}
                        </span>
                        <span className="text-slate-400">{fmtDate(act.date)} {fmtTime(act.date)}</span>
                      </div>
                      <h4 className="text-[12.5px] font-bold text-slate-900 dark:text-white mt-1">
                        {act.title}
                      </h4>
                      {act.detail && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                          {act.detail}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}
      </div>

      {/* ================= DIALOG 1: TICKET QR MODAL ================= */}
      {selectedTicket && (
        <Dialog open={Boolean(selectedTicket)} onOpenChange={(open) => !open && setSelectedTicket(null)}>
          <DialogContent className="max-w-sm rounded-3xl p-5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <DialogHeader className="text-center">
              <span className="inline-flex items-center justify-center gap-1 text-[10px] font-black uppercase tracking-wider text-[#001B54] dark:text-blue-300">
                <Sparkles className="h-3 w-3" />
                CLB Doanh Nhân CEO 1983
              </span>
              <DialogTitle className="text-base font-black text-slate-900 dark:text-white mt-1">
                Vé Tham Dự Sự Kiện
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Xuất trình mã QR tại quầy Check-in để nhận thẻ đại biểu
              </DialogDescription>
            </DialogHeader>

            <div className="mt-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 p-4 border border-slate-200/80 dark:border-slate-700/80 text-center space-y-3">
              {/* QR Code */}
              <div className="bg-white p-3 rounded-xl inline-block shadow-xs border border-slate-200">
                <img
                  src={
                    selectedTicket.qrCodeUrl ||
                    `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
                      JSON.stringify({
                        ticketCode: selectedTicket.ticketCode,
                        event: selectedTicket.name,
                        date: selectedTicket.date,
                        luckyNumber: selectedTicket.luckyNumber,
                      })
                    )}`
                  }
                  alt="Ticket QR"
                  className="w-40 h-40 object-contain mx-auto"
                />
              </div>

              <div>
                <div className="text-xs font-black text-[#001B54] dark:text-blue-300">
                  {selectedTicket.ticketCode}
                </div>
                <div className="text-[13px] font-bold text-slate-900 dark:text-white mt-1 line-clamp-2">
                  {selectedTicket.name}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-left pt-2 border-t border-slate-200 dark:border-slate-700 text-[11px]">
                <div>
                  <span className="text-slate-400 block text-[9.5px]">Số may mắn</span>
                  <span className="font-bold text-[#001B54] dark:text-blue-300 text-xs">
                    {selectedTicket.luckyNumber || "#1983"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9.5px]">Vị trí ghế</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 text-xs truncate block">
                    {selectedTicket.seat || "VIP"}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400 block text-[9.5px]">Địa điểm</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300 truncate block">
                    {selectedTicket.place || "Hà Nội"}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setSelectedTicket(null)}
                className="flex-1 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition cursor-pointer"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={() => {
                  toast.success("Đã tải hình ảnh vé sự kiện về máy!");
                  setSelectedTicket(null);
                }}
                className="flex-1 py-2 rounded-xl bg-[#001B54] hover:bg-[#002B70] text-xs font-bold text-white transition shadow-xs cursor-pointer inline-flex items-center justify-center gap-1"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Lưu vé</span>
              </button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
