import React, { useState, useEffect } from "react";
import {
  Smartphone,
  ShieldCheck,
  TrendingUp,
  Users,
  Award,
  Calendar,
  MessageSquare,
  QrCode,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Play,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  Building2,
  Briefcase,
  Search,
  Star,
  Download,
  Menu,
  X,
  Share2,
  FileText,
  Phone,
  Mail,
  MapPin,
  Clock,
  Layers,
  ArrowUpRight,
} from "lucide-react";
import type {
  LandingWebConfig,
  LandingMenuItem,
  LandingSubScreen,
} from "./TimedCardsOpeningLanding";

interface StartupMobileShowcaseLandingProps {
  config: LandingWebConfig;
  onNavigateSubScreen?: (screenId: string) => void;
}

export function StartupMobileShowcaseLanding({
  config,
  onNavigateSubScreen,
}: StartupMobileShowcaseLandingProps) {
  const [activeSubScreen, setActiveSubScreen] = useState<LandingSubScreen | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFaqIndex, setActiveFaqIndex] = useState<number | null>(0);
  const [activeAppTab, setActiveAppTab] = useState<"b2b" | "connect" | "card" | "analytics">("b2b");
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  // Active theme colors
  const primaryColor = config.theme?.primaryColor || "#003B95";
  const secondaryColor = config.theme?.secondaryColor || "#ecad29";

  // Handle open sub screen
  const handleOpenSubScreen = (screenId?: string) => {
    if (!screenId) return;
    const found = config.subScreens?.find((s) => s.id === screenId);
    if (found) {
      setActiveSubScreen(found);
      setMobileMenuOpen(false);
    } else if (onNavigateSubScreen) {
      onNavigateSubScreen(screenId);
    }
  };

  // Mock phone screen dynamic data
  const phoneFeatures = {
    b2b: {
      title: "Sàn Thương Mại B2B",
      desc: "Niêm yết hơn 500+ sản phẩm & dịch vụ độc quyền từ các doanh nghiệp hội viên",
      stat: "500+ Sản phẩm B2B",
      badge: "Ưu đãi nội khối 15-30%",
      items: [
        { name: "Phần mềm Quản trị ERP & Tòa nhà", price: "2 Tỷ VNĐ", author: "ViConnect Tech" },
        { name: "Giải pháp Thiết bị Chiếu sáng & IoT", price: "850 Tr VNĐ", author: "Rạng Đông Smart" },
        { name: "Thi công Nội thất Văn phòng VIP", price: "1.2 Tỷ VNĐ", author: "An Cường Interior" },
      ],
    },
    connect: {
      title: "Đặt Lịch Gặp 1-on-1",
      desc: "Xúc tiến đầu tư, kết nối trực tiếp với Chủ tịch và Ban Lãnh đạo các tập đoàn",
      stat: "1.250+ Cuộc gặp",
      badge: "Tự động gửi thông báo",
      items: [
        { name: "Gặp Chị Lê Thị Dung — Chủ tịch CLB", price: "Thứ 4, 14:00", author: "Văn phòng HanoiBA" },
        { name: "Thảo luận Đầu tư Chuỗi Cung ứng", price: "Thứ 6, 09:30", author: "Khách sạn Daewoo" },
        { name: "Hợp tác Phân phối Khu công nghiệp", price: "Thứ 2, 15:00", author: "Văn phòng Hà Nội" },
      ],
    },
    card: {
      title: "Thẻ Hội Viên Điện Tử",
      desc: "Định danh doanh nhân chuẩn xác, tích hợp mã QR cá nhân check-in tức thì",
      stat: "100% Xác thực",
      badge: "Chuẩn NFC & QR Code",
      items: [
        { name: "Mã Hội Viên: CEO1983-8888", price: "VIP Member", author: "Chủ Tịch Lê Thị Dung" },
        { name: "Doanh nghiệp: Công ty Cổ phần CEO 1983", price: "Hà Nội", author: "Nhiệm kỳ 2024-2029" },
        { name: "Trạng thái: Đang hoạt động", price: "Bảo trợ HanoiBA", author: "Thẻ Doanh Nhân Số" },
      ],
    },
    analytics: {
      title: "Thống Kê Giao Thương",
      desc: "Minh bạch mọi chỉ số cơ hội, ngân sách và dòng tiền giao dịch thành công",
      stat: "100+ Tỷ VNĐ",
      badge: "Cập nhật thời gian thực",
      items: [
        { name: "Tổng cơ hội giao thương đã mở", price: "128 cơ hội", author: "Toàn hệ thống" },
        { name: "Doanh số giao dịch hoàn tất", price: "105.8 Tỷ VNĐ", author: "Quý 1/2026" },
        { name: "Tỷ lệ kết nối thành công", price: "89.4%", author: "Chỉ số tín nhiệm" },
      ],
    },
  };

  const currentTab = phoneFeatures[activeAppTab];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 text-slate-800 font-sans selection:bg-blue-600 selection:text-white">
      {/* ================= 1. HEADER / NAVIGATION ================= */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <a href="#home" className="flex items-center gap-3.5 group">
            <div className="size-11 rounded-2xl bg-[#003B95] p-2 flex items-center justify-center shadow-md shadow-blue-900/20 group-hover:scale-105 transition">
              <img
                src="/ceo1983-emblem-8.png"
                alt="CEO 1983 Logo"
                className="w-full h-full object-contain filter drop-shadow-sm"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = "none";
                }}
              />
              <Sparkles className="size-5 text-amber-400 hidden group-hover:block" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-black tracking-tight text-[#003B95]">
                  CEO 1983
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 font-black tracking-wider uppercase">
                  HanoiBA
                </span>
              </div>
              <p className="text-[11px] font-semibold text-slate-500 tracking-wide uppercase">
                CLB Doanh Nhân CEO 1983
              </p>
            </div>
          </a>

          {/* Desktop Nav Items */}
          <nav className="hidden lg:flex items-center gap-7">
            {config.navMenu?.map((menu) => {
              if (menu.type === "tree_dropdown" && menu.children && menu.children.length > 0) {
                return (
                  <div key={menu.id} className="relative group">
                    <button
                      type="button"
                      className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-[#003B95] py-2 transition"
                    >
                      <span>{menu.label}</span>
                      <ChevronDown className="size-3.5 text-slate-400 group-hover:rotate-180 transition-transform duration-200" />
                    </button>
                    <div className="absolute left-0 top-full w-60 rounded-2xl bg-white shadow-xl border border-slate-100 p-2 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition duration-200 z-50">
                      {menu.children.map((sub) => (
                        <button
                          key={sub.id}
                          type="button"
                          onClick={() => {
                            if (sub.type === "modal_screen" && sub.subScreenId) {
                              handleOpenSubScreen(sub.subScreenId);
                            } else if (sub.url) {
                              window.location.href = sub.url;
                            }
                          }}
                          className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-slate-50 text-xs font-semibold text-slate-700 hover:text-[#003B95] flex items-center justify-between group/item transition cursor-pointer"
                        >
                          <span>{sub.label}</span>
                          {sub.badge && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-600 font-black">
                              {sub.badge}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              }

              return (
                <button
                  key={menu.id}
                  type="button"
                  onClick={() => {
                    if (menu.type === "modal_screen" && menu.subScreenId) {
                      handleOpenSubScreen(menu.subScreenId);
                    } else if (menu.url) {
                      window.location.href = menu.url;
                    }
                  }}
                  className="text-xs font-bold text-slate-700 hover:text-[#003B95] transition cursor-pointer"
                >
                  {menu.label}
                </button>
              );
            })}
          </nav>

          {/* Right Action CTAs */}
          <div className="hidden sm:flex items-center gap-3">
            <a
              href="/login"
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-[#003B95] hover:bg-slate-100 transition"
            >
              Đăng Nhập CRM
            </a>
            <a
              href="#download"
              className="px-5 py-2.5 rounded-xl bg-[#003B95] hover:bg-[#002B70] text-white text-xs font-bold shadow-md shadow-blue-900/20 hover:shadow-lg transition flex items-center gap-2 group"
            >
              <Smartphone className="size-4" />
              <span>Tải App Hội Viên</span>
              <ArrowRight className="size-3.5 group-hover:translate-x-0.5 transition-transform" />
            </a>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
          >
            {mobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-100 bg-white px-4 py-4 space-y-2 shadow-xl animate-in slide-in-from-top-2 duration-200">
            {config.navMenu?.map((menu) => (
              <div key={menu.id} className="py-1">
                <button
                  type="button"
                  onClick={() => {
                    if (menu.type === "modal_screen" && menu.subScreenId) {
                      handleOpenSubScreen(menu.subScreenId);
                    } else if (menu.url) {
                      window.location.href = menu.url;
                    }
                  }}
                  className="w-full text-left py-2 px-3 rounded-lg text-sm font-bold text-slate-800 hover:bg-slate-50"
                >
                  {menu.label}
                </button>
              </div>
            ))}
            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              <a
                href="/login"
                className="w-full py-2.5 text-center text-xs font-bold rounded-xl border border-slate-200 text-slate-700"
              >
                Đăng Nhập CRM Quản Trị
              </a>
              <a
                href="#download"
                className="w-full py-2.5 text-center text-xs font-bold rounded-xl bg-[#003B95] text-white shadow-md"
              >
                Tải App Hội Viên CEO 1983
              </a>
            </div>
          </div>
        )}
      </header>

      {/* ================= 2. HERO SECTION WITH SMARTPHONE SHOWCASE ================= */}
      <section id="home" className="relative pt-12 pb-20 overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-blue-100/60 rounded-full blur-3xl -z-10 pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-96 h-96 bg-amber-100/50 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 shadow-xs mb-6">
            <span className="size-2 rounded-full bg-[#003B95] animate-pulse" />
            <span className="text-xs font-black uppercase tracking-wider text-[#003B95]">
              Hệ Sinh Thái Doanh Nhân CEO 1983 • HanoiBA
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight max-w-4xl mx-auto leading-[1.15]">
            Gắn Kết Sức Mạnh — Nâng Tầm Doanh Nhân{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#003B95] to-blue-700">
              CEO 1983
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-5 text-sm sm:text-base lg:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed font-medium">
            Nền tảng số hóa tối tân dành riêng cho lãnh đạo doanh nghiệp sinh năm 1983. Kết nối giao thương B2B, trao đổi cơ hội kinh doanh, xúc tiến đầu tư và tương trợ phát triển bền vững.
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
            <a
              href="#features"
              className="px-7 py-3.5 rounded-2xl bg-[#003B95] hover:bg-[#002B70] text-white font-black text-sm shadow-xl shadow-blue-900/25 hover:shadow-2xl hover:scale-105 active:scale-95 transition flex items-center gap-2"
            >
              <span>Khám Phá Hệ Sinh Thái</span>
              <ArrowRight className="size-4" />
            </a>
            <button
              type="button"
              onClick={() => setIsVideoModalOpen(true)}
              className="px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-800 font-bold text-sm shadow-md hover:shadow-lg active:scale-95 transition flex items-center gap-2.5 cursor-pointer"
            >
              <div className="size-7 rounded-full bg-amber-500/10 text-amber-600 grid place-items-center">
                <Play className="size-3.5 fill-current ml-0.5" />
              </div>
              <span>Xem Video Giới Thiệu</span>
            </button>
          </div>

          {/* Interactive Feature Selector for App Mockup */}
          <div className="mt-12 flex items-center justify-center gap-2 flex-wrap">
            {(["b2b", "connect", "card", "analytics"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveAppTab(tab)}
                className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
                  activeAppTab === tab
                    ? "bg-[#003B95] text-white shadow-md shadow-blue-900/20"
                    : "bg-white/80 hover:bg-white text-slate-600 border border-slate-200"
                }`}
              >
                {tab === "b2b" && "Sàn B2B Nội Khối"}
                {tab === "connect" && "Kết Nối 1-on-1"}
                {tab === "card" && "Thẻ Hội Viên QR"}
                {tab === "analytics" && "Chỉ Số Giao Thương"}
              </button>
            ))}
          </div>

          {/* ================= SMARTPHONE MOCKUP (iPhone 16 Pro Style) ================= */}
          <div className="mt-8 relative max-w-sm sm:max-w-md mx-auto">
            {/* Ambient Glow */}
            <div className="absolute inset-0 bg-gradient-to-t from-blue-600/20 via-blue-500/10 to-transparent blur-2xl -z-10" />

            {/* Floating Metric Badges */}
            <div className="hidden sm:flex absolute -left-28 top-20 z-20 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-xl border border-slate-100 items-center gap-3 animate-bounce [animation-duration:4s]">
              <div className="size-10 rounded-xl bg-amber-500/15 text-amber-600 grid place-items-center">
                <Award className="size-5" />
              </div>
              <div className="text-left">
                <p className="text-xs font-black text-slate-900">100+ Tỷ VNĐ</p>
                <p className="text-[10px] text-slate-500 font-medium">Giao thương B2B</p>
              </div>
            </div>

            <div className="hidden sm:flex absolute -right-24 top-40 z-20 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-xl border border-slate-100 items-center gap-3 animate-bounce [animation-duration:5s]">
              <div className="size-10 rounded-xl bg-emerald-500/15 text-emerald-600 grid place-items-center">
                <ShieldCheck className="size-5" />
              </div>
              <div className="text-left">
                <p className="text-xs font-black text-slate-900">100% Xác Thực</p>
                <p className="text-[10px] text-slate-500 font-medium">Lãnh đạo Doanh nghiệp</p>
              </div>
            </div>

            <div className="hidden sm:flex absolute -left-20 bottom-24 z-20 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-xl border border-slate-100 items-center gap-3 animate-bounce [animation-duration:6s]">
              <div className="size-10 rounded-xl bg-blue-500/15 text-blue-600 grid place-items-center">
                <Star className="size-5 fill-current" />
              </div>
              <div className="text-left">
                <p className="text-xs font-black text-slate-900">4.9/5 ★★★★★</p>
                <p className="text-[10px] text-slate-500 font-medium">1.983+ Đánh giá</p>
              </div>
            </div>

            {/* The Phone Chassis */}
            <div className="relative mx-auto rounded-[48px] p-3.5 bg-gradient-to-b from-slate-800 via-slate-900 to-black shadow-2xl border-4 border-slate-700/60 ring-1 ring-slate-800">
              {/* Dynamic Island Notch */}
              <div className="absolute top-6 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-full z-30 flex items-center justify-between px-3">
                <div className="size-2.5 rounded-full bg-slate-950 border border-slate-800" />
                <div className="size-2 rounded-full bg-blue-900/60" />
              </div>

              {/* Screen Bezel & Content */}
              <div className="relative rounded-[36px] bg-slate-950 text-white overflow-hidden border border-slate-800/80 shadow-inner">
                {/* Status Bar */}
                <div className="pt-3 px-6 pb-2 flex items-center justify-between text-[11px] text-slate-400 font-semibold">
                  <span>9:41</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px]">5G</span>
                    <div className="w-5 h-2.5 rounded-xs border border-slate-400 p-0.5 flex items-center">
                      <div className="h-full w-full bg-white rounded-2xs" />
                    </div>
                  </div>
                </div>

                {/* App Screen Header */}
                <div className="p-4 bg-gradient-to-b from-[#003B95] to-[#002660] text-left">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="size-9 rounded-full bg-amber-400/20 border border-amber-400/50 p-0.5 grid place-items-center text-amber-300 font-black text-xs">
                        CEO
                      </div>
                      <div>
                        <p className="text-[10px] text-blue-200">Xin chào Doanh nhân</p>
                        <p className="text-xs font-black text-white">Chị Lê Thị Dung</p>
                      </div>
                    </div>
                    <div className="size-8 rounded-xl bg-white/10 grid place-items-center text-white">
                      <QrCode className="size-4" />
                    </div>
                  </div>

                  {/* Digital Card Preview inside App */}
                  <div className="mt-3.5 p-3 rounded-2xl bg-gradient-to-r from-amber-500/90 via-amber-600 to-amber-700 text-slate-950 shadow-md">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black uppercase tracking-wider text-amber-950">
                        Thẻ Hội Viên Chính Thức
                      </span>
                      <Sparkles className="size-3.5 text-amber-950" />
                    </div>
                    <p className="mt-1 text-sm font-black tracking-tight text-white drop-shadow-xs">
                      CLB DOANH NHÂN CEO 1983
                    </p>
                    <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-amber-950 font-bold">
                      <span>CEO1983-8888</span>
                      <span>HANOIBA</span>
                    </div>
                  </div>
                </div>

                {/* Active Module Feed */}
                <div className="p-4 bg-slate-900/95 space-y-3 min-h-[300px] text-left">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="size-3.5 text-amber-400" />
                      <span className="text-xs font-black text-white">{currentTab.title}</span>
                    </div>
                    <span className="text-[10px] text-amber-400 font-bold">{currentTab.stat}</span>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-snug">{currentTab.desc}</p>

                  {/* Interactive Cards List */}
                  <div className="space-y-2 pt-1">
                    {currentTab.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-between gap-2 transition"
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white truncate">{item.name}</p>
                          <p className="text-[10px] text-slate-400 truncate">{item.author}</p>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#003B95] text-white font-black shrink-0">
                          {item.price}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 text-center">
                    <span className="inline-block text-[10px] px-2.5 py-1 rounded-full bg-white/5 text-slate-300 font-semibold">
                      {currentTab.badge}
                    </span>
                  </div>
                </div>

                {/* Bottom App Bar */}
                <div className="p-2 bg-slate-950 border-t border-slate-800 grid grid-cols-5 text-center text-slate-400 text-[9px]">
                  <div className="flex flex-col items-center gap-0.5 text-blue-400">
                    <Smartphone className="size-3.5" />
                    <span>Trang chủ</span>
                  </div>
                  <div className="flex flex-col items-center gap-0.5">
                    <TrendingUp className="size-3.5" />
                    <span>Thống kê</span>
                  </div>
                  <div className="flex flex-col items-center gap-0.5 -mt-3">
                    <div className="size-8 rounded-full bg-[#003B95] text-white grid place-items-center shadow-lg">
                      <QrCode className="size-4" />
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-0.5">
                    <MessageSquare className="size-3.5" />
                    <span>B2B Chat</span>
                  </div>
                  <div className="flex flex-col items-center gap-0.5">
                    <Users className="size-3.5" />
                    <span>Hội viên</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 3. STATS RIBBON (The Signature Navy Ribbon from Pinterest Pin) ================= */}
      <section className="bg-[#003B95] text-white py-8 shadow-xl border-y border-blue-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] opacity-5 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-blue-800/60">
            <div className="pt-4 md:pt-0">
              <p className="text-3xl sm:text-4xl font-black text-amber-400 tracking-tight">4+ Năm</p>
              <p className="text-xs sm:text-sm font-semibold text-blue-100 mt-1 uppercase tracking-wider">
                Hành Trình Kiến Tạo
              </p>
              <p className="text-[11px] text-blue-200/70 mt-0.5">Bền bỉ phát triển từ 2022</p>
            </div>

            <div className="pt-4 md:pt-0">
              <p className="text-3xl sm:text-4xl font-black text-white tracking-tight">1.983+</p>
              <p className="text-xs sm:text-sm font-semibold text-blue-100 mt-1 uppercase tracking-wider">
                Hội Viên Doanh Nhân
              </p>
              <p className="text-[11px] text-blue-200/70 mt-0.5">Chủ tịch, Founder, CEO thế hệ 1983</p>
            </div>

            <div className="pt-4 md:pt-0">
              <p className="text-3xl sm:text-4xl font-black text-amber-400 tracking-tight">500+</p>
              <p className="text-xs sm:text-sm font-semibold text-blue-100 mt-1 uppercase tracking-wider">
                Doanh Nghiệp Tiêu Biểu
              </p>
              <p className="text-[11px] text-blue-200/70 mt-0.5">Đa ngành nghề: CNTT, BĐS, F&amp;B</p>
            </div>

            <div className="pt-4 md:pt-0">
              <p className="text-3xl sm:text-4xl font-black text-white tracking-tight">100+ Tỷ</p>
              <p className="text-xs sm:text-sm font-semibold text-blue-100 mt-1 uppercase tracking-wider">
                Giá Trị Giao Thương B2B
              </p>
              <p className="text-[11px] text-blue-200/70 mt-0.5">Kết nối &amp; chuyển đổi thực chất</p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 4. CORE FEATURES & VALUE PILLARS ================= */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <span className="text-xs font-black uppercase tracking-wider text-[#003B95] px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-100">
              Giải Pháp Đột Phá
            </span>
            <h2 className="mt-4 text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Tất Cả Trong Một Nền Tảng Cho Lãnh Đạo CEO 1983
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600 font-medium">
              Thiết kế theo chuẩn mực doanh nhân hiện đại, kết nối tức thì và bảo mật dữ liệu cấp cao.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Card 1 */}
            <div className="p-6 sm:p-7 rounded-3xl bg-slate-50 border border-slate-200/80 hover:border-[#003B95]/40 hover:shadow-xl hover:-translate-y-1 transition duration-200 group">
              <div className="size-12 rounded-2xl bg-[#003B95] text-white grid place-items-center shadow-md shadow-blue-900/20 group-hover:scale-110 transition">
                <Briefcase className="size-6" />
              </div>
              <h3 className="mt-5 text-lg font-black text-slate-900 group-hover:text-[#003B95] transition">
                Sàn Thương Mại B2B Nội Khối
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                Trao đổi, niêm yết sản phẩm và nhận diện cơ hội kinh doanh độc quyền không qua trung gian. Ưu đãi chiết khấu nội bộ 15-30% dành riêng cho thành viên.
              </p>
              <div className="mt-4 flex items-center gap-1.5 text-xs font-black text-[#003B95]">
                <span>Khám phá sàn</span>
                <ArrowUpRight className="size-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </div>

            {/* Card 2 */}
            <div className="p-6 sm:p-7 rounded-3xl bg-slate-50 border border-slate-200/80 hover:border-[#003B95]/40 hover:shadow-xl hover:-translate-y-1 transition duration-200 group">
              <div className="size-12 rounded-2xl bg-amber-500 text-white grid place-items-center shadow-md shadow-amber-500/20 group-hover:scale-110 transition">
                <Calendar className="size-6" />
              </div>
              <h3 className="mt-5 text-lg font-black text-slate-900 group-hover:text-amber-600 transition">
                Đặt Lịch Hẹn &amp; Giao Thương 1-on-1
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                Lên lịch gặp mặt xúc tiến hợp tác chỉ với 1 chạm. Tự động gửi tin nhắn xác nhận, đồng bộ lịch họp và thông báo nhắc nhở trước giờ hẹn.
              </p>
              <div className="mt-4 flex items-center gap-1.5 text-xs font-black text-amber-600">
                <span>Đặt lịch kết nối</span>
                <ArrowUpRight className="size-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </div>

            {/* Card 3 */}
            <div className="p-6 sm:p-7 rounded-3xl bg-slate-50 border border-slate-200/80 hover:border-[#003B95]/40 hover:shadow-xl hover:-translate-y-1 transition duration-200 group">
              <div className="size-12 rounded-2xl bg-emerald-600 text-white grid place-items-center shadow-md shadow-emerald-600/20 group-hover:scale-110 transition">
                <QrCode className="size-6" />
              </div>
              <h3 className="mt-5 text-lg font-black text-slate-900 group-hover:text-emerald-700 transition">
                Thẻ Hội Viên Điện Tử &amp; QR Check-in
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                Thay thế danh thiếp truyền thống bằng thẻ doanh nhân số bảo mật cao. Quét mã QR check-in tại các sự kiện Gala, Đại hội của hiệp hội chỉ trong 1 giây.
              </p>
              <div className="mt-4 flex items-center gap-1.5 text-xs font-black text-emerald-700">
                <span>Xem mẫu thẻ</span>
                <ArrowUpRight className="size-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </div>

            {/* Card 4 */}
            <div className="p-6 sm:p-7 rounded-3xl bg-slate-50 border border-slate-200/80 hover:border-[#003B95]/40 hover:shadow-xl hover:-translate-y-1 transition duration-200 group">
              <div className="size-12 rounded-2xl bg-indigo-600 text-white grid place-items-center shadow-md shadow-indigo-600/20 group-hover:scale-110 transition">
                <TrendingUp className="size-6" />
              </div>
              <h3 className="mt-5 text-lg font-black text-slate-900 group-hover:text-indigo-700 transition">
                Báo Cáo &amp; Chỉ Số Giao Thương
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                Biểu đồ thống kê đa chiều theo ngày, tuần, tháng, quý, năm. Minh chứng dẫn chứng thật và xếp hạng đóng góp giao thương thực chất của từng hội viên.
              </p>
              <div className="mt-4 flex items-center gap-1.5 text-xs font-black text-indigo-700">
                <span>Xem thống kê</span>
                <ArrowUpRight className="size-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </div>

            {/* Card 5 */}
            <div className="p-6 sm:p-7 rounded-3xl bg-slate-50 border border-slate-200/80 hover:border-[#003B95]/40 hover:shadow-xl hover:-translate-y-1 transition duration-200 group">
              <div className="size-12 rounded-2xl bg-purple-600 text-white grid place-items-center shadow-md shadow-purple-600/20 group-hover:scale-110 transition">
                <Sparkles className="size-6" />
              </div>
              <h3 className="mt-5 text-lg font-black text-slate-900 group-hover:text-purple-700 transition">
                Trợ Lý AI Doanh Nghiệp 24/7
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                Trợ lý AI hướng dẫn thao tác, tự động phân tích nhu cầu và đề xuất các đối tác B2B tương thích trong danh bạ 1.983+ doanh nghiệp thành viên.
              </p>
              <div className="mt-4 flex items-center gap-1.5 text-xs font-black text-purple-700">
                <span>Trải nghiệm AI</span>
                <ArrowUpRight className="size-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </div>

            {/* Card 6 */}
            <div className="p-6 sm:p-7 rounded-3xl bg-slate-50 border border-slate-200/80 hover:border-[#003B95]/40 hover:shadow-xl hover:-translate-y-1 transition duration-200 group">
              <div className="size-12 rounded-2xl bg-rose-600 text-white grid place-items-center shadow-md shadow-rose-600/20 group-hover:scale-110 transition">
                <Users className="size-6" />
              </div>
              <h3 className="mt-5 text-lg font-black text-slate-900 group-hover:text-rose-700 transition">
                Mạng Lưới &amp; Biểu Quyết Đại Hội
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                Bỏ phiếu trực tuyến minh bạch tại các phiên đại hội toàn thể, cùng mạng xã hội nội khối kết nối doanh nhân CEO 1983 văn minh, chuẩn mực.
              </p>
              <div className="mt-4 flex items-center gap-1.5 text-xs font-black text-rose-700">
                <span>Tham gia biểu quyết</span>
                <ArrowUpRight className="size-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 5. LEADERSHIP & TESTIMONIALS ================= */}
      <section className="py-20 bg-slate-50 border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <span className="text-xs font-black uppercase tracking-wider text-amber-700 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20">
              Ban Điều Hành &amp; Tiếng Nói Hội Viên
            </span>
            <h2 className="mt-4 text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Tâm Huyết Kiến Tạo Từ Ban Lãnh Đạo
            </h2>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Testimonial 1 - President */}
            <div className="p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="size-4 fill-current" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-slate-700 italic leading-relaxed">
                  "CEO 1983 không chỉ là một câu lạc bộ doanh nghiệp, mà là mái nhà chung nơi những người bạn cùng năm sinh 1983 cùng chia sẻ trí tuệ, nguồn lực và kết nối giao thương để đưa doanh nghiệp Việt vươn tầm."
                </p>
              </div>
              <div className="mt-6 pt-5 border-t border-slate-100 flex items-center gap-3">
                <div className="size-11 rounded-full bg-[#003B95] text-white font-black text-xs grid place-items-center">
                  LTD
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900">Chị Lê Thị Dung</h4>
                  <p className="text-[11px] text-[#003B95] font-bold">Chủ tịch CLB Doanh Nhân CEO 1983</p>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="size-4 fill-current" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-slate-700 italic leading-relaxed">
                  "Việc ra mắt ứng dụng Mobile và Cổng CRM giúp các thương vụ giao thương B2B của chúng tôi diễn ra nhanh chóng, rõ ràng và có minh chứng bảo chứng rất cao."
                </p>
              </div>
              <div className="mt-6 pt-5 border-t border-slate-100 flex items-center gap-3">
                <div className="size-11 rounded-full bg-amber-600 text-white font-black text-xs grid place-items-center">
                  BĐH
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900">Ban Phó Chủ Tịch</h4>
                  <p className="text-[11px] text-amber-700 font-bold">Phụ trách Giao Thương &amp; Xúc Tiến B2B</p>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="size-4 fill-current" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-slate-700 italic leading-relaxed">
                  "Hội viên tham gia được cấp thẻ số NFC và QR Code định danh ngay trên điện thoại, đi dự hội nghị hay kết nối chỉ cần chạm nhẹ là có đầy đủ hồ sơ năng lực."
                </p>
              </div>
              <div className="mt-6 pt-5 border-t border-slate-100 flex items-center gap-3">
                <div className="size-11 rounded-full bg-emerald-600 text-white font-black text-xs grid place-items-center">
                  BTK
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900">Ban Thư Ký CLB</h4>
                  <p className="text-[11px] text-emerald-700 font-bold">Quản Trị Dữ Liệu &amp; Hội Viên</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 6. FAQ ACCORDION ================= */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="text-xs font-black uppercase tracking-wider text-[#003B95] px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-100">
              Hỏi Đáp Phổ Biến
            </span>
            <h2 className="mt-4 text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Những Câu Hỏi Thường Gặp
            </h2>
          </div>

          <div className="mt-12 space-y-3.5">
            {[
              {
                q: "Điều kiện để gia nhập CLB Doanh Nhân CEO 1983 là gì?",
                a: "Hội viên tham gia là các Doanh nhân, Nhà sáng lập, Chủ tịch, Tổng giám đốc hoặc Cấp quản lý cấp cao sinh năm 1983 (hoặc điều hành doanh nghiệp tiêu biểu được bảo trợ bởi hội viên chính thức). Hồ sơ gia nhập sẽ được Ban Thư ký và Ban Điều hành xem xét theo quy chế chính thức của HanoiBA.",
              },
              {
                q: "Ứng dụng CEO 1983 hỗ trợ những thiết bị và nền tảng nào?",
                a: "Ứng dụng hỗ trợ đa nền tảng: Cài đặt trực tiếp trên hệ điều hành iOS (App Store) và Android (Google Play), đồng thời hỗ trợ phiên bản Web App responsive trên mọi trình duyệt điện thoại và máy tính.",
              },
              {
                q: "Làm thế nào để đăng ký niêm yết sản phẩm lên Sàn B2B nội khối?",
                a: "Sau khi tài khoản hội viên được phê duyệt chính thức, bạn vào mục 'Sàn Thương Mại' trên app hoặc cổng CRM, chọn 'Đăng Sản Phẩm', nhập thông tin, hình ảnh, mức chiết khấu ưu đãi cho hội viên và gửi duyệt. Ban Giao thương sẽ thẩm định trong vòng 24 giờ làm việc.",
              },
              {
                q: "Tính năng đặt lịch hẹn 1-on-1 hoạt động như thế nào?",
                a: "Bạn có thể tìm kiếm đối tác theo ngành nghề tại danh bạ, bấm 'Lên lịch gặp', chọn thời gian và địa điểm mong muốn. Hệ thống tự động gửi tin nhắn thông báo đến người nhận. Khi họ đồng ý, lịch hẹn sẽ được lưu và nhắc nhở tự động.",
              },
            ].map((faq, idx) => {
              const isOpen = activeFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200/80 bg-slate-50/60 overflow-hidden transition"
                >
                  <button
                    type="button"
                    onClick={() => setActiveFaqIndex(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-slate-900 hover:text-[#003B95] transition cursor-pointer"
                  >
                    <span className="text-sm sm:text-base">{faq.q}</span>
                    <div className="size-6 rounded-full bg-slate-200/60 flex items-center justify-center shrink-0">
                      {isOpen ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                    </div>
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= 7. APP DOWNLOAD & CTA BANNER ================= */}
      <section id="download" className="py-16 bg-gradient-to-br from-[#003B95] via-[#002B70] to-slate-950 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="max-w-3xl mx-auto space-y-4">
            <span className="text-xs font-black uppercase tracking-wider text-amber-400 px-3 py-1 rounded-full bg-white/10">
              Trải Nghiệm Ngay Hôm Nay
            </span>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight">
              Sẵn Sàng Nâng Tầm Doanh Nghiệp Cùng CEO 1983?
            </h2>
            <p className="text-sm sm:text-base text-blue-100 font-medium">
              Tải ứng dụng di động hoặc đăng nhập Cổng Quản Trị CRM để bắt đầu kết nối giao thương cùng 1.983+ lãnh đạo doanh nhân tinh hoa.
            </p>

            <div className="pt-6 flex flex-wrap items-center justify-center gap-4">
              <a
                href="/login"
                className="px-8 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/20 hover:scale-105 active:scale-95 transition flex items-center gap-2"
              >
                <span>Vào Cổng Quản Trị CRM</span>
                <ArrowRight className="size-4" />
              </a>
              <button
                type="button"
                onClick={() => handleOpenSubScreen("scr-register")}
                className="px-8 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-sm shadow-lg active:scale-95 transition flex items-center gap-2 cursor-pointer"
              >
                <Users className="size-4" />
                <span>Nộp Hồ Sơ Gia Nhập CLB</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 8. FOOTER (Official ceo1983.com Brand) ================= */}
      <footer className="bg-slate-950 text-slate-400 py-14 border-t border-slate-900 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            {/* Col 1: Brand */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-[#003B95] p-2 flex items-center justify-center">
                  <img
                    src="/ceo1983-emblem-8.png"
                    alt="Emblem"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = "none";
                    }}
                  />
                  <Sparkles className="size-4 text-amber-400" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white">CLB DOANH NHÂN CEO 1983</h4>
                  <p className="text-[10px] text-amber-500 font-bold uppercase">Trực thuộc HanoiBA</p>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Mạng lưới liên kết, xúc tiến giao thương B2B và nâng tầm vị thế các nhà lãnh đạo doanh nghiệp sinh năm 1983.
              </p>
            </div>

            {/* Col 2: Liên hệ */}
            <div className="space-y-2">
              <h5 className="text-xs font-black text-white uppercase tracking-wider mb-3">Thông Tin Trụ Sở</h5>
              <div className="flex items-start gap-2 text-slate-400">
                <MapPin className="size-4 text-[#003B95] shrink-0 mt-0.5" />
                <span>Cung Tri Thức Thành Phố, Số 1 Tôn Thất Thuyết, Cầu Giấy, Hà Nội</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <Phone className="size-4 text-[#003B95] shrink-0" />
                <span>Hotline: 0983.1983.83</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <Mail className="size-4 text-[#003B95] shrink-0" />
                <span>Email: contact@ceo1983.viconnect.vn</span>
              </div>
            </div>

            {/* Col 3: Liên kết */}
            <div className="space-y-2">
              <h5 className="text-xs font-black text-white uppercase tracking-wider mb-3">Hệ Thống &amp; Cổng Số</h5>
              <p>
                <a href="https://ceo1983.com" target="_blank" rel="noreferrer" className="hover:text-white transition">
                  Website chính thức: ceo1983.com
                </a>
              </p>
              <p>
                <a href="https://ceo1983.viconnect.vn" target="_blank" rel="noreferrer" className="hover:text-white transition">
                  Cổng CRM: ceo1983.viconnect.vn
                </a>
              </p>
              <p>
                <a href="#features" className="hover:text-white transition">
                  Sàn Thương Mại B2B Nội Khối
                </a>
              </p>
              <p>
                <a href="#download" className="hover:text-white transition">
                  Tải Ứng Dụng Di Động
                </a>
              </p>
            </div>

            {/* Col 4: Bảo trợ */}
            <div className="space-y-3">
              <h5 className="text-xs font-black text-white uppercase tracking-wider mb-3">Đơn Vị Bảo Trợ</h5>
              <p className="text-slate-400 leading-relaxed">
                Hội Doanh Nghiệp Trẻ Hà Nội (HanoiBA) — Thành viên Hội Liên Hiệp Thanh Niên Việt Nam.
              </p>
              <div className="inline-block p-2 rounded-xl bg-white/5 border border-white/10 text-[10px] text-amber-400 font-bold">
                Bảo vệ bởi bản quyền &amp; thương hiệu CEO 1983
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left text-slate-500 text-[11px]">
            <p>© 2026 CLB Doanh Nhân CEO 1983 (HanoiBA). Tất cả các quyền được bảo lưu.</p>
            <p className="font-mono text-slate-600">Phiên bản nền tảng 5.0 • Chuẩn hóa Web CRM &amp; Mobile App</p>
          </div>
        </div>
      </footer>

      {/* ================= 9. MODAL SUB-SCREENS (Chi tiết nội dung khi click menu/nút) ================= */}
      {activeSubScreen && (
        <div className="fixed inset-0 z-[100] grid place-items-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl max-h-[85vh] rounded-3xl bg-white text-slate-900 shadow-2xl overflow-hidden flex flex-col border border-slate-200 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="size-9 rounded-xl bg-[#003B95] text-white grid place-items-center">
                  <FileText className="size-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">{activeSubScreen.title}</h3>
                  {activeSubScreen.subtitle && (
                    <p className="text-xs text-slate-500 font-medium">{activeSubScreen.subtitle}</p>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveSubScreen(null)}
                className="size-8 rounded-full bg-slate-200/80 text-slate-600 hover:text-slate-900 grid place-items-center cursor-pointer transition"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
              {activeSubScreen.images && activeSubScreen.images.length > 0 && (
                <div className="rounded-2xl overflow-hidden max-h-60 border border-slate-200">
                  <img
                    src={activeSubScreen.images[0]}
                    alt={activeSubScreen.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              {activeSubScreen.contentHtml ? (
                <div
                  className="prose prose-sm max-w-none text-slate-700"
                  dangerouslySetInnerHTML={{ __html: activeSubScreen.contentHtml }}
                />
              ) : (
                <p>Nội dung chi tiết cho phân hệ đang được đồng bộ hóa từ hệ thống quản trị.</p>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setActiveSubScreen(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition cursor-pointer"
              >
                Đóng
              </button>
              {activeSubScreen.ctaButton && (
                <button
                  type="button"
                  onClick={() => {
                    alert(`Đã ghi nhận yêu cầu: ${activeSubScreen.ctaButton?.label}`);
                    setActiveSubScreen(null);
                  }}
                  className="px-5 py-2 rounded-xl bg-[#003B95] text-white text-xs font-bold shadow-md hover:bg-[#002B70] transition cursor-pointer"
                >
                  {activeSubScreen.ctaButton.label}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= 10. VIDEO MODAL ================= */}
      {isVideoModalOpen && (
        <div className="fixed inset-0 z-[100] grid place-items-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl rounded-3xl bg-slate-950 text-white overflow-hidden shadow-2xl border border-slate-800">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Play className="size-4 text-amber-400" />
                <span className="text-xs font-black uppercase tracking-wider text-slate-200">
                  Video Giới Thiệu Hệ Sinh Thái Doanh Nhân CEO 1983
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsVideoModalOpen(false)}
                className="size-8 rounded-full bg-white/10 hover:bg-white/20 text-white grid place-items-center cursor-pointer transition"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="aspect-video w-full bg-black relative flex items-center justify-center p-6 text-center">
              <div className="space-y-4 max-w-md">
                <div className="size-16 rounded-full bg-blue-600/30 border border-blue-400/50 text-blue-400 grid place-items-center mx-auto">
                  <Play className="size-7 fill-current ml-1" />
                </div>
                <div>
                  <h4 className="text-base font-black text-white">Video Trailer Ra Mắt Hệ Thống CEO 1983</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Ghi lại những khoảnh khắc Đại hội, Gala kết nối và câu chuyện truyền cảm hứng từ các lãnh đạo doanh nhân sinh năm 1983 trực thuộc HanoiBA.
                  </p>
                </div>
                <div className="pt-2">
                  <a
                    href="https://ceo1983.com"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#003B95] text-white text-xs font-bold hover:brightness-110"
                  >
                    <span>Xem thêm trên ceo1983.com</span>
                    <ExternalLink className="size-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

