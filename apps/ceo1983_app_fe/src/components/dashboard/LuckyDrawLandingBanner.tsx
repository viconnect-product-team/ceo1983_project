import React, { useState, useEffect, useMemo } from "react";
import {
  Calendar,
  MapPin,
  Clock,
  Ticket,
  SlidersHorizontal,
  Save,
  Plus,
  Trash2,
  CheckCircle2,
  X,
  Bell,
  Building2,
  Search,
  ExternalLink,
  Package,
  ShoppingBag,
  Coins,
  Tag,
  Dices,
  PartyPopper,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { fetchNestApi } from "@/lib/api-client";
import {
  ClickUpIcon,
  ClickUpBadgeIcon,
  ClickUpMark,
  CLICKUP_POPULAR_ICONS,
  type ClickUpIconName,
} from "@/components/icons/ClickUpIcons";

export type PrizeTargetType = "PRODUCT" | "SPONSOR_PACKAGE" | "CUSTOM" | "VOUCHER" | "CASH";

export interface LuckyPrize {
  id: string;
  rankName: string; // Giải Đặc Biệt, Giải Nhất, Giải Nhì...
  title: string;
  value: string;
  amount?: number;
  sponsor?: string;
  description: string;
  iconName?: string;
  highlightColor?: string;
  quantity?: number;
  targetType?: PrizeTargetType;
  targetId?: string | null;
  imageUrl?: string | null;
}

export interface LuckyDrawCandidate {
  name: string;
  company: string;
  code: string;
  seat?: string;
  phone?: string;
}

export interface LuckyDrawEventConfig {
  id: string;
  name: string;
  subtitle: string;
  date: string;
  time: string;
  location: string;
  bannerTheme: "gala_luxury" | "business_summit" | "night_party" | "gold_anniversary";
  coverUrl?: string;
  totalPrizeValue: string;
  prizes: LuckyPrize[];
  candidates: LuckyDrawCandidate[];
}

export interface DbProductItem {
  id: string;
  name?: string;
  title?: string;
  company?: string;
  price?: number;
  image_url?: string;
  imageUrl?: string;
  description?: string;
  status?: string;
}

export interface DbSponsorPackageItem {
  id: string;
  tier: string;
  price: number;
  packageType: string;
  inKindDescription?: string;
}

export function LuckyDrawLandingBanner({
  onStartSpinExternal,
  className = "",
}: {
  onStartSpinExternal?: (selectedEvent: LuckyDrawEventConfig) => void;
  className?: string;
}) {
  const [events, setEvents] = useState<LuckyDrawEventConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEventId, setSelectedEventId] = useState<string>("");

  // Modals
  const [setupModalOpen, setSetupModalOpen] = useState(false);
  const [spinModalOpen, setSpinModalOpen] = useState(false);

  // Sync strictly from backend REST API database
  const loadDatabaseConfig = async () => {
    try {
      setLoading(true);
      const res: any = await fetchNestApi("/admin/lucky-draw-config");
      const incoming = res?.events || (Array.isArray(res) ? res : []);
      if (Array.isArray(incoming) && incoming.length > 0) {
        setEvents(incoming);
        setSelectedEventId((prev) => (prev && incoming.some((e: any) => e.id === prev) ? prev : incoming[0].id));
      }
    } catch (err) {
      console.error("[LuckyDrawLandingBanner] Failed to fetch database config:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDatabaseConfig();
  }, []);

  const currentEvent = useMemo(() => {
    return events.find((e) => e.id === selectedEventId) || events[0] || null;
  }, [events, selectedEventId]);

  // Handle save custom setup to DB via REST API
  const handleSaveSetup = async (updatedEvent: LuckyDrawEventConfig) => {
    try {
      const updatedEvents = events.map((ev) => (ev.id === updatedEvent.id ? updatedEvent : ev));
      setEvents(updatedEvents);
      await fetchNestApi("/admin/lucky-draw-config", {
        method: "PUT",
        body: JSON.stringify({ events: updatedEvents }),
      });
      toast.success("Đã đồng bộ cơ cấu giải thưởng vào Database!", {
        description: `Giải thưởng của sự kiện "${updatedEvent.name}" đã được cập nhật từ database.`,
      });
      setSetupModalOpen(false);
      loadDatabaseConfig();
    } catch {
      toast.error("Lỗi khi lưu cấu hình giải thưởng vào database");
    }
  };

  if (loading && events.length === 0) {
    return (
      <div className={`relative overflow-hidden rounded-3xl border border-amber-500/20 bg-[#0B132B] p-10 text-center ${className}`}>
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-amber-400 border-t-transparent" />
          <p className="text-sm font-semibold text-amber-200">Đang tải dữ liệu sự kiện & giải thưởng từ Database...</p>
        </div>
      </div>
    );
  }

  if (!currentEvent) {
    return (
      <div className={`relative overflow-hidden rounded-3xl border border-amber-500/20 bg-[#0B132B] p-10 text-center ${className}`}>
        <div className="max-w-md mx-auto space-y-4">
          <ClickUpBadgeIcon name="Trophy" variant="yellow" size={28} />
          <h3 className="text-lg font-bold text-white">Chưa có sự kiện bốc thăm nào</h3>
          <p className="text-xs text-slate-400">Vui lòng khởi tạo sự kiện hoặc gói tài trợ trong hệ thống.</p>
          <button
            onClick={() => setSetupModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400"
          >
            <Plus className="w-4 h-4" />
            <span>Thiết Lập Sự Kiện Mới</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-3xl border border-amber-500/30 bg-[#0B132B] shadow-2xl ${className}`}>
      {/* Visual background image with gradient overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <img
          src={currentEvent.coverUrl || "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1600&q=80"}
          alt={currentEvent.name}
          className="h-full w-full object-cover opacity-25 filter blur-[1px] transition-all duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#070D1F] via-[#0B132B]/95 to-[#0F172A]/90" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
      </div>

      <div className="relative z-10 p-6 sm:p-8 lg:p-10 space-y-8">
        {/* Top Header Row: Event Selector & Setup Button */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-amber-500/20 pb-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow-md">
              <ClickUpMark size={16} />
              <span>Sự Kiện Bốc Thăm &amp; Trao Giải</span>
            </span>

            {/* Quick Event Selector Tabs */}
            <div className="flex flex-wrap items-center gap-2">
              {events.map((ev) => {
                const isSelected = ev.id === currentEvent.id;
                return (
                  <button
                    key={ev.id}
                    onClick={() => setSelectedEventId(ev.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? "bg-amber-500 text-slate-950 shadow-sm font-black"
                        : "bg-slate-900/80 border border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate max-w-[200px] sm:max-w-[260px]">{ev.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSetupModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-slate-800/90 hover:bg-slate-700 text-amber-300 border border-amber-500/40 transition shadow-sm cursor-pointer"
              title="Cấu hình cơ cấu giải thưởng kết nối danh mục sản phẩm từ Database"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Quản Lý Giải Thưởng Sự Kiện</span>
            </button>
          </div>
        </div>

        {/* Hero Event Banner Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-4">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-amber-400/90">
              <ClickUpIcon name="Flame" variant="orange" size={16} />
              <span>Tổng Giá Trị Giải Thưởng:</span>
              <span className="text-base font-black text-amber-300">{currentEvent.totalPrizeValue}</span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-800/50">
                Database Verified
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white leading-tight tracking-tight drop-shadow-sm">
              {currentEvent.name}
            </h1>

            <p className="text-sm sm:text-base text-slate-300 max-w-3xl leading-relaxed">
              {currentEvent.subtitle}
            </p>

            {/* Metadata Pills */}
            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-slate-300 font-medium">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700/80">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span>{currentEvent.date}</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700/80">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>{currentEvent.time}</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700/80">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span className="truncate max-w-[280px] sm:max-w-md">{currentEvent.location}</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700/80">
                <Ticket className="w-3.5 h-3.5 text-emerald-400" />
                <span>{currentEvent.candidates?.length || 0} Đại biểu tham dự</span>
              </div>
            </div>
          </div>

          {/* Call to action card */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center p-6 rounded-3xl border border-amber-500/40 bg-gradient-to-br from-amber-500/15 via-slate-900/80 to-slate-950/90 text-center space-y-4 backdrop-blur-md shadow-xl">
            <ClickUpBadgeIcon name="Dices" variant="gradient-gold" size={32} />

            <div>
              <h3 className="text-lg font-black text-white">Vòng Quay May Mắn Trực Tiếp</h3>
              <p className="text-xs text-slate-300 mt-1">
                Bốc thăm tự động dựa trên mã đại biểu tham dự và cơ cấu quà tặng thực tế
              </p>
            </div>

            <button
              onClick={() => {
                if (onStartSpinExternal) {
                  onStartSpinExternal(currentEvent);
                } else {
                  setSpinModalOpen(true);
                }
              }}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer flex items-center justify-center gap-2"
            >
              <ClickUpIcon name="Dices" variant="purple" size={18} />
              <span>Bắt Đầu Bốc Thăm Ngay</span>
            </button>
          </div>
        </div>

        {/* Showcase: Danh Mục Ưu Đãi & Phần Thưởng Đặc Sắc */}
        <div className="space-y-4 pt-4 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ClickUpIcon name="Trophy" variant="yellow" size={20} />
              <h2 className="text-lg font-bold text-white tracking-wide">
                Cơ Cấu Giải Thưởng &amp; Phần Thưởng Thực Tế Từ Doanh Nghiệp
              </h2>
            </div>
            <span className="text-xs text-slate-400">
              {currentEvent.prizes?.length || 0} hạng mục giải thưởng
            </span>
          </div>

          {(!currentEvent.prizes || currentEvent.prizes.length === 0) ? (
            <div className="rounded-2xl border border-dashed border-slate-800 p-8 text-center space-y-2">
              <ClickUpIcon name="Gift" variant="mono" size={28} className="mx-auto" />
              <p className="text-xs text-slate-400">Chưa có giải thưởng nào cho sự kiện này trong Database.</p>
              <button
                onClick={() => setSetupModalOpen(true)}
                className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:underline font-bold"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm giải thưởng từ danh sách sản phẩm ngay</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {currentEvent.prizes.map((prize, idx) => {
                return (
                  <div
                    key={prize.id || idx}
                    className="rounded-2xl border border-slate-800/80 bg-slate-900/70 hover:bg-slate-900/90 p-5 space-y-3 transition duration-200 hover:border-amber-500/40 hover:-translate-y-1 shadow-md group relative overflow-hidden"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <ClickUpBadgeIcon name={prize.iconName || "Gift"} variant="purple" size={14} containerClassName="p-1.5 rounded-lg" />
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {prize.rankName}
                        </span>
                      </div>

                      <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-2 py-0.5 rounded-md">
                        {prize.value}
                      </span>
                    </div>

                    <div className="flex gap-3 items-start">
                      {prize.imageUrl && (
                        <img
                          src={prize.imageUrl}
                          alt={prize.title}
                          className="w-14 h-14 rounded-xl object-cover border border-slate-700 shrink-0 bg-slate-950"
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-2">
                          {prize.title}
                        </h3>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                          {prize.description}
                        </p>
                      </div>
                    </div>

                    {/* Target Type & Sponsor Info */}
                    <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                      <div className="flex items-center gap-1.5 truncate">
                        {prize.targetType === "PRODUCT" && (
                          <span className="inline-flex items-center gap-1 rounded bg-teal-950/60 border border-teal-800/50 px-1.5 py-0.5 text-[10px] font-bold text-teal-300">
                            <ShoppingBag className="w-2.5 h-2.5" /> Sản phẩm B2B
                          </span>
                        )}
                        {prize.targetType === "SPONSOR_PACKAGE" && (
                          <span className="inline-flex items-center gap-1 rounded bg-purple-950/60 border border-purple-800/50 px-1.5 py-0.5 text-[10px] font-bold text-purple-300">
                            <Package className="w-2.5 h-2.5" /> Gói tài trợ
                          </span>
                        )}
                        {prize.targetType === "CASH" && (
                          <span className="inline-flex items-center gap-1 rounded bg-amber-950/60 border border-amber-800/50 px-1.5 py-0.5 text-[10px] font-bold text-amber-300">
                            <Coins className="w-2.5 h-2.5" /> Hiện kim
                          </span>
                        )}
                        {prize.targetType === "VOUCHER" && (
                          <span className="inline-flex items-center gap-1 rounded bg-blue-950/60 border border-blue-800/50 px-1.5 py-0.5 text-[10px] font-bold text-blue-300">
                            <Tag className="w-2.5 h-2.5" /> Voucher
                          </span>
                        )}
                        {prize.sponsor && (
                          <span className="truncate">Tài trợ: {prize.sponsor}</span>
                        )}
                      </div>
                      {prize.quantity && (
                        <span className="text-slate-400 shrink-0 font-semibold">
                          SL: {prize.quantity}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* USER SETUP MODAL (DYNAMIC PRODUCTS + TARGET TYPE) */}
      {setupModalOpen && (
        <LuckyDrawSetupModal
          initialEvent={currentEvent}
          onClose={() => setSetupModalOpen(false)}
          onSave={handleSaveSetup}
        />
      )}

      {/* INTERACTIVE SPIN WHEEL MODAL */}
      {spinModalOpen && (
        <InteractiveLuckyDrawModal
          event={currentEvent}
          onClose={() => setSpinModalOpen(false)}
        />
      )}
    </div>
  );
}

// ── USER SETUP MODAL (DYNAMIC PRODUCT CALL API + TARGET TYPE) ──
function LuckyDrawSetupModal({
  initialEvent,
  onClose,
  onSave,
}: {
  initialEvent: LuckyDrawEventConfig;
  onClose: () => void;
  onSave: (ev: LuckyDrawEventConfig) => void;
}) {
  const [formData, setFormData] = useState<LuckyDrawEventConfig>({
    ...initialEvent,
    prizes: initialEvent.prizes ? [...initialEvent.prizes] : [],
    candidates: initialEvent.candidates ? [...initialEvent.candidates] : [],
  });

  const [activeTab, setActiveTab] = useState<"info" | "prizes" | "candidates">("prizes");

  // Dynamic products & sponsor packages state loaded from database
  const [products, setProducts] = useState<DbProductItem[]>([]);
  const [sponsorPackages, setSponsorPackages] = useState<DbSponsorPackageItem[]>([]);
  const [loadingResources, setLoadingResources] = useState(false);

  // New prize input state
  const [newRankName, setNewRankName] = useState("Giải Đặc Biệt");
  const [newTitle, setNewTitle] = useState("");
  const [newValue, setNewValue] = useState("");
  const [newAmount, setNewAmount] = useState<number>(0);
  const [newSponsor, setNewSponsor] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newQuantity, setNewQuantity] = useState(1);
  const [newTargetType, setNewTargetType] = useState<PrizeTargetType>("PRODUCT");
  const [newTargetId, setNewTargetId] = useState<string>("");
  const [newImageUrl, setNewImageUrl] = useState<string>("");
  const [newIconName, setNewIconName] = useState<string>("Crown");
  const [savingPrize, setSavingPrize] = useState(false);

  // Fetch real products & packages from database
  useEffect(() => {
    let active = true;
    setLoadingResources(true);
    Promise.all([
      fetchNestApi<any[]>("/products").catch(() => []),
      fetchNestApi<any[]>("/sponsors/packages").catch(() => []),
    ])
      .then(([prods, pkgs]) => {
        if (!active) return;
        setProducts(Array.isArray(prods) ? prods : []);
        setSponsorPackages(Array.isArray(pkgs) ? pkgs : []);
      })
      .finally(() => {
        if (active) setLoadingResources(false);
      });

    return () => {
      active = false;
    };
  }, []);

  // When a product is selected, auto-bind database fields
  const handleSelectProduct = (prodId: string) => {
    setNewTargetId(prodId);
    const prod = products.find((p) => p.id === prodId);
    if (prod) {
      const prodName = prod.name || prod.title || "";
      setNewTitle(prodName);
      if (prod.price) {
        setNewAmount(Number(prod.price));
        setNewValue(`${Number(prod.price).toLocaleString("vi-VN")} VNĐ`);
      }
      if (prod.company) {
        setNewSponsor(prod.company);
      }
      if (prod.image_url || prod.imageUrl) {
        setNewImageUrl(prod.image_url || prod.imageUrl || "");
      }
      if (prod.description) {
        setNewDesc(prod.description);
      }
    }
  };

  // When a sponsor package is selected, auto-bind database fields
  const handleSelectPackage = (pkgId: string) => {
    setNewTargetId(pkgId);
    const pkg = sponsorPackages.find((p) => p.id === pkgId);
    if (pkg) {
      setNewTitle(`Gói Tài Trợ ${pkg.tier.toUpperCase()} Doanh Nghiệp`);
      if (pkg.price) {
        setNewAmount(Number(pkg.price));
        setNewValue(`${Number(pkg.price).toLocaleString("vi-VN")} VNĐ`);
      }
      if (pkg.inKindDescription) {
        setNewDesc(pkg.inKindDescription);
      }
    }
  };

  const handleAddPrize = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      toast.error("Vui lòng nhập tên phần thưởng hoặc chọn sản phẩm từ danh sách");
      return;
    }

    setSavingPrize(true);
    try {
      // Direct RESTful API call to persist into PostgreSQL public.event_prizes
      const createdPrize = await fetchNestApi<any>("/sponsors/prizes", {
        method: "POST",
        body: JSON.stringify({
          eventId: formData.id,
          rankName: newRankName.trim() || "Giải Thưởng",
          title: newTitle.trim(),
          value: newValue.trim() || (newAmount > 0 ? `${newAmount.toLocaleString("vi-VN")} VNĐ` : "Giá trị liên hệ"),
          amount: newAmount,
          quantity: newQuantity,
          targetType: newTargetType,
          targetId: newTargetId || null,
          sponsorName: newSponsor.trim() || "Nhà tài trợ CEO 1983",
          description: newDesc.trim() || "Ưu đãi đặc sắc trao tặng trực tiếp tại sự kiện",
          iconName: newIconName,
          imageUrl: newImageUrl || null,
        }),
      });

      const newPrizeItem: LuckyPrize = {
        id: createdPrize?.id || `prz-${Date.now()}`,
        rankName: createdPrize?.rankName || newRankName.trim(),
        title: createdPrize?.title || newTitle.trim(),
        value: createdPrize?.value || newValue.trim(),
        amount: createdPrize?.amount || newAmount,
        sponsor: createdPrize?.sponsorName || newSponsor.trim(),
        description: createdPrize?.description || newDesc.trim(),
        iconName: newIconName,
        quantity: newQuantity,
        targetType: newTargetType,
        targetId: newTargetId || null,
        imageUrl: newImageUrl || null,
      };

      setFormData((prev) => ({
        ...prev,
        prizes: [newPrizeItem, ...prev.prizes],
      }));

      // Reset form
      setNewTitle("");
      setNewValue("");
      setNewAmount(0);
      setNewSponsor("");
      setNewDesc("");
      setNewTargetId("");
      setNewImageUrl("");
      toast.success("Đã thêm giải thưởng vào Database thành công!");
    } catch (err: any) {
      toast.error("Không thể lưu giải thưởng: " + (err?.message || "Lỗi kết nối"));
    } finally {
      setSavingPrize(false);
    }
  };

  const handleRemovePrize = async (prizeId: string) => {
    try {
      await fetchNestApi(`/sponsors/prizes/${prizeId}`, { method: "DELETE" }).catch(() => {});
      setFormData((prev) => ({
        ...prev,
        prizes: prev.prizes.filter((p) => p.id !== prizeId),
      }));
      toast.success("Đã xóa giải thưởng khỏi Database!");
    } catch {
      toast.error("Lỗi khi xóa giải thưởng");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl border border-amber-500/40 bg-[#0F172A] text-white shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 p-5 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <ClickUpBadgeIcon name="SlidersHorizontal" variant="yellow" size={20} />
            <div>
              <h2 className="text-base font-bold text-white">Quản Lý &amp; Cấu Hình Giải Thưởng (Database Dynamic)</h2>
              <p className="text-xs text-slate-400">Kết nối trực tiếp kho sản phẩm B2B, gói tài trợ và đại biểu tham dự</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white cursor-pointer">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 px-5 gap-2 text-xs font-bold">
          <button
            onClick={() => setActiveTab("prizes")}
            className={`py-3 px-4 border-b-2 transition flex items-center gap-2 cursor-pointer ${
              activeTab === "prizes" ? "border-amber-500 text-amber-400" : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <ClickUpIcon name="Trophy" variant={activeTab === "prizes" ? "yellow" : "mono"} size={14} />
            <span>1. Cơ Cấu Giải Thưởng ({formData.prizes?.length || 0})</span>
          </button>
          <button
            onClick={() => setActiveTab("info")}
            className={`py-3 px-4 border-b-2 transition flex items-center gap-2 cursor-pointer ${
              activeTab === "info" ? "border-amber-500 text-amber-400" : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <ClickUpIcon name="Calendar" variant={activeTab === "info" ? "yellow" : "mono"} size={14} />
            <span>2. Thông Tin Sự Kiện &amp; Poster</span>
          </button>
          <button
            onClick={() => setActiveTab("candidates")}
            className={`py-3 px-4 border-b-2 transition flex items-center gap-2 cursor-pointer ${
              activeTab === "candidates" ? "border-amber-500 text-amber-400" : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <ClickUpIcon name="Ticket" variant={activeTab === "candidates" ? "yellow" : "mono"} size={14} />
            <span>3. Đại Biểu Bốc Thăm ({formData.candidates?.length || 0})</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === "prizes" && (
            <div className="space-y-6 text-xs">
              {/* Form thêm giải thưởng kết nối Database Sản phẩm */}
              <form onSubmit={handleAddPrize} className="p-5 rounded-2xl border border-amber-500/40 bg-slate-900/90 space-y-4 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-amber-400 flex items-center gap-2 text-sm">
                    <ClickUpIcon name="Plus" variant="yellow" size={16} />
                    <span>Thêm Hạng Mục Giải Thưởng Mới (Lưu Trực Tiếp Vào Database)</span>
                  </div>
                  {loadingResources && (
                    <span className="text-[11px] text-amber-300 animate-pulse">Đang tải danh sách sản phẩm...</span>
                  )}
                </div>

                {/* Target Type Selector */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Loại Giải Thưởng (Target Type):</label>
                    <select
                      value={newTargetType}
                      onChange={(e) => {
                        const val = e.target.value as PrizeTargetType;
                        setNewTargetType(val);
                        setNewTargetId("");
                      }}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white font-medium outline-none focus:border-amber-500 cursor-pointer"
                    >
                      <option value="PRODUCT">📦 Sản Phẩm B2B Hội Viên (Từ Database)</option>
                      <option value="SPONSOR_PACKAGE">🤝 Gói Tài Trợ Doanh Nghiệp (Từ Database)</option>
                      <option value="VOUCHER">🏷️ Voucher / Dịch Vụ Ưu Đãi</option>
                      <option value="CASH">💰 Hiện Kim / Tiền Mặt</option>
                      <option value="CUSTOM">🎁 Quà Tặng Hiện Vật Tùy Chỉnh</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Hạng Giải Thưởng:</label>
                    <input
                      type="text"
                      value={newRankName}
                      onChange={(e) => setNewRankName(e.target.value)}
                      placeholder="VD: Giải Đặc Biệt, Giải Nhất, Giải Nhì..."
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Biểu Tượng ClickUp (Icon):</label>
                    <select
                      value={newIconName}
                      onChange={(e) => setNewIconName(e.target.value)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-amber-500 cursor-pointer"
                    >
                      {CLICKUP_POPULAR_ICONS.map((ic) => (
                        <option key={ic.name} value={ic.name}>
                          {ic.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Dynamic Product/Package Dropdown Selector */}
                {newTargetType === "PRODUCT" && (
                  <div className="p-3.5 rounded-xl border border-teal-500/30 bg-teal-950/20 space-y-1.5">
                    <label className="block font-bold text-teal-300">
                      Chọn Sản Phẩm Từ Kho B2B Của Hiệp Hội (Database Call API):
                    </label>
                    <select
                      value={newTargetId}
                      onChange={(e) => handleSelectProduct(e.target.value)}
                      className="w-full rounded-xl border border-teal-500/40 bg-slate-950 px-3 py-2 text-white outline-none focus:border-teal-400 cursor-pointer font-medium"
                    >
                      <option value="">-- Chọn sản phẩm có sẵn trong Database để tự động điền thông tin --</option>
                      {products.map((prod) => (
                        <option key={prod.id} value={prod.id}>
                          {prod.name || prod.title} — {prod.company || "Hội viên"} ({prod.price ? `${Number(prod.price).toLocaleString("vi-VN")} VNĐ` : "Liên hệ"})
                        </option>
                      ))}
                    </select>
                    <p className="text-[11px] text-teal-400/80">
                      Khi chọn sản phẩm, hệ thống tự động điền Tên, Giá quy đổi, Tên công ty tài trợ và Hình ảnh sản phẩm.
                    </p>
                  </div>
                )}

                {newTargetType === "SPONSOR_PACKAGE" && (
                  <div className="p-3.5 rounded-xl border border-purple-500/30 bg-purple-950/20 space-y-1.5">
                    <label className="block font-bold text-purple-300">
                      Chọn Gói Tài Trợ Doanh Nghiệp (Database):
                    </label>
                    <select
                      value={newTargetId}
                      onChange={(e) => handleSelectPackage(e.target.value)}
                      className="w-full rounded-xl border border-purple-500/40 bg-slate-950 px-3 py-2 text-white outline-none focus:border-purple-400 cursor-pointer font-medium"
                    >
                      <option value="">-- Chọn gói tài trợ có sẵn --</option>
                      {sponsorPackages.map((pkg) => (
                        <option key={pkg.id} value={pkg.id}>
                          Gói {pkg.tier.toUpperCase()} — {Number(pkg.price).toLocaleString("vi-VN")} VNĐ ({pkg.packageType === "in_kind" ? "Hiện vật" : "Bằng tiền"})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Form fields for Prize Info */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-slate-300 mb-1">Tên Phần Thưởng / Quà Tặng:</label>
                    <input
                      type="text"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="VD: Gói giải pháp chuyển đổi số hoá / Xe điện VinFast VF3"
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-amber-500 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Trị Giá Quy Đổi (VNĐ):</label>
                    <input
                      type="text"
                      value={newValue}
                      onChange={(e) => setNewValue(e.target.value)}
                      placeholder="VD: 50.000.000 VNĐ"
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-amber-400 font-bold outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Đơn Vị Tài Trợ:</label>
                    <input
                      type="text"
                      value={newSponsor}
                      onChange={(e) => setNewSponsor(e.target.value)}
                      placeholder="VD: Công ty CP Công nghệ ABC"
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Số Lượng Giải:</label>
                    <input
                      type="number"
                      min={1}
                      value={newQuantity}
                      onChange={(e) => setNewQuantity(Number(e.target.value) || 1)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Hình Ảnh Quà Tặng (URL):</label>
                    <input
                      type="text"
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Mô Tả Chi Tiết Quyền Lợi &amp; Quà Tặng:</label>
                  <input
                    type="text"
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="Mô tả đặc quyền, thời hạn sử dụng hoặc điều kiện trao giải..."
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-amber-500"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={savingPrize}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-bold transition cursor-pointer flex items-center gap-2 shadow-md disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{savingPrize ? "Đang Lưu Vào Database..." : "Thêm Giải Thưởng Vào Database"}</span>
                  </button>
                </div>
              </form>

              {/* Danh sách giải thưởng hiện tại từ Database */}
              <div className="space-y-3">
                <div className="font-bold text-slate-300 text-sm flex items-center justify-between">
                  <span>Danh Sách Giải Thưởng Đã Thiết Lập ({formData.prizes?.length || 0}):</span>
                  <span className="text-[11px] text-emerald-400 font-normal">Được tải trực tiếp từ Database public.event_prizes</span>
                </div>

                <div className="space-y-2">
                  {formData.prizes?.map((p, idx) => (
                    <div
                      key={p.id || idx}
                      className="flex items-center justify-between gap-3 p-3.5 rounded-2xl border border-slate-800 bg-slate-900/80 hover:border-slate-700 transition"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {p.imageUrl ? (
                          <img src={p.imageUrl} alt={p.title} className="w-12 h-12 rounded-xl object-cover border border-slate-700 shrink-0 bg-slate-950" />
                        ) : (
                          <ClickUpBadgeIcon name={p.iconName || "Gift"} variant="yellow" size={16} containerClassName="p-2 rounded-xl" />
                        )}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-black text-amber-400 text-xs">{p.rankName}:</span>
                            <span className="font-bold text-white text-xs truncate">{p.title}</span>
                            <span className="text-emerald-400 font-mono text-[11px] font-bold">({p.value})</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-medium">
                              SL: {p.quantity || 1}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 truncate mt-0.5">
                            {p.description || "Quà tặng sự kiện"} · <span className="text-slate-300">Tài trợ: {p.sponsor || "CEO 1983"}</span>
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleRemovePrize(p.id)}
                        className="p-2 rounded-xl text-rose-400 hover:bg-rose-500/20 hover:text-rose-300 transition cursor-pointer shrink-0"
                        title="Xóa giải thưởng này khỏi database"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "info" && (
            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Tên Sự Kiện / Tiêu Đề Banner:</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-white outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Khẩu Hiệu / Mô Tả Sự Kiện:</label>
                <textarea
                  rows={2}
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-white outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Ngày Tổ Chức:</label>
                  <input
                    type="text"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-white outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Thời Gian:</label>
                  <input
                    type="text"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-white outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Địa Điểm Tổ Chức:</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-white outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Tổng Giá Trị Giải Thưởng:</label>
                  <input
                    type="text"
                    value={formData.totalPrizeValue}
                    onChange={(e) => setFormData({ ...formData, totalPrizeValue: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-amber-400 font-bold outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Ảnh Nền / Poster Sự Kiện (URL):</label>
                <input
                  type="text"
                  value={formData.coverUrl || ""}
                  onChange={(e) => setFormData({ ...formData, coverUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-white outline-none focus:border-amber-500"
                />
              </div>
            </div>
          )}

          {activeTab === "candidates" && (
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between text-slate-300 font-bold">
                <span>Danh Sách Mã Bốc Thăm &amp; Đại Biểu Đã Check-in ({formData.candidates?.length || 0}):</span>
              </div>

              <div className="max-h-72 overflow-y-auto rounded-xl border border-slate-800 bg-slate-900 divide-y divide-slate-800">
                {formData.candidates?.map((cand, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-amber-400 bg-amber-950/60 border border-amber-800/40 px-2 py-0.5 rounded-md">
                        {cand.code}
                      </span>
                      <span className="font-bold text-white">{cand.name}</span>
                      <span className="text-slate-400">· {cand.company}</span>
                    </div>
                    {cand.seat && (
                      <span className="text-[11px] text-slate-400">{cand.seat}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-800 p-4 bg-slate-900">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold cursor-pointer"
          >
            Đóng
          </button>
          <button
            onClick={() => onSave(formData)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-md cursor-pointer transition"
          >
            <Save className="w-4 h-4" />
            <span>Đồng Bộ Cấu Hình Vào Database</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ── DIGITAL INTERACTIVE LUCKY DRAW MODAL ──
function InteractiveLuckyDrawModal({
  event,
  onClose,
}: {
  event: LuckyDrawEventConfig;
  onClose: () => void;
}) {
  const [selectedPrizeId, setSelectedPrizeId] = useState(event.prizes[0]?.id || "");
  const [spinning, setSpinning] = useState(false);
  const [displayIndex, setDisplayIndex] = useState(0);
  const [winner, setWinner] = useState<LuckyDrawCandidate | null>(null);
  const [history, setHistory] = useState<Array<{ prizeTitle: string; winner: LuckyDrawCandidate; time: string }>>([]);
  const [notifying, setNotifying] = useState(false);

  const candidates = event.candidates || [];
  const currentPrize = event.prizes.find((p) => p.id === selectedPrizeId) || event.prizes[0];

  const spin = () => {
    if (spinning || candidates.length === 0) return;
    setWinner(null);
    setSpinning(true);
    let counter = 0;
    const interval = setInterval(() => {
      setDisplayIndex(Math.floor(Math.random() * candidates.length));
      counter += 1;
      if (counter > 28) {
        clearInterval(interval);
        const winIdx = Math.floor(Math.random() * candidates.length);
        setDisplayIndex(winIdx);
        const chosen = candidates[winIdx];
        setWinner(chosen);
        setSpinning(false);
        setHistory((prev) => [
          {
            prizeTitle: `${currentPrize?.rankName}: ${currentPrize?.title}`,
            winner: chosen,
            time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
          },
          ...prev,
        ]);
        toast.success(`Chúc mừng ${chosen.name} (${chosen.code}) đã trúng ${currentPrize?.title}!`);
      }
    }, 70);
  };

  const handleNotifyWinner = async () => {
    if (!winner) return;
    setNotifying(true);
    try {
      await fetchNestApi("/voting/lucky-draw/notify", {
        method: "POST",
        body: JSON.stringify({
          winnerName: winner.name,
          winnerCompany: winner.company,
          luckyNumber: winner.code,
          prizeName: currentPrize?.title,
          eventName: event.name,
        }),
      }).catch(() => {});
      toast.success(`Đã phát thông báo chúc mừng tới điện thoại và App của ${winner.name}!`);
    } catch {
      toast.error("Không thể gửi thông báo");
    } finally {
      setNotifying(false);
    }
  };

  const currentCandidate = candidates[displayIndex] || candidates[0];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl overflow-hidden rounded-3xl border border-amber-500/40 bg-[#0B132B] text-white shadow-2xl p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <ClickUpBadgeIcon name="Trophy" variant="yellow" size={24} />
            <div>
              <h3 className="text-lg font-bold text-white">Vòng Quay May Mắn Trực Tiếp</h3>
              <p className="text-xs text-slate-400">{event.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white cursor-pointer">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 space-y-5">
          {/* Select Prize */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Chọn Hạng Mục Giải Thưởng Bốc Thăm:</label>
            <select
              value={selectedPrizeId}
              onChange={(e) => setSelectedPrizeId(e.target.value)}
              disabled={spinning}
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-xs font-bold text-amber-300 outline-none focus:border-amber-500"
            >
              {event.prizes.map((prz) => (
                <option key={prz.id} value={prz.id}>
                  {prz.rankName} — {prz.title} ({prz.value})
                </option>
              ))}
            </select>
          </div>

          {/* Random Slot Display */}
          <div className="relative overflow-hidden rounded-3xl border-2 border-amber-500/40 bg-gradient-to-b from-slate-900 via-[#070D1F] to-slate-950 p-6 sm:p-8 text-center shadow-inner">
            <div className="text-xs font-bold tracking-widest text-amber-400 uppercase">
              {spinning ? "ĐANG QUAY SỐ NGẪU NHIÊN..." : winner ? "CHÚC MỪNG ĐẠI BIỂU MAY MẮN!" : "MÃ SỐ BỐC THĂM ĐẠI BIỂU"}
            </div>

            <div className="my-4 font-mono text-4xl sm:text-5xl font-extrabold tracking-wider text-amber-300 drop-shadow-md">
              {currentCandidate?.code || "CEO1983"}
            </div>

            <div className="text-xl sm:text-2xl font-black text-white">
              {currentCandidate?.name || "Đại biểu tham dự"}
            </div>

            <div className="text-xs sm:text-sm text-slate-400 mt-1">
              {currentCandidate?.company || "Doanh nghiệp CEO 1983"}
            </div>

            {currentCandidate?.seat && (
              <div className="mt-2 inline-block rounded-full bg-slate-800/80 px-3 py-1 text-xs text-amber-300/80 font-medium">
                {currentCandidate.seat}
              </div>
            )}
          </div>

          {/* Action Button */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={spin}
              disabled={spinning || candidates.length === 0}
              className="flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg disabled:opacity-50 transition cursor-pointer flex items-center justify-center gap-2"
            >
              <ClickUpIcon name="Dices" variant="purple" size={18} />
              <span>{spinning ? "Đang Quay Số..." : "Quay Số May Mắn"}</span>
            </button>

            {winner && (
              <button
                onClick={handleNotifyWinner}
                disabled={notifying}
                className="py-3 px-5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-md transition cursor-pointer"
              >
                <Bell className="w-4 h-4" />
                <span>{notifying ? "Đang gửi..." : "Phát Thông Báo Trúng Thưởng"}</span>
              </button>
            )}
          </div>

          {/* Winner History */}
          {history.length > 0 && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-2">
              <div className="text-xs font-bold text-slate-300">Lịch Sử Trúng Thưởng Đêm Nay:</div>
              <div className="max-h-36 overflow-y-auto space-y-1.5 divide-y divide-slate-800/60 text-xs">
                {history.map((h, i) => (
                  <div key={i} className="pt-1.5 flex items-center justify-between text-slate-300">
                    <span className="font-bold text-amber-300">{h.prizeTitle}</span>
                    <span>
                      {h.winner.name} ({h.winner.code}) · <span className="text-slate-500">{h.time}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
