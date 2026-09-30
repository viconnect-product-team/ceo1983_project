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

function buildDoc2() {
  const hf = createHeaderFooter('App Hiệp Hội CEO 1983');
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
    systemName: 'ỨNG DỤNG DI ĐỘNG & PWA HIỆP HỘI CLB DOANH NHÂN CEO 1983',
    subTitle: 'Sổ Tay Doanh Nhân 360°, Thẻ VIP 3D Chìm Logo Chạm NFC, Hẹn Bàn Giao Thương 1-on-1, Điểm Danh Kép QR Standee & Soát Vé Cổng, Sàn B2B Shopee Style Đánh Giá % Sao & Hộp Thư VIP Messenger #0084FF',
    docCode: 'SRS-CEO1983-APP-V4.5',
    version: 'Version 4.5 — Master Production Specification (Bàn Giao Kỹ Thuật)',
    date: '30/09/2026',
    scope: 'Toàn thể Hội viên Doanh nhân CLB CEO 1983, Ban Quản Trị, Ban Soát Vé & Đội Kỹ Thuật'
  });
  children.push(...coverElements);

  addMd('# TÀI LIỆU ĐẶC TẢ YÊU CẦU PHẦN MỀM (SRS) & THIẾT KẾ HỆ THỐNG');
  addMd('## ỨNG DỤNG DI ĐỘNG & PWA HIỆP HỘI CLB DOANH NHÂN CEO 1983');
  addMd('*Phiên bản: Version 4.5 - Chuẩn Hóa Toàn Diện Master BA & Kỹ Thuật Hệ Thống (Trang Bìa & Mục Lục Chuẩn)*');

  // ==========================================
  // 2. MỤC LỤC TÀI LIỆU (TABLE OF CONTENTS)
  // ==========================================
  const tocSections = [
    { num: 'PHẦN 1', title: 'Giải Thích Bình Dân Các Khái Niệm Kỹ Thuật Cốt Lõi (Sổ Tay Số, Thẻ Chạm NFC, Soát Vé)', scope: 'Nền tảng kiến trúc', status: 'Hoàn tất 100%' },
    { num: 'PHẦN 2', title: 'Bản Đồ 5 Tab Điều Hướng & Luồng Màn Hình Ứng Dụng Di Động CEO1983', scope: 'Điều hướng UI/UX', status: 'Hoàn tất 100%' },
    { num: 'PHẦN 3', title: 'Đặc Tả Tuần Tự Chi Tiết Toàn Bộ 13 Phân Hệ Nghiệp Vụ App Hội Viên', scope: 'Nghiệp vụ chi tiết', status: 'Hoàn tất 100%' },
    { num: '  3.1', title: 'MOD-01: Xác Thực, Đăng Nhập Đa Kênh & Kích Hoạt Thẻ Hội Viên', scope: 'Xác thực & Bảo mật', status: 'Hoàn tất 100%' },
    { num: '  3.2', title: 'MOD-02: Thẻ Hội Viên Thông Minh VIP 3D Chìm Logo (Screen Blend) & Danh Thiếp Số', scope: 'Định danh số VIP', status: 'Hoàn tất 100%' },
    { num: '  3.3', title: 'MOD-03: Công Nghệ Chạm Thẻ Thông Minh NFC 1-Chạm & Apple/Google Wallets', scope: 'Phần cứng & NFC', status: 'Hoàn tất 100%' },
    { num: '  3.4', title: 'MOD-04: Hộp Thư & Tin Nhắn Doanh Nhân VIP #0084FF, Thư Mời Họp B2B & Thu Hồi Tin', scope: 'Chat Realtime', status: 'Hoàn tất 100%' },
    { num: '  3.5', title: 'MOD-05: Danh Bạ Hội Viên, Mời Gia Nhập & Quản Lý Kết Nối Hẹn Bàn Tròn 1-on-1', scope: 'Giao thương 1-on-1', status: 'Hoàn tất 100%' },
    { num: '  3.6', title: 'MOD-06: Sàn Giao Thương B2B Shopee Style: Đánh Giá Sản Phẩm & % Sao Điểm Doanh Nghiệp', scope: 'Marketplace Shopee', status: 'Hoàn tất 100%' },
    { num: '  3.7', title: 'MOD-07: Sự Kiện Tràn Viền, Cơ Chế Điểm Danh Kép (Dual Check-in) & Bầu Cử Đại Hội', scope: 'Sự kiện & Check-in', status: 'Hoàn tất 100%' },
    { num: '  3.8', title: 'MOD-08: Thu & Đóng Hội Phí Tự Động Qua VietQR Napas 24/7 & Lịch Sử Hóa Đơn VAT', scope: 'Tài chính hội viên', status: 'Hoàn tất 100%' },
    { num: '  3.9', title: 'MOD-09: Trang Cá Nhân, Bố Cục Tin Tức 50% & Hỗ Trợ Trực Tuyến 7 Ban Chuyên Môn', scope: 'Hồ sơ & Tin tức', status: 'Hoàn tất 100%' },
    { num: '  3.10', title: 'MOD-10: Tách Biệt Độc Lập Luồng Chuông Thông Báo & Landing Page Điện Ảnh CLB', scope: 'Thông báo & Portal', status: 'Hoàn tất 100%' },
    { num: '  3.11', title: 'MOD-11: Đăng Ký Landing 3 Cấp, Onboarding, Quyền Riêng Tư & 7 Ban Ngành CLB', scope: 'Cài đặt & Onboarding', status: 'Hoàn tất 100%' },
    { num: '  3.12', title: 'MOD-12: Trải Nghiệm Doanh Nhân, Chúc Mừng Sinh Nhật Tự Động & Theme Mùa Lễ Hội', scope: 'Cá nhân hóa UX', status: 'Hoàn tất 100%' },
    { num: '  3.13', title: 'MOD-13: Quản Lý Nhà Tài Trợ, Banner Carousel Affiliate & Sàn TMĐT Luxury', scope: 'Truyền thông & Tài trợ', status: 'Hoàn tất 100%' },
    { num: 'PHẦN 4', title: 'Ma Trận Phân Quyền 5 Cấp Bậc Vai Trò Trên Hệ Thống App & Web', scope: 'Kiểm soát truy cập', status: 'Hoàn tất 100%' },
    { num: 'PHẦN 5', title: 'Thiết Kế Cơ Sở Dữ Liệu PostgreSQL & Bảng Nghiệp Vụ App Di Động', scope: 'Database & Schemas', status: 'Hoàn tất 100%' },
    { num: 'PHẦN 6', title: 'Kịch Bản Kiểm Thử Nghiệm Thu Chấp Thuận (UAT Acceptance Test Cases)', scope: 'Kiểm thử UAT', status: 'Hoàn tất 100%' },
  ];
  children.push(...createTableOfContents(tocSections));

  addMd('## MỤC LỤC TÀI LIỆU (TABLE OF CONTENTS)');
  addMdTableDirect(
    ['Mục', 'Phần / Phân Hệ Chức Năng', 'Phạm Vi Nghiệp Vụ', 'Trạng Thái'],
    tocSections.map(s => [s.num, s.title, s.scope, s.status])
  );

  const metaHeaders = ['Mục Quản Trị', 'Thông Tin Chi Tiết'];
  const metaRows = [
    ['Tên Ứng Dụng (Mobile Name)', 'CEO1983 (Chuẩn hóa viết liền không dấu cách, biểu tượng số 8 mạ vàng doanh nhân)'],
    ['Mã Tài Liệu', 'SRS-CEO1983-APP-V4.5'],
    ['Phiên Bản', 'Version 4.5 - Master BA Comprehensive Specification (Chuẩn hóa 13 phân hệ App di động có bìa & mục lục)'],
    ['Đơn Vị Chủ Quản', 'CLB Doanh Nhân CEO 1983 (Trực thuộc Hiệp Hội Doanh Nghiệp Trẻ Hà Nội - HanoiBA)'],
    ['Tác Giả & Thẩm Định', 'Master Business Analyst, Solution Architect & Ban Thư Ký CLB CEO 1983'],
    ['Đối Tượng Sử Dụng', 'Hội viên Doanh nhân CLB CEO 1983, Ban Quản Trị, Ban Soát Vé Sự Kiện, Ban Truyền Thông, Ban Thành Viên, Ban Tài Chính'],
    ['Nền Tảng Triển Khai', 'PWA Mobile Web & Mobile App (Android APK qua Capacitor 8.5 / iOS IPA / React 19 / TanStack Router)'],
    ['Phong Cách Thiết Kế', 'Executive Luxury Champagne Gold (#D97706, #FEF3C7) & Royal Navy (#003B95, #0A1834). Đẳng cấp doanh nhân sang trọng.'],
    ['Hệ Thống Tích Hợp', 'Web CRM CEO 1983, Cổng Thanh Toán VietQR Napas 24/7, Camera Barcode Scanner, Web NFC API, Push Notification']
  ];
  children.push(createTable(metaHeaders, metaRows, [30, 70]));
  addMdTableDirect(metaHeaders, metaRows);

  // ==========================================
  // PHẦN 1: GIẢI THÍCH BÌNH DÂN CHO NGƯỜI KHÔNG HỌC IT
  // ==========================================
  children.push(createHeading1('PHẦN 1: GIẢI THÍCH BÌNH DÂN CÁC KHÁI NIỆM KỸ THUẬT CỐT LÕI'));
  children.push(
    createPara('Ứng dụng di động CEO1983 đóng vai trò như cuốn Sổ Tay Doanh Nhân Thông Minh và Thẻ Doanh Nhân Số của mỗi thành viên trong CLB:'),
    createCallout(
      'HÌNH TƯỢNG VÍ VON ĐỜI THƯỜNG DỄ HIỂU NHẤT:',
      '1. Luồng Cuộc Gặp (Hẹn bàn giao thương 1-on-1): Giống như việc bạn gửi một chiếc "Thiệp Mời Cà Phê Bàn Tròn" cho một CEO trong CLB, trên thiệp ghi rõ: "Hẹn gặp 9h sáng thứ Sáu tại Khách sạn Daewoo để trao đổi về hợp tác chuỗi cung ứng". Khi đối tác bấm đồng ý, lịch hẹn tự động lưu vào sổ tay cả hai người và nhắc lịch trước 2 giờ.\n' +
      '2. Chức năng Quét mã QR Soát Vé (Dành riêng cho Ban Truyền Thông được BQT chỉ định): Chiếc điện thoại biến thành máy quét tại cổng sự kiện. Không phải ai mở app cũng thấy nút quét này; chỉ những ai được Ban Quản Trị phân công nhiệm vụ mới có mắt thần camera để đọc mã vé TIK-xxx, kiểm tra số bàn VIP và đánh dấu Đã Vào Cửa.\n' +
      '3. Thẻ Doanh Nhân VIP 3D Chạm NFC: Chiếc điện thoại biến thành chiếc thẻ doanh nhân bằng vàng. Khi chạm nhẹ vào lưng điện thoại đối tác, hệ thống tự động đẩy toàn bộ danh thiếp, hồ sơ công ty và lưu danh bạ (.VCF) chỉ sau 1 giây.\n' +
      '4. Cơ chế Điểm danh kép (Dual Check-in): Hội viên đến cửa tự mở máy quét Standee lễ tân để nhận ngay Bàn VIP mấy, Ghế số mấy và Mã số bốc thăm may mắn; đồng thời có thể chìa thẻ vé điện tử để Ban Soát Vé quét gạch vé.\n' +
      '5. Tin nhắn Doanh nhân phong cách Messenger VIP: Trò chuyện bảo mật tốc độ cao với bong bóng xanh #0084FF, hỗ trợ thả cảm xúc emoji, thu hồi tin nhắn, tạo nhóm làm việc theo từng ban ngành chuyên môn.\n' +
      '6. Ưu đãi Sinh nhật tự động & Chủ đề mùa lễ hội: Khi đến ngày sinh nhật CEO, app tự động tung pháo hoa chúc mừng kèm voucher quà tặng độc quyền; khi đến Tết hay Giáng sinh, app tự thay áo mới rực rỡ.',
      'info'
    )
  );

  addMd('## PHẦN 1: GIẢI THÍCH BÌNH DÂN CÁC KHÁI NIỆM KỸ THUẬT CỐT LÕI');
  addMd('> **HÌNH TƯỢNG VÍ VON ĐỜI THƯỜNG DỄ HIỂU:**\n' +
    '> 1. **Luồng Cuộc Gặp (Hẹn bàn 1-on-1):** Thiệp mời cà phê bàn tròn giao thương tự động đồng bộ lịch vào sổ tay hai CEO.\n' +
    '> 2. **Soát Vé QR Cổng Sự Kiện:** Mắt thần camera chỉ kích hoạt cho nhân sự Ban Truyền Thông được BQT chỉ định.\n' +
    '> 3. **Thẻ VIP 3D & Chạm NFC:** Danh thiếp mạ vàng chạm lưng điện thoại lưu danh bạ (.VCF) tức thì sau 1 giây.\n' +
    '> 4. **Cơ Chế Điểm Danh Kép:** Tự quét Standee nhận bàn/ghế/mã bốc thăm hoặc chìa vé QR cho ban kiểm soát gạch vé.\n' +
    '> 5. **Tin Nhắn VIP Messenger:** Chat 1-1 bong bóng xanh #0084FF, thu hồi tin, thả cảm xúc emoji, họp nhóm ban ngành.\n' +
    '> 6. **Quà Sinh Nhật & Chủ Đề Lễ Hội:** Tự động chúc mừng sinh nhật kèm voucher chiết khấu; đổi giao diện Tết, Noel, Tuyên Quang.');

  // ==========================================
  // PHẦN 2: BẢN ĐỒ 5 TAB CHỨC NĂNG & PHÂN QUYỀN TRÊN APP
  // ==========================================
  children.push(createHeading1('PHẦN 2: BẢN ĐỒ 5 TAB CHỨC NĂNG & LUỒNG MÀN HÌNH TRÊN APP DI ĐỘNG'));
  children.push(
    createPara('Ứng dụng được kiến trúc chuẩn hóa thành 5 Tab điều hướng thanh dưới đáy (Bottom Navigation Bar) kèm các nguyên tắc hiển thị đặc quyền:')
  );

  const tabHeaders = ['Tab Điều Hướng', 'Tên Chức Năng', 'Quyền Hiển Thị', 'Mô Tả Nghiệp Vụ'];
  const tabRows = [
    ['Tab 1: Trang Chủ (/association)', 'Home Dashboard & VIP Card', 'Tất cả (Tiện ích Soát vé QR chỉ mở cho nhân sự được gán)', 'Thẻ VIP 3D chạm NFC, sự kiện nổi bật, tiện ích Soát vé sự kiện (chỉ mở cho nhân sự được BQT chỉ định), tin tức hoạt động CLB, popup sinh nhật tự động.'],
    ['Tab 2: Sự Kiện (/association/events)', 'Events & Dual Check-in Pass', 'Tất cả (Hội viên xem chung + đăng ký vé)', 'Lịch đại hội gala, sơ đồ khán phòng bàn VIP, quét mã Standee tự động nhận bàn/ghế/mã may mắn, cuống vé điện tử QR cá nhân.'],
    ['Tab 3: Thẻ 83 (/association/card)', 'Smart NFC Card & Business Identity', 'Tất cả (Thao tác thẻ cá nhân)', 'Trọng tâm thanh điều hướng: Mở danh thiếp số 3D, mã QR định danh cá nhân, chạm kết nối NFC, chia sẻ link hồ sơ doanh nhân công khai /card/:code.'],
    ['Tab 4: Tin Nhắn (/association/messages)', 'Messages, Meetings & 1-on-1', 'Tất cả (Chat cá nhân + Xem họp)', 'Hộp thư doanh nhân VIP phong cách Messenger, chat 1-1, nhóm chat ban ngành, luồng cuộc gặp hẹn bàn 1-on-1, lịch cuộc họp Online/Offline.'],
    ['Tab 5: Cá Nhân (/association/profile)', 'Profile, Settings & Invoices', 'Tất cả (Quản lý thông tin mình)', 'Chỉnh sửa nhanh hồ sơ CEO, quản lý doanh nghiệp, tra cứu hóa đơn niên liễm VietQR, danh bạ 7 ban ngành, hỗ trợ thư ký, đổi mật khẩu và bảo mật.']
  ];
  children.push(createTable(tabHeaders, tabRows, [20, 25, 25, 30]));

  addMd('## PHẦN 2: BẢN ĐỒ 5 TAB CHỨC NĂNG & PHÂN QUYỀN TRÊN APP');
  addMdTableDirect(tabHeaders, tabRows);

  // ==========================================
  // PHẦN 3: ĐẶC TẢ CHI TIẾT 13 PHÂN HỆ APP HỘI VIÊN
  // ==========================================
  children.push(createHeading1('PHẦN 3: ĐẶC TẢ CHI TIẾT TOÀN BỘ 13 PHÂN HỆ APP HỘI VIÊN (STEP-BY-STEP FLOWS)'));

  // MOD-01: Xác thực & Đăng nhập
  children.push(createHeading2('3.1 MOD-01: Xác Thực, Đăng Nhập & Kích Hoạt Thẻ Hội Viên'));
  const mod01Text = 
    '• Mục tiêu: Cung cấp cổng xác thực đa kênh tiện lợi, bảo mật cao cho CEO và lãnh đạo doanh nghiệp.\n' +
    '• Chức năng chi tiết:\n' +
    '  - AUTH-01: Đăng nhập đa kênh (Số điện thoại / Mã hội viên M1983-xxx / Email) kết hợp mật khẩu. Tự động lưu refresh token và nhận diện phiên làm việc.\n' +
    '  - AUTH-02: Đăng ký tài khoản hội viên mới & Form hồ sơ pháp nhân doanh nghiệp đầy đủ (loại bỏ trường doanh thu).\n' +
    '  - AUTH-03: Quên mật khẩu & xác thực mã OTP qua SMS / Zalo ZNS.\n' +
    '  - AUTH-04: Đổi mật khẩu & Quản lý phiên đăng nhập các thiết bị.\n' +
    '  - AUTH-05: Cài đặt PWA lên màn hình chính (Add to Home Screen trên iOS và Android Install Prompt).\n' +
    '• Quy trình đăng nhập chi tiết (Step-by-step Flow):\n' +
    '  - Bước 1: Hội viên mở App, nhập Số điện thoại (hoặc Mã hội viên) và Mật khẩu.\n' +
    '  - Bước 2: Bấm nút "Đăng Nhập". App gọi API POST /api/auth/login.\n' +
    '  - Bước 3: Máy chủ kiểm tra thông tin, sinh JWT Access Token và Refresh Token an toàn.\n' +
    '  - Bước 4: Ứng dụng chuyển hướng vào Trang chủ (/association), đồng thời tải dữ liệu hồ sơ cá nhân và kết nối WebSocket thông báo realtime.\n' +
    '• API Mapped: POST /api/auth/login, POST /api/auth/register, POST /api/auth/forgot-password, PUT /api/auth/password.';
  children.push(createPara(mod01Text));
  addMd('### 3.1 MOD-01: Xác Thực, Đăng Nhập & Kích Hoạt Thẻ Hội Viên\n' + mod01Text);

  // MOD-02: Thẻ Hội Viên VIP & Danh thiếp số
  children.push(createHeading2('3.2 MOD-02: Thẻ Hội Viên Thông Minh VIP 3D Chìm Logo & Danh Thiếp Điện Tử (Digital Card)'));
  const mod02Text = 
    '• Mục tiêu: Xây dựng bộ nhận diện số sang trọng, quyền lực cho từng CEO thành viên CLB 1983 với thiết kế chìm logo tinh tế không nền đen.\n' +
    '• Chức năng chi tiết:\n' +
    '  - CARD-01: Hiển thị Thẻ Hội Viên VIP 3D Chìm Logo (Screen Blend): Loại bỏ triệt để viền đen của ảnh logo thông qua kỹ thuật hòa trộn màn hình CSS (mix-blend-screen / mixBlendMode: "screen"). Logo số 8 mạ vàng và chữ CEO1983 hiển thị trong suốt, chìm tinh tế vào nền thẻ gradient Royal Navy (#003B95 - #0A1834) và viền vàng champagne, không để lại mảng khối đen thô ráp.\n' +
    '  - CARD-02: Huy hiệu định danh cao cấp: Avatar hội viên bo tròn viền gradient hoàng gia, Mã hội viên M1983-xxx, Dấu tích xanh xác thực chính thức (Verified Member Badge), Chức vụ và Tên công ty pháp nhân.\n' +
    '  - CARD-03: Cấu trúc hồ sơ doanh nhân 360° ngay bên dưới thẻ: tiểu sử lãnh đạo, ngành nghề kinh doanh chính, nhu cầu kết nối cung ứng, thông tin mã số thuế và văn phòng đại diện.\n' +
    '  - CARD-04: Tích hợp mạng xã hội & ví điện tử (Facebook, Zalo, LinkedIn, Apple Wallet Pass, Google Wallet).\n' +
    '  - CARD-05: Danh thiếp số công khai chuẩn nhận diện CLB CEO 1983 (/card/:code) giúp đối tác bên ngoài quét xem không cần cài app.\n' +
    '  - CARD-06: Nút "Xem danh thiếp số" 1 chạm tích hợp trong hồ sơ hội viên và hộp thư chat.\n' +
    '• Quy trình chia sẻ danh thiếp số tuần tự (Step-by-step Flow):\n' +
    '  - Bước 1: Hội viên mở Tab "Thẻ 83" (/association/card) hoặc bấm vào thẻ VIP trên màn hình chính.\n' +
    '  - Bước 2: Thẻ VIP 3D xoay mượt mà, hiển thị logo chìm sang trọng và mã QR cá nhân sắc nét.\n' +
    '  - Bước 3: Đối tác dùng camera điện thoại quét mã QR cá nhân.\n' +
    '  - Bước 4: Trình duyệt điện thoại của đối tác mở trang web danh thiếp số công khai (/card/:code) hiển thị đầy đủ thông tin CEO và doanh nghiệp.\n' +
    '  - Bước 5: Đối tác bấm nút "Lưu Danh Bạ" -> Hệ thống tự động tải file .VCF lưu thẳng vào danh bạ điện thoại của đối tác mà không cần đối tác tải app.\n' +
    '• API Mapped: GET /api/connect-app/me, GET /api/business-cards/code/:code, PUT /api/connect-app/me/socials.';
  children.push(createPara(mod02Text));
  addMd('### 3.2 MOD-02: Thẻ Hội Viên Thông Minh VIP 3D Chìm Logo & Danh Thiếp Điện Tử (Digital Card)\n' + mod02Text);

  // MOD-03: Công nghệ chạm NFC
  children.push(createHeading2('3.3 MOD-03: Công Nghệ Chạm Thẻ Thông Minh NFC & Wallets'));
  const mod03Text = 
    '• Mục tiêu: Hiện thực hóa công nghệ một chạm kết nối thông minh giữa thẻ vật lý và thiết bị di động.\n' +
    '• Chức năng chi tiết:\n' +
    '  - NFC-01: Popup Radar quét sóng và chạm kết nối NFC một chạm qua Web NFC API (NDEFReader).\n' +
    '  - NFC-02: Ghi dữ liệu URL danh thiếp cá nhân hóa vào phôi thẻ NFC kim loại / gỗ NTAG213/215.\n' +
    '• Quy trình chạm thẻ vật lý (Step-by-step Flow):\n' +
    '  - Bước 1: Hội viên mở popup "Chạm Thẻ NFC" trên App di động.\n' +
    '  - Bước 2: Chạm lưng điện thoại vào thẻ kim loại / phôi thẻ NFC của đối tác.\n' +
    '  - Bước 3: Radar trên màn hình phát hiệu ứng quét sóng âm và thông báo: "Đã nhận diện Thẻ Doanh Nhân [Tên CEO]".\n' +
    '  - Bước 4: App lập tức mở hồ sơ chi tiết của đối tác và đề xuất kết nối giao thương.\n' +
    '• Ghi chú môi trường: Đã hoàn thiện logic đọc/ghi Web NFC API; cần thiết bị di động vật lý có chip NFC để test chạm thực tế.';
  children.push(createPara(mod03Text));
  addMd('### 3.3 MOD-03: Công Nghệ Chạm Thẻ Thông Minh NFC & Wallets\n' + mod03Text);

  // MOD-04: Tin nhắn Messenger VIP
  children.push(createHeading2('3.4 MOD-04: Gắn Kết & Tin Nhắn Doanh Nhân Phong Cách Messenger VIP'));
  const mod04Text = 
    '• Mục tiêu: Xây dựng nền tảng liên lạc nội bộ bảo mật, chuyên nghiệp, hỗ trợ tối đa cho việc giao thương và hội họp.\n' +
    '• Chức năng chi tiết:\n' +
    '  - MSG-01: Hộp thư doanh nhân với 3 tab: "Tất cả", "Chưa đọc", "Nhóm ban ngành". Hiển thị snippet tin nhắn mới nhất và badge số lượng chưa đọc.\n' +
    '  - MSG-02: Giao diện Chat 1-1 phong cách Messenger (Bong bóng chat xanh #0084FF, avatar đối tác, thời gian gửi, trạng thái Đã gửi / Đã nhận / Đã xem).\n' +
    '  - MSG-03: Thu hồi tin nhắn đã gửi (Recall Message) và cơ chế tự động nhảy lên đầu danh sách hội thoại khi có tin mới.\n' +
    '  - MSG-04: Thanh tương tác nhanh thả 6 emoji cảm xúc (Thích, Yêu, Cười, Ngạc nhiên, Buồn, Phẫn nộ) và menu tùy chọn.\n' +
    '  - MSG-05: Đính kèm Thư mời họp B2B ([B2B_CONNECT_INVITE]) trực tiếp trong luồng chat kèm nút Đồng ý / Đổi giờ / Từ chối.\n' +
    '  - MSG-06: Tạo nhóm chat theo từng Ban ngành, sự kiện (CreateGroupChatModal: gợi ý tên, icon, lọc thành viên theo ban ngành).\n' +
    '  - MSG-07: Gọi thoại & gọi video WebRTC 1-1 giữa các CEO.\n' +
    '• Quy trình trao đổi tin nhắn B2B (Step-by-step Flow):\n' +
    '  - Bước 1: Hội viên vào Tab Tin Nhắn (/association/messages), chọn một cuộc hội thoại hoặc bấm nút chat từ danh bạ.\n' +
    '  - Bước 2: Nhập nội dung văn bản, chèn ảnh, tài liệu hoặc bấm nút "Gửi Thư Mời Họp B2B".\n' +
    '  - Bước 3: Bấm nút Gửi. Hệ thống lưu tin nhắn vào bảng chat_messages và phát Socket.io thời gian thực đến người nhận.\n' +
    '  - Bước 4: Phía người nhận hiển thị bong bóng chat tức thì và có âm thanh thông báo nhẹ nhàng.\n' +
    '• API Mapped: GET /api/connect-app/dm/threads, POST /api/connect-app/dm/threads/:id/messages, DELETE /api/connect-app/dm/messages/:id.';
  children.push(createPara(mod04Text));
  addMd('### 3.4 MOD-04: Gắn Kết & Tin Nhắn Doanh Nhân Phong Cách Messenger VIP\n' + mod04Text);

  // MOD-05: Danh bạ & Kết nối
  children.push(createHeading2('3.5 MOD-05: Danh Bạ Hội Viên, Mời Gia Nhập & Quản Lý Kết Nối'));
  const mod05Text = 
    '• Mục tiêu: Tra cứu hồ sơ doanh nghiệp toàn diện, mở rộng mạng lưới giao lưu hợp tác trong hiệp hội.\n' +
    '• Chức năng chi tiết:\n' +
    '  - MEM-01: Danh bạ hội viên trực quan với bộ lọc thông minh theo ngành nghề, khu vực và từ khóa tìm kiếm.\n' +
    '  - MEM-02: Nút hành động nhanh dạng icon (Gọi điện, Nhắn tin, Hẹn gặp bàn tròn, Xem danh thiếp số).\n' +
    '  - MEM-03: Drawer đề xuất kết nối giao thương (BusinessConnectBottomSheet) kèm đính kèm nhu cầu hợp tác.\n' +
    '  - MEM-04: Tính năng Mời doanh nhân mới gia nhập CLB (sinh link giới thiệu độc quyền kèm mã hội viên giới thiệu).\n' +
    '• Quy trình gửi lời mời kết nối (Step-by-step Flow):\n' +
    '  - Bước 1: Tìm kiếm đối tác theo ngành nghề (Ví dụ: "Xây dựng", "Logistics") trong danh bạ.\n' +
    '  - Bước 2: Bấm nút "Bắt tay kết nối" (Handshake icon) trên thẻ hồ sơ của đối tác.\n' +
    '  - Bước 3: Mở Drawer nhập lời chào và chọn cơ hội hợp tác muốn thảo luận.\n' +
    '  - Bước 4: Bấm "Gửi Lời Mời". Hệ thống lưu trạng thái pending và gửi thông báo chuông đến đối tác.\n' +
    '• API Mapped: GET /api/members, POST /api/connections/invite, GET /api/members/:id/profile.';
  children.push(createPara(mod05Text));
  addMd('### 3.5 MOD-05: Danh Bạ Hội Viên, Mời Gia Nhập & Quản Lý Kết Nối\n' + mod05Text);

  // MOD-06: Sàn B2B Shopee Style
  children.push(createHeading2('3.6 MOD-06: Sàn Giao Thương B2B Shopee Style: Đánh Giá Sản Phẩm & % Sao Doanh Nghiệp'));
  const mod06Text = 
    '• Mục tiêu: Xây dựng sàn thương mại B2B nội bộ chuẩn Shopee, thúc đẩy giao thương minh bạch với hệ số uy tín dựa trên đánh giá sao thực tế của các CEO.\n' +
    '• Chức năng chi tiết:\n' +
    '  - B2B-01: Thanh tìm kiếm & Bộ lọc chuẩn Shopee: Bên trái thanh tìm kiếm là icon Menu phân loại (SlidersHorizontal) mở bộ lọc sắp xếp giá (Tăng dần / Giảm dần), sắp xếp theo hàng Mới nhất hoặc Bán chạy nhất. Ngay bên dưới thanh tìm kiếm là dải chip Danh mục gần đây đã chọn (Recent Categories chips - lưu bộ nhớ cache localStorage) giúp hội viên quay lại danh mục ưa thích chỉ với 1 chạm.\n' +
    '  - B2B-02: Hiển thị Đánh giá sản phẩm & % Điểm Sao Doanh Nghiệp:\n' +
    '    + Mỗi thẻ sản phẩm hiển thị số sao trung bình (Ví dụ: 4.9⭐) và số lượng đã bán / đã giao dịch.\n' +
    '    + Điểm sao của công ty thành viên được tính chính xác theo tỷ lệ phần trăm tổng số sao từ toàn bộ lượt đánh giá:\n' +
    '      Công thức: % Hài Lòng = [ Tổng số sao nhận được / (Tổng số lượt đánh giá * 5) ] * 100%\n' +
    '      Ví dụ: Một công ty nhận 1.670 sao từ 342 lượt đánh giá -> Điểm công ty: 4.88⭐ (97.7% hài lòng).\n' +
    '  - B2B-03: Modal Chi Tiết Sản Phẩm & Đánh Giá Chuẩn Shopee (ShopeeProductDetailModal):\n' +
    '    + Header Shopee Mall đỏ - vàng uy tín, nhãn "CEO1983 Mall" bảo chứng chất lượng.\n' +
    '    + Khối Hồ sơ Shop Doanh Nghiệp: Logo, tên doanh nghiệp, điểm sao công ty kèm %, số lượng sản phẩm đang niêm yết, tỷ lệ phản hồi chat (100%), thời gian gia nhập CLB.\n' +
    '    + Khối Đánh Giá Sản Phẩm (Rating Breakdown): Điểm số trung bình lớn 4.9/5, hiển thị thanh tiến trình 5 sao, 4 sao, 3 sao, 2 sao, 1 sao.\n' +
    '    + Bộ lọc tab đánh giá: Tất cả, 5 sao, 4 sao, 3 sao, 2 sao, 1 sao, Có nhận xét chi tiết.\n' +
    '    + Danh sách nhận xét của các CEO: Tên hội viên, công ty, avatar, số sao đánh giá, thời gian, nội dung nhận xét và phản hồi chính thức của nhà bán.\n' +
    '    + Form gửi đánh giá nhanh: Chọn số sao từ 1 đến 5 và viết cảm nhận chất lượng hàng hóa.\n' +
    '  - B2B-04: Nút "Chat Thương Thảo B2B" chuyển thẳng vào luồng chat 1-1 với chủ doanh nghiệp để đàm phán hợp đồng.\n' +
    '• Quy trình xem & đánh giá sản phẩm tuần tự (Step-by-step Flow):\n' +
    '  - Bước 1: Hội viên vào Sàn Giao Thương (/association/products).\n' +
    '  - Bước 2: Bấm icon Menu bên trái thanh tìm kiếm để chọn sắp xếp "Giá: Thấp đến Cao" hoặc chọn một danh mục từ dải "Danh mục gần đây".\n' +
    '  - Bước 3: Bấm vào một sản phẩm trên sàn -> Mở ShopeeProductDetailModal.\n' +
    '  - Bước 4: Hội viên xem thông số kỹ thuật, uy tín % sao của công ty đối tác, kéo xuống đọc nhận xét của các CEO khác.\n' +
    '  - Bước 5: Bấm "Thêm Đánh Giá", chọn 5 sao, nhập nội dung "Sản phẩm chất lượng vượt trội, đóng gói chuyên nghiệp" và bấm Gửi Đánh Giá.\n' +
    '  - Bước 6: Hệ thống cập nhật tức thì điểm đánh giá sản phẩm và tính toán lại % điểm sao uy tín của doanh nghiệp.\n' +
    '• API Mapped: GET /api/products, GET /api/products/:id/reviews, POST /api/products/:id/reviews, GET /api/companies/:id/rating-summary.';
  children.push(createPara(mod06Text));
  addMd('### 3.6 MOD-06: Sàn Giao Thương B2B Shopee Style: Đánh Giá Sản Phẩm & % Sao Doanh Nghiệp\n' + mod06Text);

  // MOD-07: Sự kiện & Check-in kép
  children.push(createHeading2('3.7 MOD-07: Sự Kiện Tràn Viền, Check-in QR Kép & Biểu Quyết Bầu Cử'));
  const mod07Text = 
    '• Mục tiêu: Quản lý xuyên suốt trải nghiệm tham dự đại hội, gala tiệc tối từ đăng ký, soát vé đến biểu quyết và quay thưởng.\n' +
    '• Chức năng chi tiết:\n' +
    '  - EVT-01: Danh sách sự kiện với ảnh banner tràn viền 16:9, đếm ngược thời gian khai mạc, thông tin sơ đồ khán phòng và nhà tài trợ.\n' +
    '  - EVT-02: Đăng ký vé tham dự và nhận Cuống Vé Điện Tử Viền Vàng cá nhân (kèm mã QR soát vé riêng).\n' +
    '  - EVT-03: Cơ chế Điểm Danh Kép (Dual Check-in):\n' +
    '    + Chế độ 1 (Hội viên tự quét Standee): Mở camera quét mã QR đặt tại cửa -> Hệ thống báo ngay Bàn VIP mấy, Ghế mấy và sinh Mã số may mắn.\n' +
    '    + Chế độ 2 (Soát vé qua cổng): Chìa vé điện tử cho nhân sự Ban Truyền Thông quét gạch vé.\n' +
    '  - EVT-04: Biểu quyết đại hội trực tuyến: Xem danh sách đề án bầu cử, chọn phương án và bấm xác nhận bỏ phiếu.\n' +
    '  - EVT-05: Vòng quay may mắn Lucky Draw: Hiển thị mã may mắn cá nhân và theo dõi trực tiếp kết quả quay số trúng thưởng.\n' +
    '• Quy trình tự quét Standee điểm danh (Step-by-step Flow):\n' +
    '  - Bước 1: Đến sảnh hội trường, hội viên mở Tab Sự Kiện, bấm nút "Quét Mã Standee Lễ Tân".\n' +
    '  - Bước 2: Hướng camera vào mã QR in trên Standee đón tiếp.\n' +
    '  - Bước 3: Màn hình hiển thị Thẻ Chúc Mừng Điểm Danh mạ vàng: "Chào mừng CEO [Tên]! Quý khách ngồi tại Bàn VIP 02, Ghế 06. Mã số may mắn của quý khách: LUCK-8319".\n' +
    '• API Mapped: GET /api/events, POST /api/events/:id/register, POST /api/events/checkin/confirm, POST /api/voting/ballot.';
  children.push(createPara(mod07Text));
  addMd('### 3.7 MOD-07: Sự Kiện Tràn Viền, Check-in QR Kép & Biểu Quyết Bầu Cử\n' + mod07Text);

  // MOD-08: Thu hội phí VietQR
  children.push(createHeading2('3.8 MOD-08: Thu & Đóng Hội Phí Tự Động Qua VietQR Napas 24/7'));
  const mod08Text = 
    '• Mục tiêu: Tối giản thủ tục tài chính, giúp CEO hoàn thành nghĩa vụ hội phí chỉ trong 1 chạm chuyển khoản ngân hàng.\n' +
    '• Chức năng chi tiết:\n' +
    '  - FEE-01: Tra cứu trạng thái thẻ và hạn niên liễm trên trang cá nhân và thẻ VIP.\n' +
    '  - FEE-02: Nút "Đóng Hội Phí Niên Liễm" mở Popup hiển thị Mã VietQR động chuẩn Napas 24/7 (tự động điền số tiền, số tài khoản CLB và cú pháp chuyển khoản chính xác).\n' +
    '  - FEE-03: Xem lịch sử hóa đơn thanh toán và xuất phiếu thu điện tử VAT.\n' +
    '• API Mapped: GET /api/invoices/me, POST /api/invoices/vietqr/generate, POST /api/invoices/webhook/napas.';
  children.push(createPara(mod08Text));
  addMd('### 3.8 MOD-08: Thu & Đóng Hội Phí Tự Động Qua VietQR Napas 24/7\n' + mod08Text);

  // MOD-09: Trang cá nhân & Tin tức 50%
  children.push(createHeading2('3.9 MOD-09: Trang Cá Nhân, Bố Cục Tin Tức 50% & Hỗ Trợ Ban Thư Ký'));
  const mod09Text = 
    '• Mục tiêu: Tối ưu không gian hiển thị thông tin cá nhân và tin tức hoạt động hiệp hội hài hòa.\n' +
    '• Chức năng chi tiết:\n' +
    '  - PRO-01: Bố cục màn hình cá nhân chia tỷ lệ 50/50: Nửa trên là danh thiếp CEO và thống kê hoạt động, nửa dưới là bảng tin hoạt động CLB.\n' +
    '  - PRO-02: Popup QuickProfileEditModal cho phép đổi ảnh đại diện, ảnh bìa, logo công ty và slogan chỉ trong 10 giây.\n' +
    '  - PRO-03: Modal ContactSupportModal hiển thị danh bạ trực ban và số hotline của 7 ban chuyên môn CLB.\n' +
    '  - PRO-04: Modal UserGuideModal cẩm nang hướng dẫn sử dụng app tương tác từng bước kèm tải file PDF chính thức.\n' +
    '• API Mapped: GET /api/members/me, PUT /api/members/me, GET /api/association/committees.';
  children.push(createPara(mod09Text));
  addMd('### 3.9 MOD-09: Trang Cá Nhân, Bố Cục Tin Tức 50% & Hỗ Trợ Ban Thư Ký\n' + mod09Text);

  // MOD-10: Luồng thông báo & Landing page
  children.push(createHeading2('3.10 MOD-10: Tách Biệt Độc Lập Luồng Thông Báo & Landing Page Điện Ảnh'));
  const mod10Text = 
    '• Mục tiêu: Phân định rạch ròi giữa thông báo hệ thống và tin nhắn trò chuyện, mang lại trải nghiệm không bị xao nhãng.\n' +
    '• Chức năng chi tiết:\n' +
    '  - NOTIF-01: Chuông thông báo độc lập trên thanh Header: Nhận thông báo xét duyệt hồ sơ, lời mời kết nối được chấp nhận, nhắc lịch họp offline và biên lai thanh toán.\n' +
    '  - NOTIF-02: Trang Landing Page công khai phong cách điện ảnh (Cinematic Visual) giới thiệu sứ mệnh, Ban Chấp hành và quyền lợi hội viên CEO 1983.\n' +
    '• API Mapped: GET /api/notifications, PUT /api/notifications/:id/read.';
  children.push(createPara(mod10Text));
  addMd('### 3.10 MOD-10: Tách Biệt Độc Lập Luồng Thông Báo & Landing Page Điện Ảnh\n' + mod10Text);

  // MOD-11: Onboarding, Quyền riêng tư & 7 Ban ngành
  children.push(createHeading2('3.11 MOD-11: Đăng Ký Landing 3 Cấp, Onboarding, Quyền Riêng Tư & 7 Ban Ngành'));
  const mod11Text = 
    '• Mục tiêu: Hướng dẫn người dùng mới, bảo vệ quyền riêng tư số và kết nối chuyên sâu theo ban chuyên môn.\n' +
    '• Chức năng chi tiết:\n' +
    '  - ONB-01: Luồng Onboarding 3 bước giới thiệu các giá trị cốt lõi khi mở app lần đầu.\n' +
    '  - ONB-02: Cài đặt quyền riêng tư: Ẩn/Hiện số điện thoại, ẩn email cá nhân trên danh thiếp số công khai.\n' +
    '  - ONB-03: Danh bạ 7 Ban ngành chuyên môn CLB CEO 1983 (Ban Hội viên, Ban Tài chính, Ban Xúc tiến thương mại, Ban Truyền thông, Ban Sự kiện, Ban Đào tạo, Ban Pháp chế).\n' +
    '• API Mapped: GET /api/association/committees, PUT /api/members/me/privacy.';
  children.push(createPara(mod11Text));
  addMd('### 3.11 MOD-11: Đăng Ký Landing 3 Cấp, Onboarding, Quyền Riêng Tư & 7 Ban Ngành\n' + mod11Text);

  // MOD-12: Trải nghiệm Doanh nhân & Sinh nhật
  children.push(createHeading2('3.12 MOD-12: Tinh Chỉnh Trải Nghiệm Doanh Nhân & Chúc Mừng Sinh Nhật Tự Động'));
  const mod12Text = 
    '• Mục tiêu: Tạo cảm giác gắn kết gia đình, ấm áp và trân trọng đối với từng doanh nhân trong hiệp hội.\n' +
    '• Chức năng chi tiết:\n' +
    '  - EXP-01: Luồng Ưu đãi & Chúc mừng sinh nhật tự động (Birthday Surprise Flow):\n' +
    '    + Tự động so khớp ngày sinh của hội viên với ngày hiện tại của hệ thống.\n' +
    '    + Hiển thị popup thiệp mừng mạ vàng kèm hiệu ứng pháo hoa rực rỡ, trao mã voucher quà tặng chiết khấu dịch vụ B2B độc quyền.\n' +
    '    + Tự động lưu mã voucher vào ví cá nhân và ghi nhớ trạng thái không làm phiền lại trong ngày.\n' +
    '  - EXP-02: Bộ chuyển đổi chủ đề mùa lễ hội linh hoạt (Seasonal Theme Switcher):\n' +
    '    + Phong cách Classic Doanh nhân Cổ điển (Xanh Navy & Vàng Champagne).\n' +
    '    + Phong cách Hội Tụ Tuyên Quang (Sự kiện đại hội, hoa sen và danh lam).\n' +
    '    + Phong cách Giáng Sinh (Tuyết rơi nhẹ, chuông vàng lễ hội).\n' +
    '    + Phong cách Tết Nguyên Đán (Sắc đỏ may mắn, cành mai hoa đào vàng).\n' +
    '• API Mapped: GET /api/members/me/birthday, GET /api/theme/config.';
  children.push(createPara(mod12Text));
  addMd('### 3.12 MOD-12: Tinh Chỉnh Trải Nghiệm Doanh Nhân & Chúc Mừng Sinh Nhật Tự Động\n' + mod12Text);

  // MOD-13: Tài trợ Marketplace & Banner Affiliate
  children.push(createHeading2('3.13 MOD-13: Quản Lý Nhà Tài Trợ, Banner Affiliate & Sàn TMĐT Luxury'));
  const mod13Text = 
    '• Mục tiêu: Khai thác tiềm năng truyền thông và thương mại của cộng đồng doanh nhân chất lượng cao.\n' +
    '• Chức năng chi tiết:\n' +
    '  - MKT-01: Top Carousel Banner nhà tài trợ nổi bật ở đầu trang Sàn Giao Thương (tự động chuyển slide mỗi 4 giây kèm huy hiệu "Được Tài Trợ").\n' +
    '  - MKT-02: Nút "Đăng Ký Chạy Quảng Cáo / Tài Trợ" mở modal thu thập thông tin chiến dịch, hình ảnh banner và link điều hướng.\n' +
    '  - MKT-03: Tích hợp đóng phí tài trợ trực tiếp qua cổng VietQR Napas 24/7 và kiểm duyệt xuất bản từ Web CRM.\n' +
    '• API Mapped: GET /api/sponsored-ads, POST /api/sponsored-ads/register.';
  children.push(createPara(mod13Text));
  addMd('### 3.13 MOD-13: Quản Lý Nhà Tài Trợ, Banner Affiliate & Sàn TMĐT Luxury\n' + mod13Text);

  // ==========================================
  // PHẦN 4: MA TRẬN PHÂN QUYỀN TRÊN APP
  // ==========================================
  children.push(createHeading1('PHẦN 4: MA TRẬN PHÂN QUYỀN 5 CẤP BẬC VAI TRÒ TRÊN HỆ THỐNG APP & WEB'));
  const appMatrixHeaders = ['Chức Năng Nghiệp Vụ', 'Quản Trị (Super Admin)', 'Admin (Ban Thư Ký)', 'Tổng Thư Ký', 'Trưởng Ban', 'Thành Viên'];
  const appMatrixRows = [
    ['Thẻ VIP 3D & Chạm NFC', 'Toàn quyền cấu hình & xem', 'Toàn quyền hỗ trợ thẻ', 'Toàn quyền thao tác', 'Toàn quyền thao tác', 'Thao tác thẻ cá nhân'],
    ['Soát Vé Sự Kiện QR', 'Toàn quyền kiểm soát', 'Toàn quyền kiểm soát', 'Toàn quyền kiểm soát', 'Kiểm soát khi được gán', 'Ẩn hoàn toàn (Không có quyền)'],
    ['Tạo Cuộc Họp Mới', 'Tạo & Duyệt ngay', 'Tạo & Duyệt ngay', 'Được tạo (Chờ Quản trị duyệt)', 'Được tạo (Chờ Quản trị duyệt)', 'Không có quyền tạo'],
    ['Phê Duyệt Cuộc Họp', 'Thẩm quyền tối cao', 'Thẩm quyền duyệt', 'Không có quyền duyệt', 'Không có quyền duyệt', 'Không có quyền duyệt'],
    ['Đăng Ký Phòng Họp', 'Gộp dropdown tạo cuộc họp', 'Gộp dropdown tạo cuộc họp', 'Gộp dropdown tạo cuộc họp', 'Gộp dropdown tạo cuộc họp', 'Không có quyền'],
    ['Xác Nhận Họp (RSVP)', 'Xem & Điểm danh toàn bộ', 'Xem & Điểm danh toàn bộ', 'Xác nhận & Điểm danh ban', 'Xác nhận & Điểm danh ban', 'Bấm Xác nhận / Báo vắng'],
    ['Cuộc Gặp 1-on-1 Doanh Nhân', 'Xem toàn bộ lịch hẹn', 'Xem hỗ trợ kết nối', 'Tạo & Nhận cuộc gặp', 'Tạo & Nhận cuộc gặp', 'Tạo & Nhận cuộc gặp'],
    ['Quản Trị Sàn B2B & Duyệt Tin', 'Toàn quyền duyệt sản phẩm', 'Kiểm duyệt sản phẩm', 'Đăng bài doanh nghiệp', 'Đăng bài doanh nghiệp', 'Đăng bài doanh nghiệp'],
    ['Biểu Quyết Đại Hội', 'Tạo hòm phiếu & Khóa phiếu', 'Hỗ trợ tạo hòm phiếu', 'Bỏ phiếu đại biểu', 'Bỏ phiếu đại biểu', 'Bỏ phiếu 1 lần duy nhất'],
    ['Đóng Phí Niên Liễm VietQR', 'Đối soát & Gạch nợ tự động', 'Hỗ trợ đối soát nợ', 'Đóng phí tài khoản mình', 'Đóng phí tài khoản mình', 'Đóng phí tài khoản mình']
  ];
  children.push(createTable(appMatrixHeaders, appMatrixRows, [22, 16, 16, 16, 15, 15]));

  addMd('## PHẦN 4: MA TRẬN PHÂN QUYỀN 5 CẤP BẬC VAI TRÒ TRÊN HỆ THỐNG');
  addMdTableDirect(appMatrixHeaders, appMatrixRows);

  // ==========================================
  // PHẦN 5: CSDL LIÊN QUAN TRÊN APP
  // ==========================================
  children.push(createHeading1('PHẦN 5: THIẾT KẾ CƠ SỞ DỮ LIỆU LIÊN QUAN TRÊN APP DI ĐỘNG'));

  children.push(createHeading2('5.1 Bảng business_connections (Tủ Hồ Sơ Cuộc Gặp Hẹn Bàn 1-on-1)'));
  const connColHeaders = ['Tên Cột (Field)', 'Kiểu Dữ Liệu', 'Bắt Buộc?', 'Khóa (Key)', 'Giải Thích Chi Tiết'];
  const connColRows = [
    ['id', 'UUID', 'Có', 'PK', 'Mã cuộc hẹn duy nhất.'],
    ['sender_member_id', 'UUID', 'Có', 'FK -> members.id', 'Hội viên chủ động gửi lời mời hẹn gặp.'],
    ['receiver_member_id', 'UUID', 'Có', 'FK -> members.id', 'Hội viên nhận được lời mời hẹn gặp.'],
    ['meeting_purpose', 'VARCHAR(255)', 'Có', 'None', 'Mục đích: Tìm hiểu chuỗi cung ứng, Hợp tác kinh doanh, Đầu tư.'],
    ['proposed_time', 'TIMESTAMPTZ', 'Có', 'None', 'Thời gian hẹn gặp do bên mời đề xuất.'],
    ['proposed_location', 'VARCHAR(255)', 'Có', 'None', 'Địa điểm hẹn gặp (Tên quán cà phê, văn phòng hoặc bàn VIP).'],
    ['message', 'TEXT', 'Không', 'None', 'Lời nhắn gửi gắm của người mời.'],
    ['status', 'VARCHAR(30)', 'Có', 'None', 'Trạng thái: "pending" (Chờ phản hồi), "confirmed" (Đã chốt), "declined" (Từ chối).'],
    ['created_at', 'TIMESTAMPTZ', 'Có', 'None', 'Thời điểm gửi lời mời hẹn gặp.']
  ];
  children.push(createTable(connColHeaders, connColRows, [20, 18, 12, 18, 32]));

  addMd('## PHẦN 5: THIẾT KẾ CƠ SỞ DỮ LIỆU LIÊN QUAN TRÊN APP DI ĐỘNG');
  addMd('### 5.1 Bảng business_connections (Hẹn Bàn 1-on-1)');
  addMdTableDirect(connColHeaders, connColRows);

  children.push(createHeading2('5.2 Bảng chat_messages (Ngăn Tủ Tin Nhắn Doanh Nhân VIP)'));
  const msgColHeaders = ['Tên Cột (Field)', 'Kiểu Dữ Liệu', 'Bắt Buộc?', 'Khóa (Key)', 'Giải Thích Chi Tiết'];
  const msgColRows = [
    ['id', 'UUID', 'Có', 'PK', 'Mã tin nhắn duy nhất.'],
    ['thread_id', 'VARCHAR(100)', 'Có', 'None', 'Mã luồng trò chuyện 1-1 hoặc mã nhóm ban ngành.'],
    ['sender_id', 'UUID', 'Có', 'FK -> vione_users.id', 'Người gửi tin nhắn.'],
    ['content', 'TEXT', 'Có', 'None', 'Nội dung tin nhắn văn bản hoặc mã thẻ mời B2B.'],
    ['type', 'VARCHAR(30)', 'Có', 'None', 'Loại tin: "text", "image", "file", "b2b_invite", "system".'],
    ['reactions', 'JSONB', 'Không', 'None', 'Mảng chứa các biểu tượng cảm xúc đã thả (emoji, user_id).'],
    ['is_recalled', 'BOOLEAN', 'Có', 'None', 'Đánh dấu tin nhắn đã bị thu hồi hay chưa.'],
    ['created_at', 'TIMESTAMPTZ', 'Có', 'None', 'Thời điểm gửi tin nhắn.']
  ];
  children.push(createTable(msgColHeaders, msgColRows, [18, 18, 12, 18, 34]));
  addMd('### 5.2 Bảng chat_messages (Tin Nhắn Doanh Nhân VIP)');
  addMdTableDirect(msgColHeaders, msgColRows);

  // ==========================================
  // PHẦN 6: KỊCH BẢN KIỂM THỬ UAT CHẤP THUẬN
  // ==========================================
  children.push(createHeading1('PHẦN 6: KỊCH BẢN KIỂM THỬ NGHIỆM THU CHẤP THUẬN (UAT ACCEPTANCE TEST CASES)'));
  const appUatHeaders = ['Mã TC', 'Tên Nghiệp Vụ', 'Màn Hình Thao Tác', 'Thao Tác Thực Hiện', 'Kỳ Vọng Kỹ Thuật (API/Socket)', 'Kỳ Vọng Giao Diện (UI)'];
  const appUatRows = [
    ['TC_APP_01', 'Đăng nhập đa kênh', 'Màn hình Đăng nhập (/association/login)', 'Nhập SĐT/Mã M1983 và Mật khẩu', 'POST /api/auth/login trả JWT token 200 OK', 'Chuyển mượt mà vào Trang chủ, nạp thẻ VIP'],
    ['TC_APP_02', 'Xem Danh thiếp số công khai', 'Trang Public Card (/card/:code)', 'Quét QR trên thẻ hoặc mở link slug', 'GET /api/business-cards/code/:code trả dữ liệu CEO', 'Hiển thị thẻ 3D mạ vàng và nút Lưu danh bạ .VCF'],
    ['TC_APP_03', 'Tự quét QR Standee điểm danh', 'Màn hình Check-in (/association/events)', 'Quét QR Standee tại cửa đại hội', 'POST /api/events/checkin/standee ghi nhận vé', 'Bật popup Chúc mừng: Bàn VIP, Ghế ngồi, Mã quay số'],
    ['TC_APP_04', 'Soát vé kiểm soát cổng', 'Màn hình Soát vé (/association/checkin)', 'Nhân sự BTT quét vé QR của khách', 'GET lookup và POST confirm gạch vé thành công', 'Hiển thị Popup thông tin đại biểu, đổi vé sang Đã Vào'],
    ['TC_APP_05', 'Hội viên thường truy cập soát vé', 'Nhập URL /association/checkin', 'Hội viên không được gán cố tình vào link', 'Middleware chặn phân quyền (403 Forbidden)', 'Màn hình báo Không có quyền, có nút Về trang chủ'],
    ['TC_APP_06', 'Hẹn gặp bàn tròn 1-on-1', 'Hồ sơ hội viên đối tác', 'Bấm nút Hẹn gặp bàn tròn, nhập giờ/địa điểm', 'POST /api/connections/meetings status = pending', 'Đối tác nhận thông báo đẩy và tin nhắn mời hẹn'],
    ['TC_APP_07', 'Thu hồi tin nhắn đã gửi', 'Màn hình Chat (/association/messages)', 'Bấm menu ⋯ tại tin nhắn -> Chọn Thu hồi', 'DELETE /api/connect-app/dm/messages/:id', 'Bong bóng đổi thành: Bạn đã thu hồi một tin nhắn'],
    ['TC_APP_08', 'Nhận Popup Chúc Mừng Sinh Nhật', 'Trang Chủ (/association)', 'Mở app đúng ngày sinh nhật hội viên', 'Kiểm tra ngày sinh khớp ngày hiện tại', 'Nổ pháo hoa chúc mừng kèm Voucher quà tặng độc quyền'],
    ['TC_APP_09', 'Chuyển đổi chủ đề mùa lễ hội', 'Modal Cài đặt chủ đề', 'Chọn chủ đề "Tết" hoặc "Giáng sinh"', 'Lưu ceo1983_active_theme vào localStorage', 'Header, banner và nút bấm đổi áo mới ngay lập tức'],
    ['TC_APP_10', 'Thanh toán hội phí VietQR', 'Trang Cá Nhân (/association/profile)', 'Bấm nút Đóng hội phí niên liễm', 'POST /api/invoices/vietqr sinh mã QR Napas 24/7', 'Hiển thị Popup VietQR chuẩn chứa số tiền và nội dung']
  ];
  children.push(createTable(appUatHeaders, appUatRows, [14, 20, 16, 20, 18, 12]));

  addMd('## PHẦN 6: KỊCH BẢN KIỂM THỬ NGHIỆM THU CHẤP THUẬN (UAT)');
  addMdTableDirect(appUatHeaders, appUatRows);

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

module.exports = { buildDoc2 };
