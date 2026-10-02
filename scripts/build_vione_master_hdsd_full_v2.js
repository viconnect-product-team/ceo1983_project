// scripts/build_vione_master_hdsd_full_v2.js - Comprehensive User Manual (HDSD Master v5.0)
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
  PageBreak,
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
    spacing: { before: 260, after: 100 },
    children: [
      new TextRun({
        text,
        font: FONT_FAMILY,
        size: 28, // 14pt
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
        text,
        font: FONT_FAMILY,
        size: 23, // 11.5pt
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
    return [];
  }
}

function getImgBase64(filename) {
  const p = path.join(EVIDENCE_DIR, filename);
  if (fs.existsSync(p)) {
    const data = fs.readFileSync(p);
    return `data:image/png;base64,${data.toString('base64')}`;
  }
  return '';
}

// 14 CHI TIẾT CHƯƠNG HDSD
const HDSD_CHAPTERS = [
  {
    chapterNumber: 1,
    title: 'TỔNG QUAN HỆ THỐNG & PHÂN QUYỀN VAI TRÒ VẬN HÀNH 5 CẤP',
    intro: 'Hệ sinh thái ViOne Platform 5.0 được xây dựng dựa trên kiến trúc phân quyền ma trận 5 cấp (RBAC Matrix) nghiêm ngặt. Mỗi tài khoản được phân định rõ ràng quyền hạn và phạm vi dữ liệu tiếp cận:',
    fields: [
      ['Cấp 1: Super Admin', 'Toàn bộ hệ thống Multi-Tenant', 'admin@vione.ai', 'Cấu hình tổ chức, phân quyền RBAC, quản lý khóa API, kiểm toán an ninh.'],
      ['Cấp 2: Ban Giám Đốc', 'Doanh nghiệp sở tại', 'ceo@vione.ai', 'Xem Dashboard 360°, phê duyệt ngân sách, phân tích dự báo AI Copilot.'],
      ['Cấp 3: Trưởng Phòng', 'Phòng ban chuyên trách', 'manager@vione.ai', 'Gán việc Kanban, điều phối phễu Lead, duyệt phiếu thu chi cấp 1.'],
      ['Cấp 4: Chuyên Viên', 'Công việc & Khách hàng gán', 'staff@vione.ai', 'Cập nhật tiến độ Lead, chăm sóc khách hàng, tạo báo giá, check-in.'],
      ['Cấp 5: Khách Hàng / Đối Tác', 'Gian hàng B2B & Hồ sơ', 'partner@vione.ai', 'Chạm thẻ Titanium NFC, xem sản phẩm, gửi yêu cầu kết nối giao thương.']
    ],
    fieldHeaders: ['Cấp Bậc Vai Trò', 'Phạm Vi Thẩm Quyền', 'Tài Khoản Mẫu', 'Chức Năng Được Phép Thực Hiện'],
    callout: 'QUY TẮC CÔ LẬP DỮ LIỆU BẢO MẬT (TENANT ISOLATION): Mỗi doanh nghiệp vận hành trên ViOne có cơ chế cô lập dữ liệu độc lập ở tầng truy vấn cơ sở dữ liệu. Tuyệt đối không thể xảy ra hiện tượng nhân sự của doanh nghiệp A nhìn thấy khách hàng hoặc báo cáo tài chính của doanh nghiệp B.',
    steps: [
      'Bước 1: Quản trị viên truy cập Cổng Quản trị tại https://vione.ai/auth bằng trình duyệt Chrome, Edge hoặc Safari.',
      'Bước 2: Chọn vai trò đăng nhập tương ứng (Super Admin, Ban Giám Đốc, Quản Lý, Nhân Viên hoặc Khách Hàng).',
      'Bước 3: Nhập Email công vụ và Mật khẩu bảo mật do hệ thống cấp phát ban đầu.',
      'Bước 4: Nhập mã OTP 6 số từ ứng dụng xác thực Google Authenticator nếu tài khoản bật bảo mật 2FA.',
      'Bước 5: Hệ thống kiểm tra chữ ký số JWT và điều hướng người dùng vào màn hình làm việc tương ứng với quyền hạn.',
      'Bước 6: Người dùng kiểm tra góc trên bên phải màn hình để xác nhận đúng Họ tên, Chức vụ và Tên doanh nghiệp.'
    ],
    troubleshoot: [
      ['Bị báo lỗi 403 Forbidden', 'Tài khoản không đủ thẩm quyền truy cập tính năng', 'Liên hệ Super Admin của công ty để cấp quyền trong Ma trận RBAC.'],
      ['Quên mật khẩu đăng nhập', 'Không nhớ mật khẩu truy cập', 'Bấm nút "Quên mật khẩu" tại màn hình đăng nhập để nhận link reset qua email trong 60 giây.']
    ],
    image: '02_crm_members_roles_permission.png',
    caption: 'Ma Trận Cấu Hình Phân Quyền Vai Trò RBAC 5 Cấp Trong Cổng Quản Trị ViOne'
  },
  {
    chapterNumber: 2,
    title: 'HƯỚNG DẪN ĐĂNG NHẬP CỔNG QUẢN TRỊ & BẢO MẬT 2 LỚP (2FA)',
    intro: 'Đăng nhập Cổng Quản trị là bước đầu tiên để tiếp cận toàn bộ dữ liệu điều hành doanh nghiệp. ViOne áp dụng chuẩn an ninh ngân hàng với cơ chế xác thực đa yếu tố (MFA):',
    fields: [
      ['Email Đăng Nhập', 'Văn bản (Email)', 'Bắt buộc', 'Email doanh nghiệp được cấp, ví dụ: ceo@vione.ai'],
      ['Mật Khẩu', 'Chuỗi ký tự ẩn', 'Bắt buộc', 'Tối thiểu 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt'],
      ['Mã OTP 2FA', 'Số (6 chữ số)', 'Tùy chọn/Bắt buộc', 'Mã thời gian thực từ Google Authenticator hoặc tin nhắn SMS'],
      ['Ghi Nhớ Đăng Nhập', 'Hộp kiểm (Checkbox)', 'Không', 'Duy trì phiên đăng nhập trong 30 ngày trên thiết bị tin cậy']
    ],
    fieldHeaders: ['Tên Trường Form', 'Kiểu Dữ Liệu', 'Yêu Cầu', 'Mô Tả & Hướng Dẫn Nhập Liệu'],
    callout: 'CẢNH BÁO AN NINH MẠNG: Tuyệt đối không cung cấp mã OTP 2FA cho bất kỳ ai, kể cả nhân viên kỹ thuật ViOne. Hệ thống tự động khóa tài khoản tạm thời 15 phút nếu nhập sai mật khẩu quá 5 lần liên tiếp.',
    steps: [
      'Bước 1: Mở trình duyệt web và gõ địa chỉ https://vione.ai/auth.',
      'Bước 2: Điền chính xác địa chỉ Email và Mật khẩu vào form đăng nhập trung tâm.',
      'Bước 3: Nhấn nút "Đăng Nhập". Hệ thống hiển thị hộp thoại yêu cầu nhập mã xác thực hai lớp (2FA).',
      'Bước 4: Mở ứng dụng Google Authenticator hoặc Microsoft Authenticator trên smartphone của bạn.',
      'Bước 5: Đọc mã 6 chữ số đang hiển thị và điền vào ô xác thực trên máy tính trong vòng 30 giây.',
      'Bước 6: Nhấn "Xác Nhận". Hệ thống khởi tạo phiên làm việc an toàn và chuyển vào Trang Chủ Dashboard.'
    ],
    troubleshoot: [
      ['Mã OTP 2FA báo không hợp lệ', 'Đồng hồ điện thoại bị lệch giờ so với máy chủ', 'Vào Cài đặt ứng dụng Authenticator -> Chọn "Sửa lỗi giờ cho mã" để đồng bộ lại thời gian.'],
      ['Mất điện thoại chứa mã 2FA', 'Không có máy nhận mã OTP', 'Sử dụng 1 trong 10 mã dự phòng khẩn cấp (Backup Codes) đã lưu khi kích hoạt 2FA để đăng nhập.']
    ],
    image: '03_crm_login_page.png',
    caption: 'Màn Hình Đăng Nhập Cổng Quản Trị ViOne & Xác Thực Hai Lớp (2FA)'
  },
  {
    chapterNumber: 3,
    title: 'HƯỚNG DẪN KHAI THÁC LANDING WEB & GỬI FORM YÊU CẦU BÁO GIÁ',
    intro: 'Trang chủ Landing Web ViOne tại https://vione.ai là cổng giao tiếp công khai, giới thiệu 14 phân hệ giải pháp và tiếp nhận yêu cầu báo giá may đo:',
    fields: [
      ['Họ Và Tên', 'Chuỗi ký tự', 'Bắt buộc', 'Họ tên đầy đủ của người đại diện liên hệ, ví dụ: Nguyễn Minh Đăng'],
      ['Số Điện Thoại', 'Số (10 số)', 'Bắt buộc', 'Số điện thoại di động chính xác để chuyên viên tư vấn gọi điện'],
      ['Email Doanh Nghiệp', 'Văn bản (Email)', 'Bắt buộc', 'Hòm thư điện tử để nhận bản hồ sơ báo giá PDF chính thức'],
      ['Tên Công Ty', 'Chuỗi ký tự', 'Bắt buộc', 'Tên doanh nghiệp cần chuyển đổi số'],
      ['Quy Mô Nhân Sự', 'Chọn thả (Dropdown)', 'Bắt buộc', 'Dưới 20 người, 20-50 người, 50-200 người hoặc Trên 200 người'],
      ['Nhu Cầu Cụ Thể', 'Văn bản nhiều dòng', 'Không', 'Mô tả bài toán cần giải quyết: Quản lý khách hàng, chấm công, dòng tiền...']
    ],
    fieldHeaders: ['Tên Trường Form', 'Kiểu Dữ Liệu', 'Yêu Cầu', 'Mô Tả & Hướng Dẫn Nhập Liệu'],
    callout: 'CHÍNH SÁCH BÁO GIÁ MAY ĐO: ViOne áp dụng chính sách không niêm yết giá cứng cố định trên website. Mọi chi phí triển khai được khảo sát và may đo theo quy mô thực tế để tối ưu ngân sách cho doanh nghiệp.',
    steps: [
      'Bước 1: Truy cập trang chủ ViOne Platform tại https://vione.ai.',
      'Bước 2: Trải nghiệm hoạt ảnh 4.8s pop-up doanh nhân phía trước khung smartphone VIONE MOBILE.',
      'Bước 3: Cuộn trang xem các khối: Mô đun liên kết, AI Workflow, Giám sát vận hành, 3 Bước thiết lập, Bảng giá 3 gói.',
      'Bước 4: Nhấn nút "Yêu Cầu Báo Giá" trên Header hoặc tại các gói giải pháp để mở Modal Hoàng gia.',
      'Bước 5: Điền đầy đủ thông tin vào form: Họ tên, Số điện thoại, Email, Tên công ty, Quy mô và Nhu cầu.',
      'Bước 6: Nhấn nút "Gửi Yêu Cầu Báo Giá & Nhận Tư Vấn 1-1". Dữ liệu được ghi nhận vào cơ sở dữ liệu `vione_quote_leads`.'
    ],
    troubleshoot: [
      ['Form báo lỗi không gửi được', 'Nhập thiếu số điện thoại hoặc email sai cú pháp', 'Kiểm tra các ô viền đỏ, bổ sung đúng số điện thoại 10 số rồi bấm gửi lại.'],
      ['Chưa nhận được liên hệ sau 15 phút', 'Đường truyền mạng nghẽn hoặc gửi ngoài giờ', 'Kiểm tra hòm thư rác (Spam) hoặc gọi hotline hỗ trợ trực tiếp 1900-VIONE.']
    ],
    image: 'live_02_member_registration_form_filled.png',
    caption: 'Cửa Sổ Modal Thu Thập Yêu Cầu Báo Giá Doanh Nghiệp & Tư Vấn 1-1'
  },
  {
    chapterNumber: 4,
    title: 'HƯỚNG DẪN QUẢN LÝ KHÁCH HÀNG & PHỄU CHUYỂN ĐỔI LEAD 360°',
    intro: 'Phân hệ Khách hàng CRM là trái tim của hệ sinh thái, giúp quản lý toàn diện vòng đời khách hàng từ khi còn là Lead tiềm năng đến khi trở thành Hội viên VIP:',
    fields: [
      ['Tên Doanh Nghiệp', 'Văn bản', 'Bắt buộc', 'Tên đầy đủ của công ty khách hàng theo ĐKKD'],
      ['Mã Số Thuế (MST)', 'Chuỗi số (10-13 số)', 'Bắt buộc', 'Mã số thuế doanh nghiệp, hệ thống tự động kiểm tra trùng lặp'],
      ['Người Đại Diện', 'Văn bản', 'Bắt buộc', 'Chủ tịch, Tổng Giám Đốc hoặc Giám đốc thu mua'],
      ['Số Điện Thoại / Email', 'Liên hệ', 'Bắt buộc', 'Số điện thoại và hòm thư công vụ của người đại diện'],
      ['Nhóm Ngành Nghề', 'Chọn thả (Dropdown)', 'Bắt buộc', 'Sản xuất, Dịch vụ, Thương mại, Chuỗi & Bán lẻ, Công nghệ'],
      ['Trạng Thái Khách Hàng', 'Chọn thả (Dropdown)', 'Bắt buộc', 'Lead Mới, Đang Tư Vấn, Báo Giá, Đã Ký, Đang Vận Hành, Tạm Ngừng']
    ],
    fieldHeaders: ['Tên Trường Form', 'Kiểu Dữ Liệu', 'Yêu Cầu', 'Mô Tả & Hướng Dẫn Nhập Liệu'],
    callout: 'QUY TẮC BẢO VỆ DỮ LIỆU KHÁCH HÀNG: Mỗi nhân viên kinh doanh chỉ nhìn thấy khách hàng do mình được phân công. Hành vi xuất file Excel danh sách khách hàng bị giới hạn số lượng và ghi vết 100% trong nhật ký Audit Trail.',
    steps: [
      'Bước 1: Từ menu bên trái Cổng Quản trị, chọn mục "Khách Hàng & Phễu Lead".',
      'Bước 2: Màn hình hiển thị danh sách khách hàng kèm bộ lọc: Trạng thái, Ngành nghề, Nhân viên phụ trách.',
      'Bước 3: Để thêm khách hàng mới, nhấn nút "+ Thêm Khách Hàng Mới" ở góc phải phía trên.',
      'Bước 4: Nhập đầy đủ thông tin: Mã số thuế, Tên công ty, Người liên hệ, Số điện thoại và Email.',
      'Bước 5: Nhấn nút "Lưu Hồ Sơ". Hệ thống tự động kiểm tra trùng lặp và lưu vào cơ sở dữ liệu PostgreSQL.',
      'Bước 6: Nhấp vào tên khách hàng để mở màn hình Drawer xem chi tiết hồ sơ 360 độ: Báo giá, Hợp đồng, Lịch sử cuộc gọi.',
      'Bước 7: Để nhập khẩu hàng loạt, nhấn "Nhập Khẩu (Import)", tải file mẫu Excel và tải lên danh sách 1,000 khách hàng.'
    ],
    troubleshoot: [
      ['Hệ thống báo "Mã số thuế đã tồn tại"', 'Khách hàng này đã được nhân viên khác tạo trước đó', 'Nhấp vào liên kết mã số thuế để xem ai đang phụ trách hoặc liên hệ Trưởng phòng để phân bổ lại.'],
      ['Tệp Excel import bị lỗi dòng', 'Dữ liệu sai định dạng ngày tháng hoặc thiếu số điện thoại', 'Tải tệp báo lỗi về, chỉnh sửa các cột tô đỏ rồi import lại phần bị lỗi.']
    ],
    image: '04_crm_members_management.png',
    caption: 'Giao Diện Quản Lý Danh Sách & Tra Cứu Hồ Sơ Khách Hàng Doanh Nghiệp'
  },
  {
    chapterNumber: 5,
    title: 'HƯỚNG DẪN QUẢN TRỊ CƠ HỘI BÁN HÀNG (DEALS) & HỢP ĐỒNG THƯƠNG MẠI',
    intro: 'Quản trị cơ hội bán hàng trên bảng Pipeline Kanban giúp đội ngũ kinh doanh nắm rõ tiến độ từng thương vụ, tăng tỷ lệ chốt đơn và lập báo giá chuẩn hóa:',
    fields: [
      ['Tên Cơ Hội (Deal)', 'Văn bản', 'Bắt buộc', 'Tên thương vụ, ví dụ: "Triển khai ViOne 5.0 - Tập đoàn Hòa Bình"'],
      ['Giá Trị Thương Vụ', 'Số tiền tệ (VND)', 'Bắt buộc', 'Tổng giá trị hợp đồng ước tính'],
      ['Giai Đoạn Pipeline', 'Chọn thả (Dropdown)', 'Bắt buộc', 'Tiếp cận -> Khảo sát -> Báo giá -> Đàm phán -> Won / Lost'],
      ['Xác Suất Chốt Đơn', 'Tỷ lệ % (0-100%)', 'Bắt buộc', 'Tỷ lệ khả thi để hệ thống tính doanh thu dự phóng Weighted Value'],
      ['Ngày Dự Kiến Ký', 'Ngày tháng', 'Bắt buộc', 'Hạn chót dự kiến chốt hợp đồng để lập kế hoạch dòng tiền']
    ],
    fieldHeaders: ['Tên Trường Form', 'Kiểu Dữ Liệu', 'Yêu Cầu', 'Mô Tả & Hướng Dẫn Nhập Liệu'],
    callout: 'KIỂM SOÁT HẠN MỨC CHIẾT KHẤU: Báo giá có mức chiết khấu trên 10% bắt buộc phải có sự phê duyệt điện tử của Giám đốc Kinh doanh trên hệ thống mới được phép xuất file PDF gửi khách hàng.',
    steps: [
      'Bước 1: Chọn mục "Cơ Hội Bán Hàng (Deals)" trên thanh menu để mở bảng Kanban Pipeline.',
      'Bước 2: Nhấn nút "+ Thêm Deal Mới", chọn Khách hàng mục tiêu, nhập giá trị thương vụ và chọn giai đoạn khởi đầu.',
      'Bước 3: Trong quá trình đàm phán, rê chuột và kéo thả thẻ Deal từ cột này sang cột kế tiếp.',
      'Bước 4: Để lập báo giá, nhấp đúp vào thẻ Deal -> Chọn tab "Báo Giá" -> Nhấn "Tạo Báo Giá Mới".',
      'Bước 5: Thêm các sản phẩm từ danh mục, áp dụng chiết khấu thương mại và thuế VAT.',
      'Bước 6: Nhấn "Xuất PDF & Gửi Email". Khách hàng nhận được báo giá chuẩn mực kèm mã QR tra cứu.',
      'Bước 7: Khi đàm phán thành công, kéo thẻ Deal sang cột "Won (Thành công)" và tạo Hợp đồng kinh tế liên kết.'
    ],
    troubleshoot: [
      ['Không thể chuyển Deal sang "Won"', 'Chưa đính kèm tệp hợp đồng đã ký hoặc chưa duyệt chiết khấu', 'Mở chi tiết Deal, tải lên tệp hợp đồng quét (PDF) và hoàn tất phê duyệt giá.'],
      ['Không tìm thấy sản phẩm trong báo giá', 'Sản phẩm chưa được kích hoạt kinh doanh', 'Vào danh mục Sản phẩm kiểm tra trạng thái SKU và bảng giá phân cấp.']
    ],
    image: 'live_07_crm_member_detail_drawer.png',
    caption: 'Màn Hình Drawer Quản Trị Cơ Hội Bán Hàng & Lập Báo Giá B2B Điện Tử'
  },
  {
    chapterNumber: 6,
    title: 'HƯỚNG DẪN QUẢN TRỊ CÔNG VIỆC, DỰ ÁN WBS & BẢNG KANBAN',
    intro: 'Phân hệ Vione Work giúp số hóa toàn bộ quy trình giao việc, phân bổ dự án theo cấu trúc WBS và kiểm soát tiến độ thời gian thực:',
    fields: [
      ['Tên Công Việc (Task)', 'Văn bản', 'Bắt buộc', 'Mô tả rõ đầu việc cần thực hiện, bắt đầu bằng động từ hành động'],
      ['Dự Án Trực Thuộc', 'Chọn thả (Dropdown)', 'Bắt buộc', 'Dự án hoặc phòng ban quản lý công việc này'],
      ['Người Phụ Trách (Assignee)', 'Chọn người dùng', 'Bắt buộc', 'Nhân sự chịu trách nhiệm chính hoàn thành công việc'],
      ['Hạn Chót (Deadline)', 'Ngày giờ', 'Bắt buộc', 'Thời điểm kết thúc bắt buộc, hệ thống cảnh báo trước 2h'],
      ['Mức Độ Ưu Tiên', 'Chọn thả (Dropdown)', 'Bắt buộc', 'Khẩn cấp (Đỏ), Cao (Cam), Bình thường (Xanh)'],
      ['Danh Sách Checklist', 'Danh sách con', 'Không', 'Các bước việc nhỏ cần tích chọn hoàn thành']
    ],
    fieldHeaders: ['Tên Trường Form', 'Kiểu Dữ Liệu', 'Yêu Cầu', 'Mô Tả & Hướng Dẫn Nhập Liệu'],
    callout: 'KỶ CƯƠNG THỰC THI TIẾN ĐỘ: Mọi công việc quá hạn Deadline mà chưa chuyển trạng thái Hoàn thành sẽ tự động đổi màu đỏ rực trên bảng điều khiển của Trưởng phòng và ghi nhận điểm trừ KPI cuối tháng.',
    steps: [
      'Bước 1: Vào phân hệ "Công Việc & Dự Án", chọn dự án cần làm việc.',
      'Bước 2: Xem công việc theo 3 chế độ: Bảng Kanban kéo thả, Biểu đồ phụ thuộc Gantt Chart hoặc Danh sách lưới.',
      'Bước 3: Nhấn "+ Thêm Công Việc Mới", nhập tên việc, chọn người phụ trách và hạn chót Deadline.',
      'Bước 4: Thêm checklist các bước con và đính kèm tài liệu, bản vẽ kỹ thuật liên quan.',
      'Bước 5: Khi bắt đầu làm việc, kéo thẻ việc sang cột "Đang Làm (In Progress)" và nhấn nút bấm giờ Timesheet.',
      'Bước 6: Trao đổi với đồng nghiệp trong ô thảo luận bằng cú pháp `@TênĐồngNghiệp`.',
      'Bước 7: Khi hoàn thành 100% checklist, chuyển sang "Chờ Duyệt (Review)" để Quản lý dự án nghiệm thu.'
    ],
    troubleshoot: [
      ['Không kéo được thẻ sang trạng thái khác', 'Công việc bị khóa do phụ thuộc vào một công việc khác chưa xong', 'Mở biểu đồ Gantt kiểm tra liên kết Finish-to-Start để hoàn thành công việc tiền nhiệm trước.'],
      ['Không nhận được thông báo nhắc việc', 'Chưa cấp quyền thông báo đẩy trên điện thoại', 'Vào Cài đặt điện thoại -> Ứng dụng ViOne Connect -> Bật "Cho phép nhận thông báo".']
    ],
    image: 'crm1983_02_dashboard_overview.png',
    caption: 'Bảng Quản Trị Công Việc Kanban Kéo Thả Trực Quan & Giám Sát Tiến Độ'
  },
  {
    chapterNumber: 7,
    title: 'HƯỚNG DẪN QUẢN TRỊ NHÂN SỰ, CHẤM CÔNG GPS/FACEID & BẢNG LƯƠNG',
    intro: 'Vione HRM số hóa toàn diện hồ sơ nhân sự, chấm công thông minh chống gian lận và tự động hóa tính lương trong 10 giây:',
    fields: [
      ['Họ Và Tên Nhân Viên', 'Văn bản', 'Bắt buộc', 'Họ tên đầy đủ theo CCCD gắn chip'],
      ['Mã Nhân Viên', 'Mã số tự tăng', 'Bắt buộc', 'Mã định danh duy nhất trong doanh nghiệp (NV-001, NV-002...)'],
      ['Phòng Ban & Chức Vụ', 'Chọn thả (Dropdown)', 'Bắt buộc', 'Vị trí công tác trên sơ đồ tổ chức Org Chart'],
      ['Hình Thức Chấm Công', 'Cấu hình', 'Bắt buộc', 'Nhận diện khuôn mặt AI + Định vị GPS bán kính 50m'],
      ['Mức Lương & Phụ Cấp', 'Số tiền tệ (VND)', 'Bắt buộc (Bảo mật)', 'Lương cơ bản, phụ cấp trách nhiệm, tỷ lệ trích nộp BHXH']
    ],
    fieldHeaders: ['Tên Trường Form', 'Kiểu Dữ Liệu', 'Yêu Cầu', 'Mô Tả & Hướng Dẫn Nhập Liệu'],
    callout: 'CHỐNG CHẤM CÔNG HỘ TUYỆT ĐỐI: Thuật toán AI nhận diện khuôn mặt kết hợp kiểm tra độ sống (Liveness Check) và tọa độ vệ tinh GPS. Nghiêm cấm mọi hành vi sử dụng ảnh chụp lại để chấm công.',
    steps: [
      'Bước 1: Hàng ngày khi đến văn phòng, nhân viên mở app ViOne Connect trên điện thoại, chọn "Chấm Công".',
      'Bước 2: Đưa khuôn mặt vào khung tròn nhận diện trên màn hình; camera AI quét trong 1 giây và xác nhận "Chấm công thành công".',
      'Bước 3: Để nộp đơn nghỉ phép, nhân viên vào mục "Nghỉ Phép" trên app, chọn ngày nghỉ, loại phép và bấm "Gửi Duyệt".',
      'Bước 4: Trưởng phòng nhận thông báo đẩy trên điện thoại và bấm "Phê Duyệt 1-Chạm".',
      'Bước 5: Cuối tháng, chuyên viên C&B mở phân hệ "Tổng Hợp Công" -> Nhấn "Chốt Bảng Công Tự Động".',
      'Bước 6: Nhấn nút "Chạy Bảng Lương (Run Payroll)" -> Hệ thống tự động tính lương, trừ BHXH, thuế TNCN trong 10 giây.',
      'Bước 7: Sau khi CEO duyệt, nhấn "Phát Hành Phiếu Lương Điện Tử (E-Payslip)" gửi bảo mật tới từng nhân viên.'
    ],
    troubleshoot: [
      ['App báo "Vị trí GPS không hợp lệ"', 'Đang đứng ngoài bán kính 50m quanh văn phòng hoặc GPS bị trôi', 'Bật định vị độ chính xác cao trên điện thoại, đi vào sảnh văn phòng và thử lại.'],
      ['Khuôn mặt không nhận diện được', 'Đeo khẩu trang hoặc góc ánh sáng quá tối', 'Bỏ khẩu trang, kính râm, hướng mặt về nguồn sáng rõ ràng để camera AI nhận diện.']
    ],
    image: '08_app_home_dashboard.png',
    caption: 'Màn Hình Chấm Công Nhận Diện Khuôn Mặt AI & Tổng Hợp Ngày Công Trên Mobile'
  },
  {
    chapterNumber: 8,
    title: 'HƯỚNG DẪN QUẢN TRỊ TÀI CHÍNH, DÒNG TIỀN & DUYỆT CHI 3 CẤP',
    intro: 'Vione Finance giúp doanh nghiệp kiểm soát dòng tiền thực thu - thực chi từng phút, duyệt chi điện tử 3 cấp và đối soát tự động:',
    fields: [
      ['Loại Giao Dịch', 'Chọn thả (Dropdown)', 'Bắt buộc', 'Phiếu Thu (Tiền vào) hoặc Phiếu Chi (Tiền ra)'],
      ['Số Tiền Giao Dịch', 'Số tiền tệ (VND)', 'Bắt buộc', 'Số tiền thanh toán chính xác theo chứng từ'],
      ['Tài Khoản / Quỹ Tiền', 'Chọn thả (Dropdown)', 'Bắt buộc', 'Tài khoản ngân hàng thụ hưởng hoặc Quỹ tiền mặt tại két'],
      ['Mục Đích Thu / Chi', 'Văn bản', 'Bắt buộc', 'Diễn giải nội dung giao dịch kèm mã hợp đồng liên quan'],
      ['Chứng Từ Đính Kèm', 'Tệp tin (PDF/Ảnh)', 'Bắt buộc', 'Hóa đơn đỏ VAT, ủy nhiệm chi hoặc biên bản bàn giao']
    ],
    fieldHeaders: ['Tên Trường Form', 'Kiểu Dữ Liệu', 'Yêu Cầu', 'Mô Tả & Hướng Dẫn Nhập Liệu'],
    callout: 'QUY TRÌNH DUYỆT CHI 3 CẤP NGHIÊM NGẶT: Mọi khoản chi trên 20 triệu VNĐ bắt buộc phải qua 3 vòng ký điện tử: Nhân viên đề xuất (Maker) -> Kế toán trưởng kiểm soát (Checker) -> Tổng Giám Đốc phê duyệt (Approver).',
    steps: [
      'Bước 1: Vào phân hệ "Quản Trị Tài Chính", mở bảng điều khiển Dòng Tiền (Cashflow Dashboard).',
      'Bước 2: Quan sát số dư thực tế tại các tài khoản ngân hàng và biểu đồ biến động dòng tiền trong tháng.',
      'Bước 3: Để lập đề xuất chi tiền, nhấn "Tạo Đề Nghị Thanh Toán", điền số tiền, người nhận và tải lên hóa đơn VAT.',
      'Bước 4: Kế toán trưởng kiểm tra tính hợp pháp của hóa đơn trên cổng Thuế và ký duyệt vòng 1.',
      'Bước 5: Tổng Giám Đốc nhận thông báo trên điện thoại, kiểm tra số tiền và quét vân tay phê duyệt vòng 2.',
      'Bước 6: Khi thu tiền bán hàng, hệ thống sinh mã VietQR Napas 24/7 động để khách hàng quét trả tiền và tự động gạch nợ 1s.',
      'Bước 7: Mở mục "Dự Báo Dòng Tiền AI" để xem dự phóng số dư tiền mặt trong 30-60-90 ngày tới.'
    ],
    troubleshoot: [
      ['Hệ thống chặn không cho tạo phiếu chi', 'Khoản chi làm vượt quá 100% ngân sách đã duyệt của phòng ban', 'Làm việc với CFO để làm thủ tục xin điều chuyển hoặc bổ sung ngân sách tháng.'],
      ['Khách hàng đã chuyển khoản nhưng chưa gạch nợ', 'Nội dung chuyển khoản bị sai lệch mã giao dịch', 'Vào mục "Đối Soát Ngân Hàng", tìm giao dịch chưa khớp và bấm "Gán thủ công vào Hóa đơn".']
    ],
    image: 'crm_dash_view_06.png',
    caption: 'Bảng Điều Khiển Quản Trị Dòng Tiền & Quy Trình Duyệt Chi Điện Tử 3 Cấp'
  },
  {
    chapterNumber: 9,
    title: 'HƯỚNG DẪN KHAI THÁC TRỢ LÝ TRÍ TUỆ NHÂN TẠO VIONE AI COPILOT',
    intro: 'ViOne AI Copilot là bộ não điều hành thông minh tích hợp sẵn, giúp lãnh đạo truy vấn số liệu kinh doanh bằng tiếng Việt tự nhiên và tự động hóa quy trình:',
    fields: [
      ['Câu Lệnh / Câu Hỏi', 'Văn bản / Giọng nói', 'Bắt buộc', 'Đặt câu hỏi bằng tiếng Việt tự nhiên, ví dụ: "Top 5 khách hàng nợ lâu nhất là ai?"'],
      ['Phạm Vi Dữ Liệu', 'Chọn thả (Dropdown)', 'Tùy chọn', 'Toàn công ty, Chi nhánh Hà Nội, Phòng Bán hàng, Tháng này...'],
      ['Kịch Bản Tự Động Hóa', 'Kéo thả (No-code)', 'Cấu hình', 'Thiết lập Trigger sự kiện -> Điều kiện AI thẩm định -> Hành động Action']
    ],
    fieldHeaders: ['Tên Trường Form', 'Kiểu Dữ Liệu', 'Yêu Cầu', 'Mô Tả & Hướng Dẫn Nhập Liệu'],
    callout: 'AN TOÀN BẢO MẬT DỮ LIỆU AI (DATA PRIVACY): Dữ liệu nội bộ của doanh nghiệp được lưu trữ cô lập và xử lý bởi mô hình AI riêng biệt. Tuyệt đối không sử dụng dữ liệu kinh doanh của khách hàng để đào tạo các mô hình AI công cộng.',
    steps: [
      'Bước 1: Bấm vào biểu tượng Trợ lý AI Copilot lơ lửng tại góc dưới bên phải màn hình hoặc nhấn phím tắt `Ctrl + Space`.',
      'Bước 2: Cửa sổ hội thoại AI mở ra, sẵn sàng nhận lệnh bằng văn bản hoặc giọng nói.',
      'Bước 3: Nhập câu hỏi quản trị: "Báo cáo doanh số tuần này đạt bao nhiêu và so sánh với chỉ tiêu tháng?".',
      'Bước 4: AI phân tích ngữ nghĩa, truy vấn dữ liệu PostgreSQL bảo mật và trả lời kèm số liệu thống kê và biểu đồ trong 2 giây.',
      'Bước 5: Ra lệnh nâng cao: "Soạn thảo email chào hàng gói giải pháp sản xuất cho khách hàng Tập đoàn Hòa Bình".',
      'Bước 6: Kiểm tra bức thư do AI soạn thảo cá nhân hóa từng chi tiết, bấm "Sao chép" hoặc "Gửi ngay".',
      'Bước 7: Vào "AI Workflow Studio" để cấu hình kịch bản tự động tiếp nhận Lead và gửi báo giá tự động.'
    ],
    troubleshoot: [
      ['AI báo "Tôi không có quyền truy cập dữ liệu này"', 'Tài khoản đăng nhập không có quyền xem thông tin tài chính/nhân sự', 'AI tuân thủ nghiêm ngặt ma trận RBAC; chỉ trả lời dữ liệu trong phạm vi quyền hạn của bạn.'],
      ['Câu trả lời không đúng ý muốn', 'Câu hỏi quá chung chung hoặc thiếu mốc thời gian', 'Bổ sung thêm mốc thời gian và đối tượng cụ thể (Ví dụ: "Doanh số của nhân viên Nam trong tháng 10").']
    ],
    image: 'workflow-automation.png',
    caption: 'Giao Diện Trợ Lý Trí Tuệ Nhân Tạo ViOne AI Copilot & Thiết Lập Workflow'
  },
  {
    chapterNumber: 10,
    title: 'HƯỚNG DẪN CÀI ĐẶT & SỬ DỤNG ỨNG DỤNG DI ĐỘNG VIONE CONNECT',
    intro: 'ViOne Connect Mobile là văn phòng số bỏ túi dành riêng cho doanh nhân và nhân viên, hoạt động mượt mà trên cả iOS, Android và PWA:',
    fields: [
      ['Hệ Điều Hành Hỗ Trợ', 'Nền tảng', 'Yêu cầu', 'iOS 14.0 trở lên hoặc Android 8.0 trở lên'],
      ['Phương Thức Cài Đặt', 'Kênh tải', 'Chính thức', 'Quét mã QR tải app, tải tệp APK hoặc truy cập chợ ứng dụng'],
      ['Phương Thức Đăng Nhập', 'Bảo mật', 'Tiêu chuẩn', 'Xác thực sinh trắc học FaceID, Vân tay hoặc mật khẩu định danh']
    ],
    fieldHeaders: ['Thông Số Kỹ Thuật', 'Phân Loại', 'Tiêu Chuẩn', 'Mô Tả Chi Tiết'],
    callout: 'CHẾ ĐỘ NGOẠI TUYẾN (OFFLINE MODE): Khi điện thoại mất sóng internet hoặc trên máy bay, ứng dụng tự động chuyển sang chế độ Offline. Bạn vẫn xem được danh bạ và vé sự kiện bình thường; dữ liệu tự động đồng bộ khi có mạng lại.',
    steps: [
      'Bước 1: Quét mã QR cài đặt trên tài liệu này hoặc truy cập trang tải app https://vione.ai/download.',
      'Bước 2: Chọn phiên bản dành cho iOS (App Store) hoặc Android (Google Play / file APK trực tiếp).',
      'Bước 3: Cài đặt ứng dụng lên điện thoại trong vòng 30 giây.',
      'Bước 4: Mở app lần đầu, cấp quyền Thông báo và Camera để phục vụ quét mã QR và chấm công FaceID.',
      'Bước 5: Nhập số điện thoại và mật khẩu định danh để đăng nhập.',
      'Bước 6: Khi app hỏi bật FaceID / Vân tay, chọn "Đồng ý" để đăng nhập siêu tốc trong các lần sau.'
    ],
    troubleshoot: [
      ['Không cài được file APK trên Android', 'Chưa bật tính năng "Cài đặt ứng dụng không rõ nguồn gốc"', 'Vào Cài đặt máy -> Bảo mật -> Bật cho phép cài đặt từ nguồn trình duyệt.'],
      ['Không nhận được thông báo đẩy', 'Tính năng tiết kiệm pin của máy chặn chạy ngầm', 'Vào Cài đặt pin -> Chọn ứng dụng ViOne Connect -> Chọn "Không hạn chế chạy nền".']
    ],
    image: '06_app_login_screen.png',
    caption: 'Màn Hình Đăng Nhập Ứng Dụng Di Động ViOne Connect Trên Smartphone'
  },
  {
    chapterNumber: 11,
    title: 'HƯỚNG DẪN KÍCH HOẠT & CHẠM DANH THIẾP SỐ TITANIUM NFC 1-GIÂY',
    intro: 'Thẻ danh thiếp số Titanium NFC là công nghệ kết nối đỉnh cao của doanh nhân, thay thế hoàn toàn danh thiếp giấy truyền thống:',
    fields: [
      ['Chất Liệu Thẻ Vật Lý', 'Vật liệu', 'Cao cấp', 'Hợp kim Titanium mạ vàng chống trầy xước, viền vát kim cương'],
      ['Vi Chip Bảo Mật', 'Công nghệ', 'Tiêu chuẩn', 'Vi chip NXP NTAG215/216 đạt chuẩn NFC Forum Type 2'],
      ['Khoảng Cách Đọc NFC', 'Kỹ thuật', '1 - 3 cm', 'Chạm nhẹ vào mặt sau điện thoại gần cụm camera'],
      ['Tương Thích Thiết Bị', 'Khả năng', '100%', 'iPhone từ iPhone 7 trở lên và mọi dòng điện thoại Android có NFC']
    ],
    fieldHeaders: ['Thuộc Tính Thẻ', 'Phân Loại', 'Tiêu Chuẩn', 'Mô Tả Chi Tiết'],
    callout: 'KHOÁ THẺ KHẨN CẤP TỪ XA: Nếu đánh rơi hoặc thất lạc thẻ Titanium NFC vật lý, bạn hãy mở app ViOne Connect trên điện thoại, bấm nút "Khóa Thẻ Tức Thì". Thẻ vật lý sẽ bị vô hiệu hóa ngay lập tức trên toàn cầu.',
    steps: [
      'Bước 1: Khi nhận được phong bao thẻ VIP, mở ứng dụng ViOne Connect trên điện thoại cá nhân.',
      'Bước 2: Vào mục "Danh Thiếp Số" -> Nhấn "Kích Hoạt Thẻ Mới".',
      'Bước 3: Chạm thẻ Titanium vào lưng điện thoại (vùng gần camera); điện thoại rung nhẹ báo nhận diện chip thành công.',
      'Bước 4: Nhập mã kích hoạt 6 chữ số in trong phong bao bảo mật và bấm "Xác Nhận".',
      'Bước 5: Thẻ vật lý đã liên kết vĩnh viễn với hồ sơ số của bạn.',
      'Bước 6: Khi gặp đối tác, chỉ cần chạm thẻ vào lưng điện thoại đối tác; màn hình đối tác tự bật Portfolio số trong 1 giây.',
      'Bước 7: Đối tác bấm nút "LƯU DANH BẠ" để toàn bộ số điện thoại, email, chức vụ tự động nạp vào danh bạ máy đối tác (.vcf).'
    ],
    troubleshoot: [
      ['Chạm thẻ vào điện thoại đối tác không thấy phản hồi', 'Đối tác chưa bật tính năng NFC trên máy (Android) hoặc chạm sai vị trí', 'Trên iPhone, chạm vào đỉnh đầu mặt sau; trên Android bật công tắc NFC trong Cài đặt nhanh.'],
      ['Đối tác dùng điện thoại cũ không có NFC', 'Thiết bị không hỗ trợ đọc sóng NFC', 'Bấm nút "Hiện mã QR" trên app để đối tác dùng camera quét mã QR danh thiếp tương tự.']
    ],
    image: '09_app_vip_card.png',
    caption: 'Thao Tác Chạm Thẻ Danh Thiếp Titanium NFC Mở Portfolio Số Doanh Nhân'
  },
  {
    chapterNumber: 12,
    title: 'HƯỚNG DẪN GIAO THƯƠNG B2B, KHỚP LỆNH CUNG - CẦU & CHAT BẢO MẬT',
    intro: 'Mạng lưới giao thương B2B ViOne kết nối hơn 10,000 lãnh đạo doanh nghiệp, giúp khớp lệnh cung - cầu và trao đổi kinh doanh bảo mật:',
    fields: [
      ['Tiêu Đề Tin Giao Thương', 'Văn bản', 'Bắt buộc', 'Nêu rõ mặt hàng hoặc dịch vụ cần mua/bán'],
      ['Hình Thức Giao Dịch', 'Chọn thả (Dropdown)', 'Bắt buộc', 'Cần Mua (Cầu) hoặc Chào Bán (Cung)'],
      ['Quy Cách & Ngân Sách', 'Số tiền / Quy cách', 'Bắt buộc', 'Số lượng, yêu cầu kỹ thuật và mức giá dự kiến'],
      ['Khu Vực Giao Thương', 'Chọn thả (Dropdown)', 'Bắt buộc', 'Toàn quốc, Miền Bắc, Miền Nam hoặc theo Tỉnh thành cụ thể']
    ],
    fieldHeaders: ['Tên Trường Form', 'Kiểu Dữ Liệu', 'Yêu Cầu', 'Mô Tả & Hướng Dẫn Nhập Liệu'],
    callout: 'XÁC THỰC TÍCH XANH DOANH NGHIỆP: Toàn bộ doanh nghiệp đăng tin trên sàn giao thương đều được thẩm định giấy phép đăng ký kinh doanh và danh tính người đại diện, đảm bảo an toàn giao dịch 100%.',
    steps: [
      'Bước 1: Mở app ViOne Connect, chọn tab "Mạng Lưới Giao Thương (B2B Marketplace)".',
      'Bước 2: Tìm kiếm đối tác theo ngành nghề hoặc dùng tính năng "Radar Đối Tác Gần Bạn (GPS)" để tìm đối tác quanh 5km.',
      'Bước 3: Để đăng nhu cầu hợp tác, nhấn nút "Đăng Tin Cung - Cầu", chọn loại tin Cần Mua hoặc Chào Bán.',
      'Bước 4: Nhập mô tả, đính kèm ảnh sản phẩm hoặc bản vẽ kỹ thuật, nhấn "Đăng Tin".',
      'Bước 5: Thuật toán AI tự động đối soát hồ sơ và bắn thông báo khớp lệnh tới các doanh nghiệp có năng lực phù hợp.',
      'Bước 6: Khi tìm thấy đối tác, bấm nút "Nhắn Tin" để mở khung chat mã hóa đầu cuối (End-to-End Encryption).',
      'Bước 7: Trao đổi trực tiếp, gửi tệp báo giá PDF và gọi video call HD miễn phí ngay trong ứng dụng.'
    ],
    troubleshoot: [
      ['Tin đăng bị từ chối kiểm duyệt', 'Nội dung chứa từ khóa vi phạm chính sách hoặc thiếu thông tin liên hệ', 'Kiểm tra lý do trong thông báo, bổ sung thông số kỹ thuật rõ ràng và đăng lại.'],
      ['Không tìm thấy đối tác theo vị trí', 'Chưa cấp quyền truy cập vị trí GPS cho ứng dụng', 'Vào Cài đặt máy -> Cho phép ViOne Connect truy cập vị trí "Khi dùng ứng dụng".']
    ],
    image: '20_app_opportunities_feed.png',
    caption: 'Sàn Cơ Hội Giao Thương B2B & Khung Chat Đàm Phán Mã Hóa Bảo Mật'
  },
  {
    chapterNumber: 13,
    title: 'HƯỚNG DẪN THANH TOÁN DỊCH VỤ & HỘI PHÍ QUA VIETQR NAPAS 24/7',
    intro: 'Thanh toán không tiền mặt trên ViOne được tự động hóa 100% qua cổng VietQR Napas 24/7, gạch nợ tức thì và phát hành biên lai điện tử:',
    fields: [
      ['Mã Đơn Hàng / Hóa Đơn', 'Chuỗi mã số', 'Bắt buộc', 'Mã hóa đơn duy nhất do hệ thống sinh ra'],
      ['Số Tiền Cần Thanh Toán', 'Số tiền tệ (VND)', 'Bắt buộc', 'Số tiền chính xác 100% được nhúng trong mã VietQR'],
      ['Mã VietQR Động', 'Hình ảnh mã QR', 'Tự động', 'Mã QR chứa sẵn STK ngân hàng, số tiền và nội dung chuyển tiền']
    ],
    fieldHeaders: ['Thông Số Thanh Toán', 'Kiểu Dữ Liệu', 'Yêu Cầu', 'Mô Tả Chi Tiết'],
    callout: 'GẠCH NỢ TỰ ĐỘNG TRONG 1 GIÂY: Khách hàng không cần phải gõ tay số tài khoản hay nội dung chuyển khoản. Mọi thông tin đã được mã hóa sẵn trong mã VietQR động, đảm bảo thanh toán chuẩn xác 100%.',
    steps: [
      'Bước 1: Khi có thông báo đóng phí hội viên hoặc thanh toán đơn hàng, mở hóa đơn trên app ViOne Connect.',
      'Bước 2: Nhấn nút nổi bật "Thanh Toán Ngay Qua VietQR Napas 24/7".',
      'Bước 3: Màn hình hiển thị mã VietQR động sang trọng có gắn logo doanh nghiệp.',
      'Bước 4: Nhấn nút "Mở App Ngân Hàng"; hệ thống tự động kích hoạt liên kết sâu (Deep Link) mở ứng dụng ngân hàng của bạn.',
      'Bước 5: Toàn bộ thông tin chuyển tiền đã điền sẵn; bạn chỉ cần xác thực FaceID trên app ngân hàng để chuyển tiền.',
      'Bước 6: Trong vòng 1 giây, tiền về tài khoản doanh nghiệp; hệ thống tự động gạch nợ thành "Đã Thanh Toán".',
      'Bước 7: Biên lai điện tử và vé tham dự sự kiện (nếu có) lập tức được kích hoạt trong ví cá nhân.'
    ],
    troubleshoot: [
      ['App ngân hàng không tự động mở', 'Thiết bị chưa cài đặt ứng dụng ngân hàng hoặc chưa liên kết', 'Chụp ảnh màn hình mã VietQR, mở app ngân hàng bất kỳ, chọn "Quét mã QR từ thư viện ảnh".'],
      ['Đã chuyển tiền nhưng hệ thống chưa gạch nợ', 'Ngân hàng gián đoạn đường truyền Webhook', 'Chờ trong 1-2 phút hoặc bấm nút "Kiểm tra trạng thái thanh toán" để hệ thống truy vấn trực tiếp.'],
    ],
    image: '08_app_vietqr_payment_modal.png',
    caption: 'Cửa Sổ Thanh Toán Tự Động Bằng Mã VietQR Napas 24/7 Tức Thời'
  },
  {
    chapterNumber: 14,
    title: 'HƯỚNG DẪN XỬ LÝ SỰ CỐ THƯỜNG GẶP (TROUBLESHOOTING) & HỖ TRỢ 24/7',
    intro: 'Tổng hợp 10 sự cố kỹ thuật thường gặp nhất trong quá trình vận hành hệ thống và giải pháp khắc phục nhanh chóng:',
    fields: [
      ['1. Quên mật khẩu đăng nhập', 'Lâu ngày không vào hệ thống', 'Bấm "Quên mật khẩu" trên trang login, nhập email công vụ để nhận link tạo mật khẩu mới trong 60 giây.'],
      ['2. Bị khóa tài khoản 15 phút', 'Nhập sai mật khẩu quá 5 lần', 'Hệ thống bảo vệ tự động; vui lòng đợi hết 15 phút hoặc liên hệ Quản trị viên để mở khóa sớm.'],
      ['3. Không nhận được mã OTP SMS', 'Nghẽn mạng viễn thông', 'Bấm nút "Gửi lại mã OTP qua Zalo/Email" sau 60 giây hoặc sử dụng mã từ ứng dụng Authenticator.'],
      ['4. Chấm công GPS báo sai vị trí', 'Điện thoại bật chế độ định vị tiết kiệm pin', 'Bật "Định vị độ chính xác cao", kết nối vào Wifi văn phòng để hỗ trợ định vị chính xác.'],
      ['5. Thất lạc thẻ Titanium NFC', 'Rơi hoặc để quên thẻ vật lý', 'Mở app trên điện thoại, vào mục Cài đặt thẻ -> Bấm nút đỏ "KHÓA THẺ TỪ XA" ngay lập tức.'],
      ['6. Tải trang web CRM bị chậm', 'Bộ nhớ đệm trình duyệt bị đầy', 'Nhấn tổ hợp phím `Ctrl + F5` (hoặc `Cmd + Shift + R` trên Mac) để xóa cache và tải lại trang mới.'],
      ['7. Không thể xuất báo cáo Excel', 'Trình duyệt chặn cửa sổ pop-up tải xuống', 'Bấm vào biểu tượng ổ khóa cạnh thanh địa chỉ web, chọn "Cho phép tải xuống tệp tự động".'],
      ['8. Quét vé sự kiện báo lỗi đỏ', 'Vé đã được check-in trước đó', 'Kiểm tra màn hình lễ tân: Nếu trùng thời gian thì từ chối tiếp nhận để ngăn chặn vé giả.'],
      ['9. Hóa đơn điện tử chưa gửi tới khách', 'Địa chỉ email khách hàng gõ sai ký tự', 'Vào hồ sơ khách hàng, sửa lại đúng địa chỉ email và nhấn "Gửi lại hóa đơn điện tử".'],
      ['10. Cần hỗ trợ kỹ thuật khẩn cấp', 'Sự cố hạ tầng nghiêm trọng ngoài giờ', 'Liên hệ Tổng đài Hỗ trợ Kỹ thuật ViOne 24/7 qua Hotline 1900-VIONE hoặc gửi ticket ưu tiên.']
    ],
    fieldHeaders: ['Hiện Tượng Sự Cố', 'Nguyên Nhân Khả Dĩ', 'Biện Pháp Khắc Phục Tức Thì'],
    callout: 'KÊNH HỖ TRỢ KỸ THUẬT CHÍNH THỨC 24/7: Ban Hỗ trợ Kỹ thuật ViOne Platform cam kết phản hồi sự cố trong vòng 15 phút qua các kênh: Hotline 1900-VIONE, Hòm thư support@vione.ai, và Kênh Zalo Hỗ trợ Doanh nghiệp VIP.',
    steps: [
      'Bước 1: Xác định chính xác thông báo lỗi hiển thị trên màn hình (Chụp ảnh màn hình lỗi nếu có thể).',
      'Bước 2: Tra cứu bảng 10 sự cố phổ biến ở trên để thử khắc phục nhanh theo hướng dẫn.',
      'Bước 3: Nếu không tự xử lý được, bấm vào biểu tượng "Hỗ Trợ (Support Ticket)" tại góc dưới màn hình.',
      'Bước 4: Nhập mô tả sự cố, đính kèm ảnh chụp lỗi và chọn mức độ ưu tiên (Khẩn cấp / Cao / Bình thường).',
      'Bước 5: Kỹ sư hỗ trợ ViOne nhận thông tin và liên hệ xử lý trực tiếp qua Ultraviewer/AnyDesk nếu cần.'
    ],
    troubleshoot: [
      ['Cần đào tạo lại cho nhân viên mới', 'Công ty có đợt tuyển dụng nhân sự mới', 'Tải tài liệu HDSD này và cho nhân viên xem bộ video bài giảng thực hành có sẵn trong app.'],
      ['Cần nâng cấp gói dịch vụ thêm người dùng', 'Công ty mở rộng quy mô kinh doanh', 'Liên hệ chuyên viên chăm sóc tài khoản (Account Manager) để nâng cấp gói trong 15 phút.']
    ],
    image: '10_app_user_guide_pdf_viewer.png',
    caption: 'Trung Tâm Trợ Giúp, Tra Cứu Hướng Dẫn & Gửi Phiếu Yêu Cầu Hỗ Trợ 24/7'
  }
];

async function buildHdsdDocx() {
  console.log('>>> Bắt đầu tạo file Word HDSD DOCX Master v5.0...');

  // COVER
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
      spacing: { before: 40, after: 300 },
      children: [
        new TextRun({
          text: 'TRUNG TÂM ĐÀO TẠO & CHUYỂN GIAO CÔNG NGHỆ VẬN HÀNH',
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
          text: '---------------------------------------------------------',
          font: FONT_FAMILY,
          size: 20,
          color: COLOR_GOLD,
        }),
      ],
    }),

    // Title
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 120 },
      children: [
        new TextRun({
          text: 'CẨM NANG HƯỚNG DẪN SỬ DỤNG HỆ THỐNG',
          font: FONT_FAMILY,
          size: 38,
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
          text: 'SYSTEM OPERATION & USER MANUAL GUIDE',
          font: FONT_FAMILY,
          size: 28,
          bold: true,
          color: COLOR_GOLD,
        }),
      ],
    }),

    // Subtitle
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 100, after: 600 },
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

    // Document Control Box
    createTable(
      ['Thuộc Tính Cẩm Nang Vận Hành', 'Thông Tin Kiểm Soát Chi Tiết'],
      [
        ['Tên Tài Liệu', 'Cẩm Nang Hướng Dẫn Sử Dụng Hệ Thống ViOne Platform 5.0'],
        ['Mã Số Tài Liệu', 'HDSD-VIONE-OPERATION-MASTER-V5.0'],
        ['Phiên Bản Phát Hành', 'Phiên bản 5.0 Master Release (14 Chương Hướng Dẫn Thực Chiến Toàn Diện)'],
        ['Ngày Phát Hành', '02/10/2026'],
        ['Đơn Vị Ban Hành', 'Ban Công Nghệ & Chuyển Đổi Số — VioConnect Corporation'],
        ['Đối Tượng Áp Dụng', 'Toàn thể Lãnh đạo, Quản lý, Nhân viên và Hội viên Doanh nghiệp'],
        ['Cấp Độ Bảo Mật', 'TÀI LIỆU LƯU HÀNH NỘI BỘ & KHÁCH HÀNG DOANH NGHIỆP'],
        ['Tình Trạng Thẩm Định', 'Đã kiểm thử thực địa 100%, tích hợp ảnh chụp minh chứng sắc nét']
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

  // BODY
  const bodyChildren = [
    // TOC
    createHeading1('MỤC LỤC CẨM NANG (TABLE OF CONTENTS)'),
    new TableOfContents('Mục Lục Tự Động', {
      hyperlink: true,
      headingStyleRange: '1-3',
    }),
    new Paragraph({ spacing: { after: 200 } }),

    // Visual structured TOC Table
    createTable(
      ['Chương', 'Tên Chương Hướng Dẫn Vận Hành Thực Chiến', 'Phạm Vi Nghiệp Vụ'],
      HDSD_CHAPTERS.map(ch => [
        `Chương ${ch.chapterNumber}`,
        ch.title,
        'Thao tác chi tiết + Bảng trường + Ảnh minh chứng'
      ]),
      [1400, 5800, 2000]
    ),
    new Paragraph({ spacing: { after: 360 } }),
    new Paragraph({ children: [new PageBreak()] })
  ];

  // 14 Chapters
  HDSD_CHAPTERS.forEach((ch, idx) => {
    bodyChildren.push(
      createHeading1(`Chương ${ch.chapterNumber}: ${ch.title}`),
      createParagraph(ch.intro),
      createHeading2(`${ch.chapterNumber}.1. Bảng đặc tả các trường thông tin & thông số giao diện`),
      createTable(ch.fieldHeaders, ch.fields),
      new Paragraph({ spacing: { before: 140, after: 100 } }),
      createHeading2(`${ch.chapterNumber}.2. Quy trình thao tác từng bước chi tiết (Step-by-Step Guide)`),
      ...ch.steps.map(s => createBullet(s)),
      new Paragraph({ spacing: { before: 140, after: 100 } }),
      createHeading2(`${ch.chapterNumber}.3. Lưu ý quan trọng & Quy tắc nghiệp vụ bắt buộc`),
      createParagraph(ch.callout, { bold: true, color: COLOR_AMBER }),
      new Paragraph({ spacing: { before: 140, after: 100 } }),
      createHeading2(`${ch.chapterNumber}.4. Xử lý sự cố thường gặp trong chương này (Troubleshooting)`),
      createTable(['Hiện Tượng Sự Cố', 'Nguyên Nhân Khả Dĩ', 'Cách Khắc Phục Tức Thì'], ch.troubleshoot, [2600, 3000, 3600]),
      new Paragraph({ spacing: { before: 140, after: 100 } }),
      createHeading2(`${ch.chapterNumber}.5. Hình ảnh minh chứng giao diện thực tế trên hệ thống`),
      ...createImageParagraph(ch.image, `Hình ${ch.chapterNumber}.1: ${ch.caption}`),
      new Paragraph({ spacing: { after: 240 } })
    );
  });

  const doc = new Document({
    features: {
      updateFields: true,
    },
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 },
          },
        },
        children: coverChildren,
      },
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
                    text: 'HDSD-VIONE-OPERATION-MASTER-V5.0 · Vione Platform 5.0',
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
        children: bodyChildren,
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  const outDocx = path.join(VIONE_DOC_DIR, 'HDSD_HE_THONG_VIONE_TOAN_DIEN.docx');
  fs.writeFileSync(outDocx, buffer);
  console.log(`✓ Đã xuất bản file Word HDSD DOCX thành công: ${outDocx} (${(buffer.length / (1024 * 1024)).toFixed(2)} MB)`);

  FE_DOCS_DIRS.forEach(d => {
    fs.writeFileSync(path.join(d, 'HDSD_HE_THONG_VIONE_TOAN_DIEN.docx'), buffer);
  });
  console.log('✓ Đã đồng bộ file HDSD DOCX sang tất cả các thư mục dự án!');
}

function buildHdsdHtml() {
  console.log('>>> Bắt đầu tạo file HTML HDSD Interactive Master v5.0...');
  let html = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cẩm Nang Hướng Dẫn Sử Dụng Hệ Thống ViOne Platform 5.0 Toàn Diện</title>
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
    .brand-logo { width: 36px; height: 36px; background: linear-gradient(135deg, var(--primary), var(--primary-dark)); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: 900; color: #000; font-size: 20px; }
    .brand-name { font-size: 16px; font-weight: 800; color: #fff; letter-spacing: -0.5px; }
    .brand-sub { font-size: 11px; color: var(--text-muted); }
    
    .nav-list { list-style: none; }
    .nav-item { margin-bottom: 6px; }
    .nav-link { display: block; padding: 8px 12px; border-radius: 8px; color: var(--text-muted); text-decoration: none; font-size: 13px; font-weight: 500; transition: all 0.2s; }
    .nav-link:hover, .nav-link.active { background: rgba(234, 179, 8, 0.1); color: var(--primary); font-weight: 600; }
    
    /* Content Area */
    .content { flex: 1; padding: 40px 60px; max-width: 1100px; margin: 0 auto; }
    .doc-header { margin-bottom: 40px; border-bottom: 1px solid var(--card-border); padding-bottom: 24px; }
    .doc-badge { display: inline-block; background: rgba(234, 179, 8, 0.15); color: var(--primary); border: 1px solid rgba(234, 179, 8, 0.3); font-size: 12px; font-weight: 700; padding: 4px 12px; border-radius: 20px; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
    .doc-title { font-size: 32px; font-weight: 900; color: #fff; margin-bottom: 8px; letter-spacing: -0.5px; }
    .doc-sub { font-size: 15px; color: var(--text-muted); }
    
    /* Chapter Section */
    .chapter { margin-bottom: 60px; padding-top: 20px; border-bottom: 1px solid #1f1f23; padding-bottom: 40px; }
    .chapter-tag { color: var(--primary); font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; }
    .chapter-title { font-size: 24px; font-weight: 800; color: #fff; margin-bottom: 16px; }
    .chapter-intro { font-size: 15px; color: #cbd5e1; margin-bottom: 20px; line-height: 1.7; }
    
    .section-h3 { font-size: 17px; font-weight: 700; color: var(--primary); margin: 24px 0 12px; }
    
    /* Tables */
    .table-wrap { overflow-x: auto; margin-bottom: 24px; border: 1px solid var(--card-border); border-radius: 10px; background: var(--card-bg); }
    table { width: 100%; border-collapse: collapse; text-align: left; font-size: 13.5px; }
    th { background: #0f172a; color: #f8fafc; padding: 12px 16px; font-weight: 700; border-bottom: 1px solid var(--card-border); }
    td { padding: 12px 16px; border-bottom: 1px solid #27272a; color: #e2e8f0; }
    tr:last-child td { border-bottom: none; }
    tr:nth-child(even) { background: rgba(255, 255, 255, 0.02); }
    
    /* Steps */
    .step-list { list-style: none; margin-bottom: 24px; }
    .step-item { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 12px; font-size: 14.5px; color: #e2e8f0; }
    .step-num { width: 26px; height: 26px; border-radius: 50%; background: var(--primary); color: #000; font-weight: 800; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 13px; margin-top: 2px; }
    
    /* Callout */
    .callout { background: rgba(234, 179, 8, 0.08); border-left: 4px solid var(--primary); padding: 16px 20px; border-radius: 0 10px 10px 0; margin-bottom: 24px; }
    .callout-title { font-weight: 800; font-size: 13.5px; color: var(--primary); margin-bottom: 4px; text-transform: uppercase; }
    .callout-text { font-size: 14px; color: #fef08a; line-height: 1.6; }
    
    /* Image Evidence */
    .image-box { margin-top: 24px; background: #000; border: 1px solid var(--card-border); border-radius: 12px; overflow: hidden; text-align: center; padding: 16px; }
    .image-box img { max-width: 100%; height: auto; border-radius: 8px; border: 1px solid #334155; }
    .image-caption { font-size: 12.5px; color: var(--text-muted); font-style: italic; margin-top: 10px; }
  </style>
</head>
<body>
  <div class="container">
    <aside class="sidebar">
      <div class="brand">
        <div class="brand-logo">V</div>
        <div>
          <div class="brand-name">ViOne Platform 5.0</div>
          <div class="brand-sub">Cẩm Nang Vận Hành Master</div>
        </div>
      </div>
      <ul class="nav-list">
`;

  HDSD_CHAPTERS.forEach(ch => {
    html += `
      <li class="nav-item">
        <a class="nav-link" href="#chapter-${ch.chapterNumber}">Chương ${ch.chapterNumber}: ${ch.title}</a>
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
    const rawBase64 = getImgBase64(ch.image) || getImgBase64('01_crm_login_blue_white.png');
    html += `
      <section class="chapter" id="chapter-${ch.chapterNumber}">
        <div class="chapter-tag">CHƯƠNG ${ch.chapterNumber}</div>
        <h2 class="chapter-title">${ch.title}</h2>
        <p class="chapter-intro">${ch.intro}</p>
    
        <h3 class="section-h3">${ch.chapterNumber}.1. Bảng Đặc Tả Trường Thông Tin & Thông Số Giao Diện</h3>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>${ch.fieldHeaders.map(h => `<th>${h}</th>`).join('')}</tr>
            </thead>
            <tbody>
              ${ch.fields.map(row => `<tr>${row.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}
            </tbody>
          </table>
        </div>
      
        <div class="callout">
          <div class="callout-title">📌 LƯU Ý QUAN TRỌNG & NGUYÊN TẮC NGHIỆP VỤ</div>
          <div class="callout-text">${ch.callout}</div>
        </div>

        <h3 class="section-h3">${ch.chapterNumber}.2. Quy Trình Thao Tác Từng Bước Chi Tiết</h3>
        <ul class="step-list">
          ${ch.steps.map((s, idx) => `
          <li class="step-item">
            <span class="step-num">${idx + 1}</span>
            <span>${s}</span>
          </li>
          `).join('')}
        </ul>

        <h3 class="section-h3">${ch.chapterNumber}.3. Xử Lý Sự Cố Thường Gặp (Troubleshooting)</h3>
        <div class="table-wrap">
          <table>
            <thead>
              <tr><th>Hiện Tượng Sự Cố</th><th>Nguyên Nhân Khả Dĩ</th><th>Cách Khắc Phục Tức Thì</th></tr>
            </thead>
            <tbody>
              ${ch.troubleshoot.map(row => `<tr>${row.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}
            </tbody>
          </table>
        </div>

        <div class="image-box">
          <img src="${rawBase64}" alt="${ch.caption}">
          <div class="image-caption">Minh chứng thực tế: Hình ${ch.chapterNumber}.1: ${ch.caption}</div>
        </div>
      </section>
    `;
  });

  html += `
    </main>
  </div>
</body>
</html>`;

  const outHtml = path.join(VIONE_DOC_DIR, 'HDSD_HE_THONG_VIONE_TOAN_DIEN.html');
  fs.writeFileSync(outHtml, html);
  console.log(`✓ Đã xuất bản file HTML HDSD thành công: ${outHtml} (${(Buffer.byteLength(html) / (1024 * 1024)).toFixed(2)} MB)`);

  FE_DOCS_DIRS.forEach(d => {
    fs.writeFileSync(path.join(d, 'HDSD_HE_THONG_VIONE_TOAN_DIEN.html'), html);
  });
  console.log('✓ Đã đồng bộ file HTML HDSD sang tất cả các thư mục dự án!');
}

function buildHdsdMarkdown() {
  console.log('>>> Bắt đầu tạo file Markdown HDSD Master v5.0...');
  let md = `# TÀI LIỆU HƯỚNG DẪN SỬ DỤNG HỆ SINH THÁI DOANH NGHIỆP VIONE PLATFORM 5.0

**Đơn Vị Chủ Quản:** VIOCONNECT VIỆT NAM  
**Phiên Bản Hệ Thống:** ViOne Platform Enterprise v5.0 (Build 2026.10)  
**Tiêu Chuẩn Tài Liệu:** ISO/IEC 26514:2008 & IEEE 1063-2001  
**Ngày Ban Hành:** Tháng 10 Năm 2026  
**Trạng Thái:** Chính Thức Phê Duyệt & Chuyển Giao Vận Hành  

---

## BẢNG KIỂM SOÁT THAY ĐỔI & PHIÊN BẢN

| Phiên Bản | Ngày Ban Hành | Tác Giả / Đơn Vị | Nội Dung Cập Nhật Chính | Trạng Thái |
| :---: | :---: | :---: | :--- | :---: |
| v1.0 | 15/09/2026 | Ban Chuyển Đổi Số ViOne | Khởi tạo tài liệu khung hướng dẫn vận hành | Bản nháp |
| v2.0 | 22/09/2026 | Đội Ngũ Sản Phẩm VioConnect | Bổ sung hướng dẫn Module CRM & Work | Rà soát |
| v3.0 | 28/09/2026 | Tổ Tư Vấn Kiến Trúc Doanh Nghiệp | Tích hợp hướng dẫn App Di Động Titanium NFC | Hoàn thiện |
| v4.0 | 01/10/2026 | Hội Đồng Thẩm Định Kỹ Thuật | Chuẩn hóa 14 chương nghiệp vụ & Ma trận RBAC | Phê duyệt |
| **v5.0** | **02/10/2026** | **Ban Giám Đốc Công Nghệ VioConnect** | **Đại tu toàn diện: Bảng trường dữ liệu, Khắc phục sự cố & Ảnh minh chứng** | **CHÍNH THỨC** |

---

## MỤC LỤC TỔNG QUAN 14 CHƯƠNG VẬN HÀNH

`;

  HDSD_CHAPTERS.forEach(ch => {
    md += `- [Chương ${ch.chapterNumber}: ${ch.title}](#chuong-${ch.chapterNumber}-${ch.title.toLowerCase().replace(/[^a-z0-9àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ\s]/gi, '').replace(/\s+/g, '-')})\n`;
  });

  md += `\n---\n\n`;

  HDSD_CHAPTERS.forEach(ch => {
    const slug = `chuong-${ch.chapterNumber}-${ch.title.toLowerCase().replace(/[^a-z0-9àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ\s]/gi, '').replace(/\s+/g, '-')}`;
    md += `## <a id="${slug}"></a>Chương ${ch.chapterNumber}: ${ch.title}\n\n`;
    md += `${ch.intro}\n\n`;

    // Section 1: Field table
    md += `### ${ch.chapterNumber}.1. Danh Mục Các Trường Dữ Liệu & Hướng Dẫn Nhập Liệu\n\n`;
    md += `| ${ch.fieldHeaders.join(' | ')} |\n`;
    md += `| ${ch.fieldHeaders.map(() => ':---').join(' | ')} |\n`;
    ch.fields.forEach(row => {
      md += `| ${row.map(c => String(c).replace(/\|/g, '\\|')).join(' | ')} |\n`;
    });
    md += `\n`;

    // Callout
    md += `> [!IMPORTANT]\n`;
    md += `> **QUY TẮC NGHIỆP VỤ & LƯU Ý BẮT BUỘC:**  \n`;
    md += `> ${ch.callout}\n\n`;

    // Section 2: Steps
    md += `### ${ch.chapterNumber}.2. Quy Trình Thao Tác Từng Bước (Step-by-Step Procedure)\n\n`;
    ch.steps.forEach(st => {
      md += `${st}\n`;
    });
    md += `\n`;

    // Section 3: Troubleshooting
    md += `### ${ch.chapterNumber}.3. Xử Lý Sự Cố Thường Gặp (Troubleshooting Guide)\n\n`;
    md += `| Hiện Tượng Sự Cố | Nguyên Nhân Khả Dĩ | Cách Khắc Phục Tức Thì |\n`;
    md += `| :--- | :--- | :--- |\n`;
    ch.troubleshoot.forEach(row => {
      md += `| ${row.map(c => String(c).replace(/\|/g, '\\|')).join(' | ')} |\n`;
    });
    md += `\n`;

    // Evidence Image
    md += `### ${ch.chapterNumber}.4. Minh Chứng Giao Diện Thực Tế\n\n`;
    md += `![Hình ${ch.chapterNumber}.1: ${ch.caption}](images/evidence/${ch.image})\n\n`;
    md += `*Hình ${ch.chapterNumber}.1: ${ch.caption}*\n\n`;
    md += `---\n\n`;
  });

  const outMd = path.join(VIONE_DOC_DIR, 'HDSD_HE_THONG_VIONE_TOAN_DIEN.md');
  fs.writeFileSync(outMd, md, 'utf8');
  console.log(`✓ Đã xuất bản file Markdown HDSD thành công: ${outMd} (${(fs.statSync(outMd).size / 1024).toFixed(1)} KB)`);

  FE_DOCS_DIRS.forEach(d => {
    fs.writeFileSync(path.join(d, 'HDSD_HE_THONG_VIONE_TOAN_DIEN.md'), md, 'utf8');
  });
  console.log('✓ Đã đồng bộ file Markdown HDSD sang tất cả các thư mục dự án!');
}

async function main() {
  await buildHdsdDocx();
  buildHdsdHtml();
  buildHdsdMarkdown();
  console.log('🎉 Hoàn tất 100% xây dựng & đồng bộ HDSD Master v5.0 (DOCX, HTML, MD)!');
}

main().catch(err => {
  console.error('Lỗi khi xây dựng HDSD Master:', err);
  process.exit(1);
});

