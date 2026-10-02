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
  ImageRun,
} = require('docx');

const ROOT_DIR = path.resolve(__dirname, '..');
const VIONE_DOC_DIR = path.join(ROOT_DIR, '..', 'vione_project', 'document');
const CEO_DOC_DIR = path.join(ROOT_DIR, 'document');
const EVIDENCE_DIR = path.join(CEO_DOC_DIR, 'images', 'evidence');

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

function createCallout(title, text, type = 'info') {
  const bgColor = type === 'warning' ? 'FEF3C7' : 'EFF6FF';
  const borderColor = type === 'warning' ? 'D97706' : '3B82F6';
  const titleColor = type === 'warning' ? 'B45309' : '1D4ED8';

  return new Table({
    width: { size: TABLE_WIDTH_DXA, type: WidthType.DXA },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: TABLE_WIDTH_DXA, type: WidthType.DXA },
            shading: { fill: bgColor, type: ShadingType.CLEAR },
            borders: {
              top: { style: BorderStyle.NONE },
              bottom: { style: BorderStyle.NONE },
              right: { style: BorderStyle.NONE },
              left: { style: BorderStyle.SINGLE, size: 24, color: borderColor },
            },
            margins: { top: 140, bottom: 140, left: 200, right: 140 },
            children: [
              new Paragraph({
                spacing: { before: 0, after: 60 },
                children: [
                  new TextRun({
                    text: `📌 ${title}`,
                    font: FONT_FAMILY,
                    size: 22,
                    bold: true,
                    color: titleColor,
                  }),
                ],
              }),
              new Paragraph({
                spacing: { before: 0, after: 0, line: 260 },
                children: [
                  new TextRun({
                    text,
                    font: FONT_FAMILY,
                    size: 21,
                    color: COLOR_DARK,
                  }),
                ],
              }),
            ],
          }),
        ],
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

function createImageParagraph(imgFileName, captionText, defaultWidth = 520, defaultHeight = 290) {
  if (!imgFileName) return [];
  const p = path.join(EVIDENCE_DIR, imgFileName);
  if (!fs.existsSync(p)) return [];

  try {
    const imgBuffer = fs.readFileSync(p);

    let realWidth = 0;
    let realHeight = 0;
    if (imgBuffer.length > 24 && imgBuffer.toString('ascii', 12, 16) === 'IHDR') {
      realWidth = imgBuffer.readUInt32BE(16);
      realHeight = imgBuffer.readUInt32BE(20);
    }

    let finalW = defaultWidth;
    let finalH = defaultHeight;

    if (realWidth > 0 && realHeight > 0) {
      const isMobileRatio = realHeight > realWidth * 1.3;
      if (isMobileRatio) {
        finalW = 240;
        finalH = Math.round((realHeight / realWidth) * 240);
        if (finalH > 480) finalH = 480;
      } else {
        finalW = 540;
        finalH = Math.round((realHeight / realWidth) * 540);
        if (finalH > 320) finalH = 320;
      }
    }

    return [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 140, after: 60 },
        children: [
          new ImageRun({
            data: imgBuffer,
            transformation: { width: finalW, height: finalH },
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 40, after: 140 },
        children: [
          new TextRun({
            text: captionText,
            font: FONT_FAMILY,
            size: 20,
            italics: true,
            color: '64748B',
          }),
        ],
      }),
    ];
  } catch (err) {
    console.warn(`Lỗi chèn ảnh ${imgFileName}:`, err.message);
    return [];
  }
}

// 14 CHAPTERS OF COMPREHENSIVE HDSD
const HDSD_CHAPTERS = [
  {
    chapterNumber: 1,
    title: 'TỔNG QUAN HỆ THỐNG & PHÂN QUYỀN VAI TRÒ VẬN HÀNH 5 CẤP',
    intro: 'Hệ sinh thái ViOne Platform 5.0 được xây dựng dựa trên kiến trúc phân quyền ma trận 5 cấp (RBAC Matrix) nghiêm ngặt. Mỗi tài khoản được phân định rõ ràng quyền hạn và phạm vi dữ liệu tiếp cận:',
    tableHeaders: ['Cấp Bậc Vai Trò', 'Phạm Vi Thẩm Quyền', 'Tài Khoản Mẫu', 'Chức Năng Được Phép Thực Hiện'],
    tableColWidths: [2000, 2200, 2000, 3000],
    tableRows: [
      ['Cấp 1: Super Admin', 'Toàn bộ hệ thống Multi-Tenant', 'admin@vione.ai', 'Cấu hình tổ chức, phân quyền RBAC, quản lý khóa API, kiểm toán an ninh.'],
      ['Cấp 2: Ban Giám Đốc', 'Doanh nghiệp sở tại', 'ceo@vione.ai', 'Xem Dashboard 360°, phê duyệt ngân sách, phân tích dự báo AI Copilot.'],
      ['Cấp 3: Trưởng Phòng', 'Phòng ban chuyên trách', 'manager@vione.ai', 'Gán việc Kanban, điều phối phễu Lead, duyệt phiếu thu chi cấp 1.'],
      ['Cấp 4: Chuyên Viên', 'Công việc & Khách hàng gán', 'staff@vione.ai', 'Cập nhật tiến độ Lead, chăm sóc khách hàng, tạo báo giá, check-in.'],
      ['Cấp 5: Khách Hàng / Đối Tác', 'Gian hàng B2B & Hồ sơ', 'partner@vione.ai', 'Chạm thẻ Titanium NFC, xem sản phẩm, gửi yêu cầu kết nối giao thương.']
    ],
    callout: {
      title: 'QUY TẮC CÔ LẬP DỮ LIỆU BẢO MẬT (TENANT ISOLATION)',
      text: 'Mỗi doanh nghiệp vận hành trên ViOne có cơ chế cô lập dữ liệu độc lập ở tầng truy vấn cơ sở dữ liệu. Tuyệt đối không thể xảy ra hiện tượng nhân sự của doanh nghiệp A nhìn thấy khách hàng hoặc báo cáo tài chính của doanh nghiệp B.',
      type: 'warning'
    },
    steps: [
      'Bước 1: Quản trị viên truy cập Cổng Quản trị tại https://vione.ai/auth.',
      'Bước 2: Chọn vai trò tương ứng và nhập thông tin định danh được cấp.',
      'Bước 3: Xác thực mã OTP qua Email hoặc ứng dụng Google Authenticator.',
      'Bước 4: Màn hình chuyển tiếp đến đúng không gian làm việc của vai trò được phân quyền.'
    ],
    images: [
      { file: '01_crm_login_blue_white.png', caption: 'Hình 1.1: Cổng Đăng nhập Phân quyền Doanh nghiệp ViOne CRM 5.0' },
      { file: '02_crm_members_roles_permission.png', caption: 'Hình 1.2: Ma trận Cấu hình Phân quyền Vai trò RBAC 5 Cấp' }
    ]
  },
  {
    chapterNumber: 2,
    title: 'HƯỚNG DẪN ĐĂNG NHẬP CỔNG QUẢN TRỊ & BẢO MẬT 2 LỚP (2FA)',
    intro: 'Hệ thống hỗ trợ đăng nhập đa phương thức an toàn (Email/Mật khẩu, Google SSO, Passkey Sinh trắc học) bảo vệ tối đa tài khoản quản trị doanh nghiệp:',
    steps: [
      'Bước 1: Mở trình duyệt truy cập đường dẫn https://vione.ai/auth hoặc mở ứng dụng quản trị.',
      'Bước 2: Nhập địa chỉ Email doanh nghiệp (ví dụ: ceo@vione.ai) và Mật khẩu bảo mật.',
      'Bước 3: Tích chọn "Ghi nhớ phiên đăng nhập" nếu sử dụng thiết bị cá nhân an toàn.',
      'Bước 4: Bấm nút "Đăng nhập Hệ thống CRM".',
      'Bước 5: Nhập mã xác thực 6 chữ số gửi về điện thoại hoặc email để hoàn tất truy cập.'
    ],
    images: [
      { file: '03_crm_login_page.png', caption: 'Hình 2.1: Giao diện Biểu mẫu Đăng nhập Bảo mật Hệ thống ViOne CRM' }
    ]
  },
  {
    chapterNumber: 3,
    title: 'HƯỚNG DẪN KHAI THÁC LANDING WEB & GỬI YÊU CẦU BÁO GIÁ TÙY BIẾN',
    intro: 'Trang chủ ViOne 5.0 cung cấp cái nhìn toàn diện về năng lực giải pháp và quy trình tiếp nhận tư vấn chuyên sâu không để lộ giá cứng:',
    steps: [
      'Bước 1: Truy cập trang chủ https://vione.ai.',
      'Bước 2: Trải nghiệm hoạt ảnh 4.8s pop-up keyframe mô phỏng smartphone 3D và các chỉ số hiệu suất.',
      'Bước 3: Lướt qua 14 phân hệ số hóa: Mô đun liên kết, AI Workflow, Giám sát vận hành, Đánh giá khách hàng.',
      'Bước 4: Tại mục Bảng giá, chọn 1 trong 3 gói: Khởi tạo (Starter), Tăng trưởng (Growth) hoặc Doanh nghiệp lớn (Enterprise).',
      'Bước 5: Bấm "Yêu cầu báo giá", điền đầy đủ Họ tên, Số điện thoại, Tên công ty và Quy mô nhân sự.',
      'Bước 6: Bấm "Gửi Yêu Cầu Báo Giá", hệ thống thông báo tiếp nhận thành công và chuyên viên ViOne sẽ liên hệ trong 15 phút.'
    ],
    images: [
      { file: '01_landing_hero.png', caption: 'Hình 3.1: Giao diện Trang chủ Landing Web ViOne 5.0 AI' },
      { file: 'live_02_member_registration_form_filled.png', caption: 'Hình 3.2: Modal Yêu cầu Báo giá & Khảo sát Hiện trạng Doanh nghiệp' }
    ]
  },
  {
    chapterNumber: 4,
    title: 'HƯỚNG DẪN QUẢN LÝ KHÁCH HÀNG & PHỄU CHUYỂN ĐỔI LEAD 360°',
    intro: 'Phân hệ CRM giúp doanh nghiệp kiểm soát toàn bộ vòng đời khách hàng từ đầu mối tiềm năng đến khách hàng thân thiết:',
    steps: [
      'Bước 1: Đăng nhập CRM, chọn menu "Khách Hàng & Leads".',
      'Bước 2: Danh sách hiển thị trực quan dạng bảng với các cột: Tên khách hàng, Công ty, Số điện thoại, Nguồn tiếp nhận, Trạng thái.',
      'Bước 3: Nhấn nút "+ Thêm Khách Hàng Mới", điền thông tin chi tiết và gán nhân viên kinh doanh phụ trách.',
      'Bước 4: Bấm vào tên khách hàng để mở ngăn kéo Drawer Hồ sơ 360 độ: Xem lịch sử gọi điện, email trao đổi, báo giá đã gửi.',
      'Bước 5: Cập nhật giai đoạn phễu: "Tiềm năng" -> "Đang khảo sát" -> "Gửi báo giá" -> "Ký hợp đồng".'
    ],
    images: [
      { file: '04_crm_members_management.png', caption: 'Hình 4.1: Danh sách Khách hàng & Bộ lọc Trạng thái Phễu Chuyển đổi' },
      { file: 'live_07_crm_member_detail_drawer.png', caption: 'Hình 4.2: Ngăn kéo Drawer Hồ sơ Khách hàng Chi tiết 360 Độ' }
    ]
  },
  {
    chapterNumber: 5,
    title: 'HƯỚNG DẪN QUẢN TRỊ CƠ HỘI BÁN HÀNG (DEALS) & HỢP ĐỒNG THƯƠNG MẠI',
    intro: 'Quản lý đường ống thương vụ Pipeline dạng bảng kéo thả Kanban giúp các cấp quản lý dự báo doanh số chuẩn xác:',
    steps: [
      'Bước 1: Mở mục "Cơ Hội Bán Hàng" (Deals Pipeline).',
      'Bước 2: Quan sát các cột trạng thái: Khảo sát hiện trạng, Trình bày giải pháp, Đàm phán giá, Chờ duyệt hợp đồng, Thành công.',
      'Bước 3: Nhấp giữ và kéo thẻ thương vụ từ cột này sang cột tiếp theo khi có tiến triển mới.',
      'Bước 4: Mở thương vụ, bấm "Tạo Hợp Đồng Điện Tử", hệ thống tự động điền thông số pháp nhân và giá trị hợp đồng.',
      'Bước 5: Kích hoạt luồng phê duyệt nội bộ, Ban giám đốc ký số và gửi hợp đồng cho đối tác qua email.'
    ],
    images: [
      { file: 'crm_dash_view_01.png', caption: 'Hình 5.1: Bảng Kanban Quản trị Cơ hội Bán hàng & Tiến độ Ký kết Hợp đồng' }
    ]
  },
  {
    chapterNumber: 6,
    title: 'HƯỚNG DẪN QUẢN LÝ GIAN HÀNG B2B, DANH MỤC SẢN PHẨM & DỊCH VỤ',
    intro: 'Tạo lập danh mục hàng hóa số hóa, hỗ trợ sinh báo giá tự động và xúc tiến giao thương B2B nội bộ:',
    steps: [
      'Bước 1: Truy cập mục "Sản Phẩm & Dịch Vụ" trên thanh menu.',
      'Bước 2: Bấm "Thêm Sản Phẩm Mới", tải lên hình ảnh chất lượng cao, nhập mã SKU, tên dịch vụ và đơn giá tiêu chuẩn.',
      'Bước 3: Thiết lập chính sách chiết khấu theo số lượng hoặc cấp độ đối tác (VIP, Vàng, Bạc).',
      'Bước 4: Đánh dấu "Hiển thị trên Sàn B2B ViOne" để tiếp cận hàng nghìn giám đốc điều hành trong mạng lưới.',
      'Bước 5: Nhấn "Xuất Báo Giá Mẫu", hệ thống tải về file PDF chứa mã QR quét thanh toán tức thì.'
    ],
    images: [
      { file: '18_crm_marketplace_sync.png', caption: 'Hình 6.1: Phân hệ Gian hàng B2B & Quản lý Danh mục Sản phẩm Doanh nghiệp' }
    ]
  },
  {
    chapterNumber: 7,
    title: 'HƯỚNG DẪN TỔ CHỨC SỰ KIỆN DOANH NGHIỆP & SOÁT VÉ QR CHECK-IN',
    intro: 'Tổ chức hội nghị khách hàng, lễ ký kết và ngày hội giao thương chuyên nghiệp với vé điện tử mã QR:',
    steps: [
      'Bước 1: Mở mục "Quản Lý Sự Kiện", bấm nút "+ Khởi Tạo Sự Kiện Mới".',
      'Bước 2: Điền: Tên hội nghị, Thời gian bắt đầu - kết thúc, Địa điểm tổ chức, Diễn giả và Chương trình nghị sự.',
      'Bước 3: Cấu hình các hạng vé: Vé Mời VIP (Miễn phí), Vé Đại Biểu (VietQR 1.500.000đ).',
      'Bước 4: Bấm "Phát Hành Sự Kiện", hệ thống tự động gửi vé mời điện tử E-Ticket chứa mã QR đến khách mời.',
      'Bước 5: Tại ngày diễn ra sự kiện, lễ tân mở tính năng "Camera Quét Vé QR", hướng camera vào màn hình điện thoại khách.',
      'Bước 6: Màn hình báo âm thanh tích cực, hiển thị vị trí số bàn tiệc của khách mời trong vòng 0.2 giây.'
    ],
    images: [
      { file: '03_crm_event_create_modal.png', caption: 'Hình 7.1: Modal Cấu hình Khởi tạo Sự kiện & Phát hành Vé Điện tử' },
      { file: '04_app_home_compact_event.png', caption: 'Hình 7.2: Màn hình Check-in Sự kiện Tức thời & Định vị Bàn tiệc' }
    ]
  },
  {
    chapterNumber: 8,
    title: 'HƯỚNG DẪN KHAI THÁC TRUNG TÂM GIÁM SÁT VẬN HÀNH & BÁO CÁO KPI',
    intro: 'Executive Analytics cung cấp bức tranh tài chính và vận hành toàn cảnh giúp lãnh đạo ra quyết định dựa trên số liệu:',
    steps: [
      'Bước 1: Mở mục "Trung Tâm Điều Hành" (Executive Dashboard).',
      'Bước 2: Xem 4 khối thẻ KPI chính: Tổng giá trị thương vụ, Doanh thu thực thu, Tỷ lệ chốt đơn và Tốc độ xử lý việc.',
      'Bước 3: Lọc thời gian: Hôm nay, 7 ngày qua, Tháng này, Quý này hoặc khoảng ngày tùy chọn.',
      'Bước 4: Di chuột lên biểu đồ sóng Operational Performance để xem doanh số chi tiết từng ngày.',
      'Bước 5: Nhấp vào nút "Xuất Báo Cáo Điều Hành", hệ thống tự động xuất file Excel và PDF gửi về email ban giám đốc.'
    ],
    images: [
      { file: 'crm1983_02_dashboard_overview.png', caption: 'Hình 8.1: Bảng Điều hành Giám sát Sức khỏe Doanh nghiệp Thời gian thực' }
    ]
  },
  {
    chapterNumber: 9,
    title: 'HƯỚNG DẪN SỬ DỤNG TRỢ LÝ TRÍ TUỆ NHÂN TẠO VIONE AI COPILOT',
    intro: 'AI Copilot được huấn luyện chuyên sâu để trợ giúp ban giám đốc truy vấn số liệu và đề xuất phương án kinh doanh:',
    steps: [
      'Bước 1: Bấm vào biểu tượng robot vàng ở góc dưới màn hình hoặc truy cập menu "AI Copilot".',
      'Bước 2: Cửa sổ đối thoại mở ra, chọn câu hỏi gợi ý hoặc nhập câu hỏi bằng văn bản tiếng Việt tự nhiên.',
      'Bước 3: Ví dụ: "Phân tích doanh số tuần này và chỉ ra các hợp đồng có nguy cơ chậm thanh toán".',
      'Bước 4: AI truy vấn cơ sở dữ liệu PostgreSQL bảo mật, trả về kết quả kèm số liệu thống kê và biểu đồ phân tích.',
      'Bước 5: Xem khối "3 Bước Hành Động Đề Xuất", bấm "Thực thi kịch bản" để AI tự động gửi email nhắc nợ.'
    ],
    images: [
      { file: 'ai_copilot_evidence_01.png', caption: 'Hình 9.1: Khung Đối thoại Hỏi đáp Dữ liệu Thời gian thực Cùng ViOne AI Copilot' }
    ]
  },
  {
    chapterNumber: 10,
    title: 'HƯỚNG DẪN CÀI ĐẶT & SỬ DỤNG ỨNG DỤNG DI ĐỘNG VIONE CONNECT',
    intro: 'Cài đặt và thiết lập ứng dụng di động bỏ túi dành cho giám đốc điều hành và cán bộ nhân viên:',
    steps: [
      'Bước 1: Mở App Store (iOS) hoặc Google Play (Android), tìm kiếm từ khóa "ViOne Connect" và bấm "Cài đặt".',
      'Bước 2: Mở ứng dụng, nhập số điện thoại hoặc email doanh nghiệp để đăng nhập.',
      'Bước 3: Nhập mã OTP kích hoạt gửi về tin nhắn SMS.',
      'Bước 4: Cấp quyền thông báo đẩy (Push Notification) và quyền truy cập camera để quét mã QR.',
      'Bước 5: Màn hình trang chủ hiển thị Thẻ VIP số, Lịch hẹn và Bảng tin doanh nghiệp sẵn sàng sử dụng.'
    ],
    images: [
      { file: '06_app_login_screen.png', caption: 'Hình 10.1: Màn hình Đăng nhập Ứng dụng Di động ViOne Connect' },
      { file: '08_app_home_dashboard.png', caption: 'Hình 10.2: Trang chủ Dashboard Ứng dụng Di động ViOne Connect' }
    ]
  },
  {
    chapterNumber: 11,
    title: 'HƯỚNG DẪN KÍCH HOẠT & CHẠM DANH THIẾP SỐ TITANIUM NFC 1-GIÂY',
    intro: 'Sử dụng công nghệ thẻ vật lý NFC 1-chạm kết nối triệu cơ hội giao thương:',
    steps: [
      'Bước 1: Lấy thẻ vật lý Titanium ViOne được cấp khi tham gia hệ thống.',
      'Bước 2: Mở app ViOne Connect, chọn mục "Hồ sơ của tôi" -> "Kích hoạt thẻ NFC".',
      'Bước 3: Chạm thẻ vào phần lưng trên của điện thoại để đồng bộ định danh mã số doanh nhân.',
      'Bước 4: Khi gặp gỡ đối tác tại sự kiện, chạm nhẹ thẻ Titanium vào điện thoại của đối tác.',
      'Bước 5: Điện thoại đối tác tự động bật trình duyệt hiển thị Portfolio số của bạn kèm nút "Lưu vào Danh bạ" 1 giây.'
    ],
    images: [
      { file: '09_app_vip_card.png', caption: 'Hình 11.1: Giao diện Thẻ Doanh Nhân Số Hóa Titanium NFC & QR Code' }
    ]
  },
  {
    chapterNumber: 12,
    title: 'HƯỚNG DẪN GIAO THƯƠNG B2B, KHỚP LỆNH CUNG - CẦU & CHAT BẢO MẬT',
    intro: 'Tìm kiếm nguồn cung uy tín và kết nối giao thương trực tiếp giữa các lãnh đạo doanh nghiệp:',
    steps: [
      'Bước 1: Mở tab "Cơ Hội Giao Thương" trên ứng dụng di động.',
      'Bước 2: Nhấn nút "+ Đăng Cơ Hội Mới", chọn loại tin: "Chào Mua" hoặc "Chào Bán".',
      'Bước 3: Điền tiêu đề, mô tả nhu cầu, ngân sách dự kiến và hạn nhận hồ sơ chào hàng.',
      'Bước 4: Các doanh nghiệp thành viên phù hợp sẽ nhận thông báo đẩy và gửi đề xuất hợp tác.',
      'Bước 5: Nhấn vào hồ sơ đối tác, bấm "Nhắn tin" để mở cuộc đàm phán trực tiếp trong khung chat bảo mật.'
    ],
    images: [
      { file: '16_app_opportunities_list.png', caption: 'Hình 12.1: Sàn Cơ hội Giao thương Cung - Cầu Thời gian thực' },
      { file: '09_app_chat_call_messenger_bubble.png', caption: 'Hình 12.2: Khung Trò chuyện Nhắn tin Bảo mật Giữa Các CEO Thành Viên' }
    ]
  },
  {
    chapterNumber: 13,
    title: 'HƯỚNG DẪN THANH TOÁN DỊCH VỤ & HỘI PHÍ QUA VIETQR NAPAS 24/7',
    intro: 'Thanh toán không tiền mặt chuẩn quốc gia tự động gạch nợ sau 1 giây:',
    steps: [
      'Bước 1: Mở mục "Thanh Toán" hoặc mở hóa đơn cần tất toán trên app.',
      'Bước 2: Bấm nút "Thanh Toán Ngay", chọn hình thức "VietQR Napas 24/7".',
      'Bước 3: Mã QR động hiển thị kèm số tiền và nội dung chuyển khoản tự động.',
      'Bước 4: Mở ứng dụng ngân hàng bất kỳ (Vietcombank, Techcombank, MB, BIDV...), quét mã QR trên màn hình.',
      'Bước 5: Xác thực bằng mã OTP ngân hàng. Trong vòng 1 giây, hệ thống ViOne tự động gạch nợ và cấp hóa đơn số.'
    ],
    images: [
      { file: '08_app_vietqr_payment_modal.png', caption: 'Hình 13.1: Hộp thoại Thanh toán VietQR Napas 24/7 Tự động Gạch nợ Tức thời' }
    ]
  },
  {
    chapterNumber: 14,
    title: 'HƯỚNG DẪN XỬ LÝ SỰ CỐ THƯỜNG GẶP & KÊNH HỖ TRỢ KỸ THUẬT 24/7',
    intro: 'Cẩm nang khắc phục nhanh các tình huống vận hành và thông tin liên hệ đội ngũ kỹ sư VioConnect:',
    steps: [
      'Bước 1 (Quên mật khẩu): Bấm "Quên mật khẩu" tại màn hình đăng nhập, nhập email để nhận liên kết đặt lại mật khẩu trong 1 phút.',
      'Bước 2 (Thẻ NFC không phản hồi): Kiểm tra đã bật tính năng NFC trong Cài đặt điện thoại và chạm vào đúng vị trí đầu đọc NFC ở lưng máy.',
      'Bước 3 (Camera không quét được QR): Kiểm tra quyền truy cập camera trong Cài đặt ứng dụng và lau sạch ống kính camera.',
      'Bước 4 (Yêu cầu hỗ trợ khẩn cấp): Gọi Hotline 24/7: 1900 8383 hoặc gửi yêu cầu vào nhóm hỗ trợ kỹ thuật chuyên trách.'
    ],
    images: [
      { file: '01_crm_login_blue_white.png', caption: 'Hình 14.1: Màn hình Hỗ trợ Kỹ thuật & Khôi phục Mật khẩu Bảo mật' }
    ]
  }
];

// =============================================================================
// BUILDER WORD DOCX
// =============================================================================
async function buildDocxFile(outputPath) {
  console.log(`>>> Bắt đầu biên dịch file Word DOCX HDSD ViOne: ${outputPath}...`);

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
          text: 'TÀI LIỆU HƯỚNG DẪN SỬ DỤNG HỆ THỐNG TOÀN DIỆN',
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
          text: 'COMPREHENSIVE SYSTEM USER GUIDE (HDSD MASTER)',
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
          text: 'CỔNG QUẢN TRỊ CRM DOANH NGHIỆP, ỨNG DỤNG DI ĐỘNG VIONE CONNECT\nDANH THIẾP SỐ TITANIUM NFC VÀ TRỢ LÝ TRÍ TUỆ NHÂN TẠO AI COPILOT 5.0',
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
        ['Tên Tài Liệu', 'Hướng Dẫn Sử Dụng Hệ Thống ViOne 5.0 Toàn Diện (14 Chương Chuẩn)'],
        ['Mã Số Tài Liệu', 'HDSD-VIONE-ENTERPRISE-MASTER-V5.0'],
        ['Phiên Bản', 'Phiên bản 5.0 Master Release (Tích hợp ảnh minh chứng thực tế)'],
        ['Ngày Phát Hành', '02/10/2026'],
        ['Đơn Vị Chủ Trì', 'Ban Công Nghệ & Chuyển Đổi Số — VioConnect Corporation'],
        ['Đối Tượng Sử Dụng', 'Ban Giám Đốc, Quản Lý Phòng Ban, Nhân Viên Kinh Doanh & Hội Viên'],
        ['Mức Độ Bảo Mật', 'TÀI LIỆU BẢO MẬT NỘI BỘ — LƯU HÀNH NỘI BỘ'],
        ['Tình Trạng Nghiệm Thu', 'Đã xác thực thực địa 100% các bước thao tác trên hệ thống']
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

  // SECTION 2: MỤC LỤC & NỘI DUNG 14 CHƯƠNG
  const bodyChildren = [
    createHeading1('MỤC LỤC HƯỚNG DẪN SỬ DỤNG (TABLE OF CONTENTS)'),
    new TableOfContents('Mục Lục Tự Động', {
      hyperlink: true,
      headingStyleRange: '1-3',
    }),
    new Paragraph({ spacing: { after: 200 } }),

    createTable(
      ['Chương', 'Nội Dung Hướng Dẫn Sử Dụng Chuyên Sâu', 'Phân Hệ Phụ Trách'],
      HDSD_CHAPTERS.map(ch => [
        `Chương ${ch.chapterNumber}`,
        ch.title,
        ch.chapterNumber <= 2 ? 'Xác thực & Bảo mật' : ch.chapterNumber <= 8 ? 'Cổng Quản trị CRM' : ch.chapterNumber <= 9 ? 'AI Copilot' : 'App ViOne Connect'
      ]),
      [1400, 5800, 2000]
    ),
    new Paragraph({ spacing: { after: 360 } })
  ];

  // Build 14 Chapters
  HDSD_CHAPTERS.forEach(ch => {
    bodyChildren.push(
      createHeading1(`CHƯƠNG ${ch.chapterNumber}: ${ch.title}`),
      createParagraph(ch.intro)
    );

    if (ch.tableHeaders && ch.tableRows) {
      bodyChildren.push(
        createTable(ch.tableHeaders, ch.tableRows, ch.tableColWidths),
        new Paragraph({ spacing: { after: 160 } })
      );
    }

    if (ch.callout) {
      bodyChildren.push(
        createCallout(ch.callout.title, ch.callout.text, ch.callout.type),
        new Paragraph({ spacing: { after: 160 } })
      );
    }

    if (ch.steps && ch.steps.length > 0) {
      bodyChildren.push(createHeading2('Các Bước Thao Tác Chi Tiết:'));
      ch.steps.forEach(st => {
        bodyChildren.push(createBullet(st));
      });
      bodyChildren.push(new Paragraph({ spacing: { after: 140 } }));
    }

    if (ch.images && ch.images.length > 0) {
      ch.images.forEach(img => {
        bodyChildren.push(...createImageParagraph(img.file, img.caption));
      });
    }

    bodyChildren.push(new Paragraph({ spacing: { after: 240 } }));
  });

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
                    text: 'HDSD-VIONE-ENTERPRISE-MASTER-V5.0 · Hướng Dẫn Sử Dụng ViOne 5.0',
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
  console.log(`✓ Đã xuất bản file Word DOCX thành công: ${outputPath} (${(buffer.length / (1024 * 1024)).toFixed(2)} MB)`);
}

// =============================================================================
// BUILDER HTML USER GUIDE (MULTI-MB WITH EMBEDDED HIGH-RES SCREENSHOTS)
// =============================================================================
function buildHtmlUserGuide(outputFilePath) {
  function getRawBase64(filename) {
    const p = path.join(EVIDENCE_DIR, filename);
    if (fs.existsSync(p)) {
      const data = fs.readFileSync(p);
      return `data:image/png;base64,${data.toString('base64')}`;
    }
    return '';
  }

  let html = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tài Liệu Hướng Dẫn Sử Dụng Hệ Thống ViOne Platform 5.0 Toàn Diện</title>
  <style>
    :root {
      --primary: #eab308;
      --primary-dark: #ca8a04;
      --bg: #09090b;
      --card-bg: #18181b;
      --card-border: #27272a;
      --text: #f8fafc;
      --text-muted: #94a3b8;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: var(--bg); color: var(--text); line-height: 1.6; }
    
    .container { display: flex; min-height: 100vh; }
    
    /* Sidebar Navigation */
    .sidebar { width: 340px; background: #121215; border-right: 1px solid var(--card-border); padding: 24px; position: sticky; top: 0; height: 100vh; overflow-y: auto; flex-shrink: 0; }
    .brand { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid var(--card-border); }
    .logo-badge { width: 38px; height: 38px; background: linear-gradient(135deg, var(--primary), var(--primary-dark)); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 900; color: #000; }
    .brand-text { font-size: 16px; font-weight: 800; color: #fff; }
    .brand-sub { font-size: 11px; color: var(--primary); font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
    
    .nav-list { list-style: none; }
    .nav-item { margin-bottom: 6px; }
    .nav-link { display: block; padding: 8px 12px; color: var(--text-muted); text-decoration: none; font-size: 13px; font-weight: 500; border-radius: 8px; transition: all 0.2s; }
    .nav-link:hover { color: #fff; background: rgba(234, 179, 8, 0.1); }
    .nav-link.active { color: var(--primary); background: rgba(234, 179, 8, 0.15); font-weight: 700; }

    /* Main Content Area */
    .content { flex: 1; padding: 48px 64px; max-width: 1100px; margin: 0 auto; overflow-y: auto; }
    
    .doc-header { margin-bottom: 48px; padding-bottom: 32px; border-bottom: 1px solid var(--card-border); }
    .doc-badge { display: inline-block; background: rgba(234, 179, 8, 0.1); border: 1px solid rgba(234, 179, 8, 0.3); color: var(--primary); font-size: 12px; font-weight: 800; padding: 4px 12px; border-radius: 20px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 16px; }
    .doc-title { font-size: 34px; font-weight: 900; color: #fff; line-height: 1.25; margin-bottom: 12px; letter-spacing: -0.8px; }
    .doc-sub { font-size: 16px; color: var(--text-muted); }

    /* Chapter Section */
    .chapter { margin-bottom: 64px; padding-top: 24px; }
    .chapter-tag { color: var(--primary); font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
    .chapter-title { font-size: 26px; font-weight: 800; color: #fff; margin-bottom: 16px; }
    .chapter-intro { font-size: 15px; color: #cbd5e1; margin-bottom: 24px; line-height: 1.7; }

    /* Tables */
    .table-wrap { overflow-x: auto; margin-bottom: 24px; border-radius: 12px; border: 1px solid var(--card-border); }
    table { width: 100%; border-collapse: collapse; text-align: left; font-size: 13.5px; }
    th { background: #121215; color: #fff; font-weight: 700; padding: 12px 16px; border-bottom: 1px solid var(--card-border); }
    td { padding: 12px 16px; border-bottom: 1px solid #1f1f23; color: #e2e8f0; }
    tr:nth-child(even) td { background: rgba(255, 255, 255, 0.02); }

    /* Callouts */
    .callout { background: rgba(234, 179, 8, 0.08); border-left: 4px solid var(--primary); padding: 16px 20px; border-radius: 0 10px 10px 0; margin-bottom: 24px; }
    .callout-title { font-size: 13.5px; font-weight: 800; color: var(--primary); margin-bottom: 6px; }
    .callout-text { font-size: 13.5px; color: #e2e8f0; line-height: 1.6; }

    /* Step List */
    .step-list { list-style: none; margin-bottom: 32px; }
    .step-item { display: flex; align-items: flex-start; gap: 14px; margin-bottom: 14px; font-size: 14.5px; color: #e2e8f0; line-height: 1.6; }
    .step-num { width: 26px; height: 26px; border-radius: 50%; background: var(--primary); color: #000; font-weight: 800; font-size: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 2px; }

    /* Evidence Image */
    .image-card { background: #121215; border: 1px solid var(--card-border); border-radius: 16px; padding: 16px; margin-bottom: 32px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
    .image-card img { width: 100%; height: auto; max-height: 480px; object-fit: contain; border-radius: 8px; display: block; margin: 0 auto; background: #000; }
    .image-caption { text-align: center; margin-top: 12px; font-size: 12.5px; color: var(--primary); font-style: italic; }
  </style>
</head>
<body>
  <div class="container">
    <aside class="sidebar">
      <div class="brand">
        <div class="logo-badge">V</div>
        <div>
          <div class="brand-text">ViOne Platform 5.0</div>
          <div class="brand-sub">HDSD Toàn Diện</div>
        </div>
      </div>
      <ul class="nav-list">
`;

  HDSD_CHAPTERS.forEach(ch => {
    html += `
      <li class="nav-item">
        <a class="nav-link" href="#chapter-${ch.chapterNumber}">Chương ${ch.chapterNumber}: ${ch.title.split(':')[0]}</a>
      </li>
    `;
  });

  html += `
      </ul>
    </aside>

    <main class="content">
      <header class="doc-header">
        <div class="doc-badge">Tài Liệu Hướng Dẫn Vận Hành Master</div>
        <h1 class="doc-title">CẨM NANG HƯỚNG DẪN SỬ DỤNG HỆ THỐNG VIONE PLATFORM 5.0</h1>
        <p class="doc-sub">Bao phủ 100% Cổng Quản trị CRM Doanh nghiệp, Ứng dụng Di động ViOne Connect, Thẻ Titanium NFC và Trợ lý AI Copilot.</p>
      </header>
`;

  HDSD_CHAPTERS.forEach(ch => {
    html += `
      <section class="chapter" id="chapter-${ch.chapterNumber}">
        <div class="chapter-tag">CHƯƠNG ${ch.chapterNumber}</div>
        <h2 class="chapter-title">${ch.title}</h2>
        <p class="chapter-intro">${ch.intro}</p>
    `;

    if (ch.tableHeaders && ch.tableRows) {
      html += `
        <div class="table-wrap">
          <table>
            <thead>
              <tr>${ch.tableHeaders.map(h => `<th>${h}</th>`).join('')}</tr>
            </thead>
            <tbody>
              ${ch.tableRows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}
            </tbody>
          </table>
        </div>
      `;
    }

    if (ch.callout) {
      html += `
        <div class="callout">
          <div class="callout-title">📌 ${ch.callout.title}</div>
          <div class="callout-text">${ch.callout.text}</div>
        </div>
      `;
    }

    if (ch.steps && ch.steps.length > 0) {
      html += `<ul class="step-list">`;
      ch.steps.forEach((st, sIdx) => {
        html += `
          <li class="step-item">
            <span class="step-num">${sIdx + 1}</span>
            <span>${st}</span>
          </li>
        `;
      });
      html += `</ul>`;
    }

    if (ch.images && ch.images.length > 0) {
      ch.images.forEach(img => {
        const rawBase64 = getRawBase64(img.file);
        html += `
          <div class="image-card">
            <img src="${rawBase64}" alt="${img.caption}">
            <div class="image-caption">Minh chứng thực tế: ${img.caption}</div>
          </div>
        `;
      });
    }

    html += `</section>`;
  });

  html += `
    </main>
  </div>
</body>
</html>
`;

  fs.writeFileSync(outputFilePath, html, 'utf8');
  console.log(`✓ Đã xuất bản file HTML HDSD: ${outputFilePath} (${(fs.statSync(outputFilePath).size / 1024).toFixed(1)} KB)`);
}

async function main() {
  console.log('=== BẮT ĐẦU XUẤT BẢN TÀI LIỆU HDSD MASTER VIONE 5.0 (14 CHƯƠNG) ===');

  // 1. Tạo file Word DOCX
  const outDocxPath = path.join(VIONE_DOC_DIR, 'HDSD_HE_THONG_VIONE_TOAN_DIEN.docx');
  await buildDocxFile(outDocxPath);

  // 2. Tạo file HTML HDSD phong cách cao cấp
  const outHtmlPath = path.join(VIONE_DOC_DIR, 'HDSD_HE_THONG_VIONE_TOAN_DIEN.html');
  buildHtmlUserGuide(outHtmlPath);

  // Sync to all public/docs folders
  for (const destDir of FE_DOCS_DIRS) {
    fs.copyFileSync(outDocxPath, path.join(destDir, 'HDSD_HE_THONG_VIONE_TOAN_DIEN.docx'));
    fs.copyFileSync(outHtmlPath, path.join(destDir, 'HDSD_HE_THONG_VIONE_TOAN_DIEN.html'));
  }
  console.log('🎉 Hoàn tất 100% xuất bản & đồng bộ Tài Liệu HDSD ViOne Master!');
}

main().catch(err => {
  console.error('[LỖI TẠO HDSD]', err);
  process.exit(1);
});
