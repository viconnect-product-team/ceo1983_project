/**
 * CEO1983 COLOR THEME SYSTEM (Quy Chuẩn Nhận Diện 3 Dạng Màu Tiêu Chuẩn CEO 1983 - HanoiBA)
 * Tuân thủ Brandbook: https://ceo1983.brandbook.vn/ & BRAND ID Guidelines
 * Độc lập với CRM, tối ưu hiển thị Dark Mode & Light Mode
 * Đồng bộ toàn diện 100% giao diện: Nút bấm, Icon, Bảng biểu, Navigation Bar & Header
 */

export type Ceo1983ColorThemeId =
  | "classic-navy"    // Dạng 1: Xanh Doanh Nhân (Navy Cổ Điển & Hổ Phách)
  | "dynamic-orange"  // Dạng 2: Cam Tiên Phong (Cam Năng Động & Lam Thẫm)
  | "crimson-red"     // Dạng 3: Đỏ Nhiệt Huyết (Đỏ Bứt Phá & Vàng Kim)
  | "royal-gold"      // Alias backward compatibility -> classic-navy
  | "heritage-orange" // Alias backward compatibility -> dynamic-orange
  | "obsidian-gold"   // Alias backward compatibility -> classic-navy
  | "ruby-gold";      // Alias backward compatibility -> crimson-red

export interface Ceo1983ColorTheme {
  id: Ceo1983ColorThemeId;
  name: string;
  subtitle: string;
  threeColors: [string, string, string]; // [Màu chính, Màu nền tối, Màu điểm nhấn]
  primaryColor: string;
  primaryDeep: string;
  accentColor: string;
  accentLight: string;
  lightBg: string;
  lightBorder: string;
  badgeBg: string;
  gradientPrimary: string;
  gradientCard: string;
  darkSurface: string;
  darkSurface2: string;
  darkBorder: string;
  darkBorderSoft: string;
  iconColor: string;
  swatches: [string, string, string];
}

export const CEO1983_COLOR_THEMES: Ceo1983ColorTheme[] = [
  {
    id: "classic-navy",
    name: "Xanh Doanh Nhân",
    subtitle: "Navy Cổ Điển & Hổ Phách",
    threeColors: ["#003B95", "#0A1128", "#F59E0B"],
    primaryColor: "#003B95",
    primaryDeep: "#001D4A",
    accentColor: "#F59E0B",
    accentLight: "#FBBF24",
    lightBg: "#EBF3FF",
    lightBorder: "#BFDBFE",
    badgeBg: "bg-blue-600/15 text-blue-600 dark:text-amber-400 border-blue-500/30",
    gradientPrimary: "linear-gradient(135deg, #0052CC 0%, #003B95 60%, #001D4A 100%)",
    gradientCard: "linear-gradient(135deg, #0A1128 0%, #14223E 100%)",
    darkSurface: "#0E172A",
    darkSurface2: "#14223E",
    darkBorder: "rgba(245, 158, 11, 0.35)",
    darkBorderSoft: "rgba(245, 158, 11, 0.20)",
    iconColor: "#003B95",
    swatches: ["#003B95", "#0A1128", "#F59E0B"],
  },
  {
    id: "dynamic-orange",
    name: "Cam Tiên Phong",
    subtitle: "Cam Năng Động & Lam Thẫm",
    threeColors: ["#EA580C", "#1E1B4B", "#3B82F6"],
    primaryColor: "#EA580C",
    primaryDeep: "#9A3412",
    accentColor: "#3B82F6",
    accentLight: "#60A5FA",
    lightBg: "#FFF7ED",
    lightBorder: "#FED7AA",
    badgeBg: "bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-400/40",
    gradientPrimary: "linear-gradient(135deg, #EA580C 0%, #C2410C 60%, #9A3412 100%)",
    gradientCard: "linear-gradient(135deg, #181126 0%, #251B3D 100%)",
    darkSurface: "#181126",
    darkSurface2: "#251B3D",
    darkBorder: "rgba(234, 88, 12, 0.35)",
    darkBorderSoft: "rgba(234, 88, 12, 0.20)",
    iconColor: "#EA580C",
    swatches: ["#EA580C", "#1E1B4B", "#3B82F6"],
  },
  {
    id: "crimson-red",
    name: "Đỏ Nhiệt Huyết",
    subtitle: "Đỏ Bứt Phá & Vàng Kim",
    threeColors: ["#DC2626", "#18181B", "#FBBF24"],
    primaryColor: "#DC2626",
    primaryDeep: "#7F1D1D",
    accentColor: "#FBBF24",
    accentLight: "#FDE047",
    lightBg: "#FEF2F2",
    lightBorder: "#FECACA",
    badgeBg: "bg-red-500/15 text-red-600 dark:text-amber-400 border-red-400/40",
    gradientPrimary: "linear-gradient(135deg, #EF4444 0%, #DC2626 60%, #7F1D1D 100%)",
    gradientCard: "linear-gradient(135deg, #1C1113 0%, #2A171B 100%)",
    darkSurface: "#18181B",
    darkSurface2: "#27272A",
    darkBorder: "rgba(251, 191, 36, 0.35)",
    darkBorderSoft: "rgba(251, 191, 36, 0.20)",
    iconColor: "#DC2626",
    swatches: ["#DC2626", "#18181B", "#FBBF24"],
  },
];

export const COLOR_THEME_STORAGE_KEY = "ceo1983_app_color_theme";
export const COLOR_THEME_EVENT = "ceo1983:color_theme_changed";

export function normalizeThemeId(saved: string | null): Ceo1983ColorThemeId {
  if (saved === "classic-navy" || saved === "royal-gold" || saved === "obsidian-gold") {
    return "classic-navy";
  }
  if (saved === "dynamic-orange" || saved === "heritage-orange") {
    return "dynamic-orange";
  }
  if (saved === "crimson-red" || saved === "ruby-gold") {
    return "crimson-red";
  }
  return "classic-navy";
}

export function getActiveCeo1983ColorThemeId(): Ceo1983ColorThemeId {
  if (typeof window === "undefined") return "classic-navy";
  try {
    const saved = localStorage.getItem(COLOR_THEME_STORAGE_KEY);
    return normalizeThemeId(saved);
  } catch {
    /* ignore */
  }
  return "classic-navy";
}

export function getActiveCeo1983ColorTheme(): Ceo1983ColorTheme {
  const id = getActiveCeo1983ColorThemeId();
  return CEO1983_COLOR_THEMES.find((t) => t.id === id) || CEO1983_COLOR_THEMES[0];
}

/**
 * Cập nhật stylesheet toàn cục để đổi màu 100% app khi chọn Dạng màu tiêu chuẩn
 * Tuyệt đối không can thiệp ép trắng recursive lên thẻ con trong Light Mode
 */
function injectGlobalThemeOverride(theme: Ceo1983ColorTheme): void {
  if (typeof document === "undefined") return;

  const styleId = "ceo1983-dynamic-theme-override";
  let styleTag = document.getElementById(styleId) as HTMLStyleElement | null;
  if (!styleTag) {
    styleTag = document.createElement("style");
    styleTag.id = styleId;
    document.head.appendChild(styleTag);
  }

  const primary = theme.primaryColor;
  const primaryDeep = theme.primaryDeep;
  const accent = theme.accentColor;
  const lightBg = theme.lightBg;
  const lightBorder = theme.lightBorder;
  const gradientPrimary = theme.gradientPrimary;
  const darkSurface = theme.darkSurface;
  const darkSurface2 = theme.darkSurface2;
  const darkBorder = theme.darkBorder;
  const darkBorderSoft = theme.darkBorderSoft;

  styleTag.innerHTML = `
    /* ========================================================== */
    /* CEO1983 UNIVERSAL BRAND THEME OVERRIDE (100% APP SYNC)     */
    /* Theme: ${theme.name} (${theme.id})                        */
    /* ========================================================== */
    :root,
    html,
    body {
      --primary: ${primary} !important;
      --primary-foreground: #FFFFFF !important;
      --ring: ${primary} !important;
      --accent: ${accent} !important;
      --accent-foreground: #FFFFFF !important;
      --border: ${lightBorder} !important;
      --vba-navy: ${primary} !important;
      --vba-navy-deep: ${primaryDeep} !important;
      --vba-gold: ${accent} !important;
      --vba-gold-2: ${theme.accentLight} !important;
      --vba-border: ${lightBorder} !important;
      --theme-icon-color: ${primary} !important;
      --theme-primary-gradient: ${gradientPrimary} !important;
      --bc-mobile-accent: ${primary} !important;
      --bc-mobile-accent-grad: ${gradientPrimary} !important;
      --vba-theme-primary: ${primary} !important;
      --vba-theme-light-bg: ${lightBg} !important;
      --vba-theme-light-border: ${lightBorder} !important;
    }

    /* Đổi biến CSS đồng bộ khi ở Dark Mode */
    html.dark,
    .dark {
      --primary: ${primary} !important;
      --primary-foreground: #FFFFFF !important;
      --ring: ${accent} !important;
      --accent: ${accent} !important;
      --accent-foreground: #FFFFFF !important;
      --card: ${darkSurface} !important;
      --popover: ${darkSurface} !important;
      --border: ${darkBorder} !important;
      --input: ${darkBorderSoft} !important;
      --vba-border: ${darkBorder} !important;
      --vba-surface: ${darkSurface} !important;
      --vba-surface-2: ${darkSurface2} !important;
    }

    /* 1. Recolor All Primary Buttons & Interactive Badges */
    [class*="bg-[#003B95]" i],
    [class*="bg-[#002B66]" i],
    [class*="bg-[#0052CC]" i],
    [class*="bg-[#1E3A8A]" i],
    [class*="bg-[#1F3864]" i],
    .bg-primary,
    .vba-btn-primary,
    .vba-active-tab {
      background-color: ${primary} !important;
      background-image: none !important;
    }

    /* Chỉ ép text trắng trên các nút bấm hoặc thẻ pill thực sự có nền primary */
    button[class*="bg-[#003B95]" i],
    button[class*="bg-[#002B66]" i],
    button[class*="bg-[#1E3A8A]" i],
    button.bg-primary,
    a.bg-primary,
    .vba-btn-primary {
      color: #FFFFFF !important;
    }

    /* 2. Recolor All Primary Texts */
    [class*="text-[#003B95]" i],
    [class*="text-[#002B66]" i],
    [class*="text-[#0052CC]" i],
    [class*="text-[#1E3A8A]" i],
    [class*="text-[#1F3864]" i],
    .text-primary {
      color: ${primary} !important;
    }

    /* 3. Recolor All Borders */
    [class*="border-[#003B95]" i],
    [class*="border-[#002B66]" i],
    [class*="border-[#0052CC]" i],
    [class*="border-[#1E3A8A]" i],
    [class*="border-[#1F3864]" i],
    .border-primary {
      border-color: ${primary} !important;
    }

    /* 4. Recolor Rings & Outlines */
    [class*="ring-[#003B95]" i],
    [class*="ring-[#002B66]" i],
    [class*="ring-[#1E3A8A]" i],
    .ring-primary {
      --tw-ring-color: ${primary} !important;
    }

    /* 5. Recolor SVG Fills and Strokes across all charts, gauges and icons */
    svg[stroke="#003B95" i],
    svg[stroke="#002B66" i],
    svg[stroke="#1E3A8A" i],
    circle[stroke="#003B95" i],
    rect[stroke="#003B95" i],
    path[stroke="#003B95" i] {
      stroke: ${primary} !important;
    }
    svg[fill="#003B95" i],
    svg[fill="#002B66" i],
    circle[fill="#003B95" i],
    rect[fill="#003B95" i],
    path[fill="#003B95" i] {
      fill: ${primary} !important;
    }

    /* 6. Recolor Soft Tints in Light Mode */
    html:not(.dark) [class*="bg-blue-50"] {
      background-color: ${lightBg} !important;
    }
    html:not(.dark) [class*="border-blue-200"],
    html:not(.dark) [class*="border-blue-100"] {
      border-color: ${lightBorder} !important;
    }

    /* 7. Recolor Gradients */
    [class*="from-[#003B95]" i] {
      --tw-gradient-from: ${primary} var(--tw-gradient-from-position) !important;
      --tw-gradient-to: ${primaryDeep} var(--tw-gradient-to-position) !important;
      --tw-gradient-stops: var(--tw-gradient-from), ${primaryDeep} var(--tw-gradient-to-position) !important;
    }
    [class*="to-[#003B95]" i] {
      --tw-gradient-to: ${primary} var(--tw-gradient-to-position) !important;
    }

    /* 8. Bottom Navigation Bar Active Indicator & QR Center Button */
    .vba-bottom-bar button span[class*="rounded-full"][class*="shadow"] {
      background: ${gradientPrimary} !important;
      box-shadow: 0 4px 14px ${primary}60 !important;
    }

    /* 9. Dark Mode Button, Border & Text Theme Sync */
    html.dark button.bg-primary,
    html.dark .vba-btn-primary {
      background-color: ${primary} !important;
      color: #FFFFFF !important;
    }
    html.dark .border-primary {
      border-color: ${darkBorder} !important;
    }
  `;
}

export function applyCeo1983ColorTheme(themeId: Ceo1983ColorThemeId): void {
  if (typeof document === "undefined") return;
  const normalizedId = normalizeThemeId(themeId);
  const theme = CEO1983_COLOR_THEMES.find((t) => t.id === normalizedId) || CEO1983_COLOR_THEMES[0];
  const root = document.documentElement;

  // Gán data attribute trên cả root và body
  root.dataset.appColorTheme = theme.id;
  if (document.body) {
    document.body.dataset.appColorTheme = theme.id;
  }

  const isDark = root.classList.contains("dark") || (typeof localStorage !== "undefined" && localStorage.getItem("theme") === "dark");

  const bg = isDark ? theme.threeColors[1] : "#FFFFFF";
  const bg2 = isDark ? theme.darkSurface : "#F8FAFC";
  const surface = isDark ? theme.darkSurface : "#FFFFFF";
  const surface2 = isDark ? theme.darkSurface2 : "#F8FAFC";
  const textColor = isDark ? "#FFFFFF" : "#0F172A";
  const textMuted = isDark ? "#94A3B8" : "#475569";

  // Áp dụng biến CSS thời gian thực
  root.style.setProperty("--vba-bg", bg);
  root.style.setProperty("--vba-bg-2", bg2);
  root.style.setProperty("--vba-surface", surface);
  root.style.setProperty("--vba-surface-2", surface2);
  root.style.setProperty("--vba-text", textColor);
  root.style.setProperty("--vba-text-muted", textMuted);
  root.style.setProperty("--vba-navy", theme.primaryColor);
  root.style.setProperty("--vba-navy-deep", theme.primaryDeep);
  root.style.setProperty("--vba-gold", theme.accentColor);
  root.style.setProperty("--vba-gold-2", theme.accentLight);
  root.style.setProperty("--vba-border", isDark ? theme.darkBorder : theme.lightBorder);
  root.style.setProperty("--vba-border-soft", isDark ? theme.darkBorderSoft : theme.lightBorder);
  root.style.setProperty("--theme-icon-color", theme.iconColor);
  root.style.setProperty("--theme-primary-gradient", theme.gradientPrimary);
  root.style.setProperty("--theme-card-gradient", theme.gradientCard);
  root.style.setProperty("--bc-mobile-accent", theme.primaryColor);
  root.style.setProperty("--bc-mobile-accent-grad", theme.gradientPrimary);

  // Kích hoạt engine style override để đổi màu 100% app
  injectGlobalThemeOverride(theme);

  try {
    localStorage.setItem(COLOR_THEME_STORAGE_KEY, theme.id);
    window.dispatchEvent(new CustomEvent(COLOR_THEME_EVENT, { detail: theme }));
  } catch {
    /* ignore */
  }
}
