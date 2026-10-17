import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowDownCircle,
  Download,
  FileDown,
  Filter,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Trash2,
  Wallet,
  Receipt,
  CheckCircle2,
  Clock,
  Banknote,
  Building,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { AppShell } from "@/components/dashboard/AppShell";
import { PageHeader, Pill } from "@/components/dashboard/PageKit";
import { Card } from "@/components/ui/card";
import { FinanceExcelImportModal } from "@/components/dashboard/FinanceExcelImportModal";
import {
  createTransactionFn,
  deleteTransactionFn,
  listTransactionsFn,
  updateTransactionFn,
  type Transaction,
} from "@/lib/finance.functions";
import { downloadInvoiceVoucher } from "@/lib/invoice-receipt";
import { useFmt, useT } from "@/lib/i18n";
import { exportToExcel, formatDisplayDate, formatExcelCurrency } from "@/lib/excel-export";
import { useTableControls } from "@/hooks/use-table-controls";
import { Pagination } from "@/components/dashboard/DataTablePagination";
import { StandardDateInput } from "@/components/common/StandardDateInput";
import { FormattedCurrencyInput } from "@/components/common/FormattedCurrencyInput";

const DEFAULT_EXPENSES_TRANSACTIONS: Transaction[] = [
  {
    id: "PC-2026-001",
    date: "2026-03-09",
    type: "expense",
    category: "event",
    description: "Chi phí thuê trung tâm hội nghị & teabreak",
    amount: 35000000,
    method: "bank",
    status: "completed",
    recipient: "Trung tâm Hội nghị Quốc gia",
  },
  {
    id: "PC-2026-002",
    date: "2026-03-08",
    type: "expense",
    category: "operation",
    description: "Chi phí hạ tầng máy chủ Cloud & bảo mật hệ thống",
    amount: 12000000,
    method: "bank",
    status: "completed",
    recipient: "VNPT Cloud / AWS",
  },
  {
    id: "PC-2026-003",
    date: "2026-03-06",
    type: "expense",
    category: "marketing",
    description: "In ấn backdrop, tài liệu & kỷ yếu hội viên",
    amount: 8500000,
    method: "cash",
    status: "completed",
    recipient: "Công ty In ấn Tiến Phát",
  },
  {
    id: "PC-2026-004",
    date: "2026-03-03",
    type: "expense",
    category: "admin",
    description: "Văn phòng phẩm và bưu chính gửi giấy mời đại hội",
    amount: 3200000,
    method: "cash",
    status: "completed",
    recipient: "Bưu chính Viettel Post",
  },
  {
    id: "PC-2026-005",
    date: "2026-02-27",
    type: "expense",
    category: "event",
    description: "Tạm ứng chi phí đón tiếp đoàn đại biểu quốc tế",
    amount: 15000000,
    advanceAmount: 15000000,
    refundAmount: 2000000,
    method: "bank",
    status: "completed",
    recipient: "Ban Đối ngoại Hiệp hội",
  },
];

export const Route = createFileRoute("/expenses")({
  ssr: false,
  loader: async () => {
    try {
      const data = await listTransactionsFn();
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  },
  component: ExpensesPage,
  errorComponent: ({ error }) => (
    <div role="alert" className="p-6 text-sm text-destructive">
      {error?.message || "Đã xảy ra lỗi khi tải dữ liệu chi tiêu."}
    </div>
  ),
});

function ExpensesPage() {
  const t = useT();
  const fmt = useFmt();
  const router = useRouter();
  const rawLoaderData = Route.useLoaderData();
  const loadedTransactions = Array.isArray(rawLoaderData) ? (rawLoaderData as Transaction[]) : [];
  const TRANSACTIONS = loadedTransactions;

  // Filter: all | cash (Tiền mặt) | bank (Chuyển khoản)
  const [methodFilter, setMethodFilter] = useState<"all" | "cash" | "bank">("all");
  // Sub-filter: all | standard (Chi tiêu thường) | advance (Tạm ứng)
  const [categoryFilter, setCategoryFilter] = useState<"all" | "advance" | "standard">("all");
  const [q, setQ] = useState("");

  const createFn = useServerFn(createTransactionFn);
  const updateFn = useServerFn(updateTransactionFn);
  const deleteFn = useServerFn(deleteTransactionFn);

  const [modalOpen, setModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [refundingTx, setRefundingTx] = useState<Transaction | null>(null);
  const [refundAmountInput, setRefundAmountInput] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form states for Expense
  const [formDate, setFormDate] = useState("");
  const [formCategory, setFormCategory] = useState("operation");
  const [formDescription, setFormDescription] = useState("");
  const [formAmount, setFormAmount] = useState<number>(0);
  const [formMethod, setFormMethod] = useState<"cash" | "bank" | "card">("bank");
  const [formStatus, setFormStatus] = useState<"completed" | "pending">("completed");
  const [formAdvanceAmount, setFormAdvanceAmount] = useState<number>(0);
  const [formRefundAmount, setFormRefundAmount] = useState<number>(0);
  const [formRecipient, setFormRecipient] = useState("");

  const openCreate = (isAdvance: boolean = false) => {
    setEditing(null);
    setFormDate(new Date().toISOString().slice(0, 10));
    setFormCategory(isAdvance ? "advance" : "operation");
    setFormDescription(isAdvance ? "Tạm ứng kinh phí hoạt động/sự kiện" : "");
    setFormAmount(0);
    setFormMethod("bank");
    setFormStatus("completed");
    setFormAdvanceAmount(0);
    setFormRefundAmount(0);
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
    setFormAdvanceAmount(tx.advanceAmount || (tx.category === "advance" ? tx.amount : 0));
    setFormRefundAmount(tx.refundAmount || 0);
    setFormRecipient(tx.recipient || "");
    setModalOpen(true);
  };

  const openRefundModal = (tx: Transaction) => {
    setRefundingTx(tx);
    setRefundAmountInput(tx.refundAmount || 0);
    setRefundModalOpen(true);
  };

  const handleSaveRefund = async () => {
    if (!refundingTx) return;
    const refVal = Number(refundAmountInput) || 0;
    const advVal = refundingTx.advanceAmount || refundingTx.amount;
    if (refVal < 0) {
      toast.error("Số tiền hoàn ứng không được âm");
      return;
    }
    if (refVal > advVal) {
      toast.error("Số tiền hoàn ứng không thể vượt quá số tiền đã tạm ứng");
      return;
    }

    setSubmitting(true);
    try {
      await updateFn({
        data: {
          id: refundingTx.id,
          date: refundingTx.date,
          type: "expense",
          category: refundingTx.category,
          description: refundingTx.description,
          amount: refundingTx.amount,
          method: refundingTx.method,
          status: refundingTx.status,
          advanceAmount: advVal,
          refundAmount: refVal,
          recipient: refundingTx.recipient || "",
          invoiceUrl: refundingTx.invoiceUrl || "",
        },
      });
      toast.success("Cập nhật hoàn ứng tiền thừa thành công!");
      setRefundModalOpen(false);
      setRefundingTx(null);
      await router.invalidate();
    } catch {
      toast.error("Lỗi khi cập nhật hoàn ứng");
    } finally {
      setSubmitting(false);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const isAdvance = formCategory === "advance";
      const payload = {
        date: formDate,
        type: "expense" as const,
        category: formCategory,
        description: formDescription,
        amount: Number(formAmount),
        method: formMethod,
        status: formStatus,
        advanceAmount: isAdvance ? Number(formAdvanceAmount || formAmount) : 0,
        refundAmount: isAdvance ? Number(formRefundAmount) : 0,
        recipient: formRecipient,
        invoiceUrl: editing?.invoiceUrl || `/invoices/INV-CHI-${Date.now()}.pdf`,
      };

      if (editing) {
        await updateFn({ data: { id: editing.id, ...payload } });
        toast.success(t("common.updated"));
      } else {
        await createFn({ data: payload });
        toast.success(t("common.created"));
      }
      setModalOpen(false);
      setEditing(null);
      await router.invalidate();
    } catch {
      toast.error(t("common.saveError"));
    } finally {
      setSubmitting(false);
    }
  };

  const onDelete = async (tx: Transaction) => {
    if (!window.confirm(t("common.confirmDelete", { name: tx.description || tx.id }))) return;
    setDeletingId(tx.id);
    try {
      await deleteFn({ data: { id: tx.id } });
      toast.success(t("common.deletedToast"));
      await router.invalidate();
    } catch {
      toast.error(t("common.deleteError"));
    } finally {
      setDeletingId(null);
    }
  };

  // Only consider expense transactions
  const expenseList = useMemo(() => {
    return TRANSACTIONS.filter((tx) => tx.type === "expense");
  }, [TRANSACTIONS]);

  // Accurate Calculation Formula:
  // Direct Expenses: Category is not advance, advanceAmount is 0
  const directExpense = useMemo(() => {
    return expenseList
      .filter((tx) => tx.category !== "advance" && (!tx.advanceAmount || tx.advanceAmount === 0))
      .reduce((s, tx) => s + tx.amount, 0);
  }, [expenseList]);

  // Advance payments total
  const totalAdvance = useMemo(() => {
    return expenseList.reduce(
      (s, tx) => s + (tx.advanceAmount || (tx.category === "advance" ? tx.amount : 0)),
      0,
    );
  }, [expenseList]);

  // Total excess money returned from advance payments (Hoàn ứng tiền thừa)
  const totalRefunded = useMemo(() => {
    return expenseList.reduce((s, tx) => s + (tx.refundAmount || 0), 0);
  }, [expenseList]);

  // User Strict Formula: Tổng chi = Chi trực tiếp + Tạm ứng - Hoàn ứng tiền thừa
  const totalActualExpense = directExpense + totalAdvance - totalRefunded;

  // Breakdown by payment method: Tiền mặt vs Chuyển khoản (accounting for refund)
  const expenseCash = useMemo(() => {
    return expenseList
      .filter((tx) => tx.method === "cash")
      .reduce((s, tx) => {
        const adv = tx.advanceAmount || (tx.category === "advance" ? tx.amount : 0);
        if (adv > 0) {
          return s + (adv - (tx.refundAmount || 0));
        }
        return s + tx.amount;
      }, 0);
  }, [expenseList]);

  const expenseBank = useMemo(() => {
    return expenseList
      .filter((tx) => tx.method === "bank" || tx.method === "card")
      .reduce((s, tx) => {
        const adv = tx.advanceAmount || (tx.category === "advance" ? tx.amount : 0);
        if (adv > 0) {
          return s + (adv - (tx.refundAmount || 0));
        }
        return s + tx.amount;
      }, 0);
  }, [expenseList]);

  // Filtered dataset
  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return expenseList
      .filter((tx) => {
        if (methodFilter === "all") return true;
        if (methodFilter === "cash") return tx.method === "cash";
        return tx.method === "bank" || tx.method === "card";
      })
      .filter((tx) => {
        if (categoryFilter === "all") return true;
        if (categoryFilter === "advance") return tx.category === "advance" || (tx.advanceAmount && tx.advanceAmount > 0);
        return tx.category !== "advance" && (!tx.advanceAmount || tx.advanceAmount === 0);
      })
      .filter(
        (tx) =>
          !ql ||
          tx.id.toLowerCase().includes(ql) ||
          tx.description.toLowerCase().includes(ql) ||
          tx.category.toLowerCase().includes(ql) ||
          (tx.recipient && tx.recipient.toLowerCase().includes(ql)),
      );
  }, [q, methodFilter, categoryFilter, expenseList]);

  const tc = useTableControls<Transaction>(
    filtered,
    {
      id: (tx) => tx.id,
      date: (tx) => tx.date,
      type: (tx) => tx.type,
      cat: (tx) => tx.category,
      amount: (tx) => tx.amount,
      status: (tx) => tx.status,
    },
    { initialSortKey: "date", initialSortDir: "desc", initialPageSize: 20 },
  );

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case "operation":
        return "Vận hành thường xuyên";
      case "event":
        return "Tổ chức sự kiện";
      case "marketing":
        return "Truyền thông & quảng bá";
      case "advance":
        return "Tạm ứng công tác / sự kiện";
      case "hospitality":
        return "Tiếp khách & đối ngoại";
      default:
        return cat || "Chi khác";
    }
  };

  const handleExport = () => {
    const totalAmount = tc.sorted.reduce((acc, tx) => acc + Number(tx.amount || 0), 0);
    const totalAdvance = tc.sorted.reduce((acc, tx) => acc + Number(tx.advanceAmount || 0), 0);
    const totalRefund = tc.sorted.reduce((acc, tx) => acc + Number(tx.refundAmount || 0), 0);
    const totalActual = tc.sorted.reduce(
      (acc, tx) =>
        acc +
        (tx.advanceAmount
          ? tx.advanceAmount - (tx.refundAmount || 0)
          : tx.amount || 0),
      0
    );

    exportToExcel<Transaction>({
      title: "BÁO CÁO SỔ THEO DÕI CHI PHÍ & TẠM ỨNG HIỆP HỘI",
      subtitle: "Hệ thống quản lý tài chính & thu chi Hiệp Hội Doanh Nhân CEO 1983",
      filename: "so-theo-doi-chi-phi-ceo1983",
      sheetName: "Nhat_Ky_Chi",
      columns: [
        { header: "Mã phiếu chi", key: "id", width: 16, value: (tx) => tx.id },
        { header: "Ngày chi", key: "date", width: 16, value: (tx) => formatDisplayDate(tx.date) },
        { header: "Danh mục chi", key: "category", width: 24, value: (tx) => getCategoryLabel(tx.category) },
        { header: "Nội dung chi", key: "description", width: 38, value: (tx) => tx.description },
        { header: "Người nhận / Đơn vị", key: "recipient", width: 28, value: (tx) => tx.recipient || "—" },
        { header: "Số tiền chi (VNĐ)", key: "amount", width: 20, value: (tx) => formatExcelCurrency(tx.amount) },
        { header: "Số tiền tạm ứng", key: "advanceAmount", width: 20, value: (tx) => formatExcelCurrency(tx.advanceAmount || 0) },
        { header: "Hoàn ứng tiền thừa", key: "refundAmount", width: 20, value: (tx) => formatExcelCurrency(tx.refundAmount || 0) },
        {
          header: "Chi thực tế (VNĐ)",
          key: "actualAmount",
          width: 20,
          value: (tx) =>
            formatExcelCurrency(
              tx.advanceAmount
                ? tx.advanceAmount - (tx.refundAmount || 0)
                : tx.amount || 0
            ),
        },
        { header: "Hình thức", key: "method", width: 16, value: (tx) => (tx.method === "cash" ? "Tiền mặt" : tx.method === "card" ? "Thẻ tín dụng" : "Chuyển khoản") },
        { header: "Trạng thái", key: "status", width: 16, value: (tx) => (tx.status === "completed" ? "Đã duyệt" : "Chờ duyệt") },
      ],
      data: tc.sorted,
      summaryRows: [
        [
          "TỔNG CỘNG THỰC CHI:",
          "",
          "",
          "",
          "",
          formatExcelCurrency(totalAmount) + " đ",
          formatExcelCurrency(totalAdvance) + " đ",
          formatExcelCurrency(totalRefund) + " đ",
          formatExcelCurrency(totalActual) + " đ",
          "",
          "",
        ],
      ],
      signerTitles: ["NGƯỜI LẬP BIỂU", "KẾ TOÁN TRƯỞNG / TRƯỞNG BAN", "CHỦ TỊCH / ĐẠI DIỆN BQT"],
    });
  };

  return (
    <AppShell>
      <PageHeader
        title="Quản Lý Chi & Tạm Ứng"
        subtitle="Theo dõi toàn diện các khoản chi tiêu, phân loại tiền mặt / chuyển khoản, quản lý tạm ứng và hoàn ứng tiền thừa minh bạch chuẩn xác"
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
              <Upload className="h-4 w-4 text-rose-600" />
              Import Excel
            </button>
            <button
              onClick={() => openCreate(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-500 px-3.5 py-2 text-sm font-black text-slate-950 shadow-sm shadow-amber-500/20 transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
              Lập Phiếu Tạm Ứng
            </button>
            <button
              onClick={() => openCreate(false)}
              className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-rose-700"
            >
              <Plus className="h-4 w-4" />
              Lập Phiếu Chi
            </button>
          </div>
        }
      />

      {/* ── 4 METRIC CARDS (Figma Exact Style matching Quản lý tài khoản) ── */}
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Tổng Chi Thực Tế (Sky gradient - Blue) */}
        <div className="h-32 p-4 bg-gradient-to-b from-sky-100 to-slate-50 dark:from-sky-950/40 dark:to-slate-900 rounded-[20px] outline outline-[0.50px] outline-slate-200 dark:outline-slate-800 flex flex-col justify-start items-start gap-2.5 overflow-hidden shadow-xs">
          <div className="h-8 flex items-center gap-2">
            <img src="/icons/ceo1983_icon_2/users-round-1.svg" className="h-4 w-4" alt="users" onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }} />
            <div className="text-blue-600 dark:text-blue-400 text-xs font-semibold font-['Inter']">TỔNG CHI THỰC TẾ</div>
          </div>
          <div className="text-slate-900 dark:text-slate-100 text-2xl font-bold font-['Inter'] leading-7">
            {fmt.money(totalActualExpense)}
          </div>
          <div className="text-slate-500 dark:text-slate-400 text-xs font-normal font-['Inter']">
            Chi trực tiếp + Tạm ứng - Hoàn ứng
          </div>
        </div>

        {/* Card 2: Chi Tiền Mặt (Violet gradient - Indigo) */}
        <div className="h-32 p-4 bg-gradient-to-b from-violet-100 to-white dark:from-violet-950/40 dark:to-slate-900 rounded-[20px] outline outline-[0.50px] outline-slate-200 dark:outline-slate-800 flex flex-col justify-start items-start gap-2.5 overflow-hidden shadow-xs">
          <div className="h-8 flex items-center gap-2">
            <img src="/icons/ceo1983_icon_2/shield-check.svg" className="h-4 w-4" alt="shield" onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }} />
            <div className="text-indigo-500 dark:text-indigo-400 text-xs font-semibold font-['Inter']">CHI TIỀN MẶT</div>
          </div>
          <div className="text-slate-900 dark:text-slate-100 text-2xl font-bold font-['Inter'] leading-7">
            {fmt.money(expenseCash)}
          </div>
          <div className="text-slate-500 dark:text-slate-400 text-xs font-normal font-['Inter']">
            Thanh toán tiền mặt trực tiếp
          </div>
        </div>

        {/* Card 3: Chi Chuyển Khoản (Orange gradient - Orange) */}
        <div className="h-32 p-4 bg-gradient-to-b from-orange-100 to-white dark:from-orange-950/40 dark:to-slate-900 rounded-[20px] outline outline-[0.50px] outline-slate-200 dark:outline-slate-800 flex flex-col justify-start items-start gap-2.5 overflow-hidden shadow-xs">
          <div className="h-8 flex items-center gap-2">
            <img src="/icons/ceo1983_icon_2/building-2-1.svg" className="h-4 w-4" alt="building" onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }} />
            <div className="text-orange-500 dark:text-orange-400 text-xs font-semibold font-['Inter']">CHI CHUYỂN KHOẢN</div>
          </div>
          <div className="text-slate-900 dark:text-slate-100 text-2xl font-bold font-['Inter'] leading-7">
            {fmt.money(expenseBank)}
          </div>
          <div className="text-slate-500 dark:text-slate-400 text-xs font-normal font-['Inter']">
            Ủy nhiệm chi &amp; chuyển khoản ngân hàng
          </div>
        </div>

        {/* Card 4: Tạm Ứng & Hoàn Ứng (Green gradient - Emerald) */}
        <div className="h-32 p-4 bg-gradient-to-b from-green-100 to-white dark:from-green-950/40 dark:to-slate-900 rounded-[20px] outline outline-[0.50px] outline-slate-200 dark:outline-slate-800 flex flex-col justify-start items-start gap-2.5 overflow-hidden shadow-xs">
          <div className="h-8 flex items-center gap-2">
            <img src="/icons/ceo1983_icon_2/circle-check.svg" className="h-4 w-4" alt="check" onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }} />
            <div className="text-emerald-500 dark:text-emerald-400 text-xs font-semibold font-['Inter']">TẠM ỨNG &amp; HOÀN ỨNG</div>
          </div>
          <div className="text-slate-900 dark:text-slate-100 text-2xl font-bold font-['Inter'] leading-7">
            {fmt.money(totalAdvance)}
          </div>
          <div className="text-slate-500 dark:text-slate-400 text-xs font-normal font-['Inter']">
            Đã hoàn ứng: <strong className="text-emerald-600 dark:text-emerald-400 font-bold shrink-0">+{fmt.money(totalRefunded)}</strong>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-3 shadow-[var(--shadow-card)]">
        <div className="flex flex-wrap items-center gap-2">
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
              Mọi khoản chi
            </button>
            <button
              onClick={() => setCategoryFilter("advance")}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition-colors ${
                categoryFilter === "advance" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Tạm ứng
            </button>
            <button
              onClick={() => setCategoryFilter("standard")}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition-colors ${
                categoryFilter === "standard" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Chi thường
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
            placeholder="Tìm theo mã, nội dung, người nhận..."
            className="w-full rounded-xl border border-input bg-background pl-9 pr-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Main Expense Table */}
      <Card className="overflow-hidden">
        <div className="relative overflow-x-auto">
          <table className="w-full border-separate border-spacing-0 text-left text-sm">
          <thead className="border-b border-border bg-secondary/80 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="sticky left-0 z-20 w-14 bg-secondary/90 px-3 py-3 text-center text-xs font-bold border-b border-border">STT</th>
              <th className="sticky left-[56px] z-20 bg-secondary/90 px-4 py-3 text-xs font-bold border-b border-border">Mã phiếu chi</th>
              <th className="px-4 py-3 border-b border-border">Ngày chi</th>
              <th className="px-4 py-3 border-b border-border">Danh mục</th>
              <th className="px-4 py-3 border-b border-border">Nội dung chi</th>
              <th className="px-4 py-3 border-b border-border">Người nhận / Đơn vị</th>
              <th className="px-4 py-3 text-right border-b border-border">Số tiền</th>
              <th className="px-4 py-3 text-center border-b border-border">Tạm ứng & Hoàn ứng</th>
              <th className="px-4 py-3 text-right font-bold text-rose-600 border-b border-border">Chi thực tế</th>
              <th className="px-4 py-3 border-b border-border">Hình thức</th>
              <th className="px-4 py-3 border-b border-border">Trạng thái</th>
              <th className="px-4 py-3 text-center border-b border-border">Tải hóa đơn</th>
              <th className="sticky right-0 z-20 bg-secondary/90 px-4 py-3 text-right text-xs font-bold border-b border-border">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {(tc?.paged || []).length === 0 ? (
              <tr>
                <td colSpan={13} className="py-12 text-center text-muted-foreground">
                  Không tìm thấy khoản chi nào phù hợp
                </td>
              </tr>
            ) : (
              (tc?.paged || []).map((tx, idx) => {
                const isAdvance = tx.category === "advance" || (tx.advanceAmount && tx.advanceAmount > 0);
                const advVal = tx.advanceAmount || (tx.category === "advance" ? tx.amount : 0);
                const refVal = tx.refundAmount || 0;
                const netExpense = advVal > 0 ? advVal - refVal : tx.amount;

                return (
                  <tr key={tx.id} className="group hover:bg-muted/30 transition-colors border-b border-border/50">
                    <td className="sticky left-0 z-10 bg-card px-3 py-3 text-center font-mono text-xs font-semibold text-muted-foreground group-hover:bg-muted/70 border-b border-border/50">
                      {(tc.page - 1) * tc.pageSize + idx + 1}
                    </td>
                    <td className="sticky left-[56px] z-10 bg-card px-4 py-3 font-mono text-xs font-bold text-foreground group-hover:bg-muted/70 border-b border-border/50">
                      {tx.id}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap border-b border-border/50">
                      {tx.date}
                    </td>
                    <td className="px-4 py-3 text-xs border-b border-border/50">
                      {isAdvance ? (
                        <Pill tone="warn">Tạm ứng</Pill>
                      ) : (
                        <span className="capitalize">{tx.category}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs font-medium max-w-xs truncate border-b border-border/50">
                      {tx.description || "—"}
                    </td>
                    <td className="px-4 py-3 text-xs font-semibold text-foreground border-b border-border/50">
                      {tx.recipient || "—"}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-xs font-semibold text-foreground whitespace-nowrap border-b border-border/50">
                      {fmt.money(tx.amount)}
                    </td>
                    <td className="px-4 py-3 text-center text-xs whitespace-nowrap border-b border-border/50">
                      {isAdvance ? (
                        <div className="inline-flex flex-col items-center">
                          <span className="text-[11px] font-medium text-amber-700 dark:text-amber-400">
                            Ứng: {fmt.money(advVal)}
                          </span>
                          {refVal > 0 ? (
                            <span className="text-[10px] font-bold text-emerald-600">
                              Hoàn tiền: +{fmt.money(refVal)}
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => openRefundModal(tx)}
                              className="mt-0.5 text-[10px] font-bold text-primary underline hover:text-primary/80 cursor-pointer"
                            >
                              Gửi lại tiền thừa
                            </button>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-xs font-bold text-rose-600 dark:text-rose-400 whitespace-nowrap border-b border-border/50">
                      -{fmt.money(netExpense)}
                    </td>
                    <td className="px-4 py-3 text-xs border-b border-border/50">
                      {tx.method === "cash" ? (
                        <Pill tone="success">Tiền mặt</Pill>
                      ) : (
                        <Pill tone="info">Chuyển khoản</Pill>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs border-b border-border/50">
                      {tx.status === "completed" ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Đã duyệt
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-amber-600 font-medium">
                          <Clock className="h-3.5 w-3.5" />
                          Chờ duyệt
                        </span>
                      )}
                    </td>

                    {/* Column Tải Hóa Đơn on every row (User requirement) */}
                    <td className="px-4 py-3 text-center border-b border-border/50">
                      <button
                        type="button"
                        onClick={() =>
                          downloadInvoiceVoucher({
                            id: tx.id,
                            date: tx.date,
                            type: "expense",
                            category: tx.category,
                            description: tx.description,
                            amount: netExpense,
                            method: tx.method,
                            status: tx.status,
                            recipient: tx.recipient,
                            advanceAmount: tx.advanceAmount,
                            refundAmount: tx.refundAmount,
                          })
                        }
                        title="Tải hóa đơn / Phiếu chi PDF"
                        className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-2.5 py-1 text-xs font-medium text-foreground shadow-xs hover:bg-muted cursor-pointer transition-colors"
                      >
                        <FileDown className="h-3.5 w-3.5 text-primary" />
                        <span>Tải HĐ</span>
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="sticky right-0 z-10 bg-card px-4 py-3 text-right whitespace-nowrap group-hover:bg-muted/70 border-b border-border/50">
                      <div className="flex items-center justify-end gap-1.5">
                        {isAdvance && (
                          <button
                            type="button"
                            onClick={() => openRefundModal(tx)}
                            title="Quản lý hoàn ứng tiền thừa"
                            className="rounded-lg p-1.5 text-amber-600 hover:bg-amber-500/10 cursor-pointer"
                          >
                            <RotateCcw className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => openEdit(tx)}
                          title="Sửa phiếu chi"
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
                );
              })
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

      {/* Modal Lập / Sửa Phiếu Chi & Tạm Ứng */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-foreground">
              {editing ? "Sửa Phiếu Chi" : formCategory === "advance" ? "Lập Phiếu Tạm Ứng" : "Lập Phiếu Chi Mới"}
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Nhập thông tin chi phí, phương thức thanh toán tiền mặt / chuyển khoản và người thụ hưởng
            </p>

            <form onSubmit={onSubmit} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground">Ngày lập (dd/mm/yyyy)</label>
                  <StandardDateInput
                    required
                    value={formDate}
                    placeholder="dd/mm/yyyy (VD: 25/10/2026)"
                    onChange={(iso) => setFormDate(iso)}
                    className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground">Danh mục chi</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="operation">Chi vận hành thường xuyên</option>
                    <option value="event">Chi tổ chức sự kiện</option>
                    <option value="marketing">Chi truyền thông & quảng bá</option>
                    <option value="advance">Tạm ứng (Có quản lý hoàn ứng)</option>
                    <option value="hospitality">Chi tiếp khách & đối ngoại</option>
                    <option value="other">Chi khác</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">Người nhận / Đơn vị thụ hưởng</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Nguyễn Văn A (Trưởng ban sự kiện) / Công ty CP Âm thanh Ánh sáng"
                  value={formRecipient}
                  onChange={(e) => setFormRecipient(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">Nội dung chi</label>
                <input
                  type="text"
                  required
                  placeholder="Diễn giải chi tiết khoản chi..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground">Số tiền chi</label>
                  <div className="mt-1">
                    <FormattedCurrencyInput
                      value={formAmount}
                      allowCurrencySwitch={true}
                      onChange={(_formatted, num) => setFormAmount(num)}
                      className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-primary"
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
                    <option value="cash">Tiền mặt (Chi trực tiếp)</option>
                    <option value="bank">Chuyển khoản (Ngân hàng)</option>
                    <option value="card">Thẻ tín dụng / Thẻ công vụ</option>
                  </select>
                </div>
              </div>

              {/* Advance specifics */}
              {formCategory === "advance" && (
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 space-y-2">
                  <span className="text-xs font-bold text-amber-800 dark:text-amber-300">
                    Thiết lập tạm ứng & hoàn ứng tiền thừa
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] text-muted-foreground">Số tiền tạm ứng ban đầu</label>
                      <div className="mt-1">
                        <FormattedCurrencyInput
                          value={formAdvanceAmount !== undefined && formAdvanceAmount !== null ? formAdvanceAmount : formAmount}
                          allowCurrencySwitch={false}
                          onChange={(_f, num) => setFormAdvanceAmount(num)}
                          className="w-full rounded-lg border border-input bg-background px-2 py-1 text-xs font-mono"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[11px] text-muted-foreground">Hoàn ứng tiền thừa (nếu có)</label>
                      <div className="mt-1">
                        <FormattedCurrencyInput
                          value={formRefundAmount}
                          allowCurrencySwitch={false}
                          onChange={(_f, num) => setFormRefundAmount(num)}
                          className="w-full rounded-lg border border-input bg-background px-2 py-1 text-xs font-mono text-emerald-600 font-bold"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-foreground">Trạng thái duyệt</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as any)}
                  className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="completed">Đã duyệt & Đã thanh toán</option>
                  <option value="pending">Chờ phê duyệt</option>
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
                  className="rounded-xl bg-rose-600 px-5 py-2 text-xs font-bold text-white hover:bg-rose-700 shadow-sm disabled:opacity-50"
                >
                  {submitting ? "Đang lưu..." : editing ? "Lưu thay đổi" : "Tạo phiếu chi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Quản lý Hoàn Ứng Tiền Thừa */}
      {refundModalOpen && refundingTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
                <RotateCcw className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">Quản Lý Hoàn Ứng Tiền Thừa</h3>
                <p className="text-xs text-muted-foreground">Mã phiếu: {refundingTx.id}</p>
              </div>
            </div>

            <div className="mt-4 space-y-3 rounded-xl border border-border bg-muted/30 p-3 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Nội dung ứng:</span>
                <span className="font-semibold text-foreground">{refundingTx.description}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Người nhận tạm ứng:</span>
                <span className="font-bold text-foreground">{refundingTx.recipient || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tổng tiền tạm ứng:</span>
                <span className="font-bold font-mono text-amber-700 dark:text-amber-400">
                  {fmt.money(refundingTx.advanceAmount || refundingTx.amount)}
                </span>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <label className="text-xs font-semibold text-foreground">
                Số tiền thừa người nhận nộp lại (Hoàn ứng):
              </label>
              <FormattedCurrencyInput
                value={refundAmountInput}
                allowCurrencySwitch={false}
                onChange={(_f, num) => setRefundAmountInput(num)}
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm font-mono font-bold text-emerald-600 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-[11px] text-muted-foreground">
                Tổng chi thực tế sẽ được tính = Số tiền ứng - Số tiền hoàn lại ={" "}
                <strong className="text-rose-600 font-mono">
                  {fmt.money((refundingTx.advanceAmount || refundingTx.amount) - (Number(refundAmountInput) || 0))}
                </strong>
              </p>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setRefundModalOpen(false)}
                className="rounded-xl border border-border px-4 py-2 text-xs font-medium text-muted-foreground hover:bg-muted"
              >
                Đóng
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleSaveRefund}
                className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-700 shadow-sm disabled:opacity-50"
              >
                {submitting ? "Đang lưu..." : "Xác Nhận Hoàn Ứng"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Excel Modal */}
      <FinanceExcelImportModal
        type="expense"
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onImportSuccess={() => router.invalidate()}
      />
    </AppShell>
  );
}
