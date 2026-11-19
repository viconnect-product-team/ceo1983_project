import { httpClient, type RequestOptions } from "./http-client";

export interface InvoiceDTO {
  id: string;
  invoiceNo: string;
  year: number;
  amount: number;
  dueDate: string;
  paidAt?: string;
  status: "paid" | "unpaid" | "overdue";
  method?: "bank" | "card" | "cash" | "ewallet";
  member?: {
    id: string;
    code: string;
    name: string;
    email: string;
    phone: string;
    company?: string;
  };
}

export interface TransactionDTO {
  id: string;
  date: string;
  type: "income" | "expense";
  category: string;
  description: string;
  amount: number;
  method: "bank" | "card" | "cash";
  status: "completed" | "pending";
  advanceAmount?: number;
  refundAmount?: number;
  invoiceUrl?: string;
  recipient?: string;
}

export interface FinancialReportFilter {
  category?: string;
  startDate?: string;
  endDate?: string;
  type?: "all" | "income" | "expense";
  exporterName?: string;
  exporterId?: string;
}

export interface FinancialReportResult {
  metadata: {
    reportTitle: string;
    category: string;
    startDate: string;
    endDate: string;
    exportedAt: string;
    exportedBy: {
      id: string;
      name: string;
    };
  };
  summary: {
    totalIncome: number;
    totalExpense: number;
    netBalance: number;
    transactionCount: number;
  };
  transactions: TransactionDTO[];
}

export const financeApi = {
  listInvoices: (options?: RequestOptions) =>
    httpClient.get<InvoiceDTO[]>("/admin/invoices", options),

  getInvoice: (id: string, options?: RequestOptions) =>
    httpClient.get<{ invoice: InvoiceDTO; reminders: any[] }>(
      `/admin/invoices/${encodeURIComponent(id)}`,
      options
    ),

  payInvoice: (
    id: string,
    data: { method: "bank" | "card" | "cash" | "ewallet" },
    options?: RequestOptions
  ) =>
    httpClient.post<InvoiceDTO>(
      `/admin/invoices/${encodeURIComponent(id)}/pay`,
      data,
      options
    ),

  listTransactions: (options?: RequestOptions) =>
    httpClient.get<TransactionDTO[]>("/admin/transactions", options),

  createTransaction: (data: Partial<TransactionDTO>, options?: RequestOptions) =>
    httpClient.post<TransactionDTO>("/admin/transactions", data, options),

  updateTransaction: (id: string, data: Partial<TransactionDTO>, options?: RequestOptions) =>
    httpClient.patch<TransactionDTO>(
      `/admin/transactions/${encodeURIComponent(id)}`,
      data,
      options
    ),

  deleteTransaction: (id: string, options?: RequestOptions) =>
    httpClient.delete<{ ok: boolean }>(
      `/admin/transactions/${encodeURIComponent(id)}`,
      options
    ),

  /**
   * Generates a structured Financial Income & Expense Report.
   * Explicitly includes the category, date range, and the user who requested the export.
   */
  getIncomeExpenseReport: async (
    filter: FinancialReportFilter,
    options?: RequestOptions
  ): Promise<FinancialReportResult> => {
    const transactions = await httpClient.get<TransactionDTO[]>("/admin/transactions", options);

    const filtered = (transactions || []).filter((tx) => {
      if (filter.category && filter.category !== "all" && tx.category !== filter.category) {
        return false;
      }
      if (filter.type && filter.type !== "all" && tx.type !== filter.type) {
        return false;
      }
      if (filter.startDate && tx.date < filter.startDate) {
        return false;
      }
      if (filter.endDate && tx.date > filter.endDate) {
        return false;
      }
      return true;
    });

    const totalIncome = filtered
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    const totalExpense = filtered
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    return {
      metadata: {
        reportTitle: "Báo cáo Thu - Chi Tài Chính CLB Doanh Nhân CEO 1983",
        category: filter.category || "Tất cả danh mục",
        startDate: filter.startDate || "Đầu kỳ",
        endDate: filter.endDate || "Hiện tại",
        exportedAt: new Date().toISOString(),
        exportedBy: {
          id: filter.exporterId || "admin",
          name: filter.exporterName || "Ban Quản Trị / Kế Toán",
        },
      },
      summary: {
        totalIncome,
        totalExpense,
        netBalance: totalIncome - totalExpense,
        transactionCount: filtered.length,
      },
      transactions: filtered,
    };
  },
};
