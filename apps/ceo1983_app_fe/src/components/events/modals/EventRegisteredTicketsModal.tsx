import React from "react";
import { Ticket, X, Calendar, Check } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export interface EventRegisteredTicketsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  registeredEvents: any[];
  events: any[];
  member: any;
  user: any;
  isEventFree: (e: any) => boolean;
  getEventAgenda: (e: any, idx: number) => any;
  formatDisplayDate: (d?: any) => string;
  makeTicketQrUrl: (params: any) => string;
  onExploreEvents?: () => void;
}

export const EventRegisteredTicketsModal: React.FC<EventRegisteredTicketsModalProps> = ({
  open,
  onOpenChange,
  registeredEvents,
  events,
  member,
  user,
  isEventFree,
  getEventAgenda,
  formatDisplayDate,
  makeTicketQrUrl,
  onExploreEvents,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[88vh] overflow-y-auto p-0 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
              <Ticket className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                Danh sách vé sự kiện của bạn
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {registeredEvents.length > 0
                  ? `Hiện bạn đang có ${registeredEvents.length} vé tham gia sự kiện`
                  : "Chưa có vé sự kiện nào được đăng ký"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-4 sm:p-5 space-y-4">
          {registeredEvents.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400">
                <Ticket className="h-8 w-8" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Bạn chưa có vé tham dự sự kiện nào
                </h4>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                  Hãy duyệt danh sách sự kiện và đăng ký để nhận mã vé điện tử & QR check-in nhé!
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  onOpenChange(false);
                  if (onExploreEvents) onExploreEvents();
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#2E3192] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#232677] transition cursor-pointer"
              >
                <Calendar className="h-3.5 w-3.5" />
                <span>Khám phá sự kiện ngay</span>
              </button>
            </div>
          ) : (
            registeredEvents.map((e, idx) => {
              const evIdx = events.findIndex((x) => x.id === e.id);
              const invoiceCode = `REG-${e.id.slice(0, 8).toUpperCase()}`;
              const lucky = `#${(1000 + (evIdx >= 0 ? evIdx : 1) * 337) % 9000 + 1000}`;
              const isFree = isEventFree(e);
              const agenda = getEventAgenda(e, evIdx >= 0 ? evIdx : idx);
              const attendeeName = member?.name || user?.name || "Hội viên CEO 1983";
              const attendeePhone = member?.phone || "";
              const attendeeCompany = (member as any)?.companyName || "CLB Doanh Nhân CEO 1983";
              const attendeePosition = member?.title || "Hội viên chính thức";
              const seatAssignment = `Bàn VIP ${(evIdx >= 0 ? evIdx + 1 : idx + 1).toString().padStart(2, "0")} - Ghế 02`;
              const qrUrl = makeTicketQrUrl({
                ticketCode: invoiceCode,
                attendeeName,
                attendeePhone,
                attendeeCompany,
                attendeePosition,
                eventTitle: e.title,
                eventDate: e.date ? formatDisplayDate(e.date) : `${e.day} ${e.month}, 2026`,
                eventLocation: e.place || "Hà Nội",
                ticketType: isFree ? "Vé Miễn Phí (Standard)" : "VIP Standard Pass",
                seatAssignment,
                luckyNumber: lucky,
                ticketCount: 1,
              });

              const borderColors = [
                "border-l-[#2E3192] border-t-blue-100 dark:border-t-blue-900/30",
                "border-l-purple-600 border-t-purple-100 dark:border-t-purple-900/30",
                "border-l-emerald-600 border-t-emerald-100 dark:border-t-emerald-900/30",
                "border-l-amber-500 border-t-amber-100 dark:border-t-amber-900/30",
              ];
              const badgeBgs = [
                "bg-blue-600 text-white",
                "bg-purple-600 text-white",
                "bg-emerald-600 text-white",
                "bg-amber-600 text-white",
              ];

              return (
                <div
                  key={e.id}
                  className={`relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden border-l-4 ${
                    borderColors[idx % borderColors.length]
                  }`}
                >
                  {/* Header phân biệt rõ ràng vé sự kiện số mấy */}
                  <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-2xs ${
                          badgeBgs[idx % badgeBgs.length]
                        }`}
                      >
                        Sự kiện #{idx + 1}
                      </span>
                      <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 truncate max-w-[200px] sm:max-w-xs">
                        {agenda.category || "HỘI NGHỊ DOANH NHÂN"}
                      </span>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                      <Check className="h-3 w-3 stroke-[2.5]" /> Đã xác nhận
                    </span>
                  </div>

                  {/* Nội dung vé & thông tin sự kiện */}
                  <div className="p-4 flex flex-col sm:flex-row items-center gap-4">
                    {/* Cột QR Code với scan badge */}
                    <div className="flex flex-col items-center gap-1.5 shrink-0">
                      <div className="relative p-2 rounded-2xl bg-white border border-slate-200 dark:border-slate-700 shadow-xs">
                        <img
                          src={qrUrl}
                          alt={`Mã QR vé ${e.title}`}
                          className="h-28 w-28 object-contain"
                        />
                        <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 border-t-2 border-dashed border-rose-500/40 pointer-events-none" />
                      </div>
                      <span className="text-[9.5px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                        Quét check-in
                      </span>
                    </div>

                    {/* Cột thông tin sự kiện và vé */}
                    <div className="flex-1 min-w-0 space-y-2 text-center sm:text-left">
                      <div>
                        <h4 className="text-sm font-black text-slate-900 dark:text-white line-clamp-2 leading-snug">
                          {e.title}
                        </h4>
                        <p className="text-[10.5px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                          {agenda.subtitle}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-1.5 text-[11px] bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                        <div>
                          <span className="text-slate-400 text-[10px] block">Mã vé tham dự:</span>
                          <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                            {invoiceCode}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[10px] block">Số may mắn:</span>
                          <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                            {lucky}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[10px] block">Người tham dự:</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block">
                            {attendeeName}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[10px] block">Vị trí bàn tiệc:</span>
                          <span className="font-semibold text-indigo-600 dark:text-indigo-400 block truncate">
                            {seatAssignment}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1 text-[11px] text-slate-500 dark:text-slate-400">
                        <span>📅 {e.date ? formatDisplayDate(e.date) : `${e.day} ${e.month}, 2026`}</span>
                        <span>•</span>
                        <span>⏰ {e.time || "08:00 - 12:00"}</span>
                        <span>•</span>
                        <span className="truncate max-w-[140px]">📍 {e.place || "Hà Nội"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
