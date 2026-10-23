const fs = require('fs');
const path = require('path');
const docx = require('docx');
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
  ImageRun,
  Header,
  Footer,
  PageNumber
} = docx;

// Helper to create paragraphs
function p(text, options = {}) {
  const {
    bold = false,
    italic = false,
    size = 24, // 12pt
    align = AlignmentType.LEFT,
    before = 60,
    after = 60,
    line = 276, // 1.15 line spacing
    color = '000000',
    indent = 0
  } = options;

  return new Paragraph({
    alignment: align,
    spacing: { before, after, line },
    indent: indent ? { left: indent } : undefined,
    children: [
      new TextRun({
        text,
        font: 'Times New Roman',
        size,
        bold,
        italics: italic,
        color
      })
    ]
  });
}

function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 240, after: 120 },
    children: [
      new TextRun({
        text,
        font: 'Times New Roman',
        size: 32, // 16pt
        bold: true,
        color: '1F3864'
      })
    ]
  });
}

function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 180, after: 80 },
    children: [
      new TextRun({
        text,
        font: 'Times New Roman',
        size: 28, // 14pt
        bold: true,
        color: '2E75B6'
      })
    ]
  });
}

function h3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 120, after: 60 },
    children: [
      new TextRun({
        text,
        font: 'Times New Roman',
        size: 26, // 13pt
        bold: true,
        italics: true,
        color: '1F3864'
      })
    ]
  });
}

function imgItem(relPath, caption, width = 540, height = 338) {
  const fullPath = path.isAbsolute(relPath) ? relPath : path.join(__dirname, '..', relPath);
  if (!fs.existsSync(fullPath)) {
    console.warn('Image not found:', fullPath);
    return [p(`[Hình ảnh: ${caption} - Tệp không tồn tại]`, { italic: true, align: AlignmentType.CENTER })];
  }
  const imgData = fs.readFileSync(fullPath);
  return [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 140, after: 60 },
      children: [
        new ImageRun({
          data: imgData,
          transformation: { width, height }
        })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 40, after: 140 },
      children: [
        new TextRun({
          text: `Hình: ${caption}`,
          font: 'Times New Roman',
          size: 22, // 11pt
          italics: true,
          bold: true,
          color: '333333'
        })
      ]
    })
  ];
}

function codeItem(codeText, title) {
  const lines = codeText.split('\n');
  const codeParagraphs = lines.map(line => {
    return new Paragraph({
      spacing: { before: 0, after: 0, line: 200 },
      children: [
        new TextRun({
          text: line,
          font: 'Consolas',
          size: 17, // 8.5pt
          color: '1E293B'
        })
      ]
    });
  });

  return [
    new Paragraph({
      spacing: { before: 140, after: 40 },
      children: [
        new TextRun({
          text: `// Mã nguồn: ${title}`,
          font: 'Consolas',
          size: 20,
          bold: true,
          color: '0F172A'
        })
      ]
    }),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              shading: { fill: 'F8FAFC' },
              margins: { top: 120, bottom: 120, left: 160, right: 160 },
              borders: {
                top: { style: BorderStyle.SINGLE, size: 6, color: 'CBD5E1' },
                bottom: { style: BorderStyle.SINGLE, size: 6, color: 'CBD5E1' },
                left: { style: BorderStyle.SINGLE, size: 12, color: '2563EB' },
                right: { style: BorderStyle.SINGLE, size: 6, color: 'CBD5E1' }
              },
              children: codeParagraphs
            })
          ]
        })
      ]
    })
  ];
}

async function buildDoc4() {
  console.log('Generating Document 04 - Trình bày tác phẩm (Bản cop đĩa) with LIVE SUBDOMAINS...');

  const docChildren = [];

  // ===================== TRANG BÌA =====================
  docChildren.push(
    p('CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM', { bold: true, align: AlignmentType.CENTER, size: 28, before: 200, after: 40 }),
    p('Độc lập – Tự do – Hạnh phúc', { bold: true, align: AlignmentType.CENTER, size: 28, before: 0, after: 120 }),
    p('---------------o0o---------------', { align: AlignmentType.CENTER, size: 24, before: 0, after: 400 }),

    p('TÀI LIỆU KỸ THUẬT & TRÌNH BÀY TÁC PHẨM', { bold: true, align: AlignmentType.CENTER, size: 36, color: '1F3864', before: 200, after: 80 }),
    p('ĐĂNG KÝ QUYỀN TÁC GIẢ ĐỐI VỚI CHƯƠNG TRÌNH MÁY TÍNH', { bold: true, align: AlignmentType.CENTER, size: 30, color: '2E75B6', before: 0, after: 200 }),

    p('TÊN TÁC PHẨM:', { bold: true, align: AlignmentType.CENTER, size: 24, color: '555555', before: 100, after: 40 }),
    p('HỆ THỐNG PHẦN MỀM QUẢN TRỊ KẾT NỐI DOANH NGHIỆP VÀ ỨNG DỤNG DI ĐỘNG CEO 1983', { bold: true, align: AlignmentType.CENTER, size: 32, color: 'C00000', before: 0, after: 40 }),
    p('(CEO 1983 PLATFORM & MOBILE APP)', { bold: true, align: AlignmentType.CENTER, size: 28, color: '1F3864', before: 0, after: 300 }),

    p('MÔI TRƯỜNG TRIỂN KHAI VẬN HÀNH TRỰC TUYẾN TRÊN 02 TÊN MIỀN PHỤ (SUBDOMAINS):', { bold: true, align: AlignmentType.CENTER, size: 22, color: '0F172A', before: 100, after: 40 }),
    p('1. CỔNG QUẢN TRỊ WEB CRM: https://crm.ceo1983.viconnect.vn', { bold: true, align: AlignmentType.CENTER, size: 24, color: '003B95', before: 0, after: 20 }),
    p('2. ỨNG DỤNG DI ĐỘNG HỘI VIÊN: https://ceo1983.viconnect.vn', { bold: true, align: AlignmentType.CENTER, size: 24, color: '003B95', before: 0, after: 400 }),

    p('CHỦ SỞ HỮU QUYỀN TÁC GIẢ:', { bold: true, size: 24, before: 200, after: 20 }),
    p('[TÊN DOANH NGHIỆP / TỔ CHỨC ĐĂNG KÝ]', { bold: true, size: 26, color: '1F3864', before: 0, after: 40 }),
    p('Địa chỉ: .........................................................................................................................', { size: 24, before: 0, after: 40 }),
    p('Mã số doanh nghiệp / Quyết định thành lập: ............................................................', { size: 24, before: 0, after: 120 }),

    p('TÁC GIẢ TẠO RA TÁC PHẨM:', { bold: true, size: 24, before: 40, after: 20 }),
    p('Họ và tên tác giả: ...........................................................................................................', { bold: true, size: 24, before: 0, after: 40 }),
    p('Số CCCD: ............................................................ Ngày cấp: ....../....../.......... Nơi cấp: ....................................', { size: 24, before: 0, after: 40 }),
    p('Địa chỉ thường trú: .........................................................................................................', { size: 24, before: 0, after: 500 }),

    p('HÀ NỘI – NĂM 2026', { bold: true, align: AlignmentType.CENTER, size: 26, color: '1F3864', before: 200, after: 100 }),

    new Paragraph({ pageBreakBefore: true, children: [] })
  );

  // ===================== MỤC LỤC =====================
  docChildren.push(
    h1('MỤC LỤC TÀI LIỆU'),
    p('CHƯƠNG 1: GIỚI THIỆU TỔNG QUAN VỀ HỆ THỐNG PHẦN MỀM', { bold: true }),
    p('  1.1 Mục đích và ý nghĩa xây dựng hệ thống', { indent: 400 }),
    p('  1.2 Phạm vi ứng dụng và môi trường triển khai 2 Subdomain', { indent: 400 }),
    p('  1.3 Kiến trúc tổng thể 4 tầng (4-Tier Enterprise Architecture)', { indent: 400 }),
    p('  1.4 Danh mục công nghệ và nền tảng mã nguồn mở sử dụng', { indent: 400 }),

    p('CHƯƠNG 2: MÔ TẢ CHI TIẾT TÍNH NĂNG VÀ LUỒNG XỬ LÝ THEO NODE', { bold: true }),
    p('  2.1 Kiến trúc và luồng xử lý 17 Functional Nodes phân hệ Web CRM (https://crm.ceo1983.viconnect.vn)', { indent: 400 }),
    p('  2.2 Kiến trúc và luồng xử lý 14 Functional Nodes phân hệ Mobile App (https://ceo1983.viconnect.vn)', { indent: 400 }),
    p('  2.3 Cơ chế phân quyền RBAC và an toàn bảo mật hệ thống', { indent: 400 }),
    p('  2.4 Các yêu cầu phi chức năng và tiêu chuẩn hiệu năng', { indent: 400 }),

    p('PHỤ LỤC I: BẢNG YÊU CẦU KỸ THUẬT CỦA PHẦN MỀM', { bold: true }),
    p('  (22 Hạng mục quy chuẩn kỹ thuật theo chuẩn Cục Bản quyền tác giả)', { indent: 400 }),

    p('PHỤ LỤC II: HƯỚNG DẪN SỬ DỤNG VÀ GIAO DIỆN WEB CRM (https://crm.ceo1983.viconnect.vn)', { bold: true }),
    p('  (12 Quy trình vận hành & Hình ảnh chụp giao diện thực tế trích xuất trực tiếp từ Subdomain)', { indent: 400 }),

    p('PHỤ LỤC III: HƯỚNG DẪN SỬ DỤNG VÀ GIAO DIỆN MOBILE APP (https://ceo1983.viconnect.vn)', { bold: true }),
    p('  (11 Quy trình trải nghiệm & Hình ảnh chụp giao diện di động thực tế trích xuất trực tiếp từ Subdomain)', { indent: 400 }),

    p('PHỤ LỤC IV: TRÍCH XUẤT MÃ NGUỒN ĐẠI DIỆN IN NỘP ĐĨA / BẢN IN', { bold: true }),
    p('  (Trích xuất mã nguồn thực tế: main.ts, app.module.ts, auth.service.ts, business-card.service.ts, router.tsx)', { indent: 400 }),

    new Paragraph({ pageBreakBefore: true, children: [] })
  );

  // ===================== CHƯƠNG 1 =====================
  docChildren.push(
    h1('CHƯƠNG 1: GIỚI THIỆU TỔNG QUAN VỀ HỆ THỐNG PHẦN MỀM'),

    h2('1.1 Mục đích và ý nghĩa xây dựng hệ thống'),
    p('Hệ thống phần mềm quản trị kết nối doanh nghiệp và Ứng dụng di động CEO 1983 (CEO 1983 Platform & Mobile App) được nghiên cứu, thiết kế và phát triển chuyên biệt phục vụ công tác chuyển đổi số toàn diện cho Câu lạc bộ Doanh nhân CEO 1983 trực thuộc Hiệp hội Doanh nghiệp Trẻ Hà Nội (HanoiBA).'),
    p('Mục tiêu trọng tâm của phần mềm gồm:'),
    p('1. Số hóa công tác quản trị và điều hành Hiệp hội: Giúp Chủ tịch, Ban Điều Hành, Ban Thư Ký và 6 Ban Chuyên Môn (Quản Trị, Thư Ký, Tài Chính, Truyền Thông, Thành Viên, Xúc Tiến Thương Mại) điều hành tập trung, minh bạch, bảo mật và tức thời qua Cổng Quản trị Web CRM.'),
    p('2. Xây dựng mạng lưới kết nối giao thương B2B bền vững: Cung cấp sàn giao thương nội bộ với 4 phân hệ danh mục cơ hội, tạo cơ chế giới thiệu cơ hội kinh doanh (Referral Networking), đăng tải gian hàng số và kết nối đối tác một chạm.'),
    p('3. Định danh số và tối ưu trải nghiệm Hội viên: Phát hành thẻ hội viên số hóa nhận diện 3 màu thương hiệu, tích hợp mã QR cá nhân hóa và công nghệ tiệm cận NFC một chạm, thay thế hoàn toàn danh thiếp giấy truyền thống.'),
    p('4. Tự động hóa tổ chức sự kiện & điểm danh thông minh: Quản lý lịch sự kiện, chuyên đề đào tạo có tính năng Bắn Mạng Lưới (đẩy bài viết kèm poster và QR xuống app), bán vé, phân bổ bàn tiệc trực quan và quét mã QR check-in siêu tốc dưới 500ms.'),
    p('5. Quản lý tài chính minh bạch: Tự động phát hành mã VietQR Napas 247 gắn nội dung định danh thu hội phí, xuất báo cáo Sổ quỹ tiền mặt chuẩn Mẫu S07-DN theo Thông tư 200/2014/TT-BTC của Bộ Tài Chính.'),

    h2('1.2 Phạm vi ứng dụng và môi trường triển khai 2 Subdomain'),
    p('Hệ thống được kiến trúc phân lập độc lập thành 02 phân hệ chính chạy trên 02 tên miền phụ (subdomain) chuyên biệt kết nối về cùng một cụm máy chủ Backend và Cơ sở dữ liệu tập trung:'),
    p('• Subdomain 1: `https://crm.ceo1983.viconnect.vn` - Cổng Quản trị & Vận hành Web CRM:', { bold: true }),
    p('  - Đối tượng sử dụng: Chủ tịch CLB, Ban Điều Hành, Ban Thư Ký, Kế toán trưởng, Thủ quỹ, Trưởng các ban chuyên môn và Quản trị viên hệ thống.'),
    p('  - Thiết bị truy cập: Máy tính để bàn (Desktop), máy tính xách tay (Laptop), máy tính bảng màn hình lớn.'),
    p('  - Giao diện: Tối ưu cho màn hình rộng (Desktop Viewport 1440px+), bảng dữ liệu chuẩn Excel, bộ lọc tìm kiếm đa tầng, biểu đồ Recharts phân tích tài chính & giao thương, hộp thoại Drawer trượt cạnh phải.'),
    p('• Subdomain 2: `https://ceo1983.viconnect.vn` - Ứng dụng Di động Hội viên CEO 1983:', { bold: true }),
    p('  - Đối tượng sử dụng: Toàn thể các CEO, doanh nhân thành viên chính thức và khách mời của CLB Doanh nhân CEO 1983.'),
    p('  - Thiết bị truy cập: Điện thoại thông minh (iOS qua Safari/Capacitor, Android qua Chrome/Capacitor), máy tính bảng di động, hỗ trợ đóng gói PWA và Native App.'),
    p('  - Giao diện: Tối ưu giao diện di động (Mobile-first Viewport), thanh điều hướng đáy Footer Navigation, cử chỉ vuốt chạm linh hoạt, tích hợp phản hồi rung cảm ứng (Haptic Engine) và hiển thị thẻ hội viên nhận diện 3 màu sắc nét.'),

    h2('1.3 Kiến trúc tổng thể 4 tầng (4-Tier Enterprise Architecture)'),
    p('Phần mềm tuân thủ nghiêm ngặt mô hình kiến trúc phân tầng chuẩn doanh nghiệp (4-Tier Architecture), bảo đảm tính độc lập, khả năng mở rộng cao và an toàn thông tin:'),
    p('1. Tầng 1 - Giao diện người dùng (Presentation Tier): Bao gồm Web CRM (React 18 + Vite + Tailwind CSS) và Mobile App (Capacitor 5 + React 18 + Touch Engine). Hai phân hệ được biên dịch độc lập, nạp tài nguyên tĩnh qua CDN và giao tiếp với Backend qua RESTful API và WebSocket.'),
    p('2. Tầng 2 - Cổng mạng an toàn & Bảo mật (API Gateway & Security Tier): Nginx Reverse Proxy tiếp nhận lưu lượng HTTPS trên cổng 443 với chứng chỉ TLS 1.3 Let\'s Encrypt 2048-bit, thực hiện định tuyến phân tách tên miền giữa CRM và App, kiểm soát CORS, rate-limiting phòng chống DDoS và bảo vệ ứng dụng trước các tấn công Web thông dụng.'),
    p('3. Tầng 3 - Dịch vụ xử lý nghiệp vụ trung tâm (Application Business Logic Tier): Khung ứng dụng NestJS 10 trên nền Node.js v20+ xây dựng theo kiến trúc 3 lớp thuần khiết (Controller -> Service -> Repository). Tầng này chịu trách nhiệm kiểm tra DTO, xác thực JWT, phân quyền RBAC và thực thi mọi quy trình nghiệp vụ.'),
    p('4. Tầng 4 - Dữ liệu & Lưu trữ bền vững (Data & Storage Tier): CSDL quan hệ trung tâm PostgreSQL 16 bảo đảm toàn vẹn giao dịch (ACID), bộ nhớ đệm Redis 7 hỗ trợ hàng đợi và kiểm soát phiên, kho lưu trữ MinIO tương thích S3 lưu trữ tệp tin đa phương tiện.'),

    h2('1.4 Danh mục công nghệ và nền tảng mã nguồn mở sử dụng'),
    p('Hệ thống được phát triển trên các công nghệ tiên tiến hàng đầu thế giới, bảo đảm tính ổn định lâu dài và dễ dàng bảo trì nâng cấp:')
  );

  // Tech table
  const techList = [
    { stt: '1', tech: 'React 18', type: 'Frontend Framework', license: 'MIT', repo: 'https://github.com/facebook/react' },
    { stt: '2', tech: 'Vite 5', type: 'Build Tool & Bundler', license: 'MIT', repo: 'https://github.com/vitejs/vite' },
    { stt: '3', tech: 'TypeScript 5', type: 'Typed Programming Language', license: 'Apache-2.0', repo: 'https://github.com/microsoft/TypeScript' },
    { stt: '4', tech: 'Tailwind CSS 3', type: 'Utility-First CSS Framework', license: 'MIT', repo: 'https://github.com/tailwindlabs/tailwindcss' },
    { stt: '5', tech: 'Capacitor 5', type: 'Native Cross-Platform Runtime', license: 'MIT', repo: 'https://github.com/ionic-team/capacitor' },
    { stt: '6', tech: 'NestJS 10', type: 'Backend Enterprise Framework', license: 'MIT', repo: 'https://github.com/nestjs/nest' },
    { stt: '7', tech: 'PostgreSQL 16', type: 'Relational Database Engine', license: 'PostgreSQL', repo: 'https://github.com/postgres/postgres' },
    { stt: '8', tech: 'TypeORM 0.3', type: 'Object-Relational Mapping (ORM)', license: 'MIT', repo: 'https://github.com/typeorm/typeorm' },
    { stt: '9', tech: 'Redis 7', type: 'In-Memory Cache & Session Store', license: 'BSD-3-Clause', repo: 'https://github.com/redis/redis' },
    { stt: '10', tech: 'MinIO', type: 'S3-Compatible Object Storage', license: 'AGPL-3.0', repo: 'https://github.com/minio/minio' },
    { stt: '11', tech: 'Nginx', type: 'High Performance Reverse Proxy', license: '2-Clause BSD', repo: 'https://github.com/nginx/nginx' },
    { stt: '12', tech: 'Socket.IO 4', type: 'Real-time WebSocket Engine', license: 'MIT', repo: 'https://github.com/socketio/socket.io' },
    { stt: '13', tech: 'Recharts 2', type: 'Data Visualization & Charts', license: 'MIT', repo: 'https://github.com/recharts/recharts' },
    { stt: '14', tech: 'Leaflet 1.9', type: 'Interactive GPS Mapping Library', license: 'BSD-2-Clause', repo: 'https://github.com/Leaflet/Leaflet' },
    { stt: '15', tech: 'Docker & Compose', type: 'Containerization Platform', license: 'Apache-2.0', repo: 'https://github.com/docker/compose' }
  ];

  const techRows = techList.map((t, idx) => {
    const fill = idx % 2 === 1 ? 'F2F4F7' : 'FFFFFF';
    return new TableRow({
      children: [
        new TableCell({ shading: { fill }, children: [p(t.stt, { align: AlignmentType.CENTER, size: 22 })] }),
        new TableCell({ shading: { fill }, children: [p(t.tech, { bold: true, size: 22 })] }),
        new TableCell({ shading: { fill }, children: [p(t.type, { size: 22 })] }),
        new TableCell({ shading: { fill }, children: [p(t.license, { align: AlignmentType.CENTER, size: 22 })] }),
        new TableCell({ shading: { fill }, children: [p(t.repo, { size: 20 })] })
      ]
    });
  });

  docChildren.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          tableHeader: true,
          children: [
            new TableCell({ width: { size: 6, type: WidthType.PERCENTAGE }, shading: { fill: '1F3864' }, children: [p('STT', { bold: true, color: 'FFFFFF', align: AlignmentType.CENTER })] }),
            new TableCell({ width: { size: 20, type: WidthType.PERCENTAGE }, shading: { fill: '1F3864' }, children: [p('Thư viện / Nền tảng', { bold: true, color: 'FFFFFF', align: AlignmentType.CENTER })] }),
            new TableCell({ width: { size: 28, type: WidthType.PERCENTAGE }, shading: { fill: '1F3864' }, children: [p('Chức năng đảm nhiệm', { bold: true, color: 'FFFFFF', align: AlignmentType.CENTER })] }),
            new TableCell({ width: { size: 16, type: WidthType.PERCENTAGE }, shading: { fill: '1F3864' }, children: [p('Giấy phép', { bold: true, color: 'FFFFFF', align: AlignmentType.CENTER })] }),
            new TableCell({ width: { size: 30, type: WidthType.PERCENTAGE }, shading: { fill: '1F3864' }, children: [p('Kho lưu trữ (Repository)', { bold: true, color: 'FFFFFF', align: AlignmentType.CENTER })] })
          ]
        }),
        ...techRows
      ]
    }),
    new Paragraph({ pageBreakBefore: true, children: [] })
  );

  // ===================== CHƯƠNG 2 =====================
  docChildren.push(
    h1('CHƯƠNG 2: MÔ TẢ CHI TIẾT TÍNH NĂNG VÀ LUỒNG XỬ LÝ THEO NODE'),

    h2('2.1 Kiến trúc và luồng xử lý 17 Functional Nodes phân hệ Web CRM (https://crm.ceo1983.viconnect.vn)'),
    p('Phân hệ Cổng Quản trị Web CRM được cấu trúc thành 17 Functional Nodes vận hành độc lập:'),
    p('1. [NODE-CRM-001] Đăng nhập & Xác thực Quản trị: Tiếp nhận tài khoản quản trị, xác thực mã băm Bcrypt, cấp phát cặp JWT Access Token (15 phút) và Refresh Token (7 ngày), tự động phân giải vai trò lãnh đạo/ban chuyên môn.'),
    p('2. [NODE-CRM-002] Bảng điều khiển Tổng quan (Dashboard Điều hành): Tổng hợp chỉ số KPI theo thời gian thực (tổng hội viên, hội viên chờ duyệt, doanh thu quỹ, giá trị deal B2B), biểu đồ dòng tiền Recharts và danh sách sự kiện sắp diễn ra.'),
    p('3. [NODE-CRM-003] Module Thống kê Phân tích & Bục Vinh Danh Top 3: Tối ưu 5 danh mục chuyên biệt (Cơ hội, Giao dịch, Tương tác, Sự kiện, Hội viên tích cực); biểu đồ Composed Bar-Line phân hóa xu hướng tăng xanh / giảm đỏ; bục vinh danh 1 hàng ngang 3 cột; hỗ trợ xuất báo cáo chuẩn doanh nghiệp (A4 Bản in & Excel .xlsx).'),
    p('4. [NODE-CRM-004] Quản lý Danh sách Hội viên: Bảng dữ liệu chuẩn Excel, hỗ trợ tìm kiếm nhanh, lọc theo 6 ban chuyên môn, xem tình trạng đóng hội phí, kích hoạt hoặc khóa tài khoản hội viên.'),
    p('5. [NODE-CRM-005] Ngăn kéo Hồ sơ Hội viên (Member Drawer): Mở drawer trượt từ phải khi bấm vào hội viên, hiển thị ảnh đại diện, chức vụ, tên công ty, số điện thoại, email, phân bổ ban chuyên môn và vai trò trong CLB.'),
    p('6. [NODE-CRM-006] Phê duyệt Đơn Gia nhập Hội viên: Tiếp nhận hồ sơ đăng ký từ Cổng thông tin công khai, thẩm định thông tin pháp lý doanh nghiệp, cấp tài khoản và kích hoạt cờ bắt buộc đổi mật khẩu lần đầu (must_change_password).'),
    p('7. [NODE-CRM-007] Quản lý Sự kiện & Lịch trình Hội thảo: Lên lịch các sự kiện, hội thảo, đại hội; hiển thị thời gian, địa điểm, số lượng vé đã phát hành, doanh thu vé bán và danh sách khách mời đăng ký.'),
    p('8. [NODE-CRM-008] Tính năng Bắn Mạng Lưới (Network Push): Tự động tạo bài viết trên Bảng tin Mạng lưới App CEO 1983 từ sự kiện hoặc chuyên đề đào tạo CRM, tự động đính kèm ảnh Poster sắc nét và mã QR Check-in điện tử.'),
    p('9. [NODE-CRM-009] Quản lý Chuyên đề Đào tạo Trực tuyến/Trực tiếp: Cấu hình khóa học online (Zoom/Jitsi có mật khẩu phòng) hoặc offline; công cụ tạo Form đăng ký mở rộng link công khai và mã QR tải về gửi hội viên mới.'),
    p('10. [NODE-CRM-010] Sơ đồ Bàn tiệc & Phân bổ Khán phòng (Seating Canvas Map): Công cụ vẽ sơ đồ bàn tiệc trực quan, gán số bàn, số ghế, phân bổ đại biểu VIP và khách mời, đồng bộ vị trí ngồi lên vé điện tử.'),
    p('11. [NODE-CRM-011] Điểm danh Check-in QR Thời Gian Thực: Quét mã QR trên vé điện tử khách mời tại bàn lễ tân với tốc độ xử lý dưới 500ms qua Socket.IO, tự động điều hướng số bàn và xuất báo cáo điểm danh.'),
    p('12. [NODE-CRM-012] Quản lý Tài chính, Thu chi & Sổ quỹ CLB: Theo dõi thu phí thường niên, thu tài trợ và chi phí vận hành; tự động trích xuất Sổ quỹ tiền mặt Mẫu S07-DN theo Thông tư 200/2014/TT-BTC với 3 chữ ký số lãnh đạo.'),
    p('13. [NODE-CRM-013] Cổng Thanh toán Tự động VietQR: Sinh mã VietQR Napas 247 động gắn mã đơn/hội viên và nội dung định danh, đồng bộ trạng thái ngân hàng tự động và gửi hóa đơn số.'),
    p('14. [NODE-CRM-014] Quản trị Gian hàng & Sàn Sản phẩm B2B: Kiểm duyệt sản phẩm, dịch vụ, giá niêm yết và chính sách ưu đãi thành viên do các doanh nghiệp hội viên đăng tải.'),
    p('15. [NODE-CRM-015] Quản trị Khảo sát & Biểu quyết Điện tử: Tạo câu hỏi biểu quyết, thời hạn bỏ phiếu, chế độ công khai hoặc ẩn danh; biểu đồ tròn thống kê kết quả trực quan phục vụ Ban Chấp Hành.'),
    p('16. [NODE-CRM-016] Studio Thiết kế Chủ đề & Tải Ảnh nền Tùy chỉnh (Theme Studio): Tải ảnh nền tùy chỉnh từ máy tính hoặc chọn mẫu doanh nhân VIP, tùy biến biểu tượng 14 tính năng, xem trước Mockup điện thoại và đồng bộ biến CSS `--festival-bg-image` theo thời gian thực xuống toàn bộ Mobile App.'),
    p('17. [NODE-CRM-017] Ma trận Phân quyền Nâng cao RBAC 6 Ban: Cấu hình 5 quyền cốt lõi (Xem, Thêm, Sửa, Xóa, Duyệt) cho 6 ban chuyên môn (Ban Quản Trị, Ban Thư Ký, Ban Tài Chính, Ban Truyền Thông, Ban Thành Viên, Ban Xúc Tiến Thương Mại).'),

    h2('2.2 Kiến trúc và luồng xử lý 14 Functional Nodes phân hệ Mobile App (https://ceo1983.viconnect.vn)'),
    p('Phân hệ Ứng dụng Di động Hội viên được cấu trúc thành 14 Functional Nodes chuyên biệt:'),
    p('1. [NODE-APP-001] Đăng nhập & Đổi mật khẩu Bắt buộc: Đăng nhập bằng Email/Tài khoản; tự động phát hiện cờ must_change_password để khóa các tính năng và điều hướng bắt buộc tới màn hình đổi mật khẩu an toàn.'),
    p('2. [NODE-APP-002] Trang chủ Hội viên Di động VIP: Trung tâm điều phối trải nghiệm di động với Thẻ hội viên số hóa, Hàng trao đổi cơ hội kinh doanh (ảnh 16:9 + 3 biểu đồ tròn Donut Charts), Phím tắt nhanh tương tác, và Popup Chào mừng Logo 8 sang trọng.'),
    p('3. [NODE-APP-003] Thẻ Hội viên VIP & Danh thiếp Số Đa Năng: Nhận diện 3 màu thương hiệu truyền thống (Đỏ - Vàng - Xanh), tích hợp mã QR cá nhân hóa kết nối trực tiếp đến trang giới thiệu doanh nghiệp và mạng xã hội.'),
    p('4. [NODE-APP-004] Chạm kết nối NFC Một Chạm: Cho phép chạm lưng điện thoại để trao đổi danh thiếp số tức thì qua giao thức NFC mà không cần kết nối mạng hay cài đặt phần mềm phụ.'),
    p('5. [NODE-APP-005] Module Thống kê Di động (Tab 2 Footer Navigation): 4 thẻ chỉ số KPI chính, Biểu đồ Composed Bar-Line phân hóa xu hướng tăng xanh / giảm đỏ, avatar Top 1 định vị tại đỉnh cột, bục vinh danh 1 hàng ngang 3 cột, xuất báo cáo A4/Excel.'),
    p('6. [NODE-APP-006] Sàn Giao thương B2B với 4 Phân hệ Danh mục: Danh mục cơ hội kinh doanh chuẩn hóa ("Tất cả cơ hội", "Cơ hội của tôi", "Ai đang deal cơ hội của tôi", "Mình đang quan tâm"), cho phép trao cơ hội Referral và theo dõi tiến trình hợp tác.'),
    p('7. [NODE-APP-007] Bảng tin Mạng lưới Cộng đồng Doanh nhân (Tab Mạng lưới): Bảng tin tương tác nhận bài viết chuyên đề đào tạo & sự kiện từ CRM bắn xuống kèm Poster và mã QR Check-in; danh sách người tham gia có badge xanh `[✓ Đã Check-in]`.'),
    p('8. [NODE-APP-008] Danh bạ Hội viên & Bản đồ Tương tác Leaflet 2D Vệ tinh: Bản đồ tương tác Leaflet 2D với lớp vệ tinh Google Maps phân chia rõ 2 phạm vi: "Tổng thể" (toàn bộ hội viên, sự kiện, cuộc họp ban) và "Cá nhân" (người đã kết nối, sự kiện đã đăng ký), tích hợp định vị GPS và dẫn đường Google Maps.'),
    p('9. [NODE-APP-009] Lịch trình Sự kiện & Đăng ký Tham dự: Xem lịch họp, hội thảo, đăng ký giữ chỗ và thanh toán vé tham dự ngay trên ứng dụng di động.'),
    p('10. [NODE-APP-010] Vé Điện tử (Ticket Pass) & Mã QR Check-in: Lưu trữ vé tham dự sự kiện với mã QR động, thông tin số bàn tiệc và số ghế đã phân bổ trong khán phòng.'),
    p('11. [NODE-APP-011] Đăng tải Sản phẩm / Dịch vụ Gian hàng Số: Doanh nghiệp thành viên tự đăng tải hình ảnh sản phẩm, mô tả năng lực và chính sách chiết khấu nội bộ CLB.'),
    p('12. [NODE-APP-012] Khảo sát & Biểu quyết Số Trực tuyến: Tham gia bỏ phiếu các quyết sách quan trọng của Hiệp hội trực tiếp trên điện thoại với tính bảo mật cao.'),
    p('13. [NODE-APP-013] Đóng Phí & Gia hạn Hội phí VietQR: Quét mã VietQR Napas 247 động gắn nội dung định danh để gia hạn hội phí thường niên siêu tốc.'),
    p('14. [NODE-APP-014] Hồ sơ Doanh nhân & Tự động Đồng bộ Chủ đề CRM: Quản lý thông tin cá nhân và doanh nghiệp, tự động đồng bộ ảnh nền và chủ đề lễ hội từ CRM áp dụng theo thời gian thực qua biến CSS `--festival-bg-image`.'),

    h2('2.3 Cơ chế phân quyền RBAC và an toàn bảo mật hệ thống'),
    p('• Xác thực kép (Double Token Architecture): Sử dụng JSON Web Token (JWT) gồm Access Token có thời hạn 15 phút và Refresh Token có thời hạn 7 ngày lưu trữ trong HttpOnly Cookie và bộ nhớ cục bộ an toàn.'),
    p('• Ma trận quyền hạn RBAC 5 quyền: Kiểm soát quyền hạn chặt chẽ dựa trên vai trò của từng thành viên trong 6 Ban chuyên môn và Ban Điều Hành. Mọi điểm cuối API đều được bảo vệ bởi Guards và Decorator kiểm tra quyền hạn.'),
    p('• Phòng chống các lỗ hổng OWASP: Tự động lọc sạch dữ liệu đầu vào (Input Sanitization), kiểm tra tính hợp lệ qua Class-Validator DTOs, phòng chống tấn công SQL Injection thông qua TypeORM Parameterized Queries.'),

    h2('2.4 Các yêu cầu phi chức năng khác'),
    p('• Hiệu năng (Performance): Thời gian phản hồi của các điểm cuối API trung bình dưới 200ms; thời gian tải trang ban đầu của Web CRM dưới 1.5 giây; ứng dụng di động khởi chạy mượt mà dưới 1.0 giây.'),
    p('• Khả năng chịu tải: Hệ thống đáp ứng phục vụ tối thiểu 5.000 người dùng hoạt động đồng thời (CCU) và xử lý quét check-in 1.000 vé sự kiện trong vòng 15 phút không xảy ra tắc nghẽn.'),
    p('• An toàn & Bảo mật (Security): Tuân thủ nghiêm ngặt chuẩn an toàn OWASP Top 10, mã hóa một chiều mật khẩu bằng thuật toán Bcrypt; toàn bộ dữ liệu truyền tải trên mạng được mã hóa HTTPS/TLS 1.3.'),
    p('• Độ tin cậy (Reliability): Cam kết thời gian hoạt động liên tục (Uptime SLA) đạt tối thiểu 99.9%, tự động phục hồi container khi gặp sự cố.'),

    new Paragraph({ pageBreakBefore: true, children: [] })
  );

  // ===================== PHỤ LỤC I: BẢNG YÊU CẦU KỸ THUẬT =====================
  docChildren.push(
    h1('PHỤ LỤC I - BẢNG YÊU CẦU KỸ THUẬT CỦA PHẦN MỀM'),
    p('Bảng đặc tả tiêu chuẩn và yêu cầu kỹ thuật đối với Chương trình máy tính: Hệ thống phần mềm quản trị kết nối doanh nghiệp và Ứng dụng di động CEO 1983 (CEO 1983 Platform & Mobile App):')
  );

  const reqRows = [
    { stt: '1', item: 'Kiến trúc hệ thống', desc: 'Kiến trúc phân tầng 4 lớp', detail: 'Tách biệt Presentation (Web CRM & Mobile App), Gateway Nginx, Application NestJS và Data PostgreSQL 16', mo: 'M' },
    { stt: '2', item: 'Tên miền Cổng CRM', desc: 'Subdomain Web CRM Quản trị', detail: 'https://crm.ceo1983.viconnect.vn - Dành cho Ban Điều Hành, Ban Thư Ký và 6 Ban Chuyên Môn', mo: 'M' },
    { stt: '3', item: 'Tên miền Mobile App', desc: 'Subdomain Mobile App Hội viên', detail: 'https://ceo1983.viconnect.vn - Tối ưu di động, dành cho toàn thể Hội viên Doanh nhân', mo: 'M' },
    { stt: '4', item: 'Nền tảng Web CRM', desc: 'Frontend Web quản trị', detail: 'React 18, TypeScript, Vite, Tailwind CSS, Recharts, Lucide Icons, chạy trên Chrome/Edge/Firefox', mo: 'M' },
    { stt: '5', item: 'Nền tảng Mobile App', desc: 'Frontend ứng dụng di động', detail: 'Capacitor 5, React 18, TypeScript, Mobile Viewport, Touch Haptic Engine, chạy trên iOS và Android', mo: 'M' },
    { stt: '6', item: 'Máy chủ dịch vụ', desc: 'Backend Application Core', detail: 'NestJS 10, Node.js v20+, TypeScript, kiến trúc 3 tầng Controller - Service - Repository', mo: 'M' },
    { stt: '7', item: 'Cơ sở dữ liệu', desc: 'CSDL quan hệ trung tâm', detail: 'PostgreSQL 16, hỗ trợ khóa ngoại, chỉ mục index B-Tree, giao dịch ACID toàn vẹn', mo: 'M' },
    { stt: '8', item: 'Bộ nhớ đệm', desc: 'In-Memory Cache & Queue', detail: 'Redis 7, quản lý phiên làm việc, mã OTP và Rate-Limiting phòng chống DoS', mo: 'M' },
    { stt: '9', item: 'Kho lưu trữ tệp', desc: 'Object Storage', detail: 'MinIO S3-compatible, lưu trữ ảnh thẻ hội viên, slide, tài liệu sự kiện và hóa đơn số', mo: 'M' },
    { stt: '10', item: 'Cổng bảo mật biên', desc: 'Reverse Proxy & SSL Gateway', detail: 'Nginx, chứng thực TLS Let\'s Encrypt 2048-bit, định tuyến tên miền phân tách CRM và Mobile', mo: 'M' },
    { stt: '11', item: 'Xác thực & Phiên', desc: 'JWT Token Security', detail: 'Cơ chế Access Token (15 phút) và Refresh Token (7 ngày) lưu trong HttpOnly Cookie', mo: 'M' },
    { stt: '12', item: 'Phân quyền người dùng', desc: 'RBAC 5 quyền nâng cao', detail: 'Ma trận quyền Xem, Thêm, Sửa, Xóa, Duyệt áp dụng cho 6 ban chuyên môn và Ban Điều Hành', mo: 'M' },
    { stt: '13', item: 'Danh thiếp số VIP', desc: 'Digital VIP Card', detail: 'Thẻ VIP 3 màu nhận diện Đỏ - Vàng - Xanh, mã QR định danh và chia sẻ liên kết', mo: 'M' },
    { stt: '14', item: 'Kết nối tiệm cận', desc: 'NFC Touch Connection', detail: 'Web NFC API chạm lưng điện thoại chia sẻ thông tin danh thiếp tức thì một chạm', mo: 'M' },
    { stt: '15', item: 'Bản đồ tương tác', desc: 'Interactive Leaflet GPS Map', detail: 'Bản đồ Leaflet 2D vệ tinh Google Maps phân chia 2 phạm vi Tổng thể & Cá nhân, định vị GPS', mo: 'M' },
    { stt: '16', item: 'Báo cáo Thống kê', desc: 'Advanced Analytics Dashboard', detail: '4 thẻ KPI, Composed Bar/Line Chart tăng xanh/giảm đỏ, Bục vinh danh Top 3 1 hàng ngang, xuất A4/Excel', mo: 'M' },
    { stt: '17', item: 'Bắn Mạng Lưới', desc: 'Event/Training Push to Feed', detail: 'Bắn bài viết sự kiện & đào tạo kèm ảnh Poster và mã QR Check-in từ CRM xuống App Hội viên', mo: 'M' },
    { stt: '18', item: 'Studio Thiết kế Chủ đề', desc: 'Theme Studio & Sync', detail: 'Tải ảnh nền tùy chỉnh, tùy biến icon 14 tính năng, tự động đồng bộ biến CSS --festival-bg-image xuống App', mo: 'M' },
    { stt: '19', item: 'Sàn giao thương B2B', desc: 'B2B Marketplace & Referral', detail: '4 phân hệ danh mục cơ hội, đăng tải sản phẩm, ưu đãi nội bộ và trao đổi cơ hội Referral', mo: 'M' },
    { stt: '20', item: 'Sổ quỹ tài chính', desc: 'Mẫu S07-DN Bộ Tài Chính', detail: 'Xuất báo cáo Sổ quỹ tiền mặt chuẩn Thông tư 200/2014/TT-BTC kèm 3 chữ ký số lãnh đạo', mo: 'M' },
    { stt: '21', item: 'Thanh toán định danh', desc: 'VietQR Dynamic Banking', detail: 'Tự động tạo mã VietQR Napas 247 gắn mã đơn/hội viên và nội dung định danh thu phí tự động', mo: 'M' },
    { stt: '22', item: 'Kiểm thử chất lượng', desc: 'Strict Type-Check & Tests', detail: 'Toàn bộ mã nguồn đạt chuẩn 0 lỗi TypeScript (tsc --noEmit) và kiểm thử đơn vị với Vitest/Jest', mo: 'M' }
  ];

  const tableHeaderRow = new TableRow({
    tableHeader: true,
    children: [
      new TableCell({ width: { size: 6, type: WidthType.PERCENTAGE }, shading: { fill: '1F3864' }, children: [p('STT', { bold: true, color: 'FFFFFF', align: AlignmentType.CENTER })] }),
      new TableCell({ width: { size: 22, type: WidthType.PERCENTAGE }, shading: { fill: '1F3864' }, children: [p('Hạng mục kỹ thuật', { bold: true, color: 'FFFFFF', align: AlignmentType.CENTER })] }),
      new TableCell({ width: { size: 24, type: WidthType.PERCENTAGE }, shading: { fill: '1F3864' }, children: [p('Mô tả quy chuẩn', { bold: true, color: 'FFFFFF', align: AlignmentType.CENTER })] }),
      new TableCell({ width: { size: 40, type: WidthType.PERCENTAGE }, shading: { fill: '1F3864' }, children: [p('Chi tiết thông số & Công nghệ', { bold: true, color: 'FFFFFF', align: AlignmentType.CENTER })] }),
      new TableCell({ width: { size: 8, type: WidthType.PERCENTAGE }, shading: { fill: '1F3864' }, children: [p('M/O', { bold: true, color: 'FFFFFF', align: AlignmentType.CENTER })] })
    ]
  });

  const tableDataRows = reqRows.map((r, i) => {
    const fill = i % 2 === 1 ? 'F2F4F7' : 'FFFFFF';
    return new TableRow({
      children: [
        new TableCell({ shading: { fill }, children: [p(r.stt, { align: AlignmentType.CENTER, size: 22 })] }),
        new TableCell({ shading: { fill }, children: [p(r.item, { bold: true, size: 22 })] }),
        new TableCell({ shading: { fill }, children: [p(r.desc, { size: 22 })] }),
        new TableCell({ shading: { fill }, children: [p(r.detail, { size: 22 })] }),
        new TableCell({ shading: { fill }, children: [p(r.mo, { bold: true, align: AlignmentType.CENTER, size: 22 })] })
      ]
    });
  });

  docChildren.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [tableHeaderRow, ...tableDataRows]
    }),
    new Paragraph({ pageBreakBefore: true, children: [] })
  );

  // ===================== PHỤ LỤC II: HƯỚNG DẪN SỬ DỤNG WEB CRM =====================
  docChildren.push(
    h1('PHỤ LỤC II – HƯỚNG DẪN SỬ DỤNG PHẦN MỀM - CỔNG QUẢN TRỊ NỘI DUNG & VẬN HÀNH (WEB CRM CEO 1983)'),
    p('Tài liệu hướng dẫn thao tác chi tiết từng quy trình vận hành trên Cổng Quản trị Web CRM CEO 1983 (https://crm.ceo1983.viconnect.vn) kèm hình ảnh chụp giao diện thực tế trích xuất trực tiếp từ Subdomain:'),

    h2('1. Đăng nhập hệ thống Cổng Quản trị Web CRM (https://crm.ceo1983.viconnect.vn/auth?portal=crm)'),
    p('• Mục đích: Giúp cán bộ quản lý (Ban Điều Hành, Ban Thư Ký, Ban Quản Trị, Ban Tài Chính) đăng nhập an toàn vào Cổng Quản trị CRM.'),
    p('• Các bước thực hiện:'),
    p('  Bước 1: Mở trình duyệt web Google Chrome hoặc Microsoft Edge.'),
    p('  Bước 2: Truy cập địa chỉ Cổng Quản trị CRM: `https://crm.ceo1983.viconnect.vn`.'),
    p('  Bước 3: Nhập Email/Tên đăng nhập và Mật khẩu được cấp.'),
    p('  Bước 4: Nhấn nút [Đăng nhập] để truy cập hệ thống.'),
    ...imgItem('scripts/live_subdomain_captures/crm/00_crm_login.png', 'Màn hình Đăng nhập hệ thống Quản trị Web CRM CEO 1983 (Trích xuất từ https://crm.ceo1983.viconnect.vn)'),

    h2('2. Bảng điều khiển Tổng quan (Dashboard Điều hành - https://crm.ceo1983.viconnect.vn/)'),
    p('• Mục đích: Cung cấp bức tranh toàn cảnh về tình hình hoạt động của Hiệp hội CEO 1983 theo thời gian thực.'),
    p('• Tính năng hiển thị: Thống kê tổng số hội viên chính thức, hội viên chờ duyệt; các sự kiện sắp diễn ra; biểu đồ Recharts phân tích biến động dòng tiền quỹ và tổng giá trị giao thương B2B được kết nối thành công.'),
    ...imgItem('scripts/live_subdomain_captures/crm/01_crm_dashboard.png', 'Bảng điều khiển Tổng quan Dashboard Quản trị CEO 1983 (Trích xuất từ https://crm.ceo1983.viconnect.vn/)'),

    h2('3. Module Báo cáo Thống kê Chuyên sâu & Bục Vinh Danh Top 3 (https://crm.ceo1983.viconnect.vn/analytics)'),
    p('• Mục đích: Theo dõi và vinh danh thành tích hoạt động của hội viên trong Hiệp hội theo chuẩn mực giao diện cao cấp.'),
    p('• Tính năng hiển thị: 4 thẻ chỉ số KPI chính; Biểu đồ Composed Bar-Line phân hóa xu hướng tăng xanh / giảm đỏ; Avatar của hội viên Top 1 được định vị tại đỉnh cột; Bục vinh danh Top 3 thiết kế 1 hàng ngang 3 cột; phân chia rõ 5 danh mục thống kê và nút xuất báo cáo Doanh nghiệp (A4 & Excel .xlsx).'),
    ...imgItem('scripts/live_subdomain_captures/crm/02_crm_analytics.png', 'Giao diện Thống kê Chuyên sâu & Bục Vinh Danh Top 3 (Trích xuất từ https://crm.ceo1983.viconnect.vn/analytics)'),

    h2('4. Quản lý Danh sách Hội viên Doanh nghiệp (https://crm.ceo1983.viconnect.vn/members)'),
    p('• Mục đích: Theo dõi toàn bộ danh sách hội viên, tìm kiếm và lọc dữ liệu đa chiều.'),
    p('• Tính năng: Tìm kiếm hội viên theo họ tên, tên doanh nghiệp, ngành nghề hoạt động; lọc theo ban chuyên môn (6 ban); kiểm tra trạng thái đóng hội phí thường niên; phê duyệt hồ sơ gia nhập và xuất dữ liệu danh bạ ra Excel.'),
    ...imgItem('scripts/live_subdomain_captures/crm/03_crm_members.png', 'Giao diện Quản lý Danh sách Hội viên Doanh nghiệp (Trích xuất từ https://crm.ceo1983.viconnect.vn/members)'),

    h2('5. Quản trị Sự kiện & Tính năng Bắn Mạng Lưới (https://crm.ceo1983.viconnect.vn/events)'),
    p('• Mục đích: Lên kế hoạch, tổ chức sự kiện và tự động lan tỏa thông tin tới toàn bộ hội viên.'),
    p('• Tính năng: Danh sách sự kiện sắp diễn ra, số lượng vé đã phát hành, doanh thu vé; nút "Bắn Mạng Lưới" tự động tạo bài viết đính kèm Poster sắc nét và mã QR Check-in đẩy từ CRM xuống Bảng tin App Hội viên.'),
    ...imgItem('scripts/live_subdomain_captures/crm/04_crm_events.png', 'Giao diện Quản trị Sự kiện & Bắn Mạng Lưới (Trích xuất từ https://crm.ceo1983.viconnect.vn/events)'),

    h2('6. Hộp thoại Khởi tạo & Cấu hình Sự kiện Mới'),
    p('• Mục đích: Tạo mới sự kiện chuyên nghiệp với quy trình cấu hình chuẩn hóa.'),
    p('• Các bước: Bước 1 - Thông tin cơ bản (Tên sự kiện, Banner, Địa điểm, Thời gian); Bước 2 - Thiết lập Diễn giả & Lịch trình chi tiết; Bước 3 - Cấu hình Loại vé, Mức phí và Số lượng chỗ ngồi tối đa.'),
    ...imgItem('scripts/live_subdomain_captures/crm/04b_crm_event_create_modal.png', 'Hộp thoại Khởi tạo & Cấu hình Sự kiện Mới (Trích xuất từ https://crm.ceo1983.viconnect.vn/events)'),

    h2('7. Quản trị Chuyên đề Đào tạo & Mở Form Đăng ký QR (https://crm.ceo1983.viconnect.vn/trainings)'),
    p('• Mục đích: Tổ chức các chuyên đề đào tạo kỹ năng doanh nhân trực tuyến, trực tiếp hoặc kết hợp hybrid.'),
    p('• Tính năng: Thiết lập phòng họp Jitsi/Zoom có mật khẩu bảo mật; mở Form đăng ký tham gia đào tạo công khai qua liên kết và mã QR động tải về; hỗ trợ nút "Bắn xuống App CEO 1983" đẩy bài viết lên Bảng tin Mạng lưới.'),
    ...imgItem('scripts/live_subdomain_captures/crm/05_crm_trainings.png', 'Quản lý Chuyên đề Đào tạo Trực tuyến/Trực tiếp & Mở Form Đăng ký (Trích xuất từ https://crm.ceo1983.viconnect.vn/trainings)'),

    h2('8. Quản lý Tài chính, Thu chi & Sổ quỹ CLB (https://crm.ceo1983.viconnect.vn/finance)'),
    p('• Mục đích: Theo dõi minh bạch toàn bộ các khoản thu hội phí, tài trợ sự kiện và các chi phí vận hành CLB.'),
    p('• Tính năng: Bảng kê chứng từ thu chi, số dư lũy kế; hỗ trợ kết xuất báo cáo Sổ quỹ tiền mặt Mẫu S07-DN theo Thông tư 200/2014/TT-BTC kèm đầy đủ 3 chữ ký số lãnh đạo (Người lập, Thủ quỹ, Kế toán trưởng).'),
    ...imgItem('scripts/live_subdomain_captures/crm/06_crm_finance.png', 'Giao diện Quản lý Tài chính, Thu chi & Sổ quỹ CLB (Trích xuất từ https://crm.ceo1983.viconnect.vn/finance)'),

    h2('9. Quản trị Khảo sát & Biểu quyết Điện tử (https://crm.ceo1983.viconnect.vn/voting)'),
    p('• Mục đích: Tổ chức các cuộc lấy ý kiến, thăm dò và biểu quyết các vấn đề quan trọng của CLB.'),
    p('• Tính năng: Tạo câu hỏi biểu quyết, thời hạn bình chọn, chế độ công khai hoặc ẩn danh; biểu đồ tròn thống kê kết quả trực quan.'),
    ...imgItem('scripts/live_subdomain_captures/crm/07_crm_voting.png', 'Quản trị Khảo sát & Biểu quyết Ban Chấp Hành (Trích xuất từ https://crm.ceo1983.viconnect.vn/voting)'),

    h2('10. Quản trị Bản tin & Thông báo Hiệp hội (https://crm.ceo1983.viconnect.vn/news)'),
    p('• Mục đích: Xuất bản tin tức hoạt động, vinh danh doanh nghiệp và thông báo lịch họp.'),
    p('• Tính năng: Trình soạn thảo văn bản đa phương tiện, tải ảnh đại diện bài viết, ghim bài viết quan trọng lên đầu trang chủ.'),
    ...imgItem('scripts/live_subdomain_captures/crm/08_crm_news.png', 'Quản trị Bản tin & Thông báo Hiệp hội (Trích xuất từ https://crm.ceo1983.viconnect.vn/news)'),

    h2('11. Bộ Studio Thiết kế Chủ đề & Tải Ảnh nền Tùy chỉnh (https://crm.ceo1983.viconnect.vn/admin/landing-templates)'),
    p('• Mục đích: Cá nhân hóa giao diện sự kiện, lễ hội và đồng bộ phong cách thương hiệu toàn diện.'),
    p('• Tính năng: Tải ảnh nền tùy chỉnh từ máy tính hoặc chọn mẫu doanh nhân VIP; cấu hình bộ biểu tượng cho toàn bộ 14 tính năng trên app; Live Preview Mockup điện thoại; tự động đồng bộ biến CSS `--festival-bg-image` xuống toàn bộ App Mobile.'),
    ...imgItem('scripts/live_subdomain_captures/crm/09_crm_theme_studio.png', 'Bộ Studio Thiết kế Chủ đề & Tải Ảnh nền Tùy chỉnh (Trích xuất từ https://crm.ceo1983.viconnect.vn/admin/landing-templates)'),

    h2('12. Cài đặt Hệ thống & Ma trận Phân quyền 6 Ban (https://crm.ceo1983.viconnect.vn/rbac)'),
    p('• Mục đích: Thiết lập cấu hình toàn hệ thống và phân bổ quyền hạn theo ban chuyên môn.'),
    p('• Tính năng: Ma trận phân quyền RBAC 5 quyền (Xem, Thêm, Sửa, Xóa, Duyệt) cho 6 ban chuyên môn (Ban Quản Trị, Ban Thư Ký, Ban Tài Chính, Ban Truyền Thông, Ban Thành Viên, Ban Xúc Tiến Thương Mại).'),
    ...imgItem('scripts/live_subdomain_captures/crm/10_crm_roles_rbac.png', 'Cài đặt Hệ thống & Phân quyền RBAC 6 Ban Chuyên Môn (Trích xuất từ https://crm.ceo1983.viconnect.vn/rbac)'),

    new Paragraph({ pageBreakBefore: true, children: [] })
  );

  // ===================== PHỤ LỤC III: HƯỚNG DẪN SỬ DỤNG MOBILE APP =====================
  docChildren.push(
    h1('PHỤ LỤC III – HƯỚNG DẪN SỬ DỤNG PHẦN MỀM - ỨNG DỤNG NGƯỜI DÙNG (CEO 1983 MOBILE APP)'),
    p('Tài liệu hướng dẫn thao tác dành cho Hội viên Doanh nhân trên Ứng dụng Di động CEO 1983 (https://ceo1983.viconnect.vn) kèm hình ảnh chụp giao diện thực tế trích xuất trực tiếp từ Subdomain:'),

    h2('1. Đăng nhập Hội viên & Bắt buộc Đổi mật khẩu Lần đầu (https://ceo1983.viconnect.vn/association/login)'),
    p('• Mục đích: Giúp hội viên đăng nhập vào ứng dụng và thiết lập mật khẩu bảo mật cá nhân.'),
    p('• Quy trình: Hội viên nhập Mã hội viên / Email và mật khẩu tạm thời. Đối với tài khoản mới kích hoạt (`must_change_password = true`), hệ thống khóa thanh điều hướng dưới và chuyển hướng bắt buộc tới màn hình Đổi Mật Khẩu.'),
    ...imgItem('scripts/live_subdomain_captures/app/00_app_login.png', 'Màn hình Đăng nhập Ứng dụng Di động Hội viên CEO 1983 (Trích xuất từ https://ceo1983.viconnect.vn/association/login)', 260, 560),

    h2('2. Trang chủ Hội viên Di động VIP & Hàng Trao đổi Cơ hội (https://ceo1983.viconnect.vn/association)'),
    p('• Mục đích: Trung tâm điều phối thông tin, cơ hội kinh doanh và hoạt động nổi bật của CLB.'),
    p('• Giao diện: Hiển thị Thẻ hội viên VIP số hóa, Hàng trao đổi cơ hội kinh doanh (ảnh đại diện 16:9 bo góc 2xl kết hợp cùng 3 biểu đồ tròn Donut Charts: Mới / Đang deal / Đã chốt), các phím tắt nhanh tương tác (Tin nhắn, Thẻ, Bản đồ, Sự kiện...), tin tức nổi bật và popup chào mừng logo 8 sang trọng.'),
    ...imgItem('scripts/live_subdomain_captures/app/01_app_home_vip.png', 'Trang chủ Hội viên Di động VIP & Hàng Trao đổi Cơ hội (Trích xuất từ https://ceo1983.viconnect.vn/association)', 260, 560),

    h2('3. Danh thiếp Số VIP Card 3 Màu Thương hiệu & QR Định danh (https://ceo1983.viconnect.vn/association/card)'),
    p('• Mục đích: Giúp doanh nhân thành viên chia sẻ thông tin cá nhân và doanh nghiệp một cách trang trọng, hiện đại.'),
    p('• Thiết kế: Thẻ VIP sang trọng tích hợp bộ 3 màu nhận diện thương hiệu truyền thống (Đỏ - Vàng - Xanh), hiển thị ảnh chân dung, chức danh, tên công ty, mã QR cá nhân hóa kết nối trực tiếp đến trang giới thiệu doanh nghiệp và hỗ trợ công nghệ chạm tiệm cận NFC một chạm.'),
    ...imgItem('scripts/live_subdomain_captures/app/02_app_digital_card.png', 'Danh thiếp Số VIP Card 3 Màu Thương hiệu & QR Định danh (Trích xuất từ https://ceo1983.viconnect.vn/association/card)', 260, 560),

    h2('4. Module Thống kê Di động & Bục Vinh Danh Top 3 (https://ceo1983.viconnect.vn/association/analytics)'),
    p('• Mục đích: Cung cấp bức tranh trực quan về thành tích hoạt động và vinh danh hội viên tích cực ngay trên điện thoại.'),
    p('• Tính năng: Đặt tại Tab 2 trên Footer Navigation; gồm 4 thẻ chỉ số KPI chính; Biểu đồ Composed Bar-Line phân hóa xu hướng tăng xanh / giảm đỏ; Avatar của hội viên Top 1 được định vị tại đỉnh cột; Bục vinh danh Top 3 thiết kế 1 hàng ngang 3 cột; phân chia rõ 5 danh mục thống kê và nút xuất báo cáo A4/Excel.'),
    ...imgItem('scripts/live_subdomain_captures/app/03_app_analytics_dashboard.png', 'Module Thống kê Di động & Bục Vinh Danh Top 3 (Trích xuất từ https://ceo1983.viconnect.vn/association/analytics)', 260, 560),

    h2('5. Sàn Giao thương B2B & 4 Phân hệ Danh mục Cơ hội (https://ceo1983.viconnect.vn/association/opportunities)'),
    p('• Mục đích: Thúc đẩy giao thương, mua bán chéo sản phẩm dịch vụ và trao cơ hội kinh doanh giữa các doanh nghiệp.'),
    p('• Tính năng: Dải danh mục (Tabs) đầy đủ chuẩn hóa: "Tất cả cơ hội", "Cơ hội của tôi", "Ai đang deal cơ hội của tôi", "Mình đang quan tâm"; cho phép tạo phiếu trao cơ hội Referral và theo dõi tiến độ hợp tác.'),
    ...imgItem('scripts/live_subdomain_captures/app/04_app_b2b_opportunities.png', 'Sàn Giao thương B2B & 4 Phân hệ Danh mục Cơ hội (Trích xuất từ https://ceo1983.viconnect.vn/association/opportunities)', 260, 560),

    h2('6. Bảng tin Mạng lưới Cộng đồng Doanh nhân (https://ceo1983.viconnect.vn/association/messages)'),
    p('• Mục đích: Không gian kết nối, giao lưu học hỏi và cập nhật hoạt động của Hiệp hội.'),
    p('• Tính năng: Bảng tin Mạng lưới nhận tự động tất cả các tin tức, cuộc họp, chuyên đề đào tạo và sự kiện từ CRM bắn xuống, đính kèm ảnh Poster sắc nét và mã QR Check-in; danh sách người tham gia hiển thị badge xanh `[✓ Đã Check-in]`.'),
    ...imgItem('scripts/live_subdomain_captures/app/05_app_social_network_feed.png', 'Bảng tin Mạng lưới Cộng đồng Doanh nhân (Trích xuất từ https://ceo1983.viconnect.vn/association/messages)', 260, 560),

    h2('7. Danh bạ Hội viên Doanh nhân & Bản đồ Tương tác Leaflet 2D (https://ceo1983.viconnect.vn/association/members)'),
    p('• Mục đích: Tra cứu thông tin đối tác và định vị vị trí địa lý của doanh nghiệp hội viên.'),
    p('• Tính năng: Danh bạ tìm kiếm nhanh theo ngành nghề; tích hợp Bản đồ tương tác Leaflet 2D với lớp vệ tinh Google Maps phân chia rõ 2 phạm vi quan sát: "Tổng thể" (toàn bộ hội viên, sự kiện) và "Cá nhân" (người đã kết nối, sự kiện đã đăng ký), tích hợp định vị GPS và dẫn đường Google Maps.'),
    ...imgItem('scripts/live_subdomain_captures/app/06_app_member_directory.png', 'Danh bạ Hội viên Doanh nhân & Bản đồ Tương tác Leaflet 2D (Trích xuất từ https://ceo1983.viconnect.vn/association/members)', 260, 560),

    h2('8. Lịch trình Sự kiện, Hội thảo & Vé Điện tử (https://ceo1983.viconnect.vn/association/events)'),
    p('• Mục đích: Xem danh sách và đăng ký tham gia các phiên họp thường kỳ, hội thảo và gala.'),
    p('• Tính năng: Hiển thị chi tiết nội dung sự kiện, diễn giả khách mời, thời gian, địa điểm; nhấn nút [Đăng ký tham gia] để nhận vé tham dự Ticket Pass tích hợp mã QR check-in ngay trên app.'),
    ...imgItem('scripts/live_subdomain_captures/app/07_app_events_schedule.png', 'Lịch trình Sự kiện, Hội thảo & Vé Điện tử (Trích xuất từ https://ceo1983.viconnect.vn/association/events)', 260, 560),

    h2('9. Hồ sơ Doanh nhân & Đồng bộ Chủ đề CRM Áp dụng (https://ceo1983.viconnect.vn/association/profile)'),
    p('• Mục đích: Quản lý thông tin hồ sơ doanh nhân cá nhân và theo dõi trạng thái giao diện hệ thống.'),
    p('• Tính năng: Tùy chỉnh thông tin liên hệ, chức vụ, công ty; hiển thị Card trạng thái "Chủ Đề Giao Diện CRM Áp Dụng", tự động đồng bộ ảnh nền và màu sắc theo thời gian thực khi CRM thay đổi chủ đề sự kiện/lễ hội.'),
    ...imgItem('scripts/live_subdomain_captures/app/08_app_profile_theme_sync.png', 'Hồ sơ Doanh nhân & Đồng bộ Chủ đề CRM Áp dụng (Trích xuất từ https://ceo1983.viconnect.vn/association/profile)', 260, 560),

    h2('10. Đặc quyền & Gian hàng Ưu đãi Nội bộ CLB (https://ceo1983.viconnect.vn/association/perks)'),
    p('• Mục đích: Tra cứu và sử dụng các chính sách chiết khấu, quyền lợi độc quyền dành riêng cho hội viên CEO 1983.'),
    p('• Tính năng: Danh mục ưu đãi từ đối tác tài trợ, voucher dịch vụ, điều kiện áp dụng và liên hệ nhận đặc quyền.'),
    ...imgItem('scripts/live_subdomain_captures/app/09_app_privileges_market.png', 'Đặc quyền & Gian hàng Ưu đãi Nội bộ CLB (Trích xuất từ https://ceo1983.viconnect.vn/association/perks)', 260, 560),

    h2('11. Khảo sát & Biểu quyết Số Trực tuyến (https://ceo1983.viconnect.vn/association/voting)'),
    p('• Mục đích: Tham gia biểu quyết các chủ trương, bầu cử Ban Chấp Hành trực tiếp trên điện thoại.'),
    p('• Tính năng: Bỏ phiếu nhanh chóng, bảo mật, xem tỷ lệ biểu quyết thời gian thực ngay sau khi hoàn thành.'),
    ...imgItem('scripts/live_subdomain_captures/app/10_app_voting_election.png', 'Khảo sát & Biểu quyết Số Trực tuyến trên Di động (Trích xuất từ https://ceo1983.viconnect.vn/association/voting)', 260, 560),

    new Paragraph({ pageBreakBefore: true, children: [] })
  );

  // ===================== PHỤ LỤC IV: MÃ NGUỒN PHẦN MỀM =====================
  docChildren.push(
    h1('PHỤ LỤC IV - MÃ NGUỒN PHẦN MỀM (SOURCE CODE IN NỘP ĐĨA / BẢN IN)'),
    p('Trích xuất các tệp mã nguồn cốt lõi đại diện cho Hệ thống phần mềm quản trị kết nối doanh nghiệp và Ứng dụng di động CEO 1983 (CEO 1983 Platform & Mobile App):')
  );

  // Read actual source files
  const mainTs = fs.readFileSync(path.join(__dirname, '..', 'apps/ceo1983_app_be/src/main.ts'), 'utf8');
  const appModuleTs = fs.readFileSync(path.join(__dirname, '..', 'apps/ceo1983_app_be/src/app.module.ts'), 'utf8');
  const authServiceTs = fs.readFileSync(path.join(__dirname, '..', 'apps/ceo1983_app_be/src/auth/auth.service.ts'), 'utf8');
  const businessCardServiceTs = fs.readFileSync(path.join(__dirname, '..', 'apps/ceo1983_app_be/src/business-card/business-card.service.ts'), 'utf8');
  const routerTsx = fs.readFileSync(path.join(__dirname, '..', 'apps/ceo1983_app_fe/src/router.tsx'), 'utf8');

  // Truncate safely for doc presentation
  function safeSlice(content, maxLines = 150) {
    const lines = content.split('\n');
    if (lines.length > maxLines) {
      return lines.slice(0, maxLines).join('\n') + `\n\n// ... [Trích xuất thêm ${lines.length - maxLines} dòng mã nguồn trong kho lưu trữ chính thức] ...`;
    }
    return content;
  }

  docChildren.push(
    ...codeItem(safeSlice(mainTs, 120), 'apps/ceo1983_app_be/src/main.ts (Điểm nhập máy chủ NestJS Backend)'),
    ...codeItem(safeSlice(appModuleTs, 120), 'apps/ceo1983_app_be/src/app.module.ts (Module trung tâm hệ thống)'),
    ...codeItem(safeSlice(authServiceTs, 120), 'apps/ceo1983_app_be/src/auth/auth.service.ts (Xác thực JWT & Phân quyền bảo mật)'),
    ...codeItem(safeSlice(businessCardServiceTs, 120), 'apps/ceo1983_app_be/src/business-card/business-card.service.ts (Nghiệp vụ danh thiếp số VIP & NFC)'),
    ...codeItem(safeSlice(routerTsx, 120), 'apps/ceo1983_app_fe/src/router.tsx (Định tuyến TanStack Router đa phân hệ Web CRM & Mobile App)')
  );

  // Build Document
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440, // 2.54 cm
              bottom: 1440,
              left: 1700, // 3 cm
              right: 1134 // 2 cm
            }
          }
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: 'Hồ sơ Đăng ký Quyền tác giả – Hệ thống & App CEO 1983 (https://crm.ceo1983.viconnect.vn & https://ceo1983.viconnect.vn)',
                    font: 'Times New Roman',
                    size: 18,
                    italics: true,
                    color: '777777'
                  })
                ]
              })
            ]
          })
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: 'Trang ',
                    font: 'Times New Roman',
                    size: 20
                  }),
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    font: 'Times New Roman',
                    size: 20
                  }),
                  new TextRun({
                    text: ' / ',
                    font: 'Times New Roman',
                    size: 20
                  }),
                  new TextRun({
                    children: [PageNumber.TOTAL_PAGES],
                    font: 'Times New Roman',
                    size: 20
                  })
                ]
              })
            ]
          })
        },
        children: docChildren
      }
    ]
  });

  const outBuf = await Packer.toBuffer(doc);

  const outPathDownloads = 'C:\\Users\\vumik\\Downloads\\[CEO1983] 06. Trình bày tác phẩm.Bản cop đĩa.docx';
  const outPathDoc = path.join(__dirname, '..', 'document', '[CEO1983] 06. Trình bày tác phẩm.Bản cop đĩa.docx');

  fs.writeFileSync(outPathDoc, outBuf);
  console.log('Saved to document:', outPathDoc, '(', outBuf.length, 'bytes )');

  try {
    fs.writeFileSync(outPathDownloads, outBuf);
    console.log('Saved to Downloads:', outPathDownloads, '(', outBuf.length, 'bytes )');
  } catch (err) {
    if (err.code === 'EBUSY') {
      const altPath = 'C:\\Users\\vumik\\Downloads\\[CEO1983] 06. Trình bày tác phẩm.Bản cop đĩa (Mới).docx';
      fs.writeFileSync(altPath, outBuf);
      console.log('Original file was open in Word. Saved to:', altPath);
    } else {
      throw err;
    }
  }
}

buildDoc4().catch(err => {
  console.error('Fatal error building Document 04:', err);
  process.exit(1);
});
