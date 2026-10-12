# ĐẶC TẢ KỸ THUẬT: ĐẠI TU TOÀN DIỆN DANH BẠ HỘI VIÊN CHUẨN PHONE CONTACTS UI & TỐI GIẢN HÓA TRỢ LÝ AI ĐIỀU HÀNH CEO 1983

## 1. TỔNG QUAN & BỐI CẢNH YÊU CẦU
Khách hàng phản ánh và chỉ đạo cải tiến 3 vấn đề trọng yếu:
1. **Lỗi Nghiệp vụ Danh bạ Hội viên**: Trước đây hệ thống trả ra danh sách toàn bộ hội viên của câu lạc bộ, vi phạm bản chất của danh bạ cá nhân (Personal Directory). Khách hàng yêu cầu: Danh bạ mặc định **chỉ hiển thị những người đã kết nối với tài khoản hội viên**.
2. **Chuẩn hóa Giao diện Danh bạ Điện thoại (Phone Contacts UI)**:
   - Sắp xếp chuẩn theo bảng chữ cái A-Z tiếng Việt (theo Tên người Việt).
   - Thanh chỉ mục cuộn nhanh A-Z dọc bên phải màn hình để người dùng chạm/lướt đến chữ cái mong muốn.
   - Thẻ liên hệ chuẩn giao diện danh bạ điện thoại với avatar, tên, chức danh, công ty, SĐT kèm cụm 4 nút hành động tròn: Gọi điện (`tel:`), Nhắn tin, Thẻ 83, Hẹn gặp 1-1.
   - Tab "Khám phá" riêng để tìm kiếm và gửi lời mời kết nối với các hội viên khác.
3. **Tối giản hóa Trợ lý AI (`VoiceNavAssistant.tsx`)**:
   - Nút nổi và dialog trợ lý AI được tinh gọn theo phong cách sang trọng, tối giản (Minimalist Executive).
   - Loại bỏ thanh Live Context Bar cồng kềnh, thu gọn còn 4 chip gợi ý cốt lõi, khung nhập liệu dạng capsule bo tròn sang trọng.
4. **Biên dịch và phát hành bản cài đặt Android APK mới nhất**.

---

## 2. KIẾN TRÚC & GIẢI PHÁP BACKEND (`apps/ceo1983_app_be`)

### 2.1. Nâng cấp Tầng Data Access (`MembersRepository`)
Trong `src/members/members.repository.ts`, bổ sung phương thức `findDirectoryMembers(currentUserId?: string, connectedOnly?: boolean)`:
- Khi `connectedOnly === true` và `currentUserId` hợp lệ:
  Hệ thống thực hiện `LEFT JOIN` với bảng `public.user_connections` theo cả hai chiều:
  ```sql
  LEFT JOIN public.user_connections uc ON (
    (uc.sender_id = $1 AND uc.receiver_id = u.id AND uc.status = 'accepted')
    OR
    (uc.receiver_id = $1 AND uc.sender_id = u.id AND uc.status = 'accepted')
  )
  ```
  Và lọc điều kiện:
  ```sql
  WHERE (uc.id IS NOT NULL OR u.id = $1)
  ```
  Nhờ đó, danh bạ chỉ trả về những CEO đã có quan hệ kết nối bạn bè đã được chấp nhận (`status = 'accepted'`).

### 2.2. Nâng cấp Tầng Service & Controller
- `MembersService.listDirectory(userId?: string, connectedOnly?: boolean)`: Tiếp nhận tham số `connectedOnly` và ủy quyền truy vấn sang `MembersRepository`.
- `MembersController.listDirectory(@Query('connectedOnly') connectedOnly?: string, @Req() req)`: Tiếp nhận query parameter và chuyển đổi sang boolean.

---

## 3. THIẾT KẾ GIAO DIỆN FRONTEND (`apps/ceo1983_app_fe`)

### 3.1. Route Danh bạ Hội viên (`src/routes/association.members.tsx`)
1. **Phân nhóm Tab rõ ràng**:
   - Tab Mặc định: `connected` ("Danh bạ của tôi" / "Đã kết nối") -> Chỉ hiển thị danh bạ các CEO đã kết nối với tài khoản.
   - Tab Phụ: `all` ("Khám phá") -> Danh sách toàn thể hội viên để tìm kiếm và gửi lời mời kết nối.
2. **Thuật toán Sắp xếp Tên tiếng Việt Chuẩn**:
   - Hàm `getVietnameseSortName(fullName)`: Tách từ cuối cùng của Họ Tên (ví dụ: "Nguyễn Văn An" -> "An").
   - Hàm `compareVietnameseNames(a, b)`: So sánh tên bằng `localeCompare(..., "vi", { sensitivity: "base" })`. Nếu trùng tên thì so sánh tiếp theo họ đệm.
3. **Thanh Chỉ mục Cuộn Nhanh A-Z Dọc Màn hình (`ALPHABET_INDEX`)**:
   - Thanh chỉ mục mini dạng cột dọc bên phải màn hình hiển thị danh sách chữ cái A -> Z.
   - Khi chạm vào chữ cái, hàm `scrollToLetter(letter)` sử dụng `document.getElementById('section-letter-' + letter)` và `scrollIntoView({ behavior: 'smooth', block: 'start' })` giúp cuộn mượt mà tức thì đến nhóm danh bạ tương ứng.
4. **Thẻ Phone Contacts Card Sang Trọng (Executive Contacts Card)**:
   - Thiết kế dạng thẻ danh bạ điện thoại bo góc mềm mại, avatar viền vàng, họ tên nổi bật kèm chức danh và tên công ty.
   - Số điện thoại hiển thị kèm tính năng ẩn/hiện số để bảo vệ riêng tư.
   - Cụm 4 nút hành động tròn chuẩn mực (`rounded-full h-9 w-9`, `active:scale-95 transition-all shadow-xs`), độ tương phản cao, nét vẽ dày chống mờ nhòa:
     + **Nút Gọi điện**: Nền `bg-emerald-50 dark:bg-emerald-950/40`, viền `border border-emerald-600/35 dark:border-emerald-500/40`, icon `<Phone className="h-4 w-4 stroke-[2.2] text-emerald-700 dark:text-emerald-400" />`. Kích hoạt đường link `tel:<phone>` mở bàn phím gọi native.
     + **Nút Nhắn tin (Siêu Đậm Nét - Không Thể Mờ)**: Nhận diện Royal Navy & Cobalt Blue rực rỡ, viền dày `border-2 border-blue-600 dark:border-blue-400`, nền `bg-blue-100 dark:bg-blue-950/80`, chữ `text-blue-700 dark:text-blue-300`, icon `<MessageSquare className="h-4.5 w-4.5 stroke-[2.6] fill-blue-600/25 group-hover:fill-white/30 group-hover:text-white text-blue-700 dark:text-blue-300 transition-colors" />` với nét vẽ dày 2.6px và màu đổ fill 25% giúp bong bóng chat đậm đà, nổi bật tuyệt đối so với nền trắng. Hover: `hover:bg-blue-600 hover:text-white hover:border-blue-600`. Điều hướng thẳng đến hội thoại chat với hội viên tại `/association/messages`.
     + **Nút Thẻ 83**: Nền `bg-amber-50 dark:bg-amber-950/40`, viền `border border-amber-500/40 dark:border-amber-500/40`, icon `<CreditCard className="h-4 w-4 stroke-[2.2] text-amber-700 dark:text-amber-400" />`. Mở modal `MemberProfileModal` xem danh thiếp số 3D và hồ sơ chi tiết.
     + **Nút Hẹn gặp 1-1**: Nền `bg-purple-50 dark:bg-purple-950/40`, viền `border border-purple-500/35 dark:border-purple-500/40`, icon `<Handshake className="h-4 w-4 stroke-[2.2] text-purple-700 dark:text-purple-400" />`. Kích hoạt `BusinessConnectBottomSheet` để đặt lịch hẹn cafe/đàm phán giao thương B2B.
5. **Empty State Đẳng Cấp**:
   - Khi tài khoản chưa kết nối với ai, giao diện hiển thị hình ảnh minh họa trang nhã kèm thông điệp: "Danh bạ chưa có kết nối nào. Hãy khám phá và kết nối với các CEO 1983 để xây dựng mạng lưới giao thương!" cùng nút bấm chuyển sang tab Khám phá.

### 3.2. Tối Giản Hóa Trợ Lý AI (`VoiceNavAssistant.tsx`)
1. **Nút Trợ Lý Nổi Tối Giản (Minimalist Floating Button)**:
   - Nút tròn 48px tông màu đen Navy sang trọng viền vàng Amber Gold tinh tế.
   - Icon `Sparkles` phát sáng nhẹ với chấm trạng thái pulsating amber.
   - Nút đóng X rườm rà được ẩn mặc định, chỉ xuất hiện mờ khi rê chuột, giữ cho góc màn hình luôn thoáng đãng.
2. **Dialog Trợ Lý AI Tối Giản (Executive Dialogue Modal)**:
   - Header thu gọn: Icon Sparkles, nhãn "Trợ lý CEO 1983", chấm xanh "Sẵn sàng", nút loa Mute/Unmute và nút đóng X.
   - Loại bỏ hoàn toàn thanh "Live Context Bar" hiển thị nợ phí/thông báo vốn gây rối mắt và chiếm dụng màn hình.
   - Thu gọn các phím tắt nhanh xuống còn đúng 4 chip capsule cốt lõi:
     + `"Danh bạ CEO"` -> Lệnh mở danh bạ hội viên.
     + `"Lịch sự kiện"` -> Lệnh mở lịch sự kiện CLB.
     + `"Chợ B2B"` -> Lệnh mở sàn giao thương.
     + `"Hội phí"` -> Lệnh kiểm tra tình trạng niên liễm.
   - Khung nhập liệu hợp nhất dạng Capsule: Nút Micro tròn và Nút Gửi tích hợp trong cùng thanh bo tròn bo góc mềm mại, hỗ trợ cả giọng nói và văn bản.

---

## 4. QUY TRÌNH BIÊN DỊCH VÀ PHÁT HÀNH BẢN ANDROID APK MỚI NHẤT
1. **Biên dịch Frontend**:
   ```powershell
   cd apps/ceo1983_app_fe
   npm run build
   ```
2. **Đồng bộ Tài nguyên sang Capacitor Android**:
   ```powershell
   cd apps/mobile_ceo1983
   npx cap copy android
   ```
3. **Biên dịch Gradle Debug APK**:
   ```powershell
   cd apps/mobile_ceo1983/android
   .\gradlew.bat clean assembleDebug
   ```
4. **Xuất bản gói APK chính thức**:
   - `release_apk/CEO1983-app-latest.apk`
   - `release_apk/CEO1983-v1.0-debug.apk`
   - `apps/ceo1983_app_fe/public/docs/CEO1983-app-latest.apk`

---

## 5. KẾT QUẢ KIỂM THỬ VÀ ĐẢM BẢO CHẤT LƯỢNG (STRICT COMPLIANCE)
- **Type-Check Frontend**: `apps/ceo1983_app_fe`: `npx tsc --noEmit` -> **Exit code 0 (0 errors)**.
- **Type-Check Backend**: `apps/ceo1983_app_be`: `npx tsc --noEmit -p tsconfig.json` -> **Exit code 0 (0 errors)**.
- **Tuân thủ Strict Rule 1**: Tuyệt đối không tự động chạy `git push` hay `git commit`. Mọi thay đổi lưu tại local.
- **Tuân thủ Strict Rule 2**: Đồng bộ đầy đủ vào `MEMORY.md`, `.cursorrules` và tài liệu kỹ thuật trong `document/`.
