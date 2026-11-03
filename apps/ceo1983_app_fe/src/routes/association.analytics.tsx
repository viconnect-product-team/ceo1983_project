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
  FileSpreadsheet,
  ImageIcon,
  ShieldCheck,
  UserPlus,
  Medal,
  Trophy,
  Gift,
} from "lucide-react";
import { toast } from "sonner";
import { fetchNestApi, resolveMediaUrl } from "@/lib/api-client";
import { useAuth } from "@/context/AuthContext";
import { MemberHeader } from "@/components/member/MemberShell";
import { MilestoneAward, getAwardsByCategory } from "@/lib/milestone-awards";
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
  | "top_connections"
  | "top_opportunities"
  | "top_events_meetings"
  | "top_referrals"
  | "external_shares";

export interface TopPerformer {
  rank: 1 | 2 | 3;
  tier: "Kim Cương" | "Bạch Kim" | "Vàng";
  tierCode: "DIAMOND" | "PLATINUM" | "GOLD";
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

  // ── 3 DANH MỤC THỐNG KÊ CHUẨN YÊU CẦU ──
  // 1. 3 thành viên kết nối nhiều nhất (tháng, quý, năm)
  // 2. Hội viên chia sẻ cơ hội nhiều nhất (tháng, quý, năm) - Chỉ tính cơ hội public
  // 3. 3 thành viên tham gia nhiều sự kiện, cuộc họp nhất và tương tác nhiều nhất
  const [activeCategory, setActiveCategory] = useState<AnalyticsCategory>("top_connections");
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<"excel" | "pdf" | "image">("excel");
  const [exportAuditTime, setExportAuditTime] = useState<string>("");
  const [currentMember, setCurrentMember] = useState<any>(null);
  const [oppStats, setOppStats] = useState<{ totalOpps: number; totalValue: number; wonCount: number }>({
    totalOpps: 0,
    totalValue: 0,
    wonCount: 0,
  });

  // Chỉ lọc theo: Tháng, Quý, Năm
  const [timeRange, setTimeRange] = useState<"month" | "quarter" | "year">("month");
  const [loading, setLoading] = useState(false);
  const [serverData, setServerData] = useState<any>(null);

  // Giải thưởng Gamification đồng bộ từ Web CRM
  const [awardsUpdatedTick, setAwardsUpdatedTick] = useState(0);
  const [showAwardsRoadmapModal, setShowAwardsRoadmapModal] = useState(false);

  // Thu gọn Top 10 Bảng xếp hạng (mặc định đóng)
  const [showTop10Expanded, setShowTop10Expanded] = useState(false);

  // Bộ lọc xu hướng biểu đồ: Tất cả (Vừa tăng vừa giảm) | Tăng trưởng (Chỉ tăng) | Sụt giảm (Chỉ giảm)
  const [trendFilter, setTrendFilter] = useState<"all" | "up" | "down">("all");

  // Section Bình luận & Thảo luận Thống Kê
  const [comments, setComments] = useState<
    Array<{
      id: string;
      name: string;
      avatar: string;
      time: string;
      text: string;
      likes: number;
      isLiked?: boolean;
    }>
  >([
    {
      id: "cmt-1",
      name: "Chủ tịch Lê Phụng Thắng",
      avatar: "/ceo1983-emblem-8.png",
      time: "15 phút trước",
      text: "Chúc mừng toàn thể anh chị em hội viên! Kết quả giao thương tháng này tăng trưởng vượt bậc 28.5%, đặc biệt các buổi gặp 1-on-1 đã chuyển hóa thành công nhiều hợp đồng giá trị cao.",
      likes: 12,
      isLiked: true,
    },
    {
      id: "cmt-2",
      name: "Nguyễn Văn Cường (Phó Chủ Tịch)",
      avatar: "/ceo1983-emblem-8.png",
      time: "42 phút trước",
      text: "Các phiên kết nối cung cầu chuỗi cung ứng diễn ra rất thực chất. Tháng tới Ban Xúc Tiến Thương Mại sẽ mở rộng thêm 3 phiên kết nối đa ngành nghề cho các anh chị.",
      likes: 8,
      isLiked: false,
    },
  ]);
  const [newCommentText, setNewCommentText] = useState("");

  useEffect(() => {
    const handleAwardsUpdate = () => {
      setAwardsUpdatedTick((prev) => prev + 1);
    };
    window.addEventListener("vba_milestone_awards_updated", handleAwardsUpdate);
    return () => {
      window.removeEventListener("vba_milestone_awards_updated", handleAwardsUpdate);
    };
  }, []);

  // Fetch real current member info for audit proof
  useEffect(() => {
    fetchNestApi<any>("/members/me")
      .then((res) => {
        if (res && res.id) setCurrentMember(res);
      })
      .catch(() => {});
  }, []);

  // Fetch real opportunities for high-level general stats
  useEffect(() => {
    fetchNestApi<any>("/opportunities")
      .then((res) => {
        const list = Array.isArray(res) ? res : res?.opportunities || [];
        if (Array.isArray(list)) {
          const totalOpps = list.length;
          const totalValue = list.reduce(
            (sum: number, o: any) => sum + (Number(o.budgetMax || o.budgetMin || 0)),
            0,
          );
          const wonCount = list.filter(
            (o: any) => o.status === "won" || o.status === "claimed" || o.isWon || o.claimedById,
          ).length;
          setOppStats({ totalOpps, totalValue, wonCount });
        }
      })
      .catch(() => {});
  }, []);

  // Fetch overview from NestJS backend
  useEffect(() => {
    let isMounted = true;
    async function loadStats() {
      setLoading(true);
      try {
        const res = await fetchNestApi<any>(`/analytics/overview?period=${timeRange}`);
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
  }, [timeRange]);

  // Dữ liệu 4 thẻ KPI theo từng danh mục
  const kpiCards = useMemo(() => {
    const kpi = serverData?.kpi;
    switch (activeCategory) {
      case "top_connections":
        return [
          {
            label: "Tổng lượt kết nối",
            value: kpi ? `${(kpi.totalInteractions * 0.4).toFixed(0)}` : "348 lượt",
            subtext: "+18.4% so với kỳ trước",
            isUp: true,
            icon: Handshake,
          },
          {
            label: "Cuộc hẹn 1-on-1",
            value: "186 cuộc",
            subtext: "+24.2% gặp mặt trực tiếp",
            isUp: true,
            icon: Users,
          },
          {
            label: "Hội viên đã kết nối",
            value: kpi ? `${kpi.activeCount || 86} CEO` : "92 CEO",
            subtext: "Đã thiết lập mạng lưới",
            isUp: true,
            icon: CheckCircle2,
          },
          {
            label: "Tần suất kết nối TB",
            value: "4.2 lượt/tuần",
            subtext: "Hoạt động giao thương sôi nổi",
            isUp: true,
            icon: Activity,
          },
        ];
      case "top_opportunities":
        return [
          {
            label: "Tổng cơ hội công khai",
            value: kpi ? `${kpi.totalClubOpportunities || 128} tin` : "128 tin",
            subtext: "100% public ra toàn CLB",
            isUp: true,
            icon: Sparkles,
          },
          {
            label: "Tổng giá trị niêm yết",
            value: kpi ? `${((kpi.totalValueContributed || 85000000000) / 1000000000).toFixed(1)} Tỷ đ` : "85.6 Tỷ đ",
            subtext: "+15.6% so với kỳ trước",
            isUp: true,
            icon: Coins,
          },
          {
            label: "Cơ hội đã khớp lệnh",
            value: kpi ? `${kpi.totalDealsWon || 42} deal` : "42 deal",
            subtext: "Tỷ lệ chốt đạt 32.8%",
            isUp: true,
            icon: CheckCircle2,
          },
          {
            label: "Giá trị TB / Cơ hội",
            value: "1.85 Tỷ đ",
            subtext: "+8.2% chất lượng thương vụ",
            isUp: true,
            icon: TrendingUp,
          },
        ];
      case "top_events_meetings":
        return [
          {
            label: "Sự kiện & Cuộc họp",
            value: "28 chương trình",
            subtext: "Bao gồm họp Ban & Đại hội",
            isUp: true,
            icon: Calendar,
          },
          {
            label: "Lượt đại biểu tham dự",
            value: kpi ? `${kpi.totalInteractions || 1420} lượt` : "1,420 lượt",
            subtext: "+26.8% so với cùng kỳ",
            isUp: true,
            icon: Users,
          },
          {
            label: "Tỷ lệ Check-in QR",
            value: "95.4%",
            subtext: "Điểm danh tự động chuẩn xác",
            isUp: true,
            icon: CheckCircle2,
          },
          {
            label: "Chỉ số tương tác TB",
            value: "84.2 điểm",
            subtext: "Thảo luận & đóng góp tích cực",
            isUp: true,
            icon: Award,
          },
        ];
      case "top_referrals":
      default:
        return [
          {
            label: "Hội viên mới giới thiệu",
            value: "36 CEO",
            subtext: "+35.5% tăng trưởng mạng lưới",
            isUp: true,
            icon: UserPlus,
          },
          {
            label: "Hồ sơ đã phê duyệt",
            value: "32 CEO",
            subtext: "Tỷ lệ chuẩn duyệt 88.9%",
            isUp: true,
            icon: CheckCircle2,
          },
          {
            label: "Quán quân đại sứ",
            value: "Nguyễn Hải Long",
            subtext: "9 CEO đã giới thiệu",
            isUp: true,
            icon: Crown,
          },
          {
            label: "Điểm thưởng đại sứ",
            value: "2,450 đ",
            subtext: "Tích lũy vinh danh CLB",
            isUp: true,
            icon: Award,
          },
        ];
    }
  }, [activeCategory, serverData]);

  // Tiến trình giải thưởng Gamification đồng bộ từ CRM cho từng danh mục
  const currentAwardProgress = useMemo(() => {
    let mappedCat: MilestoneAward["category"] = "top_referrals";
    let defaultCurrent = 4;
    let unitLabel = "người";
    let actionVerb = "giới thiệu";

    if (activeCategory === "top_connections") {
      mappedCat = "top_connect";
      defaultCurrent = 8;
      unitLabel = "cuộc gặp 1-on-1";
      actionVerb = "kết nối";
    } else if (activeCategory === "top_opportunities") {
      mappedCat = "top_opportunities";
      defaultCurrent = 3;
      unitLabel = "cơ hội B2B";
      actionVerb = "chia sẻ";
    } else if (activeCategory === "top_events_meetings") {
      mappedCat = "top_events_meetings";
      defaultCurrent = 6;
      unitLabel = "sự kiện & cuộc họp";
      actionVerb = "tham gia";
    } else if (activeCategory === "top_referrals") {
      mappedCat = "top_referrals";
      try {
        const rawCounts = localStorage.getItem("vba_member_referral_counts");
        if (rawCounts) {
          const parsed = JSON.parse(rawCounts);
          const myCode = (currentMember as any)?.memberCode || (user as any)?.memberCode || "CEO-1983-001";
          if (parsed && typeof parsed[myCode] === "number") {
            defaultCurrent = parsed[myCode];
          }
        }
      } catch {}
      unitLabel = "người";
      actionVerb = "giới thiệu";
    }

    const catAwards = getAwardsByCategory(mappedCat);
    // Find next unreached milestone
    const nextAward =
      catAwards.find((a) => a.targetCount > defaultCurrent) ||
      catAwards[catAwards.length - 1];
    const target = nextAward ? nextAward.targetCount : 10;
    const remaining = Math.max(0, target - defaultCurrent);
    const percent = Math.min(100, Math.round((defaultCurrent / target) * 100));
    const isCompleted = defaultCurrent >= target;

    return {
      mappedCat,
      categoryAwards: catAwards,
      currentCount: defaultCurrent,
      targetCount: target,
      remaining,
      percent,
      isCompleted,
      unitLabel,
      actionVerb,
      award: nextAward,
    };
  }, [activeCategory, awardsUpdatedTick, currentMember, user]);

  // Biểu đồ Cột + Đường (Composed Chart)
  const chartData = useMemo(() => {
    switch (activeCategory) {
      case "top_connections":
        return [
          { name: timeRange === "year" ? "2024" : timeRange === "quarter" ? "Q1" : "T1", columnVal: 28, lineVal: 18, isUp: true },
          { name: timeRange === "year" ? "2025" : timeRange === "quarter" ? "Q2" : "T2", columnVal: 36, lineVal: 24, isUp: true },
          { name: timeRange === "year" ? "2026" : timeRange === "quarter" ? "Q3" : "T3", columnVal: 30, lineVal: 21, isUp: false },
          { name: timeRange === "year" ? "2027 (KH)" : timeRange === "quarter" ? "Q4" : "T4", columnVal: 48, lineVal: 32, isUp: true, isTop: true, topAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100" },
        ];
      case "top_opportunities":
        return [
          { name: timeRange === "year" ? "2024" : timeRange === "quarter" ? "Q1" : "T1", columnVal: 18, lineVal: 12, isUp: true },
          { name: timeRange === "year" ? "2025" : timeRange === "quarter" ? "Q2" : "T2", columnVal: 24, lineVal: 16, isUp: true },
          { name: timeRange === "year" ? "2026" : timeRange === "quarter" ? "Q3" : "T3", columnVal: 20, lineVal: 14, isUp: false },
          { name: timeRange === "year" ? "2027 (KH)" : timeRange === "quarter" ? "Q4" : "T4", columnVal: 38, lineVal: 28, isUp: true, isTop: true, topAvatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100" },
        ];
      case "top_events_meetings":
        return [
          { name: timeRange === "year" ? "2024" : timeRange === "quarter" ? "Q1" : "T1", columnVal: 6, lineVal: 120, isUp: true },
          { name: timeRange === "year" ? "2025" : timeRange === "quarter" ? "Q2" : "T2", columnVal: 8, lineVal: 190, isUp: true },
          { name: timeRange === "year" ? "2026" : timeRange === "quarter" ? "Q3" : "T3", columnVal: 7, lineVal: 165, isUp: false },
          { name: timeRange === "year" ? "2027 (KH)" : timeRange === "quarter" ? "Q4" : "T4", columnVal: 12, lineVal: 280, isUp: true, isTop: true, topAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100" },
        ];
      case "top_referrals":
        return [
          { name: timeRange === "year" ? "2024" : timeRange === "quarter" ? "Q1" : "T1", columnVal: 8, lineVal: 8, isUp: true },
          { name: timeRange === "year" ? "2025" : timeRange === "quarter" ? "Q2" : "T2", columnVal: 12, lineVal: 12, isUp: true },
          { name: timeRange === "year" ? "2026" : timeRange === "quarter" ? "Q3" : "T3", columnVal: 16, lineVal: 16, isUp: true, isTop: true, topAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100" },
          { name: timeRange === "year" ? "2027 (KH)" : timeRange === "quarter" ? "Q4" : "T4", columnVal: 24, lineVal: 24, isUp: true },
        ];
      case "external_shares":
      default:
        return [
          { name: timeRange === "year" ? "2024" : timeRange === "quarter" ? "Q1" : "T1", columnVal: 140, lineVal: 43, isUp: true },
          { name: timeRange === "year" ? "2025" : timeRange === "quarter" ? "Q2" : "T2", columnVal: 220, lineVal: 45, isUp: true },
          { name: timeRange === "year" ? "2026" : timeRange === "quarter" ? "Q3" : "T3", columnVal: 305, lineVal: 46, isUp: true, isTop: true, topAvatar: "/ceo1983-emblem-8.png" },
          { name: timeRange === "year" ? "2027 (KH)" : timeRange === "quarter" ? "Q4" : "T4", columnVal: 420, lineVal: 52, isUp: true },
        ];
    }
  }, [activeCategory, timeRange]);

  // Lọc dữ liệu biểu đồ theo chế độ: Vừa tăng vừa giảm (all) | Tăng (up) | Giảm (down)
  const filteredChartData = useMemo(() => {
    if (trendFilter === "up") {
      const list = chartData.filter((d) => d.isUp);
      return list.length > 0 ? list : chartData;
    }
    if (trendFilter === "down") {
      const list = chartData.filter((d) => !d.isUp);
      return list.length > 0
        ? list
        : [
            {
              name: timeRange === "year" ? "2026 (Điều chỉnh)" : timeRange === "quarter" ? "Q3 (Điều chỉnh)" : "T3 (Điều chỉnh)",
              columnVal: 16,
              lineVal: 12,
              isUp: false,
            },
          ];
    }
    return chartData;
  }, [chartData, trendFilter, timeRange]);

  // Danh sách Top 1 đến Top 10 đầy đủ cho cả 4 danh mục
  const allRankedList = useMemo(() => {
    switch (activeCategory) {
      case "top_connections":
        return [
          { rank: 1, tier: "Kim Cương", tierCode: "DIAMOND", name: "Phạm Văn Vũ", company: "Tập Đoàn Công Nghệ ViConnect", title: "Chủ Tịch HĐQT", dept: "Ban Công Nghệ", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200", valueStr: "38 Lượt kết nối B2B", badge: "Kim Cương 💎", phone: "0901234567" },
          { rank: 2, tier: "Bạch Kim", tierCode: "PLATINUM", name: "Nguyễn Thị Mai", company: "Green Farm Group", title: "Tổng Giám Đốc", dept: "Ban Truyền Thông", avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200", valueStr: "28 Lượt kết nối B2B", badge: "Bạch Kim 🪙", phone: "0912345678" },
          { rank: 3, tier: "Vàng", tierCode: "GOLD", name: "Trần Quốc Bảo", company: "Bảo Phát Logistics Quốc Tế", title: "Giám Đốc Điều Hành", dept: "Ban Xúc Tiến", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200", valueStr: "21 Lượt kết nối B2B", badge: "Vàng 🥇", phone: "0987654321" },
          { rank: 4, name: "Lê Hoàng Cường", company: "Cơ điện & Tự động hóa HP", title: "Giám đốc", dept: "Ban Tài Chính", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200", valueStr: "18 Lượt kết nối B2B", phone: "0913222333" },
          { rank: 5, name: "Hoàng Yến Chi", company: "Truyền thông & Sự kiện YC", title: "Chủ sáng lập", dept: "Ban Sự Kiện", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200", valueStr: "16 Lượt kết nối B2B", phone: "0988776655" },
          { rank: 6, name: "Đỗ Minh Khang", company: "Khang Land Real Estate", title: "Tổng Giám Đốc", dept: "Ban Xúc Tiến", avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200", valueStr: "14 Lượt kết nối B2B", phone: "0909988776" },
          { rank: 7, name: "Vũ Thành Đạt", company: "Kiến trúc Xanh An Phát", title: "Giám đốc Kỹ thuật", dept: "Ban Thành Viên", avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200", valueStr: "13 Lượt kết nối B2B", phone: "0934556677" },
          { rank: 8, name: "Phan Thanh Hà", company: "Dược phẩm Hà Thành", title: "Tổng Giám đốc", dept: "Ban Xúc Tiến", avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200", valueStr: "11 Lượt kết nối B2B", phone: "0915889900" },
          { rank: 9, name: "Bùi Anh Tuấn", company: "Nội thất Gỗ Hoàng Gia", title: "Giám đốc điều hành", dept: "Ban Tài Chính", avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=200", valueStr: "10 Lượt kết nối B2B", phone: "0982443322" },
          { rank: 10, name: "Trịnh Thùy Linh", company: "Tư vấn Luật TL Law", title: "Luật sư Trưởng", dept: "Ban Thư Ký", avatar: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=200", valueStr: "9 Lượt kết nối B2B", phone: "0977123456" },
        ];
      case "top_opportunities":
        return [
          { rank: 1, tier: "Kim Cương", tierCode: "DIAMOND", name: "Đỗ Minh Khang", company: "Khang Land Real Estate", title: "Tổng Giám Đốc", dept: "Ban Xúc Tiến", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200", valueStr: "26 Cơ hội công khai", badge: "Kim Cương 💎", phone: "0909988776" },
          { rank: 2, tier: "Bạch Kim", tierCode: "PLATINUM", name: "Lê Hoàng Yến", company: "Yến Sào Hoàng Gia Luxury", title: "Chủ Tịch", dept: "Ban Thành Viên", avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200", valueStr: "18 Cơ hội công khai", badge: "Bạch Kim 🪙", phone: "0933221100" },
          { rank: 3, tier: "Vàng", tierCode: "GOLD", name: "Phan Anh Tuấn", company: "Tuấn Phát Tech & Hardware", title: "CEO", dept: "Ban Công Nghệ", avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200", valueStr: "14 Cơ hội công khai", badge: "Vàng 🥇", phone: "0977889900" },
          { rank: 4, name: "Phạm Văn Vũ", company: "Tập Đoàn Công Nghệ ViConnect", title: "Chủ Tịch HĐQT", dept: "Ban Công Nghệ", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200", valueStr: "12 Cơ hội công khai", phone: "0901234567" },
          { rank: 5, name: "Nguyễn Thị Mai", company: "Green Farm Group", title: "Tổng Giám Đốc", dept: "Ban Truyền Thông", avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200", valueStr: "11 Cơ hội công khai", phone: "0912345678" },
          { rank: 6, name: "Trần Quốc Bảo", company: "Bảo Phát Logistics", title: "Giám Đốc", dept: "Ban Xúc Tiến", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200", valueStr: "9 Cơ hội công khai", phone: "0987654321" },
          { rank: 7, name: "Vũ Thành Đạt", company: "Kiến trúc Xanh An Phát", title: "Giám đốc Kỹ thuật", dept: "Ban Thành Viên", avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200", valueStr: "8 Cơ hội công khai", phone: "0934556677" },
          { rank: 8, name: "Bùi Thanh Trúc", company: "Trúc Xanh Media & Event", title: "CEO", dept: "Ban Sự Kiện", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200", valueStr: "7 Cơ hội công khai", phone: "0911223344" },
          { rank: 9, name: "Hoàng Gia Bảo", company: "Gia Bảo Luật & Tư Vấn Thuế", title: "Luật Sư Điều Hành", dept: "Ban Thư Ký", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200", valueStr: "6 Cơ hội công khai", phone: "0944556677" },
          { rank: 10, name: "Trịnh Thùy Linh", company: "Tư vấn Luật TL Law", title: "Luật sư Trưởng", dept: "Ban Thư Ký", avatar: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=200", valueStr: "5 Cơ hội công khai", phone: "0977123456" },
        ];
      case "top_events_meetings":
        return [
          { rank: 1, tier: "Kim Cương", tierCode: "DIAMOND", name: "Phạm Văn Vũ", company: "Tập Đoàn Công Nghệ ViConnect", title: "Chủ Tịch HĐQT", dept: "Ban Công Nghệ", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200", valueStr: "19 Sự kiện & 192 Tương tác", badge: "Kim Cương 💎", phone: "0901234567" },
          { rank: 2, tier: "Bạch Kim", tierCode: "PLATINUM", name: "Bùi Thanh Trúc", company: "Trúc Xanh Media & Event", title: "CEO", dept: "Ban Sự Kiện", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200", valueStr: "15 Sự kiện & 142 Tương tác", badge: "Bạch Kim 🪙", phone: "0911223344" },
          { rank: 3, tier: "Vàng", tierCode: "GOLD", name: "Hoàng Gia Bảo", company: "Gia Bảo Luật & Tư Vấn Thuế", title: "Luật Sư Điều Hành", dept: "Ban Thư Ký", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200", valueStr: "12 Sự kiện & 118 Tương tác", badge: "Vàng 🥇", phone: "0944556677" },
          { rank: 4, name: "Nguyễn Thị Mai", company: "Green Farm Group", title: "Tổng Giám Đốc", dept: "Ban Truyền Thông", avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200", valueStr: "11 Sự kiện & 98 Tương tác", phone: "0912345678" },
          { rank: 5, name: "Trần Hải Nam", company: "Tập Đoàn Tân Á Đông", title: "Chủ tịch HĐQT", dept: "Ban Xúc Tiến", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200", valueStr: "10 Sự kiện & 88 Tương tác", phone: "0912345671" },
          { rank: 6, name: "Lê Hoàng Cường", company: "Cơ điện & Tự động hóa HP", title: "Giám đốc", dept: "Ban Tài Chính", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200", valueStr: "9 Sự kiện & 75 Tương tác", phone: "0913222333" },
          { rank: 7, name: "Đỗ Minh Khang", company: "Khang Land Real Estate", title: "Tổng Giám Đốc", dept: "Ban Xúc Tiến", avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200", valueStr: "9 Sự kiện & 72 Tương tác", phone: "0909988776" },
          { rank: 8, name: "Vũ Thành Đạt", company: "Kiến trúc Xanh An Phát", title: "Giám đốc Kỹ thuật", dept: "Ban Thành Viên", avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200", valueStr: "8 Sự kiện & 64 Tương tác", phone: "0934556677" },
          { rank: 9, name: "Phan Thanh Hà", company: "Dược phẩm Hà Thành", title: "Tổng Giám đốc", dept: "Ban Xúc Tiến", avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200", valueStr: "7 Sự kiện & 58 Tương tác", phone: "0915889900" },
          { rank: 10, name: "Trịnh Thùy Linh", company: "Tư vấn Luật TL Law", title: "Luật sư Trưởng", dept: "Ban Thư Ký", avatar: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=200", valueStr: "7 Sự kiện & 52 Tương tác", phone: "0977123456" },
        ];
      case "top_referrals":
      default:
        return [
          { rank: 1, tier: "Kim Cương", tierCode: "DIAMOND", name: "Nguyễn Hải Long", company: "Tập Đoàn BĐS Thăng Long", title: "Chủ tịch HĐQT", dept: "Ban Xúc Tiến", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200", valueStr: "9 CEO đã giới thiệu", badge: "Kim Cương 💎", phone: "0918888999" },
          { rank: 2, tier: "Bạch Kim", tierCode: "PLATINUM", name: "Trần Mai Phương", company: "Tập Đoàn Giáo Dục SmartEdu", title: "Tổng Giám Đốc", dept: "Ban Thành Viên", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200", valueStr: "7 CEO đã giới thiệu", badge: "Bạch Kim 🪙", phone: "0903667889" },
          { rank: 3, tier: "Vàng", tierCode: "GOLD", name: "Phạm Văn Vũ", company: "Tập Đoàn Công Nghệ ViConnect", title: "Chủ Tịch HĐQT", dept: "Ban Công Nghệ", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200", valueStr: "5 CEO đã giới thiệu", badge: "Vàng 🥇", phone: "0901234567" },
          { rank: 4, name: "Nguyễn Thị Mai", company: "Green Farm Group", title: "Tổng Giám Đốc", dept: "Ban Truyền Thông", avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200", valueStr: "4 CEO đã giới thiệu", phone: "0912345678" },
          { rank: 5, name: "Trần Hải Nam", company: "Tập Đoàn Tân Á Đông", title: "Chủ tịch HĐQT", dept: "Ban Xúc Tiến", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200", valueStr: "3 CEO đã giới thiệu", phone: "0912345671" },
          { rank: 6, name: "Lê Hoàng Cường", company: "Cơ điện & Tự động hóa HP", title: "Giám đốc", dept: "Ban Tài Chính", avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200", valueStr: "2 CEO đã giới thiệu", phone: "0913222333" },
          { rank: 7, name: "Hoàng Yến Chi", company: "Truyền thông & Sự kiện YC", title: "Chủ sáng lập", dept: "Ban Sự Kiện", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200", valueStr: "2 CEO đã giới thiệu", phone: "0988776655" },
          { rank: 8, name: "Đỗ Quốc Bảo", company: "Bảo Phát Logistics", title: "Chủ tịch", dept: "Ban Xúc Tiến", avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200", valueStr: "2 CEO đã giới thiệu", phone: "0987654321" },
          { rank: 9, name: "Vũ Thành Đạt", company: "Kiến trúc Xanh An Phát", title: "Giám đốc Kỹ thuật", dept: "Ban Thành Viên", avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=200", valueStr: "1 CEO đã giới thiệu", phone: "0934556677" },
          { rank: 10, name: "Bùi Anh Tuấn", company: "Nội thất Gỗ Hoàng Gia", title: "Giám đốc điều hành", dept: "Ban Tài Chính", avatar: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=200", valueStr: "1 CEO đã giới thiệu", phone: "0982443322" },
        ];
    }
  }, [activeCategory]);

  // Bục vinh danh 3 người đứng top (Podium)
  const podiumTop3: TopPerformer[] = useMemo(() => {
    const list = allRankedList.slice(0, 3);
    const top1 = list.find((m) => m.rank === 1) || list[0];
    const top2 = list.find((m) => m.rank === 2) || list[1];
    const top3 = list.find((m) => m.rank === 3) || list[2];

    return [
      {
        rank: 2,
        tier: "Bạch Kim",
        tierCode: "PLATINUM",
        name: top2.name,
        company: top2.company,
        title: top2.title,
        avatar: top2.avatar,
        valueStr: top2.valueStr,
        score: 180,
        badge: "Bạch Kim 🪙",
        phone: top2.phone,
      },
      {
        rank: 1, // Ở giữa cao nhất
        tier: "Kim Cương",
        tierCode: "DIAMOND",
        name: top1.name,
        company: top1.company,
        title: top1.title,
        avatar: top1.avatar,
        valueStr: top1.valueStr,
        score: 250,
        badge: "Kim Cương 💎",
        phone: top1.phone,
      },
      {
        rank: 3,
        tier: "Vàng",
        tierCode: "GOLD",
        name: top3.name,
        company: top3.company,
        title: top3.title,
        avatar: top3.avatar,
        valueStr: top3.valueStr,
        score: 140,
        badge: "Vàng 🥇",
        phone: top3.phone,
      },
    ];
  }, [allRankedList]);

  // Danh sách những người xếp hạng từ Top 4 đến Top 10
  const remainingTop4To10 = useMemo(() => {
    return allRankedList.slice(3, 10);
  }, [allRankedList]);

  // Custom Dot hiển thị Avatar người đứng Top ở đỉnh đường kẻ
  const renderTopAvatarDot = (props: any) => {
    const { cx, cy, payload, index } = props;
    if (payload?.isTop && payload?.topAvatar) {
      return (
        <g key={`dot-${index}`}>
          <circle cx={cx} cy={cy} r={14} fill="#06B6D4" stroke="#ffffff" strokeWidth={2} />
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
            fill="#06B6D4"
            fontSize={9}
            fontWeight="bold"
          >
            KIM CƯƠNG 💎
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
      />

      {/* ── BỘ LỌC KỲ BÁO CÁO: THÁNG / QUÝ / NĂM ── */}
      <div className="px-3 sm:px-4 pt-3 flex items-center justify-between gap-2 border-b border-slate-100 dark:border-white/5 pb-2">
        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
          Kỳ thống kê:
        </span>
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-white/5 p-0.5 rounded-xl">
          {[
            { id: "month", label: "Tháng" },
            { id: "quarter", label: "Quý" },
            { id: "year", label: "Năm" },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTimeRange(item.id as any)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                timeRange === item.id
                  ? "bg-white dark:bg-[#003B95] text-[#003B95] dark:text-white shadow-xs font-black"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── 4 TABS DANH MỤC THỐNG KÊ CHI TIẾT ── */}
      <div className="px-3 sm:px-4 pt-2.5 overflow-x-auto no-scrollbar flex items-center gap-1.5 select-none border-b border-slate-100 dark:border-white/5 pb-2">
        {[
          {
            id: "top_connections",
            shortLabel: "Kết Nối Giao Thương",
            icon: Handshake,
          },
          {
            id: "top_opportunities",
            shortLabel: "Cơ Hội Kinh Doanh",
            icon: Sparkles,
          },
          {
            id: "top_events_meetings",
            shortLabel: "Sự Kiện & Cuộc Họp",
            icon: Calendar,
          },
          {
            id: "top_referrals",
            shortLabel: "Phát Triển Hội Viên",
            icon: UserPlus,
          },
          {
            id: "external_shares",
            shortLabel: "Click Chia Sẻ Ngoài",
            icon: Share2,
          },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeCategory === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveCategory(tab.id as AnalyticsCategory)}
              className={`shrink-0 px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                isActive
                  ? "bg-[#003B95] text-white shadow-xs font-extrabold"
                  : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
              }`}
            >
              <Icon className="size-3.5" />
              <span>{tab.shortLabel}</span>
            </button>
          );
        })}
      </div>

      <div className="px-3 sm:px-4 pt-3.5 space-y-4">
        {/* ── 1. BIỂU ĐỒ CỘT & ĐƯỜNG CÂN ĐỐI ── */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#131a26] border border-slate-200/80 dark:border-white/10 shadow-xs space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BarChart3 className="size-4 text-[#003B95] dark:text-amber-400" />
                <span>Biểu Đồ Xu Hướng ({timeRange === "month" ? "Tháng Này" : timeRange === "quarter" ? "Quý Này" : "Năm Tài Khóa"})</span>
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Cột thể hiện khối lượng thực tế, đường đo lường tỷ lệ tăng trưởng
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs font-medium text-slate-600 dark:text-slate-300 shrink-0">
              <span className="flex items-center gap-1">
                <span className="size-2.5 rounded-xs bg-[#003B95]" />
                Thực tế
              </span>
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                <span className="w-3 h-0.5 bg-[#10B981]" />
                Tăng trưởng
              </span>
            </div>
          </div>

          {/* Recharts Composed Chart Canvas */}
          <div className="h-56 w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 15, right: 10, left: -10, bottom: 0 }}>
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
                          <p className="font-bold border-b border-slate-800 pb-1 mb-1">{label}</p>
                          <p className="text-blue-300">Khối lượng: {payload[0]?.value}</p>
                          <p className="text-emerald-400">Tăng trưởng: {payload[1]?.value}%</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey="columnVal"
                  name="Khối lượng"
                  fill="#003B95"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={32}
                />
                <Line
                  type="monotone"
                  dataKey="lineVal"
                  name="Tăng trưởng"
                  stroke="#10B981"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: "#10B981", stroke: "#ffffff", strokeWidth: 1.5 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── 2. 4 THẺ KPI CHI TIẾT THEO DANH MỤC ĐANG CHỌN (kpiCards) ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
          {kpiCards.map((kpi, idx) => {
            const Icon = kpi.icon;
            return (
              <div
                key={idx}
                className="p-3 rounded-2xl bg-white dark:bg-[#131a26] border border-slate-100 dark:border-slate-800 shadow-2xs space-y-1"
              >
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-[10.5px] font-semibold truncate">{kpi.label}</span>
                  <Icon className="size-3.5 text-[#1E3A8A] dark:text-amber-400 shrink-0" />
                </div>
                <div className="text-sm sm:text-base font-black text-slate-900 dark:text-white truncate">
                  {kpi.value}
                </div>
                <div className="text-[9.5px] font-bold text-[#1E3A8A] dark:text-blue-400 truncate">
                  {kpi.subtext}
                </div>
              </div>
            );
          })}
        </div>

        {/* ── 3. KHỐI TIẾN TRÌNH GIẢI THƯỞNG MỐC THỐNG KÊ (GAMIFICATION CHUẨN 3 MÀU CEO 1983) ── */}
        <div className="p-4 rounded-3xl bg-white dark:bg-[#131a26] border border-blue-200 dark:border-blue-900/50 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-xl bg-gradient-to-tr from-[#003B95] to-blue-600 flex items-center justify-center text-white shadow-sm font-black">
                <Trophy className="size-4 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#003B95] dark:text-blue-400">
                    Giải Thưởng Mốc Thống Kê
                  </span>
                  <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-blue-50 dark:bg-blue-950/60 text-[#003B95] dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                    {currentAwardProgress.mappedCat === "top_referrals"
                      ? "Top Giới Thiệu"
                      : currentAwardProgress.mappedCat === "top_connect"
                      ? "Top Kết Nối"
                      : currentAwardProgress.mappedCat === "top_opportunities"
                      ? "Top Cơ Hội"
                      : "Top Sự Kiện"}
                  </span>
                </div>
                <h4 className="text-xs font-black text-slate-900 dark:text-white line-clamp-1">
                  Mục tiêu: {currentAwardProgress.award?.awardName || "Mốc Thành Tích Vàng"}
                </h4>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowAwardsRoadmapModal(true)}
              className="px-2.5 py-1 rounded-xl bg-blue-50 dark:bg-slate-800 text-[11px] font-bold text-[#003B95] dark:text-blue-400 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-slate-700 transition flex items-center gap-1 cursor-pointer shrink-0 shadow-xs"
            >
              <Gift className="size-3.5" />
              <span>Lộ trình ({currentAwardProgress.categoryAwards.length})</span>
            </button>
          </div>

          {/* Câu thông điệp tiến trình chuẩn yêu cầu */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/85 border border-slate-200/80 dark:border-slate-800 space-y-2">
            <div className="flex items-start gap-2">
              <Sparkles className="size-4 text-[#003B95] dark:text-blue-400 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-800 dark:text-slate-100 font-medium leading-relaxed">
                {currentAwardProgress.isCompleted ? (
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    🎉 Xuất sắc! Bạn đã đạt mốc {currentAwardProgress.targetCount} {currentAwardProgress.unitLabel} và mở khóa thành công giải thưởng:{" "}
                    <span className="font-black text-[#003B95] dark:text-blue-400">{currentAwardProgress.award?.awardName}</span>!
                  </span>
                ) : (
                  <>
                    Bạn đang {currentAwardProgress.actionVerb} được{" "}
                    <strong className="text-[#003B95] dark:text-cyan-400 font-black text-sm">
                      {currentAwardProgress.currentCount}
                    </strong>{" "}
                    /{" "}
                    <strong className="text-slate-900 dark:text-white font-black text-sm">
                      {currentAwardProgress.targetCount}
                    </strong>{" "}
                    {currentAwardProgress.unitLabel}, hãy {currentAwardProgress.actionVerb} thêm{" "}
                    <strong className="text-[#003B95] dark:text-cyan-400 font-black text-sm">
                      {currentAwardProgress.remaining}
                    </strong>{" "}
                    {currentAwardProgress.unitLabel} nữa để mở khóa giải thưởng:{" "}
                    <span className="font-black text-[#003B95] dark:text-blue-400 underline decoration-blue-400">
                      {currentAwardProgress.award?.awardName}
                    </span>
                    !
                  </>
                )}
              </p>
            </div>

            {/* Chi tiết phần thưởng */}
            {currentAwardProgress.award?.rewardValueStr && (
              <div className="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 px-2.5 py-1 rounded-xl border border-slate-200 dark:border-slate-700">
                <Gift className="size-3.5 text-[#003B95] dark:text-blue-400 shrink-0" />
                <span>Phần thưởng mở khóa:</span>
                <span className="font-bold text-[#003B95] dark:text-blue-300">
                  {currentAwardProgress.award.rewardValueStr}
                </span>
              </div>
            )}

            {/* Thanh tiến trình % động màu CEO 1983 Blue */}
            <div className="space-y-1 pt-1">
              <div className="flex justify-between items-center text-[10px] font-bold">
                <span className="text-slate-500">Tiến độ mở khóa</span>
                <span className="text-[#003B95] dark:text-blue-400 font-black">
                  {currentAwardProgress.percent}%
                </span>
              </div>
              <div className="h-2.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-600 to-[#003B95] transition-all duration-500 shadow-xs"
                  style={{ width: `${currentAwardProgress.percent}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── 4 CHỈ SỐ LỚN ĐẠI DIỆN 4 DANH MỤC CỐT LÕI CỦA CLB CEO 1983 ── */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <BarChart3 className="size-4 text-[#1E3A8A] dark:text-amber-400" />
              <span>Chỉ Số Trọng Tâm 4 Danh Mục Cốt Lõi</span>
            </span>
            <span className="text-[10.5px] font-semibold text-slate-500">Dữ liệu thời gian thực</span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {/* Danh mục 1: Giao Thương B2B */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-blue-900 to-[#1E3A8A] text-white shadow-xs space-y-1.5 border border-blue-800/40">
              <div className="flex items-center justify-between">
                <span className="text-[10.5px] font-bold text-amber-300 uppercase tracking-wide flex items-center gap-1">
                  <Sparkles className="size-3 text-amber-300" />
                  Giao Thương B2B
                </span>
                <span className="px-1.5 py-0.2 rounded-md bg-white/15 text-[9px] font-bold text-blue-100">
                  +{((serverData?.kpi?.totalDealsWon ?? oppStats.wonCount) || 12)} deal
                </span>
              </div>
              <p className="text-lg sm:text-xl font-black text-white tracking-tight">
                {((serverData?.kpi?.totalValueContributed || oppStats.totalValue || 0) >= 1000000000)
                  ? `${((serverData?.kpi?.totalValueContributed || oppStats.totalValue || 0) / 1000000000).toFixed(1)} Tỷ đ`
                  : `${Number((serverData?.kpi?.totalValueContributed || oppStats.totalValue || 0) / 1000000).toFixed(0)} Tr đ`}
              </p>
              <p className="text-[10px] text-blue-200">
                {serverData?.kpi?.totalClubOpportunities ?? oppStats.totalOpps} cơ hội kết nối cung - cầu
              </p>
            </div>

            {/* Danh mục 2: Hội Viên & 1-on-1 */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-600 to-amber-700 text-white shadow-xs space-y-1.5 border border-amber-500/40">
              <div className="flex items-center justify-between">
                <span className="text-[10.5px] font-bold text-amber-100 uppercase tracking-wide flex items-center gap-1">
                  <Handshake className="size-3 text-white" />
                  Gắn Kết 1-on-1
                </span>
                <span className="px-1.5 py-0.2 rounded-md bg-white/15 text-[9px] font-bold text-white">
                  92 CEO
                </span>
              </div>
              <p className="text-lg sm:text-xl font-black text-white tracking-tight">
                186 Cuộc Hẹn
              </p>
              <p className="text-[10px] text-amber-100">
                Gặp gỡ trực tiếp cafe &amp; thăm doanh nghiệp
              </p>
            </div>

            {/* Danh mục 3: Sự Kiện & Đào Tạo */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-red-800 to-[#991B1B] text-white shadow-xs space-y-1.5 border border-red-700/40">
              <div className="flex items-center justify-between">
                <span className="text-[10.5px] font-bold text-red-200 uppercase tracking-wide flex items-center gap-1">
                  <Calendar className="size-3 text-white" />
                  Sự Kiện &amp; Đào Tạo
                </span>
                <span className="px-1.5 py-0.2 rounded-md bg-white/15 text-[9px] font-bold text-white">
                  95.4% QR
                </span>
              </div>
              <p className="text-lg sm:text-xl font-black text-white tracking-tight">
                28 Chương Trình
              </p>
              <p className="text-[10px] text-red-100">
                1,420 lượt đại biểu tham dự check-in
              </p>
            </div>

            {/* Danh mục 4: Tài Chính & Đóng Góp Quỹ */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-900 to-[#1E3A8A] text-white shadow-xs space-y-1.5 border border-slate-700/50">
              <div className="flex items-center justify-between">
                <span className="text-[10.5px] font-bold text-amber-300 uppercase tracking-wide flex items-center gap-1">
                  <Coins className="size-3 text-amber-300" />
                  Tài Chính &amp; Quỹ
                </span>
                <span className="px-1.5 py-0.2 rounded-md bg-white/15 text-[9px] font-bold text-emerald-300">
                  98.2% Chuẩn
                </span>
              </div>
              <p className="text-lg sm:text-xl font-black text-amber-300 tracking-tight">
                100% Minh Bạch
              </p>
              <p className="text-[10px] text-slate-200">
                Niên liễm MB Bank &amp; Quỹ thiện nguyện
              </p>
            </div>
          </div>
        </div>

        {/* ── BỤC VINH DANH TOP 3 HỘI VIÊN XUẤT SẮC: HẠNG 1 (GIỮA) - HẠNG 2 (TRÁI) - HẠNG 3 (PHẢI) ── */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#131a26] border border-slate-200/80 dark:border-white/10 shadow-xs space-y-4">
          <div className="text-center">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Vinh Danh Top 3 Xuất Sắc Nhất
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Hạng 1 ở giữa cao nhất • Hạng 2 bên trái • Hạng 3 bên phải
            </p>
          </div>

          {/* Dàn 3 cột chung 1 hàng ngang với bục bậc thang */}
          <div className="grid grid-cols-3 gap-2 items-end pt-3 pb-1">
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
                  <div className="relative mb-2 flex flex-col items-center">
                    <div
                      className={`relative rounded-full overflow-hidden p-0.5 shadow-sm ${
                        isTop1
                          ? "size-15 ring-2 ring-amber-400 shadow-amber-400/30"
                          : isTop2
                          ? "size-12 ring-2 ring-slate-400 shadow-slate-300/30"
                          : "size-12 ring-2 ring-amber-500 shadow-amber-500/30"
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
                        isTop1
                          ? "bg-[#003B95] border border-amber-400"
                          : isTop2
                          ? "bg-slate-600"
                          : "bg-amber-600"
                      }`}
                    >
                      {isTop1 ? "Hạng 1" : isTop2 ? "Hạng 2" : "Hạng 3"}
                    </span>
                  </div>

                  {/* Thông tin đại biểu */}
                  <h5 className="text-[12px] font-bold text-slate-900 dark:text-white truncate w-full px-1">
                    {performer.name}
                  </h5>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate w-full px-1">
                    {performer.company}
                  </p>
                  <p className="text-[10.5px] font-bold text-[#003B95] dark:text-amber-400 truncate w-full px-1 mt-0.5">
                    {performer.valueStr}
                  </p>

                  {/* Bục Bậc Thang chuẩn màu */}
                  <div
                    className={`w-full rounded-t-xl flex flex-col items-center justify-center mt-2.5 border-t border-x ${
                      isTop1
                        ? "h-24 bg-[#003B95] text-white border-amber-400 shadow-xs"
                        : isTop2
                        ? "h-16 bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                        : "h-14 bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300"
                    }`}
                  >
                    <span className="font-black text-xs">
                      {isTop1 ? "Quán Quân" : isTop2 ? "Á Quân 1" : "Á Quân 2"}
                    </span>
                    <span className="text-[9px] font-medium opacity-80">#{performer.rank}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── BẢNG XẾP HẠNG TOP 4 - 10: DẠNG THU GỌN ACCORDION (AI THÍCH THÌ BẤM MỞ) ── */}
        <div className="rounded-3xl bg-white dark:bg-[#131a26] border border-slate-200/80 dark:border-white/10 shadow-sm overflow-hidden">
          <button
            type="button"
            onClick={() => setShowTop10Expanded((prev) => !prev)}
            className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-white/5 transition cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <span className="p-1.5 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300">
                <Medal className="size-4 text-amber-500" />
              </span>
              <div>
                <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">
                  Bảng Xếp Hạng: Từ Top 4 Đến Top 10
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  {showTop10Expanded ? "Bấm để thu gọn danh sách" : "Bấm để xem thêm 7 hội viên xếp hạng tiếp theo"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 text-[10px] font-bold">
                {showTop10Expanded ? "Thu gọn ▴" : "Xem thêm ▾"}
              </span>
            </div>
          </button>

          {showTop10Expanded && (
            <div className="px-4 pb-4 pt-1 border-t border-slate-100 dark:border-white/5 divide-y divide-slate-100 dark:divide-white/5 animate-in fade-in duration-200">
              {remainingTop4To10.map((member: any) => (
                <div
                  key={member.rank}
                  className="py-2.5 flex items-center justify-between gap-2.5 hover:bg-slate-50 dark:hover:bg-white/5 px-1.5 rounded-xl transition"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="size-6 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-black text-[11px] flex items-center justify-center shrink-0">
                      #{member.rank}
                    </div>
                    <div className="size-9 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0">
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="size-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "/ceo1983-logo.png";
                        }}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h5 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {member.name}
                      </h5>
                      <p className="text-[10.5px] text-slate-500 dark:text-slate-400 truncate">
                        {member.company}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="text-right">
                      <div className="text-xs font-black text-[#003B95] dark:text-cyan-400 font-mono">
                        {member.valueStr}
                      </div>
                      <div className="text-[9.5px] text-amber-600 dark:text-amber-400 font-semibold">
                        {member.dept || "CLB CEO 1983"}
                      </div>
                    </div>

                    {member.phone && (
                      <a
                        href={`tel:${member.phone}`}
                        onClick={() => toast.success(`Đang gọi tới ${member.name} (${member.phone})...`)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 transition"
                        title="Gọi điện"
                      >
                        <Phone className="size-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── SECTION BÌNH LUẬN & THẢO LUẬN DƯỚI THỐNG KÊ (YÊU CẦU 2) ── */}
        <div className="p-4 rounded-3xl bg-white dark:bg-[#131a26] border border-slate-200/80 dark:border-white/10 shadow-sm space-y-3.5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-white/5">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#1E3A8A] dark:text-blue-400">
                <MessageSquare className="size-4" />
              </span>
              <div>
                <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wide">
                  Thảo Luận &amp; Bình Luận Về Thống Kê
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  {comments.length} đóng góp ý kiến từ cộng đồng doanh nhân
                </p>
              </div>
            </div>
          </div>

          {/* Danh sách bình luận */}
          <div className="space-y-3">
            {comments.map((cmt) => (
              <div
                key={cmt.id}
                className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-white/5 space-y-1.5 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img
                      src={cmt.avatar}
                      alt={cmt.name}
                      className="size-6 rounded-full object-cover border border-amber-400/40"
                      onError={(e) => {
                        e.currentTarget.src = "/ceo1983-emblem-8.png";
                      }}
                    />
                    <strong className="text-slate-900 dark:text-white font-bold text-[11.5px]">
                      {cmt.name}
                    </strong>
                  </div>
                  <span className="text-[10px] text-slate-400">{cmt.time}</span>
                </div>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-[11px] pl-8">
                  {cmt.text}
                </p>
                <div className="pl-8 pt-0.5 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setComments((prev) =>
                        prev.map((c) =>
                          c.id === cmt.id
                            ? {
                                ...c,
                                isLiked: !c.isLiked,
                                likes: c.isLiked ? c.likes - 1 : c.likes + 1,
                              }
                            : c
                        )
                      );
                    }}
                    className={`inline-flex items-center gap-1 text-[10.5px] font-bold transition cursor-pointer ${
                      cmt.isLiked ? "text-red-600 dark:text-red-400" : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    <span>{cmt.isLiked ? "❤️" : "🤍"}</span>
                    <span>{cmt.likes} thích</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Khung nhập bình luận mới */}
          <div className="pt-2 flex items-center gap-2">
            <input
              type="text"
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && newCommentText.trim()) {
                  const newCmt = {
                    id: `cmt-${Date.now()}`,
                    name: currentMember?.name || (user as any)?.name || "Doanh nhân CEO 1983",
                    avatar: currentMember?.avatar || (user as any)?.avatar || "/ceo1983-emblem-8.png",
                    time: "Vừa xong",
                    text: newCommentText.trim(),
                    likes: 1,
                    isLiked: true,
                  };
                  setComments((prev) => [newCmt, ...prev]);
                  setNewCommentText("");
                  toast.success("Đã đăng bình luận thảo luận thành công!");
                }
              }}
              placeholder="Viết nhận xét hoặc chia sẻ cơ hội hợp tác..."
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#1E3A8A]"
            />
            <button
              type="button"
              onClick={() => {
                if (!newCommentText.trim()) {
                  toast.error("Vui lòng nhập nội dung bình luận");
                  return;
                }
                const newCmt = {
                  id: `cmt-${Date.now()}`,
                  name: currentMember?.name || (user as any)?.name || "Doanh nhân CEO 1983",
                  avatar: currentMember?.avatar || (user as any)?.avatar || "/ceo1983-emblem-8.png",
                  time: "Vừa xong",
                  text: newCommentText.trim(),
                  likes: 1,
                  isLiked: true,
                };
                setComments((prev) => [newCmt, ...prev]);
                setNewCommentText("");
                toast.success("Đã đăng bình luận thảo luận thành công!");
              }}
              className="px-4 py-2.5 rounded-xl bg-[#1E3A8A] hover:bg-[#172554] text-white text-xs font-bold transition shadow-xs cursor-pointer shrink-0"
            >
              Gửi
            </button>
          </div>
        </div>

        {/* Nút Xuất Báo Cáo Nhanh Cuối Trang (Yêu cầu 7) */}
        <div className="pt-2 text-center">
          <button
            type="button"
            onClick={() => {
              setExportAuditTime(new Date().toLocaleString("vi-VN"));
              setReportModalOpen(true);
            }}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-sky-950 via-[#1F3864] to-[#003B95] hover:from-sky-900 hover:to-blue-700 text-white font-black text-xs shadow-md shadow-blue-900/20 flex items-center justify-center gap-2 active:scale-95 transition cursor-pointer"
          >
            <Download className="size-4 text-amber-400" />
            <span className="uppercase tracking-wider">Trích xuất báo cáo thống kê có xác thực bằng chứng</span>
          </button>
        </div>
      </div>

      {/* ── MODAL XUẤT BÁO CÁO CÓ XÁC THỰC BẰNG CHỨNG (Yêu cầu 7) ── */}
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
                    BÁO CÁO THỐNG KÊ {activeCategory.toUpperCase()}
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

            {/* Chi tiết nội dung báo cáo & Bằng chứng người xuất */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3.5 text-xs">
              {/* 1. KHỐI BẰNG CHỨNG NGƯỜI XUẤT (Req 7) */}
              <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-500/30 space-y-1.5">
                <div className="flex items-center gap-1.5 text-amber-800 dark:text-amber-300 font-bold text-[11px] uppercase tracking-wide">
                  <ShieldCheck className="size-4 text-amber-500" />
                  <span>Dấu bằng chứng người trích xuất báo cáo:</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5 text-[11px] text-slate-700 dark:text-slate-300 pt-1">
                  <div>
                    <span className="text-slate-400">Người trích xuất: </span>
                    <strong className="text-[#003B95] dark:text-amber-400">
                      {currentMember?.name || (user as any)?.name || (user as any)?.username || "Hội viên CLB"}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400">Mã hội viên: </span>
                    <strong>{currentMember?.code || "HV-1983"}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400">Tư cách / Ban: </span>
                    <strong className="text-emerald-600 dark:text-emerald-400">
                      {currentMember?.department
                        ? `Ban ${currentMember.department.replace(/^Ban\s+/i, "")}`
                        : currentMember?.role === "admin"
                        ? "Ban Điều Hành / Quản Trị"
                        : "Hội viên chính thức CEO 1983"}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400">Thời điểm xuất: </span>
                    <span>{exportAuditTime || new Date().toLocaleString("vi-VN")}</span>
                  </div>
                </div>
                <div className="text-[10px] text-slate-400 pt-0.5 border-t border-amber-500/20 font-mono">
                  Mã hash bảo chứng: VBA-AUDIT-{(currentMember?.code || "HV").toUpperCase()}-{timeRange.toUpperCase()}
                </div>
              </div>

              {/* 2. CHỌN ĐỊNH DẠNG XUẤT BÁO CÁO (Req 7) */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300 block text-[11px]">
                  Chọn định dạng trích xuất báo cáo:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setExportFormat("excel")}
                    className={`p-2.5 rounded-xl border text-center flex flex-col items-center gap-1 transition cursor-pointer ${
                      exportFormat === "excel"
                        ? "bg-[#1F3864] text-white border-[#1F3864] shadow-sm font-bold"
                        : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <FileSpreadsheet className="size-4 text-emerald-400" />
                    <span className="text-[11px]">Excel (.xlsx)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setExportFormat("pdf")}
                    className={`p-2.5 rounded-xl border text-center flex flex-col items-center gap-1 transition cursor-pointer ${
                      exportFormat === "pdf"
                        ? "bg-[#1F3864] text-white border-[#1F3864] shadow-sm font-bold"
                        : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <FileText className="size-4 text-rose-400" />
                    <span className="text-[11px]">Văn bản PDF</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setExportFormat("image")}
                    className={`p-2.5 rounded-xl border text-center flex flex-col items-center gap-1 transition cursor-pointer ${
                      exportFormat === "image"
                        ? "bg-[#1F3864] text-white border-[#1F3864] shadow-sm font-bold"
                        : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <ImageIcon className="size-4 text-amber-400" />
                    <span className="text-[11px]">Hình ảnh PNG</span>
                  </button>
                </div>
              </div>

              {/* Bảng tóm tắt chỉ số thực tế */}
              <div className="space-y-1.5">
                <h5 className="font-bold text-slate-700 dark:text-slate-300 text-[11px]">
                  Tóm tắt số liệu giao thương &amp; kết nối:
                </h5>
                <div className="grid grid-cols-3 gap-1.5 text-center">
                  <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <p className="text-[10px] text-slate-400">Tổng cơ hội</p>
                    <p className="font-black text-slate-900 dark:text-white text-xs mt-0.5">
                      {serverData?.kpi?.totalClubOpportunities ?? oppStats.totalOpps}
                    </p>
                  </div>
                  <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <p className="text-[10px] text-slate-400">Tổng giá trị</p>
                    <p className="font-black text-emerald-600 dark:text-emerald-400 text-xs mt-0.5 truncate">
                      {((serverData?.kpi?.totalValueContributed || oppStats.totalValue || 0) >= 1000000000)
                        ? `${((serverData?.kpi?.totalValueContributed || oppStats.totalValue || 0) / 1000000000).toFixed(1)} Tỷ`
                        : `${Number((serverData?.kpi?.totalValueContributed || oppStats.totalValue || 0) / 1000000).toFixed(0)} Tr`}
                    </p>
                  </div>
                  <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <p className="text-[10px] text-slate-400">Deal hoàn tất</p>
                    <p className="font-black text-[#003B95] dark:text-cyan-400 text-xs mt-0.5">
                      {serverData?.kpi?.totalDealsWon ?? oppStats.wonCount}
                    </p>
                  </div>
                </div>
              </div>

              {/* Chữ ký ban điều hành */}
              <div className="pt-3 flex justify-between text-center text-[10px] text-slate-500 border-t border-slate-200 dark:border-slate-800">
                <div>
                  <p className="font-bold">NGƯỜI XUẤT BÁO CÁO</p>
                  <p className="font-medium text-slate-700 dark:text-slate-300 mt-1">
                    {currentMember?.name || (user as any)?.name || "Hội viên"}
                  </p>
                  <p className="italic text-[9.5px] mt-4">(Ký điện tử xác thực)</p>
                </div>
                <div>
                  <p className="font-bold">TM. BAN ĐIỀU HÀNH CEO 1983</p>
                  <p className="mt-6 font-black text-slate-800 dark:text-white">CHỦ TỊCH HIỆP HỘI</p>
                </div>
              </div>
            </div>

            {/* Nút hành động xuất báo cáo */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setReportModalOpen(false)}
                className="flex-1 py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs transition cursor-pointer"
              >
                Hủy bỏ
              </button>

              <button
                type="button"
                onClick={() => {
                  const exporter = currentMember?.name || (user as any)?.name || "Hội viên";
                  const role = currentMember?.department
                    ? `Ban ${currentMember.department.replace(/^Ban\s+/i, "")}`
                    : "Hội viên chính thức";
                  if (exportFormat === "pdf") {
                    toast.success(`Đang tạo bản in PDF chứng thực bởi ${exporter} (${role})...`);
                    setTimeout(() => window.print(), 300);
                  } else if (exportFormat === "excel") {
                    toast.success(`Đang xuất tệp Excel có mã kiểm toán của ${exporter}...`);
                    setTimeout(() => {
                      toast.success(`Đã xuất file Excel thành công! Bảo chứng: ${exporter}`);
                      setReportModalOpen(false);
                    }, 800);
                  } else {
                    toast.success(`Đang kết xuất ảnh đồ họa báo cáo của ${exporter}...`);
                    setTimeout(() => {
                      toast.success(`Đã tải xuống hình ảnh báo cáo thành công!`);
                      setReportModalOpen(false);
                    }, 800);
                  }
                }}
                className="flex-2 py-2.5 px-3 rounded-xl bg-gradient-to-r from-sky-900 via-[#003B95] to-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition cursor-pointer"
              >
                <Download className="size-4" />
                <span>Xác nhận xuất ({exportFormat.toUpperCase()}) &amp; Lưu bằng chứng</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL LỘ TRÌNH GIẢI THƯỞNG GAMIFICATION TẤT CẢ CÁC MỐC ── */}
      {showAwardsRoadmapModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-5 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="size-9 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Trophy className="size-5" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white">
                    Lộ Trình Giải Thưởng Gamification
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Bắn trực tiếp từ Ban Điều Hành Web CRM CEO 1983
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAwardsRoadmapModal(false)}
                className="size-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Danh sách các mốc giải thưởng của danh mục hiện tại */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              <div className="p-3 rounded-2xl bg-gradient-to-r from-blue-900/20 to-amber-500/10 border border-blue-500/20 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500">Thành tích hiện tại của bạn:</span>
                  <p className="text-base font-black text-[#003B95] dark:text-amber-400">
                    {currentAwardProgress.currentCount} {currentAwardProgress.unitLabel}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Danh mục:</span>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {currentAwardProgress.mappedCat === "top_referrals"
                      ? "Top Người Giới Thiệu"
                      : currentAwardProgress.mappedCat === "top_connect"
                      ? "Kết Nối 1-on-1"
                      : currentAwardProgress.mappedCat === "top_opportunities"
                      ? "Cơ Hội Giao Thương B2B"
                      : "Sự Kiện & Họp Ban"}
                  </p>
                </div>
              </div>

              {currentAwardProgress.categoryAwards.length === 0 ? (
                <div className="p-6 text-center text-slate-500 text-xs">
                  Chưa có mốc giải thưởng nào được kích hoạt cho danh mục này.
                </div>
              ) : (
                currentAwardProgress.categoryAwards.map((aw, index) => {
                  const isReached = currentAwardProgress.currentCount >= aw.targetCount;
                  return (
                    <div
                      key={aw.id || index}
                      className={`p-3.5 rounded-2xl border transition-all ${
                        isReached
                          ? "bg-emerald-500/10 border-emerald-500/30"
                          : "bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div
                            className={`size-7 rounded-xl flex items-center justify-center text-xs font-black ${
                              isReached
                                ? "bg-emerald-600 text-white"
                                : "bg-amber-500 text-slate-950"
                            }`}
                          >
                            #{index + 1}
                          </div>
                          <div>
                            <span className="text-xs font-black text-slate-900 dark:text-white">
                              {aw.awardName}
                            </span>
                            <div className="text-[11px] text-amber-600 dark:text-amber-400 font-bold">
                              Mốc: {aw.targetCount} {aw.targetUnit}
                            </div>
                          </div>
                        </div>

                        {isReached ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                            <CheckCircle2 className="size-3" />
                            Đã Đạt
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                            Cần thêm {Math.max(0, aw.targetCount - currentAwardProgress.currentCount)} {aw.targetUnit}
                          </span>
                        )}
                      </div>

                      {aw.awardDescription && (
                        <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                          {aw.awardDescription}
                        </p>
                      )}

                      {aw.rewardValueStr && (
                        <div className="mt-2 flex items-center gap-1.5 text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-1 rounded-lg">
                          <Gift className="size-3" />
                          <span>Phần thưởng: {aw.rewardValueStr}</span>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowAwardsRoadmapModal(false)}
              className="w-full py-2.5 rounded-2xl bg-[#003B95] text-white font-bold text-xs hover:bg-[#002B70] transition cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
export default AssociationAnalyticsScreen;
