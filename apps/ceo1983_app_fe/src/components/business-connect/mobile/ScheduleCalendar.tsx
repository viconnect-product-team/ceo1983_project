// Xem lịch — /connect-app/calendar
//
// Lịch làm việc & sự kiện của người dùng tổng hợp từ:
// 1. Sự kiện đã lưu / thêm vào lịch (vione_saved_calendar_events)
// 2. Sự kiện đã đăng ký tham gia từ hệ sinh thái (/events)
// 3. Cuộc gặp & việc cần theo dõi (Work Hub / useBusinessConnectHome)

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  Bell,
  CalendarDays,
  CalendarPlus,
  CheckCircle2,
  Clock,
  MapPin,
  Plus,
  RefreshCw,
  User,
  Users,
  Video,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useFmt, useT } from "@/lib/i18n";
import { useBusinessConnectHome, type BcMobileTodayItem } from "@/hooks/use-business-connect-home";
import { fetchNestApi } from "@/lib/api-client";
import {
  getSavedCalendarEvents,
  saveCalendarEvent,
  type SavedCalendarEvent,
} from "@/lib/business-connect/mobile/calendar-storage";
import { TodayItem } from "./TodayItem";
import { EventDetailMobileSheet } from "./EventDetailMobileSheet";
import type { CrmEvent } from "./ExecutiveHome";

export type MeetingRecord = {
  id: string;
  title: string;
  partnerName: string;
  partnerPhone?: string;
  partnerRole?: string;
  isAgreed: boolean;
  date: string;
  time: string;
  venueType: "offline" | "online";
  venue: string;
  reminderTier: 1 | 2 | 3 | 4;
  notes?: string;
  createdAt: string;
};

const MEETINGS_STORAGE_KEY = "vione_meetings_history";

export function getMeetingHistory(): MeetingRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(MEETINGS_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveMeetingRecord(record: MeetingRecord) {
  if (typeof window === "undefined") return;
  try {
    const current = getMeetingHistory();
    const updated = [record, ...current.filter((m) => m.id !== record.id)];
    localStorage.setItem(MEETINGS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("vione:calendar-updated"));
  } catch {}
}

type Filter = "all" | "meeting" | "event" | "follow_up" | "history";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "Tất cả" },
  { id: "meeting", label: "Cuộc gặp" },
  { id: "event", label: "Sự kiện" },
  { id: "follow_up", label: "Cần theo dõi" },
  { id: "history", label: "Lịch sử cuộc gặp" },
];

function itemDate(item: BcMobileTodayItem): Date | null {
  const raw = item.startsAt ?? item.dueAt;
  if (!raw) return null;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d;
}

function dayKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function matchesFilter(item: BcMobileTodayItem, filter: Filter): boolean {
  if (filter === "all") return true;
  if (filter === "event") return item.kind === "calendar" || item.id.startsWith("event:");
  if (filter === "meeting") return item.kind === "meeting";
  if (filter === "follow_up") return item.kind === "follow_up";
  return true;
}

export function ScheduleCalendar() {
  const t = useT();
  const fmt = useFmt();
  const home = useBusinessConnectHome();
  const [filter, setFilter] = useState<Filter>("all");

  const [createMeetingOpen, setCreateMeetingOpen] = useState(false);
  const [meetingHistory, setMeetingHistory] = useState<MeetingRecord[]>(() => getMeetingHistory());
  const [savedEvents, setSavedEvents] = useState<SavedCalendarEvent[]>(() => getSavedCalendarEvents());

  // Lắng nghe thay đổi từ các modal sự kiện khác
  useEffect(() => {
    const handleUpdate = () => {
      setSavedEvents(getSavedCalendarEvents());
      setMeetingHistory(getMeetingHistory());
    };
    window.addEventListener("vione:calendar-updated", handleUpdate);
    return () => window.removeEventListener("vione:calendar-updated", handleUpdate);
  }, []);

  // Lấy danh sách sự kiện từ backend /events để kiểm tra các sự kiện đã đăng ký
  const [crmEvents, setCrmEvents] = useState<CrmEvent[]>([]);
  useEffect(() => {
    let active = true;
    fetchNestApi<any[]>("/events")
      .then((res) => {
        if (active && Array.isArray(res)) {
          setCrmEvents(res);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  // Modal xem chi tiết sự kiện khi bấm từ lịch
  const [selectedEvent, setSelectedEvent] = useState<CrmEvent | null>(null);
  const [isEventSheetOpen, setIsEventSheetOpen] = useState(false);

  // Chuyển đổi sự kiện đã lưu, cuộc họp đã lên lịch và sự kiện đã đăng ký thành TodayItem
  const eventItems: BcMobileTodayItem[] = useMemo(() => {
    const list: BcMobileTodayItem[] = [];
    const seenIds = new Set<string>();

    // 1. Thêm các cuộc gặp từ lịch sử / lịch hẹn
    for (const m of meetingHistory) {
      const startsAt = `${m.date}T${m.time || "09:00"}:00`;
      list.push({
        id: `meeting:${m.id}`,
        kind: "meeting",
        titleKey: m.title,
        descriptionKey: `${m.venueType === "online" ? "Họp trực tuyến" : m.venue || "Gặp trực tiếp"} · ${m.partnerName}`,
        startsAt,
        dueAt: startsAt,
        category: "upcoming",
        urgency: "normal",
        counterpartDisplayName: m.partnerName,
        action: {
          labelKey: "bc.workHub.action.view",
          targetRoute: null,
          targetParams: null,
          targetSearch: null,
          canRoute: false,
        },
      });
    }

    // 2. Thêm sự kiện đã lưu
    for (const s of savedEvents) {
      seenIds.add(s.id);
      list.push({
        id: `event:${s.id}`,
        kind: "calendar",
        titleKey: s.title,
        descriptionKey: s.location || (s.isOnline ? "Sự kiện trực tuyến" : "Sự kiện kết nối"),
        startsAt: s.startsAt,
        dueAt: s.startsAt,
        category: "upcoming",
        urgency: "normal",
        counterpartDisplayName: s.organizer || "ViOne Event",
        action: {
          labelKey: "bc.workHub.action.view",
          targetRoute: null,
          targetParams: null,
          targetSearch: null,
          canRoute: false,
        },
      });
    }

    for (const e of crmEvents) {
      if (seenIds.has(e.id)) continue;
      const isReg =
        (typeof window !== "undefined" && localStorage.getItem(`bc_event_reg_${e.id}`) === "true") ||
        (e as any).registered;
      if (isReg) {
        seenIds.add(e.id);
        const startsAt = e.date || (e as any).startDate || new Date().toISOString();
        list.push({
          id: `event:${e.id}`,
          kind: "calendar",
          titleKey: e.title || (e as any).name || "Sự kiện doanh nghiệp",
          descriptionKey: e.location || (e.type === "online" ? "Sự kiện trực tuyến" : "Sự kiện trực tiếp"),
          startsAt,
          dueAt: startsAt,
          category: "upcoming",
          urgency: "normal",
          counterpartDisplayName: e.associationName || (e as any).communityName || "ViOne Event",
          action: {
            labelKey: "bc.workHub.action.view",
            targetRoute: "/events/$eventId",
            targetParams: { eventId: String(e.id) },
            targetSearch: null,
            canRoute: true,
          },
        });
      }
    }

    return list;
  }, [savedEvents, crmEvents, meetingHistory]);

  // Hợp nhất dữ liệu: Work Hub hôm nay + Toàn bộ sự kiện đã lưu và đăng ký
  const pool = useMemo(() => {
    const homePool = home.data?.today.pool ?? [];
    return [...eventItems, ...homePool];
  }, [eventItems, home.data?.today.pool]);

  const dataError = home.data?.today.status === "error";

  const { groups, undated } = useMemo(() => {
    const filtered = pool.filter((i) => matchesFilter(i, filter));
    const map = new Map<string, { date: Date; items: BcMobileTodayItem[] }>();
    const noDate: BcMobileTodayItem[] = [];
    for (const item of filtered) {
      const d = itemDate(item);
      if (!d) {
        noDate.push(item);
        continue;
      }
      const key = dayKey(d);
      const bucket = map.get(key);
      if (bucket) bucket.items.push(item);
      else map.set(key, { date: d, items: [item] });
    }
    const sorted = [...map.values()].sort((a, b) => a.date.getTime() - b.date.getTime());
    for (const g of sorted) {
      g.items.sort((a, b) => {
        const da = itemDate(a)?.getTime() ?? 0;
        const db = itemDate(b)?.getTime() ?? 0;
        return da - db;
      });
    }
    return { groups: sorted, undated: noDate };
  }, [pool, filter]);

  const total = groups.reduce((n, g) => n + g.items.length, 0) + undated.length;

  function dayLabel(date: Date): string {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    if (dayKey(date) === dayKey(today)) return t("bc.mobile.calendar.day.today");
    if (dayKey(date) === dayKey(tomorrow)) return t("bc.mobile.calendar.day.tomorrow");
    return date.toLocaleDateString(fmt.locale, {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  }

  const handleSelectItem = (item: BcMobileTodayItem) => {
    if (item.id.startsWith("event:")) {
      const eventId = item.id.replace(/^event:/, "");
      const matched = crmEvents.find((e) => e.id === eventId);
      const savedMatched = savedEvents.find((s: SavedCalendarEvent) => s.id === eventId);
      if (matched) {
        setSelectedEvent(matched);
      } else if (savedMatched) {
        setSelectedEvent({
          id: savedMatched.id,
          title: savedMatched.title,
          date: savedMatched.startsAt,
          location: savedMatched.location || "ViOne Center",
          type: savedMatched.isOnline ? "online" : "offline",
          associationName: savedMatched.organizer,
          description: savedMatched.description,
        });
      }
      setIsEventSheetOpen(true);
    }
  };

  return (
    <div className="pt-5 pb-12">
      <section className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <span
            aria-hidden="true"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[var(--bc-mobile-border-gold)] text-[var(--bc-mobile-accent)] bg-[var(--bc-mobile-surface-2)]"
          >
            <CalendarDays className="h-[18px] w-[18px]" strokeWidth={1.6} />
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="text-[20px] font-semibold leading-tight text-[var(--bc-mobile-text)]">
              {t("bc.mobile.calendar.title")}
            </h1>
            <p className="mt-0.5 text-[12.5px] text-[var(--bc-mobile-muted)] truncate">
              Lịch cuộc gặp, việc cần theo dõi và sự kiện đã lưu.
            </p>
          </div>
        </div>

        {/* Nút Tạo cuộc gặp */}
        <button
          type="button"
          onClick={() => setCreateMeetingOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-full bg-[linear-gradient(135deg,#F6E1C3_0%,#D8B282_45%,#C29B69_70%,#8C653B_100%)] text-[#050c15] px-3.5 py-2 text-xs font-bold shadow-md cursor-pointer hover:brightness-105 active:scale-95 transition-all shrink-0"
        >
          <Plus className="h-4 w-4 text-[#050c15]" strokeWidth={2.2} />
          <span>Tạo cuộc gặp</span>
        </button>
      </section>

      {/* Bộ lọc tab */}
      <div
        role="tablist"
        aria-label={t("bc.mobile.calendar.filter.label")}
        className="mt-4 flex flex-wrap gap-2"
      >
        {FILTERS.map((f) => {
          const active = filter === f.id;
          return (
            <button
              key={f.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setFilter(f.id)}
              style={active ? { background: "var(--bc-mobile-accent-grad)" } : undefined}
              className={`inline-flex min-h-[34px] items-center rounded-full px-3.5 text-[12.5px] font-semibold transition-all cursor-pointer ${
                active
                  ? "text-[#050c15] shadow-xs"
                  : "border border-[var(--bc-mobile-border)] bg-[var(--bc-mobile-surface-2)] text-slate-400 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {f.label}
              {f.id === "history" && meetingHistory.length > 0 && (
                <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#050c15]/15">
                  {meetingHistory.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* View Lịch sử cuộc gặp riêng biệt khi chọn tab history */}
      {filter === "history" ? (
        <div className="mt-5 space-y-3.5">
          {meetingHistory.length === 0 ? (
            <div className="rounded-3xl border border-[var(--bc-mobile-border)] bg-[var(--bc-mobile-surface)] p-8 text-center">
              <CalendarPlus className="mx-auto h-10 w-10 text-[var(--bc-mobile-muted)] mb-2" />
              <p className="text-sm font-bold text-[var(--bc-mobile-text)]">
                Chưa có lịch sử cuộc gặp nào
              </p>
              <p className="mt-1 text-xs text-[var(--bc-mobile-muted)]">
                Các cuộc gặp đã tạo hoặc ghi nhận sẽ được lưu giữ đầy đủ tại đây.
              </p>
              <button
                type="button"
                onClick={() => setCreateMeetingOpen(true)}
                className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[linear-gradient(135deg,#F6E1C3_0%,#D8B282_45%,#C29B69_70%,#8C653B_100%)] text-[#050c15] px-4 py-2 text-xs font-bold shadow-md cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5 text-[#050c15]" />
                <span>Lên lịch cuộc gặp đầu tiên</span>
              </button>
            </div>
          ) : (
            meetingHistory.map((m) => (
              <div
                key={m.id}
                className="rounded-2xl border border-[var(--bc-mobile-border)] bg-[var(--bc-mobile-surface)] p-4 shadow-xs hover:border-[var(--bc-mobile-border-gold)] transition-all"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[var(--bc-mobile-accent-soft)] text-[var(--bc-mobile-accent)]">
                    <Clock className="h-3 w-3" />
                    <span>{m.date} · {m.time}</span>
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10.5px] font-bold ${
                    m.isAgreed ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                  }`}>
                    {m.isAgreed ? "Đồng ý gặp" : "Chờ xác nhận"}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-[var(--bc-mobile-text)]">
                  {m.title}
                </h3>

                <div className="mt-2 space-y-1 text-xs text-[var(--bc-mobile-muted)]">
                  <p className="flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-[var(--bc-mobile-accent)]" />
                    <span className="font-semibold text-[var(--bc-mobile-text)]">{m.partnerName}</span>
                    {m.partnerPhone && <span>({m.partnerPhone})</span>}
                  </p>
                  <p className="flex items-center gap-1.5">
                    {m.venueType === "online" ? (
                      <Video className="h-3.5 w-3.5 text-[var(--bc-mobile-accent)]" />
                    ) : (
                      <MapPin className="h-3.5 w-3.5 text-[var(--bc-mobile-accent)]" />
                    )}
                    <span>{m.venueType === "online" ? "Họp trực tuyến" : m.venue || "Gặp trực tiếp"}</span>
                  </p>
                  <p className="flex items-center gap-1.5 text-[11.5px] text-[var(--bc-mobile-accent)]">
                    <Bell className="h-3.5 w-3.5" />
                    <span>
                      {m.reminderTier === 1
                        ? "Báo thức: 1 lần (Trước 15 phút)"
                        : m.reminderTier === 2
                          ? "Báo thức: 2 lần (Trước 1 tiếng & Trước 15 phút)"
                          : m.reminderTier === 3
                            ? "Báo thức: 3 lần (Trước 1 ngày, 2 tiếng & 15 phút)"
                            : "Báo thức liên tục (Trước 1 ngày, sáng hẹn, 1 tiếng & 10p)"}
                    </span>
                  </p>
                  {m.notes && (
                    <p className="mt-1.5 p-2 rounded-xl bg-[var(--bc-mobile-surface-2)] text-[11.5px] italic text-[var(--bc-mobile-text)]">
                      "{m.notes}"
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <>
          <p aria-live="polite" className="mt-3 text-[12px] text-[var(--bc-mobile-muted)]">
            {home.isPending && eventItems.length === 0
              ? t("bc.mobile.calendar.loading")
              : t("bc.mobile.calendar.count", { count: total })}
          </p>

          {home.isError && dataError && eventItems.length === 0 ? (
            <section role="alert" className="mt-6 text-center">
              <p className="text-[13.5px] text-[var(--bc-mobile-muted)]">
                {t("bc.mobile.calendar.error")}
              </p>
              <button
                type="button"
                onClick={() => void home.refetch()}
                className="mt-3 inline-flex min-h-[44px] items-center gap-2 rounded-full border border-[var(--bc-mobile-border-gold)] px-4 text-[13px] font-medium text-[var(--bc-mobile-accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bc-mobile-accent)]"
              >
                <RefreshCw aria-hidden="true" className="h-4 w-4" strokeWidth={1.8} />
                {t("bc.mobile.calendar.retry")}
              </button>
            </section>
          ) : total === 0 ? (
            <section className="mt-8 rounded-3xl border border-[var(--bc-mobile-border)] bg-[var(--bc-mobile-surface)] p-6 text-center">
              <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-[var(--bc-mobile-surface-2)] border border-[var(--bc-mobile-border)] text-[var(--bc-mobile-accent)]">
                <CalendarPlus className="h-6 w-6" strokeWidth={1.5} />
              </div>
              <p className="text-[15px] font-bold text-[var(--bc-mobile-text)]">
                Chưa có lịch hẹn hoặc sự kiện nào
              </p>
              <p className="mt-1.5 text-[13px] leading-relaxed text-[var(--bc-mobile-muted)] max-w-xs mx-auto">
                Khi bạn lưu sự kiện hoặc thiết lập lịch hẹn công việc, mọi kế hoạch sẽ hiển thị gọn gàng tại đây.
              </p>
              <button
                type="button"
                onClick={() => setCreateMeetingOpen(true)}
                className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[linear-gradient(135deg,#F6E1C3_0%,#D8B282_45%,#C29B69_70%,#8C653B_100%)] text-[#050c15] px-4 py-2 text-xs font-bold shadow-md cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5 text-[#050c15]" />
                <span>Tạo cuộc gặp ngay</span>
              </button>
            </section>
          ) : (
            <div className="mt-5 space-y-7">
              {groups.map((g) => (
                <section key={dayKey(g.date)}>
                  <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--bc-mobile-accent)]">
                    {dayLabel(g.date)}
                  </h2>
                  <ul className="mt-3 space-y-3 border-l-2 border-[var(--bc-mobile-border-gold)] pl-3.5">
                    {g.items.map((item) => (
                      <TodayItem key={item.id} item={item} onSelect={handleSelectItem} />
                    ))}
                  </ul>
                </section>
              ))}

              {undated.length > 0 ? (
                <section>
                  <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--bc-mobile-muted)]">
                    {t("bc.mobile.calendar.undated")}
                  </h2>
                  <ul className="mt-3 space-y-3 border-l-2 border-[var(--bc-mobile-border)] pl-3.5">
                    {undated.map((item) => (
                      <TodayItem key={item.id} item={item} onSelect={handleSelectItem} />
                    ))}
                  </ul>
                </section>
              ) : null}
            </div>
          )}
        </>
      )}

      {/* Sheet xem chi tiết sự kiện khi bấm từ lịch */}
      {selectedEvent && (
        <EventDetailMobileSheet
          open={isEventSheetOpen}
          onOpenChange={setIsEventSheetOpen}
          event={selectedEvent}
          onRegisteredChange={() => {
            setSavedEvents(getSavedCalendarEvents());
          }}
        />
      )}

      {/* Modal Tạo cuộc gặp & Báo thức nhắc nhở */}
      {createMeetingOpen && (
        <CreateMeetingModal
          onClose={() => setCreateMeetingOpen(false)}
          onSuccess={() => {
            setCreateMeetingOpen(false);
            setMeetingHistory(getMeetingHistory());
            setSavedEvents(getSavedCalendarEvents());
            toast.success("✓ Đã lên lịch cuộc gặp và thiết lập báo thức thành công!");
          }}
        />
      )}
    </div>
  );
}

function CreateMeetingModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [title, setTitle] = useState("");
  const [partnerName, setPartnerName] = useState("");
  const [partnerPhone, setPartnerPhone] = useState("");
  const [isAgreed, setIsAgreed] = useState(true);
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [time, setTime] = useState("09:30");
  const [venueType, setVenueType] = useState<"offline" | "online">("offline");
  const [venue, setVenue] = useState("Trụ sở doanh nghiệp / Quán Cafe");
  const [reminderTier, setReminderTier] = useState<1 | 2 | 3 | 4>(2);
  const [notes, setNotes] = useState("");
  const [conflictModalData, setConflictModalData] = useState<{
    type: "both" | "time" | "location";
    primaryMeeting: any;
  } | null>(null);

  const detectConflict = () => {
    const history = getMeetingHistory();
    const events = getSavedCalendarEvents();
    const all = [...history, ...events];
    const targetDateClean = date.slice(0, 10);
    const targetMin = (() => {
      const [h, m] = time.split(":").map(Number);
      return isNaN(h) ? null : h * 60 + (isNaN(m) ? 0 : m);
    })();
    const targetLocClean = venue.trim().toLowerCase();

    let timeConflict: any = null;
    let locConflict: any = null;

    for (const m of all) {
      if (!m) continue;
      const mDate = String((m as any).date || (m as any).startsAt || "").slice(0, 10);
      if (mDate !== targetDateClean) continue;

      const mTime =
        (m as any).time ||
        ((m as any).startsAt && (m as any).startsAt.includes("T")
          ? (m as any).startsAt.split("T")[1]?.slice(0, 5)
          : "");
      let isTimeOverlap = false;
      if (mTime && targetMin !== null) {
        const [mh, mm] = mTime.split(":").map(Number);
        if (!isNaN(mh)) {
          const mMin = mh * 60 + (isNaN(mm) ? 0 : mm);
          if (Math.abs(mMin - targetMin) < 60) isTimeOverlap = true;
        }
      } else if (mTime && time && mTime === time) {
        isTimeOverlap = true;
      }

      let isLocOverlap = false;
      if (venueType === "offline") {
        const mLoc = String((m as any).venue || (m as any).location || "").trim().toLowerCase();
        const isOnline =
          mLoc.includes("online") ||
          mLoc.includes("trực tuyến") ||
          mLoc.includes("meet") ||
          mLoc.includes("http");
        if (!isOnline && mLoc.length > 3 && targetLocClean.length > 3) {
          if (
            mLoc === targetLocClean ||
            mLoc.includes(targetLocClean) ||
            targetLocClean.includes(mLoc)
          ) {
            isLocOverlap = true;
          }
        }
      }

      if (isTimeOverlap && isLocOverlap) {
        return { type: "both" as const, primaryMeeting: m };
      }
      if (isTimeOverlap && !timeConflict) timeConflict = m;
      if (isLocOverlap && !locConflict) locConflict = m;
    }

    if (timeConflict && locConflict) return { type: "both" as const, primaryMeeting: timeConflict };
    if (timeConflict) return { type: "time" as const, primaryMeeting: timeConflict };
    if (locConflict) return { type: "location" as const, primaryMeeting: locConflict };
    return null;
  };

  const handleSave = (force = false) => {
    if (!title.trim() || !partnerName.trim()) {
      toast.error("Vui lòng nhập tiêu đề cuộc gặp và tên đối tác!");
      return;
    }

    if (!force) {
      const conflict = detectConflict();
      if (conflict) {
        setConflictModalData(conflict);
        return;
      }
    }

    const meetingId = `meet_${Date.now()}`;
    const newRecord: MeetingRecord = {
      id: meetingId,
      title: title.trim(),
      partnerName: partnerName.trim(),
      partnerPhone: partnerPhone.trim() || undefined,
      isAgreed,
      date,
      time,
      venueType,
      venue: venueType === "online" ? "Họp trực tuyến" : venue.trim(),
      reminderTier,
      notes: notes.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    saveMeetingRecord(newRecord);

    // Lưu vào calendar storage để xuất hiện trên timeline
    saveCalendarEvent({
      id: `meeting_${meetingId}`,
      title: title.trim(),
      startsAt: `${date}T${time}:00`,
      location: venueType === "online" ? "Họp trực tuyến (ViOne Meet)" : venue.trim(),
      description: `Gặp đối tác ${partnerName.trim()} (${isAgreed ? "Đồng ý gặp" : "Chờ xác nhận"}). Báo thức: ${reminderTier} lần nhắc.`,
      organizer: partnerName.trim(),
      isOnline: venueType === "online",
    });

    setConflictModalData(null);
    toast.success("✓ Đã lên lịch cuộc gặp thành công!");
    onSuccess();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl border border-[var(--bc-mobile-border)] bg-[var(--bc-mobile-surface)] p-5 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--bc-mobile-border)]">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-full bg-[var(--bc-mobile-accent-soft)] text-[var(--bc-mobile-accent)]">
              <CalendarPlus className="h-4 w-4" />
            </span>
            <h3 className="text-base font-bold text-[var(--bc-mobile-text)]">
              Tạo cuộc gặp & Báo thức nhắc
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full bg-[var(--bc-mobile-surface-2)] text-[var(--bc-mobile-muted)] hover:text-[var(--bc-mobile-text)] cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 space-y-3.5">
          {/* Tiêu đề cuộc gặp */}
          <div>
            <label className="text-xs font-semibold text-[var(--bc-mobile-muted)]">
              Chủ đề / Mục đích cuộc gặp *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Trao đổi cơ hội hợp tác cung ứng..."
              className="mt-1 w-full rounded-xl border border-[var(--bc-mobile-border)] bg-[var(--bc-mobile-surface-2)] px-3.5 py-2.5 text-xs sm:text-sm text-[var(--bc-mobile-text)] focus:border-[var(--bc-mobile-border-gold)] outline-none"
            />
          </div>

          {/* Người muốn gặp / Người đồng ý gặp */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[var(--bc-mobile-muted)]">
                Người muốn gặp / Đối tác *
              </label>
              <input
                type="text"
                value={partnerName}
                onChange={(e) => setPartnerName(e.target.value)}
                placeholder="Nhập tên đối tác..."
                className="mt-1 w-full rounded-xl border border-[var(--bc-mobile-border)] bg-[var(--bc-mobile-surface-2)] px-3.5 py-2.5 text-xs sm:text-sm text-[var(--bc-mobile-text)] focus:border-[var(--bc-mobile-border-gold)] outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[var(--bc-mobile-muted)]">
                Số điện thoại đối tác
              </label>
              <input
                type="tel"
                value={partnerPhone}
                onChange={(e) => setPartnerPhone(e.target.value)}
                placeholder="09xx xxx xxx"
                className="mt-1 w-full rounded-xl border border-[var(--bc-mobile-border)] bg-[var(--bc-mobile-surface-2)] px-3.5 py-2.5 text-xs sm:text-sm text-[var(--bc-mobile-text)] focus:border-[var(--bc-mobile-border-gold)] outline-none"
              />
            </div>
          </div>

          {/* Trạng thái xác nhận */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsAgreed(true)}
              className={`flex-1 py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                isAgreed
                  ? "bg-[var(--bc-mobile-accent-soft)] text-[var(--bc-mobile-accent)] border-[var(--bc-mobile-border-gold)] font-bold"
                  : "border-[var(--bc-mobile-border)] text-[var(--bc-mobile-muted)] bg-[var(--bc-mobile-surface-2)]"
              }`}
            >
              ✓ Người đồng ý gặp (Đã thống nhất)
            </button>
            <button
              type="button"
              onClick={() => setIsAgreed(false)}
              className={`flex-1 py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                !isAgreed
                  ? "bg-[var(--bc-mobile-accent-soft)] text-[var(--bc-mobile-accent)] border-[var(--bc-mobile-border-gold)] font-bold"
                  : "border-[var(--bc-mobile-border)] text-[var(--bc-mobile-muted)] bg-[var(--bc-mobile-surface-2)]"
              }`}
            >
              ⏳ Lên lịch hẹn mới (Chờ xác nhận)
            </button>
          </div>

          {/* Ngày & Giờ */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[var(--bc-mobile-muted)]">
                Ngày hẹn
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1 w-full rounded-xl border border-[var(--bc-mobile-border)] bg-[var(--bc-mobile-surface-2)] px-3.5 py-2.5 text-xs sm:text-sm text-[var(--bc-mobile-text)] focus:border-[var(--bc-mobile-border-gold)] outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[var(--bc-mobile-muted)]">
                Giờ hẹn
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="mt-1 w-full rounded-xl border border-[var(--bc-mobile-border)] bg-[var(--bc-mobile-surface-2)] px-3.5 py-2.5 text-xs sm:text-sm text-[var(--bc-mobile-text)] focus:border-[var(--bc-mobile-border-gold)] outline-none"
              />
            </div>
          </div>

          {/* Hình thức & Địa điểm */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-[var(--bc-mobile-muted)]">
                Hình thức & Địa điểm
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setVenueType("offline")}
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-md cursor-pointer ${
                    venueType === "offline"
                      ? "bg-[var(--bc-mobile-accent)] text-black"
                      : "text-[var(--bc-mobile-muted)]"
                  }`}
                >
                  Trực tiếp
                </button>
                <button
                  type="button"
                  onClick={() => setVenueType("online")}
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-md cursor-pointer ${
                    venueType === "online"
                      ? "bg-[var(--bc-mobile-accent)] text-black"
                      : "text-[var(--bc-mobile-muted)]"
                  }`}
                >
                  Online
                </button>
              </div>
            </div>
            {venueType === "offline" ? (
              <input
                type="text"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                placeholder="Địa chỉ quán cafe / văn phòng..."
                className="w-full rounded-xl border border-[var(--bc-mobile-border)] bg-[var(--bc-mobile-surface-2)] px-3.5 py-2.5 text-xs sm:text-sm text-[var(--bc-mobile-text)] focus:border-[var(--bc-mobile-border-gold)] outline-none"
              />
            ) : (
              <input
                type="text"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                placeholder="Dán link Zoom / Google Meet..."
                className="w-full rounded-xl border border-[var(--bc-mobile-border)] bg-[var(--bc-mobile-surface-2)] px-3.5 py-2.5 text-xs sm:text-sm text-[var(--bc-mobile-text)] focus:border-[var(--bc-mobile-border-gold)] outline-none"
              />
            )}
          </div>

          {/* Cài đặt Báo thức nhắc nhở nâng cao */}
          <div className="rounded-2xl border border-[var(--bc-mobile-border)] bg-[var(--bc-mobile-surface-2)] p-3.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--bc-mobile-accent)] mb-2">
              <Bell className="h-4 w-4" />
              <span>Chế độ báo thức nhắc nhở (Multi-Alarm)</span>
            </div>
            <div className="space-y-2">
              {[
                { tier: 1, label: "Nhắc 1 lần", desc: "Trước giờ hẹn 15 phút" },
                { tier: 2, label: "Nhắc 2 lần (Khuyên dùng)", desc: "Trước 1 tiếng & trước 15 phút" },
                { tier: 3, label: "Nhắc 3 lần", desc: "Trước 1 ngày, 2 tiếng & 15 phút" },
                { tier: 4, label: "Báo thức liên tục", desc: "Trước 1 ngày, sáng hẹn, 1 tiếng & 10 phút" },
              ].map((item) => (
                <button
                  key={item.tier}
                  type="button"
                  onClick={() => setReminderTier(item.tier as any)}
                  className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                    reminderTier === item.tier
                      ? "border-[var(--bc-mobile-border-gold)] bg-[var(--bc-mobile-surface)] text-[var(--bc-mobile-text)] shadow-xs"
                      : "border-transparent text-[var(--bc-mobile-muted)] hover:bg-[var(--bc-mobile-surface)]/50"
                  }`}
                >
                  <div>
                    <span className="block text-xs font-bold text-[var(--bc-mobile-text)]">
                      {item.label}
                    </span>
                    <span className="block text-[11px] text-[var(--bc-mobile-muted)]">
                      {item.desc}
                    </span>
                  </div>
                  {reminderTier === item.tier && (
                    <CheckCircle2 className="h-4 w-4 text-[var(--bc-mobile-accent)] shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Ghi chú */}
          <div>
            <label className="text-xs font-semibold text-[var(--bc-mobile-muted)]">
              Ghi chú nội dung trao đổi
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Nội dung cần chuẩn bị trước khi gặp..."
              className="mt-1 w-full rounded-xl border border-[var(--bc-mobile-border)] bg-[var(--bc-mobile-surface-2)] p-3 text-xs sm:text-sm text-[var(--bc-mobile-text)] focus:border-[var(--bc-mobile-border-gold)] outline-none resize-none"
            />
          </div>
        </div>

        <div className="mt-5 flex items-center gap-2 pt-2 border-t border-[var(--bc-mobile-border)]">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-full border border-[var(--bc-mobile-border)] text-xs font-semibold text-[var(--bc-mobile-muted)] hover:text-[var(--bc-mobile-text)] cursor-pointer"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={() => handleSave(false)}
            className="flex-1 py-2.5 rounded-full bg-[linear-gradient(135deg,#F6E1C3_0%,#D8B282_45%,#C29B69_70%,#8C653B_100%)] text-[#050c15] text-xs font-bold shadow-md cursor-pointer hover:brightness-105 active:scale-98 transition-all"
          >
            Lên lịch cuộc gặp
          </button>
        </div>
      </div>

      {/* Popup cảnh báo trùng lịch */}
      {conflictModalData && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/75 p-4 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl border border-amber-500/40 bg-[var(--bc-mobile-surface)] p-5 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-500 ring-8 ring-amber-500/10">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-500 border border-amber-500/30 mb-1">
                  {conflictModalData.type === "both"
                    ? "Trùng cả giờ & địa điểm"
                    : conflictModalData.type === "time"
                    ? "Trùng thời gian"
                    : "Trùng địa điểm trực tiếp"}
                </span>
                <h4 className="text-sm font-bold text-[var(--bc-mobile-text)]">
                  Cảnh báo trùng lịch cuộc gặp
                </h4>
                <p className="text-xs text-[var(--bc-mobile-muted)] mt-0.5">
                  Đang trùng với cuộc gặp: <strong className="text-[var(--bc-mobile-text)]">{conflictModalData.primaryMeeting.title}</strong>
                </p>
              </div>
            </div>

            <div className="mt-3.5 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-900 dark:text-amber-200">
              <p className="font-semibold flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
                Bạn có chắc chắn muốn lên lịch trùng và đảm bảo có thể tham gia được không?
              </p>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setConflictModalData(null)}
                className="flex-1 py-2 rounded-xl border border-[var(--bc-mobile-border)] text-xs font-semibold text-[var(--bc-mobile-muted)] hover:text-[var(--bc-mobile-text)]"
              >
                Quay lại chỉnh sửa
              </button>
              <button
                type="button"
                onClick={() => handleSave(true)}
                className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold shadow-md flex items-center justify-center gap-1"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Tôi đảm bảo tham gia
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
