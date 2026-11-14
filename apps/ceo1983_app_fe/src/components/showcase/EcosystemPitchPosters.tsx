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
  Layers,
  Palette,
  CreditCard,
  Cpu,
  MonitorCheck,
  Award,
} from "lucide-react";
import { toast } from "sonner";
import html2canvas from "html2canvas-pro";

export type PitchPosterVersion =
  | "pin_multi_device"      // Pinterest 1116189088939047069 (Isometric Multi-Device Ecosystem)
  | "pin_hand_watermark"   // Pinterest 1126533294319507400 (Hand holding Phone & Architectural HQ)
  | "pin_neon_pedestal"    // Pinterest 1116189088942752029 (Floating Phone on Neon Pedestal & Glass Cards)
  | "pin_grid_screens"     // Pinterest 1108378158348955419 (2x2 Frosted Glass App Screens)
  | "pin_design_system"    // Pinterest 1116189088941957181 (Design System & Dual Phone Showcase)
  | "cosmic_executive"     // Alias for pin_multi_device
  | "minimalist_enterprise"; // Alias for pin_hand_watermark

export function EcosystemPitchPosters() {
  const [version, setVersion] = useState<PitchPosterVersion>("pin_multi_device");
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const posterContainerRef = useRef<HTMLDivElement>(null);

  // Normalized active version
  const activeTemplate =
    version === "cosmic_executive"
      ? "pin_multi_device"
      : version === "minimalist_enterprise"
      ? "pin_hand_watermark"
      : version;

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

  // Export 4K PNG (Scale 3x for ultra-sharp zoomable details)
  const handleExportPoster = async () => {
    if (!posterContainerRef.current) return;
    setIsExporting(true);
    toast.info("Đang xử lý render poster PR độ phân giải cao 4K...");

    try {
      const element = posterContainerRef.current;
      const canvas = await html2canvas(element, {
        scale: 3, // 3x ultra-sharp resolution for zoomable detail & print
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#03091e",
        logging: false,
      });

      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `CEO1983_PR_Showcase_${activeTemplate}_${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
      toast.success("✓ Đã xuất ảnh poster PR 4K sắc nét thành công! Sẵn sàng đi chào hàng đối tác.");
    } catch (err: any) {
      toast.error("Không thể xuất ảnh: " + (err.message || "Lỗi canvas"));
    } finally {
      setIsExporting(false);
    }
  };

  // Copy Direct Public Pitch Link
  const handleCopyPitchLink = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://ceo1983.viconnect.vn";
    const publicUrl = `${origin}/landing/pitch-deck?template=${activeTemplate}`;
    navigator.clipboard.writeText(publicUrl);
    setCopiedLink(true);
    toast.success("✓ Đã sao chép link chào hàng trực tiếp gửi đối tác!");
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* ── TOOLBAR ĐIỀU KHIỂN & CHỌN 5 BẢN POSTER PR CHUẨN PINTEREST ── */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-lg flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Sparkles className="size-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span>Bộ Poster PR Chào Hàng Hệ Sinh Thái CEO 1983</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950 uppercase">
                5 Phong Cách Pinterest
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              Thiết kế chuyên biệt cho đi chào hàng đối tác, xuất file PNG 4K zoom cực nét không vỡ hạt.
            </p>
          </div>
        </div>

        {/* Tab chuyển đổi 5 bản mẫu Pinterest */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-wrap items-center gap-1">
            <button
              type="button"
              onClick={() => setVersion("pin_multi_device")}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTemplate === "pin_multi_device"
                  ? "bg-[#003B95] text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900"
              }`}
            >
              <Crown className="size-3 text-amber-300" />
              <span>Mẫu 1: Đa Thiết Bị 3D</span>
            </button>

            <button
              type="button"
              onClick={() => setVersion("pin_hand_watermark")}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTemplate === "pin_hand_watermark"
                  ? "bg-[#003B95] text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900"
              }`}
            >
              <Smartphone className="size-3 text-cyan-300" />
              <span>Mẫu 2: Watermark &amp; Trụ Sở</span>
            </button>

            <button
              type="button"
              onClick={() => setVersion("pin_neon_pedestal")}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTemplate === "pin_neon_pedestal"
                  ? "bg-[#003B95] text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900"
              }`}
            >
              <Cpu className="size-3 text-purple-300" />
              <span>Mẫu 3: Bục Neon &amp; Trợ Lý</span>
            </button>

            <button
              type="button"
              onClick={() => setVersion("pin_grid_screens")}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTemplate === "pin_grid_screens"
                  ? "bg-[#003B95] text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900"
              }`}
            >
              <Layers className="size-3 text-emerald-300" />
              <span>Mẫu 4: 4 Màn Glassmorphism</span>
            </button>

            <button
              type="button"
              onClick={() => setVersion("pin_design_system")}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTemplate === "pin_design_system"
                  ? "bg-[#003B95] text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900"
              }`}
            >
              <Palette className="size-3 text-rose-300" />
              <span>Mẫu 5: Design System</span>
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
              className="px-3.5 py-2 rounded-xl bg-[#ffffff] hover:bg-slate-50 text-slate-900 font-black text-xs transition flex items-center gap-1.5 cursor-pointer shadow-md disabled:opacity-50 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <Download className="size-4" />
              <span>{isExporting ? "Đang xuất 4K..." : "Xuất Ảnh 4K Sắc Nét"}</span>
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
        {/* ──────────────────────────────────────────────────────────────────
            MẪU 1: PINTEREST 1116189088939047069 (ISOMETRIC MULTI-DEVICE ECOSYSTEM)
            "CEO 1983 IS TURNING ASSOCIATION NETWORKING INTO A SMART PLATFORM"
        ────────────────────────────────────────────────────────────────── */}
        {activeTemplate === "pin_multi_device" && (
          <div className="w-full bg-[#03091e] text-white relative overflow-hidden px-4 sm:px-8 lg:px-14 py-12 lg:py-16 selection:bg-amber-500 selection:text-black">
            {/* Ambient Lighting */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(0,102,255,0.22),_transparent_65%)] pointer-events-none" />
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-sky-500/10 rounded-full blur-[140px] pointer-events-none" />
            <div className="absolute top-10 left-10 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-[150px] pointer-events-none" />

            {/* Typography Header */}
            <div className="relative z-10 max-w-4xl mx-auto text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/80 border border-amber-400/40 shadow-[0_0_20px_rgba(251,191,36,0.25)] backdrop-blur-md">
                <Crown className="size-4 text-amber-400 animate-pulse" />
                <span className="text-[11px] sm:text-xs font-black uppercase tracking-[0.18em] text-amber-300">
                  HỆ SINH THÁI DOANH NHÂN CEO 1983 (HANOIBA)
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span className="text-[11px] text-slate-300 font-semibold">Chuyển Đổi Số Hiệp Hội</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight leading-[1.1] text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-amber-200 drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)]">
                BIẾN MẠNG LƯỚI HIỆP HỘI THÀNH NỀN TẢNG SỐ HÓA THÔNG MINH
              </h1>

              <p className="text-sm sm:text-base lg:text-lg text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed drop-shadow-sm">
                Đồng bộ hoàn hảo giữa <strong className="text-amber-300 font-bold">Cổng Quản Trị Web CRM</strong> và{" "}
                <strong className="text-sky-300 font-bold">Ứng Dụng Di Động Hội Viên</strong>: Thẻ Doanh Nhân Số,
                cổng thanh toán QR Napas247, điểm danh QR Gate và sàn kết nối giao thương B2B tự động.
              </p>
            </div>

            {/* Central Isometric Devices Hub */}
            <div className="relative z-10 my-10 lg:my-14 max-w-5xl mx-auto flex flex-col items-center">
              <div className="relative w-full max-w-[500px] sm:max-w-[580px] lg:max-w-[640px] flex justify-center items-center">
                <div className="absolute inset-0 bg-gradient-to-t from-amber-500/20 via-sky-500/15 to-transparent rounded-full blur-3xl transform scale-110 pointer-events-none" />

                {/* Main Hero Phone */}
                <div className="relative w-[280px] sm:w-[320px] lg:w-[360px] aspect-[9/18.5] bg-slate-950 rounded-[44px] p-2.5 border-[4px] border-slate-700/80 shadow-[0_25px_60px_rgba(0,0,0,0.9),0_0_40px_rgba(251,191,36,0.3)] overflow-hidden">
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-30" />
                  <div className="w-full h-full rounded-[36px] overflow-hidden bg-gradient-to-b from-[#001f54] via-[#001033] to-[#00081a] p-3 flex flex-col justify-between">
                    {/* Header */}
                    <div className="pt-5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img src="/app-icon.png" alt="Logo" className="size-7 rounded-lg" />
                        <div>
                          <div className="text-[10px] font-black text-amber-400">CLB CEO 1983</div>
                          <div className="text-[8px] text-slate-400">Hội Doanh Nhân Trẻ Hà Nội</div>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[8px] font-black bg-amber-500 text-slate-950">
                        OFFICIAL
                      </span>
                    </div>

                    {/* Electronic Business Card */}
                    <div className="my-2 p-3 rounded-2xl bg-gradient-to-br from-amber-500/20 via-slate-900/60 to-sky-900/40 border border-amber-400/50 shadow-lg relative overflow-hidden">
                      <div className="text-[8px] font-mono text-amber-300">THẺ DOANH NHÂN SỐ</div>
                      <div className="text-sm font-black text-white mt-0.5">Phạm Văn Vũ</div>
                      <div className="text-[9px] text-slate-300">Chủ tịch HĐQT · Viconnect Group</div>
                      <div className="mt-2 flex items-center justify-between pt-2 border-t border-amber-400/20">
                        <div className="text-[8px] font-mono text-slate-400">ID: CEO1983-088</div>
                        <QrCode className="size-6 text-amber-300" />
                      </div>
                    </div>

                    {/* 4 Quick Actions */}
                    <div className="grid grid-cols-4 gap-1 text-center">
                      <div className="p-1.5 rounded-xl bg-slate-900/80 border border-slate-800">
                        <Calendar className="size-3.5 mx-auto text-amber-400" />
                        <span className="text-[7.5px] font-bold block mt-0.5">Sự Kiện</span>
                      </div>
                      <div className="p-1.5 rounded-xl bg-slate-900/80 border border-slate-800">
                        <Building2 className="size-3.5 mx-auto text-sky-400" />
                        <span className="text-[7.5px] font-bold block mt-0.5">Giao Thương</span>
                      </div>
                      <div className="p-1.5 rounded-xl bg-slate-900/80 border border-slate-800">
                        <Award className="size-3.5 mx-auto text-emerald-400" />
                        <span className="text-[7.5px] font-bold block mt-0.5">Đặc Quyền</span>
                      </div>
                      <div className="p-1.5 rounded-xl bg-slate-900/80 border border-slate-800">
                        <Vote className="size-3.5 mx-auto text-purple-400" />
                        <span className="text-[7.5px] font-bold block mt-0.5">Bầu Cử</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Left Card: CRM Admin */}
                <div className="hidden md:flex absolute -left-16 top-12 p-3 rounded-2xl bg-slate-900/85 backdrop-blur-xl border border-sky-400/40 shadow-2xl flex-col gap-1 w-52 z-20">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-sky-500/20 text-sky-400">
                      <BarChart3 className="size-4" />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-sky-300">Cổng Quản Trị CRM</div>
                      <div className="text-xs font-black text-white">Recharts &amp; Excel</div>
                    </div>
                  </div>
                  <div className="text-[9px] text-slate-400 mt-1">
                    Thu chi minh bạch, gạch nợ tức thì qua cổng QR Napas247, phân quyền 3 cấp độ.
                  </div>
                </div>

                {/* Floating Right Card: Check-in QR Gate */}
                <div className="hidden md:flex absolute -right-16 bottom-16 p-3 rounded-2xl bg-slate-900/85 backdrop-blur-xl border border-amber-400/40 shadow-2xl flex-col gap-1 w-52 z-20">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                      <QrCode className="size-4" />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-amber-300">QR Gate Sự Kiện</div>
                      <div className="text-xs font-black text-white">Điểm Danh 0.1 Giây</div>
                    </div>
                  </div>
                  <div className="text-[9px] text-slate-400 mt-1">
                    Sơ đồ bàn tiệc cinema, gán chỗ ngồi chính thức, không ùn tắc cửa đón tiếp.
                  </div>
                </div>
              </div>
            </div>

            {/* 4 Feature Pillars */}
            <div className="relative z-10 max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-amber-400/40 transition">
                <Users className="size-6 text-amber-400 mb-2" />
                <h3 className="text-sm font-bold text-white">Giao Thương B2B</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Đăng sản phẩm, tìm kiếm đối tác cung ứng nội bộ CLB với độ tin cậy tuyệt đối.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-sky-400/40 transition">
                <Wallet className="size-6 text-sky-400 mb-2" />
                <h3 className="text-sm font-bold text-white">Tài Chính Minh Bạch</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Sổ quỹ thu chi, quản lý hội phí tự động gạch nợ với mã QR Napas247 chính xác từng giao dịch.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-emerald-400/40 transition">
                <Award className="size-6 text-emerald-400 mb-2" />
                <h3 className="text-sm font-bold text-white">Đặc Quyền Hội Viên</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Kho voucher ưu đãi độc quyền, thẻ hội viên điện tử nhận diện 3 màu thương hiệu.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-purple-400/40 transition">
                <Zap className="size-6 text-purple-400 mb-2" />
                <h3 className="text-sm font-bold text-white">Trợ Lý Ảo AI</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Hỏi đáp điều lệ, tra cứu nhanh lịch hoạt động và gợi ý kết nối doanh nghiệp thông minh.
                </p>
              </div>
            </div>

            {/* Metrics */}
            <div className="relative z-10 mt-12 pt-8 border-t border-slate-800 max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl lg:text-3xl font-black text-amber-400 font-mono">1.250+</div>
                <div className="text-xs text-slate-300 mt-1">Doanh Chủ &amp; Lãnh Đạo</div>
              </div>
              <div>
                <div className="text-2xl lg:text-3xl font-black text-sky-400 font-mono">105.8 Tỷ</div>
                <div className="text-xs text-slate-300 mt-1">Giá Trị Giao Thương B2B</div>
              </div>
              <div>
                <div className="text-2xl lg:text-3xl font-black text-emerald-400 font-mono">48+</div>
                <div className="text-xs text-slate-300 mt-1">Sự Kiện Mỗi Năm</div>
              </div>
              <div>
                <div className="text-2xl lg:text-3xl font-black text-purple-400 font-mono">99.8%</div>
                <div className="text-xs text-slate-300 mt-1">Tỷ Lệ Tín Nhiệm &amp; Tái Tục</div>
              </div>
            </div>
          </div>
        )}

        {/* ──────────────────────────────────────────────────────────────────
            MẪU 2: PINTEREST 1126533294319507400 (HAND HOLDING PHONE & HQ ARCHITECTURE)
            "CEO 1983 - CỔNG KẾT NỐI DOANH NHÂN & THẺ ĐIỆN TỬ"
        ────────────────────────────────────────────────────────────────── */}
        {activeTemplate === "pin_hand_watermark" && (
          <div className="w-full bg-[#080d1e] text-white relative overflow-hidden px-4 sm:px-8 lg:px-14 py-12 lg:py-16 selection:bg-cyan-500 selection:text-black">
            {/* Watermark "CEO 1983" chìm cực lớn trong nền */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
              <span className="text-[120px] sm:text-[200px] lg:text-[280px] font-black text-white/[0.03] tracking-tighter leading-none whitespace-nowrap">
                CEO 1983
              </span>
            </div>

            {/* Trụ sở 3D mờ ảo & vệt sáng kiến trúc */}
            <div className="absolute top-0 right-0 w-[550px] h-[550px] bg-gradient-to-b from-cyan-500/10 via-blue-600/5 to-transparent rounded-full blur-[140px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[450px] h-[450px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="relative z-10 max-w-4xl mx-auto text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-cyan-400/40 shadow-[0_0_24px_rgba(34,211,238,0.2)] backdrop-blur-md">
                <Zap className="size-4 text-cyan-400 animate-pulse" />
                <span className="text-[11px] sm:text-xs font-black uppercase tracking-[0.16em] text-cyan-300">
                  MOBILE APP CHÍNH THỨC CỦA HỘI VIÊN
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <span className="text-[11px] text-slate-300 font-semibold">Cộng Đồng HanoiBA</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight leading-[1.1] text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-cyan-200 drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)]">
                KẾT NỐI DOANH CHỦ 1983 TRONG TẦM TAY BẠN
              </h1>

              <p className="text-sm sm:text-base lg:text-lg text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
                Tất cả đặc quyền, giao thương, lịch họp ban và kết nối kinh doanh tinh hoa được tích hợp trọn vẹn trong một ứng dụng di động thanh lịch và an toàn.
              </p>
            </div>

            {/* Hero Hand & Floating Pill Tags */}
            <div className="relative z-10 my-12 max-w-4xl mx-auto flex flex-col items-center">
              {/* Tilted Floating Tags */}
              <div className="w-full flex justify-between items-center px-4 mb-4 text-xs font-bold">
                <span className="px-3 py-1.5 rounded-full bg-cyan-500/20 border border-cyan-400/50 text-cyan-200 shadow-lg -rotate-3">
                  ⚡ Check-in Siêu Tốc 0.1s
                </span>
                <span className="px-3 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-200 shadow-lg rotate-2">
                  👑 Thẻ Doanh Nhân Số
                </span>
                <span className="px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/50 text-emerald-200 shadow-lg -rotate-2">
                  🔒 Bảo Mật AES-256
                </span>
              </div>

              {/* Central Phone Mockup */}
              <div className="relative w-[300px] sm:w-[340px] aspect-[9/18.5] bg-slate-950 rounded-[44px] p-2.5 border-[4px] border-cyan-500/60 shadow-[0_25px_60px_rgba(0,0,0,0.9),0_0_50px_rgba(6,182,212,0.35)] overflow-hidden">
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-30" />
                <div className="w-full h-full rounded-[36px] overflow-hidden bg-gradient-to-b from-[#03152e] via-[#020b18] to-black p-3.5 flex flex-col justify-between">
                  <div className="pt-4 flex items-center justify-between">
                    <span className="text-xs font-black text-cyan-300">CLB DOANH NHÂN 1983</span>
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-cyan-500/30 text-cyan-200">HanoiBA</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-gradient-to-br from-cyan-900/40 via-slate-900/80 to-blue-950/60 border border-cyan-400/40 shadow-inner">
                    <div className="flex items-center gap-2.5">
                      <div className="size-11 rounded-full bg-amber-400/20 border border-amber-400 flex items-center justify-center font-black text-amber-300">
                        PV
                      </div>
                      <div>
                        <div className="text-xs font-black text-white">Phạm Văn Vũ</div>
                        <div className="text-[10px] text-cyan-300">Chủ tịch Sáng Lập · CEO 1983</div>
                      </div>
                    </div>
                    <div className="mt-3 pt-2.5 border-t border-slate-700/60 flex items-center justify-between">
                      <span className="text-[9px] text-slate-400 font-mono">HẠNG: DOANH NHÂN CHÍNH THỨC</span>
                      <QrCode className="size-5 text-cyan-300" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                      <span className="text-[10px] text-slate-300">Sự kiện sắp tới: Gala Hội Ngộ 1983</span>
                      <span className="text-[9px] font-bold text-amber-400">Đã đăng ký</span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                      <span className="text-[10px] text-slate-300">Hội phí thường niên</span>
                      <span className="text-[9px] font-bold text-emerald-400">Đã hoàn thành</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3-Step Guide Ticker */}
              <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
                  <span className="text-xs font-black text-cyan-400 block mb-1">BƯỚC 1</span>
                  <div className="text-xs font-bold text-white">Tải App &amp; Đăng Nhập</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Xác thực OTP tức thì, phân quyền chuẩn vai trò</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
                  <span className="text-xs font-black text-amber-400 block mb-1">BƯỚC 2</span>
                  <div className="text-xs font-bold text-white">Kích Hoạt Thẻ Doanh Nhân Số</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Mã QR cá nhân hóa, điểm danh check-in 1 chạm</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
                  <span className="text-xs font-black text-emerald-400 block mb-1">BƯỚC 3</span>
                  <div className="text-xs font-bold text-white">Kết Nối Giao Thương B2B</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Khám phá cơ hội hợp tác và ưu đãi độc quyền</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ──────────────────────────────────────────────────────────────────
            MẪU 3: PINTEREST 1116189088942752029 (NEON PEDESTAL & FLOATING CARDS)
            "BIẾN APP DOANH NHÂN THÀNH TRỢ LÝ CÁ NHÂN HÓA"
        ────────────────────────────────────────────────────────────────── */}
        {activeTemplate === "pin_neon_pedestal" && (
          <div className="w-full bg-[#050614] text-white relative overflow-hidden px-4 sm:px-8 lg:px-14 py-12 lg:py-16 selection:bg-purple-500 selection:text-black">
            {/* Ambient Lighting Purple / Cyan */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-purple-600/15 rounded-full blur-[160px] pointer-events-none" />
            <div className="absolute top-10 right-10 w-96 h-96 bg-cyan-500/15 rounded-full blur-[140px] pointer-events-none" />

            <div className="relative z-10 max-w-4xl mx-auto text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/80 border border-purple-400/40 shadow-[0_0_24px_rgba(168,85,247,0.3)] backdrop-blur-md">
                <Sparkles className="size-4 text-purple-400 animate-pulse" />
                <span className="text-[11px] sm:text-xs font-black uppercase tracking-[0.16em] text-purple-300">
                  TRỢ LÝ SỐ &amp; BẢN SẮC CÁ NHÂN HÓA
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                <span className="text-[11px] text-slate-300 font-semibold">ViOne AI Engine</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight leading-[1.1] text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-purple-200 drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)]">
                BIẾN APP DOANH NHÂN THÀNH TRỢ LÝ CÁ NHÂN HÓA
              </h1>

              <p className="text-sm sm:text-base lg:text-lg text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
                Tự động đề xuất kết nối kinh doanh, nhắc lịch họp Ban, cảnh báo gia hạn hội phí và phát hành vé mời điện tử chuẩn mực.
              </p>
            </div>

            {/* Neon Pedestal Centerpiece with 3 Floating Cards & Connectors */}
            <div className="relative z-10 my-14 max-w-5xl mx-auto flex flex-col items-center">
              <div className="relative w-full max-w-[640px] flex justify-center items-center">
                {/* 3D Circular Multi-Ring Neon Pedestal Base */}
                <div className="absolute -bottom-10 w-[420px] sm:w-[500px] h-[120px] rounded-[100%] bg-gradient-to-r from-purple-500/30 via-cyan-400/40 to-purple-500/30 blur-md border-t-2 border-cyan-400 shadow-[0_0_60px_rgba(168,85,247,0.6)] transform rotate-x-60 pointer-events-none" />

                {/* Floating Phone on Pedestal */}
                <div className="relative z-10 w-[290px] sm:w-[330px] aspect-[9/18.5] bg-slate-950 rounded-[44px] p-2.5 border-[4px] border-purple-500/70 shadow-[0_30px_70px_rgba(0,0,0,0.9),0_0_60px_rgba(168,85,247,0.4)] overflow-hidden">
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-30" />
                  <div className="w-full h-full rounded-[36px] overflow-hidden bg-gradient-to-b from-[#130a2a] via-[#090518] to-black p-3.5 flex flex-col justify-between">
                    <div className="pt-4 flex items-center justify-between">
                      <span className="text-xs font-black text-purple-300">TRỢ LÝ VIONE AI</span>
                      <span className="size-2 rounded-full bg-emerald-400 animate-ping" />
                    </div>

                    <div className="p-3 rounded-2xl bg-purple-950/40 border border-purple-400/30">
                      <div className="text-[10px] text-purple-300 font-bold">Gợi ý kết nối thông minh hôm nay:</div>
                      <div className="text-xs font-black text-white mt-1">Hội viên cùng ngành Xây Dựng &amp; Nội Thất</div>
                      <div className="text-[9px] text-slate-300 mt-1">3 đối tác tiềm năng đang tìm kiếm nhà cung cấp</div>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
                      <div className="text-[9px] text-slate-400">Vé mời Gala Atlantis 2026:</div>
                      <div className="text-xs font-black text-amber-300 mt-0.5">Bàn Danh Dự 01 · Ghế 08</div>
                    </div>
                  </div>
                </div>

                {/* Floating Card 1: Left Top (ViOne AI) */}
                <div className="hidden lg:flex absolute -left-12 top-6 p-3.5 rounded-2xl bg-slate-900/90 backdrop-blur-xl border border-purple-400/50 shadow-2xl flex-col gap-1 w-56 z-20">
                  <div className="flex items-center gap-2">
                    <Sparkles className="size-4 text-purple-400" />
                    <span className="text-xs font-black text-white">Trợ Lý Ảo ViOne AI</span>
                  </div>
                  <div className="text-[10px] text-slate-300">
                    Hỏi đáp điều lệ, tra cứu nhanh lịch hoạt động và tự động gợi ý đối tác B2B thông minh.
                  </div>
                </div>

                {/* Floating Card 2: Right Center (Thẻ Doanh Nhân Số) */}
                <div className="hidden lg:flex absolute -right-12 top-24 p-3.5 rounded-2xl bg-slate-900/90 backdrop-blur-xl border border-cyan-400/50 shadow-2xl flex-col gap-1 w-56 z-20">
                  <div className="flex items-center gap-2">
                    <QrCode className="size-4 text-cyan-400" />
                    <span className="text-xs font-black text-white">Thẻ Doanh Nhân Số</span>
                  </div>
                  <div className="text-[10px] text-slate-300">
                    Quẹt mã QR định danh, kết nối NFC 1 chạm và bảo lưu hồ sơ hội viên an toàn.
                  </div>
                </div>

                {/* Floating Card 3: Left Bottom (B2B Marketplace) */}
                <div className="hidden lg:flex absolute -left-8 bottom-12 p-3.5 rounded-2xl bg-slate-900/90 backdrop-blur-xl border border-amber-400/50 shadow-2xl flex-col gap-1 w-56 z-20">
                  <div className="flex items-center gap-2">
                    <Building2 className="size-4 text-amber-400" />
                    <span className="text-xs font-black text-white">Sàn Giao Dịch B2B</span>
                  </div>
                  <div className="text-[10px] text-slate-300">
                    Đăng sản phẩm, tìm kiếm đối tác cung ứng tin cậy với chứng nhận CLB CEO 1983.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ──────────────────────────────────────────────────────────────────
            MẪU 4: PINTEREST 1108378158348955419 (2X2 FROSTED GLASS APP SCREENS)
            "TRẢI NGHIỆM MOBILE APP HỘI VIÊN CHUẨN MỰC QUỐC TẾ"
        ────────────────────────────────────────────────────────────────── */}
        {activeTemplate === "pin_grid_screens" && (
          <div className="w-full bg-[#040817] text-white relative overflow-hidden px-4 sm:px-8 lg:px-14 py-12 lg:py-16 selection:bg-cyan-500 selection:text-black">
            {/* Grid Ambient Background */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.18),_transparent_70%)] pointer-events-none" />
            <div
              className="absolute inset-0 opacity-[0.04] pointer-events-none"
              style={{
                backgroundImage: `linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)`,
                backgroundSize: "48px 48px",
              }}
            />

            <div className="relative z-10 max-w-4xl mx-auto text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-cyan-400/40 shadow-[0_0_24px_rgba(34,211,238,0.2)] backdrop-blur-md">
                <Layers className="size-4 text-cyan-400 animate-pulse" />
                <span className="text-[11px] sm:text-xs font-black uppercase tracking-[0.16em] text-cyan-300">
                  4 PHÂN HỆ TRẢI NGHIỆM ĐỈNH CAO
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <span className="text-[11px] text-slate-300 font-semibold">Giao Diện Mobile-First</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight leading-[1.1] text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-cyan-200 drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)]">
                TRẢI NGHIỆM MOBILE APP HỘI VIÊN CHUẨN MỰC
              </h1>

              <p className="text-sm sm:text-base lg:text-lg text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
                4 màn hình trọng tâm được thiết kế theo tỷ lệ chuẩn, đường nét sắc sảo, hiệu ứng kính mờ glassmorphism và tương tác thời gian thực.
              </p>
            </div>

            {/* 2x2 Grid of 4 Floating Screens */}
            <div className="relative z-10 my-12 max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Screen 1: Splash & Identity */}
              <div className="p-3.5 rounded-3xl bg-slate-900/70 backdrop-blur-xl border border-sky-500/30 shadow-xl space-y-3 hover:border-sky-400 transition-all">
                <div className="aspect-[9/16] rounded-2xl bg-gradient-to-b from-[#001f54] to-black p-3 flex flex-col items-center justify-center text-center relative overflow-hidden">
                  <img src="/app-icon.png" alt="Logo" className="size-16 rounded-2xl shadow-2xl mb-3" />
                  <div className="text-sm font-black text-amber-400">CLB CEO 1983</div>
                  <div className="text-[10px] text-slate-300 mt-1">Đoàn kết - Tiên phong - Thịnh vượng</div>
                  <div className="mt-6 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-[9px] font-bold">
                    Trực thuộc HanoiBA
                  </div>
                </div>
                <div>
                  <h3 className="text-xs font-black text-white">1. Màn Khởi Động &amp; Bản Sắc</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Khẳng định vị thế và niềm tự hào hội viên</p>
                </div>
              </div>

              {/* Screen 2: Executive Dashboard */}
              <div className="p-3.5 rounded-3xl bg-slate-900/70 backdrop-blur-xl border border-amber-500/30 shadow-xl space-y-3 hover:border-amber-400 transition-all">
                <div className="aspect-[9/16] rounded-2xl bg-gradient-to-b from-[#0c1a30] to-black p-3 flex flex-col justify-between relative overflow-hidden">
                  <div className="text-[10px] font-mono text-amber-400">TRANG CHỦ HỘI VIÊN</div>
                  <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-400/40">
                    <div className="text-[8px] text-slate-300">THẺ DOANH NHÂN SỐ</div>
                    <div className="text-xs font-black text-white">Nguyễn Hoàng Long</div>
                    <div className="text-[8px] text-amber-300">CEO Công Nghệ Số 1983</div>
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-[8px] font-bold">
                    <div className="p-1.5 bg-slate-800 rounded-lg text-center">Giao Thương B2B</div>
                    <div className="p-1.5 bg-slate-800 rounded-lg text-center">Hội Phí Đã Đóng</div>
                  </div>
                </div>
                <div>
                  <h3 className="text-xs font-black text-white">2. Dashboard Trang Chủ</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Thẻ số đa năng và lối tắt nghiệp vụ nhanh</p>
                </div>
              </div>

              {/* Screen 3: Event Detail & QR Gate */}
              <div className="p-3.5 rounded-3xl bg-slate-900/70 backdrop-blur-xl border border-emerald-500/30 shadow-xl space-y-3 hover:border-emerald-400 transition-all">
                <div className="aspect-[9/16] rounded-2xl bg-gradient-to-b from-[#03241b] to-black p-3 flex flex-col justify-between relative overflow-hidden">
                  <div className="text-[10px] font-mono text-emerald-400">CHI TIẾT SỰ KIỆN</div>
                  <div className="text-center py-2">
                    <QrCode className="size-16 mx-auto text-emerald-300" />
                    <div className="text-[9px] font-mono text-emerald-200 mt-1">CHECK-IN GATE 0.1S</div>
                  </div>
                  <div className="text-[8px] text-slate-300 bg-slate-900/90 p-2 rounded-xl">
                    Sơ đồ bàn tiệc: Bàn Danh Dự 02 · Ghế 05
                  </div>
                </div>
                <div>
                  <h3 className="text-xs font-black text-white">3. Chi Tiết Sự Kiện &amp; QR Gate</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Điểm danh tự động và định vị ghế ngồi gala</p>
                </div>
              </div>

              {/* Screen 4: QR Booking & Payment */}
              <div className="p-3.5 rounded-3xl bg-slate-900/70 backdrop-blur-xl border border-purple-500/30 shadow-xl space-y-3 hover:border-purple-400 transition-all">
                <div className="aspect-[9/16] rounded-2xl bg-gradient-to-b from-[#1b082e] to-black p-3 flex flex-col justify-between relative overflow-hidden">
                  <div className="text-[10px] font-mono text-purple-400">CỔNG THANH TOÁN QR</div>
                  <div className="p-2.5 rounded-xl bg-purple-500/15 border border-purple-400/40 text-center">
                    <div className="text-[9px] text-slate-300">MÃ QR NAPAS247</div>
                    <div className="text-sm font-black text-emerald-400">10.000.000 đ</div>
                    <div className="text-[8px] text-slate-400">Gạch nợ tức thì tự động</div>
                  </div>
                  <div className="text-[8px] text-emerald-300 text-center">✓ Đã xác nhận thành công</div>
                </div>
                <div>
                  <h3 className="text-xs font-black text-white">4. Đặt Vé &amp; Cổng QR Napas247</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Minh bạch tài chính và tự động gạch nợ</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ──────────────────────────────────────────────────────────────────
            MẪU 5: PINTEREST 1116189088941957181 (DESIGN SYSTEMS & DUAL PHONES)
            "DESIGN SYSTEMS & NỀN TẢNG CÔNG NGHỆ CAO CẤP"
        ────────────────────────────────────────────────────────────────── */}
        {activeTemplate === "pin_design_system" && (
          <div className="w-full bg-[#060814] text-white relative overflow-hidden px-4 sm:px-8 lg:px-14 py-12 lg:py-16 selection:bg-rose-500 selection:text-black">
            {/* Dark IDE Code Backdrop */}
            <div className="absolute inset-0 opacity-[0.035] pointer-events-none font-mono text-[10px] p-6 leading-relaxed select-none overflow-hidden">
              {`// CEO 1983 Design System v5.0 - HanoiBA Core Architecture
export const theme = {
  colors: {
    primaryRed: "#DC2626", // Nhiệt huyết & Đoàn kết
    royalGold: "#F59E0B", // Tinh hoa & Hoàng gia
    prosperityBlue: "#003B95", // Thịnh vượng & Tin cậy
    surfaceDark: "#03091E"
  },
  components: {
    ElectronicBusinessCard: true,
    CinemaSeatingStudio: true,
    Napas247QrGate: true,
    ViOneAssistant: true
  }
};`}
            </div>

            <div className="relative z-10 max-w-4xl mx-auto text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-rose-400/40 shadow-[0_0_24px_rgba(244,63,94,0.2)] backdrop-blur-md">
                <Palette className="size-4 text-rose-400 animate-pulse" />
                <span className="text-[11px] sm:text-xs font-black uppercase tracking-[0.16em] text-rose-300">
                  DESIGN SYSTEMS MAKE TEAMS FASTER
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                <span className="text-[11px] text-slate-300 font-semibold">Quy Chuẩn 3 Màu Thương Hiệu</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight leading-[1.1] text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-rose-200 drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)]">
                HỆ THỐNG GIAO DIỆN &amp; KIẾN TRÚC MẠNH MẼ
              </h1>

              <p className="text-sm sm:text-base lg:text-lg text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
                Được chuẩn hóa từ các thư viện UI component độc quyền: Nút bấm 3D, thẻ nổi glassmorphism, bảng màu 3 cấp độ (Đỏ - Vàng - Xanh) và tương thích native đa nền tảng.
              </p>
            </div>

            {/* Dual Phones on Glass Pedestals & Floating UI Components */}
            <div className="relative z-10 my-12 max-w-5xl mx-auto flex flex-col items-center">
              <div className="relative w-full max-w-[700px] flex justify-center items-center gap-6 sm:gap-10">
                {/* Phone 1: CRM & Statistics */}
                <div className="relative w-[240px] sm:w-[280px] aspect-[9/18.5] bg-slate-950 rounded-[40px] p-2 border-[3px] border-slate-700 shadow-2xl overflow-hidden transform -rotate-3 hover:rotate-0 transition-transform">
                  <div className="w-full h-full rounded-[32px] bg-gradient-to-b from-[#021124] to-black p-3 flex flex-col justify-between">
                    <div className="text-[9px] font-mono text-sky-400">CRM THỐNG KÊ DOANH SỐ</div>
                    <div className="p-2 rounded-xl bg-sky-950/40 border border-sky-400/30">
                      <div className="text-[8px] text-slate-400">TỔNG GIAO THƯƠNG QUÝ II</div>
                      <div className="text-base font-black text-sky-300">42.5 TỶ VNĐ</div>
                    </div>
                    <div className="space-y-1">
                      <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div className="w-3/4 h-full bg-sky-400" />
                      </div>
                      <div className="text-[8px] text-slate-400 text-right">75% Chỉ tiêu năm</div>
                    </div>
                  </div>
                </div>

                {/* Phone 2: Mobile App Member Experience */}
                <div className="relative w-[240px] sm:w-[280px] aspect-[9/18.5] bg-slate-950 rounded-[40px] p-2 border-[3px] border-amber-500/60 shadow-2xl overflow-hidden transform rotate-3 hover:rotate-0 transition-transform">
                  <div className="w-full h-full rounded-[32px] bg-gradient-to-b from-[#1f1402] to-black p-3 flex flex-col justify-between">
                    <div className="text-[9px] font-mono text-amber-400">APP HỘI VIÊN CHÍNH THỨC</div>
                    <div className="p-2 rounded-xl bg-amber-950/40 border border-amber-400/30">
                      <div className="text-[8px] text-slate-400">THẺ ĐIỆN TỬ DOANH NHÂN</div>
                      <div className="text-sm font-black text-white">Chủ tịch Phạm Vũ</div>
                    </div>
                    <div className="text-center">
                      <QrCode className="size-10 mx-auto text-amber-300" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating UI Component Chips */}
              <div className="mt-8 flex flex-wrap justify-center gap-2 max-w-3xl">
                <span className="px-3 py-1 rounded-xl bg-red-600/20 border border-red-500/40 text-red-200 text-xs font-bold">
                  🔴 Đỏ HanoiBA
                </span>
                <span className="px-3 py-1 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-200 text-xs font-bold">
                  🟡 Vàng Hoàng Gia
                </span>
                <span className="px-3 py-1 rounded-xl bg-blue-600/20 border border-blue-400/40 text-blue-200 text-xs font-bold">
                  🔵 Xanh Thịnh Vượng
                </span>
                <span className="px-3 py-1 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono">
                  ⚛️ React Router v7
                </span>
                <span className="px-3 py-1 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono">
                  🦅 NestJS Core Architecture
                </span>
                <span className="px-3 py-1 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono">
                  🐘 PostgreSQL Pure 3-Tier
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
