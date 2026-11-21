import React, { useState, useEffect } from "react";
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
  Clock,
  Lock,
  Laptop,
  Globe,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { getAbsoluteQrUrl } from "@/lib/qr";
import { Ceo1983BrandBanner } from "./Ceo1983BrandBanner";

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

  // Xác định môi trường chạy: localhost hay production
  const [isLocalHost, setIsLocalHost] = useState(false);
  const [activeTab, setActiveTab] = useState<"prod" | "local">("prod");
  const [localOrigin, setLocalOrigin] = useState("http://localhost:5173");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const hostname = window.location.hostname;
      const isLocal = hostname === "localhost" || hostname === "127.0.0.1" || hostname.startsWith("192.168.");
      setIsLocalHost(isLocal);
      setLocalOrigin(`http://${window.location.host}`);
      // Nếu đang mở trên localhost thì ưu tiên tab local để tránh lỗi SSL
      if (isLocal) {
        setActiveTab("local");
      }
    }
  }, []);

  if (!open) return null;

  // 1. Link chính thức HTTPS của CLB Doanh Nhân CEO 1983 (dùng cho in ấn, quét Zalo, khách mời)
  const prodCheckinUrl = `https://crm.ceo1983.viconnect.vn/checkin/${event.id}`;
  
  // 2. Link máy cục bộ HTTP (dành cho thử nghiệm localhost, cam kết không lỗi SSL)
  const localCheckinUrl = `${localOrigin}/checkin/${event.id}`;
  // 3. Link IP 127.0.0.1 chống triệt để việc Chrome tự động ép HTTPS gây ra lỗi ERR_SSL_PROTOCOL_ERROR
  const ip127CheckinUrl = `http://127.0.0.1:${
    typeof window !== "undefined" && window.location.port ? window.location.port : "5173"
  }/checkin/${event.id}`;

  const currentCheckinUrl = activeTab === "local" ? localCheckinUrl : prodCheckinUrl;
  const qrImageUrl = getAbsoluteQrUrl(currentCheckinUrl, 500);

  const eventName =
    event.name ||
    event.title ||
    "SỰ KIỆN KẾT NỐI GIAO THƯƠNG CLB DOANH NHÂN CEO 1983";

  const handleCopy = () => {
    navigator.clipboard.writeText(currentCheckinUrl);
    setCopied(true);
    toast.success(
      activeTab === "local"
        ? "Đã sao chép liên kết Check-in Localhost (HTTP)!"
        : "Đã sao chép liên kết Check-in Chính Thức (HTTPS)!"
    );
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQr = () => {
    const a = document.createElement("a");
    a.href = qrImageUrl;
    a.download = `QR_Checkin_Vien_Doanh_Tri_${event.id}_${activeTab}.png`;
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
        } bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col transition-all duration-300 max-h-[92vh]`}
      >
        {/* Top Header CEO 1983 */}
        <div className="bg-gradient-to-r from-[#8B0000] via-[#003B95] to-[#D4AF37] px-6 py-4 text-white flex items-center justify-between shadow-md shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md text-white font-black flex items-center justify-center text-sm shadow-lg ring-2 ring-amber-300">
              1983
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-200 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-amber-300" />
                CLB DOANH NHÂN CEO 1983 (HANOIBA)
              </span>
              <h2 className="text-base sm:text-lg font-bold leading-tight line-clamp-1">
                Mã QR Quét Check-in Điểm Danh
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
        <div className="p-5 sm:p-6 text-center space-y-4 overflow-y-auto flex-1 flex flex-col items-center">
          {/* Banner Nhận diện CLB Doanh Nhân CEO 1983 */}
          <div className="w-full bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/80">
            <Ceo1983BrandBanner variant="light" />
          </div>

          {/* Tab chuyển đổi môi trường QR (Chính Thức HTTPS vs Localhost HTTP) */}
          <div className="w-full max-w-md flex rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveTab("prod")}
              className={`flex-1 py-1.5 px-2.5 rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === "prod"
                  ? "bg-white text-[#8B0000] shadow-sm border border-slate-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-[#8B0000]" />
              <span>🌐 Chính Thức (HTTPS)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("local")}
              className={`flex-1 py-1.5 px-2.5 rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === "local"
                  ? "bg-white text-[#00A859] shadow-sm border border-slate-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Laptop className="w-3.5 h-3.5 text-[#00A859]" />
              <span>💻 Test Localhost (HTTP)</span>
            </button>
          </div>

          {/* Thanh hiển thị URL hiện hành */}
          <div className="w-full max-w-md bg-emerald-50 border border-emerald-200/80 p-2.5 rounded-2xl flex items-center justify-between text-xs gap-2">
            <div className="flex items-center gap-1.5 min-w-0 text-emerald-900 font-semibold truncate">
              {activeTab === "prod" ? (
                <Lock className="w-3.5 h-3.5 text-[#00A859] shrink-0" />
              ) : (
                <Laptop className="w-3.5 h-3.5 text-[#005BAC] shrink-0" />
              )}
              <span className="truncate font-mono text-[11px]">{currentCheckinUrl}</span>
            </div>
            <a
              href={currentCheckinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1 rounded-lg bg-[#005BAC] hover:bg-[#004a8f] text-white text-[11px] font-bold shrink-0 transition shadow-2xs"
            >
              Mở Form
            </a>
          </div>

          {/* Cảnh báo an toàn SSL & Giải pháp 127.0.0.1 */}
          {activeTab === "local" && (
            <div className="w-full max-w-md bg-amber-50 border border-amber-200 rounded-xl p-2.5 text-[11px] text-amber-900 space-y-1.5 text-left">
              <div className="flex items-center gap-1.5 font-bold text-amber-800">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Khắc phục lỗi ERR_SSL_PROTOCOL_ERROR trên Chrome Localhost:</span>
              </div>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                Chrome thường tự động ép HTTPS khi gõ <code>localhost</code>. Nếu gặp lỗi kết nối bảo mật, hãy mở bằng địa chỉ <strong>127.0.0.1 (HTTP)</strong>:
              </p>
              <div className="flex items-center gap-2 pt-0.5">
                <a
                  href={ip127CheckinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] transition shadow-xs"
                >
                  <ExternalLink className="w-3 h-3" />
                  Mở qua 127.0.0.1:5173 (Không lỗi SSL)
                </a>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(ip127CheckinUrl);
                    toast.success("Đã chép link 127.0.0.1!");
                  }}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white border border-slate-300 text-slate-700 font-semibold text-[10px] hover:bg-slate-50 transition"
                >
                  <Copy className="w-3 h-3" />
                  Sao chép
                </button>
              </div>
            </div>
          )}

          {/* Khung trình chiếu mã QR */}
          <div className="relative p-4 bg-white rounded-3xl border-2 border-dashed border-[#8B0000] shadow-xl flex flex-col items-center justify-center group">
            <div className="bg-gradient-to-b from-amber-50 to-white p-3 rounded-2xl border border-amber-100">
              <img
                src={qrImageUrl}
                alt="Mã QR Check-in Sự Kiện"
                className={`${
                  isFullscreen ? "w-80 h-80" : "w-52 h-52 sm:w-60 sm:h-60"
                } object-contain rounded-xl transition-transform duration-200`}
              />
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs font-bold text-[#8B0000]">
              <QrCode className="w-4 h-4 animate-pulse text-[#D4AF37]" />
              <span>Quét bằng ứng dụng ZALO hoặc MỌI MÁY ẢNH để Check-in</span>
            </div>
          </div>

          {/* Hotline & Địa điểm */}
          <div className="w-full max-w-md bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs text-slate-600 text-left space-y-1">
            <div className="flex items-center gap-2 font-semibold text-slate-800">
              <MapPin className="w-3.5 h-3.5 text-[#003B95] shrink-0" />
              <span>Hội Trường Sự Kiện CLB Doanh Nhân CEO 1983 (HanoiBA)</span>
            </div>
            <div className="flex items-center gap-2 font-medium text-slate-600">
              <Phone className="w-3.5 h-3.5 text-[#8B0000] shrink-0" />
              <span>Hotline hỗ trợ Ban Thư Ký: 0988.870.888 / 0903.203.204</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="w-full max-w-md flex flex-wrap items-center justify-center gap-2 pt-1 pb-2">
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
              className="flex-1 min-w-[130px] inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold transition shadow-sm cursor-pointer"
            >
              <Download className="w-4 h-4 text-[#8B0000]" />
              <span>Tải Ảnh QR PNG</span>
            </button>

            <a
              href={currentCheckinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 min-w-[130px] inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-[#8B0000] via-[#003B95] to-[#D4AF37] hover:from-[#700000] hover:to-[#002b6d] text-white text-xs font-bold transition shadow-md cursor-pointer"
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
