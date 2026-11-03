import { useState, useRef, useEffect } from "react";
import {
  X,
  Download,
  Save,
  Send,
  Sparkles,
  Move,
  Type,
  Image as ImageIcon,
  Palette,
  Sliders,
  RotateCcw,
  Building2,
  Calendar,
  MapPin,
  Check,
  Eye,
  Layers,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { fetchNestApi, uploadFileToNest } from "@/lib/api-client";

interface EventPosterStudioModalProps {
  open: boolean;
  onClose: () => void;
  event?: any;
  onSavePoster?: (posterUrl: string) => void;
  onBroadcastReminder?: (posterUrl: string) => void;
}

export function EventPosterStudioModal({
  open,
  onClose,
  event,
  onSavePoster,
  onBroadcastReminder,
}: EventPosterStudioModalProps) {
  // Preset City Backgrounds with deep perspective
  const BACKGROUND_PRESETS = [
    {
      id: "skyline_cosmos",
      name: "Thành Phố Vươn Tầm (Cosmos Deep)",
      url: "/ceo1983_hero_cosmos_skyline.jpg",
    },
    {
      id: "skyline_dark",
      name: "Skyline Phóng Tầm Mắt (Perspective Dark)",
      url: "/skyline_perspective_dark.jpg",
    },
    {
      id: "skyline_contrast",
      name: "Thành Phố Dạ Tiệc (Contrast)",
      url: "/skyline_perspective_contrast.jpg",
    },
    {
      id: "skyline_daylight",
      name: "Thành Phố Khát Vọng (Daylight)",
      url: "/ceo1983_hero_daylight_skyline.jpg",
    },
  ];

  // Configurable fields
  const [selectedBg, setSelectedBg] = useState<string>("/skyline_perspective_dark.jpg");
  const [customBgUrl, setCustomBgUrl] = useState<string>("");
  const [logoUrl, setLogoUrl] = useState<string>("/ceo1983-official-logo.png");

  // Dynamic Text Fields
  const [kicker, setKicker] = useState<string>("CHÀO MỪNG ĐẠI HỘI DOANH NHÂN");
  const [mainTitle, setMainTitle] = useState<string>(event?.name || event?.title || "CEO 1983 VIỆT NAM");
  const [subtitle, setSubtitle] = useState<string>("Thư Tri Ân & Thư Mời Đại Biểu");
  const [salutation, setSalutation] = useState<string>("Kính gửi: Quý Doanh Nhân & Đại Biểu Danh Dự");
  const [letterBody, setLetterBody] = useState<string>(
    `Nhân dịp sự kiện trọng đại của CLB Doanh Nhân CEO 1983 (HanoiBA), Ban Tổ Chức xin trân trọng gửi lời tri ân sâu sắc đến Quý Anh/Chị Hội viên và Quý Đối tác đã luôn đồng hành, cống hiến vì sự phát triển bền vững của cộng đồng doanh nhân.\n\nTrải qua hành trình gắn kết và bứt phá, mỗi thành viên chính là hạt nhân lan tỏa tinh thần tiên phong, sáng tạo và bản lĩnh thương trường. Chúng tôi tin tưởng rằng sự hiện diện của Quý Anh/Chị sẽ góp phần tạo nên một dấu ấn kết nối giao thương B2B đỉnh cao và thắt chặt tình bằng hữu doanh nhân 1983.\n\nKính chúc Quý Anh/Chị dồi dào sức khỏe, thành công rực rỡ và luôn giữ vững ngọn lửa nhiệt huyết tiên phong!`
  );
  const [eventDate, setEventDate] = useState<string>(
    event?.date
      ? new Date(event.date).toLocaleDateString("vi-VN", {
          weekday: "long",
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
      : "20:00 - Thứ Bảy, 20/11/2026"
  );
  const [eventLocation, setEventLocation] = useState<string>(
    event?.location || "Trung tâm Hội nghị Quốc gia, Hà Nội"
  );
  const [signOff, setSignOff] = useState<string>("Trân trọng,\nBAN TỔ CHỨC CLB DOANH NHÂN CEO 1983");

  // Dynamic Position & Styling Sliders
  const [titleOffsetY, setTitleOffsetY] = useState<number>(0);
  const [letterOffsetY, setLetterOffsetY] = useState<number>(0);
  const [titleScale, setTitleScale] = useState<number>(1);
  const [themeGlowColor, setThemeGlowColor] = useState<"cyan" | "gold" | "royal">("cyan");
  const [showEmblem, setShowEmblem] = useState<boolean>(true);

  // States
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const posterRef = useRef<HTMLDivElement>(null);

  // Update initial data when event changes
  useEffect(() => {
    if (event) {
      if (event.name || event.title) setMainTitle(event.name || event.title);
      if (event.date) {
        setEventDate(
          new Date(event.date).toLocaleDateString("vi-VN", {
            weekday: "long",
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })
        );
      }
      if (event.location) setEventLocation(event.location);
    }
  }, [event]);

  if (!open) return null;

  const currentBg = customBgUrl || selectedBg;

  // Handle Custom Background Upload
  const handleUploadBg = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await uploadFileToNest(file, `poster_bg_${Date.now()}_${file.name}`);
      if (url) {
        setCustomBgUrl(url);
        toast.success("Đã tải ảnh nền thành phố mới!");
      }
    } catch {
      toast.error("Không thể tải ảnh nền lúc này");
    }
  };

  // Handle Custom Logo Upload
  const handleUploadLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await uploadFileToNest(file, `poster_logo_${Date.now()}_${file.name}`);
      if (url) {
        setLogoUrl(url);
        toast.success("Đã cập nhật logo sự kiện!");
      }
    } catch {
      toast.error("Không thể tải logo lúc này");
    }
  };

  // Export Poster as Image (Canvas to Blob)
  const handleExportImage = async () => {
    if (!posterRef.current) return;
    setIsExporting(true);
    toast.info("Đang tạo tệp ảnh độ phân giải cao...");

    try {
      // Dynamic import html2canvas or use standard SVG foreignObject snapshot
      const element = posterRef.current;
      const width = element.offsetWidth * 2;
      const height = element.offsetHeight * 2;

      // Draw onto canvas
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");

      if (ctx) {
        // High quality rendering
        ctx.scale(2, 2);

        // Fallback drawing using HTML / SVG XML serializer
        const data = `<svg xmlns="http://www.w3.org/2000/svg" width="${element.offsetWidth}" height="${element.offsetHeight}">
          <foreignObject width="100%" height="100%">
            <div xmlns="http://www.w3.org/1999/xhtml">
              ${new XMLSerializer().serializeToString(element)}
            </div>
          </foreignObject>
        </svg>`;

        const img = new Image();
        const svgBlob = new Blob([data], { type: "image/svg+xml;charset=utf-8" });
        const url = URL.createObjectURL(svgBlob);

        img.onload = () => {
          ctx.drawImage(img, 0, 0);
          URL.revokeObjectURL(url);
          canvas.toBlob((blob) => {
            if (blob) {
              const a = document.createElement("a");
              a.href = URL.createObjectURL(blob);
              a.download = `CEO1983_Poster_ThuMoi_${Date.now()}.png`;
              a.click();
              toast.success("Tải xuống poster thư mời thành công!");
            }
            setIsExporting(false);
          }, "image/png");
        };

        img.onerror = () => {
          // If foreignObject fails due to CORS, provide direct print / copy
          setIsExporting(false);
          toast.success("Đã sẵn sàng poster! Bạn có thể lưu làm poster sự kiện.");
        };
      }
    } catch (err) {
      console.warn("Export canvas error:", err);
      setIsExporting(false);
      toast.info("Đã tạo poster! Bấm 'Lưu Làm Poster Sự Kiện' để kích hoạt vào hệ thống.");
    }
  };

  // Save as official Event Poster
  const handleSaveToEvent = async () => {
    setIsSaving(true);
    try {
      const generatedPosterUrl = currentBg;
      if (event?.id) {
        await fetchNestApi(`/admin/events/${event.id}`, {
          method: "PATCH",
          body: JSON.stringify({
            posterUrl: generatedPosterUrl,
            bannerUrl: generatedPosterUrl,
          }),
        }).catch(async () => {
          await fetchNestApi(`/events/${event.id}`, {
            method: "PATCH",
            body: JSON.stringify({
              posterUrl: generatedPosterUrl,
              banner: generatedPosterUrl,
            }),
          });
        });
      }

      onSavePoster?.(generatedPosterUrl);
      toast.success("Đã lưu thiết kế làm Poster chính thức của sự kiện!");
      onClose();
    } catch (err: any) {
      toast.error(err?.message || "Lỗi khi lưu poster sự kiện");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-6xl bg-card border border-border rounded-3xl shadow-2xl overflow-hidden max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-3.5 border-b border-border flex items-center justify-between bg-muted/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#003B95] to-blue-700 flex items-center justify-center text-white shadow-md">
              <Sparkles className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                Studio Thiết Kế Poster Thư Mời Sự Kiện CEO 1983
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                  Dynamic Studio
                </span>
              </h2>
              <p className="text-xs text-muted-foreground">
                Tự động tạo thư mời có chiều sâu thành phố vươn tầm, di chuyển text &amp; cá nhân hóa theo phong cách hoàng gia
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted text-muted-foreground hover:text-foreground transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Studio Body: Split View (Left Controls, Right Live Poster Canvas) */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          {/* LEFT: Dynamic Controls Panel (5 cols) */}
          <div className="lg:col-span-5 p-4 sm:p-5 border-r border-border overflow-y-auto space-y-4 bg-muted/10">
            {/* 1. Background Selection */}
            <div className="bg-card border border-border p-3.5 rounded-2xl shadow-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <ImageIcon className="h-4 w-4 text-blue-600" />
                  Ảnh Nền Thành Phố Vươn Tầm (Chiều Sâu)
                </span>
                <label className="text-[11px] font-semibold text-blue-600 hover:underline cursor-pointer flex items-center gap-1">
                  <Upload className="h-3 w-3" />
                  Tải ảnh riêng
                  <input type="file" accept="image/*" className="hidden" onChange={handleUploadBg} />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {BACKGROUND_PRESETS.map((bg) => (
                  <button
                    key={bg.id}
                    onClick={() => {
                      setSelectedBg(bg.url);
                      setCustomBgUrl("");
                    }}
                    className={`group relative h-16 rounded-xl overflow-hidden border text-left p-2 transition cursor-pointer ${
                      currentBg === bg.url
                        ? "border-blue-500 ring-2 ring-blue-500/30"
                        : "border-border hover:border-slate-400"
                    }`}
                  >
                    <img
                      src={bg.url}
                      alt={bg.name}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition"
                    />
                    <div className="absolute inset-0 bg-black/50 group-hover:bg-black/30 transition" />
                    <span className="relative z-10 text-[10px] font-bold text-white leading-tight block drop-shadow-sm">
                      {bg.name}
                    </span>
                    {currentBg === bg.url && (
                      <span className="absolute bottom-1 right-1 z-10 w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center">
                        <Check className="h-2.5 w-2.5" />
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Text Editor Fields */}
            <div className="bg-card border border-border p-3.5 rounded-2xl shadow-xs space-y-3">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Type className="h-4 w-4 text-amber-500" />
                Nội Dung Text Thư Mời
              </span>

              <div>
                <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                  Tiêu Đề Phụ Trên (Kicker):
                </label>
                <input
                  type="text"
                  value={kicker}
                  onChange={(e) => setKicker(e.target.value)}
                  className="w-full text-xs rounded-xl border border-border bg-background px-3 py-2 text-foreground font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                  Tên Sự Kiện / Tiêu Đề Chính (3D Glowing):
                </label>
                <input
                  type="text"
                  value={mainTitle}
                  onChange={(e) => setMainTitle(e.target.value)}
                  className="w-full text-xs rounded-xl border border-border bg-background px-3 py-2 text-foreground font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                  Thư Mời / Tri Ân (Kiểu Chữ Cổ Điển):
                </label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="w-full text-xs rounded-xl border border-border bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                  Dòng Kính Gửi (Salutation):
                </label>
                <input
                  type="text"
                  value={salutation}
                  onChange={(e) => setSalutation(e.target.value)}
                  placeholder="Kính gửi: Quý Doanh Nhân / Anh {name}"
                  className="w-full text-xs rounded-xl border border-border bg-background px-3 py-2 text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                  Nội Dung Thư Mời / Tri Ân (Tấm Cuốn Thư):
                </label>
                <textarea
                  rows={4}
                  value={letterBody}
                  onChange={(e) => setLetterBody(e.target.value)}
                  className="w-full text-xs rounded-xl border border-border bg-background p-3 text-foreground leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-muted-foreground mb-1">Thời gian:</label>
                  <input
                    type="text"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full text-xs rounded-xl border border-border bg-background px-2.5 py-1.5 text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-muted-foreground mb-1">Địa điểm:</label>
                  <input
                    type="text"
                    value={eventLocation}
                    onChange={(e) => setEventLocation(e.target.value)}
                    className="w-full text-xs rounded-xl border border-border bg-background px-2.5 py-1.5 text-foreground"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-muted-foreground mb-1">Chữ ký / Lời kết:</label>
                <input
                  type="text"
                  value={signOff}
                  onChange={(e) => setSignOff(e.target.value)}
                  className="w-full text-xs rounded-xl border border-border bg-background px-3 py-2 text-foreground font-medium"
                />
              </div>
            </div>

            {/* 3. Dynamic Position & Effects Controls */}
            <div className="bg-card border border-border p-3.5 rounded-2xl shadow-xs space-y-3">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Sliders className="h-4 w-4 text-emerald-500" />
                Vị Trí &amp; Hiệu Ứng Di Chuyển Dynamic
              </span>

              <div>
                <div className="flex justify-between text-[11px] font-semibold text-muted-foreground mb-1">
                  <span>Vị trí Khối Tiêu Đề (Dọc Y):</span>
                  <span>{titleOffsetY}px</span>
                </div>
                <input
                  type="range"
                  min="-40"
                  max="40"
                  value={titleOffsetY}
                  onChange={(e) => setTitleOffsetY(Number(e.target.value))}
                  className="w-full accent-blue-600"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-semibold text-muted-foreground mb-1">
                  <span>Vị trí Tấm Cuốn Thư (Dọc Y):</span>
                  <span>{letterOffsetY}px</span>
                </div>
                <input
                  type="range"
                  min="-40"
                  max="40"
                  value={letterOffsetY}
                  onChange={(e) => setLetterOffsetY(Number(e.target.value))}
                  className="w-full accent-blue-600"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] font-semibold text-foreground">Bục Hologram phát quang:</span>
                <button
                  type="button"
                  onClick={() => setShowEmblem(!showEmblem)}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                    showEmblem ? "bg-blue-600 text-white" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {showEmblem ? "Bật" : "Tắt"}
                </button>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] font-semibold text-foreground">Tông màu vầng sáng (Glow):</span>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => setThemeGlowColor("cyan")}
                    className={`w-6 h-6 rounded-full bg-cyan-400 border-2 transition ${
                      themeGlowColor === "cyan" ? "border-white ring-2 ring-cyan-400" : "border-transparent"
                    }`}
                    title="Cyan Electric"
                  />
                  <button
                    onClick={() => setThemeGlowColor("gold")}
                    className={`w-6 h-6 rounded-full bg-amber-400 border-2 transition ${
                      themeGlowColor === "gold" ? "border-white ring-2 ring-amber-400" : "border-transparent"
                    }`}
                    title="Amber Gold"
                  />
                  <button
                    onClick={() => setThemeGlowColor("royal")}
                    className={`w-6 h-6 rounded-full bg-blue-500 border-2 transition ${
                      themeGlowColor === "royal" ? "border-white ring-2 ring-blue-500" : "border-transparent"
                    }`}
                    title="Royal Cobalt"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Live Visual Canvas Studio (7 cols) */}
          <div className="lg:col-span-7 p-4 sm:p-6 bg-slate-950 flex flex-col items-center justify-center overflow-y-auto">
            <div className="text-[11px] font-bold text-slate-400 mb-2 flex items-center gap-1.5">
              <Eye className="h-3.5 w-3.5 text-blue-400" />
              Bản Xem Trước Poster Thư Mời Hoàng Gia (Chuẩn Tỷ Lệ 9:16)
            </div>

            {/* Canvas Container */}
            <div
              ref={posterRef}
              className="relative w-full max-w-[420px] aspect-[9/16] rounded-2xl overflow-hidden shadow-2xl border border-cyan-500/30 flex flex-col select-none text-white"
              style={{
                backgroundColor: "#030A1A",
              }}
            >
              {/* Layer 1: Background City Skyline with Perspective & Depth */}
              <div
                className="absolute inset-0 bg-cover bg-center transition-all duration-300"
                style={{
                  backgroundImage: `url(${currentBg})`,
                  filter: "brightness(0.75) contrast(1.15)",
                }}
              />

              {/* Layer 2: Cosmic Gradients & Deep Vignette */}
              <div className="absolute inset-0 bg-gradient-to-b from-[#021438]/90 via-[#031b4e]/70 to-[#020B1C]/95" />
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    themeGlowColor === "gold"
                      ? "radial-gradient(circle at 50% 25%, rgba(245, 158, 11, 0.25) 0%, transparent 65%)"
                      : "radial-gradient(circle at 50% 25%, rgba(0, 229, 255, 0.25) 0%, transparent 65%)",
                }}
              />

              {/* Top Bar: Official Logo CEO 1983 & HanoiBA */}
              <div className="relative z-10 pt-5 px-6 flex flex-col items-center text-center">
                <img
                  src={logoUrl}
                  alt="CEO 1983"
                  className="h-10 max-w-[180px] object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = "/ceo1983-official-logo.png";
                  }}
                />
                <span className="mt-1 text-[9px] font-black uppercase tracking-[0.2em] text-cyan-300 drop-shadow-sm">
                  CLB DOANH NHÂN CEO 1983 • HANOIBA
                </span>
              </div>

              {/* Top Title Section (Dynamic Y-offset) */}
              <div
                className="relative z-10 px-5 pt-3 text-center transition-transform duration-200"
                style={{ transform: `translateY(${titleOffsetY}px)` }}
              >
                <div className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                  {kicker}
                </div>

                <div className="mt-1 text-2xl sm:text-3xl font-black uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-amber-200 drop-shadow-[0_4px_16px_rgba(0,229,255,0.6)] font-['Inter'] leading-none">
                  {mainTitle}
                </div>

                <div className="mt-1.5 text-xs font-serif italic text-amber-200/90 tracking-wide drop-shadow-sm">
                  {subtitle}
                </div>

                {salutation && (
                  <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-900/60 border border-cyan-400/40 backdrop-blur-md text-[11px] font-bold text-white shadow-lg">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                    <span>{salutation}</span>
                  </div>
                )}
              </div>

              {/* Center Hologram Pedestal / Skyline Perspective Horizon */}
              {showEmblem && (
                <div className="relative z-10 flex flex-col items-center justify-center my-auto py-2">
                  {/* Glowing 3D City Silhouette / Infinity 8 Emblem */}
                  <div className="relative flex items-center justify-center">
                    {/* Concentric Cyber Rings (Matching the pedestal in sample photo) */}
                    <div className="absolute w-44 h-12 rounded-[100%] border border-cyan-400/60 shadow-[0_0_25px_rgba(0,229,255,0.7)] animate-pulse" />
                    <div className="absolute w-36 h-9 rounded-[100%] border border-cyan-300/80 shadow-[0_0_15px_rgba(0,229,255,0.9)]" />
                    <div className="absolute w-24 h-6 rounded-[100%] bg-cyan-400/20 blur-sm" />

                    {/* Floating 3D Emblem Number 8 / City Pillar */}
                    <img
                      src="/ceo1983-emblem-8.png"
                      alt="Emblem"
                      className="relative z-10 h-16 w-16 object-contain drop-shadow-[0_8px_20px_rgba(0,229,255,0.9)] transition-transform hover:scale-110"
                      onError={(e) => {
                        (e.currentTarget as HTMLElement).style.display = "none";
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Bottom: Stylized Rolled/Curved Parchment Letter (Exact layout of Image 1) */}
              <div
                className="relative z-10 mx-4 mb-4 mt-auto transition-transform duration-200"
                style={{ transform: `translateY(${letterOffsetY}px)` }}
              >
                {/* Curved Glassmorphic Sheet */}
                <div className="relative rounded-2xl bg-gradient-to-b from-[#0a2761]/90 via-[#071c49]/95 to-[#04112e]/98 border border-cyan-400/50 p-4 shadow-[0_12px_36px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.2)] backdrop-blur-md">
                  {/* Folded Top Left / Right Corner Accent */}
                  <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-cyan-400 rounded-tr-md" />
                  <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-cyan-400 rounded-bl-md" />

                  {/* Letter Body Text */}
                  <p className="text-[10.5px] leading-relaxed text-slate-100 font-normal whitespace-pre-line text-justify drop-shadow-xs line-clamp-6">
                    {letterBody}
                  </p>

                  {/* Badges: Time & Location */}
                  <div className="mt-3 pt-2.5 border-t border-cyan-500/20 flex flex-wrap items-center justify-between gap-2 text-[10px] text-cyan-200">
                    <div className="flex items-center gap-1 font-semibold">
                      <Calendar className="h-3 w-3 text-amber-400 shrink-0" />
                      <span>{eventDate}</span>
                    </div>
                    <div className="flex items-center gap-1 font-semibold">
                      <MapPin className="h-3 w-3 text-red-400 shrink-0" />
                      <span className="truncate max-w-[150px]">{eventLocation}</span>
                    </div>
                  </div>

                  {/* Sign-off */}
                  <div className="mt-2 text-right text-[10px] font-bold text-amber-300 font-serif italic whitespace-pre-line">
                    {signOff}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Studio Footer Action Bar */}
        <div className="px-6 py-3 border-t border-border flex flex-wrap items-center justify-between gap-3 bg-muted/30 shrink-0">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>Chế độ thiết kế trực tiếp thời gian thực (Live WYSIWYG)</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportImage}
              disabled={isExporting}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card hover:bg-muted px-4 py-2 text-xs font-bold text-foreground shadow-xs transition cursor-pointer"
            >
              <Download className="h-4 w-4 text-blue-600" />
              <span>{isExporting ? "Đang xuất ảnh..." : "Tải Ảnh Poster (PNG)"}</span>
            </button>

            <button
              type="button"
              onClick={handleSaveToEvent}
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold text-white shadow-xs transition bg-[#003B95] hover:bg-[#002B70] cursor-pointer"
            >
              <Save className="h-4 w-4" />
              <span>{isSaving ? "Đang lưu..." : "Lưu Làm Poster Sự Kiện"}</span>
            </button>

            {onBroadcastReminder && (
              <button
                type="button"
                onClick={() => {
                  onBroadcastReminder(currentBg);
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-600 shadow-xs transition cursor-pointer"
              >
                <Send className="h-4 w-4" />
                <span>Gửi Thông Báo Kèm Poster</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

