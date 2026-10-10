import React from "react";
import {
  Sparkles,
  X,
  Calendar,
  MapPin,
  Ticket,
  Users,
  Info,
  ExternalLink,
  MessageSquare,
  QrCode,
} from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { EventCountdownBanner } from "@/components/events/EventCountdownTimer";

export interface EventDetailModalProps {
  selectedEvent: any | null;
  events: any[];
  onClose: () => void;
  defaultEventImages: string[];
  resolveMediaUrl: (url: string) => string | null;
  getEventAgenda: (e: any, idx: number) => any;
  formatDisplayDate: (d?: any) => string;
  isEventFree: (e: any) => boolean;
  getEventPrice: (e: any) => number;
  isRegistered: (e: any) => boolean;
  onViewPass: (e: any) => void;
  onUnregister: (eventId: string, evt: React.MouseEvent) => void;
  onOpenRegister: (event: any, evt: React.MouseEvent) => void;
  busy: string | null;
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({
  selectedEvent,
  events,
  onClose,
  defaultEventImages,
  resolveMediaUrl,
  getEventAgenda,
  formatDisplayDate,
  isEventFree,
  getEventPrice,
  isRegistered,
  onViewPass,
  onUnregister,
  onOpenRegister,
  busy,
}) => {
  if (!selectedEvent) return null;

  const selectedIndex = events.findIndex((x: any) => x.id === selectedEvent.id);
  const rawSelImg = (selectedEvent as any).image;
  const selectedImg =
    (rawSelImg ? resolveMediaUrl(rawSelImg) || rawSelImg : null) ||
    defaultEventImages[(selectedIndex >= 0 ? selectedIndex : 0) % defaultEventImages.length];
  const selectedAgenda = getEventAgenda(selectedEvent, selectedIndex >= 0 ? selectedIndex : 0);

  return (
    <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md max-h-[92vh] overflow-y-auto p-0 rounded-3xl border-amber-400/40 bg-[var(--vba-surface,#fff)]">
        {/* Poster Banner Header with Golden Swoosh Effect */}
        <div className="relative min-h-52 w-full overflow-hidden bg-gradient-to-br from-[#040C20] via-[#091D54] to-[#020714] p-4 text-white flex flex-col justify-between">
          <img
            src={selectedImg}
            alt={selectedEvent.title}
            className="absolute inset-0 h-full w-full object-cover opacity-20 mix-blend-luminosity pointer-events-none"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#020714] via-[#081B4B]/80 to-transparent pointer-events-none" />

          <div className="relative z-10 flex items-center justify-between">
            <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500/20 via-amber-400/30 to-amber-500/20 px-2.5 py-0.5 text-[10.5px] font-black text-amber-300 shadow-sm border border-amber-400/50 uppercase">
              <Sparkles className="h-3 w-3" />
              {selectedAgenda.category}
            </span>
            <button
              type="button"
              onClick={onClose}
              className="grid h-8 w-8 place-items-center rounded-full bg-black/60 text-white hover:bg-black/80 transition cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="relative z-10 mt-3">
            <h3 className="text-[18px] sm:text-[20px] font-black text-white line-clamp-2 leading-tight drop-shadow-md">
              {selectedEvent.title}
            </h3>
            <p className="text-[11px] text-amber-300/90 font-bold tracking-wide uppercase mt-0.5">
              {selectedAgenda.subtitle}
            </p>
          </div>

          {/* Countdown Timer on Modal Banner */}
          <div className="relative z-10 mt-3 pt-2.5 border-t border-white/15">
            <EventCountdownBanner event={selectedEvent} index={selectedIndex >= 0 ? selectedIndex : 0} />
          </div>
        </div>

        {/* 3-Column Metadata Strip under Banner */}
        <div className="grid grid-cols-3 divide-x divide-slate-100 dark:divide-white/10 bg-slate-50/70 dark:bg-white/[0.02] p-2.5 text-center border-b border-slate-100 dark:border-white/5">
          <div className="px-1">
            <span className="text-[9.5px] uppercase font-bold text-slate-400 block">Thời gian</span>
            <span className="text-[11px] font-bold text-slate-800 dark:text-slate-100">{selectedEvent.time}</span>
          </div>
          <div className="px-1">
            <span className="text-[9.5px] uppercase font-bold text-slate-400 block">Địa điểm</span>
            <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-200 line-clamp-1">
              {selectedEvent.place}
            </span>
          </div>
          <div className="px-1">
            <span className="text-[9.5px] uppercase font-bold text-slate-400 block">Đối tượng</span>
            <span className="text-[10.5px] font-medium text-slate-600 dark:text-slate-300 line-clamp-1">
              {selectedAgenda.audience}
            </span>
          </div>
        </div>

        <div className="p-4 sm:p-5 space-y-4 text-[13px]">
          {/* Headline & Body Context Paragraphs (Image 4 style) */}
          <div className="space-y-2">
            <h4 className="text-[15px] font-extrabold text-slate-900 dark:text-white leading-snug">
              {selectedAgenda.headline}
            </h4>
            <div className="text-slate-600 dark:text-slate-300 text-[12.5px] leading-relaxed whitespace-pre-line space-y-2">
              {selectedAgenda.desc}
            </div>
          </div>

          {/* Dashed Separator */}
          <div className="border-t border-dashed border-slate-300 dark:border-white/10 my-2" />

          {/* Highlighted Event Keypoints (Image 4 Style) */}
          <div className="space-y-2 text-[12.5px] bg-amber-50/40 dark:bg-amber-950/20 p-3.5 rounded-2xl border border-amber-500/20">
            <div className="flex items-start gap-2 text-slate-800 dark:text-slate-200 font-semibold">
              <Calendar className="h-4 w-4 text-[#2E3192] dark:text-amber-400 shrink-0 mt-0.5" />
              <span>
                {selectedEvent.time ? `${selectedEvent.time} | ` : ""}
                Ngày{" "}
                {selectedEvent.date
                  ? formatDisplayDate(selectedEvent.date)
                  : `${selectedEvent.day} ${selectedEvent.month}, 2026`}
              </span>
            </div>

            <div className="flex items-start gap-2 text-slate-800 dark:text-slate-200">
              <MapPin className="h-4 w-4 text-[#2E3192] dark:text-amber-400 shrink-0 mt-0.5" />
              <span className="font-semibold">{selectedEvent.place}</span>
            </div>

            <div className="flex items-start gap-2 text-slate-800 dark:text-slate-200">
              <Ticket className="h-4 w-4 text-[#2E3192] dark:text-amber-400 shrink-0 mt-0.5" />
              <span className="font-semibold">
                Phí tham dự:{" "}
                <span
                  className={
                    isEventFree(selectedEvent)
                      ? "text-emerald-600 dark:text-emerald-400 font-bold"
                      : "text-amber-600 dark:text-amber-400 font-bold"
                  }
                >
                  {isEventFree(selectedEvent)
                    ? "Miễn phí (0 đ)"
                    : `${new Intl.NumberFormat("vi-VN").format(getEventPrice(selectedEvent))} đ / vé`}
                </span>
              </span>
            </div>

            <div className="flex items-start gap-2 text-slate-800 dark:text-slate-200">
              <Users className="h-4 w-4 text-[#2E3192] dark:text-amber-400 shrink-0 mt-0.5" />
              <span>
                Ưu đãi:{" "}
                <span className="font-semibold text-amber-700 dark:text-amber-300">
                  {selectedAgenda.offer}
                </span>
              </span>
            </div>
          </div>

          {/* Zalo Link Notice Box */}
          <div className="rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 p-3.5 border border-blue-200/60 dark:border-blue-900/60 text-[12px] space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-blue-900 dark:text-blue-300">
              <Info className="h-4 w-4 text-[#2E3192] dark:text-amber-400 shrink-0" />
              <span>Kênh kết nối & Thảo luận</span>
            </div>
            <p className="text-slate-600 dark:text-slate-300">
              Hội viên tham dự vui lòng gia nhập nhóm Zalo để nhận tài liệu diễn giả và cập nhật thông báo:
            </p>
            <div className="pt-1">
              <a
                href={selectedAgenda.zaloLink}
                target="_blank"
                rel="noreferrer"
                className="text-[#2E3192] dark:text-amber-400 font-bold underline inline-flex items-center gap-1 hover:text-blue-700"
              >
                {selectedAgenda.zaloLink}
                <ExternalLink className="h-3 w-3 inline" />
              </a>
            </div>
          </div>

          {/* Dashed Separator */}
          <div className="border-t border-dashed border-slate-300 dark:border-white/10 my-2" />

          {/* Lịch trình chi tiết */}
          <div>
            <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-2">Chương trình chi tiết</h4>
            <div className="space-y-2 border-l-2 border-[#2E3192]/40 pl-3">
              {selectedAgenda.schedule.map((item: any, i: number) => (
                <div key={i} className="text-xs">
                  <span className="font-bold text-[#2E3192] dark:text-amber-400">{item.time}</span>
                  <p className="text-slate-700 dark:text-slate-300">{item.activity}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Diễn giả / Khách mời */}
          <div>
            <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-1.5">Diễn giả & Khách mời</h4>
            <ul className="list-disc list-inside text-xs text-slate-600 dark:text-slate-400 space-y-1">
              {selectedAgenda.speakers.map((sp: string, idx: number) => (
                <li key={idx}>{sp}</li>
              ))}
            </ul>
          </div>

          {/* Action Buttons Footer */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-2">
            <a
              href={selectedAgenda.zaloLink}
              target="_blank"
              rel="noreferrer"
              className="w-full sm:flex-1 py-2.5 px-3 rounded-xl border border-amber-500/40 bg-amber-50 dark:bg-amber-950/40 text-[#2E3192] dark:text-amber-400 text-xs font-bold transition hover:bg-amber-100 flex items-center justify-center gap-1.5 cursor-pointer text-center"
            >
              <MessageSquare className="h-4 w-4 text-[#2E3192] dark:text-amber-400" />
              <span>Tham gia nhóm Zalo sự kiện</span>
            </a>

            {isRegistered(selectedEvent) ? (
              <div className="flex w-full sm:flex-1 gap-2">
                <button
                  type="button"
                  onClick={(evt) => {
                    evt.stopPropagation();
                    onViewPass(selectedEvent);
                  }}
                  style={{ color: "#ffffff" }}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <QrCode className="h-4 w-4" />
                  <span>Xem vé & QR</span>
                </button>
                <button
                  type="button"
                  onClick={(evt) => onUnregister(selectedEvent.id, evt)}
                  disabled={busy === selectedEvent.id}
                  className="py-2.5 px-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 text-rose-600 text-xs font-bold hover:bg-rose-100 transition cursor-pointer"
                >
                  {busy === selectedEvent.id ? "..." : "Hủy đăng ký"}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={(evt) => onOpenRegister(selectedEvent, evt)}
                style={{ color: "#ffffff" }}
                className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-[#2E3192] hover:bg-[#232677] text-white text-xs font-bold shadow-md transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Ticket className="h-4 w-4" />
                <span>Đăng ký tham gia ngay</span>
              </button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
