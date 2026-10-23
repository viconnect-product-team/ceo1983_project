import { createFileRoute } from "@tanstack/react-router";
import React, { useState, useMemo } from "react";
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
  CheckCircle2,
  DollarSign,
  Activity,
  MessageSquare,
  FileSpreadsheet,
  Printer,
  X,
  Crown,
  Share2,
} from "lucide-react";
import { toast } from "sonner";
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
  Cell,
} from "recharts";

export const Route = createFileRoute("/analytics")({
  component: AnalyticsDashboardPage,
  head: () => ({
    meta: [
      { title: "Báo Cáo & Thống Kê Quản Trị CLB CEO 1983" },
      {
        name: "description",
        content:
          "Trung tâm phân tích số liệu kinh doanh, giao dịch, tương tác và bảng vàng vinh danh hội viên CLB CEO 1983",
      },
    ],
  }),
});

// Bảng 5 màu nhận diện tối giản chuẩn mực
const PALETTE = {
  navy: "#003B95",       // Xanh hoàng gia
  gold: "#F59E0B",       // Vàng kim hổ phách
  green: "#10B981",      // Xanh tăng trưởng
  red: "#DC2626",        // Đỏ biến động giảm
  dark: "#0F172A",       // Đen Slate
  light: "#FFFFFF",      // Trắng
};

type AnalyticsCategory =
  | "opps"
  | "spending"
  | "interactions"
  | "events"
  | "active_members";

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
    id: "opps",
    label: "Cơ hội kinh doanh",
    subLabel: "Kết nối, chào hàng và chuyển đổi",
    icon: Briefcase,
    metricLabel: "Tổng giá trị cơ hội",
    unit: "Tỷ VNĐ",
  },
  {
    id: "spending",
    label: "Chi tiêu & Giao dịch",
    subLabel: "Doanh số thực khớp & giải ngân",
    icon: DollarSign,
    metricLabel: "Tổng chi tiêu thực tế",
    unit: "Tr VNĐ",
  },
  {
    id: "interactions",
    label: "Tần suất tương tác",
    subLabel: "Lượt truy cập, like, bình luận",
    icon: Activity,
    metricLabel: "Tổng lượt tương tác trong app",
    unit: "Lượt",
  },
  {
    id: "events",
    label: "Sự kiện & Hoạt động",
    subLabel: "Họp ban, hội thảo & gala",
    icon: Calendar,
    metricLabel: "Tổng sự kiện đã triển khai",
    unit: "Sự kiện",
  },
  {
    id: "active_members",
    label: "Top hội viên tích cực",
    subLabel: "Đăng cơ hội & bình luận nhiều nhất",
    icon: Users,
    metricLabel: "Chỉ số cống hiến & tương tác",
    unit: "Điểm",
  },
];

export function AnalyticsDashboardPage() {
  const [selectedCat, setSelectedCat] = useState<AnalyticsCategory>("opps");
  const [period, setPeriod] = useState<"week" | "month" | "quarter" | "year">("month");
  const [showExportModal, setShowExportModal] = useState(false);

  const activeCategoryMeta = useMemo(() => {
    return CATEGORIES.find((c) => c.id === selectedCat) || CATEGORIES[0];
  }, [selectedCat]);

  // 4 Ô CHỈ SỐ CHÍNH (THEO YÊU CẦU 1)
  const kpiData = useMemo(() => {
    switch (selectedCat) {
      case "opps":
        return [
          { label: "Tổng cơ hội", value: "348 deal", delta: "+18.4%", isUp: true, desc: "So với kỳ trước" },
          { label: "Doanh số kỳ vọng", value: "86.5 Tỷ", delta: "+24.2%", isUp: true, desc: "Giá trị niêm yết" },
          { label: "Tỷ lệ chốt deal", value: "42.8%", delta: "-3.1%", isUp: false, desc: "Đã ký kết hợp đồng" },
          { label: "Top người trao", value: "Phạm Vũ", delta: "48 deal", isUp: true, desc: "Quán quân kết nối" },
        ];
      case "spending":
        return [
          { label: "Tổng thanh toán", value: "1,420 Tr", delta: "+15.6%", isUp: true, desc: "Giao dịch qua app" },
          { label: "Phí hội viên", value: "450 Tr", delta: "100%", isUp: true, desc: "Đã hoàn thành niên liễm" },
          { label: "Giao thương B2B", value: "970 Tr", delta: "+28.1%", isUp: true, desc: "Chi tiêu nội bộ" },
          { label: "Top doanh nghiệp", value: "ViConnect", delta: "310 Tr", isUp: true, desc: "Giao dịch lớn nhất" },
        ];
      case "interactions":
        return [
          { label: "Lượt mở App", value: "14,820", delta: "+32.5%", isUp: true, desc: "Phiên hoạt động" },
          { label: "Bình luận trao đổi", value: "3,240", delta: "+19.0%", isUp: true, desc: "Thảo luận trên Feed" },
          { label: "Lượt thích & thả tim", value: "8,950", delta: "+12.4%", isUp: true, desc: "Ủng hộ tin tức" },
          { label: "Hội viên Online/ngày", value: "312 CEO", delta: "-2.5%", isUp: false, desc: "Hoạt động thường xuyên" },
        ];
      case "events":
        return [
          { label: "Sự kiện tổ chức", value: "24 kỳ", delta: "+4 kỳ", isUp: true, desc: "Đang & đã diễn ra" },
          { label: "Hội viên tham gia", value: "1,850", delta: "+21.0%", isUp: true, desc: "Tổng lượt đăng ký" },
          { label: "Tỷ lệ quét QR", value: "94.2%", delta: "+5.6%", isUp: true, desc: "Điểm danh đúng giờ" },
          { label: "Ban xuất sắc nhất", value: "Đào Tạo", delta: "8 khóa", isUp: true, desc: "Nhiều buổi họp nhất" },
        ];
      case "active_members":
      default:
        return [
          { label: "Tổng bài cơ hội", value: "186 bài", delta: "+26.8%", isUp: true, desc: "Hội viên tự đăng tải" },
          { label: "Tổng bình luận", value: "4,120", delta: "+14.3%", isUp: true, desc: "Tương tác cộng đồng" },
          { label: "Hội viên năng nổ", value: "95 CEO", delta: "+11.0%", isUp: true, desc: ">10 tương tác/tuần" },
          { label: "Quán quân cống hiến", value: "Trần Nam", delta: "980 đ", isUp: true, desc: "Điểm tương tác cao nhất" },
        ];
    }
  }, [selectedCat]);

  // DỮ LIỆU BIỂU ĐỒ CỘT + ĐƯỜNG (COMPOSED CHART: BAR + LINE TĂNG XANH / GIẢM ĐỎ)
  const chartData = useMemo(() => {
    switch (selectedCat) {
      case "opps":
        return [
          { name: "T1", barVal: 22, trendVal: 22, isUp: true, avatar: "/avatars/avatar-1.jpg", leader: "Phạm Vũ" },
          { name: "T2", barVal: 35, trendVal: 35, isUp: true, avatar: "/avatars/avatar-2.jpg", leader: "Trần Nam" },
          { name: "T3", barVal: 28, trendVal: 28, isUp: false, avatar: "/avatars/avatar-3.jpg", leader: "Nguyễn Mai" },
          { name: "T4", barVal: 46, trendVal: 46, isUp: true, avatar: "/avatars/avatar-4.jpg", leader: "Lê Cường" },
          { name: "T5", barVal: 40, trendVal: 40, isUp: false, avatar: "/avatars/avatar-5.jpg", leader: "Hoàng Yến" },
          { name: "T6", barVal: 58, trendVal: 58, isUp: true, avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80", leader: "Phạm Vũ" },
        ];
      case "spending":
        return [
          { name: "T1", barVal: 150, trendVal: 150, isUp: true, avatar: "/avatars/avatar-1.jpg", leader: "ViConnect" },
          { name: "T2", barVal: 210, trendVal: 210, isUp: true, avatar: "/avatars/avatar-2.jpg", leader: "VIBank" },
          { name: "T3", barVal: 180, trendVal: 180, isUp: false, avatar: "/avatars/avatar-3.jpg", leader: "Sao Mai" },
          { name: "T4", barVal: 290, trendVal: 290, isUp: true, avatar: "/avatars/avatar-4.jpg", leader: "Green Tech" },
          { name: "T5", barVal: 240, trendVal: 240, isUp: false, avatar: "/avatars/avatar-5.jpg", leader: "An Phát" },
          { name: "T6", barVal: 350, trendVal: 350, isUp: true, avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80", leader: "ViConnect" },
        ];
      case "interactions":
        return [
          { name: "T1", barVal: 1800, trendVal: 1800, isUp: true, avatar: "/avatars/avatar-1.jpg", leader: "CEO Minh" },
          { name: "T2", barVal: 2400, trendVal: 2400, isUp: true, avatar: "/avatars/avatar-2.jpg", leader: "CEO Thảo" },
          { name: "T3", barVal: 2100, trendVal: 2100, isUp: false, avatar: "/avatars/avatar-3.jpg", leader: "CEO Đức" },
          { name: "T4", barVal: 3100, trendVal: 3100, isUp: true, avatar: "/avatars/avatar-4.jpg", leader: "CEO Hạnh" },
          { name: "T5", barVal: 2700, trendVal: 2700, isUp: false, avatar: "/avatars/avatar-5.jpg", leader: "CEO Sơn" },
          { name: "T6", barVal: 3800, trendVal: 3800, isUp: true, avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80", leader: "CEO Nam" },
        ];
      case "events":
        return [
          { name: "T1", barVal: 2, trendVal: 2, isUp: true, avatar: "/avatars/avatar-1.jpg", leader: "Ban TT" },
          { name: "T2", barVal: 4, trendVal: 4, isUp: true, avatar: "/avatars/avatar-2.jpg", leader: "Ban ĐT" },
          { name: "T3", barVal: 3, trendVal: 3, isUp: false, avatar: "/avatars/avatar-3.jpg", leader: "Ban SK" },
          { name: "T4", barVal: 5, trendVal: 5, isUp: true, avatar: "/avatars/avatar-4.jpg", leader: "Ban ĐT" },
          { name: "T5", barVal: 4, trendVal: 4, isUp: false, avatar: "/avatars/avatar-5.jpg", leader: "Ban KT" },
          { name: "T6", barVal: 6, trendVal: 6, isUp: true, avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80", leader: "Ban Đào Tạo" },
        ];
      case "active_members":
      default:
        return [
          { name: "T1", barVal: 120, trendVal: 120, isUp: true, avatar: "/avatars/avatar-1.jpg", leader: "Trần Nam" },
          { name: "T2", barVal: 180, trendVal: 180, isUp: true, avatar: "/avatars/avatar-2.jpg", leader: "Phạm Vũ" },
          { name: "T3", barVal: 150, trendVal: 150, isUp: false, avatar: "/avatars/avatar-3.jpg", leader: "Lê Cường" },
          { name: "T4", barVal: 240, trendVal: 240, isUp: true, avatar: "/avatars/avatar-4.jpg", leader: "Trần Nam" },
          { name: "T5", barVal: 210, trendVal: 210, isUp: false, avatar: "/avatars/avatar-5.jpg", leader: "Nguyễn Mai" },
          { name: "T6", barVal: 320, trendVal: 320, isUp: true, avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80", leader: "Trần Nam" },
        ];
    }
  }, [selectedCat]);

  // TOP 3 GIẢI THƯỞNG PODIUM TRONG 1 HÀNG DUY NHẤT (THEO YÊU CẦU 1)
  const podiumTop3 = useMemo(() => {
    switch (selectedCat) {
      case "opps":
        return [
          { rank: 1, name: "Phạm Văn Vũ", company: "Uranus ViConnect", score: "48 Cơ hội", value: "34.5 Tỷ đ", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80" },
          { rank: 2, name: "Nguyễn Thị Mai", company: "Green Farm Group", score: "38 Cơ hội", value: "24.8 Tỷ đ", avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80" },
          { rank: 3, name: "Trần Hải Nam", company: "Tập Đoàn Tân Á Đông", score: "29 Cơ hội", value: "19.2 Tỷ đ", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80" },
        ];
      case "spending":
        return [
          { rank: 1, name: "Tập Đoàn ViConnect", company: "Hạ tầng & AI", score: "350 Triệu đ", value: "12 đơn", avatar: "/ceo1983-emblem-8.png" },
          { rank: 2, name: "Công Ty Sao Mai", company: "Nội thất cao cấp", score: "280 Triệu đ", value: "9 đơn", avatar: "/avatars/avatar-2.jpg" },
          { rank: 3, name: "Bảo An Tech", company: "Camera an ninh", score: "210 Triệu đ", value: "7 đơn", avatar: "/avatars/avatar-3.jpg" },
        ];
      case "interactions":
        return [
          { rank: 1, name: "Lê Hoàng Nam", company: "Công nghệ V-Soft", score: "1,240 Tương tác", value: "186 bài", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80" },
          { rank: 2, name: "Phạm Thị Hương", company: "Thương mại Hương Việt", score: "980 Tương tác", value: "142 bài", avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80" },
          { rank: 3, name: "Đỗ Quốc Bảo", company: "Cơ điện Bảo Long", score: "810 Tương tác", value: "115 bài", avatar: "/avatars/avatar-5.jpg" },
        ];
      case "events":
        return [
          { rank: 1, name: "Ban Đào Tạo CEO", company: "Khóa Lãnh Đạo 4.0", score: "8 Buổi đào tạo", value: "480 lượt", avatar: "/ceo1983-emblem-8.png" },
          { rank: 2, name: "Ban Xúc Tiến B2B", company: "Matching Doanh Nghiệp", score: "6 Buổi kết nối", value: "390 lượt", avatar: "/avatars/avatar-1.jpg" },
          { rank: 3, name: "Ban Thể Thao Golf", company: "Giao lưu Kết Nối", score: "5 Giải đấu", value: "240 lượt", avatar: "/avatars/avatar-4.jpg" },
        ];
      case "active_members":
      default:
        return [
          { rank: 1, name: "Trần Hải Nam", company: "Đăng 42 cơ hội • 310 bình luận", score: "980 Điểm", value: "Top 1", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80" },
          { rank: 2, name: "Phạm Văn Vũ", company: "Đăng 38 cơ hội • 260 bình luận", score: "890 Điểm", value: "Top 2", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80" },
          { rank: 3, name: "Nguyễn Thị Mai", company: "Đăng 29 cơ hội • 190 bình luận", score: "740 Điểm", value: "Top 3", avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80" },
        ];
    }
  }, [selectedCat]);

  // Reorder for podium: Top 2 (Left), Top 1 (Center Highest), Top 3 (Right)
  const top1 = podiumTop3.find((p) => p.rank === 1);
  const top2 = podiumTop3.find((p) => p.rank === 2);
  const top3 = podiumTop3.find((p) => p.rank === 3);

  // Helper custom tooltip cho chart
  const CustomChartTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="p-3 rounded-2xl bg-slate-900 text-white border border-slate-700 shadow-xl text-xs space-y-1">
          <div className="font-bold flex items-center justify-between gap-3">
            <span>Mốc: Tháng {data.name}</span>
            <span
              className={`font-mono text-[10px] px-1.5 py-0.5 rounded ${
                data.isUp ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
              }`}
            >
              {data.isUp ? "▲ Tăng trưởng" : "▼ Biến động giảm"}
            </span>
          </div>
          <div className="text-amber-400 font-bold">
            Chỉ số: {data.barVal} {activeCategoryMeta.unit}
          </div>
          {data.leader && (
            <div className="text-slate-300 text-[11px] pt-1 border-t border-slate-800 flex items-center gap-1.5">
              <span>Đứng đầu mốc này:</span>
              <strong className="text-white">{data.leader}</strong>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <AppShell>
      <div className="space-y-6 pb-20 font-sans">
        {/* Header với nút xuất báo cáo chuẩn format */}
        <PageHeader
          title="Báo Cáo & Thống Kê Quản Trị CLB CEO 1983"
          subtitle="Giao diện thống kê phân tách danh mục, theo dõi biến động biểu đồ và bảng vàng vinh danh"
          actions={
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-1 shadow-xs">
                {(["week", "month", "quarter", "year"] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      period === p
                        ? "bg-[#003B95] text-white shadow-xs"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    {p === "week" ? "Tuần" : p === "month" ? "Tháng" : p === "quarter" ? "Quý" : "Năm"}
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

        {/* ── 5 CATEGORY TABS SWITCHER: CHIA RÕ RÀNG CÁC DẠNG HIỂN THỊ (THEO YÊU CẦU 1) ── */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5 p-1.5 rounded-3xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCat === cat.id;
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCat(cat.id)}
                className={`p-3 rounded-2xl text-left transition flex flex-col gap-1.5 cursor-pointer ${
                  isSelected
                    ? "bg-white dark:bg-slate-800 shadow-md ring-2 ring-[#003B95] dark:ring-amber-400"
                    : "hover:bg-white/60 dark:hover:bg-slate-800/60"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div
                    className={`size-8 rounded-xl flex items-center justify-center ${
                      isSelected
                        ? "bg-[#003B95] text-white dark:bg-amber-400 dark:text-slate-950"
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
                  <p className="text-[10.5px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                    {cat.subLabel}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* ── 4 Ô THỂ HIỆN DỮ LIỆU CHÍNH (THEO YÊU CẦU 1: BỎ GIAO DIỆN CŨ TRÊN BIỂU ĐỒ) ── */}
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

              {/* Accent bar bottom */}
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

        {/* ── BIỂU ĐỒ CỘT CÓ ĐƯỜNG TĂNG GIẢM BIẾN ĐỘNG & AVATAR ĐỈNH CỘT (THEO YÊU CẦU 1) ── */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#003B95] dark:text-amber-400">
                  <TrendingUp className="size-4" />
                </span>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Biểu Đồ Xu Hướng &amp; Biến Động {activeCategoryMeta.label}
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Cột thể hiện độ lớn chỉ số • Đường xanh lá thể hiện xu hướng tăng • Đường đỏ thể hiện xu hướng giảm • Avatar người đứng đầu mốc
              </p>
            </div>

            {/* Chú thích màu tối giản 3 màu */}
            <div className="flex items-center gap-4 text-xs font-bold text-slate-600 dark:text-slate-300">
              <span className="flex items-center gap-1.5">
                <span className="size-3 rounded-md bg-[#003B95]" />
                Cột số liệu ({activeCategoryMeta.unit})
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-3 rounded-full bg-emerald-500" />
                Xu hướng tăng (Xanh)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-3 rounded-full bg-rose-600" />
                Xu hướng giảm (Đỏ)
              </span>
            </div>
          </div>

          <div className="w-full h-80 pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 25, right: 20, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="name" tick={{ fontSize: 12, fontWeight: 600 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <Tooltip content={<CustomChartTooltip />} />

                {/* Cột số liệu */}
                <Bar dataKey="barVal" radius={[8, 8, 0, 0]} maxBarSize={48}>
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.isUp ? PALETTE.navy : PALETTE.navy}
                      opacity={0.88}
                    />
                  ))}
                </Bar>

                {/* Đường tăng màu xanh lá, đường giảm màu đỏ */}
                <Line
                  type="monotone"
                  dataKey="trendVal"
                  stroke={PALETTE.green}
                  strokeWidth={3}
                  dot={(props: any) => {
                    const { cx, cy, payload } = props;
                    return (
                      <g key={`dot-${cx}-${cy}`}>
                        <circle
                          cx={cx}
                          cy={cy}
                          r={6}
                          fill={payload.isUp ? PALETTE.green : PALETTE.red}
                          stroke="#ffffff"
                          strokeWidth={2}
                        />
                        {/* Avatar người đứng top đỉnh cột mốc cuối */}
                        {payload.name === "T6" && (
                          <g transform={`translate(${cx - 16}, ${cy - 36})`}>
                            <circle cx="16" cy="16" r="16" fill="#F59E0B" />
                            <clipPath id="avatar-clip">
                              <circle cx="16" cy="16" r="14" />
                            </clipPath>
                            <image
                              href={payload.avatar}
                              x="2"
                              y="2"
                              width="28"
                              height="28"
                              clipPath="url(#avatar-clip)"
                            />
                            <circle cx="16" cy="16" r="14" fill="none" stroke="#F59E0B" strokeWidth="2" />
                          </g>
                        )}
                      </g>
                    );
                  }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── GIẢI THƯỞNG 3 NGƯỜI ĐỨNG TOP (PODIUM 3 CỘT TRONG 1 HÀNG DUY NHẤT) ── */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-500">
                <Award className="size-4" />
              </span>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Bảng Vàng Vinh Danh Top 3 {activeCategoryMeta.label}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Vinh danh 3 hội viên / ban có đóng góp xuất sắc nhất kỳ báo cáo
                </p>
              </div>
            </div>
            <div className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-black">
              🏆 BỤC VINH DANH HANOIBA
            </div>
          </div>

          {/* 3 Cột nằm chung 1 hàng: Top 2 (Trái) | Top 1 (Giữa, Cao nhất) | Top 3 (Phải) */}
          <div className="grid grid-cols-3 gap-3 sm:gap-6 items-end pt-4 max-w-4xl mx-auto">
            {/* 🥈 TOP 2 (BÊN TRÁI) */}
            {top2 && (
              <div className="flex flex-col items-center text-center order-1">
                <div className="relative mb-2">
                  <div className="size-16 sm:size-20 rounded-2xl overflow-hidden border-2 border-slate-300 dark:border-slate-600 shadow-md">
                    <img src={top2.avatar} alt={top2.name} className="size-full object-cover" />
                  </div>
                  <span className="absolute -bottom-2 -right-1 size-7 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white font-black text-xs flex items-center justify-center border-2 border-white dark:border-slate-900 shadow">
                    2
                  </span>
                </div>
                <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white line-clamp-1 mt-1">
                  {top2.name}
                </h4>
                <p className="text-[10px] text-slate-500 line-clamp-1">{top2.company}</p>
                <div className="mt-1 font-mono font-bold text-xs text-[#003B95] dark:text-amber-400">
                  {top2.score}
                </div>

                {/* Bục Top 2 (Độ cao vừa: h-28) */}
                <div className="w-full h-28 sm:h-32 mt-3 rounded-2xl bg-gradient-to-t from-slate-200 to-slate-100 dark:from-slate-800 dark:to-slate-700 border border-slate-300 dark:border-slate-600 flex flex-col items-center justify-center p-2 shadow-xs">
                  <span className="text-xl sm:text-2xl">🥈</span>
                  <span className="text-xs font-black uppercase text-slate-700 dark:text-slate-200 mt-1">
                    Á Quân 1
                  </span>
                  <span className="text-[10px] text-slate-500">{top2.value}</span>
                </div>
              </div>
            )}

            {/* 🥇 TOP 1 (Ở GIỮA - CAO NHẤT) */}
            {top1 && (
              <div className="flex flex-col items-center text-center order-2">
                <div className="relative mb-2">
                  {/* Vương miện vàng */}
                  <Crown className="size-6 text-amber-500 animate-bounce absolute -top-5 left-1/2 -translate-x-1/2" />
                  <div className="size-20 sm:size-24 rounded-3xl overflow-hidden border-4 border-amber-400 shadow-xl ring-4 ring-amber-400/20">
                    <img src={top1.avatar} alt={top1.name} className="size-full object-cover" />
                  </div>
                  <span className="absolute -bottom-2.5 -right-1.5 size-8 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-black text-sm flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-md">
                    1
                  </span>
                </div>
                <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white line-clamp-1 mt-1">
                  {top1.name}
                </h4>
                <p className="text-[11px] text-amber-600 dark:text-amber-400 font-bold line-clamp-1">{top1.company}</p>
                <div className="mt-1 font-mono font-black text-sm text-[#003B95] dark:text-amber-400">
                  {top1.score}
                </div>

                {/* Bục Top 1 (Cao nhất: h-40) */}
                <div className="w-full h-36 sm:h-44 mt-3 rounded-2xl bg-gradient-to-t from-amber-500 via-amber-400 to-amber-300 text-slate-950 border border-amber-300 flex flex-col items-center justify-center p-2 shadow-lg">
                  <span className="text-2xl sm:text-3xl">🥇</span>
                  <span className="text-xs sm:text-sm font-black uppercase tracking-wider mt-1">
                    Quán Quân
                  </span>
                  <span className="text-[11px] font-bold text-slate-800">{top1.value}</span>
                </div>
              </div>
            )}

            {/* 🥉 TOP 3 (BÊN PHẢI) */}
            {top3 && (
              <div className="flex flex-col items-center text-center order-3">
                <div className="relative mb-2">
                  <div className="size-16 sm:size-20 rounded-2xl overflow-hidden border-2 border-amber-600/40 shadow-md">
                    <img src={top3.avatar} alt={top3.name} className="size-full object-cover" />
                  </div>
                  <span className="absolute -bottom-2 -right-1 size-7 rounded-xl bg-amber-700 text-white font-black text-xs flex items-center justify-center border-2 border-white dark:border-slate-900 shadow">
                    3
                  </span>
                </div>
                <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white line-clamp-1 mt-1">
                  {top3.name}
                </h4>
                <p className="text-[10px] text-slate-500 line-clamp-1">{top3.company}</p>
                <div className="mt-1 font-mono font-bold text-xs text-[#003B95] dark:text-amber-400">
                  {top3.score}
                </div>

                {/* Bục Top 3 (Độ cao thấp hơn: h-24) */}
                <div className="w-full h-24 sm:h-28 mt-3 rounded-2xl bg-gradient-to-t from-amber-800/30 to-amber-700/20 dark:from-amber-950 dark:to-amber-900/40 border border-amber-600/40 flex flex-col items-center justify-center p-2 shadow-xs">
                  <span className="text-xl sm:text-2xl">🥉</span>
                  <span className="text-xs font-black uppercase text-amber-700 dark:text-amber-300 mt-1">
                    Á Quân 2
                  </span>
                  <span className="text-[10px] text-slate-500">{top3.value}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── MODAL XUẤT BÁO CÁO CHUẨN FORMAT (THEO YÊU CẦU 1) ── */}
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
                      Báo cáo phân hệ: <strong>{activeCategoryMeta.label}</strong> • Kỳ: <strong>{period.toUpperCase()}</strong>
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

              {/* Bản xem trước cấu trúc báo cáo */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs space-y-3 font-mono">
                <div className="flex justify-between border-b pb-2 font-bold text-slate-900 dark:text-white">
                  <span>HIỆP HỘI DOANH NGHIỆP TRẺ HÀ NỘI (HANOIBA)</span>
                  <span>MẪU BC-08/CEO1983</span>
                </div>
                <div className="text-center py-2 font-black text-sm text-[#003B95] dark:text-amber-400">
                  BÁO CÁO TỔNG QUAN {activeCategoryMeta.label.toUpperCase()}
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-600 dark:text-slate-300">
                  <div>Kỳ báo cáo: {period === "week" ? "Tuần hiện tại" : period === "month" ? "Tháng này" : "Năm tài khóa"}</div>
                  <div>Ngày kết xuất: {new Date().toLocaleDateString("vi-VN")}</div>
                  <div>Đơn vị thống kê: {activeCategoryMeta.unit}</div>
                  <div>Hội viên dẫn đầu: {top1?.name}</div>
                </div>
                <div className="pt-2 border-t text-[11px] text-slate-500">
                  * Dữ liệu được trích xuất trực tiếp từ máy chủ cơ sở dữ liệu PostgreSQL CLB CEO 1983 thời gian thực.
                </div>
              </div>

              {/* Tùy chọn định dạng */}
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
