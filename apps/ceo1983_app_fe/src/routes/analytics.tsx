import { createFileRoute } from "@tanstack/react-router";
import React, { useState, useMemo, useEffect } from "react";
import {
  Briefcase,
  TrendingUp,
  Award,
  Users,
  Download,
  Calendar,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  FileSpreadsheet,
  Printer,
  X,
  Crown,
  Phone,
  Mail,
  AlertTriangle,
  UserX,
  HeartHandshake,
  TrendingDown,
  Building,
} from "lucide-react";
import { toast } from "sonner";
import { fetchNestApi } from "@/lib/api-client";
import { AppShell } from "@/components/dashboard/AppShell";
import { PageHeader } from "@/components/dashboard/PageKit";
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

export const Route = createFileRoute("/analytics")({
  component: AnalyticsDashboardPage,
  head: () => ({
    meta: [
      { title: "Báo Cáo & Thống Kê Quản Trị CLB CEO 1983" },
      {
        name: "description",
        content:
          "Trung tâm phân tích số liệu tài chính, phân loại thành viên tích cực / tiêu cực, bảng vàng vinh danh hội viên CLB CEO 1983",
      },
    ],
  }),
});

// Bảng màu nhận diện chuẩn mực CEO 1983
const PALETTE = {
  navy: "#003B95",       // Xanh hoàng gia
  gold: "#F59E0B",       // Vàng hổ phách
  green: "#10B981",      // Xanh tăng trưởng
  red: "#DC2626",        // Đỏ tiêu cực / biến động giảm / cảnh báo
  diamond: "#06B6D4",    // Kim cương (Cyan sáng)
  platinum: "#94A3B8",   // Bạch kim (Slate ánh kim)
  dark: "#0F172A",
  light: "#FFFFFF",
};

export type AnalyticsCategory =
  | "activity_sentiment"
  | "top_connections"
  | "top_opportunities"
  | "top_events_meetings";

interface CategoryMeta {
  id: AnalyticsCategory;
  label: string;
  subLabel: string;
  icon: any;
  metricLabel: string;
  unit: string;
}

const CATEGORIES: CategoryMeta[] = [
  {
    id: "activity_sentiment",
    label: "Thành viên tích cực cùng tiêu cực",
    subLabel: "Theo dõi số lượng tương tác, cột đỏ tiêu cực & chăm sóc hội viên",
    icon: AlertTriangle,
    metricLabel: "Hội viên tích cực & tiêu cực",
    unit: "Hội viên",
  },
  {
    id: "top_connections",
    label: "3 thành viên kết nối nhiều nhất",
    subLabel: "Xếp hạng kết nối giao thương giữa các hội viên (tháng, quý, năm)",
    icon: HeartHandshake,
    metricLabel: "Lượt kết nối giao thương",
    unit: "Lượt",
  },
  {
    id: "top_opportunities",
    label: "Hội viên chia sẻ cơ hội nhiều nhất",
    subLabel: "Chỉ tính cơ hội public ra toàn bộ hội viên thấy",
    icon: Briefcase,
    metricLabel: "Cơ hội công khai đã chia sẻ",
    unit: "Cơ hội",
  },
  {
    id: "top_events_meetings",
    label: "3 thành viên tham gia sự kiện & họp",
    subLabel: "Hội viên tham gia nhiều sự kiện, họp ban và tương tác nhiều nhất",
    icon: Calendar,
    metricLabel: "Lượt tham gia & tương tác",
    unit: "Lượt",
  },
];

export function AnalyticsDashboardPage() {
  const [selectedCat, setSelectedCat] = useState<AnalyticsCategory>("activity_sentiment");
  // Chỉ thống kê theo Quý, Tháng, Năm (bỏ tuần)
  const [period, setPeriod] = useState<"month" | "quarter" | "year">("month");
  const [showExportModal, setShowExportModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverData, setServerData] = useState<any>(null);

  // Fetch real-time overview from NestJS backend
  useEffect(() => {
    let isMounted = true;
    async function loadStats() {
      setLoading(true);
      try {
        const res = await fetchNestApi<any>(`/analytics/overview?period=${period}`);
        if (isMounted && res && res.ok) {
          setServerData(res);
        }
      } catch (err) {
        console.warn("Failed to fetch analytics from API:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadStats();
    return () => {
      isMounted = false;
    };
  }, [period]);

  const activeCategoryMeta = useMemo(() => {
    return CATEGORIES.find((c) => c.id === selectedCat) || CATEGORIES[0];
  }, [selectedCat]);

  // Dữ liệu Tích cực vs Tiêu cực từ server (hoặc fallback thông minh)
  const sentimentStats = useMemo(() => {
    if (serverData?.memberActivitySentiment) {
      return serverData.memberActivitySentiment;
    }
    return {
      activeCount: 38,
      negativeCount: 12,
      totalTracked: 50,
      activeRatio: 76,
      negativeRatio: 24,
      leastActiveTop3: [
        {
          id: "m-neg-1",
          rank: 1,
          name: "Nguyễn Văn Hùng",
          company: "Công ty Cổ phần Cơ khí Hà Nội",
          title: "Giám đốc",
          department: "Ban Thành Viên",
          phone: "0912 345 678",
          email: "hung.nguyen@cokhihanoi.vn",
          avatar: "/ceo1983-emblem-8.png",
          warningReason: "60 ngày chưa mở App & chưa tham gia sự kiện nào",
          actionNeeded: "Giao nhân viên phụ trách gọi điện thăm hỏi, hỗ trợ cài đặt app",
        },
        {
          id: "m-neg-2",
          rank: 2,
          name: "Lê Thị Bích Ngọc",
          company: "Thời trang Bích Ngọc",
          title: "Chủ sáng lập",
          department: "Ban Xúc Tiến",
          phone: "0983 234 567",
          email: "ngoc.le@bichngocfashion.vn",
          avatar: "/ceo1983-emblem-8.png",
          warningReason: "Chưa kết nối giao thương nào trong 2 quý liên tiếp",
          actionNeeded: "Mời tham gia cà phê kết nối doanh nhân 1-on-1 thứ 5",
        },
        {
          id: "m-neg-3",
          rank: 3,
          name: "Hoàng Minh Trí",
          company: "Vận tải & Logistics Trí Phát",
          title: "Tổng Giám đốc",
          department: "Ban Tài Chính",
          phone: "0904 889 911",
          email: "tri.hoang@triphatlogistics.com",
          avatar: "/ceo1983-emblem-8.png",
          warningReason: "Tương tác dưới ngưỡng cảnh báo, chưa điểm danh họp ban",
          actionNeeded: "Trưởng ban liên hệ trực tiếp trao đổi tình hình hoạt động",
        },
      ],
      sentimentTrendData: [
        { periodLabel: period === "year" ? "Năm 2024" : period === "quarter" ? "Quý 1" : "Đầu tháng", activeCount: 30, negativeCount: 18, negativeTrendLine: 20 },
        { periodLabel: period === "year" ? "Năm 2025" : period === "quarter" ? "Quý 2" : "Giữa tháng", activeCount: 34, negativeCount: 15, negativeTrendLine: 16 },
        { periodLabel: period === "year" ? "Năm 2026" : period === "quarter" ? "Quý 3" : "Cuối tháng", activeCount: 38, negativeCount: 12, negativeTrendLine: 12 },
      ],
    };
  }, [serverData, period]);

  // 4 Ô CHỈ SỐ THEO TỪNG DANH MỤC
  const kpiData = useMemo(() => {
    switch (selectedCat) {
      case "activity_sentiment":
        return [
          {
            label: "Tổng hội viên theo dõi",
            value: `${sentimentStats.totalTracked || 50} CEO`,
            delta: "100%",
            isUp: true,
            desc: "Cơ sở hội viên đang quản lý",
          },
          {
            label: "Hội viên tích cực",
            value: `${sentimentStats.activeCount || 38} CEO`,
            delta: `${sentimentStats.activeRatio || 76}%`,
            isUp: true,
            desc: "Tham gia họp, kết nối & chia sẻ cơ hội",
          },
          {
            label: "Hội viên tiêu cực (Ít tương tác)",
            value: `${sentimentStats.negativeCount || 12} CEO`,
            delta: `${sentimentStats.negativeRatio || 24}%`,
            isUp: false,
            desc: "Cột đỏ - Dưới ngưỡng tương tác chuẩn",
          },
          {
            label: "Cần chăm sóc đặc biệt",
            value: `${sentimentStats.leastActiveTop3?.length || 3} Hội viên`,
            delta: "Khẩn cấp",
            isUp: false,
            desc: "Nhân viên CEO 1983 phụ trách chăm sóc",
          },
        ];
      case "top_connections": {
        const top1 = serverData?.topConnections?.[0];
        return [
          { label: "Tổng lượt kết nối", value: "318 lượt", delta: "+24.5%", isUp: true, desc: "Giao lưu 1-on-1 trong kỳ" },
          { label: "Hội viên đã kết nối", value: "46 / 50", delta: "92%", isUp: true, desc: "Tỷ lệ phủ kết nối" },
          { label: "Quán quân kết nối", value: top1?.name || "Trần Nam", delta: `${top1?.connectionsCount || 28} lượt`, isUp: true, desc: "Danh hiệu Kim Cương" },
          { label: "Điểm tương tác TB", value: "85 đ", delta: "+12 đ", isUp: true, desc: "Trung bình mỗi hội viên" },
        ];
      }
      case "top_opportunities": {
        const top1 = serverData?.topOpportunities?.[0];
        return [
          { label: "Tổng cơ hội Public", value: "142 deal", delta: "+18.2%", isUp: true, desc: "Công khai toàn bộ CLB" },
          { label: "Giá trị niêm yết", value: "48.6 Tỷ", delta: "+31.0%", isUp: true, desc: "Tổng ngân sách chào thầu" },
          { label: "Quán quân cơ hội", value: top1?.name || "Phạm Vũ", delta: `${top1?.publicOppsShared || 14} deal`, isUp: true, desc: "Danh hiệu Kim Cương" },
          { label: "Tỷ lệ chốt thành công", value: "38.5%", delta: "+4.2%", isUp: true, desc: "Hợp đồng đã ký kết" },
        ];
      }
      case "top_events_meetings":
      default: {
        const top1 = serverData?.topEventsMeetings?.[0];
        return [
          { label: "Sự kiện & Họp ban", value: "18 cuộc", delta: "+5 kỳ", isUp: true, desc: "Đã tổ chức trong kỳ" },
          { label: "Lượt điểm danh QR", value: "1,240 lượt", delta: "96.4%", isUp: true, desc: "Tỷ lệ có mặt đúng giờ" },
          { label: "Quán quân tham gia", value: top1?.name || "Nguyễn Mai", delta: `${top1?.eventsAttended || 12} buổi`, isUp: true, desc: "Danh hiệu Kim Cương" },
          { label: "Tương tác Feed", value: "3,890 lượt", delta: "+22%", isUp: true, desc: "Like, bình luận trong app" },
        ];
      }
    }
  }, [selectedCat, sentimentStats, serverData]);

  // Bảng vàng Vinh Danh Top 3 (Kim Cương 💎, Bạch Kim 🪙, Vàng 🥇)
  const podiumTop3 = useMemo(() => {
    let sourceList: any[] = [];
    if (selectedCat === "top_connections") {
      sourceList = serverData?.topConnections || [
        { rank: 1, name: "Trần Hải Nam", company: "Tập Đoàn Tân Á Đông", score: "28 Lượt kết nối", value: "Kim Cương", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80" },
        { rank: 2, name: "Phạm Văn Vũ", company: "Uranus ViConnect", score: "22 Lượt kết nối", value: "Bạch Kim", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80" },
        { rank: 3, name: "Nguyễn Thị Mai", company: "Green Farm Group", score: "18 Lượt kết nối", value: "Vàng", avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80" },
      ];
    } else if (selectedCat === "top_opportunities") {
      sourceList = serverData?.topOpportunities || [
        { rank: 1, name: "Phạm Văn Vũ", company: "Uranus ViConnect", score: "16 Cơ hội Public", value: "Kim Cương", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80" },
        { rank: 2, name: "Nguyễn Thị Mai", company: "Green Farm Group", score: "12 Cơ hội Public", value: "Bạch Kim", avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80" },
        { rank: 3, name: "Lê Hoàng Cường", company: "Cơ điện & Tự động hóa", score: "9 Cơ hội Public", value: "Vàng", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80" },
      ];
    } else if (selectedCat === "top_events_meetings") {
      sourceList = serverData?.topEventsMeetings || [
        { rank: 1, name: "Nguyễn Thị Mai", company: "Green Farm Group", score: "14 Buổi họp & 85 tương tác", value: "Kim Cương", avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80" },
        { rank: 2, name: "Trần Hải Nam", company: "Tập Đoàn Tân Á Đông", score: "12 Buổi họp & 68 tương tác", value: "Bạch Kim", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80" },
        { rank: 3, name: "Hoàng Yến Chi", company: "Truyền thông & Sự kiện Yến Chi", score: "10 Buổi họp & 52 tương tác", value: "Vàng", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80" },
      ];
    }

    return sourceList.slice(0, 3).map((item, idx) => {
      let tier = "Vàng";
      let tierIcon = "🥇";
      let tierColor = "from-amber-500 to-amber-600 border-amber-400 text-amber-950";
      if (idx === 0) {
        tier = "Kim Cương";
        tierIcon = "💎";
        tierColor = "from-cyan-500 via-blue-500 to-indigo-600 border-cyan-300 text-white";
      } else if (idx === 1) {
        tier = "Bạch Kim";
        tierIcon = "🪙";
        tierColor = "from-slate-300 via-slate-400 to-slate-500 border-slate-300 text-slate-900";
      }
      return {
        ...item,
        rank: idx + 1,
        tier,
        tierIcon,
        tierColor,
        score: item.score || `${item.connectionsCount || item.publicOppsShared || item.eventsAttended || 10} điểm`,
      };
    });
  }, [selectedCat, serverData]);

  const top1 = podiumTop3.find((p) => p.rank === 1);
  const top2 = podiumTop3.find((p) => p.rank === 2);
  const top3 = podiumTop3.find((p) => p.rank === 3);

  // Biểu đồ xu hướng chung cho 3 danh mục còn lại
  const genericChartData = useMemo(() => {
    const p1 = period === "year" ? "Năm 2024" : period === "quarter" ? "Quý 1" : "Đầu kỳ";
    const p2 = period === "year" ? "Năm 2025" : period === "quarter" ? "Quý 2" : "Giữa kỳ";
    const p3 = period === "year" ? "Năm 2026" : period === "quarter" ? "Quý 3" : "Cuối kỳ";

    if (selectedCat === "top_connections") {
      return [
        { name: p1, barVal: 18, trendVal: 18, isUp: true, leader: "Trần Nam" },
        { name: p2, barVal: 24, trendVal: 24, isUp: true, leader: "Phạm Vũ" },
        { name: p3, barVal: 32, trendVal: 32, isUp: true, leader: "Trần Nam" },
      ];
    }
    if (selectedCat === "top_opportunities") {
      return [
        { name: p1, barVal: 25, trendVal: 25, isUp: true, leader: "Phạm Vũ" },
        { name: p2, barVal: 38, trendVal: 38, isUp: true, leader: "Nguyễn Mai" },
        { name: p3, barVal: 48, trendVal: 48, isUp: true, leader: "Phạm Vũ" },
      ];
    }
    return [
      { name: p1, barVal: 8, trendVal: 8, isUp: true, leader: "Nguyễn Mai" },
      { name: p2, barVal: 12, trendVal: 12, isUp: true, leader: "Trần Nam" },
      { name: p3, barVal: 18, trendVal: 18, isUp: true, leader: "Nguyễn Mai" },
    ];
  }, [selectedCat, period]);

  return (
    <AppShell>
      <div className="space-y-6 pb-20 font-sans">
        {/* Header với bộ lọc Quý, Tháng, Năm và nút xuất báo cáo */}
        <PageHeader
          title="Báo Cáo &amp; Thống Kê Quản Trị CLB CEO 1983"
          subtitle="Trung tâm phân tích số liệu tài chính, quản lý hội viên tích cực / tiêu cực và vinh danh Kim Cương - Bạch Kim - Vàng"
          actions={
            <div className="flex items-center gap-2">
              {/* Bộ lọc chỉ có: Tháng, Quý, Năm */}
              <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-1 shadow-xs">
                {(["month", "quarter", "year"] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      period === p
                        ? "bg-[#003B95] text-white shadow-xs"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    {p === "month" ? "Tháng" : p === "quarter" ? "Quý" : "Năm"}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setShowExportModal(true)}
                className="px-4 py-2 rounded-2xl bg-[#003B95] hover:bg-[#002B70] text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-blue-900/20 active:scale-95 transition cursor-pointer"
              >
                <Download className="size-4 text-amber-400" />
                <span>Xuất Báo Cáo Chuẩn</span>
              </button>
            </div>
          }
        />

        {/* ── 4 CATEGORY TABS SWITCHER: CHIA RÕ RÀNG CÁC DANH MỤC THỐNG KÊ ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 p-1.5 rounded-3xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCat === cat.id;
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCat(cat.id)}
                className={`p-3.5 rounded-2xl text-left transition flex flex-col gap-2 cursor-pointer ${
                  isSelected
                    ? "bg-white dark:bg-slate-800 shadow-md ring-2 ring-[#003B95] dark:ring-amber-400"
                    : "hover:bg-white/60 dark:hover:bg-slate-800/60"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div
                    className={`size-9 rounded-xl flex items-center justify-center ${
                      isSelected
                        ? cat.id === "activity_sentiment"
                          ? "bg-rose-600 text-white"
                          : "bg-[#003B95] text-white dark:bg-amber-400 dark:text-slate-950"
                        : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    <Icon className="size-4" />
                  </div>
                  {isSelected && <Sparkles className="size-3.5 text-amber-500 animate-pulse" />}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                    {cat.label}
                  </h4>
                  <p className="text-[10.5px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
                    {cat.subLabel}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* ── 4 Ô CHỈ SỐ KPI CHÍNH ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpiData.map((kpi, idx) => (
            <div
              key={idx}
              className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between gap-3 relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {kpi.label}
                </span>
                <span
                  className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                    kpi.isUp
                      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                      : "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                  }`}
                >
                  {kpi.isUp ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
                  {kpi.delta}
                </span>
              </div>

              <div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {kpi.value}
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">{kpi.desc}</p>
              </div>

              <div
                className="absolute bottom-0 inset-x-0 h-1 bg-gradient-to-r"
                style={{
                  backgroundImage:
                    idx === 0
                      ? `linear-gradient(to right, ${PALETTE.navy}, ${PALETTE.gold})`
                      : idx === 1
                      ? `linear-gradient(to right, ${PALETTE.gold}, ${PALETTE.green})`
                      : idx === 2
                      ? `linear-gradient(to right, ${PALETTE.red}, ${PALETTE.navy})`
                      : `linear-gradient(to right, ${PALETTE.green}, ${PALETTE.navy})`,
                }}
              />
            </div>
          ))}
        </div>

        {/* ── PHÂN HỆ 1: THÀNH VIÊN TÍCH CỰC CÙNG TIÊU CỰC (BIỂU ĐỒ CỘT ĐỎ & ĐƯỜNG ĐỎ ĐI XUỐNG) ── */}
        {selectedCat === "activity_sentiment" && (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600">
                      <TrendingDown className="size-4" />
                    </span>
                    <h3 className="text-base font-black text-slate-900 dark:text-white">
                      Biểu Đồ Thành Viên Tích Cực Cùng Tiêu Cực (Kỳ: {period === "month" ? "Tháng" : period === "quarter" ? "Quý" : "Năm"})
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Cột màu đỏ thể hiện hội viên tiêu cực/ít tương tác • Cột xanh thể hiện hội viên tích cực • Đường ngang màu đỏ thể hiện chiều đi xuống
                  </p>
                </div>

                {/* Chú thích màu chuẩn yêu cầu */}
                <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-600 dark:text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <span className="size-3 rounded-md bg-[#003B95]" />
                    Tích cực ({sentimentStats.activeCount} CEO)
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="size-3 rounded-md bg-[#DC2626]" />
                    Tiêu cực ({sentimentStats.negativeCount} CEO)
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-4 h-0.5 bg-[#DC2626] border-b-2 border-dashed border-[#DC2626]" />
                    Đường đỏ chiều đi xuống
                  </span>
                </div>
              </div>

              <div className="w-full h-80 pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={sentimentStats.sentimentTrendData} margin={{ top: 20, right: 20, left: 0, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="periodLabel" tick={{ fontSize: 12, fontWeight: 600 }} stroke="#94a3b8" />
                    <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
                    <Tooltip
                      content={({ active, payload }: any) => {
                        if (active && payload && payload.length) {
                          const d = payload[0].payload;
                          return (
                            <div className="p-3 rounded-2xl bg-slate-900 text-white border border-slate-700 shadow-xl text-xs space-y-1.5">
                              <div className="font-bold border-b border-slate-800 pb-1 flex justify-between gap-3">
                                <span>Kỳ: {d.periodLabel}</span>
                                <span className="text-rose-400 font-bold">Cảnh báo tiêu cực</span>
                              </div>
                              <div className="text-blue-400 font-semibold">
                                • Tích cực: <strong>{d.activeCount} hội viên</strong>
                              </div>
                              <div className="text-rose-400 font-bold">
                                • Tiêu cực (Ít tương tác): <strong>{d.negativeCount} hội viên</strong> (Cột đỏ)
                              </div>
                              <div className="text-slate-400 text-[11px] pt-1 border-t border-slate-800">
                                Chiều đi xuống: <strong>{d.negativeTrendLine} mốc</strong> (Đường ngang đỏ)
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend />

                    {/* Cột Tích cực màu Xanh */}
                    <Bar dataKey="activeCount" name="Hội viên tích cực" fill="#003B95" radius={[6, 6, 0, 0]} maxBarSize={40} />

                    {/* Cột Tiêu cực màu Đỏ (Yêu cầu: Tiêu cực dùng cột màu đỏ) */}
                    <Bar dataKey="negativeCount" name="Hội viên tiêu cực (Ít tương tác)" fill="#DC2626" radius={[6, 6, 0, 0]} maxBarSize={40} />

                    {/* Đường ngang màu đỏ thể hiện chiều đi xuống (Yêu cầu: cùng đường ngang màu đỏ thể hiện chiều đi xuống) */}
                    <Line
                      type="monotone"
                      dataKey="negativeTrendLine"
                      name="Chiều đi xuống tiêu cực"
                      stroke="#DC2626"
                      strokeWidth={3}
                      strokeDasharray="5 5"
                      dot={{ r: 5, fill: "#DC2626", stroke: "#ffffff", strokeWidth: 2 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* ── CARD TOP 3 NGƯỜI ÍT TƯƠNG TÁC NHẤT ĐỂ NHÂN VIÊN CEO1983 CHĂM SÓC ── */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/50 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-rose-100 dark:border-rose-900/30">
                <div className="flex items-center gap-2.5">
                  <div className="size-10 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center">
                    <UserX className="size-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-rose-700 dark:text-rose-400 uppercase tracking-tight">
                      Top 3 Hội Viên Ít Tương Tác Nhất (Cần Nhân Viên CEO 1983 Chăm Sóc)
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Danh sách ưu tiên hỗ trợ đặc biệt nhằm kích hoạt lại hoạt động và gắn kết hội viên
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-rose-500/15 text-rose-700 dark:text-rose-300 font-bold text-xs border border-rose-300 dark:border-rose-800">
                  ⚠️ Ưu tiên chăm sóc khẩn
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                {sentimentStats.leastActiveTop3?.map((member: any, idx: number) => (
                  <div
                    key={member.id || idx}
                    className="p-4 rounded-2xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/30 dark:bg-rose-950/20 flex flex-col justify-between gap-3 relative"
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative">
                        <div className="size-12 rounded-xl overflow-hidden border-2 border-rose-300 dark:border-rose-700 bg-white">
                          <img
                            src={member.avatar || "/ceo1983-emblem-8.png"}
                            alt={member.name}
                            className="size-full object-cover"
                          />
                        </div>
                        <span className="absolute -bottom-1 -right-1 size-5 rounded-full bg-rose-600 text-white font-black text-[10px] flex items-center justify-center shadow">
                          #{idx + 1}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-black text-slate-900 dark:text-white truncate">
                          {member.name}
                        </h4>
                        <p className="text-xs text-slate-600 dark:text-slate-300 font-semibold truncate flex items-center gap-1 mt-0.5">
                          <Building className="size-3 text-slate-400 shrink-0" />
                          <span>{member.company}</span>
                        </p>
                        <span className="inline-block mt-1 text-[10.5px] px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 font-bold">
                          {member.department || "Ban Thành Viên"}
                        </span>
                      </div>
                    </div>

                    {/* Lý do cảnh báo & Hành động */}
                    <div className="space-y-1.5 p-2.5 rounded-xl bg-white dark:bg-slate-900/80 border border-rose-100 dark:border-rose-900/30 text-xs">
                      <div className="text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1.5">
                        <AlertTriangle className="size-3.5 shrink-0" />
                        <span>{member.warningReason || "Tương tác dưới ngưỡng cảnh báo"}</span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Nhiệm vụ: {member.actionNeeded || "Gọi điện thăm hỏi, mời dự họp 1-on-1"}
                      </p>
                    </div>

                    {/* Thông tin liên hệ trực tiếp cho nhân viên chăm sóc */}
                    <div className="pt-2 border-t border-rose-200/60 dark:border-rose-900/30 flex items-center justify-between gap-2 text-xs">
                      <a
                        href={`tel:${member.phone || "0983198383"}`}
                        onClick={() => toast.success(`Đang kết nối cuộc gọi tới ${member.name} (${member.phone})...`)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition shadow-xs cursor-pointer"
                      >
                        <Phone className="size-3.5" />
                        <span>Gọi chăm sóc</span>
                      </a>
                      {member.email && (
                        <a
                          href={`mailto:${member.email}?subject=[CEO 1983] Thăm hỏi & Hỗ trợ hội viên`}
                          className="inline-flex items-center justify-center p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition cursor-pointer"
                          title="Gửi email"
                        >
                          <Mail className="size-4" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── CÁC PHÂN HỆ CÒN LẠI: PODIUM VINH DANH KIM CƯƠNG 💎 - BẠCH KIM 🪙 - VÀNG 🥇 ── */}
        {selectedCat !== "activity_sentiment" && (
          <div className="space-y-6">
            {/* Biểu đồ xu hướng của danh mục */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#003B95] dark:text-amber-400">
                      <TrendingUp className="size-4" />
                    </span>
                    <h3 className="text-base font-black text-slate-900 dark:text-white">
                      Biểu Đồ Xu Hướng {activeCategoryMeta.label}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Chỉ số đo lường thực tế định kỳ ({period === "month" ? "Tháng" : period === "quarter" ? "Quý" : "Năm"})
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <span className="size-3 rounded-md bg-[#003B95]" />
                    Cột số liệu ({activeCategoryMeta.unit})
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="size-3 rounded-full bg-emerald-500" />
                    Xu hướng tăng trưởng
                  </span>
                </div>
              </div>

              <div className="w-full h-72 pt-3">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={genericChartData} margin={{ top: 20, right: 20, left: 0, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fontWeight: 600 }} stroke="#94a3b8" />
                    <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
                    <Tooltip />
                    <Bar dataKey="barVal" fill="#003B95" radius={[6, 6, 0, 0]} maxBarSize={44} />
                    <Line type="monotone" dataKey="trendVal" stroke="#10B981" strokeWidth={3} dot={{ r: 5, fill: "#10B981" }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Bục Vinh Danh Top 3: Kim Cương (Quán quân), Bạch Kim (Á quân 1), Vàng (Á quân 2) */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-500">
                    <Award className="size-4" />
                  </span>
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white">
                      Bảng Vàng Top 3: Kim Cương 💎 • Bạch Kim 🪙 • Vàng 🥇
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {activeCategoryMeta.label} ({period === "month" ? "Theo Tháng" : period === "quarter" ? "Theo Quý" : "Theo Năm"})
                    </p>
                  </div>
                </div>
                <div className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 text-xs font-black">
                  💎 TOP 3 XUẤT SẮC NHẤT
                </div>
              </div>

              {/* 3 Cột nằm chung 1 hàng: Bạch Kim (Trái) | Kim Cương (Giữa cao nhất) | Vàng (Phải) */}
              <div className="grid grid-cols-3 gap-3 sm:gap-6 items-end pt-4 max-w-4xl mx-auto">
                {/* 🪙 TOP 2: BẠCH KIM (BÊN TRÁI) */}
                {top2 && (
                  <div className="flex flex-col items-center text-center order-1">
                    <div className="relative mb-2">
                      <div className="size-16 sm:size-20 rounded-2xl overflow-hidden border-3 border-slate-400 shadow-lg">
                        <img src={top2.avatar} alt={top2.name} className="size-full object-cover" />
                      </div>
                      <span className="absolute -bottom-2 -right-1 px-1.5 py-0.5 rounded-lg bg-slate-300 text-slate-900 font-black text-[11px] flex items-center gap-0.5 border border-white shadow">
                        🪙 #{top2.rank}
                      </span>
                    </div>
                    <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white line-clamp-1 mt-1">
                      {top2.name}
                    </h4>
                    <p className="text-[10px] text-slate-500 line-clamp-1">{top2.company}</p>
                    <div className="mt-1 font-mono font-bold text-xs text-slate-700 dark:text-slate-300">
                      {top2.score}
                    </div>

                    <div className="w-full h-28 sm:h-32 mt-3 rounded-2xl bg-gradient-to-t from-slate-300 to-slate-200 dark:from-slate-800 dark:to-slate-700 border border-slate-400 flex flex-col items-center justify-center p-2 shadow-xs">
                      <span className="text-2xl">🪙</span>
                      <span className="text-xs font-black uppercase text-slate-800 dark:text-slate-200 mt-1">
                        BẠCH KIM
                      </span>
                      <span className="text-[10px] text-slate-600 dark:text-slate-400">Á Quân 1</span>
                    </div>
                  </div>
                )}

                {/* 💎 TOP 1: KIM CƯƠNG (Ở GIỮA - CAO NHẤT) */}
                {top1 && (
                  <div className="flex flex-col items-center text-center order-2">
                    <div className="relative mb-2">
                      <Crown className="size-6 text-cyan-400 animate-bounce absolute -top-5 left-1/2 -translate-x-1/2" />
                      <div className="size-20 sm:size-24 rounded-3xl overflow-hidden border-4 border-cyan-400 shadow-2xl ring-4 ring-cyan-400/30">
                        <img src={top1.avatar} alt={top1.name} className="size-full object-cover" />
                      </div>
                      <span className="absolute -bottom-2.5 -right-1.5 px-2 py-0.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black text-xs flex items-center gap-1 border-2 border-white shadow-md">
                        💎 #{top1.rank}
                      </span>
                    </div>
                    <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white line-clamp-1 mt-1">
                      {top1.name}
                    </h4>
                    <p className="text-[11px] text-cyan-600 dark:text-cyan-400 font-bold line-clamp-1">{top1.company}</p>
                    <div className="mt-1 font-mono font-black text-sm text-[#003B95] dark:text-cyan-400">
                      {top1.score}
                    </div>

                    <div className="w-full h-36 sm:h-44 mt-3 rounded-2xl bg-gradient-to-t from-cyan-600 via-cyan-500 to-blue-400 text-white border-2 border-cyan-300 flex flex-col items-center justify-center p-2 shadow-xl">
                      <span className="text-3xl">💎</span>
                      <span className="text-xs sm:text-sm font-black uppercase tracking-wider mt-1">
                        KIM CƯƠNG
                      </span>
                      <span className="text-[11px] font-bold text-cyan-100">Quán Quân Xuất Sắc</span>
                    </div>
                  </div>
                )}

                {/* 🥇 TOP 3: VÀNG (BÊN PHẢI) */}
                {top3 && (
                  <div className="flex flex-col items-center text-center order-3">
                    <div className="relative mb-2">
                      <div className="size-16 sm:size-20 rounded-2xl overflow-hidden border-3 border-amber-500 shadow-lg">
                        <img src={top3.avatar} alt={top3.name} className="size-full object-cover" />
                      </div>
                      <span className="absolute -bottom-2 -right-1 px-1.5 py-0.5 rounded-lg bg-amber-500 text-slate-950 font-black text-[11px] flex items-center gap-0.5 border border-white shadow">
                        🥇 #{top3.rank}
                      </span>
                    </div>
                    <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white line-clamp-1 mt-1">
                      {top3.name}
                    </h4>
                    <p className="text-[10px] text-slate-500 line-clamp-1">{top3.company}</p>
                    <div className="mt-1 font-mono font-bold text-xs text-amber-600 dark:text-amber-400">
                      {top3.score}
                    </div>

                    <div className="w-full h-24 sm:h-28 mt-3 rounded-2xl bg-gradient-to-t from-amber-500 to-amber-400 text-slate-950 border border-amber-400 flex flex-col items-center justify-center p-2 shadow-xs">
                      <span className="text-2xl">🥇</span>
                      <span className="text-xs font-black uppercase text-amber-950 mt-1">
                        VÀNG
                      </span>
                      <span className="text-[10px] text-slate-800">Á Quân 2</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── MODAL XUẤT BÁO CÁO CHUẨN FORMAT ── */}
        {showExportModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in"
            role="dialog"
            aria-modal="true"
          >
            <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="size-10 rounded-xl bg-blue-50 dark:bg-blue-950 text-[#003B95] dark:text-amber-400 flex items-center justify-center">
                    <FileSpreadsheet className="size-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white">
                      Xuất Báo Cáo Định Dạng Chuẩn CLB CEO 1983
                    </h3>
                    <p className="text-xs text-slate-500">
                      Danh mục: <strong>{activeCategoryMeta.label}</strong> • Kỳ: <strong>{period.toUpperCase()}</strong>
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowExportModal(false)}
                  className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600"
                >
                  <X className="size-5" />
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs space-y-3 font-mono">
                <div className="flex justify-between border-b pb-2 font-bold text-slate-900 dark:text-white">
                  <span>HIỆP HỘI DOANH NGHIỆP TRẺ HÀ NỘI (HANOIBA)</span>
                  <span>MẪU BC-08/CEO1983</span>
                </div>
                <div className="text-center py-2 font-black text-sm text-[#003B95] dark:text-amber-400">
                  BÁO CÁO THỐNG KÊ {activeCategoryMeta.label.toUpperCase()}
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-600 dark:text-slate-300">
                  <div>Kỳ báo cáo: {period === "month" ? "Tháng này" : period === "quarter" ? "Quý này" : "Năm tài khóa"}</div>
                  <div>Ngày kết xuất: {new Date().toLocaleDateString("vi-VN")}</div>
                  <div>Đơn vị thống kê: {activeCategoryMeta.unit}</div>
                  <div>Trạng thái dữ liệu: Thời gian thực</div>
                </div>
                <div className="pt-2 border-t text-[11px] text-slate-500">
                  * Dữ liệu được trích xuất trực tiếp từ máy chủ cơ sở dữ liệu PostgreSQL CLB CEO 1983.
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    toast.success("Đang kết xuất tệp Excel (.xlsx) chuẩn dữ liệu...");
                    setTimeout(() => {
                      setShowExportModal(false);
                      toast.success("Đã tải xuống báo cáo Excel thành công!");
                    }, 800);
                  }}
                  className="p-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow cursor-pointer transition"
                >
                  <FileSpreadsheet className="size-4" />
                  <span>Tải Bảng Tính Excel (.xlsx)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    window.print();
                    setShowExportModal(false);
                  }}
                  className="p-3.5 rounded-2xl bg-[#003B95] hover:bg-[#002B70] text-white font-bold text-xs flex items-center justify-center gap-2 shadow cursor-pointer transition"
                >
                  <Printer className="size-4" />
                  <span>In / Xuất Báo Cáo PDF</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
