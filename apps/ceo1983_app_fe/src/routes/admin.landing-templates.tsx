import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Palette,
  Check,
  Eye,
  Sparkles,
  Calendar,
  Layers,
  Zap,
  RotateCcw,
  CheckCircle2,
  X,
  Flag,
  Moon,
  Gift,
  Award,
  Sun,
  Smartphone,
  Sliders,
  Save,
  CheckSquare,
  Wand2,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/dashboard/AppShell";
import { PageHeader } from "@/components/dashboard/PageKit";
import {
  setActiveEventThemeType,
  getActiveEventThemeType,
  getEffectiveThemeOption,
  getCustomThemeConfig,
  saveCustomThemeConfig,
  FESTIVAL_THEMES,
  type FestivalThemeOption,
  type LayoutGridCols,
  type BorderRadiusStyle,
  type IconStyleType,
  type EffectType,
  type EventThemeType,
} from "@/components/member/SeasonalEventHeader";
import { fetchNestApi } from "@/lib/api-client";

export const Route = createFileRoute("/admin/landing-templates")({
  component: AdminThemeManagementPage,
});

export const THEME_CHANGE_EVENT = "ceo1983-theme-changed";

export function getActiveAppThemeId(): string {
  if (typeof window === "undefined") return "default";
  try {
    return localStorage.getItem("ceo1983_active_theme") || "default";
  } catch {
    return "default";
  }
}

export function setActiveAppThemeId(id: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("ceo1983_active_theme", id);
    localStorage.setItem("vba_app_theme", id);
    window.dispatchEvent(new CustomEvent(THEME_CHANGE_EVENT, { detail: id }));
  } catch {
    /* ignore */
  }
}

const PRESET_PRIMARY_COLORS = [
  { name: "Navy Hoàng Gia", value: "#001B54" },
  { name: "Xanh Sapphire", value: "#003B95" },
  { name: "Tím Đêm", value: "#312E81" },
  { name: "Đỏ Quốc Kỳ", value: "#DC2626" },
  { name: "Đỏ Rượu Vang", value: "#991B1B" },
  { name: "Xanh Noel", value: "#065F46" },
  { name: "Đỏ May Mắn", value: "#B91C1C" },
  { name: "Hổ Phách Doanh Nhân", value: "#B45309" },
];

const PRESET_ACCENT_COLORS = [
  { name: "Vàng Champagne", value: "#D4AF37" },
  { name: "Vàng Kim Rực Rỡ", value: "#F59E0B" },
  { name: "Vàng Sao Vàng", value: "#EAB308" },
  { name: "Đỏ Noel", value: "#EF4444" },
  { name: "Vàng Đào Tết", value: "#FBBF24" },
  { name: "Xanh Cyan Tươi", value: "#38BDF8" },
  { name: "Ngọc Lục Bảo", value: "#10B981" },
];

const ICON_PRESET_SETS: Record<string, Record<string, string>> = {
  "3d-festival": {
    card: "💳",
    members: "👥",
    checkin: "⚡",
    perks: "👑",
    voting: "🗳️",
    history: "📜",
    library: "📁",
    fees: "💎",
  },
  "mid-autumn": {
    card: "🥮",
    members: "🏮",
    checkin: "🌕",
    perks: "🐇",
    voting: "🪔",
    history: "📜",
    library: "📚",
    fees: "💰",
  },
  tet: {
    card: "🧧",
    members: "🌸",
    checkin: "🎆",
    perks: "💰",
    voting: "🗳️",
    history: "📜",
    library: "📁",
    fees: "🪙",
  },
  christmas: {
    card: "🎁",
    members: "🎅",
    checkin: "❄️",
    perks: "🎄",
    voting: "🔔",
    history: "📜",
    library: "📁",
    fees: "💰",
  },
  national: {
    card: "⭐",
    members: "🇻🇳",
    checkin: "🎖️",
    perks: "🦅",
    voting: "🗳️",
    history: "🏛️",
    library: "📜",
    fees: "💎",
  },
};

export function AdminThemeManagementPage() {
  const [activeTab, setActiveTab] = useState<"catalog" | "studio">("catalog");
  const [activeThemeId, setActiveThemeIdState] = useState<string>("default");
  const [previewingTheme, setPreviewingTheme] = useState<FestivalThemeOption | null>(null);

  // Customizer state
  const [customName, setCustomName] = useState("Chủ Đề Tùy Chỉnh Doanh Nghiệp");
  const [customTagline, setCustomTagline] = useState("Thiết kế riêng theo phong cách & nhận diện CLB");
  const [customBadge, setCustomBadge] = useState("🎨 Tùy Biến");
  const [customPrimaryColor, setCustomPrimaryColor] = useState("#003B95");
  const [customAccentColor, setCustomAccentColor] = useState("#D4AF37");
  const [customLayoutGrid, setCustomLayoutGrid] = useState<LayoutGridCols>("4");
  const [customBorderRadius, setCustomBorderRadius] = useState<BorderRadiusStyle>("rounded-2xl");
  const [customIconStyle, setCustomIconStyle] = useState<IconStyleType>("3d-emoji");
  const [customEffectType, setCustomEffectType] = useState<EffectType>("sparkles");
  const [customIcons, setCustomIcons] = useState<Record<string, string>>({
    card: "💳",
    members: "👥",
    checkin: "⚡",
    perks: "👑",
    voting: "🗳️",
    history: "📜",
    library: "📁",
    fees: "💎",
  });

  useEffect(() => {
    const current = getActiveAppThemeId();
    setActiveThemeIdState(current);

    const savedConfig = getCustomThemeConfig();
    if (savedConfig) {
      if (savedConfig.name) setCustomName(savedConfig.name);
      if (savedConfig.tagline) setCustomTagline(savedConfig.tagline);
      if (savedConfig.badge) setCustomBadge(savedConfig.badge);
      if (savedConfig.primaryColor) setCustomPrimaryColor(savedConfig.primaryColor);
      if (savedConfig.accentColor) setCustomAccentColor(savedConfig.accentColor);
      if (savedConfig.layoutGrid) setCustomLayoutGrid(savedConfig.layoutGrid);
      if (savedConfig.borderRadius) setCustomBorderRadius(savedConfig.borderRadius);
      if (savedConfig.iconStyle) setCustomIconStyle(savedConfig.iconStyle);
      if (savedConfig.effectType) setCustomEffectType(savedConfig.effectType);
      if (savedConfig.actionIcons) {
        setCustomIcons((prev) => ({ ...prev, ...savedConfig.actionIcons }));
      }
    }

    void fetchNestApi<{ themeId: string; enabled: boolean; customConfig?: any }>("/admin/active-theme")
      .then((res) => {
        if (res?.themeId) {
          const crmId = res.themeId === "christmas" ? "noel" : res.themeId === "classic" ? "default" : res.themeId;
          setActiveThemeIdState(crmId);
          setActiveAppThemeId(crmId);
          if (res.customConfig) {
            saveCustomThemeConfig(res.customConfig);
          }
        }
      })
      .catch(() => {});

    const handleThemeChange = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      if (customEvent.detail) {
        setActiveThemeIdState(customEvent.detail);
      } else {
        setActiveThemeIdState(getActiveAppThemeId());
      }
    };

    window.addEventListener(THEME_CHANGE_EVENT, handleThemeChange);
    window.addEventListener("storage", handleThemeChange);

    return () => {
      window.removeEventListener(THEME_CHANGE_EVENT, handleThemeChange);
      window.removeEventListener("storage", handleThemeChange);
    };
  }, []);

  const handleApplyPresetTheme = async (theme: FestivalThemeOption) => {
    const targetType = theme.id;
    const crmId = theme.id === "christmas" ? "noel" : theme.id === "classic" ? "default" : theme.id;

    setActiveEventThemeType(targetType);
    setActiveAppThemeId(crmId);
    setActiveThemeIdState(crmId);

    try {
      await fetchNestApi("/admin/active-theme", {
        method: "PUT",
        body: JSON.stringify({ themeId: targetType, enabled: true }),
      });
    } catch (e: any) {
      console.warn("Could not save active theme to backend:", e);
    }

    toast.success(`Đã kích hoạt thành công chủ đề "${theme.name}" cho App Hiệp hội!`, {
      description: "Toàn bộ App CEO 1983 đã đổi màu sắc, bố cục và hiệu ứng icon tương ứng.",
    });
  };

  const handleLoadPresetToStudio = (preset: FestivalThemeOption) => {
    setCustomName(preset.name);
    setCustomTagline(preset.tagline);
    setCustomBadge(preset.badge);
    setCustomPrimaryColor(preset.primaryColor);
    setCustomAccentColor(preset.accentColor);
    setCustomLayoutGrid(preset.layoutGrid || "4");
    setCustomBorderRadius(preset.borderRadius || "rounded-2xl");
    setCustomIconStyle(preset.iconStyle || "3d-emoji");
    setCustomEffectType(preset.effectType || "none");
    if (preset.actionIcons) {
      setCustomIcons((prev) => ({ ...prev, ...preset.actionIcons }));
    }
    setActiveTab("studio");
    toast.info(`Đã nạp thông số chủ đề "${preset.name}" vào Bộ Studio để bạn tùy chỉnh tự do!`);
  };

  const handleSaveAndApplyCustomTheme = async () => {
    const customConfig: FestivalThemeOption = {
      id: "custom",
      name: customName.trim() || "Chủ Đề Doanh Nghiệp Tùy Chỉnh",
      tagline: customTagline.trim() || "Giao diện thiết kế theo yêu cầu",
      badge: customBadge.trim() || "🎨 Tùy Biến",
      colorScheme: "Custom Palette",
      bannerGradient: `linear-gradient(135deg, ${customPrimaryColor} 0%, #1e293b 50%, ${customAccentColor} 100%)`,
      primaryColor: customPrimaryColor,
      accentColor: customAccentColor,
      iconEmoji: customBadge.slice(0, 2) || "🎨",
      layoutGrid: customLayoutGrid,
      borderRadius: customBorderRadius,
      iconStyle: customIconStyle,
      effectType: customEffectType,
      actionIcons: customIcons,
    };

    saveCustomThemeConfig(customConfig);
    setActiveEventThemeType("custom");
    setActiveAppThemeId("custom");
    setActiveThemeIdState("custom");

    try {
      await fetchNestApi("/admin/active-theme", {
        method: "PUT",
        body: JSON.stringify({
          themeId: "custom",
          enabled: true,
          customConfig,
        }),
      });
    } catch (e: any) {
      console.warn("Could not save custom theme to backend:", e);
    }

    toast.success(`Đã lưu và áp dụng chủ đề tùy chỉnh thành công!`, {
      description: "App Hiệp hội CEO 1983 đã cập nhật bố cục, bộ icon và hiệu ứng mới.",
    });
  };

  const effectiveActive = getEffectiveThemeOption();

  return (
    <AppShell>
      <PageHeader
        title="Quản Lý Chủ Đề & Giao Diện App CEO 1983"
        subtitle="Hệ thống tùy biến bố cục, màu sắc, icon động và không gian lễ hội chào mừng các sự kiện lớn cho App Hiệp hội"
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleApplyPresetTheme(FESTIVAL_THEMES[0])}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-border bg-card text-foreground hover:bg-muted text-xs font-semibold shadow-xs cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Khôi phục Hoàng Gia Mặc Định</span>
            </button>
          </div>
        }
      />

      <div className="space-y-6 pb-12">
        {/* Active Theme Spotlight Banner */}
        <div
          className="relative overflow-hidden rounded-2xl border p-6 shadow-sm transition-all duration-300"
          style={{
            borderColor: `${effectiveActive.accentColor}50`,
            background: effectiveActive.bannerGradient,
          }}
        >
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 text-white">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/25 border border-emerald-400/40 text-emerald-300 text-xs font-bold backdrop-blur-md">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  ĐANG KÍCH HOẠT TRÊN APP HIỆP HỘI
                </span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30">
                  {effectiveActive.badge}
                </span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-black/30">
                  Bố cục: {effectiveActive.layoutGrid || "4"} Cột • {effectiveActive.borderRadius || "rounded-2xl"}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black tracking-tight drop-shadow-md flex items-center gap-2">
                <span>{effectiveActive.iconEmoji}</span>
                <span>{effectiveActive.name}</span>
              </h2>
              <p className="text-xs sm:text-sm text-white/90 leading-relaxed drop-shadow-sm">
                {effectiveActive.tagline}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setPreviewingTheme(effectiveActive)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-white/30 bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition shadow-xs backdrop-blur-md cursor-pointer"
              >
                <Eye className="w-4 h-4 text-amber-300" />
                <span>Xem Chi Tiết</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2 border-b border-border pb-2">
          <button
            type="button"
            onClick={() => setActiveTab("catalog")}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "catalog"
                ? "bg-amber-500 text-white shadow-sm"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>Kho Chủ Đề Lễ Hội Mẫu (Presets)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("studio")}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "studio"
                ? "bg-amber-500 text-white shadow-sm"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Bộ Studio Tùy Biến Bố Cục, Giao Diện & Icon (Tùy Chỉnh)</span>
          </button>
        </div>

        {/* TAB 1: CATALOG OF PRESET THEMES */}
        {activeTab === "catalog" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-foreground">
                  Danh Sách Chủ Đề Lễ Hội & Nhận Diện Sẵn Có
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Nhấn "Áp dụng ngay" để chuyển App sang chủ đề tương ứng, hoặc bấm "Chỉnh sửa trong Studio" để tùy biến thêm.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {FESTIVAL_THEMES.filter((t) => t.id !== "custom" && t.id !== "none").map((theme) => {
                const isActive =
                  activeThemeId === theme.id ||
                  (theme.id === "christmas" && activeThemeId === "noel") ||
                  (theme.id === "classic" && activeThemeId === "default");

                return (
                  <div
                    key={theme.id}
                    className={`group relative flex flex-col rounded-2xl border transition-all duration-200 overflow-hidden bg-card ${
                      isActive
                        ? "border-amber-500 shadow-md ring-2 ring-amber-500/20"
                        : "border-border hover:border-amber-500/50 hover:shadow-sm"
                    }`}
                  >
                    {/* Visual Card Header */}
                    <div
                      className="relative h-32 p-4 flex flex-col justify-between overflow-hidden text-white"
                      style={{ background: theme.bannerGradient }}
                    >
                      <div className="relative z-10 flex items-center justify-between">
                        <span className="inline-flex items-center gap-1 rounded-full bg-black/40 backdrop-blur-md px-2.5 py-1 text-[11px] font-bold text-white border border-white/20">
                          {theme.badge}
                        </span>
                        {isActive && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">
                            <Check className="w-3 h-3" /> Đang dùng
                          </span>
                        )}
                      </div>

                      <div className="relative z-10 flex items-center gap-2.5 text-white">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-md border border-white/30 text-xl shadow-xs">
                          {theme.iconEmoji}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white leading-tight drop-shadow-sm">
                            {theme.name}
                          </h4>
                          <p className="text-[11px] text-white/80 line-clamp-1">{theme.colorScheme}</p>
                        </div>
                      </div>
                    </div>

                    {/* Theme Info & Action Icons Preview */}
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <p className="text-xs text-muted-foreground line-clamp-2">{theme.tagline}</p>

                      <div className="p-2.5 rounded-xl bg-muted/50 border border-border">
                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center justify-between">
                          <span>Bộ Icon Ứng Dụng</span>
                          <span className="text-[10px] text-amber-500 font-semibold">{theme.iconStyle}</span>
                        </div>
                        <div className="flex items-center justify-around text-lg">
                          <span title="Danh thiếp">{theme.actionIcons.card || "💳"}</span>
                          <span title="Danh bạ">{theme.actionIcons.members || "👥"}</span>
                          <span title="Check-in">{theme.actionIcons.checkin || "⚡"}</span>
                          <span title="Đặc quyền">{theme.actionIcons.perks || "👑"}</span>
                          <span title="Biểu quyết">{theme.actionIcons.voting || "🗳️"}</span>
                          <span title="Hội phí">{theme.actionIcons.fees || "💎"}</span>
                        </div>
                      </div>

                      <div className="pt-2 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleLoadPresetToStudio(theme)}
                          className="flex-1 rounded-xl border border-border bg-secondary/60 hover:bg-secondary py-2 text-xs font-semibold text-foreground transition text-center cursor-pointer"
                        >
                          Tùy Biến Thêm
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApplyPresetTheme(theme)}
                          disabled={isActive}
                          className={`flex-1 rounded-xl py-2 text-xs font-bold transition text-center shadow-xs cursor-pointer ${
                            isActive
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 cursor-default"
                              : "bg-amber-500 hover:bg-amber-600 text-white"
                          }`}
                        >
                          {isActive ? "Đang áp dụng" : "Áp dụng ngay"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: VISUAL THEME STUDIO (CUSTOMIZER) */}
        {activeTab === "studio" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Form Controls */}
            <div className="lg:col-span-7 space-y-6">
              {/* 1. Thông Tin Cơ Bản */}
              <div className="p-5 rounded-2xl bg-card border border-border shadow-xs space-y-4">
                <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                  <Palette className="w-4.5 h-4.5 text-amber-500" />
                  <span>1. Thông Tin Nhận Diện Chủ Đề</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground">Tên Chủ Đề</label>
                    <input
                      type="text"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      placeholder="VD: Hội Nghị Xúc Tiến Thương Mại"
                      className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground">Huy Hiệu / Badge</label>
                    <input
                      type="text"
                      value={customBadge}
                      onChange={(e) => setCustomBadge(e.target.value)}
                      placeholder="VD: 🌟 Hội Nghị"
                      className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Khẩu Hiệu / Tagline</label>
                  <input
                    type="text"
                    value={customTagline}
                    onChange={(e) => setCustomTagline(e.target.value)}
                    placeholder="VD: Kết nối sức mạnh doanh nhân CEO 1983 vươn xa"
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* 2. Bố Cục & Giao Diện */}
              <div className="p-5 rounded-2xl bg-card border border-border shadow-xs space-y-4">
                <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                  <Layers className="w-4.5 h-4.5 text-amber-500" />
                  <span>2. Thiết Kế Bố Cục & Bo Góc Thẻ (Layout & Geometry)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Số cột lưới */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground">
                      Số Cột Lưới Nút Tính Năng Nhanh
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { val: "4", label: "4 Cột (Chuẩn Mobile)" },
                        { val: "3", label: "3 Cột (Rộng Rãi)" },
                      ].map((c) => (
                        <button
                          key={c.val}
                          type="button"
                          onClick={() => setCustomLayoutGrid(c.val as LayoutGridCols)}
                          className={`p-2.5 rounded-xl border text-xs font-semibold transition cursor-pointer text-center ${
                            customLayoutGrid === c.val
                              ? "border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold"
                              : "border-border bg-background text-muted-foreground hover:bg-muted"
                          }`}
                        >
                          {c.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Độ bo góc */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground">
                      Độ Bo Góc Thẻ & Nút Bấm
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { val: "rounded-xl", label: "Bo Nhẹ" },
                        { val: "rounded-2xl", label: "Bo Chuẩn" },
                        { val: "rounded-3xl", label: "Siêu Tròn" },
                      ].map((r) => (
                        <button
                          key={r.val}
                          type="button"
                          onClick={() => setCustomBorderRadius(r.val as BorderRadiusStyle)}
                          className={`p-2.5 rounded-xl border text-xs font-semibold transition cursor-pointer text-center ${
                            customBorderRadius === r.val
                              ? "border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold"
                              : "border-border bg-background text-muted-foreground hover:bg-muted"
                          }`}
                        >
                          {r.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Màu Sắc & Nhận Diện Thương Hiệu */}
              <div className="p-5 rounded-2xl bg-card border border-border shadow-xs space-y-4">
                <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                  <Wand2 className="w-4.5 h-4.5 text-amber-500" />
                  <span>3. Màu Sắc Thương Hiệu & Điểm Nhấn (Brand Colors)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Primary Color */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-muted-foreground">Màu Chủ Đạo (Primary)</label>
                      <span className="text-xs font-mono font-bold text-foreground">{customPrimaryColor}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={customPrimaryColor}
                        onChange={(e) => setCustomPrimaryColor(e.target.value)}
                        className="h-9 w-10 rounded-lg cursor-pointer border border-border bg-transparent p-0.5"
                      />
                      <div className="flex-1 flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                        {PRESET_PRIMARY_COLORS.map((p) => (
                          <button
                            key={p.value}
                            type="button"
                            onClick={() => setCustomPrimaryColor(p.value)}
                            title={p.name}
                            className="h-7 w-7 rounded-full shrink-0 border border-white/20 shadow-2xs transition hover:scale-110"
                            style={{ backgroundColor: p.value }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Accent Color */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-muted-foreground">Màu Điểm Nhấn (Accent)</label>
                      <span className="text-xs font-mono font-bold text-foreground">{customAccentColor}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={customAccentColor}
                        onChange={(e) => setCustomAccentColor(e.target.value)}
                        className="h-9 w-10 rounded-lg cursor-pointer border border-border bg-transparent p-0.5"
                      />
                      <div className="flex-1 flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                        {PRESET_ACCENT_COLORS.map((a) => (
                          <button
                            key={a.value}
                            type="button"
                            onClick={() => setCustomAccentColor(a.value)}
                            title={a.name}
                            className="h-7 w-7 rounded-full shrink-0 border border-white/20 shadow-2xs transition hover:scale-110"
                            style={{ backgroundColor: a.value }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. Phong Cách Icon & Hiệu Ứng Lễ Hội */}
              <div className="p-5 rounded-2xl bg-card border border-border shadow-xs space-y-4">
                <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                  <Sparkles className="w-4.5 h-4.5 text-amber-500" />
                  <span>4. Phong Cách Biểu Tượng & Hiệu Ứng Không Gian (Icon & Effects)</span>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground">Phong Cách Icon</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: "3d-emoji", label: "3D Emoji Lễ Hội", desc: "Rực rỡ, trực quan" },
                      { id: "luxury-vector", label: "Luxury Vector", desc: "Hiện đại, thanh lịch" },
                      { id: "glow-neon", label: "Neon Glow", desc: "Phát sáng viền đèn" },
                      { id: "royal-badge", label: "Huy Hiệu Hoàng Gia", desc: "Đẳng cấp doanh nhân" },
                    ].map((st) => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => setCustomIconStyle(st.id as IconStyleType)}
                        className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                          customIconStyle === st.id
                            ? "border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold"
                            : "border-border bg-background text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        <div className="text-xs font-bold leading-tight">{st.label}</div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">{st.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Chọn hiệu ứng lễ hội nền */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground">Hiệu Ứng Không Gian (Particle Effects)</label>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {[
                      { id: "none", emoji: "🚫", label: "Tối Giản" },
                      { id: "snow", emoji: "❄️", label: "Tuyết Rơi" },
                      { id: "lanterns", emoji: "🏮", label: "Đèn Lồng" },
                      { id: "flowers", emoji: "🌸", label: "Hoa Mai/Đào" },
                      { id: "sparkles", emoji: "✨", label: "Sao Sáng" },
                    ].map((eff) => (
                      <button
                        key={eff.id}
                        type="button"
                        onClick={() => setCustomEffectType(eff.id as EffectType)}
                        className={`p-2 rounded-xl border text-center transition cursor-pointer ${
                          customEffectType === eff.id
                            ? "border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold"
                            : "border-border bg-background text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        <div className="text-base">{eff.emoji}</div>
                        <div className="text-[11px] font-semibold mt-0.5">{eff.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Nạp bộ icon nhanh */}
                <div className="space-y-2 pt-2 border-t border-border">
                  <label className="text-xs font-semibold text-muted-foreground">Nạp Nhanh Bộ Icon Mẫu</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { key: "3d-festival", label: "Bộ Tiêu Chuẩn 3D" },
                      { key: "mid-autumn", label: "Bộ Trung Thu" },
                      { key: "tet", label: "Bộ Tết Xuân" },
                      { key: "christmas", label: "Bộ Giáng Sinh" },
                      { key: "national", label: "Bộ Quốc Khánh" },
                    ].map((ps) => (
                      <button
                        key={ps.key}
                        type="button"
                        onClick={() => {
                          setCustomIcons({ ...ICON_PRESET_SETS[ps.key] });
                          toast.success(`Đã nạp bộ icon "${ps.label}"!`);
                        }}
                        className="px-2.5 py-1 rounded-lg border border-border bg-muted/60 hover:bg-muted text-[11px] font-medium transition cursor-pointer"
                      >
                        {ps.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Nút Hành Động */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleSaveAndApplyCustomTheme}
                  className="flex-1 py-3 px-6 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <Save className="w-4 h-4" />
                  <span>LƯU & ÁP DỤNG NGAY CHO APP CEO 1983</span>
                </button>
              </div>
            </div>

            {/* Right Column: Live Interactive Mobile Preview */}
            <div className="lg:col-span-5 sticky top-6 space-y-4">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-amber-500" />
                  Mô Phỏng Trực Tiếp App CEO 1983
                </span>
                <span className="text-[11px] font-semibold text-emerald-500">Live Preview</span>
              </div>

              {/* Mobile Mockup Frame */}
              <div className="relative mx-auto w-full max-w-[340px] rounded-[36px] border-4 border-slate-800 bg-[#070D1A] text-white shadow-2xl overflow-hidden p-3 min-h-[580px] flex flex-col justify-between select-none">
                {/* Simulated Notch */}
                <div className="absolute top-2 inset-x-0 mx-auto w-24 h-4 rounded-full bg-slate-800 z-30" />

                {/* Simulated Header with dynamic gradient */}
                <div className="space-y-3 pt-5">
                  <div
                    className="rounded-2xl p-4 transition-all duration-300 relative overflow-hidden"
                    style={{
                      background: `linear-gradient(135deg, ${customPrimaryColor} 0%, #0F172A 60%, ${customAccentColor} 100%)`,
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-extrabold tracking-wider">{customBadge}</div>
                      <div className="text-[10px] bg-black/30 px-2 py-0.5 rounded-full">{customEffectType}</div>
                    </div>
                    <div className="mt-2 text-sm font-black drop-shadow-sm">{customName}</div>
                    <div className="text-[10px] text-white/80 line-clamp-1">{customTagline}</div>
                  </div>

                  {/* Quick Actions Grid Preview */}
                  <div
                    className={`p-3 bg-slate-900/90 border transition-all duration-300 ${
                      customBorderRadius === "rounded-3xl"
                        ? "rounded-3xl"
                        : customBorderRadius === "rounded-xl"
                        ? "rounded-xl"
                        : "rounded-2xl"
                    }`}
                    style={{ borderColor: `${customPrimaryColor}40` }}
                  >
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: customPrimaryColor }} />
                        Tính năng nhanh
                      </span>
                      <span className="text-[9px] font-mono text-amber-400">{customLayoutGrid} Cột</span>
                    </div>

                    <div className={`grid ${customLayoutGrid === "3" ? "grid-cols-3" : "grid-cols-4"} gap-2`}>
                      {[
                        { name: "Danh thiếp", key: "card" },
                        { name: "Danh bạ", key: "members" },
                        { name: "Check-in", key: "checkin" },
                        { name: "Đặc quyền", key: "perks" },
                        { name: "Biểu quyết", key: "voting" },
                        { name: "Lịch sử", key: "history" },
                        { name: "Kho tài liệu", key: "library" },
                        { name: "Hội phí", key: "fees" },
                      ].map((item) => (
                        <div key={item.key} className="flex flex-col items-center gap-1 p-1">
                          <div
                            className={`h-10 w-10 flex items-center justify-center text-lg transition-all duration-200 ${
                              customBorderRadius === "rounded-3xl"
                                ? "rounded-2xl"
                                : customBorderRadius === "rounded-xl"
                                ? "rounded-lg"
                                : "rounded-xl"
                            }`}
                            style={{
                              backgroundColor: `${customPrimaryColor}25`,
                              borderColor: `${customPrimaryColor}50`,
                              borderWidth: "1px",
                              boxShadow:
                                customIconStyle === "glow-neon"
                                  ? `0 0 10px ${customAccentColor}80`
                                  : undefined,
                            }}
                          >
                            <span>{customIcons[item.key] || "✨"}</span>
                          </div>
                          <span className="text-[9px] text-center text-slate-300 font-semibold line-clamp-1">
                            {item.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Simulated Tab Bar */}
                <div className="pt-2 border-t border-slate-800 flex items-center justify-around text-slate-400 text-xs">
                  <div className="text-amber-400 font-bold flex flex-col items-center">
                    <span className="text-xs">🏠</span>
                    <span className="text-[9px]">Trang chủ</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-xs">📅</span>
                    <span className="text-[9px]">Sự kiện</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-xs">💳</span>
                    <span className="text-[9px]">Thẻ số</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-xs">💬</span>
                    <span className="text-[9px]">Tin nhắn</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {previewingTheme && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2 text-amber-500 font-bold">
                <Palette className="h-5 w-5" />
                <h3 className="text-base font-bold text-foreground">
                  Chi Tiết Chủ Đề: {previewingTheme.name}
                </h3>
              </div>
              <button
                onClick={() => setPreviewingTheme(null)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-secondary cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div
              className="rounded-xl p-4 text-white space-y-2 shadow-xs"
              style={{ background: previewingTheme.bannerGradient }}
            >
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-200">
                {previewingTheme.badge}
              </span>
              <h4 className="text-base font-black">{previewingTheme.name}</h4>
              <p className="text-xs text-white/90 leading-relaxed">
                {previewingTheme.tagline}
              </p>
            </div>

            <div className="space-y-2">
              <h5 className="text-xs font-bold text-foreground uppercase tracking-wider">
                Bộ Biểu Tượng Ứng Dụng:
              </h5>
              <div className="grid grid-cols-4 gap-2">
                {Object.entries(previewingTheme.actionIcons).map(([k, icon]) => (
                  <div key={k} className="p-2 rounded-xl bg-muted/60 text-center">
                    <div className="text-xl">{icon}</div>
                    <div className="text-[10px] text-muted-foreground font-semibold capitalize mt-0.5">{k}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-border">
              <button
                onClick={() => setPreviewingTheme(null)}
                className="rounded-xl border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted cursor-pointer"
              >
                Đóng
              </button>
              <button
                onClick={() => {
                  handleApplyPresetTheme(previewingTheme);
                  setPreviewingTheme(null);
                }}
                className="rounded-xl bg-amber-500 hover:bg-amber-600 px-5 py-2 text-xs font-bold text-white shadow-sm transition cursor-pointer"
              >
                Áp dụng chủ đề này ngay
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
