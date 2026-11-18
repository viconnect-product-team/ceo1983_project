import { fetchNestApi } from "./api-client";
import type {
  FormTemplatesCollection,
  FinanceReportTemplate,
  InvoiceTemplate,
  MemberFeeTemplate,
} from "@/types/form-template.types";

export const FORM_TEMPLATES_STORAGE_KEY = "ceo1983_form_templates_v1";

export const DEFAULT_FORM_TEMPLATES: FormTemplatesCollection = {
  FINANCE_REPORT_EXCEL: {
    code: "FINANCE_REPORT_EXCEL",
    name: "Mẫu Báo Cáo Kiểm Toán & Sổ Nhật Ký Thu Chi (Excel)",
    category: "finance",
    formatType: "excel",
    title: "BÁO CÁO TỔNG HỢP KIỂM TOÁN TÀI CHÍNH",
    subtitle: "Hệ thống quản lý tài chính CLB Doanh Nhân CEO 1983",
    organization: "CLB DOANH NHÂN CEO 1983 (HANOIBA)",
    address: "Tòa nhà HanoiBA, TP. Hà Nội",
    circularCode: "Mẫu số S07-DN",
    circularNote: "(Ban hành theo Thông tư số 200/2014/TT-BTC ngày 22/12/2014 của Bộ Tài chính)",
    fundType: "Quỹ hoạt động CLB Doanh Nhân CEO 1983",
    currencyUnit: "VNĐ",
    sheetName: "Nhat_Ky_Thu_Chi",
    filenamePrefix: "bao-cao-tai-chinh",
    columns: [
      { key: "id", label: "Mã chứng từ", width: 16, enabled: true },
      { key: "date", label: "Ngày ghi sổ", width: 16, enabled: true },
      { key: "type", label: "Loại giao dịch", width: 16, enabled: true },
      { key: "category", label: "Danh mục", width: 22, enabled: true },
      { key: "description", label: "Nội dung hạch toán", width: 38, enabled: true },
      { key: "method", label: "Hình thức", width: 18, enabled: true },
      { key: "acc", label: "TK Đối ứng", width: 18, enabled: true },
      { key: "amount", label: "Số tiền (VNĐ)", width: 22, enabled: true },
      { key: "recipient", label: "Đối tác / Người nộp - nhận", width: 30, enabled: true },
      { key: "status", label: "Trạng thái kiểm toán", width: 18, enabled: true },
    ],
    summaryLabels: {
      totalIn: "TỔNG CỘNG NGUỒN THU:",
      totalOut: "TỔNG CỘNG KHOẢN CHI:",
      net: "TỒN QUỸ RÒNG / THẶNG DƯ:",
    },
    signerTitles: ["NGƯỜI LẬP BÁO CÁO", "TRƯỞNG BAN TÀI CHÍNH", "CHỦ TỊCH CLB CEO 1983"],
  },
  INVOICE_RECEIPT_PDF: {
    code: "INVOICE_RECEIPT_PDF",
    name: "Mẫu Phiếu Thu Tiền & Hóa Đơn Điện Tử (PDF / In)",
    category: "finance",
    formatType: "pdf_print",
    orgName: "CLB DOANH NHÂN CEO 1983 (HANOIBA)",
    orgAddress: "Tòa nhà HanoiBA, TP. Hà Nội",
    taxCode: "0101234567",
    invoiceFormNumber: "01GTKT0/001",
    invoiceSerial: "CEO/26E",
    invoiceTitle: "PHIẾU THU & HÓA ĐƠN ĐIỆN TỬ",
    footerNote: "Cảm ơn Quý Doanh nhân đã đồng hành cùng CLB Doanh Nhân CEO 1983!",
    signers: ["Người nộp tiền", "Thủ quỹ / Kế toán viên", "Trưởng Ban Tài chính"],
  },
  MEMBER_FEE_REPORT: {
    code: "MEMBER_FEE_REPORT",
    name: "Mẫu Báo Cáo Thu Hội Phí Thường Niên",
    category: "members",
    formatType: "excel",
    title: "BÁO CÁO TỔNG HỢP THU HỘI PHÍ HỘI VIÊN CEO 1983",
    organization: "CLB DOANH NHÂN CEO 1983 (HANOIBA)",
    standardFee: 5000000,
    currencyUnit: "VNĐ",
    signers: ["Kế toán hội phí", "Trưởng Ban Tài chính"],
  },
};

export function getCachedFormTemplates(): FormTemplatesCollection {
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(FORM_TEMPLATES_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object") {
          return { ...DEFAULT_FORM_TEMPLATES, ...parsed };
        }
      }
    } catch {}
  }
  return DEFAULT_FORM_TEMPLATES;
}

export async function fetchFormTemplates(): Promise<FormTemplatesCollection> {
  try {
    const res: any = await fetchNestApi("/admin/form-templates");
    if (res && res.templates && typeof res.templates === "object") {
      const merged = { ...DEFAULT_FORM_TEMPLATES, ...res.templates };
      if (typeof window !== "undefined") {
        localStorage.setItem(FORM_TEMPLATES_STORAGE_KEY, JSON.stringify(merged));
      }
      return merged;
    }
  } catch {}
  return getCachedFormTemplates();
}

export async function getFormTemplate<T = any>(code: keyof FormTemplatesCollection | string): Promise<T> {
  const all = await fetchFormTemplates();
  return (all[code] || (DEFAULT_FORM_TEMPLATES as any)[code]) as T;
}

export async function saveFormTemplate(code: string, payload: any): Promise<boolean> {
  try {
    await fetchNestApi(`/admin/form-templates/${encodeURIComponent(code)}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });

    if (typeof window !== "undefined") {
      const current = getCachedFormTemplates();
      const next = {
        ...current,
        [code]: { ...(current[code] || {}), ...payload, updatedAt: new Date().toISOString() },
      };
      localStorage.setItem(FORM_TEMPLATES_STORAGE_KEY, JSON.stringify(next));
      window.dispatchEvent(new CustomEvent("form_templates_updated", { detail: { code, template: next[code] } }));
    }
    return true;
  } catch (err) {
    console.error("[saveFormTemplate] Error:", err);
    // Vẫn cập nhật cache local để người dùng trải nghiệm tức thời
    if (typeof window !== "undefined") {
      const current = getCachedFormTemplates();
      const next = {
        ...current,
        [code]: { ...(current[code] || {}), ...payload, updatedAt: new Date().toISOString() },
      };
      localStorage.setItem(FORM_TEMPLATES_STORAGE_KEY, JSON.stringify(next));
      window.dispatchEvent(new CustomEvent("form_templates_updated", { detail: { code, template: next[code] } }));
    }
    return true;
  }
}

export async function resetFormTemplates(): Promise<boolean> {
  try {
    await fetchNestApi("/admin/form-templates/reset", { method: "POST" });
  } catch {}

  if (typeof window !== "undefined") {
    localStorage.setItem(FORM_TEMPLATES_STORAGE_KEY, JSON.stringify(DEFAULT_FORM_TEMPLATES));
    window.dispatchEvent(new CustomEvent("form_templates_updated", { detail: { reset: true } }));
  }
  return true;
}
