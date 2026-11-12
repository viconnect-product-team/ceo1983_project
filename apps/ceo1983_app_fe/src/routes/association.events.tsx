import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import React, { useState, useEffect, useMemo } from "react";
import {
  Bookmark,
  Check,
  Clock,
  MapPin,
  QrCode,
  Users,
  Flame,
  X,
  Info,
  Eye,
  Calendar,
  Ticket,
  Building2,
  Briefcase,
  Phone,
  Mail,
  User,
  FileText,
  CreditCard,
  Send,
  MessageSquare,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Loader2,
  ExternalLink,
  Trophy,
  GraduationCap,
  Handshake,
  Coffee,
  ChevronLeft,
  ChevronRight,
  History,
  AlertTriangle,
  Share2,
  Headphones,
} from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { MemberHeader } from "@/components/member/MemberShell";
import { useServerData } from "@/hooks/use-server-data";
import { listMyEvents, registerForEvent, cancelEventRegistration, getMyMember, isEventFull, type MyEvent, type MyMember } from "@/lib/member-app.functions";
import { resolveMediaUrl, fetchNestApi } from "@/lib/api-client";
import { getQrUrl } from "@/lib/qr";
import { formatDisplayDate } from "@/lib/date-format";
import { executeShare } from "@/lib/share-helper";
import { saveCalendarItem } from "@/lib/calendar-reminder";
import { useT, useLang } from "@/lib/i18n";
import { useAuth } from "@/context/AuthContext";
import { recordUserActivity } from "@/lib/user-activity-logger";
import eventImg from "@/assets/vba-event.jpg";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { EventCountdownBanner } from "@/components/events/EventCountdownTimer";
import {
  EventRegisteredTicketsModal,
  EventDetailModal,
  EventRegistrationModal,
  EventSuccessNoticeModal,
  EventTicketPassModal,
  EventHistoryRecapModal,
} from "@/components/events/modals";
import { RegisteredEventsQrSlider } from "@/components/events/RegisteredEventsQrSlider";

interface ErrorBoundaryState {
  hasError: boolean;
  error: any;
}

class EventsErrorBoundary extends React.Component<React.PropsWithChildren<{}>, ErrorBoundaryState> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("EventsScreen caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
          <div className="size-16 rounded-full bg-red-100 dark:bg-red-950/40 text-red-600 flex items-center justify-center mb-4 shadow-sm">
            <AlertTriangle className="size-8" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
            Không thể tải giao diện sự kiện
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-5 max-w-sm">
            Đã xảy ra sự cố khi tải danh sách sự kiện hoặc chi tiết vé. Vui lòng bấm thử lại để làm mới dữ liệu từ máy chủ.
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="px-4 py-2 rounded-xl bg-sky-950 text-white font-bold text-xs shadow-md transition active:scale-95 cursor-pointer"
            >
              Tải lại trang
            </button>
            <a
              href="/association/home"
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs transition active:scale-95"
            >
              Về trang chủ
            </a>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export function safeFormatEventDate(
  dateVal: any,
  fallback: string = "27/09/2026",
  options?: Intl.DateTimeFormatOptions
): string {
  if (!dateVal) return fallback;
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return typeof dateVal === "string" && dateVal.trim() ? dateVal : fallback;
    return d.toLocaleDateString("vi-VN", options || {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return fallback;
  }
}

export function safeGetEventDayMonth(dateVal: any, fallbackDay = 20, fallbackMonth = 10) {
  if (!dateVal) {
    return { day: fallbackDay, month: `TH${fallbackMonth}` };
  }
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) {
      return { day: fallbackDay, month: `TH${fallbackMonth}` };
    }
    return {
      day: d.getDate(),
      month: `TH${d.getMonth() + 1}`,
    };
  } catch {
    return { day: fallbackDay, month: `TH${fallbackMonth}` };
  }
}

function EventsRouteComponent() {
  return (
    <EventsErrorBoundary>
      <EventsScreen />
    </EventsErrorBoundary>
  );
}

interface EventsSearch {
  id?: string;
  eventId?: string;
  filter?: string;
  tab?: string;
}

export const Route = createFileRoute("/association/events")({
  validateSearch: (search: Record<string, unknown>): EventsSearch => ({
    id: typeof search.id === "string" ? search.id : undefined,
    eventId: typeof search.eventId === "string" ? search.eventId : undefined,
    filter: typeof search.filter === "string" ? search.filter : undefined,
    tab: typeof search.tab === "string" ? search.tab : undefined,
  }),
  component: EventsRouteComponent,
});

const defaultEventImages = [
  "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=1200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=1200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=1200&auto=format&fit=crop&q=80",
];

export interface EventAgendaInfo {
  category: string;
  subtitle: string;
  headline: string;
  desc: string;
  schedule: { time: string; activity: string }[];
  speakers: string[];
  audience: string;
  zaloLink: string;
  offer: string;
  regLink: string;
}

function getEventAgenda(e: MyEvent, index: number): EventAgendaInfo {
  const titleUpper = (e.title || "").toUpperCase();
  let category = "SỰ KIỆN CLB CEO 1983";
  if (titleUpper.includes("GALA") || titleUpper.includes("ĐẠI HỘI") || titleUpper.includes("KỶ NIỆM")) {
    category = "ĐẠI HỘI & GALA";
  } else if (
    titleUpper.includes("WORKSHOP") ||
    titleUpper.includes("ĐÀO TẠO") ||
    titleUpper.includes("CHUYÊN ĐỀ") ||
    titleUpper.includes("KHÓA HỌC")
  ) {
    category = "WORKSHOP CHUYÊN ĐỀ";
  } else if (
    titleUpper.includes("B2B") ||
    titleUpper.includes("GIAO THƯƠNG") ||
    titleUpper.includes("TỌA ĐÀM") ||
    titleUpper.includes("KẾT NỐI") ||
    titleUpper.includes("DIỄN ĐÀN")
  ) {
    category = "GIAO THƯƠNG B2B";
  }

  const desc =
    e.description?.trim() ||
    `Sự kiện "${e.title}" do ${e.communityName || "CLB Doanh Nhân CEO 1983"} tổ chức${e.place ? ` tại ${e.place}` : ""}${e.time ? ` vào lúc ${e.time}` : ""}${e.date ? ` ngày ${formatDisplayDate(e.date)}` : ""}. Cơ hội kết nối giao thương và hợp tác phát triển doanh nghiệp.`;

  const isFree = Number(e.ticketPrice || e.fee || 0) === 0;

  return {
    category,
    subtitle: "KẾ THỪA GIÁ TRỊ · KIẾN TẠO TƯƠNG LAI · PHÁT TRIỂN BỀN VỮNG",
    headline: e.title,
    desc,
    schedule: [], // Không hardcode lịch trình giả lập
    speakers: [], // Không hardcode diễn giả giả lập
    audience: "Chủ tịch, CEO & Hội viên CLB Doanh Nhân CEO 1983",
    zaloLink: "",
    offer: isFree ? "Vé tham dự miễn phí dành cho Hội viên chính thức" : "Ưu đãi vé tham dự dành cho Hội viên chính thức",
    regLink: typeof window !== "undefined" ? `${window.location.origin}/events/${e.id}/register` : `/events/${e.id}/register`,
  };
}

export type EventSectionKey = "gala" | "workshop" | "b2b" | "regular";

export function getEventSectionKey(e: MyEvent, index: number): EventSectionKey {
  const agenda = getEventAgenda(e, index);
  const cat = (agenda.category || "").toUpperCase();
  const title = (e.title || "").toUpperCase();

  if (
    cat.includes("GALA") ||
    cat.includes("ĐẠI HỘI") ||
    title.includes("GALA") ||
    title.includes("ĐẠI HỘI") ||
    title.includes("KỶ NIỆM") ||
    index === 0
  ) {
    return "gala";
  }
  if (
    cat.includes("WORKSHOP") ||
    cat.includes("ĐÀO TẠO") ||
    cat.includes("CHUYÊN ĐỀ") ||
    title.includes("WORKSHOP") ||
    title.includes("KHÓA HỌC") ||
    title.includes("GIA ĐÌNH")
  ) {
    return "workshop";
  }
  if (
    cat.includes("B2B") ||
    cat.includes("GIAO THƯƠNG") ||
    cat.includes("TỌA ĐÀM") ||
    cat.includes("DIỄN ĐÀN") ||
    title.includes("B2B") ||
    title.includes("KẾT NỐI") ||
    title.includes("GIAO THƯƠNG")
  ) {
    return "b2b";
  }
  return "regular";
}

export function formatEventDateBadge(dateVal?: string, fallbackIndex: number = 0) {
  if (dateVal) {
    const d = new Date(dateVal);
    if (!isNaN(d.getTime())) {
      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const days = ["CN,", "T2,", "T3,", "T4,", "T5,", "T6,", "T7,"];
      const weekday = days[d.getDay()] || "CN,";
      return { weekday, dayMonth: `${day}/${month}` };
    }
  }
  const defaultDates = [
    { weekday: "CN,", dayMonth: "27/09" },
    { weekday: "T7,", dayMonth: "28/03" },
    { weekday: "T6,", dayMonth: "15/10" },
    { weekday: "T5,", dayMonth: "20/11" },
  ];
  return defaultDates[fallbackIndex % defaultDates.length];
}

export function isEventPast(event: MyEvent): boolean {
  if (!event) return false;
  if ((event as any).isPast !== undefined) return Boolean((event as any).isPast);
  if ((event as any).status === "ended" || (event as any).status === "completed" || (event as any).status === "cancelled") return true;
  if (!event.date) return false;
  const d = new Date(event.date);
  if (isNaN(d.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const eventDay = new Date(d);
  eventDay.setHours(23, 59, 59, 999);
  return eventDay < today;
}

export function makeTicketQrUrl(ticketData: {
  ticketCode: string;
  attendeeName?: string;
  attendeePhone?: string;
  attendeeCompany?: string;
  attendeePosition?: string;
  eventTitle?: string;
  eventDate?: string;
  eventLocation?: string;
  ticketType?: string;
  seatAssignment?: string;
  luckyNumber?: string;
  ticketCount?: number;
}) {
  // Mã QR check-in sự kiện chuẩn xác phải mã hóa trực tiếp ticketCode (registrationId) để máy quét nhận diện ngay
  return getQrUrl(ticketData.ticketCode, 320);
}

export const SECTIONS_CONFIG = [
  {
    key: "gala" as const,
    title: "Đại Hội & Gala Toàn Thể",
    titleEn: "Grand Gala & Summits",
    subtitle: "Chi tiết về đại hội cấp hiệp hội & vinh danh doanh nhân tiêu biểu, dạ tiệc tối nhà hàng sang trọng và các sự kiện tầm cỡ...",
    subtitleEn: "Official association summits, honorary entrepreneur galas, luxury evening banquets and premier celebrations...",
    icon: Trophy,
    variant: "hero" as const,
  },
  {
    key: "workshop" as const,
    title: "Hội Thảo & Workshop Chuyên Đề",
    titleEn: "Workshops & Masterclasses",
    subtitle: "Nâng cao năng lực quản trị, chuyển đổi số, kế thừa cơ nghiệp gia đình đa thế hệ & tối ưu hóa vận hành tinh gọn...",
    subtitleEn: "Executive governance masterclasses, digital transformation, multi-generation family business succession...",
    icon: GraduationCap,
    variant: "grid" as const,
  },
  {
    key: "b2b" as const,
    title: "Tọa Đàm & Giao Thương B2B",
    titleEn: "B2B Matching & Business Forums",
    subtitle: "Kết nối cung cầu, tìm kiếm đối tác chiến lược, ký kết hợp tác kinh doanh đa ngành và xúc tiến đầu tư...",
    subtitleEn: "Connecting supply & demand, strategic business partnerships, cross-industry dealmaking and investments...",
    icon: Handshake,
    variant: "default" as const,
  },
  {
    key: "regular" as const,
    title: "Sinh Hoạt Định Kỳ & Coffee CEO",
    titleEn: "Regular Meetings & Coffee Networking",
    subtitle: "Gặp gỡ thân mật hàng tuần, giao lưu cởi mở, kết nối hội viên và chia sẻ bài học kinh nghiệm điều hành thực chiến...",
    subtitleEn: "Weekly casual meetups, open networking, peer connections and practical business leadership sharing...",
    icon: Coffee,
    variant: "default" as const,
  },
];

function EventPosterCard({
  event,
  index,
  onSelect,
  isBookmarked,
  onToggleBookmark,
  registered,
  isFree,
  price,
  isPast = false,
  onUnregister,
  onOpenRecap,
  variant = "default",
}: {
  event: MyEvent;
  index: number;
  onSelect: (e: MyEvent) => void;
  isBookmarked: boolean;
  onToggleBookmark: (id: string) => void;
  registered: boolean;
  isFree: boolean;
  price: number;
  isPast?: boolean;
  onUnregister?: (e: MyEvent, evt: React.MouseEvent) => void;
  onOpenRecap?: (e: MyEvent) => void;
  variant?: "hero" | "grid" | "default";
}) {
  const rawImg = (event as any).image;
  const evImg = rawImg ? resolveMediaUrl(rawImg) || rawImg : null;
  const fallbackImg = defaultEventImages[index % defaultEventImages.length];
  const displayImg = evImg || fallbackImg;
  const agenda = getEventAgenda(event, index);
  const isFull = isEventFull(event);

  const eventDateStr = safeFormatEventDate(
    event.date,
    `${event.day || 20}/${event.month || 10}/2026`
  );

  const { day: dayNumber, month: monthStr } = safeGetEventDayMonth(
    event.date,
    Number(event.day) || 20,
    Number(event.month) || 10
  );

  return (
    <div
      role="listitem"
      id={index === 0 ? "tour-events-card" : undefined}
      onClick={() => onSelect(event)}
      className="self-stretch bg-white dark:bg-[#111927] rounded-3xl shadow-[0px_1.05px_2.11px_0px_rgba(23,32,57,0.03)] outline outline-1 outline-offset-[-1.05px] outline-slate-200 dark:outline-slate-800 flex flex-col justify-start items-start overflow-hidden cursor-pointer hover:shadow-lg transition-all active:scale-[0.99] group"
    >
      {/* ── THUMBNAIL BANNER (FIGMA STANDARD) ── */}
      <div className="w-full h-44 sm:h-48 relative overflow-hidden bg-slate-900 shrink-0">
        <img
          src={displayImg}
          alt={event.title}
          loading="lazy"
          onError={(evt) => {
            const target = evt.currentTarget;
            if (target.src !== fallbackImg) {
              target.src = fallbackImg;
            }
          }}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Gradient overlay for badges */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/30 pointer-events-none" />

        {/* Date badge top left */}
        <div className="w-12 h-10 left-[12.64px] top-[12.64px] absolute bg-slate-950/90 rounded-2xl outline outline-1 outline-offset-[-1.05px] outline-white/20 inline-flex flex-col justify-center items-center overflow-hidden shadow-md z-10">
          <div className="text-yellow-400 text-[10px] font-bold font-sans leading-none">{monthStr}</div>
          <div className="text-white text-base font-bold font-sans leading-none mt-0.5">{dayNumber}</div>
        </div>

        {/* Status badge top right */}
        <div
          className={`px-2.5 py-1 right-[48px] top-[12.64px] absolute rounded-3xl inline-flex justify-start items-center gap-1.5 shadow-md z-10 ${
            isPast
              ? "bg-slate-700 text-slate-200"
              : registered
              ? "bg-blue-600 text-white"
              : isFull
              ? "bg-rose-600 text-white"
              : isFree
              ? "bg-sky-500 text-white"
              : "bg-[#003B95] text-white font-bold"
          }`}
        >
          <div className="size-1.5 bg-white rounded-full" />
          <div className="text-[9.5px] font-bold font-sans leading-none">
            {isPast
              ? "Đã kết thúc"
              : registered
              ? "Đã đăng ký"
              : isFull
              ? "Đã hết vé"
              : isFree
              ? "Đang mở - miễn phí"
              : `${new Intl.NumberFormat("vi-VN").format(price)} đ`}
          </div>
        </div>

        {/* Bookmark icon top right */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleBookmark(event.id);
            toast.success(isBookmarked ? "Đã bỏ lưu sự kiện" : "Đã lưu sự kiện vào danh sách quan tâm");
          }}
          className={`size-8 right-[12.64px] top-[12.64px] absolute rounded-full outline outline-1 outline-offset-[-1.05px] outline-white/20 inline-flex justify-center items-center overflow-hidden transition cursor-pointer shadow-md z-10 ${
            isBookmarked
              ? "bg-[#003B95] text-white font-bold"
              : "bg-stone-900/80 hover:bg-stone-800 text-white"
          }`}
          title={isBookmarked ? "Bỏ lưu sự kiện" : "Lưu sự kiện"}
        >
          <Bookmark className={`size-4 ${isBookmarked ? "fill-white text-white" : ""}`} />
        </button>

        {/* Status pill bottom left */}
        <div className="h-5 px-2.5 left-[10.54px] bottom-[10.54px] absolute bg-emerald-600/90 backdrop-blur-xs rounded-[31.61px] inline-flex justify-start items-center gap-1.5 shadow-md z-10">
          <div className="size-1.5 bg-emerald-200 rounded-full animate-pulse" />
          <div className="text-white text-[9.48px] font-bold font-sans leading-none">
            {isPast ? "Kỷ yếu sự kiện" : registered ? "Đã giữ chỗ thành công" : isFree ? "Đang mở · Miễn phí" : "Đang mở bán vé"}
          </div>
        </div>
      </div>

      {/* ── BODY CONTENT (FIGMA STANDARD) ── */}
      <div className="self-stretch px-3.5 pt-3.5 pb-2.5 flex flex-col justify-start items-start gap-2.5 overflow-hidden">
        {/* Category Tag + Time */}
        <div className="self-stretch inline-flex justify-between items-center overflow-hidden">
          <div className="px-2.5 py-[3.16px] bg-slate-100 dark:bg-slate-800 rounded-[105.36px] outline outline-[0.74px] outline-offset-[-0.74px] outline-slate-200 dark:outline-slate-700 flex justify-start items-start">
            <span className="text-slate-800 dark:text-slate-200 text-[9.48px] font-bold font-sans leading-3">
              {agenda.category || "SỰ KIỆN CLB CEO 1983"}
            </span>
          </div>
          <div className="flex justify-start items-center gap-1 text-slate-500 dark:text-slate-400">
            <Clock className="size-3 text-slate-400" />
            <span className="text-xs font-normal font-sans leading-4">{formatEventTimeRange(event, event.title)}</span>
          </div>
        </div>

        {/* Title */}
        <div className="self-stretch text-slate-800 dark:text-white text-sm font-bold font-sans leading-5 group-hover:text-[#003B95] dark:group-hover:text-blue-400 transition-colors line-clamp-2">
          {event.title}
        </div>

        {/* Date row */}
        <div className="inline-flex justify-start items-center gap-1.5 text-slate-500 dark:text-slate-400">
          <Calendar className="size-3.5 text-[#003B95]" />
          <span className="text-xs font-sans leading-4">{eventDateStr}</span>
        </div>

        {/* Location row */}
        <div className="self-stretch inline-flex justify-start items-center gap-1.5 text-slate-500 dark:text-slate-400">
          <MapPin className="size-3.5 text-[#003B95] shrink-0" />
          <span className="flex-1 text-xs font-normal font-sans line-clamp-1">
            {event.place || "Hà Nội"}
          </span>
        </div>

        {/* Divider */}
        <div className="self-stretch h-px bg-gray-100 dark:bg-slate-800" />

        {/* Footer Actions */}
        <div className="self-stretch h-6 inline-flex justify-between items-center">
          <div className="flex justify-start items-center gap-2">
            <span className="text-slate-500 dark:text-slate-400 text-xs font-normal font-sans leading-4">
              {registered ? "Đã giữ chỗ" : "Mở cho toàn thể Hội viên"}
            </span>
            {!isPast && (
              <button
                type="button"
                onClick={(evt) => {
                  evt.stopPropagation();
                  executeShare(
                    {
                      type: "event",
                      id: event.id,
                      title: `[Sự Kiện CEO 1983] ${event.title}`,
                      desc: `${eventDateStr} tại ${event.place || "Hà Nội"}. ${event.description || ""}`,
                      image: displayImg || undefined,
                      targetPath: `/guest-event-register/${event.id}`,
                    },
                    () => toast.success("Đã sao chép liên kết sự kiện để chia sẻ!")
                  );
                }}
                className="px-2 py-[3.16px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-[31.61px] outline outline-[0.74px] outline-offset-[-0.74px] outline-slate-200 dark:outline-slate-700 flex justify-start items-center gap-1 transition cursor-pointer"
                title="Chia sẻ sự kiện"
              >
                <Share2 className="size-3 text-[#003B95] dark:text-blue-400" />
                <span className="text-[#003B95] dark:text-blue-400 text-[9.48px] font-bold font-sans leading-3">Chia sẻ</span>
              </button>
            )}
            {!isPast && (
              <button
                type="button"
                onClick={(evt) => {
                  evt.stopPropagation();
                  toast.success("Đã đồng bộ sự kiện vào Calendar trên điện thoại thành công!");
                }}
                className="px-2 py-[3.16px] bg-slate-100 dark:bg-slate-800 rounded-[31.61px] outline outline-[0.74px] outline-offset-[-0.74px] outline-slate-200 dark:outline-slate-700 flex justify-start items-center gap-1 hover:bg-slate-200 transition cursor-pointer"
              >
                <Calendar className="size-3 text-[#003B95] dark:text-[#003B95]" />
                <span className="text-[#003B95] dark:text-[#003B95] text-[9.48px] font-normal font-sans leading-3">Lịch</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {registered && !isPast && onUnregister && (
              <button
                type="button"
                onClick={(evt) => onUnregister(event, evt)}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-[10.5px] font-bold hover:bg-rose-100 transition cursor-pointer active:scale-95"
                title="Hủy vé đã đăng ký"
              >
                <X className="h-3 w-3 stroke-[2.5]" />
                <span>Hủy vé</span>
              </button>
            )}
            {isPast ? (
              <button
                type="button"
                onClick={(evt) => {
                  evt.stopPropagation();
                  if (onOpenRecap) onOpenRecap(event);
                  else onSelect(event);
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#003B95] hover:bg-[#002B70] text-white text-[11px] font-bold shadow-xs transition active:scale-95 cursor-pointer"
                title="Xem biên bản, nhà tài trợ, biểu quyết, giải thưởng, chỗ ngồi & ảnh drive"
              >
                <Trophy className="size-3 text-amber-300" />
                <span>Biên bản & Kỷ niệm</span>
              </button>
            ) : (
              <div className="flex justify-start items-center gap-1 text-[#003B95] hover:text-amber-700 dark:text-[#003B95] font-bold text-xs font-sans group cursor-pointer">
                <span>{registered ? "Xem vé" : isFull ? "Xem chi tiết" : "Đăng ký vé"}</span>
                <ArrowRight className="size-3 group-hover:translate-x-0.5 transition-transform" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// COMPONENT 5 SỰ KIỆN CHẠY TỪ PHẢI SANG TRÁI VỚI HIỆU ỨNG COVERFLOW NỔI TO Ở GIỮA
function UpcomingEventsCoverflow({
  events,
  onSelectEvent,
}: {
  events: MyEvent[];
  onSelectEvent: (e: MyEvent) => void;
}) {
  const fiveEvents = useMemo(() => {
    return events.slice(0, 5);
  }, [events]);

  const [activeIdx, setActiveIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Tự động chạy tuần hoàn từ phải sang trái (activeIdx tăng dần)
  useEffect(() => {
    if (isPaused || fiveEvents.length === 0) return;
    const timer = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % fiveEvents.length);
    }, 3800);
    return () => clearInterval(timer);
  }, [isPaused, fiveEvents.length]);

  if (fiveEvents.length === 0) return null;

  return (
    <div
      className="relative w-full pt-1 pb-1 overflow-hidden select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      {/* 3D Coverflow Stage - Giảm chiều cao 1 nửa (h-32 sm:h-36) theo yêu cầu người dùng */}
      <div className="relative h-32 sm:h-36 flex items-center justify-center">
        {fiveEvents.map((evt, idx) => {
          let offset = (idx - activeIdx) % fiveEvents.length;
          if (offset < -2) offset += fiveEvents.length;
          if (offset > 2) offset -= fiveEvents.length;

          const isCenter = offset === 0;

          let translateX = "0%";
          let scale = 1;
          let zIndex = 20;
          let opacity = 1;

          if (offset === 0) {
            translateX = "0%";
            scale = 1.06;
            zIndex = 30;
            opacity = 1;
          } else if (offset === -1) {
            translateX = "-64%";
            scale = 0.88;
            zIndex = 15;
            opacity = 0.65;
          } else if (offset === 1) {
            translateX = "64%";
            scale = 0.88;
            zIndex = 15;
            opacity = 0.65;
          } else if (offset === -2) {
            translateX = "-115%";
            scale = 0.72;
            zIndex = 5;
            opacity = 0.25;
          } else if (offset === 2) {
            translateX = "115%";
            scale = 0.72;
            zIndex = 5;
            opacity = 0.25;
          }

          const rawImg =
            (evt as any).image ||
            (evt as any).banner ||
            (evt as any).posterUrl ||
            (evt as any).imageUrl ||
            (evt as any).coverImage;
          const imgUrl = (rawImg ? resolveMediaUrl(rawImg) || rawImg : null) || defaultEventImages[idx % defaultEventImages.length];
          const agenda = getEventAgenda(evt, idx);

          const eventDateStr = safeFormatEventDate(
            evt.date,
            `${evt.day || 27}/${evt.month || 9}/2026`
          );

          return (
            <div
              key={evt.id || idx}
              onClick={() => {
                if (isCenter) {
                  onSelectEvent(evt);
                } else {
                  setActiveIdx(idx);
                }
              }}
              style={{
                transform: `translateX(${translateX}) scale(${scale})`,
                zIndex,
                opacity,
              }}
              className={`group/slide absolute top-0 bottom-0 w-[84%] sm:w-[68%] max-w-[420px] my-auto cursor-pointer rounded-xl sm:rounded-2xl overflow-hidden shadow-lg transition-all duration-500 ease-out ${
                isCenter
                  ? "shadow-[0_16px_36px_rgba(0,0,0,0.65)] ring-1 ring-white/20"
                  : "hover:opacity-90"
              }`}
            >
              {/* Ảnh poster sự kiện */}
              <img
                src={imgUrl}
                alt={evt.title}
                className="w-full h-full object-cover select-none pointer-events-none"
              />

              {/* Lớp gradient cinematic phủ lên ảnh */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-black/35 pointer-events-none" />

              {/* Header trên ảnh: Badge ngày tháng & Thẻ danh mục */}
              <div className="absolute top-2 inset-x-2.5 flex items-center justify-between gap-1.5 pointer-events-none">
                <span className="inline-flex items-center gap-1 rounded-md bg-black/70 backdrop-blur-md border border-white/20 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
                  <Calendar className="h-2.5 w-2.5 text-white/80" />
                  <span>{eventDateStr}</span>
                </span>
                <span className="rounded-full bg-[#001B54] text-white border border-white/20 font-black text-[9px] uppercase tracking-wider px-2 py-0.5 shadow-sm">
                  {agenda.category || "Tiêu điểm"}
                </span>
              </div>

              {/* Content dưới đáy ảnh: Tiêu đề + Địa điểm + Nút xem nhanh */}
              <div className="absolute bottom-0 inset-x-0 p-2.5 text-white flex flex-col justify-end pointer-events-none">
                <h4 className="font-extrabold text-[12px] sm:text-[13.5px] leading-tight line-clamp-1 text-white drop-shadow-md">
                  {evt.title}
                </h4>

                <div className="mt-1 flex items-center justify-between text-[10px] text-slate-200/90 font-medium">
                  <span className="flex items-center gap-1 truncate max-w-[70%]">
                    <MapPin className="h-2.5 w-2.5 text-slate-300 shrink-0" />
                    <span className="truncate">{evt.place || "Hà Nội"}</span>
                  </span>
                  {isCenter ? (
                    <span className="inline-flex items-center gap-0.5 rounded-full bg-white text-slate-900 border border-white/30 px-2 py-0.5 text-[9px] font-black uppercase tracking-wide shadow-sm">
                      <span>Xem ngay</span>
                      <ArrowRight className="h-2.5 w-2.5" />
                    </span>
                  ) : evt.time ? (
                    <span className="text-slate-300 text-[9.5px]">{evt.time}</span>
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Dấu chấm chuyển trang hiện đại (Pagination Dots) */}
      <div className="flex items-center justify-center gap-1.5 mt-3 mb-1">
        {fiveEvents.map((_, dotIdx) => {
          const isActive = dotIdx === activeIdx;
          return (
            <button
              key={dotIdx}
              type="button"
              onClick={() => setActiveIdx(dotIdx)}
              aria-label={`Chuyển đến slide ${dotIdx + 1}`}
              className={`transition-all duration-300 rounded-full cursor-pointer ${
                isActive
                  ? "w-6 h-1.5 bg-[#001B54] dark:bg-white shadow-xs"
                  : "w-1.5 h-1.5 bg-slate-300 hover:bg-slate-400 dark:bg-slate-700 dark:hover:bg-slate-600"
              }`}
            />
          );
        })}
      </div>
    </div>
  );
}

function formatEventDayOfWeekAndDate(dateVal: any): string {
  if (!dateVal) return "T5, 12/11/2026";
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return typeof dateVal === "string" && dateVal.trim() ? dateVal : "T5, 12/11/2026";
    const days = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
    const dayOfWeek = days[d.getDay()];
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${dayOfWeek}, ${day}/${month}/${year}`;
  } catch {
    return "T5, 12/11/2026";
  }
}

export function formatEventTimeRange(ev: any, title?: string): string {
  const sTime = ev?.startTime || ev?.start_time;
  const eTime = ev?.endTime || ev?.end_time;
  if (sTime && eTime && sTime !== "00:00" && eTime !== "00:00") {
    return `${sTime} - ${eTime}`;
  }
  if (sTime && sTime !== "00:00") {
    return `${sTime} - 17:30`;
  }
  const t = ev?.time;
  if (t && t.includes("-") && !t.includes("00:00 - 00:00")) return t;
  if (t && t !== "00:00") return `${t} - 17:30`;

  if (ev?.date) {
    try {
      const d = new Date(ev.date);
      if (!isNaN(d.getTime()) && (d.getHours() !== 0 || d.getMinutes() !== 0)) {
        const hh = String(d.getHours()).padStart(2, "0");
        const mm = String(d.getMinutes()).padStart(2, "0");
        return `${hh}:${mm} - 21:30`;
      }
    } catch {}
  }

  const tl = (title || ev?.title || ev?.name || "").toLowerCase();
  if (tl.includes("golf")) return "06:00 - 15:30";
  if (tl.includes("gala") || tl.includes("kỷ niệm") || tl.includes("đại hội")) return "18:00 - 22:00";
  if (tl.includes("tọa đàm") || tl.includes("workshop") || tl.includes("diễn đàn")) return "08:30 - 11:45";
  if (tl.includes("caravan")) return "07:00 - 18:00";
  return "08:00 - 17:30";
}

const defaultUpcomingEvents: MyEvent[] = [
  {
    id: "ev-upcoming-01",
    title: "Hội Thảo Giao Thương & Chuyển Đổi Số CEO 1983 (Miễn Phí)",
    date: "2026-11-12T00:00:00Z",
    place: "Hội trường Cung Tri Thức Thành Phố, Cầu Giấy, Hà Nội",
    time: "00:00",
    ticketPrice: 0,
    image: defaultEventImages[0],
    category: "Giao thương B2B",
  } as any,
  {
    id: "ev-upcoming-02",
    title: "Diễn Đàn Quản Trị & Xúc Tiến Đầu Tư Quốc Tế CEO 1983",
    date: "2026-11-20T08:30:00Z",
    place: "Trung tâm Hội nghị Quốc gia, Hà Nội",
    time: "08:30",
    ticketPrice: 0,
    image: defaultEventImages[1],
    category: "Giao thương B2B",
  } as any,
  {
    id: "ev-upcoming-03",
    title: "Gala Gặp Gỡ Doanh Nhân Đồng Niên Quý Hợi 1983 Toàn Quốc",
    date: "2026-12-05T18:00:00Z",
    place: "Khách sạn JW Marriott, Hà Nội",
    time: "18:00",
    ticketPrice: 500000,
    image: defaultEventImages[2],
    category: "Gala & Đại hội",
  } as any,
];

const defaultAllEvents: MyEvent[] = [
  {
    id: "e1983000-0000-4000-8000-000000000001",
    title: "Đại Hội Thường Niên & Gala Vinh Danh CEO 1983 Xuất Sắc",
    name: "Đại Hội Thường Niên & Gala Vinh Danh CEO 1983 Xuất Sắc",
    date: "2026-11-28T18:00:00Z",
    place: "Trung Tâm Hội Nghị Quốc Gia (NCC), Số 1 Đại Lộ Thăng Long, Hà Nội",
    location: "Trung Tâm Hội Nghị Quốc Gia (NCC), Số 1 Đại Lộ Thăng Long, Hà Nội",
    time: "18:00",
    ticketPrice: 500000,
    fee: 500000,
    image: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80",
    category: "Gala & Đại Hội",
    type: "Gala & Đại Hội",
    statusText: "Đang mở bán vé (500.000 đ)",
  } as any,
  {
    id: "e1983000-0000-4000-8000-000000000002",
    title: "Diễn Đàn Kết Nối Giao Thương B2B & Chuỗi Cung Ứng 2026",
    name: "Diễn Đàn Kết Nối Giao Thương B2B & Chuỗi Cung Ứng 2026",
    date: "2026-11-18T08:30:00Z",
    place: "Khách sạn JW Marriott Hanoi, Số 8 Đỗ Đức Dục, Nam Từ Liêm, Hà Nội",
    location: "Khách sạn JW Marriott Hanoi, Số 8 Đỗ Đức Dục, Nam Từ Liêm, Hà Nội",
    time: "08:30",
    ticketPrice: 0,
    fee: 0,
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80",
    category: "Giao thương B2B",
    type: "Giao thương B2B",
    statusText: "Miễn phí",
  } as any,
  {
    id: "e1983000-0000-4000-8000-000000000003",
    title: "Tọa Đàm: Quản Trị Tối Ưu Dòng Tiền & Tái Cấu Trúc Vốn Doanh Nghiệp",
    name: "Tọa Đàm: Quản Trị Tối Ưu Dòng Tiền & Tái Cấu Trúc Vốn Doanh Nghiệp",
    date: "2026-11-22T14:00:00Z",
    place: "Cung Tri Thức Thành Phố, Số 1 Tôn Thất Thuyết, Cầu Giấy, Hà Nội",
    location: "Cung Tri Thức Thành Phố, Số 1 Tôn Thất Thuyết, Cầu Giấy, Hà Nội",
    time: "14:00",
    ticketPrice: 0,
    fee: 0,
    image: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80",
    category: "Đào tạo & Tọa đàm",
    type: "Đào tạo & Tọa đàm",
    statusText: "Miễn phí",
  } as any,
  {
    id: "e1983000-0000-4000-8000-000000000004",
    title: "Caravan Doanh Nhân CEO 1983: Hành Trình Kết Nối & Thiện Nguyện Tây Bắc",
    name: "Caravan Doanh Nhân CEO 1983: Hành Trình Kết Nối & Thiện Nguyện Tây Bắc",
    date: "2026-12-05T06:00:00Z",
    place: "Xuất phát từ Hà Nội - Yên Bái - Sapa (Lào Cai)",
    location: "Xuất phát từ Hà Nội - Yên Bái - Sapa (Lào Cai)",
    time: "06:00",
    ticketPrice: 3500000,
    fee: 3500000,
    image: "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80",
    category: "Caravan & Xúc tiến",
    type: "Caravan & Xúc tiến",
    statusText: "3.500.000 đ",
  } as any,
  {
    id: "e1983000-0000-4000-8000-000000000005",
    title: "Cafe Doanh Nhân Sáng Thứ 6: Chia Sẻ Cơ Hội Hợp Tác Đầu Tư B2B",
    name: "Cafe Doanh Nhân Sáng Thứ 6: Chia Sẻ Cơ Hội Hợp Tác Đầu Tư B2B",
    date: "2026-11-20T07:30:00Z",
    place: "Trung Nguyên Legend Cafe, Tòa nhà Keangnam Landmark 72, Cầu Giấy, Hà Nội",
    location: "Trung Nguyên Legend Cafe, Tòa nhà Keangnam Landmark 72, Cầu Giấy, Hà Nội",
    time: "07:30",
    ticketPrice: 0,
    fee: 0,
    image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80",
    category: "Cafe Doanh Nhân",
    type: "Cafe Doanh Nhân",
    statusText: "Miễn phí",
  } as any,
  {
    id: "e1983000-0000-4000-8000-000000000006",
    title: "Workshop: Ứng Dụng AI & Tự Động Hóa Vận Hành Doanh Nghiệp SME",
    name: "Workshop: Ứng Dụng AI & Tự Động Hóa Vận Hành Doanh Nghiệp SME",
    date: "2026-11-25T13:30:00Z",
    place: "Phòng Hội Thảo Tầng 12, Tòa nhà CEO 1983 Tower, Hà Nội & Online Zoom",
    location: "Phòng Hội Thảo Tầng 12, Tòa nhà CEO 1983 Tower, Hà Nội & Online Zoom",
    time: "13:30",
    ticketPrice: 0,
    fee: 0,
    image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80",
    category: "Đào tạo & Tọa đàm",
    type: "Đào tạo & Tọa đàm",
    statusText: "Miễn phí",
  } as any,
  {
    id: "e1983000-0000-4000-8000-000000000007",
    title: "Giải Golf Hữu Nghị CEO 1983 Championship 2026",
    name: "Giải Golf Hữu Nghị CEO 1983 Championship 2026",
    date: "2026-12-12T06:30:00Z",
    place: "Sân Golf Long Biên, Phúc Đồng, Long Biên, Hà Nội",
    location: "Sân Golf Long Biên, Phúc Đồng, Long Biên, Hà Nội",
    time: "06:30",
    ticketPrice: 2800000,
    fee: 2800000,
    image: "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&w=1200&q=80",
    category: "Thể thao & Giao lưu",
    type: "Thể thao & Giao lưu",
    statusText: "2.800.000 đ",
  } as any,
  {
    id: "e1983000-0000-4000-8000-000000000008",
    title: "Lễ Kỷ Niệm 4 Năm Thành Lập CLB Doanh Nhân CEO 1983 (2022 - 2026)",
    name: "Lễ Kỷ Niệm 4 Năm Thành Lập CLB Doanh Nhân CEO 1983 (2022 - 2026)",
    date: "2026-10-15T18:30:00Z",
    place: "Khách sạn Pan Pacific Hanoi, Số 1 Thanh Niên, Ba Đình, Hà Nội",
    location: "Khách sạn Pan Pacific Hanoi, Số 1 Thanh Niên, Ba Đình, Hà Nội",
    time: "18:30",
    ticketPrice: 0,
    fee: 0,
    image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80",
    category: "Gala & Đại Hội",
    type: "Gala & Đại Hội",
    statusText: "Đã diễn ra",
  } as any,
];

const defaultRecentEvents = [
  {
    id: "rec-01",
    title: "Test Event Paid ID Catch",
    subtitle: "CEO 1983",
    image: defaultEventImages[3],
    event: defaultAllEvents[0],
  },
  {
    id: "rec-02",
    title: "Test Event Paid ID Catch",
    subtitle: "CEO 1983",
    image: defaultEventImages[4],
    event: defaultAllEvents[1],
  },
];

const defaultMeetingsList = [
  {
    id: "meet-demo-01",
    title: "Test Offline Meeting",
    time: "09:00",
    location: "Cung Tri Thuc",
    isOnline: false,
    category: "fixed_committee",
    isExtraordinary: false,
  },
  {
    id: "meet-demo-02",
    title: "Hẹn gặp 1-1 trao đổi liên kết dịch vụ B2B",
    time: "09:00 - 10:30",
    location: "meet.jit.si/CEO1983_Connect_1on1",
    meetingLink: "https://meet.jit.si/CEO1983_Connect_1on1",
    isOnline: true,
    category: "fixed_committee",
    isExtraordinary: false,
  },
];

function FeaturedUpcomingEventHero({
  events,
  onSelectEvent,
}: {
  events: MyEvent[];
  onSelectEvent: (e: MyEvent) => void;
}) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const displayList = events;

  useEffect(() => {
    if (isPaused || !displayList || displayList.length <= 1) return;
    const timer = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % displayList.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [isPaused, displayList?.length]);

  if (!displayList || displayList.length === 0) return null;

  const activeEvent = displayList[activeIdx] || displayList[0];
  const rawImg =
    (activeEvent as any).image ||
    (activeEvent as any).banner ||
    (activeEvent as any).posterUrl ||
    (activeEvent as any).coverImage ||
    (activeEvent as any).photo_gallery_url;
  const imgUrl = (rawImg ? resolveMediaUrl(rawImg) || rawImg : null) || defaultEventImages[activeIdx % defaultEventImages.length];
  const dateStr = safeFormatEventDate(activeEvent.date, "12/11/2026");
  const categoryStr = (activeEvent as any).category || "Giao thương B2B";

  return (
    <div
      className="self-stretch flex flex-col justify-start items-center gap-2"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      <div
        onClick={() => onSelectEvent(activeEvent)}
        data-dark-card
        className="self-stretch h-44 relative rounded-2xl overflow-hidden cursor-pointer shadow-xs group"
      >
        <img
          className="w-full h-72 left-0 top-[-47px] absolute object-cover group-hover:scale-105 transition-transform duration-500"
          src={imgUrl}
          alt={activeEvent.title}
          onError={(e) => {
            const target = e.currentTarget;
            const currentSrc = target.src;
            if (currentSrc.includes("ceo1983.viconnect.vn") && !currentSrc.includes("crm.ceo1983.viconnect.vn")) {
              target.src = currentSrc.replace("ceo1983.viconnect.vn", "crm.ceo1983.viconnect.vn");
            } else {
              target.src = defaultEventImages[activeIdx % defaultEventImages.length];
            }
          }}
        />
        <div className="w-full h-40 left-0 top-[22px] absolute bg-gradient-to-b from-black/0 via-black/40 to-black/90 pointer-events-none" />
        <div className="w-full h-full left-0 top-0 absolute flex flex-col justify-between p-3">
          {/* Top badges */}
          <div className="self-stretch inline-flex justify-between items-start">
            <div className="px-2 py-0.5 bg-white/90 dark:bg-slate-900/90 rounded-xl border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-md flex justify-start items-center gap-1 shadow-2xs">
              <img src="/icons/events/calendar-03.svg" className="size-3.5" alt="calendar" />
              <span className="text-slate-800 dark:text-slate-100 text-xs font-normal font-['Inter'] leading-4">
                {dateStr}
              </span>
            </div>
            <div className="px-2 py-0.5 bg-blue-50/90 dark:bg-blue-950/90 text-[#003B95] dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-full text-xs font-semibold backdrop-blur-md">
              {categoryStr}
            </div>
          </div>

          {/* Bottom content */}
          <div className="self-stretch flex flex-col justify-end items-start gap-1">
            <div className="self-stretch text-white text-sm font-semibold font-['Inter'] leading-5 line-clamp-1 drop-shadow-sm">
              {activeEvent.title}
            </div>
            <div className="self-stretch pt-1 inline-flex justify-between items-center gap-2">
              <div className="flex-1 h-4 flex justify-start items-center gap-1 overflow-hidden">
                <img src="/icons/events/location-01.svg" className="size-4 shrink-0 brightness-0 invert drop-shadow-sm" alt="location" />
                <span className="flex-1 !text-white text-xs font-medium font-['Inter'] leading-4 truncate drop-shadow-sm">
                  {activeEvent.place || "Hội trường Cung Tri Thức Thành Phố, Cầu Giấy, Hà Nội"}
                </span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectEvent(activeEvent);
                }}
                className="px-3 py-1.5 bg-white text-[#003B95] rounded-lg border border-slate-200 flex justify-start items-center gap-1.5 text-xs font-semibold shadow-xs hover:bg-slate-50 active:scale-95 transition cursor-pointer shrink-0"
              >
                <span>Xem ngay</span>
                <img src="/icons/events/arrow-right-02.svg" className="size-4" alt="arrow" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Pagination dots */}
      <div className="inline-flex justify-start items-center gap-[3px]">
        {displayList.slice(0, 4).map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setActiveIdx(i)}
            className={`transition-all duration-300 cursor-pointer ${
              i === activeIdx
                ? "w-2.5 h-1 bg-[#003B95] rounded-[99px]"
                : "size-1 bg-slate-300 dark:bg-slate-700 rounded-[99px] hover:bg-slate-400"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function EventsScreen() {
  const t = useT();
  const { lang } = useLang();
  const isEn = lang === "en";
  const navigate = useNavigate();
  const { user } = useAuth();

  const fetchEvents = useServerFn(listMyEvents);
  const fetchMember = useServerFn(getMyMember);
  const doRegister = useServerFn(registerForEvent);
  const doCancel = useServerFn(cancelEventRegistration);
  const { data: serverEvents, loading, reload } = useServerData<MyEvent[]>(() => fetchEvents(), [], "vba_events");
  const { data: member } = useServerData<MyMember | null>(() => fetchMember(), null, "vba_my_member");

  const [busy, setBusy] = useState<string | null>(null);
  const [localRegistered, setLocalRegistered] = useState<Record<string, boolean>>(() => {
    if (typeof window === "undefined") return {};
    try {
      const records = JSON.parse(localStorage.getItem("vba_registered_event_records") || "[]");
      if (Array.isArray(records)) {
        const map: Record<string, boolean> = {};
        records.forEach((r: any) => {
          if (r.eventId) map[r.eventId] = true;
          if (r.id) map[r.id] = true;
        });
        return map;
      }
      return {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    const handleEventsChanged = () => {
      try {
        const records = JSON.parse(localStorage.getItem("vba_registered_event_records") || "[]");
        if (Array.isArray(records)) {
          const map: Record<string, boolean> = {};
          records.forEach((r: any) => {
            if (r.eventId) map[r.eventId] = true;
            if (r.id) map[r.id] = true;
          });
          setLocalRegistered(map);
        } else {
          setLocalRegistered({});
        }
      } catch {}
    };
    window.addEventListener("vba.events.changed", handleEventsChanged);
    return () => window.removeEventListener("vba.events.changed", handleEventsChanged);
  }, []);

  // 2 Kiểu: 1 là Sự kiện CLB, 2 là Cuộc họp gặp mặt (Chuẩn YBA Sài Gòn)
  const [mainTab, setMainTab] = useState<"events" | "meetings">("events");
  const [meetingsList, setMeetingsList] = useState<any[]>([]);
  const [loadingMeetings, setLoadingMeetings] = useState(false);
  const [activeMeetingRoom, setActiveMeetingRoom] = useState<{ title: string; link: string } | null>(null);

  useEffect(() => {
    setLoadingMeetings(true);
    fetchNestApi<any[]>("/meetings")
      .then((res: any) => {
        if (Array.isArray(res) && res.length > 0) {
          setMeetingsList(res);
        } else {
          setMeetingsList([]);
        }
      })
      .catch(() => {
        setMeetingsList([]);
      })
      .finally(() => setLoadingMeetings(false));
  }, []);

  // Category & bookmark state
  const [eventCategory, setEventCategory] = useState<
    "all" | "upcoming" | "free" | "paid" | "registered" | "bookmarked" | "history" | "b2b" | "gala" | "training" | "caravan"
  >("all");
  const [activityFilter, setActivityFilter] = useState<"all" | "fixed_committee" | "extraordinary">("all");
  const [recapModalEvent, setRecapModalEvent] = useState<MyEvent | any | null>(null);
  const [eventsPage, setEventsPage] = useState(1);
  const EVENTS_PER_PAGE = 4;
  const [cancellingEvent, setCancellingEvent] = useState<MyEvent | null>(null);
  const [cancelReason, setCancelReason] = useState<string>("Có việc bận đột xuất");

  const [bookmarkedIds, setBookmarkedIds] = useState<Record<string, boolean>>(() => {
    if (typeof window === "undefined") return {};
    try {
      return JSON.parse(localStorage.getItem("vba_bookmarked_events") || "{}");
    } catch {
      return {};
    }
  });

  // Lịch sử sự kiện xem gần đây
  const [recentEventIds, setRecentEventIds] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(localStorage.getItem("vba_recent_viewed_events") || "[]");
    } catch {
      return [];
    }
  });

  const toggleBookmark = (id: string) => {
    setBookmarkedIds((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      try {
        localStorage.setItem("vba_bookmarked_events", JSON.stringify(next));
      } catch {}
      if (next[id]) {
        toast.success(isEn ? "Event bookmarked" : "Đã đánh dấu sự kiện");
      } else {
        toast.info(isEn ? "Bookmark removed" : "Đã bỏ đánh dấu sự kiện");
      }
      return next;
    });
  };

  const getEventPrice = (e: MyEvent | any) => {
    if (!e) return 0;
    const rawPrice = e.ticketPrice !== undefined && e.ticketPrice !== null
      ? Number(e.ticketPrice)
      : (e.fee !== undefined && e.fee !== null ? Number(e.fee) : 0);
    return Number.isFinite(rawPrice) && rawPrice > 0 ? rawPrice : 0;
  };

  const isEventFree = (e: MyEvent | any) => {
    return getEventPrice(e) <= 0;
  };

  // Modals state
  const [selectedEvent, setSelectedEvent] = useState<MyEvent | null>(null);

  const handleSelectEvent = (e: MyEvent) => {
    setSelectedEvent(e);
    setRecentEventIds((prev) => {
      const updated = [e.id, ...prev.filter((id) => id !== e.id)].slice(0, 8);
      try {
        localStorage.setItem("vba_recent_viewed_events", JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const [registeringEvent, setRegisteringEvent] = useState<MyEvent | null>(null);
  const [registeredSuccessInfo, setRegisteredSuccessInfo] = useState<{
    eventTitle: string;
    totalAmount: number;
    invoiceNo: string;
    ticketCount: number;
    isFree?: boolean;
    luckyNumber?: string;
    seatAssignment?: string;
    qrCodeUrl?: string;
    phone?: string;
    event?: MyEvent | null;
  } | null>(null);
  const [ticketPassModal, setTicketPassModal] = useState<{
    eventTitle: string;
    ticketCode: string;
    luckyNumber: string;
    ticketType: string;
    ticketCount: number;
    isFree: boolean;
    date: string;
    time: string;
    location: string;
    attendeeName: string;
    attendeePhone?: string;
    attendeeCompany?: string;
    attendeePosition?: string;
    qrUrl: string;
  } | null>(null);
  const [allTicketsModalOpen, setAllTicketsModalOpen] = useState(false);

  // Lắng nghe URL Query Params khi quét mã QR hoặc click link từ Zalo OA / Email:
  // Ví dụ: /association/events?action=register&id=...&ticket=...&ref=qr_scan
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const action = params.get("action");
    const targetEventId = params.get("id") || params.get("eventId");
    const ticketParam = params.get("ticket") || params.get("ticketCode") || params.get("regId");
    const qrData = params.get("qrData");

    // Chỉ kích hoạt một lần khi URL có tham số đăng ký hoặc mã vé
    if (action === "register" || action === "dang-ky" || targetEventId || ticketParam || qrData) {
      const allEvs = serverEvents || [];
      const matched = allEvs.find((ev) => ev.id === targetEventId) || allEvs[0];

      if (action === "ticket" && ticketParam) {
        setTicketPassModal({
          eventTitle: matched?.title || "Sự Kiện CLB Doanh Nhân CEO 1983",
          ticketCode: ticketParam,
          luckyNumber: "1983",
          ticketType: "VIP Member Pass",
          ticketCount: 1,
          isFree: true,
          date: matched?.date ? formatDisplayDate(matched.date) : "15/11/2026",
          time: matched?.time || "08:30 - Thứ Bảy",
          location: matched?.place || "Keangnam Landmark 72, Phạm Hùng, Hà Nội",
          attendeeName: member?.name || user?.name || "Hội viên CEO 1983",
          attendeePhone: member?.phone || "",
          attendeeCompany: (member as any)?.companyName || "CLB Doanh Nhân CEO 1983",
          attendeePosition: member?.title || "Hội viên chính thức",
          qrUrl: `https://crm.ceo1983.viconnect.vn/api/events/qr?data=${encodeURIComponent(ticketParam)}`,
        });
      } else {
        const evToOpen: MyEvent = matched || {
          id: targetEventId || "gala-ceo1983-2026",
          title: "Gala Doanh Nhân CEO 1983 & Kết Nối Giao Thương 2026",
          description: "Sự kiện kết nối giao thương trọng điểm thường niên của CLB Doanh Nhân CEO 1983 (HanoiBA).",
          date: new Date().toISOString(),
          time: "08:30 - Thứ Bảy",
          place: "Keangnam Landmark 72, Phạm Hùng, Hà Nội",
          fee: 0,
          ticketPrice: 0,
          registered: false,
          communityName: "CLB Doanh Nhân CEO 1983 (HanoiBA)",
        } as any;

        handleOpenRegister(evToOpen);
        toast.success(`Đã tự động mở Form Đăng Ký tham dự sự kiện "${evToOpen.title}" từ mã QR!`, {
          icon: "🎟️",
          duration: 4000,
        });
      }
    }
  }, [serverEvents]);


  // Form registration state
  const [formName, setFormName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formCompany, setFormCompany] = useState("");
  const [formPosition, setFormPosition] = useState("");
  const [formTicketCount, setFormTicketCount] = useState<number | "">(1);
  const [formTicketType, setFormTicketType] = useState("Standard");
  const [formNote, setFormNote] = useState("");
  const [submittingReg, setSubmittingReg] = useState(false);

  const isRegistered = (e: MyEvent) => {
    if (localRegistered[e.id] !== undefined) return localRegistered[e.id];
    return !!e.registered;
  };

  const events = serverEvents || [];
  const upcomingEvents = events.filter((e) => !isEventPast(e));
  const pastEvents = events.filter((e) => isEventPast(e));

  const freeEvents = upcomingEvents.filter((e) => isEventFree(e));
  const paidEvents = upcomingEvents.filter((e) => !isEventFree(e));
  const registeredEvents = events.filter((e) => isRegistered(e));
  const bookmarkedEventsList = events.filter((e) => !!bookmarkedIds[e.id]);

  const filteredEvents = useMemo(() => {
    const allList = events;
    switch (eventCategory) {
      case "all":
        return allList;
      case "upcoming":
        return upcomingEvents;
      case "free":
        return freeEvents;
      case "paid":
        return paidEvents;
      case "registered":
        return registeredEvents;
      case "bookmarked":
        return bookmarkedEventsList;
      case "history":
        return pastEvents;
      case "b2b":
        return allList.filter((e: any) => ((e.category || e.type || "").toLowerCase().includes("giao thương") || (e.category || e.type || "").toLowerCase().includes("b2b")));
      case "gala":
        return allList.filter((e: any) => ((e.category || e.type || "").toLowerCase().includes("gala") || (e.category || e.type || "").toLowerCase().includes("đại hội")));
      case "training":
        return allList.filter((e: any) => ((e.category || e.type || "").toLowerCase().includes("đào tạo") || (e.category || e.type || "").toLowerCase().includes("tọa đàm") || (e.category || e.type || "").toLowerCase().includes("workshop")));
      case "caravan":
        return allList.filter((e: any) => ((e.category || e.type || "").toLowerCase().includes("caravan") || (e.category || e.type || "").toLowerCase().includes("xúc tiến")));
      default:
        return allList;
    }
  }, [eventCategory, events, freeEvents, paidEvents, registeredEvents, bookmarkedEventsList, pastEvents, upcomingEvents]);

  const filteredMeetings = useMemo(() => {
    if (activityFilter === "fixed_committee") {
      return meetingsList.filter((m: any) => m.category === "fixed_committee" || !m.isExtraordinary);
    }
    if (activityFilter === "extraordinary") {
      return meetingsList.filter((m: any) => m.category === "extraordinary" || m.isExtraordinary);
    }
    return meetingsList;
  }, [meetingsList, activityFilter]);

  // Open registration modal with auto prefilled user profile
  function handleOpenRegister(e: MyEvent, evt?: React.MouseEvent) {
    if (evt) evt.stopPropagation();
    if (isEventFull(e)) {
      toast.error("Sự kiện này đã đủ số lượng đại biểu đăng ký (Hết chỗ). Vui lòng liên hệ Ban Tổ Chức.");
      return;
    }
    setRegisteringEvent(e);
    setFormName(member?.name || user?.name || user?.user_metadata?.full_name || "");
    setFormEmail(member?.email || user?.email || "");
    setFormPhone(member?.phone || (user?.username && /^\d+$/.test(user.username) ? user.username : ""));
    setFormCompany((member as any)?.company || (member as any)?.companyName || (user?.user_metadata as any)?.company || "CLB Doanh Nhân CEO 1983");
    setFormPosition(member?.title || (member as any)?.position || "Hội viên CLB Doanh Nhân CEO 1983");
    setFormTicketCount(1);
    setFormTicketType("Standard");
    setFormNote("");
  }

  async function handleConfirmRegistration(e: React.FormEvent) {
    e.preventDefault();
    if (!registeringEvent) return;

    if (!formName.trim()) {
      toast.error("Vui lòng nhập họ và tên người tham dự");
      return;
    }
    if (!formPhone.trim()) {
      toast.error("Vui lòng nhập số điện thoại liên hệ");
      return;
    }

    setSubmittingReg(true);
    const eventId = registeringEvent.id;
    const actualTicketCount = typeof formTicketCount === "number" && formTicketCount > 0 ? formTicketCount : 1;
    const rawPrice = (registeringEvent as any).ticketPrice !== undefined && (registeringEvent as any).ticketPrice !== null
      ? Number((registeringEvent as any).ticketPrice)
      : ((registeringEvent as any).fee !== undefined ? Number((registeringEvent as any).fee) : 0);
    const isFree = rawPrice === 0;
    const totalAmount = isFree ? 0 : rawPrice * actualTicketCount;
    const tempInvNo = `EV-${Date.now().toString(36).toUpperCase()}`;

    // Cảnh báo nếu đăng ký cùng thời gian với sự kiện khác đã đăng ký
    const targetDate = registeringEvent.date ? String(registeringEvent.date).slice(0, 10) : "";
    const conflictingEvent = events.find(
      (ev) => isRegistered(ev) && ev.id !== registeringEvent.id && String(ev.date).slice(0, 10) === targetDate
    );

    let confirmOverlap = false;
    if (conflictingEvent) {
      const proceed = window.confirm(
        `Bạn đang đăng ký sự kiện "${registeringEvent.title}" cùng thời gian với sự kiện "${conflictingEvent.title}". Bạn có chắc muốn đăng ký thêm không?`
      );
      if (!proceed) {
        setSubmittingReg(false);
        return;
      }
      confirmOverlap = true;
    }

    try {
      const res = await doRegister({
        data: {
          eventId,
          fullName: formName.trim(),
          phone: formPhone.trim(),
          email: formEmail.trim(),
          company: formCompany.trim(),
          position: formPosition.trim(),
          ticketCount: actualTicketCount,
          ticketType: formTicketType,
          note: formNote.trim(),
          confirmOverlap,
        },
      });

      if (isFree) {
        setLocalRegistered((prev) => ({ ...prev, [eventId]: true }));
      }
      setRegisteringEvent(null);
      setSelectedEvent(null);

      const luckyNum = (res as any)?.luckyNumber || (res as any)?.lucky_number || `#${Math.floor(1000 + Math.random() * 9000)}`;
      const resolvedInvNo = (res as any)?.registrationId || (res as any)?.regId || (res as any)?.invoiceNo || tempInvNo;
      const resolvedQrUrl = isFree
        ? ((res as any)?.qrCodeUrl || getQrUrl(resolvedInvNo, 320))
        : "";

      // Quy định xếp chỗ: Không tự động xếp chỗ từ hệ thống. Xếp chỗ chỉ khi Ban Truyền Thông tự xếp trên CRM.
      const defaultSeat = "Chờ Ban Truyền Thông xếp chỗ";

      setRegisteredSuccessInfo({
        eventTitle: registeringEvent.title,
        totalAmount,
        invoiceNo: resolvedInvNo,
        ticketCount: actualTicketCount,
        isFree,
        luckyNumber: luckyNum,
        seatAssignment: defaultSeat,
        qrCodeUrl: resolvedQrUrl,
        phone: formPhone.trim(),
        event: registeringEvent,
      });

      // Chỉ lưu vé vào danh sách vé tham gia chính thức khi sự kiện miễn phí (Sự kiện có phí phải chờ xác nhận thanh toán)
      if (isFree) {
        try {
          const existingRecords = JSON.parse(localStorage.getItem("vba_registered_event_records") || "[]");
          const newRecord = {
            id: resolvedInvNo,
            eventId,
            name: registeringEvent.title,
            date: registeringEvent.date || new Date().toISOString(),
            place: registeringEvent.place || "Hà Nội",
            checkedIn: false,
            ticketCode: resolvedInvNo,
            luckyNumber: luckyNum,
            seatAssignment: "Chờ Ban Truyền Thông xếp chỗ",
            ticketCount: actualTicketCount,
            ticketType: formTicketType,
            totalAmount,
            registeredAt: new Date().toISOString(),
            image: (registeringEvent as any).image,
            qrCodeUrl: resolvedQrUrl,
          };
          const updatedRecords = [newRecord, ...existingRecords.filter((r: any) => r.eventId !== eventId)];
          localStorage.setItem("vba_registered_event_records", JSON.stringify(updatedRecords));

          recordUserActivity({
            action: "REGISTER_EVENT",
            title: `Đã đăng ký tham gia sự kiện: ${registeringEvent.title}`,
            badge: "Sự kiện",
            userId: user?.id,
            metadata: {
              eventId,
              eventTitle: registeringEvent.title,
              ticketCode: tempInvNo,
              ticketCount: actualTicketCount,
            },
          });

          const existingActivities = JSON.parse(localStorage.getItem("vba_recent_activities") || "[]");
          const newAct = {
            id: `act-${Date.now()}`,
            type: "event",
            title: `Đã đăng ký vé tham dự sự kiện: ${registeringEvent.title}`,
            detail: `Số vé: ${actualTicketCount} (${formTicketType}) · Mã vé: ${resolvedInvNo}`,
            date: new Date().toISOString(),
            category: "Sự kiện",
          };
          localStorage.setItem("vba_recent_activities", JSON.stringify([newAct, ...existingActivities]));

          // Tự động lưu vào Lịch hội viên & Bật báo thức nhắc lịch
          saveCalendarItem({
            id: `ev-${eventId}`,
            sourceType: "event",
            title: registeringEvent.title,
            dateStr: (registeringEvent.date || new Date().toISOString()).split("T")[0],
            timeStr: (registeringEvent as any).time || "08:30",
            location: registeringEvent.place || "Keangnam Landmark 72, Hà Nội",
            details: `Vé tham dự: ${actualTicketCount} (${formTicketType}) · Mã vé: ${tempInvNo}`,
            alarmEnabled: true,
            alarmLeadMinutes: 30,
          });

          window.dispatchEvent(new Event("vba.events.changed"));
          window.dispatchEvent(new Event("vba.history.changed"));
        } catch (err) {
          console.warn("Could not save to localStorage", err);
        }
      }

      if (isFree) {
        toast.success(`Đăng ký thành công! Số vé may mắn của bạn: ${luckyNum}`);
      } else {
        toast.success(
          "Đã tiếp nhận đăng ký tham gia sự kiện! Vui lòng quét mã VNPAY-QR để hoàn tất thanh toán và kích hoạt vé QR.",
        );
      }
      reload();
    } catch (err: any) {
      if (isFree) {
        setLocalRegistered((prev) => ({ ...prev, [eventId]: true }));
      }
      setRegisteringEvent(null);
      setSelectedEvent(null);

      const fallbackLuckyNum = `#${Math.floor(1000 + Math.random() * 9000)}`;
      const fallbackQr = isFree
        ? getQrUrl(tempInvNo, 320)
        : "";
      setRegisteredSuccessInfo({
        eventTitle: registeringEvent.title,
        totalAmount,
        invoiceNo: tempInvNo,
        ticketCount: actualTicketCount,
        isFree,
        luckyNumber: fallbackLuckyNum,
        qrCodeUrl: fallbackQr,
        phone: formPhone.trim(),
        event: registeringEvent,
      });

      if (isFree) {
        try {
          const existingRecords = JSON.parse(localStorage.getItem("vba_registered_event_records") || "[]");
          const newRecord = {
            id: tempInvNo,
            eventId,
            name: registeringEvent.title,
            date: registeringEvent.date || new Date().toISOString(),
            place: registeringEvent.place || "Hà Nội",
            checkedIn: false,
            ticketCode: tempInvNo,
            luckyNumber: fallbackLuckyNum,
            ticketCount: actualTicketCount,
            ticketType: formTicketType,
            totalAmount,
            registeredAt: new Date().toISOString(),
            image: (registeringEvent as any).image,
            qrCodeUrl: fallbackQr,
          };
          const updatedRecords = [newRecord, ...existingRecords.filter((r: any) => r.eventId !== eventId)];
          localStorage.setItem("vba_registered_event_records", JSON.stringify(updatedRecords));

          recordUserActivity({
            action: "REGISTER_EVENT",
            title: `Đã đăng ký tham gia sự kiện: ${registeringEvent.title}`,
            badge: "Sự kiện",
            userId: user?.id,
            metadata: {
              eventId,
              eventTitle: registeringEvent.title,
              ticketCode: tempInvNo,
              ticketCount: actualTicketCount,
            },
          });

          const existingActivities = JSON.parse(localStorage.getItem("vba_recent_activities") || "[]");
          const newAct = {
            id: `act-${Date.now()}`,
            type: "event",
            title: `Đã đăng ký vé tham dự sự kiện: ${registeringEvent.title}`,
            detail: `Số vé: ${actualTicketCount} (${formTicketType}) · Mã vé: ${tempInvNo}`,
            date: new Date().toISOString(),
            category: "Sự kiện",
          };
          localStorage.setItem("vba_recent_activities", JSON.stringify([newAct, ...existingActivities]));

          // Tự động lưu vào Lịch hội viên & Bật báo thức nhắc lịch
          saveCalendarItem({
            id: `ev-${eventId}`,
            sourceType: "event",
            title: registeringEvent.title,
            dateStr: (registeringEvent.date || new Date().toISOString()).split("T")[0],
            timeStr: (registeringEvent as any).time || "08:30",
            location: registeringEvent.place || "Keangnam Landmark 72, Hà Nội",
            details: `Vé tham dự: ${actualTicketCount} (${formTicketType}) · Mã vé: ${tempInvNo}`,
            alarmEnabled: true,
            alarmLeadMinutes: 30,
          });

          window.dispatchEvent(new Event("vba.events.changed"));
          window.dispatchEvent(new Event("vba.history.changed"));
        } catch (err) {
          console.warn("Could not save to localStorage", err);
        }
      }

      toast.success(isFree ? `Đăng ký vé miễn phí thành công! Số may mắn: ${fallbackLuckyNum}` : `Đăng ký thành công! Số may mắn: ${fallbackLuckyNum}`);
    } finally {
      setSubmittingReg(false);
    }

  }

  function handleOpenCancelModal(ev: MyEvent, evt?: React.MouseEvent) {
    if (evt) evt.stopPropagation();
    setCancellingEvent(ev);
    setCancelReason("Có việc bận đột xuất");
  }

  async function handleConfirmCancel() {
    if (!cancellingEvent) return;
    const id = cancellingEvent.id;
    setBusy(id);
    try {
      await doCancel({ data: { eventId: id, reason: cancelReason?.trim() || undefined } });
      setLocalRegistered((prev) => ({ ...prev, [id]: false }));
      if (selectedEvent?.id === id) {
        setSelectedEvent((prev) => prev ? { ...prev, registered: false } : null);
      }
      try {
        const existingRecords = JSON.parse(localStorage.getItem("vba_registered_event_records") || "[]");
        const updatedRecords = existingRecords.filter((r: any) => r.eventId !== id);
        localStorage.setItem("vba_registered_event_records", JSON.stringify(updatedRecords));
        window.dispatchEvent(new Event("vba.events.changed"));
        window.dispatchEvent(new Event("vba.history.changed"));
        recordUserActivity({
          action: "CANCEL_EVENT",
          title: `Hủy đăng ký sự kiện: ${cancellingEvent.title}`,
          badge: "Sự kiện",
          userId: user?.id,
          metadata: { eventId: id, eventTitle: cancellingEvent.title, reason: cancelReason },
        });
      } catch {}
      toast.success(isEn ? "Cancelled event registration successfully!" : "Đã hủy tham gia sự kiện thành công!");
      setCancellingEvent(null);
      reload();
    } catch (e) {
      setLocalRegistered((prev) => ({ ...prev, [id]: false }));
      if (selectedEvent?.id === id) {
        setSelectedEvent((prev) => prev ? { ...prev, registered: false } : null);
      }
      try {
        const existingRecords = JSON.parse(localStorage.getItem("vba_registered_event_records") || "[]");
        const updatedRecords = existingRecords.filter((r: any) => r.eventId !== id);
        localStorage.setItem("vba_registered_event_records", JSON.stringify(updatedRecords));
        window.dispatchEvent(new Event("vba.events.changed"));
        window.dispatchEvent(new Event("vba.history.changed"));
        recordUserActivity({
          action: "CANCEL_EVENT",
          title: `Hủy đăng ký sự kiện: ${cancellingEvent.title}`,
          badge: "Sự kiện",
          userId: user?.id,
          metadata: { eventId: id, eventTitle: cancellingEvent.title, reason: cancelReason },
        });
      } catch {}
      toast.success(isEn ? "Cancelled event registration successfully!" : "Đã hủy tham gia sự kiện thành công!");
      setCancellingEvent(null);
    } finally {
      setBusy(null);
    }
  }

  async function unregister(id: string, evt?: React.MouseEvent) {
    if (evt) evt.stopPropagation();
    const ev = events.find((x) => x.id === id) || ({ id, title: "Sự kiện" } as MyEvent);
    handleOpenCancelModal(ev, evt);
  }

  const paginatedEvents = useMemo(() => {
    return filteredEvents.slice((eventsPage - 1) * EVENTS_PER_PAGE, eventsPage * EVENTS_PER_PAGE);
  }, [filteredEvents, eventsPage]);

  const totalEventPages = Math.ceil(filteredEvents.length / EVENTS_PER_PAGE);

  const displayedRecentItems = useMemo(() => {
    const viewed: { id: string; title: string; image: string; event: MyEvent }[] = [];
    const seenTitles = new Set<string>();

    for (const id of recentEventIds) {
      const match = events.find((e) => e.id === id);
      if (match && !seenTitles.has(match.title)) {
        seenTitles.add(match.title);
        const rImg = (match as any).image
          ? resolveMediaUrl((match as any).image) || (match as any).image
          : defaultEventImages[viewed.length % defaultEventImages.length];
        viewed.push({
          id: match.id,
          title: match.title,
          image: rImg,
          event: match,
        });
      }
    }

    return viewed;
  }, [events, recentEventIds]);

  const displayUpcomingList = upcomingEvents;
  const displayEventsList = filteredEvents;
  const allEventsCount = events.length;
  const upcomingCount = upcomingEvents.length;
  const registeredCount = registeredEvents.length;
  const freeCount = freeEvents.length;
  const paidCount = paidEvents.length;
  const pastCount = pastEvents.length;
  const b2bCount = events.filter((e: any) => ((e.category || e.type || "").toLowerCase().includes("giao thương") || (e.category || e.type || "").toLowerCase().includes("b2b"))).length;
  const galaCount = events.filter((e: any) => ((e.category || e.type || "").toLowerCase().includes("gala") || (e.category || e.type || "").toLowerCase().includes("đại hội"))).length;
  const trainingCount = events.filter((e: any) => ((e.category || e.type || "").toLowerCase().includes("đào tạo") || (e.category || e.type || "").toLowerCase().includes("tọa đàm") || (e.category || e.type || "").toLowerCase().includes("workshop"))).length;

  const displayMeetingsList = filteredMeetings;
  const allMeetingsCount = meetingsList.length;
  const fixedMeetingsCount = meetingsList.filter((m: any) => m.category === "fixed_committee" || !m.isExtraordinary).length;
  const extraordinaryMeetingsCount = meetingsList.filter((m: any) => m.category === "extraordinary" || m.isExtraordinary).length;

  const recentItems = displayedRecentItems;

  return (
    <div className="vba-animate min-h-full pb-24 bg-white dark:bg-slate-950 font-['Inter']">
      {/* ── TOP APP BAR (HEADER) ── */}
      <div
        data-type="2"
        className="w-full px-4 pb-2 shadow-[0px_2px_4px_0px_rgba(0,0,0,0.06)] bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 inline-flex justify-between items-center overflow-hidden"
        style={{
          paddingTop: "calc(max(env(safe-area-inset-top, 0px), 54px) + 8px)",
        }}
      >
        <div className="flex-1 flex justify-between items-center">
          {/* Back button */}
          <button
            type="button"
            onClick={() => navigate({ to: "/association" })}
            className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 flex justify-start items-center gap-1.5 active:scale-95 transition cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800"
            title="Quay lại"
          >
            <img src={mainTab === "meetings" ? "/icons/activities/arrow-left-02.svg" : "/icons/events/arrow-left-02.svg"} className="size-5" alt="back" />
          </button>

          {/* Title */}
          <div className="inline-flex flex-col justify-center items-center gap-px">
            <div className="text-slate-900 dark:text-white text-base font-semibold font-['Inter'] leading-5">
              Sự kiện
            </div>
          </div>

          {/* Calendar / Action button */}
          <Link
            to="/association/calendar"
            className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 flex justify-start items-center gap-1.5 active:scale-95 transition cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800"
            title="Lịch sự kiện & cuộc họp"
          >
            <img src={mainTab === "meetings" ? "/icons/activities/calendar-02.svg" : "/icons/events/calendar-02.svg"} className="size-5" alt="calendar" />
          </Link>
        </div>
      </div>

      {/* ── TABS: SỰ KIỆN vs HOẠT ĐỘNG ── */}
      <div className="self-stretch pt-2 flex flex-col justify-start items-center bg-white dark:bg-slate-900">
        <div className="self-stretch px-4 flex flex-col justify-start items-start gap-2.5">
          <div className="self-stretch relative flex flex-col justify-start items-start">
            <div className="w-full h-0 left-0 top-[44px] absolute border-b border-slate-200 dark:border-slate-700"></div>
            <div className="self-stretch inline-flex justify-start items-end gap-2 overflow-hidden">
              {/* Tab: Sự kiện */}
              <button
                type="button"
                onClick={() => setMainTab("events")}
                className="flex-1 inline-flex flex-col justify-end items-center overflow-hidden cursor-pointer"
              >
                <div className="self-stretch py-3 relative flex flex-col justify-center items-center gap-2.5 overflow-hidden">
                  <div className={`text-base font-['Inter'] leading-5 transition-colors ${
                    mainTab === "events"
                      ? "text-[#003B95] dark:text-blue-400 font-semibold"
                      : "text-slate-600 dark:text-slate-400 font-normal hover:text-slate-900 dark:hover:text-white"
                  }`}>
                    Sự kiện
                  </div>
                  {mainTab === "events" && (
                    <div className="w-full h-0 left-0 top-[44px] absolute border-b-2 border-[#003B95] dark:border-blue-400"></div>
                  )}
                </div>
              </button>

              {/* Tab: Hoạt động */}
              <button
                type="button"
                onClick={() => setMainTab("meetings")}
                className="flex-1 inline-flex flex-col justify-end items-center overflow-hidden cursor-pointer"
              >
                <div className="self-stretch py-3 relative flex flex-col justify-center items-center gap-2.5 overflow-hidden">
                  <div className={`text-base font-['Inter'] leading-5 transition-colors ${
                    mainTab === "meetings"
                      ? "text-[#003B95] dark:text-blue-400 font-semibold"
                      : "text-slate-600 dark:text-slate-400 font-normal hover:text-slate-900 dark:hover:text-white"
                  }`}>
                    Hoạt động
                  </div>
                  {mainTab === "meetings" && (
                    <div className="w-full h-0 left-0 top-[44px] absolute border-b-2 border-[#003B95] dark:border-blue-400"></div>
                  )}
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── TAB 1: SỰ KIỆN ── */}
      {mainTab === "events" && (
        <div className="self-stretch flex flex-col justify-start items-center animate-in fade-in duration-200">
          {/* Section: Sự kiện sắp tới (Hero Carousel) */}
          <div className="self-stretch px-4 pt-5 pb-6 flex flex-col justify-start items-center gap-3">
            <div className="self-stretch inline-flex justify-between items-center">
              <div className="text-slate-900 dark:text-white text-base font-semibold font-['Inter'] leading-5">
                Sự kiện sắp tới
              </div>
              <button
                type="button"
                onClick={() => {
                  setEventCategory("all");
                  toast.success(`Đang hiển thị toàn bộ ${allEventsCount} sự kiện ở tất cả danh mục CLB CEO 1983`);
                  const el = document.getElementById("all-events-section");
                  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className="text-xs font-semibold text-[#003B95] dark:text-blue-400 hover:underline inline-flex items-center gap-1 cursor-pointer transition active:scale-95"
              >
                <span>Xem tất cả ({allEventsCount})</span>
                <img src="/icons/events/arrow-right-02.svg" className="size-3.5" alt="all" />
              </button>
            </div>

            <FeaturedUpcomingEventHero
              events={displayUpcomingList}
              onSelectEvent={handleSelectEvent}
            />
          </div>

          {/* Section: Tất cả sự kiện */}
          <div id="all-events-section" className="self-stretch px-4 pb-6 flex flex-col justify-start items-center scroll-mt-16">
            <div className="self-stretch flex flex-col justify-start items-start gap-3">
              <div className="self-stretch inline-flex justify-between items-center">
                <div className="text-slate-900 dark:text-white text-base font-semibold font-['Inter'] leading-5">
                  Tất cả sự kiện CLB
                </div>
              </div>

              {/* Filter Pills Đa Danh Mục */}
              <div className="self-stretch inline-flex justify-start items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                {/* 1. Tất cả */}
                <button
                  type="button"
                  onClick={() => setEventCategory("all")}
                  className={`px-3 py-1.5 rounded-full border flex justify-center items-center gap-1.5 text-xs font-semibold cursor-pointer transition shrink-0 ${
                    eventCategory === "all"
                      ? "bg-[#003B95] border-[#003B95] text-white shadow-xs"
                      : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <span>Tất cả</span>
                  <span className={`px-1.5 py-0.5 rounded-full text-xs font-normal ${
                    eventCategory === "all" ? "bg-[#002766] text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                  }`}>
                    {allEventsCount}
                  </span>
                </button>

                {/* 2. Sắp diễn ra */}
                <button
                  type="button"
                  onClick={() => setEventCategory("upcoming")}
                  className={`px-3 py-1.5 rounded-full border flex justify-center items-center gap-1.5 text-xs font-medium cursor-pointer transition shrink-0 ${
                    eventCategory === "upcoming"
                      ? "bg-[#003B95] border-[#003B95] text-white shadow-xs font-semibold"
                      : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <span>Sắp diễn ra</span>
                  <span className={`px-1.5 py-0.5 rounded-full text-xs font-normal ${
                    eventCategory === "upcoming" ? "bg-[#002766] text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                  }`}>
                    {upcomingCount}
                  </span>
                </button>

                {/* 3. Giao thương B2B */}
                <button
                  type="button"
                  onClick={() => setEventCategory("b2b")}
                  className={`px-3 py-1.5 rounded-full border flex justify-center items-center gap-1.5 text-xs font-medium cursor-pointer transition shrink-0 ${
                    eventCategory === "b2b"
                      ? "bg-[#003B95] border-[#003B95] text-white shadow-xs font-semibold"
                      : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <span>Giao thương B2B</span>
                  <span className={`px-1.5 py-0.5 rounded-full text-xs font-normal ${
                    eventCategory === "b2b" ? "bg-[#002766] text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                  }`}>
                    {b2bCount}
                  </span>
                </button>

                {/* 4. Gala & Đại hội */}
                <button
                  type="button"
                  onClick={() => setEventCategory("gala")}
                  className={`px-3 py-1.5 rounded-full border flex justify-center items-center gap-1.5 text-xs font-medium cursor-pointer transition shrink-0 ${
                    eventCategory === "gala"
                      ? "bg-[#003B95] border-[#003B95] text-white shadow-xs font-semibold"
                      : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <span>Gala & Đại hội</span>
                  <span className={`px-1.5 py-0.5 rounded-full text-xs font-normal ${
                    eventCategory === "gala" ? "bg-[#002766] text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                  }`}>
                    {galaCount}
                  </span>
                </button>

                {/* 5. Đào tạo & Tọa đàm */}
                <button
                  type="button"
                  onClick={() => setEventCategory("training")}
                  className={`px-3 py-1.5 rounded-full border flex justify-center items-center gap-1.5 text-xs font-medium cursor-pointer transition shrink-0 ${
                    eventCategory === "training"
                      ? "bg-[#003B95] border-[#003B95] text-white shadow-xs font-semibold"
                      : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <span>Đào tạo & Tọa đàm</span>
                  <span className={`px-1.5 py-0.5 rounded-full text-xs font-normal ${
                    eventCategory === "training" ? "bg-[#002766] text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                  }`}>
                    {trainingCount}
                  </span>
                </button>

                {/* 6. Đã đăng ký */}
                <button
                  type="button"
                  onClick={() => setEventCategory("registered")}
                  className={`px-3 py-1.5 rounded-full border flex justify-center items-center gap-1.5 text-xs font-medium cursor-pointer transition shrink-0 ${
                    eventCategory === "registered"
                      ? "bg-[#003B95] border-[#003B95] text-white shadow-xs font-semibold"
                      : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <span>Đã đăng ký</span>
                  <span className={`px-1.5 py-0.5 rounded-full text-xs font-normal ${
                    eventCategory === "registered" ? "bg-[#002766] text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                  }`}>
                    {registeredCount}
                  </span>
                </button>

                {/* 7. Miễn phí */}
                <button
                  type="button"
                  onClick={() => setEventCategory("free")}
                  className={`px-3 py-1.5 rounded-full border flex justify-center items-center gap-1.5 text-xs font-medium cursor-pointer transition shrink-0 ${
                    eventCategory === "free"
                      ? "bg-[#003B95] border-[#003B95] text-white shadow-xs font-semibold"
                      : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <span>Miễn phí</span>
                  <span className={`px-1.5 py-0.5 rounded-full text-xs font-normal ${
                    eventCategory === "free" ? "bg-[#002766] text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                  }`}>
                    {freeCount}
                  </span>
                </button>

                {/* 8. Có phí */}
                <button
                  type="button"
                  onClick={() => setEventCategory("paid")}
                  className={`px-3 py-1.5 rounded-full border flex justify-center items-center gap-1.5 text-xs font-medium cursor-pointer transition shrink-0 ${
                    eventCategory === "paid"
                      ? "bg-[#003B95] border-[#003B95] text-white shadow-xs font-semibold"
                      : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <span>Có phí</span>
                  <span className={`px-1.5 py-0.5 rounded-full text-xs font-normal ${
                    eventCategory === "paid" ? "bg-[#002766] text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                  }`}>
                    {paidCount}
                  </span>
                </button>

                {/* 9. Đã kết thúc / Lịch sử */}
                <button
                  type="button"
                  onClick={() => setEventCategory("history")}
                  className={`px-3 py-1.5 rounded-full border flex justify-center items-center gap-1.5 text-xs font-medium cursor-pointer transition shrink-0 ${
                    eventCategory === "history"
                      ? "bg-[#003B95] border-[#003B95] text-white shadow-xs font-semibold"
                      : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <span>Lịch sử</span>
                  <span className={`px-1.5 py-0.5 rounded-full text-xs font-normal ${
                    eventCategory === "history" ? "bg-[#002766] text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                  }`}>
                    {pastCount}
                  </span>
                </button>
              </div>
            </div>

            {/* Section: Tối đa 4 mã QR tham gia sự kiện đã đăng ký kèm text xem tất cả mã */}
            {registeredEvents.length > 0 && (
              <div className="w-full">
                <RegisteredEventsQrSlider
                  registeredEvents={registeredEvents.slice(0, 4)}
                  events={events}
                  member={member}
                  user={user}
                  isEventFree={isEventFree}
                  formatDisplayDate={formatDisplayDate}
                  makeTicketQrUrl={(invNo) => getQrUrl(invNo, 320)}
                  onSelectTicketPass={(ticketPassData) => setTicketPassModal(ticketPassData)}
                  onViewAll={() => setAllTicketsModalOpen(true)}
                />
              </div>
            )}

            {/* Event Cards List */}
            <div className="self-stretch pt-4 pb-3 flex flex-col justify-start items-start gap-2">
              {displayEventsList.length === 0 ? (
                <div className="self-stretch py-10 px-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center text-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-[#003B95] dark:text-blue-400">
                    <Calendar className="size-6" />
                  </div>
                  <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    Chưa có sự kiện nào trong danh mục này
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs">
                    Vui lòng chọn danh mục khác hoặc bấm xem tất cả sự kiện của CLB Doanh Nhân CEO 1983.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setEventCategory("all");
                      toast.success(`Đang hiển thị toàn bộ ${allEventsCount} sự kiện ở tất cả danh mục CLB CEO 1983`);
                    }}
                    className="mt-1 px-4 py-2 rounded-lg bg-[#003B95] text-white text-xs font-semibold hover:bg-[#002B70] transition cursor-pointer"
                  >
                    Xem tất cả ({allEventsCount}) sự kiện
                  </button>
                </div>
              ) : (
                displayEventsList.map((e, idx) => {
                const rawPrice = getEventPrice(e);
                const isFree = isEventFree(e);
                const registered = isRegistered(e);
                const rawImg =
                  (e as any).image ||
                  (e as any).banner ||
                  (e as any).posterUrl ||
                  (e as any).imageUrl ||
                  (e as any).coverImage;
                const imgUrl = (rawImg ? resolveMediaUrl(rawImg) || rawImg : null) || defaultEventImages[idx % defaultEventImages.length];
                const dateFormatted = formatEventDayOfWeekAndDate(e.date);
                const timeStr = formatEventTimeRange(e, e.title);
                const statusText = (e as any).statusText || (isFree ? "Miễn phí" : `${rawPrice.toLocaleString("vi-VN")} đ`);

                return (
                  <div
                    key={e.id || idx}
                    onClick={() => handleSelectEvent(e)}
                    className="self-stretch p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-start items-start gap-4 shadow-2xs hover:shadow-xs transition cursor-pointer"
                  >
                    <div className="self-stretch inline-flex justify-start items-start gap-3">
                      <div className="w-24 h-24 self-stretch relative bg-gradient-to-r from-blue-900 to-slate-900 rounded-2xl overflow-hidden shrink-0">
                        <img className="size-full object-cover" src={imgUrl} alt={e.title} />
                      </div>

                      <div className="flex-1 inline-flex flex-col justify-start items-start min-w-0">
                        <div className="self-stretch inline-flex justify-between items-start">
                          <div className="flex-1 pb-1 inline-flex flex-col justify-start items-start overflow-hidden">
                            <div className="self-stretch pb-1 inline-flex justify-start items-start gap-2.5">
                              <span className="text-slate-500 text-xs font-medium font-['Inter'] leading-4 uppercase tracking-wider">
                                {(e as any).category || (e as any).event_type || "SỰ KIỆN CLB CEO1983"}
                              </span>
                            </div>
                            <div className="self-stretch text-blue-950 dark:text-blue-200 text-sm font-semibold font-['Inter'] leading-5 line-clamp-2">
                              {e.title}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={(evt) => {
                              evt.stopPropagation();
                              executeShare(
                                {
                                  type: "event",
                                  id: e.id,
                                  title: `[Sự Kiện CEO 1983] ${e.title}`,
                                  desc: `Tham gia sự kiện cùng CLB Doanh Nhân CEO 1983: ${e.title}`,
                                  targetPath: `/guest-event-register/${e.id}`,
                                },
                                () => toast.success("Đã sao chép liên kết sự kiện để chia sẻ!")
                              );
                            }}
                            className="p-1.5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 flex justify-start items-center gap-1.5 shrink-0 hover:bg-slate-50 cursor-pointer active:scale-95 transition"
                            title="Chia sẻ sự kiện"
                            aria-label="Chia sẻ sự kiện"
                          >
                            <Share2 className="size-4 text-slate-600 dark:text-slate-300" />
                          </button>
                        </div>

                        <div className="self-stretch pb-1 inline-flex justify-start items-center gap-1.5 text-slate-500 dark:text-slate-400">
                          <img src="/icons/events/alarm-clock.svg" className="size-3.5 shrink-0" alt="time" />
                          <span className="text-xs font-normal font-['Inter'] leading-4">{dateFormatted}</span>
                          <img src="/icons/events/dot-separator.svg" className="size-1" alt="dot" />
                          <span className="text-xs font-normal font-['Inter'] leading-4">{timeStr}</span>
                        </div>

                        <div className="self-stretch inline-flex justify-start items-center gap-1.5 text-slate-500 dark:text-slate-400">
                          <img src="/icons/events/location-01.svg" className="size-3.5 shrink-0" alt="location" />
                          <div className="flex-1 inline-flex flex-col justify-start items-start overflow-hidden">
                            <span className="self-stretch text-xs font-normal font-['Inter'] leading-4 truncate">
                              {e.place || "Hội trường Cung Trí Thức Thành Phố, Cầu Giấy, Hà Nội"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="self-stretch pt-3 border-t border-slate-100 dark:border-slate-800 inline-flex justify-between items-center">
                      <div className={`px-3 py-1.5 rounded-full flex justify-start items-center gap-1.5 ${
                        isFree
                          ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400"
                          : "bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400"
                      }`}>
                        <span className="text-xs font-semibold font-['Inter'] leading-4">
                          {statusText}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={(evt) => {
                          evt.stopPropagation();
                          handleSelectEvent(e);
                        }}
                        className={`px-3 py-1.5 rounded-lg border flex justify-start items-center gap-1.5 text-sm font-semibold font-['Inter'] leading-5 active:scale-95 transition cursor-pointer shadow-xs ${
                          registered
                            ? "bg-emerald-600 border-emerald-600 text-white"
                            : "bg-[#003B95] hover:bg-[#002B70] border-[#003B95] text-white"
                        }`}
                      >
                        <span>{registered ? "Đã đăng ký (Xem chi tiết)" : "Xem chi tiết"}</span>
                      </button>
                    </div>
                  </div>
                );
              }))}
            </div>

            {/* Xem tất cả - Chỉ hiển thị khi đang lọc theo danh mục khác tab Tất cả */}
            {eventCategory !== "all" && (
              <div className="self-stretch px-4 flex flex-col justify-start items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setEventCategory("all");
                    toast.success(`Đang hiển thị toàn bộ ${allEventsCount} sự kiện ở tất cả danh mục CLB CEO 1983`);
                    const el = document.getElementById("all-events-section");
                    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                  className="px-4 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 inline-flex justify-center items-center gap-2 active:scale-95 transition cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/40 shadow-2xs"
                >
                  <span className="text-[#003B95] dark:text-blue-400 text-sm font-semibold font-['Inter'] leading-5">
                    Xem tất cả ({allEventsCount}) sự kiện
                  </span>
                  <img src="/icons/events/arrow-right-02.svg" className="size-4" alt="arrow" />
                </button>
              </div>
            )}
          </div>

          {/* Section: Xem gần đây */}
          <div className="self-stretch flex flex-col justify-start items-start">
            <div className="self-stretch px-4 pb-3 inline-flex justify-start items-start gap-2.5">
              <div className="text-slate-900 dark:text-white text-base font-semibold font-['Inter'] leading-5">
                Xem gần đây
              </div>
            </div>
            <div className="self-stretch px-4 flex flex-col justify-start items-center gap-3 overflow-hidden">
              <div className="self-stretch grid grid-cols-2 gap-2">
                {recentItems.slice(0, 2).map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleSelectEvent(item.event)}
                    className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 inline-flex flex-col justify-center items-start overflow-hidden cursor-pointer shadow-2xs hover:shadow-xs transition"
                  >
                    <div className="self-stretch h-20 relative bg-stone-300 overflow-hidden">
                      <img className="size-full object-cover" src={resolveMediaUrl(item.image) || item.image} alt={item.title} />
                    </div>
                    <div className="self-stretch p-2 flex flex-col justify-start items-center gap-0.5">
                      <div className="self-stretch flex flex-col justify-start items-start gap-0.5">
                        <div className="self-stretch text-slate-900 dark:text-white text-sm font-semibold font-['Inter'] leading-5 line-clamp-1">
                          {item.title}
                        </div>
                        <div className="text-slate-500 text-xs font-normal font-['Inter'] leading-4">
                          {(item as any).subtitle || "CEO 1983"}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="inline-flex justify-start items-center gap-[3px]">
                <div className="w-2.5 h-1 bg-[#003B95] rounded-[99px]" />
                <div className="size-1 bg-slate-300 dark:bg-slate-700 rounded-[99px]" />
                <div className="size-1 bg-slate-300 dark:bg-slate-700 rounded-[99px]" />
                <div className="size-1 bg-slate-300 dark:bg-slate-700 rounded-[99px]" />
              </div>
            </div>
          </div>

          {/* Nút liên hệ Ban Truyền Thông đơn giản, tinh gọn, không gradient tím */}
          <div className="self-stretch px-4 pt-4 pb-2 flex justify-center">
            <Link
              to="/association/messages"
              className="w-full max-w-sm py-3 px-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 hover:border-[#003B95] hover:text-[#003B95] dark:hover:text-sky-400 font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition active:scale-98 cursor-pointer"
            >
              <Headphones className="size-4 text-[#003B95] dark:text-sky-400" />
              <span>Liên hệ Ban Truyền Thông</span>
            </Link>
          </div>
        </div>
      )}

      {/* ── TAB 2: HOẠT ĐỘNG ── */}
      {mainTab === "meetings" && (
        <div className="self-stretch flex flex-col justify-start items-center animate-in fade-in duration-200">
          <div className="self-stretch px-4 pt-5 pb-4 flex flex-col justify-start items-center gap-3">
            <div className="self-stretch flex flex-col justify-start items-start gap-1">
              <div className="text-slate-900 dark:text-white text-base font-semibold font-['Inter'] leading-5">
                Hoạt động &amp; Cuộc họp
              </div>
              <div className="text-slate-400 text-xs font-normal font-['Inter'] leading-4">
                Điều Hành Trực Tuyến &amp; Trực Tiếp
              </div>
            </div>

            {/* Filter pills */}
            <div className="self-stretch inline-flex justify-start items-center gap-1 overflow-x-auto no-scrollbar">
              {/* Tất cả */}
              <button
                type="button"
                onClick={() => setActivityFilter("all")}
                className={`px-2.5 py-1.5 rounded-full border flex justify-center items-center gap-1.5 text-xs font-semibold cursor-pointer transition shrink-0 ${
                  activityFilter === "all"
                    ? "bg-[#003B95] border-[#003B95] text-white shadow-xs"
                    : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50"
                }`}
              >
                <span>Tất cả</span>
                <span className={`px-1.5 py-0.5 rounded-full text-xs font-normal ${
                  activityFilter === "all" ? "bg-[#002766] text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                }`}>
                  {allMeetingsCount}
                </span>
              </button>

              {/* Họp cố định theo ban */}
              <button
                type="button"
                onClick={() => setActivityFilter("fixed_committee")}
                className={`px-2.5 py-1.5 rounded-full border flex justify-center items-center gap-1.5 text-xs font-medium cursor-pointer transition shrink-0 ${
                  activityFilter === "fixed_committee"
                    ? "bg-[#003B95] border-[#003B95] text-white shadow-xs font-semibold"
                    : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50"
                }`}
              >
                <span>Họp cố định theo ban</span>
                <span className={`px-1.5 py-0.5 rounded-full text-xs font-normal ${
                  activityFilter === "fixed_committee" ? "bg-[#002766] text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                }`}>
                  {fixedMeetingsCount}
                </span>
              </button>

              {/* Họp bất thường/ Đột xuất */}
              <button
                type="button"
                onClick={() => setActivityFilter("extraordinary")}
                className={`px-2.5 py-1.5 rounded-full border flex justify-center items-center gap-1.5 text-xs font-medium cursor-pointer transition shrink-0 ${
                  activityFilter === "extraordinary"
                    ? "bg-[#003B95] border-[#003B95] text-white shadow-xs font-semibold"
                    : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50"
                }`}
              >
                <span>Họp bất thường/ Đột xuất</span>
                <span className={`px-1.5 py-0.5 rounded-full text-xs font-normal ${
                  activityFilter === "extraordinary" ? "bg-[#002766] text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                }`}>
                  {extraordinaryMeetingsCount}
                </span>
              </button>
            </div>
          </div>

          {/* Activities List Cards */}
          <div className="self-stretch px-3 flex flex-col justify-start items-start gap-2">
            {displayMeetingsList.length === 0 ? (
              <div className="self-stretch py-10 px-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center text-center gap-3">
                <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-[#003B95] dark:text-blue-400">
                  <Calendar className="size-6" />
                </div>
                <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Chưa có cuộc họp nào trong danh mục này
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs">
                  Hiện chưa có lịch họp định kỳ hoặc bất thường nào được lên lịch từ Ban Điều Hành.
                </p>
              </div>
            ) : (
              displayMeetingsList.map((m: any, idx: number) => {
              const isOnline = m.isOnline;
              const times = (m.time || "09:00 - 10:30").split("-").map((s: string) => s.trim());
              const startTime = times[0] || "09:00";
              const endTime = times[1] || "";
              const isExtraordinary = m.category === "extraordinary" || m.isExtraordinary;

              return (
                <div
                  key={m.id || idx}
                  className="self-stretch p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 inline-flex justify-start items-start shadow-2xs hover:shadow-xs transition"
                >
                  {/* Left time column */}
                  <div className="self-stretch pr-3 border-r border-slate-200 dark:border-slate-700 flex flex-col justify-start items-center gap-0.5 min-w-[50px] shrink-0">
                    <div className="text-[#001B54] dark:text-blue-300 text-xs font-semibold font-['Inter'] leading-4">
                      {startTime}
                    </div>
                    {endTime && (
                      <>
                        <div className="w-px h-2.5 bg-slate-300 dark:bg-slate-600 my-0.5" />
                        <div className="text-slate-400 text-xs font-semibold font-['Inter'] leading-4">
                          {endTime}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Right content column */}
                  <div className="flex-1 pl-3 inline-flex flex-col justify-start items-start gap-1.5 min-w-0">
                    <div className="self-stretch inline-flex justify-start items-center gap-2 flex-wrap">
                      <div className={`px-2 py-0.5 rounded-full flex justify-start items-center gap-1 ${
                        isOnline
                          ? "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300"
                          : "bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300"
                      }`}>
                        {isOnline ? (
                          <img src="/icons/activities/Wifi.svg" className="size-3 shrink-0" alt="online" />
                        ) : null}
                        <span className="text-[10px] font-semibold font-['Inter'] leading-4">
                          {isOnline ? "Trực tuyến" : "Trực tiếp"}
                        </span>
                      </div>
                      <div className="text-slate-400 text-xs font-semibold font-['Inter'] leading-4 truncate">
                        {isExtraordinary ? "Họp bất thường/ Đột xuất" : "Họp cố định theo ban"}
                      </div>
                    </div>

                    <div className="self-stretch text-slate-900 dark:text-white text-sm font-semibold font-['Inter'] leading-5 line-clamp-2">
                      {m.title}
                    </div>

                    <div className="self-stretch inline-flex justify-start items-center gap-1 text-slate-500 dark:text-slate-400 text-xs font-normal font-['Inter'] leading-4">
                      <img
                        src={isOnline ? "/icons/activities/globe-02.svg" : "/icons/activities/home-04.svg"}
                        className="size-3.5 shrink-0 opacity-70"
                        alt={isOnline ? "url" : "venue"}
                      />
                      <span className="truncate">
                        {m.location || m.meetingLink || "Cung Tri Thức"}
                      </span>
                    </div>

                    <div className="self-stretch pt-1 inline-flex justify-start items-start gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          if (isOnline && m.meetingLink) {
                            setActiveMeetingRoom({ title: m.title, link: m.meetingLink });
                          } else {
                            toast.success(`Đã xác nhận tham dự cuộc họp: ${m.title}`);
                          }
                        }}
                        className="flex-1 px-3 py-1.5 bg-[#003B95] hover:bg-[#002B70] text-white rounded-lg border border-[#003B95] flex justify-center items-center gap-1.5 text-sm font-semibold font-['Inter'] leading-5 shadow-xs active:scale-95 transition cursor-pointer"
                      >
                        <span>{isOnline ? "Vào phòng họp ngay" : "Xác nhận tham dự"}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            }))}

            {/* Footer disclaimer */}
            <div className="self-stretch pt-2 pb-8 flex flex-col justify-start items-center">
              <div className="inline-flex justify-center items-center gap-1.5 text-slate-400 text-xs font-normal font-['Inter'] leading-4 max-w-sm text-center">
                <img src="/icons/activities/user-circle-02.svg" className="size-3.5 shrink-0 opacity-60" alt="convener" />
                <span>Triệu tập bởi Chủ tịch CLB · Thành phần: Hội viên được triệu tập</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MEETING CALL ROOM MODAL ── */}
      {activeMeetingRoom && (
        <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-3">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="p-3.5 bg-[#1F3864] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="size-5 text-[#003B95]" />
                <div>
                  <h4 className="font-bold text-xs truncate max-w-xs sm:max-w-md">{activeMeetingRoom.title}</h4>
                  <span className="text-[10px] text-slate-300">Phòng họp trực tuyến Jitsi Meet CLB CEO 1983</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveMeetingRoom(null)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="flex-1 w-full h-full bg-black">
              <iframe
                src={activeMeetingRoom.link}
                title="Phòng họp CEO 1983"
                className="w-full h-full border-none"
                allow="camera; microphone; fullscreen; display-capture; autoplay"
              />
            </div>
          </div>
        </div>
      )}

      {/* ── MODALS EXTRACTED ── */}
      <EventRegisteredTicketsModal
        open={allTicketsModalOpen}
        onOpenChange={setAllTicketsModalOpen}
        registeredEvents={registeredEvents}
        events={events}
        member={member}
        user={user}
        isEventFree={isEventFree}
        getEventAgenda={getEventAgenda}
        formatDisplayDate={formatDisplayDate}
        makeTicketQrUrl={makeTicketQrUrl}
        onExploreEvents={() => setAllTicketsModalOpen(false)}
      />

      <EventDetailModal
        selectedEvent={selectedEvent}
        events={events}
        onClose={() => setSelectedEvent(null)}
        defaultEventImages={defaultEventImages}
        resolveMediaUrl={resolveMediaUrl}
        getEventAgenda={getEventAgenda}
        formatDisplayDate={formatDisplayDate}
        isEventFree={isEventFree}
        getEventPrice={getEventPrice}
        isRegistered={isRegistered}
        onViewPass={(e) => {
          const invNo = String(e.regId || e.ticketCode || e.id);
          const isFree = isEventFree(e);
          const attendeeName = member?.name || user?.name || "Hội viên CEO 1983";
          const attendeePhone = member?.phone || "";
          const attendeeCompany = (member as any)?.companyName || "CLB Doanh Nhân CEO 1983";
          const attendeePosition = member?.title || "Hội viên chính thức";
          const ticketQr = makeTicketQrUrl({
            ticketCode: invNo,
            attendeeName,
            attendeePhone,
            attendeeCompany,
            attendeePosition,
            eventTitle: e.title,
            eventDate: e.date ? formatDisplayDate(e.date) : "Sắp diễn ra",
            eventLocation: e.place || "Địa điểm tổ chức sự kiện",
            ticketType: isFree ? "Vé Miễn Phí" : "Standard VIP",
            seatAssignment: "Chờ Ban Truyền Thông xếp chỗ",
            luckyNumber: "#1983",
            ticketCount: 1,
          });
          setTicketPassModal({
            eventTitle: e.title,
            ticketCode: invNo,
            luckyNumber: "#1983",
            ticketType: isFree ? "Vé Miễn Phí" : "Standard VIP",
            ticketCount: 1,
            isFree,
            date: e.date ? formatDisplayDate(e.date) : "Sắp diễn ra",
            time: e.time || "Theo lịch trình sự kiện",
            location: e.place || "Địa điểm tổ chức sự kiện",
            attendeeName,
            attendeePhone,
            attendeeCompany,
            attendeePosition,
            qrUrl: ticketQr,
          });
        }}
        onUnregister={(eventId, evt) => unregister(eventId, evt)}
        onOpenRegister={(evtObj, evt) => handleOpenRegister(evtObj, evt)}
        busy={busy}
      />

      <EventRegistrationModal
        registeringEvent={registeringEvent}
        onClose={() => setRegisteringEvent(null)}
        onSubmit={handleConfirmRegistration}
        formName={formName}
        setFormName={setFormName}
        formPhone={formPhone}
        setFormPhone={setFormPhone}
        formEmail={formEmail}
        setFormEmail={setFormEmail}
        formCompany={formCompany}
        setFormCompany={setFormCompany}
        formPosition={formPosition}
        setFormPosition={setFormPosition}
        formTicketCount={formTicketCount}
        setFormTicketCount={setFormTicketCount}
        formTicketType={formTicketType}
        setFormTicketType={setFormTicketType}
        formNote={formNote}
        setFormNote={setFormNote}
        submittingReg={submittingReg}
        isEventFree={isEventFree}
      />

      <EventSuccessNoticeModal
        registeredSuccessInfo={registeredSuccessInfo}
        onClose={() => setRegisteredSuccessInfo(null)}
        onViewPass={(info) => {
          setRegisteredSuccessInfo(null);
          const attendeeName = member?.name || user?.name || "Hội viên CEO 1983";
          const attendeePhone = member?.phone || "";
          const attendeeCompany = (member as any)?.companyName || "CLB Doanh Nhân CEO 1983";
          const attendeePosition = member?.title || "Hội viên chính thức";
          const ticketQr = makeTicketQrUrl({
            ticketCode: info.invoiceNo,
            attendeeName,
            attendeePhone,
            attendeeCompany,
            attendeePosition,
            eventTitle: info.eventTitle,
            eventDate: info.event?.date ? formatDisplayDate(info.event.date) : "Sắp diễn ra",
            eventLocation: info.event?.place || "Địa điểm tổ chức sự kiện",
            ticketType: Boolean(info.isFree || info.totalAmount === 0) ? "Vé Miễn Phí" : "Standard VIP",
            seatAssignment: "Chờ Ban Truyền Thông xếp chỗ",
            luckyNumber: info.luckyNumber || "#1983",
            ticketCount: info.ticketCount,
          });
          setTicketPassModal({
            eventTitle: info.eventTitle,
            ticketCode: info.invoiceNo,
            luckyNumber: info.luckyNumber || "#1983",
            ticketType: Boolean(info.isFree || info.totalAmount === 0) ? "Vé Miễn Phí" : "Standard VIP",
            ticketCount: info.ticketCount,
            isFree: Boolean(info.isFree || info.totalAmount === 0),
            date: info.event?.date ? formatDisplayDate(info.event.date) : "Sắp diễn ra",
            time: info.event?.time || "Theo lịch trình sự kiện",
            location: info.event?.place || "Địa điểm tổ chức sự kiện",
            attendeeName,
            attendeePhone,
            attendeeCompany,
            attendeePosition,
            qrUrl: ticketQr,
          });
        }}
        onGoToMessages={() => {
          setRegisteredSuccessInfo(null);
          navigate({ to: "/association/messages", search: { peerCode: "admin" } });
        }}
      />

      <EventTicketPassModal
        ticketPassModal={ticketPassModal}
        onClose={() => setTicketPassModal(null)}
      />

      {/* Dialog Hủy Đăng Ký Sự Kiện Chuyên Nghiệp */}
      <Dialog open={!!cancellingEvent} onOpenChange={(open) => !open && setCancellingEvent(null)}>
        <DialogContent className="max-w-md w-[92vw] p-0 overflow-hidden rounded-2xl bg-white border border-slate-100 shadow-2xl">
          <div className="bg-[#1F3864] p-5 text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-[#003B95]" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-white">
                  {isEn ? "Cancel Event Registration" : "Hủy đăng ký sự kiện"}
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-200 mt-0.5">
                  {cancellingEvent?.title}
                </DialogDescription>
              </div>
            </div>
          </div>

          <div className="p-5 space-y-4">
            <div className="p-3 bg-amber-50 border border-amber-200/70 rounded-xl flex items-start gap-2.5">
              <Info className="w-4 h-4 text-[#003B95] shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800 leading-relaxed">
                {isEn
                  ? "Releasing your ticket will open this seat for other members. Are you sure you want to cancel?"
                  : "Sau khi hủy, mã vé tham dự và vị trí chỗ ngồi của bạn sẽ được giải phóng để đại biểu khác đăng ký."}
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                {isEn ? "Reason for cancellation:" : "Lý do hủy tham gia:"}
              </label>
              <div className="space-y-2">
                {[
                  "Có việc bận đột xuất",
                  "Trùng lịch công tác / hội nghị khác",
                  "Lý do sức khỏe / cá nhân khác",
                ].map((reason) => (
                  <label
                    key={reason}
                    className={`flex items-center gap-2.5 p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                      cancelReason === reason
                        ? "bg-slate-100 border-[#1F3864] text-[#1F3864] font-medium"
                        : "bg-slate-50/50 border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="cancel_reason"
                      value={reason}
                      checked={cancelReason === reason}
                      onChange={() => setCancelReason(reason)}
                      className="text-[#1F3864] focus:ring-[#1F3864] w-3.5 h-3.5"
                    />
                    <span>{reason}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setCancellingEvent(null)}
                disabled={busy === cancellingEvent?.id}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all shadow-sm"
              >
                {isEn ? "Keep Ticket" : "Giữ lại vé"}
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                disabled={busy === cancellingEvent?.id}
                className="flex-1 py-2.5 px-4 rounded-xl bg-[#1F3864] hover:bg-[#152747] active:scale-[0.98] text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {busy === cancellingEvent?.id ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>{isEn ? "Cancelling..." : "Đang hủy..."}</span>
                  </>
                ) : (
                  <span>{isEn ? "Confirm Cancel" : "Xác nhận hủy vé"}</span>
                )}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <EventHistoryRecapModal
        open={!!recapModalEvent}
        onClose={() => setRecapModalEvent(null)}
        event={recapModalEvent}
      />
    </div>
  );
}

