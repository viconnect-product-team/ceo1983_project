import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
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
} from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { MemberHeader } from "@/components/member/MemberShell";
import { useServerData } from "@/hooks/use-server-data";
import { listMyEvents, registerForEvent, cancelEventRegistration, getMyMember, type MyEvent, type MyMember } from "@/lib/member-app.functions";
import { resolveMediaUrl } from "@/lib/api-client";
import { formatDisplayDate } from "@/lib/date-format";
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

export const Route = createFileRoute("/association/events")({
  component: EventsScreen,
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

const EVENT_AGENDA: Record<string, EventAgendaInfo> = {
  "ev-1": {
    category: "ĐẠI HỘI TOÀN THỂ",
    subtitle: "KẾ THỪA GIÁ TRỊ · KIẾN TẠO TƯƠNG LAI · PHÁT TRIỂN BỀN VỮNG",
    headline: "Đại hội Hội viên CLB CEO 1983 & Tuyên dương Doanh nghiệp Tiêu biểu 2026",
    desc: "Đại hội toàn thể các thành viên CLB Doanh Nhân 1983 nhằm đánh giá chặng đường phát triển, vinh danh doanh nghiệp tiêu biểu và công bố chiến lược chuyển đổi số trong kỷ nguyên mới.\n\nSự kiện quy tụ đại diện các cơ quan quản lý, hiệp hội doanh nghiệp và hàng trăm doanh nhân tiêu biểu trong cả nước cùng tham dự.",
    schedule: [
      { time: "07:00 - 08:00", activity: "Đón tiếp đại biểu, Check-in QR & Trưng bày giao thương B2B" },
      { time: "08:00 - 09:30", activity: "Khai mạc Đại Hội & Báo cáo kết quả hoạt động nhiệm kỳ" },
      { time: "09:30 - 10:45", activity: "Tọa đàm: Chiến lược doanh nghiệp vươn mình ra biển lớn" },
      { time: "10:45 - 11:30", activity: "Ký kết giao thương & Trao chứng nhận hội viên danh dự" },
      { time: "11:30 - 13:00", activity: "Tiệc trưa kết nối Networking & Giao lưu mở rộng" },
    ],
    speakers: ["Chủ tịch CLB Doanh Nhân CEO 1983", "Chuyên gia Kinh tế trưởng Viện Quản lý", "Lãnh đạo Hiệp hội Doanh nghiệp TP. Hà Nội"],
    audience: "Chủ tịch, CEO & Hội viên CLB Doanh Nhân CEO 1983",
    zaloLink: "https://zalo.me/g/avricx427",
    offer: "Miễn phí vé tham dự cho 100 hội viên chính thức đăng ký đầu tiên",
    regLink: "https://ceo1983.vn/dai-hoi-2026",
  },
  "ev-2": {
    category: "GALA DINNER",
    subtitle: "GẮN KẾT THỊNH VƯỢNG · ĐỈNH CAO KẾT NỐI DOANH NHÂN 1983",
    headline: "Đêm tiệc kết nối thượng đỉnh: Xúc tiến đầu tư & Hợp tác chiến lược 2026",
    desc: "Đêm tiệc kết nối thượng đỉnh quy tụ hơn 300 CEO, nhà sáng lập và nhà đầu tư trong hệ sinh thái CEO 1983. Cơ hội xúc tiến đầu tư, hợp tác liên minh chiến lược năm 2026.\n\nChương trình dạ tiệc thượng lưu kết hợp vinh danh những cá nhân, tập thể có đóng góp nổi bật.",
    schedule: [
      { time: "18:00 - 18:45", activity: "Thảm đỏ, Tiệc cocktail & Kết nối tự do" },
      { time: "18:45 - 19:30", activity: "Khai mạc Gala Dinner & Vinh danh nhà tài trợ kim cương" },
      { time: "19:30 - 21:00", activity: "Tiệc tối sang trọng & Chương trình nghệ thuật đặc sắc" },
      { time: "21:00 - 21:30", activity: "Bốc thăm may mắn & Trao giải thưởng kết nối vàng" },
    ],
    speakers: ["Ban Thường Trực CLB CEO 1983", "Khách mời Diễn giả Quốc tế", "Các Shark & Quỹ đầu tư mạo hiểm"],
    audience: "Nhà sáng lập, CEO & Quỹ đầu tư đồng hành",
    zaloLink: "https://zalo.me/g/avricx427",
    offer: "Tặng kèm gói truyền thông thương hiệu doanh nghiệp tại sự kiện",
    regLink: "https://ceo1983.vn/gala-dinner",
  },
  "ev-3": {
    category: "WORKSHOP CHUYÊN ĐỀ",
    subtitle: "KẾ THỪA GIÁ TRỊ · QUẢN TRỊ ĐA THẾ HỆ · VẬN HÀNH TINH GỌN",
    headline: "Chuyển giao thế hệ: Thách thức lớn nhất của doanh nghiệp gia đình",
    desc: "Doanh nghiệp gia đình có thể mất hàng chục năm để xây dựng, nhưng chỉ mất vài năm để gặp khủng hoảng trong quá trình chuyển giao thế hệ.\n\nLàm sao để thế hệ kế thừa tiếp quản hiệu quả? Làm sao để dung hòa khác biệt tư duy giữa founder và thế hệ tiếp theo?\n\nWorkshop 'Tiếp Nối Cơ Nghiệp Gia Đình Đa Thế Hệ' dành cho founder, thế hệ kế thừa và đội ngũ điều hành doanh nghiệp gia đình, tập trung vào các vấn đề thực tiễn về chuyển giao thế hệ, quản trị đa thế hệ và phát triển bền vững.",
    schedule: [
      { time: "08:00 - 08:30", activity: "Đón tiếp đại biểu & Tea break giao lưu" },
      { time: "08:30 - 10:00", activity: "Tọa đàm: Tháo gỡ nút thắt trong chuyển giao thế hệ" },
      { time: "10:00 - 11:30", activity: "Hỏi đáp mở & Tư vấn trực tiếp từ ban cố vấn CEO 1983" },
    ],
    speakers: ["Ban Cố vấn CLB Doanh Nhân CEO 1983", "Chuyên gia Tư vấn Quản trị Doanh nghiệp Gia đình"],
    audience: "Doanh nhân, thế hệ kế thừa và người quan tâm doanh nghiệp gia đình",
    zaloLink: "https://zalo.me/g/avricx427",
    offer: "Ưu đãi 199K cho 60 khách đăng ký đầu tiên có tham gia group zalo",
    regLink: "https://www.cto.vn/familybusiness",
  },
};

function getEventAgenda(e: MyEvent, index: number): EventAgendaInfo {
  if (EVENT_AGENDA[e.id]) {
    return EVENT_AGENDA[e.id];
  }
  const categories = ["WORKSHOP", "HỘI THẢO", "TỌA ĐÀM B2B", "DIỄN ĐÀN"];
  const subtitles = [
    "KẾ THỪA GIÁ TRỊ · KIẾN TẠO TƯƠNG LAI · PHÁT TRIỂN BỀN VỮNG",
    "KẾT NỐI THỊNH VƯỢNG · ĐỈNH CAO DOANH NHÂN HỘI TỤ",
    "ĐỔI MỚI SÁNG TẠO · NÂNG TẦM THƯƠNG HIỆU DOANH NGHIỆP",
  ];
  return {
    category: categories[index % categories.length],
    subtitle: subtitles[index % subtitles.length],
    headline: e.title,
    desc: `Sự kiện "${e.title}" do ${e.communityName || "CLB Doanh Nhân CEO 1983"} tổ chức tại ${e.place}. Diễn ra vào lúc ${e.time} ngày ${e.day} tháng ${e.month}, 2026 với sự tham gia của đông đảo hội viên và khách mời danh dự.\n\nCơ hội giao lưu kết nối hợp tác trực tiếp giữa các nhà lãnh đạo và doanh nhân tiêu biểu.`,
    schedule: [
      { time: "07:30 - 08:30", activity: "Đón tiếp đại biểu & Check-in QR điện tử" },
      { time: "08:30 - 10:30", activity: `Khai mạc: ${e.title}` },
      { time: "10:30 - 11:30", activity: "Tọa đàm giao thương B2B & Ký kết hợp tác" },
      { time: "11:30 - 13:00", activity: "Tiệc trưa kết nối Networking mở rộng" },
    ],
    speakers: [
      "Ban Thường Trực CLB Doanh Nhân CEO 1983",
      "Các chuyên gia đầu ngành trong lĩnh vực kinh tế & công nghệ",
      "Đại diện lãnh đạo doanh nghiệp tiêu biểu",
    ],
    audience: "Doanh nhân, thế hệ kế thừa và hội viên CLB CEO 1983",
    zaloLink: "https://zalo.me/g/avricx427",
    offer: "Ưu đãi 199K cho 60 khách đăng ký đầu tiên có tham gia group zalo",
    regLink: "https://www.cto.vn/familybusiness",
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

export function makeTicketQrUrl(ticketData: {
  ticketCode: string;
  attendeeName: string;
  attendeePhone?: string;
  attendeeCompany?: string;
  attendeePosition?: string;
  eventTitle: string;
  eventDate?: string;
  eventLocation?: string;
  ticketType?: string;
  seatAssignment?: string;
  luckyNumber?: string;
  ticketCount?: number;
}) {
  const jsonPayload = JSON.stringify({
    ticketCode: ticketData.ticketCode,
    name: ticketData.attendeeName,
    phone: ticketData.attendeePhone || "0988 888 888",
    company: ticketData.attendeeCompany || "CLB Doanh Nhân CEO 1983",
    position: ticketData.attendeePosition || "Hội viên chính thức",
    eventTitle: ticketData.eventTitle,
    eventDate: ticketData.eventDate,
    eventLocation: ticketData.eventLocation,
    ticketType: ticketData.ticketType || "VIP Standard Pass",
    seatAssignment: ticketData.seatAssignment || "Bàn VIP 08 - Ghế 02",
    luckyNumber: ticketData.luckyNumber || "#1983",
    ticketCount: ticketData.ticketCount || 1,
  });
  return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(jsonPayload)}`;
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
  variant?: "hero" | "grid" | "default";
}) {
  const rawImg = (event as any).image;
  const evImg = rawImg ? resolveMediaUrl(rawImg) || rawImg : null;
  const fallbackImg = defaultEventImages[index % defaultEventImages.length];
  const displayImg = evImg || fallbackImg;
  const agenda = getEventAgenda(event, index);

  const eventDateStr = event.date
    ? new Date(event.date).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : `${event.day || 27}/${event.month || 9}/2026`;

  const dayNumber = event.date ? new Date(event.date).getDate() : (event.day || 27);
  const monthStr = event.date ? `Th${new Date(event.date).getMonth() + 1}` : `Th${event.month || 9}`;

  return (
    <div
      role="listitem"
      id={index === 0 ? "tour-events-card" : undefined}
      onClick={() => onSelect(event)}
      className="group relative w-full rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200/90 dark:border-white/10 shadow-xs hover:shadow-xl bg-white dark:bg-[#0f172a]/90 backdrop-blur-md cursor-pointer select-none transition-all duration-300 hover:-translate-y-0.5 hover:border-amber-400/50 flex flex-col sm:flex-row items-stretch"
    >
      {/* ── LEFT POSTER IMAGE ── */}
      <div className="w-full sm:w-[38%] md:w-[34%] relative self-stretch min-h-[160px] sm:min-h-[180px] overflow-hidden bg-slate-950 shrink-0">
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
          className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-95"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-black/25 pointer-events-none" />

        {/* Top Left: Holographic Date Badge */}
        <div className="absolute top-3 left-3 z-10 flex flex-col items-center justify-center rounded-xl bg-slate-950/80 backdrop-blur-md border border-white/20 px-2.5 py-1 text-white shadow-lg">
          <span className="text-[10px] font-black uppercase tracking-wider text-amber-300">{monthStr}</span>
          <span className="text-base font-black leading-none">{dayNumber}</span>
        </div>

        {/* Top Right: Bookmark Button */}
        <button
          type="button"
          onClick={(evt) => {
            evt.stopPropagation();
            onToggleBookmark(event.id);
          }}
          className={`absolute top-3 right-3 z-10 grid h-8 w-8 place-items-center rounded-full transition-all active:scale-95 cursor-pointer shadow-md backdrop-blur-md ${
            isBookmarked
              ? "bg-sky-950 text-white font-bold"
              : "bg-black/50 text-white/80 hover:text-white hover:bg-black/70 border border-white/20"
          }`}
          title={isBookmarked ? "Bỏ đánh dấu" : "Đánh dấu sự kiện"}
        >
          <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-white text-white" : ""}`} />
        </button>

        {/* Bottom Left: Live Registration Chip */}
        <div className="absolute bottom-2.5 left-2.5 z-10">
          {registered ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-600/90 text-white text-[10px] font-bold px-2.5 py-0.5 backdrop-blur-md shadow-md border border-blue-400/30">
              <Check className="h-3 w-3 stroke-[3]" />
              Đã đăng ký
            </span>
          ) : isFree ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600/90 text-white text-[10px] font-bold px-2.5 py-0.5 backdrop-blur-md shadow-md border border-emerald-400/30">
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
              Đang mở · Miễn phí
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/95 text-slate-950 text-[10px] font-black px-2.5 py-0.5 backdrop-blur-md shadow-md border border-amber-300/40">
              <span className="h-1.5 w-1.5 rounded-full bg-slate-950 animate-pulse" />
              {new Intl.NumberFormat("vi-VN").format(price)} đ
            </span>
          )}
        </div>
      </div>

      {/* ── RIGHT METADATA & ACTIONS (TINH GỌN, SANG TRỌNG, KHÔNG RỐI CHỮ) ── */}
      <div className="flex-1 p-3.5 sm:p-4 flex flex-col justify-between bg-white dark:bg-slate-900/90 border-t sm:border-t-0 sm:border-l border-slate-100 dark:border-white/10">
        <div className="space-y-2">
          {/* Category Chip & Time */}
          <div className="flex items-center justify-between gap-2">
            <span className="rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 font-bold text-[10px] px-2.5 py-0.5 uppercase tracking-wider border border-amber-500/20">
              {agenda.category || "Sự kiện CLB"}
            </span>
            <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
              <Clock className="h-3 w-3 text-slate-400" />
              {event.time || "Cả ngày"}
            </span>
          </div>

          {/* Event Title */}
          <h3 className="text-[14.5px] sm:text-[15.5px] font-extrabold text-slate-900 dark:text-white leading-snug line-clamp-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
            {event.title}
          </h3>

          {/* Date & Location */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-slate-600 dark:text-slate-300 text-[11.5px] pt-0.5">
            <div className="flex items-center gap-1.5 shrink-0 font-semibold">
              <Calendar className="h-3.5 w-3.5 text-amber-500" />
              <span>{eventDateStr}</span>
            </div>
            <div className="hidden sm:inline text-slate-300 dark:text-slate-700">•</div>
            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 truncate">
              <MapPin className="h-3.5 w-3.5 text-amber-500 shrink-0" />
              <span className="truncate">{event.place || "Hà Nội"}</span>
            </div>
          </div>
        </div>

        {/* Bottom CTA Action Bar */}
        <div className="pt-2.5 mt-2.5 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium text-slate-400">
              {registered ? "Đã giữ chỗ thành công" : "Mở cho toàn thể Hội viên"}
            </span>
            <button
              id={index === 0 ? "tour-events-calendar-sync" : undefined}
              type="button"
              onClick={(evt) => {
                evt.stopPropagation();
                toast.success("Đã đồng bộ sự kiện vào Calendar trên điện thoại thành công!");
              }}
              title="Đồng bộ vào lịch điện thoại"
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border border-amber-300/40 text-[10px] font-bold hover:bg-amber-100 transition cursor-pointer"
            >
              <Calendar className="h-3 w-3" />
              <span>Lịch</span>
            </button>
          </div>

          <span
            id={index === 0 ? "tour-events-register-btn" : undefined}
            className="inline-flex items-center gap-1 text-[11.5px] font-bold text-amber-600 dark:text-amber-400 group-hover:translate-x-0.5 transition-transform"
          >
            <span>{registered ? "Xem vé" : "Đăng ký vé"}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </span>
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
    const list: MyEvent[] = [...events];
    if (list.length < 5) {
      const fallbackList: MyEvent[] = [
        {
          id: "ev-1",
          title: "Đại hội Hội viên CLB CEO 1983 & Tuyên dương Doanh nghiệp 2026",
          date: "2026-09-27",
          time: "07:30 - 13:00",
          place: "Trung tâm Hội nghị Quốc gia, Hà Nội",
          day: 27,
          month: 9,
          image: defaultEventImages[0],
        } as any,
        {
          id: "ev-2",
          title: "Gala Dinner Thượng Đỉnh: Xúc tiến đầu tư & Hợp tác chiến lược",
          date: "2026-10-15",
          time: "18:00 - 21:30",
          place: "Khách sạn JW Marriott, Hà Nội",
          day: 15,
          month: 10,
          image: defaultEventImages[1],
        } as any,
        {
          id: "ev-3",
          title: "Workshop Chuyên đề: Tiếp Nối Cơ Nghiệp Gia Đình Đa Thế Hệ",
          date: "2026-10-28",
          time: "08:00 - 11:30",
          place: "Tòa nhà CEO Tower, Hà Nội",
          day: 28,
          month: 10,
          image: defaultEventImages[2],
        } as any,
        {
          id: "ev-4",
          title: "Diễn đàn Kinh tế & Chuyển đổi số Doanh nghiệp 2026",
          date: "2026-11-12",
          time: "08:30 - 12:00",
          place: "Khách sạn Lotte, Hà Nội",
          day: 12,
          month: 11,
          image: defaultEventImages[3],
        } as any,
        {
          id: "ev-5",
          title: "Tọa đàm Giao thương B2B & Kết nối Chuỗi Cung ứng Toàn Cầu",
          date: "2026-11-25",
          time: "14:00 - 17:30",
          place: "Vinpearl Landmark 81",
          day: 25,
          month: 11,
          image: defaultEventImages[4],
        } as any,
      ];
      for (const fb of fallbackList) {
        if (list.length >= 5) break;
        if (!list.some((x) => x.id === fb.id)) {
          list.push(fb);
        }
      }
    }
    return list.slice(0, 5);
  }, [events]);

  const [activeIdx, setActiveIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Tự động chạy tuần hoàn từ phải sang trái (activeIdx tăng dần)
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % fiveEvents.length);
    }, 3800);
    return () => clearInterval(timer);
  }, [isPaused, fiveEvents.length]);

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

          const eventDateStr = evt.date
            ? new Date(evt.date).toLocaleDateString("vi-VN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })
            : `${evt.day || 27}/${evt.month || 9}/2026`;

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
  const [localRegistered, setLocalRegistered] = useState<Record<string, boolean>>({});

  // Category & bookmark state
  const [eventCategory, setEventCategory] = useState<"all" | "free" | "paid" | "registered" | "bookmarked">("all");
  const [eventsPage, setEventsPage] = useState(1);
  const EVENTS_PER_PAGE = 4;

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

  const freeEvents = events.filter((e) => isEventFree(e));
  const paidEvents = events.filter((e) => !isEventFree(e));
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
      : events;

  // Open registration modal with auto prefilled user profile
  function handleOpenRegister(e: MyEvent, evt?: React.MouseEvent) {
    if (evt) evt.stopPropagation();
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

      setLocalRegistered((prev) => ({ ...prev, [eventId]: true }));
      setRegisteringEvent(null);
      setSelectedEvent(null);

      const luckyNum = (res as any)?.luckyNumber || (res as any)?.lucky_number || `#${Math.floor(1000 + Math.random() * 9000)}`;
      const resolvedInvNo = (res as any)?.invoiceNo || tempInvNo;
      const resolvedQrUrl = (res as any)?.qrCodeUrl || `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(resolvedInvNo)}`;

      // Random phân bổ chỗ ngồi cho đại biểu (Bàn X - Ghế Y)
      const randomTable = Math.floor(Math.random() * 8) + 1;
      const randomSeatNum = Math.floor(Math.random() * 10) + 1;
      const isVipTicket = formTicketType.toLowerCase().includes("vip");
      const randomSeat = isVipTicket
        ? `Bàn VIP 0${randomTable} - Ghế 0${randomSeatNum}`
        : `Bàn Giao Thương 0${randomTable} - Ghế ${randomSeatNum < 10 ? "0" + randomSeatNum : randomSeatNum}`;

      setRegisteredSuccessInfo({
        eventTitle: registeringEvent.title,
        totalAmount,
        invoiceNo: resolvedInvNo,
        ticketCount: actualTicketCount,
        isFree,
        luckyNumber: luckyNum,
        seatAssignment: randomSeat,
        qrCodeUrl: resolvedQrUrl,
        event: registeringEvent,
      });

      // Persist in localStorage for History integration
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
          seatAssignment: randomSeat,
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

        window.dispatchEvent(new Event("vba.events.changed"));
        window.dispatchEvent(new Event("vba.history.changed"));
      } catch (err) {
        console.warn("Could not save to localStorage", err);
      }

      if (isFree) {
        toast.success(`Đăng ký thành công! Số vé may mắn của bạn: ${luckyNum}`);
      } else {
        toast.success(
          isEn
            ? `Registered successfully! Your lucky number is ${luckyNum}`
            : `Đăng ký thành công! Số vé may mắn của bạn: ${luckyNum}`,
        );
      }
      reload();
    } catch (err: any) {
      setLocalRegistered((prev) => ({ ...prev, [eventId]: true }));
      setRegisteringEvent(null);
      setSelectedEvent(null);

      const fallbackLuckyNum = `#${Math.floor(1000 + Math.random() * 9000)}`;
      const fallbackQr = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(tempInvNo)}`;
      setRegisteredSuccessInfo({
        eventTitle: registeringEvent.title,
        totalAmount,
        invoiceNo: tempInvNo,
        ticketCount: actualTicketCount,
        isFree,
        luckyNumber: fallbackLuckyNum,
        qrCodeUrl: fallbackQr,
        event: registeringEvent,
      });

      
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

        window.dispatchEvent(new Event("vba.events.changed"));
        window.dispatchEvent(new Event("vba.history.changed"));
      } catch (err) {
        console.warn("Could not save to localStorage", err);
      }

      toast.success(isFree ? `Đăng ký vé miễn phí thành công! Số may mắn: ${fallbackLuckyNum}` : `Đăng ký thành công! Số may mắn: ${fallbackLuckyNum}`);
    } finally {
      setSubmittingReg(false);
    }

  }

  async function unregister(id: string, evt?: React.MouseEvent) {
    if (evt) evt.stopPropagation();
    const reasonPrompt = window.prompt("Vui lòng nhập lý do hủy tham dự sự kiện (nếu có):", "Có việc bận đột xuất");
    if (reasonPrompt === null) return;
    setBusy(id);
    try {
      await doCancel({ data: { eventId: id, reason: reasonPrompt.trim() || undefined } });
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
    } finally {
      setBusy(null);
    }
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
      />

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
          events={events}
          onSelectEvent={handleSelectEvent}
        />
      </div>

      {/* Vé Sự Kiện Của Tôi */}
      <div className="px-4 pt-1">
        <button
          type="button"
          onClick={() => {
            if (registeredEvents.length > 0) {
              const regEvt = registeredEvents[0];
              const evIdx = events.findIndex((x) => x.id === regEvt.id);
              const invoiceCode = `REG-${regEvt.id.slice(0, 8).toUpperCase()}`;
              const lucky = `#${(1000 + (evIdx >= 0 ? evIdx : 1) * 337) % 9000 + 1000}`;
              const attendeeName = member?.name || user?.name || "Hội viên CEO 1983";
              const attendeePhone = member?.phone || "";
              const attendeeCompany = (member as any)?.companyName || "CLB Doanh Nhân CEO 1983";
              const attendeePosition = member?.title || "Hội viên chính thức";
              setTicketPassModal({
                eventTitle: regEvt.title,
                ticketCode: invoiceCode,
                luckyNumber: lucky,
                ticketType: "Standard VIP",
                ticketCount: 1,
                isFree: isEventFree(regEvt),
                date: regEvt.date || "",
                time: regEvt.time || "",
                location: regEvt.place || "Hà Nội",
                attendeeName,
                attendeePhone,
                attendeeCompany,
                attendeePosition,
                qrUrl: makeTicketQrUrl({
                  ticketCode: invoiceCode,
                  attendeeName,
                  attendeePhone,
                  attendeeCompany,
                  attendeePosition,
                  eventTitle: regEvt.title,
                  eventDate: regEvt.date ? formatDisplayDate(regEvt.date) : "27/09/2026",
                  eventLocation: regEvt.place || "Hà Nội",
                  ticketType: "Standard VIP",
                  seatAssignment: "Bàn VIP 08 - Ghế 02",
                  luckyNumber: lucky,
                  ticketCount: 1,
                }),
              });
            } else {
              setEventCategory("registered");
              toast.info(isEn ? "You have not registered for any events yet." : "Bạn chưa đăng ký sự kiện nào. Hãy chọn sự kiện bên dưới và đăng ký nhé!");
            }
          }}
          className="w-full text-left rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-slate-900/80 backdrop-blur-md flex items-center gap-3 p-3 shadow-xs hover:border-amber-400/50 cursor-pointer transition active:scale-[0.99]"
        >
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 text-amber-500 border border-amber-500/30 shadow-xs">
            <Ticket className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-[13px] font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>{isEn ? "My Event Passes" : "Vé Sự Kiện Của Tôi"}</span>
              {registeredEvents.length > 0 && (
                <span className="rounded-full bg-emerald-500/15 px-2 py-0.2 text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  {registeredEvents.length} vé
                </span>
              )}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              {isEn ? "View your confirmed ticket and QR pass for organizers to scan" : "Xem thẻ vé điện tử & mã QR để Ban Tổ Chức quét khi đến sự kiện"}
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-slate-400 shrink-0" />
        </button>
      </div>

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

        {/* Menu phân chia: Tất cả, Đã đăng ký, Miễn phí, Có phí, Đã đánh dấu */}
        <div id="tour-events-tabs" className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
          {[
            { id: "all", label: isEn ? "All" : "Tất cả", count: events.length },
            { id: "registered", label: isEn ? "Registered" : "Đã đăng ký", count: registeredEvents.length },
            { id: "free", label: isEn ? "Free" : "Miễn phí", count: freeEvents.length },
            { id: "paid", label: isEn ? "Paid" : "Có phí", count: paidEvents.length },
            { id: "bookmarked", label: isEn ? "Bookmarked" : "Đã lưu", count: bookmarkedEventsList.length },
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

      {/* 4. Section: Sự kiện xem gần đây (recently-viewed) */}
      <div className="px-4 mt-6 flex flex-col items-start gap-[12px] w-full max-w-[390px] mx-auto">
        {/* SỰ KIỆN XEM GẦN ĐÂY */}
        <div className="font-['Inter'] font-bold text-[14px] leading-[17px] text-[#001B54] dark:text-white uppercase tracking-tight">
          SỰ KIỆN XEM GẦN ĐÂY
        </div>

        {/* Frame: Horizontal Row */}
        <div className="flex flex-row items-start gap-[12px] overflow-x-auto no-scrollbar w-full py-0.5">
          {displayedRecentItems.map((item) => (
            <div
              key={item.id}
              onClick={() => handleSelectEvent(item.event)}
              className="box-border flex flex-col items-start p-[12px] gap-[8px] w-[160px] h-[127px] bg-[#FFFFFF] dark:bg-slate-800 border border-[#E2E8F0] dark:border-slate-700 rounded-[12px] shrink-0 cursor-pointer shadow-xs hover:shadow-md transition active:scale-[0.98]"
            >
              {/* Rectangle: Poster */}
              <img
                src={item.image}
                alt={item.title}
                className="w-[136px] h-[80px] rounded-[8px] object-cover shrink-0 select-none pointer-events-none"
              />
              {/* Title */}
              <div
                title={item.title}
                className="w-[136px] h-[15px] font-['Inter'] font-bold text-[12px] leading-[15px] text-[#001B54] dark:text-white truncate"
              >
                {item.title}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Footer: Thiết kế tối giản, thanh lịch, chuẩn xu hướng hiện đại */}
      <div className="mx-4 mt-6 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-3.5 sm:p-4 text-slate-800 dark:text-slate-100 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#2E3192]/10 dark:bg-blue-500/15 text-[#2E3192] dark:text-amber-400 shrink-0">
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
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#2E3192] hover:bg-[#232677] text-white px-3.5 py-2 text-xs font-bold shadow-xs transition active:scale-95 shrink-0 cursor-pointer"
          >
            <span>Liên hệ Ban Thư Ký</span>
            <ArrowRight className="h-3.5 w-3.5 text-amber-300" />
          </Link>
        </div>
      </div>


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
          const invNo = `EV-${e.id.slice(0, 8).toUpperCase()}`;
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
            seatAssignment: "Bàn VIP 08 - Ghế 02",
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
            seatAssignment: "Bàn VIP 08 - Ghế 02",
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
    </div>
  );
}

