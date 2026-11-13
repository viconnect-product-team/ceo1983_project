# HƯỚNG DẪN SỬ DỤNG CỔNG QUẢN TRỊ WEB CRM CEO 1983
## HỆ THỐNG ĐIỀU HÀNH & KẾT NỐI DOANH NHÂN CLB CEO 1983 (HANOIBA)
*Địa chỉ truy cập CRM: `https://crm.ceo1983.viconnect.vn`*

---

## MỤC LỤC HƯỚNG DẪN

1. [Đăng Nhập Quản Trị & Phân Quyền Vai Trò](#1-đăng-nhập-quản-trị--phân-quyền-vai-trò)
2. [NODE-CRM-001: Tổng Quan & Dashboard KPI](#node-crm-001-tổng-quan--dashboard-kpi)
3. [NODE-CRM-002: Thống Kê & Phân Tích Dữ Liệu Real Data](#node-crm-002-thống-kê--phân-tích-dữ-liệu-real-data)
4. [NODE-CRM-003: Quản Trị Danh Bạ Hội Viên 360°](#node-crm-003-quản-trị-danh-bạ-hội-viên-360)
5. [NODE-CRM-004: Quản Trị Doanh Nghiệp Thành Viên](#node-crm-004-quản-trị-doanh-nghiệp-thành-viên)
6. [NODE-CRM-005: Quản Lý Tài Khoản & Gán Ban Chuyên Môn](#node-crm-005-quản-lý-tài-khoản--gán-ban-chuyên-môn)
7. [NODE-CRM-006: Ma Trận Phân Quyền RBAC Theo Vai Trò](#node-crm-006-ma-trận-phân-quyền-rbac-theo-vai-trò)
8. [NODE-CRM-007: Quản Trị Sự Kiện, Sơ Đồ Chỗ Ngồi, Quản Lý Vé & Check-in QR](#node-crm-007-quản-trị-sự-kiện-sơ-đồ-chỗ-ngồi-quản-lý-vé--check-in-qr)
9. [NODE-CRM-008: Quản Lý Cuộc Họp & Đặt Phòng Họp](#node-crm-008-quản-lý-cuộc-họp--đặt-phòng-họp)
10. [NODE-CRM-009: Quản Lý Thu Ngân Sách, Phí Niên Liễm & Xuất Nhập Excel](#node-crm-009-quản-lý-thu-ngân-sách-phí-niên-liễm--xuất-nhập-excel)
11. [NODE-CRM-010: Quản Lý Chi Ngân Sách & Tạm Ứng / Hoàn Ứng](#node-crm-010-quản-lý-chi-ngân-sách--tạm-ứng--hoàn-ứng)
12. [NODE-CRM-011: Báo Cáo Tài Chính Tổng Hợp](#node-crm-011-báo-cáo-tài-chính-tổng-hợp)
13. [NODE-CRM-012: Quản Lý Giao Việc Ban Chuyên Môn & Kanban](#node-crm-012-quản-lý-giao-việc-ban-chuyên-môn--kanban)
14. [NODE-CRM-013: Quản Trị Nhà Tài Trợ 4 Phân Hạng](#node-crm-013-quản-trị-nhà-tài-trợ-4-phân-hạng)
15. [NODE-CRM-014: Kho Tài Liệu & Văn Kiện Số](#node-crm-014-kho-tài-liệu--văn-kiện-số)
16. [NODE-CRM-015: Quản Trị Biểu Quyết & Vòng Quay May Mắn](#node-crm-015-quản-trị-biểu-quyết--vòng-quay-may-mắn)
17. [NODE-CRM-016: Quản Lý Bản Tin & Truyền Thông CLB](#node-crm-016-quản-lý-bản-tin--truyền-thông-clb)
18. [NODE-CRM-017: Quản Lý Gia Hạn Hội Viên & Xử Lý Nợ Phí](#node-crm-017-quản-lý-gia-hạn-hội-viên--xử-lý-nợ-phí)
19. [NODE-CRM-018: Quản Trị Đào Tạo Doanh Nghiệp & Video Call](#node-crm-018-quản-trị-đào-tạo-doanh-nghiệp--video-call)
20. [NODE-CRM-019: Nhật Ký Hoạt Động & Lịch Sử Thao Tác (Audit Log)](#node-crm-019-nhật-ký-hoạt-động--lịch-sử-thao-tác-audit-log)
21. [NODE-CRM-020: Quản Trị Cơ Hội Giao Thương B2B](#node-crm-020-quản-trị-cơ-hội-giao-thương-b2b)
22. [NODE-CRM-021: Cài Đặt Giao Diện Theme Studio](#node-crm-021-cài-đặt-giao-diện-theme-studio)
23. [NODE-CRM-022: Trung Tâm Thông Báo Quản Trị & Tiếp Nhận Quên Mật Khẩu](#node-crm-022-trung-tâm-thông-báo-quản-trị--tiếp-nhận-quên-mật-khẩu)
24. [NODE-CRM-023: Thư Mời, Zalo ZBS / ZNS & Gửi Thông Báo Hàng Loạt Excel](#node-crm-023-thư-mời-zalo-zbs--zns--gửi-thông-báo-hàng-loạt-excel)
25. [PHỤ LỤC: GIAO DIỆN RESPONSIVE TRÊN ĐA THIẾT BỊ](#phụ-lục-giao-diện-responsive-trên-đa-thiết-bị)

---

## 1. ĐĂNG NHẬP QUẢN TRỊ & PHÂN QUYỀN VAI TRÒ

![Đăng nhập Cổng Quản Trị CRM](./images/guide_crm/00_crm_login.png)

- **Tại màn hình Đăng nhập (`https://crm.ceo1983.viconnect.vn/auth`)**:
  - Bước 1: Nhập địa chỉ email quản trị vào ô **"Email"** (ví dụ: `admin@viconnect.vn` hoặc tài khoản Trưởng ban).
  - Bước 2: Nhập mật khẩu vào ô **"Mật khẩu"**.
  - Bước 3: Tích chọn ô **"Ghi nhớ đăng nhập"** nếu sử dụng máy tính cá nhân.
  - Bước 4: Bấm nút **"Đăng nhập"**.
  - Kết quả: Hệ thống kiểm tra vai trò người dùng và mở màn hình **Dashboard Tổng Quan**.

---

## NODE-CRM-001: TỔNG QUAN & DASHBOARD KPI

### 1. Mục đích
Theo dõi các chỉ số hoạt động tổng thể của CLB: số lượng hội viên, doanh nghiệp, số dư quỹ và tỷ lệ tham dự sự kiện.

### 2. Đường dẫn truy cập
- Route: `/` hoặc `/dashboard`
- Menu bên trái: Chọn mục **"Tổng quan"**.

### 3. Hình ảnh giao diện
![Dashboard Tổng quan CRM](./images/guide_crm/01_crm_dashboard.png)
*Hình 1.1: Dashboard tổng quan hiển thị các khối chỉ số và lịch công tác.*

### 4. Các bước thao tác
- Bước 1: Quan sát 4 thẻ thống kê số liệu tại đầu trang:
  - Thẻ **"Tổng số Hội viên"**: Tổng hội viên chính thức đang sinh hoạt.
  - Thẻ **"Doanh nghiệp Hội viên"**: Tổng số doanh nghiệp thành viên.
  - Thẻ **"Tổng Quỹ CLB"**: Số dư tiền mặt hiện tại của quỹ.
  - Thẻ **"Tỷ lệ tham dự"**: % hội viên check-in các sự kiện gần nhất.
- Bước 2: Xem lịch hoạt động ở cột bên trái: Bấm vào ngày có chấm tròn để xem danh sách cuộc họp hoặc sự kiện diễn ra trong ngày.
- Bước 3: Xem cột cảnh báo bên phải: Kiểm tra số lượng hồ sơ hội viên mới đang chờ phê duyệt và danh sách hội viên sắp đến hạn đóng phí.

---

## NODE-CRM-002: THỐNG KÊ & PHÂN TÍCH DỮ LIỆU REAL DATA

### 1. Mục đích
Xem biểu đồ phân tích hoạt động giao thương, nộp quỹ, phân bố ngành nghề kèm tính năng chọn thời gian chi tiết (ngày/tuần/tháng/quý/năm), phóng to/thu nhỏ (zoom in/out) và thanh kéo vuốt cảm ứng.

### 2. Đường dẫn truy cập
- Route: `/analytics`
- Menu bên trái: Chọn mục **"Thống kê"**.

### 3. Hình ảnh giao diện
![Trung Tâm Thống Kê CRM](./images/guide_crm/02_crm_analytics.png)
*Hình 2.1: Giao diện thống kê với bộ nút Granular Tabs, Zoom In/Out và Recharts Brush.*

### 4. Các bước thao tác
#### a. Chọn mốc thời gian phân tích:
- Tại hàng nút phía trên biểu đồ, bấm chọn:
  - Nút **"Ngày"**: Hiển thị từng ngày trong tháng hiện tại.
  - Nút **"Tuần"**: Hiển thị 4 tuần của tháng.
  - Nút **"Tháng"**: Hiển thị 12 tháng trong năm.
  - Nút **"Quý"**: Hiển thị Q1, Q2, Q3, Q4.
  - Nút **"Năm"**: Hiển thị các năm gần nhất.

#### b. Thao tác Phóng to / Thu nhỏ (Zoom) và Kéo xem chi tiết:
- Bước 1: Bấm nút **"+"** (Zoom In) để phóng to cột biểu đồ (hỗ trợ các mức: 1x, 1.5x, 2x, 2.5x, 3x).
- Bước 2: Bấm nút **"-"** (Zoom Out) để thu nhỏ về kích thước ban đầu.
- Bước 3: Dùng chuột kéo 2 đầu của thanh trượt bên dưới chân biểu đồ (`Recharts Brush`) để thu hẹp hoặc mở rộng khoảng ngày cần quan sát.

---

## NODE-CRM-003: QUẢN TRỊ DANH BẠ HỘI VIÊN 360°

### 1. Mục đích
Quản lý hồ sơ toàn bộ hội viên CLB, tiếp nhận hồ sơ đăng ký mới và duyệt cấp mã hội viên.

### 2. Đường dẫn truy cập
- Route: `/members`
- Menu bên trái: Chọn mục **"Hội viên"**.

### 3. Hình ảnh giao diện
![Danh Sách Hội Viên CRM](./images/guide_crm/03_crm_members_list.png)
*Hình 3.1: Bảng quản lý danh sách hội viên 360 độ.*

### 4. Các bước thao tác
#### a. Tìm kiếm và lọc hội viên:
- Bước 1: Nhập họ tên hoặc số điện thoại vào ô **"Tìm kiếm hội viên..."**.
- Bước 2: Bấm vào ô chọn **"Ban chuyên môn"** để lọc theo từng ban (Ban Sự Kiện, Ban Truyền Thông, Ban Xúc Tiến...).

#### b. Phê duyệt hồ sơ hội viên mới:
- Bước 1: Chọn tab **"Chờ duyệt"**.
- Bước 2: Bấm vào dòng của hội viên cần duyệt để mở khung thông tin chi tiết bên phải.
- Bước 3: Kiểm tra các mục: Giấy phép kinh doanh, Chức vụ, Ảnh đại diện.
- Bước 4: Bấm nút **"Phê duyệt hồ sơ"** màu xanh.
- Kết quả: Hệ thống cấp mã số hội viên (ví dụ: `CEO1983-000004`) và tự động gửi email thông báo cho hội viên.

---

## NODE-CRM-004: QUẢN TRỊ DOANH NGHIỆP THÀNH VIÊN

### 1. Mục đích
Quản lý hồ sơ pháp nhân doanh nghiệp, mã số thuế, địa chỉ trụ sở và ngành nghề kinh doanh.

### 2. Đường dẫn truy cập
- Route: `/companies`
- Menu bên trái: Chọn mục **"Doanh nghiệp"**.

### 3. Hình ảnh giao diện
![Danh Sách Doanh Nghiệp](./images/guide_crm/05_crm_companies_list.png)
*Hình 4.1: Danh sách các công ty thành viên.*

![Chỉnh Sửa Doanh Nghiệp Modal](./images/guide_crm/06_crm_company_edit_modal.png)
*Hình 4.2: Hộp thoại sửa thông tin doanh nghiệp.*

### 4. Các bước thao tác
- Bước 1: Bấm nút **"Thêm doanh nghiệp"** ở góc phải (hoặc bấm nút **"Sửa"** trên một dòng công ty có sẵn).
- Bước 2: Nhập thông tin vào các ô:
  - Ô **"Tên doanh nghiệp"**: Nhập tên đầy đủ theo đăng ký kinh doanh.
  - Ô **"Mã số thuế"**: Nhập mã số thuế công ty.
  - Ô **"Lĩnh vực / Ngành nghề"**: Chọn ngành nghề trong danh sách.
  - Ô **"Địa chỉ trụ sở"**: Nhập địa chỉ văn phòng.
  - Ô **"Website / Fanpage"**: Nhập đường link liên kết.
- Bước 3: Bấm nút **"Lưu thông tin"**.
- Kết quả: Thông tin công ty được cập nhật đồng bộ lên sàn thương mại và danh bạ hội viên.

---

## NODE-CRM-005: QUẢN LÝ TÀI KHOẢN & GÁN BAN CHUYÊN MÔN

### 1. Mục đích
Quản lý danh sách tài khoản đăng nhập CRM, gán người dùng vào 6 Ban chuyên môn và cấp vai trò tương ứng.

### 2. Đường dẫn truy cập
- Route: `/accounts`
- Menu bên trái: Chọn mục **"Tài khoản"**.

### 3. Hình ảnh giao diện
![Danh Sách Tài Khoản](./images/guide_crm/07_crm_accounts_list.png)
*Hình 5.1: Danh sách tài khoản người dùng và vai trò điều hành.*

### 4. Các bước thao tác
#### a. Thêm tài khoản quản trị mới:
- Bước 1: Bấm nút **"Tạo tài khoản"** ở góc trên bên phải.
- Bước 2: Nhập thông tin:
  - Ô **"Họ và tên"**: Nhập họ tên nhân sự.
  - Ô **"Email đăng nhập"**: Nhập địa chỉ email.
  - Ô **"Mật khẩu ban đầu"**: Nhập mật khẩu tạm thời.
  - Ô chọn **"Ban chuyên môn"**: Chọn 1 trong 6 ban (Ban Thành Viên, Ban Sự Kiện, Ban Truyền Thông, Ban Tài Chính, Ban Xúc Tiến Thương Mại, Ban Thiện Nguyện).
  - Ô chọn **"Vai trò"**: Chọn Quản trị viên (Admin), Trưởng ban, Phó ban hoặc Thành viên ban.
- Bước 3: Bấm nút **"Tạo mới"**.

#### b. Chỉnh sửa vai trò hoặc đổi ban:
- Bước 1: Bấm nút **"Sửa"** (Biểu tượng cây bút) ở cột Hành động của tài khoản cần đổi.
- Bước 2: Thay đổi chức vụ hoặc tích chọn các quyền tương ứng.
- Bước 3: Bấm nút **"Lưu thay đổi"**. Giao diện lập tức cập nhật dữ liệu từ cơ sở dữ liệu.

---

## NODE-CRM-006: MA TRẬN PHÂN QUYỀN RBAC THEO VAI TRÒ

### 1. Mục đích
Cấu hình chi tiết quyền Xem, Thêm, Sửa, Xóa và Xuất Excel cho từng vai trò trên 24 phân hệ của hệ thống.

### 2. Đường dẫn truy cập
- Route: `/permissions`
- Menu bên trái: Chọn mục **"Phân quyền"**.

### 3. Hình ảnh giao diện
![Ma Trận Phân Quyền RBAC](./images/guide_crm/09_crm_permissions_matrix.png)
*Hình 6.1: Bảng ma trận phân quyền theo từng vai trò quản trị.*

### 4. Các bước thao tác
- Bước 1: Bấm chọn tab vai trò cần cấu hình:
  - Tab **"Chủ tịch / Thường trực"**
  - Tab **"Tổng Thư Ký"**
  - Tab **"Trưởng Ban Chuyên Môn"**
  - Tab **"Kế Toán / Thủ Quỹ"**
- Bước 2: Tại từng dòng chức năng, tích chọn hoặc bỏ tích các ô vuông:
  - Cột **"Xem"**: Cho phép xem danh sách và chi tiết.
  - Cột **"Tạo mới"**: Cho phép thêm bản ghi mới.
  - Cột **"Chỉnh sửa"**: Cho phép sửa dữ liệu.
  - Cột **"Xóa"**: Cho phép xóa bản ghi.
  - Cột **"Xuất Excel"**: Cho phép tải file báo cáo Excel.
- Bước 3: Bấm nút **"Lưu ma trận phân quyền"** ở góc trên cùng.
- Kết quả: Quyền hạn được áp dụng ngay lập tức cho toàn bộ tài khoản thuộc vai trò đó.

---

## NODE-CRM-007: QUẢN TRỊ SỰ KIỆN, SƠ ĐỒ CHỖ NGỒI, QUẢN LÝ VÉ & CHECK-IN QR

### 1. Mục đích
Tổ chức các sự kiện lớn của CLB, thiết kế sơ đồ chỗ ngồi cho khách VIP, quản lý phát hành vé và theo dõi danh sách check-in trực tiếp.

### 2. Đường dẫn truy cập
- Route: `/events`
- Menu bên trái: Chọn mục **"Sự kiện"**.

### 3. Hình ảnh giao diện
![Danh Sách Sự Kiện](./images/guide_crm/10_crm_events_list.png)
*Hình 7.1: Bảng tổng hợp các sự kiện của CLB.*

![Tạo Sự Kiện Mới Modal](./images/guide_crm/11_crm_event_create_modal.png)
*Hình 7.2: Hộp thoại tạo mới sự kiện.*

![Event Detail Hub](./images/guide_crm/11_b_crm_event_detail_hub.png)
*Hình 7.3: Trung tâm quản trị chi tiết sự kiện.*

![Sơ Đồ Chỗ Ngồi Sự Kiện](./images/guide_crm/11_d_crm_event_seating_setup.png)
*Hình 7.4: Giao diện bố trí sơ đồ bàn tiệc và phân bổ chỗ ngồi khách mời.*

![Quản Lý Vé & Check-in](./images/guide_crm/11_c_crm_event_registrations_tickets.png)
*Hình 7.5: Danh sách khách đã đăng ký, tình trạng thanh toán vé và điểm danh.*

### 4. Các bước thao tác
#### a. Tạo sự kiện mới:
- Bước 1: Bấm nút **"Tạo sự kiện mới"**.
- Bước 2: Nhập thông tin:
  - Ô **"Tên sự kiện"**: Nhập tên sự kiện (ví dụ: "Gala Giao Thương Doanh Nhân CEO 1983").
  - Ô **"Thời gian bắt đầu"** & **"Thời gian kết thúc"**: Chọn ngày và giờ tổ chức.
  - Ô **"Địa điểm"**: Nhập địa chỉ hội trường / trung tâm hội nghị.
  - Ô **"Số lượng khách dự kiến"**: Nhập số lượng chỗ.
  - Ô **"Giá vé (VNĐ)"**: Nhập giá vé (ghi 0 nếu miễn phí).
- Bước 3: Bấm nút **"Lưu sự kiện"**.

#### b. Thiết lập sơ đồ chỗ ngồi (Seating Setup):
- Bước 1: Tại bảng sự kiện, bấm nút **"Chi tiết"** -> chọn tab **"Sơ đồ chỗ ngồi"**.
- Bước 2: Bấm nút **"Thêm bàn"** (hoặc thêm dãy ghế):
  - Nhập tên bàn (ví dụ: "Bàn VIP 1", "Bàn VIP 2", "Bàn Ban Chấp Hành").
  - Nhập số lượng ghế mỗi bàn (ví dụ: 10 ghế).
- Bước 3: Kéo thả tên khách mời từ danh sách bên phải vào từng vị trí ghế cụ thể trên bàn.
- Bước 4: Bấm nút **"Lưu sơ đồ chỗ ngồi"**.

#### c. Quản lý vé và điểm danh check-in QR:
- Bước 1: Chọn tab **"Danh sách đăng ký & Vé"**.
- Bước 2: Xem danh sách khách mời đăng ký tham dự kèm trạng thái: "Đã xác nhận", "Chưa thanh toán", "Đã check-in".
- Bước 3: Sử dụng máy quét hoặc camera quét mã QR trên vé của khách tại cửa. Hệ thống tự động chuyển trạng thái sang **"Đã Check-in"** kèm thời gian thực.
- Bước 4: Bấm nút **"Xuất danh sách Excel"** để xuất biên bản điểm danh đại hội.

---

## NODE-CRM-008: QUẢN LÝ CUỘC HỌP & ĐẶT PHÒNG HỌP

### 1. Mục đích
Quản lý lịch họp Ban Chấp Hành, họp giao ban các Ban chuyên môn và gửi biên bản cuộc họp.

### 2. Đường dẫn truy cập
- Route: `/meetings`
- Menu bên trái: Chọn mục **"Cuộc họp"**.

### 3. Hình ảnh giao diện
![Danh Sách Cuộc Họp](./images/guide_crm/12_crm_meetings_list.png)
*Hình 8.1: Lịch các cuộc họp giao ban và họp chuyên đề.*

### 4. Các bước thao tác
- Bước 1: Bấm nút **"Tạo cuộc họp mới"**.
- Bước 2: Nhập thông tin:
  - Ô **"Tiêu đề cuộc họp"**: Nhập nội dung (ví dụ: "Họp Ban Thường Vụ Tháng 11").
  - Ô **"Thời gian"**: Chọn ngày, giờ bắt đầu và kết thúc.
  - Ô **"Địa điểm / Phòng họp"**: Chọn phòng họp trực tiếp hoặc dán đường link phòng trực tuyến.
  - Ô chọn **"Thành phần tham dự"**: Tích chọn Ban Điều Hành hoặc toàn bộ thành viên ban.
- Bước 3: Bấm nút **"Lưu và gửi thông báo"**.
- Kết quả: Cuộc họp hiển thị trên lịch của các thành viên được mời.

---

## NODE-CRM-009: QUẢN LÝ THU NGÂN SÁCH, PHÍ NIÊN LIỄM & XUẤT NHẬP EXCEL

### 1. Mục đích
Theo dõi các khoản thu phí niên liễm hội viên, tiền tài trợ, tiền bán vé sự kiện và hỗ trợ nhập xuất file Excel kế toán.

### 2. Đường dẫn truy cập
- Route: `/income`
- Menu bên trái: Chọn mục **"Thu ngân sách"**.

### 3. Hình ảnh giao diện
![Quản Lý Thu Ngân Sách](./images/guide_crm/14_crm_income_list.png)
*Hình 9.1: Bảng kê các khoản thu tài chính CLB.*

### 4. Các bước thao tác
#### a. Ghi nhận phiếu thu mới:
- Bước 1: Bấm nút **"Tạo phiếu thu"**.
- Bước 2: Nhập các trường:
  - Ô **"Nội dung thu"**: Nhập lý do (ví dụ: "Thu phí niên liễm năm 2026 - Hội viên Nguyễn Văn A").
  - Ô **"Số tiền (VNĐ)"**: Nhập số tiền thu.
  - Ô **"Người nộp"**: Chọn tên hội viên trong danh sách.
  - Ô **"Hình thức"**: Chọn Chuyển khoản (VietQR) hoặc Tiền mặt.
  - Nút **"Đính kèm ủy nhiệm chi"**: Tải lên ảnh chụp chứng từ chuyển khoản.
- Bước 3: Bấm nút **"Xác nhận ghi thu"**.

#### b. Nhập dữ liệu từ Excel (Import Excel):
- Bước 1: Bấm nút **"Nhập từ Excel"**.
- Bước 2: Bấm chọn file `.xlsx` trên máy tính.
- Bước 3: Bấm nút **"Bắt đầu tải lên"**: Hệ thống tự động kiểm tra trùng lặp và ghi nhận vào sổ thu.

#### c. Xuất báo cáo Excel:
- Bấm nút **"Xuất file Excel"** ở góc phải để tải toàn bộ bảng kê thu về máy tính.

---

## NODE-CRM-010: QUẢN LÝ CHI NGÂN SÁCH & TẠM ỨNG / HOÀN ỨNG

### 1. Mục đích
Quản lý các khoản chi tiêu hoạt động CLB, tổ chức sự kiện, tạm ứng cho các ban và quy trình phê duyệt hoàn ứng.

### 2. Đường dẫn truy cập
- Route: `/expenses`
- Menu bên trái: Chọn mục **"Chi ngân sách"**.

### 3. Hình ảnh giao diện
![Quản Lý Chi Ngân Sách](./images/guide_crm/15_crm_expenses_list.png)
*Hình 10.1: Bảng quản lý chi ngân sách và phiếu chi.*

### 4. Các bước thao tác
- Bước 1: Bấm nút **"Tạo đề xuất chi"** (hoặc "Tạo phiếu chi").
- Bước 2: Nhập các thông tin:
  - Ô **"Khoản mục chi"**: Chọn danh mục (Chi sự kiện, Chi văn phòng phẩm, Chi thiện nguyện...).
  - Ô **"Số tiền (VNĐ)"**: Nhập số tiền chi.
  - Ô **"Ban đề xuất"**: Chọn ban thụ hưởng.
  - Ô **"Mục đích chi"**: Giải trình chi tiết lý do.
  - Nút **"Đính kèm hóa đơn"**: Tải lên file hóa đơn đỏ / chứng từ thanh toán.
- Bước 3: Bấm nút **"Gửi duyệt"**.
- Bước 4 (Dành cho Chủ tịch / Trưởng Ban Tài Chính): Xem phiếu chi và bấm nút **"Duyệt chi"** màu xanh để hoàn tất thanh toán.

---

## NODE-CRM-011: BÁO CÁO TÀI CHÍNH TỔNG HỢP

### 1. Mục đích
Xem báo cáo tổng hợp dòng tiền thu - chi theo tháng, quý, năm, tỷ lệ thu hồi phí niên liễm và số dư tài khoản quỹ thực tế.

### 2. Đường dẫn truy cập
- Route: `/finance-report`
- Menu bên trái: Chọn mục **"Báo cáo tài chính"**.

### 3. Hình ảnh giao diện
![Báo Cáo Tài Chính](./images/guide_crm/16_crm_finance_report.png)
*Hình 11.1: Biểu đồ dòng tiền thu chi và bảng quyết toán quỹ.*

### 4. Các bước thao tác
- Bước 1: Chọn khoảng thời gian báo cáo tại bộ chọn: Từ ngày... Đến ngày... (hoặc chọn nhanh: "Tháng này", "Quý này", "Cả năm").
- Bước 2: Quan sát biểu đồ cột đôi so sánh Dòng tiền Thu (Màu xanh) và Dòng tiền Chi (Màu đỏ).
- Bước 3: Bấm nút **"In báo cáo tài chính"** hoặc **"Tải báo cáo PDF"** để phục vụ các cuộc họp Ban Thường Vụ.

---

## NODE-CRM-012: QUẢN LÝ GIAO VIỆC BAN CHUYÊN MÔN & KANBAN

### 1. Mục đích
Giao nhiệm vụ công việc cho 6 Ban chuyên môn, theo dõi tiến độ công việc theo bảng Kanban 4 cột trực quan.

### 2. Đường dẫn truy cập
- Route: `/tasks`
- Menu bên trái: Chọn mục **"Công việc"**.

### 3. Hình ảnh giao diện
![Bảng Công Việc Kanban](./images/guide_crm/17_crm_tasks_kanban.png)
*Hình 12.1: Bảng Kanban theo dõi công việc qua 4 trạng thái.*

### 4. Các bước thao tác
#### a. Giao việc mới:
- Bước 1: Bấm nút **"Giao việc mới"**.
- Bước 2: Nhập thông tin:
  - Ô **"Tên nhiệm vụ"**: Nhập nội dung công việc cần làm.
  - Ô chọn **"Ban phụ trách"**: Chọn ban chịu trách nhiệm.
  - Ô chọn **"Người thực hiện"**: Chọn tài khoản nhân sự được giao.
  - Ô **"Hạn hoàn thành (Deadline)"**: Chọn ngày và giờ phải xong.
  - Ô **"Độ ưu tiên"**: Chọn Khẩn cấp (Đỏ), Cao (Cam), Trung bình (Xanh).
- Bước 3: Bấm nút **"Giao việc"**.

#### b. Cập nhật tiến độ:
- Dùng chuột kéo thẻ công việc từ cột **"Khởi tạo"** sang cột **"Đang xử lý"** hoặc sang cột **"Đã hoàn thành"** khi công việc kết thúc.

---

## NODE-CRM-013: QUẢN TRỊ NHÀ TÀI TRỢ 4 PHÂN HẠNG

### 1. Mục đích
Quản lý các gói tài trợ, danh sách nhà tài trợ (Kim Cương, Vàng, Bạc, Đồng), hợp đồng và quyền lợi hiển thị logo.

### 2. Đường dẫn truy cập
- Route: `/sponsors`
- Menu bên trái: Chọn mục **"Nhà tài trợ"**.

### 3. Hình ảnh giao diện
![Quản Trị Nhà Tài Trợ](./images/guide_crm/19_crm_sponsors_list.png)
*Hình 13.1: Danh sách nhà tài trợ theo phân hạng.*

### 4. Các bước thao tác
- Bước 1: Bấm nút **"Thêm nhà tài trợ"**.
- Bước 2: Nhập thông tin:
  - Ô **"Tên đơn vị tài trợ"**: Nhập tên doanh nghiệp.
  - Ô chọn **"Gói tài trợ"**: Chọn Kim Cương (Diamond), Vàng (Gold), Bạc (Silver), Đồng (Bronze).
  - Ô **"Giá trị tài trợ (VNĐ)"**: Nhập số tiền tài trợ.
  - Ô chọn **"Sự kiện áp dụng"**: Chọn sự kiện mà đơn vị tài trợ.
  - Nút **"Tải Logo"**: Tải lên file ảnh logo chuẩn PNG tách nền.
- Bước 3: Bấm nút **"Lưu nhà tài trợ"**. Logo sẽ tự động xuất hiện trên màn hình chiếu sự kiện và ứng dụng di động.

---

## NODE-CRM-014: KHO TÀI LIỆU & VĂN KIỆN SỐ

### 1. Mục đích
Lưu trữ và chia sẻ các văn bản chính thức của CLB: Điều lệ, Quy chế hoạt động, Biên bản họp, Biểu mẫu đăng ký kèm trình xem trực tiếp file Word, Excel, PDF.

### 2. Đường dẫn truy cập
- Route: `/documents`
- Menu bên trái: Chọn mục **"Kho tài liệu"**.

### 3. Hình ảnh giao diện
![Kho Tài Liệu Số](./images/guide_crm/20_crm_documents_list.png)
*Hình 14.1: Thư viện tài liệu và trình xem văn bản trực tiếp.*

### 4. Các bước thao tác
- Bước 1: Bấm nút **"Tải lên tài liệu"**.
- Bước 2: Chọn file từ máy tính (hỗ trợ định dạng `.pdf`, `.docx`, `.xlsx`).
- Bước 3: Nhập Tên tài liệu và chọn thư mục lưu trữ (Văn bản hiệp hội, Biểu mẫu, Hợp đồng mẫu).
- Bước 4: Bấm nút **"Lưu tài liệu"**.
- *Để xem tài liệu*: Bấm nút **"Xem"** trên một dòng tài liệu. Trình xem Universal Document Viewer tự động hiển thị nội dung tài liệu ngay trên trình duyệt mà không cần tải về máy.

---

## NODE-CRM-015: QUẢN TRỊ BIỂU QUYẾT & VÒNG QUAY MAY MẮN

### 1. Mục đích
Tạo các phiên biểu quyết trực tuyến tại đại hội và quay số trúng thưởng Lucky Draw cho khách mời sự kiện.

### 2. Đường dẫn truy cập
- Route: `/voting`
- Menu bên trái: Chọn mục **"Biểu quyết & Lucky Draw"**.

### 3. Hình ảnh giao diện
![Biểu Quyết & Vòng Quay May Mắn](./images/guide_crm/21_crm_voting_and_luckydraw.png)
*Hình 15.1: Bảng quản lý phiên biểu quyết và vòng quay may mắn.*

### 4. Các bước thao tác
#### a. Mở phiên biểu quyết mới:
- Bước 1: Bấm nút **"Tạo phiên biểu quyết"**.
- Bước 2: Nhập nội dung câu hỏi biểu quyết và các phương án trả lời (Đồng ý, Không đồng ý, Ý kiến khác).
- Bước 3: Bấm nút **"Mở biểu quyết"**: Phiên biểu quyết lập tức hiển thị trên ứng dụng của toàn bộ hội viên đang có mặt.

#### b. Vận hành Vòng quay may mắn (Lucky Draw):
- Bước 1: Chọn tab **"Vòng quay may mắn"**.
- Bước 2: Bấm nút **"Đồng bộ danh sách khách check-in"** để lấy toàn bộ danh sách hội viên đã có mặt tại sự kiện.
- Bước 3: Bấm nút **"QUAY SỐ"**: Vòng quay đồ họa xoay tròn và tự động dừng lại ở mã số trúng thưởng.

---

## NODE-CRM-016: QUẢN LÝ BẢN TIN & TRUYỀN THÔNG CLB

### 1. Mục đích
Biên tập và xuất bản các bài viết tin tức, thông cáo báo chí, hoạt động thăm doanh nghiệp lên Cổng thông tin hiệp hội.

### 2. Đường dẫn truy cập
- Route: `/news-admin`
- Menu bên trái: Chọn mục **"Bản tin"**.

### 3. Hình ảnh giao diện
![Quản Trị Bản Tin](./images/guide_crm/22_crm_news_admin.png)
*Hình 16.1: Danh sách bài viết tin tức và trình soạn thảo tin.*

### 4. Các bước thao tác
- Bước 1: Bấm nút **"Viết bài mới"**.
- Bước 2: Nhập Tiêu đề bài viết, chọn Chuyên mục (Tin hiệp hội, Gương doanh nhân, Tin kinh tế) và tải lên Ảnh đại diện bài viết.
- Bước 3: Nhập nội dung bài viết vào khung soạn thảo văn bản.
- Bước 4: Bấm nút **"Xuất bản"** để đăng tin lên ứng dụng di động cho hội viên đọc.

---

## NODE-CRM-017: QUẢN LÝ GIA HẠN HỘI VIÊN & XỬ LÝ NỢ PHÍ

### 1. Mục đích
Theo dõi danh sách hội viên sắp hết hạn niên liễm, gửi thông báo nhắc nợ phí tự động và ghi nhận gia hạn thẻ hội viên.

### 2. Đường dẫn truy cập
- Route: `/renewal`
- Menu bên trái: Chọn mục **"Gia hạn hội viên"**.

### 3. Hình ảnh giao diện
![Quản Lý Gia Hạn Hội Viên](./images/guide_crm/23_crm_renewal_list.png)
*Hình 17.1: Danh sách hội viên đến kỳ gia hạn và theo dõi nợ phí.*

### 4. Các bước thao tác
- Bước 1: Xem cột **"Tình trạng nợ phí"**:
  - Hội viên có nhãn đỏ **"Đã quá hạn"**: Cần nhắc phí.
  - Hội viên có nhãn vàng **"Sắp đến hạn trong 30 ngày"**.
- Bước 2: Tích chọn các hội viên cần nhắc phí và bấm nút **"Gửi thông báo nhắc phí hàng loạt"**: Hệ thống tự động gửi email và thông báo Zalo kèm mã VietQR đóng phí niên liễm.
- Bước 3: Khi hội viên chuyển khoản thành công, bấm nút **"Gia hạn 1 năm"** để cập nhật trạng thái thẻ sang hoạt động tiếp.

---

## NODE-CRM-018: QUẢN TRỊ ĐÀO TẠO DOANH NGHIỆP & VIDEO CALL

### 1. Mục đích
Quản lý các khóa đào tạo, thư viện bài giảng và mở phòng họp trực tuyến cho các chuyên đề nâng cao năng lực doanh nhân.

### 2. Đường dẫn truy cập
- Route: `/trainings`
- Menu bên trái: Chọn mục **"Đào tạo"**.

### 3. Hình ảnh giao diện
![Quản Trị Đào Tạo](./images/guide_crm/24_crm_trainings_list.png)
*Hình 18.1: Danh mục các khóa học và phòng đào tạo trực tuyến.*

### 4. Các bước thao tác
- Bước 1: Bấm nút **"Thêm khóa đào tạo mới"**.
- Bước 2: Nhập Tên chuyên đề đào tạo, Họ tên Diễn giả / Giảng viên, Ngày tổ chức và đường dẫn video bài giảng.
- Bước 3: Bấm nút **"Lưu khóa học"**.

---

## NODE-CRM-019: NHẬT KÝ HOẠT ĐỘNG & LỊCH SỬ THAO TÁC (AUDIT LOG)

### 1. Mục đích
Ghi vết và giám sát 100% mọi hành động chỉnh sửa, phê duyệt, xóa dữ liệu trên hệ thống để bảo đảm tính minh bạch và an toàn dữ liệu.

### 2. Đường dẫn truy cập
- Route: `/activity-logs`
- Menu bên trái: Chọn mục **"Nhật ký hoạt động"**.

### 3. Hình ảnh giao diện
![Nhật Ký Hoạt Động Audit Log](./images/guide_crm/25_crm_activity_logs.png)
*Hình 19.1: Bảng kê chi tiết từng thao tác của các tài khoản.*

### 4. Các bước thao tác
- Bước 1: Xem thông tin các cột: Thời gian, Người thực hiện, Địa chỉ IP, Hành động (Thêm/Sửa/Xóa), Bảng dữ liệu bị thay đổi.
- Bước 2: Sử dụng ô tìm kiếm để lọc nhật ký theo tên tài khoản hoặc mã sự kiện cần đối soát.

---

## NODE-CRM-020: QUẢN TRỊ CƠ HỘI GIAO THƯƠNG B2B

### 1. Mục đích
Kiểm duyệt các tin đăng cơ hội giao thương của hội viên trước khi hiển thị rộng rãi và theo dõi tổng giá trị các giao dịch thành công.

### 2. Đường dẫn truy cập
- Route: `/opportunities`
- Menu bên trái: Chọn mục **"Cơ hội B2B"**.

### 3. Hình ảnh giao diện
![Quản Trị Cơ Hội Giao Thương](./images/guide_crm/26_crm_opportunities_list.png)
*Hình 20.1: Bảng quản lý và kiểm duyệt các cơ hội kinh doanh.*

### 4. Các bước thao tác
- Bước 1: Chọn tab **"Tin chờ duyệt"**.
- Bước 2: Đọc nội dung cơ hội kinh doanh, kiểm tra tính xác thực và ngành nghề phù hợp.
- Bước 3: Bấm nút **"Duyệt tin"** để hiển thị lên app di động, hoặc bấm nút **"Từ chối"** kèm nhập lý do phản hồi cho hội viên.

---

## NODE-CRM-021: CÀI ĐẶT GIAO DIỆN THEME STUDIO

### 1. Mục đích
Tùy biến cấu hình nhận diện thương hiệu CLB, thay đổi icon đại diện các phân hệ và xem trước giao diện trực tiếp (Live Preview).

### 2. Đường dẫn truy cập
- Route: `/admin/landing-templates`
- Menu bên trái: Chọn mục **"Theme Studio"**.

### 3. Hình ảnh giao diện
![Theme Studio Cài Đặt Giao Diện](./images/guide_crm/27_crm_theme_studio.png)
*Hình 21.1: Trình tùy biến giao diện và màu sắc Brandbook.*

### 4. Các bước thao tác
- Bước 1: Chọn màu sắc chủ đề chính của CLB (Đỏ Ruby, Vàng Hoàng Gia, Xanh Doanh Nhân).
- Bước 2: Tải lên Logo chính thức của hiệp hội ở định dạng ảnh sắc nét.
- Bước 3: Bấm nút **"Lưu và áp dụng"** để đồng bộ màu sắc trên toàn bộ hệ thống.

---

## NODE-CRM-022: TRUNG TÂM THÔNG BÁO QUẢN TRỊ & TIẾP NHẬN QUÊN MẬT KHẨU

### 1. Mục đích
Tiếp nhận các cảnh báo từ hệ thống, danh sách yêu cầu cấp lại mật khẩu từ hội viên trên di động và thông báo phê duyệt hồ sơ.

### 2. Đường dẫn truy cập
- Route: `/notifications`
- Menu bên trái: Chọn mục **"Thông báo"**.

### 3. Hình ảnh giao diện
![Trung Tâm Thông Báo Quản Trị](./images/guide_crm/28_crm_notifications_hub.png)
*Hình 22.1: Bảng tiếp nhận thông báo và xử lý yêu cầu quên mật khẩu.*

### 4. Các bước thao tác
#### a. Xử lý yêu cầu quên mật khẩu:
- Bước 1: Khi hội viên bấm "Quên mật khẩu" trên ứng dụng di động, một thông báo màu vàng xuất hiện tại đây: "Yêu cầu đặt lại mật khẩu từ email [email hội viên]".
- Bước 2: Hệ thống tự động tạo mã bảo mật và gửi email link khôi phục cho hội viên.
- Bước 3: Quản trị viên có thể bấm nút **"Cấp lại mật khẩu nhanh"** nếu hội viên yêu cầu cấp trực tiếp mật khẩu mặc định qua điện thoại.

#### b. Quản lý cảnh báo hệ thống:
- Bấm vào từng thông báo để chuyển nhanh tới hồ sơ hội viên hoặc phiếu thu cần xử lý.

---

## NODE-CRM-023: THƯ MỜI, ZALO ZBS / ZNS & GỬI THÔNG BÁO HÀNG LOẠT EXCEL

### 1. Mục đích
Quản lý các mẫu thư mời sự kiện, mẫu thông báo tự động và cấu hình gửi tin nhắn hàng loạt qua Zalo OA (ZBS/ZNS) từ danh sách file Excel khách mời.

### 2. Đường dẫn truy cập
- Route: `/templates`
- Menu bên trái: Chọn mục **"Mẫu thông báo & Zalo"**.

### 3. Hình ảnh giao diện
![Quản Lý Mẫu Thông Báo & Zalo ZBS](./images/guide_crm/30_crm_templates_hub.png)
*Hình 23.1: Hub quản lý mẫu thông báo và cấu hình gửi hàng loạt qua Zalo ZBS.*

### 4. Các bước thao tác
#### a. Thiết lập mẫu thư mời sự kiện:
- Bước 1: Bấm nút **"Thêm mẫu thư mời"**.
- Bước 2: Chọn loại kênh gửi: **"Zalo ZNS"**, **"Email"** hoặc **"Thông báo Đẩy (Push App)"**.
- Bước 3: Nhập nội dung thư mời kèm các biến tự động: `{ho_ten}`, `{ten_su_kien}`, `{thoi_gian}`, `{dia_diem}`, `{ma_ve}`.
- Bước 4: Bấm nút **"Lưu mẫu"**.

#### b. Gửi Zalo ZBS hàng loạt từ file Excel khách mời:
- Bước 1: Bấm nút **"Gửi qua Zalo OA theo file Excel"**.
- Bước 2: Bấm nút **"Tải lên file Excel"**: Chọn file danh sách khách mời chứa ít nhất 2 cột: **Họ và tên** và **Số điện thoại**.
- Bước 3: Hệ thống tự động đọc và hiển thị danh sách khách mời đã chuẩn hóa đầu số điện thoại (+84).
- Bước 4: Chọn mẫu thông báo Zalo đã cấu hình ở trên.
- Bước 5: Bấm nút màu xanh **"Gửi ngay cho tất cả khách mời"**.
- Kết quả: Hệ thống gọi API Zalo ZBS gửi thư mời kèm mã vé cá nhân hóa đến điện thoại của từng khách mời trong danh sách.

---

## PHỤ LỤC: GIAO DIỆN RESPONSIVE TRÊN ĐA THIẾT BỊ

Cổng Quản Trị Web CRM CEO 1983 được tối ưu hiển thị tự động trên mọi độ phân giải màn hình:

### 1. Giao diện Máy tính để bàn (Desktop 1440px - 1920px)
![CRM Responsive Desktop 1440](./images/guide_crm/responsive_crm_desktop_1440.png)
*Hình PL.1: Bố cục chuẩn màn hình máy tính với thanh Sidebar đầy đủ và bảng dữ liệu đa cột.*

### 2. Giao diện Máy tính bảng (Tablet 1024px)
![CRM Responsive Tablet 1024](./images/guide_crm/responsive_crm_tablet_1024.png)
*Hình PL.2: Bố cục tự co giãn trên máy tính bảng (iPad/Galaxy Tab), bảng biểu hỗ trợ cuộn mượt mà.*

### 3. Giao diện Điện thoại thông minh (Mobile 390px)
![CRM Responsive Mobile 390](./images/guide_crm/responsive_crm_mobile_390.png)
*Hình PL.3: Bố cục tinh gọn trên điện thoại di động với thanh menu rút gọn (Drawer).*
