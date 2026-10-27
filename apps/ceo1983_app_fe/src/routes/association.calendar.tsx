import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import React, { useState, useEffect, useMemo } from "react";
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  QrCode,
  Users,
  Bell,
  BellRing,
  BellOff,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Phone,
  MessageSquare,
  Building2,
  Sparkles,
  Filter,
  Plus,
  X,
  AlertCircle,
  Video,
  Coffee,
  Briefcase,
  Ticket,
  Handshake,
  Check,
  CalendarCheck,
  Search,
} from "lucide-react";
import { MemberHeader } from "@/components/member/MemberShell";
import { useAuth } from "@/context/AuthContext";
import { resolveMediaUrl, fetchNestApi } from "@/lib/api-client";
import { formatDisplayDate } from "@/lib/date-format";
import { toast } from "sonner";
import { CreateConnectionModal } from "@/components/member/CreateConnectionModal";

export const Route = createFileRoute("/association/calendar")({
  component: CalendarScreen,
});

export type CalendarItemType = "event" | "meeting_committee" | "meeting_1on1";

export interface CalendarItem {
  id: string;
  type: CalendarItemType;
  title: string;
  categoryLabel: string;
  date: string; // YYYY-MM-DD or ISO
  time: string; // HH:mm or "08:30 - 11:30"
  location: string;
  isOnline?: boolean;
  onlineLink?: string;
  organizer?: string;
  partnerName?: string;
  partnerCompany?: string;
  partnerPhone?: string;
  partnerAvatar?: string;
  status: "confirmed" | "registered" | "completed" | "cancelled" | "pending";
  ticketCode?: string;
  description?: string;
  banner?: string;
  notes?: string;
}

export type ReminderTiming = "exact" | "15min" | "1hour" | "1day" | "3days";

export interface ReminderConfig {
  itemId: string;
  enabled: boolean;
  timing: ReminderTiming;
  notified?: boolean;
}

const DEFAULT_COMMITTEE_MEETINGS: CalendarItem[] = [
  {
    id: "cm-1",
    type: "meeting_committee",
    title: "Họp Ban Thư Ký & Ban Điều Hành CEO 1983",
    categoryLabel: "Họp Ban Điều Hành",
    date: new Date(Date.now() + 86400000).toISOString().split("T")[0],
    time: "09:00 - 11:30",
    location: "Văn phòng Hiệp hội CEO 1983, Tầng 12 Keangnam Landmark 72, Hà Nội",
    isOnline: false,
    organizer: "Ban Thư Ký CLB",
    status: "confirmed",
    description: "Rà soát kế hoạch xúc tiến thương mại Quý 4/2026 và chuẩn bị Đại hội Gala Doanh Nhân.",
  },
  {
    id: "cm-2",
    type: "meeting_committee",
    title: "Chuyên đề Đào tạo: Chuyển đổi số & AI cho Doanh nghiệp 1983",
    categoryLabel: "Ban Đào Tạo & Huấn Luyện",
    date: new Date(Date.now() + 2 * 86400000).toISOString().split("T")[0],
    time: "14:30 - 17:00",
    location: "Phòng họp trực tuyến Zoom / Uiwork",
    isOnline: true,
    onlineLink: "https://zoom.us/j/88319830001",
    organizer: "Ban Đào Tạo CLB",
    status: "confirmed",
    description: "Đào tạo chuyên sâu ứng dụng AI tự động hóa chăm sóc khách hàng và bán hàng B2B.",
  },
  {
    id: "cm-3",
    type: "meeting_committee",
    title: "Họp Ban Xúc Tiến Thương Mại & Kết Nối B2B",
    categoryLabel: "Ban Xúc Tiến Thương Mại",
    date: new Date(Date.now() + 5 * 86400000).toISOString().split("T")[0],
    time: "08:30 - 10:30",
    location: "Trung tâm Hội nghị Quốc gia NCC, Cầu Giấy, Hà Nội",
    isOnline: false,
    organizer: "Ban XTTM",
    status: "confirmed",
    description: "Khớp lệnh nhu cầu cung - ứng giữa 50 doanh nghiệp thành viên CLB CEO 1983.",
  },
];

const DEFAULT_1ON1_APPOINTMENTS: CalendarItem[] = [
  {
    id: "app-1",
    type: "meeting_1on1",
    title: "Cà phê kết nối hợp tác chiến lược B2B",
    categoryLabel: "Cuộc gặp 1-on-1",
    date: new Date().toISOString().split("T")[0], // Hôm nay
    time: "15:00 - 16:30",
    location: "Highlands Coffee, Tòa nhà Keangnam, Mễ Trì, Hà Nội",
    isOnline: false,
    partnerName: "Đinh Xuân Hải",
    partnerCompany: "Hải Phát Construction JSC",
    partnerPhone: "0903221983",
    partnerAvatar: "/ceo1983-emblem-8.png",
    status: "confirmed",
    description: "Trao đổi hợp đồng cung ứng vật liệu xây dựng và giải pháp công nghệ.",
  },
  {
    id: "app-2",
    type: "meeting_1on1",
    title: "Thảo luận hợp tác chuỗi cung ứng & phân phối",
    categoryLabel: "Cuộc gặp 1-on-1",
    date: new Date(Date.now() + 3 * 86400000).toISOString().split("T")[0],
    time: "10:00 - 11:30",
    location: "Văn phòng ViConnect, Cầu Giấy, Hà Nội",
    isOnline: false,
    partnerName: "Nguyễn Thu Hà",
    partnerCompany: "Thu Hà Logistics & Trading",
    partnerPhone: "0912345678",
    partnerAvatar: "/ceo1983-emblem-8.png",
    status: "confirmed",
    description: "Ký kết thỏa thuận hợp tác vận chuyển hàng hóa xuất nhập khẩu liên tỉnh.",
  },
];

const DEFAULT_EVENTS: CalendarItem[] = [
  {
    id: "ev-1",
    type: "event",
    title: "Đại Tiệc Doanh Nhân & Gala Trao Giải CEO 1983",
    categoryLabel: "Sự kiện CLB",
    date: new Date(Date.now() + 4 * 86400000).toISOString().split("T")[0],
    time: "18:00 - 21:30",
    location: "Trung tâm Hội nghị Quốc gia NCC, Mễ Trì, Nam Từ Liêm, Hà Nội",
    isOnline: false,
    organizer: "CLB Doanh Nhân CEO 1983 (HanoiBA)",
    status: "registered",
    ticketCode: "VIP-CEO1983-8888",
    description: "Đêm Gala vinh danh lãnh đạo doanh nghiệp tiêu biểu và kết nối giao thương cấp cao.",
  },
];

export function CalendarScreen() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Active filter tab
  const [filterType, setFilterType] = useState<"ALL" | "EVENT" | "MEETING_COMMITTEE" | "MEETING_1ON1">("ALL");
  const [selectedDate, setSelectedDate] = useState<string | null>(null); // YYYY-MM-DD or null
  const [searchQuery, setSearchQuery] = useState("");
  const [createConnectModalOpen, setCreateConnectModalOpen] = useState(false);

  // Reminder settings modal
  const [reminderModalTarget, setReminderModalTarget] = useState<CalendarItem | null>(null);

  // Reminders state stored in localStorage
  const [reminders, setReminders] = useState<Record<string, ReminderConfig>>(() => {
    if (typeof window === "undefined") return {};
    try {
      const stored = localStorage.getItem("vba_calendar_reminders");
      if (stored) return JSON.parse(stored);
    } catch {}
    return {};
  });

  // Calendar items master list
  const [calendarItems, setCalendarItems] = useState<CalendarItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Sync reminders state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("vba_calendar_reminders", JSON.stringify(reminders));
    } catch {}
  }, [reminders]);

  // Load ONLY registered events, confirmed committee meetings, and 1on1 appointments of logged-in user
  const loadCalendarData = async () => {
    setLoading(true);
    try {
      let combined: CalendarItem[] = [];

      // 1. Fetch registered events from server or localStorage
      try {
        const res = await fetchNestApi<any>("/events/my-events").catch(() => null);
        if (Array.isArray(res) && res.length > 0) {
          const mappedEvents: CalendarItem[] = res.map((ev: any) => ({
            id: String(ev.id || `ev-${Math.random()}`),
            type: "event",
            title: ev.title || "Sự kiện CLB CEO 1983",
            categoryLabel: "Sự kiện CLB",
            date: ev.date || (ev.day && ev.month ? `${new Date().getFullYear()}-11-15` : new Date().toISOString().split("T")[0]),
            time: ev.time || "08:30 - 11:30",
            location: ev.place || ev.location || "Hà Nội",
            isOnline: Boolean(ev.isOnline),
            onlineLink: ev.onlineLink,
            status: "registered",
            ticketCode: ev.ticketCode || `VIP-${ev.id || "1983"}`,
            description: ev.description,
          }));
          combined.push(...mappedEvents);
        } else {
          // Check registered events in localStorage (user actually clicked "Đăng ký tham gia")
          const localEventsRaw = localStorage.getItem("vba_registered_events");
          if (localEventsRaw) {
            const list = JSON.parse(localEventsRaw);
            if (Array.isArray(list) && list.length > 0) {
              combined.push(...list.map((e: any) => ({
                id: String(e.id || `ev-${Math.random()}`),
                type: "event" as const,
                title: e.title || "Sự kiện đã đăng ký",
                categoryLabel: "Sự kiện CLB",
                date: e.date || new Date().toISOString().split("T")[0],
                time: e.time || "18:00 - 21:00",
                location: e.location || e.place || "Trung tâm Hội nghị Quốc gia NCC",
                status: "registered" as const,
                ticketCode: e.ticketCode || `VIP-${e.id || "1983"}`,
                description: e.description,
              })));
            }
          }
        }
      } catch {}

      // 2. Load 1-on-1 appointments that the user actually scheduled
      try {
        const stored1on1 = localStorage.getItem("vba_connection_appointments");
        if (stored1on1) {
          const list = JSON.parse(stored1on1);
          if (Array.isArray(list) && list.length > 0) {
            const mapped1on1: CalendarItem[] = list.map((a: any, idx: number) => ({
              id: a.id || `app-${idx}`,
              type: "meeting_1on1",
              title: a.title || "Gặp gỡ kết nối 1-on-1",
              categoryLabel: "Cuộc gặp 1-on-1",
              date: a.date ? a.date.split("T")[0] : new Date().toISOString().split("T")[0],
              time: a.time || "14:30 - 16:00",
              location: a.venue || a.location || "Highlands Coffee Cầu Giấy, Hà Nội",
              isOnline: a.venueType === "online" || Boolean(a.onlineUrl),
              onlineLink: a.onlineUrl,
              partnerName: a.partnerName || a.hostName || "Hội viên CLB",
              partnerCompany: a.partnerCompany || a.hostCompany || "Doanh nghiệp CLB",
              partnerPhone: a.partnerPhone || a.hostPhone || "0901234567",
              partnerAvatar: a.partnerAvatar || a.hostAvatar,
              status: (a.status as any) || "confirmed",
              description: a.notes,
            }));
            combined.push(...mapped1on1);
          }
        }
      } catch {}

      // 3. Load Committee meetings user actually registered for
      try {
        const storedMeetings = localStorage.getItem("vba_registered_committee_meetings");
        if (storedMeetings) {
          const list = JSON.parse(storedMeetings);
          if (Array.isArray(list) && list.length > 0) {
            const mappedMeetings: CalendarItem[] = list.map((m: any, idx: number) => ({
              id: m.id || `cm-${idx}`,
              type: "meeting_committee",
              title: m.title || "Họp Ban chuyên môn",
              categoryLabel: m.categoryLabel || "Họp Ban",
              date: m.date || new Date().toISOString().split("T")[0],
              time: m.time || "09:00 - 11:30",
              location: m.location || "Văn phòng Hiệp hội CEO 1983",
              isOnline: Boolean(m.isOnline),
              onlineLink: m.onlineLink,
              status: "confirmed",
              description: m.description,
            }));
            combined.push(...mappedMeetings);
          }
        }
      } catch {}

      // Sort by date ascending
      combined.sort((a, b) => new Date(`${a.date} ${a.time.slice(0, 5)}`).getTime() - new Date(`${b.date} ${b.time.slice(0, 5)}`).getTime());

      setCalendarItems(combined);
    } catch {
      toast.error("Không thể tải lịch trình lúc này");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCalendarData();
  }, []);

  // ── ACTIVE REMINDER ENGINE: Check and trigger reminders on due dates ──
  useEffect(() => {
    if (calendarItems.length === 0) return;

    const checkReminders = () => {
      const now = new Date();
      const todayStr = now.toISOString().split("T")[0];

      calendarItems.forEach((item) => {
        const config = reminders[item.id];
        if (!config || !config.enabled || config.notified) return;

        // Check if event is today or within reminder timing
        const itemDate = new Date(item.date);
        const diffMs = itemDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

        let shouldNotify = false;
        if (item.date === todayStr) {
          shouldNotify = true;
        } else if (config.timing === "1day" && diffDays <= 1 && diffDays >= 0) {
          shouldNotify = true;
        } else if (config.timing === "3days" && diffDays <= 3 && diffDays >= 0) {
          shouldNotify = true;
        }

        if (shouldNotify) {
          // Trigger notification
          const typeText =
            item.type === "event" ? "Sự kiện" : item.type === "meeting_committee" ? "Cuộc họp ban" : "Cuộc gặp 1-on-1";
          toast.info(`🔔 NHẮC LỊCH: ${typeText} "${item.title}" diễn ra lúc ${item.time} (${formatDisplayDate(item.date)}) tại ${item.location}!`, {
            duration: 8000,
          });

          // Mark notified in memory
          setReminders((prev) => ({
            ...prev,
            [item.id]: { ...prev[item.id], notified: true },
          }));

          // Send native notification if supported
          if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
            try {
              new Notification(`CEO 1983 - Nhắc lịch ${typeText}`, {
                body: `${item.title} lúc ${item.time} tại ${item.location}`,
                icon: "/ceo1983-emblem-8.png",
              });
            } catch {}
          }
        }
      });
    };

    const timer = setTimeout(checkReminders, 1200);
    return () => clearTimeout(timer);
  }, [calendarItems, reminders]);

  // Request browser notification permission if requested
  const handleRequestPushNotification = async () => {
    if (typeof window !== "undefined" && "Notification" in window) {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        toast.success("Đã bật thông báo nhắc hẹn trên thiết bị!");
      } else {
        toast.info("Bạn có thể nhận thông báo trực tiếp ngay trong ứng dụng.");
      }
    }
  };

  // Toggle reminder for an item
  const handleToggleReminder = (item: CalendarItem) => {
    const current = reminders[item.id];
    const nextEnabled = !current?.enabled;

    setReminders((prev) => ({
      ...prev,
      [item.id]: {
        itemId: item.id,
        enabled: nextEnabled,
        timing: current?.timing || "1day",
        notified: false,
      },
    }));

    if (nextEnabled) {
      toast.success(`Đã bật nhắc lịch cho "${item.title.slice(0, 35)}..."!`);
      handleRequestPushNotification();
    } else {
      toast.info(`Đã tắt nhắc lịch.`);
    }
  };

  // Update reminder timing
  const handleUpdateReminderTiming = (itemId: string, timing: ReminderTiming) => {
    setReminders((prev) => ({
      ...prev,
      [itemId]: {
        itemId,
        enabled: true,
        timing,
        notified: false,
      },
    }));
    toast.success("Đã lưu thời gian nhắc nhở!");
    setReminderModalTarget(null);
  };

  // 14-day date strip
  const dateStrip = useMemo(() => {
    const days = [];
    const base = new Date();
    for (let i = -1; i < 13; i++) {
      const d = new Date(base.getTime() + i * 86400000);
      const dateStr = d.toISOString().split("T")[0];
      const dayNum = d.getDate();
      const weekDay = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"][d.getDay()];
      const isToday = i === 0;

      // Check if any items on this date
      const hasEvent = calendarItems.some((item) => item.date === dateStr && item.type === "event");
      const hasCommittee = calendarItems.some((item) => item.date === dateStr && item.type === "meeting_committee");
      const has1on1 = calendarItems.some((item) => item.date === dateStr && item.type === "meeting_1on1");

      days.push({
        dateStr,
        dayNum,
        weekDay,
        isToday,
        hasEvent,
        hasCommittee,
        has1on1,
      });
    }
    return days;
  }, [calendarItems]);

  // Filtered items
  const filteredItems = useMemo(() => {
    return calendarItems.filter((item) => {
      // Type filter
      if (filterType === "EVENT" && item.type !== "event") return false;
      if (filterType === "MEETING_COMMITTEE" && item.type !== "meeting_committee") return false;
      if (filterType === "MEETING_1ON1" && item.type !== "meeting_1on1") return false;

      // Date filter
      if (selectedDate && item.date !== selectedDate) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        return (
          item.title.toLowerCase().includes(q) ||
          item.location.toLowerCase().includes(q) ||
          (item.partnerName && item.partnerName.toLowerCase().includes(q)) ||
          (item.partnerCompany && item.partnerCompany.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [calendarItems, filterType, selectedDate, searchQuery]);

  // Urgent today item
  const todayStr = new Date().toISOString().split("T")[0];
  const urgentTodayItems = calendarItems.filter((i) => i.date === todayStr);

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#070D18] text-slate-900 dark:text-white pb-24 font-sans select-none">
      {/* Header */}
      <MemberHeader
        title="Lịch Hoạt Động & Nhắc Hẹn"
        subtitle="Sự kiện, cuộc họp ban & cuộc gặp của bạn"
        right={
          <button
            type="button"
            onClick={() => setCreateConnectModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold transition shadow-xs cursor-pointer"
            title="Tạo lịch hẹn kết nối mới"
          >
            <Plus className="size-3.5" />
            <span className="hidden sm:inline">Đặt lịch hẹn</span>
          </button>
        }
      />

      <div className="max-w-xl mx-auto px-4 py-3 space-y-4">
        {/* ── 1. TODAY'S URGENT SCHEDULE BANNER (IF ANY) ── */}
        {urgentTodayItems.length > 0 && (
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-red-600 via-amber-600 to-amber-500 text-white shadow-lg shadow-amber-500/20 space-y-2 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-black/30 backdrop-blur-xs border border-white/20">
                <BellRing className="size-3 text-amber-300 animate-bounce" />
                Lịch trình hôm nay ({urgentTodayItems.length})
              </span>
              <span className="text-[11px] font-bold text-amber-100 font-mono">
                {formatDisplayDate(todayStr)}
              </span>
            </div>

            {urgentTodayItems.map((urgent) => (
              <div
                key={urgent.id}
                className="bg-black/25 backdrop-blur-xs rounded-xl p-2.5 border border-white/15 flex items-start justify-between gap-2"
              >
                <div className="space-y-1 min-w-0">
                  <p className="text-xs font-extrabold truncate text-white leading-tight">
                    {urgent.title}
                  </p>
                  <p className="text-[11px] text-amber-200 flex items-center gap-1.5">
                    <Clock className="size-3 shrink-0" />
                    <span>{urgent.time}</span>
                    <span>·</span>
                    <MapPin className="size-3 shrink-0" />
                    <span className="truncate max-w-[180px]">{urgent.location}</span>
                  </p>
                </div>
                {urgent.isOnline && urgent.onlineLink ? (
                  <a
                    href={urgent.onlineLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1.5 rounded-lg bg-white text-slate-900 text-[10.5px] font-black shrink-0 hover:bg-amber-100 transition shadow-xs flex items-center gap-1"
                  >
                    <Video className="size-3 text-red-600" />
                    <span>Vào họp</span>
                  </a>
                ) : (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(urgent.location)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1.5 rounded-lg bg-white text-slate-900 text-[10.5px] font-black shrink-0 hover:bg-amber-100 transition shadow-xs flex items-center gap-1"
                  >
                    <MapPin className="size-3 text-red-600" />
                    <span>Chỉ đường</span>
                  </a>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── 2. QUICK KPI COUNTERS ── */}
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setFilterType("EVENT")}
            className={`p-2.5 rounded-2xl border transition text-left cursor-pointer ${
              filterType === "EVENT"
                ? "bg-red-500/10 border-red-500/40 text-red-600 dark:text-red-400 font-extrabold"
                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Sự kiện</span>
              <Ticket className="size-3.5 text-red-500" />
            </div>
            <p className="text-base font-black text-slate-900 dark:text-white mt-1">
              {calendarItems.filter((i) => i.type === "event").length}
            </p>
          </button>

          <button
            type="button"
            onClick={() => setFilterType("MEETING_COMMITTEE")}
            className={`p-2.5 rounded-2xl border transition text-left cursor-pointer ${
              filterType === "MEETING_COMMITTEE"
                ? "bg-amber-500/10 border-amber-500/40 text-amber-600 dark:text-amber-400 font-extrabold"
                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Họp ban</span>
              <Users className="size-3.5 text-amber-500" />
            </div>
            <p className="text-base font-black text-slate-900 dark:text-white mt-1">
              {calendarItems.filter((i) => i.type === "meeting_committee").length}
            </p>
          </button>

          <button
            type="button"
            onClick={() => setFilterType("MEETING_1ON1")}
            className={`p-2.5 rounded-2xl border transition text-left cursor-pointer ${
              filterType === "MEETING_1ON1"
                ? "bg-blue-500/10 border-blue-500/40 text-blue-600 dark:text-blue-400 font-extrabold"
                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Gặp 1-on-1</span>
              <Handshake className="size-3.5 text-blue-500" />
            </div>
            <p className="text-base font-black text-slate-900 dark:text-white mt-1">
              {calendarItems.filter((i) => i.type === "meeting_1on1").length}
            </p>
          </button>
        </div>

        {/* ── 3. HORIZONTAL 14-DAY CALENDAR STRIP ── */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <CalendarIcon className="size-3.5 text-[#003B95] dark:text-amber-400" />
              <span>Thanh chọn ngày lịch trình</span>
            </span>
            {selectedDate && (
              <button
                type="button"
                onClick={() => setSelectedDate(null)}
                className="text-[10.5px] font-bold text-blue-600 dark:text-amber-400 hover:underline cursor-pointer"
              >
                Xem tất cả ngày
              </button>
            )}
          </div>

          <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-1 select-none">
            {dateStrip.map((day) => {
              const isSelected = selectedDate === day.dateStr;
              return (
                <button
                  key={day.dateStr}
                  type="button"
                  onClick={() => setSelectedDate(isSelected ? null : day.dateStr)}
                  className={`flex flex-col items-center justify-center min-w-[50px] py-2 px-1.5 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#003B95] text-white border-[#003B95] shadow-md shadow-blue-900/25 scale-102"
                      : day.isToday
                      ? "bg-amber-500/10 border-amber-500/40 text-amber-700 dark:text-amber-300 font-bold"
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <span className={`text-[10px] uppercase font-bold ${isSelected ? "text-amber-300" : "text-slate-400"}`}>
                    {day.isToday ? "Nay" : day.weekDay}
                  </span>
                  <span className="text-sm font-black mt-0.5 leading-none">{day.dayNum}</span>

                  {/* Multi-category dots indicator */}
                  <div className="flex items-center gap-0.5 mt-1.5 h-1.5">
                    {day.hasEvent && <span className="size-1 rounded-full bg-red-500" />}
                    {day.hasCommittee && <span className="size-1 rounded-full bg-amber-500" />}
                    {day.has1on1 && <span className="size-1 rounded-full bg-blue-500" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── 4. CATEGORY TABS & SEARCH BAR ── */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm sự kiện, cuộc họp, tên đối tác..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-[#003B95]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="size-3" />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                if (filterType === "ALL") setFilterType("EVENT");
                else if (filterType === "EVENT") setFilterType("MEETING_COMMITTEE");
                else if (filterType === "MEETING_COMMITTEE") setFilterType("MEETING_1ON1");
                else setFilterType("ALL");
              }}
              className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition cursor-pointer"
              title="Chuyển bộ lọc"
            >
              <Filter className="size-4" />
            </button>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 text-xs">
            <button
              type="button"
              onClick={() => setFilterType("ALL")}
              className={`px-3 py-1 rounded-xl font-bold whitespace-nowrap transition cursor-pointer ${
                filterType === "ALL"
                  ? "bg-[#003B95] text-white shadow-xs"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
              }`}
            >
              Tất cả ({calendarItems.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterType("EVENT")}
              className={`px-3 py-1 rounded-xl font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1 ${
                filterType === "EVENT"
                  ? "bg-red-600 text-white shadow-xs"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
              }`}
            >
              <span className="size-1.5 rounded-full bg-red-400" />
              Sự kiện
            </button>
            <button
              type="button"
              onClick={() => setFilterType("MEETING_COMMITTEE")}
              className={`px-3 py-1 rounded-xl font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1 ${
                filterType === "MEETING_COMMITTEE"
                  ? "bg-amber-600 text-white shadow-xs"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
              }`}
            >
              <span className="size-1.5 rounded-full bg-amber-400" />
              Họp ban
            </button>
            <button
              type="button"
              onClick={() => setFilterType("MEETING_1ON1")}
              className={`px-3 py-1 rounded-xl font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1 ${
                filterType === "MEETING_1ON1"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
              }`}
            >
              <span className="size-1.5 rounded-full bg-blue-400" />
              Gặp 1-on-1
            </button>
          </div>
        </div>

        {/* ── 5. SCHEDULED ITEMS LIST ── */}
        <div className="space-y-3 pt-1">
          {loading ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              Đang tải lịch trình của bạn...
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3">
              <CalendarCheck className="size-10 mx-auto text-[#003B95] dark:text-cyan-400 opacity-60" />
              <div>
                <p className="text-sm font-black text-slate-800 dark:text-white">
                  Chưa có lịch trình sự kiện hoặc cuộc hẹn nào
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
                  {selectedDate
                    ? `Không có sự kiện hay cuộc hẹn nào bạn đã tham gia vào ngày ${formatDisplayDate(selectedDate)}.`
                    : "Lịch cá nhân chỉ hiển thị các sự kiện CLB, cuộc họp ban và cuộc gặp 1-on-1 mà bạn đã đăng ký hoặc tham gia."}
                </p>
              </div>
              <div className="flex items-center justify-center gap-2 pt-1 flex-wrap">
                <Link
                  to="/association/events"
                  className="px-3 py-2 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-sm active:scale-95 transition"
                >
                  <Ticket className="size-3.5" />
                  <span>Khám phá sự kiện CLB</span>
                </Link>
                <button
                  type="button"
                  onClick={() => setCreateConnectModalOpen(true)}
                  className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer active:scale-95 transition"
                >
                  <Plus className="size-3.5" />
                  <span>Đặt lịch hẹn 1-on-1</span>
                </button>
              </div>
            </div>
          ) : (
            filteredItems.map((item) => {
              const reminder = reminders[item.id];
              const isReminderOn = Boolean(reminder?.enabled);
              const isToday = item.date === todayStr;

              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-3xl bg-white dark:bg-slate-900 border transition-all space-y-3 shadow-xs ${
                    isToday
                      ? "border-amber-400/80 ring-1 ring-amber-400/50"
                      : "border-slate-200 dark:border-slate-800 hover:border-slate-300"
                  }`}
                >
                  {/* Item Header: Badge, Date, Time & Reminder Toggle */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[9.5px] font-black uppercase tracking-wider ${
                          item.type === "event"
                            ? "bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-300 border border-red-300/40"
                            : item.type === "meeting_committee"
                            ? "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-300/40"
                            : "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-300/40"
                        }`}
                      >
                        {item.categoryLabel}
                      </span>

                      {isToday && (
                        <span className="px-1.5 py-0.2 rounded-md text-[9px] font-extrabold bg-red-600 text-white animate-pulse">
                          HÔM NAY
                        </span>
                      )}
                    </div>

                    {/* Quick Reminder Bell Button */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleToggleReminder(item)}
                        className={`p-1.5 rounded-xl transition cursor-pointer flex items-center gap-1 text-[10.5px] font-bold ${
                          isReminderOn
                            ? "bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600"
                        }`}
                        title={isReminderOn ? "Bấm để tắt hoặc cài đặt nhắc nhở" : "Bật nhắc lịch hẹn"}
                      >
                        {isReminderOn ? (
                          <>
                            <BellRing className="size-3.5 text-amber-500" />
                            <span className="hidden sm:inline">
                              {reminder?.timing === "exact"
                                ? "Đúng giờ"
                                : reminder?.timing === "15min"
                                ? "Trước 15p"
                                : reminder?.timing === "1hour"
                                ? "Trước 1h"
                                : reminder?.timing === "3days"
                                ? "Trước 3 ngày"
                                : "Trước 1 ngày"}
                            </span>
                          </>
                        ) : (
                          <>
                            <Bell className="size-3.5" />
                            <span className="hidden sm:inline">Cài nhắc</span>
                          </>
                        )}
                      </button>

                      {isReminderOn && (
                        <button
                          type="button"
                          onClick={() => setReminderModalTarget(item)}
                          className="p-1.5 rounded-xl text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                          title="Tùy chỉnh thời gian nhắc hẹn"
                        >
                          <Clock className="size-3" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-1">
                    <h4 className="text-sm font-black text-slate-900 dark:text-white leading-snug">
                      {item.title}
                    </h4>
                    {item.description && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    )}
                  </div>

                  {/* Details Card (Time, Place, Partner) */}
                  <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs space-y-1.5">
                    <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                      <span className="flex items-center gap-1.5 font-bold">
                        <Clock className="size-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                        <span>{item.time}</span>
                      </span>
                      <span className="text-[11px] font-mono text-slate-500">
                        {formatDisplayDate(item.date)}
                      </span>
                    </div>

                    <div className="flex items-start gap-1.5 text-slate-600 dark:text-slate-400">
                      <MapPin className="size-3.5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                      <span className="text-[11.5px] leading-snug break-words">
                        {item.location}
                      </span>
                    </div>

                    {/* If 1-on-1: show partner details */}
                    {item.type === "meeting_1on1" && item.partnerName && (
                      <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                        <div className="flex items-center gap-2">
                          <img
                            src={resolveMediaUrl(item.partnerAvatar || "") || "/ceo1983-emblem-8.png"}
                            alt={item.partnerName}
                            className="size-5 rounded-full object-cover border"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/ceo1983-emblem-8.png";
                            }}
                          />
                          <span className="font-bold text-[11px] text-slate-800 dark:text-slate-200">
                            Đối tác: {item.partnerName}
                          </span>
                        </div>
                        {item.partnerPhone && (
                          <div className="flex items-center gap-1">
                            <a
                              href={`tel:${item.partnerPhone}`}
                              className="p-1 rounded-md bg-slate-200/80 dark:bg-slate-700 text-slate-700 dark:text-slate-200"
                              title="Gọi điện thoại"
                            >
                              <Phone className="size-3" />
                            </a>
                            <a
                              href={`https://zalo.me/${item.partnerPhone.replace(/\D/g, "")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-1.5 py-0.5 rounded-md bg-blue-600 text-white text-[9.5px] font-bold"
                            >
                              Zalo
                            </a>
                          </div>
                        )}
                      </div>
                    )}

                    {/* If event ticket code */}
                    {item.ticketCode && (
                      <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-700/60 text-[10.5px]">
                        <span className="text-slate-400 flex items-center gap-1">
                          <QrCode className="size-3 text-red-500" />
                          Mã vé check-in:
                        </span>
                        <span className="font-mono font-bold text-red-600 dark:text-amber-400">
                          {item.ticketCode}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions Footer */}
                  <div className="flex items-center justify-between gap-2 pt-1 text-xs">
                    <button
                      type="button"
                      onClick={() => setReminderModalTarget(item)}
                      className="text-[11px] font-semibold text-slate-500 hover:text-amber-600 dark:hover:text-amber-400 flex items-center gap-1 cursor-pointer"
                    >
                      <Bell className="size-3 text-amber-500" />
                      <span>{isReminderOn ? "Tùy chỉnh nhắc" : "Cài đặt nhắc nhở"}</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      {item.isOnline && item.onlineLink ? (
                        <a
                          href={item.onlineLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold transition flex items-center gap-1 shadow-xs"
                        >
                          <Video className="size-3" />
                          <span>Vào họp Online</span>
                        </a>
                      ) : (
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.location)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white text-[11px] font-bold transition flex items-center gap-1"
                        >
                          <MapPin className="size-3 text-red-500" />
                          <span>Chỉ đường</span>
                        </a>
                      )}

                      {item.type === "event" && (
                        <Link
                          to="/association/events"
                          className="px-3 py-1.5 rounded-xl bg-[#003B95] hover:bg-[#002B70] text-white text-[11px] font-bold transition flex items-center gap-1 shadow-xs"
                        >
                          <Ticket className="size-3" />
                          <span>Xem sự kiện</span>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── 6. REMINDER SETTING MODAL ── */}
      {reminderModalTarget && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setReminderModalTarget(null)}
        >
          <div
            className="w-full max-w-sm rounded-3xl bg-white dark:bg-[#0B132B] border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <BellRing className="size-4.5" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                    Cài Đặt Nhắc Lịch Hẹn
                  </h3>
                  <p className="text-[10.5px] text-slate-400">
                    Chọn thời gian thông báo trước khi diễn ra
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setReminderModalTarget(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-800 dark:text-white line-clamp-2">
                {reminderModalTarget.title}
              </p>
              <p className="text-[11px] text-slate-500 flex items-center gap-1">
                <Clock className="size-3 text-amber-500" />
                <span>
                  {reminderModalTarget.time} · {formatDisplayDate(reminderModalTarget.date)}
                </span>
              </p>
            </div>

            {/* Timing Options */}
            <div className="space-y-1.5">
              {[
                { id: "15min", label: "Trước 15 phút", desc: "Thích hợp cho cuộc họp trực tuyến" },
                { id: "1hour", label: "Trước 1 giờ", desc: "Đủ thời gian di chuyển đến địa điểm" },
                { id: "1day", label: "Trước 1 ngày (Mặc định)", desc: "Nhắc nhở chuẩn bị hồ sơ & lịch trình" },
                { id: "3days", label: "Trước 3 ngày", desc: "Thích hợp cho sự kiện quy mô lớn" },
                { id: "exact", label: "Đúng giờ diễn ra", desc: "Thông báo ngay khi bắt đầu" },
              ].map((opt) => {
                const isSelected =
                  (reminders[reminderModalTarget.id]?.timing || "1day") === opt.id &&
                  reminders[reminderModalTarget.id]?.enabled;

                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() =>
                      handleUpdateReminderTiming(reminderModalTarget.id, opt.id as ReminderTiming)
                    }
                    className={`w-full p-2.5 rounded-2xl border text-left transition flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? "bg-amber-500/10 border-amber-500/50 text-amber-900 dark:text-amber-200"
                        : "bg-slate-50 dark:bg-slate-800/50 border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                    }`}
                  >
                    <div>
                      <p className="text-xs font-bold">{opt.label}</p>
                      <p className="text-[10px] text-slate-400">{opt.desc}</p>
                    </div>
                    {isSelected && <Check className="size-4 text-amber-500 shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Bottom Actions */}
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  handleToggleReminder(reminderModalTarget);
                  setReminderModalTarget(null);
                }}
                className="flex-1 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                {reminders[reminderModalTarget.id]?.enabled ? "Tắt thông báo" : "Hủy"}
              </button>
              <button
                type="button"
                onClick={() => setReminderModalTarget(null)}
                className="flex-1 py-2 rounded-xl bg-[#003B95] text-white text-xs font-bold hover:bg-[#002B70] transition shadow-xs"
              >
                Xong
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 7. CREATE CONNECTION / APPOINTMENT MODAL ── */}
      <CreateConnectionModal
        isOpen={createConnectModalOpen}
        onClose={() => {
          setCreateConnectModalOpen(false);
          loadCalendarData();
        }}
        onCreated={() => {
          setCreateConnectModalOpen(false);
          loadCalendarData();
          toast.success("Đã bổ sung lịch hẹn vào lịch trình của bạn!");
        }}
      />
    </div>
  );
}
