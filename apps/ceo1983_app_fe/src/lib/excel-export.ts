import * as XLSX from "xlsx";

export interface ExcelColumn<T> {
  header: string;
  key: string;
  width?: number;
  value: (row: T, index: number) => string | number | boolean | null | undefined;
}

export interface ExportExcelOptions<T> {
  title: string;
  subtitle?: string;
  filename: string;
  sheetName?: string;
  columns: ExcelColumn<T>[];
  data: T[];
  summaryRows?: Array<Array<string | number | null | undefined>>;
  signerTitles?: [string, string, string];
}

/**
 * Format ISO or any date string to standard Vietnamese DD/MM/YYYY
 */
export function formatDisplayDate(val: any): string {
  if (!val) return "";
  if (val instanceof Date) {
    if (isNaN(val.getTime())) return "";
    const d = String(val.getDate()).padStart(2, "0");
    const m = String(val.getMonth() + 1).padStart(2, "0");
    const y = val.getFullYear();
    return `${d}/${m}/${y}`;
  }
  const s = String(val).trim();
  // Already in DD/MM/YYYY
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(s)) {
    const [d, m, y] = s.split("/");
    return `${d.padStart(2, "0")}/${m.padStart(2, "0")}/${y}`;
  }
  // YYYY-MM-DD or ISO string
  const mYmd = s.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (mYmd) {
    const y = mYmd[1];
    const m = mYmd[2].padStart(2, "0");
    const d = mYmd[3].padStart(2, "0");
    return `${d}/${m}/${y}`;
  }
  const parsed = new Date(s);
  if (!isNaN(parsed.getTime())) {
    const d = String(parsed.getDate()).padStart(2, "0");
    const m = String(parsed.getMonth() + 1).padStart(2, "0");
    const y = parsed.getFullYear();
    return `${d}/${m}/${y}`;
  }
  return s;
}

/**
 * Format currency number to Vietnamese formatted string e.g. 15.000.000 đ
 */
export function formatExcelCurrency(amount: number | string | null | undefined): string {
  if (amount === undefined || amount === null || amount === "") return "0";
  const num = typeof amount === "number" ? amount : parseFloat(String(amount).replace(/[^0-9.-]/g, ""));
  if (isNaN(num)) return "0";
  return new Intl.NumberFormat("vi-VN").format(num);
}

/**
 * Generates and downloads a clean, beautifully formatted corporate Excel file (.xlsx)
 * with official organization header, report title, export metadata, column widths,
 * summary totals, and formal 3-party signature section.
 */
export function exportToExcel<T>({
  title,
  subtitle,
  filename,
  sheetName = "Báo cáo",
  columns,
  data,
  summaryRows = [],
  signerTitles = ["NGƯỜI LẬP BIỂU", "KẾ TOÁN TRƯỞNG / TRƯỞNG BAN", "CHỦ TỊCH / ĐẠI DIỆN BQT"],
}: ExportExcelOptions<T>): void {
  if (typeof window === "undefined") return;

  const now = new Date();
  const dateStr = formatDisplayDate(now);
  const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  // Build rows array for Sheet
  const sheetRows: any[][] = [];

  // Row 1: Header Organization & National Motto
  sheetRows.push([
    "HIỆP HỘI DOANH NHÂN CEO 1983 (HANOIBA)",
    "",
    "",
    "",
    "CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM",
  ]);

  // Row 2: Sub-Organization & Independence - Freedom - Happiness
  sheetRows.push([
    "BAN CHẤP HÀNH - VĂN PHÒNG HIỆP HỘI",
    "",
    "",
    "",
    "Độc lập - Tự do - Hạnh phúc",
  ]);

  // Row 3: Blank separator
  sheetRows.push([]);

  // Row 4: Main Document Title in UPPERCASE
  sheetRows.push(["", "", title.toUpperCase()]);

  // Row 5: Subtitle or extra reporting context
  if (subtitle) {
    sheetRows.push(["", "", subtitle]);
  }

  // Row 6: Export metadata
  sheetRows.push([
    `Ngày xuất báo cáo: ${dateStr} lúc ${timeStr} | Đơn vị: CLB Doanh Nhân CEO 1983 | Tổng số bản ghi: ${data.length}`,
  ]);

  // Row 7: Blank separator
  sheetRows.push([]);

  // Row 8: Table Column Headers (STT + Column headers)
  const headerRow = ["STT", ...columns.map((c) => c.header)];
  sheetRows.push(headerRow);

  // Table Data Rows
  data.forEach((row, idx) => {
    const dataRow: any[] = [
      idx + 1,
      ...columns.map((col) => {
        const val = col.value(row, idx);
        return val === null || val === undefined ? "" : val;
      }),
    ];
    sheetRows.push(dataRow);
  });

  // Summary Rows (if any)
  if (summaryRows && summaryRows.length > 0) {
    sheetRows.push([]);
    summaryRows.forEach((sr) => {
      sheetRows.push(sr);
    });
  }

  // Corporate Footer & Signatures Block
  sheetRows.push([]);
  sheetRows.push([]);
  const colCount = Math.max(headerRow.length, 6);
  const dateLocationRow = new Array(colCount).fill("");
  dateLocationRow[colCount - 2] = `Hà Nội, ngày ${now.getDate()} tháng ${now.getMonth() + 1} năm ${now.getFullYear()}`;
  sheetRows.push(dateLocationRow);

  const signTitleRow = new Array(colCount).fill("");
  signTitleRow[1] = signerTitles[0];
  signTitleRow[Math.floor(colCount / 2)] = signerTitles[1];
  signTitleRow[colCount - 2] = signerTitles[2];
  sheetRows.push(signTitleRow);

  const signHintRow = new Array(colCount).fill("");
  signHintRow[1] = "(Ký, ghi rõ họ tên)";
  signHintRow[Math.floor(colCount / 2)] = "(Ký, ghi rõ họ tên)";
  signHintRow[colCount - 2] = "(Ký, đóng dấu, ghi rõ họ tên)";
  sheetRows.push(signHintRow);

  // Empty spaces for physical signature
  sheetRows.push([]);
  sheetRows.push([]);
  sheetRows.push([]);

  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet(sheetRows);

  // Calculate auto column widths
  const colWidths = [{ wch: 8 }]; // STT column width
  columns.forEach((col, cIdx) => {
    let maxLen = col.header.length;
    if (col.width) {
      maxLen = Math.max(maxLen, col.width);
    } else {
      // Sample first 50 rows to estimate length
      for (let i = 0; i < Math.min(data.length, 50); i++) {
        const v = col.value(data[i], i);
        if (v !== null && v !== undefined) {
          const strLen = String(v).length;
          if (strLen > maxLen) maxLen = strLen;
        }
      }
      maxLen = Math.min(Math.max(maxLen + 4, 15), 50);
    }
    colWidths.push({ wch: maxLen });
  });

  ws["!cols"] = colWidths;

  // Create workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName.slice(0, 31));

  // Write and trigger download
  const stamp = now.toISOString().slice(0, 10);
  const cleanFilename = filename.endsWith(".xlsx") ? filename : `${filename}-${stamp}.xlsx`;
  XLSX.writeFile(wb, cleanFilename);
}
