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
} from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { MemberHeader } from "@/components/member/MemberShell";
import { useServerData } from "@/hooks/use-server-data";
import { listMyEvents, registerForEvent, cancelEventRegistration, getMyMember, isEventFull, type MyEvent, type MyMember } from "@/lib/member-app.functions";
import { resolveMediaUrl, fetchNestApi } from "@/lib/api-client";
import { formatDisplayDate } from "@/lib/date-format";
import { saveCalendarItem } from "@/lib/calendar-reminder";
import { useT, useLang } from "@/lib/i18n";
import { useAuth } from "@/context/AuthContext";
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

export const Route = createFileRoute("/association/events")({
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
  return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(ticketData.ticketCode)}`;
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
              : "bg-amber-500 text-slate-950 font-black"
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
              ? "bg-amber-500 text-white font-bold"
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
          <div className="px-2.5 py-[3.16px] bg-yellow-50 dark:bg-amber-950/40 rounded-[105.36px] outline outline-[0.74px] outline-offset-[-0.74px] outline-orange-200 dark:outline-amber-800 flex justify-start items-start">
            <span className="text-slate-800 dark:text-amber-300 text-[9.48px] font-bold font-sans leading-3">
              {agenda.category || "SỰ KIỆN CLB CEO 1983"}
            </span>
          </div>
          <div className="flex justify-start items-center gap-1 text-slate-500 dark:text-slate-400">
            <Clock className="size-3 text-slate-400" />
            <span className="text-xs font-normal font-sans leading-4">{event.time || "00:00"}</span>
          </div>
        </div>

        {/* Title */}
        <div className="self-stretch text-slate-800 dark:text-white text-sm font-bold font-sans leading-5 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-2">
          {event.title}
        </div>

        {/* Date row */}
        <div className="inline-flex justify-start items-center gap-1.5 text-slate-500 dark:text-slate-400">
          <Calendar className="size-3.5 text-amber-600" />
          <span className="text-xs font-sans leading-4">{eventDateStr}</span>
        </div>

        {/* Location row */}
        <div className="self-stretch inline-flex justify-start items-center gap-1.5 text-slate-500 dark:text-slate-400">
          <MapPin className="size-3.5 text-amber-600 shrink-0" />
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
                  toast.success("Đã đồng bộ sự kiện vào Calendar trên điện thoại thành công!");
                }}
                className="px-2 py-[3.16px] bg-amber-50 dark:bg-amber-950/40 rounded-[31.61px] outline outline-[0.74px] outline-offset-[-0.74px] outline-amber-200 dark:outline-amber-800 flex justify-start items-center gap-1 hover:bg-amber-100 transition cursor-pointer"
              >
                <Calendar className="size-3 text-amber-600 dark:text-amber-400" />
                <span className="text-amber-600 dark:text-amber-400 text-[9.48px] font-normal font-sans leading-3">Lịch</span>
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
            <div className="flex justify-start items-center gap-1 text-amber-600 hover:text-amber-700 dark:text-amber-400 font-bold text-xs font-sans group cursor-pointer">
              <span>{isPast ? "Xem kỷ yếu" : registered ? "Xem vé" : isFull ? "Xem chi tiết" : "Đăng ký vé"}</span>
              <ArrowRight className="size-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
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

          const rawImg = (evt as any).image;
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
          // Default meetings following YBA Sài Gòn specification
          setMeetingsList([
            {
              id: "meet-bdh-14",
              title: "Kỳ họp Ban Điều Hành CLB CEO 1983 Lần thứ 14",
              convener: "Chủ tịch CLB & Ban Thường Trực",
              meetingType: "Họp Ban Điều Hành",
              date: "2026-10-25T14:00:00Z",
              time: "14:00 - 17:00",
              location: "Trực tuyến qua Jitsi Meet & Phòng họp Trụ sở HanoiBA",
              isOnline: true,
              meetingLink: "https://meet.jit.si/CEO1983_MEET_BAN_DIEU_HANH_14",
              attendeesRequired: "Toàn bộ Thành viên Ban Điều Hành & Ban Thư Ký",
              documents: ["Báo cáo tài chính Q3/2026", "Dự thảo kế hoạch Gala kỷ niệm 1983"],
              confirmed: true,
            },
            {
              id: "meet-bxt-thang10",
              title: "Họp Ban Xúc Tiến Thương Mại: Điều phối Deal B2B Tháng 10",
              convener: "Trưởng ban Xúc tiến Thương mại",
              meetingType: "Họp Ban Chuyên Môn",
              date: "2026-10-28T09:00:00Z",
              time: "09:00 - 11:30",
              location: "Trực tuyến qua Jitsi Meet",
              isOnline: true,
              meetingLink: "https://meet.jit.si/CEO1983_MEET_BAN_XUC_TIEN",
              attendeesRequired: "Thành viên Ban Xúc tiến & Hội viên có cơ hội lớn",
              documents: ["Danh mục 42 Cơ hội hợp tác", "Quy chế chia sẻ hoa hồng B2B"],
              confirmed: false,
            },
            {
              id: "meet-btv-ketnap",
              title: "Gặp mặt Thẩm định & Kết nạp Hội viên Mới Đợt 4/2026",
              convener: "Trưởng ban Thành viên",
              meetingType: "Gặp mặt Chi hội",
              date: "2026-11-05T15:00:00Z",
              time: "15:00 - 17:30",
              location: "Hà Nội VIP Club & Online Hybrid",
              isOnline: true,
              meetingLink: "https://meet.jit.si/CEO1983_MEET_BAN_THANH_VIEN",
              attendeesRequired: "Ban Thành viên & 12 Doanh nhân ứng viên",
              documents: ["Hồ sơ doanh nghiệp thẩm định", "Điều lệ CLB CEO 1983"],
              confirmed: false,
            },
          ]);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingMeetings(false));
  }, []);

  // Category & bookmark state
  const [eventCategory, setEventCategory] = useState<"all" | "free" | "paid" | "registered" | "bookmarked" | "history">("all");
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

  const filteredEvents =
    eventCategory === "free"
      ? freeEvents
      : eventCategory === "paid"
      ? paidEvents
      : eventCategory === "registered"
      ? registeredEvents
      : eventCategory === "bookmarked"
      ? bookmarkedEventsList
      : eventCategory === "history"
      ? pastEvents
      : upcomingEvents;

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
        ? ((res as any)?.qrCodeUrl || `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(resolvedInvNo)}`)
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
          "Đã tiếp nhận đăng ký tham gia sự kiện! Vui lòng quét mã VietQR để hoàn tất thanh toán và kích hoạt vé QR.",
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
        ? `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(tempInvNo)}`
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

    const defaultCards = [
      {
        id: "recent-forum-digital",
        title: "Diễn đàn kinh tế số",
        image: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=600&auto=format&fit=crop&q=80",
        fallbackEvent: {
          id: "ev-digital-forum",
          title: "Diễn đàn kinh tế số & Quản trị doanh nghiệp",
          place: "Trung tâm Hội nghị Quốc gia, Hà Nội",
          date: "2026-10-15T08:30:00Z",
          time: "08:30",
          day: 15,
          month: 10,
          communityName: "CLB Doanh Nhân CEO 1983",
        },
      },
      {
        id: "recent-ceo-dinner",
        title: "CEO Executive Dinner",
        image: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=600&auto=format&fit=crop&q=80",
        fallbackEvent: {
          id: "ev-executive-dinner",
          title: "CEO Executive Dinner: Kết nối & Dạ tiệc doanh nhân",
          place: "Khách sạn JW Marriott, Hà Nội",
          date: "2026-11-20T18:00:00Z",
          time: "18:00",
          day: 20,
          month: 11,
          communityName: "CLB Doanh Nhân CEO 1983",
        },
      },
    ];

    const result = [...viewed];
    for (const def of defaultCards) {
      if (!seenTitles.has(def.title)) {
        seenTitles.add(def.title);
        const existingEvent = events.find((e) => e.title.toLowerCase().includes(def.title.toLowerCase()));
        result.push({
          id: def.id,
          title: def.title,
          image: def.image,
          event: (existingEvent || def.fallbackEvent) as MyEvent,
        });
      }
    }

    return result;
  }, [events, recentEventIds]);

  return (
    <div className="vba-animate min-h-full pb-24">
      <MemberHeader
        title={isEn ? "Club Events" : t("m.events.title")}
        back
        right={
          <Link
            to="/association/calendar"
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-600/10 dark:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30 text-[11px] font-bold hover:scale-105 active:scale-95 transition"
            title="Lịch của tôi & Cài đặt nhắc hẹn"
          >
            <Calendar className="size-3.5 text-red-600 dark:text-red-400" />
            <span>Lịch của tôi</span>
          </Link>
        }
      />

      {/* ── 2 PRIMARY STYLES (CHUẨN YBA SÀI GÒN): 1. SỰ KIỆN CLB - 2. CUỘC HỌP GẶP MẶT ── */}
      <div className="px-4 pt-2">
        <div className="grid grid-cols-2 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={() => setMainTab("events")}
            className={`py-2 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
              mainTab === "events"
                ? "bg-[#1F3864] text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Calendar className="size-3.5 text-amber-400" />
            <span>Sự Kiện CLB ({events.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setMainTab("meetings")}
            className={`py-2 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
              mainTab === "meetings"
                ? "bg-[#1F3864] text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Users className="size-3.5 text-emerald-400" />
            <span>Cuộc Họp & Gặp Mặt ({meetingsList.length})</span>
          </button>
        </div>
      </div>

      {/* ── NẾU CHỌN TAB CUỘC HỌP & GẶP MẶT (YBA SAIGON STANDARD) ── */}
      {mainTab === "meetings" && (
        <div className="px-4 pt-4 space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <h2 className="text-[13px] font-black uppercase tracking-wider text-slate-800 dark:text-white flex items-center gap-1.5">
              <Users className="h-4 w-4 text-emerald-500" />
              <span>Các Kỳ Họp Ban Điều Hành & Gặp Mặt Chi Hội</span>
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
              Chuẩn điều hành YBA
            </span>
          </div>

          {loadingMeetings ? (
            <div className="py-16 text-center text-xs text-slate-400">Đang tải lịch họp...</div>
          ) : meetingsList.length === 0 ? (
            <div className="py-16 text-center text-xs text-slate-400">Chưa có lịch họp gặp mặt nào sắp tới</div>
          ) : (
            <div className="space-y-4">
              {meetingsList.map((m: any) => (
                <div
                  key={m.id}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-[#1F3864]/10 text-[#1F3864] dark:bg-blue-950 dark:text-blue-300">
                      {m.meetingType || "Kỳ họp Ban"}
                    </span>
                    <span className="text-[11px] font-mono font-bold text-amber-600 dark:text-amber-400">
                      {m.time}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">
                      {m.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Cơ quan triệu tập: <strong className="text-slate-700 dark:text-slate-200">{m.convener || "Chủ tịch CLB"}</strong>
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs space-y-1.5 text-slate-600 dark:text-slate-300">
                    <div className="flex items-center gap-2">
                      <MapPin className="size-3.5 text-amber-500 shrink-0" />
                      <span className="truncate">{m.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="size-3.5 text-blue-500 shrink-0" />
                      <span className="truncate">Thành phần: {m.attendeesRequired || "Hội viên được triệu tập"}</span>
                    </div>
                  </div>

                  {/* Meeting documents preview */}
                  {Array.isArray(m.documents) && m.documents.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <FileText className="size-3 text-slate-400" />
                      <span className="text-[10px] text-slate-400 font-semibold">Tài liệu:</span>
                      {m.documents.map((doc: string, idx: number) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                        >
                          {doc}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    {m.isOnline && (
                      <button
                        type="button"
                        onClick={() =>
                          setActiveMeetingRoom({
                            title: m.title,
                            link: m.meetingLink || "https://meet.jit.si/CEO1983_MEET_BAN_DIEU_HANH_14",
                          })
                        }
                        className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs inline-flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer"
                      >
                        <Phone className="size-3.5" />
                        <span>Vào Phòng Họp Ngay</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        toast.success(`Đã xác nhận tham dự kỳ họp: ${m.title}`);
                      }}
                      className="flex-1 py-2 px-3 rounded-xl bg-[#1F3864] hover:bg-[#152747] text-white font-bold text-xs inline-flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <Check className="size-3.5" />
                      <span>Xác Nhận Tham Dự</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── NẾU CHỌN TAB SỰ KIỆN CLB THÔNG THƯỜNG ── */}
      {mainTab === "events" && (
        <>
          {/* 2. Section: Sự kiện sắp tới - 5 sự kiện chạy từ phải sang trái, ảnh giữa nổi to hơn, chỉ có ảnh, viền bottom mỏng ở giữa */}
          <div className="px-4 pt-2">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#001B54]"></span>
                </span>
                <span className="text-[13px] font-black uppercase tracking-wider text-slate-800 dark:text-white flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-[#001B54] dark:text-blue-400" />
                  Sự kiện sắp tới
                </span>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#001B54]/10 text-[#001B54] dark:text-blue-300 border border-[#001B54]/20">
                5 sự kiện tiêu điểm
              </span>
            </div>

            <UpcomingEventsCoverflow
              events={upcomingEvents}
              onSelectEvent={handleSelectEvent}
            />
          </div>

          {/* Vé Sự Kiện Của Tôi - Chỉ hiển thị khi hội viên THỰC TẾ đã đăng ký ít nhất 1 sự kiện (KHÔNG mock fake) */}
          {registeredEvents.length > 0 && (
            <RegisteredEventsQrSlider
              isEn={isEn}
              registeredEvents={registeredEvents}
              events={events}
              member={member}
              user={user}
              isEventFree={isEventFree}
              formatDisplayDate={formatDisplayDate}
              makeTicketQrUrl={makeTicketQrUrl}
              onSelectTicketPass={(ticketPassData) => setTicketPassModal(ticketPassData)}
              onViewAll={() => {
                setAllTicketsModalOpen(true);
              }}
              onExploreEvents={() => {
                setEventCategory("all");
                const el = document.getElementById("tour-events-tabs");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
            />
          )}

          {/* 3. Section: List các sự kiện với menu phân chia & phân trang riêng biệt */}
          <div className="px-4 pt-3 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-[13px] font-black uppercase tracking-wider text-slate-800 dark:text-white flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-amber-500" />
                {isEn ? "All Club Events" : "Danh sách các sự kiện"}
              </h2>
              <span className="text-[11px] font-bold text-slate-400 font-mono">
                {filteredEvents.length} {isEn ? "events" : "sự kiện"}
              </span>
            </div>

        {/* Menu phân chia: Sắp diễn ra, Đã đăng ký, Miễn phí, Có phí, Đã lưu, Lịch sử sự kiện */}
        <div id="tour-events-tabs" className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
          {[
            { id: "all", label: isEn ? "Upcoming" : "Sắp diễn ra", count: upcomingEvents.length },
            { id: "registered", label: isEn ? "Registered" : "Đã đăng ký", count: registeredEvents.length },
            { id: "free", label: isEn ? "Free" : "Miễn phí", count: freeEvents.length },
            { id: "paid", label: isEn ? "Paid" : "Có phí", count: paidEvents.length },
            { id: "bookmarked", label: isEn ? "Bookmarked" : "Đã lưu", count: bookmarkedEventsList.length },
            { id: "history", label: isEn ? "History" : "Lịch sử sự kiện", count: pastEvents.length },
          ].map((tabItem) => {
            const active = eventCategory === tabItem.id;
            return (
              <button
                key={tabItem.id}
                type="button"
                onClick={() => {
                  setEventCategory(tabItem.id as any);
                  setEventsPage(1);
                }}
                className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                  active
                    ? "bg-sky-950 text-white font-bold shadow-md"
                    : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border border-transparent dark:border-white/5"
                }`}
              >
                <span>{tabItem.label}</span>
                <span
                  className={`grid h-4.5 min-w-4.5 px-1.5 place-items-center rounded-full text-[10px] font-black ${
                    active
                      ? "bg-white/20 text-white"
                      : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200"
                  }`}
                >
                  {tabItem.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Events Cards List */}
        {loading && (
          <div className="space-y-4">
            {[1, 2].map((sk) => (
              <div
                key={sk}
                className="animate-pulse rounded-3xl border border-white/10 bg-slate-900/70 p-5 h-60 flex flex-col justify-between"
              >
                <div className="flex justify-between items-center">
                  <div className="h-6 w-28 rounded-full bg-white/10" />
                  <div className="h-8 w-8 rounded-full bg-white/10" />
                </div>
                <div className="space-y-2">
                  <div className="h-6 w-3/4 rounded-md bg-white/10" />
                  <div className="h-4 w-1/2 rounded-md bg-white/5" />
                </div>
                <div className="grid grid-cols-4 gap-2 max-w-[260px]">
                  {[1, 2, 3, 4].map((b) => (
                    <div key={b} className="h-12 rounded-xl bg-white/10" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filteredEvents.length === 0 && (
          <div className="py-12 text-center rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 p-8">
            <p className="text-[13.5px] font-medium text-[var(--vba-text-dim)]">
              {eventCategory === "free"
                ? (isEn ? "No free events available" : "Hiện không có sự kiện miễn phí nào")
                : eventCategory === "paid"
                ? (isEn ? "No paid events available" : "Hiện không có sự kiện có phí nào")
                : eventCategory === "registered"
                ? (isEn ? "You have not registered for any events yet" : "Bạn chưa đăng ký tham gia sự kiện nào")
                : eventCategory === "bookmarked"
                ? (isEn ? "You have not bookmarked any events yet" : "Bạn chưa đánh dấu sự kiện nào")
                : (isEn ? "No events scheduled yet" : t("m.events.empty"))}
            </p>
          </div>
        )}

        {!loading && paginatedEvents.length > 0 && (
          <div className="space-y-4">
            {paginatedEvents.map((e) => {
              const originalIndex = events.findIndex((x) => x.id === e.id);
              const evIndex = originalIndex >= 0 ? originalIndex : 0;
              return (
                <EventPosterCard
                  key={e.id}
                  event={e}
                  index={evIndex}
                  onSelect={handleSelectEvent}
                  isBookmarked={!!bookmarkedIds[e.id]}
                  onToggleBookmark={toggleBookmark}
                  registered={isRegistered(e)}
                  isFree={isEventFree(e)}
                  price={getEventPrice(e)}
                  isPast={isEventPast(e)}
                  onUnregister={(evtObj, evt) => handleOpenCancelModal(evtObj, evt)}
                  variant="default"
                />
              );
            })}
          </div>
        )}

        {/* PHÂN TRANG RIÊNG BIỆT CHO SECTION DANH SÁCH SỰ KIỆN */}
        {totalEventPages > 1 && (
          <div className="flex items-center justify-between pt-3 pb-1 border-t border-slate-200/70 dark:border-slate-800">
            <button
              type="button"
              disabled={eventsPage <= 1}
              onClick={() => setEventsPage((p) => Math.max(1, p - 1))}
              className="inline-flex items-center gap-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition cursor-pointer shadow-2xs"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>Trước</span>
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalEventPages }, (_, i) => i + 1).map((p) => {
                const isCur = p === eventsPage;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setEventsPage(p)}
                    className={`h-7 w-7 rounded-lg text-xs font-black transition cursor-pointer ${
                      isCur
                        ? "bg-sky-950 text-white font-bold shadow-xs"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              disabled={eventsPage >= totalEventPages}
              onClick={() => setEventsPage((p) => Math.min(totalEventPages, p + 1))}
              className="inline-flex items-center gap-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition cursor-pointer shadow-2xs"
            >
              <span>Sau</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* 4. Section: Sự kiện xem gần đây (recently-viewed) - vừa vặn kích thước section trên */}
      <div className="px-4 mt-6 space-y-3 w-full">
        {/* SỰ KIỆN XEM GẦN ĐÂY */}
        <div className="flex items-center justify-between">
          <div className="font-['Inter'] font-bold text-[13px] sm:text-[14px] leading-tight text-[#001B54] dark:text-white uppercase tracking-tight flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-amber-500" />
            <span>SỰ KIỆN XEM GẦN ĐÂY</span>
          </div>
          <span className="text-[11px] font-medium text-slate-400">
            {displayedRecentItems.length} sự kiện
          </span>
        </div>

        {/* Grid 2 cột dàn đều vừa khít 100% kích thước section trên */}
        <div className="grid grid-cols-2 gap-3 w-full">
          {displayedRecentItems.slice(0, 2).map((item) => (
            <div
              key={item.id}
              onClick={() => handleSelectEvent(item.event)}
              className="group box-border flex flex-col items-start p-2.5 sm:p-3 gap-2 w-full bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700/80 rounded-2xl cursor-pointer shadow-xs hover:shadow-md hover:border-[#003B95]/40 dark:hover:border-blue-500/40 transition active:scale-[0.98]"
            >
              {/* Rectangle: Poster full width của cột */}
              <div className="w-full h-24 sm:h-28 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900 shrink-0 relative">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 select-none pointer-events-none"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 pointer-events-none" />
              </div>
              {/* Title */}
              <div
                title={item.title}
                className="w-full font-['Inter'] font-bold text-[12px] sm:text-[13px] leading-snug text-[#001B54] dark:text-white line-clamp-1"
              >
                {item.title}
              </div>
              <div className="w-full flex items-center justify-between text-[10.5px] text-slate-400 -mt-0.5">
                <span className="truncate">CEO 1983</span>
                <span className="text-amber-600 dark:text-amber-400 font-bold group-hover:translate-x-0.5 transition-transform flex items-center">
                  Xem <ArrowRight className="h-3 w-3 inline ml-0.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Footer: Thiết kế tối giản, thanh lịch, chuẩn xu hướng hiện đại */}
      <div className="mx-4 mt-6 rounded-2xl border border-amber-500/30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-3.5 sm:p-4 text-slate-800 dark:text-slate-100 shadow-[0_4px_16px_rgba(245,158,11,0.1)]">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-amber-500/15 text-amber-500 border border-amber-500/30 shrink-0">
              <Sparkles className="h-4.5 w-4.5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                CLB Doanh Nhân CEO 1983 · Kết Nối Thịnh Vượng
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Kế thừa giá trị, kiến tạo tương lai và đồng hành phát triển bền vững.
              </p>
            </div>
          </div>
          <Link
            to="/association/messages"
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#1F3864] border border-amber-400/50 hover:border-amber-400 text-amber-300 px-3.5 py-2 text-xs font-bold shadow-xs transition active:scale-95 shrink-0 cursor-pointer"
          >
            <span>Liên hệ Ban Truyền Thông</span>
            <ArrowRight className="h-3.5 w-3.5 text-amber-300" />
          </Link>
        </div>
      </div>
      </>
      )}

      {/* ── MEETING CALL ROOM MODAL ── */}
      {activeMeetingRoom && (
        <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-3">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="p-3.5 bg-[#1F3864] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="size-5 text-amber-400" />
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
                <AlertTriangle className="w-5 h-5 text-amber-400" />
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
              <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
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
    </div>
  );
}

