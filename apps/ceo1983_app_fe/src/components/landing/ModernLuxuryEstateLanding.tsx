import React, { useState, useEffect, useRef } from "react";
import {
  Building2,
  MapPin,
  Compass,
  Key,
  ShieldCheck,
  Star,
  Award,
  Sparkles,
  Phone,
  Mail,
  Calendar,
  Clock,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  Maximize2,
  Bed,
  Bath,
  Car,
  Play,
  X,
  CheckCircle2,
  Search,
  Filter,
  Layers,
  Crown,
  Share2,
  Eye,
} from "lucide-react";
import type { LandingWebConfig } from "./TimedCardsOpeningLanding";

interface ModernLuxuryEstateLandingProps {
  config: LandingWebConfig;
}

interface EstateProperty {
  id: string;
  name: string;
  category: string;
  location: string;
  price: string;
  area: string;
  bedrooms: number;
  bathrooms: number;
  garage: number;
  highlight: string;
  description: string;
  mainImage: string;
  gallery: string[];
  features: string[];
  tag: string;
}

const LUXURY_ESTATES: EstateProperty[] = [
  {
    id: "celestial-sky-villa",
    name: "The Celestial Sky Villa",
    category: "Sky Penthouse Triệu Đô",
    location: "Keangnam Landmark 72, Phạm Hùng, Hà Nội",
    price: "185.0 Tỷ VNĐ",
    area: "1,450 m²",
    bedrooms: 6,
    bathrooms: 8,
    garage: 4,
    highlight: "Tầm nhìn 360° ôm trọn bầu trời Thủ đô, bể bơi vô cực dát vàng trên cao và sân đỗ trực thăng riêng.",
    description:
      "Tác phẩm kiến trúc độc bản ngự trị trên đỉnh Landmark 72. Không gian mở ngập tràn ánh sáng với vách kính Low-E 3 lớp, sàn đá cẩm thạch Calacatta nhập khẩu Ý nguyên khối và sảnh đón tiếp riêng tư tuyệt đối.",
    mainImage: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1000&q=80",
    ],
    features: ["Bể bơi chân mây 120m²", "Hầm rượu vang 3,000 chai", "Rạp chiếu phim 4K 18 ghế", "Thang máy tốc độ cao bảo mật võng mạc"],
    tag: "Biểu Tượng Đỉnh Cao",
  },
  {
    id: "heian-onsen-residence",
    name: "Heian Onsen Royal Residence",
    category: "Dinh Thự Khoáng Nóng Nhật Bản",
    location: "Khu Biệt Thự Heian, Wyndham Thanh Thủy, Phú Thọ",
    price: "68.5 Tỷ VNĐ",
    area: "850 m²",
    bedrooms: 5,
    bathrooms: 6,
    garage: 3,
    highlight: "Dòng khoáng nóng tự nhiên dẫn thẳng vào từng bể onsen riêng biệt giữa vườn thiền Zen thanh tịnh.",
    description:
      "Sự kết tinh hoàn hảo giữa tinh thần kiến trúc thời kỳ Heian hoàng kim và phong cách sống thượng lưu. Ngôi nhà của sự trường thọ, an yên và tái tạo năng lượng cho các lãnh đạo doanh nhân hàng đầu.",
    mainImage: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1600&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1600573472592-401b489a3cdc?auto=format&fit=crop&w=1000&q=80",
    ],
    features: ["Bể khoáng nóng Onsen tư gia", "Vườn Nhật cây Tùng cổ thụ 100 năm", "Trà thất thiền định gỗ Hinoki", "Hệ thống lọc không khí ion âm"],
    tag: "Nghỉ Dưỡng Sức Khỏe",
  },
  {
    id: "lakeside-imperial-manor",
    name: "Lakeside Imperial Manor",
    category: "Biệt Thự Bán Đảo Mặt Hồ Tây",
    location: "Bán Đảo Quảng An, Tây Hồ, Hà Nội",
    price: "295.0 Tỷ VNĐ",
    area: "1,800 m²",
    bedrooms: 7,
    bathrooms: 9,
    garage: 6,
    highlight: "Mặt tiền 45m trực diện Hồ Tây lộng gió, kiến trúc Tân Cổ Điển Pháp tráng lệ với bến du thuyền riêng.",
    description:
      "Vị thế phong thủy đế vương tụ khí sinh tài lộc. Toàn bộ nội thất được đặt may đo bespoke thủ công từ các xưởng mộc gia truyền tại Milan và Paris, gìn giữ giá trị truyền đời qua nhiều thế hệ.",
    mainImage: "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1600&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=1000&q=80",
    ],
    features: ["Bến du thuyền tư nhân", "Hồ cá Koi hoàng đế 200m²", "Phòng tiệc dạ hội 100 khách", "Hệ thống bảo an 5 lớp tiêu chuẩn đại sứ quán"],
    tag: "Đế Vương Hồ Tây",
  },
  {
    id: "azure-coastal-sanctuary",
    name: "Azure Oceanfront Sanctuary",
    category: "Dinh Thự Biển Vịnh Di Sản",
    location: "Bán Đảo Tuần Châu, Vịnh Hạ Long, Quảng Ninh",
    price: "340.0 Tỷ VNĐ",
    area: "2,200 m²",
    bedrooms: 8,
    bathrooms: 11,
    garage: 5,
    highlight: "Bãi biển biệt lập riêng tư nhìn thẳng ra kỳ quan Vịnh Hạ Long với bãi đáp trực thăng và nhà khách VIP riêng.",
    description:
      "Kiệt tác dinh thự nghỉ dưỡng biển siêu sang, nơi đại dương và núi đá vôi triệu năm hòa quyện vào từng đường nét kiến trúc đương đại phóng khoáng.",
    mainImage: "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1600&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1600607687644-c7171b42498f?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1600585154363-67eb9e2e2099?auto=format&fit=crop&w=1000&q=80",
    ],
    features: ["Bãi tắm cát trắng riêng tư 150m", "Bể bơi nước mặn vô cực tràn biển", "Sân bay trực thăng cá nhân", "Cigar Lounge & Bar ngắm hoàng hôn"],
    tag: "Kỳ Quan Biển",
  },
];

export function ModernLuxuryEstateLanding({ config }: ModernLuxuryEstateLandingProps) {
  const [selectedEstate, setSelectedEstate] = useState<EstateProperty>(LUXURY_ESTATES[0]);
  const [filterLocation, setFilterLocation] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [isBookingModalOpen, setIsBookingModalOpen] = useState<boolean>(false);
  const [bookingFormData, setBookingFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    preferredDate: "",
    notes: "",
    ndaRequired: true,
  });
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [activeTourRoom, setActiveTourRoom] = useState<string>("living");

  // Mouse tilt effect for hero
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLDivElement>(null);

  const handleHeroMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMouseOffset({ x: x * 15, y: y * 15 });
  };

  const handleHeroMouseLeave = () => {
    setMouseOffset({ x: 0, y: 0 });
  };

  const filteredEstates = LUXURY_ESTATES.filter((est) => {
    const matchLoc = filterLocation === "all" || est.location.toLowerCase().includes(filterLocation.toLowerCase());
    const matchCat = filterCategory === "all" || est.category.toLowerCase().includes(filterCategory.toLowerCase());
    return matchLoc && matchCat;
  });

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setIsBookingModalOpen(false);
      setBookingFormData({
        fullName: "",
        phone: "",
        email: "",
        preferredDate: "",
        notes: "",
        ndaRequired: true,
      });
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-[#0D0E11] text-[#FAF8F5] font-sans selection:bg-[#C5A880] selection:text-black">
      {/* ── 1. HEADER / NAVIGATION STICKY TRANSLUCENT ── */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#0D0E11]/85 border-b border-[#C5A880]/20 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-11 rounded-xl bg-gradient-to-br from-[#C5A880] to-[#8C6D46] p-0.5 shadow-lg shadow-[#C5A880]/20 flex items-center justify-center">
              <Building2 className="size-6 text-[#0D0E11]" />
            </div>
            <div>
              <span className="font-serif text-lg font-black tracking-widest text-[#FAF8F5] uppercase block leading-none">
                CEO 1983 ESTATES
              </span>
              <span className="text-[9px] uppercase tracking-[0.25em] text-[#C5A880] font-bold">
                Luxury Architectural Residences
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold tracking-wider uppercase text-slate-300">
            <a href="#portfolio" className="hover:text-[#C5A880] transition">Bộ Sưu Tập</a>
            <a href="#philosophy" className="hover:text-[#C5A880] transition">Kiến Trúc &amp; Thủ Công</a>
            <a href="#virtual-tour" className="hover:text-[#C5A880] transition">360° Virtual Tour</a>
            <a href="#privileges" className="hover:text-[#C5A880] transition">Đặc Quyền Hội Viên</a>
          </nav>

          <div className="flex items-center gap-3">
            <a
              href="tel:0973205683"
              className="hidden lg:flex items-center gap-2 text-xs font-bold text-[#C5A880] hover:text-white transition px-3 py-1.5 rounded-full border border-[#C5A880]/30"
            >
              <Phone className="size-3.5" />
              <span>0973.205.683</span>
            </a>
            <button
              type="button"
              onClick={() => setIsBookingModalOpen(true)}
              className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#C5A880] via-[#D8C4B6] to-[#C5A880] text-[#0D0E11] text-xs font-black uppercase tracking-wider hover:brightness-110 transition shadow-lg shadow-[#C5A880]/25 cursor-pointer"
            >
              Đặt Lịch Khảo Sát VIP
            </button>
          </div>
        </div>
      </header>

      {/* ── 2. HERO SECTION VỚI 3D PARALLAX & KIẾN TRÚC HOÀNG GIA ── */}
      <section
        ref={heroRef}
        onMouseMove={handleHeroMouseMove}
        onMouseLeave={handleHeroMouseLeave}
        className="relative min-h-[92vh] flex flex-col justify-end overflow-hidden pb-16 pt-24"
      >
        {/* Background Image Parallax with Ken-Burns */}
        <div
          style={{
            backgroundImage: `url(${selectedEstate.mainImage})`,
            backgroundPosition: "center",
            backgroundSize: "cover",
            transform: `scale(1.05) translate(${mouseOffset.x}px, ${mouseOffset.y}px)`,
            transition: "transform 0.2s ease-out",
          }}
          className="absolute inset-0 z-0"
        />

        {/* Ambient Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0D0E11] via-[#0D0E11]/60 to-transparent z-10" />
        <div className="absolute inset-0 bg-radial from-transparent via-black/40 to-[#0D0E11]/90 z-10 pointer-events-none" />

        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-6">
          {/* Tagline & Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0D0E11]/80 backdrop-blur-md border border-[#C5A880]/50 text-[#C5A880] text-xs font-bold uppercase tracking-widest">
            <Crown className="size-3.5 text-[#C5A880]" />
            <span>{selectedEstate.tag} · Bất Động Sản Siêu Sang CEO 1983</span>
          </div>

          <div className="space-y-3 max-w-3xl">
            <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.05]">
              {selectedEstate.name}
            </h1>
            <p className="text-sm sm:text-base text-slate-300 font-light leading-relaxed max-w-2xl">
              {selectedEstate.highlight}
            </p>
          </div>

          {/* Key Specifications Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-[#0D0E11]/80 backdrop-blur-xl border border-white/10 max-w-3xl">
            <div className="flex items-center gap-3">
              <Maximize2 className="size-5 text-[#C5A880] shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 uppercase block font-semibold">Diện Tích Sử Dụng</span>
                <span className="text-sm font-black text-white">{selectedEstate.area}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Bed className="size-5 text-[#C5A880] shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 uppercase block font-semibold">Phòng Ngủ Master</span>
                <span className="text-sm font-black text-white">{selectedEstate.bedrooms} Suites VIP</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Bath className="size-5 text-[#C5A880] shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 uppercase block font-semibold">Phòng Tắm Thư Giãn</span>
                <span className="text-sm font-black text-white">{selectedEstate.bathrooms} Phòng Spa</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Award className="size-5 text-[#C5A880] shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 uppercase block font-semibold">Mức Giá Niêm Yết</span>
                <span className="text-sm font-black text-[#C5A880]">{selectedEstate.price}</span>
              </div>
            </div>
          </div>

          {/* Interactive Search & Filter Bar */}
          <div className="p-4 rounded-3xl bg-[#1A1D24]/90 backdrop-blur-2xl border border-[#C5A880]/30 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full md:flex-1">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                  Vị Trí Kim Cương
                </label>
                <select
                  value={filterLocation}
                  onChange={(e) => setFilterLocation(e.target.value)}
                  className="w-full bg-[#0D0E11] text-white border border-white/10 rounded-xl p-2.5 text-xs font-semibold outline-none focus:border-[#C5A880] cursor-pointer"
                >
                  <option value="all">Tất cả khu vực (Toàn quốc)</option>
                  <option value="Hà Nội">Hà Nội (Landmark 72 &amp; Tây Hồ)</option>
                  <option value="Phú Thọ">Phú Thọ (Khoáng Nóng Wyndham)</option>
                  <option value="Quảng Ninh">Hạ Long Bay (Biệt Thự Biển)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                  Loại Hình Kiến Trúc
                </label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full bg-[#0D0E11] text-white border border-white/10 rounded-xl p-2.5 text-xs font-semibold outline-none focus:border-[#C5A880] cursor-pointer"
                >
                  <option value="all">Tất cả loại hình kiến trúc</option>
                  <option value="Sky Penthouse">Sky Penthouse Tầng Thượng</option>
                  <option value="Dinh Thự Khoáng Nóng">Dinh Thự Khoáng Nóng Onsen</option>
                  <option value="Biệt Thự Bán Đảo">Biệt Thự Bán Đảo Mặt Hồ</option>
                  <option value="Dinh Thự Biển">Dinh Thự Biển Biệt Lập</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                  Khoảng Giá Kỳ Vọng
                </label>
                <select className="w-full bg-[#0D0E11] text-white border border-white/10 rounded-xl p-2.5 text-xs font-semibold outline-none focus:border-[#C5A880] cursor-pointer">
                  <option>Tất cả mức giá (Từ 50 Tỷ+)</option>
                  <option>50 Tỷ – 100 Tỷ VNĐ</option>
                  <option>100 Tỷ – 200 Tỷ VNĐ</option>
                  <option>Trên 200 Tỷ VNĐ</option>
                </select>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                const el = document.getElementById("portfolio");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              className="w-full md:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#C5A880] to-[#8C6D46] text-[#0D0E11] font-black text-xs uppercase tracking-wider hover:brightness-110 transition flex items-center justify-center gap-2 shrink-0 cursor-pointer shadow-lg shadow-[#C5A880]/30"
            >
              <Search className="size-4" />
              <span>Khám Phá Dinh Thự</span>
            </button>
          </div>
        </div>
      </section>

      {/* ── 3. FEATURED PROPERTIES PORTFOLIO SHOWCASE ── */}
      <section id="portfolio" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-black uppercase tracking-[0.3em] text-[#C5A880]">
            Bộ Sưu Tập Giới Hạn 2026
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl font-black text-white">
            Tuyệt Tác Kiến Trúc &amp; Không Gian Sống Độc Bản
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Mỗi dinh thự là một bản giao hưởng hoàn mỹ của kỹ nghệ chế tác, vị trí độc tôn và phong cách sống thượng lưu.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredEstates.map((estate) => {
            const isCurrent = selectedEstate.id === estate.id;
            return (
              <div
                key={estate.id}
                onClick={() => setSelectedEstate(estate)}
                className={`rounded-3xl overflow-hidden border transition-all duration-300 cursor-pointer group flex flex-col justify-between ${
                  isCurrent
                    ? "border-[#C5A880] ring-2 ring-[#C5A880]/40 bg-[#16181E]"
                    : "border-white/10 bg-[#13151A] hover:border-[#C5A880]/60"
                }`}
              >
                <div className="relative h-72 overflow-hidden">
                  <img
                    src={estate.mainImage}
                    alt={estate.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-[#0D0E11]/85 backdrop-blur-md border border-[#C5A880]/40 text-[#C5A880] text-[10px] font-bold uppercase tracking-wider">
                    {estate.category}
                  </div>
                  <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-[#C5A880] text-[#0D0E11] text-xs font-black">
                    {estate.price}
                  </div>
                  <div className="absolute bottom-3 left-4 flex items-center gap-1.5 text-xs text-white drop-shadow-md">
                    <MapPin className="size-3.5 text-[#C5A880]" />
                    <span className="truncate max-w-xs">{estate.location}</span>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="font-serif text-xl sm:text-2xl font-black text-white group-hover:text-[#C5A880] transition">
                      {estate.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                      {estate.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-2 py-3 border-y border-white/10 text-center text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block">Diện Tích</span>
                      <span className="font-bold text-white">{estate.area}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block">Phòng Ngủ</span>
                      <span className="font-bold text-white">{estate.bedrooms} Master</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block">Gara Xe</span>
                      <span className="font-bold text-white">{estate.garage} Siêu Xe</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedEstate(estate);
                        setIsBookingModalOpen(true);
                      }}
                      className="px-4 py-2 rounded-xl bg-[#C5A880]/20 hover:bg-[#C5A880] text-[#C5A880] hover:text-[#0D0E11] text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Calendar className="size-3.5" />
                      <span>Đặt Khảo Sát</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedEstate(estate);
                        const el = document.getElementById("virtual-tour");
                        if (el) el.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="text-xs font-bold text-slate-300 hover:text-white flex items-center gap-1 transition"
                    >
                      <span>Xem Không Gian 360°</span>
                      <ArrowRight className="size-3.5 text-[#C5A880]" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── 4. ARCHITECTURAL CRAFTSMANSHIP & PHILOSOPHY (TRIẾT LÝ VẬT LIỆU) ── */}
      <section id="philosophy" className="py-24 bg-[#111317] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <span className="text-xs font-black uppercase tracking-[0.3em] text-[#C5A880]">
                Triết Lý Kiến Trúc Độc Bản
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl font-black text-white leading-tight">
                Từng Chi Tiết Là Một Tác Phẩm Chế Tác Riêng Biệt
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed font-light">
                Chúng tôi không thỏa hiệp với vật liệu đại trà. Mỗi phiến đá cẩm thạch Calacatta, từng khối gỗ óc chó Bắc Mỹ tuyển chọn và da bò thảo mộc Tuscany đều được tuyển chọn bởi các kiến trúc sư trưởng hàng đầu để bảo chứng vẻ đẹp vĩnh cửu.
              </p>

              <div className="space-y-4 pt-2">
                {[
                  {
                    title: "Đá Cẩm Thạch Carrara & Calacatta Nhập Khẩu Ý",
                    desc: "Vân đá đối xứng Bookmatch tự nhiên, khai thác từ mỏ đá nghìn năm tuổi tại vùng Tuscany.",
                  },
                  {
                    title: "Gỗ Óc Chó Bắc Mỹ & Da Bò Thuộc Thảo Mộc",
                    desc: "Chế tác thủ công bởi các nghệ nhân Ý, giữ trọn hương thơm tự nhiên và độ bền qua nhiều thế hệ.",
                  },
                  {
                    title: "Hệ Thống Smart Home AI & Bảo Mật Sinh Trắc Học",
                    desc: "Điều khiển vi khí hậu, lọc không khí ion âm và an ninh đa tầng bảo vệ tối cao.",
                  },
                ].map((item, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-4">
                    <div className="size-8 rounded-full bg-[#C5A880]/20 text-[#C5A880] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      0{idx + 1}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{item.title}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-6 grid grid-cols-2 gap-4">
              <img
                src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80"
                alt="Living Room Craftsmanship"
                className="w-full h-72 object-cover rounded-3xl border border-white/10"
              />
              <img
                src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80"
                alt="Marble Bathroom"
                className="w-full h-72 object-cover rounded-3xl border border-white/10 mt-8"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. VIRTUAL TOUR 360° & PHÒNG CHIẾU TRẢI NGHIỆM ── */}
      <section id="virtual-tour" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-black uppercase tracking-[0.3em] text-[#C5A880]">
              Trải Nghiệm Không Gian Thực Tế
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-black text-white mt-1">
              360° Virtual Tour &amp; Phòng Trưng Bày Đa Chiều
            </h2>
          </div>

          {/* Room Selector */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {[
              { id: "living", name: "Đại Sảnh Panoramic" },
              { id: "master", name: "Master Suite Hoàng Gia" },
              { id: "cellar", name: "Hầm Rượu & Cigar" },
              { id: "pool", name: "Bể Bơi Chân Mây" },
            ].map((room) => (
              <button
                key={room.id}
                type="button"
                onClick={() => setActiveTourRoom(room.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer ${
                  activeTourRoom === room.id
                    ? "bg-[#C5A880] text-[#0D0E11] shadow-md shadow-[#C5A880]/30"
                    : "bg-[#1A1D24] text-slate-300 hover:text-white"
                }`}
              >
                {room.name}
              </button>
            ))}
          </div>
        </div>

        {/* Interactive Viewport */}
        <div className="relative rounded-3xl overflow-hidden border border-[#C5A880]/30 h-[480px] shadow-2xl group">
          <img
            src={
              activeTourRoom === "living"
                ? selectedEstate.mainImage
                : activeTourRoom === "master"
                ? selectedEstate.gallery[0] || selectedEstate.mainImage
                : activeTourRoom === "cellar"
                ? selectedEstate.gallery[1] || selectedEstate.mainImage
                : selectedEstate.gallery[2] || selectedEstate.mainImage
            }
            alt="Virtual Room"
            className="w-full h-full object-cover group-hover:scale-102 transition duration-700"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-[#0D0E11]/90 via-transparent to-black/30 pointer-events-none" />

          {/* Center Play Pulse */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setIsBookingModalOpen(true)}
              className="size-16 rounded-full bg-[#C5A880] text-[#0D0E11] flex items-center justify-center hover:scale-110 transition shadow-2xl shadow-[#C5A880]/50 cursor-pointer animate-pulse"
            >
              <Play className="size-7 fill-[#0D0E11] ml-1" />
            </button>
            <span className="text-xs font-black tracking-widest uppercase text-white drop-shadow-md">
              Bắt Đầu Khảo Sát 3D Virtual Tour
            </span>
          </div>

          <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
            <div className="text-white text-xs">
              <span className="text-[#C5A880] font-bold block uppercase">{selectedEstate.name}</span>
              <span className="text-slate-300">{selectedEstate.location}</span>
            </div>
            <button
              type="button"
              onClick={() => setIsBookingModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-white text-xs font-bold border border-white/20 transition cursor-pointer"
            >
              Đặt Lịch Xem Thực Tế
            </button>
          </div>
        </div>
      </section>

      {/* ── 6. ĐẶC QUYỀN HỘI VIÊN CEO 1983 ── */}
      <section id="privileges" className="py-24 bg-gradient-to-b from-[#111317] to-[#0D0E11] border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-black uppercase tracking-[0.3em] text-[#C5A880]">
              Quyền Lợi Độc Quyền CLB
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-black text-white">
              Đặc Quyền Dành Cho Hội Viên CEO 1983
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Được bảo trợ bởi Hội Doanh nghiệp Trẻ Hà Nội (HanoiBA), hội viên chính thức nhận được những ưu đãi bất động sản tối cao.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                icon: Crown,
                title: "Chiết Khấu Trực Tiếp 5%",
                desc: "Ưu đãi thanh toán lên đến 15 Tỷ VNĐ khi giao dịch nội bộ giữa các doanh nghiệp hội viên CEO 1983.",
              },
              {
                icon: Key,
                title: "Quản Gia & Đầu Bếp Michelin",
                desc: "Dịch vụ Butler phục vụ 24/7 và đầu bếp riêng chế biến tiệc ngoại giao cao cấp tại tư gia.",
              },
              {
                icon: ShieldCheck,
                title: "Bảo Hành Kiến Trúc 10 Năm",
                desc: "Đội ngũ chuyên gia bảo dưỡng định kỳ các hạng mục đá tự nhiên, gỗ quý và hệ thống smart home.",
              },
              {
                icon: Award,
                title: "Bảo Lãnh Tín Dụng VIP",
                desc: "Hạn mức tín dụng ưu đãi từ các ngân hàng đối tác chiến lược trong liên minh HanoiBA.",
              },
            ].map((p, idx) => (
              <div
                key={idx}
                className="p-6 rounded-3xl bg-[#16181E] border border-white/10 hover:border-[#C5A880]/50 transition group space-y-3"
              >
                <div className="size-12 rounded-2xl bg-[#C5A880]/15 text-[#C5A880] flex items-center justify-center group-hover:scale-110 transition">
                  <p.icon className="size-6" />
                </div>
                <h4 className="text-base font-bold text-white group-hover:text-[#C5A880] transition">
                  {p.title}
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. FOOTER HOÀNG GIA SANG TRỌNG ── */}
      <footer className="border-t border-white/10 py-16 bg-[#090A0D]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-gradient-to-br from-[#C5A880] to-[#8C6D46] p-0.5 flex items-center justify-center">
                  <Building2 className="size-5 text-[#0D0E11]" />
                </div>
                <span className="font-serif text-lg font-black tracking-widest text-white uppercase">
                  CEO 1983 ESTATES
                </span>
              </div>
              <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
                Phân hệ phát triển và kết nối Bất động sản Nghỉ dưỡng &amp; Dinh thự Siêu Sang trực thuộc CLB Doanh Nhân CEO 1983 — Hội Doanh nghiệp Trẻ Hà Nội (HanoiBA).
              </p>
              <div className="text-xs text-[#C5A880] font-mono">
                Hotline Thẩm Định &amp; Đặt Lịch: 0973.205.683 / 0903.205.683 / 0903.203.204
              </div>
            </div>

            <div className="md:col-span-3 space-y-3 text-xs">
              <span className="font-bold text-white uppercase tracking-wider block">Trụ Sở Điều Hành</span>
              <p className="text-slate-400">
                Tầng 5, Cung Trí Thức Thành Phố, Số 1 Tôn Thất Thuyết, Cầu Giấy, Hà Nội.
              </p>
              <p className="text-slate-400">
                VP Đại Diện BĐS: Tầng 68, Keangnam Landmark 72, Nam Từ Liêm, Hà Nội.
              </p>
            </div>

            <div className="md:col-span-4 space-y-3 text-xs">
              <span className="font-bold text-white uppercase tracking-wider block">Bản Quyền &amp; Chứng Nhận</span>
              <p className="text-slate-400">
                Mọi hình ảnh, bản quyền kiến trúc và thông số dinh thự được bảo hộ độc quyền theo tiêu chuẩn liên minh bất động sản HanoiBA.
              </p>
              <div className="text-[10px] text-slate-500 pt-2">
                © 2026 CLB Doanh Nhân CEO 1983 (HanoiBA). Tất cả quyền được bảo lưu.
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* ── 8. MODAL ĐẶT LỊCH KHẢO SÁT RIÊNG TƯ (VIP VIEWING APPOINTMENT) ── */}
      {isBookingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg bg-[#16181E] border border-[#C5A880]/40 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative text-white">
            <button
              type="button"
              onClick={() => setIsBookingModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 cursor-pointer"
            >
              <X className="size-5" />
            </button>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-xs text-[#C5A880] font-black uppercase tracking-wider">
                <Crown className="size-4" />
                <span>Khảo Sát Tư Gia Riêng Tư (VIP Viewing)</span>
              </div>
              <h3 className="font-serif text-2xl font-black text-white">
                {selectedEstate.name}
              </h3>
              <p className="text-xs text-slate-400">
                Được đưa đón bởi chuyên xe Maybach riêng và tiếp đón trực tiếp bởi Giám đốc Dự án.
              </p>
            </div>

            {isSubmitted ? (
              <div className="p-6 rounded-2xl bg-emerald-950/40 border border-emerald-500 text-center space-y-2">
                <CheckCircle2 className="size-10 text-emerald-400 mx-auto" />
                <h4 className="text-sm font-bold text-white">Đặt Lịch Thành Công!</h4>
                <p className="text-xs text-slate-300">
                  Ban Thư Ký CEO 1983 sẽ liên hệ qua điện thoại để xác nhận giờ đón xe riêng trong vòng 15 phút.
                </p>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-300 block mb-1">
                    Họ Và Tên Doanh Nhân / Đại Biểu *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Nguyễn Văn Hưng"
                    value={bookingFormData.fullName}
                    onChange={(e) => setBookingFormData({ ...bookingFormData, fullName: e.target.value })}
                    className="w-full bg-[#0D0E11] border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#C5A880]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-300 block mb-1">
                      Số Điện Thoại Liên Hệ *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="09xx.xxx.xxx"
                      value={bookingFormData.phone}
                      onChange={(e) => setBookingFormData({ ...bookingFormData, phone: e.target.value })}
                      className="w-full bg-[#0D0E11] border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#C5A880]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-300 block mb-1">
                      Ngày Dự Kiến Khảo Sát
                    </label>
                    <input
                      type="date"
                      value={bookingFormData.preferredDate}
                      onChange={(e) => setBookingFormData({ ...bookingFormData, preferredDate: e.target.value })}
                      className="w-full bg-[#0D0E11] border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#C5A880]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-300 block mb-1">
                    Yêu Cầu Đặc Biệt / Ghi Chú Riêng
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Yêu cầu dịch vụ đón tiếp, an ninh riêng tư, bảo mật thông tin..."
                    value={bookingFormData.notes}
                    onChange={(e) => setBookingFormData({ ...bookingFormData, notes: e.target.value })}
                    className="w-full bg-[#0D0E11] border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#C5A880]"
                  />
                </div>

                <label className="flex items-center gap-2 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={bookingFormData.ndaRequired}
                    onChange={(e) => setBookingFormData({ ...bookingFormData, ndaRequired: e.target.checked })}
                    className="size-4 rounded text-[#C5A880] accent-[#C5A880]"
                  />
                  <span className="text-[11px] text-slate-300 font-medium">
                    Yêu cầu ký thỏa thuận bảo mật danh tính (NDA) trước buổi khảo sát
                  </span>
                </label>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#C5A880] via-[#D8C4B6] to-[#C5A880] text-[#0D0E11] font-black uppercase text-xs tracking-wider hover:brightness-110 transition shadow-xl shadow-[#C5A880]/30 cursor-pointer"
                >
                  Xác Nhận Đặt Lịch Khảo Sát VIP
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
