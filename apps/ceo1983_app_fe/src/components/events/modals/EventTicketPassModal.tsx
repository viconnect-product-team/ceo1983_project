import React from "react";
import { Sparkles } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export interface EventTicketPassModalProps {
  ticketPassModal: {
    eventTitle: string;
    ticketCode: string;
    luckyNumber?: string;
    ticketType?: string;
    ticketCount?: number;
    isFree?: boolean;
    date?: string;
    time?: string;
    location?: string;
    attendeeName?: string;
    attendeePhone?: string;
    attendeeCompany?: string;
    attendeePosition?: string;
    seatAssignment?: string;
    qrUrl: string;
  } | null;
  onClose: () => void;
}

export const EventTicketPassModal: React.FC<EventTicketPassModalProps> = ({
  ticketPassModal,
  onClose,
}) => {
  if (!ticketPassModal) return null;

  return (
    <Dialog open={!!ticketPassModal} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-sm p-0 overflow-hidden rounded-3xl border-2 border-amber-400/50 bg-[var(--vba-surface,#fff)] text-center shadow-2xl">
        {/* Header Ticket Banner */}
        <div className="bg-gradient-to-br from-[#001A4D] via-[#2E3192] to-[#0A192F] p-4 text-white relative">
          <div className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 border border-amber-400/60 px-2.5 py-0.5 text-[10px] font-extrabold text-amber-300 uppercase tracking-wider mb-2">
            <Sparkles className="h-3 w-3" />
            VÉ THAM DỰ SỰ KIỆN CHÍNH THỨC
          </div>
          <h3 className="text-base font-black text-white line-clamp-2 leading-snug">
            {ticketPassModal.eventTitle}
          </h3>
          <p className="text-[11px] text-white/80 mt-1">
            📍 {ticketPassModal.location}
          </p>
        </div>

        {/* Ticket Body with QR Code */}
        <div className="p-4 space-y-3">
          <div className="bg-white p-3 rounded-2xl border-2 border-dashed border-[#2E3192]/30 inline-block shadow-sm">
            <img
              src={ticketPassModal.qrUrl}
              alt="Mã QR Vé Sự Kiện"
              className="w-48 h-48 mx-auto rounded-lg object-contain"
            />
            <div className="text-[12px] font-mono font-black text-[#2E3192] mt-2">
              MÃ VÉ: {ticketPassModal.ticketCode}
            </div>
          </div>

          <div className="rounded-xl bg-slate-50 dark:bg-slate-900/60 p-3 border border-slate-200 dark:border-slate-800 text-xs text-left space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-500">Đại biểu tham dự:</span>
              <span className="font-bold text-slate-800 dark:text-slate-100">
                {ticketPassModal.attendeeName}
              </span>
            </div>
            {ticketPassModal.attendeePosition && (
              <div className="flex justify-between">
                <span className="text-slate-500">Chức vụ:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {ticketPassModal.attendeePosition}
                </span>
              </div>
            )}
            {ticketPassModal.attendeeCompany && (
              <div className="flex justify-between">
                <span className="text-slate-500">Doanh nghiệp:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[200px]">
                  {ticketPassModal.attendeeCompany}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-500">Thời gian:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {ticketPassModal.time} | {ticketPassModal.date}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Hạng vé:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {ticketPassModal.ticketType} ({ticketPassModal.ticketCount} vé)
              </span>
            </div>
            {/* Randomly Assigned Seat Display */}
            <div className="flex justify-between items-center bg-indigo-500/10 dark:bg-indigo-500/20 rounded-lg p-2 border border-indigo-500/30">
              <div className="text-left">
                <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 uppercase block">
                  Vị trí chỗ ngồi (Hệ thống xếp tự động):
                </span>
                <span className="font-bold text-xs text-indigo-950 dark:text-indigo-100">
                  {ticketPassModal.seatAssignment || "Bàn VIP 02 - Ghế 04"}
                </span>
              </div>
              <span className="text-[9.5px] text-slate-500 dark:text-slate-400 text-right italic max-w-[120px] leading-tight">
                Chỉ BTT, BQT và Admin mới có quyền đổi chỗ
              </span>
            </div>
            <div className="flex justify-between items-center bg-amber-500/10 rounded-lg p-1.5 border border-amber-500/30">
              <span className="text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                Số may mắn (Quay thưởng):
              </span>
              <span className="font-mono font-black text-sm text-amber-700 dark:text-amber-400 bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-amber-500/30">
                {ticketPassModal.luckyNumber}
              </span>
            </div>
          </div>

          <div className="rounded-lg bg-blue-50 dark:bg-blue-950/60 p-2.5 text-[11px] text-blue-900 dark:text-blue-300 text-left leading-relaxed">
            ℹ️ <b>Lưu ý chỗ ngồi & check-in:</b> Chỗ ngồi được hệ thống phân bổ ngẫu nhiên theo bàn tiệc.
            Khi đến sự kiện, Anh/Chị vui lòng xuất trình mã QR này để Ban Truyền Thông quét mã QR xác nhận và
            hướng dẫn vào đúng vị trí bàn tiệc.
          </div>

          <div className="pt-1">
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 font-bold text-xs text-slate-800 dark:text-slate-200 transition cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
