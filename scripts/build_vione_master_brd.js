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
  WidthType,
  BorderStyle,
  AlignmentType,
  ShadingType,
  Header,
  Footer,
  PageNumber,
} = require('docx');

const VIONE_DIR = path.resolve(__dirname, '../../vione_project');
const DOC_DIR = path.join(VIONE_DIR, 'document');
const FE_DOCS_DIR = path.join(VIONE_DIR, 'apps', 'vione_app_fe', 'public', 'docs');

[DOC_DIR, FE_DOCS_DIR].forEach(d => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

const FONT_FAMILY = 'Times New Roman';
const COLOR_BLACK = '0A0A0B';
const COLOR_GOLD = 'D4AF37';
const COLOR_GOLD_DARK = '92400E';
const COLOR_DARK = '18181B';
const COLOR_BORDER = 'CBD5E1';
const COLOR_BG_HEADER = '18181B';
const COLOR_BG_ALT = 'F8FAFC';
const TABLE_WIDTH_DXA = 9200;

const BORDER_STYLE_THIN = {
  top: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
  bottom: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
  left: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
  right: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
};

function createHeading1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 320, after: 140 },
    children: [
      new TextRun({
        text,
        font: FONT_FAMILY,
        size: 32,
        bold: true,
        color: COLOR_BLACK,
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
        text,
        font: FONT_FAMILY,
        size: 27,
        bold: true,
        color: COLOR_GOLD_DARK,
      }),
    ],
  });
}

function createHeading3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 180, after: 60 },
    children: [
      new TextRun({
        text,
        font: FONT_FAMILY,
        size: 24,
        bold: true,
        color: COLOR_DARK,
      }),
    ],
  });
}

function createP(text, opts = {}) {
  const { bold = false, italic = false, color = COLOR_DARK, before = 60, after = 60 } = opts;
  return new Paragraph({
    spacing: { before, after },
    children: [
      new TextRun({
        text,
        font: FONT_FAMILY,
        size: 24,
        bold,
        italic,
        color,
      }),
    ],
  });
}

function createBullet(text, boldPrefix = '') {
  const children = [];
  if (boldPrefix) {
    children.push(new TextRun({ text: boldPrefix + ': ', font: FONT_FAMILY, size: 24, bold: true, color: COLOR_BLACK }));
  }
  children.push(new TextRun({ text, font: FONT_FAMILY, size: 24, color: COLOR_DARK }));

  return new Paragraph({
    bullet: { level: 0 },
    spacing: { before: 40, after: 40 },
    children,
  });
}

function createTableCell(text, opts = {}) {
  const { isHeader = false, bold = isHeader, widthDxa = null, align = AlignmentType.LEFT, bg = null } = opts;
  return new TableCell({
    width: widthDxa ? { size: widthDxa, type: WidthType.DXA } : null,
    shading: isHeader ? { fill: COLOR_BG_HEADER, type: ShadingType.CLEAR } : (bg ? { fill: bg, type: ShadingType.CLEAR } : null),
    margins: { top: 120, bottom: 120, left: 140, right: 140 },
    borders: BORDER_STYLE_THIN,
    children: [
      new Paragraph({
        alignment: align,
        children: [
          new TextRun({
            text,
            font: FONT_FAMILY,
            size: isHeader ? 21 : 21,
            bold,
            color: isHeader ? 'FFFFFF' : COLOR_DARK,
          }),
        ],
      }),
    ],
  });
}

async function buildViOneBrd() {
  console.log('>>> Khởi tạo Tài liệu BRD ViOne Platform Master...');

  const doc = new Document({
    creator: 'ViOne Platform Solution Architecture Team',
    title: 'TÀI LIỆU YÊU CẦU NGHIỆP VỤ TOÀN DIỆN (BRD) — HỆ THỐNG VIONE PLATFORM & AI COPILOT 5.0',
    description: 'Business Requirements Document for ViOne Ecosystem',
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: 'VIONE PLATFORM 5.0 — BUSINESS REQUIREMENTS DOCUMENT (BRD)',
                    font: FONT_FAMILY,
                    size: 18,
                    italic: true,
                    color: '94A3B8',
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
                alignment: AlignmentType.RIGHT,
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
        children: [
          // Bìa tài liệu
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 600, after: 120 },
            children: [
              new TextRun({
                text: 'TẬP ĐOÀN CÔNG NGHỆ VICONNECT — VIONE ECOSYSTEM',
                font: FONT_FAMILY,
                size: 26,
                bold: true,
                color: COLOR_GOLD_DARK,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 120, after: 360 },
            children: [
              new TextRun({
                text: 'TÀI LIỆU YÊU CẦU NGHIỆP VỤ TOÀN DIỆN (BRD)',
                font: FONT_FAMILY,
                size: 40,
                bold: true,
                color: COLOR_BLACK,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 60, after: 480 },
            children: [
              new TextRun({
                text: 'HỆ THỐNG QUẢN TRỊ TỰ ĐỘNG HÓA VẬN HÀNH & TRỢ LÝ DOANH NGHIỆP VIONE AI 5.0',
                font: FONT_FAMILY,
                size: 28,
                bold: true,
                color: 'CA8A04',
              }),
            ],
          }),

          // Metadata Table
          new Table({
            width: { size: TABLE_WIDTH_DXA, type: WidthType.DXA },
            rows: [
              new TableRow({
                children: [
                  createTableCell('Thuộc tính', { isHeader: true, widthDxa: 3000 }),
                  createTableCell('Chi tiết thông số', { isHeader: true, widthDxa: 6200 }),
                ],
              }),
              new TableRow({
                children: [
                  createTableCell('Tên dự án', { bold: true }),
                  createTableCell('ViOne Enterprise & Creator Automation Ecosystem (Vione AI 5.0)'),
                ],
              }),
              new TableRow({
                children: [
                  createTableCell('Mã tài liệu', { bold: true }),
                  createTableCell('BRD-VIONE-5.0-MASTER-2026'),
                ],
              }),
              new TableRow({
                children: [
                  createTableCell('Phiên bản', { bold: true }),
                  createTableCell('Release 5.0.0 (Localhost Master Golden Standard)'),
                ],
              }),
              new TableRow({
                children: [
                  createTableCell('Phạm vi hệ thống', { bold: true }),
                  createTableCell('Web CRM Quản trị (React TanStack) + App Mobile ViOne Connect (Capacitor/PWA) + NestJS Core API + PostgreSQL Cloud'),
                ],
              }),
              new TableRow({
                children: [
                  createTableCell('Ngày phát hành', { bold: true }),
                  createTableCell('Tháng 10 / 2026'),
                ],
              }),
            ],
          }),

          createHeading1('CHƯƠNG 1: TỔNG QUAN DỰ ÁN & MỤC TIÊU CHIẾN LƯỢC'),
          createHeading2('1.1. Bối cảnh thị trường và Nhu cầu chuyển đổi số'),
          createP('Trong bối cảnh kỷ nguyên kinh tế số và cách mạng công nghiệp AI, các tổ chức doanh nghiệp, tập đoàn đa chi nhánh và mạng lưới doanh nhân đang đối mặt với các rào cản vận hành nghiêm trọng:'),
          createBullet('Dữ liệu phân mảnh giữa bán hàng, tài chính, giao tiếp nội bộ và chăm sóc khách hàng.', 'Phân mảnh dữ liệu'),
          createBullet('Các công việc hành chính lặp đi lặp lại tiêu tốn từ 35% - 40% thời gian của nhân sự chủ chốt.', 'Tắc nghẽn vận hành'),
          createBullet('Thiếu hụt trợ lý thông minh hỗ trợ lãnh đạo ra quyết định nhanh dựa trên số liệu thực tế thời gian thực.', 'Thiếu hụt AI'),

          createHeading2('1.2. Tầm nhìn & Sứ mệnh của ViOne Platform'),
          createP('ViOne Platform 5.0 được định vị là Hệ điều hành vận hành số toàn diện cho Doanh nghiệp và Tổ chức. Hệ thống kết hợp sức mạnh của:'),
          createBullet('Tự động hóa tổng hợp số liệu, cảnh báo rủi ro dòng tiền và gợi ý hành động tức thời.', 'ViOne AI Copilot 5.0'),
          createBullet('Đường ống cơ hội kinh doanh (pipeline) minh bạch, quản trị đối tác và hợp đồng.', 'CRM Đa Kênh'),
          createBullet('Một chạm định danh và kết nối đối tác kinh doanh thông minh.', 'Danh thiếp số NFC & Moments'),
          createBullet('Kết nối giao thương B2B trực tiếp giữa các thành viên trong hệ sinh thái.', 'B2B Marketplace'),

          createHeading1('CHƯƠNG 2: KIẾN TRÚC PHÂN HỆ NGHIỆP VỤ VIONE PLATFORM'),
          createHeading2('2.1. Ma trận 7 Phân hệ Nghiệp vụ Cốt lõi'),
          new Table({
            width: { size: TABLE_WIDTH_DXA, type: WidthType.DXA },
            rows: [
              new TableRow({
                children: [
                  createTableCell('STT', { isHeader: true, widthDxa: 800, align: AlignmentType.CENTER }),
                  createTableCell('Phân hệ', { isHeader: true, widthDxa: 2400 }),
                  createTableCell('Chức năng trọng tâm', { isHeader: true, widthDxa: 3600 }),
                  createTableCell('Đối tượng sử dụng', { isHeader: true, widthDxa: 2400 }),
                ],
              }),
              new TableRow({
                children: [
                  createTableCell('1', { align: AlignmentType.CENTER }),
                  createTableCell('ViOne AI Copilot 5.0', { bold: true }),
                  createTableCell('Hỏi đáp dữ liệu kinh doanh, lập báo cáo tài chính, gợi ý kết nối cơ hội kinh doanh tự động.'),
                  createTableCell('Ban Lãnh đạo, Quản trị viên, Trưởng bộ phận'),
                ],
              }),
              new TableRow({
                children: [
                  createTableCell('2', { align: AlignmentType.CENTER }),
                  createTableCell('CRM & Quản trị Bán hàng', { bold: true }),
                  createTableCell('Quản lý hồ sơ công ty, đối tác, phễu cơ hội (Pipeline), giá trị hợp đồng và tiến trình chăm sóc.'),
                  createTableCell('Đội ngũ Kinh doanh, Sales Leader, Chăm sóc KH'),
                ],
              }),
              new TableRow({
                children: [
                  createTableCell('3', { align: AlignmentType.CENTER }),
                  createTableCell('Hộp thư Đa kênh (Omnibox)', { bold: true }),
                  createTableCell('Hợp nhất tin nhắn đối tác từ App ViOne, Web chat và Zalo OA vào một giao diện tập trung.'),
                  createTableCell('Bộ phận CSKH, Tư vấn viên, Sales'),
                ],
              }),
              new TableRow({
                children: [
                  createTableCell('4', { align: AlignmentType.CENTER }),
                  createTableCell('Danh thiếp số NFC & App Connect', { bold: true }),
                  createTableCell('Chạm NFC thẻ thông minh chia sẻ profile, quét QR, lưu danh bạ tức thời, bảng tin Moments.'),
                  createTableCell('Toàn bộ thành viên doanh nghiệp, đối tác'),
                ],
              }),
              new TableRow({
                children: [
                  createTableCell('5', { align: AlignmentType.CENTER }),
                  createTableCell('Sàn Giao thương B2B', { bold: true }),
                  createTableCell('Đăng sản phẩm dịch vụ, nhu cầu tìm kiếm nhà cung cấp, thuật toán matching ngành nghề.'),
                  createTableCell('Doanh nghiệp thành viên, Đối tác cung ứng'),
                ],
              }),
              new TableRow({
                children: [
                  createTableCell('6', { align: AlignmentType.CENTER }),
                  createTableCell('Quản lý Sự kiện & Biểu quyết', { bold: true }),
                  createTableCell('Tạo sự kiện, check-in QR code, quản lý danh sách tham dự, biểu quyết điện tử minh bạch.'),
                  createTableCell('Ban Tổ chức, Thành viên sự kiện'),
                ],
              }),
              new TableRow({
                children: [
                  createTableCell('7', { align: AlignmentType.CENTER }),
                  createTableCell('Bảo mật & Phân quyền RBAC', { bold: true }),
                  createTableCell('Mã hóa AES-256, kiểm soát phân quyền 4 cấp độ (Admin, Leader, Member, Guest), audit log.'),
                  createTableCell('Quản trị viên hệ thống (System Admin)'),
                ],
              }),
            ],
          }),

          createHeading1('CHƯƠNG 3: QUY TRÌNH VẬN HÀNH & BÁO GIÁ LINH HOẠT'),
          createHeading2('3.1. Chính sách Báo giá Không Niêm yết Cố định (Consultative Pricing)'),
          createP('Khác với các phần mềm bán lẻ đại trà, ViOne 5.0 áp dụng mô hình Báo giá Tư vấn Đồng hành (Consultative Enterprise Pricing):'),
          createBullet('Khảo sát thực tế bài toán vận hành của doanh nghiệp trước khi báo giá.', 'Khảo sát 0đ'),
          createBullet('Khách hàng chỉ đầu tư đúng theo số lượng người dùng thực tế và các phân hệ lựa chọn.', 'Tối ưu chi phí'),
          createBullet('Không niêm yết mức giá cố định (như 500k/tháng) trên Landing Page để kích hoạt phễu tư vấn giải pháp 1-1 chuyên sâu.', 'Chiến lược chuyển đổi'),

          createHeading2('3.2. Tiêu chuẩn Kỹ thuật & Cam kết Vận hành'),
          createBullet('Cam kết thời gian hoạt động hệ thống đạt tối thiểu 99.9% uptime.', 'Độ sẵn sàng (SLA)'),
          createBullet('Mã hóa chuẩn AES-256 cho toàn bộ dữ liệu lưu trữ (Data at rest) và truyền tải (Data in transit TLS 1.3).', 'Bảo mật'),
          createBullet('Tốc độ phản hồi API trung bình dưới 120ms trên hạ tầng NestJS & PostgreSQL Cloud.', 'Hiệu năng'),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  const outDocx = path.join(DOC_DIR, 'BRD_VIONE_YEU_CAU_NGHIEP_VU_TOAN_DIEN.docx');
  fs.writeFileSync(outDocx, buffer);
  fs.copyFileSync(outDocx, path.join(FE_DOCS_DIR, 'BRD_VIONE_YEU_CAU_NGHIEP_VU_TOAN_DIEN.docx'));

  // Also write Markdown version
  const mdContent = `# TÀI LIỆU YÊU CẦU NGHIỆP VỤ TOÀN DIỆN (BRD)
## HỆ THỐNG VIONE PLATFORM & TRỢ LÝ AI COPILOT 5.0

**Đơn vị phát triển:** Ban Giải pháp Công nghệ ViOne Ecosystem  
**Mã tài liệu:** BRD-VIONE-5.0-MASTER-2026  
**Phiên bản:** 5.0.0 (Localhost Master Golden Standard)  
**Ngày phát hành:** Tháng 10 / 2026  

---

### CHƯƠNG 1: TỔNG QUAN DỰ ÁN & MỤC TIÊU CHIẾN LƯỢC
ViOne Platform 5.0 là nền tảng quản trị và tự động hóa vận hành toàn diện dành cho Doanh nghiệp, Tập đoàn và Mạng lưới Kinh doanh. 
Hệ sinh thái kết hợp 7 phân hệ cốt lõi:
1. **ViOne AI Copilot 5.0:** Trợ lý AI thế hệ mới hỗ trợ phân tích dữ liệu, báo cáo tài chính và tự động hóa tác vụ.
2. **CRM & Quản trị Bán hàng:** Quản lý đối tác, đường ống cơ hội (Pipeline) và doanh số.
3. **Hộp thư Đa kênh (Omnibox):** Hợp nhất tin nhắn từ App ViOne, Web chat và Zalo OA.
4. **Danh thiếp số NFC & Moments:** Một chạm chia sẻ hồ sơ số và kết nối kinh doanh tức thì.
5. **Sàn Giao thương B2B Marketplace:** Đăng chào mua, chào bán sản phẩm dịch vụ với thuật toán matching AI.
6. **Sự kiện & Biểu quyết Điện tử:** Quản lý hội nghị, check-in QR Code, khảo sát và biểu quyết minh bạch.
7. **Bảo mật Cấp độ Doanh nghiệp:** Mã hóa AES-256, kiểm soát phân quyền RBAC đa cấp độ và nhật ký kiểm toán.

---

### CHƯƠNG 2: CHÍNH SÁCH BÁO GIÁ TƯ VẤN DOANH NGHIỆP
ViOne áp dụng chính sách **Báo giá Tư vấn Đồng hành (Consultative Enterprise Pricing)**, không niêm yết mức giá cố định trên Web Landing nhằm:
- Khảo sát chính xác quy mô và mức độ số hóa của từng tổ chức.
- Tối ưu 100% chi phí đầu tư cho doanh nghiệp, loại bỏ lãng phí tính năng thừa.
- Tiếp nhận thông tin qua Modal Báo giá Sang trọng và cử Giám đốc Giải pháp tư vấn 1-1 trong 15 phút.
`;

  const outMd = path.join(DOC_DIR, 'BRD_VIONE_YEU_CAU_NGHIEP_VU_TOAN_DIEN.md');
  fs.writeFileSync(outMd, mdContent, 'utf8');
  fs.copyFileSync(outMd, path.join(FE_DOCS_DIR, 'BRD_VIONE_YEU_CAU_NGHIEP_VU_TOAN_DIEN.md'));

  console.log('✓ Hoàn tất xuất bản BRD ViOne:');
  console.log('  -', outDocx);
  console.log('  -', outMd);
}

buildViOneBrd().catch(console.error);
