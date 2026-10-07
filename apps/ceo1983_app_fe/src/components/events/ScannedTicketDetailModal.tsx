import React, { useState } from "react";
import {
  Ticket,
  CheckCircle2,
  Clock,
  MapPin,
  User,
  Phone,
  Building2,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  X,
  ScanLine,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";

export interface ScannedTicketData {
  ticketCode: string;
  attendeeName: string;
  attendeePhone: string;
  attendeeCompany?: string;
  attendeePosition?: string;
  attendeeAvatar?: string | null;
  memberCode?: string;
  eventId?: string;
  eventTitle: string;
  eventDate?: string;
  eventLocation?: string;
  ticketType?: string;
  seatAssignment?: string;
  luckyNumber?: string;
  ticketCount?: number;
  isCheckedIn: boolean;
  checkedInAt?: string | null;
  scannedBy?: string;
  eventMismatch?: boolean;
  currentEventId?: string;
  currentEventTitle?: string;
}

export interface ScannedTicketDetailModalProps {
  open: boolean;
  ticket: ScannedTicketData | null;
  onClose: () => void;
  onConfirmCheckIn: (ticket: ScannedTicketData) => void;
}

export function ScannedTicketDetailModal({
  open,
  ticket,
  onClose,
  onConfirmCheckIn,
}: ScannedTicketDetailModalProps) {
  const [submitting, setSubmitting] = useState(false);

  if (!open || !ticket) return null;

  const handleConfirm = () => {
    setSubmitting(true);
    try {
      const nowStr = new Date().toLocaleString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });

      const updated: ScannedTicketData = {
        ...ticket,
        isCheckedIn: true,
        checkedInAt: ticket.checkedInAt || nowStr,
        scannedBy: ticket.scannedBy || "Ban Truyền Thông CEO 1983",
      };

      onConfirmCheckIn(updated);
      toast.success(`Đã xác nhận check-in thành công cho ${ticket.attendeeName}!`, {
        description: `Mã vé: ${ticket.ticketCode} • Vị trí: ${ticket.seatAssignment || "Ghế tiêu chuẩn"}`,
      });
    } catch {
      toast.error("Không thể ghi nhận check-in. Vui lòng thử lại!");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs overflow-y-auto animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-white dark:bg-[#0F172A] border-2 border-amber-400/80 rounded-3xl overflow-hidden shadow-2xl flex flex-col text-slate-900 dark:text-white animate-scale-in my-auto max-h-[95vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ticket Header Banner */}
        <div className="relative bg-gradient-to-r from-[#001D4A] via-[#003B95] to-[#0A1A3A] p-4 text-white overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-28 h-28 rounded-full bg-amber-400/10 blur-xl pointer-events-none" />
          
          <div className="relative z-10 flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-300 text-[10.5px] font-black uppercase tracking-wider shadow-xs">
              <ShieldCheck className="h-3.5 w-3.5 text-amber-400" />
              <span>Ban Truyền Thông Soát Vé</span>
            </span>

            <button
              type="button"
              onClick={onClose}
              className="grid h-8 w-8 place-items-center rounded-full bg-black/40 text-white/80 hover:text-white hover:bg-black/60 transition cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="relative z-10 mt-3 space-y-1">
            <h3 className="text-base sm:text-lg font-black text-white leading-snug line-clamp-2">
              {ticket.eventTitle}
            </h3>
            <div className="flex flex-wrap items-center gap-2 text-[11px] text-sky-200">
              {ticket.eventDate && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-amber-400" />
                  <span>{ticket.eventDate}</span>
                </span>
              )}
              {ticket.eventLocation && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-rose-400" />
                  <span className="truncate max-w-[190px]">{ticket.eventLocation}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Check-in Status Banner & Event Mismatch Alert */}
        <div className="px-5 pt-3.5 space-y-2.5">
          {ticket.eventMismatch && (
            <div className="rounded-2xl border-2 border-rose-500 bg-rose-50/95 dark:bg-rose-950/60 p-3.5 space-y-1.5 shadow-sm">
              <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-black text-xs uppercase tracking-wide">
                <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600 animate-pulse" />
                <span>CẢNH BÁO: VÉ KHÔNG THUỘC SỰ KIỆN ĐANG SOÁT VÉ!</span>
              </div>
              <div className="text-xs text-rose-950 dark:text-rose-100 space-y-1">
                <div>
                  Vé của đại biểu <strong>{ticket.attendeeName}</strong> ({ticket.memberCode || ticket.ticketCode}) thuộc sự kiện:
                  <strong className="block font-black text-rose-700 dark:text-rose-300 text-sm mt-0.5">
                    {ticket.eventTitle}
                  </strong>
                </div>
                {ticket.currentEventTitle && (
                  <div className="text-[11px] text-slate-600 dark:text-slate-400 pt-1 border-t border-rose-200 dark:border-rose-900/60">
                    Sự kiện bàn đang kiểm soát: <strong className="text-slate-900 dark:text-white">{ticket.currentEventTitle}</strong>
                  </div>
                )}
              </div>
            </div>
          )}

          {ticket.isCheckedIn ? (
            <div className="rounded-2xl border border-emerald-500/40 bg-emerald-50 dark:bg-emerald-950/40 p-3 flex items-start gap-3 shadow-xs">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-500 text-white shrink-0 mt-0.5">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-emerald-700 dark:text-emerald-300 uppercase tracking-wide">
                    ĐÃ CHECK-IN THÀNH CÔNG
                  </span>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                    Hợp lệ
                  </span>
                </div>
                <p className="text-[11px] text-emerald-800 dark:text-emerald-200 mt-0.5 font-medium">
                  Thời gian ghi nhận: <strong className="font-bold">{ticket.checkedInAt || "Vừa xong"}</strong>
                </p>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400/80">
                  Người xác nhận: {ticket.scannedBy || "Ban Truyền Thông CEO 1983"}
                </p>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-amber-500/40 bg-amber-50 dark:bg-amber-950/30 p-3 flex items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2.5">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-400/40 shrink-0">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-xs font-black text-amber-800 dark:text-amber-300 uppercase tracking-wide">
                    CHƯA ĐIỂM DANH VÀO CỬA
                  </span>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">
                    Vé hợp lệ. Sẵn sàng xác nhận cho đại biểu.
                  </p>
                </div>
              </div>
              <span className="shrink-0 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 text-[10px] font-bold">
                Chờ duyệt
              </span>
            </div>
          )}
        </div>

        {/* Scrollable Ticket Content */}
        <div className="p-5 space-y-3.5 overflow-y-auto max-h-[50vh] [scrollbar-width:thin]">
          {/* Attendee Details Card */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-3.5 space-y-2.5">
            <span className="block text-[10.5px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Thông tin đại biểu tham dự
            </span>

            {/* Name */}
            <div className="flex items-center justify-between gap-2 border-b border-slate-200/70 dark:border-slate-800 pb-2">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-xs">
                <User className="h-4 w-4 text-[#003B95] dark:text-blue-400" />
                <span>Họ và tên:</span>
              </div>
              <span className="text-sm font-black text-slate-900 dark:text-white text-right">
                {ticket.attendeeName}
              </span>
            </div>

            {/* Phone */}
            <div className="flex items-center justify-between gap-2 border-b border-slate-200/70 dark:border-slate-800 pb-2">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-xs">
                <Phone className="h-4 w-4 text-emerald-600" />
                <span>Số điện thoại:</span>
              </div>
              <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                {ticket.attendeePhone || "Chưa cung cấp"}
              </span>
            </div>

            {/* Company & Role */}
            {(ticket.attendeeCompany || ticket.attendeePosition) && (
              <div className="flex items-start justify-between gap-2 pt-0.5">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-xs shrink-0">
                  <Building2 className="h-4 w-4 text-amber-500" />
                  <span>Doanh nghiệp:</span>
                </div>
                <div className="text-right min-w-0">
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate max-w-[210px]">
                    {ticket.attendeeCompany || "CLB Doanh Nhân CEO 1983"}
                  </div>
                  {ticket.attendeePosition && (
                    <div className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                      {ticket.attendeePosition}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Ticket & Seating Information Card */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-3.5 space-y-2.5">
            <span className="block text-[10.5px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Chi tiết vé & Vị trí chỗ ngồi
            </span>

            {/* Ticket Code */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                <Ticket className="h-3.5 w-3.5 text-[#003B95] dark:text-blue-400" />
                <span>Mã vé điện tử:</span>
              </span>
              <span className="text-xs font-mono font-black text-[#003B95] dark:text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-lg">
                {ticket.ticketCode}
              </span>
            </div>

            {/* Ticket Type */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-slate-600 dark:text-slate-400">Hạng vé:</span>
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                {ticket.ticketType || "VIP Standard Pass"} ({ticket.ticketCount || 1} vé)
              </span>
            </div>

            {/* Seat / Table Assignment */}
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-500 shrink-0" />
                <span className="text-xs font-bold text-amber-900 dark:text-amber-300">
                  Vị trí chỗ ngồi:
                </span>
              </div>
              <span className="text-xs font-black text-amber-800 dark:text-amber-200">
                {ticket.seatAssignment || "Bàn VIP 01 - Ban Chủ Tọa - Ghế 1"}
              </span>
            </div>

            {/* Lucky Number */}
            {ticket.luckyNumber && (
              <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-200/70 dark:border-slate-800">
                <span className="text-xs text-slate-600 dark:text-slate-400">
                  Số vé may mắn Gala:
                </span>
                <span className="text-xs font-mono font-extrabold text-amber-600 dark:text-amber-400">
                  {ticket.luckyNumber}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 flex flex-col gap-2">
          {!ticket.isCheckedIn ? (
            <button
              type="button"
              disabled={submitting}
              onClick={handleConfirm}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-98 transition-all cursor-pointer disabled:opacity-60"
            >
              <UserCheck className="h-4 w-4 text-slate-950" />
              <span>{submitting ? "Đang xác nhận..." : "Xác Nhận Check-In Đại Biểu"}</span>
            </button>
          ) : (
            <div className="w-full py-2.5 px-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold text-center flex items-center justify-center gap-1.5">
              <CheckCircle2 className="h-4 w-4" />
              <span>Đại biểu đã hoàn tất thủ tục vào cửa</span>
            </div>
          )}

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
          >
            <ScanLine className="h-3.5 w-3.5" />
            <span>Tiếp Tục Quét Vé Khác</span>
          </button>
        </div>
      </div>
    </div>
  );
}
