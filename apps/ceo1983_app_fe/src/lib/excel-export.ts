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

  const headerRow = ["STT", ...columns.map((c) => c.header)];
  const colCount = Math.max(headerRow.length, 6);
  const midCol = Math.floor(colCount / 2);

  // Build rows array for Sheet
  const sheetRows: any[][] = [];
  const merges: XLSX.Range[] = [];

  // Helper to make row with specific length
  const makeRow = (firstVal: string = "") => {
    const r = new Array(colCount).fill("");
    r[0] = firstVal;
    return r;
  };

  // Row 0: Header Organization (Left) & National Motto (Right)
  const row0 = new Array(colCount).fill("");
  row0[0] = "HIỆP HỘI DOANH NHÂN CEO 1983 (HANOIBA)";
  row0[midCol] = "CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM";
  sheetRows.push(row0);
  merges.push({ s: { r: 0, c: 0 }, e: { r: 0, c: midCol - 1 } });
  merges.push({ s: { r: 0, c: midCol }, e: { r: 0, c: colCount - 1 } });

  // Row 1: Sub-Organization (Left) & Independence - Freedom - Happiness (Right)
  const row1 = new Array(colCount).fill("");
  row1[0] = "BAN CHẤP HÀNH - VĂN PHÒNG HIỆP HỘI";
  row1[midCol] = "Độc lập - Tự do - Hạnh phúc";
  sheetRows.push(row1);
  merges.push({ s: { r: 1, c: 0 }, e: { r: 1, c: midCol - 1 } });
  merges.push({ s: { r: 1, c: midCol }, e: { r: 1, c: colCount - 1 } });

  // Row 2: Blank separator
  sheetRows.push(new Array(colCount).fill(""));

  // Row 3: Main Document Title (Merged across entire table)
  const titleRowIdx = sheetRows.length;
  const titleRow = makeRow(title.toUpperCase());
  sheetRows.push(titleRow);
  merges.push({ s: { r: titleRowIdx, c: 0 }, e: { r: titleRowIdx, c: colCount - 1 } });

  // Subtitle (if present)
  if (subtitle) {
    const subRowIdx = sheetRows.length;
    const subRow = makeRow(subtitle);
    sheetRows.push(subRow);
    merges.push({ s: { r: subRowIdx, c: 0 }, e: { r: subRowIdx, c: colCount - 1 } });
  }

  // Export metadata
  const metaRowIdx = sheetRows.length;
  const metaRow = makeRow(
    `Ngày xuất báo cáo: ${dateStr} lúc ${timeStr} | Đơn vị: CLB Doanh Nhân CEO 1983 | Tổng số bản ghi: ${data.length}`
  );
  sheetRows.push(metaRow);
  merges.push({ s: { r: metaRowIdx, c: 0 }, e: { r: metaRowIdx, c: colCount - 1 } });

  // Blank separator before table
  sheetRows.push(new Array(colCount).fill(""));

  // Table Column Headers (STT + Column headers)
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
    // Pad to colCount if needed
    while (dataRow.length < colCount) dataRow.push("");
    sheetRows.push(dataRow);
  });

  // Summary Rows (if any)
  if (summaryRows && summaryRows.length > 0) {
    sheetRows.push(new Array(colCount).fill(""));
    summaryRows.forEach((sr) => {
      const padded = [...sr];
      while (padded.length < colCount) padded.push("");
      sheetRows.push(padded);
    });
  }

  // Corporate Footer & Signatures Block
  sheetRows.push(new Array(colCount).fill(""));
  sheetRows.push(new Array(colCount).fill(""));

  const dateRowIdx = sheetRows.length;
  const dateLocationRow = new Array(colCount).fill("");
  const rightColStart = Math.max(colCount - 3, midCol);
  dateLocationRow[rightColStart] = `Hà Nội, ngày ${now.getDate()} tháng ${now.getMonth() + 1} năm ${now.getFullYear()}`;
  sheetRows.push(dateLocationRow);
  merges.push({ s: { r: dateRowIdx, c: rightColStart }, e: { r: dateRowIdx, c: colCount - 1 } });

  const signTitleIdx = sheetRows.length;
  const signTitleRow = new Array(colCount).fill("");
  signTitleRow[0] = signerTitles[0];
  signTitleRow[midCol - 1] = signerTitles[1];
  signTitleRow[rightColStart] = signerTitles[2];
  sheetRows.push(signTitleRow);
  merges.push({ s: { r: signTitleIdx, c: 0 }, e: { r: signTitleIdx, c: Math.max(1, midCol - 2) } });
  merges.push({ s: { r: signTitleIdx, c: midCol - 1 }, e: { r: signTitleIdx, c: rightColStart - 1 } });
  merges.push({ s: { r: signTitleIdx, c: rightColStart }, e: { r: signTitleIdx, c: colCount - 1 } });

  const signHintIdx = sheetRows.length;
  const signHintRow = new Array(colCount).fill("");
  signHintRow[0] = "(Ký, ghi rõ họ tên)";
  signHintRow[midCol - 1] = "(Ký, ghi rõ họ tên)";
  signHintRow[rightColStart] = "(Ký, đóng dấu, ghi rõ họ tên)";
  sheetRows.push(signHintRow);
  merges.push({ s: { r: signHintIdx, c: 0 }, e: { r: signHintIdx, c: Math.max(1, midCol - 2) } });
  merges.push({ s: { r: signHintIdx, c: midCol - 1 }, e: { r: signHintIdx, c: rightColStart - 1 } });
  merges.push({ s: { r: signHintIdx, c: rightColStart }, e: { r: signHintIdx, c: colCount - 1 } });

  // Empty spaces for physical signature
  sheetRows.push(new Array(colCount).fill(""));
  sheetRows.push(new Array(colCount).fill(""));
  sheetRows.push(new Array(colCount).fill(""));

  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet(sheetRows);

  // Apply Merges
  ws["!merges"] = merges;

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

  // Pad colWidths to colCount if needed
  while (colWidths.length < colCount) {
    colWidths.push({ wch: 15 });
  }

  ws["!cols"] = colWidths;

  // Create workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName.slice(0, 31));

  // Write and trigger download
  const stamp = now.toISOString().slice(0, 10);
  const cleanFilename = filename.endsWith(".xlsx") ? filename : `${filename}-${stamp}.xlsx`;
  XLSX.writeFile(wb, cleanFilename);
}
