# TÀI LIỆU ĐẶC TẢ CHI TIẾT API & THIẾT KẾ CƠ SỞ DỮ LIỆU POSTGRESQL HỆ THỐNG CEO 1983 (HANOIBA)

---

* **Mã tài liệu:** `DB-API-CEO1983-MASTER-ENTERPRISE-V10.0`
* **Phiên bản:** `Phiên bản 10.0 Toàn Diện (Kiến trúc Pure NestJS 3 Tầng, PostgreSQL Enterprise 113.20.107.184:6432, Web CRM & CEO 1983 Mobile App)`
* **Cơ quan chủ quản:** Câu Lạc Bộ Doanh Nhân CEO 1983 — Trực thuộc Hội Doanh Nghiệp Trẻ Hà Nội (HanoiBA)
* **Đơn vị phát triển giải pháp:** VICONNECT - Kiến Trúc Sư Hệ Thống & Cơ Sở Dữ Liệu
* **Cấp độ bảo mật:** Lưu hành nội bộ Ban Lãnh Đạo & Kỹ sư Vận hành
* **Ngày cập nhật:** Tháng 11/2026

---

## MỤC LỤC TÀI LIỆU

1. **PHẦN I: TỔNG QUAN KIẾN TRÚC DỮ LIỆU & GIAO TIẾP HỆ THỐNG**
   - 1.1. Triết Lý Thiết Kế Pure NestJS 3 Tầng & PostgreSQL Enterprise
   - 1.2. Máy Chủ Cơ Sở Dữ Liệu Trung Tâm `113.20.107.184:6432` & PgBouncer
   - 1.3. Chuẩn Hóa Giao Thức REST API, JSON Payload & Xử Lý Ngoại Lệ
   - 1.4. Bảng Ma Trận Quan Hệ Thực Thể Cốt Lõi (Entity Relational Matrix)

2. **PHẦN II: THIẾT KẾ CHI TIẾT CƠ SỞ DỮ LIỆU POSTGRESQL (20+ BẢNG DOANH NGHIỆP)**
   - 2.1. Bảng `ceo1983_users` & `vione_users`: Tài khoản người dùng cơ sở
   - 2.2. Bảng `members`: Hồ sơ 360 độ Hội viên Doanh nhân CLB CEO 1983
   - 2.3. Bảng `companies`: Hồ sơ Doanh nghiệp thành viên & Pháp nhân
   - 2.4. Bảng `company_members`: Quan hệ thành viên trong doanh nghiệp
   - 2.5. Bảng `member_business_cards`: Danh thiếp điện tử thông minh, URL slug
   - 2.6. Bảng `business_card_skills`, `business_card_services`, `business_card_needs`: Năng lực & Nhu cầu B2B
   - 2.7. Bảng `opportunities`: Sàn giao thương B2B & Cơ hội hợp tác kinh tế
   - 2.8. Bảng `opportunity_interests`: Bày tỏ quan tâm, đàm phán & giá trị thương vụ
   - 2.9. Bảng `products`: Gian hàng sản phẩm ưu đãi nội khối
   - 2.10. Bảng `events`: Sự kiện Gala, đại hội & hội thảo chuyên đề
   - 2.11. Bảng `event_registrations`: Vé mời điện tử, mã QR động & bàn tiệc VIP
   - 2.12. Bảng `event_ticket_types` & `event_prizes`: Hạng vé & cơ cấu giải thưởng
   - 2.13. Bảng `meetings`: Kỳ họp Ban Chấp Hành, họp cố định theo ban vs đột xuất
   - 2.14. Bảng `business_meetings` & `business_meeting_participants`: Lịch hẹn 1-on-1 trong 3 tình huống
   - 2.15. Bảng `transactions`: Giao dịch tài chính, nộp hội phí MoMo & VNPay
   - 2.16. Bảng `app_settings`: Cấu hình hệ thống, lưu token Zalo OA xoay vòng 24/7
   - 2.17. Bảng `documents`: Kho văn thư số hóa, tài liệu Word, Excel, PDF
   - 2.18. Bảng `feed_posts` & `feed_comments`: Bảng tin mạng lưới, cây bình luận 3 cấp
   - 2.19. Bảng `user_connections`: Mạng lưới kết nối bạn bè, đối tác B2B đã kết nối
   - 2.20. Bảng `notifications` & `dismissed_notifications`: Thông báo đẩy, dismiss badge trắng/đỏ
   - 2.21. Bảng `tasks`: Quản lý phân bổ công việc & tiến độ Kanban
   - 2.22. Bảng `audit_logs` & `user_roles`: Kiểm toán an ninh, phân quyền RBAC 5 vai trò
   - 2.23. Bảng Ma Trận Ràng Buộc Khóa Ngoại (Foreign Key Constraints & Cascades)

3. **PHẦN III: ĐẶC TẢ CHI TIẾT CÁC PHÂN HỆ RESTFUL API (API SPECIFICATIONS)**
   - 3.1. Phân Hệ Xác Thực & Phân Quyền Vai Trò (Auth Controller API)
   - 3.2. Phân Hệ Quản Trị Hội Viên 360 Độ & Xét Duyệt (Members Controller API)
   - 3.3. Phân Hệ Doanh Nghiệp & Hồ Sơ Năng Lực (Companies Controller API)
   - 3.4. Phân Hệ Studio Thư Mời Chuẩn Pinterest & Gửi Đa Kênh (Templates & Upload API)
   - 3.5. Phân Hệ Tự Động Hóa Zalo OA & Quản Trị Token 24/7 (Zalo Controller API)
   - 3.6. Phân Hệ Sự Kiện, Vé Điện Tử & Soát Vé QR Động Keangnam (Events Controller API)
   - 3.7. Phân Hệ Điều Hành Cuộc Họp Ban & Lịch Hẹn 1-on-1 (Meetings Controller API)
   - 3.8. Phân Hệ Sàn Giao Thương B2B, Sản Phẩm & Deal Hợp Tác (Opportunities & Market API)
   - 3.9. Phân Hệ Thanh Toán Điện Tử MoMo, VNPay & Webhook IPN (Payment Controller API)
   - 3.10. Phân Hệ Báo Cáo Thống Kê 5 Chu Kỳ & Xuất Nhập Excel (Analytics & Excel API)
   - 3.11. Phân Hệ Bảng Tin Mạng Lưới & Tương Tác Đa Tầng (Feed Controller API)
   - 3.12. Phân Hệ Kho Tài Liệu Toàn Năng Word/Excel/PDF (Documents Controller API)
   - 3.13. Phân Hệ Trò Chuyện Riêng Tư B2B (Direct Messaging API)
   - 3.14. Phân Hệ Biểu Quyết Đại Hội & Bầu Cử Số (Voting Controller API)
   - 3.15. Phân Hệ Trợ Lý Cố Vấn Trí Tuệ Nhân Tạo AI (AI Controller API)
   - 3.16. Phân Hệ Quản Trị Hệ Thống, Nhãn Sidebar & Invoices (Admin Controller API)

4. **PHẦN IV: CHIẾN LƯỢC ĐÁNH CHỈ MỤC & TỐI ƯU HIỆU NĂNG CSDL (DATABASE INDEXING)**

5. **PHẦN V: QUY CHUẨN AN TOÀN, SAO LƯU DỮ LIỆU & ĐỒNG BỘ GOOGLE NOTEBOOKLM**

---

## PHẦN I: TỔNG QUAN KIẾN TRÚC DỮ LIỆU & GIAO TIẾP HỆ THỐNG

### 1.1. Triết Lý Thiết Kế Pure NestJS 3 Tầng & PostgreSQL Enterprise

1. **Kiến trúc NestJS 3 Tầng Thuần Khiết (Controller - Service - Repository/Prisma):**
   - 100% nghiệp vụ của Cổng Quản trị Web CRM và Ứng dụng Di động CEO 1983 kết nối qua cổng API RESTful NestJS (`apps/ceo1983_app_be`).
   - Tuyệt đối loại bỏ các kết nối trực tiếp PostgREST phía client nhằm bảo toàn tính toàn vẹn nghiệp vụ, an toàn dữ liệu và tuân thủ RBAC chặt chẽ.
2. **PostgreSQL Relational Enterprise Core:**
   - Sử dụng PostgreSQL phiên bản 16+ với schema `public` được phân định rõ ràng giữa các phân hệ: Hội viên, Doanh nghiệp, Phân quyền RBAC, Giao thương B2B, Sự kiện & Cuộc họp, Quản trị Tài liệu, Tài chính Thu - Chi, Mạng xã hội nội bộ, và Thông báo thời gian thực.
   - Định danh bản ghi sử dụng chuẩn `UUIDv4` kết hợp mã định danh nghiệp vụ (VD: `CEO1983-088`, `TIC-2026-X89`) nhằm đảm bảo bảo mật và khả năng phân tán dữ liệu.
3. **Cơ Chế Bảo Toàn Giao Dịch ACID (Atomicity, Consistency, Isolation, Durability):**
   - Mọi thao tác gạch nợ hội phí, duyệt kết nạp, chuyển quyền quản trị đều được thực thi trong khối giao dịch (`Prisma.$transaction` hoặc PostgreSQL `BEGIN...COMMIT`), bảo đảm không xảy ra mất mát dữ liệu hoặc trạng thái không nhất quán.

---

### 1.2. Máy Chủ Cơ Sở Dữ Liệu Trung Tâm `113.20.107.184:6432` & PgBouncer

Toàn bộ hệ thống Web CRM, Mobile App, Backend API và các container Docker production đều thống nhất kết nối trực tiếp về cụm máy chủ cơ sở dữ liệu trung tâm:
- **Địa chỉ máy chủ (Host):** `113.20.107.184`
- **Cổng kết nối (Port):** `6432` (Kết nối qua hệ thống quản lý hàng đợi kết nối cao cấp PgBouncer)
- **Tên cơ sở dữ liệu (Database Name):** `ceo1983_project`
- **Schema mặc định:** `public`
- **Chuỗi kết nối chuẩn hóa:** `postgresql://app1:5^S0CEpvYwC1(#YN1UoJ@113.20.107.184:6432/ceo1983_project?pgbouncer=true`
- **Bảo toàn dữ liệu Zero-Trust:** Đã làm sạch toàn bộ dữ liệu mẫu, chỉ lưu trữ duy nhất tài khoản Quản trị viên tối cao: `admin@connect.vn` (username: `admin`, role: `SUPER_ADMIN`).

---

### 1.3. Chuẩn Hóa Giao Thức REST API, JSON Payload & Xử Lý Ngoại Lệ

1. **Chuẩn Xác Thực API:**
   - Mọi request gửi tới API được xác thực qua header: `Authorization: Bearer <JWT_ACCESS_TOKEN>`.
   - Token JWT được ký bằng thuật toán bảo mật `HS256`, chứa định danh người dùng `userId`, `memberId`, và danh sách quyền `roles`.
2. **Định Dạng Dữ Liệu JSON Chuẩn Hóa:**
   - Response thành công chuẩn HTTP `200 OK` hoặc `201 Created`:
     ```json
     {
       "success": true,
       "data": { ... },
       "meta": { "total": 100, "page": 1, "limit": 20 }
     }
     ```
   - Response lỗi chuẩn:
     ```json
     {
       "statusCode": 400,
       "message": "Dữ liệu nhập vào chưa đúng định dạng số điện thoại.",
       "error": "Bad Request",
       "timestamp": "2026-11-09T14:30:00.000Z"
     }
     ```
3. **Mã Trạng Thái HTTP Chuẩn (Standard HTTP Status Codes):**
   - `200 OK`: Truy vấn hoặc cập nhật dữ liệu thành công.
   - `201 Created`: Tạo mới bản ghi thành công (Hội viên, Sự kiện, Bài viết).
   - `400 Bad Request`: Lỗi tham số đầu vào (Class-validator phát hiện).
   - `401 Unauthorized`: Chưa đăng nhập hoặc JWT Token hết hạn.
   - `403 Forbidden`: Người dùng không có quyền truy cập chức năng này (RBAC chặn).
   - `404 Not Found`: Không tìm thấy tài nguyên yêu cầu.
   - `500 Internal Server Error`: Lỗi máy chủ không mong muốn (kèm ghi vết log chi tiết).

---

### 1.4. Bảng Ma Trận Quan Hệ Thực Thể Cốt Lõi (Entity Relational Matrix)

| Bảng Nguồn (Parent) | Khóa Chính (PK) | Bảng Đích (Child) | Khóa Ngoại (FK) | Kiểu Quan Hệ | Hành Vi Xóa (On Delete) | Ý Nghĩa Nghiệp Vụ Thực Tế |
| :--- | :--- | :--- | :--- | :---: | :--- | :--- |
| `ceo1983_users` | `id (UUID)` | `members` | `user_id` | **1 : 1** | `SET NULL` | Mỗi tài khoản đăng nhập gắn liền 1 hồ sơ hội viên doanh nhân. |
| `members` | `id (TEXT)` | `companies` | `owner_user_id` | **1 : N** | `CASCADE` | Một hội viên có thể sở hữu 1 hoặc nhiều doanh nghiệp/pháp nhân. |
| `members` | `id (TEXT)` | `member_business_cards`| `member_id` | **1 : 1** | `CASCADE` | Mỗi hội viên có 1 danh thiếp điện tử thông minh có định danh URL slug. |
| `members` | `id (TEXT)` | `opportunities` | `poster_id` | **1 : N** | `CASCADE` | Hội viên đăng các cơ hội hợp tác kinh doanh lên sàn B2B. |
| `opportunities` | `id (TEXT)` | `opportunity_interests`| `opportunity_id` | **1 : N** | `CASCADE` | Các đối tác bày tỏ quan tâm, đàm phán hợp đồng kinh tế. |
| `events` | `id (TEXT)` | `event_registrations` | `event_id` | **1 : N** | `CASCADE` | Danh sách vé mời và đại biểu đăng ký tham gia sự kiện Gala. |
| `events` | `id (TEXT)` | `event_ticket_types` | `event_id` | **1 : N** | `CASCADE` | Các hạng vé sự kiện (VIP Đại biểu, Hội viên chính thức, Khách mời). |
| `meetings` | `id (TEXT)` | `business_meeting_participants`| `meeting_id` | **1 : N** | `CASCADE` | Danh sách thành viên triệu tập họp BĐH hoặc tham gia lịch hẹn 1-on-1. |
| `members` | `id (TEXT)` | `transactions` | `association_id` | **1 : N** | `RESTRICT` | Lịch sử nộp hội phí và biến động tài chính của hội viên. |
| `feed_posts` | `id (UUID)` | `feed_comments` | `post_id` | **1 : N** | `CASCADE` | Cây bình luận đa tầng (cấp 1, cấp 2, cấp 3) trên bài viết bảng tin. |

---

## PHẦN II: THIẾT KẾ CHI TIẾT CƠ SỞ DỮ LIỆU POSTGRESQL (20+ BẢNG DOANH NGHIỆP)

### 2.1. Bảng `public.ceo1983_users` & `vione_users` (Tài Khoản Đăng Nhập Hệ Thống)
*Mô tả nghiệp vụ:* Lưu trữ tài khoản đăng nhập cốt lõi, cơ chế băm mật khẩu Bcrypt và các khóa OAuth liên kết.

| Tên Cột | Kiểu Dữ Liệu | Ràng Buộc | Giá Trị Mặc Định | Mô Tả Ý Nghĩa Nghiệp Vụ |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY` | `gen_random_uuid()` | Khóa chính duy nhất định danh người dùng toàn hệ thống |
| `username` | `TEXT` | `UNIQUE, NOT NULL` | Không | Tên tài khoản đăng nhập (VD: `admin`, `0973924819`) |
| `password` | `TEXT` | `NOT NULL` | Không | Mật khẩu đã được băm an toàn bằng thuật toán Bcrypt salt 10 |
| `email` | `TEXT` | `UNIQUE, NULLABLE` | Không | Địa chỉ email liên hệ và nhận mã xác thực OTP |
| `name` | `TEXT` | `NULLABLE` | Không | Họ và tên đầy đủ hiển thị trên hệ thống |
| `avatar_url` | `TEXT` | `NULLABLE` | Không | Đường dẫn ảnh chân dung đại diện |
| `cover_url` | `TEXT` | `NULLABLE` | Không | Đường dẫn ảnh bìa trang cá nhân |
| `google_id` | `TEXT` | `UNIQUE, NULLABLE` | Không | Mã định danh tài khoản Google liên kết |
| `apple_id` | `TEXT` | `UNIQUE, NULLABLE` | Không | Mã định danh tài khoản Apple ID liên kết |
| `email_verified`| `BOOLEAN` | `NULLABLE` | `false` | Trạng thái email đã được xác minh qua liên kết kích hoạt |
| `apple_refresh_token`| `TEXT` | `NULLABLE` | Không | Refresh token ủy quyền từ Apple Sign-In |
| `created_at` | `TIMESTAMPTZ`| `NOT NULL` | `now()` | Thời điểm tạo tài khoản |
| `updated_at` | `TIMESTAMPTZ`| `NOT NULL` | `now()` | Thời điểm cập nhật thông tin tài khoản gần nhất |

---

### 2.2. Bảng `public.members` (Hồ Sơ 360 Độ Hội Viên CLB CEO 1983)
*Mô tả nghiệp vụ:* Lưu trữ hồ sơ toàn diện của hơn 500+ doanh nhân hội viên, chức vụ, ban chuyên môn, tình trạng hội phí và mã số chuẩn hóa.

| Tên Cột | Kiểu Dữ Liệu | Ràng Buộc | Giá Trị Mặc Định | Mô Tả Ý Nghĩa Nghiệp Vụ |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `TEXT` | `PRIMARY KEY` | Không | Mã định danh duy nhất (UUID dạng chuỗi) |
| `user_id` | `UUID` | `FOREIGN KEY` | `NULL` | Khóa ngoại nối với bảng `ceo1983_users(id)` |
| `code` | `TEXT` | `UNIQUE, NOT NULL` | Không | Mã số hội viên chuẩn hóa CLB (VD: `CEO1983-001`, `CEO1983-088`) |
| `name` | `TEXT` | `NOT NULL` | Không | Họ và tên đầy đủ của doanh nhân hội viên |
| `contact` | `TEXT` | `NOT NULL` | `''` | Tên người đại diện hoặc thư ký riêng |
| `email` | `TEXT` | `NOT NULL` | `''` | Địa chỉ email liên hệ công việc |
| `phone` | `TEXT` | `NOT NULL` | `''` | Số điện thoại liên lạc chính (10-11 chữ số) |
| `type` | `TEXT` | `NOT NULL` | `'business'` | Loại hình hội viên (`business` - Doanh nhân, `individual`) |
| `level` | `TEXT` | `NOT NULL` | `'official'` | Cấp bậc (`official` - Chính thức, `honorary` - Danh dự, `vip`) |
| `industry` | `TEXT` | `NOT NULL` | Không | Ngành nghề kinh doanh chủ lực (Bất động sản, IT, Xây dựng...) |
| `region` | `TEXT` | `NOT NULL` | `'Hà Nội'` | Khu vực địa lý sinh hoạt (Hà Nội, Miền Bắc, Toàn quốc) |
| `status` | `TEXT` | `NOT NULL` | `'active'` | Trạng thái (`active`, `pending`, `expired`, `locked`) |
| `joined_at` | `DATE` | `NOT NULL` | Không | Ngày chính thức được kết nạp vào CLB CEO 1983 |
| `fee_year` | `INTEGER` | `NOT NULL` | `2026` | Năm niên khóa hội phí hiện hành |
| `fee_paid` | `BOOLEAN` | `NOT NULL` | `false` | Đã hoàn thành đóng hội phí thường niên hay chưa |
| `address` | `TEXT` | `NOT NULL` | `''` | Địa chỉ trụ sở văn phòng làm việc |
| `department` | `TEXT` | `NULLABLE` | Không | Ban chuyên môn sinh hoạt (Ban Giao Thương, Ban Truyền Thông...) |
| `executive_role`| `TEXT` | `NULLABLE` | Không | Chức vụ trong Ban Điều Hành (Chủ tịch, Phó Chủ tịch, Trưởng Ban) |
| `avatar_url` | `TEXT` | `NULLABLE` | Không | Ảnh chân dung doanh nhân chuyên nghiệp |
| `created_at` | `TIMESTAMPTZ`| `NOT NULL` | `now()` | Ngày tạo hồ sơ |
| `updated_at` | `TIMESTAMPTZ`| `NOT NULL` | `now()` | Ngày cập nhật hồ sơ gần nhất |

---

### 2.3. Bảng `public.companies` (Hồ Sơ Doanh Nghiệp Thành Viên)
| Tên Cột | Kiểu Dữ Liệu | Ràng Buộc | Giá Trị Mặc Định | Mô Tả Ý Nghĩa Nghiệp Vụ |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY` | `gen_random_uuid()` | Khóa chính duy nhất của doanh nghiệp |
| `owner_user_id` | `UUID` | `FOREIGN KEY` | Không | Khóa ngoại nối với tài khoản chủ doanh nghiệp |
| `name` | `TEXT` | `NOT NULL` | Không | Tên pháp nhân đăng ký kinh doanh đầy đủ |
| `slug` | `TEXT` | `UNIQUE, NOT NULL`| Không | Đường dẫn URL định danh công ty |
| `logo_url` | `TEXT` | `NULLABLE` | Không | Logo nhận diện thương hiệu |
| `cover_url` | `TEXT` | `NULLABLE` | Không | Ảnh bìa quảng bá trụ sở/nhà xưởng |
| `industry` | `TEXT` | `NULLABLE` | Không | Lĩnh vực kinh doanh chủ lực |
| `size` | `TEXT` | `NULLABLE` | Không | Quy mô nhân sự (VD: `50 - 100 nhân sự`) |
| `country` | `TEXT` | `NULLABLE` | `'Việt Nam'` | Quốc gia đặt trụ sở |
| `city` | `TEXT` | `NULLABLE` | `'Hà Nội'` | Tỉnh / Thành phố |
| `website` | `TEXT` | `NULLABLE` | Không | Địa chỉ website doanh nghiệp |
| `email` | `TEXT` | `NULLABLE` | Không | Email tiếp nhận liên hệ hợp tác B2B |
| `phone` | `TEXT` | `NULLABLE` | Không | Số hotline doanh nghiệp |
| `description` | `TEXT` | `NULLABLE` | Không | Năng lực sản xuất, sản phẩm dịch vụ thế mạnh |
| `verified` | `BOOLEAN` | `NOT NULL` | `false` | Trạng thái được CLB thẩm định và cấp huy hiệu uy tín |
| `created_at` | `TIMESTAMPTZ`| `NOT NULL` | `now()` | Ngày tạo hồ sơ doanh nghiệp |

---

### 2.4. Bảng `public.member_business_cards` (Danh Thiếp Điện Tử Thông Minh)
| Tên Cột | Kiểu Dữ Liệu | Ràng Buộc | Giá Trị Mặc Định | Mô Tả Ý Nghĩa Nghiệp Vụ |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY` | `gen_random_uuid()` | Khóa chính danh thiếp điện tử |
| `member_id` | `TEXT` | `FOREIGN KEY` | Không | Khóa ngoại nối với `members(id)` |
| `slug` | `TEXT` | `UNIQUE, NOT NULL`| Không | URL danh thiếp công khai (VD: `/card/ceo-pham-vu`) |
| `card_kind` | `TEXT` | `NOT NULL` | `'primary'` | Loại danh thiếp (`primary` - Chính, `secondary`) |
| `status` | `TEXT` | `NOT NULL` | `'draft'` | Trạng thái (`published`, `draft`, `archived`) |
| `public_mode` | `TEXT` | `NOT NULL` | `'members_only'`| Chế độ hiển thị (`public`, `members_only`) |
| `display_name` | `TEXT` | `NULLABLE` | Không | Họ tên hiển thị trên danh thiếp |
| `professional_title`| `TEXT` | `NULLABLE` | Không | Chức danh chuyên môn (Chủ tịch HĐQT, Tổng Giám Đốc) |
| `company_name` | `TEXT` | `NULLABLE` | Không | Tên doanh nghiệp đại diện |
| `avatar_url` | `TEXT` | `NULLABLE` | Không | Ảnh chân dung đại diện vCard |
| `cover_url` | `TEXT` | `NULLABLE` | Không | Ảnh bìa vCard |
| `created_at` | `TIMESTAMPTZ`| `NOT NULL` | `now()` | Ngày khởi tạo danh thiếp số |

---

### 2.5. Bảng `public.opportunities` (Cơ Hội Giao Thương B2B)
| Tên Cột | Kiểu Dữ Liệu | Ràng Buộc | Giá Trị Mặc Định | Mô Tả Ý Nghĩa Nghiệp Vụ |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `TEXT` | `PRIMARY KEY` | Không | Mã định danh cơ hội giao thương |
| `poster_id` | `TEXT` | `FOREIGN KEY` | Không | Mã hội viên đăng bài chào mua / chào bán |
| `title` | `TEXT` | `NOT NULL` | Không | Tiêu đề cơ hội (VD: Tìm đối tác cung ứng nhôm kính) |
| `description` | `TEXT` | `NOT NULL` | `''` | Mô tả chi tiết yêu cầu kỹ thuật và điều kiện giao hàng |
| `type` | `TEXT` | `NOT NULL` | Không | Loại cơ hội (`buy` - Chào mua, `sell` - Chào bán, `partner`) |
| `budget_min` | `BIGINT` | `NULLABLE` | Không | Ngân sách dự kiến tối thiểu (VNĐ) |
| `budget_max` | `BIGINT` | `NULLABLE` | Không | Ngân sách dự kiến tối đa (VNĐ) |
| `region` | `TEXT` | `NOT NULL` | `''` | Khu vực thực hiện hợp đồng |
| `industry` | `TEXT` | `NOT NULL` | `''` | Lĩnh vực ngành nghề |
| `deadline` | `TIMESTAMPTZ`| `NOT NULL` | Không | Hạn chót nhận hồ sơ chào thầu |
| `status` | `TEXT` | `NOT NULL` | `'open'` | Trạng thái (`open`, `in_negotiation`, `won`, `expired`) |
| `views` | `INTEGER` | `NOT NULL` | `0` | Số lượt xem bài viết |
| `created_at` | `TIMESTAMPTZ`| `NOT NULL` | `now()` | Ngày đăng tin |

---

### 2.6. Bảng `public.opportunity_interests` (Bày Tỏ Quan Tâm & Đàm Phán B2B)
| Tên Cột | Kiểu Dữ Liệu | Ràng Buộc | Giá Trị Mặc Định | Mô Tả Ý Nghĩa Nghiệp Vụ |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `TEXT` | `PRIMARY KEY` | Không | Mã định danh quan tâm |
| `opportunity_id`| `TEXT` | `FOREIGN KEY` | Không | Khóa ngoại nối với `opportunities(id)` |
| `member_id` | `TEXT` | `FOREIGN KEY` | Không | Khóa ngoại mã hội viên bày tỏ quan tâm |
| `message` | `TEXT` | `NOT NULL` | `''` | Lời nhắn giới thiệu năng lực hợp tác |
| `contact` | `TEXT` | `NOT NULL` | `''` | Số điện thoại liên hệ trực tiếp |
| `interest_level`| `TEXT` | `NOT NULL` | `'high'` | Mức độ quan tâm (`high`, `medium`, `exploring`) |
| `deal_value` | `NUMERIC` | `NULLABLE` | `0` | Giá trị hợp đồng thực tế đã ký kết (VNĐ) |
| `deal_percent` | `NUMERIC` | `NULLABLE` | `0` | Tỷ lệ chiết khấu ưu đãi dành riêng cho hội viên (%) |
| `created_at` | `TIMESTAMPTZ`| `NOT NULL` | `now()` | Thời điểm bày tỏ quan tâm |

---

### 2.7. Bảng `public.products` (Gian Hàng Sản Phẩm Ưu Đãi Nội Khối)
| Tên Cột | Kiểu Dữ Liệu | Ràng Buộc | Giá Trị Mặc Định | Mô Tả Ý Nghĩa Nghiệp Vụ |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `TEXT` | `PRIMARY KEY` | Không | Mã định danh sản phẩm |
| `seller_id` | `TEXT` | `FOREIGN KEY` | Không | Mã hội viên bán hàng |
| `title` | `TEXT` | `NOT NULL` | Không | Tên sản phẩm / dịch vụ |
| `description` | `TEXT` | `NOT NULL` | `''` | Quy cách đóng gói, thông số kỹ thuật |
| `price` | `BIGINT` | `NOT NULL` | `0` | Giá bán niêm yết (VNĐ) |
| `category` | `TEXT` | `NOT NULL` | Không | Danh mục phân loại sản phẩm |
| `status` | `TEXT` | `NOT NULL` | `'active'` | Trạng thái mở bán (`active`, `hidden`, `out_of_stock`) |
| `image_urls` | `TEXT[]` | `NOT NULL` | `'{}'` | Danh sách đường dẫn ảnh sản phẩm sắc nét |
| `pdf_url` | `TEXT` | `NULLABLE` | Không | Đường dẫn catalogue sản phẩm dạng PDF |
| `created_at` | `TIMESTAMPTZ`| `NOT NULL` | `now()` | Ngày niêm yết sản phẩm |

---

### 2.8. Bảng `public.events` (Sự Kiện Gala, Đại Hội & Hội Thảo Chuyên Đề)
| Tên Cột | Kiểu Dữ Liệu | Ràng Buộc | Giá Trị Mặc Định | Mô Tả Ý Nghĩa Nghiệp Vụ |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `TEXT` | `PRIMARY KEY` | Không | Mã định danh sự kiện |
| `name` | `TEXT` | `NOT NULL` | Không | Tên sự kiện (VD: Gala Doanh Nhân CEO 1983 & B2B 2026) |
| `date` | `DATE` | `NOT NULL` | Không | Ngày diễn ra sự kiện |
| `location` | `TEXT` | `NOT NULL` | `''` | Địa điểm tổ chức (Keangnam Landmark 72, Hà Nội) |
| `capacity` | `INTEGER` | `NOT NULL` | `0` | Sức chứa tối đa số lượng đại biểu |
| `registered` | `INTEGER` | `NOT NULL` | `0` | Số lượng đại biểu đã đăng ký thực tế |
| `status` | `TEXT` | `NOT NULL` | `'upcoming'` | Trạng thái (`upcoming` - Sắp tới, `ongoing`, `completed`) |
| `type` | `TEXT` | `NOT NULL` | `'forum'` | Loại sự kiện (`gala`, `forum`, `sports`, `charity`) |
| `banner_url` | `TEXT` | `NULLABLE` | Không | Đường dẫn ảnh poster thư mời đồ họa cao cấp 9:16 |
| `seating_map` | `JSONB` | `NULLABLE` | `'{}'` | Sơ đồ phân bổ bàn tiệc VIP và danh sách khách mời |
| `created_at` | `TIMESTAMPTZ`| `NOT NULL` | `now()` | Thời điểm tạo sự kiện |

---

### 2.9. Bảng `public.event_registrations` (Vé Điện Tử & Check-in QR Động)
| Tên Cột | Kiểu Dữ Liệu | Ràng Buộc | Giá Trị Mặc Định | Mô Tả Ý Nghĩa Nghiệp Vụ |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `TEXT` | `PRIMARY KEY` | Không | Mã định danh đăng ký |
| `event_id` | `TEXT` | `FOREIGN KEY` | Không | Khóa ngoại nối với `events(id)` |
| `member_id` | `TEXT` | `FOREIGN KEY` | Không | Khóa ngoại nối với `members(id)` |
| `ticket_code` | `TEXT` | `UNIQUE, NOT NULL`| Không | Mã vé mời điện tử duy nhất (VD: `CEO1983-VIP-088`) |
| `qr_code_url` | `TEXT` | `NULLABLE` | Không | Ảnh QR sinh động dẫn link Web mở modal đăng ký |
| `table_number`| `TEXT` | `NULLABLE` | Không | Số hiệu bàn tiệc danh dự (VD: `Bàn 08 - Khách VIP`) |
| `seat_number` | `TEXT` | `NULLABLE` | Không | Số ghế danh dự (VD: `Ghế 03`) |
| `is_checked_in`| `BOOLEAN` | `NOT NULL` | `false` | Trạng thái đại biểu đã qua cổng đón tiếp |
| `checked_in_at`| `TIMESTAMPTZ`| `NULLABLE` | Không | Thời điểm quét mã check-in |
| `status` | `TEXT` | `NOT NULL` | `'confirmed'` | Trạng thái vé (`confirmed`, `cancelled`, `waitlist`) |
| `created_at` | `TIMESTAMPTZ`| `NOT NULL` | `now()` | Thời điểm cấp vé mời |

---

### 2.10. Bảng `public.meetings` (Kỳ Họp Ban & Lịch Hẹn 1-on-1)
| Tên Cột | Kiểu Dữ Liệu | Ràng Buộc | Giá Trị Mặc Định | Mô Tả Ý Nghĩa Nghiệp Vụ |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `TEXT` | `PRIMARY KEY` | Không | Mã định danh cuộc họp |
| `title` | `TEXT` | `NOT NULL` | Không | Tiêu đề kỳ họp hoặc cuộc hẹn 1-on-1 |
| `date` | `DATE` | `NOT NULL` | Không | Ngày diễn ra cuộc họp |
| `time` | `TEXT` | `NOT NULL` | `''` | Khung giờ làm việc (VD: `08:30 - 11:30`) |
| `location` | `TEXT` | `NOT NULL` | `''` | Địa điểm hội trường hoặc trụ sở công ty |
| `meeting_type`| `TEXT` | `NOT NULL` | `'regular'` | Phân loại: `regular` (Cố định theo ban), `extraordinary` (Đột xuất), `1on1` |
| `meeting_mode`| `TEXT` | `NOT NULL` | `'offline'` | Hình thức: `offline` (Trực tiếp), `online` (Jitsi Meet trực tuyến) |
| `department` | `TEXT` | `NULLABLE` | Không | Ban chuyên môn tổ chức kỳ họp |
| `zoom_url` | `TEXT` | `NULLABLE` | Không | Đường link phòng họp trực tuyến Jitsi Meet nội bộ |
| `target_members`| `JSONB` | `NULLABLE` | `'[]'` | Danh sách mã hội viên được triệu tập tham dự |
| `attendees` | `INTEGER` | `NOT NULL` | `0` | Số lượng đại biểu xác nhận tham dự |
| `status` | `TEXT` | `NOT NULL` | `'scheduled'` | Trạng thái (`scheduled`, `completed`, `cancelled`) |
| `created_at` | `TIMESTAMPTZ`| `NOT NULL` | `now()` | Thời điểm tạo lịch họp |

---

### 2.11. Bảng `public.transactions` (Lịch Sử Giao Dịch Thu - Chi & Hội Phí)
| Tên Cột | Kiểu Dữ Liệu | Ràng Buộc | Giá Trị Mặc Định | Mô Tả Ý Nghĩa Nghiệp Vụ |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY` | `gen_random_uuid()` | Khóa chính giao dịch tài chính |
| `code` | `TEXT` | `UNIQUE, NOT NULL`| Không | Mã chứng từ kế toán duy nhất (VD: `TX-CEO1983-2026-0012`) |
| `date` | `DATE` | `NOT NULL` | Không | Ngày phát sinh giao dịch |
| `type` | `TEXT` | `NOT NULL` | Không | Loại giao dịch (`income` - Thu, `expense` - Chi) |
| `category` | `TEXT` | `NOT NULL` | Không | Hạng mục (`membership_fee` - Hội phí, `sponsorship`, `event`) |
| `description` | `TEXT` | `NOT NULL` | `''` | Nội dung giao dịch chi tiết |
| `amount` | `BIGINT` | `NOT NULL` | `0` | Số tiền thực nhận / thực chi (VNĐ) |
| `method` | `TEXT` | `NOT NULL` | Không | Phương thức (`vnpay`, `momo_qr`, `bank_transfer`, `cash`) |
| `status` | `TEXT` | `NOT NULL` | `'PAID'` | Trạng thái (`PAID` - Đã thanh toán, `PENDING`, `REFUNDED`) |
| `invoice_url` | `TEXT` | `NULLABLE` | Không | Đường dẫn biên lai điện tử / hóa đơn chứng từ PDF |
| `created_at` | `TIMESTAMPTZ`| `NOT NULL` | `now()` | Thời điểm ghi nhận giao dịch |

---

### 2.12. Bảng `public.app_settings` (Cấu Hình Hệ Thống & Quản Trị Token 24/7)
| Tên Cột | Kiểu Dữ Liệu | Ràng Buộc | Giá Trị Mặc Định | Mô Tả Ý Nghĩa Nghiệp Vụ |
| :--- | :--- | :--- | :--- | :--- |
| `key` | `TEXT` | `PRIMARY KEY` | Không | Khóa cấu hình (`zalo_oa_config`, `smtp_mail`, `vnpay_config`, `sidebar_labels`) |
| `value` | `JSONB` | `NOT NULL` | `'{}'` | Dữ liệu cấu hình JSON (chứa tokens, secret keys, tham số vận hành) |
| `updated_by` | `UUID` | `NULLABLE` | Không | ID quản trị viên cập nhật cấu hình |
| `created_at` | `TIMESTAMPTZ`| `NOT NULL` | `now()` | Ngày tạo khóa cấu hình |
| `updated_at` | `TIMESTAMPTZ`| `NOT NULL` | `now()` | Thời điểm cập nhật (được cập nhật mỗi 15 phút bởi tiến trình Zalo token) |

---

### 2.13. Bảng `public.documents` (Kho Văn Thư Số Hóa)
| Tên Cột | Kiểu Dữ Liệu | Ràng Buộc | Giá Trị Mặc Định | Mô Tả Ý Nghĩa Nghiệp Vụ |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY` | `gen_random_uuid()` | Khóa chính tài liệu |
| `code` | `TEXT` | `NOT NULL` | Không | Số hiệu công văn / văn bản (VD: `CV-1983-04/HANOIBA`) |
| `name` | `TEXT` | `NOT NULL` | Không | Tiêu đề văn bản (VD: Điều lệ hoạt động CLB CEO 1983) |
| `category` | `TEXT` | `NOT NULL` | Không | Danh mục (`charter`, `decision`, `report`, `minutes`) |
| `type` | `TEXT` | `NOT NULL` | Không | Định dạng tệp (`docx`, `xlsx`, `pdf`) |
| `size` | `TEXT` | `NOT NULL` | `''` | Dung lượng tệp tin (VD: `2.4 MB`) |
| `file_path` | `TEXT` | `NULLABLE` | Không | Đường dẫn lưu trữ nội bộ trên máy chủ |
| `uploaded_by` | `TEXT` | `NOT NULL` | `''` | Người tải lên tài liệu |
| `uploaded_at` | `DATE` | `NOT NULL` | `now()` | Ngày ban hành văn bản |

---

### 2.14. Bảng `public.feed_posts` (Bảng Tin Mạng Lưới)
| Tên Cột | Kiểu Dữ Liệu | Ràng Buộc | Giá Trị Mặc Định | Mô Tả Ý Nghĩa Nghiệp Vụ |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY` | `gen_random_uuid()` | Khóa chính bài viết |
| `title` | `TEXT` | `NULLABLE` | Không | Tiêu đề bài viết |
| `content` | `TEXT` | `NULLABLE` | Không | Nội dung văn bản chia sẻ |
| `category` | `TEXT` | `NULLABLE` | `'general'` | Chuyên mục (`news`, `announcement`, `b2b`, `event`) |
| `author_id` | `TEXT` | `NULLABLE` | Không | Mã hội viên tác giả |
| `author_name` | `TEXT` | `NULLABLE` | Không | Tên hiển thị của tác giả |
| `author_company`| `TEXT` | `NULLABLE` | Không | Doanh nghiệp của tác giả |
| `images` | `TEXT[]` | `NULLABLE` | `'{}'` | Danh sách đường dẫn ảnh đính kèm bài viết |
| `likes_count` | `INTEGER` | `NULLABLE` | `0` | Số lượt thả tim / chúc mừng |
| `comments_count`| `INTEGER` | `NULLABLE` | `0` | Tổng số lượng bình luận đa tầng |
| `created_at` | `TIMESTAMPTZ`| `NOT NULL` | `now()` | Thời điểm đăng bài |

---

### 2.15. Bảng `public.feed_comments` (Bình Luận Cây 3 Cấp)
| Tên Cột | Kiểu Dữ Liệu | Ràng Buộc | Giá Trị Mặc Định | Mô Tả Ý Nghĩa Nghiệp Vụ |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY` | `gen_random_uuid()` | Khóa chính bình luận |
| `post_id` | `TEXT` | `NOT NULL` | Không | Khóa ngoại nối với `feed_posts(id)` |
| `author_id` | `TEXT` | `NULLABLE` | Không | Mã hội viên bình luận |
| `author_name` | `TEXT` | `NULLABLE` | Không | Tên hội viên bình luận |
| `author_avatar`| `TEXT` | `NULLABLE` | Không | Ảnh đại diện của tác giả bình luận |
| `content` | `TEXT` | `NULLABLE` | Không | Nội dung phản hồi |
| `parent_id` | `TEXT` | `NULLABLE` | Không | ID bình luận cha (nếu là phản hồi cấp 2 hoặc cấp 3) |
| `level` | `INTEGER` | `NULLABLE` | `1` | Cấp độ bình luận: `1` (gốc), `2` (phản hồi), `3` (phản hồi con) |
| `reply_to_author_name`| `TEXT`| `NULLABLE`| Không | Tên người được nhắc đến khi trả lời |
| `created_at` | `TIMESTAMPTZ`| `NOT NULL` | `now()` | Thời điểm gửi bình luận |

---

### 2.16. Bảng `public.tasks` (Quản Lý Phân Bổ Công Việc Kanban)
| Tên Cột | Kiểu Dữ Liệu | Ràng Buộc | Giá Trị Mặc Định | Mô Tả Ý Nghĩa Nghiệp Vụ |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY` | `gen_random_uuid()` | Khóa chính đầu việc |
| `title` | `TEXT` | `NOT NULL` | Không | Tên nhiệm vụ / công việc |
| `description` | `TEXT` | `NULLABLE` | `''` | Mô tả chi tiết yêu cầu công việc |
| `department` | `TEXT` | `NULLABLE` | Không | Ban chuyên môn chịu trách nhiệm chính |
| `assignee_id` | `TEXT` | `NULLABLE` | Không | Mã hội viên được giao thực hiện |
| `priority` | `TEXT` | `NOT NULL` | `'medium'` | Mức độ ưu tiên (`high`, `medium`, `low`) |
| `status` | `TEXT` | `NOT NULL` | `'todo'` | Trạng thái Kanban (`todo`, `in_progress`, `review`, `done`) |
| `deadline` | `TIMESTAMPTZ`| `NULLABLE` | Không | Thời hạn chót hoàn thành |
| `created_at` | `TIMESTAMPTZ`| `NOT NULL` | `now()` | Ngày tạo nhiệm vụ |

---

### 2.17. Bảng `public.user_connections` (Mạng Lưới Bạn Bè & Đối Tác B2B)
| Tên Cột | Kiểu Dữ Liệu | Ràng Buộc | Giá Trị Mặc Định | Mô Tả Ý Nghĩa Nghiệp Vụ |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY` | `gen_random_uuid()` | Khóa chính kết nối |
| `user_id` | `UUID` | `FOREIGN KEY` | Không | ID tài khoản người khởi tạo kết nối |
| `partner_id` | `UUID` | `FOREIGN KEY` | Không | ID tài khoản đối tác được kết nối |
| `status` | `TEXT` | `NOT NULL` | `'connected'` | Trạng thái (`pending`, `connected`, `blocked`) |
| `connected_at`| `TIMESTAMPTZ`| `NOT NULL` | `now()` | Thời điểm chính thức kết nối |

---

### 2.18. Bảng `public.dismissed_notifications` (Lưu Vết Đóng Badge Thông Báo)
| Tên Cột | Kiểu Dữ Liệu | Ràng Buộc | Giá Trị Mặc Định | Mô Tả Ý Nghĩa Nghiệp Vụ |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY` | `gen_random_uuid()` | Khóa chính bản ghi |
| `user_id` | `UUID` | `FOREIGN KEY` | Không | ID người dùng nhấp vào thông báo |
| `feature_key` | `TEXT` | `NOT NULL` | Không | Tên chức năng được dismiss badge (VD: `events`, `fees`) |
| `dismissed_at`| `TIMESTAMPTZ`| `NOT NULL` | `now()` | Thời điểm click làm mất số thông báo |

---

## PHẦN III: ĐẶC TẢ CHI TIẾT CÁC PHÂN HỆ RESTFUL API (API SPECIFICATIONS)

> **Cổng truy cập API chuẩn hóa (Base URL):**
> - Web CRM: `https://crm.ceo1983.viconnect.vn/api`
> - Mobile App: `https://ceo1983.viconnect.vn/api`

---

### 3.1. Phân Hệ Xác Thực & Phân Quyền Vai Trò (Auth Controller API)

#### 1. `POST /api/auth/login` (Đăng Nhập Hệ Thống)
- **Mục đích:** Xác thực tài khoản người dùng và cấp phát JWT token.
- **Quyền hạn:** `Public`.
- **Request Body:**
  ```json
  {
    "username": "admin@connect.vn",
    "password": "PasswordSecure@1983"
  }
  ```
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "accessToken": "eyJhbGciOiJIUzI1NiIsIn...",
    "refreshToken": "d8e3b7c2-4a11-4f9e...",
    "user": {
      "id": "c1f7a8b4-0000-4000-8000-000000000001",
      "username": "admin",
      "email": "admin@connect.vn",
      "name": "Quản Trị Viên Tối Cao",
      "role": "SUPER_ADMIN",
      "memberId": "CEO1983-ADMIN"
    }
  }
  ```
- **Lỗi `401 Unauthorized`:** `{ "message": "Thông tin đăng nhập hoặc mật khẩu không chính xác." }`.

---

#### 2. `POST /api/auth/refresh` (Làm Mới Token Đăng Nhập)
- **Mục đích:** Cấp lại Access Token mới khi token cũ gần hết hạn.
- **Request Body:** `{ "refreshToken": "d8e3b7c2-4a11-4f9e..." }`.
- **Response `200 OK`:** `{ "accessToken": "eyJhbGciOi..." }`.

---

### 3.2. Phân Hệ Quản Trị Hội Viên 360 Độ & Xét Duyệt (Members Controller API)

#### 1. `GET /api/members` (Lấy Danh Sách Hội Viên Có Phân Trang & Bộ Lọc)
- **Mục đích:** Truy vấn danh sách 500+ doanh nhân hội viên phục vụ tra cứu trên CRM và danh bạ App.
- **Quyền hạn:** `MEMBER`, `MODERATOR`, `ADMIN`.
- **Query Parameters:** `page=1&limit=20&search=PhamVu&department=BanGiaoThuong&status=active`.
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "m1983-088",
        "code": "CEO1983-088",
        "name": "Phạm Vũ",
        "phone": "0973924819",
        "email": "phamvu@viconnect.vn",
        "companyName": "Công ty CP Chuyển Đổi Số VICONNECT",
        "position": "Chủ Tịch HĐQT",
        "department": "Ban Thường Trực",
        "executiveRole": "Phó Chủ Tịch CLB",
        "tier": "official",
        "status": "active",
        "avatarUrl": "https://storage.ceo1983.vn/avatars/phamvu.jpg"
      }
    ],
    "meta": { "total": 520, "page": 1, "limit": 20 }
  }
  ```

---

#### 2. `POST /api/members/approve/:id` (Phê Duyệt Kết Nạp Hội Viên Mới)
- **Mục đích:** Phê duyệt đơn gia nhập, tự động sinh mã số và gửi email chào mừng.
- **Quyền hạn:** `ADMIN`, `SUPER_ADMIN`.
- **Path Param:** `:id` — ID hồ sơ hội viên đang ở trạng thái `pending`.
- **Request Body:**
  ```json
  {
    "approvedRole": "official",
    "assignedDepartment": "Ban Giao Thương",
    "executiveRole": "Thành viên"
  }
  ```
- **Response `200 OK`:** Cập nhật `status: 'active'`, sinh mã `code: 'CEO1983-089'`, bắn email kèm link `/open-app`.

---

#### 3. `POST /api/members/import-excel` (Nạp Dữ Liệu Hàng Loạt Từ Bảng Tính Excel)
- **Mục đích:** Nhập hàng trăm hội viên từ bảng tính Excel mà không bị lỗi font hoặc sai lệch cột.
- **Request Body (Multipart Form-data):** `file: [danh_sach_hoi_vien.xlsx]`.
- **Response `200 OK`:** `{ "success": true, "importedCount": 150, "skippedCount": 2 }`.

---

#### 4. `GET /api/members/export-excel` (Xuất Báo Cáo Bảng Tính 3 Chế Độ)
- **Query Parameter:** `mode=full | fees | b2b`.
- **Response `200 OK`:** Trả về file stream nhị phân `.xlsx` chuẩn MIME `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`.

---

### 3.3. Phân Hệ Studio Thư Mời Chuẩn Pinterest & Gửi Đa Kênh (Templates & Broadcast API)

#### 1. `POST /api/templates/invitation/generate` (Lưu & Xuất Cấu Hình Thư Mời)
- **Mục đích:** Lưu trữ cấu hình tọa độ kéo thả chuột, kiểu bóc tách cắt ảnh và xuất file ảnh poster.
- **Quyền hạn:** `MODERATOR`, `ADMIN`.
- **Request Body:**
  ```json
  {
    "category": "event",
    "theme": "wyndham_heian",
    "kicker": "CLB DOANH NHÂN CEO 1983 (HANOIBA)",
    "title": "DÒNG CHẢY HẠNH PHÚC",
    "subtitle": "TRÂN TRỌNG KÍNH MỜI QUÝ HỘI VIÊN & ĐỐI TÁC",
    "capsuleBadge": "QUÀ TẶNG VOUCHER NGHỈ DƯỠNG KHOÁNG NÓNG ONSET",
    "dateText": "08:30 · THỨ BẢY",
    "dateNumbers": "06 | 04 | 24",
    "location": "Keangnam Landmark 72, Phạm Hùng, Hà Nội",
    "cutoutConfig": {
      "enabled": true,
      "url": "https://storage.ceo1983.vn/templates/heian_gate_venue.jpg",
      "shape": "arch",
      "y": 62,
      "scale": 105,
      "opacity": 95
    },
    "blocksLayout": {
      "title": { "x": 50, "y": 28, "hasFrostedBg": false },
      "date": { "x": 50, "y": 78, "hasFrostedBg": true }
    }
  }
  ```
- **Response `201 Created`:** Lưu template vào CSDL và trả về ID mẫu.

---

#### 2. `POST /api/templates/broadcast/send` (Phát Sóng Đa Kênh 1-Chạm)
- **Mục đích:** Gửi thông báo đồng thời tới App, Zalo OA ZNS và Email.
- **Request Body:**
  ```json
  {
    "channels": ["app", "zalo_oa", "email"],
    "recipientType": "all_active",
    "templateId": "tmpl-invitation-2026-04",
    "customTitle": "Thư Mời Tham Dự Gala Dòng Chảy Hạnh Phúc 2026",
    "posterUrl": "https://storage.ceo1983.vn/templates/poster_wyndham_hd.png"
  }
  ```
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "dispatched": {
      "appPush": 512,
      "zaloZns": 498,
      "emailHtml": 520
    }
  }
  ```

---

### 3.4. Phân Hệ Tự Động Hóa Zalo OA & Quản Trị Token 24/7 (Zalo Controller API)

#### 1. `GET /api/zalo/config` (Lấy Cấu Hình Kết Nối Zalo OA Tinh Gọn)
- **Mục đích:** Hiển thị 3 trường kết nối và trạng thái hoạt động của token.
- **Quyền hạn:** `SUPER_ADMIN`.
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "appId": "412389128391283",
    "hasSecretKey": true,
    "hasRefreshToken": true,
    "status": "connected",
    "oaName": "CLB CEO 1983",
    "lastRefreshedAt": "2026-11-09T14:15:00.000Z",
    "tokenExpiresInHours": 21.5
  }
  ```

---

#### 2. `POST /api/zalo/refresh-token` (Làm Mới Token Tức Thời)
- **Mục đích:** Cưỡng chế tiến trình gọi API Zalo OAuth v4 để lấy cặp tokens mới ngay lập tức.
- **Response `200 OK`:** `{ "success": true, "refreshedAt": "2026-11-09T14:35:00.000Z" }`.

---

#### 3. `POST /api/zalo/test` (Bắn Thử Nghiệm Tin Nhắn ZNS)
- **Request Body:**
  ```json
  {
    "phone": "0973924819",
    "templateType": "event_invitation",
    "params": {
      "member_name": "Phạm Vũ",
      "event_name": "Gala Doanh Nhân CEO 1983",
      "event_time": "08:30 15/11/2026",
      "qr_link": "https://ceo1983.viconnect.vn/association/events?action=register&ticket=CEO1983-VIP-088"
    }
  }
  ```
- **Response `200 OK`:** `{ "success": true, "messageId": "msg-zalo-89123812" }`.

---

### 3.5. Phân Hệ Sự Kiện, Vé Điện Tử & Soát Vé QR Động Keangnam (Events Controller API)

#### 1. `GET /api/events/qr` (Sinh Mã QR Vé Mời Động URL)
- **Mục đích:** Sinh ảnh mã QR vé mời dẫn trực tiếp tới Web URL để khi quét bằng camera điện thoại/Zalo sẽ tự động mở liên kết.
- **Query Parameters:**
  - `data`: Chuỗi URL hoặc mã vé (VD: `https://ceo1983.viconnect.vn/association/events?action=register&ticket=CEO1983-VIP-088`).
  - `size`: Kích thước ảnh (Mặc định: `320`).
- **Response `200 OK`:** Trả về `image/png` trực tiếp kèm header cache 24h.

---

#### 2. `POST /api/events/:id/checkin` (Soát Vé Điện Tử Tại Cổng Dưới 0.5 Giây)
- **Mục đích:** Lễ tân quét vé đại biểu tại cổng Keangnam, xác thực hợp lệ và điều hướng số bàn tiệc danh dự.
- **Path Param:** `:id` — ID sự kiện.
- **Request Body:** `{ "ticketCode": "CEO1983-VIP-088" }`.
- **Response `200 OK` (Hợp Lệ):**
  ```json
  {
    "success": true,
    "status": "APPROVED",
    "memberName": "Phạm Vũ",
    "company": "Công ty CP Chuyển Đổi Số VICONNECT",
    "tableNumber": "Bàn 08 - Khách VIP",
    "seatNumber": "Ghế 03",
    "checkedInAt": "2026-11-09T14:40:12.000Z"
  }
  ```
- **Lỗi `400 Bad Request` (Vé Trùng Lặp):**
  ```json
  {
    "success": false,
    "status": "DUPLICATE",
    "message": "CẢNH BÁO: Vé này đã được check-in vào lúc 08:15 sáng nay!"
  }
  ```

---

### 3.6. Phân Hệ Thanh Toán Điện Tử MoMo, VNPay & Webhook IPN (Payment Controller API)

#### 1. `POST /api/payment/vnpay/create` (Tạo Giao Dịch Thanh Toán VNPay)
- **Mục đích:** Khởi tạo giao dịch nộp hội phí hoặc mua vé sự kiện qua cổng thanh toán VNPay.
- **Request Body:**
  ```json
  {
    "amount": 10000000,
    "orderInfo": "CEO1983 HP CEO1983-088",
    "orderType": "membership_fee",
    "returnUrl": "https://ceo1983.viconnect.vn/association/finances?status=success"
  }
  ```
- **Response `200 OK`:** Trả về `{ "paymentUrl": "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?..." }`.

---

#### 2. `POST /api/payment/vnpay/ipn` (Webhook Gạch Nợ Tức Thời Từ VNPay)
- **Mục đích:** Tiếp nhận thông báo nộp tiền thành công từ cổng VNPay, xác thực chữ ký HMAC SHA512 và gạch nợ tức thời.
- **Xác thực:** Kiểm tra chữ ký `vnp_SecureHash` so với chuỗi dữ liệu gốc.
- **Response `200 OK`:** `{ "RspCode": "00", "Message": "Confirm Success" }`.

---

## PHẦN IV: CHIẾN LƯỢC ĐÁNH CHỈ MỤC & TỐI ƯU HIỆU NĂNG CSDL (DATABASE INDEXING)

Để đảm bảo tốc độ phản hồi API luôn đạt mức chuẩn **dưới 50ms** với dung lượng cơ sở dữ liệu hàng trăm nghìn bản ghi, các chỉ mục (indexes) chiến lược sau đây đã được thiết lập trực tiếp trên CSDL PostgreSQL:

```sql
-- 1. Chỉ mục tối ưu hóa tìm kiếm hội viên & đăng nhập
CREATE INDEX IF NOT EXISTS idx_members_user_id ON public.members(user_id);
CREATE INDEX IF NOT EXISTS idx_members_phone ON public.members(phone);
CREATE INDEX IF NOT EXISTS idx_members_code ON public.members(code);
CREATE INDEX IF NOT EXISTS idx_members_dept_status ON public.members(department, status);

-- 2. Chỉ mục tối ưu hóa Sàn giao thương B2B & Cơ hội
CREATE INDEX IF NOT EXISTS idx_opportunities_poster_status ON public.opportunities(poster_id, status);
CREATE INDEX IF NOT EXISTS idx_opportunities_type_created ON public.opportunities(type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_opportunity_interests_opp ON public.opportunity_interests(opportunity_id);

-- 3. Chỉ mục soát vé sự kiện tốc độ cao (< 500ms)
CREATE UNIQUE INDEX IF NOT EXISTS idx_event_reg_ticket_code ON public.event_registrations(ticket_code);
CREATE INDEX IF NOT EXISTS idx_event_reg_event_member ON public.event_registrations(event_id, member_id);

-- 4. Chỉ mục tài chính thu phí & đối soát
CREATE INDEX IF NOT EXISTS idx_transactions_code ON public.transactions(code);
CREATE INDEX IF NOT EXISTS idx_transactions_status_date ON public.transactions(status, date DESC);

-- 5. Chỉ mục thông báo thời gian thực & Bảng tin
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_read ON public.notifications(recipient_id, is_read);
CREATE INDEX IF NOT EXISTS idx_feed_posts_category_created ON public.feed_posts(category, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feed_comments_post_parent ON public.feed_comments(post_id, parent_id);
```

---

## PHẦN V: QUY CHUẨN AN TOÀN, SAO LƯU DỮ LIỆU & ĐỒNG BỘ GOOGLE NOTEBOOKLM

1. **Đồng Bộ Hóa Google NotebookLM Master:**
   - Tài liệu kỹ thuật này được lưu trữ chính thức tại: `document/notebooklm/09_DAC_TA_API_VA_THIET_KE_CSDL.md`.
   - Được cập nhật đồng bộ lên Google NotebookLM của dự án CEO 1983 (`https://notebook.google.com/notebook/6ea9dec4-b8c1-4b4b-a077-d874b625bafd`).
2. **Quy Trình Sao Lưu Định Kỳ CSDL:**
   - Chạy lệnh `pg_dump` tự động vào 02:00 sáng hàng ngày.
   - Bản sao lưu được nén `gzip` và chuyển sang phân vùng lưu trữ dự phòng độc lập.
3. **Chính Sách Khóa CSDL Zero-Trust:**
   - Chỉ duy nhất các container trong mạng Docker nội bộ và IP máy chủ sản xuất mới được phép kết nối qua cổng `6432`.
   - Toàn bộ kết nối bên ngoài bắt buộc phải đi qua tường lửa và chứng thực bảo mật SSL.

---

*Hà Nội, Ngày 09 Tháng 11 Năm 2026*  
**ĐỘI NGŨ KIẾN TRÚC SƯ CƠ SỞ DỮ LIỆU & API VICONNECT**  
*(Đã thẩm định và ký duyệt)*
