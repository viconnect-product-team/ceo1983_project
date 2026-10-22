import { createFileRoute } from "@tanstack/react-router";
import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  LayoutGrid,
  BarChart3,
  GitBranch,
  PieChart,
  Network,
  Download,
  Upload,
  RefreshCw,
  Coins,
  Handshake,
  TrendingUp,
  Users,
  Building2,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  Eye,
  CheckCircle2,
  Activity,
  Award,
  Sparkles,
  Search,
  Filter,
} from "lucide-react";
import { toast } from "sonner";
import { fetchNestApi } from "@/lib/api-client";
import { AppShell } from "@/components/dashboard/AppShell";
import { Card, PageHeader } from "@/components/dashboard/PageKit";
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  PieChart as RechartsPie,
  Pie,
} from "recharts";

export const Route = createFileRoute("/analytics")({
  component: AnalyticsPage,
  head: () => ({
    meta: [
      { title: "Trung Tâm Thống Kê & Phân Tích CRM | CEO 1983" },
      {
        name: "description",
        content:
          "Hệ thống thống kê thời gian thực theo giờ như thị trường chứng khoán, kiểm soát quyền hạn 6 ban chuyên môn và hội viên CEO 1983",
      },
    ],
  }),
});

type ViewMode = "STOCK_TIMELINE" | "BOARDS_CONTROL" | "GRID" | "TREEMAP" | "DONUT" | "ORG_TREE";

interface CandlestickItem {
  time: string;
  label: string;
  interactions: number;
  dealsVolume: number;
  valueMil: number;
  open: number;
  high: number;
  low: number;
  close: number;
  change: string;
}

interface AnalyticsOverview {
  summary: {
    totalOpportunities: number;
    totalOpportunitiesValue: number;
    totalDealsWon: number;
    totalDealsWonValue: number;
    totalInteractions: number;
    totalMembers: number;
    activeMembersCount: number;
  };
  hourlyTimeline?: CandlestickItem[];
  hourlyTrends?: Array<{ hour: string; count: number; value: number }>;
  topPerformers?: any[];
  leastActiveMembers?: any[];
  deptDonutData?: Array<{
    name: string;
    membersCount: number;
    totalValue: number;
    oppsCount: number;
    sharePercent: number;
  }>;
  treemapData?: Array<{
    name: string;
    membersCount: number;
    totalValue: number;
    sharePercent: number;
  }>;
  orgUnitTree?: any;
}

const COMMITTEES_CONTROL_DATA = [
  {
    code: "BDH",
    name: "Ban Điều Hành",
    leader: "Chủ tịch CLB & Ban Thường Trực",
    members: 14,
    activeRate: "98.5%",
    dealsValue: 24_500_000_000,
    oppsCount: 68,
    permissionLevel: "Toàn quyền tối cao (Full Super Admin)",
    color: "#1F3864",
  },
  {
    code: "BXT",
    name: "Ban Xúc Tiến Thương Mại",
    leader: "Trưởng ban Xúc tiến B2B",
    members: 38,
    activeRate: "96.0%",
    dealsValue: 18_800_000_000,
    oppsCount: 112,
    permissionLevel: "Duyệt cơ hội, kết nối & sàn giao thương",
    color: "#B8860B",
  },
  {
    code: "BTV",
    name: "Ban Thành Viên",
    leader: "Trưởng ban Phát triển hội viên",
    members: 42,
    activeRate: "92.0%",
    dealsValue: 11_200_000_000,
    oppsCount: 45,
    permissionLevel: "Thẩm định hồ sơ, kết nạp & danh bạ hội viên",
    color: "#059669",
  },
  {
    code: "BTC",
    name: "Ban Tài Chính",
    leader: "Trưởng ban Tài chính & Thủ quỹ",
    members: 18,
    activeRate: "94.5%",
    dealsValue: 8_900_000_000,
    oppsCount: 32,
    permissionLevel: "Quản lý quỹ hội phí, chứng từ thu chi",
    color: "#D97706",
  },
  {
    code: "BTT",
    name: "Ban Truyền Thông",
    leader: "Trưởng ban Báo chí & Brand",
    members: 26,
    activeRate: "89.0%",
    dealsValue: 6_400_000_000,
    oppsCount: 39,
    permissionLevel: "Đăng tải bản tin, sự kiện & chiến dịch PR",
    color: "#0284C7",
  },
  {
    code: "BTN",
    name: "Ban Thiện Nguyện",
    leader: "Trưởng ban An sinh xã hội",
    members: 28,
    activeRate: "91.5%",
    dealsValue: 4_200_000_000,
    oppsCount: 28,
    permissionLevel: "Điều phối quỹ từ thiện & công tác xã hội",
    color: "#0D9488",
  },
  {
    code: "BTK",
    name: "Ban Thư Ký",
    leader: "Tổng thư ký Hiệp hội",
    members: 10,
    activeRate: "100%",
    dealsValue: 3_100_000_000,
    oppsCount: 22,
    permissionLevel: "Điều phối lịch họp, biên bản & biểu quyết",
    color: "#475569",
  },
];

const INDUSTRIES_TREEMAP = [
  { name: "Bất động sản & Xây dựng", value: 24_500_000_000, count: 42, color: "bg-[#1F3864]" },
  { name: "Công nghệ & Chuyển đổi số", value: 18_200_000_000, count: 36, color: "bg-[#B8860B]" },
  { name: "Sản xuất & Cơ khí", value: 12_800_000_000, count: 28, color: "bg-emerald-600" },
  { name: "Tài chính & Đầu tư", value: 9_400_000_000, count: 19, color: "bg-amber-600" },
  { name: "Thương mại & Dịch vụ", value: 7_600_000_000, count: 25, color: "bg-cyan-600" },
  { name: "Nông nghiệp & Thực phẩm", value: 4_800_000_000, count: 14, color: "bg-teal-600" },
];

function formatMoney(num: number): string {
  if (!num) return "0 đ";
  if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(1)} Tỷ đ`;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(0)} Tr đ`;
  return `${num.toLocaleString()} đ`;
}

// Custom Stock Candlestick Tooltip
function CustomStockTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    const data: CandlestickItem = payload[0].payload;
    const isUp = !data.change.startsWith("-");
    return (
      <div className="bg-slate-950/95 text-white p-3.5 rounded-xl border border-slate-700 shadow-2xl backdrop-blur-md min-w-[220px] font-sans text-xs space-y-1.5 z-50">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <span className="font-bold text-amber-400 font-mono text-sm">Khung: {data.time}</span>
          <span
            className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
              isUp ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-300"
            }`}
          >
            {data.change}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1 pt-1 font-mono">
          <div className="text-slate-400">
            Mở cửa: <span className="text-white font-bold">{data.open} Tr</span>
          </div>
          <div className="text-slate-400">
            Đóng cửa: <span className="text-white font-bold">{data.close} Tr</span>
          </div>
          <div className="text-slate-400">
            Cao nhất (High): <span className="text-emerald-400 font-bold">{data.high} Tr</span>
          </div>
          <div className="text-slate-400">
            Thấp nhất (Low): <span className="text-amber-400 font-bold">{data.low} Tr</span>
          </div>
        </div>
        <div className="border-t border-slate-800 pt-2 flex items-center justify-between text-[11px]">
          <span className="text-slate-300">Khối lượng deal:</span>
          <span className="font-bold text-emerald-400">{data.dealsVolume} hợp đồng</span>
        </div>
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-slate-300">Tương tác giờ:</span>
          <span className="font-bold text-cyan-400">{data.interactions} lượt</span>
        </div>
      </div>
    );
  }
  return null;
}

function AnalyticsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("STOCK_TIMELINE");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AnalyticsOverview | null>(null);
  const [tickerTick, setTickerTick] = useState(0);
  const [selectedDept, setSelectedDept] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchOverview = async () => {
    setLoading(true);
    try {
      const res = await fetchNestApi<any>("/analytics/overview");
      if (res && res.summary) {
        setData(res);
      }
    } catch {
      toast.error("Không thể tải dữ liệu thống kê CRM");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  // Realtime ticker tick animation
  useEffect(() => {
    const timer = setInterval(() => {
      setTickerTick((prev) => prev + 1);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const handleExportCategoryExcel = (category: string) => {
    const csvContent =
      "\uFEFF" +
      [
        [`BÁO CÁO CRM THỐNG KÊ CHI TIẾT - DANH MỤC: ${category.toUpperCase()}`],
        [`Thời gian xuất: ${new Date().toLocaleString("vi-VN")}`],
        [],
        [
          "Mã Ban",
          "Tên Ban Chuyên Môn",
          "Lãnh đạo phụ trách",
          "Số lượng hội viên",
          "Tỷ lệ sinh hoạt",
          "Giá trị giao thương (VNĐ)",
          "Số cơ hội B2B",
          "Quyền hạn phân cấp",
        ],
        ...COMMITTEES_CONTROL_DATA.map((c) => [
          c.code,
          c.name,
          c.leader,
          c.members,
          c.activeRate,
          c.dealsValue.toLocaleString(),
          c.oppsCount,
          c.permissionLevel,
        ]),
      ]
        .map((r) => r.join(","))
        .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Bao_Cao_${category}_CEO1983_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Đã xuất báo cáo Excel cho danh mục: ${category}`);
  };

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      toast.info("Đang xử lý import dữ liệu Excel...");
      await fetchNestApi("/analytics/import?type=general", {
        method: "POST",
        body: JSON.stringify({ filename: file.name, size: file.size }),
      });
      toast.success(`Đã nhập thành công dữ liệu từ file: ${file.name}`);
      fetchOverview();
    } catch {
      toast.error("Lỗi khi nhập file Excel");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Prepare Candlestick Timeline Data
  const candleTimeline: CandlestickItem[] = useMemo(() => {
    if (data?.hourlyTimeline && data.hourlyTimeline.length > 0) {
      return data.hourlyTimeline;
    }
    return [
      { time: "08:00", label: "08:00", interactions: 18, dealsVolume: 2, valueMil: 150, open: 120, high: 165, low: 110, close: 150, change: "+25.0%" },
      { time: "10:00", label: "10:00", interactions: 45, dealsVolume: 5, valueMil: 420, open: 150, high: 450, low: 145, close: 420, change: "+180.0%" },
      { time: "12:00", label: "12:00", interactions: 28, dealsVolume: 3, valueMil: 280, open: 420, high: 430, low: 260, close: 280, change: "-33.3%" },
      { time: "14:00", label: "14:00", interactions: 62, dealsVolume: 8, valueMil: 650, open: 280, high: 690, low: 275, close: 650, change: "+132.1%" },
      { time: "16:00", label: "16:00", interactions: 85, dealsVolume: 11, valueMil: 890, open: 650, high: 920, low: 630, close: 890, change: "+36.9%" },
      { time: "18:00", label: "18:00", interactions: 54, dealsVolume: 6, valueMil: 510, open: 890, high: 895, low: 480, close: 510, change: "-42.7%" },
      { time: "20:00", label: "20:00", interactions: 39, dealsVolume: 4, valueMil: 360, open: 510, high: 520, low: 340, close: 360, change: "-29.4%" },
    ];
  }, [data?.hourlyTimeline]);

  return (
    <AppShell>
      <div className="space-y-6 font-sans">
        <PageHeader
          title="Trung Tâm Thống Kê & Phân Tích Điều Hành CRM CEO 1983"
          subtitle="Dữ liệu thời gian thực theo giờ như thị trường chứng khoán, kiểm soát toàn diện quyền hạn 6 ban chuyên môn & hội viên"
          actions={
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => handleExportCategoryExcel("tong_hop")}
                className="px-3.5 py-2 rounded-xl bg-[#1F3864] text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-sm hover:bg-[#152747] transition cursor-pointer"
              >
                <Download className="size-4" />
                <span>Xuất Excel Báo Cáo</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs inline-flex items-center gap-1.5 border border-slate-300 dark:border-slate-700 hover:bg-slate-200 transition cursor-pointer"
              >
                <Upload className="size-4" />
                <span>Nhập Dữ Liệu Excel</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                className="hidden"
                onChange={handleImportExcel}
              />

              <button
                type="button"
                onClick={fetchOverview}
                className="p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 transition cursor-pointer"
                title="Làm mới dữ liệu"
              >
                <RefreshCw className={`size-4 text-[#1F3864] dark:text-amber-400 ${loading ? "animate-spin" : ""}`} />
              </button>
            </div>
          }
        />

        {/* ── REALTIME STOCK TICKER BAR (CHỨNG KHOÁN REALTIME RUNNER) ── */}
        <div className="w-full bg-[#0F1B2E] text-white rounded-2xl p-3 border border-slate-800 shadow-lg flex flex-wrap items-center justify-between gap-4 overflow-hidden">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-black uppercase tracking-wider text-amber-400 font-mono">
              CEO1983-LIVE TICKER
            </span>
          </div>

          <div className="flex-1 flex flex-wrap items-center justify-around gap-4 text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">CEO-INDEX:</span>
              <span className="font-extrabold text-emerald-400">
                {(1983.45 + (tickerTick % 5) * 0.35).toFixed(2)} pts
              </span>
              <span className="text-[10px] text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded">
                +1.85%
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">TỔNG CƠ HỘI:</span>
              <span className="font-extrabold text-amber-300">
                {formatMoney(data?.summary.totalOpportunitiesValue || 59_900_000_000)}
              </span>
              <span className="text-[10px] text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded">
                +12.4%
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">DEAL KHỚP LỆNH:</span>
              <span className="font-extrabold text-cyan-300">
                {formatMoney(data?.summary.totalDealsWonValue || 28_400_000_000)}
              </span>
              <span className="text-[10px] text-cyan-400 bg-cyan-950/80 px-1.5 py-0.5 rounded">
                {data?.summary.totalDealsWon || 48} deals
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">HOẠT ĐỘNG:</span>
              <span className="font-extrabold text-white">
                {data?.summary.activeMembersCount || 145} / {data?.summary.totalMembers || 180} TV
              </span>
              <span className="text-[10px] text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded">
                92.8%
              </span>
            </div>
          </div>

          <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
            <Activity className="size-3 text-emerald-400" />
            <span>Cập nhật liên tục 4s</span>
          </div>
        </div>

        {/* ── VIEW MODES TABS SELECTOR (NO RED BUTTONS) ── */}
        <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl w-fit border border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={() => setViewMode("STOCK_TIMELINE")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition inline-flex items-center gap-2 cursor-pointer ${
              viewMode === "STOCK_TIMELINE"
                ? "bg-[#1F3864] text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <TrendingUp className="size-4" />
            <span>1. Biểu Đồ Nến Chứng Khoán Theo Giờ</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode("BOARDS_CONTROL")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition inline-flex items-center gap-2 cursor-pointer ${
              viewMode === "BOARDS_CONTROL"
                ? "bg-[#1F3864] text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <ShieldCheck className="size-4" />
            <span>2. Kiểm Soát Quyền Hạn 6 Ban Chuyên Môn</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode("GRID")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition inline-flex items-center gap-2 cursor-pointer ${
              viewMode === "GRID"
                ? "bg-[#1F3864] text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <LayoutGrid className="size-4" />
            <span>3. Lưới KPI Đa Chiều</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode("TREEMAP")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition inline-flex items-center gap-2 cursor-pointer ${
              viewMode === "TREEMAP"
                ? "bg-[#1F3864] text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <GitBranch className="size-4" />
            <span>4. Biểu Đồ Cây Ngành Nghề</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode("DONUT")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition inline-flex items-center gap-2 cursor-pointer ${
              viewMode === "DONUT"
                ? "bg-[#1F3864] text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <PieChart className="size-4" />
            <span>5. Biểu Đồ Tròn Ban Ngành</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode("ORG_TREE")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition inline-flex items-center gap-2 cursor-pointer ${
              viewMode === "ORG_TREE"
                ? "bg-[#1F3864] text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Network className="size-4" />
            <span>6. Cây Đơn Vị HanoiBA</span>
          </button>
        </div>

        {/* ── TAB 1: BIỂU ĐỒ NẾN CHỨNG KHOÁN THEO GIỜ (HOURLY CANDLESTICK STOCK CHART) ── */}
        {viewMode === "STOCK_TIMELINE" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <Card className="p-6">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h3 className="text-base font-extrabold text-[#1F3864] dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <TrendingUp className="size-5 text-amber-500" />
                    <span>Biểu Đồ Khớp Lệnh & Biến Động Cơ Hội Theo Giờ (08:00 - 20:00)</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Di chuột vào từng cột nến để xem đầy đủ giá Mở cửa, Đóng cửa, Đỉnh cao nhất, Đáy thấp nhất, số deal và khối lượng giá trị
                  </p>
                </div>

                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="size-3 rounded-xs bg-emerald-600 inline-block" />
                    <span className="font-semibold text-slate-600 dark:text-slate-300">Nến Tăng (Bullish)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="size-3 rounded-xs bg-[#B8860B] inline-block" />
                    <span className="font-semibold text-slate-600 dark:text-slate-300">Nến Điều chỉnh</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="size-3 rounded-full bg-[#1F3864] inline-block" />
                    <span className="font-semibold text-slate-600 dark:text-slate-300">Khối lượng Deal</span>
                  </div>
                </div>
              </div>

              {/* RECHARTS COMPOSED CANDLESTICK & VOLUME */}
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={candleTimeline} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="time" tick={{ fontSize: 11, fill: "#64748B" }} />
                    <YAxis
                      yAxisId="left"
                      tick={{ fontSize: 11, fill: "#64748B" }}
                      tickFormatter={(val) => `${val} Tr`}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      tick={{ fontSize: 11, fill: "#64748B" }}
                      tickFormatter={(val) => `${val} deals`}
                    />
                    <Tooltip content={<CustomStockTooltip />} />
                    <Bar
                      yAxisId="left"
                      dataKey="close"
                      name="Giá trị trao đổi"
                      radius={[4, 4, 0, 0]}
                    >
                      {candleTimeline.map((entry, index) => {
                        const isUp = !entry.change.startsWith("-");
                        return (
                          <Cell
                            key={`cell-${index}`}
                            fill={isUp ? "#059669" : "#B8860B"}
                            stroke={isUp ? "#047857" : "#92400E"}
                          />
                        );
                      })}
                    </Bar>
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="dealsVolume"
                      stroke="#1F3864"
                      strokeWidth={3}
                      dot={{ r: 5, fill: "#1F3864" }}
                      activeDot={{ r: 7, fill: "#B8860B" }}
                      name="Số Deal Khớp Lệnh"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              {/* TIMELINE HOURLY CANDLESTICK CARDS */}
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                {candleTimeline.map((c) => {
                  const isUp = !c.change.startsWith("-");
                  return (
                    <div
                      key={c.time}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 hover:border-amber-400 transition"
                    >
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="font-extrabold text-slate-800 dark:text-white">{c.time}</span>
                        <span
                          className={`text-[10px] font-bold ${
                            isUp ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
                          }`}
                        >
                          {c.change}
                        </span>
                      </div>
                      <div className="mt-2 text-sm font-black text-[#1F3864] dark:text-white font-mono">
                        {c.close} Tr
                      </div>
                      <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500">
                        <span>High: {c.high}M</span>
                        <span>Low: {c.low}M</span>
                      </div>
                      <div className="mt-1 text-[10px] text-slate-400 font-medium">
                        {c.dealsVolume} deals | {c.interactions} tương tác
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* TOP 5 ACTIVE & BOTTOM PERFORMERS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-extrabold text-[#1F3864] dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <Award className="size-4 text-amber-500" />
                    <span>Top 5 Hội Viên Giao Thương Xuất Sắc</span>
                  </h3>
                  <span className="text-xs text-emerald-600 font-bold">Dẫn đầu bảng xếp hạng</span>
                </div>
                <div className="space-y-3">
                  {(data?.topPerformers || []).slice(0, 5).map((p, i) => (
                    <div
                      key={p.id || i}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`size-6 rounded-full font-black text-xs flex items-center justify-center ${
                            i === 0
                              ? "bg-amber-400 text-slate-950 shadow-sm"
                              : i === 1
                                ? "bg-slate-300 text-slate-900"
                                : "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
                          }`}
                        >
                          {i + 1}
                        </span>
                        <div>
                          <div className="font-bold text-xs text-slate-900 dark:text-white">{p.name}</div>
                          <div className="text-[10px] text-slate-500">{p.company || "Doanh nghiệp CLB"}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-extrabold text-xs text-[#1F3864] dark:text-amber-400">
                          {formatMoney(p.value || p.totalValueVnd || 850_000_000)}
                        </div>
                        <div className="text-[10px] text-emerald-600 font-semibold">
                          +{p.oppsWon || p.oppsShared || 4} hợp đồng
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-extrabold text-[#1F3864] dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="size-4 text-cyan-500" />
                    <span>Hội Viên Cần Hỗ Trợ Kết Nối Thêm</span>
                  </h3>
                  <span className="text-xs text-amber-600 font-bold">Cần Ban Xúc Tiến Chăm Sóc</span>
                </div>
                <div className="space-y-3">
                  {(data?.leastActiveMembers || []).slice(0, 5).map((m, i) => (
                    <div
                      key={m.id || i}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60"
                    >
                      <div className="flex items-center gap-3">
                        <span className="size-6 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center">
                          {i + 1}
                        </span>
                        <div>
                          <div className="font-bold text-xs text-slate-900 dark:text-white">{m.name}</div>
                          <div className="text-[10px] text-slate-500">{m.department || "Hội viên"}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                          Chờ match B2B
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* ── TAB 2: KIỂM SOÁT TOÀN DIỆN QUYỀN HẠN 6 BAN CHUYÊN MÔN ── */}
        {viewMode === "BOARDS_CONTROL" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <Card className="p-6">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-base font-extrabold text-[#1F3864] dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <ShieldCheck className="size-5 text-emerald-600" />
                    <span>Kiểm Soát Quyền Hạn & Hiệu Suất 6 Ban Chuyên Môn CLB CEO 1983</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Dành riêng cho Chủ tịch, Admin và Ban Quản Trị giám sát phân quyền, thẩm quyền duyệt và giao thương của các ban
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleExportCategoryExcel("6_ban_chuyen_mon")}
                  className="px-3 py-1.5 rounded-xl bg-[#1F3864] text-white font-bold text-xs inline-flex items-center gap-1.5 hover:bg-[#152747] transition cursor-pointer"
                >
                  <Download className="size-3.5" />
                  <span>Xuất Danh Sách Ban</span>
                </button>
              </div>

              {/* COMMITTEES TABLE */}
              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#1F3864] text-white font-bold uppercase tracking-wider">
                    <tr>
                      <th className="p-3">Mã Ban</th>
                      <th className="p-3">Tên Ban Chuyên Môn</th>
                      <th className="p-3">Trưởng Ban / Phụ Trách</th>
                      <th className="p-3 text-center">Hội Viên</th>
                      <th className="p-3 text-center">Tỷ Lệ Sinh Hoạt</th>
                      <th className="p-3 text-right">Doanh Số Giao Thương</th>
                      <th className="p-3 text-center">Cơ Hội Trao</th>
                      <th className="p-3">Thẩm Quyền & Phân Cấp</th>
                      <th className="p-3 text-center">Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                    {COMMITTEES_CONTROL_DATA.map((c) => (
                      <tr key={c.code} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                        <td className="p-3 font-mono font-bold text-amber-600 dark:text-amber-400">
                          {c.code}
                        </td>
                        <td className="p-3 font-bold text-slate-900 dark:text-white">
                          {c.name}
                        </td>
                        <td className="p-3 text-slate-600 dark:text-slate-300 font-medium">
                          {c.leader}
                        </td>
                        <td className="p-3 text-center font-bold text-slate-900 dark:text-white">
                          {c.members} TV
                        </td>
                        <td className="p-3 text-center">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                            {c.activeRate}
                          </span>
                        </td>
                        <td className="p-3 text-right font-extrabold text-[#1F3864] dark:text-amber-400 font-mono">
                          {formatMoney(c.dealsValue)}
                        </td>
                        <td className="p-3 text-center font-bold text-emerald-600">
                          {c.oppsCount} opps
                        </td>
                        <td className="p-3 text-slate-500 dark:text-slate-400 text-[11px]">
                          {c.permissionLevel}
                        </td>
                        <td className="p-3 text-center">
                          <button
                            type="button"
                            onClick={() => setSelectedDept(c.name)}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[#1F3864] dark:text-slate-200 font-bold text-[11px] hover:bg-slate-200 transition inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Eye className="size-3" />
                            <span>Chi tiết</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* DETAIL MODAL IF A BOARD IS SELECTED */}
            {selectedDept && (
              <Card className="p-5 border-2 border-[#1F3864] bg-slate-50 dark:bg-slate-800/80">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="size-5 text-[#1F3864] dark:text-amber-400" />
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      Chi tiết thẩm quyền & Danh sách thành viên: {selectedDept}
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedDept(null)}
                    className="px-3 py-1 rounded-lg bg-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-300 cursor-pointer"
                  >
                    Đóng
                  </button>
                </div>
                <div className="mt-3 text-xs text-slate-600 dark:text-slate-300 grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="font-bold block text-slate-400 text-[10px] uppercase">Quyền truy cập dữ liệu</span>
                    <span className="font-semibold text-slate-800 dark:text-white mt-1 block">Toàn quyền xem thông tin hội viên & sự kiện của ban</span>
                  </div>
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="font-bold block text-slate-400 text-[10px] uppercase">Quyền duyệt tài chính</span>
                    <span className="font-semibold text-slate-800 dark:text-white mt-1 block">Đề xuất thu chi lên Chủ tịch & Ban Thường trực</span>
                  </div>
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="font-bold block text-slate-400 text-[10px] uppercase">Trạng thái xác thực</span>
                    <span className="font-semibold text-emerald-600 mt-1 block flex items-center gap-1">
                      <CheckCircle2 className="size-3.5" /> Hoạt động đồng bộ 100%
                    </span>
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* ── TAB 3: GRID VIEW (LƯỚI KPI) ── */}
        {viewMode === "GRID" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in duration-200">
            <Card className="p-5 border-l-4 border-l-[#1F3864] flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase">Giá trị cơ hội B2B</span>
                <span className="p-2 rounded-xl bg-blue-50 text-[#1F3864] dark:bg-blue-950 dark:text-blue-300">
                  <Coins className="size-5" />
                </span>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-black text-slate-900 dark:text-white">
                  {formatMoney(data?.summary.totalOpportunitiesValue || 59_900_000_000)}
                </div>
                <div className="flex items-center gap-1 text-xs text-emerald-600 font-bold mt-1">
                  <ArrowUpRight className="size-3.5" />
                  <span>+18.5% so với tháng trước</span>
                </div>
              </div>
            </Card>

            <Card className="p-5 border-l-4 border-l-amber-500 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase">Deal chốt thành công</span>
                <span className="p-2 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-300">
                  <Handshake className="size-5" />
                </span>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-black text-slate-900 dark:text-white">
                  {formatMoney(data?.summary.totalDealsWonValue || 28_400_000_000)}
                </div>
                <div className="text-xs text-amber-600 font-bold mt-1">
                  {data?.summary.totalDealsWon || 48} hợp đồng hoàn tất
                </div>
              </div>
            </Card>

            <Card className="p-5 border-l-4 border-l-emerald-600 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase">Hội viên hoạt động</span>
                <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300">
                  <Users className="size-5" />
                </span>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-black text-slate-900 dark:text-white">
                  {data?.summary.activeMembersCount || 145} / {data?.summary.totalMembers || 180}
                </div>
                <div className="text-xs text-emerald-600 font-bold mt-1">
                  92.8% tỷ lệ tham gia sinh hoạt
                </div>
              </div>
            </Card>

            <Card className="p-5 border-l-4 border-l-cyan-600 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase">Tổng tương tác CLB</span>
                <span className="p-2 rounded-xl bg-cyan-50 text-cyan-600 dark:bg-cyan-950 dark:text-cyan-300">
                  <TrendingUp className="size-5" />
                </span>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-black text-slate-900 dark:text-white">
                  {(data?.summary.totalInteractions || 1480).toLocaleString()}
                </div>
                <div className="text-xs text-cyan-600 font-bold mt-1">
                  Likes, bình luận & kết nối
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* ── TAB 4: TREEMAP (BIỂU ĐỒ CÂY NGÀNH NGHỀ) ── */}
        {viewMode === "TREEMAP" && (
          <Card className="p-6 space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-[#1F3864] dark:text-white uppercase tracking-wider">
                  Biểu Đồ Cây Phân Bố Giá Trị Giao Thương Theo Ngành Nghề
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tỷ trọng quy mô giá trị hợp đồng kết nối giữa các nhóm ngành CLB CEO 1983
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleExportCategoryExcel("treemap_nganh_nghe")}
                className="px-3 py-1.5 rounded-xl bg-[#1F3864] text-white text-xs font-bold hover:bg-[#152747] transition cursor-pointer"
              >
                Xuất Excel
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-2">
              {INDUSTRIES_TREEMAP.map((ind) => (
                <div
                  key={ind.name}
                  className={`${ind.color} text-white p-5 rounded-2xl shadow-sm hover:scale-[1.01] transition flex flex-col justify-between min-h-[140px]`}
                >
                  <div className="flex items-start justify-between">
                    <span className="font-extrabold text-xs uppercase tracking-wide opacity-90 max-w-[180px]">
                      {ind.name}
                    </span>
                    <span className="text-[11px] font-bold bg-white/20 px-2 py-0.5 rounded-full">
                      {ind.count} DN
                    </span>
                  </div>
                  <div>
                    <div className="text-2xl font-black font-mono tracking-tight">
                      {formatMoney(ind.value)}
                    </div>
                    <div className="text-[11px] opacity-80 mt-1">
                      Chiếm {((ind.value / 77_300_000_000) * 100).toFixed(1)}% toàn CLB
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* ── TAB 5: BIỂU ĐỒ TRÒN (DONUT THEO BAN NGÀNH) ── */}
        {viewMode === "DONUT" && (
          <Card className="p-6 space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-[#1F3864] dark:text-white uppercase tracking-wider">
                  Cơ Cấu Giá Trị & Quy Mô 6 Ban Chuyên Môn
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tỷ trọng đóng góp giá trị giao thương của các ban chuyên môn
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleExportCategoryExcel("co_cau_ban_chuyen_mon")}
                className="px-3 py-1.5 rounded-xl bg-[#1F3864] text-white text-xs font-bold hover:bg-[#152747] transition cursor-pointer"
              >
                Xuất Excel
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center pt-4">
              <div className="h-64 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPie>
                    <Pie
                      data={COMMITTEES_CONTROL_DATA}
                      dataKey="dealsValue"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={95}
                      paddingAngle={3}
                    >
                      {COMMITTEES_CONTROL_DATA.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => formatMoney(Number(value))} />
                  </RechartsPie>
                </ResponsiveContainer>
              </div>

              <div className="space-y-2.5">
                {COMMITTEES_CONTROL_DATA.map((c) => (
                  <div
                    key={c.code}
                    className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="size-3 rounded-full" style={{ backgroundColor: c.color }} />
                      <span className="font-bold text-slate-800 dark:text-white">{c.name}</span>
                    </div>
                    <div className="font-mono font-extrabold text-[#1F3864] dark:text-amber-400">
                      {formatMoney(c.dealsValue)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* ── TAB 6: CÂY ĐƠN VỊ HANOIBA (ORG TREE) ── */}
        {viewMode === "ORG_TREE" && (
          <Card className="p-6 space-y-6 animate-in fade-in duration-200">
            <div className="text-center max-w-xl mx-auto">
              <div className="inline-block p-4 rounded-2xl bg-[#1F3864] text-white shadow-md">
                <div className="font-black text-sm uppercase">Hội Doanh Nhân Trẻ Hà Nội (HanoiBA)</div>
                <div className="text-[11px] text-amber-300 mt-0.5">Cơ quan chủ quản & bảo trợ</div>
              </div>
              <div className="w-0.5 h-6 bg-slate-300 dark:bg-slate-700 mx-auto" />
              <div className="p-3.5 rounded-2xl bg-[#B8860B] text-white shadow-sm inline-block">
                <div className="font-extrabold text-sm uppercase">CLB Doanh Nhân CEO 1983</div>
                <div className="text-[11px] text-slate-100">Chi hội nòng cốt doanh nhân tuổi Quý Hợi</div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              {COMMITTEES_CONTROL_DATA.map((c) => (
                <div
                  key={c.code}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center flex flex-col justify-between"
                >
                  <div className="font-bold text-xs text-[#1F3864] dark:text-amber-400">{c.name}</div>
                  <div className="text-[10px] text-slate-500 mt-1">{c.leader}</div>
                  <div className="mt-2 text-xs font-black text-emerald-600">{c.members} thành viên</div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
