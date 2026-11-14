# BẢN ĐẶC TẢ CHỨC NĂNG CỔNG QUẢN TRỊ WEB CRM
## Dành Cho Chủ Tịch, Ban Điều Hành, 7 Ban Chuyên Môn, Thư Ký, Kế Toán & Quản Trị Viên

*Hiệp Hội Doanh Nhân CEO 1983 (HanoiBA) | Phiên bản 5.0 | 100% CSDL PostgreSQL*

---

### 1. [NODE-CRM-AUTH-001] Đăng Nhập Quản Trị Viên & Kiểm Tra Quyền RBAC
- **Đối tượng sử dụng**: Chủ tịch, Ban Điều Hành, Trưởng 7 Ban, Ban Thư Ký, Kế toán, Admin
- **Luồng nghiệp vụ chi tiết**:
  1. Người dùng truy cập /login trên trình duyệt máy tính.
  2. Nhập Email/Username và Mật khẩu quản trị.
  3. Backend kiểm tra mã băm mật khẩu bcrypt và truy vấn bảng user_roles.
  4. Cấp JWT Token mang thông tin vai trò chức vụ trong CLB và ma trận quyền hạn CRM.
  5. Điều hướng vào thẳng Bàn điều hành (/dashboard). Từ chối nếu là tài khoản hội viên thông thường không có quyền truy cập CRM.
- **API Endpoints Backend**:
```http
POST /auth/login
POST /auth/refresh-token
```
- **Bảng CSDL PostgreSQL**:
```sql
public.vione_users (email, password_hash, status)
public.user_roles (user_id, role_id)
public.roles (code='ADMIN'|'BOARD'|'SECRETARY'|'ACCOUNTANT')
public.members (full_name, executive_role, department)
```
- **Ràng buộc & Ghi chú**: Chỉ những tài khoản được gán vai trò quản trị mới được phép truy cập phân hệ Web CRM.

---

### 2. [NODE-CRM-AUTH-002] Thu Hồi Phiên & Đăng Xuất An Toàn
- **Đối tượng sử dụng**: Quản trị viên CRM
- **Luồng nghiệp vụ chi tiết**:
  1. Bấm nút 'Đăng xuất' tại menu hồ sơ quản trị góc trên bên phải.
  2. Thu hồi Refresh Token, xóa sạch localStorage/sessionStorage/cookies.
  3. Ngắt kết nối Socket.IO bảo mật.
  4. Điều hướng về màn hình đăng nhập /login.
- **API Endpoints Backend**:
```http
POST /auth/logout
```
- **Bảng CSDL PostgreSQL**:
```sql
public.vione_users (last_logout_at)
public.audit_logs (user_id, action='LOGOUT_CRM', ip_address)
```
- **Ràng buộc & Ghi chú**: Bảo đảm phiên quản trị được đóng hoàn toàn, chống tái sử dụng token.

---

### 3. [NODE-CRM-AUTH-003] Đổi Mật Khẩu Tài Khoản Quản Trị
- **Đối tượng sử dụng**: Cán bộ quản trị CRM
- **Luồng nghiệp vụ chi tiết**:
  1. Truy cập mục Hồ sơ -> Đổi mật khẩu.
  2. Nhập mật khẩu hiện tại, mật khẩu mới và xác nhận (tối thiểu 8 ký tự, có ký tự hoa, số, đặc biệt).
  3. Backend so khớp hash mật khẩu cũ, băm mật khẩu mới với salt 10 và cập nhật CSDL.
- **API Endpoints Backend**:
```http
PUT /auth/change-password
```
- **Bảng CSDL PostgreSQL**:
```sql
public.vione_users (password_hash, updated_at)
```
- **Ràng buộc & Ghi chú**: Bắt buộc kiểm tra mật khẩu hiện tại trước khi ghi nhận mật khẩu mới.

---

### 4. [NODE-CRM-AUTH-004] Tiếp Nhận Yêu Cầu Quên Mật Khẩu & Cấp Mới Mật Khẩu Cho Hội Viên
- **Đối tượng sử dụng**: Ban Thư Ký & Quản trị viên tối cao
- **Luồng nghiệp vụ chi tiết**:
  1. Khi Hội viên bấm quên mật khẩu trên App, hệ thống tạo cảnh báo về Trung tâm Thông báo CRM (/notifications).
  2. Quản trị viên bấm vào cảnh báo, hệ thống mở modal 'Cấp lại mật khẩu' cho tài khoản đó.
  3. Quản trị viên nhập mật khẩu mới và bấm xác nhận.
  4. Hệ thống lưu hash mới vào CSDL, tự động bắn Email và tin nhắn Zalo OA ZNS thông báo mật khẩu mới cho Hội viên.
- **API Endpoints Backend**:
```http
POST /admin/reset-password
POST /zalo/send-zns
```
- **Bảng CSDL PostgreSQL**:
```sql
public.vione_users (password_hash, reset_token)
public.notifications (type='FORGOT_PASSWORD_REQUEST')
public.mail_templates (key='RESET_PASSWORD_TEMPLATE')
```
- **Ràng buộc & Ghi chú**: Xác thực kép: Quản trị viên phê duyệt trên CRM, hệ thống tự động dispatch thông báo mật khẩu mới.

---

### 5. [NODE-CRM-001] Tổng Quan & Bàn Điều Hành CLB (Executive Dashboard)
- **Đối tượng sử dụng**: Chủ tịch, Ban Điều Hành, Ban Thư Ký, Kế toán
- **Luồng nghiệp vụ chi tiết**:
  1. Hiển thị 4 thẻ KPI Gradient thời gian thực: Tổng hội viên chính thức, Doanh nghiệp kết nối, Tổng quỹ thu/chi, Sự kiện trong tháng.
  2. Lịch biểu công tác tháng trực quan tích hợp lịch sự kiện và họp ban.
  3. Biểu đồ tài chính nhanh.
  4. Cảnh báo thông minh: Hội viên sắp hết hạn niên liễm trong 30 ngày hoặc nợ đọng hội phí.
- **API Endpoints Backend**:
```http
GET /admin/dashboard-stats
GET /admin/recent-activities
```
- **Bảng CSDL PostgreSQL**:
```sql
public.members (status, joined_date, dues_expired_at)
public.events (start_date, status)
public.meetings (meeting_date)
public.income_records (amount)
public.expense_records (amount)
```
- **Ràng buộc & Ghi chú**: 100% dữ liệu thống kê từ PostgreSQL, tuyệt đối không dùng số liệu mock.

---

### 6. [NODE-CRM-002] Trung Tâm Thống Kê Chuyên Sâu 5 Danh Mục (Analytics Hub)
- **Đối tượng sử dụng**: Chủ tịch, Ban Điều Hành, Ban Thư Ký
- **Luồng nghiệp vụ chi tiết**:
  1. Menu Thống kê CLB (icon BarChart3 trên Sidebar).
  2. Thống kê theo 5 danh mục: 1. Doanh thu B2B, 2. Phát triển Hội viên, 3. Kết nối & Trao cơ hội, 4. Tỷ lệ điểm danh, 5. Đào tạo nâng cao.
  3. 4 thẻ KPI chỉ số, Biểu đồ ComposedChart (cột doanh thu, đường tăng trưởng).
  4. Bục vinh danh Top 3 Giver nằm gọn trên 1 hàng ngang, Top 1 avatar viền vàng.
  5. Xuất báo cáo chi tiết ra file Excel và in ấn bản A4 PDF chuẩn mực.
- **API Endpoints Backend**:
```http
GET /admin/analytics-summary
GET /admin/analytics/industry-breakdown
GET /admin/analytics/top-performers
```
- **Bảng CSDL PostgreSQL**:
```sql
public.members (points)
public.opportunities (value_amount, status='CLOSED')
public.departments (name)
public.events (id)
public.event_registrations (check_in_status='CHECKED_IN')
```
- **Ràng buộc & Ghi chú**: Bộ lọc thời gian linh hoạt: Tuần này, Tháng này, Quý này, Năm nay.

---

### 7. [NODE-CRM-003] Quản Trị Danh Bạ Hội Viên 360 Độ (Member Directory)
- **Đối tượng sử dụng**: Ban Thư Ký, Ban Hội Viên, Admin
- **Luồng nghiệp vụ chi tiết**:
  1. Bảng CustomTable (chỉ hiện tối đa 2 dòng, text dài hiện dấu ba chấm và tooltip toàn văn).
  2. Tìm kiếm nhanh theo Họ tên, SĐT, Email, Công ty, Ban chuyên môn, Trạng thái.
  3. Xem chi tiết hồ sơ 360 độ: lịch sử tham gia, đóng phí, cơ hội đã trao.
  4. Thêm mới, chỉnh sửa thông tin cá nhân hội viên.
  5. Phê duyệt hồ sơ đăng ký mới từ App di động.
  6. Xóa hội viên với 2 chế độ: Xóa công ty trước hoặc Xóa cascade tất cả.
  7. Xuất file Excel danh bạ và Nhập danh bạ hàng loạt từ Excel.
- **API Endpoints Backend**:
```http
GET /members
POST /members
PUT /members/:id
DELETE /members/:id
PATCH /members/:id/approve
POST /members/import-excel
GET /members/export-excel
```
- **Bảng CSDL PostgreSQL**:
```sql
public.members (full_name, phone, email, status, dues_expired_at, department)
public.companies (company_name)
public.vione_users (status)
```
- **Ràng buộc & Ghi chú**: Tất cả bảng dữ liệu trên CRM dùng chung 1 component CustomTable chuẩn hóa.

---

### 8. [NODE-CRM-004] Quản Trị Doanh Nghiệp Thành Viên (Companies)
- **Đối tượng sử dụng**: Ban Thư Ký, Ban B2B, Admin
- **Luồng nghiệp vụ chi tiết**:
  1. Danh mục Doanh nghiệp (/companies): Tên công ty (cột 3), Mã số thuế, Người đại diện, Ngành nghề, Vốn điều lệ, Quy mô nhân sự, Trụ sở, Website, Logo.
  2. Xem chi tiết pháp nhân, danh sách sản phẩm đăng bán trên sàn B2B.
  3. Thêm mới, cập nhật thông tin doanh nghiệp hoặc thay đổi trạng thái xác thực.
- **API Endpoints Backend**:
```http
GET /companies
POST /companies
PUT /companies/:id
DELETE /companies/:id
```
- **Bảng CSDL PostgreSQL**:
```sql
public.companies (company_name, tax_code, legal_representative, industry, capital, employee_scale, address, website_url, logo_url)
public.members (id, full_name)
```
- **Ràng buộc & Ghi chú**: Quản lý dữ liệu pháp nhân độc lập, liên kết 1-N với hội viên.

---

### 9. [NODE-CRM-005] Quản Lý Tài Khoản & Gán Ban Chuyên Môn Trực Tiếp
- **Đối tượng sử dụng**: Ban Thư Ký, Quản trị viên tối cao
- **Luồng nghiệp vụ chi tiết**:
  1. Nằm trong nhóm Phân Quyền trên Sidebar (thay thế chức năng cũ).
  2. Tên tài khoản hiển thị sạch, khử bỏ hoàn toàn ký tự @ thừa.
  3. Tìm kiếm theo tên, email, username, trạng thái khóa/mở.
  4. Mở modal chỉnh sửa gán trực tiếp vai trò quản trị (Admin, Thư ký, Kế toán, Hội viên) và gán 1 trong 7 Ban chuyên môn trực tiếp vào CSDL PostgreSQL (không dùng mock).
  5. Khóa hoặc mở khóa tài khoản tức thì.
- **API Endpoints Backend**:
```http
GET /accounts
PATCH /members/:id/role-dept
PATCH /users/:id/status
POST /accounts/create
```
- **Bảng CSDL PostgreSQL**:
```sql
public.vione_users (email, status)
public.members (executive_role, department)
public.user_roles (user_id, role_id)
public.departments (code, name)
```
- **Ràng buộc & Ghi chú**: Dữ liệu lưu trực tiếp vào CSDL, nạp lại tự động khi F5.

---

### 10. [NODE-CRM-006] Ma Trận Phân Quyền RBAC 2 Tab & Tự Động Đồng Bộ Tên Sidebar
- **Đối tượng sử dụng**: Chủ tịch CLB & Super Admin
- **Luồng nghiệp vụ chi tiết**:
  1. Màn hình Phân quyền (/permissions) hiển thị 2 Tab riêng biệt: Tab 1 'Phân Quyền CRM Web' và Tab 2 'Phân Quyền App Mobile'.
  2. Khi Sidebar hoặc route đổi tên, danh mục tính năng tự động đồng bộ tên mới nhất.
  3. Quản trị viên tick chọn phân quyền (Xem, Thêm, Sửa, Xóa, Duyệt, Xuất file) cho từng vai trò.
  4. Bấm 'Lưu ma trận phân quyền', lưu toàn bộ quyền hạn vào PostgreSQL.
  5. Backend RBAC Guard kiểm tra quyền trước mọi API endpoint, chặn 403 Forbidden nếu không đủ quyền.
- **API Endpoints Backend**:
```http
GET /admin/roles
POST /admin/roles/permissions
PUT /admin/roles/:id
GET /admin/permissions
```
- **Bảng CSDL PostgreSQL**:
```sql
public.roles (code, name)
public.permissions (code, module, platform)
public.role_permissions (role_id, permission_id)
public.user_roles (user_id, role_id)
```
- **Ràng buộc & Ghi chú**: Tách bạch quyền quản trị CRM và quyền tính năng di động.

---

### 11. [NODE-CRM-007] Quản Trị Sự Kiện, Vé, Xếp Chỗ & Bắn Mạng Lưới
- **Đối tượng sử dụng**: Ban Sự Kiện, Ban Điều Hành, Ban Thư Ký
- **Luồng nghiệp vụ chi tiết**:
  1. Tạo sự kiện: Tiêu đề, Banner/Poster, Địa điểm, Thời gian, Sơ đồ chỗ ngồi, Agenda chi tiết theo khung giờ, Giới hạn vé, Giá vé.
  2. Quản lý danh sách đăng ký vé (Hội viên / Khách vãng lai).
  3. Xếp chỗ ngồi & Gỡ/Đổi chỗ: Khi gỡ hoặc đổi vị trí ngồi, hệ thống tự động gửi Email và Zalo OA thông báo vị trí chỗ ngồi mới.
  4. Điểm danh quét mã QR vé tham dự thời gian thực.
  5. Tải poster sự kiện về máy.
  6. Tải ảnh/chụp ảnh trực tiếp tối đa 5 ảnh & video tư liệu lưu lịch sử sự kiện.
  7. Nút 'Bắn Mạng Lưới': Tự động phát thanh bài viết lên Bảng tin Mạng lưới App Mobile (hiển thị đường link QR thay vì ảnh QR thô).
- **API Endpoints Backend**:
```http
GET /events
POST /events
PUT /events/:id
DELETE /events/:id
POST /events/:id/seats
DELETE /events/:id/seats/:seatId
POST /events/:id/checkin
POST /feed/broadcast-event
POST /events/:id/media
```
- **Bảng CSDL PostgreSQL**:
```sql
public.events (title, banner_url, poster_url, agenda_json, ticket_price, max_attendees)
public.event_registrations (ticket_code, seat_number, check_in_status)
public.event_seats (seat_code, member_id)
public.feed_posts (type='EVENT', link_url, media_urls)
```
- **Ràng buộc & Ghi chú**: Gỡ hoặc đổi chỗ ngồi tự động kích hoạt gửi Email + Zalo OA thông báo vị trí mới.

---

### 12. [NODE-CRM-008] Quản Lý Cuộc Họp Ban & Gặp Gỡ CLB
- **Đối tượng sử dụng**: Ban Điều Hành, Trưởng 7 Ban, Ban Thư Ký
- **Luồng nghiệp vụ chi tiết**:
  1. Lên lịch họp BĐH hoặc 7 ban chuyên môn: Tiêu đề, Nội dung, Thời gian, Thành phần triệu tập.
  2. Bản đồ tương tác chọn vị trí ghim đỏ (OpenStreetMap/Nominatim).
  3. Gửi thông báo triệu tập họp tới các thành viên liên quan.
  4. Điểm danh quét mã QR cuộc họp.
  5. Đính kèm biên bản họp, tài liệu số và tải lên tối đa 5 ảnh/video tư liệu.
  6. Tự động đồng bộ sang mục Hoạt động trên app và phát thanh lên Mạng lưới.
- **API Endpoints Backend**:
```http
GET /meetings
POST /meetings
PUT /meetings/:id
DELETE /meetings/:id
POST /meetings/:id/checkin
POST /feed/broadcast-meeting
POST /meetings/:id/media
```
- **Bảng CSDL PostgreSQL**:
```sql
public.meetings (title, department_code, meeting_date, location, lat, lng, agenda, minutes_file_url)
public.meeting_attendees (member_id, is_attended)
public.feed_posts (type='MEETING', media_urls)
```
- **Ràng buộc & Ghi chú**: Đồng bộ nhãn [Họp Ban] sang danh mục Hoạt động trên ứng dụng di động.

---

### 13. [NODE-CRM-009] Quản Lý Thu Ngân Sách, Phí Niên Liễm & Vé Sự Kiện
- **Đối tượng sử dụng**: Ban Tài Chính - Kiểm Tra, Kế toán CLB, Thủ quỹ
- **Luồng nghiệp vụ chi tiết**:
  1. Danh mục phiếu thu: Thu phí niên liễm, Thu tiền vé sự kiện, Thu tài trợ, Thu khác.
  2. Tạo phiếu thu mới, chọn Hội viên/Doanh nghiệp nộp, số tiền, ngày thu, chứng từ.
  3. Tạo mã thanh toán VietQR động chuẩn SeABank (tự động số tiền và nội dung chuyển khoản).
  4. Bảng co dãn cột chuột kiểu Excel, lọc theo khoảng ngày, danh mục thu.
  5. Nhập phiếu thu từ Excel và Xuất báo cáo sổ quỹ thu ra Excel.
- **API Endpoints Backend**:
```http
GET /finance/income
POST /finance/income
PUT /finance/income/:id
DELETE /finance/income/:id
POST /finance/income/import-excel
GET /finance/vietqr-payload
```
- **Bảng CSDL PostgreSQL**:
```sql
public.income_records (member_id, category, amount, payment_method, reference_code, transaction_date, receipt_url, status='COMPLETED')
public.members (full_name)
public.events (title)
```
- **Ràng buộc & Ghi chú**: 100% dữ liệu tài chính lưu trữ thực tế trong PostgreSQL.

---

### 14. [NODE-CRM-010] Quản Lý Chi Ngân Sách, Tạm Ứng & Hoàn Ứng
- **Đối tượng sử dụng**: Ban Tài Chính - Kiểm Tra, Kế toán, Chủ tịch
- **Luồng nghiệp vụ chi tiết**:
  1. Lập phiếu đề xuất chi: Chi tổ chức sự kiện, Chi hoạt động các ban, Chi quà tặng, Chi vận hành.
  2. Quản lý quy trình Tạm ứng kinh phí và Hoàn ứng tiền thừa sau sự kiện.
  3. Quy trình duyệt chi 2 cấp: Kế toán thẩm định chứng từ -> Chủ tịch duyệt chi điện tử.
  4. Đính kèm hóa đơn đỏ VAT, phiếu chi có chữ ký và ủy nhiệm chi ngân hàng.
  5. Nhập/Xuất sổ quỹ chi ra Excel.
- **API Endpoints Backend**:
```http
GET /finance/expenses
POST /finance/expenses
PUT /finance/expenses/:id
DELETE /finance/expenses/:id
POST /finance/expenses/import-excel
PATCH /finance/expenses/:id/approve
```
- **Bảng CSDL PostgreSQL**:
```sql
public.expense_records (applicant_id, approver_id, category, amount, advance_amount, refund_amount, status='PENDING'|'APPROVED', invoice_url)
public.members (full_name)
```
- **Ràng buộc & Ghi chú**: Quản lý chặt chẽ tạm ứng và hoàn ứng đảm bảo minh bạch tài chính.

---

### 15. [NODE-CRM-011] Báo Cáo Tài Chính Tổng Hợp & Quyết Toán Quỹ
- **Đối tượng sử dụng**: Chủ tịch, Ban Thường Trực, Ban Tài Chính
- **Luồng nghiệp vụ chi tiết**:
  1. Tổng hợp dữ liệu Thu - Chi thời gian thực từ PostgreSQL (100% real data, không mock).
  2. Biểu đồ ComposedChart đa tầng: Dòng tiền Thu, Dòng tiền Chi, Đường thặng dư quỹ lũy kế.
  3. Biểu đồ tròn PieChart phân bổ cơ cấu chi phí thực tế và tỷ trọng nguồn thu.
  4. Bảng phân tích chi tiết nguồn thu theo 4 hạng tài trợ: Kim Cương, Vàng, Bạc, Đồng.
  5. Xuất báo cáo quyết toán quỹ phục vụ Đại hội Hội viên và kiểm toán định kỳ.
- **API Endpoints Backend**:
```http
GET /finance/summary-report
GET /finance/flow-analysis
GET /finance/sponsor-tiers-report
```
- **Bảng CSDL PostgreSQL**:
```sql
public.income_records (amount, transaction_date, category)
public.expense_records (amount, expense_date, category, status='APPROVED')
public.sponsor_packages (tier, price)
```
- **Ràng buộc & Ghi chú**: Số liệu quyết toán phản ánh thời gian thực số dư khả dụng của quỹ CLB.

---

### 16. [NODE-CRM-012] Quản Lý Công Việc & Giao Việc Ban Chuyên Môn
- **Đối tượng sử dụng**: Chủ tịch, Ban Điều Hành, Trưởng Ban, Thành viên Ban
- **Luồng nghiệp vụ chi tiết**:
  1. Bấm 'Tạo công việc mới': Tiêu đề, Mô tả, Hạn hoàn thành, Mức độ ưu tiên (Khẩn cấp, Cao, Trung bình, Thấp).
  2. Chọn giao cho Cá nhân hoặc toàn bộ Ban chuyên môn.
  3. Đính kèm file đa định dạng (Word, Excel, PDF, Ảnh).
  4. Người nhận việc nhận ngay thông báo nêu rõ người giao: '[Giao việc từ ${creatorDisplayName}]'.
  5. Nút 'Xem file' (icon Con mắt) mở Universal Document Viewer đọc trực tiếp Excel SheetJS đa sheet, PDF nhúng, ảnh Lightbox mà không cần tải file về.
  6. Người nhận việc cập nhật tiến độ (Todo, In Progress, Completed). Dữ liệu lưu 100% vào CSDL.
- **API Endpoints Backend**:
```http
GET /tasks
POST /tasks
PUT /tasks/:id
DELETE /tasks/:id
PATCH /tasks/:id/status
POST /tasks/:id/attachments
```
- **Bảng CSDL PostgreSQL**:
```sql
public.tasks (creator_id, title, description, priority, deadline, status, department_id)
public.task_assignees (task_id, member_id)
public.task_attachments (task_id, file_name, file_url, file_size, mime_type)
public.notifications (title, content)
```
- **Ràng buộc & Ghi chú**: Không dùng mock data; hiển thị đích danh người giao việc và tích hợp xem file trực tiếp.

---

### 17. [NODE-CRM-013] Quản Trị Nhà Tài Trợ & Quyền Lợi Thương Hiệu
- **Đối tượng sử dụng**: Ban Tài Chính, Ban Sự Kiện, Ban Truyền Thông
- **Luồng nghiệp vụ chi tiết**:
  1. Quản lý danh bạ Nhà tài trợ đồng hành theo năm và theo sự kiện.
  2. Cấu hình 4 gói tài trợ: Kim Cương, Vàng, Bạc, Đồng kèm kinh phí và quyền lợi chi tiết.
  3. Theo dõi bàn giao quyền lợi thương hiệu: Logo banner sân khấu, vị trí trên poster, vé VIP, chiếu video doanh nghiệp, gian hàng B2B ưu tiên.
  4. Lưu trữ hợp đồng tài trợ và xuất phiếu thu tương ứng.
- **API Endpoints Backend**:
```http
GET /sponsors
POST /sponsors
PUT /sponsors/:id
DELETE /sponsors/:id
GET /sponsors/packages
```
- **Bảng CSDL PostgreSQL**:
```sql
public.sponsors (sponsor_name, logo_url, tier, contract_url, status)
public.sponsor_packages (code, name, tier, default_amount, benefits_json)
public.events (title)
```
- **Ràng buộc & Ghi chú**: Đồng bộ hiển thị logo nhà tài trợ lên poster sự kiện và sàn B2B.

---

### 18. [NODE-CRM-014] Kho Tài Liệu CLB & Universal Document Viewer
- **Đối tượng sử dụng**: Ban Thư Ký, Toàn thể Hội viên
- **Luồng nghiệp vụ chi tiết**:
  1. Lưu trữ tài liệu số hóa: Điều lệ, Quy chế, Biên bản họp, Biểu mẫu gia nhập, Quyết định bổ nhiệm.
  2. Universal Document Viewer xem trực tiếp trên web:
     - File Word (.docx): Bản in A4 chuẩn xác.
     - File Excel (.xlsx, .xls): Bảng tính đa sheet SheetJS, lọc tìm kiếm ô.
     - File PDF: Nhúng tương tác phóng to/thu nhỏ, xoay trang, in ấn.
     - File Ảnh và Code: Trình xem độ phân giải cao.
  3. Phân quyền xem: Công khai toàn thể hội viên hoặc giới hạn nội bộ Ban Điều Hành.
- **API Endpoints Backend**:
```http
GET /documents
POST /documents
PUT /documents/:id
DELETE /documents/:id
GET /documents/:id/download
```
- **Bảng CSDL PostgreSQL**:
```sql
public.documents (title, category, file_url, file_size, file_type, access_level, uploader_id)
public.members (full_name)
```
- **Ràng buộc & Ghi chú**: Đọc mọi tài liệu văn phòng trực tiếp trên trình duyệt không cần tải về.

---

### 19. [NODE-CRM-015] Quản Trị Biểu Quyết Trực Tuyến & Quay Số May Mắn (Lucky Draw)
- **Đối tượng sử dụng**: Ban Tổ Chức, Ban Sự Kiện, Ban Thư Ký
- **Luồng nghiệp vụ chi tiết**:
  1. Quản trị Biểu quyết: Tạo câu hỏi biểu quyết/bầu cử, thời gian mở/đóng, hình thức đơn chọn/đa chọn.
  2. Vòng quay số may mắn (Lucky Draw): Nạp giải thưởng thực tế từ CSDL nhà tài trợ (Kim Cương, Vàng, Bạc, Đồng).
  3. Tải danh sách người đã check-in thực tế tại sự kiện.
  4. Vòng quay số ngẫu nhiên, tự động loại trừ người đã trúng thưởng trước đó.
  5. Khi có người trúng giải, tự động trừ số lượng giải trong CSDL và gửi email/thông báo chúc mừng.
- **API Endpoints Backend**:
```http
GET /polls
POST /polls
PUT /polls/:id
DELETE /polls/:id
GET /admin/lucky-draw-config
POST /admin/lucky-draw/spin
PUT /sponsors/prizes/:id
```
- **Bảng CSDL PostgreSQL**:
```sql
public.polls (title, description, start_time, end_time, is_active)
public.poll_options (option_text, vote_count)
public.poll_votes (member_id, voted_at)
public.sponsors_prizes (prize_name, quantity, remaining_quantity, winner_id)
```
- **Ràng buộc & Ghi chú**: Tự động loại trừ người trúng giải trùng lặp và cập nhật số lượng giải thưởng realtime.

---

### 20. [NODE-CRM-016] Quản Lý Bản Tin & Truyền Thông CLB
- **Đối tượng sử dụng**: Ban Truyền Thông, Ban Thư Ký
- **Luồng nghiệp vụ chi tiết**:
  1. Soạn thảo bài viết tin tức, hoạt động CLB qua trình soạn thảo Rich-Text.
  2. Đính kèm hình ảnh tiêu biểu, video phóng sự.
  3. Thiết lập chế độ: Bản nháp hoặc Xuất bản chính thức.
  4. Khi xuất bản, hệ thống tự động đồng bộ bài viết sang Bảng tin Mạng lưới App Mobile.
  5. Cơ chế Seed on Read bảo đảm dữ liệu tin tức luôn đầy đủ.
- **API Endpoints Backend**:
```http
GET /news
POST /news
PUT /news/:id
DELETE /news/:id
POST /news/:id/publish
```
- **Bảng CSDL PostgreSQL**:
```sql
public.news (title, slug, summary, content, thumbnail_url, status='DRAFT'|'PUBLISHED', published_at)
public.feed_posts (type='NEWS', title, content, thumbnail_url)
```
- **Ràng buộc & Ghi chú**: Tự động tạo bài viết trên mạng xã hội nội bộ khi xuất bản tin tức.

---

### 21. [NODE-CRM-017] Gia Hạn Hội Viên & Xử Lý Nợ Phí Niên Liễm
- **Đối tượng sử dụng**: Ban Hội Viên, Ban Tài Chính, Ban Thư Ký
- **Luồng nghiệp vụ chi tiết**:
  1. Quản lý danh sách hội viên theo chu kỳ niên liễm hàng năm (1 năm / 2 năm).
  2. Phân loại tự động 3 nhóm: Sắp hết hạn trong 30 ngày, Quá hạn nợ phí, Đã gia hạn.
  3. Bấm gửi thông báo gia hạn: Tự động dispatch Email và tin nhắn Zalo OA ZNS kèm mã VietQR nộp phí.
  4. Sau khi nộp phí thành công, kế toán xác nhận, hệ thống cộng thêm 365 ngày vào hạn dùng và kích hoạt lại quyền lợi VIP.
- **API Endpoints Backend**:
```http
GET /members/renewals
POST /members/:id/send-renewal-notice
POST /members/:id/renew
```
- **Bảng CSDL PostgreSQL**:
```sql
public.members (dues_expired_at, status)
public.income_records (category='MEMBERSHIP_DUES', amount, status)
public.vione_users (status)
```
- **Ràng buộc & Ghi chú**: Khử prefix mã gia hạn, truy vấn linh hoạt tránh lỗi ép kiểu UUID.

---

### 22. [NODE-CRM-018] Quản Trị Đào Tạo Đa Thức & Bắn Mạng Lưới Khóa Học
- **Đối tượng sử dụng**: Ban Đào Tạo, Ban Điều Hành, Giảng viên
- **Luồng nghiệp vụ chi tiết**:
  1. Tạo khóa đào tạo doanh nghiệp: Tên khóa học, Giảng viên, Hình thức (Online, Offline, Hybrid), Lịch học, Giáo trình.
  2. Cấu hình phòng học trực tuyến Video Call (Jitsi Meet/Zoom nhúng).
  3. Quản lý danh sách học viên đăng ký.
  4. Tải poster khóa học và đính kèm tối đa 5 ảnh/video tư liệu.
  5. Nút 'Bắn Mạng Lưới': Tự động phát bài giới thiệu khóa học lên Bảng tin Mạng lưới App Mobile kèm link đăng ký.
- **API Endpoints Backend**:
```http
GET /trainings
POST /trainings
PUT /trainings/:id
DELETE /trainings/:id
GET /trainings/:id/attendees
POST /feed/broadcast-training
POST /trainings/:id/media
```
- **Bảng CSDL PostgreSQL**:
```sql
public.trainings (title, instructor_name, format, start_time, room_url, syllabus_url, max_students)
public.training_attendees (member_id, status)
public.feed_posts (type='TRAINING', link_url, media_urls)
```
- **Ràng buộc & Ghi chú**: Tích hợp phòng học trực tuyến và kết nối trực tiếp với mạng xã hội hội viên.

---

### 23. [NODE-CRM-019] Nhật Ký Lịch Sử Thao Tác Toàn Hệ Thống (Audit Logs)
- **Đối tượng sử dụng**: Chủ tịch CLB, Ban Kiểm Tra, Super Admin
- **Luồng nghiệp vụ chi tiết**:
  1. Tự động ghi lại toàn bộ thao tác nhạy cảm: Đăng nhập, Đổi mật khẩu, Thêm/Sửa/Xóa user, Phê duyệt chi quỹ, Gán quyền RBAC, Phát hành thông báo.
  2. Mỗi bản ghi lưu: User ID, Tên, Hành động, Module, Địa chỉ IP, Trình duyệt, Thời gian.
  3. Tìm kiếm, lọc theo ngày tháng, người thao tác.
  4. Xuất file Excel nhật ký thao tác phục vụ kiểm toán.
- **API Endpoints Backend**:
```http
GET /admin/audit-logs
GET /admin/audit-logs/export-excel
```
- **Bảng CSDL PostgreSQL**:
```sql
public.audit_logs (user_id, user_email, action, module, details_json, ip_address, user_agent, created_at)
public.members (full_name)
```
- **Ràng buộc & Ghi chú**: Nhật ký bất biến bảo đảm an ninh và kiểm toán hệ thống.

---

### 24. [NODE-CRM-020] Trao Cơ Hội Giao Thương Đa Đối Tượng & Hội Nhóm
- **Đối tượng sử dụng**: Ban B2B, Ban Điều Hành, Hội viên Doanh nhân
- **Luồng nghiệp vụ chi tiết**:
  1. Tạo cơ hội kinh doanh / gói thầu lớn cần liên danh hợp tác.
  2. Chọn trao cho nhiều người cùng lúc (Multi-select) hoặc trao cho toàn thể một Ban chuyên môn.
  3. Tạo các liên kết độc lập và gửi thông báo tới từng hội viên nhận.
  4. Theo dõi tiến độ kết nối và giá trị giao dịch phát sinh.
- **API Endpoints Backend**:
```http
POST /opportunities/batch-share
GET /opportunities/recipients-pool
```
- **Bảng CSDL PostgreSQL**:
```sql
public.opportunities (giver_id, title, description, value_amount, status)
public.opportunity_shares (opportunity_id, receiver_id, status)
public.members (full_name, department)
```
- **Ràng buộc & Ghi chú**: Mở rộng kết nối kinh doanh quy mô lớn cho các gói thầu liên ngành.

---

### 25. [NODE-CRM-021] Theme Studio, Icon Picker 14 Tính Năng & Đồng Bộ Giao Diện
- **Đối tượng sử dụng**: Chủ tịch CLB, Ban Truyền Thông, Quản trị viên
- **Luồng nghiệp vụ chi tiết**:
  1. Theme Studio với 5 VIP Presets: Hoàng Gia, Dạ Hội, Thép Titan, Sen Vàng, Mùa Lễ Hội.
  2. Bộ chọn Icon Picker linh hoạt cho 14 tính năng chính.
  3. Khung hình Live Preview Mobile Frame mô phỏng giao diện thực tế.
  4. Khi kích hoạt chủ đề (ví dụ Mùa Lễ Hội), hệ thống lập tức đồng bộ biến CSS (--festival-bg-image) thời gian thực xuống toàn bộ Web CRM và App Mobile.
- **API Endpoints Backend**:
```http
GET /admin/landing-templates
POST /admin/landing-templates
POST /admin/themes/active
```
- **Bảng CSDL PostgreSQL**:
```sql
public.landing_templates (name, theme_key, festival_bg_url, is_active)
public.system_settings (key='active_theme_config', value_json)
```
- **Ràng buộc & Ghi chú**: Đồng bộ giao diện thời gian thực trên cả hai nền tảng Web CRM và Mobile App.

---

### 26. [NODE-CRM-022] Trung Tâm Thông Báo Quản Trị Hệ Thống (Admin Notification Center)
- **Đối tượng sử dụng**: Chủ tịch, Ban Thư Ký, Quản trị viên
- **Luồng nghiệp vụ chi tiết**:
  1. Tự động quét cảnh báo quản trị: Hồ sơ hội viên mới chờ duyệt, Hội viên quá hạn hội phí, Yêu cầu quên mật khẩu cần cấp lại, Báo cáo sự cố.
  2. 4 thẻ KPI Gradient và các Tab bộ lọc trạng thái.
  3. Bảng CustomTable sắp xếp theo mức độ ưu tiên và thời gian.
  4. Bấm trực tiếp vào thông báo để chuyển hướng đến tác vụ xử lý.
- **API Endpoints Backend**:
```http
GET /admin/notifications
POST /admin/notifications
PATCH /admin/notifications/:id
DELETE /admin/notifications/:id
```
- **Bảng CSDL PostgreSQL**:
```sql
public.notifications (user_id, title, content, type, is_read, action_url, created_at)
public.members (full_name)
```
- **Ràng buộc & Ghi chú**: Tích hợp huy hiệu số đếm thông báo chưa đọc trên Sidebar.

---

### 27. [NODE-CRM-023] Quản Lý Landing Web Dynamic & Cấu Hình Subdomain
- **Đối tượng sử dụng**: Ban Truyền Thông, Quản trị viên Kỹ thuật
- **Luồng nghiệp vụ chi tiết**:
  1. Quản trị trang đích giới thiệu CLB tái hiện 2 mẫu Pinterest:
     - Mẫu 1 (Timed Cards Opening): Slide chuyển tự động bằng con lăn/cảm ứng, tiến trình 5s, split typography.
     - Mẫu 2 (Startup Mobile Showcase): Mockup iPhone 16 Pro mô phỏng giao diện app CEO 1983, dải ruy băng 4 chỉ số vàng (4+ năm, 1.983+ CEO, 500+ DN, 100+ Tỷ).
  2. Quản lý menu đa tầng (Dynamic Tree Header Menu) kích hoạt sub-screens.
  3. Gán tên miền phụ (*.ceo1983.viconnect.vn) và API Connector ánh xạ dữ liệu động từ CLB.
- **API Endpoints Backend**:
```http
GET /admin/landing-webs
POST /admin/landing-webs
PUT /admin/landing-webs/:id
DELETE /admin/landing-webs/:id
POST /admin/landing-webs/:id/apply-subdomain
GET /public/landing-webs/:slugOrSubdomain
```
- **Bảng CSDL PostgreSQL**:
```sql
public.app_settings (key='crm_landing_webs_configs', value_json)
```
- **Ràng buộc & Ghi chú**: Tạo nhiều trang đích sự kiện với subdomain riêng biệt.

---

### 28. [NODE-CRM-024] Quản Lý Mẫu Thư Mời Đa Kênh & Trình Tạo Thư Nhắc Nhở Tùy Biến
- **Đối tượng sử dụng**: Ban Thư Ký, Ban Truyền Thông, Quản trị viên
- **Luồng nghiệp vụ chi tiết**:
  1. Quản lý mẫu thông báo đa kênh: Gửi Email HTML v3, Thông báo đẩy App CEO 1983, Tin nhắn Zalo OA ZNS (bỏ VNPay, Zalo Mini App, ZBS).
  2. Trình thiết lập mẫu thư nhắc nhở động (CustomReminderTemplateModal): Tạo mẫu 'Hôm nay trong app CEO 1983 có gì', tự do thêm/bớt trường thông tin động:
     - Textarea: Cho mô tả dài.
     - Datetime: Cho ngày giờ diễn ra.
     - Price: Cho chi phí, giá vé, hội phí.
     - Mã QR: Cho mã QR điểm danh hoặc chuyển khoản.
     - Text: Cho văn bản ngắn.
  3. Hỗ trợ nhập SĐT thử nghiệm bằng icon (+) và lựa chọn dữ liệu sự kiện/cuộc họp/hội viên real data từ CSDL để phát thanh.
- **API Endpoints Backend**:
```http
GET /admin/mail-templates
PUT /admin/mail-templates/:key
POST /zalo/send-zns
GET /zalo/template-configs
PUT /zalo/template-configs/:templateCode
POST /notifications/broadcast-custom
```
- **Bảng CSDL PostgreSQL**:
```sql
public.mail_templates (key, title, subject, content_html)
public.app_settings (key='crm_invitation_templates' | 'zalo_oa_config')
public.notifications (type, content)
```
- **Ràng buộc & Ghi chú**: Linh hoạt tùy biến trường dữ liệu nhắc nhở và kiểm thử gửi tức thời.

---

