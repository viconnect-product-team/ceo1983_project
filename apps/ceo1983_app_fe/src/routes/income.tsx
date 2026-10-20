import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpCircle,
  Download,
  FileDown,
  Filter,
  Pencil,
  Plus,
  Search,
  Trash2,
  Wallet,
  Receipt,
  CheckCircle2,
  Clock,
  Banknote,
  Building,
  UserCheck,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { fetchNestApi } from "@/lib/api-client";
import { AppShell } from "@/components/dashboard/AppShell";
import { PageHeader, Pill } from "@/components/dashboard/PageKit";
import { Card } from "@/components/ui/card";
import { FinanceExcelImportModal } from "@/components/dashboard/FinanceExcelImportModal";
import { FinanceChartsSection } from "@/components/dashboard/FinanceChartsSection";
import {
  createTransactionFn,
  deleteTransactionFn,
  listTransactionsFn,
  updateTransactionFn,
  type Transaction,
} from "@/lib/finance.functions";
import { downloadInvoiceVoucher } from "@/lib/invoice-receipt";
import { useFmt, useT } from "@/lib/i18n";
import { exportToExcel, formatDisplayDate, formatExcelCurrency, numberToVietnameseWords } from "@/lib/excel-export";
import { useTableControls } from "@/hooks/use-table-controls";
import { Pagination } from "@/components/dashboard/DataTablePagination";
import { StandardDateInput } from "@/components/common/StandardDateInput";
import { FormattedCurrencyInput } from "@/components/common/FormattedCurrencyInput";
import { useResizableColumns, ResizableTh } from "@/components/dashboard/ResizableTableHeaders";
import { TruncatedText } from "@/components/dashboard/TruncatedText";

type IncomeColKey =
  | "stt"
  | "id"
  | "date"
  | "category"
  | "description"
  | "recipient"
  | "amount"
  | "method"
  | "status"
  | "invoice"
  | "actions";

const initialIncomeColWidths: Record<IncomeColKey, number> = {
  stt: 60,
  id: 130,
  date: 110,
  category: 140,
  description: 240,
  recipient: 180,
  amount: 140,
  method: 120,
  status: 130,
  invoice: 100,
  actions: 110,
};

const DEFAULT_INCOME_TRANSACTIONS: Transaction[] = [
  {
    id: "PT-2026-001",
    date: "2026-03-10",
    type: "income",
    category: "membership_fee",
    description: "Thu hội phí hội viên VIP 2026",
    amount: 50000000,
    method: "bank",
    status: "completed",
    recipient: "Công ty CP Tập đoàn Hòa Bình",
  },
  {
    id: "PT-2026-002",
    date: "2026-03-09",
    type: "income",
    category: "event_ticket",
    description: "Thu vé tham dự Diễn đàn Kết nối Giao thương B2B",
    amount: 1500000,
    method: "bank",
    status: "completed",
    recipient: "Bà Trần Mai Anh",
  },
  {
    id: "PT-2026-003",
    date: "2026-03-08",
    type: "income",
    category: "event_walkin",
    description: "Thu tiền mặt trực tiếp tại bàn đón tiếp sự kiện",
    amount: 500000,
    method: "cash",
    status: "completed",
    recipient: "Ông Nguyễn Hoàng Long",
  },
  {
    id: "PT-2026-004",
    date: "2026-03-05",
    type: "income",
    category: "sponsor",
    description: "Thu gói Tài trợ Kim Cương Tech Expo 2026",
    amount: 150000000,
    method: "bank",
    status: "completed",
    recipient: "Techcombank",
  },
  {
    id: "PT-2026-005",
    date: "2026-03-02",
    type: "income",
    category: "membership_fee",
    description: "Thu phí gia nhập hội viên mới",
    amount: 15000000,
    method: "bank",
    status: "completed",
    recipient: "Công ty TNHH Smart Logistics",
  },
  {
    id: "PT-2026-006",
    date: "2026-02-28",
    type: "income",
    category: "event_walkin",
    description: "Thu đột xuất tiền mặt ủng hộ quỹ hội viên",
    amount: 2000000,
    method: "cash",
    status: "completed",
    recipient: "Ông Vũ Minh Tuấn",
  },
];

export const Route = createFileRoute("/income")({
  ssr: false,
  loader: async () => {
    try {
      const data = await listTransactionsFn();
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  },
  component: IncomePage,
  errorComponent: ({ error }) => (
    <div role="alert" className="p-6 text-sm text-destructive">
      {error?.message || "Đã xảy ra lỗi khi tải dữ liệu thu chi."}
    </div>
  ),
});

function IncomePage() {
  const t = useT();
  const fmt = useFmt();
  const { widths: colWidths, startResize } = useResizableColumns<IncomeColKey>(initialIncomeColWidths);
  const router = useRouter();
  const rawLoaderData = Route.useLoaderData();
  const loadedTransactions = Array.isArray(rawLoaderData) ? (rawLoaderData as Transaction[]) : [];

  const [transactionsList, setTransactionsList] = useState<Transaction[]>(
    loadedTransactions.length > 0 ? loadedTransactions : DEFAULT_INCOME_TRANSACTIONS,
  );

  const fetchLiveIncome = async () => {
    try {
      const res = await fetchNestApi<Transaction[]>("/admin/transactions?type=income");
      if (Array.isArray(res) && res.length > 0) {
        setTransactionsList(res);
      }
    } catch (err) {
      console.warn("[income] fetchLiveIncome error:", err);
    }
  };

  useEffect(() => {
    fetchLiveIncome();
    const handleUpdate = () => fetchLiveIncome();
    window.addEventListener("vba_transactions_changed", handleUpdate);
    window.addEventListener("finance-updated", handleUpdate);
    return () => {
      window.removeEventListener("vba_transactions_changed", handleUpdate);
      window.removeEventListener("finance-updated", handleUpdate);
    };
  }, []);

  const TRANSACTIONS = transactionsList;

  // Status filter: all | completed | pending
  const [statusFilter, setStatusFilter] = useState<"all" | "completed" | "pending">("all");
  // Method filter: all | cash (Tiền mặt) | bank (Chuyển khoản)
  const [methodFilter, setMethodFilter] = useState<"all" | "cash" | "bank">("all");
  // Category filter: all | membership_fee | event_ticket | event_walkin | sponsor | other
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [q, setQ] = useState("");

  const createFn = useServerFn(createTransactionFn);
  const updateFn = useServerFn(updateTransactionFn);
  const deleteFn = useServerFn(deleteTransactionFn);

  const [modalOpen, setModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form states
  const [formDate, setFormDate] = useState("");
  const [formCategory, setFormCategory] = useState("membership_fee");
  const [formDescription, setFormDescription] = useState("");
  const [formAmount, setFormAmount] = useState<number>(0);
  const [formMethod, setFormMethod] = useState<"cash" | "bank" | "card">("bank");
  const [formStatus, setFormStatus] = useState<"completed" | "pending">("completed");
  const [formRecipient, setFormRecipient] = useState("");

  const openCreate = (defaultCategory?: string, defaultMethod?: "cash" | "bank", defaultStatus?: "completed" | "pending") => {
    setEditing(null);
    setFormDate(new Date().toISOString().slice(0, 10));
    setFormCategory(defaultCategory || "membership_fee");
    setFormDescription(
      defaultCategory === "event_walkin"
        ? "Thu tiền mặt trực tiếp tại bàn đón tiếp sự kiện"
        : defaultCategory === "membership_fee"
        ? "Thu hội phí thường niên"
        : ""
    );
    setFormAmount(0);
    setFormMethod(defaultMethod || "bank");
    setFormStatus(defaultStatus || "completed");
    setFormRecipient("");
    setModalOpen(true);
  };

  const openEdit = (tx: Transaction) => {
    setEditing(tx);
    setFormDate(tx.date || new Date().toISOString().slice(0, 10));
    setFormCategory(tx.category);
    setFormDescription(tx.description);
    setFormAmount(tx.amount);
    setFormMethod(tx.method);
    setFormStatus(tx.status);
    setFormRecipient(tx.recipient || "");
    setModalOpen(true);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        date: formDate,
        type: "income" as const,
        category: formCategory,
        description: formDescription,
        amount: Number(formAmount),
        method: formMethod,
        status: formStatus,
        advanceAmount: 0,
        refundAmount: 0,
        recipient: formRecipient,
        invoiceUrl: editing?.invoiceUrl || `/invoices/INV-THU-${Date.now()}.pdf`,
      };

      if (editing) {
        await fetchNestApi(`/admin/transactions/${editing.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        }).catch(async () => {
          await updateFn({ data: { id: editing.id, ...payload } });
        });
        setTransactionsList((prev) =>
          prev.map((item) => (item.id === editing.id ? { ...item, ...payload } : item)),
        );
        toast.success(t("common.updated"));
      } else {
        const res: any = await fetchNestApi("/admin/transactions", {
          method: "POST",
          body: JSON.stringify(payload),
        }).catch(async () => {
          return await createFn({ data: payload });
        });
        const createdItem = res?.data || {
          ...payload,
          id: res?.id || `PT-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`,
        };
        setTransactionsList((prev) => [createdItem, ...prev]);
        toast.success(t("common.created"));
      }
      window.dispatchEvent(new Event("vba_transactions_changed"));
      window.dispatchEvent(new Event("finance-updated"));
      setModalOpen(false);
      setEditing(null);
      await router.invalidate();
    } catch {
      toast.error(t("common.saveError"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmPayment = async (tx: Transaction) => {
    try {
      await fetchNestApi(`/admin/transactions/${tx.id}`, {
        method: "PUT",
        body: JSON.stringify({ ...tx, status: "completed" }),
      }).catch(async () => {
        await updateFn({ data: { id: tx.id, status: "completed" } });
      });
      setTransactionsList((prev) =>
        prev.map((item) => (item.id === tx.id ? { ...item, status: "completed" } : item)),
      );
      toast.success(`Đã xác nhận đã thu số tiền: ${fmt.money(tx.amount)}`);
      window.dispatchEvent(new Event("vba_transactions_changed"));
      window.dispatchEvent(new Event("finance-updated"));
      await router.invalidate();
    } catch {
      toast.error("Lỗi khi xác nhận thanh toán");
    }
  };

  const onDelete = async (tx: Transaction) => {
    if (!window.confirm(t("common.confirmDelete", { name: tx.description || tx.id }))) return;
    setDeletingId(tx.id);
    try {
      await fetchNestApi(`/admin/transactions/${tx.id}`, { method: "DELETE" }).catch(async () => {
        await deleteFn({ data: { id: tx.id } });
      });
      setTransactionsList((prev) => prev.filter((item) => item.id !== tx.id));
      toast.success(t("common.deletedToast"));
      window.dispatchEvent(new Event("vba_transactions_changed"));
      window.dispatchEvent(new Event("finance-updated"));
      await router.invalidate();
    } catch {
      toast.error(t("common.deleteError"));
    } finally {
      setDeletingId(null);
    }
  };

  // Only consider income transactions
  const incomeList = useMemo(() => {
    return TRANSACTIONS.filter((tx) => tx.type === "income");
  }, [TRANSACTIONS]);

  // Breakdown by Cash vs Bank transfer
  const incomeCash = useMemo(() => {
    return incomeList
      .filter((tx) => tx.method === "cash")
      .reduce((s, tx) => s + tx.amount, 0);
  }, [incomeList]);

  const incomeBank = useMemo(() => {
    return incomeList
      .filter((tx) => tx.method === "bank" || tx.method === "card")
      .reduce((s, tx) => s + tx.amount, 0);
  }, [incomeList]);

  const totalIncome = incomeCash + incomeBank;

  const completedIncome = useMemo(() => {
    return incomeList
      .filter((tx) => tx.status === "completed")
      .reduce((s, tx) => s + tx.amount, 0);
  }, [incomeList]);

  const pendingIncome = useMemo(() => {
    return incomeList
      .filter((tx) => tx.status === "pending")
      .reduce((s, tx) => s + tx.amount, 0);
  }, [incomeList]);

  const pendingCount = useMemo(() => {
    return incomeList.filter((tx) => tx.status === "pending").length;
  }, [incomeList]);

  const walkinIncome = useMemo(() => {
    return incomeList
      .filter((tx) => tx.category === "event_walkin" || tx.description.toLowerCase().includes("trực tiếp"))
      .reduce((s, tx) => s + tx.amount, 0);
  }, [incomeList]);

  // Filtered dataset
  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return incomeList
      .filter((tx) => {
        if (statusFilter === "all") return true;
        return tx.status === statusFilter;
      })
      .filter((tx) => {
        if (methodFilter === "all") return true;
        if (methodFilter === "cash") return tx.method === "cash";
        return tx.method === "bank" || tx.method === "card";
      })
      .filter((tx) => {
        if (categoryFilter === "all") return true;
        return tx.category === categoryFilter;
      })
      .filter(
        (tx) =>
          !ql ||
          tx.id.toLowerCase().includes(ql) ||
          tx.description.toLowerCase().includes(ql) ||
          tx.category.toLowerCase().includes(ql) ||
          (tx.recipient && tx.recipient.toLowerCase().includes(ql)),
      );
  }, [q, methodFilter, categoryFilter, incomeList]);

  const tc = useTableControls<Transaction>(
    filtered,
    {
      id: (tx) => tx.id,
      date: (tx) => tx.date,
      cat: (tx) => tx.category,
      amount: (tx) => tx.amount,
      status: (tx) => tx.status,
    },
    { initialSortKey: "date", initialSortDir: "desc", initialPageSize: 20 },
  );

  const handleExport = () => {
    const totalAmount = tc.sorted.reduce((acc, tx) => acc + Number(tx.amount || 0), 0);
    const words = numberToVietnameseWords(totalAmount);

    // Group summary by category for secondary sheet
    const catMap = new Map<string, { count: number; total: number }>();
    tc.sorted.forEach((tx) => {
      const label = getCategoryLabel(tx.category);
      const curr = catMap.get(label) || { count: 0, total: 0 };
      catMap.set(label, { count: curr.count + 1, total: curr.total + Number(tx.amount || 0) });
    });
    const categorySummaryData = Array.from(catMap.entries()).map(([cat, info]) => ({
      category: cat,
      count: info.count,
      total: info.total,
      rate: totalAmount > 0 ? ((info.total / totalAmount) * 100).toFixed(1) + "%" : "0%",
    }));

    exportToExcel<Transaction>({
      title: "SỔ QUỸ TIỀN MẶT & THEO DÕI THU NỘI BỘ",
      subtitle: "Kỳ báo cáo: Năm tài chính 2026 | Hệ thống quản lý tài chính CLB Doanh Nhân CEO 1983",
      filename: "so-quy-thu-tien-mat-ceo1983",
      sheetName: "So_Quy_Thu",
      organization: "CLB DOANH NHÂN CEO 1983 (HANOIBA)",
      address: "Tòa nhà HanoiBA, TP. Hà Nội",
      circularCode: "Mẫu số S07-DN",
      circularNote: "(Ban hành theo Thông tư số 200/2014/TT-BTC ngày 22/12/2014 của Bộ Tài chính)",
      fundType: "Quỹ hoạt động CLB Doanh Nhân CEO 1983",
      currencyUnit: "VNĐ",
      columns: [
        { header: "Mã phiếu thu", key: "id", width: 16, value: (tx) => tx.id },
        { header: "Ngày ghi sổ", key: "date", width: 16, value: (tx) => formatDisplayDate(tx.date) },
        { header: "Người nộp / Đơn vị", key: "recipient", width: 30, value: (tx) => tx.recipient || "—" },
        { header: "Danh mục thu", key: "category", width: 22, value: (tx) => getCategoryLabel(tx.category) },
        { header: "Nội dung thu", key: "description", width: 38, value: (tx) => tx.description },
        { header: "Hình thức", key: "method", width: 16, value: (tx) => (tx.method === "cash" ? "Tiền mặt" : tx.method === "card" ? "Thẻ tín dụng" : "Chuyển khoản") },
        { header: "TK Đối ứng", key: "acc", width: 18, value: (tx) => (tx.method === "cash" ? "111 - Tiền mặt" : "112 - TG Ngân hàng") },
        { header: "Số tiền phát sinh Thu (VNĐ)", key: "amount", width: 22, value: (tx) => formatExcelCurrency(tx.amount) },
        { header: "Ghi chú / Trạng thái", key: "status", width: 18, value: (tx) => (tx.status === "completed" ? "Đã nhập quỹ" : "Chờ xác nhận") },
      ],
      data: tc.sorted,
      summaryRows: [
        ["TỔNG CỘNG PHÁT SINH THU TRONG KỲ:", "", "", "", "", "", "", formatExcelCurrency(totalAmount) + " đ", ""],
      ],
      amountInWords: words,
      signerTitles: ["NGƯỜI GHI SỔ / LẬP BIỂU", "THỦ QUỸ / KẾ TOÁN TRƯỞNG", "CHỦ TỊCH / ĐẠI DIỆN BQT"],
      secondarySheet: {
        sheetName: "Tong_Hop_Danh_Muc_Thu",
        title: "TỔNG HỢP NGUỒN THU THEO DANH MỤC PHÂN LOẠI",
        subtitle: "Bảng phân tích cơ cấu nguồn thu Quỹ Hiệp Hội Doanh Nhân CEO 1983",
        columns: [
          { header: "Danh mục thu", key: "category", width: 30, value: (r) => r.category },
          { header: "Số lượng giao dịch", key: "count", width: 20, value: (r) => r.count },
          { header: "Tổng số tiền (VNĐ)", key: "total", width: 25, value: (r) => formatExcelCurrency(r.total) + " đ" },
          { header: "Tỷ trọng (%)", key: "rate", width: 16, value: (r) => r.rate },
        ],
        data: categorySummaryData,
        summaryRows: [
          ["TỔNG CỘNG:", tc.sorted.length + " món", formatExcelCurrency(totalAmount) + " đ", "100%"],
        ],
      },
      voucherSheet: {
        type: "thu",
        sheetName: "Phieu_Thu_Mau_01_TT",
        sampleVoucher: {
          code: tc.sorted[0]?.id || "PT-2026-001",
          date: formatDisplayDate(tc.sorted[0]?.date || new Date()),
          personName: tc.sorted[0]?.recipient || "Đại diện Hội viên nộp quỹ",
          address: "Hà Nội",
          reason: tc.sorted[0]?.description || "Thu nộp hội phí hội viên CLB Doanh Nhân CEO 1983",
          amount: tc.sorted[0]?.amount || 50000000,
          attachedDocs: "01 Giấy báo có / Biên lai nộp tiền",
          debitAccount: tc.sorted[0]?.method === "cash" ? "111" : "112",
          creditAccount: "131, 511",
        },
      },
    });
    toast.success("Đã xuất file Excel Sổ Quỹ Thu Nội Bộ chuẩn Thông tư 200/2014/TT-BTC!");
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case "membership_fee":
        return "Phí hội viên";
      case "event_ticket":
        return "Vé sự kiện";
      case "event_walkin":
        return "Thu đột xuất (Tại sự kiện)";
      case "sponsor":
        return "Tài trợ";
      default:
        return cat;
    }
  };

  return (
    <AppShell>
      <PageHeader
        title="Quản Lý Thu"
        subtitle="Theo dõi toàn bộ nguồn thu quỹ, phí hội viên, vé sự kiện, thu đột xuất tiền mặt tại bàn đón tiếp & chuyển khoản ngân hàng"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExport}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3.5 py-2 text-sm font-medium text-foreground shadow-[var(--shadow-card)] hover:bg-muted"
            >
              <Download className="h-4 w-4 text-muted-foreground" />
              {t("common.exportExcel")}
            </button>
            <button
              onClick={() => setImportModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3.5 py-2 text-sm font-medium text-foreground shadow-[var(--shadow-card)] hover:bg-muted"
            >
              <Upload className="h-4 w-4 text-emerald-600" />
              Import Excel
            </button>
            <button
              onClick={() => openCreate("event_walkin", "cash")}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-500 px-3.5 py-2 text-sm font-black text-slate-950 shadow-sm shadow-amber-500/20 transition-colors"
            >
              <Banknote className="h-4 w-4" />
              Thu Tiền Mặt Đột Xuất
            </button>
            <button
              onClick={() => openCreate("membership_fee", "bank")}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
            >
              <Plus className="h-4 w-4" />
              Lập Phiếu Thu
            </button>
          </div>
        }
      />

      {/* ── 4 METRIC CARDS (Figma Exact Style matching Quản lý tài khoản) ── */}
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Tổng thu quỹ (Sky gradient - Blue) */}
        <div className="h-32 p-4 bg-gradient-to-b from-sky-100 to-slate-50 dark:from-sky-950/40 dark:to-slate-900 rounded-[20px] outline outline-[0.50px] outline-slate-200 dark:outline-slate-800 flex flex-col justify-start items-start gap-2.5 overflow-hidden shadow-xs">
          <div className="h-8 flex items-center gap-2">
            <img src="/icons/ceo1983_icon_2/users-round-1.svg" className="h-4 w-4" alt="users" onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }} />
            <div className="text-blue-600 dark:text-blue-400 text-xs font-semibold font-['Inter']">TỔNG THU QUỸ</div>
          </div>
          <div className="text-slate-900 dark:text-slate-100 text-2xl font-bold font-['Inter'] leading-7">
            {fmt.money(totalIncome)}
          </div>
          <div className="text-slate-500 dark:text-slate-400 text-xs font-normal font-['Inter']">
            Toàn bộ các nguồn thu quỹ hội
          </div>
        </div>

        {/* Card 2: Đã Thu Thực Tế (Emerald gradient - Green) */}
        <div
          onClick={() => setStatusFilter(statusFilter === "completed" ? "all" : "completed")}
          className={`h-32 p-4 bg-gradient-to-b from-emerald-100 to-white dark:from-emerald-950/40 dark:to-slate-900 rounded-[20px] outline outline-[0.50px] outline-slate-200 dark:outline-slate-800 flex flex-col justify-start items-start gap-2.5 overflow-hidden shadow-xs cursor-pointer hover:shadow-md transition-all ${
            statusFilter === "completed" ? "ring-2 ring-emerald-500" : ""
          }`}
        >
          <div className="h-8 flex items-center gap-2">
            <img src="/icons/ceo1983_icon_2/circle-check.svg" className="h-4 w-4" alt="check" onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }} />
            <div className="text-emerald-600 dark:text-emerald-400 text-xs font-semibold font-['Inter']">ĐÃ THU THỰC TẾ</div>
          </div>
          <div className="text-slate-900 dark:text-slate-100 text-2xl font-bold font-['Inter'] leading-7">
            {fmt.money(completedIncome)}
          </div>
          <div className="text-slate-500 dark:text-slate-400 text-xs font-normal font-['Inter']">
            Đã thanh toán &amp; vào quỹ an toàn
          </div>
        </div>

        {/* Card 3: Chờ Thanh Toán (Amber / Orange gradient) */}
        <div
          onClick={() => setStatusFilter(statusFilter === "pending" ? "all" : "pending")}
          className={`h-32 p-4 bg-gradient-to-b from-orange-100 to-white dark:from-orange-950/40 dark:to-slate-900 rounded-[20px] outline outline-[0.50px] outline-slate-200 dark:outline-slate-800 flex flex-col justify-start items-start gap-2.5 overflow-hidden shadow-xs cursor-pointer hover:shadow-md transition-all ${
            statusFilter === "pending" ? "ring-2 ring-amber-500" : ""
          }`}
        >
          <div className="h-8 flex items-center gap-2">
            <img src="/icons/ceo1983_icon_2/building-2-1.svg" className="h-4 w-4" alt="building" onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }} />
            <div className="text-orange-500 dark:text-orange-400 text-xs font-semibold font-['Inter']">CHỜ THANH TOÁN</div>
          </div>
          <div className="text-slate-900 dark:text-slate-100 text-2xl font-bold font-['Inter'] leading-7">
            {fmt.money(pendingIncome)}
          </div>
          <div className="text-slate-500 dark:text-slate-400 text-xs font-normal font-['Inter']">
            {pendingCount} khoản đang chờ xác nhận
          </div>
        </div>

        {/* Card 4: Thu Tiền Mặt (Violet gradient - Indigo) */}
        <div className="h-32 p-4 bg-gradient-to-b from-violet-100 to-white dark:from-violet-950/40 dark:to-slate-900 rounded-[20px] outline outline-[0.50px] outline-slate-200 dark:outline-slate-800 flex flex-col justify-start items-start gap-2.5 overflow-hidden shadow-xs">
          <div className="h-8 flex items-center gap-2">
            <img src="/icons/ceo1983_icon_2/shield-check.svg" className="h-4 w-4" alt="shield" onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }} />
            <div className="text-indigo-500 dark:text-indigo-400 text-xs font-semibold font-['Inter']">THU TIỀN MẶT</div>
          </div>
          <div className="text-slate-900 dark:text-slate-100 text-2xl font-bold font-['Inter'] leading-7">
            {fmt.money(incomeCash)}
          </div>
          <div className="text-slate-500 dark:text-slate-400 text-xs font-normal font-['Inter']">
            Thu trực tiếp tại quầy &amp; sự kiện
          </div>
        </div>
      </div>

      {/* Biểu Đồ Trực Quan Cơ Cấu Nguồn Thu & Nhà Tài Trợ */}
      <FinanceChartsSection
        transactions={TRANSACTIONS.length > 0 ? TRANSACTIONS : DEFAULT_INCOME_TRANSACTIONS}
        defaultTab="income_sponsor"
        hideTabs={false}
        title="Biểu Đồ Phân Tích Cơ Cấu Nguồn Thu & Tài Trợ"
        subtitle="Trực quan hóa tỷ trọng Hội phí, Nhà tài trợ sự kiện, Vé tham gia và các nguồn thu khác"
        className="mb-6"
      />

      {/* Filter Toolbar */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-3 shadow-[var(--shadow-card)]">
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter: Tất cả | Đã thu | Chờ thanh toán */}
          <div className="flex items-center rounded-xl bg-muted/60 p-1">
            <button
              onClick={() => setStatusFilter("all")}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition-colors cursor-pointer ${
                statusFilter === "all" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Tất cả ({incomeList.length})
            </button>
            <button
              onClick={() => setStatusFilter("completed")}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition-colors cursor-pointer ${
                statusFilter === "completed" ? "bg-emerald-600 text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Đã thu
            </button>
            <button
              onClick={() => setStatusFilter("pending")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-semibold transition-colors cursor-pointer ${
                statusFilter === "pending" ? "bg-amber-500 text-slate-950 font-bold shadow-sm" : "text-amber-600 hover:text-amber-700"
              }`}
            >
              <span>Chờ thanh toán</span>
              {pendingCount > 0 && (
                <span className="rounded-full bg-amber-200 dark:bg-amber-900/60 px-1.5 py-0.2 text-[10px] font-black text-amber-900 dark:text-amber-200">
                  {pendingCount}
                </span>
              )}
            </button>
          </div>

          {/* Method Filter */}
          <div className="flex items-center rounded-xl bg-muted/60 p-1">
            <button
              onClick={() => setMethodFilter("all")}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition-colors ${
                methodFilter === "all" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Tất cả PT
            </button>
            <button
              onClick={() => setMethodFilter("cash")}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition-colors ${
                methodFilter === "cash" ? "bg-emerald-600 text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Tiền mặt
            </button>
            <button
              onClick={() => setMethodFilter("bank")}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition-colors ${
                methodFilter === "bank" ? "bg-blue-600 text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Chuyển khoản
            </button>
          </div>

          {/* Category Filter */}
          <div className="flex items-center rounded-xl bg-muted/60 p-1">
            <button
              onClick={() => setCategoryFilter("all")}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition-colors ${
                categoryFilter === "all" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Tất cả nguồn thu
            </button>
            <button
              onClick={() => setCategoryFilter("membership_fee")}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition-colors ${
                categoryFilter === "membership_fee" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Phí hội viên
            </button>
            <button
              onClick={() => setCategoryFilter("event_ticket")}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition-colors ${
                categoryFilter === "event_ticket" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Vé sự kiện
            </button>
            <button
              onClick={() => setCategoryFilter("event_walkin")}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition-colors ${
                categoryFilter === "event_walkin" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Thu đột xuất
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative min-w-[240px] flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Tìm theo mã, nội dung, người nộp..."
            className="w-full rounded-xl border border-input bg-background pl-9 pr-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Main Income Table */}
      <Card className="overflow-hidden">
        <div className="relative overflow-x-auto">
          <table className="w-full border-separate border-spacing-0 text-left text-sm table-fixed">
          <thead className="border-b border-border bg-secondary/80 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            <tr>
              <ResizableTh colKey="stt" width={colWidths.stt} onResize={startResize} className="sticky left-0 z-20 bg-secondary/90 px-3 py-3 text-center text-xs font-bold border-b border-border">
                STT
              </ResizableTh>
              <ResizableTh colKey="id" width={colWidths.id} onResize={startResize} style={{ left: `${colWidths.stt}px` }} className="sticky z-20 bg-secondary/90 px-4 py-3 text-xs font-bold border-b border-border">
                Mã phiếu thu
              </ResizableTh>
              <ResizableTh colKey="date" width={colWidths.date} onResize={startResize} className="px-4 py-3 border-b border-border">
                Ngày thu
              </ResizableTh>
              <ResizableTh colKey="category" width={colWidths.category} onResize={startResize} className="px-4 py-3 border-b border-border">
                Danh mục thu
              </ResizableTh>
              <ResizableTh colKey="description" width={colWidths.description} onResize={startResize} className="px-4 py-3 border-b border-border">
                Nội dung thu
              </ResizableTh>
              <ResizableTh colKey="recipient" width={colWidths.recipient} onResize={startResize} className="px-4 py-3 border-b border-border">
                Người nộp / Đơn vị
              </ResizableTh>
              <ResizableTh colKey="amount" width={colWidths.amount} onResize={startResize} className="px-4 py-3 text-right font-bold text-emerald-600 border-b border-border">
                Số tiền
              </ResizableTh>
              <ResizableTh colKey="method" width={colWidths.method} onResize={startResize} className="px-4 py-3 border-b border-border">
                Hình thức
              </ResizableTh>
              <ResizableTh colKey="status" width={colWidths.status} onResize={startResize} className="px-4 py-3 border-b border-border">
                Trạng thái
              </ResizableTh>
              <ResizableTh colKey="invoice" width={colWidths.invoice} onResize={startResize} className="px-4 py-3 text-center border-b border-border">
                Tải hóa đơn
              </ResizableTh>
              <ResizableTh colKey="actions" width={colWidths.actions} onResize={startResize} className="sticky right-0 z-20 bg-secondary/90 px-4 py-3 text-right text-xs font-bold border-b border-border">
                Thao tác
              </ResizableTh>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {(tc?.paged || []).length === 0 ? (
              <tr>
                <td colSpan={11} className="py-12 text-center text-muted-foreground">
                  Không tìm thấy khoản thu nào phù hợp
                </td>
              </tr>
            ) : (
              (tc?.paged || []).map((tx, idx) => (
                <tr key={tx.id} className="group hover:bg-muted/30 transition-colors border-b border-border/50">
                  <td style={{ width: `${colWidths.stt}px`, maxWidth: `${colWidths.stt}px` }} className="sticky left-0 z-10 bg-card px-3 py-3 text-center font-mono text-xs font-semibold text-muted-foreground group-hover:bg-muted/70 border-b border-border/50">
                    {(tc.page - 1) * tc.pageSize + idx + 1}
                  </td>
                  <td style={{ width: `${colWidths.id}px`, maxWidth: `${colWidths.id}px`, left: `${colWidths.stt}px` }} className="sticky z-10 bg-card px-4 py-3 font-mono text-xs font-bold text-foreground group-hover:bg-muted/70 border-b border-border/50">
                    <TruncatedText text={tx.id} maxWidth="w-full" />
                  </td>
                  <td style={{ width: `${colWidths.date}px`, maxWidth: `${colWidths.date}px` }} className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap border-b border-border/50">
                    {tx.date}
                  </td>
                  <td style={{ width: `${colWidths.category}px`, maxWidth: `${colWidths.category}px` }} className="px-4 py-3 text-xs border-b border-border/50">
                    {tx.category === "event_walkin" ? (
                      <Pill tone="warn">Thu đột xuất</Pill>
                    ) : (
                      <TruncatedText text={getCategoryLabel(tx.category)} maxWidth="w-full" />
                    )}
                  </td>
                  <td style={{ width: `${colWidths.description}px`, maxWidth: `${colWidths.description}px` }} className="px-4 py-3 text-xs font-medium border-b border-border/50">
                    <TruncatedText text={tx.description || "—"} maxWidth="w-full" />
                  </td>
                  <td style={{ width: `${colWidths.recipient}px`, maxWidth: `${colWidths.recipient}px` }} className="px-4 py-3 text-xs font-semibold text-foreground border-b border-border/50">
                    <TruncatedText text={tx.recipient || "—"} maxWidth="w-full" />
                  </td>
                  <td style={{ width: `${colWidths.amount}px`, maxWidth: `${colWidths.amount}px` }} className="px-4 py-3 text-right font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap border-b border-border/50">
                    +{fmt.money(tx.amount)}
                  </td>
                  <td style={{ width: `${colWidths.method}px`, maxWidth: `${colWidths.method}px` }} className="px-4 py-3 text-xs border-b border-border/50">
                    {tx.method === "cash" ? (
                      <Pill tone="success">Tiền mặt</Pill>
                    ) : (
                      <Pill tone="info">Chuyển khoản</Pill>
                    )}
                  </td>
                  <td style={{ width: `${colWidths.status}px`, maxWidth: `${colWidths.status}px` }} className="px-4 py-3 text-xs border-b border-border/50">
                    {tx.status === "completed" ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">Đã xác nhận</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-amber-600 font-medium">
                        <Clock className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">Chờ xác nhận</span>
                      </span>
                    )}
                  </td>

                  {/* Column Tải hóa đơn / Phiếu thu on each row */}
                  <td style={{ width: `${colWidths.invoice}px`, maxWidth: `${colWidths.invoice}px` }} className="px-4 py-3 text-center border-b border-border/50">
                    <button
                      type="button"
                      onClick={() =>
                        downloadInvoiceVoucher({
                          id: tx.id,
                          date: tx.date,
                          type: "income",
                          category: tx.category,
                          description: tx.description,
                          amount: tx.amount,
                          method: tx.method,
                          status: tx.status,
                          recipient: tx.recipient,
                        })
                      }
                      title="Tải phiếu thu / Hóa đơn điện tử PDF"
                      className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-2.5 py-1 text-xs font-medium text-foreground shadow-xs hover:bg-muted cursor-pointer transition-colors"
                    >
                      <FileDown className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                      <span>Tải HĐ</span>
                    </button>
                  </td>

                  {/* Actions */}
                  <td style={{ width: `${colWidths.actions}px`, maxWidth: `${colWidths.actions}px` }} className="sticky right-0 z-10 bg-card px-4 py-3 text-right whitespace-nowrap group-hover:bg-muted/70 border-b border-border/50">
                    <div className="flex items-center justify-end gap-1.5">
                      {tx.status === "pending" && (
                        <button
                          type="button"
                          onClick={() => handleConfirmPayment(tx)}
                          className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 cursor-pointer transition-colors"
                          title="Xác nhận đã nhận đủ số tiền khoản thu này"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                          <span>Đã thu</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => openEdit(tx)}
                        title="Sửa phiếu thu"
                        className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(tx)}
                        disabled={deletingId === tx.id}
                        title="Xóa"
                        className="rounded-lg p-1.5 text-rose-600 hover:bg-rose-500/10 cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
        <Pagination
          page={tc.page}
          pageCount={tc.pageCount}
          pageSize={tc.pageSize}
          total={tc.total}
          from={tc.from}
          to={tc.to}
          onPage={tc.setPage}
          onPageSize={tc.setPageSize}
        />
      </Card>

      {/* Modal Lập / Sửa Phiếu Thu */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-foreground">
              {editing ? "Sửa Phiếu Thu" : "Lập Phiếu Thu Mới"}
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Ghi nhận nguồn thu quỹ, phí hội viên hoặc thanh toán tiền mặt trực tiếp tại sự kiện
            </p>

            <form onSubmit={onSubmit} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground">Ngày thu (dd/mm/yyyy)</label>
                  <StandardDateInput
                    required
                    value={formDate}
                    placeholder="dd/mm/yyyy (VD: 25/10/2026)"
                    onChange={(iso) => setFormDate(iso)}
                    className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground">Danh mục thu</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="membership_fee">Phí hội viên thường niên</option>
                    <option value="event_ticket">Vé tham gia sự kiện</option>
                    <option value="event_walkin">Thu tiền mặt trực tiếp (Đột xuất tại sự kiện)</option>
                    <option value="sponsor">Tài trợ sự kiện / hiệp hội</option>
                    <option value="other">Khoản thu khác</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">Người nộp / Doanh nghiệp</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Ông Trần Văn B (CEO Công ty XYZ) / Khách vãng lai"
                  value={formRecipient}
                  onChange={(e) => setFormRecipient(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">Nội dung thu</label>
                <input
                  type="text"
                  required
                  placeholder="Diễn giải chi tiết lý do thu..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground">Số tiền thu</label>
                  <div className="mt-1">
                    <FormattedCurrencyInput
                      value={formAmount}
                      allowCurrencySwitch={true}
                      onChange={(_formatted, num) => setFormAmount(num)}
                      className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-primary text-emerald-600"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground">Phương thức thanh toán</label>
                  <select
                    value={formMethod}
                    onChange={(e) => setFormMethod(e.target.value as any)}
                    className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="cash">Tiền mặt (Thu tại bàn tiếp đón)</option>
                    <option value="bank">Chuyển khoản (VietQR / Ngân hàng)</option>
                    <option value="card">Quẹt thẻ POS</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">Trạng thái ghi nhận</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as any)}
                  className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="completed">Đã nhận tiền thành công</option>
                  <option value="pending">Chờ xác nhận giao dịch</option>
                </select>
              </div>

              <div className="mt-6 flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl border border-border px-4 py-2 text-xs font-medium text-muted-foreground hover:bg-muted"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-700 shadow-sm disabled:opacity-50"
                >
                  {submitting ? "Đang lưu..." : editing ? "Lưu thay đổi" : "Tạo phiếu thu"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import Excel Modal */}
      <FinanceExcelImportModal
        type="income"
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onImportSuccess={() => router.invalidate()}
      />
    </AppShell>
  );
}
