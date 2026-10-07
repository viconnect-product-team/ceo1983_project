# ĐẶC TẢ KỸ THUẬT: ĐẠI TU HỆ THỐNG PHÂN QUYỀN RBAC CRM & ĐỒNG BỘ APP CEO 1983 - LUỒNG QUÉT CHECK-IN QR SỰ KIỆN

> **Phiên bản:** 1.0.0  
> **Ngày cập nhật:** 2026-10-07  
> **Phạm vi:** `apps/ceo1983_app_fe` (CRM Portal & Association App) & `apps/ceo1983_app_be` (NestJS API & Prisma)  
> **Trạng thái:** Đã triển khai & Kiểm tra TypeCheck đạt 100% 0 Lỗi (Strict 0 Errors)

---

## 1. MỤC TIÊU & BỐI CẢNH

Hệ thống ghi nhận một số lỗi và bất cập trong luồng phân quyền và kiểm soát sự kiện:
1. **Lỗi biên dịch:** `BusinessConnectBottomSheet.tsx` thiếu import `fetchNestApi`.
2. **Quy chuẩn Danh xưng Phân quyền bị phân tán:** Có quá nhiều vai trò và ban tự do, không thống nhất giữa CRM và App.
3. **Phân quyền Hội viên mới:** Chưa có cơ chế ép buộc mặc định vai trò là `Thành viên` và ban chuyên môn là `Hội viên ceo1983`, API backend chưa chặn quyền can thiệp của tài khoản không phải `Quản trị` / `Admin`.
4. **Cơ chế thu hồi quyền tức thì:** Khi một tài khoản bị cắt quyền hoặc thay đổi quyền, UI chưa ẩn kịp thời hoặc người dùng bấm vào chưa bị chặn đẩy thông báo cảnh báo và đăng xuất an toàn.
5. **Giao diện Quản lý Phân quyền CRM:** Chia sai tab (3 tab cũ: Ma trận phân quyền, Thêm quyền, Ban chuyên môn) và tab Thẩm định còn chứa cột "Cấp" gây khó hiểu.
6. **Luồng Quét QR Check-in Sự kiện:** Nhân sự B quét mã QR của Hội viên A thì hệ thống ghi nhận check-in nhầm cho B thay vì A; không hiển thị chi tiết thông tin đăng ký của A và không cảnh báo khi mã vé của A thuộc sự kiện khác so với sự kiện B đang trực cổng.

---

## 2. CHUẨN HÓA 5 VAI TRÒ & 7 BAN CHUYÊN MÔN (BẮT BUỘC 100%)

### 2.1. 5 Vai Trò (Roles) Duy Nhất
Tuyệt đối không dùng thêm các danh xưng ngoài danh sách 5 vai trò sau:
1. **Quản trị** (`quan_tri` / `super_admin`)
2. **Admin** (`admin`)
3. **Tổng thư ký** (`tong_thu_ky` / `secretary_general`)
4. **Trưởng ban** (`truong_ban` / `committee_head`)
5. **Thành viên** (`member`)

### 2.2. 7 Ban Chuyên Môn (Committees) Duy Nhất
Tuyệt đối không dùng thêm các tên ban tự do ngoài danh sách 7 ban sau:
1. **Ban Thành viên**
2. **Ban xúc tiến**
3. **Ban thiện nguyện**
4. **Ban truyền thông**
5. **Ban quản trị**
6. **Ban tài chính**
7. **Hội viên ceo1983** *(Ban mặc định của toàn bộ hội viên mới)*

---

## 3. CƠ CHẾ PHÂN QUYỀN TỰ ĐỘNG & BẢO VỆ API BACKEND

### 3.1. Thiết lập Mặc định Cho Tài Khoản Mới
- Mọi tài khoản khi mới đăng ký hoặc được khởi tạo qua CRM:
  - **Vai trò:** `member` (`Thành viên`)
  - **Ban chuyên môn:** `Hội viên ceo1983`
- Được áp dụng tại:
  - `MembersService.createMember`
  - `MembersService.publicRegister`
  - `UsersService.createUser`

### 3.2. Chốt Chặn Quyền Can Thiệp Phía API Backend
- Endpoint `PATCH /api/members/:id/role-dept` và `POST /api/members/:id/role-dept`:
  - Trích xuất `operatorUserId` từ `req.user.id` trong JWT Guard.
  - Kiểm tra vai trò của người thực hiện: Chỉ cho phép tài khoản mang vai trò `quan_tri` hoặc `admin`.
  - Nếu bất kỳ tài khoản nào khác cố tình gửi request: Trả về **HTTP 403 Forbidden** với thông báo:  
    `"Chỉ tài khoản Quản trị hoặc Admin mới có quyền phân quyền hoặc chuyển ban chuyên môn cho hội viên"`.

---

## 4. CƠ CHẾ THU HỒI QUYỀN TỨC THÌ (SESSION EJECTION)

### 4.1. Phía Client UI
- Ẩn hoàn toàn các nút thao tác, chức năng nếu tài khoản không đủ quyền (dựa vào `hasPermission` và vai trò).
- Nếu người dùng bấm vào chức năng/thao tác trước khi giao diện kịp cập nhật, hàm `handleUnauthorizedAction(featureName, actionName)` sẽ:
  1. Hiển thị thông báo Toast cảnh báo nguyên văn:  
     `"Tài khoản của bạn đã bị thay đổi quyền không còn quyền sử dụng chức năng [featureName], không còn quyền thao tác [actionName]"`
  2. Xóa sạch token đăng nhập: `auth_token`, `vba_auth_token`, `auth_user`, `vba_current_member`.
  3. Đẩy người dùng văng ra màn hình đăng nhập (`/auth` hoặc `/association/login`).

### 4.2. Bộ Đón Chặn Toàn Cục HTTP 403 (Global Axios Interceptor)
- Trong `api-client.ts`: Lắng nghe mọi phản hồi HTTP 403 từ Backend:
  - Hiển thị Toast cảnh báo: `"Tài khoản của bạn đã bị thay đổi quyền không còn quyền sử dụng chức năng này. Vui lòng đăng nhập lại!"`
  - Tự động xóa sạch LocalStorage và điều hướng ngay lập tức về trang đăng nhập.

---

## 5. TỔ CHỨC LẠI GIAO DIỆN PHÂN QUYỀN CRM (`/permissions`)

Tổ chức lại thành đúng **3 Tab cụ thể**:
1. **Tab 1: 1. Ma Trận Phân Quyền Vai Trò**
   - Bảng phân quyền phân cấp theo 5 vai trò chuẩn: `Quản trị`, `Admin`, `Tổng thư ký`, `Trưởng ban`, `Thành viên`.
   - Cấu hình chi tiết quyền Xem, Tạo, Sửa, Xóa, Phê duyệt cho từng phân hệ: Hội viên, Tài chính, Sự kiện, Ban chuyên môn, Sàn thương mại, Quyền quản trị.
2. **Tab 2: 2. Phân Quyền Tài Khoản Thành Viên**
   - Danh sách tài khoản hội viên kèm thông tin: Mã hội viên, Họ tên, Email, Vai trò hiện tại, Ban chuyên môn hiện tại.
   - Bộ lọc tiện lợi theo 5 vai trò và 7 ban chuyên môn.
   - Thao tác gán vai trò & đổi ban với bộ kiểm tra quyền chặt chẽ (chỉ `Quản trị` và `Admin` mới lưu thành công).
3. **Tab 3: 3. Thẩm Định 6 Ban Chuyên Môn**
   - Bảng quy trình thẩm định hội viên mới của 6 ban nghiệp vụ.
   - **Đã gỡ bỏ 100%:** Cột "Cấp", các nhãn "5 Cấp Bậc Phê Duyệt", và các trường Cấp độ thẩm định gây rối mắt.

---

## 6. ĐỒNG BỘ PHÂN QUYỀN VỚI APP CEO 1983 (`/association/permissions`)

- Màn hình phân quyền hội viên trong App CEO 1983:
  - Danh sách chọn Ban (`BOARD_OPTIONS`): Chuẩn hóa đúng 7 ban.
  - Danh sách chọn Chức danh (`ROLE_LABELS`): Chuẩn hóa đúng 5 vai trò.
  - Phân quyền Quét QR Check-in sự kiện trên App: Chỉ tài khoản có quyền `canScanQR`, `isAdmin` (Quản trị, Admin), hoặc Trưởng ban/Tổng thư ký mới hiển thị nút Quét Check-in.

---

## 7. ĐẠI TU LUỒNG QUÉT MÃ QR CHECK-IN SỰ KIỆN

### 7.1. Bóc Tách & Nhận Diện Chủ Sở Hữu Mã Vé (Hội viên A)
- Khi Nhân sự trực cổng B dùng máy ảnh quét mã QR của Hội viên A:
  - Mã QR gửi lên endpoint `POST /api/checkin/scan-ticket` kèm `currentEventId` của sự kiện B đang trực.
  - Backend giải mã QR payload (`event_ticket:regId:eventId:userId`, JSON, hoặc Registration Code).
  - Trích xuất thông tin người đăng ký vé chính xác của **Hội viên A**:
    - Mã đăng ký, ID sự kiện, ID hội viên
    - Họ và tên, Số điện thoại, Email
    - Tên doanh nghiệp, Chức vụ
    - Loại vé (VIP / Tiêu chuẩn), Vị trí bàn/ghế, Con số may mắn (Lucky Draw Number)
    - Trạng thái thanh toán & Trạng thái check-in hiện tại

### 7.2. Kiểm Soát & Cảnh Báo Lệch Sự Kiện (Event Mismatch)
- Backend so sánh `ticket.eventId` với `currentEventId`:
  - Nếu khác nhau: Trả về `eventMismatch: true`, tên sự kiện của vé (`eventTitle`), và tên sự kiện cổng (`currentEventTitle`).
  - Phía giao diện hiển thị hộp cảnh báo màu đỏ nổi bật:  
    `"CẢNH BÁO: MÃ VÉ NÀY THUỘC SỰ KIỆN KHÁC! Người tham dự mang mã vé của sự kiện [Tên sự kiện của vé]. Vui lòng hướng dẫn đại biểu đến đúng cổng sự kiện."`
  - Đổi màu nút check-in sang màu cam cảnh báo để nhân sự trực cổng lưu ý.

### 7.3. Ghi Nhận Check-in Chính Xác Cho Hội Viên A
- Khi Nhân sự B bấm nút xác nhận check-in (`confirm: true`):
  - Backend cập nhật trạng thái `checked_in = true` cho bản ghi đăng ký của **Hội viên A** trong `event_registrations`.
  - Tạo bản ghi trong `member_checkins` và `checkin_logs` gắn liền với `member_id` của **Hội viên A** (thay vì lấy nhầm ID của người quét B).
  - Bắn thông báo realtime và in-app chúc mừng check-in thành công về tài khoản của **Hội viên A**.

---

## 8. TỔNG KẾT KIỂM THỬ & CHẤT LƯỢNG MÃ NGUỒN

| Phân hệ | Lệnh kiểm tra | Kết quả | Trạng thái |
| :--- | :--- | :--- | :--- |
| **Backend NestJS** | `cd apps/ceo1983_app_be && npx tsc --noEmit` | **Exit code 0 (0 errors)** | Đạt chuẩn 100% |
| **Frontend React** | `cd apps/ceo1983_app_fe && npx tsc --noEmit` | **Exit code 0 (0 errors)** | Đạt chuẩn 100% |
| **Git Push/Commit Rule** | Kiểm tra terminal | **Không chạy `git commit` hay `git push`** | Tuân thủ tuyệt đối AGENTS.md |
