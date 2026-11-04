# 49 — MONOREPO & ENTERPRISE DOMAIN-DRIVEN DESIGN (DDD) ARCHITECTURE

**Ban hành:** 2026-11-01 (Cập nhật bổ sung Gói Bảo mật 6 Lớp Zero-Trust: 2026-11-02)  
**Mục đích:** Thiết lập tiêu chuẩn Kiến trúc Monorepo, Phân tách Thư mục theo Phân hệ (Domain/Feature-based), Quy tắc UI/UX (Productivity OS Logic), Tiêu chuẩn Code (SOLID & Design Patterns), và **Tiêu chuẩn Gia cố Bảo mật 6 Lớp Zero-Trust Bắt buộc khi chuyển đổi Monorepo/Database** cho toàn bộ các Agent trong hệ sinh thái `_vibe-team-os`.  
**Neo:** `OS-ARCH-MONOREPO-DDD-49`

---

## BƯỚC 1: LƯU TRỮ KIẾN TRÚC VÀO HỆ ĐIỀU HÀNH (OS PERSISTENCE)
- [x] Đã lưu trữ toàn bộ Quy tắc Kiến trúc, Phân tách Thư mục, UI/UX, SOLID, và Bảo mật Zero-Trust 6 Lớp vào `_vibe-team-os/49-MONOREPO-DOMAIN-ARCHITECTURE.md` để các Agent đối chiếu xuyên suốt.

---

## BƯỚC 2: TIÊU CHUẨN KIẾN TRÚC THƯ MỤC (STRICT DIRECTORY BOUNDARIES)
Khởi tạo cấu trúc Monorepo (Turborepo/Nx). Mã nguồn BẮT BUỘC phải được chia theo Phân hệ (Domain/Feature-based) để chống rối mắt.

### 1. Backend (`apps/api` - NestJS)
Mỗi phân hệ (ví dụ: `users`, `invoices`, `employees`, `contracts`, `attendance`, `payroll`, `emulation`, `training`, `recruitment`, `ohs`, ...) phải được gom vào một thư mục riêng biệt tại `src/modules/[tên_phân_hệ]/`. Bên trong phân hệ, chia tách tuyệt đối:
- `/controllers`: Chỉ chứa luồng nhận/trả Request.
- `/services`: Chứa Business Logic thuần túy.
- `/dto`: Định nghĩa Schema/Type xác thực đầu vào.
- `/tests`: **BẮT BUỘC TÁCH RIÊNG.** Toàn bộ Unit Test, Mock Data của phân hệ này phải nằm trong thư mục này, không được vứt lẫn lộn với file service.

### 2. Frontend Web & Mobile (`apps/web` & `apps/mobile`)
Tuân thủ kiến trúc Feature-Sliced. Mỗi tính năng nghiệp vụ nằm trong `src/features/[tên_tính_năng]/`:
- `/components`: Các UI Component đặc thù của tính năng này.
- `/hooks`: Logic xử lý state cục bộ.
- `/api`: Các hàm gọi API (Zustand/React Query) riêng cho tính năng.
- `/tests`: Các file test UI/Integration tách biệt hoàn toàn.

### 3. Tái sử dụng (`packages/`)
- `packages/ui`: Chứa System Design UI Kit (Core components).
- `packages/shared`: Các Type, DTO, Utilities dùng chung cho toàn bộ Monorepo.

---

## BƯỚC 3: QUY TẮC UI/UX (PRODUCTIVITY OS LOGIC)
Giao diện Web và Mobile BẮT BUỘC tuân thủ logic thiết kế của các hệ thống quản trị năng suất và dự án hàng đầu thế giới. Tuyệt đối không thiết kế theo kiểu landing page lỏng lẻo.

- **Bố cục Không gian (Spatial Layout):** Sử dụng thiết kế Đa không gian (Multi-pane). Cột trái là thanh điều hướng linh hoạt (Collapsible Sidebar). Phía trên có Breadcrumbs rõ ràng phân cấp cha-con.
- **Độ nén Dữ liệu (High Information Density):** Hiển thị dữ liệu tối ưu trên một màn hình nhưng không rối. Áp dụng các bảng Table có thể thao tác trực tiếp trên ô (Inline-editing).
- **Chế độ xem Đa luồng (Multi-view):** Dữ liệu phải hỗ trợ chuyển đổi mượt mà giữa Dạng danh sách (List View), Dạng thẻ kéo thả (Kanban Board), và Dạng lịch (Calendar/Timeline).
- **Mobile UX:** Tối ưu hóa cho ngón tay. Dùng Bottom Tabs điều hướng chính. Các tác vụ phụ ẩn trong Bottom Sheet Modal vuốt từ dưới lên. Bảng dữ liệu dài chuyển sang dạng Card List.
- **Thẩm mỹ:** Background nền xám nhạt/trắng trung tính. Viền mỏng (`1px solid #e2e8f0`), `border-radius: 8px` tinh gọn, phân biệt rõ các thẻ trạng thái (Tags/Status) bằng màu sắc rực rỡ nhưng dịu mắt.

---

## BƯỚC 4: TIÊU CHUẨN CODE (SOLID & DESIGN PATTERNS)
- **SOLID Principles:** Mọi file service phải tuân thủ Single Responsibility (Chỉ làm 1 việc). Sử dụng Dependency Injection (DI) triệt để trong Backend để dễ dàng mock khi test.
- **Design Patterns Bắt Buộc:**
  1. *Strategy Pattern:* Dùng khi có nhiều thuật toán tính toán khác nhau (VD: tính lương, tính thuế).
  2. *Observer/PubSub:* Dùng cho các luồng xử lý bất đồng bộ, thông báo (Notification/Email) để không làm block luồng chính.
  3. *Adapter:* Dùng khi giao tiếp với các API bên thứ 3 (Payment, SMS, HIS/EMR, BHXH).
- **Lằn Ranh Đỏ:** KHÔNG HARDCODE bất kỳ cấu hình, secret key, hay magic number nào.

---

## BƯỚC 5: TIÊU CHUẨN CẮT CHUYỂN DATABASE & GIA CỐ BẢO MẬT 6 LỚP ZERO-TRUST BẮT BUỘC (MONOREPO SECURITY GATE)

Mỗi khi thực hiện chuyển đổi sang kiến trúc Monorepo (`apps/api`, `apps/web`, `apps/mobile`, `packages/*`) và/hoặc cắt chuyển cơ sở dữ liệu từ BaaS (như Supabase) sang PostgreSQL độc lập, Agent **BẮT BUỘC** phải tự động triển khai đầy đủ **Gói Gia Cố Bảo Mật 6 Lớp (6-Layer Zero-Trust Security Hardening)** ngay trong pha Backend & Frontend mà **KHÔNG ĐƯỢC CHỜ USER NHẮC**:

### 1. Lớp 1 — Xác thực JWT chuẩn mật mã học `HMAC-SHA256` (`HS256`) & Quản lý Phiên (Cryptographic Auth)
- **CẤM TUYỆT ĐỐI** sử dụng Base64 giả lập hoặc chấp nhận thuật toán `alg: "none"`.
- Mọi Access Token phải được ký và xác thực bằng chuẩn mật mã học **RFC 2104 `HMAC-SHA256` (`HS256`)** sử dụng `JWT_SECRET` lấy từ biến môi trường (`.env`, tối thiểu 32 ký tự).
- Kiểm tra chữ ký bắt buộc dùng hàm so sánh hằng thời gian (**Constant-time comparison** `timingSafeEqualBytes`) để chống tấn công Timing Side-Channel.
- Bắt buộc kiểm tra hạn dùng `exp`, thu hồi mã định danh token `jti` ngay lập tức khi `/logout` (Token Revocation Denylist), và xoay vòng Refresh Token (**Refresh Token Rotation** — vô hiệu hóa refresh token cũ ngay khi cấp cặp token mới).
- Phía Frontend (`client.ts`): Tự động quét và xóa sạch (`purgeLegacyUnsignedTokensFromStorage`) mọi token cũ chưa ký hoặc token của hệ thống BaaS cũ còn sót trong `localStorage` trước khi khởi tạo phiên.

### 2. Lớp 2 — Xác thực Mật khẩu Nghiêm ngặt chuẩn `Bcrypt` (`$2a$` / `$2b$`)
- **CẤM TUYỆT ĐỐI** mọi nhánh fallback so sánh mật khẩu dạng văn bản thuần (plaintext) hoặc băm yếu (MD5/SHA1).
- Mọi tài khoản trong `auth.users` bắt buộc lưu trữ và đối chiếu qua `Bcrypt` (`$2a$` / `$2b$`, cost factor ≥ 10). Nếu biểu thức mật khẩu trong DB không đúng định dạng Bcrypt, từ chối đăng nhập ngay lập tức (`401 Unauthorized`).

### 3. Lớp 3 — Chống Brute-Force & Rate Limiting theo IP tại Gateway
- **Login Rate Limiter:** Khóa tạm thời IP (`429 Too Many Requests` kèm header `Retry-After: 60`) nếu đăng nhập sai quá **15 lần / 60 giây / IP**. Reset bộ đếm khi đăng nhập thành công.
- **General API Rate Limiter:** Giới hạn tối đa **600 requests / 60 giây / IP** trên toàn bộ API Gateway để chống tấn công DoS/Scraping làm cạn kiệt Connection Pool.

### 4. Lớp 4 — Giới hạn Kích thước Payload Stream (`<= 10MB`) chống tràn bộ nhớ (OOM/DoS)
- Kiểm tra ngay tại luồng đọc stream (`req.on('data')`): Nếu tổng dung lượng body vượt quá **10MB (`10,485,760` bytes)**, lập tức hủy luồng đọc và trả về `413 Payload Too Large` trước khi parse JSON hoặc cấp phát bộ nhớ lớn.

### 5. Lớp 5 — Thực thi Row-Level Security (RLS) Thực chất & Chống Leo thang Đặc quyền trên PostgreSQL
- **Chặn Ghi Nặc Danh (Zero Anonymous Write):** Mọi thao tác ghi (`POST`, `PATCH`, `PUT`, `DELETE`) bắt buộc phải có JWT hợp lệ (`role = 'authenticated'`). Nếu gọi bằng `anon` key hoặc không có Bearer Token → chặn đứng ngay tại Gateway (`401 Unauthorized`).
- **Xử lý bài toán kết nối bằng Role Chủ Bảng (Table Owner Role trên PgBouncer/Managed Postgres):**
  - Khi ứng dụng kết nối vào PostgreSQL bằng role sở hữu bảng (table owner, mặc định bypass RLS), **BẮT BUỘC** phải bật `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` và `FORCE ROW LEVEL SECURITY` trên toàn bộ các bảng nghiệp vụ, kết hợp Policy nội bộ `zz_internal_service_bypass_rls` chỉ cho phép bypass khi biến phiên cục bộ `current_setting('app.bypass_rls', true) = 'on'` (chỉ bật trong giao dịch hệ thống `runSystemQuery` như đăng nhập/kiểm tra sức khỏe).
  - **Chống đệ quy vô hạn (`54001 stack depth limit exceeded`) trên các bảng tra cứu RBAC:** Đối với các bảng tra cứu phân quyền được gọi bên trong các hàm `SECURITY DEFINER` (như `platform_admins`, `user_roles`, `user_company_memberships`, `company_user_roles`, `company_role_permissions`, `company_role_overrides`, `role_permissions`, `user_permission_overrides`, `profiles`, `employees`, `companies`, `departments`, `attendance_delegations`), đặt `NO FORCE ROW LEVEL SECURITY` để hàm `SECURITY DEFINER` đọc không bị đệ quy, đồng thời **BẮT BUỘC gắn Trigger `BEFORE INSERT OR UPDATE OR DELETE`** (`fn_enforce_lookup_table_write_guard`) kiểm tra trực tiếp ngữ cảnh phiên (`app.bypass_rls`, `public.is_platform_admin()`, `public.is_SystemAdmin()`) để chặn đứng `42501 -> 403 Forbidden` mọi hành vi tự nâng quyền (Privilege Escalation).

### 6. Lớp 6 — Bảo vệ Bề mặt HTTP (Helmet Headers, CORS Whitelist, Chống SQL Injection & Ẩn IP DB)
- **Helmet Security Headers:** Gắn bắt buộc trên mọi phản hồi HTTP:
  - `X-Frame-Options: DENY` (chống Clickjacking)
  - `X-Content-Type-Options: nosniff` (chống MIME-sniffing)
  - `X-XSS-Protection: 1; mode=block`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Cache-Control: no-store` cho các đường dẫn `/auth/`
- **CORS Origin Whitelist:** Chỉ phản hồi `Access-Control-Allow-Origin` cho các Origin nằm trong danh sách cho phép (`ALLOWED_ORIGINS`), tuyệt đối không dùng `*` kèm credentials trong môi trường Production.
- **Chống SQL Injection qua Query Parser:** Mọi tên cột lọc/sắp xếp (`select`, `order`, `on_conflict`, tên cột filter) phải khớp biểu thức chính quy `^[a-zA-Z0-9_]+$`; mọi giá trị bắt buộc đi qua **Parameterized Queries (`$1, $2, ...`)**. Nếu phát hiện ký tự lạ (`;`, `--`, `'`, `/*`, `DROP`, `UNION`) trong định danh cột → trả về `400 Bad Request`.
- **Ẩn danh Hạ tầng (Infrastructure Redaction):** Cấm lộ địa chỉ IP và cổng của máy chủ PostgreSQL trong bất kỳ HTTP Header hay thông báo lỗi nào trả về cho Client.

---

## BƯỚC 6: CỔNG KIỂM THỬ XÂM NHẬP TRỰC TIẾP (LIVE PENETRATION TEST GATE)
Trước khi tuyên bố hoàn thành chuyển đổi Monorepo hoặc cắt chuyển Database (`PASS_TO_PM`), Agent **BẮT BUỘC** phải viết Unit Test bảo mật và chạy kịch bản **Live Penetration Test** bắn trực tiếp vào Gateway đang chạy với tối thiểu **7 vector tấn công thực tế**:
1. Giả mạo chữ ký JWT (`HMAC` bị sửa đổi) → Phải bị chặn `401 Unauthorized`.
2. Tấn công JWT `alg: "none"` → Phải bị chặn `401 Unauthorized`.
3. Tấn công leo thang đặc quyền (User thường gọi API tự chèn quyền vào `user_roles` / `platform_admins`) → Phải bị chặn `403 Forbidden` bởi Trigger/RLS.
4. Tấn công ghi dữ liệu nặc danh (`anon` gửi `POST/PATCH/DELETE` vào bảng nghiệp vụ) → Phải bị chặn `401 Unauthorized`.
5. Tấn công DoS/OOM gửi Payload `> 10MB` → Phải bị chặn `413 Payload Too Large`.
6. Tấn công SQL Injection qua tên cột filter (`?id;DROP TABLE employees--=eq.1`) → Phải bị chặn `400 Bad Request`.
7. Tấn công Brute-Force đăng nhập sai liên tiếp (`> 15 lần/phút`) → Phải bị chặn `429 Too Many Requests` kèm `Retry-After`.

