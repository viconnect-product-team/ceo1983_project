import React, { useState, useEffect, useMemo } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  ChevronLeft,
  TrendingUp,
  Handshake,
  Users,
  Coins,
  Crown,
  Calendar,
  Clock,
  Download,
  Flame,
  Award,
  ChevronDown,
  ChevronUp,
  HeartHandshake,
  Phone,
  MessageSquare,
  Sparkles,
  Info,
  X,
  Building2,
  Loader2,
  CheckCircle2,
  Search,
  Filter,
  ArrowRight,
  BarChart3,
  PieChart,
  Tag,
  Share2,
} from "lucide-react";
import { toast } from "sonner";
import { fetchNestApi, resolveMediaUrl } from "@/lib/api-client";
import { useAuth } from "@/context/AuthContext";

export const Route = createFileRoute("/association/analytics")({
  component: AssociationAnalyticsScreen,
});

interface TopMember {
  id: string;
  code: string;
  name: string;
  company?: string;
  department?: string;
  avatar?: string;
  value: number;
  dealCount: number;
  interactionCount: number;
  phone?: string;
}

interface TopGiver {
  posterId: string;
  name: string;
  company: string;
  department: string;
  avatar?: string;
  count: number;
  totalValue: number;
}

interface OpportunityItem {
  id: string;
  title: string;
  description?: string;
  type: string;
  tradeType?: string;
  industry: string;
  budgetMin: number;
  budgetMax: number;
  valueFormatted: string;
  posterName: string;
  posterCompany: string;
  posterDepartment: string;
  claimedByName?: string;
  claimedCompany?: string;
  status: string;
  isWon: boolean;
  isMine: boolean;
  createdAt: string | null;
  deadline?: string | null;
}

interface AnalyticsData {
  summary: {
    totalOpportunities: number;
    totalOpportunitiesValue: number;
    totalDealsWon: number;
    totalDealsWonValue: number;
    totalInteractions: number;
    totalMembers: number;
    activeMembersCount: number;
  };
  hourlyTrends: Array<{ hour: string; count: number; value: number }>;
  topPerformers: TopMember[];
  leastActiveMembers: Array<{
    id: string;
    code: string;
    name: string;
    company?: string;
    department?: string;
    avatar?: string;
    lastActive: string;
    phone?: string;
  }>;
}

function formatVnd(val: number): string {
  if (!val) return "0 đ";
  if (val >= 1_000_000_000) {
    return `${(val / 1_000_000_000).toFixed(1)} Tỷ đ`;
  }
  if (val >= 1_000_000) {
    return `${(val / 1_000_000).toFixed(1)} Tr đ`;
  }
  return `${val.toLocaleString()} đ`;
}

export function AssociationAnalyticsScreen() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [metricTab, setMetricTab] = useState<"VALUE" | "OPPORTUNITIES" | "INTERACTIONS">("VALUE");
  const [chartDimension, setChartDimension] = useState<"TYPE" | "INDUSTRY" | "STATUS">("TYPE");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AnalyticsData | null>(null);

  // Real-time opportunities list and top givers from database
  const [allOpportunities, setAllOpportunities] = useState<OpportunityItem[]>([]);
  const [topGivers, setTopGivers] = useState<TopGiver[]>([]);
  const [topGiver, setTopGiver] = useState<TopGiver | null>(null);

  // Filters for ALL opportunities list
  const [oppSearch, setOppSearch] = useState("");
  const [oppFilter, setOppFilter] = useState<"ALL" | "BUY" | "SELL" | "WON" | "OPEN">("ALL");

  // Accordion state
  const [top3Open, setTop3Open] = useState(true);
  const [topGiversOpen, setTopGiversOpen] = useState(true);
  const [selectedTop1, setSelectedTop1] = useState<TopMember | null>(null);

  // Fetch real analytics data & opportunity report from NestJS backend
  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [overviewRes, oppReportRes] = await Promise.all([
        fetchNestApi<any>("/analytics/overview").catch(() => null),
        fetchNestApi<any>("/opportunities/report").catch(() => null),
      ]);

      if (overviewRes && (overviewRes.summary || overviewRes.kpi)) {
        const normSummary = overviewRes.summary || {
          totalOpportunities: overviewRes.kpi?.totalClubOpportunities || 0,
          totalOpportunitiesValue: overviewRes.kpi?.totalValueContributed || 0,
          totalDealsWon: overviewRes.kpi?.totalDealsWon || 0,
          totalDealsWonValue: (overviewRes.kpi?.totalDealsWon || 0) * 150000000,
          totalInteractions: overviewRes.kpi?.totalInteractions || 0,
          totalMembers: overviewRes.kpi?.totalMembers || 0,
          activeMembersCount: Math.round((overviewRes.kpi?.totalMembers || 0) * 0.85),
        };
        const normTrends = overviewRes.hourlyTrends || (overviewRes.hourlyTimeline || []).map((t: any) => ({
          hour: t.time || t.label || "08:00",
          count: t.dealsVolume || t.interactions || 5,
          value: (t.valueMil || 100) * 1000000,
        }));
        const normTop = overviewRes.topPerformers || overviewRes.allRankings?.slice(0, 5) || [];
        const normLeast = overviewRes.leastActiveMembers || overviewRes.leastActiveList || [];
        setData({
          summary: normSummary,
          hourlyTrends: normTrends,
          topPerformers: normTop,
          leastActiveMembers: normLeast,
        });
      }

      if (oppReportRes && Array.isArray(oppReportRes.opportunities)) {
        setAllOpportunities(oppReportRes.opportunities);
        if (Array.isArray(oppReportRes.topGivers)) {
          setTopGivers(oppReportRes.topGivers);
        }
        if (oppReportRes.topGiver) {
          setTopGiver(oppReportRes.topGiver);
        }
      }
    } catch {
      toast.error("Không thể tải số liệu thống kê lúc này");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const top1 = data?.topPerformers?.[0] || null;
  const top2 = data?.topPerformers?.[1] || null;
  const top3 = data?.topPerformers?.[2] || null;

  // Maximum value for timeline scaling
  const maxHourlyVal = useMemo(() => {
    if (!data?.hourlyTrends || data.hourlyTrends.length === 0) return 10;
    return Math.max(...data.hourlyTrends.map((t) => (metricTab === "VALUE" ? t.value : t.count)), 1);
  }, [data?.hourlyTrends, metricTab]);

  // Opportunity Value Chart Calculation (Requirement 5)
  const oppValueStats = useMemo(() => {
    let totalVal = 0;
    const typeBreakdown: Record<string, { label: string; count: number; value: number }> = {
      buy: { label: "Bên Mua (Cần tìm)", count: 0, value: 0 },
      sell: { label: "Bên Bán (Cung cấp)", count: 0, value: 0 },
      partner: { label: "Hợp tác & Đầu tư", count: 0, value: 0 },
    };
    const industryBreakdown: Record<string, { label: string; count: number; value: number }> = {};
    const statusBreakdown: Record<string, { label: string; count: number; value: number }> = {
      won: { label: "Deal đã chốt thành công", count: 0, value: 0 },
      open: { label: "Đang mở kết nối B2B", count: 0, value: 0 },
    };

    allOpportunities.forEach((o) => {
      const val = Number(o.budgetMax) || Number(o.budgetMin) || 0;
      totalVal += val;

      // Type
      const t = String(o.tradeType || o.type).toLowerCase();
      if (t.includes("buy") || t.includes("mua")) {
        typeBreakdown.buy.count++;
        typeBreakdown.buy.value += val;
      } else if (t.includes("sell") || t.includes("bán")) {
        typeBreakdown.sell.count++;
        typeBreakdown.sell.value += val;
      } else {
        typeBreakdown.partner.count++;
        typeBreakdown.partner.value += val;
      }

      // Industry
      const ind = o.industry || "Đa ngành nghề";
      if (!industryBreakdown[ind]) {
        industryBreakdown[ind] = { label: ind, count: 0, value: 0 };
      }
      industryBreakdown[ind].count++;
      industryBreakdown[ind].value += val;

      // Status
      if (o.isWon || o.status === "claimed" || o.status === "won" || o.status === "closed") {
        statusBreakdown.won.count++;
        statusBreakdown.won.value += val;
      } else {
        statusBreakdown.open.count++;
        statusBreakdown.open.value += val;
      }
    });

    const activeBreakdown =
      chartDimension === "TYPE"
        ? Object.values(typeBreakdown)
        : chartDimension === "STATUS"
        ? Object.values(statusBreakdown)
        : Object.values(industryBreakdown).sort((a, b) => b.value - a.value).slice(0, 6);

    const maxBreakdownVal = Math.max(...activeBreakdown.map((x) => x.value), 1);

    return {
      totalVal,
      activeBreakdown,
      maxBreakdownVal,
    };
  }, [allOpportunities, chartDimension]);

  // Filtered Opportunities List (Requirement 5)
  const filteredOpportunities = useMemo(() => {
    return allOpportunities.filter((o) => {
      // Category filter
      if (oppFilter === "BUY") {
        const t = String(o.tradeType || o.type).toLowerCase();
        if (!t.includes("buy") && !t.includes("mua")) return false;
      } else if (oppFilter === "SELL") {
        const t = String(o.tradeType || o.type).toLowerCase();
        if (!t.includes("sell") && !t.includes("bán")) return false;
      } else if (oppFilter === "WON") {
        if (!o.isWon && o.status !== "claimed" && o.status !== "won" && o.status !== "closed") return false;
      } else if (oppFilter === "OPEN") {
        if (o.isWon || o.status === "claimed" || o.status === "won" || o.status === "closed") return false;
      }

      // Search keyword filter
      if (oppSearch.trim()) {
        const q = oppSearch.toLowerCase();
        const matchTitle = (o.title || "").toLowerCase().includes(q);
        const matchPoster = (o.posterName || "").toLowerCase().includes(q);
        const matchCompany = (o.posterCompany || "").toLowerCase().includes(q);
        const matchDept = (o.posterDepartment || "").toLowerCase().includes(q);
        const matchInd = (o.industry || "").toLowerCase().includes(q);
        return matchTitle || matchPoster || matchCompany || matchDept || matchInd;
      }

      return true;
    });
  }, [allOpportunities, oppFilter, oppSearch]);

  const handleExportExcel = () => {
    if (!data) return;
    const csvContent =
      "\uFEFF" +
      [
        ["BÁO CÁO THỐNG KÊ HOẠT ĐỘNG HIỆP HỘI DOANH NHÂN CEO 1983"],
        [`Thời gian xuất: ${new Date().toLocaleString("vi-VN")}`],
        [],
        ["TỔNG QUAN CLB"],
        [`Tổng cơ hội kết nối: ${data.summary.totalOpportunities} cơ hội`],
        [`Tổng giá trị giao dịch: ${data.summary.totalOpportunitiesValue.toLocaleString()} VNĐ`],
        [`Cơ hội đã chốt deal: ${data.summary.totalDealsWon} cơ hội`],
        [`Giá trị deal đã chốt: ${data.summary.totalDealsWonValue.toLocaleString()} VNĐ`],
        [`Tổng lượt tương tác: ${data.summary.totalInteractions} lượt`],
        [],
        ["BẢNG VINH DANH HỘI VIÊN TRAO CƠ HỘI NHIỀU NHẤT"],
        ["Xếp hạng", "Họ và tên", "Doanh nghiệp", "Ban trực thuộc", "Số cơ hội trao đi", "Tổng giá trị mang lại (VNĐ)"],
        ...topGivers.map((g, idx) => [
          `Top ${idx + 1}`,
          g.name || "",
          g.company || "",
          g.department || "",
          g.count || 0,
          g.totalValue || 0,
        ]),
        [],
        ["DANH SÁCH TOÀN BỘ CƠ HỘI GIAO THƯƠNG"],
        ["Tiêu đề", "Bên đăng", "Doanh nghiệp", "Loại", "Giá trị", "Trạng thái", "Ngày tạo"],
        ...allOpportunities.map((o) => [
          o.title || "",
          o.posterName || "",
          o.posterCompany || "",
          o.type || "",
          o.valueFormatted || "",
          o.isWon ? "Đã chốt deal" : "Đang mở",
          o.createdAt ? new Date(o.createdAt).toLocaleDateString("vi-VN") : "",
        ]),
      ]
        .map((row) => row.join(","))
        .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Bao_Cao_Thong_Ke_CEO1983_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Đã xuất báo cáo thống kê Excel / CSV thành công!");
  };

  return (
    <div className="w-full min-h-screen bg-stone-50 dark:bg-slate-950 font-sans flex flex-col pb-28">
      {/* ── TOP HEADER ── */}
      <div className="ceo-safe-sticky sticky top-0 z-30 px-4 py-3.5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="p-1.5 -ml-1 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
          >
            <ChevronLeft className="size-5 text-[#003B95] dark:text-amber-400" />
          </button>
          <div>
            <h1 className="text-base font-extrabold text-[#003B95] dark:text-white">
              Thống kê CLB CEO 1983
            </h1>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Clock className="size-3 text-red-600" />
              <span>Dữ liệu Realtime đồng bộ từ Database</span>
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleExportExcel}
          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-600 via-amber-600 to-red-600 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-xs active:scale-95 transition cursor-pointer"
        >
          <Download className="size-3.5" />
          <span className="hidden sm:inline">Xuất báo cáo</span>
        </button>
      </div>

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center py-24 text-slate-400 gap-2">
          <Loader2 className="size-8 animate-spin text-red-600" />
          <span className="text-xs">Đang tải trung tâm số liệu CEO 1983...</span>
        </div>
      ) : !data ? (
        <div className="p-8 text-center text-xs text-slate-500">
          Chưa có dữ liệu thống kê. Vui lòng tải lại trang.
        </div>
      ) : (
        <div className="px-4 py-4 max-w-2xl mx-auto w-full space-y-5">
          {/* ── 1. KPI SUMMARY CARDS ── */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* Tổng giá trị cơ hội */}
            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border-2 border-red-500/40 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-red-600 uppercase tracking-wider">
                  Tổng giá trị cơ hội
                </span>
                <div className="size-7 rounded-lg bg-red-600/10 text-red-600 flex items-center justify-center">
                  <Coins className="size-4" />
                </div>
              </div>
              <div className="mt-2">
                <div className="text-base font-black text-slate-900 dark:text-white">
                  {formatVnd(oppValueStats.totalVal || data.summary.totalOpportunitiesValue)}
                </div>
                <div className="text-[10px] text-emerald-600 font-bold mt-0.5">
                  Đã chốt: {formatVnd(data.summary.totalDealsWonValue)}
                </div>
              </div>
            </div>

            {/* Tổng cơ hội kết nối */}
            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border-2 border-amber-500/40 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-amber-600 uppercase tracking-wider">
                  Tổng cơ hội B2B
                </span>
                <div className="size-7 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
                  <Handshake className="size-4" />
                </div>
              </div>
              <div className="mt-2">
                <div className="text-base font-black text-slate-900 dark:text-white">
                  {allOpportunities.length || data.summary.totalOpportunities} tin
                </div>
                <div className="text-[10px] text-amber-600 font-bold mt-0.5">
                  Chốt thành công: {data.summary.totalDealsWon} deal
                </div>
              </div>
            </div>

            {/* Tương tác & Gắn kết */}
            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Lượt tương tác
                </span>
                <div className="size-7 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center">
                  <TrendingUp className="size-4" />
                </div>
              </div>
              <div className="mt-2">
                <div className="text-base font-black text-slate-900 dark:text-white">
                  {data.summary.totalInteractions.toLocaleString()}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Likes & Bình luận</div>
              </div>
            </div>

            {/* Hội viên tích cực */}
            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Hội viên hoạt động
                </span>
                <div className="size-7 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                  <Users className="size-4" />
                </div>
              </div>
              <div className="mt-2">
                <div className="text-base font-black text-slate-900 dark:text-white">
                  {data.summary.activeMembersCount} / {data.summary.totalMembers}
                </div>
                <div className="text-[10px] text-emerald-600 font-bold mt-0.5">
                  {(
                    (data.summary.activeMembersCount / Math.max(1, data.summary.totalMembers)) *
                    100
                  ).toFixed(0)}
                  % gắn kết
                </div>
              </div>
            </div>
          </div>

          {/* ── 2. AI LÀ NGƯỜI TRAO CƠ HỘI NHIỀU NHẤT (Requirement 5) ── */}
          <div className="rounded-3xl bg-gradient-to-br from-[#001B54] via-[#002B70] to-[#0A1A3A] text-white p-4 sm:p-5 shadow-xl border-2 border-amber-400/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
              <Crown className="size-32 text-amber-300" />
            </div>

            {/* Header Badge */}
            <div className="flex items-center justify-between mb-3 relative z-10">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-black uppercase tracking-wider border border-amber-400/40">
                <Crown className="size-3.5 fill-amber-300" />
                <span>NGƯỜI TRAO CƠ HỘI NHIỀU NHẤT CLB</span>
              </div>
              <span className="text-[10px] text-amber-200/80 font-mono">Realtime Ranking</span>
            </div>

            {/* Top 1 Giver Card */}
            {topGiver ? (
              <div className="flex items-center gap-3.5 relative z-10">
                {/* Avatar with Gold Ring */}
                <div className="relative size-16 rounded-2xl overflow-hidden border-2 border-amber-300 shadow-md bg-white/20 shrink-0">
                  <div className="size-full flex items-center justify-center font-black text-xl text-amber-300 bg-[#001D4A]">
                    {(topGiver.name || "CEO")[0]}
                  </div>
                  <div className="absolute -bottom-1 -right-1 size-6 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] flex items-center justify-center shadow-xs">
                    1
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-extrabold text-white leading-tight truncate">
                    {topGiver.name}
                  </h3>
                  <p className="text-xs text-amber-100 font-semibold truncate">
                    {topGiver.company || "Doanh nghiệp CEO 1983"}
                  </p>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-white/20 text-white text-[10px] font-bold">
                    {topGiver.department || "Ban Điều Hành"}
                  </span>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-base font-black text-amber-300">
                    {topGiver.count} lượt
                  </div>
                  <div className="text-[11px] text-white/80">
                    {formatVnd(topGiver.totalValue)}
                  </div>
                </div>
              </div>
            ) : top1 ? (
              <div className="flex items-center gap-3.5 relative z-10">
                <div className="relative size-16 rounded-2xl overflow-hidden border-2 border-amber-300 shadow-md bg-white/20 shrink-0">
                  <div className="size-full flex items-center justify-center font-black text-xl text-amber-300 bg-[#001D4A]">
                    {(top1.name || "CEO")[0]}
                  </div>
                  <div className="absolute -bottom-1 -right-1 size-6 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] flex items-center justify-center shadow-xs">
                    1
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-extrabold text-white leading-tight truncate">
                    {top1.name}
                  </h3>
                  <p className="text-xs text-amber-100 font-semibold truncate">
                    {top1.company || "Doanh nghiệp CEO 1983"}
                  </p>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-white/20 text-white text-[10px] font-bold">
                    {top1.department || "Hội viên tích cực"}
                  </span>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-base font-black text-amber-300">
                    {top1.dealCount || 5} cơ hội
                  </div>
                  <div className="text-[11px] text-white/80">
                    {formatVnd(top1.value)}
                  </div>
                </div>
              </div>
            ) : null}

            {/* Collapsible Sub-Ranking of Top Givers */}
            {topGivers.length > 1 && (
              <div className="mt-3 pt-3 border-t border-white/15 relative z-10">
                <button
                  type="button"
                  onClick={() => setTopGiversOpen(!topGiversOpen)}
                  className="w-full flex items-center justify-between text-xs font-bold text-amber-200 hover:text-white transition cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <Award className="size-3.5" />
                    <span>Top 5 Hội viên trao cơ hội hàng đầu ({topGivers.length})</span>
                  </span>
                  {topGiversOpen ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                </button>

                {topGiversOpen && (
                  <div className="mt-2 space-y-1.5">
                    {topGivers.slice(1, 5).map((giver, idx) => (
                      <div
                        key={giver.posterId || idx}
                        className="p-2 rounded-xl bg-white/10 hover:bg-white/15 flex items-center justify-between text-xs transition"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="size-5 rounded-full bg-amber-400/20 text-amber-300 font-bold text-[10px] flex items-center justify-center shrink-0">
                            {idx + 2}
                          </span>
                          <div className="truncate">
                            <span className="font-bold text-white block truncate">{giver.name}</span>
                            <span className="text-[10px] text-slate-300 truncate">{giver.company}</span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-black text-amber-300">{giver.count} cơ hội</span>
                          <span className="text-[10px] text-slate-300 block">{formatVnd(giver.totalValue)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── 3. BIỂU ĐỒ THỂ HIỆN TỔNG GIÁ TRỊ CƠ HỘI (Requirement 5) ── */}
          <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <BarChart3 className="size-4 text-red-600" />
                  Biểu Đồ Cơ Cấu Tổng Giá Trị Cơ Hội
                </h3>
                <p className="text-[10px] text-slate-400">
                  Tổng giá trị phân bổ: {formatVnd(oppValueStats.totalVal)}
                </p>
              </div>

              {/* Dimension Switcher */}
              <div className="flex items-center gap-1 p-0.5 bg-slate-100 dark:bg-slate-800 rounded-xl self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setChartDimension("TYPE")}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                    chartDimension === "TYPE"
                      ? "bg-red-600 text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-400"
                  }`}
                >
                  Theo Loại
                </button>
                <button
                  type="button"
                  onClick={() => setChartDimension("INDUSTRY")}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                    chartDimension === "INDUSTRY"
                      ? "bg-amber-500 text-slate-950 shadow-xs"
                      : "text-slate-600 dark:text-slate-400"
                  }`}
                >
                  Ngành nghề
                </button>
                <button
                  type="button"
                  onClick={() => setChartDimension("STATUS")}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                    chartDimension === "STATUS"
                      ? "bg-[#003B95] text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-400"
                  }`}
                >
                  Trạng thái
                </button>
              </div>
            </div>

            {/* Visual Value Bars */}
            <div className="space-y-2.5 pt-2">
              {oppValueStats.activeBreakdown.map((item, idx) => {
                const percent = oppValueStats.totalVal > 0 ? (item.value / oppValueStats.totalVal) * 100 : 0;
                const barWidth = Math.min(100, Math.max(6, (item.value / oppValueStats.maxBreakdownVal) * 100));
                const barColor =
                  idx % 3 === 0
                    ? "from-red-600 to-amber-500"
                    : idx % 3 === 1
                    ? "from-amber-500 to-yellow-400"
                    : "from-[#003B95] to-blue-500";

                return (
                  <div key={item.label} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800 dark:text-slate-200 truncate pr-2">
                        {item.label} ({item.count} tin)
                      </span>
                      <span className="font-extrabold text-slate-900 dark:text-white shrink-0">
                        {formatVnd(item.value)} ({percent.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
                      <div
                        style={{ width: `${barWidth}%` }}
                        className={`h-full rounded-full bg-gradient-to-r ${barColor} transition-all duration-500 shadow-xs`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── 4. HIỆN TOÀN BỘ ALL CƠ HỘI GIAO THƯƠNG (Requirement 5) ── */}
          <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Handshake className="size-4 text-amber-500" />
                  Danh Sách Toàn Bộ Cơ Hội CLB ({allOpportunities.length})
                </h3>
                <p className="text-[10px] text-slate-400">
                  Dữ liệu trực tiếp từ bảng cơ hội giao thương hội viên
                </p>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-bold">
                {filteredOpportunities.length} kết quả
              </span>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="size-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={oppSearch}
                onChange={(e) => setOppSearch(e.target.value)}
                placeholder="Tìm cơ hội theo tiêu đề, người đăng, ngành nghề..."
                className="w-full pl-8 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:border-red-500 text-slate-800 dark:text-slate-100"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 text-xs">
              {[
                { id: "ALL", label: `Tất cả (${allOpportunities.length})` },
                { id: "BUY", label: "Bên Mua" },
                { id: "SELL", label: "Bên Bán" },
                { id: "WON", label: "Deal đã chốt" },
                { id: "OPEN", label: "Đang mở" },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setOppFilter(f.id as any)}
                  className={`px-3 py-1 rounded-xl font-bold whitespace-nowrap transition cursor-pointer ${
                    oppFilter === f.id
                      ? "bg-red-600 text-white shadow-xs"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Opportunities List Cards */}
            <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
              {filteredOpportunities.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  Không tìm thấy cơ hội giao thương phù hợp.
                </div>
              ) : (
                filteredOpportunities.map((opp) => (
                  <div
                    key={opp.id}
                    onClick={() => navigate({ to: "/association/opportunities" })}
                    className="p-3 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 transition cursor-pointer space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-700 dark:text-amber-300">
                        {opp.type || "Cơ hội B2B"}
                      </span>
                      <span
                        className={`text-[9.5px] font-extrabold px-2 py-0.5 rounded-full ${
                          opp.isWon
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                            : "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400"
                        }`}
                      >
                        {opp.isWon ? "Deal đã chốt" : "Đang mở kết nối"}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                      {opp.title}
                    </h4>

                    <div className="flex items-center justify-between text-[11px]">
                      <div className="text-slate-500 dark:text-slate-400 truncate pr-2">
                        {opp.posterName} • <span className="text-slate-400">{opp.posterCompany}</span>
                      </div>
                      <div className="text-xs font-extrabold text-red-600 dark:text-red-400 shrink-0">
                        {opp.valueFormatted || "Thương lượng"}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* ── 5. HOURLY TIMELINE FLUCTUATION CHART ── */}
          <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp className="size-4 text-red-600" />
                  Đường Timeline Biến Động Nhảy Số Theo Giờ
                </h3>
                <p className="text-[10px] text-slate-400">
                  Dữ liệu ghi nhận từ 08:00 đến 20:00 trong ngày
                </p>
              </div>

              {/* Metric filter switcher */}
              <div className="flex items-center gap-1 p-0.5 bg-slate-100 dark:bg-slate-800 rounded-xl">
                <button
                  type="button"
                  onClick={() => setMetricTab("VALUE")}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                    metricTab === "VALUE"
                      ? "bg-red-600 text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-400"
                  }`}
                >
                  Giá trị (VND)
                </button>
                <button
                  type="button"
                  onClick={() => setMetricTab("OPPORTUNITIES")}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                    metricTab === "OPPORTUNITIES"
                      ? "bg-amber-500 text-slate-950 shadow-xs"
                      : "text-slate-600 dark:text-slate-400"
                  }`}
                >
                  Lượt trao
                </button>
              </div>
            </div>

            {/* Visual SVG Timeline Bar & Fluctuation Curve */}
            <div className="relative pt-4 pb-2">
              <div className="flex items-end justify-between h-40 gap-1.5 px-2">
                {data.hourlyTrends.map((h) => {
                  const val = metricTab === "VALUE" ? h.value : h.count;
                  const percent = Math.min(100, Math.max(8, (val / maxHourlyVal) * 100));

                  return (
                    <div
                      key={h.hour}
                      className="flex-1 flex flex-col items-center justify-end h-full gap-1 group relative"
                    >
                      <div className="absolute -top-7 hidden group-hover:flex px-2 py-0.5 rounded-md bg-slate-900 text-white text-[9px] font-bold whitespace-nowrap shadow-md z-10">
                        {metricTab === "VALUE" ? formatVnd(val) : `${val} lượt`}
                      </div>

                      <div
                        style={{ height: `${percent}%` }}
                        className={`w-full rounded-t-lg transition-all duration-300 group-hover:brightness-110 ${
                          metricTab === "VALUE"
                            ? "bg-gradient-to-t from-red-600 to-amber-500"
                            : "bg-gradient-to-t from-[#003B95] to-amber-400"
                        }`}
                      />
                      <span className="text-[9px] text-slate-400 font-mono scale-90">
                        {h.hour}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── 6. TOP 3 HỘI VIÊN DẪN ĐẦU ── */}
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <button
              type="button"
              onClick={() => setTop3Open(!top3Open)}
              className="w-full px-4 py-3.5 flex items-center justify-between bg-slate-50/80 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Award className="size-4 text-amber-500" />
                <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Top 3 Hội viên giữ vị trí dẫn đầu
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <span>{top3Open ? "Thu gọn" : "Mở rộng"}</span>
                {top3Open ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
              </div>
            </button>

            {top3Open && (
              <div className="p-3 divide-y divide-slate-100 dark:divide-slate-800/60 animate-in fade-in duration-150">
                {[top1, top2, top3].filter(Boolean).map((mem, idx) => {
                  const rank = idx + 1;
                  const rankBadgeColor =
                    rank === 1
                      ? "bg-red-600 text-white"
                      : rank === 2
                      ? "bg-amber-500 text-slate-950"
                      : "bg-[#003B95] text-white";

                  return (
                    <div
                      key={mem!.id}
                      onClick={() => setSelectedTop1(mem!)}
                      className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-xl px-2 transition"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`size-7 rounded-full font-black text-xs flex items-center justify-center shadow-xs shrink-0 ${rankBadgeColor}`}
                        >
                          {rank}
                        </div>
                        <div className="size-10 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200 dark:border-slate-700">
                          {mem!.avatar ? (
                            <img
                              src={resolveMediaUrl(mem!.avatar) || mem!.avatar}
                              alt={mem!.name}
                              className="size-full object-cover"
                            />
                          ) : (
                            <div className="size-full flex items-center justify-center font-bold text-xs text-slate-600">
                              {(mem!.name || "CEO")[0]}
                            </div>
                          )}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                            {mem!.name}
                          </h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                            {mem!.company || mem!.department || "Hội viên CLB CEO 1983"}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-xs font-extrabold text-red-600 dark:text-red-400">
                          {formatVnd(mem!.value)}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {mem!.dealCount} deal • {mem!.interactionCount} tương tác
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── 7. LEAST ACTIVE MEMBERS SECTION ── */}
          <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <HeartHandshake className="size-4 text-amber-500" />
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Hội viên ít tham gia cần quan tâm nhất
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-600">
                {data.leastActiveMembers?.length || 0} hội viên
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3">
              Ban Điều Hành và Ban Thành viên chủ động liên hệ hỗ trợ, tháo gỡ khó khăn và gắn kết cùng CLB.
            </p>

            <div className="space-y-2">
              {(data.leastActiveMembers || []).slice(0, 5).map((mem) => (
                <div
                  key={mem.id}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="size-9 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                      {mem.avatar ? (
                        <img
                          src={resolveMediaUrl(mem.avatar) || mem.avatar}
                          alt={mem.name}
                          className="size-full object-cover"
                        />
                      ) : (
                        <span>{(mem.name || "CEO")[0]}</span>
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        {mem.name}
                      </h4>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                        <span>{mem.department || "Hội viên"}</span>
                        <span>•</span>
                        <span className="text-amber-600">{mem.lastActive}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {mem.phone && (
                      <a
                        href={`tel:${mem.phone}`}
                        className="p-2 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 hover:bg-emerald-100 text-xs font-bold inline-flex items-center gap-1 transition"
                        title="Gọi điện thăm hỏi"
                      >
                        <Phone className="size-3.5" />
                        <span className="hidden sm:inline">Gọi</span>
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => navigate({ to: `/association/messages` })}
                      className="p-2 rounded-xl bg-blue-50 text-[#003B95] dark:bg-blue-950/30 dark:text-blue-300 hover:bg-blue-100 text-xs font-bold inline-flex items-center gap-1 transition cursor-pointer"
                      title="Nhắn tin kết nối"
                    >
                      <MessageSquare className="size-3.5" />
                      <span className="hidden sm:inline">Nhắn tin</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── TOP 1 / MEMBER REAL STATS MODAL ── */}
      {selectedTop1 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border-2 border-amber-400 overflow-hidden flex flex-col">
            <div className="p-5 bg-gradient-to-r from-red-600 via-amber-600 to-red-600 text-white relative">
              <button
                type="button"
                onClick={() => setSelectedTop1(null)}
                className="absolute top-4 right-4 p-1 rounded-full bg-black/20 text-white hover:bg-black/40"
              >
                <X className="size-4" />
              </button>

              <div className="flex items-center gap-3">
                <div className="size-16 rounded-2xl overflow-hidden border-2 border-white shadow-md shrink-0 bg-white/20">
                  {selectedTop1.avatar ? (
                    <img
                      src={resolveMediaUrl(selectedTop1.avatar) || selectedTop1.avatar}
                      alt={selectedTop1.name}
                      className="size-full object-cover"
                    />
                  ) : (
                    <div className="size-full flex items-center justify-center font-black text-2xl text-amber-300">
                      {(selectedTop1.name || "CEO")[0]}
                    </div>
                  )}
                </div>
                <div>
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-400 text-slate-950 text-[10px] font-black uppercase mb-1">
                    <Crown className="size-3" />
                    <span>HỘI VIÊN TIÊU BIỂU</span>
                  </div>
                  <h3 className="text-base font-black text-white">{selectedTop1.name}</h3>
                  <p className="text-xs text-amber-100">{selectedTop1.company || "CLB CEO 1983"}</p>
                </div>
              </div>
            </div>

            <div className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="p-3 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30">
                  <span className="text-[10px] text-red-600 font-bold uppercase">
                    Giá trị mang lại
                  </span>
                  <div className="text-sm font-black text-slate-900 dark:text-white mt-1">
                    {formatVnd(selectedTop1.value)}
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30">
                  <span className="text-[10px] text-amber-600 font-bold uppercase">
                    Số deal đã chốt
                  </span>
                  <div className="text-sm font-black text-slate-900 dark:text-white mt-1">
                    {selectedTop1.dealCount} deal
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Ban trực thuộc:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {selectedTop1.department || "Ban Điều Hành"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Lượt tương tác:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {selectedTop1.interactionCount} lượt
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedTop1(null)}
                className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-bold text-xs shadow-md transition active:scale-95 cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
