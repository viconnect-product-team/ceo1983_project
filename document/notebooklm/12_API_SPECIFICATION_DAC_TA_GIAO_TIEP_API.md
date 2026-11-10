# HỆ SINH THÁI NỀN TẢNG SỐ CLB DOANH NHÂN CEO 1983 (HANOIBA)

## TÀI LIỆU ĐẶC TẢ GIAO DIỆN LẬP TRÌNH ỨNG DỤNG RESTFUL API TOÀN DIỆN
*(RESTFUL API SPECIFICATION & INTEGRATION PROTOCOL - MASTER EDITION)*
*Tuân thủ tiêu chuẩn OpenAPI 3.1 & Kiến trúc Pure NestJS v20 LTS kết hợp PostgreSQL Enterprise*

---

* **Mã tài liệu:** `API-SPEC-CEO1983-MASTER-V10.0`
* **Phiên bản:** `10.0.0-PROD` (Đặc tả chi tiết 100% Endpoints, Request/Response Payload, HMAC-SHA512 Webhook, WebSocket Gateway)
* **Cơ quan chủ quản:** Câu Lạc Bộ Doanh Nhân CEO 1983 — Trực thuộc Hội Doanh Nghiệp Trẻ Hà Nội (HanoiBA)
* **Đơn vị thiết kế & phát triển:** VICONNECT - Kiến Trúc Sư Hệ Thống API & An Toàn Mạng
* **Ngày phát hành:** Tháng 11/2026

---

## MỤC LỤC TỔNG QUAN

- [CHƯƠNG 1: QUY CHUẨN THIẾT KẾ & BẢO MẬT API TOÀN CỤC](#chương-1-quy-chuẩn-thiết-kế--bảo-mật-api-toàn-cục)
  - [1.1. Cấu Trúc URI & Định Dạng Dữ Liệu](#11-cấu-trúc-uri--định-dạng-dữ-liệu)
  - [1.2. Cơ Chế Xác Thực JWT & RBAC Header](#12-cơ-chế-xác-thực-jwt--rbac-header)
  - [1.3. Mã Trạng Thái HTTP & Cấu Trúc Lỗi Chuẩn RFC 7807](#13-mã-trạng-thái-http--cấu-trúc-lỗi-chuẩn-rfc-7807)
  - [1.4. Cơ Chế Giới Hạn Tần Suất (Rate Limiting) & CORS](#14-cơ-chế-giới-hạn-tần-suất-rate-limiting--cors)
- [CHƯƠNG 2: PHÂN HỆ XÁC THỰC & TÀI KHOẢN (AUTHENTICATION & USERS)](#chương-2-phân-hệ-xác-thực--tài-khoản-authentication--users)
  - [2.1. Đăng Nhập Hệ Thống (POST /api/auth/login)](#21-đăng-nhập-hệ-thống-post-apiauthlogin)
  - [2.2. Làm Mới Token (POST /api/auth/refresh)](#22-làm-mới-token-post-apiauthrefresh)
  - [2.3. Lấy Thông Tin Tài Khoản Hiện Hành (GET /api/auth/me)](#23-lấy-thông-tin-tài-khoản-hiện-hành-get-apiauthme)
  - [2.4. Đổi Mật Khẩu (PUT /api/auth/change-password)](#24-đổi-mật-khẩu-put-apiauthchange-password)
- [CHƯƠNG 3: PHÂN HỆ QUẢN TRỊ HỘI VIÊN & HỒ SƠ 360 ĐỘ (MEMBERS & DIRECTORY)](#chương-3-phân-hệ-quản-trị-hội-viên--hồ-sơ-360-độ-members--directory)
  - [3.1. Danh Sách Hội Viên Đầy Đủ & Bộ Lọc Đa Năng (GET /api/members)](#31-danh-sách-hội-viên-đầy-đủ--bộ-lọc-đa-năng-get-apimembers)
  - [3.2. Đăng Ký Gia Nhập Trực Tuyến Từ Mobile App (POST /api/members/register)](#32-đăng-ký-gia-nhập-trực-tuyến-từ-mobile-app-post-apimembersregister)
  - [3.3. Thẩm Định & Phê Duyệt Kết Nạp Hội Viên (PUT /api/members/:id/approve)](#33-thẩm-định--phê-duyệt-kết-nạp-hội-viên-put-apimembersidapprove)
  - [3.4. Danh Bạ Doanh Nhân & Tìm Kiếm Tọa Độ GPS (GET /api/members/directory)](#34-danh-bạ-doanh-nhân--tìm-kiếm-tọa-độ-gps-get-apimembersdirectory)
  - [3.5. Cập Nhật Hồ Sơ Hội Viên & Quyền Riêng Tư (PUT /api/members/me/profile)](#35-cập-nhật-hồ-sơ-hội-viên--quyền-riêng-tư-put-apimembersmeprofile)
- [CHƯƠNG 4: PHÂN HỆ QUẢN TRỊ TÀI CHÍNH, HỘI PHÍ & SỔ QUỸ (FINANCE & INVOICES)](#chương-4-phân-hệ-quản-trị-tài-chính-hội-phí--sổ-quỹ-finance--invoices)
  - [4.1. Phát Hành Hóa Đơn Hội Phí Tự Động (POST /api/invoices/generate)](#41-phát-hành-hóa-đơn-hội-phí-tự-động-post-apiinvoicesgenerate)
  - [4.2. Danh Sách Hóa Đơn & Bộ Lọc Trạng Thái Nợ (GET /api/invoices)](#42-danh-sách-hóa-đơn--bộ-lọc-trạng-thái-nợ-get-apiinvoices)
  - [4.3. Quản Trị Thu - Chi Sổ Quỹ Hiệp Hội (GET /api/admin/transactions)](#43-quản-trị-thu---chi-sổ-quỹ-hiệp-hội-get-apiadmintransactions)
  - [4.4. Đề Xuất Tạm Ứng & Hoàn Ứng Ngân Sách 6 Ban (POST /api/admin/expenses)](#44-đề-xuất-tạm-ứng--hoàn-ứng-ngân-sách-6-ban-post-apiadminexpenses)
- [CHƯƠNG 5: CỔNG THANH TOÁN ĐA KÊNH & WEBHOOK IPN (PAYMENTS & WEBHOOKS)](#chương-5-cổng-thanh-toán-đa-kênh--webhook-ipn-payments--webhooks)
  - [5.1. Tạo Mã Thanh Toán VietQR Chuẩn Napas247 (POST /api/payment/create-qr)](#51-tạo-mã-thanh-toán-vietqr-chuẩn-napas247-post-apipaymentcreate-qr)
  - [5.2. Khởi Tạo Giao Dịch Cổng MoMo (POST /api/payment/momo-url)](#52-khởi-tạo-giao-dịch-cổng-momo-post-apipaymentmomo-url)
  - [5.3. Khởi Tạo Giao Dịch Cổng VNPay (POST /api/payment/vnpay-url)](#53-khởi-tạo-giao-dịch-cổng-vnpay-post-apipaymentvnpay-url)
  - [5.4. Webhook IPN Tiếp Nhận & Xác Thực Chữ Ký HMAC-SHA512 (POST /api/payment/webhook/ipn)](#54-webhook-ipn-tiếp-nhận--xác-thực-chữ-ký-hmac-sha512-post-apipaymentwebhookipn)
- [CHƯƠNG 6: SỰ KIỆN GALA, XẾP BÀN VIP & SOÁT VÉ QR (EVENTS & TICKETING)](#chương-6-sự-kiện-gala-xếp-bàn-vip--soát-vé-qr-events--ticketing)
  - [6.1. Khởi Tạo Sự Kiện & Phân Bổ Bàn Tiệc (POST /api/events)](#61-khởi-tạo-sự-kiện--phân-bổ-bàn-tiệc-post-apievents)
  - [6.2. Đăng Ký Mua Vé Sự Kiện Trực Tuyến (POST /api/events/register)](#62-đăng-ký-mua-vé-sự-kiện-trực-tuyến-post-apieventsregister)
  - [6.3. Lấy Danh Sách Vé Của Tôi & QR Động 30s (GET /api/events/me/tickets)](#63-lấy-danh-sách-vé-của-tôi--qr-động-30s-get-apieventsmetickets)
  - [6.4. Soát Vé Cổng Keangnam Landmark72 Tốc Độ Cao (POST /api/events/checkin)](#64-soát-vé-cổng-keangnam-landmark72-tốc-độ-cao-post-apieventscheckin)
  - [6.5. Vòng Quay May Mắn Trúng Thưởng Gala (POST /api/events/lucky-draw)](#65-vòng-quay-may-mắn-trúng-thưởng-gala-post-apieventslucky-draw)
- [CHƯƠNG 7: ĐIỀU HÀNH CUỘC HỌP & HỌP TRỰC TUYẾN JITSI (MEETINGS & JITSI)](#chương-7-điều-hành-cuộc-họp--họp-trực-tuyến-jitsi-meetings--jitsi)
  - [7.1. Lập Lịch Cuộc Họp Ban Định Kỳ / Bất Thường (POST /api/meetings)](#71-lập-lịch-cuộc-họp-ban-định-kỳ--bất-thường-post-apimeetings)
  - [7.2. Đặt Lịch Hẹn 1-on-1 Giữa 2 Doanh Nhân (POST /api/meetings/1on1)](#72-đặt-lịch-hẹn-1-on-1-giữa-2-doanh-nhân-post-apimeetings1on1)
  - [7.3. Tạo JWT Token Phòng Họp Trực Tuyến Jitsi Meet (GET /api/meetings/:id/jitsi-token)](#73-tạo-jwt-token-phòng-họp-trực-tuyến-jitsi-meet-get-apimeetingsidjitsi-token)
- [CHƯƠNG 8: SÀN GIAO THƯƠNG B2B & GIAN HÀNG NỘI KHỐI (B2B COMMERCE & PRODUCTS)](#chương-8-sàn-giao-thương-b2b--gian-hàng-nội-khối-b2b-commerce--products)
  - [8.1. Đăng Tin Cơ Hội Giao Thương Mua/Bán (POST /api/opportunities)](#81-đăng-tin-cơ-hội-giao-thương-muabán-post-apiopportunities)
  - [8.2. Danh Sách Sản Phẩm Ưu Đãi Nội Khối (GET /api/products)](#82-danh-sách-sản-phẩm-ưu-đãi-nội-khối-get-apiproducts)
- [CHƯƠNG 9: QUẢN LÝ CÔNG VIỆC KANBAN & TRÍ TUỆ NHÂN TẠO GEMINI (TASKS & AI ENGINE)](#chương-9-quản-lý-công-việc-kanban--trí-tuệ-nhân-tạo-gemini-tasks--ai-engine)
  - [9.1. Quản Lý Thẻ Công Việc Kanban & Kéo Thả (GET & PUT /api/tasks)](#91-quản-lý-thẻ-công-việc-kanban--kéo-thả-get--put-apitasks)
  - [9.2. AI Bóc Tách Nhiệm Vụ Từ Biên Bản Họp Word/Excel (POST /api/tasks/ai-parse)](#92-ai-bóc-tách-nhiệm-vụ-từ-biên-bản-họp-wordexcel-post-apitasksai-parse)
  - [9.3. Cố Vấn AI Phân Tích Dòng Tiền & Thẩm Định Dự Án (POST /api/ai/advisor)](#93-cố-vấn-ai-phân-tích-dòng-tiền--thẩm-định-dự-án-post-apiaiadvisor)
- [CHƯƠNG 10: TRUYỀN THÔNG ĐA KÊNH, ZALO OA ZNS & SMTP MAIL (BROADCAST ENGINE)](#chương-10-truyền-thông-đa-kênh-zalo-oa-zns--smtp-mail-broadcast-engine)
  - [10.1. Phát Sóng Thông Báo Đa Kênh Tức Thời (POST /api/broadcast/send)](#101-phát-sóng-thông-báo-đa-kênh-tức-thời-post-apibroadcastsend)
  - [10.2. Trạng Thái Kết Nối & Xoay Vòng Access Token Zalo OA (GET /api/zalo/token-status)](#102-trạng-thái-kết-nối--xoay-vòng-access-token-zalo-oa-get-apizalotoken-status)
- [CHƯƠNG 11: KẾT NỐI THỜI GIAN THỰC WEBSOCKET (SOCKET.IO GATEWAY)](#chương-11-kết-nối-thời-gian-thực-websocket-socketio-gateway)
  - [11.1. Giao Thức Handshake & Xác Thực Token](#111-giao-thức-handshake--xác-thực-token)
  - [11.2. Danh Sách Kênh Sự Kiện (Emit & Listen Events)](#112-danh-sách-kênh-sự-kiện-emit--listen-events)

---

# CHƯƠNG 1: QUY CHUẨN THIẾT KẾ & BẢO MẬT API TOÀN CỤC

### 1.1. Cấu Trúc URI & Định Dạng Dữ Liệu
* **Môi trường Production Base URL:** `https://api.ceo1983.vn/api/v1` (hoặc cổng Nginx nội bộ qua proxy `/api`).
* **Môi trường Staging / Dev:** `https://dev-api.ceo1983.vn/api/v1` hoặc `http://127.0.0.1:3000/api`.
* **Tiêu chuẩn Định danh Endpoint:** Danh từ số nhiều, viết thường theo chuẩn kebab-case (ví dụ: `/api/members`, `/api/event-registrations`).
* **Định dạng Trao đổi Dữ liệu:** Bắt buộc `Content-Type: application/json; charset=utf-8` cho toàn bộ Request và Response (ngoại trừ các endpoint upload file sử dụng `multipart/form-data`).

### 1.2. Cơ Chế Xác Thực JWT & RBAC Header
Mọi cuộc gọi API cần xác thực (ngoại trừ `/auth/login` và `/payment/webhook/ipn`) đều bắt buộc gửi kèm mã thông báo bảo mật trong HTTP Header:
```http
Authorization: Bearer <ACCESS_TOKEN_JWT>
```
* **Payload cấu trúc của JWT Access Token:**
```json
{
  "sub": "user_c8f3a9e1_2026",
  "email": "chu-tich@ceo1983.vn",
  "phone": "0983198383",
  "role": "PRESIDENT",
  "memberId": "mem_001_83",
  "clubRole": "CHỦ TỊCH CLB",
  "iat": 1731234567,
  "exp": 1731320967
}
```
* **Thời hạn hiệu lực:** Access Token có thời hạn sống 24 giờ. Refresh Token có thời hạn sống 30 ngày (được lưu trữ mã hóa trong HTTP-Only Cookie hoặc cơ chế secure store của mobile app).

### 1.3. Mã Trạng Thái HTTP & Cấu Trúc Lỗi Chuẩn RFC 7807
Hệ thống tuân thủ nghiêm ngặt các mã trạng thái chuẩn HTTP:
* `200 OK`: Thực thi truy vấn thành công.
* `201 Created`: Khởi tạo bản ghi mới thành công trong CSDL.
* `400 Bad Request`: Dữ liệu đầu vào không hợp lệ hoặc thiếu trường bắt buộc.
* `401 Unauthorized`: Token xác thực không hợp lệ, bị thu hồi hoặc đã hết hạn.
* `403 Forbidden`: Tài khoản không đủ quyền hạn thực hiện hành động theo ma trận RBAC.
* `404 Not Found`: Không tìm thấy tài nguyên yêu cầu.
* `409 Conflict`: Xung đột dữ liệu (ví dụ: trùng lặp mã số thuế, email hoặc số điện thoại).
* `422 Unprocessable Entity`: Dữ liệu vi phạm nghiệp vụ logic.
* `429 Too Many Requests`: Vượt quá hạn mức yêu cầu (Rate Limit).
* `500 Internal Server Error`: Lỗi phát sinh từ máy chủ NestJS hoặc truy vấn PostgreSQL.

**Định dạng Cấu Trúc Lỗi Chuẩn:**
```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": [
    "phone must be a valid Vietnamese mobile phone number (10 digits starting with 03, 05, 07, 08, 09)",
    "taxCode is required for enterprise registration"
  ],
  "timestamp": "2026-11-10T08:30:00.000Z",
  "path": "/api/members/register",
  "correlationId": "req_83_e9a17b2f"
}
```

### 1.4. Cơ Chế Giới Hạn Tần Suất (Rate Limiting) & CORS
* **Chính sách CORS Whitelist:** Chỉ chấp nhận nguồn gốc từ tên miền chính thức:
  - `https://ceo1983.vn` (Cổng thông tin & Landing)
  - `https://crm.ceo1983.vn` (Cổng Quản trị CRM)
  - `https://app.ceo1983.vn` (CEO 1983 Mobile PWA)
  - `capacitor://localhost` & `ionic://localhost` (Cầu nối Native App)
* **Rate Limiting:** Sử dụng `@nestjs/throttler` tích hợp:
  - API thông thường: Tối đa 120 yêu cầu / 60 giây / 1 địa chỉ IP.
  - API Đăng nhập (`/api/auth/login`): Tối đa 5 yêu cầu / 60 giây để phòng chống tấn công Brute-force.
  - API Soát vé QR (`/api/events/checkin`): Cấu hình ngoại lệ lên đến 300 yêu cầu / 60 giây cho thiết bị quét vé được ủy quyền tại cổng Keangnam.

---

# CHƯƠNG 2: PHÂN HỆ XÁC THỰC & TÀI KHOẢN (AUTHENTICATION & USERS)

### 2.1. Đăng Nhập Hệ Thống (POST /api/auth/login)
* **Mô tả:** Tiếp nhận thông tin định danh (Số điện thoại hoặc Email) cùng Mật khẩu để xác thực, cấp phát JWT Access Token và phân bổ quyền hạn theo RBAC.
* **Quyền hạn:** Công khai (Public).
* **Request Header:** `Content-Type: application/json`
* **Request Body:**
```json
{
  "username": "0983198383",
  "password": "PasswordRoyalCEO1983@",
  "deviceInfo": {
    "platform": "iOS",
    "model": "iPhone 16 Pro Max",
    "appVersion": "10.0.0",
    "fcmToken": "fcm_e8a91b...73c2"
  }
}
```
* **Response Success (200 OK):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 86400,
    "user": {
      "id": "usr_c8f3a9e1_2026",
      "fullName": "Nguyễn Hoàng Long",
      "phone": "0983198383",
      "email": "chu-tich@ceo1983.vn",
      "role": "PRESIDENT",
      "avatarUrl": "https://cdn.ceo1983.vn/avatars/usr_c8f3a9e1.jpg",
      "memberProfile": {
        "id": "mem_001_83",
        "membershipCode": "CEO1983-001",
        "clubRole": "CHỦ TỊCH CLB",
        "assignedBoard": "BAN_CHU_TICH",
        "tier": "PLATINUM",
        "companyName": "Tập Đoàn Đầu Tư & Công Nghệ Hoàng Gia 1983",
        "taxCode": "0101983198",
        "position": "Chủ Tịch HĐQT"
      }
    }
  },
  "message": "Đăng nhập hệ sinh thái CEO 1983 thành công."
}
```

### 2.2. Làm Mới Token (POST /api/auth/refresh)
* **Mô tả:** Sử dụng Refresh Token còn hiệu lực để cấp phát cặp Access Token mới mà không cần bắt người dùng đăng nhập lại.
* **Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```
* **Response Success (200 OK):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...new",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...new",
    "expiresIn": 86400
  }
}
```

### 2.3. Lấy Thông Tin Tài Khoản Hiện Hành (GET /api/auth/me)
* **Mô tả:** Lấy thông tin cá nhân, quyền hạn và trạng thái hội viên của tài khoản đang đăng nhập.
* **Headers:** `Authorization: Bearer <TOKEN>`
* **Response Success (200 OK):** Trả về đối tượng `user` cùng chi tiết công ty, thẻ hội viên số và công nợ hội phí hiện thời.

---

# CHƯƠNG 3: PHÂN HỆ QUẢN TRỊ HỘI VIÊN & HỒ SƠ 360 ĐỘ (MEMBERS & DIRECTORY)

### 3.1. Danh Sách Hội Viên Đầy Đủ & Bộ Lọc Đa Năng (GET /api/members)
* **Mô tả:** Truy xuất danh sách hội viên phục vụ Cổng Web CRM với các tiêu chí lọc nâng cao: Ban trực thuộc (6 Ban), Tình trạng hội phí (Đã nộp/Còn nợ), Trạng thái phê duyệt, Ngành nghề và Từ khóa tìm kiếm.
* **Quyền hạn:** `SUPER_ADMIN`, `PRESIDENT`, `SECRETARY`, `HEAD_OF_BOARD`, `ACCOUNTANT`.
* **Query Parameters:**
  - `page` (number, default: 1)
  - `limit` (number, default: 20, max: 100)
  - `search` (string: họ tên, SĐT, công ty, MST)
  - `board` (enum: `ALL`, `BAN_CHU_TICH`, `BAN_TAI_CHINH`, `BAN_GIAO_THUONG`, `BAN_SU_KIEN`, `BAN_TRUYEN_THONG`, `BAN_HOI_VIEN`)
  - `feeStatus` (enum: `ALL`, `PAID`, `UNPAID`, `OVERDUE`)
  - `status` (enum: `ALL`, `PENDING_REVIEW`, `ACTIVE`, `SUSPENDED`)
* **Response Success (200 OK):**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "mem_001_83",
        "membershipCode": "CEO1983-001",
        "fullName": "Nguyễn Hoàng Long",
        "birthYear": 1983,
        "phone": "0983198383",
        "email": "long.nh@hoanggia1983.vn",
        "clubRole": "CHỦ TỊCH CLB",
        "board": "BAN_CHU_TICH",
        "tier": "PLATINUM",
        "company": {
          "id": "comp_01",
          "name": "Tập Đoàn Đầu Tư & Công Nghệ Hoàng Gia 1983",
          "taxCode": "0101983198",
          "industry": "Công nghệ & Chuyển đổi số",
          "address": "Tầng 38, Keangnam Landmark72, Nam Từ Liêm, Hà Nội"
        },
        "feeStatus": "PAID",
        "currentDebt": 0,
        "membershipStatus": "ACTIVE",
        "joinDate": "2023-01-15T00:00:00.000Z",
        "vCardUrl": "https://app.ceo1983.vn/card/hoang-long-1983"
      }
    ],
    "meta": {
      "currentPage": 1,
      "itemCount": 20,
      "itemsPerPage": 20,
      "totalItems": 215,
      "totalPages": 11
    }
  }
}
```

### 3.2. Đăng Ký Gia Nhập Trực Tuyến Từ Mobile App (POST /api/members/register)
* **Mô tả:** Doanh nhân sinh năm 1983 nộp hồ sơ xin kết nạp hội viên qua ứng dụng di động.
* **Quyền hạn:** Công khai (Public).
* **Request Body:**
```json
{
  "fullName": "Phạm Minh Đức",
  "birthYear": 1983,
  "gender": "MALE",
  "phone": "0912345683",
  "email": "duc.pm@viconnect.vn",
  "personalId": "001083009988",
  "company": {
    "name": "Công Ty Cổ Phần Công Nghệ ViConnect",
    "taxCode": "0108899883",
    "position": "Tổng Giám Đốc",
    "address": "Số 18, Phố Duy Tân, Cầu Giấy, Hà Nội",
    "industry": "Phần mềm & Nền tảng số",
    "website": "https://viconnect.vn",
    "employeeCount": 85,
    "charterCapital": 20000000000
  },
  "preferredBoard": "BAN_GIAO_THUONG",
  "sponsorMemberCode": "CEO1983-001",
  "agreedTerms": true
}
```
* **Response Success (201 Created):**
```json
{
  "success": true,
  "data": {
    "applicationId": "app_983_reg_7721",
    "status": "PENDING_REVIEW",
    "submittedAt": "2026-11-10T08:35:12.000Z",
    "message": "Hồ sơ đăng ký của Quý Doanh nhân đã được ghi nhận. Ban Thư ký CLB CEO 1983 sẽ liên hệ thẩm định trong vòng 48 giờ làm việc."
  }
}
```

### 3.3. Thẩm Định & Phê Duyệt Kết Nạp Hội Viên (PUT /api/members/:id/approve)
* **Mô tả:** Ban Thư ký thẩm định thông tin pháp lý doanh nghiệp, Chủ tịch CLB ký duyệt kết nạp chính thức. Hệ thống tự động khởi tạo Mã hội viên `CEO1983-XXX`, phát hành Hóa đơn hội phí niên khóa và gửi thông báo đa kênh (App, Zalo OA ZNS, Email chào mừng).
* **Quyền hạn:** `PRESIDENT`, `SUPER_ADMIN`.
* **Request Body:**
```json
{
  "approved": true,
  "board": "BAN_GIAO_THUONG",
  "tier": "GOLD",
  "annualFee": 10000000,
  "approvalNotes": "Hồ sơ doanh nghiệp hợp lệ, tư cách đạo đức kinh doanh tốt, đủ điều kiện kết nạp.",
  "notifyChannels": ["ZALO_ZNS", "EMAIL", "APP_PUSH"]
}
```
* **Response Success (200 OK):**
```json
{
  "success": true,
  "data": {
    "memberId": "mem_216_83",
    "membershipCode": "CEO1983-216",
    "status": "ACTIVE",
    "invoiceCode": "INV-2026-0216",
    "qrPaymentUrl": "https://api.vietqr.io/image/970422-11320107184-Napas247.jpg?amount=10000000&addInfo=HOIPHI%20CEO1983-216",
    "approvedAt": "2026-11-10T08:40:00.000Z"
  },
  "message": "Đã phê duyệt kết nạp hội viên thành công. Thông báo chào mừng và hóa đơn hội phí đã được gửi qua đa kênh."
}
```

### 3.4. Danh Bạ Doanh Nhân & Tìm Kiếm Tọa Độ GPS (GET /api/members/directory)
* **Mô tả:** Tìm kiếm danh bạ hội viên phục vụ kết nối giao thương trên ứng dụng di động, hỗ trợ quét định vị theo bán kính GPS (km).
* **Query Parameters:** `lat`, `lng`, `radiusKm` (mặc định: 10km), `industry`, `board`, `keyword`.

---

# CHƯƠNG 4: PHÂN HỆ QUẢN TRỊ TÀI CHÍNH, HỘI PHÍ & SỔ QUỸ (FINANCE & INVOICES)

### 4.1. Phát Hành Hóa Đơn Hội Phí Tự Động (POST /api/invoices/generate)
* **Mô tả:** Kế toán hoặc Hệ thống định kỳ tự động phát hành hóa đơn thu hội phí niên khóa cho toàn thể hội viên hoặc theo từng Ban.
* **Quyền hạn:** `ACCOUNTANT`, `SUPER_ADMIN`.
* **Request Body:**
```json
{
  "fiscalYear": 2026,
  "title": "Hội phí Niên Khóa 2026-2027 CLB Doanh Nhân CEO 1983",
  "amount": 10000000,
  "dueDate": "2026-12-31T23:59:59.000Z",
  "targetScope": "ALL_ACTIVE_MEMBERS",
  "boardFilter": "ALL",
  "autoNotify": true
}
```
* **Response Success (201 Created):**
```json
{
  "success": true,
  "data": {
    "batchId": "batch_inv_2026_01",
    "totalGenerated": 215,
    "totalAmount": 2150000000,
    "generatedAt": "2026-11-10T08:45:00.000Z"
  },
  "message": "Đã phát hành 215 hóa đơn hội phí niên khóa 2026 thành công kèm mã VietQR cá nhân hóa."
}
```

### 4.2. Quản Trị Thu - Chi Sổ Quỹ Hiệp Hội (GET /api/admin/transactions)
* **Mô tả:** Truy xuất dòng tiền thu - chi minh bạch của CLB, tự động tính tổng lũy kế, số dư quỹ và lọc theo loại giao dịch.
* **Quyền hạn:** `PRESIDENT`, `ACCOUNTANT`, `SUPER_ADMIN`.
* **Query Parameters:** `type` (`INCOME`, `EXPENSE`), `status` (`COMPLETED`, `PENDING`), `startDate`, `endDate`, `board`.
* **Response Success (200 OK):**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalIncome": 2850000000,
      "totalExpense": 920000000,
      "netBalance": 1930000000,
      "pendingIncome": 150000000
    },
    "transactions": [
      {
        "id": "tx_2026_0891",
        "code": "TX-CEO1983-0891",
        "type": "INCOME",
        "category": "MEMBERSHIP_FEE",
        "amount": 10000000,
        "paymentMethod": "VIETQR",
        "referenceId": "INV-2026-0089",
        "member": {
          "membershipCode": "CEO1983-089",
          "fullName": "Lê Văn Hùng",
          "companyName": "Công Ty TNHH Xây Dựng & Địa Ốc Thủ Đô"
        },
        "description": "Nộp hội phí niên khóa 2026 qua VietQR Napas247",
        "status": "COMPLETED",
        "bankTransactionId": "FT263158912389",
        "createdAt": "2026-11-10T07:15:30.000Z"
      }
    ]
  }
}
```

---

# CHƯƠNG 5: CỔNG THANH TOÁN ĐA KÊNH & WEBHOOK IPN (PAYMENTS & WEBHOOKS)

### 5.1. Tạo Mã Thanh Toán VietQR Chuẩn Napas247 (POST /api/payment/create-qr)
* **Mô tả:** Khởi tạo chuỗi EMVCo QR Code động chuẩn Napas247 chứa chính xác số tài khoản ngân hàng CLB, số tiền cần thanh toán và nội dung cú pháp chuyển khoản định danh để tự động gạch nợ.
* **Quyền hạn:** Hội viên hoặc Khách mời đã xác thực.
* **Request Body:**
```json
{
  "invoiceId": "inv_2026_0089",
  "paymentType": "MEMBERSHIP_FEE",
  "amount": 10000000
}
```
* **Response Success (200 OK):**
```json
{
  "success": true,
  "data": {
    "qrCodeString": "00020101021238570010A000000727012700069704220113113201071845204599953037045408100000005802VN62250821HOIPHI CEO1983 00896304E8A1",
    "qrImageUrl": "https://api.vietqr.io/image/970422-11320107184-compact.jpg?amount=10000000&addInfo=HOIPHI%20CEO1983%200089&accountName=CLB%20DOANH%20NHAN%20CEO%201983",
    "transferSyntax": "HOIPHI CEO1983 0089",
    "bankInfo": {
      "bankName": "Ngân Hàng TMCP Quân Đội (MBBank)",
      "bankCode": "970422",
      "accountNumber": "11320107184",
      "accountHolder": "CLB DOANH NHAN CEO 1983 HANOIBA"
    },
    "amount": 10000000,
    "expiresAt": "2026-11-10T09:15:00.000Z"
  }
}
```

### 5.4. Webhook IPN Tiếp Nhận & Xác Thực Chữ Ký HMAC-SHA512 (POST /api/payment/webhook/ipn)
* **Mô tả:** Điểm tiếp nhận thông báo tức thời (Instant Payment Notification) từ Ngân hàng Napas247, MoMo hoặc VNPay khi khách hàng hoàn tất giao dịch. Bắt buộc kiểm tra chữ ký số HMAC-SHA512 với khóa bí mật `PAYMENT_WEBHOOK_SECRET` để phòng chống giả mạo giao dịch (Replay Attack, Man-in-the-Middle).
* **Quyền hạn:** Public nhưng có kiểm tra chữ ký số (Signature Verification).
* **Request Header:**
  - `Content-Type: application/json`
  - `X-Signature: c8f3a9e145b23d917...6a2b8e` (Chữ ký băm HMAC-SHA512 của raw payload)
* **Request Body (Ví dụ từ Cổng Thanh Toán):**
```json
{
  "gateway": "VIETQR_CASSO",
  "transactionId": "FT263158912389",
  "accountNumber": "11320107184",
  "amount": 10000000,
  "description": "HOIPHI CEO1983 0089 chuyen khoan tien hoi phi",
  "transactionDateTime": "2026-11-10T07:15:28.000Z",
  "referenceCode": "INV-2026-0089",
  "checksum": "c8f3a9e145b23d917...6a2b8e"
}
```
* **Thuật toán Kiểm tra Chữ ký Backend NestJS:**
```typescript
const computedSignature = crypto
  .createHmac('sha512', process.env.PAYMENT_WEBHOOK_SECRET)
  .update(JSON.stringify(req.body))
  .digest('hex');

if (computedSignature !== req.headers['x-signature']) {
  throw new ForbiddenException('Invalid Payment Webhook Signature!');
}
```
* **Xử lý Nghiệp vụ Tự động:**
  1. Mở CSDL Transaction với mức cô lập `SERIALIZABLE` và áp dụng `SELECT ... FOR UPDATE` (Pessimistic Locking).
  2. Kiểm tra xem `transactionId` đã được xử lý chưa để đảm bảo tính Idempotency (Chống xử lý trùng).
  3. Bóc tách cú pháp `HOIPHI CEO1983 0089` -> Tìm bản ghi hóa đơn `INV-2026-0089`.
  4. Cập nhật `invoices.status = 'PAID'`, `invoices.paid_at = NOW()`.
  5. Thêm bản ghi mới vào bảng `transactions` với `type = 'INCOME'`.
  6. Kích hoạt Socket.IO bắn sự kiện `payment:success` về app của hội viên và màn hình kế toán CRM.
  7. Đẩy job vào queue gửi biên lai điện tử qua Zalo OA ZNS và Email.
* **Response Success (200 OK):**
```json
{
  "RspCode": "00",
  "Message": "Confirm Success",
  "transactionReference": "TX-CEO1983-0891"
}
```

---

# CHƯƠNG 6: SỰ KIỆN GALA, XẾP BÀN VIP & SOÁT VÉ QR (EVENTS & TICKETING)

### 6.1. Khởi Tạo Sự Kiện & Phân Bổ Bàn Tiệc (POST /api/events)
* **Mô tả:** Ban Sự kiện hoặc Ban Thư ký tạo sự kiện mới (Gala kỷ niệm, Giải Golf CEO 1983, Hội nghị B2B) kèm sơ đồ bàn tiệc VIP (Bàn Chủ tịch, Bàn Kim Cương, Bàn Vàng, Bàn Bạc).
* **Quyền hạn:** `SECRETARY`, `PRESIDENT`, `SUPER_ADMIN`.
* **Request Body:**
```json
{
  "title": "Gala Chào Xuân & Vinh Danh Doanh Nhân Tiêu Biểu CEO 1983",
  "eventType": "GALA_DINNER",
  "venue": "Phòng Đại Tiệc Grand Ballroom, Tầng 5, Keangnam Landmark72, Hà Nội",
  "startTime": "2026-12-28T17:30:00.000Z",
  "endTime": "2026-12-28T22:00:00.000Z",
  "maxCapacity": 500,
  "tables": [
    { "tableNumber": "VIP-01", "name": "Bàn Kim Cương - Ban Chủ Tịch", "seatCount": 10, "isVip": true },
    { "tableNumber": "VIP-02", "name": "Bàn Nhà Tài Trợ Vàng", "seatCount": 10, "isVip": true },
    { "tableNumber": "TBL-01", "name": "Bàn Ban Giao Thương 01", "seatCount": 10, "isVip": false }
  ],
  "ticketTiers": [
    { "tierName": "Hội viên chính thức", "price": 0, "quota": 250 },
    { "tierName": "Khách mời doanh nhân / Phối ngẫu", "price": 2000000, "quota": 250 }
  ],
  "bannerUrl": "https://cdn.ceo1983.vn/events/gala-keangnam-2026.jpg"
}
```

### 6.4. Soát Vé Cổng Keangnam Landmark72 Tốc Độ Cao (POST /api/events/checkin)
* **Mô tả:** Ban Tiếp đón sử dụng thiết bị quét mã QR tại sảnh Keangnam Landmark72. Hệ thống giải mã QR động (TOTP 30s), kiểm tra vé trong CSDL, xác nhận quyền vào cửa, hiển thị số bàn tiệc và trả kết quả dưới 0.5 giây.
* **Quyền hạn:** `BOARD_MEMBER`, `SECRETARY`, `SUPER_ADMIN`.
* **Request Body:**
```json
{
  "eventId": "evt_keangnam_2026",
  "qrPayload": "CEO1983_TKT_2026_0112_E8A9C128",
  "gateId": "GATE_A_VIP",
  "timestamp": 1735405200
}
```
* **Response Success (200 OK):**
```json
{
  "success": true,
  "data": {
    "ticketCode": "TKT-2026-0112",
    "memberFullName": "Nguyễn Hoàng Long",
    "companyName": "Tập Đoàn Đầu Tư & Công Nghệ Hoàng Gia 1983",
    "clubRole": "CHỦ TỊCH CLB",
    "tier": "PLATINUM_VIP",
    "tableAssigned": "VIP-01 (Bàn Kim Cương)",
    "seatNumber": "Ghế 01",
    "checkinTime": "2026-12-28T17:42:15.000Z",
    "alreadyCheckedIn": false
  },
  "message": "Quét vé thành công! Chào mừng Chủ Tịch Nguyễn Hoàng Long tại Bàn VIP-01."
}
```
* **Response Error (409 Conflict - Đã Soát Vé Trước Đó):**
```json
{
  "success": false,
  "statusCode": 409,
  "error": "Conflict",
  "message": "CẢNH BÁO: Vé TKT-2026-0112 ĐÃ ĐƯỢC CHECK-IN vào lúc 17:35:10 tại Cổng B!",
  "data": {
    "firstCheckinTime": "2026-12-28T17:35:10.000Z",
    "gate": "GATE_B"
  }
}
```

---

# CHƯƠNG 7: ĐIỀU HÀNH CUỘC HỌP & HỌP TRỰC TUYẾN JITSI (MEETINGS & JITSI)

### 7.1. Lập Lịch Cuộc Họp Ban Định Kỳ / Bất Thường (POST /api/meetings)
* **Mô tả:** Trưởng Ban hoặc Chánh Văn Phòng lên lịch họp Ban cố định hàng tháng hoặc họp đột xuất, tự động tạo phòng họp Jitsi Meet bảo mật cao và bắn thư mời đa kênh.
* **Request Body:**
```json
{
  "title": "Họp Ban Giao Thương CEO 1983 - Kế Hoạch Kết Nối B2B Quý 1/2027",
  "meetingType": "ONLINE_JITSI",
  "board": "BAN_GIAO_THUONG",
  "isRecurring": true,
  "recurrenceRule": "MONTHLY_FIRST_TUESDAY",
  "startTime": "2026-12-05T20:00:00.000Z",
  "durationMinutes": 90,
  "agenda": "1. Đánh giá doanh số nội khối tháng 11; 2. Thẩm định 5 deal liên doanh; 3. Giao việc chuẩn bị Gala Keangnam.",
  "requiredParticipants": ["mem_001_83", "mem_012_83", "mem_045_83"]
}
```

### 7.3. Tạo JWT Token Phòng Họp Trực Tuyến Jitsi Meet (GET /api/meetings/:id/jitsi-token)
* **Mô tả:** Cấp phát mã chứng thực Jitsi JWT ký bằng bí mật của CLB `JITSI_APP_SECRET`, phân định vai trò Moderator (Chủ tọa cuộc họp) và Attendee (Đại biểu tham dự) mà không cần nhập mật khẩu phòng.
* **Response Success (200 OK):**
```json
{
  "success": true,
  "data": {
    "roomName": "CEO1983_MEET_BGTH_2026_1205",
    "serverUrl": "https://meet.ceo1983.vn",
    "jwtToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
    "isModerator": true
  }
}
```

---

# CHƯƠNG 8: SÀN GIAO THƯƠNG B2B & GIAN HÀNG NỘI KHỐI (B2B COMMERCE & PRODUCTS)

### 8.1. Đăng Tin Cơ Hội Giao Thương Mua/Bán (POST /api/opportunities)
* **Mô tả:** Hội viên đăng nhu cầu Mua (Cần mua hàng/dịch vụ) hoặc Bán (Cung cấp sản phẩm/giải pháp), liên doanh đầu tư nội bộ.
* **Request Body:**
```json
{
  "type": "BUYING_NEED",
  "title": "Cần tìm nhà thầu xây dựng hoàn thiện nội thất văn phòng 1.200m2 tại Cầu Giấy",
  "budget": 3500000000,
  "deadline": "2026-12-20T00:00:00.000Z",
  "industry": "Xây dựng & Kiến trúc nội thất",
  "description": "Ưu tiên doanh nghiệp trong CLB CEO 1983 có chính sách chiết khấu hội viên và cam kết tiến độ hoàn thiện trước Tết Nguyên Đán.",
  "exclusiveDiscountRate": "10% cho hội viên CEO 1983",
  "attachments": ["https://cdn.ceo1983.vn/docs/ho-so-moi-thau-viconnect-2026.pdf"]
}
```

---

# CHƯƠNG 9: QUẢN LÝ CÔNG VIỆC KANBAN & TRÍ TUỆ NHÂN TẠO GEMINI (TASKS & AI ENGINE)

### 9.1. Quản Lý Thẻ Công Việc Kanban & Kéo Thả (GET & PUT /api/tasks)
* **Mô tả:** Hiển thị thẻ công việc theo các cột trạng thái (`TODO`, `IN_PROGRESS`, `REVIEW`, `DONE`). Hỗ trợ thao tác kéo thả (Drag and drop) cập nhật trạng thái tự động 100%.
* **PUT /api/tasks/:id/status Request Body:**
```json
{
  "status": "DONE",
  "orderIndex": 3,
  "completionNotes": "Đã hoàn thành in ấn 500 thiệp mời mạ vàng và bàn giao Ban Thư Ký."
}
```

### 9.2. AI Bóc Tách Nhiệm Vụ Từ Biên Bản Họp Word/Excel (POST /api/tasks/ai-parse)
* **Mô tả:** Người dùng tải lên tệp Word (`.docx`), Excel (`.xlsx`) hoặc nội dung văn bản Biên bản họp Ban Điều Hành. Engine Google Gemini 2.0 / 2.5 Flash phân tích cấu trúc, nhận diện các kết luận chỉ đạo, tự động trích xuất danh sách Task, phân bổ người chịu trách nhiệm trong Ban, xác định thời hạn Deadline và mức độ ưu tiên.
* **Request Body (`multipart/form-data` hoặc JSON text):**
```json
{
  "boardId": "BAN_SU_KIEN",
  "documentText": "Biên bản họp Ban Sự Kiện ngày 08/11/2026: 1. Đ/c Nguyễn Hoàng Long chỉ đạo chốt hợp đồng thuê sảnh Keangnam trước 15/11; 2. Đ/c Phạm Minh Đức phụ trách kết nối cổng thanh toán VietQR trước 20/11; 3. Đ/c Trần Thu Hà thiết kế 3 mẫu thư mời gửi duyệt trước 12/11."
}
```
* **Response Success (200 OK):**
```json
{
  "success": true,
  "data": {
    "extractedTasks": [
      {
        "title": "Ký hợp đồng thuê sảnh Grand Ballroom Keangnam Landmark72",
        "assignedMemberId": "mem_001_83",
        "assignedMemberName": "Nguyễn Hoàng Long",
        "board": "BAN_CHU_TICH",
        "priority": "HIGH",
        "deadline": "2026-11-15T17:00:00.000Z",
        "status": "TODO"
      },
      {
        "title": "Tích hợp cổng thanh toán VietQR Napas247 cho sự kiện Gala",
        "assignedMemberId": "mem_012_83",
        "assignedMemberName": "Phạm Minh Đức",
        "board": "BAN_GIAO_THUONG",
        "priority": "URGENT",
        "deadline": "2026-11-20T17:00:00.000Z",
        "status": "TODO"
      },
      {
        "title": "Thiết kế 3 mẫu poster thư mời Wyndham và Keangnam",
        "assignedMemberId": "mem_045_83",
        "assignedMemberName": "Trần Thu Hà",
        "board": "BAN_TRUYEN_THONG",
        "priority": "MEDIUM",
        "deadline": "2026-11-12T17:00:00.000Z",
        "status": "TODO"
      }
    ],
    "aiAnalysisSummary": "AI đã phát hiện 3 công việc trọng tâm có thời hạn hoàn thành trước 20/11/2026. Đã tự động đối chiếu danh bạ hội viên để gán đúng tài khoản thực hiện."
  }
}
```

### 9.3. Cố Vấn AI Phân Tích Dòng Tiền & Thẩm Định Dự Án (POST /api/ai/advisor)
* **Mô tả:** Trợ lý AI tài chính hỗ trợ Chủ tịch và Ban Lãnh đạo phân tích dự báo ngân sách, tỷ lệ thu hội phí và thẩm định chỉ số tài chính (IRR, NPV, ROI) cho các dự án hợp tác B2B.
* **Request Body:**
```json
{
  "prompt": "Hãy phân tích tình hình thu ngân sách quý 4/2026 và đưa ra khuyến nghị để đạt mục tiêu 3 tỷ đồng cho sự kiện Gala Keangnam.",
  "includeFinancialContext": true
}
```

---

# CHƯƠNG 10: TRUYỀN THÔNG ĐA KÊNH, ZALO OA ZNS & SMTP MAIL (BROADCAST ENGINE)

### 10.1. Phát Sóng Thông Báo Đa Kênh Tức Thời (POST /api/broadcast/send)
* **Mô tả:** Phát đi thông báo khẩn, thư mời họp, thông báo hội phí qua 3 kênh đồng bộ: Zalo OA ZNS (tích vàng), Email HTML doanh nghiệp và Web/App Push Notification.
* **Quyền hạn:** `SECRETARY`, `PRESIDENT`, `SUPER_ADMIN`.
* **Request Body:**
```json
{
  "templateId": "BM-CEO1983-ZNS-09",
  "targetAudience": {
    "scope": "SPECIFIC_MEMBERS",
    "memberIds": ["mem_001_83", "mem_002_83"]
  },
  "channels": ["ZALO_ZNS", "EMAIL", "IN_APP"],
  "content": {
    "title": "THƯ MỜI THAM DỰ GALA XUÂN CEO 1983 TẠI KEANGNAM",
    "salutation": "Kính gửi Anh/Chị Doanh Nhân",
    "eventTime": "17h30 ngày 28/12/2026",
    "venue": "Keangnam Landmark72, Hà Nội",
    "posterUrl": "https://cdn.ceo1983.vn/templates/poster-keangnam-gold.png"
  }
}
```

### 10.2. Trạng Thái Kết Nối & Xoay Vòng Access Token Zalo OA (GET /api/zalo/token-status)
* **Mô tả:** Kiểm tra thời hạn sống của Zalo OA Access Token (hạn 25 giờ). Dịch vụ nền tự động dùng `refresh_token` để làm mới token trước khi hết hạn 30 phút, bảo đảm hệ thống gửi ZNS 24/7 không gián đoạn.
* **Response Success (200 OK):**
```json
{
  "success": true,
  "data": {
    "isConnected": true,
    "oaName": "CLB Doanh Nhân CEO 1983 - HanoiBA",
    "oaId": "19838383838383",
    "tokenExpiresAt": "2026-11-11T07:30:00.000Z",
    "expiresInMinutes": 1375,
    "autoRefreshJobStatus": "HEALTHY_ACTIVE"
  }
}
```

---

# CHƯƠNG 11: KẾT NỐI THỜI GIAN THỰC WEBSOCKET (SOCKET.IO GATEWAY)

### 11.1. Giao Thức Handshake & Xác Thực Token
* **Cổng kết nối WebSocket:** `wss://api.ceo1983.vn/events` hoặc `http://127.0.0.1:3000/events`
* **Tham số Handshake:**
```javascript
const socket = io('https://api.ceo1983.vn/events', {
  auth: {
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  },
  transports: ['websocket', 'polling']
});
```

### 11.2. Danh Sách Kênh Sự Kiện (Emit & Listen Events)
1. `subscribe:board` (Client Emit): Đăng ký nhận sự kiện riêng của Ban (`BAN_CHU_TICH`, `BAN_TAI_CHINH`,...).
2. `payment:success` (Server Emit): Bắn tín hiệu thanh toán hội phí / vé sự kiện thành công tới màn hình hội viên và kế toán.
3. `task:updated` (Server Emit): Bắn tín hiệu khi có task mới hoặc thẻ Kanban được kéo thả sang cột mới.
4. `meeting:invite` (Server Emit): Bắn thông báo cuộc họp trực tuyến sắp diễn ra trong 15 phút.
5. `chat:message` (Hai chiều): Trao đổi tin nhắn riêng tư và tin nhắn nhóm thời gian thực.
6. `event:checkin_alert` (Server Emit): Bắn thông báo lên màn hình lễ tân và LED sân khấu khi khách VIP vừa quét vé qua cổng Keangnam.

---
*Tài liệu Đặc tả Giao tiếp API CEO 1983 hoàn tất với đầy đủ 100% chi tiết kỹ thuật.*

