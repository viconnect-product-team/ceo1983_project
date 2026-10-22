# MỤC 2: ĐẶC TẢ KỸ THUẬT & LUỒNG XỬ LÝ PHÂN HỆ WEB CRM QUẢN TRỊ
*Tài liệu nguồn chuẩn hóa tải lên Google NotebookLM (Sổ tay: https://notebook.google.com/notebook/6ea9dec4-b8c1-4b4b-a077-d874b625bafd)*
*Phân hệ: Web CRM Quản trị Điều hành (Desktop Browser / Ban Điều Hành / Admin)*

---

## 1. TỔNG QUAN PHÂN HỆ WEB CRM QUẢN TRỊ
- **Tên phân hệ**: Cổng Thông Tin Điều Hành & Quản Trị CLB Doanh Nhân CEO 1983 (`@ceo1983/app_fe` - chế độ CRM).
- **Đối tượng sử dụng**: Chủ tịch Hiệp hội, Ban Điều Hành, Trưởng 6 Ban Chuyên Môn, Ban Thư Ký, Kế toán và Quản trị viên (Admin).
- **Khung giao diện (Layout)**: `DashboardLayout.tsx` với **Sidebar cố định bên trái**, Header chứa thanh tìm kiếm, chuông báo động thời gian thực (`NotificationCenter`) và menu tài khoản.
- **Tiêu chuẩn giao diện**:
  - Bảng dữ liệu hỗ trợ kéo rê co dãn độ rộng cột kiểu Excel (`useResizableColumns`, `ResizableTh`).
  - Văn bản dài tự động rút gọn và hiển thị Tooltip Ant Design (nền đen `#1f1f1f`, chữ trắng, animate zoom).
  - Biểu đồ phân tích tài chính và hoạt động Recharts đa dạng (ComposedChart, PieChart, Treemap, Donut, Candlestick Chart).
  - Tích hợp tính năng Xuất file Excel và Nhập dữ liệu từ file Excel/CSV.
  - **Quy chuẩn màu sắc nút bấm (Strict UI Rules)**: Tuyệt đối không dùng nút màu đỏ trên toàn bộ hệ thống. Nút chính dùng Navy `#1F3864`, nút điểm nhấn/kêu gọi hành động dùng Amber Gold `#B8860B`, nút thành công dùng Emerald `bg-emerald-600`, nút phụ/hủy dùng Slate `bg-slate-100 / bg-slate-800`.

---

## 2. ĐẶC TẢ CHI TIẾT THEO TỪNG NODE CHỨC NĂNG

### `[NODE-CRM-001]` Tổng Quan & Dashboard CLB
- **Route Frontend**: `/` hoặc `/dashboard` (`src/routes/index.tsx`).
- **Thành phần**: `OverviewCards.tsx`, `EventCalendarView.tsx`, `RecentActivitiesWidget.tsx`.
- **API Backend**: `GET /admin/dashboard-stats`, `GET /admin/recent-activities` (`dashboard.service.ts`).
- **Bảng CSDL**: `members`, `events`, `meetings`, `income_records`, `expense_records`.
- **Luồng xử lý**:
  - Hiển thị 4 thẻ KPI chỉ số: Tổng hội viên chính thức, Số sự kiện/cuộc họp trong tháng, Dòng tiền thặng dư quỹ, Tỷ lệ hội viên đóng phí niên liễm.
  - Lịch sự kiện & cuộc họp toàn CLB trực quan theo tháng.
  - Cảnh báo nhanh các trường hợp sắp đến hạn đóng phí hoặc nợ hội phí.

### `[NODE-CRM-002]` Trung Tâm Thống Kê Chuyên Sâu 5 Chế Độ & Biểu Đồ Nến Candlestick
- **Route Frontend**: `/analytics` (`src/routes/analytics.tsx`).
- **Menu Sidebar**: `Sidebar.tsx` (Menu "Thống kê CLB", Icon `BarChart3` nằm ngay dưới mục Tổng quan).
- **API Backend**: `GET /admin/analytics-summary`, `GET /admin/analytics/industry-breakdown`, `GET /analytics/overview` (`analytics.service.ts`, `opportunity.service.ts`).
- **Bảng CSDL**: `members`, `opportunities`, `departments`, `events`.
- **Luồng xử lý**:
  - Tích hợp **Biểu đồ nến Candlestick thời gian thực**: Mô phỏng biến động giao dịch B2B theo từng khung giờ trong ngày (Open, High, Low, Close, Volume) như bảng giá chứng khoán chuyên nghiệp.
  - Cung cấp thanh chuyển đổi 5 chế độ hiển thị chuyên sâu:
    1. **Dạng Lưới KPI**: Thẻ số liệu lớn kèm % so sánh tăng trưởng.
    2. **Dashboard Tổng Quan**: Biểu đồ kết hợp cột - đường toàn diện hoạt động.
    3. **Biểu Đồ Cây Phân Bố Ngành Nghề (Treemap)**: Tỷ trọng 10 ngành nghề thành viên.
    4. **Biểu Đồ Tròn Ban Ngành (Donut Chart)**: Cơ cấu phân bổ nhân sự theo 6 ban.
    5. **Cây Đơn Vị Cơ Cấu Tổ Chức (Org Tree)**: Sơ đồ phả hệ từ Chủ tịch -> BĐH -> 6 Ban -> Hội viên.
  - Nút Xuất file Excel và Nhập file Excel số liệu thống kê.

### `[NODE-CRM-003]` Quản Trị Danh Bạ Hội Viên 360°
- **Route Frontend**: `/members` (`src/routes/members.tsx`).
- **Thành phần**: `MemberTable.tsx`, `MemberEditModal.tsx`, `DeleteMemberConfirmModal.tsx`.
- **API Backend**: `GET /members`, `POST /members`, `PUT /members/:id`, `DELETE /members/:id` (`members.service.ts`).
- **Bảng CSDL**: `members`, `companies`, `vione_users`.
- **Luồng xử lý**:
  - Modal chỉnh sửa hội viên CHỈ HIỂN THỊ VÀ SỬA các trường thông tin cá nhân (Họ tên, SĐT, Email, Chức vụ liên hệ, Hạng, Vùng, Trạng thái, Địa chỉ, Giới thiệu).
  - Modal xóa hội viên cung cấp 2 lựa chọn rõ ràng:
    1. "Xóa doanh nghiệp trước" (`company_only`): Chỉ unbind công ty.
    2. "Xóa cả hội viên và doanh nghiệp" (`all`): Xóa cascade hội viên, công ty, thẻ số và user đăng nhập.
  - Luôn tích hợp fallback `DEFAULT_MEMBERS` để bảo đảm giao diện không bị trống.

### `[NODE-CRM-004]` Quản Trị Doanh Nghiệp Thành Viên
- **Route Frontend**: `/companies` (`src/routes/companies.tsx`).
- **Thành phần**: `CompanyTable.tsx`, `CompanyEditModal.tsx`.
- **API Backend**: `GET /companies`, `PUT /companies/:id` (`members.service.ts`).
- **Bảng CSDL**: `companies`, `members`.
- **Luồng xử lý**:
  - Modal chỉnh sửa doanh nghiệp CHỈ HIỂN THỊ VÀ SỬA các trường doanh nghiệp (Tên doanh nghiệp, MST, Ngành nghề, Quy mô, Website, Địa chỉ, Hội phí).
  - Cột 3 của bảng doanh nghiệp BẮT BUỘC hiển thị Tên doanh nghiệp.

### `[NODE-CRM-005]` Quản Lý Tài Khoản & Gán Ban Chuyên Môn
- **Route Frontend**: `/accounts` (`src/routes/accounts.tsx`).
- **Thành phần**: `AccountTable.tsx`, `AccountRoleDeptModal.tsx`.
- **API Backend**: `GET /accounts`, `PATCH /members/:id/role-dept` (`members.service.ts`).
- **Bảng CSDL**: `members` (`executive_role`, `department`), `vione_users`, `user_roles`.
- **Luồng xử lý**:
  - Gán vai trò (`executive_role`) và ban chuyên môn (`department`) BẮT BUỘC gọi API `PATCH /members/:id/role-dept` lưu ngay vào PostgreSQL, tuyệt đối không chỉ lưu `localStorage`.
  - Cơ chế Database-First: Khi reload (`F5`), nạp dữ liệu từ backend ghi đè danh sách, không làm mất vai trò mới lưu.
  - Bộ chọn Ban Điều Hành thiết lập đủ 5 vai trò (Quản trị `quan_tri`, Chủ tịch `chu_tich`, Trưởng ban điều hành `truong_ban_dieu_hanh`, Admin `admin`, Thành viên ban điều hành `thanh_vien_ban_dieu_hanh`), hiển thị ngay click đầu tiên.
  - Không hardcode quyền admin theo email; vai trò thực tế từ CSDL luôn có độ ưu tiên cao nhất.

### `[NODE-CRM-006]` Ma Trận Phân Quyền RBAC 2 Tab Độc Lập
- **Route Frontend**: `/permissions` (`src/routes/permissions.tsx`).
- **Thành phần**: `RbacPermissionMatrix.tsx`.
- **API Backend**: `GET /admin/roles`, `POST /admin/roles/permissions` (`roles.service.ts`).
- **Bảng CSDL**: `roles`, `permissions`, `role_permissions`.
- **Luồng xử lý**:
  - Tách thành 2 Tab riêng biệt rõ ràng:
    - Tab 1: **"Phân Quyền CRM Web"** (Quản lý quyền trên hệ thống máy tính để bàn).
    - Tab 2: **"Phân Quyền App Mobile CEO 1983"** (Quản lý 10 quyền ứng dụng di động).
  - Hỗ trợ đầy đủ 6 vai trò thành viên ban chuyên môn (`thanh_vien_ban_*`).

### `[NODE-CRM-007]` Quản Trị Sự Kiện, Vé Check-in & Lucky Draw
- **Route Frontend**: `/events` (`src/routes/events.tsx`).
- **Thành phần**: `EventPosterModal.tsx`, `LuckyDrawConfig.tsx`, `EventTable.tsx`.
- **API Backend**: `GET /events`, `POST /events`, `PUT /events/:id` (`events.service.ts`).
- **Bảng CSDL**: `events`, `event_registrations`, `sponsors_prizes`.
- **Luồng xử lý**:
  - Hỗ trợ poster sự kiện tùy biến tải ảnh nền, hiển thị chính xác khung giờ (`startTime - endTime`), lịch trình Agenda theo giờ chi tiết ("giờ này làm gì, giờ sau làm gì").
  - Đếm realtime số người đăng ký/hủy thực tế.
  - Chân trang Poster in sẵn mã QR Điểm Danh (`checkin_qr`) để lễ tân quét soát vé nhanh tại cổng.

### `[NODE-CRM-008]` Quản Lý Cuộc Họp Ban & Gặp Gỡ CLB
- **Route Frontend**: `/meetings` (`src/routes/meetings.tsx`).
- **Thành phần**: `MeetingFormModal.tsx`, `InteractiveMapPicker.tsx`.
- **API Backend**: `GET /meetings`, `POST /meetings`, `PUT /meetings/:id` (`meetings.service.ts`).
- **Bảng CSDL**: `meetings`, `feed_posts`.
- **Luồng xử lý**:
  - Chọn địa điểm họp tích hợp bản đồ tương tác với điểm ghim đỏ có thể kéo thả (`draggable pin`), tự động tìm kiếm và đảo ngược địa chỉ OpenStreetMap Nominatim.
  - Cuộc họp tạo mới tự động đồng bộ sang danh sách Sự kiện App Mobile với nhãn `[Họp Ban]` và tự động đẩy bài viết thông báo lên Bảng tin Social (`EVENT_MEETING`).

### `[NODE-CRM-009]` Quản Lý Thu Ngân Sách, Phí & Vé
- **Route Frontend**: `/income` (`src/routes/income.tsx`).
- **Thành phần**: `FinanceChartsSection.tsx`, `FinanceExcelImportModal.tsx`, `IncomeTable.tsx`.
- **API Backend**: `GET /finance/income`, `POST /finance/income`, `POST /finance/income/import-excel` (`finance.service.ts`).
- **Bảng CSDL**: `income_records`, `members`, `events`.
- **Luồng xử lý**:
  - Bảng co dãn cột kéo chuột như Excel (`table-fixed`), văn bản dài rút gọn bọc tooltip Ant Design.
  - Biểu đồ Recharts hỗn hợp dòng tiền, biểu đồ tròn nguồn thu (phí hội viên, vé sự kiện, tài trợ).
  - Xuất Excel và Nhập Excel từ file mẫu có kiểm tra tính hợp lệ.

### `[NODE-CRM-010]` Quản Lý Chi Ngân Sách, Tạm Ứng & Hoàn Ứng
- **Route Frontend**: `/expenses` (`src/routes/expenses.tsx`).
- **Thành phần**: `FinanceChartsSection.tsx`, `ExpenseModal.tsx`, `ExpenseTable.tsx`.
- **API Backend**: `GET /finance/expenses`, `POST /finance/expenses`, `POST /finance/expenses/import-excel` (`finance.service.ts`).
- **Bảng CSDL**: `expense_records`, `members`.
- **Luồng xử lý**:
  - Quản lý các phiếu chi thực tế, phiếu tạm ứng công việc, hoàn ứng tiền thừa.
  - Biểu đồ tròn cơ cấu chi phí thực tế theo các hạng mục vận hành.

### `[NODE-CRM-011]` Báo Cáo Tài Chính Tổng Hợp & Quyết Toán
- **Route Frontend**: `/finance-report` (`src/routes/finance-report.tsx`).
- **Thành phần**: `FinanceChartsSection.tsx`.
- **API Backend**: `GET /finance/summary-report` (`finance.service.ts`).
- **Bảng CSDL**: `income_records`, `expense_records`.
- **Luồng xử lý**:
  - Báo cáo tài chính chuyên sâu với biểu đồ ComposedChart thể hiện Dòng tiền Thu - Chi - Thặng Dư tích lũy.
  - Lưới phân tích 4 hạng tài trợ: Diamond, Gold, Silver, Bronze.

### `[NODE-CRM-012]` Giao Việc Ban Chuyên Môn & Xem File Đính Kèm
- **Route Frontend**: `/tasks` (`src/routes/tasks.tsx`).
- **Thành phần**: `TaskFormModal.tsx`, `ExcelViewerModal.tsx`.
- **API Backend**: `GET /tasks`, `POST /tasks`, `PUT /tasks/:id` (`tasks.service.ts`).
- **Bảng CSDL**: `tasks`, `task_assignees`, `task_attachments`.
- **Luồng xử lý**:
  - Tiêu đề thông báo giao việc BẮT BUỘC nêu rõ người giao: `📋 [Giao việc từ ${creatorDisplayName}] ${task.title}`.
  - Từng file đính kèm có nút "Xem file" (icon `Eye`), hỗ trợ xem bảng tính Excel bằng `ExcelViewerModal`, xem ảnh trong lightbox, và xem PDF.

### `[NODE-CRM-013]` Quản Trị Nhà Tài Trợ & Quyền Lợi
- **Route Frontend**: `/sponsors` (`src/routes/sponsors.tsx`).
- **Thành phần**: `SponsorTable.tsx`, `SponsorPackageModal.tsx`.
- **API Backend**: `GET /sponsors`, `POST /sponsors` (`sponsors.service.ts`).
- **Bảng CSDL**: `sponsors`, `sponsor_packages`.
- **Luồng xử lý**:
  - Quản lý các gói tài trợ: Kim Cương, Vàng, Bạc, Đồng.
  - Cấu hình banner nhà tài trợ xuất hiện trên Poster sự kiện và Sàn giao thương B2B di động.

### `[NODE-CRM-014]` Kho Tài Liệu CLB & Mẫu Email
- **Route Frontend**: `/documents` (`src/routes/documents.tsx`).
- **Thành phần**: `MailTemplateManager.tsx`.
- **API Backend**: `GET /documents`, `GET /admin/mail-templates` (`documents.service.ts`, `mail.service.ts`).
- **Bảng CSDL**: `documents`, `mail_templates`.
- **Luồng xử lý**:
  - Trình soạn thảo mẫu email v3 bền vững, thay thế các biến raw thành thẻ thân thiện `[Mã hội viên]`, `[Tên hội viên]`.
  - Email có mã QR thanh toán hoặc vé QR BẮT BUỘC đính kèm MIME Inline CID (`cid:vietqr_payment_qr`) để không bị Google Image Proxy chặn.

### `[NODE-CRM-015]` Quản Trị Biểu Quyết & Quay Số May Mắn
- **Route Frontend**: `/voting` (`src/routes/voting.tsx`).
- **Thành phần**: `PollManager.tsx`, `LuckyDrawWheel.tsx`.
- **API Backend**: `GET /polls`, `GET /admin/lucky-draw-config`, `PUT /sponsors/prizes/:id` (`voting.service.ts`, `sponsors.service.ts`).
- **Bảng CSDL**: `polls`, `poll_options`, `sponsors_prizes`.
- **Luồng xử lý**:
  - Vòng quay may mắn nạp động danh sách giải thưởng từ API.
  - Ngay khi quay trúng thưởng, loại trừ người trúng khỏi các lượt quay tiếp theo.
  - Trừ số lượng giải thưởng (`quantity - 1`), hết giải thì chuyển trạng thái `won`, đồng bộ xuống CSDL và dispatch email chúc mừng.

### `[NODE-CRM-016]` Quản Lý Bản Tin & Truyền Thông CLB
- **Route Frontend**: `/news-admin` (`src/routes/news-admin.tsx`).
- **Thành phần**: `NewsEditorModal.tsx`.
- **API Backend**: `GET /news`, `POST /news`, `PUT /news/:id` (`feed.service.ts`, `news.service.ts`).
- **Bảng CSDL**: `news`, `feed_posts`.
- **Luồng xử lý**:
  - Biên tập và phát hành tin tức điều hành, hoạt động CLB. Tự động đồng bộ sang Bảng tin của App Mobile.
  - Cơ chế Seed on Read tự động nạp bài viết chuẩn khi bảng CSDL trống.

### `[NODE-CRM-017]` Gia Hạn Hội Viên & Xử Lý Nợ Phí
- **Route Frontend**: `/renewal` (`src/routes/renewal.tsx`).
- **Thành phần**: `RenewalTable.tsx`.
- **API Backend**: `GET /members/renewals`, `POST /members/:id/send-renewal-notice` (`members.service.ts`).
- **Bảng CSDL**: `members`, `income_records`, `vione_users`.
- **Luồng xử lý**:
  - Khử prefix `RNW-`, truy vấn linh hoạt `WHERE id::text = ${cleanId} OR code = ${cleanId}` tránh lỗi ép kiểu UUID PostgreSQL.
  - LEFT JOIN tài khoản `vione_users` mới nhất và hiển thị thanh tiến độ gia hạn toàn màn hình.

### `[NODE-CRM-018]` Phân Hệ Đào Tạo Doanh Nhân & Phòng Họp Video Call
- **Route Frontend**: `/trainings` (`src/routes/trainings.tsx`).
- **Menu Sidebar**: `Sidebar.tsx` (Menu "Đào tạo & Video Call", Icon `GraduationCap`).
- **API Backend**: `GET /trainings`, `POST /trainings`, `PUT /trainings/:id`, `DELETE /trainings/:id` (`trainings.service.ts`).
- **Bảng CSDL**: `trainings`, `training_attendees`.
- **Luồng xử lý**:
  - Quản lý danh sách các khóa học đào tạo điều hành, nâng cao năng lực doanh nhân.
  - Thiết lập thông tin chuyên gia, học vị, ngày giờ phát sóng và tài liệu giáo trình đính kèm.
  - Tích hợp phòng họp trực tuyến Jitsi Meet trực tiếp trên giao diện quản trị với đầy đủ tính năng bật/tắt camera, micro, chia sẻ màn hình và điểm danh đại biểu.

### `[NODE-CRM-019]` Phân Hệ Nhật Ký Lịch Sử Thao Tác Toàn Hệ Thống (Audit Log)
- **Route Frontend**: `/activity-logs` (`src/routes/activity-logs.tsx`).
- **Menu Sidebar**: `Sidebar.tsx` (Menu "Nhật ký hệ thống", Icon `History`).
- **API Backend**: `GET /admin/audit-logs` (`admin.service.ts`).
- **Bảng CSDL**: `audit_logs`, `vba_recent_activities`.
- **Luồng xử lý**:
  - Ghi nhận và hiển thị toàn bộ hành động phát sinh trong hệ thống theo thời gian thực (Đăng nhập, Phân quyền RBAC, Giao việc, Duyệt chi ngân sách, Phê duyệt cơ hội, Điểm danh).
  - Bộ lọc chuyên sâu theo phân hệ tác động (Hội viên, Sự kiện, Cuộc họp, Thu chi, Tài khoản) và công cụ tìm kiếm từ khóa thông minh.
