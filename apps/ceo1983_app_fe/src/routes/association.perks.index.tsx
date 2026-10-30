import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Gift,
  ChevronRight,
  Sparkles,
  Award,
  Crown,
  X,
  Tag,
  Percent,
  Compass,
  ShoppingBag,
  HeartHandshake,
  Shield,
  Plane,
  Coffee,
  Briefcase,
  GraduationCap,
  Stethoscope,
  Scale,
  Calculator,
  Hotel,
  Trophy,
  Dices,
  CheckCircle2,
  PartyPopper,
  MapPin,
  Phone,
  QrCode,
  ExternalLink,
  Store,
  Navigation,
  Plus,
} from "lucide-react";
import { useState, useMemo, useEffect, useCallback } from "react";
import { MemberHeader } from "@/components/member/MemberShell";
import { fetchNestApi } from "@/lib/api-client";
import { type Perk } from "@/lib/member-app.functions";
import { useT } from "@/lib/i18n";
import { QrCanvas } from "@/components/member/QrCanvas";
import { toast } from "sonner";
import {
  MemberPerkCreateModal,
  type MemberPerkFormData,
} from "@/components/perks/MemberPerkCreateModal";

export const Route = createFileRoute("/association/perks/")({
  component: PerksScreen,
});

export const PERK_ICONS: Record<string, typeof Gift> = {
  gift: Gift,
  tag: Tag,
  percent: Percent,
  compass: Compass,
  shopping: ShoppingBag,
  handshake: HeartHandshake,
  shield: Shield,
  plane: Plane,
  coffee: Coffee,
  briefcase: Briefcase,
  education: GraduationCap,
  health: Stethoscope,
  legal: Scale,
  finance: Calculator,
  hotel: Hotel,
  trophy: Trophy,
};

export interface ExtendedPerk extends Perk {
  locationName?: string;
  address?: string;
  hotline?: string;
  mapUrl?: string;
  stallUrl?: string;
  voucherCode?: string;
  discountType?: string;
  applicableLocation?: string;
  productName?: string;
  isMemberPerk?: boolean;
  creatorName?: string;
  qrPayload?: string;
}

const DEFAULT_PERKS_SEED: ExtendedPerk[] = [
  {
    id: "perk-001",
    title: "VIP Lounge & Golf Long Biên",
    category: "Golf & Nghỉ dưỡng",
    partner: "Sân Golf Long Biên",
    discount: "Giảm 25%",
    summary: "Đặc quyền phòng chờ VIP và ưu đãi giá green fee dành riêng cho hội viên CEO 1983",
    description: "Hội viên xuất trình thẻ doanh nhân CEO 1983 điện tử để nhận đặc quyền phòng chờ VIP, giảm 25% phí green fee tất cả các ngày trong tuần.",
    icon: "hotel",
    link: "https://longbiengolf.vn",
    validUntil: "31/12/2026",
    locationName: "Sân Golf Long Biên",
    address: "Khu Trung Đoàn 918, P. Phúc Đồng, Q. Long Biên, Hà Nội",
    hotline: "02438755959",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=San+Golf+Long+Bien+Ha+Noi",
    stallUrl: "/association/products",
  },
  {
    id: "perk-002",
    title: "Nghỉ dưỡng 5 sao Vinpearl & InterContinental",
    category: "Golf & Nghỉ dưỡng",
    partner: "Hệ thống Vinpearl & InterContinental",
    discount: "Ưu đãi 30%",
    summary: "Ưu đãi đặt phòng và dịch vụ ẩm thực tại hệ thống resort 5 sao trên toàn quốc",
    description: "Giảm 30% giá phòng công bố và 15% dịch vụ ẩm thực F&B tại tất cả các cơ sở Vinpearl và InterContinental tại Phú Quốc, Nha Trang, Đà Nẵng.",
    icon: "hotel",
    link: "https://vinpearl.com",
    validUntil: "31/12/2026",
    locationName: "Vinpearl & InterContinental Toàn Quốc",
    address: "Hà Nội, Phú Quốc, Nha Trang, Đà Nẵng, Hạ Long",
    hotline: "1900232389",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=Vinpearl+Resort",
    stallUrl: "/association/products",
  },
  {
    id: "perk-003",
    title: "Gói Pháp lý Doanh nghiệp & M&A",
    category: "Dịch vụ Doanh nghiệp",
    partner: "Công ty Luật Trí Minh",
    discount: "Tặng 100% tư vấn",
    summary: "Tư vấn rà soát hợp đồng kinh tế và tái cấu trúc doanh nghiệp miễn phí lần đầu",
    description: "Miễn phí 01 buổi tư vấn chuyên sâu về tái cấu trúc vốn và M&A; giảm 20% phí luật sư cho các vụ việc phát sinh tiếp theo.",
    icon: "legal",
    link: "https://luattriminh.vn",
    validUntil: "31/12/2026",
    locationName: "Công ty Luật Trí Minh Hà Nội",
    address: "Tầng 5, Indochina Plaza, 241 Xuân Thủy, Cầu Giấy, Hà Nội",
    hotline: "02437933838",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=Cong+ty+Luat+Tri+Minh+241+Xuan+Thuy",
    stallUrl: "/association/products",
  },
  {
    id: "perk-004",
    title: "Dịch vụ Kế toán & Kiểm toán Độc lập",
    category: "Dịch vụ Doanh nghiệp",
    partner: "Vaco Auditing",
    discount: "Chiết khấu 20%",
    summary: "Kiểm toán báo cáo tài chính và thẩm định định giá doanh nghiệp hội viên",
    description: "Chiết khấu trực tiếp 20% phí dịch vụ kiểm toán báo cáo tài chính năm và soát xét hệ thống kiểm soát nội bộ cho doanh nghiệp hội viên.",
    icon: "finance",
    link: "https://vaco.com.vn",
    validUntil: "31/12/2026",
    locationName: "Vaco Auditing & Consulting",
    address: "Tầng 12, Tòa Licogi 13, 164 Khuất Duy Tiến, Thanh Xuân, Hà Nội",
    hotline: "02435566886",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=Vaco+Auditing+164+Khuat+Duy+Tien",
    stallUrl: "/association/products",
  },
  {
    id: "perk-005",
    title: "Hạ tầng Cloud & Chuyển đổi số VNPT",
    category: "Dịch vụ Doanh nghiệp",
    partner: "VNPT Cloud",
    discount: "Tài trợ 15 triệu",
    summary: "Gói tài trợ giải pháp đám mây Smart Cloud và chữ ký số từ xa SmartCA",
    description: "Tặng 15.000.000đ cước sử dụng Cloud Server trong 6 tháng đầu tiên kèm gói chữ ký số cá nhân SmartCA dành cho CEO.",
    icon: "briefcase",
    link: "https://cloud.vnpt.vn",
    validUntil: "31/12/2026",
    locationName: "VNPT Data Center & Smart Cloud",
    address: "Khu Công nghệ cao Hòa Lạc, Thạch Thất, Hà Nội",
    hotline: "18001260",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=VNPT+Data+Center+Hoa+Lac",
    stallUrl: "/association/products",
  },
];

const LUCKY_DRAW_PRIZES = [
  {
    id: "lucky-prize-1",
    title: "Giải Đặc Biệt Gala 2026: 01 Chuyến Du Lịch Dubai 5N4Đ + Thẻ Hội Viên Vàng",
    category: "Trúng thưởng",
    discount: "Trúng Thưởng 100%",
    summary: "Dành riêng cho hội viên may mắn tham dự Gala Doanh Nhân CEO 1983. Mã vé: CEO1983-DUBAI-VIP",
    partner: "Ban Chấp Hành Hiệp Hội CEO 1983",
    icon: "trophy",
    code: "CEO1983-DUBAI-VIP",
    claimed: true,
    locationName: "Khách Sạn Melia Hà Nội - Đêm Gala CEO 1983",
    address: "44 Lý Thường Kiệt, Hoàn Kiếm, Hà Nội",
    hotline: "0901000001",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=Melia+Hanoi",
  },
  {
    id: "lucky-prize-2",
    title: "Giải Nhất Vòng Quay May Mắn: Bộ Quà Tặng Trống Đồng Mạ Vàng 24K",
    category: "Trúng thưởng",
    discount: "Đã Trúng",
    summary: "Vật phẩm phong thủy giới hạn mạ vàng 24K vinh danh kết nối giao thương nội khối xuất sắc.",
    partner: "CLB Doanh Nhân CEO 1983",
    icon: "gift",
    code: "CEO1983-GOLD-GIFT",
    claimed: true,
    locationName: "Văn Phòng Ban Thư Ký CEO 1983",
    address: "Tòa nhà HanoiBA, Q. Nam Từ Liêm, Hà Nội",
    hotline: "0901000001",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=HanoiBA+Ha+Noi",
  },
  {
    id: "lucky-prize-3",
    title: "Giải Nhì Bốc Thăm: Voucher Nghỉ Dưỡng Vinpearl 5 Sao Trị Giá 10.000.000đ",
    category: "Trúng thưởng",
    discount: "10.000.000đ",
    summary: "Áp dụng nghỉ dưỡng tại toàn bộ hệ thống resort và villa Vinpearl trên toàn quốc.",
    partner: "Vinpearl Resort & Spa",
    icon: "hotel",
    code: "CEO1983-VINPEARL-VOUCHER",
    claimed: false,
    locationName: "Hệ thống Vinpearl Resort Toàn Quốc",
    address: "Phú Quốc, Nha Trang, Đà Nẵng, Hạ Long",
    hotline: "1900232389",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=Vinpearl+Resort",
  },
  {
    id: "lucky-prize-4",
    title: "Giải Khuyến Khích: Thẻ Danh Thiếp Điện Tử Thông Minh CEO 1983 Smart NFC Mạ Vàng",
    category: "Trúng thưởng",
    discount: "Miễn Phí 100%",
    summary: "Thẻ NFC kim loại đen bóng viền mạ vàng sang trọng tích hợp công nghệ chạm danh thiếp 1 chạm CLB CEO 1983.",
    partner: "Ban Công Nghệ & Chuyển Đổi Số CEO 1983",
    icon: "trophy",
    code: "CEO1983-NFC-CARD-VIP",
    claimed: false,
    locationName: "Trung Tâm Trải Nghiệm Số CEO 1983",
    address: "Hà Nội",
    hotline: "0901000001",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=Hanoi+Vietnam",
  },
];

function PerksScreen() {
  const t = useT();
  const [serverPerks, setServerPerks] = useState<ExtendedPerk[]>(DEFAULT_PERKS_SEED);
  const [loading, setLoading] = useState(false);

  // Dynamic QR Code Modal State
  const [qrPerkModal, setQrPerkModal] = useState<ExtendedPerk | null>(null);

  const fetchLivePerks = useCallback(async () => {
    setLoading(true);
    try {
      let res = await fetchNestApi<any[]>("/content/perks").catch(() => null);
      if (!Array.isArray(res) || res.length === 0) {
        res = await fetchNestApi<any[]>("/content/admin/perks").catch(() => null);
      }
      if (Array.isArray(res) && res.length > 0) {
        setServerPerks(
          res.map((p) => ({
            id: String(p.id),
            title: p.title || "",
            category: p.category || "",
            partner: p.partner || "",
            summary: p.summary || "",
            description: p.description || "",
            discount: p.discount || "",
            icon: String(p.icon || "gift").toLowerCase(),
            link: p.link || "",
            validUntil: p.validUntil || p.valid_until || "",
            locationName: p.locationName || p.location_name || p.partner || "Hà Nội",
            address: p.address || "Hà Nội & Hệ thống đối tác toàn quốc",
            hotline: p.hotline || "0901000001",
            mapUrl: p.mapUrl || p.map_url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.partner || "Ha Noi")}`,
            stallUrl: p.stallUrl || p.stall_url || "/association/products",
          })),
        );
      }
    } catch (err) {
      console.warn("[PerksScreen] Error loading perks:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLivePerks();
  }, [fetchLivePerks]);

  const [giftModalOpen, setGiftModalOpen] = useState(false);
  const [isCreatePerkOpen, setIsCreatePerkOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("Tất cả");
  const [activePrize, setActivePrize] = useState<(typeof LUCKY_DRAW_PRIZES)[0] | null>(null);

  // Load custom perks posted by members
  const [memberCustomPerks, setMemberCustomPerks] = useState<ExtendedPerk[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem("vba_member_custom_perks");
      if (!stored) return [];
      const parsed: MemberPerkFormData[] = JSON.parse(stored);
      return parsed.map((m) => ({
        id: m.id,
        title: m.title,
        category: m.category || "Hội viên đăng",
        partner: m.partner,
        summary: m.description.slice(0, 90) + (m.description.length > 90 ? "..." : ""),
        description: m.description,
        discount: m.discountValue,
        icon: "gift",
        link: m.qrPayload || "",
        validUntil: m.validUntil,
        locationName: m.applicableLocation,
        address: m.address || m.applicableLocation,
        hotline: m.hotline || "0983198383",
        mapUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(m.partner + " " + (m.address || "Ha Noi"))}`,
        stallUrl: "/association/products",
        voucherCode: m.voucherCode,
        discountType: m.discountType,
        applicableLocation: m.applicableLocation,
        productName: m.productName,
        isMemberPerk: true,
        creatorName: m.creatorName,
        qrPayload: m.qrPayload,
      }));
    } catch {
      return [];
    }
  });

  const handlePerkCreated = (newPerkData: MemberPerkFormData) => {
    const formatted: ExtendedPerk = {
      id: newPerkData.id,
      title: newPerkData.title,
      category: newPerkData.category || "Hội viên đăng",
      partner: newPerkData.partner,
      summary: newPerkData.description.slice(0, 90),
      description: newPerkData.description,
      discount: newPerkData.discountValue,
      icon: "gift",
      link: newPerkData.qrPayload || "",
      validUntil: newPerkData.validUntil,
      locationName: newPerkData.applicableLocation,
      address: newPerkData.address || newPerkData.applicableLocation,
      hotline: newPerkData.hotline || "0983198383",
      mapUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(newPerkData.partner + " " + (newPerkData.address || "Ha Noi"))}`,
      stallUrl: "/association/products",
      voucherCode: newPerkData.voucherCode,
      discountType: newPerkData.discountType,
      applicableLocation: newPerkData.applicableLocation,
      productName: newPerkData.productName,
      isMemberPerk: true,
      creatorName: newPerkData.creatorName,
      qrPayload: newPerkData.qrPayload,
    };
    setMemberCustomPerks((prev) => [formatted, ...prev]);
  };

  const categories = useMemo(() => {
    return [
      "Tất cả",
      "Hội viên đăng",
      "Trúng thưởng",
      "Golf & Nghỉ dưỡng",
      "Dịch vụ Doanh nghiệp",
      "Ẩm thực & Tiếp khách",
    ];
  }, []);

  const combinedPerks = useMemo(() => {
    const systemList = [...(serverPerks || [])];
    const memberList = [...memberCustomPerks];

    if (selectedCategory === "Trúng thưởng") {
      return LUCKY_DRAW_PRIZES;
    }
    if (selectedCategory === "Hội viên đăng") {
      return memberList;
    }
    if (selectedCategory === "Tất cả") {
      return [...memberList, ...LUCKY_DRAW_PRIZES.slice(0, 2), ...systemList];
    }
    return [...memberList, ...systemList].filter((p) =>
      p.category?.toLowerCase().includes(selectedCategory.toLowerCase())
    );
  }, [serverPerks, memberCustomPerks, selectedCategory]);

  return (
    <div className="vba-animate pb-24">
      <MemberHeader title="Ưu đãi & Trúng thưởng" back />

      {/* ── BỐ CỤC MÀN ƯU ĐÃI CHUẨN THEME SÁNG & SANG TRỌNG ── */}
      <div className="px-4 pt-3">
        <div
          onClick={() => setGiftModalOpen(true)}
          className="self-stretch px-4 py-3.5 bg-gradient-to-r from-amber-50/90 via-white to-amber-50/50 dark:from-[#1c1810] dark:via-[#131a26] dark:to-[#17130c] rounded-2xl border border-amber-300/80 dark:border-amber-500/40 inline-flex flex-col justify-center items-start gap-3 w-full shadow-sm hover:shadow-md hover:border-amber-400 transition active:scale-[0.99] cursor-pointer group"
        >
          <div className="self-stretch inline-flex justify-between items-center w-full">
            <div className="flex justify-start items-center gap-3">
              <div className="size-16 shrink-0 relative flex items-center justify-center">
                <img
                  className="size-16 object-contain group-hover:scale-108 transition-transform duration-300 drop-shadow-md animate-subtle-bounce"
                  src="/f7e3331b1c09a1006d5662da8900f36748428901.png"
                  alt="Ưu đãi & trúng thưởng"
                />
              </div>
              <div className="flex-1 inline-flex flex-col justify-start items-start gap-1 min-w-0">
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/70 border border-amber-300/80 dark:border-amber-700/80 text-amber-900 dark:text-amber-300 text-[10.5px] font-extrabold tracking-wide">
                  👑 Đặc quyền VIP Hội Viên
                </div>
                <div className="text-slate-900 dark:text-white text-base font-bold leading-5 line-clamp-1">
                  Ưu đãi &amp; trúng thưởng
                </div>
                <div className="text-slate-600 dark:text-slate-300 text-xs font-medium leading-4 line-clamp-1">
                  Chạm để mở quà &amp; quay thưởng may mắn
                </div>
              </div>
            </div>
            <div className="text-amber-500 shrink-0 group-hover:translate-x-1 transition-transform">
              <ChevronRight className="size-5 stroke-[2.5]" />
            </div>
          </div>
        </div>
      </div>

      {/* ── NÚT ĐĂNG ƯU ĐÃI DOANH NGHIỆP DÀNH CHO HỘI VIÊN ── */}
      <div className="px-4 pt-3">
        <button
          type="button"
          onClick={() => setIsCreatePerkOpen(true)}
          className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-[#DC2626] via-[#B8860B] to-[#003B95] hover:opacity-95 text-white flex items-center justify-between shadow-md shadow-red-900/20 active:scale-[0.99] transition cursor-pointer group"
        >
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-white/20 text-white backdrop-blur-sm">
              <Plus className="size-4 stroke-[3]" />
            </span>
            <div className="text-left">
              <div className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                <span>Đăng Ưu Đãi Doanh Nghiệp Của Bạn</span>
                <span className="px-1.5 py-0.5 rounded-md bg-amber-400 text-slate-950 text-[9.5px] font-black">
                  B2B
                </span>
              </div>
              <div className="text-[11px] text-white/90">
                Voucher, % giảm giá, Mua 1 Tặng 1 dành riêng cho Hội viên
              </div>
            </div>
          </div>
          <Sparkles className="size-5 text-amber-300 group-hover:rotate-12 transition-transform" />
        </button>
      </div>

      {/* Category Filter Chips including Trúng thưởng */}
      <div className="mt-3.5 px-4 flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat;
          const isLucky = cat === "Trúng thưởng";
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition active:scale-95 cursor-pointer shadow-2xs ${
                isActive
                  ? isLucky
                    ? "bg-[#B8860B] text-white shadow-md shadow-amber-900/25 border border-amber-400"
                    : "bg-[#1F3864] text-white shadow-md shadow-blue-900/25 border border-[#1F3864]"
                  : isLucky
                    ? "bg-amber-100 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/80 text-amber-900 dark:text-amber-300 hover:bg-amber-200"
                    : "bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
              }`}
            >
              {isLucky && <Trophy className={`h-3.5 w-3.5 ${isActive ? "text-white" : "text-amber-600 dark:text-amber-400"}`} />}
              <span>{cat}</span>
              {isLucky && (
                <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping inline-block ml-0.5" />
              )}
            </button>
          );
        })}
      </div>

      {/* ── MÃ QR ĐỘNG QUÉT TẠI ĐIỂM MODAL (DYNAMIC QR POPUP) ── */}
      {qrPerkModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs animate-in fade-in-50 duration-200"
          onClick={() => setQrPerkModal(null)}
        >
          <div
            className="relative w-full max-w-sm rounded-3xl border-2 border-amber-400 bg-white dark:bg-[#0f172a] p-5 text-center text-slate-900 dark:text-white shadow-2xl flex flex-col gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setQrPerkModal(null)}
              className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full bg-slate-100 dark:bg-white/10 text-slate-500 hover:text-slate-800 dark:text-slate-300 dark:hover:text-white transition cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center justify-center gap-1.5 text-xs font-black uppercase text-amber-600 dark:text-amber-400 tracking-wider">
              <Sparkles className="size-4 text-amber-500" />
              <span>MÃ QR ĐẶC QUYỀN HỘI VIÊN CEO 1983</span>
            </div>

            <h3 className="text-base font-extrabold text-[#1F3864] dark:text-white line-clamp-1">
              {qrPerkModal.title}
            </h3>

            <div className="inline-block self-center px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-600 text-emerald-700 dark:text-emerald-300 text-xs font-black">
              {qrPerkModal.discount || "Ưu đãi độc quyền"} • {qrPerkModal.partner}
            </div>

            {/* Canvas QR Code with CEO 1983 center logo */}
            <div className="mx-auto my-1 p-3 bg-white rounded-2xl border-2 border-amber-400/80 shadow-md flex flex-col items-center">
              <QrCanvas
                value={qrPerkModal.qrPayload || `https://ceo1983.vn/perks/redeem?id=${qrPerkModal.id}&voucher=${qrPerkModal.voucherCode || ""}&token=${Date.now()}`}
                size={180}
                logoUrl="/ceo1983-emblem-8.png"
                logoScale={0.24}
              />
              <div className="mt-2.5 flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-50 border border-amber-300">
                <span className="text-[11px] font-mono font-black text-amber-900 tracking-wider">
                  MÃ VOUCHER: {qrPerkModal.voucherCode || `CEO1983-${qrPerkModal.id.toUpperCase()}-VIP`}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const code = qrPerkModal.voucherCode || `CEO1983-${qrPerkModal.id.toUpperCase()}-VIP`;
                    navigator.clipboard.writeText(code);
                    toast.success(`Đã sao chép mã voucher: ${code}`);
                  }}
                  className="text-[10px] text-blue-700 font-bold hover:underline cursor-pointer ml-1"
                >
                  Sao chép
                </button>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Xuất trình mã QR này tại quầy lễ tân hoặc thu ngân của đối tác để quét nhận chiết khấu!
            </p>

            {/* Location, Product & Contact Information */}
            <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-left text-xs space-y-1.5">
              {qrPerkModal.productName && (
                <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                  <Store className="size-3.5 shrink-0 text-amber-600" />
                  <span>Sản phẩm: <strong>{qrPerkModal.productName}</strong></span>
                </div>
              )}
              {qrPerkModal.applicableLocation && (
                <div className="flex items-start gap-1.5 text-slate-700 dark:text-slate-300">
                  <MapPin className="size-3.5 shrink-0 text-red-600 mt-0.5" />
                  <span>Nơi áp dụng: <strong>{qrPerkModal.applicableLocation}</strong></span>
                </div>
              )}
              <div className="flex items-start gap-1.5 text-slate-700 dark:text-slate-300">
                <MapPin className="size-3.5 shrink-0 text-emerald-600 mt-0.5" />
                <span className="line-clamp-2">{qrPerkModal.address || "Hà Nội & Toàn quốc"}</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                <Phone className="size-3.5 shrink-0 text-blue-600" />
                <span className="font-mono font-bold">{qrPerkModal.hotline || "0983198383"}</span>
              </div>
            </div>

            {/* Action Buttons in Modal (STRICTLY NO RED) */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <a
                href={qrPerkModal.mapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(qrPerkModal.partner || "Ha Noi")}`}
                target="_blank"
                rel="noreferrer"
                className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 shadow-xs transition"
              >
                <Navigation className="size-3.5" />
                <span>Chỉ đường</span>
              </a>

              <a
                href={`tel:${qrPerkModal.hotline || "0901000001"}`}
                className="py-2.5 px-3 rounded-xl bg-[#B8860B] hover:bg-[#9a7009] text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 shadow-xs transition"
              >
                <Phone className="size-3.5" />
                <span>Gọi hotline</span>
              </a>
            </div>

            <button
              type="button"
              onClick={() => setQrPerkModal(null)}
              className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition cursor-pointer"
            >
              Đóng lại
            </button>
          </div>
        </div>
      )}

      {/* Gift Box Reveal Modal */}
      {giftModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs animate-in fade-in-50 duration-200"
          onClick={() => setGiftModalOpen(false)}
        >
          <div
            className="relative w-full max-w-sm rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0f172a] p-6 text-center text-slate-900 dark:text-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setGiftModalOpen(false)}
              className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full bg-slate-100 dark:bg-white/10 text-slate-500 hover:text-slate-800 dark:text-slate-300 dark:hover:text-white transition cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="relative mx-auto my-3 grid h-24 w-24 place-items-center">
              <span className="absolute inset-0 rounded-full bg-amber-400/20 animate-ping duration-1000" />
              <img
                src="/f7e3331b1c09a1006d5662da8900f36748428901.png"
                alt="Quà tặng đặc quyền"
                className="relative z-10 h-20 w-20 object-contain drop-shadow-xl animate-subtle-bounce"
              />
            </div>

            <h3 className="text-xl font-black text-[#1F3864] dark:text-amber-400">Chúc Mừng Bạn!</h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Đã mở thành công Gói Quà Tặng Đặc Quyền Hội Viên CEO 1983
            </p>

            <div className="mt-4 space-y-2 text-left text-xs">
              <div className="rounded-xl border border-amber-500/20 bg-amber-50/80 dark:bg-amber-950/40 p-3 flex items-center gap-3">
                <Award className="h-5 w-5 shrink-0 text-[#1F3864] dark:text-amber-400" />
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">Voucher Giảm 25% Dịch Vụ Golf &amp; Khách Sạn</div>
                  <div className="text-[10.5px] text-slate-500 dark:text-slate-400">Áp dụng toàn bộ hệ thống đối tác liên kết</div>
                </div>
              </div>
              <div className="rounded-xl border border-amber-500/20 bg-amber-50/80 dark:bg-amber-950/40 p-3 flex items-center gap-3">
                <Crown className="h-5 w-5 shrink-0 text-[#1F3864] dark:text-amber-400" />
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">Vé VIP Tham Gia Diễn Đàn Doanh Nhân 2026</div>
                  <div className="text-[10.5px] text-slate-500 dark:text-slate-400">Quyền lợi ưu tiên đặt bàn Gala &amp; Giao lưu B2B</div>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setGiftModalOpen(false);
                toast.success("Đã lưu quà tặng vào ví ưu đãi!");
              }}
              className="mt-5 w-full rounded-xl bg-[#1F3864] hover:bg-[#152747] border border-amber-400/50 py-3 text-xs font-bold text-amber-300 shadow-md active:scale-98 transition cursor-pointer"
            >
              Lưu Vào Ví Ưu Đãi Của Tôi
            </button>
          </div>
        </div>
      )}

      {/* Prize Detail Modal for Trúng Thưởng */}
      {activePrize && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs animate-in fade-in-50 duration-200"
          onClick={() => setActivePrize(null)}
        >
          <div
            className="relative w-full max-w-sm rounded-3xl border border-amber-500/40 bg-white dark:bg-[#0f172a] p-6 text-center text-slate-900 dark:text-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActivePrize(null)}
              className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full bg-slate-100 dark:bg-white/10 text-slate-500 hover:text-slate-800 dark:text-slate-300 dark:hover:text-white transition cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="mx-auto my-2 grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-500 text-slate-950 shadow-lg shadow-amber-500/30">
              <Trophy className="h-8 w-8" />
            </div>

            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 dark:bg-amber-950/80 px-2.5 py-0.5 text-[11px] font-extrabold text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
              <PartyPopper className="h-3 w-3 text-amber-600" /> GIẢI THƯỞNG HỘI VIÊN
            </span>

            <h3 className="mt-2 text-base font-black text-slate-900 dark:text-white leading-snug">
              {activePrize.title}
            </h3>

            <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {activePrize.summary}
            </p>

            <div className="mt-4 rounded-2xl border border-dashed border-amber-500/60 bg-amber-50/80 dark:bg-amber-950/30 p-3 text-left">
              <div className="text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400">
                Mã Trúng Thưởng Xác Thực
              </div>
              <div className="mt-1 font-mono text-sm font-black tracking-wider text-[#1F3864] dark:text-amber-300">
                {activePrize.code}
              </div>
              <div className="mt-1 text-[10.5px] text-slate-500 dark:text-slate-400">
                Đơn vị tài trợ: {activePrize.partner}
              </div>
            </div>

            {/* Quick Map and Call for prize */}
            <div className="grid grid-cols-2 gap-2 mt-3">
              <a
                href={activePrize.mapUrl}
                target="_blank"
                rel="noreferrer"
                className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 transition"
              >
                <Navigation className="size-3.5" />
                <span>Chỉ đường</span>
              </a>
              <a
                href={`tel:${activePrize.hotline}`}
                className="py-2 px-3 rounded-xl bg-[#B8860B] hover:bg-[#9a7009] text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 transition"
              >
                <Phone className="size-3.5" />
                <span>Hotline</span>
              </a>
            </div>

            <button
              type="button"
              onClick={() => setActivePrize(null)}
              className="mt-3 w-full rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 transition cursor-pointer"
            >
              Xác Nhận &amp; Đóng
            </button>
          </div>
        </div>
      )}

      {/* Perks List */}
      <div className="mt-4 space-y-3 px-4">
        {loading && (
          <p className="py-10 text-center text-[13px] text-slate-400">
            {t("m.perks.loading")}
          </p>
        )}
        {!loading && combinedPerks.length === 0 && (
          <p className="py-10 text-center text-[13px] text-slate-400">
            {t("m.perks.empty")}
          </p>
        )}
        {combinedPerks.map((p) => {
          const isPrize = (p as any).category === "Trúng thưởng";

          if (isPrize) {
            return (
              <div
                key={p.id}
                className="rounded-2xl border border-amber-300/80 dark:border-amber-500/40 p-3.5 bg-gradient-to-r from-amber-50/80 via-white to-amber-50/50 dark:from-[#1c1810] dark:via-[#131a26] dark:to-[#17130c] shadow-sm flex flex-col gap-2.5"
              >
                <div
                  onClick={() => setActivePrize(p as any)}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-100/90 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700/80 p-1 shadow-2xs group-hover:scale-108 transition-transform duration-300">
                    <img
                      src="/f7e3331b1c09a1006d5662da8900f36748428901.png"
                      alt={p.title}
                      className="h-full w-full object-contain filter drop-shadow-sm"
                    />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="inline-block rounded-md bg-amber-200/90 dark:bg-amber-900/60 border border-amber-400 dark:border-amber-600 px-2 py-0.5 text-[10.5px] font-extrabold text-amber-950 dark:text-amber-200">
                        🏆 Trúng thưởng
                      </span>
                      {(p as any).discount && (
                        <span className="text-[12px] font-black text-amber-600 dark:text-amber-400">
                          {(p as any).discount}
                        </span>
                      )}
                    </div>
                    <h2 className="mt-1 truncate text-[14px] font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                      {p.title}
                    </h2>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-amber-500" />
                </div>

                {/* Location and Quick Actions Row */}
                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-amber-200/60 dark:border-amber-900/40">
                  <div className="flex items-center gap-1 truncate max-w-[200px]">
                    <MapPin className="size-3 text-emerald-600 shrink-0" />
                    <span className="truncate">{(p as any).address || (p as any).locationName || "Hà Nội"}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActivePrize(p as any)}
                    className="px-2.5 py-1 rounded-lg bg-[#B8860B] hover:bg-[#9a7009] text-white text-[11px] font-bold inline-flex items-center gap-1 shadow-xs transition"
                  >
                    <span>Xem mã nhận</span>
                  </button>
                </div>
              </div>
            );
          }

          const extPerk = p as ExtendedPerk;
          return (
            <div
              key={p.id}
              className="rounded-2xl border border-slate-200 dark:border-white/10 p-3.5 bg-white dark:bg-[#131a26] shadow-xs hover:border-amber-400/80 transition flex flex-col gap-2.5"
            >
              {/* Header Info */}
              <Link
                to="/association/perks/$id"
                params={{ id: p.id }}
                className="flex items-start gap-3 group"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-50/90 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-700/60 p-1 shadow-2xs group-hover:scale-108 transition-transform duration-300">
                  <img
                    src="/f7e3331b1c09a1006d5662da8900f36748428901.png"
                    alt={p.title}
                    className="h-full w-full object-contain filter drop-shadow-sm"
                  />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {extPerk.isMemberPerk && (
                      <span className="inline-block rounded-md bg-blue-100 dark:bg-blue-950/90 border border-blue-300 dark:border-blue-600/80 px-2 py-0.5 text-[10px] font-extrabold text-blue-900 dark:text-blue-300">
                        🏢 Hội viên đăng
                      </span>
                    )}
                    {p.category && (
                      <span className="inline-block rounded-md bg-amber-100 dark:bg-amber-950/90 border border-amber-300 dark:border-amber-600/80 px-2 py-0.5 text-[10.5px] font-extrabold text-amber-900 dark:text-amber-300">
                        {p.category}
                      </span>
                    )}
                    {p.discount && (
                      <span className="text-[12px] font-black text-emerald-600 dark:text-emerald-400">
                        {p.discount}
                      </span>
                    )}
                  </div>
                  <h3 className="mt-1 truncate text-[14px] font-bold text-slate-900 dark:text-white group-hover:text-[#1F3864] dark:group-hover:text-amber-400 transition-colors">
                    {p.title}
                  </h3>
                  <div className="text-[11px] text-slate-500 font-semibold truncate flex items-center gap-1.5">
                    <span>{p.partner}</span>
                    {extPerk.voucherCode && (
                      <span className="font-mono text-amber-600 dark:text-amber-400 font-bold">
                        • Mã: {extPerk.voucherCode}
                      </span>
                    )}
                  </div>
                  {extPerk.productName && (
                    <div className="text-[11px] text-blue-700 dark:text-blue-300 font-medium truncate">
                      Sản phẩm: {extPerk.productName}
                    </div>
                  )}
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-slate-400 group-hover:translate-x-0.5 transition-transform mt-1" />
              </Link>

              {/* Location & Applicable Scope Display */}
              <div className="space-y-0.5 text-[11px] px-1">
                {extPerk.applicableLocation && (
                  <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-medium">
                    <Store className="size-3.5 text-amber-600 shrink-0" />
                    <span className="truncate">Áp dụng: {extPerk.applicableLocation}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                  <MapPin className="size-3.5 text-emerald-600 shrink-0" />
                  <span className="truncate">{extPerk.address || extPerk.locationName || "Hệ thống đối tác toàn quốc"}</span>
                </div>
              </div>

              {/* Quick Utility Action Buttons Row (STRICTLY NO RED BUTTONS) */}
              <div className="flex items-center gap-1.5 pt-1 border-t border-slate-100 dark:border-slate-800">
                {/* 1. Dynamic QR Code Button */}
                <button
                  type="button"
                  onClick={() => setQrPerkModal(extPerk)}
                  className="flex-1 py-1.5 px-2 rounded-xl bg-[#1F3864] hover:bg-[#152747] text-white text-[11px] font-bold inline-flex items-center justify-center gap-1 shadow-xs transition cursor-pointer"
                >
                  <QrCode className="size-3.5 text-amber-300" />
                  <span>Mã QR Nhận Ưu Đãi</span>
                </button>

                {/* 2. Google Maps Direct Navigation Link */}
                <a
                  href={extPerk.mapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(extPerk.partner + " " + (extPerk.address || "Ha Noi"))}`}
                  target="_blank"
                  rel="noreferrer"
                  className="py-1.5 px-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold inline-flex items-center justify-center gap-1 shadow-xs transition"
                  title="Dẫn đường Google Maps"
                >
                  <Navigation className="size-3.5" />
                  <span className="hidden sm:inline">Chỉ đường</span>
                </a>

                {/* 3. Hotline Call Button */}
                <a
                  href={`tel:${extPerk.hotline || "0901000001"}`}
                  className="py-1.5 px-2.5 rounded-xl bg-[#B8860B] hover:bg-[#9a7009] text-white text-[11px] font-bold inline-flex items-center justify-center gap-1 shadow-xs transition"
                  title="Gọi hotline"
                >
                  <Phone className="size-3.5" />
                  <span className="hidden sm:inline">Hotline</span>
                </a>

                {/* 4. Partner Stall / Store Link */}
                <Link
                  to="/association/products"
                  className="py-1.5 px-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-bold inline-flex items-center justify-center gap-1 transition"
                  title="Đến gian hàng đối tác"
                >
                  <Store className="size-3.5 text-slate-600 dark:text-slate-400" />
                  <span className="hidden sm:inline">Gian hàng</span>
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Đăng Ưu Đãi Doanh Nghiệp Của Hội Viên */}
      <MemberPerkCreateModal
        isOpen={isCreatePerkOpen}
        onClose={() => setIsCreatePerkOpen(false)}
        onSuccess={handlePerkCreated}
      />
    </div>
  );
}
