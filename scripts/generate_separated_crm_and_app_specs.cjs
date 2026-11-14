/**
 * SCRIPT XUẤT BẢN ĐẶC TẢ TÁCH BIỆT RÕ RÀNG:
 * 1. BẢN ĐẶC TẢ WEB CRM QUẢN TRỊ (HANOIBA) - File Word & PDF
 * 2. BẢN ĐẶC TẢ ỨNG DỤNG DI ĐỘNG CEO 1983 (MOBILE APP) - File Word & PDF
 * Đồng bộ sang:
 *   - document/
 *   - apps/ceo1983_app_fe/public/docs/
 *   - document/notebooklm/
 */

const fs = require('fs');
const path = require('path');
const { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  Table, 
  TableRow, 
  TableCell, 
  AlignmentType, 
  WidthType,
  ShadingType,
  Header,
  Footer,
  PageNumber
} = require('docx');
const { chromium } = require('playwright');

// ==========================================
// 1. DANH SÁCH CHỨC NĂNG DÀNH RIÊNG CHO WEB CRM QUẢN TRỊ
// ==========================================
const CRM_FEATURES = [
  {
    stt: 1,
    id: "NODE-CRM-AUTH-001",
    name: "Đăng Nhập Quản Trị Viên & Kiểm Tra Quyền RBAC",
    target: "Chủ tịch, Ban Điều Hành, Trưởng 7 Ban, Ban Thư Ký, Kế toán, Admin",
    flow: "1. Người dùng truy cập /login trên trình duyệt máy tính.\n2. Nhập Email/Username và Mật khẩu quản trị.\n3. Backend kiểm tra mã băm mật khẩu bcrypt và truy vấn bảng user_roles.\n4. Cấp JWT Token mang thông tin vai trò chức vụ trong CLB và ma trận quyền hạn CRM.\n5. Điều hướng vào thẳng Bàn điều hành (/dashboard). Từ chối nếu là tài khoản hội viên thông thường không có quyền truy cập CRM.",
    api: "POST /auth/login\nPOST /auth/refresh-token",
    db: "public.vione_users (email, password_hash, status)\npublic.user_roles (user_id, role_id)\npublic.roles (code='ADMIN'|'BOARD'|'SECRETARY'|'ACCOUNTANT')\npublic.members (full_name, executive_role, department)",
    notes: "Chỉ những tài khoản được gán vai trò quản trị mới được phép truy cập phân hệ Web CRM."
  },
  {
    stt: 2,
    id: "NODE-CRM-AUTH-002",
    name: "Thu Hồi Phiên & Đăng Xuất An Toàn",
    target: "Quản trị viên CRM",
    flow: "1. Bấm nút 'Đăng xuất' tại menu hồ sơ quản trị góc trên bên phải.\n2. Thu hồi Refresh Token, xóa sạch localStorage/sessionStorage/cookies.\n3. Ngắt kết nối Socket.IO bảo mật.\n4. Điều hướng về màn hình đăng nhập /login.",
    api: "POST /auth/logout",
    db: "public.vione_users (last_logout_at)\npublic.audit_logs (user_id, action='LOGOUT_CRM', ip_address)",
    notes: "Bảo đảm phiên quản trị được đóng hoàn toàn, chống tái sử dụng token."
  },
  {
    stt: 3,
    id: "NODE-CRM-AUTH-003",
    name: "Đổi Mật Khẩu Tài Khoản Quản Trị",
    target: "Cán bộ quản trị CRM",
    flow: "1. Truy cập mục Hồ sơ -> Đổi mật khẩu.\n2. Nhập mật khẩu hiện tại, mật khẩu mới và xác nhận (tối thiểu 8 ký tự, có ký tự hoa, số, đặc biệt).\n3. Backend so khớp hash mật khẩu cũ, băm mật khẩu mới với salt 10 và cập nhật CSDL.",
    api: "PUT /auth/change-password",
    db: "public.vione_users (password_hash, updated_at)",
    notes: "Bắt buộc kiểm tra mật khẩu hiện tại trước khi ghi nhận mật khẩu mới."
  },
  {
    stt: 4,
    id: "NODE-CRM-AUTH-004",
    name: "Tiếp Nhận Yêu Cầu Quên Mật Khẩu & Cấp Mới Mật Khẩu Cho Hội Viên",
    target: "Ban Thư Ký & Quản trị viên tối cao",
    flow: "1. Khi Hội viên bấm quên mật khẩu trên App, hệ thống tạo cảnh báo về Trung tâm Thông báo CRM (/notifications).\n2. Quản trị viên bấm vào cảnh báo, hệ thống mở modal 'Cấp lại mật khẩu' cho tài khoản đó.\n3. Quản trị viên nhập mật khẩu mới và bấm xác nhận.\n4. Hệ thống lưu hash mới vào CSDL, tự động bắn Email và tin nhắn Zalo OA ZNS thông báo mật khẩu mới cho Hội viên.",
    api: "POST /admin/reset-password\nPOST /zalo/send-zns",
    db: "public.vione_users (password_hash, reset_token)\npublic.notifications (type='FORGOT_PASSWORD_REQUEST')\npublic.mail_templates (key='RESET_PASSWORD_TEMPLATE')",
    notes: "Xác thực kép: Quản trị viên phê duyệt trên CRM, hệ thống tự động dispatch thông báo mật khẩu mới."
  },
  {
    stt: 5,
    id: "NODE-CRM-001",
    name: "Tổng Quan & Bàn Điều Hành CLB (Executive Dashboard)",
    target: "Chủ tịch, Ban Điều Hành, Ban Thư Ký, Kế toán",
    flow: "1. Hiển thị 4 thẻ KPI Gradient thời gian thực: Tổng hội viên chính thức, Doanh nghiệp kết nối, Tổng quỹ thu/chi, Sự kiện trong tháng.\n2. Lịch biểu công tác tháng trực quan tích hợp lịch sự kiện và họp ban.\n3. Biểu đồ tài chính nhanh.\n4. Cảnh báo thông minh: Hội viên sắp hết hạn niên liễm trong 30 ngày hoặc nợ đọng hội phí.",
    api: "GET /admin/dashboard-stats\nGET /admin/recent-activities",
    db: "public.members (status, joined_date, dues_expired_at)\npublic.events (start_date, status)\npublic.meetings (meeting_date)\npublic.income_records (amount)\npublic.expense_records (amount)",
    notes: "100% dữ liệu thống kê từ PostgreSQL, tuyệt đối không dùng số liệu mock."
  },
  {
    stt: 6,
    id: "NODE-CRM-002",
    name: "Trung Tâm Thống Kê Chuyên Sâu 5 Danh Mục (Analytics Hub)",
    target: "Chủ tịch, Ban Điều Hành, Ban Thư Ký",
    flow: "1. Menu Thống kê CLB (icon BarChart3 trên Sidebar).\n2. Thống kê theo 5 danh mục: 1. Doanh thu B2B, 2. Phát triển Hội viên, 3. Kết nối & Trao cơ hội, 4. Tỷ lệ điểm danh, 5. Đào tạo nâng cao.\n3. 4 thẻ KPI chỉ số, Biểu đồ ComposedChart (cột doanh thu, đường tăng trưởng).\n4. Bục vinh danh Top 3 Giver nằm gọn trên 1 hàng ngang, Top 1 avatar viền vàng.\n5. Xuất báo cáo chi tiết ra file Excel và in ấn bản A4 PDF chuẩn mực.",
    api: "GET /admin/analytics-summary\nGET /admin/analytics/industry-breakdown\nGET /admin/analytics/top-performers",
    db: "public.members (points)\npublic.opportunities (value_amount, status='CLOSED')\npublic.departments (name)\npublic.events (id)\npublic.event_registrations (check_in_status='CHECKED_IN')",
    notes: "Bộ lọc thời gian linh hoạt: Tuần này, Tháng này, Quý này, Năm nay."
  },
  {
    stt: 7,
    id: "NODE-CRM-003",
    name: "Quản Trị Danh Bạ Hội Viên 360 Độ (Member Directory)",
    target: "Ban Thư Ký, Ban Hội Viên, Admin",
    flow: "1. Bảng CustomTable (chỉ hiện tối đa 2 dòng, text dài hiện dấu ba chấm và tooltip toàn văn).\n2. Tìm kiếm nhanh theo Họ tên, SĐT, Email, Công ty, Ban chuyên môn, Trạng thái.\n3. Xem chi tiết hồ sơ 360 độ: lịch sử tham gia, đóng phí, cơ hội đã trao.\n4. Thêm mới, chỉnh sửa thông tin cá nhân hội viên.\n5. Phê duyệt hồ sơ đăng ký mới từ App di động.\n6. Xóa hội viên với 2 chế độ: Xóa công ty trước hoặc Xóa cascade tất cả.\n7. Xuất file Excel danh bạ và Nhập danh bạ hàng loạt từ Excel.",
    api: "GET /members\nPOST /members\nPUT /members/:id\nDELETE /members/:id\nPATCH /members/:id/approve\nPOST /members/import-excel\nGET /members/export-excel",
    db: "public.members (full_name, phone, email, status, dues_expired_at, department)\npublic.companies (company_name)\npublic.vione_users (status)",
    notes: "Tất cả bảng dữ liệu trên CRM dùng chung 1 component CustomTable chuẩn hóa."
  },
  {
    stt: 8,
    id: "NODE-CRM-004",
    name: "Quản Trị Doanh Nghiệp Thành Viên (Companies)",
    target: "Ban Thư Ký, Ban B2B, Admin",
    flow: "1. Danh mục Doanh nghiệp (/companies): Tên công ty (cột 3), Mã số thuế, Người đại diện, Ngành nghề, Vốn điều lệ, Quy mô nhân sự, Trụ sở, Website, Logo.\n2. Xem chi tiết pháp nhân, danh sách sản phẩm đăng bán trên sàn B2B.\n3. Thêm mới, cập nhật thông tin doanh nghiệp hoặc thay đổi trạng thái xác thực.",
    api: "GET /companies\nPOST /companies\nPUT /companies/:id\nDELETE /companies/:id",
    db: "public.companies (company_name, tax_code, legal_representative, industry, capital, employee_scale, address, website_url, logo_url)\npublic.members (id, full_name)",
    notes: "Quản lý dữ liệu pháp nhân độc lập, liên kết 1-N với hội viên."
  },
  {
    stt: 9,
    id: "NODE-CRM-005",
    name: "Quản Lý Tài Khoản & Gán Ban Chuyên Môn Trực Tiếp",
    target: "Ban Thư Ký, Quản trị viên tối cao",
    flow: "1. Nằm trong nhóm Phân Quyền trên Sidebar (thay thế chức năng cũ).\n2. Tên tài khoản hiển thị sạch, khử bỏ hoàn toàn ký tự @ thừa.\n3. Tìm kiếm theo tên, email, username, trạng thái khóa/mở.\n4. Mở modal chỉnh sửa gán trực tiếp vai trò quản trị (Admin, Thư ký, Kế toán, Hội viên) và gán 1 trong 7 Ban chuyên môn trực tiếp vào CSDL PostgreSQL (không dùng mock).\n5. Khóa hoặc mở khóa tài khoản tức thì.",
    api: "GET /accounts\nPATCH /members/:id/role-dept\nPATCH /users/:id/status\nPOST /accounts/create",
    db: "public.vione_users (email, status)\npublic.members (executive_role, department)\npublic.user_roles (user_id, role_id)\npublic.departments (code, name)",
    notes: "Dữ liệu lưu trực tiếp vào CSDL, nạp lại tự động khi F5."
  },
  {
    stt: 10,
    id: "NODE-CRM-006",
    name: "Ma Trận Phân Quyền RBAC 2 Tab & Tự Động Đồng Bộ Tên Sidebar",
    target: "Chủ tịch CLB & Super Admin",
    flow: "1. Màn hình Phân quyền (/permissions) hiển thị 2 Tab riêng biệt: Tab 1 'Phân Quyền CRM Web' và Tab 2 'Phân Quyền App Mobile'.\n2. Khi Sidebar hoặc route đổi tên, danh mục tính năng tự động đồng bộ tên mới nhất.\n3. Quản trị viên tick chọn phân quyền (Xem, Thêm, Sửa, Xóa, Duyệt, Xuất file) cho từng vai trò.\n4. Bấm 'Lưu ma trận phân quyền', lưu toàn bộ quyền hạn vào PostgreSQL.\n5. Backend RBAC Guard kiểm tra quyền trước mọi API endpoint, chặn 403 Forbidden nếu không đủ quyền.",
    api: "GET /admin/roles\nPOST /admin/roles/permissions\nPUT /admin/roles/:id\nGET /admin/permissions",
    db: "public.roles (code, name)\npublic.permissions (code, module, platform)\npublic.role_permissions (role_id, permission_id)\npublic.user_roles (user_id, role_id)",
    notes: "Tách bạch quyền quản trị CRM và quyền tính năng di động."
  },
  {
    stt: 11,
    id: "NODE-CRM-007",
    name: "Quản Trị Sự Kiện, Vé, Xếp Chỗ & Bắn Mạng Lưới",
    target: "Ban Sự Kiện, Ban Điều Hành, Ban Thư Ký",
    flow: "1. Tạo sự kiện: Tiêu đề, Banner/Poster, Địa điểm, Thời gian, Sơ đồ chỗ ngồi, Agenda chi tiết theo khung giờ, Giới hạn vé, Giá vé.\n2. Quản lý danh sách đăng ký vé (Hội viên / Khách vãng lai).\n3. Xếp chỗ ngồi & Gỡ/Đổi chỗ: Khi gỡ hoặc đổi vị trí ngồi, hệ thống tự động gửi Email và Zalo OA thông báo vị trí chỗ ngồi mới.\n4. Điểm danh quét mã QR vé tham dự thời gian thực.\n5. Tải poster sự kiện về máy.\n6. Tải ảnh/chụp ảnh trực tiếp tối đa 5 ảnh & video tư liệu lưu lịch sử sự kiện.\n7. Nút 'Bắn Mạng Lưới': Tự động phát thanh bài viết lên Bảng tin Mạng lưới App Mobile (hiển thị đường link QR thay vì ảnh QR thô).",
    api: "GET /events\nPOST /events\nPUT /events/:id\nDELETE /events/:id\nPOST /events/:id/seats\nDELETE /events/:id/seats/:seatId\nPOST /events/:id/checkin\nPOST /feed/broadcast-event\nPOST /events/:id/media",
    db: "public.events (title, banner_url, poster_url, agenda_json, ticket_price, max_attendees)\npublic.event_registrations (ticket_code, seat_number, check_in_status)\npublic.event_seats (seat_code, member_id)\npublic.feed_posts (type='EVENT', link_url, media_urls)",
    notes: "Gỡ hoặc đổi chỗ ngồi tự động kích hoạt gửi Email + Zalo OA thông báo vị trí mới."
  },
  {
    stt: 12,
    id: "NODE-CRM-008",
    name: "Quản Lý Cuộc Họp Ban & Gặp Gỡ CLB",
    target: "Ban Điều Hành, Trưởng 7 Ban, Ban Thư Ký",
    flow: "1. Lên lịch họp BĐH hoặc 7 ban chuyên môn: Tiêu đề, Nội dung, Thời gian, Thành phần triệu tập.\n2. Bản đồ tương tác chọn vị trí ghim đỏ (OpenStreetMap/Nominatim).\n3. Gửi thông báo triệu tập họp tới các thành viên liên quan.\n4. Điểm danh quét mã QR cuộc họp.\n5. Đính kèm biên bản họp, tài liệu số và tải lên tối đa 5 ảnh/video tư liệu.\n6. Tự động đồng bộ sang mục Hoạt động trên app và phát thanh lên Mạng lưới.",
    api: "GET /meetings\nPOST /meetings\nPUT /meetings/:id\nDELETE /meetings/:id\nPOST /meetings/:id/checkin\nPOST /feed/broadcast-meeting\nPOST /meetings/:id/media",
    db: "public.meetings (title, department_code, meeting_date, location, lat, lng, agenda, minutes_file_url)\npublic.meeting_attendees (member_id, is_attended)\npublic.feed_posts (type='MEETING', media_urls)",
    notes: "Đồng bộ nhãn [Họp Ban] sang danh mục Hoạt động trên ứng dụng di động."
  },
  {
    stt: 13,
    id: "NODE-CRM-009",
    name: "Quản Lý Thu Ngân Sách, Phí Niên Liễm & Vé Sự Kiện",
    target: "Ban Tài Chính - Kiểm Tra, Kế toán CLB, Thủ quỹ",
    flow: "1. Danh mục phiếu thu: Thu phí niên liễm, Thu tiền vé sự kiện, Thu tài trợ, Thu khác.\n2. Tạo phiếu thu mới, chọn Hội viên/Doanh nghiệp nộp, số tiền, ngày thu, chứng từ.\n3. Tạo mã thanh toán VietQR động chuẩn SeABank (tự động số tiền và nội dung chuyển khoản).\n4. Bảng co dãn cột chuột kiểu Excel, lọc theo khoảng ngày, danh mục thu.\n5. Nhập phiếu thu từ Excel và Xuất báo cáo sổ quỹ thu ra Excel.",
    api: "GET /finance/income\nPOST /finance/income\nPUT /finance/income/:id\nDELETE /finance/income/:id\nPOST /finance/income/import-excel\nGET /finance/vietqr-payload",
    db: "public.income_records (member_id, category, amount, payment_method, reference_code, transaction_date, receipt_url, status='COMPLETED')\npublic.members (full_name)\npublic.events (title)",
    notes: "100% dữ liệu tài chính lưu trữ thực tế trong PostgreSQL."
  },
  {
    stt: 14,
    id: "NODE-CRM-010",
    name: "Quản Lý Chi Ngân Sách, Tạm Ứng & Hoàn Ứng",
    target: "Ban Tài Chính - Kiểm Tra, Kế toán, Chủ tịch",
    flow: "1. Lập phiếu đề xuất chi: Chi tổ chức sự kiện, Chi hoạt động các ban, Chi quà tặng, Chi vận hành.\n2. Quản lý quy trình Tạm ứng kinh phí và Hoàn ứng tiền thừa sau sự kiện.\n3. Quy trình duyệt chi 2 cấp: Kế toán thẩm định chứng từ -> Chủ tịch duyệt chi điện tử.\n4. Đính kèm hóa đơn đỏ VAT, phiếu chi có chữ ký và ủy nhiệm chi ngân hàng.\n5. Nhập/Xuất sổ quỹ chi ra Excel.",
    api: "GET /finance/expenses\nPOST /finance/expenses\nPUT /finance/expenses/:id\nDELETE /finance/expenses/:id\nPOST /finance/expenses/import-excel\nPATCH /finance/expenses/:id/approve",
    db: "public.expense_records (applicant_id, approver_id, category, amount, advance_amount, refund_amount, status='PENDING'|'APPROVED', invoice_url)\npublic.members (full_name)",
    notes: "Quản lý chặt chẽ tạm ứng và hoàn ứng đảm bảo minh bạch tài chính."
  },
  {
    stt: 15,
    id: "NODE-CRM-011",
    name: "Báo Cáo Tài Chính Tổng Hợp & Quyết Toán Quỹ",
    target: "Chủ tịch, Ban Thường Trực, Ban Tài Chính",
    flow: "1. Tổng hợp dữ liệu Thu - Chi thời gian thực từ PostgreSQL (100% real data, không mock).\n2. Biểu đồ ComposedChart đa tầng: Dòng tiền Thu, Dòng tiền Chi, Đường thặng dư quỹ lũy kế.\n3. Biểu đồ tròn PieChart phân bổ cơ cấu chi phí thực tế và tỷ trọng nguồn thu.\n4. Bảng phân tích chi tiết nguồn thu theo 4 hạng tài trợ: Kim Cương, Vàng, Bạc, Đồng.\n5. Xuất báo cáo quyết toán quỹ phục vụ Đại hội Hội viên và kiểm toán định kỳ.",
    api: "GET /finance/summary-report\nGET /finance/flow-analysis\nGET /finance/sponsor-tiers-report",
    db: "public.income_records (amount, transaction_date, category)\npublic.expense_records (amount, expense_date, category, status='APPROVED')\npublic.sponsor_packages (tier, price)",
    notes: "Số liệu quyết toán phản ánh thời gian thực số dư khả dụng của quỹ CLB."
  },
  {
    stt: 16,
    id: "NODE-CRM-012",
    name: "Quản Lý Công Việc & Giao Việc Ban Chuyên Môn",
    target: "Chủ tịch, Ban Điều Hành, Trưởng Ban, Thành viên Ban",
    flow: "1. Bấm 'Tạo công việc mới': Tiêu đề, Mô tả, Hạn hoàn thành, Mức độ ưu tiên (Khẩn cấp, Cao, Trung bình, Thấp).\n2. Chọn giao cho Cá nhân hoặc toàn bộ Ban chuyên môn.\n3. Đính kèm file đa định dạng (Word, Excel, PDF, Ảnh).\n4. Người nhận việc nhận ngay thông báo nêu rõ người giao: '[Giao việc từ ${creatorDisplayName}]'.\n5. Nút 'Xem file' (icon Con mắt) mở Universal Document Viewer đọc trực tiếp Excel SheetJS đa sheet, PDF nhúng, ảnh Lightbox mà không cần tải file về.\n6. Người nhận việc cập nhật tiến độ (Todo, In Progress, Completed). Dữ liệu lưu 100% vào CSDL.",
    api: "GET /tasks\nPOST /tasks\nPUT /tasks/:id\nDELETE /tasks/:id\nPATCH /tasks/:id/status\nPOST /tasks/:id/attachments",
    db: "public.tasks (creator_id, title, description, priority, deadline, status, department_id)\npublic.task_assignees (task_id, member_id)\npublic.task_attachments (task_id, file_name, file_url, file_size, mime_type)\npublic.notifications (title, content)",
    notes: "Không dùng mock data; hiển thị đích danh người giao việc và tích hợp xem file trực tiếp."
  },
  {
    stt: 17,
    id: "NODE-CRM-013",
    name: "Quản Trị Nhà Tài Trợ & Quyền Lợi Thương Hiệu",
    target: "Ban Tài Chính, Ban Sự Kiện, Ban Truyền Thông",
    flow: "1. Quản lý danh bạ Nhà tài trợ đồng hành theo năm và theo sự kiện.\n2. Cấu hình 4 gói tài trợ: Kim Cương, Vàng, Bạc, Đồng kèm kinh phí và quyền lợi chi tiết.\n3. Theo dõi bàn giao quyền lợi thương hiệu: Logo banner sân khấu, vị trí trên poster, vé VIP, chiếu video doanh nghiệp, gian hàng B2B ưu tiên.\n4. Lưu trữ hợp đồng tài trợ và xuất phiếu thu tương ứng.",
    api: "GET /sponsors\nPOST /sponsors\nPUT /sponsors/:id\nDELETE /sponsors/:id\nGET /sponsors/packages",
    db: "public.sponsors (sponsor_name, logo_url, tier, contract_url, status)\npublic.sponsor_packages (code, name, tier, default_amount, benefits_json)\npublic.events (title)",
    notes: "Đồng bộ hiển thị logo nhà tài trợ lên poster sự kiện và sàn B2B."
  },
  {
    stt: 18,
    id: "NODE-CRM-014",
    name: "Kho Tài Liệu CLB & Universal Document Viewer",
    target: "Ban Thư Ký, Toàn thể Hội viên",
    flow: "1. Lưu trữ tài liệu số hóa: Điều lệ, Quy chế, Biên bản họp, Biểu mẫu gia nhập, Quyết định bổ nhiệm.\n2. Universal Document Viewer xem trực tiếp trên web:\n   - File Word (.docx): Bản in A4 chuẩn xác.\n   - File Excel (.xlsx, .xls): Bảng tính đa sheet SheetJS, lọc tìm kiếm ô.\n   - File PDF: Nhúng tương tác phóng to/thu nhỏ, xoay trang, in ấn.\n   - File Ảnh và Code: Trình xem độ phân giải cao.\n3. Phân quyền xem: Công khai toàn thể hội viên hoặc giới hạn nội bộ Ban Điều Hành.",
    api: "GET /documents\nPOST /documents\nPUT /documents/:id\nDELETE /documents/:id\nGET /documents/:id/download",
    db: "public.documents (title, category, file_url, file_size, file_type, access_level, uploader_id)\npublic.members (full_name)",
    notes: "Đọc mọi tài liệu văn phòng trực tiếp trên trình duyệt không cần tải về."
  },
  {
    stt: 19,
    id: "NODE-CRM-015",
    name: "Quản Trị Biểu Quyết Trực Tuyến & Quay Số May Mắn (Lucky Draw)",
    target: "Ban Tổ Chức, Ban Sự Kiện, Ban Thư Ký",
    flow: "1. Quản trị Biểu quyết: Tạo câu hỏi biểu quyết/bầu cử, thời gian mở/đóng, hình thức đơn chọn/đa chọn.\n2. Vòng quay số may mắn (Lucky Draw): Nạp giải thưởng thực tế từ CSDL nhà tài trợ (Kim Cương, Vàng, Bạc, Đồng).\n3. Tải danh sách người đã check-in thực tế tại sự kiện.\n4. Vòng quay số ngẫu nhiên, tự động loại trừ người đã trúng thưởng trước đó.\n5. Khi có người trúng giải, tự động trừ số lượng giải trong CSDL và gửi email/thông báo chúc mừng.",
    api: "GET /polls\nPOST /polls\nPUT /polls/:id\nDELETE /polls/:id\nGET /admin/lucky-draw-config\nPOST /admin/lucky-draw/spin\nPUT /sponsors/prizes/:id",
    db: "public.polls (title, description, start_time, end_time, is_active)\npublic.poll_options (option_text, vote_count)\npublic.poll_votes (member_id, voted_at)\npublic.sponsors_prizes (prize_name, quantity, remaining_quantity, winner_id)",
    notes: "Tự động loại trừ người trúng giải trùng lặp và cập nhật số lượng giải thưởng realtime."
  },
  {
    stt: 20,
    id: "NODE-CRM-016",
    name: "Quản Lý Bản Tin & Truyền Thông CLB",
    target: "Ban Truyền Thông, Ban Thư Ký",
    flow: "1. Soạn thảo bài viết tin tức, hoạt động CLB qua trình soạn thảo Rich-Text.\n2. Đính kèm hình ảnh tiêu biểu, video phóng sự.\n3. Thiết lập chế độ: Bản nháp hoặc Xuất bản chính thức.\n4. Khi xuất bản, hệ thống tự động đồng bộ bài viết sang Bảng tin Mạng lưới App Mobile.\n5. Cơ chế Seed on Read bảo đảm dữ liệu tin tức luôn đầy đủ.",
    api: "GET /news\nPOST /news\nPUT /news/:id\nDELETE /news/:id\nPOST /news/:id/publish",
    db: "public.news (title, slug, summary, content, thumbnail_url, status='DRAFT'|'PUBLISHED', published_at)\npublic.feed_posts (type='NEWS', title, content, thumbnail_url)",
    notes: "Tự động tạo bài viết trên mạng xã hội nội bộ khi xuất bản tin tức."
  },
  {
    stt: 21,
    id: "NODE-CRM-017",
    name: "Gia Hạn Hội Viên & Xử Lý Nợ Phí Niên Liễm",
    target: "Ban Hội Viên, Ban Tài Chính, Ban Thư Ký",
    flow: "1. Quản lý danh sách hội viên theo chu kỳ niên liễm hàng năm (1 năm / 2 năm).\n2. Phân loại tự động 3 nhóm: Sắp hết hạn trong 30 ngày, Quá hạn nợ phí, Đã gia hạn.\n3. Bấm gửi thông báo gia hạn: Tự động dispatch Email và tin nhắn Zalo OA ZNS kèm mã VietQR nộp phí.\n4. Sau khi nộp phí thành công, kế toán xác nhận, hệ thống cộng thêm 365 ngày vào hạn dùng và kích hoạt lại quyền lợi VIP.",
    api: "GET /members/renewals\nPOST /members/:id/send-renewal-notice\nPOST /members/:id/renew",
    db: "public.members (dues_expired_at, status)\npublic.income_records (category='MEMBERSHIP_DUES', amount, status)\npublic.vione_users (status)",
    notes: "Khử prefix mã gia hạn, truy vấn linh hoạt tránh lỗi ép kiểu UUID."
  },
  {
    stt: 22,
    id: "NODE-CRM-018",
    name: "Quản Trị Đào Tạo Đa Thức & Bắn Mạng Lưới Khóa Học",
    target: "Ban Đào Tạo, Ban Điều Hành, Giảng viên",
    flow: "1. Tạo khóa đào tạo doanh nghiệp: Tên khóa học, Giảng viên, Hình thức (Online, Offline, Hybrid), Lịch học, Giáo trình.\n2. Cấu hình phòng học trực tuyến Video Call (Jitsi Meet/Zoom nhúng).\n3. Quản lý danh sách học viên đăng ký.\n4. Tải poster khóa học và đính kèm tối đa 5 ảnh/video tư liệu.\n5. Nút 'Bắn Mạng Lưới': Tự động phát bài giới thiệu khóa học lên Bảng tin Mạng lưới App Mobile kèm link đăng ký.",
    api: "GET /trainings\nPOST /trainings\nPUT /trainings/:id\nDELETE /trainings/:id\nGET /trainings/:id/attendees\nPOST /feed/broadcast-training\nPOST /trainings/:id/media",
    db: "public.trainings (title, instructor_name, format, start_time, room_url, syllabus_url, max_students)\npublic.training_attendees (member_id, status)\npublic.feed_posts (type='TRAINING', link_url, media_urls)",
    notes: "Tích hợp phòng học trực tuyến và kết nối trực tiếp với mạng xã hội hội viên."
  },
  {
    stt: 23,
    id: "NODE-CRM-019",
    name: "Nhật Ký Lịch Sử Thao Tác Toàn Hệ Thống (Audit Logs)",
    target: "Chủ tịch CLB, Ban Kiểm Tra, Super Admin",
    flow: "1. Tự động ghi lại toàn bộ thao tác nhạy cảm: Đăng nhập, Đổi mật khẩu, Thêm/Sửa/Xóa user, Phê duyệt chi quỹ, Gán quyền RBAC, Phát hành thông báo.\n2. Mỗi bản ghi lưu: User ID, Tên, Hành động, Module, Địa chỉ IP, Trình duyệt, Thời gian.\n3. Tìm kiếm, lọc theo ngày tháng, người thao tác.\n4. Xuất file Excel nhật ký thao tác phục vụ kiểm toán.",
    api: "GET /admin/audit-logs\nGET /admin/audit-logs/export-excel",
    db: "public.audit_logs (user_id, user_email, action, module, details_json, ip_address, user_agent, created_at)\npublic.members (full_name)",
    notes: "Nhật ký bất biến bảo đảm an ninh và kiểm toán hệ thống."
  },
  {
    stt: 24,
    id: "NODE-CRM-020",
    name: "Trao Cơ Hội Giao Thương Đa Đối Tượng & Hội Nhóm",
    target: "Ban B2B, Ban Điều Hành, Hội viên Doanh nhân",
    flow: "1. Tạo cơ hội kinh doanh / gói thầu lớn cần liên danh hợp tác.\n2. Chọn trao cho nhiều người cùng lúc (Multi-select) hoặc trao cho toàn thể một Ban chuyên môn.\n3. Tạo các liên kết độc lập và gửi thông báo tới từng hội viên nhận.\n4. Theo dõi tiến độ kết nối và giá trị giao dịch phát sinh.",
    api: "POST /opportunities/batch-share\nGET /opportunities/recipients-pool",
    db: "public.opportunities (giver_id, title, description, value_amount, status)\npublic.opportunity_shares (opportunity_id, receiver_id, status)\npublic.members (full_name, department)",
    notes: "Mở rộng kết nối kinh doanh quy mô lớn cho các gói thầu liên ngành."
  },
  {
    stt: 25,
    id: "NODE-CRM-021",
    name: "Theme Studio, Icon Picker 14 Tính Năng & Đồng Bộ Giao Diện",
    target: "Chủ tịch CLB, Ban Truyền Thông, Quản trị viên",
    flow: "1. Theme Studio với 5 VIP Presets: Hoàng Gia, Dạ Hội, Thép Titan, Sen Vàng, Mùa Lễ Hội.\n2. Bộ chọn Icon Picker linh hoạt cho 14 tính năng chính.\n3. Khung hình Live Preview Mobile Frame mô phỏng giao diện thực tế.\n4. Khi kích hoạt chủ đề (ví dụ Mùa Lễ Hội), hệ thống lập tức đồng bộ biến CSS (--festival-bg-image) thời gian thực xuống toàn bộ Web CRM và App Mobile.",
    api: "GET /admin/landing-templates\nPOST /admin/landing-templates\nPOST /admin/themes/active",
    db: "public.landing_templates (name, theme_key, festival_bg_url, is_active)\npublic.system_settings (key='active_theme_config', value_json)",
    notes: "Đồng bộ giao diện thời gian thực trên cả hai nền tảng Web CRM và Mobile App."
  },
  {
    stt: 26,
    id: "NODE-CRM-022",
    name: "Trung Tâm Thông Báo Quản Trị Hệ Thống (Admin Notification Center)",
    target: "Chủ tịch, Ban Thư Ký, Quản trị viên",
    flow: "1. Tự động quét cảnh báo quản trị: Hồ sơ hội viên mới chờ duyệt, Hội viên quá hạn hội phí, Yêu cầu quên mật khẩu cần cấp lại, Báo cáo sự cố.\n2. 4 thẻ KPI Gradient và các Tab bộ lọc trạng thái.\n3. Bảng CustomTable sắp xếp theo mức độ ưu tiên và thời gian.\n4. Bấm trực tiếp vào thông báo để chuyển hướng đến tác vụ xử lý.",
    api: "GET /admin/notifications\nPOST /admin/notifications\nPATCH /admin/notifications/:id\nDELETE /admin/notifications/:id",
    db: "public.notifications (user_id, title, content, type, is_read, action_url, created_at)\npublic.members (full_name)",
    notes: "Tích hợp huy hiệu số đếm thông báo chưa đọc trên Sidebar."
  },
  {
    stt: 27,
    id: "NODE-CRM-023",
    name: "Quản Lý Landing Web Dynamic & Cấu Hình Subdomain",
    target: "Ban Truyền Thông, Quản trị viên Kỹ thuật",
    flow: "1. Quản trị trang đích giới thiệu CLB tái hiện 2 mẫu Pinterest:\n   - Mẫu 1 (Timed Cards Opening): Slide chuyển tự động bằng con lăn/cảm ứng, tiến trình 5s, split typography.\n   - Mẫu 2 (Startup Mobile Showcase): Mockup iPhone 16 Pro mô phỏng giao diện app CEO 1983, dải ruy băng 4 chỉ số vàng (4+ năm, 1.983+ CEO, 500+ DN, 100+ Tỷ).\n2. Quản lý menu đa tầng (Dynamic Tree Header Menu) kích hoạt sub-screens.\n3. Gán tên miền phụ (*.ceo1983.viconnect.vn) và API Connector ánh xạ dữ liệu động từ CLB.",
    api: "GET /admin/landing-webs\nPOST /admin/landing-webs\nPUT /admin/landing-webs/:id\nDELETE /admin/landing-webs/:id\nPOST /admin/landing-webs/:id/apply-subdomain\nGET /public/landing-webs/:slugOrSubdomain",
    db: "public.app_settings (key='crm_landing_webs_configs', value_json)",
    notes: "Tạo nhiều trang đích sự kiện với subdomain riêng biệt."
  },
  {
    stt: 28,
    id: "NODE-CRM-024",
    name: "Quản Lý Mẫu Thư Mời Đa Kênh & Trình Tạo Thư Nhắc Nhở Tùy Biến",
    target: "Ban Thư Ký, Ban Truyền Thông, Quản trị viên",
    flow: "1. Quản lý mẫu thông báo đa kênh: Gửi Email HTML v3, Thông báo đẩy App CEO 1983, Tin nhắn Zalo OA ZNS (bỏ VNPay, Zalo Mini App, ZBS).\n2. Trình thiết lập mẫu thư nhắc nhở động (CustomReminderTemplateModal): Tạo mẫu 'Hôm nay trong app CEO 1983 có gì', tự do thêm/bớt trường thông tin động:\n   - Textarea: Cho mô tả dài.\n   - Datetime: Cho ngày giờ diễn ra.\n   - Price: Cho chi phí, giá vé, hội phí.\n   - Mã QR: Cho mã QR điểm danh hoặc chuyển khoản.\n   - Text: Cho văn bản ngắn.\n3. Hỗ trợ nhập SĐT thử nghiệm bằng icon (+) và lựa chọn dữ liệu sự kiện/cuộc họp/hội viên real data từ CSDL để phát thanh.",
    api: "GET /admin/mail-templates\nPUT /admin/mail-templates/:key\nPOST /zalo/send-zns\nGET /zalo/template-configs\nPUT /zalo/template-configs/:templateCode\nPOST /notifications/broadcast-custom",
    db: "public.mail_templates (key, title, subject, content_html)\npublic.app_settings (key='crm_invitation_templates' | 'zalo_oa_config')\npublic.notifications (type, content)",
    notes: "Linh hoạt tùy biến trường dữ liệu nhắc nhở và kiểm thử gửi tức thời."
  }
];

// ==========================================
// 2. DANH SÁCH CHỨC NĂNG DÀNH RIÊNG CHO MOBILE APP CEO 1983
// ==========================================
const APP_FEATURES = [
  {
    stt: 1,
    id: "NODE-APP-AUTH-001",
    name: "Đăng Nhập Di Động Đa Phương Thức (Email, Phone, Google OAuth, Apple ID)",
    target: "Hội viên Doanh nhân CEO 1983",
    flow: "1. Mở app CEO 1983, truy cập màn hình đăng nhập (/association/login).\n2. Nhập Email hoặc Số điện thoại cùng Mật khẩu cá nhân.\n3. Hỗ trợ đăng nhập 1 chạm bằng Google OAuth hoặc Apple ID (trên iOS).\n4. Backend cấp phát Access Token và Refresh Token, lưu trữ bảo mật trên thiết bị di động.\n5. Tải nạp hồ sơ cá nhân, đồng bộ trạng thái hội viên và chuyển thẳng vào Trang Chủ App.",
    api: "POST /auth/login\nPOST /auth/google\nPOST /auth/apple\nPOST /auth/refresh-token",
    db: "public.vione_users (email, phone, password_hash, status)\npublic.members (full_name, avatar_url, executive_role, department)",
    notes: "Tối ưu đăng nhập nhanh, hỗ trợ sinh trắc học FaceID/Vân tay qua Capacitor."
  },
  {
    stt: 2,
    id: "NODE-APP-AUTH-002",
    name: "Đổi Mật Khẩu Cá Nhân Trên Ứng Dụng",
    target: "Hội viên Doanh nhân",
    flow: "1. Vào mục Cá nhân -> Cài đặt hệ thống -> Đổi mật khẩu.\n2. Nhập mật khẩu hiện tại, mật khẩu mới và xác nhận mật khẩu mới.\n3. Backend kiểm tra hash cũ, cập nhật hash mới vào CSDL và trả về thông báo thành công.",
    api: "PUT /auth/change-password",
    db: "public.vione_users (password_hash, updated_at)",
    notes: "Đảm bảo an toàn tài khoản di động, tự động cập nhật phiên đăng nhập."
  },
  {
    stt: 3,
    id: "NODE-APP-AUTH-003",
    name: "Quên Mật Khẩu & Gửi Yêu Cầu Cấp Lại Về CRM",
    target: "Hội viên quên mật khẩu",
    flow: "1. Tại màn đăng nhập, bấm 'Quên mật khẩu?'.\n2. Nhập Email hoặc SĐT đã đăng ký trong danh bạ CLB.\n3. Hệ thống gửi yêu cầu về Trung tâm Thông báo trên Web CRM.\n4. Sau khi Quản trị viên cấp lại mật khẩu mới, hệ thống tự động bắn Email và tin nhắn Zalo OA chứa mật khẩu mới về số điện thoại của hội viên.\n5. Hội viên đăng nhập bằng mật khẩu mới và đổi lại mật khẩu cá nhân.",
    api: "POST /auth/forgot-password",
    db: "public.vione_users (reset_token)\npublic.notifications (type='FORGOT_PASSWORD_REQUEST')\npublic.mail_templates (key='RESET_PASSWORD_TEMPLATE')",
    notes: "Xử lý khép kín: Hội viên yêu cầu -> Admin phê duyệt -> Tự động nhận mật khẩu qua SMS/Zalo/Email."
  },
  {
    stt: 4,
    id: "NODE-APP-ONBOARD-001",
    name: "Đăng Ký Hội Viên Mới & Hồ Sơ Doanh Nghiệp (Member Onboarding)",
    target: "Doanh nhân đăng ký gia nhập CLB",
    flow: "1. Bấm 'Đăng ký gia nhập CLB CEO 1983'.\n2. Điền đầy đủ thông tin chuẩn xác: Họ tên, Email, Số điện thoại, Tên công ty, Mã số thuế, Ngành nghề, Quy mô nhân sự, Vị trí chức danh, Avatar (chụp ảnh trực tiếp hoặc tải từ thư viện máy).\n3. Hệ thống kiểm tra tính duy nhất của Email, SĐT, MST trong CSDL.\n4. Tạo hồ sơ hội viên trạng thái 'PENDING' và gửi cảnh báo về CRM để Ban Thư Ký xét duyệt.\n5. Khi được duyệt, nhận email chào mừng và kích hoạt tài khoản sử dụng app.",
    api: "POST /auth/register\nPOST /members/onboard",
    db: "public.vione_users (email, phone, role_code='MEMBER')\npublic.members (full_name, status='PENDING')\npublic.companies (company_name, tax_code, industry, employee_scale)\npublic.notifications (type='NEW_MEMBER_REGISTRATION')",
    notes: "Lưu trữ 100% dữ liệu đã đăng ký vào CSDL, không bỏ sót trường thông tin."
  },
  {
    stt: 5,
    id: "NODE-APP-001",
    name: "Trang Chủ Ticker Nến Realtime & Shortcut Tiện Ích",
    target: "Hội viên Doanh nhân",
    flow: "1. Hội viên mở app, trang chủ hiển thị Biểu đồ nến Ticker biến động doanh số B2B realtime.\n2. Hiển thị Banner sự kiện nổi bật và dải phím tắt thông minh (Cơ hội, Danh bạ, Tin nhắn, Sự kiện, Thẻ QR).\n3. Modal chào mừng hội viên cá nhân hóa (WelcomeMemberModal) khi vào app đầu ngày.\n4. Tự động đồng bộ hình nền chủ đề Lễ Hội (--festival-bg-image) từ CRM.\n5. Các nút bấm chuẩn hóa màu nền #FFFFFF với chữ đen sang trọng, dễ đọc.",
    api: "GET /association/home-stats\nGET /admin/landing-templates/active",
    db: "public.opportunities (value_amount, created_at)\npublic.landing_templates (theme_key, festival_bg_url, is_active)\npublic.members (full_name, avatar_url, points)",
    notes: "Trải nghiệm mượt mà 60fps chuẩn native ứng dụng di động."
  },
  {
    stt: 6,
    id: "NODE-APP-002",
    name: "Thẻ Hội Viên VIP Số & Mã QR Cá Nhân Bảo Mật",
    target: "Hội viên Doanh nhân",
    flow: "1. Thẻ danh thiếp điện tử VIP mang màu sắc nhận diện CLB (Đỏ - Vàng - Xanh Obsidian).\n2. Thông tin: Ảnh đại diện, Họ tên, Chức vụ trong ban, Logo công ty ở góc phải trên.\n3. Mã QR cá nhân hóa độc bản: Chạm vào phóng to toàn màn hình để trao đổi danh thiếp 1 chạm.\n4. Công tắc bật/tắt quyền riêng tư: Ẩn hoặc hiện Số điện thoại và Email khi đối tác quét thẻ.\n5. Tích hợp camera quét nhanh mã QR danh thiếp của đối tác để lưu danh bạ kết nối.",
    api: "GET /association/card-profile\nPUT /association/card-privacy",
    db: "public.members (full_name, phone, email, is_phone_private, is_email_private)\npublic.companies (company_name, logo_url)\npublic.member_cards (card_code, qr_url)",
    notes: "Bảo vệ thông tin liên lạc cá nhân theo cài đặt riêng tư của hội viên."
  },
  {
    stt: 7,
    id: "NODE-APP-003",
    name: "Trang Quét Danh Thiếp Công Khai Bảo Mật (Public Web Card)",
    target: "Đối tác quét mã QR, Khách hàng bên ngoài",
    flow: "1. Đối tác quét mã QR trên thẻ số hoặc mở link /card/:code.\n2. Giao diện trang trọng, đồng bộ nhận diện thương hiệu với thẻ nội bộ.\n3. Kiểm tra cài đặt quyền riêng tư: Nếu hội viên ẩn SĐT/Email, hệ thống hiển thị '🔒 Đã ẩn theo cài đặt riêng tư của hội viên'.\n4. Các nút tương tác: 'Lưu Danh Bạ' (tải file vCard .vcf), 'Ghé thăm Website' công ty, 'Đăng ký kết nối'.",
    api: "GET /card/public/:code",
    db: "public.members (full_name, avatar_url, bio, phone, email, is_phone_private, is_email_private)\npublic.companies (company_name, tax_code, website_url, logo_url, address)",
    notes: "Tối ưu tải trang cực nhanh trên mọi trình duyệt di động."
  },
  {
    stt: 8,
    id: "NODE-APP-004",
    name: "Danh Bạ Hội Viên & Bản Đồ 2D Google Maps Dẫn Đường",
    target: "Hội viên Doanh nhân",
    flow: "1. Danh bạ số 100% doanh nhân thành viên chính thức của CLB.\n2. 2 chế độ hiển thị: Danh sách và Bản đồ 2D.\n3. Bản đồ 2D Google Maps (Leaflet tile mt1.google.com): Ghim vị trí trụ sở công ty các hội viên trên bản đồ với 2 phạm vi 'Tổng thể' và 'Cá nhân'.\n4. Chạm vào ghim xem thông tin doanh nghiệp, ngành nghề và bấm 'Chỉ đường' để kích hoạt Google Maps dẫn đường trực tiếp từ vị trí GPS hiện tại đến công ty đối tác.\n5. Triệt tiêu hoàn toàn lỗi màn hình đen 3D, vận hành mượt mà.",
    api: "GET /association/members\nGET /association/members/locations",
    db: "public.members (full_name, avatar_url, phone, department, executive_role)\npublic.companies (company_name, industry, address, lat, lng)",
    notes: "Tích hợp GPS định vị vị trí hiện tại và chỉ đường chính xác theo thời gian thực."
  },
  {
    stt: 9,
    id: "NODE-APP-005",
    name: "Cơ Hội Giao Thương B2B Strip 3 Thẻ Ngang",
    target: "Hội viên Doanh nhân",
    flow: "1. Màn hình giao thương thiết kế dải 3 thẻ thống kê ngang trực quan: 'Tổng chia sẻ', 'Deal đã chốt', 'Tôi share đi' (tuyệt đối không để biểu đồ nặng).\n2. Đăng cơ hội hợp tác kinh doanh mới: Tiêu đề nhu cầu, Mô tả chi tiết, Trị giá dự kiến, Lĩnh vực ngành nghề.\n3. Hội viên nhận cơ hội bấm tiếp nhận, trao đổi và cập nhật trạng thái (Đang kết nối -> Đàm phán -> Ký kết thành công -> Báo cáo doanh số).\n4. Nút chuyển hướng sang màn hình Thống kê Analytics chuyên sâu.",
    api: "GET /association/opportunities\nPOST /association/opportunities\nPUT /association/opportunities/:id/status",
    db: "public.opportunities (giver_id, receiver_id, title, description, value_amount, status, closed_at)\npublic.members (full_name, avatar_url)",
    notes: "Ghi nhận doanh số chốt deal thực tế phục vụ vinh danh Top Giver của CLB."
  },
  {
    stt: 10,
    id: "NODE-APP-006",
    name: "Trung Tâm Thống Kê Hội Viên 5 Phân Loại Nghiệp Vụ",
    target: "Hội viên Doanh nhân, Ban Điều Hành",
    flow: "1. Thống kê hiệu quả hoạt động cá nhân và toàn CLB theo 5 chỉ số: Doanh thu kết nối, Cơ hội trao đi, Tỷ lệ tham dự sự kiện/họp, Khóa đào tạo hoàn thành, Khách mời giới thiệu.\n2. Biểu đồ ComposedChart trực quan cột-đường sinh động.\n3. Bục vinh danh Top 3 Giver được gom gọn trên 1 hàng ngang, Top 1 avatar viền vàng đặc trưng.\n4. Bấm nút xuất báo cáo thành tích ra file Excel hoặc in ấn file A4 PDF.",
    api: "GET /association/opportunities/report",
    db: "public.opportunities (giver_id, receiver_id, value_amount, status)\npublic.members (full_name, avatar_url)\npublic.event_registrations (member_id, check_in_status)",
    notes: "Thiết kế chuẩn Mobile-first, hiển thị sắc nét trên mọi thiết bị di động."
  },
  {
    stt: 11,
    id: "NODE-APP-007",
    name: "Giao Thương B2B, Gian Hàng Của Tôi & Danh Mục Quan Tâm",
    target: "Hội viên Doanh nhân",
    flow: "1. Đổi tên danh mục 'Sàn giao thương nội bộ' và 'Chợ giao thương' thành tên chuẩn mực: 'Giao thương'.\n2. Sàn Giao thương: Trưng bày sản phẩm/dịch vụ của các doanh nghiệp thành viên. Lọc theo ngành nghề, tìm kiếm nhanh và nút bấm nhắn tin trực tiếp với chủ doanh nghiệp.\n3. Gian hàng của tôi: Mỗi doanh nghiệp được đăng tối đa 5 sản phẩm/dịch vụ (huy hiệu X/5 sản phẩm để chống spam).\n4. Mỗi thẻ sản phẩm có Icon 3 chấm bấm vào mở Menu tùy chọn tinh gọn: Chỉnh sửa sản phẩm, Xóa sản phẩm, Chia sẻ liên kết sản phẩm.\n5. Đặc biệt có Danh mục 'Ai đang quan tâm sản phẩm': Hiển thị danh sách chính xác các hội viên đã bấm quan tâm hoặc gửi yêu cầu kết nối với sản phẩm của chính tài khoản đó đăng.",
    api: "GET /association/products\nPOST /association/products\nPUT /association/products/:id\nDELETE /association/products/:id\nGET /association/products/:id/interested-users",
    db: "public.products (company_id, member_id, name, description, price, discount_price, image_urls, category, status)\npublic.product_interests (product_id, interested_member_id, note, created_at)\npublic.members (full_name, phone, email, avatar_url)\npublic.companies (company_name, logo_url)",
    notes: "Menu 3 chấm tinh tế tiết kiệm diện tích và cung cấp danh mục khách hàng tiềm năng nội bộ."
  },
  {
    stt: 12,
    id: "NODE-APP-008",
    name: "Sự Kiện & Hoạt Động (Đăng Ký Vé, Tải Poster & Up Ảnh Trực Tiếp)",
    target: "Hội viên Doanh nhân",
    flow: "1. Đổi tên giao diện thành 'Sự kiện & Hoạt động'.\n2. Phân loại chuẩn 2 tab danh mục: Tab Sự kiện (Gala, Đại hội, Tọa đàm) và Tab Hoạt động (Kết nối B2B giữa 2 tài khoản, Chương trình đào tạo từ CRM). Loại bỏ các tab trùng lặp.\n3. Chuẩn hóa hiển thị: Duy nhất 1 nút 'Xem tất cả' và nút này tự động ẩn đi khi đang chọn ở tab 'Tất cả'.\n4. Hội viên bấm 'Đăng ký tham gia' nhận vé điện tử kèm mã QR check-in.\n5. Có chức năng 'Tải poster' đối với các sự kiện chính thức.\n6. Trong quá trình diễn ra sự kiện, có nút 'Tải ảnh' hoặc 'Chụp ảnh trực tiếp' từ điện thoại để đính kèm vào sự kiện (giới hạn tối đa 5 ảnh, có tính năng up video), lưu vào lịch sử sự kiện và tự động đẩy bài sang màn hình Mạng lưới.",
    api: "GET /association/events-and-meetings\nPOST /events/:id/register\nPOST /events/:id/cancel\nPOST /events/:id/media\nGET /events/:id/my-ticket",
    db: "public.events (title, banner_url, poster_url, start_date, end_date, location, status)\npublic.meetings (title, meeting_date)\npublic.trainings (title, start_time)\npublic.event_registrations (event_id, member_id, ticket_code, status)\npublic.feed_posts (type='EVENT_MEDIA', media_urls, author_id)",
    notes: "Nút chụp ảnh trực tiếp và đăng tải ảnh tư liệu đa phương tiện trong sự kiện."
  },
  {
    stt: 13,
    id: "NODE-APP-009",
    name: "Biểu Quyết Trực Tuyến Gắn Với Sự Kiện / Cuộc Họp",
    target: "Hội viên Doanh nhân tham dự",
    flow: "1. Danh sách các phiên biểu quyết, bầu cử đang mở gắn liền với Sự kiện hoặc Cuộc họp mà hội viên tham gia.\n2. Hội viên đọc nội dung tờ trình, chọn phương án tán thành/không tán thành/ý kiến khác.\n3. Bấm 'Gửi phiếu biểu quyết', hệ thống ghi nhận phiếu bầu vào CSDL PostgreSQL.\n4. Cập nhật tỷ lệ phần trăm (%) biểu quyết thời gian thực trên màn hình ứng dụng và màn hình chiếu lớn tại sự kiện.",
    api: "GET /association/polls\nPOST /association/polls/:id/vote",
    db: "public.polls (event_id, meeting_id, title, is_active)\npublic.poll_options (option_text, vote_count)\npublic.poll_votes (poll_id, option_id, member_id, voted_at)",
    notes: "Mỗi hội viên chỉ được bỏ phiếu một lần duy nhất cho mỗi phiên biểu quyết."
  },
  {
    stt: 14,
    id: "NODE-APP-010",
    name: "Bảng Tin Mạng Lưới Doanh Nhân & Tương Tác Xã Hội",
    target: "Toàn thể Hội viên Doanh nhân",
    flow: "1. Mạng xã hội doanh nhân CEO 1983: Hội viên đăng bài viết chia sẻ kinh nghiệm điều hành, kết nối kinh doanh, đính kèm hình ảnh và video.\n2. Tương tác đa dạng: Thả cảm xúc (Like, Tym, Claps), Bình luận trao đổi dưới bài viết.\n3. Tiếp nhận các bài phát thanh tự động từ CRM ('Bắn Mạng Lưới' từ Sự kiện, Cuộc họp, Khóa đào tạo).\n4. Đặc thù bảo mật: Khi bài viết có mã QR tham dự/điểm danh, hệ thống tự động hiển thị dưới dạng đường link an toàn, không hiển thị mã QR thô trên màn hình Mạng lưới.\n5. Hiển thị huy hiệu điểm danh '@HọTên [✓ Đã Check-in]' tạo không khí sôi động.",
    api: "GET /association/feed\nPOST /association/feed/posts\nPOST /association/feed/posts/:id/comments\nPOST /association/feed/posts/:id/react\nDELETE /association/feed/posts/:id",
    db: "public.feed_posts (author_id, type, title, content, link_url, media_urls, likes_count, comments_count)\npublic.feed_comments (post_id, author_id, content)\npublic.feed_reactions (post_id, member_id, reaction_type)",
    notes: "Mã QR được hiển thị dưới dạng đường link bảo mật trên màn Mạng lưới."
  },
  {
    stt: 15,
    id: "NODE-APP-011",
    name: "Hồ Sơ Cá Nhân & Quản Trị Hồ Sơ Doanh Nghiệp Thành Viên",
    target: "Hội viên Doanh nhân",
    flow: "1. Quản lý thông tin hồ sơ cá nhân 360 độ: Ảnh đại diện, Họ tên, Ngày sinh, Giới tính, Số điện thoại, Email, Tiểu sử lãnh đạo.\n2. Hồ sơ Doanh nghiệp thành viên: Logo, Tên doanh nghiệp, Mã số thuế, Ngành nghề, Quy mô vốn/nhân sự, Trụ sở, Sản phẩm dịch vụ chủ lực.\n3. Xem Hợp đồng hội viên điện tử, tình trạng đóng hội phí niên liễm và thẻ VIP liên kết.\n4. Tải lên và cập nhật ảnh đại diện sắc nét thông qua camera điện thoại.",
    api: "GET /association/profile\nPUT /association/profile\nPOST /upload/avatar",
    db: "public.members (full_name, avatar_url, bio, phone, email, dues_expired_at)\npublic.companies (company_name, tax_code, industry, employee_scale, website_url, logo_url)\npublic.vione_users (email)",
    notes: "Lấy chuẩn 100% dữ liệu đã đăng ký của hội viên từ CSDL, không bị thiếu sót trường."
  },
  {
    stt: 16,
    id: "NODE-APP-012",
    name: "Cài Đặt Hệ Thống, Bảo Mật Tài Khoản & Hỗ Trợ 24/7",
    target: "Hội viên Doanh nhân",
    flow: "1. Tùy chỉnh ngôn ngữ hiển thị (Tiếng Việt / English), chuyển đổi giao diện Sáng / Tối (Light/Dark mode).\n2. Quản lý cấu hình thông báo đẩy (Bật/tắt thông báo sự kiện, tin nhắn, nhắc hẹn).\n3. Đổi mật khẩu bảo mật tài khoản di động.\n4. Khối Thông tin hỗ trợ 24/7: Hotline Ban Thư Ký CLB, Email tiếp nhận phản hồi và Hướng dẫn sử dụng app.",
    api: "PUT /auth/change-password\nGET /system/support-info",
    db: "public.vione_users (password_hash)\npublic.system_settings (key='support_contact', value_json)",
    notes: "Hỗ trợ thay đổi mật khẩu và quản lý bảo mật cá nhân thuận tiện."
  },
  {
    stt: 17,
    id: "NODE-APP-013",
    name: "Kho Ưu Đãi Đặc Quyền Doanh Nhân (VIP Perks) & Mã QR Động",
    target: "Hội viên Doanh nhân",
    flow: "1. Kho đặc quyền ưu đãi dành riêng cho hội viên CEO 1983 do các doanh nghiệp thành viên và đối tác tài trợ cung cấp (Nhà hàng cao cấp, Khách sạn nghỉ dưỡng, Dịch vụ phòng vé, Tư vấn luật, Golf).\n2. Xem chi tiết ưu đãi, điều kiện áp dụng và địa điểm sử dụng kèm liên kết mở Google Maps chỉ đường trực tiếp.\n3. Mỗi ưu đãi cung cấp một mã QR động để nhân viên tại điểm chấp nhận ưu đãi quét xác thực quyền lợi VIP.",
    api: "GET /association/perks\nGET /association/perks/:id/qr",
    db: "public.perks (title, provider_company_id, discount_percent, description, location_address, lat, lng, valid_until, qr_code_secret, is_active)\npublic.companies (company_name, logo_url)",
    notes: "Mã QR động thay đổi theo thời gian đảm bảo tính xác thực của ưu đãi."
  },
  {
    stt: 18,
    id: "NODE-APP-014",
    name: "Cầu Nối Native Capacitor (Android/iOS) & Push Notifications",
    target: "Hội viên Doanh nhân sử dụng App Native",
    flow: "1. Cầu nối Native Capacitor tích hợp trên nền tảng Android (APK/AAB) và iOS (IPA).\n2. Tối ưu hóa giao diện di động: Tương thích vùng an toàn (Safe Area), thanh trạng thái (StatusBar) và phím Back cứng trên Android.\n3. Đăng ký nhận thông báo đẩy qua Firebase Cloud Messaging (FCM) và Web Push Service Worker.\n4. Khi có sự kiện mới, nhắc hẹn lịch họp, tin nhắn kết nối hoặc giao việc khẩn cấp, máy chủ tự động bắn Push Notification hiển thị trên màn hình khóa điện thoại.",
    api: "POST /notifications/subscribe\nPOST /notifications/unsubscribe\nPOST /notifications/test-push",
    db: "public.user_push_tokens (user_id, device_token, platform, is_active)\npublic.notifications (user_id, title, content, is_read)",
    notes: "Cung cấp trải nghiệm mượt mà 100% giống ứng dụng native thuần túy."
  },
  {
    stt: 19,
    id: "NODE-APP-015",
    name: "Gặp Gỡ Kết Nối B2B 1-on-1 Giữa Hai Tài Khoản",
    target: "Hội viên Doanh nhân",
    flow: "1. Phân hệ kết nối chuyên sâu giữa 2 hội viên: Hội viên tra cứu đối tác phù hợp trong danh bạ và bấm 'Đặt lịch hẹn kết nối 1-on-1'.\n2. Chọn ngày giờ gặp, hình thức (Gặp trực tiếp tại công ty, Cafe kết nối, hoặc Video Call online) và nội dung trao đổi mong muốn.\n3. Đối tác nhận được lời mời: Có thể Chấp nhận, Từ chối kèm lý do hoặc Đề xuất dời lịch hẹn.\n4. Sau buổi gặp, hai bên cập nhật kết quả trao đổi và ghi nhận giá trị cơ hội hợp tác phát sinh.",
    api: "GET /association/b2b-connect/my-meetings\nPOST /association/b2b-connect/request\nPATCH /association/b2b-connect/:id/status\nPOST /association/b2b-connect/:id/result",
    db: "public.b2b_connections (sender_id, receiver_id, scheduled_at, location_type, location_detail, agenda, status, result_notes, deal_value)\npublic.members (full_name, avatar_url)",
    notes: "Tự động đồng bộ lịch hẹn 1-on-1 đã xác nhận vào Lịch hoạt động cá nhân."
  },
  {
    stt: 20,
    id: "NODE-APP-016",
    name: "Đào Tạo Di Động & Phòng Họp Video Call Trực Tuyến",
    target: "Hội viên Doanh nhân",
    flow: "1. Danh sách các khóa đào tạo nâng cao năng lực quản trị doanh nghiệp từ Ban Đào Tạo CLB.\n2. Xem chi tiết lộ trình học, thông tin chuyên gia giảng dạy và tài liệu bài giảng số (file PDF/Word).\n3. Bấm 'Vào phòng học trực tuyến': Ứng dụng kích hoạt giao diện phòng họp Video Call trực tiếp trong app (nhúng Jitsi Meet SDK/WebRTC), hỗ trợ đầy đủ mic, camera, chat, giơ tay phát biểu mà không cần cài đặt phần mềm bên ngoài.",
    api: "GET /association/trainings\nPOST /trainings/:id/register\nGET /trainings/:id/room-token",
    db: "public.trainings (title, instructor_name, start_time, end_time, room_url, syllabus_url)\npublic.training_attendees (training_id, member_id, status)",
    notes: "Tham gia lớp học trực tuyến mượt mà ngay trên thiết bị di động."
  },
  {
    stt: 21,
    id: "NODE-APP-017",
    name: "Lịch Hoạt Động & Báo Thức Nhắc Hẹn Đa Kênh Tự Động",
    target: "Hội viên Doanh nhân",
    flow: "1. Mọi Sự kiện CLB, Cuộc họp Ban chuyên môn, Khóa đào tạo và Cuộc gặp B2B 1-on-1 mà hội viên đã đăng ký/chấp nhận tham gia đều được TỰ ĐỘNG LƯU VÀO LỊCH HOẠT ĐỘNG.\n2. Cung cấp 2 chế độ xem giao diện linh hoạt: Dạng Lưới lịch tháng (Grid Calendar) và Dạng Danh sách dòng thời gian (Timeline List).\n3. Nút 'Bật nhắc' (click lần 2 để bỏ nhắc) cho từng hoạt động.\n4. Hệ thống Active Reminder Engine hoạt động tự động:\n   - Nhắc hẹn tại Popup chào mừng ngay lần đầu mở app trong ngày.\n   - Bắn thông báo đẩy vào Trung tâm Thông báo trên app.\n   - Rung chuông phát thông báo Toast native trên màn hình điện thoại khi sắp đến giờ diễn ra hoạt động.",
    api: "GET /association/calendar/my-schedule\nPOST /association/calendar/toggle-reminder",
    db: "public.events (title, start_date)\npublic.meetings (title, meeting_date)\npublic.trainings (title, start_time)\npublic.b2b_connections (scheduled_at)\npublic.calendar_reminders (member_id, activity_type, activity_id, is_reminder_enabled, reminded_today)",
    notes: "Tích hợp đồng bộ tự động 4 nguồn hoạt động và nhắc hẹn đa tầng thông minh."
  },
  {
    stt: 22,
    id: "NODE-APP-EXT-001",
    name: "Quét Mã QR Sự Kiện Vãng Lai & Luồng Tự Động Gửi Email Khi QR Hết Hạn / Bị Xóa",
    target: "Khách mời vãng lai quét mã QR từ Poster, Mạng xã hội, Email hoặc Zalo",
    flow: "1. Khách quét mã QR sự kiện/đào tạo (được in trên banner standee, chia sẻ trên mạng xã hội hoặc gửi qua email/Zalo), trình duyệt mở trang đăng ký vé khách (/guest-event-register/$eventId).\n2. Cơ chế kiểm tra an toàn mã QR (QR Safety Guard):\n   - Nếu sự kiện/khóa đào tạo đã bị ban tổ chức XÓA khỏi hệ thống, hoặc mã QR ĐÃ HẾT HẠN, hoặc ĐÃ THAY ĐỔI:\n   - Khi khách bấm gửi biểu mẫu đăng ký, hệ thống lập tức chặn lại và tự động kích hoạt mail.service.ts (hàm sendQrChangedOrExpiredEmail) gửi ngay một email thông báo lịch sự tới hòm thư của khách: thông báo sự kiện đã thay đổi/mã QR không còn sử dụng được, đồng thời cung cấp thông tin liên hệ Ban Thư Ký CLB nếu muốn biết thêm chi tiết.\n   - Đồng thời trên màn hình đăng ký hiển thị thông báo trạng thái trang trọng, rõ ràng.\n3. Nếu mã QR còn hiệu lực hợp lệ:\n   - Hệ thống lưu thông tin đăng ký vào CSDL, sinh mã vé điện tử QR độc bản và tự động gửi email xác nhận tham dự kèm vé (sendEventTicketEmail) tới hộp thư của khách.",
    api: "GET /public/events/:id/details\nPOST /events/:id/guest-register",
    db: "public.events (title, start_date, location, status, is_deleted)\npublic.event_registrations (guest_name, guest_email, guest_phone, ticket_code, check_in_status)\npublic.mail_templates (key='QR_EXPIRED_OR_CHANGED' | 'EVENT_TICKET_CONFIRMATION')",
    notes: "Triệt tiêu hoàn toàn rủi ro quét nhầm mã QR cũ hoặc sự kiện đã hủy; tự động chăm sóc và hướng dẫn khách qua email."
  }
];

// Hàm tạo bảng Word chung
function createDocxTable(featuresList, titleHeader) {
  const primaryNavy = "003B95";
  const amberGold = "F59E0B";
  const lightGray = "F8FAFC";

  const tableRows = [
    new TableRow({
      tableHeader: true,
      children: [
        new TableCell({
          width: { size: 600, type: WidthType.DXA },
          shading: { fill: primaryNavy, type: ShadingType.CLEAR },
          children: [new Paragraph({ children: [new TextRun({ text: "STT", bold: true, color: "FFFFFF" })], alignment: AlignmentType.CENTER })]
        }),
        new TableCell({
          width: { size: 2400, type: WidthType.DXA },
          shading: { fill: primaryNavy, type: ShadingType.CLEAR },
          children: [new Paragraph({ children: [new TextRun({ text: "Tên Chức Năng & Mã Node", bold: true, color: "FFFFFF" })], alignment: AlignmentType.CENTER })]
        }),
        new TableCell({
          width: { size: 3800, type: WidthType.DXA },
          shading: { fill: primaryNavy, type: ShadingType.CLEAR },
          children: [new Paragraph({ children: [new TextRun({ text: "Mô Tả Luồng Nghiệp Vụ (Flow Chi Tiết)", bold: true, color: "FFFFFF" })], alignment: AlignmentType.CENTER })]
        }),
        new TableCell({
          width: { size: 2200, type: WidthType.DXA },
          shading: { fill: primaryNavy, type: ShadingType.CLEAR },
          children: [new Paragraph({ children: [new TextRun({ text: "API Endpoint Backend", bold: true, color: "FFFFFF" })], alignment: AlignmentType.CENTER })]
        }),
        new TableCell({
          width: { size: 2400, type: WidthType.DXA },
          shading: { fill: primaryNavy, type: ShadingType.CLEAR },
          children: [new Paragraph({ children: [new TextRun({ text: "Bảng CSDL PostgreSQL", bold: true, color: "FFFFFF" })], alignment: AlignmentType.CENTER })]
        }),
      ]
    })
  ];

  for (const item of featuresList) {
    const flowParas = item.flow.split('\n').map(line => 
      new Paragraph({ 
        children: [new TextRun({ text: line, size: 18 })],
        spacing: { after: 50 }
      })
    );

    if (item.notes) {
      flowParas.push(
        new Paragraph({
          children: [
            new TextRun({ text: "⭐ Ràng buộc: ", bold: true, color: amberGold, size: 17 }),
            new TextRun({ text: item.notes, italics: true, size: 17 })
          ],
          spacing: { before: 50 }
        })
      );
    }

    const apiParas = item.api.split('\n').map(line => {
      const parts = line.split(' ');
      const method = parts[0] || "";
      const endpoint = parts.slice(1).join(' ') || "";
      return new Paragraph({
        children: [
          new TextRun({ text: method + " ", bold: true, color: method === 'GET' ? "0284C7" : method === 'POST' ? "16A34A" : method === 'PUT' || method === 'PATCH' ? "D97706" : "DC2626", size: 17 }),
          new TextRun({ text: endpoint, size: 17 })
        ],
        spacing: { after: 30 }
      });
    });

    const dbParas = item.db.split('\n').map(line => {
      return new Paragraph({
        children: [new TextRun({ text: line, size: 17, font: "Consolas" })],
        spacing: { after: 30 }
      });
    });

    tableRows.push(
      new TableRow({
        children: [
          new TableCell({
            width: { size: 600, type: WidthType.DXA },
            shading: { fill: item.stt % 2 === 0 ? lightGray : "FFFFFF", type: ShadingType.CLEAR },
            children: [new Paragraph({ children: [new TextRun({ text: item.stt.toString(), bold: true, size: 18 })], alignment: AlignmentType.CENTER })]
          }),
          new TableCell({
            width: { size: 2400, type: WidthType.DXA },
            shading: { fill: item.stt % 2 === 0 ? lightGray : "FFFFFF", type: ShadingType.CLEAR },
            children: [
              new Paragraph({ children: [new TextRun({ text: `[${item.id}]`, bold: true, color: primaryNavy, size: 18 })] }),
              new Paragraph({ children: [new TextRun({ text: item.name, bold: true, size: 19 })], spacing: { before: 30 } }),
              new Paragraph({ children: [new TextRun({ text: `(${item.target})`, italics: true, color: "64748B", size: 16 })], spacing: { before: 30 } })
            ]
          }),
          new TableCell({
            width: { size: 3800, type: WidthType.DXA },
            shading: { fill: item.stt % 2 === 0 ? lightGray : "FFFFFF", type: ShadingType.CLEAR },
            children: flowParas
          }),
          new TableCell({
            width: { size: 2200, type: WidthType.DXA },
            shading: { fill: item.stt % 2 === 0 ? lightGray : "FFFFFF", type: ShadingType.CLEAR },
            children: apiParas
          }),
          new TableCell({
            width: { size: 2400, type: WidthType.DXA },
            shading: { fill: item.stt % 2 === 0 ? lightGray : "FFFFFF", type: ShadingType.CLEAR },
            children: dbParas
          })
        ]
      })
    );
  }

  return tableRows;
}

// Hàm sinh file Docx
async function exportDocxFile(outputPath, titleDoc, subTitle, featuresList) {
  const primaryNavy = "003B95";
  const amberGold = "F59E0B";

  const rows = createDocxTable(featuresList, titleDoc);

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: { width: 16838, height: 11906 }, // A4 landscape
            margin: { top: 720, bottom: 720, left: 720, right: 720 }
          }
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: `HIỆP HỘI DOANH NHÂN CEO 1983 (HANOIBA) - ${titleDoc.toUpperCase()}`, bold: true, color: primaryNavy, size: 16 }),
                ],
                alignment: AlignmentType.RIGHT
              })
            ]
          })
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: "Tài liệu kỹ thuật nội bộ | Phiên bản 5.0 | Ngày lập: 14/11/2026 | Trang: ", size: 16 }),
                  new TextRun({ children: [PageNumber.CURRENT], size: 16 })
                ],
                alignment: AlignmentType.CENTER
              })
            ]
          })
        },
        children: [
          new Paragraph({
            children: [new TextRun({ text: titleDoc, bold: true, size: 36, color: primaryNavy })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 120 }
          }),
          new Paragraph({
            children: [new TextRun({ text: subTitle, bold: true, size: 24, color: amberGold })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 80 }
          }),
          new Paragraph({
            children: [new TextRun({ text: "100% CSDL PostgreSQL | Không Hardcode Mock Data | Quy Chuẩn Thiết Kế & Vận Hành", italics: true, size: 18, color: "64748B" })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 240 }
          }),
          new Table({
            rows: rows,
            width: { size: 11400, type: WidthType.DXA }
          })
        ]
      }
    ]
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(outputPath, buffer);
  console.log(`Đã xuất file Word: ${outputPath}`);
}

// Hàm sinh file PDF qua Playwright
async function exportPdfFile(outputPath, titleDoc, subTitle, featuresList) {
  const primaryNavy = "#003B95";
  const amberGold = "#F59E0B";

  let rowsHtml = "";
  for (const item of featuresList) {
    const flowLines = item.flow.split('\n').map(l => `<div class="flow-step">${l}</div>`).join('');
    const noteHtml = item.notes ? `<div class="note-box"><strong>⭐ Ràng buộc:</strong> ${item.notes}</div>` : '';

    const apiLines = item.api.split('\n').map(l => {
      const parts = l.split(' ');
      const m = parts[0] || '';
      const ep = parts.slice(1).join(' ') || '';
      let mClass = 'm-get';
      if (m === 'POST') mClass = 'm-post';
      else if (m === 'PUT' || m === 'PATCH') mClass = 'm-put';
      else if (m === 'DELETE') mClass = 'm-del';
      return `<div class="api-item"><span class="badge ${mClass}">${m}</span> <span class="endpoint">${ep}</span></div>`;
    }).join('');

    const dbLines = item.db.split('\n').map(l => `<div class="db-item">${l}</div>`).join('');

    rowsHtml += `
      <tr class="${item.stt % 2 === 0 ? 'even' : 'odd'}">
        <td class="col-stt">${item.stt}</td>
        <td class="col-node">
          <div class="node-id">[${item.id}]</div>
          <div class="node-name">${item.name}</div>
          <div class="node-target">${item.target}</div>
        </td>
        <td class="col-flow">
          ${flowLines}
          ${noteHtml}
        </td>
        <td class="col-api">
          ${apiLines}
        </td>
        <td class="col-db">
          ${dbLines}
        </td>
      </tr>
    `;
  }

  const htmlContent = `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>${titleDoc}</title>
  <style>
    @page {
      size: A4 landscape;
      margin: 10mm 8mm 12mm 8mm;
    }
    body {
      font-family: "Segoe UI", Arial, sans-serif;
      margin: 0;
      padding: 0;
      color: #1E293B;
      background: #FFFFFF;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .header-doc {
      text-align: center;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 2px solid ${primaryNavy};
    }
    .header-doc h1 {
      color: ${primaryNavy};
      font-size: 17pt;
      margin: 0 0 4px 0;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .header-doc h2 {
      color: ${amberGold};
      font-size: 12pt;
      margin: 0 0 4px 0;
    }
    .header-doc .sub {
      color: #64748B;
      font-size: 8.5pt;
      font-style: italic;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      page-break-inside: auto;
      font-size: 8.2pt;
      line-height: 1.35;
    }
    tr {
      page-break-inside: avoid;
      page-break-after: auto;
    }
    thead th {
      background-color: ${primaryNavy};
      color: #FFFFFF;
      padding: 7px 5px;
      text-align: center;
      font-weight: 600;
      font-size: 8.5pt;
      border: 1px solid #CBD5E1;
    }
    td {
      padding: 6px 5px;
      border: 1px solid #CBD5E1;
      vertical-align: top;
    }
    tr.even { background-color: #F8FAFC; }
    tr.odd { background-color: #FFFFFF; }
    .col-stt { text-align: center; font-weight: bold; width: 25px; }
    .col-node { width: 170px; }
    .col-flow { width: 380px; }
    .col-api { width: 180px; }
    .col-db { width: 200px; }
    .node-id { color: ${primaryNavy}; font-weight: bold; font-size: 8.5pt; }
    .node-name { font-weight: bold; color: #0F172A; margin: 2px 0; }
    .node-target { color: #64748B; font-size: 7.5pt; font-style: italic; }
    .flow-step { margin-bottom: 3px; }
    .note-box {
      margin-top: 4px;
      padding: 3px 5px;
      background-color: #FEF3C7;
      border-left: 3px solid ${amberGold};
      font-size: 7.5pt;
      border-radius: 2px;
    }
    .badge {
      display: inline-block;
      padding: 1px 4px;
      border-radius: 3px;
      font-size: 7pt;
      font-weight: bold;
      color: #FFFFFF;
      min-width: 32px;
      text-align: center;
    }
    .m-get { background-color: #0284C7; }
    .m-post { background-color: #16A34A; }
    .m-put { background-color: #D97706; }
    .m-del { background-color: #DC2626; }
    .api-item {
      margin-bottom: 3px;
      font-family: Consolas, monospace;
      font-size: 7.5pt;
    }
    .endpoint { color: #334155; word-break: break-all; }
    .db-item {
      font-family: Consolas, monospace;
      font-size: 7.5pt;
      color: #0F172A;
      margin-bottom: 3px;
      word-break: break-all;
    }
  </style>
</head>
<body>
  <div class="header-doc">
    <h1>${titleDoc}</h1>
    <h2>${subTitle}</h2>
    <div class="sub">Hiệp Hội Doanh Nhân CEO 1983 (HanoiBA) | Phiên bản 5.0 | 100% CSDL PostgreSQL Realtime</div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width: 25px;">STT</th>
        <th style="width: 170px;">Tên Chức Năng & Mã Node</th>
        <th style="width: 380px;">Mô Tả Luồng Nghiệp Vụ (Flow Chi Tiết)</th>
        <th style="width: 180px;">API Endpoint Backend</th>
        <th style="width: 200px;">Bảng CSDL PostgreSQL</th>
      </tr>
    </thead>
    <tbody>
      ${rowsHtml}
    </tbody>
  </table>
</body>
</html>
  `;

  const tempHtmlPath = path.join(__dirname, `temp_${Date.now()}_spec.html`);
  fs.writeFileSync(tempHtmlPath, htmlContent, 'utf-8');

  const chromePath = fs.existsSync('C:/Program Files/Google/Chrome/Application/chrome.exe')
    ? 'C:/Program Files/Google/Chrome/Application/chrome.exe'
    : 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';

  const browser = await chromium.launch({ 
    headless: true,
    executablePath: chromePath
  });

  const page = await browser.newPage();
  await page.goto('file://' + tempHtmlPath.replace(/\\/g, '/'), { waitUntil: 'networkidle' });

  await page.pdf({
    path: outputPath,
    format: 'A4',
    landscape: true,
    printBackground: true,
    margin: { top: '8mm', bottom: '10mm', left: '8mm', right: '8mm' },
    displayHeaderFooter: true,
    headerTemplate: `
      <div style="font-family: Arial; font-size: 7pt; color: #94A3B8; width: 100%; text-align: right; padding-right: 10mm;">
        HIỆP HỘI DOANH NHÂN CEO 1983 (HANOIBA) - ${titleDoc.toUpperCase()}
      </div>
    `,
    footerTemplate: `
      <div style="font-family: Arial; font-size: 7pt; color: #64748B; width: 100%; display: flex; justify-content: space-between; padding: 0 10mm;">
        <span>Bảo mật nội bộ CLB CEO 1983 | Xuất ngày: 14/11/2026</span>
        <span>Trang <span class="pageNumber"></span> / <span class="totalPages"></span></span>
      </div>
    `
  });

  await browser.close();
  if (fs.existsSync(tempHtmlPath)) fs.unlinkSync(tempHtmlPath);
  console.log(`Đã xuất file PDF: ${outputPath}`);
}

// Hàm sinh Markdown cho NotebookLM
function exportMarkdownFile(outputPath, titleDoc, subTitle, featuresList) {
  let md = `# ${titleDoc}\n## ${subTitle}\n\n`;
  md += `*Hiệp Hội Doanh Nhân CEO 1983 (HanoiBA) | Phiên bản 5.0 | 100% CSDL PostgreSQL*\n\n---\n\n`;

  for (const item of featuresList) {
    md += `### ${item.stt}. [${item.id}] ${item.name}\n`;
    md += `- **Đối tượng sử dụng**: ${item.target}\n`;
    md += `- **Luồng nghiệp vụ chi tiết**:\n${item.flow.split('\n').map(l => '  ' + l).join('\n')}\n`;
    md += `- **API Endpoints Backend**:\n\`\`\`http\n${item.api}\n\`\`\`\n`;
    md += `- **Bảng CSDL PostgreSQL**:\n\`\`\`sql\n${item.db}\n\`\`\`\n`;
    if (item.notes) {
      md += `- **Ràng buộc & Ghi chú**: ${item.notes}\n`;
    }
    md += `\n---\n\n`;
  }

  fs.writeFileSync(outputPath, md, 'utf-8');
  console.log(`Đã xuất file Markdown: ${outputPath}`);
}

async function run() {
  console.log("=== BẮT ĐẦU XUẤT 2 BẢN ĐẶC TẢ TÁCH BIỆT ===");

  // 1. WEB CRM QUẢN TRỊ
  const crmDocx1 = path.resolve(__dirname, '../document/DAC_TA_CHUC_NANG_WEB_CRM_QUAN_TRI_CEO1983.docx');
  const crmDocx2 = path.resolve(__dirname, '../apps/ceo1983_app_fe/public/docs/DAC_TA_CHUC_NANG_WEB_CRM_QUAN_TRI_CEO1983.docx');
  const crmPdf1  = path.resolve(__dirname, '../document/DAC_TA_CHUC_NANG_WEB_CRM_QUAN_TRI_CEO1983.pdf');
  const crmPdf2  = path.resolve(__dirname, '../apps/ceo1983_app_fe/public/docs/DAC_TA_CHUC_NANG_WEB_CRM_QUAN_TRI_CEO1983.pdf');
  const crmMd    = path.resolve(__dirname, '../document/notebooklm/16_DAC_TA_CHUC_NANG_WEB_CRM_QUAN_TRI_CEO1983.md');

  await exportDocxFile(crmDocx1, "BẢN ĐẶC TẢ CHỨC NĂNG CỔNG QUẢN TRỊ WEB CRM", "Dành Cho Chủ Tịch, Ban Điều Hành, 7 Ban Chuyên Môn, Thư Ký, Kế Toán & Quản Trị Viên", CRM_FEATURES);
  fs.copyFileSync(crmDocx1, crmDocx2);

  await exportPdfFile(crmPdf1, "BẢN ĐẶC TẢ CHỨC NĂNG CỔNG QUẢN TRỊ WEB CRM", "Dành Cho Chủ Tịch, Ban Điều Hành, 7 Ban Chuyên Môn, Thư Ký, Kế Toán & Quản Trị Viên", CRM_FEATURES);
  fs.copyFileSync(crmPdf1, crmPdf2);

  exportMarkdownFile(crmMd, "BẢN ĐẶC TẢ CHỨC NĂNG CỔNG QUẢN TRỊ WEB CRM", "Dành Cho Chủ Tịch, Ban Điều Hành, 7 Ban Chuyên Môn, Thư Ký, Kế Toán & Quản Trị Viên", CRM_FEATURES);

  // 2. MOBILE APP CEO 1983
  const appDocx1 = path.resolve(__dirname, '../document/DAC_TA_CHUC_NANG_MOBILE_APP_CEO1983.docx');
  const appDocx2 = path.resolve(__dirname, '../apps/ceo1983_app_fe/public/docs/DAC_TA_CHUC_NANG_MOBILE_APP_CEO1983.docx');
  const appPdf1  = path.resolve(__dirname, '../document/DAC_TA_CHUC_NANG_MOBILE_APP_CEO1983.pdf');
  const appPdf2  = path.resolve(__dirname, '../apps/ceo1983_app_fe/public/docs/DAC_TA_CHUC_NANG_MOBILE_APP_CEO1983.pdf');
  const appMd    = path.resolve(__dirname, '../document/notebooklm/17_DAC_TA_CHUC_NANG_MOBILE_APP_CEO1983.md');

  await exportDocxFile(appDocx1, "BẢN ĐẶC TẢ CHỨC NĂNG ỨNG DỤNG DI ĐỘNG CEO 1983 (MOBILE APP)", "Dành Cho Hội Viên Doanh Nhân, Ban Lãnh Đạo & Đối Tác Giao Thương B2B", APP_FEATURES);
  fs.copyFileSync(appDocx1, appDocx2);

  await exportPdfFile(appPdf1, "BẢN ĐẶC TẢ CHỨC NĂNG ỨNG DỤNG DI ĐỘNG CEO 1983 (MOBILE APP)", "Dành Cho Hội Viên Doanh Nhân, Ban Lãnh Đạo & Đối Tác Giao Thương B2B", APP_FEATURES);
  fs.copyFileSync(appPdf1, appPdf2);

  exportMarkdownFile(appMd, "BẢN ĐẶC TẢ CHỨC NĂNG ỨNG DỤNG DI ĐỘNG CEO 1983 (MOBILE APP)", "Dành Cho Hội Viên Doanh Nhân, Ban Lãnh Đạo & Đối Tác Giao Thương B2B", APP_FEATURES);

  console.log("=== HOÀN TẤT XUẤT 2 BỘ TÀI LIỆU TÁCH BIỆT THÀNH CÔNG 100% ===");
}

run().catch(err => {
  console.error("Lỗi:", err);
  process.exit(1);
});
