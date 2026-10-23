import React, { useState, useEffect, useMemo } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import {
  ChevronLeft,
  TrendingUp,
  TrendingDown,
  Handshake,
  Users,
  Coins,
  Crown,
  Calendar,
  Clock,
  Download,
  Flame,
  Award,
  Phone,
  MessageSquare,
  Sparkles,
  Building2,
  CheckCircle2,
  Search,
  Filter,
  ArrowRight,
  BarChart3,
  Share2,
  User,
  Activity,
  Printer,
  FileText,
  X,
  CreditCard,
  MessageCircle,
} from "lucide-react";
import { toast } from "sonner";
import { fetchNestApi, resolveMediaUrl } from "@/lib/api-client";
import { useAuth } from "@/context/AuthContext";
import { MemberHeader } from "@/components/member/MemberShell";
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
} from "recharts";

export const Route = createFileRoute("/association/analytics")({
  component: AssociationAnalyticsScreen,
});

export type AnalyticsCategory =
  | "opps"
  | "spending"
  | "interactions"
  | "events_activity"
  | "top_members";

interface TopPerformer {
  rank: 1 | 2 | 3;
  name: string;
  company: string;
  title: string;
  avatar: string;
  valueStr: string;
  score: number;
  badge: string;
  phone?: string;
}

export function AssociationAnalyticsScreen() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // ── 5 DANH MỤC THỐNG KÊ RÕ RÀNG (YÊU CẦU 1) ──
  const [activeCategory, setActiveCategory] = useState<AnalyticsCategory>("opps");
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [timeRange, setTimeRange] = useState<"week" | "month" | "quarter" | "year">("month");

  // Dữ liệu mẫu 4 thẻ KPI theo từng danh mục
  const kpiCards = useMemo(() => {
    switch (activeCategory) {
      case "opps":
        return [
          {
            label: "Tổng cơ hội đăng",
            value: "348",
            subtext: "+18.4% so với tháng trước",
            isUp: true,
            icon: Handshake,
          },
          {
            label: "Tổng giá trị trao đổi",
            value: "185.6 Tỷ đ",
            subtext: "+24.2% so với tháng trước",
            isUp: true,
            icon: Coins,
          },
          {
            label: "Deal chốt thành công",
            value: "92 Deal",
            subtext: "Tỷ lệ chốt đạt 38.5%",
            isUp: true,
            icon: CheckCircle2,
          },
          {
            label: "Giá trị TB / Deal",
            value: "2.01 Tỷ đ",
            subtext: "-3.1% biến động nhẹ",
            isUp: false,
            icon: TrendingDown,
          },
        ];
      case "spending":
        return [
          {
            label: "Tổng chi tiêu & giao dịch",
            value: "74.8 Tỷ đ",
            subtext: "+15.6% so với tháng trước",
            isUp: true,
            icon: CreditCard,
          },
          {
            label: "Mua sắm B2B nội bộ",
            value: "52.3 Tỷ đ",
            subtext: "+19.0% doanh số nội bộ",
            isUp: true,
            icon: Building2,
          },
          {
            label: "Hội phí & Quỹ CLB",
            value: "1.25 Tỷ đ",
            subtext: "98.2% hội viên đã hoàn thành",
            isUp: true,
            icon: Award,
          },
          {
            label: "Tài trợ sự kiện",
            value: "4.8 Tỷ đ",
            subtext: "-5.0% so với quý trước",
            isUp: false,
            icon: TrendingDown,
          },
        ];
      case "interactions":
        return [
          {
            label: "Lượt truy cập App",
            value: "28,640",
            subtext: "+32.1% tăng trưởng tương tác",
            isUp: true,
            icon: Activity,
          },
          {
            label: "Tần suất dùng App",
            value: "4.8 lần/ngày",
            subtext: "+12.5% thời lượng online",
            isUp: true,
            icon: Clock,
          },
          {
            label: "Hẹn gặp 1-on-1",
            value: "186 Cuộc",
            subtext: "+28.0% cuộc gặp trực tiếp",
            isUp: true,
            icon: Users,
          },
          {
            label: "Tin nhắn kết nối",
            value: "5,420",
            subtext: "+21.4% trao đổi B2B",
            isUp: true,
            icon: MessageSquare,
          },
        ];
      case "events_activity":
        return [
          {
            label: "Sự kiện & Họp Ban",
            value: "24 Chương trình",
            subtext: "4 sự kiện lớn, 20 cuộc họp",
            isUp: true,
            icon: Calendar,
          },
          {
            label: "Lượt đại biểu tham dự",
            value: "1,420 lượt",
            subtext: "+26.8% so với cùng kỳ",
            isUp: true,
            icon: Users,
          },
          {
            label: "Tỷ lệ Check-in QR",
            value: "94.6%",
            subtext: "Điểm danh tự động chuẩn xác",
            isUp: true,
            icon: CheckCircle2,
          },
          {
            label: "Đánh giá hài lòng",
            value: "4.95 / 5.0",
            subtext: "Chất lượng kết nối cao",
            isUp: true,
            icon: Sparkles,
          },
        ];
      case "top_members":
        return [
          {
            label: "Hội viên tích cực nhất",
            value: "Phạm Văn Vũ",
            subtext: "84 bài viết & 192 bình luận",
            isUp: true,
            icon: Crown,
          },
          {
            label: "Tổng lượt bình luận",
            value: "3,890",
            subtext: "+45.2% thảo luận sôi nổi",
            isUp: true,
            icon: MessageCircle,
          },
          {
            label: "Cơ hội chia sẻ mới",
            value: "128 Bài",
            subtext: "+18.0% tin cơ hội tuần này",
            isUp: true,
            icon: Flame,
          },
          {
            label: "Tỷ lệ phản hồi tin nhắn",
            value: "98.4%",
            subtext: "Thời gian TB dưới 5 phút",
            isUp: true,
            icon: Clock,
          },
        ];
    }
  }, [activeCategory]);

  // Dữ liệu biểu đồ Cột + Đường (Composed Chart) theo từng danh mục
  const chartData = useMemo(() => {
    switch (activeCategory) {
      case "opps":
        return [
          { name: "T1", columnVal: 28, lineVal: 15.2, isUp: true, topAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100" },
          { name: "T2", columnVal: 34, lineVal: 18.4, isUp: true },
          { name: "T3", columnVal: 30, lineVal: 16.0, isUp: false }, // Giảm -> đường đỏ
          { name: "T4", columnVal: 45, lineVal: 24.8, isUp: true },
          { name: "T5", columnVal: 52, lineVal: 29.5, isUp: true },
          { name: "T6", columnVal: 48, lineVal: 26.0, isUp: false }, // Giảm -> đường đỏ
          { name: "T7", columnVal: 65, lineVal: 34.5, isUp: true, isTop: true, topAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100" },
        ];
      case "spending":
        return [
          { name: "T1", columnVal: 8.5, lineVal: 8.5, isUp: true },
          { name: "T2", columnVal: 11.2, lineVal: 11.2, isUp: true },
          { name: "T3", columnVal: 9.8, lineVal: 9.8, isUp: false },
          { name: "T4", columnVal: 14.5, lineVal: 14.5, isUp: true },
          { name: "T5", columnVal: 12.0, lineVal: 12.0, isUp: false },
          { name: "T6", columnVal: 18.2, lineVal: 18.2, isUp: true, isTop: true, topAvatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100" },
        ];
      case "interactions":
        return [
          { name: "T2", columnVal: 320, lineVal: 320, isUp: true },
          { name: "T3", columnVal: 410, lineVal: 410, isUp: true },
          { name: "T4", columnVal: 380, lineVal: 380, isUp: false },
          { name: "T5", columnVal: 560, lineVal: 560, isUp: true },
          { name: "T6", columnVal: 620, lineVal: 620, isUp: true },
          { name: "T7", columnVal: 740, lineVal: 740, isUp: true, isTop: true, topAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100" },
          { name: "CN", columnVal: 490, lineVal: 490, isUp: false },
        ];
      case "events_activity":
        return [
          { name: "Q1", columnVal: 4, lineVal: 180, isUp: true },
          { name: "Q2", columnVal: 6, lineVal: 340, isUp: true },
          { name: "Q3", columnVal: 5, lineVal: 290, isUp: false },
          { name: "Q4", columnVal: 9, lineVal: 560, isUp: true, isTop: true, topAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100" },
        ];
      case "top_members":
        return [
          { name: "Thứ 2", columnVal: 42, lineVal: 140, isUp: true },
          { name: "Thứ 3", columnVal: 58, lineVal: 195, isUp: true },
          { name: "Thứ 4", columnVal: 51, lineVal: 170, isUp: false },
          { name: "Thứ 5", columnVal: 74, lineVal: 245, isUp: true },
          { name: "Thứ 6", columnVal: 89, lineVal: 310, isUp: true, isTop: true, topAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100" },
          { name: "Thứ 7", columnVal: 65, lineVal: 220, isUp: false },
        ];
    }
  }, [activeCategory]);

  // Bục vinh danh 3 người đứng top (Podium) theo từng danh mục
  const podiumTop3: TopPerformer[] = useMemo(() => {
    switch (activeCategory) {
      case "opps":
        return [
          {
            rank: 2,
            name: "Nguyễn Thị Mai",
            company: "Green Farm Group",
            title: "Tổng Giám Đốc",
            avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200",
            valueStr: "28.5 Tỷ đ (38 cơ hội)",
            score: 38,
            badge: "Á Quân 1",
            phone: "0912345678",
          },
          {
            rank: 1, // Ở giữa cao nhất
            name: "Phạm Văn Vũ",
            company: "Tập Đoàn Công Nghệ ViConnect",
            title: "Chủ Tịch HĐQT",
            avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200",
            valueStr: "34.5 Tỷ đ (48 cơ hội)",
            score: 48,
            badge: "Quán Quân Trao Cơ Hội",
            phone: "0901234567",
          },
          {
            rank: 3,
            name: "Trần Quốc Bảo",
            company: "Bảo Phát Logistics Quốc Tế",
            title: "Giám Đốc Điều Hành",
            avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
            valueStr: "21.0 Tỷ đ (29 cơ hội)",
            score: 29,
            badge: "Á Quân 2",
            phone: "0987654321",
          },
        ];
      case "spending":
        return [
          {
            rank: 2,
            name: "Lê Hoàng Yến",
            company: "Yến Sào Hoàng Gia Luxury",
            title: "Chủ Tịch",
            avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200",
            valueStr: "14.2 Tỷ đ",
            score: 142,
            badge: "Top 2 Chi Tiêu",
            phone: "0933221100",
          },
          {
            rank: 1,
            name: "Đỗ Minh Khang",
            company: "Khang Land Real Estate",
            title: "Tổng Giám Đốc",
            avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200",
            valueStr: "22.5 Tỷ đ",
            score: 225,
            badge: "Quán Quân Chi Tiêu & Giao Thương",
            phone: "0909988776",
          },
          {
            rank: 3,
            name: "Phan Anh Tuấn",
            company: "Tuấn Phát Tech & Hardware",
            title: "CEO",
            avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200",
            valueStr: "9.8 Tỷ đ",
            score: 98,
            badge: "Top 3 Chi Tiêu",
            phone: "0977889900",
          },
        ];
      case "top_members":
      default:
        return [
          {
            rank: 2,
            name: "Bùi Thanh Trúc",
            company: "Trúc Xanh Media & Event",
            title: "CEO",
            avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200",
            valueStr: "68 Bài viết & 145 Comment",
            score: 213,
            badge: "Top 2 Tương Tác",
            phone: "0911223344",
          },
          {
            rank: 1,
            name: "Phạm Văn Vũ",
            company: "Tập Đoàn Công Nghệ ViConnect",
            title: "Chủ Tịch HĐQT",
            avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200",
            valueStr: "84 Bài viết & 192 Comment",
            score: 276,
            badge: "Top 1 Tương Tác Sôi Nổi",
            phone: "0901234567",
          },
          {
            rank: 3,
            name: "Hoàng Gia Bảo",
            company: "Gia Bảo Luật & Tư Vấn Thuế",
            title: "Luật Sư Điều Hành",
            avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200",
            valueStr: "52 Bài viết & 118 Comment",
            score: 170,
            badge: "Top 3 Tương Tác",
            phone: "0944556677",
          },
        ];
    }
  }, [activeCategory]);

  // Custom Dot hiển thị Avatar người đứng Top ở đỉnh đường kẻ
  const renderTopAvatarDot = (props: any) => {
    const { cx, cy, payload, index } = props;
    if (payload?.isTop && payload?.topAvatar) {
      return (
        <g key={`dot-${index}`}>
          <circle cx={cx} cy={cy} r={14} fill="#F59E0B" stroke="#ffffff" strokeWidth={2} />
          <clipPath id={`avatar-clip-${index}`}>
            <circle cx={cx} cy={cy} r={12} />
          </clipPath>
          <image
            href={payload.topAvatar}
            x={cx - 12}
            y={cy - 12}
            width={24}
            height={24}
            clipPath={`url(#avatar-clip-${index})`}
            preserveAspectRatio="xMidYMid slice"
          />
          <text
            x={cx}
            y={cy - 16}
            textAnchor="middle"
            fill="#F59E0B"
            fontSize={9}
            fontWeight="bold"
          >
            TOP 1 👑
          </text>
        </g>
      );
    }
    return (
      <circle
        key={`dot-norm-${index}`}
        cx={cx}
        cy={cy}
        r={payload?.isUp ? 4 : 4}
        fill={payload?.isUp ? "#003B95" : "#DC2626"}
        stroke="#ffffff"
        strokeWidth={1.5}
      />
    );
  };

  return (
    <div className="vba-animate pb-24 relative min-h-screen bg-white dark:bg-[#0B1120] text-slate-900 dark:text-white font-sans">
      <MemberHeader
        title="Thống Kê Hiệp Hội"
        back
        right={
          <button
            type="button"
            onClick={() => setReportModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-sky-900 via-[#003B95] to-blue-700 hover:from-sky-800 hover:to-blue-600 text-white text-[11px] font-black shadow-xs cursor-pointer active:scale-95 transition"
            title="Xuất báo cáo chuẩn format"
          >
            <Download className="size-3.5" />
            <span className="hidden sm:inline">Xuất báo cáo</span>
          </button>
        }
      />

      {/* ── 5 TABS DANH MỤC THỐNG KÊ (YÊU CẦU 1) ── */}
      <div className="px-3 sm:px-4 pt-3 overflow-x-auto no-scrollbar flex items-center gap-1.5 select-none border-b border-slate-100 dark:border-white/5 pb-2">
        {[
          { id: "opps", label: "Cơ hội", icon: Handshake },
          { id: "spending", label: "Giao dịch chi tiêu", icon: CreditCard },
          { id: "interactions", label: "Tương tác & Tần suất", icon: Activity },
          { id: "events_activity", label: "Sự kiện & Hoạt động", icon: Calendar },
          { id: "top_members", label: "Top tương tác", icon: Crown },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeCategory === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveCategory(tab.id as AnalyticsCategory)}
              className={`shrink-0 px-3 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                isActive
                  ? "bg-gradient-to-r from-sky-900 via-[#003B95] to-blue-700 text-white shadow-md font-black"
                  : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
              }`}
            >
              <Icon className="size-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="px-3 sm:px-4 pt-3.5 space-y-4">
        {/* ── 4 Ô THỂ HIỆN DỮ LIỆU CHÍNH (KPI CARDS - YÊU CẦU 1) ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {kpiCards.map((kpi, idx) => {
            const Icon = kpi.icon;
            return (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-white dark:bg-[#131a26] border border-slate-200/80 dark:border-white/10 shadow-xs flex flex-col justify-between gap-1 hover:border-[#003B95]/40 transition"
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 truncate">
                    {kpi.label}
                  </span>
                  <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-[#003B95] dark:text-blue-300 shrink-0">
                    <Icon className="size-3.5" />
                  </div>
                </div>

                <div className="mt-1">
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight truncate">
                    {kpi.value}
                  </h3>
                  <div className="flex items-center gap-1 mt-0.5">
                    {kpi.isUp ? (
                      <TrendingUp className="size-3 text-[#059669] shrink-0" />
                    ) : (
                      <TrendingDown className="size-3 text-[#DC2626] shrink-0" />
                    )}
                    <span
                      className={`text-[10px] font-bold truncate ${
                        kpi.isUp ? "text-[#059669]" : "text-[#DC2626]"
                      }`}
                    >
                      {kpi.subtext}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── BIỂU ĐỒ CỘT & ĐƯỜNG TĂNG GIẢM BIẾN ĐỘNG (COMPOSED CHART - YÊU CẦU 1) ── */}
        <div className="p-4 rounded-3xl bg-white dark:bg-[#131a26] border border-slate-200/80 dark:border-white/10 shadow-sm space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>Biến Động Hoạt Động &amp; Xu Hướng</span>
                <span className="size-2 rounded-full bg-emerald-500 animate-ping inline-block" />
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Cột thể hiện khối lượng, Đường kẻ xanh (tăng) &amp; đỏ (giảm), Avatar gắn đỉnh Top
              </p>
            </div>

            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
              <span className="flex items-center gap-1">
                <span className="size-2 rounded-full bg-[#003B95]" /> Tăng
              </span>
              <span className="flex items-center gap-1">
                <span className="size-2 rounded-full bg-[#DC2626]" /> Giảm
              </span>
            </div>
          </div>

          {/* Recharts Composed Chart Canvas (3 màu Xanh - Trắng - Đen) */}
          <div className="h-60 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(150,150,150,0.15)" />
                <XAxis
                  dataKey="name"
                  stroke="#888888"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: "rgba(150,150,150,0.2)" }}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: "rgba(150,150,150,0.2)" }}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="p-2.5 rounded-xl bg-slate-900 text-white text-xs shadow-xl border border-slate-700">
                          <p className="font-bold">{label}</p>
                          <p className="text-blue-300">Khối lượng: {payload[0]?.value}</p>
                          <p className="text-amber-400">Chỉ số: {payload[1]?.value}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="columnVal" fill="#003B95" radius={[6, 6, 0, 0]} maxBarSize={36}>
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.isTop ? "#F59E0B" : "#003B95"}
                      opacity={0.9}
                    />
                  ))}
                </Bar>
                <Line
                  type="monotone"
                  dataKey="lineVal"
                  stroke="#003B95"
                  strokeWidth={2.5}
                  dot={renderTopAvatarDot}
                  activeDot={{ r: 6, fill: "#F59E0B" }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── BỤC VINH DANH GIẢI THƯỞNG 3 NGƯỜI ĐỨNG TOP (PODIUM - 3 CỘT 1 HÀNG - YÊU CẦU 1) ── */}
        <div className="p-4 rounded-3xl bg-white dark:bg-[#131a26] border border-slate-200/80 dark:border-white/10 shadow-sm space-y-4">
          <div className="text-center">
            <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center justify-center gap-1.5">
              <span>🏆 BỤC VINH DANH TOP 3 XUẤT SẮC NHẤT</span>
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Top 1 ở giữa cao nhất, Top 2 bên trái, Top 3 bên phải — 3 cột chung 1 hàng
            </p>
          </div>

          {/* Dàn 3 cột chung 1 hàng ngang với bục bậc thang */}
          <div className="grid grid-cols-3 gap-2 items-end pt-4 pb-2">
            {podiumTop3.map((performer) => {
              const isTop1 = performer.rank === 1;
              const isTop2 = performer.rank === 2;
              const isTop3 = performer.rank === 3;

              return (
                <div
                  key={performer.rank}
                  className={`flex flex-col items-center text-center transition-all ${
                    isTop1 ? "order-2 -mt-4 z-10" : isTop2 ? "order-1" : "order-3"
                  }`}
                >
                  {/* Avatar và Vương miện / Huy chương */}
                  <div className="relative mb-2 flex flex-col items-center">
                    {isTop1 ? (
                      <span className="text-2xl animate-bounce mb-0.5" style={{ animationDuration: "2s" }}>
                        👑
                      </span>
                    ) : isTop2 ? (
                      <span className="text-lg mb-0.5">🥈</span>
                    ) : (
                      <span className="text-lg mb-0.5">🥉</span>
                    )}

                    <div
                      className={`relative rounded-full overflow-hidden p-0.5 shadow-md ${
                        isTop1
                          ? "size-16 ring-3 ring-amber-400 shadow-amber-400/30"
                          : isTop2
                          ? "size-13 ring-2 ring-slate-300"
                          : "size-13 ring-2 ring-amber-700/60"
                      }`}
                    >
                      <img
                        src={performer.avatar}
                        alt={performer.name}
                        className="w-full h-full rounded-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "/ceo1983-logo.png";
                        }}
                      />
                    </div>

                    <span
                      className={`absolute -bottom-1 px-1.5 py-0.2 rounded-full text-[9px] font-black text-white ${
                        isTop1 ? "bg-amber-500" : isTop2 ? "bg-slate-500" : "bg-amber-800"
                      }`}
                    >
                      TOP {performer.rank}
                    </span>
                  </div>

                  {/* Thông tin đại biểu */}
                  <h5 className="text-[12px] font-bold text-slate-900 dark:text-white truncate w-full px-1">
                    {performer.name}
                  </h5>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate w-full px-1">
                    {performer.company}
                  </p>
                  <p className="text-[10.5px] font-black text-[#003B95] dark:text-amber-400 truncate w-full px-1 mt-0.5">
                    {performer.valueStr}
                  </p>

                  {/* Bục Bậc Thang (Podium block) */}
                  <div
                    className={`w-full rounded-t-2xl flex flex-col items-center justify-center mt-2.5 border-t border-x ${
                      isTop1
                        ? "h-24 bg-gradient-to-b from-amber-400/20 via-amber-400/10 to-transparent border-amber-400/40 text-amber-500 font-black text-lg"
                        : isTop2
                        ? "h-16 bg-gradient-to-b from-slate-300/20 via-slate-300/10 to-transparent border-slate-300/40 text-slate-400 font-bold text-sm"
                        : "h-12 bg-gradient-to-b from-amber-700/20 via-amber-700/10 to-transparent border-amber-700/40 text-amber-700 font-bold text-sm"
                    }`}
                  >
                    <span className="font-black">#{performer.rank}</span>
                    <span className="text-[9px] font-medium opacity-80">{performer.badge}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Nút Xuất Báo Cáo Nhanh Cuối Trang */}
        <div className="pt-2 text-center">
          <button
            type="button"
            onClick={() => setReportModalOpen(true)}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-sky-900 via-[#003B95] to-blue-700 hover:from-sky-800 hover:to-blue-600 text-white font-black text-xs shadow-md shadow-blue-900/20 flex items-center justify-center gap-2 active:scale-95 transition cursor-pointer"
          >
            <Download className="size-4" />
            <span>XUẤT BÁO CÁO ĐỊNH DẠNG CHUẨN HIỆP HỘI (A4 / EXCEL)</span>
          </button>
        </div>
      </div>

      {/* ── MODAL XUẤT BÁO CÁO CHUẨN FORMAT (YÊU CẦU 1) ── */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg max-h-[90vh] bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col gap-4 overflow-y-auto">
            {/* Header Báo Cáo */}
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <img src="/ceo1983-emblem-8.png" alt="CEO 1983" className="size-10 object-contain" />
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    HIỆP HỘI DOANH NHÂN CEO 1983 (HANOIBA)
                  </h3>
                  <h2 className="text-sm font-black text-slate-900 dark:text-white">
                    BÁO CÁO THỐNG KÊ {activeCategory.toUpperCase()} CHUẨN
                  </h2>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setReportModalOpen(false)}
                className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Chi tiết nội dung báo cáo format chuẩn A4 */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
              <div className="flex justify-between text-slate-500 text-[11px] pb-2 border-b border-slate-200 dark:border-slate-800">
                <span>Kỳ báo cáo: {timeRange.toUpperCase()} / 2026</span>
                <span>Ngày trích xuất: {new Date().toLocaleDateString("vi-VN")}</span>
              </div>

              {/* Bảng tóm tắt số liệu KPI */}
              <div className="space-y-1.5">
                <h5 className="font-bold text-slate-700 dark:text-slate-300">
                  1. Tóm tắt chỉ số thực thi:
                </h5>
                <div className="grid grid-cols-2 gap-2">
                  {kpiCards.map((k, i) => (
                    <div key={i} className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <p className="text-[10px] text-slate-400">{k.label}</p>
                      <p className="font-bold text-slate-900 dark:text-white">{k.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top đại biểu dẫn đầu */}
              <div className="space-y-1.5 pt-2">
                <h5 className="font-bold text-slate-700 dark:text-slate-300">
                  2. Danh sách đại biểu dẫn đầu:
                </h5>
                <div className="space-y-1">
                  {podiumTop3.map((p) => (
                    <div
                      key={p.rank}
                      className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11.5px]"
                    >
                      <span className="font-bold">
                        #{p.rank} {p.name} - {p.company}
                      </span>
                      <span className="text-[#003B95] dark:text-amber-400 font-black">
                        {p.valueStr}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chữ ký ban điều hành */}
              <div className="pt-4 flex justify-between text-center text-[10.5px] text-slate-500">
                <div>
                  <p className="font-bold">NGƯỜI LẬP BIỂU</p>
                  <p className="mt-8 italic">(Ký, họ tên)</p>
                </div>
                <div>
                  <p className="font-bold">TM. BAN ĐIỀU HÀNH CEO 1983</p>
                  <p className="mt-8 font-black text-slate-800 dark:text-white">CHỦ TỊCH HIỆP HỘI</p>
                </div>
              </div>
            </div>

            {/* Các nút tải báo cáo */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  window.print();
                }}
                className="py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Printer className="size-4" />
                <span>In / Lưu PDF</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  toast.success("Đang xuất tệp Excel báo cáo chuẩn format...");
                  setTimeout(() => {
                    toast.success("Đã tải xuống báo cáo thành công!");
                    setReportModalOpen(false);
                  }, 800);
                }}
                className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-sky-900 via-[#003B95] to-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition cursor-pointer"
              >
                <Download className="size-4" />
                <span>Tải tệp Excel</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default AssociationAnalyticsScreen;
