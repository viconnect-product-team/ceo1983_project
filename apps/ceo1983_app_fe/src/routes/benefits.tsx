import { createFileRoute } from "@tanstack/react-router";
import {
  Award,
  Pencil,
  Plus,
  Trash2,
  Search,
  LayoutGrid,
  List,
  Trophy,
  Sparkles,
  Gift,
  Send,
  CheckCircle2,
  Crown,
  Handshake,
  Calendar,
  UserPlus,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { useEffect, useState, useMemo, useCallback } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/dashboard/AppShell";
import { Card, PageHeader, StatCard } from "@/components/dashboard/PageKit";
import { CrudModal, type CrudField, type CrudValues } from "@/components/dashboard/CrudModal";
import { useRole } from "@/hooks/use-role";
import { useTableControls } from "@/hooks/use-table-controls";
import { Pagination } from "@/components/dashboard/DataTablePagination";
import { fetchNestApi } from "@/lib/api-client";
import { type AdminBenefit } from "@/lib/benefits.functions";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/benefits")({
  component: BenefitsAdminPage,
});

type RewardCategory = "top_connections" | "top_opportunities" | "top_events_meetings" | "top_referrals";

interface TopRankedMember {
  rank: number;
  id?: string;
  code?: string;
  name: string;
  company: string;
  role?: string;
  department?: string;
  dept?: string;
  score?: string;
  connectionsCount?: number;
  publicOppsShared?: number;
  eventsAttended?: number;
  referralsCount?: number;
  metric?: number;
  phone?: string;
  avatar?: string;
  tier?: string;
  tierCode?: string;
  badgeColor?: string;
}

function BenefitsAdminPage() {
  const t = useT();
  const { isAdmin, loading: roleLoading } = useRole();
  const [activeMainTab, setActiveMainTab] = useState<"top10_rewards" | "benefits_crud">("top10_rewards");

  // State cho quyền lợi (CRUD cơ bản)
  const [benefits, setBenefits] = useState<AdminBenefit[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AdminBenefit | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [view, setView] = useState<"table" | "cards">("table");
  const [q, setQ] = useState("");

  // State cho chức năng Khen Thưởng Top 10 Thống Kê
  const [period, setPeriod] = useState<"month" | "quarter" | "year">("month");
  const [selectedRewardCat, setSelectedRewardCat] = useState<RewardCategory>("top_connections");
  const [analyticsOverview, setAnalyticsOverview] = useState<any>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [rewardingMember, setRewardingMember] = useState<TopRankedMember | null>(null);
  const [rewardModalOpen, setRewardModalOpen] = useState(false);
  const [rewardVoucherTitle, setRewardVoucherTitle] = useState("Voucher Quà Tặng Vinh Danh Top 10");
  const [rewardVoucherValue, setRewardVoucherValue] = useState("2.000.000 VNĐ");
  const [rewardVoucherCode, setRewardVoucherCode] = useState("CEO1983-TOP10");

  const loadBenefits = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchNestApi<AdminBenefit[]>("/members/benefits/admin");
      if (Array.isArray(res)) {
        setBenefits(res);
      }
    } catch (err) {
      console.error("[Benefits] Failed to load benefits:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Gọi API lấy dữ liệu Top 10 Thống Kê thực tế từ NestJS
  const loadAnalyticsOverview = useCallback(async () => {
    setLoadingAnalytics(true);
    try {
      const res = await fetchNestApi<any>(`/analytics/overview?period=${period}`);
      if (res && res.ok) {
        setAnalyticsOverview(res);
      }
    } catch (err) {
      console.warn("Failed to fetch analytics overview for rewards:", err);
    } finally {
      setLoadingAnalytics(false);
    }
  }, [period]);

  useEffect(() => {
    loadBenefits();
  }, [loadBenefits]);

  useEffect(() => {
    loadAnalyticsOverview();
  }, [loadAnalyticsOverview]);

  const notifyBenefitsUpdated = () => window.dispatchEvent(new CustomEvent("benefits-updated"));
  const reload = () => loadBenefits();

  // Danh sách Top 10 hội viên theo danh mục thống kê
  const currentCategoryTop10 = useMemo<TopRankedMember[]>(() => {
    if (!analyticsOverview) return [];
    let list: TopRankedMember[] = [];
    if (selectedRewardCat === "top_connections") {
      list = analyticsOverview.topConnections || analyticsOverview.categories?.topConnections?.data || [];
    } else if (selectedRewardCat === "top_opportunities") {
      list = analyticsOverview.topOpportunities || analyticsOverview.categories?.topOpportunities?.data || [];
    } else if (selectedRewardCat === "top_events_meetings") {
      list = analyticsOverview.topEventsMeetings || analyticsOverview.categories?.topEventsMeetings?.data || [];
    } else if (selectedRewardCat === "top_referrals") {
      list = analyticsOverview.topReferrals || analyticsOverview.categories?.topReferrals?.data || [];
    }

    // Gán tier và fallback rank 1-10 nếu thiếu
    return list.slice(0, 10).map((m, idx) => ({
      ...m,
      rank: m.rank || idx + 1,
      tier:
        idx === 0
          ? "Kim Cương 💎"
          : idx === 1
          ? "Bạch Kim 🪙"
          : idx === 2
          ? "Vàng 🥇"
          : "Top 10 Xuất Sắc 🌟",
    }));
  }, [analyticsOverview, selectedRewardCat]);

  // Hành động: Khen thưởng hội viên top 10
  const handleOpenRewardModal = (memberItem: TopRankedMember) => {
    setRewardingMember(memberItem);
    const categoryName =
      selectedRewardCat === "top_connections"
        ? "Top Kết Nối Giao Thương"
        : selectedRewardCat === "top_opportunities"
        ? "Top Chia Sẻ Cơ Hội B2B"
        : selectedRewardCat === "top_events_meetings"
        ? "Top Tham Gia Sự Kiện & Tương Tác"
        : "Top Giới Thiệu Hội Viên";
    setRewardVoucherTitle(`Khen thưởng ${memberItem.tier}: ${categoryName}`);
    setRewardVoucherCode(`CEO1983-TOP${memberItem.rank}-${Date.now().toString().slice(-4)}`);
    setRewardModalOpen(true);
  };

  const handleConfirmReward = async () => {
    if (!rewardingMember) return;
    try {
      await fetchNestApi("/feed", {
        method: "POST",
        body: JSON.stringify({
          title: `🏆 VINH DANH & KHEN THƯỞNG: ${rewardingMember.name} đạt ${rewardingMember.tier}`,
          content: `Ban Chấp Hành CLB Doanh Nhân CEO 1983 trân trọng vinh danh và trao tặng phần thưởng: ${rewardVoucherTitle} (Trị giá ${rewardVoucherValue}) tới CEO ${rewardingMember.name} (${rewardingMember.company}) vì thành tích xuất sắc đứng Top ${rewardingMember.rank} thống kê toàn hiệp hội!`,
          category: "HONOR",
          department: "Ban Thi Đua Khen Thưởng",
        }),
      }).catch(() => {});

      // Ghi nhận audit log thi đua khen thưởng để báo cáo & lưu vết hệ thống
      await fetchNestApi("/admin/audit-logs", {
        method: "POST",
        body: JSON.stringify({
          action: "reward_awarded",
          targetType: "member",
          targetId: rewardingMember.id || (rewardingMember as any).code || rewardingMember.name,
          metadata: {
            member: rewardingMember.name,
            tier: rewardingMember.tier,
            voucherTitle: rewardVoucherTitle,
            voucherCode: rewardVoucherCode,
            voucherValue: rewardVoucherValue,
            category: selectedRewardCat,
            period,
          },
        }),
      }).catch(() => {});

      toast.success(
        `✓ Đã trao thưởng thành công cho CEO ${rewardingMember.name}! Mẫu quà tặng & mã ưu đãi đã được lưu vào hệ thống.`
      );
      setRewardModalOpen(false);
      void loadAnalyticsOverview();
      window.dispatchEvent(new CustomEvent("benefits-updated"));
      window.dispatchEvent(new CustomEvent("vba:conversation_updated"));
    } catch {
      toast.error("Không thể hoàn tất trao thưởng lúc này");
    }
  };

  const filteredBenefits = useMemo(() => {
    const ql = q.trim().toLowerCase();
    if (!ql) return benefits;
    return benefits.filter(
      (b) =>
        b.titleVi.toLowerCase().includes(ql) ||
        b.titleEn.toLowerCase().includes(ql) ||
        b.descVi.toLowerCase().includes(ql) ||
        b.descEn.toLowerCase().includes(ql)
    );
  }, [benefits, q]);

  const accessors = useMemo(
    () => ({
      titleVi: (b: AdminBenefit) => b.titleVi,
      titleEn: (b: AdminBenefit) => b.titleEn,
      sortOrder: (b: AdminBenefit) => b.sortOrder,
    }),
    []
  );

  const tc = useTableControls(filteredBenefits, accessors, {
    initialPageSize: 10,
    initialSortKey: "sortOrder",
    initialSortDir: "asc",
  });

  const fields: CrudField[] = [
    { name: "titleVi", label: t("benefits.col.titleVi"), type: "text", required: true },
    { name: "titleEn", label: t("benefits.col.titleEn"), type: "text" },
    { name: "descVi", label: t("benefits.col.descVi"), type: "text" },
    { name: "descEn", label: t("benefits.col.descEn"), type: "text" },
    { name: "sortOrder", label: t("benefits.col.sortOrder"), type: "number" },
  ];

  const onSubmit = async (v: CrudValues) => {
    setSubmitting(true);
    try {
      if (editing) {
        await fetchNestApi(`/members/benefits/admin/${editing.id}`, {
          method: "PUT",
          body: JSON.stringify(v),
        });
        toast.success(t("common.updated"));
      } else {
        await fetchNestApi("/members/benefits/admin", {
          method: "POST",
          body: JSON.stringify(v),
        });
        toast.success(t("common.created"));
      }
      setOpen(false);
      setEditing(null);
      reload();
      notifyBenefitsUpdated();
    } catch {
      toast.error(t("common.saveError"));
    } finally {
      setSubmitting(false);
    }
  };

  const onDelete = async (b: AdminBenefit) => {
    if (!window.confirm(t("common.confirmDelete", { name: b.titleVi }))) return;
    setDeletingId(b.id);
    try {
      await fetchNestApi(`/members/benefits/admin/${b.id}`, {
        method: "DELETE",
      });
      toast.success(t("common.deletedToast"));
      reload();
      notifyBenefitsUpdated();
    } catch {
      toast.error(t("common.deleteError"));
    } finally {
      setDeletingId(null);
    }
  };

  if (!roleLoading && !isAdmin) {
    return (
      <AppShell>
        <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
          <Award className="mb-3 h-8 w-8 text-muted-foreground" />
          <h2 className="text-lg font-semibold text-foreground">{t("benefits.title")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t("common.forbidden")}</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageHeader
        title="Khen Thưởng & Danh Hiệu Hội Viên"
        subtitle="Vinh danh và trao thưởng trực tiếp cho Top 10 cá nhân xuất sắc nhất từ các danh mục thống kê CLB CEO 1983"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {/* Bộ chuyển đổi 2 Tab lớn */}
            <div className="inline-flex rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 p-1 shadow-xs">
              <button
                type="button"
                onClick={() => setActiveMainTab("top10_rewards")}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                  activeMainTab === "top10_rewards"
                    ? "bg-[#003B95] text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                <Trophy className="h-3.5 w-3.5 text-amber-400" />
                <span>Khen Thưởng Top 10 Thống Kê</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveMainTab("benefits_crud")}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                  activeMainTab === "benefits_crud"
                    ? "bg-[#003B95] text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                <Award className="h-3.5 w-3.5" />
                <span>Danh Mục Quyền Lợi Hiệp Hội</span>
              </button>
            </div>

            {activeMainTab === "benefits_crud" && (
              <button
                onClick={() => {
                  setEditing(null);
                  setOpen(true);
                }}
                className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-md bg-[#003B95] hover:bg-[#002B70] transition cursor-pointer"
              >
                <Plus className="h-4 w-4 text-amber-400" />
                <span>{t("benefits.create")}</span>
              </button>
            )}
          </div>
        }
      />

      {/* ══════════════════════════════════════════════════════════════
          TAB 1: KHEN THƯỞNG TOP 10 TỪ CÁC DANH MỤC THỐNG KÊ (YÊU CẦU 3)
          ══════════════════════════════════════════════════════════════ */}
      {activeMainTab === "top10_rewards" ? (
        <div className="space-y-6">
          {/* Header Bar lọc kỳ và chọn 4 danh mục thống kê */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1">
                Danh Mục Khen Thưởng:
              </span>
              {[
                { id: "top_connections", label: "Top Kết Nối", icon: Handshake },
                { id: "top_opportunities", label: "Top Chia Sẻ Cơ Hội", icon: Sparkles },
                { id: "top_events_meetings", label: "Top Sự Kiện & Tương Tác", icon: Calendar },
                { id: "top_referrals", label: "Top Người Giới Thiệu", icon: UserPlus },
              ].map((c) => {
                const Icon = c.icon;
                const isSelected = selectedRewardCat === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedRewardCat(c.id as RewardCategory)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#003B95] text-white shadow-md shadow-blue-900/20"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                    }`}
                  >
                    <Icon className="size-3.5 text-amber-400" />
                    <span>{c.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <span className="text-[11px] font-bold text-slate-500 px-2">Kỳ:</span>
              {[
                { id: "month", label: "Tháng này" },
                { id: "quarter", label: "Quý này" },
                { id: "year", label: "Cả năm" },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPeriod(p.id as any)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    period === p.id
                      ? "bg-white dark:bg-slate-700 text-[#003B95] dark:text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Bảng Top 10 Gọi API Thống Kê Thực Tế */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Crown className="size-5 text-amber-500" />
                <h3 className="text-sm font-extrabold uppercase tracking-wide text-slate-900 dark:text-white">
                  Danh Sách Top 10 Thành Viên Đủ Điều Kiện Khen Thưởng ({currentCategoryTop10.length}/10)
                </h3>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                Gọi Tự Động Từ API /analytics/overview
              </span>
            </div>

            {loadingAnalytics ? (
              <div className="py-20 text-center text-xs text-slate-400">
                Đang nạp dữ liệu Top 10 từ máy chủ thống kê...
              </div>
            ) : currentCategoryTop10.length === 0 ? (
              <div className="py-16 text-center text-xs text-slate-400">
                Chưa có dữ liệu hội viên trong kỳ thống kê này.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-800 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                      <th className="py-3 px-4 w-16 text-center">Hạng</th>
                      <th className="py-3 px-4">Hội viên / Doanh nghiệp</th>
                      <th className="py-3 px-4">Ban chuyên môn</th>
                      <th className="py-3 px-4">Thành tích ghi nhận</th>
                      <th className="py-3 px-4">Danh hiệu thi đua</th>
                      <th className="py-3 px-4 text-right">Thao tác khen thưởng</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {currentCategoryTop10.map((m) => {
                      const isTop1 = m.rank === 1;
                      const isTop2 = m.rank === 2;
                      const isTop3 = m.rank === 3;
                      const scoreLabel =
                        m.score ||
                        (selectedRewardCat === "top_connections"
                          ? `${m.connectionsCount || 0} Lượt kết nối`
                          : selectedRewardCat === "top_opportunities"
                          ? `${m.publicOppsShared || 0} Cơ hội public`
                          : selectedRewardCat === "top_events_meetings"
                          ? `${m.eventsAttended || 0} Buổi họp & tương tác`
                          : `${m.referralsCount || m.connectionsCount || 0} Hội viên đã giới thiệu`);

                      return (
                        <tr
                          key={`${m.name}-${m.rank}`}
                          className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                            isTop1
                              ? "bg-amber-500/5 font-semibold"
                              : isTop2
                              ? "bg-slate-400/5"
                              : isTop3
                              ? "bg-amber-700/5"
                              : ""
                          }`}
                        >
                          <td className="py-3.5 px-4 text-center">
                            <span
                              className={`size-7 mx-auto rounded-full flex items-center justify-center font-black text-xs shadow-xs ${
                                isTop1
                                  ? "bg-amber-400 text-slate-950 ring-2 ring-amber-300"
                                  : isTop2
                                  ? "bg-slate-300 text-slate-900"
                                  : isTop3
                                  ? "bg-amber-700 text-white"
                                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                              }`}
                            >
                              {m.rank}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={
                                  m.avatar ||
                                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                    m.name
                                  )}&background=003B95&color=fff`
                                }
                                alt={m.name}
                                className="size-9 rounded-full object-cover border border-slate-200 dark:border-slate-700 shadow-2xs"
                              />
                              <div>
                                <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                  <span>{m.name}</span>
                                  {isTop1 && <span>👑</span>}
                                </h4>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                  {m.company || "Doanh nghiệp CEO 1983"}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                            {m.dept || m.department || "Ban Xúc Tiến Thương Mại"}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-[#003B95] dark:text-cyan-400">
                            {scoreLabel}
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10.5px] font-black uppercase tracking-wider inline-flex items-center gap-1 ${
                                isTop1
                                  ? "bg-cyan-500/15 text-cyan-600 dark:text-cyan-300 border border-cyan-500/30"
                                  : isTop2
                                  ? "bg-slate-300/30 text-slate-700 dark:text-slate-200 border border-slate-400/30"
                                  : isTop3
                                  ? "bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30"
                                  : "bg-blue-500/10 text-blue-600 dark:text-blue-300 border border-blue-500/20"
                              }`}
                            >
                              {m.tier}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleOpenRewardModal(m)}
                                className="px-3 py-1.5 rounded-xl bg-[#003B95] hover:bg-[#002B70] text-white font-black text-xs shadow-xs transition active:scale-95 flex items-center gap-1.5 cursor-pointer"
                              >
                                <Gift className="size-3.5 text-slate-950" />
                                <span>Trao Khen Thưởng</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ══════════════════════════════════════════════════════════════
           TAB 2: QUẢN TRỊ DANH MỤC QUYỀN LỢI HIỆP HỘI
           ══════════════════════════════════════════════════════════════ */
        <div className="space-y-5">
          <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <StatCard
              label={t("benefits.kpi.total")}
              value={benefits.length}
              icon={<Award className="h-4 w-4" />}
            />
          </div>

          <div className="mb-5 flex flex-wrap items-center gap-3">
            <div className="relative min-w-[260px] flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Tìm kiếm quyền lợi theo tên, mô tả..."
                className="h-10 w-full rounded-lg border border-border bg-card pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground shadow-[var(--shadow-card)] focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
              />
            </div>
          </div>

          {loading ? (
            <p className="py-10 text-center text-sm text-muted-foreground">{t("common.empty")}</p>
          ) : tc.pageRows.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">{t("benefits.empty")}</p>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]">
              <div className="overflow-x-auto relative">
                <table className="w-full text-sm border-separate border-spacing-0">
                  <thead>
                    <tr className="border-b border-border bg-secondary/80 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      <th className="sticky left-0 z-20 w-[56px] min-w-[56px] max-w-[56px] bg-secondary px-3 py-3 text-center border-r border-b border-border">
                        STT
                      </th>
                      <th className="sticky left-[56px] z-20 min-w-[100px] bg-secondary px-4 py-3 border-r border-b border-border">
                        Mã
                      </th>
                      <th className="px-4 py-3 border-b border-border">Tiêu đề (Tiếng Việt)</th>
                      <th className="px-4 py-3 border-b border-border">Mô tả</th>
                      <th className="px-4 py-3 border-b border-border text-center">Thứ tự</th>
                      <th className="sticky right-0 z-20 min-w-[120px] bg-secondary px-4 py-3 text-right border-l border-b border-border">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {tc.pageRows.map((b, idx) => (
                      <tr key={b.id} className="group border-b border-border transition hover:bg-secondary/60">
                        <td className="sticky left-0 z-10 w-[56px] bg-card px-3 py-3 text-center text-xs font-medium text-muted-foreground border-r border-b border-border">
                          {(tc.page - 1) * tc.pageSize + idx + 1}
                        </td>
                        <td className="sticky left-[56px] z-10 min-w-[100px] bg-card px-4 py-3 font-mono text-[12px] font-semibold text-primary border-r border-b border-border">
                          QL-{String(b.sortOrder).padStart(3, "0")}
                        </td>
                        <td className="px-4 py-3 font-semibold text-foreground border-b border-border">
                          {b.titleVi}
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground border-b border-border max-w-[300px] truncate">
                          {b.descVi || b.descEn || "—"}
                        </td>
                        <td className="px-4 py-3 text-center font-mono text-xs text-foreground border-b border-border">
                          #{b.sortOrder}
                        </td>
                        <td className="sticky right-0 z-10 min-w-[120px] bg-card px-4 py-3 text-right border-l border-b border-border">
                          <div className="inline-flex items-center gap-1">
                            <button
                              onClick={() => {
                                setEditing(b);
                                setOpen(true);
                              }}
                              className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                              {t("common.edit")}
                            </button>
                            <button
                              onClick={() => onDelete(b)}
                              disabled={deletingId === b.id}
                              className="inline-flex items-center gap-1 rounded-lg border border-destructive/20 bg-background px-2.5 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              {t("common.delete")}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination
                page={tc.page}
                pageCount={tc.pageCount}
                pageSize={tc.pageSize}
                total={tc.total}
                from={tc.from}
                to={tc.to}
                onPage={tc.setPage}
                onPageSize={tc.setPageSize}
              />
            </div>
          )}
        </div>
      )}

      {/* MODAL TRAO KHEN THƯỞNG CHO HỘI VIÊN TOP 10 */}
      {rewardModalOpen && rewardingMember && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 text-slate-900 dark:text-white shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Trophy className="size-5 text-amber-500" />
                <h3 className="text-base font-extrabold uppercase tracking-wide">
                  Trao Khen Thưởng Top 10 Thống Kê
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setRewardModalOpen(false)}
                className="size-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Thông tin hội viên được khen thưởng */}
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-3">
              <img
                src={
                  rewardingMember.avatar ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    rewardingMember.name
                  )}&background=003B95&color=fff`
                }
                alt={rewardingMember.name}
                className="size-12 rounded-full object-cover border-2 border-amber-400 shadow-sm"
              />
              <div>
                <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>{rewardingMember.name}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black">
                    Hạng {rewardingMember.rank}
                  </span>
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400">{rewardingMember.company}</p>
                <p className="text-[11px] font-bold text-[#003B95] dark:text-cyan-400 mt-0.5">
                  {rewardingMember.tier}
                </p>
              </div>
            </div>

            {/* Form cấu hình phần thưởng */}
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Tiêu đề danh hiệu / Khen thưởng
                </label>
                <input
                  type="text"
                  value={rewardVoucherTitle}
                  onChange={(e) => setRewardVoucherTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-background px-3 py-2 text-xs font-semibold outline-none focus:ring-1 focus:ring-[#003B95]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Trị giá phần thưởng / Voucher đặc quyền
                </label>
                <input
                  type="text"
                  value={rewardVoucherValue}
                  onChange={(e) => setRewardVoucherValue(e.target.value)}
                  placeholder="VD: 5.000.000 VNĐ hoặc Giảm 50% Phí Hội Nghị"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-background px-3 py-2 text-xs font-bold outline-none focus:ring-1 focus:ring-[#003B95]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Mã Voucher cấp phát riêng
                </label>
                <input
                  type="text"
                  value={rewardVoucherCode}
                  onChange={(e) => setRewardVoucherCode(e.target.value.toUpperCase())}
                  className="w-full font-mono uppercase rounded-xl border border-slate-200 dark:border-slate-700 bg-background px-3 py-2 text-xs font-bold text-amber-600 dark:text-amber-400 outline-none focus:ring-1 focus:ring-[#003B95]"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setRewardModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmReward}
                className="px-4 py-2 rounded-xl bg-[#003B95] hover:bg-[#002B70] text-white text-xs font-black shadow-md transition active:scale-95 flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="size-4" />
                <span>Xác Nhận Trao Thưởng & Phát Thanh</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CRUD Modal cho Danh Mục Quyền Lợi */}
      <CrudModal
        open={open}
        onClose={() => {
          setOpen(false);
          setEditing(null);
        }}
        title={editing ? t("benefits.modal.edit") : t("benefits.modal.create")}
        fields={fields}
        initial={editing ? { ...editing } : undefined}
        onSubmit={onSubmit}
        submitting={submitting}
        submitLabel={editing ? t("common.save") : t("common.create")}
        cancelLabel={t("common.cancel")}
      />
    </AppShell>
  );
}
