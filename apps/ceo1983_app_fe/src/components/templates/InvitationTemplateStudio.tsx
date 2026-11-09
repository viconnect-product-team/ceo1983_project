import React, { useState, useEffect, useRef } from "react";
import {
  Upload,
  Sparkles,
  Download,
  Save,
  Send,
  Eye,
  Calendar,
  MapPin,
  QrCode,
  Layers,
  Image as ImageIcon,
  Palette,
  RotateCcw,
  Check,
  Plus,
  Trash2,
  Copy,
  Clock,
  ExternalLink,
  ChevronRight,
  Bookmark,
} from "lucide-react";
import { toast } from "sonner";
import { fetchNestApi, uploadFileToNest } from "@/lib/api-client";
import { OmnichannelBroadcastModal } from "./OmnichannelBroadcastModal";

export interface InvitationTemplate {
  id: string;
  code?: string;
  name: string;
  category?: string;
  kicker: string;
  title: string;
  subtitle?: string;
  salutation: string;
  bodyText: string;
  date?: string;
  time?: string;
  location?: string;
  signOff?: string;
  bgUrl?: string;
  logoUrl?: string;
  themeGlowColor?: "gold" | "cyan" | "royal";
  showEmblem?: boolean;
  qrValue?: string;
  posterUrl?: string;
  updatedAt?: string;
}

export function InvitationTemplateStudio() {
  // Preset VIP Backgrounds
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

  // Mode: 1. Tải poster có sẵn HOẶC 2. Tự thiết kế cấu hình poster
  const [posterMode, setPosterMode] = useState<"upload" | "studio">("studio");
  const [uploadedPosterUrl, setUploadedPosterUrl] = useState<string>("");
  const [isUploadingPoster, setIsUploadingPoster] = useState<boolean>(false);

  // Studio Fields
  const [selectedBg, setSelectedBg] = useState<string>("/ceo1983_hero_cosmos_skyline.jpg");
  const [customBgUrl, setCustomBgUrl] = useState<string>("");
  const [logoUrl, setLogoUrl] = useState<string>("/ceo1983-official-logo.png");

  const [kicker, setKicker] = useState<string>("CHÀO MỪNG ĐẠI HỘI DOANH NHÂN");
  const [mainTitle, setMainTitle] = useState<string>("ĐẠI HỘI DOANH NHÂN CEO 1983 (HANOIBA)");
  const [subtitle, setSubtitle] = useState<string>("Thư Tri Ân & Thư Mời Đại Biểu Danh Dự");
  const [salutation, setSalutation] = useState<string>("Kính gửi: Quý Doanh Nhân & Đại Biểu Danh Dự");
  const [letterBody, setLetterBody] = useState<string>(
    `Nhân dịp sự kiện trọng đại của CLB Doanh Nhân CEO 1983 (HanoiBA), Ban Tổ Chức xin trân trọng gửi lời tri ân sâu sắc đến Quý Anh/Chị Hội viên và Quý Đối tác đã luôn đồng hành, cống hiến vì sự phát triển bền vững của cộng đồng doanh nhân.\n\nTrải qua hành trình gắn kết và bứt phá, mỗi thành viên chính là hạt nhân lan tỏa tinh thần tiên phong, sáng tạo và bản lĩnh thương trường. Chúng tôi tin tưởng rằng sự hiện diện của Quý Anh/Chị sẽ góp phần tạo nên một dấu ấn kết nối giao thương B2B đỉnh cao và thắt chặt tình bằng hữu doanh nhân 1983.\n\nKính chúc Quý Anh/Chị dồi dào sức khỏe, thành công rực rỡ và luôn giữ vững ngọn lửa nhiệt huyết tiên phong!`
  );
  const [eventDate, setEventDate] = useState<string>("20:00 - Thứ Bảy, 20/11/2026");
  const [eventTime, setEventTime] = useState<string>("20:00");
  const [eventLocation, setEventLocation] = useState<string>(
    "Trung tâm Hội nghị Quốc gia, Mễ Trì, Nam Từ Liêm, Hà Nội"
  );
  const [signOff, setSignOff] = useState<string>(
    "Trân trọng,\nBAN TỔ CHỨC CLB DOANH NHÂN CEO 1983"
  );
  const [qrValue, setQrValue] = useState<string>(
    "https://ceo1983.viconnect.vn/association/events"
  );
  const [themeGlowColor, setThemeGlowColor] = useState<"gold" | "cyan" | "royal">("gold");
  const [showEmblem, setShowEmblem] = useState<boolean>(true);

  // Templates Management State
  const [templates, setTemplates] = useState<InvitationTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>("tmpl-inv-gala");
  const [templateNameInput, setTemplateNameInput] = useState<string>("");
  const [isLoadingTemplates, setIsLoadingTemplates] = useState<boolean>(false);
  const [isSavingTemplate, setIsSavingTemplate] = useState<boolean>(false);

  // Available events to auto-fill
  const [availableEvents, setAvailableEvents] = useState<any[]>([]);

  // Omnichannel Broadcast Modal State
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState<boolean>(false);

  const posterRef = useRef<HTMLDivElement>(null);

  // Fetch templates & events on mount
  useEffect(() => {
    fetchTemplates();
    fetchUpcomingEvents();
  }, []);

  const fetchTemplates = async () => {
    setIsLoadingTemplates(true);
    try {
      const data = await fetchNestApi<InvitationTemplate[]>("/admin/invitation-templates");
      if (Array.isArray(data) && data.length > 0) {
        setTemplates(data);
      }
    } catch (e: any) {
      console.warn("fetchTemplates warn:", e?.message);
    } finally {
      setIsLoadingTemplates(false);
    }
  };

  const fetchUpcomingEvents = async () => {
    try {
      const events = await fetchNestApi<any[]>("/events").catch(() => []);
      if (Array.isArray(events)) {
        setAvailableEvents(events.slice(0, 10));
      }
    } catch {}
  };

  // Select a saved template
  const handleSelectTemplate = (tmpl: InvitationTemplate) => {
    setSelectedTemplateId(tmpl.id);
    setMainTitle(tmpl.title || "");
    setSubtitle(tmpl.subtitle || "");
    setKicker(tmpl.kicker || "");
    setSalutation(tmpl.salutation || "");
    setLetterBody(tmpl.bodyText || "");
    setEventDate(tmpl.date || "");
    setEventTime(tmpl.time || "");
    setEventLocation(tmpl.location || "");
    setSignOff(tmpl.signOff || "");
    if (tmpl.bgUrl) setSelectedBg(tmpl.bgUrl);
    if (tmpl.logoUrl) setLogoUrl(tmpl.logoUrl);
    if (tmpl.themeGlowColor) setThemeGlowColor(tmpl.themeGlowColor);
    if (tmpl.posterUrl) {
      setUploadedPosterUrl(tmpl.posterUrl);
      setPosterMode("upload");
    } else {
      setPosterMode("studio");
    }
    toast.success(`Đã nạp mẫu thư mời: "${tmpl.name}"`);
  };

  // Auto-fill from an existing event
  const handleSelectEvent = (event: any) => {
    if (!event) return;
    setMainTitle(event.name || event.title || mainTitle);
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
    if (event.poster_url || event.image_url) {
      setUploadedPosterUrl(event.poster_url || event.image_url);
    }
    setQrValue(`https://ceo1983.viconnect.vn/association/events`);
    toast.info(`Đã nạp thông tin từ sự kiện: ${event.name || event.title}`);
  };

  // Upload an existing poster file
  const handleUploadPosterFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingPoster(true);
    try {
      const url = await uploadFileToNest(file, `invitation_poster_${Date.now()}_${file.name}`);
      if (url) {
        setUploadedPosterUrl(url);
        setPosterMode("upload");
        toast.success("Tải poster thư mời có sẵn thành công!");
      }
    } catch {
      toast.error("Không thể tải tệp poster lên máy chủ");
    } finally {
      setIsUploadingPoster(false);
    }
  };

  // Upload custom background for studio
  const handleUploadBgFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await uploadFileToNest(file, `poster_bg_${Date.now()}_${file.name}`);
      if (url) {
        setCustomBgUrl(url);
        toast.success("Đã tải ảnh nền thành phố tùy chỉnh!");
      }
    } catch {
      toast.error("Không thể tải ảnh nền lúc này");
    }
  };

  // Save current configuration as a template
  const handleSaveAsTemplate = async () => {
    const name = templateNameInput.trim() || `Mẫu Thư Mời - ${new Date().toLocaleDateString("vi-VN")}`;
    setIsSavingTemplate(true);
    try {
      const newTemplate: InvitationTemplate = {
        id: `tmpl-inv-${Date.now()}`,
        name,
        category: "event",
        kicker,
        title: mainTitle,
        subtitle,
        salutation,
        bodyText: letterBody,
        date: eventDate,
        time: eventTime,
        location: eventLocation,
        signOff,
        bgUrl: customBgUrl || selectedBg,
        logoUrl,
        themeGlowColor,
        showEmblem,
        qrValue,
        posterUrl: posterMode === "upload" ? uploadedPosterUrl : undefined,
        updatedAt: new Date().toISOString(),
      };

      const updated = [newTemplate, ...templates.filter((t) => t.id !== newTemplate.id)];
      await fetchNestApi("/admin/invitation-templates", {
        method: "POST",
        body: JSON.stringify({ templates: updated }),
      });

      setTemplates(updated);
      setSelectedTemplateId(newTemplate.id);
      setTemplateNameInput("");
      toast.success(`Đã lưu "${name}" vào kho mẫu thư mời thành công!`);
    } catch (err: any) {
      toast.error(err?.message || "Lỗi khi lưu mẫu thư mời");
    } finally {
      setIsSavingTemplate(false);
    }
  };

  // Delete a saved template
  const handleDeleteTemplate = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Bạn có chắc chắn muốn xóa mẫu thư mời này không?")) return;
    try {
      const updated = templates.filter((t) => t.id !== id);
      await fetchNestApi("/admin/invitation-templates", {
        method: "POST",
        body: JSON.stringify({ templates: updated }),
      });
      setTemplates(updated);
      if (selectedTemplateId === id) setSelectedTemplateId(updated[0]?.id || null);
      toast.success("Đã xóa mẫu thư mời");
    } catch {
      toast.error("Lỗi khi xóa mẫu thư mời");
    }
  };

  // Current active poster background
  const activeBg = customBgUrl || selectedBg;

  // Active poster URL to dispatch (either uploaded file or preview)
  const currentPosterForBroadcast =
    posterMode === "upload" && uploadedPosterUrl
      ? uploadedPosterUrl
      : activeBg;

  return (
    <div className="space-y-6">
      {/* HEADER BANNER */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300">
              <Sparkles className="size-3.5 text-amber-500" />
              <span>Quản Lý Thư Mời &amp; Studio Poster CEO 1983</span>
            </div>
            <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Quản Lý Mẫu Thư Mời &amp; Phát Thư Mời Đa Kênh
            </h3>
            <p className="max-w-3xl text-xs text-slate-500 dark:text-slate-400">
              Hỗ trợ 2 phương thức: (1) Tải ảnh poster thư mời có sẵn của bạn, hoặc (2) Tự cấu hình thiết kế poster thư mời trực quan theo chuẩn thương hiệu CEO 1983. Khi bấm <strong>"Áp dụng và gửi"</strong>, bạn có thể tích chọn gửi đồng thời tới <strong>App Mobile, Zalo OA và Email</strong>.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setIsBroadcastModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-amber-500 via-amber-600 to-amber-700 px-4 py-2.5 text-xs font-bold text-slate-950 shadow-md shadow-amber-500/20 hover:brightness-110 transition cursor-pointer"
            >
              <Send className="size-4" />
              <span>Áp Dụng &amp; Gửi Thư Mời</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2 LỰA CHỌN PHƯƠNG THỨC TẠO POSTER THƯ MỜI */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* LỰA CHỌN 1: TẢI POSTER CÓ SẴN */}
        <div
          onClick={() => setPosterMode("upload")}
          className={`p-5 rounded-2xl border transition cursor-pointer flex items-start gap-4 ${
            posterMode === "upload"
              ? "border-amber-500 bg-amber-50/50 dark:bg-amber-950/20 ring-2 ring-amber-500/30"
              : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900"
          }`}
        >
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
            <Upload className="size-6" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                1. Tải Poster Mời Có Sẵn
              </h4>
              {posterMode === "upload" && (
                <span className="flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400">
                  <Check className="size-3.5" /> Đang chọn
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Bạn đã có sẵn file ảnh poster do designer thiết kế? Tải lên trực tiếp định dạng JPG, PNG để làm thư mời.
            </p>
          </div>
        </div>

        {/* LỰA CHỌN 2: TỰ CẤU HÌNH THIẾT KẾ POSTER TRỰC QUAN */}
        <div
          onClick={() => setPosterMode("studio")}
          className={`p-5 rounded-2xl border transition cursor-pointer flex items-start gap-4 ${
            posterMode === "studio"
              ? "border-amber-500 bg-amber-50/50 dark:bg-amber-950/20 ring-2 ring-amber-500/30"
              : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900"
          }`}
        >
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0">
            <Sparkles className="size-6" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                2. Tự Cấu Hình Thiết Kế Poster Thư Mời
              </h4>
              {posterMode === "studio" && (
                <span className="flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400">
                  <Check className="size-3.5" /> Đang chọn
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Tùy biến khung nền thành phố, logo, tiêu đề, thời gian, địa điểm, mã QR check-in thành 1 mẫu thư mời chuẩn.
            </p>
          </div>
        </div>
      </div>

      {/* MAIN STUDIO WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* CỘT TRÁI: BẢNG ĐIỀU KHIỂN & CẤU HÌNH (7 CỘT) */}
        <div className="lg:col-span-7 space-y-6">
          {/* LIÊN KẾT NHANH SỰ KIỆN / CUỘC HỌP */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Calendar className="size-4 text-amber-500" />
                <span>Nạp nhanh từ Sự kiện / Cuộc họp có sẵn</span>
              </label>
              <span className="text-[11px] text-slate-400">Tự động điền tiêu đề &amp; thời gian</span>
            </div>
            <select
              onChange={(e) => {
                const found = availableEvents.find((ev) => ev.id === e.target.value);
                if (found) handleSelectEvent(found);
              }}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100 focus:ring-2 focus:ring-amber-500"
            >
              <option value="">-- Chọn sự kiện hoặc cuộc họp để điền nhanh --</option>
              {availableEvents.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.name || ev.title} ({ev.date ? new Date(ev.date).toLocaleDateString("vi-VN") : "Sắp tới"})
                </option>
              ))}
            </select>
          </div>

          {/* PHƯƠNG THỨC 1: TẢI POSTER CÓ SẴN */}
          {posterMode === "upload" && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Upload className="size-4 text-amber-500" />
                <span>Tải tệp ảnh Poster có sẵn từ máy tính</span>
              </h4>

              <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-8 text-center bg-slate-50 dark:bg-slate-950/50 hover:border-amber-500 transition">
                <input
                  type="file"
                  id="poster-upload-input"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleUploadPosterFile}
                  className="hidden"
                />
                <label
                  htmlFor="poster-upload-input"
                  className="flex flex-col items-center justify-center cursor-pointer"
                >
                  <div className="p-3 rounded-full bg-amber-500/10 text-amber-500 mb-3">
                    <ImageIcon className="size-8" />
                  </div>
                  <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {isUploadingPoster ? "Đang tải ảnh poster lên..." : "Click để chọn file ảnh Poster"}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Định dạng hỗ trợ: JPG, PNG, WEBP (Khuyến nghị tỷ lệ đứng 4:5 hoặc 9:16)
                  </span>
                </label>
              </div>

              {uploadedPosterUrl && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300">
                  <span className="flex items-center gap-2 font-medium">
                    <Check className="size-4" /> Poster đã tải lên sẵn sàng sử dụng
                  </span>
                  <a
                    href={uploadedPosterUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold underline flex items-center gap-1"
                  >
                    Xem ảnh gốc <ExternalLink className="size-3" />
                  </a>
                </div>
              )}
            </div>
          )}

          {/* PHƯƠNG THỨC 2: TỰ CẤU HÌNH THIẾT KẾ POSTER TRỰC QUAN */}
          {posterMode === "studio" && (
            <div className="space-y-6">
              {/* CHỌN HÌNH NỀN & THEME */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Palette className="size-4 text-amber-500" />
                    <span>Mẫu Nền Thành Phố VIP &amp; Tone Màu Thương Hiệu</span>
                  </h4>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {BACKGROUND_PRESETS.map((preset) => (
                    <div
                      key={preset.id}
                      onClick={() => {
                        setSelectedBg(preset.url);
                        setCustomBgUrl("");
                      }}
                      className={`group relative h-20 rounded-xl overflow-hidden border-2 transition cursor-pointer ${
                        selectedBg === preset.url && !customBgUrl
                          ? "border-amber-500 ring-2 ring-amber-500/40"
                          : "border-slate-200 dark:border-slate-800 hover:border-slate-400"
                      }`}
                    >
                      <img
                        src={preset.url}
                        alt={preset.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition"
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent p-2 flex items-end">
                        <span className="text-[10px] font-semibold text-white truncate">
                          {preset.name}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Upload Custom BG */}
                <div className="flex items-center gap-3 pt-2">
                  <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer">
                    <Upload className="size-3.5" />
                    <span>Tải ảnh nền riêng</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleUploadBgFile}
                      className="hidden"
                    />
                  </label>

                  {/* Theme Glow Select */}
                  <div className="flex items-center gap-2 ml-auto">
                    <span className="text-xs text-slate-400">Hiệu ứng:</span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setThemeGlowColor("gold")}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition cursor-pointer ${
                          themeGlowColor === "gold"
                            ? "bg-amber-500 text-slate-950"
                            : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                        }`}
                      >
                        Vàng Gold
                      </button>
                      <button
                        type="button"
                        onClick={() => setThemeGlowColor("cyan")}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition cursor-pointer ${
                          themeGlowColor === "cyan"
                            ? "bg-cyan-500 text-slate-950"
                            : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                        }`}
                      >
                        Xanh Cyan
                      </button>
                      <button
                        type="button"
                        onClick={() => setThemeGlowColor("royal")}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition cursor-pointer ${
                          themeGlowColor === "royal"
                            ? "bg-indigo-600 text-white"
                            : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                        }`}
                      >
                        Dạ Hội
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* NỘI DUNG VĂN BẢN THƯ MỜI */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Nội Dung Chi Tiết Thư Mời
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                      Kicker (Dòng tiêu đề phụ trên cùng)
                    </label>
                    <input
                      type="text"
                      value={kicker}
                      onChange={(e) => setKicker(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-900 dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                      Phụ đề sự kiện
                    </label>
                    <input
                      type="text"
                      value={subtitle}
                      onChange={(e) => setSubtitle(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-900 dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                    Tiêu đề chính sự kiện (Tên in hoa đậm)
                  </label>
                  <input
                    type="text"
                    value={mainTitle}
                    onChange={(e) => setMainTitle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-bold text-slate-900 dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                    Kính gửi
                  </label>
                  <input
                    type="text"
                    value={salutation}
                    onChange={(e) => setSalutation(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-900 dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                    Thư mời tri ân (Nội dung chính)
                  </label>
                  <textarea
                    rows={4}
                    value={letterBody}
                    onChange={(e) => setLetterBody(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-900 dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100 leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1 flex items-center gap-1">
                      <Calendar className="size-3 text-amber-500" /> Thời gian diễn ra
                    </label>
                    <input
                      type="text"
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-900 dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1 flex items-center gap-1">
                      <MapPin className="size-3 text-rose-500" /> Địa điểm tổ chức
                    </label>
                    <input
                      type="text"
                      value={eventLocation}
                      onChange={(e) => setEventLocation(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-900 dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                      Đại diện ký tên (Ban Tổ Chức)
                    </label>
                    <input
                      type="text"
                      value={signOff}
                      onChange={(e) => setSignOff(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-900 dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1 flex items-center gap-1">
                      <QrCode className="size-3 text-blue-500" /> Link mã QR Check-in
                    </label>
                    <input
                      type="text"
                      value={qrValue}
                      onChange={(e) => setQrValue(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-900 dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* LƯU THÀNH MẪU TEMPLATE THƯ MỜI SẴN */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Bookmark className="size-4 text-amber-500" />
              <span>Lưu thành Mẫu Template Thư Mời sẵn</span>
            </h4>
            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="Nhập tên mẫu template (VD: Mẫu Thư Mời Gala Tất Niên 2026)"
                value={templateNameInput}
                onChange={(e) => setTemplateNameInput(e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100"
              />
              <button
                type="button"
                disabled={isSavingTemplate}
                onClick={handleSaveAsTemplate}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950 text-xs font-bold hover:opacity-90 transition cursor-pointer shrink-0"
              >
                <Save className="size-3.5" />
                <span>{isSavingTemplate ? "Đang lưu..." : "Lưu Template Mẫu"}</span>
              </button>
            </div>
          </div>

          {/* DANH SÁCH CÁC TEMPLATE THƯ MỜI ĐÃ LƯU */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Kho Mẫu Template Thư Mời ({templates.length})
              </h4>
              <span className="text-[11px] text-slate-400">Click để nạp nhanh vào trình tạo</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {templates.map((tmpl) => (
                <div
                  key={tmpl.id}
                  onClick={() => handleSelectTemplate(tmpl)}
                  className={`p-3.5 rounded-xl border transition cursor-pointer text-left ${
                    selectedTemplateId === tmpl.id
                      ? "border-amber-500 bg-amber-50/50 dark:bg-amber-950/20 ring-1 ring-amber-500/30"
                      : "border-slate-200 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-950/40 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100 line-clamp-1">
                      {tmpl.name}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteTemplate(tmpl.id, e)}
                      title="Xóa mẫu"
                      className="text-slate-400 hover:text-rose-500 transition p-0.5"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {tmpl.title}
                  </p>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200 dark:border-slate-800/80 text-[10px] text-slate-400">
                    <span>{tmpl.category === "meeting" ? "Cuộc họp" : "Sự kiện lớn"}</span>
                    <span className="font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-0.5">
                      Sử dụng <ChevronRight className="size-3" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CỘT PHẢI: LIVE PREVIEW POSTER THƯ MỜI CHUẨN VIP (5 CỘT) */}
        <div className="lg:col-span-5 sticky top-6 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Eye className="size-4 text-amber-500" />
              <span>Xem Trước Poster Thư Mời Trực Tiếp</span>
            </h4>
            <span className="text-[11px] text-slate-400">Tỷ lệ poster thực tế</span>
          </div>

          {/* POSTER CARD (LIVE CANVAS / VIEW) */}
          <div
            ref={posterRef}
            className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl border border-amber-500/30 bg-slate-950 flex flex-col justify-between text-white p-6 select-none"
            style={{
              backgroundImage:
                posterMode === "upload" && uploadedPosterUrl
                  ? `url(${uploadedPosterUrl})`
                  : `linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.85) 100%), url(${activeBg})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            {/* If Mode is Upload, only show overlay and action if needed */}
            {posterMode === "upload" && uploadedPosterUrl ? (
              <div className="h-full flex flex-col justify-end p-2 bg-linear-to-t from-black/80 via-transparent to-transparent">
                <div className="p-3 rounded-xl bg-black/60 backdrop-blur-md border border-white/10">
                  <div className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">
                    Poster Sẵn Có
                  </div>
                  <h3 className="text-sm font-bold text-white truncate mt-0.5">
                    {mainTitle}
                  </h3>
                  <div className="text-[11px] text-slate-300 mt-1 flex items-center gap-2">
                    <span>📅 {eventDate}</span>
                  </div>
                </div>
              </div>
            ) : (
              /* Studio Mode Layout */
              <>
                {/* Poster Header */}
                <div className="space-y-2 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <img
                      src={logoUrl}
                      alt="Logo"
                      className="h-10 object-contain drop-shadow-md"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = "/app-icon.png";
                      }}
                    />
                  </div>
                  <div className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-amber-400 drop-shadow-sm">
                    {kicker}
                  </div>
                  <h2
                    className={`text-base font-black uppercase tracking-tight leading-snug drop-shadow-lg ${
                      themeGlowColor === "gold"
                        ? "text-transparent bg-clip-text bg-linear-to-r from-amber-200 via-yellow-300 to-amber-500"
                        : themeGlowColor === "cyan"
                        ? "text-cyan-300"
                        : "text-amber-100"
                    }`}
                  >
                    {mainTitle}
                  </h2>
                  <div className="text-[11px] font-semibold text-slate-300 drop-shadow-sm">
                    {subtitle}
                  </div>
                </div>

                {/* Poster Middle: Letter Salutation & Body */}
                <div className="my-auto p-4 rounded-xl bg-black/50 backdrop-blur-md border border-white/10 space-y-2 text-left shadow-lg">
                  <div className="text-[11px] font-bold text-amber-300">
                    {salutation}
                  </div>
                  <p className="text-[10px] text-slate-200 line-clamp-4 leading-relaxed whitespace-pre-line font-light">
                    {letterBody}
                  </p>
                </div>

                {/* Poster Footer: Info & QR */}
                <div className="space-y-3 pt-2">
                  <div className="p-2.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-between gap-3 text-left">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-300">
                        <Calendar className="size-3 text-amber-400 shrink-0" />
                        <span className="truncate">{eventDate}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-300">
                        <MapPin className="size-3 text-rose-400 shrink-0" />
                        <span className="truncate">{eventLocation}</span>
                      </div>
                    </div>

                    {/* QR Code */}
                    <div className="p-1 rounded bg-white shrink-0 shadow-sm">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=64x64&data=${encodeURIComponent(
                          qrValue
                        )}`}
                        alt="QR Check-in"
                        className="size-11 object-contain"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[9px] text-slate-400">
                    <span className="uppercase font-semibold tracking-wider text-amber-400">
                      CLB Doanh Nhân CEO 1983
                    </span>
                    <span>Quét mã xác nhận tham dự</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsBroadcastModalOpen(true)}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-linear-to-r from-amber-500 via-amber-600 to-amber-700 py-3 text-xs font-bold text-slate-950 shadow-md shadow-amber-500/20 hover:brightness-110 transition cursor-pointer"
            >
              <Send className="size-4" />
              <span>Áp Dụng &amp; Gửi Ngay</span>
            </button>
          </div>
        </div>
      </div>

      {/* OMNICHANNEL BROADCAST MODAL */}
      <OmnichannelBroadcastModal
        open={isBroadcastModalOpen}
        onClose={() => setIsBroadcastModalOpen(false)}
        invitationData={{
          title: mainTitle,
          subtitle,
          posterUrl: currentPosterForBroadcast,
          date: eventDate,
          time: eventTime,
          location: eventLocation,
          salutation,
          bodyText: letterBody,
          templateId: selectedTemplateId || undefined,
        }}
        onSuccess={() => {
          setIsBroadcastModalOpen(false);
        }}
      />
    </div>
  );
}

