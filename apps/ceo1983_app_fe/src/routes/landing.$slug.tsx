import { createFileRoute, notFound } from "@tanstack/react-router";
import { useServerData } from "@/hooks/use-server-data";
import { getPublicLandingWebFn } from "@/lib/landing-webs.functions";
import {
  TimedCardsOpeningLanding,
  type LandingWebConfig,
} from "@/components/landing/TimedCardsOpeningLanding";
import { StartupMobileShowcaseLanding } from "@/components/landing/StartupMobileShowcaseLanding";
import { Globe, ArrowLeft } from "lucide-react";

const FALLBACK_V1_CONFIG: LandingWebConfig = {
  id: "lw_timed_cards_opening_default",
  name: "Khám Phá Toàn Cầu — Timed Cards Opening (Mẫu 1)",
  slug: "web-v1",
  subdomain: "web-v1",
  isPublished: true,
  template: "timed_cards_opening",
  theme: {
    primaryColor: "#ecad29",
    secondaryColor: "#1a1a1a",
    textColor: "#FFFFFF",
    backgroundColor: "#111317",
    fontFamily: "Inter, Oswald, sans-serif",
  },
  brand: {
    logoText: "Globe Express",
    logoIcon: "globe",
    contactPhone: "0983.1983.83",
    contactEmail: "contact@ceo1983.viconnect.vn",
  },
  navMenu: [
    { id: "m1", label: "Địa Điểm", active: true, type: "link", url: "#" },
    { id: "m2", label: "Thành Viên", type: "link", url: "#" },
    { id: "m3", label: "Sự Kiện", type: "link", url: "#" },
    { id: "m4", label: "Hệ Thống", type: "link", url: "#" },
  ],
  slides: [
    {
      id: "slide-1",
      place: "Switzerland Alps",
      title1: "SAINT",
      title2: "ANTONIEN",
      description: "Tận hưởng không gian thiên nhiên hùng vĩ của rặng núi Alps tại Thụy Sĩ. Nơi những doanh nhân tìm thấy sự tĩnh tại và cảm hứng sáng tạo vô tận.",
      image: "https://assets.codepen.io/3685267/timed-cards-1.jpg",
      ctaText: "Khám Phá Địa Điểm",
      ctaLink: "#",
    },
    {
      id: "slide-2",
      place: "Japan Danxia",
      title1: "NAGANO",
      title2: "PREFECTURE",
      description: "Vẻ đẹp thanh bình của xứ sở hoa anh đào qua góc nhìn của kiến trúc truyền thống và công nghệ hiện đại bậc nhất thế giới.",
      image: "https://assets.codepen.io/3685267/timed-cards-2.jpg",
      ctaText: "Tìm Hiểu Thêm",
      ctaLink: "#",
    },
    {
      id: "slide-3",
      place: "Sahara Desert",
      title1: "MARRAKECH",
      title2: "MERZOUGA",
      description: "Hành trình xuyên qua sa mạc Sahara huyền bí với những đụn cát vàng bất tận dưới bầu trời đêm ngập tràn ánh sao.",
      image: "https://assets.codepen.io/3685267/timed-cards-3.jpg",
      ctaText: "Xem Chi Tiết",
      ctaLink: "#",
    },
  ],
  subScreens: [],
  apiConfig: {
    enabled: false,
    endpointUrl: "",
    rootPath: "",
  },
};

const FALLBACK_V2_CONFIG: LandingWebConfig = {
  id: "lw_startup_mobile_showcase_default",
  name: "Ứng Dụng Di Động CEO 1983 — Startup Mobile Showcase (Mẫu 2)",
  slug: "web-v2",
  subdomain: "web-v2",
  isPublished: true,
  template: "startup_mobile_showcase",
  theme: {
    primaryColor: "#003B95",
    secondaryColor: "#ecad29",
    textColor: "#0F172A",
    backgroundColor: "#F8FAFC",
    fontFamily: "Inter, Oswald, sans-serif",
  },
  brand: {
    logoText: "CLB Doanh Nhân CEO 1983",
    logoIcon: "smartphone",
    contactPhone: "0983.1983.83",
    contactEmail: "contact@ceo1983.viconnect.vn",
  },
  navMenu: [
    { id: "m1", label: "Trang chủ", url: "#home" },
    { id: "m2", label: "Tính năng App", url: "#features" },
    { id: "m3", label: "Giao thương B2B", url: "#b2b" },
    { id: "m4", label: "Hội viên tiêu biểu", url: "#network" },
    { id: "m5", label: "Hỏi đáp FAQ", url: "#faq" },
  ],
  slides: [],
  subScreens: [],
  apiConfig: {
    enabled: false,
    endpointUrl: "",
    rootPath: "",
  },
};

export const Route = createFileRoute("/landing/$slug")({
  ssr: false,
  component: PublicLandingPage,
});

function PublicLandingPage() {
  const { slug } = Route.useParams();
  const cleanSlug = (slug || "").toLowerCase().trim();

  const { data: landingWeb, loading } = useServerData(
    () => getPublicLandingWebFn({ data: { slugOrSubdomain: cleanSlug } }),
    null,
    `landing-${cleanSlug}`
  );

  if (loading) {
    return (
      <div className="w-full h-screen bg-[#111317] flex flex-col items-center justify-center text-white space-y-3 font-sans">
        <div className="size-10 rounded-full border-3 border-amber-400 border-t-transparent animate-spin" />
        <p className="text-xs uppercase tracking-widest text-slate-400 font-bold">
          Đang nạp Landing Web...
        </p>
      </div>
    );
  }

  // Active configuration: prioritize server data, fallback to predefined templates for web-v1 & web-v2
  const effectiveConfig =
    landingWeb ||
    (["web-v2", "web2", "web-2", "v2", "app-ceo1983", "startup-mobile-showcase"].includes(cleanSlug)
      ? FALLBACK_V2_CONFIG
      : ["web-v1", "web1", "web-1", "v1", "kham-pha-toan-cau", "timed-cards-opening"].includes(cleanSlug)
      ? FALLBACK_V1_CONFIG
      : null);

  if (!effectiveConfig) {
    return (
      <div className="w-full h-screen bg-[#111317] flex flex-col items-center justify-center text-white p-6 text-center space-y-4 font-sans">
        <div className="size-16 rounded-2xl bg-white/5 border border-white/10 grid place-items-center text-amber-400">
          <Globe className="size-8" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-black uppercase tracking-wider text-white">
            Không tìm thấy Landing Web
          </h2>
          <p className="text-xs text-slate-400 max-w-sm">
            Trang với đường dẫn <code className="text-amber-300 font-mono">"crm.ceo1983.viconnect.vn/landing/{slug}"</code> không tồn tại hoặc đã ngừng xuất bản.
          </p>
        </div>
        <a
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#003B95] text-white font-bold text-xs shadow-lg hover:brightness-110 transition"
        >
          <ArrowLeft className="size-4" />
          <span>Về Cổng CEO 1983</span>
        </a>
      </div>
    );
  }

  if (effectiveConfig.template === "startup_mobile_showcase") {
    return <StartupMobileShowcaseLanding config={effectiveConfig} />;
  }

  return <TimedCardsOpeningLanding config={effectiveConfig} />;
}
