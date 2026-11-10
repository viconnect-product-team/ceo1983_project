import React, { useState, useRef } from "react";
import {
  Sparkles,
  Smartphone,
  Share2,
  Download,
  Maximize2,
  Minimize2,
  ShieldCheck,
  TrendingUp,
  Users,
  QrCode,
  Calendar,
  Building2,
  CheckCircle2,
  Zap,
  BarChart3,
  MessageSquare,
  Copy,
  Check,
  ExternalLink,
  Star,
  Crown,
  Laptop,
  ArrowRight,
  Vote,
  GraduationCap,
  BellRing,
  Wallet,
  Compass,
} from "lucide-react";
import { toast } from "sonner";
import html2canvas from "html2canvas-pro";

export type PitchPosterVersion = "cosmic_executive" | "minimalist_enterprise";

export function EcosystemPitchPosters() {
  const [version, setVersion] = useState<PitchPosterVersion>("cosmic_executive");
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const posterContainerRef = useRef<HTMLDivElement>(null);

  // Toggle Presentation Fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      posterContainerRef.current?.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Export 4K PNG
  const handleExportPoster = async () => {
    if (!posterContainerRef.current) return;
    setIsExporting(true);
    toast.info("Đang xử lý render poster độ phân giải cao...");

    try {
      const element = posterContainerRef.current;
      const canvas = await html2canvas(element, {
        scale: 2.5, // 2.5x retina quality for print & pitch
        useCORS: true,
        allowTaint: true,
        backgroundColor: version === "cosmic_executive" ? "#020817" : "#0f172a",
        logging: false,
      });

      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `CEO1983_Ecosystem_Pitch_Poster_${version}_${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
      toast.success("✓ Đã xuất ảnh poster thành công! Sẵn sàng chào hàng đối tác.");
    } catch (err: any) {
      toast.error("Không thể xuất ảnh: " + (err.message || "Lỗi canvas"));
    } finally {
      setIsExporting(false);
    }
  };

  // Copy Direct Public Pitch Link
  const handleCopyPitchLink = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://ceo1983.viconnect.vn";
    const publicUrl = `${origin}/landing/pitch-deck?mode=${version}`;
    navigator.clipboard.writeText(publicUrl);
    setCopiedLink(true);
    toast.success("✓ Đã sao chép link chào hàng trực tiếp gửi đối tác!");
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* ── TOOLBAR ĐIỀU KHIỂN & CHỌN BẢN CHÀO HÀNG ── */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Sparkles className="size-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>Poster Hệ Thống Chào Hàng Đối Tác</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950 uppercase">
                  Pitch Deck
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Được thiết kế theo cấu trúc Pinterest chuẩn: Hero cầm điện thoại & 4 màn hình mobile đan xen.
              </p>
            </div>
          </div>
        </div>

        {/* Tab chuyển đổi 2 bản */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-1">
            <button
              type="button"
              onClick={() => setVersion("cosmic_executive")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                version === "cosmic_executive"
                  ? "bg-[#003B95] text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900"
              }`}
            >
              <Crown className="size-3.5 text-amber-300" />
              <span>Bản 1: Cosmic Executive (VIP CLB)</span>
            </button>
            <button
              type="button"
              onClick={() => setVersion("minimalist_enterprise")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                version === "minimalist_enterprise"
                  ? "bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 shadow-sm"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900"
              }`}
            >
              <Laptop className="size-3.5" />
              <span>Bản 2: High-Tech Enterprise (SaaS B2B)</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleCopyPitchLink}
              className="p-2 sm:px-3 sm:py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Sao chép liên kết chia sẻ cho khách hàng"
            >
              {copiedLink ? <Check className="size-4 text-emerald-500" /> : <Copy className="size-4 text-slate-500" />}
              <span className="hidden sm:inline">Sao Chép Link</span>
            </button>

            <button
              type="button"
              onClick={toggleFullscreen}
              className="p-2 sm:px-3 sm:py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Bật/Tắt chế độ thuyết trình toàn màn hình"
            >
              {isFullscreen ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
              <span className="hidden sm:inline">Thuyết Trình</span>
            </button>

            <button
              type="button"
              disabled={isExporting}
              onClick={handleExportPoster}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs transition flex items-center gap-1.5 cursor-pointer shadow-md disabled:opacity-50"
            >
              <Download className="size-4" />
              <span>{isExporting ? "Đang xuất..." : "Xuất Ảnh 4K / In Ấn"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════════
          KHUNG POSTER CHÍNH ĐỂ THUYẾT TRÌNH VÀ XUẤT ẢNH IN ẤN (CANVAS CONTAINER)
      ════════════════════════════════════════════════════════════════════════ */}
      <div
        ref={posterContainerRef}
        className="w-full relative rounded-3xl overflow-hidden shadow-2xl transition-all duration-300"
      >
        {version === "cosmic_executive" ? (
          /* ──────────────────────────────────────────────────────────────────
             BẢN 1: NAVY MIDNIGHT COSMIC EXECUTIVE (CLB DOANH NHÂN & HANOIBA)
             Phong cách Đêm Hoàng Gia, Deep Cosmic Navy, Sao vàng óng & Ánh kim
          ────────────────────────────────────────────────────────────────── */
          <div className="w-full bg-[#03091e] text-white relative overflow-hidden px-4 sm:px-8 lg:px-14 py-12 lg:py-16 selection:bg-amber-500 selection:text-black">
            {/* Lớp lưới nền đồ họa & ánh sáng vũ trụ */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(0,102,255,0.22),_transparent_65%)] pointer-events-none" />
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-sky-500/10 rounded-full blur-[140px] pointer-events-none" />
            <div className="absolute top-10 left-10 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-[150px] pointer-events-none" />
            <div
              className="absolute inset-0 opacity-[0.035] pointer-events-none"
              style={{
                backgroundImage: `radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)`,
                backgroundSize: "32px 32px",
              }}
            />

            {/* ── HEADER PHÍA TRÊN POSTER: TYPOGRAPHY LỚN HIỆN ĐẠI CHUẨN PINTEREST ── */}
            <div className="relative z-10 max-w-4xl mx-auto text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/80 border border-amber-400/40 shadow-[0_0_20px_rgba(251,191,36,0.25)] backdrop-blur-md">
                <Crown className="size-4 text-amber-400 animate-pulse" />
                <span className="text-[11px] sm:text-xs font-black uppercase tracking-[0.16em] text-amber-300">
                  HỆ SINH THÁI DOANH NHÂN CEO 1983 · HANOIBA
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span className="text-[11px] text-slate-300 font-semibold">Bản Quyền Độc Quyền</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight leading-[1.1] text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-sky-200 drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)]">
                NỀN TẢNG KẾT NỐI DOANH NHÂN &amp; QUẢN TRỊ HIỆP HỘI ĐỈNH CAO
              </h1>

              <p className="text-sm sm:text-base lg:text-lg text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed drop-shadow-sm">
                Thiết kế trải nghiệm <strong className="text-white font-bold">Mobile-First</strong> tối ưu. Số hóa 1.250+
                Doanh chủ Quý Hợi, xúc tiến giao thương B2B hơn 100 Tỷ VNĐ và quản trị sự kiện thông minh không giới hạn.
              </p>
            </div>

            {/* ── KHU VỰC TRUNG TÂM (HERO CENTERPIECE): BÀN TAY CẦM ĐIỆN THOẠI & FLOATING CARDS ── */}
            <div className="relative z-10 my-10 lg:my-14 max-w-5xl mx-auto flex flex-col items-center">
              <div className="relative w-full max-w-[420px] sm:max-w-[480px] lg:max-w-[540px] flex justify-center items-center">
                {/* Vầng hào quang phát sáng sau bàn tay */}
                <div className="absolute inset-0 bg-gradient-to-t from-blue-600/30 via-amber-400/20 to-transparent rounded-full blur-3xl transform scale-110 pointer-events-none" />

                {/* Bàn tay người cầm điện thoại */}
                <div className="relative w-full flex justify-center">
                  <img
                    src="/images/landing/hand_holding_phone_transparent.png"
                    alt="Hand holding mobile phone showing CEO 1983"
                    className="w-[340px] sm:w-[420px] lg:w-[480px] h-auto object-contain filter drop-shadow-[0_20px_40px_rgba(0,0,0,0.8)] z-10"
                  />

                  {/* Nội dung màn hình điện thoại được lồng ghép sống động */}
                  <div
                    className="absolute top-[8%] sm:top-[7.5%] w-[190px] sm:w-[235px] lg:w-[270px] h-[350px] sm:h-[430px] lg:h-[490px] rounded-[32px] sm:rounded-[40px] overflow-hidden z-20 pointer-events-none p-3 flex flex-col justify-between"
                    style={{
                      background: "linear-gradient(145deg, #021538 0%, #002b66 60%, #001233 100%)",
                      boxShadow: "inset 0 0 20px rgba(0,0,0,0.8)",
                    }}
                  >
                    {/* Header màn hình con */}
                    <div className="flex items-center justify-between pb-2 border-b border-amber-400/30">
                      <div className="flex items-center gap-1.5">
                        <img src="/app-icon.png" alt="" className="size-5 rounded-full" />
                        <span className="text-[9px] font-black text-amber-300">CLB CEO 1983</span>
                      </div>
                      <span className="text-[7.5px] px-1.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black">
                        HỘI VIÊN VIP
                      </span>
                    </div>

                    {/* Thẻ Doanh Nhân Số 3D lấp lánh */}
                    <div className="p-2.5 rounded-2xl bg-gradient-to-br from-amber-500/20 via-sky-500/20 to-indigo-600/30 border border-amber-300/40 shadow-inner space-y-1.5">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-[7px] text-slate-300 uppercase">Doanh Nhân Kim Cương</div>
                          <div className="text-[11px] font-black text-white">NGUYỄN VĂN AN</div>
                          <div className="text-[7.5px] text-amber-300 font-medium">Tập Đoàn Viconnect Global</div>
                        </div>
                        <QrCode className="size-6 text-white shrink-0" />
                      </div>
                      <div className="flex justify-between items-center text-[7px] text-slate-300 pt-1 border-t border-white/10 font-mono">
                        <span>ID: CEO1983-088</span>
                        <span className="text-amber-300 font-bold">Điểm Tín Nhiệm: AAA</span>
                      </div>
                    </div>

                    {/* Phím tắt tính năng nhanh */}
                    <div className="grid grid-cols-3 gap-1">
                      {[
                        { label: "Sàn B2B", icon: "🤝" },
                        { label: "Vé Mời QR", icon: "🎫" },
                        { label: "Hẹn 1-1", icon: "☕" },
                      ].map((btn, i) => (
                        <div
                          key={i}
                          className="p-1 rounded-xl bg-slate-900/80 border border-slate-700/60 text-center"
                        >
                          <div className="text-[10px]">{btn.icon}</div>
                          <div className="text-[6.5px] font-bold text-slate-200">{btn.label}</div>
                        </div>
                      ))}
                    </div>

                    {/* Dòng trạng thái cuối app */}
                    <div className="p-1.5 rounded-xl bg-blue-950/60 border border-blue-500/30 flex items-center justify-between text-[7px]">
                      <span className="text-slate-300">Đã kết nối:</span>
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <span className="size-1 rounded-full bg-emerald-400 animate-ping" />
                        Trực tuyến 1.250+
                      </span>
                    </div>
                  </div>
                </div>

                {/* ── 3 FLOATING GLASSMORPHISM CARDS (THẺ NỔI BAY XUNG QUANH) ── */}
                {/* Floating Card 1: Thẻ Doanh Nhân Số 3D & NFC */}
                <div className="hidden md:flex absolute -left-12 lg:-left-24 top-10 z-30 p-3.5 rounded-2xl backdrop-blur-xl bg-slate-900/80 border border-amber-400/40 shadow-[0_12px_36px_rgba(0,0,0,0.6)] max-w-[220px] items-center gap-3 animate-in fade-in slide-in-from-left-6 duration-700 hover:scale-105 transition-transform">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 shadow-md">
                    <Crown className="size-5" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-black text-amber-300">Thẻ Doanh Nhân 3D</div>
                    <div className="text-[10px] text-slate-300 font-medium">Chạm NFC 1 giây trao danh thiếp</div>
                    <div className="text-[9px] text-emerald-400 font-bold mt-0.5">✓ Tín nhiệm cấp tổ chức</div>
                  </div>
                </div>

                {/* Floating Card 2: Sàn Giao Thương B2B 105.8 Tỷ */}
                <div className="hidden md:flex absolute -right-12 lg:-right-24 top-24 z-30 p-3.5 rounded-2xl backdrop-blur-xl bg-slate-900/80 border border-sky-400/40 shadow-[0_12px_36px_rgba(0,0,0,0.6)] max-w-[230px] items-center gap-3 animate-in fade-in slide-in-from-right-6 duration-700 hover:scale-105 transition-transform">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 text-white shadow-md">
                    <TrendingUp className="size-5" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-black text-white">Sàn Giao Thương B2B</div>
                    <div className="text-[10px] text-slate-300 font-medium">105.8 Tỷ VNĐ giá trị kết nối</div>
                    <div className="text-[9px] text-sky-300 font-bold mt-0.5">480+ Cơ hội mua bán sỉ</div>
                  </div>
                </div>

                {/* Floating Card 3: Check-in Sự Kiện 0.5s */}
                <div className="hidden md:flex absolute -bottom-6 left-1/2 -translate-x-1/2 z-30 px-5 py-2.5 rounded-2xl backdrop-blur-xl bg-slate-900/90 border border-amber-400/60 shadow-[0_12px_40px_rgba(251,191,36,0.3)] items-center gap-3 hover:scale-105 transition-transform">
                  <QrCode className="size-5 text-amber-400" />
                  <span className="text-xs font-black text-white tracking-wide">
                    Vé Mời VIP &amp; Check-in 0.5 Giây Không Ùn Tắc
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                    100% Tự Động
                  </span>
                </div>
              </div>
            </div>

            {/* ── BỐ CỤC 4 MÀN HÌNH MOBILE ĐAN XEN (STAGGERED MULTI-DEVICE MOCKUPS) ── */}
            <div className="relative z-10 mt-16 max-w-6xl mx-auto space-y-6">
              <div className="text-center space-y-1">
                <span className="text-xs font-black uppercase tracking-[0.2em] text-amber-400">
                  CÁC TRỤ CỘT TÍNH NĂNG ĐỘC BẢN
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Trải Nghiệm Toàn Diện Dành Cho Hội Viên &amp; Ban Điều Hành
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 pt-4">
                {/* ── MÀN HÌNH 1: SÀN B2B & CƠ HỘI HỢP TÁC ── */}
                <div className="p-4 rounded-3xl backdrop-blur-md bg-slate-900/70 border border-slate-800 hover:border-amber-400/50 transition duration-300 flex flex-col justify-between group">
                  <div className="space-y-3">
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-[#041a4a] to-[#01091d] border border-blue-500/30 shadow-inner space-y-2">
                      <div className="flex items-center justify-between text-[10px] text-slate-300">
                        <span className="font-bold text-amber-300 flex items-center gap-1">
                          <Building2 className="size-3" /> Cơ hội B2B
                        </span>
                        <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[9px]">
                          2.4 Tỷ
                        </span>
                      </div>
                      <div className="text-xs font-bold text-white line-clamp-2">
                        Tìm tổng thầu thi công nội thất chuỗi nhà hàng khách sạn 5 sao
                      </div>
                      <div className="flex items-center justify-between text-[9px] text-slate-400 pt-1 border-t border-slate-800">
                        <span>Đã có 14 chào giá</span>
                        <span className="text-sky-400 font-semibold">Khớp nối ngay →</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 text-sm font-black text-white">
                        <span className="size-2 rounded-full bg-amber-400" />
                        <h4>Sàn Giao Thương B2B</h4>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        Đăng nhu cầu mua bán, đấu thầu sỉ nội bộ, tìm kiếm đối tác tin cậy trong hiệp hội với chi phí 0
                        đồng.
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-amber-300 font-bold">
                    <span>Xúc tiến giao thương</span>
                    <ArrowRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                {/* ── MÀN HÌNH 2: LỊCH HẸN 1-ON-1 & XÚC TIẾN ── */}
                <div className="p-4 rounded-3xl backdrop-blur-md bg-slate-900/70 border border-slate-800 hover:border-amber-400/50 transition duration-300 flex flex-col justify-between group">
                  <div className="space-y-3">
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-[#041a4a] to-[#01091d] border border-blue-500/30 shadow-inner space-y-2">
                      <div className="flex items-center justify-between text-[10px] text-slate-300">
                        <span className="font-bold text-sky-300 flex items-center gap-1">
                          <MessageSquare className="size-3" /> Lịch Hẹn 1-on-1
                        </span>
                        <span className="text-amber-400 font-bold text-[9px]">09:30 AM</span>
                      </div>
                      <div className="text-xs font-bold text-white line-clamp-2">
                        Cà phê đàm phán hợp tác cung ứng vật liệu xây dựng dự án Miền Bắc
                      </div>
                      <div className="flex items-center justify-between text-[9px] text-slate-400 pt-1 border-t border-slate-800">
                        <span>Habblet Hotel &amp; Landmark 72</span>
                        <span className="text-emerald-400 font-semibold">Đã xác nhận</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 text-sm font-black text-white">
                        <span className="size-2 rounded-full bg-sky-400" />
                        <h4>Lịch Gặp &amp; Chat Riêng</h4>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        Đặt lịch gặp 1-1, trao đổi hợp đồng bảo mật, gọi thoại trực tiếp mà không cần qua mạng xã hội
                        ngoài.
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-sky-300 font-bold">
                    <span>Kết nối sâu 1-on-1</span>
                    <ArrowRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                {/* ── MÀN HÌNH 3: ĐẠI HỘI DOANH NHÂN & VÉ MỜI QR ── */}
                <div className="p-4 rounded-3xl backdrop-blur-md bg-slate-900/70 border border-slate-800 hover:border-amber-400/50 transition duration-300 flex flex-col justify-between group">
                  <div className="space-y-3">
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-[#041a4a] to-[#01091d] border border-blue-500/30 shadow-inner space-y-2">
                      <div className="flex items-center justify-between text-[10px] text-slate-300">
                        <span className="font-bold text-amber-300 flex items-center gap-1">
                          <Calendar className="size-3" /> Đại Hội Thường Niên
                        </span>
                        <span className="px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-black text-[9px]">
                          VÉ VIP
                        </span>
                      </div>
                      <div className="text-xs font-black text-white line-clamp-2">
                        ĐẠI HỘI DOANH NHÂN CEO 1983 - GALA VINH DANH HOÀNG GIA
                      </div>
                      <div className="flex items-center justify-between text-[9px] text-slate-400 pt-1 border-t border-slate-800">
                        <span>Bàn VIP 01 · Ghế 06</span>
                        <span className="text-amber-400 font-bold flex items-center gap-1">
                          <QrCode className="size-3" /> Mã QR Vé
                        </span>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 text-sm font-black text-white">
                        <span className="size-2 rounded-full bg-emerald-400" />
                        <h4>Sự Kiện &amp; Vé Mời QR</h4>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        Phát hành thư mời Pinterest cao cấp, sơ đồ bàn tiệc gala VIP, check-in quét QR tự động tại cửa
                        đón tiếp.
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-emerald-300 font-bold">
                    <span>Quản trị sự kiện</span>
                    <ArrowRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                {/* ── MÀN HÌNH 4: MẠNG LƯỚI HỘI VIÊN & TƯƠNG TÁC ── */}
                <div className="p-4 rounded-3xl backdrop-blur-md bg-slate-900/70 border border-slate-800 hover:border-amber-400/50 transition duration-300 flex flex-col justify-between group">
                  <div className="space-y-3">
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-[#041a4a] to-[#01091d] border border-blue-500/30 shadow-inner space-y-2">
                      <div className="flex items-center justify-between text-[10px] text-slate-300">
                        <span className="font-bold text-amber-300 flex items-center gap-1">
                          <Users className="size-3" /> Mạng Lưới Hội Viên
                        </span>
                        <span className="text-emerald-400 text-[9px]">1.250 Doanh Chủ</span>
                      </div>
                      <div className="text-xs font-bold text-white line-clamp-2">
                        Bảng tin tương tác thành tựu doanh nghiệp, khen thưởng &amp; vinh danh
                      </div>
                      <div className="flex items-center justify-between text-[9px] text-slate-400 pt-1 border-t border-slate-800">
                        <span>Tra cứu theo ngành nghề</span>
                        <span className="text-cyan-400 font-semibold">63 Tỉnh Thành →</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 text-sm font-black text-white">
                        <span className="size-2 rounded-full bg-purple-400" />
                        <h4>Mạng Xã Hội Doanh Nhân</h4>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        Cộng đồng doanh nhân tinh hoa, tôn vinh thương hiệu cá nhân và chia sẻ cơ hội đầu tư minh bạch.
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-purple-300 font-bold">
                    <span>Mạng lưới gắn kết</span>
                    <ArrowRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </div>

            {/* ── THANH CHỈ SỐ STATS BAR THUYẾT PHỤC KHÁCH HÀNG ── */}
            <div className="relative z-10 mt-14 pt-8 border-t border-slate-800/80 max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div className="space-y-1">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-amber-400 font-mono">1.250+</div>
                <div className="text-xs text-slate-300 font-semibold">Doanh Chủ &amp; Lãnh Đạo VIP</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-sky-400 font-mono">105.8 Tỷ</div>
                <div className="text-xs text-slate-300 font-semibold">Giá Trị Giao Thương B2B</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-emerald-400 font-mono">48+</div>
                <div className="text-xs text-slate-300 font-semibold">Sự Kiện &amp; Diễn Đàn Mỗi Năm</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-amber-300 font-mono">99.8%</div>
                <div className="text-xs text-slate-300 font-semibold">Tỷ Lệ Tín Nhiệm &amp; Tái Tục</div>
              </div>
            </div>
          </div>
        ) : (
          /* ──────────────────────────────────────────────────────────────────
             BẢN 2: MODERN HIGH-TECH MINIMALIST (SAAS B2B & ENTERPRISE)
             Phong cách Công Nghệ Tinh Gọn Hiện Đại, Slate Obsidian & Champagne Gold
          ────────────────────────────────────────────────────────────────── */
          <div className="w-full bg-[#0a0f1d] text-white relative overflow-hidden px-4 sm:px-8 lg:px-14 py-12 lg:py-16 selection:bg-cyan-500 selection:text-black">
            {/* Lớp nền kiến trúc công nghệ */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.18),_transparent_70%)] pointer-events-none" />
            <div className="absolute top-1/4 right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />
            <div className="absolute bottom-10 left-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none" />
            <div
              className="absolute inset-0 opacity-[0.04] pointer-events-none"
              style={{
                backgroundImage: `linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)`,
                backgroundSize: "48px 48px",
              }}
            />

            {/* ── HEADER PHÍA TRÊN POSTER: HIGH-TECH TYPOGRAPHY ── */}
            <div className="relative z-10 max-w-4xl mx-auto text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-cyan-400/40 shadow-[0_0_24px_rgba(34,211,238,0.2)] backdrop-blur-md">
                <Zap className="size-4 text-cyan-400 animate-pulse" />
                <span className="text-[11px] sm:text-xs font-black uppercase tracking-[0.16em] text-cyan-300">
                  ALL-IN-ONE ENTERPRISE MANAGEMENT SYSTEM
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <span className="text-[11px] text-slate-300 font-semibold">Chuyển Đổi Số Tổ Chức</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight leading-[1.1] text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-cyan-200 drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)]">
                KIẾN TRÚC CHUYỂN ĐỔI SỐ TOÀN DIỆN CHO HIỆP HỘI &amp; DOANH NGHIỆP
              </h1>

              <p className="text-sm sm:text-base lg:text-lg text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed drop-shadow-sm">
                Tự động hóa <strong className="text-white font-bold">80% vận hành</strong>, minh bạch dòng tiền VietQR,
                tích hợp Trợ lý AI và Studio thiết kế thư mời đa kênh Zalo OA &amp; Email chuẩn Photoshop thu nhỏ.
              </p>
            </div>

            {/* ── KHU VỰC TRUNG TÂM (HERO CENTERPIECE): ĐIỆN THOẠI & CRM DASHBOARD ── */}
            <div className="relative z-10 my-10 lg:my-14 max-w-5xl mx-auto flex flex-col items-center">
              <div className="relative w-full max-w-[420px] sm:max-w-[480px] lg:max-w-[540px] flex justify-center items-center">
                {/* Vầng sáng công nghệ */}
                <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/25 via-indigo-500/20 to-transparent rounded-full blur-3xl transform scale-110 pointer-events-none" />

                {/* Bàn tay người cầm điện thoại */}
                <div className="relative w-full flex justify-center">
                  <img
                    src="/images/landing/hand_holding_phone_transparent.png"
                    alt="Hand holding mobile phone showing CRM Management"
                    className="w-[340px] sm:w-[420px] lg:w-[480px] h-auto object-contain filter drop-shadow-[0_20px_40px_rgba(0,0,0,0.8)] z-10"
                  />

                  {/* Nội dung màn hình điện thoại hiển thị CRM & Metrics */}
                  <div
                    className="absolute top-[8%] sm:top-[7.5%] w-[190px] sm:w-[235px] lg:w-[270px] h-[350px] sm:h-[430px] lg:h-[490px] rounded-[32px] sm:rounded-[40px] overflow-hidden z-20 pointer-events-none p-3 flex flex-col justify-between"
                    style={{
                      background: "linear-gradient(145deg, #091326 0%, #061e38 60%, #020b17 100%)",
                      boxShadow: "inset 0 0 20px rgba(0,0,0,0.85)",
                    }}
                  >
                    {/* Header CRM con */}
                    <div className="flex items-center justify-between pb-2 border-b border-cyan-400/30">
                      <div className="flex items-center gap-1.5">
                        <BarChart3 className="size-4 text-cyan-400" />
                        <span className="text-[9px] font-black text-white">CRM EXECUTIVE HUB</span>
                      </div>
                      <span className="text-[7.5px] px-1.5 py-0.5 rounded-full bg-cyan-400 text-slate-950 font-black">
                        LIVE SYNC
                      </span>
                    </div>

                    {/* Chỉ số doanh thu & hội viên */}
                    <div className="p-2.5 rounded-2xl bg-slate-900/90 border border-cyan-400/30 shadow-inner space-y-1.5">
                      <div className="flex justify-between items-center text-[7.5px] text-slate-300">
                        <span>Tổng Thu Quỹ Năm 2026:</span>
                        <span className="text-emerald-400 font-bold font-mono">1.850.000.000 đ</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 w-[84%]" />
                      </div>
                      <div className="flex justify-between text-[7px] text-slate-400 font-mono">
                        <span>Đã thu 84%</span>
                        <span className="text-cyan-300">Tự động VietQR</span>
                      </div>
                    </div>

                    {/* Lưới tính năng tự động hóa */}
                    <div className="grid grid-cols-2 gap-1.5 text-[7px]">
                      <div className="p-1.5 rounded-xl bg-slate-900/80 border border-slate-700/60">
                        <div className="font-bold text-cyan-300">Trợ Lý AI 24/7</div>
                        <div className="text-slate-400 text-[6.5px]">Tóm tắt họp &amp; nhắc nợ</div>
                      </div>
                      <div className="p-1.5 rounded-xl bg-slate-900/80 border border-slate-700/60">
                        <div className="font-bold text-amber-300">Photoshop Studio</div>
                        <div className="text-slate-400 text-[6.5px]">Poster thư mời 1 chạm</div>
                      </div>
                    </div>

                    {/* Trạng thái server & docker */}
                    <div className="p-1.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-[7px]">
                      <span className="text-slate-400 font-mono">Docker · Nginx SSL</span>
                      <span className="text-emerald-400 font-bold">Uptime 99.99%</span>
                    </div>
                  </div>
                </div>

                {/* ── 3 FLOATING GLASSMORPHISM CARDS (BẢN ENTERPRISE) ── */}
                {/* Floating Card 1: Photoshop Studio & Poster Thư Mời */}
                <div className="hidden md:flex absolute -left-12 lg:-left-24 top-10 z-30 p-3.5 rounded-2xl backdrop-blur-xl bg-slate-900/85 border border-cyan-400/40 shadow-[0_12px_36px_rgba(0,0,0,0.6)] max-w-[230px] items-center gap-3 animate-in fade-in slide-in-from-left-6 duration-700 hover:scale-105 transition-transform">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 text-slate-950 shadow-md">
                    <Laptop className="size-5 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-black text-cyan-300">Mini Photoshop Studio</div>
                    <div className="text-[10px] text-slate-300 font-medium">Kéo thả poster, cắt ảnh, bóc tách</div>
                    <div className="text-[9px] text-emerald-400 font-bold mt-0.5">Tạo thư mời trong 60 giây</div>
                  </div>
                </div>

                {/* Floating Card 2: Trợ Lý AI 24/7 */}
                <div className="hidden md:flex absolute -right-12 lg:-right-24 top-24 z-30 p-3.5 rounded-2xl backdrop-blur-xl bg-slate-900/85 border border-amber-400/40 shadow-[0_12px_36px_rgba(0,0,0,0.6)] max-w-[230px] items-center gap-3 animate-in fade-in slide-in-from-right-6 duration-700 hover:scale-105 transition-transform">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 shadow-md">
                    <Sparkles className="size-5" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-black text-amber-300">Trợ Lý AI &amp; Voice 24/7</div>
                    <div className="text-[10px] text-slate-300 font-medium">Điều khiển giọng nói &amp; tóm tắt</div>
                    <div className="text-[9px] text-amber-400 font-bold mt-0.5">Hỗ trợ hội viên tức thì</div>
                  </div>
                </div>

                {/* Floating Card 3: Sổ Quỹ Tự Động VietQR */}
                <div className="hidden md:flex absolute -bottom-6 left-1/2 -translate-x-1/2 z-30 px-5 py-2.5 rounded-2xl backdrop-blur-xl bg-slate-900/90 border border-cyan-400/60 shadow-[0_12px_40px_rgba(34,211,238,0.3)] items-center gap-3 hover:scale-105 transition-transform">
                  <Wallet className="size-5 text-cyan-400" />
                  <span className="text-xs font-black text-white tracking-wide">
                    Sổ Quỹ Tự Động Hóa &amp; VietQR Động Gạch Nợ Tức Thì
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                    Tiết Kiệm 80% Kế Toán
                  </span>
                </div>
              </div>
            </div>

            {/* ── BỐ CỤC 4 MÀN HÌNH ENTERPRISE ĐAN XEN ── */}
            <div className="relative z-10 mt-16 max-w-6xl mx-auto space-y-6">
              <div className="text-center space-y-1">
                <span className="text-xs font-black uppercase tracking-[0.2em] text-cyan-400">
                  CÁC PHÂN HỆ NỀN TẢNG ENTERPRISE
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Tối Ưu Hóa Năng Suất, Tự Động Vận Hành Không Sai Sót
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 pt-4">
                {/* ── ENTERPRISE SCREEN 1: DANH THIẾP THÔNG MINH & NFC ── */}
                <div className="p-4 rounded-3xl backdrop-blur-md bg-slate-900/70 border border-slate-800 hover:border-cyan-400/50 transition duration-300 flex flex-col justify-between group">
                  <div className="space-y-3">
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-[#0c1830] to-[#030914] border border-cyan-500/30 shadow-inner space-y-2">
                      <div className="flex items-center justify-between text-[10px] text-slate-300">
                        <span className="font-bold text-cyan-300 flex items-center gap-1">
                          <Compass className="size-3" /> Danh Thiếp Số
                        </span>
                        <span className="text-emerald-400 text-[9px] font-bold">NFC Active</span>
                      </div>
                      <div className="text-xs font-bold text-white line-clamp-2">
                        Đồng bộ tự động thông tin chức danh, website doanh nghiệp &amp; profile PDF
                      </div>
                      <div className="flex items-center justify-between text-[9px] text-slate-400 pt-1 border-t border-slate-800">
                        <span>Chia sẻ Zalo · QR Code</span>
                        <span className="text-cyan-400 font-semibold">1 chạm lưu danh bạ</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 text-sm font-black text-white">
                        <span className="size-2 rounded-full bg-cyan-400" />
                        <h4>Danh Thiếp NFC Thông Minh</h4>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        Thay thế 100% card visit giấy truyền thống, bảo vệ môi trường, nâng tầm vị thế thương hiệu
                        doanh nghiệp.
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-cyan-300 font-bold">
                    <span>Số hóa nhận diện</span>
                    <ArrowRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                {/* ── ENTERPRISE SCREEN 2: KHẢO SÁT & BẦU CỬ MINH BẠCH ── */}
                <div className="p-4 rounded-3xl backdrop-blur-md bg-slate-900/70 border border-slate-800 hover:border-cyan-400/50 transition duration-300 flex flex-col justify-between group">
                  <div className="space-y-3">
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-[#0c1830] to-[#030914] border border-cyan-500/30 shadow-inner space-y-2">
                      <div className="flex items-center justify-between text-[10px] text-slate-300">
                        <span className="font-bold text-amber-300 flex items-center gap-1">
                          <Vote className="size-3" /> Bầu Cử Ban Điều Hành
                        </span>
                        <span className="text-cyan-300 text-[9px] font-mono">Bảo Mật Kép</span>
                      </div>
                      <div className="text-xs font-bold text-white line-clamp-2">
                        Bỏ phiếu tín nhiệm điện tử minh bạch, kiểm phiếu tức thì không thể can thiệp
                      </div>
                      <div className="flex items-center justify-between text-[9px] text-slate-400 pt-1 border-t border-slate-800">
                        <span>Tỷ lệ tham gia: 98.4%</span>
                        <span className="text-emerald-400 font-semibold">Công khai kết quả</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 text-sm font-black text-white">
                        <span className="size-2 rounded-full bg-amber-400" />
                        <h4>Bầu Cử &amp; Khảo Sát Số</h4>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        Lấy ý kiến hội viên, biểu quyết nghị quyết đại hội trực tiếp ngay trên smartphone với tính bảo
                        mật tuyệt đối.
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-amber-300 font-bold">
                    <span>Dân chủ &amp; minh bạch</span>
                    <ArrowRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                {/* ── ENTERPRISE SCREEN 3: KHO TRI THỨC & CEO TALK ── */}
                <div className="p-4 rounded-3xl backdrop-blur-md bg-slate-900/70 border border-slate-800 hover:border-cyan-400/50 transition duration-300 flex flex-col justify-between group">
                  <div className="space-y-3">
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-[#0c1830] to-[#030914] border border-cyan-500/30 shadow-inner space-y-2">
                      <div className="flex items-center justify-between text-[10px] text-slate-300">
                        <span className="font-bold text-purple-300 flex items-center gap-1">
                          <GraduationCap className="size-3" /> Kho Tri Thức VIP
                        </span>
                        <span className="text-amber-400 text-[9px] font-bold">Exclusive</span>
                      </div>
                      <div className="text-xs font-bold text-white line-clamp-2">
                        Kho tài liệu quản trị, pháp lý doanh nghiệp &amp; video đào tạo Masterclass
                      </div>
                      <div className="flex items-center justify-between text-[9px] text-slate-400 pt-1 border-t border-slate-800">
                        <span>250+ Tài liệu thực chiến</span>
                        <span className="text-sky-300 font-semibold">Tải về tức thì</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 text-sm font-black text-white">
                        <span className="size-2 rounded-full bg-purple-400" />
                        <h4>Kho Tri Thức Doanh Chủ</h4>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        Tích lũy tài sản tri thức của hiệp hội, kết nối các chuyên gia đầu ngành cố vấn cho doanh nghiệp
                        thành viên.
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-purple-300 font-bold">
                    <span>Đào tạo &amp; phát triển</span>
                    <ArrowRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                {/* ── ENTERPRISE SCREEN 4: TRUNG TÂM PHÁT SÓNG ĐA KÊNH ── */}
                <div className="p-4 rounded-3xl backdrop-blur-md bg-slate-900/70 border border-slate-800 hover:border-cyan-400/50 transition duration-300 flex flex-col justify-between group">
                  <div className="space-y-3">
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-[#0c1830] to-[#030914] border border-cyan-500/30 shadow-inner space-y-2">
                      <div className="flex items-center justify-between text-[10px] text-slate-300">
                        <span className="font-bold text-emerald-300 flex items-center gap-1">
                          <BellRing className="size-3" /> Đa Kênh Tức Thì
                        </span>
                        <span className="text-emerald-400 text-[9px] font-bold">1 Click</span>
                      </div>
                      <div className="text-xs font-bold text-white line-clamp-2">
                        Phát sóng đồng bộ: App Push Notification, Tin nhắn Zalo ZNS và Email HTML
                      </div>
                      <div className="flex items-center justify-between text-[9px] text-slate-400 pt-1 border-t border-slate-800">
                        <span>Tỷ lệ mở thư: 89.2%</span>
                        <span className="text-emerald-400 font-semibold">Tự động hoá 100%</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 text-sm font-black text-white">
                        <span className="size-2 rounded-full bg-emerald-400" />
                        <h4>Truyền Thông Đa Kênh</h4>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        Ban Thư ký gửi thông báo lịch họp, nhắc nợ hội phí hoặc chúc mừng sinh nhật tự động không sót một
                        ai.
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-emerald-300 font-bold">
                    <span>Vận hành tự động</span>
                    <ArrowRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </div>

            {/* ── THANH CHỈ SỐ ROI THUYẾT PHỤC DOANH NGHIỆP ── */}
            <div className="relative z-10 mt-14 pt-8 border-t border-slate-800/80 max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div className="space-y-1">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-cyan-400 font-mono">80%</div>
                <div className="text-xs text-slate-300 font-semibold">Tiết Kiệm Thời Gian Vận Hành</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-amber-400 font-mono">300%</div>
                <div className="text-xs text-slate-300 font-semibold">Gia Tăng Tương Tác Hội Viên</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-emerald-400 font-mono">100%</div>
                <div className="text-xs text-slate-300 font-semibold">Minh Bạch Tài Chính Sổ Quỹ</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-sky-400 font-mono">24/7</div>
                <div className="text-xs text-slate-300 font-semibold">Trợ Lý AI Sẵn Sàng Phục Vụ</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── GỢI Ý CHÀO HÀNG & HƯỚNG DẪN ── */}
      <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-slate-700 dark:text-slate-300 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-amber-500 shrink-0" />
          <span>
            <strong>Mẹo Chào Hàng:</strong> Bấm <strong>"Thuyết Trình"</strong> để mở toàn màn hình khi pitching trên máy
            chiếu hoặc tivi phòng họp, hoặc bấm <strong>"Xuất Ảnh 4K"</strong> để in standee/brochure gửi khách hàng.
          </span>
        </div>
        <button
          type="button"
          onClick={handleExportPoster}
          className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold shrink-0 cursor-pointer shadow-xs"
        >
          Tải Ảnh Poster Ngay
        </button>
      </div>
    </div>
  );
}

