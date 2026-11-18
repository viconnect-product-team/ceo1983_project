import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import React, { useState, useEffect, useMemo, useRef } from "react";
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
  XCircle,
  Loader2,
  AlertCircle,
  Video,
  Coffee,
  Briefcase,
  Ticket,
  Handshake,
  Check,
  CalendarCheck,
  Search,
  Grid3X3,
  List as ListIcon,
  CalendarDays,
  Camera,
  ImagePlus,
  BookOpen,
  FileText,
  Trash2,
  Maximize2,
  Timer,
  Save,
  Share2,
  GraduationCap,
  TrendingUp,
  CheckCheck,
  Eye,
} from "lucide-react";
import { MemberHeader } from "@/components/member/MemberShell";
import { useAuth } from "@/context/AuthContext";
import { resolveMediaUrl, fetchNestApi, uploadFileToNest } from "@/lib/api-client";
import { formatDisplayDate } from "@/lib/date-format";
import { toast } from "sonner";
import { CreateConnectionModal } from "@/components/member/CreateConnectionModal";

export const Route = createFileRoute("/association/calendar")({
  component: CalendarScreen,
});

export type CalendarItemType =
  | "event"
  | "meeting_committee"
  | "meeting_1on1"
  | "training"
  | "opportunity";

export interface ActivityPhoto {
  id: string;
  url: string;
  createdAt: string;
  name?: string;
}

export interface DiaryNote {
  note: string;
  updatedAt: string;
}

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
    type: "training",
    title: "Chuyên đề Đào tạo: Chuyển đổi số & AI cho Doanh nghiệp 1983",
    categoryLabel: "Chương trình Đào tạo",
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
    type: "opportunity",
    title: "Phiên Chia Sẻ Cơ Hội Kinh Doanh & Khớp Lệnh B2B",
    categoryLabel: "Chia sẻ Cơ hội",
    date: new Date().toISOString().split("T")[0],
    time: "08:30 - 10:30",
    location: "Trung tâm Hội nghị Quốc gia NCC, Cầu Giấy, Hà Nội",
    isOnline: false,
    organizer: "Ban XTTM",
    status: "confirmed",
    description: "Khớp lệnh nhu cầu cung - ứng giữa 50 doanh nghiệp thành viên CLB CEO 1983.",
  },
];

export function CalendarScreen() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Main Tab: "schedule" (Lịch trình) vs "diary" (Nhật ký ở lịch)
  const [activeMainTab, setActiveMainTab] = useState<"schedule" | "diary">("schedule");

  // View Mode for Month: "month_grid" (Lưới tháng) | "month_list" (Dạng list tháng) | "strip" (Dải 14 ngày)
  const [viewMode, setViewMode] = useState<"month_grid" | "month_list" | "strip">("month_grid");

  // Month navigation: current active month
  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(() => new Date());

  // Active filter tab
  const [filterType, setFilterType] = useState<
    "ALL" | "EVENT" | "MEETING_COMMITTEE" | "MEETING_1ON1" | "TRAINING" | "OPPORTUNITY"
  >("ALL");

  const [selectedDate, setSelectedDate] = useState<string | null>(null); // YYYY-MM-DD or null
  const [searchQuery, setSearchQuery] = useState("");
  const [createConnectModalOpen, setCreateConnectModalOpen] = useState(false);

  // Realtime clock ticker for countdowns
  const [currentTimeMs, setCurrentTimeMs] = useState<number>(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTimeMs(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Reminder settings modal
  const [reminderModalTarget, setReminderModalTarget] = useState<CalendarItem | null>(null);

  // Cancel 1-on-1 appointment modal state
  const [cancelling1on1Target, setCancelling1on1Target] = useState<CalendarItem | null>(null);
  const [cancel1on1Reason, setCancel1on1Reason] = useState("");
  const [submittingCancel1on1, setSubmittingCancel1on1] = useState(false);

  // Diary Notes Modal state
  const [editingNoteItem, setEditingNoteItem] = useState<CalendarItem | null>(null);
  const [noteDraftText, setNoteDraftText] = useState("");

  // Lightbox preview for photos
  const [lightboxPhotoUrl, setLightboxPhotoUrl] = useState<string | null>(null);

  // Uploading state
  const [uploadingForItemId, setUploadingForItemId] = useState<string | null>(null);

  // Reminders state stored in localStorage
  const [reminders, setReminders] = useState<Record<string, ReminderConfig>>(() => {
    if (typeof window === "undefined") return {};
    try {
      const stored = localStorage.getItem("vba_calendar_reminders");
      if (stored) return JSON.parse(stored);
    } catch {}
    return {};
  });

  // Photos for activities stored in localStorage
  const [activityPhotosMap, setActivityPhotosMap] = useState<Record<string, ActivityPhoto[]>>(() => {
    if (typeof window === "undefined") return {};
    try {
      const stored = localStorage.getItem("vba_calendar_activity_media");
      if (stored) return JSON.parse(stored);
    } catch {}
    return {};
  });

  // Diary notes for activities stored in localStorage
  const [diaryNotesMap, setDiaryNotesMap] = useState<Record<string, DiaryNote>>(() => {
    if (typeof window === "undefined") return {};
    try {
      const stored = localStorage.getItem("vba_calendar_diary_notes");
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

  // Sync activity photos to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("vba_calendar_activity_media", JSON.stringify(activityPhotosMap));
    } catch {}
  }, [activityPhotosMap]);

  // Sync diary notes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("vba_calendar_diary_notes", JSON.stringify(diaryNotesMap));
    } catch {}
  }, [diaryNotesMap]);

  // Helper: compute start time in ms
  const getItemStartMs = (item: CalendarItem): number => {
    try {
      const timePart = item.time ? item.time.split("-")[0].trim() : "00:00";
      const [hStr, mStr] = timePart.split(":");
      const h = parseInt(hStr || "0", 10);
      const m = parseInt(mStr || "0", 10);
      const d = new Date(item.date);
      d.setHours(isNaN(h) ? 0 : h, isNaN(m) ? 0 : m, 0, 0);
      const ms = d.getTime();
      return isNaN(ms) ? Date.now() : ms;
    } catch {
      return Date.now();
    }
  };

  // Helper: Format countdown string
  const formatCountdown = (startMs: number, nowMs: number) => {
    const diff = startMs - nowMs;
    if (diff <= 0) return "Đang diễn ra";
    const totalSec = Math.floor(diff / 1000);
    const days = Math.floor(totalSec / 86400);
    const hours = Math.floor((totalSec % 86400) / 3600);
    const minutes = Math.floor((totalSec % 3600) / 60);
    const seconds = totalSec % 60;
    if (days > 0) return `${days} ngày ${hours} giờ`;
    if (hours > 0) return `${hours} giờ ${minutes} phút`;
    return `${minutes} phút ${seconds}s`;
  };

  // ── LOAD ONLY REGISTERED EVENTS, CONFIRMED B2B, MEETINGS, TRAININGS & OPPORTUNITIES ──
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
          // Check registered events in localStorage
          const localEventsRaw = localStorage.getItem("vba_registered_events");
          if (localEventsRaw) {
            const list = JSON.parse(localEventsRaw);
            if (Array.isArray(list) && list.length > 0) {
              combined.push(
                ...list.map((e: any) => ({
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
                }))
              );
            }
          }
        }
      } catch {}

      // 2. Load 1-on-1 appointments (CHỈ lưu và hiển thị vào Lịch khi đối phương ĐÃ ĐỒNG Ý)
      try {
        const stored1on1 = localStorage.getItem("vba_connection_appointments");
        if (stored1on1) {
          const list = JSON.parse(stored1on1);
          if (Array.isArray(list) && list.length > 0) {
            // LỌC NGHIÊM NGẶT: Chỉ hiển thị khi status === "confirmed" hoặc "accepted"
            const acceptedList = list.filter(
              (a: any) => a.status === "confirmed" || a.status === "accepted"
            );
            const mapped1on1: CalendarItem[] = acceptedList.map((a: any, idx: number) => ({
              id: a.id || `app-${idx}`,
              type: "meeting_1on1",
              title: a.title || "Gặp gỡ kết nối 1-on-1",
              categoryLabel: "Gặp B2B",
              date: a.date ? a.date.split("T")[0] : new Date().toISOString().split("T")[0],
              time: a.time || "14:30 - 16:00",
              location: a.venue || a.location || "Highlands Coffee Cầu Giấy, Hà Nội",
              isOnline: a.venueType === "online" || Boolean(a.onlineUrl),
              onlineLink: a.onlineUrl,
              partnerName: a.partnerName || a.hostName || "Hội viên CLB",
              partnerCompany: a.partnerCompany || a.hostCompany || "Doanh nghiệp CLB",
              partnerPhone: a.partnerPhone || a.hostPhone || "0901234567",
              partnerAvatar: a.partnerAvatar || a.hostAvatar,
              status: "confirmed",
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

      // 4. Load Training sessions
      try {
        const rawTrainings = localStorage.getItem("vba_trainings");
        const rawUserCalendar = localStorage.getItem("vba_user_calendar_items");
        const listT = rawTrainings ? JSON.parse(rawTrainings) : [];
        const listCal = rawUserCalendar ? JSON.parse(rawUserCalendar) : [];
        const userTrainings = listCal.filter((c: any) => c.sourceType === "training");

        const allTrainings = [...listT, ...userTrainings];
        if (allTrainings.length > 0) {
          allTrainings.forEach((tr: any, idx: number) => {
            combined.push({
              id: tr.id || `tr-${idx}`,
              type: "training",
              title: tr.title || "Chương trình Đào tạo Doanh nhân",
              categoryLabel: "Đào tạo",
              date: tr.date || tr.dateStr || new Date().toISOString().split("T")[0],
              time: tr.time || tr.timeStr || "14:00 - 16:30",
              location: tr.location || "Trực tuyến Zoom",
              isOnline: Boolean(tr.isOnline || tr.meetingUrl),
              onlineLink: tr.meetingUrl || tr.onlineLink,
              status: "confirmed",
              description: tr.description || tr.trainerName,
            });
          });
        }
      } catch {}

      // 5. Load Opportunities
      try {
        const rawOpps = localStorage.getItem("vba_opp_deals");
        const rawAgreedOpps = localStorage.getItem("vba_agreed_opp_deals");
        const listO = rawOpps ? JSON.parse(rawOpps) : [];
        const listAgreed = rawAgreedOpps ? JSON.parse(rawAgreedOpps) : [];
        const combinedOpps = [...listO, ...listAgreed];

        if (combinedOpps.length > 0) {
          combinedOpps.forEach((op: any, idx: number) => {
            combined.push({
              id: op.id || `opp-${idx}`,
              type: "opportunity",
              title: op.title || op.name || "Chia sẻ Cơ hội Kinh doanh",
              categoryLabel: "Cơ hội B2B",
              date: op.createdAt ? op.createdAt.split("T")[0] : new Date().toISOString().split("T")[0],
              time: op.time || "09:30 - 11:00",
              location: op.location || "CLB Doanh Nhân CEO 1983",
              partnerName: op.contactName || op.giverName || op.receiverName,
              partnerPhone: op.contactPhone,
              status: "confirmed",
              description: op.description || op.valueText,
            });
          });
        }
      } catch {}

      // Fallback defaults if list is completely empty
      if (combined.length === 0) {
        combined = [...DEFAULT_COMMITTEE_MEETINGS];
      }

      // Deduplicate by ID
      const seenIds = new Set<string>();
      const deduped: CalendarItem[] = [];
      for (const item of combined) {
        if (!seenIds.has(item.id)) {
          seenIds.add(item.id);
          deduped.push(item);
        }
      }

      // Sort by date & time ascending
      deduped.sort((a, b) => {
        const msA = getItemStartMs(a);
        const msB = getItemStartMs(b);
        return msA - msB;
      });

      setCalendarItems(deduped);
    } catch {
      toast.error("Không thể tải lịch trình lúc này");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCalendarData();
    const handleReload = () => loadCalendarData();
    window.addEventListener("vba.connection.changed", handleReload);
    window.addEventListener("vba.meeting.changed", handleReload);
    window.addEventListener("vba.calendar.changed", handleReload);
    window.addEventListener("vba_calendar_updated", handleReload);
    return () => {
      window.removeEventListener("vba.connection.changed", handleReload);
      window.removeEventListener("vba.meeting.changed", handleReload);
      window.removeEventListener("vba.calendar.changed", handleReload);
      window.removeEventListener("vba_calendar_updated", handleReload);
    };
  }, []);

  // ── PHOTO CAPTURE & UPLOAD HANDLERS ──
  const handleAddPhotosToActivity = async (itemId: string, files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadingForItemId(itemId);
    try {
      const fileArray = Array.from(files);
      const newPhotos: ActivityPhoto[] = [];

      for (const file of fileArray) {
        try {
          const res = await uploadFileToNest(file, "calendar_diary");
          const url = res?.url || URL.createObjectURL(file);
          newPhotos.push({
            id: `photo-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            url,
            createdAt: new Date().toISOString(),
            name: file.name,
          });
        } catch {
          // Fallback to data URL
          const dataUrl = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = () => resolve("");
            reader.readAsDataURL(file);
          });
          if (dataUrl) {
            newPhotos.push({
              id: `photo-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
              url: dataUrl,
              createdAt: new Date().toISOString(),
              name: file.name,
            });
          }
        }
      }

      setActivityPhotosMap((prev) => {
        const existing = prev[itemId] || [];
        const updated = [...existing, ...newPhotos];
        return { ...prev, [itemId]: updated };
      });

      // Auto ensure diary record exists
      setDiaryNotesMap((prev) => {
        if (!prev[itemId]) {
          return {
            ...prev,
            [itemId]: {
              note: "Đã lưu ảnh hoạt động vào nhật ký.",
              updatedAt: new Date().toISOString(),
            },
          };
        }
        return prev;
      });

      toast.success(`Đã thêm ${newPhotos.length} ảnh vào nhật ký hoạt động!`);
    } catch {
      toast.error("Không thể tải ảnh vào nhật ký lúc này.");
    } finally {
      setUploadingForItemId(null);
    }
  };

  const handleDeletePhoto = (itemId: string, photoId: string) => {
    setActivityPhotosMap((prev) => {
      const list = prev[itemId] || [];
      const updated = list.filter((p) => p.id !== photoId);
      return { ...prev, [itemId]: updated };
    });
    toast.info("Đã xóa ảnh khỏi nhật ký.");
  };

  // ── SAVE DIARY NOTE HANDLER ──
  const handleSaveDiaryNote = (itemId: string) => {
    setDiaryNotesMap((prev) => ({
      ...prev,
      [itemId]: {
        note: noteDraftText.trim(),
        updatedAt: new Date().toISOString(),
      },
    }));
    toast.success("Đã lưu ghi chú nhật ký hoạt động thành công!");
    setEditingNoteItem(null);
    setNoteDraftText("");
  };

  const handleConfirmCancel1on1 = async () => {
    if (!cancelling1on1Target) return;
    const reason = cancel1on1Reason.trim() || "Hội viên bận công tác đột xuất";
    setSubmittingCancel1on1(true);
    try {
      await fetchNestApi(`/meetings/connection-appointments/${cancelling1on1Target.id}/cancel`, {
        method: "POST",
        body: JSON.stringify({ reason }),
      }).catch(() => null);

      setCalendarItems((prev) => prev.filter((item) => item.id !== cancelling1on1Target.id));

      try {
        const stored = localStorage.getItem("vba_connection_appointments");
        if (stored) {
          const list = JSON.parse(stored);
          const updated = list.map((item: any) =>
            item.id === cancelling1on1Target.id
              ? { ...item, status: "cancelled", cancelReason: reason }
              : item
          );
          localStorage.setItem("vba_connection_appointments", JSON.stringify(updated));
        }
      } catch {}

      window.dispatchEvent(new Event("vba.connection.changed"));
      window.dispatchEvent(new Event("vba.meeting.changed"));
      toast.info("Đã hủy lịch hẹn kết nối thành công.");
      setCancelling1on1Target(null);
      setCancel1on1Reason("");
    } catch {
      toast.error("Không thể hủy lịch hẹn kết nối.");
    } finally {
      setSubmittingCancel1on1(false);
    }
  };

  // ── MONTH NAVIGATION ──
  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth(); // 0 - 11

  const goToPrevMonth = () => {
    setCurrentMonthDate(new Date(year, month - 1, 1));
    setSelectedDate(null);
  };

  const goToNextMonth = () => {
    setCurrentMonthDate(new Date(year, month + 1, 1));
    setSelectedDate(null);
  };

  const goToToday = () => {
    const now = new Date();
    setCurrentMonthDate(now);
    setSelectedDate(now.toISOString().split("T")[0]);
  };

  // ── MONTH GRID CALCULATION (7 COLUMNS: T2 -> CN) ──
  const monthGridData = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();

    // In JS: 0=Sun, 1=Mon, ..., 6=Sat.
    // Convert to Monday=0, ..., Sunday=6:
    const startDayOfWeek = (firstDay.getDay() + 6) % 7;

    const prevMonthLastDay = new Date(year, month, 0).getDate();

    const cells = [];

    // 1. Previous month trailing days
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const dayNum = prevMonthLastDay - i;
      const prevDate = new Date(year, month - 1, dayNum);
      const dateStr = prevDate.toISOString().split("T")[0];
      cells.push({
        dateStr,
        dayNum,
        isCurrentMonth: false,
        isToday: false,
        hasEvent: false,
        hasCommittee: false,
        has1on1: false,
        hasTraining: false,
        hasOpportunity: false,
        totalItems: 0,
      });
    }

    const todayStr = new Date().toISOString().split("T")[0];

    // 2. Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const curDate = new Date(year, month, d);
      const dateStr = curDate.toISOString().split("T")[0];
      const isToday = dateStr === todayStr;

      const dayItems = calendarItems.filter((i) => i.date === dateStr);
      const hasEvent = dayItems.some((i) => i.type === "event");
      const hasCommittee = dayItems.some((i) => i.type === "meeting_committee");
      const has1on1 = dayItems.some((i) => i.type === "meeting_1on1");
      const hasTraining = dayItems.some((i) => i.type === "training");
      const hasOpportunity = dayItems.some((i) => i.type === "opportunity");

      cells.push({
        dateStr,
        dayNum: d,
        isCurrentMonth: true,
        isToday,
        hasEvent,
        hasCommittee,
        has1on1,
        hasTraining,
        hasOpportunity,
        totalItems: dayItems.length,
      });
    }

    // 3. Next month leading days to complete grid (multiples of 7)
    const remaining = (7 - (cells.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const nextDate = new Date(year, month + 1, i);
      const dateStr = nextDate.toISOString().split("T")[0];
      cells.push({
        dateStr,
        dayNum: i,
        isCurrentMonth: false,
        isToday: false,
        hasEvent: false,
        hasCommittee: false,
        has1on1: false,
        hasTraining: false,
        hasOpportunity: false,
        totalItems: 0,
      });
    }

    return cells;
  }, [year, month, calendarItems]);

  // ── 14-DAY STRIP ──
  const dateStrip = useMemo(() => {
    const days = [];
    const base = new Date();
    for (let i = -1; i < 13; i++) {
      const d = new Date(base.getTime() + i * 86400000);
      const dateStr = d.toISOString().split("T")[0];
      const dayNum = d.getDate();
      const weekDay = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"][d.getDay()];
      const isToday = i === 0;

      const dayItems = calendarItems.filter((item) => item.date === dateStr);
      const hasEvent = dayItems.some((i) => i.type === "event");
      const hasCommittee = dayItems.some((i) => i.type === "meeting_committee");
      const has1on1 = dayItems.some((i) => i.type === "meeting_1on1");
      const hasTraining = dayItems.some((i) => i.type === "training");
      const hasOpportunity = dayItems.some((i) => i.type === "opportunity");

      days.push({
        dateStr,
        dayNum,
        weekDay,
        isToday,
        hasEvent,
        hasCommittee,
        has1on1,
        hasTraining,
        hasOpportunity,
        totalItems: dayItems.length,
      });
    }
    return days;
  }, [calendarItems]);

  // ── FILTERED ITEMS ──
  const filteredItems = useMemo(() => {
    return calendarItems.filter((item) => {
      // Type filter
      if (filterType === "EVENT" && item.type !== "event") return false;
      if (filterType === "MEETING_COMMITTEE" && item.type !== "meeting_committee") return false;
      if (filterType === "MEETING_1ON1" && item.type !== "meeting_1on1") return false;
      if (filterType === "TRAINING" && item.type !== "training") return false;
      if (filterType === "OPPORTUNITY" && item.type !== "opportunity") return false;

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

  // ── MONTH LIST ITEMS: Grouped by date ──
  const monthListGrouped = useMemo(() => {
    const curMonthPrefix = `${year}-${String(month + 1).padStart(2, "0")}`;
    const itemsInMonth = calendarItems.filter((item) => {
      if (!item.date.startsWith(curMonthPrefix)) return false;

      // Type filter
      if (filterType === "EVENT" && item.type !== "event") return false;
      if (filterType === "MEETING_COMMITTEE" && item.type !== "meeting_committee") return false;
      if (filterType === "MEETING_1ON1" && item.type !== "meeting_1on1") return false;
      if (filterType === "TRAINING" && item.type !== "training") return false;
      if (filterType === "OPPORTUNITY" && item.type !== "opportunity") return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        return (
          item.title.toLowerCase().includes(q) ||
          item.location.toLowerCase().includes(q) ||
          (item.partnerName && item.partnerName.toLowerCase().includes(q))
        );
      }
      return true;
    });

    const groups: Record<string, CalendarItem[]> = {};
    itemsInMonth.forEach((it) => {
      if (!groups[it.date]) groups[it.date] = [];
      groups[it.date].push(it);
    });

    return Object.entries(groups).sort(([dA], [dB]) => dA.localeCompare(dB));
  }, [calendarItems, year, month, filterType, searchQuery]);

  // ── DIARY ITEMS (ACTIVITIES WHERE COUNTDOWN HAS REACHED OR STARTED) ──
  const diaryLoggedItems = useMemo(() => {
    return calendarItems
      .filter((item) => {
        const startMs = getItemStartMs(item);
        return currentTimeMs >= startMs;
      })
      .sort((a, b) => getItemStartMs(b) - getItemStartMs(a));
  }, [calendarItems, currentTimeMs]);

  // Urgent today item
  const todayStr = new Date().toISOString().split("T")[0];
  const urgentTodayItems = calendarItems.filter((i) => i.date === todayStr);

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#070D18] text-slate-900 dark:text-white pb-28 font-sans select-none">
      {/* Header */}
      <MemberHeader
        title="Lịch & Nhật Ký Hoạt Động"
        subtitle="Sự kiện, cơ hội, B2B, họp ban & đào tạo của bạn"
        right={
          <button
            type="button"
            onClick={() => setCreateConnectModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold transition shadow-xs cursor-pointer active:scale-95"
            title="Tạo lịch hẹn kết nối mới"
          >
            <Plus className="size-3.5" />
            <span className="hidden sm:inline">Đặt lịch hẹn</span>
          </button>
        }
      />

      <div className="max-w-xl mx-auto px-4 py-3 space-y-4">
        {/* ── 1. MAIN TAB SWITCHER: LỊCH HOẠT ĐỘNG VS NHẬT KÝ Ở LỊCH ── */}
        <div className="grid grid-cols-2 p-1 bg-slate-200/80 dark:bg-slate-800/80 rounded-2xl">
          <button
            type="button"
            onClick={() => setActiveMainTab("schedule")}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
              activeMainTab === "schedule"
                ? "bg-white dark:bg-slate-900 text-[#003B95] dark:text-white shadow-xs font-black"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            <CalendarIcon className="size-4" />
            <span>Lịch trình hoạt động</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMainTab("diary")}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
              activeMainTab === "diary"
                ? "bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-xs font-black"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            <BookOpen className="size-4" />
            <span>Nhật ký ở lịch</span>
            {diaryLoggedItems.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-amber-500 text-slate-950">
                {diaryLoggedItems.length}
              </span>
            )}
          </button>
        </div>

        {/* ── 2. URGENT TODAY BANNER ── */}
        {urgentTodayItems.length > 0 && activeMainTab === "schedule" && (
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

        {/* ── 3. NỘI DUNG CHÍNH TAB LỊCH TRÌNH ── */}
        {activeMainTab === "schedule" && (
          <div className="space-y-4">
            {/* Quick KPI Counters (5 Danh mục) */}
            <div className="grid grid-cols-5 gap-1.5">
              <button
                type="button"
                onClick={() => setFilterType(filterType === "EVENT" ? "ALL" : "EVENT")}
                className={`p-2 rounded-xl border text-center transition cursor-pointer ${
                  filterType === "EVENT"
                    ? "bg-red-500/15 border-red-500/60 text-red-600 dark:text-red-400 font-black"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300"
                }`}
              >
                <Ticket className="size-3.5 mx-auto text-red-500" />
                <span className="text-[9px] font-bold block mt-1">Sự kiện</span>
                <span className="text-xs font-black block">
                  {calendarItems.filter((i) => i.type === "event").length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setFilterType(filterType === "OPPORTUNITY" ? "ALL" : "OPPORTUNITY")}
                className={`p-2 rounded-xl border text-center transition cursor-pointer ${
                  filterType === "OPPORTUNITY"
                    ? "bg-emerald-500/15 border-emerald-500/60 text-emerald-600 dark:text-emerald-400 font-black"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300"
                }`}
              >
                <TrendingUp className="size-3.5 mx-auto text-emerald-500" />
                <span className="text-[9px] font-bold block mt-1">Cơ hội</span>
                <span className="text-xs font-black block">
                  {calendarItems.filter((i) => i.type === "opportunity").length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setFilterType(filterType === "MEETING_1ON1" ? "ALL" : "MEETING_1ON1")}
                className={`p-2 rounded-xl border text-center transition cursor-pointer ${
                  filterType === "MEETING_1ON1"
                    ? "bg-blue-500/15 border-blue-500/60 text-blue-600 dark:text-blue-400 font-black"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300"
                }`}
              >
                <Handshake className="size-3.5 mx-auto text-blue-500" />
                <span className="text-[9px] font-bold block mt-1">Gặp B2B</span>
                <span className="text-xs font-black block">
                  {calendarItems.filter((i) => i.type === "meeting_1on1").length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setFilterType(filterType === "MEETING_COMMITTEE" ? "ALL" : "MEETING_COMMITTEE")}
                className={`p-2 rounded-xl border text-center transition cursor-pointer ${
                  filterType === "MEETING_COMMITTEE"
                    ? "bg-amber-500/15 border-amber-500/60 text-amber-600 dark:text-amber-400 font-black"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300"
                }`}
              >
                <Users className="size-3.5 mx-auto text-amber-500" />
                <span className="text-[9px] font-bold block mt-1">Họp ban</span>
                <span className="text-xs font-black block">
                  {calendarItems.filter((i) => i.type === "meeting_committee").length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setFilterType(filterType === "TRAINING" ? "ALL" : "TRAINING")}
                className={`p-2 rounded-xl border text-center transition cursor-pointer ${
                  filterType === "TRAINING"
                    ? "bg-purple-500/15 border-purple-500/60 text-purple-600 dark:text-purple-400 font-black"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300"
                }`}
              >
                <GraduationCap className="size-3.5 mx-auto text-purple-500" />
                <span className="text-[9px] font-bold block mt-1">Đào tạo</span>
                <span className="text-xs font-black block">
                  {calendarItems.filter((i) => i.type === "training").length}
                </span>
              </button>
            </div>

            {/* ── BỘ ĐIỀU HƯỚNG THÁNG & CHẾ ĐỘ XEM (LƯỚI THÁNG / LIST THÁNG / DẢI NGÀY) ── */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-3 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              {/* Header Tháng & Mode switcher */}
              <div className="flex items-center justify-between gap-2 flex-wrap">
                {/* Month Navigator */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={goToPrevMonth}
                    className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                    title="Tháng trước"
                  >
                    <ChevronLeft className="size-4" />
                  </button>

                  <div className="px-2 text-center">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-white block">
                      Tháng {month + 1} / {year}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={goToNextMonth}
                    className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                    title="Tháng sau"
                  >
                    <ChevronRight className="size-4" />
                  </button>

                  <button
                    type="button"
                    onClick={goToToday}
                    className="px-2 py-1 rounded-xl text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 hover:bg-amber-500/25 transition cursor-pointer ml-1"
                  >
                    Hôm nay
                  </button>
                </div>

                {/* View Switcher: Lưới / List / Strip */}
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
                  <button
                    type="button"
                    onClick={() => setViewMode("month_grid")}
                    className={`p-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                      viewMode === "month_grid"
                        ? "bg-white dark:bg-slate-900 text-[#003B95] dark:text-white shadow-xs"
                        : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                    }`}
                    title="Chế độ Lưới cả tháng"
                  >
                    <Grid3X3 className="size-3.5" />
                    <span className="text-[10.5px]">Lưới</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setViewMode("month_list")}
                    className={`p-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                      viewMode === "month_list"
                        ? "bg-white dark:bg-slate-900 text-[#003B95] dark:text-white shadow-xs"
                        : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                    }`}
                    title="Chế độ Danh sách tháng"
                  >
                    <ListIcon className="size-3.5" />
                    <span className="text-[10.5px]">List</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setViewMode("strip")}
                    className={`p-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                      viewMode === "strip"
                        ? "bg-white dark:bg-slate-900 text-[#003B95] dark:text-white shadow-xs"
                        : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                    }`}
                    title="Chế độ Dải ngày"
                  >
                    <CalendarDays className="size-3.5" />
                    <span className="text-[10.5px]">Dải ngày</span>
                  </button>
                </div>
              </div>

              {/* ── A. CHẾ ĐỘ LƯỚI CẢ THÁNG (MONTH GRID) ── */}
              {viewMode === "month_grid" && (
                <div className="space-y-1.5 pt-1 animate-in fade-in duration-200">
                  {/* Ngày trong tuần (Thứ 2 -> Chủ Nhật) */}
                  <div className="grid grid-cols-7 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider pb-1 border-b border-slate-100 dark:border-slate-800">
                    <div>T2</div>
                    <div>T3</div>
                    <div>T4</div>
                    <div>T5</div>
                    <div>T6</div>
                    <div>T7</div>
                    <div className="text-red-500">CN</div>
                  </div>

                  {/* Lưới các ô ngày */}
                  <div className="grid grid-cols-7 gap-1">
                    {monthGridData.map((cell, idx) => {
                      const isSelected = selectedDate === cell.dateStr;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            if (cell.isCurrentMonth) {
                              setSelectedDate(isSelected ? null : cell.dateStr);
                            }
                          }}
                          disabled={!cell.isCurrentMonth}
                          className={`aspect-square p-1 rounded-2xl flex flex-col items-center justify-between transition cursor-pointer relative ${
                            !cell.isCurrentMonth
                              ? "opacity-25 pointer-events-none"
                              : isSelected
                              ? "bg-[#003B95] text-white shadow-md scale-102 ring-2 ring-blue-400"
                              : cell.isToday
                              ? "bg-amber-500/15 border border-amber-500/50 text-amber-700 dark:text-amber-300 font-black"
                              : "bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 text-slate-700 dark:text-slate-200"
                          }`}
                        >
                          <span
                            className={`text-xs leading-none font-bold ${
                              isSelected ? "text-white" : cell.isToday ? "text-amber-600 dark:text-amber-400" : ""
                            }`}
                          >
                            {cell.dayNum}
                          </span>

                          {/* Dots Indicators cho các loại hoạt động */}
                          <div className="flex items-center justify-center gap-0.5 mt-0.5">
                            {cell.hasEvent && <span className="size-1 rounded-full bg-red-500" title="Sự kiện" />}
                            {cell.hasOpportunity && <span className="size-1 rounded-full bg-emerald-500" title="Cơ hội" />}
                            {cell.has1on1 && <span className="size-1 rounded-full bg-blue-500" title="B2B" />}
                            {cell.hasCommittee && <span className="size-1 rounded-full bg-amber-500" title="Họp ban" />}
                            {cell.hasTraining && <span className="size-1 rounded-full bg-purple-500" title="Đào tạo" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Chú thích màu chấm */}
                  <div className="flex items-center justify-center gap-3 pt-2 text-[10px] text-slate-500 flex-wrap">
                    <span className="flex items-center gap-1">
                      <span className="size-1.5 rounded-full bg-red-500" /> Sự kiện
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="size-1.5 rounded-full bg-emerald-500" /> Cơ hội
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="size-1.5 rounded-full bg-blue-500" /> Gặp B2B
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="size-1.5 rounded-full bg-amber-500" /> Họp ban
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="size-1.5 rounded-full bg-purple-500" /> Đào tạo
                    </span>
                  </div>

                  {selectedDate && (
                    <div className="flex items-center justify-between pt-1 text-xs">
                      <span className="font-bold text-[#003B95] dark:text-amber-400">
                        Đang lọc ngày: {formatDisplayDate(selectedDate)}
                      </span>
                      <button
                        type="button"
                        onClick={() => setSelectedDate(null)}
                        className="text-[11px] font-bold text-red-500 hover:underline cursor-pointer"
                      >
                        Bỏ lọc ngày
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* ── B. CHẾ ĐỘ DẢI NGÀY (STRIP) ── */}
              {viewMode === "strip" && (
                <div className="animate-in fade-in duration-200">
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

                          <div className="flex items-center gap-0.5 mt-1.5 h-1.5">
                            {day.hasEvent && <span className="size-1 rounded-full bg-red-500" />}
                            {day.hasOpportunity && <span className="size-1 rounded-full bg-emerald-500" />}
                            {day.has1on1 && <span className="size-1 rounded-full bg-blue-500" />}
                            {day.hasCommittee && <span className="size-1 rounded-full bg-amber-500" />}
                            {day.hasTraining && <span className="size-1 rounded-full bg-purple-500" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── C. CHẾ ĐỘ LIST CẢ THÁNG (MONTH LIST) ── */}
              {viewMode === "month_list" && (
                <div className="space-y-3 pt-1 animate-in fade-in duration-200">
                  <div className="text-xs font-bold text-slate-500 flex items-center justify-between">
                    <span>Toàn bộ hoạt động trong Tháng {month + 1} / {year}</span>
                    <span>{monthListGrouped.reduce((acc, [, items]) => acc + items.length, 0)} hoạt động</span>
                  </div>
                </div>
              )}
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm sự kiện, cơ hội, B2B, cuộc họp, đào tạo..."
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

            {/* ── DANH SÁCH CÁC MỤC LỊCH TRÌNH ── */}
            {viewMode === "month_list" ? (
              /* Rendering grouped by date in month */
              <div className="space-y-4">
                {monthListGrouped.length === 0 ? (
                  <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-2">
                    <CalendarCheck className="size-8 mx-auto text-slate-400" />
                    <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                      Không có hoạt động nào trong Tháng {month + 1} / {year}
                    </p>
                  </div>
                ) : (
                  monthListGrouped.map(([dateStr, items]) => (
                    <div key={dateStr} className="space-y-2">
                      <div className="flex items-center gap-2 px-1">
                        <span className="size-2 rounded-full bg-[#003B95] dark:bg-amber-400" />
                        <h4 className="text-xs font-black uppercase text-slate-800 dark:text-slate-200">
                          {formatDisplayDate(dateStr)} ({items.length})
                        </h4>
                      </div>
                      <div className="space-y-2.5">
                        {items.map((item) => renderCalendarCard(item))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              /* Standard Filtered List */
              <div className="space-y-3">
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
                          : "Lịch cá nhân hiển thị sự kiện CLB, chia sẻ cơ hội, cuộc gặp B2B, họp ban và chương trình đào tạo."}
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
                  filteredItems.map((item) => renderCalendarCard(item))
                )}
              </div>
            )}
          </div>
        )}

        {/* ── 4. NỘI DUNG CHÍNH TAB NHẬT KÝ Ở LỊCH (DIARY LOG) ── */}
        {activeMainTab === "diary" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Header info */}
            <div className="p-3.5 rounded-3xl bg-gradient-to-r from-amber-500/15 via-blue-500/10 to-red-500/10 border border-amber-500/30 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-black uppercase text-amber-900 dark:text-amber-300">
                  Nhật Ký Hoạt Động & Kỷ Niệm
                </h3>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                  Tất cả sự kiện, cơ hội, B2B, cuộc họp & đào tạo đã diễn ra đều được tự động lưu vào đây
                </p>
              </div>
              <div className="text-right">
                <span className="text-base font-black text-amber-600 dark:text-amber-400">
                  {diaryLoggedItems.length}
                </span>
                <span className="text-[10px] block text-slate-400 font-bold uppercase">Mục nhật ký</span>
              </div>
            </div>

            {diaryLoggedItems.length === 0 ? (
              <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-2">
                <BookOpen className="size-8 mx-auto text-slate-400" />
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Chưa có hoạt động nào kết thúc thời gian đếm ngược
                </p>
                <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                  Khi các sự kiện, buổi họp hoặc cuộc gặp bắt đầu diễn ra theo lịch đếm ngược, hệ thống sẽ tự động ghi nhật ký và kích hoạt tính năng chụp ảnh kỷ niệm.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {diaryLoggedItems.map((item) => renderDiaryCard(item))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── MODAL VIẾT / CHỈNH SỬA GHI CHÚ NHẬT KÝ ── */}
      {editingNoteItem && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setEditingNoteItem(null)}
        >
          <div
            className="w-full max-w-sm rounded-3xl bg-white dark:bg-[#0B132B] border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-xl bg-amber-500/15 text-amber-600 flex items-center justify-center">
                  <FileText className="size-4" />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase text-slate-900 dark:text-white">
                    Ghi Chú Nhật Ký Hoạt Động
                  </h3>
                  <p className="text-[10px] text-slate-400 truncate max-w-[200px]">
                    {editingNoteItem.title}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingNoteItem(null)}
                className="p-1 rounded-full text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            <div>
              <label className="text-[11.5px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Nội dung ghi chú nhật ký
              </label>
              <textarea
                rows={4}
                value={noteDraftText}
                onChange={(e) => setNoteDraftText(e.target.value)}
                placeholder="Ghi lại ấn tượng, kết quả đàm phán, hợp đồng đã ký hoặc các cam kết xúc tiến..."
                className="w-full p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white outline-none focus:border-[#003B95] resize-none"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setEditingNoteItem(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => handleSaveDiaryNote(editingNoteItem.id)}
                className="flex-1 py-2.5 rounded-xl bg-[#003B95] text-white text-xs font-bold hover:bg-[#002B70] transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Save className="size-3.5" />
                <span>Lưu nhật ký</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── LIGHTBOX PHÓNG TO ẢNH NHẬT KÝ ── */}
      {lightboxPhotoUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setLightboxPhotoUrl(null)}
        >
          <button
            type="button"
            onClick={() => setLightboxPhotoUrl(null)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition cursor-pointer"
          >
            <X className="size-6" />
          </button>
          <img
            src={resolveMediaUrl(lightboxPhotoUrl) || lightboxPhotoUrl}
            alt="Ảnh kỷ niệm"
            className="max-h-[85vh] max-w-[90vw] object-contain rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* ── MODAL CÀI ĐẶT NHẮC LỊCH ── */}
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
                  <p className="text-[10.5px] text-slate-400">Chọn thời gian thông báo trước khi diễn ra</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setReminderModalTarget(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
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
                    onClick={() => {
                      setReminders((prev) => ({
                        ...prev,
                        [reminderModalTarget.id]: {
                          itemId: reminderModalTarget.id,
                          enabled: true,
                          timing: opt.id as ReminderTiming,
                          notified: false,
                        },
                      }));
                      toast.success("Đã lưu thời gian nhắc nhở!");
                      setReminderModalTarget(null);
                    }}
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

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setReminderModalTarget(null)}
                className="flex-1 py-2 rounded-xl bg-[#003B95] text-white text-xs font-bold hover:bg-[#002B70] transition shadow-xs cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL HỦY LỊCH HẸN 1-ON-1 ── */}
      {cancelling1on1Target && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => !submittingCancel1on1 && setCancelling1on1Target(null)}
        >
          <div
            className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-rose-200 dark:border-rose-900/50 p-5 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600">
                  <XCircle className="size-5" />
                </span>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase">
                    Hủy Lịch Hẹn Kết Nối
                  </h3>
                  <p className="text-[11px] text-slate-400">Cuộc hẹn sẽ gỡ khỏi Lịch và thông báo tới đối tác</p>
                </div>
              </div>
              <button
                type="button"
                disabled={submittingCancel1on1}
                onClick={() => setCancelling1on1Target(null)}
                className="p-1 rounded-full text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs space-y-1">
              <div className="font-bold text-slate-900 dark:text-white line-clamp-1">
                {cancelling1on1Target.title}
              </div>
              {cancelling1on1Target.partnerName && (
                <div className="text-[11px] text-slate-500">
                  Đối tác: <strong>{cancelling1on1Target.partnerName}</strong>
                </div>
              )}
            </div>

            <div>
              <label className="text-[11.5px] font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                Lý do hủy cuộc hẹn <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={cancel1on1Reason}
                onChange={(e) => setCancel1on1Reason(e.target.value)}
                placeholder="Nhập chi tiết lý do hủy..."
                rows={3}
                className="w-full p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-rose-500"
              />
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                disabled={submittingCancel1on1}
                onClick={() => setCancelling1on1Target(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold cursor-pointer"
              >
                Giữ lịch hẹn
              </button>
              <button
                type="button"
                disabled={submittingCancel1on1}
                onClick={handleConfirmCancel1on1}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {submittingCancel1on1 ? <Loader2 className="size-4 animate-spin" /> : <XCircle className="size-4" />}
                <span>Xác nhận hủy</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── CREATE CONNECTION MODAL ── */}
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

  // ── RENDER COMPONENT: CARD LỊCH TRÌNH TIÊU CHUẨN ──
  function renderCalendarCard(item: CalendarItem) {
    const reminder = reminders[item.id];
    const isReminderOn = Boolean(reminder?.enabled);
    const isToday = item.date === todayStr;

    const startMs = getItemStartMs(item);
    const hasStarted = currentTimeMs >= startMs;
    const photos = activityPhotosMap[item.id] || [];
    const diaryRecord = diaryNotesMap[item.id];

    // Refs for live camera and upload
    const cameraInputRef = { current: null as HTMLInputElement | null };
    const uploadInputRef = { current: null as HTMLInputElement | null };

    return (
      <div
        key={item.id}
        className={`p-4 rounded-3xl bg-white dark:bg-slate-900 border transition-all space-y-3 shadow-xs ${
          isToday
            ? "border-amber-400/80 ring-1 ring-amber-400/50"
            : "border-slate-200 dark:border-slate-800 hover:border-slate-300"
        }`}
      >
        {/* Item Header: Badge, Status, Countdown */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`px-2 py-0.5 rounded-md text-[9.5px] font-black uppercase tracking-wider ${
                item.type === "event"
                  ? "bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-300 border border-red-300/40"
                  : item.type === "opportunity"
                  ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300/40"
                  : item.type === "training"
                  ? "bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-300/40"
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

            {/* LIVE COUNTDOWN OR PASSED BADGE */}
            {!hasStarted ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                <Timer className="size-3 text-amber-600 animate-spin" />
                <span>Còn {formatCountdown(startMs, currentTimeMs)}</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                <CheckCircle2 className="size-3 text-emerald-600" />
                <span>Đã ghi vào nhật ký</span>
              </span>
            )}
          </div>

          {/* Quick Reminder Bell Button */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                const nextEnabled = !reminders[item.id]?.enabled;
                setReminders((prev) => ({
                  ...prev,
                  [item.id]: {
                    itemId: item.id,
                    enabled: nextEnabled,
                    timing: prev[item.id]?.timing || "1day",
                    notified: false,
                  },
                }));
                toast.success(nextEnabled ? "Đã bật nhắc lịch!" : "Đã tắt nhắc lịch.");
              }}
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

          {/* Partner details for B2B or Opportunity */}
          {(item.type === "meeting_1on1" || item.type === "opportunity") && item.partnerName && (
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

          {/* Event Ticket Code */}
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

        {/* ── NÚT CHỤP ẢNH & TẢI ẢNH TẠI SỰ KIỆN / CUỘC HỌP ── */}
        {(hasStarted || item.status === "confirmed" || item.status === "registered" || isToday || photos.length > 0) && (
          <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-1.5">
              <span className="text-[11px] font-extrabold text-amber-900 dark:text-amber-300 flex items-center gap-1">
                <Camera className="size-3.5 text-amber-600" />
                <span>Nhật ký &amp; Ảnh ({photos.length})</span>
              </span>

              {/* Action buttons: Camera, Gallery Upload, and Share */}
              <div className="flex items-center gap-1.5">
                {/* Nút chụp ảnh trực tiếp */}
                <label className="px-2.5 py-1 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-[10.5px] font-bold flex items-center gap-1 cursor-pointer transition shadow-xs active:scale-95">
                  <Camera className="size-3" />
                  <span>Chụp ảnh</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    disabled={uploadingForItemId === item.id}
                    onChange={(e) => handleAddPhotosToActivity(item.id, e.target.files)}
                  />
                </label>

                {/* Nút tải ảnh lên từ thư viện */}
                <label className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 text-[#003B95] dark:text-blue-300 border border-[#003B95]/30 text-[10.5px] font-bold flex items-center gap-1 cursor-pointer hover:bg-blue-50 transition active:scale-95">
                  <ImagePlus className="size-3" />
                  <span>Tải ảnh</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    disabled={uploadingForItemId === item.id}
                    onChange={(e) => handleAddPhotosToActivity(item.id, e.target.files)}
                  />
                </label>

                {/* Nút chia sẻ ảnh lên mạng lưới hoặc ra ngoài */}
                {photos.length > 0 && (
                  <button
                    type="button"
                    onClick={async () => {
                      const shareUrls = photos.map((p) => p.url);
                      const shareTitle = `📸 [Khoảnh khắc hoạt động] ${item.title}`;
                      const shareContent = `${shareTitle}\n📍 ${item.location || "CLB CEO 1983"}\n⏰ ${item.date} ${item.time}`;

                      // Đăng lên Mạng lưới
                      try {
                        await fetchNestApi("/feed", {
                          method: "POST",
                          body: JSON.stringify({
                            title: shareTitle,
                            content: shareContent,
                            category: "EVENT_MEETING",
                            images: shareUrls,
                          }),
                        });
                        toast.success("Đã chia sẻ ảnh lên Mạng lưới CLB CEO 1983!");
                      } catch {
                        toast.info("Đã lưu ảnh hoạt động.");
                      }

                      // Đồng thời hỗ trợ chia sẻ ra ngoài
                      if (navigator.share) {
                        try {
                          await navigator.share({
                            title: shareTitle,
                            text: shareContent,
                            url: window.location.href,
                          });
                        } catch {}
                      }
                    }}
                    className="px-2 py-1 rounded-xl bg-[#003B95] hover:bg-[#002B70] text-white text-[10.5px] font-bold flex items-center gap-1 shadow-xs active:scale-95 transition cursor-pointer"
                    title="Chia sẻ ảnh lên Mạng lưới / Ra ngoài"
                  >
                    <Share2 className="size-3" />
                    <span>Chia sẻ</span>
                  </button>
                )}

                {/* Nút viết ghi chú */}
                <button
                  type="button"
                  onClick={() => {
                    setEditingNoteItem(item);
                    setNoteDraftText(diaryRecord?.note || "");
                  }}
                  className="px-2 py-1 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-[10.5px] font-bold hover:bg-slate-200 transition cursor-pointer"
                  title="Viết hoặc chỉnh sửa ghi chú nhật ký"
                >
                  <FileText className="size-3" />
                </button>
              </div>
            </div>

            {/* Note text preview if any */}
            {diaryRecord?.note && (
              <p className="text-[11px] text-slate-700 dark:text-slate-300 bg-white/70 dark:bg-slate-900/70 p-2 rounded-xl border border-amber-200/50 dark:border-amber-900/40 italic">
                "{diaryRecord.note}"
              </p>
            )}

            {/* Photos thumbnail preview strip */}
            {photos.length > 0 && (
              <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
                {photos.map((p) => (
                  <div
                    key={p.id}
                    className="relative size-14 shrink-0 rounded-xl overflow-hidden border border-amber-300/60 dark:border-amber-700/60 group"
                  >
                    <img
                      src={resolveMediaUrl(p.url) || p.url}
                      alt="Ảnh hoạt động"
                      className="size-full object-cover cursor-pointer"
                      onClick={() => setLightboxPhotoUrl(p.url)}
                    />
                    <button
                      type="button"
                      onClick={() => handleDeletePhoto(item.id, p.id)}
                      className="absolute top-0.5 right-0.5 p-0.5 rounded-full bg-red-600/90 text-white opacity-0 group-hover:opacity-100 transition cursor-pointer"
                      title="Xóa ảnh"
                    >
                      <Trash2 className="size-2.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {uploadingForItemId === item.id && (
              <div className="flex items-center gap-1.5 text-[10.5px] text-amber-700 dark:text-amber-300 font-bold">
                <Loader2 className="size-3.5 animate-spin" />
                <span>Đang tải ảnh lên nhật ký...</span>
              </div>
            )}
          </div>
        )}

        {/* Card Footer Actions */}
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

            {item.type === "meeting_1on1" && (
              <button
                type="button"
                onClick={() => {
                  setCancelling1on1Target(item);
                  setCancel1on1Reason("");
                }}
                className="px-2.5 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
              >
                <XCircle className="size-3" />
                <span>Hủy hẹn</span>
              </button>
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
  }

  // ── RENDER COMPONENT: CARD NHẬT KÝ ĐÃ LƯU ──
  function renderDiaryCard(item: CalendarItem) {
    const photos = activityPhotosMap[item.id] || [];
    const diaryRecord = diaryNotesMap[item.id];

    return (
      <div
        key={item.id}
        className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3"
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span
                className={`px-2 py-0.5 rounded-md text-[9.5px] font-black uppercase tracking-wider ${
                  item.type === "event"
                    ? "bg-red-50 text-red-600 border border-red-300/40"
                    : item.type === "opportunity"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-300/40"
                    : item.type === "training"
                    ? "bg-purple-50 text-purple-700 border border-purple-300/40"
                    : item.type === "meeting_committee"
                    ? "bg-amber-50 text-amber-700 border border-amber-300/40"
                    : "bg-blue-50 text-blue-700 border border-blue-300/40"
                }`}
              >
                {item.categoryLabel}
              </span>

              <span className="text-[11px] font-mono text-slate-400">
                {formatDisplayDate(item.date)} · {item.time}
              </span>
            </div>
            <h4 className="text-sm font-black text-slate-900 dark:text-white mt-1">
              {item.title}
            </h4>
          </div>

          <div className="flex items-center gap-1">
            {/* Nút chụp ảnh trực tiếp */}
            <label className="p-2 rounded-xl bg-amber-500 text-slate-950 hover:bg-amber-600 transition cursor-pointer shadow-xs active:scale-95" title="Chụp ảnh trực tiếp">
              <Camera className="size-4" />
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                disabled={uploadingForItemId === item.id}
                onChange={(e) => handleAddPhotosToActivity(item.id, e.target.files)}
              />
            </label>

            {/* Nút tải ảnh lên */}
            <label className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-[#003B95] dark:text-blue-300 hover:bg-slate-200 transition cursor-pointer" title="Tải ảnh từ thiết bị">
              <ImagePlus className="size-4" />
              <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                disabled={uploadingForItemId === item.id}
                onChange={(e) => handleAddPhotosToActivity(item.id, e.target.files)}
              />
            </label>

            {/* Nút ghi chú */}
            <button
              type="button"
              onClick={() => {
                setEditingNoteItem(item);
                setNoteDraftText(diaryRecord?.note || "");
              }}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition cursor-pointer"
              title="Ghi chú nhật ký"
            >
              <FileText className="size-4" />
            </button>
          </div>
        </div>

        {/* Địa điểm / Đối tác */}
        <div className="text-[11.5px] text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
          <MapPin className="size-3.5 text-red-500 shrink-0" />
          <span className="truncate">{item.location}</span>
          {item.partnerName && (
            <>
              <span>·</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                Đối tác: {item.partnerName}
              </span>
            </>
          )}
        </div>

        {/* Ghi chú nhật ký */}
        {diaryRecord?.note ? (
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-slate-800 dark:text-slate-200 space-y-1">
            <div className="flex items-center justify-between text-[10px] text-amber-700 dark:text-amber-400 font-bold uppercase tracking-wider">
              <span>Ghi chú nhật ký:</span>
              <span>{formatDisplayDate(diaryRecord.updatedAt.split("T")[0])}</span>
            </div>
            <p className="leading-relaxed font-medium">{diaryRecord.note}</p>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => {
              setEditingNoteItem(item);
              setNoteDraftText("");
            }}
            className="w-full py-2 px-3 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-500 hover:border-[#003B95] hover:text-[#003B95] transition text-center cursor-pointer"
          >
            + Viết ghi chú nhật ký cho hoạt động này
          </button>
        )}

        {/* Danh sách ảnh trong nhật ký */}
        {photos.length > 0 && (
          <div className="space-y-1">
            <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider">
              Hình ảnh đã lưu ({photos.length}):
            </span>
            <div className="grid grid-cols-4 gap-2 pt-1">
              {photos.map((p) => (
                <div
                  key={p.id}
                  className="relative aspect-square rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 group bg-slate-100 dark:bg-slate-800"
                >
                  <img
                    src={resolveMediaUrl(p.url) || p.url}
                    alt="Ảnh nhật ký"
                    className="size-full object-cover cursor-pointer"
                    onClick={() => setLightboxPhotoUrl(p.url)}
                  />
                  <button
                    type="button"
                    onClick={() => handleDeletePhoto(item.id, p.id)}
                    className="absolute top-1 right-1 p-1 rounded-full bg-red-600/90 text-white opacity-0 group-hover:opacity-100 transition cursor-pointer"
                    title="Xóa ảnh"
                  >
                    <Trash2 className="size-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }
}
