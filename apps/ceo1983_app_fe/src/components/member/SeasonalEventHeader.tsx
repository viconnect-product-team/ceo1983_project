import { useState, useEffect } from "react";
import { Sparkles, Moon, Star, Bell, Gift, Heart, Flag, Award, Check } from "lucide-react";
import { fetchNestApi } from "@/lib/api-client";

export type EventThemeType = "classic" | "mid-autumn" | "national-day" | "christmas" | "tet" | "entrepreneur-day" | "none";

const EVENT_THEME_STORAGE_KEY = "vba_event_theme_disabled";
const EVENT_THEME_TYPE_KEY = "vba_event_theme_type";
const EVENT_THEME_ENABLED_KEY = "vba_event_theme_enabled";

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
  actionIcons: {
    directory: string;
    events: string;
    opportunities: string;
    marketplace: string;
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
    actionIcons: {
      directory: "👥",
      events: "📅",
      opportunities: "✨",
      marketplace: "🛍️",
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
    actionIcons: {
      directory: "🏮",
      events: "🌕",
      opportunities: "🐇",
      marketplace: "🥮",
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
    actionIcons: {
      directory: "⭐",
      events: "🇻🇳",
      opportunities: "🦅",
      marketplace: "🏆",
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
    actionIcons: {
      directory: "🔔",
      events: "🎄",
      opportunities: "🎁",
      marketplace: "❄️",
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
    actionIcons: {
      directory: "🧧",
      events: "🌸",
      opportunities: "💰",
      marketplace: "🎆",
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
    actionIcons: {
      directory: "🤝",
      events: "🏆",
      opportunities: "💼",
      marketplace: "⭐",
    },
  },
];

export function isEventThemeEnabled(): boolean {
  if (typeof window === "undefined") return true;
  const explicitDisabled = localStorage.getItem(EVENT_THEME_STORAGE_KEY) === "true";
  return !explicitDisabled;
}

export function setEventThemeEnabled(enabled: boolean) {
  if (typeof window === "undefined") return;
  if (enabled) {
    localStorage.setItem(EVENT_THEME_ENABLED_KEY, "true");
    localStorage.removeItem(EVENT_THEME_STORAGE_KEY);
  } else {
    localStorage.setItem(EVENT_THEME_STORAGE_KEY, "true");
    localStorage.removeItem(EVENT_THEME_ENABLED_KEY);
  }
  applyThemeAttributes(enabled ? getActiveEventThemeType() : "classic");
  window.dispatchEvent(new CustomEvent("vba-event-theme-changed", { detail: { enabled } }));
}

function normalizeTheme(t?: string | null): EventThemeType {
  if (!t) return "classic";
  if (t === "noel") return "christmas";
  if (t === "default") return "classic";
  if (
    t === "mid-autumn" ||
    t === "national-day" ||
    t === "christmas" ||
    t === "tet" ||
    t === "entrepreneur-day" ||
    t === "none"
  ) {
    return t as EventThemeType;
  }
  return "classic";
}

export function getCrmAppliedTheme(): EventThemeType {
  if (typeof window === "undefined") return "classic";
  try {
    const raw =
      localStorage.getItem("ceo1983_active_theme") ||
      localStorage.getItem("vba_crm_applied_theme") ||
      localStorage.getItem("vba_app_theme");
    return normalizeTheme(raw);
  } catch {
    return "classic";
  }
}

export function getActiveEventThemeType(): EventThemeType {
  if (typeof window === "undefined") return "classic";
  const crmTheme = getCrmAppliedTheme();
  return isEventThemeEnabled() ? crmTheme : "classic";
}

export async function syncThemeFromBackend() {
  if (typeof window === "undefined") return;
  try {
    const res = await fetchNestApi<{ themeId: EventThemeType; enabled: boolean }>("/public/active-theme");
    if (res?.themeId) {
      const normalized = normalizeTheme(res.themeId);
      setActiveEventThemeType(normalized);
      if (res.enabled !== undefined) {
        setEventThemeEnabled(res.enabled);
      }
    }
  } catch {
    // fallback
  }
}

export function setActiveEventThemeType(type: EventThemeType) {
  if (typeof window === "undefined") return;
  const crmId = type === "christmas" ? "noel" : type === "classic" ? "default" : type;
  try {
    localStorage.setItem(EVENT_THEME_TYPE_KEY, type);
    localStorage.setItem("ceo1983_active_theme", crmId);
    localStorage.setItem("vba_crm_applied_theme", crmId);
    localStorage.setItem("vba_app_theme", crmId);
    localStorage.setItem(EVENT_THEME_ENABLED_KEY, "true");
    localStorage.removeItem(EVENT_THEME_STORAGE_KEY);
  } catch {}
  applyThemeAttributes(type);
  window.dispatchEvent(new CustomEvent("vba-event-theme-changed", { detail: { type } }));
  window.dispatchEvent(new CustomEvent("ceo1983-theme-changed", { detail: crmId }));
  window.dispatchEvent(new Event("storage"));
}

function applyThemeAttributes(theme: EventThemeType) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.setAttribute("data-festival-theme", theme);
  const found = FESTIVAL_THEMES.find((t) => t.id === theme) || FESTIVAL_THEMES[0];
  root.style.setProperty("--festival-primary", found.primaryColor);
  root.style.setProperty("--festival-accent", found.accentColor);
}

/**
 * Seasonal Event Header Decorator
 * Renders distinct festival elements for Mid-Autumn, National Day 2/9, Christmas, Tet, or Entrepreneur Day.
 */
export function SeasonalEventHeader() {
  const [enabled, setEnabled] = useState(isEventThemeEnabled());
  const [themeType, setThemeType] = useState<EventThemeType>(getActiveEventThemeType());

  useEffect(() => {
    applyThemeAttributes(themeType);
    void syncThemeFromBackend();

    const handleThemeChange = () => {
      setEnabled(isEventThemeEnabled());
      const current = getActiveEventThemeType();
      setThemeType(current);
      applyThemeAttributes(current);
    };
    window.addEventListener("vba-event-theme-changed", handleThemeChange);
    window.addEventListener("ceo1983-theme-changed", handleThemeChange);
    window.addEventListener("storage", handleThemeChange);
    return () => {
      window.removeEventListener("vba-event-theme-changed", handleThemeChange);
      window.removeEventListener("ceo1983-theme-changed", handleThemeChange);
      window.removeEventListener("storage", handleThemeChange);
    };
  }, [themeType]);

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

  return null;
}

