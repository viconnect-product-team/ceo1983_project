import * as XLSX from "xlsx";

export interface ExcelColumn<T> {
  header: string;
  key: string;
  width?: number;
  value: (row: T, index: number) => string | number | boolean | null | undefined;
}

export interface SecondarySheetOptions {
  sheetName: string;
  title: string;
  subtitle?: string;
  columns: ExcelColumn<any>[];
  data: any[];
  summaryRows?: Array<Array<string | number | null | undefined>>;
}

export interface VoucherTemplateOptions {
  type: "thu" | "chi";
  sheetName?: string;
  sampleVoucher?: {
    code?: string;
    date?: string;
    personName?: string;
    address?: string;
    reason?: string;
    amount?: number;
    attachedDocs?: string;
    debitAccount?: string;
    creditAccount?: string;
  };
}

export interface ExportExcelOptions<T> {
  title: string;
  subtitle?: string;
  filename: string;
  sheetName?: string;
  columns: ExcelColumn<T>[];
  data: T[];
  summaryRows?: Array<Array<string | number | null | undefined>>;
  amountInWords?: string;
  signerTitles?: [string, string, string];
  // Cashbook / Vietnamese accounting standards (Circular 200/2014/TT-BTC & Circular 133/2016/TT-BTC)
  templateType?: "cashbook" | "standard";
  organization?: string;
  address?: string;
  circularCode?: string;
  circularNote?: string;
  fundType?: string;
  currencyUnit?: string;
  bookOpenDateNote?: string;
  pageCountNote?: string;
  secondarySheet?: SecondarySheetOptions;
  voucherSheet?: VoucherTemplateOptions;
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
 * Convert numbers to natural Vietnamese words for accounting cashbooks & receipts
 * e.g. 50000000 -> "Năm mươi triệu đồng chẵn."
 */
export function numberToVietnameseWords(num: number | string | null | undefined): string {
  if (num === undefined || num === null || num === "") return "Không đồng chẵn.";
  const val = typeof num === "number" ? num : parseFloat(String(num).replace(/[^0-9.-]/g, ""));
  if (isNaN(val) || val <= 0) return "Không đồng chẵn.";

  const digits = ["không", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"];
  const units = ["", "nghìn", "triệu", "tỷ", "nghìn tỷ", "triệu tỷ"];

  function readTriple(n: number, full: boolean): string {
    const a = Math.floor(n / 100);
    const b = Math.floor((n % 100) / 10);
    const c = n % 10;
    if (a === 0 && b === 0 && c === 0) return "";
    let res = "";
    if (full || a > 0) {
      res += digits[a] + " trăm ";
      if (b === 0 && c > 0) res += "lẻ ";
    }
    if (b > 1) {
      res += digits[b] + " mươi ";
      if (c === 1) res += "mốt ";
    } else if (b === 1) {
      res += "mười ";
      if (c === 1) res += "một ";
    }
    if (b > 0 && c === 5) {
      res += "lăm ";
    } else if (c > 0 && (b !== 0 || a !== 0 || full)) {
      if (b !== 1 && (b <= 1 || c !== 1)) res += digits[c] + " ";
    } else if (c > 0 && !full && a === 0 && b === 0) {
      res += digits[c] + " ";
    }
    return res;
  }

  let s = Math.round(val).toString();
  const groups: number[] = [];
  while (s.length > 0) {
    groups.unshift(parseInt(s.slice(-3), 10));
    s = s.slice(0, -3);
  }
  let words = "";
  for (let i = 0; i < groups.length; i++) {
    const g = groups[i];
    if (g > 0) {
      const read = readTriple(g, i > 0);
      words += read + (units[groups.length - 1 - i] || "") + " ";
    }
  }
  words = words.trim();
  if (!words) return "Không đồng chẵn.";
  return words.charAt(0).toUpperCase() + words.slice(1) + " đồng chẵn.";
}

/**
 * Builds a printable official receipt/payment voucher worksheet (Mẫu số 01-TT / 02-TT)
 */
function buildVoucherSheet(opts: VoucherTemplateOptions, now: Date): XLSX.WorkSheet {
  const isThu = opts.type === "thu";
  const title = isThu ? "PHIẾU THU" : "PHIẾU CHI";
  const circularCode = "Mẫu số : 01-TT";
  const circularNote = "(Ban hành theo Thông tư số 200/2014/TT-BTC ngày 22/12/2014 của Bộ Tài chính)";

  const sample = opts.sampleVoucher || {};
  const code = sample.code || (isThu ? "PT-01" : "PC-01");
  const dateStr = sample.date || `${now.getDate()} tháng ${now.getMonth() + 1} năm ${now.getFullYear()}`;
  const personName = sample.personName || "Họ và tên người giao dịch";
  const address = sample.address || "Hà Nội";
  const reason = sample.reason || (isThu ? "Thu nộp hội phí / đóng góp quỹ hoạt động" : "Chi công tác / hoạt động sự kiện hiệp hội");
  const amount = Number(sample.amount || 0);
  const words = numberToVietnameseWords(amount);

  const rows: any[][] = [
    ["Đơn vị: CLB DOANH NHÂN CEO 1983 (HANOIBA)", "", "", "", "", circularCode],
    ["Địa chỉ: Tòa nhà HanoiBA, TP. Hà Nội", "", "", "", "", circularNote],
    [""],
    ["", "", title, "", "", `Số: ${code}`],
    ["", "", `Ngày ${dateStr}`, "", "", `Nợ: ${sample.debitAccount || (isThu ? "111" : "642")}`],
    ["", "", "", "", "", `Có: ${sample.creditAccount || (isThu ? "131, 511" : "111")}`],
    [""],
    [isThu ? "Họ và tên người nộp:" : "Họ và tên người nhận:", personName],
    ["Địa chỉ / Đơn vị:", address],
    [isThu ? "Lý do nộp:" : "Lý do chi:", reason],
    ["Số tiền:", formatExcelCurrency(amount) + " VNĐ"],
    ["Bằng chữ:", words],
    ["Kèm theo:", sample.attachedDocs || "01 chứng từ gốc."],
    [""],
    ["", "", "", "", `Hà Nội, ngày ${now.getDate()} tháng ${now.getMonth() + 1} năm ${now.getFullYear()}`],
    ["CHỦ TỊCH / ĐẠI DIỆN", "KẾ TOÁN TRƯỞNG", isThu ? "NGƯỜI NỘP TIỀN" : "NGƯỜI NHẬN TIỀN", "NGƯỜI LẬP BIỂU", "THỦ QUỸ"],
    ["(Ký, đóng dấu)", "(Ký, họ tên)", "(Ký, họ tên)", "(Ký, họ tên)", "(Ký, họ tên)"],
    [""],
    [""],
    [""],
  ];

  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 4 } },
    { s: { r: 0, c: 5 }, e: { r: 0, c: 6 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 4 } },
    { s: { r: 1, c: 5 }, e: { r: 1, c: 6 } },
    { s: { r: 3, c: 2 }, e: { r: 3, c: 4 } },
    { s: { r: 4, c: 2 }, e: { r: 4, c: 4 } },
    { s: { r: 7, c: 1 }, e: { r: 7, c: 5 } },
    { s: { r: 8, c: 1 }, e: { r: 8, c: 5 } },
    { s: { r: 9, c: 1 }, e: { r: 9, c: 5 } },
    { s: { r: 10, c: 1 }, e: { r: 10, c: 5 } },
    { s: { r: 11, c: 1 }, e: { r: 11, c: 5 } },
    { s: { r: 12, c: 1 }, e: { r: 12, c: 5 } },
  ];

  ws["!cols"] = [
    { wch: 22 },
    { wch: 22 },
    { wch: 25 },
    { wch: 20 },
    { wch: 20 },
    { wch: 24 },
  ];

  return ws;
}

/**
 * Generates and downloads a clean, corporate Excel file (.xlsx)
 * compliant with Vietnamese Accounting Standards (Thông tư 200/2014/TT-BTC & Thông tư 133/2016/TT-BTC).
 */
export function exportToExcel<T>({
  title,
  subtitle,
  filename,
  sheetName = "So_Quy",
  columns,
  data,
  summaryRows = [],
  amountInWords,
  signerTitles = ["NGƯỜI GHI SỔ / LẬP BIỂU", "THỦ QUỸ / KẾ TOÁN TRƯỞNG", "CHỦ TỊCH / ĐẠI DIỆN BQT"],
  organization = "CLB DOANH NHÂN CEO 1983 (HANOIBA)",
  address = "Tòa nhà HanoiBA, TP. Hà Nội",
  circularCode = "Mẫu số S07-DN",
  circularNote = "(Ban hành theo Thông tư số 200/2014/TT-BTC ngày 22/12/2014 của Bộ Tài chính)",
  fundType = "Quỹ hoạt động CLB Doanh Nhân CEO 1983",
  currencyUnit = "VNĐ",
  bookOpenDateNote = "- Ngày mở sổ: 01/01/2026",
  pageCountNote = "- Sổ này có ... trang, đánh số từ trang 01 đến trang ...",
  secondarySheet,
  voucherSheet,
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

  // Row 0: Organization info (Left) & Circular code (Right)
  const row0 = new Array(colCount).fill("");
  row0[0] = `Đơn vị: ${organization}`;
  row0[midCol] = circularCode;
  sheetRows.push(row0);
  merges.push({ s: { r: 0, c: 0 }, e: { r: 0, c: midCol - 1 } });
  merges.push({ s: { r: 0, c: midCol }, e: { r: 0, c: colCount - 1 } });

  // Row 1: Address (Left) & Ministry of Finance circular notice (Right)
  const row1 = new Array(colCount).fill("");
  row1[0] = `Địa chỉ: ${address}`;
  row1[midCol] = circularNote;
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

  // Row 4: Fund Type
  const fundRowIdx = sheetRows.length;
  const fundRow = makeRow(`Loại quỹ: ${fundType}`);
  sheetRows.push(fundRow);
  merges.push({ s: { r: fundRowIdx, c: 0 }, e: { r: fundRowIdx, c: colCount - 1 } });

  // Row 5: Subtitle / Timeframe
  const subRowIdx = sheetRows.length;
  const subRowText = subtitle || `Kỳ báo cáo: Năm tài chính ${now.getFullYear()} (Ngày xuất: ${dateStr} lúc ${timeStr})`;
  const subRow = makeRow(subRowText);
  sheetRows.push(subRow);
  merges.push({ s: { r: subRowIdx, c: 0 }, e: { r: subRowIdx, c: colCount - 1 } });

  // Row 6: Currency Unit
  const unitRow = makeRow(`Đơn vị tính: ${currencyUnit}`);
  sheetRows.push(unitRow);

  // Row 7: Blank separator before table
  sheetRows.push(new Array(colCount).fill(""));

  // Row 8: Table Column Headers (STT + Column headers)
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

  // Amount in words row (if present)
  if (amountInWords) {
    const wordsRowIdx = sheetRows.length;
    const wordsRow = makeRow(`Số tiền bằng chữ: ${amountInWords}`);
    sheetRows.push(wordsRow);
    merges.push({ s: { r: wordsRowIdx, c: 0 }, e: { r: wordsRowIdx, c: colCount - 1 } });
  }

  // Blank separator before notes & signatures
  sheetRows.push(new Array(colCount).fill(""));

  // Circular 200 / 133 Standard Notes
  const pageNoteRow = makeRow(pageCountNote);
  sheetRows.push(pageNoteRow);
  const openDateRow = makeRow(bookOpenDateNote);
  sheetRows.push(openDateRow);

  // Corporate Footer & Signatures Block
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

  // Create primary worksheet
  const ws = XLSX.utils.aoa_to_sheet(sheetRows);
  ws["!merges"] = merges;

  // Calculate auto column widths
  const colWidths = [{ wch: 8 }]; // STT column width
  columns.forEach((col) => {
    let maxLen = col.header.length;
    if (col.width) {
      maxLen = Math.max(maxLen, col.width);
    } else {
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

  while (colWidths.length < colCount) {
    colWidths.push({ wch: 15 });
  }
  ws["!cols"] = colWidths;

  // Create workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName.slice(0, 31));

  // Secondary Sheet (e.g. Category Summary)
  if (secondarySheet && secondarySheet.data.length > 0) {
    const sColCount = Math.max(secondarySheet.columns.length + 1, 5);
    const sRows: any[][] = [];
    const sMerges: XLSX.Range[] = [];

    // Header block
    sRows.push([`Đơn vị: ${organization}`, "", "", "", circularCode]);
    sMerges.push({ s: { r: 0, c: 0 }, e: { r: 0, c: sColCount - 2 } });
    sRows.push([secondarySheet.title.toUpperCase()]);
    sMerges.push({ s: { r: 1, c: 0 }, e: { r: 1, c: sColCount - 1 } });
    if (secondarySheet.subtitle) {
      sRows.push([secondarySheet.subtitle]);
      sMerges.push({ s: { r: 2, c: 0 }, e: { r: 2, c: sColCount - 1 } });
    }
    sRows.push([`Đơn vị tính: ${currencyUnit}`]);
    sRows.push(new Array(sColCount).fill(""));

    // Table header
    sRows.push(["STT", ...secondarySheet.columns.map((c) => c.header)]);

    // Data rows
    secondarySheet.data.forEach((row, idx) => {
      const dr = [
        idx + 1,
        ...secondarySheet.columns.map((c) => {
          const v = c.value(row, idx);
          return v === null || v === undefined ? "" : v;
        }),
      ];
      while (dr.length < sColCount) dr.push("");
      sRows.push(dr);
    });

    // Summary
    if (secondarySheet.summaryRows) {
      sRows.push(new Array(sColCount).fill(""));
      secondarySheet.summaryRows.forEach((sr) => {
        const padded = [...sr];
        while (padded.length < sColCount) padded.push("");
        sRows.push(padded);
      });
    }

    const sWs = XLSX.utils.aoa_to_sheet(sRows);
    sWs["!merges"] = sMerges;
    sWs["!cols"] = [{ wch: 8 }, ...secondarySheet.columns.map((c) => ({ wch: c.width || 25 }))];
    XLSX.utils.book_append_sheet(wb, sWs, secondarySheet.sheetName.slice(0, 31));
  }

  // Voucher Template Sheet (Mẫu phiếu thu / chi)
  if (voucherSheet) {
    const vSheetName = voucherSheet.sheetName || (voucherSheet.type === "thu" ? "Phieu_Thu_Mau" : "Phieu_Chi_Mau");
    const vWs = buildVoucherSheet(voucherSheet, now);
    XLSX.utils.book_append_sheet(wb, vWs, vSheetName.slice(0, 31));
  }

  // Write and trigger download
  const stamp = now.toISOString().slice(0, 10);
  const cleanFilename = filename.endsWith(".xlsx") ? filename : `${filename}-${stamp}.xlsx`;
  XLSX.writeFile(wb, cleanFilename);
}
