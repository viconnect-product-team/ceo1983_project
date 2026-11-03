/**
 * CEO1983 COLOR THEME SYSTEM (Quy Chuẩn Nhận Diện 4 Dạng Màu Tiêu Chuẩn CEO 1983 - HanoiBA)
 * Tuân thủ Brandbook: https://ceo1983.brandbook.vn/ & BRAND ID Guidelines
 * Độc lập với CRM, tối ưu hiển thị Dark Mode & Light Mode
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
    badgeBg: "bg-amber-500/15 text-amber-400 border-amber-400/40",
    gradientPrimary: "linear-gradient(135deg, #0052CC 0%, #003B95 60%, #001D4A 100%)",
    gradientCard: "linear-gradient(135deg, #0E172A 0%, #14223E 100%)",
    darkSurface: "#0E172A",
    darkSurface2: "#14223E",
    darkBorder: "rgba(245, 158, 11, 0.32)",
    darkBorderSoft: "rgba(245, 158, 11, 0.18)",
    iconColor: "#F59E0B",
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
    badgeBg: "bg-orange-500/15 text-orange-400 border-orange-400/40",
    gradientPrimary: "linear-gradient(135deg, #2E3192 0%, #1E206A 60%, #19194D 100%)",
    gradientCard: "linear-gradient(135deg, #121638 0%, #1B1E4A 100%)",
    darkSurface: "#121638",
    darkSurface2: "#1B1E4A",
    darkBorder: "rgba(247, 148, 29, 0.35)",
    darkBorderSoft: "rgba(247, 148, 29, 0.20)",
    iconColor: "#F7941D",
    description: "Chuẩn màu Logo số 8 và tên gọi CEO 1983 theo tài liệu Brandbook. Sắc cam tượng trưng cho đổi mới sáng tạo và mũi tên tiên phong.",
    swatches: ["#2E3192", "#F7941D"],
  },
  {
    id: "obsidian-gold",
    name: "Dạ Tiệc & Vàng Kim Sang Trọng",
    subtitle: "Obsidian Black & Champagne Gold",
    tag: "💎 Thượng Lưu",
    primaryColor: "#0B0F19",
    primaryDeep: "#05070D",
    accentColor: "#D4AF37",
    accentLight: "#E5C07B",
    badgeBg: "bg-yellow-500/15 text-yellow-300 border-yellow-400/40",
    gradientPrimary: "linear-gradient(135deg, #1A1F2C 0%, #10141E 60%, #05070D 100%)",
    gradientCard: "linear-gradient(135deg, #0F1420 0%, #171E30 100%)",
    darkSurface: "#0F1420",
    darkSurface2: "#171E30",
    darkBorder: "rgba(212, 175, 55, 0.35)",
    darkBorderSoft: "rgba(212, 175, 55, 0.18)",
    iconColor: "#D4AF37",
    description: "Phong cách Dạ Tiệc Gala & Hội nghị Doanh nhân Thượng lưu. Tôn vinh vẻ đẹp vương giả, huyền bí và chiều sâu lãnh đạo.",
    swatches: ["#0B0F19", "#D4AF37"],
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
    badgeBg: "bg-red-500/15 text-red-400 border-red-400/40",
    gradientPrimary: "linear-gradient(135deg, #DC2626 0%, #991B1B 60%, #450A0A 100%)",
    gradientCard: "linear-gradient(135deg, #200D0D 0%, #301414 100%)",
    darkSurface: "#200D0D",
    darkSurface2: "#301414",
    darkBorder: "rgba(234, 179, 8, 0.35)",
    darkBorderSoft: "rgba(234, 179, 8, 0.20)",
    iconColor: "#EAB308",
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

export function applyCeo1983ColorTheme(themeId: Ceo1983ColorThemeId): void {
  if (typeof document === "undefined") return;
  const theme = CEO1983_COLOR_THEMES.find((t) => t.id === themeId) || CEO1983_COLOR_THEMES[0];
  const root = document.documentElement;

  // Gán data attribute trên cả root và body
  root.dataset.appColorTheme = theme.id;
  if (document.body) {
    document.body.dataset.appColorTheme = theme.id;
  }

  const bg =
    theme.id === "ruby-gold"
      ? "#140707"
      : theme.id === "heritage-orange"
      ? "#0A0D24"
      : theme.id === "obsidian-gold"
      ? "#05070D"
      : "#070D1A";

  const bg2 =
    theme.id === "ruby-gold"
      ? "#0B0303"
      : theme.id === "heritage-orange"
      ? "#060818"
      : theme.id === "obsidian-gold"
      ? "#020306"
      : "#050912";

  // Áp dụng biến CSS thời gian thực
  root.style.setProperty("--vba-bg", bg);
  root.style.setProperty("--vba-bg-2", bg2);
  root.style.setProperty("--vba-navy", theme.primaryColor);
  root.style.setProperty("--vba-navy-deep", theme.primaryDeep);
  root.style.setProperty("--vba-gold", theme.accentColor);
  root.style.setProperty("--vba-gold-2", theme.accentLight);
  root.style.setProperty("--vba-border", theme.darkBorder);
  root.style.setProperty("--vba-border-soft", theme.darkBorderSoft);
  root.style.setProperty("--vba-surface", theme.darkSurface);
  root.style.setProperty("--vba-surface-2", theme.darkSurface2);
  root.style.setProperty("--theme-icon-color", theme.iconColor);
  root.style.setProperty("--theme-primary-gradient", theme.gradientPrimary);
  root.style.setProperty("--theme-card-gradient", theme.gradientCard);
  root.style.setProperty("--bc-mobile-accent", theme.primaryColor);
  root.style.setProperty("--bc-mobile-accent-grad", theme.gradientPrimary);

  try {
    localStorage.setItem(COLOR_THEME_STORAGE_KEY, themeId);
    window.dispatchEvent(new CustomEvent(COLOR_THEME_EVENT, { detail: theme }));
  } catch {
    /* ignore */
  }
}

