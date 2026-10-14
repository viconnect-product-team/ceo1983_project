import React, { useRef } from "react";
import { Calendar, MapPin, ChevronRight, Ticket } from "lucide-react";

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

  // Chỉ hiển thị slider khi người dùng THỰC TẾ đã đăng ký ít nhất 1 sự kiện (KHÔNG mock fake)
  if (!registeredEvents || registeredEvents.length === 0) {
    return null;
  }

  const itemsToRender = registeredEvents;
  const displayCount = registeredEvents.length;

  const getTicketDataForEvent = (regEvt: any, idx: number) => {
    const evIdx = events.findIndex((x) => x.id === regEvt.id);
    const invoiceCode = `REG-${(regEvt.id || "EVT").slice(0, 8).toUpperCase()}`;
    const lucky = `#${(1000 + (evIdx >= 0 ? evIdx : idx + 1) * 337) % 9000 + 1000}`;
    const attendeeName = member?.name || user?.name || "Hội viên CEO 1983";
    const attendeePhone = member?.phone || "";
    const attendeeCompany = (member as any)?.companyName || "CLB Doanh Nhân CEO 1983";
    const attendeePosition = member?.title || "Hội viên chính thức CEO 1983";
    const isFree = isEventFree(regEvt);
    const dateStr = regEvt.date ? formatDisplayDate(regEvt.date) : "Sắp diễn ra";
    const locationStr = regEvt.place || "Địa điểm tổ chức sự kiện";

    const qrUrl = makeTicketQrUrl({
      ticketCode: invoiceCode,
      attendeeName,
      attendeePhone,
      attendeeCompany,
      attendeePosition,
      eventTitle: regEvt.title,
      eventDate: dateStr,
      eventLocation: locationStr,
      ticketType: isFree ? "Vé Tiêu Chuẩn" : (regEvt.ticketType || "Vé VIP Doanh Nhân"),
      seatAssignment: `Bàn VIP ${(evIdx >= 0 ? evIdx + 1 : idx + 1).toString().padStart(2, "0")} - Ghế 02`,
      luckyNumber: lucky,
      ticketCount: 1,
    });

    return {
      eventTitle: regEvt.title,
      ticketCode: invoiceCode,
      luckyNumber: lucky,
      ticketType: isFree ? "Vé Tiêu Chuẩn" : (regEvt.ticketType || "Vé VIP Doanh Nhân"),
      ticketCount: 1,
      isFree,
      date: dateStr,
      time: regEvt.time || "18:00",
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
      <div className="self-stretch inline-flex flex-col justify-start items-start gap-3 w-full">
        {/* Header row: 🎫 Vé sự kiện của tôi (trái) | Bạn có X vé sắp diễn ra (phải) */}
        <div className="w-full inline-flex justify-between items-center">
          <div className="justify-start text-slate-900 dark:text-white text-base font-bold font-['SF_Pro',system-ui,sans-serif] leading-5">
            🎫 {isEn ? "My Event Tickets" : "Vé sự kiện của tôi"}
          </div>
          <button
            type="button"
            onClick={onViewAll}
            className="justify-start text-[#003B95] dark:text-blue-400 hover:text-blue-700 text-xs font-normal font-['SF_Pro',system-ui,sans-serif] leading-4 cursor-pointer"
          >
            {isEn ? `You have ${displayCount} upcoming tickets` : `Bạn có ${displayCount} vé sắp diễn ra`}
          </button>
        </div>

        {/* Horizontal scroll cards list matching Figma snippet */}
        <div
          ref={scrollRef}
          className="self-stretch inline-flex justify-start items-start gap-3 overflow-x-auto no-scrollbar pb-1"
        >
          {itemsToRender.map((evt, idx) => {
            const ticketData = getTicketDataForEvent(evt, idx);
            return (
              <div
                key={evt.id || idx}
                onClick={() => onSelectTicketPass(ticketData)}
                className="w-64 min-w-[256px] h-28 relative rounded-2xl bg-[#F4F6F9] dark:bg-slate-800/90 border border-slate-200/90 dark:border-slate-700/80 shadow-xs hover:shadow-md transition active:scale-[0.98] cursor-pointer shrink-0 overflow-hidden"
              >
                {/* Background Secondary tint */}
                <div className="w-full h-full left-0 top-0 absolute bg-[#F4F6F9] dark:bg-slate-800/90" />

                {/* Left: Thumbnail container size-12 (w-12 h-12) left-[16px] top-[14px] absolute bg-Primary */}
                <div className="size-12 left-[16px] top-[14px] absolute rounded-xl bg-[#003B95] text-amber-300 flex items-center justify-center overflow-hidden shadow-xs">
                  {evt.image ? (
                    <img src={evt.image} alt={evt.title} className="w-full h-full object-cover" />
                  ) : (
                    <Ticket className="w-6 h-6 text-amber-400" />
                  )}
                </div>

                {/* Left: "Xem vé" action at left-[16px] top-[70px] absolute */}
                <div className="left-[16px] top-[70px] absolute inline-flex justify-start items-center gap-1 group">
                  <div className="justify-start text-[#003B95] dark:text-blue-400 text-xs font-normal font-['SF_Pro',system-ui,sans-serif] leading-4 group-hover:underline">
                    {isEn ? "View ticket" : "Xem vé"}
                  </div>
                  <div className="size-4 relative overflow-hidden flex items-center justify-center">
                    <ChevronRight className="w-3.5 h-3.5 text-[#003B95] dark:text-blue-400" />
                  </div>
                </div>

                {/* Right: Event title at left-[76px] right-3 top-[6px] absolute */}
                <div className="left-[76px] right-3 top-[8px] absolute justify-start text-slate-900 dark:text-white text-xs sm:text-[13px] font-bold font-['SF_Pro',system-ui,sans-serif] leading-4 line-clamp-2">
                  {evt.title}
                </div>

                {/* Right: Date & Location at left-[76px] right-3 top-[52px] absolute */}
                <div className="left-[76px] right-3 top-[52px] absolute inline-flex flex-col justify-start items-start gap-1">
                  {/* Date row */}
                  <div className="inline-flex justify-start items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px] font-normal font-['SF_Pro',system-ui,sans-serif] leading-4">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{ticketData.date || "15/10/2026"}</span>
                  </div>

                  {/* Location row */}
                  <div className="w-full inline-flex justify-start items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px] font-normal font-['SF_Pro',system-ui,sans-serif] leading-4">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="flex-1 line-clamp-1">{ticketData.location || "Khách sạn JW Marriott, Hà Nội"}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
