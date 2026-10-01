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
} = require('docx');

const VIONE_DIR = path.resolve(__dirname, '../../vione_project');
const DOC_DIR = path.join(VIONE_DIR, 'document');
const EVIDENCE_DIR = path.join(DOC_DIR, 'images', 'evidence');
const FE_DOCS_DIR = path.join(VIONE_DIR, 'apps', 'vione_app_fe', 'public', 'docs');

[DOC_DIR, FE_DOCS_DIR].forEach(d => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

// Cấu hình phông chữ & màu sắc chuẩn thương hiệu ViOne (Onyx & Champagne Gold)
const FONT_FAMILY = 'Times New Roman';
const COLOR_BLACK = '0A0A0B';
const COLOR_GOLD = 'D4AF37';
const COLOR_GOLD_LIGHT = 'D8B282';
const COLOR_DARK = '18181B';
const COLOR_BORDER = 'CBD5E1';
const COLOR_BG_HEADER = '18181B';
const COLOR_BG_ALT = 'F8FAFC';
const TABLE_WIDTH_DXA = 9200; // Chiều rộng bảng chuẩn trang A4 Word

const BORDER_STYLE_THIN = {
  top: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
  bottom: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
  left: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
  right: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
};

// Tập hợp các ảnh Mobile portrait để giới hạn kích thước vừa vặn (220x440)
const MOBILE_IMG_SET = new Set([
  'app_vione_01_login.png',
  'app_vione_02_home_agenda.png',
  'app_vione_03_quick_action_v.png',
  'app_vione_04_network_directory.png',
  'app_vione_05_moments_feed.png',
  'app_vione_06_chat_inbox.png',
  'app_vione_07_community_opportunities.png',
  'app_vione_08_digital_card_me.png',
  'app_vione_09_nfc_activation.png',
  'app_vione_10_security_settings.png',
  'app_vione_11_identity_edit.png'
]);

function createDocxParagraph(text, options = {}) {
  const {
    bold = false,
    italic = false,
    fontSize = 12,
    color = COLOR_DARK,
    alignment = AlignmentType.LEFT,
    spacingBefore = 80,
    spacingAfter = 80,
    heading = null,
  } = options;

  return new Paragraph({
    heading: heading,
    alignment: alignment,
    spacing: { before: spacingBefore, after: spacingAfter },
    children: [
      new TextRun({
        text: text,
        font: FONT_FAMILY,
        size: fontSize * 2,
        bold: bold,
        italic: italic,
        color: color,
      }),
    ],
  });
}

function createDocxHeading1(title) {
  return createDocxParagraph(title, {
    bold: true,
    fontSize: 16,
    color: COLOR_BLACK,
    spacingBefore: 280,
    spacingAfter: 120,
    heading: HeadingLevel.HEADING_1,
  });
}

function createDocxHeading2(title) {
  return createDocxParagraph(title, {
    bold: true,
    fontSize: 13.5,
    color: '92400E',
    spacingBefore: 200,
    spacingAfter: 80,
    heading: HeadingLevel.HEADING_2,
  });
}

function createDocxHeading3(title) {
  return createDocxParagraph(title, {
    bold: true,
    fontSize: 12,
    color: COLOR_DARK,
    spacingBefore: 140,
    spacingAfter: 60,
    heading: HeadingLevel.HEADING_3,
  });
}

function createDocxCell(text, options = {}) {
  const {
    isHeader = false,
    bold = isHeader,
    widthPercent = null,
    widthDxa = null,
    shadingColor = null,
    alignment = AlignmentType.LEFT,
    colSpan = 1,
    rowSpan = 1,
    fontSize = 10,
    fontColor = isHeader ? 'FFFFFF' : COLOR_DARK,
  } = options;

  const cellWidth = widthDxa
    ? { size: widthDxa, type: WidthType.DXA }
    : widthPercent
    ? { size: widthPercent, type: WidthType.PERCENTAGE }
    : null;

  return new TableCell({
    width: cellWidth,
    columnSpan: colSpan,
    rowSpan: rowSpan,
    borders: BORDER_STYLE_THIN,
    shading: {
      type: ShadingType.CLEAR,
      fill: shadingColor || (isHeader ? COLOR_BG_HEADER : 'FFFFFF'),
    },
    margins: { top: 100, bottom: 100, left: 140, right: 140 },
    children: [
      new Paragraph({
        alignment: alignment,
        spacing: { before: 20, after: 20 },
        children: [
          new TextRun({
            text: text,
            font: FONT_FAMILY,
            size: fontSize * 2,
            bold: bold,
            color: fontColor,
          }),
        ],
      }),
    ],
  });
}

function createDocxUseCaseTable(uc) {
  const rows = [
    new TableRow({
      children: [
        createDocxCell(`USE CASE: ${uc.id} - ${uc.name.toUpperCase()}`, {
          colSpan: 2,
          isHeader: true,
          fontSize: 10.5,
          shadingColor: COLOR_BG_HEADER,
        }),
      ],
    }),
    new TableRow({
      children: [
        createDocxCell('Tác nhân (Actor)', { widthDxa: 2400, bold: true, shadingColor: COLOR_BG_ALT }),
        createDocxCell(uc.actor, { widthDxa: 6800 }),
      ],
    }),
    new TableRow({
      children: [
        createDocxCell('Tiền điều kiện (Pre-conditions)', { widthDxa: 2400, bold: true, shadingColor: COLOR_BG_ALT }),
        createDocxCell(uc.preconditions, { widthDxa: 6800 }),
      ],
    }),
    new TableRow({
      children: [
        createDocxCell('Luồng sự kiện chính (Main Flow)', { widthDxa: 2400, bold: true, shadingColor: COLOR_BG_ALT }),
        createDocxCell(uc.mainFlow, { widthDxa: 6800 }),
      ],
    }),
    new TableRow({
      children: [
        createDocxCell('Luồng ngoại lệ (Alternative Flow)', { widthDxa: 2400, bold: true, shadingColor: COLOR_BG_ALT }),
        createDocxCell(uc.altFlow, { widthDxa: 6800 }),
      ],
    }),
    new TableRow({
      children: [
        createDocxCell('Hậu điều kiện (Post-conditions)', { widthDxa: 2400, bold: true, shadingColor: COLOR_BG_ALT }),
        createDocxCell(uc.postconditions, { widthDxa: 6800 }),
      ],
    }),
    new TableRow({
      children: [
        createDocxCell('Quy tắc nghiệp vụ (Business Rules)', { widthDxa: 2400, bold: true, shadingColor: COLOR_BG_ALT }),
        createDocxCell(uc.businessRules, { widthDxa: 6800 }),
      ],
    }),
  ];

  return new Table({
    width: { size: TABLE_WIDTH_DXA, type: WidthType.DXA },
    layout: TableLayoutType.FIXED,
    rows: rows,
  });
}

function createDocxImageBlock(filename, caption) {
  const filePath = path.join(EVIDENCE_DIR, filename);
  if (!fs.existsSync(filePath)) {
    return [createDocxParagraph(`[Chưa tìm thấy ảnh: ${filename}]`, { italic: true, color: 'DC2626' })];
  }

  const isMobile = MOBILE_IMG_SET.has(filename);
  const imgWidth = isMobile ? 220 : 520;
  const imgHeight = isMobile ? 440 : 290;

  try {
    const imgBuffer = fs.readFileSync(filePath);
    return [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 140, after: 60 },
        children: [
          new ImageRun({
            data: imgBuffer,
            transformation: {
              width: imgWidth,
              height: imgHeight,
            },
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 180 },
        children: [
          new TextRun({
            text: caption,
            font: FONT_FAMILY,
            size: 9.5 * 2,
            italic: true,
            color: '64748B',
          }),
        ],
      }),
    ];
  } catch (err) {
    return [createDocxParagraph(`[Lỗi nạp ảnh: ${filename}]`, { italic: true, color: 'DC2626' })];
  }
}

// 16 USE CASES CHO VIONE ENTERPRISE & VIONE CONNECT
const VIONE_USE_CASES = [
  {
    id: 'UC-01',
    name: 'Đăng nhập Quản trị CRM ViOne & Phân quyền RBAC',
    actor: 'Quản trị viên hệ thống (Super Admin, Enterprise Admin, Department Manager)',
    preconditions: 'Người dùng truy cập vào cổng quản trị Web CRM ViOne (Port 5445 /auth). Tài khoản đã được kích hoạt trong public.vione_users.',
    mainFlow: '1. Người dùng nhập Email/Username và Mật khẩu.\n2. Bấm "Đăng nhập". Hệ thống gửi request tới POST /api/auth/login.\n3. Backend xác thực mã băm mật khẩu Bcrypt, phát hành JWT token (Access Token & Refresh Token).\n4. Client lưu token bảo mật, gán Header Authorization Bearer và điều hướng người dùng vào Dashboard.',
    altFlow: 'A1. Sai mật khẩu hoặc tài khoản chưa kích hoạt: Hệ thống trả mã HTTP 401, hiển thị Toast thông báo lỗi đỏ và không lưu session.\nA2. Tài khoản bị khóa tạm thời: Thông báo liên hệ quản trị cấp cao.',
    postconditions: 'Phiên làm việc được thiết lập. Người dùng được cấp quyền truy cập các module theo đúng vai trò RBAC.',
    businessRules: 'Chỉ chấp nhận đăng nhập đối với tài khoản có trạng thái active. Khóa tạm thời 15 phút nếu nhập sai quá 5 lần liên tiếp.',
    imageFile: 'crm_vione_01_login.png',
    imageCaption: 'Hình 5.1: Màn hình đăng nhập hệ thống quản trị Web CRM ViOne Enterprise',
  },
  {
    id: 'UC-02',
    name: 'Trung tâm điều hành B2B Dashboard & Giám sát chỉ số KPI',
    actor: 'Ban Lãnh đạo Doanh nghiệp (C-Level, Ban Giám Đốc)',
    preconditions: 'Đã đăng nhập thành công vào CRM ViOne với quyền hạn Admin hoặc Quản lý.',
    mainFlow: '1. Người dùng truy cập route / hoặc /dashboard.\n2. Hệ thống gọi song song các API thống kê: GET /api/companies/stats, GET /api/opportunities/stats, GET /api/income/stats, GET /api/expenses/stats.\n3. Hiển thị các thẻ chỉ số KPI kinh doanh: Doanh số tháng, Số lượng đối tác B2B, Hợp đồng đang mở thầu, và Tỷ suất lợi nhuận.\n4. Hiển thị biểu đồ trực quan hóa dữ liệu theo tháng/quý.',
    altFlow: 'A1. Mất kết nối API thống kê: Hệ thống hiển thị trạng thái Skeleton loading và nút "Tải lại dữ liệu" mà không làm crash giao diện.',
    postconditions: 'Dữ liệu chỉ số KPI thời gian thực được hiển thị trực quan cho ban lãnh đạo.',
    businessRules: 'Dữ liệu thống kê được tính toán trực tiếp từ cơ sở dữ liệu PostgreSQL, không dùng dữ liệu giả lập.',
    imageFile: 'crm_vione_02_dashboard.png',
    imageCaption: 'Hình 5.2: Bảng điều khiển KPI điều hành kinh doanh và chỉ số giao thương B2B',
  },
  {
    id: 'UC-03',
    name: 'Quản lý mạng lưới đối tác doanh nghiệp & danh bạ thành viên B2B',
    actor: 'Ban Phát triển Kinh doanh, Trưởng phòng Đối ngoại',
    preconditions: 'Người dùng truy cập route /members trên Web CRM.',
    mainFlow: '1. Hệ thống hiển thị bảng danh sách đối tác và thành viên lấy từ bảng public.members.\n2. Người dùng lọc theo ngành nghề, khu vực địa lý, hoặc tìm kiếm theo tên/MST/SĐT.\n3. Bấm vào một dòng để xem hồ sơ chi tiết đối tác: Thông tin công ty đại diện, người liên hệ chính, lịch sử giao dịch và xếp hạng tín nhiệm.',
    altFlow: 'A1. Không tìm thấy đối tác: Hiển thị giao diện rỗng thân thiện (Empty State) kèm gợi ý mở rộng tiêu chí tìm kiếm.',
    postconditions: 'Hồ sơ đối tác được tra cứu chính xác, hỗ trợ xuất danh bạ ra tệp Excel nếu có quyền.',
    businessRules: 'Thông tin nhạy cảm của đối tác (SĐT, Email cá nhân) tuân theo chính sách phân quyền Field-level Visibility.',
    imageFile: 'crm_vione_03_members_partners.png',
    imageCaption: 'Hình 5.3: Danh mục đối tác doanh nghiệp và hồ sơ thành viên B2B',
  },
  {
    id: 'UC-04',
    name: 'Quản trị hồ sơ doanh nghiệp đa công ty (Companies Management)',
    actor: 'Quản trị viên CRM ViOne',
    preconditions: 'Người dùng có quyền quản trị danh mục công ty, truy cập route /companies.',
    mainFlow: '1. Hệ thống liệt kê toàn bộ danh sách các công ty thành viên và đối tác trực thuộc.\n2. Bấm "Thêm công ty" để mở Modal tạo mới.\n3. Nhập Tên doanh nghiệp, Mã số thuế, Địa chỉ trụ sở, Ngành nghề chính, Người đại diện pháp luật.\n4. Bấm "Lưu". Client gọi POST /api/companies gửi payload JSON.\n5. Backend lưu bản ghi vào CSDL, kích hoạt webhook tạo danh bạ số.',
    altFlow: 'A1. Mã số thuế đã tồn tại: Backend trả về lỗi 400 Bad Request kèm thông báo "Mã số thuế đã được đăng ký trên hệ thống".',
    postconditions: 'Hồ sơ công ty mới được ghi nhận vào CSDL PostgreSQL và lập tức xuất hiện trên danh bạ hệ thống.',
    businessRules: 'Mã số thuế phải đúng định dạng 10 hoặc 13 chữ số theo quy định của Tổng cục Thuế Việt Nam.',
    imageFile: 'crm_vione_04_companies.png',
    imageCaption: 'Hình 5.4: Bảng quản lý danh mục công ty thành viên và thông tin pháp lý',
  },
  {
    id: 'UC-05',
    name: 'Quản trị pipeline cơ hội xúc tiến thương mại B2B',
    actor: 'Giám đốc Kinh doanh, Chuyên viên Sales B2B',
    preconditions: 'Truy cập route /opportunities trên CRM ViOne.',
    mainFlow: '1. Hệ thống hiển thị bảng Kanban Pipeline các cơ hội thương mại theo 5 giai đoạn: Khởi tạo -> Đánh giá -> Đàm phán -> Ký kết -> Đóng thương vụ.\n2. Người dùng kéo thả (Drag & Drop) card cơ hội giữa các cột để chuyển giai đoạn.\n3. Thêm mới cơ hội: Nhập Tiêu đề cơ hội, Đối tác cung ứng, Đối tác thụ hưởng, Ngân sách dự kiến (VNĐ), và Hạn chót đàm phán.\n4. Bấm "Tạo cơ hội". Dữ liệu lưu vào bảng public.opportunities.',
    altFlow: 'A1. Thất bại trong đàm phán: Người dùng chuyển trạng thái sang "Thất bại" và bắt buộc nhập lý do vào ô ghi chú.',
    postconditions: 'Tiến độ thương vụ được cập nhật thời gian thực, tự động tính toán lại tổng giá trị Pipeline.',
    businessRules: 'Ngân sách cơ hội được định dạng phân cách hàng nghìn chuẩn VNĐ. Mọi thay đổi giai đoạn đều được ghi nhận vào Audit Log.',
    imageFile: 'crm_vione_05_opportunities_pipeline.png',
    imageCaption: 'Hình 5.5: Quản trị Pipeline cơ hội xúc tiến thương mại B2B theo mô hình Kanban',
  },
  {
    id: 'UC-06',
    name: 'Quản trị danh mục sàn B2B Marketplace & kiểm duyệt sản phẩm',
    actor: 'Ban Quản trị Sàn Marketplace, Doanh nghiệp cung ứng',
    preconditions: 'Truy cập route /marketplace trên CRM ViOne.',
    mainFlow: '1. Hệ thống hiển thị danh mục sản phẩm, gói giải pháp và dịch vụ B2B.\n2. Doanh nghiệp nộp sản phẩm mới: Nhập Tên sản phẩm, Giá niêm yết, Giá sỉ đối tác VIP (VNĐ), Hình ảnh sản phẩm, và Thông số kỹ thuật.\n3. Quản trị viên thẩm định nội dung, bấm "Duyệt xuất bản".\n4. Sản phẩm chuyển sang trạng thái published và lập tức xuất hiện trên ứng dụng ViOne Connect.',
    altFlow: 'A1. Sản phẩm vi phạm chính sách: Quản trị viên bấm "Từ chối" kèm lý do, gửi thông báo phản hồi về tài khoản doanh nghiệp.',
    postconditions: 'Sản phẩm được niêm yết công khai trên Sàn B2B phục vụ giao thương giữa các thành viên.',
    businessRules: 'Chỉ các doanh nghiệp đã xác minh pháp lý mới được quyền đăng sản phẩm lên sàn.',
    imageFile: 'crm_vione_06_marketplace_catalog.png',
    imageCaption: 'Hình 5.6: Danh mục sản phẩm sàn giao dịch thương mại B2B ViOne Marketplace',
  },
  {
    id: 'UC-07',
    name: 'Quản lý thu chi tài chính & đối soát dòng tiền doanh nghiệp',
    actor: 'Kế toán trưởng, Giám đốc Tài chính (CFO)',
    preconditions: 'Người dùng có quyền tài chính, truy cập route /income hoặc /expenses.',
    mainFlow: '1. Xem danh sách các khoản thu/chi theo kỳ kế toán (tháng/quý/năm).\n2. Lập phiếu thu: Chọn Hợp đồng thương mại, Số tiền thu (VNĐ), Hình thức thanh toán (Chuyển khoản/VietQR), Đính kèm ủy nhiệm chi.\n3. Lập phiếu chi: Chọn Khoản mục chi phí, Đơn vị thụ hưởng, Dự toán ngân sách, Trình phê duyệt.\n4. Cấp quản lý bấm "Duyệt chi". Hệ thống hạch toán vào sổ quỹ.',
    altFlow: 'A1. Chi vượt định mức ngân sách: Hệ thống cảnh báo đỏ và yêu cầu chữ ký số của Tổng Giám Đốc.',
    postconditions: 'Phiếu thu/chi được lưu trữ bền vững, tự động cập nhật số dư tài khoản sổ quỹ doanh nghiệp.',
    businessRules: 'Số tiền thu/chi kiểm soát chính xác tới từng đồng VNĐ. Không được phép chỉnh sửa phiếu đã duyệt.',
    imageFile: 'crm_vione_07_finance_income.png',
    imageCaption: 'Hình 5.7: Sổ theo dõi nguồn thu tài chính và trạng thái thu nợ hợp đồng B2B',
  },
  {
    id: 'UC-08',
    name: 'Báo cáo phân tích dòng tiền & hiệu quả kinh doanh P&L',
    actor: 'Ban Lãnh đạo, Hội đồng Quản trị',
    preconditions: 'Truy cập route /finance-report trên CRM ViOne.',
    mainFlow: '1. Chọn khoảng thời gian đối soát tài chính (Từ ngày - Đến ngày).\n2. Hệ thống tổng hợp dữ liệu từ 2 nguồn Thu và Chi, tính toán Lợi nhuận gộp, Chi phí cố định và Dòng tiền ròng.\n3. Hiển thị biểu đồ cột trực quan biến động doanh thu - chi phí và bảng tỷ trọng chi phí.\n4. Hỗ trợ xuất file báo cáo tổng hợp phục vụ kỳ họp cổ đông.',
    altFlow: 'A1. Lựa chọn khoảng thời gian không có giao dịch: Hiển thị thông báo biểu đồ không có biến động.',
    postconditions: 'Báo cáo tài chính chuẩn xác được cung cấp cho ban lãnh đạo đưa ra quyết định kinh doanh.',
    businessRules: 'Công thức tính toán dòng tiền tuân thủ chuẩn mực kế toán Việt Nam (VAS).',
    imageFile: 'crm_vione_09_finance_report.png',
    imageCaption: 'Hình 5.8: Báo cáo phân tích dòng tiền và hiệu quả hoạt động kinh doanh',
  },
  {
    id: 'UC-09',
    name: 'Quản lý văn bản, hợp đồng & tài liệu số hóa bảo mật',
    actor: 'Bộ phận Pháp chế, Ban Thư ký Doanh nghiệp',
    preconditions: 'Truy cập route /documents trên CRM ViOne.',
    mainFlow: '1. Hệ thống hiển thị thư viện tài liệu phân loại theo thư mục: Hợp đồng kinh tế, Biên bản họp HĐQT, Quy chế nội bộ, và Giấy tờ pháp lý.\n2. Tải lên tài liệu mới: Chọn tệp (PDF/DOCX/XLSX), nhập Trích yếu nội dung, Ngày ban hành, Cấp độ bảo mật.\n3. Xem trực tuyến tài liệu ngay trên trình duyệt mà không cần tải về máy.\n4. Phân quyền xem/tải tài liệu theo từng phòng ban.',
    altFlow: 'A1. Tệp tin tải lên vượt quá dung lượng cho phép (50MB): Báo lỗi dung lượng và hướng dẫn nén tệp.',
    postconditions: 'Văn bản được lưu trữ an toàn trên Object Storage, mã hóa đường dẫn lưu trữ.',
    businessRules: 'Văn bản mật chỉ hiển thị đối với tài khoản được cấp quyền truy cập rõ ràng.',
    imageFile: 'crm_vione_10_documents_contracts.png',
    imageCaption: 'Hình 5.9: Thư viện tài liệu số hóa, hợp đồng kinh tế và văn bản pháp lý',
  },
  {
    id: 'UC-10',
    name: 'Lên lịch họp doanh nghiệp & triệu tập đại biểu B2B',
    actor: 'Ban Thư ký, Trợ lý Ban Điều hành',
    preconditions: 'Truy cập route /meetings trên CRM ViOne.',
    mainFlow: '1. Bấm "Tạo cuộc họp mới".\n2. Nhập Tiêu đề, Thời gian bắt đầu - kết thúc, Hình thức họp (Trực tiếp / Trực tuyến Zoom / Google Meet).\n3. Chọn thành phần đại biểu tham gia từ danh bạ doanh nghiệp.\n4. Bấm "Lưu và Phát hành". Hệ thống gửi thông báo đẩy và email lịch hẹn tự động tới toàn bộ đại biểu.',
    altFlow: 'A1. Phát hiện trùng phòng họp vật lý hoặc đại biểu bị trùng lịch: Hệ thống hiển thị cảnh báo xung đột lịch làm việc.',
    postconditions: 'Lịch họp được thêm vào lịch làm việc chung của công ty và đồng bộ xuống ứng dụng di động.',
    businessRules: 'Chỉ các cuộc họp đã được phê duyệt mới được phát hành thư mời tự động.',
    imageFile: 'crm_vione_11_meetings_calendar.png',
    imageCaption: 'Hình 5.10: Lịch biểu làm việc tuần/tháng với tính năng phát hiện trùng lịch họp',
  },
  {
    id: 'UC-11',
    name: 'Quản trị danh thiếp thông minh doanh nghiệp tập trung',
    actor: 'Quản trị viên Hạ tầng CNTT ViOne',
    preconditions: 'Truy cập route /business-cards trên CRM ViOne.',
    mainFlow: '1. Quản lý danh sách phôi thẻ thông minh và thẻ số đã cấp phát cho nhân sự.\n2. Đăng ký thẻ mới: Nhập Mã định danh chip NFC (UID), gán cho tài khoản nhân sự/đối tác tương ứng.\n3. Cấu hình tên miền danh thiếp cá nhân hóa (ví dụ: vione.vn/card/username).\n4. Thao tác Khóa thẻ từ xa khi nhân viên nghỉ việc hoặc làm mất thẻ vật lý.',
    altFlow: 'A1. Mã chip NFC đã tồn tại trên thẻ khác: Báo lỗi trùng mã định danh phần cứng.',
    postconditions: 'Thẻ thông minh được kích hoạt và liên kết chính xác với hồ sơ doanh nhân.',
    businessRules: 'Mỗi thẻ vật lý NFC tương ứng với duy nhất một hồ sơ danh thiếp số tại một thời điểm.',
    imageFile: 'crm_vione_12_business_cards_admin.png',
    imageCaption: 'Hình 5.11: Trung tâm quản lý phôi thẻ danh thiếp thông minh và định danh chip NFC',
  },
  {
    id: 'UC-12',
    name: 'Đăng nhập ứng dụng di động ViOne Connect & xác thực đa yếu tố',
    actor: 'Doanh nhân, Lãnh đạo doanh nghiệp sử dụng Smartphone',
    preconditions: 'Truy cập https://14.225.217.232:5445/vione/login trên thiết bị di động.',
    mainFlow: '1. Mở màn hình đăng nhập ViOne Connect Mobile (tông màu đen sẫm `#0A0A0B` và chữ đồng hoàng gia `#D8B282`).\n2. Nhập Email hoặc Số điện thoại đã đăng ký và Mật khẩu bảo mật.\n3. Bấm "Đăng nhập". Hệ thống xác thực và cấp phiên làm việc di động.\n4. Chuyển hướng người dùng vào trang chủ điều hành /connect-app.',
    altFlow: 'A1. Quên mật khẩu: Bấm liên kết "Quên mật khẩu?", nhập email để nhận mã OTP khôi phục.',
    postconditions: 'Người dùng đăng nhập thành công vào ứng dụng di động ViOne Connect.',
    businessRules: 'Giao diện hiển thị theo tỷ lệ chuẩn smartphone, hỗ trợ cảm ứng mượt mà và lưu phiên an toàn.',
    imageFile: 'app_vione_01_login.png',
    imageCaption: 'Hình 5.12: Màn hình đăng nhập ứng dụng di động ViOne Connect chuẩn Luxury Smartphone',
  },
  {
    id: 'UC-13',
    name: 'Điều hành cá nhân Executive Today & phím tác vụ nhanh "V"',
    actor: 'Doanh nhân thành viên ViOne Connect',
    preconditions: 'Đã đăng nhập vào /connect-app trên thiết bị di động.',
    mainFlow: '1. Xem lịch làm việc hôm nay (Executive Agenda): Các cuộc họp đối tác, sự kiện giao thương trong ngày.\n2. Bấm phím tròn chữ "V" mạ vàng nổi bật ở thanh điều hướng dưới cùng.\n3. Menu tác vụ nhanh mở ra với các tính năng: Quét mã QR danh thiếp đối tác, Chia sẻ danh thiếp của tôi, Ghi chép nhanh cơ hội hợp tác.\n4. Bấm ngoài menu để đóng lại mượt mà.',
    altFlow: 'A1. Trình duyệt chưa cấp quyền camera: Hệ thống nhắc nhở cấp quyền truy cập camera để quét mã QR.',
    postconditions: 'Doanh nhân nắm bắt toàn bộ công việc trong ngày và thực hiện kết nối đối tác nhanh chóng.',
    businessRules: 'Nút "V" là điểm nhấn thương hiệu nhận diện xuyên suốt toàn bộ trải nghiệm di động ViOne.',
    imageFile: 'app_vione_03_quick_action_v.png',
    imageCaption: 'Hình 5.13: Phím tác vụ nhanh "V" mở menu chức năng kết nối giao thương tức thì',
  },
  {
    id: 'UC-14',
    name: 'Tra cứu mạng lưới doanh nhân & mở rộng mối quan hệ B2B',
    actor: 'Doanh nhân thành viên',
    preconditions: 'Truy cập tab "Mạng lưới" (/connect-app/network) trên ứng dụng di động.',
    mainFlow: '1. Hệ thống hiển thị danh bạ các doanh nhân trong hệ sinh thái ViOne.\n2. Tìm kiếm theo Tên, Chức danh, Tên doanh nghiệp hoặc Ngành nghề.\n3. Chạm vào hồ sơ doanh nhân để xem danh thiếp số Titanium đầy đủ.\n4. Bấm "Kết nối" hoặc "Lưu danh thiếp vào danh bạ điện thoại (.vcf)".',
    altFlow: 'A1. Đối tác thiết lập chế độ riêng tư: Ẩn số điện thoại cá nhân và chỉ cho phép liên hệ qua tin nhắn hệ thống.',
    postconditions: 'Mối quan hệ giao thương mới được thiết lập giữa hai doanh nhân.',
    businessRules: 'Dữ liệu danh bạ được tải trực tiếp từ CSDL PostgreSQL, hiển thị avatar chuẩn và chức danh thực tế.',
    imageFile: 'app_vione_04_network_directory.png',
    imageCaption: 'Hình 5.14: Danh bạ mạng lưới đối tác doanh nhân và bộ lọc kết nối thông minh',
  },
  {
    id: 'UC-15',
    name: 'Đăng bài Moments & nhắn tin trao đổi công việc bảo mật 1-1',
    actor: 'Doanh nhân thành viên',
    preconditions: 'Truy cập /connect-app/moment hoặc /connect-app/inbox.',
    mainFlow: '1. Đăng bài Moments: Viết nội dung chia sẻ thành tựu kinh doanh, đính kèm hình ảnh ký kết hợp đồng, chọn chế độ hiển thị toàn mạng lưới.\n2. Nhắn tin 1-1: Mở cuộc trò chuyện từ danh bạ, nhập tin nhắn văn bản hoặc gửi danh thiếp số.\n3. Backend lưu tin nhắn vào bảng public.direct_messages và đẩy thông báo đẩy thời gian thực.',
    altFlow: 'A1. Mất kết nối mạng: Tin nhắn được xếp vào hàng đợi cục bộ (Local Queue) và tự động gửi lại khi có mạng.',
    postconditions: 'Khoảnh khắc kinh doanh được chia sẻ; cuộc trao đổi bảo mật được ghi nhận.',
    businessRules: 'Nghiêm cấm nội dung spam hoặc vi phạm chuẩn mực đạo đức kinh doanh.',
    imageFile: 'app_vione_05_moments_feed.png',
    imageCaption: 'Hình 5.15: Dòng thời gian Moments ghi nhận các khoảnh khắc giao lưu và hợp tác kinh doanh',
  },
  {
    id: 'UC-16',
    name: 'Quản lý thẻ số Titanium, kích hoạt thẻ NFC & cập nhật hồ sơ',
    actor: 'Chủ sở hữu danh thiếp số ViOne',
    preconditions: 'Truy cập /connect-app/me và /connect-app/me/edit trên thiết bị di động.',
    mainFlow: '1. Xem danh thiếp số Titanium cá nhân với huy hiệu mạ vàng sang trọng.\n2. Bấm "Chỉnh sửa hồ sơ" (/connect-app/me/edit): Cập nhật Họ tên, Chức danh, Công ty, Tiểu sử, Số điện thoại, Email, Website, Mạng xã hội.\n3. Bấm "Lưu thay đổi". Client gọi PUT /api/connect-app/me/identity.\n4. Backend thực thi cập nhật đồng bộ vào 3 bảng: public.business_identities, public.user_profiles, và public.members.\n5. Bấm "Kích hoạt thẻ NFC" (/connect-app/activate): Chạm thẻ thông minh vào mặt lưng điện thoại để ghi liên kết danh thiếp số.',
    altFlow: 'A1. Thiết bị không hỗ trợ đọc NFC: Hệ thống hiển thị mã QR động để đối tác quét thay thế cho chạm NFC.',
    postconditions: 'Thông tin hồ sơ danh thiếp số được cập nhật 100% vào CSDL PostgreSQL, thẻ vật lý NFC sẵn sàng chia sẻ.',
    businessRules: 'Mọi thay đổi hồ sơ có hiệu lực ngay lập tức trên cả Web CRM và App di động. Không có độ trễ cache.',
    imageFile: 'app_vione_08_digital_card_me.png',
    imageCaption: 'Hình 5.16: Danh thiếp số Titanium đẳng cấp kết hợp kích hoạt thẻ thông minh NFC',
  },
];

async function generateVioneMasterSrs() {
  console.log('=== BẮT ĐẦU XUẤT BẢN TÀI LIỆU SRS MASTER VIONE (MD & DOCX) ===\n');

  // =========================================================================
  // 1. SINH FILE MARKDOWN (.md)
  // =========================================================================
  let mdContent = `# Software Requirements Specification (SRS)
# NỀN TẢNG SIÊU ỨNG DỤNG DOANH NGHIỆP VIONE & MẠNG LƯỚI GIAO THƯƠNG
### (ViOne Enterprise CRM & ViOne Connect App)

---

## 1. TRANG BÌA (Cover Page)
* **Tên tài liệu:** Software Requirements Specification (Đặc tả Yêu cầu Phần mềm)
* **Tên dự án:** Nền Tảng Siêu Ứng Dụng Doanh Nghiệp ViOne & Mạng Lưới Giao Thương (ViOne Enterprise CRM & ViOne Connect Mobile App)
* **Mã tài liệu:** \`SRS-VIONE-MASTER-v3.0\`
* **Phiên bản:** \`3.0 (Bản Master Đặc Tả Toàn Diện Không Bỏ Sót Chức Năng)\`
* **Ngày phát hành:** \`01/10/2026\`
* **Đơn vị phát triển:** \`Tập đoàn Công nghệ ViOne - ViConnect Product Team\`
* **Môi trường vận hành:**
  * **Web CRM Quản trị:** \`https://14.225.217.232:5445/auth\` (Port 5445)
  * **Ứng dụng Di động:** \`https://14.225.217.232:5445/connect-app\`
  * **Cơ sở dữ liệu:** \`PostgreSQL 15+ Dual Persistence (Schema public)\`

---

## 2. MỤC LỤC TỰ ĐỘNG (Table of Contents)
1. **Trang Bìa**
2. **Mục Lục**
3. **Giới Thiệu Tổng Quan**
   * 3.1. Mục đích tài liệu
   * 3.2. Phạm vi sản phẩm
   * 3.3. Thuật ngữ & Từ viết tắt
4. **Mô Tả Tổng Quan Hệ Thống**
   * 4.1. Kiến trúc tổng thể Multi-Company
   * 4.2. Danh mục 16 Phân hệ chức năng chính
   * 4.3. Ma trận 5 Cấp bậc phân quyền RBAC
   * 4.4. Giả định và phụ thuộc
5. **Yêu Cầu Chức Năng Chi Tiết (16 Bảng Use Cases Toàn Diện)**
${VIONE_USE_CASES.map(uc => `   * 5.${uc.id.replace('UC-', '')}. ${uc.id}: ${uc.name}`).join('\n')}
6. **Yêu Cầu Phi Chức Năng (Non-Functional Requirements)**
   * 6.1. Hiệu năng & Thời gian phản hồi
   * 6.2. An toàn & Bảo mật thông tin
   * 6.3. Độ tin cậy & Tính khả dụng (Availability 99.9%)
   * 6.4. Khả năng bảo trì & Mở rộng
7. **Yêu Cầu Dữ Liệu & Giao Diện**
   * 7.1. Nguyên tắc thiết kế UI/UX Luxury ViOne
   * 7.2. Giao diện phần cứng & phần mềm (NFC, Camera, SMTP)
   * 7.3. Cấu trúc thực thể cơ sở dữ liệu (Entities Schema)

---

## 3. GIỚI THIỆU TỔNG QUAN

### 3.1. Mục đích tài liệu
Tài liệu Đặc tả Yêu cầu Phần mềm (SRS) này xác định đầy đủ, chi tiết và chính xác toàn bộ các yêu cầu chức năng, phi chức năng, kiến trúc kỹ thuật và giao diện người dùng cho **Nền tảng Siêu Ứng Dụng Doanh Nghiệp ViOne Enterprise CRM** và **Ứng dụng di động ViOne Connect**. Tài liệu là căn cứ pháp lý và kỹ thuật cao nhất để thẩm định nghiệm thu, kiểm thử QA/QC, và phát triển mở rộng hệ thống.

### 3.2. Phạm vi sản phẩm
Hệ thống bao gồm hai cấu phần tương hỗ chặt chẽ:
1. **Hệ thống Web CRM ViOne Enterprise:** Nền tảng web quản trị điều hành đa công ty dành cho ban giám đốc và các phòng ban (Kinh doanh, Kế toán, Đối ngoại, Pháp chế).
2. **Ứng dụng Di động ViOne Connect:** Ứng dụng số hóa danh thiếp Titanium thông minh, mạng xã hội giao thương B2B, chia sẻ cơ hội Cung - Cầu và nhắn tin bảo mật dành cho từng doanh nhân.

---

## 4. MÔ TẢ TỔNG QUAN HỆ THỐNG

### 4.1. Kiến trúc tổng thể
Hệ thống áp dụng kiến trúc **Monorepo hiện đại** với backend NestJS 11.x, cơ sở dữ liệu PostgreSQL 15+, frontend React 19 + TanStack Router, và ứng dụng di động tối ưu hóa cho màn hình cảm ứng dọc.

### 4.2. Danh mục các phân hệ chức năng
Hệ thống bao gồm đầy đủ 16 phân hệ nghiệp vụ, tương ứng với 16 Use Case hoàn chỉnh được đặc tả chi tiết dưới đây.

---

## 5. YÊU CẦU CHỨC NĂNG CHI TIẾT (16 USE CASES HOÀN CHỈNH)

`;

  VIONE_USE_CASES.forEach((uc, index) => {
    mdContent += `### 5.${index + 1}. [${uc.id}] ${uc.name}\n\n`;
    mdContent += `| Mục | Nội Dung Đặc Tả |\n| :--- | :--- |\n`;
    mdContent += `| **Mã Use Case** | \`${uc.id}\` |\n`;
    mdContent += `| **Tên Use Case** | **${uc.name}** |\n`;
    mdContent += `| **Tác nhân (Actor)** | ${uc.actor} |\n`;
    mdContent += `| **Tiền điều kiện** | ${uc.preconditions} |\n`;
    mdContent += `| **Luồng chính (Main Flow)** | ${uc.mainFlow.replace(/\n/g, '<br>')} |\n`;
    mdContent += `| **Luồng ngoại lệ** | ${uc.altFlow.replace(/\n/g, '<br>')} |\n`;
    mdContent += `| **Hậu điều kiện** | ${uc.postconditions} |\n`;
    mdContent += `| **Quy tắc nghiệp vụ** | ${uc.businessRules} |\n\n`;
    
    const isMobile = MOBILE_IMG_SET.has(uc.imageFile);
    if (isMobile) {
      mdContent += `<div align="center">\n  <img src="images/evidence/${uc.imageFile}" width="280" alt="${uc.imageCaption}" />\n  <p><em>${uc.imageCaption}</em></p>\n</div>\n\n`;
    } else {
      mdContent += `![${uc.imageCaption}](images/evidence/${uc.imageFile})\n*${uc.imageCaption}*\n\n`;
    }
  });

  mdContent += `---

## 6. YÊU CẦU PHI CHỨC NĂNG (Non-Functional Requirements)

* **Hiệu năng:** Thời gian phản hồi API trung bình < 150ms đối với các tác vụ đọc/ghi CSDL.
* **Bảo mật:** Toàn bộ kết nối mã hóa TLS 1.3 / HTTPS. Mật khẩu mã hóa Bcrypt cost factor 10. Phiên làm việc duy trì qua JWT token bảo mật.
* **Độ khả dụng:** Cam kết vận hành ổn định 99.9% thời gian trong năm (Uptime SLA 99.9%).
* **Tính toàn vẹn dữ liệu:** Cơ chế lưu trữ trực tiếp vào CSDL PostgreSQL (Dual-Sync Persistence), nghiêm cấm dữ liệu tĩnh (mock/hardcode).

---

## 7. YÊU CẦU DỮ LIỆU & GIAO DIỆN

* **Bộ nhận diện thương hiệu ViOne Luxury:** Nền đen sẫm hoàng gia \`#0A0A0B\` kết hợp điểm nhấn vàng Champagne Gold (\`#D8B282\` / \`#D4AF37\`).
* **Khung hình di động:** Mọi giao diện ứng dụng di động hiển thị theo tỷ lệ chuẩn smartphone, không kéo dãn tràn ngang.
* **Tương thích thiết bị:** Hỗ trợ quét chip NFC NTAG215 và tương thích 100% các dòng điện thoại iOS / Android hiện đại.
`;

  const mdPath = path.join(DOC_DIR, 'SRS_CHI_TIET_VIONE_HE_THONG_TOAN_DIEN.md');
  const feMdPath = path.join(FE_DOCS_DIR, 'SRS_CHI_TIET_VIONE_HE_THONG_TOAN_DIEN.md');
  fs.writeFileSync(mdPath, mdContent, 'utf8');
  fs.writeFileSync(feMdPath, mdContent, 'utf8');
  console.log(`✓ Đã lưu Markdown SRS: ${mdPath}`);

  // =========================================================================
  // 2. SINH FILE WORD (.docx) CHUẨN IN ẤN
  // =========================================================================
  const docxSections = [];

  // Cover Page Docx
  const coverElements = [
    new Paragraph({ spacing: { before: 200, after: 100 }, children: [new TextRun({ text: 'HỆ SINH THÁI DOANH NGHIỆP SỐ VIONE', font: FONT_FAMILY, size: 24, bold: true, color: 'D8B282' })] }),
    new Paragraph({ spacing: { before: 0, after: 600 }, children: [new TextRun({ text: 'VICONNECT GROUP · SOFTWARE REQUIREMENTS SPECIFICATION', font: FONT_FAMILY, size: 18, color: '64748B' })] }),
    new Paragraph({ spacing: { before: 600, after: 200 }, children: [new TextRun({ text: 'ĐẶC TẢ YÊU CẦU PHẦN MỀM (SRS)', font: FONT_FAMILY, size: 48, bold: true, color: COLOR_BLACK })] }),
    new Paragraph({ spacing: { before: 100, after: 400 }, children: [new TextRun({ text: 'NỀN TẢNG SIÊU ỨNG DỤNG DOANH NGHIỆP VIONE ENTERPRISE & VIONE CONNECT', font: FONT_FAMILY, size: 28, bold: true, color: 'B45309' })] }),
    new Paragraph({ spacing: { before: 200, after: 600 }, children: [new TextRun({ text: 'Tài liệu kỹ thuật đặc tả chi tiết 16 phân hệ nghiệp vụ cốt lõi, kiến trúc cơ sở dữ liệu PostgreSQL, ma trận phân quyền 5 vai trò và luồng giao dịch B2B khép kín.', font: FONT_FAMILY, size: 22, italic: true, color: '475569' })] }),
    new Paragraph({ spacing: { before: 400, after: 80 }, children: [new TextRun({ text: 'Mã tài liệu: SRS-VIONE-MASTER-v3.0', font: FONT_FAMILY, size: 20, bold: true, color: COLOR_DARK })] }),
    new Paragraph({ spacing: { before: 40, after: 80 }, children: [new TextRun({ text: 'Phiên bản: 3.0 (Bản Master Toàn Diện)', font: FONT_FAMILY, size: 20, bold: true, color: COLOR_DARK })] }),
    new Paragraph({ spacing: { before: 40, after: 80 }, children: [new TextRun({ text: 'Ngày phát hành: 01/10/2026', font: FONT_FAMILY, size: 20, bold: true, color: COLOR_DARK })] }),
    new Paragraph({ spacing: { before: 40, after: 400 }, children: [new TextRun({ text: 'Đơn vị: Tập đoàn Công nghệ ViOne - ViConnect Product Team', font: FONT_FAMILY, size: 20, bold: true, color: COLOR_DARK })] }),
  ];

  // Body Elements
  const bodyElements = [
    createDocxHeading1('1. GIỚI THIỆU TỔNG QUAN'),
    createDocxHeading2('1.1. Mục đích tài liệu'),
    createDocxParagraph('Tài liệu Đặc tả Yêu cầu Phần mềm (SRS) này xác định đầy đủ, chi tiết và chính xác toàn bộ các yêu cầu chức năng, phi chức năng, kiến trúc kỹ thuật và giao diện người dùng cho Nền tảng Siêu Ứng Dụng Doanh Nghiệp ViOne Enterprise CRM và Ứng dụng di động ViOne Connect.'),
    createDocxHeading2('1.2. Phạm vi sản phẩm'),
    createDocxParagraph('Hệ thống bao gồm hai cấu phần tương hỗ: Web CRM ViOne Enterprise (quản trị đa công ty) và Ứng dụng di động ViOne Connect (danh thiếp số Titanium, mạng xã hội doanh nhân B2B, chia sẻ cơ hội Cung - Cầu và nhắn tin bảo mật).'),
    
    createDocxHeading1('2. MÔ TẢ TỔNG QUAN HỆ THỐNG'),
    createDocxHeading2('2.1. Kiến trúc hệ thống'),
    createDocxParagraph('Hệ thống vận hành trên nền tảng NestJS 11.x, PostgreSQL 15+, React 19 + TanStack Router. Toàn bộ dữ liệu được lưu trữ trực tiếp vào CSDL PostgreSQL, tuyệt đối không dùng dữ liệu giả lập (mock/hardcode).'),
    createDocxHeading2('2.2. Danh mục 16 Phân hệ chức năng chính'),
    createDocxParagraph('Hệ thống bao gồm 16 Use Case hoàn chỉnh được chi tiết hóa trong bảng dưới đây:'),
  ];

  // Add 16 Use Case Tables & Images to Word Docx
  bodyElements.push(createDocxHeading1('3. YÊU CẦU CHỨC NĂNG CHI TIẾT (16 USE CASES)'));

  VIONE_USE_CASES.forEach((uc, idx) => {
    bodyElements.push(createDocxHeading2(`3.${idx + 1}. [${uc.id}] ${uc.name}`));
    bodyElements.push(createDocxUseCaseTable(uc));
    bodyElements.push(new Paragraph({ spacing: { before: 100, after: 100 } }));
    const imgBlocks = createDocxImageBlock(uc.imageFile, uc.imageCaption);
    imgBlocks.forEach(b => bodyElements.push(b));
    bodyElements.push(new Paragraph({ spacing: { before: 100, after: 160 } }));
  });

  // Non-functional & Interface
  bodyElements.push(createDocxHeading1('4. YÊU CẦU PHI CHỨC NĂNG (NON-FUNCTIONAL REQUIREMENTS)'));
  bodyElements.push(createDocxParagraph('• Hiệu năng: Thời gian phản hồi API trung bình < 150ms.\n• Bảo mật: Toàn bộ kết nối mã hóa TLS 1.3 / HTTPS. Mật khẩu mã hóa Bcrypt cost factor 10. Phiên làm việc duy trì qua JWT token bảo mật.\n• Độ khả dụng: Cam kết vận hành ổn định 99.9% thời gian trong năm (Uptime SLA 99.9%).\n• Khả năng bảo trì: Cấu trúc Monorepo mô-đun hóa, tuân thủ nguyên lý SOLID và Clean Architecture.'));

  bodyElements.push(createDocxHeading1('5. YÊU CẦU GIAO DIỆN & CƠ SỞ DỮ LIỆU'));
  bodyElements.push(createDocxParagraph('• Màu sắc nhận diện: Deep Onyx Black (#0A0A0B) kết hợp Warm Champagne Gold (#D8B282 / #D4AF37).\n• Ảnh di động: Hiển thị chuẩn theo tỷ lệ khung hình smartphone portrait (220x440pt), không kéo dãn tràn ngang.\n• Cơ sở dữ liệu: Hệ thống lưu trữ tại CSDL PostgreSQL, schema public, đồng bộ hai chiều thời gian thực giữa Web CRM và App di động.'));

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 }, // 1 inch = 1440 dxa
          },
        },
        children: coverElements,
      },
      {
        properties: {
          page: {
            margin: { top: 1200, bottom: 1200, left: 1200, right: 1200 },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: 'SRS-VIONE-MASTER-v3.0 · ViOne Enterprise CRM & ViOne Connect App',
                    font: FONT_FAMILY,
                    size: 8.5 * 2,
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
                  new TextRun({
                    text: 'Trang ',
                    font: FONT_FAMILY,
                    size: 9 * 2,
                    color: '64748B',
                  }),
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    font: FONT_FAMILY,
                    size: 9 * 2,
                    bold: true,
                    color: 'B45309',
                  }),
                ],
              }),
            ],
          }),
        },
        children: bodyElements,
      },
    ],
  });

  const docxBuffer = await Packer.toBuffer(doc);
  const docxPath = path.join(DOC_DIR, 'SRS_VIONE_HE_THONG_TOAN_DIEN.docx');
  const feDocxPath = path.join(FE_DOCS_DIR, 'SRS_VIONE_HE_THONG_TOAN_DIEN.docx');
  fs.writeFileSync(docxPath, docxBuffer);
  fs.writeFileSync(feDocxPath, docxBuffer);

  const stat = fs.statSync(docxPath);
  console.log(`\n🎉 XUẤT BẢN THÀNH CÔNG TÀI LIỆU SRS VIONE MASTER WORD DOCX!`);
  console.log(`  - File: ${docxPath}`);
  console.log(`  - Kích thước: ${(stat.size / (1024 * 1024)).toFixed(2)} MB`);
  console.log(`  - Đã đồng bộ sang: ${feDocxPath}`);
}

generateVioneMasterSrs().catch(console.error);
