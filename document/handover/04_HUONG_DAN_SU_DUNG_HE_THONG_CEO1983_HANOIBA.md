# HỆ SINH THÁI NỀN TẢNG SỐ CLB DOANH NHÂN CEO 1983 (HANOIBA)

## CẨM NANG HƯỚNG DẪN SỬ DỤNG HỆ THỐNG TOÀN DIỆN
*(COMPREHENSIVE SYSTEM USER MANUAL - MASTER ENTERPRISE EDITION)*

---

* **Mã tài liệu:** `HDSD-CEO1983-MASTER-HANOIBA`
* **Phiên bản:** `Phiên bản 10.0 Enterprise Handover Standard (Bản Bàn Giao Vận Hành & Khách Hàng)`
* **Cơ quan chủ quản:** Câu Lạc Bộ Doanh Nhân CEO 1983 — Trực thuộc Hội Doanh Nghiệp Trẻ Hà Nội (HanoiBA)
* **Đơn vị phát triển giải pháp:** VICONNECT - Nền tảng Chuyển đổi số Hiệp hội Doanh nhân
* **Đối tượng áp dụng:** Ban Quản trị, Ban Thư ký, Trưởng 6 Ban chuyên môn, Kế toán và Toàn thể Hội viên Doanh nhân CEO 1983
* **Cổng truy cập Web CRM:** `https://14.225.217.232:5443`
* **Cổng truy cập Mobile App (PWA):** `https://14.225.217.232:5444/association`
* **Ngày phát hành:** `08/11/2026`

---

## MỤC LỤC TOÀN BỘ CẨM NANG

* **PHẦN I: HƯỚNG DẪN QUẢN TRỊ VIÊN CỔNG WEB CRM ĐIỀU HÀNH TRUNG ƯƠNG**
  - [1. Tổng Quan Hệ Thống Web CRM & Thông Tin Đăng Nhập](#1-tong-quan-crm)
  - [2. Quản Trị Phân Quyền RBAC 6 Ban Chuyên Môn](#2-phan-quyen-rbac)
  - [3. Quy Trình 3 Bước Tiếp Nhận & Phê Duyệt Kết Nạp Hội Viên Mới](#3-duyet-hoi-vien)
  - [4. Quản Lý Danh Bạ 360 Độ & Hồ Sơ Doanh Nghiệp](#4-ho-so-360)
  - [5. Quản Trị Sự Kiện, Sơ Đồ Bàn Tiệc Cinema Seating & Trạm Soát Vé QR Gate](#5-su-kien-seating)
  - [6. Quản Lý Cuộc Họp Ban Điều Hành & Điều Phối Công Việc Kanban](#6-hop-ban-kanban)
  - [7. Quản Lý Check-in Độc Lập Cho Sự Kiện, Họp Mặt & Diễn Đàn](#7-checkin-doc-lap)
  - [8. Quản Lý Cơ Hội Giao Thương B2B, Chia Sẻ Bảo Mật & Sàn TMĐT](#8-giao-thuong-b2b)
  - [9. Quản Trị Tài Chính: Thu Hội Phí Tự Động Mã QR Ngân Hàng / MoMo & Đối Soát Sổ Quỹ](#9-tai-chinh-hoi-phi)
  - [10. Nhập - Xuất Báo Cáo Excel Chuẩn Biểu Mẫu Doanh Nghiệp](#10-excel-import-export)
  - [11. Đăng Bài Truyền Thông Đa Kênh 1-Chạm (Facebook, Zalo OA, Website)](#11-dang-bai-da-kenh)
  - [12. Cấu Hình Hệ Thống, Quản Lý Tự Động Refresh Token Zalo OA 6 Giờ & Audit Logs](#12-cai-dat-zalo-audit)

* **PHẦN II: HƯỚNG DẪN HỘI VIÊN SỬ DỤNG ỨNG DỤNG DI ĐỘNG CEO 1983 MOBILE APP**
  - [1. Hướng Dẫn Cài Đặt 1-Chạm (iOS Safari, Android Chrome PWA & APK Native)](#1-cai-dat-app)
  - [2. Đăng Nhập An Toàn & Kích Hoạt Sinh Trắc Học FaceID / Vân Tay](#2-dang-nhap-faceid)
  - [3. Trang Chủ Di Động: Banner Tin Tức Tự Động Trượt Ngang Full-Width & Popup Sinh Nhật](#3-trang-chu-tin-tuc)
  - [4. Thẻ Danh Thiếp Số VIP QR 3D Gyroscope & Mã Số May Mắn](#4-the-doanh-nhan-so-3d)
  - [5. Danh Bạ Đồng Niên 1983 & Bộ Lọc Ngành Nghề Thông Minh](#5-danh-ba-dong-nien)
  - [6. Đặt Lịch Hẹn Kết Nối 1-on-1 trong 3 Kịch Bản & Tự Động Nhắn Tin](#6-hen-gap-1on1)
  - [7. Đăng Ký Sự Kiện, Vé Điện Tử E-Ticket QR & Biểu Quyết Trực Tiếp (Live Voting)](#7-ve-su-kien-voting)
  - [8. Giao Thương B2B: Đăng Tin (Công Khai / Chỉ Định) & Đàm Phán Deal Theo % Lời Nhất](#8-deal-b2b)
  - [9. Mua Sắm Nội Khối Trên Sàn Thương Mại Điện Tử Doanh Nhân 1983](#9-san-tmdt)
  - [10. Bảng Tin Mạng Lưới: Đăng Bài QR, Quét QR Tham Gia Họp, Bình Luận Cây 3 Cấp & Tag `@`](#10-mang-luoi-feed)
  - [11. Nhắn Tin Trực Tiếp & Gọi Điện Trao Đổi Cơ Hội Giao Thương](#11-tin-nhan-chat)
  - [12. Nộp Hội Phí Trực Tuyến Qua Mã QR Ngân Hàng Napas247 / MoMo / VNPay](#12-nop-hoi-phi-app)
  - [13. Báo Cáo Thống Kê Cá Nhân & Hiệp Hội Chuẩn Hóa 2 Cột (Số Lượng & Giá Trị)](#13-thong-ke-2-cot)
  - [14. Cài Đặt Bảo Mật Tinh Giản, Đổi Mật Khẩu, Nút Đăng Xuất & Chọn Màu Theme Swatches](#14-cai-dat-theme)

---

# PHẦN I: HƯỚNG DẪN QUẢN TRỊ VIÊN CỔNG WEB CRM ĐIỀU HÀNH TRUNG ƯƠNG
*(Dành cho Chủ tịch, Ban Thường trực, Ban Thư ký, Kế toán và Trưởng 6 Chuyên ban)*

---

<div id="1-tong-quan-crm"></div>

## 📌 MỤC LỤC TÀI LIỆU

1. [TỔNG QUAN HỆ THỐNG & ĐỊA CHỈ TRUY CẬP](#1-tổng-quan-hệ-thống--địa-chỉ-truy-cập)
2. [HƯỚNG DẪN ĐĂNG NHẬP & BẢO MẬT TÀI KHOẢN](#2-hướng-dẫn-đăng-nhập--bảo-mật-tài-khoản)
3. [BẢNG ĐIỀU KHIỂN TỔNG QUAN (EXECUTIVE DASHBOARD KPI)](#3-bảng-điều-khiển-tổng-quan-executive-dashboard-kpi)
4. [QUẢN TRỊ HỒ SƠ HỘI VIÊN & DOANH NGHIỆP THÀNH VIÊN](#4-quản-trị-hồ-sơ-hội-viên--doanh-nghiệp-thành-viên)
5. [QUẢN TRỊ SỰ KIỆN, HỘI THẢO & ĐIỂM DANH QR CODE TỐC ĐỘ CAO](#5-quản-trị-sự-kiện-hội-thảo--điểm-danh-qr-code-tốc-độ-cao)
6. [ĐIỀU PHỐI CUỘC HỌP 6 BAN & BIỂU QUYẾT TRỰC TUYẾN](#6-điều-phối-cuộc-họp-6-ban--biểu-quyết-trực-tuyến)
7. [QUẢN TRỊ TÀI CHÍNH, HỘI PHÍ & BÁO CÁO MINH BẠCH](#7-quản-trị-tài-chính-hội-phí--báo-cáo-minh-bạch)
8. [QUẢN LÝ NHÀ TÀI TRỢ, GÓI TÀI TRỢ & ĐẶC QUYỀN HỘI VIÊN](#8-quản-lý-nhà-tài-trợ-gói-tài-trợ--đặc-quyền-hội-viên)
9. [SÀN GIAO THƯƠNG B2B MARKETPLACE & KIỂM DUYỆT SẢN PHẨM](#9-sàn-giao-thương-b2b-marketplace--kiểm-duyệt-sản-phẩm)
10. [TRUYỀN THÔNG, BẢN TIN HIỆP HỘI & EMAIL MARKETING TẬP TRUNG](#10-truyền-thông-bản-tin-hiệp-hội--email-marketing-tập-trung)
11. [MA TRẬN PHÂN QUYỀN RBAC 5 ROLE & GIAO VIỆC TỰ ĐỘNG THÔNG BÁO](#11-ma-trận-phân-quyền-rbac-5-role--giao-việc-tự-động-thông-báo)
12. [QUY TRÌNH ĐỐI SOÁT THỦ CÔNG & XỬ LÝ SỰ CỐ (TROUBLESHOOTING)](#12-quy-trình-đối-soát-thủ-công--xử-lý-sự-cố-troubleshooting)

---

# 1. TỔNG QUAN HỆ THỐNG & ĐỊA CHỈ TRUY CẬP

### 1.1. Sứ mệnh Nền tảng
Hệ thống Web CRM Quản trị Hiệp hội CLB Doanh Nhân CEO 1983 là cổng điều hành trực tuyến tập trung, giúp Ban Chấp Hành, Ban Thư Ký và Kế Toán quản lý minh bạch toàn bộ vòng đời hội viên: từ tiếp nhận đăng ký trực tuyến, thẩm định kết nạp, thu hội phí thường niên, tổ chức sự kiện quy mô lớn, kết nối giao thương B2B đến phân quyền vận hành 6 Ban chuyên môn.

### 1.2. Thông số Kỹ thuật & Địa chỉ Truy cập
| Thông số Kỹ thuật | Giá trị Thực tế Máy chủ Dev | Ghi chú Vận hành |
|:---|:---|:---|
| **Cổng Web CRM Quản trị** | `https://14.225.217.232:5443` | Sử dụng giao thức HTTPS bảo mật |
| **Màn hình Đăng nhập riêng** | `https://14.225.217.232:5443/auth` | Card đăng nhập Admin độc lập |
| **Backend API NestJS** | `https://14.225.217.232:5443/api` | Kết nối CSDL PostgreSQL qua PgBouncer 6432 |
| **Công nghệ Frontend** | React 19, TanStack Router, TailwindCSS 4 | Giao diện Xanh Navy (#003B95) và Amber Gold (#D97706) |
| **Tài khoản Quản trị tối cao** | `admin@connect.vn` | Vai trò: **Quản trị (Cấp cao nhất)** |

---

# 2. HƯỚNG DẪN ĐĂNG NHẬP & BẢO MẬT TÀI KHOẢN

### 2.1. Truy cập Màn hình Đăng nhập
1. Mở trình duyệt Web (Google Chrome, Microsoft Edge hoặc Safari khuyến nghị).
2. Nhập liên kết: `https://14.225.217.232:5443/auth`.
3. Nếu trình duyệt hiện thông báo bảo mật (chứng chỉ SSL tự cấp phát trên server dev), bấm chọn **"Nâng cao" (Advanced)** ➔ Chọn **"Tiếp tục truy cập 14.225.217.232 (không an toàn)"**.
4. Màn hình đăng nhập quản trị Xanh Navy - Trắng sang trọng sẽ xuất hiện.

![Màn hình Đăng nhập Hệ thống Quản trị CRM CEO 1983](images/evidence/crm1983_01_login.png)
*Hình 2.1: Giao diện Đăng nhập Hệ thống Quản trị Web CRM CEO 1983 chuẩn Classic Navy & Gold*

### 2.2. Các bước Thực hiện Thao tác Đăng nhập
- **Bước 1**: Nhập địa chỉ Email hoặc Mã tài khoản quản trị vào ô **Email / Tên đăng nhập** (Ví dụ: `admin@connect.vn`).
- **Bước 2**: Nhập mật khẩu quản trị vào ô **Mật khẩu** (Ví dụ: `123456`). Có thể bấm icon con mắt bên phải để kiểm tra mật khẩu đã nhập.
- **Bước 3**: Tích chọn **"Ghi nhớ đăng nhập"** nếu sử dụng máy tính cá nhân.
- **Bước 4**: Bấm nút **"Đăng nhập Hệ thống"**. Hệ thống kiểm tra JWT Session Token và tự động chuyển hướng vào Trang chủ Dashboard.

---

# 3. BẢNG ĐIỀU KHIỂN TỔNG QUAN (EXECUTIVE DASHBOARD KPI)

Sau khi đăng nhập thành công, hệ thống chuyển thẳng đến Bảng điều khiển Tổng quan tại tuyến đường `/` hoặc `/dashboard`.

![Bảng điều khiển Tổng quan Dashboard KPI CRM CEO 1983](images/evidence/crm1983_02_dashboard_overview.png)
*Hình 3.1: Bảng điều khiển Tổng quan Dashboard KPI CRM hiển thị các chỉ số tài chính, hội viên và sự kiện*

### 3.1. Các Khối Chỉ số KPI Chiến lược (Top Metrics)
1. **Tổng số Hội viên Chính thức**: Số lượng doanh nhân 1983 đã kích hoạt tài khoản và đang hoạt động.
2. **Hội viên Mới Tiếp nhận**: Các hồ sơ gửi từ form đăng ký trực tuyến chờ Ban Thư ký thẩm định.
3. **Tổng Doanh thu & Quỹ Hiệp hội**: Tổng thu từ Hội phí, Tài trợ và Vé sự kiện đã đối soát gạch nợ.
4. **Sự kiện Sắp diễn ra**: Lịch họp Ban Chấp Hành, Gala xúc tiến thương mại và Hội thảo chuyên đề.

### 3.2. Biểu đồ Tăng trưởng & Dòng tiền Minh bạch
- **Biểu đồ Cột Doanh thu theo Tháng**: So sánh chỉ số Thu - Chi thực tế và thặng dư quỹ hiệp hội.
- **Biểu đồ Cơ cấu Hội viên theo 6 Ban chuyên môn**: Thống kê tỷ lệ phân bổ nhân sự vào Ban Quản trị, Thư ký, Thành viên, Xúc tiến thương mại, Truyền thông, Thiện nguyện.
- **Dòng Hoạt động Thời gian thực (Activity Log)**: Ghi nhận từng giao dịch thu phí, check-in sự kiện và thao tác phê duyệt của Quản trị viên.

---

# 4. QUẢN TRỊ HỒ SƠ HỘI VIÊN & DOANH NGHIỆP THÀNH VIÊN

Tuyến đường chức năng: `/members` và `/companies`.

![Quản lý Danh bạ Hội viên CRM CEO 1983](images/evidence/crm1983_03_members_management.png)
*Hình 4.1: Giao diện Quản lý Danh bạ Hội viên CLB CEO 1983 với bộ lọc phân loại và trạng thái*

### 4.1. Quy trình 4 Bước Thẩm định & Kết nạp Hội viên Mới
1. **Bước 1 - Tiếp nhận hồ sơ**: Khi doanh nhân gửi thông tin từ Landing Page, hệ thống tự động lưu vào danh sách với trạng thái **"Chờ duyệt" (Pending)**.
2. **Bước 2 - Xem xét hồ sơ 360°**: Quản trị viên bấm nút **"Xem chi tiết"** trên dòng hội viên để mở Drawer thông tin đa chiều.

![Drawer Xem Chi tiết Hồ sơ Hội viên 360 độ](images/evidence/crm1983_04_member_detail_drawer.png)
*Hình 4.2: Drawer chi tiết hồ sơ hội viên 360° hiển thị đầy đủ thông tin cá nhân, doanh nghiệp và chức danh*

3. **Bước 3 - Phê duyệt kết nạp**:
   - Quản trị viên kiểm tra tính xác thực về năm sinh (1983), giấy phép kinh doanh và chức danh C-Level.
   - Bấm nút **"Phê duyệt Hội viên"**. Hệ thống tự động gán mã hội viên tuần tự (`M1983-001`, `M1983-002`,...), cập nhật trạng thái **"Đang hoạt động" (Active)** và kích hoạt quyền truy cập App Di Động.
4. **Bước 4 - Phân ban & Cấp thẻ**: Gán hội viên vào 1 trong 6 Ban chuyên môn và phát hành thẻ hội viên điện tử 3D.

### 4.2. Quản lý Doanh nghiệp Thành viên (`/companies`)
Hệ thống cung cấp danh bạ pháp nhân doanh nghiệp thuộc sở hữu của các hội viên:
- Tìm kiếm nhanh theo Mã số thuế, Tên công ty, Ngành nghề kinh doanh.
- Quản trị quy mô nhân sự, vốn điều lệ, địa chỉ trụ sở và năng lực cung ứng sản phẩm.
- Liên kết 1-nhiều giữa Hội viên và các Công ty trực thuộc.

![Quản lý Doanh nghiệp Thành viên CRM CEO 1983](images/evidence/crm1983_05_companies_management.png)
*Hình 4.3: Quản lý Doanh nghiệp Thành viên CLB Doanh Nhân CEO 1983*

---

# 5. QUẢN TRỊ SỰ KIỆN, HỘI THẢO & ĐIỂM DANH QR CODE TỐC ĐỘ CAO

Tuyến đường chức năng: `/events`, `/event-registrations`, `/checkin-qr`.

![Danh sách Sự kiện & Hội thảo CRM CEO 1983](images/evidence/crm1983_06_events_list.png)
*Hình 5.1: Danh sách Quản lý Sự kiện & Hội thảo Hiệp hội*

### 5.1. Quy trình Tạo Sự kiện Mới (Event Wizard)
1. Truy cập `/events` ➔ Bấm nút **"+ Tạo sự kiện mới"**.
2. Modal Wizard 3 bước thông minh xuất hiện:
   - **Bước 1 - Thông tin cơ bản**: Nhập Tên sự kiện, Thời gian bắt đầu/kết thúc, Địa điểm tổ chức (Khách sạn / Trung tâm hội nghị / Trực tuyến), Tải lên Banner ảnh bìa sắc nét.
   - **Bước 2 - Phân loại Vé & Giá vé**:
     + Cấu hình loại vé: **Vé Hội viên thường (Miễn phí)**, **Vé VIP**, **Vé Khách mời Doanh nghiệp**.
     + Ô nhập Giá vé tích hợp bộ tự động định dạng phân cách hàng nghìn `FormattedCurrencyInput` (Ví dụ gõ `1000000` tự động hiển thị `1.000.000 đ` mà không nhảy con trỏ chuột).
     + Giới hạn số lượng vé phát hành.
   - **Bước 3 - Cấu hình Quyền lợi & Nhà tài trợ**: Đính kèm danh sách tài trợ Kim Cương, Vàng, Bạc hiển thị trên vé.
3. Bấm **"Xuất bản Sự kiện"**. Sự kiện lập tức hiển thị đồng bộ lên App Hiệp hội của toàn thể hội viên.

![Modal Tạo Sự kiện Mới Thông Minh](images/evidence/crm1983_07_event_create_modal.png)
*Hình 5.2: Modal Tạo Sự kiện mới với phân loại vé và giá vé định dạng chuẩn*

### 5.2. Màn hình Standee QR Check-in Điểm danh Tốc độ cao (`/checkin-qr`)
- Hệ thống tự sinh mã QR sự kiện chất lượng cao dành riêng cho Lễ tân đón tiếp.
- Khách mới quét mã QR bằng camera điện thoại/Zalo để mở trang đăng ký nhanh:
  + Nếu sự kiện **Có phí**: Tự động hiển thị Template Mã QR Ngân Hàng Napas MB Bank `1983000000` kèm cú pháp `EV[MÃ_VÉ] [SĐT]`.
  + Nếu sự kiện **Miễn phí**: Nhận ngay Vé điện tử E-Ticket và mã QR điểm danh cùng số Lucky Draw.
- Ban Lễ tân sử dụng máy quét hoặc App di động quét mã vé của người tham dự; hệ thống gạch điểm danh dưới 0.5 giây và cập nhật sĩ số trực tiếp lên màn hình lớn.

![Màn hình Check-in Điểm danh QR Đón tiếp](images/evidence/crm1983_08_event_checkin_qr.png)
*Hình 5.3: Màn hình Standee QR Check-in Điểm danh và Đón tiếp Đại biểu*

---

# 6. ĐIỀU PHỐI CUỘC HỌP 6 BAN & BIỂU QUYẾT TRỰC TUYẾN

Tuyến đường chức năng: `/meetings` và `/voting`.

### 6.1. Quản lý Lịch họp & Đặt phòng họp Đa nền tảng (`/meetings`)
- **Phân quyền tạo cuộc họp**: Chỉ đúng 4 vai trò có quyền tạo lịch họp: **Quản trị**, **Admin**, **Tổng thư ký**, **Trưởng ban**.
- **Quy trình Quản trị phê duyệt**: Khi Tổng thư ký hoặc Trưởng ban tạo cuộc họp, trạng thái khởi tạo là **"Chờ Quản trị duyệt" (pending_approval)**. Quản trị viên bấm nút **"Duyệt Cuộc Họp"** để kích hoạt thông báo gửi tới các đại biểu.
- **Hình thức phòng họp**: Tích hợp Dropdown đa nền tảng linh hoạt: Zoom Meeting, Google Meet, UniWork Hub, Sapphire Hall, hoặc Địa điểm Offline khác.

![Lịch họp Điều phối 6 Ban Chuyên Môn](images/evidence/crm1983_09_meetings_calendar.png)
*Hình 6.1: Quản lý Lịch họp Điều phối Ban Chấp Hành & 6 Ban Chuyên Môn*

### 6.2. Quản lý Biểu quyết & Bầu cử Đại hội Trực tuyến (`/voting`)
- Tạo kỳ biểu quyết thông qua Nghị quyết Hiệp hội hoặc Bầu cử Ban Chấp Hành nhiệm kỳ mới.
- Thiết lập thời hạn mở/đóng hòm phiếu điện tử.
- Bỏ phiếu kín mã hóa một chiều: Mỗi hội viên chỉ được biểu quyết 1 lần duy nhất; kết quả thống kê theo thời gian thực với biểu đồ % đồng thuận minh bạch.

![Quản lý Biểu quyết Bầu cử Đại hội](images/evidence/crm1983_10_voting_management.png)
*Hình 6.2: Quản lý Biểu quyết & Bầu cử Đại hội Trực tuyến*

---

# 7. QUẢN TRỊ TÀI CHÍNH, HỘI PHÍ & BÁO CÁO MINH BẠCH

Tuyến đường chức năng: `/fees`, `/income`, `/expenses`, `/finance-report`.

### 7.1. Quản lý Hội phí Thường niên (`/fees`)
- Theo dõi danh sách hội viên theo kỳ hạn đóng phí: **Đã nộp**, **Chờ thanh toán**, **Quá hạn**.
- Khi hội viên quét mã QR ngân hàng trên App chuyển khoản vào tài khoản MB Bank `1983000000`, Kế toán đối soát sao kê ngân hàng và bấm nút **"Xác nhận Thu Phí (+1 Năm)"**; hệ thống tự động cộng 365 ngày vào hạn sử dụng thẻ hội viên và gửi thông báo chúc mừng.

![Quản lý Hội phí Thường niên CRM CEO 1983](images/evidence/crm1983_11_fees_management.png)
*Hình 7.1: Quản lý Hội phí Thường niên & Đối soát Gạch nợ*

### 7.2. Quản lý Danh mục Thu & Xuất Hóa đơn (`/income`)
- Ghi nhận tất cả các nguồn thu vào ngân sách hiệp hội: Thu hội phí, Thu tài trợ sự kiện, Thu bán vé hội thảo, Thu phí quảng cáo B2B.
- Tự động sinh mã phiếu thu (`PT-2026-xxxx`) và lưu vết người lập phiếu.

![Quản trị Danh mục Thu Tài chính](images/evidence/crm1983_12_income_management.png)
*Hình 7.2: Quản lý Danh mục Thu Tài chính & Phiếu thu*

### 7.3. Quản lý Chi Ngân sách & Hóa đơn Chứng từ (`/expenses`)
- Quản trị ngân sách chi tiêu cho các hoạt động: Tổ chức Gala, Thuê địa điểm, Quà tặng đại hội, Hoạt động thiện nguyện, Công tác truyền thông.
- Kèm tệp đính kèm hóa đơn VAT, phiếu chi và chữ ký duyệt của Trưởng ban Tài chính / Quản trị viên.

![Quản lý Chi Ngân sách Hoạt động](images/evidence/crm1983_13_expenses_management.png)
*Hình 7.3: Quản lý Chi Ngân sách Hoạt động & Duyệt chứng từ*

### 7.4. Báo cáo Tài chính Đa chiều (`/finance-report`)
- Biểu đồ Dòng tiền ròng (Net Cashflow) theo từng quý/tháng.
- Báo cáo phân bổ chi phí minh bạch theo từng Ban chuyên môn.
- Cho phép xuất khẩu Báo cáo Tài chính sang định dạng Excel phục vụ Đại hội toàn thể.

![Báo cáo Tài chính Minh bạch CRM CEO 1983](images/evidence/crm1983_14_finance_report.png)
*Hình 7.4: Báo cáo Tài chính Minh bạch & Biểu đồ Dòng tiền Quỹ Hiệp hội*

---

# 8. QUẢN LÝ NHÀ TÀI TRỢ, GÓI TÀI TRỢ & ĐẶC QUYỀN HỘI VIÊN

Tuyến đường chức năng: `/sponsors`, `/sponsor-packages`, `/benefits`, `/perks`.

### 8.1. Quản lý Nhà Tài Trợ & Hạng mục Hợp tác (`/sponsors`)
- Danh bạ các thương hiệu, doanh nghiệp tài trợ cho CLB CEO 1983.
- Phân nhóm gói tài trợ: **Nhà tài trợ Kim Cương**, **Nhà tài trợ Vàng**, **Nhà tài trợ Bạc**, **Nhà tài trợ Đồng hành**.
- Theo dõi tiến độ giải ngân kinh phí tài trợ và bàn giao quyền lợi truyền thông (Logo trên Standee, Phóng sự bài viết, Vị trí VIP Gala).

![Quản lý Nhà Tài Trợ & Gói Tài Trợ](images/evidence/crm1983_15_sponsors_management.png)
*Hình 8.1: Quản lý Nhà Tài Trợ & Phân bổ Gói Tài Trợ Hiệp hội*

### 8.2. Quản lý Quyền lợi & Kho Đặc quyền Doanh nghiệp (`/benefits`, `/perks`)
- Cấu hình các đặc quyền ưu đãi dành riêng cho hội viên chính thức: Giảm giá dịch vụ khách sạn, ưu đãi vận chuyển logistics, tư vấn pháp lý miễn phí từ các doanh nghiệp thành viên.
- Duyệt và phát hành mã voucher ưu đãi lên App Hội viên.

![Quản lý Quyền lợi & Đặc quyền Hội viên](images/evidence/crm1983_16_benefits_perks.png)
*Hình 8.2: Quản lý Quyền lợi & Kho Đặc quyền Doanh nghiệp*

---

# 9. SÀN GIAO THƯƠNG B2B MARKETPLACE & KIỂM DUYỆT SẢN PHẨM

Tuyến đường chức năng: `/marketplace`.

![Quản trị Sàn Giao thương B2B Marketplace](images/evidence/crm1983_17_marketplace_b2b.png)
*Hình 9.1: Quản trị Sàn Giao thương B2B Marketplace & Kiểm duyệt Sản phẩm*

### 9.1. Vai trò của Sàn B2B Nội bộ
Sàn B2B CEO 1983 là kênh kết nối giao thương trực tiếp giữa các doanh nghiệp thành viên, thúc đẩy phương châm "Người 1983 ưu tiên dùng hàng 1983".

### 9.2. Quy trình Kiểm duyệt Sản phẩm/Dịch vụ
1. Hội viên đăng ký sản phẩm thế mạnh từ App di động.
2. Sản phẩm hiển thị trong hàng đợi **"Chờ duyệt"** trên Web CRM.
3. Ban Xúc tiến Thương mại kiểm tra: Giấy chứng nhận chất lượng, Nguồn gốc xuất xứ, Mức chiết khấu ưu đãi cho hội viên.
4. Bấm **"Phê duyệt niêm yết"**: Sản phẩm xuất hiện ngay lập tức trên Sàn Marketplace chuẩn Shopee của App di động với đầy đủ đánh giá % uy tín công ty.

---

# 10. TRUYỀN THÔNG, BẢN TIN HIỆP HỘI & EMAIL MARKETING TẬP TRUNG

Tuyến đường chức năng: `/news` và `/email-marketing`.

### 10.1. Quản lý Tin tức & Phóng sự Hoạt động (`/news`)
- Soạn thảo và xuất bản các bài viết phóng sự: Vinh danh doanh nhân tiêu biểu tháng, Tin tức hoạt động thiện nguyện, Kỷ yếu đại hội.
- Hỗ trợ trình soạn thảo văn bản đa phương tiện (Rich Text Editor), chèn hình ảnh và video HD.

![Quản lý Tin tức & Phóng sự Hiệp hội](images/evidence/crm1983_18_news_announcements.png)
*Hình 10.1: Quản lý Tin tức & Phóng sự Hoạt động Hiệp hội*

### 10.2. Cổng Email Marketing & Thông báo Đẩy Tập trung (`/email-marketing`)
- Soạn thảo chiến dịch email thông báo gửi tự động tới danh sách toàn thể hội viên hoặc lọc theo từng Ban chuyên môn.
- Tích hợp các mẫu Template HTML thiết kế sang trọng: Thư mời họp Ban Chấp Hành, Thông báo gia hạn hội phí, Thư chúc mừng sinh nhật hội viên.

![Cổng Email Marketing Tập trung](images/evidence/crm1983_19_email_marketing.png)
*Hình 10.2: Cổng Email Marketing & Thông báo Tập trung*

---

# 11. MA TRẬN PHÂN QUYỀN RBAC 5 ROLE & GIAO VIỆC TỰ ĐỘNG THÔNG BÁO

Tuyến đường chức năng: `/permissions` và `/tasks`.

![Ma trận Phân quyền RBAC 5 Role & 6 Ban Chuyên Môn](images/evidence/crm1983_20_rbac_permissions.png)
*Hình 11.1: Ma trận Phân quyền RBAC 5 Role cố định & Phân bổ 6 Ban Chuyên Môn*

### 11.1. Ma trận Phân quyền 5 Role Chuẩn hóa
Hệ thống cố định duy nhất đúng 5 vai trò hệ thống (đã loại bỏ Platform Admin, Quản trị là quyền to nhất):
1. **Quản trị (`quan_tri`)**: Toàn quyền cấu hình hệ thống, duyệt hội viên, phê duyệt cuộc họp và quản trị tài chính.
2. **Admin (`admin`)**: Quản trị vận hành sự kiện, tin tức và phê duyệt sản phẩm marketplace.
3. **Tổng thư ký (`tong_thu_ky`)**: Điều phối công việc, tạo lịch họp, gửi thông báo và quản lý danh bạ.
4. **Trưởng ban (`truong_ban`)**: Quản lý thành viên thuộc Ban phụ trách, đề xuất ngân sách và tạo lịch họp Ban.
5. **Thành viên (`member`)**: Quyền xem danh bạ, tham gia sự kiện, đăng sản phẩm và đóng hội phí.

### 11.2. Phân bổ theo 6 Ban Chuyên Môn
- Ban Quản trị
- Ban Thư ký
- Ban Thành viên
- Ban Xúc tiến thương mại
- Ban Truyền thông
- Ban Thiện nguyện

### 11.3. Cơ chế Giao việc Tự động Bắn Thông báo (Task Workflow)
- Khi Quản trị viên hoặc Trưởng ban tạo công việc tại `/tasks` và chọn người thực hiện từ danh bạ hội viên:
- Backend tự động đối soát `user_id` trong PostgreSQL và ghi đồng thời vào 2 bảng CSDL:
  + `public.business_notifications`: Hiển thị icon chuông trên Web CRM Quản trị.
  + `public.member_notifications`: Bắn thông báo đẩy tức thì lên App Di Động của người nhận.

---

# 12. QUY TRÌNH ĐỐI SOÁT THỦ CÔNG & XỬ LÝ SỰ CỐ (TROUBLESHOOTING)

### 12.1. Quy trình Đối soát Gạch nợ Hội phí Mã QR Ngân Hàng
1. **Bước 1**: Hội viên chuyển khoản quét mã QR ngân hàng MB Bank `1983000000` với cú pháp `HP[MÃ_HV] [SĐT]`.
2. **Bước 2**: Kế toán mở màn hình `/fees`, đối chiếu mã giao dịch trên sao kê ngân hàng với danh sách chờ.
3. **Bước 3**: Bấm nút **"Xác nhận Đã nộp"**. Hệ thống cập nhật trạng thái hóa đơn thành `PAID`, gia hạn thời hạn hội viên thêm 1 năm và gửi thông báo xác nhận thành công.

### 12.2. Xử lý Lỗi Đăng nhập hoặc Quên Mật khẩu
- Nếu tài khoản báo lỗi sai thông tin đăng nhập: Kiểm tra xem đã nhập đúng định dạng email hoặc mã hội viên chưa.
- Để cấp lại mật khẩu: Quản trị viên truy cập `/members`, mở Drawer hội viên và bấm nút **"Đặt lại mật khẩu mặc định (123456)"**. Hội viên đăng nhập lại và được yêu cầu đổi mật khẩu mới.

---
*Tài liệu được biên soạn và chuẩn hóa phục vụ công tác bàn giao nghiệm thu CLB Doanh Nhân CEO 1983.*


---

# PHẦN II: HƯỚNG DẪN HỘI VIÊN SỬ DỤNG ỨNG DỤNG DI ĐỘNG CEO 1983 MOBILE APP
*(Dành cho toàn thể Hội viên chính thức CLB Doanh Nhân CEO 1983)*

---

<div id="1-cai-dat-app"></div>

## 📌 MỤC LỤC TÀI LIỆU

1. [TỔNG QUAN ỨNG DỤNG & CÁC NỀN TẢNG HỖ TRỢ](#1-tổng-quan-ứng-dụng--các-nền-tảng-hỗ-trợ)
2. [HƯỚNG DẪN CÀI ĐẶT & ĐĂNG NHẬP ỨNG DỤNG](#2-hướng-dẫn-cài-đặt--đăng-nhập-ứng-dụng)
3. [TRANG CHỦ HỘI VIÊN (EXECUTIVE HOME FEED)](#3-trang-chủ-hội-viên-executive-home-feed)
4. [DANH BẠ HỘI VIÊN 360° & KẾT NỐI ĐỒNG NIÊN](#4-danh-bạ-hội-viên-360-kết-nối-đồng-niên)
5. [thẻ hội viên điện tử 3D GYROSCOPE & DANH THIẾP SỐ DOANH NHÂN](#5-thẻ-hội-viên-vip-3d-gyroscope--danh-thiếp-số-doanh-nhân)
6. [SỰ KIỆN CLB, VÉ ĐIỆN TỬ E-TICKET & QUÉT MÃ CHECK-IN](#6-sự-kiện-clb-vé-điện-tử-e-ticket--quét-mã-check-in)
7. [TRA CỨU & NỘP HỘI PHÍ THƯỜNG NIÊN MÃ QR NGÂN HÀNG NAPAS 24/7](#7-tra-cứu--nộp-hội-phí-thường-niên-mã QR ngân hàng-napas-247)
8. [SÀN GIAO THƯƠNG B2B MARKETPLACE CHUẨN SHOPEE](#8-sàn-giao-thương-b2b-marketplace-chuẩn-shopee)
9. [KHO ĐẶC QUYỀN DOANH NGHIỆP & ƯU ĐÃI NỘI BỘ](#9-kho-đặc-quyền-doanh-nghiệp--ưu-đãi-nội-bộ)
10. [BẢNG TIN TỨC HIỆP HỘI, BIỂU QUYẾT ĐẠI HỘI & LỊCH HỌP](#10-bảng-tin-tức-hiệp-hội-biểu-quyết-đại-hội--lịch-họp)
11. [HỘP THƯ TRAO ĐỔI BAN THƯ KÝ & CHỈNH SỬA HỒ SƠ](#11-hộp-thư-trao-đổi-ban-thư-ký--chỉnh-sửa-hồ-sơ)
12. [CÂU HỎI THƯỜNG GẶP (FAQ) & XỬ LÝ SỰ CỐ DI ĐỘNG](#12-câu-hỏi-thường-gặp-faq--xử-lý-sự-cố-di-động)

---

# 1. TỔNG QUAN ỨNG DỤNG & CÁC NỀN TẢNG HỖ TRỢ

### 1.1. Sứ mệnh Ứng dụng Di động CEO 1983
Ứng dụng di động CLB Doanh Nhân CEO 1983 là cầu nối trực tuyến bỏ túi dành riêng cho các doanh nhân sinh năm 1983 (Quý Hợi). Ứng dụng chuẩn hóa theo **Phong cách Phiên bản 1 (Classic Navy & Gold)**: Sắc xanh hoàng gia Deep Cobalt Navy kết hợp viền ánh kim Warm Amber Gold sang trọng.

### 1.2. Các Phương thức Trải nghiệm Đa nền tảng
- **PWA Mobile Web**: Mở trực tiếp trên trình duyệt Safari (iOS) hoặc Chrome (Android) tại địa chỉ: `https://14.225.217.232:5444/association`.
- **Ứng dụng Native Android (.APK)**: Tải và cài đặt trực tiếp gói cài đặt không cần qua Google Play Store. Tích hợp đầy đủ phần cứng: Rung haptic, Đọc/Ghi thẻ NFC 1-chạm, Quét Camera QR Code đón tiếp sự kiện.
- **Ứng dụng Apple iOS**: Đang chạy bản phân phối thử nghiệm TestFlight.

---

# 2. HƯỚNG DẪN CÀI ĐẶT & ĐĂNG NHẬP ỨNG DỤNG

### 2.1. Cài đặt Ứng dụng lên Màn hình chính (PWA)
1. Dùng trình duyệt di động truy cập: `https://14.225.217.232:5444/association`.
2. **Trên iPhone (Safari)**: Bấm nút Chia sẻ (biểu tượng hình vuông có mũi tên chỉ lên) ➔ Chọn **"Thêm vào MH chính" (Add to Home Screen)**.
3. **Trên Android (Chrome)**: Bấm dấu 3 chấm góc phải ➔ Chọn **"Cài đặt ứng dụng"** hoặc **"Thêm vào màn hình chính"**.
4. Biểu tượng ứng dụng với Logo dập nổi vàng CEO 1983 xuất hiện trên màn hình điện thoại như ứng dụng native.

### 2.2. Đăng nhập Ứng dụng Hội viên
1. Mở ứng dụng hoặc truy cập đường dẫn: `https://14.225.217.232:5444/association/login`.

![Màn hình Đăng nhập App Hội viên CEO 1983](images/evidence/app1983_01_login.png)
*Hình 2.1: Màn hình Đăng nhập App Hội viên CEO 1983 chuẩn Classic Navy & Gold*

2. **Các bước đăng nhập chi tiết**:
   - Nhập **Email hoặc Mã hội viên** (Ví dụ: `admin@connect.vn` hoặc `M1983-001`) vào ô tài khoản.
   - Nhập **Mật khẩu** khởi tạo (Mặc định: `123456`).
   - Tích chọn **"Ghi nhớ đăng nhập"** để tự động lưu phiên làm việc.
   - Bấm nút **"Đăng nhập"** màu Xanh Navy nổi bật.
   - Nếu đăng nhập lần đầu, ứng dụng sẽ gợi ý đổi mật khẩu để bảo vệ tài khoản hội viên.

---

# 3. TRANG CHỦ HỘI VIÊN (EXECUTIVE HOME FEED)

Sau khi đăng nhập, hội viên bước vào không gian trang chủ điều hành độc quyền tại `/association`.

![Trang chủ Hội viên CLB CEO 1983](images/evidence/app1983_02_home_feed.png)
*Hình 3.1: Giao diện Trang chủ Hội viên với thẻ hội viên điện tử Gold mạ vàng và các lối tắt tiện ích*

### 3.1. Các Thành phần Giao diện Trang chủ
1. **Header Chào mừng Doanh nhân**: Hiển thị họ tên, chức danh C-Level và ảnh đại diện có tích xanh hội viên chính thức.
2. **thẻ hội viên điện tử Gold Tương tác**: Thẻ hiển thị mã số hội viên (`M1983-001`), hạn hội phí, mã QR định danh và logo doanh nghiệp của hội viên được lồng khung kính mờ sắc nét.
3. **Thanh Lối tắt Tiện ích Nhanh (Quick Actions)**:
   - **Thẻ 3D**: Mở thẻ hội viên 3D có cảm biến con quay gyroscope.
   - **Danh bạ**: Mở danh sách kết nối toàn thể hội viên đồng niên.
   - **Sự kiện**: Xem lịch hội thảo và vé tham gia.
   - **Hội phí**: Quét mã QR ngân hàng gia hạn hội phí thường niên.
4. **Bảng tin Nổi bật & Sự kiện Sắp diễn ra**: Cập nhật các thông báo quan trọng nhất từ Ban Chấp Hành.

---

# 4. DANH BẠ HỘI VIÊN 360° & KẾT NỐI ĐỒNG NIÊN

Tuyến đường chức năng: `/association/members`.

![Danh bạ Hội viên CLB CEO 1983](images/evidence/app1983_03_members_directory.png)
*Hình 4.1: Danh bạ Hội viên CLB CEO 1983 với bộ lọc thông minh*

### 4.1. Tìm kiếm & Kết nối Doanh nhân Đồng niên
- Thanh tìm kiếm thông minh hỗ trợ gõ tìm theo: Họ và tên, Tên công ty, Ngành nghề thế mạnh hoặc Mã hội viên.
- Bộ lọc theo 6 Ban chuyên môn: Ban Quản trị, Thư ký, Thành viên, Xúc tiến thương mại, Truyền thông, Thiện nguyện.
- Mỗi card hội viên hiển thị: Ảnh chân dung doanh nhân, Tên công ty, Chức vụ và các nút tương tác nhanh: **Gọi điện thoại**, **Nhắn tin Zalo**, **Xem hồ sơ**.

### 4.2. Modal Chi tiết Hồ sơ Hội viên 360°
Bấm vào card bất kỳ để mở modal chi tiết:
- Thông tin cá nhân, ngày sinh 1983, tiểu sử và kinh nghiệm thương trường.
- Thông tin doanh nghiệp: Lĩnh vực kinh doanh, sản phẩm dịch vụ chủ lực, địa chỉ trụ sở và website.
- Nút **"Kết nối giao thương"**: Gửi lời mời kết nối 1-on-1 hoặc trao đổi danh thiếp số.

![Modal Chi tiết Hồ sơ Hội viên 360 độ](images/evidence/app1983_04_member_profile_modal.png)
*Hình 4.2: Modal Hồ sơ Hội viên 360° và thông tin doanh nghiệp thành viên*

---

# 5. thẻ hội viên điện tử 3D GYROSCOPE & DANH THIẾP SỐ DOANH NHÂN

Tuyến đường chức năng: `/association/card` và `/association/business-cards`.

### 5.1. thẻ hội viên điện tử 3D Gyroscope (`/association/card`)
- Ứng dụng công nghệ đồ họa 3D mô phỏng chất liệu thẻ kim loại mạ vàng sang trọng.
- Khi nghiêng điện thoại, hiệu ứng phản chiếu ánh sáng và con quay hồi chuyển (gyroscope) làm cho thẻ lấp lánh như thẻ vật lý thật.
- Mặt trước hiển thị: Logo dập nổi CEO 1983, Họ tên hội viên, Tên doanh nghiệp, Số thẻ và Hạn hiệu lực.
- Bấm vào thẻ để lật mặt sau: Hiển thị mã QR định danh cá nhân phục vụ check-in sự kiện và chia sẻ thông tin.

![thẻ hội viên điện tử 3D Gyroscope](images/evidence/app1983_05_vip_card_3d.png)
*Hình 5.1: thẻ hội viên điện tử 3D Gyroscope phản chiếu ánh sáng sang trọng*

### 5.2. Danh thiếp Số Doanh Nhân Digital Visit Card (`/association/business-cards`)
- Thay thế hoàn toàn danh thiếp giấy truyền thống: Không sợ rách, không sợ thất lạc và cập nhật thông tin tức thì.
- **Tính năng Chạm NFC**: Chạm lưng điện thoại vào điện thoại đối tác để mở ngay danh thiếp số trên trình duyệt đối tác mà đối tác không cần cài app.
- **Tính năng Lưu Danh bạ 1-Chạm**: Đối tác bấm nút "Lưu liên hệ" để tải tệp danh bạ (.VCF) tự động ghi đầy đủ Họ tên, SĐT, Email, Tên công ty vào điện thoại.

![Danh thiếp số Doanh nhân Digital Visit Card](images/evidence/app1983_06_digital_visit_card.png)
*Hình 5.2: Danh thiếp số Doanh nhân Digital Visit Card chia sẻ 1-chạm*

---

# 6. SỰ KIỆN CLB, VÉ ĐIỆN TỬ E-TICKET & QUÉT MÃ CHECK-IN

Tuyến đường chức năng: `/association/events` và `/association/checkin`.

### 6.1. Danh sách Sự kiện & Đăng ký Tham dự (`/association/events`)
- Lịch các chương trình giao lưu, họp mặt định kỳ, giải golf doanh nhân, caravan thiện nguyện và đại hội toàn thể.
- Xem chi tiết thời gian, địa điểm, diễn giả và quyền lợi tham gia.
- Bấm nút **"Đăng ký tham dự"**: Hệ thống ghi nhận và phát hành vé điện tử tức thì.

![Danh sách Sự kiện Hiệp hội CEO 1983](images/evidence/app1983_07_events_list.png)
*Hình 6.1: Danh sách Sự kiện, Hội thảo & Gala CLB CEO 1983*

### 6.2. Vé Điện tử VIP Pass E-Ticket & QR Check-in (`/association/checkin`)
- Vé điện tử được thiết kế tinh tế với dải màu Gold Navy sang trọng.
- Hiển thị đầy đủ: Mã số vé, Tên đại biểu, Hạng vé (VIP / Hội viên), Số ghế ngồi và **Số may mắn Lucky Draw** để bốc thăm trúng thưởng tại sự kiện.
- **Mã QR Check-in tốc độ cao**: Khi đến sảnh hội nghị, chỉ cần đưa màn hình vé cho Ban Lễ tân quét mã; hệ thống xác nhận check-in thành công chỉ trong 0.5 giây.

![Vé Điện tử VIP Pass E-Ticket & Mã QR Check-in](images/evidence/app1983_08_event_ticket_qr.png)
*Hình 6.2: Vé Điện tử VIP Pass E-Ticket và Mã QR Check-in cổng sự kiện*

---

# 7. TRA CỨU & NỘP HỘI PHÍ THƯỜNG NIÊN MÃ QR NGÂN HÀNG NAPAS 24/7

Tuyến đường chức năng: `/association/renew`.

![Màn hình Tra cứu & Nộp Hội phí Mã QR Ngân Hàng Napas](images/evidence/app1983_09_fees_mã QR ngân hàng.png)
*Hình 7.1: Màn hình Tra cứu & Nộp Hội phí Thường niên qua mã QR ngân hàng MB Bank*

### 7.1. Các bước Nộp Hội phí Thường niên bằng Mã QR Ngân Hàng
1. Truy cập mục **Hội phí** hoặc `/association/renew`.
2. Màn hình hiển thị: Số tiền hội phí niêm yết (Ví dụ: `5.000.000 đ / năm`), Ngày hết hạn hiện tại và Thông tin tài khoản tiếp nhận.
3. Hệ thống tạo **mã QR ngân hàng Napas 24/7 động**:
   - **Ngân hàng thụ hưởng**: MB Bank (Ngân hàng Quân Đội).
   - **Số tài khoản chính thức**: `1983000000`.
   - **Chủ tài khoản**: `CLB DOANH NHAN CEO 1983`.
   - **Cú pháp chuyển khoản tự động**: `HP[MÃ_HỘI_VIÊN] [SỐ_ĐIỆN_THOẠI]`.
4. Hội viên mở ứng dụng ngân hàng bất kỳ, quét mã QR ngân hàng và bấm xác nhận chuyển khoản.
5. Sau khi chuyển khoản thành công, hệ thống ghi nhận và chuyển trạng thái "Chờ kế toán gạch nợ"; khi kế toán duyệt, hạn thẻ sẽ tự động cộng thêm 12 tháng.

---

# 8. SÀN GIAO THƯƠNG B2B MARKETPLACE CHUẨN SHOPEE

Tuyến đường chức năng: `/association/products`.

![Sàn Giao thương B2B Marketplace Chuẩn Shopee](images/evidence/app1983_10_marketplace_shopee.png)
*Hình 8.1: Sàn Giao thương B2B Marketplace phong cách Shopee chuyên nghiệp*

### 8.1. Các Tính năng Đột phá của Sàn B2B CEO 1983
1. **Thanh Tìm kiếm & Bộ lọc Giá Thông minh**:
   - Icon bộ lọc bên trái cho phép sắp xếp theo: Giá từ thấp đến cao, Giá từ cao đến thấp, Hàng mới nhất.
   - Dải chip **"Danh mục gần đây đã chọn" (Recent categories)** ghi nhớ thói quen tìm kiếm của hội viên.
2. **Hệ thống Đánh giá Sao & Uy tín Doanh nghiệp**:
   - Mỗi sản phẩm hiển thị điểm đánh giá sao trung bình (Ví dụ: ⭐ 4.9) và số lượt đã giao dịch.
   - **Điểm uy tín công ty (% hài lòng)**: Tính minh bạch theo công thức: `[Tổng số sao nhận được / (Tổng lượt đánh giá * 5)] * 100%`.
3. **Modal Chi tiết Sản phẩm Shopee-style**:
   - Khối hồ sơ Shop của CEO đăng bán.
   - Bảng phân bổ đánh giá 1-5 sao và nhận xét thực tế từ các chủ doanh nghiệp trong CLB.
   - Nút **"Liên hệ báo giá B2B"** và **"Đặt mua ưu đãi hội viên"**.

---

# 9. KHO ĐẶC QUYỀN DOANH NGHIỆP & ƯU ĐÃI NỘI BỘ

Tuyến đường chức năng: `/association/perks`.

![Kho Đặc quyền Doanh nghiệp & Ưu đãi Nội bộ](images/evidence/app1983_11_perks_benefits.png)
*Hình 9.1: Kho Đặc quyền Doanh nghiệp & Mã ưu đãi dành riêng cho Hội viên*

### 9.1. Khám phá & Kích hoạt Ưu đãi Hội viên
- Danh mục voucher giảm giá từ 10% đến 50% cho các sản phẩm, dịch vụ cao cấp do các doanh nghiệp thành viên cung cấp: Nghỉ dưỡng resort, vé máy bay, dịch vụ logistics, thiết kế nội thất, phần mềm quản trị.
- Bấm **"Nhận ưu đãi"**: Hệ thống hiển thị mã code độc quyền hoặc liên kết trực tiếp tới người phụ trách để nhận giá ưu đãi nội bộ.

---

# 10. BẢNG TIN TỨC HIỆP HỘI, BIỂU QUYẾT ĐẠI HỘI & LỊCH HỌP

Tuyến đường chức năng: `/association/news`, `/association/voting`, `/association/meetings`.

### 10.1. Bản tin Hiệp hội (`/association/news`)
- Cập nhật liên tục các bài phóng sự, tin tức hoạt động kết nối, vinh danh hội viên và các hoạt động xã hội từ thiện của CLB Doanh Nhân CEO 1983.

![Bản tin Hoạt động CLB Doanh Nhân CEO 1983](images/evidence/app1983_12_news_feed.png)
*Hình 10.1: Bảng tin Hoạt động & Phóng sự Hiệp hội*

### 10.2. Biểu quyết Đại hội Trực tuyến (`/association/voting`)
- Tham gia biểu quyết các chủ trương lớn và bầu cử Ban Chấp Hành trực tuyến ngay trên điện thoại di động.
- Bỏ phiếu kín bảo mật tuyệt đối, mỗi hội viên 1 lá phiếu duy nhất và xem kết quả biểu quyết minh bạch.

![Biểu quyết Đại hội Trực tuyến](images/evidence/app1983_13_voting_online.png)
*Hình 10.2: Màn hình Biểu quyết Đại hội Trực tuyến trên App*

### 10.3. Lịch họp & Điều phối Ban Chuyên Môn (`/association/meetings`)
- Theo dõi lịch họp định kỳ của Ban Chấp Hành và Ban chuyên môn mà hội viên trực thuộc.
- Tham gia phòng họp trực tuyến (Zoom / Google Meet) chỉ bằng 1 nút bấm hoặc xem địa chỉ phòng họp offline.

![Lịch họp Ban Chấp Hành trên App](images/evidence/app1983_14_meetings_schedule.png)
*Hình 10.3: Lịch họp Ban Chấp Hành & Ban Chuyên Môn trên App*

---

# 11. HỘP THƯ TRAO ĐỔI BAN THƯ KÝ & CHỈNH SỬA HỒ SƠ

Tuyến đường chức năng: `/association/messages` và `/association/profile`.

### 11.1. Hộp thư Trao đổi với Ban Thư Ký (`/association/messages`)
- Kênh liên lạc trực tiếp, chính thống giữa hội viên và Ban Thư ký CLB.
- Gửi kiến nghị, đề xuất hợp tác, đăng ký tài trợ hoặc yêu cầu hỗ trợ kỹ thuật; Ban Thư ký tiếp nhận và phản hồi nhanh chóng.

![Hộp thư Trao đổi với Ban Thư Ký](images/evidence/app1983_15_messages_secretary.png)
*Hình 11.1: Hộp thư Trao đổi Trực tiếp với Ban Thư Ký CLB*

### 11.2. Trang Cá nhân & Chỉnh sửa Thông tin (`/association/profile`)
- Quản lý thông tin cá nhân: Họ tên, số điện thoại, email, địa chỉ, ảnh đại diện doanh nhân.
- Quản lý thông tin doanh nghiệp: Tên công ty, ngành nghề, logo doanh nghiệp hiển thị trên thẻ hội viên.
- Đổi mật khẩu đăng nhập và quản lý thiết bị đăng nhập.

![Trang Cá nhân & Cài đặt Hồ sơ Hội viên](images/evidence/app1983_16_profile_settings.png)
*Hình 11.2: Trang Cá nhân & Cài đặt Hồ sơ Doanh nhân*

---

# 12. CÂU HỎI THƯỜNG GẶP (FAQ) & XỬ LÝ SỰ CỐ DI ĐỘNG

### 12.1. Tôi quên mật khẩu đăng nhập App thì làm thế nào?
- Tại màn hình đăng nhập `/association/login`, bấm vào liên kết **"Quên mật khẩu?"** để nhận hướng dẫn cấp lại mật khẩu qua Email, hoặc liên hệ trực tiếp Ban Thư ký để được hỗ trợ reset mật khẩu về mặc định `123456`.

### 12.2. Làm thế nào để logo công ty hiển thị đẹp trên Thẻ Hội Viên?
- Vào mục **Hồ sơ** ➔ Bấm vào icon máy ảnh trên thẻ hội viên hoặc nút **"Đổi logo công ty"** ➔ Chọn ảnh logo có định dạng PNG nền trong suốt để hiển thị sang trọng nhất trên nền thẻ Gold Navy.

---
*Tài liệu được biên soạn và chuẩn hóa phục vụ toàn thể Hội viên CLB Doanh Nhân CEO 1983.*


---
*Tài liệu Cẩm nang Hướng dẫn Sử dụng Hệ thống Toàn diện được phát hành và bàn giao chính thức cho Ban Quản trị CLB Doanh Nhân CEO 1983 (HanoiBA).*
