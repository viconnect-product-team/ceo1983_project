/**
 * SCRIPT SINH TÀI LIỆU ĐẶC TẢ CHI TIẾT TOÀN BỘ CHỨC NĂNG HỆ THỐNG CEO 1983 (HANOIBA)
 * Định dạng: Word (.docx) & PDF chuẩn A4
 * Xuất file tới:
 *   - document/BANG_DAC_TA_CHI_TIET_TOAN_BO_CHUC_NANG_CEO1983.docx
 *   - document/BANG_DAC_TA_CHI_TIET_TOAN_BO_CHUC_NANG_CEO1983.pdf
 *   - apps/ceo1983_app_fe/public/docs/BANG_DAC_TA_CHI_TIET_TOAN_BO_CHUC_NANG_CEO1983.docx
 *   - apps/ceo1983_app_fe/public/docs/BANG_DAC_TA_CHI_TIET_TOAN_BO_CHUC_NANG_CEO1983.pdf
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
  HeadingLevel, 
  AlignmentType, 
  BorderStyle, 
  WidthType,
  ShadingType,
  Header,
  Footer,
  PageNumber
} = require('docx');
const { chromium } = require('playwright');

// Dữ liệu 47 chức năng toàn diện
const SYSTEM_FEATURES = [
  // ==========================================
  // PHẦN 1: HẠ TẦNG CORE & XÁC THỰC BẢO MẬT
  // ==========================================
  {
    id: "NODE-CORE-001",
    group: "Phần I: Hạ Tầng Core, Xác Thực & Bảo Mật",
    name: "Đăng Nhập Hệ Thống Đa Nền Tảng (JWT, OAuth & Biometric)",
    target: "Chủ tịch, Ban Điều Hành, Ban Thư Ký, Kế toán, Hội viên Doanh nhân",
    flow: "1. Người dùng truy cập Web CRM (/login) hoặc App Mobile (/association/login) và nhập Email/Username cùng Mật khẩu.\n2. Hỗ trợ đăng nhập nhanh bằng Google OAuth và Apple Sign-in trên thiết bị di động.\n3. Backend tiếp nhận, truy vấn thông tin tài khoản và kiểm tra mật khẩu qua hàm so khớp băm bảo mật bcrypt.\n4. Nếu xác thực thành công, hệ thống cấp phát cặp Access Token (JWT thời hạn ngắn) và Refresh Token (lưu bảo mật).\n5. Tải nạp thông tin hồ sơ Hội viên, vai trò chức danh trong CLB và ma trận quyền hạn RBAC gắn liền.\n6. Hệ thống điều hướng chính xác: Tài khoản quản trị vào thẳng Web CRM Dashboard, tài khoản Hội viên chuyển hướng vào Trang chủ App Mobile CEO 1983.",
    api: "POST /auth/login\nPOST /auth/google\nPOST /auth/apple\nPOST /auth/refresh-token",
    db: "public.vione_users (id, email, password_hash, status, is_verified, last_login_at)\npublic.user_roles (user_id, role_id)\npublic.roles (id, code, name)\npublic.members (id, user_id, full_name, avatar_url, executive_role, department)",
    notes: "Token được mã hóa an toàn, phân tách phiên làm việc độc lập giữa Web CRM quản trị và Mobile App."
  },
  {
    id: "NODE-CORE-002",
    group: "Phần I: Hạ Tầng Core, Xác Thực & Bảo Mật",
    name: "Đăng Xuất & Thu Hồi Phiên Đăng Nhập",
    target: "Toàn bộ người dùng trên Web CRM và Mobile App",
    flow: "1. Người dùng bấm nút 'Đăng xuất' tại menu hồ sơ cá nhân.\n2. Client gửi yêu cầu thu hồi token lên máy chủ Backend.\n3. Backend vô hiệu hóa Refresh Token tương ứng và ghi nhận thời gian đăng xuất vào nhật ký phiên.\n4. Client dọn sạch bộ nhớ cục bộ (localStorage, sessionStorage, cookie) và hủy phiên đăng nhập.\n5. Điều hướng người dùng về màn hình đăng nhập an toàn.",
    api: "POST /auth/logout",
    db: "public.vione_users (id, last_logout_at)\npublic.audit_logs (user_id, action='LOGOUT', timestamp, ip_address)",
    notes: "Xóa sạch bộ nhớ đệm cache và ngắt kết nối WebSocket/Socket.IO để tránh rò rỉ dữ liệu."
  },
  {
    id: "NODE-CORE-003",
    group: "Phần I: Hạ Tầng Core, Xác Thực & Bảo Mật",
    name: "Đổi Mật Khẩu Chủ Động & Ràng Buộc Bảo Mật",
    target: "Tất cả Hội viên và Cán bộ Quản trị",
    flow: "1. Người dùng truy cập mục Đổi mật khẩu tại cài đặt tài khoản cá nhân.\n2. Nhập mật khẩu hiện tại, mật khẩu mới và xác nhận lại mật khẩu mới (ràng buộc tối thiểu 6-8 ký tự, có chữ và số).\n3. Backend kiểm tra tính chính xác của mật khẩu hiện tại thông qua bcrypt so sánh hash.\n4. Nếu hợp lệ, mật khẩu mới được băm bằng bcrypt với salt rounds = 10 và cập nhật trực tiếp vào cơ sở dữ liệu.\n5. Trả về thông báo thành công và ghi nhận lịch sử đổi mật khẩu vào hệ thống.",
    api: "PUT /auth/change-password",
    db: "public.vione_users (id, password_hash, updated_at)\npublic.audit_logs (user_id, action='CHANGE_PASSWORD', timestamp)",
    notes: "Bắt buộc kiểm tra mật khẩu cũ trước khi cho phép lưu mật khẩu mới."
  },
  {
    id: "NODE-CORE-004",
    group: "Phần I: Hạ Tầng Core, Xác Thực & Bảo Mật",
    name: "Quên Mật Khẩu & Luồng Tiếp Nhận Phê Duyệt Cấp Mới Qua CRM",
    target: "Hội viên quên mật khẩu & Ban Quản trị CRM",
    flow: "1. Tại màn hình đăng nhập, Hội viên bấm 'Quên mật khẩu?' và nhập Email hoặc Số điện thoại đã đăng ký.\n2. Hệ thống tạo một yêu cầu khôi phục mật khẩu và tự động bắn cảnh báo về Trung tâm Thông báo Quản trị trên Web CRM.\n3. Quản trị viên trên CRM nhấp vào thông báo, hệ thống mở trực tiếp giao diện cấp lại mật khẩu cho đúng tài khoản đó.\n4. Sau khi Quản trị viên nhập mật khẩu mới và bấm xác nhận, hệ thống lưu mã hash mới vào CSDL.\n5. Đồng thời, hệ thống kích hoạt tự động gửi Email thông báo mật khẩu mới và gửi tin nhắn Zalo OA ZNS tới số điện thoại của Hội viên.",
    api: "POST /auth/forgot-password\nPOST /admin/reset-password\nPOST /zalo/send-zns",
    db: "public.vione_users (id, email, phone, password_hash, reset_token)\npublic.notifications (id, type='FORGOT_PASSWORD_REQUEST', content, status, target_user_id)\npublic.mail_templates (key='RESET_PASSWORD_TEMPLATE')",
    notes: "Đảm bảo tính bảo mật kép: quản trị viên phê duyệt xác thực và hệ thống tự động dispatch thông báo đa kênh."
  },
  {
    id: "NODE-CORE-005",
    group: "Phần I: Hạ Tầng Core, Xác Thực & Bảo Mật",
    name: "Đăng Ký Hội Viên Mới & Tạo Hồ Sơ Doanh Nghiệp (Onboarding)",
    target: "Doanh nhân đăng ký gia nhập CLB CEO 1983",
    flow: "1. Khách điền biểu mẫu đăng ký gia nhập CLB: Họ tên, Email, Số điện thoại, Tên công ty, Mã số thuế, Ngành nghề, Quy mô nhân sự, Vị trí chức danh và Ảnh đại diện.\n2. Hệ thống kiểm tra xác thực không trùng lặp Email, SĐT và MST trong hệ thống.\n3. Tạo tài khoản người dùng và bản ghi hồ sơ Hội viên ở trạng thái 'PENDING' (Chờ phê duyệt).\n4. Tự động bắn thông báo cảnh báo 'Có hồ sơ đăng ký mới' tới Ban Thư Ký và Ban Điều Hành trên CRM.\n5. Ban Thư Ký thẩm định hồ sơ, bấm 'Duyệt hội viên', hệ thống chuyển trạng thái sang 'ACTIVE' và gửi Email chào mừng chính thức.",
    api: "POST /auth/register\nPOST /members/onboard\nPATCH /members/:id/approve",
    db: "public.vione_users (id, email, phone, role_code='MEMBER')\npublic.members (id, user_id, full_name, status='PENDING'|'ACTIVE', department)\npublic.companies (id, member_id, company_name, tax_code, industry, employee_scale)\npublic.notifications (id, type='NEW_MEMBER_REGISTRATION', is_read)",
    notes: "Lưu trữ đầy đủ dữ liệu pháp nhân doanh nghiệp kèm tài khoản cá nhân, phục vụ quản lý 360 độ."
  },
  {
    id: "NODE-CRM-006",
    group: "Phần I: Hạ Tầng Core, Xác Thực & Bảo Mật",
    name: "Ma Trận Phân Quyền RBAC 2 Tab & Tự Động Đồng Bộ Tên Sidebar",
    target: "Chủ tịch CLB & Quản trị viên Tối cao (Super Admin)",
    flow: "1. Quản trị viên truy cập màn hình Phân Quyền (/permissions) hiển thị 2 Tab độc lập: Tab 1 'Phân Quyền CRM Web' và Tab 2 'Phân Quyền App Mobile'.\n2. Khi Sidebar hoặc hệ thống menu thay đổi tên chức năng, danh mục tính năng tại ma trận phân quyền tự động lấy theo tên mới nhất.\n3. Admin chọn vai trò (Chủ tịch, Ban Điều Hành, Ban Thư Ký, Kế toán, Trưởng ban chuyên môn, Hội viên) và tích chọn phân quyền (Xem, Thêm, Sửa, Xóa, Phê duyệt, Xuất báo cáo).\n4. Bấm 'Lưu ma trận phân quyền', hệ thống cập nhật toàn bộ quyền hạn vào CSDL PostgreSQL.\n5. Toàn bộ API Backend được bảo vệ bởi RBAC Guard, tự động từ chối nếu tài khoản không đủ quyền (mã lỗi 403 Forbidden).",
    api: "GET /admin/roles\nPOST /admin/roles/permissions\nPUT /admin/roles/:id\nGET /admin/permissions",
    db: "public.roles (id, code, name, description, is_system)\npublic.permissions (id, code, name, module, platform='CRM'|'APP')\npublic.role_permissions (role_id, permission_id)\npublic.user_roles (user_id, role_id)",
    notes: "Phân tách rõ ràng giữa thẩm quyền quản trị CRM và quyền hạn sử dụng tính năng trên Mobile App."
  },
  {
    id: "NODE-CRM-005",
    group: "Phần I: Hạ Tầng Core, Xác Thực & Bảo Mật",
    name: "Quản Lý Tài Khoản & Gán Ban Chuyên Môn Trực Tiếp",
    target: "Quản trị viên CRM (Ban Thư Ký, Ban Nhân Sự)",
    flow: "1. Quản trị viên xem danh sách toàn bộ tài khoản người dùng tại giao diện Quản lý tài khoản (tích hợp trong nhóm phân quyền).\n2. Tên tài khoản hiển thị chuẩn xác, khử bỏ hoàn toàn các ký tự dư thừa (@).\n3. Quản trị viên có thể tìm kiếm theo họ tên, email, tên đăng nhập, trạng thái khóa/mở.\n4. Mở modal chỉnh sửa để gán trực tiếp vai trò quản trị và phân bổ vào 1 trong 7 Ban chuyên môn (Ban Điều Hành, Ban Hội Viên, Ban Đào Tạo, Ban Truyền Thông, Ban Sự Kiện, Ban Tài Chính - Kiểm Tra, Ban Hợp Tác Quốc Tế).\n5. Dữ liệu được cập nhật trực tiếp vào cơ sở dữ liệu PostgreSQL (không dùng dữ liệu hardcode mock).",
    api: "GET /accounts\nPATCH /members/:id/role-dept\nPATCH /users/:id/status\nPOST /accounts/create",
    db: "public.vione_users (id, email, status, created_at)\npublic.members (id, user_id, full_name, executive_role, department)\npublic.user_roles (user_id, role_id)\npublic.departments (id, code, name)",
    notes: "Lưu trữ đồng bộ hai chiều giữa tài khoản người dùng (vione_users) và hồ sơ hội viên (members)."
  },

  // ==========================================
  // PHẦN 2: PHÂN HỆ WEB CRM QUẢN TRỊ
  // ==========================================
  {
    id: "NODE-CRM-001",
    group: "Phần II: Web CRM Quản Trị Hệ Thống",
    name: "Tổng Quan & Dashboard Điều Hành CLB",
    target: "Chủ tịch, Ban Điều Hành, Ban Thư Ký, Kế toán",
    flow: "1. Người dùng quản trị đăng nhập, hệ thống điều hướng vào màn hình Tổng quan (/dashboard).\n2. Tải và hiển thị 4 thẻ KPI Gradient thời gian thực: Tổng số Hội viên chính thức, Số Doanh nghiệp kết nối, Tổng ngân sách quỹ CLB (Thu/Chi), Số Sự kiện & Cuộc họp trong tháng.\n3. Hiển thị Lịch biểu công tác tháng trực quan tích hợp lịch sự kiện và cuộc họp ban.\n4. Cảnh báo thông minh: Danh sách hội viên sắp hết hạn niên liễm hoặc nợ đọng hội phí để Ban Thư ký xử lý kịp thời.",
    api: "GET /admin/dashboard-stats\nGET /admin/recent-activities",
    db: "public.members (id, status, joined_date, dues_expired_at)\npublic.events (id, title, start_date, status)\npublic.meetings (id, title, meeting_date, status)\npublic.income_records (id, amount, status)\npublic.expense_records (id, amount, status)",
    notes: "100% dữ liệu thống kê được tính toán trực tiếp từ cơ sở dữ liệu, không có mock ảo."
  },
  {
    id: "NODE-CRM-002",
    group: "Phần II: Web CRM Quản Trị Hệ Thống",
    name: "Trung Tâm Thống Kê Chuyên Sâu 5 Danh Mục (Analytics Hub)",
    target: "Chủ tịch, Ban Điều Hành, Ban Thư Ký",
    flow: "1. Truy cập màn hình Thống Kê CLB (/analytics) với biểu tượng BarChart3 trên Sidebar.\n2. Phân tích dữ liệu theo 5 danh mục nghiệp vụ: 1. Doanh số giao thương B2B, 2. Tăng trưởng Hội viên, 3. Kết nối & Giới thiệu cơ hội, 4. Tỷ lệ điểm danh tham gia hoạt động, 5. Đào tạo nâng cao năng lực.\n3. Hiển thị 4 thẻ KPI chỉ số, Biểu đồ kết hợp ComposedChart (cột doanh thu, đường tăng trưởng phần trăm).\n4. Bục vinh danh Top 3 Doanh nhân cống hiến (Top Giver) được thiết kế nằm gọn gàng trên 1 hàng ngang, vinh danh Top 1 với avatar viền vàng đặc trưng.\n5. Hỗ trợ bấm nút xuất báo cáo chi tiết ra định dạng Excel và in ấn bản A4 PDF chuẩn mực.",
    api: "GET /admin/analytics-summary\nGET /admin/analytics/industry-breakdown\nGET /admin/analytics/top-performers",
    db: "public.members (id, full_name, avatar_url, points)\npublic.opportunities (id, giver_id, receiver_id, value_amount, status='CLOSED')\npublic.departments (id, name)\npublic.events (id, title)\npublic.event_registrations (id, event_id, check_in_status='CHECKED_IN')",
    notes: "Hỗ trợ lọc đa chiều theo mốc thời gian: Tuần này, Tháng này, Quý này, Năm nay."
  },
  {
    id: "NODE-CRM-003",
    group: "Phần II: Web CRM Quản Trị Hệ Thống",
    name: "Quản Trị Danh Bạ Hội Viên 360 Độ",
    target: "Ban Thư Ký, Ban Hội Viên, Quản trị viên",
    flow: "1. Hiển thị danh sách toàn bộ hội viên dưới dạng Bảng CustomTable chuẩn mực (giới hạn tối đa 2 dòng, văn bản dài tự cắt có dấu ba chấm và tooltip hiển thị toàn văn).\n2. Thanh công cụ hỗ trợ tìm kiếm nhanh theo Họ tên, SĐT, Email, Tên công ty, Ban chuyên môn, Trạng thái (Đang hoạt động, Chờ duyệt, Tạm khóa).\n3. Thao tác Xem chi tiết hồ sơ 360 độ: lịch sử đóng phí, tham dự sự kiện, cơ hội đã trao.\n4. Thao tác Thêm mới hoặc Chỉnh sửa thông tin cá nhân hội viên.\n5. Thao tác Xóa tài khoản cung cấp 2 chế độ an toàn: Xóa dữ liệu doanh nghiệp liên quan trước, hoặc Xóa liên hoàn (Cascade delete).\n6. Hỗ trợ Xuất danh bạ ra file Excel và Nhập dữ liệu hàng loạt từ file Excel mẫu.",
    api: "GET /members\nPOST /members\nPUT /members/:id\nDELETE /members/:id\nPOST /members/import-excel\nGET /members/export-excel",
    db: "public.members (id, user_id, full_name, phone, email, avatar_url, bio, status, joined_date, dues_expired_at)\npublic.companies (id, member_id, company_name)\npublic.vione_users (id, status)",
    notes: "Tất cả bảng dữ liệu trên CRM dùng chung 1 component CustomTable thống nhất."
  },
  {
    id: "NODE-CRM-004",
    group: "Phần II: Web CRM Quản Trị Hệ Thống",
    name: "Quản Trị Doanh Nghiệp Thành Viên",
    target: "Ban Thư Ký, Ban Hội Viên, Ban B2B",
    flow: "1. Truy cập danh mục Doanh nghiệp (/companies) hiển thị danh sách toàn bộ pháp nhân doanh nghiệp của Hội viên CLB.\n2. Cột thông tin hiển thị chuẩn mực: Tên doanh nghiệp (cột thứ 3), Mã số thuế, Người đại diện pháp luật, Ngành nghề hoạt động, Quy mô vốn/nhân sự, Địa chỉ trụ sở, Website, Logo.\n3. Quản trị viên xem hồ sơ chi tiết doanh nghiệp, các sản phẩm đang chào bán trên sàn B2B và danh sách nhân sự tham gia CLB.\n4. Chỉnh sửa thông tin pháp lý doanh nghiệp hoặc cập nhật trạng thái liên kết.",
    api: "GET /companies\nPOST /companies\nPUT /companies/:id\nDELETE /companies/:id",
    db: "public.companies (id, member_id, company_name, tax_code, legal_representative, industry, capital, employee_scale, address, website_url, logo_url, is_verified)\npublic.members (id, full_name)",
    notes: "Liên kết 1-1 hoặc 1-N giữa Doanh nghiệp và Hội viên lãnh đạo."
  },
  {
    id: "NODE-CRM-007",
    group: "Phần II: Web CRM Quản Trị Hệ Thống",
    name: "Quản Trị Sự Kiện, Bán Vé, Xếp Chỗ & Bắn Mạng Lưới",
    target: "Ban Sự Kiện, Ban Điều Hành, Ban Thư Ký",
    flow: "1. Tạo sự kiện mới: Tiêu đề, Ảnh Banner/Poster, Địa điểm tổ chức, Thời gian bắt đầu/kết thúc, Sơ đồ chỗ ngồi, Lịch trình Agenda chi tiết theo từng khung giờ, Số lượng vé giới hạn, Mức phí tham dự.\n2. Quản lý danh sách đăng ký tham dự (Hội viên chính thức và Khách vãng lai).\n3. Sắp xếp vị trí chỗ ngồi & Tính năng Gỡ/Thay đổi chỗ ngồi: Khi gỡ hoặc đổi vị trí ngồi của người tham gia, hệ thống tự động bắn Email và tin nhắn Zalo OA thông báo vị trí chỗ ngồi mới tới người tham dự.\n4. Điểm danh tham dự thời gian thực thông qua quét mã QR trên vé điện tử.\n5. Hỗ trợ Tải poster sự kiện về máy tính.\n6. Tải ảnh/video tư liệu trong quá trình sự kiện diễn ra (tối đa 5 ảnh, có video) để lưu trữ lịch sử.\n7. Nút 'Bắn Mạng Lưới': Tự động phát thanh bài viết giới thiệu sự kiện lên Bảng tin Mạng lưới App Mobile (hiển thị đường link QR thay vì hiển thị hình ảnh mã QR).",
    api: "GET /events\nPOST /events\nPUT /events/:id\nDELETE /events/:id\nGET /events/:id/attendees\nPOST /events/:id/seats\nDELETE /events/:id/seats/:seatId\nPOST /events/:id/checkin\nPOST /feed/broadcast-event\nPOST /events/:id/media",
    db: "public.events (id, title, banner_url, start_date, end_date, location, agenda_json, ticket_price, max_attendees, status)\npublic.event_registrations (id, event_id, member_id, guest_name, guest_email, guest_phone, ticket_code, seat_number, check_in_status, checked_in_at)\npublic.event_seats (id, event_id, seat_code, member_id, status)\npublic.sponsors_prizes (id, event_id, sponsor_id, prize_name, quantity)\npublic.feed_posts (id, type='EVENT', title, content, link_url, media_urls)",
    notes: "Khi gỡ hoặc đổi vị trí ngồi, hệ thống tự động kích hoạt dispatch thông báo đa kênh (Email + Zalo OA)."
  },
  {
    id: "NODE-CRM-008",
    group: "Phần II: Web CRM Quản Trị Hệ Thống",
    name: "Quản Lý Cuộc Họp Ban & Gặp Gỡ CLB",
    target: "Ban Điều Hành, Trưởng 7 Ban Chuyên Môn, Ban Thư Ký",
    flow: "1. Thiết lập lịch họp Ban Điều Hành hoặc các Ban chuyên môn: Tiêu đề, Nội dung nghị sự, Thời gian, Thành phần triệu tập.\n2. Bản đồ tương tác chọn vị trí họp (ghim đỏ trên OpenStreetMap/Nominatim).\n3. Gửi thông báo triệu tập họp tới các thành viên liên quan.\n4. Điểm danh cuộc họp bằng quét mã QR.\n5. Đính kèm biên bản họp, tài liệu số và tải lên tối đa 5 ảnh/video lưu vào nhật ký cuộc họp.\n6. Tự động đồng bộ sang mục Hoạt động trên App Mobile và phát thanh bài viết lên Bảng tin Mạng lưới.",
    api: "GET /meetings\nPOST /meetings\nPUT /meetings/:id\nDELETE /meetings/:id\nPOST /meetings/:id/checkin\nPOST /feed/broadcast-meeting\nPOST /meetings/:id/media",
    db: "public.meetings (id, title, department_code, meeting_date, location, lat, lng, agenda, minutes_file_url, status)\npublic.meeting_attendees (id, meeting_id, member_id, is_attended, checked_in_at)\npublic.feed_posts (id, type='MEETING', title, content, media_urls)",
    notes: "Tự động phân loại theo Ban chuyên môn và gắn nhãn [Họp Ban] trên ứng dụng di động."
  },
  {
    id: "NODE-CRM-009",
    group: "Phần II: Web CRM Quản Trị Hệ Thống",
    name: "Quản Lý Thu Ngân Sách, Phí Niên Liễm & Vé Sự Kiện",
    target: "Ban Tài Chính - Kiểm Tra, Kế toán CLB, Thủ quỹ",
    flow: "1. Quản lý toàn bộ danh mục phiếu thu: Thu phí niên liễm hội viên, Thu tiền vé tham dự sự kiện, Thu tài trợ từ các doanh nghiệp, Các khoản thu hoạt động khác.\n2. Tạo phiếu thu mới, chọn Hội viên/Doanh nghiệp nộp, số tiền, ngày thu, chứng từ đính kèm.\n3. Tích hợp tạo mã thanh toán VietQR động chuẩn SeABank (số tiền và nội dung chuyển khoản tự động).\n4. Bảng dữ liệu co dãn linh hoạt kiểu Excel, hiển thị rõ ràng, hỗ trợ lọc theo khoảng ngày, danh mục thu.\n5. Hỗ trợ Nhập dữ liệu phiếu thu từ file Excel và Xuất báo cáo sổ quỹ thu ra file Excel chuẩn mực.",
    api: "GET /finance/income\nPOST /finance/income\nPUT /finance/income/:id\nDELETE /finance/income/:id\nPOST /finance/income/import-excel\nGET /finance/vietqr-payload",
    db: "public.income_records (id, member_id, category, amount, payment_method, reference_code, transaction_date, receipt_url, note, status='COMPLETED')\npublic.members (id, full_name)\npublic.events (id, title)",
    notes: "100% dữ liệu tài chính được lưu trực tiếp vào PostgreSQL, tuyệt đối không dùng số liệu hardcode."
  },
  {
    id: "NODE-CRM-010",
    group: "Phần II: Web CRM Quản Trị Hệ Thống",
    name: "Quản Lý Chi Ngân Sách, Tạm Ứng & Hoàn Ứng",
    target: "Ban Tài Chính - Kiểm Tra, Kế toán CLB, Chủ tịch",
    flow: "1. Tiếp nhận và quản lý các phiếu đề xuất chi ngân sách: Chi tổ chức sự kiện, Chi hoạt động các ban, Chi quà tặng thăm hỏi, Chi vận hành quản lý CLB.\n2. Quản lý quy trình Tạm ứng kinh phí công việc và Hoàn ứng tiền thừa sau khi hoàn thành nhiệm vụ.\n3. Quy trình phê duyệt chi 2 cấp: Kế toán thẩm định hồ sơ chứng từ -> Chủ tịch CLB hoặc Trưởng ban Tài chính duyệt chi điện tử.\n4. Đính kèm hóa đơn đỏ (VAT), phiếu chi có chữ ký và ủy nhiệm chi ngân hàng.\n5. Hỗ trợ Nhập/Xuất sổ quỹ chi ra định dạng Excel.",
    api: "GET /finance/expenses\nPOST /finance/expenses\nPUT /finance/expenses/:id\nDELETE /finance/expenses/:id\nPOST /finance/expenses/import-excel\nPATCH /finance/expenses/:id/approve",
    db: "public.expense_records (id, applicant_id, approver_id, category, amount, advance_amount, refund_amount, status='PENDING'|'APPROVED'|'REJECTED', expense_date, invoice_url, note)\npublic.members (id, full_name)",
    notes: "Kiểm soát chặt chẽ quy trình tạm ứng và hoàn ứng đảm bảo minh bạch tài chính."
  },
  {
    id: "NODE-CRM-011",
    group: "Phần II: Web CRM Quản Trị Hệ Thống",
    name: "Báo Cáo Tài Chính Tổng Hợp & Quyết Toán Quỹ",
    target: "Chủ tịch, Ban Thường Trực, Ban Tài Chính - Kiểm Tra",
    flow: "1. Hệ thống tự động tổng hợp toàn bộ dữ liệu dòng tiền Thu và Chi thực tế trong CSDL PostgreSQL.\n2. Biểu đồ ComposedChart đa tầng biểu diễn: Dòng tiền Thu theo tháng, Dòng tiền Chi theo tháng, và Đường thặng dư quỹ lũy kế.\n3. Biểu đồ tròn PieChart phân bổ cơ cấu chi phí thực tế và tỷ trọng các nguồn thu ngân sách.\n4. Bảng phân tích chi tiết nguồn thu tài trợ theo 4 thứ hạng danh dự: Kim Cương (Diamond), Vàng (Gold), Bạc (Silver), Đồng (Bronze).\n5. Xuất báo cáo quyết toán tài chính phục vụ Đại hội Hội viên và kiểm toán định kỳ.",
    api: "GET /finance/summary-report\nGET /finance/flow-analysis\nGET /finance/sponsor-tiers-report",
    db: "public.income_records (amount, transaction_date, category)\npublic.expense_records (amount, expense_date, category, status='APPROVED')\npublic.sponsor_packages (id, tier, price)",
    notes: "Số liệu quyết toán phản ánh thời gian thực số dư khả dụng của quỹ CLB."
  },
  {
    id: "NODE-CRM-012",
    group: "Phần II: Web CRM Quản Trị Hệ Thống",
    name: "Quản Lý Công Việc & Giao Việc Ban Chuyên Môn",
    target: "Chủ tịch, Ban Điều Hành, Trưởng Ban, Thành viên Ban",
    flow: "1. Người giao việc (Chủ tịch/Trưởng ban) bấm 'Tạo công việc mới': Nhập Tiêu đề, Mô tả, Hạn hoàn thành (Deadline), Mức độ ưu tiên (Khẩn cấp, Cao, Trung bình, Thấp).\n2. Chọn giao cho Cá nhân hội viên cụ thể hoặc giao cho toàn bộ một Ban chuyên môn.\n3. Tải lên các file tài liệu đính kèm (Word, Excel, PDF, Hình ảnh).\n4. Người nhận việc nhận ngay thông báo với thông tin định danh rõ ràng người giao: '[Giao việc từ ${creatorDisplayName}]'.\n5. Tích hợp nút 'Xem file' (icon Con mắt) mở trực tiếp Trình xem tài liệu toàn năng (xem bảng tính Excel SheetJS, đọc PDF, xem ảnh Lightbox) mà không cần tải file về.\n6. Người nhận việc cập nhật tiến độ công việc (Chưa bắt đầu, Đang thực hiện, Đã hoàn thành, Chờ duyệt). Dữ liệu được lưu 100% vào CSDL.",
    api: "GET /tasks\nPOST /tasks\nPUT /tasks/:id\nDELETE /tasks/:id\nPATCH /tasks/:id/status\nPOST /tasks/:id/attachments",
    db: "public.tasks (id, creator_id, title, description, priority, deadline, status='TODO'|'IN_PROGRESS'|'COMPLETED'|'CANCELLED', department_id)\npublic.task_assignees (task_id, member_id, assigned_at)\npublic.task_attachments (id, task_id, file_name, file_url, file_size, mime_type)\npublic.notifications (id, user_id, title, content)",
    notes: "Triệt tiêu hoàn toàn mock data hardcode; hiển thị rõ ràng người giao việc và tích hợp đọc file trực tiếp."
  },
  {
    id: "NODE-CRM-013",
    group: "Phần II: Web CRM Quản Trị Hệ Thống",
    name: "Quản Trị Nhà Tài Trợ & Quyền Lợi Thương Hiệu",
    target: "Ban Tài Chính, Ban Sự Kiện, Ban Truyền Thông",
    flow: "1. Quản lý danh bạ các Nhà tài trợ đồng hành cùng CLB CEO 1983 trong năm và theo từng sự kiện trọng điểm.\n2. Cấu hình 4 gói tài trợ tiêu chuẩn: Kim Cương, Vàng, Bạc, Đồng kèm theo định mức kinh phí và quyền lợi chi tiết.\n3. Theo dõi việc bàn giao quyền lợi thương hiệu: Treo Logo trên Banner sân khấu, vị trí trên Poster sự kiện, số lượng vé VIP tham dự, thời lượng trình chiếu video doanh nghiệp và gian hàng ưu tiên tại sàn B2B.\n4. Lưu trữ hợp đồng tài trợ và xuất hóa đơn/phiếu thu tương ứng.",
    api: "GET /sponsors\nPOST /sponsors\nPUT /sponsors/:id\nDELETE /sponsors/:id\nGET /sponsors/packages",
    db: "public.sponsors (id, company_id, member_id, sponsor_name, logo_url, tier, contract_url, status)\npublic.sponsor_packages (id, code, name, tier, default_amount, benefits_json)\npublic.events (id, title)",
    notes: "Đồng bộ hiển thị logo nhà tài trợ lên poster sự kiện và sàn giao thương B2B."
  },
  {
    id: "NODE-CRM-014",
    group: "Phần II: Web CRM Quản Trị Hệ Thống",
    name: "Kho Tài Liệu CLB & Trình Xem Toàn Năng (Universal Document Viewer)",
    target: "Ban Thư Ký, Toàn thể Hội viên",
    flow: "1. Lưu trữ và phân loại tài liệu số hóa của CLB: Điều lệ CLB, Quy chế hoạt động, Biên bản họp Ban Chấp Hành, Biểu mẫu gia nhập, Quyết định khen thưởng/bổ nhiệm.\n2. Tích hợp Trình xem tài liệu toàn năng (Universal Document Viewer) hỗ trợ xem trực tiếp trên trình duyệt:\n   - File Word (.docx): Hiển thị bản in trang A4 chuẩn xác.\n   - File Excel (.xlsx, .xls): Hiển thị dạng bảng tính đa sheet với thư viện SheetJS, hỗ trợ lọc và tìm kiếm ô.\n   - File PDF: Trình nhúng tương tác hỗ trợ phóng to/thu nhỏ, xoay trang, in ấn.\n   - File Ảnh và Code: Trình xem độ phân giải cao kèm chế độ tối.\n3. Phân quyền xem tài liệu: Công khai cho toàn thể hội viên hoặc giới hạn nội bộ Ban Điều Hành.",
    api: "GET /documents\nPOST /documents\nPUT /documents/:id\nDELETE /documents/:id\nGET /documents/:id/download",
    db: "public.documents (id, title, category, file_url, file_size, file_type, access_level='PUBLIC'|'EXECUTIVE', uploader_id, download_count)\npublic.members (id, full_name)",
    notes: "Cho phép đọc mọi định dạng tài liệu văn phòng trực tiếp không cần cài đặt thêm phần mềm."
  },
  {
    id: "NODE-CRM-015",
    group: "Phần II: Web CRM Quản Trị Hệ Thống",
    name: "Quản Trị Biểu Quyết Trực Tuyến & Vòng Quay May Mắn (Lucky Draw)",
    target: "Ban Tổ Chức, Ban Sự Kiện, Ban Thư Ký",
    flow: "1. Quản trị Biểu quyết: Tạo các câu hỏi biểu quyết/bầu cử Ban Chấp Hành hoặc thông qua Nghị quyết CLB. Thiết lập thời gian mở/đóng biểu quyết, cấu hình đơn chọn hay đa chọn.\n2. Vòng quay số may mắn (Lucky Draw Wheel): Nạp danh sách giải thưởng thực tế từ CSDL nhà tài trợ (Kim Cương, Vàng, Bạc, Đồng).\n3. Tải danh sách người đủ điều kiện quay số (những Hội viên/Khách đã check-in thực tế tại sự kiện).\n4. Vòng quay vận hành ngẫu nhiên, tự động loại trừ những người đã trúng thưởng ở các lượt quay trước.\n5. Khi xác định người trúng, hệ thống tự động trừ số lượng giải thưởng trong CSDL và gửi email/thông báo chúc mừng.",
    api: "GET /polls\nPOST /polls\nPUT /polls/:id\nDELETE /polls/:id\nGET /admin/lucky-draw-config\nPOST /admin/lucky-draw/spin\nPUT /sponsors/prizes/:id",
    db: "public.polls (id, event_id, title, description, poll_type, start_time, end_time, is_active)\npublic.poll_options (id, poll_id, option_text, vote_count)\npublic.poll_votes (id, poll_id, option_id, member_id, voted_at)\npublic.sponsors_prizes (id, event_id, prize_name, quantity, remaining_quantity, winner_id)",
    notes: "Loại trừ người trúng thưởng trùng lặp và đồng bộ kết quả biểu quyết thời gian thực."
  },
  {
    id: "NODE-CRM-016",
    group: "Phần II: Web CRM Quản Trị Hệ Thống",
    name: "Quản Lý Bản Tin & Truyền Thông CLB",
    target: "Ban Truyền Thông, Ban Thư Ký",
    flow: "1. Soạn thảo bài viết tin tức, hoạt động CLB, bài phỏng vấn doanh nhân tiêu biểu thông qua trình soạn thảo Rich-Text.\n2. Đính kèm hình ảnh tiêu biểu, video phóng sự và các tài liệu liên quan.\n3. Thiết lập chế độ: Bản nháp hoặc Xuất bản chính thức.\n4. Khi xuất bản, hệ thống tự động đồng bộ bài viết sang Bảng tin Mạng lưới App Mobile và hiển thị tại trang chủ tin tức của CLB.\n5. Cơ chế 'Seed on Read' tự động bảo đảm dữ liệu tin tức luôn đầy đủ.",
    api: "GET /news\nPOST /news\nPUT /news/:id\nDELETE /news/:id\nPOST /news/:id/publish",
    db: "public.news (id, title, slug, summary, content, thumbnail_url, author_id, view_count, status='DRAFT'|'PUBLISHED', published_at)\npublic.feed_posts (id, type='NEWS', title, content, thumbnail_url)",
    notes: "Tự động tạo bài viết đồng bộ trên mạng xã hội nội bộ khi tin tức được phát hành."
  },
  {
    id: "NODE-CRM-017",
    group: "Phần II: Web CRM Quản Trị Hệ Thống",
    name: "Gia Hạn Hội Viên & Xử Lý Nợ Phí Niên Liễm",
    target: "Ban Hội Viên, Ban Tài Chính, Ban Thư Ký",
    flow: "1. Quản lý danh sách hội viên theo chu kỳ niên liễm hàng năm (1 năm / 2 năm).\n2. Hệ thống phân loại tự động thành 3 nhóm: Sắp hết hạn trong 30 ngày, Quá hạn nợ phí, và Đã gia hạn thành công.\n3. Ban Thư ký chọn gửi thông báo gia hạn: Hệ thống tự động dispatch thông báo nhắc nhở qua Email và gửi tin nhắn Zalo OA ZNS kèm mã thanh toán VietQR động.\n4. Sau khi hội viên nộp phí, kế toán xác nhận nộp phí thành công, hệ thống tự động cộng thêm 365 ngày vào hạn dùng và kích hoạt lại quyền lợi VIP.",
    api: "GET /members/renewals\nPOST /members/:id/send-renewal-notice\nPOST /members/:id/renew",
    db: "public.members (id, full_name, dues_expired_at, status)\npublic.income_records (id, member_id, category='MEMBERSHIP_DUES', amount, status)\npublic.vione_users (id, status)",
    notes: "Khử prefix mã gia hạn, truy vấn linh hoạt tránh lỗi ép kiểu UUID trong PostgreSQL."
  },
  {
    id: "NODE-CRM-018",
    group: "Phần II: Web CRM Quản Trị Hệ Thống",
    name: "Quản Trị Đào Tạo Đa Thức & Bắn Mạng Lưới Khóa Học",
    target: "Ban Đào Tạo, Ban Điều Hành, Giảng viên",
    flow: "1. Tạo mới chương trình đào tạo doanh nghiệp: Tên khóa học, Giảng viên/Chuyên gia, Hình thức (Trực tiếp Offline, Trực tuyến Online, hoặc Kết hợp Hybrid), Lịch học, Giáo trình tài liệu.\n2. Tích hợp cấu hình phòng học trực tuyến Video Call (Jitsi Meet / Zoom nhúng).\n3. Quản lý danh sách học viên đăng ký tham gia khóa học.\n4. Tải poster khóa học và đính kèm tối đa 5 ảnh/video tư liệu.\n5. Nút 'Bắn Mạng Lưới': Tự động phát thanh bài giới thiệu khóa học lên Bảng tin Mạng lưới App Mobile kèm liên kết đăng ký học.",
    api: "GET /trainings\nPOST /trainings\nPUT /trainings/:id\nDELETE /trainings/:id\nGET /trainings/:id/attendees\nPOST /feed/broadcast-training\nPOST /trainings/:id/media",
    db: "public.trainings (id, title, instructor_name, format='ONLINE'|'OFFLINE'|'HYBRID', start_time, end_time, room_url, syllabus_url, max_students, status)\npublic.training_attendees (id, training_id, member_id, status, registered_at)\npublic.feed_posts (id, type='TRAINING', title, content, link_url, media_urls)",
    notes: "Tích hợp phòng họp trực tuyến và kết nối trực tiếp với mạng xã hội hội viên."
  },
  {
    id: "NODE-CRM-019",
    group: "Phần II: Web CRM Quản Trị Hệ Thống",
    name: "Nhật Ký Lịch Sử Thao Tác Toàn Hệ Thống (Audit Logs)",
    target: "Chủ tịch CLB, Ban Kiểm Tra, Quản trị viên Tối cao",
    flow: "1. Hệ thống tự động ghi lại toàn bộ các thao tác nhạy cảm trên cả Web CRM và Mobile App: Đăng nhập, Đổi mật khẩu, Thêm/Sửa/Xóa hội viên, Phê duyệt chi quỹ, Gán quyền RBAC, Phát hành thông báo.\n2. Mỗi bản ghi lưu trữ đầy đủ: Mã người dùng, Tên hiển thị, Hành động, Phân hệ tác động, Địa chỉ IP, Thiết bị trình duyệt và Dấu thời gian chính xác.\n3. Quản trị viên tìm kiếm, lọc theo ngày tháng, theo loại hành vi và người thao tác.\n4. Hỗ trợ xuất dữ liệu lịch sử thao tác ra file Excel phục vụ thanh tra, kiểm toán.",
    api: "GET /admin/audit-logs\nGET /admin/audit-logs/export-excel",
    db: "public.audit_logs (id, user_id, user_email, action, module, details_json, ip_address, user_agent, created_at)\npublic.members (id, full_name)",
    notes: "Đảm bảo tính bất biến của nhật ký, hỗ trợ kiểm toán an ninh hệ thống."
  },
  {
    id: "NODE-CRM-020",
    group: "Phần II: Web CRM Quản Trị Hệ Thống",
    name: "Trao Cơ Hội Giao Thương Đa Đối Tượng & Hội Nhóm",
    target: "Ban B2B, Ban Điều Hành, Hội viên Doanh nhân",
    flow: "1. Người dùng tạo một cơ hội kinh doanh hoặc gói thầu dự án lớn cần liên danh hợp tác.\n2. Cho phép chọn trao cơ hội cho nhiều người cùng lúc (Multi-select) hoặc trao cho toàn thể một Ban chuyên môn phụ trách.\n3. Hệ thống tạo các liên kết cơ hội độc lập và tự động gửi thông báo tới từng hội viên trong danh sách nhận.\n4. Theo dõi tiến độ kết nối và giá trị giao dịch phát sinh từ cơ hội chia sẻ.",
    api: "POST /opportunities/batch-share\nGET /opportunities/recipients-pool",
    db: "public.opportunities (id, giver_id, title, description, value_amount, status)\npublic.opportunity_shares (opportunity_id, receiver_id, status, created_at)\npublic.members (id, full_name, department)",
    notes: "Mở rộng kết nối kinh doanh quy mô lớn cho các gói thầu liên ngành."
  },
  {
    id: "NODE-CRM-021",
    group: "Phần II: Web CRM Quản Trị Hệ Thống",
    name: "Theme Studio, Icon Picker 14 Tính Năng & Đồng Bộ Giao Diện",
    target: "Chủ tịch CLB, Ban Truyền Thông, Quản trị viên",
    flow: "1. Quản lý nhận diện thương hiệu số qua Theme Studio với 5 VIP Presets: Hoàng Gia, Dạ Hội, Thép Titan, Sen Vàng, Mùa Lễ Hội.\n2. Cung cấp bộ chọn Icon Picker linh hoạt cho 14 tính năng chính của hệ thống.\n3. Khung hình Live Preview Mobile Frame mô phỏng trực quan giao diện thực tế trước khi áp dụng.\n4. Khi quản trị viên chọn kích hoạt chủ đề (ví dụ Mùa Lễ Hội), hệ thống lập tức đồng bộ biến giao diện CSS (--festival-bg-image) thời gian thực xuống toàn bộ Web CRM và Ứng dụng Di động CEO 1983.",
    api: "GET /admin/landing-templates\nPOST /admin/landing-templates\nPOST /admin/themes/active",
    db: "public.landing_templates (id, name, theme_key, primary_color, secondary_color, festival_bg_url, is_active)\npublic.system_settings (key='active_theme_config', value_json)",
    notes: "Đồng bộ giao diện thời gian thực trên cả hai nền tảng Web CRM và Mobile App."
  },
  {
    id: "NODE-CRM-022",
    group: "Phần II: Web CRM Quản Trị Hệ Thống",
    name: "Trung Tâm Thông Báo Quản Trị Hệ Thống (Admin Notification Center)",
    target: "Chủ tịch, Ban Thư Ký, Quản trị viên",
    flow: "1. Tự động quét và hiển thị các cảnh báo quản trị quan trọng: Hồ sơ đăng ký hội viên mới chờ phê duyệt, Hội viên quá hạn hội phí niên liễm, Yêu cầu quên mật khẩu cần cấp lại, Báo cáo sự cố từ người dùng.\n2. Phân loại bằng 4 thẻ KPI Gradient và các Tab bộ lọc trạng thái (Chưa đọc, Đã đọc, Cần xử lý gấp).\n3. Bảng CustomTable sắp xếp theo mức độ ưu tiên và thời gian phát sinh.\n4. Quản trị viên bấm trực tiếp vào thông báo để chuyển hướng đến tác vụ tương ứng.",
    api: "GET /admin/notifications\nPOST /admin/notifications\nPATCH /admin/notifications/:id\nDELETE /admin/notifications/:id",
    db: "public.notifications (id, user_id, title, content, type, is_read, action_url, created_at)\npublic.members (id, full_name)",
    notes: "Tích hợp huy hiệu số đếm thông báo chưa đọc trên thanh điều hướng Sidebar."
  },
  {
    id: "NODE-CRM-023",
    group: "Phần II: Web CRM Quản Trị Hệ Thống",
    name: "Quản Lý Landing Web Dynamic & Cấu Hình Subdomain",
    target: "Ban Truyền Thông, Quản trị viên Kỹ thuật",
    flow: "1. Quản trị các trang đích (Landing Pages) giới thiệu CLB tái hiện chuẩn mực 2 mẫu thiết kế Pinterest:\n   - Mẫu 1 (Timed Cards Opening): Slide chuyển màn hình tự động bằng con lăn chuột/vuốt cảm ứng, thanh tiến trình 5 giây, hiệu ứng split typography sang trọng.\n   - Mẫu 2 (Startup Mobile Showcase): Mockup iPhone 16 Pro mô phỏng giao diện app CEO 1983, dải ruy băng 4 chỉ số vàng (4+ năm, 1.983+ CEO, 500+ Doanh nghiệp, 100+ Tỷ giao thương).\n2. Quản lý menu đa tầng (Dynamic Tree Header Menu) kích hoạt các sub-screens.\n3. Tính năng gán tên miền phụ (subdomain *.ceo1983.viconnect.vn) và API Connector ánh xạ dữ liệu trực tiếp từ CLB.",
    api: "GET /admin/landing-webs\nPOST /admin/landing-webs\nPUT /admin/landing-webs/:id\nDELETE /admin/landing-webs/:id\nPOST /admin/landing-webs/:id/apply-subdomain\nGET /public/landing-webs/:slugOrSubdomain",
    db: "public.app_settings (key='crm_landing_webs_configs', value_json)",
    notes: "Cho phép tạo nhiều trang đích sự kiện với tên miền riêng biệt."
  },
  {
    id: "NODE-CRM-024",
    group: "Phần II: Web CRM Quản Trị Hệ Thống",
    name: "Quản Lý Mẫu Thư Mời Đa Kênh & Trình Tạo Mẫu Thư Nhắc Nhở Tùy Biến",
    target: "Ban Thư Ký, Ban Truyền Thông, Quản trị viên",
    flow: "1. Quản lý mẫu thông báo đa kênh: Gửi qua Email HTML v3 chuẩn nhận diện, Thông báo đẩy In-App CEO 1983, và Gửi tin nhắn Zalo OA ZNS (loại bỏ các tính năng dư thừa VNPay, Zalo Mini App, ZBS).\n2. Trình thiết lập mẫu thư nhắc nhở động (CustomReminderTemplateModal): Cho phép người dùng tạo mẫu thông báo 'Hôm nay trong app CEO 1983 có gì', tự do thêm/bớt các trường thông tin động với đa dạng kiểu dữ liệu:\n   - Kiểu Textarea: Cho phần mô tả dài.\n   - Kiểu Datetime: Cho ngày và giờ diễn ra sự kiện/cuộc họp.\n   - Kiểu Price: Cho mức chi phí, giá vé hoặc hội phí.\n   - Kiểu Mã QR: Cho mã QR điểm danh hoặc quét chuyển khoản thanh toán.\n   - Kiểu Text: Cho văn bản ngắn thông thường.\n3. Hỗ trợ nhập số điện thoại thử nghiệm bằng icon dấu cộng (+) và lựa chọn dữ liệu sự kiện/cuộc họp thực tế từ CSDL để phát thanh thông báo đa kênh.",
    api: "GET /admin/mail-templates\nPUT /admin/mail-templates/:key\nPOST /zalo/send-zns\nGET /zalo/template-configs\nPUT /zalo/template-configs/:templateCode\nPOST /notifications/broadcast-custom",
    db: "public.mail_templates (id, key, title, subject, content_html, is_system, updated_at)\npublic.app_settings (key='crm_invitation_templates' | 'zalo_oa_config', value_json)\npublic.notifications (id, type, content)",
    notes: "Linh hoạt tùy biến trường dữ liệu nhắc nhở và kiểm thử gửi tức thời."
  },

  // ==========================================
  // PHẦN 3: PHÂN HỆ MOBILE APP CEO 1983
  // ==========================================
  {
    id: "NODE-APP-001",
    group: "Phần III: Phân Hệ Mobile App CEO 1983",
    name: "Trang Chủ Ticker Nến Realtime & Shortcut Tiện Ích",
    target: "Hội viên Doanh nhân CEO 1983",
    flow: "1. Hội viên mở app, trang chủ hiển thị Biểu đồ nến Ticker biến động doanh số giao thương thời gian thực.\n2. Hiển thị Banner sự kiện nổi bật và dải phím tắt thông minh (Cơ hội, Danh bạ, Tin nhắn, Sự kiện, Thẻ QR).\n3. Modal chào mừng hội viên cá nhân hóa (WelcomeMemberModal) hiển thị khi đăng nhập đầu ngày.\n4. Tự động đồng bộ hình nền chủ đề Lễ Hội (--festival-bg-image) từ cấu hình Theme Studio của CRM.\n5. Các nút bấm được chuẩn hóa màu nền #FFFFFF với chữ đen sang trọng, dễ đọc.",
    api: "GET /association/home-stats\nGET /admin/landing-templates/active",
    db: "public.opportunities (value_amount, created_at)\npublic.landing_templates (theme_key, festival_bg_url, is_active)\npublic.members (full_name, avatar_url, points)",
    notes: "Tối ưu hóa trải nghiệm mượt mà 60fps chuẩn native ứng dụng di động."
  },
  {
    id: "NODE-APP-002",
    group: "Phần III: Phân Hệ Mobile App CEO 1983",
    name: "Thẻ Hội Viên VIP Số & Mã QR Cá Nhân Bảo Mật",
    target: "Hội viên Doanh nhân",
    flow: "1. Hiển thị Thẻ danh thiếp điện tử VIP mang màu sắc nhận diện thương hiệu CLB (Đỏ - Vàng - Xanh Obsidian).\n2. Thông tin đầy đủ: Ảnh đại diện, Họ tên, Chức vụ trong Ban chuyên môn, Logo doanh nghiệp ở góc phải trên.\n3. Mã QR cá nhân hóa độc bản: Chạm vào để phóng to toàn màn hình phục vụ trao đổi danh thiếp 1 chạm.\n4. Cung cấp công tắc bật/tắt quyền riêng tư: Hội viên có thể chủ động ẩn hoặc hiện Số điện thoại và Email khi đối tác quét thẻ.\n5. Tích hợp camera quét nhanh mã QR danh thiếp của đối tác để lưu vào danh bạ kết nối.",
    api: "GET /association/card-profile\nPUT /association/card-privacy",
    db: "public.members (id, full_name, phone, email, avatar_url, executive_role, department, is_phone_private, is_email_private)\npublic.companies (company_name, logo_url)\npublic.member_cards (id, member_id, card_code, qr_url)",
    notes: "Bảo vệ thông tin liên lạc cá nhân theo cấu hình quyền riêng tư của từng hội viên."
  },
  {
    id: "NODE-APP-003",
    group: "Phần III: Phân Hệ Mobile App CEO 1983",
    name: "Trang Quét Danh Thiếp Công Khai Bảo Mật (Public Web Card)",
    target: "Đối tác quét mã QR, Khách hàng bên ngoài",
    flow: "1. Khi đối tác quét mã QR trên thẻ số của hội viên hoặc truy cập liên kết (/card/:code), hệ thống mở trang danh thiếp công khai.\n2. Giao diện trang trọng, đồng bộ nhận diện thương hiệu với thẻ nội bộ.\n3. Kiểm tra cài đặt quyền riêng tư: Nếu hội viên chọn ẩn SĐT hoặc Email, hệ thống hiển thị văn bản bảo mật '🔒 Đã ẩn theo cài đặt riêng tư của hội viên'.\n4. Cung cấp các nút tương tác: 'Lưu Danh Bạ' (tải file vCard .vcf), 'Ghé thăm Website' công ty, và 'Đăng ký kết nối'.",
    api: "GET /card/public/:code",
    db: "public.members (full_name, avatar_url, bio, phone, email, is_phone_private, is_email_private)\npublic.companies (company_name, tax_code, website_url, logo_url, address)",
    notes: "Trang web tối ưu tải trang cực nhanh, hỗ trợ xem tốt trên mọi trình duyệt di động."
  },
  {
    id: "NODE-APP-004",
    group: "Phần III: Phân Hệ Mobile App CEO 1983",
    name: "Danh Bạ Hội Viên & Bản Đồ 2D Google Maps Dẫn Đường",
    target: "Hội viên Doanh nhân",
    flow: "1. Danh bạ số 100% doanh nhân thành viên chính thức của CLB.\n2. Cung cấp 2 chế độ hiển thị linh hoạt: Chế độ Danh sách và Chế độ Bản đồ 2D.\n3. Chế độ Bản đồ 2D Google Maps (tích hợp Leaflet tile mt1.google.com): Ghim vị trí trụ sở công ty các hội viên trên bản đồ với 2 phạm vi 'Tổng thể' và 'Cá nhân'.\n4. Hội viên chạm vào ghim để xem thông tin doanh nghiệp, ngành nghề và bấm 'Chỉ đường' để kích hoạt Google Maps dẫn đường trực tiếp từ vị trí hiện tại đến công ty đối tác.\n5. Triệt tiêu hoàn toàn lỗi màn hình đen 3D, vận hành mượt mà nhẹ nhàng.",
    api: "GET /association/members\nGET /association/members/locations",
    db: "public.members (id, full_name, avatar_url, phone, department, executive_role)\npublic.companies (id, member_id, company_name, industry, address, lat, lng)",
    notes: "Tích hợp GPS định vị vị trí hiện tại và chỉ đường chính xác theo thời gian thực."
  },
  {
    id: "NODE-APP-005",
    group: "Phần III: Phân Hệ Mobile App CEO 1983",
    name: "Cơ Hội Giao Thương B2B Strip 3 Thẻ Ngang",
    target: "Hội viên Doanh nhân",
    flow: "1. Màn hình giao thương thiết kế dải 3 thẻ thống kê ngang trực quan: 'Tổng chia sẻ', 'Deal đã chốt', 'Tôi share đi' (tuyệt đối không để biểu đồ nặng trong màn này).\n2. Hội viên đăng cơ hội hợp tác kinh doanh mới: Tiêu đề nhu cầu, Mô tả chi tiết, Trị giá hợp đồng dự kiến, Lĩnh vực ngành nghề.\n3. Hội viên nhận cơ hội bấm tiếp nhận, trao đổi và cập nhật trạng thái giao dịch (Đang kết nối -> Đang đàm phán -> Ký kết thành công -> Báo cáo doanh số).\n4. Nút chuyển hướng sang màn hình Thống kê Analytics chuyên sâu.",
    api: "GET /association/opportunities\nPOST /association/opportunities\nPUT /association/opportunities/:id/status",
    db: "public.opportunities (id, giver_id, receiver_id, title, description, value_amount, industry, status='OPEN'|'CONNECTING'|'CLOSED'|'CANCELLED', closed_at)\npublic.members (id, full_name, avatar_url)",
    notes: "Ghi nhận doanh số chốt deal thực tế phục vụ vinh danh Top Giver của CLB."
  },
  {
    id: "NODE-APP-006",
    group: "Phần III: Phân Hệ Mobile App CEO 1983",
    name: "Trung Tâm Thống Kê Hội Viên 5 Phân Loại Nghiệp Vụ",
    target: "Hội viên Doanh nhân, Ban Điều Hành",
    flow: "1. Thống kê hiệu quả hoạt động cá nhân và toàn CLB theo 5 chỉ số: Doanh thu kết nối, Số cơ hội trao đi, Tỷ lệ tham dự sự kiện/họp, Khóa đào tạo hoàn thành, Khách mời giới thiệu.\n2. Biểu đồ ComposedChart trực quan cột-đường sinh động.\n3. Bục vinh danh Top 3 Giver được gom gọn gàng trên 1 hàng ngang, vinh danh Top 1 với avatar viền vàng đặc trưng.\n4. Hỗ trợ bấm nút xuất báo cáo thành tích ra file Excel hoặc in ấn file A4 PDF.",
    api: "GET /association/opportunities/report",
    db: "public.opportunities (giver_id, receiver_id, value_amount, status)\npublic.members (id, full_name, avatar_url)\npublic.event_registrations (member_id, check_in_status)",
    notes: "Thiết kế chuẩn Mobile-first, hiển thị sắc nét trên mọi kích thước màn hình."
  },
  {
    id: "NODE-APP-007",
    group: "Phần III: Phân Hệ Mobile App CEO 1983",
    name: "Giao Thương B2B, Gian Hàng Của Tôi & Danh Mục Quan Tâm",
    target: "Hội viên Doanh nhân",
    flow: "1. Đổi tên danh mục 'Sàn giao thương nội bộ' và 'Chợ giao thương' thành tên chuẩn mực: 'Giao thương'.\n2. Sàn Giao thương: Trưng bày sản phẩm/dịch vụ của các doanh nghiệp thành viên. Lọc theo ngành nghề, tìm kiếm nhanh và nút bấm nhắn tin trực tiếp với chủ doanh nghiệp.\n3. Gian hàng của tôi: Mỗi doanh nghiệp được đăng tối đa 5 sản phẩm/dịch vụ (hiển thị huy hiệu X/5 sản phẩm để chống spam).\n4. Mỗi thẻ sản phẩm đã đăng có Icon 3 chấm bấm vào mở Menu tùy chọn tinh gọn: Chỉnh sửa sản phẩm, Xóa sản phẩm, Chia sẻ liên kết sản phẩm.\n5. Đặc biệt có Danh mục 'Ai đang quan tâm sản phẩm': Hiển thị danh sách chính xác các hội viên đã bấm quan tâm hoặc gửi yêu cầu kết nối với sản phẩm của chính tài khoản đó đăng.",
    api: "GET /association/products\nPOST /association/products\nPUT /association/products/:id\nDELETE /association/products/:id\nGET /association/products/:id/interested-users",
    db: "public.products (id, company_id, member_id, name, description, price, discount_price, image_urls, category, status, view_count)\npublic.product_interests (id, product_id, interested_member_id, note, created_at)\npublic.members (id, full_name, phone, email, avatar_url)\npublic.companies (company_name, logo_url)",
    notes: "Menu 3 chấm tinh tế tiết kiệm diện tích và cung cấp danh mục khách hàng tiềm năng nội bộ."
  },
  {
    id: "NODE-APP-008",
    group: "Phần III: Phân Hệ Mobile App CEO 1983",
    name: "Sự Kiện & Hoạt Động (Đăng Ký Vé, Tải Poster & Up Ảnh Trực Tiếp)",
    target: "Hội viên Doanh nhân",
    flow: "1. Đổi tên giao diện thành 'Sự kiện & Hoạt động'.\n2. Phân loại chuẩn 2 tab danh mục: Tab Sự kiện (Gala, Đại hội, Tọa đàm) và Tab Hoạt động (Kết nối B2B giữa 2 tài khoản, Chương trình đào tạo từ CRM). Loại bỏ các tab trùng lặp.\n3. Chuẩn hóa hiển thị: Duy nhất 1 nút 'Xem tất cả' và nút này tự động ẩn đi khi đang chọn ở tab 'Tất cả'.\n4. Hội viên bấm 'Đăng ký tham gia' nhận vé điện tử kèm mã QR check-in.\n5. Có chức năng 'Tải poster' đối với các sự kiện chính thức.\n6. Trong quá trình diễn ra sự kiện, có nút 'Tải ảnh' hoặc 'Chụp ảnh trực tiếp' từ điện thoại để đính kèm vào sự kiện (giới hạn tối đa 5 ảnh, có tính năng up video), lưu vào lịch sử sự kiện và tự động đẩy bài sang màn hình Mạng lưới.",
    api: "GET /association/events-and-meetings\nPOST /events/:id/register\nPOST /events/:id/cancel\nPOST /events/:id/media\nGET /events/:id/my-ticket",
    db: "public.events (id, title, banner_url, poster_url, start_date, end_date, location, status)\npublic.meetings (id, title, meeting_date)\npublic.trainings (id, title, start_time)\npublic.event_registrations (id, event_id, member_id, ticket_code, status)\npublic.feed_posts (id, type='EVENT_MEDIA', media_urls, author_id)",
    notes: "Nút chụp ảnh trực tiếp và đăng tải ảnh tư liệu đa phương tiện trong sự kiện."
  },
  {
    id: "NODE-APP-009",
    group: "Phần III: Phân Hệ Mobile App CEO 1983",
    name: "Biểu Quyết Trực Tuyến Gắn Với Sự Kiện / Cuộc Họp",
    target: "Hội viên Doanh nhân tham dự",
    flow: "1. Danh sách các phiên biểu quyết, bầu cử đang mở gắn liền với Sự kiện hoặc Cuộc họp mà hội viên tham gia.\n2. Hội viên đọc nội dung tờ trình, chọn phương án tán thành/không tán thành/ý kiến khác.\n3. Bấm 'Gửi phiếu biểu quyết', hệ thống ghi nhận phiếu bầu vào CSDL PostgreSQL.\n4. Cập nhật tỷ lệ phần trăm (%) biểu quyết thời gian thực trên màn hình ứng dụng và màn hình chiếu lớn tại sự kiện.",
    api: "GET /association/polls\nPOST /association/polls/:id/vote",
    db: "public.polls (id, event_id, meeting_id, title, is_active)\npublic.poll_options (id, poll_id, option_text, vote_count)\npublic.poll_votes (id, poll_id, option_id, member_id, voted_at)",
    notes: "Mỗi hội viên chỉ được bỏ phiếu một lần duy nhất cho mỗi phiên biểu quyết."
  },
  {
    id: "NODE-APP-010",
    group: "Phần III: Phân Hệ Mobile App CEO 1983",
    name: "Bảng Tin Mạng Lưới Doanh Nhân & Tương Tác Xã Hội",
    target: "Toàn thể Hội viên Doanh nhân",
    flow: "1. Mạng xã hội doanh nhân CEO 1983: Hội viên đăng bài viết chia sẻ kinh nghiệm điều hành, kết nối kinh doanh, đính kèm hình ảnh và video.\n2. Tương tác đa dạng: Thả cảm xúc (Like, Tym, Claps), Bình luận trao đổi dưới bài viết.\n3. Tiếp nhận các bài phát thanh tự động từ CRM ('Bắn Mạng Lưới' từ Sự kiện, Cuộc họp, Khóa đào tạo).\n4. Đặc thù bảo mật: Khi bài viết có mã QR tham dự/điểm danh, hệ thống tự động hiển thị dưới dạng đường link an toàn, không hiển thị mã QR thô trên màn hình Mạng lưới.\n5. Hiển thị huy hiệu điểm danh '@HọTên [✓ Đã Check-in]' tạo không khí sôi động.",
    api: "GET /association/feed\nPOST /association/feed/posts\nPOST /association/feed/posts/:id/comments\nPOST /association/feed/posts/:id/react\nDELETE /association/feed/posts/:id",
    db: "public.feed_posts (id, author_id, type, title, content, link_url, media_urls, likes_count, comments_count, created_at)\npublic.feed_comments (id, post_id, author_id, content, created_at)\npublic.feed_reactions (id, post_id, member_id, reaction_type)",
    notes: "Mã QR được hiển thị dưới dạng đường link bảo mật trên màn Mạng lưới."
  },
  {
    id: "NODE-APP-011",
    group: "Phần III: Phân Hệ Mobile App CEO 1983",
    name: "Hồ Sơ Cá Nhân & Quản Trị Hồ Sơ Doanh Nghiệp Thành Viên",
    target: "Hội viên Doanh nhân",
    flow: "1. Quản lý thông tin hồ sơ cá nhân 360 độ: Ảnh đại diện, Họ tên, Ngày sinh, Giới tính, Số điện thoại, Email, Tiểu sử lãnh đạo.\n2. Hồ sơ Doanh nghiệp thành viên: Logo, Tên doanh nghiệp, Mã số thuế, Ngành nghề, Quy mô vốn/nhân sự, Trụ sở, Sản phẩm dịch vụ chủ lực.\n3. Xem Hợp đồng hội viên điện tử, tình trạng đóng hội phí niên liễm và thẻ VIP liên kết.\n4. Tải lên và cập nhật ảnh đại diện sắc nét thông qua camera điện thoại.",
    api: "GET /association/profile\nPUT /association/profile\nPOST /upload/avatar",
    db: "public.members (id, full_name, avatar_url, bio, phone, email, dues_expired_at)\npublic.companies (company_name, tax_code, industry, employee_scale, website_url, logo_url)\npublic.vione_users (id, email)",
    notes: "Lấy chuẩn 100% dữ liệu đã đăng ký của hội viên từ CSDL, không bị thiếu sót trường."
  },
  {
    id: "NODE-APP-012",
    group: "Phần III: Phân Hệ Mobile App CEO 1983",
    name: "Cài Đặt Hệ Thống, Bảo Mật Tài Khoản & Hỗ Trợ 24/7",
    target: "Hội viên Doanh nhân",
    flow: "1. Tùy chỉnh ngôn ngữ hiển thị (Tiếng Việt / English), chuyển đổi giao diện Sáng / Tối (Light/Dark mode).\n2. Quản lý cấu hình thông báo đẩy (Bật/tắt thông báo sự kiện, tin nhắn, nhắc hẹn).\n3. Đổi mật khẩu bảo mật tài khoản di động.\n4. Khối Thông tin hỗ trợ 24/7: Hotline Ban Thư Ký CLB, Email tiếp nhận phản hồi và Hướng dẫn sử dụng app.",
    api: "PUT /auth/change-password\nGET /system/support-info",
    db: "public.vione_users (password_hash)\npublic.system_settings (key='support_contact', value_json)",
    notes: "Hỗ trợ thay đổi mật khẩu và quản lý bảo mật cá nhân thuận tiện."
  },
  {
    id: "NODE-APP-013",
    group: "Phần III: Phân Hệ Mobile App CEO 1983",
    name: "Kho Ưu Đãi Đặc Quyền Doanh Nhân (VIP Perks) & Mã QR Động",
    target: "Hội viên Doanh nhân",
    flow: "1. Kho đặc quyền ưu đãi dành riêng cho hội viên CEO 1983 do các doanh nghiệp thành viên và đối tác tài trợ cung cấp (Nhà hàng cao cấp, Khách sạn nghỉ dưỡng, Dịch vụ phòng vé, Tư vấn luật, Golf).\n2. Xem chi tiết ưu đãi, điều kiện áp dụng và địa điểm sử dụng kèm liên kết mở Google Maps chỉ đường trực tiếp.\n3. Mỗi ưu đãi cung cấp một mã QR động để nhân viên tại điểm chấp nhận ưu đãi quét xác thực quyền lợi VIP.",
    api: "GET /association/perks\nGET /association/perks/:id/qr",
    db: "public.perks (id, title, provider_company_id, discount_percent, description, location_address, lat, lng, valid_until, qr_code_secret, is_active)\npublic.companies (company_name, logo_url)",
    notes: "Mã QR động thay đổi theo thời gian đảm bảo tính xác thực của ưu đãi."
  },
  {
    id: "NODE-APP-014",
    group: "Phần III: Phân Hệ Mobile App CEO 1983",
    name: "Cầu Nối Native Capacitor (Android/iOS) & Push Notifications",
    target: "Hội viên Doanh nhân sử dụng App Native",
    flow: "1. Cầu nối Native Capacitor tích hợp trên nền tảng Android (APK/AAB) và iOS (IPA).\n2. Tối ưu hóa giao diện di động: Tương thích vùng an toàn (Safe Area), thanh trạng thái (StatusBar) và phím Back cứng trên Android.\n3. Đăng ký nhận thông báo đẩy qua Firebase Cloud Messaging (FCM) và Web Push Service Worker.\n4. Khi có sự kiện mới, nhắc hẹn lịch họp, tin nhắn kết nối hoặc giao việc khẩn cấp, máy chủ tự động bắn Push Notification hiển thị trên màn hình khóa điện thoại.",
    api: "POST /notifications/subscribe\nPOST /notifications/unsubscribe\nPOST /notifications/test-push",
    db: "public.user_push_tokens (id, user_id, device_token, platform='ANDROID'|'IOS'|'WEB', is_active, updated_at)\npublic.notifications (id, user_id, title, content, is_read)",
    notes: "Cung cấp trải nghiệm mượt mà 100% giống ứng dụng native thuần túy."
  },
  {
    id: "NODE-APP-015",
    group: "Phần III: Phân Hệ Mobile App CEO 1983",
    name: "Gặp Gỡ Kết Nối B2B 1-on-1 Giữa Hai Tài Khoản",
    target: "Hội viên Doanh nhân",
    flow: "1. Phân hệ kết nối chuyên sâu giữa 2 hội viên: Hội viên tra cứu đối tác phù hợp trong danh bạ và bấm 'Đặt lịch hẹn kết nối 1-on-1'.\n2. Chọn ngày giờ gặp, hình thức (Gặp trực tiếp tại công ty, Cafe kết nối, hoặc Video Call online) và nội dung trao đổi mong muốn.\n3. Đối tác nhận được lời mời: Có thể Chấp nhận, Từ chối kèm lý do hoặc Đề xuất dời lịch hẹn.\n4. Sau buổi gặp, hai bên cập nhật kết quả trao đổi và ghi nhận giá trị cơ hội hợp tác phát sinh.",
    api: "GET /association/b2b-connect/my-meetings\nPOST /association/b2b-connect/request\nPATCH /association/b2b-connect/:id/status\nPOST /association/b2b-connect/:id/result",
    db: "public.b2b_connections (id, sender_id, receiver_id, scheduled_at, location_type, location_detail, agenda, status='PENDING'|'ACCEPTED'|'REJECTED'|'COMPLETED', result_notes, deal_value)\npublic.members (id, full_name, avatar_url)",
    notes: "Tự động đồng bộ lịch hẹn 1-on-1 đã xác nhận vào Lịch hoạt động cá nhân."
  },
  {
    id: "NODE-APP-016",
    group: "Phần III: Phân Hệ Mobile App CEO 1983",
    name: "Đào Tạo Di Động & Phòng Họp Video Call Trực Tuyến",
    target: "Hội viên Doanh nhân",
    flow: "1. Danh sách các khóa đào tạo nâng cao năng lực quản trị doanh nghiệp từ Ban Đào Tạo CLB.\n2. Xem chi tiết lộ trình học, thông tin chuyên gia giảng dạy và tài liệu bài giảng số (file PDF/Word).\n3. Bấm 'Vào phòng học trực tuyến': Ứng dụng kích hoạt giao diện phòng họp Video Call trực tiếp trong app (nhúng Jitsi Meet SDK/WebRTC), hỗ trợ đầy đủ mic, camera, chat, giơ tay phát biểu mà không cần cài đặt phần mềm bên ngoài.",
    api: "GET /association/trainings\nPOST /trainings/:id/register\nGET /trainings/:id/room-token",
    db: "public.trainings (id, title, instructor_name, start_time, end_time, room_url, syllabus_url)\npublic.training_attendees (id, training_id, member_id, status)",
    notes: "Tham gia lớp học trực tuyến mượt mà ngay trên thiết bị di động."
  },
  {
    id: "NODE-APP-017",
    group: "Phần III: Phân Hệ Mobile App CEO 1983",
    name: "Lịch Hoạt Động & Báo Thức Nhắc Hẹn Đa Kênh Tự Động",
    target: "Hội viên Doanh nhân",
    flow: "1. Mọi Sự kiện CLB, Cuộc họp Ban chuyên môn, Khóa đào tạo và Cuộc gặp B2B 1-on-1 mà hội viên đã đăng ký/chấp nhận tham gia đều được TỰ ĐỘNG LƯU VÀO LỊCH HOẠT ĐỘNG.\n2. Cung cấp 2 chế độ xem giao diện linh hoạt: Dạng Lưới lịch tháng (Grid Calendar) và Dạng Danh sách dòng thời gian (Timeline List).\n3. Nút 'Bật nhắc' (click lần 2 để bỏ nhắc) cho từng hoạt động.\n4. Hệ thống Active Reminder Engine hoạt động tự động:\n   - Nhắc hẹn tại Popup chào mừng ngay lần đầu mở app trong ngày.\n   - Bắn thông báo đẩy vào Trung tâm Thông báo trên app.\n   - Rung chuông phát thông báo Toast native trên màn hình điện thoại khi sắp đến giờ diễn ra hoạt động.",
    api: "GET /association/calendar/my-schedule\nPOST /association/calendar/toggle-reminder",
    db: "public.events (id, title, start_date)\npublic.meetings (id, title, meeting_date)\npublic.trainings (id, title, start_time)\npublic.b2b_connections (id, scheduled_at)\npublic.calendar_reminders (id, member_id, activity_type, activity_id, is_reminder_enabled, reminded_today)",
    notes: "Tích hợp đồng bộ tự động 4 nguồn hoạt động và nhắc hẹn đa tầng thông minh."
  },

  // ==========================================
  // PHẦN 4: LUỒNG KHÁCH VÃNG LAI & KIỂM TRA MÃ QR AN TOÀN
  // ==========================================
  {
    id: "NODE-EXT-001",
    group: "Phần IV: Luồng Khách Vãng Lai & Kiểm Tra Mã QR An Toàn",
    name: "Quét Mã QR Đăng Ký Khách & Tự Động Bắn Email Cảnh Báo Khi QR Hết Hạn / Bị Xóa",
    target: "Khách mời vãng lai quét mã QR từ Poster, Mạng xã hội, Email hoặc Zalo",
    flow: "1. Khách quét mã QR sự kiện/đào tạo (được in trên banner standee, chia sẻ trên mạng xã hội hoặc gửi qua email/Zalo), trình duyệt mở trang đăng ký vé khách (/guest-event-register/$eventId).\n2. Cơ chế kiểm tra an toàn mã QR (QR Safety Guard):\n   - Nếu sự kiện/khóa đào tạo đã bị ban tổ chức XÓA khỏi hệ thống, hoặc mã QR ĐÃ HẾT HẠN, hoặc ĐÃ THAY ĐỔI:\n   - Khi khách bấm gửi biểu mẫu đăng ký, hệ thống lập tức chặn lại và tự động kích hoạt mail.service.ts (hàm sendQrChangedOrExpiredEmail) gửi ngay một email thông báo lịch sự tới hòm thư của khách: thông báo sự kiện đã thay đổi/mã QR không còn sử dụng được, đồng thời cung cấp thông tin liên hệ Ban Thư Ký CLB nếu muốn biết thêm chi tiết.\n   - Đồng thời trên màn hình đăng ký hiển thị thông báo trạng thái trang trọng, rõ ràng.\n3. Nếu mã QR còn hiệu lực hợp lệ:\n   - Hệ thống lưu thông tin đăng ký vào CSDL, sinh mã vé điện tử QR độc bản và tự động gửi email xác nhận tham dự kèm vé (sendEventTicketEmail) tới hộp thư của khách.",
    api: "GET /public/events/:id/details\nPOST /events/:id/guest-register",
    db: "public.events (id, title, start_date, location, status, is_deleted)\npublic.event_registrations (id, event_id, guest_name, guest_email, guest_phone, ticket_code, check_in_status)\npublic.mail_templates (key='QR_EXPIRED_OR_CHANGED' | 'EVENT_TICKET_CONFIRMATION')",
    notes: "Triệt tiêu hoàn toàn rủi ro quét nhầm mã QR cũ hoặc sự kiện đã hủy; tự động chăm sóc và hướng dẫn khách qua email."
  }
];

// Hàm tạo tài liệu Word (.docx)
async function generateDocx(outputPath) {
  console.log(`Bắt đầu tạo file Word (.docx): ${outputPath}...`);

  const primaryNavy = "003B95";
  const amberGold = "F59E0B";
  const lightGray = "F8FAFC";
  const borderNavy = "CBD5E1";

  // Tạo các hàng cho bảng
  const tableRows = [
    // Header Row
    new TableRow({
      tableHeader: true,
      children: [
        new TableCell({
          width: { size: 600, type: WidthType.DXA },
          shading: { fill: primaryNavy, type: ShadingType.CLEAR },
          children: [new Paragraph({ children: [new TextRun({ text: "STT", bold: true, color: "FFFFFF" })], alignment: AlignmentType.CENTER })]
        }),
        new TableCell({
          width: { size: 2200, type: WidthType.DXA },
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
          width: { size: 2600, type: WidthType.DXA },
          shading: { fill: primaryNavy, type: ShadingType.CLEAR },
          children: [new Paragraph({ children: [new TextRun({ text: "Bảng CSDL PostgreSQL", bold: true, color: "FFFFFF" })], alignment: AlignmentType.CENTER })]
        }),
      ]
    })
  ];

  let currentGroup = "";
  let index = 1;

  for (const item of SYSTEM_FEATURES) {
    // Nếu chuyển nhóm, chèn một hàng phân nhóm lớn
    if (item.group !== currentGroup) {
      currentGroup = item.group;
      tableRows.push(
        new TableRow({
          children: [
            new TableCell({
              columnSpan: 5,
              shading: { fill: "E0E7FF", type: ShadingType.CLEAR },
              children: [
                new Paragraph({
                  children: [new TextRun({ text: currentGroup.toUpperCase(), bold: true, color: primaryNavy, size: 22 })],
                  alignment: AlignmentType.LEFT
                })
              ]
            })
          ]
        })
      );
    }

    // Các đoạn văn trong cột Luồng
    const flowParas = item.flow.split('\n').map(line => 
      new Paragraph({ 
        children: [new TextRun({ text: line, size: 18 })],
        spacing: { after: 60 }
      })
    );

    // Thêm ghi chú kỹ thuật nếu có
    if (item.notes) {
      flowParas.push(
        new Paragraph({
          children: [
            new TextRun({ text: "⭐ Ràng buộc: ", bold: true, color: amberGold, size: 17 }),
            new TextRun({ text: item.notes, italics: true, size: 17 })
          ],
          spacing: { before: 60 }
        })
      );
    }

    // Các đoạn văn trong cột API
    const apiParas = item.api.split('\n').map(line => {
      const parts = line.split(' ');
      const method = parts[0] || "";
      const endpoint = parts.slice(1).join(' ') || "";
      return new Paragraph({
        children: [
          new TextRun({ text: method + " ", bold: true, color: method === 'GET' ? "0284C7" : method === 'POST' ? "16A34A" : method === 'PUT' || method === 'PATCH' ? "D97706" : "DC2626", size: 17 }),
          new TextRun({ text: endpoint, size: 17 })
        ],
        spacing: { after: 40 }
      });
    });

    // Các đoạn văn trong cột DB
    const dbParas = item.db.split('\n').map(line => {
      return new Paragraph({
        children: [new TextRun({ text: line, size: 17, font: "Consolas" })],
        spacing: { after: 40 }
      });
    });

    tableRows.push(
      new TableRow({
        children: [
          new TableCell({
            width: { size: 600, type: WidthType.DXA },
            shading: { fill: index % 2 === 0 ? lightGray : "FFFFFF", type: ShadingType.CLEAR },
            children: [new Paragraph({ children: [new TextRun({ text: index.toString(), bold: true, size: 18 })], alignment: AlignmentType.CENTER })]
          }),
          new TableCell({
            width: { size: 2200, type: WidthType.DXA },
            shading: { fill: index % 2 === 0 ? lightGray : "FFFFFF", type: ShadingType.CLEAR },
            children: [
              new Paragraph({ children: [new TextRun({ text: `[${item.id}]`, bold: true, color: primaryNavy, size: 18 })] }),
              new Paragraph({ children: [new TextRun({ text: item.name, bold: true, size: 19 })], spacing: { before: 40 } }),
              new Paragraph({ children: [new TextRun({ text: `(${item.target})`, italics: true, color: "64748B", size: 16 })], spacing: { before: 40 } })
            ]
          }),
          new TableCell({
            width: { size: 3800, type: WidthType.DXA },
            shading: { fill: index % 2 === 0 ? lightGray : "FFFFFF", type: ShadingType.CLEAR },
            children: flowParas
          }),
          new TableCell({
            width: { size: 2200, type: WidthType.DXA },
            shading: { fill: index % 2 === 0 ? lightGray : "FFFFFF", type: ShadingType.CLEAR },
            children: apiParas
          }),
          new TableCell({
            width: { size: 2600, type: WidthType.DXA },
            shading: { fill: index % 2 === 0 ? lightGray : "FFFFFF", type: ShadingType.CLEAR },
            children: dbParas
          })
        ]
      })
    );

    index++;
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: {
              width: 16838, // Khổ ngang (Landscape A4: 16838 dxa x 11906 dxa)
              height: 11906
            },
            margin: {
              top: 720,
              bottom: 720,
              left: 720,
              right: 720
            }
          }
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: "HIỆP HỘI DOANH NHÂN CEO 1983 (HANOIBA) - BẢN ĐẶC TẢ HỆ THỐNG PHẦN MỀM TOÀN DIỆN", bold: true, color: primaryNavy, size: 16 }),
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
                  new TextRun({ text: "Bảo mật nội bộ | Ngày lập: 14/11/2026 | Trang: ", size: 16 }),
                  new TextRun({ children: [PageNumber.CURRENT], size: 16 })
                ],
                alignment: AlignmentType.CENTER
              })
            ]
          })
        },
        children: [
          new Paragraph({
            children: [
              new TextRun({ text: "BẢNG ĐẶC TẢ CHI TIẾT TOÀN BỘ CHỨC NĂNG HỆ THỐNG", bold: true, size: 36, color: primaryNavy })
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 120 }
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "HỆ SINH THÁI ĐIỀU HÀNH WEB CRM & ỨNG DỤNG DI ĐỘNG CEO 1983 (HANOIBA)", bold: true, size: 24, color: amberGold })
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 80 }
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "Phiên bản: 5.0 | Chuẩn hóa 47 Functional Nodes | Khử bỏ 100% Mock Data | Đồng bộ Cơ sở dữ liệu PostgreSQL", italics: true, size: 18, color: "64748B" })
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 240 }
          }),
          new Table({
            rows: tableRows,
            width: { size: 11400, type: WidthType.DXA }
          })
        ]
      }
    ]
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(outputPath, buffer);
  console.log(`Đã xuất thành công file Word: ${outputPath} (${buffer.length} bytes)`);
}

// Hàm tạo HTML hoàn chỉnh và render ra PDF chuẩn A4 vector bằng Playwright
async function generatePdf(outputPath) {
  console.log(`Bắt đầu tạo file PDF chuẩn A4: ${outputPath}...`);

  const primaryNavy = "#003B95";
  const amberGold = "#F59E0B";

  let rowsHtml = "";
  let currentGroup = "";
  let index = 1;

  for (const item of SYSTEM_FEATURES) {
    if (item.group !== currentGroup) {
      currentGroup = item.group;
      rowsHtml += `
        <tr class="group-header">
          <td colspan="5">${currentGroup.toUpperCase()}</td>
        </tr>
      `;
    }

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
      <tr class="${index % 2 === 0 ? 'even' : 'odd'}">
        <td class="col-stt">${index}</td>
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
    index++;
  }

  const htmlContent = `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>Bản Đặc Tả Toàn Bộ Chức Năng Hệ Thống CEO 1983 (HanoiBA)</title>
  <style>
    @page {
      size: A4 landscape;
      margin: 10mm 8mm 12mm 8mm;
      @bottom-center {
        content: "Trang " counter(page) " / " counter(pages);
        font-family: Arial, sans-serif;
        font-size: 8pt;
        color: #64748B;
      }
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
    tr.group-header td {
      background-color: #E0E7FF;
      color: ${primaryNavy};
      font-weight: bold;
      font-size: 9.5pt;
      padding: 8px 6px;
      border: 1px solid #CBD5E1;
    }
    tr.even { background-color: #F8FAFC; }
    tr.odd { background-color: #FFFFFF; }
    .col-stt {
      text-align: center;
      font-weight: bold;
      width: 25px;
    }
    .col-node {
      width: 160px;
    }
    .col-flow {
      width: 380px;
    }
    .col-api {
      width: 180px;
    }
    .col-db {
      width: 200px;
    }
    .node-id {
      color: ${primaryNavy};
      font-weight: bold;
      font-size: 8.5pt;
    }
    .node-name {
      font-weight: bold;
      color: #0F172A;
      margin: 2px 0;
    }
    .node-target {
      color: #64748B;
      font-size: 7.5pt;
      font-style: italic;
    }
    .flow-step {
      margin-bottom: 3px;
    }
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
    .endpoint {
      color: #334155;
      word-break: break-all;
    }
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
    <h1>BẢNG ĐẶC TẢ CHI TIẾT TOÀN BỘ CHỨC NĂNG HỆ THỐNG</h1>
    <h2>HỆ SINH THÁI ĐIỀU HÀNH WEB CRM & ỨNG DỤNG DI ĐỘNG CEO 1983 (HANOIBA)</h2>
    <div class="sub">Phiên bản: 5.0 | Chuẩn hóa 47 Functional Nodes | 100% CSDL PostgreSQL Realtime | Tách Biệt Độc Lập Web CRM & Mobile App</div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width: 25px;">STT</th>
        <th style="width: 160px;">Tên Chức Năng & Mã Node</th>
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

  // Lưu file HTML tạm thời để Playwright đọc
  const tempHtmlPath = path.join(__dirname, 'temp_spec_report.html');
  fs.writeFileSync(tempHtmlPath, htmlContent, 'utf-8');

  // Khởi động Chromium bằng Google Chrome đã cài sẵn trên máy
  const chromePath = fs.existsSync('C:/Program Files/Google/Chrome/Application/chrome.exe')
    ? 'C:/Program Files/Google/Chrome/Application/chrome.exe'
    : 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
  
  const browser = await chromium.launch({ 
    headless: true,
    executablePath: chromePath
  });
  const page = await browser.newPage();
  await page.goto('file://' + tempHtmlPath.replace(/\\/g, '/'), { waitUntil: 'networkidle' });

  // In ra file PDF
  await page.pdf({
    path: outputPath,
    format: 'A4',
    landscape: true,
    printBackground: true,
    margin: {
      top: '8mm',
      bottom: '10mm',
      left: '8mm',
      right: '8mm'
    },
    displayHeaderFooter: true,
    headerTemplate: `
      <div style="font-family: Arial; font-size: 7pt; color: #94A3B8; width: 100%; text-align: right; padding-right: 10mm;">
        HIỆP HỘI DOANH NHÂN CEO 1983 (HANOIBA) - TÀI LIỆU ĐẶC TẢ KIẾN TRÚC KỸ THUẬT VÀ NGHIỆP VỤ HỆ THỐNG
      </div>
    `,
    footerTemplate: `
      <div style="font-family: Arial; font-size: 7pt; color: #64748B; width: 100%; display: flex; justify-content: space-between; padding: 0 10mm;">
        <span>Bảo mật nội bộ CLB Doanh Nhân CEO 1983 | Xuất ngày: 14/11/2026</span>
        <span>Trang <span class="pageNumber"></span> / <span class="totalPages"></span></span>
      </div>
    `
  });

  await browser.close();

  // Dọn dẹp HTML tạm
  if (fs.existsSync(tempHtmlPath)) {
    fs.unlinkSync(tempHtmlPath);
  }

  console.log(`Đã xuất thành công file PDF: ${outputPath}`);
}

async function main() {
  const docxTarget1 = path.resolve(__dirname, '../document/BANG_DAC_TA_CHI_TIET_TOAN_BO_CHUC_NANG_CEO1983.docx');
  const docxTarget2 = path.resolve(__dirname, '../apps/ceo1983_app_fe/public/docs/BANG_DAC_TA_CHI_TIET_TOAN_BO_CHUC_NANG_CEO1983.docx');

  const pdfTarget1 = path.resolve(__dirname, '../document/BANG_DAC_TA_CHI_TIET_TOAN_BO_CHUC_NANG_CEO1983.pdf');
  const pdfTarget2 = path.resolve(__dirname, '../apps/ceo1983_app_fe/public/docs/BANG_DAC_TA_CHI_TIET_TOAN_BO_CHUC_NANG_CEO1983.pdf');

  // Đảm bảo thư mục tồn tại
  [path.dirname(docxTarget1), path.dirname(docxTarget2)].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  });

  // Sinh file Word
  await generateDocx(docxTarget1);
  fs.copyFileSync(docxTarget1, docxTarget2);
  console.log(`Đã copy file Word sang: ${docxTarget2}`);

  // Sinh file PDF
  await generatePdf(pdfTarget1);
  fs.copyFileSync(pdfTarget1, pdfTarget2);
  console.log(`Đã copy file PDF sang: ${pdfTarget2}`);

  console.log("Hoàn thành 100% quá trình tạo tài liệu đặc tả chức năng!");
}

main().catch(err => {
  console.error("Lỗi khi sinh tài liệu:", err);
  process.exit(1);
});
