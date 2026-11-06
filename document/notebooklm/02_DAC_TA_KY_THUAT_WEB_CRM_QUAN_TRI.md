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
- **Thành phần**: `OverviewCards.tsx`, `ExecutiveDashboard.tsx`, `EventCalendarView.tsx`, `RecentActivitiesWidget.tsx`.
- **API Backend**: `GET /admin/dashboard-stats`, `GET /admin/recent-activities` (`dashboard.service.ts`).
- **Bảng CSDL**: `members`, `events`, `meetings`, `income_records`, `expense_records`.
- **Luồng xử lý**:
  - Hiển thị 4 thẻ KPI chỉ số: Tổng hội viên chính thức, Số sự kiện/cuộc họp trong tháng, Dòng tiền thặng dư quỹ, Tỷ lệ hội viên đóng phí niên liễm.
  - Lịch sự kiện & cuộc họp toàn CLB trực quan theo tháng.
  - Cảnh báo nhanh các trường hợp sắp đến hạn đóng phí hoặc nợ hội phí.
  - **Quy chuẩn Thao Tác Nhanh (Strict Rules)**: **TUYỆT ĐỐI BỎ chức năng "Thêm mới hội viên"** tại màn hình Tổng quan Dashboard. Hội viên mới bắt buộc phải trải qua quy trình thẩm định, xét duyệt và cấp mã số chính thức tại phân hệ Danh Bạ Hội Viên (`/members`).
  - **Chuẩn Hóa Kiến Trúc Bảng Dữ Liệu `CustomTable` & 3 Dạng Sắp Xếp**:
    - Chuẩn hóa layout Dashboard tại các chức năng theo chuẩn Quản Lý Tài Khoản (`/accounts`): 4 thẻ Metric Gradient Figma (`CrmMetricCard`), thanh công cụ chuẩn hóa (`CrmToolbar`), và bảng `CustomTable<T>`.
    - **Cơ chế Sắp Xếp 3 Trạng Thái Bắt Buộc**: Mọi cột hỗ trợ sort đều có 3 trạng thái xoay vòng: `asc` (Tăng dần - icon `ChevronUp`) -> `desc` (Giảm dần - icon `ChevronDown`) -> `null` (Bỏ sắp xếp, quay về mặc định - icon `ChevronsUpDown`).
    - Hỗ trợ co dãn độ rộng cột kiểu Excel (`ResizableTh`), văn bản dài tự co rút gọn kèm Tooltip Ant Design nền tối, và thanh phân trang đồng nhất.

### `[NODE-CRM-002]` Trung Tâm Thống Kê Chuyên Sâu 5 Danh Mục, Biểu Đồ Cột Đường Đỉnh Top Avatar & Bục Top 3 Một Hàng
- **Route Frontend**: `/analytics` (`src/routes/analytics.tsx`).
- **Menu Sidebar**: `Sidebar.tsx` (Menu "Thống kê CLB", Icon `BarChart3` nằm ngay dưới mục Tổng quan).
- **API Backend**: `GET /admin/analytics-summary`, `GET /admin/analytics/industry-breakdown`, `GET /analytics/overview` (`analytics.service.ts`, `opportunity.service.ts`).
- **Bảng CSDL**: `members`, `opportunities`, `departments`, `events`, `feed_posts`.
- **Luồng xử lý**:
  - **4 ô Thẻ KPI cốt lõi trên đầu**: Tổng cơ hội kết nối, Tổng chi tiêu/Doanh số giao dịch, Lượt tương tác app, Sự kiện & Hoạt động đang diễn ra. Bỏ toàn bộ chi tiết thừa phía trên biểu đồ.
  - **Biểu đồ biến động Composed Bar + Line**: Tông 3 màu xanh - trắng - đen; đường Line xanh lá (`#10B981`) thể hiện xu hướng tăng, đường đỏ (`#EF4444`) thể hiện xu hướng giảm.
  - **Avatar Ghim Đỉnh Cột / Đường**: Tại đỉnh cao nhất của cột số liệu hoặc mốc cuối của đường, ghim **Avatar tròn viền vàng** vinh danh Doanh nhân Top 1.
  - **Bục Vinh Danh Top 3 Nằm Chung 1 Hàng**: Top 1 ở giữa cao nhất (Vương miện vàng), Top 2 bên trái (Huy hiệu Bạc), Top 3 bên phải (Huy hiệu Đồng).
  - **5 Danh Mục Nghiệp Vụ Rõ Ràng**: 1. Cơ hội, 2. Chi tiêu giao dịch, 3. Tần suất tương tác app, 4. Sự kiện hoạt động, 5. Hội viên tích cực nhất (Bình luận + Đăng cơ hội).
  - **Xuất Báo Cáo Chuẩn Hóa**: In ấn khổ giấy A4 tiêu chuẩn (`window.print`) và Xuất file Excel `.xlsx`.

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

### `[NODE-CRM-004]` Quản Trị Doanh Nghiệp Thành Viên & Quản Lý Đội Ngũ Nhân Sự
- **Route Frontend**: `/companies` (`src/routes/companies.index.tsx`), `/companies/$companyId` (`src/routes/companies.$companyId.tsx`).
- **Thành phần**: `CompanyTable.tsx`, `CompanyEditModal.tsx`, `PersonnelTab`, `AddPersonnelModal`.
- **API Backend**: `GET /companies`, `PUT /companies/:id`, `GET /members/:id/personnel`, `POST /members/:id/personnel` (`members.service.ts`, `members.controller.ts`).
- **Bảng CSDL**: `companies`, `members`, `company_members`.
- **Luồng xử lý**:
  - Modal chỉnh sửa doanh nghiệp CHỈ HIỂN THỊ VÀ SỬA các trường doanh nghiệp (Tên doanh nghiệp, MST, Ngành nghề, Quy mô, Website, Địa chỉ, Hội phí).
  - Cột 3 của bảng doanh nghiệp BẮT BUỘC hiển thị Tên doanh nghiệp.
  - **Quản lý Đội ngũ nhân sự trực thuộc**:
    + Màn chi tiết doanh nghiệp (`/companies/$companyId`) trang bị Tab "Đội ngũ nhân sự", hiển thị danh sách cán bộ, nhân sự trực thuộc từ `public.members`, `public.company_members`, và người đại diện pháp luật `public.companies`.
    + Cho phép thêm mới nhân sự nhanh chóng trực tiếp vào doanh nghiệp bằng Modal `AddPersonnelModal`.
    + Bảng danh sách doanh nghiệp hiển thị chính xác số lượng nhân sự/quy mô lao động.

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

### `[NODE-CRM-007]` Quản Trị Sự Kiện, Vé Check-in, Bắn Mạng Lưới & Lucky Draw
- **Route Frontend**: `/events` (`src/routes/events.tsx`).
- **Thành phần**: `EventPosterModal.tsx`, `LuckyDrawConfig.tsx`, `EventTable.tsx`.
- **API Backend**: `GET /events`, `POST /events`, `PUT /events/:id`, `POST /feed` (`events.service.ts`, `feed.service.ts`).
- **Bảng CSDL**: `events`, `event_registrations`, `sponsors_prizes`, `feed_posts`.
- **Luồng xử lý**:
  - Hỗ trợ poster sự kiện tùy biến tải ảnh nền, hiển thị chính xác khung giờ (`startTime - endTime`), lịch trình Agenda theo giờ chi tiết ("giờ này làm gì, giờ sau làm gì").
  - Đếm realtime số người đăng ký/hủy thực tế.
  - Chân trang Poster in sẵn mã QR Điểm Danh (`checkin_qr`) để lễ tân quét soát vé nhanh tại cổng.
  - **Tính Năng Bắn Mạng Lưới (Broadcast To Feed)**: Nút "Bắn Mạng Lưới" (Icon `Send`) phát hành trực tiếp thông tin sự kiện lên Bảng tin Mạng lưới App Mobile (`POST /feed`), tự động gắn kèm Poster sắc nét và Mã QR Điểm Danh.

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

### `[NODE-CRM-014]` Kho Tài Liệu CLB, Trình Xem Tài Liệu Toàn Năng (Universal Document Viewer) & Mẫu Email
- **Route Frontend**: `/documents` (`src/routes/documents.index.tsx`, `src/routes/documents.$docId.tsx`).
- **Thành phần**: `UniversalDocumentViewerModal.tsx`, `MailTemplateManager.tsx`.
- **API Backend**: `GET /documents`, `GET /documents/:id`, `GET /admin/mail-templates` (`documents.service.ts`, `mail.service.ts`).
- **Bảng CSDL**: `documents`, `mail_templates`.
- **Luồng xử lý**:
  - **Trình Xem Tài Liệu Toàn Năng (Universal Document Viewer)**: Khắc phục triệt để lỗi không mở xem được tài liệu tải lên, hỗ trợ tương tác trực tiếp tối thiểu 3 định dạng:
    + **Microsoft Word (`.docx`, `.doc`)**: Phân tích nội dung hiển thị chuẩn bố cục trang in A4 chính thức của CLB CEO 1983, kèm công tắc chuyển đổi sang Microsoft Office Online Viewer hoặc Google Docs Viewer.
    + **Microsoft Excel (`.xlsx`, `.xls`, `.csv`)**: Tích hợp SheetJS hiển thị bảng tính tương tác trực tiếp, hỗ trợ chuyển đổi linh hoạt giữa các Sheet, thanh tìm kiếm lọc dòng dữ liệu và thanh thống kê số dòng/cột.
    + **Tệp PDF (`.pdf`)**: Trình đọc nhúng PDF tương tác cao hỗ trợ thanh điều hướng trang, zoom in/out, in ấn và tải về máy tính.
    + **Tệp Ảnh & Mã Nguồn (`.png`, `.jpg`, `.jpeg`, `.txt`)**: Trình xem ảnh Lightbox xoay góc, phóng to thu nhỏ và bộ đọc văn bản có thanh cuộn mượt mà.
  - Tích hợp đồng bộ cả trong danh sách tài liệu (`documents.index.tsx`) và trang chi tiết tài liệu (`documents.$docId.tsx`).
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

### `[NODE-CRM-018]` Quản Trị Đào Tạo Doanh Nhân Chuẩn Hóa Khai Báo (Có Số Lượng & Hạng Vé, Tuyệt Đối Không Xếp Chỗ) & Bắn Xuống Feed App
- **Route Frontend**: `/trainings` (`src/routes/trainings.tsx`).
- **Menu Sidebar**: `Sidebar.tsx` (Menu "Đào tạo & Video Call", Icon `GraduationCap`).
- **Thành phần**: `TrainingFormModal.tsx`, `MeetingRoomModal.tsx`, `CustomTable.tsx`, `CrmMetricGrid`, `CrmToolbar`.
- **API Backend**: `GET /trainings`, `POST /trainings`, `PUT /trainings/:id`, `DELETE /trainings/:id`, `POST /feed` (`trainings.service.ts`, `feed.service.ts`).
- **Bảng CSDL**: `trainings` (mở rộng đầy đủ các trường: `tagline`, `instructor_name`, `instructor_title`, `instructor_company`, `format`, `location`, `address`, `room_id`, `room_url`, `meeting_passcode`, `max_attendees`, `ticket_tiers`, `materials`, `cover_image`, `registration_url`), `training_attendees`, `feed_posts`.
- **Luồng xử lý**:
  - **Refactor Toàn Diện Khai Báo Khóa Đào Tạo Như Sự Kiện Chuyên Nghiệp**:
    + Tiêu đề khóa học, Tagline/Thông điệp đào tạo, Thông tin Giảng viên / Chuyên gia (Họ tên, Học hàm/Học vị, Đơn vị/Tổ chức).
    + Thời gian bắt đầu - Thời gian kết thúc.
    + Hình thức tổ chức linh hoạt: Trực tiếp (`offline`), Trực tuyến (`online` qua Jitsi Meet với Room ID và Mật mã phòng), hoặc Kết hợp (`hybrid`).
    + **Khai Báo Số Lượng Học Viên & Sức Chứa (`max_attendees`)**: Thiết lập giới hạn học viên tham gia tối đa để kiểm soát chất lượng đào tạo và sức chứa phòng học.
    + **Khai Báo Các Hạng Vé Học Viên Kèm Số Lượng Vé Tối Đa (`ticket_tiers`)**: Cho phép khai báo nhiều hạng vé (VD: Hội viên chính thức [Miễn phí / 50 vé], Khách mời kết nối [Phí 500.000đ / 20 vé], VIP Mentor [10 vé]).
    + Tài liệu / Slide giáo trình đính kèm (`materials`) và Link ảnh bìa khóa học (`cover_image`).
    + **QUY TẮC BẮT BUỘC VỀ SƠ ĐỒ GHẾ**: **TUYỆT ĐỐI KHÔNG CÓ PHẦN XẾP CHỖ** (Không dùng sơ đồ ghế Cinema/Banquet như sự kiện lớn, vì đào tạo là phòng học mở / hội trường linh hoạt hoặc online).
  - **Biểu mẫu đăng ký mở & Mã QR động**: Tự động sinh link đăng ký công khai (`/guest-event-register/trn-...`) kèm QR Code sắc nét cho học viên quét ghi danh.
  - **Bắn Tin Đào Tạo Xuống Feed App Mobile (Broadcast to Feed)**: Bấm nút "Bắn Mạng Lưới" (Icon `Send`), hệ thống đẩy bài viết chuẩn hóa lên Bảng tin Mạng lưới App Mobile (`POST /feed`), hiển thị ảnh khóa học, thông tin giảng viên, link Jitsi / địa điểm và thẻ QR Code Check-in điểm danh tự động.
  - Tích hợp phòng đào tạo ảo Jitsi Meet trực tiếp trên giao diện quản trị với đầy đủ tính năng tương tác.

### `[NODE-CRM-020]` Cấu Hình Hệ Thống & Bắn Tin Zalo OA Call API CSDL Thực Tế
- **Route Frontend**: `/settings` (`src/routes/settings.tsx`).
- **Menu Sidebar**: `Sidebar.tsx` (Menu "Cấu hình hệ thống", Icon `Settings`).
- **Thành phần**: `ZaloOaConfigSection.tsx`, `SystemSettingsGeneral.tsx`, `SettingsThemeStudio.tsx`.
- **API Backend**: `GET /events`, `GET /business-connect/meetings`, `GET /trainings`, `GET /opportunities`, `POST /admin/zalo-oa/send-template`, `POST /admin/zalo-oa/test-broadcast` (`events.service.ts`, `meetings.service.ts`, `trainings.service.ts`, `opportunity.service.ts`, `admin.service.ts`).
- **Luồng xử lý**:
  - **Cân Đối Giao Diện Cấu Hình**: Tăng chiều rộng menu sidebar cấu hình lên 250px, rút gọn tiêu đề các tab dài (như "Cấu hình Zalo OA" thay vì tiêu đề dài gây tràn dòng), căn chỉnh icon `shrink-0` và text ngang hàng hoàn hảo với layout flex đồng đều.
  - **Bắn Tin Zalo OA Liên Kết API Dữ Liệu Thật**:
    + Tuyệt đối không dùng dữ liệu giả lập (mock data) hoặc bắt người dùng gõ tay thông tin đã có trong hệ thống.
    + Tích hợp bộ chọn Dropdown nạp dữ liệu động trực tiếp từ CSDL: Sự kiện CLB (`/events`), Cuộc họp Ban (`/business-connect/meetings`), Khóa đào tạo (`/trainings`), Cơ hội giao thương B2B (`/opportunities`).
    + Khi người dùng chọn một mục trong dropdown, hệ thống tự động điền các thông tin: Tiêu đề, Thời gian, Địa điểm/Link họp, Giảng viên/Chủ trì, và tự động tạo mã vé Check-in + sinh URL mã QR Check-in điện tử chính xác (`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=...`).
    + Hỗ trợ gửi tin nhắn qua Zalo OA với mã QR hiển thị dưới dạng đường link check-in điện tử chuẩn mực cho từng hội viên.

### `[NODE-CRM-019]` Phân Hệ Nhật Ký Lịch Sử Thao Tác Toàn Hệ Thống (Audit Log)
- **Route Frontend**: `/activity-logs` (`src/routes/activity-logs.tsx`).
- **Menu Sidebar**: `Sidebar.tsx` (Menu "Nhật ký hệ thống", Icon `History`).
- **API Backend**: `GET /admin/audit-logs` (`admin.service.ts`).
- **Bảng CSDL**: `audit_logs`, `vba_recent_activities`.
- **Luồng xử lý**:
  - Ghi nhận và hiển thị toàn bộ hành động phát sinh trong hệ thống theo thời gian thực (Đăng nhập, Phân quyền RBAC, Giao việc, Duyệt chi ngân sách, Phê duyệt cơ hội, Điểm danh).
  - Bộ lọc chuyên sâu theo phân hệ tác động (Hội viên, Sự kiện, Cuộc họp, Thu chi, Tài khoản) và công cụ tìm kiếm từ khóa thông minh.

### `[NODE-CRM-021]` Theme Studio Quản Lý Giao Diện, 5 VIP Presets & Đồng Bộ CSS Mùa Lễ Hội
- **Route Frontend**: `/admin/landing-templates` (`src/routes/admin.landing-templates.tsx`).
- **Menu Sidebar**: `Sidebar.tsx` (Menu "Quản lý giao diện / Theme Studio", Icon `Palette` / `LayoutTemplate`).
- **Thành phần**: `ThemeStudioEditor`, `IconPickerModal`, `LiveMobilePreviewMockup`.
- **API Backend**: `GET /admin/landing-templates`, `PUT /admin/landing-templates/active` (`content.service.ts`, `settings.service.ts`).
- **Bảng CSDL**: `system_settings`, `landing_templates`.
- **Luồng xử lý**:
  - **Tùy biến hình nền sự kiện**: Tải lên tệp ảnh hoặc nhập đường dẫn ảnh nền chất lượng cao.
  - **5 VIP Presets Mùa Lễ Hội**: Tết Nguyên Đán, Hội Nghị Thường Niên, Dạ Tiệc Gala, Caravan Giao Thương, Thể Thao & Golf.
  - **Bộ chọn biểu tượng 14 tính năng di động (Icon Picker)**: Tùy biến icon cho Trang chủ, Thẻ số, Danh bạ, Cơ hội, Thống kê, Gian hàng B2B, Sự kiện, Biểu quyết, Mạng lưới, Tin nhắn, Cá nhân, Cài đặt, Đặc quyền, Đào tạo.
  - **Live Mobile Preview**: Khung mô phỏng điện thoại thông minh hiển thị trực tiếp các thay đổi về giao diện theo thời gian thực.
  - **Phát hành đồng bộ toàn hệ thống**: Kích hoạt biến CSS toàn cục `--festival-bg-image` đồng bộ xuống cả Trang Chủ và Mạng Lưới Feed của Mobile App.

### `[NODE-CRM-022]` Trung Tâm Thông Báo Quản Trị Hệ Thống & Cảnh Báo Hội Phí / Hồ Sơ Mới
- **Route Frontend**: `/notifications` (`src/routes/notifications.tsx`).
- **Menu Sidebar**: `Sidebar.tsx` (Menu dạng Tree "Thông báo hệ thống", Icon `Bell`).
  - `🔔 Tất cả thông báo` (`/notifications`)
  - `👤 Hội viên mới nộp hồ sơ` (`/notifications?filter=new_members`)
  - `⚠️ Cảnh báo & Quá hạn hội phí` (`/notifications?filter=fee_alerts`)
  - `🏢 BQT & Điều hành` (`/notifications?filter=admin_system`)
  - `📅 Sự kiện & Cuộc họp` (`/notifications?filter=events_meetings`)
- **Thành phần**: `CustomTable.tsx`, `CrmMetricCard`, `CrmMetricGrid`, `CrmToolbar`, `CrudModal.tsx`.
- **API Backend**: `GET /admin/notifications`, `POST /admin/notifications`, `PATCH /admin/notifications/:id`, `DELETE /admin/notifications/:id`, `POST /admin/notifications/:id/push-messages` (`admin.service.ts`, `admin.controller.ts`).
- **Bảng CSDL**: `notifications`, `members`, `business_notifications`.
- **Luồng xử lý**:
  - **Backend Auto-Sync Alerts**: Cơ chế quét tự động đồng bộ hóa thông báo hệ thống khi quản trị viên truy cập:
    + Cảnh báo tức thì khi có hồ sơ đăng ký mới (`status = 'pending'`).
    + Cảnh báo hội viên quá hạn đóng phí niên liễm (`fee_paid = false` và ngày hết hạn < hiện tại).
    + Nhắc nhở cảnh báo hội viên sắp hết hạn hội phí niên liễm trong vòng 30 ngày.
    + Tự động dọn dẹp và ẩn cảnh báo khi hội viên đã được duyệt hoặc hoàn thành đóng phí.
  - **Chuẩn Hóa Giao Diện CustomTable**:
    + 4 Thẻ KPI Gradient Figma (`CrmMetricGrid`, `CrmMetricCard`).
    + Thanh Sub-filter Tabs phân nhánh đồng bộ 100% với menu Tree Sidebar.
    + Bảng dữ liệu chuẩn `CustomTable` với tính năng sắp xếp 3 trạng thái.
    + Phím tắt thao tác nhanh (Quick Action): Duyệt hồ sơ (`/members?status=pending`), Xử lý thu phí/gia hạn (`/renewal`), Xem sự kiện (`/events`), Đưa vào kênh tin nhắn Hiệp hội.
    + Cho phép chuyển đổi linh hoạt giữa giao diện Bảng (`table`) và giao diện Thẻ chi tiết (`cards`).

### `[NODE-CRM-023]` Quản Trị Landing Web Động & Mẫu Timed Cards Opening (Pinterest) Kèm Subdomain & API Connector
- **Route Frontend**: `/admin/landing-webs` (`src/routes/admin.landing-webs.tsx`), `/landing/$slug` (`src/routes/landing.$slug.tsx`).
- **Menu Sidebar**: `Sidebar.tsx` (Menu "Quản lý Landing Web", Icon `Globe`).
- **Thành phần**: `TimedCardsOpeningLanding.tsx`, `LandingWebModal`, `SubdomainModal`, `TreeMenuEditor`, `ApiConnectorEditor`, `SubScreensEditor`.
- **API Backend**: `GET /admin/landing-webs`, `POST /admin/landing-webs`, `PUT /admin/landing-webs/:id`, `DELETE /admin/landing-webs/:id`, `POST /admin/landing-webs/:id/apply-subdomain`, `POST /admin/landing-webs/test-api`, `GET /public/landing-webs/:slugOrSubdomain` (`landing.service.ts`, `landing.controller.ts`).
- **Bảng CSDL**: `landing_webs` (in-memory & PostgreSQL schema).
- **Luồng xử lý**:
  - **Tái hiện 100% video demo Timed Cards Opening (Pinterest - Giulio Cuscito)**:
    + Hiệu ứng chuyển động chạy slide toàn màn hình sắc nét với lớp phủ gradient tương phản.
    + Thanh chạy tiến trình 5s phía trên màn hình tự động chuyển slide tuần hoàn, tự động tạm dừng khi hover chuột.
    + Bố cục Typography kép cỡ lớn (72px Split Headline phong cách Oswald/Inter), nhãn huy hiệu địa danh/chủ đề, mô tả tóm tắt, nút Bookmark vàng Gold `#ecad29` và nút CTA "Khám phá địa danh" / "Liên hệ ngay".
    + Băng chuyền thẻ thu nhỏ góc dưới bên phải xếp chồng động preview các slide tiếp theo, click vào thẻ chuyển slide ngay tức thì.
    + Bảng điều khiển góc dưới bên trái: nút prev/next, thanh phân đoạn slide và bộ đếm tiến trình `01 / 06`.
  - **Khả năng tùy biến Dynamic toàn diện**:
    + Người dùng tự do thêm/sửa slide, tiêu đề, ảnh nền, huy hiệu và liên kết.
    + **Header Menu dạng cây phân cấp đa tầng (Hierarchical Tree Dropdown)**: Cho phép thêm menu cha, menu con cấp 1, cấp 2 với badge trạng thái và cơ chế kích hoạt màn con.
    + **Màn con (Sub-screens / Dynamic Modals) tự định nghĩa**: Khi click vào mục menu dạng tree, hệ thống kích hoạt màn con tương ứng (Bài viết chi tiết phong phú, Thư viện ảnh ấn tượng, hoặc Form liên hệ & thu thập thông tin hội viên tương tác cao).
    + **Trình kết nối API động (Dynamic API Connector)**: Người dùng có thể cấu hình endpoint lấy dữ liệu slide tự động từ hệ thống nội bộ (như `/api/opportunities`, `/api/products`, `/api/events`) hoặc từ bất kỳ REST API bên ngoài nào; tự do thiết lập Authentication Header, ánh xạ linh hoạt các trường (`titleField`, `imageField`, `tagField`, `linkField`, `descriptionField`) và kiểm tra kết nối Live (Test API Live) nhận kết quả trực tiếp ngay trên CRM.
    + **Gán & Kích Hoạt Subdomain Riêng Biệt**: Cho phép áp dụng cấu hình Landing Web vào từng tên miền con (subdomain, ví dụ: `gala2026.ceo1983.viconnect.vn`, `b2b.ceo1983.viconnect.vn`).



