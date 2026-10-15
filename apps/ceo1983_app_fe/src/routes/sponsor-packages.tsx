import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import {
  Check,
  Handshake,
  Package,
  Pencil,
  Plus,
  Trash2,
  Coins,
  Sparkles,
  TrendingUp,
  Search,
  Award,
  Layers,
} from "lucide-react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { AppShell } from "@/components/dashboard/AppShell";
import { Card, PageHeader, StatCard } from "@/components/dashboard/PageKit";
import { Pagination } from "@/components/dashboard/DataTablePagination";
import { useServerData } from "@/hooks/use-server-data";
import { SponsorPackageModal, type PackageDraft } from "@/components/dashboard/SponsorPackageModal";
import {
  createSponsorPackageFn,
  deleteSponsorPackageFn,
  listSponsorPackagesFn,
  updateSponsorPackageFn,
  type SponsorPackage,
} from "@/lib/sponsors.functions";
import { useFmt, useT, type TKey } from "@/lib/i18n";

export const Route = createFileRoute("/sponsor-packages")({
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

function PackagesPage() {
  const t = useT();
  const fmt = useFmt();

  // Search & filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTier, setSelectedTier] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");

  // Packages Data
  const { data: packages, reload: reloadPackages } = useServerData<SponsorPackage[]>(
    () => listSponsorPackagesFn(),
    []
  );

  const createPkgFn = useServerFn(createSponsorPackageFn);
  const updatePkgFn = useServerFn(updateSponsorPackageFn);
  const deletePkgFn = useServerFn(deleteSponsorPackageFn);

  // Package modal states
  const [pkgModalOpen, setPkgModalOpen] = useState(false);
  const [editingPkg, setEditingPkg] = useState<SponsorPackage | null>(null);
  const [submittingPkg, setSubmittingPkg] = useState(false);
  const [deletingPkgId, setDeletingPkgId] = useState<string | null>(null);

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

  // Dashboard Metrics
  const metrics = useMemo(() => {
    const totalPackages = packages.length;
    const totalAvailableSlots = packages.reduce((acc, p) => acc + (p.available || 0), 0);
    const totalSoldSlots = packages.reduce((acc, p) => acc + (p.sold || 0), 0);
    const totalIssuanceValue = packages.reduce((acc, p) => acc + ((p.price || 0) * (p.available || 0)), 0);
    const totalSoldValue = packages.reduce((acc, p) => acc + ((p.price || 0) * (p.sold || 0)), 0);
    const cashCount = packages.filter((p) => p.packageType === "cash").length;
    const inKindCount = packages.filter((p) => p.packageType === "in_kind").length;
    const fillRate = totalAvailableSlots > 0 ? Math.round((totalSoldSlots / totalAvailableSlots) * 100) : 0;

    return {
      totalPackages,
      totalAvailableSlots,
      totalSoldSlots,
      totalIssuanceValue,
      totalSoldValue,
      cashCount,
      inKindCount,
      fillRate,
    };
  }, [packages]);

  // Filtered packages
  const filteredPackages = useMemo(() => {
    return packages.filter((p) => {
      if (selectedTier !== "all" && p.tier !== selectedTier) return false;
      if (selectedType !== "all" && (p.packageType || "cash") !== selectedType) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const tierName = t(TIER_KEY[p.tier] as never).toLowerCase();
        const matchesTier = tierName.includes(q);
        const matchesDesc = (p.inKindDescription || "").toLowerCase().includes(q);
        const matchesBenefits = p.benefits.some((b) => b.toLowerCase().includes(q));
        if (!matchesTier && !matchesDesc && !matchesBenefits) return false;
      }
      return true;
    });
  }, [packages, selectedTier, selectedType, searchQuery, t]);

  // Pagination states
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  useEffect(() => {
    setPage(1);
  }, [selectedTier, selectedType, searchQuery]);

  const paginatedPackages = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredPackages.slice(start, start + pageSize);
  }, [filteredPackages, page, pageSize]);

  return (
    <AppShell>
      <PageHeader
        title="Quản Lý Gói Tài Trợ & Quyền Lợi"
        subtitle="Thiết lập các gói tài trợ định danh (Bạch kim, Vàng, Bạc, Đồng), định mức huy động và cơ cấu quyền lợi độc quyền"
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setEditingPkg(null);
                setPkgModalOpen(true);
              }}
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)] cursor-pointer hover:opacity-90 transition active:scale-95"
              style={{ background: "var(--gradient-primary)" }}
            >
              <Plus className="h-4 w-4" />
              <span>{t("pkg.create")}</span>
            </button>
          </div>
        }
      />

      {/* ── DASHBOARD GÓI TÀI TRỢ ── */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Tổng Gói & Phân Loại"
          value={`${metrics.totalPackages} Gói định mức`}
          tone="primary"
          hint={`${metrics.cashCount} gói bằng tiền · ${metrics.inKindCount} gói hiện vật`}
          icon={<Package className="h-4 w-4 text-blue-500" />}
        />
        <StatCard
          label="Tổng Hạn Mức Phát Hành"
          value={fmt.money(metrics.totalIssuanceValue)}
          tone="warning"
          hint={`Tổng ${metrics.totalAvailableSlots} suất tài trợ dự kiến`}
          icon={<Coins className="h-4 w-4 text-amber-500" />}
        />
        <StatCard
          label="Đã Đăng Ký / Phân Bổ"
          value={`${metrics.totalSoldSlots} / ${metrics.totalAvailableSlots} Suất`}
          tone="success"
          hint={`Đạt ${fmt.money(metrics.totalSoldValue)} doanh số huy động`}
          icon={<Handshake className="h-4 w-4 text-emerald-500" />}
        />
        <StatCard
          label="Tỷ Lệ Lấp Đầy Gói"
          value={`${metrics.fillRate}%`}
          tone="info"
          hint={`Còn lại ${metrics.totalAvailableSlots - metrics.totalSoldSlots} suất khả dụng`}
          icon={<TrendingUp className="h-4 w-4 text-sky-500" />}
        />
      </div>

      {/* ── BỘ LỌC TÌM KIẾM GÓI TÀI TRỢ ── */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4 shadow-xs">
        <div className="flex flex-1 min-w-[240px] items-center gap-2">
          <div className="relative w-full max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên hạng, hiện vật, quyền lợi..."
              className="h-10 w-full rounded-xl border border-border bg-background pl-9 pr-3 text-xs font-medium text-foreground outline-none focus:border-primary"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={selectedTier}
            onChange={(e) => setSelectedTier(e.target.value)}
            className="h-10 rounded-xl border border-border bg-background px-3 text-xs font-semibold text-foreground outline-none focus:border-primary cursor-pointer"
          >
            <option value="all">Tất cả các hạng</option>
            <option value="platinum">Bạch kim (Platinum)</option>
            <option value="gold">Vàng (Gold)</option>
            <option value="silver">Bạc (Silver)</option>
            <option value="bronze">Đồng (Bronze)</option>
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="h-10 rounded-xl border border-border bg-background px-3 text-xs font-semibold text-foreground outline-none focus:border-primary cursor-pointer"
          >
            <option value="all">Tất cả hình thức</option>
            <option value="cash">💵 Gói bằng Tiền</option>
            <option value="in_kind">🎁 Gói Hiện vật</option>
          </select>
        </div>
      </div>

      {/* ── DANH SÁCH GÓI TÀI TRỢ DOANH NGHIỆP ── */}
      {filteredPackages.length === 0 ? (
        <Card className="grid place-items-center gap-3 p-12 text-center">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-muted">
            <Package className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
          </div>
          <p className="max-w-sm text-sm text-muted-foreground">
            {packages.length === 0
              ? t("pkg.empty")
              : "Không tìm thấy gói tài trợ nào phù hợp với bộ lọc hiện tại."}
          </p>
          {packages.length === 0 && (
            <button
              onClick={() => {
                setEditingPkg(null);
                setPkgModalOpen(true);
              }}
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)] cursor-pointer"
              style={{ background: "var(--gradient-primary)" }}
            >
              <Plus className="h-4 w-4" />
              {t("pkg.create")}
            </button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          {paginatedPackages.map((p) => {
            const remain = Math.max(0, p.available - p.sold);
            const soldPct =
              p.available > 0 ? Math.min(100, Math.round((p.sold / p.available) * 100)) : 0;

            return (
              <Card key={p.id} className="overflow-hidden flex flex-col justify-between border border-border shadow-xs hover:shadow-md transition">
                <div>
                  {/* Card Header with Tier Gradient */}
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
                        title="Chỉnh sửa gói"
                        className="grid h-8 w-8 place-items-center rounded-lg bg-card/20 text-primary-foreground backdrop-blur-sm hover:bg-card/35 transition cursor-pointer"
                      >
                        <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                      <button
                        onClick={() => onPackageDelete(p)}
                        disabled={deletingPkgId === p.id}
                        aria-label={t("pkg.delete")}
                        title="Xóa gói"
                        className="grid h-8 w-8 place-items-center rounded-lg bg-card/20 text-primary-foreground backdrop-blur-sm hover:bg-card/35 transition disabled:opacity-50 cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                      <Package className="h-5 w-5" aria-hidden="true" />
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                          p.packageType === "in_kind"
                            ? "bg-purple-950/50 text-purple-200 border border-purple-400/40"
                            : "bg-amber-950/50 text-amber-200 border border-amber-400/40"
                        }`}
                      >
                        {p.packageType === "in_kind" ? "🎁 Gói Hiện Vật" : "💵 Gói Bằng Tiền"}
                      </span>
                    </div>

                    <div className="text-xs font-extrabold uppercase tracking-wider opacity-90">
                      {t("pkg.tierPrefix", { tier: t(TIER_KEY[p.tier]) })}
                    </div>
                    <div className="mt-1">
                      {p.packageType === "in_kind" && (
                        <span className="text-[11px] font-medium opacity-85 block">Định giá quy đổi:</span>
                      )}
                      <div className="text-2xl font-black font-mono">{fmt.money(p.price)}</div>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5">
                    {/* Quota Progress */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                      <span>
                        {t("pkg.sold")}: <b className="text-foreground">{p.sold}</b>/{p.available} suất
                      </span>
                      <span className={`font-bold ${remain === 0 ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                        {remain > 0 ? `${remain} còn lại` : "Hết suất"}
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden mb-4">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${soldPct}%`, background: "var(--gradient-primary)" }}
                      />
                    </div>

                    {/* In-Kind Description */}
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

                    {/* Benefits List */}
                    <div className="text-xs font-bold text-foreground mb-2 flex items-center gap-1.5">
                      <Award className="h-3.5 w-3.5 text-primary" />
                      <span>{t("pkg.benefits")} ({p.benefits.length}):</span>
                    </div>
                    <ul className="space-y-2 text-xs text-muted-foreground">
                      {p.benefits.map((b, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check
                            className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5 stroke-[3]"
                            aria-hidden="true"
                          />
                          <span className="leading-snug">{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Card Footer: Quick Actions */}
                <div className="p-4 border-t border-border bg-muted/20 flex items-center justify-between">
                  <span className="text-[11px] font-medium text-muted-foreground">
                    Hạn mức: {fmt.money(p.price * p.available)}
                  </span>
                  <button
                    onClick={() => {
                      setEditingPkg(p);
                      setPkgModalOpen(true);
                    }}
                    className="text-xs font-bold text-primary hover:underline cursor-pointer"
                  >
                    Chỉnh sửa gói →
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {filteredPackages.length > 0 && (
        <div className="mt-6 rounded-2xl border border-border bg-card p-4 shadow-sm">
          <Pagination
            page={page}
            pageCount={Math.max(1, Math.ceil(filteredPackages.length / pageSize))}
            pageSize={pageSize}
            total={filteredPackages.length}
            from={(page - 1) * pageSize + 1}
            to={Math.min(page * pageSize, filteredPackages.length)}
            pageSizeOptions={[8, 16, 24, 48]}
            onPage={setPage}
            onPageSize={(s) => {
              setPageSize(s);
              setPage(1);
            }}
          />
        </div>
      )}

      {/* Package Creation & Edit Modal */}
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
    </AppShell>
  );
}
