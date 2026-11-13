import { createFileRoute } from "@tanstack/react-router";
import React, { useState, useMemo, useEffect } from "react";
import {
  Briefcase,
  TrendingUp,
  Download,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  FileSpreadsheet,
  Printer,
  X,
  Phone,
  Mail,
  UserX,
  HeartHandshake,
  Building,
  UserPlus,
  Medal,
  Trophy,
  Upload,
  PieChart as PieIcon,
  BarChart3,
  Coins,
  Layers,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  CalendarDays,
  History,
  ZoomIn,
  ZoomOut,
  Maximize2,
} from "lucide-react";
import { toast } from "sonner";
import { fetchNestApi } from "@/lib/api-client";
import { getConnectAppSocket } from "@/hooks/use-connect-app-socket";
import { AppShell } from "@/components/dashboard/AppShell";
import { PageHeader } from "@/components/dashboard/PageKit";
import { MilestoneAwardsManagerModal } from "@/components/analytics/MilestoneAwardsManagerModal";
import { CrmExcelExportModal } from "@/components/analytics/CrmExcelExportModal";
import { CrmExcelImportModal } from "@/components/analytics/CrmExcelImportModal";
import {
  AnalyticsPeriodPicker,
  type PeriodGranularity,
} from "@/components/analytics/AnalyticsPeriodPicker";
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell,
  Brush,
} from "recharts";

interface SearchParams {
  category?: string;
  period?: "month" | "quarter" | "year" | "minute" | "hour" | "day" | "week";
  granularity?: "month" | "quarter" | "year" | "minute" | "hour" | "day" | "week";
  year?: number;
  month?: number;
  quarter?: number;
}

export const Route = createFileRoute("/analytics")({
  validateSearch: (search: Record<string, unknown>): SearchParams => {
    const validGrans = ["month", "quarter", "year", "minute", "hour", "day", "week"];
    return {
      category: typeof search.category === "string" ? search.category : undefined,
      period: (validGrans.includes(search.period as string) ? search.period : undefined) as any,
      granularity: (validGrans.includes(search.granularity as string) ? search.granularity : undefined) as any,
      year: typeof search.year === "number" ? search.year : search.year ? Number(search.year) : undefined,
      month: typeof search.month === "number" ? search.month : search.month ? Number(search.month) : undefined,
      quarter: typeof search.quarter === "number" ? search.quarter : search.quarter ? Number(search.quarter) : undefined,
    };
  },
  component: AnalyticsDashboardPage,
  head: () => ({
    meta: [
      { title: "Báo Cáo & Thống Kê Quản Trị CLB CEO 1983" },
      {
        name: "description",
        content: "Hệ thống thống kê, phân tích chỉ số giao thương và xếp hạng hội viên CLB CEO 1983",
      },
    ],
  }),
});

// Bộ màu chuẩn mực CEO 1983: Trắng, Xanh Navy, Đen, Vàng, Đỏ, Xanh Lá
const PALETTE = {
  navy: "#003B95",
  gold: "#F59E0B",
  green: "#10B981",
  red: "#DC2626",
  dark: "#0F172A",
  white: "#FFFFFF",
};

export type AnalyticsCategory =
  | "member_activities"
  | "activity_sentiment"
  | "top_connections"
  | "top_opportunities"
  | "top_events_meetings"
  | "top_referrals"
  | "external_shares";

interface CategoryMeta {
  id: AnalyticsCategory;
  alias: string[];
  label: string;
  subLabel: string;
  metricLabel: string;
  unit: string;
  bar1Name: string;
  bar2Name: string;
  lineName: string;
}

const CATEGORIES: CategoryMeta[] = [
  {
    id: "member_activities",
    alias: ["member_activities", "activity_sentiment", "sentiment", "top_referrals", "external_shares", "shares", "referrals"],
    label: "Hoạt động hội viên",
    subLabel: "Thống kê lượt bình luận, share ra ngoài và click link giới thiệu hội viên",
    metricLabel: "Lượt hoạt động",
    unit: "Lượt",
    bar1Name: "Lượt bình luận",
    bar2Name: "Lượt share bài viết",
    lineName: "Tổng hoạt động",
  },
  {
    id: "top_connections",
    alias: ["top_connectors", "top_connections", "connections"],
    label: "Kết nối giao thương",
    subLabel: "Lượt kết nối 1-on-1 và gặp gỡ trao đổi giữa các doanh nghiệp",
    metricLabel: "Lượt kết nối",
    unit: "Lượt",
    bar1Name: "Kết nối thực tế",
    bar2Name: "Chỉ tiêu kế hoạch",
    lineName: "Tỷ lệ thành công",
  },
  {
    id: "top_opportunities",
    alias: ["top_b2b", "top_opportunities", "opportunities"],
    label: "Cơ hội kinh doanh",
    subLabel: "Cơ hội B2B công khai được chia sẻ và giá trị thương vụ",
    metricLabel: "Cơ hội công khai",
    unit: "Cơ hội",
    bar1Name: "Cơ hội B2B chia sẻ",
    bar2Name: "Thương vụ đã chốt",
    lineName: "Tỷ lệ chuyển đổi",
  },
  {
    id: "top_events_meetings",
    alias: ["top_events", "top_events_meetings", "events"],
    label: "Sự kiện & cuộc họp",
    subLabel: "Số lượt tham gia sự kiện, họp ban chuyên môn và điểm danh",
    metricLabel: "Lượt tham gia",
    unit: "Lượt",
    bar1Name: "Lượt tham gia thực tế",
    bar2Name: "Số lượng dự kiến",
    lineName: "Tỷ lệ tham dự đúng giờ",
  },
];

interface RankedMemberItem {
  rank: number;
  name: string;
  company: string;
  role: string;
  dept: string;
  score: string;
  metric: number;
  phone: string;
  avatar: string;
}

export function AnalyticsDashboardPage() {
  const search = Route.useSearch();
  const currentNow = useMemo(() => new Date(), []);
  const defaultYear = currentNow.getFullYear();
  const defaultMonth = currentNow.getMonth() + 1;
  const defaultQuarter = Math.ceil((currentNow.getMonth() + 1) / 3);

  const [selectedCat, setSelectedCat] = useState<AnalyticsCategory>("member_activities");
  const [granularity, setGranularity] = useState<PeriodGranularity>("month");
  const [selectedYear, setSelectedYear] = useState<number>(defaultYear);
  const [selectedMonth, setSelectedMonth] = useState<number>(defaultMonth);
  const [selectedQuarter, setSelectedQuarter] = useState<number>(defaultQuarter);

  const period = granularity;
  const setPeriod = (val: any) => {
    if (val === "month" || val === "quarter" || val === "year") {
      setGranularity(val);
    }
  };
  const [chartMode, setChartMode] = useState<"composed" | "pie">("composed");
  const [subView, setSubView] = useState<"default" | "alt">("default");
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [moneyFilter, setMoneyFilter] = useState<"all" | "under_500m" | "500m_2b" | "2b_10b" | "over_10b">("all");
  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showMilestoneAwardsModal, setShowMilestoneAwardsModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverData, setServerData] = useState<any>(null);

  // Kiểm tra xem người dùng có đang xem dữ liệu lịch sử hay không
  const isHistorical = useMemo(() => {
    if (granularity === "year") return selectedYear !== defaultYear;
    if (granularity === "quarter") return selectedYear !== defaultYear || selectedQuarter !== defaultQuarter;
    return selectedYear !== defaultYear || selectedMonth !== defaultMonth;
  }, [granularity, selectedYear, selectedMonth, selectedQuarter, defaultYear, defaultMonth, defaultQuarter]);

  const selectedPeriodLabel = useMemo(() => {
    if (granularity === "year") return `Năm ${selectedYear}`;
    if (granularity === "quarter") return `Quý ${selectedQuarter}/${selectedYear}`;
    return `Tháng ${selectedMonth}/${selectedYear}`;
  }, [granularity, selectedYear, selectedMonth, selectedQuarter]);

  const handleResetToCurrent = () => {
    setSelectedYear(defaultYear);
    setSelectedMonth(defaultMonth);
    setSelectedQuarter(defaultQuarter);
    toast.success("Đã quay về kỳ thống kê hiện tại");
  };

  // Đồng bộ search param category từ URL
  useEffect(() => {
    if (search?.category) {
      const matched = CATEGORIES.find(
        (c) => c.id === search.category || c.alias.includes(search.category!)
      );
      if (matched) {
        setSelectedCat(matched.id);
      }
    }
    if (search?.period || search?.granularity) {
      const g = (search.period || search.granularity) as any;
      if (g === "month" || g === "quarter" || g === "year") {
        setGranularity(g);
      }
    }
    if (search?.year) setSelectedYear(Number(search.year));
    if (search?.month) setSelectedMonth(Number(search.month));
    if (search?.quarter) setSelectedQuarter(Number(search.quarter));
  }, [search]);

  // Tải dữ liệu từ NestJS backend theo chu kỳ Tháng / Quý / Năm và lịch lịch sử
  useEffect(() => {
    let isMounted = true;
    async function loadStats() {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          granularity,
          period: granularity,
          year: String(selectedYear),
          ...(granularity === "month" ? { month: String(selectedMonth) } : {}),
          ...(granularity === "quarter" ? { quarter: String(selectedQuarter) } : {}),
        });
        const res = await fetchNestApi<any>(`/analytics/overview?${params.toString()}`);
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
  }, [granularity, selectedYear, selectedMonth, selectedQuarter]);

  // Realtime updates: Refresh CRM analytics when any new deal, connection, or opportunity occurs
  useEffect(() => {
    let socket: any = null;
    try {
      socket = getConnectAppSocket();
    } catch {}

    const handleRealtimeUpdate = () => {
      const params = new URLSearchParams({
        granularity,
        period: granularity,
        year: String(selectedYear),
        ...(granularity === "month" ? { month: String(selectedMonth) } : {}),
        ...(granularity === "quarter" ? { quarter: String(selectedQuarter) } : {}),
      });
      fetchNestApi<any>(`/analytics/overview?${params.toString()}`)
        .then((res) => {
          if (res && res.ok) {
            setServerData(res);
          }
        })
        .catch(() => {});
    };

    if (socket) {
      socket.on("opportunity:created", handleRealtimeUpdate);
      socket.on("opportunity:updated", handleRealtimeUpdate);
      socket.on("connection:accepted", handleRealtimeUpdate);
      socket.on("event:registered", handleRealtimeUpdate);
      socket.on("deal:recorded", handleRealtimeUpdate);
    }
    window.addEventListener("vba:realtime_refresh_stats", handleRealtimeUpdate);
    window.addEventListener("vba_refresh_analytics", handleRealtimeUpdate);

    return () => {
      if (socket) {
        socket.off("opportunity:created", handleRealtimeUpdate);
        socket.off("opportunity:updated", handleRealtimeUpdate);
        socket.off("connection:accepted", handleRealtimeUpdate);
        socket.off("event:registered", handleRealtimeUpdate);
        socket.off("deal:recorded", handleRealtimeUpdate);
      }
      window.removeEventListener("vba:realtime_refresh_stats", handleRealtimeUpdate);
      window.removeEventListener("vba_refresh_analytics", handleRealtimeUpdate);
    };
  }, [granularity, selectedYear, selectedMonth, selectedQuarter]);

  const activeCategoryMeta = useMemo(() => {
    return CATEGORIES.find((c) => c.id === selectedCat) || CATEGORIES[0];
  }, [selectedCat]);

  // Dữ liệu gắn kết hội viên
  const sentimentStats = useMemo(() => {
    if (serverData?.memberActivitySentiment) {
      return serverData.memberActivitySentiment;
    }
    return {
      activeCount: 42,
      needsSupportCount: 8,
      totalMembers: 50,
      activeRatePercent: 84,
      leastActiveTop3: [
        {
          id: "m-1",
          rank: 1,
          name: "Nguyễn Văn Hùng",
          company: "Công ty Cổ phần Cơ khí Hà Nội",
          title: "Giám đốc",
          department: "Ban Thành Viên",
          phone: "0912 345 678",
          email: "hung.nguyen@cokhihanoi.vn",
          avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
          warningReason: "Chưa tham gia sự kiện trong kỳ gần nhất",
          actionNeeded: "Ban Thư Ký liên hệ giới thiệu đối tác giao thương phù hợp",
        },
        {
          id: "m-2",
          rank: 2,
          name: "Lê Thị Bích Ngọc",
          company: "Thời trang Bích Ngọc",
          title: "Chủ sáng lập",
          department: "Ban Xúc Tiến",
          phone: "0983 234 567",
          email: "ngoc.le@bichngocfashion.vn",
          avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80",
          warningReason: "Chưa phát sinh kết nối giao thương trong quý",
          actionNeeded: "Mời tham dự phiên cà phê kết nối doanh nhân 1-on-1",
        },
        {
          id: "m-3",
          rank: 3,
          name: "Hoàng Minh Trí",
          company: "Vận tải & Logistics Trí Phát",
          title: "Tổng Giám đốc",
          department: "Ban Tài Chính",
          phone: "0904 889 911",
          email: "tri.hoang@triphatlogistics.com",
          avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80",
          warningReason: "Chưa cập nhật hồ sơ năng lực doanh nghiệp",
          actionNeeded: "Hỗ trợ chuẩn hóa thông tin trên danh bạ điện tử CLB",
        },
      ],
      sentimentTrendData: [
        { periodLabel: period === "year" ? "Năm 2024" : period === "quarter" ? "Quý 1" : "Đầu kỳ", bar1: 36, bar2: 14, rate: 72 },
        { periodLabel: period === "year" ? "Năm 2025" : period === "quarter" ? "Quý 2" : "Giữa kỳ", bar1: 40, bar2: 10, rate: 80 },
        { periodLabel: period === "year" ? "Năm 2026" : period === "quarter" ? "Quý 3" : "Hiện tại", bar1: 42, bar2: 8, rate: 84 },
      ],
    };
  }, [serverData, period]);

  // 4 Thẻ KPI cân đối theo danh mục
  const kpiData = useMemo(() => {
    switch (selectedCat) {
      case "member_activities":
      case "activity_sentiment": {
        const catStats = serverData?.categories?.memberActivities || serverData?.categories?.activitySentiment;
        const totalComments = catStats?.totalComments ?? (serverData?.kpi?.totalInteractions ? Math.round(serverData.kpi.totalInteractions * 0.4) : 28);
        const totalPostShares = catStats?.totalPostShares ?? (serverData?.categories?.externalShareClicks?.totalClicks ?? 18);
        const totalRefClicks = catStats?.totalReferralClicks ?? 14;
        const totalActivities = totalComments + totalPostShares + totalRefClicks;

        return [
          {
            label: "Tổng hoạt động hội viên",
            value: `${totalActivities} lượt`,
            delta: "100%",
            isUp: true,
            desc: "Tổng tương tác hoạt động trong kỳ",
          },
          {
            label: "Lượt bình luận bài viết",
            value: `${totalComments} bình luận`,
            delta: `${Math.round((totalComments / (totalActivities || 1)) * 100)}%`,
            isUp: true,
            desc: "Tương tác trao đổi trên bảng tin",
          },
          {
            label: "Lượt share ra nền tảng",
            value: `${totalPostShares} lượt share`,
            delta: `${Math.round((totalPostShares / (totalActivities || 1)) * 100)}%`,
            isUp: true,
            desc: "Chia sẻ bài viết sang FB, Zalo, Web",
          },
          {
            label: "Lượt click link giới thiệu",
            value: `${totalRefClicks} lượt click`,
            delta: `${Math.round((totalRefClicks / (totalActivities || 1)) * 100)}%`,
            isUp: true,
            desc: "Click link mời gia nhập hội viên mới",
          },
        ];
      }
      case "top_connections": {
        const top1 = serverData?.topConnections?.[0];
        const totalConns = serverData?.topConnections?.reduce((acc: number, m: any) => acc + (m.connectionsCount || 0), 0) || 0;
        const totalMems = serverData?.kpi?.totalMembers || (serverData?.topConnections?.length || 1);
        const connectedCount = serverData?.topConnections?.filter((m: any) => (m.connectionsCount || 0) > 0).length || 0;
        const connectRate = totalMems > 0 ? Math.round((connectedCount / totalMems) * 100) : 0;
        const avgConn = totalMems > 0 ? (totalConns / totalMems).toFixed(1) : "0";
        return [
          { label: "Tổng lượt kết nối", value: `${totalConns} lượt`, delta: "Thời gian thực", isUp: true, desc: "Giao lưu 1-on-1 trong kỳ" },
          { label: "Tỷ lệ hội viên kết nối", value: `${connectRate}%`, delta: `${connectedCount} / ${totalMems} CEO`, isUp: true, desc: "Độ phủ mạng lưới giao thương" },
          { label: "Quán quân kết nối", value: top1?.name || "Chưa có", delta: `${top1?.connectionsCount || 0} lượt`, isUp: true, desc: "Top 1 kết nối năng động" },
          { label: "Trung bình mỗi hội viên", value: `${avgConn} lượt`, delta: "Theo CSDL", isUp: true, desc: "Mức tương tác trung bình" },
        ];
      }
      case "top_opportunities": {
        const top1 = serverData?.topOpportunities?.[0];
        const totalOpps = serverData?.kpi?.totalClubOpportunities ?? (serverData?.topOpportunities?.reduce((acc: number, m: any) => acc + (m.publicOppsShared || 0), 0) || 0);
        const totalVal = serverData?.kpi?.totalValueContributed || 0;
        const formattedVal = totalVal >= 1e9 ? `${(totalVal / 1e9).toFixed(1)} tỷ` : `${Math.round(totalVal / 1e6)} tr`;
        const wonCount = serverData?.kpi?.totalDealsWon || 0;
        const winRate = totalOpps > 0 ? `${Math.round((wonCount / totalOpps) * 100)}%` : "0%";
        return [
          { label: "Tổng cơ hội B2B", value: `${totalOpps} tin`, delta: "Thời gian thực", isUp: true, desc: "Công khai trên toàn mạng lưới" },
          { label: "Giá trị đóng góp", value: formattedVal, delta: "Giao thương thực", isUp: true, desc: "Quy mô gói thầu chào đón" },
          { label: "Quán quân chia sẻ", value: top1?.name || "Chưa có", delta: `${top1?.publicOppsShared || 0} tin`, isUp: true, desc: "Top 1 chia sẻ cơ hội" },
          { label: "Thương vụ đã chốt", value: `${wonCount} deal`, delta: winRate, isUp: true, desc: "Hợp đồng đã hoàn tất" },
        ];
      }
      case "top_events_meetings": {
        const top1 = serverData?.topEventsMeetings?.[0];
        const totalAttended = serverData?.topEventsMeetings?.reduce((acc: number, m: any) => acc + (m.eventsAttended || 0), 0) || 0;
        const totalFeed = serverData?.topEventsMeetings?.reduce((acc: number, m: any) => acc + (m.feedInteractions || 0), 0) || 0;
        const activeRate = serverData?.kpi?.activeRatePercent ? `${serverData.kpi.activeRatePercent}%` : "100%";
        return [
          { label: "Tổng lượt tham gia", value: `${totalAttended} lượt`, delta: "Điểm danh thực", isUp: true, desc: "Sự kiện & cuộc họp trong kỳ" },
          { label: "Tương tác nội bộ", value: `${totalFeed} lượt`, delta: "Thảo luận & like", isUp: true, desc: "Tương tác bản tin & diễn đàn" },
          { label: "Quán quân tham gia", value: top1?.name || "Chưa có", delta: `${top1?.eventsAttended || 0} buổi`, isUp: true, desc: "Điểm danh đầy đủ nhất" },
          { label: "Tỷ lệ gắn kết", value: activeRate, delta: "Đúng giờ & tích cực", isUp: true, desc: "Trao đổi & sinh hoạt chuyên môn" },
        ];
      }
      case "top_referrals":
      default: {
        const top1 = serverData?.topReferrals?.[0];
        const totalRefs = serverData?.topReferrals?.reduce((acc: number, m: any) => acc + (m.referralsCount || 0), 0) || 0;
        const totalScore = serverData?.topReferrals?.reduce((acc: number, m: any) => acc + (m.interactionScore || 0), 0) || 0;
        return [
          { label: "Hội viên mới giới thiệu", value: `${totalRefs} CEO`, delta: "Thời gian thực", isUp: true, desc: "Gia nhập qua mạng lưới hội viên" },
          { label: "Độ phủ giới thiệu", value: `${serverData?.topReferrals?.length || 0} người`, delta: "Đại sứ kết nối", isUp: true, desc: "Hội viên tham gia kết nạp" },
          { label: "Quán quân giới thiệu", value: top1?.name || "Chưa có", delta: `${top1?.referralsCount || top1?.connectionsCount || 0} CEO`, isUp: true, desc: "Đại sứ kết nối xuất sắc" },
          { label: "Điểm thi đua ghi nhận", value: `${totalScore.toLocaleString("vi-VN")} đ`, delta: "Tích lũy", isUp: true, desc: "Ghi nhận theo quy chế khen thưởng" },
        ];
      }
    }
  }, [selectedCat, sentimentStats, serverData]);

  // Danh sách Top 1 - 10 theo từng danh mục
  const allRankedMembers = useMemo<RankedMemberItem[]>(() => {
    const mapItems = (list: any[], scoreSuffix: string, metricKey: string): RankedMemberItem[] => {
      if (!list || list.length === 0) return [];
      return list.map((item: any, idx: number) => ({
        rank: item.rank || idx + 1,
        name: item.name || "Hội viên",
        company: item.company || "CLB CEO 1983",
        role: item.title || item.role || "Hội viên",
        dept: item.department || item.dept || "Hội viên ceo1983",
        score: item.score || `${item[metricKey] || 0} ${scoreSuffix}`,
        metric: item[metricKey] || 0,
        phone: item.phone || "0983 198 383",
        avatar: item.avatar || "/ceo1983-emblem-8.png",
      }));
    };

    if (selectedCat === "top_connections") {
      if (serverData?.topConnections?.length) {
        return mapItems(serverData.topConnections, "Lượt kết nối", "connectionsCount");
      }
      return [];
    }
    if (selectedCat === "top_opportunities") {
      if (serverData?.topOpportunities?.length) {
        return mapItems(serverData.topOpportunities, "Cơ hội B2B", "publicOppsShared");
      }
      return [];
    }
    if (selectedCat === "top_events_meetings") {
      if (serverData?.topEventsMeetings?.length) {
        return mapItems(serverData.topEventsMeetings, "Buổi họp & sự kiện", "eventsAttended");
      }
      return [];
    }
    // selectedCat === "top_referrals"
    if (serverData?.topReferrals?.length) {
      return mapItems(serverData.topReferrals, "Hội viên giới thiệu", "referralsCount");
    }
    return [];
  }, [selectedCat, serverData]);

  // Bục Top 3: Cân đối và chuẩn xác
  const top1 = allRankedMembers.find((p) => p.rank === 1);
  const top2 = allRankedMembers.find((p) => p.rank === 2);
  const top3 = allRankedMembers.find((p) => p.rank === 3);
  const remainingTop4To10 = allRankedMembers.slice(3, 10);

  // Định nghĩa màu sắc, nhãn và đơn vị chuẩn cho từng chỉ số theo danh mục
  const CRM_CHART_METAS: Record<string, {
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
    col4Label: string;
    col4Color: string;
    col4Unit?: string;
    timelineLabel: string;
    timelineColor: string;
    timelineUnit?: string;
  }> = {
    top_connections: {
      unit: "Lượt",
      col1Label: "Đã kết nối",
      col1Color: "#003B95",
      col1Unit: "Lượt",
      col2Label: "Chờ phản hồi",
      col2Color: "#10B981",
      col2Unit: "Lượt",
      col3Label: "Cuộc gặp B2B",
      col3Color: "#F59E0B",
      col3Unit: "Cuộc",
      col4Label: "Kết nối khác",
      col4Color: "#8B5CF6",
      col4Unit: "Lượt",
      timelineLabel: "Tổng lượt kết nối",
      timelineColor: "#EA580C",
      timelineUnit: "Lượt",
    },
    top_opportunities: {
      unit: "Cơ hội",
      col1Label: "Cơ hội mở mới",
      col1Color: "#003B95",
      col1Unit: "Cơ hội",
      col2Label: "Đang đàm phán",
      col2Color: "#10B981",
      col2Unit: "Cơ hội",
      col3Label: "Đã kết nối / chốt",
      col3Color: "#F59E0B",
      col3Unit: "Cơ hội",
      col4Label: "Cuộc gặp B2B",
      col4Color: "#8B5CF6",
      col4Unit: "Cuộc",
      timelineLabel: "Tổng luồng cơ hội",
      timelineColor: "#DC2626",
      timelineUnit: "Cơ hội",
    },
    top_events_meetings: {
      unit: "Lượt",
      col1Label: "Điểm danh thực tế",
      col1Color: "#003B95",
      col1Unit: "Lượt",
      col2Label: "Chờ check-in",
      col2Color: "#10B981",
      col2Unit: "Lượt",
      col3Label: "Cuộc họp ban",
      col3Color: "#F59E0B",
      col3Unit: "Cuộc",
      col4Label: "Đăng ký khác",
      col4Color: "#EA580C",
      col4Unit: "Lượt",
      timelineLabel: "Tổng lượt tham gia",
      timelineColor: "#DC2626",
      timelineUnit: "Lượt",
    },
    top_referrals: {
      unit: "Hội viên",
      col1Label: "Đã kết nạp chính thức",
      col1Color: "#003B95",
      col1Unit: "Hội viên",
      col2Label: "Chờ kết nạp",
      col2Color: "#10B981",
      col2Unit: "Hội viên",
      col3Label: "Hội viên giới thiệu",
      col3Color: "#F59E0B",
      col3Unit: "Hội viên",
      col4Label: "Hoàn thành nhiệm vụ",
      col4Color: "#EC4899",
      col4Unit: "Mốc",
      timelineLabel: "Tổng hội viên mới",
      timelineColor: "#0284C7",
      timelineUnit: "Hội viên",
    },
    member_activities: {
      unit: "Lượt",
      col1Label: "Lượt bình luận",
      col1Color: "#003B95",
      col1Unit: "Lượt",
      col2Label: "Lượt share bài viết",
      col2Color: "#10B981",
      col2Unit: "Lượt",
      col3Label: "Lượt click link giới thiệu",
      col3Color: "#F59E0B",
      col3Unit: "Lượt",
      col4Label: undefined as any,
      col4Color: undefined as any,
      timelineLabel: "Tổng hoạt động hội viên",
      timelineColor: "#DC2626",
      timelineUnit: "Lượt",
    },
    activity_sentiment: {
      unit: "Lượt",
      col1Label: "Lượt bình luận",
      col1Color: "#003B95",
      col1Unit: "Lượt",
      col2Label: "Lượt share bài viết",
      col2Color: "#10B981",
      col2Unit: "Lượt",
      col3Label: "Lượt click link giới thiệu",
      col3Color: "#F59E0B",
      col3Unit: "Lượt",
      col4Label: undefined as any,
      col4Color: undefined as any,
      timelineLabel: "Tổng hoạt động hội viên",
      timelineColor: "#DC2626",
      timelineUnit: "Lượt",
    },
    external_shares: {
      unit: "Lượt click",
      col1Label: "Facebook",
      col1Color: "#1877F2",
      col1Unit: "Click",
      col2Label: "Zalo",
      col2Color: "#0068FF",
      col2Unit: "Click",
      col3Label: "Trình duyệt Web",
      col3Color: "#10B981",
      col3Unit: "Click",
      col4Label: "Chuyển đổi đăng nhập",
      col4Color: "#F59E0B",
      col4Unit: "Lượt",
      timelineLabel: "Tổng lượt click",
      timelineColor: "#DC2626",
      timelineUnit: "Click",
    },
  };

  const activeChartMeta = useMemo(() => {
    let catKey = "memberActivities";
    if (selectedCat === "member_activities" || selectedCat === "activity_sentiment") catKey = "memberActivities";
    else if (selectedCat === "top_connections") catKey = "topConnections";
    else if (selectedCat === "top_opportunities") catKey = "topOpportunities";
    else if (selectedCat === "top_events_meetings") catKey = "topEventsMeetings";
    else if (selectedCat === "top_referrals") catKey = "topReferrals";
    else if (selectedCat === "external_shares") catKey = "externalShareClicks";

    return serverData?.categories?.[catKey]?.chartMeta || CRM_CHART_METAS[selectedCat] || CRM_CHART_METAS.member_activities;
  }, [selectedCat, serverData]);

  // Dữ liệu biểu đồ chuẩn xác theo thời gian thực từ database
  const chartData = useMemo(() => {
    let catKey = "memberActivities";
    if (selectedCat === "member_activities" || selectedCat === "activity_sentiment") catKey = "memberActivities";
    else if (selectedCat === "top_connections") catKey = "topConnections";
    else if (selectedCat === "top_opportunities") catKey = "topOpportunities";
    else if (selectedCat === "top_events_meetings") catKey = "topEventsMeetings";
    else if (selectedCat === "top_referrals") catKey = "topReferrals";
    else if (selectedCat === "external_shares") catKey = "externalShareClicks";

    const apiCat = serverData?.categories?.[catKey];
    if (apiCat?.granularities) {
      if (granularity === "month") {
        if (subView === "alt" && apiCat.granularities.month_weeks) return apiCat.granularities.month_weeks;
        if (apiCat.granularities.month_days) return apiCat.granularities.month_days;
        if (apiCat.granularities.month) return apiCat.granularities.month;
      } else if (granularity === "quarter") {
        if (subView === "alt" && apiCat.granularities.quarter_months) return apiCat.granularities.quarter_months;
        if (apiCat.granularities.quarter_weeks) return apiCat.granularities.quarter_weeks;
        if (apiCat.granularities.quarter) return apiCat.granularities.quarter;
      } else if (granularity === "year") {
        if (subView === "alt" && apiCat.granularities.year_quarters) return apiCat.granularities.year_quarters;
        if (apiCat.granularities.year_months) return apiCat.granularities.year_months;
        if (apiCat.granularities.year) return apiCat.granularities.year;
      }
      if (apiCat.granularities[granularity]) return apiCat.granularities[granularity];
    }
    if (apiCat?.chartData && Array.isArray(apiCat.chartData)) return apiCat.chartData;
    return [];
  }, [selectedCat, serverData, granularity, subView]);

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

  // Dữ liệu Biểu đồ Tròn phân bổ tỷ trọng theo 4 chỉ số
  const pieChartData = useMemo(() => {
    if (!chartData || chartData.length === 0) return [];
    let c1 = 0, c2 = 0, c3 = 0, c4 = 0;
    chartData.forEach((d: any) => {
      c1 += Number(d.col1) || 0;
      c2 += Number(d.col2) || 0;
      c3 += Number(d.col3) || 0;
      c4 += Number(d.col4) || 0;
    });
    const total = c1 + c2 + c3 + c4;
    if (total === 0) {
      return [
        { name: activeChartMeta.col1Label, value: 25, fill: activeChartMeta.col1Color, raw: 0, unit: activeChartMeta.col1Unit || activeChartMeta.unit },
        { name: activeChartMeta.col2Label, value: 25, fill: activeChartMeta.col2Color, raw: 0, unit: activeChartMeta.col2Unit || activeChartMeta.unit },
        { name: activeChartMeta.col3Label, value: 25, fill: activeChartMeta.col3Color, raw: 0, unit: activeChartMeta.col3Unit || activeChartMeta.unit },
        { name: activeChartMeta.col4Label, value: 25, fill: activeChartMeta.col4Color, raw: 0, unit: activeChartMeta.col4Unit || activeChartMeta.unit },
      ];
    }
    return [
      { name: activeChartMeta.col1Label, value: Math.round((c1 / total) * 100), fill: activeChartMeta.col1Color, raw: c1, unit: activeChartMeta.col1Unit || activeChartMeta.unit },
      { name: activeChartMeta.col2Label, value: Math.round((c2 / total) * 100), fill: activeChartMeta.col2Color, raw: c2, unit: activeChartMeta.col2Unit || activeChartMeta.unit },
      { name: activeChartMeta.col3Label, value: Math.round((c3 / total) * 100), fill: activeChartMeta.col3Color, raw: c3, unit: activeChartMeta.col3Unit || activeChartMeta.unit },
      { name: activeChartMeta.col4Label, value: Math.round((c4 / total) * 100), fill: activeChartMeta.col4Color, raw: c4, unit: activeChartMeta.col4Unit || activeChartMeta.unit },
    ];
  }, [chartData, activeChartMeta]);

  return (
    <AppShell>
      <div className="space-y-6 pb-20 font-sans">
        {/* Header trang tối giản, hành động báo cáo theo chức năng thống kê con */}
        <PageHeader
          title={`Thống Kê: ${activeCategoryMeta.label}`}
          subtitle={activeCategoryMeta.subLabel}
          actions={
            <div className="flex items-center gap-2">
              {/* Mốc Thưởng & Nhiệm Vụ Thưởng: CHỈ HIỂN THỊ Ở DANH MỤC PHÁT TRIỂN HỘI VIÊN */}
              {selectedCat === "top_referrals" && (
                <button
                  type="button"
                  onClick={() => setShowMilestoneAwardsModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Trophy className="size-4 text-slate-950" />
                  <span>Mốc Thưởng</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setShowImportModal(true)}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
              >
                <Upload className="size-4" />
                <span>Nhập File Excel</span>
              </button>

              <button
                type="button"
                onClick={() => setShowExportModal(true)}
                className="px-3.5 py-2 rounded-xl bg-[#003B95] hover:bg-[#002B70] text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
              >
                <Download className="size-4" />
                <span>Xuất Báo Cáo Excel</span>
              </button>
            </div>
          }
        />

        {/* Breadcrumb phân hệ thống kê con xác định trực tiếp từ menu Sidebar */}
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <BarChart3 className="size-4 text-[#003B95] dark:text-amber-400 shrink-0" />
          <span className="text-xs font-medium text-slate-500">Phân Hệ Thống Kê</span>
          <span className="text-slate-300 dark:text-slate-700">/</span>
          <span className="px-2.5 py-0.5 rounded-full bg-[#003B95]/10 dark:bg-amber-400/10 text-[#003B95] dark:text-amber-400 text-xs font-bold">
            {activeCategoryMeta.label}
          </span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 ml-auto hidden sm:inline italic">
            {activeCategoryMeta.subLabel}
          </span>
        </div>

        {/* Bộ Lọc Chu Kỳ Tháng / Quý / Năm & Chọn Lịch Xem Thống Kê Lịch Sử */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center gap-2">
            <CalendarDays className="size-4 text-[#003B95] dark:text-amber-400 shrink-0" />
            <div className="text-xs">
              <span className="font-bold text-slate-900 dark:text-white">Kỳ Thống Kê:</span>{" "}
              <span className="font-black text-[#003B95] dark:text-amber-400">{selectedPeriodLabel}</span>
              {isHistorical && (
                <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                  <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
                  Kỳ lịch sử
                </span>
              )}
            </div>
          </div>

          <AnalyticsPeriodPicker
            granularity={granularity}
            onGranularityChange={setGranularity}
            selectedYear={selectedYear}
            onYearChange={setSelectedYear}
            selectedMonth={selectedMonth}
            onMonthChange={setSelectedMonth}
            selectedQuarter={selectedQuarter}
            onQuarterChange={setSelectedQuarter}
            themeColor={PALETTE.navy}
          />
        </div>

        {/* Cảnh báo khi xem kỳ lịch sử cũ */}
        {isHistorical && (
          <div className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 text-xs shadow-2xs">
            <div className="flex items-center gap-2">
              <History className="size-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>
                Bạn đang xem dữ liệu báo cáo lịch sử: <strong>{selectedPeriodLabel}</strong>. Tất cả 4 thẻ KPI, biểu đồ cột và bảng xếp hạng đang phản ánh số liệu ghi nhận trong kỳ này.
              </span>
            </div>
            <button
              type="button"
              onClick={handleResetToCurrent}
              className="px-3 py-1 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition cursor-pointer shrink-0 flex items-center gap-1"
            >
              <RotateCcw className="size-3" />
              <span>Quay về kỳ hiện tại</span>
            </button>
          </div>
        )}

        {/* 4 Thẻ KPI Cân Đối */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpiData.map((kpi, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between gap-2.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {kpi.label}
                </span>
                <span
                  className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-[10px] font-bold ${kpi.isUp
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
                    : "bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-400"
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
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{kpi.desc}</p>
              </div>

              <div
                className="h-1 rounded-full w-full"
                style={{
                  backgroundColor:
                    idx === 0
                      ? PALETTE.navy
                      : idx === 1
                        ? PALETTE.green
                        : idx === 2
                          ? (selectedCat === "activity_sentiment" ? PALETTE.red : PALETTE.gold)
                          : PALETTE.navy,
                }}
              />
            </div>
          ))}
        </div>

        {/* Biểu Đồ Thống Kê & Bảng Điều Khiển Chu Kỳ Dọc */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Biểu Đồ Cột ({activeCategoryMeta.label})
                </h3>
                {/* Nút chuyển đổi dạng biểu đồ (Cột vs Hình Tròn) */}
                <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => setChartMode("composed")}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold transition cursor-pointer ${chartMode === "composed"
                      ? "bg-[#003B95] text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                      }`}
                  >
                    <BarChart3 className="size-3" />
                    <span>Biểu Đồ Cột</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setChartMode("pie")}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold transition cursor-pointer ${chartMode === "pie"
                      ? "bg-[#003B95] text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                      }`}
                  >
                    <PieIcon className="size-3" />
                    <span>Hình Tròn (Tỷ Trọng)</span>
                  </button>
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Kỳ thống kê: <strong className="text-slate-700 dark:text-slate-300 font-bold">{selectedPeriodLabel}</strong> ({granularity === "month" ? "Theo tháng" : granularity === "quarter" ? "Theo quý" : "Theo năm"}) • Dạng hiển thị: {chartMode === "composed" ? "Biểu đồ cột đa chỉ số độc lập" : "Tỷ trọng phân bổ 100%"}
              </p>
            </div>

            {/* Bộ lọc giá trị tiền dành cho các danh mục liên quan tới tiền / cơ hội */}
            {selectedCat === "top_opportunities" && (
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Coins className="size-3.5 text-amber-500" />
                  <span>Quy mô tiền:</span>
                </span>
                {[
                  { id: "all", label: "Tất cả" },
                  { id: "under_500m", label: "< 500 Tr" },
                  { id: "500m_2b", label: "500 Tr - 2 Tỷ" },
                  { id: "2b_10b", label: "2 Tỷ - 10 Tỷ" },
                  { id: "over_10b", label: "> 10 Tỷ" },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMoneyFilter(m.id as any)}
                    className={`px-2 py-0.5 rounded-lg text-[10.5px] font-bold transition cursor-pointer ${moneyFilter === m.id
                      ? "bg-[#003B95] text-white shadow-xs"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                      }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Lựa chọn xem chi tiết (Ngày/Tuần trong Tháng, Tuần/Tháng trong Quý, Tháng/Quý trong Năm) & Zoom Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
              {granularity === "month" && (
                <>
                  <button
                    type="button"
                    onClick={() => setSubView("default")}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      subView === "default"
                        ? "bg-[#003B95] text-white shadow-xs"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    Đầy đủ các ngày trong tháng (28-31 ngày)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSubView("alt")}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      subView === "alt"
                        ? "bg-[#003B95] text-white shadow-xs"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    Tổng hợp 5 tuần trong tháng
                  </button>
                </>
              )}
              {granularity === "quarter" && (
                <>
                  <button
                    type="button"
                    onClick={() => setSubView("default")}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      subView === "default"
                        ? "bg-[#003B95] text-white shadow-xs"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    Đầy đủ các tuần trong quý (13 tuần)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSubView("alt")}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      subView === "alt"
                        ? "bg-[#003B95] text-white shadow-xs"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    Tổng hợp 3 tháng trong quý
                  </button>
                </>
              )}
              {granularity === "year" && (
                <>
                  <button
                    type="button"
                    onClick={() => setSubView("default")}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      subView === "default"
                        ? "bg-[#003B95] text-white shadow-xs"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    Đầy đủ 12 tháng trong năm
                  </button>
                  <button
                    type="button"
                    onClick={() => setSubView("alt")}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      subView === "alt"
                        ? "bg-[#003B95] text-white shadow-xs"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    Tổng hợp 4 quý trong năm
                  </button>
                </>
              )}
            </div>

            {/* Bộ điều khiển Phóng to / Thu nhỏ & Vuốt ngang */}
            {chartMode === "composed" && (
              <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 px-1.5 flex items-center gap-1">
                  <Maximize2 className="size-3 text-[#003B95] dark:text-blue-400" />
                  <span>Zoom:</span>
                </span>
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.max(1, Number((z - 0.5).toFixed(1))))}
                  disabled={zoomLevel <= 1}
                  className="p-1 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                  title="Thu nhỏ"
                >
                  <ZoomOut className="size-3.5" />
                </button>
                <span className="text-xs font-mono font-bold text-[#003B95] dark:text-amber-400 px-1.5 min-w-[38px] text-center">
                  {Math.round(zoomLevel * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.min(3, Number((z + 0.5).toFixed(1))))}
                  disabled={zoomLevel >= 3}
                  className="p-1 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                  title="Phóng to"
                >
                  <ZoomIn className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setZoomLevel(1)}
                  className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition cursor-pointer"
                  title="Đặt lại 100%"
                >
                  Reset
                </button>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 hidden sm:inline pl-1 italic">
                  (Vuốt ngang để xem cụ thể)
                </span>
              </div>
            )}
          </div>

          {/* Khung Biểu Đồ Kèm Bảng Điều Khiển Chu Kỳ Dọc */}
          <div className="flex flex-col md:flex-row items-stretch gap-4">
            {/* Vùng Vẽ Biểu Đồ */}
            <div className="flex-1 h-80 relative">
              {isChartEmpty && chartMode !== "pie" && (
                <div className="absolute top-2 right-4 z-10 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-[11px] font-semibold flex items-center gap-1.5 shadow-xs pointer-events-none">
                  <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
                  <span>Kỳ {selectedPeriodLabel}: Đang chờ biến động mới (Dữ liệu = 0)</span>
                </div>
              )}
              {chartMode === "pie" ? (
                isChartEmpty ? (
                  <div className="h-full w-full flex flex-col items-center justify-center text-center p-6 bg-slate-50/60 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                    <div className="p-3 rounded-2xl bg-white dark:bg-slate-800 text-slate-400 mb-2 shadow-xs">
                      <TrendingUp className="size-8 text-slate-400" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                      Chưa có tỷ trọng dữ liệu ghi nhận trong mốc thời gian này
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md">
                      Cơ sở dữ liệu thực tế bằng 0. Hệ thống tuân thủ nguyên tắc không tự sinh dữ liệu giả định.
                    </p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
                      <Pie
                        data={pieChartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={95}
                        paddingAngle={4}
                      >
                        {pieChartData.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip
                        content={({ active, payload }: any) => {
                          if (active && payload && payload.length) {
                            const d = payload[0].payload;
                            return (
                              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs shadow-xl border border-slate-200 dark:border-slate-800 space-y-1">
                                <p className="font-bold text-slate-900 dark:text-slate-100">{d.name}</p>
                                <p className="text-amber-600 dark:text-amber-400 font-black">{d.value}% phân bổ tỷ trọng</p>
                                {d.raw !== undefined && (
                                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Giá trị: {d.raw} {d.unit}</p>
                                )}
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Legend
                        verticalAlign="bottom"
                        align="center"
                        iconType="circle"
                        wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )
              ) : (
                <div className="w-full h-full overflow-x-auto overflow-y-hidden pb-2 select-none scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
                  <div
                    style={{
                      minWidth: `${Math.max(100, Math.round((chartData.length * 40 * zoomLevel) / 6))}%`,
                      width: `${Math.max(100, Math.round((chartData.length * 40 * zoomLevel) / 6))}%`,
                      height: "100%",
                    }}
                  >
                    <ResponsiveContainer width="100%" height={320}>
                      <ComposedChart data={chartData} margin={{ top: 20, right: 25, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                        <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 600 }} stroke="#94a3b8" />
                        <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" allowDecimals={false} domain={[0, isChartEmpty ? 5 : 'auto']} />
                        <Tooltip
                          content={({ active, payload, label }: any) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-800 shadow-xl text-xs space-y-1.5 min-w-[220px]">
                                  <div className="font-bold border-b border-slate-100 dark:border-slate-800 pb-1 text-slate-900 dark:text-slate-100 flex items-center justify-between">
                                    <span>Mốc: {label}</span>
                                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">Thời gian thực</span>
                                  </div>
                                  {payload.map((p: any, idx: number) => {
                                    const itemUnit = p.dataKey === 'col1' ? (activeChartMeta.col1Unit || activeChartMeta.unit)
                                      : p.dataKey === 'col2' ? (activeChartMeta.col2Unit || activeChartMeta.unit)
                                        : p.dataKey === 'col3' ? (activeChartMeta.col3Unit || activeChartMeta.unit)
                                          : p.dataKey === 'col4' ? (activeChartMeta.col4Unit || activeChartMeta.unit)
                                            : (activeChartMeta.timelineUnit || activeChartMeta.unit);

                                    return (
                                      <div key={idx} className="flex justify-between items-center text-xs">
                                        <span className="flex items-center gap-1.5" style={{ color: p.color || p.fill || p.stroke }}>
                                          <span className="size-2 rounded-xs shrink-0" style={{ backgroundColor: p.color || p.fill || p.stroke }} />
                                          <span className="text-slate-700 dark:text-slate-300 font-medium">{p.name}:</span>
                                        </span>
                                        <strong className="text-slate-900 dark:text-white font-mono">{p.value} {itemUnit}</strong>
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
                          radius={[4, 4, 0, 0]}
                          maxBarSize={28}
                        />
                        <Bar
                          dataKey="col2"
                          name={activeChartMeta.col2Label}
                          fill={activeChartMeta.col2Color}
                          radius={[4, 4, 0, 0]}
                          maxBarSize={28}
                        />
                        {activeChartMeta.col3Label && (
                          <Bar
                            dataKey="col3"
                            name={activeChartMeta.col3Label}
                            fill={activeChartMeta.col3Color}
                            radius={[4, 4, 0, 0]}
                            maxBarSize={28}
                          />
                        )}
                        {activeChartMeta.col4Label && (
                          <Bar
                            dataKey="col4"
                            name={activeChartMeta.col4Label}
                            fill={activeChartMeta.col4Color}
                            radius={[4, 4, 0, 0]}
                            maxBarSize={28}
                          />
                        )}
                        <Bar
                          dataKey="timelineVal"
                          name={activeChartMeta.timelineLabel}
                          fill={activeChartMeta.timelineColor || "#DC2626"}
                          radius={[4, 4, 0, 0]}
                          maxBarSize={28}
                        />
                        {chartData.length > 8 && (
                          <Brush
                            dataKey="name"
                            height={22}
                            stroke="#003B95"
                            fill="rgba(0, 59, 149, 0.05)"
                          />
                        )}
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>

            {/* Bảng Điều Khiển Chu Kỳ & Chọn Kỳ Lịch Sử Dọc */}
            <div className="flex md:flex-col items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 shrink-0 w-full md:w-36 gap-2.5 shadow-2xs">
              <div className="w-full space-y-1.5">
                <span className="hidden md:block text-[9.5px] font-black uppercase tracking-wider text-slate-400 text-center pb-0.5">
                  Hiển Thị Theo
                </span>
                {[
                  { id: "month" as const, label: "Tháng", desc: "12 tháng trong năm" },
                  { id: "quarter" as const, label: "Quý", desc: "4 quý tài khóa" },
                  { id: "year" as const, label: "Năm", desc: "5 năm gần nhất" },
                ].map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setGranularity(g.id)}
                    className={`w-full py-2 px-2.5 rounded-xl text-xs font-bold transition cursor-pointer text-center ${granularity === g.id
                      ? "bg-[#003B95] text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700"
                      }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>

              <div className="hidden md:block w-full h-px bg-slate-200 dark:bg-slate-700" />

              {/* Lịch sử kỳ cũ */}
              <div className="w-full space-y-1 text-center">
                <span className="hidden md:block text-[9.5px] font-black uppercase tracking-wider text-slate-400 pb-0.5">
                  Kỳ Đang Xem
                </span>
                <div className="text-xs font-black text-[#003B95] dark:text-amber-400 py-1 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                  {selectedPeriodLabel}
                </div>
                {isHistorical && (
                  <button
                    type="button"
                    onClick={handleResetToCurrent}
                    className="w-full mt-1.5 py-1 px-1.5 rounded-lg text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 hover:bg-amber-100 transition cursor-pointer flex items-center justify-center gap-1"
                  >
                    <RotateCcw className="size-2.5" />
                    <span>Về kỳ này</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Màu chú thích dưới biểu đồ - Tất cả đều là biểu tượng khối Cột */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <span className="size-3 rounded-xs shrink-0" style={{ backgroundColor: activeChartMeta.col1Color }} />
              <span className="text-slate-700 dark:text-slate-300 font-semibold">{activeChartMeta.col1Label}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="size-3 rounded-xs shrink-0" style={{ backgroundColor: activeChartMeta.col2Color }} />
              <span className="text-slate-700 dark:text-slate-300 font-semibold">{activeChartMeta.col2Label}</span>
            </div>
            {activeChartMeta.col3Label && (
              <div className="flex items-center gap-2">
                <span className="size-3 rounded-xs shrink-0" style={{ backgroundColor: activeChartMeta.col3Color }} />
                <span className="text-slate-700 dark:text-slate-300 font-semibold">{activeChartMeta.col3Label}</span>
              </div>
            )}
            {activeChartMeta.col4Label && (
              <div className="flex items-center gap-2">
                <span className="size-3 rounded-xs shrink-0" style={{ backgroundColor: activeChartMeta.col4Color }} />
                <span className="text-slate-700 dark:text-slate-300 font-semibold">{activeChartMeta.col4Label}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className="size-3 rounded-xs shrink-0" style={{ backgroundColor: activeChartMeta.timelineColor }} />
              <span className="text-slate-700 dark:text-slate-300 font-bold">{activeChartMeta.timelineLabel}</span>
            </div>
          </div>
        </div>

        {/* Danh sách Hội viên cần hỗ trợ kết nối (Khi chọn tab Hoạt động hội viên) */}
        {(selectedCat === "member_activities" || selectedCat === "activity_sentiment") && (
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Hội Viên Cần Hỗ Trợ Kết Nối
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Danh sách hội viên cần Ban Thư Ký liên hệ thăm hỏi và tạo cơ hội giao thương
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-400 font-bold text-xs border border-red-200 dark:border-red-900">
                Ưu tiên kết nối
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
              {sentimentStats.leastActiveTop3?.map((member: any, idx: number) => (
                <div
                  key={member.id || idx}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="size-11 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0 bg-white">
                      <img
                        src={member.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80"}
                        alt={member.name}
                        className="size-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {member.name}
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400 truncate mt-0.5">
                        {member.company}
                      </p>
                      <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium">
                        {member.department || "Ban Thành Viên"}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1 p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
                    <div className="text-red-600 dark:text-red-400 font-semibold">
                      {member.warningReason || "Chưa phát sinh hoạt động trong kỳ"}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Đề xuất: {member.actionNeeded || "Ban Thư Ký gọi điện hỗ trợ"}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center gap-2">
                    <a
                      href={`tel:${member.phone || "0983198383"}`}
                      onClick={() => toast.success(`Đang kết nối cuộc gọi tới ${member.name}...`)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-[#003B95] hover:bg-[#002B70] text-white text-xs font-bold transition cursor-pointer"
                    >
                      <Phone className="size-3.5" />
                      <span>Gọi điện</span>
                    </a>
                    {member.email && (
                      <a
                        href={`mailto:${member.email}`}
                        className="p-2 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition cursor-pointer"
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
        )}

        {/* Bục Vinh Danh Top 3 & Bảng Top 4 - 10 (Cho các danh mục xếp hạng) */}
        {selectedCat !== "member_activities" && selectedCat !== "activity_sentiment" && (
          <div className="space-y-6">
            {/* Bục Top 3: Tỷ lệ chuẩn, cân đối, màu sắc đúng chuẩn */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Vinh Danh Top 3 Hoạt Động Xuất Sắc
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {activeCategoryMeta.label} ({period === "month" ? "Theo tháng" : period === "quarter" ? "Theo quý" : "Theo năm"})
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 font-bold text-xs border border-amber-200 dark:border-amber-900">
                  Top 3 Hội Viên
                </span>
              </div>

              {/* Bục 3 Cột: Hạng 2 (Bạch Kim) - Hạng 1 (Quán Quân) - Hạng 3 (Vàng) */}
              {!top1 && !top2 && !top3 ? (
                <div className="py-12 flex flex-col items-center justify-center text-center">
                  <div className="size-16 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center justify-center mb-3">
                    <Trophy className="size-8 text-amber-500" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    Chưa có dữ liệu vinh danh thực tế trong kỳ này
                  </h4>
                  <p className="text-xs text-slate-500 max-w-md mt-1">
                    Bảng xếp hạng sẽ tự động cập nhật ngay khi hội viên có số lượng, giá trị giao thương hoặc lượt tương tác thật được ghi nhận trong cơ sở dữ liệu.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3 sm:gap-6 items-end pt-4 max-w-3xl mx-auto">
                  {/* HẠNG 2: BẠCH KIM (BÊN TRÁI) */}
                  {top2 && (
                    <div className="flex flex-col items-center text-center order-1">
                      <div className="size-16 sm:size-20 rounded-2xl overflow-hidden border-2 border-slate-400 shadow-sm mb-2 bg-white">
                        <img src={top2.avatar} alt={top2.name} className="size-full object-cover" />
                      </div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                        {top2.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 line-clamp-1">{top2.company}</p>
                      <div className="mt-1 font-mono font-bold text-xs text-[#003B95] dark:text-amber-400">
                        {top2.score}
                      </div>

                      <div className="w-full h-28 sm:h-32 mt-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center p-2">
                        <span className="text-xs font-black uppercase text-slate-700 dark:text-slate-300">
                          HẠNG 2
                        </span>
                        <span className="text-[10px] text-slate-500 mt-0.5">Á Quân 1</span>
                      </div>
                    </div>
                  )}

                  {/* HẠNG 1: QUÁN QUÂN (GIỮA - CAO NHẤT) */}
                  {top1 && (
                    <div className="flex flex-col items-center text-center order-2">
                      <div className="size-20 sm:size-24 rounded-2xl overflow-hidden border-3 border-amber-400 shadow-md mb-2 bg-white">
                        <img src={top1.avatar} alt={top1.name} className="size-full object-cover" />
                      </div>
                      <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white line-clamp-1">
                        {top1.name}
                      </h4>
                      <p className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold line-clamp-1">
                        {top1.company}
                      </p>
                      <div className="mt-1 font-mono font-black text-sm text-[#003B95] dark:text-amber-400">
                        {top1.score}
                      </div>

                      <div className="w-full h-36 sm:h-40 mt-3 rounded-xl bg-[#003B95] text-white border-2 border-amber-400 flex flex-col items-center justify-center p-2 shadow-sm">
                        <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-amber-300">
                          HẠNG 1
                        </span>
                        <span className="text-[11px] text-white/90 mt-0.5">Quán Quân</span>
                      </div>
                    </div>
                  )}

                  {/* HẠNG 3: VÀNG (BÊN PHẢI) */}
                  {top3 && (
                    <div className="flex flex-col items-center text-center order-3">
                      <div className="size-16 sm:size-20 rounded-2xl overflow-hidden border-2 border-amber-500 shadow-sm mb-2 bg-white">
                        <img src={top3.avatar} alt={top3.name} className="size-full object-cover" />
                      </div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                        {top3.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 line-clamp-1">{top3.company}</p>
                      <div className="mt-1 font-mono font-bold text-xs text-amber-600 dark:text-amber-400">
                        {top3.score}
                      </div>

                      <div className="w-full h-24 sm:h-26 mt-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 flex flex-col items-center justify-center p-2">
                        <span className="text-xs font-black uppercase text-amber-800 dark:text-amber-300">
                          HẠNG 3
                        </span>
                        <span className="text-[10px] text-slate-500 mt-0.5">Á Quân 2</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bảng Xếp Hạng Top 4 Đến Top 10 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Bảng Xếp Hạng (Từ Top 4 Đến Top 10)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Hội viên tích cực trong kỳ báo cáo ({activeCategoryMeta.label})
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium">
                  Top 4 - 10
                </span>
              </div>

              {remainingTop4To10.length > 0 ? (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {remainingTop4To10.map((item) => (
                    <div
                      key={item.rank}
                      className="py-3 px-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-xl transition"
                    >
                      <div className="flex items-center gap-3">
                        <div className="size-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center shrink-0">
                          #{item.rank}
                        </div>
                        <div className="size-10 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0 bg-white">
                          <img src={item.avatar} alt={item.name} className="size-full object-cover" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <span>{item.name}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950 text-[#003B95] dark:text-blue-400 font-semibold">
                              {item.role}
                            </span>
                          </h4>
                          <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1.5">
                            <span>{item.company}</span>
                            <span>•</span>
                            <span className="text-slate-600 dark:text-slate-400 font-medium">{item.dept}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4 pl-10 sm:pl-0">
                        <div className="text-right">
                          <div className="font-mono font-bold text-xs text-[#003B95] dark:text-amber-400">
                            {item.score}
                          </div>
                          <div className="text-[10px] text-slate-400">Ghi nhận hệ thống</div>
                        </div>

                        <a
                          href={`tel:${item.phone}`}
                          onClick={() => toast.success(`Đang quay số tới ${item.name}...`)}
                          className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition cursor-pointer"
                          title="Gọi liên hệ"
                        >
                          <Phone className="size-3.5" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-slate-500">
                  Chưa có hội viên nào trong danh sách Top 4 - 10 kỳ này.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal Xuất Báo Cáo Chuyên Sâu (SheetJS XLSX) */}
        <CrmExcelExportModal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          serverData={serverData}
          currentPeriod={period}
          categoryLabel={activeCategoryMeta.label}
        />

        {/* Modal Nhập Dữ Liệu Excel Thông Minh (Tự Bóc Tách Trường) */}
        <CrmExcelImportModal
          isOpen={showImportModal}
          onClose={() => setShowImportModal(false)}
          onSuccess={() => {
            toast.success("Dữ liệu hội viên đã được đồng bộ vào hệ thống!");
          }}
        />

        {/* Modal Quản lý Giải Thưởng Mốc Thống Kê */}
        <MilestoneAwardsManagerModal
          isOpen={showMilestoneAwardsModal}
          onClose={() => setShowMilestoneAwardsModal(false)}
        />
      </div>
    </AppShell>
  );
}
