import { useState, useMemo, useRef, useEffect } from "react";
import {
  X,
  Printer,
  Download,
  Receipt,
  Filter,
  FileSpreadsheet,
  Building2,
  Calendar,
  CheckCircle2,
  Coins,
  ShieldCheck,
} from "lucide-react";
import { exportToExcel, formatDisplayDate, formatExcelCurrency, numberToVietnameseWords } from "@/lib/excel-export";
import { toast } from "sonner";

export interface InvoiceItem {
  id: string;
  code: string;
  date: string;
  category: string;
  description: string;
  amount: number;
  recipient?: string;
  method?: string;
  status?: string;
}

interface InvoiceExportModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  sourceType: "fees" | "finance";
  items: InvoiceItem[];
}

export function InvoiceExportModal({
  open,
  onClose,
  title = "Xuất Hóa Đơn & Chứng Từ Tài Chính",
  sourceType,
  items,
}: InvoiceExportModalProps) {
  const [exportMode, setExportMode] = useState<"all" | "category">("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [timeFilter, setTimeFilter] = useState<"all" | "month" | "quarter" | "year">("year");

  // Get distinct categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    items.forEach((it) => {
      if (it.category) set.add(it.category);
    });
    return Array.from(set);
  }, [items]);

  // Set default category when switching to category mode
  useEffect(() => {
    if (exportMode === "category" && selectedCategory === "all" && categories.length > 0) {
      setSelectedCategory(categories[0]);
    }
  }, [exportMode, selectedCategory, categories]);

  // Filter items
  const filteredItems = useMemo(() => {
    let res = [...items];

    // Filter by category
    if (exportMode === "category" && selectedCategory !== "all") {
      res = res.filter((it) => it.category === selectedCategory);
    }

    // Filter by time
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    if (timeFilter === "month") {
      res = res.filter((it) => {
        const d = new Date(it.date);
        return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
      });
    } else if (timeFilter === "quarter") {
      const currentQuarter = Math.floor(currentMonth / 3);
      res = res.filter((it) => {
        const d = new Date(it.date);
        return d.getFullYear() === currentYear && Math.floor(d.getMonth() / 3) === currentQuarter;
      });
    } else if (timeFilter === "year") {
      res = res.filter((it) => {
        const d = new Date(it.date);
        return d.getFullYear() === currentYear;
      });
    }

    return res;
  }, [items, exportMode, selectedCategory, timeFilter]);

  // Total sum
  const totalAmount = useMemo(() => {
    return filteredItems.reduce((sum, it) => sum + (Number(it.amount) || 0), 0);
  }, [filteredItems]);

  if (!open) return null;

  // Print Handler
  const handlePrint = () => {
    const printContent = document.getElementById("invoice-print-area");
    if (!printContent) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Vui lòng cho phép mở cửa sổ popup để in hóa đơn");
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>${title} - CEO 1983 HanoiBA</title>
          <style>
            @page { size: A4; margin: 15mm; }
            body { font-family: 'Times New Roman', serif; color: #000; margin: 0; padding: 10px; font-size: 13px; line-height: 1.4; }
            .header-text { text-align: center; }
            .header-title { font-size: 16px; font-weight: bold; text-transform: uppercase; margin-top: 15px; }
            .subtitle { font-size: 12px; font-style: italic; color: #444; }
            .meta-box { border: 1px dashed #999; padding: 10px; margin: 15px 0; border-radius: 6px; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th, td { border: 1px solid #333; padding: 7px 9px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; text-align: center; font-size: 12px; }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .total-row { font-weight: bold; background-color: #f9f9f9; }
            .signatures { margin-top: 40px; display: flex; justify-content: space-between; text-align: center; }
            .sign-col { width: 30%; }
            .sign-title { font-weight: bold; margin-bottom: 60px; }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 400);
  };

  // Excel Export Handler
  const handleExportExcel = () => {
    const filename = `HoaDon_${sourceType}_${exportMode === "all" ? "TongHop" : selectedCategory}_${new Date().toISOString().slice(0, 10)}`;
    const data = filteredItems.map((it, idx) => ({
      index: idx + 1,
      code: it.code || it.id,
      date: formatDisplayDate(it.date),
      category: it.category,
      recipient: it.recipient || "Doanh nghiệp CEO 1983",
      description: it.description,
      method: it.method?.toUpperCase() || "VNPAY",
      amount: it.amount,
    }));

    exportToExcel({
      filename,
      sheetName: "Hoa_Don_Chung_Tu",
      title: `BẢNG KÊ HÓA ĐƠN CHỨNG TỪ - ${exportMode === "all" ? "TỔNG HỢP" : selectedCategory.toUpperCase()}`,
      subtitle: `CLB Doanh Nhân CEO 1983 (HanoiBA) - Xuất ngày ${new Date().toLocaleDateString("vi-VN")}`,
      columns: [
        { header: "STT", key: "index", width: 8, value: (r) => r.index },
        { header: "Mã Chứng Từ / Hóa Đơn", key: "code", width: 22, value: (r) => r.code },
        { header: "Ngày Lập", key: "date", width: 16, value: (r) => r.date },
        { header: "Danh Mục Phân Loại", key: "category", width: 24, value: (r) => r.category },
        { header: "Đại Biểu / Đơn Vị Nộp", key: "recipient", width: 30, value: (r) => r.recipient },
        { header: "Nội Dung Diễn Giải", key: "description", width: 36, value: (r) => r.description },
        { header: "Phương Thức", key: "method", width: 16, value: (r) => r.method },
        { header: "Số Tiền (VNĐ)", key: "amount", width: 22, value: (r) => formatExcelCurrency(r.amount) },
      ],
      data,
      summaryRows: [
        ["TỔNG CỘNG THÀNH TIỀN:", "", "", "", "", "", "", formatExcelCurrency(totalAmount) + " đ"],
      ],
      amountInWords: numberToVietnameseWords(totalAmount),
      signerTitles: ["NGƯỜI LẬP BẢNG", "KẾ TOÁN TRƯỞNG", "CHỦ TỊCH CLB CEO 1983"],
    });

    toast.success("Xuất bảng kê hóa đơn Excel thành công!");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-card border border-border rounded-3xl shadow-2xl overflow-hidden max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#003B95] to-blue-700 flex items-center justify-center text-white shadow-md">
              <Receipt className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                {title}
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  Chuẩn A4 &amp; Excel
                </span>
              </h3>
              <p className="text-xs text-muted-foreground">
                Hỗ trợ xuất hóa đơn tổng hợp hoặc lọc xuất theo từng danh mục thu chi cụ thể
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted text-muted-foreground hover:text-foreground transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Toolbar: Options & Filtering */}
        <div className="p-4 border-b border-border bg-muted/20 flex flex-wrap items-center justify-between gap-3 shrink-0">
          {/* Mode Switcher */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-foreground">Phạm vi xuất:</span>
            <div className="inline-flex rounded-xl bg-card border border-border p-1 shadow-xs">
              <button
                type="button"
                onClick={() => setExportMode("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  exportMode === "all"
                    ? "bg-[#003B95] text-white shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Xuất Hóa Đơn Tổng Hợp
              </button>
              <button
                type="button"
                onClick={() => setExportMode("category")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  exportMode === "category"
                    ? "bg-[#003B95] text-white shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Xuất Theo Từng Danh Mục
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2">
            {exportMode === "category" && (
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="h-9 rounded-xl border border-border bg-card px-3 text-xs font-bold text-foreground shadow-xs focus:ring-2 focus:ring-blue-500"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    📁 {cat}
                  </option>
                ))}
              </select>
            )}

            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value as any)}
              className="h-9 rounded-xl border border-border bg-card px-3 text-xs font-medium text-foreground shadow-xs"
            >
              <option value="month">Kỳ này (Tháng hiện tại)</option>
              <option value="quarter">Quý hiện tại</option>
              <option value="year">Cả năm {new Date().getFullYear()}</option>
              <option value="all">Tất cả thời gian</option>
            </select>
          </div>
        </div>

        {/* Live A4 Document Preview */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto bg-slate-100 dark:bg-slate-900/60 flex justify-center">
          <div
            id="invoice-print-area"
            className="w-full max-w-[800px] bg-white text-slate-900 p-8 sm:p-10 rounded-2xl shadow-xl border border-slate-200 text-xs font-['Times_New_Roman',serif] leading-relaxed"
          >
            {/* National Header */}
            <div className="text-center pb-4 border-b border-slate-300">
              <div className="font-bold text-[13px] uppercase tracking-wider">
                CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
              </div>
              <div className="font-bold text-[11px] underline underline-offset-4 mt-0.5">
                Độc lập - Tự do - Hạnh phúc
              </div>
              <div className="mt-4 text-base sm:text-lg font-black uppercase text-blue-900">
                {exportMode === "all"
                  ? "BẢNG KÊ HÓA ĐƠN & CHỨNG TỪ TÀI CHÍNH TỔNG HỢP"
                  : `HÓA ĐƠN CHỨNG TỪ THEO DANH MỤC: ${selectedCategory.toUpperCase()}`}
              </div>
              <div className="text-[11px] italic text-slate-500 mt-0.5">
                (Kỳ phát hành: {timeFilter === "year" ? `Năm ${new Date().getFullYear()}` : "Toàn bộ kỳ kế toán"} • Đơn vị tiền tệ: VNĐ)
              </div>
            </div>

            {/* Issuer Information Box */}
            <div className="my-4 p-3 rounded-lg border border-dashed border-slate-300 bg-slate-50/60 space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span>
                  <strong>Đơn vị phát hành:</strong> CLB DOANH NHÂN CEO 1983 (HANOIBA)
                </span>
                <span>
                  <strong>Mã số thuế:</strong> 0101234567
                </span>
              </div>
              <div>
                <strong>Địa chỉ:</strong> Tầng 6, Cung Tri Thức Thành Phố, P. Dịch Vọng Hậu, Q. Cầu Giấy, Hà Nội
              </div>
              <div className="flex justify-between">
                <span>
                  <strong>Tài khoản thanh toán:</strong> 1983000000 - Cổng Quốc Gia VNPAY / MB Bank
                </span>
                <span>
                  <strong>Ngày trích xuất:</strong> {new Date().toLocaleDateString("vi-VN")}
                </span>
              </div>
            </div>

            {/* Table of Items */}
            <div className="overflow-x-auto my-4">
              <table className="w-full border-collapse border border-slate-400 text-[11px]">
                <thead>
                  <tr className="bg-slate-100 text-center font-bold">
                    <th className="border border-slate-400 p-2 w-10">STT</th>
                    <th className="border border-slate-400 p-2 w-28">Mã Hóa Đơn</th>
                    <th className="border border-slate-400 p-2 w-24">Ngày Lập</th>
                    <th className="border border-slate-400 p-2">Đại Biểu / Đơn Vị</th>
                    <th className="border border-slate-400 p-2">Nội Dung Diễn Giải</th>
                    <th className="border border-slate-400 p-2 w-24">Phương Thức</th>
                    <th className="border border-slate-400 p-2 w-28 text-right">Số Tiền (VNĐ)</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="border border-slate-400 p-4 text-center italic text-slate-500">
                        Không có chứng từ hóa đơn nào trong danh mục hoặc kỳ đã chọn
                      </td>
                    </tr>
                  ) : (
                    filteredItems.map((it, idx) => (
                      <tr key={it.id || idx} className="hover:bg-slate-50/80">
                        <td className="border border-slate-400 p-1.5 text-center font-semibold">{idx + 1}</td>
                        <td className="border border-slate-400 p-1.5 font-mono font-bold text-blue-900">{it.code || it.id}</td>
                        <td className="border border-slate-400 p-1.5 text-center">{formatDisplayDate(it.date)}</td>
                        <td className="border border-slate-400 p-1.5 font-semibold">{it.recipient || "Hội viên CEO 1983"}</td>
                        <td className="border border-slate-400 p-1.5">{it.description}</td>
                        <td className="border border-slate-400 p-1.5 text-center uppercase font-bold text-[10px]">
                          {it.method || "VNPAY"}
                        </td>
                        <td className="border border-slate-400 p-1.5 text-right font-bold">
                          {Number(it.amount || 0).toLocaleString("vi-VN")}
                        </td>
                      </tr>
                    ))
                  )}
                  {/* Summary Total Row */}
                  <tr className="bg-slate-100 font-bold border-t-2 border-slate-500">
                    <td colSpan={6} className="border border-slate-400 p-2 text-right uppercase tracking-wider">
                      TỔNG CỘNG THÀNH TIỀN:
                    </td>
                    <td className="border border-slate-400 p-2 text-right text-sm font-black text-blue-900">
                      {totalAmount.toLocaleString("vi-VN")} đ
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* In Words */}
            <div className="italic text-[11px] text-slate-700 mb-6">
              Số tiền viết bằng chữ: <strong>{numberToVietnameseWords(totalAmount)}</strong>
            </div>

            {/* Signatures */}
            <div className="grid grid-cols-3 text-center pt-4 text-[11px] gap-4">
              <div>
                <div className="font-bold uppercase">Người Lập Phiếu</div>
                <div className="italic text-[10px] text-slate-500">(Ký, ghi rõ họ tên)</div>
                <div className="h-16 flex items-end justify-center font-bold">Ban Kế Toán</div>
              </div>
              <div>
                <div className="font-bold uppercase">Kế Toán Trưởng</div>
                <div className="italic text-[10px] text-slate-500">(Ký, ghi rõ họ tên)</div>
                <div className="h-16 flex items-end justify-center font-bold">Ban Tài Chính</div>
              </div>
              <div>
                <div className="font-bold uppercase">Chủ Tịch CLB</div>
                <div className="italic text-[10px] text-slate-500">(Ký, đóng dấu số)</div>
                <div className="h-16 flex items-end justify-center font-bold text-blue-900">
                  CLB Doanh Nhân CEO 1983
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 border-t border-border flex items-center justify-between bg-muted/40 shrink-0">
          <div className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Coins className="h-4 w-4 text-amber-500" />
            <span>
              Tổng số chứng từ: <strong>{filteredItems.length}</strong> • Tổng giá trị:{" "}
              <strong className="text-emerald-600 dark:text-emerald-400">
                {totalAmount.toLocaleString("vi-VN")} đ
              </strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportExcel}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border bg-card hover:bg-muted text-xs font-bold text-foreground shadow-xs transition cursor-pointer"
            >
              <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
              <span>Xuất File Excel (.xlsx)</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#003B95] hover:bg-[#002f78] text-white text-xs font-bold shadow-md transition cursor-pointer"
            >
              <Printer className="h-4 w-4" />
              <span>In Hóa Đơn / Xuất PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

