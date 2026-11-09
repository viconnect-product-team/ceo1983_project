# HỆ SINH THÁI NỀN TẢNG SỐ CLB DOANH NHÂN CEO 1983 (HANOIBA)

## TÀI LIỆU ĐẶC TẢ YÊU CẦU PHẦN MỀM TỔNG THỂ TOÀN DIỆN
*(SOFTWARE REQUIREMENTS SPECIFICATION - MASTER SRS ENTERPRISE EDITION)*
*Tuân thủ tiêu chuẩn quốc tế IEEE Std 830-1998*

---

* **Mã tài liệu:** `SRS-CEO1983-MASTER-ENTERPRISE-V10.0`
* **Phiên bản:** `Phiên bản 10.0 Toàn Diện (Chuẩn IEEE 830 - Bản Bàn Giao Ban Lãnh Đạo, Kỹ Sư Vận Hành & Khách Hàng)`
* **Cơ quan chủ quản:** Câu Lạc Bộ Doanh Nhân CEO 1983 — Trực thuộc Hội Doanh Nghiệp Trẻ Hà Nội (HanoiBA)
* **Đơn vị phát triển giải pháp:** VICONNECT - Đội ngũ Kiến trúc sư Hệ thống & Chuyên gia Phân tích Nghiệp vụ
* **Cấp độ bảo mật:** Lưu hành nội bộ Ban Lãnh Đạo & Doanh nghiệp Hội viên
* **Ngày cập nhật:** Tháng 11/2026

---

## MỤC LỤC TÀI LIỆU

1. **CHƯƠNG 1: GIỚI THIỆU TỔNG QUAN (INTRODUCTION)**
   - 1.1. Mục Đích Của Tài Liệu Đặc Tả Phần Mềm
   - 1.2. Phạm Vi Phần Mềm & Các Hệ Thống Liên Quan
   - 1.3. Định Nghĩa, Thuật Ngữ & Từ Viết Tắt (Definitions & Acronyms)
   - 1.4. Tài Liệu Tham Chiếu & Căn Cứ Pháp Lý
   - 1.5. Tổng Quan Cấu Trúc Tài Liệu

2. **CHƯƠNG 2: MÔ TẢ TỔNG THỂ HỆ THỐNG & KIẾN TRÚC PHÂN TẦNG (OVERALL DESCRIPTION)**
   - 2.1. Phối Cảnh Hệ Thống & Mô Hình Kiến Trúc 5 Tầng Độc Lập
   - 2.2. Các Lớp Người Dùng & Phân Quyền Truy Cập (User Classes & Characteristics)
   - 2.3. Môi Trường Vận Hành & Hạ Tầng Kỹ Thuật (Operating Environment)
   - 2.4. Ràng Buộc Thiết Kế & Thực Thi (Design & Implementation Constraints)
   - 2.5. Giả Định & Sự Phụ Thuộc Nghiệp Vụ (Assumptions & Dependencies)

3. **CHƯƠNG 3: ĐẶC TẢ CHI TIẾT USE CASE PHÂN HỆ CỔNG QUẢN TRỊ WEB CRM (DÀNH RIÊNG CHO CRM)**
   - 3.1. `UC-CRM-001`: Đăng Nhập & Xác Thực RBAC 5 Cấp Độ
   - 3.2. `UC-CRM-002`: Quản Trị Danh Sách Hội Viên 360 Độ (CRUD, Lọc Đa Tiêu Chí)
   - 3.3. `UC-CRM-003`: Quy Trình Thẩm Định & Phê Duyệt Kết Nạp Hội Viên Mới
   - 3.4. `UC-CRM-004`: Quản Trị Hồ Sơ Doanh Nghiệp & Năng Lực Sản Xuất
   - 3.5. `UC-CRM-005`: Studio Thiết Kế Poster Thư Mời Chuẩn Pinterest (Wyndham Thanh Thủy)
   - 3.6. `UC-CRM-006`: Quản Lý Nhóm Mẫu Trang (Templates: Email, Zalo, Phí, Diễn đàn) & Gửi Đa Kênh
   - 3.7. `UC-CRM-007`: Cấu Hình & Tự Động Hóa Kênh Zalo OA 24/7 Không Gián Đoạn
   - 3.8. `UC-CRM-008`: Quản Lý Sự Kiện & Phân Bổ Sơ Đồ Bàn Tiệc VIP Keangnam
   - 3.9. `UC-CRM-009`: Điều Phối Soát Vé Check-in QR Động Dưới 0.5 Giây Tại Cổng
   - 3.10. `UC-CRM-010`: Điều Hành Cuộc Họp Ban (Họp Cố Định vs Họp Bất Thường)
   - 3.11. `UC-CRM-011`: Quản Lý Tài Chính Thu - Chi, Hóa Đơn & Sổ Quỹ Hiệp Hội
   - 3.12. `UC-CRM-012`: Quản Lý Kỳ Thu Hội Phí Thường Niên & Gạch Nợ Tự Động MoMo/VNPay
   - 3.13. `UC-CRM-013`: Xuất - Nhập Báo Cáo Bảng Tính Excel Thông Minh (3 Chế Độ SheetJS)
   - 3.14. `UC-CRM-014`: Quản Lý Kho Văn Thư & Trình Xem Tài Liệu Toàn Năng (Word, Excel, PDF)
   - 3.15. `UC-CRM-015`: Quản Lý Phân Bổ Đầu Việc (Tasks Kanban) & Giám Sát Deadline
   - 3.16. `UC-CRM-016`: Cấu Hình Hệ Thống Chung (SMTP Mail, Theme, Nhãn Sidebar, Dismiss Badge)
   - 3.17. `UC-CRM-017`: Báo Cáo Thống Kê Điều Hành 5 Chu Kỳ & Trực Quan Hóa Recharts

4. **CHƯƠNG 4: ĐẶC TẢ CHI TIẾT USE CASE PHÂN HỆ MOBILE APP HỘI VIÊN (DÀNH RIÊNG CHO APP)**
   - 4.1. `UC-APP-001`: Cài Đặt Ứng Dụng Đa Nền Tảng Qua Launcher Thông Minh `/open-app`
   - 4.2. `UC-APP-002`: Đăng Nhập, Đăng Ký Gia Nhập Trực Tuyến & Quên Mật Khẩu OTP
   - 4.3. `UC-APP-003`: Trang Chủ, Bảng Tin Mạng Lưới & Tương Tác Bình Luận Cây 3 Cấp
   - 4.4. `UC-APP-004`: Thẻ Hội Viên Số & Danh Thiếp Điện Tử Thông Minh QR vCard / NFC
   - 4.5. `UC-APP-005`: Tra Cứu Danh Bạ Doanh Nhân & Bản Đồ Số Định Vị Doanh Nghiệp
   - 4.6. `UC-APP-006`: Sàn Giao Thương B2B, Đăng Tin Cơ Hội & Khớp Lệnh Thương Vụ
   - 4.7. `UC-APP-007`: Mở Gian Hàng Sản Phẩm & Chính Sách Chiết Khấu Hội Viên Nội Khối
   - 4.8. `UC-APP-008`: Đặt Lịch Hẹn Gặp 1-on-1 Trong 3 Tình Huống Kết Nối Doanh Nhân
   - 4.9. `UC-APP-009`: Danh Mục Sự Kiện Gala, Đăng Ký Tham Gia & Nhận Vé Mời Điện Tử
   - 4.10. `UC-APP-010`: Trình Vé Check-in QR Động & Định Vị Bàn Tiệc VIP Tại Cổng
   - 4.11. `UC-APP-011`: Theo Dõi Lịch Hoạt Động Họp Ban & Điểm Danh Họp Trực Tuyến Jitsi
   - 4.12. `UC-APP-012`: Nộp Hội Phí Thường Niên Trực Tuyến Qua Mã QR MoMo & Cổng VNPay
   - 4.13. `UC-APP-013`: Nhắn Tin Riêng Tư B2B Thời Gian Thực & Gửi Tệp Báo Giá PDF
   - 4.14. `UC-APP-014`: Biểu Quyết Đại Hội & Bầu Cử Số (1 Người - 1 Phiếu Bảo Mật)
   - 4.15. `UC-APP-015`: Trợ Lý Cố Vấn Trí Tuệ Nhân Tạo AI Hướng Dẫn Doanh Nhân 24/7
   - 4.16. `UC-APP-016`: Cập Nhật Hồ Sơ Năng Lực Doanh Nghiệp, Đổi Mật Khẩu & Bảo Mật

5. **CHƯƠNG 5: ĐẶC TẢ YÊU CẦU CHỨC NĂNG CỐT LÕI (FUNCTIONAL REQUIREMENTS)**
   - 5.1. Phân Hệ Studio Thiết Kế Thư Mời Đồ Họa Đa Năng Chuẩn Pinterest
   - 5.2. Phân Hệ Tự Động Hóa Kênh Zalo OA & Quản Trị Token 24/7
   - 5.3. Phân Hệ Sự Kiện, Vé Điện Tử & Soát Vé QR Động Keangnam
   - 5.4. Phân Hệ Điều Hành Cuộc Họp Ban (Cố Định Theo Ban vs Bất Thường)
   - 5.5. Phân Hệ Trang Launcher Cài Đặt App Đa Nền Tảng (`/open-app`)
   - 5.6. Phân Hệ Sàn Giao Thương B2B, Gian Hàng & Lịch Hẹn 1-on-1 (3 Tình Huống)
   - 5.7. Phân Hệ Tài Chính, Thu Phí Tự Động VNPay/MoMo & Đối Soát Bảng Tính
   - 5.8. Phân Hệ Trình Xem Tài Liệu Toàn Năng Nội Bộ (Word, Excel, PDF)

6. **CHƯƠNG 6: ĐẶC TẢ YÊU CẦU PHI CHỨC NĂNG (NON-FUNCTIONAL REQUIREMENTS - NFR)**
   - 6.1. Yêu Cầu Về Hiệu Năng & Thời Gian Phản Hồi (Performance & Latency)
   - 6.2. Yêu Cầu Về An Toàn & Bảo Mật Dữ Liệu (Security & Privacy)
   - 6.3. Yêu Cầu Về Khả Năng Khả Dụng & Sao Lưu Khắc Phục Sự Cố (Reliability & Disaster Recovery)
   - 6.4. Yêu Cầu Về Khả Năng Mở Rộng & Tải Đồng Thời (Scalability & Concurrency)
   - 6.5. Yêu Cầu Về Tính Khả Dụng & Trải Nghiệm Người Dùng (Usability & Accessibility)

7. **CHƯƠNG 7: MA TRẬN TRUY XUẤT TÍNH NĂNG (FUNCTIONAL TRACEABILITY MATRIX)**

---

## CHƯƠNG 1: GIỚI THIỆU TỔNG QUAN (INTRODUCTION)

### 1.1. Mục Đích Của Tài Liệu Đặc Tả Phần Mềm

Tài liệu này xác lập bản đặc tả kỹ thuật chi tiết, chuẩn xác và toàn diện cho **Hệ sinh thái Nền tảng số CLB Doanh Nhân CEO 1983 trực thuộc Hội Doanh Nghiệp Trẻ Hà Nội (HanoiBA)**.
Tài liệu tuân thủ nghiêm ngặt tiêu chuẩn quốc tế IEEE Std 830-1998, làm căn cứ kỹ thuật cho:
1. Ban Lãnh Đạo CLB Doanh Nhân CEO 1983 và Hội Doanh Nghiệp Trẻ Hà Nội (HanoiBA) nghiệm thu sản phẩm phần mềm.
2. Đội ngũ Kỹ sư Phần mềm (Frontend, Backend, DevOps, QA) phát triển, kiểm thử, tích hợp và triển khai hệ thống.
3. Ban Thư Ký, Ban Truyền Thông, Ban Thành Viên và Ban Tài Chính vận hành tác nghiệp hàng ngày.
4. Các đối tác công nghệ tích hợp cổng thanh toán (VNPay, MoMo) và nền tảng giao tiếp số (Zalo OA, Facebook Graph).

---

### 1.2. Phạm Vi Phần Mềm & Các Hệ Thống Liên Quan

Hệ thống số hóa CEO 1983 bao gồm 3 phân hệ chính hoạt động trên kiến trúc Monorepo thống nhất:
- **Cổng Quản Trị Web CRM (`apps/ceo1983_app_fe`):** Giao diện Web Desktop dành riêng cho Ban Thường Trực, Ban Thư Ký, Kế toán và các Trưởng Ban chuyên môn.
- **Ứng Dụng Di Động Hội Viên (`apps/mobile_ceo1983` & PWA Standalone):** Ứng dụng di động đa nền tảng (iOS, Android, PWA) dành cho hơn 500+ doanh nhân hội viên.
- **Máy Chủ Xử Lý Nghiệp Vụ Trung Tâm (`apps/ceo1983_app_be`):** Backend RESTful API thuần khiết viết trên nền tảng NestJS, kết nối trực tiếp với Cơ sở dữ liệu PostgreSQL Enterprise (`113.20.107.184:6432/ceo1983_project`).

---

### 1.3. Định Nghĩa, Thuật Ngữ & Từ Viết Tắt (Definitions & Acronyms)

| Thuật Ngữ / Từ Viết Tắt | Tên Tiếng Anh Đầy Đủ | Định Nghĩa & Ý Nghĩa Nghiệp Vụ |
| :--- | :--- | :--- |
| **HanoiBA** | Hanoi Young Business Association | Hội Doanh Nghiệp Trẻ Hà Nội — Cơ quan quản lý cấp trên của CLB Doanh Nhân CEO 1983. |
| **CEO 1983** | CEO 1983 Club | Câu lạc bộ quy tụ các Chủ tịch, Tổng giám đốc doanh nghiệp sinh năm 1983. |
| **CRM** | Customer / Community Relationship Management | Cổng Quản trị Quan hệ Hội viên & Điều hành Hiệp hội số. |
| **RBAC** | Role-Based Access Control | Cơ chế kiểm soát truy cập và phân quyền dựa trên vai trò người dùng (5 cấp độ). |
| **PWA** | Progressive Web App | Ứng dụng web lũy tiến có khả năng cài đặt trực tiếp lên màn hình điện thoại như ứng dụng Native. |
| **ZNS** | Zalo Notification Service | Dịch vụ gửi tin nhắn thông báo chăm sóc khách hàng có cấu trúc của Zalo OA. |
| **OAuth 2.0** | Open Authorization 2.0 | Giao thức ủy quyền bảo mật dùng để giao tiếp với Zalo Open Platform và Google. |
| **IPN** | Instant Payment Notification | Cơ chế gọi lại Webhook tự động của cổng thanh toán VNPay và MoMo để gạch nợ tức thời. |
| **DDD** | Domain-Driven Design | Phương pháp thiết kế phần mềm hướng theo miền nghiệp vụ thực tế. |

---

## CHƯƠNG 2: MÔ TẢ TỔNG THỂ HỆ THỐNG & KIẾN TRÚC PHÂN TẦNG

### 2.1. Phối Cảnh Hệ Thống & Mô Hình Kiến Trúc 5 Tầng Độc Lập

Hệ thống được tổ chức thành 5 tầng kiến trúc độc lập (5-Tier Enterprise Architecture):

| Tầng Kiến Trúc | Các Thành Phần Phần Mềm | Giao Thức / Cổng Kết Nối | Trách Nhiệm Kỹ Thuật Chính |
| :--- | :--- | :--- | :--- |
| **1. Presentation Layer (Tầng Giao Diện)** | - Cổng Web CRM (React, Vite, Tailwind CSS, Recharts)<br/>- CEO 1983 Mobile App (React PWA, Capacitor Native)<br/>- Trang Launcher Cài Đặt (`/open-app`) | HTTPS (Port 443)<br/>WSS (Port 443) | Cung cấp trải nghiệm người dùng tối ưu trên cả máy tính bàn và điện thoại cảm ứng; hỗ trợ cài đặt PWA 1-chạm. |
| **2. Gateway Layer (Tầng Cửa Ngõ)** | - Nginx Reverse Proxy (SSL TLS 1.3, Brotli/Gzip)<br/>- Social OpenGraph Proxy Router (`/share/*`) | Port 80 -> 443<br/>SSL Certbot Auto | Phân phối tải, chặn lọc bot độc hại, mã hóa toàn bộ dữ liệu đường truyền, tạo preview mạng xã hội. |
| **3. Application Layer (Tầng Nghiệp Vụ)** | - NestJS Pure REST API Backend (`apps/ceo1983_app_be`)<br/>- Socket.IO Gateway (Real-time Broadcast)<br/>- Background Cron Schedulers (15-min Zalo auto-refresh) | Port 4000 (Internal)<br/>JWT Bearer Auth | Xử lý 100% logic nghiệp vụ: Xác thực, hội viên, thư mời đa kênh, sự kiện, họp ban, giao thương B2B, thanh toán. |
| **4. Persistence Layer (Tầng Lưu Trữ)** | - PostgreSQL 16 Enterprise Database (`113.20.107.184:6432`)<br/>- Local Multi-storage Disk (`uploads/`) | Port 6432 (PgBouncer)<br/>Local File System | Lưu trữ dữ liệu an toàn, bảo đảm toàn vẹn quan hệ (ACID), lưu trữ tài liệu Word, Excel, PDF và ảnh thư mời HD. |
| **5. Integration Layer (Tầng Kết Nối)** | - Cổng Thanh Toán Quốc Gia VNPay<br/>- Ví Điện Tử MoMo (QR Code API)<br/>- Nền Tảng Zalo OA & Zalo Open Platform<br/>- Nền Tảng Mạng Xã Hội Facebook Graph API | HTTPS REST API<br/>HMAC SHA512 Webhook | Thực hiện thu hội phí tự động, gửi tin nhắn ZNS, đồng bộ bài viết truyền thông lên Fanpage/Nhóm. |

---

### 2.2. Các Lớp Người Dùng & Phân Quyền Truy Cập

| Lớp Người Dùng | Vai Trò (Role) | Chức Năng Chính Truy Cập Được | Giới Hạn Nghiêm Ngặt |
| :--- | :--- | :--- | :--- |
| **Quản trị viên tối cao** | `SUPER_ADMIN` | Quản trị toàn bộ CSDL, quản lý cấu hình Zalo OA, khóa bảo mật API, xem audit logs, cấu hình SMTP. | Không giới hạn. |
| **Ban Lãnh Đạo CLB** | `ADMIN` | Phê duyệt kết nạp hội viên, duyệt ngân sách thu chi, phê duyệt sự kiện Gala, ban hành văn bản chính thức. | Không được thay đổi cấu hình kỹ thuật máy chủ. |
| **Ban Thư Ký / Truyền Thông** | `MODERATOR` | Soạn thảo tin tức, thiết kế poster thư mời, gửi thông báo đa kênh, điều phối soát vé QR, nhập file Excel. | Không được phê duyệt kết nạp hoặc duyệt chi ngân quỹ lớn. |
| **Hội viên Doanh nhân** | `MEMBER` | Toàn quyền Mobile App: Đăng tin B2B, mở gian hàng sản phẩm, đặt lịch hẹn 1-on-1, nhận vé sự kiện, dùng thẻ vCard. | Không được truy cập vào Cổng Quản trị Web CRM. |
| **Khách mời / Ứng viên** | `GUEST` / `PENDING` | Xem giới thiệu công khai, điền đơn đăng ký gia nhập, theo dõi tiến độ thẩm định hồ sơ kết nạp. | Bị giới hạn toàn bộ tính năng nội bộ. |

---

## CHƯƠNG 3: ĐẶC TẢ CHI TIẾT USE CASE PHÂN HỆ CỔNG QUẢN TRỊ WEB CRM (DÀNH RIÊNG CHO CRM)

> **Cấu trúc mỗi Use Case:** Mã Use Case, Tên Use Case, Tác nhân chính, Mục tiêu, Tiền điều kiện, Luồng sự kiện chính (Step-by-step), Luồng ngoại lệ, Dữ liệu vào/ra, Endpoint API liên quan, Bảng CSDL liên quan, Hậu điều kiện.

---

### 3.1. `UC-CRM-001`: Đăng Nhập & Xác Thực RBAC 5 Cấp Độ
- **Mã Use Case:** `UC-CRM-001`
- **Tên Use Case:** Đăng Nhập & Xác Thực Phân Quyền Vai Trò RBAC
- **Tác nhân chính:** Toàn bộ cán bộ quản trị CRM (`SUPER_ADMIN`, `ADMIN`, `MODERATOR`).
- **Mục tiêu:** Xác thực danh tính cán bộ quản trị, cấp JWT Token và phân quyền truy cập menu CRM chính xác.
- **Tiền điều kiện:** Tài khoản đã được kích hoạt trong bảng `ceo1983_users` và có quyền quản trị hợp lệ.
- **Luồng sự kiện chính (Main Flow):**
  1. Người dùng truy cập URL: `https://crm.ceo1983.viconnect.vn/auth`.
  2. Người dùng nhập tên đăng nhập / email và mật khẩu.
  3. Người dùng nhấp nút "Đăng Nhập".
  4. Hệ thống gửi request `POST /api/auth/login`.
  5. Backend kiểm tra tài khoản, so khớp mật khẩu băm Bcrypt, đọc vai trò người dùng.
  6. Backend sinh cặp `accessToken` và `refreshToken`, lưu `last_login_at` và trả về thông tin người dùng.
  7. Frontend lưu token vào `localStorage`, phân quyền hiển thị sidebar theo role và chuyển hướng vào Dashboard.
- **Luồng ngoại lệ (Alternative Flow):**
  - *E1 - Sai mật khẩu:* Hệ thống báo lỗi "Thông tin đăng nhập hoặc mật khẩu không chính xác"; đếm số lần sai. Nếu sai quá 5 lần, tạm khóa tài khoản trong 15 phút.
  - *E2 - Tài khoản bị khóa:* Báo lỗi "Tài khoản của bạn đã bị tạm khóa. Vui lòng liên hệ Quản trị viên tối cao."
- **Dữ liệu vào/ra:**
  - *Input:* `{ "username": "admin@connect.vn", "password": "..." }`
  - *Output:* `{ "success": true, "accessToken": "...", "user": { ... } }`
- **API Endpoint:** `POST /api/auth/login`
- **Bảng CSDL liên quan:** `ceo1983_users`, `user_roles`, `audit_logs`
- **Hậu điều kiện:** Người dùng đăng nhập thành công, phiên làm việc được thiết lập.

---

### 3.2. `UC-CRM-002`: Quản Trị Danh Sách Hội Viên 360 Độ (CRUD, Lọc Đa Tiêu Chí)
- **Mã Use Case:** `UC-CRM-002`
- **Tên Use Case:** Quản Trị Danh Sách Hội Viên 360 Độ
- **Tác nhân chính:** Ban Thư Ký, Ban Thành Viên (`ADMIN`, `SUPER_ADMIN`).
- **Mục tiêu:** Quản lý tập trung toàn bộ dữ liệu 500+ doanh nhân hội viên, tìm kiếm và thao tác CRUD mượt mà.
- **Tiền điều kiện:** Người dùng đã đăng nhập với vai trò `ADMIN` hoặc `SUPER_ADMIN`.
- **Luồng sự kiện chính (Main Flow):**
  1. Người dùng mở menu "Quản lý Hội viên" (`/association/members`).
  2. Hệ thống tải dữ liệu phân trang từ API `GET /api/members` và hiển thị trên bảng dữ liệu.
  3. Người dùng có thể tìm kiếm theo từ khóa (Tên, SĐT, Email, MST), lọc theo ban chuyên môn hoặc trạng thái nộp phí.
  4. **Thao tác Thêm mới:** Bấm "Thêm hội viên", điền form (Họ tên, SĐT, Email, Tên công ty, Chức vụ), bấm "Lưu".
  5. **Thao tác Xem 360 độ:** Bấm vào dòng hội viên để mở Modal chi tiết hồ sơ cá nhân, hồ sơ công ty, lịch sử đóng phí và điểm chuyên cần.
  6. **Thao tác Chỉnh sửa:** Sửa thông tin và bấm "Cập nhật".
  7. **Thao tác Khóa:** Chọn hội viên và bấm "Khóa tài khoản" khi có vi phạm.
- **Luồng ngoại lệ (Alternative Flow):**
  - *E1 - Số điện thoại đã tồn tại:* Hệ thống báo lỗi trùng lặp và yêu cầu kiểm tra lại hồ sơ gốc.
- **API Endpoint:** `GET /api/members`, `POST /api/members`, `PUT /api/members/:id`, `DELETE /api/members/:id`
- **Bảng CSDL liên quan:** `members`, `ceo1983_users`, `companies`, `member_business_cards`
- **Hậu điều kiện:** Dữ liệu hội viên được cập nhật chính xác trong CSDL PostgreSQL.

---

### 3.3. `UC-CRM-003`: Quy Trình Thẩm Định & Phê Duyệt Kết Nạp Hội Viên Mới
- **Mã Use Case:** `UC-CRM-003`
- **Tên Use Case:** Xét Duyệt Đơn Gia Nhập & Onboarding Hội Viên Mới
- **Tác nhân chính:** Ban Thư Ký, Ban Thành Viên, Chủ Tịch CLB.
- **Mục tiêu:** Số hóa toàn bộ quy trình xét duyệt gia nhập câu lạc bộ qua 3 bước điện tử minh bạch.
- **Tiền điều kiện:** Tồn tại hồ sơ đăng ký mới ở trạng thái `status: 'pending'`.
- **Luồng sự kiện chính (Main Flow):**
  1. Ban Thư Ký mở tab "Chờ duyệt" trên phân hệ Hội viên.
  2. Thư ký kiểm tra tính hợp pháp của mã số thuế, chức vụ đại diện pháp luật; bấm "Xác nhận hồ sơ hợp lệ" (`status -> 'verified'`).
  3. Ban Thành Viên phỏng vấn, thẩm định tiêu chí năm sinh 1983 và uy tín ngành nghề; lập biên bản thẩm định và bấm "Đề xuất kết nạp".
  4. Chủ Tịch CLB kiểm tra hồ sơ và bấm nút "Phê duyệt kết nạp chính thức".
  5. Hệ thống kích hoạt API `POST /api/members/approve/:id`.
  6. Backend tự động sinh mã hội viên duy nhất (`CEO1983-xxx`), cấp danh thiếp điện tử vCard, tạo tài khoản người dùng và gửi email chào mừng kèm link mở cài đặt App `/open-app`.
- **Dữ liệu vào/ra:**
  - *Input:* `{ "approvedRole": "official", "assignedDepartment": "Ban Giao Thương" }`
  - *Output:* `{ "success": true, "memberCode": "CEO1983-088", "status": "active" }`
- **API Endpoint:** `POST /api/members/approve/:id`
- **Bảng CSDL liên quan:** `members`, `ceo1983_users`, `member_business_cards`, `notifications`
- **Hậu điều kiện:** Hội viên chính thức gia nhập CLB, nhận email chào mừng và tài khoản kích hoạt.

---

### 3.4. `UC-CRM-004`: Quản Trị Hồ Sơ Doanh Nghiệp & Năng Lực Sản Xuất
- **Mã Use Case:** `UC-CRM-004`
- **Tên Use Case:** Quản Lý Doanh Nghiệp Thành Viên & Năng Lực Cung Ứng
- **Tác nhân chính:** Ban Giao Thương, Ban Thư Ký.
- **Mục tiêu:** Quản lý đầy đủ hồ sơ năng lực pháp nhân, quy mô sản xuất của doanh nghiệp do hội viên làm chủ.
- **Tiền điều kiện:** Hội viên đã được kết nạp chính thức.
- **Luồng sự kiện chính (Main Flow):**
  1. Người dùng mở phân hệ "Doanh nghiệp" trên CRM.
  2. Xem danh sách pháp nhân, lọc theo ngành nghề (Xây dựng, Bất động sản, IT, F&B...).
  3. Cập nhật thông tin: Tên công ty, MST, Quy mô lao động, Website, Địa chỉ trụ sở, Giấy phép kinh doanh.
  4. Tải lên tệp hồ sơ năng lực (Profile PDF) và album ảnh nhà máy sản xuất.
  5. Bấm nút "Xác thực năng lực (Verified Badge)" để cấp chứng chỉ uy tín nội bộ cho doanh nghiệp.
- **API Endpoint:** `GET /api/companies`, `POST /api/companies`, `PUT /api/companies/:id`
- **Bảng CSDL liên quan:** `companies`, `company_members`, `members`
- **Hậu điều kiện:** Doanh nghiệp được xác thực năng lực, sẵn sàng tham gia sàn B2B.

---

### 3.5. `UC-CRM-005`: Studio Thiết Kế Poster Thư Mời Chuẩn Pinterest (Wyndham Thanh Thủy)
- **Mã Use Case:** `UC-CRM-005`
- **Tên Use Case:** Thiết Kế Poster Thư Mời Đa Năng Chuẩn Pinterest
- **Tác nhân chính:** Ban Truyền Thông, Ban Thư Ký (`MODERATOR`, `ADMIN`).
- **Mục tiêu:** Thiết kế poster thư mời đồ họa cao cấp 9:16 phong cách Wyndham Thanh Thủy trong 3 phút, bóc tách ảnh cắt 5 chế độ, kéo thả chuột tự do, tùy chọn nền mờ, xuất ảnh PNG HD và gửi đa kênh.
- **Tiền điều kiện:** Đã đăng nhập CRM, mở menu `/templates`.
- **Luồng sự kiện chính (Main Flow):**
  1. Người dùng chọn 1 trong 4 loại thư mời: Sự kiện Gala, Diễn đàn B2B, Họp BĐH, Cuộc gặp Matching.
  2. Khung poster 9:16 (`360x640px` preview) hiển thị với tông màu hoàng gia `#071530`, sao rơi lấp lánh và cụm ngày số lớn `06 | 04 | 24`.
  3. Người dùng tải ảnh diễn giả / địa điểm từ máy tính lên khối `CutoutImageConfig`.
  4. Người dùng chọn 1 trong 5 chế độ cắt cúp thông minh: Cổng vòm Heian (`arch`), Viền mờ (`soft_feather`), Huy hiệu (`oval`), Bo góc 24px (`rounded`), Toàn cảnh đáy (`cinema`).
  5. Người dùng kéo thanh trượt điều chỉnh vị trí dọc Y, tỉ lệ scale và độ trong suốt opacity.
  6. Người dùng nhấn giữ chuột và kéo thả trực tiếp trên khung poster canvas để định vị lại tọa độ `(x%, y%)` của các khối văn bản (Kính mời, Thư mời, Tiêu đề nghệ thuật, Phụ đề, Capsule Badge, Cụm ngày giờ).
  7. Người dùng bật/tắt công tắc Nền Kính Mờ (`hasFrostedBg`) trên từng khối văn bản.
  8. Người dùng bấm "Tải poster PNG về máy" để xuất file ảnh độ nét cao `1080x1920px`.
  9. Người dùng bấm "Lưu mẫu" để lưu trữ cấu hình vào CSDL.
- **Luồng ngoại lệ (Alternative Flow):**
  - *A1 - Dùng poster có sẵn:* Nhấp tab "Tải poster có sẵn từ máy", tải file ảnh JPG/PNG đã thiết kế sẵn.
  - *A2 - Đặt lại vị trí chuẩn:* Nhấp "Đặt lại vị trí chuẩn Pinterest", hệ thống khôi phục ngay tọa độ mặc định.
- **API Endpoint:** `POST /api/templates/invitation/generate`, `POST /api/upload/file`
- **Bảng CSDL liên quan:** `app_settings`, `documents`, `events`
- **Hậu điều kiện:** Mẫu thư mời được thiết kế hoàn hảo, sẵn sàng phát sóng đa kênh.

---

### 3.6. `UC-CRM-006`: Quản Lý Nhóm Mẫu Trang (Templates) & Gửi Đa Kênh
- **Mã Use Case:** `UC-CRM-006`
- **Tên Use Case:** Quản Trị Nhóm Mẫu Trang Tập Trung & Phát Sóng Đa Kênh
- **Tác nhân chính:** Ban Truyền Thông.
- **Mục tiêu:** Gộp chung toàn bộ công tác quản lý mẫu truyền thông vào một nhóm duy nhất; phát sóng 1-chạm đồng thời tới App, Zalo OA và Email.
- **Tiền điều kiện:** Mở phân hệ Quản lý mẫu trang (`/templates`).
- **Luồng sự kiện chính (Main Flow):**
  1. Người dùng chọn phân nhóm mẫu cần chỉnh sửa: Mẫu Thư Mời, Mẫu Tin Nhắn Zalo, Mẫu Email, Mẫu Thông Báo Phí, Mẫu Diễn Đàn.
  2. Chỉnh sửa nội dung văn bản, các trường biến động `{member_name}`, `{event_name}`, `{qr_link}`.
  3. Bấm nút "Gửi Thử Nghiệm" để bắn thử tới số điện thoại hoặc email của người biên tập.
  4. Bấm nút "Phát Sóng Đa Kênh": Modal `OmnichannelBroadcastModal` hiển thị.
  5. Tích chọn các kênh muốn tiếp cận: [x] Gửi vào App Mobile, [x] Gửi vào Zalo OA, [x] Gửi vào Email.
  6. Chọn danh sách người nhận (Toàn thể hội viên, Ban Điều Hành, hoặc danh sách tùy chọn).
  7. Nhấp nút "Áp Dụng & Gửi Ngay": Backend thực thi phân luồng gửi đồng thời tới toàn bộ hội viên.
- **API Endpoint:** `POST /api/templates/broadcast/send`
- **Bảng CSDL liên quan:** `app_settings`, `notifications`, `members`
- **Hậu điều kiện:** Thông báo được gửi thành công 100% không sót hội viên nào.

---

### 3.7. `UC-CRM-007`: Cấu Hình & Tự Động Hóa Kênh Zalo OA 24/7 Không Gián Đoạn
- **Mã Use Case:** `UC-CRM-007`
- **Tên Use Case:** Cấu Hình & Tự Động Gia Hạn Token Zalo OA 24/7
- **Tác nhân chính:** Cán bộ kỹ thuật CRM (Quyền `SUPER_ADMIN`).
- **Mục tiêu:** Tinh gọn cấu hình Zalo OA về 3 trường thiết yếu; thiết lập tiến trình ngầm 15 phút tự gia hạn token, đảm bảo vĩnh viễn không mất kết nối.
- **Tiền điều kiện:** Đã đăng nhập vai trò `SUPER_ADMIN`; mở trang Cấu hình Zalo OA (`ZaloOaConfigSection.tsx`).
- **Luồng sự kiện chính (Main Flow):**
  1. Giao diện hiển thị 3 thẻ: Thẻ tổng quan trạng thái, Thẻ cấu hình 3 trường rút gọn, Thẻ kiểm thử bắn tin.
  2. Người dùng nhập: App ID, Secret Key, Refresh Token vào thẻ cấu hình và bấm "Lưu cấu hình".
  3. Người dùng bấm "Kiểm tra kết nối": Hệ thống gọi API Zalo OA, hiển thị tích xanh và tên "CLB CEO 1983".
  4. Người dùng nhập SĐT thử nghiệm và bấm "Gửi thử tin nhắn ZNS": Tin nhắn mẫu gửi tới điện thoại trong 1s.
  5. Tiến trình ngầm NestJS Scheduler tự động quét mỗi 15 phút. Nếu token đã chạy > 4 giờ, hệ thống chủ động gọi API Zalo OAuth v4 để đổi cặp Access Token & Refresh Token mới, ghi đè bền vững vào bảng `app_settings` trong CSDL `113.20.107.184:6432`.
- **API Endpoint:** `GET /api/zalo/config`, `POST /api/zalo/config`, `POST /api/zalo/refresh-token`, `POST /api/zalo/test`
- **Bảng CSDL liên quan:** `app_settings` (key: `zalo_oa_config`)
- **Hậu điều kiện:** Kết nối Zalo OA duy trì liên tục 24/7 không bao giờ bị gián đoạn.

---

### 3.8. `UC-CRM-008`: Quản Lý Sự Kiện & Phân Bổ Sơ Đồ Bàn Tiệc VIP Keangnam
- **Mã Use Case:** `UC-CRM-008`
- **Tên Use Case:** Quản Lý Sự Kiện Gala & Sơ Đồ Bàn Tiệc Danh Dự
- **Tác nhân chính:** Ban Sự Kiện, Ban Thư Ký.
- **Mục tiêu:** Khởi tạo sự kiện đại hội, thiết lập sơ đồ bàn tiệc VIP và cấu hình vé mời điện tử.
- **Tiền điều kiện:** Mở phân hệ Sự kiện (`/events`).
- **Luồng sự kiện chính (Main Flow):**
  1. Bấm nút "Tạo sự kiện mới": Nhập tiêu đề sự kiện, ngày giờ tổ chức, địa điểm (Keangnam Landmark 72), số lượng đại biểu tối đa, hạn chót đăng ký.
  2. Tải lên poster ảnh thư mời đồ họa cao cấp 9:16 vừa thiết kế từ Studio.
  3. Cấu hình cơ cấu bàn tiệc: Bàn VIP 01 (Lãnh đạo Thành ủy & HanoiBA), Bàn VIP 02 (Ban Thường Trực CLB), Bàn Hội viên Vàng.
  4. Gán danh sách đại biểu vào từng bàn tiệc cụ thể (Số bàn, Số ghế).
  5. Bấm "Xuất bản sự kiện": Sự kiện hiển thị tức thời trên App của toàn thể hội viên.
- **API Endpoint:** `GET /api/events`, `POST /api/events`, `PUT /api/events/:id`
- **Bảng CSDL liên quan:** `events`, `event_ticket_types`, `event_registrations`
- **Hậu điều kiện:** Sự kiện sẵn sàng tiếp nhận đăng ký và phân bổ bàn tiệc chính xác.

---

### 3.9. `UC-CRM-009`: Điều Phối Soát Vé Check-in QR Động Dưới 0.5 Giây Tại Cổng
- **Mã Use Case:** `UC-CRM-009`
- **Tên Use Case:** Điều Phối Soát Vé QR Động Tốc Độ Cao Tại Cổng Sự Kiện
- **Tác nhân chính:** Ban Sự Kiện, Nhân sự Lễ tân đón tiếp.
- **Mục tiêu:** Soát vé mời đại biểu tại cửa hội trường Keangnam dưới 0.5 giây/người, định vị vị trí bàn tiệc VIP và triệt tiêu vé trùng.
- **Tiền điều kiện:** Sự kiện đang diễn ra; lễ tân mở màn hình quét mã vé trên CRM hoặc Mobile App.
- **Luồng sự kiện chính (Main Flow):**
  1. Đại biểu trình mã QR vé mời điện tử trên điện thoại cá nhân.
  2. Lễ tân đưa camera hướng vào mã QR.
  3. Camera nhận diện chuỗi Web URL: `https://ceo1983.viconnect.vn/association/events?action=register&ticket=CEO1983-VIP-088`.
  4. Hệ thống trích xuất mã vé và gửi request `POST /api/events/:id/checkin`.
  5. Backend so khớp trong CSDL dưới 50ms:
     - Đánh dấu `is_checked_in: true` và ghi nhận timestamp `checked_in_at: now()`.
     - Trả về thông tin: Họ tên, Tên công ty, Số bàn tiệc VIP (VD: "Bàn 08 - Ghế 03").
  6. Màn hình báo âm thanh "Bíp" thành công, hiển thị màu xanh lá cây hướng dẫn đại biểu vào bàn tiệc.
- **Luồng ngoại lệ (Alternative Flow):**
  - *E1 - Vé đã quét lần 2:* Hệ thống phát còi cảnh báo màu đỏ: "CẢNH BÁO: Vé này đã được check-in vào lúc 08:15 sáng nay!" nhằm ngăn chặn gian lận vé chụp lại màn hình.
- **API Endpoint:** `POST /api/events/:id/checkin`, `GET /api/events/qr`
- **Bảng CSDL liên quan:** `event_registrations`, `events`, `members`
- **Hậu điều kiện:** Đại biểu được đón tiếp nhanh chóng, không xảy ra ùn tắc sảnh hội trường.

---

### 3.10. `UC-CRM-010`: Điều Hành Cuộc Họp Ban (Họp Cố Định vs Họp Bất Thường)
- **Mã Use Case:** `UC-CRM-010`
- **Tên Use Case:** Điều Hành & Điểm Danh Cuộc Họp Ban Chuyên Môn
- **Tác nhân chính:** Ban Thư Ký, Chủ Tịch CLB.
- **Mục tiêu:** Quản lý lịch họp Ban Chấp Hành, phân loại rõ ràng họp cố định theo ban vs họp bất thường; tích hợp họp trực tiếp và trực tuyến Jitsi.
- **Tiền điều kiện:** Mở phân hệ Cuộc họp trên CRM.
- **Luồng sự kiện chính (Main Flow):**
  1. Bấm nút "Tạo cuộc họp mới": Nhập tiêu đề kỳ họp, nội dung nghị sự, thời gian làm việc.
  2. Chọn phân loại cuộc họp: [x] Họp cố định theo ban HOẶC [x] Họp bất thường/Đột xuất.
  3. Chọn hình thức: [x] Trực tiếp (nhập địa chỉ phòng họp) HOẶC [x] Trực tuyến (hệ thống tự sinh đường link phòng họp Jitsi Meet bảo mật nội bộ).
  4. Chọn thành phần triệu tập (Ban Thường Trực, Ban Thành Viên, toàn thể hội viên).
  5. Bấm "Phát lệnh triệu tập": Thông báo gửi đồng thời qua App và Zalo OA nhắc lịch.
  6. Theo dõi danh sách xác nhận tham dự hoặc báo bận thời gian thực.
  7. Sau cuộc họp: Tải lên biên bản kết luận cuộc họp dạng Word/PDF; hệ thống tự động bóc tách các đầu việc vào bảng Tasks.
- **API Endpoint:** `GET /api/meetings`, `POST /api/meetings`, `PUT /api/meetings/:id`
- **Bảng CSDL liên quan:** `meetings`, `business_meetings`, `business_meeting_participants`
- **Hậu điều kiện:** Kỳ họp được ghi nhận đầy đủ, biên bản được số hóa an toàn.

---

### 3.11. `UC-CRM-011`: Quản Lý Tài Chính Thu - Chi, Hóa Đơn & Sổ Quỹ Hiệp Hội
- **Mã Use Case:** `UC-CRM-011`
- **Tên Use Case:** Quản Trị Sổ Quỹ Thu - Chi & Hóa Đơn Hiệp Hội
- **Tác nhân chính:** Ban Tài Chính, Kế toán CLB.
- **Mục tiêu:** Quản lý minh bạch mọi nguồn thu chi của câu lạc bộ, đối soát hóa đơn chứng từ.
- **Tiền điều kiện:** Mở phân hệ Tài chính (`/finances`).
- **Luồng sự kiện chính (Main Flow):**
  1. Hiển thị bảng tổng hợp sổ quỹ: Tổng thu, Tổng chi, Số dư quỹ hiện tại.
  2. Thêm mới giao dịch thu: Nhập nguồn thu (Hội phí, Tài trợ Gala, Đóng góp thiện nguyện), số tiền, ngày phát sinh, phương thức nộp, đính kèm biên lai ảnh/PDF.
  3. Thêm mới giao dịch chi: Nhập mục đích chi (Thuê sảnh tiệc Keangnam, âm thanh ánh sáng, tiệc tri ân), số tiền, người nhận, chứng từ ủy nhiệm chi.
  4. Lọc giao dịch theo khoảng ngày, theo hạng mục thu chi hoặc theo phương thức thanh toán.
  5. Xuất báo cáo quyết toán tài chính định kỳ gửi Ban Thường Trực.
- **API Endpoint:** `GET /api/transactions`, `POST /api/transactions`, `PUT /api/transactions/:id`
- **Bảng CSDL liên quan:** `transactions`, `app_settings`
- **Hậu điều kiện:** Mọi biến động ngân quỹ được ghi sổ chính xác, sẵn sàng kiểm toán.

---

### 3.12. `UC-CRM-012`: Quản Lý Kỳ Thu Hội Phí Thường Niên & Gạch Nợ Tự Động MoMo/VNPay
- **Mã Use Case:** `UC-CRM-012`
- **Tên Use Case:** Quản Lý Thu Hội Phí & Gạch Nợ Tự Động Tức Thời
- **Tác nhân chính:** Ban Tài Chính, Kế toán CLB.
- **Mục tiêu:** Số hóa 100% công tác thu hội phí hằng năm, tự động gạch nợ khi có tiền về qua MoMo hoặc VNPay.
- **Tiền điều kiện:** Mở phân hệ Quản lý Hội phí (`/finances/fees`).
- **Luồng sự kiện chính (Main Flow):**
  1. Thiết lập kỳ thu phí niên khóa mới: Năm 2026, mức phí 10.000.000 VNĐ, hạn nộp ngày 31/12/2026.
  2. Bấm "Tạo danh sách công nợ": Hệ thống tự động sinh công nợ cho toàn bộ hội viên chính thức.
  3. Bấm "Gửi thông báo nộp phí": Hệ thống gửi mã QR thanh toán cá nhân hóa qua App, Zalo OA và Email chứa cú pháp `CEO1983 HP <Mã_HV>`.
  4. Khi hội viên thanh toán qua MoMo hoặc cổng VNPay: Webhook IPN gọi về server, hệ thống tự động:
     - Cập nhật hóa đơn `status: 'PAID'`.
     - Gia hạn thời hạn hội viên thêm 1 năm (`fee_paid: true`, `fee_year: 2026`).
     - Tự động xuất Biên lai điện tử PDF và gửi tin nhắn cảm ơn về điện thoại hội viên.
- **API Endpoint:** `POST /api/payment/vnpay/ipn`, `POST /api/payment/momo/ipn`
- **Bảng CSDL liên quan:** `transactions`, `members`, `app_settings`
- **Hậu điều kiện:** Giảm 98% công tác đối soát thủ công của kế toán, số liệu cập nhật tức thời.

---

### 3.13. `UC-CRM-013`: Xuất - Nhập Báo Cáo Bảng Tính Excel Thông Minh (3 Chế Độ SheetJS)
- **Mã Use Case:** `UC-CRM-013`
- **Tên Use Case:** Xuất & Nhập Báo Cáo Bảng Tính Excel Thông Minh
- **Tác nhân chính:** Kế toán, Ban Thư Ký.
- **Mục tiêu:** Nhập hàng loạt danh sách hội viên từ Excel không lỗi font và xuất 3 chế độ báo cáo chuyên biệt.
- **Tiền điều kiện:** Mở phân hệ Xuất Nhập Dữ Liệu (`/export-import`).
- **Luồng sự kiện chính (Main Flow):**
  1. **Quy trình Nhập Excel (Import):**
     - Chọn file `.xlsx` danh sách hội viên từ máy tính.
     - Thư viện `SheetJS` đọc dữ liệu, tự động nhận diện và map các cột dữ liệu (Họ tên, SĐT, Email, Tên công ty, MST).
     - Hiển thị bảng xem trước (Preview Data), đánh dấu các dòng dữ liệu hợp lệ màu xanh, cảnh báo dòng dữ liệu thiếu màu vàng.
     - Bấm "Xác nhận nạp dữ liệu": Hệ thống nạp hàng loạt vào CSDL trong 2 giây.
  2. **Quy trình Xuất Excel (Export):**
     - Chọn 1 trong 3 chế độ xuất chuyên biệt:
       * *Chế độ 1:* Danh sách hội viên đầy đủ 40 trường thông tin phục vụ in ấn danh bạ.
       * *Chế độ 2:* Báo cáo đối soát thu nộp hội phí chi tiết.
       * *Chế độ 3:* Báo cáo kết nối giao thương B2B và giá trị deal hợp tác.
     - Bấm "Xuất file Excel": Hệ thống kết xuất file `.xlsx` được định dạng chuẩn tiêu đề và màu sắc CLB.
- **API Endpoint:** `POST /api/members/import-excel`, `GET /api/members/export-excel`
- **Bảng CSDL liên quan:** `members`, `transactions`, `opportunities`
- **Hậu điều kiện:** Dữ liệu được nạp hoặc xuất bản toàn vẹn, định dạng đẹp mắt.

---

### 3.14. `UC-CRM-014`: Quản Lý Kho Văn Thư & Trình Xem Tài Liệu Toàn Năng (Word, Excel, PDF)
- **Mã Use Case:** `UC-CRM-014`
- **Tên Use Case:** Quản Lý Kho Văn Thư & Trình Xem Tài Liệu Toàn Năng
- **Tác nhân chính:** Ban Thư Ký, Cán bộ văn phòng.
- **Mục tiêu:** Lưu trữ và xem trực tiếp các công văn, điều lệ dạng Word, Excel, PDF ngay trên trình duyệt.
- **Tiền điều kiện:** Mở phân hệ Tài liệu (`/documents`).
- **Luồng sự kiện chính (Main Flow):**
  1. Quản trị cây thư mục văn kiện: Điều lệ CLB, Quyết định BĐH, Hợp đồng tài trợ, Biên bản họp.
  2. Tải lên tệp tài liệu mới kèm số hiệu công văn và ngày ban hành.
  3. Nhấp vào tệp tài liệu để mở Trình Xem Toàn Năng (Universal Document Viewer):
     - *Tệp Word (.docx):* Hiển thị chuẩn layout trang A4, giữ nguyên bảng biểu và font chữ.
     - *Tệp Excel (.xlsx):* Hiển thị bảng tính phân tab đa sheet thông qua `SheetJS`.
     - *Tệp PDF:* Hiển thị trình xem tài liệu chất lượng cao, hỗ trợ in ấn trực tiếp.
  4. Phân quyền tải về: Thiết lập quyền tải về cho hội viên hoặc chỉ lưu hành nội bộ lãnh đạo.
- **API Endpoint:** `GET /api/documents`, `POST /api/documents`, `POST /api/upload/file`
- **Bảng CSDL liên quan:** `documents`
- **Hậu điều kiện:** Văn thư hiệp hội được số hóa an toàn, xem nhanh không cần phần mềm cài thêm.

---

### 3.15. `UC-CRM-015`: Quản Lý Phân Bổ Đầu Việc (Tasks Kanban) & Giám Sát Deadline
- **Mã Use Case:** `UC-CRM-015`
- **Tên Use Case:** Quản Lý Nhiệm Vụ & Tiến Độ Công Việc Theo Bảng Kanban
- **Tác nhân chính:** Ban Thư Ký, Các Trưởng Ban chuyên môn.
- **Mục tiêu:** Giao nhiệm vụ cho các ban chuyên môn, theo dõi tiến độ công việc theo mô hình Kanban.
- **Tiền điều kiện:** Mở phân hệ Quản lý công việc (`/tasks`).
- **Luồng sự kiện chính (Main Flow):**
  1. Bấm nút "Thêm công việc mới": Nhập tên nhiệm vụ, ban chịu trách nhiệm, người thực hiện chính, độ ưu tiên (Cao, Trung bình, Thấp), hạn hoàn thành.
  2. Bảng Kanban hiển thị 4 cột: *Cần làm (To Do) ➔ Đang làm (In Progress) ➔ Chờ duyệt (Review) ➔ Hoàn thành (Done)*.
  3. Kéo thả thẻ công việc giữa các cột để cập nhật trạng thái tiến độ.
  4. Hệ thống tự động gửi thông báo nhắc nhở khi công việc còn 24 giờ trước thời hạn chót.
- **API Endpoint:** `GET /api/tasks`, `POST /api/tasks`, `PATCH /api/tasks/:id`
- **Bảng CSDL liên quan:** `tasks`, `notifications`
- **Hậu điều kiện:** Tiến độ công việc hiệp hội được kiểm soát chặt chẽ, không bỏ sót đầu việc.

---

### 3.16. `UC-CRM-016`: Cấu Hình Hệ Thống Chung (SMTP Mail, Theme, Nhãn Sidebar, Dismiss Badge)
- **Mã Use Case:** `UC-CRM-016`
- **Tên Use Case:** Cấu Hình Hệ Thống Chung & Quản Trị Nhãn Sidebar
- **Tác nhân chính:** Quản trị viên tối cao (`SUPER_ADMIN`).
- **Mục tiêu:** Tùy biến tham số vận hành hệ thống, cấu hình máy chủ gửi mail SMTP, nhãn sidebar và hiệu ứng thông báo.
- **Tiền điều kiện:** Đã đăng nhập vai trò `SUPER_ADMIN`; mở phân hệ `/settings`.
- **Luồng sự kiện chính (Main Flow):**
  1. **Cấu hình SMTP:** Nhập Host, Port, Email, Mật khẩu ứng dụng; bấm "Kiểm tra gửi mail".
  2. **Cấu hình Nhãn Sidebar:** Thay đổi tên hiển thị các mục trên menu điều hướng bên trái; bấm "Lưu nhãn".
  3. **Cấu hình Badge Thông Báo:** Thiết lập số thông báo màu trắng trên nền đỏ; cấu hình sự kiện nhấp chuột sẽ tự động làm mất số thông báo trên chức năng đó (Dismiss Badge) và ghi nhận vào CSDL.
  4. Hệ thống cập nhật dữ liệu cấu hình vào bảng `app_settings` và áp dụng ngay lập tức mà không cần khởi động lại máy chủ.
- **API Endpoint:** `GET /api/admin/settings`, `PUT /api/admin/settings`, `POST /api/notifications/dismiss`
- **Bảng CSDL liên quan:** `app_settings`, `dismissed_notifications`
- **Hậu điều kiện:** Giao diện và cấu hình hệ thống được cập nhật đồng bộ.

---

### 3.17. `UC-CRM-017`: Báo Cáo Thống Kê Điều Hành 5 Chu Kỳ & Trực Quan Hóa Recharts
- **Mã Use Case:** `UC-CRM-017`
- **Tên Use Case:** Báo Cáo Thống Kê 5 Chu Kỳ Điều Hành & Biểu Đồ Recharts
- **Tác nhân chính:** Chủ Tịch CLB, Ban Thường Trực.
- **Mục tiêu:** Cung cấp bức tranh toàn cảnh về sức khỏe vận hành của hiệp hội qua biểu đồ tương tác Recharts thời gian thực.
- **Tiền điều kiện:** Mở phân hệ Báo cáo Thống kê (`/analytics`).
- **Luồng sự kiện chính (Main Flow):**
  1. Chọn 1 trong 5 chu kỳ: Tuần này, Tháng này, Quý này, Năm nay, Tùy chọn khoảng ngày.
  2. Backend tính toán số liệu tổng hợp trong dưới 50ms từ CSDL PostgreSQL.
  3. Giao diện hiển thị:
     - 5 thẻ chỉ số then chốt (Tổng hội viên, Tỷ lệ chuyên cần, Thu ngân quỹ, Giá trị deal B2B, Số sự kiện).
     - Biểu đồ cột Recharts biểu diễn mức tăng trưởng hội viên mới theo tháng.
     - Biểu đồ đường Recharts biểu diễn biến động dòng tiền thu chi ngân quỹ.
     - Biểu đồ tròn Recharts phân bổ cơ cấu ngành nghề doanh nghiệp.
  4. Rê chuột lên các điểm dữ liệu trên biểu đồ để xem chi tiết thông số Tooltip.
- **API Endpoint:** `GET /api/analytics/overview`
- **Bảng CSDL liên quan:** `members`, `transactions`, `opportunities`, `events`
- **Hậu điều kiện:** Ban Lãnh Đạo nắm bắt tức thời tình hình hiệp hội và ra quyết định chỉ đạo chuẩn xác.

---

## CHƯƠNG 4: ĐẶC TẢ CHI TIẾT USE CASE PHÂN HỆ MOBILE APP HỘI VIÊN (DÀNH RIÊNG CHO APP)

> **Cấu trúc mỗi Use Case:** Mã Use Case, Tên Use Case, Tác nhân chính, Mục tiêu, Điểm chạm giao diện, Luồng sự kiện chính (Step-by-step), Luồng ngoại lệ, Dữ liệu vào/ra, Endpoint API liên quan, Bảng CSDL liên quan, Hậu điều kiện.

---

### 4.1. `UC-APP-001`: Cài Đặt Ứng Dụng Đa Nền Tảng Qua Launcher Thông Minh `/open-app`
- **Mã Use Case:** `UC-APP-001`
- **Tên Use Case:** Cài Đặt Ứng Dụng Đa Nền Tảng (Launcher Thông Minh)
- **Tác nhân chính:** Hội viên doanh nhân.
- **Mục tiêu:** Cài đặt nhanh ứng dụng CEO 1983 lên điện thoại Android hoặc iOS mà không cần duyệt kho ứng dụng App Store / Google Play.
- **Điểm chạm giao diện:** Trang web Launcher đa nền tảng (`/open-app`).
- **Luồng sự kiện chính (Main Flow):**
  1. Hội viên nhấp vào liên kết từ Email chào mừng hoặc tin nhắn Zalo OA: `https://ceo1983.viconnect.vn/open-app?email=...`.
  2. Trang Launcher `open-app.tsx` nạp và tự động nhận diện hệ điều hành thiết bị:
     - **Nếu là Android:** Hệ thống hiển thị huy hiệu Android và nút bấm lớn màu vàng kim: `📲 Cài Đặt App CEO 1983 Ngay (1 Chạm)`. Hội viên bấm nút ➔ Hộp thoại PWA hiện lên ➔ Hội viên bấm "Cài đặt" ➔ Ứng dụng cài đặt thành công sau 2 giây. Cung cấp kèm nút tải file APK trực tiếp.
     - **Nếu là iOS (iPhone/iPad):** Hiển thị hình ảnh minh họa 3 bước dễ hiểu: (1) Nhấn nút Chia sẻ ở thanh dưới Safari ➔ (2) Chọn "Thêm vào MH chính" ➔ (3) Bấm "Thêm". Biểu tượng logo CLB CEO 1983 xuất hiện trên màn hình chính iPhone.
     - **Nếu là Máy tính Desktop:** Hiển thị mã QR lớn sắc nét để quét bằng camera điện thoại kèm nút "Vào Cổng Web CRM".
     - **Nếu người dùng đã ở chế độ App (Standalone):** Tự động điều hướng thẳng vào trang chủ ứng dụng `/association/home`.
- **Hậu điều kiện:** Biểu tượng "CEO 1983" xuất hiện trên màn hình điện thoại, sẵn sàng mở toàn màn hình mượt mà.

---

### 4.2. `UC-APP-002`: Đăng Nhập, Đăng Ký Gia Nhập Trực Tuyến & Quên Mật Khẩu OTP
- **Mã Use Case:** `UC-APP-002`
- **Tên Use Case:** Đăng Nhập, Đăng Ký & Khôi Phục Mật Khẩu
- **Tác nhân chính:** Doanh nhân hội viên, Ứng viên đăng ký gia nhập.
- **Điểm chạm giao diện:** Màn hình `/association/login` và `/association/register`.
- **Luồng sự kiện chính (Main Flow):**
  1. **Đăng nhập:** Nhập số điện thoại / email và mật khẩu ➔ Bấm "Đăng nhập" ➔ Lưu token và mở trang chủ.
  2. **Đăng ký gia nhập:** Bấm "Đăng ký thành viên mới" ➔ Điền Họ tên, Số điện thoại, Email, Tên doanh nghiệp, MST, Chức vụ ➔ Tải ảnh chân dung ➔ Bấm "Gửi đơn gia nhập" ➔ Hồ sơ gửi lên Ban Thư Ký chờ xét duyệt.
  3. **Quên mật khẩu:** Nhấp "Quên mật khẩu?" ➔ Nhập email đăng ký ➔ Hệ thống gửi mã OTP 6 số qua email ➔ Nhập mã OTP và đặt mật khẩu mới ➔ Đăng nhập lại thành công.
- **API Endpoint:** `POST /api/auth/login`, `POST /api/auth/register`, `POST /api/auth/forgot-password`
- **Bảng CSDL liên quan:** `ceo1983_users`, `members`
- **Hậu điều kiện:** Người dùng đăng nhập thành công hoặc đơn đăng ký được lưu trữ an toàn.

---

### 4.3. `UC-APP-003`: Trang Chủ, Bảng Tin Mạng Lưới & Tương Tác Bình Luận Cây 3 Cấp
- **Mã Use Case:** `UC-APP-003`
- **Tên Use Case:** Bảng Tin Mạng Lưới & Bình Luận Đa Tầng Cây 3 Cấp
- **Tác nhân chính:** Hội viên chính thức.
- **Điểm chạm giao diện:** Màn hình Trang Chủ / Feed (`/association/home`).
- **Luồng sự kiện chính (Main Flow):**
  1. Hội viên lướt xem các bài viết tin tức hiệp hội, chúc mừng sinh nhật, thông báo sự kiện.
  2. Nhấp nút "Thả tim" để tương tác bài viết (kèm rung nhẹ haptic feedback).
  3. Nhấp nút "Bình luận": Mở ngăn kéo thảo luận đa tầng:
     - Gửi bình luận cấp 1 trực tiếp dưới bài viết.
     - Nhấp "Trả lời" dưới một bình luận để gửi phản hồi cấp 2.
     - Nhấp "Trả lời" dưới phản hồi cấp 2 để gửi phản hồi cấp 3.
  4. Gõ ký tự `@` để mở danh sách đối tác đã kết nối và gắn thẻ tên trực tiếp vào bình luận.
  5. Menu 3 chấm trên bài viết: Chia sẻ bài viết, Lưu bài viết yêu thích, Báo cáo vi phạm.
- **API Endpoint:** `GET /api/feed/posts`, `POST /api/feed/posts/:id/like`, `POST /api/feed/posts/:id/comments`
- **Bảng CSDL liên quan:** `feed_posts`, `feed_comments`, `feed_likes`
- **Hậu điều kiện:** Tương tác được lưu lại và gửi thông báo chuông thời gian thực tới tác giả.

---

### 4.4. `UC-APP-004`: Thẻ Hội Viên Số & Danh Thiếp Điện Tử Thông Minh QR vCard / NFC
- **Mã Use Case:** `UC-APP-004`
- **Tên Use Case:** Thẻ Hội Viên Số & Danh Thiếp Thông Minh vCard / NFC
- **Tác nhân chính:** Hội viên chính thức.
- **Điểm chạm giao diện:** Tab Cá Nhân / Danh Thiếp (`/association/card`).
- **Luồng sự kiện chính (Main Flow):**
  1. Hiển thị Thẻ Hội Viên Số kim loại sang trọng với 3 màu thương hiệu HanoiBA, Họ tên, Mã hội viên (`CEO1983-xxx`), Chức danh, Ban chuyên môn.
  2. Hiển thị mã QR vCard thông minh: Đối tác quét mã bằng camera điện thoại ➔ Tự động mở danh bạ lưu Họ tên, SĐT, Email, Website công ty.
  3. Chạm mặt lưng điện thoại vào thẻ chip cứng NFC để tự động mở trang danh thiếp công khai `/card/:slug`.
  4. Nút "Chia sẻ danh thiếp": Chia sẻ liên kết qua Zalo, Messenger hoặc SMS.
- **API Endpoint:** `GET /api/business-card/me`, `PUT /api/business-card/me`
- **Bảng CSDL liên quan:** `member_business_cards`, `members`
- **Hậu điều kiện:** Thay thế hoàn toàn danh thiếp giấy truyền thống, tạo ấn tượng chuyên nghiệp trước đối tác.

---

### 4.5. `UC-APP-005`: Tra Cứu Danh Bạ Doanh Nhân & Bản Đồ Số Định Vị Doanh Nghiệp
- **Mã Use Case:** `UC-APP-005`
- **Tên Use Case:** Tra Cứu Danh Bạ & Bản Đồ Định Vị Trụ Sở GPS
- **Tác nhân chính:** Hội viên chính thức.
- **Điểm chạm giao diện:** Tab Danh Bạ (`/association/members`).
- **Luồng sự kiện chính (Main Flow):**
  1. Danh sách hơn 500+ lãnh đạo doanh nghiệp sinh năm 1983.
  2. Tìm kiếm nhanh theo Họ tên, Tên công ty, Ngành nghề kinh doanh.
  3. Nhấp nút gọi điện, nhắn tin Zalo hoặc gửi email trực tiếp từ danh bạ.
  4. Chuyển sang chế độ "Bản đồ GPS": Xem các doanh nghiệp hội viên xung quanh vị trí hiện tại trên bản đồ Hà Nội.
  5. Bấm nút "Chỉ đường" để tự động kích hoạt Google Maps chỉ dẫn tới trụ sở doanh nghiệp đối tác.
- **API Endpoint:** `GET /api/members`, `GET /api/analytics/geocode`
- **Bảng CSDL liên quan:** `members`, `companies`
- **Hậu điều kiện:** Kết nối liên lạc nhanh chóng, hỗ trợ thăm quan doanh nghiệp thuận tiện.

---

### 4.6. `UC-APP-006`: Sàn Giao Thương B2B, Đăng Tin Cơ Hội & Khớp Lệnh Thương Vụ
- **Mã Use Case:** `UC-APP-006`
- **Tên Use Case:** Sàn Giao Thương B2B & Quản Trị Cơ Hội Hợp Tác
- **Tác nhân chính:** Hội viên chính thức.
- **Điểm chạm giao diện:** Tab Giao Thương B2B (`/association/market`).
- **Luồng sự kiện chính (Main Flow):**
  1. Xem bảng tin cơ hội hợp tác: Lọc theo nhu cầu Mua, Bán, hoặc Hợp tác liên doanh.
  2. Bấm "Đăng cơ hội mới": Nhập tiêu đề, mô tả yêu cầu, ngân sách dự kiến, ngành nghề, hạn chót nhận báo giá ➔ Bấm "Đăng bài".
  3. Đối tác xem bài viết và bấm "Tôi quan tâm đến cơ hội này" kèm lời nhắn chào thầu.
  4. Chủ cơ hội nhận thông báo đẩy tức thời, mở kênh đàm phán riêng tư B2B.
  5. Sau khi ký hợp đồng, chủ cơ hội bấm "Cập nhật deal thành công", nhập giá trị hợp đồng (VNĐ) ➔ Doanh số được ghi nhận vào Bảng vàng giao thương CLB.
- **API Endpoint:** `GET /api/opportunities`, `POST /api/opportunities`, `POST /api/community/opportunities/:id/deal-status`
- **Bảng CSDL liên quan:** `opportunities`, `opportunity_interests`
- **Hậu điều kiện:** Thúc đẩy doanh thu nội khối thực chất, vinh danh doanh nghiệp tiêu biểu.

---

### 4.7. `UC-APP-007`: Mở Gian Hàng Sản Phẩm & Chính Sách Chiết Khấu Hội Viên Nội Khối
- **Mã Use Case:** `UC-APP-007`
- **Tên Use Case:** Mở Gian Hàng Sản Phẩm & Ưu Đãi Hội Viên
- **Tác nhân chính:** Hội viên cung ứng sản phẩm.
- **Điểm chạm giao diện:** Tab Sàn Thương Mại (`/association/products`).
- **Luồng sự kiện chính (Main Flow):**
  1. Hội viên mở gian hàng doanh nghiệp: Đăng tải sản phẩm / dịch vụ tiêu biểu.
  2. Nhập thông tin: Tên sản phẩm, mô tả quy cách, giá niêm yết, giá ưu đãi đặc quyền dành riêng cho hội viên CEO 1983 (chiết khấu từ 5% - 30%).
  3. Tải lên album ảnh sản phẩm chất lượng cao và catalogue PDF.
  4. Người mua duyệt gian hàng, bấm "Nhận ưu đãi hội viên" và kết nối trực tiếp với phòng kinh doanh của đối tác.
- **API Endpoint:** `GET /api/products`, `POST /api/products`, `PUT /api/products/:id`
- **Bảng CSDL liên quan:** `products`
- **Hậu điều kiện:** Sản phẩm được quảng bá rộng rãi trong liên minh doanh nghiệp.

---

### 4.8. `UC-APP-008`: Đặt Lịch Hẹn Gặp 1-on-1 Trong 3 Tình Huống Kết Nối Doanh Nhân
- **Mã Use Case:** `UC-APP-008`
- **Tên Use Case:** Đặt Lịch Hẹn Gặp 1-on-1 Kết Nối Doanh Nhân
- **Tác nhân chính:** Hai hội viên kết nối.
- **Điểm chạm giao diện:** Modal Đặt lịch hẹn (`MeetingBookingModal.tsx`).
- **Luồng sự kiện chính (Main Flow):**
  1. Mở trang cá nhân đối tác, bấm nút "Đặt lịch hẹn gặp 1-on-1".
  2. Lựa chọn 1 trong 3 tình huống gặp gỡ:
     - *Tình huống 1:* Hẹn gặp đàm phán hợp tác kinh doanh B2B chính thức.
     - *Tình huống 2:* Đăng ký thăm quan trụ sở, nhà máy sản xuất của đối tác.
     - *Tình huống 3:* Cà phê giao lưu kết nối CEO thân mật.
  3. Chọn ngày giờ mong muốn, địa điểm gặp gỡ và nội dung làm việc.
  4. Bấm "Gửi lời mời hẹn gặp": Đối tác nhận thông báo đẩy và bấm "Chấp thuận".
  5. Hệ thống tự động thêm lịch vào công việc và gửi tin nhắn nhắc nhở trước 2 giờ.
- **API Endpoint:** `POST /api/meetings`
- **Bảng CSDL liên quan:** `meetings`, `business_meetings`, `notifications`
- **Hậu điều kiện:** Cuộc hẹn được thiết lập chuyên nghiệp, nâng cao hiệu quả kết nối.

---

### 4.9. `UC-APP-009`: Danh Mục Sự Kiện Gala, Đăng Ký Tham Gia & Nhận Vé Mời Điện Tử
- **Mã Use Case:** `UC-APP-009`
- **Tên Use Case:** Khám Phá Sự Kiện Gala & Đăng Ký Nhận Vé Điện Tử
- **Tác nhân chính:** Hội viên chính thức.
- **Điểm chạm giao diện:** Tab Sự Kiện (`/association/events`).
- **Luồng sự kiện chính (Main Flow):**
  1. Lướt xem Hero Carousel sự kiện nổi bật: Xem hình ảnh poster, ngày giờ, địa điểm Keangnam Landmark 72.
  2. Xem danh sách diễn giả VIP, chương trình hội nghị và cơ cấu giải thưởng.
  3. Bấm nút "Đăng ký tham gia ngay" (hoặc từ tin nhắn Zalo OA).
  4. Hệ thống kiểm tra điều kiện và phát hành Vé Mời Điện Tử duy nhất (`TIC-CEO1983-xxx`) lưu trữ trong ví vé.
- **API Endpoint:** `GET /api/events`, `POST /api/events/:id/register`
- **Bảng CSDL liên quan:** `events`, `event_registrations`
- **Hậu điều kiện:** Hội viên đăng ký thành công, nhận vé mời điện tử có mã QR.

---

### 4.10. `UC-APP-010`: Trình Vé Check-in QR Động & Định Vị Bàn Tiệc VIP Tại Cổng
- **Mã Use Case:** `UC-APP-010`
- **Tên Use Case:** Trình Vé Mời Check-in QR Động & Định Vị Bàn Tiệc VIP
- **Tác nhân chính:** Đại biểu tham dự sự kiện Gala.
- **Điểm chạm giao diện:** Modal Vé Điện Tử (`EventTicketPassModal`).
- **Luồng sự kiện chính (Main Flow):**
  1. Mở vé điện tử trên điện thoại: Hiển thị mã QR động dẫn URL trực tiếp, mã vé, họ tên và đơn vị.
  2. Trình mã vé trước camera của bàn lễ tân đón tiếp tại sảnh Keangnam.
  3. Lễ tân quét mã trong dưới 0.5 giây.
  4. Màn hình điện thoại đại biểu chuyển sang trạng thái "Đã Check-in Thành Công" màu xanh lục, hiển thị sơ đồ vị trí danh dự: "Bàn 08 - Ghế 03 (Khu Vực Bàn VIP)".
- **API Endpoint:** `POST /api/events/:id/checkin`
- **Bảng CSDL liên quan:** `event_registrations`
- **Hậu điều kiện:** Đại biểu vào đúng vị trí bàn tiệc VIP danh dự, không cần vé giấy.

---

### 4.11. `UC-APP-011`: Theo Dõi Lịch Hoạt Động Họp Ban & Điểm Danh Họp Trực Tuyến Jitsi
- **Mã Use Case:** `UC-APP-011`
- **Tên Use Case:** Theo Dõi Lịch Họp Ban & Điểm Danh Jitsi Trực Tuyến
- **Tác nhân chính:** Hội viên được triệu tập họp.
- **Điểm chạm giao diện:** Tab Hoạt Động & Cuộc Họp (`association.events.tsx`).
- **Luồng sự kiện chính (Main Flow):**
  1. Mở tab "Hoạt động & Cuộc họp": Xem bộ lọc "Họp cố định theo ban" vs "Họp bất thường/Đột xuất".
  2. Xem thẻ timeline cuộc họp: Giờ họp, hình thức trực tiếp (badge cam) hoặc trực tuyến (badge xanh).
  3. Nhấp "Xác nhận tham dự" hoặc "Báo bận (nêu lý do)".
  4. Đến giờ họp trực tuyến: Nhấp nút "Vào phòng họp ngay" ➔ Mở phòng họp Jitsi Meet bảo mật nội bộ, tự động nhận diện họ tên đại biểu.
- **API Endpoint:** `GET /api/meetings`, `POST /api/meetings/:id/attendance`
- **Bảng CSDL liên quan:** `meetings`, `business_meetings`
- **Hậu điều kiện:** Điểm danh quân số chính xác, phòng họp online kết nối ổn định.

---

### 4.12. `UC-APP-012`: Nộp Hội Phí Thường Niên Trực Tuyến Qua Mã QR MoMo & Cổng VNPay
- **Mã Use Case:** `UC-APP-012`
- **Tên Use Case:** Nộp Hội Phí Trực Tuyến Qua MoMo & VNPay
- **Tác nhân chính:** Hội viên nộp phí.
- **Điểm chạm giao diện:** Tab Tài Chính / Nộp Phí (`/association/finances`).
- **Luồng sự kiện chính (Main Flow):**
  1. Thông báo nộp hội phí thường niên niên khóa 2026 hiển thị nổi bật.
  2. Bấm "Nộp hội phí ngay": Lựa chọn phương thức thanh toán:
     - *Cách 1 (Mã QR MoMo):* Quét mã QR MoMo chứa sẵn số tiền và cú pháp `CEO1983 HP <Mã_HV>`.
     - *Cách 2 (Cổng VNPay):* Chuyển sang cổng VNPay thanh toán qua thẻ ATM hoặc Mobile Banking.
  3. Sau khi trừ tiền thành công: Hệ thống tự động gạch nợ tức thời qua Webhook IPN, gia hạn hội viên và cấp Biên lai điện tử PDF.
- **API Endpoint:** `POST /api/payment/vnpay/create`, `POST /api/payment/momo/create`
- **Bảng CSDL liên quan:** `transactions`, `members`
- **Hậu điều kiện:** Hội phí được gạch nợ tự động trong 2 giây, không cần đối soát thủ công.

---

### 4.13. `UC-APP-013`: Nhắn Tin Riêng Tư B2B Thời Gian Thực & Gửi Tệp Báo Giá PDF
- **Mã Use Case:** `UC-APP-013`
- **Tên Use Case:** Nhắn Tin Trực Tiếp B2B & Gửi Hồ Sơ Báo Giá
- **Tác nhân chính:** Hai hội viên kết nối.
- **Điểm chạm giao diện:** Màn hình Trò Chuyện Riêng (`/association/messages`).
- **Luồng sự kiện chính (Main Flow):**
  1. Chọn đối tác từ danh bạ hoặc từ sàn B2B, bấm "Nhắn tin".
  2. Gửi tin nhắn trao đổi hợp tác thời gian thực qua WebSockets (Socket.IO).
  3. Bấm icon tệp đính kèm: Gửi file báo giá Excel, hồ sơ năng lực PDF, ảnh sản phẩm mẫu.
  4. Hiển thị trạng thái đã gửi, đã nhận và đã xem; thông báo chuông đẩy khi có tin nhắn mới.
- **API Endpoint:** `POST /api/dm/member/messages`, `GET /api/dm/member/messages`
- **Bảng CSDL liên quan:** `user_connections`, `notifications`
- **Hậu điều kiện:** Trao đổi thương mại diễn ra bảo mật, tức thời giữa hai lãnh đạo doanh nghiệp.

---

### 4.14. `UC-APP-014`: Biểu Quyết Đại Hội & Bầu Cử Số (1 Người - 1 Phiếu Bảo Mật)
- **Mã Use Case:** `UC-APP-014`
- **Tên Use Case:** Biểu Quyết & Bầu Cử Đại Hội Số
- **Tác nhân chính:** Đại biểu chính thức tham dự đại hội.
- **Điểm chạm giao diện:** Màn hình Biểu Quyết Số (`/association/voting`).
- **Luồng sự kiện chính (Main Flow):**
  1. Khi Chủ tọa đại hội tuyên bố mở phiên biểu quyết, màn hình bỏ phiếu tự động bật lên trên App.
  2. Xem danh sách ứng cử viên Ban Chấp Hành nhiệm kỳ mới kèm hình ảnh và thông tin tóm tắt.
  3. Tích chọn các ứng viên tín nhiệm và bấm "Xác nhận bỏ phiếu".
  4. Hệ thống kiểm tra nguyên tắc bảo mật (Mỗi đại biểu chính thức chỉ bỏ đúng 1 phiếu).
  5. Kết quả biểu quyết được tổng hợp thời gian thực và hiển thị lên màn hình LED hội trường sau đúng 1 giây.
- **API Endpoint:** `POST /api/voting/vote`, `GET /api/voting/results`
- **Bảng CSDL liên quan:** `events`, `audit_logs`
- **Hậu điều kiện:** Bầu cử đại hội diễn ra minh bạch, nhanh chóng và chính xác tuyệt đối.

---

### 4.15. `UC-APP-015`: Trợ Lý Cố Vấn Trí Tuệ Nhân Tạo AI Hướng Dẫn Doanh Nhân 24/7
- **Mã Use Case:** `UC-APP-015`
- **Tên Use Case:** Trợ Lý Trí Tuệ Nhân Tạo AI Đồng Hành 24/7
- **Tác nhân chính:** Hội viên doanh nhân, đặc biệt là hội viên mới.
- **Điểm chạm giao diện:** Widget Trợ Lý AI góc màn hình.
- **Luồng sự kiện chính (Main Flow):**
  1. Chạm vào biểu tượng Trợ lý AI: Giao diện tương tác trực quan ("Giáo viên đứng cạnh bảng") xuất hiện.
  2. Gõ câu hỏi hoặc chọn câu hỏi mẫu: "Quy trình đăng bài B2B thế nào?", "Lấy vé QR check-in ở đâu?", "Giới thiệu cho tôi các doanh nghiệp ngành xây dựng".
  3. AI phản hồi tự nhiên, giải thích ngắn gọn kèm đường dẫn chuyển nhanh tới chức năng tương ứng.
  4. Đề xuất kết nối giao thương: AI gợi ý 5 đối tác tiềm năng nhất trong CLB phù hợp với lĩnh vực của hội viên.
- **API Endpoint:** `POST /api/ai/chat`
- **Bảng CSDL liên quan:** `app_settings`
- **Hậu điều kiện:** Hội viên nhanh chóng hòa nhập và khai thác tối đa giá trị nền tảng số.

---

### 4.16. `UC-APP-016`: Cập Nhật Hồ Sơ Năng Lực Doanh Nghiệp, Đổi Mật Khẩu & Bảo Mật
- **Mã Use Case:** `UC-APP-016`
- **Tên Use Case:** Quản Lý Hồ Sơ Cá Nhân & Thiết Lập Bảo Mật
- **Tác nhân chính:** Doanh nhân hội viên.
- **Điểm chạm giao diện:** Màn hình Thiết Lập Tài Khoản (`/association/profile`).
- **Luồng sự kiện chính (Main Flow):**
  1. Cập nhật ảnh đại diện chuyên nghiệp, ảnh bìa công ty, số điện thoại, email.
  2. Bổ sung giải thưởng doanh nghiệp tiêu biểu, chứng chỉ uy tín.
  3. Thiết lập quyền riêng tư: Ẩn/hiện số điện thoại trên danh bạ nội bộ.
  4. Đổi mật khẩu đăng nhập: Nhập mật khẩu cũ, mật khẩu mới 2 lần, bấm "Cập nhật mật khẩu".
  5. Xem danh sách các thiết bị đang đăng nhập và bấm "Đăng xuất khỏi tất cả các thiết bị khác".
- **API Endpoint:** `PUT /api/me/profile`, `POST /api/auth/change-password`
- **Bảng CSDL liên quan:** `ceo1983_users`, `members`, `companies`
- **Hậu điều kiện:** Hồ sơ hội viên luôn chuẩn xác, tài khoản được bảo vệ đa lớp an toàn.

---

## CHƯƠNG 5: ĐẶC TẢ YÊU CẦU CHỨC NĂNG CỐT LÕI (FUNCTIONAL REQUIREMENTS)

### 5.1. Phân Hệ Studio Thiết Kế Thư Mời Đồ Họa Đa Năng Chuẩn Pinterest
- **FR-INV-01 (Tỉ lệ chuẩn):** Hỗ trợ tỉ lệ khung hình dọc 9:16 (`360x640px` preview tương tác, xuất ảnh phân giải cao `1080x1920px`).
- **FR-INV-02 (Tông màu hoàng gia):** Nền chuyển sắc đêm hoàng gia (`#071530` $\rightarrow$ `#0d234a` $\rightarrow$ `#061225`), sao rơi li ti, vầng hào quang tinh tế.
- **FR-INV-03 (Bộ font chữ luxury):** Chữ Serif mạ bạc *"Thư mời"*, dòng phụ uppercase dãn rộng (tracking `0.28em`), tiêu đề nghệ thuật cỡ đại *"DÒNG CHẢY HẠNH PHÚC"* hiệu ứng gradient băng tuyết trắng - cyan, đổ bóng đa lớp sắc nét.
- **FR-INV-04 (Hộp đặc quyền Capsule Badge):** Khung viền viên thuốc bo tròn phát sáng hiển thị quyền lợi VIP.
- **FR-INV-05 (Cụm ngày giờ số lớn):** Hiển thị thứ, giờ, bộ 3 số ngày/tháng/năm lớn cách nhau bằng vạch dọc `|` (`06 | 04 | 24`), địa điểm tổ chức kèm icon định vị.
- **FR-INV-06 (Phối cảnh cổng chào Heian):** Phối cảnh cổng chào Nhật Bản Heian chân poster với đèn lồng rực rỡ trích xuất từ ảnh gốc Pinterest.
- **FR-INV-07 (Tải & Bóc tách ảnh cắt 5 chế độ):** Cho phép upload ảnh và áp dụng 5 kiểu cắt cúp: (1) Cổng vòm Heian (`arch`), (2) Viền mờ hòa quyện (`soft_feather`), (3) Huy hiệu diễn giả (`oval`), (4) Bo góc 24px (`rounded`), (5) Toàn cảnh chân poster (`cinema`).
- **FR-INV-08 (Kéo thả chuột tự do):** Người dùng có thể nhấn giữ chuột và kéo thả trực tiếp trên poster canvas để thay đổi tọa độ `(x%, y%)` của từng khối văn bản.
- **FR-INV-09 (Tùy chọn nền kính mờ):** Mỗi khối text có công tắc bật/tắt hiệu ứng kính mờ `backdrop-blur-md bg-slate-950/45 border border-white/15 rounded-xl` hoặc trong suốt đổ bóng.
- **FR-INV-10 (Xuất ảnh PNG & Phát sóng đa kênh):** Xuất ảnh PNG full HD và tích hợp gửi đa kênh: App Mobile, Zalo OA ZNS, Email HTML trang trọng.

---

### 5.2. Phân Hệ Tự Động Hóa Kênh Zalo OA & Quản Trị Token 24/7
- **FR-ZALO-01 (Cấu hình tinh gọn 3 trường):** Gộp chung màn hình cấu hình về đúng 3 trường: App ID, Secret Key, Refresh Token.
- **FR-ZALO-02 (Tự động gia hạn ngầm):** NestJS Scheduler quét ngầm định kỳ mỗi 15 phút. Nếu token > 4 giờ, tự động gọi API Zalo OAuth v4 để lấy cặp Access Token & Refresh Token mới.
- **FR-ZALO-03 (Lưu trữ bền vững):** Toàn bộ token mới được ghi đè an toàn vào bảng `app_settings` (key: `zalo_oa_config`) trong CSDL PostgreSQL `113.20.107.184:6432`.
- **FR-ZALO-04 (Kiểm thử tức thời):** Cung cấp nút "Kiểm tra kết nối" và form gửi thử nghiệm tin nhắn mẫu tới số điện thoại bất kỳ.
- **FR-ZALO-05 (Mẫu tin ZNS đa dạng):** Hỗ trợ các mẫu tin ZNS chuẩn: Thư mời sự kiện kèm vé QR, Nhắc nộp hội phí thường niên, Triệu tập cuộc họp ban, Thông báo kết nối giao thương B2B.

---

### 5.3. Phân Hệ Sự Kiện, Vé Điện Tử & Soát Vé QR Động Keangnam
- **FR-EVT-01 (Quản lý danh mục sự kiện):** Tạo sự kiện Gala, hội thảo, giao lưu golf: Tiêu đề, ngày giờ, địa điểm Keangnam, tải poster, số lượng chỗ ngồi.
- **FR-EVT-02 (Sơ đồ bàn tiệc danh dự):** Phân chia danh sách bàn tiệc VIP (Lãnh đạo Thành ủy, HanoiBA, BĐH CLB, Hội viên vàng).
- **FR-EVT-03 (Mã QR vé động):** Tự động sinh mã QR vé mời điện tử dẫn thẳng link Web đăng ký/vé mở modal: `https://ceo1983.viconnect.vn/association/events?action=register&ticket=...`. Đảm bảo 100% camera iOS, Android và Zalo quét đều hiện thông báo "Mở liên kết".
- **FR-EVT-04 (Soát vé tốc độ cao):** Nhận diện vé mời qua camera điện thoại hoặc máy quét mã vạch trong dưới 500 mili-giây.
- **FR-EVT-05 (Chống vé trùng):** Ghi nhận trạng thái `is_checked_in: true` và thời điểm quét; phát còi cảnh báo màu đỏ nếu vé được quét lần 2.

---

### 5.4. Phân Hệ Điều Hành Cuộc Họp Ban & Phân Loại Cố Định vs Bất Thường
- **FR-MEET-01 (Phân loại cuộc họp rõ ràng):** Tách bạch rõ 2 loại hình: (A) Họp cố định theo ban, hoặc (B) Họp bất thường/Đột xuất.
- **FR-MEET-02 (Hình thức họp linh hoạt):** Hỗ trợ Họp trực tiếp (hiển thị địa điểm hội trường) hoặc Họp trực tuyến (tự sinh link phòng họp Jitsi Meet bảo mật nội bộ).
- **FR-MEET-03 (Triệu tập & Điểm danh):** Bắn thông báo triệu tập đích danh; hội viên xác nhận tham dự hoặc báo bận; điểm danh tự động bằng mã QR.
- **FR-MEET-04 (Lưu vết biên bản số hóa):** Đính kèm biên bản kết luận cuộc họp dạng Word/PDF; tự động trích xuất các đầu việc vào bảng công việc.

---

### 5.5. Phân Hệ Trang Launcher Cài Đặt App Đa Nền Tảng (`/open-app`)
- **FR-APP-01 (Nhận diện thiết bị thông minh):** Tự động phân loại môi trường truy cập thành Android, iOS hoặc Desktop.
- **FR-APP-02 (Android PWA 1-chạm):** Tự động kích hoạt sự kiện `beforeinstallprompt` hiển thị nút cài đặt app tức thời; hỗ trợ nút tải file APK trực tiếp.
- **FR-APP-03 (iOS Hướng dẫn 3 bước Safari):** Hiển thị hình ảnh minh họa 3 bước thêm vào màn hình chính chuẩn Apple Safari.
- **FR-APP-04 (Desktop Chuyển tiếp QR):** Hiển thị mã QR rõ nét để quét bằng camera điện thoại kèm nút đăng nhập cổng Web CRM.
- **FR-APP-05 (Khởi chạy Standalone):** Nếu người dùng đã mở từ App: Tự động chuyển thẳng vào màn hình chính của ứng dụng.

---

## CHƯƠNG 6: ĐẶC TẢ YÊU CẦU PHI CHỨC NĂNG (NON-FUNCTIONAL REQUIREMENTS - NFR)

### 6.1. Yêu Cầu Về Hiệu Năng & Thời Gian Phản Hồi (Performance & Latency)

| Chỉ Số Hiệu Năng | Ngưỡng Tiêu Chuẩn Cam Kết | Giải Pháp Công Nghệ Đạt Chuẩn |
| :--- | :---: | :--- |
| **Thời gian phản hồi API REST** | **< 50 mili-giây** (95th percentile) | NestJS Fastify/Express core, đánh index CSDL chuẩn xác, PgBouncer pooling. |
| **Tốc độ xác thực vé QR Check-in** | **< 500 mili-giây** | Thuật toán so khớp hash indexed trên trường `ticket_code` duy nhất. |
| **Thời gian tải trang ban đầu (FCP)**| **< 1.2 giây** | Nginx nén Brotli/Gzip, Vite code-splitting, lazy-loading component, CDN cache ảnh. |
| **Thời gian kết xuất Poster thư mời** | **< 2.0 giây** | Tối ưu hóa DOM canvas, nạp ảnh nền tối ưu dung lượng WebP/JPG. |

---

### 6.2. Yêu Cầu Về An Toàn & Bảo Mật Dữ Liệu (Security & Privacy)

1. **Mã Hóa Đường Truyền & Lưu Trữ:** Toàn bộ kết nối sử dụng giao thức HTTPS với chứng chỉ SSL TLS 1.3. Mật khẩu người dùng được băm một chiều bằng thuật toán `Bcrypt` với salt factor 10.
2. **Xác Thực JWT Token HS256:** Token truy cập có thời hạn 7 ngày, lưu trữ an toàn trong `localStorage` và HTTP-only Cookie.
3. **Phân Quyền RBAC Đa Tầng:** Kiểm tra quyền hạn nghiêm ngặt ở cả 2 đầu: Client-side (ẩn hiện nút bấm) và Server-side (NestJS `RolesGuard`).
4. **Bảo Vệ Khóa Zalo OA & Thanh Toán:** Toàn bộ Secret Key, Refresh Token, Khóa bí mật VNPay/MoMo được lưu trữ trong bảng cài đặt hệ thống có mã hóa và không bao giờ trả về API công khai.
5. **Chống Tấn Công Phổ Biến:** Miễn nhiễm 100% với SQL Injection (sử dụng ORM Prisma / Parametrized queries), XSS (React DOM sanitization) và CSRF.

---

### 6.3. Yêu Cầu Về Khả Năng Khả Dụng & Sao Lưu Khắc Phục Sự Cố (Reliability & Disaster Recovery)

1. **Mức Độ Sẵn Sàng (High Availability):** Cam kết thời gian hoạt động đạt tối thiểu **99.9%** (tổng thời gian downtime không quá 43 phút/tháng).
2. **Khắc Phục Sự Cố Tự Động (Auto-restart):** Hệ thống triển khai trên cụm Docker Compose với chính sách `restart: unless-stopped`, tự động khởi động lại container nếu xảy ra sự cố sập bộ nhớ.
3. **Sao Lưu Dữ Liệu Tự Động (Automated Backups):** Tiến trình sao lưu CSDL PostgreSQL định kỳ 02:00 sáng hàng ngày; lưu trữ bản sao lưu tại phân vùng ổ cứng độc lập và lưu trữ đám mây an toàn.
4. **Thời Gian Phục Hồi Dữ Liệu (RTO / RPO):** RTO (Recovery Time Objective) < 30 phút; RPO (Recovery Point Objective) < 24 giờ.

---

### 6.4. Yêu Cầu Về Khả Năng Mở Rộng & Tải Đồng Thời (Scalability & Concurrency)

1. **Quy Mô Dữ Liệu:** Hệ thống được thiết kế tối ưu phục vụ từ 500 đến 50.000 doanh nghiệp hội viên và lưu trữ hàng triệu giao dịch B2B mà không suy giảm tốc độ truy vấn.
2. **Tải Đột Biến Tại Sự Kiện Lớn (Event Spike):** Đảm bảo xử lý trơn tru tối thiểu 5.000 kết nối đồng thời (CCU) tại thời điểm đại hội Gala khai mạc và quét vé QR dồn dập trong 15 phút.
3. **Kiến Trúc Tách Biệt Độc Lập:** Web CRM, Mobile App và Backend API hoạt động trong các container Docker độc lập, cho phép mở rộng quy mô (Scale-up) từng phân hệ dễ dàng.

---

## CHƯƠNG 7: MA TRẬN TRUY XUẤT TÍNH NĂNG (FUNCTIONAL TRACEABILITY MATRIX)

| Mã Use Case CRM / App | Functional Node ID | Mô Tả Chức Năng Chi Tiết | File Frontend (UI) | File Backend (API) | Bảng PostgreSQL Tương Ứng |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `UC-CRM-001` | `[NODE-CRM-001]` | Đăng nhập & Phân quyền RBAC 5 vai trò | `src/routes/auth.tsx` | `src/auth/auth.controller.ts` | `ceo1983_users`, `user_roles` |
| `UC-CRM-002` | `[NODE-CRM-002]` | Quản lý Hồ sơ Hội viên 360 độ | `src/routes/association.members.tsx` | `src/members/members.controller.ts` | `members`, `companies` |
| `UC-CRM-003` | `[NODE-CRM-003]` | Thẩm định & Phê duyệt kết nạp | `src/routes/association.members.tsx` | `src/members/members.controller.ts` | `members`, `ceo1983_users` |
| `UC-CRM-004` | `[NODE-CRM-004]` | Quản lý Doanh nghiệp & Năng lực | `src/routes/association.members.tsx` | `src/members/members.controller.ts` | `companies`, `company_members` |
| `UC-CRM-005` | `[NODE-CRM-024]` | Studio Thư Mời Chuẩn Pinterest | `src/components/templates/InvitationTemplateStudio.tsx` | `src/upload/upload.controller.ts` | `app_settings`, `documents` |
| `UC-CRM-006` | `[NODE-CRM-024]` | Quản lý Mẫu Trang & Gửi Đa Kênh | `src/components/templates/OmnichannelBroadcastModal.tsx` | `src/zalo/zalo.controller.ts` | `app_settings`, `notifications` |
| `UC-CRM-007` | `[NODE-CORE-005]` | Tự động hóa Zalo OA 24/7 | `src/components/dashboard/ZaloOaConfigSection.tsx` | `src/zalo/zalo.service.ts` | `app_settings` (key: `zalo_oa_config`) |
| `UC-CRM-008` | `[NODE-CRM-010]` | Quản lý Sự kiện & Bàn tiệc VIP | `src/routes/events.tsx` | `src/events/events.controller.ts` | `events`, `event_registrations` |
| `UC-CRM-009` | `[NODE-CRM-010]` | Soát vé QR Check-in siêu tốc | `src/routes/association.events.tsx` | `src/events/events.controller.ts` | `event_registrations` |
| `UC-CRM-010` | `[NODE-APP-008]` | Cuộc họp Ban (Cố định vs Bất thường) | `src/routes/association.events.tsx` | `src/meetings/meetings.controller.ts` | `meetings`, `business_meetings` |
| `UC-CRM-011` | `[NODE-CRM-011]` | Quản lý Sổ quỹ & Hóa đơn thu chi | `src/routes/finances.tsx` | `src/payment/payment.controller.ts` | `transactions` |
| `UC-CRM-012` | `[NODE-CRM-011]` | Thu hội phí QR MoMo & VNPay | `src/routes/finances.tsx` | `src/payment/payment.controller.ts` | `transactions`, `members` |
| `UC-CRM-013` | `[NODE-CRM-022]` | Xuất - nhập Excel thông minh 3 chế độ| `src/routes/export-import.tsx` | `src/members/members.controller.ts` | `members`, `transactions` |
| `UC-CRM-014` | `[NODE-CRM-012]` | Kho Văn thư & Trình xem tài liệu | `src/routes/documents.tsx` | `src/documents/documents.controller.ts` | `documents` |
| `UC-CRM-015` | `[NODE-CRM-013]` | Quản lý Công việc Tasks Kanban | `src/routes/tasks.tsx` | `src/tasks/tasks.controller.ts` | `tasks` |
| `UC-CRM-016` | `[NODE-CRM-014]` | Cấu hình Hệ thống & Nhãn Sidebar | `src/routes/settings.tsx` | `src/admin/admin.controller.ts` | `app_settings`, `dismissed_notifications` |
| `UC-CRM-017` | `[NODE-CRM-015]` | Báo cáo Thống kê 5 Chu kỳ Recharts | `src/routes/analytics.tsx` | `src/analytics/analytics.controller.ts` | `members`, `transactions`, `events` |
| `UC-APP-001` | `[NODE-CORE-004]` | Launcher Cài Đặt App Đa Nền Tảng | `src/routes/open-app.tsx` | `src/mail/mail.service.ts` | `ceo1983_users` |
| `UC-APP-002` | `[NODE-APP-001]` | Đăng nhập, Đăng ký & Quên mật khẩu | `src/routes/association.login.tsx` | `src/auth/auth.controller.ts` | `ceo1983_users`, `members` |
| `UC-APP-003` | `[NODE-APP-002]` | Bảng tin Mạng lưới & Bình luận 3 cấp | `src/routes/association.home.tsx` | `src/feed/feed.controller.ts` | `feed_posts`, `feed_comments` |
| `UC-APP-004` | `[NODE-APP-004]` | Thẻ Hội viên số & Danh thiếp QR vCard | `src/routes/association.card.tsx` | `src/business-card/business-card.controller.ts` | `member_business_cards` |
| `UC-APP-005` | `[NODE-APP-003]` | Danh bạ Doanh nhân & Bản đồ GPS | `src/routes/association.members.tsx` | `src/members/members.controller.ts` | `members`, `companies` |
| `UC-APP-006` | `[NODE-APP-005]` | Sàn Giao thương B2B & Cơ hội | `src/routes/association.market.tsx` | `src/opportunities/opportunities.controller.ts` | `opportunities`, `opportunity_interests` |
| `UC-APP-007` | `[NODE-APP-006]` | Gian hàng Sản phẩm & Ưu đãi nội bộ | `src/routes/association.market.tsx` | `src/products/products.controller.ts` | `products` |
| `UC-APP-008` | `[NODE-APP-007]` | Đặt lịch hẹn 1-on-1 (3 Tình huống) | `src/components/meetings/MeetingBookingModal.tsx` | `src/meetings/meetings.controller.ts` | `meetings`, `business_meetings` |
| `UC-APP-009` | `[NODE-APP-008]` | Danh mục Sự kiện Gala & Vé mời | `src/routes/association.events.tsx` | `src/events/events.controller.ts` | `events`, `event_registrations` |
| `UC-APP-010` | `[NODE-APP-008]` | Trình vé QR Check-in bàn tiệc VIP | `src/components/events/EventTicketPassModal.tsx` | `src/events/events.controller.ts` | `event_registrations` |
| `UC-APP-011` | `[NODE-APP-008]` | Hoạt động Họp ban & Jitsi online | `src/routes/association.events.tsx` | `src/meetings/meetings.controller.ts` | `meetings` |
| `UC-APP-012` | `[NODE-APP-009]` | Nộp Hội phí MoMo & VNPay | `src/routes/association.finances.tsx` | `src/payment/payment.controller.ts` | `transactions`, `members` |
| `UC-APP-013` | `[NODE-APP-010]` | Chat Riêng Tư B2B & Gửi file PDF | `src/routes/association.messages.tsx` | `src/connect-app/dm.controller.ts` | `messages`, `user_connections` |
| `UC-APP-014` | `[NODE-APP-011]` | Biểu quyết Đại hội & Bầu cử số | `src/routes/association.voting.tsx` | `src/voting/voting.controller.ts` | `events` |
| `UC-APP-015` | `[NODE-APP-012]` | Trợ lý Cố vấn AI 24/7 | `src/components/ai/AiAssistantWidget.tsx` | `src/ai/ai.controller.ts` | `app_settings` |
| `UC-APP-016` | `[NODE-APP-013]` | Hồ sơ Năng lực Doanh nghiệp & Bảo mật| `src/routes/association.profile.tsx` | `src/connect-app/me.controller.ts` | `members`, `companies` |

---

*Hà Nội, Ngày 09 Tháng 11 Năm 2026*  
**BAN KIẾN TRÚC HỆ THỐNG & ĐẶC TẢ KỸ THUẬT VICONNECT**  
*(Đã thẩm định và xác nhận đạt chuẩn IEEE Std 830-1998)*
