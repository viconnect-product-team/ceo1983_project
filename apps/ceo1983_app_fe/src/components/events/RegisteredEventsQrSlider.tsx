import React, { useRef } from "react";
import { QrCode, Calendar, MapPin, ChevronRight, Ticket, Sparkles, ChevronLeft } from "lucide-react";

export interface RegisteredEventsQrSliderProps {
  isEn?: boolean;
  registeredEvents: any[];
  events: any[];
  member: any;
  user: any;
  isEventFree: (e: any) => boolean;
  formatDisplayDate: (d?: any) => string;
  makeTicketQrUrl: (params: any) => string;
  onSelectTicketPass: (ticketPassData: any) => void;
  onViewAll: () => void;
  onExploreEvents?: () => void;
}

export const RegisteredEventsQrSlider: React.FC<RegisteredEventsQrSliderProps> = ({
  isEn = false,
  registeredEvents,
  events,
  member,
  user,
  isEventFree,
  formatDisplayDate,
  makeTicketQrUrl,
  onSelectTicketPass,
  onViewAll,
  onExploreEvents,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Hiển thị tối đa 3 sự kiện đã đăng ký theo yêu cầu
  const displayEvents = registeredEvents.slice(0, 3);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const offset = direction === "left" ? -300 : 300;
      scrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  const getTicketDataForEvent = (regEvt: any, idx: number) => {
    const evIdx = events.findIndex((x) => x.id === regEvt.id);
    const invoiceCode = `REG-${regEvt.id.slice(0, 8).toUpperCase()}`;
    const lucky = `#${(1000 + (evIdx >= 0 ? evIdx : idx + 1) * 337) % 9000 + 1000}`;
    const attendeeName = member?.name || user?.name || "Hội viên CEO 1983";
    const attendeePhone = member?.phone || "";
    const attendeeCompany = (member as any)?.companyName || "CLB Doanh Nhân CEO 1983";
    const attendeePosition = member?.title || "Hội viên chính thức";
    const isFree = isEventFree(regEvt);
    const dateStr = regEvt.date ? formatDisplayDate(regEvt.date) : "27/09/2026";
    const locationStr = regEvt.place || "Hà Nội";

    const qrUrl = makeTicketQrUrl({
      ticketCode: invoiceCode,
      attendeeName,
      attendeePhone,
      attendeeCompany,
      attendeePosition,
      eventTitle: regEvt.title,
      eventDate: dateStr,
      eventLocation: locationStr,
      ticketType: isFree ? "Vé Tiêu Chuẩn" : "Vé VIP Doanh Nhân",
      seatAssignment: `Bàn VIP ${(evIdx >= 0 ? evIdx + 1 : idx + 1).toString().padStart(2, "0")} - Ghế 02`,
      luckyNumber: lucky,
      ticketCount: 1,
    });

    return {
      eventTitle: regEvt.title,
      ticketCode: invoiceCode,
      luckyNumber: lucky,
      ticketType: isFree ? "Vé Tiêu Chuẩn" : "Vé VIP Doanh Nhân",
      ticketCount: 1,
      isFree,
      date: regEvt.date || "",
      time: regEvt.time || "",
      location: locationStr,
      attendeeName,
      attendeePhone,
      attendeeCompany,
      attendeePosition,
      qrUrl,
    };
  };

  return (
    <div className="px-4 pt-1 pb-2">
      <div className="rounded-2xl border border-amber-500/30 dark:border-amber-500/20 bg-gradient-to-br from-amber-50/70 via-white to-sky-50/50 dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-800/80 p-3.5 shadow-sm">
        {/* Header row: Tiêu đề & Nút "Xem tất cả" */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-xs">
              <QrCode className="h-4 w-4" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                  {isEn ? "Registered Event QR Passes" : "Mã QR Sự Kiện Đã Đăng Ký"}
                </h3>
                {registeredEvents.length > 0 && (
                  <span className="rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 px-2 py-0.5 text-[10px] font-black">
                    {registeredEvents.length} {isEn ? "passes" : "vé"}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {isEn
                  ? "Scan at venue gate for express check-in (up to 3 shown)"
                  : "Mã QR vào cổng nhanh tự động (hiển thị tối đa 3 sự kiện)"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {displayEvents.length > 1 && (
              <div className="hidden sm:flex items-center gap-1 mr-1">
                <button
                  type="button"
                  onClick={() => scroll("left")}
                  className="h-7 w-7 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 grid place-items-center hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
                  title="Trước"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => scroll("right")}
                  className="h-7 w-7 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 grid place-items-center hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
                  title="Sau"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Nút Xem tất cả bấm vào sẽ hiện được tất cả mã QR sự kiện */}
            <button
              type="button"
              onClick={onViewAll}
              className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-bold text-[#003B95] dark:text-amber-400 hover:text-blue-700 dark:hover:text-amber-300 bg-blue-50/80 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/50 px-2.5 py-1.5 rounded-xl border border-blue-200 dark:border-blue-800/60 transition cursor-pointer"
            >
              <span>{isEn ? "View all" : "Xem tất cả"}</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Carousel / Slide content */}
        {displayEvents.length === 0 ? (
          <div className="py-6 px-3 text-center bg-white/70 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 space-y-2">
            <Ticket className="h-7 w-7 mx-auto text-amber-500/70" />
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {isEn ? "You have not registered for any events yet." : "Bạn chưa đăng ký sự kiện nào"}
            </p>
            <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
              {isEn
                ? "Register for upcoming events below to receive your express QR check-in pass."
                : "Đăng ký các sự kiện bên dưới để nhận ngay mã QR vào cổng và số may mắn tham dự."}
            </p>
            {onExploreEvents && (
              <button
                type="button"
                onClick={onExploreEvents}
                className="mt-1 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#003B95] text-white text-[11px] font-bold shadow-xs hover:bg-[#002b6e] transition cursor-pointer"
              >
                <Sparkles className="h-3 w-3 text-amber-300" />
                <span>{isEn ? "Explore events" : "Khám phá sự kiện ngay"}</span>
              </button>
            )}
          </div>
        ) : (
          <div
            ref={scrollRef}
            className="flex gap-3 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory pb-1 pt-0.5"
          >
            {displayEvents.map((evt, idx) => {
              const ticketData = getTicketDataForEvent(evt, idx);
              return (
                <div
                  key={evt.id || idx}
                  onClick={() => onSelectTicketPass(ticketData)}
                  className="w-[280px] sm:w-[320px] shrink-0 snap-start rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-950 p-3 shadow-xs hover:shadow-md hover:border-amber-500/50 transition cursor-pointer group flex flex-col justify-between"
                >
                  {/* Top info */}
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <span className="inline-block rounded-md bg-amber-500/10 dark:bg-amber-500/20 px-2 py-0.5 text-[10px] font-black text-amber-700 dark:text-amber-400 border border-amber-500/20">
                        {ticketData.ticketType}
                      </span>
                      <span className="font-mono text-[10px] font-bold text-slate-400">
                        {ticketData.luckyNumber}
                      </span>
                    </div>

                    <h4 className="text-xs sm:text-[13px] font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition">
                      {evt.title}
                    </h4>

                    <div className="mt-1 flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1 truncate">
                        <Calendar className="h-3 w-3 text-amber-500 shrink-0" />
                        <span className="truncate">{ticketData.date || "27/09/2026"}</span>
                      </div>
                      <div className="flex items-center gap-1 truncate">
                        <MapPin className="h-3 w-3 text-sky-500 shrink-0" />
                        <span className="truncate">{ticketData.location}</span>
                      </div>
                    </div>
                  </div>

                  {/* QR Image displayed directly */}
                  <div className="mt-2.5 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-3">
                    <div className="shrink-0 p-1 bg-white rounded-lg border border-slate-200 dark:border-slate-700 shadow-xs group-hover:scale-105 transition">
                      <img
                        src={ticketData.qrUrl}
                        alt={`QR ${evt.title}`}
                        className="h-16 w-16 sm:h-18 sm:w-18 object-contain"
                        loading="lazy"
                      />
                    </div>
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="text-[10px] text-slate-400 font-mono truncate">
                        Mã vé: <span className="font-semibold text-slate-700 dark:text-slate-300">{ticketData.ticketCode}</span>
                      </div>
                      <div className="text-[11px] font-semibold text-slate-700 dark:text-slate-200 truncate">
                        {ticketData.attendeeName}
                      </div>
                      <div className="inline-flex items-center gap-1 text-[10px] font-bold text-[#003B95] dark:text-amber-400 group-hover:underline">
                        <span>Chạm để mở thẻ vé</span>
                        <ChevronRight className="h-3 w-3" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
