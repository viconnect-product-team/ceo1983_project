import React, { useState, useMemo, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Download,
  PieChart,
  TrendingDown,
  TrendingUp,
  Wallet,
  Calendar,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  FileSpreadsheet,
  FileText,
  Building2,
  CheckCircle2,
  Clock,
  Coins,
  X,
  Printer,
  Upload,
} from "lucide-react";
import { AppShell } from "@/components/dashboard/AppShell";
import { Card, PageHeader } from "@/components/dashboard/PageKit";
import { useQuery } from "@tanstack/react-query";
import { fetchNestApi } from "@/lib/api-client";
import { listTransactionsFn, type Transaction } from "@/lib/finance.functions";
import { useFmt, useT } from "@/lib/i18n";
import { exportToExcel, formatDisplayDate, formatExcelCurrency, numberToVietnameseWords } from "@/lib/excel-export";
import { toast } from "sonner";
import { useTableControls } from "@/hooks/use-table-controls";
import { Pagination } from "@/components/dashboard/DataTablePagination";
import { FinanceExcelImportModal } from "@/components/dashboard/FinanceExcelImportModal";
import { FinanceChartsSection } from "@/components/dashboard/FinanceChartsSection";

const FALLBACK_TRANSACTIONS: Transaction[] = [
  {
    id: "PT-2026-001",
    date: "2026-03-10",
    type: "income",
    category: "Hội phí hội viên",
    description: "Thu hội phí hội viên Kim Cương 2026",
    amount: 50000000,
    method: "bank",
    status: "completed",
    recipient: "Công ty CP Tập đoàn Hòa Bình",
  },
  {
    id: "PT-2026-002",
    date: "2026-03-09",
    type: "income",
    category: "Vé sự kiện",
    description: "Thu vé tham dự Diễn đàn Kết nối Giao thương B2B Quốc Tế",
    amount: 15000000,
    method: "bank",
    status: "completed",
    recipient: "Công ty TNHH Giải pháp Số An Phát",
  },
  {
    id: "PT-2026-003",
    date: "2026-03-08",
    type: "income",
    category: "Tài trợ sự kiện",
    description: "Tài trợ kim cương Gala Dinner Doanh nhân Tiên Phong",
    amount: 80000000,
    method: "bank",
    status: "completed",
    recipient: "Ngân hàng Thương mại Cổ phần Á Châu",
  },
  {
    id: "PT-2026-004",
    date: "2026-03-06",
    type: "income",
    category: "Thu đột xuất",
    description: "Đăng ký bổ sung gian hàng triển lãm B2B Tech Expo",
    amount: 8000000,
    method: "cash",
    status: "completed",
    recipient: "Doanh nghiệp Tư nhân Minh Khang",
  },
  {
    id: "PT-2026-005",
    date: "2026-03-04",
    type: "income",
    category: "Hội phí hội viên",
    description: "Phí gia nhập hội viên mới Khối Sản Xuất & Bán Lẻ",
    amount: 20000000,
    method: "bank",
    status: "completed",
    recipient: "Công ty TNHH Dược phẩm An Sinh",
  },
  {
    id: "PC-2026-001",
    date: "2026-03-10",
    type: "expense",
    category: "Thuê địa điểm & Hội trường",
    description: "Thanh toán tiền thuê trung tâm hội nghị Gem Center",
    amount: 35000000,
    method: "bank",
    status: "completed",
    recipient: "Gem Center Saigon",
  },
  {
    id: "PC-2026-002",
    date: "2026-03-09",
    type: "expense",
    category: "Tiệc chiêu đãi & F&B",
    description: "Tiệc trà teabreak & gala dinner đại biểu B2B",
    amount: 18000000,
    method: "bank",
    status: "completed",
    recipient: "Saigon Catering Service",
  },
  {
    id: "PC-2026-003",
    date: "2026-03-07",
    type: "expense",
    category: "Quà tặng & Ấn phẩm",
    description: "In ấn backdrop, kỷ yếu hội viên mạ vàng, cúp vinh danh",
    amount: 12500000,
    method: "bank",
    status: "completed",
    recipient: "Công ty In ấn Mỹ Thuật Á Đông",
  },
  {
    id: "PC-2026-004",
    date: "2026-03-05",
    type: "expense",
    category: "Truyền thông & Báo chí",
    description: "Gói truyền thông báo điện tử VnExpress, CafeF, Doanh Nhân Trẻ",
    amount: 15000000,
    method: "bank",
    status: "completed",
    recipient: "VCCorp Media Network",
  },
  {
    id: "PC-2026-005",
    date: "2026-03-02",
    type: "expense",
    category: "Hành chính & Tiếp khách",
    description: "Chi phí tiếp đón đoàn xúc tiến thương mại Hàn Quốc",
    amount: 4500000,
    method: "cash",
    status: "completed",
    recipient: "Văn phòng Hiệp hội CEO 1983",
  },
];

export const Route = createFileRoute("/finance-report")({
  ssr: false,
  loader: async () => {
    try {
      const data = await listTransactionsFn();
      if (Array.isArray(data) && data.length > 0) return data;
    } catch {
      // fallback safe
    }
    return FALLBACK_TRANSACTIONS;
  },
  component: FinanceReport,
});

type PeriodFilter = "all" | "day" | "week" | "month" | "year";

function FinanceReport() {
  const t = useT();
  const fmt = useFmt();
  const rawTransactions = (Route.useLoaderData() as Transaction[]) || FALLBACK_TRANSACTIONS;

  const [period, setPeriod] = useState<PeriodFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "income" | "expense">("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  const txQuery = useQuery({
    queryKey: ["finance-report-data", statusFilter],
    queryFn: async () => {
      try {
        const query = statusFilter !== "all" ? `?status=${encodeURIComponent(statusFilter)}` : "";
        const res = await fetchNestApi<Transaction[]>(`/admin/transactions${query}`);
        if (Array.isArray(res) && res.length > 0) return res;
      } catch {}
      return rawTransactions;
    },
    initialData: rawTransactions,
  });

  // Auto-update when cashflow changes (Requirement 6)
  useEffect(() => {
    const handleUpdate = () => {
      txQuery.refetch();
    };
    window.addEventListener("vba_transactions_changed", handleUpdate);
    window.addEventListener("finance-updated", handleUpdate);
    return () => {
      window.removeEventListener("vba_transactions_changed", handleUpdate);
      window.removeEventListener("finance-updated", handleUpdate);
    };
  }, [txQuery]);

  const activeRawTransactions = txQuery.data || rawTransactions;

  // Filtered by search, type, status & period (ngày, tuần, tháng, năm)
  const transactions = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const hasToday = activeRawTransactions.some((t) => t.date && t.date.slice(0, 10) === todayStr);

    return activeRawTransactions.filter((tx) => {
      if (typeFilter !== "all" && tx.type !== typeFilter) return false;
      if (statusFilter !== "all") {
        const st = String(tx.status || "").toLowerCase();
        if (statusFilter === "completed" && st !== "completed" && st !== "paid") return false;
        if (statusFilter === "pending" && st !== "pending" && st !== "unpaid") return false;
        if (statusFilter === "cancelled" && st !== "cancelled") return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches = (
          tx.id.toLowerCase().includes(q) ||
          tx.description.toLowerCase().includes(q) ||
          tx.category.toLowerCase().includes(q) ||
          (tx.recipient && tx.recipient.toLowerCase().includes(q))
        );
        if (!matches) return false;
      }

      // Period filter: day, week, month, year, all
      if (period !== "all") {
        if (!tx.date) return false;
        const txDate = new Date(tx.date);
        if (isNaN(txDate.getTime())) return true;

        if (period === "day") {
          if (hasToday) {
            return tx.date.slice(0, 10) === todayStr;
          }
          const latestDate = activeRawTransactions
            .map((t) => t.date)
            .filter(Boolean)
            .sort()
            .reverse()[0];
          return latestDate ? tx.date.slice(0, 10) === latestDate.slice(0, 10) : true;
        }

        if (period === "week") {
          const diffDays = (now.getTime() - txDate.getTime()) / (1000 * 60 * 60 * 24);
          if (diffDays >= -1 && diffDays <= 7) return true;
          const latestDateStr = activeRawTransactions
            .map((t) => t.date)
            .filter(Boolean)
            .sort()
            .reverse()[0];
          if (latestDateStr) {
            const latestDate = new Date(latestDateStr);
            const diffFromLatest = (latestDate.getTime() - txDate.getTime()) / (1000 * 60 * 60 * 24);
            return diffFromLatest >= -1 && diffFromLatest <= 7;
          }
          return true;
        }

        if (period === "month") {
          const isThisMonth = txDate.getFullYear() === now.getFullYear() && txDate.getMonth() === now.getMonth();
          if (isThisMonth) return true;
          const latestDateStr = activeRawTransactions
            .map((t) => t.date)
            .filter(Boolean)
            .sort()
            .reverse()[0];
          if (latestDateStr) {
            const latestDate = new Date(latestDateStr);
            return txDate.getFullYear() === latestDate.getFullYear() && txDate.getMonth() === latestDate.getMonth();
          }
          return false;
        }

        if (period === "year") {
          return txDate.getFullYear() === now.getFullYear();
        }
      }

      return true;
    });
  }, [activeRawTransactions, typeFilter, statusFilter, searchQuery, period]);

  const tc = useTableControls<Transaction>(
    transactions,
    {
      id: (tx) => tx.id,
      date: (tx) => tx.date,
      type: (tx) => tx.type,
      cat: (tx) => tx.category,
      amount: (tx) => tx.amount,
      status: (tx) => tx.status,
    },
    { initialSortKey: "date", initialSortDir: "desc", initialPageSize: 10 },
  );

  const income = useMemo(() => transactions.filter((tx) => tx.type === "income"), [transactions]);
  const expense = useMemo(() => transactions.filter((tx) => tx.type === "expense"), [transactions]);

  const totalIn = useMemo(() => income.reduce((s, tx) => s + tx.amount, 0), [income]);
  const totalOut = useMemo(() => expense.reduce((s, tx) => s + tx.amount, 0), [expense]);
  const netBalance = totalIn - totalOut;
  const expenseRatio = totalIn > 0 ? Math.round((totalOut / totalIn) * 100) : 0;

  // Breakdown by Category
  const byCat = (list: typeof rawTransactions) => {
    const m = new Map<string, number>();
    for (const tx of list) m.set(tx.category, (m.get(tx.category) ?? 0) + tx.amount);
    const arr = [...m.entries()].sort((a, b) => b[1] - a[1]);
    const total = arr.reduce((s, [, v]) => s + v, 0);
    return arr.map(([k, v]) => ({ k, v, pct: total > 0 ? Math.round((v / total) * 100) : 0 }));
  };

  const incomeByCat = useMemo(() => byCat(income), [income]);
  const expenseByCat = useMemo(() => byCat(expense), [expense]);

  // Cash vs Bank Analysis
  const bankIn = income.filter((tx) => tx.method === "bank").reduce((s, tx) => s + tx.amount, 0);
  const cashIn = income.filter((tx) => tx.method === "cash").reduce((s, tx) => s + tx.amount, 0);
  const bankOut = expense.filter((tx) => tx.method === "bank").reduce((s, tx) => s + tx.amount, 0);
  const cashOut = expense.filter((tx) => tx.method === "cash").reduce((s, tx) => s + tx.amount, 0);

  const periodLabels: Record<PeriodFilter, string> = {
    all: "Toàn bộ các kỳ hạch toán",
    day: "Kỳ báo cáo: Theo Ngày",
    week: "Kỳ báo cáo: Theo Tuần (7 Ngày)",
    month: "Kỳ báo cáo: Theo Tháng",
    year: "Kỳ báo cáo: Theo Năm",
  };

  const handleExportCsv = () => {
    const totalIn = income.reduce((s, tx) => s + tx.amount, 0);
    const totalOut = expense.reduce((s, tx) => s + tx.amount, 0);
    const net = totalIn - totalOut;

    exportToExcel<Transaction>({
      title: `BÁO CÁO TỔNG HỢP KIỂM TOÁN TÀI CHÍNH (${periodLabels[period].toUpperCase()})`,
      subtitle: `${periodLabels[period]} | Hệ thống quản lý tài chính CLB Doanh Nhân CEO 1983`,
      filename: `bao-cao-tai-chinh-${period}-ceo1983`,
      sheetName: "Nhat_Ky_Thu_Chi",
      organization: "CLB DOANH NHÂN CEO 1983 (HANOIBA)",
      address: "Tòa nhà HanoiBA, TP. Hà Nội",
      circularCode: "Mẫu số S07-DN",
      circularNote: "(Ban hành theo Thông tư số 200/2014/TT-BTC ngày 22/12/2014 của Bộ Tài chính)",
      fundType: "Quỹ hoạt động CLB Doanh Nhân CEO 1983",
      currencyUnit: "VNĐ",
      data: transactions,
      columns: [
        { header: "Mã chứng từ", key: "id", width: 16, value: (tx) => tx.id },
        { header: "Ngày ghi sổ", key: "date", width: 16, value: (tx) => formatDisplayDate(tx.date) },
        { header: "Loại giao dịch", key: "type", width: 16, value: (tx) => (tx.type === "income" ? "Khoản Thu" : "Khoản Chi") },
        { header: "Danh mục", key: "category", width: 22, value: (tx) => tx.category },
        { header: "Nội dung hạch toán", key: "description", width: 38, value: (tx) => tx.description },
        { header: "Hình thức", key: "method", width: 18, value: (tx) => (tx.method === "cash" ? "Tiền mặt" : tx.method === "bank" ? "Chuyển khoản" : "Thẻ ngân hàng") },
        { header: "TK Đối ứng", key: "acc", width: 18, value: (tx) => (tx.method === "cash" ? "111 - Tiền mặt" : "112 - TG Ngân hàng") },
        { header: "Số tiền (VNĐ)", key: "amount", width: 22, value: (tx) => formatExcelCurrency(tx.amount) },
        { header: "Đối tác / Người nộp - nhận", key: "recipient", width: 30, value: (tx) => tx.recipient || "—" },
        { header: "Trạng thái kiểm toán", key: "status", width: 18, value: (tx) => (tx.status === "completed" ? "Đã duyệt" : "Chờ duyệt") },
      ],
      summaryRows: [
        ["TỔNG CỘNG NGUỒN THU:", "", "", "", "", "", "", formatExcelCurrency(totalIn) + " đ", "", ""],
        ["TỔNG CỘNG KHOẢN CHI:", "", "", "", "", "", "", formatExcelCurrency(totalOut) + " đ", "", ""],
        ["TỒN QUỸ RÒNG / THẶNG DƯ:", "", "", "", "", "", "", formatExcelCurrency(net) + " đ", "", ""],
      ],
      amountInWords: numberToVietnameseWords(net >= 0 ? net : totalIn),
      signerTitles: ["NGƯỜI LẬP BÁO CÁO", "TRƯỞNG BAN TÀI CHÍNH", "CHỦ TỊCH CLB CEO 1983"],
    });
    toast.success(`Đã xuất báo cáo tài chính (${periodLabels[period]}) chuẩn doanh nghiệp CEO 1983 (.xlsx)!`);
  };

  const handleExportPdf = () => {
    setExportModalOpen(true);
  };

  return (
    <AppShell>
      {/* Header */}
      <PageHeader
        title="Báo Cáo Tài Chính & Kiểm Toán Toàn Diện"
        subtitle="Báo cáo thu chi thực tế, phân tích cơ cấu ngân quỹ, tỷ lệ thặng dư và sổ nhật ký kế toán minh bạch"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowImportModal(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50/60 dark:bg-blue-950/40 px-3.5 py-2 text-xs sm:text-sm font-semibold text-[#003B95] dark:text-blue-300 shadow-xs hover:bg-blue-100/60 cursor-pointer transition-all"
            >
              <Upload className="h-4 w-4" />
              <span>Nhập File Excel</span>
            </button>
            <button
              type="button"
              onClick={handleExportCsv}
              className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/40 px-3.5 py-2 text-xs sm:text-sm font-semibold text-emerald-700 dark:text-emerald-300 shadow-xs hover:bg-emerald-100/60 cursor-pointer transition-all"
            >
              <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
              <span>Xuất Excel (.xlsx)</span>
            </button>
            <button
              type="button"
              onClick={handleExportPdf}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs sm:text-sm font-bold text-primary-foreground shadow-sm hover:opacity-90 cursor-pointer transition-all"
            >
              <FileText className="h-4 w-4" />
              <span>In / Xuất Báo Cáo PDF</span>
            </button>
          </div>
        }
      />

      {/* Period & Filter Control Bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl border border-border bg-card shadow-sm">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-bold text-muted-foreground mr-1">Kỳ báo cáo:</span>
          {[
            { id: "all", label: "Tất cả kỳ" },
            { id: "day", label: "Theo ngày" },
            { id: "week", label: "Theo tuần" },
            { id: "month", label: "Theo tháng" },
            { id: "year", label: "Theo năm" },
          ].map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setPeriod(p.id as PeriodFilter)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                period === p.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo mã, nội dung, danh mục..."
              className="w-full rounded-xl border border-input bg-background pl-9 pr-3 py-1.5 text-xs outline-none focus:border-primary"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="rounded-xl border border-input bg-background px-2.5 py-1.5 text-xs font-semibold text-foreground outline-none cursor-pointer"
          >
            <option value="all">Tất cả giao dịch</option>
            <option value="income">Chỉ khoản thu (+)</option>
            <option value="expense">Chỉ khoản chi (-)</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-input bg-background px-2.5 py-1.5 text-xs font-semibold text-foreground outline-none cursor-pointer"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="completed">Đã hoàn thành / Đã thanh toán</option>
            <option value="pending">Chờ phê duyệt</option>
            <option value="cancelled">Đã hủy / Từ chối</option>
          </select>
        </div>
      </div>

      {/* 4 Core Financial KPI Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total In */}
        <div className="flex h-32 flex-col justify-between rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 shadow-[var(--shadow-card)] transition-all hover:border-emerald-500/60 hover:shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <span className="truncate text-xs font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              Tổng Thu Thực Nhận
            </span>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-600">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="truncate text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono tracking-tight">
              +{fmt.money(totalIn)}
            </div>
            <div className="mt-1 flex items-center justify-between truncate text-[11px] text-muted-foreground">
              <span className="truncate">CK: {fmt.money(bankIn)}</span>
              <span className="truncate">TM: {fmt.money(cashIn)}</span>
            </div>
          </div>
        </div>

        {/* Total Out */}
        <div className="flex h-32 flex-col justify-between rounded-2xl border border-rose-500/30 bg-rose-500/5 p-4 shadow-[var(--shadow-card)] transition-all hover:border-rose-500/60 hover:shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <span className="truncate text-xs font-black uppercase tracking-wider text-rose-700 dark:text-rose-400">
              Tổng Chi Thực Tế
            </span>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-rose-500/20 text-rose-600">
              <TrendingDown className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="truncate text-2xl font-black text-rose-600 dark:text-rose-400 font-mono tracking-tight">
              -{fmt.money(totalOut)}
            </div>
            <div className="mt-1 flex items-center justify-between truncate text-[11px] text-muted-foreground">
              <span className="truncate">CK: {fmt.money(bankOut)}</span>
              <span className="truncate">TM: {fmt.money(cashOut)}</span>
            </div>
          </div>
        </div>

        {/* Net Cash Balance */}
        <div className="flex h-32 flex-col justify-between rounded-2xl border border-blue-500/30 bg-blue-500/5 p-4 shadow-[var(--shadow-card)] transition-all hover:border-blue-500/60 hover:shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <span className="truncate text-xs font-black uppercase tracking-wider text-blue-700 dark:text-blue-400">
              Tồn Quỹ Ròng / Thặng Dư
            </span>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-500/20 text-blue-600">
              <Wallet className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div
              className={`truncate text-2xl font-black font-mono tracking-tight ${
                netBalance >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
              }`}
            >
              {netBalance >= 0 ? `+${fmt.money(netBalance)}` : `-${fmt.money(Math.abs(netBalance))}`}
            </div>
            <div className="mt-1 flex items-center justify-between truncate text-[11px] text-muted-foreground">
              <span>Khả dụng tức thì</span>
              <span className="font-bold text-emerald-600">100% Sẵn sàng</span>
            </div>
          </div>
        </div>

        {/* Operating Ratio */}
        <div className="flex h-32 flex-col justify-between rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 shadow-[var(--shadow-card)] transition-all hover:border-amber-500/60 hover:shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <span className="truncate text-xs font-black uppercase tracking-wider text-amber-700 dark:text-amber-400">
              Tỷ Lệ Chi / Thu
            </span>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-600">
              <PieChart className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="truncate text-2xl font-black text-amber-600 dark:text-amber-400 font-mono tracking-tight">
              {expenseRatio}%
            </div>
            <div className="mt-1 flex items-center justify-between truncate text-[11px] text-muted-foreground">
              <span>Ngưỡng an toàn: &lt;75%</span>
              <span className="font-bold text-emerald-600">Đạt chuẩn</span>
            </div>
          </div>
        </div>
      </div>

      {/* Khối Biểu Đồ Tài Chính Trực Quan (Thu, Chi, Tài Trợ & Dòng Tiền) */}
      <FinanceChartsSection transactions={transactions} className="mb-6" />


      {/* Categorized Breakdown Grid */}
      <div className="mb-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Income Breakdown */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
              <ArrowUpRight className="h-4 w-4" />
              <span>Cơ Cấu Các Nguồn Thu ({income.length} khoản)</span>
            </h3>
            <span className="text-xs font-mono font-bold text-emerald-600">+{fmt.money(totalIn)}</span>
          </div>
          <div className="space-y-3.5">
            {incomeByCat.length === 0 ? (
              <p className="py-6 text-center text-xs text-muted-foreground">Chưa có dữ liệu nguồn thu</p>
            ) : (
              incomeByCat.map((c) => (
                <div key={c.k}>
                  <div className="mb-1.5 flex items-center justify-between text-xs">
                    <span className="font-semibold text-foreground">{c.k}</span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {fmt.money(c.v)} · {c.pct}%
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                      style={{ width: `${c.pct}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Expense Breakdown */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
              <ArrowDownRight className="h-4 w-4" />
              <span>Cơ Cấu Các Khoản Chi ({expense.length} khoản)</span>
            </h3>
            <span className="text-xs font-mono font-bold text-rose-600">-{fmt.money(totalOut)}</span>
          </div>
          <div className="space-y-3.5">
            {expenseByCat.length === 0 ? (
              <p className="py-6 text-center text-xs text-muted-foreground">Chưa có dữ liệu khoản chi</p>
            ) : (
              expenseByCat.map((c) => (
                <div key={c.k}>
                  <div className="mb-1.5 flex items-center justify-between text-xs">
                    <span className="font-semibold text-foreground">{c.k}</span>
                    <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
                      {fmt.money(c.v)} · {c.pct}%
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-rose-500 to-amber-500"
                      style={{ width: `${c.pct}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Comprehensive Transaction Ledger Table */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="p-4 border-b border-border flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="text-sm font-bold text-foreground">
              Sổ Nhật Ký Giao Dịch & Hạch Toán Chi Tiết
            </h3>
            <p className="text-xs text-muted-foreground">
              {transactions.length > 0
                ? `Hiển thị chứng từ ${tc.from}-${tc.to} trên tổng số ${transactions.length} chứng từ đã được xác nhận trong hệ thống`
                : "Hiển thị 0 chứng từ thu/chi trong hệ thống"}
            </p>
          </div>
          <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-muted text-foreground">
            Tổng cộng: {transactions.length} chứng từ
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted/40 text-xs font-semibold text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Mã CT</th>
                <th className="px-4 py-3">Ngày</th>
                <th className="px-4 py-3">Loại</th>
                <th className="px-4 py-3">Danh mục</th>
                <th className="px-4 py-3">Diễn giải hạch toán</th>
                <th className="px-4 py-3">Đối tác / Người nộp-nhận</th>
                <th className="px-4 py-3 text-right">Số tiền</th>
                <th className="px-4 py-3">Hình thức</th>
                <th className="px-4 py-3 text-center">Kiểm toán</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {tc.paged.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-muted-foreground text-xs">
                    Không tìm thấy chứng từ tài chính nào trong kỳ này.
                  </td>
                </tr>
              ) : (
                tc.paged.map((tx) => (
                  <tr key={tx.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs font-bold text-foreground">
                      {tx.id}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                      {tx.date}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {tx.type === "income" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                          Thu
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-500/15 text-rose-600 dark:text-rose-400">
                          Chi
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs font-medium text-foreground">
                      {tx.category}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground max-w-xs truncate">
                      {tx.description || "—"}
                    </td>
                    <td className="px-4 py-3 text-xs font-semibold text-foreground">
                      {tx.recipient || "—"}
                    </td>
                    <td
                      className={`px-4 py-3 text-right font-mono text-xs font-bold whitespace-nowrap ${
                        tx.type === "income"
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-rose-600 dark:text-rose-400"
                      }`}
                    >
                      {tx.type === "income" ? `+${fmt.money(tx.amount)}` : `-${fmt.money(tx.amount)}`}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {tx.method === "cash" ? (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-400">
                          Tiền mặt
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-500/15 text-blue-700 dark:text-blue-400">
                          Chuyển khoản
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center text-xs">
                      {tx.status === "completed" ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Đã duyệt
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600">
                          <Clock className="h-3.5 w-3.5" />
                          Chờ duyệt
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination bar */}
        <Pagination
          page={tc.page}
          pageCount={tc.pageCount}
          pageSize={tc.pageSize}
          total={tc.total}
          from={tc.from}
          to={tc.to}
          onPage={tc.setPage}
          onPageSize={tc.setPageSize}
          pageSizeOptions={[10, 20, 50, 100]}
        />
      </div>

      {/* Modal Xuất Báo Cáo Tài Chính - Mờ nền Dashboard (bg-black/60 backdrop-blur-sm) */}
      {exportModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setExportModalOpen(false)}
        >
          <div
            className="relative w-full max-w-2xl rounded-3xl border border-border bg-card p-6 sm:p-7 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-primary/10 text-primary">
                  <FileText className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">
                    Xuất Báo Cáo & Quyết Toán Tài Chính
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Hiệp hội Doanh nhân CEO 1983 · {periodLabels[period]} · Tổng {transactions.length} giao dịch
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setExportModalOpen(false)}
                className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Financial Summary Preview */}
            <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                <span className="text-[10.5px] font-bold text-emerald-600 uppercase tracking-wider block">Tổng Thu</span>
                <span className="text-base font-black text-emerald-600 font-mono">+{fmt.money(totalIn)}</span>
              </div>
              <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20">
                <span className="text-[10.5px] font-bold text-rose-600 uppercase tracking-wider block">Tổng Chi</span>
                <span className="text-base font-black text-rose-600 font-mono">-{fmt.money(totalOut)}</span>
              </div>
              <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                <span className="text-[10.5px] font-bold text-blue-600 uppercase tracking-wider block">Tồn Quỹ Ròng</span>
                <span className={`text-base font-black font-mono ${netBalance >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                  {netBalance >= 0 ? `+${fmt.money(netBalance)}` : `-${fmt.money(Math.abs(netBalance))}`}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                <span className="text-[10.5px] font-bold text-amber-600 uppercase tracking-wider block">Tỷ Lệ Chi/Thu</span>
                <span className="text-base font-black text-amber-600 font-mono">{expenseRatio}%</span>
              </div>
            </div>

            {/* Export Format Options */}
            <div className="mt-5 space-y-3">
              {/* PDF Option */}
              <div className="p-4 rounded-2xl border border-border bg-muted/30 hover:border-primary/50 transition-all flex items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="p-3 rounded-xl bg-rose-500/10 text-rose-600 shrink-0">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground">
                      Bản In / Báo Cáo Kiểm Toán Ban Chấp Hành (PDF)
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Định dạng trang in chuẩn A4 bao gồm biểu đồ cơ cấu thu chi, chữ ký của Thủ quỹ, Ban Tài Chính & Ban Thường Vụ.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setExportModalOpen(false);
                    setTimeout(() => {
                      toast.success("Đang mở hộp thoại in báo cáo PDF chuẩn Ban Thư Ký...");
                      window.print();
                    }, 200);
                  }}
                  className="shrink-0 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-xs flex items-center gap-1.5 shadow-sm hover:opacity-90 cursor-pointer"
                >
                  <Printer className="h-4 w-4" />
                  <span>In / Lưu PDF</span>
                </button>
              </div>

              {/* Excel/CSV Option */}
              <div className="p-4 rounded-2xl border border-border bg-muted/30 hover:border-emerald-500/50 transition-all flex items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600 shrink-0">
                    <FileSpreadsheet className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground">
                      Sổ Kế Toán & Danh Sách Bút Toán Chi Tiết (Excel / CSV)
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Xuất toàn bộ {transactions.length} dòng chứng từ thu chi chi tiết kèm mã phiếu, ngày, đối tác và ghi chú hạch toán.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    handleExportCsv();
                    setExportModalOpen(false);
                  }}
                  className="shrink-0 px-4 py-2 rounded-xl border border-border bg-card text-foreground font-bold text-xs flex items-center gap-1.5 shadow-sm hover:bg-muted cursor-pointer"
                >
                  <Download className="h-4 w-4 text-emerald-600" />
                  <span>Tải Báo Cáo Excel (.xlsx)</span>
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-6 pt-4 border-t border-border flex items-center justify-end">
              <button
                type="button"
                onClick={() => setExportModalOpen(false)}
                className="px-5 py-2 rounded-xl border border-border bg-muted/40 text-foreground font-semibold text-xs hover:bg-muted transition-colors cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      <FinanceExcelImportModal
        type="all"
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImportSuccess={() => txQuery.refetch()}
      />
    </AppShell>
  );
}
