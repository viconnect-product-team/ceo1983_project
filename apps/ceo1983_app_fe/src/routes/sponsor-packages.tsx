import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import {
  Award,
  Building2,
  Check,
  CheckCircle2,
  Handshake,
  Mail,
  Package,
  Pencil,
  Phone,
  Plus,
  Trash2,
  ShoppingBag,
  Coins,
  Tag,
  Dices,
  PartyPopper,
  Sparkles,
  ExternalLink,
  X,
  Save,
  Filter,
} from "lucide-react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { AppShell } from "@/components/dashboard/AppShell";
import { Card, PageHeader } from "@/components/dashboard/PageKit";
import { useServerData } from "@/hooks/use-server-data";
import { SponsorPackageModal, type PackageDraft } from "@/components/dashboard/SponsorPackageModal";
import {
  createSponsorPackageFn,
  deleteSponsorPackageFn,
  listSponsorPackagesFn,
  listSponsorsFn,
  updateSponsorPackageFn,
  listEventPrizesFn,
  createEventPrizeFn,
  updateEventPrizeFn,
  deleteEventPrizeFn,
  type Sponsor,
  type SponsorPackage,
  type EventPrize,
  type PrizeTargetType,
} from "@/lib/sponsors.functions";
import { fetchNestApi } from "@/lib/api-client";
import {
  ClickUpIcon,
  ClickUpBadgeIcon,
  ClickUpMark,
  CLICKUP_POPULAR_ICONS,
  type ClickUpIconName,
} from "@/components/icons/ClickUpIcons";
import { useFmt, useT, type TKey } from "@/lib/i18n";

export const Route = createFileRoute("/sponsor-packages")({
  validateSearch: (search: Record<string, unknown>) => ({
    tab: (search.tab as string) || "packages",
    eventId: (search.eventId as string) || "",
  }),
  component: PackagesPage,
});

const TIER_KEY: Record<SponsorPackage["tier"], TKey> = {
  platinum: "sponsors.tier.platinum",
  gold: "sponsors.tier.gold",
  silver: "sponsors.tier.silver",
  bronze: "sponsors.tier.bronze",
};
const TIER_GRADIENT: Record<SponsorPackage["tier"], string> = {
  platinum: "linear-gradient(135deg, oklch(0.55 0.05 280), oklch(0.72 0.08 280))",
  gold: "linear-gradient(135deg, oklch(0.72 0.15 85), oklch(0.85 0.13 85))",
  silver: "linear-gradient(135deg, oklch(0.65 0.02 250), oklch(0.82 0.02 250))",
  bronze: "linear-gradient(135deg, oklch(0.55 0.12 50), oklch(0.72 0.10 50))",
};

const FALLBACK_SPONSORS: Sponsor[] = [
  {
    id: "SP-001",
    name: "Tập đoàn Công nghệ SunTech Global",
    tier: "platinum",
    sponsorType: "regular",
    packageType: "cash",
    contact: "Nguyễn Văn Hùng (Chủ tịch HĐQT)",
    email: "hung.nv@suntech-global.vn",
    phone: "0908 123 456",
    amount: 200000000,
    events: 8,
    since: "2023-01-15",
    status: "active",
  },
  {
    id: "SP-002",
    name: "Công ty Cổ phần Trầm Hương & Yến Sào Hoàng Gia",
    tier: "gold",
    sponsorType: "regular",
    packageType: "in_kind",
    inKindDescription: "200 bộ quà tặng Yến Sào & Trầm Hương Thượng Hạng dành tặng tất cả CEO",
    contact: "Trần Mai Phương (Tổng Giám Đốc)",
    email: "phuong.tm@hoanggiagroup.vn",
    phone: "0912 345 678",
    amount: 100000000,
    events: 5,
    since: "2023-06-20",
    status: "active",
  },
];

function PackagesPage() {
  const search = Route.useSearch();
  const t = useT();
  const fmt = useFmt();

  // Tab State: 'packages' | 'prizes'
  const [activeTab, setActiveTab] = useState<"packages" | "prizes">(
    search.tab === "prizes" ? "prizes" : "packages"
  );

  // Packages Data
  const { data: packages, reload: reloadPackages } = useServerData<SponsorPackage[]>(
    () => listSponsorPackagesFn(),
    []
  );
  const { data: rawSponsors } = useServerData<Sponsor[]>(() => listSponsorsFn(), []);
  const sponsors = useMemo(() => {
    return Array.isArray(rawSponsors) && rawSponsors.length > 0 ? rawSponsors : FALLBACK_SPONSORS;
  }, [rawSponsors]);

  // Prizes Data (Database Backed)
  const { data: rawPrizes, reload: reloadPrizes } = useServerData<EventPrize[]>(
    () => listEventPrizesFn({ data: {} }),
    []
  );

  // Real events & products for prize creation & filtering
  const [events, setEvents] = useState<Array<{ id: string; name: string; date?: string }>>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [selectedEventFilter, setSelectedEventFilter] = useState<string>(search.eventId || "all");

  useEffect(() => {
    Promise.all([
      fetchNestApi<any[]>("/events").catch(() => []),
      fetchNestApi<any[]>("/products").catch(() => []),
    ]).then(([evList, prodList]) => {
      setEvents(Array.isArray(evList) ? evList : []);
      setProducts(Array.isArray(prodList) ? prodList : []);
    });
  }, []);

  const createPkgFn = useServerFn(createSponsorPackageFn);
  const updatePkgFn = useServerFn(updateSponsorPackageFn);
  const deletePkgFn = useServerFn(deleteSponsorPackageFn);

  const createPrizeFn = useServerFn(createEventPrizeFn);
  const updatePrizeFn = useServerFn(updateEventPrizeFn);
  const deletePrizeFn = useServerFn(deleteEventPrizeFn);

  // Package modal states
  const [pkgModalOpen, setPkgModalOpen] = useState(false);
  const [editingPkg, setEditingPkg] = useState<SponsorPackage | null>(null);
  const [submittingPkg, setSubmittingPkg] = useState(false);
  const [deletingPkgId, setDeletingPkgId] = useState<string | null>(null);

  // Prize modal states
  const [prizeModalOpen, setPrizeModalOpen] = useState(false);
  const [editingPrize, setEditingPrize] = useState<EventPrize | null>(null);
  const [deletingPrizeId, setDeletingPrizeId] = useState<string | null>(null);

  // Package Handlers
  const onPackageSubmit = async (draft: PackageDraft) => {
    setSubmittingPkg(true);
    try {
      if (editingPkg) {
        await updatePkgFn({ data: { id: editingPkg.id, ...draft } });
        toast.success(t("common.updated"));
      } else {
        await createPkgFn({ data: draft });
        toast.success(t("common.created"));
      }
      setPkgModalOpen(false);
      setEditingPkg(null);
      reloadPackages();
    } catch (err: any) {
      console.error("[SponsorPackages] Save error:", err);
      toast.error(err?.message || t("common.saveError"));
    } finally {
      setSubmittingPkg(false);
    }
  };

  const onPackageDelete = async (p: SponsorPackage) => {
    if (!window.confirm(t("pkg.confirmDelete"))) return;
    setDeletingPkgId(p.id);
    try {
      await deletePkgFn({ data: { id: p.id } });
      toast.success(t("common.deletedToast"));
      reloadPackages();
    } catch (err: any) {
      console.error("[SponsorPackages] Delete error:", err);
      toast.error(err?.message || t("common.deleteError"));
    } finally {
      setDeletingPkgId(null);
    }
  };

  // Prize Handlers
  const onPrizeDelete = async (prizeId: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa giải thưởng này khỏi cơ cấu sự kiện?")) return;
    setDeletingPrizeId(prizeId);
    try {
      await deletePrizeFn({ data: { id: prizeId } });
      toast.success("Đã xóa giải thưởng khỏi Database!");
      reloadPrizes();
    } catch (err: any) {
      toast.error(err?.message || "Không thể xóa giải thưởng");
    } finally {
      setDeletingPrizeId(null);
    }
  };

  const filteredPrizes = useMemo(() => {
    if (!rawPrizes) return [];
    if (selectedEventFilter === "all" || !selectedEventFilter) return rawPrizes;
    return rawPrizes.filter((p) => p.eventId === selectedEventFilter);
  }, [rawPrizes, selectedEventFilter]);

  const totalPrizeAmount = useMemo(() => {
    return filteredPrizes.reduce((sum, p) => sum + (p.amount * (p.quantity || 1)), 0);
  }, [filteredPrizes]);

  return (
    <AppShell>
      <PageHeader
        title="Quản Lý Gói Tài Trợ & Giải Thưởng Sự Kiện"
        subtitle="Quản lý hạn mức tài trợ doanh nghiệp và cấu hình giải thưởng bốc thăm liên kết sản phẩm Database"
        actions={
          <div className="flex items-center gap-2">
            {activeTab === "packages" ? (
              <button
                onClick={() => {
                  setEditingPkg(null);
                  setPkgModalOpen(true);
                }}
                className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)] cursor-pointer"
                style={{ background: "var(--gradient-primary)" }}
              >
                <Plus className="h-4 w-4" />
                <span>{t("pkg.create")}</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setEditingPrize(null);
                  setPrizeModalOpen(true);
                }}
                className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-slate-950 shadow-md bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Tạo Giải Thưởng Mới</span>
              </button>
            )}
          </div>
        }
      />

      {/* Primary Tab Navigation */}
      <div className="mb-6 flex items-center justify-between border-b border-border">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("packages")}
            className={`flex items-center gap-2 pb-3 px-4 text-sm font-bold border-b-2 transition cursor-pointer ${
              activeTab === "packages"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Package className="h-4 w-4" />
            <span>Gói Tài Trợ &amp; Quyền Lợi ({packages.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("prizes")}
            className={`flex items-center gap-2 pb-3 px-4 text-sm font-bold border-b-2 transition cursor-pointer ${
              activeTab === "prizes"
                ? "border-amber-500 text-amber-500"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <ClickUpIcon name="Trophy" variant={activeTab === "prizes" ? "yellow" : "mono"} size={16} />
            <span>Cơ Cấu Giải Thưởng Sự Kiện &amp; Bốc Thăm ({filteredPrizes.length})</span>
            <span className="rounded-full bg-amber-500/20 text-amber-500 text-[10px] px-2 py-0.5 font-black">
              Database
            </span>
          </button>
        </div>
      </div>

      {/* ── TAB 1: GÓI TÀI TRỢ DOANH NGHIỆP ── */}
      {activeTab === "packages" && (
        <>
          {packages.length === 0 ? (
            <Card className="grid place-items-center gap-3 p-12 text-center">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-muted">
                <Package className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
              </div>
              <p className="max-w-sm text-sm text-muted-foreground">{t("pkg.empty")}</p>
              <button
                onClick={() => {
                  setEditingPkg(null);
                  setPkgModalOpen(true);
                }}
                className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)]"
                style={{ background: "var(--gradient-primary)" }}
              >
                <Plus className="h-4 w-4" />
                {t("pkg.create")}
              </button>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
                {packages.map((p) => {
                  const remain = p.available - p.sold;
                  const soldPct =
                    p.available > 0 ? Math.min(100, Math.round((p.sold / p.available) * 100)) : 0;
                  const pkgSponsors = sponsors.filter((s) => s.tier === p.tier);
                  return (
                    <Card key={p.id} className="overflow-hidden">
                      <div
                        className="relative p-6 text-primary-foreground"
                        style={{ background: TIER_GRADIENT[p.tier] }}
                      >
                        <div className="absolute right-3 top-3 flex gap-1">
                          <button
                            onClick={() => {
                              setEditingPkg(p);
                              setPkgModalOpen(true);
                            }}
                            aria-label={t("pkg.edit")}
                            className="grid h-8 w-8 place-items-center rounded-lg bg-card/15 text-primary-foreground backdrop-blur hover:bg-card/25 cursor-pointer"
                          >
                            <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                          </button>
                          <button
                            onClick={() => onPackageDelete(p)}
                            disabled={deletingPkgId === p.id}
                            aria-label={t("pkg.delete")}
                            className="grid h-8 w-8 place-items-center rounded-lg bg-card/15 text-primary-foreground backdrop-blur hover:bg-card/25 disabled:opacity-50 cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                          </button>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <Package className="h-5 w-5" aria-hidden="true" />
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                              p.packageType === "in_kind"
                                ? "bg-purple-950/40 text-purple-200 border border-purple-400/40"
                                : "bg-amber-950/40 text-amber-200 border border-amber-400/40"
                            }`}
                          >
                            {p.packageType === "in_kind" ? "Gói Hiện Vật" : "Gói Bằng Tiền"}
                          </span>
                        </div>
                        <div className="text-[11px] font-bold uppercase tracking-wider opacity-90">
                          {t("pkg.tierPrefix", { tier: t(TIER_KEY[p.tier]) })}
                        </div>
                        <div className="mt-1">
                          {p.packageType === "in_kind" && (
                            <span className="text-[11px] font-medium opacity-80 block">Định giá quy đổi:</span>
                          )}
                          <div className="text-2xl font-bold">{fmt.money(p.price)}</div>
                        </div>
                      </div>
                      <div className="p-5">
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                          <span>
                            {t("pkg.sold")}: {p.sold}/{p.available}
                          </span>
                          <span className="font-semibold text-foreground">{remain} còn lại</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-muted overflow-hidden mb-4">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${soldPct}%`, background: "var(--gradient-primary)" }}
                          />
                        </div>

                        {p.inKindDescription && (
                          <div className="mb-4 rounded-xl p-3 bg-purple-500/10 border border-purple-500/20 text-xs">
                            <span className="font-bold text-purple-700 dark:text-purple-300 block mb-0.5">
                              Mô tả hiện vật tài trợ:
                            </span>
                            <p className="text-muted-foreground italic text-[11.5px] leading-relaxed">
                              {p.inKindDescription}
                            </p>
                          </div>
                        )}

                        <div className="text-xs font-semibold text-foreground mb-2">
                          {t("pkg.benefits")}:
                        </div>
                        <ul className="space-y-1.5 text-xs text-muted-foreground">
                          {p.benefits.map((b, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <Check
                                className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5"
                                aria-hidden="true"
                              />
                              <span>{b}</span>
                            </li>
                          ))}
                        </ul>

                        {/* List Sponsors using this package */}
                        <div className="mt-4 pt-4 border-t border-border">
                          <div className="flex items-center justify-between text-xs mb-2">
                            <span className="font-bold text-foreground flex items-center gap-1.5">
                              <Building2 className="h-3.5 w-3.5 text-primary" />
                              <span>Doanh nghiệp tài trợ ({pkgSponsors.length}):</span>
                            </span>
                          </div>
                          {pkgSponsors.length > 0 ? (
                            <div className="space-y-2">
                              {pkgSponsors.map((sp) => (
                                <div
                                  key={sp.id}
                                  className="p-2.5 rounded-xl border border-border bg-muted/40 text-xs"
                                >
                                  <div className="flex items-center justify-between font-bold text-foreground">
                                    <span className="truncate pr-1">{sp.name}</span>
                                    <span className="shrink-0 text-[11px] text-primary font-mono font-black">
                                      {fmt.money(sp.amount)}
                                    </span>
                                  </div>
                                  <div className="mt-1 text-[11px] text-muted-foreground flex items-center justify-between">
                                    <span className="truncate">Đại diện: {sp.contact}</span>
                                    <span className="shrink-0 font-medium text-slate-500 dark:text-slate-400">
                                      {sp.phone}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-[11px] italic text-muted-foreground">
                              Chưa có doanh nghiệp kích hoạt gói này
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </>
          )}
        </>
      )}

      {/* ── TAB 2: CƠ CẤU GIẢI THƯỞNG SỰ KIỆN & BỐC THĂM (DATABASE DYNAMIC) ── */}
      {activeTab === "prizes" && (
        <div className="space-y-6">
          {/* Summary Stat Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="p-5 space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Tổng Số Giải Thưởng</span>
                <ClickUpBadgeIcon name="Trophy" variant="yellow" size={16} containerClassName="p-1.5 rounded-lg" />
              </div>
              <div className="text-2xl font-black text-foreground">{filteredPrizes.length} Hạng Mục</div>
              <p className="text-[11px] text-muted-foreground">Lưu trữ trên PostgreSQL table public.event_prizes</p>
            </Card>

            <Card className="p-5 space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Tổng Trị Giá Quy Đổi</span>
                <ClickUpBadgeIcon name="Coins" variant="yellow" size={16} containerClassName="p-1.5 rounded-lg" />
              </div>
              <div className="text-2xl font-black text-amber-500 font-mono">
                {totalPrizeAmount > 0 ? `${totalPrizeAmount.toLocaleString("vi-VN")} VNĐ` : "Chưa cập nhật"}
              </div>
              <p className="text-[11px] text-muted-foreground">Quy đổi từ sản phẩm B2B và ngân sách tài trợ</p>
            </Card>

            <Card className="p-5 space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Phần Thưởng Sản Phẩm B2B</span>
                <ClickUpBadgeIcon name="ShoppingBag" variant="teal" size={16} containerClassName="p-1.5 rounded-lg" />
              </div>
              <div className="text-2xl font-black text-teal-600">
                {filteredPrizes.filter((p) => p.targetType === "PRODUCT").length} Giải Thưởng
              </div>
              <p className="text-[11px] text-muted-foreground">Lấy trực tiếp từ kho sản phẩm public.products</p>
            </Card>

            <Card className="p-5 space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Gói Tài Trợ &amp; Voucher</span>
                <ClickUpBadgeIcon name="Package" variant="purple" size={16} containerClassName="p-1.5 rounded-lg" />
              </div>
              <div className="text-2xl font-black text-purple-600">
                {filteredPrizes.filter((p) => p.targetType !== "PRODUCT").length} Giải Thưởng
              </div>
              <p className="text-[11px] text-muted-foreground">Liên kết gói tài trợ hoặc ưu đãi độc quyền</p>
            </Card>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs font-bold text-foreground">Lọc Theo Sự Kiện:</span>
              <select
                value={selectedEventFilter}
                onChange={(e) => setSelectedEventFilter(e.target.value)}
                className="rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground outline-none focus:border-primary cursor-pointer"
              >
                <option value="all">Tất cả các sự kiện ({rawPrizes?.length || 0} giải)</option>
                {events.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setEditingPrize(null);
                  setPrizeModalOpen(true);
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400 cursor-pointer shadow-sm"
              >
                <Plus className="h-4 w-4" />
                <span>Tạo Giải Thưởng Sự Kiện Mới</span>
              </button>
            </div>
          </div>

          {/* Prizes Table */}
          <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground bg-muted/20">
                  <tr>
                    <th className="px-4 py-3">Hạng Giải</th>
                    <th className="px-4 py-3">Tên Phần Thưởng</th>
                    <th className="px-4 py-3">Loại / Target</th>
                    <th className="px-4 py-3 text-right">Trị Giá Quy Đổi</th>
                    <th className="px-4 py-3 text-center">Số Lượng</th>
                    <th className="px-4 py-3">Đơn Vị Tài Trợ</th>
                    <th className="px-4 py-3 text-center">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredPrizes.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground text-xs">
                        Chưa có giải thưởng nào được tạo trong Database. Bấm "Tạo Giải Thưởng Mới" để thêm từ danh mục sản phẩm.
                      </td>
                    </tr>
                  ) : (
                    filteredPrizes.map((p) => {
                      return (
                        <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-2">
                              <ClickUpBadgeIcon name={p.iconName || "Gift"} variant="yellow" size={14} containerClassName="p-1 rounded-md" />
                              <span className="font-bold text-foreground text-xs">{p.rankName}</span>
                            </div>
                          </td>

                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-3">
                              {p.imageUrl ? (
                                <img
                                  src={p.imageUrl}
                                  alt={p.title}
                                  className="h-10 w-10 rounded-lg object-cover border border-border bg-muted shrink-0"
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground shrink-0">
                                  <ClickUpIcon name="Gift" variant="mono" size={16} />
                                </div>
                              )}
                              <div className="min-w-0">
                                <div className="font-bold text-foreground line-clamp-1">{p.title}</div>
                                <div className="text-[11px] text-muted-foreground line-clamp-1">{p.description}</div>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-3.5 text-xs">
                            {p.targetType === "PRODUCT" && (
                              <span className="inline-flex items-center gap-1 rounded bg-teal-500/15 border border-teal-500/30 px-2 py-0.5 font-bold text-teal-700 dark:text-teal-300">
                                <ShoppingBag className="w-3 h-3" /> Sản phẩm B2B
                              </span>
                            )}
                            {p.targetType === "SPONSOR_PACKAGE" && (
                              <span className="inline-flex items-center gap-1 rounded bg-purple-500/15 border border-purple-500/30 px-2 py-0.5 font-bold text-purple-700 dark:text-purple-300">
                                <Package className="w-3 h-3" /> Gói tài trợ
                              </span>
                            )}
                            {p.targetType === "CASH" && (
                              <span className="inline-flex items-center gap-1 rounded bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 font-bold text-amber-700 dark:text-amber-300">
                                <Coins className="w-3 h-3" /> Hiện kim
                              </span>
                            )}
                            {p.targetType === "VOUCHER" && (
                              <span className="inline-flex items-center gap-1 rounded bg-blue-500/15 border border-blue-500/30 px-2 py-0.5 font-bold text-blue-700 dark:text-blue-300">
                                <Tag className="w-3 h-3" /> Voucher
                              </span>
                            )}
                            {p.targetType === "CUSTOM" && (
                              <span className="inline-flex items-center gap-1 rounded bg-slate-500/15 border border-slate-500/30 px-2 py-0.5 font-bold text-slate-700 dark:text-slate-300">
                                Hiện vật khác
                              </span>
                            )}
                          </td>

                          <td className="px-4 py-3.5 text-right font-mono font-black text-amber-600 dark:text-amber-400">
                            {p.value}
                          </td>

                          <td className="px-4 py-3.5 text-center text-xs font-semibold">
                            {p.quantity || 1} phần
                          </td>

                          <td className="px-4 py-3.5 text-xs text-foreground font-medium">
                            {p.sponsorName || "CEO 1983"}
                          </td>

                          <td className="px-4 py-3.5 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => {
                                  setEditingPrize(p);
                                  setPrizeModalOpen(true);
                                }}
                                className="p-1.5 rounded-lg text-primary hover:bg-primary/10 transition cursor-pointer"
                                title="Chỉnh sửa giải thưởng"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => onPrizeDelete(p.id)}
                                disabled={deletingPrizeId === p.id}
                                className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition disabled:opacity-50 cursor-pointer"
                                title="Xóa giải thưởng"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL GÓI TÀI TRỢ */}
      <SponsorPackageModal
        open={pkgModalOpen}
        initial={editingPkg}
        submitting={submittingPkg}
        onClose={() => {
          setPkgModalOpen(false);
          setEditingPkg(null);
        }}
        onSubmit={onPackageSubmit}
      />

      {/* MODAL TẠO / SỬA GIẢI THƯỞNG SỰ KIỆN (DYNAMIC PRODUCT SELECTION) */}
      {prizeModalOpen && (
        <PrizeEditorModal
          initial={editingPrize}
          events={events}
          products={products}
          packages={packages}
          onClose={() => {
            setPrizeModalOpen(false);
            setEditingPrize(null);
          }}
          onSave={async (data) => {
            if (editingPrize) {
              await updatePrizeFn({ data: { id: editingPrize.id, ...data } });
              toast.success("Đã cập nhật giải thưởng trong Database!");
            } else {
              await createPrizeFn({ data });
              toast.success("Đã tạo giải thưởng mới trong Database!");
            }
            setPrizeModalOpen(false);
            setEditingPrize(null);
            reloadPrizes();
          }}
        />
      )}
    </AppShell>
  );
}

// ── PRIZE CREATION / EDIT MODAL ──
function PrizeEditorModal({
  initial,
  events,
  products,
  packages,
  onClose,
  onSave,
}: {
  initial?: EventPrize | null;
  events: Array<{ id: string; name: string }>;
  products: any[];
  packages: SponsorPackage[];
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
}) {
  const [eventId, setEventId] = useState(initial?.eventId || events[0]?.id || "");
  const [rankName, setRankName] = useState(initial?.rankName || "Giải Đặc Biệt");
  const [targetType, setTargetType] = useState<PrizeTargetType>(initial?.targetType || "PRODUCT");
  const [targetId, setTargetId] = useState(initial?.targetId || "");
  const [title, setTitle] = useState(initial?.title || "");
  const [value, setValue] = useState(initial?.value || "");
  const [amount, setAmount] = useState<number>(initial?.amount || 0);
  const [quantity, setQuantity] = useState<number>(initial?.quantity || 1);
  const [sponsorName, setSponsorName] = useState(initial?.sponsorName || "");
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [iconName, setIconName] = useState(initial?.iconName || "Crown");
  const [saving, setSaving] = useState(false);

  // Auto-fill on product selection
  const handleSelectProduct = (prodId: string) => {
    setTargetId(prodId);
    const prod = products.find((p) => p.id === prodId);
    if (prod) {
      setTitle(prod.name || prod.title || "");
      if (prod.price) {
        setAmount(Number(prod.price));
        setValue(`${Number(prod.price).toLocaleString("vi-VN")} VNĐ`);
      }
      if (prod.company) setSponsorName(prod.company);
      if (prod.image_url || prod.imageUrl) setImageUrl(prod.image_url || prod.imageUrl);
      if (prod.description) setDescription(prod.description);
    }
  };

  // Auto-fill on package selection
  const handleSelectPackage = (pkgId: string) => {
    setTargetId(pkgId);
    const pkg = packages.find((p) => p.id === pkgId);
    if (pkg) {
      setTitle(`Gói Tài Trợ ${pkg.tier.toUpperCase()} Doanh Nghiệp`);
      if (pkg.price) {
        setAmount(Number(pkg.price));
        setValue(`${Number(pkg.price).toLocaleString("vi-VN")} VNĐ`);
      }
      if (pkg.inKindDescription) setDescription(pkg.inKindDescription);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Vui lòng nhập tên giải thưởng hoặc chọn sản phẩm");
      return;
    }
    if (!eventId) {
      toast.error("Vui lòng chọn sự kiện áp dụng");
      return;
    }

    setSaving(true);
    try {
      await onSave({
        eventId,
        rankName: rankName.trim(),
        title: title.trim(),
        value: value.trim() || (amount > 0 ? `${amount.toLocaleString("vi-VN")} VNĐ` : "Giá trị liên hệ"),
        amount,
        quantity,
        targetType,
        targetId: targetId || null,
        sponsorName: sponsorName.trim() || "Nhà tài trợ CEO 1983",
        imageUrl: imageUrl.trim() || null,
        description: description.trim(),
        iconName,
      });
    } catch (err: any) {
      toast.error(err?.message || "Lỗi lưu giải thưởng");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl border border-border bg-card text-foreground shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border p-5 bg-muted/30">
          <div className="flex items-center gap-3">
            <ClickUpBadgeIcon name="Trophy" variant="yellow" size={20} />
            <div>
              <h2 className="text-base font-bold text-foreground">
                {initial ? "Chỉnh Sửa Giải Thưởng Tài Trợ" : "Tạo Mới Giải Thưởng Sự Kiện (Database Dynamic)"}
              </h2>
              <p className="text-xs text-muted-foreground">
                Kết nối trực tiếp danh mục Sản phẩm B2B hoặc Gói tài trợ từ Database
              </p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-xl p-1.5 text-muted-foreground hover:bg-muted cursor-pointer">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          {/* Sự kiện áp dụng */}
          <div>
            <label className="block font-bold text-foreground mb-1">Áp Dụng Cho Sự Kiện:</label>
            <select
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-foreground font-semibold outline-none focus:border-primary cursor-pointer"
            >
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.name}
                </option>
              ))}
            </select>
          </div>

          {/* Loại target & Hạng giải */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-foreground mb-1">Loại Phần Thưởng (Target Type):</label>
              <select
                value={targetType}
                onChange={(e) => {
                  setTargetType(e.target.value as PrizeTargetType);
                  setTargetId("");
                }}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-foreground font-semibold outline-none focus:border-primary cursor-pointer"
              >
                <option value="PRODUCT">📦 Sản Phẩm B2B (Từ Database public.products)</option>
                <option value="SPONSOR_PACKAGE">🤝 Gói Tài Trợ Doanh Nghiệp</option>
                <option value="VOUCHER">🏷️ Voucher / Dịch Vụ Ưu Đãi</option>
                <option value="CASH">💰 Hiện Kim / Tiền Mặt</option>
                <option value="CUSTOM">🎁 Hiện Vật Tùy Chỉnh</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-foreground mb-1">Hạng Giải Thưởng:</label>
              <input
                type="text"
                value={rankName}
                onChange={(e) => setRankName(e.target.value)}
                placeholder="VD: Giải Đặc Biệt, Giải Nhất..."
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-foreground outline-none focus:border-primary font-semibold"
              />
            </div>
          </div>

          {/* Dynamic selector based on targetType */}
          {targetType === "PRODUCT" && (
            <div className="p-3 rounded-xl border border-teal-500/30 bg-teal-500/5 space-y-1">
              <label className="block font-bold text-teal-700 dark:text-teal-300">
                Chọn Sản Phẩm B2B Từ Kho Database (Tự Động Điền Thông Tin):
              </label>
              <select
                value={targetId}
                onChange={(e) => handleSelectProduct(e.target.value)}
                className="w-full rounded-xl border border-teal-500/40 bg-background px-3 py-2 text-foreground outline-none focus:border-teal-500 cursor-pointer"
              >
                <option value="">-- Chọn sản phẩm trong Database --</option>
                {products.map((prod) => (
                  <option key={prod.id} value={prod.id}>
                    {prod.name || prod.title} — {prod.company} ({prod.price ? `${Number(prod.price).toLocaleString("vi-VN")} VNĐ` : "Liên hệ"})
                  </option>
                ))}
              </select>
            </div>
          )}

          {targetType === "SPONSOR_PACKAGE" && (
            <div className="p-3 rounded-xl border border-purple-500/30 bg-purple-500/5 space-y-1">
              <label className="block font-bold text-purple-700 dark:text-purple-300">
                Chọn Gói Tài Trợ Từ Database:
              </label>
              <select
                value={targetId}
                onChange={(e) => handleSelectPackage(e.target.value)}
                className="w-full rounded-xl border border-purple-500/40 bg-background px-3 py-2 text-foreground outline-none focus:border-purple-500 cursor-pointer"
              >
                <option value="">-- Chọn gói tài trợ --</option>
                {packages.map((pkg) => (
                  <option key={pkg.id} value={pkg.id}>
                    Gói {pkg.tier.toUpperCase()} — {Number(pkg.price).toLocaleString("vi-VN")} VNĐ
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Title & Value */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block font-bold text-foreground mb-1">Tên Phần Thưởng:</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="VD: Gói giải pháp chuyển đổi số hoá / Kỳ nghỉ 5 sao"
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-foreground outline-none focus:border-primary font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-foreground mb-1">Trị Giá Quy Đổi (VNĐ):</label>
              <input
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="VD: 50.000.000 VNĐ"
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-amber-600 dark:text-amber-400 font-bold outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* Sponsor, Quantity, ClickUp Icon */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-foreground mb-1">Đơn Vị Tài Trợ:</label>
              <input
                type="text"
                value={sponsorName}
                onChange={(e) => setSponsorName(e.target.value)}
                placeholder="VD: Doanh nghiệp thành viên"
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-foreground outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block font-bold text-foreground mb-1">Số Lượng Giải:</label>
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value) || 1)}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-foreground outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block font-bold text-foreground mb-1">Biểu Tượng ClickUp:</label>
              <select
                value={iconName}
                onChange={(e) => setIconName(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-foreground outline-none focus:border-primary cursor-pointer"
              >
                {CLICKUP_POPULAR_ICONS.map((ic) => (
                  <option key={ic.name} value={ic.name}>
                    {ic.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-foreground mb-1">Hình Ảnh Phần Thưởng (URL):</label>
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-foreground outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block font-bold text-foreground mb-1">Mô Tả Quà Tặng &amp; Quyền Lợi:</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả nội dung chi tiết của phần thưởng..."
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-foreground outline-none focus:border-primary"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-muted text-muted-foreground hover:bg-muted/80 font-semibold cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-bold transition shadow-md cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              <span>{saving ? "Đang Lưu..." : "Lưu Vào Database"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
