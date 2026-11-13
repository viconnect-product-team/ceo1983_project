const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

async function generateFeatureEvaluationExcel() {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'CLB Doanh Nhân CEO 1983 (HanoiBA)';
  workbook.lastModifiedBy = 'Hệ Thống Quản Trị VICONNECT';
  workbook.created = new Date();
  workbook.modified = new Date();

  const sheet = workbook.addWorksheet('Theo Dõi Tính Năng', {
    views: [{ showGridLines: true }],
  });

  // Thiết lập độ rộng cột
  sheet.columns = [
    { key: 'stt', width: 8 }, // A
    { key: 'parentFeature', width: 26 }, // B
    { key: 'childFeature', width: 34 }, // C
    { key: 'description', width: 45 }, // D
    { key: 'status', width: 16 }, // E
    { key: 'assignee', width: 20 }, // F
    { key: 'reviewer', width: 20 }, // G
    { key: 'reviewComment', width: 36 }, // H
    { key: 'fixAssignee', width: 20 }, // I
    { key: 'solution', width: 36 }, // J
    { key: 'postStatus', width: 18 }, // K
  ];

  // 1. Dòng Tiêu Đề Chính
  sheet.mergeCells('A1:K1');
  const titleCell = sheet.getCell('A1');
  titleCell.value = 'BẢNG THEO DÕI, ĐÁNH GIÁ VÀ NGHIỆM THU TÍNH NĂNG HỆ THỐNG CEO 1983';
  titleCell.font = { name: 'Calibri', size: 15, bold: true, color: { argb: 'FFFFFFFF' } };
  titleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF003B95' }, // Navy CEO 1983
  };
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
  sheet.getRow(1).height = 36;

  // 2. Dòng Phụ Đề
  sheet.mergeCells('A2:K2');
  const subtitleCell = sheet.getCell('A2');
  subtitleCell.value = 'Hệ sinh thái đồng bộ Web CRM Quản trị & Mobile App Hội viên CLB Doanh Nhân CEO 1983 (HanoiBA) • Phiên bản 5.0';
  subtitleCell.font = { name: 'Calibri', size: 11, italic: true, color: { argb: 'FF334155' } };
  subtitleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFF1F5F9' },
  };
  subtitleCell.alignment = { vertical: 'middle', horizontal: 'center' };
  sheet.getRow(2).height = 24;

  // Dòng 3 để trống
  sheet.getRow(3).height = 10;

  // 3. Header Bảng (Dòng 4)
  const headers = [
    'STT',
    'Chức năng cha',
    'Chức năng con',
    'Mô tả chi tiết',
    'Trạng thái',
    'Người thực hiện',
    'Người đánh giá',
    'Nội dung đánh giá',
    'Người tiếp nhận sửa',
    'Giải pháp',
    'Trạng thái sau khi tiếp nhận',
  ];

  const headerRow = sheet.getRow(4);
  headers.forEach((h, idx) => {
    const cell = headerRow.getCell(idx + 1);
    cell.value = h;
    cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1E293B' }, // Slate 800
    };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FF64748B' } },
      left: { style: 'thin', color: { argb: 'FF64748B' } },
      bottom: { style: 'medium', color: { argb: 'FF0F172A' } },
      right: { style: 'thin', color: { argb: 'FF64748B' } },
    };
  });
  headerRow.height = 30;

  // 4. Danh sách tính năng toàn hệ thống (CRM + Mobile App + Hạ tầng Core)
  const featureList = [
    // --- PHÂN HỆ WEB CRM QUẢN TRỊ ---
    {
      parent: 'Web CRM Quản Trị',
      child: '[NODE-CRM-001] Tổng Quan & Dashboard CLB',
      desc: 'Hiển thị 4 thẻ KPI tổng quan, lịch sự kiện & cuộc họp tháng, cảnh báo nợ phí niên liễm, hoạt động hội viên gần nhất.',
      status: 'đã xong',
      assignee: 'Đội Dev Backend & FE',
      reviewer: 'Ban Điều Hành CLB',
      reviewComment: 'Giao diện trực quan, dữ liệu thời gian thực đồng bộ từ PostgreSQL.',
      fixAssignee: 'Kỹ sư Core Web',
      solution: 'Duy trì cơ chế WebSocket & Server-Sent Events tự động cập nhật.',
      postStatus: 'đã xong',
    },
    {
      parent: 'Web CRM Quản Trị',
      child: '[NODE-CRM-002] Trung Tâm Thống Kê Chuyên Sâu',
      desc: 'Thống kê 5 danh mục (Hoạt động, Kết nối, B2B, Sự kiện, Giới thiệu), biểu đồ cột đa chỉ số, biểu đồ tròn tỷ trọng, zoom to nhỏ và vuốt theo ngày/tuần/tháng/quý/năm.',
      status: 'đã xong',
      assignee: 'Đội Data & Analytics',
      reviewer: 'Trưởng Ban Xúc Tiến Thương Mại',
      reviewComment: 'Cần hỗ trợ xem chi tiết tất cả các ngày trong tháng và vuốt cảm ứng mượt mà.',
      fixAssignee: 'Kỹ sư Frontend CRM',
      solution: 'Tích hợp dynamic granular buckets (ngày/tuần/tháng), zoom scale và thanh trượt Brush Recharts.',
      postStatus: 'đã xong',
    },
    {
      parent: 'Web CRM Quản Trị',
      child: '[NODE-CRM-003] Quản Trị Danh Bạ Hội Viên 360°',
      desc: 'Quản lý hồ sơ cá nhân hội viên, xuất nhập khẩu Excel, tìm kiếm nâng cao, phân quyền duyệt kết nạp hội viên mới.',
      status: 'đã xong',
      assignee: 'Đội Quản trị Dữ liệu',
      reviewer: 'Ban Thành Viên',
      reviewComment: 'Đã hoàn thiện kiểm tra trùng lặp mã hội viên và bảo toàn dữ liệu doanh nghiệp.',
      fixAssignee: 'Kỹ sư CSDL',
      solution: 'Tách biệt bảng members và companies, hỗ trợ xóa an toàn cascade có xác thực.',
      postStatus: 'đã xong',
    },
    {
      parent: 'Web CRM Quản Trị',
      child: '[NODE-CRM-004] Quản Trị Doanh Nghiệp Thành Viên',
      desc: 'Quản lý hồ sơ doanh nghiệp (Mã số thuế, ngành nghề, quy mô vốn, sản phẩm tiêu biểu, địa chỉ trụ sở).',
      status: 'đã xong',
      assignee: 'Đội Web Frontend',
      reviewer: 'Ban Thư Ký',
      reviewComment: 'Hồ sơ doanh nghiệp hiển thị chuẩn xác, hỗ trợ lọc theo ban chuyên môn.',
      fixAssignee: 'Kỹ sư Frontend CRM',
      solution: 'Tối ưu hóa layout table-fixed và modal chỉnh sửa thông tin doanh nghiệp.',
      postStatus: 'đã xong',
    },
    {
      parent: 'Web CRM Quản Trị',
      child: '[NODE-CRM-005] Quản Lý Tài Khoản & Gán Ban Chuyên Môn',
      desc: 'Phân quyền tài khoản quản trị và hội viên, gán ban chuyên môn (BĐH, Ban Truyền thông, Ban Thành viên, Ban Xúc tiến...).',
      status: 'đã xong',
      assignee: 'Đội Auth & Security',
      reviewer: 'Quản Trị Viên Hệ Thống',
      reviewComment: 'Gỡ bỏ dữ liệu hardcode, lưu trực tiếp quyền và vai trò xuống CSDL PostgreSQL.',
      fixAssignee: 'Kỹ sư Backend Auth',
      solution: 'Đồng bộ tài khoản admin@viconnect.vn và info@viconnect.vn xuống CSDL, hash bcrypt an toàn.',
      postStatus: 'đã xong',
    },
    {
      parent: 'Web CRM Quản Trị',
      child: '[NODE-CRM-006] Ma Trận Phân Quyền RBAC 2 Tab Độc Lập',
      desc: 'Quản trị vai trò phân quyền độc lập 2 Tab: Tab 1 Phân quyền Web CRM, Tab 2 Phân quyền App Mobile Hội viên.',
      status: 'đã xong',
      assignee: 'Đội Security & Core',
      reviewer: 'Ban Điều Hành',
      reviewComment: 'Đã phân tách rành mạch vai trò quản trị desktop và quyền hạn thao tác di động.',
      fixAssignee: 'Kỹ sư Hệ thống',
      solution: 'Áp dụng Guard Roles RBAC đa cấp độ kèm middleware kiểm tra quyền hạn.',
      postStatus: 'đã xong',
    },
    {
      parent: 'Web CRM Quản Trị',
      child: '[NODE-CRM-007] Quản Trị Sự Kiện, Vé Check-in, Lucky Draw',
      desc: 'Tổ chức sự kiện CLB, cấu hình vé, in mã QR điểm danh, cấu hình sơ đồ chỗ ngồi, quay số may mắn và Bắn Mạng Lưới sang App.',
      status: 'đã xong',
      assignee: 'Đội Sự Kiện & Media',
      reviewer: 'Trưởng Ban Sự Kiện',
      reviewComment: 'Sự kiện 21/11 chuẩn xác thông tin, mã QR điểm danh đồng bộ mượt mà.',
      fixAssignee: 'Kỹ sư Fullstack',
      solution: 'Bỏ text thừa, căn chỉnh tỷ lệ khung ảnh poster và tạo liên kết trực tiếp bài phát thanh.',
      postStatus: 'đã xong',
    },
    {
      parent: 'Web CRM Quản Trị',
      child: '[NODE-CRM-008] Quản Lý Cuộc Họp Ban & Gặp Gỡ CLB',
      desc: 'Lên lịch họp ban chuyên môn, họp Ban Điều Hành, bản đồ tương tác chọn vị trí họp (Nominatim/OpenStreetMap), đồng bộ sang App.',
      status: 'đã xong',
      assignee: 'Đội Web Frontend',
      reviewer: 'Ban Thư Ký',
      reviewComment: 'Vị trí ghim cuộc họp chính xác, tự động thông báo tới thành viên tham gia.',
      fixAssignee: 'Kỹ sư Bản đồ GIS',
      solution: 'Tích hợp Leaflet Maps và cơ chế đồng bộ sự kiện họp ban sang Mobile Feed.',
      postStatus: 'đã xong',
    },
    {
      parent: 'Web CRM Quản Trị',
      child: '[NODE-CRM-009] Quản Lý Thu Ngân Sách, Phí & Vé',
      desc: 'Theo dõi phiếu thu niên liễm, phí sự kiện, tài trợ, biểu đồ ComposedChart dòng tiền, xuất nhập Excel chuyên nghiệp.',
      status: 'đã xong',
      assignee: 'Đội Kế Toán & Tài Chính',
      reviewer: 'Ban Tài Chính CLB',
      reviewComment: 'Bảng biểu co dãn mượt mà, phân loại rõ ràng các nguồn thu.',
      fixAssignee: 'Kỹ sư Frontend',
      solution: 'Áp dụng kiến trúc table-fixed chống tràn cột, tích hợp modal import Excel.',
      postStatus: 'đã xong',
    },
    {
      parent: 'Web CRM Quản Trị',
      child: '[NODE-CRM-010] Quản Lý Chi Ngân Sách, Tạm Ứng & Hoàn Ứng',
      desc: 'Theo dõi phiếu chi hoạt động, quản lý tạm ứng công việc của các ban, hoàn ứng tiền thừa, biểu đồ tròn cơ cấu chi phí.',
      status: 'đã xong',
      assignee: 'Đội Kế Toán & Tài Chính',
      reviewer: 'Ban Tài Chính CLB',
      reviewComment: 'Duyệt chi minh bạch theo đúng quy chế tài chính của Hội.',
      fixAssignee: 'Kỹ sư Backend',
      solution: 'Tạo bảng expense_records kèm ràng buộc trạng thái duyệt chi nhiều cấp.',
      postStatus: 'đã xong',
    },
    {
      parent: 'Web CRM Quản Trị',
      child: '[NODE-CRM-011] Báo Cáo Tài Chính Tổng Hợp & Quyết Toán',
      desc: 'Biểu đồ hỗn hợp Dòng tiền Thu - Chi - Thặng Dư tích lũy, phân tích đóng góp tài trợ theo 4 hạng (Kim Cương, Vàng, Bạc, Đồng).',
      status: 'đã xong',
      assignee: 'Đội Kế Toán & Analytics',
      reviewer: 'Chủ Tịch CLB',
      reviewComment: 'Báo cáo tổng hợp số liệu thực từ PostgreSQL, không có số liệu giả lập.',
      fixAssignee: 'Kỹ sư Data',
      solution: 'Tối ưu hóa các câu lệnh truy vấn tổng hợp SQL và Recharts ComposedChart.',
      postStatus: 'đã xong',
    },
    {
      parent: 'Web CRM Quản Trị',
      child: '[NODE-CRM-012] Giao Việc Ban Chuyên Môn & Xem File',
      desc: 'Giao việc đa ban, chỉ định người phụ trách, đính kèm tài liệu và xem trực tiếp (Excel, PDF, Word, Ảnh) không cần tải về.',
      status: 'đã xong',
      assignee: 'Đội Tác Vụ & Giao Việc',
      reviewer: 'Ban Điều Hành',
      reviewComment: 'Thông báo giao việc nêu rõ người giao, mở file xem ngay lập tức.',
      fixAssignee: 'Kỹ sư Frontend',
      solution: 'Tích hợp Universal Document Viewer xem trực tiếp SheetJS và PDF nhúng.',
      postStatus: 'đã xong',
    },
    {
      parent: 'Web CRM Quản Trị',
      child: '[NODE-CRM-013] Quản Trị Nhà Tài Trợ & Quyền Lợi',
      desc: 'Quản lý danh sách nhà tài trợ theo 4 hạng thương hiệu, bàn giao logo banner lên Poster sự kiện và Sàn giao thương B2B.',
      status: 'đã xong',
      assignee: 'Đội Tài Trợ & Đối Ngoại',
      reviewer: 'Ban Xúc Tiến Thương Mại',
      reviewComment: 'Quyền lợi nhà tài trợ hiển thị nổi bật trên toàn bộ hệ sinh thái.',
      fixAssignee: 'Kỹ sư Frontend',
      solution: 'Đồng bộ danh sách tài trợ vào poster generator và sàn thương mại.',
      postStatus: 'đã xong',
    },
    {
      parent: 'Web CRM Quản Trị',
      child: '[NODE-CRM-014] Kho Tài Liệu & Trình Xem Tài Liệu Toàn Năng',
      desc: 'Kho lưu trữ quy chế, biểu mẫu, hợp đồng CLB. Trình xem tài liệu toàn năng (Word A4, Excel SheetJS, PDF nhúng, Ảnh).',
      status: 'đã xong',
      assignee: 'Đội Quản Trị Tài Liệu',
      reviewer: 'Ban Thư Ký',
      reviewComment: 'Xem file tài liệu mượt mà, phân loại thư mục rõ ràng.',
      fixAssignee: 'Kỹ sư Fullstack',
      solution: 'Tích hợp PDF worker và SheetJS renderer tối ưu hiệu năng.',
      postStatus: 'đã xong',
    },
    {
      parent: 'Web CRM Quản Trị',
      child: '[NODE-CRM-015] Quản Trị Biểu Quyết & Quay Số May Mắn',
      desc: 'Tạo phiên biểu quyết nghị quyết trực tuyến, thiết lập vòng quay may mắn Lucky Draw theo giải thưởng sự kiện.',
      status: 'đã xong',
      assignee: 'Đội Sự Kiện & Công Nghệ',
      reviewer: 'Ban Tổ Chức Sự Kiện',
      reviewComment: 'Quay số may mắn tự động loại trừ người đã trúng, trừ dần số lượng giải.',
      fixAssignee: 'Kỹ sư Frontend Game',
      solution: 'Thuật toán quay số ngẫu nhiên công bằng, lưu log trúng thưởng vào CSDL.',
      postStatus: 'đã xong',
    },
    {
      parent: 'Web CRM Quản Trị',
      child: '[NODE-CRM-016] Quản Lý Bản Tin & Truyền Thông CLB',
      desc: 'Soạn thảo tin tức hoạt động, phát hành bài viết truyền thông tới bảng tin mạng xã hội App Mobile CEO 1983.',
      status: 'đã xong',
      assignee: 'Đội Truyền Thông & Biên Tập',
      reviewer: 'Trưởng Ban Truyền Thông',
      reviewComment: 'Bản tin cập nhật nhanh chóng, hình ảnh sắc nét, định dạng bài viết chuẩn.',
      fixAssignee: 'Kỹ sư Content',
      solution: 'Hỗ trợ upload ảnh đa phương tiện và đồng bộ Feed Post Socket.IO.',
      postStatus: 'đã xong',
    },
    {
      parent: 'Web CRM Quản Trị',
      child: '[NODE-CRM-017] Gia Hạn Hội Viên & Xử Lý Nợ Phí',
      desc: 'Theo dõi chu kỳ niên liễm, nhắc hạn hội phí tự động, gửi thông báo gia hạn tới hội viên qua App, Zalo và Email.',
      status: 'đã xong',
      assignee: 'Đội Quản Trị Hội Viên',
      reviewer: 'Ban Thành Viên',
      reviewComment: 'Tiến độ gia hạn rõ ràng, tự động liên kết tài khoản mới nhất.',
      fixAssignee: 'Kỹ sư Backend',
      solution: 'Khử prefix mã, tối ưu truy vấn LEFT JOIN bảng vione_users và members.',
      postStatus: 'đã xong',
    },
    {
      parent: 'Web CRM Quản Trị',
      child: '[NODE-CRM-018] Quản Trị Đào Tạo Đa Thức & Bắn Mạng Lưới',
      desc: 'Quản lý khóa đào tạo (Online/Offline/Hybrid), phòng video call nhúng Jitsi, tài liệu giáo trình và Bắn Mạng Lưới sang App.',
      status: 'đã xong',
      assignee: 'Đội Đào Tạo & Tri Thức',
      reviewer: 'Ban Đào Tạo CLB',
      reviewComment: 'Khóa học tổ chức chuyên nghiệp, video call ổn định, phát thanh bài viết nhanh.',
      fixAssignee: 'Kỹ sư Video Call',
      solution: 'Tích hợp Jitsi Meet SDK và bài viết gắn nhãn đào tạo chuyên môn.',
      postStatus: 'đã xong',
    },
    {
      parent: 'Web CRM Quản Trị',
      child: '[NODE-CRM-019] Nhật Ký Thao Tác Toàn Hệ Thống (Audit Log)',
      desc: 'Ghi nhận và tra cứu toàn bộ lịch sử thao tác của các tài khoản (đăng nhập, chỉnh sửa hồ sơ, duyệt chi, phát thư mời, xóa dữ liệu).',
      status: 'đã xong',
      assignee: 'Đội Security & Audit',
      reviewer: 'Chủ Tịch & Ban Kiểm Tra',
      reviewComment: 'Truy vết minh bạch mọi hành động, lưu IP và thời gian chính xác.',
      fixAssignee: 'Kỹ sư Core',
      solution: 'Middleware Audit Logger tự động ghi nhận vào bảng audit_logs.',
      postStatus: 'đã xong',
    },
    {
      parent: 'Web CRM Quản Trị',
      child: '[NODE-CRM-020] Trao Cơ Hội Đa Đối Tượng & Hội Nhóm',
      desc: 'Trao cơ hội kinh doanh cho nhiều hội viên cùng lúc (batch-share) hoặc trao trực tiếp cho toàn bộ một ban chuyên môn.',
      status: 'đã xong',
      assignee: 'Đội Giao Thương B2B',
      reviewer: 'Ban Xúc Tiến Thương Mại',
      reviewComment: 'Mở rộng quy mô trao deal, kết nối nhanh các chuỗi cung ứng nội bộ.',
      fixAssignee: 'Kỹ sư Backend Deal',
      solution: 'Endpoint POST /opportunities/batch-share xử lý giao dịch an toàn transaction.',
      postStatus: 'đã xong',
    },
    {
      parent: 'Web CRM Quản Trị',
      child: '[NODE-CRM-021] Theme Studio, Icon Picker & Đồng Bộ Theme',
      desc: 'Tùy biến chủ đề giao diện CRM và đồng bộ xuống App Mobile (5 bộ VIP Presets, nhận diện màu sắc, hình nền mùa lễ hội).',
      status: 'đã xong',
      assignee: 'Đội UI/UX Design',
      reviewer: 'Ban Điều Hành',
      reviewComment: 'Đã gỡ bỏ dải gradient rực rỡ, áp dụng màu sắc tối giản trang nhã chuẩn mực.',
      fixAssignee: 'Kỹ sư Frontend Design',
      solution: 'Tối ưu hóa biến CSS Theme và phát sự kiện đồng bộ COLOR_THEME_EVENT.',
      postStatus: 'đã xong',
    },
    {
      parent: 'Web CRM Quản Trị',
      child: '[NODE-CRM-022] Trung Tâm Thông Báo Quản Trị & Cảnh Báo',
      desc: 'Quản trị thông báo hệ thống, cảnh báo tự động hồ sơ hội viên mới, cảnh báo nợ phí niên liễm, đẩy tin nhắn vào Kênh Hiệp Hội.',
      status: 'đã xong',
      assignee: 'Đội Thông Báo & Tương Tác',
      reviewer: 'Ban Thư Ký',
      reviewComment: 'Đã tích hợp tùy chọn gửi kèm qua Zalo OA (ZBS/ZNS) theo mẫu đã thiết lập.',
      fixAssignee: 'Kỹ sư Fullstack',
      solution: 'Tích hợp bộ chọn kênh Zalo OA và tự động gọi API ZBS gửi tin nhắn.',
      postStatus: 'đã xong',
    },
    {
      parent: 'Web CRM Quản Trị',
      child: '[NODE-CRM-023] Quản Lý Landing Web Dynamic & Subdomain',
      desc: 'Tạo và quản lý trang Landing Page giới thiệu CLB (Startup Mobile Showcase, Timed Cards), gán Subdomain động (*.ceo1983.viconnect.vn).',
      status: 'đã xong',
      assignee: 'Đội Web Builder & DevOps',
      reviewer: 'Ban Truyền Thông',
      reviewComment: 'Trang landing tải nhanh, hiển thị đẹp trên cả mobile và desktop.',
      fixAssignee: 'Kỹ sư Frontend',
      solution: 'Tối ưu hóa Nitro Server Engine và Dynamic Route /landing/$slug.',
      postStatus: 'đã xong',
    },
    {
      parent: 'Web CRM Quản Trị',
      child: '[NODE-CRM-024] Quản Lý Thư Mời Đa Kênh & Zalo ZBS Excel',
      desc: 'Thiết kế thư mời sự kiện, import danh sách khách mời từ file Excel (trích xuất Tên + SĐT), gửi hàng loạt Zalo ZBS tới từng khách.',
      status: 'đã xong',
      assignee: 'Đội Omnichannel & Zalo',
      reviewer: 'Ban Tổ Chức Sự Kiện',
      reviewComment: 'Đã hoàn thiện form cấu hình Zalo ZBS, import Excel tự động nhận diện cột và bắn thư mời 1 chạm.',
      fixAssignee: 'Kỹ sư Backend & FE Zalo',
      solution: 'Xây dựng ZaloZbsInvitationModal, endpoint POST /zalo/send-bulk-zns chuẩn OpenAPI.',
      postStatus: 'đã xong',
    },

    // --- PHÂN HỆ MOBILE APP CEO 1983 ---
    {
      parent: 'CEO 1983 Mobile App',
      child: '[NODE-APP-001] Trang Chủ Ticker Nến Realtime & Shortcut',
      desc: 'Màn hình chính hội viên: Ticker nến thị trường cơ hội, dải 4 hành động nhanh, bài viết mới nhất, phím tắt vào tin nhắn.',
      status: 'đã xong',
      assignee: 'Đội Mobile App',
      reviewer: 'Hội Viên Trải Nghiệm',
      reviewComment: 'Giao diện mượt mà, bám sát tai thỏ và cạnh đáy thiết bị di động chuẩn SafeArea.',
      fixAssignee: 'Kỹ sư Mobile',
      solution: 'Áp dụng env(safe-area-inset-top) và env(safe-area-inset-bottom) không để vệt thừa.',
      postStatus: 'đã xong',
    },
    {
      parent: 'CEO 1983 Mobile App',
      child: '[NODE-APP-002] Thẻ Hội Viên VIP Số & QR Cá Nhân',
      desc: 'Danh thiếp điện tử hội viên: Thẻ nhận diện 3D, mã QR cá nhân phóng to, công tắc bật tắt quyền riêng tư SĐT và Email.',
      status: 'đã xong',
      assignee: 'Đội Mobile Card',
      reviewer: 'Ban Thành Viên',
      reviewComment: 'Quét mã QR đối tác mở ngay danh thiếp, chia sẻ thông tin chuyên nghiệp.',
      fixAssignee: 'Kỹ sư Frontend',
      solution: 'Tối ưu hóa SVG QR Code và modal phóng to thẻ thành viên.',
      postStatus: 'đã xong',
    },
    {
      parent: 'CEO 1983 Mobile App',
      child: '[NODE-APP-003] Trang Quét Danh Thiếp Công Khai Bảo Mật',
      desc: 'Trang xem danh thiếp công khai khi khách ngoài quét QR (/card/:code), ẩn thông tin nhạy cảm theo cài đặt riêng tư.',
      status: 'đã xong',
      assignee: 'Đội Public Web',
      reviewer: 'Ban Kiểm Tra',
      reviewComment: 'Bảo mật thông tin cá nhân của hội viên theo đúng nguyện vọng cài đặt.',
      fixAssignee: 'Kỹ sư Security',
      solution: 'Backend lọc bỏ trường phone/email nếu cờ privacy_phone/privacy_email tắt.',
      postStatus: 'đã xong',
    },
    {
      parent: 'CEO 1983 Mobile App',
      child: '[NODE-APP-004] Danh Bạ Hội Viên & Bản Đồ 2D Google Maps',
      desc: 'Tra cứu danh bạ doanh nhân, bản đồ số 2D Google Maps dẫn đường tới trụ sở doanh nghiệp của hội viên.',
      status: 'đã xong',
      assignee: 'Đội GIS & Location',
      reviewer: 'Ban Xúc Tiến Thương Mại',
      reviewComment: 'Tìm kiếm hội viên theo ngành nghề nhanh chóng, bản đồ chỉ đường chính xác.',
      fixAssignee: 'Kỹ sư Bản đồ',
      solution: 'Tích hợp Google Maps Tile Layer và GPS Geolocation định vị vị trí hiện tại.',
      postStatus: 'đã xong',
    },
    {
      parent: 'CEO 1983 Mobile App',
      child: '[NODE-APP-005] Cơ Hội Giao Thương B2B Strip 3 Thẻ Ngang',
      desc: 'Chia sẻ cơ hội B2B công khai, dải 3 thẻ số liệu (Tổng chia sẻ, Deal đã chốt, Tôi share đi), bộ lọc trạng thái cơ hội.',
      status: 'đã xong',
      assignee: 'Đội B2B Marketplace',
      reviewer: 'Ban Xúc Tiến Thương Mại',
      reviewComment: 'Quy trình kết nối cơ hội rõ ràng, ghi nhận giá trị giao thương thực tế.',
      fixAssignee: 'Kỹ sư Fullstack',
      solution: 'Loại bỏ hoàn toàn mock data, đồng bộ trực tiếp với CSDL PostgreSQL.',
      postStatus: 'đã xong',
    },
    {
      parent: 'CEO 1983 Mobile App',
      child: '[NODE-APP-006] Trung Tâm Thống Kê Hội Viên & Vinh Danh',
      desc: 'Thống kê kết nối, cơ hội, sự kiện; bục vinh danh Top 3 hội viên năng động, biểu đồ cột và tròn real data kèm zoom/vuốt.',
      status: 'đã xong',
      assignee: 'Đội Analytics Mobile',
      reviewer: 'Ban Điều Hành',
      reviewComment: 'Đã hoàn thiện hiển thị đầy đủ ngày/tuần trong tháng, hỗ trợ vuốt ngang và zoom in/out.',
      fixAssignee: 'Kỹ sư Mobile FE',
      solution: 'Tích hợp bộ chọn sub-granularity, thanh zoom +/- và container cuộn ngang cảm ứng.',
      postStatus: 'đã xong',
    },
    {
      parent: 'CEO 1983 Mobile App',
      child: '[NODE-APP-007] Sàn Giao Thương B2B Giới Hạn 5 Sản Phẩm',
      desc: 'Trưng bày sản phẩm dịch vụ của doanh nghiệp hội viên (tối đa 5 sản phẩm/doanh nghiệp chống spam), nút nhắn tin người bán.',
      status: 'đã xong',
      assignee: 'Đội Sàn Thương Mại',
      reviewer: 'Ban Xúc Tiến Thương Mại',
      reviewComment: 'Gian hàng trực quan, giới hạn 5 sản phẩm giúp nâng cao chất lượng bài đăng.',
      fixAssignee: 'Kỹ sư Marketplace',
      solution: 'Ràng buộc số lượng sản phẩm trên API và giao diện hiển thị badge (X/5).',
      postStatus: 'đã xong',
    },
    {
      parent: 'CEO 1983 Mobile App',
      child: '[NODE-APP-008] Sự Kiện & Cuộc Họp Gặp Mặt Di Động',
      desc: 'Đăng ký tham gia sự kiện CLB và cuộc họp ban chuyên môn, nhận vé mời có mã QR điểm danh cá nhân hóa.',
      status: 'đã xong',
      assignee: 'Đội Sự Kiện Mobile',
      reviewer: 'Ban Tổ Chức Sự Kiện',
      reviewComment: 'Đăng ký 1 chạm, vé mời tự động lưu vào danh sách sự kiện của tôi.',
      fixAssignee: 'Kỹ sư Mobile',
      solution: 'Tạo mã QR check-in chứa mã đăng ký duy nhất, kiểm tra trùng lặp trên backend.',
      postStatus: 'đã xong',
    },
    {
      parent: 'CEO 1983 Mobile App',
      child: '[NODE-APP-009] Biểu Quyết Trực Tuyến Gắn Với Sự Kiện',
      desc: 'Biểu quyết nghị quyết CLB theo thời gian thực, xem kết quả tỷ lệ % tán thành, gắn liền với phiên họp chính thức.',
      status: 'đã xong',
      assignee: 'Đội Biểu Quyết',
      reviewer: 'Ban Thư Ký',
      reviewComment: 'Kết quả kiểm phiếu tự động, chính xác, mỗi hội viên biểu quyết đúng 1 lượt.',
      fixAssignee: 'Kỹ sư Backend',
      solution: 'Ràng buộc unique (poll_id, user_id) trên bảng poll_votes.',
      postStatus: 'đã xong',
    },
    {
      parent: 'CEO 1983 Mobile App',
      child: '[NODE-APP-010] Mạng Lưới Hội Viên & Chat Nhắn Tin Trực Tiếp',
      desc: 'Bảng tin mạng xã hội nội bộ, điểm danh người tham dự, nhắn tin trao đổi 1-on-1, nhắn tin theo kênh ban chuyên môn.',
      status: 'đã xong',
      assignee: 'Đội Chat & Social',
      reviewer: 'Ban Truyền Thông',
      reviewComment: 'Đã xử lý triệt để popup menu tin nhắn (chỉnh sửa, thu hồi, xóa) không bị che bởi header.',
      fixAssignee: 'Kỹ sư UI Mobile',
      solution: 'Tính toán vị trí thông minh: tự động đẩy xuống (top-full mt-1.5) khi chạm vùng header.',
      postStatus: 'đã xong',
    },
    {
      parent: 'CEO 1983 Mobile App',
      child: '[NODE-APP-011] Hồ Sơ Cá Nhân & Thẻ Trạng Thái Hội Viên',
      desc: 'Quản lý thông tin cá nhân, chức vụ, ảnh đại diện, lịch sử tham gia CLB, cài đặt ngôn ngữ và giao diện.',
      status: 'đã xong',
      assignee: 'Đội Mobile Profile',
      reviewer: 'Ban Thành Viên',
      reviewComment: 'Chỉnh sửa hồ sơ nhanh chóng, đồng bộ ngay lập tức sang danh bạ điện tử.',
      fixAssignee: 'Kỹ sư Frontend',
      solution: 'Tối ưu modal chỉnh sửa nhanh QuickProfileEditModal và nạp ảnh đại diện.',
      postStatus: 'đã xong',
    },
    {
      parent: 'CEO 1983 Mobile App',
      child: '[NODE-APP-012] Cài Đặt Hệ Thống, Trợ Lý AI & Quên Mật Khẩu',
      desc: 'Bảo mật tài khoản, đổi mật khẩu, luồng quên mật khẩu tự động gửi mã/mật khẩu mới về email và báo về CRM.',
      status: 'đã xong',
      assignee: 'Đội Security & AI',
      reviewer: 'Quản Trị Viên',
      reviewComment: 'Đã hoàn thiện luồng Quên mật khẩu: tự sinh mật khẩu mới, gửi mail SMTP và tạo thông báo CRM.',
      fixAssignee: 'Kỹ sư Backend Auth',
      solution: 'Nâng cấp auth.service.ts và màn hình forgot-password.tsx điều hướng thông minh.',
      postStatus: 'đã xong',
    },
    {
      parent: 'CEO 1983 Mobile App',
      child: '[NODE-APP-013] Danh Sách Ưu Đãi QR Động & Nơi Sử Dụng',
      desc: 'Kho ưu đãi độc quyền dành cho hội viên CEO 1983, mã QR ưu đãi động dùng tại các cơ sở kinh doanh của hội viên.',
      status: 'đã xong',
      assignee: 'Đội Đối Tác Ưu Đãi',
      reviewer: 'Ban Xúc Tiến Thương Mại',
      reviewComment: 'Ưu đãi phong phú, hiển thị rõ địa điểm áp dụng kèm link bản đồ dẫn đường.',
      fixAssignee: 'Kỹ sư Content',
      solution: 'Tích hợp bảng public.perks và cơ chế sinh mã QR động có thời hạn.',
      postStatus: 'đã xong',
    },
    {
      parent: 'CEO 1983 Mobile App',
      child: '[NODE-APP-014] Cầu Nối Native Capacitor Android / iOS',
      desc: 'Đóng gói ứng dụng di động Native (APK/AAB/IPA), tích hợp Web Push Notification, xử lý rung haptic và phím quay lại cứng.',
      status: 'đã xong',
      assignee: 'Đội Native Mobile',
      reviewer: 'Ban Công Nghệ',
      reviewComment: 'Ứng dụng chạy mượt trên Android và iOS, nhận push notification tức thì.',
      fixAssignee: 'Kỹ sư Capacitor',
      solution: 'Cấu hình Capacitor Push Notifications và Service Worker an toàn.',
      postStatus: 'đã xong',
    },
    {
      parent: 'CEO 1983 Mobile App',
      child: '[NODE-APP-015] Phân Hệ Gặp Gỡ Kết Nối B2B 1-on-1',
      desc: 'Đặt lịch hẹn gặp gỡ trực tiếp hoặc online giữa 2 doanh nhân, quản lý lời mời đã nhận/đã gửi, ghi nhận kết quả deal.',
      status: 'đã xong',
      assignee: 'Đội B2B Matching',
      reviewer: 'Ban Xúc Tiến Thương Mại',
      reviewComment: 'Thúc đẩy giao lưu chiều sâu 1-on-1, theo dõi tiến độ đàm phán thương vụ.',
      fixAssignee: 'Kỹ sư Fullstack',
      solution: 'Tạo bảng b2b_connections và quy trình xác nhận 3 trạng thái pending/accepted/rejected.',
      postStatus: 'đã xong',
    },
    {
      parent: 'CEO 1983 Mobile App',
      child: '[NODE-APP-016] Đào Tạo Di Động & Phòng Họp Trực Tuyến',
      desc: 'Xem danh sách khóa đào tạo, tải tài liệu chuyên đề và tham gia phòng họp video call trao đổi trực tiếp trên app.',
      status: 'đã xong',
      assignee: 'Đội Đào Tạo Mobile',
      reviewer: 'Ban Đào Tạo CLB',
      reviewComment: 'Hội viên có thể học tập và trao đổi mọi lúc mọi nơi ngay trên điện thoại.',
      fixAssignee: 'Kỹ sư WebRTC',
      solution: 'Tích hợp phòng họp video Jitsi nhúng tương thích màn hình di động.',
      postStatus: 'đã xong',
    },
    {
      parent: 'CEO 1983 Mobile App',
      child: '[NODE-APP-017] Lịch Hoạt Động & Nhắc Hẹn Thời Gian Thực',
      desc: 'Lịch biểu tổng hợp sự kiện, họp ban, cuộc gặp 1-on-1 cá nhân, cài đặt nhắc hẹn độc lập (15p, 1h, 1 ngày, 3 ngày).',
      status: 'đã xong',
      assignee: 'Đội Calendar & Notification',
      reviewer: 'Ban Thư Ký',
      reviewComment: 'Tự động nhắc lịch trước giờ họp, không bỏ sót các hoạt động quan trọng của Hội.',
      fixAssignee: 'Kỹ sư Engine Nhắc Lịch',
      solution: 'Active Reminder Engine tự động quét và kích hoạt push notification khi đến giờ hẹn.',
      postStatus: 'đã xong',
    },

    // --- PHÂN HỆ HẠ TẦNG DÙNG CHUNG CORE ---
    {
      parent: 'Hạ Tầng Dùng Chung (Core)',
      child: '[NODE-CORE-001] Xác Thực JWT & Guard RBAC',
      desc: 'Hệ thống bảo vệ API bằng JSON Web Token, giải mã vai trò và quyền ban chuyên môn, chống truy cập trái phép.',
      status: 'đã xong',
      assignee: 'Đội Core Backend',
      reviewer: 'Kiến Trúc Sư Hệ Thống',
      reviewComment: 'Bảo mật cao, hỗ trợ token refresh tự động và quản lý phiên đăng nhập an toàn.',
      fixAssignee: 'Kỹ sư Bảo Mật',
      solution: 'Triển khai JwtAuthGuard và RolesGuard tích hợp xác thực 2 phân hệ CRM & App.',
      postStatus: 'đã xong',
    },
    {
      parent: 'Hạ Tầng Dùng Chung (Core)',
      child: '[NODE-CORE-002] CSDL PostgreSQL 15 & Prisma ORM',
      desc: 'Cơ sở dữ liệu quan hệ lưu trữ 100% dữ liệu thực tế, migration an toàn, đồng bộ song song 2 môi trường DB.',
      status: 'đã xong',
      assignee: 'Đội Database Administrator',
      reviewer: 'Kiến Trúc Sư CSDL',
      reviewComment: 'Đã đồng bộ cả 2 database (14.225.217.232:5436 và 113.20.107.184:6432) nhất quán.',
      fixAssignee: 'Kỹ sư CSDL',
      solution: 'Chạy scripts/sync_both_dbs.cjs đồng bộ cấu trúc và 4 tài khoản cốt lõi.',
      postStatus: 'đã xong',
    },
    {
      parent: 'Hạ Tầng Dùng Chung (Core)',
      child: '[NODE-CORE-003] Realtime Socket.IO Gateway',
      desc: 'Cổng truyền thông thời gian thực: Thông báo chuông, cập nhật tin nhắn chat, đổi số liệu thống kê realtime.',
      status: 'đã xong',
      assignee: 'Đội Realtime Gateway',
      reviewer: 'Kiến Trúc Sư Mạng',
      reviewComment: 'Kết nối ổn định, tự động reconnect khi chuyển vùng mạng di động.',
      fixAssignee: 'Kỹ sư Socket.IO',
      solution: 'Triển khai EventsGateway NestJS với cơ chế room phân quyền theo mã hội viên.',
      postStatus: 'đã xong',
    },
    {
      parent: 'Hạ Tầng Dùng Chung (Core)',
      child: '[NODE-CORE-004] Triển Khai Độc Lập Mobile App (Port 5002)',
      desc: 'Docker Compose đóng gói độc lập Frontend Mobile App CEO 1983 trên cổng 5002, kết nối backend nội bộ.',
      status: 'đã xong',
      assignee: 'Đội DevOps & Cloud',
      reviewer: 'Trưởng Nhóm DevOps',
      reviewComment: 'Build độc lập, không ảnh hưởng tới Web CRM khi nâng cấp hay bảo trì.',
      fixAssignee: 'Kỹ sư DevOps',
      solution: 'Duy trì docker-compose deploy/ceo1983 và kịch bản fast-deploy.ps1.',
      postStatus: 'đã xong',
    },
    {
      parent: 'Hạ Tầng Dùng Chung (Core)',
      child: '[NODE-CORE-005] Triển Khai Độc Lập Web CRM (Port 5005)',
      desc: 'Docker Compose đóng gói độc lập Frontend Web CRM Quản trị trên cổng 5005, tối ưu SSR và nén assets.',
      status: 'đã xong',
      assignee: 'Đội DevOps & Cloud',
      reviewer: 'Trưởng Nhóm DevOps',
      reviewComment: 'Container chạy mượt mà, thời gian phản hồi dưới 100ms.',
      fixAssignee: 'Kỹ sư DevOps',
      solution: 'Duy trì docker-compose deploy/crm và môi trường biến .env.crm chuẩn mực.',
      postStatus: 'đã xong',
    },
    {
      parent: 'Hạ Tầng Dùng Chung (Core)',
      child: '[NODE-CORE-006] Nginx VPS Reverse Proxy & SSL Let\'s Encrypt',
      desc: 'Cấu hình Reverse Proxy Nginx trên máy chủ VPS, định tuyến SSL 2 subdomain: crm.ceo1983.viconnect.vn & app.ceo1983.viconnect.vn.',
      status: 'đã xong',
      assignee: 'Đội Hạ Tầng Mạng',
      reviewer: 'Quản Trị Mạng VPS',
      reviewComment: 'Chứng chỉ SSL hợp lệ, định tuyến chuẩn xác tới các container backend và frontend.',
      fixAssignee: 'Kỹ sư Mạng VPS',
      solution: 'Cấu hình Nginx upstream proxy_pass tới 5002 và 5005 kèm WebSocket upgrade.',
      postStatus: 'đã xong',
    },
  ];

  // 5. Thêm các dòng dữ liệu vào Sheet
  featureList.forEach((item, index) => {
    const rowNum = index + 5;
    const row = sheet.getRow(rowNum);

    row.getCell(1).value = index + 1; // STT
    row.getCell(2).value = item.parent; // Chức năng cha
    row.getCell(3).value = item.child; // Chức năng con
    row.getCell(4).value = item.desc; // Mô tả chi tiết
    row.getCell(5).value = item.status; // Trạng thái
    row.getCell(6).value = item.assignee; // Người thực hiện
    row.getCell(7).value = item.reviewer; // Người đánh giá
    row.getCell(8).value = item.reviewComment; // Nội dung đánh giá
    row.getCell(9).value = item.fixAssignee; // Người tiếp nhận sửa
    row.getCell(10).value = item.solution; // Giải pháp
    row.getCell(11).value = item.postStatus; // Trạng thái sau tiếp nhận

    // Định dạng dòng chẵn / lẻ (Zebra striping)
    const isEven = index % 2 === 0;
    const bgArgb = isEven ? 'FFFFFFFF' : 'FFF8FAFC'; // Trắng / Xám nhạt thanh lịch

    for (let c = 1; c <= 11; c++) {
      const cell = row.getCell(c);
      cell.font = { name: 'Calibri', size: 10, color: { argb: 'FF0F172A' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: bgArgb },
      };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      };
      // Canh lề
      if (c === 1 || c === 5 || c === 11) {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      } else if (c === 2 || c === 6 || c === 7 || c === 9) {
        cell.alignment = { vertical: 'middle', horizontal: 'left' };
      } else {
        cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
      }
    }

    // Tô màu nổi bật cho cột Trạng Thái (Cột 5 và 11)
    const statusCell = row.getCell(5);
    const postStatusCell = row.getCell(11);

    const formatStatusBadge = (cell, statusVal) => {
      if (statusVal === 'đã xong') {
        cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF166534' } }; // Xanh lá đậm
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDCFCE7' } }; // Xanh lá nhạt
      } else if (statusVal === 'đang xử lý') {
        cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF92400E' } }; // Vàng nâu
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF3C7' } }; // Vàng nhạt
      } else {
        cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF3730A3' } }; // Indigo
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0E7FF' } }; // Indigo nhạt
      }
    };

    formatStatusBadge(statusCell, item.status);
    formatStatusBadge(postStatusCell, item.postStatus);

    // Data validation cho dropdown trạng thái
    statusCell.dataValidation = {
      type: 'list',
      allowBlank: false,
      formulae: ['"khởi tạo,đang xử lý,đã xong"'],
    };
    postStatusCell.dataValidation = {
      type: 'list',
      allowBlank: false,
      formulae: ['"khởi tạo,đang xử lý,đã xong"'],
    };

    row.height = 36;
  });

  // 6. Dòng Tổng Kết
  const totalRowNum = featureList.length + 5;
  const summaryRow = sheet.getRow(totalRowNum);
  sheet.mergeCells(`A${totalRowNum}:D${totalRowNum}`);
  const sumLabelCell = summaryRow.getCell(1);
  sumLabelCell.value = `TỔNG CỘNG: ${featureList.length} TÍNH NĂNG TOÀN HỆ THỐNG`;
  sumLabelCell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
  sumLabelCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF003B95' } };
  sumLabelCell.alignment = { vertical: 'middle', horizontal: 'center' };

  for (let c = 5; c <= 11; c++) {
    const cCell = summaryRow.getCell(c);
    cCell.value = c === 5 || c === 11 ? `${featureList.length} ĐÃ XONG` : '—';
    cCell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
    cCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF003B95' } };
    cCell.alignment = { vertical: 'middle', horizontal: 'center' };
  }
  summaryRow.height = 28;

  // 7. Xuất file ra đĩa
  const outputDocDir = path.resolve('document');
  const outputPublicDir = path.resolve('apps/ceo1983_app_fe/public/docs');
  if (!fs.existsSync(outputDocDir)) fs.mkdirSync(outputDocDir, { recursive: true });
  if (!fs.existsSync(outputPublicDir)) fs.mkdirSync(outputPublicDir, { recursive: true });

  const fileName = 'BANG_DANH_GIA_VA_THEO_DOI_CHUC_NANG_CEO1983.xlsx';
  const docFilePath = path.join(outputDocDir, fileName);
  const publicFilePath = path.join(outputPublicDir, fileName);

  await workbook.xlsx.writeFile(docFilePath);
  fs.copyFileSync(docFilePath, publicFilePath);

  console.log(`[OK] Đã tạo thành công file Excel đánh giá chức năng:`);
  console.log(` - ${docFilePath}`);
  console.log(` - ${publicFilePath}`);
}

generateFeatureEvaluationExcel().catch((err) => {
  console.error('[Error] Lỗi khi tạo file Excel:', err);
  process.exit(1);
});

