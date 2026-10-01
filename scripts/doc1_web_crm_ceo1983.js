const {
  Document,
  Paragraph,
  TextRun,
  AlignmentType,
  createPara,
  createHeading1,
  createHeading2,
  createHeading3,
  createCallout,
  createTable,
  createHeaderFooter,
  createCoverPage,
  createTableOfContents,
  formatMdTable,
} = require('./srs_docx_helpers');

function buildDoc1() {
  const hf = createHeaderFooter('Web CRM CEO 1983');
  const children = [];
  let md = '';

  function addMd(text) {
    md += text + '\n\n';
  }

  function addMdTableDirect(headers, rows) {
    md += formatMdTable(headers, rows) + '\n';
  }

  // ==========================================
  // 1. TRANG BÌA CHUYÊN NGHIỆP (COVER PAGE)
  // ==========================================
  const coverElements = createCoverPage({
    systemName: 'CỔNG QUẢN TRỊ TRUNG TÂM CLB DOANH NHÂN CEO 1983 (WEB CRM & PORTAL)',
    subTitle: 'Đặc tả chi tiết tuần tự các phân hệ nghiệp vụ quản trị, ma trận phân quyền 5 cấp bậc & cây phân cấp thao tác, quy trình phê duyệt cuộc họp tích hợp phòng họp và CSDL PostgreSQL ACID',
    docCode: 'SRS-CEO1983-CRM-V4.5',
    version: 'Version 4.5 — Master Production Specification (Bàn Giao Kỹ Thuật)',
    date: '30/09/2026',
    scope: 'Ban Quản Trị, Ban Thư Ký, Ban Chuyên Môn & Đội Ngũ Kỹ Thuật ViConnect'
  });
  children.push(...coverElements);

  addMd('# TÀI LIỆU ĐẶC TẢ YÊU CẦU PHẦN MỀM (SRS) & THIẾT KẾ CƠ SỞ DỮ LIỆU');
  addMd('## CỔNG QUẢN TRỊ TRUNG TÂM CLB DOANH NHÂN CEO 1983 (WEB CRM & PORTAL)');
  addMd('*Phiên bản: Version 4.5 - Master Specification Chuẩn Hóa Bàn Giao Kỹ Thuật Toàn Diện*');

  // ==========================================
  // 2. MỤC LỤC TÀI LIỆU (TABLE OF CONTENTS)
  // ==========================================
  const tocSections = [
    { num: 'PHẦN 1', title: 'Giải Thích Bình Dân Các Khái Niệm Kỹ Thuật Cốt Lõi & Mô Hình Tòa Nhà Chỉ Huy', scope: 'Nền tảng kiến trúc', status: 'Hoàn tất 100%' },
    { num: 'PHẦN 2', title: 'Ma Trận Phân Quyền 5 Cấp Bậc & Cây Phân Cấp Thao Tác Chi Tiết (Dynamic RBAC Tree)', scope: 'Bảo mật & Cấp phép', status: 'Hoàn tất 100%' },
    { num: 'PHẦN 3', title: 'Quy Trình Đăng Nhập, Xác Thực JWT Admin & Bảo Mật Phiên Làm Việc Xanh-Trắng', scope: 'Xác thực & Bảo mật', status: 'Hoàn tất 100%' },
    { num: 'PHẦN 4', title: 'Hồ Sơ Hội Viên 360°, Quy Trình Thẩm Định Kết Nạp & Quản Trị Vòng Đời Hội Phí Thường Niên', scope: 'Quản trị Hội viên', status: 'Hoàn tất 100%' },
    { num: 'PHẦN 5', title: 'Quản Trị Sự Kiện, Phát Hành Vé Mời QR & Phân Công Soát Vé Check-in Thời Gian Thực', scope: 'Sự kiện & Vé mời', status: 'Hoàn tất 100%' },
    { num: 'PHẦN 6', title: 'Điều Hành Cuộc Họp, Tích Hợp Phòng Họp (Zoom/Meet/UniWork) & Luồng Quản Trị Duyệt', scope: 'Cuộc họp & Phòng họp', status: 'Hoàn tất 100%' },
    { num: 'PHẦN 7', title: 'Sàn Giao Thương B2B Marketplace Shopee Style, Đánh Giá Sản Phẩm & Điểm Sao Công Ty', scope: 'Sàn B2B Shopee', status: 'Hoàn tất 100%' },
    { num: 'PHẦN 8', title: 'Sổ Quỹ Tài Chính Hiệp Hội, Quản Lý Hóa Đơn & Cổng Thanh Toán VietQR Tự Động', scope: 'Tài chính & Kế toán', status: 'Hoàn tất 100%' },
    { num: 'PHẦN 9', title: 'Bầu Cử Đại Hội Hiệp Hội, Biểu Quyết Trực Tuyến & Mini-game Lucky Draw', scope: 'Đại hội & Dân chủ', status: 'Hoàn tất 100%' },
    { num: 'PHẦN 10', title: 'Danh Thiếp Thông Minh NFC (Smart Business Card) & Nhật Ký Truy Vết Audit Trail', scope: 'Định danh số & Audit', status: 'Hoàn tất 100%' },
    { num: 'PHẦN 11', title: 'Thiết Kế Cơ Sở Dữ Liệu PostgreSQL Chuẩn ACID, Từ Điển Dữ Liệu & Danh Mục API Endpoints', scope: 'Database & API Schema', status: 'Hoàn tất 100%' },
  ];
  children.push(...createTableOfContents(tocSections));

  addMd('## MỤC LỤC TÀI LIỆU (TABLE OF CONTENTS)');
  addMdTableDirect(
    ['Mục', 'Phần / Phân Hệ Chức Năng', 'Phạm Vi Nghiệp Vụ', 'Trạng Thái'],
    tocSections.map(s => [s.num, s.title, s.scope, s.status])
  );

  // ==========================================
  // PHẦN 1: GIẢI THÍCH BÌNH DÂN CHO NGƯỜI KHÔNG HỌC IT
  // ==========================================
  children.push(createHeading1('PHẦN 1: GIẢI THÍCH BÌNH DÂN CÁC KHÁI NIỆM KỸ THUẬT CỐT LÕI'));
  children.push(
    createPara('Để bất kỳ lãnh đạo doanh nghiệp, chủ tịch, hay chuyên viên hành chính nào dù chưa từng học về công nghệ thông tin cũng có thể đọc hiểu, vận hành và giám sát 100% hoạt động của hệ thống phần mềm, hãy hình dung Web CRM CEO 1983 giống như Tòa Nhà Văn Phòng Bộ Chỉ Huy của Hiệp Hội:'),
    createCallout(
      'HÌNH TƯỢNG VÍ VON ĐỜI THƯỜNG DỄ HIỂU NHẤT:',
      '1. Cơ sở dữ liệu (Database): Giống như Phòng Lưu Trữ Hồ Sơ Trung Tâm tuyệt mật của hiệp hội.\n' +
      '2. Bảng (Table): Là các Ngăn Tủ Hồ Sơ chuyên biệt. Ngăn đựng lý lịch hội viên (members), ngăn cuống vé sự kiện (event_registrations), ngăn lịch họp và thông báo (meetings), ngăn sổ thu chi hội phí (invoices), ngăn tin nhắn kết nối (chat_messages).\n' +
      '3. Khóa chính (Primary Key - PK / id): Giống như Số Căn Cước Công Dân duy nhất của từng hồ sơ. Không bao giờ có 2 người trùng số nhau.\n' +
      '4. Khóa ngoại (Foreign Key - FK): Giống như dòng ghi chú "Hồ sơ này gắn liền với ai". Ví dụ: Trên cuống vé có ghi member_id để biết chiếc vé này thuộc về đại biểu nào.\n' +
      '5. Phân quyền (RBAC - Role-Based Access Control): Giống như Thẻ Ra Vào Tòa Nhà có gắn chip. Thẻ của Chủ tịch/Admin mở được mọi cánh cửa; thẻ của Ban Tài chính chỉ mở phòng Kế toán; thẻ của Ban Truyền thông mở được phòng Báo chí & Máy quét thẻ cổng tiệc; thẻ của Hội viên thường chỉ vào được sảnh chung xem thông tin và phòng làm việc riêng của mình.\n' +
      '6. Phép JOIN (Ghép Bảng): Giống như thư ký lấy hồ sơ vé sự kiện ra, nhìn thấy mã hội viên, liền bước sang ngăn tủ lý lịch lấy tờ sơ yếu lý lịch kẹp ghim lại với nhau để lãnh đạo nhìn thấy đầy đủ: Tên đại biểu, Tên công ty, Chức vụ và Vị trí bàn tiệc VIP.\n' +
      '7. API (Application Programming Interface): Giống như nhân viên giao nhận hỏa tốc chuyên chuyển hồ sơ giữa cổng Web CRM và App di động.',
      'info'
    )
  );

  addMd('## PHẦN 1: GIẢI THÍCH BÌNH DÂN CÁC KHÁI NIỆM KỸ THUẬT CỐT LÕI');
  addMd('> **HÌNH TƯỢNG VÍ VON ĐỜI THƯỜNG DỄ HIỂU:**\n' +
    '> 1. **Cơ sở dữ liệu (Database):** Giống như Phòng Lưu Trữ Hồ Sơ Trung Tâm tuyệt mật của hiệp hội.\n' +
    '> 2. **Bảng (Table):** Là các Ngăn Tủ Hồ Sơ chuyên biệt (members, events, event_registrations, invoices, chat_messages).\n' +
    '> 3. **Khóa chính (Primary Key - PK):** Giống như Số CCCD duy nhất của từng hồ sơ, không bao giờ trùng lặp.\n' +
    '> 4. **Khóa ngoại (Foreign Key - FK):** Dòng ghi chú liên kết (cuống vé này của ai, cuộc họp này do ai chủ trì).\n' +
    '> 5. **Phân quyền (RBAC):** Thẻ từ thông minh mở cửa từng phòng ban chuyên môn theo đúng chức danh.\n' +
    '> 6. **Phép JOIN:** Thư ký kẹp ghim cuống vé với sơ yếu lý lịch để xuất báo cáo đầy đủ thông tin đại biểu.\n' +
    '> 7. **API:** Nhân viên chuyển phát nhanh chuyển dữ liệu đồng bộ tức thì giữa Web CRM và App di động.');

  // ==========================================
  // PHẦN 2: QUY CHẾ PHÂN QUYỀN VAI TRÒ (RBAC 5 VAI TRÒ CỐT LÕI)
  // ==========================================
  children.push(createHeading1('PHẦN 2: QUY CHẾ PHÂN QUYỀN HỆ THỐNG (RBAC - 5 VAI TRÒ CỐT LÕI)'));
  children.push(
    createPara('Hệ thống Web CRM CEO 1983 áp dụng nguyên tắc quản trị ma trận phân quyền chặt chẽ, tinh gọn theo đúng điều lệ CLB Doanh Nhân CEO 1983, chuẩn hóa duy nhất 5 vai trò cốt lõi:'),
    createCallout(
      'QUY TẮC CỐT LÕI VỀ 5 VAI TRÒ VÀ LUỒNG PHÊ DUYỆT:',
      '• Vai trò 1 (Quản Trị - Super Admin): Quyền hạn tối cao trên toàn bộ hệ thống. Thẩm quyền duy nhất phê duyệt cuộc họp, cấu hình ma trận phân quyền, quản lý tài khoản và phê duyệt hồ sơ hội viên mới.\n' +
      '• Vai trò 2 (Admin - Ban Quản Trị / Ban Thư Ký): Điều hành toàn diện các nghiệp vụ hiệp hội; Đồng thẩm quyền phê duyệt cuộc họp, khởi tạo sự kiện & gala, xuất bản tin tức, đối soát tài chính và gạch nợ VietQR.\n' +
      '• Vai trò 3 (Tổng Thư Ký): Thường trực Ban điều hành; Được phép tạo cuộc họp ban / hiệp hội (ở trạng thái Chờ Quản trị duyệt); Quản lý danh bạ hội viên; Giám sát tiến độ công tác các ban chuyên môn.\n' +
      '• Vai trò 4 (Trưởng Ban): Lãnh đạo các ban chuyên môn (Ban Thành Viên, Ban Tài Chính, Ban Truyền Thông, Ban Xúc Tiến Thương Mại); Được phép tạo cuộc họp chuyên trách của ban (ở trạng thái Chờ Quản trị duyệt); Quản lý nhân sự và dữ liệu chuyên môn thuộc ban.\n' +
      '• Vai trò 5 (Thành Viên): Hội viên chính thức CLB CEO 1983; Xem thông tin chung (Lịch họp, Danh bạ 360°, Sự kiện, Tin tức, Sàn B2B); Xác nhận tham dự họp (RSVP); Đăng ký sự kiện; Kết nối giao thương; Quản lý danh thiếp số của mình. TUYỆT ĐỐI KHÔNG CÓ QUYỀN TẠO CUỘC HỌP.',
      'tip'
    )
  );

  const roleHeaders = ['Vai Trò (Role Code)', 'Tên Vai Trò Chuẩn Hóa', 'Phạm Vi Quyền Hạn', 'Trách Nhiệm Nghiệp Vụ'];
  const roleRows = [
    ['QUẢN_TRỊ', 'Quản Trị Viên Tối Cao (Super Admin)', 'Full Quyền Tối Cao Hệ Thống', 'Toàn quyền phê duyệt cuộc họp, cấu hình ma trận phân quyền, cấp quyền tài khoản, duyệt hội viên mới và giám sát log kiểm toán.'],
    ['ADMIN', 'Admin Hệ Thống (Ban Thư Ký Điều Hành)', 'Toàn Quyền Nghiệp Vụ Hiệp Hội', 'Phê duyệt cuộc họp, khởi tạo sự kiện & Gala, xuất bản tin tức, quản lý hợp đồng tài trợ, đối soát tài chính và gạch nợ hóa đơn.'],
    ['TỔNG_THƯ_KÝ', 'Tổng Thư Ký CLB CEO 1983', 'Thường Trực Điều Hành & Tạo Cuộc Họp', 'Khởi tạo cuộc họp toàn thể / liên ban (chờ Quản trị duyệt), quản lý hồ sơ hội viên, điều phối công tác phối hợp giữa các ban.'],
    ['TRƯỞNG_BAN', 'Trưởng Các Ban Chuyên Môn', 'Quản Trị Chuyên Sâu Ban & Tạo Cuộc Họp Ban', 'Khởi tạo cuộc họp ban chuyên trách (chờ Quản trị duyệt), quản lý nhân sự thuộc ban, thẩm định hồ sơ hội viên / tin tức / tài chính theo ban.'],
    ['THÀNH_VIÊN', 'Hội Viên Doanh Nhân Chính Thức', 'Xem Danh Mục Chung + Thao Tác Dữ Liệu Cá Nhân', 'Xem lịch họp & bấm xác nhận tham dự (RSVP); Xem danh bạ hội viên 360°; Đăng ký sự kiện; Trao đổi cơ hội B2B; Quản lý danh thiếp số cá nhân.']
  ];
  children.push(createTable(roleHeaders, roleRows, [18, 25, 25, 32]));

  addMd('## PHẦN 2: QUY CHẾ PHÂN QUYỀN HỆ THỐNG (RBAC - 5 VAI TRÒ CỐT LÕI)');
  addMdTableDirect(roleHeaders, roleRows);

  // ==========================================
  // PHẦN 3: MA TRẬN PHÂN QUYỀN CHỨC NĂNG CHI TIẾT (CHUẨN SIDEBAR)
  // ==========================================
  children.push(createHeading1('PHẦN 3: MA TRẬN PHÂN QUYỀN 5 CẤP BẬC & THAO TÁC CHI TIẾT (LẤY ĐÚNG TÊN CHỨC NĂNG SIDEBAR)'));
  children.push(
    createPara('Đặc tả ma trận phân quyền chuẩn xác theo đúng 8 nhóm chức năng tại Sidebar của Cổng Quản Trị Web CRM, phân định rành mạch thẩm quyền trên 5 vai trò cốt lõi (Quản trị, Admin, Tổng thư ký, Trưởng ban, Thành viên):')
  );

  const matrixHeaders = ['Nhóm Sidebar', 'Chức Năng Sidebar', 'Thao Tác Cụ Thể', 'Quản Trị', 'Admin', 'Tổng Thư Ký', 'Trưởng Ban', 'Thành Viên'];
  const matrixRows = [
    // 1. Tổng Quan
    ['1. Tổng Quan', 'Dashboard Điều Hành', 'Xem chỉ số KPI tổng quan, biểu đồ tăng trưởng, doanh thu', 'Có', 'Có', 'Có', 'Có', 'Không'],
    ['1. Tổng Quan', 'Báo Cáo Hoạt Động', 'Xuất báo cáo tổng hợp tiến độ hiệp hội', 'Có', 'Có', 'Có', 'Ban mình', 'Không'],

    // 2. Quản Trị Hội Viên
    ['2. Hội Viên', 'Danh Sách Hội Viên', 'Tra cứu danh bạ 360°, lọc ngành nghề, xuất Excel', 'Có', 'Có', 'Có', 'Có', 'Chỉ xem chung'],
    ['2. Hội Viên', 'Hồ Sơ Chờ Duyệt', 'Thẩm định hồ sơ đăng ký từ Web Landing Page', 'Có', 'Có', 'Có', 'Ban TV duyệt', 'Không'],
    ['2. Hội Viên', 'Phê Duyệt Kết Nạp', 'Duyệt cấp mã M1983-xxx & tự động gửi email chào mừng', 'Có', 'Có', 'Không', 'Đề xuất', 'Không'],
    ['2. Hội Viên', 'Gia hạn hội phí', 'Gia hạn thẻ hội viên +365 ngày sau khi đóng hội phí', 'Có', 'Có', 'Không', 'Ban TV duyệt', 'Không'],
    ['2. Hội Viên', 'Bản Đồ Hội Viên', 'Xem phân bố địa lý doanh nghiệp trên bản đồ số', 'Có', 'Có', 'Có', 'Có', 'Chỉ xem'],
    ['2. Hội Viên', 'Danh Thiếp Số Thông Minh', 'Cấp mã slug /card/:code, tạo danh thiếp doanh nhân', 'Có', 'Có', 'Có', 'Có', 'Của chính mình'],

    // 3. Sự Kiện & Hoạt Động
    ['3. Sự Kiện & Hoạt Động', 'Danh Sách Sự Kiện', 'Xem chi tiết lịch trình gala, đại hội, hội thảo', 'Có', 'Có', 'Có', 'Có', 'Chỉ xem'],
    ['3. Sự Kiện & Hoạt Động', 'Khởi Tạo Sự Kiện Mới', 'Tạo sự kiện, cấu hình vé điện tử, sơ đồ bàn VIP', 'Có', 'Có', 'Có', 'Ban SK duyệt', 'Không'],
    ['3. Sự Kiện & Hoạt Động', 'Phân Công & Soát Vé QR', 'Chỉ định nhân sự quét QR, kiểm soát đại biểu vào cửa', 'Có', 'Có', 'Có', 'Khi được gán', 'Không'],
    ['3. Sự Kiện & Hoạt Động', 'Vòng Quay Lucky Draw', 'Cấu hình giải thưởng, kích hoạt quay số may mắn', 'Có', 'Có', 'Không', 'Ban SK duyệt', 'Chỉ xem'],

    // 4. Nhà Tài Trợ
    ['4. Nhà Tài Trợ', 'Danh Sách Nhà Tài Trợ', 'Xem hồ sơ đơn vị tài trợ kim cương, vàng, bạc', 'Có', 'Có', 'Có', 'Có', 'Chỉ xem'],
    ['4. Nhà Tài Trợ', 'Hợp Đồng & Quyền Lợi', 'Theo dõi tiến độ giải ngân, kiểm soát trả quyền lợi', 'Có', 'Có', 'Có', 'Ban TC duyệt', 'Không'],
    ['4. Nhà Tài Trợ', 'Quản Lý Gói Tài Trợ', 'Khởi tạo gói tài trợ sự kiện, định mức kinh phí', 'Có', 'Có', 'Có', 'Ban TC duyệt', 'Không'],

    // 5. Tài Chính & Quỹ
    ['5. Tài Chính & Quỹ', 'Tổng Quan Thu Chi Quỹ', 'Theo dõi số dư tài khoản quỹ, dòng tiền thực tế', 'Có', 'Có', 'Có', 'Ban TC duyệt', 'Không'],
    ['5. Tài Chính & Quỹ', 'Sổ Quỹ Thu Chi', 'Lập phiếu thu, phiếu chi, lưu chứng từ thanh toán', 'Có', 'Có', 'Không', 'Ban TC duyệt', 'Không'],
    ['5. Tài Chính & Quỹ', 'Hóa Đơn & VietQR', 'Tạo hóa đơn hội phí, đối soát gạch nợ tự động 24/7', 'Có', 'Có', 'Không', 'Ban TC duyệt', 'Hóa đơn mình'],
    ['5. Tài Chính & Quỹ', 'Báo Cáo Tài Chính', 'Xuất báo cáo tài chính đại hội, quyết toán sự kiện', 'Có', 'Có', 'Không', 'Ban TC duyệt', 'Không'],

    // 6. Truyền Thông & Tin Tức
    ['6. Truyền Thông', 'Bài Viết & Tin Tức CLB', 'Soạn thảo tin tức, tải ảnh banner, bài phóng sự', 'Có', 'Có', 'Có', 'Ban TT duyệt', 'Chỉ đọc'],
    ['6. Truyền Thông', 'Kiểm Duyệt Xuất Bản', 'Phê duyệt tin tức hiển thị lên App Mobile & Landing', 'Có', 'Có', 'Không', 'Ban TT duyệt', 'Không'],
    ['6. Truyền Thông', 'Danh Mục Tin Tức', 'Quản lý cây danh mục chuyên trang hoạt động', 'Có', 'Có', 'Không', 'Ban TT duyệt', 'Không'],
    ['6. Truyền Thông', 'Bảng Tin Nội Bộ', 'Đăng thông báo nội bộ, thông điệp ban điều hành', 'Có', 'Có', 'Có', 'Đăng tin ban', 'Chỉ đọc'],

    // 7. Giao Thương & Kết Nối
    ['7. Giao Thương & Kết Nối', 'Cuộc Họp & Giao Ban', 'Tạo họp (4 role), Duyệt (Quản trị), Dropdown phòng họp', 'Có (Duyệt)', 'Có (Duyệt)', 'Tạo (Chờ duyệt)', 'Tạo (Chờ duyệt)', 'Tham gia (RSVP)'],
    ['7. Giao Thương & Kết Nối', 'Hẹn Gặp Bàn Tròn 1-1', 'Đặt lịch hẹn giao thương, gửi thiệp mời kết nối', 'Có', 'Có', 'Có', 'Có', 'Lịch hẹn mình'],
    ['7. Giao Thương & Kết Nối', 'Sàn Thương Mại B2B', 'Kiểm duyệt bài đăng mua bán, quản lý gian hàng B2B', 'Có', 'Có', 'Có', 'Ban XT duyệt', 'Đăng bài mình'],
    ['7. Giao Thương & Kết Nối', 'Biểu Quyết & Bầu Cử', 'Khởi tạo phiên bầu cử đại hội, mở hòm phiếu điện tử', 'Có', 'Có', 'Có', 'Không', 'Bỏ phiếu 1 lần'],

    // 8. Hệ Thống & Điều Hành
    ['8. Hệ Thống & Điều Hành', 'Phân Quyền 5 Vai Trò', 'Cấu hình ma trận phân quyền, phân bổ quyền tài khoản', 'Có', 'Có', 'Không', 'Không', 'Không'],
    ['8. Hệ Thống & Điều Hành', 'Quản Trị Tài Khoản', 'Cấp tài khoản, đổi mật khẩu, kích hoạt/khóa nick', 'Có', 'Có', 'Không', 'Không', 'Không'],
    ['8. Hệ Thống & Điều Hành', 'Cấu Hình Hệ Thống', 'Cài đặt tham số CLB, cấu hình cổng VietQR, thông báo', 'Có', 'Có', 'Không', 'Không', 'Không'],
    ['8. Hệ Thống & Điều Hành', 'Nhật Ký Kiểm Toán (Audit)', 'Truy vết IP, thời gian, lịch sử sửa/xóa dữ liệu', 'Có', 'Có', 'Không', 'Không', 'Không']
  ];
  children.push(createTable(matrixHeaders, matrixRows, [16, 20, 20, 9, 9, 9, 9, 8]));

  addMd('## PHẦN 3: MA TRẬN PHÂN QUYỀN 5 CẤP BẬC & THAO TÁC CHI TIẾT');
  addMdTableDirect(matrixHeaders, matrixRows);

  // ==========================================
  // PHẦN 4: BẢN ĐỒ NGHIỆP VỤ & LUỒNG XỬ LÝ DỮ LIỆU
  // ==========================================
  children.push(createHeading1('PHẦN 4: BẢN ĐỒ NGHIỆP VỤ & CÁC LUỒNG XỬ LÝ DỮ LIỆU CHI TIẾT (STEP-BY-STEP DATA FLOWS)'));

  // 4.1 Luồng Xét duyệt hội viên
  children.push(createHeading2('4.1 Luồng Xét Duyệt Hội Viên Mới Từ Web Landing (Không Còn Mục Doanh Thu)'));
  const flow1Text = 
    '• Mục tiêu nghiệp vụ: Tiếp nhận hồ sơ đăng ký gia nhập CLB CEO 1983 trực tuyến từ Web Landing, thẩm định tư cách doanh nhân và kích hoạt tự động tài khoản.\n' +
    '• Tác nhân tham gia (Actors): Ứng viên mới, Ban Thành Viên (Thẩm định), Ban Quản Trị / Super Admin (Phê duyệt).\n' +
    '• Điều kiện tiên quyết (Preconditions): Ứng viên truy cập Web Landing Page chính thức của CLB.\n' +
    '• Quy trình thực hiện chi tiết (Step-by-step Flow):\n' +
    '  - Bước 1: Ứng viên mở form đăng ký tại Landing Page, điền đầy đủ các thông tin bắt buộc: Họ và Tên, Số điện thoại / Zalo, Email liên hệ, Tên doanh nghiệp đại diện, Chức vụ trong doanh nghiệp, Ngành nghề lĩnh vực hoạt động, Nhu cầu kết nối giao thương. (Lưu ý: Đã loại bỏ hoàn toàn trường doanh thu công ty để tối ưu hóa tỷ lệ chuyển đổi).\n' +
    '  - Bước 2: Ứng viên bấm "Gửi Đơn Đăng Ký". Hệ thống gọi API POST /api/members/apply. Dữ liệu được ghi nhận vào bảng members với trạng thái status = "pending".\n' +
    '  - Bước 3: Hồ sơ mới xuất hiện tại danh sách "Hồ sơ chờ duyệt" trên Web CRM. Ban Thành Viên kiểm tra tính xác thực của số điện thoại và pháp nhân doanh nghiệp qua Tổng cục Thuế.\n' +
    '  - Bước 4: Ban Thành Viên chuyển trạng thái hồ sơ sang "verified" (Đã thẩm định) và trình Ban Quản Trị xem xét.\n' +
    '  - Bước 5: Ban Quản Trị hoặc Admin bấm nút "Phê Duyệt Kết Nạp" (Approve):\n' +
    '    + Hệ thống cập nhật members.status = "active".\n' +
    '    + Tự động sinh mã hội viên độc quyền theo cú pháp chuẩn: M1983-xxx (Ví dụ: M1983-099).\n' +
    '    + Tự động tạo bản ghi tài khoản người dùng trong bảng vione_users với mật khẩu ngẫu nhiên an toàn (được băm mã hóa bcrypt).\n' +
    '    + Tự động khởi tạo Danh thiếp số thông minh trong bảng member_business_cards với mã slug /card/:code.\n' +
    '    + Tự động kích hoạt dịch vụ Mailer gửi thư chúc mừng kết nạp kèm thông tin tài khoản và mật khẩu đăng nhập App di động.\n' +
    '• Luồng ngoại lệ (Exception Flow):\n' +
    '  - Nếu hồ sơ không đạt tiêu chuẩn (doanh nghiệp giải thể, thông tin giả mạo), Ban Quản Trị bấm nút "Từ chối" kèm lý do. Hệ thống cập nhật status = "rejected" và gửi email thông báo từ chối lịch sự đến ứng viên.\n' +
    '• Kết quả đầu ra (Postconditions): Hội viên mới có mã M1983, có tài khoản hoạt động và nhận được email hướng dẫn tải App di động.';
  children.push(createPara(flow1Text));

  addMd('## PHẦN 4: BẢN ĐỒ NGHIỆP VỤ & CÁC LUỒNG XỬ LÝ DỮ LIỆU CHI TIẾT');
  addMd('### 4.1 Luồng Xét Duyệt Hội Viên Mới Từ Web Landing (Không Còn Mục Doanh Thu)\n' + flow1Text);

  // 4.2 Luồng Phân công soát vé
  children.push(createHeading2('4.2 Luồng Phân Công & Kiểm Soát Soát Vé QR Sự Kiện'));
  const flow2Text = 
    '• Mục tiêu nghiệp vụ: Đảm bảo an ninh trật tự và tính chuẩn xác tại cửa đón tiếp đại biểu của các đại hội, gala lớn; ngăn chặn việc nhân sự không có phận sự tự ý soát vé.\n' +
    '• Tác nhân tham gia (Actors): Ban Quản Trị (Phân công), Nhân sự Ban Truyền Thông (Thực hiện quét QR), Đại biểu tham dự.\n' +
    '• Điều kiện tiên quyết (Preconditions): Sự kiện đã được khởi tạo trên Web CRM và đang ở trạng thái công bố (published).\n' +
    '• Quy trình thực hiện chi tiết (Step-by-step Flow):\n' +
    '  - Bước 1: Ban Quản Trị hoặc Admin mở trang chi tiết sự kiện trên Web CRM, chuyển sang tab "Phân công Soát vé".\n' +
    '  - Bước 2: Hệ thống truy vấn danh sách thành viên có vai trò BAN_TRUYEN_THONG. BQT tích chọn các thành viên cụ thể được giao nhiệm vụ trực cổng và bấm "Lưu Phân Công".\n' +
    '  - Bước 3: Dữ liệu được ghi vào bảng event_scanners với status = "active".\n' +
    '  - Bước 4: Ứng dụng di động của các nhân sự được chỉ định tự động xuất hiện tiện ích "Soát vé sự kiện" tại Trang chủ (/association). Đối với tất cả hội viên và tài khoản khác, tiện ích này hoàn toàn bị ẩn.\n' +
    '  - Bước 5: Khi đại biểu đến cửa, nhân sự mở camera quét mã QR trên vé của khách. Hệ thống gọi API GET /api/events/checkin/lookup để kiểm tra tính hợp lệ của vé, số bàn VIP và ghế ngồi.\n' +
    '  - Bước 6: Nhân sự bấm "Xác nhận vào cửa". Hệ thống cập nhật bảng event_registrations: is_checked_in = true, lưu thời điểm check-in và scanned_by_user_id, đồng thời phát WebSocket cập nhật realtime số lượng khách đã đến lên màn hình Dashboard của Ban Tổ Chức trên Web CRM.\n' +
    '• Luồng ngoại lệ (Exception Flow):\n' +
    '  - Trường hợp vé đã được quét trước đó: Hệ thống cảnh báo đỏ "Vé này đã được check-in lúc [HH:mm] bởi [Nhân sự]".\n' +
    '  - Trường hợp vé không tồn tại hoặc sai sự kiện: Hệ thống cảnh báo "Mã vé không hợp lệ".\n' +
    '• Kết quả đầu ra (Postconditions): Đại biểu được hướng dẫn vào đúng bàn tiệc; Ban Tổ Chức nắm bắt chính xác 100% tỷ lệ tham dự theo thời gian thực.';
  children.push(createPara(flow2Text));

  addMd('### 4.2 Luồng Phân Công & Kiểm Soát Soát Vé QR Sự Kiện\n' + flow2Text);

  // 4.3 Luồng Gia hạn hội phí
  children.push(createHeading2('4.3 Luồng Gia hạn hội phí Hội Viên (+365 Ngày)'));
  const flow3Text = 
    '• Mục tiêu nghiệp vụ: Quản lý vòng đời thẻ hội viên hàng năm theo quy chế CLB CEO 1983.\n' +
    '• Quyền thực hiện: Chỉ có Ban Thành Viên và Super Admin mới có quyền bấm nút gia hạn.\n' +
    '• Quy trình thực hiện chi tiết (Step-by-step Flow):\n' +
    '  - Bước 1: Ban Thành Viên lọc danh sách hội viên sắp đến hạn hoặc đã quá hạn thẻ (status = "expired") trên Web CRM.\n' +
    '  - Bước 2: Khi hội viên đóng hội phí năm mới (được Ban Tài Chính đối soát hoặc hệ thống VietQR gạch nợ tự động), Ban Thành Viên mở hồ sơ hội viên và bấm nút "Gia hạn hội phí".\n' +
    '  - Bước 3: Hệ thống mở popup xác nhận kỳ hạn mới. Ban Thành Viên kiểm tra số tiền và bấm "Xác Nhận Gia Hạn".\n' +
    '  - Bước 4: Hệ thống tạo bản ghi mới trong bảng memberships, cập nhật start_date = ngày gia hạn, expires_at = ngày hiện tại + 365 ngày (hoặc ngày hết hạn cũ + 365 ngày nếu gia hạn sớm).\n' +
    '  - Bước 5: Hóa đơn liên quan trong bảng invoices được cập nhật status = "paid".\n' +
    '  - Bước 6: Thẻ hội viên trên App di động của CEO lập tức chuyển trạng thái sang "Đang hoạt động" với dải băng màu vàng kim sang trọng, đồng thời mở lại toàn bộ quyền lợi VIP.\n' +
    '• Kết quả đầu ra (Postconditions): Thời hạn thẻ được cộng thêm 1 năm; dữ liệu tài chính ghi nhận doanh thu hội phí.';
  children.push(createPara(flow3Text));

  addMd('### 4.3 Luồng Gia hạn hội phí Hội Viên (+365 Ngày)\n' + flow3Text);

  // 4.4 Luồng Cuộc họp Online/Offline (Thiết kế mới: Phân quyền 4 vai trò tạo, Quản trị duyệt, Dropdown phòng họp tích hợp)
  children.push(createHeading2('4.4 Luồng Khởi Tạo & Điều Hành Cuộc Họp Online / Offline (Quy Trình Mới)'));
  const flow4Text = 
    '• Mục tiêu nghiệp vụ: Tổ chức các cuộc họp Ban Quản Trị, Họp Thường trực, Đại hội thành viên hoặc họp giao ban các ban ngành chuyên môn với cơ chế kiểm soát tập trung, chống trùng lịch phòng họp.\n' +
    '• Tác nhân tham gia (Actors):\n' +
    '  - Tác nhân khởi tạo: Chỉ có 4 vai trò có thẩm quyền tạo cuộc họp gồm Quản trị, Admin, Tổng thư ký, Trưởng ban. Thành viên thông thường tuyệt đối không có quyền tạo cuộc họp.\n' +
    '  - Tác nhân phê duyệt: Quản trị (Super Admin / Platform Admin).\n' +
    '  - Tác nhân tham dự: Toàn bộ đại biểu được triệu tập (Xác nhận tham gia / Báo vắng).\n' +
    '• Quy trình thực hiện chi tiết (Step-by-step Flow):\n' +
    '  - Bước 1: Người dùng có thẩm quyền (Quản trị, Admin, Tổng thư ký, Trưởng ban) truy cập phân hệ "Quản lý cuộc họp" trên Web CRM và nhấn "Tạo Cuộc Họp Mới". Người dùng chọn vai trò khởi tạo tương ứng.\n' +
    '  - Bước 2: Điền thông tin cuộc họp và lựa chọn nền tảng / phòng họp thông qua Dropdown duy nhất (Hệ thống đã gộp toàn bộ việc đăng ký phòng họp vào form tạo cuộc họp, không còn chức năng đăng ký phòng họp riêng biệt):\n' +
    '    + Tiêu đề cuộc họp và nội dung chương trình nghị sự (Agenda chi tiết).\n' +
    '    + Thời gian: Ngày họp, giờ bắt đầu và giờ kết thúc dự kiến.\n' +
    '    + Nền tảng & Phòng họp (Dropdown tích hợp): Lựa chọn một trong các phương án:\n' +
    '      * "Zoom Meetings": Nhập liên kết phòng Zoom và Passcode bảo mật.\n' +
    '      * "Google Meet": Nhập URL phòng họp Google Meet chính thức.\n' +
    '      * "UniWork Meet": Tích hợp nền tảng họp trực tuyến bảo mật nội bộ UniWork.\n' +
    '      * "Phòng Họp Trực Tiếp - Sapphire UniWork Hub": Phòng họp vật lý tại trụ sở hiệp hội (Sức chứa 40 đại biểu, trang bị màn hình LED P2 và hệ thống micro hội nghị).\n' +
    '      * "Địa Điểm Offline Khác": Nhập địa chỉ cụ thể, tên phòng họp và liên kết bản đồ Google Maps.\n' +
    '    + Thành phần triệu tập: Chọn "Toàn bộ CLB", "Ban Quản Trị", hoặc "Ban chuyên môn cụ thể".\n' +
    '  - Bước 3: Phân luồng phê duyệt tự động theo thẩm quyền:\n' +
    '    + Trường hợp 1: Nếu người tạo là Quản trị hoặc Admin, cuộc họp tự động được duyệt ngay lập tức (status = "upcoming" - Sắp diễn ra).\n' +
    '    + Trường hợp 2: Nếu người tạo là Tổng thư ký hoặc Trưởng ban, cuộc họp được lưu với trạng thái status = "pending_approval" ("Chờ Quản trị duyệt") và hiển thị trong danh sách chờ duyệt của Quản trị viên.\n' +
    '  - Bước 4: Phê duyệt cuộc họp bởi Quản trị (Super Admin):\n' +
    '    + Quản trị viên truy cập màn hình Cuộc họp, lọc danh sách "Chờ Quản trị duyệt" (hoặc xem thẻ KPI Chờ duyệt).\n' +
    '    + Quản trị viên xem xét nội dung, kiểm tra xung đột phòng họp và nhấn nút "Duyệt Cuộc Họp" (chuyển sang status = "upcoming") hoặc "Từ chối" kèm lý do phản hồi.\n' +
    '  - Bước 5: Kích hoạt thông báo tự động khi cuộc họp được phê duyệt:\n' +
    '    + Cơ chế 1: Bắn thông báo đẩy (Push Notification) đến App di động của tất cả đại biểu có tên trong danh sách triệu tập.\n' +
    '    + Cơ chế 2: Tự động gửi tin nhắn trực tiếp từ tài khoản Hệ thống [CEO1983_SYSTEM] vào hộp thư chat cá nhân của từng đại biểu, ghi rõ tiêu đề, thời gian, hình thức phòng họp và liên kết truy cập/bản đồ chỉ đường.\n' +
    '  - Bước 6: Đại biểu mở App di động, bấm nút "Xác nhận tham gia (RSVP)" hoặc "Báo vắng có lý do".\n' +
    '  - Bước 7: Ban Thư Ký và Quản trị viên theo dõi danh sách điểm danh realtime trên Web CRM để chốt số lượng đại biểu.\n' +
    '• Luồng ngoại lệ (Exception Flow):\n' +
    '  - Nếu cuộc họp bị Quản trị từ chối phê duyệt: Trạng thái chuyển sang "cancelled", người tạo (Tổng thư ký/Trưởng ban) nhận thông báo lý do để điều chỉnh lại lịch họp.\n' +
    '• Kết quả đầu ra (Postconditions): Cuộc họp được ban hành chuẩn xác, kiểm soát 100% việc sử dụng phòng họp và thông báo đồng bộ đến toàn bộ đại biểu.';
  children.push(createPara(flow4Text));

  addMd('### 4.4 Luồng Khởi Tạo & Điều Hành Cuộc Họp Online / Offline (Quy Trình Mới)\n' + flow4Text);

  // 4.5 Luồng Sàn Marketplace & Duyệt sản phẩm
  children.push(createHeading2('4.5 Luồng Quản Trị Sàn Giao Thương B2B, Kiểm Duyệt Sản Phẩm & Banner Tài Trợ'));
  const flow5Text = 
    '• Mục tiêu nghiệp vụ: Xúc tiến thương mại nội khối giữa các doanh nghiệp hội viên CEO 1983, đảm bảo chất lượng hàng hóa dịch vụ uy tín và an toàn.\n' +
    '• Tác nhân tham gia (Actors): Doanh nghiệp hội viên (Đăng sản phẩm/quảng cáo), Ban Quản Trị / Ban Xúc Tiến Thương Mại (Kiểm duyệt).\n' +
    '• Quy trình thực hiện chi tiết (Step-by-step Flow):\n' +
    '  - Bước 1: Doanh nghiệp hội viên đăng sản phẩm hoặc gửi hồ sơ đăng ký quảng cáo banner trên App di động.\n' +
    '  - Bước 2: Dữ liệu được chuyển về phân hệ "Quản lý Sàn B2B" trên Web CRM với trạng thái status = "pending".\n' +
    '  - Bước 3: Cán bộ Ban Xúc Tiến kiểm tra nội dung hình ảnh, giá ưu đãi B2B dành riêng cho hội viên CLB, và chứng nhận pháp lý sản phẩm.\n' +
    '  - Bước 4: Ban Quản Trị bấm "Phê duyệt" (Approve):\n' +
    '    + Sản phẩm chuyển status = "approved", lập tức xuất hiện trang trọng trên sàn Marketplace của App di động.\n' +
    '    + Đối với gói tài trợ quảng cáo banner: Sau khi đối soát phí tài trợ, banner được kích hoạt hiển thị ở Top Carousel đầu trang sàn thương mại với huy hiệu "Được Tài Trợ / Sponsored" màu vàng ánh kim.\n' +
    '  - Bước 5: Hội viên trên App có thể bấm nút "Liên hệ người bán" để mở ngay luồng chat B2B trao đổi thương thảo hợp đồng.\n' +
    '• Luồng ngoại lệ (Exception Flow):\n' +
    '  - Nếu sản phẩm vi phạm quy chế hoặc hình ảnh kém chất lượng: Quản trị viên bấm "Từ chối" kèm ghi chú chỉnh sửa. Người bán nhận được thông báo để cập nhật lại.\n' +
    '• Kết quả đầu ra (Postconditions): Sản phẩm chất lượng cao được lưu thông an toàn trong hệ sinh thái doanh nhân CEO 1983.';
  children.push(createPara(flow5Text));

  addMd('### 4.5 Luồng Quản Trị Sàn Giao Thương B2B, Kiểm Duyệt Sản Phẩm & Banner Tài Trợ\n' + flow5Text);

  // 4.6 Luồng Bầu cử & Biểu quyết
  children.push(createHeading2('4.6 Luồng Tổ Chức Bầu Cử Đại Hội & Biểu Quyết Trực Tuyến'));
  const flow6Text = 
    '• Mục tiêu nghiệp vụ: Thực hiện dân chủ, minh bạch trong các kỳ đại hội hiệp hội, bầu cử nhân sự Ban Chấp hành hoặc biểu quyết các nghị quyết quan trọng.\n' +
    '• Tác nhân tham gia (Actors): Ban Quản Trị (Tạo phiên biểu quyết), Toàn thể Hội viên chính thức (Bỏ phiếu).\n' +
    '• Quy trình thực hiện chi tiết (Step-by-step Flow):\n' +
    '  - Bước 1: Ban Quản Trị tạo phiên biểu quyết trên Web CRM: Tiêu đề phiên họp, danh sách ứng viên hoặc các phương án biểu quyết (Đồng ý / Không đồng ý / Ý kiến khác), thời gian mở và đóng hòm phiếu điện tử.\n' +
    '  - Bước 2: BQT bấm "Mở Phiếu Bầu". Hệ thống phát tín hiệu realtime đến toàn bộ App di động của hội viên.\n' +
    '  - Bước 3: Hội viên mở tab Biểu quyết, xem thông tin và tích chọn phương án -> Bấm "Xác nhận bỏ phiếu".\n' +
    '  - Bước 4: Hệ thống ghi nhận lá phiếu vào bảng ballots, kiểm tra tính hợp lệ và chặn việc bỏ phiếu lần 2 (mỗi hội viên chỉ bỏ phiếu 1 lần duy nhất).\n' +
    '  - Bước 5: Màn hình Web CRM hiển thị biểu đồ tỷ lệ % phiếu bầu theo thời gian thực và tự động khóa hòm phiếu khi hết giờ quy định.\n' +
    '• Kết quả đầu ra (Postconditions): Kết quả bầu cử minh bạch, có thể trích xuất biên bản kiểm phiếu PDF ngay tại đại hội.';
  children.push(createPara(flow6Text));

  addMd('### 4.6 Luồng Tổ Chức Bầu Cử Đại Hội & Biểu Quyết Trực Tuyến\n' + flow6Text);

  // ==========================================
  // PHẦN 5: CƠ SỞ DỮ LIỆU POSTGRESQL & TỪ ĐIỂN DỮ LIỆU
  // ==========================================
  children.push(createHeading1('PHẦN 5: THIẾT KẾ CƠ SỞ DỮ LIỆU POSTGRESQL & TỪ ĐIỂN DỮ LIỆU (DATA DICTIONARY)'));
  children.push(
    createPara('Toàn bộ CSDL Web CRM CEO 1983 được thiết kế theo mô hình quan hệ RDBMS chuẩn ACID, schema "public", đảm bảo tính toàn vẹn dữ liệu với các bảng nghiệp vụ cốt lõi sau:')
  );

  addMd('## PHẦN 5: THIẾT KẾ CƠ SỞ DỮ LIỆU POSTGRESQL & TỪ ĐIỂN DỮ LIỆU');

  // 5.1 Bảng members
  children.push(createHeading2('5.1 Bảng members (Ngăn Tủ Hồ Sơ Hội Viên Doanh Nhân)'));
  const memColHeaders = ['Tên Cột (Field)', 'Kiểu Dữ Liệu', 'Bắt Buộc?', 'Khóa (Key)', 'Giải Thích Chi Tiết'];
  const memColRows = [
    ['id', 'UUID', 'Có', 'PK', 'Khóa chính, định danh duy nhất của hội viên.'],
    ['member_code', 'VARCHAR(20)', 'Có', 'UNIQUE', 'Mã hội viên độc quyền (Ví dụ: M1983-001, M1983-099).'],
    ['user_id', 'UUID', 'Không', 'FK -> vione_users.id', 'Liên kết tài khoản đăng nhập hệ thống.'],
    ['full_name', 'VARCHAR(150)', 'Có', 'None', 'Họ và tên đầy đủ của doanh nhân.'],
    ['phone', 'VARCHAR(20)', 'Có', 'UNIQUE', 'Số điện thoại di động chính thức, nhận OTP và thông báo.'],
    ['email', 'VARCHAR(100)', 'Không', 'None', 'Email công việc dùng để nhận tài khoản và thư mời họp.'],
    ['company_name', 'VARCHAR(255)', 'Có', 'None', 'Tên doanh nghiệp / pháp nhân đại diện.'],
    ['position', 'VARCHAR(100)', 'Có', 'None', 'Chức vụ lãnh đạo (Chủ tịch HĐQT, CEO, Tổng Giám đốc).'],
    ['industry', 'VARCHAR(100)', 'Có', 'None', 'Ngành nghề lĩnh vực hoạt động sản xuất kinh doanh.'],
    ['tax_code', 'VARCHAR(30)', 'Không', 'None', 'Mã số thuế doanh nghiệp phục vụ xuất hóa đơn VAT.'],
    ['connection_needs', 'TEXT', 'Không', 'None', 'Nhu cầu kết nối giao thương B2B trong CLB.'],
    ['status', 'VARCHAR(30)', 'Có', 'None', 'Trạng thái: "pending" (Chờ duyệt), "active" (Hoạt động), "expired" (Hết hạn), "suspended" (Tạm khóa).'],
    ['avatar_url', 'TEXT', 'Không', 'None', 'Đường dẫn ảnh đại diện chất lượng cao của CEO.'],
    ['cover_url', 'TEXT', 'Không', 'None', 'Đường dẫn ảnh bìa trang cá nhân.'],
    ['created_at', 'TIMESTAMPTZ', 'Có', 'None', 'Thời điểm đăng ký hồ sơ vào hệ thống.']
  ];
  children.push(createTable(memColHeaders, memColRows, [18, 18, 12, 18, 34]));
  addMdTableDirect(memColHeaders, memColRows);

  // 5.2 Bảng events
  children.push(createHeading2('5.2 Bảng events (Ngăn Tủ Sự Kiện, Đại Hội & Gala)'));
  const evColHeaders = ['Tên Cột (Field)', 'Kiểu Dữ Liệu', 'Bắt Buộc?', 'Khóa (Key)', 'Giải Thích Chi Tiết'];
  const evColRows = [
    ['id', 'UUID', 'Có', 'PK', 'Mã sự kiện duy nhất.'],
    ['title', 'VARCHAR(255)', 'Có', 'None', 'Tên sự kiện (Ví dụ: Gala Doanh Nhân CEO 1983 - Hội Tụ Tinh Hoa).'],
    ['description', 'TEXT', 'Không', 'None', 'Nội dung chi tiết, kịch bản chương trình và quyền lợi đại biểu.'],
    ['banner_url', 'TEXT', 'Không', 'None', 'Ảnh banner chính tràn viền của sự kiện (16:9).'],
    ['event_date', 'TIMESTAMPTZ', 'Có', 'None', 'Ngày giờ khai mạc chính thức của sự kiện.'],
    ['location', 'VARCHAR(255)', 'Có', 'None', 'Địa chỉ địa điểm tổ chức (Khách sạn, Trung tâm hội nghị).'],
    ['map_link', 'TEXT', 'Không', 'None', 'Link Google Maps định vị chính xác dẫn đường.'],
    ['dresscode', 'VARCHAR(100)', 'Không', 'None', 'Quy định trang phục đại biểu tham dự.'],
    ['status', 'VARCHAR(30)', 'Có', 'None', 'Trạng thái: "draft" (Bản nháp), "published" (Đã công bố), "completed" (Đã xong).'],
    ['created_by', 'UUID', 'Có', 'FK -> vione_users.id', 'Người tạo sự kiện (Admin hoặc BQT).']
  ];
  children.push(createTable(evColHeaders, evColRows, [18, 18, 12, 18, 34]));
  addMdTableDirect(evColHeaders, evColRows);

  // 5.3 Bảng event_registrations
  children.push(createHeading2('5.3 Bảng event_registrations (Ngăn Tủ Vé Điện Tử & Check-in Đại Biểu)'));
  const regColHeaders = ['Tên Cột (Field)', 'Kiểu Dữ Liệu', 'Bắt Buộc?', 'Khóa (Key)', 'Giải Thích Chi Tiết'];
  const regColRows = [
    ['id', 'UUID', 'Có', 'PK', 'Mã cuống vé điện tử duy nhất.'],
    ['event_id', 'UUID', 'Có', 'FK -> events.id', 'Liên kết đến sự kiện tham dự.'],
    ['member_id', 'UUID', 'Có', 'FK -> members.id', 'Hội viên đăng ký vé.'],
    ['ticket_code', 'VARCHAR(30)', 'Có', 'UNIQUE', 'Mã vé QR duy nhất (Ví dụ: TIK-8319-099).'],
    ['ticket_type', 'VARCHAR(50)', 'Có', 'None', 'Hạng vé: "STANDARD", "VIP", "VVIP Khách Mời".'],
    ['table_number', 'VARCHAR(20)', 'Không', 'None', 'Số bàn tiệc phân bổ (Ví dụ: Bàn VIP 01).'],
    ['seat_number', 'VARCHAR(20)', 'Không', 'None', 'Số ghế ngồi danh dự (Ví dụ: Ghế 08).'],
    ['lucky_number', 'VARCHAR(20)', 'Không', 'None', 'Mã số quay thưởng may mắn bốc thăm đêm gala.'],
    ['is_checked_in', 'BOOLEAN', 'Có', 'None', 'Trạng thái điểm danh (true: Đã vào cửa, false: Chưa đến).'],
    ['checked_in_at', 'TIMESTAMPTZ', 'Không', 'None', 'Thời điểm quét mã QR soát vé thành công.'],
    ['scanned_by_user_id', 'UUID', 'Không', 'FK -> vione_users.id', 'Nhân sự Ban Truyền Thông đã thực hiện quét vé.']
  ];
  children.push(createTable(regColHeaders, regColRows, [18, 18, 12, 18, 34]));
  addMdTableDirect(regColHeaders, regColRows);

  // 5.4 Bảng event_scanners
  children.push(createHeading2('5.4 Bảng event_scanners (Bảng Phân Quyền Soát Vé Ban Truyền Thông)'));
  const scColHeaders = ['Tên Cột (Field)', 'Kiểu Dữ Liệu', 'Bắt Buộc?', 'Khóa (Key)', 'Giải Thích Chi Tiết'];
  const scColRows = [
    ['id', 'UUID', 'Có', 'PK', 'Mã bản ghi phân công soát vé.'],
    ['event_id', 'UUID', 'Có', 'FK -> events.id', 'Sự kiện được phân công nhiệm vụ trực cổng.'],
    ['user_id', 'UUID', 'Có', 'FK -> vione_users.id', 'Nhân sự Ban Truyền Thông được Ban Quản Trị chỉ định.'],
    ['assigned_by', 'UUID', 'Có', 'FK -> vione_users.id', 'Lãnh đạo Ban Quản Trị đã thực hiện phân công.'],
    ['status', 'VARCHAR(20)', 'Có', 'None', 'Trạng thái: "active" (Đang có quyền quét), "revoked" (Thu hồi quyền).'],
    ['created_at', 'TIMESTAMPTZ', 'Có', 'None', 'Thời điểm gán quyền soát vé cho nhân sự.']
  ];
  children.push(createTable(scColHeaders, scColRows, [18, 18, 12, 18, 34]));
  addMdTableDirect(scColHeaders, scColRows);

  // 5.5 Bảng invoices
  children.push(createHeading2('5.5 Bảng invoices (Ngăn Tủ Quản Lý Hội Phí & Đối Soát VietQR)'));
  const invColHeaders = ['Tên Cột (Field)', 'Kiểu Dữ Liệu', 'Bắt Buộc?', 'Khóa (Key)', 'Giải Thích Chi Tiết'];
  const invColRows = [
    ['id', 'UUID', 'Có', 'PK', 'Mã hóa đơn thu phí duy nhất.'],
    ['invoice_code', 'VARCHAR(50)', 'Có', 'UNIQUE', 'Mã giao dịch kế toán (Ví dụ: INV-CEO1983-2026-088).'],
    ['member_id', 'UUID', 'Có', 'FK -> members.id', 'Hội viên có nghĩa vụ đóng phí.'],
    ['amount', 'NUMERIC(15,2)', 'Có', 'None', 'Số tiền hội phí niêm yết (Ví dụ: 10,000,000 VNĐ/năm).'],
    ['type', 'VARCHAR(50)', 'Có', 'None', 'Loại phí: "ANNUAL_MEMBERSHIP" (Hội phí thường niên), "EVENT_SPONSOR" (Tài trợ), "AD_BANNER" (Quảng cáo).'],
    ['vietqr_code', 'TEXT', 'Không', 'None', 'Chuỗi mã VietQR Napas 24/7 sinh tự động chứa nội dung chuyển khoản.'],
    ['status', 'VARCHAR(30)', 'Có', 'None', 'Trạng thái: "pending" (Chờ thanh toán), "paid" (Đã thanh toán), "cancelled" (Hủy).'],
    ['paid_at', 'TIMESTAMPTZ', 'Không', 'None', 'Thời điểm ngân hàng gạch nợ thành công qua Webhook hoặc đối soát tay.'],
    ['created_at', 'TIMESTAMPTZ', 'Có', 'None', 'Thời điểm lập hóa đơn thu phí.']
  ];
  children.push(createTable(invColHeaders, invColRows, [18, 18, 12, 18, 34]));
  addMdTableDirect(invColHeaders, invColRows);

  // 5.6 Bảng audit_logs
  children.push(createHeading2('5.6 Bảng audit_logs (Nhật Ký Kiểm Toán & Truy Vết An Ninh Hệ Thống)'));
  const audColHeaders = ['Tên Cột (Field)', 'Kiểu Dữ Liệu', 'Bắt Buộc?', 'Khóa (Key)', 'Giải Thích Chi Tiết'];
  const audColRows = [
    ['id', 'BIGSERIAL', 'Có', 'PK', 'Mã định danh nhật ký kiểm toán tăng tự động.'],
    ['user_id', 'UUID', 'Không', 'FK -> vione_users.id', 'Tài khoản người dùng đã thực hiện hành động.'],
    ['action', 'VARCHAR(100)', 'Có', 'None', 'Tên hành động: "MEMBER_APPROVE", "MEMBER_RENEW", "SCANNER_ASSIGN", "DELETE_PRODUCT".'],
    ['target_table', 'VARCHAR(50)', 'Có', 'None', 'Bảng CSDL bị tác động (members, events, invoices).'],
    ['target_id', 'VARCHAR(100)', 'Không', 'None', 'ID của bản ghi bị tác động.'],
    ['ip_address', 'VARCHAR(50)', 'Không', 'None', 'Địa chỉ IP truy cập của người thực hiện.'],
    ['user_agent', 'TEXT', 'Không', 'None', 'Thông tin trình duyệt và hệ điều hành của thiết bị.'],
    ['details', 'JSONB', 'Không', 'None', 'Dữ liệu trước và sau khi thay đổi (Before/After snapshot).'],
    ['created_at', 'TIMESTAMPTZ', 'Có', 'None', 'Thời điểm chính xác diễn ra thao tác kiểm toán.']
  ];
  children.push(createTable(audColHeaders, audColRows, [18, 18, 12, 18, 34]));
  addMdTableDirect(audColHeaders, audColRows);

  // ==========================================
  // PHẦN 6: KỊCH BẢN KIỂM THỬ UAT CHẤP THUẬN
  // ==========================================
  children.push(createHeading1('PHẦN 6: KỊCH BẢN KIỂM THỬ NGHIỆM THU CHẤP THUẬN (UAT ACCEPTANCE TEST CASES)'));
  const uatHeaders = ['Mã TC', 'Tên Nghiệp Vụ', 'Vai Trò Thực Hiện', 'Thao Tác Thực Hiện', 'Kỳ Vọng Kỹ Thuật (API/DB)', 'Kỳ Vọng Giao Diện (UI)'];
  const uatRows = [
    ['TC_CRM_01', 'Đăng ký Landing không có doanh thu', 'Ứng viên mới', 'Điền đơn gia nhập trên Landing web', 'API POST /api/members/apply không gửi trường revenue; CSDL lưu status = pending', 'Hiển thị popup thông báo Nộp đơn thành công, chờ thẩm định'],
    ['TC_CRM_02', 'BQT / Admin phê duyệt kết nạp', 'Ban Quản Trị / Admin', 'Nhấn nút "Phê duyệt" tại hồ sơ pending', 'status = active, sinh mã M1983-xxx, tạo user bcrypt, gửi mail qua mailer', 'Thẻ đổi sang màu xanh Hoạt động, hiển thị mã hội viên mới'],
    ['TC_CRM_03', 'Chỉ định nhân sự quét QR sự kiện', 'Ban Quản Trị', 'Chọn sự kiện, gán nhân sự Ban Truyền thông', 'Lưu bản ghi vào bảng event_scanners với status active', 'Nhân sự BTT mở app thấy nút Soát vé; Hội viên thường không thấy'],
    ['TC_CRM_04', 'Ban Thành viên gia hạn hội viên', 'Ban Thành Viên', 'Bấm nút "Gia hạn" trên hồ sơ hội viên', 'Thêm 365 ngày vào memberships.expires_at, hóa đơn đổi paid', 'Thời hạn thẻ tự động cập nhật đến năm tiếp theo'],
    ['TC_CRM_05', 'Tạo cuộc họp Offline gửi tin nhắn', 'Ban Quản Trị / Admin', 'Tạo họp Offline -> Bấm Ban hành', 'Hệ thống push notification và insert tin nhắn vào chat_messages', 'Hội viên nhận thông báo đẩy và tin nhắn địa chỉ, ngày giờ họp'],
    ['TC_CRM_06', 'Phân quyền phân hệ Tài chính', 'Hội viên thường', 'Cố gắng truy cập menu Tài chính', 'Hệ thống chặn quyền (HTTP 403 Forbidden)', 'Menu Tài chính bị ẩn hoàn toàn trên thanh điều hướng'],
    ['TC_CRM_07', 'Nhắn tin B2B trên Web CRM', 'Hội viên chính thức', 'Mở chat CRM, gửi tin nhắn cho hội viên khác', 'Lưu vào chat_messages, phát socket thời gian thực', 'Tin nhắn hiển thị ngay trong bong bóng chat của người nhận'],
    ['TC_CRM_08', 'Kiểm duyệt sản phẩm Sàn B2B', 'Ban Quản Trị', 'Vào danh sách sản phẩm pending, bấm Duyệt', 'Cập nhật products.status = approved, xuất bản lên App', 'Sản phẩm xuất hiện trên sàn Marketplace di động'],
    ['TC_CRM_09', 'Tạo phiên biểu quyết đại hội', 'Ban Quản Trị', 'Khởi tạo câu hỏi bầu cử và mở bình chọn', 'Lưu bảng votes status = active, phát Socket.io', 'Hội viên mở tab Biểu quyết trên App thấy câu hỏi ngay'],
    ['TC_CRM_10', 'Truy vết an ninh Audit Log', 'Super Admin', 'Thực hiện thao tác nhạy cảm, mở trang Audit Log', 'CSDL ghi nhận bản ghi mới vào audit_logs kèm IP và User', 'Bảng Audit Log hiển thị dòng log mới nhất ở đầu trang']
  ];
  children.push(createTable(uatHeaders, uatRows, [14, 20, 16, 20, 18, 12]));

  addMd('## PHẦN 6: KỊCH BẢN KIỂM THỬ NGHIỆM THU CHẤP THUẬN (UAT)');
  addMdTableDirect(uatHeaders, uatRows);

  const doc = new Document({
    headers: hf.headers,
    footers: hf.footers,
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1200, bottom: 1200, left: 1350, right: 1350 },
          },
        },
        children: children,
      },
    ],
  });

  return { doc, mdContent: md };
}

module.exports = { buildDoc1 };
