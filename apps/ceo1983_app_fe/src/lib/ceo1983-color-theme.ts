/**
 * CEO1983 COLOR THEME SYSTEM (Quy Chuẩn Nhận Diện 4 Dạng Màu Tiêu Chuẩn CEO 1983 - HanoiBA)
 * Tuân thủ Brandbook: https://ceo1983.brandbook.vn/ & BRAND ID Guidelines
 * Độc lập với CRM, tối ưu hiển thị Dark Mode & Light Mode
 * Đồng bộ toàn diện 100% giao diện: Nút bấm, Icon, Bảng biểu, Navigation Bar & Header
 */

export type Ceo1983ColorThemeId =
  | "royal-gold"      // Dạng 1: Xanh Cobalt Hoàng Gia & Vàng Hổ Phách (Cốt Lõi)
  | "heritage-orange" // Dạng 2: Xanh Di Sản & Cam Tiên Phong (Chuẩn Logo Brandbook)
  | "obsidian-gold"   // Dạng 3: Đen Huyền Bí & Vàng Kim Dạ Tiệc (Gala Thượng Lưu)
  | "ruby-gold";      // Dạng 4: Đỏ Ruby Khởi Sắc & Vàng Hoàng Kim (Tiên Phong Đột Phá)

export interface Ceo1983ColorTheme {
  id: Ceo1983ColorThemeId;
  name: string;
  subtitle: string;
  tag: string;
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
  description: string;
  swatches: [string, string];
}

export const CEO1983_COLOR_THEMES: Ceo1983ColorTheme[] = [
  {
    id: "royal-gold",
    name: "Hoàng Gia & Hổ Phách",
    subtitle: "Royal Cobalt Navy & Amber Gold",
    tag: "👑 Cốt Lõi",
    primaryColor: "#003B95",
    primaryDeep: "#001D4A",
    accentColor: "#F59E0B",
    accentLight: "#FBBF24",
    lightBg: "#EBF3FF",
    lightBorder: "#BFDBFE",
    badgeBg: "bg-amber-500/15 text-amber-500 border-amber-400/40",
    gradientPrimary: "linear-gradient(135deg, #0052CC 0%, #003B95 60%, #001D4A 100%)",
    gradientCard: "linear-gradient(135deg, #0E172A 0%, #14223E 100%)",
    darkSurface: "#0E172A",
    darkSurface2: "#14223E",
    darkBorder: "rgba(245, 158, 11, 0.32)",
    darkBorderSoft: "rgba(245, 158, 11, 0.18)",
    iconColor: "#003B95",
    description: "Nhận diện cốt lõi của CLB CEO 1983 - HanoiBA. Thể hiện phong thái đĩnh đạc, uy quyền và kết nối thịnh vượng.",
    swatches: ["#003B95", "#F59E0B"],
  },
  {
    id: "heritage-orange",
    name: "Di Sản & Cam Tiên Phong",
    subtitle: "Heritage Navy & Dynamic Brand Orange",
    tag: "🎯 Chuẩn Logo",
    primaryColor: "#2E3192", // RGB 46, 49, 146 chuẩn Brandbook
    primaryDeep: "#19194D",
    accentColor: "#F7941D", // RGB 247, 148, 29 chuẩn Brandbook
    accentLight: "#F8A74B",
    lightBg: "#EEF2FF",
    lightBorder: "#C7D2FE",
    badgeBg: "bg-orange-500/15 text-orange-500 border-orange-400/40",
    gradientPrimary: "linear-gradient(135deg, #2E3192 0%, #1E206A 60%, #19194D 100%)",
    gradientCard: "linear-gradient(135deg, #121638 0%, #1B1E4A 100%)",
    darkSurface: "#121638",
    darkSurface2: "#1B1E4A",
    darkBorder: "rgba(247, 148, 29, 0.35)",
    darkBorderSoft: "rgba(247, 148, 29, 0.20)",
    iconColor: "#2E3192",
    description: "Chuẩn màu Logo số 8 và tên gọi CEO 1983 theo tài liệu Brandbook. Sắc cam tượng trưng cho đổi mới sáng tạo và mũi tên tiên phong.",
    swatches: ["#2E3192", "#F7941D"],
  },
  {
    id: "obsidian-gold",
    name: "Dạ Tiệc & Vàng Kim Sang Trọng",
    subtitle: "Obsidian Black & Champagne Gold",
    tag: "💎 Thượng Lưu",
    primaryColor: "#0F172A",
    primaryDeep: "#05070D",
    accentColor: "#D4AF37",
    accentLight: "#E5C07B",
    lightBg: "#F8FAFC",
    lightBorder: "#CBD5E1",
    badgeBg: "bg-yellow-500/15 text-yellow-500 border-yellow-400/40",
    gradientPrimary: "linear-gradient(135deg, #1E293B 0%, #0F172A 60%, #05070D 100%)",
    gradientCard: "linear-gradient(135deg, #0F1420 0%, #171E30 100%)",
    darkSurface: "#0F1420",
    darkSurface2: "#171E30",
    darkBorder: "rgba(212, 175, 55, 0.35)",
    darkBorderSoft: "rgba(212, 175, 55, 0.18)",
    iconColor: "#0F172A",
    description: "Phong cách Dạ Tiệc Gala & Hội nghị Doanh nhân Thượng lưu. Tôn vinh vẻ đẹp vương giả, huyền bí và chiều sâu lãnh đạo.",
    swatches: ["#0F172A", "#D4AF37"],
  },
  {
    id: "ruby-gold",
    name: "Khởi Sắc & Vàng Hoàng Kim",
    subtitle: "Prestige Ruby Red & Imperial Gold",
    tag: "🔥 Đột Phá",
    primaryColor: "#991B1B",
    primaryDeep: "#450A0A",
    accentColor: "#EAB308",
    accentLight: "#FDE047",
    lightBg: "#FEF2F2",
    lightBorder: "#FECACA",
    badgeBg: "bg-red-500/15 text-red-500 border-red-400/40",
    gradientPrimary: "linear-gradient(135deg, #DC2626 0%, #991B1B 60%, #450A0A 100%)",
    gradientCard: "linear-gradient(135deg, #200D0D 0%, #301414 100%)",
    darkSurface: "#200D0D",
    darkSurface2: "#301414",
    darkBorder: "rgba(234, 179, 8, 0.35)",
    darkBorderSoft: "rgba(234, 179, 8, 0.20)",
    iconColor: "#991B1B",
    description: "Khí chất chiến thắng, năng lượng bứt phá và may mắn. Rất thích hợp cho các dịp Caravan, Đại hội và Lễ kỷ niệm đặc biệt.",
    swatches: ["#991B1B", "#EAB308"],
  },
];

export const COLOR_THEME_STORAGE_KEY = "ceo1983_app_color_theme";
export const COLOR_THEME_EVENT = "ceo1983:color_theme_changed";

export function getActiveCeo1983ColorThemeId(): Ceo1983ColorThemeId {
  if (typeof window === "undefined") return "royal-gold";
  try {
    const saved = localStorage.getItem(COLOR_THEME_STORAGE_KEY) as Ceo1983ColorThemeId;
    if (CEO1983_COLOR_THEMES.some((t) => t.id === saved)) {
      return saved;
    }
  } catch {
    /* ignore */
  }
  return "royal-gold";
}

export function getActiveCeo1983ColorTheme(): Ceo1983ColorTheme {
  const id = getActiveCeo1983ColorThemeId();
  return CEO1983_COLOR_THEMES.find((t) => t.id === id) || CEO1983_COLOR_THEMES[0];
}

/**
 * Cập nhật style sheet toàn cục để đổi màu 100% app khi chọn Dạng màu tiêu chuẩn
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
      --vba-navy: ${primary} !important;
      --vba-navy-deep: ${primaryDeep} !important;
      --vba-gold: ${accent} !important;
      --vba-gold-2: ${theme.accentLight} !important;
      --theme-icon-color: ${primary} !important;
      --theme-primary-gradient: ${gradientPrimary} !important;
      --bc-mobile-accent: ${primary} !important;
      --bc-mobile-accent-grad: ${gradientPrimary} !important;
      --vba-theme-primary: ${primary} !important;
      --vba-theme-light-bg: ${lightBg} !important;
      --vba-theme-light-border: ${lightBorder} !important;
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

    /* Đảm bảo text và icon trên nền màu thương hiệu luôn là TRẮNG TUYỆT ĐỐI */
    [class*="bg-[#003B95]" i],
    [class*="bg-[#002B66]" i],
    [class*="bg-[#0052CC]" i],
    [class*="bg-[#1E3A8A]" i],
    [class*="bg-[#1F3864]" i],
    .bg-primary,
    .vba-btn-primary {
      color: #FFFFFF !important;
    }
    [class*="bg-[#003B95]" i] *:not([class*="bg-"]):not([class*="text-amber"]):not([class*="text-cyan"]),
    [class*="bg-[#002B66]" i] *:not([class*="bg-"]):not([class*="text-amber"]):not([class*="text-cyan"]),
    [class*="bg-[#1E3A8A]" i] *:not([class*="bg-"]):not([class*="text-amber"]):not([class*="text-cyan"]),
    .bg-primary *:not([class*="bg-"]):not([class*="text-amber"]):not([class*="text-cyan"]),
    .vba-btn-primary *:not([class*="bg-"]) {
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

    /* 5. Recolor SVG Fills and Strokes */
    svg[stroke="#003B95" i],
    svg[stroke="#002B66" i],
    svg[stroke="#1E3A8A" i] {
      stroke: ${primary} !important;
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
  `;
}

export function applyCeo1983ColorTheme(themeId: Ceo1983ColorThemeId): void {
  if (typeof document === "undefined") return;
  const theme = CEO1983_COLOR_THEMES.find((t) => t.id === themeId) || CEO1983_COLOR_THEMES[0];
  const root = document.documentElement;

  // Gán data attribute trên cả root và body
  root.dataset.appColorTheme = theme.id;
  if (document.body) {
    document.body.dataset.appColorTheme = theme.id;
  }

  const isDark = root.classList.contains("dark") || (typeof localStorage !== "undefined" && localStorage.getItem("theme") === "dark");

  const bg = isDark
    ? (theme.id === "ruby-gold"
        ? "#140707"
        : theme.id === "heritage-orange"
        ? "#0A0D24"
        : theme.id === "obsidian-gold"
        ? "#05070D"
        : "#070D1A")
    : "#FFFFFF";

  const bg2 = isDark
    ? (theme.id === "ruby-gold"
        ? "#0B0303"
        : theme.id === "heritage-orange"
        ? "#060818"
        : theme.id === "obsidian-gold"
        ? "#020306"
        : "#050912")
    : "#F8FAFC";

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
  root.style.setProperty("--vba-border", theme.darkBorder);
  root.style.setProperty("--vba-border-soft", theme.darkBorderSoft);
  root.style.setProperty("--theme-icon-color", theme.iconColor);
  root.style.setProperty("--theme-primary-gradient", theme.gradientPrimary);
  root.style.setProperty("--theme-card-gradient", theme.gradientCard);
  root.style.setProperty("--bc-mobile-accent", theme.primaryColor);
  root.style.setProperty("--bc-mobile-accent-grad", theme.gradientPrimary);

  // Kích hoạt engine style override để đổi màu 100% app
  injectGlobalThemeOverride(theme);

  try {
    localStorage.setItem(COLOR_THEME_STORAGE_KEY, themeId);
    window.dispatchEvent(new CustomEvent(COLOR_THEME_EVENT, { detail: theme }));
  } catch {
    /* ignore */
  }
}
