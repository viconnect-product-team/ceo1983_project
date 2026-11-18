export interface ColumnFormatConfig {
  key: string;
  label: string;
  width: number;
  enabled: boolean;
  align?: "left" | "center" | "right";
}

export interface FinanceReportTemplate {
  code: "FINANCE_REPORT_EXCEL";
  name: string;
  category: "finance";
  formatType: "excel";
  title: string;
  subtitle: string;
  organization: string;
  address: string;
  circularCode: string;
  circularNote: string;
  fundType: string;
  currencyUnit: string;
  sheetName: string;
  filenamePrefix: string;
  columns: ColumnFormatConfig[];
  summaryLabels: {
    totalIn: string;
    totalOut: string;
    net: string;
  };
  signerTitles: string[];
  updatedAt?: string;
}

export interface InvoiceTemplate {
  code: "INVOICE_RECEIPT_PDF";
  name: string;
  category: "finance";
  formatType: "pdf_print";
  orgName: string;
  orgAddress: string;
  taxCode: string;
  invoiceFormNumber: string;
  invoiceSerial: string;
  invoiceTitle: string;
  footerNote: string;
  signers: string[];
  updatedAt?: string;
}

export interface MemberFeeTemplate {
  code: "MEMBER_FEE_REPORT";
  name: string;
  category: "members";
  formatType: "excel";
  title: string;
  organization: string;
  standardFee: number;
  currencyUnit: string;
  signers: string[];
  updatedAt?: string;
}

export type AnyFormTemplate = FinanceReportTemplate | InvoiceTemplate | MemberFeeTemplate;

export interface FormTemplatesCollection {
  FINANCE_REPORT_EXCEL: FinanceReportTemplate;
  INVOICE_RECEIPT_PDF: InvoiceTemplate;
  MEMBER_FEE_REPORT: MemberFeeTemplate;
  [key: string]: any;
}
