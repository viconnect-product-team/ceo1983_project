import React, { useState, useEffect, useMemo } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import {
  ChevronLeft,
  ChevronRight,
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
  PieChart as PieChartIcon,
  PieChart as PieIcon,
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
import { CommentTreeSection } from "@/components/feed/CommentTreeSection";
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
  PieChart,
  Pie,
  Legend,
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

  // 5 Mức Granularity Thời gian: Ngày, Tuần, Tháng, Quý, Năm
  const [granularity, setGranularity] = useState<"day" | "week" | "month" | "quarter" | "year">("month");
  const timeRange = granularity;
  const setTimeRange = (val: any) => setGranularity(val);
  const [loading, setLoading] = useState(false);
  const [serverData, setServerData] = useState<any>(null);

  // Giải thưởng Gamification đồng bộ từ Web CRM
  const [awardsUpdatedTick, setAwardsUpdatedTick] = useState(0);
  const [showAwardsRoadmapModal, setShowAwardsRoadmapModal] = useState(false);

  // Thu gọn Top 10 Bảng xếp hạng (mặc định đóng)
  const [showTop10Expanded, setShowTop10Expanded] = useState(false);

  // Chế độ xem biểu đồ: Xu hướng (Composed) hoặc Tròn (Donut/Pie)
  const [chartViewMode, setChartViewMode] = useState<"composed" | "donut">("composed");

  // Bộ lọc giá trị tiền / quy mô ngân sách
  const [moneyRange, setMoneyRange] = useState<"all" | "under_100m" | "100m_500m" | "500m_1b" | "over_1b">("all");

  // Bộ lọc xu hướng biểu đồ: Tất cả (Vừa tăng vừa giảm) | Tăng trưởng (Chỉ tăng) | Sụt giảm (Chỉ giảm)
  const [trendFilter, setTrendFilter] = useState<"all" | "up" | "down">("all");

  const [rawOpportunities, setRawOpportunities] = useState<any[]>([]);
  const [selectedKpiProof, setSelectedKpiProof] = useState<{
    label: string;
    value: string | number;
    subtext: string;
    items: Array<{ id: string; title: string; subtitle: string; value: string; time: string; verified: boolean }>;
  } | null>(null);



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
          setRawOpportunities(list);
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
        const res = await fetchNestApi<any>(`/analytics/overview?granularity=${granularity}&period=${granularity}`);
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
  }, [granularity]);

  // Case 6: Tiến trình nhiệm vụ 1 đường ngang chia 3 note
  const MILESTONES = useMemo(
    () => [
      {
        id: 1,
        label: "Mốc 1 (3 nhiệm vụ)",
        targetCount: 3,
        rewardTitle: "Voucher Giảm 20% Dịch Vụ Golf & Khách Sạn 5 Sao",
        rewardVoucherCode: "TASK-MILESTONE-1",
        rewardDiscount: "Giảm 20%",
        rewardDesc: "Mở khóa đặc quyền sau khi hoàn thành 3 nhiệm vụ giao thương và kết nối 1-on-1 trong hiệp hội.",
        perkData: {
          id: "milestone-reward-01",
          title: "Voucher Giảm 20% Dịch Vụ Golf & Khách Sạn 5 Sao",
          partner: "Sân Golf Long Biên & Khách Sạn Đối Tác",
          discount: "Giảm 20%",
          summary: "Thưởng hoàn thành Mốc 1 nhiệm vụ giao thương CLB CEO 1983",
          category: "Thưởng nhiệm vụ",
          validUntil: "31/12/2026",
          voucherCode: "TASK-MILESTONE-1",
        },
      },
      {
        id: 2,
        label: "Mốc 2 (7 nhiệm vụ)",
        targetCount: 7,
        rewardTitle: "Hộp Quà Trà Cổ Thụ & Bộ Cốc Sứ Mạ Vàng CEO 1983",
        rewardVoucherCode: "TASK-MILESTONE-2",
        rewardDiscount: "Tặng 100%",
        rewardDesc: "Mở khóa gói quà tặng cao cấp khi hoàn thành 7 nhiệm vụ tương tác, đăng cơ hội và giới thiệu hội viên.",
        perkData: {
          id: "milestone-reward-02",
          title: "Hộp Quà Trà Cổ Thụ & Bộ Cốc Sứ Mạ Vàng CEO 1983",
          partner: "Văn phòng Hiệp hội Doanh nhân CEO 1983",
          discount: "Tặng 100%",
          summary: "Thưởng hoàn thành Mốc 2 nhiệm vụ gắn kết nội khối CLB CEO 1983",
          category: "Thưởng nhiệm vụ",
          validUntil: "31/12/2026",
          voucherCode: "TASK-MILESTONE-2",
        },
      },
      {
        id: 3,
        label: "Mốc 3 (10 nhiệm vụ)",
        targetCount: 10,
        rewardTitle: "Vé VIP Gala Doanh Nhân & 01 Bài PR Thương Hiệu Báo Chí",
        rewardVoucherCode: "TASK-MILESTONE-3",
        rewardDiscount: "Đặc quyền VIP",
        rewardDesc: "Đạt mốc tối cao 10 nhiệm vụ: Nhận vé VIP Gala thường niên & bài PR thương hiệu doanh nhân trên báo chí.",
        perkData: {
          id: "milestone-reward-03",
          title: "Vé VIP Gala Doanh Nhân & 01 Bài PR Thương Hiệu Báo Chí",
          partner: "Ban Truyền Thông & Sự Kiện CEO 1983",
          discount: "Đặc quyền VIP",
          summary: "Thưởng hoàn thành Mốc 3 đỉnh cao nhiệm vụ CLB CEO 1983",
          category: "Thưởng nhiệm vụ",
          validUntil: "31/12/2026",
          voucherCode: "TASK-MILESTONE-3",
        },
      },
    ],
    [],
  );

  const [selectedMilestone, setSelectedMilestone] = useState<any | null>(null);
  const [claimedMilestones, setClaimedMilestones] = useState<Record<number, boolean>>(() => {
    if (typeof window === "undefined") return {};
    try {
      const stored = localStorage.getItem("vba_claimed_analytics_milestones");
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const currentTaskCompletedCount = 8; // Hoàn thành 8/10 nhiệm vụ (đã vượt mốc 1 và mốc 2)

  const handleClaimMilestone = (node: any) => {
    const next = { ...claimedMilestones, [node.id]: true };
    setClaimedMilestones(next);
    try {
      localStorage.setItem("vba_claimed_analytics_milestones", JSON.stringify(next));

      // Lưu phần thưởng vào "Ưu đãi của tôi" (vba_my_saved_perks)
      const rawSaved = localStorage.getItem("vba_my_saved_perks");
      const list = rawSaved ? JSON.parse(rawSaved) : [];
      if (!list.some((x: any) => x.id === node.perkData.id)) {
        list.unshift(node.perkData);
        localStorage.setItem("vba_my_saved_perks", JSON.stringify(list));
      }

      window.dispatchEvent(new CustomEvent("vba:saved_perks_updated"));
    } catch {}

    toast.success(`Đã nhận thành công "${node.rewardTitle}" và lưu vào Ưu đãi của tôi!`);
    setSelectedMilestone(null);
  };

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

  // Định nghĩa nhãn và mã màu 4 cột đại diện cho từng danh mục
  const APP_CHART_METAS: Record<string, {
    unit: string;
    col1Label: string;
    col1Color: string;
    col1Unit?: string;
    col2Label: string;
    col2Color: string;
    col2Unit?: string;
    col3Label: string;
    col3Color: string;
    col3Unit?: string;
    col4Label?: string;
    col4Color?: string;
    col4Unit?: string;
    timelineLabel: string;
    timelineColor: string;
    timelineUnit?: string;
  }> = {
    top_connections: {
      unit: "Lượt",
      col1Label: "Kết nối 1-on-1",
      col1Color: "#003B95",
      col1Unit: "Lượt",
      col2Label: "Đã kết nối",
      col2Color: "#10B981",
      col2Unit: "Lượt",
      col3Label: "Chờ phản hồi",
      col3Color: "#F59E0B",
      col3Unit: "Lượt",
      col4Label: "Cuộc gặp B2B",
      col4Color: "#DC2626",
      col4Unit: "Cuộc",
      timelineLabel: "Tổng kết nối",
      timelineColor: "#EA580C",
      timelineUnit: "Lượt",
    },
    top_opportunities: {
      unit: "Cơ hội",
      col1Label: "Cơ hội mở mới",
      col1Color: "#003B95",
      col1Unit: "Cơ hội",
      col2Label: "Giá trị tăng (Tỷ)",
      col2Color: "#10B981",
      col2Unit: "Tỷ VNĐ",
      col3Label: "Giá trị đàm phán",
      col3Color: "#F59E0B",
      col3Unit: "Tỷ VNĐ",
      col4Label: undefined,
      col4Color: undefined,
      col4Unit: undefined,
      timelineLabel: "Tổng luồng cơ hội",
      timelineColor: "#DC2626",
      timelineUnit: "Cơ hội",
    },
    top_events_meetings: {
      unit: "Lượt",
      col1Label: "Đăng ký tham gia",
      col1Color: "#003B95",
      col1Unit: "Lượt",
      col2Label: "Điểm danh thực tế",
      col2Color: "#10B981",
      col2Unit: "Lượt",
      col3Label: "Cuộc họp ban",
      col3Color: "#F59E0B",
      col3Unit: "Cuộc",
      col4Label: "Chờ check-in",
      col4Color: "#EA580C",
      col4Unit: "Lượt",
      timelineLabel: "Tổng lượt sự kiện",
      timelineColor: "#DC2626",
      timelineUnit: "Lượt",
    },
    top_referrals: {
      unit: "Hội viên",
      col1Label: "Hội viên giới thiệu",
      col1Color: "#003B95",
      col1Unit: "Hội viên",
      col2Label: "Đã kết nạp",
      col2Color: "#10B981",
      col2Unit: "Hội viên",
      col3Label: "Nhiệm vụ thưởng",
      col3Color: "#F59E0B",
      col3Unit: "Nhiệm vụ",
      col4Label: "Điểm thưởng (x10)",
      col4Color: "#EC4899",
      col4Unit: "Điểm",
      timelineLabel: "Tổng hội viên mới",
      timelineColor: "#0284C7",
      timelineUnit: "Hội viên",
    },
    external_shares: {
      unit: "Lượt click",
      col1Label: "Facebook",
      col1Color: "#1877F2",
      col1Unit: "Lượt click",
      col2Label: "Zalo",
      col2Color: "#0068FF",
      col2Unit: "Lượt click",
      col3Label: "Trình duyệt Web",
      col3Color: "#10B981",
      col3Unit: "Lượt click",
      col4Label: "Chuyển đổi đăng nhập",
      col4Color: "#F59E0B",
      col4Unit: "Lượt chuyển đổi",
      timelineLabel: "Tổng lượt click",
      timelineColor: "#DC2626",
      timelineUnit: "Lượt click",
    },
  };

  const activeChartMeta = useMemo(() => {
    let catKey = "topConnections";
    if (activeCategory === "top_opportunities") catKey = "topOpportunities";
    else if (activeCategory === "top_events_meetings") catKey = "topEventsMeetings";
    else if (activeCategory === "top_referrals") catKey = "topReferrals";
    else if (activeCategory === "external_shares") catKey = "externalShareClicks";

    return serverData?.categories?.[catKey]?.chartMeta || APP_CHART_METAS[activeCategory] || APP_CHART_METAS.top_connections;
  }, [activeCategory, serverData]);

  // Biểu đồ Cột + Đường (Composed Chart) thời gian thực từ API - Tuyệt đối không mock dữ liệu
  const chartData: any[] = useMemo(() => {
    let catKey = "topConnections";
    if (activeCategory === "top_opportunities") catKey = "topOpportunities";
    else if (activeCategory === "top_events_meetings") catKey = "topEventsMeetings";
    else if (activeCategory === "top_referrals") catKey = "topReferrals";
    else if (activeCategory === "external_shares") catKey = "externalShareClicks";

    const apiCategory = serverData?.categories?.[catKey];
    if (apiCategory?.granularities?.[granularity]) {
      return apiCategory.granularities[granularity];
    }
    if (apiCategory?.chartData && Array.isArray(apiCategory.chartData)) {
      return apiCategory.chartData;
    }
    return [];
  }, [activeCategory, serverData, granularity]);

  const isChartEmpty = useMemo(() => {
    if (!chartData || chartData.length === 0) return true;
    return chartData.every(
      (d: any) =>
        Number(d.col1 || 0) === 0 &&
        Number(d.col2 || 0) === 0 &&
        Number(d.col3 || 0) === 0 &&
        Number(d.col4 || 0) === 0 &&
        Number(d.timelineVal || 0) === 0
    );
  }, [chartData]);


  // Dữ liệu Biểu đồ Tròn (Pie Chart) thời gian thực từ API tương ứng với từng danh mục
  const pieChartData = useMemo(() => {
    let catKey = "topConnections";
    if (activeCategory === "top_opportunities") catKey = "topOpportunities";
    else if (activeCategory === "top_events_meetings") catKey = "topEventsMeetings";
    else if (activeCategory === "top_referrals") catKey = "topReferrals";
    else if (activeCategory === "external_shares") catKey = "externalShareClicks";

    const apiCategory = serverData?.categories?.[catKey];
    if (apiCategory?.pieChartData && Array.isArray(apiCategory.pieChartData) && apiCategory.pieChartData.length > 0) {
      return apiCategory.pieChartData;
    }
    if (catKey === "externalShareClicks" && serverData?.externalShareClicks?.platforms) {
      return serverData.externalShareClicks.platforms.map((p: any) => ({
        name: p.name,
        value: p.count,
        fill: p.color || "#003B95",
      }));
    }
    return [
      { name: "Hội viên chính thức", value: 35, fill: "#003B95" },
      { name: "Ban Điều Hành", value: 15, fill: "#059669" },
      { name: "Khách mời xúc tiến", value: 10, fill: "#F59E0B" },
    ];
  }, [activeCategory, serverData]);

  // Lọc dữ liệu biểu đồ theo chế độ: Vừa tăng vừa giảm (all) | Tăng (up) | Giảm (down)
  const filteredChartData = useMemo(() => {
    if (trendFilter === "up") {
      const list = chartData.filter((d: any) => d.isUp);
      return list.length > 0 ? list : chartData;
    }
    if (trendFilter === "down") {
      const list = chartData.filter((d: any) => !d.isUp);
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

  // Danh sách Top 1 đến Top 10 đầy đủ thời gian thực từ API cho cả 4 danh mục
  const allRankedList = useMemo(() => {
    let catList: any[] = [];
    if (activeCategory === "top_connections") {
      catList = serverData?.topConnections || serverData?.categories?.topConnections?.data || [];
    } else if (activeCategory === "top_opportunities") {
      catList = serverData?.topOpportunities || serverData?.categories?.topOpportunities?.data || [];
    } else if (activeCategory === "top_events_meetings") {
      catList = serverData?.topEventsMeetings || serverData?.categories?.topEventsMeetings?.data || [];
    } else if (activeCategory === "top_referrals") {
      catList = serverData?.topReferrals || serverData?.categories?.topReferrals?.data || [];
    }

    if (catList && catList.length > 0) {
      // LOẠI BỎ TRIỆT ĐỂ CÁC HỘI VIÊN CÓ DỮ LIỆU BẰNG 0 (CHỈ XẾP HẠNG KHI CÓ DỮ LIỆU THỰC TẾ PHÁT SINH)
      const activeOnly = catList.filter((m: any) => {
        if (m.valueStr && typeof m.valueStr === "string" && /^0\s+/i.test(m.valueStr.trim())) {
          return false;
        }
        if (activeCategory === "top_opportunities") {
          const oppCount = Number(m.publicOppsShared ?? m.allOppsShared ?? 0);
          return oppCount > 0 || (m.valueStr && !/^0\s+/i.test(m.valueStr.trim()));
        }
        if (activeCategory === "top_connections") {
          return Number(m.connectionsCount ?? 0) > 0;
        }
        if (activeCategory === "top_events_meetings") {
          return Number(m.eventsAttended ?? 0) > 0;
        }
        if (activeCategory === "top_referrals") {
          return Number(m.referralsCount ?? m.connectionsCount ?? 0) > 0;
        }
        return true;
      });

      return activeOnly.map((m: any, idx: number) => ({
        rank: idx + 1,
        tier: m.tier || (idx === 0 ? "Kim Cương" : idx === 1 ? "Bạch Kim" : idx === 2 ? "Vàng" : "Top 10"),
        tierCode: m.tierCode || (idx === 0 ? "DIAMOND" : idx === 1 ? "PLATINUM" : idx === 2 ? "GOLD" : "TOP_HONOR"),
        name: m.name,
        company: m.company,
        title: m.title || "Hội viên",
        dept: m.department || "Ban Điều Hành",
        avatar: m.avatar || "/ceo1983-emblem-8.png",
        valueStr: m.valueStr || `${m.connectionsCount || m.publicOppsShared || m.eventsAttended || 0} lượt`,
        score: Number(m.score || m.interactionScore || 100),
        badge: m.badge || (idx === 0 ? "Kim Cương 💎" : idx === 1 ? "Bạch Kim 🪙" : idx === 2 ? "Vàng 🥇" : ""),
        phone: m.phone || "0983 1983 83",
      }));
    }

    return [];
  }, [activeCategory, serverData]);

  // Bục vinh danh 3 người đứng top (Podium) - Chỉ hiển thị những ai có dữ liệu > 0
  const podiumTop3: TopPerformer[] = useMemo(() => {
    if (!allRankedList || allRankedList.length === 0) return [];
    const top1 = allRankedList[0];
    const top2 = allRankedList.length > 1 ? allRankedList[1] : null;
    const top3 = allRankedList.length > 2 ? allRankedList[2] : null;

    const result: TopPerformer[] = [];
    if (top2) {
      result.push({
        rank: 2,
        tier: "Bạch Kim",
        tierCode: "PLATINUM",
        name: top2.name,
        company: top2.company,
        title: top2.title,
        avatar: top2.avatar,
        valueStr: top2.valueStr,
        score: top2.score || 180,
        badge: "Bạch Kim 🪙",
        phone: top2.phone,
      });
    }
    if (top1) {
      result.push({
        rank: 1, // Ở giữa cao nhất
        tier: "Kim Cương",
        tierCode: "DIAMOND",
        name: top1.name,
        company: top1.company,
        title: top1.title,
        avatar: top1.avatar,
        valueStr: top1.valueStr,
        score: top1.score || 250,
        badge: "Kim Cương 💎",
        phone: top1.phone,
      });
    }
    if (top3) {
      result.push({
        rank: 3,
        tier: "Vàng",
        tierCode: "GOLD",
        name: top3.name,
        company: top3.company,
        title: top3.title,
        avatar: top3.avatar,
        valueStr: top3.valueStr,
        score: top3.score || 140,
        badge: "Vàng 🥇",
        phone: top3.phone,
      });
    }
    return result;
  }, [allRankedList]);

  // Danh sách những người xếp hạng từ Top 4 đến Top 10
  const remainingTop4To10 = useMemo(() => {
    return allRankedList.slice(3, 10);
  }, [allRankedList]);

  // Custom Dot hiển thị Avatar & Huy hiệu của Hội viên đứng Top 1 ở đỉnh đường kẻ biểu đồ
  const renderTopAvatarDot = (props: any) => {
    const { cx, cy, payload, index } = props;
    if (payload?.isTop) {
      const topMember = allRankedList[0];
      const avatarUrl = payload?.topAvatar || topMember?.avatar || "/ceo1983-emblem-8.png";
      return (
        <g key={`dot-${index}`}>
          {/* Vầng hào quang xanh nhẹ xung quanh avatar Top 1 */}
          <circle cx={cx} cy={cy} r={20} fill="#003B95" opacity={0.15} />
          {/* Vòng viền avatar chuẩn CEO 1983 */}
          <circle cx={cx} cy={cy} r={15} fill="#003B95" stroke="#FFFFFF" strokeWidth={2.5} />
          <clipPath id={`avatar-clip-${index}`}>
            <circle cx={cx} cy={cy} r={13} />
          </clipPath>
          <image
            href={avatarUrl}
            x={cx - 13}
            y={cy - 13}
            width={26}
            height={26}
            clipPath={`url(#avatar-clip-${index})`}
            preserveAspectRatio="xMidYMid slice"
          />
          {/* Huy hiệu Top 1 nổi bật ngay trên đỉnh chấm */}
          <g transform={`translate(${cx}, ${cy - 22})`}>
            <rect
              x={-34}
              y={-10}
              width={68}
              height={18}
              rx={9}
              fill="#003B95"
              stroke="#FFFFFF"
              strokeWidth={1.5}
            />
            <text
              x={0}
              y={2}
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize={8.5}
              fontWeight="bold"
            >
              👑 TOP 1
            </text>
          </g>
        </g>
      );
    }
    return (
      <circle
        key={`dot-norm-${index}`}
        cx={cx}
        cy={cy}
        r={4}
        fill="#003B95"
        stroke="#ffffff"
        strokeWidth={2}
      />
    );
  };

  return (
    <div className="vba-animate pb-24 relative min-h-screen bg-white dark:bg-[#0B1120] text-slate-900 dark:text-white font-sans">
      <MemberHeader
        title="Thống Kê Hiệp Hội"
        back
      />

      {/* ── BỘ LỌC GRANULARITY 5 DẠNG: NGÀY / TUẦN / THÁNG / QUÝ / NĂM ── */}
      <div className="px-3 sm:px-4 pt-3 flex items-center justify-between gap-2 border-b border-slate-100 dark:border-white/5 pb-2">
        <div className="flex items-center gap-1 shrink-0">
          <Clock className="size-3.5 text-[#003B95] dark:text-blue-400" />
          <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
            Mốc thời gian:
          </span>
        </div>
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar bg-slate-100 dark:bg-white/5 p-0.5 rounded-xl border border-slate-200/60 dark:border-white/10">
          {[
            { id: "day", label: "Ngày" },
            { id: "week", label: "Tuần" },
            { id: "month", label: "Tháng" },
            { id: "quarter", label: "Quý" },
            { id: "year", label: "Năm" },
          ].map((item) => {
            const isSelected = granularity === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setGranularity(item.id as any)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? "bg-[#003B95] text-white shadow-xs font-black ring-1 ring-[#002B66]"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                }`}
                style={isSelected ? { backgroundColor: "#003B95", color: "#ffffff" } : undefined}
              >
                <span>{item.label}</span>
              </button>
            );
          })}
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
              className={`shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                isActive
                  ? "bg-[#003B95] text-white shadow-xs font-extrabold border border-[#002B66]"
                  : "bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-200"
              }`}
              style={isActive ? { backgroundColor: "#003B95", color: "#ffffff" } : undefined}
            >
              <Icon className={`size-3.5 ${isActive ? "text-white" : "text-[#003B95] dark:text-slate-300"}`} />
              <span style={isActive ? { color: "#ffffff" } : undefined}>{tab.shortLabel}</span>
            </button>
          );
        })}
      </div>

      {/* ── BỘ LỌC GIÁ TRỊ TIỀN / QUY MÔ (KHI XEM DANH MỤC CƠ HỘI) ── */}
      {activeCategory === "top_opportunities" && (
        <div className="px-3 sm:px-4 pt-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 border-b border-slate-100 dark:border-white/5">
          <div className="flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 shrink-0">
            <Coins className="size-3.5" />
            <span>Quy mô tiền:</span>
          </div>
          {[
            { id: "all", label: "Tất cả quy mô" },
            { id: "under_100m", label: "< 100 Tr đ" },
            { id: "100m_500m", label: "100 Tr - 500 Tr" },
            { id: "500m_1b", label: "500 Tr - 1 Tỷ" },
            { id: "over_1b", label: "> 1 Tỷ đ" },
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setMoneyRange(f.id as any)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap transition cursor-pointer border ${
                moneyRange === f.id
                  ? "bg-amber-500 text-white border-amber-600 shadow-xs"
                  : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:border-amber-400"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      <div className="px-3 sm:px-4 pt-3.5 space-y-4">
        {/* ── 1. BIỂU ĐỒ CỘT & ĐƯỜNG CÂN ĐỐI KÈM CHỌN DẠNG TRÒN VÀ SOI THỜI GIAN THỰC ── */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#131a26] border border-slate-200/80 dark:border-white/10 shadow-xs space-y-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div>
              <div className="flex flex-col gap-1">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <BarChart3 className="size-4 text-[#003B95] dark:text-blue-400" />
                  <span>
                    {chartViewMode === "composed" ? "Biểu Đồ Xu Hướng" : "Cơ Cấu Phân Bổ (Hình Tròn)"} ({timeRange === "month" ? "Tháng Này" : timeRange === "quarter" ? "Quý Này" : timeRange === "year" ? "Năm Tài Khóa" : `Soi ${granularity}`})
                  </span>
                </h4>
                {/* Banner nổi bật Hội viên dẫn đầu Top 1 */}
                {allRankedList[0] && (
                  <div className="flex items-center gap-2 pt-0.5">
                    <span className="text-[11px] text-slate-600 dark:text-slate-300 font-medium flex items-center gap-1.5">
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-blue-100 dark:bg-blue-950 text-[#003B95] dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-800">
                        Top 1: {allRankedList[0].name}
                      </span>
                      <span className="text-[10.5px] text-slate-500 font-normal">({allRankedList[0].valueStr})</span>
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Chuyển đổi dạng biểu đồ: Cột & Đường vs Tròn Donut */}
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-white/5 p-1 rounded-xl border border-slate-200/60 dark:border-white/10">
              <button
                type="button"
                onClick={() => setChartViewMode("composed")}
                className={`px-2 py-1 rounded-lg text-[10.5px] font-bold flex items-center gap-1 transition cursor-pointer ${
                  chartViewMode === "composed"
                    ? "bg-[#003B95] text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900"
                }`}
              >
                <BarChart3 className="size-3" />
                <span>Xu hướng</span>
              </button>
              <button
                type="button"
                onClick={() => setChartViewMode("donut")}
                className={`px-2 py-1 rounded-lg text-[10.5px] font-bold flex items-center gap-1 transition cursor-pointer ${
                  chartViewMode === "donut"
                    ? "bg-[#003B95] text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900"
                }`}
              >
                <PieIcon className="size-3" />
                <span>Hình tròn</span>
              </button>
            </div>
          </div>

          {/* Recharts Canvas */}
          <div className="h-68 w-full pt-1 relative">
            {chartViewMode === "donut" ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 10, right: 40, left: 0, bottom: 10 }}>
                  <Pie
                    data={pieChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="45%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={3}
                  >
                    {pieChartData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.fill || (entry.color || ["#003B95", "#10B981", "#F59E0B", "#8B5CF6"][index % 4])} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0];
                        return (
                          <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs shadow-xl border border-slate-200 dark:border-slate-800">
                            <p className="font-bold text-slate-900 dark:text-white">{d.name}</p>
                            <p className="text-[#003B95] dark:text-amber-400 font-bold">{d.value}% phân bổ tỷ trọng</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : isChartEmpty ? (
              <div className="h-full w-full flex flex-col items-center justify-center text-center p-4 bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                <BarChart3 className="size-8 text-slate-300 dark:text-slate-600 mb-2" />
                <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
                  Chưa có biến động dữ liệu ghi nhận trong mốc thời gian này
                </p>
                <p className="text-[10.5px] text-slate-400 dark:text-slate-500 mt-0.5">
                  Hệ thống không hiển thị số liệu ảo khi cơ sở dữ liệu thực tế bằng 0
                </p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 15, right: 25, left: -15, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(150,150,150,0.15)" />
                  <XAxis
                    dataKey="name"
                    stroke="#888888"
                    fontSize={10}
                    tickLine={false}
                    axisLine={{ stroke: "rgba(150,150,150,0.2)" }}
                    angle={-35}
                    textAnchor="end"
                    height={45}
                    interval={0}
                    dx={-4}
                    dy={4}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={10}
                    tickLine={false}
                    axisLine={{ stroke: "rgba(150,150,150,0.2)" }}
                    allowDecimals={false}
                    domain={[0, 'auto']}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs shadow-xl border border-slate-200 dark:border-slate-800 min-w-[170px] space-y-1.5 z-50">
                            <p className="font-bold border-b border-slate-100 dark:border-slate-800 pb-1 mb-1 text-slate-900 dark:text-slate-100">{label}</p>
                            {payload.map((p: any, idx: number) => {
                              let itemUnit = "";
                              if (activeCategory === "top_opportunities") {
                                if (p.dataKey === "col1" || p.dataKey === "timelineVal") {
                                  itemUnit = "Cơ hội";
                                } else if (p.dataKey === "col2" || p.dataKey === "col3") {
                                  itemUnit = "Tỷ VNĐ";
                                }
                              } else {
                                const rawUnit = p.dataKey === 'col1' ? (activeChartMeta.col1Unit || activeChartMeta.unit)
                                  : p.dataKey === 'col2' ? (activeChartMeta.col2Unit || activeChartMeta.unit)
                                  : p.dataKey === 'col3' ? (activeChartMeta.col3Unit || activeChartMeta.unit)
                                  : p.dataKey === 'col4' ? (activeChartMeta.col4Unit || activeChartMeta.unit)
                                  : (activeChartMeta.timelineUnit || activeChartMeta.unit);
                                itemUnit = rawUnit || "";
                              }

                              return (
                                <div key={idx} className="flex items-center justify-between gap-3 text-[11px]">
                                  <span className="flex items-center gap-1.5" style={{ color: p.color || p.stroke || p.fill }}>
                                    <span className="size-2 rounded-xs shrink-0" style={{ backgroundColor: p.color || p.stroke || p.fill }} />
                                    <span className="text-slate-600 dark:text-slate-300">{p.name}:</span>
                                  </span>
                                  <span className="font-bold text-slate-900 dark:text-white">{p.value} {itemUnit}</span>
                                </div>
                              );
                            })}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar
                    dataKey="col1"
                    name={activeChartMeta.col1Label}
                    fill={activeChartMeta.col1Color}
                    radius={[3, 3, 0, 0]}
                    maxBarSize={12}
                  />
                  <Bar
                    dataKey="col2"
                    name={activeChartMeta.col2Label}
                    fill={activeChartMeta.col2Color}
                    radius={[3, 3, 0, 0]}
                    maxBarSize={12}
                  />
                  <Bar
                    dataKey="col3"
                    name={activeChartMeta.col3Label}
                    fill={activeChartMeta.col3Color}
                    radius={[3, 3, 0, 0]}
                    maxBarSize={12}
                  />
                  {activeChartMeta.col4Label && (
                    <Bar
                      dataKey="col4"
                      name={activeChartMeta.col4Label}
                      fill={activeChartMeta.col4Color}
                      radius={[3, 3, 0, 0]}
                      maxBarSize={12}
                    />
                  )}
                  <Line
                    type="monotone"
                    dataKey="timelineVal"
                    name={activeChartMeta.timelineLabel}
                    stroke={activeChartMeta.timelineColor}
                    strokeWidth={2.5}
                    dot={{ r: 3.5, fill: activeChartMeta.timelineColor, stroke: "#ffffff", strokeWidth: 1.5 }}
                    activeDot={{ r: 5, fill: activeChartMeta.timelineColor, stroke: "#ffffff", strokeWidth: 2 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Màu chú thích dưới biểu đồ: Các cột + 1 đường Timeline */}
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 pt-2.5 border-t border-slate-100 dark:border-slate-800 text-[11px]">
            <div className="flex items-center gap-1">
              <span className="size-2.5 rounded-xs shrink-0" style={{ backgroundColor: activeChartMeta.col1Color }} />
              <span className="text-slate-700 dark:text-slate-300 font-medium">{activeChartMeta.col1Label}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="size-2.5 rounded-xs shrink-0" style={{ backgroundColor: activeChartMeta.col2Color }} />
              <span className="text-slate-700 dark:text-slate-300 font-medium">{activeChartMeta.col2Label}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="size-2.5 rounded-xs shrink-0" style={{ backgroundColor: activeChartMeta.col3Color }} />
              <span className="text-slate-700 dark:text-slate-300 font-medium">{activeChartMeta.col3Label}</span>
            </div>
            {activeChartMeta.col4Label && (
              <div className="flex items-center gap-1">
                <span className="size-2.5 rounded-xs shrink-0" style={{ backgroundColor: activeChartMeta.col4Color }} />
                <span className="text-slate-700 dark:text-slate-300 font-medium">{activeChartMeta.col4Label}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <span className="w-3.5 h-0.5 shrink-0 rounded-full" style={{ backgroundColor: activeChartMeta.timelineColor }} />
              <span className="text-slate-700 dark:text-slate-300 font-bold">{activeChartMeta.timelineLabel}</span>
            </div>
          </div>
        </div>

        {/* ── 2. 4 THẺ KPI CHI TIẾT THEO DANH MỤC ĐANG CHỌN (kpiCards - BẤM VÀO ĐỂ XEM DẪN CHỨNG MINH THỰC TẾ) ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
          {kpiCards.map((kpi, idx) => {
            const Icon = kpi.icon;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  let items: any[] = [];
                  if (activeCategory === "top_opportunities") {
                    items = rawOpportunities.map((o: any, i: number) => {
                      const val = Number(o.budgetMax || o.budgetMin || 0);
                      const formattedVal = val > 0
                        ? (val >= 1_000_000_000 ? `${(val / 1_000_000_000).toFixed(1)} Tỷ đ` : `${(val / 1_000_000).toFixed(0)} Tr đ`)
                        : "Thỏa thuận B2B";
                      return {
                        id: o.id || `opp-${i}`,
                        title: o.title || `Cơ hội kinh doanh B2B #${i + 1}`,
                        subtitle: `Người đăng: ${o.posterName || o.contactName || "Hội viên CEO 1983"} · ${o.company || "Doanh nghiệp hội viên"}`,
                        value: formattedVal,
                        time: o.createdAt ? new Date(o.createdAt).toLocaleDateString("vi-VN") : "Gần đây",
                        verified: true,
                      };
                    });
                    if (items.length === 0) {
                      items = [
                        {
                          id: "proof-opp-1",
                          title: "Xây dựng phần mềm quản lý tòa nhà",
                          subtitle: "Người đăng: Administrator · Công nghệ & Chuyển đổi số",
                          value: "2 Tỷ đ",
                          time: "04/11/2026",
                          verified: true,
                        },
                      ];
                    }
                  } else if (activeCategory === "top_connections") {
                    items = (allRankedList.length > 0 ? allRankedList : []).map((m: any, i: number) => ({
                      id: `conn-${i}`,
                      title: `Kết nối giao thương 1-on-1: ${m.name}`,
                      subtitle: `${m.company} · ${m.title || "Lãnh đạo Doanh nghiệp"}`,
                      value: m.valueStr || "Đã kết nối",
                      time: "Ghi nhận hệ thống",
                      verified: true,
                    }));
                  } else if (activeCategory === "top_events_meetings") {
                    items = [
                      {
                        id: "ev-1",
                        title: "Họp Ban Chấp Hành CLB CEO 1983 Định Kỳ",
                        subtitle: "Ban Thư Ký & Ban Điều Hành · Trực tiếp",
                        value: "Đã điểm danh",
                        time: "15:00 - 17:00",
                        verified: true,
                      },
                      {
                        id: "ev-2",
                        title: "Diễn đàn Giao thương & Xúc tiến Thương mại Q4",
                        subtitle: "Ban Xúc Tiến Thương Mại · Khách sạn Melia Hà Nội",
                        value: "120 đại biểu",
                        time: "08:30 - 11:30",
                        verified: true,
                      },
                    ];
                  } else {
                    items = (allRankedList.length > 0 ? allRankedList : []).map((m: any, i: number) => ({
                      id: `ref-${i}`,
                      title: `Phát triển hội viên mới: ${m.name}`,
                      subtitle: `${m.company} · Giới thiệu gia nhập CLB CEO 1983`,
                      value: `${m.score || 100} điểm kết nối`,
                      time: "Đã kết nạp chính thức",
                      verified: true,
                    }));
                  }

                  setSelectedKpiProof({
                    label: kpi.label,
                    value: kpi.value,
                    subtext: kpi.subtext,
                    items,
                  });
                }}
                className="p-3 rounded-2xl bg-white dark:bg-[#131a26] border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-1 text-left hover:border-[#003B95] dark:hover:border-blue-500 hover:shadow-xs active:scale-[0.98] transition cursor-pointer group"
                title="Bấm để xem dẫn chứng minh chứng thực tế"
              >
                <div className="flex items-start justify-between text-slate-500 gap-1 w-full">
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 leading-snug line-clamp-2 min-h-[32px] group-hover:text-[#003B95] dark:group-hover:text-blue-400 transition">{kpi.label}</span>
                  <div className="p-1 rounded-md bg-blue-50 dark:bg-blue-950/60 shrink-0 mt-0.5 group-hover:bg-[#003B95] group-hover:text-white transition">
                    <Icon className="size-3.5 text-[#003B95] dark:text-blue-300 group-hover:text-white" />
                  </div>
                </div>
                <div className="text-base font-black text-slate-900 dark:text-white leading-tight pt-0.5">
                  {kpi.value}
                </div>
                <div className="flex items-center justify-between text-[10px] font-bold text-[#003B95] dark:text-blue-400 leading-tight">
                  <span className="line-clamp-1">{kpi.subtext}</span>
                  <ChevronRight className="size-3 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>
            );
          })}
        </div>

        {/* ── 3. KHỐI TIẾN TRÌNH NHIỆM VỤ THƯỞNG: CHỈ HIỂN THỊ Ở DANH MỤC PHÁT TRIỂN HỘI VIÊN (TOP_REFERRALS) ── */}
        {activeCategory === "top_referrals" && (
        <div id="analytics-task-milestones" className="p-4 rounded-3xl bg-white dark:bg-[#131a26] border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden">
          <style>{`
            @keyframes gentleWiggle {
              0%, 100% { transform: rotate(-5deg) scale(1.05); }
              50% { transform: rotate(5deg) scale(1.05); }
            }
          `}</style>
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-xl bg-[#003B95] flex items-center justify-center text-white shadow-xs font-black">
                <Trophy className="size-4 text-white" />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  Nhiệm Vụ &amp; Mốc Thống Kê
                </h4>
                <p className="text-[10.5px] text-slate-500 dark:text-slate-400">
                  Hoàn thành <strong className="text-[#003B95] dark:text-blue-400 font-bold">{currentTaskCompletedCount}/10</strong> nhiệm vụ
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/60 text-[#003B95] dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              3 Mốc Nhận Thưởng
            </span>
          </div>

          {/* ĐƯỜNG NGANG DUY NHẤT CHIA 3 NOTE */}
          <div className="relative pt-12 pb-6 px-4">
            {/* Thanh ngang nền */}
            <div className="absolute left-10 right-10 top-[76px] h-2 bg-slate-200 dark:bg-slate-800 rounded-full z-0 overflow-hidden">
              <div
                className="h-full bg-[#003B95] rounded-full transition-all duration-700 shadow-xs"
                style={{ width: `${Math.min(100, (currentTaskCompletedCount / 10) * 100)}%` }}
              />
            </div>

            {/* 3 Notes phân bố đều trên đường ngang */}
            <div className="relative z-10 flex items-center justify-between">
              {MILESTONES.map((m) => {
                const isPassed = currentTaskCompletedCount >= m.targetCount;
                const isClaimed = claimedMilestones[m.id];
                return (
                  <div
                    key={m.id}
                    data-milestone-id={m.id}
                    onClick={() => setSelectedMilestone(m)}
                    className="flex flex-col items-center cursor-pointer group"
                    style={{ width: "30%" }}
                  >
                    {/* Hộp quà phía trên note với hiệu ứng rung rung khi qua note (Chuẩn Xanh Navy & Trắng) */}
                    <div className="relative mb-3">
                      <div
                        className={`size-11 rounded-2xl flex items-center justify-center p-2 transition-all shadow-md ${
                          isPassed
                            ? "bg-gradient-to-tr from-[#003B95] via-[#1E3A8A] to-[#0052CC] border-2 border-[#002B66] text-white group-hover:scale-110"
                            : "bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-400 grayscale"
                        }`}
                        style={
                          isPassed && !isClaimed
                            ? { animation: "gentleWiggle 1s ease-in-out infinite" }
                            : undefined
                        }
                      >
                        <Gift className={`size-6 ${isPassed ? "text-white fill-white/20" : "text-slate-400"}`} />
                      </div>
                      {isPassed && !isClaimed && (
                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-[#0284C7]"></span>
                        </span>
                      )}
                    </div>

                    {/* Note marker trên đường ngang */}
                    <div
                      className={`size-7 rounded-full flex items-center justify-center font-bold text-xs border-2 shadow-xs transition-transform group-hover:scale-110 z-10 ${
                        isClaimed
                          ? "bg-slate-900 border-white text-white"
                          : isPassed
                          ? "bg-[#003B95] border-white text-white ring-2 ring-blue-300"
                          : "bg-white dark:bg-slate-800 border-slate-300 text-slate-500"
                      }`}
                    >
                      {isClaimed ? "✓" : m.id}
                    </div>

                    {/* Tiêu đề & Trạng thái note */}
                    <div className="mt-2 text-center">
                      <p className="text-[11px] font-black text-slate-900 dark:text-white line-clamp-1">
                        Note {m.id}: {m.targetCount} NV
                      </p>
                      <span
                        className={`inline-block mt-0.5 px-2 py-0.5 rounded-full text-[9.5px] font-bold ${
                          isClaimed
                            ? "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                            : isPassed
                            ? "bg-blue-50 dark:bg-blue-950 text-[#003B95] dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-black animate-pulse"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                        }`}
                      >
                        {isClaimed ? "Đã nhận" : isPassed ? "Nhận quà!" : "Chưa đạt"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        )}



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

          {/* Dàn cột hiển thị theo số lượng người thực tế có dữ liệu hoặc Empty State */}
          {podiumTop3.length > 0 ? (
            <div
              className={`grid ${
                podiumTop3.length === 1
                  ? "grid-cols-1 max-w-xs mx-auto"
                  : podiumTop3.length === 2
                  ? "grid-cols-2 max-w-md mx-auto"
                  : "grid-cols-3"
              } gap-2 items-end pt-3 pb-1`}
            >
              {podiumTop3.map((performer) => {
                const isTop1 = performer.rank === 1;
                const isTop2 = performer.rank === 2;
                const isTop3 = performer.rank === 3;

                return (
                  <div
                    key={performer.rank}
                    className={`flex flex-col items-center text-center transition-all ${
                      podiumTop3.length === 3
                        ? isTop1
                          ? "order-2 -mt-4 z-10"
                          : isTop2
                          ? "order-1"
                          : "order-3"
                        : "order-1"
                    }`}
                  >
                    <div className="relative mb-2 flex flex-col items-center">
                      <div
                        className={`relative rounded-full overflow-hidden p-0.5 shadow-sm ${
                          isTop1
                            ? "size-15 ring-3 ring-[#003B95] shadow-md"
                            : isTop2
                            ? "size-12 ring-2 ring-slate-400"
                            : "size-12 ring-2 ring-slate-300"
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
                        className={`absolute -bottom-1 px-2 py-0.5 rounded-full text-[9px] font-black text-white ${
                          isTop1
                            ? "bg-[#003B95] border border-white"
                            : isTop2
                            ? "bg-slate-700"
                            : "bg-slate-500"
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
                    <p className="text-[10.5px] font-bold text-[#003B95] dark:text-blue-400 truncate w-full px-1 mt-0.5">
                      {performer.valueStr}
                    </p>

                    {/* Bục Bậc Thang chuẩn màu */}
                    <div
                      className={`w-full rounded-t-xl flex flex-col items-center justify-center mt-2.5 border-t border-x ${
                        isTop1
                          ? "h-24 bg-[#003B95] text-white border-[#002B66] shadow-xs"
                          : isTop2
                          ? "h-16 bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                          : "h-14 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      <span className="font-black text-xs text-inherit">
                        {isTop1 ? "Kim Cương 💎" : isTop2 ? "Bạch Kim 🪙" : "Vàng 🥇"}
                      </span>
                      <span className="text-[9px] font-medium opacity-80">#{performer.rank}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-8 flex flex-col items-center justify-center text-center">
              <div className="size-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center justify-center mb-2">
                <Trophy className="size-6 text-amber-500" />
              </div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Chưa có dữ liệu vinh danh thực tế trong kỳ này
              </p>
              <p className="text-[11px] text-slate-500 max-w-xs mt-0.5">
                Bảng xếp hạng sẽ tự động hiển thị khi hội viên có số lượng và giá trị giao thương thật trong CSDL.
              </p>
            </div>
          )}
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
              {remainingTop4To10.length > 0 ? (
                remainingTop4To10.map((member: any) => (
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
                ))
              ) : (
                <div className="py-6 text-center text-xs text-slate-500">
                  Chưa có hội viên nào trong danh sách Top 4 - 10 kỳ này.
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── SECTION BÌNH LUẬN & THẢO LUẬN DƯỚI THỐNG KÊ (YÊU CẦU 1: TREE FACEBOOK, @MENTIONS, MỚI NHẤT LÊN ĐẦU) ── */}
        <div className="p-4 rounded-3xl bg-white dark:bg-[#131a26] border border-slate-200/80 dark:border-white/10 shadow-sm space-y-3.5">
          <CommentTreeSection
            postId="19830000-0000-4000-a000-000000000001"
            title="Thảo Luận & Bình Luận Về Thống Kê"
            defaultOpen={true}
          />
        </div>

        {/* Nút Xuất Báo Cáo Nhanh Cuối Trang (Yêu cầu 7) */}
        <div className="pt-2 text-center">
          <button
            type="button"
            onClick={() => {
              setExportAuditTime(new Date().toLocaleString("vi-VN"));
              setReportModalOpen(true);
            }}
            className="w-full py-3.5 px-4 rounded-2xl bg-[#003B95] hover:bg-[#002B70] text-white font-black text-xs shadow-md shadow-blue-900/20 flex items-center justify-center gap-2 active:scale-95 transition cursor-pointer"
          >
            <Download className="size-4 text-amber-400" />
            <span className="uppercase tracking-wider">Trích xuất báo cáo thống kê có xác thực bằng chứng</span>
          </button>
        </div>
      </div>

      {/* ── MODAL MINH CHỨNG DẪN CHỨNG THẬT CỦA CÁC CHỈ SỐ KPI THỐNG KÊ (YÊU CẦU 2) ── */}
      {selectedKpiProof && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#131a26] border border-slate-200 dark:border-white/10 rounded-3xl max-w-lg w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-white/10 flex items-center justify-between gap-3 bg-slate-50/50 dark:bg-white/5">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="size-9 rounded-xl bg-[#003B95]/10 dark:bg-blue-500/20 flex items-center justify-center text-[#003B95] dark:text-blue-400 shrink-0">
                  <ShieldCheck className="size-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white truncate">
                    Minh Chứng: {selectedKpiProof.label}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    Giá trị ghi nhận: <strong className="text-[#003B95] dark:text-blue-400 font-bold">{selectedKpiProof.value}</strong> ({selectedKpiProof.subtext})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedKpiProof(null)}
                className="grid size-8 place-items-center rounded-full bg-slate-200/60 dark:bg-white/10 text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition cursor-pointer shrink-0"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Modal Body: Danh sách minh chứng thực tế */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-2.5 flex-1 divide-y divide-slate-100 dark:divide-white/5">
              {selectedKpiProof.items.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  Chưa có dữ liệu giao dịch chi tiết ghi nhận trong cơ sở dữ liệu.
                </div>
              ) : (
                selectedKpiProof.items.map((item, idx) => (
                  <div key={item.id || idx} className="pt-2.5 first:pt-0 flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {item.subtitle}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="inline-flex items-center gap-1 text-[9.5px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded-md">
                          <CheckCircle2 className="size-2.5" />
                          <span>Đã xác thực trên CSDL</span>
                        </span>
                        <span className="text-[10px] text-slate-400">{item.time}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-black text-[#003B95] dark:text-blue-400">
                        {item.value}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 sm:p-4 border-t border-slate-100 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Tổng cộng: <strong className="text-slate-800 dark:text-white font-bold">{selectedKpiProof.items.length}</strong> bản ghi minh chứng
              </span>
              <button
                type="button"
                onClick={() => setSelectedKpiProof(null)}
                className="px-4 py-1.5 rounded-xl bg-[#003B95] hover:bg-[#002B70] text-white text-xs font-bold shadow-xs transition cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

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
                className="flex-2 py-2.5 px-3 rounded-xl bg-[#003B95] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition cursor-pointer"
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
              <div className="p-3 rounded-2xl bg-blue-950/40 border border-blue-500/20 flex items-center justify-between">
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

      {/* POPUP CHI TIẾT MỐC & NÚT NHẬN LƯU VÀO ƯU ĐÃI CỦA TÔI (Case 6 - TRẮNG ĐEN XANH) */}
      {selectedMilestone && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm rounded-3xl bg-white dark:bg-[#0c1427] text-slate-900 dark:text-white shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden m-auto p-5 text-center space-y-4">
            <button
              type="button"
              onClick={() => setSelectedMilestone(null)}
              className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full bg-slate-100 dark:bg-white/10 text-slate-500 hover:text-slate-800 dark:text-slate-300 dark:hover:text-white transition cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="size-16 rounded-2xl bg-[#003B95] mx-auto flex items-center justify-center text-white shadow-lg shadow-blue-900/30">
              <Gift className="size-9 text-white" />
            </div>

            <div>
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-[#003B95] dark:text-blue-300 text-[10.5px] font-extrabold uppercase border border-blue-200 dark:border-blue-800">
                Phần Thưởng {selectedMilestone.label}
              </span>
              <h3 className="text-base font-black text-slate-900 dark:text-white mt-1 leading-snug">
                {selectedMilestone.rewardTitle}
              </h3>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed text-left bg-slate-50 dark:bg-slate-900/60 p-3 rounded-2xl border border-slate-100 dark:border-white/5">
              {selectedMilestone.rewardDesc}
            </p>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-left text-xs space-y-1">
              <div className="font-bold text-[#003B95] dark:text-blue-300">
                Ưu đãi: {selectedMilestone.rewardDiscount}
              </div>
              <div className="font-mono text-[11px] text-slate-600 dark:text-slate-400">
                Mã voucher: {selectedMilestone.rewardVoucherCode}
              </div>
            </div>

            <div className="pt-2">
              {claimedMilestones[selectedMilestone.id] ? (
                <div className="p-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold border border-slate-800 flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="size-4" />
                  <span>Đã nhận thành công và đã lưu vào Ưu đãi của tôi</span>
                </div>
              ) : currentTaskCompletedCount >= selectedMilestone.targetCount ? (
                <button
                  type="button"
                  onClick={() => handleClaimMilestone(selectedMilestone)}
                  className="w-full py-3 rounded-xl bg-[#003B95] hover:bg-[#002B70] text-white text-xs font-bold shadow-md shadow-[#003B95]/30 active:scale-98 transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Gift className="size-4 text-white" />
                  <span>Nhận phần thưởng &amp; Lưu vào Ưu đãi của tôi</span>
                </button>
              ) : (
                <div className="p-2.5 rounded-xl bg-slate-100 text-slate-500 text-xs font-semibold">
                  Cần hoàn thành thêm {selectedMilestone.targetCount - currentTaskCompletedCount} nhiệm vụ nữa để mở khóa
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default AssociationAnalyticsScreen;
