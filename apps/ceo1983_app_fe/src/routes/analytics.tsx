import { createFileRoute } from "@tanstack/react-router";
import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Briefcase,
  Handshake,
  TrendingUp,
  Award,
  Users,
  Building2,
  Share2,
  Calendar,
  Clock,
  MessageSquare,
  Activity,
  Filter,
  Download,
  Sparkles,
  Crown,
  ChevronRight,
  ArrowUpRight,
  PieChart as PieIcon,
  BarChart3,
  LineChart as LineIcon,
  Layers,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RefreshCw,
  Flame,
} from "lucide-react";
import { toast } from "sonner";
import { fetchNestApi } from "@/lib/api-client";
import { useAuth } from "@/context/AuthContext";
import { AppShell } from "@/components/dashboard/AppShell";
import { Card, PageHeader } from "@/components/dashboard/PageKit";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Treemap,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";

export const Route = createFileRoute("/analytics")({
  component: AnalyticsDashboardPage,
  head: () => ({
    meta: [
      { title: "Dashboard Thống Kê & Cơ Hội Kinh Doanh | CEO 1983 CRM" },
      {
        name: "description",
        content:
          "Hệ thống thống kê cơ hội kinh doanh, bảng xếp hạng Top Givers và chỉ số tương tác cá nhân thời gian thực của Hiệp hội Doanh nhân CEO 1983",
      },
    ],
  }),
});

// Bộ 3 màu nhận diện thương hiệu chuẩn CEO 1983
const BRAND_COLORS = {
  red: "#DC2626",      // Đỏ Ruby chủ đạo (Ưu tiên 1)
  redDark: "#991B1B",
  redLight: "#FEE2E2",
  gold: "#F59E0B",     // Vàng Gold / Hổ phách (Ưu tiên 2)
  goldDark: "#B45309",
  goldLight: "#FEF3C7",
  navy: "#002855",     // Xanh Navy hoàng gia (Ưu tiên 3)
  navyDark: "#001A38",
  navyLight: "#E0ECFB",
};

// Loại đơn vị hiển thị cơ hội: Số lượng vs Giá trị
type OppDisplayMode = "count" | "value";

// Bộ lọc thời gian: Giờ, Ngày, Tháng, Quý, Năm
type TimeFilterOption = "hour" | "day" | "month" | "quarter" | "year";

// Helper format tiền tệ
function formatVND(value: number): string {
  if (!value) return "0 đ";
  if (value >= 1_000_000_000) {
    const b = value / 1_000_000_000;
    return `${b % 1 === 0 ? b : b.toFixed(1)} Tỷ đ`;
  }
  if (value >= 1_000_000) {
    const m = value / 1_000_000;
    return `${m % 1 === 0 ? m : m.toFixed(0)} Tr đ`;
  }
  return `${value.toLocaleString("vi-VN")} đ`;
}

// Custom Treemap Content Node
function CustomTreemapContent(props: any) {
  const { x, y, width, height, index, name, value, color } = props;
  if (width < 30 || height < 30) return null;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill: color || (index % 2 === 0 ? BRAND_COLORS.navy : BRAND_COLORS.gold),
          stroke: "#ffffff",
          strokeWidth: 2,
          rx: 8,
          ry: 8,
        }}
      />
      {width > 60 && height > 40 && (
        <>
          <text
            x={x + width / 2}
            y={y + height / 2 - 6}
            textAnchor="middle"
            fill="#ffffff"
            fontSize={width > 120 ? 12 : 10}
            fontWeight="bold"
            fontFamily="Inter, sans-serif"
          >
            {name}
          </text>
          <text
            x={x + width / 2}
            y={y + height / 2 + 12}
            textAnchor="middle"
            fill="rgba(255,255,255,0.85)"
            fontSize={width > 120 ? 11 : 9}
            fontFamily="Inter, sans-serif"
          >
            {typeof value === "number" && value > 1_000_000 ? formatVND(value) : `${value} cơ hội`}
          </text>
        </>
      )}
    </g>
  );
}

function AnalyticsDashboardPage() {
  const { user } = useAuth();

  // State bộ lọc và chế độ hiển thị
  const [oppMode, setOppMode] = useState<OppDisplayMode>("count");
  const [timeFilter, setTimeFilter] = useState<TimeFilterOption>("month");
  const [loading, setLoading] = useState(false);
  const [realtimePulse, setRealtimePulse] = useState(false);
  const [streamTicker, setStreamTicker] = useState(0);

  // Lấy thông tin user hiện tại để hiển thị phần cá nhân
  const currentMember = useMemo(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem("vba_my_member") : null;
      if (raw) return JSON.parse(raw);
    } catch {}
    return {
      name: (user as any)?.name || (user as any)?.full_name || "CEO Hội Viên",
      company: (user as any)?.company || "Doanh nghiệp CLB CEO 1983",
      title: (user as any)?.title || "Hội viên chính thức",
    };
  }, [user]);

  // Giả lập / tính toán dữ liệu cơ hội kinh doanh biến động theo TimeFilter
  const timeScaleMultiplier = useMemo(() => {
    switch (timeFilter) {
      case "hour":
        return 0.12;
      case "day":
        return 0.35;
      case "month":
        return 1.0;
      case "quarter":
        return 2.8;
      case "year":
        return 10.5;
      default:
        return 1.0;
    }
  }, [timeFilter]);

  // Thêm một độ lệch ngẫu nhiên nhỏ từ realtime ticker
  const realtimeDelta = useMemo(() => {
    return (streamTicker % 7) * 2;
  }, [streamTicker]);

  // PHẦN 1: CÁC CHỈ SỐ CƠ HỘI KINH DOANH TRONG HIỆP HỘI
  const oppStats = useMemo(() => {
    const baseTotalCount = Math.round(320 * timeScaleMultiplier + realtimeDelta);
    const baseSharedCount = Math.round(240 * timeScaleMultiplier + Math.floor(realtimeDelta * 0.8));
    const baseWonCount = Math.round(92 * timeScaleMultiplier + Math.floor(realtimeDelta * 0.3));

    const baseTotalValue = Math.round(185_000_000_000 * timeScaleMultiplier + realtimeDelta * 200_000_000);
    const baseSharedValue = Math.round(132_000_000_000 * timeScaleMultiplier + realtimeDelta * 150_000_000);
    const baseWonValue = Math.round(58_500_000_000 * timeScaleMultiplier + realtimeDelta * 80_000_000);

    return {
      total: {
        count: baseTotalCount,
        value: baseTotalValue,
        growth: "+14.8%",
      },
      shared: {
        count: baseSharedCount,
        value: baseSharedValue,
        growth: "+18.2%",
        rate: "75.0%",
      },
      won: {
        count: baseWonCount,
        value: baseWonValue,
        growth: "+22.5%",
        rate: "38.3%",
      },
    };
  }, [timeScaleMultiplier, realtimeDelta]);

  // BẢNG XẾP HẠNG TOP 3 HỘI VIÊN TRAO ĐI NHIỀU CƠ HỘI NHẤT (LEADERBOARD)
  const topGivers = useMemo(() => {
    const multiplier = timeScaleMultiplier;
    return [
      {
        rank: 1,
        medal: "🥇",
        badge: "Quán Quân Trao Cơ Hội",
        name: "Phạm Văn Vũ",
        company: "Tập Đoàn Công Nghệ Uranus & ViConnect",
        role: "Ban Xúc Tiến Thương Mại",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
        count: Math.round(48 * multiplier + (streamTicker % 3)),
        value: Math.round(34_500_000_000 * multiplier + (streamTicker % 3) * 500_000_000),
        borderColor: "border-amber-400 ring-2 ring-amber-400/50",
        bgGradient: "from-amber-500/10 via-amber-400/5 to-transparent",
        medalColor: "text-amber-500",
      },
      {
        rank: 2,
        medal: "🥈",
        badge: "Á Quân 1 Trao Cơ Hội",
        name: "Nguyễn Thị Mai",
        company: "Green Farm Group Nông Nghiệp Công Nghệ Cao",
        role: "Ban Điều Hành",
        avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80",
        count: Math.round(36 * multiplier),
        value: Math.round(26_800_000_000 * multiplier),
        borderColor: "border-slate-300 ring-2 ring-slate-300/50",
        bgGradient: "from-slate-200/20 via-slate-100/10 to-transparent",
        medalColor: "text-slate-400",
      },
      {
        rank: 3,
        medal: "🥉",
        badge: "Á Quân 2 Trao Cơ Hội",
        name: "Trần Đức Nam",
        company: "Viconnect Logistics & Cung Ứng Quốc Tế",
        role: "Ban Thành Viên",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
        count: Math.round(29 * multiplier),
        value: Math.round(19_200_000_000 * multiplier),
        borderColor: "border-amber-700/50 ring-2 ring-amber-700/30",
        bgGradient: "from-amber-700/10 via-amber-600/5 to-transparent",
        medalColor: "text-amber-700",
      },
    ];
  }, [timeScaleMultiplier, streamTicker]);

  // PHẦN 2: THỐNG KÊ TƯƠNG TÁC CÁ NHÂN (TÀI KHOẢN CỦA CHÍNH MÌNH)
  const personalStats = useMemo(() => {
    const scale = Math.max(0.3, timeScaleMultiplier);
    return {
      sharesCount: Math.round(42 * scale + (streamTicker % 2)),
      eventsJoined: Math.round(18 * scale),
      activeHours: (86.5 * scale).toFixed(1),
      commentsCount: Math.round(156 * scale + (streamTicker % 3)),
    };
  }, [timeScaleMultiplier, streamTicker]);

  // DỮ LIỆU BIỂU ĐỒ 1: CÂY ĐƠN VỊ (TREEMAP HIERARCHY CHART)
  const treemapIndustriesData = useMemo(() => {
    const scale = timeScaleMultiplier;
    return [
      {
        name: "BĐS & Xây dựng",
        value: oppMode === "count" ? Math.round(82 * scale) : Math.round(62_000_000_000 * scale),
        color: BRAND_COLORS.navy,
      },
      {
        name: "Công nghệ & AI",
        value: oppMode === "count" ? Math.round(74 * scale) : Math.round(48_500_000_000 * scale),
        color: BRAND_COLORS.red,
      },
      {
        name: "Sản xuất & Cơ khí",
        value: oppMode === "count" ? Math.round(52 * scale) : Math.round(32_000_000_000 * scale),
        color: BRAND_COLORS.gold,
      },
      {
        name: "Tài chính & Đầu tư",
        value: oppMode === "count" ? Math.round(45 * scale) : Math.round(24_000_000_000 * scale),
        color: "#059669",
      },
      {
        name: "Thương mại & Dịch vụ",
        value: oppMode === "count" ? Math.round(38 * scale) : Math.round(12_500_000_000 * scale),
        color: "#0284C7",
      },
      {
        name: "Nông nghiệp & Thực phẩm",
        value: oppMode === "count" ? Math.round(29 * scale) : Math.round(6_000_000_000 * scale),
        color: "#0D9488",
      },
    ];
  }, [timeScaleMultiplier, oppMode]);

  // DỮ LIỆU BIỂU ĐỒ 2: BIỂU ĐỒ TRÒN (DONUT / PIE CHART) - Tỷ lệ Deal thành công / Đang deal / Thất bại
  const pieDealsData = useMemo(() => {
    return [
      { name: "Deal Thành Công", value: oppStats.won.count, color: BRAND_COLORS.red },
      { name: "Đang Đàm Phán", value: Math.round(oppStats.shared.count - oppStats.won.count), color: BRAND_COLORS.gold },
      { name: "Chưa Khớp / Thất Bại", value: Math.round(oppStats.total.count - oppStats.shared.count), color: BRAND_COLORS.navy },
    ];
  }, [oppStats]);

  // DỮ LIỆU BIỂU ĐỒ 3: BIỂU ĐỒ CỘT (BAR CHART) - So sánh giữa các Ban chuyên môn
  const barCommitteesData = useMemo(() => {
    const scale = timeScaleMultiplier;
    return [
      {
        name: "Ban Điều Hành",
        shared: oppMode === "count" ? Math.round(58 * scale) : Math.round(32_000_000_000 * scale / 1_000_000_000),
        won: oppMode === "count" ? Math.round(24 * scale) : Math.round(14_000_000_000 * scale / 1_000_000_000),
      },
      {
        name: "Ban Xúc Tiến B2B",
        shared: oppMode === "count" ? Math.round(84 * scale) : Math.round(48_000_000_000 * scale / 1_000_000_000),
        won: oppMode === "count" ? Math.round(38 * scale) : Math.round(26_000_000_000 * scale / 1_000_000_000),
      },
      {
        name: "Ban Thành Viên",
        shared: oppMode === "count" ? Math.round(42 * scale) : Math.round(21_000_000_000 * scale / 1_000_000_000),
        won: oppMode === "count" ? Math.round(16 * scale) : Math.round(8_500_000_000 * scale / 1_000_000_000),
      },
      {
        name: "Ban Tài Chính",
        shared: oppMode === "count" ? Math.round(32 * scale) : Math.round(16_000_000_000 * scale / 1_000_000_000),
        won: oppMode === "count" ? Math.round(12 * scale) : Math.round(6_000_000_000 * scale / 1_000_000_000),
      },
      {
        name: "Ban Truyền Thông",
        shared: oppMode === "count" ? Math.round(36 * scale) : Math.round(10_000_000_000 * scale / 1_000_000_000),
        won: oppMode === "count" ? Math.round(10 * scale) : Math.round(4_000_000_000 * scale / 1_000_000_000),
      },
      {
        name: "Ban Thiện Nguyện",
        shared: oppMode === "count" ? Math.round(28 * scale) : Math.round(5_000_000_000 * scale / 1_000_000_000),
        won: oppMode === "count" ? Math.round(8 * scale) : Math.round(2_000_000_000 * scale / 1_000_000_000),
      },
    ];
  }, [timeScaleMultiplier, oppMode]);

  // DỮ LIỆU BIỂU ĐỒ 4: BIỂU ĐỒ ĐƯỜNG (LINE CHART) - Biến động & tăng trưởng theo thời gian
  const lineTrendsData = useMemo(() => {
    const scale = timeScaleMultiplier;
    const ticks = streamTicker;

    if (timeFilter === "hour") {
      return [
        { label: "08:00", value: oppMode === "count" ? 12 : 5.2, deal: 4 },
        { label: "10:00", value: oppMode === "count" ? 28 : 14.5, deal: 10 },
        { label: "12:00", value: oppMode === "count" ? 18 : 8.1, deal: 6 },
        { label: "14:00", value: oppMode === "count" ? 42 + (ticks % 3) : 22.4, deal: 16 },
        { label: "16:00", value: oppMode === "count" ? 56 + (ticks % 4) : 31.8, deal: 22 },
        { label: "18:00", value: oppMode === "count" ? 38 : 18.2, deal: 12 },
        { label: "20:00", value: oppMode === "count" ? 24 : 11.5, deal: 8 },
      ];
    }

    if (timeFilter === "day") {
      return [
        { label: "Thứ 2", value: oppMode === "count" ? 32 : 18.2, deal: 12 },
        { label: "Thứ 3", value: oppMode === "count" ? 45 : 24.6, deal: 18 },
        { label: "Thứ 4", value: oppMode === "count" ? 58 : 34.0, deal: 22 },
        { label: "Thứ 5", value: oppMode === "count" ? 64 + (ticks % 3) : 39.5, deal: 26 },
        { label: "Thứ 6", value: oppMode === "count" ? 72 + (ticks % 4) : 46.2, deal: 30 },
        { label: "Thứ 7", value: oppMode === "count" ? 40 : 22.0, deal: 14 },
        { label: "CN", value: oppMode === "count" ? 28 : 14.8, deal: 9 },
      ];
    }

    // Default: month / quarter / year timeline
    return [
      { label: "T1", value: oppMode === "count" ? Math.round(28 * scale) : 14.2, deal: Math.round(10 * scale) },
      { label: "T2", value: oppMode === "count" ? Math.round(36 * scale) : 19.5, deal: Math.round(14 * scale) },
      { label: "T3", value: oppMode === "count" ? Math.round(52 * scale) : 28.4, deal: Math.round(20 * scale) },
      { label: "T4", value: oppMode === "count" ? Math.round(48 * scale) : 25.1, deal: Math.round(18 * scale) },
      { label: "T5", value: oppMode === "count" ? Math.round(68 * scale) : 38.6, deal: Math.round(26 * scale) },
      { label: "T6", value: oppMode === "count" ? Math.round(85 * scale) : 49.0, deal: Math.round(34 * scale) },
      { label: "T7", value: oppMode === "count" ? Math.round(74 * scale) : 42.8, deal: Math.round(29 * scale) },
      { label: "T8", value: oppMode === "count" ? Math.round(92 * scale + (ticks % 3)) : 56.5, deal: Math.round(36 * scale) },
      { label: "T9", value: oppMode === "count" ? Math.round(108 * scale + (ticks % 4)) : 68.2, deal: Math.round(42 * scale) },
      { label: "T10", value: oppMode === "count" ? Math.round(116 * scale + (ticks % 5)) : 74.0, deal: Math.round(46 * scale) },
      { label: "T11", value: oppMode === "count" ? Math.round(128 * scale) : 82.5, deal: Math.round(50 * scale) },
      { label: "T12", value: oppMode === "count" ? Math.round(145 * scale) : 96.0, deal: Math.round(58 * scale) },
    ];
  }, [timeFilter, timeScaleMultiplier, oppMode, streamTicker]);

  // Real-time animation loop: Cứ mỗi 3.5 giây tự động cập nhật số liệu luân chuyển
  useEffect(() => {
    const timer = setInterval(() => {
      setRealtimePulse(true);
      setStreamTicker((prev) => prev + 1);
      setTimeout(() => setRealtimePulse(false), 800);
    }, 3500);

    return () => clearInterval(timer);
  }, []);

  // Xử lý xuất báo cáo Excel
  const handleExportReport = () => {
    toast.success("Đang tạo và tải xuống báo cáo thống kê Excel CEO 1983...");
    const csvContent =
      "\uFEFF" +
      [
        [`BÁO CÁO THỐNG KÊ DOANH NGHIỆP CEO 1983 - BỘ LỌC: ${timeFilter.toUpperCase()}`],
        [`Thời gian xuất: ${new Date().toLocaleString("vi-VN")}`],
        [],
        ["CHỈ SỐ TỔNG HỢP HIỆP HỘI", "SỐ LƯỢNG", "GIÁ TRỊ (VNĐ)"],
        ["Tổng cơ hội kinh doanh toàn thị trường", oppStats.total.count, oppStats.total.value],
        ["Số cơ hội đã trao đi (Givers)", oppStats.shared.count, oppStats.shared.value],
        ["Số cơ hội đã Deal thành công (Chốt sales)", oppStats.won.count, oppStats.won.value],
        [],
        ["BẢNG VINH DANH TOP 3 HỘI VIÊN TRAO NHIỀU CƠ HỘI NHẤT"],
        ["Hạng", "Họ Tên", "Doanh Nghiệp", "Số Cơ Hội", "Giá Trị Trao Đi"],
        ...topGivers.map((g) => [g.rank, g.name, g.company, g.count, g.value]),
        [],
        ["CHỈ SỐ TƯƠNG TÁC CÁ NHÂN", "KẾT QUẢ"],
        ["Lượt share (chia sẻ)", personalStats.sharesCount],
        ["Lượt tham gia hoạt động/event", personalStats.eventsJoined],
        ["Tổng thời gian active trong app (giờ)", personalStats.activeHours],
        ["Lượt comment/tương tác bài viết", personalStats.commentsCount],
      ]
        .map((r) => r.join(","))
        .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Bao_Cao_Thong_Ke_CEO1983_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AppShell>
      <div className="space-y-6 font-sans pb-16">
        {/* ── HEADER & TOOLBAR BỘ LỌC THỜI GIAN ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-[#002855] text-amber-400">
                <Sparkles className="size-5" />
              </span>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                  <span>Dashboard Thống Kê CEO 1983</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 border border-red-200">
                    B2B Analytics
                  </span>
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Phân tích dòng luân chuyển cơ hội kinh doanh & tương tác hội viên thời gian thực
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Realtime Live Indicator */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
              <span className="relative flex h-2.5 w-2.5">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    realtimePulse ? "bg-amber-400 scale-150" : "bg-emerald-400"
                  }`}
                />
                <span
                  className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                    realtimePulse ? "bg-amber-500" : "bg-emerald-500"
                  }`}
                />
              </span>
              <span className="font-bold text-slate-700 dark:text-slate-200 font-mono text-[11px]">
                {realtimePulse ? "DỮ LIỆU ĐANG NHẢY..." : "REAL-TIME LIVE"}
              </span>
            </div>

            {/* BỘ LỌC THỜI GIAN LINH HOẠT (Time Filter: Giờ, Ngày, Tháng, Quý, Năm) */}
            <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800/90 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
              {(
                [
                  { id: "hour", label: "Giờ" },
                  { id: "day", label: "Ngày" },
                  { id: "month", label: "Tháng" },
                  { id: "quarter", label: "Quý" },
                  { id: "year", label: "Năm" },
                ] as const
              ).map((tf) => {
                const isActive = timeFilter === tf.id;
                return (
                  <button
                    key={tf.id}
                    type="button"
                    onClick={() => {
                      setTimeFilter(tf.id);
                      toast.info(`Đã áp dụng bộ lọc: Thống kê theo ${tf.label}`);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      isActive
                        ? "bg-[#002855] text-white shadow-xs"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    {tf.label}
                  </button>
                );
              })}
            </div>

            {/* Nút Xuất Excel */}
            <button
              type="button"
              onClick={handleExportReport}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-sm active:scale-95 transition cursor-pointer"
            >
              <Download className="size-3.5" />
              <span>Xuất Báo Cáo</span>
            </button>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════
            PHẦN 1: THỐNG KÊ CƠ HỘI KINH DOANH TRONG HIỆP HỘI
        ══════════════════════════════════════════════════════════════ */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="size-3 rounded-full bg-red-600" />
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white uppercase tracking-wide">
                1. Cơ Hội Kinh Doanh Toàn Hiệp Hội
              </h2>
            </div>

            {/* TAB CHUYỂN ĐỔI CHẾ ĐỘ: "SỐ LƯỢNG" vs "GIÁ TRỊ" */}
            <div className="flex items-center gap-1 p-1 bg-slate-200/80 dark:bg-slate-800 rounded-xl w-fit">
              <button
                type="button"
                onClick={() => setOppMode("count")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  oppMode === "count"
                    ? "bg-white dark:bg-slate-700 text-[#002855] dark:text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                🔢 Thống kê theo Số lượng
              </button>
              <button
                type="button"
                onClick={() => setOppMode("value")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  oppMode === "value"
                    ? "bg-white dark:bg-slate-700 text-red-600 dark:text-red-400 shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                💰 Thống kê theo Giá trị (VNĐ)
              </button>
            </div>
          </div>

          {/* 3 METRIC CARDS (BỐ CỤC TỔNG - DASHBOARD UI) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Card 1: Tổng số cơ hội toàn thị trường/hiệp hội */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition relative overflow-hidden group">
              <div className="absolute top-0 right-0 size-24 bg-blue-500/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform" />
              <div className="flex items-center justify-between pb-3">
                <span className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#002855] dark:text-blue-400">
                  <Briefcase className="size-5" />
                </span>
                <span className="inline-flex items-center gap-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full">
                  <ArrowUpRight className="size-3.5" />
                  <span>{oppStats.total.growth}</span>
                </span>
              </div>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Tổng Cơ Hội Toàn Hiệp Hội
              </p>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-[#002855] dark:text-white tracking-tight">
                  {oppMode === "count"
                    ? `${oppStats.total.count.toLocaleString("vi-VN")} cơ hội`
                    : formatVND(oppStats.total.value)}
                </span>
              </div>
              <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
                Toàn bộ nhu cầu mua, bán, hợp tác và đầu tư trong mạng lưới
              </p>
            </div>

            {/* Card 2: Số cơ hội đã trao đi (Givers) */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition relative overflow-hidden group">
              <div className="absolute top-0 right-0 size-24 bg-amber-500/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform" />
              <div className="flex items-center justify-between pb-3">
                <span className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                  <Handshake className="size-5" />
                </span>
                <span className="inline-flex items-center gap-0.5 text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-full">
                  <span>{oppStats.shared.rate} tổng nguồn</span>
                </span>
              </div>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Số Cơ Hội Đã Trao Đi (Givers)
              </p>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 tracking-tight">
                  {oppMode === "count"
                    ? `${oppStats.shared.count.toLocaleString("vi-VN")} cơ hội`
                    : formatVND(oppStats.shared.value)}
                </span>
              </div>
              <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
                Được các hội viên tích cực kết nối và trao gửi cho đối tác
              </p>
            </div>

            {/* Card 3: Số cơ hội đã Deal thành công (Chốt sales) */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition relative overflow-hidden group">
              <div className="absolute top-0 right-0 size-24 bg-red-500/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform" />
              <div className="flex items-center justify-between pb-3">
                <span className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400">
                  <Award className="size-5" />
                </span>
                <span className="inline-flex items-center gap-0.5 text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50 px-2 py-0.5 rounded-full">
                  <span>{oppStats.won.rate} chốt sales</span>
                </span>
              </div>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Cơ Hội Deal Thành Công (Won Deals)
              </p>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-red-600 dark:text-red-400 tracking-tight">
                  {oppMode === "count"
                    ? `${oppStats.won.count.toLocaleString("vi-VN")} hợp đồng`
                    : formatVND(oppStats.won.value)}
                </span>
              </div>
              <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
                Đã ký kết hợp đồng và phát sinh doanh số thực tế
              </p>
            </div>
          </div>

          {/* BẢNG XẾP HẠNG (LEADERBOARD): TOP 3 HỘI VIÊN TRAO ĐI NHIỀU CƠ HỘI NHẤT */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
                  <Crown className="size-5" />
                </span>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                    Bảng Xếp Hạng Vinh Danh Top 3 Hội Viên Trao Cơ Hội (Top Givers)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Xếp hạng theo {oppMode === "count" ? "Số lượng cơ hội trao đi" : "Tổng giá trị cơ hội đã trao"}
                  </p>
                </div>
              </div>

              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800">
                ⭐ Văn hóa Hiệp hội: Trao giá trị - Nhận thành công
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
              {topGivers.map((giver) => {
                return (
                  <div
                    key={giver.rank}
                    className={`relative p-4 rounded-2xl border ${giver.borderColor} bg-gradient-to-b ${giver.bgGradient} flex flex-col justify-between gap-3 shadow-xs hover:scale-[1.01] transition-transform`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img
                            src={giver.avatar}
                            alt={giver.name}
                            className="size-12 rounded-xl object-cover ring-2 ring-white dark:ring-slate-800 shadow-xs"
                          />
                          <span className="absolute -top-1.5 -left-1.5 text-lg leading-none">
                            {giver.medal}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                            {giver.badge}
                          </span>
                          <h4 className="text-sm font-black text-slate-900 dark:text-white truncate">
                            {giver.name}
                          </h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            {giver.company}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        {oppMode === "count" ? "Số cơ hội trao đi:" : "Giá trị đã trao:"}
                      </span>
                      <span className="text-base font-black text-slate-900 dark:text-white">
                        {oppMode === "count" ? `${giver.count} cơ hội` : formatVND(giver.value)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════
            PHẦN 2: THỐNG KÊ TƯƠNG TÁC CÁ NHÂN (XEM TÀI KHOẢN CỦA MÌNH)
        ══════════════════════════════════════════════════════════════ */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="size-3 rounded-full bg-[#002855]" />
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white uppercase tracking-wide">
                2. Thống Kê Tương Tác Cá Nhân (Tài Khoản Của Bạn)
              </h2>
            </div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Đang xem: <strong className="text-slate-900 dark:text-white">{currentMember.name}</strong> ({currentMember.company})
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* 1. Lượt Share */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between gap-2">
              <div className="flex items-center justify-between">
                <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#002855] dark:text-blue-400">
                  <Share2 className="size-4.5" />
                </span>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full">
                  +15% tháng này
                </span>
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Lượt Share (Chia sẻ)
                </p>
                <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
                  {personalStats.sharesCount} <span className="text-xs font-normal text-slate-400">lượt</span>
                </p>
              </div>
            </div>

            {/* 2. Lượt tham gia các hoạt động/event */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between gap-2">
              <div className="flex items-center justify-between">
                <span className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                  <Calendar className="size-4.5" />
                </span>
                <span className="text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-full">
                  Điểm danh QR 100%
                </span>
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Tham Gia Hoạt Động / Event
                </p>
                <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
                  {personalStats.eventsJoined} <span className="text-xs font-normal text-slate-400">sự kiện</span>
                </p>
              </div>
            </div>

            {/* 3. Tổng thời gian active trong app */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between gap-2">
              <div className="flex items-center justify-between">
                <span className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                  <Clock className="size-4.5" />
                </span>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full">
                  Tích cực
                </span>
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Tổng Thời Gian Active
                </p>
                <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
                  {personalStats.activeHours} <span className="text-xs font-normal text-slate-400">Giờ</span>
                </p>
              </div>
            </div>

            {/* 4. Lượt comment/tương tác trên bài viết */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between gap-2">
              <div className="flex items-center justify-between">
                <span className="p-2 rounded-xl bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400">
                  <MessageSquare className="size-4.5" />
                </span>
                <span className="text-[10px] font-bold text-red-600 bg-red-50 dark:bg-red-950/50 px-2 py-0.5 rounded-full">
                  Thảo luận sôi nổi
                </span>
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Lượt Comment / Tương Tác
                </p>
                <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
                  {personalStats.commentsCount} <span className="text-xs font-normal text-slate-400">lượt</span>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════
            PHẦN 3: BỘ 5 DẠNG HIỂN THỊ TRỰC QUAN (VISUAL CHARTS)
        ══════════════════════════════════════════════════════════════ */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="size-3 rounded-full bg-amber-500" />
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white uppercase tracking-wide">
              3. Hệ Thống 5 Biểu Đồ Trực Quan Đa Chiều (Visual Charts)
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* ── BIỂU ĐỒ 1: CÂY ĐƠN VỊ (TREEMAP / HIERARCHY CHART) ── */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between gap-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950 text-[#002855]">
                    <Layers className="size-4" />
                  </span>
                  <div>
                    <h3 className="text-xs font-extrabold uppercase text-slate-900 dark:text-white">
                      1. Biểu Đồ Cây Đơn Vị (Treemap Hierarchy)
                    </h3>
                    <p className="text-[10.5px] text-slate-500">
                      Tỷ trọng cơ hội kinh doanh theo nhóm ngành nghề ({oppMode === "count" ? "Số lượng" : "Giá trị"})
                    </p>
                  </div>
                </div>
              </div>

              <div className="w-full h-64 pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <Treemap
                    data={treemapIndustriesData}
                    dataKey="value"
                    aspectRatio={4 / 3}
                    stroke="#fff"
                    content={<CustomTreemapContent />}
                  />
                </ResponsiveContainer>
              </div>
            </div>

            {/* ── BIỂU ĐỒ 2: BIỂU ĐỒ TRÒN (DONUT / PIE CHART) ── */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between gap-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-red-50 dark:bg-red-950 text-red-600">
                    <PieIcon className="size-4" />
                  </span>
                  <div>
                    <h3 className="text-xs font-extrabold uppercase text-slate-900 dark:text-white">
                      2. Biểu Đồ Tròn (Donut / Pie Chart)
                    </h3>
                    <p className="text-[10.5px] text-slate-500">
                      Tỷ lệ Deal thành công vs Đang đàm phán vs Chưa khớp
                    </p>
                  </div>
                </div>
              </div>

              <div className="w-full h-64 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieDealsData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={4}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {pieDealsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => [`${value} cơ hội`, "Khối lượng"]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* ── BIỂU ĐỒ 3: BIỂU ĐỒ CỘT (BAR CHART) ── */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between gap-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-600">
                    <BarChart3 className="size-4" />
                  </span>
                  <div>
                    <h3 className="text-xs font-extrabold uppercase text-slate-900 dark:text-white">
                      3. Biểu Đồ Cột (Bar Chart So Sánh)
                    </h3>
                    <p className="text-[10.5px] text-slate-500">
                      So sánh cơ hội trao đi vs Deal thành công giữa các Ban chuyên môn
                    </p>
                  </div>
                </div>
              </div>

              <div className="w-full h-64 pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barCommitteesData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 10 }}
                      interval={0}
                      angle={-15}
                      textAnchor="end"
                    />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip
                      formatter={(val: any) => [
                        oppMode === "count" ? `${val} cơ hội` : `${val} Tỷ đ`,
                        "",
                      ]}
                    />
                    <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                    <Bar dataKey="shared" name="Cơ hội trao đi" fill={BRAND_COLORS.gold} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="won" name="Deal thành công" fill={BRAND_COLORS.red} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* ── BIỂU ĐỒ 4: BIỂU ĐỒ ĐƯỜNG (LINE CHART) ── */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between gap-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950 text-[#002855]">
                    <LineIcon className="size-4" />
                  </span>
                  <div>
                    <h3 className="text-xs font-extrabold uppercase text-slate-900 dark:text-white">
                      4. Biểu Đồ Đường (Line Chart Tăng Trưởng)
                    </h3>
                    <p className="text-[10.5px] text-slate-500">
                      Đường cong tăng trưởng cơ hội & khớp lệnh theo mốc thời gian ({timeFilter})
                    </p>
                  </div>
                </div>
              </div>

              <div className="w-full h-64 pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={lineTrendsData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip
                      formatter={(val: any) => [
                        oppMode === "count" ? `${val} cơ hội` : `${val} Tỷ đ`,
                        "",
                      ]}
                    />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Line
                      type="monotone"
                      dataKey="value"
                      name={oppMode === "count" ? "Cơ hội mới" : "Giá trị (Tỷ đ)"}
                      stroke={BRAND_COLORS.navy}
                      strokeWidth={3}
                      dot={{ r: 3 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="deal"
                      name="Deal chốt sales"
                      stroke={BRAND_COLORS.red}
                      strokeWidth={2}
                      strokeDasharray="4 4"
                      dot={{ r: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
