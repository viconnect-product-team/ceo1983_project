import React, { useState } from "react";
import {
  QrCode,
  X,
  Copy,
  Check,
  ExternalLink,
  Download,
  Sparkles,
  Ticket,
  Maximize2,
  Calendar,
  MapPin,
} from "lucide-react";
import { toast } from "sonner";

interface EventGuestQrPresenterModalProps {
  open: boolean;
  onClose: () => void;
  event: {
    id: string;
    name: string;
    date?: string;
    location?: string;
    ticketPrice?: number;
    fee?: number;
  };
}

export function EventGuestQrPresenterModal({
  open,
  onClose,
  event,
}: EventGuestQrPresenterModalProps) {
  const [copied, setCopied] = useState(false);

  if (!open) return null;

  const origin = typeof window !== "undefined" ? window.location.origin : "https://14.225.217.232:5444";
  const guestRegUrl = `${origin}/events/${event.id}/register`;
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(guestRegUrl)}`;

  const ticketPrice = Number(event.ticketPrice || event.fee || 0);
  const isFree = ticketPrice === 0;

  const handleCopy = () => {
    navigator.clipboard.writeText(guestRegUrl);
    setCopied(true);
    toast.success("Đã sao chép link đăng ký khách vãng lai!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Top Header Strip */}
        <div className="bg-[#003B95] px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-[#001D4A] font-black flex items-center justify-center text-lg shadow-md">
              83
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-300">
                Ban Truyền Thông · Điểm Đón Tiếp
              </span>
              <h2 className="text-base sm:text-lg font-bold leading-tight">
                Mã QR Đón Tiếp & Nhận Vé
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 text-center space-y-4 overflow-y-auto max-h-[80vh]">
          <div>
            <h3 className="text-lg font-black text-slate-800 line-clamp-2">{event.name}</h3>
            <div className="flex items-center justify-center gap-2 mt-1.5 text-xs text-slate-500">
              {event.date && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-amber-500" />
                  {event.date}
                </span>
              )}
              {event.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-500" />
                  {event.location}
                </span>
              )}
            </div>
          </div>

          {/* Pricing indicator */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 border border-blue-200 text-[#003B95]">
            <Ticket className="w-3.5 h-3.5 text-amber-500" />
            {isFree ? (
              <span className="text-emerald-600 font-extrabold">Miễn phí tham dự (0 đ)</span>
            ) : (
              <span>
                Phí tham dự:{" "}
                <strong className="text-amber-600">
                  {new Intl.NumberFormat("vi-VN").format(ticketPrice)} đ/vé
                </strong>
              </span>
            )}
          </div>

          {/* QR Code Presentation Box */}
          <div className="relative mx-auto w-64 h-64 sm:w-72 sm:h-72 p-3 bg-white rounded-2xl border-2 border-dashed border-[#003B95] shadow-inner flex items-center justify-center">
            <img
              src={qrImageUrl}
              alt="Mã QR Đón Tiếp Sự Kiện"
              className="w-full h-full object-contain rounded-xl"
            />
          </div>

          <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-left text-xs text-amber-900 space-y-1">
            <p className="font-bold flex items-center gap-1.5 text-amber-800">
              <Sparkles className="w-4 h-4 text-amber-500" /> Hướng dẫn khách tham dự:
            </p>
            <p>1. Khách dùng camera điện thoại hoặc Zalo quét mã QR trên.</p>
            <p>2. Điền họ tên, số điện thoại, email và bấm Xác nhận.</p>
            <p>
              3. Hệ thống tự động gửi <strong>Email vé điện tử & Mã số quay thưởng Lucky Draw</strong>
              {isFree ? "" : " kèm hướng dẫn thanh toán VietQR"} về email của khách!
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <button
              onClick={handleCopy}
              className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  Đã copy link
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-500" />
                  Sao chép Link Đăng Ký
                </>
              )}
            </button>

            <a
              href={guestRegUrl}
              target="_blank"
              rel="noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#003B95] hover:bg-[#002B70] text-white text-xs font-bold shadow-md transition-all cursor-pointer"
            >
              <ExternalLink className="w-4 h-4 text-amber-400" />
              Mở Trang Đăng Ký
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
