# ĐẶC TẢ KỸ THUẬT NÂNG CẤP HỆ THỐNG: THEME STUDIO, WEBRTC VIDEO CALL, CẢNH BÁO TRÙNG LỊCH GẶP GỠ & DỊCH THUẬT TIẾNG ANH 100%
## HỆ SINH THÁI CLB DOANH NHÂN CEO 1983 (HANOIBA)

---

### 1. NÂNG CẤP QUẢN LÝ CHỦ ĐỀ CRM & ĐỒNG BỘ APP HIỆP HỘI
#### 1.1. Hiện Trạng & Nguyên Nhân
- **Trước đây**: Khi quản trị viên CRM kích hoạt chủ đề hoặc thay đổi giao diện, ứng dụng di động hiệp hội (`/association/*`) không tự động nhận diện hiệu ứng hoặc biểu tượng của chủ đề.
- **Nguyên nhân**: Hệ thống phía client chỉ hỗ trợ 5 bộ chủ đề tĩnh (`default`, `tet`, `mid_autumn`, `christmas`, `new_year`) và thiếu cơ chế cấu hình động các thông số bố cục, biến màu CSS và bộ biểu tượng tính năng nhanh (`quickActionDefs`).

#### 1.2. Giải Pháp Triển Khai
1. **Mở Rộng Engine Chủ Đề Client (`SeasonalEventHeader.tsx`)**:
   - Bổ sung định danh chủ đề `"custom"` (`EventThemeType = "default" | "tet" | "mid_autumn" | "christmas" | "new_year" | "custom"`).
   - Thiết lập cấu trúc dữ liệu `CustomThemeConfig`:
     - Bố cục lưới (`layoutGridCols`): `"3"` hoặc `"4"` cột.
     - Độ bo góc (`borderRadius`): `"rounded-xl"`, `"rounded-2xl"`, hoặc `"rounded-3xl"`.
     - Phong cách biểu tượng (`iconStyle`): `"3d_emoji"`, `"luxury_vector"`, `"neon_glow"`, `"royal_badge"`.
     - Màu sắc: `primaryColor`, `accentColor`, `gradient`.
     - Hiệu ứng hạt rơi (`effectType`): `"none"`, `"snow"`, `"lanterns"`, `"flowers"`, `"sparkles"`.
     - Bản đồ biểu tượng tính năng (`actionIcons`): Tùy biến icon riêng cho từng tính năng nhanh (`card`, `members`, `checkin`, `perks`, `voting`, `history`, `library`, `fees`).
   - Cung cấp các hàm quản trị: `getCustomThemeConfig()`, `saveCustomThemeConfig()`, `getEffectiveThemeOption()`, `applyThemeAttributes()`.
2. **Nâng Cấp CRM Theme Studio (`admin.landing-templates.tsx`)**:
   - Tab 1: "Chủ đề mẫu có sẵn" (Áp dụng nhanh Tết Nguyên Đán, Trung Thu, Giáng Sinh, Năm Mới).
   - Tab 2: "Tự thiết kế Theme Studio":
     - Cho phép tùy biến bố cục, màu sắc, hiệu ứng hạt và từng icon tính năng.
     - Tích hợp Live Mobile Mockup Preview hiển thị trực quan các thay đổi trước khi lưu.
     - Nút "LƯU & ÁP DỤNG NGAY CHO APP CEO 1983": Lưu cấu hình lên máy chủ, cập nhật `localStorage` và phát sự kiện `vba-event-theme-changed` / `ceo1983-theme-changed` thời gian thực.
3. **Đồng Bộ Phía Ứng Dụng Hiệp Hội (`association.index.tsx`)**:
   - Lắng nghe sự kiện đổi theme, lập tức cập nhật:
     - Lưới tính năng nhanh: Chuyển đổi linh hoạt giữa 3 cột và 4 cột (`grid-cols-3` hoặc `grid-cols-4`).
     - Độ bo góc icon và màu nền theo đúng cấu hình CRM.
     - Biểu tượng 3D Emoji hoặc Vector tương ứng với phong cách chủ đề đã chọn.

---

### 2. NÂNG CẤP WEBRTC VIDEO CALL CHUẨN MESSENGER / ZALO
#### 2.1. Yêu Cầu & Thách Thức
- Trong ứng dụng hiệp hội, cuộc gọi video trực tuyến giữa hai hội viên bắt buộc phải:
  - Nghe rõ tiếng của đối phương (không bị câm hoặc mất track âm thanh).
  - Nhìn thấy rõ video hình ảnh của đối phương ngay khi cuộc gọi được kết nối.
  - Hoạt động mượt mà, ổn định trên cả trình duyệt máy tính và thiết bị di động (Safari iOS, Chrome Android).

#### 2.2. Giải Pháp Triển Khai (`CeoWebRtcCallModal.tsx`)
1. **Persistent MediaStream Track Accumulation**:
   - Nhiều trình duyệt di động bắn sự kiện `pc.ontrack` riêng lẻ cho từng track âm thanh và hình ảnh thay vì đóng gói chung trong `event.streams[0]`.
   - Giải pháp: Khởi tạo persistent `MediaStream` instance (`remoteMediaStreamRef.current`), liên tục lắng nghe và dồn track vào stream này:
     ```ts
     const track = event.track;
     if (!remoteMediaStreamRef.current.getTracks().some((t) => t.id === track.id)) {
       remoteMediaStreamRef.current.addTrack(track);
     }
     ```
   - Gán `remoteMediaStreamRef.current` cho cả `remoteVideoRef` và `remoteAudioRef`.
2. **Âm Thanh Tự Động Kích Hoạt & Un-Mute**:
   - Thiết lập `remoteAudio.muted = false`, `volume = 1.0` và gọi `.play()` ngay khi nhận track.
   - Thêm cơ chế retry khi trình duyệt yêu cầu cử chỉ chạm của người dùng (User Gesture Autoplay Policy).
3. **Hiển Thị Video Trực Tiếp**:
   - Loại bỏ điều kiện che mờ video đối phương: Khi `remoteVideoRef` có track hình (`hasRemoteVideo = true`), video đối phương lập tức hiển thị toàn màn hình sắc nét.
4. **Bổ Sung Nút Loa Ngoài (Speaker Toggle)**:
   - Cho phép người dùng bật/tắt loa ngoài thuận tiện ngay trên thanh điều khiển cuộc gọi.

---

### 3. KIỂM TRA TRÙNG LỊCH CUỘC GẶP KẾT NỐI (1-ON-1 MEETING) & POPUP CẢNH BÁO
#### 3.1. Nghiệp Vụ Bắt Buộc
Khi hội viên hoặc cán bộ thiết lập cuộc gặp kết nối 1-on-1:
- Hệ thống phải kiểm tra xem người dùng có đang có cuộc gặp khác:
  1. Trùng thời gian (`timeConflict`): Có cuộc gặp khác diễn ra cùng ngày có giờ bắt đầu lệch dưới 60 phút.
  2. Trùng địa điểm trực tiếp (`locationConflict`): Cuộc gặp offline khác diễn ra tại cùng địa điểm trong ngày.
  3. Trùng cả hai (`both`): Vừa trùng khung giờ, vừa trùng địa điểm trực tiếp.
- Khi phát hiện trùng lặp, BẮT BUỘC bật Popup Cảnh Báo chuyên dụng (Warning Confirmation Dialog) để người dùng xác nhận có chắc chắn muốn tham gia hay không.

#### 3.2. Giải Pháp Triển Khai
1. **Kiểm Soát Xung Đột Phía Client (`Create1on1MeetingModal.tsx` & `ScheduleCalendar.tsx`)**:
   - Hàm `detectConflicts()` tổng hợp toàn bộ lịch sử cuộc gặp (`ceo1983_meetings_history`, `vione_meetings_history`, `ceo1983_saved_calendar_events`) và phân loại 3 mức độ xung đột: `both`, `time`, `location`.
   - Nếu phát hiện xung đột, dừng luồng lưu và hiển thị Popup Cảnh Báo:
     - Huy hiệu cảnh báo rõ ràng: `"TRÙNG CẢ THỜI GIAN & ĐỊA ĐIỂM"`, `"TRÙNG THỜI GIAN CUỘC GẶP"`, hoặc `"TRÙNG ĐỊA ĐIỂM CUỘC GẶP"`.
     - Bảng so sánh 2 thẻ chi tiết:
       - Thẻ 1 (Cuộc gặp đang tạo): Tiêu đề, Ngày, Giờ, Địa điểm, Đối tác.
       - Thẻ 2 (Cuộc gặp đã có): Tiêu đề, Ngày, Giờ, Địa điểm, Người tổ chức / Đối tác.
     - Câu hỏi xác nhận: *"Bạn có chắc chắn muốn lên lịch trùng và đảm bảo có thể tham gia được không?"*.
     - Nút hành động:
       - `[Quay lại chỉnh sửa]`: Đóng popup để người dùng thay đổi thời gian hoặc địa điểm.
       - `[Tôi đảm bảo tham gia - Xác nhận lưu]`: Gửi cờ `confirmOverlap: true` và `forceLocation: true` để lưu bản ghi vào hệ thống và lịch cá nhân.
2. **Nâng Cấp Backend (`apps/ceo1983_app_be/src/meetings/meetings.service.ts`)**:
   - Khi `confirmOverlap: true` hoặc `forceLocation: true` được gửi lên, backend ghi nhận người dùng đã xác nhận chủ đích tham gia và bỏ qua ngoại lệ `LOCATION_CONFLICT` / `OVERLAP_CONFIRM_REQUIRED`, cho phép lưu bản ghi vào CSDL.

---

### 4. LOẠI BỎ HOÀN TOÀN CHẾ ĐỘ TƯƠNG PHẢN CAO (HIGH CONTRAST MODE)
#### 4.1. Quy Chuẩn Giao Diện Mới
- Toàn bộ hệ thống chuẩn hóa duy nhất 2 chế độ hiển thị:
  1. **Chế độ Sáng (Light Mode)**: Nền trắng ngà / xanh navy tươi sáng, tinh tế, sang trọng.
  2. **Chế độ Tối (Dark Mode)**: Nền xanh đen hoàng gia (`#070D1A` / `#0A111C`) kết hợp điểm nhấn ánh vàng amber dịu mắt.
- **Xóa Bỏ Vĩnh Viễn Chế Độ Tương Phản Cao (High Contrast)**:
  - Loại bỏ hoàn toàn class CSS `.hc` và thuộc tính `data-theme="contrast"`.
  - Cập nhật kiểu dữ liệu `type Theme = "light" | "dark"`.
  - Gỡ bỏ nút chuyển đổi tương phản cao tại:
    - Bộ chuyển đổi nhanh `ThemeSwitcher.tsx`
    - Trang cá nhân hội viên `m.profile.tsx` và `association.profile.tsx`
    - Cài đặt hệ thống `association.settings.tsx`
    - Thiết lập tài khoản `connect-app.me.index.tsx`
    - Khởi tạo giao diện SSR `__root.tsx`
    - Hệ thống thông báo `mobile-toast.tsx` và `sonner.tsx`
    - Khung giao diện `BusinessConnectMobileShell.tsx` và `LandingInteractiveShowcase.tsx`.

---

### 5. ĐỒNG BỘ 100% BẢN DỊCH TIẾNG ANH (ENGLISH LOCALIZATION)
#### 5.1. Tiêu Chuẩn Zero Missing Translation Keys
- Khi người dùng chuyển đổi ngôn ngữ sang tiếng Anh (`lang === "en"`):
  - 100% nhãn tính năng nhanh, thẻ danh thiếp, tiêu đề, trạng thái và thông báo phải hiển thị bằng tiếng Anh chuẩn xác.
  - Tệp `packages/shared/locales/en.json` được rà soát và bổ sung trọn vẹn 100% các khóa dịch còn thiếu so với `vi.json` (0 missing keys):
    - Nhóm khóa cuộc họp: `meet.title`, `meet.date`, `meet.time`, `meet.location`, `meet.partner`, `meet.notes`, `meet.confirm_overlap`, `meet.save_success`, v.v.
    - Nhóm khóa lịch sử: `m.rhist.termRange`, `m.rhist.title`, v.v.
    - Nhóm khóa thanh điều hướng: `m.shell.tab_qr`, `m.shell.tab_home`, `m.shell.tab_events`, v.v.
- Không để xảy ra tình trạng hiển thị tiếng Việt xen lẫn khi đã kích hoạt ngôn ngữ tiếng Anh.

---

### 6. KẾT QUẢ KIỂM TRA CHẤT LƯỢNG MÃ NGUỒN (VERIFICATION REPORT)
| Phân Hệ | Lệnh Kiểm Tra | Mã Trả Về (Exit Code) | Kết Quả |
| :--- | :--- | :---: | :--- |
| **Frontend** (`apps/ceo1983_app_fe`) | `npx tsc --noEmit` | **0** | **0 errors (100% Type-Safe)** |
| **Backend** (`apps/ceo1983_app_be`) | `npm run build` (`nest build`) | **0** | **0 errors (Build Success)** |
| **Tuân Thủ AGENTS.md** | Kiểm tra Terminal | **0** | **Tuyệt đối không tự động chạy `git push` hay `git commit`** |
