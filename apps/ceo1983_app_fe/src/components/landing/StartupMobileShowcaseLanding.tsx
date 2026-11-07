import React, { useState, useEffect, useRef } from "react";
import { sanitizeHtml } from "../../lib/sanitize";
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
  Globe,
  Compass,
  Ticket,
  ChevronLeft,
  Send,
  Bell,
  Heart,
  Bookmark,
  Check,
  MessageCircle,
  Share,
} from "lucide-react";
import type {
  LandingWebConfig,
  LandingMenuItem,
  LandingSubScreen,
  StartupMobileTemplateConfig,
} from "./TimedCardsOpeningLanding";
import { resolveMediaUrl } from "@/lib/api-client";

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
  const [activeNav, setActiveNav] = useState("home");
  const [activeFaqIndex, setActiveFaqIndex] = useState<number | null>(0);
  const [activeAppTab, setActiveAppTab] = useState<"b2b" | "connect" | "card" | "analytics">("b2b");
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [activeTestimonialIdx, setActiveTestimonialIdx] = useState(0);
  const [selectedPin, setSelectedPin] = useState<string>("hanoi");
  const [selectedIndustry, setSelectedIndustry] = useState<string>("all");

  // Scroll & 3D Interactive Mouse Tilt States matching Pinterest Video
  const [scrollY, setScrollY] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleHeroMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setMousePos({ x, y });
  };

  const handleHeroMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  // 3D Rotation Calculation for Hand Holding Phone on Scroll & Mouse move
  const scrollTilt = Math.min(scrollY * 0.04, 12);
  const rotX = -mousePos.y * 0.025 + scrollTilt * 0.4;
  const rotY = mousePos.x * 0.025 - scrollTilt * 0.7;
  const rotZ = 4 - scrollTilt * 0.5;
  const transY = Math.min(scrollY * 0.06, 40);

  // Quick form states
  const [contactInput, setContactInput] = useState("");
  const [regForm, setRegForm] = useState({
    fullName: "",
    phone: "",
    company: "",
    position: "",
    message: "",
  });
  const [regSubmitted, setRegSubmitted] = useState(false);

  // Dynamic configuration from props
  const startup = config.startupConfig;
  const heroHeadline = startup?.hero?.headline || "Gắn Kết Đồng Niên\nNâng Tầm Doanh Nghiệp";
  const heroSubheadline =
    startup?.hero?.subheadline ||
    "Cộng đồng kết nối xúc tiến giao thương, nâng tầm quản trị thực chiến và bảo chứng tín nhiệm dành riêng cho các chủ doanh nghiệp sinh năm 1983 (Quý Hợi) trực thuộc Hội Doanh nghiệp Trẻ Hà Nội (HanoiBA).";
  const heroUnderline = startup?.hero?.underlineAccent || "Kết Nối – Chia Sẻ – Bứt Phá!";
  const handPhoneImg = startup?.hero?.handPhoneImage || "/images/landing/hand_holding_phone_transparent.png";
  const badge1 = startup?.hero?.floatingBadge1 || { title: "500+ Doanh Nghiệp", subtitle: "Hội viên chính thức HanoiBA" };
  const badge2 = startup?.hero?.floatingBadge2 || { title: "+105.8 Tỷ VNĐ", subtitle: "Giao thương B2B hoàn tất" };
  const ctaPrimaryText = startup?.hero?.ctaPrimaryText || "Khám Phá Ngay";
  const ctaSecondaryText = startup?.hero?.ctaSecondaryText || "Xem Video Giới Thiệu";
  const videoUrl =
    startup?.hero?.videoUrl ||
    "https://v1.pinimg.com/videos/iht/expMp4/v2/92/8a/ca/928aca8b8e476ade2d17a603c7e62015_720w.mp4";

  const ribbonStats =
    startup?.ribbonStats && startup.ribbonStats.length > 0
      ? startup.ribbonStats
      : [
        { value: "1.983+", label: "Hội Viên Doanh Nhân", desc: "Doanh nhân 1983 toàn quốc" },
        { value: "500+", label: "Doanh Nghiệp Thành Viên", desc: "Hội viên chính thức HanoiBA" },
        { value: "100+ Tỷ", label: "VNĐ Giao Thương B2B", desc: "Giá trị kết nối hoàn tất" },
        { value: "98%", label: "Tín Nhiệm Hài Lòng", desc: "Đánh giá giao thương thực chất" },
      ];

  // Mock phone screen dynamic data
  const phoneFeatures = {
    b2b: {
      title: "Sàn Thương Mại B2B",
      desc: "Niêm yết hơn 500+ sản phẩm & dịch vụ độc quyền từ các doanh nghiệp hội viên",
      stat: "500+ Sản phẩm B2B",
      badge: "Ưu đãi nội khối 15-30%",
      items: [
        { name: "Phần mềm ERP & Tòa nhà Thông minh", price: "2.0 Tỷ VNĐ", author: "ViConnect Tech" },
        { name: "Giải pháp Thiết bị Chiếu sáng IoT", price: "850 Tr VNĐ", author: "Rạng Đông Smart" },
        { name: "Thi công Nội thất Văn phòng VIP", price: "1.2 Tỷ VNĐ", author: "An Cường Interior" },
      ],
    },
    connect: {
      title: "Đặt Lịch Gặp 1-on-1",
      desc: "Xúc tiến đầu tư, kết nối trực tiếp với Chủ tịch và Ban Lãnh đạo các tập đoàn",
      stat: "1.250+ Cuộc gặp",
      badge: "Tự động gửi thông báo SMS/Zalo",
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
        { name: "Doanh nghiệp: Tập đoàn CEO 1983", price: "Hà Nội", author: "Nhiệm kỳ 2024-2029" },
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

  const appTabsData = {
    b2b: startup?.appTabs?.b2b ? { ...phoneFeatures.b2b, ...startup.appTabs.b2b } : phoneFeatures.b2b,
    connect: startup?.appTabs?.connect ? { ...phoneFeatures.connect, ...startup.appTabs.connect } : phoneFeatures.connect,
    card: startup?.appTabs?.card ? { ...phoneFeatures.card, ...startup.appTabs.card } : phoneFeatures.card,
    analytics: startup?.appTabs?.analytics ? { ...phoneFeatures.analytics, ...startup.appTabs.analytics } : phoneFeatures.analytics,
  };

  const currentTab = appTabsData[activeAppTab];

  // Testimonials matching Pinterest video horizontal carousel & official ceo1983.com content
  const defaultTestimonials = [
    {
      quote:
        "Nền tảng số hóa của CLB giúp các hội viên trao đổi cơ hội kinh doanh chỉ trong 1 chạm. Qua các phiên Business Matching và chia sẻ cơ hội B2B, doanh nghiệp tôi đã kết nối thành công nhiều hợp đồng chiến lược giá trị cao.",
      author: "Trần Tuấn Anh",
      role: "Phó Chủ Tịch CLB, CEO ViConnect Tech",
      company: "Ban Điều Hành CEO 1983",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    },
    {
      quote:
        "CLB Doanh nhân CEO 1983 là ngôi nhà chung gắn kết tình đồng niên chân thành, nơi chúng tôi cùng học hỏi, nâng tầm năng lực quản trị thực chiến và trao nhau cơ hội hợp tác kinh doanh thực chất, cùng vững bước vươn tầm.",
      author: "Lê Thị Dung",
      role: "Chủ tịch CLB Doanh Nhân CEO 1983",
      company: "Tổng Giám Đốc DGroup, Viện trưởng Viện Doanh Trí",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80",
    },
    {
      quote:
        "CEO 1983 là một trong những câu lạc bộ đồng niên năng động và đoàn kết nhất của HanoiBA. Các anh chị doanh nhân Quý Hợi luôn tràn đầy nhiệt huyết, bản lĩnh và tinh thần trách nhiệm vì cộng đồng.",
      author: "Nguyễn Hoàng Long",
      role: "Phó Chủ Tịch HanoiBA",
      company: "Hội Doanh nghiệp Trẻ Hà Nội",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    },
    {
      quote:
        "Các chương trình CEO Talk, Business Tour và tọa đàm chuyên đề mang lại giá trị tri thức thực chiến vô cùng quý báu, giúp các doanh nghiệp hội viên tự tin tháo gỡ điểm nghẽn và bứt phá mạnh mẽ.",
      author: "Đỗ Minh Đức",
      role: "Trưởng Ban Đào Tạo & Doanh Trí",
      company: "Ban Chuyên Môn CEO 1983",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
    },
  ];

  const activeTestimonials =
    startup?.testimonials && startup.testimonials.length > 0 ? startup.testimonials : defaultTestimonials;

  // Map chapter pins data matching Frame 00:07 - 00:08
  const defaultChapterPins = [
    { id: "hanoi", name: "Hà Nội — Trụ Sở Chính", count: "1.250+ Hội viên", desc: "Cung Tri Thức, Số 1 Tôn Thất Thuyết, Cầu Giấy", x: "48%", y: "22%" },
    { id: "haiphong", name: "Hải Phòng & Quảng Ninh", count: "210+ Hội viên", desc: "Cụm Công nghiệp & Cảng biển Logistics Đông Bắc", x: "55%", y: "27%" },
    { id: "danang", name: "Đà Nẵng & Miền Trung", count: "185+ Hội viên", desc: "Trung tâm xúc tiến đầu tư Du lịch & Dịch vụ", x: "57%", y: "48%" },
    { id: "hcm", name: "TP. Hồ Chí Minh", count: "320+ Hội viên", desc: "VP Đại diện Phía Nam & Kết nối thị trường tài chính", x: "52%", y: "78%" },
    { id: "cantho", name: "Cần Thơ & ĐBSCL", count: "95+ Hội viên", desc: "Mạng lưới kết nối Nông sản & Xuất khẩu", x: "46%", y: "85%" },
  ];

  const activePins =
    startup?.mapChapterPins && startup.mapChapterPins.length > 0 ? startup.mapChapterPins : defaultChapterPins;

  const defaultAvatars = [
    {
      id: "dung-le",
      name: "Lê Thị Dung",
      role: "Chủ tịch CLB Doanh Nhân CEO 1983",
      quote: "Xin chào! 👋",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80",
      badge: "LinkedIn",
    },
    {
      id: "tuan-anh",
      name: "Trần Tuấn Anh",
      role: "CEO ViConnect Tech",
      quote: "B2B Deal",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
      badge: "Zalo",
    },
    {
      id: "hoang-long",
      name: "Nguyễn Hoàng Long",
      role: "Phó Chủ Tịch Thường Trực HanoiBA",
      quote: "Lan tỏa giá trị tri thức",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
      badge: "LinkedIn",
    },
    {
      id: "minh-tri",
      name: "Hoàng Minh Trí",
      role: "Tổng Giám Đốc An Cường Interior",
      quote: "Chất lượng là danh dự",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
      badge: "TikTok",
    },
  ];

  const activeAvatars =
    startup?.communityAvatars && startup.communityAvatars.length > 0 ? startup.communityAvatars : defaultAvatars;

  const defaultFaqs = [
    {
      question: "CLB Doanh Nhân CEO 1983 là tổ chức gì và trực thuộc đơn vị nào?",
      answer: "CLB Doanh nhân CEO 1983 là cộng đồng quy tụ các chủ doanh nghiệp, nhà sáng lập sinh năm Quý Hợi (1983), hoạt động chính thức trực thuộc Hội Doanh nghiệp Trẻ Hà Nội (HanoiBA). CLB hoạt động với phương châm 'Gắn kết đồng niên - Nâng tầm doanh nghiệp', gắn kết tình thân đồng niên và thúc đẩy hợp tác kinh doanh thực chất.",
    },
    {
      question: "Sứ mệnh và các hoạt động trọng tâm của CLB bao gồm những gì?",
      answer: "Sứ mệnh của CLB là kiến tạo cộng đồng doanh nhân bản lĩnh, trí tuệ và nhân văn. Các hoạt động cốt lõi gồm: Xúc tiến giao thương B2B (Business Matching & Business Tour), Đào tạo nâng tầm quản trị (CEO Talk & CEO Exchange), Đặt lịch hẹn 1-on-1 giữa các lãnh đạo và các hoạt động trách nhiệm xã hội CSR (Áo ấm vùng cao, xây nhà tình nghĩa).",
    },
    {
      question: "Điều kiện để gia nhập trở thành Hội viên chính thức của CLB?",
      answer: "Hội viên là các Doanh nhân, Chủ tịch HĐQT, CEO, Tổng giám đốc hoặc Cấp quản lý doanh nghiệp sinh năm 1983 (Quý Hợi). Hồ sơ gia nhập sẽ được Ban Thẩm định và Ban Điều hành phê duyệt theo đúng quy chế hiệp hội của HanoiBA.",
    },
    {
      question: "Ứng dụng di động CEO 1983 mang lại những lợi ích gì cho hội viên?",
      answer: "Ứng dụng cung cấp trọn vẹn giải pháp số hóa: Thẻ Doanh nhân số & mã QR định danh cá nhân, Sàn thương mại B2B niêm yết sản phẩm/dịch vụ ưu đãi nội khối 15-30%, công cụ đặt lịch hẹn kết nối 1-on-1 trực tiếp, biểu đồ thống kê cơ hội minh bạch và thông báo đẩy lịch sự kiện thời gian thực.",
    },
    {
      question: "Làm thế nào để đăng ký niêm yết sản phẩm lên Sàn B2B nội khối?",
      answer: "Sau khi tài khoản hội viên được phê duyệt chính thức, bạn vào mục 'Sàn Thương Mại' trên app hoặc cổng CRM, chọn 'Đăng Sản Phẩm', nhập thông tin, hình ảnh, mức chiết khấu ưu đãi cho hội viên và gửi duyệt. Ban Giao thương sẽ thẩm định trong vòng 24 giờ làm việc.",
    },
  ];

  const activeFaqs = startup?.faqs && startup.faqs.length > 0 ? startup.faqs : defaultFaqs;

  const footerData = startup?.footer || {
    headline: "CLB DOANH NHÂN CEO 1983 — HANOIBA",
    description: "Cộng đồng kết nối giao thương, nâng tầm tri thức quản trị thực chiến và lan tỏa giá trị nhân văn cho các doanh nhân sinh năm 1983 trực thuộc Hội Doanh nghiệp Trẻ Hà Nội (HanoiBA).",
    contactPhone: "0983.1983.83",
    contactEmail: "contact@ceo1983.com",
    address: "Cung Tri Thức Thành Phố, Số 1 Tôn Thất Thuyết, Cầu Giấy, Hà Nội",
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regForm.fullName.trim() || !regForm.phone.trim()) {
      alert("Vui lòng điền đầy đủ Họ tên và Số điện thoại");
      return;
    }
    setRegSubmitted(true);
    setTimeout(() => {
      setRegSubmitted(false);
      setIsRegisterModalOpen(false);
      setRegForm({ fullName: "", phone: "", company: "", position: "", message: "" });
    }, 2000);
  };

  const handleQuickQuestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactInput.trim()) return;
    alert(`Cảm ơn bạn! Ban Thư ký đã nhận thông tin liên hệ (${contactInput}) và sẽ phản hồi trong 24 giờ.`);
    setContactInput("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F3F8FF] via-white to-[#F0F5FF] text-slate-800 font-sans selection:bg-[#003B95] selection:text-white relative overflow-x-hidden light [color-scheme:light]">
      {/* CSS Keyframe Animations for Hand & Floating Elements */}
      <style>{`
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes floatBadge1 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(1deg); }
        }
        @keyframes floatBadge2 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(-1deg); }
        }
        @keyframes pulsePin {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(0, 59, 149, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 12px rgba(0, 59, 149, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(0, 59, 149, 0); }
        }
        @keyframes bubblePop {
          0% { opacity: 0; transform: scale(0.8) translateY(10px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>

      {/* ================= 1. HEADER / NAVIGATION (Clean Pinterest White Nav with Blue Dot) ================= */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          {/* Logo & Brand matching Pinterest left layout */}
          <a href="#home" className="flex items-center gap-3 group">
            <div className="size-11 rounded-2xl bg-[#003B95] p-2 flex items-center justify-center shadow-md shadow-blue-900/20 group-hover:scale-105 transition">
              <img
                src="/ceo1983-emblem-8.png"
                alt="CEO 1983 Emblem"
                className="w-full h-full object-contain filter drop-shadow-sm"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = "none";
                }}
              />
              <Sparkles className="size-5 text-amber-400 hidden group-hover:block" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black tracking-tight text-[#003B95]">
                  CEO 1983
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 font-black tracking-wider uppercase">
                  HanoiBA
                </span>
              </div>
              <p className="text-[11px] font-bold text-slate-500 tracking-wide uppercase">
                CLB Doanh Nhân CEO 1983
              </p>
            </div>
          </a>

          {/* Centered Navigation Menu with active dot indicator matching Pinterest */}
          <nav className="hidden lg:flex items-center gap-8">
            {[
              { id: "home", label: "Trang chủ", href: "#home" },
              { id: "about", label: "Về CLB", href: "#features" },
              { id: "features", label: "Tính năng App", href: "#features" },
              { id: "map", label: "Điểm cầu", href: "#map-section" },
              { id: "community", label: "Cộng đồng", href: "#community-section" },
              { id: "testimonials", label: "Hội viên", href: "#testimonials-section" },
              { id: "faq", label: "Hỏi đáp FAQ", href: "#faq" },
            ].map((menu) => (
              <a
                key={menu.id}
                href={menu.href}
                onClick={() => setActiveNav(menu.id)}
                className="relative py-2 text-sm font-bold text-slate-700 hover:text-[#003B95] transition flex flex-col items-center"
              >
                <span>{menu.label}</span>
                {activeNav === menu.id && (
                  <span className="absolute bottom-0 w-4 h-1 rounded-full bg-[#003B95] animate-in fade-in zoom-in" />
                )}
              </a>
            ))}
          </nav>

          {/* Right Action CTAs: Dark pill + Outlined pill matching Pinterest */}
          <div className="hidden sm:flex items-center gap-3">
            <a
              href="/login"
              className="px-6 py-2.5 rounded-full bg-slate-900 hover:bg-black text-white text-xs font-bold shadow-sm hover:shadow transition"
            >
              Đăng Nhập CRM
            </a>
            <button
              type="button"
              onClick={() => setIsRegisterModalOpen(true)}
              className="px-6 py-2.5 rounded-full border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold transition shadow-2xs cursor-pointer"
            >
              Đăng Ký Hội Viên
            </button>
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
            <a
              href="#home"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 px-3 rounded-lg text-sm font-bold text-slate-800 hover:bg-slate-50"
            >
              Trang chủ
            </a>
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 px-3 rounded-lg text-sm font-bold text-slate-800 hover:bg-slate-50"
            >
              Tính năng App
            </a>
            <a
              href="#map-section"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 px-3 rounded-lg text-sm font-bold text-slate-800 hover:bg-slate-50"
            >
              Mạng Lưới Điểm Cầu
            </a>
            <a
              href="#community-section"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 px-3 rounded-lg text-sm font-bold text-slate-800 hover:bg-slate-50"
            >
              Cộng Đồng Hội Viên
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 px-3 rounded-lg text-sm font-bold text-slate-800 hover:bg-slate-50"
            >
              Hỏi Đáp FAQ
            </a>
            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              <a
                href="/login"
                className="w-full py-2.5 text-center text-xs font-bold rounded-full bg-slate-900 text-white"
              >
                Đăng Nhập CRM Quản Trị
              </a>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsRegisterModalOpen(true);
                }}
                className="w-full py-2.5 text-center text-xs font-bold rounded-full border border-slate-300 text-slate-800"
              >
                Đăng Ký Hội Viên Mới
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ================= 2. HERO SECTION WITH 3D SCROLL & MOUSE ROTATION ON HAND HOLDING PHONE ================= */}
      <section
        id="home"
        ref={heroRef}
        onMouseMove={handleHeroMouseMove}
        onMouseLeave={handleHeroMouseLeave}
        className="relative pt-8 pb-20 overflow-hidden"
      >
        {/* Soft Ambient Glow & Sky Blue Aura */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[850px] bg-gradient-to-tr from-blue-200/40 via-sky-100/50 to-white rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Column: Bold Typography with Playful Blue Doodles matching Pinterest Video Frame 00:01 */}
            <div className="lg:col-span-6 text-center lg:text-left space-y-6 relative">
              {/* Playful Blue Sunburst Doodle Accent above Title */}
              <div className="inline-block relative">
                <svg
                  className="w-16 h-8 text-[#0052FF] absolute -top-8 left-4 lg:left-0 opacity-80"
                  style={{ animation: "floatSlow 4s ease-in-out infinite" }}
                  viewBox="0 0 64 32"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                >
                  <path d="M12 28 C16 16, 24 8, 32 4" />
                  <path d="M26 30 C30 18, 38 10, 48 6" />
                  <path d="M40 30 C44 22, 52 16, 60 12" />
                </svg>
              </div>

              {/* Main Headline: Bold geometric sans-serif matching Pinterest */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.12]">
                {heroHeadline.includes("\n") ? (
                  heroHeadline.split("\n").map((line, idx) => (
                    <React.Fragment key={idx}>
                      {line} <br />
                    </React.Fragment>
                  ))
                ) : (
                  <>
                    {heroHeadline} <br />
                  </>
                )}
                <span className="relative inline-block text-slate-900">
                  {heroUnderline}
                  {/* Stylized Red / Coral Doodle Underline wave from Pinterest */}
                  <svg
                    className="absolute -bottom-2.5 left-0 w-full h-4 text-[#F05252]"
                    viewBox="0 0 260 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                  >
                    <path d="M4 11 Q 65 3, 130 10 T 256 7" />
                  </svg>
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
                {heroSubheadline}
              </p>

              {/* CTAs: Dark Pill Button "Get Started" + Play Video Button */}
              <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-4">
                <button
                  type="button"
                  onClick={() => setIsRegisterModalOpen(true)}
                  className="px-8 py-4 rounded-full bg-slate-900 hover:bg-black text-white font-black text-sm shadow-xl shadow-slate-900/20 hover:scale-105 active:scale-95 transition flex items-center gap-2 cursor-pointer"
                >
                  <span>{ctaPrimaryText}</span>
                  <ArrowRight className="size-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setIsVideoModalOpen(true)}
                  className="px-6 py-4 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-bold text-sm shadow-sm hover:shadow transition flex items-center gap-3 cursor-pointer"
                >
                  <div className="size-8 rounded-full bg-blue-50 text-[#003B95] grid place-items-center">
                    <Play className="size-3.5 fill-current ml-0.5" />
                  </div>
                  <span>{ctaSecondaryText}</span>
                </button>
              </div>

              {/* Interactive In-App Feature Selector Buttons */}
              <div className="pt-4 flex items-center justify-center lg:justify-start gap-2 flex-wrap">
                <span className="text-[11px] font-bold text-slate-400 mr-1 uppercase">Mô phỏng app:</span>
                {(["b2b", "connect", "card", "analytics"] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveAppTab(tab)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${activeAppTab === tab
                        ? "bg-[#003B95] text-white shadow-sm"
                        : "bg-white hover:bg-slate-100 text-slate-600 border border-slate-200"
                      }`}
                  >
                    {tab === "b2b" && "Sàn B2B"}
                    {tab === "connect" && "Lịch 1-on-1"}
                    {tab === "card" && "Thẻ QR"}
                    {tab === "analytics" && "Thống kê"}
                  </button>
                ))}
              </div>
            </div>

            {/* Right Column: Hand Holding Phone with Real 3D Perspective Rotation matching Video */}
            <div className="lg:col-span-6 relative flex justify-center items-center py-6">
              {/* Flying Birds Doodles around top-right matching Pinterest */}
              <svg
                className="w-20 h-14 text-sky-400 absolute -top-4 right-6 lg:right-12 opacity-80"
                style={{ animation: "floatSlow 5s ease-in-out infinite" }}
                viewBox="0 0 80 50"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M10 25 Q 18 12, 26 25 Q 34 12, 42 25" />
                <path d="M45 15 Q 52 4, 59 15 Q 66 4, 73 15" />
              </svg>

              {/* Curved sketch arrow doodle pointing to app */}
              <svg
                className="w-24 h-16 text-[#0052FF] absolute -bottom-4 left-4 hidden sm:block opacity-75"
                viewBox="0 0 100 60"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M10 50 C 30 10, 70 10, 85 35" />
                <path d="M78 35 L 85 35 L 85 28" />
              </svg>

              {/* Floating Stat Badge 1 (Left): Animated floating with 3D shadow */}
              <div
                className="hidden sm:flex absolute -left-4 top-20 z-30 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-xl border border-slate-100 items-center gap-3"
                style={{ animation: "floatBadge1 4.5s ease-in-out infinite" }}
              >
                <div className="size-10 rounded-xl bg-amber-500/15 text-amber-600 grid place-items-center">
                  <Award className="size-5" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-black text-slate-900">{badge1.title}</p>
                  <p className="text-[10px] text-slate-500 font-medium">{badge1.subtitle}</p>
                </div>
              </div>

              {/* Floating Stat Badge 2 (Right): Animated floating with 3D shadow */}
              <div
                className="hidden sm:flex absolute -right-4 bottom-24 z-30 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-xl border border-slate-100 items-center gap-3"
                style={{ animation: "floatBadge2 5s ease-in-out infinite 0.5s" }}
              >
                <div className="size-10 rounded-xl bg-emerald-500/15 text-emerald-600 grid place-items-center">
                  <TrendingUp className="size-5" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-black text-slate-900">{badge2.title}</p>
                  <p className="text-[10px] text-slate-500 font-medium">{badge2.subtitle}</p>
                </div>
              </div>

              {/* ================= THE HAND HOLDING PHONE WITH REAL 3D ROTATION ================= */}
              <div
                className="relative z-10 w-[310px] sm:w-[340px] select-none"
                style={{
                  transform: `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) rotateZ(${rotZ}deg) translateY(${transY}px)`,
                  transition: "transform 0.15s cubic-bezier(0.2, 0.8, 0.2, 1)",
                  transformStyle: "preserve-3d",
                }}
              >
                {/* Hand Holding Phone Authentic Image from Pinterest Design */}
                <div className="relative w-full">
                  <img
                    src={resolveMediaUrl(handPhoneImg) || "/images/landing/hand_holding_phone_transparent.png"}
                    alt="Hand holding phone"
                    className="w-full h-auto drop-shadow-2xl pointer-events-none"
                  />

                  {/* Dynamic Interactive App Screen Overlay inside the phone display */}
                  <div
                    className="absolute overflow-hidden bg-slate-50 text-slate-900 shadow-inner flex flex-col justify-between"
                    style={{
                      top: "6.2%",
                      left: "17%",
                      width: "66.5%",
                      height: "85.8%",
                      borderRadius: "26px",
                    }}
                  >
                    {/* Status Bar */}
                    <div className="pt-1.5 px-4 pb-0.5 flex items-center justify-between text-[8px] text-slate-600 font-bold bg-white">
                      <span>9:41</span>
                      <div className="flex items-center gap-1">
                        <span className="text-[8px]">5G</span>
                        <div className="w-3.5 h-1.5 rounded-2xs border border-slate-500 p-0.5 flex items-center">
                          <div className="h-full w-full bg-slate-800 rounded-3xs" />
                        </div>
                      </div>
                    </div>

                    {/* App Header Greeting */}
                    <div className="p-2.5 bg-white border-b border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className="size-6 rounded-full bg-[#003B95] text-white font-black text-[9px] grid place-items-center">
                          CEO
                        </div>
                        <div className="text-left leading-tight">
                          <p className="text-[8px] text-slate-400">Xin chào Doanh nhân,</p>
                          <p className="text-[10px] font-black text-slate-900">Trần Tuấn Anh</p>
                        </div>
                      </div>
                      <div className="size-5 rounded-full bg-slate-100 grid place-items-center text-slate-600">
                        <Search className="size-2.5" />
                      </div>
                    </div>

                    {/* App Dynamic Tab Feed */}
                    <div className="p-2.5 flex-1 bg-gradient-to-b from-white to-blue-50/40 text-left space-y-1.5 overflow-hidden">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black text-[#003B95] uppercase tracking-wide">
                          {currentTab.title}
                        </span>
                        <span className="text-[8px] px-1 py-0.5 rounded-md bg-amber-500/15 text-amber-700 font-bold">
                          {currentTab.stat}
                        </span>
                      </div>

                      {/* 2 Interactive Mini Cards */}
                      <div className="space-y-1.5 pt-0.5">
                        {currentTab.items.slice(0, 2).map((item, idx) => (
                          <div
                            key={idx}
                            className="p-1.5 rounded-lg bg-white border border-slate-200 shadow-2xs flex items-center justify-between gap-1"
                          >
                            <div className="min-w-0 flex-1">
                              <p className="text-[9px] font-bold text-slate-900 truncate">{item.name}</p>
                              <p className="text-[8px] text-slate-400 truncate">{item.author}</p>
                            </div>
                            <span className="text-[8px] px-1.5 py-0.5 rounded-md bg-[#003B95] text-white font-bold shrink-0">
                              {item.price}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Digital Card Mini preview if active tab is card */}
                      {activeAppTab === "card" && (
                        <div className="p-1.5 rounded-lg bg-gradient-to-r from-[#003B95] to-blue-800 text-white text-[8px] space-y-0.5 shadow-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold">THẺ HỘI VIÊN CHÍNH THỨC</span>
                            <QrCode className="size-3" />
                          </div>
                          <p className="font-mono text-amber-300">CEO1983-8888</p>
                        </div>
                      )}
                    </div>

                    {/* App Bottom Tab Bar */}
                    <div className="p-1.5 px-2 bg-white border-t border-slate-200 grid grid-cols-5 text-center text-slate-400 text-[7px]">
                      <div className="flex flex-col items-center gap-0.5 text-[#003B95] font-bold">
                        <Smartphone className="size-3" />
                        <span>Trang chủ</span>
                      </div>
                      <div className="flex flex-col items-center gap-0.5">
                        <Briefcase className="size-3" />
                        <span>Sàn B2B</span>
                      </div>
                      <div className="flex flex-col items-center gap-0.5 -mt-2">
                        <div className="size-5 rounded-full bg-[#003B95] text-white grid place-items-center shadow-xs">
                          <QrCode className="size-2.5" />
                        </div>
                      </div>
                      <div className="flex flex-col items-center gap-0.5">
                        <MessageSquare className="size-3" />
                        <span>Tin nhắn</span>
                      </div>
                      <div className="flex flex-col items-center gap-0.5">
                        <Users className="size-3" />
                        <span>Hội viên</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 3. SIGNATURE ROYAL BLUE STATS RIBBON matching Pinterest Frame 00:04 ================= */}
      <section className="bg-gradient-to-r from-[#003B95] via-[#0047BA] to-[#003B95] text-white py-10 shadow-xl border-y border-blue-900 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center divide-y lg:divide-y-0 lg:divide-x divide-white/20">
            {ribbonStats.slice(0, 4).map((st, sIdx) => (
              <div key={sIdx} className="pt-4 lg:pt-0 px-4 flex items-center justify-center gap-3">
                <span className="text-4xl sm:text-5xl font-black text-white tracking-tight">{st.value}</span>
                <div className="text-left">
                  <p className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">{st.label}</p>
                  <p className="text-[11px] text-blue-100">{st.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= 4. VALUE PILLARS & 3D ICONS ("That The Way To Camp!" -> Frame 00:05 - 00:06) ================= */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Header on Left matching Pinterest layout with doodle sunburst */}
            <div className="lg:col-span-4 space-y-4">
              <div className="relative inline-block">
                <svg
                  className="w-12 h-6 text-[#0052FF] absolute -top-6 left-0 opacity-80"
                  viewBox="0 0 48 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <path d="M8 20 C12 12, 18 6, 24 3" />
                  <path d="M20 22 C24 14, 30 8, 38 5" />
                </svg>
                <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                  Giá Trị Khác Biệt <br />
                  Tại CEO 1983!
                </h2>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed font-medium">
                Hệ sinh thái công nghệ số hóa hỗ trợ toàn diện từ xúc tiến B2B, quản trị danh thiếp đến kết nối 1-on-1 cùng các chủ doanh nghiệp đầu ngành.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setIsRegisterModalOpen(true)}
                  className="inline-flex items-center gap-2 text-xs font-black text-[#003B95] hover:text-[#002660] group cursor-pointer"
                >
                  <span>Tìm hiểu quyền lợi hội viên</span>
                  <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            {/* 3 Feature Columns on Right with custom 3D illustration icons */}
            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Card 1: 3D Globe / Lot Of Choices */}
              <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/90 hover:border-[#003B95]/40 hover:shadow-xl hover:-translate-y-1 transition duration-200 group cursor-pointer">
                <div className="size-14 rounded-2xl bg-blue-100 text-[#003B95] grid place-items-center shadow-xs group-hover:scale-110 transition">
                  <Globe className="size-7" />
                </div>
                <h3 className="mt-5 text-base font-black text-slate-900 group-hover:text-[#003B95] transition">
                  Sàn Thương Mại B2B
                </h3>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed font-medium">
                  Hơn 500+ sản phẩm &amp; dịch vụ độc quyền từ các doanh nghiệp hội viên với ưu đãi nội khối 15-30%.
                </p>
              </div>

              {/* Card 2: 3D Compass / Best Business Guide */}
              <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/90 hover:border-amber-500/40 hover:shadow-xl hover:-translate-y-1 transition duration-200 group cursor-pointer">
                <div className="size-14 rounded-2xl bg-amber-100 text-amber-600 grid place-items-center shadow-xs group-hover:scale-110 transition">
                  <Compass className="size-7" />
                </div>
                <h3 className="mt-5 text-base font-black text-slate-900 group-hover:text-amber-600 transition">
                  Lãnh Đạo &amp; Cố Vấn 1-on-1
                </h3>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed font-medium">
                  Xúc tiến hợp tác, đặt lịch gặp trực tiếp cùng Chủ tịch và Ban Lãnh đạo các tập đoàn đầu ngành.
                </p>
              </div>

              {/* Card 3: 3D Ticket / Easy Booking */}
              <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/90 hover:border-indigo-500/40 hover:shadow-xl hover:-translate-y-1 transition duration-200 group cursor-pointer">
                <div className="size-14 rounded-2xl bg-indigo-100 text-indigo-600 grid place-items-center shadow-xs group-hover:scale-110 transition">
                  <Ticket className="size-7" />
                </div>
                <h3 className="mt-5 text-base font-black text-slate-900 group-hover:text-indigo-600 transition">
                  Thẻ Doanh Nhân Số &amp; QR
                </h3>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed font-medium">
                  Định danh chuẩn quốc tế, check-in sự kiện 1 chạm và lưu trữ danh thiếp điện tử thông minh.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 5. DOTTED MAP WITH PULSING LOCATION PINS matching Video Frame 00:07 - 00:08 ================= */}
      <section id="map-section" className="py-20 bg-slate-50/80 border-t border-slate-200/80 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left: Interactive Dotted Map with Pulsing Pins */}
            <div className="lg:col-span-7 relative bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm min-h-[420px] flex items-center justify-center">
              {/* Dotted Grid Pattern representing geographic connectivity */}
              <div className="absolute inset-0 bg-[radial-gradient(#003B95_1.5px,transparent_1.5px)] [background-size:20px_20px] opacity-15" />

              {/* Dotted SVG Map Silhouette */}
              <svg className="w-full h-80 text-blue-900/10 pointer-events-none" viewBox="0 0 600 350" fill="currentColor">
                <circle cx="280" cy="80" r="40" opacity="0.4" />
                <circle cx="320" cy="110" r="30" opacity="0.3" />
                <circle cx="340" cy="170" r="25" opacity="0.3" />
                <circle cx="310" cy="270" r="45" opacity="0.4" />
                <circle cx="270" cy="300" r="30" opacity="0.3" />
              </svg>

              {/* Pulsing Interactive Pins across regions */}
              {activePins.map((pin) => (
                <div
                  key={pin.id}
                  onClick={() => setSelectedPin(pin.id)}
                  className="absolute cursor-pointer group"
                  style={{ top: pin.y, left: pin.x }}
                >
                  <div className="relative">
                    <div
                      className="size-6 rounded-full bg-[#003B95] text-white grid place-items-center shadow-lg transition-transform group-hover:scale-125"
                      style={{ animation: "pulsePin 2s infinite" }}
                    >
                      <MapPin className="size-3.5 fill-current" />
                    </div>
                    {/* Tooltip on hover/active */}
                    <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 rounded-xl bg-slate-900 text-white text-[11px] shadow-xl z-20 pointer-events-none transition ${selectedPin === pin.id ? "opacity-100 scale-100" : "opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100"
                      }`}>
                      <p className="font-bold text-amber-300">{pin.name}</p>
                      <p className="text-[10px] text-slate-300">{pin.count}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Right: Search Filter Card matching Video Frame 00:08 */}
            <div className="lg:col-span-5 space-y-6">
              <span className="text-xs font-black uppercase tracking-wider text-[#003B95] px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/60">
                Mạng Lưới Điểm Cầu
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                Gắn Kết Đa Điểm Cầu <br />
                Vươn Tầm Toàn Quốc
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed font-medium">
                Khám phá các chi nhánh, điểm cầu giao thương và doanh nghiệp hội viên CEO 1983 trải dài từ Bắc chí Nam.
              </p>

              {/* Search Card Container matching Pinterest Video */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <MapPin className="size-4 text-[#003B95] shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Điểm Cầu Lựa Chọn</p>
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {activePins.find(p => p.id === selectedPin)?.name}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <Building2 className="size-4 text-[#003B95] shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Quy Mô Kết Nối</p>
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {activePins.find(p => p.id === selectedPin)?.count} — {activePins.find(p => p.id === selectedPin)?.desc}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsRegisterModalOpen(true)}
                  className="w-full py-3 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-md cursor-pointer"
                >
                  <Search className="size-4" />
                  <span>Kết Nối Doanh Nghiệp Tại Điểm Cầu Này</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 6. COMMUNITY CALLING WITH 3D FLOATING AVATARS & SPEECH BUBBLES (Video Frame 00:09 - 00:10) ================= */}
      <section id="community-section" className="py-20 bg-white border-t border-slate-200/80 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Heading + Call to Action matching Video Frame 00:10 */}
            <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
              <span className="text-xs font-black uppercase tracking-wider text-[#003B95] px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/60">
                Gắn Kết Tinh Hoa
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                Cộng Đồng Tinh Hoa <br />
                Đang Mở Rộng Cơ Hội!
              </h2>
              <p className="text-base text-slate-600 leading-relaxed font-medium max-w-lg mx-auto lg:mx-0">
                Gia nhập ngay mạng lưới lãnh đạo cùng năm sinh 1983 để kết nối đối tác, mở rộng chuỗi cung ứng và đồng hành phát triển bền vững cùng HanoiBA.
              </p>
              <div>
                <button
                  type="button"
                  onClick={() => setIsRegisterModalOpen(true)}
                  className="px-8 py-3.5 rounded-full bg-slate-900 hover:bg-black text-white text-xs font-bold shadow-xl hover:scale-105 active:scale-95 transition cursor-pointer"
                >
                  Gia Nhập Cộng Đồng Ngay
                </button>
              </div>
            </div>

            {/* Right Column: 3D Floating Avatars, Speech Bubbles & Social Icons matching Video Frame 00:10 */}
            <div className="lg:col-span-6 relative h-[360px] flex items-center justify-center">
              {/* Central Large Avatar with Speech Bubble */}
              <div className="relative z-20" style={{ animation: "floatSlow 4s ease-in-out infinite" }}>
                <div className="size-24 rounded-full p-1 bg-white shadow-2xl border-2 border-[#003B95]">
                  <img
                    src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80"
                    alt="President"
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
                {/* Speech Bubble */}
                <div className="absolute -top-6 -right-16 px-3 py-1.5 rounded-2xl bg-white shadow-lg border border-slate-100 text-[11px] font-bold text-slate-900 flex items-center gap-1.5 animate-bounce [animation-duration:3s]">
                  <span>Xin chào! 👋</span>
                </div>
              </div>

              {/* Satellite Avatar 1 (Top Left) */}
              <div className="absolute top-8 left-16 z-10" style={{ animation: "floatBadge1 4.5s ease-in-out infinite" }}>
                <div className="size-16 rounded-full p-1 bg-white shadow-xl border border-slate-200">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
                    alt="VP"
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-2 -left-4 px-2 py-0.5 rounded-full bg-[#003B95] text-white text-[9px] font-bold">
                  B2B Deal
                </div>
              </div>

              {/* Satellite Avatar 2 (Top Right) */}
              <div className="absolute top-12 right-12 z-10" style={{ animation: "floatBadge2 5s ease-in-out infinite" }}>
                <div className="size-16 rounded-full p-1 bg-white shadow-xl border border-slate-200">
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80"
                    alt="HanoiBA"
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
                {/* Floating Social Badge Twitter/Zalo */}
                <div className="size-6 rounded-full bg-sky-500 text-white grid place-items-center absolute -top-1 -right-1 shadow-md text-[10px] font-bold">
                  Z
                </div>
              </div>

              {/* Satellite Avatar 3 (Bottom Left) */}
              <div className="absolute bottom-8 left-24 z-10" style={{ animation: "floatSlow 4.8s ease-in-out infinite 0.5s" }}>
                <div className="size-14 rounded-full p-1 bg-white shadow-lg border border-slate-200">
                  <img
                    src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80"
                    alt="Member"
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
                <div className="size-5 rounded-full bg-rose-500 text-white grid place-items-center absolute -bottom-1 -right-1 shadow-md text-[9px] font-bold">
                  ★
                </div>
              </div>

              {/* Satellite Avatar 4 (Bottom Right) */}
              <div className="absolute bottom-12 right-20 z-10" style={{ animation: "floatBadge1 5.2s ease-in-out infinite 0.8s" }}>
                <div className="size-14 rounded-full p-1 bg-white shadow-lg border border-slate-200">
                  <img
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80"
                    alt="Member 2"
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
                <div className="size-5 rounded-full bg-black text-white grid place-items-center absolute -top-1 -left-1 shadow-md text-[9px] font-bold">
                  d
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 7. TESTIMONIALS SLIDING CAROUSEL (Video Frame 00:11 - 00:13) ================= */}
      <section id="testimonials-section" className="py-20 bg-slate-50/80 border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-amber-700 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                Tín Nhiệm Hội Viên
              </span>
              <h2 className="mt-3 text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Doanh Nhân Đồng Niên Chia Sẻ Về CEO 1983
              </h2>
            </div>

            {/* Navigation Arrows matching Video Frame 00:11 */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setActiveTestimonialIdx((prev) => (prev > 0 ? prev - 1 : activeTestimonials.length - 1))
                }
                className="size-10 rounded-full border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-700 grid place-items-center transition cursor-pointer"
              >
                <ChevronLeft className="size-5" />
              </button>
              <button
                type="button"
                onClick={() =>
                  setActiveTestimonialIdx((prev) => (prev < activeTestimonials.length - 1 ? prev + 1 : 0))
                }
                className="size-10 rounded-full border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-700 grid place-items-center transition cursor-pointer"
              >
                <ArrowRight className="size-5" />
              </button>
            </div>
          </div>

          {/* Testimonials 3-Card Row with horizontal sliding transition matching Frame 00:12 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {activeTestimonials.slice(0, 3).map((item, idx) => {
              const isSelected = activeTestimonialIdx === idx;
              return (
                <div
                  key={idx}
                  onClick={() => setActiveTestimonialIdx(idx)}
                  className={`p-7 rounded-3xl bg-white border transition duration-300 flex flex-col justify-between cursor-pointer ${isSelected
                      ? "border-[#003B95] shadow-xl ring-2 ring-[#003B95]/10 -translate-y-1"
                      : "border-slate-200/90 shadow-2xs hover:shadow-md"
                    }`}
                >
                  <div className="space-y-4">
                    <span className="text-4xl font-serif text-[#003B95]/30 leading-none block">“</span>
                    <p className="text-xs sm:text-sm text-slate-700 italic leading-relaxed">
                      "{item.quote}"
                    </p>
                  </div>

                  <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={resolveMediaUrl(item.avatar) || item.avatar}
                        alt={item.author}
                        className="size-10 rounded-full object-cover border border-[#003B95]"
                      />
                      <div>
                        <h4 className="text-xs font-black text-slate-900">{item.author}</h4>
                        <p className="text-[10px] text-[#003B95] font-bold">{item.role}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-0.5 text-amber-400">
                      {[...Array(item.rating || 5)].map((_, i) => (
                        <Star key={i} className="size-3.5 fill-current" />
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= 8. FAQ ACCORDION WITH INTEGRATED PILL INPUT (Video Frame 00:14 - 00:15) ================= */}
      <section id="faq" className="py-20 bg-white border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Left Column: Doodle + Integrated Pill Input Container matching Video Frame 00:15 */}
            <div className="lg:col-span-5 space-y-6">
              <span className="text-xs font-black uppercase tracking-wider text-[#003B95] px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/60">
                Hỏi Đáp Trực Tiếp
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                Got A Question <br />
                For CEO 1983?
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                Nếu bạn có bất kỳ câu hỏi nào cần giải đáp về quy chế gia nhập và quyền lợi hội viên, chúng tôi luôn sẵn sàng hỗ trợ.
              </p>

              {/* Integrated Pill Input Bar matching Video Frame 00:15: [ Enter Phone/Email | Submit ] */}
              <form onSubmit={handleQuickQuestionSubmit} className="pt-2">
                <div className="flex items-center p-1.5 rounded-full border border-slate-300 bg-white shadow-xs focus-within:border-[#003B95] focus-within:ring-2 focus-within:ring-[#003B95]/15 transition">
                  <input
                    type="text"
                    required
                    placeholder="Nhập số điện thoại hoặc email..."
                    value={contactInput}
                    onChange={(e) => setContactInput(e.target.value)}
                    className="flex-1 px-4 py-2 bg-transparent text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-full bg-slate-900 hover:bg-black text-white text-xs font-bold transition shadow-sm shrink-0 cursor-pointer"
                  >
                    Submit
                  </button>
                </div>
              </form>
            </div>

            {/* Right Column: Sleek FAQ questions with blue arrow matching Video Frame 00:15 */}
            <div className="lg:col-span-7 space-y-3">
              {activeFaqs.map((faq, idx) => {
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
                      <span className="text-sm sm:text-base">{faq.question}</span>
                      <div className="size-6 rounded-full bg-slate-200/60 flex items-center justify-center shrink-0 text-[#003B95]">
                        {isOpen ? <ChevronUp className="size-4" /> : <ArrowRight className="size-4" />}
                      </div>
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ================= 9. SIGNATURE ROYAL BLUE FOOTER matching Video Frame 00:16 ================= */}
      <footer className="bg-[#003B95] text-white py-14 border-t border-blue-900 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            {/* Col 1: Brand & Mission */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="size-11 rounded-2xl bg-white p-2 flex items-center justify-center shadow-md">
                  <img
                    src="/ceo1983-emblem-8.png"
                    alt="CEO 1983 Emblem"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = "none";
                    }}
                  />
                  <Sparkles className="size-4 text-amber-500" />
                </div>
                <div>
                  <h4 className="text-base font-black text-white">{footerData.headline}</h4>
                  <p className="text-[10px] text-amber-300 font-bold uppercase">Trực thuộc HanoiBA</p>
                </div>
              </div>
              <p className="text-[11px] text-blue-100 leading-relaxed">
                {footerData.description}
              </p>
            </div>

            {/* Col 2: Hệ Thống Links */}
            <div className="space-y-2">
              <h5 className="text-xs font-black text-white uppercase tracking-wider mb-3">Company</h5>
              <p>
                <a href="#home" className="text-blue-100 hover:text-white transition">
                  About Us
                </a>
              </p>
              <p>
                <a href="#features" className="text-blue-100 hover:text-white transition">
                  Features
                </a>
              </p>
              <p>
                <a href="#map-section" className="text-blue-100 hover:text-white transition">
                  News &amp; Points
                </a>
              </p>
              <p>
                <a href="#faq" className="text-blue-100 hover:text-white transition">
                  FAQ
                </a>
              </p>
            </div>

            {/* Col 3: Resources */}
            <div className="space-y-2">
              <h5 className="text-xs font-black text-white uppercase tracking-wider mb-3">Resources</h5>
              <p>
                <a href="https://ceo1983.com" target="_blank" rel="noreferrer" className="text-blue-100 hover:text-white transition">
                  Events
                </a>
              </p>
              <p>
                <a href="/login" className="text-blue-100 hover:text-white transition">
                  Cổng CRM Quản Trị
                </a>
              </p>
              <p>
                <a href="https://hanoiba.org.vn" target="_blank" rel="noreferrer" className="text-blue-100 hover:text-white transition">
                  HanoiBA Official
                </a>
              </p>
            </div>

            {/* Col 4: Liên Hệ Trụ Sở */}
            <div className="space-y-2">
              <h5 className="text-xs font-black text-white uppercase tracking-wider mb-3">Contact Info</h5>
              <div className="flex items-start gap-2 text-blue-100">
                <MapPin className="size-4 shrink-0 mt-0.5" />
                <span>{footerData.address}</span>
              </div>
              <div className="flex items-center gap-2 text-blue-100">
                <Phone className="size-4 shrink-0" />
                <span>Hotline: {footerData.contactPhone}</span>
              </div>
              <div className="flex items-center gap-2 text-blue-100">
                <Mail className="size-4 shrink-0" />
                <span>Email: {footerData.contactEmail}</span>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-white/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left text-blue-200 text-[11px]">
            <p>© 2026 CLB Doanh Nhân CEO 1983 (HanoiBA). All rights reserved.</p>
            <p className="font-mono text-blue-100">Phiên bản nền tảng 5.0 • Chuẩn hóa Web CRM &amp; Mobile App</p>
          </div>
        </div>
      </footer>

      {/* ================= 10. REGISTER MEMBERSHIP MODAL ================= */}
      {isRegisterModalOpen && (
        <div className="fixed inset-0 z-[100] grid place-items-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-3xl bg-white text-slate-900 shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="size-9 rounded-xl bg-[#003B95] text-white grid place-items-center">
                  <Users className="size-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Đăng Ký Gia Nhập CEO 1983</h3>
                  <p className="text-[11px] text-slate-500 font-medium">CLB Doanh Nhân CEO 1983 • HanoiBA</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsRegisterModalOpen(false)}
                className="size-8 rounded-full bg-slate-200/80 text-slate-600 hover:text-slate-900 grid place-items-center cursor-pointer transition"
              >
                <X className="size-4" />
              </button>
            </div>

            {regSubmitted ? (
              <div className="p-8 text-center space-y-3">
                <div className="size-14 rounded-full bg-emerald-100 text-emerald-600 grid place-items-center mx-auto">
                  <Check className="size-8" />
                </div>
                <h4 className="text-lg font-black text-slate-900">Đăng Ký Thành Công!</h4>
                <p className="text-xs text-slate-600">
                  Cảm ơn bạn. Ban Thư ký CLB Doanh Nhân CEO 1983 sẽ liên hệ và hướng dẫn hoàn thiện hồ sơ hội viên trong thời gian sớm nhất.
                </p>
              </div>
            ) : (
              <form onSubmit={handleRegisterSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Họ và tên Doanh nhân *</label>
                  <input
                    type="text"
                    required
                    placeholder="Nguyễn Văn A"
                    value={regForm.fullName}
                    onChange={(e) => setRegForm({ ...regForm, fullName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-[#003B95]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Số điện thoại *</label>
                    <input
                      type="tel"
                      required
                      placeholder="0983..."
                      value={regForm.phone}
                      onChange={(e) =>
                        setRegForm({
                          ...regForm,
                          phone: e.target.value.replace(/[^0-9]/g, ""),
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-[#003B95]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Chức vụ</label>
                    <input
                      type="text"
                      placeholder="Chủ tịch / CEO / Founder"
                      value={regForm.position}
                      onChange={(e) => setRegForm({ ...regForm, position: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-[#003B95]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tên doanh nghiệp</label>
                  <input
                    type="text"
                    placeholder="Công ty CP / TNHH..."
                    value={regForm.company}
                    onChange={(e) => setRegForm({ ...regForm, company: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-[#003B95]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nhu cầu kết nối / Giới thiệu</label>
                  <textarea
                    rows={2}
                    placeholder="Ngành nghề kinh doanh và mong muốn hợp tác..."
                    value={regForm.message}
                    onChange={(e) => setRegForm({ ...regForm, message: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-[#003B95]"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsRegisterModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-[#003B95] hover:bg-[#002660] text-white text-xs font-bold shadow-md transition cursor-pointer"
                  >
                    Gửi Hồ Sơ Gia Nhập
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ================= 11. VIDEO INTRO MODAL ================= */}
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
