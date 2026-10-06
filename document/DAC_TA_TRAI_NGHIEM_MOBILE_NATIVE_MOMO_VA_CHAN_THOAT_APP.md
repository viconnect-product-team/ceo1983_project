# ĐẶC TẢ KỸ THUẬT: NÂNG CẤP TRẢI NGHIỆM MOBILE NATIVE APP (CHUẨN MOMO) & CHỐNG THOÁT APP CHO WEB APP CEO 1983

## 1. Bối cảnh & Vấn đề tồn tại
Người dùng trải nghiệm Web App CEO 1983 (PWA / Mobile Safari / Chrome Mobile) gặp phải vấn đề nghiêm trọng:
1. **Lỗi vuốt thoát app (Browser History Back Swipe)**: Khi thao tác vuốt từ trái hoặc phải (đặc biệt khi lướt xem thẻ hội viên hoặc carousel ngang), cử chỉ bị dính vào tính năng điều hướng mặc định của trình duyệt (`history.back()` / gesture navigation của iOS/Android), dẫn đến việc văng ra khỏi ứng dụng.
2. **Cướp cảm ứng ngang trong PullToRefresh**: Component `PullToRefresh` cũ can thiệp vào cử chỉ vuốt ngang mép trái (`startXRef.current <= 35 && diffX > 80`) và tự ý kích hoạt `window.history.back()`, gây gián đoạn trải nghiệm người dùng.
3. **Thiếu cảm giác Native App (MoMo Style)**:
   - Thiếu cơ chế kiểm soát phím Back / Cử chỉ Back: Khi có popup/modal mở, người dùng bấm Back thì bị lùi hẳn trang thay vì đóng popup.
   - Thiếu cơ chế Double-Tap Back To Exit: Không có thông báo "Chạm lần nữa để thoát ứng dụng" khi ở trang chủ.
   - Thiếu phản hồi xúc giác (Haptic Feedback) và hiệu ứng nén đàn hồi (Tactile Press) khi chạm nút/thẻ.
   - Thiếu tính năng TabBar Active Scroll-To-Top (chạm lại icon tab đang chọn để tự động cuộn lên đầu trang như MoMo, Instagram, Facebook).

---

## 2. Giải pháp Kiến trúc & Kỹ thuật đã triển khai

### 2.1. Triệt tiêu cử chỉ vuốt mép gây thoát App
- **CSS Chặn Overscroll**:
  Áp dụng `overscroll-behavior-x: none !important`, `overscroll-behavior-y: none !important`, `overscroll-behavior: none !important` trên `html`, `body` và container `.vba-app`. Đồng thời thiết lập `touch-action: pan-y pinch-zoom` để chỉ cho phép cuộn dọc và phóng to ảnh, vô hiệu hóa việc trình duyệt can thiệp thao tác lướt ngang ở cấp độ tài liệu.
- **Browser Edge Swipe Navigation Preventer (JavaScript)**:
  Lắng nghe sự kiện `touchstart` và `touchmove` ở vùng rìa màn hình (18px sát mép trái và phải). Nếu phát hiện góc vuốt có xu hướng ngang (`diffX > diffY`), lập tức gọi `e.preventDefault()` để trình duyệt không kích hoạt gesture Navigation Back/Forward.

### 2.2. Tối ưu hóa Pull-To-Refresh & Tách rời cử chỉ lướt ngang
- **Gỡ bỏ code gọi Back tự ý**: Xóa bỏ hoàn toàn đoạn code `window.history.back()` trong `PullToRefresh.tsx`.
- **Tắt `enableSwipeNav` toàn màn hình**: Chuyển việc chuyển đổi tab về 100% thanh TabBar dưới đáy (Bottom Navigation Bar) tương tự MoMo, Zalo, Banking App. Điều này giúp các thành phần con như carousel thẻ hội viên, danh sách sản phẩm lướt ngang 100% mượt mà, không bao giờ bị cướp touch.
- **Pull-To-Refresh Indicator dạng Capsule chuẩn MoMo**:
  - Đặt ở trung tâm đỉnh trang với nền `bg-slate-900/90 text-amber-400 border border-amber-500/30`.
  - Icon spinner xoay theo tỉ lệ kéo thực tế (`transform: rotate(...)`).
  - Khi kéo đạt ngưỡng threshold (72px), rung phản hồi nhẹ (`navigator.vibrate(15)`).
  - Co dãn mượt mà với đường cong chuyển động tự nhiên `cubic-bezier(0.16, 1, 0.3, 1)`.

### 2.3. Native Navigation Guard & Double-Tap Back To Exit
1. **Ưu tiên đóng Popup/Modal trước**:
   - Khi có modal, drawer hoặc bottom sheet đang mở (ví dụ popup thẻ hội viên, bộ lọc), nếu có sự kiện `popstate` (hoặc phím Back cứng trên Android), hệ thống phát sự kiện `vba:close_top_modal` để đóng cửa sổ nổi trước và giữ nguyên trạng thái ứng dụng.
2. **Điều hướng phân tầng**:
   - Nếu đang ở các tab con (`/association/events`, `/association/card`, `/association/messages`, `/association/profile`), bấm Back sẽ tự động chuyển về Trang chủ `/association`.
3. **Double-Tap Back To Exit**:
   - Khi đang ở Trang chủ `/association`:
     - Bấm Back lần 1: Kích hoạt rung haptic nhẹ (`navigator.vibrate(20)`), hiển thị Toast thông báo: *"Chạm lần nữa để thoát ứng dụng"*.
     - Bấm Back lần 2 trong vòng 2000ms: Cho phép thoát app bình thường.

### 2.4. Trải nghiệm Tương tác Chuẩn Native App (MoMo Feel)
1. **TabBar tương tác thông minh**:
   - **Scroll-To-Top**: Khi người dùng đang ở một tab và bấm lại vào icon tab đó trên thanh điều hướng dưới đáy, ứng dụng tự động cuộn mượt mà lên đỉnh trang (`window.scrollTo({ top: 0, behavior: 'smooth' })`).
   - **Active Indicator**: Tab đang chọn có chấm trạng thái Amber Gold (`#F59E0B`) tinh tế bên dưới icon và phát tín hiệu rung haptic xúc giác 8ms.
2. **Khử hoàn toàn các nhược điểm của Web truyền thống**:
   - Khử bóng mờ xanh/xám mặc định khi chạm (`-webkit-tap-highlight-color: transparent`).
   - Khử bôi đen văn bản khi vuốt chạm toàn app (`user-select: none`), chỉ cho phép bôi đen tại các thẻ có class `.selectable-text` hoặc các ô nhập liệu `input, textarea`.
   - Hiệu ứng nhún đàn hồi `.native-press` (`transform: scale(0.965)` với transition `transform 120ms cubic-bezier(0.2, 0.8, 0.2, 1)`).
   - Ẩn hoàn toàn thanh cuộn thô kệch trên mọi trình duyệt (Webkit scrollbar, Firefox scrollbar-width none).

---

## 3. Danh sách Tệp triển khai & Chỉnh sửa
1. `apps/ceo1983_app_fe/src/components/member/PullToRefresh.tsx`: Tinh gọn gesture pull-to-refresh, bỏ logic swipe back mép trái, làm mới capsule indicator.
2. `apps/ceo1983_app_fe/src/components/member/MemberShell.tsx`: Tích hợp Browser Edge Swipe Guard, Double-Tap Back To Exit, Modal-First Closing, TabBar Active Scroll-To-Top.
3. `apps/ceo1983_app_fe/src/styles.css`: CSS chống overscroll, momentum scrolling, tactile press, no-select, ẩn scrollbars.
4. `.cursorrules`: Bổ sung Quy chuẩn Bắt buộc 34 (Mobile UX & Native Feel Chuẩn MoMo).
5. `MEMORY.md`: Cập nhật mục log số 201 ghi nhận chi tiết kiến trúc thay đổi.

---

## 4. Hướng dẫn Kiểm thử & Đánh giá
1. **Kiểm tra vuốt mép màn hình**: Mở app trên điện thoại iOS (Safari) hoặc Android (Chrome), dùng ngón tay vuốt từ mép trái/phải -> App không bị lùi trang hay tải lại, carousel thẻ lướt ngang mượt mà.
2. **Kiểm tra mở Popup & Back**: Mở popup Thẻ hội viên (nửa màn hình), bấm nút Back trình duyệt hoặc vuốt Back Android -> Popup tự đóng, người dùng vẫn ở lại trang chủ.
3. **Kiểm tra Thoát App**: Ở trang chủ, bấm Back lần 1 -> Xuất hiện Toast "Chạm lần nữa để thoát ứng dụng"; bấm lần 2 -> Thoát bình thường.
4. **Kiểm tra Scroll To Top**: Cuộn trang chủ xuống sâu, bấm vào icon "Trang chủ" ở thanh TabBar -> Màn hình tự động cuộn êm ái lên đầu trang.
