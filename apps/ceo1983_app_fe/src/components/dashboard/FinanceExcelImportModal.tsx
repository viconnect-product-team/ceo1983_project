import { useState, useRef } from "react";
import * as XLSX from "xlsx";
import {
  FileSpreadsheet,
  Upload,
  Download,
  AlertCircle,
  CheckCircle2,
  X,
  Loader2,
  Check,
  Building,
  Calendar,
  DollarSign,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { createTransactionFn } from "@/lib/finance.functions";

export interface ParsedFinanceRow {
  id?: string;
  date: string;
  type: "income" | "expense";
  category: string;
  categoryLabel: string;
  description: string;
  amount: number;
  method: "bank" | "card" | "cash";
  status: "completed" | "pending";
  recipient: string;
  advanceAmount?: number;
  refundAmount?: number;
  isValid: boolean;
  error?: string;
}

export interface FinanceExcelImportModalProps {
  type: "income" | "expense";
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess?: () => void;
}

function parseAmount(val: any): number {
  if (typeof val === "number") return isNaN(val) ? 0 : Math.round(val);
  if (!val) return 0;
  const str = String(val)
    .replace(/[^\d.,-]/g, "")
    .replace(/,/g, "");
  const n = parseFloat(str);
  return isNaN(n) ? 0 : Math.round(Math.abs(n));
}

function parseDate(val: any): string {
  if (!val) {
    const today = new Date();
    return today.toISOString().slice(0, 10);
  }
  // Check if it's an Excel serial date number
  if (typeof val === "number") {
    const dateObj = XLSX.SSF.parse_date_code(val);
    if (dateObj) {
      const y = dateObj.y;
      const m = String(dateObj.m).padStart(2, "0");
      const d = String(dateObj.d).padStart(2, "0");
      return `${y}-${m}-${d}`;
    }
  }
  const s = String(val).trim();
  // Check format DD/MM/YYYY
  const partsDmy = s.match(/^(\d{1,2})[\/\.-](\d{1,2})[\/\.-](\d{4})$/);
  if (partsDmy) {
    const d = partsDmy[1].padStart(2, "0");
    const m = partsDmy[2].padStart(2, "0");
    const y = partsDmy[3];
    return `${y}-${m}-${d}`;
  }
  // Check format YYYY-MM-DD
  const partsYmd = s.match(/^(\d{4})[\/\.-](\d{1,2})[\/\.-](\d{1,2})$/);
  if (partsYmd) {
    const y = partsYmd[1];
    const m = partsYmd[2].padStart(2, "0");
    const d = partsYmd[3].padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  const parsed = new Date(s);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(0, 10);
  }
  return new Date().toISOString().slice(0, 10);
}

function mapIncomeCategory(raw: string): { key: string; label: string } {
  const norm = (raw || "").toLowerCase().trim();
  if (norm.includes("hội phí") || norm.includes("membership") || norm.includes("phí")) {
    return { key: "membership_fee", label: "Phí hội viên" };
  }
  if (norm.includes("vé") || norm.includes("ticket")) {
    return { key: "event_ticket", label: "Vé sự kiện" };
  }
  if (norm.includes("đột xuất") || norm.includes("tiền mặt") || norm.includes("walkin")) {
    return { key: "event_walkin", label: "Thu đột xuất (Tại sự kiện)" };
  }
  if (norm.includes("tài trợ") || norm.includes("sponsor")) {
    return { key: "sponsor", label: "Tài trợ" };
  }
  return { key: "other", label: raw.trim() || "Khoản thu khác" };
}

function mapExpenseCategory(raw: string): { key: string; label: string } {
  const norm = (raw || "").toLowerCase().trim();
  if (norm.includes("tạm ứng") || norm.includes("advance")) {
    return { key: "advance", label: "Tạm ứng" };
  }
  if (norm.includes("sự kiện") || norm.includes("event") || norm.includes("hội thảo") || norm.includes("gala")) {
    return { key: "event", label: "Sự kiện" };
  }
  if (norm.includes("vận hành") || norm.includes("operations") || norm.includes("văn phòng")) {
    return { key: "operations", label: "Vận hành" };
  }
  if (norm.includes("tiếp khách") || norm.includes("marketing") || norm.includes("đối ngoại")) {
    return { key: "marketing", label: "Tiếp khách & Đối ngoại" };
  }
  return { key: "other", label: raw.trim() || "Chi phí khác" };
}

function mapMethod(raw: string): "bank" | "card" | "cash" {
  const norm = (raw || "").toLowerCase().trim();
  if (norm.includes("tiền mặt") || norm === "cash") {
    return "cash";
  }
  if (norm.includes("thẻ") || norm === "card") {
    return "card";
  }
  return "bank";
}

function mapStatus(raw: string): "completed" | "pending" {
  const norm = (raw || "").toLowerCase().trim();
  if (
    norm.includes("duyệt") ||
    norm.includes("xác nhận") ||
    norm.includes("hoàn thành") ||
    norm.includes("completed") ||
    norm.includes("đã thu")
  ) {
    return "completed";
  }
  return "pending";
}

export function FinanceExcelImportModal({
  type,
  isOpen,
  onClose,
  onImportSuccess,
}: FinanceExcelImportModalProps) {
  const createFn = useServerFn(createTransactionFn);

  const [file, setFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [rows, setRows] = useState<ParsedFinanceRow[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  const [filterTab, setFilterTab] = useState<"all" | "valid" | "invalid">("all");
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const isIncome = type === "income";

  const handleDownloadTemplate = () => {
    const wb = XLSX.utils.book_new();

    let sampleData: any[][] = [];
    let fileName = "";

    if (isIncome) {
      fileName = "Bao_Cao_Mau_Thu_Quy_CEO1983.xlsx";
      sampleData = [
        ["HIỆP HỘI DOANH NHÂN CEO 1983 (HANOIBA)", "", "", "", "CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM"],
        ["BAN CHẤP HÀNH - VĂN PHÒNG HIỆP HỘI", "", "", "", "Độc lập - Tự do - Hạnh phúc"],
        [],
        ["", "", "BẢNG MẪU NHẬP DỮ LIỆU THU QUỸ HỘI VIÊN & ĐỐI TÁC"],
        ["(Mẫu chuẩn hóa hệ thống quản trị tài chính Hiệp Hội Doanh Nhân CEO 1983)"],
        [],
        [
          "STT",
          "Mã phiếu thu",
          "Ngày thu",
          "Danh mục thu",
          "Nội dung thu",
          "Người nộp / Đơn vị",
          "Số tiền (VNĐ)",
          "Hình thức",
          "Trạng thái",
        ],
        [
          1,
          "PT-2026-001",
          "10/03/2026",
          "Phí hội viên",
          "Thu hội phí hội viên VIP thường niên 2026",
          "Công ty CP Tập đoàn Hòa Bình",
          50000000,
          "Chuyển khoản",
          "Đã xác nhận",
        ],
        [
          2,
          "PT-2026-002",
          "09/03/2026",
          "Vé sự kiện",
          "Thu vé tham dự Diễn đàn Kết nối Giao thương B2B",
          "Bà Trần Mai Anh",
          1500000,
          "Chuyển khoản",
          "Đã xác nhận",
        ],
        [
          3,
          "PT-2026-003",
          "08/03/2026",
          "Thu đột xuất (Tại sự kiện)",
          "Thu tiền mặt trực tiếp tại bàn đón tiếp sự kiện",
          "Ông Nguyễn Hoàng Long",
          500000,
          "Tiền mặt",
          "Đã xác nhận",
        ],
        [
          4,
          "PT-2026-004",
          "05/03/2026",
          "Tài trợ",
          "Thu gói Tài trợ Kim Cương Tech Expo 2026",
          "Ngân hàng Techcombank",
          150000000,
          "Chuyển khoản",
          "Đã xác nhận",
        ],
      ];
    } else {
      fileName = "Bao_Cao_Mau_Chi_Va_Tam_Ung_CEO1983.xlsx";
      sampleData = [
        ["HIỆP HỘI DOANH NHÂN CEO 1983 (HANOIBA)", "", "", "", "CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM"],
        ["BAN CHẤP HÀNH - VĂN PHÒNG HIỆP HỘI", "", "", "", "Độc lập - Tự do - Hạnh phúc"],
        [],
        ["", "", "BẢNG MẪU NHẬP DỮ LIỆU CHI PHÍ & TẠM ỨNG HIỆP HỘI"],
        ["(Mẫu chuẩn hóa hệ thống quản trị tài chính Hiệp Hội Doanh Nhân CEO 1983)"],
        [],
        [
          "STT",
          "Mã phiếu chi",
          "Ngày chi",
          "Danh mục chi",
          "Nội dung chi",
          "Người nhận / Đơn vị",
          "Số tiền (VNĐ)",
          "Số tiền tạm ứng",
          "Hoàn ứng tiền thừa",
          "Hình thức",
          "Trạng thái",
        ],
        [
          1,
          "PC-2026-001",
          "10/03/2026",
          "Sự kiện",
          "Chi thuê hội trường Gala Giao Thương Thường Niên 2026",
          "Trung tâm Hội nghị Quốc Gia",
          45000000,
          0,
          0,
          "Chuyển khoản",
          "Đã duyệt",
        ],
        [
          2,
          "PC-2026-002",
          "08/03/2026",
          "Tạm ứng",
          "Tạm ứng chi phí thiết kế và thi công backdrop sự kiện",
          "Ban Truyền thông",
          15000000,
          15000000,
          2000000,
          "Chuyển khoản",
          "Đã duyệt",
        ],
        [
          3,
          "PC-2026-003",
          "05/03/2026",
          "Tiếp khách & Đối ngoại",
          "Chi ăn trưa làm việc cùng đoàn đại biểu xúc tiến thương mại",
          "Nhà hàng Sen Tây Hồ",
          3500000,
          0,
          0,
          "Tiền mặt",
          "Đã duyệt",
        ],
      ];
    }

    const ws = XLSX.utils.aoa_to_sheet(sampleData);
    // Set column widths
    ws["!cols"] = [
      { wch: 14 },
      { wch: 14 },
      { wch: 22 },
      { wch: 42 },
      { wch: 28 },
      { wch: 16 },
      { wch: 18 },
      { wch: 18 },
      { wch: 16 },
      { wch: 16 },
    ];
    XLSX.utils.book_append_sheet(wb, ws, "Báo Cáo");
    XLSX.writeFile(wb, fileName);
    toast.success("Đã tải xuống file mẫu Excel thành công!");
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    await processFile(selected);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files?.[0];
    if (!dropped) return;
    await processFile(dropped);
  };

  const processFile = async (f: File) => {
    const ext = f.name.split(".").pop()?.toLowerCase();
    if (!["xlsx", "xls", "csv", "txt"].includes(ext || "")) {
      toast.error("Vui lòng chọn file Excel (.xlsx, .xls) hoặc .csv");
      return;
    }

    setFile(f);
    setParsing(true);
    try {
      const buffer = await f.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const firstSheetName = workbook.SheetNames[0];
      if (!firstSheetName) {
        throw new Error("File không chứa trang tính hợp lệ.");
      }
      const worksheet = workbook.Sheets[firstSheetName];
      const rawRows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });

      if (rawRows.length < 2) {
        throw new Error("File Excel không có đủ dữ liệu hàng.");
      }

      // Detect header row (within first 15 rows to support corporate banner headers)
      let headerRowIdx = 0;
      let colMap: Record<string, number> = {};

      for (let r = 0; r < Math.min(15, rawRows.length); r++) {
        const row = rawRows[r] || [];
        const matches = row.filter((c: any) => {
          const s = String(c || "").toLowerCase().trim();
          return (
            s.includes("ngày") ||
            s.includes("danh mục") ||
            s.includes("nội dung") ||
            s.includes("số tiền") ||
            s.includes("tiền") ||
            s.includes("người") ||
            s.includes("đơn vị")
          );
        });

        if (matches.length >= 2) {
          headerRowIdx = r;
          row.forEach((cellVal: any, colIdx: number) => {
            const h = String(cellVal || "").toLowerCase().trim();
            if (h.includes("ngày") || h.includes("date") || h.includes("thời gian")) colMap["date"] = colIdx;
            else if (h.includes("danh mục") || h.includes("category")) colMap["category"] = colIdx;
            else if (h.includes("nội dung") || h.includes("mô tả") || h.includes("description") || h.includes("diễn giải")) colMap["description"] = colIdx;
            else if (h.includes("người") || h.includes("đơn vị") || h.includes("đối tác") || h.includes("recipient")) colMap["recipient"] = colIdx;
            else if (h.includes("hoàn ứng") || h.includes("tiền thừa")) colMap["refund"] = colIdx;
            else if (h.includes("tạm ứng") || h.includes("advance")) colMap["advance"] = colIdx;
            else if (h.includes("số tiền") || h.includes("tiền") || h.includes("amount") || h.includes("giá trị")) {
              if (colMap["amount"] === undefined) colMap["amount"] = colIdx;
            }
            else if (h.includes("hình thức") || h.includes("phương thức") || h.includes("method")) colMap["method"] = colIdx;
            else if (h.includes("trạng thái") || h.includes("status")) colMap["status"] = colIdx;
          });
          break;
        }
      }

      // Default index fallback if header detection was incomplete
      if (colMap["description"] === undefined) colMap["description"] = 3;
      if (colMap["amount"] === undefined) colMap["amount"] = isIncome ? 5 : 5;
      if (colMap["date"] === undefined) colMap["date"] = 1;
      if (colMap["category"] === undefined) colMap["category"] = 2;
      if (colMap["recipient"] === undefined) colMap["recipient"] = 4;
      if (colMap["method"] === undefined) colMap["method"] = isIncome ? 6 : 8;
      if (colMap["status"] === undefined) colMap["status"] = isIncome ? 7 : 9;

      const parsed: ParsedFinanceRow[] = [];

      for (let i = headerRowIdx + 1; i < rawRows.length; i++) {
        const row = rawRows[i] || [];
        // Skip entirely empty row
        const isEmpty = row.every((c: any) => !String(c || "").trim());
        if (isEmpty) continue;

        // Skip corporate summary / signatures / date footer rows
        const firstCell = String(row[0] || "").toLowerCase().trim();
        const secondCell = String(row[1] || "").toLowerCase().trim();
        if (
          firstCell.includes("tổng cộng") ||
          firstCell.includes("hà nội, ngày") ||
          firstCell.includes("người lập") ||
          firstCell.includes("(ký") ||
          secondCell.includes("tổng cộng") ||
          secondCell.includes("(ký")
        ) {
          continue;
        }

        const rawDate = row[colMap["date"]];
        const rawCategory = String(row[colMap["category"]] || "");
        const rawDesc = String(row[colMap["description"]] || "").trim();
        const rawRecipient = String(row[colMap["recipient"]] || "").trim();
        const rawAmount = row[colMap["amount"]];
        const rawMethod = String(row[colMap["method"]] || "");
        const rawStatus = String(row[colMap["status"]] || "");
        const rawAdvance = colMap["advance"] !== undefined ? row[colMap["advance"]] : 0;
        const rawRefund = colMap["refund"] !== undefined ? row[colMap["refund"]] : 0;

        const date = parseDate(rawDate);
        const amount = parseAmount(rawAmount);
        const advanceAmount = parseAmount(rawAdvance);
        const refundAmount = parseAmount(rawRefund);
        const method = mapMethod(rawMethod);
        const status = mapStatus(rawStatus);

        const catInfo = isIncome ? mapIncomeCategory(rawCategory) : mapExpenseCategory(rawCategory);

        let isValid = true;
        let error = "";

        if (!rawDesc) {
          isValid = false;
          error = "Thiếu nội dung giao dịch";
        } else if (amount <= 0 && advanceAmount <= 0) {
          isValid = false;
          error = "Số tiền phải lớn hơn 0";
        }

        parsed.push({
          date,
          type,
          category: catInfo.key,
          categoryLabel: catInfo.label,
          description: rawDesc || "Giao dịch import từ Excel",
          amount: amount || advanceAmount,
          method,
          status,
          recipient: rawRecipient,
          advanceAmount: !isIncome ? advanceAmount : undefined,
          refundAmount: !isIncome ? refundAmount : undefined,
          isValid,
          error,
        });
      }

      setRows(parsed);

      // Pre-select all valid rows
      const validIndices = new Set<number>();
      parsed.forEach((r, idx) => {
        if (r.isValid) validIndices.add(idx);
      });
      setSelectedIndices(validIndices);

      const validCount = validIndices.size;
      const invalidCount = parsed.length - validCount;

      if (parsed.length === 0) {
        toast.warning("File không có dữ liệu giao dịch.");
      } else {
        toast.success(`Đã đọc ${parsed.length} dòng (${validCount} hợp lệ, ${invalidCount} cần kiểm tra).`);
      }
    } catch (err: any) {
      console.error("Lỗi đọc file:", err);
      toast.error(err?.message || "Không thể đọc file. Vui lòng kiểm tra định dạng.");
    } finally {
      setParsing(false);
    }
  };

  const toggleSelect = (index: number) => {
    setSelectedIndices((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const toggleSelectAll = () => {
    const validRows = rows
      .map((r, i) => ({ ...r, idx: i }))
      .filter((r) => r.isValid);

    if (selectedIndices.size === validRows.length && validRows.length > 0) {
      setSelectedIndices(new Set());
    } else {
      setSelectedIndices(new Set(validRows.map((r) => r.idx)));
    }
  };

  const handleImportSubmit = async () => {
    if (selectedIndices.size === 0) {
      toast.error("Vui lòng chọn ít nhất một dòng hợp lệ để import.");
      return;
    }

    const itemsToImport = Array.from(selectedIndices).map((idx) => rows[idx]);
    setImporting(true);
    setProgress({ current: 0, total: itemsToImport.length });

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < itemsToImport.length; i++) {
      const item = itemsToImport[i];
      try {
        await createFn({
          data: {
            date: item.date,
            type: item.type,
            category: item.category,
            description: item.description,
            amount: item.amount,
            method: item.method,
            status: item.status,
            advanceAmount: item.advanceAmount || 0,
            refundAmount: item.refundAmount || 0,
            invoiceUrl: "",
            recipient: item.recipient || "",
          },
        });
        successCount++;
      } catch (err) {
        console.error("Lỗi tạo bản ghi:", err);
        failCount++;
      }
      setProgress({ current: i + 1, total: itemsToImport.length });
    }

    setImporting(false);

    if (successCount > 0) {
      toast.success(`Đã import thành công ${successCount} phiếu ${isIncome ? "thu" : "chi"} vào hệ thống!`);
      if (onImportSuccess) onImportSuccess();
      onClose();
    }
    if (failCount > 0) {
      toast.error(`Có ${failCount} phiếu import bị lỗi, vui lòng kiểm tra lại.`);
    }
  };

  const filteredRows = rows
    .map((r, idx) => ({ ...r, originalIdx: idx }))
    .filter((r) => {
      if (filterTab === "valid") return r.isValid;
      if (filterTab === "invalid") return !r.isValid;
      return true;
    });

  const validTotal = rows.filter((r) => r.isValid).length;
  const invalidTotal = rows.length - validTotal;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="flex flex-col w-full max-w-4xl max-h-[90vh] bg-card rounded-2xl border border-border shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/40">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${isIncome ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"}`}>
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">
                Import Báo Cáo {isIncome ? "Khoản Thu" : "Khoản Chi & Tạm Ứng"} từ Excel
              </h2>
              <p className="text-xs text-muted-foreground">
                Nhập hàng loạt phiếu {isIncome ? "thu quỹ, hội phí, vé sự kiện" : "chi tiêu, thanh toán, tạm ứng"} nhanh chóng từ file Excel (.xlsx, .csv)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Action Row: Template Download & Upload Area */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1 p-4 rounded-xl border border-border bg-muted/20 flex flex-col justify-between space-y-3">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  File mẫu chuẩn
                </span>
                <p className="text-xs text-muted-foreground mt-1">
                  Tải file mẫu Excel chuẩn để điền dữ liệu đúng các cột quy định trước khi import.
                </p>
              </div>
              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-lg border border-border bg-card hover:bg-muted text-foreground transition-colors"
              >
                <Download className="h-4 w-4 text-[#003B95]" />
                Tải file mẫu Excel (.xlsx)
              </button>
            </div>

            {/* Dropzone */}
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
              className="md:col-span-2 border-2 border-dashed border-border hover:border-[#003B95] rounded-xl p-5 flex flex-col items-center justify-center text-center cursor-pointer bg-muted/10 hover:bg-muted/30 transition-all"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls, .csv, .txt"
                className="hidden"
                onChange={handleFileChange}
              />
              {parsing ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-7 w-7 text-[#003B95] animate-spin" />
                  <span className="text-sm font-medium text-foreground">Đang xử lý đọc file...</span>
                </div>
              ) : file ? (
                <div className="flex flex-col items-center gap-1.5">
                  <FileSpreadsheet className="h-8 w-8 text-emerald-600" />
                  <span className="text-sm font-semibold text-foreground">{file.name}</span>
                  <span className="text-xs text-muted-foreground">
                    ({(file.size / 1024).toFixed(1)} KB) - Bấm để chọn file khác
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <span className="text-sm font-semibold text-foreground">
                      Kéo thả file Excel vào đây hoặc bấm để tải lên
                    </span>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Hỗ trợ định dạng .xlsx, .xls, .csv
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Parsed Rows Preview */}
          {rows.length > 0 && (
            <div className="space-y-3">
              {/* Filter Tabs & Selection Summary */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setFilterTab("all")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      filterTab === "all" ? "bg-foreground text-background font-semibold" : "text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    Tất cả ({rows.length})
                  </button>
                  <button
                    onClick={() => setFilterTab("valid")}
                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      filterTab === "valid" ? "bg-emerald-600 text-white font-semibold" : "text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" />
                    Hợp lệ ({validTotal})
                  </button>
                  {invalidTotal > 0 && (
                    <button
                      onClick={() => setFilterTab("invalid")}
                      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        filterTab === "invalid" ? "bg-rose-600 text-white font-semibold" : "text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                      }`}
                    >
                      <AlertCircle className="h-3.5 w-3.5" />
                      Lỗi cần sửa ({invalidTotal})
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={toggleSelectAll}
                    className="text-xs text-[#003B95] font-semibold hover:underline"
                  >
                    {selectedIndices.size === validTotal && validTotal > 0 ? "Bỏ chọn tất cả" : "Chọn toàn bộ hợp lệ"}
                  </button>
                  <span className="text-xs text-muted-foreground">
                    Đã chọn: <strong className="text-foreground">{selectedIndices.size}</strong>/{validTotal}
                  </span>
                </div>
              </div>

              {/* Table */}
              <div className="rounded-xl border border-border overflow-hidden bg-card">
                <div className="max-h-72 overflow-y-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-muted/70 sticky top-0 z-10 text-muted-foreground border-b border-border">
                      <tr>
                        <th className="p-2.5 w-10 text-center">
                          <input
                            type="checkbox"
                            className="rounded border-border"
                            checked={selectedIndices.size === validTotal && validTotal > 0}
                            onChange={toggleSelectAll}
                          />
                        </th>
                        <th className="p-2.5">Ngày</th>
                        <th className="p-2.5">Danh mục</th>
                        <th className="p-2.5">Nội dung</th>
                        <th className="p-2.5">Người nộp/nhận</th>
                        <th className="p-2.5 text-right">Số tiền (VNĐ)</th>
                        <th className="p-2.5">Hình thức</th>
                        <th className="p-2.5">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredRows.map((r) => {
                        const isSelected = selectedIndices.has(r.originalIdx);
                        return (
                          <tr
                            key={r.originalIdx}
                            className={`hover:bg-muted/40 transition-colors ${
                              !r.isValid ? "bg-rose-500/5 text-rose-600 dark:text-rose-400" : isSelected ? "bg-[#003B95]/5" : ""
                            }`}
                          >
                            <td className="p-2.5 text-center">
                              <input
                                type="checkbox"
                                disabled={!r.isValid}
                                checked={isSelected}
                                onChange={() => toggleSelect(r.originalIdx)}
                                className="rounded border-border disabled:opacity-30"
                              />
                            </td>
                            <td className="p-2.5 whitespace-nowrap font-medium text-foreground">{r.date}</td>
                            <td className="p-2.5 whitespace-nowrap">
                              <span className="px-2 py-0.5 rounded-md bg-muted text-[11px] font-medium text-foreground">
                                {r.categoryLabel}
                              </span>
                            </td>
                            <td className="p-2.5 max-w-xs truncate text-foreground" title={r.description}>
                              {r.description}
                              {!r.isValid && (
                                <p className="text-[10px] text-rose-500 font-semibold mt-0.5 flex items-center gap-1">
                                  <AlertCircle className="h-3 w-3 inline" /> {r.error}
                                </p>
                              )}
                            </td>
                            <td className="p-2.5 whitespace-nowrap text-muted-foreground">{r.recipient || "—"}</td>
                            <td className="p-2.5 text-right whitespace-nowrap font-bold text-foreground">
                              {r.amount.toLocaleString("vi-VN")} đ
                            </td>
                            <td className="p-2.5 whitespace-nowrap">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                r.method === "cash" ? "bg-amber-500/10 text-amber-600" : "bg-blue-500/10 text-blue-600"
                              }`}>
                                {r.method === "cash" ? "Tiền mặt" : "Chuyển khoản"}
                              </span>
                            </td>
                            <td className="p-2.5 whitespace-nowrap">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                r.status === "completed" ? "bg-emerald-500/10 text-emerald-600" : "bg-yellow-500/10 text-yellow-600"
                              }`}>
                                {r.status === "completed" ? "Đã duyệt" : "Chờ duyệt"}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Progress bar during bulk import */}
          {importing && (
            <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-blue-700 dark:text-blue-300">
                <span className="flex items-center gap-1.5">
                  <Loader2 className="h-4 w-4 animate-spin text-[#003B95]" />
                  Đang ghi dữ liệu vào hệ thống...
                </span>
                <span>
                  {progress.current} / {progress.total} (
                  {Math.round((progress.current / (progress.total || 1)) * 100)}%)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-blue-200 dark:bg-blue-900 overflow-hidden">
                <div
                  className="h-full bg-[#003B95] transition-all duration-200"
                  style={{ width: `${(progress.current / (progress.total || 1)) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-muted/40">
          <span className="text-xs text-muted-foreground">
            {rows.length > 0
              ? `Tổng cộng ${rows.length} dòng. Chỉ import các dòng được tích chọn.`
              : "Vui lòng chọn hoặc kéo thả file Excel để bắt đầu."}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={importing}
              className="px-4 py-2 text-xs font-medium rounded-xl border border-border bg-card hover:bg-muted text-foreground transition-colors disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleImportSubmit}
              disabled={importing || selectedIndices.size === 0}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-black rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-sm shadow-amber-500/20 transition-all disabled:opacity-50"
            >
              {importing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-slate-950" />
                  Đang import ({progress.current}/{progress.total})...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 text-slate-950" />
                  Xác nhận Import ({selectedIndices.size} dòng)
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
