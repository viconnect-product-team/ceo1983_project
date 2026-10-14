import { useState, useEffect } from "react";
import { Sparkles, Moon, Star, Bell, Gift, Heart, Flag, Award, Check } from "lucide-react";
import { fetchNestApi } from "@/lib/api-client";

export type EventThemeType =
  | "classic"
  | "mid-autumn"
  | "national-day"
  | "christmas"
  | "tet"
  | "entrepreneur-day"
  | "ceo1983-birthday"
  | "custom"
  | "none";

export type LayoutGridCols = "3" | "4";
export type BorderRadiusStyle = "rounded-xl" | "rounded-2xl" | "rounded-3xl";
export type IconStyleType = "3d-emoji" | "luxury-vector" | "glow-neon" | "royal-badge";
export type EffectType = "none" | "snow" | "lanterns" | "flowers" | "fireworks" | "sparkles";

const EVENT_THEME_STORAGE_KEY = "vba_event_theme_disabled";
const EVENT_THEME_TYPE_KEY = "vba_event_theme_type";
const EVENT_THEME_ENABLED_KEY = "vba_event_theme_enabled";
const EVENT_THEME_CUSTOM_CONFIG_KEY = "ceo1983_custom_theme_config";

export interface FestivalThemeOption {
  id: EventThemeType;
  name: string;
  tagline: string;
  badge: string;
  colorScheme: string;
  bannerGradient: string;
  primaryColor: string;
  accentColor: string;
  iconEmoji: string;
  layoutGrid?: LayoutGridCols;
  borderRadius?: BorderRadiusStyle;
  iconStyle?: IconStyleType;
  effectType?: EffectType;
  actionIcons: {
    card?: string;
    members?: string;
    checkin?: string;
    perks?: string;
    voting?: string;
    history?: string;
    library?: string;
    fees?: string;
    directory?: string;
    events?: string;
    opportunities?: string;
    marketplace?: string;
    connect?: string;
  };
}

export const FESTIVAL_THEMES: FestivalThemeOption[] = [
  {
    id: "classic",
    name: "Hoàng Gia Mặc Định",
    tagline: "Đẳng cấp doanh nhân • Chuẩn mực sang trọng",
    badge: "👑 Standard",
    colorScheme: "Royal Navy & Champagne Gold",
    bannerGradient: "linear-gradient(135deg, #001B54 0%, #172554 50%, #1e3a8a 100%)",
    primaryColor: "#001B54",
    accentColor: "#D4AF37",
    iconEmoji: "👑",
    layoutGrid: "4",
    borderRadius: "rounded-2xl",
    iconStyle: "luxury-vector",
    effectType: "none",
    actionIcons: {
      card: "💳",
      members: "👥",
      checkin: "⚡",
      perks: "👑",
      voting: "🗳️",
      history: "📜",
      library: "📁",
      fees: "💎",
      directory: "👥",
      events: "📅",
      opportunities: "✨",
      marketplace: "🛍️",
      connect: "🤝",
    },
  },
  {
    id: "mid-autumn",
    name: "Tết Trung Thu Đoàn Viên",
    tagline: "Đèn lồng rực rỡ • Ánh trăng rằm tháng Tám",
    badge: "🥮 Trung Thu",
    colorScheme: "Crimson Red & Moon Amber",
    bannerGradient: "linear-gradient(135deg, #7f1d1d 0%, #991b1b 50%, #b45309 100%)",
    primaryColor: "#991B1B",
    accentColor: "#F59E0B",
    iconEmoji: "🥮",
    layoutGrid: "4",
    borderRadius: "rounded-2xl",
    iconStyle: "3d-emoji",
    effectType: "lanterns",
    actionIcons: {
      card: "🥮",
      members: "🏮",
      checkin: "🌕",
      perks: "🐇",
      voting: "🪔",
      history: "📜",
      library: "📚",
      fees: "💰",
      directory: "🏮",
      events: "🌕",
      opportunities: "🐇",
      marketplace: "🥮",
      connect: "🤝",
    },
  },
  {
    id: "national-day",
    name: "Tự Hào Quốc Khánh 2/9",
    tagline: "Hào khí non sông • Doanh nhân Việt thịnh vượng",
    badge: "🇻🇳 Quốc Khánh",
    colorScheme: "Vietnam Red & Golden Star",
    bannerGradient: "linear-gradient(135deg, #991b1b 0%, #dc2626 60%, #ca8a04 100%)",
    primaryColor: "#DC2626",
    accentColor: "#EAB308",
    iconEmoji: "🇻🇳",
    layoutGrid: "4",
    borderRadius: "rounded-2xl",
    iconStyle: "3d-emoji",
    effectType: "sparkles",
    actionIcons: {
      card: "⭐",
      members: "🇻🇳",
      checkin: "🎖️",
      perks: "🦅",
      voting: "🗳️",
      history: "🏛️",
      library: "📜",
      fees: "💎",
      directory: "⭐",
      events: "🇻🇳",
      opportunities: "🦅",
      marketplace: "🏆",
      connect: "🤝",
    },
  },
  {
    id: "christmas",
    name: "Giáng Sinh & Năm Mới (Noel)",
    tagline: "Chuông tuyết ngân vang • An lành & Khởi sắc",
    badge: "🎄 Giáng Sinh",
    colorScheme: "Pine Green & Santa Red & Snowflake",
    bannerGradient: "linear-gradient(135deg, #064e3b 0%, #065f46 50%, #991b1b 100%)",
    primaryColor: "#065F46",
    accentColor: "#EF4444",
    iconEmoji: "🎄",
    layoutGrid: "4",
    borderRadius: "rounded-3xl",
    iconStyle: "3d-emoji",
    effectType: "snow",
    actionIcons: {
      card: "🎁",
      members: "🎅",
      checkin: "❄️",
      perks: "🎄",
      voting: "🔔",
      history: "📜",
      library: "📁",
      fees: "💰",
      directory: "🔔",
      events: "🎄",
      opportunities: "🎁",
      marketplace: "❄️",
      connect: "🤝",
    },
  },
  {
    id: "tet",
    name: "Tết Cổ Truyền - Xuân Cát Tường",
    tagline: "Mai đào khoe sắc • Vạn sự như ý phát tài",
    badge: "🌸 Tết Xuân",
    colorScheme: "Lucky Scarlet & Gold Blossom",
    bannerGradient: "linear-gradient(135deg, #991b1b 0%, #b91c1c 50%, #d97706 100%)",
    primaryColor: "#B91C1C",
    accentColor: "#FBBF24",
    iconEmoji: "🌸",
    layoutGrid: "4",
    borderRadius: "rounded-2xl",
    iconStyle: "3d-emoji",
    effectType: "flowers",
    actionIcons: {
      card: "🧧",
      members: "🌸",
      checkin: "🎆",
      perks: "💰",
      voting: "🗳️",
      history: "📜",
      library: "📁",
      fees: "🪙",
      directory: "🧧",
      events: "🌸",
      opportunities: "💰",
      marketplace: "🎆",
      connect: "🤝",
    },
  },
  {
    id: "entrepreneur-day",
    name: "Ngày Doanh Nhân Việt Nam 13/10",
    tagline: "Tôn vinh trí tuệ • Bản lĩnh & Khát vọng tiên phong",
    badge: "🏆 Doanh Nhân",
    colorScheme: "Executive Sapphire & Vibrant Cyan",
    bannerGradient: "linear-gradient(135deg, #002B70 0%, #003B95 50%, #0284c7 100%)",
    primaryColor: "#003B95",
    accentColor: "#38BDF8",
    iconEmoji: "🏆",
    layoutGrid: "4",
    borderRadius: "rounded-2xl",
    iconStyle: "royal-badge",
    effectType: "sparkles",
    actionIcons: {
      card: "🏆",
      members: "🤝",
      checkin: "⚡",
      perks: "👑",
      voting: "🗳️",
      history: "📈",
      library: "📁",
      fees: "💼",
      directory: "🤝",
      events: "🏆",
      opportunities: "💼",
      marketplace: "⭐",
      connect: "🤝",
    },
  },
  {
    id: "ceo1983-birthday",
    name: "Sinh Nhật CLB CEO 1983",
    tagline: "Hội ngộ đồng niên 1983 • Tỏa sáng bản lĩnh • Vững bước tương lai",
    badge: "🎂 Sinh Nhật 1983",
    colorScheme: "Royal Gold & Celebration Amber & Champagne",
    bannerGradient: "linear-gradient(135deg, #78350f 0%, #b45309 45%, #d97706 75%, #f59e0b 100%)",
    primaryColor: "#B45309",
    accentColor: "#F59E0B",
    iconEmoji: "🎂",
    layoutGrid: "4",
    borderRadius: "rounded-3xl",
    iconStyle: "royal-badge",
    effectType: "sparkles",
    actionIcons: {
      card: "🎂",
      members: "🎉",
      checkin: "✨",
      perks: "🎁",
      voting: "👑",
      history: "📜",
      library: "📁",
      fees: "💎",
      directory: "🎉",
      events: "🎂",
      opportunities: "🥂",
      marketplace: "🛍️",
      connect: "🤝",
    },
  },
  {
    id: "custom",
    name: "Chủ Đề Tùy Chỉnh Doanh Nghiệp",
    tagline: "Thiết kế riêng theo phong cách & nhận diện CLB",
    badge: "🎨 Tùy Biến",
    colorScheme: "Custom Palette & Brand Identity",
    bannerGradient: "linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)",
    primaryColor: "#312E81",
    accentColor: "#F59E0B",
    iconEmoji: "🎨",
    layoutGrid: "4",
    borderRadius: "rounded-2xl",
    iconStyle: "3d-emoji",
    effectType: "sparkles",
    actionIcons: {
      card: "💳",
      members: "👥",
      checkin: "⚡",
      perks: "👑",
      voting: "🗳️",
      history: "📜",
      library: "📁",
      fees: "💎",
      directory: "👥",
      events: "📅",
      opportunities: "✨",
      marketplace: "🛍️",
      connect: "🤝",
    },
  },
];

export const DEFAULT_BASE_THEME: FestivalThemeOption = {
  id: "none",
  name: "Giao diện gốc",
  tagline: "Giao diện chuẩn CEO 1983 khi chưa áp dụng chủ đề",
  badge: "✨ Chuẩn",
  colorScheme: "CEO 1983 Classic Navy & Amber Gold",
  bannerGradient: "none",
  primaryColor: "#003B95",
  accentColor: "#F59E0B",
  iconEmoji: "✨",
  layoutGrid: "4",
  borderRadius: "rounded-2xl",
  iconStyle: "luxury-vector",
  effectType: "none",
  actionIcons: {},
};

export function getCurrentUserKey(): string {
  if (typeof window === "undefined") return "guest";
  try {
    const email = localStorage.getItem("vba_user_email");
    if (email) return email.toLowerCase().trim();
    const raw = localStorage.getItem("vibe_user");
    if (raw) {
      const u = JSON.parse(raw);
      if (u?.id) return String(u.id);
      if (u?.email) return String(u.email).toLowerCase().trim();
    }
  } catch {}
  return "guest";
}

export function isEventThemeEnabled(userIdentifier?: string): boolean {
  if (typeof window === "undefined") return false;
  const crmTheme = getCrmAppliedTheme();
  // Nếu CRM không áp dụng chủ đề (hoặc Bỏ áp dụng), tắt chủ đề cho toàn bộ người dùng
  if (crmTheme === "none") return false;

  const userKey = userIdentifier || getCurrentUserKey();
  const perUserPref = localStorage.getItem(`vba_user_theme_pref_${userKey}`);
  if (perUserPref === "disabled") return false;
  if (perUserPref === "enabled") return true;

  if (localStorage.getItem(EVENT_THEME_STORAGE_KEY) === "true") return false;
  if (localStorage.getItem("vba_user_explicit_theme_preference") === "disabled") return false;
  if (localStorage.getItem(EVENT_THEME_ENABLED_KEY) === "false") return false;

  return localStorage.getItem(EVENT_THEME_ENABLED_KEY) === "true";
}

export function setEventThemeEnabled(enabled: boolean, userIdentifier?: string) {
  if (typeof window === "undefined") return;
  const userKey = userIdentifier || getCurrentUserKey();
  localStorage.setItem(`vba_user_theme_pref_${userKey}`, enabled ? "enabled" : "disabled");

  if (enabled) {
    localStorage.setItem(EVENT_THEME_ENABLED_KEY, "true");
    localStorage.removeItem(EVENT_THEME_STORAGE_KEY);
    localStorage.setItem("vba_user_explicit_theme_preference", "enabled");
    const active = getCrmAppliedTheme();
    applyThemeAttributes(active === "none" ? "classic" : active);
  } else {
    localStorage.setItem(EVENT_THEME_STORAGE_KEY, "true");
    localStorage.setItem(EVENT_THEME_ENABLED_KEY, "false");
    localStorage.setItem("vba_user_explicit_theme_preference", "disabled");
    applyThemeAttributes("none");
  }
  window.dispatchEvent(new CustomEvent("vba-event-theme-changed", { detail: { enabled } }));
}

function normalizeTheme(t?: string | null): EventThemeType {
  if (!t || t === "none" || t === "off" || t === "disabled") return "none";
  if (t === "noel") return "christmas";
  if (t === "default") return "classic";
  if (t === "birthday" || t === "sinh-nhat" || t === "ceo1983-birthday") return "ceo1983-birthday";
  if (
    t === "classic" ||
    t === "mid-autumn" ||
    t === "national-day" ||
    t === "christmas" ||
    t === "tet" ||
    t === "entrepreneur-day" ||
    t === "ceo1983-birthday" ||
    t === "custom"
  ) {
    return t as EventThemeType;
  }
  return "none";
}

export function getCustomThemeConfig(): Partial<FestivalThemeOption> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(EVENT_THEME_CUSTOM_CONFIG_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveCustomThemeConfig(config: Partial<FestivalThemeOption>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(EVENT_THEME_CUSTOM_CONFIG_KEY, JSON.stringify(config));
    const customIdx = FESTIVAL_THEMES.findIndex((t) => t.id === "custom");
    if (customIdx >= 0) {
      FESTIVAL_THEMES[customIdx] = {
        ...FESTIVAL_THEMES[customIdx],
        ...config,
        actionIcons: {
          ...FESTIVAL_THEMES[customIdx].actionIcons,
          ...(config.actionIcons || {}),
        },
      };
    }
  } catch {}
}

export function getEffectiveThemeOption(): FestivalThemeOption {
  if (!isEventThemeEnabled()) {
    return DEFAULT_BASE_THEME;
  }
  const activeId = getActiveEventThemeType();
  if (activeId === "none") {
    return DEFAULT_BASE_THEME;
  }
  const found = FESTIVAL_THEMES.find((t) => t.id === activeId) || DEFAULT_BASE_THEME;
  if (activeId === "custom") {
    const customConf = getCustomThemeConfig();
    if (customConf) {
      return {
        ...found,
        ...customConf,
        actionIcons: {
          ...found.actionIcons,
          ...(customConf.actionIcons || {}),
        },
      };
    }
  }
  return found;
}

export function getCrmAppliedTheme(): EventThemeType {
  if (typeof window === "undefined") return "none";
  try {
    const raw =
      localStorage.getItem("ceo1983_active_theme") ||
      localStorage.getItem("vba_crm_applied_theme") ||
      localStorage.getItem("vba_app_theme");
    return normalizeTheme(raw);
  } catch {
    return "none";
  }
}

export function getActiveEventThemeType(): EventThemeType {
  if (typeof window === "undefined") return "none";
  if (!isEventThemeEnabled()) return "none";
  const crmTheme = getCrmAppliedTheme();
  return crmTheme === "none" ? "none" : crmTheme;
}

export async function syncThemeFromBackend() {
  if (typeof window === "undefined") return;

  try {
    const res = await fetchNestApi<{ themeId: EventThemeType; enabled: boolean; customConfig?: any }>(
      "/public/active-theme"
    );

    // CRM bỏ áp dụng chủ đề (trở về giao diện gốc)
    if (res?.enabled === false || res?.themeId === "none" || !res?.themeId) {
      localStorage.setItem("ceo1983_active_theme", "none");
      localStorage.setItem("vba_crm_applied_theme", "none");
      localStorage.setItem("vba_app_theme", "none");
      localStorage.setItem(EVENT_THEME_TYPE_KEY, "none");
      applyThemeAttributes("none");
      window.dispatchEvent(new CustomEvent("vba-event-theme-changed", { detail: { enabled: false } }));
      return;
    }

    // CRM có chủ đề đang được áp dụng
    if (res?.themeId) {
      const normalized = normalizeTheme(res.themeId);
      if (res.customConfig) {
        saveCustomThemeConfig(res.customConfig);
      }
      localStorage.setItem("ceo1983_active_theme", normalized);
      localStorage.setItem("vba_crm_applied_theme", normalized);
      localStorage.setItem("vba_app_theme", normalized);
      localStorage.setItem(EVENT_THEME_TYPE_KEY, normalized);

      const userKey = getCurrentUserKey();
      const perUserPref = localStorage.getItem(`vba_user_theme_pref_${userKey}`);
      const isExplicitlyDisabled =
        perUserPref === "disabled" ||
        localStorage.getItem("vba_user_explicit_theme_preference") === "disabled" ||
        localStorage.getItem(EVENT_THEME_STORAGE_KEY) === "true";

      if (isExplicitlyDisabled) {
        applyThemeAttributes("none");
      } else {
        localStorage.setItem(EVENT_THEME_ENABLED_KEY, "true");
        applyThemeAttributes(normalized);
      }
      window.dispatchEvent(
        new CustomEvent("vba-event-theme-changed", { detail: { enabled: !isExplicitlyDisabled } })
      );
    }
  } catch {
    // fallback
  }
}

export function setActiveEventThemeType(type: EventThemeType) {
  if (typeof window === "undefined") return;
  const isExplicitlyDisabled =
    localStorage.getItem("vba_user_explicit_theme_preference") === "disabled" ||
    localStorage.getItem(EVENT_THEME_STORAGE_KEY) === "true";

  const crmId = type === "christmas" ? "noel" : type === "classic" ? "default" : type;
  try {
    localStorage.setItem(EVENT_THEME_TYPE_KEY, type);
    localStorage.setItem("ceo1983_active_theme", crmId);
    localStorage.setItem("vba_crm_applied_theme", crmId);
    localStorage.setItem("vba_app_theme", crmId);

    if (type === "none") {
      localStorage.setItem(EVENT_THEME_STORAGE_KEY, "true");
      localStorage.setItem(EVENT_THEME_ENABLED_KEY, "false");
    } else if (!isExplicitlyDisabled) {
      localStorage.setItem(EVENT_THEME_ENABLED_KEY, "true");
      localStorage.removeItem(EVENT_THEME_STORAGE_KEY);
    }
  } catch {}

  const effective = !isExplicitlyDisabled && type !== "none" ? type : "none";
  applyThemeAttributes(effective);
  window.dispatchEvent(
    new CustomEvent("vba-event-theme-changed", { detail: { type, enabled: effective !== "none" } })
  );
  window.dispatchEvent(new CustomEvent("ceo1983-theme-changed", { detail: crmId }));
}

export function applyThemeAttributes(theme: EventThemeType) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const isEnabled = isEventThemeEnabled() && theme !== "none";
  root.setAttribute("data-festival-theme", isEnabled ? theme : "none");
  const found = isEnabled ? getEffectiveThemeOption() : DEFAULT_BASE_THEME;
  root.style.setProperty("--festival-primary", found.primaryColor);
  root.style.setProperty("--festival-accent", found.accentColor);
  root.style.setProperty("--festival-gradient", found.bannerGradient);
}

/**
 * Seasonal Event Header Decorator
 * Renders distinct festival elements for Mid-Autumn, National Day 2/9, Christmas, Tet, or Entrepreneur Day.
 */
export function SeasonalEventHeader() {
  const [enabled, setEnabled] = useState(isEventThemeEnabled());
  const [themeType, setThemeType] = useState<EventThemeType>(getActiveEventThemeType());

  useEffect(() => {
    applyThemeAttributes(isEventThemeEnabled() ? getActiveEventThemeType() : "none");
    void syncThemeFromBackend();

    const handleThemeChange = () => {
      const isEn = isEventThemeEnabled();
      setEnabled(isEn);
      const current = isEn ? getActiveEventThemeType() : "none";
      setThemeType(current);
      applyThemeAttributes(current);
    };
    window.addEventListener("vba-event-theme-changed", handleThemeChange);
    window.addEventListener("ceo1983-theme-changed", handleThemeChange);
    window.addEventListener("vba_auth_changed", handleThemeChange);
    return () => {
      window.removeEventListener("vba-event-theme-changed", handleThemeChange);
      window.removeEventListener("ceo1983-theme-changed", handleThemeChange);
      window.removeEventListener("vba_auth_changed", handleThemeChange);
    };
  }, []);

  const crmTheme = getCrmAppliedTheme();
  if (!crmTheme || !enabled || themeType === "none" || themeType === "classic") return null;

  // 1. CHỦ ĐỀ TRUNG THU
  if (themeType === "mid-autumn") {
    return (
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-20 h-24 overflow-hidden select-none"
        aria-hidden="true"
      >
        <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-amber-400/20 blur-2xl animate-pulse" />
        <div className="absolute right-10 top-2 flex items-center gap-1 opacity-80">
          <Moon className="h-4 w-4 text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)] fill-amber-200/50" />
          <Star className="h-2 w-2 text-yellow-200 animate-ping opacity-75" />
        </div>

        {/* Hanging Star Lanterns */}
        <div className="absolute left-3 top-0 flex flex-col items-center">
          <div className="h-3 w-[1px] bg-gradient-to-b from-amber-400 to-red-500" />
          <div className="relative animate-bounce text-lg" style={{ animationDuration: "3.5s" }}>
            🏮
          </div>
        </div>

        <div className="absolute right-3 top-0 flex flex-col items-center">
          <div className="h-4 w-[1px] bg-gradient-to-b from-amber-400 to-red-500" />
          <div className="relative animate-bounce text-base" style={{ animationDuration: "4s", animationDelay: "0.5s" }}>
            ⭐
          </div>
        </div>
      </div>
    );
  }

  // 2. CHỦ ĐỀ QUỐC KHÁNH 2/9
  if (themeType === "national-day") {
    return (
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-20 h-24 overflow-hidden select-none"
        aria-hidden="true"
      >
        <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-red-500/20 blur-2xl" />
        <div className="absolute left-3 top-2 flex items-center gap-1.5 animate-pulse">
          <span className="text-sm">🇻🇳</span>
          <span className="text-[10px] font-black uppercase text-amber-300 tracking-wider drop-shadow-sm">
            Tự Hào 2/9
          </span>
        </div>
        <div className="absolute right-3 top-2 flex items-center gap-1 opacity-90">
          <Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400 drop-shadow-[0_0_8px_rgba(234,179,8,0.9)]" />
          <span className="text-sm">🇻🇳</span>
        </div>
      </div>
    );
  }

  // 3. CHỦ ĐỀ GIÁNG SINH NOEL
  if (themeType === "christmas") {
    return (
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-20 h-24 overflow-hidden select-none"
        aria-hidden="true"
      >
        <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-emerald-400/20 blur-2xl" />
        <div className="absolute left-3 top-2 flex items-center gap-1 animate-bounce" style={{ animationDuration: "3s" }}>
          <span className="text-base">🎄</span>
          <span className="text-[10px] font-bold text-red-200">Noel CEO 1983</span>
        </div>
        <div className="absolute right-3 top-2 flex items-center gap-1.5 opacity-90">
          <span className="text-sm animate-spin" style={{ animationDuration: "8s" }}>❄️</span>
          <span className="text-base">🔔</span>
        </div>
      </div>
    );
  }

  // 4. CHỦ ĐỀ TẾT CỔ TRUYỀN
  if (themeType === "tet") {
    return (
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-20 h-24 overflow-hidden select-none"
        aria-hidden="true"
      >
        <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-rose-500/20 blur-2xl" />
        <div className="absolute left-3 top-2 flex items-center gap-1 animate-pulse">
          <span className="text-base">🌸</span>
          <span className="text-[10px] font-black uppercase text-amber-200 tracking-wider">
            Xuân Như Ý
          </span>
        </div>
        <div className="absolute right-3 top-2 flex items-center gap-1.5 opacity-90">
          <span className="text-base">🧧</span>
          <span className="text-base animate-bounce" style={{ animationDuration: "3s" }}>💰</span>
        </div>
      </div>
    );
  }

  // 5. CHỦ ĐỀ NGÀY DOANH NHÂN 13/10
  if (themeType === "entrepreneur-day") {
    return (
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-20 h-24 overflow-hidden select-none"
        aria-hidden="true"
      >
        <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-blue-600/25 blur-2xl animate-pulse" />
        <div className="absolute left-3 top-2 flex items-center gap-1.5 animate-pulse">
          <span className="text-base">🏆</span>
          <span className="text-[10px] font-black uppercase text-sky-300 tracking-wider drop-shadow-sm">
            Doanh Nhân 13/10
          </span>
        </div>
        <div className="absolute right-3 top-2 flex items-center gap-1 opacity-90">
          <Award className="h-4 w-4 text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
          <span className="text-sm">🤝</span>
        </div>
      </div>
    );
  }

  // 6. CHỦ ĐỀ TÙY CHỈNH DOANH NGHIỆP
  if (themeType === "custom") {
    const effective = getEffectiveThemeOption();
    const eff = effective.effectType || "sparkles";
    return (
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-20 h-24 overflow-hidden select-none"
        aria-hidden="true"
      >
        <div
          className="absolute -right-6 -top-6 h-28 w-28 rounded-full blur-2xl animate-pulse opacity-40"
          style={{ backgroundColor: effective.accentColor || "#F59E0B" }}
        />
        <div className="absolute left-3 top-2 flex items-center gap-1.5 animate-pulse">
          <span className="text-base">{effective.iconEmoji || "🎨"}</span>
          <span
            className="text-[10px] font-black uppercase tracking-wider drop-shadow-sm"
            style={{ color: effective.accentColor || "#F59E0B" }}
          >
            {effective.badge || "CEO 1983"}
          </span>
        </div>
        <div className="absolute right-3 top-2 flex items-center gap-1 opacity-90">
          {eff === "snow" && <span className="text-sm animate-spin" style={{ animationDuration: "8s" }}>❄️</span>}
          {eff === "lanterns" && <span className="text-sm animate-bounce">🏮</span>}
          {eff === "flowers" && <span className="text-sm animate-pulse">🌸</span>}
          {eff === "fireworks" && <span className="text-sm animate-bounce">🎆</span>}
          {eff === "sparkles" && <Sparkles className="h-4 w-4" style={{ color: effective.accentColor }} />}
          <span className="text-sm">{effective.iconEmoji || "✨"}</span>
        </div>
      </div>
    );
  }

  // 7. CHỦ ĐỀ SINH NHẬT CLB CEO 1983
  if (themeType === "ceo1983-birthday") {
    return (
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-20 h-24 overflow-hidden select-none"
        aria-hidden="true"
      >
        <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-amber-500/25 blur-2xl animate-pulse" />
        <div className="absolute left-3 top-2 flex items-center gap-1.5 animate-bounce" style={{ animationDuration: "2.8s" }}>
          <span className="text-base">🎂</span>
          <span className="text-[10px] font-black uppercase text-amber-300 tracking-wider drop-shadow-md">
            Mừng Sinh Nhật CEO 1983
          </span>
        </div>
        <div className="absolute right-3 top-2 flex items-center gap-1.5 opacity-90">
          <span className="text-base animate-pulse">🎉</span>
          <span className="text-base">🥂</span>
          <span className="text-sm">✨</span>
        </div>
      </div>
    );
  }

  return null;
}

