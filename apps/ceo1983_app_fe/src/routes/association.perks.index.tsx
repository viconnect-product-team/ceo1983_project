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
} from "lucide-react";
import { useState, useMemo, useEffect, useCallback } from "react";
import { MemberHeader } from "@/components/member/MemberShell";
import { fetchNestApi } from "@/lib/api-client";
import { type Perk } from "@/lib/member-app.functions";
import { useT } from "@/lib/i18n";

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

const DEFAULT_PERKS_SEED: Perk[] = [
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
  },
];

function PerksScreen() {
  const t = useT();
  const [serverPerks, setServerPerks] = useState<Perk[]>(DEFAULT_PERKS_SEED);
  const [loading, setLoading] = useState(false);

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
  const [selectedCategory, setSelectedCategory] = useState<string>("Tất cả");
  const [activePrize, setActivePrize] = useState<(typeof LUCKY_DRAW_PRIZES)[0] | null>(null);

  const categories = useMemo(() => {
    return ["Tất cả", "Trúng thưởng", "Golf & Nghỉ dưỡng", "Dịch vụ Doanh nghiệp", "Ẩm thực & Tiếp khách"];
  }, []);

  const combinedPerks = useMemo(() => {
    const list = [...(serverPerks || [])];
    if (selectedCategory === "Trúng thưởng") {
      return LUCKY_DRAW_PRIZES;
    }
    if (selectedCategory === "Tất cả") {
      // Đưa mục trúng thưởng lên đầu để hội viên dễ theo dõi
      return [...LUCKY_DRAW_PRIZES.slice(0, 2), ...list];
    }
    return list.filter((p) => p.category?.toLowerCase().includes(selectedCategory.toLowerCase()));
  }, [serverPerks, selectedCategory]);

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
                    ? "bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md shadow-amber-500/25 border border-amber-400"
                    : "bg-[#003B95] text-white shadow-md shadow-blue-900/25 border border-[#003B95]"
                  : isLucky
                    ? "bg-amber-100 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/80 text-amber-900 dark:text-amber-300 hover:bg-amber-200"
                    : "bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
              }`}
            >
              {isLucky && <Trophy className={`h-3.5 w-3.5 ${isActive ? "text-slate-950" : "text-amber-600 dark:text-amber-400"}`} />}
              <span>{cat}</span>
              {isLucky && (
                <span className="h-2 w-2 rounded-full bg-red-500 animate-ping inline-block ml-0.5" />
              )}
            </button>
          );
        })}
      </div>

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

            {/* Glowing Big 3D Gift Box from Image 1 */}
            <div className="relative mx-auto my-3 grid h-24 w-24 place-items-center">
              <span className="absolute inset-0 rounded-full bg-amber-400/20 animate-ping duration-1000" />
              <img
                src="/f7e3331b1c09a1006d5662da8900f36748428901.png"
                alt="Quà tặng đặc quyền"
                className="relative z-10 h-20 w-20 object-contain drop-shadow-xl animate-subtle-bounce"
              />
            </div>

            <h3 className="text-xl font-black text-[#003B95] dark:text-amber-400">Chúc Mừng Bạn!</h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Đã mở thành công Gói Quà Tặng Đặc Quyền Hội Viên CEO 1983
            </p>

            <div className="mt-4 space-y-2 text-left text-xs">
              <div className="rounded-xl border border-amber-500/20 bg-amber-50/80 dark:bg-amber-950/40 p-3 flex items-center gap-3">
                <Award className="h-5 w-5 shrink-0 text-[#003B95] dark:text-amber-400" />
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">Voucher Giảm 20% Dịch Vụ Golf & Khách Sạn</div>
                  <div className="text-[10.5px] text-slate-500 dark:text-slate-400">Áp dụng toàn bộ hệ thống đối tác liên kết</div>
                </div>
              </div>
              <div className="rounded-xl border border-amber-500/20 bg-amber-50/80 dark:bg-amber-950/40 p-3 flex items-center gap-3">
                <Crown className="h-5 w-5 shrink-0 text-[#003B95] dark:text-amber-400" />
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">Vé VIP Tham Gia Diễn Đàn Doanh Nhân 2026</div>
                  <div className="text-[10.5px] text-slate-500 dark:text-slate-400">Quyền lợi ưu tiên đặt bàn Gala & Giao lưu B2B</div>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setGiftModalOpen(false)}
              className="mt-5 w-full rounded-xl bg-gradient-to-r from-[#002B70] to-[#003B95] border border-amber-400/50 hover:border-amber-400 py-3 text-xs font-bold text-amber-300 shadow-[0_4px_16px_rgba(245,158,11,0.25)] active:scale-98 transition cursor-pointer"
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
              <div className="mt-1 font-mono text-sm font-black tracking-wider text-[#003B95] dark:text-amber-300">
                {activePrize.code}
              </div>
              <div className="mt-1 text-[10.5px] text-slate-500 dark:text-slate-400">
                Đơn vị tài trợ: {activePrize.partner}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActivePrize(null)}
              className="mt-5 w-full rounded-xl bg-gradient-to-r from-[#002B70] to-[#003B95] border border-amber-400/50 hover:border-amber-400 py-3 text-xs font-bold text-amber-300 shadow-[0_4px_16px_rgba(245,158,11,0.25)] active:scale-98 transition cursor-pointer"
            >
              Xác Nhận & Đóng
            </button>
          </div>
        </div>
      )}

      {/* Perks List */}
      <div className="mt-4 space-y-2.5 px-4">
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
                onClick={() => setActivePrize(p as any)}
                className="flex items-center gap-3 rounded-2xl border border-amber-300/80 dark:border-amber-500/40 p-3.5 bg-gradient-to-r from-amber-50/80 via-white to-amber-50/50 dark:from-[#1c1810] dark:via-[#131a26] dark:to-[#17130c] shadow-sm hover:border-amber-500 hover:shadow-md transition active:scale-[0.99] cursor-pointer group"
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
                  {p.summary && (
                    <p className="mt-0.5 line-clamp-1 text-[11.5px] text-slate-600 dark:text-slate-400">
                      {p.summary}
                    </p>
                  )}
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-amber-500 group-hover:translate-x-0.5 transition-transform" />
              </div>
            );
          }

          return (
            <Link
              key={p.id}
              to="/association/perks/$id"
              params={{ id: p.id }}
              className="flex items-center gap-3 rounded-2xl border border-slate-200 dark:border-white/10 p-3.5 bg-white dark:bg-[#131a26] shadow-xs hover:border-amber-400/80 hover:shadow-md transition active:scale-[0.99] group"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-50/90 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-700/60 p-1 shadow-2xs group-hover:scale-108 transition-transform duration-300">
                <img
                  src="/f7e3331b1c09a1006d5662da8900f36748428901.png"
                  alt={p.title}
                  className="h-full w-full object-contain filter drop-shadow-sm"
                />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  {p.category && (
                    <span className="inline-block rounded-md bg-amber-100 dark:bg-amber-950/90 border border-amber-300 dark:border-amber-600/80 px-2.5 py-0.5 text-[11px] font-extrabold text-amber-900 dark:text-amber-300 shadow-2xs">
                      {p.category}
                    </span>
                  )}
                  {p.discount && (
                    <span className="text-[12px] font-black text-amber-600 dark:text-amber-400">
                      {p.discount}
                    </span>
                  )}
                </div>
                <h2 className="mt-1 truncate text-[14px] font-bold text-slate-900 dark:text-white group-hover:text-[#003B95] dark:group-hover:text-amber-400 transition-colors">
                  {p.title}
                </h2>
                {p.summary && (
                  <p className="mt-0.5 line-clamp-1 text-[11.5px] text-slate-600 dark:text-slate-400">
                    {p.summary}
                  </p>
                )}
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
