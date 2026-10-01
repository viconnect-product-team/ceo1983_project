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
  ImageRun,
  ExternalHyperlink,
} = require('docx');

const ROOT_DIR = path.resolve(__dirname, '..');
const DOC_DIR = path.join(ROOT_DIR, 'document');
const FE_DOCS_DIR = path.join(ROOT_DIR, 'apps', 'ceo1983_app_fe', 'public', 'docs');
const IMG_DIR = path.join(DOC_DIR, 'images', 'evidence');

const FONT_FAMILY = 'Times New Roman';
const COLOR_NAVY = '003B95';
const COLOR_BLUE_ACCENT = '0084FF';
const COLOR_GOLD = 'D97706';
const COLOR_DARK = '1E293B';
const COLOR_BG_HEADER = '003B95';
const COLOR_BG_ALT = 'F8FAFC';
const TABLE_WIDTH_DXA = 9200;

const BORDER_STYLE_THIN = {
  top: { style: BorderStyle.SINGLE, size: 4, color: 'CBD5E1' },
  bottom: { style: BorderStyle.SINGLE, size: 4, color: 'CBD5E1' },
  left: { style: BorderStyle.SINGLE, size: 4, color: 'CBD5E1' },
  right: { style: BorderStyle.SINGLE, size: 4, color: 'CBD5E1' },
};

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
        size: 24, // 12pt
        bold: true,
        color: COLOR_GOLD,
      }),
    ],
  });
}

function createParagraph(text) {
  const lines = String(text || '').split('\n');
  const children = [];
  lines.forEach((line, idx) => {
    children.push(
      new TextRun({
        text: line,
        break: idx > 0 ? 1 : 0,
        font: FONT_FAMILY,
        size: 24, // 12pt
        color: COLOR_DARK,
      })
    );
  });
  return new Paragraph({
    spacing: { before: 60, after: 60, line: 276 },
    children,
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
                    text: text,
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
  const sum = colWidths && colWidths.length > 0 ? colWidths.reduce((a, b) => a + Number(b), 0) : 0;
  const finalColWidths = headers.map((_, i) => {
    if (sum > 0 && colWidths[i] !== undefined) {
      return Math.round((Number(colWidths[i]) / sum) * TABLE_WIDTH_DXA);
    }
    return Math.round(TABLE_WIDTH_DXA / headers.length);
  });

  const tableRows = [];

  // Header Row
  const headerCells = headers.map((h, i) => {
    return new TableCell({
      width: { size: finalColWidths[i], type: WidthType.DXA },
      shading: { fill: COLOR_BG_HEADER, type: ShadingType.CLEAR },
      borders: BORDER_STYLE_THIN,
      margins: { top: 120, bottom: 120, left: 140, right: 140 },
      children: [
        new Paragraph({
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

function createImageParagraph(imgFileName, captionText, defaultWidth = 520, defaultHeight = 280) {
  if (!imgFileName) return [];
  const p = path.join(IMG_DIR, imgFileName);
  if (!fs.existsSync(p)) return [];
  try {
    const imgBuffer = fs.readFileSync(p);

    // Đọc kích thước thực từ IHDR chunk của PNG (bytes 16-23)
    let realWidth = 0;
    let realHeight = 0;
    if (imgBuffer.length > 24 && imgBuffer.readUInt32BE(0) === 0x89504E47) {
      realWidth = imgBuffer.readUInt32BE(16);
      realHeight = imgBuffer.readUInt32BE(20);
    }

    const isPortrait = (realHeight > 0 && realWidth > 0 && realHeight > realWidth * 1.15);
    const isMobile = isPortrait || imgFileName.includes('app_') || imgFileName.includes('app1983_') || imgFileName.includes('mobile');

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
            transformation: { width: width, height: height },
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 40, after: 160 },
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
    console.warn(`Lỗi chèn ảnh ${imgFileName}:`, err.message);
    return [];
  }
}

// Nội dung các chương của tài liệu HDSD
const HDSD_CHAPTERS = [
  {
    chapterTitle: 'CHƯƠNG 1: TỔNG QUAN HỆ THỐNG & DANH SÁCH 6 BAN ĐIỀU HÀNH CHUYÊN TRÁCH',
    intro: `Hệ sinh thái số hóa CLB Doanh Nhân CEO 1983 (trực thuộc Hội Doanh Nhân Trẻ Hà Nội - HanoiBA) được thiết kế vận hành chuyên nghiệp, chuẩn mực bám sát mô hình tổ chức hiệp hội. Hệ thống tuyệt đối không dùng tài khoản chung mà phân quyền độc lập theo 6 Ban chuyên môn điều hành với thẩm quyền rõ ràng:`,
    tableHeaders: ['Ban Chuyên Môn', 'Email Đăng Nhập', 'Mật Khẩu', 'Phân Hệ Phụ Trách', 'Nhiệm Vụ & Quyền Hạn Nghiệp Vụ'],
    tableColWidths: [1800, 2200, 1000, 1600, 2600],
    tableRows: [
      ['Ban Quản Trị (BQT)', 'admin@connect.vn', '123456', 'Cổng Quản Trị', 'Toàn quyền cấu hình hệ thống, kiểm soát bảo mật, phân quyền RBAC và phê duyệt ngân sách cấp cao.'],
      ['Ban Thư Ký (BTK)', 'ceo.tongthuky@ceo1983.com', '123456', 'Quản Lý Họp BCH', 'Lên lịch họp giao ban, điểm danh QR cuộc họp, lưu trữ biên bản nghị quyết. Tuyệt đối không có quyền duyệt hội viên.'],
      ['Ban Thành Viên (BTV)', 'ceo.thanhvien@ceo1983.com', '123456', 'Quản Lý Hội Viên', 'Độc quyền thẩm định hồ sơ, kiểm tra MST pháp nhân, cấp mã hội viên CEO-83xxx và phát hành tài khoản mật khẩu.'],
      ['Ban Thiện Nguyện (BTN)', 'ceo.thiennguyen@ceo1983.com', '123456', 'Sổ Quỹ Thiện Nguyện', 'Quản trị Quỹ An Sinh Xã Hội "Áo Ấm Cho Em", duyệt chi 3 cấp và công khai sao kê minh bạch thời gian thực.'],
      ['Ban Truyền Thông (BTT)', 'ceo.truyenthong@ceo1983.com', '123456', 'Sự Kiện & Tin Tức', 'Quản lý tin tức bản tin nội bộ, sự kiện Gala, thiết kế banner truyền thông và quét mã QR soát vé tại cổng an ninh.'],
      ['Ban Xúc Tiến (BXT)', 'ceo.xuctien@ceo1983.com', '123456', 'Gian Hàng B2B', 'Quản trị Gian hàng B2B Doanh nhân CEO 1983, thẩm định chất lượng sản phẩm và khớp lệnh cơ hội Cung - Cầu 1-1.']
    ],
    callout: {
      title: 'QUY TẮC PHÂN ĐỊNH THẨM QUYỀN NGHIÊM NGẶT (STRICT RBAC)',
      text: 'Chức năng phê duyệt kết nạp và cấp tài khoản hội viên thuộc thẩm quyền độc quyền của Ban Thành Viên và Ban Quản Trị. Ban Thư Ký và các ban khác không có quyền duyệt hội viên nhằm đảm bảo tính độc lập và minh bạch trong công tác tổ chức nhân sự của Hiệp hội.',
      type: 'warning'
    },
    images: [
      { file: 'bqt_screen.png', caption: 'Hình 1.1: Giao diện Cổng Quản Trị Trung Tâm của Ban Quản Trị' }
    ]
  },
  {
    chapterTitle: 'CHƯƠNG 2: HƯỚNG DẪN ĐĂNG KÝ GIA NHẬP CLB TRỰC TUYẾN DÀNH CHO DOANH NHÂN MỚI',
    intro: `Doanh nhân sinh năm Quý Hợi 1983 mong muốn gia nhập CLB thực hiện theo quy trình đăng ký số hóa 100% không cần nộp hồ sơ giấy:`,
    steps: [
      {
        textPrefix: 'Bước 1: Doanh nhân truy cập Cổng Thông Tin Điện Tử chính thức của CLB hoặc nộp hồ sơ trực tuyến tại ',
        linkText: 'Cổng Tiếp Nhận Hồ Sơ Gia Nhập CLB Doanh Nhân CEO 1983 Trực Tuyến',
        linkUrl: 'https://14.225.217.232:5444/landing?apply=%22true%22',
        textSuffix: ', bấm nút "Đăng Ký Gia Nhập CLB".'
      },
      'Bước 2: Mẫu đơn đăng ký điện tử hiển thị. Doanh nhân điền chính xác thông tin: Họ và tên (Phạm Văn Vũ), Ngày sinh (09/01/1983), Số điện thoại (0901201983), Email đại diện (vupv090120@gmail.com), Tên công ty (Công ty CP Công nghệ VIO CONNECT), Mã số thuế (0109831983), Chức vụ (Tổng Giám Đốc), Ngành nghề hoạt động và Nguyện vọng tham gia Ban chuyên môn.',
      'Bước 3: Kiểm tra kỹ các thông tin đã điền và nhấn "Gửi Đơn Đăng Ký Gia Nhập".',
      'Bước 4: Màn hình hiển thị thông báo tiếp nhận hồ sơ thành công và thông báo mã tra cứu.',
      'Bước 5: Hệ thống tự động kích hoạt máy chủ thư tín gửi email xác nhận trang trọng đến hòm thư vupv090120@gmail.com kèm hướng dẫn quy chế CLB.'
    ],
    images: [
      { file: '01_landing_hero.png', caption: 'Hình 2.1: Cổng thông tin điện tử chính thức CLB Doanh Nhân CEO 1983' },
      { file: 'live_02_member_registration_form_filled.png', caption: 'Hình 2.2: Mẫu đơn đăng ký gia nhập trực tuyến (Ứng viên: Phạm Văn Vũ - vupv090120@gmail.com)' },
      { file: 'live_03_member_registration_submitted_success.png', caption: 'Hình 2.3: Màn hình tiếp nhận đơn đăng ký gia nhập thành công' },
      { file: 'live_09_email_template_credentials_sent_vu.png', caption: 'Hình 2.4: Email tự động xác nhận tiếp nhận hồ sơ gửi tới hòm thư vupv090120@gmail.com' }
    ]
  },
  {
    chapterTitle: 'CHƯƠNG 3: QUY TRÌNH THẨM ĐỊNH & PHÊ DUYỆT HỘI VIÊN CHÍNH THỨC (ĐỘC QUYỀN BAN THÀNH VIÊN)',
    intro: `Ban Thành Viên chịu trách nhiệm giữ gìn uy tín và chất lượng của cộng đồng doanh nhân thông qua quy trình thẩm định 360 độ:`,
    steps: [
      'Bước 1: Chuyên viên Ban Thành Viên đăng nhập Cổng Quản Trị bằng tài khoản ceo.thanhvien@ceo1983.com.',
      'Bước 2: Mở menu "Quản Lý Hội Viên", chọn tab "Chờ Thẩm Định". Danh sách các hồ sơ mới nộp sẽ hiển thị theo thứ tự thời gian.',
      'Bước 3: Bấm vào hồ sơ ứng viên Phạm Văn Vũ để mở ngăn kéo thẩm định chi tiết 360 độ: Đối soát năm sinh (1983), tra cứu tình trạng hoạt động của Mã số thuế trên Cổng thông tin quốc gia về đăng ký doanh nghiệp, đánh giá năng lực công ty.',
      'Bước 4: Sau khi thẩm định đạt tiêu chuẩn, bấm nút "Phê Duyệt Kết Nạp & Cấp Tài Khoản".',
      'Bước 5: Hệ thống tự động cấp Mã hội viên độc bản CEO-83007, kích hoạt trạng thái "Hội viên Chính thức", tạo tài khoản bảo mật và tự động gửi email chào mừng kèm mật khẩu khởi tạo tới vupv090120@gmail.com.'
    ],
    images: [
      { file: 'btv_screen.png', caption: 'Hình 3.1: Phân hệ Quản Lý Hội Viên của Ban Thành Viên trên Cổng Quản Trị' },
      { file: 'live_07_crm_member_detail_drawer.png', caption: 'Hình 3.2: Ngăn kéo Drawer thẩm định chi tiết hồ sơ doanh nghiệp 360 độ' },
      { file: 'live_08_crm_member_approved_credentials_toast.png', caption: 'Hình 3.3: Thông báo phê duyệt kết nạp thành công và cấp mã hội viên CEO-83007' }
    ]
  },
  {
    chapterTitle: 'CHƯƠNG 4: HƯỚNG DẪN ĐIỀU HÀNH CUỘC HỌP BAN CHẤP HÀNH & NGHỊ QUYẾT ĐIỆN TỬ (BAN THƯ KÝ)',
    intro: `Ban Thư Ký là cơ quan điều hành công tác văn phòng, tổ chức các phiên họp thường kỳ và quản lý kho tư liệu hiệp hội:`,
    steps: [
      'Bước 1: Ban Thư Ký đăng nhập bằng tài khoản ceo.tongthuky@ceo1983.com, mở mục "Quản Lý Cuộc Họp".',
      'Bước 2: Nhấn "Tạo Cuộc Họp Mới", điền: Tiêu đề phiên họp, Thời gian bắt đầu - kết thúc, Địa điểm phòng họp trực tiếp hoặc link trực tuyến.',
      'Bước 3: Tải lên tài liệu: Chương trình nghị sự (Agenda), Báo cáo tháng và Dự thảo nghị quyết.',
      'Bước 4: Bấm "Phát Hành Giấy Triệu Tập". Lịch họp tự động đồng bộ vào Ứng dụng di động của tất cả đại biểu Ban Chấp Hành.',
      'Bước 5: Tại phiên họp, Ban Thư Ký mở màn hình "Điểm Danh Đại Biểu" để quét mã QR thẻ đại biểu hoặc điểm danh trực tiếp. Khi kết thúc phiên họp, bấm "Xuất Biên Bản Nghị Quyết Điện Tử".'
    ],
    images: [
      { file: 'btk_screen.png', caption: 'Hình 4.1: Phân hệ Quản Lý Cuộc Họp Ban Chấp Hành của Ban Thư Ký' },
      { file: 'crm1983_09_meetings_calendar.png', caption: 'Hình 4.2: Lịch họp Ban Chấp Hành và điều hành phòng họp tập trung' },
      { file: 'crm_documents_library.png', caption: 'Hình 4.3: Kho tài liệu pháp lý, quy chế và văn bản điều hành điện tử CLB' }
    ]
  },
  {
    chapterTitle: 'CHƯƠNG 5: HƯỚNG DẪN QUẢN TRỊ SỰ KIỆN GALA, SƠ ĐỒ GHẾ NGỒI & SOÁT VÉ QR (BAN TRUYỀN THÔNG & BTC)',
    intro: `Công tác tổ chức các sự kiện lớn như Gala Thường Niên, Diễn đàn kinh tế và Họp Đại hội được quản trị đồng bộ từ khâu thiết kế vé đến khâu an ninh tại cổng:`,
    steps: [
      'Bước 1: Ban Truyền Thông / Ban Tổ Chức đăng nhập tài khoản ceo.truyenthong@ceo1983.com, mở mục "Quản Lý Sự Kiện".',
      'Bước 2: Tạo sự kiện mới: Tên chương trình "Gala Hội Ngộ Doanh Nhân CEO 1983", Thời gian, Địa điểm sảnh tiệc, Diễn giả và Banner nhận diện 16:9.',
      'Bước 3: Cấu hình các hạng vé: Vé Hội viên chính thức (Miễn phí 0đ), Vé Khách mời VIP (Có phí 1.500.000 VNĐ qua VietQR Napas).',
      'Bước 4: Thiết lập sơ đồ chỗ ngồi Cinema Seating Map: Phân bổ bàn Kim Cương VIP, bàn Vàng Ban Điều Hành, bàn Bạc Hội viên.',
      'Bước 5: Vận hành cổng an ninh Check-in: Tại cửa đón tiếp, nhân viên mở Camera Soát Vé trên máy tính bảng hoặc điện thoại. Khách xuất trình mã QR trên vé điện tử, camera nhận diện trong 0.2 giây. Màn hình viền xanh lục xác nhận vé hợp lệ và thông báo vị trí bàn ngồi; Màn hình viền đỏ cảnh báo nếu vé bị quét trùng.'
    ],
    images: [
      { file: 'btt_screen.png', caption: 'Hình 5.1: Phân hệ Quản Trị Sự Kiện & Truyền Thông của Ban Truyền Thông' },
      { file: 'crm_05_events_list.png', caption: 'Hình 5.2: Danh sách sự kiện Gala và quản lý các gói vé tham dự' },
      { file: 'live_18_crm_event_create_paid_modal.png', caption: 'Hình 5.3: Hộp thoại cấu hình vé mời VIP có phí và tài khoản thụ hưởng VietQR' },
      { file: 'live_22_crm_event_registrations_paid_confirm.png', caption: 'Hình 5.4: Bảng theo dõi danh sách đại biểu đăng ký và trạng thái thanh toán vé' },
      { file: 'live_23_crm_gate_checkin_scanner.png', caption: 'Hình 5.5: Màn hình Camera Soát Vé An Ninh chuyên dụng tại cổng đón tiếp' },
      { file: 'live_24_checkin_valid_green_success.png', caption: 'Hình 5.6: Kết quả quét vé HỢP LỆ (Viền xanh lục) hiển thị vị trí bàn VIP' },
      { file: 'live_25_checkin_duplicate_red_alert.png', caption: 'Hình 5.7: Cảnh báo vé TRÙNG LẶP / GIAN LẬN (Viền đỏ rực) kích hoạt tức thì' }
    ]
  },
  {
    chapterTitle: 'CHƯƠNG 6: HƯỚNG DẪN QUẢN TRỊ GIAN HÀNG B2B & KẾT NỐI CUNG - CẦU (BAN XÚC TIẾN THƯƠNG MẠI)',
    intro: `Ban Xúc Tiến Thương Mại giữ vai trò cầu nối giao thương, thúc đẩy tiêu dùng nội bộ và gia tăng doanh số thực chất cho các doanh nghiệp hội viên:`,
    steps: [
      'Bước 1: Ban Xúc Tiến đăng nhập bằng tài khoản ceo.xuctien@ceo1983.com, mở mục "Gian Hàng B2B".',
      'Bước 2: Xem danh sách sản phẩm chờ kiểm duyệt từ các hội viên. Kiểm tra thông số kỹ thuật, hình ảnh, chứng nhận chất lượng và chính sách trợ giá nội bộ (Tối thiểu chiết khấu 10%).',
      'Bước 3: Nhấn nút "Phê Duyệt & Niêm Yết Lên Sàn". Sản phẩm lập tức xuất hiện trên Gian hàng B2B của Ứng dụng Hội viên.',
      'Bước 4: Mở mục "Cơ Hội Cung - Cầu": Rà soát các nhu cầu mua bán, sử dụng tính năng "Gợi Ý Khớp Lệnh 1-1" để kết nối hai doanh nghiệp có ngành nghề phù hợp.',
      'Bước 5: Định kỳ hàng quý, nhấn nút "Xuất Báo Cáo Giao Thương B2B" để thống kê tổng doanh số hợp đồng đã thực hiện giữa các thành viên.'
    ],
    images: [
      { file: 'bxt_screen.png', caption: 'Hình 6.1: Phân hệ Quản Lý Gian Hàng B2B & Xúc Tiến Thương Mại' },
      { file: 'crm_10_marketplace_sync.png', caption: 'Hình 6.2: Kiểm duyệt và đồng bộ danh mục sản phẩm trên Gian hàng B2B' },
      { file: 'crm_11_opportunities_sync.png', caption: 'Hình 6.3: Quản lý và điều phối các cơ hội kết nối Cung - Cầu nội bộ' },
      { file: 'crm1983_17_marketplace_b2b.png', caption: 'Hình 6.4: Báo cáo tổng hợp số liệu giao dịch và hiệu quả giao thương B2B' }
    ]
  },
  {
    chapterTitle: 'CHƯƠNG 7: HƯỚNG DẪN QUẢN TRỊ SỔ QUỸ CASHBOOK, QUỸ THIỆN NGUYỆN & TÀI CHÍNH (BAN THIỆN NGUYỆN & KẾ TOÁN)',
    intro: `Tài chính của CLB Doanh Nhân CEO 1983 được quản trị minh bạch tuyệt đối qua Sổ Quỹ Thu Chi 3 cấp duyệt và cổng sao kê thời gian thực:`,
    steps: [
      'Bước 1: Ban Thiện Nguyện đăng nhập bằng tài khoản ceo.thiennguyen@ceo1983.com, mở mục "Sổ Quỹ Thu Chi".',
      'Bước 2: Lập phiếu chi hoạt động: Nhập lý do chi, số tiền, chọn nguồn quỹ tương ứng và đính kèm hóa đơn chứng từ.',
      'Bước 3: Quy trình duyệt chi 3 cấp: Người lập phiếu (Chờ soát) -> Kế toán trưởng (Đã kiểm tra) -> Chủ tịch CLB (Phê duyệt xuất quỹ).',
      'Bước 4: Quản lý Quỹ An Sinh Xã Hội "Áo Ấm Cho Em": Theo dõi các khoản ủng hộ qua mã VietQR chuyển thẳng vào tài khoản MB Bank chuyên dùng.',
      'Bước 5: Nhấn "Xuất Báo Cáo Tài Chính": Kết xuất sao kê chi tiết phục vụ các phiên họp Ban Chấp Hành và công khai minh bạch trước toàn thể hội viên.'
    ],
    images: [
      { file: 'btn_screen.png', caption: 'Hình 7.1: Phân hệ Sổ Quỹ & Hoạt Động Xã Hội của Ban Thiện Nguyện' },
      { file: 'crm1983_12_income_management.png', caption: 'Hình 7.2: Quản lý các nguồn thu hội phí và dòng tiền hoạt động' },
      { file: 'crm1983_13_expenses_management.png', caption: 'Hình 7.3: Quy trình kiểm soát phiếu chi và giải ngân có chứng từ hợp lệ' },
      { file: 'crm1983_14_finance_report.png', caption: 'Hình 7.4: Báo cáo tài chính minh bạch và sao kê dòng tiền Quỹ Thiện Nguyện' }
    ]
  },
  {
    chapterTitle: 'CHƯƠNG 8: HƯỚNG DẪN VẬN HÀNH ỨNG DỤNG DOANH NHÂN CEO 1983 DÀNH CHO HỘI VIÊN',
    intro: `Ứng Dụng Doanh Nhân CEO 1983 là người bạn đồng hành số hóa cao cấp, giúp hội viên kết nối, sinh hoạt và phát triển kinh doanh mọi lúc mọi nơi:`,
    steps: [
      '1. Đăng nhập lần đầu & Đổi mật khẩu: Mở ứng dụng, nhập email vupv090120@gmail.com và mật khẩu khởi tạo được cấp. Hệ thống tự động chuyển sang màn hình Bắt buộc đổi mật khẩu mới để bảo mật tuyệt đối.',
      '2. Thẻ Hội Viên VIP 3D & Danh Thiếp Số: Mở mục "Thẻ VIP", thẻ nhận diện Navy & Amber Gold hiển thị với mã QR cá nhân độc bản. Hội viên có thể chạm mặt lưng điện thoại vào máy đối tác (NFC 1 chạm) để truyền danh bạ ngay tức thì.',
      '3. Danh Bạ Doanh Nhân & Hẹn Gặp 1-1: Tìm kiếm đối tác theo ngành nghề trong danh bạ 500+ CEO. Bấm "Gửi Lời Mời Hẹn Gặp 1-1" để kết nối hợp tác kinh doanh.',
      '4. Mua Sắm & Bán Hàng Trên Gian Hàng B2B: Khám phá hàng trăm sản phẩm dịch vụ chất lượng cao với giá ưu đãi nội bộ. Hội viên có thể đăng bán sản phẩm của công ty mình và nhận đơn đặt hàng trực tiếp.',
      '5. Nhận Vé Sự Kiện & Quét Mã Check-in: Xem lịch sự kiện Gala, bấm nhận vé VIP miễn phí. Xuất trình mã QR E-Ticket tại cổng đón tiếp để vào hội trường trong 0.2 giây.',
      '6. Biểu Quyết Đại Hội Điện Tử: Tham gia bỏ phiếu bầu cử Ban Chấp Hành trực tuyến bảo mật theo nguyên tắc 1 người 1 phiếu duy nhất.',
      '7. Đóng Hội Phí & Ủng Hộ Thiện Nguyện Qua VietQR 24/7: Bấm thanh toán, quét mã VietQR Napas trên bất kỳ App ngân hàng nào, hệ thống tự động gạch nợ thành công trong 1 giây.'
    ],
    images: [
      { file: 'live_10_app_login_screen.png', caption: 'Hình 8.1: Màn hình Đăng Nhập Ứng Dụng Doanh Nhân CEO 1983' },
      { file: 'live_11_app_login_filled_vu.png', caption: 'Hình 8.2: Nhập tài khoản vupv090120@gmail.com và mật khẩu khởi tạo' },
      { file: 'live_12_app_onboarding_password_change.png', caption: 'Hình 8.3: Bắt buộc đổi mật khẩu mới ngay trong lần đăng nhập đầu tiên' },
      { file: 'app_02_home_dashboard.png', caption: 'Hình 8.4: Màn hình Trang Chủ Dashboard Hội Viên Doanh Nhân CEO 1983' },
      { file: 'live_26_app_vip_3d_card.png', caption: 'Hình 8.5: Thẻ Hội Viên VIP 3D Hoàng Gia xoay lật 180 độ tôn vinh thương hiệu cá nhân' },
      { file: 'app_identity_card_vip.png', caption: 'Hình 8.6: Thẻ danh thiếp điện tử thông minh tích hợp chip NFC và mã QR độc bản' },
      { file: 'live_27_public_digital_card_web.png', caption: 'Hình 8.7: Trang Danh thiếp điện tử công khai hiển thị khi chạm thẻ NFC' },
      { file: 'app_step_07_members_directory.png', caption: 'Hình 8.8: Danh bạ doanh nhân thành viên tra cứu theo chuyên ban và ngành nghề' },
      { file: 'live_30_app_member_profile_edit.png', caption: 'Hình 8.9: Chỉnh sửa thông tin hồ sơ doanh nhân và cập nhật hồ sơ năng lực công ty' },
      { file: 'app_step_11_events_list.png', caption: 'Hình 8.10: Danh sách sự kiện Gala và lịch hoạt động của CLB' },
      { file: 'live_16_guest_free_register_success_eticket.png', caption: 'Hình 8.11: Thẻ vé điện tử E-Ticket QR và Mã quay số may mắn Lucky Draw' },
      { file: 'sub_31b_app_checkin_screen.png', caption: 'Hình 8.12: Màn hình xuất trình vé điện tử tại cửa đón tiếp sự kiện' },
      { file: 'app_step_15_marketplace_grid.png', caption: 'Hình 8.13: Gian hàng B2B Doanh nhân CEO 1983 với chính sách ưu đãi độc quyền' },
      { file: 'app_step_18_opportunities_feed.png', caption: 'Hình 8.14: Bảng tin kết nối cơ hội kinh doanh Cung - Cầu realtime' },
      { file: 'live_29_app_opportunities_feed_1on1.png', caption: 'Hình 8.15: Giao diện gửi lời mời kết nối hẹn gặp giao thương 1-1 giữa các CEO' },
      { file: 'app_step_09_messages_inbox.png', caption: 'Hình 8.16: Hộp thư trao đổi tin nhắn và kết nối hợp tác kinh doanh nội bộ' },
      { file: 'app_step_14_voting_luckydraw.png', caption: 'Hình 8.17: Màn hình biểu quyết đại hội điện tử 1 người 1 phiếu và quay thưởng Lucky Draw' },
      { file: 'app_step_20_annual_fee_renewal.png', caption: 'Hình 8.18: Thanh toán hội phí và ủng hộ quỹ thiện nguyện qua mã VietQR tự động gạch nợ' },
      { file: 'app_step_21_notifications_screen.png', caption: 'Hình 8.19: Trung tâm thông báo đẩy cá nhân hóa theo dõi toàn bộ hoạt động' },
      { file: 'app_step_22_news_screen.png', caption: 'Hình 8.20: Mục tin tức, phóng sự và bản tin nội bộ "Tiếng Nói Doanh Nhân 1983"' },
      { file: 'sub_47_app_settings_password_security.png', caption: 'Hình 8.21: Cài đặt an toàn tài khoản, đổi mật khẩu và bảo mật hai lớp 2FA' }
    ]
  },
  {
    chapterTitle: 'CHƯƠNG 9: HƯỚNG DẪN BẢO MẬT, SAO LƯU DỮ LIỆU & QUẢN TRỊ TỐI CAO (BAN QUẢN TRỊ)',
    intro: `Ban Quản Trị nắm giữ quyền điều hành hạ tầng kỹ thuật, đảm bảo hệ thống luôn vận hành ổn định 24/7 và an toàn tuyệt đối:`,
    steps: [
      '1. Cấu hình Phân quyền RBAC: Quản lý ma trận phân quyền chi tiết cho 6 Ban chuyên môn và người dùng hệ thống.',
      '2. Giám sát Nhật ký Kiểm toán (Audit Logs): Toàn bộ thao tác phê duyệt hội viên, duyệt chi tài chính, chỉnh sửa sự kiện đều được ghi nhận nhật ký bất biến.',
      '3. Sao lưu Dữ liệu Tự động (Automated Backup): Hệ thống tự động sao lưu dữ liệu quan hệ và tệp đa phương tiện định kỳ vào 03:00 sáng mỗi ngày.',
      '4. Quản lý Nhà tài trợ & Banner Quảng cáo: Phân bổ các gói tài trợ Kim Cương, Vàng, Bạc và điều phối banner trượt trên toàn hệ sinh thái.',
      '5. Tùy biến Nhận diện Thương hiệu: Cấu hình bảng màu, logo và phông chữ đồng bộ theo tiêu chuẩn HanoiBA.'
    ],
    images: [
      { file: 'crm_roles_permissions.png', caption: 'Hình 9.1: Cấu hình ma trận phân quyền vai trò (RBAC) cho 6 Ban chuyên môn' },
      { file: 'crm1983_15_sponsors_management.png', caption: 'Hình 9.2: Quản lý danh sách nhà tài trợ và các gói quyền lợi kim cương' },
      { file: 'crm_02_dashboard_kpi.png', caption: 'Hình 9.3: Bảng chỉ số phát triển toàn diện phục vụ báo cáo Đại hội nhiệm kỳ' }
    ]
  }
];

// Hàm tạo Markdown HDSD
function generateHdsdMarkdown() {
  let md = `# SỔ TAY HƯỚNG DẪN SỬ DỤNG & VẬN HÀNH TOÀN DIỆN

# HỆ SINH THÁI CÔNG NGHỆ SỐ HÓA CLB DOANH NHÂN CEO 1983 (HANOIBA)

---

## 1. THÔNG TIN CHUNG TÀI LIỆU

* **Tên tài liệu:** Sổ Tay Hướng Dẫn Sử Dụng & Vận Hành Toàn Diện Hệ Thống
* **Đơn vị ban hành:** Ban Chấp Hành CLB Doanh Nhân CEO 1983 (Trực thuộc Hội Doanh Nhân Trẻ Hà Nội - HanoiBA)
* **Đối tượng sử dụng:** Ban Lãnh Đạo, 6 Ban Chuyên Môn Điều Hành và Toàn Thể Hội Viên Doanh Nhân CEO 1983
* **Phiên bản:** Version 4.0 Production Master Release
* **Ngày phát hành:** 01/10/2026
* **Email tài khoản mẫu:** \`vupv090120@gmail.com\` (Doanh nhân Phạm Văn Vũ - CEO Công ty CP Công nghệ VIO CONNECT, Mã HV: \`CEO-83007\`)
* **Trạng thái:** Đã kiểm thử thực tế và nghiệm thu bàn giao 100%

---

`;

  HDSD_CHAPTERS.forEach((ch, idx) => {
    md += `## ${ch.chapterTitle}\n\n`;
    md += `${ch.intro}\n\n`;

    if (ch.tableHeaders && ch.tableRows) {
      md += `| ${ch.tableHeaders.join(' | ')} |\n`;
      md += `| ${ch.tableHeaders.map(() => ':---').join(' | ')} |\n`;
      ch.tableRows.forEach(r => {
        md += `| ${r.join(' | ')} |\n`;
      });
      md += `\n`;
    }

    if (ch.callout) {
      md += `> **${ch.callout.title}**\n>\n> ${ch.callout.text}\n\n`;
    }

    if (ch.steps) {
      ch.steps.forEach(st => {
        md += `* ${st}\n`;
      });
      md += `\n`;
    }

    if (ch.images && ch.images.length > 0) {
      ch.images.forEach(img => {
        md += `### ${img.caption}\n\n`;
        md += `![${img.caption}](images/evidence/${img.file})\n\n`;
      });
    }

    md += `---\n\n`;
  });

  return md;
}

// Hàm build file Word DOCX
async function buildMasterUserGuideDocx() {
  console.log('=== BẮT ĐẦU XUẤT BẢN FILE WORD HDSD TOÀN DIỆN CEO 1983 (DOCX & MD) ===');

  const docChildren = [];

  // ==================== BÌA TÀI LIỆU ====================
  docChildren.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 100 },
      children: [
        new TextRun({
          text: 'CÂU LẠC BỘ DOANH NHÂN CEO 1983 (HANOIBA)',
          font: FONT_FAMILY,
          size: 24, // 12pt
          bold: true,
          color: COLOR_GOLD,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 50, after: 400 },
      children: [
        new TextRun({
          text: 'HỘI DOANH NHÂN TRẺ HÀ NỘI — VIONE CONNECT ECOSYSTEM',
          font: FONT_FAMILY,
          size: 20,
          color: '64748B',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 400, after: 200 },
      children: [
        new TextRun({
          text: 'HƯỚNG DẪN SỬ DỤNG & VẬN HÀNH TOÀN DIỆN',
          font: FONT_FAMILY,
          size: 36, // 18pt
          bold: true,
          color: COLOR_NAVY,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 100, after: 400 },
      children: [
        new TextRun({
          text: 'HỆ SINH THÁI CÔNG NGHỆ SỐ HÓA HIỆP HỘI DOANH NHÂN CEO 1983',
          font: FONT_FAMILY,
          size: 26, // 13pt
          bold: true,
          color: COLOR_BLUE_ACCENT,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 100, after: 600 },
      children: [
        new TextRun({
          text: 'Cổng Thông Tin Công Khai, Cổng Quản Trị Ban Chấp Hành & Ứng Dụng Doanh Nhân CEO 1983',
          font: FONT_FAMILY,
          size: 22,
          italics: true,
          color: '475569',
        }),
      ],
    })
  );

  // Bảng thông tin tài liệu & Cấu hình 6 Ban
  const coverHeaders = ['Hạng Mục', 'Thông Tin Chi Tiết'];
  const coverRows = [
    ['Mã Tài Liệu', 'HDSD-CEO1983-MASTER-V4.0'],
    ['Phiên Bản', 'Version 4.0 Production Master (Đầy đủ 6 Ban & Toàn bộ phân hệ)'],
    ['Đơn Vị Chủ Quản', 'CLB Doanh Nhân CEO 1983 (Trực thuộc Hội Doanh Nhân Trẻ Hà Nội - HanoiBA)'],
    ['Đơn Vị Phát Triển', 'Ban Công Nghệ & Chuyển Đổi Số — ViConnect Platform'],
    ['Phạm Vi Áp Dụng', 'Cổng Thông Tin Điện Tử, Cổng Quản Trị Ban Chấp Hành & Ứng Dụng Hội Viên'],
    ['Email Đăng Ký Đại Diện', 'vupv090120@gmail.com (Doanh nhân Phạm Văn Vũ - CEO Công ty CP Công nghệ VIO CONNECT)'],
    ['Mã Hội Viên Đại Diện', 'CEO-83007'],
    ['Cổng Thanh Toán VietQR', 'Napas 24/7 Tự Động Gạch Nợ & Tạo Mã QR Động Trong 1 Giây'],
    ['Trạng Thái Nghiệm Thu', 'Đã thẩm định thực tế và nghiệm thu bàn giao 100%']
  ];
  docChildren.push(createTable(coverHeaders, coverRows, [2800, 6400]));

  docChildren.push(
    new Paragraph({
      pageBreakBefore: true,
      spacing: { before: 200 },
    })
  );

  // Thêm nội dung các chương vào file Word
  HDSD_CHAPTERS.forEach((ch, idx) => {
    docChildren.push(createHeading1(ch.chapterTitle));
    docChildren.push(createParagraph(ch.intro));

    if (ch.tableHeaders && ch.tableRows) {
      docChildren.push(createTable(ch.tableHeaders, ch.tableRows, ch.tableColWidths));
      docChildren.push(new Paragraph({ spacing: { after: 140 } }));
    }

    if (ch.callout) {
      docChildren.push(createCallout(ch.callout.title, ch.callout.text, ch.callout.type));
      docChildren.push(new Paragraph({ spacing: { after: 140 } }));
    }

    if (ch.steps) {
      ch.steps.forEach(st => {
        if (typeof st === 'string') {
          docChildren.push(createBullet(st));
        } else if (st && st.linkUrl) {
          docChildren.push(
            new Paragraph({
              bullet: { level: 0 },
              spacing: { before: 40, after: 40, line: 260 },
              children: [
                new TextRun({
                  text: st.textPrefix,
                  font: FONT_FAMILY,
                  size: 21,
                  color: COLOR_DARK,
                }),
                new ExternalHyperlink({
                  children: [
                    new TextRun({
                      text: st.linkText,
                      font: FONT_FAMILY,
                      size: 21,
                      bold: true,
                      color: COLOR_BLUE_ACCENT,
                      underline: {},
                    }),
                  ],
                  link: st.linkUrl,
                }),
                new TextRun({
                  text: st.textSuffix,
                  font: FONT_FAMILY,
                  size: 21,
                  color: COLOR_DARK,
                }),
              ],
            })
          );
        }
      });
      docChildren.push(new Paragraph({ spacing: { after: 140 } }));
    }

    if (ch.images && ch.images.length > 0) {
      ch.images.forEach(img => {
        docChildren.push(createHeading3(img.caption));
        const imgParas = createImageParagraph(img.file, img.caption);
        docChildren.push(...imgParas);
      });
    }

    docChildren.push(new Paragraph({ spacing: { after: 240 } }));
  });

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440,
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
                    text: 'HDSD-CEO1983-MASTER-V4.0 · CLB Doanh Nhân CEO 1983 (HanoiBA)',
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
  const outDocxPath = path.join(DOC_DIR, 'HDSD_HE_THONG_CEO1983_TOAN_DIEN.docx');
  fs.writeFileSync(outDocxPath, buffer);
  console.log(`✓ Đã lưu file Word HDSD: ${outDocxPath} (${(buffer.length / 1024).toFixed(1)} KB)`);

  // Tạo file Markdown HDSD
  const mdContent = generateHdsdMarkdown();
  const outMdPath = path.join(DOC_DIR, 'HDSD_HE_THONG_CEO1983_TOAN_DIEN.md');
  fs.writeFileSync(outMdPath, mdContent, 'utf8');
  console.log(`✓ Đã lưu Markdown HDSD: ${outMdPath} (${(Buffer.byteLength(mdContent) / 1024).toFixed(1)} KB)`);

  // Đồng bộ sang public/docs
  if (!fs.existsSync(FE_DOCS_DIR)) fs.mkdirSync(FE_DOCS_DIR, { recursive: true });
  fs.copyFileSync(outDocxPath, path.join(FE_DOCS_DIR, 'HDSD_HE_THONG_CEO1983_TOAN_DIEN.docx'));
  fs.copyFileSync(outMdPath, path.join(FE_DOCS_DIR, 'HDSD_HE_THONG_CEO1983_TOAN_DIEN.md'));
  console.log(`✓ Đã đồng bộ HDSD sang thư mục docs của frontend thành công.`);

  console.log('=== HOÀN TẤT XUẤT BẢN HDSD TOÀN DIỆN (DOCX & MD) THÀNH CÔNG 100%! ===');
}

buildMasterUserGuideDocx().catch(err => {
  console.error('Lỗi khi xuất bản HDSD DOCX:', err);
  process.exit(1);
});
