import * as XLSX from "xlsx";
import JSZip from "jszip";
import { fetchNestApi } from "@/lib/api-client";

export interface ParsedEventData {
  name?: string;
  tagline?: string;
  date?: string; // YYYY-MM-DD
  displayDate?: string; // DD/MM/YYYY
  startTime?: string; // HH:mm
  endTime?: string; // HH:mm
  location?: string;
  capacity?: string;
  type?: "forum" | "workshop" | "networking" | "training" | "charity";
  description?: string;
  speaker?: string;
  speakerTitle?: string;
  speakerCompany?: string;
  tickets?: { name: string; price: string; quantity: string; description: string }[];
  rawTextPreview?: string;
  fileName: string;
}

export interface ParsedTrainingData {
  title?: string;
  tagline?: string;
  instructor_name?: string;
  instructor_title?: string;
  instructor_company?: string;
  date?: string; // YYYY-MM-DD
  start_time?: string; // HH:mm
  end_time?: string; // HH:mm
  location?: string;
  address?: string;
  category?: string;
  format?: "online" | "offline" | "hybrid";
  max_attendees?: number;
  description?: string;
  ticket_tiers?: { name: string; price: number; quantity: number; description?: string }[];
  rawTextPreview?: string;
  fileName: string;
}

/**
 * Trích xuất toàn bộ chuỗi văn bản (plain text) từ File (Excel, Word, PDF, Text)
 */
export async function extractTextFromFile(file: File): Promise<string> {
  const ext = (file.name.split(".").pop() || "").toLowerCase();
  const arrayBuffer = await file.arrayBuffer();

  // 1. Định dạng Excel (.xlsx, .xls, .csv)
  if (["xlsx", "xls", "csv"].includes(ext)) {
    try {
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      const textParts: string[] = [];

      for (const sheetName of workbook.SheetNames) {
        textParts.push(`--- TRANG TÍNH: ${sheetName} ---`);
        const ws = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json<(string | number | boolean | null)[]>(ws, {
          header: 1,
          defval: "",
        });

        for (const row of rows) {
          if (!row || row.length === 0) continue;
          // Kiểm tra xem dòng có phải là dạng key-value không (Cột 0 là nhãn, Cột 1 là giá trị)
          const nonEmpties = row.filter((cell) => cell !== "" && cell !== null && cell !== undefined);
          if (nonEmpties.length >= 2 && String(row[0]).length < 40) {
            textParts.push(`${row[0]}: ${row.slice(1).filter(Boolean).join(" | ")}`);
          } else if (nonEmpties.length > 0) {
            textParts.push(nonEmpties.join(" | "));
          }
        }
      }
      return textParts.join("\n");
    } catch (err) {
      console.warn("[extractTextFromFile] Lỗi đọc Excel bằng XLSX:", err);
    }
  }

  // 2. Định dạng Word (.docx)
  if (ext === "docx") {
    try {
      const zip = await JSZip.loadAsync(arrayBuffer);
      const docXmlFile = zip.file("word/document.xml");
      if (docXmlFile) {
        const xml = await docXmlFile.async("text");
        // Bóc tách theo từng đoạn văn <w:p>
        const paragraphs = xml.match(/<w:p[\s>][\s\S]*?<\/w:p>/g) || [];
        const lines = paragraphs
          .map((p) => {
            const runs = p.match(/<w:t[\s>][\s\S]*?<\/w:t>/g) || [];
            return runs.map((r) => r.replace(/<[^>]+>/g, "")).join("");
          })
          .map((l) => l.trim())
          .filter(Boolean);

        if (lines.length > 0) {
          return lines.join("\n");
        }
      }
    } catch (err) {
      console.warn("[extractTextFromFile] Lỗi đọc Word bằng JSZip:", err);
    }

    // Fallback: Quét UTF-8 text trong buffer
    try {
      const textDecoder = new TextDecoder("utf-8", { fatal: false });
      const raw = textDecoder.decode(arrayBuffer);
      const xmlMatch = raw.match(/<w:document[\s\S]*?<\/w:document>/);
      if (xmlMatch) {
        return xmlMatch[0]
          .replace(/<\/w:p>/g, "\n")
          .replace(/<[^>]+>/g, " ")
          .replace(/[ \t]+/g, " ")
          .trim();
      }
    } catch {}
  }

  // 3. Định dạng PDF (.pdf)
  if (ext === "pdf") {
    // Thử dùng PDF.js từ trình duyệt nếu có hoặc tải worker
    if (typeof window !== "undefined") {
      try {
        if (!(window as any).pdfjsLib) {
          await new Promise<void>((resolve, reject) => {
            const script = document.createElement("script");
            script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
            script.onload = () => resolve();
            script.onerror = () => reject(new Error("Không tải được PDF.js"));
            document.head.appendChild(script);
          });
        }
        const pdfjs = (window as any).pdfjsLib;
        if (pdfjs) {
          pdfjs.GlobalWorkerOptions.workerSrc =
            "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
          const loadingTask = pdfjs.getDocument({ data: new Uint8Array(arrayBuffer) });
          const pdfDoc = await loadingTask.promise;
          const textPages: string[] = [];
          for (let i = 1; i <= pdfDoc.numPages; i++) {
            const page = await pdfDoc.getPage(i);
            const content = await page.getTextContent();
            const pageStr = content.items
              .map((it: any) => it.str || "")
              .join(" ")
              .trim();
            if (pageStr) textPages.push(pageStr);
          }
          if (textPages.length > 0) {
            return textPages.join("\n\n");
          }
        }
      } catch (err) {
        console.warn("[extractTextFromFile] Lỗi đọc PDF qua PDF.js:", err);
      }
    }

    // Fallback: Tìm các luồng text thô trong PDF
    try {
      const textDecoder = new TextDecoder("latin1");
      const rawStr = textDecoder.decode(arrayBuffer);
      const matches: string[] = [];
      const tjRegex = /\(([\s\S]*?)\)\s*Tj/g;
      let m: RegExpExecArray | null;
      while ((m = tjRegex.exec(rawStr)) !== null) {
        if (m[1] && m[1].length > 1) matches.push(m[1]);
      }
      if (matches.length > 0) {
        return matches.join(" ");
      }
    } catch {}
  }

  // 4. Fallback text thuần (.txt, .md, .log, .json)
  const decoder = new TextDecoder("utf-8", { fatal: false });
  return decoder.decode(arrayBuffer);
}

/**
 * Trích xuất ngày tháng theo định dạng YYYY-MM-DD
 */
function extractDate(text: string): { iso: string; display: string } | null {
  // 1. dd/mm/yyyy hoặc dd-mm-yyyy hoặc dd.mm.yyyy
  const m1 = text.match(/(?:ngày\s+)?(\d{1,2})[\/\.-](\d{1,2})[\/\.-](\d{4})/i);
  if (m1) {
    const d = m1[1].padStart(2, "0");
    const m = m1[2].padStart(2, "0");
    const y = m1[3];
    return { iso: `${y}-${m}-${d}`, display: `${d}/${m}/${y}` };
  }

  // 2. ngày dd tháng mm năm yyyy
  const m2 = text.match(/ngày\s+(\d{1,2})\s+tháng\s+(\d{1,2})\s+năm\s+(\d{4})/i);
  if (m2) {
    const d = m2[1].padStart(2, "0");
    const m = m2[2].padStart(2, "0");
    const y = m2[3];
    return { iso: `${y}-${m}-${d}`, display: `${d}/${m}/${y}` };
  }

  // 3. yyyy-mm-dd
  const m3 = text.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (m3) {
    return { iso: `${m3[1]}-${m3[2]}-${m3[3]}`, display: `${m3[3]}/${m3[2]}/${m3[1]}` };
  }

  return null;
}

/**
 * Trích xuất khung giờ (start time - end time)
 */
function extractTimeRange(text: string): { start?: string; end?: string } {
  // Khoảng giờ: 08:30 - 11:30 hoặc 8h30 - 11h30 hoặc 8h đến 11h
  const range = text.match(/(\d{1,2})[h:](\d{2})?\s*(?:-|đến|–|to)\s*(\d{1,2})[h:](\d{2})?/i);
  if (range) {
    const sH = range[1].padStart(2, "0");
    const sM = (range[2] || "00").padStart(2, "0");
    const eH = range[3].padStart(2, "0");
    const eM = (range[4] || "00").padStart(2, "0");
    return { start: `${sH}:${sM}`, end: `${eH}:${eM}` };
  }

  // Giờ đơn
  const single = text.match(/(?:lúc|vào|từ|bắt đầu|thời gian[:\s]+)?(\d{1,2})[h:](\d{2})/i);
  if (single) {
    const sH = single[1].padStart(2, "0");
    const sM = (single[2] || "00").padStart(2, "0");
    return { start: `${sH}:${sM}` };
  }

  return {};
}

/**
 * Thuật toán bóc tách dữ liệu Sự kiện từ văn bản
 */
export function extractEventDataFromText(rawText: string, fileName: string): ParsedEventData {
  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  let name = "";
  let tagline = "";
  let location = "";
  let capacity = "";
  let speaker = "";
  let speakerTitle = "";
  let speakerCompany = "";
  let eventType: ParsedEventData["type"] = "forum";

  // 1. Tìm tên sự kiện
  for (const line of lines) {
    const nameMatch = line.match(
      /^(?:Tên sự kiện|Tên chương trình|Tên gala|Tên hội nghị|Sự kiện|Chương trình|Event Name|Event Title)[:\s]+(.+)$/i
    );
    if (nameMatch) {
      name = nameMatch[1].trim();
      break;
    }
  }

  // Nếu không thấy nhãn rõ ràng, tìm dòng tiêu đề nổi bật trong 5 dòng đầu
  if (!name && lines.length > 0) {
    for (let i = 0; i < Math.min(5, lines.length); i++) {
      const l = lines[i];
      if (
        !l.toLowerCase().includes("kế hoạch") &&
        !l.toLowerCase().includes("thông báo") &&
        !l.toLowerCase().includes("tờ trình") &&
        !l.toLowerCase().includes("cộng hòa xã hội") &&
        !l.toLowerCase().includes("độc lập - tự do") &&
        l.length >= 8 &&
        l.length <= 130
      ) {
        name = l.replace(/^#+\s*/, "").replace(/^[-•*]\s*/, "").trim();
        break;
      }
    }
  }
  if (!name && lines.length > 0) {
    name = lines[0].replace(/^#+\s*/, "").trim();
  }

  // 2. Tìm khẩu hiệu / chủ đề (Tagline)
  for (const line of lines) {
    const tagMatch = line.match(
      /^(?:Chủ đề|Khẩu hiệu|Thông điệp|Tagline|Slogan|Theme)[:\s]+(.+)$/i
    );
    if (tagMatch) {
      tagline = tagMatch[1].trim();
      break;
    }
  }

  // 3. Tìm ngày tháng
  const dateInfo = extractDate(rawText);

  // 4. Tìm khung giờ
  const times = extractTimeRange(rawText);

  // 5. Tìm địa điểm tổ chức
  for (const line of lines) {
    const locMatch = line.match(
      /^(?:Địa điểm|Nơi tổ chức|Địa chỉ|Tại|Địa điểm tổ chức|Location|Venue|Address)[:\s]+(.+)$/i
    );
    if (locMatch) {
      location = locMatch[1].trim();
      break;
    }
  }
  if (!location) {
    // Tìm dòng chứa các từ khóa địa điểm quen thuộc
    for (const line of lines) {
      if (
        /(?:khách sạn|trung tâm hội nghị|tòa nhà|hội trường|tầng\s+\d+|phòng\s+\d+|đường\s+|phố\s+|quận\s+|hà nội|tp\.hcm|đà nẵng|daewoo|pan pacific|national convention)/i.test(
          line
        ) &&
        line.length <= 130
      ) {
        location = line.replace(/^[-•*]\s*/, "").trim();
        break;
      }
    }
  }

  // 6. Tìm sức chứa / số lượng người tham dự
  const capMatch =
    rawText.match(
      /(?:Quy mô(?:\s+tham dự)?|Số lượng(?:\s+đại biểu|\s+khách|\s+người)?|Sức chứa|Capacity)[:\s]+(\d+)/i
    ) || rawText.match(/(\d+)\s*(?:đại biểu|khách mời|chỗ ngồi|người tham gia|người)/i);
  if (capMatch) {
    capacity = capMatch[1];
  }

  // 7. Tìm Diễn giả / Khách mời đặc biệt
  for (const line of lines) {
    const spkMatch = line.match(
      /^(?:Diễn giả(?:\s+khách mời)?|Diễn giả chính|Khách mời danh dự|Báo cáo viên|Người chia sẻ|Keynote Speaker|Speaker)[:\s]+(.+)$/i
    );
    if (spkMatch) {
      const raw = spkMatch[1].trim();
      const parts = raw.split(/[-–|]/).map((p) => p.trim());
      speaker = parts[0];
      if (parts[1]) {
        if (
          /chủ tịch|giám đốc|trưởng ban|viện trưởng|chuyên gia|thạc sĩ|tiến sĩ|ts|ths|pgs|gs|coach/i.test(
            parts[1]
          )
        ) {
          speakerTitle = parts[1];
        } else {
          speakerCompany = parts[1];
        }
      }
      if (parts[2]) {
        speakerCompany = parts[2];
      }
      break;
    }
  }

  // 8. Nhận diện loại sự kiện (Forum, Workshop, Networking, Training, Charity)
  const lowerAll = rawText.toLowerCase();
  if (lowerAll.includes("thiện nguyện") || lowerAll.includes("từ thiện") || lowerAll.includes("quyên góp")) {
    eventType = "charity";
  } else if (lowerAll.includes("đào tạo") || lowerAll.includes("khóa học") || lowerAll.includes("tập huấn")) {
    eventType = "training";
  } else if (lowerAll.includes("networking") || lowerAll.includes("kết nối giao thương") || lowerAll.includes("b2b")) {
    eventType = "networking";
  } else if (lowerAll.includes("workshop") || lowerAll.includes("tọa đàm") || lowerAll.includes("hội thảo")) {
    eventType = "workshop";
  } else {
    eventType = "forum";
  }

  // 9. Bóc tách mô tả / lịch trình chi tiết (Agenda)
  const descLines: string[] = [];
  let recordingDesc = false;

  for (const line of lines) {
    if (
      /^(?:Nội dung|Mô tả|Lịch trình|Chương trình chi tiết|Agenda|Timeline|Nội dung chương trình)[:\s]*/i.test(
        line
      )
    ) {
      recordingDesc = true;
      descLines.push(line);
      continue;
    }
    if (recordingDesc) {
      if (/^(?:Vé tham dự|Hạng vé|Chi phí|Quy định|Liên hệ|Ban tổ chức)[:\s]*/i.test(line)) {
        recordingDesc = false;
      } else {
        descLines.push(line);
      }
    }
  }

  let description = descLines.join("\n");
  if (!description) {
    // Lấy tối đa 10 dòng đầu làm mô tả tổng quan
    description = lines.slice(0, 10).join("\n");
  }

  // Nếu có thông tin diễn giả, tự động ghép vào đầu phần mô tả một cách trang trọng
  if (speaker) {
    const speakerBanner = `🎙️ DIỄN GIẢ / KHÁCH MỜI: ${speaker}${speakerTitle ? ` (${speakerTitle})` : ""}${speakerCompany ? ` - ${speakerCompany}` : ""}`;
    if (!description.includes(speaker)) {
      description = `${speakerBanner}\n\n${description}`;
    }
  }

  // 10. Tìm các hạng vé tham dự (nếu có)
  const tickets: { name: string; price: string; quantity: string; description: string }[] = [];
  const ticketMatches = rawText.match(
    /(?:vé|hạng vé)\s+([^:\n]+)[:\s]+(\d+(?:[.,]\d+)*)\s*(?:đ|vnd|đồng)/gi
  );
  if (ticketMatches) {
    for (const tm of ticketMatches) {
      const parts = tm.split(/[:\s]+(?=\d)/);
      if (parts.length >= 2) {
        const rawPrice = parts[1].replace(/[^\d]/g, "");
        tickets.push({
          name: parts[0].trim(),
          price: rawPrice,
          quantity: "50",
          description: "Đã bóc tách tự động từ tài liệu đính kèm",
        });
      }
    }
  }

  return {
    name,
    tagline,
    date: dateInfo?.iso,
    displayDate: dateInfo?.display,
    startTime: times.start || "08:30",
    endTime: times.end || "11:30",
    location,
    capacity: capacity || "100",
    type: eventType,
    description,
    speaker,
    speakerTitle,
    speakerCompany,
    tickets: tickets.length > 0 ? tickets : undefined,
    rawTextPreview: rawText.slice(0, 600),
    fileName,
  };
}

/**
 * Thuật toán bóc tách dữ liệu Khóa Đào Tạo từ văn bản
 */
export function extractTrainingDataFromText(rawText: string, fileName: string): ParsedTrainingData {
  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  let title = "";
  let tagline = "";
  let instructorName = "";
  let instructorTitle = "";
  let instructorCompany = "";
  let location = "";
  let address = "";
  let category = "Quản trị doanh nghiệp";
  let format: "online" | "offline" | "hybrid" = "offline";
  let maxAttendees = 50;

  // 1. Tìm tiêu đề khóa đào tạo
  for (const line of lines) {
    const titleMatch = line.match(
      /^(?:Tên khóa học|Tên khóa đào tạo|Khóa học|Khóa đào tạo|Chương trình đào tạo|Chủ đề đào tạo|Course Title|Training)[:\s]+(.+)$/i
    );
    if (titleMatch) {
      title = titleMatch[1].trim();
      break;
    }
  }
  if (!title && lines.length > 0) {
    for (let i = 0; i < Math.min(5, lines.length); i++) {
      const l = lines[i];
      if (
        !l.toLowerCase().includes("thông báo chiêu sinh") &&
        !l.toLowerCase().includes("kế hoạch đào tạo") &&
        !l.toLowerCase().includes("giáo trình") &&
        l.length >= 8 &&
        l.length <= 130
      ) {
        title = l.replace(/^#+\s*/, "").replace(/^[-•*]\s*/, "").trim();
        break;
      }
    }
  }
  if (!title && lines.length > 0) {
    title = lines[0].replace(/^#+\s*/, "").trim();
  }

  // 2. Tìm khẩu hiệu / chủ đề phụ (Tagline)
  for (const line of lines) {
    const tagMatch = line.match(
      /^(?:Chủ đề|Khẩu hiệu|Thông điệp|Mục tiêu cốt lõi|Tagline)[:\s]+(.+)$/i
    );
    if (tagMatch) {
      tagline = tagMatch[1].trim();
      break;
    }
  }

  // 3. Tìm thông tin Giảng viên / Diễn giả / Chuyên gia
  for (const line of lines) {
    const instMatch = line.match(
      /^(?:Giảng viên|Diễn giả|Chuyên gia|Người hướng dẫn|Báo cáo viên|Trainer|Instructor)[:\s]+(.+)$/i
    );
    if (instMatch) {
      const raw = instMatch[1].trim();
      const parts = raw.split(/[-–|]/).map((p) => p.trim());
      instructorName = parts[0];
      if (parts[1]) {
        if (
          /tiến sĩ|thạc sĩ|ts|ths|chuyên gia|giám đốc|chủ tịch|viện trưởng|trưởng ban|coach/i.test(
            parts[1]
          )
        ) {
          instructorTitle = parts[1];
        } else {
          instructorCompany = parts[1];
        }
      }
      if (parts[2]) {
        instructorCompany = parts[2];
      }
      break;
    }
  }

  // 4. Tìm ngày tháng
  const dateInfo = extractDate(rawText);

  // 5. Tìm khung giờ
  const times = extractTimeRange(rawText);

  // 6. Địa điểm học
  for (const line of lines) {
    const locMatch = line.match(
      /^(?:Địa điểm|Địa chỉ|Nơi học|Phòng học|Location|Venue|Address)[:\s]+(.+)$/i
    );
    if (locMatch) {
      location = locMatch[1].trim();
      address = locMatch[1].trim();
      break;
    }
  }
  if (!location) {
    for (const line of lines) {
      if (
        /(?:phòng hội thảo|tòa nhà|tầng\s+\d+|hội trường|khách sạn|ceo tower|hà nội|tp\.hcm)/i.test(
          line
        ) &&
        line.length <= 130
      ) {
        location = line.replace(/^[-•*]\s*/, "").trim();
        address = location;
        break;
      }
    }
  }

  // 7. Hình thức (Online / Offline / Hybrid)
  const lowerAll = rawText.toLowerCase();
  if (lowerAll.includes("hybrid") || lowerAll.includes("kết hợp")) {
    format = "hybrid";
  } else if (
    lowerAll.includes("zoom") ||
    lowerAll.includes("google meet") ||
    lowerAll.includes("trực tuyến") ||
    lowerAll.includes("online")
  ) {
    format = "online";
  } else {
    format = "offline";
  }

  // 8. Chuyên mục đào tạo
  if (lowerAll.includes("tài chính") || lowerAll.includes("thuế") || lowerAll.includes("kế toán")) {
    category = "Tài chính & Kế toán";
  } else if (lowerAll.includes("marketing") || lowerAll.includes("bán hàng") || lowerAll.includes("sales")) {
    category = "Marketing & Sales";
  } else if (lowerAll.includes("lãnh đạo") || lowerAll.includes("nhân sự") || lowerAll.includes("quản trị")) {
    category = "Quản trị & Lãnh đạo";
  } else if (lowerAll.includes("pháp lý") || lowerAll.includes("luật") || lowerAll.includes("hợp đồng")) {
    category = "Pháp lý doanh nghiệp";
  } else if (lowerAll.includes("chuyển đổi số") || lowerAll.includes("ai") || lowerAll.includes("công nghệ")) {
    category = "Công nghệ & Chuyển đổi số";
  }

  // 9. Sức chứa học viên
  const capMatch =
    rawText.match(
      /(?:Số lượng học viên|Sức chứa|Quy mô lớp học|Số lượng|Capacity)[:\s]+(\d+)/i
    ) || rawText.match(/(\d+)\s*(?:học viên|chỗ|người tham gia|người)/i);
  if (capMatch) {
    maxAttendees = parseInt(capMatch[1], 10) || 50;
  }

  // 10. Đề cương / Mô tả khóa học
  const descLines: string[] = [];
  let recordingDesc = false;

  for (const line of lines) {
    if (
      /^(?:Nội dung|Đề cương|Mục tiêu khóa học|Giáo trình|Chi tiết chương trình|Mô tả)[:\s]*/i.test(
        line
      )
    ) {
      recordingDesc = true;
      descLines.push(line);
      continue;
    }
    if (recordingDesc) {
      if (/^(?:Học phí|Hạng vé|Quyền lợi|Đăng ký|Liên hệ)[:\s]*/i.test(line)) {
        recordingDesc = false;
      } else {
        descLines.push(line);
      }
    }
  }

  let description = descLines.join("\n");
  if (!description) {
    description = lines.slice(0, 10).join("\n");
  }

  // 11. Học phí
  const ticketTiers: { name: string; price: number; quantity: number; description?: string }[] = [];
  const feeMatch = rawText.match(/(?:học phí|giá vé|chi phí)[:\s]+(\d+(?:[.,]\d+)*)\s*(?:đ|vnd|đồng)/i);
  if (feeMatch) {
    const rawPrice = parseInt(feeMatch[1].replace(/[^\d]/g, ""), 10) || 0;
    ticketTiers.push({
      name: "Học phí tiêu chuẩn",
      price: rawPrice,
      quantity: maxAttendees,
      description: "Bóc tách tự động từ thông báo chiêu sinh",
    });
  }

  return {
    title,
    tagline,
    instructor_name: instructorName,
    instructor_title: instructorTitle,
    instructor_company: instructorCompany,
    date: dateInfo?.iso,
    start_time: times.start || "08:30",
    end_time: times.end || "11:30",
    location,
    address,
    category,
    format,
    max_attendees: maxAttendees,
    description,
    ticket_tiers: ticketTiers.length > 0 ? ticketTiers : undefined,
    rawTextPreview: rawText.slice(0, 600),
    fileName,
  };
}

/**
 * Xử lý toàn diện tệp tải lên cho Sự kiện (Event):
 * 1. Đọc văn bản từ tệp.
 * 2. Gọi backend parse API nếu có, đồng thời chạy fallback parser bóc tách chuẩn xác.
 */
export async function parseEventDocument(file: File): Promise<ParsedEventData> {
  // Thử gọi backend trước nếu mạng sẵn sàng
  try {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetchNestApi<any>("/events/parse-document", {
      method: "POST",
      body: formData,
    });
    if (res && res.name) {
      return {
        ...res,
        fileName: file.name,
      };
    }
  } catch (err) {
    console.info("[parseEventDocument] Chạy parser trực tiếp trên Client:", err);
  }

  // Bóc tách trực tiếp trên Client
  const text = await extractTextFromFile(file);
  return extractEventDataFromText(text, file.name);
}

/**
 * Xử lý toàn diện tệp tải lên cho Khóa Đào Tạo (Training):
 * 1. Đọc văn bản từ tệp.
 * 2. Gọi backend parse API nếu có, đồng thời chạy fallback parser bóc tách chuẩn xác.
 */
export async function parseTrainingDocument(file: File): Promise<ParsedTrainingData> {
  // Thử gọi backend trước nếu mạng sẵn sàng
  try {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetchNestApi<any>("/trainings/parse-document", {
      method: "POST",
      body: formData,
    });
    if (res && res.title) {
      return {
        ...res,
        fileName: file.name,
      };
    }
  } catch (err) {
    console.info("[parseTrainingDocument] Chạy parser trực tiếp trên Client:", err);
  }

  // Bóc tách trực tiếp trên Client
  const text = await extractTextFromFile(file);
  return extractTrainingDataFromText(text, file.name);
}

export interface AiFileActionOption {
  id: string;
  label: string;
  actionType: string;
  description: string;
  iconName?: "calendar" | "graduation-cap" | "users" | "wallet" | "folder" | "file-text" | "sparkles";
  badge?: string;
  payload?: any;
}

export interface AiFileClarificationData {
  fileName: string;
  fileSizeFormatted: string;
  fileType: string;
  totalLines: number;
  previewText: string;
  summary: string;
  clarificationQuestion: string;
  options: AiFileActionOption[];
  extractedEntities: {
    dates?: string[];
    times?: string[];
    locations?: string[];
    people?: string[];
    moneyAmounts?: string[];
  };
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Phân tích tệp nhập vào dành cho Trợ lý AI (CRM AI & Mobile AI):
 * - Đọc nội dung đa định dạng (Excel, Word, PDF, Text).
 * - Nhận diện cấu trúc thực thể (ngày giờ, địa điểm, diễn giả, số tiền, hội viên).
 * - Tự động đề xuất các hành động và câu hỏi ngược để người dùng lựa chọn.
 */
export async function analyzeImportedFileForAi(file: File): Promise<AiFileClarificationData> {
  const ext = (file.name.split(".").pop() || "").toLowerCase();
  const text = await extractTextFromFile(file);
  const lines = text.split("\n").filter((l) => l.trim().length > 0);
  const lowerText = text.toLowerCase();

  // Bóc tách thực thể
  const extractedDates = Array.from(new Set(text.match(/(?:ngày\s+)?\d{1,2}[\/\.-]\d{1,2}[\/\.-]\d{4}/gi) || [])).slice(0, 3);
  const extractedTimes = Array.from(new Set(text.match(/\b\d{1,2}[:h]\d{2}\b/gi) || [])).slice(0, 3);
  const extractedMoney = Array.from(new Set(text.match(/\b\d{1,3}(?:\.\d{3})+(?:\s*(?:vnđ|vnd|đ|triệu|tỷ))\b/gi) || [])).slice(0, 3);

  // Nhận diện kiểu tài liệu
  const isEvent = /sự kiện|event|gala|hội nghị|diễn đàn|networking|sinh nhật|workshop|hội thảo/i.test(lowerText);
  const isTraining = /đào tạo|chiêu sinh|khóa học|giảng viên|chuyên gia|học viên|lớp học|training/i.test(lowerText);
  const isMember = /danh sách|hội viên|doanh nhân|giám đốc|chức vụ|email|điện thoại|công ty|sđt|mst/i.test(lowerText);
  const isFinance = /thu chi|hội phí|ngân sách|chi phí|dự toán|phiếu thu|hóa đơn|quỹ|tiền|thanh toán/i.test(lowerText);
  const isMeeting = /biên bản|cuộc họp|nhiệm vụ|phân công|tiến độ|deadline|kết luận/i.test(lowerText);

  // Sinh tóm tắt trực quan
  let summary = `Tệp chứa ${lines.length} dòng dữ liệu, định dạng .${ext.toUpperCase()}.`;
  if (isEvent && extractedDates.length > 0) {
    summary += ` Phát hiện kế hoạch sự kiện diễn ra ngày ${extractedDates[0]}${extractedTimes.length ? ` lúc ${extractedTimes[0]}` : ""}.`;
  } else if (isTraining) {
    summary += ` Phát hiện thông tin chuyên đề đào tạo/chiêu sinh cho hội viên.`;
  } else if (isMember) {
    summary += ` Phát hiện danh sách hội viên/doanh nghiệp với các trường liên hệ.`;
  } else if (isFinance && extractedMoney.length > 0) {
    summary += ` Phát hiện dự toán/khoản thu chi với các số tiền: ${extractedMoney.join(", ")}.`;
  } else if (isMeeting) {
    summary += ` Phát hiện biên bản làm việc & phân công công việc.`;
  }

  // Tạo danh sách Options hỏi ngược lại
  const options: AiFileActionOption[] = [];

  if (isEvent || (!isTraining && !isMember && !isFinance)) {
    options.push({
      id: "opt_create_event",
      label: "Tạo Sự Kiện Mới & Tự Động Điền Lịch Trình",
      actionType: "CREATE_EVENT",
      description: "Tạo sự kiện trên hệ thống, bóc tách diễn giả, địa điểm và các hạng vé.",
      iconName: "calendar",
      badge: "Sự kiện",
    });
  }

  if (isTraining || isEvent) {
    options.push({
      id: "opt_create_training",
      label: "Khởi Tạo Chương Trình Đào Tạo Mới",
      actionType: "CREATE_TRAINING",
      description: "Mở lớp chiêu sinh, bóc tách thông tin giảng viên và đề cương bài giảng.",
      iconName: "graduation-cap",
      badge: "Đào tạo",
    });
  }

  if (isMember) {
    options.push({
      id: "opt_import_members",
      label: "Nhập Danh Sách Hội Viên Vào CSDL CRM",
      actionType: "IMPORT_MEMBERS",
      description: "Đồng bộ danh sách hội viên vào database 113.20.107.184:6432.",
      iconName: "users",
      badge: "Hội viên",
    });
  }

  if (isFinance || isEvent) {
    options.push({
      id: "opt_record_finance",
      label: "Ghi Nhận Dự Toán / Thu Chi Tài Chính",
      actionType: "RECORD_FINANCE",
      description: "Tạo phiếu thu/chi hoặc ghi nhận vào sổ quỹ tài chính theo TT 200.",
      iconName: "wallet",
      badge: "Tài chính",
    });
  }

  options.push({
    id: "opt_archive_document",
    label: "Lưu Trữ Vào Kho Tài Liệu Ban Chuyên Môn",
    actionType: "ARCHIVE_DOCUMENT",
    description: "Phân loại và lưu trữ vào thư mục Ban tương ứng (FLD-DEPT-*).",
    iconName: "folder",
    badge: "Tài liệu",
  });

  options.push({
    id: "opt_extract_tasks",
    label: "Bóc Tách Nhiệm Vụ & Phân Công Cho Các Ban",
    actionType: "EXTRACT_TASKS",
    description: "Trích xuất danh sách đầu việc, người phụ trách và deadline bàn giao.",
    iconName: "file-text",
    badge: "Nhiệm vụ",
  });

  return {
    fileName: file.name,
    fileSizeFormatted: formatFileSize(file.size),
    fileType: ext.toUpperCase(),
    totalLines: lines.length,
    previewText: lines.slice(0, 10).join("\n"),
    summary,
    clarificationQuestion: `Tôi đã phân tích tệp "${file.name}". Anh/Chị muốn tôi thực hiện thao tác gì với tệp này trên hệ thống? Vui lòng bấm chọn một yêu cầu bên dưới hoặc nhập chỉ đạo riêng:`,
    options,
    extractedEntities: {
      dates: extractedDates,
      times: extractedTimes,
      moneyAmounts: extractedMoney,
    },
  };
}
