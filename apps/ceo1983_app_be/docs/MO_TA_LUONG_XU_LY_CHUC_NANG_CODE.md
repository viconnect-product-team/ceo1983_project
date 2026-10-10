# MÔ TẢ LUỒNG XỬ LÝ CHỨC NĂNG CODE BACKEND (FLOW SPECIFICATION)
## Phân Hệ: Backend API NestJS (`apps/ceo1983_app_be`)

---

### LUỒNG 1: XÁC THỰC & PHÂN QUYỀN (Auth & Strict RBAC Flow)
1. **Đăng nhập (`POST /auth/login` hoặc `/api/v1/auth/login`)**:
   - Controller: `AuthController.login(@Body() dto: LoginDto)`.
   - Service: `AuthService.validateUser(identifier, password)`.
   - Xử lý: Tra cứu bảng `public.users` theo username, email, phone hoặc mã định danh. Kiểm tra hash mật khẩu bằng `bcrypt.compare`.
   - Kết quả: Sinh JWT Payload `{ sub: user.id, email: user.email, role: user.role }` qua `JwtService.sign`, trả về `{ access_token, user, member }`.
2. **Kiểm tra quyền truy cập (Guards Pipeline)**:
   - `JwtAuthGuard`: Giải mã Bearer token từ header `Authorization`, gán thông tin vào `req.user`.
   - `RolesGuard`: So khớp vai trò người dùng trong `req.user.role` với metadata `@Roles('admin', 'quan_tri')`. Nếu không khớp, trả về HTTP 403 Forbidden.

---

### LUỒNG 2: QUẢN LÝ HỘI VIÊN & HỒ SƠ DOANH NGHIỆP (Members Flow)
1. **Lấy danh sách hội viên (`GET /members`)**:
   - Hỗ trợ lọc theo `search`, `department`, `role`, `status`.
   - Chỉ xuất các tài khoản hợp lệ. Phân trang theo `page` và `limit`.
2. **Cập nhật hồ sơ & Logo công ty (`PATCH /members/:id` hoặc `/api/v1/members/profile`)**:
   - Cập nhật thông tin doanh nghiệp, chức vụ, ngành nghề kinh doanh, liên hệ, ảnh đại diện, ảnh bìa.

---

### LUỒNG 3: SỰ KIỆN & CHECK-IN VÉ ĐẠI BIỂU (Events & QR Check-in Flow)
1. **Đăng ký tham gia sự kiện (`POST /events/:id/register`)**:
   - Kiểm tra hạng vé (Standard / VIP).
   - Tạo bản ghi trong `public.event_registrations` với `status: 'registered'`, sinh mã vé `ticketCode` (UUID hoặc chuỗi ngẫu nhiên duy nhất kèm mã QR).
2. **Quét mã QR Soát vé tại sự kiện (`POST /events/:id/checkin`)**:
   - Controller: `EventsController.checkinTicket`.
   - Xử lý: Soát vé theo `ticketCode`. Kiểm tra xem vé có thuộc đúng `eventId` của sự kiện đang soát tại bàn hay không.
   - Nếu đã soát: Trả về cảnh báo `ALREADY_CHECKED_IN` kèm thời gian soát lần đầu.
   - Nếu hợp lệ: Cập nhật `checkedInAt: new Date()` và trả về thông tin đại biểu (Tên, Công ty, Chức vụ, Ghế ngồi, Số may mắn).

---

### LUỒNG 4: SÀN CƠ HỘI KINH DOANH B2B (Opportunities & Deal CRM Flow)
1. **Đăng cơ hội mới (`POST /opportunities`)**:
   - Validate tiêu đề, ngân sách tối thiểu (`budgetMin`), tối đa (`budgetMax`), khu vực, ngành nghề, hạn chót, thông tin liên hệ.
   - Lưu vào bảng `public.opportunities`.
2. **Bày tỏ quan tâm kết nối (`POST /opportunities/:id/interest`)**:
   - Ghi nhận người quan tâm vào bảng `public.opportunity_interests` hoặc JSON `interestedMembers`.
   - Phát thông báo chuông tới người đăng cơ hội.
3. **Đàm phán 1-1 gắn cơ hội**:
   - Chuyển hướng hoặc kích hoạt bottom sheet kết nối 1-1, lưu lịch hẹn đàm phán vào CSDL.

---

### LUỒNG 5: CHỢ SẢN PHẨM & BÁO GIÁ VIP (Marketplace & Quotes Flow)
1. **Đăng sản phẩm chào hàng (`POST /marketplace/products`)**:
   - Tên sản phẩm, giá niêm yết, giá ưu đãi hội viên, danh mục, hình ảnh MinIO.
2. **Yêu cầu báo giá VIP (`POST /marketplace/products/:id/quote`)**:
   - Gửi yêu cầu báo giá với số lượng, ghi chú nhu cầu, hạn phản hồi.
   - Trạng thái vòng đời: `PENDING` -> `ACCEPTED` / `REJECTED` -> `COMPLETED`.

---

### LUỒNG 6: NHẮN TIN 1-1 & REALTIME SOCKETS (Messenger Flow)
1. **Gửi tin nhắn (`POST /connect-app/messenger/messages` & Socket Event `send_message`)**:
   - Lưu nội dung, đính kèm, trích dẫn vào bảng `public.messages`.
   - Socket.IO gateway phát sự kiện `new_message` tới phòng của người nhận.

---

### LUỒNG 7: GIAO VIỆC, TIẾN ĐỘ & BẢNG TÍNH EXCEL (Tasks Flow)
1. **Giao việc (`POST /tasks`)**:
   - Người giao việc (`supervisor`) tạo task, chỉ định người thực hiện (`assignee`), thiết lập hạn chót và kỳ vọng đầu ra (`deliverables`).
2. **Tiếp nhận / Từ chối việc (`POST /tasks/:id/accept` | `POST /tasks/:id/decline`)**:
   - Assignee bấm Tiếp nhận: Task chuyển sang `IN_PROGRESS`.
   - Assignee bấm Từ chối: Cung cấp lý do từ chối.
3. **Đánh giá tiến độ định kỳ (`POST /tasks/:id/evaluate`)**:
   - Supervisor đánh giá 4 mức độ (`ON_TRACK`, `AHEAD`, `AT_RISK`, `DELAYED`) kèm chấm điểm 1-5 sao và chỉ đạo giải pháp.
4. **Nộp file nghiệm thu (`POST /tasks/:id/attachments`)**:
   - Lưu trữ file bảng tính Excel (`.xlsx`, `.xls`, `.csv`) hoặc PDF/ảnh kết quả công việc.

---

### LUỒNG 8: GÓI TÀI TRỢ & BỐC THĂM MAY MẮN (Sponsors & Lucky Draw Flow)
1. **Lấy danh sách giải thưởng (`GET /sponsors/prizes`)**:
   - Truy vấn bảng `public.event_prizes`, nạp thông tin sản phẩm tài trợ (`public.products`) hoặc gói tài trợ (`public.sponsor_packages`).
2. **Cấu hình & Lưu kết quả quay số (`POST /sponsors/prizes/draw-winner`)**:
   - Lọc danh sách đại biểu tham gia sự kiện có mã số may mắn, chọn ngẫu nhiên người trúng thưởng và lưu lịch sử vào database.
