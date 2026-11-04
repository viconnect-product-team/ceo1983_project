# 47 — Secure Coding & Data Protection (Tiêu chuẩn Code Bảo mật & Gia cố 6 Lớp Zero-Trust)

**Ban hành:** 2026-08-17 (Cập nhật bổ sung Gói Bảo mật 6 Lớp Monorepo/PostgreSQL: 2026-11-02)
**Mục đích:** Thiết lập kỷ luật lập trình an toàn (Secure Coding) cho toàn bộ hệ sinh thái `_vibe-team-os`. Ngăn chặn triệt để các rủi ro bảo mật mã nguồn do AI Agent hoặc Dev sinh ra (Hardcode, XSS, IDOR, Data Exposure, Forged JWT, Privilege Escalation, SQLi, Brute-Force, DoS). File này đóng vai trò là "Luật Hình sự" trong quá trình Review Code và Chuyển đổi Kiến trúc Monorepo.
**Liên kết:** `28-FE-BE-SEPARATION-DISPLAY-READY.md` · `40-SA-BA-RULES-AND-SKILLS.md` · `49-MONOREPO-DOMAIN-ARCHITECTURE.md`
**Neo:** `OS-SEC-ZERO-TRUST-47`

---

## 1. Bảo vệ Dữ liệu & Chống Rò rỉ (Data Exposure & Hardcode)

AI Agent thường có xu hướng "code cho nhanh chạy được" nên rất hay vướng vào các lỗi lộ lọt dữ liệu tĩnh. Toàn bộ team phải tuân thủ:

### 1.1 Cấm tuyệt đối Hardcode (No Secrets in Code)
*   **Luật:** Không một API Key, Secret Key, Database URL, hay Mật khẩu nào được phép viết cứng dạng Text vào trong file `.ts`, `.js`, `.json` (kể cả code dùng để test).
*   **Thực thi:** Bắt buộc dùng biến môi trường (Environment Variables) thông qua `process.env` hoặc `ConfigService` của NestJS.

### 1.2 Chặn Rò rỉ Dữ liệu Nhạy cảm (Sensitive Data Exposure)
*   **Lỗi thường gặp:** Truy vấn `prisma.user.findUnique()` rồi ném thẳng toàn bộ object User trả về cho Frontend, làm lộ luôn cột `password_hash`, `salt`, `reset_token`.
*   **Thực thi:** Backend **BẮT BUỘC** phải dùng DTO (Data Transfer Object) để lọc dữ liệu trước khi `return`. Chỉ trả về đúng những trường Frontend cần hiển thị (Tuân thủ nguyên tắc *Display-Ready* của File 28).

---

## 2. Bảo vệ Cửa ngõ API (Backend Security)

### 2.1 Chống Lỗ hổng IDOR (Insecure Direct Object Reference)
*   **Tình huống:** User A (ID: 1) đăng nhập, nhưng lại gửi request `DELETE /api/users/2/invoices/99` để xóa hóa đơn của User B. Nếu Backend chỉ check "có Token đăng nhập chưa" thì hệ thống sẽ bị hack.
*   **Thực thi:** Trong mọi hàm xử lý (Update, Delete, Get Detail), Backend phải verify quyền sở hữu. So khớp `userId` lấy từ JWT Token (người đang thao tác) với `ownerId` của bản ghi trong Database. Nếu không khớp, ném lỗi `403 Forbidden`.

### 2.2 Chống SQL/NoSQL Injection
*   **Thực thi:** Cấm tuyệt đối việc cộng chuỗi (String concatenation) khi viết câu lệnh truy vấn Database. Bắt buộc sử dụng Query Builder, Parameterized Queries (`$1, $2, ...`) hoặc phương thức chuẩn của Prisma/TypeORM để tự động sanitize dữ liệu đầu vào.

---

## 3. An toàn Giao diện Frontend (React / Vite)

### 3.1 Chống XSS (Cross-Site Scripting)
*   **Luật:** Mặc định React đã tự động encode HTML để chống XSS. Tuy nhiên, **Nghiêm cấm** Dev/Agent sử dụng thuộc tính `dangerouslySetInnerHTML` trừ khi có yêu cầu nghiệp vụ bắt buộc (VD: render bài viết Rich Text).
*   **Bảo vệ:** Nếu bắt buộc phải dùng `dangerouslySetInnerHTML`, dữ liệu đầu vào BẮT BUỘC phải được làm sạch bằng thư viện `DOMPurify` trước khi render.

### 3.2 Quản trị Token & State (Client Security)
*   **Luật:** KHÔNG lưu trữ Access Token giả lập (unsigned Base64) hoặc token của hệ thống BaaS cũ khi đã cắt chuyển sang PostgreSQL Gateway mới.
*   **Tiêu chuẩn:** Token nhạy cảm ưu tiên lưu trong **HttpOnly, Secure Cookies**; nếu sử dụng Bearer JWT qua SDK Client, bắt buộc phải thực thi hàm dọn dẹp token cũ (`purgeLegacyUnsignedTokensFromStorage`) ngay khi khởi tạo ứng dụng và chỉ chấp nhận token ký số `HMAC-SHA256` (`HS256`) có thời hạn ngắn kèm xoay vòng Refresh Token.

---

## 4. Chốt chặn Review Code (Security Reject Gates)

Tech Lead và PM BẮT BUỘC **REJECT (Từ chối Merge)** ngay lập tức và đánh dấu **[CRITICAL BUG]** nếu phát hiện các dấu hiệu sau trong Pull Request (dù là do người hay AI viết):

| Dấu hiệu Code bẩn (Red Flags) | Lý do Reject & Xử lý |
| :--- | :--- |
| `apiKey: "sk-live-1234..."` nằm trong file `.ts` | **REJECT.** Cảnh báo bảo mật cấp cao. Yêu cầu đưa vào `.env`. Nếu PR đã lỡ commit key thật, phải thực hiện Rotate/Revoke key ngay lập tức. |
| `dangerouslySetInnerHTML={{ __html: data }}` (Không có hàm sanitize) | **REJECT.** Mở toang cửa cho Hacker chèn mã độc XSS vào hệ thống. Ép dùng `DOMPurify`. |
| API Update/Delete không có logic check `req.user.id === record.ownerId` | **REJECT.** Vi phạm quy tắc chống IDOR. Ai cũng có quyền sửa/xóa data của người khác. |
| Trả về Frontend object chứa: `password`, `token`, `is_admin_hidden` | **REJECT.** Rò rỉ dữ liệu. Ép Backend ánh xạ qua DTO để gọt bỏ các trường nhạy cảm. |
| JWT chỉ mã hóa Base64 không ký `HMAC-SHA256` hoặc chấp nhận `alg: "none"` | **REJECT.** Hacker có thể tự sửa payload thành `system_admin`. Bắt buộc ký `HS256` + `timingSafeEqual`. |
| Kết nối PostgreSQL bằng role chủ bảng (table owner) mà không bật `FORCE RLS` | **REJECT.** Toàn bộ chính sách RLS bị vô hiệu hóa ngầm. Bắt buộc bật `FORCE ROW LEVEL SECURITY` + Trigger bảo vệ bảng RBAC. |

---

## 5. Hướng dẫn Dispatch cho PM/PO (Prompt Template)

Khi giao task cho AI (Cursor/Claude/Antigravity) thao tác trên các tính năng nhạy cảm (Đăng nhập, Thanh toán, Quản lý User, Chuyển đổi Monorepo), hãy gắn khối lệnh bảo mật sau vào Prompt:

```yaml
security_directives:
  - "OWASP Adherence: Strictly prevent IDOR. All mutate/delete APIs must verify resource ownership against the authenticated JWT user."
  - "No Data Exposure: Filter all outgoing API responses through rigorous DTOs. NEVER return password hashes, salts, or internal tokens to the client."
  - "No Hardcoding: All secrets, API URLs, and configuration keys MUST be accessed via environment variables."
  - "XSS Prevention: Do not use dangerouslySetInnerHTML. If HTML rendering is explicitly required, you MUST implement DOMPurify."
  - "6-Layer Zero-Trust Gateway: Enforce HS256 JWT + timingSafeEqual, Bcrypt-only auth, IP Rate Limiting (15 login/min, 600 req/min), Stream Payload <= 10MB, PostgreSQL FORCE RLS + Lookup Write-Guard Trigger, and Helmet Security Headers."
```

---

## 6. Kiến trúc Gia cố Bảo mật 6 Lớp Zero-Trust Bắt buộc khi Chuyển đổi Monorepo & Database PostgreSQL (`LOCK-MONOREPO-6LAYER-SECURITY-GATE`)

Mỗi khi chuyển đổi dự án sang kiến trúc Monorepo (`apps/api`, `apps/web`, `apps/mobile`, `packages/*`) và/hoặc cắt chuyển Database từ Supabase sang PostgreSQL độc lập, Agent **BẮT BUỘC** tự động triển khai đầy đủ 6 lớp bảo mật dưới đây mà không cần chờ nhắc:

### Lớp 1: Xác thực Mật mã học JWT (`HMAC-SHA256` / `HS256`) & Quản lý Vòng đời Token
- **Chuẩn ký số:** Mọi Access Token phải được ký bằng thuật toán `HS256` (RFC 2104 `HMAC-SHA256` trên nền FIPS 180-4 `SHA-256`) với khóa bí mật `JWT_SECRET` từ `.env` (tối thiểu 32 ký tự). Cấm tuyệt đối Base64 giả lập hoặc `alg: "none"`.
- **Chống Timing Attack:** Khi đối chiếu chữ ký JWT, bắt buộc sử dụng thuật toán so sánh hằng thời gian (`timingSafeEqualBytes`).
- **Thu hồi & Xoay vòng Token:**
  - Mỗi Access Token phải chứa `jti` (JWT ID) duy nhất và thời gian hết hạn `exp`.
  - Khi người dùng đăng xuất (`/auth/v1/logout`), `jti` phải được đưa ngay vào danh sách thu hồi (`Revoked JTI Denylist`) để vô hiệu hóa tức thì.
  - Khi làm mới phiên (`grant_type=refresh_token`), phải xoay vòng Refresh Token (**Refresh Token Rotation**): thu hồi Refresh Token cũ ngay khi cấp cặp Token mới.

### Lớp 2: Bảo mật Mật khẩu chuẩn `Bcrypt` (`$2a$` / `$2b$`)
- Toàn bộ mật khẩu người dùng trong bảng `auth.users` bắt buộc băm bằng `Bcrypt` (`$2a$` hoặc `$2b$`, cost factor ≥ 10).
- **Cấm tuyệt đối** mọi đoạn mã fallback so sánh mật khẩu dạng văn bản thuần (`plaintext === input`) hoặc băm yếu (MD5/SHA1).

### Lớp 3: Chống Tấn công Vũ lực (Brute-Force Lockout) & Giới hạn Tần suất (Rate Limiting)
- **Chống dò mật khẩu (`/auth/v1/token`):** Giới hạn tối đa **15 lần đăng nhập thất bại / 60 giây / IP**. Khi vượt ngưỡng, trả về `429 Too Many Requests` kèm header `Retry-After: 60`.
- **Chống cạn kiệt tài nguyên (API Rate Limit):** Giới hạn tối đa **600 requests / 60 giây / IP** cho toàn bộ API Gateway.

### Lớp 4: Chống Tràn Bộ Nhớ & DoS qua Kích thước Payload (`<= 10MB`)
- Kiểm tra ngay tại luồng đọc stream (`req.on('data')`). Nếu tổng kích thước vượt quá **10MB (`10,485,760` bytes)**, hủy luồng đọc ngay lập tức và trả về `413 Payload Too Large` trước khi parse JSON.

### Lớp 5: Thực thi Row-Level Security (RLS) Thực chất & Chống Leo thang Đặc quyền trên PostgreSQL
- **Chặn Ghi Nặc Danh (Zero Anonymous Write):** Mọi phương thức ghi (`POST`, `PATCH`, `PUT`, `DELETE`) trên `/rest/v1/*` bắt buộc phải có JWT hợp lệ (`role = 'authenticated'`). Nếu gọi bằng `anon` key → chặn ngay với `401 Unauthorized`.
- **Quy tắc Bắt buộc khi kết nối DB bằng Role Chủ Bảng (Table Owner trên PgBouncer/Managed Postgres):**
  1. Bật `ENABLE ROW LEVEL SECURITY` và **`FORCE ROW LEVEL SECURITY`** trên toàn bộ các bảng nghiệp vụ, kèm Policy `zz_internal_service_bypass_rls` (`USING (current_setting('app.bypass_rls', true) = 'on')`) chỉ bật trong truy vấn hệ thống `runSystemQuery`.
  2. **Chống đệ quy vô hạn (`54001 stack depth limit exceeded`) trên bảng tra cứu RBAC:** Với các bảng được truy vấn bên trong hàm `SECURITY DEFINER` (như `platform_admins`, `user_roles`, `user_company_memberships`, `company_user_roles`, `company_role_permissions`, `company_role_overrides`, `role_permissions`, `user_permission_overrides`, `profiles`, `employees`, `companies`, `departments`, `attendance_delegations`), đặt `NO FORCE ROW LEVEL SECURITY` để hàm `SECURITY DEFINER` đọc không bị đệ quy, đồng thời **BẮT BUỘC gắn Trigger `BEFORE INSERT OR UPDATE OR DELETE` (`fn_enforce_lookup_table_write_guard`)** kiểm tra quyền Admin trước khi cho phép ghi. Mọi hành vi user thường tự chèn quyền vào `user_roles` / `platform_admins` sẽ bị chặn đứng với mã lỗi PostgreSQL `42501` (`403 Forbidden`).

### Lớp 6: Bảo vệ Bề mặt HTTP, Chống XSS/SQLi & Ẩn danh Hạ tầng
- **Helmet Security Headers:** Mọi phản hồi HTTP phải đính kèm `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `X-XSS-Protection: 1; mode=block`, `Referrer-Policy: strict-origin-when-cross-origin`.
- **CORS Whitelist:** Chỉ cấp phép cho các Origin nằm trong danh sách `ALLOWED_ORIGINS`.
- **Chống SQL Injection qua Query Parser:** Mọi giá trị truyền qua mảng tham số hóa (`$1, $2, ...`). Mọi tên cột từ URL query (`select`, `order`, `on_conflict`, filter key) phải khớp biểu thức chính quy `^[a-zA-Z0-9_]+$`; nếu vi phạm trả về `400 Bad Request`.
- **Ẩn danh Hạ tầng (Infrastructure Redaction):** Cấm lộ IP/Port thật của Database trong HTTP Header hoặc thân lỗi JSON.

---

## 7. Cổng Kiểm thử Xâm nhập Trực tiếp Bắt buộc (Live Penetration Test Gate — 7 Vectors)

Trước khi đóng bất kỳ Wave chuyển đổi Monorepo hoặc nâng cấp Backend nào (`PASS_TO_PM`), Agent bắt buộc chạy kịch bản **Live Penetration Test** kiểm chứng 7 vector tấn công trực tiếp vào Gateway:
1. **Vector 1 (Forged JWT):** Sửa chữ ký JWT → Bị chặn `401 Unauthorized`.
2. **Vector 2 (`alg: none` JWT):** Gửi token không chữ ký → Bị chặn `401 Unauthorized`.
3. **Vector 3 (Privilege Escalation):** User thường gọi `POST /rest/v1/user_roles` tự gán quyền `system_admin` → Bị chặn `403 Forbidden`.
4. **Vector 4 (Anonymous Write):** Gửi `POST/DELETE` bằng `anon` token → Bị chặn `401 Unauthorized`.
5. **Vector 5 (Payload OOM/DoS):** Gửi body `> 10MB` → Bị chặn `413 Payload Too Large`.
6. **Vector 6 (SQLi Identifier):** Gửi `?id;DROP TABLE employees--=eq.1` → Bị chặn `400 Bad Request`.
7. **Vector 7 (Brute-Force Login):** Đăng nhập sai `> 15` lần/phút → Bị chặn `429 Too Many Requests` + `Retry-After`.

