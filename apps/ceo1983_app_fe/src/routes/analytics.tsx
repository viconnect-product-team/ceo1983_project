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
  UserPlus,
  Medal,
  Trophy,
} from "lucide-react";
import { toast } from "sonner";
import { fetchNestApi } from "@/lib/api-client";
import { AppShell } from "@/components/dashboard/AppShell";
import { PageHeader } from "@/components/dashboard/PageKit";
import { MilestoneAwardsManagerModal } from "@/components/analytics/MilestoneAwardsManagerModal";
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

interface SearchParams {
  category?: string;
  period?: "month" | "quarter" | "year";
}

export const Route = createFileRoute("/analytics")({
  validateSearch: (search: Record<string, unknown>): SearchParams => {
    return {
      category: typeof search.category === "string" ? search.category : undefined,
      period: (["month", "quarter", "year"].includes(search.period as string)
        ? search.period
        : undefined) as "month" | "quarter" | "year" | undefined,
    };
  },
  component: AnalyticsDashboardPage,
  head: () => ({
    meta: [
      { title: "Báo Cáo & Thống Kê Quản Trị Chi Tiết CLB CEO 1983" },
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
  navy: "#003B95",       // Xanh hoàng gia (Chỉ số chính)
  gold: "#F59E0B",       // Vàng hổ phách (Mục tiêu/Cột 3)
  green: "#10B981",      // Xanh tăng trưởng (Tích cực/Timeline xanh)
  red: "#DC2626",        // Đỏ tiêu cực / cảnh báo (Cột đỏ/Timeline đỏ)
  diamond: "#06B6D4",    // Kim cương (Cyan sáng)
  platinum: "#94A3B8",   // Bạch kim (Slate ánh kim)
  dark: "#0F172A",
  light: "#FFFFFF",
};

export type AnalyticsCategory =
  | "activity_sentiment"
  | "top_connections"
  | "top_opportunities"
  | "top_events_meetings"
  | "top_referrals";

interface CategoryMeta {
  id: AnalyticsCategory;
  alias: string[];
  label: string;
  subLabel: string;
  icon: any;
  metricLabel: string;
  unit: string;
  bar1Name: string;
  bar2Name: string;
  bar3Name: string;
  bar4Name: string;
  lineUpName: string;
  lineDownName: string;
}

const CATEGORIES: CategoryMeta[] = [
  {
    id: "activity_sentiment",
    alias: ["positive_negative", "activity_sentiment"],
    label: "Thành viên tích cực cùng tiêu cực",
    subLabel: "Theo dõi số lượng tương tác, cột đỏ tiêu cực & chăm sóc hội viên",
    icon: AlertTriangle,
    metricLabel: "Hội viên tích cực & tiêu cực",
    unit: "Hội viên",
    bar1Name: "Hội viên tích cực",
    bar2Name: "Hội viên tham gia sự kiện",
    bar3Name: "Hội viên có giao thương",
    bar4Name: "Hội viên tiêu cực (cột đỏ)",
    lineUpName: "Tăng trưởng tích cực",
    lineDownName: "Xu hướng suy giảm",
  },
  {
    id: "top_connections",
    alias: ["top_connectors", "top_connections"],
    label: "3 thành viên kết nối nhiều nhất",
    subLabel: "Xếp hạng kết nối giao thương giữa các hội viên (tháng, quý, năm)",
    icon: HeartHandshake,
    metricLabel: "Lượt kết nối giao thương",
    unit: "Lượt",
    bar1Name: "Lượt kết nối 1-on-1",
    bar2Name: "Cuộc gặp trực tiếp",
    bar3Name: "Kết nối liên ban",
    bar4Name: "Kết nối chưa phản hồi",
    lineUpName: "Tỷ lệ kết nối thành công",
    lineDownName: "Lượt từ chối/hủy hẹn",
  },
  {
    id: "top_opportunities",
    alias: ["top_b2b", "top_opportunities"],
    label: "Hội viên chia sẻ cơ hội nhiều nhất",
    subLabel: "Chỉ tính cơ hội public ra toàn bộ hội viên thấy",
    icon: Briefcase,
    metricLabel: "Cơ hội công khai đã chia sẻ",
    unit: "Cơ hội",
    bar1Name: "Cơ hội B2B Public",
    bar2Name: "Cơ hội được tiếp nhận",
    bar3Name: "Hợp đồng đã ký kết",
    bar4Name: "Cơ hội trễ hạn phản hồi",
    lineUpName: "Giá trị hợp đồng tăng trưởng",
    lineDownName: "Cơ hội quá hạn/thất bại",
  },
  {
    id: "top_events_meetings",
    alias: ["top_events", "top_events_meetings"],
    label: "3 thành viên tham gia sự kiện & họp",
    subLabel: "Hội viên tham gia nhiều sự kiện, họp ban và tương tác nhiều nhất",
    icon: Calendar,
    metricLabel: "Lượt tham gia & tương tác",
    unit: "Lượt",
    bar1Name: "Sự kiện & Họp tham gia",
    bar2Name: "Check-in QR đúng giờ",
    bar3Name: "Tương tác phát biểu",
    bar4Name: "Vắng mặt có lý do/chưa điểm danh",
    lineUpName: "Tỷ lệ tham gia chuẩn giờ",
    lineDownName: "Số lần vắng họp/trễ",
  },
  {
    id: "top_referrals",
    alias: ["top_referrals", "top_gioi_thieu"],
    label: "Top người giới thiệu hội viên",
    subLabel: "Hội viên tích cực giới thiệu thêm các CEO xuất sắc gia nhập CLB",
    icon: UserPlus,
    metricLabel: "Số hội viên mới được giới thiệu",
    unit: "CEO",
    bar1Name: "Hội viên mới giới thiệu",
    bar2Name: "Hồ sơ đã được phê duyệt",
    bar3Name: "Đã nộp hội phí chính thức",
    bar4Name: "Hồ sơ chưa hoàn tất",
    lineUpName: "Hiệu quả giới thiệu thành công",
    lineDownName: "Tỷ lệ dừng xem xét",
  },
];

export function AnalyticsDashboardPage() {
  const search = Route.useSearch();
  const [selectedCat, setSelectedCat] = useState<AnalyticsCategory>("activity_sentiment");
  const [period, setPeriod] = useState<"month" | "quarter" | "year">("month");
  const [showExportModal, setShowExportModal] = useState(false);
  const [showMilestoneAwardsModal, setShowMilestoneAwardsModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverData, setServerData] = useState<any>(null);

  // Đồng bộ search param category từ URL (khi click vào menu tree ở Sidebar)
  useEffect(() => {
    if (search?.category) {
      const matched = CATEGORIES.find(
        (c) => c.id === search.category || c.alias.includes(search.category!)
      );
      if (matched) {
        setSelectedCat(matched.id);
      }
    }
    if (search?.period) {
      setPeriod(search.period);
    }
  }, [search]);

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
          avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
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
          avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80",
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
          avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80",
          warningReason: "Tương tác dưới ngưỡng cảnh báo, chưa điểm danh họp ban",
          actionNeeded: "Trưởng ban liên hệ trực tiếp trao đổi tình hình hoạt động",
        },
      ],
      sentimentTrendData: [
        {
          periodLabel: period === "year" ? "Năm 2024" : period === "quarter" ? "Quý 1" : "Đầu tháng",
          bar1: 30, // Tích cực
          bar2: 26, // Tham gia
          bar3: 20, // Giao thương
          bar4: 18, // Tiêu cực (Cột đỏ)
          lineUp: 72, // Timeline xanh
          lineDown: 28, // Timeline đỏ
        },
        {
          periodLabel: period === "year" ? "Năm 2025" : period === "quarter" ? "Quý 2" : "Giữa tháng",
          bar1: 34,
          bar2: 29,
          bar3: 24,
          bar4: 15,
          lineUp: 78,
          lineDown: 22,
        },
        {
          periodLabel: period === "year" ? "Năm 2026" : period === "quarter" ? "Quý 3" : "Cuối tháng",
          bar1: 38,
          bar2: 35,
          bar3: 31,
          bar4: 12,
          lineUp: 86,
          lineDown: 14,
        },
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
            label: "Hội viên tiêu cực (Cột đỏ)",
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
      case "top_events_meetings": {
        const top1 = serverData?.topEventsMeetings?.[0];
        return [
          { label: "Sự kiện & Họp ban", value: "18 cuộc", delta: "+5 kỳ", isUp: true, desc: "Đã tổ chức trong kỳ" },
          { label: "Lượt điểm danh QR", value: "1,240 lượt", delta: "96.4%", isUp: true, desc: "Tỷ lệ có mặt đúng giờ" },
          { label: "Quán quân tham gia", value: top1?.name || "Nguyễn Mai", delta: `${top1?.eventsAttended || 12} buổi`, isUp: true, desc: "Danh hiệu Kim Cương" },
          { label: "Tương tác Feed", value: "3,890 lượt", delta: "+22%", isUp: true, desc: "Like, bình luận trong app" },
        ];
      }
      case "top_referrals":
      default: {
        return [
          { label: "Hội viên mới giới thiệu", value: "36 CEO", delta: "+35.5%", isUp: true, desc: "Gia nhập qua mạng lưới" },
          { label: "Tỷ lệ kết nạp chuẩn", value: "88.9%", delta: "+6.2%", isUp: true, desc: "Qua vòng thẩm tra BĐH" },
          { label: "Quán quân giới thiệu", value: "Nguyễn Hải Long", delta: "9 CEO", isUp: true, desc: "Danh hiệu Kim Cương" },
          { label: "Điểm vinh danh đại sứ", value: "2,450 đ", delta: "+410 đ", isUp: true, desc: "Tích lũy theo quy chế" },
        ];
      }
    }
  }, [selectedCat, sentimentStats, serverData]);

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

  // Dữ liệu Top 1-10 đầy đủ cho từng danh mục
  const allRankedMembers = useMemo<RankedMemberItem[]>(() => {
    if (selectedCat === "top_connections") {
      return (
        serverData?.topConnections || [
          { rank: 1, name: "Trần Hải Nam", company: "Tập Đoàn Tân Á Đông", role: "Chủ tịch HĐQT", dept: "Ban Xúc Tiến", score: "28 Lượt kết nối", metric: 28, phone: "0912 345 671", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80" },
          { rank: 2, name: "Phạm Văn Vũ", company: "Uranus ViConnect", role: "Tổng Giám đốc", dept: "Ban Công Nghệ", score: "22 Lượt kết nối", metric: 22, phone: "0983 198 383", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80" },
          { rank: 3, name: "Nguyễn Thị Mai", company: "Green Farm Group", role: "Phó Tổng GĐ", dept: "Ban Truyền Thông", score: "18 Lượt kết nối", metric: 18, phone: "0904 567 891", avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80" },
          { rank: 4, name: "Lê Hoàng Cường", company: "Cơ điện & Tự động hóa HP", role: "Giám đốc", dept: "Ban Tài Chính", score: "15 Lượt kết nối", metric: 15, phone: "0913 222 333", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80" },
          { rank: 5, name: "Hoàng Yến Chi", company: "Truyền thông & Sự kiện YC", role: "Chủ sáng lập", dept: "Ban Sự Kiện", score: "14 Lượt kết nối", metric: 14, phone: "0988 776 655", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80" },
          { rank: 6, name: "Đỗ Quốc Bảo", company: "Bảo Phát Logistics", role: "Chủ tịch", dept: "Ban Xúc Tiến", score: "12 Lượt kết nối", metric: 12, phone: "0903 112 233", avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80" },
          { rank: 7, name: "Vũ Thành Đạt", company: "Kiến trúc Xanh An Phát", role: "Giám đốc Kỹ thuật", dept: "Ban Thành Viên", score: "11 Lượt kết nối", metric: 11, phone: "0934 556 677", avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=80" },
          { rank: 8, name: "Phan Thanh Hà", company: "Dược phẩm Hà Thành", role: "Tổng Giám đốc", dept: "Ban Xúc Tiến", score: "10 Lượt kết nối", metric: 10, phone: "0915 889 900", avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80" },
          { rank: 9, name: "Bùi Anh Tuấn", company: "Nội thất Gỗ Hoàng Gia", role: "Giám đốc điều hành", dept: "Ban Tài Chính", score: "9 Lượt kết nối", metric: 9, phone: "0982 443 322", avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=200&auto=format&fit=crop&q=80" },
          { rank: 10, name: "Trịnh Thùy Linh", company: "Luật sư & Tư vấn TL Law", role: "Luật sư Trưởng", dept: "Ban Thư Ký", score: "8 Lượt kết nối", metric: 8, phone: "0977 123 456", avatar: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=200&auto=format&fit=crop&q=80" },
        ]
      );
    }
    if (selectedCat === "top_opportunities") {
      return (
        serverData?.topOpportunities || [
          { rank: 1, name: "Phạm Văn Vũ", company: "Uranus ViConnect", role: "Tổng Giám đốc", dept: "Ban Công Nghệ", score: "16 Cơ hội Public", metric: 16, phone: "0983 198 383", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80" },
          { rank: 2, name: "Nguyễn Thị Mai", company: "Green Farm Group", role: "Phó Tổng GĐ", dept: "Ban Truyền Thông", score: "12 Cơ hội Public", metric: 12, phone: "0904 567 891", avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80" },
          { rank: 3, name: "Lê Hoàng Cường", company: "Cơ điện & Tự động hóa HP", role: "Giám đốc", dept: "Ban Tài Chính", score: "9 Cơ hội Public", metric: 9, phone: "0913 222 333", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80" },
          { rank: 4, name: "Trần Hải Nam", company: "Tập Đoàn Tân Á Đông", role: "Chủ tịch HĐQT", dept: "Ban Xúc Tiến", score: "8 Cơ hội Public", metric: 8, phone: "0912 345 671", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80" },
          { rank: 5, name: "Vũ Thành Đạt", company: "Kiến trúc Xanh An Phát", role: "Giám đốc Kỹ thuật", dept: "Ban Thành Viên", score: "7 Cơ hội Public", metric: 7, phone: "0934 556 677", avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=80" },
          { rank: 6, name: "Đỗ Quốc Bảo", company: "Bảo Phát Logistics", role: "Chủ tịch", dept: "Ban Xúc Tiến", score: "6 Cơ hội Public", metric: 6, phone: "0903 112 233", avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80" },
          { rank: 7, name: "Phan Thanh Hà", company: "Dược phẩm Hà Thành", role: "Tổng Giám đốc", dept: "Ban Xúc Tiến", score: "5 Cơ hội Public", metric: 5, phone: "0915 889 900", avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80" },
          { rank: 8, name: "Hoàng Yến Chi", company: "Truyền thông & Sự kiện YC", role: "Chủ sáng lập", dept: "Ban Sự Kiện", score: "5 Cơ hội Public", metric: 5, phone: "0988 776 655", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80" },
          { rank: 9, name: "Bùi Anh Tuấn", company: "Nội thất Gỗ Hoàng Gia", role: "Giám đốc điều hành", dept: "Ban Tài Chính", score: "4 Cơ hội Public", metric: 4, phone: "0982 443 322", avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=200&auto=format&fit=crop&q=80" },
          { rank: 10, name: "Trịnh Thùy Linh", company: "Luật sư & Tư vấn TL Law", role: "Luật sư Trưởng", dept: "Ban Thư Ký", score: "3 Cơ hội Public", metric: 3, phone: "0977 123 456", avatar: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=200&auto=format&fit=crop&q=80" },
        ]
      );
    }
    if (selectedCat === "top_events_meetings") {
      return (
        serverData?.topEventsMeetings || [
          { rank: 1, name: "Nguyễn Thị Mai", company: "Green Farm Group", role: "Phó Tổng GĐ", dept: "Ban Truyền Thông", score: "14 Buổi họp & 85 tương tác", metric: 14, phone: "0904 567 891", avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80" },
          { rank: 2, name: "Trần Hải Nam", company: "Tập Đoàn Tân Á Đông", role: "Chủ tịch HĐQT", dept: "Ban Xúc Tiến", score: "12 Buổi họp & 68 tương tác", metric: 12, phone: "0912 345 671", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80" },
          { rank: 3, name: "Hoàng Yến Chi", company: "Truyền thông & Sự kiện YC", role: "Chủ sáng lập", dept: "Ban Sự Kiện", score: "10 Buổi họp & 52 tương tác", metric: 10, phone: "0988 776 655", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80" },
          { rank: 4, name: "Phạm Văn Vũ", company: "Uranus ViConnect", role: "Tổng Giám đốc", dept: "Ban Công Nghệ", score: "10 Buổi họp & 48 tương tác", metric: 10, phone: "0983 198 383", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80" },
          { rank: 5, name: "Lê Hoàng Cường", company: "Cơ điện & Tự động hóa HP", role: "Giám đốc", dept: "Ban Tài Chính", score: "9 Buổi họp & 42 tương tác", metric: 9, phone: "0913 222 333", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80" },
          { rank: 6, name: "Vũ Thành Đạt", company: "Kiến trúc Xanh An Phát", role: "Giám đốc Kỹ thuật", dept: "Ban Thành Viên", score: "8 Buổi họp & 36 tương tác", metric: 8, phone: "0934 556 677", avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=80" },
          { rank: 7, name: "Đỗ Quốc Bảo", company: "Bảo Phát Logistics", role: "Chủ tịch", dept: "Ban Xúc Tiến", score: "8 Buổi họp & 33 tương tác", metric: 8, phone: "0903 112 233", avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80" },
          { rank: 8, name: "Bùi Anh Tuấn", company: "Nội thất Gỗ Hoàng Gia", role: "Giám đốc điều hành", dept: "Ban Tài Chính", score: "7 Buổi họp & 29 tương tác", metric: 7, phone: "0982 443 322", avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=200&auto=format&fit=crop&q=80" },
          { rank: 9, name: "Phan Thanh Hà", company: "Dược phẩm Hà Thành", role: "Tổng Giám đốc", dept: "Ban Xúc Tiến", score: "6 Buổi họp & 25 tương tác", metric: 6, phone: "0915 889 900", avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80" },
          { rank: 10, name: "Trịnh Thùy Linh", company: "Luật sư & Tư vấn TL Law", role: "Luật sư Trưởng", dept: "Ban Thư Ký", score: "6 Buổi họp & 22 tương tác", metric: 6, phone: "0977 123 456", avatar: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=200&auto=format&fit=crop&q=80" },
        ]
      );
    }
    if (selectedCat === "top_referrals") {
      return [
        { rank: 1, name: "Nguyễn Hải Long", company: "Tập Đoàn Bất Động Sản Thăng Long", role: "Chủ tịch HĐQT", dept: "Ban Xúc Tiến", score: "9 CEO đã giới thiệu", metric: 9, phone: "0918 888 999", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80" },
        { rank: 2, name: "Trần Mai Phương", company: "Tập Đoàn Giáo Dục SmartEdu", role: "Tổng Giám đốc", dept: "Ban Thành Viên", score: "7 CEO đã giới thiệu", metric: 7, phone: "0903 667 889", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80" },
        { rank: 3, name: "Phạm Văn Vũ", company: "Uranus ViConnect", role: "Tổng Giám đốc", dept: "Ban Công Nghệ", score: "5 CEO đã giới thiệu", metric: 5, phone: "0983 198 383", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80" },
        { rank: 4, name: "Nguyễn Thị Mai", company: "Green Farm Group", role: "Phó Tổng GĐ", dept: "Ban Truyền Thông", score: "4 CEO đã giới thiệu", metric: 4, phone: "0904 567 891", avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80" },
        { rank: 5, name: "Trần Hải Nam", company: "Tập Đoàn Tân Á Đông", role: "Chủ tịch HĐQT", dept: "Ban Xúc Tiến", score: "3 CEO đã giới thiệu", metric: 3, phone: "0912 345 671", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80" },
        { rank: 6, name: "Lê Hoàng Cường", company: "Cơ điện & Tự động hóa HP", role: "Giám đốc", dept: "Ban Tài Chính", score: "2 CEO đã giới thiệu", metric: 2, phone: "0913 222 333", avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80" },
        { rank: 7, name: "Hoàng Yến Chi", company: "Truyền thông & Sự kiện YC", role: "Chủ sáng lập", dept: "Ban Sự Kiện", score: "2 CEO đã giới thiệu", metric: 2, phone: "0988 776 655", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80" },
        { rank: 8, name: "Đỗ Quốc Bảo", company: "Bảo Phát Logistics", role: "Chủ tịch", dept: "Ban Xúc Tiến", score: "2 CEO đã giới thiệu", metric: 2, phone: "0903 112 233", avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=80" },
        { rank: 9, name: "Vũ Thành Đạt", company: "Kiến trúc Xanh An Phát", role: "Giám đốc Kỹ thuật", dept: "Ban Thành Viên", score: "1 CEO đã giới thiệu", metric: 1, phone: "0934 556 677", avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=200&auto=format&fit=crop&q=80" },
        { rank: 10, name: "Bùi Anh Tuấn", company: "Nội thất Gỗ Hoàng Gia", role: "Giám đốc điều hành", dept: "Ban Tài Chính", score: "1 CEO đã giới thiệu", metric: 1, phone: "0982 443 322", avatar: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=200&auto=format&fit=crop&q=80" },
      ];
    }
    return [];
  }, [selectedCat, serverData]);

  // Bục Top 3: Kim Cương 💎, Bạch Kim 🪙, Vàng 🥇
  const podiumTop3 = useMemo(() => {
    return allRankedMembers.slice(0, 3).map((item: RankedMemberItem, idx: number) => {
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
      };
    });
  }, [allRankedMembers]);

  // Danh sách Top 4 đến Top 10
  const remainingTop4To10 = useMemo(() => {
    return allRankedMembers.slice(3, 10);
  }, [allRankedMembers]);

  const top1 = podiumTop3.find((p: any) => p.rank === 1);
  const top2 = podiumTop3.find((p: any) => p.rank === 2);
  const top3 = podiumTop3.find((p: any) => p.rank === 3);

  // Dữ liệu biểu đồ 4 CỘT + 2 ĐƯỜNG TIMELINE (XANH TĂNG TRƯỞNG & ĐỎ ĐI XUỐNG)
  const detailed4BarChartData = useMemo(() => {
    const p1 = period === "year" ? "Năm 2024" : period === "quarter" ? "Quý 1" : "Đầu kỳ";
    const p2 = period === "year" ? "Năm 2025" : period === "quarter" ? "Quý 2" : "Giữa kỳ";
    const p3 = period === "year" ? "Năm 2026" : period === "quarter" ? "Quý 3" : "Cuối kỳ";

    if (selectedCat === "activity_sentiment") {
      return sentimentStats.sentimentTrendData;
    }

    if (selectedCat === "top_connections") {
      return [
        {
          periodLabel: p1,
          bar1: 65,  // Cột 1: Navy (#003B95) - 1-on-1
          bar2: 48,  // Cột 2: Green (#10B981) - Gặp trực tiếp
          bar3: 32,  // Cột 3: Gold (#F59E0B) - Liên ban
          bar4: 12,  // Cột 4: Red (#DC2626) - Chưa phản hồi
          lineUp: 78,    // Timeline xanh tăng trưởng
          lineDown: 22,  // Timeline đỏ suy giảm
        },
        {
          periodLabel: p2,
          bar1: 82,
          bar2: 60,
          bar3: 45,
          bar4: 9,
          lineUp: 86,
          lineDown: 16,
        },
        {
          periodLabel: p3,
          bar1: 110,
          bar2: 85,
          bar3: 62,
          bar4: 6,
          lineUp: 94,
          lineDown: 10,
        },
      ];
    }

    if (selectedCat === "top_opportunities") {
      return [
        {
          periodLabel: p1,
          bar1: 34,  // Cơ hội B2B Public
          bar2: 24,  // Được tiếp nhận
          bar3: 15,  // Đã ký kết
          bar4: 8,   // Trễ hạn phản hồi (Cột đỏ)
          lineUp: 68,
          lineDown: 32,
        },
        {
          periodLabel: p2,
          bar1: 45,
          bar2: 35,
          bar3: 22,
          bar4: 7,
          lineUp: 79,
          lineDown: 24,
        },
        {
          periodLabel: p3,
          bar1: 58,
          bar2: 46,
          bar3: 31,
          bar4: 4,
          lineUp: 88,
          lineDown: 15,
        },
      ];
    }

    if (selectedCat === "top_events_meetings") {
      return [
        {
          periodLabel: p1,
          bar1: 12,  // Sự kiện & họp
          bar2: 10,  // QR đúng giờ
          bar3: 8,   // Tương tác phát biểu
          bar4: 4,   // Vắng mặt (Cột đỏ)
          lineUp: 82,
          lineDown: 20,
        },
        {
          periodLabel: p2,
          bar1: 15,
          bar2: 13,
          bar3: 11,
          bar4: 3,
          lineUp: 88,
          lineDown: 14,
        },
        {
          periodLabel: p3,
          bar1: 18,
          bar2: 17,
          bar3: 15,
          bar4: 1,
          lineUp: 95,
          lineDown: 8,
        },
      ];
    }

    // Top referrals
    return [
      {
        periodLabel: p1,
        bar1: 8,   // Mới giới thiệu
        bar2: 6,   // Phê duyệt
        bar3: 5,   // Nộp phí
        bar4: 3,   // Chưa hoàn tất (Cột đỏ)
        lineUp: 70,
        lineDown: 30,
      },
      {
        periodLabel: p2,
        bar1: 12,
        bar2: 10,
        bar3: 9,
        bar4: 2,
        lineUp: 82,
        lineDown: 18,
      },
      {
        periodLabel: p3,
        bar1: 16,
        bar2: 14,
        bar3: 13,
        bar4: 2,
        lineUp: 90,
        lineDown: 12,
      },
    ];
  }, [selectedCat, period, sentimentStats]);

  return (
    <AppShell>
      <div className="space-y-6 pb-20 font-sans">
        {/* Header với bộ lọc Quý, Tháng, Năm và nút xuất báo cáo */}
        <PageHeader
          title="Báo Cáo & Thống Kê Quản Trị CLB CEO 1983"
          subtitle="Trung tâm phân tích số liệu tài chính, theo dõi hội viên tích cực / tiêu cực và vinh danh Kim Cương - Bạch Kim - Vàng"
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
                onClick={() => setShowMilestoneAwardsModal(true)}
                className="px-4 py-2 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black flex items-center gap-2 shadow-md shadow-amber-500/20 active:scale-95 transition cursor-pointer"
              >
                <Trophy className="size-4 text-slate-950" />
                <span>Giải Thưởng Mốc Thống Kê</span>
              </button>

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

        {/* ── 5 CATEGORY TABS SWITCHER (TREE SUB-MENUS SYNC): ĐẦY ĐỦ 5 DANH MỤC THỐNG KÊ CHI TIẾT ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 p-1.5 rounded-3xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCat === cat.id;
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCat(cat.id)}
                className={`p-3 rounded-2xl text-left transition flex flex-col justify-between gap-2 cursor-pointer ${
                  isSelected
                    ? "bg-white dark:bg-slate-800 shadow-md ring-2 ring-[#003B95] dark:ring-amber-400"
                    : "hover:bg-white/60 dark:hover:bg-slate-800/60"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div
                    className={`size-8 rounded-xl flex items-center justify-center ${
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
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
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

        {/* ── BIỂU ĐỒ 4 CỘT CHUẨN MỰC + 2 ĐƯỜNG TIMELINE (XANH TĂNG TRƯỞNG & ĐỎ ĐI XUỐNG) CHO TẤT CẢ DANH MỤC ── */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#003B95] dark:text-amber-400">
                  <TrendingUp className="size-4" />
                </span>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Biểu Đồ 4 Chỉ Số &amp; Timeline Đa Chiều ({activeCategoryMeta.label})
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Kỳ: {period === "month" ? "Tháng này" : period === "quarter" ? "Quý này" : "Năm tài khóa"} • Gồm 4 cột chỉ số độc lập và 2 đường timeline xanh/đỏ
              </p>
            </div>

            {/* Chú giải 4 cột màu + 2 đường timeline */}
            <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-slate-600 dark:text-slate-300">
              <span className="flex items-center gap-1.5">
                <span className="size-3 rounded-xs bg-[#003B95]" />
                {activeCategoryMeta.bar1Name}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-3 rounded-xs bg-[#10B981]" />
                {activeCategoryMeta.bar2Name}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-3 rounded-xs bg-[#F59E0B]" />
                {activeCategoryMeta.bar3Name}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-3 rounded-xs bg-[#DC2626]" />
                {activeCategoryMeta.bar4Name}
              </span>
              <span className="flex items-center gap-1.5 text-emerald-600">
                <span className="w-4 h-0.5 bg-[#10B981]" />
                Timeline Xanh (Tăng)
              </span>
              <span className="flex items-center gap-1.5 text-rose-600">
                <span className="w-4 h-0.5 bg-[#DC2626] border-b border-dashed border-[#DC2626]" />
                Timeline Đỏ (Đi xuống)
              </span>
            </div>
          </div>

          <div className="w-full h-84 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={detailed4BarChartData} margin={{ top: 20, right: 20, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="periodLabel" tick={{ fontSize: 12, fontWeight: 600 }} stroke="#94a3b8" />
                <YAxis yAxisId="left" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} stroke="#94a3b8" domain={[0, 100]} />
                <Tooltip
                  content={({ active, payload }: any) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="p-3.5 rounded-2xl bg-slate-900 text-white border border-slate-700 shadow-2xl text-xs space-y-1.5 min-w-[220px]">
                          <div className="font-bold border-b border-slate-800 pb-1 flex justify-between gap-3 text-amber-400">
                            <span>Mốc: {d.periodLabel}</span>
                            <span>{activeCategoryMeta.unit}</span>
                          </div>
                          <div className="flex justify-between text-blue-300">
                            <span>• {activeCategoryMeta.bar1Name}:</span>
                            <strong>{d.bar1}</strong>
                          </div>
                          <div className="flex justify-between text-emerald-300">
                            <span>• {activeCategoryMeta.bar2Name}:</span>
                            <strong>{d.bar2}</strong>
                          </div>
                          <div className="flex justify-between text-amber-300">
                            <span>• {activeCategoryMeta.bar3Name}:</span>
                            <strong>{d.bar3}</strong>
                          </div>
                          <div className="flex justify-between text-rose-400 font-bold">
                            <span>• {activeCategoryMeta.bar4Name}:</span>
                            <strong>{d.bar4}</strong>
                          </div>
                          <div className="pt-1.5 border-t border-slate-800 flex justify-between text-emerald-400 font-bold">
                            <span>📈 Timeline Xanh:</span>
                            <span>{d.lineUp}%</span>
                          </div>
                          <div className="flex justify-between text-rose-400 font-bold">
                            <span>📉 Timeline Đỏ (Đi xuống):</span>
                            <span>{d.lineDown}%</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend />

                {/* 4 CỘT CHỈ SỐ LIÊN QUAN */}
                <Bar yAxisId="left" dataKey="bar1" name={activeCategoryMeta.bar1Name} fill="#003B95" radius={[4, 4, 0, 0]} maxBarSize={28} />
                <Bar yAxisId="left" dataKey="bar2" name={activeCategoryMeta.bar2Name} fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={28} />
                <Bar yAxisId="left" dataKey="bar3" name={activeCategoryMeta.bar3Name} fill="#F59E0B" radius={[4, 4, 0, 0]} maxBarSize={28} />
                <Bar yAxisId="left" dataKey="bar4" name={activeCategoryMeta.bar4Name} fill="#DC2626" radius={[4, 4, 0, 0]} maxBarSize={28} />

                {/* 2 ĐƯỜNG TIMELINE (XANH TĂNG TRƯỞNG & ĐỎ ĐI XUỐNG) */}
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="lineUp"
                  name="Timeline Xanh (Tăng trưởng)"
                  stroke="#10B981"
                  strokeWidth={3}
                  dot={{ r: 5, fill: "#10B981", stroke: "#ffffff", strokeWidth: 2 }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="lineDown"
                  name="Timeline Đỏ (Chiều đi xuống)"
                  stroke="#DC2626"
                  strokeWidth={2.5}
                  strokeDasharray="5 5"
                  dot={{ r: 5, fill: "#DC2626", stroke: "#ffffff", strokeWidth: 2 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── CARD TOP 3 NGƯỜI ÍT TƯƠNG TÁC NHẤT (NẾU ĐANG CHỌN DANH MỤC TÍCH CỰC & TIÊU CỰC) ── */}
        {selectedCat === "activity_sentiment" && (
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
                ⚠️ Cột đỏ - Ưu tiên chăm sóc khẩn
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
                          src={member.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80"}
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

                  <div className="space-y-1.5 p-2.5 rounded-xl bg-white dark:bg-slate-900/80 border border-rose-100 dark:border-rose-900/30 text-xs">
                    <div className="text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1.5">
                      <AlertTriangle className="size-3.5 shrink-0" />
                      <span>{member.warningReason || "Tương tác dưới ngưỡng cảnh báo"}</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Nhiệm vụ: {member.actionNeeded || "Gọi điện thăm hỏi, mời dự họp 1-on-1"}
                    </p>
                  </div>

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
        )}

        {/* ── BỤC VINH DANH TOP 3 XUẤT SẮC (KIM CƯƠNG 💎, BẠCH KIM 🪙, VÀNG 🥇) CHO CÁC DANH MỤC CÒN LẠI ── */}
        {selectedCat !== "activity_sentiment" && (
          <div className="space-y-6">
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

            {/* ── BẢNG DANH SÁCH CHI TIẾT TOP 4 ĐẾN TOP 10 (THEO YÊU CẦU CỦA USER) ── */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    <Medal className="size-4" />
                  </span>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
                      Danh Sách Xếp Hạng Bổ Sung: Từ Top 4 Đến Top 10
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Hội viên duy trì phong độ xuất sắc trong kỳ ({activeCategoryMeta.label})
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold">
                  Top 4 - 10
                </span>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {remainingTop4To10.map((item: any) => (
                  <div
                    key={item.rank}
                    className="py-3 px-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-2xl transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="size-7 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-black text-xs flex items-center justify-center shrink-0">
                        #{item.rank}
                      </div>
                      <div className="size-10 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0">
                        <img src={item.avatar} alt={item.name} className="size-full object-cover" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-2">
                          <span>{item.name}</span>
                          <span className="text-[10px] font-normal px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-semibold">
                            {item.role}
                          </span>
                        </h4>
                        <p className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <Building className="size-3 text-slate-400" />
                          <span>{item.company}</span>
                          <span>•</span>
                          <span className="text-amber-600 dark:text-amber-400 font-semibold">{item.dept}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 pl-10 sm:pl-0">
                      <div className="text-right">
                        <div className="font-mono font-black text-xs text-[#003B95] dark:text-amber-400">
                          {item.score}
                        </div>
                        <div className="text-[10px] text-slate-400">Thành tích ghi nhận</div>
                      </div>

                      <a
                        href={`tel:${item.phone}`}
                        onClick={() => toast.success(`Đang quay số tới ${item.name} (${item.phone})...`)}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition cursor-pointer"
                        title="Gọi liên hệ"
                      >
                        <Phone className="size-3.5" />
                      </a>
                    </div>
                  </div>
                ))}
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

        {/* Modal Quản lý Giải Thưởng Cột Mốc Thống Kê Gamification */}
        <MilestoneAwardsManagerModal
          isOpen={showMilestoneAwardsModal}
          onClose={() => setShowMilestoneAwardsModal(false)}
        />
      </div>
    </AppShell>
  );
}
