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
  Heart,
  Building2,
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

const DEFAULT_PERKS_SEED: ExtendedPerk[] = [];
const LUCKY_DRAW_PRIZES: any[] = [];
export const BIRTHDAY_PERKS: ExtendedPerk[] = [];
export const TOP_RANK_PERKS: ExtendedPerk[] = [];

export function PerksScreen() {
  const t = useT();
  const [serverPerks, setServerPerks] = useState<ExtendedPerk[]>([]);
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

  // Case 5: 2 Danh mục chính (Tất cả & Của tôi)
  const [activeMainTab, setActiveMainTab] = useState<"all" | "my_perks">("all");
  const [savedPerks, setSavedPerks] = useState<ExtendedPerk[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem("vba_my_saved_perks");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const handleSyncSavedPerks = () => {
      try {
        const stored = localStorage.getItem("vba_my_saved_perks");
        if (stored) setSavedPerks(JSON.parse(stored));
      } catch {}
    };
    window.addEventListener("vba:saved_perks_updated", handleSyncSavedPerks);
    return () => window.removeEventListener("vba:saved_perks_updated", handleSyncSavedPerks);
  }, []);

  const savedPerkIds = useMemo(() => savedPerks.map((p) => p.id), [savedPerks]);

  const handleToggleSavePerk = (p: ExtendedPerk) => {
    const isSaved = savedPerkIds.includes(p.id);
    let next: ExtendedPerk[];
    if (isSaved) {
      next = savedPerks.filter((x) => x.id !== p.id);
      toast.info(`Đã bỏ lưu ưu đãi "${p.title}" khỏi mục Của tôi.`);
    } else {
      next = [p, ...savedPerks.filter((x) => x.id !== p.id)];
      toast.success(`Đã lưu ưu đãi "${p.title}"! Đang mở voucher và mã QR...`);
      setQrPerkModal(p);
    }
    setSavedPerks(next);
    try {
      localStorage.setItem("vba_my_saved_perks", JSON.stringify(next));
      window.dispatchEvent(new CustomEvent("vba:saved_perks_updated"));
    } catch {}
  };

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
      <MemberHeader title="Ưu đãi & Đặc quyền" back />

      {/* ── 2 DANH MỤC CHUẨN CASE 5: TẤT CẢ | CỦA TÔI ── */}
      <div className="px-4 pt-3">
        <div className="p-1 bg-slate-200/80 dark:bg-slate-800/80 rounded-2xl flex items-center gap-1 shadow-inner">
          <button
            type="button"
            onClick={() => setActiveMainTab("all")}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeMainTab === "all"
                ? "bg-[#003B95] text-white shadow-md shadow-blue-900/20"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Sparkles className="size-3.5" />
            <span>Tất cả</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMainTab("my_perks")}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeMainTab === "my_perks"
                ? "bg-[#B8860B] text-white shadow-md shadow-amber-900/20"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Gift className="size-3.5" />
            <span>Của tôi ({savedPerks.length})</span>
          </button>
        </div>
      </div>

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
          className="w-full py-3 px-4 rounded-2xl bg-[#003B95] hover:bg-[#002B70] text-white flex items-center justify-between shadow-sm active:scale-[0.99] transition cursor-pointer group"
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

      {/* ── BỐ CỤC CHUẨN CASE 5: TẤT CẢ (3 SECTIONS) & CỦA TÔI ── */}
      {(() => {
        const renderPerkCard = (p: ExtendedPerk) => {
          const isSaved = savedPerkIds.includes(p.id);
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
                    {p.isMemberPerk && (
                      <span className="inline-block rounded-md bg-blue-100 dark:bg-blue-950/90 border border-blue-300 dark:border-blue-600/80 px-2 py-0.5 text-[10px] font-extrabold text-blue-900 dark:text-blue-300">
                        🏢 Hội viên tài trợ
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
                    {p.voucherCode && (
                      <span className="font-mono text-amber-600 dark:text-amber-400 font-bold">
                        • Mã: {p.voucherCode}
                      </span>
                    )}
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-slate-400 group-hover:translate-x-0.5 transition-transform mt-1" />
              </Link>

              {p.summary && (
                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 px-1">
                  {p.summary}
                </p>
              )}

              {/* Action Buttons: Nút Lưu / Bỏ lưu & Mã QR */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => handleToggleSavePerk(p)}
                  className={`py-1.5 px-3.5 rounded-xl text-xs font-bold inline-flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs ${
                    isSaved
                      ? "bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-100"
                      : "bg-[#003B95] hover:bg-[#002B70] text-white"
                  }`}
                >
                  <Heart
                    className={`size-3.5 ${isSaved ? "fill-rose-500 text-rose-500" : ""}`}
                  />
                  <span>{isSaved ? "Bỏ lưu" : "Lưu"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setQrPerkModal(p)}
                  className="flex-1 py-1.5 px-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold inline-flex items-center justify-center gap-1 transition cursor-pointer"
                >
                  <QrCode className="size-3.5 text-[#003B95] dark:text-amber-300" />
                  <span>Mã QR ưu đãi</span>
                </button>

                <Link
                  to="/association/products"
                  className="py-1.5 px-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold inline-flex items-center justify-center gap-1 transition"
                  title="Đến sàn thương mại"
                >
                  <Store className="size-3.5 text-slate-600 dark:text-slate-400" />
                  <span className="hidden sm:inline">Gian hàng</span>
                </Link>
              </div>
            </div>
          );
        };

        if (activeMainTab === "my_perks") {
          return (
            <div className="space-y-3 px-4 pt-4">
              <div className="flex items-center justify-between pb-1">
                <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Gift className="size-4 text-[#B8860B]" />
                  <span>Danh Mục Ưu Đãi Của Tôi ({savedPerks.length})</span>
                </span>
                <span className="text-[11px] text-slate-400">Đã lưu trữ cá nhân</span>
              </div>

              {savedPerks.length === 0 ? (
                <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 text-xs text-slate-400 space-y-2">
                  <Gift className="size-8 mx-auto text-slate-300 dark:text-slate-600" />
                  <p className="font-bold text-slate-700 dark:text-slate-200 text-sm">
                    Bạn chưa lưu ưu đãi nào vào mục Của tôi
                  </p>
                  <p className="text-[11.5px] text-slate-400 max-w-xs mx-auto">
                    Hãy bấm nút "Lưu" tại các mục ưu đãi hoặc nhận quà thành tích từ màn Thống kê để lưu trữ tại đây.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveMainTab("all")}
                    className="mt-2 px-4 py-2 rounded-xl bg-[#003B95] text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 transition"
                  >
                    <Sparkles className="size-3.5 text-amber-300" />
                    <span>Khám phá ưu đãi CLB ngay</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {savedPerks.map((p) => renderPerkCard(p))}
                </div>
              )}
            </div>
          );
        }

        return (
          <div className="space-y-6 px-4 pt-4">
            {/* ── SECTION 1: ƯU ĐÃI HỘI VIÊN KHÁC TÀI TRỢ LÊN CLB CEO 1983 ── */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="size-7 rounded-lg bg-blue-100 dark:bg-blue-950 text-[#003B95] dark:text-blue-400 flex items-center justify-center font-bold">
                    <Building2 className="size-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wide">
                      Ưu Đãi Hội Viên Khác Tài Trợ Lên CLB CEO 1983
                    </h3>
                    <p className="text-[10.5px] text-slate-500 dark:text-slate-400">
                      Gói quà tặng, chiết khấu nội khối do doanh nhân thành viên tài trợ
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/40 text-[#003B95] dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  Section 1
                </span>
              </div>

              <div className="space-y-3">
                {[...memberCustomPerks, ...serverPerks].length > 0 ? (
                  [...memberCustomPerks, ...serverPerks].map((p) =>
                    renderPerkCard({ ...p, isMemberPerk: true }),
                  )
                ) : (
                  <div className="text-center py-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50">
                    <p className="text-xs text-slate-500">Chưa có ưu đãi nào được đăng tải</p>
                  </div>
                )}
              </div>
            </div>

            {/* ── SECTION 2: ƯU ĐÃI SINH NHẬT ── */}
            {BIRTHDAY_PERKS.length > 0 && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="size-7 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                      <Gift className="size-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wide">
                        Ưu Đãi Sinh Nhật
                      </h3>
                      <p className="text-[10.5px] text-slate-500 dark:text-slate-400">
                        Món quà đặc biệt từ Ban Chấp Hành mừng sinh nhật hội viên trong tháng
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                    Section 2
                  </span>
                </div>

                <div className="space-y-3">
                  {BIRTHDAY_PERKS.map((p) => renderPerkCard(p))}
                </div>
              </div>
            )}

            {/* ── SECTION 3: ƯU ĐÃI CHO NGƯỜI CÓ RANK CAO NHẤT Ở THỐNG KÊ ── */}
            {TOP_RANK_PERKS.length > 0 && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="size-7 rounded-lg bg-yellow-100 dark:bg-yellow-950 text-yellow-600 dark:text-yellow-400 flex items-center justify-center font-bold">
                      <Trophy className="size-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wide">
                        Ưu Đãi Cho Người Có Rank Cao Nhất Ở Thống Kê
                      </h3>
                      <p className="text-[10.5px] text-slate-500 dark:text-slate-400">
                        Đặc quyền vinh danh Quán quân Bảng Xếp Hạng Doanh Nhân Tiêu Biểu CEO 1983
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-yellow-50 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800">
                    Section 3
                  </span>
                </div>

                <div className="space-y-3">
                  {TOP_RANK_PERKS.map((p) => renderPerkCard(p))}
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* Modal Đăng Ưu Đãi Doanh Nghiệp Của Hội Viên */}
      <MemberPerkCreateModal
        isOpen={isCreatePerkOpen}
        onClose={() => setIsCreatePerkOpen(false)}
        onSuccess={handlePerkCreated}
      />
    </div>
  );
}
