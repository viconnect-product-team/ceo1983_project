import React, { useMemo, useRef, useState } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  QrCode,
  Sparkles,
  Download,
  Share2,
  Printer,
  CheckCircle2,
  AlertCircle,
  Copy,
  Handshake,
  Image as ImageIcon,
  ExternalLink,
  Upload,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { type EventItem } from "@/lib/events.functions";
import { resolveMediaUrl, uploadFileToNest } from "@/lib/api-client";
import { formatDisplayDate } from "@/lib/date-format";

export interface AgendaItem {
  id?: string;
  time: string;
  title: string;
  speaker?: string;
  desc?: string;
}

export interface SponsorItem {
  name: string;
  sponsorName?: string;
  tier?: string;
  logoUrl?: string;
}

export interface EventPosterProps {
  event: EventItem | any;
  customBannerUrl?: string;
  onBannerChange?: (newUrl: string) => void;
  canEditBanner?: boolean;
  className?: string;
  showActions?: boolean;
  onRegisterClick?: () => void;
  isRegistered?: boolean;
}

/**
 * Tạo lịch trình mẫu logic và chỉn chu nếu sự kiện chưa nhập agenda chi tiết
 */
function buildDefaultAgenda(event: any): AgendaItem[] {
  const startTime = event.startTime || (event.time ? String(event.time).split("-")[0]?.trim() : "08:30") || "08:30";
  const endTime = event.endTime || (event.time ? String(event.time).split("-")[1]?.trim() : "11:30") || "11:30";

  return [
    {
      time: `08:00 - ${startTime}`,
      title: "Đón tiếp Đại biểu & Điểm danh Check-in QR",
      speaker: "Ban Lễ tân & Thư ký CLB",
      desc: "Đại biểu quét mã QR điểm danh, nhận thẻ đeo và tài liệu sự kiện.",
    },
    {
      time: `${startTime} - 09:15`,
      title: "Khai mạc & Phát biểu Chỉ đạo của Ban Điều Hành",
      speaker: "Chủ tịch CLB & Ban Quản trị",
      desc: "Phát biểu khai mạc, báo cáo trọng tâm và định hướng hoạt động.",
    },
    {
      time: "09:15 - 10:30",
      title: "Tọa đàm Chuyên đề & Diễn đàn Chia sẻ Kinh nghiệm",
      speaker: "Chuyên gia & Diễn giả Doanh nhân",
      desc: "Thảo luận chuyên sâu, cập nhật xu hướng thị trường và giải pháp doanh nghiệp.",
    },
    {
      time: "10:30 - 11:15",
      title: "Giao thương B2B & Xúc tiến Kết nối Hợp tác Đầu tư",
      speaker: "Toàn thể Hội viên & Doanh nghiệp",
      desc: "Trưng bày sản phẩm, kết nối 1-1, tìm kiếm đối tác và ký kết hợp tác.",
    },
    {
      time: `11:15 - ${endTime}`,
      title: "Tổng kết, Bế mạc & Chụp ảnh Lưu niệm",
      speaker: "Ban Tổ chức",
      desc: "Trao kỷ niệm chương, tri ân nhà tài trợ và tiệc giao lưu kết nối.",
    },
  ];
}

const DEFAULT_BANNER = "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1600&auto=format&fit=crop&q=80";

export const EventPoster: React.FC<EventPosterProps> = ({
  event,
  customBannerUrl,
  onBannerChange,
  canEditBanner = false,
  className = "",
  showActions = true,
  onRegisterClick,
  isRegistered = false,
}) => {
  const posterRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  // Parse sponsors
  const sponsorList: SponsorItem[] = useMemo(() => {
    let list = event?.sponsors;
    if (typeof list === "string") {
      try {
        list = JSON.parse(list);
      } catch {
        list = [];
      }
    }
    if (!Array.isArray(list)) return [];
    return list
      .map((s: any) => ({
        name: s.sponsorName || s.name || "",
        tier: s.tier || "bronze",
        logoUrl: s.logoUrl || s.logo,
      }))
      .filter((s) => Boolean(s.name));
  }, [event?.sponsors]);

  // Parse agenda
  const agendaList: AgendaItem[] = useMemo(() => {
    let list = event?.agenda;
    if (typeof list === "string") {
      try {
        list = JSON.parse(list);
      } catch {
        list = [];
      }
    }
    if (Array.isArray(list) && list.length > 0) {
      return list.map((item: any) => ({
        time: item.time || `${item.startTime || "08:30"} - ${item.endTime || "09:30"}`,
        title: item.title || item.content || item.name || "Nội dung hoạt động",
        speaker: item.speaker || item.host,
        desc: item.desc || item.description,
      }));
    }
    return buildDefaultAgenda(event);
  }, [event?.agenda, event?.startTime, event?.endTime, event?.time]);

  // Banner image resolution
  const activeBanner =
    bannerPreview ||
    customBannerUrl ||
    (event?.imageUrl ? resolveMediaUrl(event.imageUrl) || event.imageUrl : null) ||
    (event?.bannerUrl ? resolveMediaUrl(event.bannerUrl) || event.bannerUrl : null) ||
    (event?.image ? resolveMediaUrl(event.image) || event.image : null) ||
    (event?.banner ? resolveMediaUrl(event.banner) || event.banner : null) ||
    DEFAULT_BANNER;

  // Time calculation
  const startTime = event?.startTime || (event?.time ? String(event.time).split("-")[0]?.trim() : "08:30") || "08:30";
  const endTime = event?.endTime || (event?.time ? String(event.time).split("-")[1]?.trim() : "11:30") || "11:30";
  const formattedDate = event?.date ? formatDisplayDate(event.date) : "25/10/2026";

  // Capacity calculation (tự động tăng/giảm theo số lượng người đăng ký)
  const capacity = Number(event?.capacity) > 0 ? Number(event.capacity) : 100;
  const registered = Math.max(0, Number(event?.registered || 0));
  const remainingSeats = Math.max(0, capacity - registered);
  const fillPercentage = Math.min(100, Math.round((registered / capacity) * 100));

  const isSoldOut = remainingSeats === 0;
  const isNearSoldOut = remainingSeats > 0 && remainingSeats <= 15;

  // Check-in QR URL (dùng mã QR điểm danh thực tế của sự kiện)
  const checkinUrl = useMemo(() => {
    if (event?.checkinQr) return event.checkinQr;
    const origin = typeof window !== "undefined" ? window.location.origin : "https://ceo1983.viconnect.vn";
    return `${origin}/association/checkin?eventId=${event?.id || ""}`;
  }, [event?.checkinQr, event?.id]);

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(checkinUrl)}`;

  // Handle banner upload
  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingBanner(true);
    const toastId = toast.loading("Đang tải ảnh banner mới lên hệ thống...");
    try {
      const uploadedUrl = await uploadFileToNest(file, `event_banner_${Date.now()}_${file.name}`);
      setBannerPreview(uploadedUrl);
      if (onBannerChange) {
        onBannerChange(uploadedUrl);
      }
      toast.success("Đã cập nhật ảnh background banner thành công!", { id: toastId });
    } catch (err: any) {
      toast.error(err?.message || "Không thể tải ảnh banner", { id: toastId });
    } finally {
      setUploadingBanner(false);
    }
  };

  // Copy link action
  const handleCopyLink = () => {
    navigator.clipboard.writeText(checkinUrl);
    toast.success("Đã sao chép đường link điểm danh sự kiện!");
  };

  // Print poster
  const handlePrint = () => {
    window.print();
  };

  // Download poster
  const handleDownload = () => {
    toast.info("Để lưu poster chất lượng cao nhất, vui lòng bấm Ctrl+P (In) và chọn 'Lưu dưới dạng PDF' hoặc chụp ảnh màn hình.");
  };

  return (
    <div className={`flex flex-col items-center w-full max-w-3xl mx-auto ${className}`}>
      {/* Top action bar if enabled */}
      {showActions && (
        <div className="w-full flex flex-wrap items-center justify-between gap-2.5 mb-4 p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm print:hidden">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>POSTER SỰ KIỆN CHÍNH THỨC</span>
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {canEditBanner && (
              <>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingBanner}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-200 text-xs font-semibold cursor-pointer transition shadow-2xs"
                >
                  <Upload className="w-3.5 h-3.5 text-blue-600" />
                  <span>{uploadingBanner ? "Đang tải..." : "Đổi ảnh nền Banner"}</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleBannerUpload}
                  className="hidden"
                />
              </>
            )}

            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-200 text-xs font-semibold cursor-pointer transition shadow-2xs"
            >
              <Copy className="w-3.5 h-3.5 text-amber-500" />
              <span>Sao chép link</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-200 text-xs font-semibold cursor-pointer transition shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span>In Poster</span>
            </button>

            {onRegisterClick && (
              <button
                type="button"
                onClick={onRegisterClick}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#003B95] to-[#002B70] text-white text-xs font-bold shadow-md hover:brightness-110 cursor-pointer transition"
              >
                {isRegistered ? "Xem vé tham dự" : "Đăng ký tham dự ngay"}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Poster Container (Ready for High-Res Print / Screenshot) */}
      <div
        ref={posterRef}
        className="w-full bg-[#040C20] text-white rounded-3xl overflow-hidden border-2 border-amber-500/50 shadow-2xl relative select-text"
        style={{
          boxShadow: "0 25px 50px -12px rgba(0, 59, 149, 0.4), 0 0 30px rgba(245, 158, 11, 0.15)",
        }}
      >
        {/* ================= 1. HEADER: BANNER SỰ KIỆN RIÊNG BIỆT ================= */}
        <div className="relative min-h-[300px] sm:min-h-[360px] w-full overflow-hidden p-6 sm:p-8 flex flex-col justify-between border-b-2 border-amber-500/40">
          {/* Custom Background Image with Deep Cobalt Gradient Overlay */}
          <img
            src={activeBanner}
            alt={event?.name || "Banner sự kiện"}
            className="absolute inset-0 h-full w-full object-cover object-center pointer-events-none transition-transform duration-1000 scale-100 hover:scale-105"
          />
          {/* Multi-layered High-End Gradient: Deep Navy & Gold Glow */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#040C20] via-[#001A4D]/85 to-[#001030]/75 pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/20 via-transparent to-transparent pointer-events-none" />

          {/* Top Organization Brand Bar */}
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 bg-black/50 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-amber-400/50 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-[11px] sm:text-xs font-black tracking-wider uppercase text-amber-300">
                CLB DOANH NHÂN CEO 1983 • HANOIBA
              </span>
            </div>

            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#003B95]/80 backdrop-blur-md border border-blue-400/40 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wide text-blue-100 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>{event?.type ? String(event.type).toUpperCase() : "SỰ KIỆN DOANH NHÂN"}</span>
            </span>
          </div>

          {/* Event Title & Subtitle / Tagline */}
          <div className="relative z-10 my-6">
            <h1
              className="text-2xl sm:text-4xl font-black text-white leading-tight uppercase tracking-tight drop-shadow-xl"
              style={{
                textShadow: "0 2px 10px rgba(0, 0, 0, 0.9), 0 0 20px rgba(0, 59, 149, 0.8)",
              }}
            >
              {event?.name || event?.title || "SỰ KIỆN KẾT NỐI DOANH NHÂN CEO 1983"}
            </h1>

            <p className="mt-2 text-xs sm:text-sm font-bold text-amber-300 uppercase tracking-widest drop-shadow-md">
              {event?.tagline || "Kế thừa giá trị · Kiến tạo tương lai · Phát triển bền vững"}
            </p>
          </div>

          {/* Glassmorphism Key Metadata Strip (Thời gian bắt đầu - kết thúc, Địa điểm) */}
          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-4 border-t border-white/20">
            <div className="flex items-center gap-2.5 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/15">
              <Clock className="w-5 h-5 text-amber-400 shrink-0" />
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-bold text-amber-200/80 block">Thời gian diễn ra</span>
                <span className="text-xs sm:text-sm font-black text-white truncate block">
                  {startTime} - {endTime} | {formattedDate}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/15">
              <MapPin className="w-5 h-5 text-amber-400 shrink-0" />
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-bold text-amber-200/80 block">Địa điểm tổ chức</span>
                <span className="text-xs sm:text-sm font-black text-white truncate block">
                  {event?.location || event?.venue || "Trung tâm Hội nghị Quốc gia, Hà Nội"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ================= 2. BODY: PHÂN CHIA GIỜ CỤ THỂ & SỐ LƯỢNG NGƯỜI ================= */}
        <div className="p-6 sm:p-8 space-y-7 bg-gradient-to-b from-[#040C20] via-[#061230] to-[#040C20]">
          {/* KHỐI SỐ LƯỢNG NGƯỜI THAM DỰ (TỰ ĐỘNG TĂNG/GIẢM THEO SỐ LƯỢNG NGƯỜI ĐĂNG KÝ) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#001F52]/90 via-[#003B95]/80 to-[#001F52]/90 border border-amber-400/40 shadow-lg">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-2.5">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-400" />
                <span className="text-xs font-black uppercase tracking-wider text-amber-300">
                  Số lượng người tham dự (Cập nhật thời gian thực):
                </span>
              </div>

              <span
                className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider ${
                  isSoldOut
                    ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                    : isNearSoldOut
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse"
                    : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                }`}
              >
                {isSoldOut
                  ? "🔴 Đã kín chỗ (Hết vé)"
                  : isNearSoldOut
                  ? `🟡 Sắp hết chỗ (Chỉ còn ${remainingSeats} ghế)`
                  : `🟢 Đang mở đăng ký (Còn ${remainingSeats} ghế)`}
              </span>
            </div>

            {/* Numbers counter */}
            <div className="flex items-baseline justify-between text-xs sm:text-sm font-bold text-slate-200 mb-2">
              <span>
                Đã đăng ký: <strong className="text-white text-base sm:text-lg font-black">{registered}</strong> /{" "}
                <span className="text-slate-300 font-semibold">{capacity} đại biểu</span>
              </span>
              <span className="text-amber-300 font-black">{fillPercentage}% tỷ lệ lấp đầy</span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-3 rounded-full bg-black/40 overflow-hidden p-0.5 border border-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 transition-all duration-700 shadow-sm"
                style={{ width: `${fillPercentage}%` }}
              />
            </div>
          </div>

          {/* LỊCH TRÌNH PHÂN CHIA GIỜ CỤ THỂ (GIỜ NÀY CÓ NỘI DUNG GÌ, GIỜ TIẾP THEO CÓ NỘI DUNG GÌ) */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-amber-500/30 pb-2.5">
              <Clock className="w-5 h-5 text-amber-400" />
              <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-amber-300">
                LỊCH TRÌNH CHI TIẾT THEO TỪNG KHUNG GIỜ:
              </h2>
            </div>

            <div className="space-y-3 relative before:absolute before:inset-0 before:left-4 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-amber-400 before:via-[#003B95] before:to-amber-500">
              {agendaList.map((item, idx) => (
                <div
                  key={idx}
                  className="relative flex items-start gap-4 pl-9 p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 transition-colors"
                >
                  {/* Timeline bullet dot */}
                  <span className="absolute left-2.5 top-4 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-amber-400 ring-4 ring-[#040C20] shadow-xs" />

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-1.5 mb-1">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-amber-400/15 border border-amber-400/30 text-amber-300 font-mono text-[11px] font-black">
                        ⏰ {item.time}
                      </span>
                      {item.speaker && (
                        <span className="text-[11px] font-bold text-blue-200/90 truncate max-w-[200px]">
                          👤 {item.speaker}
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm font-extrabold text-white leading-snug">{item.title}</h4>

                    {item.desc && (
                      <p className="mt-1 text-xs text-slate-300/85 leading-relaxed">{item.desc}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ================= 3. FOOTER: NHÀ ĐỒNG HÀNH TÀI TRỢ & MÃ QR ĐIỂM DANH ================= */}
        <div className="p-6 sm:p-8 bg-[#020712] border-t-2 border-amber-500/40">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* Cột 1 & 2: Nhà đồng hành tài trợ */}
            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center gap-2 text-amber-400">
                <Handshake className="w-5 h-5 text-amber-400" />
                <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-amber-300">
                  ĐƠN VỊ ĐỒNG HÀNH &amp; NHÀ TÀI TRỢ SỰ KIỆN:
                </h3>
              </div>

              {sponsorList.length > 0 ? (
                <div className="flex flex-wrap gap-2 pt-1">
                  {sponsorList.map((sp, idx) => (
                    <div
                      key={idx}
                      className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/[0.06] border border-amber-400/40 text-xs font-bold text-white shadow-xs backdrop-blur-xs"
                    >
                      <span className="text-amber-400 text-sm">✦</span>
                      <span>{sp.name}</span>
                      {sp.tier && (
                        <span className="text-[9.5px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-extrabold uppercase">
                          {sp.tier}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-slate-300 leading-relaxed">
                  Hiệp Hội Doanh Nhân CEO 1983 (HanoiBA) đồng hành cùng các Doanh nghiệp Hội viên kiến tạo giá trị và kết nối giao thương vững bền.
                </div>
              )}

              <p className="text-[11px] text-slate-400 pt-2 border-t border-white/10">
                Văn phòng Ban Thư Ký CLB CEO 1983 · Hotline: 0983 1983 83 · Email: btk@ceo1983.com
              </p>
            </div>

            {/* Cột 3: Mã QR Điểm Danh Trên Poster */}
            <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-gradient-to-b from-white/10 to-white/5 border border-amber-400/50 text-center shadow-lg">
              <div className="w-32 h-32 p-2 bg-white rounded-xl shadow-md flex items-center justify-center">
                <img
                  src={qrImageUrl}
                  alt="Mã QR Điểm Danh Sự Kiện"
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="mt-2.5 flex items-center gap-1.5 text-amber-300 font-black text-xs uppercase tracking-wide">
                <QrCode className="w-3.5 h-3.5 text-amber-400" />
                <span>MÃ QR ĐIỂM DANH</span>
              </div>
              <span className="text-[10px] text-slate-300 mt-0.5">
                Quét mã Zalo / Camera để Check-in
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
