import React, { useState, useEffect } from "react";
import {
  Globe,
  Palette,
  Layout,
  BarChart3,
  Award,
  Share2,
  Phone,
  Mail,
  Building2,
  Sparkles,
  Save,
  RotateCcw,
  ExternalLink,
  Plus,
  Trash2,
  CheckCircle2,
  Eye,
  Sliders,
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { useServerData } from "@/hooks/use-server-data";
import {
  getActiveAssociationFn,
  getAssociationBrandingFn,
  updateAssociationBrandingFn,
  type ActiveAssociation,
} from "@/lib/associations.functions";

export const LANDING_CONFIG_STORAGE_KEY = "ceo1983_landing_web_config";

export interface LandingMetricItem {
  id: string;
  label: string;
  value: string;
  sub: string;
}

export interface LandingBenefitItem {
  id: string;
  title: string;
  desc: string;
  iconName: string;
}

export interface LandingWebConfig {
  // 1. Nhận diện & thương hiệu
  orgName: string;
  tagline: string;
  about: string;
  logoUrl: string;
  faviconUrl: string;
  brandPrimary: string;
  isPublished: boolean;

  // 2. Hero Banner & CTAs
  heroBadge: string;
  heroTitle: string;
  heroSubtitle: string;
  heroBannerUrl: string;
  cta1Text: string;
  cta1Link: string;
  cta2Text: string;
  cta2Link: string;

  // 3. Số liệu thống kê động
  metrics: LandingMetricItem[];

  // 4. Quyền lợi hội viên
  benefits: LandingBenefitItem[];

  // 5. Cấu hình SEO & OpenGraph
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  ogImageUrl: string;

  // 6. Liên hệ & Mạng xã hội
  headquarters: string;
  hotline: string;
  contactEmail: string;
  facebookUrl: string;
  zaloOaUrl: string;
  youtubeUrl: string;
}

export const DEFAULT_LANDING_CONFIG: LandingWebConfig = {
  orgName: "CLB Doanh Nhân CEO 1983 (HanoiBA)",
  tagline: "Gắn kết doanh nhân — Nâng tầm giá trị thương hiệu",
  about:
    "Cộng đồng kết nối giao thương, xúc tiến thương mại và nâng tầm năng lực quản trị cho các doanh nhân sinh năm 1983 trực thuộc Hiệp Hội Doanh Nghiệp Trẻ Hà Nội (HanoiBA).",
  logoUrl: "/ceo1983-emblem-8.png",
  faviconUrl: "/favicon.ico",
  brandPrimary: "#003B95",
  isPublished: true,

  heroBadge: "HỆ SINH THÁI DOANH NHÂN HANOIBA",
  heroTitle: "CỘNG ĐỒNG DOANH NHÂN CEO 1983 TIÊN PHONG",
  heroSubtitle:
    "Nền tảng số hóa kết nối giao thương B2B, hợp tác chiến lược, chia sẻ tri thức quản trị và xúc tiến đầu tư quy mô toàn quốc.",
  heroBannerUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1600&auto=format&fit=crop&q=80",
  cta1Text: "Mở App Hội Viên",
  cta1Link: "/association",
  cta2Text: "Đăng Ký Gia Nhập",
  cta2Link: "/association/register",

  metrics: [
    { id: "m-1", label: "Hội viên chính thức", value: "500+", sub: "Doanh nhân chủ doanh nghiệp" },
    { id: "m-2", label: "Giá trị giao thương", value: "1.500+ Tỷ", sub: "Doanh số hợp tác xúc tiến B2B" },
    { id: "m-3", label: "Sự kiện & Hội nghị", value: "60+", sub: "Diễn đàn, Gala, Cafe Doanh nhân" },
    { id: "m-4", label: "Ban Chuyên Môn", value: "12+", sub: "Các ban chuyên trách hỗ trợ hội viên" },
  ],

  benefits: [
    {
      id: "b-1",
      title: "Thẻ Hội Viên VIP Số & NFC",
      desc: "Định danh doanh nhân chuẩn quốc tế, tích hợp mã QR động, chip NFC và đồng bộ Apple Wallet & Google Wallet.",
      iconName: "IdCard",
    },
    {
      id: "b-2",
      title: "Sàn Giao Thương B2B Đa Ngành",
      desc: "Đăng tải nhu cầu mua - bán - tìm kiếm đối tác. Hệ thống AI tự động phân tích và kết nối cơ hội kinh doanh phù hợp.",
      iconName: "Handshake",
    },
    {
      id: "b-3",
      title: "Check-in Sự Kiện & Hội Thảo 1s",
      desc: "Đăng ký tham dự diễn đàn kinh tế, các buổi giao lưu văn hóa, gala dinner và check-in tự động qua mã QR bảo mật.",
      iconName: "QrCode",
    },
    {
      id: "b-4",
      title: "Đặc Quyền Đối Tác & Tài Trợ",
      desc: "Ưu đãi dịch vụ khách sạn, ngân hàng, viễn thông và cơ hội tiếp cận nguồn vốn cũng như tài trợ chiến lược độc quyền.",
      iconName: "Award",
    },
  ],

  metaTitle: "CLB Doanh Nhân CEO 1983 | Nền Tảng Số Hóa HanoiBA",
  metaDescription:
    "Cổng thông tin và ứng dụng chính thức của CLB Doanh Nhân CEO 1983 trực thuộc Hội Doanh Nghiệp Trẻ Hà Nội HanoiBA.",
  metaKeywords: "CEO 1983, HanoiBA, Doanh nhân 1983, Giao thương B2B, Hội doanh nghiệp trẻ Hà Nội",
  ogImageUrl: "/ceo1983-emblem-8.png",

  headquarters: "Tòa nhà HanoiBA, Quận Cầu Giấy, TP. Hà Nội",
  hotline: "0983 198 383",
  contactEmail: "contact@ceo1983.vn",
  facebookUrl: "https://facebook.com/ceo1983hanoiba",
  zaloOaUrl: "https://zalo.me/ceo1983",
  youtubeUrl: "https://youtube.com/@ceo1983",
};

export function LandingWebManager() {
  const fetchActive = useServerFn(getActiveAssociationFn);
  const fetchBranding = useServerFn(getAssociationBrandingFn);
  const saveBranding = useServerFn(updateAssociationBrandingFn);

  const { data: assoc } = useServerData<ActiveAssociation | null>(() => fetchActive(), null);
  const associationId = assoc?.associationId ?? null;

  // Active sub-tab
  const [activeTab, setActiveTab] = useState<
    "branding" | "hero" | "metrics" | "benefits" | "seo" | "contact"
  >("branding");

  // State cấu hình Landing Web
  const [config, setConfig] = useState<LandingWebConfig>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(LANDING_CONFIG_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          return { ...DEFAULT_LANDING_CONFIG, ...parsed };
        }
      } catch {}
    }
    return DEFAULT_LANDING_CONFIG;
  });

  const [saving, setSaving] = useState(false);

  // Sync từ Branding API
  useEffect(() => {
    if (!associationId) return;
    let active = true;
    fetchBranding({ data: { associationId } })
      .then((b) => {
        if (!active || !b) return;
        setConfig((prev) => ({
          ...prev,
          brandPrimary: b.brandPrimary || prev.brandPrimary,
          tagline: b.tagline || prev.tagline,
          about: b.about || prev.about,
          contactEmail: b.contactEmail || prev.contactEmail,
          isPublished: b.landingPublished ?? prev.isPublished,
        }));
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [associationId, fetchBranding]);

  // Handle lưu cấu hình
  const handleSave = async () => {
    setSaving(true);
    try {
      // 1. Lưu LocalStorage & dispatch event
      if (typeof window !== "undefined") {
        localStorage.setItem(LANDING_CONFIG_STORAGE_KEY, JSON.stringify(config));
        window.dispatchEvent(
          new CustomEvent("ceo1983_landing_config_updated", { detail: config })
        );
      }

      // 2. Gửi lên Branding Server API
      if (associationId) {
        await saveBranding({
          data: {
            associationId,
            brandPrimary: /^#[0-9a-fA-F]{6}$/.test(config.brandPrimary) ? config.brandPrimary : null,
            tagline: config.tagline.trim() || null,
            about: config.about.trim() || null,
            contactEmail: config.contactEmail.trim() || null,
            landingPublished: config.isPublished,
          },
        });
      }

      toast.success("Đã lưu và xuất bản cấu hình Landing Web thành công!");
    } catch (err: any) {
      toast.error(err?.message || "Lỗi khi lưu cấu hình Landing Web!");
    } finally {
      setSaving(false);
    }
  };

  // Khôi phục mặc định
  const handleReset = () => {
    if (confirm("Bạn có chắc chắn muốn khôi phục toàn bộ cài đặt Landing Web về mặc định?")) {
      setConfig(DEFAULT_LANDING_CONFIG);
      localStorage.setItem(LANDING_CONFIG_STORAGE_KEY, JSON.stringify(DEFAULT_LANDING_CONFIG));
      toast.info("Đã khôi phục cài đặt Landing Web về mặc định.");
    }
  };

  // Thao tác với số liệu thống kê động
  const handleAddMetric = () => {
    const newMetric: LandingMetricItem = {
      id: `m-${Date.now()}`,
      label: "Chỉ số mới",
      value: "100+",
      sub: "Mô tả chỉ số",
    };
    setConfig((prev) => ({ ...prev, metrics: [...prev.metrics, newMetric] }));
  };

  const handleUpdateMetric = (id: string, field: keyof LandingMetricItem, val: string) => {
    setConfig((prev) => ({
      ...prev,
      metrics: prev.metrics.map((m) => (m.id === id ? { ...m, [field]: val } : m)),
    }));
  };

  const handleDeleteMetric = (id: string) => {
    setConfig((prev) => ({
      ...prev,
      metrics: prev.metrics.filter((m) => m.id !== id),
    }));
  };

  // Thao tác với quyền lợi hội viên
  const handleAddBenefit = () => {
    const newBenefit: LandingBenefitItem = {
      id: `b-${Date.now()}`,
      title: "Quyền lợi mới",
      desc: "Mô tả chi tiết quyền lợi và đặc quyền hội viên.",
      iconName: "Sparkles",
    };
    setConfig((prev) => ({ ...prev, benefits: [...prev.benefits, newBenefit] }));
  };

  const handleUpdateBenefit = (id: string, field: keyof LandingBenefitItem, val: string) => {
    setConfig((prev) => ({
      ...prev,
      benefits: prev.benefits.map((b) => (b.id === id ? { ...b, [field]: val } : b)),
    }));
  };

  const handleDeleteBenefit = (id: string) => {
    setConfig((prev) => ({
      ...prev,
      benefits: prev.benefits.filter((b) => b.id !== id),
    }));
  };

  return (
    <div className="space-y-6">
      {/* ── HEADER CỦA BẢN QUẢN LÝ LANDING WEB ── */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-[20px] bg-white dark:bg-card border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Layout className="size-5 text-[#003B95] dark:text-blue-400" />
            <span>Quản Lý Landing Web (Trang Giới Thiệu Công Khai)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Thiết lập dynamic toàn diện: Hero banner, thông số ấn tượng, quyền lợi hội viên, SEO và thông tin liên hệ.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
          >
            <Eye className="size-3.5" />
            <span>Xem Trước (Live Preview)</span>
          </a>

          <button
            type="button"
            onClick={handleReset}
            className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
          >
            <RotateCcw className="size-3.5" />
            <span>Mặc định</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black flex items-center gap-1.5 transition shadow-xs cursor-pointer disabled:opacity-50"
          >
            <Save className="size-3.5 text-slate-950" />
            <span>{saving ? "Đang lưu..." : "Lưu & Xuất Bản"}</span>
          </button>
        </div>
      </div>

      {/* ── THANH ĐIỀU HƯỚNG SUB-TABS DYNAMIC ── */}
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
        {[
          { key: "branding", label: "Nhận Diện & Màu Sắc", icon: Palette },
          { key: "hero", label: "Hero Banner & Kêu Gọi", icon: Layout },
          { key: "metrics", label: "Số Liệu Nổi Bật", icon: BarChart3 },
          { key: "benefits", label: "Quyền Lợi Hội Viên", icon: Award },
          { key: "seo", label: "Cấu Hình SEO / MXH", icon: Share2 },
          { key: "contact", label: "Liên Hệ & Mạng Xã Hội", icon: Phone },
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
                isSelected
                  ? "bg-[#003B95] text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-slate-800"
              }`}
            >
              <Icon className="size-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── NỘI DUNG TỪNG PHÂN HỆ DYNAMIC ── */}
      <div className="bg-white dark:bg-card rounded-[20px] border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
        {/* 1. BRANDING & NHẬN DIỆN */}
        {activeTab === "branding" && (
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider border-b border-slate-200 pb-2">
              1. Nhận Diện Thương Hiệu &amp; Trạng Thái
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Tên Tổ Chức / Hiệp Hội *
                </label>
                <input
                  type="text"
                  value={config.orgName}
                  onChange={(e) => setConfig({ ...config, orgName: e.target.value })}
                  placeholder="VD: CLB Doanh Nhân CEO 1983 (HanoiBA)"
                  className="w-full h-10 px-3 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Khẩu Hiệu / Slogan *
                </label>
                <input
                  type="text"
                  value={config.tagline}
                  onChange={(e) => setConfig({ ...config, tagline: e.target.value })}
                  placeholder="VD: Gắn kết doanh nhân — Nâng tầm giá trị thương hiệu"
                  className="w-full h-10 px-3 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-600"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Giới Thiệu Tổng Quan Về Hiệp Hội
                </label>
                <textarea
                  rows={3}
                  value={config.about}
                  onChange={(e) => setConfig({ ...config, about: e.target.value })}
                  placeholder="Mô tả chi tiết về lịch sử thành lập, mục tiêu và tôn chỉ hoạt động..."
                  className="w-full p-3 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Đường Dẫn Logo (URL)
                </label>
                <input
                  type="text"
                  value={config.logoUrl}
                  onChange={(e) => setConfig({ ...config, logoUrl: e.target.value })}
                  placeholder="/ceo1983-emblem-8.png hoặc https://..."
                  className="w-full h-10 px-3 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Màu Thương Hiệu Chủ Đạo (Hex Code)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={config.brandPrimary}
                    onChange={(e) => setConfig({ ...config, brandPrimary: e.target.value })}
                    className="w-10 h-10 rounded-xl border border-slate-300 cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    value={config.brandPrimary}
                    onChange={(e) => setConfig({ ...config, brandPrimary: e.target.value })}
                    className="flex-1 h-10 px-3 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-600 font-mono"
                  />
                </div>
              </div>

              <div className="md:col-span-2 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    Trạng Thái Xuất Bản Landing Web
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Bật để cho phép công chúng và khách vãng lai truy cập xem trang giới thiệu CLB
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.isPublished}
                    onChange={(e) => setConfig({ ...config, isPublished: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#003B95]"></div>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* 2. HERO BANNER & CTAS */}
        {activeTab === "hero" && (
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider border-b border-slate-200 pb-2">
              2. Tiêu Đề Hero Banner &amp; Các Nút Kêu Gọi Hành Động (CTA)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Thẻ Huy Hiệu Trên Cùng (Hero Badge)
                </label>
                <input
                  type="text"
                  value={config.heroBadge}
                  onChange={(e) => setConfig({ ...config, heroBadge: e.target.value })}
                  placeholder="VD: HỆ SINH THÁI DOANH NHÂN HANOIBA"
                  className="w-full h-10 px-3 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-600"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Tiêu Đề Lớn Hero Banner (Hero Title) *
                </label>
                <input
                  type="text"
                  value={config.heroTitle}
                  onChange={(e) => setConfig({ ...config, heroTitle: e.target.value })}
                  placeholder="VD: CỘNG ĐỒNG DOANH NHÂN CEO 1983 TIÊN PHONG"
                  className="w-full h-10 px-3 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-600 font-bold"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Đoạn Mô Tả Dưới Tiêu Đề (Hero Subtitle)
                </label>
                <textarea
                  rows={2}
                  value={config.heroSubtitle}
                  onChange={(e) => setConfig({ ...config, heroSubtitle: e.target.value })}
                  placeholder="Mô tả tóm tắt lợi ích nổi bật..."
                  className="w-full p-3 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-600"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Ảnh Nền Hero Banner (URL)
                </label>
                <input
                  type="text"
                  value={config.heroBannerUrl}
                  onChange={(e) => setConfig({ ...config, heroBannerUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full h-10 px-3 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Tên Nút Kêu Gọi Chính (CTA 1)
                </label>
                <input
                  type="text"
                  value={config.cta1Text}
                  onChange={(e) => setConfig({ ...config, cta1Text: e.target.value })}
                  className="w-full h-10 px-3 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Link Điều Hướng Nút Chính (CTA 1 Link)
                </label>
                <input
                  type="text"
                  value={config.cta1Link}
                  onChange={(e) => setConfig({ ...config, cta1Link: e.target.value })}
                  className="w-full h-10 px-3 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-600 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Tên Nút Kêu Gọi Phụ (CTA 2)
                </label>
                <input
                  type="text"
                  value={config.cta2Text}
                  onChange={(e) => setConfig({ ...config, cta2Text: e.target.value })}
                  className="w-full h-10 px-3 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Link Điều Hướng Nút Phụ (CTA 2 Link)
                </label>
                <input
                  type="text"
                  value={config.cta2Link}
                  onChange={(e) => setConfig({ ...config, cta2Link: e.target.value })}
                  className="w-full h-10 px-3 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-600 font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* 3. SỐ LIỆU NỔI BẬT DYNAMIC */}
        {activeTab === "metrics" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                3. Các Con Số Biết Nói (Dynamic Key Metrics)
              </h3>
              <button
                type="button"
                onClick={handleAddMetric}
                className="px-3 py-1.5 rounded-xl bg-[#003B95] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer hover:bg-blue-800 transition"
              >
                <Plus className="size-3.5" />
                <span>Thêm Số Liệu</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {config.metrics.map((m, index) => (
                <div
                  key={m.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 space-y-3 relative group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-blue-700 dark:text-blue-400">
                      CHỈ SỐ #{index + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteMetric(m.id)}
                      className="text-red-500 hover:text-red-700 p-1 rounded-lg transition"
                      title="Xóa chỉ số này"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-500 mb-1">
                        Giá Trị (VD: 500+)
                      </label>
                      <input
                        type="text"
                        value={m.value}
                        onChange={(e) => handleUpdateMetric(m.id, "value", e.target.value)}
                        className="w-full h-8 px-2.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-500 mb-1">
                        Tên Chỉ Số
                      </label>
                      <input
                        type="text"
                        value={m.label}
                        onChange={(e) => handleUpdateMetric(m.id, "label", e.target.value)}
                        className="w-full h-8 px-2.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-500 mb-1">
                      Mô Tả Phụ
                    </label>
                    <input
                      type="text"
                      value={m.sub}
                      onChange={(e) => handleUpdateMetric(m.id, "sub", e.target.value)}
                      className="w-full h-8 px-2.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. QUYỀN LỢI HỘI VIÊN DYNAMIC */}
        {activeTab === "benefits" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                4. Quyền Lợi &amp; Đặc Quyền Hội Viên (Dynamic Benefits)
              </h3>
              <button
                type="button"
                onClick={handleAddBenefit}
                className="px-3 py-1.5 rounded-xl bg-[#003B95] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer hover:bg-blue-800 transition"
              >
                <Plus className="size-3.5" />
                <span>Thêm Đặc Quyền</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {config.benefits.map((b, index) => (
                <div
                  key={b.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 space-y-3 relative group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
                      ĐẶC QUYỀN #{index + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteBenefit(b.id)}
                      className="text-red-500 hover:text-red-700 p-1 rounded-lg transition"
                      title="Xóa đặc quyền này"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-500 mb-1">
                      Tiêu Đề Đặc Quyền
                    </label>
                    <input
                      type="text"
                      value={b.title}
                      onChange={(e) => handleUpdateBenefit(b.id, "title", e.target.value)}
                      className="w-full h-8 px-2.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-500 mb-1">
                      Mô Tả Chi Tiết Đặc Quyền
                    </label>
                    <textarea
                      rows={2}
                      value={b.desc}
                      onChange={(e) => handleUpdateBenefit(b.id, "desc", e.target.value)}
                      className="w-full p-2.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. CẤU HÌNH SEO & OPENGRAPH */}
        {activeTab === "seo" && (
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider border-b border-slate-200 pb-2">
              5. Cấu Hình SEO &amp; Chia Sẻ Mạng Xã Hội (Facebook, Zalo, Google)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Tiêu Đề SEO (Meta Title)
                </label>
                <input
                  type="text"
                  value={config.metaTitle}
                  onChange={(e) => setConfig({ ...config, metaTitle: e.target.value })}
                  placeholder="CLB Doanh Nhân CEO 1983 | Nền Tảng Số Hóa HanoiBA"
                  className="w-full h-10 px-3 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-600"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Mô Tả SEO (Meta Description)
                </label>
                <textarea
                  rows={2}
                  value={config.metaDescription}
                  onChange={(e) => setConfig({ ...config, metaDescription: e.target.value })}
                  placeholder="Cổng thông tin và ứng dụng chính thức của CLB Doanh Nhân CEO 1983..."
                  className="w-full p-3 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-600"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Từ Khóa SEO (Meta Keywords - Phân cách bằng dấu phẩy)
                </label>
                <input
                  type="text"
                  value={config.metaKeywords}
                  onChange={(e) => setConfig({ ...config, metaKeywords: e.target.value })}
                  placeholder="CEO 1983, HanoiBA, Doanh nhân 1983, Giao thương B2B"
                  className="w-full h-10 px-3 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-600"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Ảnh Đại Diện Khi Chia Sẻ MXH (OpenGraph Image URL)
                </label>
                <input
                  type="text"
                  value={config.ogImageUrl}
                  onChange={(e) => setConfig({ ...config, ogImageUrl: e.target.value })}
                  placeholder="/ceo1983-emblem-8.png hoặc https://..."
                  className="w-full h-10 px-3 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-600"
                />
              </div>
            </div>
          </div>
        )}

        {/* 6. LIÊN HỆ & MẠNG XÃ HỘI */}
        {activeTab === "contact" && (
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider border-b border-slate-200 pb-2">
              6. Thông Tin Văn Phòng Trụ Sở &amp; Mạng Xã Hội Chính Thức
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Địa Chỉ Trụ Sở Văn Phòng
                </label>
                <input
                  type="text"
                  value={config.headquarters}
                  onChange={(e) => setConfig({ ...config, headquarters: e.target.value })}
                  placeholder="Tòa nhà HanoiBA, Quận Cầu Giấy, TP. Hà Nội"
                  className="w-full h-10 px-3 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Hotline Ban Thư Ký
                </label>
                <input
                  type="text"
                  value={config.hotline}
                  onChange={(e) => setConfig({ ...config, hotline: e.target.value })}
                  placeholder="0983 198 383"
                  className="w-full h-10 px-3 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Email Tiếp Nhận Hồ Sơ
                </label>
                <input
                  type="text"
                  value={config.contactEmail}
                  onChange={(e) => setConfig({ ...config, contactEmail: e.target.value })}
                  placeholder="contact@ceo1983.vn"
                  className="w-full h-10 px-3 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Trang Facebook Fanpage (URL)
                </label>
                <input
                  type="text"
                  value={config.facebookUrl}
                  onChange={(e) => setConfig({ ...config, facebookUrl: e.target.value })}
                  placeholder="https://facebook.com/..."
                  className="w-full h-10 px-3 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-600 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Kênh Zalo Official Account (URL)
                </label>
                <input
                  type="text"
                  value={config.zaloOaUrl}
                  onChange={(e) => setConfig({ ...config, zaloOaUrl: e.target.value })}
                  placeholder="https://zalo.me/..."
                  className="w-full h-10 px-3 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-600 font-mono"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

