# QUY CHUẨN NGHIỆP VỤ & KỸ THUẬT PHÂN HỆ WEB CRM QUẢN TRỊ (CRM RULES)
## CỔNG ĐIỀU HÀNH & QUẢN TRỊ CLB DOANH NHÂN CEO 1983 (HANOIBA)
*Áp dụng độc quyền cho: Desktop Web CRM Quản trị (Admin CMS, Ban Điều Hành, Ban Thư Ký)*

---

## 1. ĐỐI TƯỢNG VÀ BẢN CHẤT CỦA PHÂN HỆ WEB CRM
- **Đối tượng người dùng**: Chủ tịch Hiệp hội, Ban Điều Hành, Trưởng 6 Ban Chuyên Môn (Sự kiện, Xúc tiến, Hội viên, Truyền thông, Tài chính, Thiện nguyện), Ban Thư Ký, Kế toán và Quản trị viên (Admin).
- **Môi trường hiển thị**: Desktop Web Browser (Chrome, Edge, Safari, Firefox), màn hình rộng (Tablet landscape & PC/Laptop, tối ưu từ 1280px đến 1920px+).
- **Khung giao diện (Layout)**: `DashboardLayout` với **Sidebar cố định bên trái**, Header chứa thanh tìm kiếm toàn cục, chuông thông báo Realtime (`NotificationCenter`) và menu cá nhân góc trên bên phải.
- **TUYỆT ĐỐI KHÔNG NHẦM VỚI MOBILE APP**: Phân hệ CRM Quản trị không sử dụng `MemberShell`, không dùng Bottom Navigation Bar di động, không dùng thẻ danh thiếp xoay lật của hội viên.

---

## 2. QUY CHUẨN ĐỊNH TUYẾN & DANH MỤC TRÊN CRM (ROUTING & SIDEBAR)
Các route CRM tại `apps/ceo1983_app_fe/src/routes/` là các route phẳng cấp cao:
- **Tổng quan CLB**: `/` hoặc `/dashboard`
- **Thống kê CLB**: `/analytics` (Menu nằm dưới mục Tổng quan trên Sidebar, Icon `BarChart3`, nhãn "Thống kê CLB")
- **Quản lý Hội viên**: `/members` (Danh sách hội viên 360°, Hồ sơ pháp lý, Người đại diện)
- **Quản lý Doanh nghiệp**: `/companies` (Hồ sơ doanh nghiệp, MST, Ngành nghề, Quy mô, Hội phí)
- **Quản lý Tài khoản & Gán Ban**: `/accounts` (Phân quyền 5 vai trò BĐH, Gán ban chuyên môn, Gọi API `PATCH /members/:id/role-dept`)
- **Ma trận Phân quyền RBAC**: `/permissions` (2 Tab độc lập: Tab 1 "Phân Quyền CRM Web", Tab 2 "Phân Quyền App Mobile")
- **Quản lý Sự kiện**: `/events` (Lập kế hoạch, Poster tùy biến, Lịch trình Agenda theo giờ, Mã QR điểm danh, Cấu hình Lucky Draw)
- **Quản lý Cuộc họp**: `/meetings` (Lên lịch họp ban, Bản đồ tương tác chọn vị trí ghim đỏ Nominatim, Đồng bộ tự động sang App Mobile)
- **Tài chính - Quản lý Thu**: `/income` (Phí hội viên niên liễm, Vé sự kiện, Biểu đồ ComposedChart dòng tiền, Xuất/Nhập Excel)
- **Tài chính - Quản lý Chi**: `/expenses` (Phiếu chi nghiệp vụ, Tạm ứng, Hoàn ứng tiền thừa, Biểu đồ PieChart cơ cấu chi)
- **Tài chính - Báo cáo Tổng hợp**: `/finance-report` (Dòng tiền ròng Thu - Chi - Thặng Dư tích lũy, 4 hạng tài trợ)
- **Giao việc Ban Chuyên Môn**: `/tasks` (Chỉ đạo công việc, Nêu rõ người giao việc `[Giao việc từ ${creatorDisplayName}]`, Xem trực tiếp file Excel/Ảnh/PDF)
- **Quản lý Nhà Tài Trợ**: `/sponsors` (4 Hạng Kim Cương, Vàng, Bạc, Đồng; Quản lý quyền lợi hiển thị banner)
- **Kho Tài Liệu & Mẫu Email**: `/documents` (Mẫu email v3 bền vững, Thẻ thân thiện `[Mã hội viên]`, `[Tên hội viên]`, Đính kèm QR Inline CID)
- **Quản trị Biểu Quyết**: `/voting` (Khởi tạo phiên biểu quyết đại hội, Cấu hình và Vòng quay may mắn Lucky Draw)
- **Quản trị Tin Tức**: `/news-admin` (Bản tin hiệp hội, Soạn thảo nội dung, Phát hành tin tới Bảng tin di động)
- **Gia Hạn Hội Viên**: `/renewal` (Khử prefix `RNW-`, Tránh lỗi ép kiểu UUID PostgreSQL, Tiến độ gia hạn)

---

## 3. TIÊU CHUẨN THIẾT KẾ BẢNG DỮ LIỆU KIỂU EXCEL (EXCEL-STYLE DATA TABLES)
1. **Co dãn cột bằng chuột (Resizable Columns)**:
   - Toàn bộ các bảng danh sách nghiệp vụ quan trọng (Tài chính Thu `/income`, Chi `/expenses`, Hội viên `/members`, Doanh nghiệp `/companies`) BẮT BUỘC hỗ trợ kéo rê chuột để thay đổi độ rộng cột (`ResizableTh`, hook `useResizableColumns`).
   - Bảng sử dụng `table-fixed` để kiểm soát tràn layout.
2. **Rút gọn văn bản & Tooltip Ant Design (Ellipsis & Zoom Tooltip)**:
   - Các nội dung dài (Địa chỉ, Ghi chú, Lý do chi) tự động cắt rút gọn (`truncate`) và bọc component `TruncatedText`.
   - Tooltip chuẩn phong cách Ant Design: Nền đen sâu (`#1f1f1f`), chữ trắng sắc nét, mũi tên định hướng, hiệu ứng animate zoom mượt mà.
3. **Bộ Lọc Nhanh & Xuất / Nhập Excel**:
   - Mọi bảng dữ liệu phải có thanh tìm kiếm thời gian thực (`searchTerm`), bộ lọc trạng thái (Đã nộp, Chờ duyệt, Quá hạn), và bộ lọc khoảng thời gian (`dateRange`).
   - Nút **"Xuất Excel"** xuất dữ liệu bảng tính theo đúng mẫu chuẩn của Hiệp hội.
   - Nút **"Nhập Excel"** mở modal `FinanceExcelImportModal` kiểm tra định dạng và validate dữ liệu trước khi đẩy vào CSDL.

---

## 4. TIÊU CHUẨN BIỂU ĐỒ TRỰC QUAN RECHARTS (VISUAL ANALYTICS)
1. **Mô đun Thống Kê CRM Web (`/analytics`)**:
   - BẮT BUỘC hỗ trợ 5 chế độ hiển thị linh hoạt:
     1. **Dạng Lưới KPI**: Thẻ chỉ số lớn kèm % tăng trưởng so với kỳ trước.
     2. **Dashboard Tổng Quan**: Biểu đồ kết hợp cột - đường tổng hợp hoạt động toàn CLB.
     3. **Biểu Đồ Cây Phân Bố Ngành Nghề (Treemap)**: Trực quan hóa tỷ trọng ngành nghề của các doanh nghiệp thành viên.
     4. **Biểu Đồ Tròn Ban Ngành (Donut Chart)**: Cơ cấu phân bổ hội viên theo 6 ban chuyên môn.
     5. **Cây Đơn Vị Cơ Cấu Tổ Chức (Org Tree)**: Phân cấp từ Chủ tịch -> Ban Điều Hành -> 6 Ban Chuyên Môn -> Hội viên.
2. **Mô đun Tài Chính Trực Quan (`FinanceChartsSection.tsx`)**:
   - Biểu đồ dòng tiền hỗn hợp (`ComposedChart`): Cột Thu (Emerald `#059669`), Cột Chi (Rose `#E11D48`), Đường Thặng Dư Lũy Kế (Gold `#F59E0B`).
   - Biểu đồ tròn cơ cấu nguồn thu (`PieChart`): Phí niên liễm, Vé sự kiện, Nhà tài trợ.
   - Biểu đồ tròn cơ cấu chi phí (`PieChart`): Chi sự kiện, Chi văn phòng, Chi thiện nguyện, Chi xúc tiến thương mại.
   - Lưới phân tích 4 hạng tài trợ: Diamond, Gold, Silver, Bronze.
   - Hỗ trợ định dạng tiền tệ Việt Nam Đồng (`toLocaleString('vi-VN')} đ`).

---

## 5. BẢO MẬT & MA TRẬN PHÂN QUYỀN RBAC TRÊN CRM
1. **Phân cấp 7 cấp bậc thẩm quyền**:
   - `chu_tich`: Toàn quyền chỉ đạo, giao việc toàn hệ thống.
   - `admin` / `quan_tri`: Quản trị viên kỹ thuật, cấu hình RBAC, quản lý tài khoản.
   - `ban_dieu_hanh`: Lãnh đạo liên ban, giám sát hoạt động chuyên môn.
   - `tong_thu_ky`: Điều hành Văn phòng thư ký, truyền đạt thông báo.
   - `truong_ban_*`: Trưởng 6 Ban Chuyên Môn (chỉ giao việc trong ban của mình).
   - `ban_thu_ky`: Nhân sự văn phòng thực thi nhiệm vụ.
   - `member`: Hội viên doanh nhân (không có quyền truy cập CRM Quản trị).
2. **Quy tắc Lưu & Đồng Bộ Vai Trò CSDL (`/accounts`)**:
   - Mọi thay đổi chức vụ và ban chuyên môn BẮT BUỘC gọi API `PATCH /members/:id/role-dept` để lưu vào CSDL PostgreSQL.
   - Tuyệt đối không chỉ lưu ở `localStorage`.
   - Khi tải trang (`F5`), hệ thống nạp dữ liệu từ CSDL ghi đè danh sách, giữ toàn vẹn dữ liệu mới nhất.
3. **Cơ chế chặn thao tác khi thay đổi quyền thời gian thực**:
   - Nếu quyền bị thu hồi trong lúc đang mở modal, hệ thống bật popup ở giữa màn hình: *"Quyền hạn của bạn đã bị thay đổi bởi Quản trị viên. Hệ thống sẽ tải lại..."* và reload trang sau 4 giây.
