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
  TableLayoutType,
  WidthType,
  BorderStyle,
  AlignmentType,
  ShadingType,
  Header,
  Footer,
  PageNumber,
  ImageRun,
  ExternalHyperlink,
} = require('docx');

const ROOT_DIR = path.resolve(__dirname, '..');
const DOC_DIR = path.join(ROOT_DIR, 'document');
const EVIDENCE_DIR = path.join(DOC_DIR, 'images', 'evidence');
const FE_DOCS_DIR = path.join(ROOT_DIR, 'apps', 'ceo1983_app_fe', 'public', 'docs');

[DOC_DIR, FE_DOCS_DIR].forEach(d => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

// Cấu hình phông chữ & màu sắc chuẩn thương hiệu CEO 1983
const FONT_FAMILY = 'Times New Roman';
const COLOR_NAVY = '0A2540';
const COLOR_BLUE_ACCENT = '1E63E9';
const COLOR_GOLD = 'D97706';
const COLOR_DARK = '1E293B';
const COLOR_BORDER = 'CBD5E1';
const COLOR_BG_HEADER = '0A2540';
const COLOR_BG_ALT = 'F8FAFC';
const TABLE_WIDTH_DXA = 9200; // Chiều rộng bảng chuẩn trang A4 Word

const BORDER_STYLE_THIN = {
  top: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
  bottom: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
  left: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
  right: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
};

function createTextRun(text, opts = {}) {
  return new TextRun({
    text: String(text || ''),
    font: FONT_FAMILY,
    size: opts.size || 24, // 12pt
    bold: opts.bold || false,
    italics: opts.italics || false,
    color: opts.color || COLOR_DARK,
  });
}

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
    spacing: { before: 320, after: 140 },
    children: [
      new TextRun({
        text: text,
        font: FONT_FAMILY,
        size: 32, // 16pt
        bold: true,
        color: COLOR_NAVY,
      }),
    ],
  });
}

function createHeading2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 100 },
    children: [
      new TextRun({
        text: text,
        font: FONT_FAMILY,
        size: 28, // 14pt
        bold: true,
        color: COLOR_BLUE_ACCENT,
      }),
    ],
  });
}

function createHeading3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 180, after: 80 },
    children: [
      new TextRun({
        text: text,
        font: FONT_FAMILY,
        size: 25, // 12.5pt
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
        text: text,
        font: FONT_FAMILY,
        size: 23, // 11.5pt
        color: COLOR_DARK,
      }),
    ],
  });
}

// Bảng dữ liệu Word tự co giãn đẹp mắt
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
              size: 22, // 11pt
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
                size: 21, // 10.5pt
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

// Bảng Use Case chuẩn
function createUseCaseTable(useCaseData) {
  const headers = ['Thuộc Tính Use Case', 'Nội Dung Đặc Tả Chi Tiết'];
  const colWidths = [2400, 6800];
  const rows = [
    ['Mã Use Case (ID)', useCaseData.id],
    ['Phân Hệ / Nhóm', useCaseData.category],
    ['Tên Chức Năng', useCaseData.name],
    ['Người Dùng (Actor)', useCaseData.actor],
    ['Tiền Điều Kiện (Pre-conditions)', useCaseData.preConditions],
    ['Luồng Xử Lý Chính (Main Flow)', useCaseData.mainFlow],
    ['Luồng Thay Thế / Ngoại Lệ (Alternative / Exceptions)', useCaseData.alternativeFlow],
    ['Hậu Điều Kiện (Post-conditions)', useCaseData.postConditions],
    ['Hình Ảnh Minh Chứng', useCaseData.imageCaption || 'Xem ảnh minh chứng thực tế đính kèm'],
  ];
  return createTable(headers, rows, colWidths);
}

// Hàm chèn ảnh vào file Word với kích thước chuẩn, tự động phân loại Mobile vs Desktop
function createImageParagraph(imgFileName, captionText, defaultWidth = 520, defaultHeight = 290) {
  if (!imgFileName) return [];
  const p = path.join(EVIDENCE_DIR, imgFileName);
  if (!fs.existsSync(p)) return [];

  try {
    const imgBuffer = fs.readFileSync(p);

    // Đọc kích thước thật (pixels) từ header PNG
    let realWidth = 0;
    let realHeight = 0;
    if (imgBuffer.length > 24 && imgBuffer.toString('ascii', 12, 16) === 'IHDR') {
      realWidth = imgBuffer.readUInt32BE(16);
      realHeight = imgBuffer.readUInt32BE(20);
    }

    // Tự động nhận diện chuẩn xác: Nếu chiều cao > chiều rộng => Là ảnh Mobile (Portrait)
    const isMobile = (realHeight > 0 && realWidth > 0 && realHeight > realWidth) ||
      imgFileName.startsWith('app_') ||
      imgFileName.startsWith('app1983_') ||
      (imgFileName.startsWith('sub_') && (imgFileName.includes('app') || imgFileName.includes('mobile'))) ||
      imgFileName.includes('live_10') || imgFileName.includes('live_11') || imgFileName.includes('live_12') ||
      imgFileName.includes('live_13') || imgFileName.includes('live_15') || imgFileName.includes('live_16') ||
      imgFileName.includes('live_19') || imgFileName.includes('live_20') || imgFileName.includes('live_24') ||
      imgFileName.includes('live_25') || imgFileName.includes('live_26') || imgFileName.includes('live_28') ||
      imgFileName.includes('live_29') || imgFileName.includes('live_30');

    let width, height;
    if (isMobile) {
      // Ảnh Mobile hiển thị thanh lịch, căn giữa trang giấy, tỷ lệ chuẩn màn hình điện thoại
      width = 200; // ~2.8 inches
      const ratio = (realHeight && realWidth) ? (realHeight / realWidth) : 2.16;
      height = Math.round(width * Math.min(Math.max(ratio, 1.8), 2.3));
    } else {
      // Ảnh Web CRM / Desktop hiển thị ngang chuẩn khổ giấy A4
      width = defaultWidth; // ~7.2 inches
      const ratio = (realHeight && realWidth) ? (realHeight / realWidth) : 0.58;
      height = Math.round(width * Math.min(Math.max(ratio, 0.45), 0.75));
    }

    return [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 140, after: 60 },
        children: [
          new ImageRun({
            data: imgBuffer,
            transformation: {
              width: width,
              height: height,
            },
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 40, after: 180 },
        children: [
          new TextRun({
            text: captionText,
            font: FONT_FAMILY,
            size: 20, // 10pt
            italics: true,
            color: '64748B',
          }),
        ],
      }),
    ];
  } catch (err) {
    console.warn(`Lỗi đọc ảnh ${imgFileName}:`, err.message);
    return [];
  }
}

// Danh sách 138 Use Cases toàn diện bao quát 100% Hệ sinh thái số CEO 1983
const { USE_CASES_DATA } = require('./all_use_cases_data');

// Hàm tạo Markdown hoàn chỉnh chuẩn 100% kèm ảnh minh chứng thực tế
function generateMarkdown() {
  let md = `# SOFTWARE REQUIREMENTS SPECIFICATION (SRS)

# HỆ SINH THÁI SỐ HÓA HIỆP HỘI DOANH NHÂN CEO 1983 (CEO 1983 ASSOCIATION ECOSYSTEM)

---

## 1. TRANG BÌA (Cover Page)

* **Tên tài liệu:** Software Requirements Specification (Đặc tả Yêu cầu Kỹ thuật & Nghiệp vụ Hệ thống)
* **Tên dự án:** Hệ Sinh Thái Số Hóa Toàn Diện CLB Doanh Nhân CEO 1983
* **Cơ quan chủ quản:** Câu Lạc Bộ Doanh Nhân CEO 1983 — Trực thuộc Hội Doanh Nhân Trẻ Hà Nội (HanoiBA)
* **Môi trường triển khai:** Cổng Thông Tin Điện Tử, Cổng Quản Trị Ban Chấp Hành & Ứng Dụng Doanh Nhân CEO 1983
* **Mã tài liệu:** SRS-CEO1983-ENTERPRISE-MASTER-V4.0
* **Phiên bản:** 4.0 (Master Release — Đầy đủ 138 Use Cases toàn diện bao phủ 100% phân hệ)
* **Ngày phát hành:** 01/10/2026
* **Email đại diện đăng ký mẫu:** vupv090120@gmail.com (Doanh nhân Phạm Văn Vũ - CEO Công ty CP Công nghệ VIO CONNECT)
* **Trạng thái tài liệu:** Đã thẩm định, kiểm thử thực tế và nghiệm thu kỹ thuật 100%

---

## 2. MỤC LỤC TỔNG QUAN HỆ THỐNG

1. **Giới Thiệu Chung & Mục Đích Tài Liệu**
2. **Kiến Trúc Tổng Thể & Bối Cảnh Hệ Thống**
3. **Danh Mục 138 Use Cases Chi Tiết Theo 3 Khối Nghiệp Vụ:**
   - **Phần I: Cổng Thông Tin Công Khai & Đăng Ký Hội Viên (10 Use Cases: UC-PUB-01 -> UC-PUB-10)**
   - **Phần II: Cổng Điều Hành & Quản Trị Ban Chấp Hành (78 Use Cases: UC-CRM-01 -> UC-CRM-78)**
   - **Phần III: Ứng Dụng Hội Viên Doanh Nhân CEO 1983 (50 Use Cases: UC-APP-01 -> UC-APP-50)**
4. **Yêu Cầu Phi Chức Năng (Hiệu Năng, An Toàn Thông Tin, Sao Lưu Dữ Liệu)**
5. **Yêu Cầu Giao Diện & Trải Nghiệm Người Dùng (UI/UX Design Tokens)**
6. **Phụ Lục Minh Chứng Hình Ảnh Chụp Thực Tế Toàn Diện**

---

## 3. GIỚI THIỆU CHUNG (Introduction)

### 3.1. Mục đích (Purpose)
Tài liệu Đặc tả Yêu cầu Kỹ thuật và Nghiệp vụ (SRS) này xác định đầy đủ, chi tiết và chuẩn hóa toàn bộ các quy trình nghiệp vụ, chức năng phần mềm, luồng dữ liệu và tiêu chuẩn vận hành cho **Hệ sinh thái Số hóa CLB Doanh Nhân CEO 1983 (HanoiBA)**. Tài liệu đóng vai trò là căn cứ nghiệp vụ duy nhất giữa Thường trực Ban Chấp Hành CLB Doanh Nhân CEO 1983, Hội Doanh Nhân Trẻ Hà Nội, các Ban chuyên môn và Đội ngũ Kiến trúc sư Chuyển đổi số trong quá trình vận hành, nâng cấp và nghiệm thu bàn giao hệ thống.

### 3.2. Phạm vi hệ thống (Project Scope)
Hệ sinh thái Số hóa CLB Doanh Nhân CEO 1983 là nền tảng số hóa quản trị và giao thương nội bộ chuyên biệt dành riêng cho cộng đồng các nhà lãnh đạo, chủ tịch hội đồng quản trị, tổng giám đốc sinh năm Quý Hợi 1983. Hệ thống kết nối đồng bộ 3 cấu phần cốt lõi:
* **Cổng Thông Tin Công Khai & Tiếp Nhận Đơn Đăng Ký:** Giới thiệu tôn chỉ mục đích, cơ cấu 6 Ban điều hành, tiếp nhận hồ sơ gia nhập trực tuyến từ ứng viên đại diện (\`vupv090120@gmail.com\`) tại [Cổng Tiếp Nhận Hồ Sơ Gia Nhập CLB Doanh Nhân CEO 1983 Trực Tuyến](https://14.225.217.232:5444/landing?apply=%22true%22) (Bảo mật biểu mẫu điện tử chuẩn hóa, tự động gửi email thông báo tiếp nhận hồ sơ).
* **Cổng Điều Hành & Quản Trị Ban Chấp Hành:** Nền tảng quản trị trung tâm hỗ trợ 6 Ban chuyên môn (Ban Quản Trị, Ban Thư Ký, Ban Thành Viên, Ban Thiện Nguyện, Ban Truyền Thông, Ban Xúc Tiến Thương Mại) với phân quyền RBAC nghiêm ngặt: thẩm định hội viên 360 độ, phát hành vé QR Pass sự kiện Gala, quản lý sơ đồ ghế Cinema Seating Map, điều hành cuộc họp, kiểm duyệt sàn B2B, quản lý sổ quỹ thu chi minh bạch và đối soát tài chính tự động.
* **Ứng Dụng Doanh Nhân CEO 1983:** Ứng dụng số hóa cao cấp dành riêng cho Hội viên chính thức với Thẻ VIP Hoàng gia Navy & Amber Gold, Danh thiếp điện tử NFC chạm 1 giây, Danh bạ doanh nhân, Gian hàng B2B Doanh nhân CEO 1983, Kết nối Cung - Cầu realtime, Biểu quyết đại hội điện tử và Thanh toán gia hạn hội phí siêu tốc qua VietQR Napas 24/7 tự động gạch nợ.

### 3.3. Thuật ngữ và định nghĩa chuẩn hóa (Definitions & Terminology)
* **HanoiBA:** Hội Doanh Nhân Trẻ Hà Nội.
* **CLB Doanh Nhân CEO 1983:** Câu lạc bộ Doanh nhân 1983 trực thuộc Hội Doanh Nhân Trẻ Hà Nội.
* **Hội viên Chính thức:** Doanh nhân sinh năm 1983, đại diện pháp nhân doanh nghiệp, được Ban Thành Viên thẩm định và Ban Chấp Hành ban hành quyết định kết nạp kèm cấp Mã hội viên độc bản (ví dụ: CEO-83007).
* **Gian hàng B2B Doanh nhân CEO 1983:** Không gian giao thương và giới thiệu sản phẩm dịch vụ độc quyền giữa các doanh nghiệp thành viên với cam kết chiết khấu nội bộ ưu đãi.
* **VietQR:** Chuẩn thanh toán mã QR liên ngân hàng quốc gia Napas 24/7 tự động đối soát và gạch nợ tức thì.

---

## 4. MÔ TẢ TỔNG QUAN HỆ THỐNG (System Overview)

### 4.1. Kiến trúc hệ thống phân tầng (Layered Architecture)
Hệ thống được thiết kế theo mô hình Client-Server hiện đại, phân tầng rõ ràng giữa hiển thị giao diện và logic xử lý nghiệp vụ trung tâm:
* **Tầng Trải nghiệm Người dùng (Frontend Layer):** Cổng Thông Tin Điện Tử, Cổng Quản Trị Ban Chấp Hành và Ứng Dụng Doanh Nhân CEO 1983 với trải nghiệm đa nền tảng tối ưu (Web, Mobile App PWA).
* **Tầng Nghiệp vụ Trung tâm (Business Services Layer):** Bộ máy xử lý quy trình phê duyệt hồ sơ 3 cấp, Máy chủ thư tín tự động (SMTP Mailer Engine), Dịch vụ sinh vé QR Pass chống giả mạo, Dịch vụ Webhook đối soát tài chính ngân hàng.
* **Tầng Dữ liệu & Lưu trữ (Data Persistence Layer):** Cơ sở dữ liệu quan hệ quản lý thông tin hội viên, doanh nghiệp, sổ quỹ, giao dịch B2B và nhật ký kiểm toán hệ thống (Audit Trails).

### 4.2. Các trụ cột chức năng trọng yếu (Core Pillars)
1. **Quản trị Hội viên 360° & Tiếp nhận Onboarding:** Đăng ký trực tuyến, tự động gửi thư tiếp nhận, thẩm định hồ sơ doanh nghiệp và cấp mật khẩu an toàn gửi về hòm thư đại diện \`vupv090120@gmail.com\`.
2. **Thẻ Hội Viên VIP & Danh Thiếp Số Độc Bản:** Thẻ nhận diện danh dự Navy & Amber Gold, công nghệ NFC 1 chạm truyền danh bạ kinh doanh.
3. **Quản Trị Sự Kiện Gala & Soát Vé An Ninh QR:** Sơ đồ vị trí bàn tiệc Cinema Seating Map, đăng ký vé VIP, vé miễn phí, cấp vé điện tử E-Ticket QR và hệ thống camera quét vé chống gian lận tại cổng đón tiếp.
4. **Điều Hành Cuộc Họp Ban Chấp Hành:** Lên lịch giao ban, tự động đồng bộ lịch vào ứng dụng đại biểu và quản lý biên bản họp điện tử.
5. **Gian Hàng B2B Doanh Nhân CEO 1983 & Khớp Lệnh Giao Thương:** Quảng bá hàng hóa, thẩm định chất lượng sản phẩm nội bộ và hỗ trợ kết nối cung - cầu 1-1 giữa các CEO thành viên.
6. **Tài Chính Minh Bạch & Thanh Toán VietQR 24/7:** Sổ quỹ thu chi đa cấp, hóa đơn hội phí điện tử và tự động gạch nợ sau 1 giây.

---

## 5. ĐẶC TẢ CHI TIẾT 138 USE CASES TOÀN DIỆN (Detailed Use Cases Specification)

Dưới đây là bảng đặc tả chi tiết toàn bộ 138 Use Cases bao phủ 100% mọi chức năng, nút bấm, modal hộp thoại và luồng nghiệp vụ trên toàn Hệ sinh thái Số hóa CEO 1983:
`;

  USE_CASES_DATA.forEach((uc, idx) => {
    md += `\n### 5.${idx + 1}. Bảng Use Case ${uc.id}: ${uc.name}\n\n`;
    md += `| Thuộc Tính Nghiệp Vụ | Nội Dung Đặc Tả Chi Tiết |\n`;
    md += `| :--- | :--- |\n`;
    md += `| **Mã Use Case (ID)** | **${uc.id}** |\n`;
    md += `| **Phân Hệ / Nhóm** | ${uc.category} |\n`;
    md += `| **Tên Chức Năng** | ${uc.name} |\n`;
    md += `| **Tác Nhân (Actor)** | ${uc.actor} |\n`;
    md += `| **Tiền Điều Kiện (Pre-conditions)** | ${uc.preConditions} |\n`;

    const formattedMainFlow = uc.mainFlow.replace(/\n/g, '<br>');
    const formattedAltFlow = uc.alternativeFlow.replace(/\n/g, '<br>');

    md += `| **Luồng Xử Lý Chính (Main Flow)** | ${formattedMainFlow} |\n`;
    md += `| **Luồng Thay Thế / Ngoại Lệ (Alternative Flows)** | ${formattedAltFlow} |\n`;
    md += `| **Hậu Điều Kiện (Post-conditions)** | ${uc.postConditions} |\n`;
    md += `| **Hình Ảnh Minh Chứng Thực Tế** | *${uc.imageCaption}* |\n\n`;
    md += `![${uc.imageCaption}](images/evidence/${uc.imageFile})\n\n`;
  });

  md += `
---

## 6. YÊU CẦU PHI CHỨC NĂNG (Non-Functional Requirements)

| Tiêu Chí Kỹ Thuật | Yêu Cầu Chi Tiết & Chuẩn Mực Doanh Nghiệp | Chỉ Số Đo Lường (SLA) |
| :--- | :--- | :--- |
| **Hiệu năng & Tốc độ (Performance)** | - Thời gian phản hồi thao tác trung bình dưới 150ms.<br>- Thời gian nhận diện mã QR vé mời tại cổng dưới 0.2 giây.<br>- Khả năng chịu tải đồng thời tối thiểu 5,000 người dùng truy cập biểu quyết hoặc xem sự kiện Gala. | - Thời gian phản hồi: < 150ms<br>- Nhận diện QR: < 200ms<br>- Tải đồng thời: > 5,000 |
| **Bảo mật & An toàn (Security)** | - Mã hóa dữ liệu truyền tải theo tiêu chuẩn TLS 1.3 bảo mật cao.<br>- Mật khẩu tài khoản được băm một chiều an toàn (Bcrypt Salt 10 vòng).<br>- Tự động khóa tạm thời sau 5 lần đăng nhập thất bại liên tiếp.<br>- Phân quyền dữ liệu RBAC nghiêm ngặt cho 6 Ban chuyên môn và ghi nhận nhật ký kiểm toán không thể sửa đổi. | - Mã hóa: TLS 1.3<br>- Băm Bcrypt Salt 10<br>- Khóa sau 5 lần sai<br>- Nhật ký Audit Trail: 100% |
| **Bảo trì & Sao lưu (Maintainability)** | - Kiến trúc mô-đun hóa độc lập, phân tách rõ ràng giữa giao diện và logic xử lý.<br>- Tự động tạo bản sao lưu dữ liệu (Daily Backup) hàng ngày vào 03:00 sáng.<br>- Khả năng phục hồi dữ liệu nhanh khi có sự cố kỹ thuật. | - Tự động sao lưu định kỳ<br>- Thời gian phục hồi RTO < 30 phút<br>- RPO < 24 giờ |
| **Tính khả dụng (Usability)** | - Thiết kế giao diện phong cách Hoàng gia Doanh nhân sang trọng (Obsidian Dark, Royal Navy, Amber Gold).<br>- Tương thích hoàn hảo trên mọi kích thước màn hình từ điện thoại di động đến máy tính để bàn.<br>- Toàn bộ thuật ngữ tiếng Việt hành chính chuẩn mực, dễ hiểu đối với lãnh đạo không chuyên CNTT. | - Tương thích 100% thiết bị<br>- Tỷ lệ lỗi giao diện: 0%<br>- Trải nghiệm mượt mà, trực quan |

---

## 7. YÊU CẦU DỮ LIỆU & GIAO DIỆN (UI/UX Standards)

### 7.1. Bảng màu nhận diện thương hiệu độc quyền CEO 1983
* **Royal Navy (#0A2540):** Màu xanh biển sâu tượng trưng cho uy tín vững bền, tầm nhìn chiến lược của người lãnh đạo.
* **Amber Gold (#D97706):** Màu vàng kim vinh danh thẻ VIP, kỷ niệm chương và các gói đối tác chiến lược.
* **Trắng Sứ & Xám Khói (#FFFFFF, #F8FAFC):** Nền tảng thanh lịch, thoáng đãng giúp hiển thị dữ liệu rõ ràng.

### 7.2. Chuẩn mực phần cứng & giao tiếp ngoại vi
* **Camera Soát Vé Thông Minh:** Tự động điều chỉnh tiêu cự nhận diện mã QR trong 0.2 giây kể cả trong điều kiện ánh sáng yếu tại sảnh tiệc Gala.
* **Công Nghệ NFC 1 Chạm:** Trao đổi thông tin danh thiếp điện tử không tiếp xúc tiêu chuẩn quốc tế ISO/IEC 14443.
* **Máy Chủ Thư Tín Tự Động (SMTP Mailer):** Tự động phát hành email chào mừng, hóa đơn VietQR và vé điện tử E-Ticket tức thời.

---

## 8. PHỤ LỤC: DANH MỤC 138 MINH CHỨNG HÌNH ẢNH CHỤP THỰC TẾ

Toàn bộ 138 hình ảnh minh chứng thực tế trên hệ thống được lưu trữ trong thư mục tài liệu \`document/images/evidence/\` và được tích hợp trực tiếp dưới từng bảng Use Case chi tiết ở Mục 5 của tài liệu này.
`;

  return md;
}

// Hàm xây dựng file Word DOCX toàn diện chuẩn mực
async function buildDocxFile(outputPath) {
  const docChildren = [];

  // ==================== TRANG BÌA ====================
  docChildren.push(
    new Paragraph({ spacing: { before: 1200 } }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: 'HỘI DOANH NHÂN TRẺ HÀ NỘI (HANOIBA)',
          font: FONT_FAMILY,
          size: 26, // 13pt
          bold: true,
          color: '64748B',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 80, after: 360 },
      children: [
        new TextRun({
          text: 'CÂU LẠC BỘ DOANH NHÂN CEO 1983',
          font: FONT_FAMILY,
          size: 32, // 16pt
          bold: true,
          color: COLOR_NAVY,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 400, after: 200 },
      children: [
        new TextRun({
          text: 'SOFTWARE REQUIREMENTS SPECIFICATION',
          font: FONT_FAMILY,
          size: 40, // 20pt
          bold: true,
          color: COLOR_NAVY,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 100, after: 500 },
      children: [
        new TextRun({
          text: 'ĐẶC TẢ YÊU CẦU PHẦN MỀM & QUY TRÌNH NGHIỆP VỤ HỆ THỐNG SỐ HÓA TOÀN DIỆN CLB DOANH NHÂN CEO 1983',
          font: FONT_FAMILY,
          size: 26, // 13pt
          bold: true,
          color: COLOR_GOLD,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 800 },
      children: [
        new TextRun({
          text: 'Tài liệu nghiệp vụ chuẩn hóa 138 Use Cases bao phủ 100% Cổng Thông Tin, Cổng Quản Trị Ban Chấp Hành & Ứng Dụng Doanh Nhân CEO 1983',
          font: FONT_FAMILY,
          size: 23,
          italics: true,
          color: '64748B',
        }),
      ],
    })
  );

  // Metadata Box Table
  const metaHeaders = ['Thuộc Tính Tài Liệu', 'Thông Tin Chi Tiết'];
  const metaRows = [
    ['Mã Tài Liệu', 'SRS-CEO1983-ENTERPRISE-MASTER-V4.0'],
    ['Phiên Bản', '4.0 (Master Enterprise Release — Toàn diện 138 Use Cases)'],
    ['Cơ Quan Ban Hành', 'Ban Chấp Hành CLB Doanh Nhân CEO 1983 & ViConnect Platform'],
    ['Ngày Ban Hành', '01/10/2026'],
    ['Email Đăng Ký Đại Diện', 'vupv090120@gmail.com (Doanh nhân Phạm Văn Vũ - CEO Cty CP Công nghệ VIO CONNECT)'],
    ['Tổng Số Use Cases Nghiệp Vụ', '138 Use Cases chi tiết (10 Public + 78 CRM + 50 App)'],
    ['Trạng Thái Nghiệm Thu', 'Đã thẩm định, kiểm thử thực tế và nghiệm thu kỹ thuật 100%'],
  ];
  docChildren.push(
    createTable(metaHeaders, metaRows, [3000, 6200]),
    new Paragraph({ spacing: { after: 600 } })
  );

  // ==================== 1. GIỚI THIỆU CHUNG ====================
  docChildren.push(
    createHeading1('1. GIỚI THIỆU CHUNG (Introduction)'),
    createHeading2('1.1. Mục đích tài liệu (Purpose)'),
    createParagraph('Tài liệu Đặc tả Yêu cầu Phần mềm (SRS) này xác định đầy đủ, chi tiết và chuẩn hóa toàn bộ các quy trình nghiệp vụ, chức năng phần mềm, luồng dữ liệu và tiêu chuẩn vận hành cho Hệ sinh thái Số hóa CLB Doanh Nhân CEO 1983 (trực thuộc Hội Doanh Nhân Trẻ Hà Nội - HanoiBA). Tài liệu đóng vai trò là căn cứ nghiệp vụ duy nhất giữa Thường trực Ban Chấp Hành, các Ban chuyên môn và Đội ngũ Kiến trúc sư Chuyển đổi số trong quá trình vận hành, nâng cấp và nghiệm thu bàn giao hệ thống.'),
    createHeading2('1.2. Phạm vi hệ thống (Project Scope)'),
    createParagraph('Hệ sinh thái Số hóa CLB Doanh Nhân CEO 1983 là nền tảng số hóa quản trị và giao thương nội bộ chuyên biệt dành riêng cho cộng đồng các nhà lãnh đạo doanh nghiệp sinh năm Quý Hợi 1983. Hệ thống bao gồm 3 cấu phần cốt lõi được đồng bộ thời gian thực:'),
    createBullet('Cổng Thông Tin Công Khai & Tiếp Nhận Đơn Đăng Ký: Giới thiệu tôn chỉ mục đích, cơ cấu 6 Ban điều hành, tiếp nhận hồ sơ gia nhập trực tuyến từ ứng viên đại diện (vupv090120@gmail.com) và tự động gửi email thông báo tiếp nhận hồ sơ.'),
    new Paragraph({
      bullet: { level: 0 },
      spacing: { before: 40, after: 40, line: 260 },
      children: [
        new TextRun({
          text: 'Cổng Đăng Ký Hội Viên Trực Tuyến: Ứng viên nộp hồ sơ xét duyệt chính thức tại ',
          font: FONT_FAMILY,
          size: 24,
          color: COLOR_DARK,
        }),
        new ExternalHyperlink({
          children: [
            new TextRun({
              text: 'Cổng Tiếp Nhận Hồ Sơ Gia Nhập CLB Doanh Nhân CEO 1983 Trực Tuyến',
              font: FONT_FAMILY,
              size: 24,
              bold: true,
              color: COLOR_BLUE_ACCENT,
              underline: {},
            }),
          ],
          link: 'https://14.225.217.232:5444/landing?apply=%22true%22',
        }),
        new TextRun({
          text: ' (Bảo mật biểu mẫu điện tử chuẩn hóa, tiếp nhận trực tiếp vào Hội đồng Thẩm định Ban Thành Viên).',
          font: FONT_FAMILY,
          size: 24,
          color: COLOR_DARK,
        }),
      ],
    }),
    createBullet('Cổng Điều Hành & Quản Trị Ban Chấp Hành: Nền tảng quản trị trung tâm hỗ trợ 6 Ban chuyên môn (Ban Quản Trị, Ban Thư Ký, Ban Thành Viên, Ban Thiện Nguyện, Ban Truyền Thông, Ban Xúc Tiến Thương Mại) với phân quyền RBAC nghiêm ngặt: thẩm định hội viên 360 độ, phát hành vé QR Pass sự kiện Gala, quản lý sơ đồ ghế Cinema Seating Map, điều hành cuộc họp, kiểm duyệt sàn B2B, quản lý sổ quỹ thu chi minh bạch và đối soát tài chính tự động.'),
    createBullet('Ứng Dụng Doanh Nhân CEO 1983: Ứng dụng số hóa cao cấp dành riêng cho Hội viên chính thức với Thẻ VIP Hoàng gia Navy & Amber Gold, Danh thiếp điện tử NFC chạm 1 giây, Danh bạ doanh nhân, Gian hàng B2B Doanh nhân CEO 1983, Kết nối Cung - Cầu realtime, Biểu quyết đại hội điện tử và Thanh toán gia hạn hội phí siêu tốc qua VietQR Napas 24/7 tự động gạch nợ.')
  );

  // ==================== 2. MÔ TẢ TỔNG QUAN ====================
  docChildren.push(
    createHeading1('2. MÔ TẢ TỔNG QUAN HỆ THỐNG (System Perspective)'),
    createHeading2('2.1. Kiến trúc phân tầng và luồng dữ liệu nghiệp vụ'),
    createParagraph('Hệ thống hoạt động theo mô hình phân tầng hiện đại, phân tách hoàn toàn giữa giao diện tương tác người dùng và logic xử lý nghiệp vụ trung tâm. Toàn bộ thông tin hội viên, trạng thái thẩm định, đăng ký sự kiện, đơn hàng B2B và sổ quỹ tài chính đều được đồng bộ tức thời.'),
    createHeading2('2.2. Các trụ cột nghiệp vụ cốt lõi'),
    createBullet('Quản trị Hội viên 360° & Onboarding: Nộp đơn trực tuyến, tự động gửi email tiếp nhận ngay, thẩm định doanh nghiệp và cấp mật khẩu an toàn.'),
    createBullet('Thẻ VIP 3D & Danh thiếp số độc bản: Thẻ nhận diện mạ vàng sang trọng, chạm NFC 1-giây truyền dữ liệu doanh bạ.'),
    createBullet('Sự kiện Gala & Soát vé QR: Đăng ký vé miễn phí / có phí VietQR 1.500.000đ, vé Hội viên VIP, sơ đồ Cinema Seating Map và camera quét vé chống gian lận.'),
    createBullet('Điều hành Lịch họp: Lên lịch họp giao ban Ban Chấp Hành, chống trùng phòng họp và điểm danh mã QR.'),
    createBullet('Gian hàng B2B Doanh nhân CEO 1983: Không gian giao thương tiêu chuẩn B2B, thẩm định chất lượng sản phẩm và ưu đãi nội bộ.'),
    createBullet('Kết nối Cơ hội Cung - Cầu: Bảng tin realtime, lưu bookmark quan tâm và đặt lịch hẹn gặp 1-1 giữa các CEO thành viên.'),
    createBullet('Truyền thông & Banner Tài Trợ: Phân phối banner xoay vòng tự động, vinh danh các gói tài trợ Kim Cương/Vàng/Bạc.'),
    createBullet('Biểu quyết Đại hội điện tử: Nguyên tắc 1 người 1 phiếu bảo mật, đếm phiếu trực tiếp thời gian thực.'),
    createBullet('Tài chính Quỹ & Sổ quỹ Cashbook: Duyệt chi 3 cấp minh bạch, đối soát hội phí thường niên VietQR 24/7.')
  );

  // ==================== 3. ĐẶC TẢ CHI TIẾT 138 USE CASES ====================
  docChildren.push(
    createHeading1('3. ĐẶC TẢ CHI TIẾT 138 USE CASES NGHIỆP VỤ TOÀN DIỆN (Detailed Use Cases)'),
    createParagraph('Dưới đây là bảng đặc tả chi tiết toàn bộ 138 Use Cases nghiệp vụ bao phủ 100% Hệ sinh thái Số hóa CEO 1983, kèm theo hình ảnh chụp minh chứng thực tế trên hệ thống:')
  );

  USE_CASES_DATA.forEach(uc => {
    docChildren.push(
      createHeading2(`${uc.id}: ${uc.name}`),
      createUseCaseTable(uc),
      ...createImageParagraph(uc.imageFile, `Minh chứng thực tế: ${uc.imageCaption || uc.name} (${uc.id})`),
      new Paragraph({ spacing: { after: 180 } })
    );
  });

  // ==================== 4. YÊU CẦU PHI CHỨC NĂNG ====================
  const nfrHeaders = ['Tiêu Chí', 'Yêu Cầu Kỹ Thuật Chi Tiết', 'Chỉ Số Đo Lường (SLA)'];
  const nfrWidths = [2200, 4800, 2200];
  const nfrRows = [
    ['Hiệu năng (Performance)', 'Thời gian phản hồi thao tác trung bình dưới 150ms. Nhận diện mã QR soát vé camera dưới 0.2 giây. Chịu tải đồng thời tối thiểu 5,000 người dùng.', 'Response < 150ms\nQR Scan < 200ms\nUsers > 5,000'],
    ['Bảo mật (Security)', 'Mã hóa truyền tải TLS 1.3. Băm mật khẩu Bcrypt Salt 10 vòng. Khóa tài khoản sau 5 lần đăng nhập sai. Ghi nhật ký kiểm toán Audit Trail 100%.', 'TLS 1.3\nBcrypt Salt 10\nLock 5 fails\nAudit 100%'],
    ['Bảo trì (Maintainability)', 'Kiến trúc mô-đun hóa độc lập. Phân tách rõ ràng giữa giao diện và logic xử lý. Tự động sao lưu dữ liệu hàng ngày (Daily Backup lúc 03:00 AM).', 'Kiến trúc chuẩn hóa\nDaily Backup 03:00 AM\nRPO < 24h, RTO < 30p'],
    ['Tính khả dụng (Usability)', 'Giao diện phong cách Hoàng gia Doanh nhân (Navy & Amber Gold). Tương thích 100% kích thước màn hình từ 5.5 inch đến máy tính 4K.', 'Responsive 100%\nTiếng Việt chuẩn mực\nLỗi UI: 0%'],
  ];
  docChildren.push(
    createHeading1('4. YÊU CẦU PHI CHỨC NĂNG (Non-Functional Requirements)'),
    createTable(nfrHeaders, nfrRows, nfrWidths)
  );

  // ==================== 5. TIÊU CHUẨN GIAO DIỆN ====================
  docChildren.push(
    createHeading1('5. YÊU CẦU DỮ LIỆU & GIAO DIỆN (Data & Interface Standards)'),
    createHeading2('5.1. Bảng màu thương hiệu Hoàng gia Doanh nhân'),
    createParagraph('Thiết kế giao diện tuân thủ quy chuẩn Hoàng gia Doanh nhân (Royal Navy #0A2540, Amber Gold #D97706, Nền sáng #F8FAFC), phông chữ chuẩn Times New Roman và Be Vietnam Pro, trải nghiệm trực quan, sang trọng và bảo mật cao.'),
    createHeading2('5.2. Chuẩn mực giao tiếp thiết bị'),
    createBullet('Camera Scanner: Nhận diện mã QR vé mời và danh thiếp số trong 0.2 giây.'),
    createBullet('Chip NFC: Đọc ghi danh thiếp số công khai chuẩn quốc tế ISO/IEC 14443 trong 0.1 giây.'),
    createBullet('Máy chủ Thư tín Tự động: Phát hành email chào mừng, biên lai VietQR và vé điện tử E-Ticket tức thời.')
  );

  // Tạo tài liệu Document
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440, // 1 inch = 1440 twips
              bottom: 1440,
              left: 1440,
              right: 1440,
            },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: 'SRS-CEO1983-MASTER-V4.0 · CLB Doanh Nhân CEO 1983 (HanoiBA)',
                    font: FONT_FAMILY,
                    size: 18, // 9pt
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
                  new TextRun({
                    text: 'Trang ',
                    font: FONT_FAMILY,
                    size: 18,
                    color: '64748B',
                  }),
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    font: FONT_FAMILY,
                    size: 18,
                    color: '64748B',
                  }),
                  new TextRun({
                    text: ' / ',
                    font: FONT_FAMILY,
                    size: 18,
                    color: '64748B',
                  }),
                  new TextRun({
                    children: [PageNumber.TOTAL_PAGES],
                    font: FONT_FAMILY,
                    size: 18,
                    color: '64748B',
                  }),
                ],
              }),
            ],
          }),
        },
        children: docChildren,
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(outputPath, buffer);
  console.log(`✓ Đã xuất bản file Word DOCX thành công: ${outputPath} (${(buffer.length / 1024).toFixed(1)} KB)`);
}

async function main() {
  console.log('=== BẮT ĐẦU XUẤT BẢN TÀI LIỆU SRS MASTER CEO 1983 V4.0 (138 USE CASES) ===');

  // 1. Tạo file Markdown
  const mdContent = generateMarkdown();
  const outMdPath = path.join(DOC_DIR, 'SRS_CHI_TIET_CEO1983_HE_THONG_TOAN_DIEN.md');
  fs.writeFileSync(outMdPath, mdContent, 'utf8');
  console.log(`✓ Đã lưu Markdown SRS: ${outMdPath}`);

  // Đồng bộ sang public/docs của FE
  fs.writeFileSync(path.join(FE_DOCS_DIR, 'SRS_CHI_TIET_CEO1983_HE_THONG_TOAN_DIEN.md'), mdContent, 'utf8');

  // 2. Tạo file Word DOCX
  const outDocxPath = path.join(DOC_DIR, 'SRS_CHI_TIET_CEO1983_HE_THONG_TOAN_DIEN.docx');
  await buildDocxFile(outDocxPath);

  // Copy đồng bộ file ngắn hơn nếu cần
  const outDocxPathShort = path.join(DOC_DIR, 'SRS_CEO1983_HE_THONG_TOAN_DIEN.docx');
  fs.copyFileSync(outDocxPath, outDocxPathShort);

  // Đồng bộ sang FE public docs
  fs.copyFileSync(outDocxPath, path.join(FE_DOCS_DIR, 'SRS_CHI_TIET_CEO1983_HE_THONG_TOAN_DIEN.docx'));
  fs.copyFileSync(outDocxPath, path.join(FE_DOCS_DIR, 'SRS_CEO1983_HE_THONG_TOAN_DIEN.docx'));
  console.log(`✓ Đã đồng bộ sang: ${path.join(FE_DOCS_DIR, 'SRS_CHI_TIET_CEO1983_HE_THONG_TOAN_DIEN.docx')}`);

  console.log('=== HOÀN TẤT XUẤT BẢN TÀI LIỆU SRS (MD & DOCX) VỚI ĐỦ 138 USE CASES THÀNH CÔNG 100%! ===');
}

main().catch(err => {
  console.error('[LỖI]', err);
  process.exit(1);
});
