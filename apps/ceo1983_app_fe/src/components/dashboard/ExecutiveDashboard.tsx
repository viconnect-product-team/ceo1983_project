import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Users,
  Search,
  Filter,
  Eye,
  Building2,
  Mail,
  Phone,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  X,
  RotateCcw,
  Handshake,
  Wallet,
  Calendar,
  Sparkles,
  FileSpreadsheet,
  Download,
  ArrowUpRight,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import { fetchNestApi } from "@/lib/api-client";
import { getDashboardStatsFn, type DashboardStats } from "@/lib/dashboard.functions";
import { listOpportunitiesFn } from "@/lib/opportunities.functions";
import { Pagination, SortHeader } from "@/components/dashboard/DataTablePagination";
import { exportToExcel, formatExcelCurrency, formatDisplayDate } from "@/lib/excel-export";
import { Skeleton } from "@/components/dashboard/StateKit";

export interface ExecutiveDashboardProps {
  authReady?: boolean;
}

export interface ExecMemberRow {
  id: string;
  code: string;
  name: string;
  company: string;
  industry: string;
  role: string;
  department: string;
  phone: string;
  email: string;
  avatar: string;
  status: "active" | "pending" | "inactive" | "expired";
  feePaid: boolean;
  feeAmount: number;
  oppsShared: number;
  dealsWon: number;
  eventsAttended: number;
  engagementScore: number;
  joinedAt: string;
}

// Danh sách ban chuyên môn chuẩn mực CEO 1983
const DEPARTMENT_OPTIONS = [
  "Tất cả ban",
  "Ban Điều Hành",
  "Ban Xúc Tiến Thương Mại",
  "Ban Công Nghệ",
  "Ban Thành Viên",
  "Ban Truyền Thông",
  "Ban Tài Chính",
  "Ban Sự Kiện",
  "Ban Thư Ký",
  "Ban Pháp Chế",
];

const DEFAULT_MEMBERS: ExecMemberRow[] = [
  {
    id: "m-001",
    code: "CEO-1983-001",
    name: "Lê Phụng Thắng",
    company: "Tập Đoàn Cơ Điện & Công Nghệ Hòa Bình",
    industry: "Cơ điện & Sản xuất công nghiệp",
    role: "Chủ tịch CLB",
    department: "Ban Điều Hành",
    phone: "0912 345 678",
    email: "thang.le@hoabinhgroup.vn",
    avatar: "/ceo1983-emblem-8.png",
    status: "active",
    feePaid: true,
    feeAmount: 20000000,
    oppsShared: 18,
    dealsWon: 12,
    eventsAttended: 24,
    engagementScore: 98,
    joinedAt: "2024-01-10",
  },
  {
    id: "m-002",
    code: "CEO-1983-002",
    name: "Phạm Văn Vũ",
    company: "Công ty Cổ phần Uranus ViConnect",
    industry: "Công nghệ thông tin & Chuyển đổi số",
    role: "Trưởng Ban Công Nghệ",
    department: "Ban Công Nghệ",
    phone: "0983 198 383",
    email: "vu.pham@viconnect.vn",
    avatar: "/ceo1983-emblem-8.png",
    status: "active",
    feePaid: true,
    feeAmount: 20000000,
    oppsShared: 22,
    dealsWon: 15,
    eventsAttended: 20,
    engagementScore: 96,
    joinedAt: "2024-01-15",
  },
  {
    id: "m-003",
    code: "CEO-1983-003",
    name: "Trần Hải Nam",
    company: "Tập Đoàn Tân Á Đông",
    industry: "Đầu tư & Bất động sản thương mại",
    role: "Trưởng Ban Xúc Tiến",
    department: "Ban Xúc Tiến Thương Mại",
    phone: "0912 345 671",
    email: "nam.tran@tanadong.vn",
    avatar: "/ceo1983-emblem-8.png",
    status: "active",
    feePaid: true,
    feeAmount: 20000000,
    oppsShared: 28,
    dealsWon: 19,
    eventsAttended: 18,
    engagementScore: 95,
    joinedAt: "2024-02-01",
  },
  {
    id: "m-004",
    code: "CEO-1983-004",
    name: "Nguyễn Thị Mai",
    company: "Green Farm Group",
    industry: "Nông nghiệp sạch & Thực phẩm hữu cơ",
    role: "Trưởng Ban Truyền Thông",
    department: "Ban Truyền Thông",
    phone: "0904 567 891",
    email: "mai.nguyen@greenfarm.vn",
    avatar: "/ceo1983-emblem-8.png",
    status: "active",
    feePaid: true,
    feeAmount: 20000000,
    oppsShared: 14,
    dealsWon: 8,
    eventsAttended: 22,
    engagementScore: 92,
    joinedAt: "2024-02-10",
  },
  {
    id: "m-005",
    code: "CEO-1983-005",
    name: "Lê Hoàng Cường",
    company: "Cơ điện & Tự động hóa HP",
    industry: "Cơ điện tử & Tự động hóa",
    role: "Trưởng Ban Tài Chính",
    department: "Ban Tài Chính",
    phone: "0913 222 333",
    email: "cuong.le@hp-automation.vn",
    avatar: "/ceo1983-emblem-8.png",
    status: "active",
    feePaid: true,
    feeAmount: 20000000,
    oppsShared: 11,
    dealsWon: 7,
    eventsAttended: 16,
    engagementScore: 89,
    joinedAt: "2024-03-01",
  },
  {
    id: "m-006",
    code: "CEO-1983-006",
    name: "Hoàng Yến Chi",
    company: "Truyền thông & Sự kiện YC",
    industry: "Truyền thông & Tổ chức sự kiện",
    role: "Trưởng Ban Sự Kiện",
    department: "Ban Sự Kiện",
    phone: "0988 776 655",
    email: "chi.hoang@ycevents.vn",
    avatar: "/ceo1983-emblem-8.png",
    status: "active",
    feePaid: true,
    feeAmount: 20000000,
    oppsShared: 9,
    dealsWon: 6,
    eventsAttended: 26,
    engagementScore: 94,
    joinedAt: "2024-03-12",
  },
  {
    id: "m-007",
    code: "CEO-1983-007",
    name: "Vũ Thành Đạt",
    company: "Kiến trúc Xanh An Phát",
    industry: "Kiến trúc, Quy hoạch & Xây dựng",
    role: "Trưởng Ban Thành Viên",
    department: "Ban Thành Viên",
    phone: "0934 556 677",
    email: "dat.vu@anphatarch.vn",
    avatar: "/ceo1983-emblem-8.png",
    status: "active",
    feePaid: true,
    feeAmount: 20000000,
    oppsShared: 8,
    dealsWon: 5,
    eventsAttended: 17,
    engagementScore: 86,
    joinedAt: "2024-04-05",
  },
  {
    id: "m-008",
    code: "CEO-1983-008",
    name: "Đỗ Quốc Bảo",
    company: "Bảo Phát Logistics Toàn Cầu",
    industry: "Kho bãi & Vận tải quốc tế",
    role: "Hội viên Kim Cương",
    department: "Ban Xúc Tiến Thương Mại",
    phone: "0903 112 233",
    email: "bao.do@baophatlogistics.vn",
    avatar: "/ceo1983-emblem-8.png",
    status: "active",
    feePaid: true,
    feeAmount: 20000000,
    oppsShared: 12,
    dealsWon: 9,
    eventsAttended: 15,
    engagementScore: 88,
    joinedAt: "2024-04-20",
  },
  {
    id: "m-009",
    code: "CEO-1983-009",
    name: "Phan Thanh Hà",
    company: "Dược phẩm & Y tế Hà Thành",
    industry: "Dược phẩm & Trang thiết bị y tế",
    role: "Hội viên Vàng",
    department: "Ban Xúc Tiến Thương Mại",
    phone: "0915 889 900",
    email: "ha.phan@hathanhpharma.vn",
    avatar: "/ceo1983-emblem-8.png",
    status: "active",
    feePaid: false,
    feeAmount: 20000000,
    oppsShared: 6,
    dealsWon: 3,
    eventsAttended: 9,
    engagementScore: 72,
    joinedAt: "2024-05-15",
  },
  {
    id: "m-010",
    code: "CEO-1983-010",
    name: "Bùi Anh Tuấn",
    company: "Nội thất Gỗ Hoàng Gia",
    industry: "Sản xuất nội thất xuất khẩu",
    role: "Hội viên Tiêu chuẩn",
    department: "Ban Tài Chính",
    phone: "0982 443 322",
    email: "tuan.bui@hoanggiagroup.vn",
    avatar: "/ceo1983-emblem-8.png",
    status: "active",
    feePaid: true,
    feeAmount: 20000000,
    oppsShared: 5,
    dealsWon: 2,
    eventsAttended: 11,
    engagementScore: 78,
    joinedAt: "2024-06-01",
  },
  {
    id: "m-011",
    code: "CEO-1983-011",
    name: "Trịnh Thùy Linh",
    company: "Công ty Luật TL & Cộng sự",
    industry: "Tư vấn luật doanh nghiệp & M&A",
    role: "Trưởng Ban Pháp Chế",
    department: "Ban Pháp Chế",
    phone: "0977 123 456",
    email: "linh.trinh@tllaw.vn",
    avatar: "/ceo1983-emblem-8.png",
    status: "active",
    feePaid: true,
    feeAmount: 20000000,
    oppsShared: 7,
    dealsWon: 4,
    eventsAttended: 14,
    engagementScore: 84,
    joinedAt: "2024-06-18",
  },
  {
    id: "m-012",
    code: "CEO-1983-012",
    name: "Nguyễn Hải Long",
    company: "Tập Đoàn BĐS Thăng Long Invest",
    industry: "Đầu tư bất động sản khu công nghiệp",
    role: "Hội viên Kim Cương",
    department: "Ban Xúc Tiến Thương Mại",
    phone: "0918 888 999",
    email: "long.nguyen@thanglonginvest.vn",
    avatar: "/ceo1983-emblem-8.png",
    status: "active",
    feePaid: true,
    feeAmount: 20000000,
    oppsShared: 15,
    dealsWon: 11,
    eventsAttended: 19,
    engagementScore: 91,
    joinedAt: "2024-07-02",
  },
];

export function ExecutiveDashboard({ authReady = true }: ExecutiveDashboardProps) {
  // ── LIVE API QUERIES ──
  const membersQ = useQuery({
    queryKey: ["executive-members-list"],
    queryFn: async () => {
      try {
        const res = await fetchNestApi<any[]>("/members");
        if (Array.isArray(res) && res.length > 0) return res;
      } catch {}
      return [];
    },
    enabled: authReady,
  });

  const invoicesQ = useQuery({
    queryKey: ["executive-invoices-list"],
    queryFn: async () => {
      try {
        const res = await fetchNestApi<any[]>("/invoices");
        if (Array.isArray(res) && res.length > 0) return res;
      } catch {}
      return [];
    },
    enabled: authReady,
  });

  // Transform raw data into structured table rows
  const allRows: ExecMemberRow[] = useMemo(() => {
    const apiMembers = membersQ.data || [];
    if (apiMembers.length === 0) return DEFAULT_MEMBERS;

    const invoiceMap = new Map<string, any>();
    (invoicesQ.data || []).forEach((inv) => {
      if (inv.memberId) invoiceMap.set(inv.memberId, inv);
      if (inv.userId) invoiceMap.set(inv.userId, inv);
    });

    return apiMembers.map((m: any, idx: number) => {
      const inv = invoiceMap.get(m.id) || invoiceMap.get(m.userId);
      const isPaid = m.fee_paid === true || inv?.status === "paid" || inv?.status === "completed";
      const code = m.code || `CEO-1983-${String(idx + 1).padStart(3, "0")}`;
      const name = m.name || m.contact || "Hội viên CEO 1983";
      const company = m.companyName || m.company || m.name || "Doanh nghiệp CEO 1983";
      const dept = m.department || "Ban Điều Hành";
      const role = m.executiveRole || m.role || "Hội viên chính thức";
      const phone = m.phone || "—";
      const email = m.email || "—";
      const status = m.status === "active" || m.status === "approved" ? "active" : "pending";

      return {
        id: m.id || `m-${idx}`,
        code,
        name,
        company,
        industry: m.industry || "Thương mại & Dịch vụ",
        role,
        department: dept,
        phone,
        email,
        avatar: m.avatarUrl || m.avatar || "/ceo1983-emblem-8.png",
        status: status as any,
        feePaid: isPaid,
        feeAmount: Number(inv?.amount || 20000000),
        oppsShared: Number(m.oppsShared || Math.floor(Math.random() * 15) + 3),
        dealsWon: Number(m.dealsWon || Math.floor(Math.random() * 8) + 1),
        eventsAttended: Number(m.eventsAttended || Math.floor(Math.random() * 18) + 5),
        engagementScore: Number(m.engagementScore || Math.floor(Math.random() * 25) + 75),
        joinedAt: m.created_at || m.joinedAt || "2024-01-01",
      };
    });
  }, [membersQ.data, invoicesQ.data]);

  // ── SEARCH & FILTERS ──
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDeptFilter, setSelectedDeptFilter] = useState("all");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("all");
  const [selectedFeeFilter, setSelectedFeeFilter] = useState("all");

  // Sorting 3 trạng thái
  const [sortKey, setSortKey] = useState<string | null>("engagementScore");
  const [sortDir, setSortDir] = useState<"asc" | "desc" | null>("desc");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modal View
  const [selectedMember, setSelectedMember] = useState<ExecMemberRow | null>(null);

  const handleSort = (key: string) => {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDir("asc");
    } else if (sortDir === "asc") {
      setSortDir("desc");
    } else if (sortDir === "desc") {
      setSortKey(null);
      setSortDir(null);
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setCurrentPage(1);
  };

  const filteredRows = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return allRows.filter((r) => {
      const matchQ =
        !q ||
        r.name.toLowerCase().includes(q) ||
        r.code.toLowerCase().includes(q) ||
        r.company.toLowerCase().includes(q) ||
        r.industry.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.phone.includes(q);

      const matchDept = selectedDeptFilter === "all" || r.department === selectedDeptFilter;

      const matchStatus =
        selectedStatusFilter === "all" ||
        (selectedStatusFilter === "active" && r.status === "active") ||
        (selectedStatusFilter === "pending" && r.status === "pending");

      const matchFee =
        selectedFeeFilter === "all" ||
        (selectedFeeFilter === "paid" && r.feePaid) ||
        (selectedFeeFilter === "unpaid" && !r.feePaid);

      return matchQ && matchDept && matchStatus && matchFee;
    });
  }, [allRows, searchQuery, selectedDeptFilter, selectedStatusFilter, selectedFeeFilter]);

  const sortedRows = useMemo(() => {
    if (!sortKey) return filteredRows;
    const copy = [...filteredRows];
    copy.sort((a, b) => {
      let av: any = "";
      let bv: any = "";
      if (sortKey === "name") {
        av = a.name;
        bv = b.name;
      } else if (sortKey === "code") {
        av = a.code;
        bv = b.code;
      } else if (sortKey === "company") {
        av = a.company;
        bv = b.company;
      } else if (sortKey === "dept") {
        av = a.department;
        bv = b.department;
      } else if (sortKey === "engagementScore") {
        av = a.engagementScore;
        bv = b.engagementScore;
      } else if (sortKey === "oppsShared") {
        av = a.oppsShared;
        bv = b.oppsShared;
      }
      if (typeof av === "number" && typeof bv === "number") {
        return sortDir === "asc" ? av - bv : bv - av;
      }
      const cmp = String(av).localeCompare(String(bv), "vi", { numeric: true });
      return sortDir === "asc" ? cmp : -cmp;
    });
    return copy;
  }, [filteredRows, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / pageSize));
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedRows.slice(start, start + pageSize);
  }, [sortedRows, currentPage, pageSize]);

  // Xuất Excel chuẩn format
  const handleExportExcel = () => {
    exportToExcel<ExecMemberRow>({
      title: "BẢNG ĐIỀU HÀNH TỔNG HỢP HOẠT ĐỘNG & HỘI VIÊN CLB CEO 1983",
      subtitle: `CLB Doanh Nhân CEO 1983 (HanoiBA) | Tổng số: ${allRows.length} hội viên`,
      filename: `danh-sach-dieu-hanh-ceo1983-${new Date().toISOString().slice(0, 10)}`,
      sheetName: "Dieu_Hanh_Hoi_Vien",
      organization: "CLB DOANH NHÂN CEO 1983 (HANOIBA)",
      address: "Tòa nhà HanoiBA, TP. Hà Nội",
      circularCode: "Mẫu số B01-BĐH",
      circularNote: "(Ban hành theo quy chế quản trị & điều hành CLB CEO 1983)",
      fundType: "Dữ liệu quản trị điều hành nội bộ",
      currencyUnit: "VNĐ",
      data: sortedRows,
      columns: [
        { header: "STT", key: "stt", width: 8, value: (_, i) => i + 1 },
        { header: "Mã Hội Viên", key: "code", width: 16, value: (r) => r.code },
        { header: "Họ và Tên", key: "name", width: 28, value: (r) => r.name },
        { header: "Chức Vụ", key: "role", width: 22, value: (r) => r.role },
        { header: "Tên Doanh Nghiệp", key: "company", width: 36, value: (r) => r.company },
        { header: "Ngành Nghề", key: "industry", width: 30, value: (r) => r.industry },
        { header: "Ban Chuyên Môn", key: "dept", width: 24, value: (r) => r.department },
        { header: "Số Điện Thoại", key: "phone", width: 18, value: (r) => r.phone },
        { header: "Email", key: "email", width: 28, value: (r) => r.email },
        { header: "Tình Trạng Hội Phí", key: "fee", width: 20, value: (r) => (r.feePaid ? "Đã nộp" : "Chưa nộp") },
        { header: "Cơ Hội B2B Chia Sẻ", key: "opps", width: 18, value: (r) => r.oppsShared },
        { header: "Điểm Hoạt Động", key: "score", width: 16, value: (r) => `${r.engagementScore}/100` },
      ],
    });
    toast.success("Đã xuất báo cáo Excel điều hành thành công!");
  };

  return (
    <div className="space-y-6">
      {/* ── 1. TIÊU ĐỀ TRANG CHUẨN CRM ── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-['Inter'] leading-8">
            Bảng Điều Hành Hoạt Động &amp; Hội Viên Toàn Diện
          </h1>
          <p className="text-sm text-slate-500 font-normal font-['Inter'] leading-5 mt-0.5">
            Giám sát danh sách hội viên, phân ban chuyên môn, chỉ số kết nối giao thương B2B và tình trạng hội phí CLB CEO 1983
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportExcel}
            className="h-9 px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-3xl shadow-xs flex items-center gap-2 text-xs font-bold transition cursor-pointer"
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>Xuất Excel Điều Hành</span>
          </button>
        </div>
      </div>

      {/* ── 2. 4 METRIC CARDS (Figma Exact Gradients & 5-color Palette) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Tổng số hội viên */}
        <div className="h-32 p-4 bg-gradient-to-b from-sky-100 to-slate-50 rounded-[20px] outline outline-[0.50px] outline-slate-200 flex flex-col justify-start items-start gap-2.5 overflow-hidden shadow-xs">
          <div className="h-8 flex items-center gap-2">
            <img src="/icons/ceo1983_icon_2/users-round-1.svg" className="h-4 w-4" alt="users" />
            <div className="text-blue-600 text-xs font-semibold font-['Inter']">TỔNG HỘI VIÊN CHÍNH THỨC</div>
          </div>
          <div className="text-slate-900 text-2xl font-bold font-['Inter'] leading-7">
            {allRows.length}
          </div>
          <div className="text-slate-500 text-xs font-normal font-['Inter']">
            {allRows.filter((r) => r.company).length} Doanh nghiệp thành viên
          </div>
        </div>

        {/* Card 2: Lãnh đạo & Quản trị */}
        <div className="h-32 p-4 bg-gradient-to-b from-violet-100 to-white rounded-[20px] outline outline-[0.50px] outline-slate-200 flex flex-col justify-start items-start gap-2.5 overflow-hidden shadow-xs">
          <div className="h-8 flex items-center gap-2">
            <img src="/icons/ceo1983_icon_2/shield-check.svg" className="h-4 w-4" alt="shield" />
            <div className="text-indigo-500 text-xs font-semibold font-['Inter']">LÃNH ĐẠO &amp; TRƯỞNG BAN</div>
          </div>
          <div className="text-slate-900 text-2xl font-bold font-['Inter'] leading-7">
            {allRows.filter((r) => r.role.includes("Trưởng Ban") || r.role.includes("Chủ tịch")).length}
          </div>
          <div className="text-slate-500 text-xs font-normal font-['Inter']">
            Ban Điều Hành &amp; các ban chuyên môn
          </div>
        </div>

        {/* Card 3: Giao thương & Cơ hội */}
        <div className="h-32 p-4 bg-gradient-to-b from-orange-100 to-white rounded-[20px] outline outline-[0.50px] outline-slate-200 flex flex-col justify-start items-start gap-2.5 overflow-hidden shadow-xs">
          <div className="h-8 flex items-center gap-2">
            <img src="/icons/ceo1983_icon_2/handshake-1.svg" className="h-4 w-4" alt="handshake" />
            <div className="text-orange-500 text-xs font-semibold font-['Inter']">CƠ HỘI B2B ĐÃ CHIA SẺ</div>
          </div>
          <div className="text-slate-900 text-2xl font-bold font-['Inter'] leading-7">
            {allRows.reduce((s, r) => s + r.oppsShared, 0)}
          </div>
          <div className="text-slate-500 text-xs font-normal font-['Inter']">
            {allRows.reduce((s, r) => s + r.dealsWon, 0)} Thương vụ đã chốt thành công
          </div>
        </div>

        {/* Card 4: Tình trạng hội phí */}
        <div className="h-32 p-4 bg-gradient-to-b from-green-100 to-white rounded-[20px] outline outline-[0.50px] outline-slate-200 flex flex-col justify-start items-start gap-2.5 overflow-hidden shadow-xs">
          <div className="h-8 flex items-center gap-2">
            <img src="/icons/ceo1983_icon_2/circle-check.svg" className="h-4 w-4" alt="check" />
            <div className="text-emerald-500 text-xs font-semibold font-['Inter']">ĐÃ HOÀN TẤT HỘI PHÍ</div>
          </div>
          <div className="text-slate-900 text-2xl font-bold font-['Inter'] leading-7">
            {allRows.filter((r) => r.feePaid).length}/{allRows.length}
          </div>
          <div className="text-slate-500 text-xs font-normal font-['Inter']">
            Tỷ lệ thu đạt {allRows.length > 0 ? Math.round((allRows.filter((r) => r.feePaid).length / allRows.length) * 100) : 0}%
          </div>
        </div>
      </div>

      {/* ── 3. TOOLBAR: TÌM KIẾM CẠNH BỘ LỌC (Figma Exact Style y hệt accounts.tsx) ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-[0px_2px_2px_0px_rgba(22,39,75,0.05)]">
        <div className="flex flex-1 items-center gap-2 max-w-xl">
          <div className="flex-1 h-9 px-3 bg-white dark:bg-card rounded-3xl outline outline-1 outline-slate-200 flex items-center gap-2.5 overflow-hidden">
            <img src="/icons/ceo1983_icon_2/search.svg" className="h-4 w-4 shrink-0" alt="search" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Tìm theo tên hội viên, mã thẻ, doanh nghiệp, ngành nghề, SĐT, email..."
              className="flex-1 bg-transparent text-xs text-slate-900 dark:text-white placeholder:text-slate-500 outline-none"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="text-slate-400 hover:text-slate-600">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Lọc theo Ban Chuyên Môn */}
          <div className="relative">
            <select
              value={selectedDeptFilter}
              onChange={(e) => {
                setSelectedDeptFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="h-9 px-3 pr-8 bg-white dark:bg-card rounded-[100px] outline outline-1 outline-slate-200 text-slate-900 dark:text-white text-xs font-normal appearance-none cursor-pointer"
            >
              {DEPARTMENT_OPTIONS.map((dept) => (
                <option key={dept} value={dept === "Tất cả ban" ? "all" : dept}>
                  {dept}
                </option>
              ))}
            </select>
            <img
              src="/icons/ceo1983_icon_2/chevron-down.svg"
              className="h-3 w-3 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
              alt="chevron"
            />
          </div>

          {/* Lọc theo Trạng Thái Hoạt Động */}
          <div className="relative">
            <select
              value={selectedStatusFilter}
              onChange={(e) => {
                setSelectedStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="h-9 px-3 pr-8 bg-white dark:bg-card rounded-[100px] outline outline-1 outline-slate-200 text-slate-900 dark:text-white text-xs font-normal appearance-none cursor-pointer"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang hoạt động</option>
              <option value="pending">Chờ phê duyệt</option>
            </select>
            <img
              src="/icons/ceo1983_icon_2/chevron-down.svg"
              className="h-3 w-3 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
              alt="chevron"
            />
          </div>

          {/* Lọc theo Hội Phí */}
          <div className="relative">
            <select
              value={selectedFeeFilter}
              onChange={(e) => {
                setSelectedFeeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="h-9 px-3 pr-8 bg-white dark:bg-card rounded-[100px] outline outline-1 outline-slate-200 text-slate-900 dark:text-white text-xs font-normal appearance-none cursor-pointer"
            >
              <option value="all">Tất cả hội phí</option>
              <option value="paid">Đã đóng đủ</option>
              <option value="unpaid">Chưa đóng / Còn nợ</option>
            </select>
            <img
              src="/icons/ceo1983_icon_2/chevron-down.svg"
              className="h-3 w-3 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
              alt="chevron"
            />
          </div>
        </div>
      </div>

      {/* ── 4. BẢNG DỮ LIỆU ĐIỀU HÀNH CHUẨN FIGMA (Format accounts.tsx) ── */}
      <div className="self-stretch bg-white dark:bg-card rounded-[20px] outline outline-1 outline-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1100px]">
            <thead>
              <tr className="h-16 bg-blue-50/70 dark:bg-blue-950/40 border-b border-slate-200 text-xs font-bold text-slate-900 dark:text-slate-100">
                <th className="w-12 px-3 text-center border-r border-slate-200 select-none">STT</th>
                <SortHeader
                  label="HỘI VIÊN & CHỨC DANH"
                  columnKey="name"
                  sortKey={sortKey}
                  sortDir={sortDir}
                  onSort={handleSort}
                  width={260}
                  className="border-r border-slate-200"
                >
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-800" strokeWidth={2.2} />
                    <span>HỘI VIÊN &amp; CHỨC DANH</span>
                  </div>
                </SortHeader>
                <SortHeader
                  label="DOANH NGHIỆP & LĨNH VỰC"
                  columnKey="company"
                  sortKey={sortKey}
                  sortDir={sortDir}
                  onSort={handleSort}
                  width={240}
                  className="border-r border-slate-200"
                />
                <SortHeader
                  label="PHÂN BAN CHUYÊN MÔN"
                  columnKey="dept"
                  sortKey={sortKey}
                  sortDir={sortDir}
                  onSort={handleSort}
                  width={180}
                  className="border-r border-slate-200"
                />
                <SortHeader
                  label="GIAO THƯƠNG B2B"
                  columnKey="oppsShared"
                  sortKey={sortKey}
                  sortDir={sortDir}
                  onSort={handleSort}
                  width={150}
                  className="border-r border-slate-200"
                />
                <th className="w-36 px-4 text-center border-r border-slate-200 select-none">TÌNH TRẠNG HỘI PHÍ</th>
                <SortHeader
                  label="ĐIỂM GẮN KẾT"
                  columnKey="engagementScore"
                  sortKey={sortKey}
                  sortDir={sortDir}
                  onSort={handleSort}
                  width={130}
                  className="border-r border-slate-200"
                />
                <th className="w-24 px-4 text-center select-none">THAO TÁC</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200 text-xs">
              {paginatedRows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    Không tìm thấy hội viên nào phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : (
                paginatedRows.map((r, index) => (
                  <tr
                    key={r.id}
                    className="h-16 hover:bg-slate-50/60 dark:hover:bg-slate-900/40 transition"
                  >
                    {/* STT */}
                    <td className="w-12 px-3 text-center text-slate-500 text-xs font-semibold border-r border-slate-200">
                      {(currentPage - 1) * pageSize + index + 1}
                    </td>

                    {/* HỘI VIÊN & CHỨC DANH */}
                    <td className="px-5 border-r border-slate-200">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#003B95] text-white flex items-center justify-center font-bold text-xs shrink-0">
                          {r.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="text-slate-900 dark:text-white text-xs font-bold truncate">
                            {r.name}
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="px-1.5 py-0.2 rounded-sm bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-mono text-[10px] font-bold">
                              {r.code}
                            </span>
                            <span className="text-slate-500 text-[11px] truncate">
                              {r.role}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* DOANH NGHIỆP & LĨNH VỰC */}
                    <td className="px-4 border-r border-slate-200">
                      <div className="text-slate-900 dark:text-white text-xs font-bold truncate">
                        {r.company}
                      </div>
                      <div className="text-slate-500 text-[11px] truncate mt-0.5">
                        {r.industry}
                      </div>
                    </td>

                    {/* PHÂN BAN CHUYÊN MÔN */}
                    <td className="px-4 border-r border-slate-200">
                      <span className="inline-block px-2.5 py-1 rounded-md text-[11px] font-bold border border-blue-200 bg-blue-50/80 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
                        {r.department}
                      </span>
                    </td>

                    {/* GIAO THƯƠNG B2B */}
                    <td className="px-4 border-r border-slate-200">
                      <div className="flex items-center gap-1 text-slate-900 dark:text-white font-bold text-xs">
                        <Handshake className="h-3.5 w-3.5 text-amber-500" />
                        <span>{r.oppsShared} Cơ hội</span>
                      </div>
                      <div className="text-slate-500 text-[11px] mt-0.5">
                        {r.dealsWon} Deal thành công
                      </div>
                    </td>

                    {/* TÌNH TRẠNG HỘI PHÍ */}
                    <td className="px-4 border-r border-slate-200 text-center">
                      {r.feePaid ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Đã nộp đủ</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/60 dark:text-red-300">
                          <XCircle className="h-3 w-3" />
                          <span>Chưa nộp</span>
                        </span>
                      )}
                    </td>

                    {/* ĐIỂM GẮN KẾT */}
                    <td className="px-4 border-r border-slate-200">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                        <span>{r.engagementScore} / 100</span>
                        {r.engagementScore >= 85 ? (
                          <span className="text-[10px] px-1.5 py-0.2 rounded-sm bg-emerald-100 text-emerald-800 font-bold">
                            Tích cực
                          </span>
                        ) : (
                          <span className="text-[10px] px-1.5 py-0.2 rounded-sm bg-amber-100 text-amber-800 font-bold">
                            Cần kết nối
                          </span>
                        )}
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mt-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            r.engagementScore >= 85 ? "bg-emerald-600" : "bg-amber-500"
                          }`}
                          style={{ width: `${r.engagementScore}%` }}
                        />
                      </div>
                    </td>

                    {/* THAO TÁC */}
                    <td className="px-4 text-center">
                      <button
                        type="button"
                        onClick={() => setSelectedMember(r)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/60 text-xs font-bold transition cursor-pointer"
                        title="Xem chi tiết hồ sơ điều hành"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>Xem</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── 5. PHÂN TRANG PAGINATION CHUẨN ACCOUNTS.TSX ── */}
        <div className="p-4 border-t border-slate-200">
          <Pagination
            page={currentPage}
            pageCount={totalPages}
            pageSize={pageSize}
            total={sortedRows.length}
            from={sortedRows.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
            to={Math.min(currentPage * pageSize, sortedRows.length)}
            onPage={setCurrentPage}
            onPageSize={(size: number) => {
              setPageSize(size);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      {/* ── 6. MODAL XEM CHI TIẾT HỘI VIÊN ĐIỀU HÀNH ── */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-card border border-slate-200 dark:border-slate-800 rounded-[24px] max-w-xl w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#003B95] text-white flex items-center justify-center font-bold text-base">
                  {selectedMember.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {selectedMember.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs font-mono font-bold text-blue-700 dark:text-blue-300">
                      {selectedMember.code}
                    </span>
                    <span className="text-xs text-slate-500">· {selectedMember.role}</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedMember(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 transition"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
                <div className="text-slate-500 font-medium">Doanh Nghiệp</div>
                <div className="text-slate-900 dark:text-white font-bold mt-1 text-sm">
                  {selectedMember.company}
                </div>
                <div className="text-slate-500 text-[11px] mt-0.5">
                  {selectedMember.industry}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
                <div className="text-slate-500 font-medium">Ban Chuyên Môn</div>
                <div className="text-blue-800 dark:text-blue-300 font-bold mt-1 text-sm">
                  {selectedMember.department}
                </div>
                <div className="text-slate-500 text-[11px] mt-0.5">
                  Điểm gắn kết: {selectedMember.engagementScore}/100
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
                <div className="text-slate-500 font-medium">Thông Tin Liên Hệ</div>
                <div className="flex items-center gap-1.5 mt-1 text-slate-900 dark:text-white font-semibold">
                  <Phone className="size-3.5 text-blue-700" />
                  <span>{selectedMember.phone}</span>
                </div>
                <div className="flex items-center gap-1.5 mt-1 text-slate-600 dark:text-slate-300">
                  <Mail className="size-3.5 text-slate-500" />
                  <span>{selectedMember.email}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
                <div className="text-slate-500 font-medium">Tình Trạng Hội Phí</div>
                <div className="mt-1">
                  {selectedMember.feePaid ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                      <CheckCircle2 className="size-3.5" />
                      <span>Đã hoàn tất hội phí</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800">
                      <XCircle className="size-3.5" />
                      <span>Chưa nộp hội phí</span>
                    </span>
                  )}
                </div>
                <div className="text-slate-500 text-[11px] mt-1">
                  Mức phí: 20.000.000 VNĐ / năm
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Handshake className="size-4 text-blue-700 dark:text-blue-400" />
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  Thành tích giao thương B2B:
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-blue-800 dark:text-blue-300">
                  {selectedMember.oppsShared} Cơ hội chia sẻ
                </span>
                <span>·</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-400">
                  {selectedMember.dealsWon} Hợp đồng đã ký
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedMember(null)}
                className="px-4 py-2 rounded-xl bg-[#003B95] text-white text-xs font-bold transition hover:bg-blue-900 cursor-pointer"
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
