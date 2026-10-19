import React, { useState, useRef } from "react";
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
  Award,
} from "lucide-react";
import { toast } from "sonner";
import { fetchNestApi } from "@/lib/api-client";
import { createSponsorFn, type Sponsor } from "@/lib/sponsors.functions";
import { useServerFn } from "@tanstack/react-start";

export interface ParsedSponsorRow {
  id?: string;
  name: string;
  tier: "platinum" | "gold" | "silver" | "bronze";
  tierLabel: string;
  packageType: "bank_transfer" | "cash" | "in_kind";
  inKindDescription?: string;
  contact: string;
  email: string;
  phone: string;
  amount: number;
  since: string;
  events: number;
  status: "active" | "expired";
  isValid: boolean;
  error?: string;
}

export interface SponsorExcelImportModalProps {
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

function mapTier(raw: string): { key: "platinum" | "gold" | "silver" | "bronze"; label: string } {
  const norm = (raw || "").toLowerCase().trim();
  if (norm.includes("kim cương") || norm.includes("platinum") || norm.includes("kc")) {
    return { key: "platinum", label: "Kim Cương" };
  }
  if (norm.includes("vàng") || norm.includes("gold")) {
    return { key: "gold", label: "Vàng" };
  }
  if (norm.includes("bạc") || norm.includes("silver")) {
    return { key: "silver", label: "Bạc" };
  }
  return { key: "bronze", label: "Đồng" };
}

function mapPackageType(raw: string): "bank_transfer" | "cash" | "in_kind" {
  const norm = (raw || "").toLowerCase().trim();
  if (
    norm.includes("hiện vật") ||
    norm.includes("in_kind") ||
    norm.includes("sản phẩm") ||
    norm.includes("hàng hóa")
  ) {
    return "in_kind";
  }
  if (
    norm.includes("tiền mặt") ||
    norm.includes("cash") ||
    norm.includes("trực tiếp")
  ) {
    return "cash";
  }
  return "bank_transfer";
}

function mapStatus(raw: string): "active" | "expired" {
  const norm = (raw || "").toLowerCase().trim();
  if (norm.includes("hết hạn") || norm.includes("expired") || norm.includes("tạm ngưng") || norm.includes("đình chỉ")) {
    return "expired";
  }
  return "active";
}

export function SponsorExcelImportModal({
  isOpen,
  onClose,
  onImportSuccess,
}: SponsorExcelImportModalProps) {
  const createFn = useServerFn(createSponsorFn);

  const [file, setFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [rows, setRows] = useState<ParsedSponsorRow[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  const [filterTab, setFilterTab] = useState<"all" | "valid" | "invalid">("all");
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDownloadTemplate = () => {
    const wb = XLSX.utils.book_new();

    const sampleData = [
      ["HIỆP HỘI DOANH NHÂN CEO 1983 (HANOIBA)", "", "", "", "CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM"],
      ["BAN XÚC TIẾN THƯƠNG MẠI & TÀI TRỢ", "", "", "", "Độc lập - Tự do - Hạnh phúc"],
      [],
      ["", "", "BẢNG MẪU NHẬP DỮ LIỆU ĐỐI TÁC & NHÀ TÀI TRỢ CHÍNH THỨC"],
      ["(Mẫu chuẩn hóa hệ thống quản trị dữ liệu Hiệp Hội Doanh Nhân CEO 1983)"],
      [],
      [
        "STT",
        "Tên Nhà Tài Trợ / Doanh Nghiệp",
        "Hạng Tài Trợ",
        "Hình Thức",
        "Giá Trị Tài Trợ (VNĐ)",
        "Chi Tiết Hiện Vật",
        "Đại Diện / Người Liên Hệ",
        "Email Liên Hệ",
        "Số Điện Thoại",
        "Ngày Tham Gia",
        "Số Sự Kiện",
        "Trạng Thái",
      ],
      [
        1,
        "Công ty Cổ phần Tập đoàn Hòa Bình",
        "Kim Cương",
        "Chuyển khoản",
        100000000,
        "",
        "Ông Nguyễn Văn A",
        "contact@hoabinhgroup.vn",
        "0912345678",
        "15/01/2026",
        3,
        "Đang hoạt động",
      ],
      [
        2,
        "Ngân hàng Thương mại Cổ phần Ngoại thương Việt Nam (Vietcombank)",
        "Vàng",
        "Chuyển khoản",
        50000000,
        "",
        "Bà Trần Thị B",
        "pr@vietcombank.com.vn",
        "0987654321",
        "10/02/2026",
        2,
        "Đang hoạt động",
      ],
      [
        3,
        "Công ty TNHH Giải pháp Công nghệ FPT",
        "Bạc",
        "Hiện vật",
        30000000,
        "Tài trợ giải pháp WiFi Cloud và thiết bị livestream",
        "Ông Lê Văn C",
        "fpt.tech@fpt.com.vn",
        "0903123456",
        "01/03/2026",
        1,
        "Đang hoạt động",
      ],
      [
        4,
        "Công ty Cổ phần Thực phẩm Dinh Dưỡng An Sinh",
        "Đồng",
        "Tiền mặt",
        15000000,
        "",
        "Bà Phạm Thị D",
        "info@ansinhfood.com",
        "0978901234",
        "05/03/2026",
        1,
        "Đang hoạt động",
      ],
    ];

    const ws = XLSX.utils.aoa_to_sheet(sampleData);
    ws["!cols"] = [
      { wch: 6 },
      { wch: 38 },
      { wch: 16 },
      { wch: 14 },
      { wch: 22 },
      { wch: 36 },
      { wch: 24 },
      { wch: 26 },
      { wch: 16 },
      { wch: 16 },
      { wch: 12 },
      { wch: 16 },
    ];
    XLSX.utils.book_append_sheet(wb, ws, "Nha_Tai_Tro");
    XLSX.writeFile(wb, "Bao_Cao_Mau_Nha_Tai_Tro_CEO1983.xlsx");
    toast.success("Đã tải xuống file mẫu Excel nhà tài trợ thành công!");
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
            s.includes("tên") ||
            s.includes("tài trợ") ||
            s.includes("doanh nghiệp") ||
            s.includes("hạng") ||
            s.includes("giá trị") ||
            s.includes("số tiền") ||
            s.includes("liên hệ") ||
            s.includes("email") ||
            s.includes("phone") ||
            s.includes("sđt")
          );
        });

        if (matches.length >= 2) {
          headerRowIdx = r;
          row.forEach((cellVal: any, colIdx: number) => {
            const h = String(cellVal || "").toLowerCase().trim();
            if (h.includes("tên") || h.includes("nhà tài trợ") || h.includes("doanh nghiệp") || h.includes("công ty")) colMap["name"] = colIdx;
            else if (h.includes("hạng") || h.includes("gói") || h.includes("tier")) colMap["tier"] = colIdx;
            else if (h.includes("hình thức") || h.includes("loại") || h.includes("package")) colMap["packageType"] = colIdx;
            else if (h.includes("hiện vật") || h.includes("mô tả") || h.includes("chi tiết")) colMap["inKind"] = colIdx;
            else if (h.includes("giá trị") || h.includes("số tiền") || h.includes("tiền") || h.includes("amount")) colMap["amount"] = colIdx;
            else if (h.includes("người") || h.includes("liên hệ") || h.includes("đại diện") || h.includes("contact")) colMap["contact"] = colIdx;
            else if (h.includes("email") || h.includes("mail")) colMap["email"] = colIdx;
            else if (h.includes("phone") || h.includes("sđt") || h.includes("điện thoại")) colMap["phone"] = colIdx;
            else if (h.includes("ngày") || h.includes("since") || h.includes("thời gian")) colMap["since"] = colIdx;
            else if (h.includes("sự kiện") || h.includes("events")) colMap["events"] = colIdx;
            else if (h.includes("trạng thái") || h.includes("status")) colMap["status"] = colIdx;
          });
          break;
        }
      }

      // Default index fallback if header detection was incomplete
      if (colMap["name"] === undefined) colMap["name"] = 1;
      if (colMap["tier"] === undefined) colMap["tier"] = 2;
      if (colMap["packageType"] === undefined) colMap["packageType"] = 3;
      if (colMap["amount"] === undefined) colMap["amount"] = 4;
      if (colMap["inKind"] === undefined) colMap["inKind"] = 5;
      if (colMap["contact"] === undefined) colMap["contact"] = 6;
      if (colMap["email"] === undefined) colMap["email"] = 7;
      if (colMap["phone"] === undefined) colMap["phone"] = 8;
      if (colMap["since"] === undefined) colMap["since"] = 9;
      if (colMap["events"] === undefined) colMap["events"] = 10;
      if (colMap["status"] === undefined) colMap["status"] = 11;

      const parsed: ParsedSponsorRow[] = [];

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

        const rawName = String(row[colMap["name"]] || "").trim();
        const rawTier = String(row[colMap["tier"]] || "");
        const rawPkg = String(row[colMap["packageType"]] || "");
        const rawInKind = String(row[colMap["inKind"]] || "").trim();
        const rawAmount = row[colMap["amount"]];
        const rawContact = String(row[colMap["contact"]] || "").trim();
        const rawEmail = String(row[colMap["email"]] || "").trim();
        const rawPhone = String(row[colMap["phone"]] || "").trim();
        const rawSince = row[colMap["since"]];
        const rawEvents = parseInt(String(row[colMap["events"]] || "0"), 10) || 0;
        const rawStatus = String(row[colMap["status"]] || "");

        const tierInfo = mapTier(rawTier);
        const packageType = mapPackageType(rawPkg);
        const amount = parseAmount(rawAmount);
        const since = parseDate(rawSince);
        const status = mapStatus(rawStatus);

        let isValid = true;
        let error = "";

        if (!rawName) {
          isValid = false;
          error = "Thiếu tên nhà tài trợ / doanh nghiệp";
        } else if (amount < 0) {
          isValid = false;
          error = "Số tiền tài trợ không hợp lệ";
        }

        parsed.push({
          name: rawName,
          tier: tierInfo.key,
          tierLabel: tierInfo.label,
          packageType,
          inKindDescription: rawInKind,
          contact: rawContact,
          email: rawEmail,
          phone: rawPhone,
          amount,
          since,
          events: rawEvents,
          status,
          isValid,
          error,
        });
      }

      setRows(parsed);
      const validIdxs = new Set<number>();
      parsed.forEach((r, idx) => {
        if (r.isValid) validIdxs.add(idx);
      });
      setSelectedIndices(validIdxs);
      toast.success(`Đã đọc ${parsed.length} dòng từ file (${validIdxs.size} hợp lệ)`);
    } catch (err: any) {
      console.error("[SponsorExcelImport] Parse error:", err);
      toast.error(err?.message || "Lỗi khi xử lý file Excel");
    } finally {
      setParsing(false);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const all = new Set<number>();
      rows.forEach((r, idx) => {
        if (r.isValid) all.add(idx);
      });
      setSelectedIndices(all);
    } else {
      setSelectedIndices(new Set());
    }
  };

  const handleToggleRow = (idx: number) => {
    setSelectedIndices((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const handleConfirmImport = async () => {
    if (selectedIndices.size === 0) {
      toast.error("Vui lòng chọn ít nhất 1 dòng hợp lệ để import.");
      return;
    }

    setImporting(true);
    setProgress({ current: 0, total: selectedIndices.size });

    let successCount = 0;
    let failCount = 0;
    const indices = Array.from(selectedIndices);

    for (let i = 0; i < indices.length; i++) {
      const idx = indices[i];
      const r = rows[idx];
      if (!r) continue;

      try {
        await createFn({
          data: {
            name: r.name,
            tier: r.tier,
            sponsorType: "new",
            packageType: r.packageType,
            inKindDescription: r.inKindDescription || "",
            contact: r.contact || "",
            email: r.email || "",
            phone: r.phone || "",
            amount: r.amount,
            events: r.events,
            since: r.since,
            status: r.status,
          },
        });
        successCount++;
      } catch (e) {
        console.warn(`[SponsorExcelImport] Error importing row #${idx + 1}:`, e);
        failCount++;
      }

      setProgress({ current: i + 1, total: indices.length });
    }

    setImporting(false);
    if (successCount > 0) {
      toast.success(`Đã import thành công ${successCount} nhà tài trợ vào hệ thống!`);
      if (onImportSuccess) onImportSuccess();
      onClose();
    }
    if (failCount > 0) {
      toast.error(`Có ${failCount} nhà tài trợ import bị lỗi, vui lòng kiểm tra lại.`);
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

  const TIER_BADGES: Record<string, string> = {
    platinum: "bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200",
    gold: "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200",
    silver: "bg-slate-100 text-slate-700 dark:bg-slate-900/60 dark:text-slate-300 border-slate-200",
    bronze: "bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300 border-orange-200",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="flex flex-col w-full max-w-4xl max-h-[90vh] bg-card rounded-2xl border border-border shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">
                Import Danh Sách Nhà Tài Trợ từ Excel
              </h2>
              <p className="text-xs text-muted-foreground">
                Trích xuất danh sách đối tác & nhà tài trợ, tự động nhận diện hạng tài trợ và lưu vào cơ sở dữ liệu
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
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
                className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border border-border bg-card hover:bg-muted text-foreground transition cursor-pointer"
              >
                <Download className="h-4 w-4 text-amber-600" />
                <span>Tải file mẫu Excel</span>
              </button>
            </div>

            {/* Drop Zone */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="md:col-span-2 p-6 rounded-xl border-2 border-dashed border-border hover:border-amber-500/60 bg-muted/10 hover:bg-amber-500/5 transition flex flex-col items-center justify-center text-center cursor-pointer group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="p-3 rounded-full bg-amber-500/10 text-amber-600 group-hover:scale-110 transition-transform mb-2">
                <Upload className="h-6 w-6" />
              </div>
              <span className="text-sm font-bold text-foreground">
                {file ? file.name : "Kéo thả file Excel vào đây hoặc bấm để chọn file"}
              </span>
              <span className="text-xs text-muted-foreground mt-1">
                Hỗ trợ định dạng .xlsx, .xls, .csv (Tối đa 10MB)
              </span>
            </div>
          </div>

          {/* Parsing State */}
          {parsing && (
            <div className="py-12 flex flex-col items-center justify-center space-y-2">
              <Loader2 className="h-8 w-8 text-amber-600 animate-spin" />
              <p className="text-xs font-semibold text-muted-foreground">Đang đọc và phân tích cấu trúc file Excel...</p>
            </div>
          )}

          {/* Results Table */}
          {!parsing && rows.length > 0 && (
            <div className="space-y-3">
              {/* Summary and Filter Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-foreground">Xem dữ liệu:</span>
                  <div className="inline-flex rounded-lg border border-border p-0.5 bg-muted/40 text-xs">
                    <button
                      type="button"
                      onClick={() => setFilterTab("all")}
                      className={`px-2.5 py-1 rounded-md font-semibold transition cursor-pointer ${
                        filterTab === "all" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Tất cả ({rows.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilterTab("valid")}
                      className={`px-2.5 py-1 rounded-md font-semibold transition cursor-pointer ${
                        filterTab === "valid" ? "bg-emerald-500 text-white shadow-xs" : "text-emerald-600 hover:text-emerald-700"
                      }`}
                    >
                      Hợp lệ ({validTotal})
                    </button>
                    {invalidTotal > 0 && (
                      <button
                        type="button"
                        onClick={() => setFilterTab("invalid")}
                        className={`px-2.5 py-1 rounded-md font-semibold transition cursor-pointer ${
                          filterTab === "invalid" ? "bg-rose-500 text-white shadow-xs" : "text-rose-600 hover:text-rose-700"
                        }`}
                      >
                        Lỗi dữ liệu ({invalidTotal})
                      </button>
                    )}
                  </div>
                </div>

                <div className="text-xs text-muted-foreground">
                  Đã chọn: <span className="font-bold text-foreground">{selectedIndices.size}</span> / {validTotal} dòng hợp lệ
                </div>
              </div>

              {/* Table */}
              <div className="border border-border rounded-xl overflow-hidden max-h-[360px] overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="sticky top-0 bg-muted/90 backdrop-blur-xs text-muted-foreground border-b border-border font-bold">
                    <tr>
                      <th className="p-3 w-10 text-center">
                        <input
                          type="checkbox"
                          checked={selectedIndices.size === validTotal && validTotal > 0}
                          onChange={(e) => handleSelectAll(e.target.checked)}
                          className="rounded border-border text-amber-600 focus:ring-amber-500 cursor-pointer"
                        />
                      </th>
                      <th className="p-3 min-w-[200px]">Tên Nhà Tài Trợ</th>
                      <th className="p-3 min-w-[120px]">Hạng Tài Trợ</th>
                      <th className="p-3 min-w-[130px]">Giá Trị (VNĐ)</th>
                      <th className="p-3 min-w-[150px]">Người Liên Hệ</th>
                      <th className="p-3 min-w-[110px]">Ngày Tham Gia</th>
                      <th className="p-3 min-w-[110px]">Trạng Thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredRows.map((r) => {
                      const isSelected = selectedIndices.has(r.originalIdx);
                      return (
                        <tr
                          key={r.originalIdx}
                          className={`hover:bg-muted/30 transition-colors ${
                            !r.isValid ? "bg-rose-500/5 text-muted-foreground" : isSelected ? "bg-amber-500/5" : ""
                          }`}
                        >
                          <td className="p-3 text-center">
                            <input
                              type="checkbox"
                              disabled={!r.isValid}
                              checked={isSelected}
                              onChange={() => handleToggleRow(r.originalIdx)}
                              className="rounded border-border text-amber-600 focus:ring-amber-500 cursor-pointer disabled:opacity-30"
                            />
                          </td>
                          <td className="p-3 font-semibold text-foreground">
                            <div className="truncate max-w-[220px]" title={r.name}>
                              {r.name || "—"}
                            </div>
                            {r.packageType === "in_kind" && r.inKindDescription && (
                              <div className="text-[10px] text-amber-600 truncate max-w-[220px]">
                                Hiện vật: {r.inKindDescription}
                              </div>
                            )}
                            {r.error && (
                              <div className="text-[10px] text-rose-500 font-normal mt-0.5 flex items-center gap-1">
                                <AlertCircle className="h-3 w-3 inline shrink-0" />
                                <span>{r.error}</span>
                              </div>
                            )}
                          </td>
                          <td className="p-3">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${TIER_BADGES[r.tier] || "bg-muted text-foreground"}`}>
                              <Award className="h-3 w-3" />
                              <span>{r.tierLabel}</span>
                            </span>
                          </td>
                          <td className="p-3 font-mono font-bold text-foreground">
                            {r.amount.toLocaleString("vi-VN")} đ
                          </td>
                          <td className="p-3">
                            <div className="text-foreground truncate max-w-[140px]">{r.contact || "—"}</div>
                            {r.phone && <div className="text-[10px] text-muted-foreground">{r.phone}</div>}
                          </td>
                          <td className="p-3 font-mono text-muted-foreground">{r.since}</td>
                          <td className="p-3">
                            {r.isValid ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600">
                                <Check className="h-3 w-3" />
                                Hợp lệ
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-600">
                                <AlertCircle className="h-3 w-3" />
                                Lỗi
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Progress Bar during Import */}
          {importing && (
            <div className="p-4 rounded-xl border border-border bg-card space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between text-xs font-bold text-foreground">
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-amber-600" />
                  Đang import dữ liệu nhà tài trợ vào CSDL...
                </span>
                <span className="font-mono">
                  {progress.current} / {progress.total}
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-amber-600 transition-all duration-200"
                  style={{ width: `${progress.total > 0 ? (progress.current / progress.total) * 100 : 0}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-muted/40">
          <button
            type="button"
            onClick={onClose}
            disabled={importing}
            className="px-4 py-2 rounded-xl text-xs font-semibold border border-border bg-card hover:bg-muted text-foreground transition cursor-pointer"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleConfirmImport}
            disabled={importing || selectedIndices.size === 0}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 transition shadow-sm cursor-pointer disabled:opacity-50"
          >
            {importing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Đang lưu vào hệ thống...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                <span>Xác nhận Import ({selectedIndices.size} nhà tài trợ)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
