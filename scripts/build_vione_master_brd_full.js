const fs = require('fs');
const path = require('path');
const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  TableOfContents,
  WidthType,
  BorderStyle,
  AlignmentType,
  ShadingType,
  Header,
  Footer,
  PageNumber,
} = require('docx');

const ROOT_DIR = path.resolve(__dirname, '..');
const VIONE_DOC_DIR = path.join(ROOT_DIR, '..', 'vione_project', 'document');
const CEO_DOC_DIR = path.join(ROOT_DIR, 'document');

const FE_DOCS_DIRS = [
  path.join(ROOT_DIR, '..', 'vione_project', 'apps', 'vione_app_fe', 'public', 'docs'),
  path.join(ROOT_DIR, 'apps', 'ceo1983_app_fe', 'public', 'docs'),
  path.join(ROOT_DIR, 'apps', 'vione_app_fe', 'public', 'docs'),
  VIONE_DOC_DIR,
  CEO_DOC_DIR
];

FE_DOCS_DIRS.forEach(d => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

const FONT_FAMILY = 'Times New Roman';
const COLOR_GOLD = 'D97706';
const COLOR_NAVY = '0F172A';
const COLOR_AMBER = 'B45309';
const COLOR_DARK = '1E293B';
const COLOR_BORDER = 'CBD5E1';
const COLOR_BG_HEADER = '0F172A';
const COLOR_BG_ALT = 'F8FAFC';
const TABLE_WIDTH_DXA = 9200;

const BORDER_STYLE_THIN = {
  top: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
  bottom: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
  left: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
  right: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
};

function createParagraph(text, opts = {}) {
  const lines = String(text || '').split('\n');
  const children = [];
  lines.forEach((line, idx) => {
    children.push(
      new TextRun({
        text: line,
        break: idx > 0 ? 1 : 0,
        font: FONT_FAMILY,
        size: opts.size || 24, // 12pt
        bold: opts.bold || false,
        italics: opts.italics || false,
        color: opts.color || COLOR_DARK,
      })
    );
  });
  return new Paragraph({
    alignment: opts.alignment || AlignmentType.LEFT,
    spacing: opts.spacing || { before: 80, after: 80, line: 276 },
    children,
  });
}

function createHeading1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 140 },
    children: [
      new TextRun({
        text,
        font: FONT_FAMILY,
        size: 32,
        bold: true,
        color: COLOR_NAVY,
      }),
    ],
  });
}

function createHeading2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 260, after: 100 },
    children: [
      new TextRun({
        text,
        font: FONT_FAMILY,
        size: 28,
        bold: true,
        color: COLOR_AMBER,
      }),
    ],
  });
}

function createHeading3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 200, after: 80 },
    children: [
      new TextRun({
        text,
        font: FONT_FAMILY,
        size: 25,
        bold: true,
        color: COLOR_GOLD,
      }),
    ],
  });
}

function createBullet(text) {
  return new Paragraph({
    bullet: { level: 0 },
    spacing: { before: 40, after: 40, line: 260 },
    children: [
      new TextRun({
        text,
        font: FONT_FAMILY,
        size: 23,
        color: COLOR_DARK,
      }),
    ],
  });
}

function createTable(headers, rows, colWidths = []) {
  let finalColWidths = colWidths;
  if (!finalColWidths || finalColWidths.length === 0) {
    const colCount = headers.length;
    const avgWidth = Math.floor(TABLE_WIDTH_DXA / colCount);
    finalColWidths = Array(colCount).fill(avgWidth);
  }

  const tableRows = [];

  // Header Row
  const headerCells = headers.map((h, idx) => {
    return new TableCell({
      width: { size: finalColWidths[idx], type: WidthType.DXA },
      shading: { fill: COLOR_BG_HEADER, type: ShadingType.CLEAR },
      borders: BORDER_STYLE_THIN,
      margins: { top: 120, bottom: 120, left: 140, right: 140 },
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              text: h,
              font: FONT_FAMILY,
              size: 22,
              bold: true,
              color: 'FFFFFF',
            }),
          ],
        }),
      ],
    });
  });
  tableRows.push(new TableRow({ children: headerCells, tableHeader: true }));

  // Data Rows
  rows.forEach((row, rIdx) => {
    const isAlt = rIdx % 2 === 1;
    const cells = row.map((cellText, cIdx) => {
      const isBold = cIdx === 0 && headers.length > 2;
      return new TableCell({
        width: { size: finalColWidths[cIdx], type: WidthType.DXA },
        shading: { fill: isAlt ? COLOR_BG_ALT : 'FFFFFF', type: ShadingType.CLEAR },
        borders: BORDER_STYLE_THIN,
        margins: { top: 100, bottom: 100, left: 140, right: 140 },
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: String(cellText || ''),
                font: FONT_FAMILY,
                size: 21,
                bold: isBold,
                color: COLOR_DARK,
              }),
            ],
          }),
        ],
      });
    });
    tableRows.push(new TableRow({ children: cells }));
  });

  return new Table({
    width: { size: TABLE_WIDTH_DXA, type: WidthType.DXA },
    columnWidths: finalColWidths,
    rows: tableRows,
  });
}

function generateBrdMarkdown() {
  return `# TÀI LIỆU YÊU CẦU NGHIỆP VỤ DOANH NGHIỆP (BRD MASTER)
## HỆ ĐIỀU HÀNH DOANH NGHIỆP TOÀN DIỆN & CRM HỢP NHẤT VIONE PLATFORM 5.0

---

### THÔNG TIN TÀI LIỆU (DOCUMENT CONTROL)
* **Đơn vị ban hành:** Ban Công Nghệ & Chuyển Đổi Số — VioConnect Corporation
* **Mã tài liệu:** \`BRD-VIONE-ENTERPRISE-MASTER-V5.0\`
* **Phiên bản:** \`5.0 Master Release\`
* **Ngày phát hành:** 02/10/2026
* **Cấp độ bảo mật:** TÀI LIỆU BẢO MẬT NỘI BỘ (CONFIDENTIAL)

---

## MỤC LỤC TỔNG QUAN

1. **Bối Cảnh Dự Án & Tầm Nhìn Chiến Lược**
2. **Mục Tiêu Kinh Doanh & Chỉ Số Đánh Giá Thành Công (KPIs)**
3. **Phân Tích Các Bên Liên Quan (Stakeholder Analysis)**
4. **Mô Hình Nghiệp Vụ Hiện Tại (As-Is) vs Mục Tiêu (To-Be)**
5. **Yêu Cầu Nghiệp Vụ Chi Tiết 4 Phân Hệ Cốt Lõi + AI Copilot + Mobile App**
6. **Ma Trận Phân Định Trách Nhiệm RACI & Luồng Dữ Liệu**
7. **Yêu Cầu Phi Chức Năng (NFR) & Bảo Mật Chuẩn Doanh Nghiệp**
8. **Kế Hoạch Phân Kỳ Triển Khai & Quản Trị Rủi Ro**

---

## 1. BỐI CẢNH DỰ ÁN & TẦM NHÌN CHIẾN LƯỢC

### 1.1. Bối cảnh thị trường
Trong kỷ nguyên kinh tế số 2026, các doanh nghiệp vừa và lớn tại Việt Nam đối mặt với 3 bài toán nan giải:
1. **Dữ liệu phân mảnh:** Sử dụng nhiều phần mềm rời rạc (phần mềm kế toán riêng, CRM riêng, quản lý dự án riêng), dẫn đến dữ liệu không đồng nhất và báo cáo chậm trễ.
2. **Chi phí vận hành cao:** Quy trình xử lý giấy tờ và liên lạc thủ công gây lãng phí ít nhất 30-40% nguồn lực lao động hành chính.
3. **Thiếu công cụ kết nối giao thương:** Doanh nghiệp gặp khó khăn trong việc tìm kiếm đối tác B2B đáng tin cậy và mở rộng thị trường.

### 1.2. Sứ mệnh của ViOne Platform 5.0
ViOne Platform 5.0 ra đời với sứ mệnh trở thành "Hệ Điều Hành Hợp Nhất" cho doanh nghiệp, tích hợp liền mạch giữa:
* **Hệ thống Quản trị Doanh nghiệp (CRM, Work, Finance, HRM)**
* **Mạng xã hội Giao thương B2B & Danh thiếp số Titanium NFC**
* **Trợ lý Trí tuệ Nhân tạo ViOne AI Copilot 5.0**

---

## 2. MỤC TIÊU KINH DOANH & CHỈ SỐ ĐO LƯỜNG (KPIs)

| Chỉ Số Đo Lường (KPI) | Mục Tiêu Cam Kết (Target) | Phương Pháp Đánh Giá |
|---|---|---|
| **Giảm chi phí vận hành** | Giảm tối thiểu **35% - 40%** | So sánh chi phí hành chính và nhân sự trước và sau 6 tháng triển khai |
| **Tăng tốc độ xử lý tác vụ** | Nhanh hơn gấp **5 đến 10 lần** | Đo lường thời gian từ lúc phát sinh Lead đến khi hoàn tất báo giá |
| **Độ chính xác dữ liệu tài chính** | Đạt **99.9%** không sai sót | Tự động đối soát công nợ qua VietQR Napas 24/7 |
| **Tỷ lệ chuyển đổi giao thương** | Tăng trưởng **25%** giá trị hợp đồng B2B | Thống kê số lượng thương vụ ký kết thành công trên sàn B2B |

---

## 3. PHÂN TÍCH CÁC BÊN LIÊN QUAN (STAKEHOLDERS)

* **Ban Giám Đốc (C-Level):** Quan tâm đến bảng điều hành tổng thể (Executive Dashboard), dòng tiền thực thu và dự báo xu hướng qua AI.
* **Bộ Phận Kinh Doanh & Tiếp Thị:** Cần công cụ quản lý phễu Lead 360°, tạo báo giá tự động và danh thiếp số NFC chuyên nghiệp.
* **Bộ Phận Tài Chính - Kế Toán:** Cần sổ quỹ minh bạch, duyệt chi đa cấp và cổng đối soát tự động VietQR.
* **Bộ Phận Nhân Sự (HR):** Cần quản lý chấm công số, hồ sơ nhân viên điện tử và tính KPI tự động qua AI.
* **Đối Tác & Khách Hàng:** Yêu cầu trải nghiệm dịch vụ số hóa 1-chạm, bảo mật thông tin và giao dịch nhanh chóng.

---

## 4. YÊU CẦU NGHIỆP VỤ 4 PHÂN HỆ CỐT LÕI

### 4.1. Phân hệ CRM & Phễu Chuyển Đổi Lead 360°
* Tiếp nhận và phân loại tự động khách hàng tiềm năng từ đa nguồn.
* Theo dõi hành trình khách hàng qua đường ống bán hàng trực quan Kanban.
* Quản lý hợp đồng thương mại, thời hạn bảo hành và lịch sử chăm sóc.

### 4.2. Phân hệ Vione Work — Quản Lý Dự Án & Công Việc
* Bảng Kanban điều phối nhiệm vụ, gán người phụ trách và hạn chót.
* Cảnh báo nguy cơ chậm tiến độ bằng AI và đề xuất phân bổ nhân sự.

### 4.3. Phân hệ Vione Finance — Dòng Tiền & Báo Cáo P&L
* Sổ quỹ thu chi đa cấp, quy trình duyệt chi 3 cấp không giấy tờ.
* Tích hợp VietQR Napas 24/7 tự động gạch nợ sau 1 giây.

### 4.4. Phân hệ Vione HRM — Chấm Công Số & KPI AI
* Chấm công thông minh kết hợp định vị địa lý GPS và Wifi bảo mật.
* Bảng tính lương tự động liên kết dữ liệu công và phụ cấp.
* Đánh giá KPI đa chiều 360 độ khách quan hỗ trợ bởi thuật toán AI.

### 4.5. Trí Tuệ Nhân Tạo ViOne AI Copilot 5.0
* Hỏi đáp số liệu tài chính, khách hàng và tồn kho trực tiếp từ cơ sở dữ liệu PostgreSQL.
* Tự động hóa quy trình đa kênh (No-code AI Workflow Engine).

### 4.6. Ứng Dụng Di Động ViOne Connect & Danh Thiếp Số Titanium NFC
* Chạm thẻ NFC 1 giây truyền tải Portfolio doanh nhân.
* Mạng xã hội B2B, Chat mã hóa End-to-End và Radar tìm kiếm đối tác gần bạn.
`;
}

async function buildDocxFile(outputPath) {
  console.log(`>>> Bắt đầu biên dịch file Word DOCX BRD ViOne: ${outputPath}...`);

  // SECTION 1: TRANG BÌA CHUẨN WORD (FORMAL COVER PAGE)
  const coverChildren = [
    new Paragraph({ spacing: { before: 400, after: 100 } }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: 'TẬP ĐOÀN CÔNG NGHỆ VIO CONNECT',
          font: FONT_FAMILY,
          size: 26,
          bold: true,
          color: COLOR_NAVY,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 60, after: 300 },
      children: [
        new TextRun({
          text: 'TRUNG TÂM PHÁT TRIỂN NỀN TẢNG CHUYỂN ĐỔI SỐ DOANH NGHIỆP VIONE 5.0',
          font: FONT_FAMILY,
          size: 22,
          bold: true,
          color: COLOR_AMBER,
        }),
      ],
    }),

    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 600 },
      children: [
        new TextRun({
          text: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
          font: FONT_FAMILY,
          size: 20,
          color: COLOR_GOLD,
        }),
      ],
    }),

    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 400, after: 180 },
      children: [
        new TextRun({
          text: 'TÀI LIỆU YÊU CẦU NGHIỆP VỤ DOANH NGHIỆP',
          font: FONT_FAMILY,
          size: 36,
          bold: true,
          color: COLOR_NAVY,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 200 },
      children: [
        new TextRun({
          text: 'BUSINESS REQUIREMENTS DOCUMENT (BRD)',
          font: FONT_FAMILY,
          size: 26,
          bold: true,
          color: COLOR_GOLD,
        }),
      ],
    }),

    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 100, after: 800 },
      children: [
        new TextRun({
          text: 'HỆ ĐIỀU HÀNH DOANH NGHIỆP TOÀN DIỆN, NỀN TẢNG CRM HỢP NHẤT\nỨNG DỤNG VIONE CONNECT MOBILE & TRỢ LÝ AI COPILOT 5.0',
          font: FONT_FAMILY,
          size: 24,
          bold: true,
          color: COLOR_DARK,
        }),
      ],
    }),

    createTable(
      ['Thuộc Tính Hồ Sơ', 'Thông Tin Xác Lập Kỹ Thuật'],
      [
        ['Tên Dự Án', 'ViOne Platform 5.0 (Enterprise Operating System & Unified CRM)'],
        ['Mã Số Tài Liệu', 'BRD-VIONE-ENTERPRISE-MASTER-V5.0'],
        ['Phiên Bản', 'Phiên bản 5.0 Master Release (Chuẩn hóa toàn diện 4 phân hệ)'],
        ['Ngày Phát Hành', '02/10/2026'],
        ['Đơn Vị Chủ Trì', 'Ban Công Nghệ & Chuyển Đổi Số — VioConnect Corporation'],
        ['Đối Tượng Tiếp Nhận', 'Ban Giám Đốc, Hội Đồng Cố Vấn, Khách Hàng Doanh Nghiệp'],
        ['Mức Độ Bảo Mật', 'TÀI LIỆU BẢO MẬT NỘI BỘ — LƯU HÀNH GIỚI HẠN'],
        ['Tình Trạng Ký Duyệt', 'Đã thẩm định nghiệp vụ và phê duyệt khung kiến trúc 100%']
      ],
      [3200, 6000]
    ),

    new Paragraph({ spacing: { before: 800, after: 100 } }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: 'HÀ NỘI — NĂM 2026',
          font: FONT_FAMILY,
          size: 24,
          bold: true,
          color: COLOR_NAVY,
        }),
      ],
    }),
  ];

  // SECTION 2: MỤC LỤC & NỘI DUNG CHÍNH BRD
  const bodyChildren = [
    createHeading1('MỤC LỤC TỔNG QUAN YÊU CẦU NGHIỆP VỤ'),
    new TableOfContents('Mục Lục Tự Động', {
      hyperlink: true,
      headingStyleRange: '1-3',
    }),
    new Paragraph({ spacing: { after: 200 } }),

    createTable(
      ['Mục', 'Nội Dung Yêu Cầu Nghiệp Vụ', 'Trọng Tâm Phân Tích'],
      [
        ['Chương 1', 'Bối Cảnh Dự Án & Tầm Nhìn Chiến Lược ViOne 5.0', 'Thực trạng & Sứ mệnh'],
        ['Chương 2', 'Mục Tiêu Kinh Doanh & Chỉ Số Đo Lường Hiệu Quả (KPIs)', 'Cam kết ROI & SLAs'],
        ['Chương 3', 'Phân Tích Các Bên Liên Quan (Stakeholder Analysis)', 'Ma trận Persona'],
        ['Chương 4', 'Mô Hình Nghiệp Vụ Thực Trạng (As-Is) vs Mục Tiêu (To-Be)', 'Tối ưu hóa quy trình'],
        ['Chương 5', 'Yêu Cầu Nghiệp Vụ 4 Phân Hệ Cốt Lõi + AI + Mobile', 'Đặc tả 4 Phân hệ'],
        ['Chương 6', 'Ma Trận Phân Định Trách Nhiệm RACI & Luồng Dữ Liệu', 'Kiểm soát nội bộ'],
        ['Chương 7', 'Yêu Cầu Phi Chức Năng (NFR) & Tiêu Chuẩn Bảo Mật', 'ISO 27001, OWASP'],
        ['Chương 8', 'Kế Hoạch Phân Kỳ Triển Khai & Quản Trị Rủi Ro Dự Án', 'Lộ trình 4 tuần']
      ],
      [1400, 5800, 2000]
    ),
    new Paragraph({ spacing: { after: 360 } }),

    createHeading1('1. BỐI CẢNH DỰ ÁN & TẦM NHÌN CHIẾN LƯỢC'),
    createParagraph('Trong kỷ nguyên kinh tế số 2026, các doanh nghiệp vừa và lớn tại Việt Nam đối mặt với 3 bài toán nan giải: Dữ liệu phân mảnh rời rạc, Chi phí vận hành hành chính cao và Thiếu công cụ kết nối giao thương B2B uy tín. ViOne Platform 5.0 ra đời với sứ mệnh trở thành "Hệ Điều Hành Hợp Nhất" cho doanh nghiệp, tích hợp liền mạch giữa Cổng Quản trị CRM 360°, Mạng xã hội Giao thương B2B, Danh thiếp số Titanium NFC và Trợ lý Trí tuệ Nhân tạo ViOne AI Copilot 5.0.'),

    createHeading1('2. MỤC TIÊU KINH DOANH & CHỈ SỐ ĐO LƯỜNG (KPIs)'),
    createParagraph('Dự án cam kết mang lại giá trị cụ thể, đo lường được cho các doanh nghiệp triển khai:'),
    createTable(
      ['Chỉ Số Đo Lường (KPI)', 'Mục Tiêu Cam Kết (Target)', 'Phương Pháp Đo Lường Thực Tế'],
      [
        ['Giảm chi phí vận hành', 'Giảm tối thiểu 35% - 40%', 'So sánh chi phí hành chính và nhân sự trước và sau 6 tháng'],
        ['Tăng tốc độ xử lý tác vụ', 'Nhanh hơn gấp 5 đến 10 lần', 'Đo lường thời gian từ lúc phát sinh Lead đến khi hoàn tất báo giá'],
        ['Độ chính xác dữ liệu tài chính', 'Đạt 99.9% không sai sót', 'Tự động đối soát công nợ qua VietQR Napas 24/7'],
        ['Tỷ lệ chuyển đổi giao thương', 'Tăng trưởng 25% giá trị hợp đồng', 'Thống kê số lượng thương vụ ký kết thành công trên sàn B2B'],
        ['Thời gian hoạt động hệ thống', 'Uptime tối thiểu 99.98%', 'Giám sát tự động 24/7 qua hệ thống Prometheus & Grafana']
      ],
      [2600, 2800, 3800]
    ),
    new Paragraph({ spacing: { after: 200 } }),

    createHeading1('3. PHÂN TÍCH CÁC BÊN LIÊN QUAN (STAKEHOLDERS)'),
    createParagraph('Hệ thống phục vụ 5 nhóm đối tượng trọng yếu:'),
    createBullet('Ban Giám Đốc (C-Level): Điều hành dựa trên số liệu thực tế thời gian thực, ra quyết định chiến lược qua gợi ý của AI Copilot.'),
    createBullet('Bộ Phận Kinh Doanh & Marketing: Quản lý phễu Lead, theo dõi đường ống Deals và sử dụng Danh thiếp số Titanium NFC mở rộng mạng lưới.'),
    createBullet('Bộ Phận Tài Chính - Kế Toán: Quản lý sổ quỹ Cashbook, kiểm soát dòng tiền và tự động gạch nợ qua VietQR Napas 24/7.'),
    createBullet('Bộ Phận Nhân Sự (HRM): Tự động hóa chấm công số, bảng lương điện tử và đánh giá hiệu suất nhân sự bằng AI.'),
    createBullet('Đối Tác & Khách Hàng: Trải nghiệm dịch vụ số hóa 1-chạm, bảo mật và kết nối giao thương tin cậy.'),

    createHeading1('4. YÊU CẦU NGHIỆP VỤ 4 PHÂN HỆ CỐT LÕI + AI + MOBILE'),
    createHeading2('4.1. Phân hệ CRM & Phễu Chuyển Đổi Lead 360°'),
    createParagraph('Chuẩn hóa toàn bộ quy trình chăm sóc khách hàng: Tiếp nhận Lead từ Webhook Landing Page, Zalo OA; tự động phân bổ cho chuyên viên; theo dõi lịch sử tương tác 360 độ và chuyển đổi thành hợp đồng thương mại.'),

    createHeading2('4.2. Phân hệ Vione Work — Quản Lý Dự Án & Công Việc'),
    createParagraph('Bảng Kanban quản trị nhiệm vụ, hỗ trợ phương pháp luận Agile Sprint, tự động nhắc việc qua thông báo đẩy và phát hiện sớm các nguy cơ chậm trễ hạn chót.'),

    createHeading2('4.3. Phân hệ Vione Finance — Dòng Tiền & Báo Cáo P&L'),
    createParagraph('Kiểm soát dòng tiền thu chi, hóa đơn điện tử, công nợ phải thu/phải trả và tự động đối soát ngân hàng qua chuẩn VietQR Napas 24/7.'),

    createHeading2('4.4. Phân hệ Vione HRM — Chấm Công Số & KPI AI'),
    createParagraph('Số hóa quản trị nhân sự từ lưu trữ hồ sơ, quản lý ngày phép, chấm công GPS/Wifi đến tính lương tự động và đánh giá hiệu suất KPI qua AI.'),

    createHeading2('4.5. Trí Tuệ Nhân Tạo ViOne AI Copilot 5.0'),
    createParagraph('Trợ lý ảo thông minh kết nối trực tiếp dữ liệu cơ sở dữ liệu PostgreSQL, phân tích số liệu, tự động hóa quy trình đa kênh và hỗ trợ ban giám đốc ra quyết định kinh doanh chuẩn xác.'),

    createHeading2('4.6. Ứng Dụng Di Động ViOne Connect & Thẻ Titanium NFC'),
    createParagraph('Danh thiếp số Titanium NFC 1-chạm, Mạng xã hội giao thương B2B, Nhắn tin mã hóa End-to-End và Radar tìm kiếm đối tác kinh doanh gần bạn.'),

    createHeading1('5. MA TRẬN PHÂN ĐỊNH TRÁCH NHIỆM RACI'),
    createTable(
      ['Hạng Mục Quy Trình', 'Ban Giám Đốc', 'Trưởng Phòng', 'Chuyên Viên', 'Hội Viên / Đối Tác'],
      [
        ['Phê duyệt ngân sách & Báo cáo P&L', 'Accountable (A)', 'Consulted (C)', 'Informed (I)', 'No Access'],
        ['Quản lý phễu Lead & Chốt hợp đồng', 'Informed (I)', 'Accountable (A)', 'Responsible (R)', 'No Access'],
        ['Giao việc Kanban & Đánh giá KPI', 'Accountable (A)', 'Responsible (R)', 'Informed (I)', 'No Access'],
        ['Tham gia sự kiện & Check-in QR', 'Informed (I)', 'Responsible (R)', 'Support (S)', 'Participant (P)'],
        ['Giao thương B2B & Chạm thẻ NFC', 'Informed (I)', 'Informed (I)', 'Responsible (R)', 'Active User (A)']
      ],
      [2800, 1600, 1600, 1600, 1600]
    ),
    new Paragraph({ spacing: { after: 200 } }),

    createHeading1('6. KẾ HOẠCH PHÂN KỲ TRIỂN KHAI & QUẢN TRỊ RỦI RO'),
    createParagraph('Dự án được triển khai theo quy trình 4 tuần chuẩn mực:'),
    createBullet('Tuần 1: Khảo sát quy trình nghiệp vụ hiện trạng và thiết lập sơ đồ luồng dữ liệu.'),
    createBullet('Tuần 2: Cài đặt hệ thống, cấu hình phân quyền RBAC và chuyển đổi dữ liệu danh mục.'),
    createBullet('Tuần 3: Đào tạo chuyển giao công nghệ cho cán bộ quản lý và nhân viên.'),
    createBullet('Tuần 4: Kiểm thử chấp nhận người dùng (UAT), tinh chỉnh kịch bản AI và nghiệm thu bàn giao.')
  ];

  const doc = new Document({
    sections: [
      {
        properties: { page: { margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 } } },
        children: coverChildren,
      },
      {
        properties: { page: { margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 } } },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: 'BRD-VIONE-ENTERPRISE-MASTER-V5.0 · Yêu Cầu Nghiệp Vụ ViOne 5.0',
                    font: FONT_FAMILY,
                    size: 18,
                    color: '64748B',
                  }),
                ],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: 'Trang ', font: FONT_FAMILY, size: 18, color: '64748B' }),
                  new TextRun({ children: [PageNumber.CURRENT], font: FONT_FAMILY, size: 18, color: '64748B' }),
                  new TextRun({ text: ' / ', font: FONT_FAMILY, size: 18, color: '64748B' }),
                  new TextRun({ children: [PageNumber.TOTAL_PAGES], font: FONT_FAMILY, size: 18, color: '64748B' }),
                ],
              }),
            ],
          }),
        },
        children: bodyChildren,
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(outputPath, buffer);
  console.log(`✓ Đã xuất bản file Word DOCX thành công: ${outputPath} (${(buffer.length / 1024).toFixed(1)} KB)`);
}

async function main() {
  console.log('=== BẮT ĐẦU XUẤT BẢN TÀI LIỆU BRD MASTER VIONE 5.0 ===');

  // 1. Markdown
  const mdContent = generateBrdMarkdown();
  const outMdPath = path.join(VIONE_DOC_DIR, 'BRD_VIONE_YEU_CAU_NGHIEP_VU_TOAN_DIEN.md');
  fs.writeFileSync(outMdPath, mdContent, 'utf8');
  console.log(`✓ Đã lưu Markdown BRD: ${outMdPath}`);

  // 2. Word DOCX
  const outDocxPath = path.join(VIONE_DOC_DIR, 'BRD_VIONE_YEU_CAU_NGHIEP_VU_TOAN_DIEN.docx');
  await buildDocxFile(outDocxPath);

  // Sync to all public/docs folders
  for (const destDir of FE_DOCS_DIRS) {
    fs.copyFileSync(outDocxPath, path.join(destDir, 'BRD_VIONE_YEU_CAU_NGHIEP_VU_TOAN_DIEN.docx'));
    fs.copyFileSync(outMdPath, path.join(destDir, 'BRD_VIONE_YEU_CAU_NGHIEP_VU_TOAN_DIEN.md'));
  }
  console.log('🎉 Hoàn tất 100% xuất bản & đồng bộ Tài Liệu BRD ViOne Master!');
}

main().catch(err => {
  console.error('[LỖI TẠO BRD]', err);
  process.exit(1);
});
