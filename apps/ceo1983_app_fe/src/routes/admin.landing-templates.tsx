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
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/dashboard/AppShell";
import { PageHeader } from "@/components/dashboard/PageKit";
import { setActiveEventThemeType } from "@/components/member/SeasonalEventHeader";
import { fetchNestApi } from "@/lib/api-client";

export const Route = createFileRoute("/admin/landing-templates")({
  component: AdminThemeManagementPage,
});

export interface AppThemeItem {
  id: string;
  name: string;
  occasion: string;
  dateRange: string;
  tagline: string;
  description: string;
  primaryColor: string;
  accentColor: string;
  bgGradient: string;
  badgeTone: string;
  icon: any;
  previewBanner: string;
  features: string[];
}

export const APP_THEMES_CATALOG: AppThemeItem[] = [
  {
    id: "national-day",
    name: "Hào Khí Non Sông — Quốc Khánh 2/9",
    occasion: "Đại Lễ Quốc Khánh 2/9",
    dateRange: "25/08 - 05/09",
    tagline: "Sắc đỏ cờ hoa sao vàng thiêng liêng, niềm tự hào dân tộc và tinh thần cống hiến của Doanh nhân",
    description:
      "Tự động kích hoạt dải băng cờ đỏ sao vàng ở Header App, huy hiệu kỷ niệm 2/9 trên thẻ hội viên và lời chúc mừng từ Ban Chấp Hành.",
    primaryColor: "#DC2626",
    accentColor: "#FBBF24",
    bgGradient: "from-red-600 via-rose-700 to-amber-600",
    badgeTone: "bg-red-500/15 border-red-500/30 text-red-700 dark:text-red-400",
    icon: Flag,
    previewBanner: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80",
    features: [
      "Dải ruy băng Cờ đỏ Sao vàng tại Top Navigation",
      "Avatar hội viên có viền ánh vàng sao lấp lánh",
      "Lời chào đại lễ Quốc Khánh 2/9 trên màn hình chính",
      "Hiệu ứng pháo hoa chúc mừng khi mở App",
    ],
  },
  {
    id: "mid-autumn",
    name: "Đêm Trăng Rằm — Tết Trung Thu",
    occasion: "Tết Trung Thu (Rằm Tháng 8)",
    dateRange: "01/08 - 18/08 Âm lịch",
    tagline: "Đèn lồng ngũ sắc, ánh trăng tròn đoàn viên và lời chúc thịnh vượng trao gửi doanh nghiệp đối tác",
    description:
      "Giao diện đêm rằm thanh lịch với họa tiết đèn lồng, trăng vàng tỏa sáng và góc quà tặng kết nối B2B mùa trung thu.",
    primaryColor: "#0284C7",
    accentColor: "#F59E0B",
    bgGradient: "from-sky-900 via-indigo-900 to-amber-500",
    badgeTone: "bg-amber-500/15 border-amber-500/30 text-amber-700 dark:text-amber-400",
    icon: Moon,
    previewBanner: "https://images.unsplash.com/photo-1533230307683-938212131b79?auto=format&fit=crop&w=800&q=80",
    features: [
      "Đèn lồng truyền thống và vầng trăng rằm rạng ngời",
      "Bộ sưu tập quà tặng Trung thu B2B ưu đãi hội viên",
      "Lời chúc Đoàn Viên & Thịnh Vượng đến ban lãnh đạo",
      "Thiết kế ánh vàng kim sang trọng trên nền huyền bí",
    ],
  },
  {
    id: "tet",
    name: "Xuân Khởi Sắc — Tết Nguyên Đán",
    occasion: "Tết Cổ Truyền (Xuân Ất Tỵ)",
    dateRange: "20 Tháng Chạp - Mùng 10 Tết",
    tagline: "Mai vàng khoe sắc, đào thắm nở rộ, phong bao lì xì may mắn và vận hội kinh doanh hanh thông",
    description:
      "Không khí đón xuân tưng bừng với hiệu ứng hoa mai rơi, phong bao đỏ chúc phúc và tính năng lì xì số kết nối giao thương.",
    primaryColor: "#E11D48",
    accentColor: "#EAB308",
    bgGradient: "from-rose-600 via-red-600 to-yellow-500",
    badgeTone: "bg-rose-500/15 border-rose-500/30 text-rose-700 dark:text-rose-400",
    icon: Sparkles,
    previewBanner: "https://images.unsplash.com/photo-1512474932049-78ac69eed37c?auto=format&fit=crop&w=800&q=80",
    features: [
      "Cành đào phai & hoa mai vàng đong đưa nhẹ nhàng",
      "Lì xì số may mắn và lời chúc Tết từ Chủ tịch Hiệp hội",
      "Banner khai xuân kinh doanh đắc tài đắc lộc",
      "Huy hiệu Rồng vàng/Ất Tỵ vinh danh trên danh thiếp",
    ],
  },
  {
    id: "entrepreneur-day",
    name: "Vinh Quang Bản Lĩnh — Ngày Doanh Nhân 13/10",
    occasion: "Ngày Doanh Nhân Việt Nam 13/10",
    dateRange: "01/10 - 20/10",
    tagline: "Tôn vinh trí tuệ và tinh thần phụng sự của các nhà lãnh đạo Câu lạc bộ Doanh nhân 1983",
    description:
      "Tông màu thảm đỏ và huân chương vàng danh dự, vinh danh các doanh nghiệp tiêu biểu và thương vụ hợp tác xuất sắc.",
    primaryColor: "#D97706",
    accentColor: "#1E3A8A",
    bgGradient: "from-amber-600 via-yellow-600 to-slate-900",
    badgeTone: "bg-amber-500/15 border-amber-500/30 text-amber-700 dark:text-amber-400",
    icon: Award,
    previewBanner: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80",
    features: [
      "Bục vinh danh điện tử và Cúp vàng danh dự",
      "Khung viền doanh nhân tiêu biểu trên Danh thiếp số",
      "Thư chúc mừng từ Thường trực Hiệp hội",
      "Chuyên trang kết nối cơ hội kinh doanh đặc quyền",
    ],
  },
  {
    id: "noel",
    name: "Giáng Sinh Ấm Áp & Chào Năm Mới",
    occasion: "Mùa Giáng Sinh & New Year",
    dateRange: "15/12 - 05/01",
    tagline: "Không khí lễ hội mùa đông ấm áp, chuông ngân vang và đón chào năm mới tràn đầy hy vọng",
    description:
      "Hiệu ứng tuyết rơi nhẹ nhàng, cây thông Noel, chuông vàng lấp lánh và thư cảm ơn tổng kết hoạt động năm của Hiệp hội.",
    primaryColor: "#059669",
    accentColor: "#DC2626",
    bgGradient: "from-emerald-700 via-teal-800 to-rose-600",
    badgeTone: "bg-emerald-500/15 border-emerald-500/30 text-emerald-700 dark:text-emerald-400",
    icon: Gift,
    previewBanner: "https://images.unsplash.com/photo-1543258103-a62bdc069871?auto=format&fit=crop&w=800&q=80",
    features: [
      "Bông tuyết trắng rơi tinh khôi trên nền giao diện",
      "Chuông giáng sinh vàng kim và cây thông lung linh",
      "Thiệp chúc mừng Năm mới (New Year e-Card) cá nhân hóa",
      "Tổng kết hành trình kết nối của Doanh nhân trong năm",
    ],
  },
  {
    id: "default",
    name: "Luxury Gold & Royal Navy (Mặc Định)",
    occasion: "Tiêu Chuẩn Nhận Diện Thương Hiệu",
    dateRange: "Quanh năm",
    tagline: "Ngôn ngữ thiết kế nguyên bản sang trọng, ánh vàng đồng hoàng gia và xanh hải quân đĩnh đạc",
    description:
      "Giao diện chuẩn chỉ, tập trung tối đa vào hiệu năng kết nối, danh thiếp số chuyên nghiệp và hồ sơ doanh nghiệp.",
    primaryColor: "#EAB308",
    accentColor: "#0F172A",
    bgGradient: "from-amber-500 via-slate-900 to-slate-950",
    badgeTone: "bg-amber-500/15 border-amber-500/30 text-amber-700 dark:text-amber-400",
    icon: Sun,
    previewBanner: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80",
    features: [
      "Bộ nhận diện thương hiệu chuẩn CEO 1983",
      "Độ tương phản cao, tối ưu cho doanh nhân và đàm phán",
      "Danh thiếp số và thẻ hội viên hiển thị nguyên bản",
      "Không có hiệu ứng lễ hội để tối giản tuyệt đối",
    ],
  },
];

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

export function AdminThemeManagementPage() {
  const [activeThemeId, setActiveThemeIdState] = useState<string>("default");
  const [previewingTheme, setPreviewingTheme] = useState<AppThemeItem | null>(null);

  useEffect(() => {
    setActiveThemeIdState(getActiveAppThemeId());

    // Also fetch current active theme from backend API
    void fetchNestApi<{ themeId: string; enabled: boolean }>("/admin/active-theme")
      .then((res) => {
        if (res?.themeId) {
          const crmId = res.themeId === "christmas" ? "noel" : res.themeId === "classic" ? "default" : res.themeId;
          setActiveThemeIdState(crmId);
          setActiveAppThemeId(crmId);
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

  const activeTheme =
    APP_THEMES_CATALOG.find((t) => t.id === activeThemeId) || APP_THEMES_CATALOG[5];

  const handleApplyTheme = async (theme: AppThemeItem) => {
    const targetType = theme.id === "noel" ? "christmas" : theme.id === "default" ? "classic" : theme.id;
    setActiveEventThemeType(targetType as any);
    setActiveAppThemeId(theme.id);
    setActiveThemeIdState(theme.id);

    try {
      await fetchNestApi("/admin/active-theme", {
        method: "PUT",
        body: JSON.stringify({ themeId: targetType, enabled: true }),
      });
    } catch (e: any) {
      console.warn("Could not save active theme to backend:", e);
    }

    toast.success(`Đã kích hoạt thành công chủ đề "${theme.name}" cho App Hiệp hội!`, {
      description:
        "Tất cả hội viên mở App CEO 1983 sẽ thấy giao diện lễ hội, banner và màu sắc tương ứng.",
    });
  };

  return (
    <AppShell>
      <PageHeader
        title="Quản Lý Chủ Đề Lễ Hội (App Hiệp Hội)"
        subtitle="Thay đổi không gian chủ đề chào mừng các dịp lễ lớn (Quốc khánh 2/9, Trung thu, Tết Nguyên đán, Noel...) cho App Hiệp hội CEO 1983"
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleApplyTheme(APP_THEMES_CATALOG[5])}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-border bg-card text-foreground hover:bg-muted text-xs font-semibold shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Khôi phục Mặc định</span>
            </button>
          </div>
        }
      />

      <div className="space-y-6 pb-12">
        {/* Active Theme Spotlight Banner */}
        <div className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-background to-amber-500/5 p-6 shadow-sm">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  ĐANG KÍCH HOẠT TRÊN APP HIỆP HỘI
                </span>
                <span className="text-xs font-semibold text-amber-600 bg-amber-500/15 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                  {activeTheme.occasion}
                </span>
                <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">
                  {activeTheme.dateRange}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
                {activeTheme.name}
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {activeTheme.tagline}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setPreviewingTheme(activeTheme)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-border bg-card hover:bg-muted text-foreground text-xs font-bold transition shadow-xs"
              >
                <Eye className="w-4 h-4 text-amber-500" />
                <span>Xem chi tiết chủ đề</span>
              </button>
            </div>
          </div>
        </div>

        {/* Themes Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-foreground">
                Danh Sách Chủ Đề Lễ Hội & Sự Kiện Sẵn Có
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Nhấn "Áp dụng cho App" để toàn bộ người dùng app hiệp hội được chuyển sang không khí lễ hội ngay lập tức.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {APP_THEMES_CATALOG.map((theme) => {
              const isActive = theme.id === activeThemeId;
              const IconComp = theme.icon;

              return (
                <div
                  key={theme.id}
                  className={`group relative flex flex-col rounded-2xl border transition-all duration-200 overflow-hidden bg-card ${
                    isActive
                      ? "border-amber-500 shadow-md ring-2 ring-amber-500/20"
                      : "border-border hover:border-amber-500/50 hover:shadow-sm"
                  }`}
                >
                  {/* Theme Header Visual */}
                  <div className={`relative h-36 bg-gradient-to-r ${theme.bgGradient} p-4 flex flex-col justify-between overflow-hidden`}>
                    <div className="absolute inset-0 bg-black/20" />
                    <img
                      src={theme.previewBanner}
                      alt={theme.name}
                      className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-50"
                    />

                    <div className="relative z-10 flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 rounded-full bg-black/40 backdrop-blur-md px-2.5 py-1 text-[11px] font-bold text-white border border-white/20">
                        <Calendar className="w-3 h-3 text-amber-300" />
                        {theme.dateRange}
                      </span>
                      {isActive && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">
                          <Check className="w-3 h-3" /> Đang dùng
                        </span>
                      )}
                    </div>

                    <div className="relative z-10 flex items-center gap-2.5 text-white">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 backdrop-blur-md border border-white/30">
                        <IconComp className="h-5 w-5 text-amber-300" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-amber-200 uppercase tracking-wider">
                          {theme.occasion}
                        </p>
                        <h4 className="text-sm font-bold text-white leading-tight">
                          {theme.name}
                        </h4>
                      </div>
                    </div>
                  </div>

                  {/* Theme Info */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {theme.tagline}
                    </p>

                    <div className="space-y-1.5 pt-1 border-t border-border">
                      {theme.features.slice(0, 2).map((feat, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                          <CheckCircle2 className="w-3 h-3 text-amber-500 shrink-0" />
                          <span className="truncate">{feat}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setPreviewingTheme(theme)}
                        className="flex-1 rounded-xl border border-border bg-secondary/50 py-2 text-xs font-semibold text-foreground hover:bg-muted transition text-center"
                      >
                        Xem chi tiết
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApplyTheme(theme)}
                        disabled={isActive}
                        className={`flex-1 rounded-xl py-2 text-xs font-bold transition text-center shadow-xs ${
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
      </div>

      {/* Preview Modal */}
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
                className="rounded-lg p-1 text-muted-foreground hover:bg-secondary"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className={`rounded-xl bg-gradient-to-r ${previewingTheme.bgGradient} p-4 text-white space-y-2`}>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-200">
                {previewingTheme.occasion} ({previewingTheme.dateRange})
              </span>
              <h4 className="text-base font-black">{previewingTheme.name}</h4>
              <p className="text-xs text-white/90 leading-relaxed">
                {previewingTheme.description}
              </p>
            </div>

            <div className="space-y-2">
              <h5 className="text-xs font-bold text-foreground uppercase tracking-wider">
                Các thành phần thay đổi trên App:
              </h5>
              <div className="space-y-2">
                {previewingTheme.features.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground rounded-lg bg-muted/60 p-2.5">
                    <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-border">
              <button
                onClick={() => setPreviewingTheme(null)}
                className="rounded-xl border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted"
              >
                Đóng
              </button>
              <button
                onClick={() => {
                  handleApplyTheme(previewingTheme);
                  setPreviewingTheme(null);
                }}
                className="rounded-xl bg-amber-500 hover:bg-amber-600 px-5 py-2 text-xs font-bold text-white shadow-sm transition"
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
