import React, { useState } from "react";
import {
  QrCode,
  X,
  Copy,
  Check,
  ExternalLink,
  Download,
  Sparkles,
  Maximize2,
  Calendar,
  MapPin,
  Phone,
  ShieldCheck,
  Clock,
  Building2,
  Wifi,
  Lock,
  Globe,
} from "lucide-react";
import { toast } from "sonner";
import { getAbsoluteQrUrl } from "@/lib/qr";

interface EventCheckinQrModalProps {
  open: boolean;
  onClose: () => void;
  event: {
    id: string;
    name?: string;
    title?: string;
    date?: string | Date;
    time?: string;
    location?: string;
  };
}

export function EventCheckinQrModal({
  open,
  onClose,
  event,
}: EventCheckinQrModalProps) {
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [protocolMode, setProtocolMode] = useState<"https" | "http">("http"); // Mặc định http để Zalo và mọi camera quét ăn ngay không bị lỗi chứng chỉ

  if (!open) return null;

  const currentHost =
    typeof window !== "undefined"
      ? window.location.host
      : "crm.ceo1983.viconnect.vn";

  const scheme = protocolMode === "http" ? "http:" : "https:";
  const checkinUrl = `${scheme}//${currentHost}/checkin/${event.id}`;
  const qrImageUrl = getAbsoluteQrUrl(checkinUrl, 500);

  const eventName =
    event.name ||
    event.title ||
    "KỶ NIỆM 4 NĂM VIỆN DOANH TRÍ & TOẠ ĐÀM DOANH NGHIỆP VIỆT 2027";

  const handleCopy = () => {
    navigator.clipboard.writeText(checkinUrl);
    setCopied(true);
    toast.success("Đã sao chép liên kết Check-in!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQr = () => {
    const a = document.createElement("a");
    a.href = qrImageUrl;
    a.download = `QR_Checkin_Vien_Doanh_Tri_${event.id}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success("Đang tải ảnh mã QR điểm danh!");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`relative w-full ${
          isFullscreen ? "max-w-4xl h-[95vh]" : "max-w-xl"
        } bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col transition-all duration-300`}
      >
        {/* Top Header Viện Doanh Trí */}
        <div className="bg-gradient-to-r from-[#005BAC] via-[#0284C7] to-[#00A859] px-6 py-4 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md text-white font-black flex items-center justify-center text-lg shadow-lg ring-2 ring-white/40">
              DT
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-200 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-emerald-300" />
                VIỆN DOANH TRÍ · QUẦY ĐÓN TIẾP & ĐIỂM DANH
              </span>
              <h2 className="text-base sm:text-lg font-bold leading-tight line-clamp-1">
                Mã QR Quét Check-in Sự Kiện
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              title="Chuyển chế độ trình chiếu toàn màn hình"
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 text-center space-y-4 overflow-y-auto flex-1 flex flex-col items-center justify-center">
          <div className="max-w-md mx-auto">
            <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold bg-sky-50 border border-sky-200 text-[#005BAC] mb-2">
              Kỷ niệm 4 năm Viện Doanh Trí & Tri ân 20/11
            </span>
            <h3 className="text-base sm:text-lg font-extrabold text-slate-800 line-clamp-2">
              {eventName}
            </h3>
            <div className="flex flex-wrap items-center justify-center gap-3 mt-2 text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#00A859]" />
                21/11/2026 (14h30 - 17h30)
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#005BAC]" />
                Check-in 30 phút đầu: Đúng giờ
              </span>
            </div>
          </div>

          {/* Protocol Toggle (Bảo đảm Zalo & mọi thiết bị không bị lỗi chứng chỉ) */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold gap-1">
            <button
              type="button"
              onClick={() => setProtocolMode("http")}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
                protocolMode === "http"
                  ? "bg-[#005BAC] text-white shadow-xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>HTTP (Khuyên dùng - Quét ăn ngay trên Zalo & mọi camera)</span>
            </button>
            <button
              type="button"
              onClick={() => setProtocolMode("https")}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
                protocolMode === "https"
                  ? "bg-[#005BAC] text-white shadow-xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>HTTPS</span>
            </button>
          </div>

          {/* QR Code Presentation Frame */}
          <div className="relative p-4 bg-white rounded-3xl border-2 border-dashed border-[#005BAC] shadow-xl flex flex-col items-center justify-center group">
            <div className="bg-gradient-to-b from-sky-50 to-white p-3 rounded-2xl border border-sky-100">
              <img
                src={qrImageUrl}
                alt="Mã QR Check-in Sự Kiện"
                className={`${
                  isFullscreen ? "w-80 h-80" : "w-56 h-56 sm:w-64 sm:h-64"
                } object-contain rounded-xl transition-transform duration-200`}
              />
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs font-bold text-[#005BAC]">
              <QrCode className="w-4 h-4 animate-pulse text-[#00A859]" />
              <span>Quét bằng ứng dụng ZALO hoặc MỌI MÁY ẢNH để Check-in</span>
            </div>
          </div>

          {/* Hotline & Notice */}
          <div className="w-full max-w-md bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs text-slate-600 text-left space-y-1">
            <div className="flex items-center gap-2 font-semibold text-slate-800">
              <MapPin className="w-3.5 h-3.5 text-[#00A859] shrink-0" />
              <span>Tầng 2, Nhà hàng Long Phụng, 29T2 Trung hòa nhân chính, Hà Nội</span>
            </div>
            <div className="flex items-center gap-2 font-medium text-slate-600">
              <Phone className="w-3.5 h-3.5 text-[#005BAC] shrink-0" />
              <span>Hotline hỗ trợ Ban Tổ Chức: 0988.870.888 / 0903.203.204</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="w-full max-w-md flex flex-wrap items-center justify-center gap-2 pt-2">
            <button
              onClick={handleCopy}
              className="flex-1 min-w-[130px] inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition shadow-sm cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700">Đã chép Link!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-500" />
                  <span>Sao chép Link</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownloadQr}
              className="flex-1 min-w-[130px] inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-bold transition shadow-sm cursor-pointer"
            >
              <Download className="w-4 h-4 text-emerald-600" />
              <span>Tải Ảnh QR PNG</span>
            </button>

            <a
              href={checkinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 min-w-[130px] inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-[#005BAC] via-[#0284C7] to-[#00A859] hover:from-[#004b99] hover:to-[#00964e] text-white text-xs font-bold transition shadow-md cursor-pointer"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Mở Form Check-in</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
