import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Cake,
  Crown,
  Award,
  ExternalLink,
  Gift,
  Building2,
} from "lucide-react";
import { resolveMediaUrl } from "@/lib/api-client";
import { listMembers } from "@/lib/member-app.functions";

interface SlideItem {
  id: string;
  type: "perk" | "birthday" | "honored";
  title: string;
  subtitle: string;
  badge: string;
  badgeBg: string;
  image: string;
  targetUrl?: string;
  personName?: string;
  companyName?: string;
  dateInfo?: string;
}

export function MemberPerksCarousel() {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const touchStartXRef = useRef<number | null>(null);

  // Fetch upcoming birthday member if available
  const [upcomingBirthdayMember, setUpcomingBirthdayMember] = useState<{ name: string; company: string } | null>(null);

  useEffect(() => {
    listMembers()
      .then((members) => {
        if (Array.isArray(members) && members.length > 0) {
          // Lấy hội viên mẫu có ngày sinh nhật sắp tới
          const candidate = members.find((m) => (m.contact || m.personName) && m.name) || members[0];
          setUpcomingBirthdayMember({
            name: candidate.contact || candidate.personName || "Doanh nhân CEO 1983",
            company: candidate.name || candidate.companyName || "Doanh nghiệp CLB",
          });
        }
      })
      .catch(() => {});
  }, []);

  const birthdayName = upcomingBirthdayMember?.name || "CEO Nguyễn Minh Tuấn";
  const birthdayCompany = upcomingBirthdayMember?.company || "Minh Tuấn Holdings";

  const slides: SlideItem[] = [
    // 1. Ưu đãi 1
    {
      id: "perk-1",
      type: "perk",
      title: "Resort & Khách Sạn 5 Sao Toàn Quốc",
      subtitle: "Ưu đãi giảm 20% đặt phòng nghỉ dưỡng & hội nghị cao cấp",
      badge: "ƯU ĐÃI ĐẶC QUYỀN",
      badgeBg: "bg-amber-500 text-slate-950",
      image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=900&auto=format&fit=crop&q=80",
      targetUrl: "/association/perks",
    },
    // 2. Ưu đãi 2
    {
      id: "perk-2",
      type: "perk",
      title: "Phòng Chờ Thương Gia & Vé Hàng Không",
      subtitle: "Đặc quyền lối đi ưu tiên và phòng chờ VIP tại 15 sân bay",
      badge: "DỊCH VỤ VIP",
      badgeBg: "bg-blue-600 text-white",
      image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=900&auto=format&fit=crop&q=80",
      targetUrl: "/association/perks",
    },
    // 3. Ưu đãi 3
    {
      id: "perk-3",
      type: "perk",
      title: "Tư Vấn Quản Trị & Pháp Lý Doanh Nghiệp",
      subtitle: "Chiết khấu 15% gói kiểm toán, thuế & quản trị điều hành",
      badge: "ĐỐI TÁC CHIẾN LƯỢC",
      badgeBg: "bg-emerald-600 text-white",
      image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=900&auto=format&fit=crop&q=80",
      targetUrl: "/association/perks",
    },
    // 4. Banner Sinh Nhật Chuyên Nghiệp
    {
      id: "birthday-slide",
      type: "birthday",
      title: `Chúc Mừng Sinh Nhật: ${birthdayName}`,
      subtitle: `${birthdayCompany} • Chúc tuổi mới Vạn dặm thành công, vững tay chèo lái!`,
      badge: "SINH NHẬT HỘI VIÊN",
      badgeBg: "bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950",
      image: "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=900&auto=format&fit=crop&q=80",
      personName: birthdayName,
      companyName: birthdayCompany,
      dateInfo: "Tháng này",
      targetUrl: "/association/members",
    },
    // 5. Thành Viên Được Biểu Dương Của Năm
    {
      id: "honored-slide",
      type: "honored",
      title: "Biểu Dương: CEO Vũ Minh Trí (Trí Việt Group)",
      subtitle: "Hội viên xuất sắc tiêu biểu năm 2026 — Đóng góp 32 tỷ giao thương B2B nội khối",
      badge: "VINH DANH CỦA NĂM",
      badgeBg: "bg-gradient-to-r from-red-600 to-amber-500 text-white",
      image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=900&auto=format&fit=crop&q=80",
      personName: "CEO Vũ Minh Trí",
      companyName: "Tập Đoàn Trí Việt",
      targetUrl: "/association/analytics",
    },
  ];

  // Auto-play timer
  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isHovered, slides.length]);

  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  // Touch swipe support
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartXRef.current - touchEndX;
    if (diff > 50) {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    } else if (diff < -50) {
      setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
    }
    touchStartXRef.current = null;
  };

  const cur = slides[currentIndex];

  return (
    <div
      className="self-stretch w-full relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div
        onClick={() => {
          if (cur.targetUrl) navigate({ to: cur.targetUrl as any });
        }}
        className="w-full relative h-[145px] sm:h-[160px] rounded-3xl overflow-hidden shadow-lg border border-amber-400/40 dark:border-amber-400/25 block cursor-pointer transition duration-300 bg-slate-950 active:scale-[0.99]"
      >
        {/* Slide Photo Background */}
        <img
          src={cur.image}
          alt={cur.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />

        {/* Gradient dark protection overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-black/20 pointer-events-none" />

        {/* Dynamic theme accent according to slide type */}
        {cur.type === "birthday" && (
          <div className="absolute inset-0 bg-gradient-to-r from-amber-950/60 via-transparent to-amber-900/40 pointer-events-none" />
        )}
        {cur.type === "honored" && (
          <div className="absolute inset-0 bg-gradient-to-r from-red-950/60 via-transparent to-amber-950/50 pointer-events-none" />
        )}

        {/* Top Badge: Type of slide */}
        <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5">
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-md backdrop-blur-md flex items-center gap-1 ${cur.badgeBg}`}>
            {cur.type === "birthday" ? (
              <Cake className="size-3" />
            ) : cur.type === "honored" ? (
              <Award className="size-3" />
            ) : (
              <Sparkles className="size-3" />
            )}
            <span>{cur.badge}</span>
          </span>
        </div>

        {/* Slide count indicator top right */}
        <div className="absolute top-3 right-3 z-10 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[9.5px] font-mono font-bold text-white border border-white/20">
          {currentIndex + 1} / {slides.length}
        </div>

        {/* Content Box at Bottom */}
        <div className="absolute inset-x-3 bottom-3 z-10 flex items-end justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-0.5">
            <h3 className="text-[13px] sm:text-sm font-black text-white leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] truncate group-hover:text-amber-300 transition-colors">
              {cur.title}
            </h3>
            <p className="text-[11px] text-slate-200 line-clamp-1 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] font-medium">
              {cur.subtitle}
            </p>
          </div>

          <button
            type="button"
            className="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 text-[11px] font-black shadow-md border border-amber-300 group-hover:scale-105 active:scale-95 transition-all"
          >
            <span>{cur.type === "birthday" ? "Chúc mừng" : cur.type === "honored" ? "Vinh danh" : "Khám phá"}</span>
            <ChevronRight className="size-3 stroke-[3]" />
          </button>
        </div>

        {/* Navigation Arrow Left */}
        <button
          type="button"
          onClick={handlePrev}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-20 size-7 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-200 cursor-pointer border border-white/20"
          title="Trước"
        >
          <ChevronLeft className="size-4" />
        </button>

        {/* Navigation Arrow Right */}
        <button
          type="button"
          onClick={handleNext}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-20 size-7 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-200 cursor-pointer border border-white/20"
          title="Sau"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>

      {/* Pagination Dots Below Carousel */}
      <div className="flex items-center justify-center gap-1.5 mt-2">
        {slides.map((s, idx) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setCurrentIndex(idx)}
            className={`transition-all duration-300 rounded-full cursor-pointer ${
              currentIndex === idx
                ? "w-6 h-1.5 bg-amber-500"
                : "w-1.5 h-1.5 bg-slate-300 dark:bg-slate-700 hover:bg-amber-400/50"
            }`}
            title={`Slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
