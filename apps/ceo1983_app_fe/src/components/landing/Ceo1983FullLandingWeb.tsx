import React, { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import {
  Building2,
  Users,
  Calendar,
  Handshake,
  Award,
  Sparkles,
  ShieldCheck,
  Phone,
  Mail,
  MapPin,
  Globe,
  ChevronRight,
  ArrowRight,
  ExternalLink,
  QrCode,
  Smartphone,
  CheckCircle2,
  Download,
  Menu,
  X,
  CreditCard,
  Briefcase,
  Layers,
} from "lucide-react";
import { Ceo1983MemberRegistrationForm } from "./Ceo1983MemberRegistrationForm";

export function Ceo1983FullLandingWeb() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-[#B8860B]/20 selection:text-[#B8860B]">
      {/* ── 1. HEADER THANH MENU CỐ ĐỊNH (STICKY TOP NAVBAR) ── */}
      <header className="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo & Tên CLB */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => scrollTo("hero")}>
            <div className="size-12 rounded-xl bg-linear-to-br from-[#1F3864] via-[#003B95] to-[#B8860B] p-0.5 shadow-md flex items-center justify-center shrink-0">
              <img
                src="https://ceo1983.viconnect.vn/logo_ceo_1983_round.png"
                alt="CEO 1983"
                className="w-full h-full object-contain rounded-xl bg-white"
                onError={(e: any) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-wider text-[#B8860B]">
                HỘI DOANH NGHIỆP TRẺ HÀ NỘI (HANOIBA)
              </div>
              <div className="text-base sm:text-lg font-black tracking-tight text-[#1F3864] dark:text-white flex items-center gap-1.5">
                <span>CLB DOANH NHÂN CEO 1983</span>
              </div>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-bold">
            <button
              type="button"
              onClick={() => scrollTo("hero")}
              className="text-slate-700 dark:text-slate-300 hover:text-[#003B95] dark:hover:text-[#B8860B] transition cursor-pointer"
            >
              Trang Chủ
            </button>
            <button
              type="button"
              onClick={() => scrollTo("about")}
              className="text-slate-700 dark:text-slate-300 hover:text-[#003B95] dark:hover:text-[#B8860B] transition cursor-pointer"
            >
              Về Chúng Tôi
            </button>
            <button
              type="button"
              onClick={() => scrollTo("departments")}
              className="text-slate-700 dark:text-slate-300 hover:text-[#003B95] dark:hover:text-[#B8860B] transition cursor-pointer"
            >
              6 Ban Chuyên Môn
            </button>
            <button
              type="button"
              onClick={() => scrollTo("events")}
              className="text-slate-700 dark:text-slate-300 hover:text-[#003B95] dark:hover:text-[#B8860B] transition cursor-pointer"
            >
              Sự Kiện & Kỳ Họp
            </button>
            <button
              type="button"
              onClick={() => scrollTo("b2b")}
              className="text-slate-700 dark:text-slate-300 hover:text-[#003B95] dark:hover:text-[#B8860B] transition cursor-pointer"
            >
              Sàn Giao Thương B2B
            </button>
            <button
              type="button"
              onClick={() => scrollTo("benefits")}
              className="text-slate-700 dark:text-slate-300 hover:text-[#003B95] dark:hover:text-[#B8860B] transition cursor-pointer"
            >
              Đặc Quyền Hội Viên
            </button>
            <button
              type="button"
              onClick={() => scrollTo("register")}
              className="text-[#003B95] dark:text-[#B8860B] hover:underline font-black transition cursor-pointer"
            >
              Đăng Ký Gia Nhập
            </button>
          </nav>

          {/* Action Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            <Link
              to="/association/login"
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 transition shadow-2xs"
            >
              Đăng Nhập
            </Link>
            <Link
              to="/association"
              className="px-4 py-2 rounded-xl bg-linear-to-r from-[#1F3864] to-[#003B95] hover:brightness-110 text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5"
            >
              <Smartphone className="size-3.5" />
              <span>Mở App Hội Viên</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
          >
            {mobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 pt-2 pb-6 space-y-3 text-sm font-bold shadow-xl animate-in slide-in-from-top-4 duration-200">
            <button
              type="button"
              onClick={() => scrollTo("hero")}
              className="block w-full text-left py-2 text-slate-700 dark:text-slate-300 hover:text-[#003B95]"
            >
              Trang Chủ
            </button>
            <button
              type="button"
              onClick={() => scrollTo("about")}
              className="block w-full text-left py-2 text-slate-700 dark:text-slate-300 hover:text-[#003B95]"
            >
              Về Chúng Tôi
            </button>
            <button
              type="button"
              onClick={() => scrollTo("departments")}
              className="block w-full text-left py-2 text-slate-700 dark:text-slate-300 hover:text-[#003B95]"
            >
              6 Ban Chuyên Môn
            </button>
            <button
              type="button"
              onClick={() => scrollTo("events")}
              className="block w-full text-left py-2 text-slate-700 dark:text-slate-300 hover:text-[#003B95]"
            >
              Sự Kiện & Kỳ Họp
            </button>
            <button
              type="button"
              onClick={() => scrollTo("b2b")}
              className="block w-full text-left py-2 text-slate-700 dark:text-slate-300 hover:text-[#003B95]"
            >
              Sàn Giao Thương B2B
            </button>
            <button
              type="button"
              onClick={() => scrollTo("benefits")}
              className="block w-full text-left py-2 text-slate-700 dark:text-slate-300 hover:text-[#003B95]"
            >
              Đặc Quyền Hội Viên
            </button>
            <button
              type="button"
              onClick={() => scrollTo("register")}
              className="block w-full text-left py-2 text-[#003B95] dark:text-[#B8860B] font-black"
            >
              Đăng Ký Gia Nhập
            </button>
            <div className="pt-3 flex gap-2">
              <Link
                to="/association/login"
                className="flex-1 text-center py-2.5 rounded-xl border border-slate-300 text-xs font-bold"
              >
                Đăng Nhập
              </Link>
              <Link
                to="/association"
                className="flex-1 text-center py-2.5 rounded-xl bg-[#003B95] text-white text-xs font-bold"
              >
                Mở App
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ── 2. HERO SECTION HOÀNH TRÁNG ── */}
      <section
        id="hero"
        className="relative pt-16 pb-24 lg:pt-24 lg:pb-32 overflow-hidden bg-linear-to-b from-slate-100 via-white to-slate-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 border-b border-slate-200/80 dark:border-slate-800"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#B8860B]/10 border border-[#B8860B]/30 text-[#B8860B] font-black text-xs uppercase tracking-wider">
              <Sparkles className="size-3.5" />
              <span>HỆ SINH THÁI DOANH NHÂN HANOIBA TIÊN PHONG</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#1F3864] dark:text-white leading-tight">
              CLB DOANH NHÂN <span className="text-[#B8860B]">CEO 1983</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              Cộng đồng kết nối giao thương B2B, xúc tiến thương mại, chia sẻ tri thức quản trị và nâng tầm thương hiệu cho các chủ doanh nghiệp sinh năm 1983 trực thuộc Hội Doanh Nghiệp Trẻ Hà Nội.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => scrollTo("register")}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-linear-to-r from-[#1F3864] to-[#003B95] hover:brightness-110 text-white font-bold text-sm shadow-md transition active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Đăng Ký Gia Nhập Online</span>
                <ArrowRight className="size-4" />
              </button>
              <Link
                to="/association"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-800 dark:text-slate-200 font-bold text-sm shadow-2xs transition active:scale-95 flex items-center justify-center gap-2"
              >
                <Smartphone className="size-4 text-[#003B95]" />
                <span>Trải Nghiệm App CEO 1983</span>
              </Link>
            </div>
          </div>

          {/* 4 Chỉ số ấn tượng */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 max-w-5xl mx-auto">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm text-center space-y-1">
              <div className="text-3xl lg:text-4xl font-black text-[#1F3864] dark:text-[#B8860B]">500+</div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Hội Viên Chính Thức</div>
              <div className="text-[11px] text-slate-500">Chủ tịch, CEO các doanh nghiệp</div>
            </div>
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm text-center space-y-1">
              <div className="text-3xl lg:text-4xl font-black text-emerald-600 dark:text-emerald-400">1.850+ Tỷ</div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Giá Trị Giao Thương</div>
              <div className="text-[11px] text-slate-500">Doanh số kết nối B2B thực chất</div>
            </div>
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm text-center space-y-1">
              <div className="text-3xl lg:text-4xl font-black text-[#003B95] dark:text-blue-400">60+</div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Sự Kiện & Diễn Đàn</div>
              <div className="text-[11px] text-slate-500">Gala, Hội thảo, Cafe Doanh nhân</div>
            </div>
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm text-center space-y-1">
              <div className="text-3xl lg:text-4xl font-black text-amber-600 dark:text-amber-400">6 Ban</div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Ban Chuyên Môn Cốt Lõi</div>
              <div className="text-[11px] text-slate-500">Vận hành theo chuẩn YBA chuyên nghiệp</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. VỀ CHÚNG TÔI & GIÁ TRỊ CỐT LÕI ── */}
      <section id="about" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-black uppercase tracking-wider text-[#B8860B]">VỀ CLB CEO 1983</span>
          <h2 className="text-2xl sm:text-3xl font-black text-[#1F3864] dark:text-white">
            Nơi Hội Tụ Tinh Hoa Doanh Nhân Sinh Năm 1983
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Được bảo trợ bởi Hội Doanh Nghiệp Trẻ Hà Nội (HanoiBA), CLB Doanh Nhân CEO 1983 là tổ chức xã hội - nghề nghiệp tự nguyện, gắn kết những nhà lãnh đạo tài năng cùng chung khát vọng vươn tầm.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
            <div className="size-12 rounded-xl bg-blue-500/10 text-blue-600 grid place-items-center font-bold">
              <Handshake className="size-6" />
            </div>
            <h3 className="text-base font-bold text-[#1F3864] dark:text-white">Kết Nối Chân Thành</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Môi trường giao lưu cởi mở giữa những người bạn cùng trang lứa, sẻ chia khó khăn và nhân rộng cơ hội trên tinh thần tin cậy tuyệt đối.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
            <div className="size-12 rounded-xl bg-amber-500/10 text-amber-600 grid place-items-center font-bold">
              <Sparkles className="size-6" />
            </div>
            <h3 className="text-base font-bold text-[#1F3864] dark:text-white">Hợp Tác Thực Chất</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Ưu tiên sử dụng sản phẩm, dịch vụ của nhau; xúc tiến các thương vụ B2B quy mô lớn và hình thành các liên minh doanh nghiệp vững chắc.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
            <div className="size-12 rounded-xl bg-emerald-500/10 text-emerald-600 grid place-items-center font-bold">
              <Award className="size-6" />
            </div>
            <h3 className="text-base font-bold text-[#1F3864] dark:text-white">Phát Triển Bền Vững</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Thường xuyên tổ chức các buổi tọa đàm đào tạo, chuyển đổi số doanh nghiệp, quản trị tài chính và xây dựng văn hóa doanh nhân chuẩn mực.
            </p>
          </div>
        </div>
      </section>

      {/* ── 4. 6 BAN CHUYÊN MÔN CỐT LÕI ── */}
      <section id="departments" className="py-20 bg-slate-100/60 dark:bg-slate-900/40 border-y border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-[#B8860B]">CƠ CẤU VẬN HÀNH CHUYÊN NGHIỆP</span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#1F3864] dark:text-white">
              6 Ban Chuyên Môn Đồng Hành Cùng Hội Viên
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Ban Thư Ký & Pháp Chế",
                desc: "Đầu mối tiếp nhận hồ sơ gia nhập, hỗ trợ thủ tục pháp lý doanh nghiệp và điều phối hoạt động thường trực.",
                icon: ShieldCheck,
              },
              {
                title: "Ban Hội Viên & Đào Tạo",
                desc: "Thẩm định chất lượng hội viên mới, tổ chức các khóa huấn luyện chuyên sâu về kỹ năng quản trị và điều hành.",
                icon: Users,
              },
              {
                title: "Ban Tài Chính & Ngân Sách",
                desc: "Quản lý minh bạch quỹ hoạt động CLB, thẩm định các nguồn tài trợ và báo cáo tài chính định kỳ theo chuẩn kiểm toán.",
                icon: CreditCard,
              },
              {
                title: "Ban Xúc Tiến Thương Mại & Đầu Tư",
                desc: "Tổ chức các phiên Matching B2B, tìm kiếm đầu ra sản phẩm và kết nối các nguồn vốn đầu tư chiến lược.",
                icon: Handshake,
              },
              {
                title: "Ban Truyền Thông & Sự Kiện",
                desc: "Xây dựng hình ảnh thương hiệu CLB, tổ chức các kỳ Đại hội, Gala Dinner và lan tỏa giá trị doanh nhân 1983.",
                icon: Calendar,
              },
              {
                title: "Ban Quan Hệ Đối Ngoại",
                desc: "Mở rộng liên kết với các hiệp hội doanh nghiệp trong và ngoài nước, đón tiếp các đoàn xúc tiến thương mại quốc tế.",
                icon: Globe,
              },
            ].map((dept, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-[#003B95] dark:hover:border-[#B8860B] transition space-y-2.5"
              >
                <div className="size-10 rounded-xl bg-primary/10 text-primary grid place-items-center font-bold">
                  <dept.icon className="size-5" />
                </div>
                <h3 className="text-sm font-black text-[#1F3864] dark:text-white">{dept.title}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{dept.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. FORM ĐĂNG KÝ GIA NHẬP ONLINE (TRỌNG TÂM CỦA LANDING) ── */}
      <section id="register" className="py-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-3">
          <span className="text-xs font-black uppercase tracking-wider text-[#B8860B]">ĐĂNG KÝ THÀNH VIÊN</span>
          <h2 className="text-2xl sm:text-3xl font-black text-[#1F3864] dark:text-white">
            Gia Nhập Cộng Đồng Doanh Nhân CEO 1983
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-xl mx-auto">
            Điền biểu mẫu trực tuyến dưới đây. Ban Thư Ký CLB sẽ liên hệ hỗ trợ thẩm định và cấp Thẻ Hội Viên Số trong vòng 24 giờ.
          </p>
        </div>

        <div className="p-6 sm:p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl">
          <Ceo1983MemberRegistrationForm />
        </div>
      </section>

      {/* ── 6. FOOTER CHUYÊN NGHIỆP ── */}
      <footer className="bg-[#1F3864] text-white pt-16 pb-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <img
                  src="https://ceo1983.viconnect.vn/logo_ceo_1983_round.png"
                  alt="CEO 1983"
                  className="size-10 rounded-xl bg-white p-0.5 object-contain"
                />
                <div>
                  <div className="text-sm font-black tracking-tight">CLB DOANH NHÂN CEO 1983</div>
                  <div className="text-[10px] text-[#B8860B] font-bold">HỘI DOANH NGHIỆP TRẺ HÀ NỘI (HANOIBA)</div>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Mạng lưới kết nối giao thương B2B, xúc tiến thương mại và đồng hành phát triển bền vững cho các chủ doanh nghiệp sinh năm 1983.
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <h4 className="font-black text-sm uppercase tracking-wider text-[#B8860B]">Thông Tin Trụ Sở</h4>
              <div className="space-y-2 text-slate-300">
                <div className="flex items-start gap-2">
                  <MapPin className="size-4 shrink-0 text-[#B8860B] mt-0.5" />
                  <span>Tầng 5, Cung Trí Thức Hà Nội, Số 1 Tôn Thất Thuyết, Cầu Giấy, Hà Nội</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="size-4 shrink-0 text-[#B8860B]" />
                  <span>Hotline: 024.3755.1983 / 0983.1983.83</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="size-4 shrink-0 text-[#B8860B]" />
                  <span>Email: contact@ceo1983.vn / thuky@ceo1983.vn</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <h4 className="font-black text-sm uppercase tracking-wider text-[#B8860B]">Phân Hệ Trực Tuyến</h4>
              <ul className="space-y-2 text-slate-300 font-medium">
                <li>
                  <Link to="/association" className="hover:text-white transition flex items-center gap-1.5">
                    <ChevronRight className="size-3 text-[#B8860B]" />
                    <span>Ứng Dụng Di Động Hội Viên CEO 1983</span>
                  </Link>
                </li>
                <li>
                  <Link to="/association/opportunities" className="hover:text-white transition flex items-center gap-1.5">
                    <ChevronRight className="size-3 text-[#B8860B]" />
                    <span>Sàn Cơ Hội Kinh Doanh B2B</span>
                  </Link>
                </li>
                <li>
                  <Link to="/association/login" className="hover:text-white transition flex items-center gap-1.5">
                    <ChevronRight className="size-3 text-[#B8860B]" />
                    <span>Cổng Đăng Nhập CRM Quản Trị</span>
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-700/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
            <div>© 2026 CLB Doanh Nhân CEO 1983 (HanoiBA). Bảo lưu mọi quyền.</div>
            <div className="flex items-center gap-4">
              <span>Điều khoản sử dụng</span>
              <span>•</span>
              <span>Chính sách bảo mật</span>
              <span>•</span>
              <span>Hỗ trợ kỹ thuật ViConnect</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

