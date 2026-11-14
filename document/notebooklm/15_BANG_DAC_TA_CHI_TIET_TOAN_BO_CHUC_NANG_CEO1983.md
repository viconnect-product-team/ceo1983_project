# BẢNG ĐẶC TẢ CHI TIẾT TOÀN BỘ CHỨC NĂNG HỆ THỐNG CEO 1983 (HANOIBA)

*Phiên bản: 5.0 | Chuẩn hóa 47 Functional Nodes | 100% CSDL PostgreSQL Realtime | Tách Biệt Độc Lập Web CRM & Mobile App*

---


## PHẦN I: HẠ TẦNG CORE, XÁC THỰC & BẢO MẬT

### 1. [NODE-CORE-001] Đăng Nhập Hệ Thống Đa Nền Tảng (JWT, OAuth & Biometric)
- **Đối tượng sử dụng**: Chủ tịch, Ban Điều Hành, Ban Thư Ký, Kế toán, Hội viên Doanh nhân
- **Luồng nghiệp vụ chi tiết**:
  1. Người dùng truy cập Web CRM (/login) hoặc App Mobile (/association/login) và nhập Email/Username cùng Mật khẩu.
  2. Hỗ trợ đăng nhập nhanh bằng Google OAuth và Apple Sign-in trên thiết bị di động.
  3. Backend tiếp nhận, truy vấn thông tin tài khoản và kiểm tra mật khẩu qua hàm so khớp băm bảo mật bcrypt.
  4. Nếu xác thực thành công, hệ thống cấp phát cặp Access Token (JWT thời hạn ngắn) và Refresh Token (lưu bảo mật).
  5. Tải nạp thông tin hồ sơ Hội viên, vai trò chức danh trong CLB và ma trận quyền hạn RBAC gắn liền.
  6. Hệ thống điều hướng chính xác: Tài khoản quản trị vào thẳng Web CRM Dashboard, tài khoản Hội viên chuyển hướng vào Trang chủ App Mobile CEO 1983.
- **API Endpoints Backend**:
`http
POST /auth/login
POST /auth/google
POST /auth/apple
POST /auth/refresh-token
`
- **Bảng CSDL PostgreSQL**:
`sql
public.vione_users (id, email, password_hash, status, is_verified, last_login_at)
public.user_roles (user_id, role_id)
public.roles (id, code, name)
public.members (id, user_id, full_name, avatar_url, executive_role, department)
`
- **Ràng buộc & Ghi chú**: Token được mã hóa an toàn, phân tách phiên làm việc độc lập giữa Web CRM quản trị và Mobile App.

---

### 2. [NODE-CORE-002] Đăng Xuất & Thu Hồi Phiên Đăng Nhập
- **Đối tượng sử dụng**: Toàn bộ người dùng trên Web CRM và Mobile App
- **Luồng nghiệp vụ chi tiết**:
  1. Người dùng bấm nút 'Đăng xuất' tại menu hồ sơ cá nhân.
  2. Client gửi yêu cầu thu hồi token lên máy chủ Backend.
  3. Backend vô hiệu hóa Refresh Token tương ứng và ghi nhận thời gian đăng xuất vào nhật ký phiên.
  4. Client dọn sạch bộ nhớ cục bộ (localStorage, sessionStorage, cookie) và hủy phiên đăng nhập.
  5. Điều hướng người dùng về màn hình đăng nhập an toàn.
- **API Endpoints Backend**:
`http
POST /auth/logout
`
- **Bảng CSDL PostgreSQL**:
`sql
public.vione_users (id, last_logout_at)
public.audit_logs (user_id, action='LOGOUT', timestamp, ip_address)
`
- **Ràng buộc & Ghi chú**: Xóa sạch bộ nhớ đệm cache và ngắt kết nối WebSocket/Socket.IO để tránh rò rỉ dữ liệu.

---

### 3. [NODE-CORE-003] Đổi Mật Khẩu Chủ Động & Ràng Buộc Bảo Mật
- **Đối tượng sử dụng**: Tất cả Hội viên và Cán bộ Quản trị
- **Luồng nghiệp vụ chi tiết**:
  1. Người dùng truy cập mục Đổi mật khẩu tại cài đặt tài khoản cá nhân.
  2. Nhập mật khẩu hiện tại, mật khẩu mới và xác nhận lại mật khẩu mới (ràng buộc tối thiểu 6-8 ký tự, có chữ và số).
  3. Backend kiểm tra tính chính xác của mật khẩu hiện tại thông qua bcrypt so sánh hash.
  4. Nếu hợp lệ, mật khẩu mới được băm bằng bcrypt với salt rounds = 10 và cập nhật trực tiếp vào cơ sở dữ liệu.
  5. Trả về thông báo thành công và ghi nhận lịch sử đổi mật khẩu vào hệ thống.
- **API Endpoints Backend**:
`http
PUT /auth/change-password
`
- **Bảng CSDL PostgreSQL**:
`sql
public.vione_users (id, password_hash, updated_at)
public.audit_logs (user_id, action='CHANGE_PASSWORD', timestamp)
`
- **Ràng buộc & Ghi chú**: Bắt buộc kiểm tra mật khẩu cũ trước khi cho phép lưu mật khẩu mới.

---

### 4. [NODE-CORE-004] Quên Mật Khẩu & Luồng Tiếp Nhận Phê Duyệt Cấp Mới Qua CRM
- **Đối tượng sử dụng**: Hội viên quên mật khẩu & Ban Quản trị CRM
- **Luồng nghiệp vụ chi tiết**:
  1. Tại màn hình đăng nhập, Hội viên bấm 'Quên mật khẩu?' và nhập Email hoặc Số điện thoại đã đăng ký.
  2. Hệ thống tạo một yêu cầu khôi phục mật khẩu và tự động bắn cảnh báo về Trung tâm Thông báo Quản trị trên Web CRM.
  3. Quản trị viên trên CRM nhấp vào thông báo, hệ thống mở trực tiếp giao diện cấp lại mật khẩu cho đúng tài khoản đó.
  4. Sau khi Quản trị viên nhập mật khẩu mới và bấm xác nhận, hệ thống lưu mã hash mới vào CSDL.
  5. Đồng thời, hệ thống kích hoạt tự động gửi Email thông báo mật khẩu mới và gửi tin nhắn Zalo OA ZNS tới số điện thoại của Hội viên.
- **API Endpoints Backend**:
`http
POST /auth/forgot-password
POST /admin/reset-password
POST /zalo/send-zns
`
- **Bảng CSDL PostgreSQL**:
`sql
public.vione_users (id, email, phone, password_hash, reset_token)
public.notifications (id, type='FORGOT_PASSWORD_REQUEST', content, status, target_user_id)
public.mail_templates (key='RESET_PASSWORD_TEMPLATE')
`
- **Ràng buộc & Ghi chú**: Đảm bảo tính bảo mật kép: quản trị viên phê duyệt xác thực và hệ thống tự động dispatch thông báo đa kênh.

---

### 5. [NODE-CORE-005] Đăng Ký Hội Viên Mới & Tạo Hồ Sơ Doanh Nghiệp (Onboarding)
- **Đối tượng sử dụng**: Doanh nhân đăng ký gia nhập CLB CEO 1983
- **Luồng nghiệp vụ chi tiết**:
  1. Khách điền biểu mẫu đăng ký gia nhập CLB: Họ tên, Email, Số điện thoại, Tên công ty, Mã số thuế, Ngành nghề, Quy mô nhân sự, Vị trí chức danh và Ảnh đại diện.
  2. Hệ thống kiểm tra xác thực không trùng lặp Email, SĐT và MST trong hệ thống.
  3. Tạo tài khoản người dùng và bản ghi hồ sơ Hội viên ở trạng thái 'PENDING' (Chờ phê duyệt).
  4. Tự động bắn thông báo cảnh báo 'Có hồ sơ đăng ký mới' tới Ban Thư Ký và Ban Điều Hành trên CRM.
  5. Ban Thư Ký thẩm định hồ sơ, bấm 'Duyệt hội viên', hệ thống chuyển trạng thái sang 'ACTIVE' và gửi Email chào mừng chính thức.
- **API Endpoints Backend**:
`http
POST /auth/register
POST /members/onboard
PATCH /members/:id/approve
`
- **Bảng CSDL PostgreSQL**:
`sql
public.vione_users (id, email, phone, role_code='MEMBER')
public.members (id, user_id, full_name, status='PENDING'|'ACTIVE', department)
public.companies (id, member_id, company_name, tax_code, industry, employee_scale)
public.notifications (id, type='NEW_MEMBER_REGISTRATION', is_read)
`
- **Ràng buộc & Ghi chú**: Lưu trữ đầy đủ dữ liệu pháp nhân doanh nghiệp kèm tài khoản cá nhân, phục vụ quản lý 360 độ.

---

### 6. [NODE-CRM-006] Ma Trận Phân Quyền RBAC 2 Tab & Tự Động Đồng Bộ Tên Sidebar
- **Đối tượng sử dụng**: Chủ tịch CLB & Quản trị viên Tối cao (Super Admin)
- **Luồng nghiệp vụ chi tiết**:
  1. Quản trị viên truy cập màn hình Phân Quyền (/permissions) hiển thị 2 Tab độc lập: Tab 1 'Phân Quyền CRM Web' và Tab 2 'Phân Quyền App Mobile'.
  2. Khi Sidebar hoặc hệ thống menu thay đổi tên chức năng, danh mục tính năng tại ma trận phân quyền tự động lấy theo tên mới nhất.
  3. Admin chọn vai trò (Chủ tịch, Ban Điều Hành, Ban Thư Ký, Kế toán, Trưởng ban chuyên môn, Hội viên) và tích chọn phân quyền (Xem, Thêm, Sửa, Xóa, Phê duyệt, Xuất báo cáo).
  4. Bấm 'Lưu ma trận phân quyền', hệ thống cập nhật toàn bộ quyền hạn vào CSDL PostgreSQL.
  5. Toàn bộ API Backend được bảo vệ bởi RBAC Guard, tự động từ chối nếu tài khoản không đủ quyền (mã lỗi 403 Forbidden).
- **API Endpoints Backend**:
`http
GET /admin/roles
POST /admin/roles/permissions
PUT /admin/roles/:id
GET /admin/permissions
`
- **Bảng CSDL PostgreSQL**:
`sql
public.roles (id, code, name, description, is_system)
public.permissions (id, code, name, module, platform='CRM'|'APP')
public.role_permissions (role_id, permission_id)
public.user_roles (user_id, role_id)
`
- **Ràng buộc & Ghi chú**: Phân tách rõ ràng giữa thẩm quyền quản trị CRM và quyền hạn sử dụng tính năng trên Mobile App.

---

### 7. [NODE-CRM-005] Quản Lý Tài Khoản & Gán Ban Chuyên Môn Trực Tiếp
- **Đối tượng sử dụng**: Quản trị viên CRM (Ban Thư Ký, Ban Nhân Sự)
- **Luồng nghiệp vụ chi tiết**:
  1. Quản trị viên xem danh sách toàn bộ tài khoản người dùng tại giao diện Quản lý tài khoản (tích hợp trong nhóm phân quyền).
  2. Tên tài khoản hiển thị chuẩn xác, khử bỏ hoàn toàn các ký tự dư thừa (@).
  3. Quản trị viên có thể tìm kiếm theo họ tên, email, tên đăng nhập, trạng thái khóa/mở.
  4. Mở modal chỉnh sửa để gán trực tiếp vai trò quản trị và phân bổ vào 1 trong 7 Ban chuyên môn (Ban Điều Hành, Ban Hội Viên, Ban Đào Tạo, Ban Truyền Thông, Ban Sự Kiện, Ban Tài Chính - Kiểm Tra, Ban Hợp Tác Quốc Tế).
  5. Dữ liệu được cập nhật trực tiếp vào cơ sở dữ liệu PostgreSQL (không dùng dữ liệu hardcode mock).
- **API Endpoints Backend**:
`http
GET /accounts
PATCH /members/:id/role-dept
PATCH /users/:id/status
POST /accounts/create
`
- **Bảng CSDL PostgreSQL**:
`sql
public.vione_users (id, email, status, created_at)
public.members (id, user_id, full_name, executive_role, department)
public.user_roles (user_id, role_id)
public.departments (id, code, name)
`
- **Ràng buộc & Ghi chú**: Lưu trữ đồng bộ hai chiều giữa tài khoản người dùng (vione_users) và hồ sơ hội viên (members).

---


## PHẦN II: WEB CRM QUẢN TRỊ HỆ THỐNG

### 8. [NODE-CRM-001] Tổng Quan & Dashboard Điều Hành CLB
- **Đối tượng sử dụng**: Chủ tịch, Ban Điều Hành, Ban Thư Ký, Kế toán
- **Luồng nghiệp vụ chi tiết**:
  1. Người dùng quản trị đăng nhập, hệ thống điều hướng vào màn hình Tổng quan (/dashboard).
  2. Tải và hiển thị 4 thẻ KPI Gradient thời gian thực: Tổng số Hội viên chính thức, Số Doanh nghiệp kết nối, Tổng ngân sách quỹ CLB (Thu/Chi), Số Sự kiện & Cuộc họp trong tháng.
  3. Hiển thị Lịch biểu công tác tháng trực quan tích hợp lịch sự kiện và cuộc họp ban.
  4. Cảnh báo thông minh: Danh sách hội viên sắp hết hạn niên liễm hoặc nợ đọng hội phí để Ban Thư ký xử lý kịp thời.
- **API Endpoints Backend**:
`http
GET /admin/dashboard-stats
GET /admin/recent-activities
`
- **Bảng CSDL PostgreSQL**:
`sql
public.members (id, status, joined_date, dues_expired_at)
public.events (id, title, start_date, status)
public.meetings (id, title, meeting_date, status)
public.income_records (id, amount, status)
public.expense_records (id, amount, status)
`
- **Ràng buộc & Ghi chú**: 100% dữ liệu thống kê được tính toán trực tiếp từ cơ sở dữ liệu, không có mock ảo.

---

### 9. [NODE-CRM-002] Trung Tâm Thống Kê Chuyên Sâu 5 Danh Mục (Analytics Hub)
- **Đối tượng sử dụng**: Chủ tịch, Ban Điều Hành, Ban Thư Ký
- **Luồng nghiệp vụ chi tiết**:
  1. Truy cập màn hình Thống Kê CLB (/analytics) với biểu tượng BarChart3 trên Sidebar.
  2. Phân tích dữ liệu theo 5 danh mục nghiệp vụ: 1. Doanh số giao thương B2B, 2. Tăng trưởng Hội viên, 3. Kết nối & Giới thiệu cơ hội, 4. Tỷ lệ điểm danh tham gia hoạt động, 5. Đào tạo nâng cao năng lực.
  3. Hiển thị 4 thẻ KPI chỉ số, Biểu đồ kết hợp ComposedChart (cột doanh thu, đường tăng trưởng phần trăm).
  4. Bục vinh danh Top 3 Doanh nhân cống hiến (Top Giver) được thiết kế nằm gọn gàng trên 1 hàng ngang, vinh danh Top 1 với avatar viền vàng đặc trưng.
  5. Hỗ trợ bấm nút xuất báo cáo chi tiết ra định dạng Excel và in ấn bản A4 PDF chuẩn mực.
- **API Endpoints Backend**:
`http
GET /admin/analytics-summary
GET /admin/analytics/industry-breakdown
GET /admin/analytics/top-performers
`
- **Bảng CSDL PostgreSQL**:
`sql
public.members (id, full_name, avatar_url, points)
public.opportunities (id, giver_id, receiver_id, value_amount, status='CLOSED')
public.departments (id, name)
public.events (id, title)
public.event_registrations (id, event_id, check_in_status='CHECKED_IN')
`
- **Ràng buộc & Ghi chú**: Hỗ trợ lọc đa chiều theo mốc thời gian: Tuần này, Tháng này, Quý này, Năm nay.

---

### 10. [NODE-CRM-003] Quản Trị Danh Bạ Hội Viên 360 Độ
- **Đối tượng sử dụng**: Ban Thư Ký, Ban Hội Viên, Quản trị viên
- **Luồng nghiệp vụ chi tiết**:
  1. Hiển thị danh sách toàn bộ hội viên dưới dạng Bảng CustomTable chuẩn mực (giới hạn tối đa 2 dòng, văn bản dài tự cắt có dấu ba chấm và tooltip hiển thị toàn văn).
  2. Thanh công cụ hỗ trợ tìm kiếm nhanh theo Họ tên, SĐT, Email, Tên công ty, Ban chuyên môn, Trạng thái (Đang hoạt động, Chờ duyệt, Tạm khóa).
  3. Thao tác Xem chi tiết hồ sơ 360 độ: lịch sử đóng phí, tham dự sự kiện, cơ hội đã trao.
  4. Thao tác Thêm mới hoặc Chỉnh sửa thông tin cá nhân hội viên.
  5. Thao tác Xóa tài khoản cung cấp 2 chế độ an toàn: Xóa dữ liệu doanh nghiệp liên quan trước, hoặc Xóa liên hoàn (Cascade delete).
  6. Hỗ trợ Xuất danh bạ ra file Excel và Nhập dữ liệu hàng loạt từ file Excel mẫu.
- **API Endpoints Backend**:
`http
GET /members
POST /members
PUT /members/:id
DELETE /members/:id
POST /members/import-excel
GET /members/export-excel
`
- **Bảng CSDL PostgreSQL**:
`sql
public.members (id, user_id, full_name, phone, email, avatar_url, bio, status, joined_date, dues_expired_at)
public.companies (id, member_id, company_name)
public.vione_users (id, status)
`
- **Ràng buộc & Ghi chú**: Tất cả bảng dữ liệu trên CRM dùng chung 1 component CustomTable thống nhất.

---

### 11. [NODE-CRM-004] Quản Trị Doanh Nghiệp Thành Viên
- **Đối tượng sử dụng**: Ban Thư Ký, Ban Hội Viên, Ban B2B
- **Luồng nghiệp vụ chi tiết**:
  1. Truy cập danh mục Doanh nghiệp (/companies) hiển thị danh sách toàn bộ pháp nhân doanh nghiệp của Hội viên CLB.
  2. Cột thông tin hiển thị chuẩn mực: Tên doanh nghiệp (cột thứ 3), Mã số thuế, Người đại diện pháp luật, Ngành nghề hoạt động, Quy mô vốn/nhân sự, Địa chỉ trụ sở, Website, Logo.
  3. Quản trị viên xem hồ sơ chi tiết doanh nghiệp, các sản phẩm đang chào bán trên sàn B2B và danh sách nhân sự tham gia CLB.
  4. Chỉnh sửa thông tin pháp lý doanh nghiệp hoặc cập nhật trạng thái liên kết.
- **API Endpoints Backend**:
`http
GET /companies
POST /companies
PUT /companies/:id
DELETE /companies/:id
`
- **Bảng CSDL PostgreSQL**:
`sql
public.companies (id, member_id, company_name, tax_code, legal_representative, industry, capital, employee_scale, address, website_url, logo_url, is_verified)
public.members (id, full_name)
`
- **Ràng buộc & Ghi chú**: Liên kết 1-1 hoặc 1-N giữa Doanh nghiệp và Hội viên lãnh đạo.

---

### 12. [NODE-CRM-007] Quản Trị Sự Kiện, Bán Vé, Xếp Chỗ & Bắn Mạng Lưới
- **Đối tượng sử dụng**: Ban Sự Kiện, Ban Điều Hành, Ban Thư Ký
- **Luồng nghiệp vụ chi tiết**:
  1. Tạo sự kiện mới: Tiêu đề, Ảnh Banner/Poster, Địa điểm tổ chức, Thời gian bắt đầu/kết thúc, Sơ đồ chỗ ngồi, Lịch trình Agenda chi tiết theo từng khung giờ, Số lượng vé giới hạn, Mức phí tham dự.
  2. Quản lý danh sách đăng ký tham dự (Hội viên chính thức và Khách vãng lai).
  3. Sắp xếp vị trí chỗ ngồi & Tính năng Gỡ/Thay đổi chỗ ngồi: Khi gỡ hoặc đổi vị trí ngồi của người tham gia, hệ thống tự động bắn Email và tin nhắn Zalo OA thông báo vị trí chỗ ngồi mới tới người tham dự.
  4. Điểm danh tham dự thời gian thực thông qua quét mã QR trên vé điện tử.
  5. Hỗ trợ Tải poster sự kiện về máy tính.
  6. Tải ảnh/video tư liệu trong quá trình sự kiện diễn ra (tối đa 5 ảnh, có video) để lưu trữ lịch sử.
  7. Nút 'Bắn Mạng Lưới': Tự động phát thanh bài viết giới thiệu sự kiện lên Bảng tin Mạng lưới App Mobile (hiển thị đường link QR thay vì hiển thị hình ảnh mã QR).
- **API Endpoints Backend**:
`http
GET /events
POST /events
PUT /events/:id
DELETE /events/:id
GET /events/:id/attendees
POST /events/:id/seats
DELETE /events/:id/seats/:seatId
POST /events/:id/checkin
POST /feed/broadcast-event
POST /events/:id/media
`
- **Bảng CSDL PostgreSQL**:
`sql
public.events (id, title, banner_url, start_date, end_date, location, agenda_json, ticket_price, max_attendees, status)
public.event_registrations (id, event_id, member_id, guest_name, guest_email, guest_phone, ticket_code, seat_number, check_in_status, checked_in_at)
public.event_seats (id, event_id, seat_code, member_id, status)
public.sponsors_prizes (id, event_id, sponsor_id, prize_name, quantity)
public.feed_posts (id, type='EVENT', title, content, link_url, media_urls)
`
- **Ràng buộc & Ghi chú**: Khi gỡ hoặc đổi vị trí ngồi, hệ thống tự động kích hoạt dispatch thông báo đa kênh (Email + Zalo OA).

---

### 13. [NODE-CRM-008] Quản Lý Cuộc Họp Ban & Gặp Gỡ CLB
- **Đối tượng sử dụng**: Ban Điều Hành, Trưởng 7 Ban Chuyên Môn, Ban Thư Ký
- **Luồng nghiệp vụ chi tiết**:
  1. Thiết lập lịch họp Ban Điều Hành hoặc các Ban chuyên môn: Tiêu đề, Nội dung nghị sự, Thời gian, Thành phần triệu tập.
  2. Bản đồ tương tác chọn vị trí họp (ghim đỏ trên OpenStreetMap/Nominatim).
  3. Gửi thông báo triệu tập họp tới các thành viên liên quan.
  4. Điểm danh cuộc họp bằng quét mã QR.
  5. Đính kèm biên bản họp, tài liệu số và tải lên tối đa 5 ảnh/video lưu vào nhật ký cuộc họp.
  6. Tự động đồng bộ sang mục Hoạt động trên App Mobile và phát thanh bài viết lên Bảng tin Mạng lưới.
- **API Endpoints Backend**:
`http
GET /meetings
POST /meetings
PUT /meetings/:id
DELETE /meetings/:id
POST /meetings/:id/checkin
POST /feed/broadcast-meeting
POST /meetings/:id/media
`
- **Bảng CSDL PostgreSQL**:
`sql
public.meetings (id, title, department_code, meeting_date, location, lat, lng, agenda, minutes_file_url, status)
public.meeting_attendees (id, meeting_id, member_id, is_attended, checked_in_at)
public.feed_posts (id, type='MEETING', title, content, media_urls)
`
- **Ràng buộc & Ghi chú**: Tự động phân loại theo Ban chuyên môn và gắn nhãn [Họp Ban] trên ứng dụng di động.

---

### 14. [NODE-CRM-009] Quản Lý Thu Ngân Sách, Phí Niên Liễm & Vé Sự Kiện
- **Đối tượng sử dụng**: Ban Tài Chính - Kiểm Tra, Kế toán CLB, Thủ quỹ
- **Luồng nghiệp vụ chi tiết**:
  1. Quản lý toàn bộ danh mục phiếu thu: Thu phí niên liễm hội viên, Thu tiền vé tham dự sự kiện, Thu tài trợ từ các doanh nghiệp, Các khoản thu hoạt động khác.
  2. Tạo phiếu thu mới, chọn Hội viên/Doanh nghiệp nộp, số tiền, ngày thu, chứng từ đính kèm.
  3. Tích hợp tạo mã thanh toán VietQR động chuẩn SeABank (số tiền và nội dung chuyển khoản tự động).
  4. Bảng dữ liệu co dãn linh hoạt kiểu Excel, hiển thị rõ ràng, hỗ trợ lọc theo khoảng ngày, danh mục thu.
  5. Hỗ trợ Nhập dữ liệu phiếu thu từ file Excel và Xuất báo cáo sổ quỹ thu ra file Excel chuẩn mực.
- **API Endpoints Backend**:
`http
GET /finance/income
POST /finance/income
PUT /finance/income/:id
DELETE /finance/income/:id
POST /finance/income/import-excel
GET /finance/vietqr-payload
`
- **Bảng CSDL PostgreSQL**:
`sql
public.income_records (id, member_id, category, amount, payment_method, reference_code, transaction_date, receipt_url, note, status='COMPLETED')
public.members (id, full_name)
public.events (id, title)
`
- **Ràng buộc & Ghi chú**: 100% dữ liệu tài chính được lưu trực tiếp vào PostgreSQL, tuyệt đối không dùng số liệu hardcode.

---

### 15. [NODE-CRM-010] Quản Lý Chi Ngân Sách, Tạm Ứng & Hoàn Ứng
- **Đối tượng sử dụng**: Ban Tài Chính - Kiểm Tra, Kế toán CLB, Chủ tịch
- **Luồng nghiệp vụ chi tiết**:
  1. Tiếp nhận và quản lý các phiếu đề xuất chi ngân sách: Chi tổ chức sự kiện, Chi hoạt động các ban, Chi quà tặng thăm hỏi, Chi vận hành quản lý CLB.
  2. Quản lý quy trình Tạm ứng kinh phí công việc và Hoàn ứng tiền thừa sau khi hoàn thành nhiệm vụ.
  3. Quy trình phê duyệt chi 2 cấp: Kế toán thẩm định hồ sơ chứng từ -> Chủ tịch CLB hoặc Trưởng ban Tài chính duyệt chi điện tử.
  4. Đính kèm hóa đơn đỏ (VAT), phiếu chi có chữ ký và ủy nhiệm chi ngân hàng.
  5. Hỗ trợ Nhập/Xuất sổ quỹ chi ra định dạng Excel.
- **API Endpoints Backend**:
`http
GET /finance/expenses
POST /finance/expenses
PUT /finance/expenses/:id
DELETE /finance/expenses/:id
POST /finance/expenses/import-excel
PATCH /finance/expenses/:id/approve
`
- **Bảng CSDL PostgreSQL**:
`sql
public.expense_records (id, applicant_id, approver_id, category, amount, advance_amount, refund_amount, status='PENDING'|'APPROVED'|'REJECTED', expense_date, invoice_url, note)
public.members (id, full_name)
`
- **Ràng buộc & Ghi chú**: Kiểm soát chặt chẽ quy trình tạm ứng và hoàn ứng đảm bảo minh bạch tài chính.

---

### 16. [NODE-CRM-011] Báo Cáo Tài Chính Tổng Hợp & Quyết Toán Quỹ
- **Đối tượng sử dụng**: Chủ tịch, Ban Thường Trực, Ban Tài Chính - Kiểm Tra
- **Luồng nghiệp vụ chi tiết**:
  1. Hệ thống tự động tổng hợp toàn bộ dữ liệu dòng tiền Thu và Chi thực tế trong CSDL PostgreSQL.
  2. Biểu đồ ComposedChart đa tầng biểu diễn: Dòng tiền Thu theo tháng, Dòng tiền Chi theo tháng, và Đường thặng dư quỹ lũy kế.
  3. Biểu đồ tròn PieChart phân bổ cơ cấu chi phí thực tế và tỷ trọng các nguồn thu ngân sách.
  4. Bảng phân tích chi tiết nguồn thu tài trợ theo 4 thứ hạng danh dự: Kim Cương (Diamond), Vàng (Gold), Bạc (Silver), Đồng (Bronze).
  5. Xuất báo cáo quyết toán tài chính phục vụ Đại hội Hội viên và kiểm toán định kỳ.
- **API Endpoints Backend**:
`http
GET /finance/summary-report
GET /finance/flow-analysis
GET /finance/sponsor-tiers-report
`
- **Bảng CSDL PostgreSQL**:
`sql
public.income_records (amount, transaction_date, category)
public.expense_records (amount, expense_date, category, status='APPROVED')
public.sponsor_packages (id, tier, price)
`
- **Ràng buộc & Ghi chú**: Số liệu quyết toán phản ánh thời gian thực số dư khả dụng của quỹ CLB.

---

### 17. [NODE-CRM-012] Quản Lý Công Việc & Giao Việc Ban Chuyên Môn
- **Đối tượng sử dụng**: Chủ tịch, Ban Điều Hành, Trưởng Ban, Thành viên Ban
- **Luồng nghiệp vụ chi tiết**:
  1. Người giao việc (Chủ tịch/Trưởng ban) bấm 'Tạo công việc mới': Nhập Tiêu đề, Mô tả, Hạn hoàn thành (Deadline), Mức độ ưu tiên (Khẩn cấp, Cao, Trung bình, Thấp).
  2. Chọn giao cho Cá nhân hội viên cụ thể hoặc giao cho toàn bộ một Ban chuyên môn.
  3. Tải lên các file tài liệu đính kèm (Word, Excel, PDF, Hình ảnh).
  4. Người nhận việc nhận ngay thông báo với thông tin định danh rõ ràng người giao: '[Giao việc từ ${creatorDisplayName}]'.
  5. Tích hợp nút 'Xem file' (icon Con mắt) mở trực tiếp Trình xem tài liệu toàn năng (xem bảng tính Excel SheetJS, đọc PDF, xem ảnh Lightbox) mà không cần tải file về.
  6. Người nhận việc cập nhật tiến độ công việc (Chưa bắt đầu, Đang thực hiện, Đã hoàn thành, Chờ duyệt). Dữ liệu được lưu 100% vào CSDL.
- **API Endpoints Backend**:
`http
GET /tasks
POST /tasks
PUT /tasks/:id
DELETE /tasks/:id
PATCH /tasks/:id/status
POST /tasks/:id/attachments
`
- **Bảng CSDL PostgreSQL**:
`sql
public.tasks (id, creator_id, title, description, priority, deadline, status='TODO'|'IN_PROGRESS'|'COMPLETED'|'CANCELLED', department_id)
public.task_assignees (task_id, member_id, assigned_at)
public.task_attachments (id, task_id, file_name, file_url, file_size, mime_type)
public.notifications (id, user_id, title, content)
`
- **Ràng buộc & Ghi chú**: Triệt tiêu hoàn toàn mock data hardcode; hiển thị rõ ràng người giao việc và tích hợp đọc file trực tiếp.

---

### 18. [NODE-CRM-013] Quản Trị Nhà Tài Trợ & Quyền Lợi Thương Hiệu
- **Đối tượng sử dụng**: Ban Tài Chính, Ban Sự Kiện, Ban Truyền Thông
- **Luồng nghiệp vụ chi tiết**:
  1. Quản lý danh bạ các Nhà tài trợ đồng hành cùng CLB CEO 1983 trong năm và theo từng sự kiện trọng điểm.
  2. Cấu hình 4 gói tài trợ tiêu chuẩn: Kim Cương, Vàng, Bạc, Đồng kèm theo định mức kinh phí và quyền lợi chi tiết.
  3. Theo dõi việc bàn giao quyền lợi thương hiệu: Treo Logo trên Banner sân khấu, vị trí trên Poster sự kiện, số lượng vé VIP tham dự, thời lượng trình chiếu video doanh nghiệp và gian hàng ưu tiên tại sàn B2B.
  4. Lưu trữ hợp đồng tài trợ và xuất hóa đơn/phiếu thu tương ứng.
- **API Endpoints Backend**:
`http
GET /sponsors
POST /sponsors
PUT /sponsors/:id
DELETE /sponsors/:id
GET /sponsors/packages
`
- **Bảng CSDL PostgreSQL**:
`sql
public.sponsors (id, company_id, member_id, sponsor_name, logo_url, tier, contract_url, status)
public.sponsor_packages (id, code, name, tier, default_amount, benefits_json)
public.events (id, title)
`
- **Ràng buộc & Ghi chú**: Đồng bộ hiển thị logo nhà tài trợ lên poster sự kiện và sàn giao thương B2B.

---

### 19. [NODE-CRM-014] Kho Tài Liệu CLB & Trình Xem Toàn Năng (Universal Document Viewer)
- **Đối tượng sử dụng**: Ban Thư Ký, Toàn thể Hội viên
- **Luồng nghiệp vụ chi tiết**:
  1. Lưu trữ và phân loại tài liệu số hóa của CLB: Điều lệ CLB, Quy chế hoạt động, Biên bản họp Ban Chấp Hành, Biểu mẫu gia nhập, Quyết định khen thưởng/bổ nhiệm.
  2. Tích hợp Trình xem tài liệu toàn năng (Universal Document Viewer) hỗ trợ xem trực tiếp trên trình duyệt:
     - File Word (.docx): Hiển thị bản in trang A4 chuẩn xác.
     - File Excel (.xlsx, .xls): Hiển thị dạng bảng tính đa sheet với thư viện SheetJS, hỗ trợ lọc và tìm kiếm ô.
     - File PDF: Trình nhúng tương tác hỗ trợ phóng to/thu nhỏ, xoay trang, in ấn.
     - File Ảnh và Code: Trình xem độ phân giải cao kèm chế độ tối.
  3. Phân quyền xem tài liệu: Công khai cho toàn thể hội viên hoặc giới hạn nội bộ Ban Điều Hành.
- **API Endpoints Backend**:
`http
GET /documents
POST /documents
PUT /documents/:id
DELETE /documents/:id
GET /documents/:id/download
`
- **Bảng CSDL PostgreSQL**:
`sql
public.documents (id, title, category, file_url, file_size, file_type, access_level='PUBLIC'|'EXECUTIVE', uploader_id, download_count)
public.members (id, full_name)
`
- **Ràng buộc & Ghi chú**: Cho phép đọc mọi định dạng tài liệu văn phòng trực tiếp không cần cài đặt thêm phần mềm.

---

### 20. [NODE-CRM-015] Quản Trị Biểu Quyết Trực Tuyến & Vòng Quay May Mắn (Lucky Draw)
- **Đối tượng sử dụng**: Ban Tổ Chức, Ban Sự Kiện, Ban Thư Ký
- **Luồng nghiệp vụ chi tiết**:
  1. Quản trị Biểu quyết: Tạo các câu hỏi biểu quyết/bầu cử Ban Chấp Hành hoặc thông qua Nghị quyết CLB. Thiết lập thời gian mở/đóng biểu quyết, cấu hình đơn chọn hay đa chọn.
  2. Vòng quay số may mắn (Lucky Draw Wheel): Nạp danh sách giải thưởng thực tế từ CSDL nhà tài trợ (Kim Cương, Vàng, Bạc, Đồng).
  3. Tải danh sách người đủ điều kiện quay số (những Hội viên/Khách đã check-in thực tế tại sự kiện).
  4. Vòng quay vận hành ngẫu nhiên, tự động loại trừ những người đã trúng thưởng ở các lượt quay trước.
  5. Khi xác định người trúng, hệ thống tự động trừ số lượng giải thưởng trong CSDL và gửi email/thông báo chúc mừng.
- **API Endpoints Backend**:
`http
GET /polls
POST /polls
PUT /polls/:id
DELETE /polls/:id
GET /admin/lucky-draw-config
POST /admin/lucky-draw/spin
PUT /sponsors/prizes/:id
`
- **Bảng CSDL PostgreSQL**:
`sql
public.polls (id, event_id, title, description, poll_type, start_time, end_time, is_active)
public.poll_options (id, poll_id, option_text, vote_count)
public.poll_votes (id, poll_id, option_id, member_id, voted_at)
public.sponsors_prizes (id, event_id, prize_name, quantity, remaining_quantity, winner_id)
`
- **Ràng buộc & Ghi chú**: Loại trừ người trúng thưởng trùng lặp và đồng bộ kết quả biểu quyết thời gian thực.

---

### 21. [NODE-CRM-016] Quản Lý Bản Tin & Truyền Thông CLB
- **Đối tượng sử dụng**: Ban Truyền Thông, Ban Thư Ký
- **Luồng nghiệp vụ chi tiết**:
  1. Soạn thảo bài viết tin tức, hoạt động CLB, bài phỏng vấn doanh nhân tiêu biểu thông qua trình soạn thảo Rich-Text.
  2. Đính kèm hình ảnh tiêu biểu, video phóng sự và các tài liệu liên quan.
  3. Thiết lập chế độ: Bản nháp hoặc Xuất bản chính thức.
  4. Khi xuất bản, hệ thống tự động đồng bộ bài viết sang Bảng tin Mạng lưới App Mobile và hiển thị tại trang chủ tin tức của CLB.
  5. Cơ chế 'Seed on Read' tự động bảo đảm dữ liệu tin tức luôn đầy đủ.
- **API Endpoints Backend**:
`http
GET /news
POST /news
PUT /news/:id
DELETE /news/:id
POST /news/:id/publish
`
- **Bảng CSDL PostgreSQL**:
`sql
public.news (id, title, slug, summary, content, thumbnail_url, author_id, view_count, status='DRAFT'|'PUBLISHED', published_at)
public.feed_posts (id, type='NEWS', title, content, thumbnail_url)
`
- **Ràng buộc & Ghi chú**: Tự động tạo bài viết đồng bộ trên mạng xã hội nội bộ khi tin tức được phát hành.

---

### 22. [NODE-CRM-017] Gia Hạn Hội Viên & Xử Lý Nợ Phí Niên Liễm
- **Đối tượng sử dụng**: Ban Hội Viên, Ban Tài Chính, Ban Thư Ký
- **Luồng nghiệp vụ chi tiết**:
  1. Quản lý danh sách hội viên theo chu kỳ niên liễm hàng năm (1 năm / 2 năm).
  2. Hệ thống phân loại tự động thành 3 nhóm: Sắp hết hạn trong 30 ngày, Quá hạn nợ phí, và Đã gia hạn thành công.
  3. Ban Thư ký chọn gửi thông báo gia hạn: Hệ thống tự động dispatch thông báo nhắc nhở qua Email và gửi tin nhắn Zalo OA ZNS kèm mã thanh toán VietQR động.
  4. Sau khi hội viên nộp phí, kế toán xác nhận nộp phí thành công, hệ thống tự động cộng thêm 365 ngày vào hạn dùng và kích hoạt lại quyền lợi VIP.
- **API Endpoints Backend**:
`http
GET /members/renewals
POST /members/:id/send-renewal-notice
POST /members/:id/renew
`
- **Bảng CSDL PostgreSQL**:
`sql
public.members (id, full_name, dues_expired_at, status)
public.income_records (id, member_id, category='MEMBERSHIP_DUES', amount, status)
public.vione_users (id, status)
`
- **Ràng buộc & Ghi chú**: Khử prefix mã gia hạn, truy vấn linh hoạt tránh lỗi ép kiểu UUID trong PostgreSQL.

---

### 23. [NODE-CRM-018] Quản Trị Đào Tạo Đa Thức & Bắn Mạng Lưới Khóa Học
- **Đối tượng sử dụng**: Ban Đào Tạo, Ban Điều Hành, Giảng viên
- **Luồng nghiệp vụ chi tiết**:
  1. Tạo mới chương trình đào tạo doanh nghiệp: Tên khóa học, Giảng viên/Chuyên gia, Hình thức (Trực tiếp Offline, Trực tuyến Online, hoặc Kết hợp Hybrid), Lịch học, Giáo trình tài liệu.
  2. Tích hợp cấu hình phòng học trực tuyến Video Call (Jitsi Meet / Zoom nhúng).
  3. Quản lý danh sách học viên đăng ký tham gia khóa học.
  4. Tải poster khóa học và đính kèm tối đa 5 ảnh/video tư liệu.
  5. Nút 'Bắn Mạng Lưới': Tự động phát thanh bài giới thiệu khóa học lên Bảng tin Mạng lưới App Mobile kèm liên kết đăng ký học.
- **API Endpoints Backend**:
`http
GET /trainings
POST /trainings
PUT /trainings/:id
DELETE /trainings/:id
GET /trainings/:id/attendees
POST /feed/broadcast-training
POST /trainings/:id/media
`
- **Bảng CSDL PostgreSQL**:
`sql
public.trainings (id, title, instructor_name, format='ONLINE'|'OFFLINE'|'HYBRID', start_time, end_time, room_url, syllabus_url, max_students, status)
public.training_attendees (id, training_id, member_id, status, registered_at)
public.feed_posts (id, type='TRAINING', title, content, link_url, media_urls)
`
- **Ràng buộc & Ghi chú**: Tích hợp phòng họp trực tuyến và kết nối trực tiếp với mạng xã hội hội viên.

---

### 24. [NODE-CRM-019] Nhật Ký Lịch Sử Thao Tác Toàn Hệ Thống (Audit Logs)
- **Đối tượng sử dụng**: Chủ tịch CLB, Ban Kiểm Tra, Quản trị viên Tối cao
- **Luồng nghiệp vụ chi tiết**:
  1. Hệ thống tự động ghi lại toàn bộ các thao tác nhạy cảm trên cả Web CRM và Mobile App: Đăng nhập, Đổi mật khẩu, Thêm/Sửa/Xóa hội viên, Phê duyệt chi quỹ, Gán quyền RBAC, Phát hành thông báo.
  2. Mỗi bản ghi lưu trữ đầy đủ: Mã người dùng, Tên hiển thị, Hành động, Phân hệ tác động, Địa chỉ IP, Thiết bị trình duyệt và Dấu thời gian chính xác.
  3. Quản trị viên tìm kiếm, lọc theo ngày tháng, theo loại hành vi và người thao tác.
  4. Hỗ trợ xuất dữ liệu lịch sử thao tác ra file Excel phục vụ thanh tra, kiểm toán.
- **API Endpoints Backend**:
`http
GET /admin/audit-logs
GET /admin/audit-logs/export-excel
`
- **Bảng CSDL PostgreSQL**:
`sql
public.audit_logs (id, user_id, user_email, action, module, details_json, ip_address, user_agent, created_at)
public.members (id, full_name)
`
- **Ràng buộc & Ghi chú**: Đảm bảo tính bất biến của nhật ký, hỗ trợ kiểm toán an ninh hệ thống.

---

### 25. [NODE-CRM-020] Trao Cơ Hội Giao Thương Đa Đối Tượng & Hội Nhóm
- **Đối tượng sử dụng**: Ban B2B, Ban Điều Hành, Hội viên Doanh nhân
- **Luồng nghiệp vụ chi tiết**:
  1. Người dùng tạo một cơ hội kinh doanh hoặc gói thầu dự án lớn cần liên danh hợp tác.
  2. Cho phép chọn trao cơ hội cho nhiều người cùng lúc (Multi-select) hoặc trao cho toàn thể một Ban chuyên môn phụ trách.
  3. Hệ thống tạo các liên kết cơ hội độc lập và tự động gửi thông báo tới từng hội viên trong danh sách nhận.
  4. Theo dõi tiến độ kết nối và giá trị giao dịch phát sinh từ cơ hội chia sẻ.
- **API Endpoints Backend**:
`http
POST /opportunities/batch-share
GET /opportunities/recipients-pool
`
- **Bảng CSDL PostgreSQL**:
`sql
public.opportunities (id, giver_id, title, description, value_amount, status)
public.opportunity_shares (opportunity_id, receiver_id, status, created_at)
public.members (id, full_name, department)
`
- **Ràng buộc & Ghi chú**: Mở rộng kết nối kinh doanh quy mô lớn cho các gói thầu liên ngành.

---

### 26. [NODE-CRM-021] Theme Studio, Icon Picker 14 Tính Năng & Đồng Bộ Giao Diện
- **Đối tượng sử dụng**: Chủ tịch CLB, Ban Truyền Thông, Quản trị viên
- **Luồng nghiệp vụ chi tiết**:
  1. Quản lý nhận diện thương hiệu số qua Theme Studio với 5 VIP Presets: Hoàng Gia, Dạ Hội, Thép Titan, Sen Vàng, Mùa Lễ Hội.
  2. Cung cấp bộ chọn Icon Picker linh hoạt cho 14 tính năng chính của hệ thống.
  3. Khung hình Live Preview Mobile Frame mô phỏng trực quan giao diện thực tế trước khi áp dụng.
  4. Khi quản trị viên chọn kích hoạt chủ đề (ví dụ Mùa Lễ Hội), hệ thống lập tức đồng bộ biến giao diện CSS (--festival-bg-image) thời gian thực xuống toàn bộ Web CRM và Ứng dụng Di động CEO 1983.
- **API Endpoints Backend**:
`http
GET /admin/landing-templates
POST /admin/landing-templates
POST /admin/themes/active
`
- **Bảng CSDL PostgreSQL**:
`sql
public.landing_templates (id, name, theme_key, primary_color, secondary_color, festival_bg_url, is_active)
public.system_settings (key='active_theme_config', value_json)
`
- **Ràng buộc & Ghi chú**: Đồng bộ giao diện thời gian thực trên cả hai nền tảng Web CRM và Mobile App.

---

### 27. [NODE-CRM-022] Trung Tâm Thông Báo Quản Trị Hệ Thống (Admin Notification Center)
- **Đối tượng sử dụng**: Chủ tịch, Ban Thư Ký, Quản trị viên
- **Luồng nghiệp vụ chi tiết**:
  1. Tự động quét và hiển thị các cảnh báo quản trị quan trọng: Hồ sơ đăng ký hội viên mới chờ phê duyệt, Hội viên quá hạn hội phí niên liễm, Yêu cầu quên mật khẩu cần cấp lại, Báo cáo sự cố từ người dùng.
  2. Phân loại bằng 4 thẻ KPI Gradient và các Tab bộ lọc trạng thái (Chưa đọc, Đã đọc, Cần xử lý gấp).
  3. Bảng CustomTable sắp xếp theo mức độ ưu tiên và thời gian phát sinh.
  4. Quản trị viên bấm trực tiếp vào thông báo để chuyển hướng đến tác vụ tương ứng.
- **API Endpoints Backend**:
`http
GET /admin/notifications
POST /admin/notifications
PATCH /admin/notifications/:id
DELETE /admin/notifications/:id
`
- **Bảng CSDL PostgreSQL**:
`sql
public.notifications (id, user_id, title, content, type, is_read, action_url, created_at)
public.members (id, full_name)
`
- **Ràng buộc & Ghi chú**: Tích hợp huy hiệu số đếm thông báo chưa đọc trên thanh điều hướng Sidebar.

---

### 28. [NODE-CRM-023] Quản Lý Landing Web Dynamic & Cấu Hình Subdomain
- **Đối tượng sử dụng**: Ban Truyền Thông, Quản trị viên Kỹ thuật
- **Luồng nghiệp vụ chi tiết**:
  1. Quản trị các trang đích (Landing Pages) giới thiệu CLB tái hiện chuẩn mực 2 mẫu thiết kế Pinterest:
     - Mẫu 1 (Timed Cards Opening): Slide chuyển màn hình tự động bằng con lăn chuột/vuốt cảm ứng, thanh tiến trình 5 giây, hiệu ứng split typography sang trọng.
     - Mẫu 2 (Startup Mobile Showcase): Mockup iPhone 16 Pro mô phỏng giao diện app CEO 1983, dải ruy băng 4 chỉ số vàng (4+ năm, 1.983+ CEO, 500+ Doanh nghiệp, 100+ Tỷ giao thương).
  2. Quản lý menu đa tầng (Dynamic Tree Header Menu) kích hoạt các sub-screens.
  3. Tính năng gán tên miền phụ (subdomain *.ceo1983.viconnect.vn) và API Connector ánh xạ dữ liệu trực tiếp từ CLB.
- **API Endpoints Backend**:
`http
GET /admin/landing-webs
POST /admin/landing-webs
PUT /admin/landing-webs/:id
DELETE /admin/landing-webs/:id
POST /admin/landing-webs/:id/apply-subdomain
GET /public/landing-webs/:slugOrSubdomain
`
- **Bảng CSDL PostgreSQL**:
`sql
public.app_settings (key='crm_landing_webs_configs', value_json)
`
- **Ràng buộc & Ghi chú**: Cho phép tạo nhiều trang đích sự kiện với tên miền riêng biệt.

---

### 29. [NODE-CRM-024] Quản Lý Mẫu Thư Mời Đa Kênh & Trình Tạo Mẫu Thư Nhắc Nhở Tùy Biến
- **Đối tượng sử dụng**: Ban Thư Ký, Ban Truyền Thông, Quản trị viên
- **Luồng nghiệp vụ chi tiết**:
  1. Quản lý mẫu thông báo đa kênh: Gửi qua Email HTML v3 chuẩn nhận diện, Thông báo đẩy In-App CEO 1983, và Gửi tin nhắn Zalo OA ZNS (loại bỏ các tính năng dư thừa VNPay, Zalo Mini App, ZBS).
  2. Trình thiết lập mẫu thư nhắc nhở động (CustomReminderTemplateModal): Cho phép người dùng tạo mẫu thông báo 'Hôm nay trong app CEO 1983 có gì', tự do thêm/bớt các trường thông tin động với đa dạng kiểu dữ liệu:
     - Kiểu Textarea: Cho phần mô tả dài.
     - Kiểu Datetime: Cho ngày và giờ diễn ra sự kiện/cuộc họp.
     - Kiểu Price: Cho mức chi phí, giá vé hoặc hội phí.
     - Kiểu Mã QR: Cho mã QR điểm danh hoặc quét chuyển khoản thanh toán.
     - Kiểu Text: Cho văn bản ngắn thông thường.
  3. Hỗ trợ nhập số điện thoại thử nghiệm bằng icon dấu cộng (+) và lựa chọn dữ liệu sự kiện/cuộc họp thực tế từ CSDL để phát thanh thông báo đa kênh.
- **API Endpoints Backend**:
`http
GET /admin/mail-templates
PUT /admin/mail-templates/:key
POST /zalo/send-zns
GET /zalo/template-configs
PUT /zalo/template-configs/:templateCode
POST /notifications/broadcast-custom
`
- **Bảng CSDL PostgreSQL**:
`sql
public.mail_templates (id, key, title, subject, content_html, is_system, updated_at)
public.app_settings (key='crm_invitation_templates' | 'zalo_oa_config', value_json)
public.notifications (id, type, content)
`
- **Ràng buộc & Ghi chú**: Linh hoạt tùy biến trường dữ liệu nhắc nhở và kiểm thử gửi tức thời.

---


## PHẦN III: PHÂN HỆ MOBILE APP CEO 1983

### 30. [NODE-APP-001] Trang Chủ Ticker Nến Realtime & Shortcut Tiện Ích
- **Đối tượng sử dụng**: Hội viên Doanh nhân CEO 1983
- **Luồng nghiệp vụ chi tiết**:
  1. Hội viên mở app, trang chủ hiển thị Biểu đồ nến Ticker biến động doanh số giao thương thời gian thực.
  2. Hiển thị Banner sự kiện nổi bật và dải phím tắt thông minh (Cơ hội, Danh bạ, Tin nhắn, Sự kiện, Thẻ QR).
  3. Modal chào mừng hội viên cá nhân hóa (WelcomeMemberModal) hiển thị khi đăng nhập đầu ngày.
  4. Tự động đồng bộ hình nền chủ đề Lễ Hội (--festival-bg-image) từ cấu hình Theme Studio của CRM.
  5. Các nút bấm được chuẩn hóa màu nền #FFFFFF với chữ đen sang trọng, dễ đọc.
- **API Endpoints Backend**:
`http
GET /association/home-stats
GET /admin/landing-templates/active
`
- **Bảng CSDL PostgreSQL**:
`sql
public.opportunities (value_amount, created_at)
public.landing_templates (theme_key, festival_bg_url, is_active)
public.members (full_name, avatar_url, points)
`
- **Ràng buộc & Ghi chú**: Tối ưu hóa trải nghiệm mượt mà 60fps chuẩn native ứng dụng di động.

---

### 31. [NODE-APP-002] Thẻ Hội Viên VIP Số & Mã QR Cá Nhân Bảo Mật
- **Đối tượng sử dụng**: Hội viên Doanh nhân
- **Luồng nghiệp vụ chi tiết**:
  1. Hiển thị Thẻ danh thiếp điện tử VIP mang màu sắc nhận diện thương hiệu CLB (Đỏ - Vàng - Xanh Obsidian).
  2. Thông tin đầy đủ: Ảnh đại diện, Họ tên, Chức vụ trong Ban chuyên môn, Logo doanh nghiệp ở góc phải trên.
  3. Mã QR cá nhân hóa độc bản: Chạm vào để phóng to toàn màn hình phục vụ trao đổi danh thiếp 1 chạm.
  4. Cung cấp công tắc bật/tắt quyền riêng tư: Hội viên có thể chủ động ẩn hoặc hiện Số điện thoại và Email khi đối tác quét thẻ.
  5. Tích hợp camera quét nhanh mã QR danh thiếp của đối tác để lưu vào danh bạ kết nối.
- **API Endpoints Backend**:
`http
GET /association/card-profile
PUT /association/card-privacy
`
- **Bảng CSDL PostgreSQL**:
`sql
public.members (id, full_name, phone, email, avatar_url, executive_role, department, is_phone_private, is_email_private)
public.companies (company_name, logo_url)
public.member_cards (id, member_id, card_code, qr_url)
`
- **Ràng buộc & Ghi chú**: Bảo vệ thông tin liên lạc cá nhân theo cấu hình quyền riêng tư của từng hội viên.

---

### 32. [NODE-APP-003] Trang Quét Danh Thiếp Công Khai Bảo Mật (Public Web Card)
- **Đối tượng sử dụng**: Đối tác quét mã QR, Khách hàng bên ngoài
- **Luồng nghiệp vụ chi tiết**:
  1. Khi đối tác quét mã QR trên thẻ số của hội viên hoặc truy cập liên kết (/card/:code), hệ thống mở trang danh thiếp công khai.
  2. Giao diện trang trọng, đồng bộ nhận diện thương hiệu với thẻ nội bộ.
  3. Kiểm tra cài đặt quyền riêng tư: Nếu hội viên chọn ẩn SĐT hoặc Email, hệ thống hiển thị văn bản bảo mật '🔒 Đã ẩn theo cài đặt riêng tư của hội viên'.
  4. Cung cấp các nút tương tác: 'Lưu Danh Bạ' (tải file vCard .vcf), 'Ghé thăm Website' công ty, và 'Đăng ký kết nối'.
- **API Endpoints Backend**:
`http
GET /card/public/:code
`
- **Bảng CSDL PostgreSQL**:
`sql
public.members (full_name, avatar_url, bio, phone, email, is_phone_private, is_email_private)
public.companies (company_name, tax_code, website_url, logo_url, address)
`
- **Ràng buộc & Ghi chú**: Trang web tối ưu tải trang cực nhanh, hỗ trợ xem tốt trên mọi trình duyệt di động.

---

### 33. [NODE-APP-004] Danh Bạ Hội Viên & Bản Đồ 2D Google Maps Dẫn Đường
- **Đối tượng sử dụng**: Hội viên Doanh nhân
- **Luồng nghiệp vụ chi tiết**:
  1. Danh bạ số 100% doanh nhân thành viên chính thức của CLB.
  2. Cung cấp 2 chế độ hiển thị linh hoạt: Chế độ Danh sách và Chế độ Bản đồ 2D.
  3. Chế độ Bản đồ 2D Google Maps (tích hợp Leaflet tile mt1.google.com): Ghim vị trí trụ sở công ty các hội viên trên bản đồ với 2 phạm vi 'Tổng thể' và 'Cá nhân'.
  4. Hội viên chạm vào ghim để xem thông tin doanh nghiệp, ngành nghề và bấm 'Chỉ đường' để kích hoạt Google Maps dẫn đường trực tiếp từ vị trí hiện tại đến công ty đối tác.
  5. Triệt tiêu hoàn toàn lỗi màn hình đen 3D, vận hành mượt mà nhẹ nhàng.
- **API Endpoints Backend**:
`http
GET /association/members
GET /association/members/locations
`
- **Bảng CSDL PostgreSQL**:
`sql
public.members (id, full_name, avatar_url, phone, department, executive_role)
public.companies (id, member_id, company_name, industry, address, lat, lng)
`
- **Ràng buộc & Ghi chú**: Tích hợp GPS định vị vị trí hiện tại và chỉ đường chính xác theo thời gian thực.

---

### 34. [NODE-APP-005] Cơ Hội Giao Thương B2B Strip 3 Thẻ Ngang
- **Đối tượng sử dụng**: Hội viên Doanh nhân
- **Luồng nghiệp vụ chi tiết**:
  1. Màn hình giao thương thiết kế dải 3 thẻ thống kê ngang trực quan: 'Tổng chia sẻ', 'Deal đã chốt', 'Tôi share đi' (tuyệt đối không để biểu đồ nặng trong màn này).
  2. Hội viên đăng cơ hội hợp tác kinh doanh mới: Tiêu đề nhu cầu, Mô tả chi tiết, Trị giá hợp đồng dự kiến, Lĩnh vực ngành nghề.
  3. Hội viên nhận cơ hội bấm tiếp nhận, trao đổi và cập nhật trạng thái giao dịch (Đang kết nối -> Đang đàm phán -> Ký kết thành công -> Báo cáo doanh số).
  4. Nút chuyển hướng sang màn hình Thống kê Analytics chuyên sâu.
- **API Endpoints Backend**:
`http
GET /association/opportunities
POST /association/opportunities
PUT /association/opportunities/:id/status
`
- **Bảng CSDL PostgreSQL**:
`sql
public.opportunities (id, giver_id, receiver_id, title, description, value_amount, industry, status='OPEN'|'CONNECTING'|'CLOSED'|'CANCELLED', closed_at)
public.members (id, full_name, avatar_url)
`
- **Ràng buộc & Ghi chú**: Ghi nhận doanh số chốt deal thực tế phục vụ vinh danh Top Giver của CLB.

---

### 35. [NODE-APP-006] Trung Tâm Thống Kê Hội Viên 5 Phân Loại Nghiệp Vụ
- **Đối tượng sử dụng**: Hội viên Doanh nhân, Ban Điều Hành
- **Luồng nghiệp vụ chi tiết**:
  1. Thống kê hiệu quả hoạt động cá nhân và toàn CLB theo 5 chỉ số: Doanh thu kết nối, Số cơ hội trao đi, Tỷ lệ tham dự sự kiện/họp, Khóa đào tạo hoàn thành, Khách mời giới thiệu.
  2. Biểu đồ ComposedChart trực quan cột-đường sinh động.
  3. Bục vinh danh Top 3 Giver được gom gọn gàng trên 1 hàng ngang, vinh danh Top 1 với avatar viền vàng đặc trưng.
  4. Hỗ trợ bấm nút xuất báo cáo thành tích ra file Excel hoặc in ấn file A4 PDF.
- **API Endpoints Backend**:
`http
GET /association/opportunities/report
`
- **Bảng CSDL PostgreSQL**:
`sql
public.opportunities (giver_id, receiver_id, value_amount, status)
public.members (id, full_name, avatar_url)
public.event_registrations (member_id, check_in_status)
`
- **Ràng buộc & Ghi chú**: Thiết kế chuẩn Mobile-first, hiển thị sắc nét trên mọi kích thước màn hình.

---

### 36. [NODE-APP-007] Giao Thương B2B, Gian Hàng Của Tôi & Danh Mục Quan Tâm
- **Đối tượng sử dụng**: Hội viên Doanh nhân
- **Luồng nghiệp vụ chi tiết**:
  1. Đổi tên danh mục 'Sàn giao thương nội bộ' và 'Chợ giao thương' thành tên chuẩn mực: 'Giao thương'.
  2. Sàn Giao thương: Trưng bày sản phẩm/dịch vụ của các doanh nghiệp thành viên. Lọc theo ngành nghề, tìm kiếm nhanh và nút bấm nhắn tin trực tiếp với chủ doanh nghiệp.
  3. Gian hàng của tôi: Mỗi doanh nghiệp được đăng tối đa 5 sản phẩm/dịch vụ (hiển thị huy hiệu X/5 sản phẩm để chống spam).
  4. Mỗi thẻ sản phẩm đã đăng có Icon 3 chấm bấm vào mở Menu tùy chọn tinh gọn: Chỉnh sửa sản phẩm, Xóa sản phẩm, Chia sẻ liên kết sản phẩm.
  5. Đặc biệt có Danh mục 'Ai đang quan tâm sản phẩm': Hiển thị danh sách chính xác các hội viên đã bấm quan tâm hoặc gửi yêu cầu kết nối với sản phẩm của chính tài khoản đó đăng.
- **API Endpoints Backend**:
`http
GET /association/products
POST /association/products
PUT /association/products/:id
DELETE /association/products/:id
GET /association/products/:id/interested-users
`
- **Bảng CSDL PostgreSQL**:
`sql
public.products (id, company_id, member_id, name, description, price, discount_price, image_urls, category, status, view_count)
public.product_interests (id, product_id, interested_member_id, note, created_at)
public.members (id, full_name, phone, email, avatar_url)
public.companies (company_name, logo_url)
`
- **Ràng buộc & Ghi chú**: Menu 3 chấm tinh tế tiết kiệm diện tích và cung cấp danh mục khách hàng tiềm năng nội bộ.

---

### 37. [NODE-APP-008] Sự Kiện & Hoạt Động (Đăng Ký Vé, Tải Poster & Up Ảnh Trực Tiếp)
- **Đối tượng sử dụng**: Hội viên Doanh nhân
- **Luồng nghiệp vụ chi tiết**:
  1. Đổi tên giao diện thành 'Sự kiện & Hoạt động'.
  2. Phân loại chuẩn 2 tab danh mục: Tab Sự kiện (Gala, Đại hội, Tọa đàm) và Tab Hoạt động (Kết nối B2B giữa 2 tài khoản, Chương trình đào tạo từ CRM). Loại bỏ các tab trùng lặp.
  3. Chuẩn hóa hiển thị: Duy nhất 1 nút 'Xem tất cả' và nút này tự động ẩn đi khi đang chọn ở tab 'Tất cả'.
  4. Hội viên bấm 'Đăng ký tham gia' nhận vé điện tử kèm mã QR check-in.
  5. Có chức năng 'Tải poster' đối với các sự kiện chính thức.
  6. Trong quá trình diễn ra sự kiện, có nút 'Tải ảnh' hoặc 'Chụp ảnh trực tiếp' từ điện thoại để đính kèm vào sự kiện (giới hạn tối đa 5 ảnh, có tính năng up video), lưu vào lịch sử sự kiện và tự động đẩy bài sang màn hình Mạng lưới.
- **API Endpoints Backend**:
`http
GET /association/events-and-meetings
POST /events/:id/register
POST /events/:id/cancel
POST /events/:id/media
GET /events/:id/my-ticket
`
- **Bảng CSDL PostgreSQL**:
`sql
public.events (id, title, banner_url, poster_url, start_date, end_date, location, status)
public.meetings (id, title, meeting_date)
public.trainings (id, title, start_time)
public.event_registrations (id, event_id, member_id, ticket_code, status)
public.feed_posts (id, type='EVENT_MEDIA', media_urls, author_id)
`
- **Ràng buộc & Ghi chú**: Nút chụp ảnh trực tiếp và đăng tải ảnh tư liệu đa phương tiện trong sự kiện.

---

### 38. [NODE-APP-009] Biểu Quyết Trực Tuyến Gắn Với Sự Kiện / Cuộc Họp
- **Đối tượng sử dụng**: Hội viên Doanh nhân tham dự
- **Luồng nghiệp vụ chi tiết**:
  1. Danh sách các phiên biểu quyết, bầu cử đang mở gắn liền với Sự kiện hoặc Cuộc họp mà hội viên tham gia.
  2. Hội viên đọc nội dung tờ trình, chọn phương án tán thành/không tán thành/ý kiến khác.
  3. Bấm 'Gửi phiếu biểu quyết', hệ thống ghi nhận phiếu bầu vào CSDL PostgreSQL.
  4. Cập nhật tỷ lệ phần trăm (%) biểu quyết thời gian thực trên màn hình ứng dụng và màn hình chiếu lớn tại sự kiện.
- **API Endpoints Backend**:
`http
GET /association/polls
POST /association/polls/:id/vote
`
- **Bảng CSDL PostgreSQL**:
`sql
public.polls (id, event_id, meeting_id, title, is_active)
public.poll_options (id, poll_id, option_text, vote_count)
public.poll_votes (id, poll_id, option_id, member_id, voted_at)
`
- **Ràng buộc & Ghi chú**: Mỗi hội viên chỉ được bỏ phiếu một lần duy nhất cho mỗi phiên biểu quyết.

---

### 39. [NODE-APP-010] Bảng Tin Mạng Lưới Doanh Nhân & Tương Tác Xã Hội
- **Đối tượng sử dụng**: Toàn thể Hội viên Doanh nhân
- **Luồng nghiệp vụ chi tiết**:
  1. Mạng xã hội doanh nhân CEO 1983: Hội viên đăng bài viết chia sẻ kinh nghiệm điều hành, kết nối kinh doanh, đính kèm hình ảnh và video.
  2. Tương tác đa dạng: Thả cảm xúc (Like, Tym, Claps), Bình luận trao đổi dưới bài viết.
  3. Tiếp nhận các bài phát thanh tự động từ CRM ('Bắn Mạng Lưới' từ Sự kiện, Cuộc họp, Khóa đào tạo).
  4. Đặc thù bảo mật: Khi bài viết có mã QR tham dự/điểm danh, hệ thống tự động hiển thị dưới dạng đường link an toàn, không hiển thị mã QR thô trên màn hình Mạng lưới.
  5. Hiển thị huy hiệu điểm danh '@HọTên [✓ Đã Check-in]' tạo không khí sôi động.
- **API Endpoints Backend**:
`http
GET /association/feed
POST /association/feed/posts
POST /association/feed/posts/:id/comments
POST /association/feed/posts/:id/react
DELETE /association/feed/posts/:id
`
- **Bảng CSDL PostgreSQL**:
`sql
public.feed_posts (id, author_id, type, title, content, link_url, media_urls, likes_count, comments_count, created_at)
public.feed_comments (id, post_id, author_id, content, created_at)
public.feed_reactions (id, post_id, member_id, reaction_type)
`
- **Ràng buộc & Ghi chú**: Mã QR được hiển thị dưới dạng đường link bảo mật trên màn Mạng lưới.

---

### 40. [NODE-APP-011] Hồ Sơ Cá Nhân & Quản Trị Hồ Sơ Doanh Nghiệp Thành Viên
- **Đối tượng sử dụng**: Hội viên Doanh nhân
- **Luồng nghiệp vụ chi tiết**:
  1. Quản lý thông tin hồ sơ cá nhân 360 độ: Ảnh đại diện, Họ tên, Ngày sinh, Giới tính, Số điện thoại, Email, Tiểu sử lãnh đạo.
  2. Hồ sơ Doanh nghiệp thành viên: Logo, Tên doanh nghiệp, Mã số thuế, Ngành nghề, Quy mô vốn/nhân sự, Trụ sở, Sản phẩm dịch vụ chủ lực.
  3. Xem Hợp đồng hội viên điện tử, tình trạng đóng hội phí niên liễm và thẻ VIP liên kết.
  4. Tải lên và cập nhật ảnh đại diện sắc nét thông qua camera điện thoại.
- **API Endpoints Backend**:
`http
GET /association/profile
PUT /association/profile
POST /upload/avatar
`
- **Bảng CSDL PostgreSQL**:
`sql
public.members (id, full_name, avatar_url, bio, phone, email, dues_expired_at)
public.companies (company_name, tax_code, industry, employee_scale, website_url, logo_url)
public.vione_users (id, email)
`
- **Ràng buộc & Ghi chú**: Lấy chuẩn 100% dữ liệu đã đăng ký của hội viên từ CSDL, không bị thiếu sót trường.

---

### 41. [NODE-APP-012] Cài Đặt Hệ Thống, Bảo Mật Tài Khoản & Hỗ Trợ 24/7
- **Đối tượng sử dụng**: Hội viên Doanh nhân
- **Luồng nghiệp vụ chi tiết**:
  1. Tùy chỉnh ngôn ngữ hiển thị (Tiếng Việt / English), chuyển đổi giao diện Sáng / Tối (Light/Dark mode).
  2. Quản lý cấu hình thông báo đẩy (Bật/tắt thông báo sự kiện, tin nhắn, nhắc hẹn).
  3. Đổi mật khẩu bảo mật tài khoản di động.
  4. Khối Thông tin hỗ trợ 24/7: Hotline Ban Thư Ký CLB, Email tiếp nhận phản hồi và Hướng dẫn sử dụng app.
- **API Endpoints Backend**:
`http
PUT /auth/change-password
GET /system/support-info
`
- **Bảng CSDL PostgreSQL**:
`sql
public.vione_users (password_hash)
public.system_settings (key='support_contact', value_json)
`
- **Ràng buộc & Ghi chú**: Hỗ trợ thay đổi mật khẩu và quản lý bảo mật cá nhân thuận tiện.

---

### 42. [NODE-APP-013] Kho Ưu Đãi Đặc Quyền Doanh Nhân (VIP Perks) & Mã QR Động
- **Đối tượng sử dụng**: Hội viên Doanh nhân
- **Luồng nghiệp vụ chi tiết**:
  1. Kho đặc quyền ưu đãi dành riêng cho hội viên CEO 1983 do các doanh nghiệp thành viên và đối tác tài trợ cung cấp (Nhà hàng cao cấp, Khách sạn nghỉ dưỡng, Dịch vụ phòng vé, Tư vấn luật, Golf).
  2. Xem chi tiết ưu đãi, điều kiện áp dụng và địa điểm sử dụng kèm liên kết mở Google Maps chỉ đường trực tiếp.
  3. Mỗi ưu đãi cung cấp một mã QR động để nhân viên tại điểm chấp nhận ưu đãi quét xác thực quyền lợi VIP.
- **API Endpoints Backend**:
`http
GET /association/perks
GET /association/perks/:id/qr
`
- **Bảng CSDL PostgreSQL**:
`sql
public.perks (id, title, provider_company_id, discount_percent, description, location_address, lat, lng, valid_until, qr_code_secret, is_active)
public.companies (company_name, logo_url)
`
- **Ràng buộc & Ghi chú**: Mã QR động thay đổi theo thời gian đảm bảo tính xác thực của ưu đãi.

---

### 43. [NODE-APP-014] Cầu Nối Native Capacitor (Android/iOS) & Push Notifications
- **Đối tượng sử dụng**: Hội viên Doanh nhân sử dụng App Native
- **Luồng nghiệp vụ chi tiết**:
  1. Cầu nối Native Capacitor tích hợp trên nền tảng Android (APK/AAB) và iOS (IPA).
  2. Tối ưu hóa giao diện di động: Tương thích vùng an toàn (Safe Area), thanh trạng thái (StatusBar) và phím Back cứng trên Android.
  3. Đăng ký nhận thông báo đẩy qua Firebase Cloud Messaging (FCM) và Web Push Service Worker.
  4. Khi có sự kiện mới, nhắc hẹn lịch họp, tin nhắn kết nối hoặc giao việc khẩn cấp, máy chủ tự động bắn Push Notification hiển thị trên màn hình khóa điện thoại.
- **API Endpoints Backend**:
`http
POST /notifications/subscribe
POST /notifications/unsubscribe
POST /notifications/test-push
`
- **Bảng CSDL PostgreSQL**:
`sql
public.user_push_tokens (id, user_id, device_token, platform='ANDROID'|'IOS'|'WEB', is_active, updated_at)
public.notifications (id, user_id, title, content, is_read)
`
- **Ràng buộc & Ghi chú**: Cung cấp trải nghiệm mượt mà 100% giống ứng dụng native thuần túy.

---

### 44. [NODE-APP-015] Gặp Gỡ Kết Nối B2B 1-on-1 Giữa Hai Tài Khoản
- **Đối tượng sử dụng**: Hội viên Doanh nhân
- **Luồng nghiệp vụ chi tiết**:
  1. Phân hệ kết nối chuyên sâu giữa 2 hội viên: Hội viên tra cứu đối tác phù hợp trong danh bạ và bấm 'Đặt lịch hẹn kết nối 1-on-1'.
  2. Chọn ngày giờ gặp, hình thức (Gặp trực tiếp tại công ty, Cafe kết nối, hoặc Video Call online) và nội dung trao đổi mong muốn.
  3. Đối tác nhận được lời mời: Có thể Chấp nhận, Từ chối kèm lý do hoặc Đề xuất dời lịch hẹn.
  4. Sau buổi gặp, hai bên cập nhật kết quả trao đổi và ghi nhận giá trị cơ hội hợp tác phát sinh.
- **API Endpoints Backend**:
`http
GET /association/b2b-connect/my-meetings
POST /association/b2b-connect/request
PATCH /association/b2b-connect/:id/status
POST /association/b2b-connect/:id/result
`
- **Bảng CSDL PostgreSQL**:
`sql
public.b2b_connections (id, sender_id, receiver_id, scheduled_at, location_type, location_detail, agenda, status='PENDING'|'ACCEPTED'|'REJECTED'|'COMPLETED', result_notes, deal_value)
public.members (id, full_name, avatar_url)
`
- **Ràng buộc & Ghi chú**: Tự động đồng bộ lịch hẹn 1-on-1 đã xác nhận vào Lịch hoạt động cá nhân.

---

### 45. [NODE-APP-016] Đào Tạo Di Động & Phòng Họp Video Call Trực Tuyến
- **Đối tượng sử dụng**: Hội viên Doanh nhân
- **Luồng nghiệp vụ chi tiết**:
  1. Danh sách các khóa đào tạo nâng cao năng lực quản trị doanh nghiệp từ Ban Đào Tạo CLB.
  2. Xem chi tiết lộ trình học, thông tin chuyên gia giảng dạy và tài liệu bài giảng số (file PDF/Word).
  3. Bấm 'Vào phòng học trực tuyến': Ứng dụng kích hoạt giao diện phòng họp Video Call trực tiếp trong app (nhúng Jitsi Meet SDK/WebRTC), hỗ trợ đầy đủ mic, camera, chat, giơ tay phát biểu mà không cần cài đặt phần mềm bên ngoài.
- **API Endpoints Backend**:
`http
GET /association/trainings
POST /trainings/:id/register
GET /trainings/:id/room-token
`
- **Bảng CSDL PostgreSQL**:
`sql
public.trainings (id, title, instructor_name, start_time, end_time, room_url, syllabus_url)
public.training_attendees (id, training_id, member_id, status)
`
- **Ràng buộc & Ghi chú**: Tham gia lớp học trực tuyến mượt mà ngay trên thiết bị di động.

---

### 46. [NODE-APP-017] Lịch Hoạt Động & Báo Thức Nhắc Hẹn Đa Kênh Tự Động
- **Đối tượng sử dụng**: Hội viên Doanh nhân
- **Luồng nghiệp vụ chi tiết**:
  1. Mọi Sự kiện CLB, Cuộc họp Ban chuyên môn, Khóa đào tạo và Cuộc gặp B2B 1-on-1 mà hội viên đã đăng ký/chấp nhận tham gia đều được TỰ ĐỘNG LƯU VÀO LỊCH HOẠT ĐỘNG.
  2. Cung cấp 2 chế độ xem giao diện linh hoạt: Dạng Lưới lịch tháng (Grid Calendar) và Dạng Danh sách dòng thời gian (Timeline List).
  3. Nút 'Bật nhắc' (click lần 2 để bỏ nhắc) cho từng hoạt động.
  4. Hệ thống Active Reminder Engine hoạt động tự động:
     - Nhắc hẹn tại Popup chào mừng ngay lần đầu mở app trong ngày.
     - Bắn thông báo đẩy vào Trung tâm Thông báo trên app.
     - Rung chuông phát thông báo Toast native trên màn hình điện thoại khi sắp đến giờ diễn ra hoạt động.
- **API Endpoints Backend**:
`http
GET /association/calendar/my-schedule
POST /association/calendar/toggle-reminder
`
- **Bảng CSDL PostgreSQL**:
`sql
public.events (id, title, start_date)
public.meetings (id, title, meeting_date)
public.trainings (id, title, start_time)
public.b2b_connections (id, scheduled_at)
public.calendar_reminders (id, member_id, activity_type, activity_id, is_reminder_enabled, reminded_today)
`
- **Ràng buộc & Ghi chú**: Tích hợp đồng bộ tự động 4 nguồn hoạt động và nhắc hẹn đa tầng thông minh.

---


## PHẦN IV: LUỒNG KHÁCH VÃNG LAI & KIỂM TRA MÃ QR AN TOÀN

### 47. [NODE-EXT-001] Quét Mã QR Đăng Ký Khách & Tự Động Bắn Email Cảnh Báo Khi QR Hết Hạn / Bị Xóa
- **Đối tượng sử dụng**: Khách mời vãng lai quét mã QR từ Poster, Mạng xã hội, Email hoặc Zalo
- **Luồng nghiệp vụ chi tiết**:
  1. Khách quét mã QR sự kiện/đào tạo (được in trên banner standee, chia sẻ trên mạng xã hội hoặc gửi qua email/Zalo), trình duyệt mở trang đăng ký vé khách (/guest-event-register/$eventId).
  2. Cơ chế kiểm tra an toàn mã QR (QR Safety Guard):
     - Nếu sự kiện/khóa đào tạo đã bị ban tổ chức XÓA khỏi hệ thống, hoặc mã QR ĐÃ HẾT HẠN, hoặc ĐÃ THAY ĐỔI:
     - Khi khách bấm gửi biểu mẫu đăng ký, hệ thống lập tức chặn lại và tự động kích hoạt mail.service.ts (hàm sendQrChangedOrExpiredEmail) gửi ngay một email thông báo lịch sự tới hòm thư của khách: thông báo sự kiện đã thay đổi/mã QR không còn sử dụng được, đồng thời cung cấp thông tin liên hệ Ban Thư Ký CLB nếu muốn biết thêm chi tiết.
     - Đồng thời trên màn hình đăng ký hiển thị thông báo trạng thái trang trọng, rõ ràng.
  3. Nếu mã QR còn hiệu lực hợp lệ:
     - Hệ thống lưu thông tin đăng ký vào CSDL, sinh mã vé điện tử QR độc bản và tự động gửi email xác nhận tham dự kèm vé (sendEventTicketEmail) tới hộp thư của khách.
- **API Endpoints Backend**:
`http
GET /public/events/:id/details
POST /events/:id/guest-register
`
- **Bảng CSDL PostgreSQL**:
`sql
public.events (id, title, start_date, location, status, is_deleted)
public.event_registrations (id, event_id, guest_name, guest_email, guest_phone, ticket_code, check_in_status)
public.mail_templates (key='QR_EXPIRED_OR_CHANGED' | 'EVENT_TICKET_CONFIRMATION')
`
- **Ràng buộc & Ghi chú**: Triệt tiêu hoàn toàn rủi ro quét nhầm mã QR cũ hoặc sự kiện đã hủy; tự động chăm sóc và hướng dẫn khách qua email.

---

