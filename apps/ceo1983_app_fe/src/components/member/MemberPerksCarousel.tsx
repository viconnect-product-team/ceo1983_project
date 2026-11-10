import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  ChevronUp,
  ChevronDown,
  Sparkles,
  Cake,
  Crown,
  Award,
  ExternalLink,
  Gift,
  Building2,
  QrCode,
  X,
  Check,
  Copy,
  Tag,
  Calendar,
  Share2,
  Phone,
  User,
  ShieldCheck,
  Heart,
  Bookmark,
} from "lucide-react";
import { resolveMediaUrl, fetchNestApi } from "@/lib/api-client";
import { listMembers } from "@/lib/member-app.functions";
import { useAuth } from "@/context/AuthContext";
import { QrCanvas } from "@/components/member/QrCanvas";
import { toast } from "sonner";

export interface PerkSlide {
  id: string;
  category: string;
  categoryBadge: string;
  categoryBadgeBg: string;
  title: string;
  subtitle: string;
  offerOnImage?: string;
  discountTag?: string;
  image: string;
  // Specific slide type
  type: "sponsor" | "birthday" | "gold_member" | "resort";
  // Member info (used for birthday & gold_member)
  memberName?: string;
  memberCompany?: string;
  memberTitle?: string;
  memberAvatar?: string;
  memberPhone?: string;
  memberTenure?: string;
  // Offer info & voucher (used for sponsor, birthday, resort)
  sponsorName?: string;
  discountPercent?: string;
  voucherCode?: string;
  validUntil?: string;
  details: string;
  terms?: string[];
}

export function MemberPerksCarousel() {
  const { user } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [detailModalSlide, setDetailModalSlide] = useState<PerkSlide | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const touchStartYRef = useRef<number | null>(null);

  // Dynamic upcoming birthday member
  const [upcomingBirthdayMember, setUpcomingBirthdayMember] = useState<{
    name: string;
    company: string;
    avatar?: string;
  } | null>(null);

  useEffect(() => {
    listMembers()
      .then((members) => {
        if (Array.isArray(members) && members.length > 0) {
          const candidate =
            members.find((m) => (m.contact || m.personName) && m.name) || members[0];
          setUpcomingBirthdayMember({
            name: candidate.contact || candidate.personName || "CEO Nguyễn Minh Tuấn",
            company: candidate.name || candidate.companyName || "Minh Tuấn Holdings",
            avatar: candidate.avatar || undefined,
          });
        }
      })
      .catch(() => {});
  }, []);

  const bName = upcomingBirthdayMember?.name || "CEO Nguyễn Minh Tuấn";
  const bCompany = upcomingBirthdayMember?.company || "Minh Tuấn Holdings";

  const userCode = (user as any)?.code || (user as any)?.user_metadata?.member_code || "CEO1983-M83";

  // 4 Unique Slides with distinct layouts and clear categories (Yêu cầu 2)
  const slides: PerkSlide[] = [
    // 1. NHÀ TÀI TRỢ: Giảm 10% các sản phẩm thuộc công ty doanh nghiệp đó cho các hội viên
    {
      id: "slide-sponsor-10",
      type: "sponsor",
      category: "NHÀ TÀI TRỢ VÀNG",
      categoryBadge: "TÀI TRỢ ĐỘC QUYỀN",
      categoryBadgeBg: "bg-amber-500 text-slate-950 font-black",
      title: "Tập Đoàn Tân Á Đại Thành tài trợ giảm 10% toàn bộ sản phẩm",
      subtitle: "Ưu đãi chiết khấu trực tiếp 10% thiết bị nước, gia dụng cao cấp cho hội viên CEO 1983",
      discountTag: "-10% TOÀN BỘ SẢN PHẨM",
      sponsorName: "Tập Đoàn Tân Á Đại Thành",
      discountPercent: "10%",
      voucherCode: `TADT10-${userCode}`,
      validUntil: "31/12/2026",
      image: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=900&auto=format&fit=crop&q=80",
      details:
        "Tập Đoàn Tân Á Đại Thành đồng hành cùng CLB Doanh Nhân CEO 1983, trân trọng tài trợ chiết khấu 10% cho tất cả đơn hàng thiết bị, giải pháp xây dựng và gia dụng dành riêng cho hội viên chính thức.",
      terms: [
        "Áp dụng cho mọi hội viên chính thức thuộc CLB CEO 1983",
        "Xuất trình mã QR ưu đãi hoặc voucher khi ký hợp đồng",
        "Áp dụng đồng thời cùng chính sách bảo hành chính hãng toàn quốc",
      ],
    },
    // 2. SINH NHẬT: Hiện ưu đãi trực tiếp lên trên ảnh
    {
      id: "slide-birthday",
      type: "birthday",
      category: "ƯU ĐÃI SINH NHẬT HỘI VIÊN",
      categoryBadge: "CHÚC MỪNG SINH NHẬT",
      categoryBadgeBg: "bg-gradient-to-r from-rose-500 to-amber-500 text-white font-black",
      title: `Chúc Mừng Sinh Nhật: ${bName}`,
      subtitle: `${bCompany} • Tuổi mới vạn dặm hanh thông, kiến tạo thành công!`,
      offerOnImage: "TẶNG VOUCHER 2.000.000Đ & BÁNH SINH NHẬT CAO CẤP",
      memberName: bName,
      memberCompany: bCompany,
      voucherCode: `BDAY1983-${userCode}`,
      validUntil: "Trong tháng sinh nhật",
      image: "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=900&auto=format&fit=crop&q=80",
      details:
        "Ban Điều Hành CLB CEO 1983 gửi tặng món quà sinh nhật đặc biệt tri ân hội viên: Voucher quà tặng trị giá 2.000.000đ cùng bánh sinh nhật cao cấp trao tận tay tại doanh nghiệp hoặc sự kiện sinh hoạt định kỳ.",
      terms: [
        "Quà tặng trao tặng trong tháng sinh nhật của hội viên",
        "Quét mã QR tại Văn phòng Ban Thư Ký CLB hoặc đối tác ẩm thực",
        "Có thể quy đổi thành quyền lợi truyền thông thương hiệu doanh nghiệp",
      ],
    },
    // 3. THÀNH VIÊN VÀNG: Chỉ để hiện thông tin thành viên (KHÔNG có mã QR hay voucher)
    {
      id: "slide-gold-member",
      type: "gold_member",
      category: "THÀNH VIÊN VÀNG TIÊU BIỂU",
      categoryBadge: "THÀNH VIÊN VÀNG",
      categoryBadgeBg: "bg-amber-400 text-slate-950 font-black",
      title: "Vinh Danh: CEO Vũ Minh Trí",
      subtitle: "Phó Chủ Tịch Ban Xúc Tiến Thương Mại • Tập Đoàn Trí Việt",
      memberName: "CEO Vũ Minh Trí",
      memberCompany: "Tập Đoàn Đầu Tư & Công Nghệ Trí Việt",
      memberTitle: "Phó Chủ Tịch Ban Xúc Tiến Thương Mại CEO 1983",
      memberAvatar: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&auto=format&fit=crop&q=80",
      memberPhone: "0983 1983 83",
      memberTenure: "5 Năm Đồng Hành • Đóng góp 32 Tỷ giao thương",
      image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=900&auto=format&fit=crop&q=80",
      details:
        "Hội viên tiêu biểu đạt danh hiệu 'Thành viên Vàng CEO 1983' với những cống hiến vượt bậc trong các hoạt động giao thương nội khối, kết nối hợp tác kinh doanh và gắn kết cộng đồng doanh nhân HanoiBA.",
    },
    // 4. ĐẶC QUYỀN NGHỈ DƯỠNG & KHÁCH SẠN
    {
      id: "slide-resort",
      type: "resort",
      category: "ĐẶC QUYỀN NGHỈ DƯỠNG",
      categoryBadge: "NGHỈ DƯỠNG 5 SAO",
      categoryBadgeBg: "bg-emerald-600 text-white font-black",
      title: "Chuỗi Resort & Khách Sạn 5 Sao Toàn Quốc",
      subtitle: "Ưu đãi giảm 20% đặt phòng nghỉ dưỡng & hội nghị cao cấp cho CEO",
      discountTag: "GIẢM 20% ĐẶT PHÒNG",
      voucherCode: `RESORT20-${userCode}`,
      validUntil: "31/12/2026",
      image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=900&auto=format&fit=crop&q=80",
      details:
        "Đặc quyền độc quyền dành cho Doanh nhân CEO 1983: Giảm ngay 20% giá phòng nghỉ dưỡng và phòng hội nghị VIP tại hệ thống Vinpearl, InterContinental, JW Marriott trên toàn lãnh thổ Việt Nam.",
      terms: [
        "Áp dụng khi đặt phòng qua đường dây nóng đối tác CLB",
        "Quét mã QR tại quầy tiếp tân khi làm thủ tục check-in",
        "Áp dụng tối đa 3 phòng / kỳ nghỉ",
      ],
    },
  ];

  // ── ĐỒNG BỘ ƯU ĐÃI DO HỘI VIÊN ĐĂNG (LUÔN ĐƯA ƯU ĐÃI MỚI NHẤT LÊN ĐẦU SLIDE) ──
  const [memberCustomSlides, setMemberCustomSlides] = useState<PerkSlide[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem("vba_member_custom_perks");
      if (!stored) return [];
      const parsed: any[] = JSON.parse(stored);
      return parsed.map((m) => ({
        id: String(m.id),
        type: "sponsor" as const,
        category: m.category || "HỘI VIÊN ĐĂNG",
        categoryBadge: "ƯU ĐÃI NỘI KHỐI MỚI",
        categoryBadgeBg: "bg-blue-600 text-white font-black",
        title: m.title || "Ưu đãi hội viên tài trợ",
        subtitle: m.description ? m.description.slice(0, 90) : (m.summary || ""),
        discountTag: m.discountValue || m.discount || "ƯU ĐÃI VIP",
        sponsorName: m.partner || m.creatorName || "Hội viên CEO 1983",
        discountPercent: m.discountValue || m.discount || "10%",
        voucherCode: m.voucherCode || `CEO1983-${String(m.id).toUpperCase()}`,
        validUntil: m.validUntil || "31/12/2026",
        image: m.image || "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=900&auto=format&fit=crop&q=80",
        details: m.description || m.summary || "Đặc quyền ưu đãi độc quyền dành cho hội viên CLB CEO 1983.",
        terms: [
          `Doanh nghiệp tài trợ: ${m.partner || m.creatorName || "CLB CEO 1983"}`,
          `Nơi áp dụng: ${m.applicableLocation || m.address || "Hà Nội & Hệ thống đối tác"}`,
          "Xuất trình mã QR hoặc mã voucher khi thanh toán để hưởng chiết khấu",
        ],
      }));
    } catch {
      return [];
    }
  });

  const [serverSlides, setServerSlides] = useState<PerkSlide[]>([]);

  // Nạp ưu đãi mới nhất từ máy chủ API
  useEffect(() => {
    fetchNestApi<any[]>("/content/perks")
      .then((res) => {
        if (Array.isArray(res) && res.length > 0) {
          const mapped: PerkSlide[] = res.slice(0, 4).map((p) => ({
            id: `server-${p.id}`,
            type: "sponsor" as const,
            category: p.category || "ĐẶC QUYỀN ĐỐI TÁC",
            categoryBadge: "ĐỐI TÁC CHÍNH THỨC",
            categoryBadgeBg: "bg-indigo-600 text-white font-black",
            title: p.title || "Ưu đãi đối tác liên kết",
            subtitle: p.summary || p.description?.slice(0, 90) || "",
            discountTag: p.discount || "ƯU ĐÃI",
            sponsorName: p.partner || "Đối tác CEO 1983",
            discountPercent: p.discount || "",
            voucherCode: p.voucherCode || `CEO1983-V${p.id}`,
            validUntil: p.validUntil || "31/12/2026",
            image: p.image || "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=900&auto=format&fit=crop&q=80",
            details: p.description || p.summary || "Ưu đãi đối tác đồng hành cùng CLB Doanh Nhân CEO 1983.",
            terms: [
              "Áp dụng cho mọi hội viên chính thức thuộc CLB CEO 1983",
              "Xuất trình mã QR ưu đãi hoặc voucher khi áp dụng",
            ],
          }));
          setServerSlides(mapped);
        }
      })
      .catch(() => {});
  }, []);

  // Lắng nghe sự kiện khi có ưu đãi mới được hội viên đăng lên
  useEffect(() => {
    const handleReloadCustomPerks = () => {
      try {
        const stored = localStorage.getItem("vba_member_custom_perks");
        if (stored) {
          const parsed: any[] = JSON.parse(stored);
          setMemberCustomSlides(
            parsed.map((m) => ({
              id: String(m.id),
              type: "sponsor" as const,
              category: m.category || "HỘI VIÊN ĐĂNG",
              categoryBadge: "ƯU ĐÃI NỘI KHỐI MỚI",
              categoryBadgeBg: "bg-blue-600 text-white font-black",
              title: m.title || "Ưu đãi hội viên tài trợ",
              subtitle: m.description ? m.description.slice(0, 90) : (m.summary || ""),
              discountTag: m.discountValue || m.discount || "ƯU ĐÃI VIP",
              sponsorName: m.partner || m.creatorName || "Hội viên CEO 1983",
              discountPercent: m.discountValue || m.discount || "10%",
              voucherCode: m.voucherCode || `CEO1983-${String(m.id).toUpperCase()}`,
              validUntil: m.validUntil || "31/12/2026",
              image: m.image || "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=900&auto=format&fit=crop&q=80",
              details: m.description || m.summary || "Đặc quyền ưu đãi độc quyền dành cho hội viên CLB CEO 1983.",
              terms: [
                `Doanh nghiệp tài trợ: ${m.partner || m.creatorName || "CLB CEO 1983"}`,
                `Nơi áp dụng: ${m.applicableLocation || m.address || "Hà Nội & Hệ thống đối tác"}`,
                "Xuất trình mã QR hoặc mã voucher khi thanh toán để hưởng chiết khấu",
              ],
            }))
          );
        }
      } catch {}
    };

    window.addEventListener("vba:saved_perks_updated", handleReloadCustomPerks);
    window.addEventListener("vba:member_custom_perk_created", handleReloadCustomPerks);
    window.addEventListener("storage", handleReloadCustomPerks);
    return () => {
      window.removeEventListener("vba:saved_perks_updated", handleReloadCustomPerks);
      window.removeEventListener("vba:member_custom_perk_created", handleReloadCustomPerks);
      window.removeEventListener("storage", handleReloadCustomPerks);
    };
  }, []);

  // ── DANH SÁCH SLIDE HOÀN CHỈNH (ƯU ĐÃI MỚI NHẤT LUÔN ĐỨNG ĐẦU) ──
  const allSlides: PerkSlide[] = useMemo(() => {
    return [...memberCustomSlides, ...serverSlides, ...slides];
  }, [memberCustomSlides, serverSlides, slides]);

  // ── QUẢN LÝ TRẠNG THÁI LƯU / BỎ LƯU ƯU ĐÃI ──
  const [savedPerkIds, setSavedPerkIds] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem("vba_my_saved_perks");
      if (!stored) return [];
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed.map((p: any) => p.id) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const handleSyncSaved = () => {
      try {
        const stored = localStorage.getItem("vba_my_saved_perks");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) setSavedPerkIds(parsed.map((p: any) => p.id));
        }
      } catch {}
    };
    window.addEventListener("vba:saved_perks_updated", handleSyncSaved);
    return () => window.removeEventListener("vba:saved_perks_updated", handleSyncSaved);
  }, []);

  const handleToggleSaveSlide = (s: PerkSlide, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const isSaved = savedPerkIds.includes(s.id);
    let nextIds: string[];
    let nextSavedPerks: any[];
    try {
      const stored = localStorage.getItem("vba_my_saved_perks");
      const currentSaved: any[] = stored ? JSON.parse(stored) : [];
      if (isSaved) {
        nextIds = savedPerkIds.filter((id) => id !== s.id);
        nextSavedPerks = currentSaved.filter((p) => p.id !== s.id);
        toast.info(`Đã bỏ lưu ưu đãi "${s.title}" khỏi ví.`);
      } else {
        nextIds = [s.id, ...savedPerkIds];
        const newSavedItem = {
          id: s.id,
          title: s.title,
          category: s.category,
          partner: s.sponsorName || s.memberName || "CEO 1983",
          summary: s.subtitle,
          description: s.details,
          discount: s.discountTag || s.discountPercent || "Ưu đãi VIP",
          icon: "gift",
          voucherCode: s.voucherCode || `CEO1983-${s.id.toUpperCase()}`,
          validUntil: s.validUntil || "31/12/2026",
          qrPayload: `https://ceo1983.viconnect.vn/perk/${s.id}?user=${userCode}&code=${s.voucherCode || "PERK1983"}`,
        };
        nextSavedPerks = [newSavedItem, ...currentSaved.filter((p) => p.id !== s.id)];
        toast.success(`Đã lưu ưu đãi "${s.title}"! Đang mở voucher và mã QR...`);
        // Khi lưu ưu đãi, lập tức mở voucher kèm mã QR & mã số để áp dụng ngay!
        setDetailModalSlide(s);
      }
      setSavedPerkIds(nextIds);
      localStorage.setItem("vba_my_saved_perks", JSON.stringify(nextSavedPerks));
      window.dispatchEvent(new CustomEvent("vba:saved_perks_updated"));
    } catch (err) {
      console.error("Lỗi khi lưu ưu đãi:", err);
    }
  };

  // Auto slide vertically from bottom to top (Yêu cầu 2)
  useEffect(() => {
    if (isHovered || detailModalSlide !== null) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % allSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isHovered, detailModalSlide, allSlides.length]);

  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? allSlides.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % allSlides.length);
  };

  // Touch vertical swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartYRef.current === null) return;
    const diffY = touchStartYRef.current - e.changedTouches[0].clientY;
    // Swipe Up -> Next slide (from bottom up)
    if (diffY > 40) {
      setCurrentIndex((prev) => (prev + 1) % allSlides.length);
    } else if (diffY < -40) {
      setCurrentIndex((prev) => (prev === 0 ? allSlides.length - 1 : prev - 1));
    }
    touchStartYRef.current = null;
  };

  const currentSlide = allSlides[currentIndex] || allSlides[0];

  const handleCopyVoucher = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    toast.success("Đã sao chép mã ưu đãi độc quyền!");
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div
      className="self-stretch w-full flex flex-col gap-2 select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Header bar of Perks Section */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="size-6 rounded-lg bg-amber-500/20 text-amber-500 flex items-center justify-center">
            <Gift className="size-3.5" />
          </div>
          <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-white">
            ƯU ĐÃI & ĐẶC QUYỀN HỘI VIÊN
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-mono font-bold text-slate-600 dark:text-slate-300">
            {currentIndex + 1} / {allSlides.length}
          </span>
          <button
            type="button"
            onClick={handlePrev}
            className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 cursor-pointer"
            title="Slide trước"
          >
            <ChevronUp className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 cursor-pointer"
            title="Slide sau"
          >
            <ChevronDown className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Main Vertical Slide Viewport (Height 165px) */}
      <div className="relative w-full h-[165px] sm:h-[180px] rounded-3xl overflow-hidden shadow-lg border border-amber-400/40 dark:border-amber-400/25 bg-slate-950">
        <div
          className="w-full h-full transition-transform duration-600 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{ transform: `translateY(-${currentIndex * 100}%)` }}
        >
          {allSlides.map((s, idx) => {
            return (
              <div
                key={s.id}
                onClick={() => setDetailModalSlide(s)}
                className="relative w-full h-full cursor-pointer group active:scale-[0.99] transition-transform overflow-hidden"
              >
                {/* Background Photo */}
                <img
                  src={s.image}
                  alt={s.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80"
                />

                {/* Dark Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/55 to-black/30 pointer-events-none" />

                {/* Top Badge: Clear Category Label */}
                <div className="absolute top-3 inset-x-3 z-10 flex items-center justify-between">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider shadow-md backdrop-blur-md flex items-center gap-1 ${s.categoryBadgeBg}`}
                  >
                    {s.type === "birthday" ? (
                      <Cake className="size-3" />
                    ) : s.type === "gold_member" ? (
                      <Crown className="size-3" />
                    ) : (
                      <Sparkles className="size-3" />
                    )}
                    <span>{s.category}</span>
                  </span>

                  {/* Right side tag: Discount or Member tag & Save Button */}
                  <div className="flex items-center gap-1.5">
                    {s.discountTag && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/25 text-amber-300 font-extrabold text-[9.5px] uppercase tracking-wider shadow-md border border-amber-400/40 backdrop-blur-md">
                        {s.discountTag}
                      </span>
                    )}

                    {/* Nút Lưu / Bỏ lưu ưu đãi trên mỗi slide */}
                    {s.type !== "gold_member" && (
                      <button
                        type="button"
                        onClick={(e) => handleToggleSaveSlide(s, e)}
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-md backdrop-blur-md flex items-center gap-1 transition-all active:scale-95 cursor-pointer ${
                          savedPerkIds.includes(s.id)
                            ? "bg-rose-600 text-white ring-1 ring-white/50"
                            : "bg-black/45 hover:bg-black/60 text-white/90 border border-white/30"
                        }`}
                        title={savedPerkIds.includes(s.id) ? "Bỏ lưu ưu đãi" : "Lưu ưu đãi & nhận mã voucher"}
                      >
                        <Heart className={`size-3 ${savedPerkIds.includes(s.id) ? "fill-white text-white" : "text-white"}`} />
                        <span>{savedPerkIds.includes(s.id) ? "Đã lưu" : "Lưu"}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* UNIQUE SLIDE LAYOUTS (Yêu cầu 2: Mỗi slide 1 bố cục riêng) */}

                {/* LAYOUT 1: SPONSOR SLIDE */}
                {s.type === "sponsor" && (
                  <div className="absolute inset-x-3.5 bottom-3 z-10 flex items-end justify-between gap-3">
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[10.5px] font-bold">
                        <Building2 className="size-3" />
                        <span>{s.sponsorName}</span>
                      </div>
                      <h3 className="text-[13px] sm:text-sm font-black text-white leading-snug drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] truncate group-hover:text-amber-300 transition-colors">
                        {s.title}
                      </h3>
                      <p className="text-[11px] text-slate-200 line-clamp-1 font-medium">
                        {s.subtitle}
                      </p>
                    </div>
                    <span className="shrink-0 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 text-[11px] font-black shadow-md flex items-center gap-1">
                      <QrCode className="size-3.5" />
                      <span>Xem mã QR</span>
                    </span>
                  </div>
                )}

                {/* LAYOUT 2: BIRTHDAY SLIDE (Ưu đãi hiện trực tiếp lên trên ảnh) */}
                {s.type === "birthday" && (
                  <div className="absolute inset-x-3 bottom-3 z-10 flex flex-col gap-1.5">
                    {/* Offer directly overlaid on the photo */}
                    <div className="self-start px-2.5 py-1 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white font-black text-[11px] sm:text-xs shadow-lg border border-amber-300 flex items-center gap-1.5">
                      <Gift className="size-3.5 text-amber-300 shrink-0" />
                      <span className="tracking-wide">{s.offerOnImage}</span>
                    </div>

                    <div className="flex items-end justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-black text-white leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] truncate">
                          {s.title}
                        </h3>
                        <p className="text-[11px] text-amber-200 font-medium truncate mt-0.5">
                          {s.subtitle}
                        </p>
                      </div>
                      <span className="shrink-0 px-3 py-1.5 rounded-full bg-gradient-to-r from-rose-500 to-amber-500 text-white text-[11px] font-black shadow-md flex items-center gap-1">
                        <Cake className="size-3.5" />
                        <span>Nhận quà</span>
                      </span>
                    </div>
                  </div>
                )}

                {/* LAYOUT 3: GOLDEN MEMBER SLIDE (Chỉ hiện thông tin thành viên, KHÔNG có QR) */}
                {s.type === "gold_member" && (
                  <div className="absolute inset-x-3.5 bottom-3 z-10 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {/* Avatar with luxury golden ring */}
                      <div className="relative size-12 sm:size-14 rounded-full ring-2 ring-amber-400 p-0.5 bg-gradient-to-br from-amber-300 via-amber-500 to-amber-600 shadow-md shrink-0">
                        <img
                          src={s.memberAvatar}
                          alt={s.memberName}
                          className="w-full h-full rounded-full object-cover"
                        />
                        <div className="absolute -bottom-1 -right-1 size-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow-xs">
                          <Crown className="size-3" />
                        </div>
                      </div>

                      <div className="min-w-0 flex-1 space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-sm font-black text-white truncate drop-shadow-sm">
                            {s.memberName}
                          </h3>
                          <span className="px-1.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[9px] uppercase">
                            VIP
                          </span>
                        </div>
                        <p className="text-[11px] text-amber-300 font-bold truncate">
                          {s.memberTitle}
                        </p>
                        <p className="text-[10px] text-slate-200 truncate">
                          {s.memberTenure}
                        </p>
                      </div>
                    </div>

                    <span className="shrink-0 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/30 text-white text-[11px] font-bold shadow-xs hover:bg-white/25">
                      Hồ sơ CEO
                    </span>
                  </div>
                )}

                {/* LAYOUT 4: RESORT SLIDE */}
                {s.type === "resort" && (
                  <div className="absolute inset-x-3.5 bottom-3 z-10 flex items-end justify-between gap-3">
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="text-[10.5px] font-bold text-emerald-300">
                        Hệ thống Vinpearl & InterContinental
                      </div>
                      <h3 className="text-[13px] sm:text-sm font-black text-white leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] truncate group-hover:text-amber-300 transition-colors">
                        {s.title}
                      </h3>
                      <p className="text-[11px] text-slate-200 line-clamp-1 font-medium">
                        {s.subtitle}
                      </p>
                    </div>
                    <span className="shrink-0 px-3 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-black shadow-md flex items-center gap-1">
                      <QrCode className="size-3.5" />
                      <span>Mã giảm giá</span>
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail Modal with QR Code (EXCEPT for Golden Member slide) */}
      {detailModalSlide && (
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in"
          onClick={() => setDetailModalSlide(null)}
        >
          <div
            className="relative w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="relative overflow-hidden bg-gradient-to-r from-[#00224F] via-[#003B95] to-[#0A192F] p-4 text-white">
              <div className="absolute top-3 right-3 flex items-center gap-2">
                {detailModalSlide.type !== "gold_member" && (
                  <button
                    type="button"
                    onClick={(e) => handleToggleSaveSlide(detailModalSlide, e)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 transition cursor-pointer active:scale-95 ${
                      savedPerkIds.includes(detailModalSlide.id)
                        ? "bg-rose-600 text-white shadow-xs"
                        : "bg-white/20 hover:bg-white/30 text-white border border-white/30"
                    }`}
                  >
                    <Heart className={`size-3 ${savedPerkIds.includes(detailModalSlide.id) ? "fill-white text-white" : "text-white"}`} />
                    <span>{savedPerkIds.includes(detailModalSlide.id) ? "Đã lưu" : "Lưu ưu đãi"}</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setDetailModalSlide(null)}
                  className="grid h-7 w-7 place-items-center rounded-full bg-white/15 text-white/90 hover:bg-white/25 transition cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex items-center gap-2 mb-1 pr-28">
                <span className={`px-2 py-0.5 rounded-full text-[9.5px] uppercase font-black ${detailModalSlide.categoryBadgeBg}`}>
                  {detailModalSlide.category}
                </span>
                {detailModalSlide.discountTag && (
                  <span className="px-2 py-0.5 rounded-full bg-red-600 text-white text-[9.5px] font-black">
                    {detailModalSlide.discountTag}
                  </span>
                )}
              </div>
              <h3 className="text-sm sm:text-base font-black text-white leading-tight">
                {detailModalSlide.title}
              </h3>
            </div>

            {/* Modal Body */}
            <div className="p-4 space-y-3.5 max-h-[75vh] overflow-y-auto">
              {/* SLIDE THÀNH VIÊN VÀNG: Chỉ hiển thị thông tin thành viên, TUYỆT ĐỐI KHÔNG HIỆN MÃ QR */}
              {detailModalSlide.type === "gold_member" ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-300 dark:border-amber-500/30">
                    <img
                      src={detailModalSlide.memberAvatar}
                      alt={detailModalSlide.memberName}
                      className="size-16 rounded-full object-cover ring-2 ring-amber-400 p-0.5 bg-amber-500"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-base font-black text-slate-900 dark:text-white">
                          {detailModalSlide.memberName}
                        </h4>
                        <span className="px-1.5 py-0.5 rounded-md bg-amber-400 text-slate-950 font-black text-[10px]">
                          VÀNG
                        </span>
                      </div>
                      <p className="text-xs font-bold text-amber-700 dark:text-amber-400 mt-0.5">
                        {detailModalSlide.memberTitle}
                      </p>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300">
                        {detailModalSlide.memberCompany}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    <p>{detailModalSlide.details}</p>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-white/10 space-y-1.5 text-[11.5px]">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 dark:text-slate-400">Danh hiệu vinh danh:</span>
                        <span className="font-bold text-amber-600 dark:text-amber-400">Thành Viên Vàng 2026</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 dark:text-slate-400">Thời gian đồng hành:</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">5 năm liên tục</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 dark:text-slate-400">Đóng góp kết nối:</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">32 Tỷ giao thương</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 dark:text-slate-400">Hotline liên hệ:</span>
                        <span className="font-mono font-bold text-blue-600 dark:text-blue-400">0983 1983 83</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setDetailModalSlide(null);
                      toast.info("Đã ghi nhận thông tin thành viên tiêu biểu!");
                    }}
                    className="w-full py-2.5 rounded-xl bg-[#003B95] hover:bg-[#002B70] text-white font-bold text-xs shadow-md transition active:scale-95 cursor-pointer"
                  >
                    Đóng thông tin
                  </button>
                </div>
              ) : (
                /* CÁC SLIDE ƯU ĐÃI KHÁC: Có mã QR ứng với tài khoản được add ưu đãi hoặc có sinh nhật */
                <div className="space-y-3.5">
                  {/* QR Code Presentation Box */}
                  <div className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-white/10 text-center">
                    <div className="rounded-xl bg-white p-2.5 shadow-md border border-slate-200 mb-2">
                      <QrCanvas
                        value={`https://ceo1983.viconnect.vn/perk/${detailModalSlide.id}?user=${userCode}&code=${detailModalSlide.voucherCode || "PERK1983"}`}
                        size={150}
                      />
                    </div>
                    <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">
                      MÃ QR ƯU ĐÃI ĐỘC QUYỀN TÀI KHOẢN
                    </span>
                    <div className="text-base font-black text-[#003B95] dark:text-amber-400 font-mono tracking-wider mt-0.5">
                      {detailModalSlide.voucherCode || `CEO1983-${userCode}`}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 max-w-[240px]">
                      {detailModalSlide.type === "birthday"
                        ? `Mã QR mừng sinh nhật của tài khoản ${userCode}. Quét mã tại quầy để nhận quà sinh nhật!`
                        : "Quét mã QR tại điểm dịch vụ đối tác hoặc đưa nhân viên xác thực để áp dụng chiết khấu."}
                    </p>
                  </div>

                  {/* Copy voucher code */}
                  {detailModalSlide.voucherCode && (
                    <div className="flex items-center gap-2 p-1.5 pl-3 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                      <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200 truncate flex-1">
                        {detailModalSlide.voucherCode}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyVoucher(detailModalSlide.voucherCode!)}
                        className="px-3 py-1.5 rounded-lg bg-[#003B95] text-white text-[11px] font-bold hover:bg-[#002B70] transition active:scale-95 cursor-pointer flex items-center gap-1"
                      >
                        {copiedCode ? <Check className="size-3 text-emerald-300" /> : <Copy className="size-3" />}
                        <span>{copiedCode ? "Đã chép" : "Sao chép"}</span>
                      </button>
                    </div>
                  )}

                  {/* Details Description */}
                  <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    <p>{detailModalSlide.details}</p>
                  </div>

                  {/* Terms */}
                  {detailModalSlide.terms && detailModalSlide.terms.length > 0 && (
                    <div className="space-y-1 pt-1 border-t border-slate-100 dark:border-white/10">
                      <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                        Điều kiện áp dụng:
                      </span>
                      {detailModalSlide.terms.map((term, i) => (
                        <div key={i} className="flex items-start gap-1.5 text-[11px] text-slate-600 dark:text-slate-400">
                          <Check className="size-3 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{term}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => setDetailModalSlide(null)}
                    className="w-full py-2.5 rounded-xl bg-[#003B95] hover:bg-[#002B70] text-white font-bold text-xs shadow-md transition active:scale-95 cursor-pointer"
                  >
                    Đóng ưu đãi
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
