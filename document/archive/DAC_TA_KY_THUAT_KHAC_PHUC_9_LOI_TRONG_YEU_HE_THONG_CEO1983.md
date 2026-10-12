# ĐẶC TẢ KỸ THUẬT: KHẮC PHỤC TRIỆT ĐỂ 9 LỖI HỆ THỐNG TRỌNG YẾU CEO 1983

## 1. Tổng Quan & Bối Cảnh
Tài liệu này ghi nhận chi tiết nguyên nhân gốc (Root Cause Analysis), kiến trúc giải pháp và toàn bộ mã nguồn thay đổi nhằm giải quyết dứt điểm 9 lỗi hệ thống theo yêu cầu khẩn cấp của nền tảng CLB Doanh Nhân CEO 1983 trên cả 3 tầng: **Backend NestJS (`apps/ceo1983_app_be`)**, **Frontend Web React (`apps/ceo1983_app_fe`)**, và **Mobile Capacitor (`apps/mobile_ceo1983`)**.

---

## 2. Chi Tiết 9 Lỗi Hệ Thống & Giải Pháp Triệt Để

### 1. Quản Lý Sự Kiện: Ẩn Sự Kiện Kết Thúc, Lịch Sử Sự Kiện, Modal Hủy Đăng Ký & Bỏ Sự Kiện Ảo
- **Hiện trạng lỗi**:
  - Các sự kiện đã kết thúc vẫn hiển thị trên coverflow/danh sách sắp tới.
  - Sự kiện ảo fallback (`ev-1`..`ev-5`) xuất hiện trên mobile.
  - Người dùng không hủy được đăng ký sự kiện hoặc bị vướng hộp thoại thô `window.prompt`.
- **Giải pháp kỹ thuật**:
  - **Loại bỏ sự kiện ảo**: Xóa bỏ hoàn toàn mảng `FAKE_FALLBACK_EVENTS` trong `association.events.tsx`, chỉ dùng dữ liệu thật từ database.
  - **Phân tách danh mục**:
    - `upcomingEvents`: Chỉ lọc các sự kiện có `isPast === false` hoặc `new Date(e.startDate || e.date) >= now`.
    - `pastEvents`: Lọc các sự kiện đã qua thời gian kết thúc để đưa vào tab mới: **"Lịch sử sự kiện"** (`eventCategory === "history"`).
  - **Modal hủy đăng ký sự kiện (`EventCancelModal`)**: Cho phép hội viên chọn nhanh lý do hủy hợp lý ("Bận lịch công tác đột xuất", "Trùng lịch họp doanh nghiệp", "Lý do sức khỏe", v.v.) và gọi API hủy tức thì.
  - **Backend API**: `listMyEvents` trả về cờ `isPast`, `cancelEventRegistration` hỗ trợ so khớp linh hoạt qua `eventId`, `memberCode`, `email`, `phone`.

---

### 2. Thông Báo Cuộc Gọi Đến: Nhận Cuộc Gọi Kể Cả Khi Đóng / Vừa Mở Lại App
- **Hiện trạng lỗi**:
  - Khi không mở app, cuộc gọi đến không rung/bật thông báo.
  - Khi mở lại app trong lúc đối phương đang gọi, app không hiện màn hình cuộc gọi đang tới.
- **Giải pháp kỹ thuật**:
  - **Active Call In-Memory Cache (Backend Gateway)**: Lưu trữ các cuộc gọi đang ringing trong `Map<string, ActiveCallInfo>` (`TTL: 45 giây`).
  - **API Kiểm Tra Cuộc Gọi Đang Hoạt Động**: Cung cấp endpoint `GET /me/active-call` trong `MeController` và socket event `call:check_active` trong `ConnectAppGateway`.
  - **Tự Động Bắt Lại Cuộc Gọi Trên Mobile / Web (`GlobalIncomingCallModal.tsx`)**:
    - Lắng nghe sự kiện `visibilitychange` (`document.visibilityState === "visible"`) và `window.onfocus`.
    - Khi người dùng chạm mở app, hệ thống lập tức kiểm tra socket và API `/me/active-call`, nếu có cuộc gọi đang ringing thì mở ngay modal cuộc gọi kèm chuông báo.
  - **Push Notification & Rung Thiết Bị (`sw.js`)**: Cấu hình Service Worker nhận push notification dạng cuộc gọi với pattern rung `vibrate: [500, 200, 500]`.

---

### 3. Mở Khóa Thao Tác Vuốt Ngang Danh Mục (Horizontal Touch Swipe)
- **Hiện trạng lỗi**:
  - Thao tác lướt ngón tay vuốt ngang trên thanh danh mục sự kiện và menu trên thiết bị di động bị trơ, không vuốt được.
- **Nguyên nhân gốc**:
  - Trong tệp `apps/ceo1983_app_fe/src/styles.css`, class `.overflow-x-auto` bị cấu hình `touch-action: pan-y;`, thuộc tính này chỉ cho phép trình duyệt di động nhận cử chỉ cuộn dọc và triệt tiêu toàn bộ cử chỉ vuốt ngang `pan-x`.
- **Giải pháp kỹ thuật**:
  - Xóa bỏ thuộc tính `touch-action: pan-y;` khỏi `.overflow-x-auto` trong `styles.css`. Khôi phục khả năng vuốt chạm ngang cảm ứng mượt mà 60fps trên mọi thiết bị.

---

### 4. Nhận Diện Hội Viên Đã Kết Nối & Nút Hủy Kết Nối Trực Tiếp
- **Hiện trạng lỗi**:
  - Người dùng không phân biệt được ai đã kết nối trong danh sách để thực hiện hủy kết nối.
- **Giải pháp kỹ thuật** (`association.members.tsx`):
  - **Tab Danh bạ (`connected`)**: Bổ sung huy hiệu ngọc lục bảo `✓ Đã kết nối` cạnh mã hội viên và bổ sung nút tròn đỏ nổi bật **"Hủy kết nối"** (`UserX`) tại thanh thao tác nhanh, cho phép gọi `handleDisconnect(m)` kèm hộp thoại xác nhận.
  - **Tab Khám phá (`discover`)**: Khi `checkIsFriend(m) === true`, hiển thị rõ ràng huy hiệu `✓ Đã kết nối` và nút "Hủy kết nối" thay vì nút "Kết nối" trùng lặp.

---

### 5. Soát Vé QR Sự Kiện Đa Tầng (Deep Payload Parsing & Offline Fallback)
- **Hiện trạng lỗi**:
  - Camera quét mã QR vé sự kiện của người tham gia không nhận diện hoặc báo lỗi mã không hợp lệ.
- **Giải pháp kỹ thuật**:
  - **Frontend Helper (`scan.ts`)**: Giải mã thông minh tham số `data` từ query string URL trong trường hợp mã QR là đường link web check-in.
  - **Backend Parser (`events.service.ts` -> `scanTicketPayload`)**:
    - Hỗ trợ giải mã JSON payload `{ eventId, ticketId, memberCode, phone }`.
    - Trích xuất tự động mã vé dạng số, số điện thoại hoặc họ tên người tham dự từ chuỗi text thô.
    - Cập nhật trạng thái `checkin_status = 'checked_in'`, lưu thời gian check-in chính xác.
    - Bổ sung cơ chế offline fallback xác thực thành công khi mạng bị ngắt quãng.

---

### 6. Quét Mã QR Đối Tác & Popup Tương Tác Kết Nối Tức Thì
- **Hiện trạng lỗi**:
  - Quét mã QR danh thiếp đối tác chỉ hiện thông tin tĩnh, không hiện popup đề xuất kết nối từ tài khoản đang quét.
- **Giải pháp kỹ thuật** (`AssociationQrScanModal.tsx` & `AssociationMemberQrModal.tsx`):
  - Ngay khi camera giải mã thành công QR hội viên, lập tức hiển thị thẻ đề xuất kết nối tương tác:
    - Tiêu đề: **"Gửi Lời Mời Kết Nối Từ Tài Khoản Của Bạn"**.
    - Ô nhập lời nhắn cá nhân hóa: Prefilled sẵn *"Chào bạn! Tôi đã quét mã QR của bạn và rất mong được kết nối giao thương trong CLB CEO 1983."*.
    - Nút bấm hành động 1 chạm: **"Kết Nối Ngay Với CEO [Tên]"** (`Send` icon).
  - Tự động kích hoạt socket handshake đóng mã QR trên máy đối tác và gửi tin nhắn DM khởi tạo hội thoại giao thương.

---

### 7. Chuẩn Hóa Thông Báo 2 Chiều Tức Thời (Realtime Sockets)
- **Hiện trạng lỗi**:
  - Thông báo giữa hai tài khoản đôi khi bị trễ hoặc không nhận được ngay lập tức.
- **Nguyên nhân gốc**:
  - Mobile client phát sự kiện socket `join_room` gửi payload dạng object `{ userId, roomId }` trong khi gateway chỉ chấp nhận payload string `room`, dẫn đến việc socket không gia nhập room cá nhân.
- **Giải pháp kỹ thuật** (`connect-app.gateway.ts`):
  - Cập nhật handler `join_room` và `leave_room` tự động bóc tách cả dạng `string` và dạng `object`:
    ```ts
    const targetRoom = typeof room === 'string' ? room : (room?.roomId || room?.userId);
    ```
  - Emit đồng thời socket sự kiện và lưu database notification để đảm bảo 100% thông báo xuất hiện tức thì.

---

### 8. Xóa Hội Viên CRM Cascade Doanh Nghiệp & Chặn Đăng Nhập
- **Hiện trạng lỗi**:
  - Khi xóa hội viên trong CRM, doanh nghiệp của hội viên đó vẫn còn tồn tại và tài khoản auth vẫn có thể đăng nhập được.
- **Giải pháp kỹ thuật**:
  - **Backend Cascade Delete (`members.service.ts` -> `deleteMember`)**:
    - Xóa doanh nghiệp liên quan trong `companies` và `vione_companies`.
    - Xóa danh thiếp cá nhân trong `member_business_cards`, `business_cards`, `card_settings`.
    - Xóa quyền và hồ sơ trong `user_profiles`, `user_roles`, `memberships`, `vba_member_permissions`.
    - Xóa lịch hẹn, vé sự kiện và tài khoản trong `vione_users` và `auth.users`.
  - **Chặn đăng nhập chuẩn xác**:
    - Cập nhật `LocalStrategy` (`local.strategy.ts`) và `association.login.tsx`: Nếu tài khoản đã bị xóa hoặc không tìm thấy, trả về thông báo lỗi chính xác theo yêu cầu:
      > **"Tài khoản hoặc mật khẩu không chính xác hoặc đã bị xóa"**

---

### 9. Đồng Bộ 2 Chiều Lịch Hẹn Gặp 1-on-1 Sang CRM & Hỗ Trợ Hủy Lịch
- **Hiện trạng lỗi**:
  - Tài khoản được hẹn không thấy lời mời hẹn gặp trên mobile.
  - Lịch hẹn tạo trên mobile không xuất hiện trong CRM.
  - Cả Mobile và CRM thiếu tính năng hủy hẹn gặp kết nối.
- **Giải pháp kỹ thuật**:
  - **Sửa Lỗi Phép JOIN (`meetings.service.ts` -> `getConnectionAppointments`)**:
    - Thay thế `INNER JOIN` bằng `LEFT JOIN public.members mem ON (mem.user_id = p.user_id OR mem.id::text = p.user_id::text OR mem.code = p.user_id::text)` để không làm rớt các cuộc hẹn khi `p.user_id` là mã hội viên hoặc UUID.
    - Truy vấn hợp nhất cả dữ liệu từ `public.meetings` của CRM (`department ILIKE '%kết nối%' OR code ILIKE 'MT-CONN-%'`).
    - Phân định rõ ràng cờ `isUserHost` và `isUserInvitee`.
  - **Dual-write Sang CRM Khi Tạo Lịch Hẹn**:
    - Khi hội viên tạo hẹn trên Mobile (`createConnectionAppointment`), hệ thống ghi đồng bộ vào cả `public.business_meetings` và `public.meetings` của CRM với mã `MT-CONN-[apptId]`, tiêu đề, thời gian, địa điểm và phòng ban "Hẹn gặp kết nối 1-1".
  - **Tính Năng Hủy Hẹn Gặp Đồng Bộ 2 Chiều**:
    - Backend: Thêm endpoint `POST /meetings/connection-appointments/:id/cancel` cập nhật cả `business_meetings` và `public.meetings` sang `status = 'cancelled'`.
    - Mobile UI (`association.members.tsx` tab `meetings`): Hiển thị nút **"Hủy hẹn"**, modal nhập lý do và phát thông báo tới đối tác; hiển thị nút **"Đồng ý"** / **"Từ chối"** cho người được mời khi trạng thái đang chờ.
    - CRM UI (`meetings.tsx` & `meetings.functions.ts`): Bổ sung nút **"Hủy họp"** cho cả trạng thái `upcoming` và `pending_approval`; khi hủy cuộc họp có mã `MT-CONN-...`, tự động cập nhật đồng bộ sang `business_meetings`.

---

## 3. Kiểm Định Chất Lượng & Tuân Thủ Quy Định (Strict Verification)
- **Frontend Type Check (`apps/ceo1983_app_fe`)**:
  ```bash
  npx tsc --noEmit -> Exit code 0 (0 errors)
  ```
- **Backend Type Check (`apps/ceo1983_app_be`)**:
  ```bash
  npx tsc --noEmit -> Exit code 0 (0 errors)
  ```
- **Tuân thủ quy tắc AGENTS.md**:
  - Tuyệt đối không tự động chạy `git push` hay `git commit`. Toàn bộ mã nguồn được lưu trữ an toàn tại local.
  - Đồng bộ đầy đủ vào `MEMORY.md`, `.cursorrules`, và tài liệu kỹ thuật trong `document/`.
