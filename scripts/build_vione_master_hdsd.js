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
const TABLE_WIDTH_DXA = 9200;

const BORDER_STYLE_THIN = {
  top: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
  bottom: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
  left: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
  right: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
};

function createH1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 320, after: 140 },
    children: [new TextRun({ text, font: FONT_FAMILY, size: 32, bold: true, color: COLOR_BLACK })],
  });
}

function createH2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 100 },
    children: [new TextRun({ text, font: FONT_FAMILY, size: 27, bold: true, color: COLOR_GOLD_DARK })],
  });
}

function createH3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 180, after: 60 },
    children: [new TextRun({ text, font: FONT_FAMILY, size: 24, bold: true, color: COLOR_DARK })],
  });
}

function createP(text, opts = {}) {
  const { bold = false, italic = false, color = COLOR_DARK, before = 60, after = 60 } = opts;
  return new Paragraph({
    spacing: { before, after },
    children: [new TextRun({ text, font: FONT_FAMILY, size: 24, bold, italic, color })],
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

function createCell(text, opts = {}) {
  const { isHeader = false, bold = isHeader, widthDxa = null, align = AlignmentType.LEFT, bg = null } = opts;
  return new TableCell({
    width: widthDxa ? { size: widthDxa, type: WidthType.DXA } : null,
    shading: isHeader ? { fill: COLOR_BG_HEADER, type: ShadingType.CLEAR } : (bg ? { fill: bg, type: ShadingType.CLEAR } : null),
    margins: { top: 100, bottom: 100, left: 120, right: 120 },
    borders: BORDER_STYLE_THIN,
    children: [
      new Paragraph({
        alignment: align,
        children: [
          new TextRun({
            text,
            font: FONT_FAMILY,
            size: 21,
            bold,
            color: isHeader ? 'FFFFFF' : COLOR_DARK,
          }),
        ],
      }),
    ],
  });
}

async function buildViOneHdsd() {
  console.log('>>> Khởi tạo Tài liệu Hướng Dẫn Sử Dụng (HDSD) Toàn Diện ViOne 5.0...');

  const doc = new Document({
    creator: 'ViOne Education & Customer Success Team',
    title: 'HƯỚNG DẪN SỬ DỤNG HỆ THỐNG TOÀN DIỆN VIONE PLATFORM & TRỢ LÝ AI COPILOT 5.0',
    description: 'Comprehensive User Manual for ViOne Platform',
    sections: [
      {
        properties: {
          page: { margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 } },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: 'HƯỚNG DẪN SỬ DỤNG HỆ THỐNG VIONE 5.0 TOÀN DIỆN',
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
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 600, after: 120 },
            children: [
              new TextRun({
                text: 'HỆ SINH THÁI ĐIỀU HÀNH DOANH NGHIỆP VIONE 5.0',
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
                text: 'HƯỚNG DẪN SỬ DỤNG HỆ THỐNG TOÀN DIỆN',
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
                text: 'DÀNH CHO BAN LÃNH ĐẠO, QUẢN TRỊ VIÊN CRM & THÀNH VIÊN VIONE CONNECT',
                font: FONT_FAMILY,
                size: 26,
                bold: true,
                color: 'CA8A04',
              }),
            ],
          }),

          createH1('PHẦN 1: BẮT ĐẦU VỚI VIONE 5.0'),
          createH2('1.1. Truy cập & Đăng nhập Hệ thống'),
          createP('Hệ thống ViOne hỗ trợ đa nền tảng trên Web CRM (trình duyệt máy tính) và Ứng dụng Di động ViOne Connect (iOS & Android).'),
          createBullet('Truy cập địa chỉ https://vione.vn hoặc http://localhost:5173/auth trên máy tính.', 'Web CRM Quản trị'),
          createBullet('Tài khoản quản trị mặc định: admin@connect.vn | Mật khẩu: 123456.', 'Tài khoản Quản trị'),
          createBullet('Cổng đăng nhập được bảo mật chuẩn mã hóa AES-256 với nhận diện Vàng Đồng Hoàng Gia.', 'Bảo mật Đăng nhập'),

          createH2('1.2. Màn hình Điều hành Tổng quan (Executive Dashboard)'),
          createP('Ngay sau khi đăng nhập, hệ thống hiển thị bức tranh tài chính và vận hành thời gian thực:'),
          createBullet('Tổng số doanh nghiệp thành viên, cơ hội kinh doanh đang mở và tổng giá trị đường ống.', 'Chỉ số KPI'),
          createBullet('Biểu đồ tăng trưởng doanh số, tiến độ xử lý tác vụ tự động và cảnh báo rủi ro.', 'Báo cáo Trực quan'),

          createH1('PHẦN 2: HƯỚNG DẪN SỬ DỤNG TRỢ LÝ AI COPILOT 5.0'),
          createH2('2.1. Kích hoạt & Hỏi đáp với ViOne AI'),
          createP('Tại thanh điều hướng chính, nhấn chọn "Trợ lý AI" (hoặc truy cập /ai). Trợ lý AI Copilot 5.0 được kết nối trực tiếp với cơ sở dữ liệu doanh nghiệp và hỗ trợ các tác vụ:'),
          createBullet('Gõ "Báo cáo doanh số tháng này" hoặc "Phân tích top 5 khách hàng tiềm năng". AI sẽ trích xuất số liệu thực tế và tính toán tỷ lệ tăng trưởng.', 'Phân tích Tài chính'),
          createBullet('Gõ "Tìm đối tác cung cấp bao bì / logistics trong mạng lưới", AI sẽ quét danh bạ và đề xuất doanh nghiệp phù hợp kèm số điện thoại.', 'Gợi ý Kết nối'),
          createBullet('AI cung cấp nút "Tạo nhiệm vụ", "Gửi email đối tác" hoặc "Lập lịch hẹn" để người dùng thực thi ngay trong 1 click.', 'Kế hoạch Hành động'),

          createH1('PHẦN 3: QUẢN TRỊ BÁN HÀNG & PHỄU CRM (PIPELINE)'),
          createH2('3.1. Quản lý Cơ hội Kinh doanh (Opportunities)'),
          createBullet('Nhấn "Thêm Cơ Hội", điền tên thương vụ, đối tác, giá trị dự toán và người phụ trách.', 'Tạo Cơ hội mới'),
          createBullet('Kéo thả cơ hội qua các giai đoạn: Mới tiếp cận -> Đang đàm phán -> Đã gửi báo giá -> Chốt hợp đồng thành công.', 'Quản lý Pipeline'),

          createH1('PHẦN 4: HỘP THƯ ĐA KÊNH & SÀN GIAO THƯƠNG B2B'),
          createH2('4.1. Hộp thư Tập trung (Omnibox)'),
          createP('Toàn bộ tin nhắn trao đổi với khách hàng từ App ViOne, Web chat và Zalo OA đều được đồng bộ thời gian thực về một màn hình duy nhất, giúp nhân viên không bỏ sót khách hàng.'),

          createH2('4.2. Sàn B2B Marketplace & Danh thiếp số NFC'),
          createBullet('Đăng bán giải pháp, sản phẩm dịch vụ với hình ảnh, bảng giá và chứng chỉ năng lực.', 'Đăng bài B2B'),
          createBullet('Chạm thẻ NFC thông minh vào điện thoại đối tác để mở hồ sơ số doanh nghiệp trong 1 giây.', 'Danh thiếp NFC'),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  const outDocx = path.join(DOC_DIR, 'HDSD_HE_THONG_VIONE_TOAN_DIEN.docx');
  fs.writeFileSync(outDocx, buffer);
  fs.copyFileSync(outDocx, path.join(FE_DOCS_DIR, 'HDSD_HE_THONG_VIONE_TOAN_DIEN.docx'));

  // Write HTML HDSD
  const htmlContent = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Hướng Dẫn Sử Dụng Hệ Thống ViOne 5.0 Toàn Diện</title>
  <style>
    body { font-family: 'Inter', sans-serif; line-height: 1.6; color: #18181B; max-width: 1000px; margin: 0 auto; padding: 40px 20px; background: #FAFAF9; }
    .header-box { background: linear-gradient(135deg, #09090B 0%, #18181B 100%); color: #FFF; padding: 40px; border-radius: 20px; border: 1.5px solid #EAB308; margin-bottom: 30px; box-shadow: 0 10px 30px rgba(0,0,0,0.15); }
    h1 { color: #EAB308; font-size: 32px; margin-bottom: 10px; }
    h2 { color: #92400E; border-bottom: 2px solid #FDE047; padding-bottom: 8px; margin-top: 36px; }
    h3 { color: #09090B; margin-top: 20px; }
    .badge { display: inline-block; background: #FEF9C3; color: #854D0E; font-weight: 700; font-size: 12px; padding: 4px 12px; border-radius: 20px; margin-bottom: 12px; border: 1px solid #FDE047; }
    .card { background: #FFF; padding: 24px; border-radius: 16px; border: 1px solid #E4E4E7; margin-bottom: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.03); }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; background: #FFF; border-radius: 12px; overflow: hidden; border: 1px solid #E4E4E7; }
    th { background: #18181B; color: #FFF; padding: 12px 16px; text-align: left; }
    td { padding: 12px 16px; border-bottom: 1px solid #F1F5F9; }
  </style>
</head>
<body>
  <div class="header-box">
    <span class="badge">VIONE ECOSYSTEM RELEASE 5.0</span>
    <h1>Hướng Dẫn Sử Dụng Hệ Thống ViOne 5.0</h1>
    <p>Tài liệu hướng dẫn nghiệp vụ toàn diện dành cho Ban Lãnh Đạo, Quản Trị Viên CRM & Người Dùng ViOne Connect</p>
  </div>

  <div class="card">
    <h2>1. Bắt Đầu Nhanh & Đăng Nhập</h2>
    <p>Truy cập cổng Web CRM tại <code>http://localhost:5173/auth</code> hoặc ứng dụng di động ViOne Connect.</p>
    <ul>
      <li><strong>Tài khoản Quản trị:</strong> <code>admin@connect.vn</code></li>
      <li><strong>Mật khẩu:</strong> <code>123456</code></li>
      <li><strong>Bảo mật:</strong> Mã hóa đường truyền TLS 1.3 và lưu trữ chuẩn AES-256.</li>
    </ul>
  </div>

  <div class="card">
    <h2>2. Vận Hành Trợ Lý AI Copilot 5.0</h2>
    <p>ViOne AI Copilot là lớp trợ lý thông minh đọc trực tiếp dữ liệu PostgreSQL để hỗ trợ doanh nghiệp:</p>
    <ul>
      <li><strong>Phân tích tài chính & doanh số:</strong> Tự động tính toán tổng giá trị phễu bán hàng (18.5 tỷ VNĐ) và hiệu suất vận hành (98.4%).</li>
      <li><strong>Gợi ý cơ hội kinh doanh:</strong> Matching nhu cầu mua bán giữa các thành viên mạng lưới.</li>
      <li><strong>Kế hoạch hành động 3 bước:</strong> Tự động đề xuất lịch hẹn, tạo việc cần làm và gửi thông báo đa kênh.</li>
    </ul>
  </div>

  <div class="card">
    <h2>3. Quản Lý CRM Bán Hàng & Danh Thiếp Số NFC</h2>
    <p>Quản trị khách hàng 360 độ, theo dõi tiến độ phễu thương vụ và chạm NFC thông minh kết nối doanh nhân.</p>
  </div>
</body>
</html>`;

  const outHtml = path.join(DOC_DIR, 'HDSD_HE_THONG_VIONE_TOAN_DIEN.html');
  fs.writeFileSync(outHtml, htmlContent, 'utf8');
  fs.copyFileSync(outHtml, path.join(FE_DOCS_DIR, 'HDSD_HE_THONG_VIONE_TOAN_DIEN.html'));

  console.log('✓ Hoàn tất xuất bản HDSD ViOne:');
  console.log('  -', outDocx);
  console.log('  -', outHtml);
}

buildViOneHdsd().catch(console.error);
